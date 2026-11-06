import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { Sparkles } from 'lucide-react';

/**
 * Converts Latitude and Longitude to 3D Cartesian coordinates on a sphere of radius R.
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
 * Generates an authentic, high-resolution satellite cloud vortex texture.
 * Features:
 * - A sharp, calm eye at the center
 * - High-density convective eyewall ring
 * - Multi-branched logarithmic spiral rainbands with fibrous cirrus wisps
 * - Fine alpha transparency so underlying coastlines and bathymetry remain visible
 */
function createRealisticCycloneTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  const cx = 512;
  const cy = 512;

  ctx.clearRect(0, 0, 1024, 1024);

  // Helper: Soft feathered cloud fleck
  function drawCloudFleck(x, y, r, opacity, rCol = 255, gCol = 255, bCol = 255) {
    if (r <= 0 || opacity <= 0) return;
    const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, `rgba(${rCol}, ${gCol}, ${bCol}, ${opacity})`);
    grad.addColorStop(0.35, `rgba(${rCol}, ${gCol}, ${bCol}, ${opacity * 0.75})`);
    grad.addColorStop(0.75, `rgba(${rCol}, ${gCol}, ${bCol}, ${opacity * 0.25})`);
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // 1. Central Dense Overcast (CDO) Core Convection
  for (let i = 0; i < 350; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = 22 + Math.random() * 85;
    const x = cx + Math.cos(angle) * dist;
    const y = cy + Math.sin(angle) * dist;
    const puffRadius = 14 + Math.random() * 26;
    drawCloudFleck(x, y, puffRadius, 0.45 + Math.random() * 0.4);
  }

  // 2. Dense Eyewall Ring (Peak reflectivity zone)
  for (let a = 0; a < Math.PI * 2; a += 0.04) {
    const jitter = Math.sin(a * 5) * 3 + (Math.random() - 0.5) * 4;
    const r = 32 + jitter;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    drawCloudFleck(x, y, 16 + Math.random() * 8, 0.75 + Math.random() * 0.2);
  }

  // 3. Multi-branch Logarithmic Spiral Rainbands (6 distinct feeder arms)
  const numArms = 6;
  const armOffsets = Array.from({ length: numArms }, (_, idx) => (idx * Math.PI * 2) / numArms);

  armOffsets.forEach((offset, armIdx) => {
    const isMajorArm = armIdx % 2 === 0;
    const totalSteps = isMajorArm ? 280 : 180;
    const maxTheta = isMajorArm ? Math.PI * 3.4 : Math.PI * 2.2;
    const b = 0.26; // Spiral expansion rate
    const a = 28 + armIdx * 3;

    for (let step = 0; step < totalSteps; step++) {
      const t = step / totalSteps;
      const theta = t * maxTheta;
      const armAngle = theta + offset;
      const r = a * Math.exp(b * theta);

      if (r > 470) break;

      const x = cx + Math.cos(armAngle) * r;
      const y = cy + Math.sin(armAngle) * r;

      // Realistic cloud sizing and soft opacity falloff
      const puffR = 12 + t * 32;
      const opacity = (1.0 - t * 0.72) * (isMajorArm ? 0.55 : 0.35) * (0.7 + Math.random() * 0.3);

      drawCloudFleck(x, y, puffR, opacity, 255, 255, 255);

      // Fine turbulent secondary wisps
      if (step % 2 === 0) {
        const perpAngle = armAngle + Math.PI * 0.5 + (Math.random() - 0.5) * 0.5;
        const perpDist = (Math.random() - 0.5) * (10 + t * 30);
        drawCloudFleck(
          x + Math.cos(perpAngle) * perpDist,
          y + Math.sin(perpAngle) * perpDist,
          puffR * 0.65,
          opacity * 0.5,
          245, 250, 255
        );
      }
    }
  });

  // 4. Outflow Cirrus Feathers (Anti-cyclonic divergence wisps)
  for (let i = 0; i < 180; i++) {
    const angle = Math.random() * Math.PI * 2;
    const r = 240 + Math.random() * 220;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    drawCloudFleck(x, y, 22 + Math.random() * 32, 0.12 + Math.random() * 0.15, 240, 248, 255);
  }

  // 5. Clean, Transparent Calm Eye
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  const eyeGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 22);
  eyeGrad.addColorStop(0, 'rgba(0, 0, 0, 1.0)');
  eyeGrad.addColorStop(0.65, 'rgba(0, 0, 0, 0.85)');
  eyeGrad.addColorStop(0.9, 'rgba(0, 0, 0, 0.3)');
  eyeGrad.addColorStop(1, 'rgba(0, 0, 0, 0.0)');
  ctx.fillStyle = eyeGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  return texture;
}

