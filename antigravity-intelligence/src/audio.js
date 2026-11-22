// Advanced Procedural Web Audio Engine: Synthesizer, Granular Resonator & Mic Reactivity
// Pure mathematical real-time audio synthesis with Zero external assets

class TranscendentAudioEngine {
  constructor() {
    this.ctx = null;
    this.isInitialized = false;
    this.isMuted = false;
    this.masterGain = null;
    this.analyser = null;
    this.dataArray = null;
    this.panner = null;

    // Microphone Reactivity
    this.micStream = null;
    this.micAnalyser = null;
    this.micDataArray = null;
    this.isMicActive = false;

    // Musical Scales for Universe Modes (Pythagorean & Equal Temperament Harmonics)
    this.scales = {
      // Celestial Lydian (Cosmic wonder, bright, mystical)
      lydian: [110, 123.47, 138.59, 155.56, 164.81, 185.0, 207.65, 220, 246.94, 277.18, 311.13, 329.63, 369.99, 440, 493.88, 554.37, 622.25, 659.25, 739.99, 880],
      // Japanese Hirajoshi (Ethereal, dark, quantum, poignant)
      hirajoshi: [110, 116.54, 146.83, 164.81, 174.61, 220, 233.08, 293.66, 329.63, 349.23, 440, 466.16, 587.33, 659.25, 698.46, 880, 932.33, 1174.66],
      // Dorian (Deep space, relativistic velocity, noble)
      dorian: [110, 123.47, 130.81, 146.83, 164.81, 185.0, 196.0, 220, 246.94, 261.63, 293.66, 329.63, 369.99, 392.0, 440, 493.88, 523.25, 587.33],
      // Phrygian (Intense gravitational tidal forces, mysterious)
      phrygian: [110, 116.54, 130.81, 146.83, 164.81, 174.61, 196.0, 220, 233.08, 261.63, 293.66, 329.63, 349.23, 392.0, 440, 466.16, 523.25]
    };

    this.currentScale = this.scales.lydian;
    this.droneNodes = [];
    this.lastChimeTime = 0;
  }

  init() {
    if (this.isInitialized) return;

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();

      // Master output bus with soft clipper / limiter
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.42, this.ctx.currentTime);

      // Stereo Panner
      if (this.ctx.createStereoPanner) {
        this.panner = this.ctx.createStereoPanner();
        this.panner.pan.setValueAtTime(0, this.ctx.currentTime);
        this.masterGain.connect(this.panner);
        this.panner.connect(this.ctx.destination);
      } else {
        this.masterGain.connect(this.ctx.destination);
      }

      // Analyser Node for FFT frequency data & UI visualizer
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.82;
      this.masterGain.connect(this.analyser);
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

      // Setup Cosmic Reverb & Multi-Tap Stereo Delay Matrix
      this.setupSpatialReverb();

      // Start Deep Space Ambient Drone
      this.startDeepSpaceDrone();

