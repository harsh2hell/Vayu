import React, { useRef, useEffect, useState } from 'react';

/**
 * CycloneAtmosphericLiveView
 * -------------------------------------------------------------
 * Cinematic, photorealistic live animation of the cyclone satellite visual.
 *
 * Meteorological & Physics Model:
 * 1. Earth Planetary Rotation: Slow orbital drift around the Earth's curvature center.
 * 2. Cyclone Vortex Circulation: Counter-clockwise logarithmic spiral advection
 *    using a Modified Burgers vortex velocity profile:
 *      v_theta(r) = (2 * v_max * (r/r_max)) / (1 + (r/r_max)^2)
 *    Clouds spiral gracefully along authentic rainband trajectories into the central eye.
 * 3. Two-phase flow mapping prevents texture distortion and provides an infinite,
 *    seamless 60 FPS circulation.
 * 4. Atmospheric Rayleigh scattering limb glow along Earth curvature.
 * 5. Interactive 3D orbital perspective tilt on mouse hover.
 * 6. Live orbital telemetry HUD overlay (MoES / ISRO INSAT-3DR style).
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
  uniform float u_time;
  uniform vec2 u_resolution;
  uniform vec2 u_mouse;
  uniform vec2 u_eye;

  varying vec2 v_uv;

  // Simple pseudo-random hash
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  // Smooth 2D noise
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  // Fractional Brownian Motion for atmospheric turbulence
  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
    for (int i = 0; i < 3; i++) {
      v += a * noise(p);
      p = rot * p * 2.0 + vec2(10.0);
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = v_uv;
    float aspect = u_resolution.x / max(u_resolution.y, 1.0);

    // 1. Subtle 3D mouse parallax tilt
    vec2 mouseOffset = (u_mouse - 0.5) * 0.015;
    uv += mouseOffset;

    // 2. Earth Planetary Rotation:
    // Earth rotates slowly West to East across the horizon
    float earthRotationSpeed = 0.018;
    vec2 earthDrift = vec2(-u_time * earthRotationSpeed * 0.08, u_time * earthRotationSpeed * 0.02);
    
    // Curvature center of Earth horizon in the image (bottom-right horizon curve)
    vec2 earthCenter = vec2(0.5, 1.6);
    vec2 toEarth = uv - earthCenter;
    toEarth.x *= aspect;
    float earthAngle = -u_time * 0.012;
    mat2 earthRot = mat2(cos(earthAngle), -sin(earthAngle), sin(earthAngle), cos(earthAngle));
    vec2 rotatedEarthUV = earthCenter + (earthRot * toEarth);
    rotatedEarthUV.x /= aspect;

    // 3. Cyclone Vortex & Spiral Cloud Dynamics:
    vec2 eye = u_eye;
    vec2 d = uv - eye;
    d.x *= aspect;
    float r = length(d);
    float baseAngle = atan(d.y, d.x);

    // Cyclone vortex rotation speed follows Modified Rankine / Burgers vortex:
    // Eyewall (r ~ 0.08) has peak rotational velocity, decaying smoothly outward
    float rMax = 0.10;
    float vortexStrength = (2.0 * (r / rMax)) / (1.0 + pow(r / rMax, 2.2));
    
    // North Indian Ocean cyclones spin Counter-Clockwise
    float spinSpeed = 0.35; // Majestic operational speed
    float angularVelocity = (spinSpeed * vortexStrength) / max(r, 0.035);

    // Radial inward suction along logarithmic spiral arms (clouds flow into the eye)
    float spiralPitch = 0.22; // Inward spiral angle
    float inwardSuction = 0.028 * vortexStrength;

    // Two-Phase Blended Flow Advection to prevent texture distortion
    float flowCycle = 4.0;
    float phase1 = fract(u_time / flowCycle);
    float phase2 = fract((u_time / flowCycle) + 0.5);

    // Phase 1 displacement
    float theta1 = baseAngle - (phase1 * angularVelocity * 0.45);
    float r1 = max(0.005, r - (phase1 * inwardSuction * 0.2));
    vec2 d1 = vec2(r1 * cos(theta1), r1 * sin(theta1));
    d1.x /= aspect;
    vec2 uv1 = eye + d1;

    // Phase 2 displacement
    float theta2 = baseAngle - (phase2 * angularVelocity * 0.45);
    float r2 = max(0.005, r - (phase2 * inwardSuction * 0.2));
    vec2 d2 = vec2(r2 * cos(theta2), r2 * sin(theta2));
    d2.x /= aspect;
    vec2 uv2 = eye + d2;

    // Atmospheric turbulence micro-displacement
    vec2 turb1 = vec2(
      fbm(uv1 * 12.0 + u_time * 0.05),
      fbm(uv1 * 12.0 - u_time * 0.05)
    ) * 0.006 * vortexStrength;

    vec2 turb2 = vec2(
      fbm(uv2 * 12.0 + u_time * 0.05 + 10.0),
      fbm(uv2 * 12.0 - u_time * 0.05 + 10.0)
    ) * 0.006 * vortexStrength;

    // Continuous slow rotational baseline so cloud arms perpetually circulate
    float continuousAngle = -u_time * 0.045 * (1.0 / (1.0 + r * 3.5));
    mat2 contRot = mat2(cos(continuousAngle), -sin(continuousAngle), sin(continuousAngle), cos(continuousAngle));
    
    vec2 sampleUV1 = eye + (contRot * (uv1 + turb1 - eye));
    vec2 sampleUV2 = eye + (contRot * (uv2 + turb2 - eye));

    // Blend weight between the two advection phases (triangle wave)
    float weight = abs((phase1 - 0.5) * 2.0);

    // Sample cyclone texture with dual-phase advection
    vec4 cycloneColor1 = texture2D(u_texture, clamp(sampleUV1, 0.001, 0.999));
    vec4 cycloneColor2 = texture2D(u_texture, clamp(sampleUV2, 0.001, 0.999));
    vec4 cycloneColor = mix(cycloneColor1, cycloneColor2, weight);

    // Sample planetary background (Earth curvature & space horizon)
    vec4 earthColor = texture2D(u_texture, clamp(rotatedEarthUV, 0.001, 0.999));

    // Blend between cyclone swirling core and planetary Earth background
    // Smooth transition beyond the outer feeder rainband radius (r ~ 0.55)
    float cycloneInfluence = smoothstep(0.68, 0.18, r);
    vec4 finalColor = mix(earthColor, cycloneColor, cycloneInfluence);

    // 4. Photorealistic Atmospheric Enhancements:
    // A. Blue Rayleigh scattering limb along Earth's top curvature
    float limbFactor = smoothstep(0.40, 0.05, uv.y);
    vec3 atmosphericBlue = vec3(0.18, 0.58, 0.95);
    finalColor.rgb = mix(finalColor.rgb, finalColor.rgb + atmosphericBlue * 0.22, limbFactor * 0.5);

    // B. Eye of the storm: Subtle atmospheric calm core pulse
    float eyeDist = length((uv - eye) * vec2(aspect, 1.0));
    float eyeCore = smoothstep(0.035, 0.005, eyeDist);
    float eyePulse = 0.5 + 0.5 * sin(u_time * 1.8);
    finalColor.rgb += vec3(0.08, 0.14, 0.22) * eyeCore * eyePulse;

    // C. Sunlight angle & specular highlights on cloud tops
    vec2 sunDir = normalize(vec2(-0.6, -0.8));
    float cloudShading = dot(normalize(d + vec2(0.001)), sunDir);
    finalColor.rgb += vec3(0.04) * max(0.0, cloudShading) * cycloneInfluence;

    // Subtle scan line sweep for high-tech satellite sensor fidelity
    float scanline = sin(uv.y * 380.0 + u_time * 2.0) * 0.012;
    finalColor.rgb += scanline;

    gl_FragColor = finalColor;
  }
`;

export default function CycloneAtmosphericLiveView() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [hasWebGL, setHasWebGL] = useState(true);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [istTime, setIstTime] = useState('');

  // Update real-time satellite telemetry clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const utc = now.toISOString().slice(11, 19) + ' UTC';
      setIstTime(utc);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // WebGL Live Simulation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let gl = canvas.getContext('webgl', { 
      alpha: false, 
      antialias: true,
      powerPreference: 'high-performance' 
    });

    if (!gl) {
      console.warn('[VAYU] WebGL not available, falling back to CSS animation');
      setHasWebGL(false);
      return;
    }

    // Helper: Compile Shader
    function createShader(gl, type, source) {
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

    const vertShader = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER_SOURCE);
    const fragShader = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SOURCE);
    if (!vertShader || !fragShader) {
      setHasWebGL(false);
      return;
    }

    const program = gl.createProgram();
    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('[VAYU] Program link error:', gl.getProgramInfoLog(program));
      setHasWebGL(false);
      return;
    }

    // Quad geometry covering the full screen
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1, -1,
         1, -1,
        -1,  1,
        -1,  1,
         1, -1,
         1,  1,
      ]),
      gl.STATIC_DRAW
    );

    const aPositionLoc = gl.getAttribLocation(program, 'a_position');
    const uTimeLoc = gl.getUniformLocation(program, 'u_time');
    const uResolutionLoc = gl.getUniformLocation(program, 'u_resolution');
    const uMouseLoc = gl.getUniformLocation(program, 'u_mouse');
    const uEyeLoc = gl.getUniformLocation(program, 'u_eye');
    const uTextureLoc = gl.getUniformLocation(program, 'u_texture');

    // Load Cyclone Satellite Texture
    const texture = gl.createTexture();
    const image = new Image();
    image.src = '/cyclone_satellite_vis.jpg';

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

    // Resize handler
    let animationFrameId;
    let startTime = performance.now();

    function resize() {
      if (!canvas) return;
      const displayWidth = canvas.clientWidth;
      const displayHeight = canvas.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.floor(displayWidth * dpr);
      const height = Math.floor(displayHeight * dpr);

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
    }

    // Render loop
    function render(now) {
      resize();

      if (isTextureLoaded) {
        const elapsedTime = (now - startTime) / 1000.0;

        gl.useProgram(program);

        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.enableVertexAttribArray(aPositionLoc);
        gl.vertexAttribPointer(aPositionLoc, 2, gl.FLOAT, false, 0, 0);

        gl.uniform1f(uTimeLoc, elapsedTime);
        gl.uniform2f(uResolutionLoc, canvas.width, canvas.height);
        gl.uniform2f(uMouseLoc, mousePos.x, mousePos.y);
        // Normalized center of the cyclone eye in cyclone_satellite_vis.jpg
        gl.uniform2f(uEyeLoc, 0.501, 0.500);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform1i(uTextureLoc, 0);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
      }

      animationFrameId = requestAnimationFrame(render);
    }

    animationFrameId = requestAnimationFrame(render);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      if (gl) {
        gl.deleteProgram(program);
        gl.deleteShader(vertShader);
        gl.deleteShader(fragShader);
        gl.deleteBuffer(positionBuffer);
        gl.deleteTexture(texture);
      }
    };
  }, [mousePos]);

  // Mouse move handler for 3D parallax
  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setMousePos({ x, y });
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="absolute inset-0 overflow-hidden bg-slate-950 select-none group"
    >
      {/* 1. Live WebGL Canvas */}
      {hasWebGL ? (
        <canvas
          ref={canvasRef}
          className="w-full h-full object-cover block pointer-events-none"
        />
      ) : (
        /* Fallback Layer if WebGL is disabled */
        <div className="relative w-full h-full overflow-hidden">
          <img
            src="/cyclone_satellite_vis.jpg"
            alt="VAYU Cyclone Satellite Visual"
            className="w-full h-full object-cover animate-pulse"
          />
        </div>
      )}

      {/* 2. Authentic Meteorological Satellite Lens Gradient Vignette */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(0,0,0,0)_50%,rgba(2,6,23,0.45)_95%)]" />

      {/* 3. High-Tech Satellite Telemetry HUD Overlays */}
      {/* Top Bar: Orbit Status & Channel */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-20">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-950/75 backdrop-blur-md border border-sky-500/30 text-white shadow-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="w-2 h-2 rounded-full bg-emerald-500 -ml-4" />
          <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-sky-200">
            INSAT-3DR • VIS 0.65µm LIVE
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-950/75 backdrop-blur-md border border-white/10 text-white font-mono text-[10px]">
          <span className="text-slate-400">GEOSYNC ALT:</span>
          <span className="text-sky-300 font-bold">35,786 KM</span>
        </div>
      </div>

      {/* Bottom Bar: Geographic Coordinates & Cyclone Intensity */}
      <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between pointer-events-none z-20">
        <div className="space-y-1 bg-slate-950/80 backdrop-blur-md p-2.5 rounded-xl border border-white/10">
          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-300">
            <span className="text-sky-400 font-bold">POS:</span>
            <span>18.42°N, 88.35°E</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300">Bay of Bengal</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-white tracking-wide">
              SUPER CYCLONE VORTEX
            </span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 font-mono font-bold">
              CAT-5 / T-6.5
            </span>
          </div>
        </div>

        {/* Real-time UTC Telemetry Clock */}
        <div className="text-right bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 font-mono">
          <div className="text-[9px] text-slate-400 tracking-wider">TELEMETRY SYNC</div>
          <div className="text-xs font-bold text-emerald-400 tracking-widest">{istTime || 'SYNCING...'}</div>
        </div>
      </div>

      {/* Subtle Doppler Concentric Isobar Guidance Ring over the Eye */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border border-sky-400/20 pointer-events-none animate-pulse" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full border border-dashed border-sky-400/30 pointer-events-none" style={{ animation: 'spin 30s linear infinite' }} />
    </div>
  );
}
