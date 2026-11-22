import * as THREE from 'three';
import {
  SingularityParticleShader,
  AttractorParticleShader,
  EventHorizonShader,
  RelativisticJetShader,
  StarfieldBackgroundShader
} from './shaders.js';
import { audioEngine } from './audio.js';

export class TranscendentSimulation {
  constructor(scene, camera, renderer) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;

    this.currentMode = 'singularity'; // 'singularity' | 'aizawa' | 'lorenz' | 'thomas' | 'neural' | 'warp'
    this.particleCount = 70000;

    // Simulation Physics State
    this.params = {
      gravity: 1.0,
      entropy: 0.15,
      velocity: 0.5,
      timeScale: 1.0,
      audioReactivity: 0.5
    };

    // Dive / Geodesic Plunge State
    this.isDiving = false;
    this.diveProgress = 0;
    this.diveDuration = 8.5; // seconds

    // Pointer Raycast
    this.pointer = new THREE.Vector2(0, 0);
    this.pointer3D = new THREE.Vector3(0, 0, 0);
    this.pointerActive = false;
    this.raycaster = new THREE.Raycaster();
    this.plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

    // Groups
    this.singularityGroup = new THREE.Group();
    this.attractorGroup = new THREE.Group();
    this.neuralGroup = new THREE.Group();
    this.warpGroup = new THREE.Group();
    this.genesisGroup = new THREE.Group();

    this.scene.add(this.singularityGroup);
    this.scene.add(this.attractorGroup);
    this.scene.add(this.neuralGroup);
    this.scene.add(this.warpGroup);
    this.scene.add(this.genesisGroup);

    this.genesisBodies = [];

    this.initBackground();
    this.initSingularityScene();
    this.initAttractorScene();
    this.initNeuralWebScene();
    this.initWarpScene();