      this.isInitialized = true;
    } catch (e) {
      console.warn('Web Audio initialization error:', e);
    }
  }

  setupSpatialReverb() {
    // 3-node stereo cross-delay network creating infinite cosmic diffusion
    this.delayL = this.ctx.createDelay();
    this.delayL.delayTime.value = 0.42;

    this.delayR = this.ctx.createDelay();
    this.delayR.delayTime.value = 0.63;

    this.feedbackL = this.ctx.createGain();
    this.feedbackL.gain.value = 0.52;

    this.feedbackR = this.ctx.createGain();
    this.feedbackR.gain.value = 0.48;

    this.dampingFilter = this.ctx.createBiquadFilter();
    this.dampingFilter.type = 'lowpass';
    this.dampingFilter.frequency.value = 2200;

    // Cross coupling
    this.delayL.connect(this.dampingFilter);
    this.dampingFilter.connect(this.feedbackL);
    this.feedbackL.connect(this.delayR);

    this.delayR.connect(this.feedbackR);
    this.feedbackR.connect(this.delayL);

    this.delayL.connect(this.masterGain);
    this.delayR.connect(this.masterGain);
  }

  startDeepSpaceDrone() {
    if (!this.ctx) return;

    // Multi-octave harmonic drone (Fundamental 55Hz + 110Hz + 165Hz + 220Hz)
    const freqs = [54.8, 55.2, 110.0, 164.81, 220.0];

    freqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = idx === 0 ? 'sine' : (idx === 1 ? 'triangle' : 'sawtooth');
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(120 + idx * 75, this.ctx.currentTime);
      filter.Q.value = 4.0;

      // Slow organic breath LFO modulating resonant filter cutoff
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.value = 0.05 + idx * 0.02; // 15-20 second breathing cycles
      lfoGain.gain.value = 35 + idx * 25;

      lfo.connect(filter.frequency);
      lfo.start();

      const targetGain = idx === 0 ? 0.30 : (0.12 / (idx + 1));
      gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(targetGain, this.ctx.currentTime + 3.0);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      if (idx > 1) {
        gain.connect(this.delayL);
      }

      osc.start();
      this.droneNodes.push({ osc, gain, filter, lfo });
    });
  }

  // Hans Zimmer Cinematic Sub-Bass "BRAAM" for Singularity Dives & Shockwaves
  playCinematicBraam(pitch = 45, intensity = 1.0) {
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;

    // 1. Massive detuned saw oscillators
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const sub = this.ctx.createOscillator();

    osc1.type = 'sawtooth';
    osc2.type = 'sawtooth';
    sub.type = 'sine';

    // Pitch envelope: dramatic drop from 90Hz to 38Hz
    osc1.frequency.setValueAtTime(pitch * 2.2, now);
    osc1.frequency.exponentialRampToValueAtTime(pitch, now + 0.4);
    osc1.frequency.exponentialRampToValueAtTime(pitch * 0.75, now + 3.2);

    osc2.frequency.setValueAtTime(pitch * 2.2 + 1.2, now);
    osc2.frequency.exponentialRampToValueAtTime(pitch + 0.8, now + 0.4);
    osc2.frequency.exponentialRampToValueAtTime(pitch * 0.75 + 0.5, now + 3.2);

    sub.frequency.setValueAtTime(pitch * 0.5, now);
    sub.frequency.exponentialRampToValueAtTime(pitch * 0.35, now + 2.5);

    // Distortion / Overdrive Waveshaper
    const waveshaper = this.ctx.createWaveShaper();
    waveshaper.curve = this.makeDistortionCurve(40);
    waveshaper.oversample = '4x';

    // Filter sweep
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(900 * intensity, now);
    filter.frequency.exponentialRampToValueAtTime(80, now + 3.5);
    filter.Q.value = 5.0;

    // Master Amp Envelope
    const amp = this.ctx.createGain();
    amp.gain.setValueAtTime(0.001, now);
    amp.gain.linearRampToValueAtTime(0.55 * intensity, now + 0.08);
    amp.gain.exponentialRampToValueAtTime(0.001, now + 3.8);

    osc1.connect(waveshaper);
    osc2.connect(waveshaper);
    sub.connect(filter);
    waveshaper.connect(filter);
    filter.connect(amp);
    amp.connect(this.masterGain);
    amp.connect(this.delayL);

    osc1.start(now);
    osc2.start(now);
    sub.start(now);

    osc1.stop(now + 4.0);
    osc2.stop(now + 4.0);
    sub.stop(now + 4.0);
  }

  makeDistortionCurve(amount) {
    const k = typeof amount === 'number' ? amount : 50;
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }

  // High-Resolution FM Celestial Chimes
  playCelestialChime(pitchMultiplier = 1.0, intensity = 0.5) {
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    if (now - this.lastChimeTime < 0.06) return;
    this.lastChimeTime = now;

    const baseFreq = this.currentScale[
      Math.floor(Math.random() * this.currentScale.length)
    ] * pitchMultiplier;

    const carrier = this.ctx.createOscillator();
    const modulator = this.ctx.createOscillator();
    const modGain = this.ctx.createGain();
    const ampGain = this.ctx.createGain();

    carrier.type = 'sine';
    carrier.frequency.setValueAtTime(baseFreq, now);

    // Non-integer golden harmonic modulation
    modulator.type = 'sine';
    modulator.frequency.setValueAtTime(baseFreq * 2.618, now);

    modGain.gain.setValueAtTime(baseFreq * 1.8 * intensity, now);
    modGain.gain.exponentialRampToValueAtTime(0.1, now + 1.8);
    modulator.connect(carrier.frequency);

    const volume = Math.min(0.24, 0.06 + intensity * 0.18);
    ampGain.gain.setValueAtTime(0.0001, now);
    ampGain.gain.exponentialRampToValueAtTime(volume, now + 0.02);
    ampGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);

    carrier.connect(ampGain);
    ampGain.connect(this.masterGain);
    ampGain.connect(this.delayL);

    modulator.start(now);
    carrier.start(now);
    modulator.stop(now + 2.9);
    carrier.stop(now + 2.9);
  }

  // Warp tunnel acceleration sweep
  playWarpSweep() {
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 2.2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const bandpass = this.ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(120, now);
    bandpass.frequency.exponentialRampToValueAtTime(5200, now + 1.2);
    bandpass.frequency.exponentialRampToValueAtTime(180, now + 2.2);
    bandpass.Q.value = 7.0;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.35, now + 0.9);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 2.2);

    whiteNoise.connect(bandpass);
    bandpass.connect(gain);
    gain.connect(this.masterGain);
    gain.connect(this.delayR);

    whiteNoise.start(now);
    whiteNoise.stop(now + 2.3);
  }

  // Enable Live Microphone Reactivity
  async toggleMicrophone() {
    if (!this.ctx) this.init();

    if (this.isMicActive) {
      if (this.micStream) {
        this.micStream.getTracks().forEach(t => t.stop());
        this.micStream = null;
      }
      this.isMicActive = false;
      return false;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      this.micStream = stream;
      const micSource = this.ctx.createMediaStreamSource(stream);

      this.micAnalyser = this.ctx.createAnalyser();
      this.micAnalyser.fftSize = 128;
      this.micAnalyser.smoothingTimeConstant = 0.8;
      micSource.connect(this.micAnalyser);
      this.micDataArray = new Uint8Array(this.micAnalyser.frequencyBinCount);

      this.isMicActive = true;
      return true;
    } catch (err) {
      console.warn('Microphone access denied or not available:', err);
      this.isMicActive = false;
      return false;
    }
  }

  getMicEnergy() {
    if (!this.isMicActive || !this.micAnalyser || !this.micDataArray) return 0;
    this.micAnalyser.getByteFrequencyData(this.micDataArray);
    let sum = 0;
    for (let i = 0; i < this.micDataArray.length; i++) {
      sum += this.micDataArray[i];
    }
    return sum / (this.micDataArray.length * 255);
  }

  setScale(scaleName) {
    if (this.scales[scaleName]) {
      this.currentScale = this.scales[scaleName];
    }
  }

  updatePan(normalizedX) {
    if (this.panner && this.ctx) {
      const clamped = Math.max(-0.9, Math.min(0.9, normalizedX));
      this.panner.pan.setTargetAtTime(clamped, this.ctx.currentTime, 0.08);
    }
  }

  toggleMute() {
    if (!this.masterGain || !this.ctx) return false;
    this.isMuted = !this.isMuted;
    this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : 0.42, this.ctx.currentTime, 0.08);
    return this.isMuted;
  }

  getSpectrumData() {
    if (!this.analyser || !this.dataArray) return null;
    this.analyser.getByteFrequencyData(this.dataArray);
    return this.dataArray;
  }
}

export const audioEngine = new TranscendentAudioEngine();
