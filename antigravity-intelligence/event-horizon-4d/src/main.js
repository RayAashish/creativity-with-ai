// CHRONOSFERA - Relativistic 4D Spacetime & Quantum Multiverse Holodeck
import * as THREE from 'three';
import { blackHoleVertexShader, blackHoleFragmentShader } from './shaders/blackHoleShaders.js';
import { calabiYauVertexShader, calabiYauFragmentShader } from './shaders/calabiYauShaders.js';
import { mandelbulbVertexShader, mandelbulbFragmentShader } from './shaders/mandelbulbShaders.js';
import { createNeuralMycelium } from './particles/neuralMycelium.js';
import { cosmicAudio } from './audio/cosmicAudio.js';

// Setup Three.js Scene, Camera, and Renderer
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
camera.position.z = 1;

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance', preserveDrawingBuffer: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.0));
container.appendChild(renderer.domElement);

// Perspective camera for 3D orbital tracking
const orbitCam = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
orbitCam.position.set(0, 1.8, 6.5);

// State Parameters
const state = {
  mode: 'blackhole', // 'blackhole', 'calabiyau', 'mandelbulb', 'mycelium'
  mass: 0.95,
  spin: 0.88,
  diskDensity: 1.0,
  doppler: 1.0,
  timeDilation: 1.0,
  dimMorph: 0.5,
  hyperRot: 0.0,
  mandelPower: 8.0,
  isWarping: false,
  warpFactor: 0.0,
  autoOrbit: true,
  orbitAngle: 0.0
};

// Shader Materials
const bhUniforms = {
  u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
  u_time: { value: 0 },
  u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
  u_mass: { value: state.mass },
  u_spin: { value: state.spin },
  u_disk_density: { value: state.diskDensity },
  u_doppler: { value: state.doppler },
  u_time_dilation: { value: state.timeDilation },
  u_cam_pos: { value: orbitCam.position },
  u_cam_target: { value: new THREE.Vector3(0, 0, 0) },
  u_warp_factor: { value: 0.0 }
};

const bhMaterial = new THREE.ShaderMaterial({
  vertexShader: blackHoleVertexShader,
  fragmentShader: blackHoleFragmentShader,
  uniforms: bhUniforms,
  depthWrite: false,
  depthTest: false
});

const cyMaterial = new THREE.ShaderMaterial({
  vertexShader: calabiYauVertexShader,
  fragmentShader: calabiYauFragmentShader,
  uniforms: {
    u_resolution: bhUniforms.u_resolution,
    u_time: bhUniforms.u_time,
    u_mouse: bhUniforms.u_mouse,
    u_dim_morph: { value: state.dimMorph },
    u_hyper_rot: { value: state.hyperRot },
    u_cam_pos: bhUniforms.u_cam_pos,
    u_cam_target: bhUniforms.u_cam_target
  },
  depthWrite: false,
  depthTest: false
});

const mbMaterial = new THREE.ShaderMaterial({
  vertexShader: mandelbulbVertexShader,
  fragmentShader: mandelbulbFragmentShader,
  uniforms: {
    u_resolution: bhUniforms.u_resolution,
    u_time: bhUniforms.u_time,
    u_mouse: bhUniforms.u_mouse,
    u_power: { value: state.mandelPower },
    u_cam_pos: bhUniforms.u_cam_pos,
    u_cam_target: bhUniforms.u_cam_target
  },
  depthWrite: false,
  depthTest: false
});

// Fullscreen Quad
const quadGeometry = new THREE.PlaneGeometry(2, 2);
const quadMesh = new THREE.Mesh(quadGeometry, bhMaterial);
scene.add(quadMesh);

// Neural Mycelium Engine
const mycelium = createNeuralMycelium(scene);

// Mouse & Inertia Controls
let isDragging = false;
let prevMouseX = 0;
let prevMouseY = 0;
let spherical = new THREE.Spherical(6.5, Math.PI / 2.3, 0.0);
let targetSpherical = new THREE.Spherical(6.5, Math.PI / 2.3, 0.0);
const mousePos = new THREE.Vector2(0.5, 0.5);

window.addEventListener('mousedown', (e) => {
  if (e.target.closest('#hud-deck')) return;
  isDragging = true;
  prevMouseX = e.clientX;
  prevMouseY = e.clientY;
});

window.addEventListener('mousemove', (e) => {
  mousePos.x = e.clientX / window.innerWidth;
  mousePos.y = 1.0 - (e.clientY / window.innerHeight);

  if (isDragging) {
    const deltaX = (e.clientX - prevMouseX) * 0.005;
    const deltaY = (e.clientY - prevMouseY) * 0.005;
    targetSpherical.theta -= deltaX;
    targetSpherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, targetSpherical.phi - deltaY));
    prevMouseX = e.clientX;
    prevMouseY = e.clientY;
    state.autoOrbit = false;
    const autoOrbitBtn = document.getElementById('btn-auto-orbit');
    if (autoOrbitBtn) autoOrbitBtn.classList.remove('active');
  }
});