    this.setMode('singularity');
  }

  initBackground() {
    const bgGeo = new THREE.SphereGeometry(650, 32, 32);
    this.bgMaterial = new THREE.ShaderMaterial({
      vertexShader: StarfieldBackgroundShader.vertexShader,
      fragmentShader: StarfieldBackgroundShader.fragmentShader,
      uniforms: {
        uTime: { value: 0 }
      },
      side: THREE.BackSide,
      depthWrite: false
    });
    const bgMesh = new THREE.Mesh(bgGeo, this.bgMaterial);
    this.scene.add(bgMesh);
  }

  initSingularityScene() {
    const count = 55000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const phases = new Float32Array(count);
    const radii = new Float32Array(count);
    const speeds = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const u = Math.random();
      const r = 2.8 + Math.pow(u, 1.8) * 19.0;
      const angle = Math.random() * Math.PI * 2;
      const verticalSpread = (Math.random() - 0.5) * (0.12 + (r / 20.0) * 0.85);

      positions[i * 3 + 0] = r * Math.cos(angle);
      positions[i * 3 + 1] = verticalSpread;
      positions[i * 3 + 2] = r * Math.sin(angle);

      radii[i] = r;
      phases[i] = angle;
      speeds[i] = (1.8 / Math.pow(r, 1.25)) * (0.85 + Math.random() * 0.3);
      sizes[i] = Math.random() * 2.4 + 0.8;
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
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 2.0) },
      uAudioEnergy: { value: 0.0 }
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

    // Event Horizon Sphere
    const horizonGeo = new THREE.SphereGeometry(2.5, 64, 64);
    this.horizonMaterial = new THREE.ShaderMaterial({
      vertexShader: EventHorizonShader.vertexShader,
      fragmentShader: EventHorizonShader.fragmentShader,
      uniforms: { uTime: { value: 0 } },
      transparent: true
    });
    this.eventHorizon = new THREE.Mesh(horizonGeo, this.horizonMaterial);
    this.singularityGroup.add(this.eventHorizon);

    // Relativistic Polar Jets
    const jetGeo = new THREE.CylinderGeometry(0.12, 1.9, 34, 32, 32, true);
    this.jetMaterial = new THREE.ShaderMaterial({
      vertexShader: RelativisticJetShader.vertexShader,
      fragmentShader: RelativisticJetShader.fragmentShader,
      uniforms: { uTime: { value: 0 } },
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    this.jetNorth = new THREE.Mesh(jetGeo, this.jetMaterial);
    this.jetNorth.position.y = 17;
    this.singularityGroup.add(this.jetNorth);

    this.jetSouth = new THREE.Mesh(jetGeo, this.jetMaterial);
    this.jetSouth.position.y = -17;
    this.jetSouth.rotation.x = Math.PI;
    this.singularityGroup.add(this.jetSouth);
  }

  initAttractorScene() {
    // High-performance Strange Attractor differential simulation
    const count = this.particleCount;
    this.attractorGeo = new THREE.BufferGeometry();

    const positions = new Float32Array(count * 3);
    const targetPositions = new Float32Array(count * 3);
    const ids = new Float32Array(count);

    // Generate initial attractor point positions (Aizawa Attractor)
    this.generateAttractorPoints('aizawa', positions);
    this.generateAttractorPoints('lorenz', targetPositions);

    for (let i = 0; i < count; i++) {
      ids[i] = i / count;
    }

    this.attractorGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.attractorGeo.setAttribute('aTargetPos', new THREE.BufferAttribute(targetPositions, 3));
    this.attractorGeo.setAttribute('aId', new THREE.BufferAttribute(ids, 1));

    this.attractorUniforms = {
      uTime: { value: 0 },
      uPointSize: { value: 2.2 },
      uMorph: { value: 0.0 },
      uColorA: { value: new THREE.Color(0x00f0ff) },
      uColorB: { value: new THREE.Color(0xff00aa) },
      uColorC: { value: new THREE.Color(0xffaa00) },
      uPointer: { value: new THREE.Vector3() },
      uPointerActive: { value: 0.0 },
      uAudioEnergy: { value: 0.0 }
    };

    this.attractorMat = new THREE.ShaderMaterial({
      vertexShader: AttractorParticleShader.vertexShader,
      fragmentShader: AttractorParticleShader.fragmentShader,
      uniforms: this.attractorUniforms,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.attractorPoints = new THREE.Points(this.attractorGeo, this.attractorMat);
    this.attractorGroup.add(this.attractorPoints);
  }

  generateAttractorPoints(type, buffer) {
    const count = this.particleCount;
    let x = 0.1, y = 0.0, z = 0.0;
    const dt = 0.01;

    for (let i = 0; i < count; i++) {
      // Numerical integration of differential equations
      if (type === 'aizawa') {
        // Aizawa Attractor (Cosmic tornado / spiral core)
        const a = 0.95, b = 0.7, c = 0.6, d = 3.5, e = 0.25, f = 0.1;
        const dx = (z - b) * x - d * y;
        const dy = d * x + (z - b) * y;
        const dz = c + a * z - (z * z * z) / 3.0 - (x * x + y * y) * (1.0 + e * z) + f * z * (x * x * x);

        x += dx * dt;
        y += dy * dt;
        z += dz * dt;

        buffer[i * 3 + 0] = x * 14.0;
        buffer[i * 3 + 1] = (z - 0.7) * 14.0;
        buffer[i * 3 + 2] = y * 14.0;

      } else if (type === 'lorenz') {
        // Lorenz Attractor (Butterfly of chaos)
        const sigma = 10.0, rho = 28.0, beta = 8.0 / 3.0;
        const dx = sigma * (y - x);
        const dy = x * (rho - z) - y;
        const dz = x * y - beta * z;

        x += dx * 0.005;
        y += dy * 0.005;
        z += dz * 0.005;

        buffer[i * 3 + 0] = x * 0.85;
        buffer[i * 3 + 1] = (z - 25.0) * 0.85;
        buffer[i * 3 + 2] = y * 0.85;

      } else if (type === 'thomas') {
        // Thomas Cyclically Symmetric Quantum Attractor
        const b = 0.208186;
        const dx = Math.sin(y) - b * x;
        const dy = Math.sin(z) - b * y;
        const dz = Math.sin(x) - b * z;

        x += dx * 0.04;
        y += dy * 0.04;
        z += dz * 0.04;

        buffer[i * 3 + 0] = x * 6.5;
        buffer[i * 3 + 1] = y * 6.5;
        buffer[i * 3 + 2] = z * 6.5;

      } else if (type === 'halvorsen') {
        // Halvorsen 3-lobed Attractor
        const a = 1.89;
        const dx = -a * x - 4 * y - 4 * z - y * y;
        const dy = -a * y - 4 * z - 4 * x - z * z;
        const dz = -a * z - 4 * x - 4 * y - x * x;

        x += dx * 0.008;
        y += dy * 0.008;
        z += dz * 0.008;

        buffer[i * 3 + 0] = x * 1.8;
        buffer[i * 3 + 1] = y * 1.8;
        buffer[i * 3 + 2] = z * 1.8;
      }
    }
  }

  morphToAttractor(attractorType, colorA = 0x00f0ff, colorB = 0xff00aa, colorC = 0xffaa00) {
    const curPos = this.attractorGeo.attributes.position.array;
    const targetPos = this.attractorGeo.attributes.aTargetPos.array;

    // Current displayed pos becomes base
    for (let i = 0; i < curPos.length; i++) {
      curPos[i] = targetPos[i];
    }
    this.attractorGeo.attributes.position.needsUpdate = true;

    // Generate new target positions
    this.generateAttractorPoints(attractorType, targetPos);
    this.attractorGeo.attributes.aTargetPos.needsUpdate = true;

    // Reset morph interpolation
    this.attractorUniforms.uMorph.value = 0.0;
    this.attractorUniforms.uColorA.value.set(colorA);
    this.attractorUniforms.uColorB.value.set(colorB);
    this.attractorUniforms.uColorC.value.set(colorC);
  }

  initNeuralWebScene() {
    const nodeCount = 2000;
    const nodeGeo = new THREE.BufferGeometry();
    const nodePositions = new Float32Array(nodeCount * 3);
    const nodeColors = new Float32Array(nodeCount * 3);
    this.neuralNodes = [];

    for (let i = 0; i < nodeCount; i++) {
      const phi = Math.acos(1 - 2 * (i / nodeCount));
      const theta = Math.sqrt(nodeCount * Math.PI) * phi;
      const radius = 6 + Math.pow(Math.random(), 0.7) * 28;

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta) * 0.65;
      const z = radius * Math.cos(phi);

      nodePositions[i * 3 + 0] = x;
      nodePositions[i * 3 + 1] = y;
      nodePositions[i * 3 + 2] = z;

      const isEmerald = Math.random() > 0.45;
      nodeColors[i * 3 + 0] = isEmerald ? 0.0 : 0.8;
      nodeColors[i * 3 + 1] = isEmerald ? 0.95 : 0.2;
      nodeColors[i * 3 + 2] = isEmerald ? 0.85 : 0.95;

      this.neuralNodes.push(new THREE.Vector3(x, y, z));
    }

    nodeGeo.setAttribute('position', new THREE.BufferAttribute(nodePositions, 3));
    nodeGeo.setAttribute('color', new THREE.BufferAttribute(nodeColors, 3));

    const nodeMat = new THREE.PointsMaterial({
      size: 2.4,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });
    this.neuralPoints = new THREE.Points(nodeGeo, nodeMat);
    this.neuralGroup.add(this.neuralPoints);

    // Filament lines
    const linePositions = [];
    const lineColors = [];
    const maxConnections = 4;
    const maxDist = 7.8;

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
            0.1 * alpha, 0.75 * alpha, 0.9 * alpha,
            0.7 * alpha, 0.2 * alpha, 0.85 * alpha
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

  initWarpScene() {
    const warpCount = 6500;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(warpCount * 3);
    const colors = new Float32Array(warpCount * 3);
    this.warpStars = [];

    for (let i = 0; i < warpCount; i++) {
      const radius = 2.0 + Math.random() * 38.0;
      const angle = Math.random() * Math.PI * 2;
      const z = (Math.random() - 0.5) * 450.0;

      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);

      positions[i * 3 + 0] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      this.warpStars.push({ x, y, z, baseZ: z, radius, speed: 25 + Math.random() * 45 });

      const normR = radius / 38.0;
      colors[i * 3 + 0] = 0.2 + normR * 0.8;
      colors[i * 3 + 1] = 0.6 + (1.0 - normR) * 0.4;
      colors[i * 3 + 2] = 1.0;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    this.warpMaterial = new THREE.PointsMaterial({
      size: 3.0,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending
    });

    this.warpPoints = new THREE.Points(geo, this.warpMaterial);
    this.warpGroup.add(this.warpPoints);
  }

  setMode(mode) {
    this.currentMode = mode;
    const isAttractor = ['aizawa', 'lorenz', 'thomas', 'halvorsen'].includes(mode);

    this.singularityGroup.visible = (mode === 'singularity');
    this.attractorGroup.visible = isAttractor;
    this.neuralGroup.visible = (mode === 'neural');
    this.warpGroup.visible = (mode === 'warp');

    if (isAttractor) {
      this.morphToAttractor(mode);
    }

    // Set musical scale based on mode
    if (mode === 'singularity') audioEngine.setScale('phrygian');
    else if (mode === 'aizawa') audioEngine.setScale('hirajoshi');
    else if (mode === 'lorenz') audioEngine.setScale('dorian');
    else if (mode === 'thomas') audioEngine.setScale('lydian');
    else if (mode === 'neural') audioEngine.setScale('lydian');
  }

  // Geodesic Dive: Plunge Into the Event Horizon
  triggerSingularityDive(onTelemetry, onFinish) {
    if (this.isDiving) return;
    this.isDiving = true;
    this.diveProgress = 0;

    this.setMode('singularity');
    audioEngine.playCinematicBraam(36, 1.2);

    const startTime = performance.now();
    const durationMs = this.diveDuration * 1000;

    const diveInterval = setInterval(() => {
      const elapsed = performance.now() - startTime;
      const t = Math.min(1.0, elapsed / durationMs);
      this.diveProgress = t;

      // Relativistic Telemetry calculations
      // Coordinate Time t diverges towards infinity near horizon (t ~ -log(1 - rs/r))
      const rCurrent = 42.0 * Math.pow(1.0 - t * 0.95, 2.0) + 2.5;
      const redshift = (1.0 / Math.sqrt(Math.max(0.001, 1.0 - 2.5 / rCurrent))) - 1.0;
      const properTime = (1.0 - t) * 8.5; // Countdown in seconds
      const tidalMetric = (2.5 / Math.pow(rCurrent, 3.0)) * 10000;

      if (onTelemetry) {
        onTelemetry({
          rCurrent: rCurrent.toFixed(2),
          redshift: redshift > 100 ? '∞ (HORIZON)' : redshift.toFixed(2),
          properTime: properTime.toFixed(2),
          tidalG: Math.min(999999, Math.round(tidalMetric))
        });
      }

      // Camera spiral inward trajectory
      const angle = t * Math.PI * 8.0;
      this.camera.position.x = rCurrent * Math.cos(angle);
      this.camera.position.z = rCurrent * Math.sin(angle);
      this.camera.position.y = (1.0 - t) * 12.0 * Math.sin(angle * 0.5);
      this.camera.lookAt(0, 0, 0);

      // Periodic gravitational clicks accelerating
      if (Math.random() < t * 0.7) {
        audioEngine.playCelestialChime(0.5 + t * 2.0, 0.4);
      }

      if (t >= 1.0) {
        clearInterval(diveInterval);
        this.isDiving = false;

        // WHITE HOLE EMERGENCE: Flash & Rebirth into chaotic attractor
        audioEngine.playCinematicBraam(55, 1.3);
        audioEngine.playWarpSweep();

        // Switch to Aizawa / Cosmic Tornado
        this.setMode('aizawa');
        this.camera.position.set(22, 18, 25);
        this.camera.lookAt(0, 0, 0);

        if (onFinish) onFinish();
      }
    }, 16);
  }

  // The Reality Compiler: Natural Language prompt to dynamic mathematics
  compileUniverse(prompt) {
    const p = prompt.toLowerCase();
    audioEngine.playWarpSweep();
    audioEngine.playCinematicBraam(42, 0.8);

    let mode = 'aizawa';
    let colA = 0x00f0ff, colB = 0xff00aa, colC = 0xffaa00;
    let gravity = 1.0, entropy = 0.2, velocity = 0.5;
    let scale = 'lydian';

    if (p.includes('chaos') || p.includes('butterfly') || p.includes('storm')) {
      mode = 'lorenz';
      colA = 0xff3300; colB = 0xff9900; colC = 0xffff00;
      gravity = 1.6; entropy = 0.6; scale = 'phrygian';
    } else if (p.includes('quantum') || p.includes('crystal') || p.includes('labyrinth') || p.includes('geometry')) {
      mode = 'thomas';
      colA = 0x00ffcc; colB = 0x0066ff; colC = 0xcc00ff;
      gravity = 0.8; entropy = 0.05; scale = 'hirajoshi';
    } else if (p.includes('void') || p.includes('dark') || p.includes('black hole') || p.includes('gravity')) {
      mode = 'singularity';
      gravity = 2.4; entropy = 0.1; velocity = 0.8; scale = 'phrygian';
    } else if (p.includes('mind') || p.includes('neural') || p.includes('synapse') || p.includes('brain')) {
      mode = 'neural';
      gravity = 1.0; entropy = 0.25; scale = 'lydian';
    } else if (p.includes('tornado') || p.includes('nebula') || p.includes('spiral')) {
      mode = 'aizawa';
      colA = 0xff0077; colB = 0x7700ff; colC = 0x00f0ff;
      gravity = 1.2; entropy = 0.3; scale = 'dorian';
    } else if (p.includes('warp') || p.includes('speed') || p.includes('light')) {
      mode = 'warp';
      velocity = 0.95;
    } else {
      // Procedural hash synthesis from prompt string
      let hash = 0;
      for (let i = 0; i < p.length; i++) {
        hash = (hash << 5) - hash + p.charCodeAt(i);
        hash |= 0;
      }
      const modes = ['aizawa', 'lorenz', 'thomas', 'halvorsen', 'neural'];
      mode = modes[Math.abs(hash) % modes.length];
      gravity = 0.5 + (Math.abs(hash % 25) / 10.0);
      entropy = (Math.abs(hash % 70) / 100.0);
      colA = ((hash * 123) & 0xffffff);
      colB = ((hash * 456) & 0xffffff);
      colC = ((hash * 789) & 0xffffff);
    }

    this.params.gravity = gravity;
    this.params.entropy = entropy;
    this.params.velocity = velocity;
    this.setMode(mode);

    if (['aizawa', 'lorenz', 'thomas', 'halvorsen'].includes(mode)) {
      this.morphToAttractor(mode, colA, colB, colC);
    }
    audioEngine.setScale(scale);

    return {
      mode,
      gravity,
      entropy,
      velocity,
      scale
    };
  }

  spawnGenesisBody(point, isMassive = false) {
    const color = isMassive ? 0xffaa00 : (Math.random() > 0.5 ? 0x00f0ff : 0xff3388);
    const size = isMassive ? 1.8 : (0.5 + Math.random() * 0.8);
    const geo = new THREE.SphereGeometry(size, 24, 24);
    const mat = new THREE.MeshBasicMaterial({ color });
    const mesh = new THREE.Mesh(geo, mat);

    mesh.position.copy(point);
    this.genesisGroup.add(mesh);

    const rVec = new THREE.Vector3(point.x, 0, point.z);
    const r = rVec.length();
    const tangent = new THREE.Vector3(-point.z, 0, point.x).normalize();
    const orbitalSpeed = Math.sqrt((18.0 * this.params.gravity) / Math.max(r, 2.0));
    const velocity = tangent.multiplyScalar(orbitalSpeed);

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

    // Reactivity to Web Audio FFT & Mic
    let bassEnergy = 0;
    if (audioSpectrum && audioSpectrum.length > 0) {
      bassEnergy = (audioSpectrum[2] + audioSpectrum[3] + audioSpectrum[4]) / (3 * 255);
    }
    const micEnergy = audioEngine.getMicEnergy();
    const combinedAudioEnergy = Math.max(bassEnergy, micEnergy * 1.5);

    // 1. Singularity updates
    if (this.currentMode === 'singularity') {
      this.diskUniforms.uTime.value = totalTime;
      this.diskUniforms.uGravity.value = this.params.gravity + combinedAudioEnergy * 0.4;
      this.diskUniforms.uEntropy.value = this.params.entropy + combinedAudioEnergy * 0.35;
      this.diskUniforms.uVelocity.value = this.params.velocity;
      this.diskUniforms.uPointer.value.copy(this.pointer3D);
      this.diskUniforms.uPointerActive.value = this.pointerActive ? 1.0 : 0.0;
      this.diskUniforms.uAudioEnergy.value = combinedAudioEnergy;

      this.horizonMaterial.uniforms.uTime.value = totalTime;
      this.jetMaterial.uniforms.uTime.value = totalTime;

      const pulse = 1.0 + Math.sin(totalTime * 4.0) * 0.03 + combinedAudioEnergy * 0.15;
      this.eventHorizon.scale.set(pulse, pulse, pulse);
    }

    // 2. Attractor updates
    if (this.attractorGroup.visible) {
      this.attractorUniforms.uTime.value = totalTime;
      this.attractorUniforms.uPointer.value.copy(this.pointer3D);
      this.attractorUniforms.uPointerActive.value = this.pointerActive ? 1.0 : 0.0;
      this.attractorUniforms.uAudioEnergy.value = combinedAudioEnergy;

      // Morph progress
      if (this.attractorUniforms.uMorph.value < 1.0) {
        this.attractorUniforms.uMorph.value += dt * 0.8;
      }

      this.attractorGroup.rotation.y += dt * 0.2;
      this.attractorGroup.rotation.x = Math.sin(totalTime * 0.3) * 0.15;
    }

    // 3. Neural Web updates
    if (this.currentMode === 'neural') {
      this.neuralGroup.rotation.y += dt * 0.08;
      this.neuralGroup.rotation.x = Math.sin(totalTime * 0.2) * 0.1;
    }

    // 4. Warp Transit updates
    if (this.currentMode === 'warp') {
      const positions = this.warpPoints.geometry.attributes.position.array;
      const count = this.warpStars.length;
      const speedMultiplier = 1.0 + this.params.velocity * 4.5 + combinedAudioEnergy * 2.5;

      for (let i = 0; i < count; i++) {
        const star = this.warpStars[i];
        star.z += star.speed * dt * speedMultiplier;
        if (star.z > 80) star.z = -360;
        positions[i * 3 + 2] = star.z;
      }
      this.warpPoints.geometry.attributes.position.needsUpdate = true;
    }

    // 5. Genesis bodies
    for (let i = 0; i < this.genesisBodies.length; i++) {
      const b = this.genesisBodies[i];
      if (!b.alive) continue;

      const toOrigin = new THREE.Vector3().sub(b.mesh.position);
      const r = toOrigin.length();
      if (r < 2.5) {
        this.genesisGroup.remove(b.mesh);
        this.genesisGroup.remove(b.trail);
        b.alive = false;
        continue;
      }

      const accel = toOrigin.normalize().multiplyScalar((18.0 * this.params.gravity) / (r * r));
      b.velocity.addScaledVector(accel, dt);
      b.mesh.position.addScaledVector(b.velocity, dt);

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

    this.genesisBodies = this.genesisBodies.filter(b => b.alive);
    this.bgMaterial.uniforms.uTime.value = totalTime;
  }
}
