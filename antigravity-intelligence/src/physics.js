import * as THREE from 'three';
import {
  SingularityParticleShader,
  EventHorizonShader,
  RelativisticJetShader,
  StarfieldBackgroundShader
} from './shaders.js';

export class UniverseSimulation {
  constructor(scene, camera, renderer) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;

    this.currentMode = 'singularity'; // 'singularity' | 'neural' | 'quantum' | 'supernova' | 'warp'
    this.particleCount = 55000;

    // Simulation Physics State
    this.params = {
      gravity: 1.0,        // 0.1 to 5.0
      entropy: 0.15,       // 0.0 to 1.0
      velocity: 0.5,       // 0.0 to 1.0 (Relativistic c fraction)
      timeScale: 1.0,
      autoRotate: true,
      audioReactivity: 0.5
    };

    // Pointer 3D raycast & gravitational target
    this.pointer = new THREE.Vector2(0, 0);
    this.pointer3D = new THREE.Vector3(0, 0, 0);
    this.pointerActive = false;
    this.raycaster = new THREE.Raycaster();
    this.plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

    // Objects references
    this.singularityGroup = new THREE.Group();
    this.neuralGroup = new THREE.Group();
    this.quantumGroup = new THREE.Group();
    this.supernovaGroup = new THREE.Group();
    this.warpGroup = new THREE.Group();
    this.genesisGroup = new THREE.Group();

    this.scene.add(this.singularityGroup);
    this.scene.add(this.neuralGroup);
    this.scene.add(this.quantumGroup);
    this.scene.add(this.supernovaGroup);
    this.scene.add(this.warpGroup);
    this.scene.add(this.genesisGroup);

    this.genesisBodies = [];

    this.initBackground();
    this.initSingularityScene();
    this.initNeuralWebScene();
    this.initQuantumFoamScene();
    this.initSupernovaScene();
    this.initWarpScene();