/**
 * Creates a circular mesh deformed to accurately conform to the sphere curvature of radius R.
 */
function createCurvedCycloneMesh(sphereRadius, meshRadius = 0.28) {
  const geo = new THREE.CircleGeometry(meshRadius, 64);
  const pos = geo.attributes.position;

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const distSq = x * x + y * y;
    if (distSq < sphereRadius * sphereRadius) {
      const z = -(sphereRadius - Math.sqrt(sphereRadius * sphereRadius - distSq));
      pos.setZ(i, z);
    }
  }
  geo.computeVertexNormals();
  return geo;
}

const ThreeCycloneGlobe = ({ 
  targetLat = 16.4, 
  targetLon = 81.8, 
  systemName = "Cyclone ARNAB", 
  category = "Extremely Severe Cyclonic Storm",
  risk = "100%",
  isDark = false,
  className = "relative w-full h-[480px] sm:h-[520px] lg:h-[560px] flex flex-col items-center justify-between select-none",
  autoRotate = true,
  enableWheelZoom = true,
  cameraDistance = 5.8,
  zoomStep = 0,
  showCyclone = true,
  showTelemetry = false
}) => {
  const mountRef = useRef(null);
  const [hasWebGLError, setHasWebGLError] = useState(false);
  const globeGroupRef = useRef(null);
  const cycloneGroupRef = useRef(null);
  const cycloneMesh1Ref = useRef(null);
  const cycloneMesh2Ref = useRef(null);
  const cameraRef = useRef(null);
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const velocityRef = useRef({ x: 0, y: 0 });

  // Update cyclone mesh position and orientation when target coordinates change
  useEffect(() => {
    if (cycloneGroupRef.current) {
      const radius = 1.95;
      const eyePos = latLonToVector3(targetLat, targetLon, radius * 1.012);
      cycloneGroupRef.current.position.copy(eyePos);
      cycloneGroupRef.current.lookAt(eyePos.clone().multiplyScalar(2));
      cycloneGroupRef.current.visible = showCyclone;
    }

    if (globeGroupRef.current) {
      // Smoothly orient globe so target coordinates are centered towards camera
      const targetY = -((targetLon + 90) * Math.PI) / 180;
      const targetX = (targetLat * Math.PI) / 180 * 0.45;
      globeGroupRef.current.rotation.x = targetX;
      globeGroupRef.current.rotation.y = targetY;
    }
  }, [targetLat, targetLon, showCyclone]);

  // Adjust zoom when cameraDistance or zoomStep changes
  useEffect(() => {
    if (cameraRef.current) {
      cameraRef.current.position.z = Math.max(3.6, Math.min(9.0, cameraDistance - zoomStep * 0.6));
    }
  }, [cameraDistance, zoomStep]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 500;
    const height = mount.clientHeight || 500;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 1000);
    camera.position.z = Math.max(3.6, Math.min(9.0, cameraDistance - zoomStep * 0.6));
    cameraRef.current = camera;

    // 2. Alpha Transparent WebGL Renderer with High Dynamic Range
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true, 
        powerPreference: 'high-performance' 
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.35;
      mount.appendChild(renderer.domElement);
    } catch (e) {
      console.warn('WebGL context creation failed, using 2D fallback:', e);
      setHasWebGLError(true);
      return;
    }

    // 3. Subtle Deep Space Starfield (Microscopic star particles)
    const starGeo = new THREE.BufferGeometry();
    const starCount = 350;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 80;
      starPositions[i + 1] = (Math.random() - 0.5) * 80;
      starPositions[i + 2] = -15 - Math.random() * 40;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0x94a3b8,
      size: 0.8,
      transparent: true,
      opacity: 0.65
    });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // 4. Globe Parent Group
    const globeGroup = new THREE.Group();
    globeGroupRef.current = globeGroup;
    scene.add(globeGroup);

    // Orient toward target lat/lon
    const initialY = -((targetLon + 90) * Math.PI) / 180;
    const initialX = (targetLat * Math.PI) / 180 * 0.45;
    globeGroup.rotation.x = initialX;
    globeGroup.rotation.y = initialY;

    const radius = 1.95;

    // 5. High-Resolution NASA Earth Textures
    const textureLoader = new THREE.TextureLoader();
    const dayTexture = textureLoader.load('/textures/earth_day.jpg');
    const nightTexture = textureLoader.load('/textures/earth_night.png');
    const specularTexture = textureLoader.load('/textures/earth_specular.jpg');
    const cloudsTexture = textureLoader.load('/textures/earth_clouds.png');

    dayTexture.colorSpace = THREE.SRGBColorSpace;
    nightTexture.colorSpace = THREE.SRGBColorSpace;

    // 6. Sunlight Direction: Directly on the front-facing camera axis to illuminate India and the Bay of Bengal in full, brilliant daylight
    const sunDirection = new THREE.Vector3(0.08, 0.05, 1.0).normalize();

    // 7. Day & Night Earth Shader
    const earthUniforms = {
      uDayTexture: { value: dayTexture },
      uNightTexture: { value: nightTexture },
      uSpecularMap: { value: specularTexture },
      uSunDirection: { value: sunDirection },
      uAtmosphereColor: { value: new THREE.Color(0x38bdf8) },
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
          float dayMix = smoothstep(-0.15, 0.15, sunDot);

          vec3 dayColor = texture2D(uDayTexture, vUv).rgb;

          float specMap = texture2D(uSpecularMap, vUv).r;
          vec3 reflectDir = reflect(-sunDir, normal);
          float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0) * specMap;
          vec3 specularGlint = vec3(1.0, 0.96, 0.90) * spec * max(sunDot, 0.0);

          // Generous ambient & direct illumination so geography is crystal clear
          float diffuse = max(sunDot, 0.0) * 1.1 + 0.35;
          vec3 litDay = dayColor * diffuse + specularGlint;

          vec3 nightColor = texture2D(uNightTexture, vUv).rgb;
          vec3 cityLights = nightColor * vec3(1.4, 1.15, 0.85) * 2.2;

          vec3 surface = mix(cityLights, litDay, dayMix);

          // Subtle atmospheric edge rim scattering
          float rim = 1.0 - max(dot(normal, viewDir), 0.0);
          float atmosIntensity = pow(rim, 3.2) * (max(sunDot, 0.0) * 0.75 + 0.35);
          vec3 atmosphere = uAtmosphereColor * atmosIntensity * 0.85;

          gl_FragColor = vec4(surface + atmosphere, 1.0);
        }
      `
    });

    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    globeGroup.add(earthMesh);

    // 8. Global Atmospheric Cloud Layer
    const cloudsGeo = new THREE.SphereGeometry(radius * 1.010, 64, 64);
    const cloudsMat = new THREE.MeshStandardMaterial({
      map: cloudsTexture,
      transparent: true,
      opacity: 0.32,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const cloudsMesh = new THREE.Mesh(cloudsGeo, cloudsMat);
    globeGroup.add(cloudsMesh);

    // 9. Rayleigh Atmospheric Halo (Cyan/Blue Rim)
    const haloGeo = new THREE.SphereGeometry(radius * 1.032, 64, 64);
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
          float intensity = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.8);
          gl_FragColor = vec4(uColor, 1.0) * intensity * 0.85;
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
    // 10. REALISTIC METEOROLOGICAL TROPICAL CYCLONE (PROPORTIONED AT 0.28 RADIUS)
    // =========================================================================
    const cycloneGroup = new THREE.Group();
    cycloneGroupRef.current = cycloneGroup;
    globeGroup.add(cycloneGroup);

    const eyePos = latLonToVector3(targetLat, targetLon, radius * 1.014);
    cycloneGroup.position.copy(eyePos);
    cycloneGroup.lookAt(eyePos.clone().multiplyScalar(2));

    // High-resolution realistic satellite cloud texture
    const cycloneTexture = createRealisticCycloneTexture();

    // Curved spherical cap mesh (0.28 radius accurately covers ~800 km diameter)
    const cycloneGeo = createCurvedCycloneMesh(radius, 0.28);

    // Primary Cyclonic Cloud Mesh (Dense swirling vortex)
    const cycloneMat1 = new THREE.MeshBasicMaterial({
      map: cycloneTexture,
      transparent: true,
      opacity: 0.92,
      blending: THREE.NormalBlending,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    const cycloneMesh1 = new THREE.Mesh(cycloneGeo, cycloneMat1);
    cycloneMesh1Ref.current = cycloneMesh1;
    cycloneGroup.add(cycloneMesh1);

    // Secondary Upper Troposphere Cirrus Mesh (Soft parallax rotation)
    const cycloneMat2 = new THREE.MeshBasicMaterial({
      map: cycloneTexture,
      transparent: true,
      opacity: 0.42,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    const cycloneMesh2 = new THREE.Mesh(cycloneGeo, cycloneMat2);
    cycloneMesh2.scale.set(1.15, 1.15, 1.15);
    cycloneMesh2.position.z = 0.008;
    cycloneMesh2Ref.current = cycloneMesh2;
    cycloneGroup.add(cycloneMesh2);

    // =========================================================================
    // 11. TACTICAL METEOROLOGICAL ISOTACH OVERLAY (IMD RSMC / JTWC COMMAND CENTER)
    // =========================================================================
    const overlayGroup = new THREE.Group();
    cycloneGroup.add(overlayGroup);
    overlayGroup.position.z = 0.012;

    // Helper: Fine Hairline Ring
    function createHairlineRing(innerR, outerR, colorHex, opacityVal) {
      const geo = new THREE.RingGeometry(innerR, outerR, 64);
      const mat = new THREE.MeshBasicMaterial({
        color: colorHex,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: opacityVal,
        depthWrite: false
      });
      return new THREE.Mesh(geo, mat);
    }

    // Isotach 1: 64 kt Hurricane Core / Radius of Maximum Wind (Crimson)
    const ring64kt = createHairlineRing(0.046, 0.050, 0xef4444, 0.85);
    overlayGroup.add(ring64kt);

    // Isotach 2: 50 kt Storm Force Wind Radius (Amber)
    const ring50kt = createHairlineRing(0.092, 0.096, 0xf59e0b, 0.70);
    overlayGroup.add(ring50kt);

    // Isotach 3: 34 kt Gale Force Outer Perimeter (Cyan)
    const ring34kt = createHairlineRing(0.160, 0.164, 0x38bdf8, 0.55);
    overlayGroup.add(ring34kt);

    // Precision Targeting Crosshairs at Eye
    const crosshairMat = new THREE.LineBasicMaterial({ 
      color: 0xef4444, 
      transparent: true, 
      opacity: 0.9 
    });

    const crosshairGeo1 = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-0.022, 0, 0),
      new THREE.Vector3(-0.006, 0, 0)
    ]);
    const crosshairGeo2 = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0.006, 0, 0),
      new THREE.Vector3(0.022, 0, 0)
    ]);
    const crosshairGeo3 = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, -0.022, 0),
      new THREE.Vector3(0, -0.006, 0)
    ]);
    const crosshairGeo4 = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0.006, 0),
      new THREE.Vector3(0, 0.022, 0)
    ]);

    overlayGroup.add(new THREE.Line(crosshairGeo1, crosshairMat));
    overlayGroup.add(new THREE.Line(crosshairGeo2, crosshairMat));
    overlayGroup.add(new THREE.Line(crosshairGeo3, crosshairMat));
    overlayGroup.add(new THREE.Line(crosshairGeo4, crosshairMat));

    // Dynamic Pulsing Doppler Radar Ping Ring
    const radarPulseGeo = new THREE.RingGeometry(0.012, 0.016, 48);
    const radarPulseMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.75,
      depthWrite: false
    });
    const radarPulse = new THREE.Mesh(radarPulseGeo, radarPulseMat);
    overlayGroup.add(radarPulse);

    // 12. Directional & Ambient Lighting
    const dirLight = new THREE.DirectionalLight(0xffffff, 2.0);
    dirLight.position.copy(sunDirection.clone().multiplyScalar(10));
    scene.add(dirLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(ambientLight);

    // 13. Interactive Mouse Drag & Touch Rotation
    const handleMouseDown = (e) => {
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
      velocityRef.current = { x: 0, y: 0 };
    };

    const handleMouseMove = (e) => {
      if (!isDraggingRef.current) return;
      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;

      globeGroup.rotation.y += deltaX * 0.004;
      globeGroup.rotation.x += deltaY * 0.004;
      globeGroup.rotation.x = Math.max(-0.85, Math.min(0.85, globeGroup.rotation.x));

      velocityRef.current = { x: deltaX * 0.004, y: deltaY * 0.004 };
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

      globeGroup.rotation.y += deltaX * 0.006;
      globeGroup.rotation.x += deltaY * 0.006;
      globeGroup.rotation.x = Math.max(-0.85, Math.min(0.85, globeGroup.rotation.x));

      velocityRef.current = { x: deltaX * 0.006, y: deltaY * 0.006 };
      previousMousePositionRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    // Wheel Zoom Support
    const handleWheel = (e) => {
      if (!enableWheelZoom) return;
      e.preventDefault();
      camera.position.z = Math.max(3.6, Math.min(9.0, camera.position.z + e.deltaY * 0.003));
    };

    mount.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    mount.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleMouseUp);
    mount.addEventListener('wheel', handleWheel, { passive: false });

    // 14. 60 FPS Animation Loop
    let animationFrameId;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Atmospheric cloud drift
      cloudsMesh.rotation.y += 0.0003;

      // Natural Planetary Rotation
      if (!isDraggingRef.current) {
        if (Math.abs(velocityRef.current.x) > 0.0001) {
          globeGroup.rotation.y += velocityRef.current.x;
          velocityRef.current.x *= 0.92;
        } else if (autoRotate) {
          globeGroup.rotation.y += 0.0012;
        }

        if (Math.abs(velocityRef.current.y) > 0.0001) {
          globeGroup.rotation.x += velocityRef.current.y;
          velocityRef.current.y *= 0.92;
          globeGroup.rotation.x = Math.max(-0.85, Math.min(0.85, globeGroup.rotation.x));
        }
      }

      // Realistic Counter-Clockwise Cyclonic Vortex Rotation
      if (cycloneMesh1Ref.current && showCyclone) {
        cycloneMesh1Ref.current.rotation.z -= 0.012;
      }
      if (cycloneMesh2Ref.current && showCyclone) {
        cycloneMesh2Ref.current.rotation.z -= 0.007;
        const breathe = 1.12 + Math.sin(elapsedTime * 2.0) * 0.03;
        cycloneMesh2Ref.current.scale.set(breathe, breathe, breathe);
      }

      // Animated Doppler Radar Ping Wave Expansion
      const pulseProgress = (elapsedTime * 0.6) % 1.0;
      const pulseScale = 1.0 + pulseProgress * 9.5;
      radarPulse.scale.set(pulseScale, pulseScale, pulseScale);
      radarPulseMat.opacity = Math.max(0, 0.75 * (1.0 - pulseProgress));

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
      mount.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      mount.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
      mount.removeEventListener('wheel', handleWheel);
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
      starGeo.dispose();
      starMat.dispose();
      radarPulseGeo.dispose();
      radarPulseMat.dispose();
    };
  }, [targetLat, targetLon, isDark, autoRotate, enableWheelZoom, showCyclone]);

  if (hasWebGLError) {
    return (
      <div className={`${className} bg-radial from-slate-900 via-zinc-950 to-black flex items-center justify-center p-6 text-center select-none`}>
        <div className="space-y-3">
          <div className="w-16 h-16 rounded-full border border-sky-500/40 bg-sky-500/10 flex items-center justify-center mx-auto relative">
            <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
            <span className="absolute inset-0 rounded-full border border-red-500/50 animate-ping" />
          </div>
          <div className="space-y-1">
            <div className="font-mono text-xs text-white uppercase font-bold tracking-wider">
              {systemName} • Doppler Satellite View
            </div>
            <div className="font-mono text-[11px] text-zinc-400">
              Vortex Fix: {targetLat}°N, {targetLon}°E
            </div>
          </div>
          <div className="text-[10px] font-mono text-zinc-500 max-w-xs mx-auto">
            Tactical 2D Doppler radar telemetry mode active.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Transparent Three.js WebGL Canvas */}
      <div ref={mountRef} className="w-full h-full absolute inset-0 cursor-grab active:cursor-grabbing" />
    </div>
  );
};

export default ThreeCycloneGlobe;
