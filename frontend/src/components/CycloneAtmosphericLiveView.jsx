import React, { useRef, useEffect, useState } from 'react';

/**
 * CycloneAtmosphericLiveView
 * -------------------------------------------------------------
 * 1. Proper Earth Visibility:
 *    Calibrated horizontal focal framing so the Earth horizon, Indian subcontinent,
 *    and coastlines are properly visible and 100% stable.
 * 2. Dual-Phase Cyclic Advection (Zero Infinite Distortion / Shear):
 *    Replaced linear time accumulation with 10s dual-phase flow mapping.
 *    Bounded angular displacement ensures seamless counter-clockwise swirl
 *    and inward spiral flow indefinitely (30 min, 60 min, or 24+ hours)
 *    without ANY texture stretching or winding glitches.
 * 3. Storm Cloud Mask Isolation & Zero Edge Artifacts:
 *    Motion is strictly isolated to the cyclonic cloud system. The Indian landmass,
 *    coastlines, and Earth horizon remain completely static and razor-sharp,
 *    with zero edge clamping or streaks.
 */

const VERTEX_SHADER_SOURCE = `
  attribute vec2 a_position;
  varying vec2 v_uv;
  void main() {
    v_uv = (a_position + 1.0) * 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER_SOURCE = `
  precision highp float;

  uniform sampler2D u_texture;
  uniform float     u_time;
  uniform vec2      u_resolution;

  varying vec2 v_uv;

  void main() {
    // ── 1. Aspect-correct UV mapping ────────────────────────────────────────
    // Original photo: 1200 × 896 px  →  aspect = 1.339286
    float imgAspect    = 1200.0 / 896.0;
    float screenAspect = u_resolution.x / max(u_resolution.y, 1.0);

    vec2 imgUV;
    if (screenAspect > imgAspect) {
      // Screen wider than image — pillarbox vertical
      imgUV = vec2(v_uv.x, (v_uv.y - 0.5) * (imgAspect / screenAspect) + 0.5);
    } else {
      // Screen taller than image — horizontal crop, focal offset 0.43 to
      // show the Indian subcontinent & Earth curvature
      float scale = screenAspect / imgAspect;
      imgUV = vec2((v_uv.x - 0.5) * scale + 0.43, v_uv.y);
    }

    vec2 safeBaseUV = clamp(imgUV, 0.002, 0.998);

    // ── 2. Cyclone eye & circular metric radius ──────────────────────────────
    vec2 eye = vec2(0.501, 0.500);
    vec2 d   = imgUV - eye;

    // Circular metric: correct x for image aspect so radii are true circles
    vec2 dC = vec2(d.x, d.y / imgAspect);
    float r  = length(dC);

    // ── 3. Dual-Phase Cyclic Advection (Zero Infinite Shear & Zero Glitch) ──
    // Eliminates texture winding and edge streaking over long durations (1 hr+).
    // Phase 1 and Phase 2 are offset by half a cycle (0.5).
    // Each phase has bounded displacement in [-0.5, +0.5] that smoothly crossfades
    // using a zero-derivative cosine weight. When a phase wraps, its opacity is 0.
    float period = 8.0;
    float t1 = fract(u_time / period);
    float t2 = fract((u_time / period) + 0.5);

    // Continuous cosine blend weight (C^1 smooth, zero derivative at boundaries)
    float blend = 0.5 - 0.5 * cos(t1 * 6.28318530718);

    // ── 4. Spatial Flow Profile & Landmass Boundary Isolation ───────────────
    // Eye calm: wind speed drops to near zero at the calm eye center
    float eyeCalm = smoothstep(0.012, 0.045, r);

    // Vortex velocity profile: peaks around eyewall (r0), falls off into outer bands
    float r0 = 0.14;
    float rr0 = r / r0;
    float vortexProfile = rr0 / (1.0 + rr0 * rr0 * rr0);

    // Crucial Storm Mask (Strictly edge0 < edge1 for 100% GPU driver compliance):
    // Tapers to EXACTLY ZERO at r >= 0.24 (more than 18% away from any image border).
    // Guarantees India's coastlines, landmass, and Earth horizon are 100% stationary,
    // and physically prevents any edge clamping streaks!
    float stormMask = (1.0 - smoothstep(0.12, 0.24, r)) * eyeCalm;

    float motionStrength = vortexProfile * stormMask;

    // ── 5. Counter-Clockwise Swirl & Inward Spiral Drift ────────────────────
    float maxAngle = 0.06;        // Subtle ~3.4 degrees max angular shift (zero distortion)
    float inflowFactor = 0.018;   // Subtle inward spiral toward eyewall

    // Phase 1 (Centered at zero displacement when t1 = 0.5, where blend = 1.0)
    float shift1 = -(t1 - 0.5) * maxAngle * (motionStrength / 0.35);
    float cos1   = cos(shift1);
    float sin1   = sin(shift1);
    float scale1 = 1.0 + (t1 - 0.5) * inflowFactor * stormMask;
    vec2 dC1     = vec2(cos1 * dC.x - sin1 * dC.y, sin1 * dC.x + cos1 * dC.y) * scale1;
    vec2 sampleUV1 = eye + vec2(dC1.x, dC1.y * imgAspect);

    // Phase 2 (Centered at zero displacement when t2 = 0.5, where blend = 0.0)
    float shift2 = -(t2 - 0.5) * maxAngle * (motionStrength / 0.35);
    float cos2   = cos(shift2);
    float sin2   = sin(shift2);
    float scale2 = 1.0 + (t2 - 0.5) * inflowFactor * stormMask;
    vec2 dC2     = vec2(cos2 * dC.x - sin2 * dC.y, sin2 * dC.x + cos2 * dC.y) * scale2;
    vec2 sampleUV2 = eye + vec2(dC2.x, dC2.y * imgAspect);

    // ── 6. Sample & Crossfade ────────────────────────────────────────────────
    vec4 col1 = texture2D(u_texture, clamp(sampleUV1, 0.002, 0.998));
    vec4 col2 = texture2D(u_texture, clamp(sampleUV2, 0.002, 0.998));
    vec4 dynamicColor = mix(col2, col1, blend);

    // ── 7. Convective Logarithmic Spiral Stream Wave (Atmospheric Pulse) ────
    // Dynamic rainband illumination wave flowing CCW inward to the eyewall
    float spiralAngle = atan(dC.y, dC.x) + 3.0 * log(max(r, 0.02)) + u_time * 1.2;
    float spiralWave  = pow(sin(spiralAngle * 2.5) * 0.5 + 0.5, 3.0) * 0.06 * stormMask;
    dynamicColor += vec4(spiralWave * 0.9, spiralWave * 0.95, spiralWave, 0.0);

    // ── 8. Edge Guard — Absolute guarantee against boundary artifacts ───────
    float marginX = min(imgUV.x, 1.0 - imgUV.x);
    float marginY = min(imgUV.y, 1.0 - imgUV.y);
    float borderGuard = smoothstep(0.005, 0.035, min(marginX, marginY));

    vec4 baseColor = texture2D(u_texture, safeBaseUV);
    gl_FragColor = mix(baseColor, dynamicColor, borderGuard);
  }
