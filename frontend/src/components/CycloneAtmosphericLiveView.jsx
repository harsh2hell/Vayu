import React, { useRef, useEffect, useState } from 'react';

/**
 * CycloneAtmosphericLiveView
 * -------------------------------------------------------------
 * 1. Proper Earth Visibility:
 *    Calibrated horizontal focal framing so the Earth horizon, Indian subcontinent,
 *    and coastlines are properly visible on the left and top.
 * 2. Continuous, Seamless Cloud Swirl (NO Cuts / NO Pauses / NO Restarts):
 *    Continuous mathematical angular rotation around the cyclone eye.
 *    No period reset, no jump, no cross-fade loop — just perpetual, slow, silky-smooth motion.
 * 3. 100% Clean Borders & Static Earth:
 *    Rotation is strictly bounded to the cyclone vortex (r <= 0.32).
 *    All background land, ocean, and 4 sides are 100% static original photo.
 *    Zero streaking or edge artifacts.
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

  varying vec2 v_uv;

  void main() {
    // 1. Calibrated Framing for Proper Earth Visibility:
    // Original photo aspect ratio: 1200 / 896 = 1.339286
    float imgAspect = 1200.0 / 896.0;
    float screenAspect = u_resolution.x / max(u_resolution.y, 1.0);

    vec2 imgUV;
    if (screenAspect > imgAspect) {
      imgUV = vec2(v_uv.x, (v_uv.y - 0.5) * (imgAspect / screenAspect) + 0.5);
    } else {
      // Container is taller than image (vertical login card pane):
      // Horizontal focal point shifted to 0.43 to show the Indian landmass & Earth curvature properly!
      float scale = screenAspect / imgAspect;
      imgUV = vec2((v_uv.x - 0.5) * scale + 0.43, v_uv.y);
    }

    // Original base photo sample
    vec4 baseColor = texture2D(u_texture, clamp(imgUV, 0.0, 1.0));

    // 2. Cyclone Eye Coordinates in the photograph
    vec2 eye = vec2(0.501, 0.500);
    vec2 d = imgUV - eye;
    d.y /= imgAspect; // Circular metric
    float r = length(d);

    // 3. Storm Vortex Zone Mask:
    // Strictly bounded inside r <= 0.32 (well away from all 4 borders).
    // Beyond r = 0.32, rotMask is EXACTLY 0.0 (Earth landmass, ocean & all borders stay 100% static!)
    float rotMask = smoothstep(0.32, 0.18, r);

    // Only rotate bright cloud structures
    float lum = dot(baseColor.rgb, vec3(0.299, 0.587, 0.114));
    float cloudMask = smoothstep(0.20, 0.52, lum) * rotMask;

    // Fast path: If outside storm or on dark ocean/land, output original photo directly
    if (cloudMask <= 0.0005) {
      gl_FragColor = baseColor;
      return;
    }

    // 4. Continuous, Perpetual Rotation (Zero Cuts / Zero Pauses / Zero Restarts):
    // Angular velocity: One majestic, graceful full revolution every ~160 seconds
    float omega = 0.038; // rad/sec
    float rotAngle = -u_time * omega;

    // Angle of current pixel relative to eye
    float currentAngle = atan(d.y, d.x);

    // Continuous rotation angle smoothly modulated by storm radius
    float sampleAngle = currentAngle + rotAngle * rotMask;

    // Rotated sample position
    vec2 dRot = r * vec2(cos(sampleAngle), sin(sampleAngle));
    dRot.y *= imgAspect; // Re-apply aspect ratio
    vec2 sampleUV = eye + dRot;

    // Sample rotated cloud texture
    vec4 rotColor = texture2D(u_texture, clamp(sampleUV, 0.0, 1.0));

    // 5. Seamlessly blend rotating clouds with static background
    gl_FragColor = mix(baseColor, rotColor, cloudMask);
  }
`;

export default function CycloneAtmosphericLiveView() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let gl = canvas.getContext('webgl', { 
      alpha: false, 
      antialias: true,
      powerPreference: 'high-performance' 
    });

    if (!gl) {
      console.warn('[VAYU] WebGL not available, displaying original satellite image');
      setHasWebGL(false);
      return;
    }

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
    const uTextureLoc = gl.getUniformLocation(program, 'u_texture');

    // Load original cyclone satellite image
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
      if (gl) {
        gl.deleteProgram(program);
        gl.deleteShader(vertShader);
        gl.deleteShader(fragShader);
        gl.deleteBuffer(positionBuffer);
        gl.deleteTexture(texture);
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 overflow-hidden bg-slate-950 select-none rounded-r-2xl"
    >
      {hasWebGL ? (
        <canvas
          ref={canvasRef}
          className="w-full h-full object-cover block pointer-events-none"
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
