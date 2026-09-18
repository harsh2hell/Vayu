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
import { buildCyclonePromptContext, buildCycloneContextSummary } from './cycloneContextSerializer.js';

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
 * for context-aware Puter AI prompts. Utilizes buildCyclonePromptContext to filter
 * out large binaries, credentials, or irrelevant state before presenting to the LLM.
 *
 * @param {Object|string|null} context - Cyclone metadata, analysis session, or serialized context
 * @returns {string} Formatted context block
 */
function formatCycloneContext(context) {
  if (!context) {
    return 'No specific storm context provided. Use general North Indian Ocean tropical cyclone standards.';
  }

  if (typeof context === 'string') {
    return context.trim();
  }

  // If already formatted or serialized, use buildCyclonePromptContext to guarantee clean structure
  const serialized = context.platform ? context : buildCyclonePromptContext(context);
  const parts = [];

  // Storm identification
  if (serialized.storm_identification) {
    const id = serialized.storm_identification;
    parts.push(`[SYSTEM IDENTIFICATION]`);
    if (id.name) parts.push(`• Storm Name: ${id.name}`);
    if (id.basin) parts.push(`• Basin: ${id.basin}`);
    if (id.observation_time) parts.push(`• Telemetry Timestamp: ${id.observation_time}`);
  }

  // Current observation
  if (serialized.current_observation) {
    const obs = serialized.current_observation;
    parts.push(`\n[SYNOPTIC OBSERVATION]`);
    if (obs.estimated_center?.formatted) {
      parts.push(`• Center Coordinates: ${obs.estimated_center.formatted}`);
    }
    if (obs.current_wind_speed_kmh !== null) {
      parts.push(`• Max Sustained Surface Winds: ${obs.current_wind_speed_kmh} km/h`);
    }
    if (obs.current_central_pressure_hpa !== null) {
      parts.push(`• Central MSLP: ${obs.current_central_pressure_hpa} hPa`);
    }
  }

  // Detection (MobileNetV3)
  if (serialized.detection && serialized.detection.cyclone_detected) {
    const det = serialized.detection;
    parts.push(`\n[AI CENTER DETECTION - MobileNetV3]`);
    parts.push(`• Eye/Vortex Status: ${det.eye_status}`);
    if (det.detection_confidence !== null) {
      parts.push(`• Objectness / Detection Confidence: ${(det.detection_confidence * 100).toFixed(1)}%`);
    }
  }

  // Classification (ResNet18 Dvorak)
  if (serialized.classification) {
    const cls = serialized.classification;
    parts.push(`\n[MORPHOLOGY CLASSIFICATION - ResNet18 Dvorak]`);
    if (cls.primary_pattern) parts.push(`• Primary Pattern: ${cls.primary_pattern}`);
    if (cls.dvorak_t_number) parts.push(`• Dvorak T-Number: ${cls.dvorak_t_number}`);
    if (cls.confidence_percentage !== null) parts.push(`• Classifier Confidence: ${cls.confidence_percentage}%`);
  }

  // Trajectory forecast (GRU)
  if (serialized.trajectory) {
    const traj = serialized.trajectory;
    parts.push(`\n[TRAJECTORY & INTENSITY FORECAST - GRU Seq2Seq]`);
    if (traj.landfall_projection && traj.landfall_projection.is_landfall_projected) {
      const lf = traj.landfall_projection;
      parts.push(`• Projected Landfall Sector: ${lf.target_coast || 'Coastal Sector'}`);
      if (lf.estimated_time) parts.push(`• Landfall Timeline: ${lf.estimated_time}`);
      if (lf.expected_wind_at_landfall_kmh !== null) parts.push(`• Crossing Wind Speed: ${lf.expected_wind_at_landfall_kmh} km/h`);
      if (lf.projected_storm_surge_m) parts.push(`• Estimated Storm Surge: ${lf.projected_storm_surge_m}`);
    }
    if (Array.isArray(traj.trajectory_milestones) && traj.trajectory_milestones.length > 0) {
      parts.push(`• Forecast Waypoints:`);
      for (const pt of traj.trajectory_milestones) {
        const wind = pt.expected_wind_kmh !== null ? `${pt.expected_wind_kmh} km/h` : 'N/A';
        const mslp = pt.central_pressure_hpa !== null ? `${pt.central_pressure_hpa} hPa` : 'N/A';
        parts.push(`  - ${pt.step_label || `+${pt.hour}h`}: ${pt.latitude}°N, ${pt.longitude}°E | Wind: ${wind} | MSLP: ${mslp}`);
      }
    }
  }

  // Environmental conditions
  if (serialized.environmental_conditions) {
    const env = serialized.environmental_conditions;
    parts.push(`\n[ENVIRONMENTAL THERMODYNAMICS & SHEAR]`);
    if (env.sea_surface_temperature_c !== null) parts.push(`• Sea Surface Temperature (SST): ${env.sea_surface_temperature_c}°C`);
    if (env.vertical_wind_shear_knots !== null) parts.push(`• 850-200 hPa Vertical Wind Shear: ${env.vertical_wind_shear_knots} knots`);
    if (env.mid_level_relative_humidity_pct !== null) parts.push(`• Mid-Level Relative Humidity: ${env.mid_level_relative_humidity_pct}%`);
    if (env.rapid_intensification) {
      parts.push(`• Rapid Intensification Risk: ${env.rapid_intensification.threat_level} (${env.rapid_intensification.probability_percentage}%)`);
    }
  }

  return parts.join('\n');
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
 * Strict Operational AI Grounding Directives:
 * Injected into all Puter AI prompts to guarantee scientific integrity,
 * prevent synthetic fact fabrication, and enforce compliance boundaries.
 */
const AI_GROUNDING_RULES = `
CRITICAL SAFETY & GROUNDING RULES:
1. VAYU model outputs (MobileNetV3, ResNet18, Trajectory-GRU) provided above are the SOLE authoritative source of numerical meteorological metrics.
2. DO NOT INVENT measurements, observations, warnings, locations, or probabilities not present in the provided context.
3. DO NOT claim certainty beyond the supplied model outputs. Clearly distinguish between "VAYU MODEL OUTPUT" (the verified numbers/data) and "AI INTERPRETATION" (your meteorological synthesis).
4. If specific data (e.g. pressure, shear, storm surge) is unavailable in the context, explicitly state: "Data unavailable in current session."
5. You are an AI meteorological reasoning assistant, NOT the official statutory issuing authority. DO NOT issue independent statutory emergency warnings.
6. Always advise consulting official India Meteorological Department (IMD / RSMC New Delhi) bulletins and NDMA advisories for actionable civil defense orders.`;

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

  const prompt = `You are VAYU AI Analyst, an expert tropical meteorology advisor for the VAYU Cyclone Intelligence Platform.

ACTIVE CYCLONE DATA:
${formattedContext}

${AI_GROUNDING_RULES}

Provide a structured, professional, 3-to-4 paragraph operational assessment:
1. System Status & Synoptic Overview: Synthesize current intensity, location, and central pressure from the model output.
2. Morphology & Convective Organization: Interpret the Dvorak pattern and what it indicates about vortex health and shear.
3. Track & Hazard Outlook: Summarize anticipated trajectory, landfall timeline (if projected), and primary hazards (wind, storm surge, rainfall).

Keep your response structured, concise, and professional.`;

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
      content: `You are VAYU AI Analyst, an operational tropical meteorology advisor for the VAYU Cyclone Intelligence Platform.

ACTIVE CYCLONE DATA:
${formattedContext}

${AI_GROUNDING_RULES}

Instructions:
- Answer the user's question directly, clearly, and objectively based on the supplied data.
- Emphasize verified model output vs analytical interpretation.
- If the question asks about something not in the data, state clearly that it is not in the current session telemetry.`
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
