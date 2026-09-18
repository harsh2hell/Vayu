/**
 * VAYU Meteorological Intelligence Platform (SIH 2026)
 * -----------------------------------------------------------
 * Puter AI Service Wrapper (puterAiService.js)
 *
 * ARCHITECTURAL BOUNDARY & RESPONSIBILITY:
 * 1. Puter.js is used SOLELY as VAYU's high-level AI explanation, interpretation,
 *    and natural-language operational assistant layer.
 * 2. Puter.js is NOT the cyclone prediction engine. All physical trajectory
 *    modeling, eye detection, and Dvorak classifications remain powered strictly
 *    by VAYU's PyTorch deep learning models (MobileNetV3, ResNet18, Trajectory-GRU).
 * 3. Clerk remains the SOLE authentication provider for VAYU.
 *    puter.auth is NEVER imported, initialized, or invoked anywhere in this application.
 * 4. This module is the ONLY application-level file permitted to import or interface
 *    with @heyputer/puter.js. UI components and state contexts MUST NOT call Puter directly.
 * 5. No API keys or secret credentials are used. Puter AI operates in client-side mode
 *    without requiring backend tokens.
 */

import puter from '@heyputer/puter.js';

// Default timeout for Puter AI generation (30 seconds)
const DEFAULT_AI_TIMEOUT_MS = 30000;

/**
 * Standardized response contract across all Puter AI helper functions.
 * @typedef {Object} PuterAIResponse
 * @property {boolean} success - Whether the AI request completed successfully
 * @property {string|null} text - The generated response text (or null on failure)
 * @property {string|null} error - The human-readable error description (or null on success)
 */

/**
 * Safely extracts plain text from Puter AI's diverse response structures.
 * Puter.js chat responses can be formatted as a string, a message object with content,
 * or an array of content parts.
 *
 * @param {unknown} response - Raw response from puter.ai.chat()
 * @returns {string} Cleaned, trimmed textual response
 */
function extractResponseText(response) {
  if (!response) return '';

  // Direct string response
  if (typeof response === 'string') {
    return response.trim();
  }

  // OpenAI-style response: response.message.content (string or part array)
  if (response.message && response.message.content) {
    const content = response.message.content;
    if (typeof content === 'string') {
      return content.trim();
    }
    if (Array.isArray(content)) {
      return content
        .map((part) => {
          if (typeof part === 'string') return part;
          if (part && typeof part.text === 'string') return part.text;
          return '';
        })
        .join('')
        .trim();
    }
  }

  // Direct text property (e.g. response.text)
  if (typeof response.text === 'string') {
    return response.text.trim();
  }

  // toString fallback provided by Puter driver
  if (typeof response.toString === 'function') {
    const str = response.toString();
    if (str && str !== '[object Object]') {
      return str.trim();
    }
  }

  return '';
}

/**
 * Formats a cyclone meteorological context object into a structured textual briefing
 * for context-aware Puter AI prompts.
 *
 * @param {Object|string|null} context - Cyclone metadata or model output snapshot
 * @returns {string} Formatted context block
 */
function formatCycloneContext(context) {
  if (!context) {
    return 'No specific storm context provided. Use general North Indian Ocean tropical cyclone standards.';
  }

  if (typeof context === 'string') {
    return context.trim();
  }

  const parts = [];

  if (context.name || context.cyclone_name) {
    parts.push(`Cyclone Name: ${context.name || context.cyclone_name}`);
  }
  if (context.basin) {
    parts.push(`Basin: ${context.basin}`);
  }
  if (context.category || context.intensity_category) {
    parts.push(`IMD Intensity Classification: ${context.category || context.intensity_category}`);
  }

  // Coordinates
  const lat = context.lat ?? context.latitude ?? context.center_lat;
  const lon = context.lon ?? context.longitude ?? context.center_lon;
  if (lat !== undefined && lon !== undefined) {
    parts.push(`Estimated Center Coordinates: ${lat}°N, ${lon}°E`);
  }

  // Wind and pressure metrics
  if (context.wind_speed_kmh !== undefined || context.current_wind !== undefined) {
    parts.push(`Estimated Sustained Wind Speed: ${context.wind_speed_kmh ?? context.current_wind} km/h`);
  }
  if (context.central_mslp_hpa !== undefined || context.current_mslp !== undefined) {
    parts.push(`Estimated Central Pressure: ${context.central_mslp_hpa ?? context.current_mslp} hPa`);
  }

  // Dvorak morphology classification
  if (context.dvorak_pattern || context.pattern_class || context.classification) {
    parts.push(`Dvorak Morphology Pattern: ${context.dvorak_pattern || context.pattern_class || context.classification}`);
  }
  if (context.dvorak_t_number || context.t_number) {
    parts.push(`Dvorak T-Number: ${context.dvorak_t_number || context.t_number}`);
  }

  // Landfall / forecast horizon
  if (context.landfall_hours !== undefined || context.landfall_forecast) {
    parts.push(`Projected Landfall Horizon: ${context.landfall_hours ? `+${context.landfall_hours} hours` : context.landfall_forecast}`);
  }
  if (context.landfall_location || context.target_coast) {
    parts.push(`Projected Landfall Coast: ${context.landfall_location || context.target_coast}`);
  }

  return parts.length > 0 ? parts.join('\n') : JSON.stringify(context);
}

/**
 * Internal helper to execute a Puter AI chat request with timeouts,
 * parameter validation, and robust error trapping.
 *
 * @param {string|Array} promptOrMessages - Prompt text or chat messages
 * @param {Object} [options={}] - Optional parameters (e.g., model, temperature)
 * @param {number} [timeoutMs=DEFAULT_AI_TIMEOUT_MS] - Timeout duration in milliseconds
 * @returns {Promise<PuterAIResponse>}
 */