window.addEventListener('mouseup', () => { isDragging = false; });

window.addEventListener('wheel', (e) => {
  if (e.target.closest('#hud-deck')) return;
  targetSpherical.radius = Math.max(2.8, Math.min(18.0, targetSpherical.radius + e.deltaY * 0.006));
  cosmicAudio.updateFrequency(6.5 / targetSpherical.radius);
}, { passive: true });

window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  bhUniforms.u_resolution.value.set(window.innerWidth, window.innerHeight);
  orbitCam.aspect = window.innerWidth / window.innerHeight;
  orbitCam.updateProjectionMatrix();
});

// Mode Switching Logic
function setMode(newMode) {
  state.mode = newMode;
  document.querySelectorAll('.mode-card').forEach(c => {
    c.classList.toggle('active', c.dataset.mode === newMode);
  });

  const controlsTitle = document.getElementById('dynamic-controls-title');
  const dynContainer = document.getElementById('dynamic-controls-content');

  if (newMode === 'blackhole') {
    quadMesh.material = bhMaterial;
    quadMesh.visible = true;
    mycelium.points.visible = false;
    controlsTitle.textContent = 'RELATIVISTIC METRIC CONTROLS';
    dynContainer.innerHTML = `
      <div class="control-row">
        <label>Mass / Event Horizon ($M$): <span id="val-mass">${state.mass.toFixed(2)}</span></label>
        <input type="range" id="input-mass" min="0.4" max="1.6" step="0.05" value="${state.mass}">
      </div>
      <div class="control-row">
        <label>Kerr Angular Spin ($a/M$): <span id="val-spin">${state.spin.toFixed(2)}</span></label>
        <input type="range" id="input-spin" min="0.0" max="0.99" step="0.01" value="${state.spin}">
      </div>
      <div class="control-row">
        <label>Doppler Beaming Radiance ($D^3$): <span id="val-doppler">${state.doppler.toFixed(2)}</span></label>
        <input type="range" id="input-doppler" min="0.0" max="2.0" step="0.1" value="${state.doppler}">
      </div>
      <div class="control-row">
        <label>Accretion Optical Depth ($\tau$): <span id="val-density">${state.diskDensity.toFixed(2)}</span></label>
        <input type="range" id="input-density" min="0.3" max="2.0" step="0.1" value="${state.diskDensity}">
      </div>
    `;
    bindBlackHoleInputs();
    cosmicAudio.triggerCelestialChime(261.63); // C4
  } else if (newMode === 'calabiyau') {
    quadMesh.material = cyMaterial;
    quadMesh.visible = true;
    mycelium.points.visible = false;
    controlsTitle.textContent = '4D KÄHLER MANIFOLD CONTROLS';
    dynContainer.innerHTML = `
      <div class="control-row">
        <label>6D Compactification Morph ($n$): <span id="val-morph">${state.dimMorph.toFixed(2)}</span></label>
        <input type="range" id="input-morph" min="0.0" max="2.0" step="0.05" value="${state.dimMorph}">
      </div>
      <div class="control-row">
        <label>Hyper-Rotation Angle ($\theta_4$): <span id="val-hyper">${state.hyperRot.toFixed(2)}</span></label>
        <input type="range" id="input-hyper" min="0.0" max="6.28" step="0.05" value="${state.hyperRot}">
      </div>
    `;
    bindCalabiYauInputs();
    cosmicAudio.triggerCelestialChime(392.00); // G4
  } else if (newMode === 'mandelbulb') {
    quadMesh.material = mbMaterial;
    quadMesh.visible = true;
    mycelium.points.visible = false;
    controlsTitle.textContent = '3D QUANTUM FOAM CONTROLS';
    dynContainer.innerHTML = `
      <div class="control-row">
        <label>Fractal Power Order ($N$): <span id="val-power">${state.mandelPower.toFixed(1)}</span></label>
        <input type="range" id="input-power" min="4.0" max="14.0" step="0.5" value="${state.mandelPower}">
      </div>
    `;
    bindMandelbulbInputs();
    cosmicAudio.triggerCelestialChime(523.25); // C5
  } else if (newMode === 'mycelium') {
    quadMesh.visible = false;
    mycelium.points.visible = true;
    controlsTitle.textContent = '100K SYNAPTIC GPU CONTROLS';
    dynContainer.innerHTML = `
      <div class="control-row">
        <label>Action Potential Synapse Frequency: Active</label>
        <p class="sub-hint">Move cursor over canvas to exert biological gravitational attraction on 100,000 synaptic nodes.</p>
      </div>
    `;
    cosmicAudio.triggerCelestialChime(659.25); // E5
  }
}

