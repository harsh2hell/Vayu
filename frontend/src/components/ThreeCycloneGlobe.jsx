import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { Sparkles } from 'lucide-react';

/**
 * Converts Latitude and Longitude to 3D Cartesian coordinates on a sphere.
 */
function latLonToVector3(lat, lon, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

/**
 * Creates a photorealistic, billowing tropical cyclone vortex cloud texture.
 * Features a distinct calm eye, dense eyewall, multi-arm logarithmic spiral rainbands,
 * and feathering cirrus outflow wisps.
 */
function createCycloneTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  const cx = 512;
  const cy = 512;

  ctx.clearRect(0, 0, 1024, 1024);

  // Helper to draw a soft cloud puff
  function drawCloudPuff(x, y, r, opacity, color = '255, 255, 255') {
    const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, `rgba(${color}, ${opacity})`);
    grad.addColorStop(0.4, `rgba(${color}, ${opacity * 0.7})`);
    grad.addColorStop(0.8, `rgba(${color}, ${opacity * 0.2})`);
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // 1. Central Dense Overcast (CDO) Core
  for (let i = 0; i < 180; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = 30 + Math.random() * 95;
    const x = cx + Math.cos(angle) * dist;
    const y = cy + Math.sin(angle) * dist;
    const puffRadius = 35 + Math.random() * 45;
    drawCloudPuff(x, y, puffRadius, 0.45 + Math.random() * 0.35);
  }

  // 2. Dense Eyewall Ring
  for (let a = 0; a < Math.PI * 2; a += 0.08) {
    const r = 38 + (Math.sin(a * 3) * 4);
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    drawCloudPuff(x, y, 26, 0.85);
  }

  // 3. Four Major Logarithmic Spiral Rainbands (Curved Inward CCW)
  const armOffsets = [0, Math.PI * 0.5, Math.PI, Math.PI * 1.5];

  armOffsets.forEach((offset, armIdx) => {
    const totalSteps = 220;
    const maxTheta = Math.PI * 3.2; // ~1.6 revolutions
    const b = 0.28; // logarithmic spiral expansion rate
    const a = 36;

    for (let step = 0; step < totalSteps; step++) {
      const t = step / totalSteps;
      const theta = t * maxTheta;
      const armAngle = theta + offset;
      const r = a * Math.exp(b * theta);

      if (r > 480) break;

      const x = cx + Math.cos(armAngle) * r;
      const y = cy + Math.sin(armAngle) * r;

      // Cloud puff size expands as rainband moves outward
      const puffR = 24 + t * 48;
      // Opacity fades toward outer edges
      const opacity = (1.0 - t * 0.75) * (0.6 + Math.random() * 0.3);

      // Cloud color: brighter white inside, slightly translucent cool white outside
      const color = t < 0.3 ? '255, 255, 255' : '242, 248, 255';

      // Draw primary arm puff
      drawCloudPuff(x, y, puffR, opacity, color);

      // Add lateral jitter puffs to create textured, turbulent convective clouds
      if (step % 2 === 0) {
        const jitterAngle = armAngle + Math.PI * 0.5 + (Math.random() - 0.5) * 0.6;
        const jitterDist = (Math.random() - 0.5) * (18 + t * 40);
        drawCloudPuff(
          x + Math.cos(jitterAngle) * jitterDist,
          y + Math.sin(jitterAngle) * jitterDist,
          puffR * 0.75,
          opacity * 0.65
        );
      }
    }
  });

  // 4. Outer Cirrus Streamers & Atmospheric Outflow
  for (let i = 0; i < 90; i++) {
    const angle = Math.random() * Math.PI * 2;
    const r = 260 + Math.random() * 200;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    drawCloudPuff(x, y, 50 + Math.random() * 50, 0.15 + Math.random() * 0.18, '235, 245, 255');
  }

  // 5. Calm Eye Carve-out
  // Cut a clean, transparent hole right in the center for the calm eye
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  const eyeGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 26);
  eyeGrad.addColorStop(0, 'rgba(0, 0, 0, 1.0)');
  eyeGrad.addColorStop(0.65, 'rgba(0, 0, 0, 0.85)');
  eyeGrad.addColorStop(0.9, 'rgba(0, 0, 0, 0.3)');
  eyeGrad.addColorStop(1, 'rgba(0, 0, 0, 0.0)');
  ctx.fillStyle = eyeGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, 26, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  return texture;
}

