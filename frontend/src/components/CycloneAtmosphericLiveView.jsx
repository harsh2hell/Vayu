import React, { useRef, useEffect, useState } from 'react';

/**
 * CycloneAtmosphericLiveView
 * -------------------------------------------------------------
 * 100% faithful to the original satellite photograph:
 * 1. Preserves original image colors, framing, landmass, ocean, and horizon exactly.
 * 2. Only the cyclone clouds swirl counter-clockwise along the spiral rainband path.
 * 3. Slower, gentle, and majestic rotation speed.
 * 4. Outside the storm (India, ocean, space horizon, and all 4 edges), the image is 100% static original photo.
 * 5. Zero edge streaking or border artifacts.
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
    // 1. Exact CSS object-cover UV mapping for 1200x896 original photograph
    float imgAspect = 1200.0 / 896.0;
    float screenAspect = u_resolution.x / max(u_resolution.y, 1.0);

    vec2 imgUV;
    if (screenAspect > imgAspect) {
      imgUV = vec2(v_uv.x, (v_uv.y - 0.5) * (imgAspect / screenAspect) + 0.5);
    } else {
      imgUV = vec2((v_uv.x - 0.5) * (screenAspect / imgAspect) + 0.5, v_uv.y);
    }

    // Base original photo sample
    vec4 baseColor = texture2D(u_texture, clamp(imgUV, 0.0, 1.0));

    // 2. Cyclone Eye in exact photograph coordinates
    vec2 eye = vec2(0.501, 0.500);
    vec2 d = imgUV - eye;
    d.y /= imgAspect; // Correct for image aspect ratio
    float r = length(d);

    // 3. Cloud Isolation Mask:
    // Only animate within the cyclone storm radius (fade out before reaching land/space borders)
    float stormRadiusMask = smoothstep(0.42, 0.10, r);

    // Brightness mask: Only move the bright cloud structures, leave dark ocean/land static
    float cloudLuminance = dot(baseColor.rgb, vec3(0.299, 0.587, 0.114));
    float cloudMask = smoothstep(0.20, 0.55, cloudLuminance) * stormRadiusMask;

    // If outside the cloud storm, render the exact original photo directly
    if (cloudMask <= 0.001) {
      gl_FragColor = baseColor;
      return;
    }

    // 4. Counter-Clockwise Spiral Flow Direction:
    vec2 tangent = vec2(-d.y, d.x) / max(r, 0.001);
    vec2 inward = -d / max(r, 0.001);
    // Inward spiral pitch along the rainbands (~16 degrees)
    vec2 flowDir = normalize(tangent + 0.28 * inward);
    flowDir.y *= imgAspect;

    // Modified Burgers vortex velocity curve:
    // Eyewall has peak rotational speed, tapering off naturally outward
    float rCore = 0.085;
    float vortexProfile = (2.0 * (r / rCore)) / (1.0 + pow(r / rCore, 2.0));

    // Slow, graceful rotation speed requested by user
    float maxFlow = 0.015 * vortexProfile * cloudMask;

    // Dual-phase seamless flow advection (5.2-second slow majestic period)
    float period = 5.2;
    float phase1 = fract(u_time / period);
    float phase2 = fract((u_time / period) + 0.5);

    vec2 uv1 = imgUV + flowDir * maxFlow * (phase1 - 0.5);
    vec2 uv2 = imgUV + flowDir * maxFlow * (phase2 - 0.5);

    // Smooth sinusoidal crossfade
    float weight = 0.5 - 0.5 * cos(phase1 * 6.2831853);

    vec4 sample1 = texture2D(u_texture, clamp(uv1, 0.0, 1.0));
    vec4 sample2 = texture2D(u_texture, clamp(uv2, 0.0, 1.0));
    vec4 movingClouds = mix(sample1, sample2, weight);

    // Blend only moving clouds into original photo
    gl_FragColor = mix(baseColor, movingClouds, cloudMask);
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
