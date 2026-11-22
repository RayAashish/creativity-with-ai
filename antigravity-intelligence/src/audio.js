// Procedural Web Audio API Cosmic Soundscape Engine
// Zero external audio files, pure real-time mathematical synthesis

class CosmicAudioEngine {
  constructor() {
    this.ctx = null;
    this.isInitialized = false;
    this.isMuted = false;
    this.masterGain = null;
    this.analyser = null;
    this.dataArray = null;
    this.panner = null;

    // Harmonic pentatonic scales (Pythagorean celestial tuning in Hz)
    this.celestialFrequencies = [
      110.0, 123.47, 138.59, 164.81, 185.0, // Bass octave
      220.0, 246.94, 277.18, 329.63, 369.99, // Mid octave
      440.0, 493.88, 554.37, 659.25, 739.99, // Treble octave
      880.0, 987.77, 1108.73, 1318.51, 1479.98 // Celestial harmonics
    ];

    // Drone nodes
    this.droneNodes = [];
    this.lastTriggerTime = 0;
  }

  init() {
    if (this.isInitialized) return;

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();

      // Master output chain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.4, this.ctx.currentTime);

      // Stereo Panner
      if (this.ctx.createStereoPanner) {
        this.panner = this.ctx.createStereoPanner();
        this.panner.pan.setValueAtTime(0, this.ctx.currentTime);
        this.masterGain.connect(this.panner);
        this.panner.connect(this.ctx.destination);
      } else {
        this.masterGain.connect(this.ctx.destination);
      }

      // Analyser node for HUD visualizer
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 128;
      this.analyser.smoothingTimeConstant = 0.85;
      this.masterGain.connect(this.analyser);
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

      // Delay / Cosmic Space Reverb Network
      this.setupCosmicEcho();

      // Ambient Drones
      this.startCosmicDrone();

      this.isInitialized = true;
    } catch (e) {
      console.warn('Web Audio not supported or blocked:', e);
    }
  }

  setupCosmicEcho() {
    // Stereo feedback delay
    this.delayNodeL = this.ctx.createDelay();
    this.delayNodeL.delayTime.value = 0.38;

    this.delayNodeR = this.ctx.createDelay();
    this.delayNodeR.delayTime.value = 0.54;

    this.feedbackL = this.ctx.createGain();
    this.feedbackL.gain.value = 0.45;

    this.feedbackR = this.ctx.createGain();
    this.feedbackR.gain.value = 0.40;

    this.delayFilter = this.ctx.createBiquadFilter();
    this.delayFilter.type = 'lowpass';
    this.delayFilter.frequency.value = 1600;

    // Cross-feedback
    this.delayNodeL.connect(this.delayFilter);
    this.delayFilter.connect(this.feedbackL);
    this.feedbackL.connect(this.delayNodeR);

    this.delayNodeR.connect(this.feedbackR);
    this.feedbackR.connect(this.delayNodeL);

    this.delayNodeL.connect(this.masterGain);
    this.delayNodeR.connect(this.masterGain);
  }

  startCosmicDrone() {
    if (!this.ctx) return;

    // Fundamental binaural sub-bass (54.8Hz & 55.2Hz) creating a 0.4Hz meditative alpha beat
    const droneFreqs = [54.8, 55.2, 110.0, 164.81];

    droneFreqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(140 + idx * 80, this.ctx.currentTime);
      filter.Q.value = 3.0;

      // Subtle LFO breath for each drone voice
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.value = 0.08 + idx * 0.03; // Slow breath (12-25 seconds per cycle)
      lfoGain.gain.value = 40 + idx * 20;

      lfo.connect(filter.frequency);
      lfo.start();

      const initialGain = idx === 0 ? 0.25 : 0.08 / (idx + 1);
      gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(initialGain, this.ctx.currentTime + 3);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      if (idx > 1) {
        gain.connect(this.delayNodeL);
      }

      osc.start();
      this.droneNodes.push({ osc, gain, filter, lfo });
    });
  }

  // Interactive celestial chime (FM Bell Synthesis)
  playCelestialChime(pitchMultiplier = 1.0, intensity = 0.5) {
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    if (now - this.lastTriggerTime < 0.05) return; // Debounce rapid triggers
    this.lastTriggerTime = now;

    // Pick a harmonic from the pentatonic scale
    const baseFreq = this.celestialFrequencies[
      Math.floor(Math.random() * this.celestialFrequencies.length)
    ] * pitchMultiplier;

    // Carrier Oscillator
    const carrier = this.ctx.createOscillator();
    carrier.type = 'sine';
    carrier.frequency.setValueAtTime(baseFreq, now);

    // Modulator Oscillator for metallic/crystal bell timbre
    const modulator = this.ctx.createOscillator();
    modulator.type = 'sine';
    modulator.frequency.setValueAtTime(baseFreq * 2.76, now); // Non-integer harmonic ratio

    const modGain = this.ctx.createGain();
    modGain.gain.setValueAtTime(baseFreq * 1.5 * intensity, now);
    modGain.gain.exponentialRampToValueAtTime(0.1, now + 1.2);

    modulator.connect(carrier.frequency);

    // Amplitude Envelope
    const ampGain = this.ctx.createGain();
    const volume = Math.min(0.2, 0.05 + intensity * 0.15);
    ampGain.gain.setValueAtTime(0.0001, now);
    ampGain.gain.exponentialRampToValueAtTime(volume, now + 0.02);
    ampGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);

    carrier.connect(ampGain);
    ampGain.connect(this.masterGain);
    ampGain.connect(this.delayNodeL);

    modulator.start(now);
    carrier.start(now);

    modulator.stop(now + 2.6);
    carrier.stop(now + 2.6);
  }

  // Gravitational pulse on click or singularity explosion
  playGravitationalShockwave() {
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    // Pitch drops drastically from 220Hz down to 28Hz (sub-bass earthquake)
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.exponentialRampToValueAtTime(28, now + 1.8);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, now);
    filter.frequency.exponentialRampToValueAtTime(60, now + 1.8);
    filter.Q.value = 6;

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 2.1);
  }

  // Warp tunnel acceleration sweep
  playWarpSweep() {
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 2.0;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const bandpass = this.ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(100, now);
    bandpass.frequency.exponentialRampToValueAtTime(4500, now + 1.2);
    bandpass.frequency.exponentialRampToValueAtTime(200, now + 2.0);
    bandpass.Q.value = 8.0;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 1.0);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);

    whiteNoise.connect(bandpass);
    bandpass.connect(gain);
    gain.connect(this.masterGain);
    gain.connect(this.delayNodeR);

    whiteNoise.start(now);
    whiteNoise.stop(now + 2.1);
  }

  // Update spatial audio based on mouse X (-1 to 1)
  updatePan(normalizedX) {
    if (this.panner && this.ctx) {
      const clamped = Math.max(-0.9, Math.min(0.9, normalizedX));
      this.panner.pan.setTargetAtTime(clamped, this.ctx.currentTime, 0.1);
    }
  }

  toggleMute() {
    if (!this.masterGain || !this.ctx) return false;
    this.isMuted = !this.isMuted;
    this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : 0.4, this.ctx.currentTime, 0.1);
    return this.isMuted;
  }

  getSpectrumData() {
    if (!this.analyser || !this.dataArray) return null;
    this.analyser.getByteFrequencyData(this.dataArray);
    return this.dataArray;
  }
}

export const audioEngine = new CosmicAudioEngine();