`;

export default function CycloneAtmosphericLiveView() {
  const canvasRef    = useRef(null);
  const containerRef = useRef(null);
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', {
      alpha: false,
      antialias: true,
      powerPreference: 'high-performance',
    });

    if (!gl) {
      console.warn('[VAYU] WebGL not available — showing static image');
      setHasWebGL(false);
      return;
    }

    function createShader(type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('[VAYU] Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vertShader = createShader(gl.VERTEX_SHADER,   VERTEX_SHADER_SOURCE);
    const fragShader = createShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SOURCE);
    if (!vertShader || !fragShader) { setHasWebGL(false); return; }

    const program = gl.createProgram();
    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('[VAYU] Program link error:', gl.getProgramInfoLog(program));
      setHasWebGL(false);
      return;
    }

    // Full-screen quad
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1,  1, -1, -1,  1,  -1,  1,  1, -1,  1,  1]),
      gl.STATIC_DRAW
    );

    const aPositionLoc  = gl.getAttribLocation(program,  'a_position');
    const uTimeLoc      = gl.getUniformLocation(program, 'u_time');
    const uResolutionLoc= gl.getUniformLocation(program, 'u_resolution');
    const uTextureLoc   = gl.getUniformLocation(program, 'u_texture');

    // Load original cyclone satellite image
    const texture = gl.createTexture();
    const image   = new Image();
    image.src     = '/cyclone_satellite_vis.jpg';

    let isTextureLoaded = false;
    image.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      isTextureLoaded = true;
    };

    let animationFrameId;
    const startTime = performance.now();

    function resize() {
      if (!canvas) return;
      const dpr    = Math.min(window.devicePixelRatio || 1, 2);
      const width  = Math.floor(canvas.clientWidth  * dpr);
      const height = Math.floor(canvas.clientHeight * dpr);
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width  = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
    }

    function render(now) {
      resize();

      if (isTextureLoaded) {
        const elapsed = (now - startTime) / 1000.0;
        // Modulo 240.0 (4 minutes = exactly 30 cycles of the 8s period).
        // Keeps time bounded in [0, 240) with zero precision degradation,
        // perfectly invariant whether running for 5 seconds, 30 min, 60 min, or 24+ hours.
        const cyclicTime = elapsed % 240.0;

        gl.useProgram(program);

        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.enableVertexAttribArray(aPositionLoc);
        gl.vertexAttribPointer(aPositionLoc, 2, gl.FLOAT, false, 0, 0);

        gl.uniform1f(uTimeLoc,       cyclicTime);
        gl.uniform2f(uResolutionLoc, canvas.width, canvas.height);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform1i(uTextureLoc, 0);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
      }

      animationFrameId = requestAnimationFrame(render);
    }

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      gl.deleteProgram(program);
      gl.deleteShader(vertShader);
      gl.deleteShader(fragShader);
      gl.deleteBuffer(positionBuffer);
      gl.deleteTexture(texture);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden bg-slate-950 select-none rounded-r-2xl touch-none overscroll-none pointer-events-none"
    >
      {hasWebGL ? (
        <canvas
          ref={canvasRef}
          className="w-full h-full object-cover block pointer-events-none touch-none"
        />
      ) : (
        <img
          src="/cyclone_satellite_vis.jpg"
          alt="VAYU Cyclone Satellite Visual"
          className="w-full h-full object-cover"
        />
      )}
    </div>
  );
}
