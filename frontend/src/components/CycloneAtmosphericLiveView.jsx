import React, { useRef, useEffect, useState } from 'react';

/**
 * CycloneAtmosphericLiveView
 * -------------------------------------------------------------
 * 1. Proper Earth Visibility:
 *    Calibrated horizontal focal framing so the Earth horizon, Indian subcontinent,
 *    and coastlines are properly visible.
 * 2. Global Differential Rotation — Lorentzian (Rankine-style) falloff:
 *    omega(r) = omega_core / (1 + (r/r0)^2)
 *    The core spins at full speed; the edges drift very slowly but NEVER stop.
 *    There is no hard mask boundary, so no side-cut artifact whatsoever.
 * 3. Zero Edge Artifacts:
 *    A soft edge blend (5% UV margin) re-merges the warped sample with the
 *    original photo at the very borders, eliminating clamping streaks.
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
    float imgAspect   = 1200.0 / 896.0;
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

    // ── 2. Cyclone eye & aspect-corrected radius ─────────────────────────────
    vec2 eye = vec2(0.501, 0.500);
    vec2 d   = imgUV - eye;

    // Circular metric: correct x for image aspect so radii are true circles
    vec2 dC = vec2(d.x, d.y / imgAspect);
    float r  = length(dC);

    // ── 3. Differential rotation — Lorentzian profile ────────────────────────
    //    omega(r) = omega_core / (1 + (r / r0)^2)
    //    r = 0:   full core speed (omega_core)
    //    r = r0:  half speed
    //    r >> r0: approaches zero — but asymptotically, never a hard stop
    float omega_core = 0.022;   // rad/s at eye (~286 s per full revolution)
    float r0         = 0.20;    // half-velocity radius (UV units)
    float rr0        = r / r0;
    float omega_r    = omega_core / (1.0 + rr0 * rr0);

    // Clockwise positive: angle increases with time
    float angle = u_time * omega_r;
    float cosA  = cos(angle);
    float sinA  = sin(angle);

    // Rotate displacement vector in the circular metric space
    vec2 dCrot = vec2(
      cosA * dC.x - sinA * dC.y,
      sinA * dC.x + cosA * dC.y
    );

    // Re-map back to raw image UV space (undo aspect correction)
    vec2 sampleUV = eye + vec2(dCrot.x, dCrot.y * imgAspect);

    // ── 4. Sample both versions ───────────────────────────────────────────────
    vec4 baseColor = texture2D(u_texture, clamp(imgUV,    0.001, 0.999));
    vec4 rotColor  = texture2D(u_texture, clamp(sampleUV, 0.001, 0.999));

    // ── 5. Edge softening — prevent clamping streaks at borders ──────────────
    // edgeMask = 0 right at UV edge, 1 beyond 5% inward
    float marginX   = min(imgUV.x, 1.0 - imgUV.x);
    float marginY   = min(imgUV.y, 1.0 - imgUV.y);
    float edgeMask  = smoothstep(0.0, 0.05, min(marginX, marginY));

    // Final output: blend rotated with original, guarded by edge mask
    gl_FragColor = mix(baseColor, rotColor, edgeMask);
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

        gl.useProgram(program);

        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.enableVertexAttribArray(aPositionLoc);
        gl.vertexAttribPointer(aPositionLoc, 2, gl.FLOAT, false, 0, 0);

        gl.uniform1f(uTimeLoc,       elapsed);
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
