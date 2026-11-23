// Web Audio API Generative Cosmic Synthesizer
// Generates ambient space drones, relativistic frame-dragging hum, celestial chimes, and hyperjump FX
// 100% synthesized in real time with zero external audio assets.

class CosmicAudioEngine {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.masterGain = null;
    this.analyser = null;
    this.droneNodes = [];
    this.lfoNodes = [];
    this.filterNode = null;
  }

  init() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContext();

    // Master Dynamics Compressor (prevents clipping)
    this.compressor = this.ctx.createDynamicsCompressor();
    this.compressor.threshold.setValueAtTime(-18, this.ctx.currentTime);
    this.compressor.knee.setValueAtTime(30, this.ctx.currentTime);
    this.compressor.ratio.setValueAtTime(12, this.ctx.currentTime);
    this.compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
    this.compressor.release.setValueAtTime(0.25, this.ctx.currentTime);

    // Analyser Node for visual telemetry
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 64;

    // Master Gain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.0, this.ctx.currentTime);

    this.masterGain.connect(this.compressor);
    this.compressor.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);

    this.setupCosmicDrone();
  }

  setupCosmicDrone() {
    // 1. Sub-bass Singularity Drone (43.65 Hz - F1 note)
    const subOsc = this.ctx.createOscillator();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(43.65, this.ctx.currentTime);

    // 2. Detuned Overtone Oscillator (65.4 Hz - C2 fifth)
    const fifthOsc = this.ctx.createOscillator();
    fifthOsc.type = 'triangle';
    fifthOsc.frequency.setValueAtTime(65.4, this.ctx.currentTime);

    // 3. Ethereal High Shimmer Oscillator (261.6 Hz - C4)
    const shimmerOsc = this.ctx.createOscillator();
    shimmerOsc.type = 'sine';
    shimmerOsc.frequency.setValueAtTime(261.6, this.ctx.currentTime);

    // Lowpass Filter with resonance
    this.filterNode = this.ctx.createBiquadFilter();
    this.filterNode.type = 'lowpass';
    this.filterNode.frequency.setValueAtTime(180, this.ctx.currentTime);
    this.filterNode.Q.setValueAtTime(4.0, this.ctx.currentTime);

    // Slow LFO for gravitational pulsing (0.08 Hz)
    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.08, this.ctx.currentTime);

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(60, this.ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(this.filterNode.frequency);

    // Drone Gains
    const subGain = this.ctx.createGain();
    subGain.gain.setValueAtTime(0.45, this.ctx.currentTime);

    const fifthGain = this.ctx.createGain();
    fifthGain.gain.setValueAtTime(0.2, this.ctx.currentTime);

    const shimmerGain = this.ctx.createGain();
    shimmerGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

    subOsc.connect(subGain);
    fifthOsc.connect(fifthGain);
    shimmerOsc.connect(shimmerGain);

    subGain.connect(this.filterNode);
    fifthGain.connect(this.filterNode);
    shimmerGain.connect(this.filterNode);

    this.filterNode.connect(this.masterGain);

    subOsc.start();
    fifthOsc.start();
    shimmerOsc.start();
    lfo.start();

    this.droneNodes = [subOsc, fifthOsc, shimmerOsc];
    this.lfoNodes = [lfo];
  }

  toggle() {
    this.init();
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    if (!this.isPlaying) {
      // Fade in smoothly over 1.2s
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, this.ctx.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(0.7, this.ctx.currentTime + 1.2);
      this.isPlaying = true;
      this.triggerCelestialChime(523.25); // C5 welcome bell
    } else {
      // Fade out smoothly
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, this.ctx.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(0.0, this.ctx.currentTime + 0.8);
      this.isPlaying = false;
    }
    return this.isPlaying;
  }

  // Plays a crystal celestial chime (pentatonic scale harmonics)
  triggerCelestialChime(freq = 440) {
    if (!this.ctx || !this.isPlaying) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    // Exponential decay bell envelope
    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 2.5);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 2.6);
  }

  // Hyperjump relativistic Doppler warp sound
  triggerHyperjumpSound() {
    if (!this.ctx || !this.isPlaying) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    // Frequency sweeps from 80Hz up to 2400Hz (blueshift)
    osc.frequency.setValueAtTime(80, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(2400, this.ctx.currentTime + 1.2);

    gain.gain.setValueAtTime(0.0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.35, this.ctx.currentTime + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 1.5);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 1.6);
  }

  // Modulate filter based on camera distance or time dilation
  updateFrequency(dilationFactor) {
    if (this.filterNode && this.ctx) {
      const targetFreq = Math.min(1200, Math.max(80, 180 * dilationFactor));
      this.filterNode.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.1);
    }
  }

  // Get live audio frequency spectrum byte array (for HUD visualizer)
  getSpectrumData() {
    if (!this.analyser || !this.isPlaying) return new Uint8Array(16);
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(data);
    return data;
  }
}

export const cosmicAudio = new CosmicAudioEngine();
