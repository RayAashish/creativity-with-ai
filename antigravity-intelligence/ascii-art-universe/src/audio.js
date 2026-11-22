// Procedural Lofi Ambient Chords & Mechanical Typing Audio Engine
// 100% self-contained Web Audio API

class LofiAudioEngine {
  constructor() {
    this.ctx = null;
    this.isInitialized = false;
    this.isMuted = true; // Start muted by default to respect browser autoplay policies
    this.masterGain = null;
    this.chordIndex = 0;
    this.chordTimer = null;

    // Dreamy Lofi Neo-Soul Chords (frequencies in Hz)
    this.chords = [
      [174.61, 220.00, 261.63, 329.63, 392.00], // Fmaj9
      [164.81, 196.00, 246.94, 293.66, 392.00], // Em7
      [146.83, 174.61, 220.00, 261.63, 329.63], // Dm9
      [130.81, 164.81, 196.00, 246.94, 329.63]  // Cmaj7
    ];
  }

  init() {
    if (this.isInitialized) return;

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.35, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // Warm lowpass filter for lofi tone
      this.filter = this.ctx.createBiquadFilter();
      this.filter.type = 'lowpass';
      this.filter.frequency.value = 1400;
      this.filter.connect(this.masterGain);

      // Stereo delay for ambient depth
      this.delay = this.ctx.createDelay();
      this.delay.delayTime.value = 0.45;
      this.feedback = this.ctx.createGain();
      this.feedback.gain.value = 0.35;
      this.delay.connect(this.feedback);
      this.feedback.connect(this.delay);
      this.delay.connect(this.filter);

      this.isInitialized = true;
      this.startChordProgression();
    } catch (e) {
      console.warn('Web Audio not initialized:', e);
    }
  }

  playChord(frequencies) {
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    frequencies.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      // Slight tape wobble / flutter detuning
      const wobble = (Math.random() - 0.5) * 0.8;
      osc.frequency.setValueAtTime(freq + wobble, now);

      const stagger = idx * 0.04;
      gain.gain.setValueAtTime(0.0001, now + stagger);
      gain.gain.linearRampToValueAtTime(0.06, now + stagger + 0.12);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + stagger + 3.8);

      osc.connect(gain);
      gain.connect(this.filter);
      gain.connect(this.delay);

      osc.start(now + stagger);
      osc.stop(now + stagger + 4.0);
    });
  }

  startChordProgression() {
    if (this.chordTimer) clearInterval(this.chordTimer);

    const playNext = () => {
      if (!this.isMuted) {
        this.playChord(this.chords[this.chordIndex]);
      }
      this.chordIndex = (this.chordIndex + 1) % this.chords.length;
    };

    playNext();
    this.chordTimer = setInterval(playNext, 4200);
  }

  // Mechanical keyboard click for code interactions
  playKeyClick() {
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800 + Math.random() * 400, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.035);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.045);
  }

  // Chime when generating or switching art
  playBloomChime() {
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      gain.gain.setValueAtTime(0.001, now + idx * 0.06);
      gain.gain.linearRampToValueAtTime(0.08, now + idx * 0.06 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.06 + 1.2);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 1.3);
    });
  }

  toggleMute() {
    if (!this.isInitialized) {
      this.init();
      this.isMuted = false;
      this.masterGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      return false;
    }

    this.isMuted = !this.isMuted;
    this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : 0.35, this.ctx.currentTime, 0.08);
    return this.isMuted;
  }
}

export const lofiAudio = new LofiAudioEngine();