    this.setMode('singularity');
  }

  initBackground() {
    // Large celestial sphere with custom background shader
    const bgGeo = new THREE.SphereGeometry(600, 32, 32);
    this.bgMaterial = new THREE.ShaderMaterial({
      vertexShader: StarfieldBackgroundShader.vertexShader,
      fragmentShader: StarfieldBackgroundShader.fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uSingularityPos: { value: new THREE.Vector3(0, 0, 0) }
      },
      side: THREE.BackSide,
      depthWrite: false
    });
    const bgMesh = new THREE.Mesh(bgGeo, this.bgMaterial);
    this.scene.add(bgMesh);
  }

  initSingularityScene() {
    // 1. Accretion Disk GPU Particles
    const count = this.particleCount;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const phases = new Float32Array(count);
    const radii = new Float32Array(count);
    const speeds = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Radius distribution: dense near ISCO (Innermost Stable Circular Orbit) ~ 3.0 to outer rim ~ 22.0
      // Inverse square bias for realistic accretion mass density
      const u = Math.random();
      const r = 2.8 + Math.pow(u, 1.8) * 18.0;
      const angle = Math.random() * Math.PI * 2;
      const verticalSpread = (Math.random() - 0.5) * (0.15 + (r / 20.0) * 0.8);

      positions[i * 3 + 0] = r * Math.cos(angle);
      positions[i * 3 + 1] = verticalSpread;
      positions[i * 3 + 2] = r * Math.sin(angle);

      radii[i] = r;
      phases[i] = angle;
      // Keplerian angular velocity omega = sqrt(GM / r^3)
      speeds[i] = (1.8 / Math.pow(r, 1.2)) * (0.85 + Math.random() * 0.3);
      sizes[i] = Math.random() * 2.2 + 0.8;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
    geometry.setAttribute('aOrbitRadius', new THREE.BufferAttribute(radii, 1));
    geometry.setAttribute('aOrbitSpeed', new THREE.BufferAttribute(speeds, 1));

    this.diskUniforms = {
      uTime: { value: 0 },
      uGravity: { value: 1.0 },
      uEntropy: { value: 0.15 },
      uVelocity: { value: 0.5 },
      uPointer: { value: new THREE.Vector3() },
      uPointerActive: { value: 0.0 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 2.0) }
    };

    this.diskMaterial = new THREE.ShaderMaterial({
      vertexShader: SingularityParticleShader.vertexShader,
      fragmentShader: SingularityParticleShader.fragmentShader,
      uniforms: this.diskUniforms,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.accretionDisk = new THREE.Points(geometry, this.diskMaterial);
    this.singularityGroup.add(this.accretionDisk);

    // 2. Central Event Horizon Sphere
    const horizonGeo = new THREE.SphereGeometry(2.5, 64, 64);
    this.horizonMaterial = new THREE.ShaderMaterial({
      vertexShader: EventHorizonShader.vertexShader,
      fragmentShader: EventHorizonShader.fragmentShader,
      uniforms: {
        uTime: { value: 0 }
      },
      transparent: true
    });
    this.eventHorizon = new THREE.Mesh(horizonGeo, this.horizonMaterial);
    this.singularityGroup.add(this.eventHorizon);

    // 3. Relativistic Polar Jets
    const jetGeo = new THREE.CylinderGeometry(0.1, 1.8, 32, 32, 32, true);
    this.jetMaterial = new THREE.ShaderMaterial({
      vertexShader: RelativisticJetShader.vertexShader,
      fragmentShader: RelativisticJetShader.fragmentShader,
      uniforms: {
        uTime: { value: 0 }
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    // North Jet
    this.jetNorth = new THREE.Mesh(jetGeo, this.jetMaterial);
    this.jetNorth.position.y = 16;
    this.singularityGroup.add(this.jetNorth);

    // South Jet
    this.jetSouth = new THREE.Mesh(jetGeo, this.jetMaterial);
    this.jetSouth.position.y = -16;
    this.jetSouth.rotation.x = Math.PI;
    this.singularityGroup.add(this.jetSouth);
  }

  initNeuralWebScene() {
    // 3D Synaptic Cosmic Filament Web
    const nodeCount = 1800;
    const nodeGeo = new THREE.BufferGeometry();
    const nodePositions = new Float32Array(nodeCount * 3);
    const nodeColors = new Float32Array(nodeCount * 3);
    this.neuralNodes = [];

    for (let i = 0; i < nodeCount; i++) {
      // Golden spiral distribution in sphere
      const phi = Math.acos(1 - 2 * (i / nodeCount));
      const theta = Math.sqrt(nodeCount * Math.PI) * phi;
      const radius = 6 + Math.pow(Math.random(), 0.7) * 26;

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta) * 0.7; // slight galactic disc flattening
      const z = radius * Math.cos(phi);

      nodePositions[i * 3 + 0] = x;
      nodePositions[i * 3 + 1] = y;
      nodePositions[i * 3 + 2] = z;

      // Color palette: bio-luminescent emerald, cyan, and violet
      const isViolet = Math.random() > 0.6;
      nodeColors[i * 3 + 0] = isViolet ? 0.7 : 0.1;
      nodeColors[i * 3 + 1] = isViolet ? 0.2 : 0.9;
      nodeColors[i * 3 + 2] = isViolet ? 0.95 : 0.8;

      this.neuralNodes.push(new THREE.Vector3(x, y, z));
    }

    nodeGeo.setAttribute('position', new THREE.BufferAttribute(nodePositions, 3));
    nodeGeo.setAttribute('color', new THREE.BufferAttribute(nodeColors, 3));

    const nodeMat = new THREE.PointsMaterial({
      size: 2.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });
    this.neuralPoints = new THREE.Points(nodeGeo, nodeMat);
    this.neuralGroup.add(this.neuralPoints);

    // Connect close neighbors with filament lines
    const linePositions = [];
    const lineColors = [];
    const maxConnections = 4;
    const maxDist = 7.5;

    for (let i = 0; i < nodeCount; i += 2) {
      let connections = 0;
      for (let j = i + 1; j < nodeCount; j++) {
        const dist = this.neuralNodes[i].distanceTo(this.neuralNodes[j]);
        if (dist < maxDist) {
          linePositions.push(
            this.neuralNodes[i].x, this.neuralNodes[i].y, this.neuralNodes[i].z,
            this.neuralNodes[j].x, this.neuralNodes[j].y, this.neuralNodes[j].z
          );

          const alpha = 1.0 - (dist / maxDist);
          lineColors.push(
            0.15 * alpha, 0.65 * alpha, 0.9 * alpha,
            0.6 * alpha, 0.2 * alpha, 0.85 * alpha
          );

          connections++;
          if (connections >= maxConnections) break;
        }
      }
    }

    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    lineGeo.setAttribute('color', new THREE.Float32BufferAttribute(lineColors, 3));

    const lineMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });

    this.neuralLines = new THREE.LineSegments(lineGeo, lineMat);
    this.neuralGroup.add(this.neuralLines);
  }

  initQuantumFoamScene() {
    // Calabi-Yau / 4D Hypercube Tesseract lattice
    this.quantumLattice = new THREE.Group();
    const resolution = 7000;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(resolution * 3);
    const colors = new Float32Array(resolution * 3);

    this.quantumOriginals = [];

    for (let i = 0; i < resolution; i++) {
      // 4D Clifford Torus projection
      const u = (i / resolution) * Math.PI * 4;
      const v = (i % 64) / 64 * Math.PI * 2;
      const r = 12.0;

      // Projection from R4 to R3
      const x1 = Math.cos(u);
      const y1 = Math.sin(u);
      const x2 = Math.cos(v);
      const y2 = Math.sin(v);

      const x = r * (x1 / (2.2 - y2));
      const y = r * (y1 / (2.2 - y2));
      const z = r * (x2 / (2.2 - y2));

      positions[i * 3 + 0] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      colors[i * 3 + 0] = Math.abs(x1);
      colors[i * 3 + 1] = Math.abs(y1);
      colors[i * 3 + 2] = Math.abs(x2);

      this.quantumOriginals.push({ u, v, r });
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: 1.8,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });

    this.quantumPoints = new THREE.Points(geo, mat);
    this.quantumGroup.add(this.quantumPoints);

    // Glowing nested tesseract wireframe
    const boxGeo1 = new THREE.BoxGeometry(10, 10, 10);
    const edges1 = new THREE.EdgesGeometry(boxGeo1);
    this.tesseractOuter = new THREE.LineSegments(
      edges1,
      new THREE.LineBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.75 })
    );

    const boxGeo2 = new THREE.BoxGeometry(5, 5, 5);
    const edges2 = new THREE.EdgesGeometry(boxGeo2);
    this.tesseractInner = new THREE.LineSegments(
      edges2,
      new THREE.LineBasicMaterial({ color: 0xff00aa, transparent: true, opacity: 0.85 })
    );

    this.quantumGroup.add(this.tesseractOuter);
    this.quantumGroup.add(this.tesseractInner);
  }

  initSupernovaScene() {
    // Exploding stellar core & expanding emission shockwave
    const snCount = 12000;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(snCount * 3);
    const velocities = new Float32Array(snCount * 3);
    const colors = new Float32Array(snCount * 3);

    for (let i = 0; i < snCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const speed = 2.0 + Math.pow(Math.random(), 2.0) * 16.0;

      const vx = Math.sin(phi) * Math.cos(theta) * speed;
      const vy = Math.sin(phi) * Math.sin(theta) * speed;
      const vz = Math.cos(phi) * speed;

      velocities[i * 3 + 0] = vx;
      velocities[i * 3 + 1] = vy;
      velocities[i * 3 + 2] = vz;

      positions[i * 3 + 0] = vx * 0.1;
      positions[i * 3 + 1] = vy * 0.1;
      positions[i * 3 + 2] = vz * 0.1;

      // Color from nuclear white-yellow to intense plasma red/purple
      colors[i * 3 + 0] = 1.0;
      colors[i * 3 + 1] = 0.3 + Math.random() * 0.7;
      colors[i * 3 + 2] = Math.random() * 0.5;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    this.snVelocities = velocities;
    this.snMaterial = new THREE.PointsMaterial({
      size: 2.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });

    this.supernovaPoints = new THREE.Points(geo, this.snMaterial);
    this.supernovaGroup.add(this.supernovaPoints);

    // Central pulsing magnetar
    const pulsarGeo = new THREE.SphereGeometry(1.2, 32, 32);
    const pulsarMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    this.pulsarMesh = new THREE.Mesh(pulsarGeo, pulsarMat);
    this.supernovaGroup.add(this.pulsarMesh);
  }

  initWarpScene() {
    // Relativistic star-streak warp tunnel
    const warpCount = 6000;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(warpCount * 3);
    const colors = new Float32Array(warpCount * 3);
    this.warpStars = [];

    for (let i = 0; i < warpCount; i++) {
      const radius = 2.0 + Math.random() * 35.0;
      const angle = Math.random() * Math.PI * 2;
      const z = (Math.random() - 0.5) * 400.0;

      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);

      positions[i * 3 + 0] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      this.warpStars.push({ x, y, z, baseZ: z, radius, speed: 20 + Math.random() * 40 });

      // Blueshifted center, redshifted periphery
      const normR = radius / 35.0;
      colors[i * 3 + 0] = 0.3 + normR * 0.7;
      colors[i * 3 + 1] = 0.5 + (1.0 - normR) * 0.5;
      colors[i * 3 + 2] = 1.0;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    this.warpMaterial = new THREE.PointsMaterial({
      size: 2.8,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });

    this.warpPoints = new THREE.Points(geo, this.warpMaterial);
    this.warpGroup.add(this.warpPoints);
  }

  setMode(mode) {
    this.currentMode = mode;
    this.singularityGroup.visible = (mode === 'singularity');
    this.neuralGroup.visible = (mode === 'neural');
    this.quantumGroup.visible = (mode === 'quantum');
    this.supernovaGroup.visible = (mode === 'supernova');
    this.warpGroup.visible = (mode === 'warp');

    // Smooth camera transition targeting each mode's best perspective
    if (mode === 'warp') {
      this.camera.position.set(0, 0, 80);
      this.camera.lookAt(0, 0, -200);
    } else if (mode === 'quantum') {
      this.camera.position.set(24, 18, 28);
    } else if (mode === 'neural') {
      this.camera.position.set(30, 20, 35);
    } else {
      this.camera.position.set(0, 16, 38);
    }
  }

  spawnGenesisBody(point, isMassive = false) {
    // Spawns user-created celestial body with orbital velocity
    const color = isMassive ? 0xffaa00 : (Math.random() > 0.5 ? 0x00f0ff : 0xff3388);
    const size = isMassive ? 1.8 : (0.5 + Math.random() * 0.8);
    const geo = new THREE.SphereGeometry(size, 24, 24);
    const mat = new THREE.MeshBasicMaterial({ color });
    const mesh = new THREE.Mesh(geo, mat);

    mesh.position.copy(point);
    this.genesisGroup.add(mesh);

    // Initial tangential velocity for circular orbit around center (0, 0, 0)
    const rVec = new THREE.Vector3(point.x, 0, point.z);
    const r = rVec.length();
    const tangent = new THREE.Vector3(-point.z, 0, point.x).normalize();
    const orbitalSpeed = Math.sqrt((18.0 * this.params.gravity) / Math.max(r, 2.0));
    const velocity = tangent.multiplyScalar(orbitalSpeed);

    // Light trail
    const trailCount = 45;
    const trailPositions = new Float32Array(trailCount * 3);
    for (let i = 0; i < trailCount; i++) {
      trailPositions[i * 3 + 0] = point.x;
      trailPositions[i * 3 + 1] = point.y;
      trailPositions[i * 3 + 2] = point.z;
    }
    const trailGeo = new THREE.BufferGeometry();
    trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
    const trailMat = new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });
    const trail = new THREE.Line(trailGeo, trailMat);
    this.genesisGroup.add(trail);

    this.genesisBodies.push({
      mesh,
      velocity,
      trail,
      trailHistory: [point.clone()],
      mass: isMassive ? 10 : 1,
      alive: true
    });
  }

  updatePointer3D(clientX, clientY) {
    this.pointer.x = (clientX / window.innerWidth) * 2 - 1;
    this.pointer.y = -(clientY / window.innerHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.pointer, this.camera);
    const intersection = new THREE.Vector3();
    this.raycaster.ray.intersectPlane(this.plane, intersection);

    if (intersection) {
      this.pointer3D.copy(intersection);
    }
  }

  update(delta, totalTime, audioSpectrum) {
    const dt = delta * this.params.timeScale;

    // Reactivity to Web Audio FFT
    let bassEnergy = 0;
    let highEnergy = 0;
    if (audioSpectrum && audioSpectrum.length > 0) {
      bassEnergy = (audioSpectrum[2] + audioSpectrum[3] + audioSpectrum[4]) / (3 * 255);
      highEnergy = (audioSpectrum[20] + audioSpectrum[25] + audioSpectrum[30]) / (3 * 255);
    }

    // 1. Singularity updates
    if (this.currentMode === 'singularity') {
      this.diskUniforms.uTime.value = totalTime;
      this.diskUniforms.uGravity.value = this.params.gravity + bassEnergy * 0.3;
      this.diskUniforms.uEntropy.value = this.params.entropy + highEnergy * 0.4;
      this.diskUniforms.uVelocity.value = this.params.velocity;
      this.diskUniforms.uPointer.value.copy(this.pointer3D);
      this.diskUniforms.uPointerActive.value = this.pointerActive ? 1.0 : 0.0;

      this.horizonMaterial.uniforms.uTime.value = totalTime;
      this.jetMaterial.uniforms.uTime.value = totalTime;

      // Event horizon breathing & pulse
      const pulse = 1.0 + Math.sin(totalTime * 4.0) * 0.03 + bassEnergy * 0.12;
      this.eventHorizon.scale.set(pulse, pulse, pulse);
    }

    // 2. Neural Web updates
    if (this.currentMode === 'neural') {
      this.neuralGroup.rotation.y += dt * 0.08;
      this.neuralGroup.rotation.x = Math.sin(totalTime * 0.2) * 0.1;

      // React to pointer
      if (this.pointerActive) {
        this.neuralGroup.position.lerp(
          new THREE.Vector3(this.pointer3D.x * 0.1, this.pointer3D.y * 0.1, 0),
          0.05
        );
      }
    }

    // 3. Quantum Foam / 4D Hypercube updates
    if (this.currentMode === 'quantum') {
      const qPos = this.quantumPoints.geometry.attributes.position.array;
      const count = this.quantumOriginals.length;

      // 4D rotation angle
      const theta4D = totalTime * 0.8 + bassEnergy * 0.5;

      for (let i = 0; i < count; i++) {
        const item = this.quantumOriginals[i];
        const u = item.u + totalTime * 0.2;
        const v = item.v;

        // 4D projection matrix rotation
        const x1 = Math.cos(u) * Math.cos(theta4D) - Math.sin(u) * Math.sin(theta4D);
        const y1 = Math.sin(u) * Math.cos(theta4D) + Math.cos(u) * Math.sin(theta4D);
        const x2 = Math.cos(v);
        const y2 = Math.sin(v);

        const denom = 2.4 - y2;
        qPos[i * 3 + 0] = (item.r * (x1 / denom));
        qPos[i * 3 + 1] = (item.r * (y1 / denom));
        qPos[i * 3 + 2] = (item.r * (x2 / denom));
      }
      this.quantumPoints.geometry.attributes.position.needsUpdate = true;

      this.tesseractOuter.rotation.x = totalTime * 0.4;
      this.tesseractOuter.rotation.y = totalTime * 0.6;
      this.tesseractInner.rotation.x = -totalTime * 0.5;
      this.tesseractInner.rotation.z = totalTime * 0.7;
    }

    // 4. Supernova updates
    if (this.currentMode === 'supernova') {
      const positions = this.supernovaPoints.geometry.attributes.position.array;
      const count = this.snVelocities.length / 3;

      for (let i = 0; i < count; i++) {
        positions[i * 3 + 0] += this.snVelocities[i * 3 + 0] * dt * 0.8;
        positions[i * 3 + 1] += this.snVelocities[i * 3 + 1] * dt * 0.8;
        positions[i * 3 + 2] += this.snVelocities[i * 3 + 2] * dt * 0.8;

        // Cycle back to core if too far
        const distSq = positions[i * 3 + 0] ** 2 + positions[i * 3 + 1] ** 2 + positions[i * 3 + 2] ** 2;
        if (distSq > 3600) {
          positions[i * 3 + 0] = (Math.random() - 0.5) * 1.5;
          positions[i * 3 + 1] = (Math.random() - 0.5) * 1.5;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 1.5;
        }
      }
      this.supernovaPoints.geometry.attributes.position.needsUpdate = true;

      // Pulsar rapid spin (millisecond pulsar effect)
      this.pulsarMesh.rotation.y += dt * 25.0;
      const pScale = 1.0 + Math.sin(totalTime * 30.0) * 0.2 + bassEnergy * 0.4;
      this.pulsarMesh.scale.set(pScale, pScale, pScale);
    }

    // 5. Warp Transit updates
    if (this.currentMode === 'warp') {
      const positions = this.warpPoints.geometry.attributes.position.array;
      const count = this.warpStars.length;
      const speedMultiplier = 1.0 + this.params.velocity * 4.0 + bassEnergy * 2.0;

      for (let i = 0; i < count; i++) {
        const star = this.warpStars[i];
        star.z += star.speed * dt * speedMultiplier;

        if (star.z > 80) {
          star.z = -320;
        }

        positions[i * 3 + 2] = star.z;
      }
      this.warpPoints.geometry.attributes.position.needsUpdate = true;
    }

    // 6. Genesis celestial bodies N-body Newtonian physics
    for (let i = 0; i < this.genesisBodies.length; i++) {
      const b = this.genesisBodies[i];
      if (!b.alive) continue;

      // Gravity towards singularity center (0,0,0)
      const toOrigin = new THREE.Vector3().sub(b.mesh.position);
      const r = toOrigin.length();
      if (r < 2.5) {
        // Absorbed by event horizon!
        this.genesisGroup.remove(b.mesh);
        this.genesisGroup.remove(b.trail);
        b.alive = false;
        continue;
      }

      const accel = toOrigin.normalize().multiplyScalar((18.0 * this.params.gravity) / (r * r));
      b.velocity.addScaledVector(accel, dt);
      b.mesh.position.addScaledVector(b.velocity, dt);

      // Update light trail
      b.trailHistory.unshift(b.mesh.position.clone());
      if (b.trailHistory.length > 45) b.trailHistory.pop();

      const trailArr = b.trail.geometry.attributes.position.array;
      for (let j = 0; j < b.trailHistory.length; j++) {
        trailArr[j * 3 + 0] = b.trailHistory[j].x;
        trailArr[j * 3 + 1] = b.trailHistory[j].y;
        trailArr[j * 3 + 2] = b.trailHistory[j].z;
      }
      b.trail.geometry.attributes.position.needsUpdate = true;
    }

    // Clean up dead genesis bodies
    this.genesisBodies = this.genesisBodies.filter(b => b.alive);

    // Background update
    this.bgMaterial.uniforms.uTime.value = totalTime;
  }
}
