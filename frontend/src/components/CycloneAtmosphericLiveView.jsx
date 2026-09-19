import React, { useRef, useEffect, useState } from 'react';

/**
 * CycloneAtmosphericLiveView
 * -------------------------------------------------------------------
 * Pure cinematic, photorealistic live animation of the cyclone satellite visual.
 * 100% clean (no corner text, no HUD overlays, no HUD markers).
 *
 * Advanced Physics & Visual Simulation:
 * 1. Zero Edge Smearing: Inward zoom buffer prevents texture border clamps.
 * 2. Planetary Earth Orbit: Majestic slow rotation of the Earth sphere & curvature.
 * 3. Logarithmic Spiral Streamline Advection:
 *    Clouds stream and swirl along authentic North Indian Ocean cyclonic pathways (CCW)
 *    into the eyewall using dual-phase sinusoidal advection (infinitely seamless).
 * 4. 3D Volumetric Cloud Depth: Convective cloud top specular sun highlights & crevice shadows.
 * 5. Rayleigh Scattering Limb: Radiant sapphire atmospheric airglow along space horizon.
 * 6. Interactive 3D Perspective Tilt: Smooth mouse-driven orbital parallax.
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

  // Pseudo-random hash
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
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

  // Multi-octave Fractional Brownian Motion for billowing clouds
  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
    for (int i = 0; i < 4; i++) {
      v += a * noise(p);
      p = rot * p * 2.02 + vec2(4.2, 7.8);
      a *= 0.5;
    }
    return v;
  }

  void main() {
    // Zoom in slightly (scale 0.83) to create a safe margin around edges
    // This permanently prevents any pixel streaking or border clamping!
    vec2 uv = (v_uv - 0.5) * 0.83 + 0.5;
    float aspect = u_resolution.x / max(u_resolution.y, 1.0);

    // Interactive 3D orbital perspective tilt
    vec2 tilt = (u_mouse - 0.5) * 0.022;
    uv += tilt;

    // ─────────────────────────────────────────────────────────────
    // 1. EARTH PLANETARY ROTATION (Global Orbital Drift)
    // ─────────────────────────────────────────────────────────────
    // Curved planetary center below the frame
    vec2 earthCenter = vec2(0.5, 1.72);
    vec2 dEarth = uv - earthCenter;
    dEarth.x *= aspect;
    
    // Slow, majestic planetary West-to-East rotation
    float earthSpeed = 0.016;
    float earthAngle = -u_time * earthSpeed;
    mat2 earthRot = mat2(cos(earthAngle), -sin(earthAngle), sin(earthAngle), cos(earthAngle));
    vec2 uvEarth = earthCenter + (earthRot * dEarth);
    uvEarth.x /= aspect;

    // ─────────────────────────────────────────────────────────────
    // 2. CYCLONE VORTEX & LOGARITHMIC SPIRAL STREAMLINES
    // ─────────────────────────────────────────────────────────────
    vec2 eye = u_eye;
    vec2 d = uv - eye;
    d.x *= aspect;
    float r = length(d);
    float angle = atan(d.y, d.x);

    // Velocity profile based on Modified Rankine / Burgers vortex:
    // Eyewall (r ~ 0.08) has peak rotational speed, tapering off smoothly
    float rCore = 0.09;
    float vortexProfile = (2.2 * (r / rCore)) / (1.0 + pow(r / rCore, 2.1));
    
    // Counter-clockwise spin (North Indian Ocean / Bay of Bengal physics)
    float baseSpinRate = 0.32;
    float angularVel = (baseSpinRate * vortexProfile) / max(r, 0.032);

    // Inflow along logarithmic spiral rainbands (inward pitch ~ 18 degrees)
    float spiralPitch = 0.26;
    float inwardSpeed = 0.024 * vortexProfile;

    // Dual-phase seamless flow advection
    float period = 3.6;
    float t1 = fract(u_time / period);
    float t2 = fract((u_time / period) + 0.5);

    // Continuous baseline rotation so cloud arms perpetually circulate
    float contAngle = -u_time * 0.04 * (1.0 / (1.0 + r * 3.0));
    mat2 contRot = mat2(cos(contAngle), -sin(contAngle), sin(contAngle), cos(contAngle));

    // Phase 1 streamline displacement
    float theta1 = angle - (t1 * angularVel * 0.42);
    float rad1 = max(0.008, r - (t1 * inwardSpeed * 0.22));
    vec2 disp1 = vec2(rad1 * cos(theta1), rad1 * sin(theta1));
    disp1.x /= aspect;
    vec2 uv1 = eye + disp1;

    // Phase 2 streamline displacement
    float theta2 = angle - (t2 * angularVel * 0.42);
    float rad2 = max(0.008, r - (t2 * inwardSpeed * 0.22));
    vec2 disp2 = vec2(rad2 * cos(theta2), rad2 * sin(theta2));
    disp2.x /= aspect;
    vec2 uv2 = eye + disp2;

    // Billowing cloud turbulence along spiral arms
    vec2 cloudTurb1 = vec2(
      fbm(uv1 * 14.0 + u_time * 0.06),
      fbm(uv1 * 14.0 - u_time * 0.06)
    ) * 0.007 * vortexProfile;

    vec2 cloudTurb2 = vec2(
      fbm(uv2 * 14.0 + u_time * 0.06 + 5.0),
      fbm(uv2 * 14.0 - u_time * 0.06 + 5.0)
    ) * 0.007 * vortexProfile;

    // Apply continuous rotation and turbulence
    vec2 sampleUV1 = eye + (contRot * (uv1 + cloudTurb1 - eye));
    vec2 sampleUV2 = eye + (contRot * (uv2 + cloudTurb2 - eye));

    // Smooth sinusoidal blend weight between Phase 1 and Phase 2 (infinite seamless flow)
    float weight = 0.5 - 0.5 * cos(t1 * 6.2831853);

    // Sample cyclone texture
    vec4 c1 = texture2D(u_texture, clamp(sampleUV1, 0.002, 0.998));
    vec4 c2 = texture2D(u_texture, clamp(sampleUV2, 0.002, 0.998));
    vec4 cycloneColor = mix(c1, c2, weight);

    // Sample planetary background (Earth curvature & space horizon)
    vec4 earthColor = texture2D(u_texture, clamp(uvEarth, 0.002, 0.998));

    // Smooth transition from the swirling cyclone vortex into the planetary Earth disc
    float cycloneMask = smoothstep(0.68, 0.16, r);
    vec4 finalColor = mix(earthColor, cycloneColor, cycloneMask);

    // ─────────────────────────────────────────────────────────────
    // 3. PHOTOREALISTIC ATMOSPHERIC ILLUMINATION
    // ─────────────────────────────────────────────────────────────
    // A. Rayleigh scattering blue limb along top Earth curvature
    float limbFactor = smoothstep(0.42, 0.04, uv.y);
    vec3 spaceAirglow = vec3(0.16, 0.55, 0.95);
    finalColor.rgb = mix(finalColor.rgb, finalColor.rgb + spaceAirglow * 0.26, limbFactor * 0.48);

    // B. Sunlight specular highlights across dense convective cloud tops
    vec2 sunVector = normalize(vec2(-0.55, -0.80));
    float sunDot = max(0.0, dot(normalize(d + vec2(0.001)), sunVector));
    float cloudBrightness = dot(finalColor.rgb, vec3(0.299, 0.587, 0.114));
    float highlight = pow(sunDot, 2.5) * smoothstep(0.45, 0.9, cloudBrightness) * cycloneMask;
    finalColor.rgb += vec3(0.08, 0.09, 0.11) * highlight;

    // C. Eye of the storm: Calm deep core with stadium eyewall contrast
    float eyeDist = length((uv - eye) * vec2(aspect, 1.0));
    float eyeCenterMask = smoothstep(0.042, 0.008, eyeDist);
    float eyeBreathing = 0.5 + 0.5 * sin(u_time * 1.5);
    finalColor.rgb += vec3(0.03, 0.08, 0.14) * eyeCenterMask * eyeBreathing;

    // Delicate filmic atmospheric vignette
    float vig = 1.0 - smoothstep(0.55, 1.25, length(v_uv - 0.5));
    finalColor.rgb *= (0.88 + 0.12 * vig);

    gl_FragColor = finalColor;
  }
`;

export default function CycloneAtmosphericLiveView() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [hasWebGL, setHasWebGL] = useState(true);
  const mousePosRef = useRef({ x: 0.5, y: 0.5 });
  const currentMouseRef = useRef({ x: 0.5, y: 0.5 });

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
      console.warn('[VAYU] WebGL not available, falling back to clean satellite visual');
      setHasWebGL(false);
      return;
    }

    // Shader compiler
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

    // Screen-filling quad
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

    // Load Cyclone Satellite Texture with smooth mipmapping
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

    // 60 FPS Render loop with smooth mouse interpolation
    function render(now) {
      resize();

      // Smooth lerp mouse coordinates for fluid orbital perspective
      currentMouseRef.current.x += (mousePosRef.current.x - currentMouseRef.current.x) * 0.05;
      currentMouseRef.current.y += (mousePosRef.current.y - currentMouseRef.current.y) * 0.05;

      if (isTextureLoaded) {
        const elapsedTime = (now - startTime) / 1000.0;

        gl.useProgram(program);

        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.enableVertexAttribArray(aPositionLoc);
        gl.vertexAttribPointer(aPositionLoc, 2, gl.FLOAT, false, 0, 0);

        gl.uniform1f(uTimeLoc, elapsedTime);
        gl.uniform2f(uResolutionLoc, canvas.width, canvas.height);
        gl.uniform2f(uMouseLoc, currentMouseRef.current.x, currentMouseRef.current.y);
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
  }, []);

  // Mouse move handler for smooth 3D parallax
  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    mousePosRef.current = { x, y };
  };

  const handleMouseLeave = () => {
    mousePosRef.current = { x: 0.5, y: 0.5 };
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="absolute inset-0 overflow-hidden bg-slate-950 select-none"
    >
      {/* 1. Pure Live WebGL Canvas (Zero Text / Zero Overlays) */}
      {hasWebGL ? (
        <canvas
          ref={canvasRef}
          className="w-full h-full object-cover block pointer-events-none"
        />
      ) : (
        /* Fallback Layer */
        <img
          src="/cyclone_satellite_vis.jpg"
          alt="VAYU Cyclone Satellite Visual"
          className="w-full h-full object-cover"
        />
      )}

      {/* 2. Seamless Atmospheric Lens Edge Blend */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(0,0,0,0)_60%,rgba(2,6,23,0.30)_100%)]" />
    </div>
  );
}
