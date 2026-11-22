import * as THREE from 'three';
import { audioEngine } from './audio.js';
import { UniverseSimulation } from './physics.js';
import { oracle } from './oracle.js';

// Application State
class AntigravityApp {
  constructor() {
    this.container = document.getElementById('canvas-container');
    this.isAwakened = false;
    this.isZenMode = false;
    this.isGenesisMode = false;

    // Camera Spherical Orbit coordinates
    this.cameraDistance = 42;
    this.targetDistance = 42;
    this.cameraPhi = Math.PI / 2.8;
    this.targetPhi = Math.PI / 2.8;
    this.cameraTheta = 0.2;
    this.targetTheta = 0.2;

    this.isMouseDown = false;
    this.previousMousePos = { x: 0, y: 0 };
    this.lastChimeTime = 0;

    // Telemetry & FPS
    this.lastFrameTime = performance.now();
    this.frameCount = 0;
    this.fps = 60;

    this.initThree();
    this.initSimulation();
    this.initAudioVisualizer();
    this.bindEvents();
    this.animate();
  }

  initThree() {
    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x030308, 0.002);

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      0.1,
      2000
    );
    this.updateCameraPosition();

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true // Allows high-res snapshot
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.0));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;

    this.container.appendChild(this.renderer.domElement);
  }

  initSimulation() {
    this.simulation = new UniverseSimulation(this.scene, this.camera, this.renderer);
  }

  initAudioVisualizer() {
    this.visCanvas = document.getElementById('visualizer-canvas');
    this.visCtx = this.visCanvas.getContext('2d');
  }

  updateCameraPosition() {
    // Spherical to Cartesian coordinate conversion
    this.camera.position.x = this.cameraDistance * Math.sin(this.cameraPhi) * Math.sin(this.cameraTheta);
    this.camera.position.y = this.cameraDistance * Math.cos(this.cameraPhi);
    this.camera.position.z = this.cameraDistance * Math.sin(this.cameraPhi) * Math.cos(this.cameraTheta);
    this.camera.lookAt(0, 0, 0);
  }

  bindEvents() {
    // Window Resize
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.0));
    });

    // Awakening Initiation Button
    const initiateBtn = document.getElementById('initiate-btn');
    const awakeningOverlay = document.getElementById('awakening-overlay');
    initiateBtn.addEventListener('click', () => {
      audioEngine.init();
      awakeningOverlay.classList.add('hidden');
      this.isAwakened = true;
      audioEngine.playWarpSweep();

      // Camera dramatic zoom-in from cosmic expanse
      this.cameraDistance = 140;
      this.targetDistance = 38;
    });

    // Pointer Interaction (Orbit & Graviton Nexus)
    window.addEventListener('mousedown', (e) => {
      if (e.target.closest('.interactive') || e.target.closest('#oracle-modal')) return;
      this.isMouseDown = true;
      this.previousMousePos = { x: e.clientX, y: e.clientY };
      this.simulation.pointerActive = true;
      this.simulation.updatePointer3D(e.clientX, e.clientY);

      if (this.isGenesisMode) {
        this.simulation.spawnGenesisBody(this.simulation.pointer3D, e.shiftKey);
        audioEngine.playCelestialChime(1.5, 0.9);
      } else {
        // Gravitational click pulse
        audioEngine.playCelestialChime(1.0, 0.7);
      }
    });

    window.addEventListener('mousemove', (e) => {
      // Audio spatial panning based on pointer X position
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      audioEngine.updatePan(normX);

      this.simulation.updatePointer3D(e.clientX, e.clientY);

      // Trigger subtle harmonious celestial chimes on movement
      const now = performance.now();
      if (this.isAwakened && now - this.lastChimeTime > 180 && Math.random() > 0.65) {
        audioEngine.playCelestialChime(1.0 + Math.random() * 0.4, 0.35);
        this.lastChimeTime = now;
      }

      if (!this.isMouseDown) return;

      const deltaX = e.clientX - this.previousMousePos.x;
      const deltaY = e.clientY - this.previousMousePos.y;
      this.previousMousePos = { x: e.clientX, y: e.clientY };

      // Rotate camera orbit
      this.targetTheta -= deltaX * 0.007;
      this.targetPhi -= deltaY * 0.007;
      // Clamp phi to avoid pole flips
      this.targetPhi = Math.max(0.1, Math.min(Math.PI - 0.1, this.targetPhi));
    });

    window.addEventListener('mouseup', () => {
      this.isMouseDown = false;
      this.simulation.pointerActive = false;
    });

    // Touch Support for mobile & trackpads
    window.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        if (touch.target.closest('.interactive')) return;
        this.isMouseDown = true;
        this.previousMousePos = { x: touch.clientX, y: touch.clientY };
        this.simulation.pointerActive = true;
        this.simulation.updatePointer3D(touch.clientX, touch.clientY);
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (e.touches.length === 1 && this.isMouseDown) {
        const touch = e.touches[0];
        const deltaX = touch.clientX - this.previousMousePos.x;
        const deltaY = touch.clientY - this.previousMousePos.y;
        this.previousMousePos = { x: touch.clientX, y: touch.clientY };

        this.targetTheta -= deltaX * 0.007;
        this.targetPhi -= deltaY * 0.007;
        this.targetPhi = Math.max(0.1, Math.min(Math.PI - 0.1, this.targetPhi));
        this.simulation.updatePointer3D(touch.clientX, touch.clientY);
      }
    }, { passive: true });

    window.addEventListener('touchend', () => {
      this.isMouseDown = false;
      this.simulation.pointerActive = false;
    });

    // Zoom on Wheel
    window.addEventListener('wheel', (e) => {
      this.targetDistance += e.deltaY * 0.04;
      this.targetDistance = Math.max(8.0, Math.min(180.0, this.targetDistance));
    }, { passive: true });

    // Mode Switcher Buttons
    const modePills = document.querySelectorAll('.mode-pill');
    modePills.forEach(pill => {
      pill.addEventListener('click', () => {
        modePills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const mode = pill.dataset.mode;
        this.simulation.setMode(mode);
        audioEngine.playWarpSweep();
      });
    });

    // Audio Mute/Unmute Button
    const audioBtn = document.getElementById('audio-toggle-btn');
    const audioIcon = document.getElementById('audio-icon');
    const audioLabel = document.getElementById('audio-label');
    audioBtn.addEventListener('click', () => {
      if (!audioEngine.isInitialized) {
        audioEngine.init();
      }
      const isMuted = audioEngine.toggleMute();
      audioIcon.textContent = isMuted ? '🔇' : '🔊';
      audioLabel.textContent = isMuted ? 'AUDIO: OFF' : 'AUDIO: ON';
      audioBtn.classList.toggle('active', !isMuted);
    });

    // Zen Mode Toggle
    const zenBtn = document.getElementById('zen-btn');
    const hudOverlay = document.getElementById('hud-overlay');
    const toggleZen = () => {
      this.isZenMode = !this.isZenMode;
      hudOverlay.classList.toggle('zen-mode', this.isZenMode);
      zenBtn.classList.toggle('active', this.isZenMode);
    };
    zenBtn.addEventListener('click', toggleZen);

    // High-Resolution Snapshot Capture
    const snapshotBtn = document.getElementById('snapshot-btn');
    snapshotBtn.addEventListener('click', () => {
      this.renderer.render(this.scene, this.camera);
      const dataUrl = this.renderer.domElement.toDataURL('image/png');
      const a = document.createElement('a');
      a.download = `antigravity-singularity-${Date.now()}.png`;
      a.href = dataUrl;
      a.click();
      audioEngine.playCelestialChime(2.0, 0.8);
    });

    // Physics Sliders
    const sGravity = document.getElementById('slider-gravity');
    const sEntropy = document.getElementById('slider-entropy');
    const sVelocity = document.getElementById('slider-velocity');

    const vGravity = document.getElementById('val-gravity');
    const vEntropy = document.getElementById('val-entropy');
    const vVelocity = document.getElementById('val-velocity');

    sGravity.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      this.simulation.params.gravity = val;
      vGravity.textContent = val.toFixed(2);
      audioEngine.playCelestialChime(0.8 + val * 0.3, 0.2);
    });

    sEntropy.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      this.simulation.params.entropy = val;
      vEntropy.textContent = val.toFixed(2);
    });

    sVelocity.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      this.simulation.params.velocity = val;
      vVelocity.textContent = val.toFixed(2);
    });

    // Action Buttons
    const btnGenesis = document.getElementById('btn-genesis');
    btnGenesis.addEventListener('click', () => {
      this.isGenesisMode = !this.isGenesisMode;
      document.body.classList.toggle('genesis-mode', this.isGenesisMode);
      btnGenesis.classList.toggle('active', this.isGenesisMode);
      btnGenesis.textContent = this.isGenesisMode ? '✨ PAINTING ACTIVE' : '✨ PAINT STARS';
    });

    const btnShockwave = document.getElementById('btn-shockwave');
    btnShockwave.addEventListener('click', () => {
      audioEngine.playGravitationalShockwave();
      this.triggerShockwaveImpulse();
    });

    const btnReset = document.getElementById('btn-reset');
    btnReset.addEventListener('click', () => {
      sGravity.value = 1.0;
      sEntropy.value = 0.15;
      sVelocity.value = 0.5;
      vGravity.textContent = '1.00';
      vEntropy.textContent = '0.15';
      vVelocity.textContent = '0.50';
      this.simulation.params.gravity = 1.0;
      this.simulation.params.entropy = 0.15;
      this.simulation.params.velocity = 0.5;
      audioEngine.playCelestialChime(1.0, 0.5);
    });

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      if (document.activeElement.tagName === 'INPUT') return;

      if (e.code === 'Space') {
        e.preventDefault();
        audioEngine.playGravitationalShockwave();
        this.triggerShockwaveImpulse();
      } else if (e.key === 'h' || e.key === 'H') {
        toggleZen();
      } else if (e.key >= '1' && e.key <= '5') {
        const modes = ['singularity', 'neural', 'quantum', 'supernova', 'warp'];
        const targetMode = modes[parseInt(e.key) - 1];
        if (targetMode) {
          const pill = document.querySelector(`.mode-pill[data-mode="${targetMode}"]`);
          if (pill) pill.click();
        }
      } else if (e.key === 'Escape') {
        this.closeOracle();
      }
    });

    // Oracle Dialog
    this.bindOracleEvents();
  }

  bindOracleEvents() {
    const modal = document.getElementById('oracle-modal');
    const triggerBtn = document.getElementById('oracle-trigger-btn');
    const closeBtn = document.getElementById('oracle-close-btn');
    const sendBtn = document.getElementById('oracle-send-btn');
    const input = document.getElementById('oracle-input');
    const chips = document.querySelectorAll('.prompt-chip');
    const outputText = document.getElementById('oracle-output-text');
    const signoffText = document.getElementById('oracle-signoff');

    const openOracle = () => {
      modal.classList.add('open');
      audioEngine.playCelestialChime(1.2, 0.4);
    };

    this.closeOracle = () => {
      modal.classList.remove('open');
    };

    triggerBtn.addEventListener('click', openOracle);
    closeBtn.addEventListener('click', this.closeOracle);

    const askOracle = (query) => {
      if (!query.trim()) return;
      const res = oracle.consult(query);

      // Typewriter effect
      outputText.textContent = '';
      signoffText.textContent = '';
      let idx = 0;
      const speed = 20;

      const typeChar = () => {
        if (idx < res.body.length) {
          outputText.textContent += res.body.charAt(idx);
          idx++;
          if (idx % 6 === 0) {
            audioEngine.playCelestialChime(1.8 + Math.random() * 0.5, 0.15);
          }
          setTimeout(typeChar, speed);
        } else {
          signoffText.textContent = res.signoff;
          audioEngine.playCelestialChime(1.0, 0.5);
        }
      };

      typeChar();
    };

    sendBtn.addEventListener('click', () => {
      const q = input.value;
      if (q) {
        askOracle(q);
        input.value = '';
      }
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        sendBtn.click();
      }
    });

    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        askOracle(chip.textContent);
      });
    });
  }

  triggerShockwaveImpulse() {
    // Temporarily pulse gravity & warp field
    const origGravity = this.simulation.params.gravity;
    this.simulation.params.gravity = 4.0;
    setTimeout(() => {
      this.simulation.params.gravity = origGravity;
    }, 600);
  }

  renderVisualizer() {
    if (!this.visCtx) return;
    const data = audioEngine.getSpectrumData();
    const ctx = this.visCtx;
    const w = this.visCanvas.width;
    const h = this.visCanvas.height;

    ctx.clearRect(0, 0, w, h);

    if (!data) {
      // Idle wave line
      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w, h / 2);
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.2)';
      ctx.stroke();
      return;
    }

    const barWidth = (w / (data.length * 0.6));
    let x = 0;

    for (let i = 0; i < data.length * 0.6; i++) {
      const barHeight = (data[i] / 255) * h;
      const gradient = ctx.createLinearGradient(0, h, 0, 0);
      gradient.addColorStop(0, '#00f0ff');
      gradient.addColorStop(1, '#ff00aa');

      ctx.fillStyle = gradient;
      ctx.fillRect(x, h - barHeight, barWidth - 1, barHeight);
      x += barWidth;
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const now = performance.now();
    const delta = Math.min((now - this.lastFrameTime) / 1000, 0.1);
    this.lastFrameTime = now;

    // Smooth Orbit Camera Interpolation (Lerp)
    this.cameraDistance = THREE.MathUtils.lerp(this.cameraDistance, this.targetDistance, 0.06);
    this.cameraTheta = THREE.MathUtils.lerp(this.cameraTheta, this.targetTheta, 0.06);
    this.cameraPhi = THREE.MathUtils.lerp(this.cameraPhi, this.targetPhi, 0.06);

    // Gentle autonomous cosmic drift when user is not dragging
    if (!this.isMouseDown && this.isAwakened) {
      this.targetTheta += 0.0008;
    }

    this.updateCameraPosition();

    // Render Audio Visualizer
    this.renderVisualizer();

    // Update Universe Simulation
    const audioSpectrum = audioEngine.getSpectrumData();
    this.simulation.update(delta, now * 0.001, audioSpectrum);

    // Render Three.js Scene
    this.renderer.render(this.scene, this.camera);

    // Update Telemetry FPS counter
    this.frameCount++;
    if (this.frameCount % 20 === 0) {
      this.fps = Math.round(1 / delta);
      const fpsEl = document.getElementById('telemetry-fps');
      if (fpsEl) fpsEl.textContent = `FPS: ${this.fps}`;
    }
  }
}

// Instantiate on DOM load
window.addEventListener('DOMContentLoaded', () => {
  new AntigravityApp();
});