/**
 * Creates a circular mesh deformed to fit the curvature of the sphere at radius R.
 */
function createCurvedCycloneMesh(sphereRadius, meshRadius = 1.05) {
  const geo = new THREE.CircleGeometry(meshRadius, 64);
  const pos = geo.attributes.position;

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const distSq = x * x + y * y;
    // Spherical cap deformation: sagitta z = sqrt(R^2 - distSq) - R
    if (distSq < sphereRadius * sphereRadius) {
      const z = -(sphereRadius - Math.sqrt(sphereRadius * sphereRadius - distSq));
      pos.setZ(i, z);
    }
  }
  geo.computeVertexNormals();
  return geo;
}

const ThreeCycloneGlobe = ({ 
  targetLat = 13.5, 
  targetLon = 88.5, 
  systemName = "Invest 92B", 
  category = "Low Pressure Area",
  risk = "68%",
  isDark = false 
}) => {
  const mountRef = useRef(null);
  const globeGroupRef = useRef(null);
  const cycloneGroupRef = useRef(null);
  const cycloneMesh1Ref = useRef(null);
  const cycloneMesh2Ref = useRef(null);
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const velocityRef = useRef({ x: 0, y: 0 });

  // Update cyclone mesh position and orientation when target coordinates change
  useEffect(() => {
    if (cycloneGroupRef.current) {
      const radius = 1.95;
      const eyePos = latLonToVector3(targetLat, targetLon, radius * 1.018);
      cycloneGroupRef.current.position.copy(eyePos);
      cycloneGroupRef.current.lookAt(eyePos.clone().multiplyScalar(2));
    }

    if (globeGroupRef.current) {
      const targetY = -((targetLon + 90) * Math.PI) / 180;
      const targetX = (targetLat * Math.PI) / 180 * 0.45;
      globeGroupRef.current.rotation.x = targetX;
      globeGroupRef.current.rotation.y = targetY;
    }
  }, [targetLat, targetLon]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 500;
    const height = mount.clientHeight || 500;

    // 1. Scene & Camera (Zero clipping, perfectly centered)
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 1000);
    camera.position.z = 6.4;

    // 2. Alpha Transparent WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true, 
      powerPreference: 'high-performance' 
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    mount.appendChild(renderer.domElement);

    // 3. Globe Parent Group (Carries the planet, clouds, and cyclone)
    const globeGroup = new THREE.Group();
    globeGroupRef.current = globeGroup;
    scene.add(globeGroup);

    // Initial orientation focusing towards target coordinates
    const initialY = -((targetLon + 90) * Math.PI) / 180;
    const initialX = (targetLat * Math.PI) / 180 * 0.45;
    globeGroup.rotation.x = initialX;
    globeGroup.rotation.y = initialY;

    const radius = 1.95;

    // 4. Load High-Resolution NASA Textures
    const textureLoader = new THREE.TextureLoader();
    const dayTexture = textureLoader.load('/textures/earth_day.jpg');
    const nightTexture = textureLoader.load('/textures/earth_night.png');
    const specularTexture = textureLoader.load('/textures/earth_specular.jpg');
    const cloudsTexture = textureLoader.load('/textures/earth_clouds.png');

    dayTexture.colorSpace = THREE.SRGBColorSpace;
    nightTexture.colorSpace = THREE.SRGBColorSpace;

    // 5. Sun position in space
    const sunDirection = new THREE.Vector3(1.2, 0.35, 0.85).normalize();

    // 6. Automatic Day & Night Shader
    const earthUniforms = {
      uDayTexture: { value: dayTexture },
      uNightTexture: { value: nightTexture },
      uSpecularMap: { value: specularTexture },
      uSunDirection: { value: sunDirection },
      uAtmosphereColor: { value: new THREE.Color(isDark ? 0x0284c7 : 0x38bdf8) },
    };

    const earthGeo = new THREE.SphereGeometry(radius, 64, 64);
    const earthMat = new THREE.ShaderMaterial({
      uniforms: earthUniforms,
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vWorldPosition;
        varying vec3 vViewPosition;

        void main() {
          vUv = uv;
          vNormal = normalize(mat3(modelMatrix) * normal);
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPos.xyz;
          vec4 viewPos = modelViewMatrix * vec4(position, 1.0);
          vViewPosition = viewPos.xyz;
          gl_Position = projectionMatrix * viewPos;
        }
      `,
      fragmentShader: `
        uniform sampler2D uDayTexture;
        uniform sampler2D uNightTexture;
        uniform sampler2D uSpecularMap;
        uniform vec3 uSunDirection;
        uniform vec3 uAtmosphereColor;

        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vWorldPosition;
        varying vec3 vViewPosition;

        void main() {
          vec3 normal = normalize(vNormal);
          vec3 sunDir = normalize(uSunDirection);
          vec3 viewDir = normalize(cameraPosition - vWorldPosition);

          float sunDot = dot(normal, sunDir);
          float dayMix = smoothstep(-0.15, 0.20, sunDot);

          vec3 dayColor = texture2D(uDayTexture, vUv).rgb;

          float specMap = texture2D(uSpecularMap, vUv).r;
          vec3 reflectDir = reflect(-sunDir, normal);
          float spec = pow(max(dot(viewDir, reflectDir), 0.0), 28.0) * specMap;
          vec3 specularGlint = vec3(1.0, 0.95, 0.85) * spec * max(sunDot, 0.0);

          float diffuse = max(sunDot, 0.0) * 1.05 + 0.03;
          vec3 litDay = dayColor * diffuse + specularGlint;

          vec3 nightColor = texture2D(uNightTexture, vUv).rgb;
          vec3 cityLights = nightColor * vec3(1.4, 1.15, 0.85) * 2.5;

          float twilight = (1.0 - abs(sunDot * 3.5));
          twilight = clamp(twilight, 0.0, 1.0) * (1.0 - dayMix);
          vec3 twilightGlow = vec3(0.96, 0.55, 0.15) * twilight * 0.5;

          vec3 surface = mix(cityLights + twilightGlow, litDay, dayMix);

          float rim = 1.0 - max(dot(normal, viewDir), 0.0);
          float atmosIntensity = pow(rim, 3.2) * (max(sunDot, 0.0) * 0.7 + 0.3);
          vec3 atmosphere = uAtmosphereColor * atmosIntensity * 0.9;

          gl_FragColor = vec4(surface + atmosphere, 1.0);
        }
      `
    });

    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    globeGroup.add(earthMesh);

    // 7. Realistic Global Cloud Layer
    const cloudsGeo = new THREE.SphereGeometry(radius * 1.012, 64, 64);
    const cloudsMat = new THREE.MeshStandardMaterial({
      map: cloudsTexture,
      transparent: true,
      opacity: 0.38,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const cloudsMesh = new THREE.Mesh(cloudsGeo, cloudsMat);
    globeGroup.add(cloudsMesh);

    // 8. Outer Atmospheric Rayleigh Halo
    const haloGeo = new THREE.SphereGeometry(radius * 1.035, 64, 64);
    const haloMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        uniform vec3 uColor;
        void main() {
          float intensity = pow(0.68 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.6);
          gl_FragColor = vec4(uColor, 1.0) * intensity * 0.9;
        }
      `,
      uniforms: {
        uColor: { value: new THREE.Color(0x38bdf8) }
      },
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    globeGroup.add(haloMesh);

    // =========================================================================
    // 9. PHOTOREALISTIC 3D TROPICAL CYCLONE VORTEX (NO MORE WHITE DOTS!)
    // =========================================================================
    const cycloneGroup = new THREE.Group();
    cycloneGroupRef.current = cycloneGroup;
    globeGroup.add(cycloneGroup);

    const eyePos = latLonToVector3(targetLat, targetLon, radius * 1.018);
    cycloneGroup.position.copy(eyePos);
    cycloneGroup.lookAt(eyePos.clone().multiplyScalar(2));

    // Generate high-resolution authentic cyclone cloud texture
    const cycloneTexture = createCycloneTexture();

    // Curved spherical cap geometry matching Earth's radius
    const cycloneGeo = createCurvedCycloneMesh(radius, 0.78);

    // Primary Cyclonic Rainband Disc (Dense, swirling core)
    const cycloneMat1 = new THREE.MeshBasicMaterial({
      map: cycloneTexture,
      transparent: true,
      opacity: 0.95,
      blending: THREE.NormalBlending,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    const cycloneMesh1 = new THREE.Mesh(cycloneGeo, cycloneMat1);
    cycloneMesh1Ref.current = cycloneMesh1;
    cycloneGroup.add(cycloneMesh1);

    // Secondary Upper Troposphere Cirrus Outflow Disc (Soft, parallax rotation)
    const cycloneMat2 = new THREE.MeshBasicMaterial({
      map: cycloneTexture,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    const cycloneMesh2 = new THREE.Mesh(cycloneGeo, cycloneMat2);
    cycloneMesh2.scale.set(1.18, 1.18, 1.18);
    cycloneMesh2.position.z = 0.015;
    cycloneMesh2Ref.current = cycloneMesh2;
    cycloneGroup.add(cycloneMesh2);

    // Center Storm Eye Beacon (High-Tech Satellite LLCC Fix Indicator)
    const beaconGroup = new THREE.Group();
    cycloneGroup.add(beaconGroup);

    // Crisp inner eye target ring
    const eyeRingGeo = new THREE.RingGeometry(0.018, 0.038, 32);
    const eyeRingMat = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95
    });
    const eyeRing = new THREE.Mesh(eyeRingGeo, eyeRingMat);
    beaconGroup.add(eyeRing);

    // Outer pulsing radar alert ring
    const radarPulseGeo = new THREE.RingGeometry(0.045, 0.065, 32);
    const radarPulseMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8
    });
    const radarPulse = new THREE.Mesh(radarPulseGeo, radarPulseMat);
    beaconGroup.add(radarPulse);

    // 10. Natural Sunlight Directional Light & Ambient
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.8);
    dirLight.position.copy(sunDirection.clone().multiplyScalar(10));
    scene.add(dirLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    // 11. Mouse Drag & Touch Rotation with smooth inertia
    const handleMouseDown = (e) => {
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
      velocityRef.current = { x: 0, y: 0 };
    };

    const handleMouseMove = (e) => {
      if (!isDraggingRef.current) return;
      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;

      globeGroup.rotation.y += deltaX * 0.005;
      globeGroup.rotation.x += deltaY * 0.005;
      globeGroup.rotation.x = Math.max(-0.85, Math.min(0.85, globeGroup.rotation.x));

      velocityRef.current = { x: deltaX * 0.005, y: deltaY * 0.005 };
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    const handleTouchStart = (e) => {
      if (e.touches.length === 1) {
        isDraggingRef.current = true;
        previousMousePositionRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        velocityRef.current = { x: 0, y: 0 };
      }
    };

    const handleTouchMove = (e) => {
      if (!isDraggingRef.current || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - previousMousePositionRef.current.x;
      const deltaY = e.touches[0].clientY - previousMousePositionRef.current.y;

      globeGroup.rotation.y += deltaX * 0.007;
      globeGroup.rotation.x += deltaY * 0.007;
      globeGroup.rotation.x = Math.max(-0.85, Math.min(0.85, globeGroup.rotation.x));

      velocityRef.current = { x: deltaX * 0.007, y: deltaY * 0.007 };
      previousMousePositionRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    // Scroll Parallax
    let scrollY = window.scrollY;
    const handleScroll = () => {
      scrollY = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    mount.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    mount.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleMouseUp);

    // 12. Animation Loop: NATURAL EARTH ROTATION + ACTIVE CYCLONIC VORTEX SPIN
    let animationFrameId;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Clouds drift with planetary trade winds
      cloudsMesh.rotation.y += 0.0004;

      // CONTINUOUS NATURAL PLANETARY ROTATION (West to East)
      if (!isDraggingRef.current) {
        if (Math.abs(velocityRef.current.x) > 0.0001) {
          globeGroup.rotation.y += velocityRef.current.x;
          velocityRef.current.x *= 0.92;
        } else {
          globeGroup.rotation.y += 0.0018;
        }

        if (Math.abs(velocityRef.current.y) > 0.0001) {
          globeGroup.rotation.x += velocityRef.current.y;
          velocityRef.current.y *= 0.92;
          globeGroup.rotation.x = Math.max(-0.85, Math.min(0.85, globeGroup.rotation.x));
        }

        // Camera parallax on page scroll
        const scrollTilt = (scrollY * 0.00035);
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, -scrollTilt, 0.05);
      }

      // =======================================================================
      // ACTIVE CYCLONIC VORTEX SPINNING & BILLOWING (Authentic Fluid Motion)
      // =======================================================================
      if (cycloneMesh1Ref.current) {
        // Counter-clockwise cyclonic vortex spin around storm axis
        cycloneMesh1Ref.current.rotation.z -= 0.014;
      }
      if (cycloneMesh2Ref.current) {
        // Upper troposphere cirrus outflow rotates at slightly different rate
        cycloneMesh2Ref.current.rotation.z -= 0.009;
        // Subtle breathing expansion and contraction
        const breathe = 1.15 + Math.sin(elapsedTime * 2.2) * 0.04;
        cycloneMesh2Ref.current.scale.set(breathe, breathe, breathe);
      }

      // Pulse eye radar beacon
      const pulse = 1.0 + Math.sin(elapsedTime * 3.8) * 0.22;
      radarPulse.scale.set(pulse, pulse, pulse);
      radarPulseMat.opacity = 0.85 - (pulse - 1.0) * 1.5;

      renderer.render(scene, camera);
    };

    animate();

    // Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const newWidth = entry.contentRect.width;
        const newHeight = entry.contentRect.height;
        if (newWidth > 0 && newHeight > 0) {
          camera.aspect = newWidth / newHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(newWidth, newHeight);
        }
      }
    });
    resizeObserver.observe(mount);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('scroll', handleScroll);
      mount.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      mount.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
      resizeObserver.disconnect();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
      earthGeo.dispose();
      earthMat.dispose();
      cloudsGeo.dispose();
      cloudsMat.dispose();
      haloGeo.dispose();
      haloMat.dispose();
      cycloneGeo.dispose();
      cycloneMat1.dispose();
      cycloneMat2.dispose();
      cycloneTexture.dispose();
      eyeRingGeo.dispose();
      eyeRingMat.dispose();
      radarPulseGeo.dispose();
      radarPulseMat.dispose();
    };
  }, [targetLat, targetLon, isDark]);

  return (
    <div className="relative w-full h-[520px] sm:h-[580px] lg:h-[620px] flex flex-col items-center justify-between select-none">
      
      {/* Top Floating Telemetry Pills */}
      <div className="w-full flex items-center justify-between px-2 pt-2 z-10 pointer-events-none">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm text-xs space-y-0.5 pointer-events-auto">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span className="font-bold text-slate-950 dark:text-white">{systemName}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 font-semibold">
              Live Cyclone Vortex
            </span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            Coordinates: <strong className="text-slate-800 dark:text-slate-200">{targetLat}°N, {targetLon}°E</strong>
          </div>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm text-xs font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1.5 pointer-events-auto">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{risk} 48h Risk</span>
        </div>
      </div>

      {/* Transparent Three.js Canvas */}
      <div ref={mountRef} className="w-full h-full absolute inset-0 cursor-grab active:cursor-grabbing" />

      {/* Bottom Hint */}
      <div className="w-full pb-2 z-10 pointer-events-none text-center">
        <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium tracking-wide bg-white/60 dark:bg-slate-900/60 backdrop-blur-xs px-3.5 py-1 rounded-full border border-slate-200/60 dark:border-slate-800 shadow-2xs">
          Active Swirling Cyclone Vortex • Natural 3D Earth Rotation
        </span>
      </div>

    </div>
  );
};

export default ThreeCycloneGlobe;