async function callPuterAI(promptOrMessages, options = {}, timeoutMs = DEFAULT_AI_TIMEOUT_MS) {
  // Guard against missing or offline Puter client
  if (!puter || !puter.ai || typeof puter.ai.chat !== 'function') {
    return {
      success: false,
      text: null,
      error: 'Puter.js AI module is unavailable in the current runtime environment.'
    };
  }

  try {
    // Wrap Puter AI request in a race with a timeout promise
    let timeoutId;
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error(`Puter AI request timed out after ${Math.round(timeoutMs / 1000)} seconds.`));
      }, timeoutMs);
    });

    const aiPromise = puter.ai.chat(promptOrMessages, options);

    const rawResponse = await Promise.race([aiPromise, timeoutPromise]);
    clearTimeout(timeoutId);

    const text = extractResponseText(rawResponse);
    if (!text) {
      return {
        success: false,
        text: null,
        error: 'Puter AI returned an empty or unparseable response.'
      };
    }

    return {
      success: true,
      text,
      error: null
    };
  } catch (err) {
    const errorMessage = err?.message || 'An unexpected error occurred during Puter AI generation.';
    return {
      success: false,
      text: null,
      error: errorMessage
    };
  }
}

/**
 * Explains a cyclone's current structure, Dvorak morphology, and intensity metrics
 * in professional meteorological language.
 *
 * @param {Object|string} context - The active cyclone data or analysis snapshot
 * @param {Object} [options={}] - Optional Puter AI configuration
 * @returns {Promise<PuterAIResponse>}
 */
export async function explainCyclone(context, options = {}) {
  const formattedContext = formatCycloneContext(context);

  const prompt = `You are VAYU AI Analyst, an expert senior tropical cyclone meteorologist and numerical forecaster specialized in the North Indian Ocean (Bay of Bengal & Arabian Sea) aligned with India Meteorological Department (IMD) and WMO RSMC standards.

Analyze and explain the following cyclone observation data:
${formattedContext}

Provide a concise, professional, 3-to-4 paragraph meteorological analysis covering:
1. Current System Status & Synoptic Overview: Analyze the intensity, estimated central pressure, and structural organization.
2. Dvorak Pattern & Convective Structure: Interpret the morphology (e.g. Curved Band, CDO, Eye, or Shear pattern) and what it indicates about environmental vertical wind shear and upper-level divergence.
3. Near-Term Hazards & Guidance: Highlight anticipated wind field impact, coastal storm surge, and rainfall intensity recommendations for operational civil defense authorities.

Keep your response objective, structured, and in standard meteorological terminology.`;

  return callPuterAI(prompt, options);
}

/**
 * Answers contextual, operational questions regarding active storm systems,
 * deep learning model confidence, or forecasting uncertainties.
 *
 * @param {string} question - The user's query
 * @param {Object|string} context - Active cyclone or analysis session context
 * @param {Object} [options={}] - Optional Puter AI configuration
 * @returns {Promise<PuterAIResponse>}
 */
export async function askAnalyst(question, context, options = {}) {
  if (!question || typeof question !== 'string' || !question.trim()) {
    return {
      success: false,
      text: null,
      error: 'A valid meteorological query string is required.'
    };
  }

  const formattedContext = formatCycloneContext(context);

  const messages = [
    {
      role: 'system',
      content: `You are VAYU AI Analyst, an authoritative operational tropical meteorology advisor for the Government of India (MoES/IMD) cyclone early warning system.
Current Active Cyclone Context:
${formattedContext}

Guidelines:
- Answer the officer's question directly, accurately, and authoritatively.
- Ground your answer in the provided cyclone context and established tropical meteorology physics.
- Clearly distinguish between model prediction estimates and ground-truth observations.
- If data for a specific aspect is not available in the context, explicitly state that fact.`
    },
    {
      role: 'user',
      content: question.trim()
    }
  ];

  return callPuterAI(messages, options);
}

/**
 * Generates an official meteorological bulletin narrative / technical synopsis
 * structured according to IMD / RSMC tropical cyclone advisory standards.
 *
 * @param {Object|string} context - Active cyclone metrics, position, and landfall projection
 * @param {Object} [options={}] - Optional Puter AI configuration
 * @returns {Promise<PuterAIResponse>}
 */
export async function generateBulletinNarrative(context, options = {}) {
  const formattedContext = formatCycloneContext(context);

  const prompt = `You are VAYU AI, generating the official technical synopsis for an RSMC Tropical Cyclone Advisory Bulletin (India Meteorological Department / MoES).

Input Cyclone Parameters:
${formattedContext}

Generate the following standard bulletin sections:
1. SYNOPTIC SITUATION & INTENSITY: A formal narrative describing the system's position, movement over the past 6 hours, central pressure, and maximum sustained surface winds.
2. ENVIRONMENTAL CONDITIONS: A concise assessment of sea surface temperatures (SST), ocean heat content (OHC), vertical wind shear (VWS), and Madden-Julian Oscillation (MJO) phase influence.
3. 24-HOUR FORECAST OUTLOOK & LANDFALL TIMELINE: Anticipated track trajectory, expected point of landfall or coastal closest approach, and expected intensity category at crossing.
4. WARNINGS & ADVISORIES: Clear operational directives for Fishermen (sea condition warning), Coastal Shipping/Ports (signals), and Low-Lying Coastal Inundation.

Use precise, professional, formal meteorological diction without generic conversational filler.`;

  return callPuterAI(prompt, options);
}