function bindBlackHoleInputs() {
  const m = document.getElementById('input-mass');
  const s = document.getElementById('input-spin');
  const d = document.getElementById('input-doppler');
  const den = document.getElementById('input-density');

  if (m) m.oninput = (e) => {
    state.mass = parseFloat(e.target.value);
    bhUniforms.u_mass.value = state.mass;
    document.getElementById('val-mass').textContent = state.mass.toFixed(2);
    updateTelemetry();
  };
  if (s) s.oninput = (e) => {
    state.spin = parseFloat(e.target.value);
    bhUniforms.u_spin.value = state.spin;
    document.getElementById('val-spin').textContent = state.spin.toFixed(2);
    updateTelemetry();
  };
  if (d) d.oninput = (e) => {
    state.doppler = parseFloat(e.target.value);
    bhUniforms.u_doppler.value = state.doppler;
    document.getElementById('val-doppler').textContent = state.doppler.toFixed(2);
  };
  if (den) den.oninput = (e) => {
    state.diskDensity = parseFloat(e.target.value);
    bhUniforms.u_disk_density.value = state.diskDensity;
    document.getElementById('val-density').textContent = state.diskDensity.toFixed(2);
  };
}

function bindCalabiYauInputs() {
  const morph = document.getElementById('input-morph');
  const hyper = document.getElementById('input-hyper');
  if (morph) morph.oninput = (e) => {
    state.dimMorph = parseFloat(e.target.value);
    cyMaterial.uniforms.u_dim_morph.value = state.dimMorph;
    document.getElementById('val-morph').textContent = state.dimMorph.toFixed(2);
  };
  if (hyper) hyper.oninput = (e) => {
    state.hyperRot = parseFloat(e.target.value);
    cyMaterial.uniforms.u_hyper_rot.value = state.hyperRot;
    document.getElementById('val-hyper').textContent = state.hyperRot.toFixed(2);
  };
}

function bindMandelbulbInputs() {
  const pow = document.getElementById('input-power');
  if (pow) pow.oninput = (e) => {
    state.mandelPower = parseFloat(e.target.value);
    mbMaterial.uniforms.u_power.value = state.mandelPower;
    document.getElementById('val-power').textContent = state.mandelPower.toFixed(1);
  };
}

// Telemetry Updates (Theoretical Physics Readouts)
function updateTelemetry() {
  const rs = (2.0 * state.mass * 1.48e3).toFixed(1); // Simulated Schwarzschild km
  const isco = (3.0 * state.mass * (1.0 - 0.45 * state.spin)).toFixed(2);
  const hawkingTemp = (1.23e-8 / state.mass).toExponential(2);
  const gtt = (-(1.0 - state.mass / spherical.radius)).toFixed(3);

  const tEl = document.getElementById('telemetry-content');
  if (tEl) {
    tEl.innerHTML = `
      <div class="telemetry-grid">
        <div class="t-cell"><span class="t-label">SCHWARZSCHILD RADIUS $r_s$:</span> <span class="t-val">${rs} km</span></div>
        <div class="t-cell"><span class="t-label">ISCO STABLE ORBIT:</span> <span class="t-val">${isco} $r_s$</span></div>
        <div class="t-cell"><span class="t-label">METRIC TENSOR $g_{tt}$:</span> <span class="t-val">${gtt}</span></div>
        <div class="t-cell"><span class="t-label">HAWKING TEMPERATURE:</span> <span class="t-val">${hawkingTemp} K</span></div>
      </div>
    `;
  }
}

// Global UI Buttons
document.querySelectorAll('.mode-card').forEach(btn => {
  btn.onclick = () => setMode(btn.dataset.mode);
});

// Time Dilation Slider
const timeSlider = document.getElementById('input-time-dilation');
if (timeSlider) {
  timeSlider.oninput = (e) => {
    state.timeDilation = parseFloat(e.target.value);
    bhUniforms.u_time_dilation.value = state.timeDilation;
    document.getElementById('val-time-dilation').textContent = state.timeDilation.toFixed(1) + 'x';
    cosmicAudio.updateFrequency(state.timeDilation);
  };
}

// Auto Orbit Toggle
const autoOrbitBtn = document.getElementById('btn-auto-orbit');
if (autoOrbitBtn) {
  autoOrbitBtn.onclick = () => {
    state.autoOrbit = !state.autoOrbit;
    autoOrbitBtn.classList.toggle('active', state.autoOrbit);
  };
}

// Audio Toggle Button
const audioBtn = document.getElementById('btn-audio-toggle');
if (audioBtn) {
  audioBtn.onclick = () => {
    const active = cosmicAudio.toggle();
    audioBtn.classList.toggle('active', active);
    audioBtn.innerHTML = active ? '🔊 MUTING AUDIO' : '🔈 COSMIC SOUNDSCAPE';
  };
}

// Hyperjump Button
const warpBtn = document.getElementById('btn-hyperjump');
if (warpBtn) {
  warpBtn.onclick = () => {
    if (state.isWarping) return;
    state.isWarping = true;
    warpBtn.disabled = true;
    warpBtn.innerHTML = '⚡ HYPERJUMP ACTIVE...';
    cosmicAudio.triggerHyperjumpSound();

    let start = performance.now();
    const warpDuration = 1800; // ms

    function animateWarp(now) {
      const elapsed = now - start;
      const progress = elapsed / warpDuration;
      if (progress < 0.5) {
        state.warpFactor = Math.sin(progress * Math.PI);
        targetSpherical.radius = Math.max(3.2, 6.5 - state.warpFactor * 2.5);
      } else if (progress < 1.0) {
        state.warpFactor = Math.sin(progress * Math.PI);
        targetSpherical.radius = 3.2 + (1.0 - state.warpFactor) * 3.3;
      } else {
        state.warpFactor = 0.0;
        state.isWarping = false;
        warpBtn.disabled = false;
        warpBtn.innerHTML = '🚀 HYPERJUMP WARP';
        return;
      }
      bhUniforms.u_warp_factor.value = state.warpFactor;
      requestAnimationFrame(animateWarp);
    }
    requestAnimationFrame(animateWarp);
  };
}

// 4K Wallpaper Capture
const snapBtn = document.getElementById('btn-screenshot');
if (snapBtn) {
  snapBtn.onclick = () => {
    renderer.render(scene, camera);
    const dataUrl = renderer.domElement.toDataURL('image/png');
    const a = document.createElement('a');
    a.download = `Chronosfera-${state.mode}-${Date.now()}.png`;
    a.href = dataUrl;
    a.click();
    cosmicAudio.triggerCelestialChime(783.99); // G5
  };
}

// Audio Spectrum Visualizer Canvas
const specCanvas = document.getElementById('audio-spectrum-canvas');
const specCtx = specCanvas ? specCanvas.getContext('2d') : null;

function renderAudioVisualizer() {
  if (!specCtx) return;
  const data = cosmicAudio.getSpectrumData();
  specCtx.clearRect(0, 0, specCanvas.width, specCanvas.height);
  const barWidth = specCanvas.width / 16;

  for (let i = 0; i < 16; i++) {
    const val = (data[i] || 0) / 255.0;
    const barHeight = val * specCanvas.height;
    specCtx.fillStyle = `rgba(0, 243, 255, ${0.3 + val * 0.7})`;
    specCtx.fillRect(i * barWidth, specCanvas.height - barHeight, barWidth - 1, barHeight);
  }
}

// Initialize Default Mode
setMode('blackhole');
updateTelemetry();

// Main Animation Render Loop
let clock = new THREE.Clock();
let fpsCounter = document.getElementById('fps-metric');
let frameTimes = [];

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();
  const elapsedTime = clock.getElapsedTime();

  // Auto-orbit camera
  if (state.autoOrbit && !isDragging) {
    targetSpherical.theta += 0.003 * state.timeDilation;
  }

  // Smooth spherical damping
  spherical.theta += (targetSpherical.theta - spherical.theta) * 0.08;
  spherical.phi += (targetSpherical.phi - spherical.phi) * 0.08;
  spherical.radius += (targetSpherical.radius - spherical.radius) * 0.08;

  orbitCam.position.setFromSpherical(spherical);
  orbitCam.lookAt(0, 0, 0);

  // Update Uniforms
  const adjustedTime = elapsedTime * state.timeDilation;
  bhUniforms.u_time.value = adjustedTime;
  bhUniforms.u_mouse.value.set(mousePos.x, mousePos.y);

  // Update Mycelium
  if (mycelium.points.visible) {
    const mouse3D = new THREE.Vector3((mousePos.x - 0.5) * 8.0, (mousePos.y - 0.5) * 8.0, 0);
    mycelium.update(adjustedTime, mouse3D);
  }

  // Render Scene
  if (mycelium.points.visible) {
    renderer.render(scene, orbitCam);
  } else {
    renderer.render(scene, camera);
  }

  // Render Audio Visualizer
  renderAudioVisualizer();

  // FPS metric
  const now = performance.now();
  frameTimes.push(now);
  while (frameTimes.length > 0 && frameTimes[0] <= now - 1000) {
    frameTimes.shift();
  }
  if (fpsCounter) fpsCounter.textContent = `${frameTimes.length} FPS`;
}

animate();
