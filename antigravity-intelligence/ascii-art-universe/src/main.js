import { AsciiRenderer } from './asciiRenderer.js';
import { CONCEPTS, generateStandaloneCode } from './concepts.js';
import { conceptGenerator } from './generator.js';
import { lofiAudio } from './audio.js';

class AsciiAtelierApp {
  constructor() {
    this.canvas = document.getElementById('main-canvas');
    this.renderer = new AsciiRenderer(this.canvas);

    this.currentConcept = CONCEPTS.bouquet;
    this.time = 0;
    this.pointer = { x: 0, y: 0, active: false };

    this.initUI();
    this.setConcept(this.currentConcept);
    this.animate();
  }

  initUI() {
    // Window Resize
    window.addEventListener('resize', () => {
      this.renderer.resize();
    });

    // Pointer tracking on canvas
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.pointer.x = e.clientX - rect.left;
      this.pointer.y = e.clientY - rect.top;
      this.pointer.active = true;

      // Mouse position shifts wind slightly
      const normX = (this.pointer.x / rect.width) * 2 - 1;
      this.renderer.wind = normX * 0.8;
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.pointer.active = false;
      this.renderer.wind = 0;
    });

    this.canvas.addEventListener('click', () => {
      // Interactive blossom bloom impulse
      this.renderer.bloomMultiplier = 2.2;
      setTimeout(() => { this.renderer.bloomMultiplier = 1.0; }, 400);

      lofiAudio.playBloomChime();
      lofiAudio.playKeyClick();
    });

    // Concept Pills
    const pills = document.querySelectorAll('.concept-pill');
    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        pills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');

        const conceptId = pill.dataset.id;
        if (CONCEPTS[conceptId]) {
          this.setConcept(CONCEPTS[conceptId]);
          lofiAudio.playBloomChime();
        }
      });
    });

    // Generator Input
    const genInput = document.getElementById('gen-input');
    const genBtn = document.getElementById('gen-btn');
    const runGenerator = () => {
      const val = genInput.value.trim();
      if (!val) return;
      const customConcept = conceptGenerator.generateFromPrompt(val);
      this.setConcept(customConcept);
      lofiAudio.playBloomChime();
    };
    genBtn.addEventListener('click', runGenerator);
    genInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') runGenerator();
    });

    // Surprise Me Button
    const surpriseBtn = document.getElementById('surprise-btn');
    surpriseBtn.addEventListener('click', () => {
      const surprise = conceptGenerator.getRandomSurprise();
      this.setConcept(surprise);
      lofiAudio.playBloomChime();
    });

    // Lo-fi Audio Toggle
    const audioBtn = document.getElementById('audio-btn');
    const audioIcon = document.getElementById('audio-icon');
    const audioLabel = document.getElementById('audio-label');
    audioBtn.addEventListener('click', () => {
      const isMuted = lofiAudio.toggleMute();
      audioIcon.textContent = isMuted ? '🔇' : '🎵';
      audioLabel.textContent = isMuted ? 'LOFI: OFF' : 'LOFI: ON';
      audioBtn.classList.toggle('active', !isMuted);
    });

    // Fullscreen Toggle
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const exitFullscreenBtn = document.getElementById('exit-fullscreen-btn');
    fullscreenBtn.addEventListener('click', () => {
      document.body.classList.add('fullscreen-mode');
      this.renderer.resize();
    });
    exitFullscreenBtn.addEventListener('click', () => {
      document.body.classList.remove('fullscreen-mode');
      this.renderer.resize();
    });

    // Palette & Glyph Selectors
    const palSelect = document.getElementById('palette-select');
    palSelect.addEventListener('change', (e) => {
      this.renderer.setPalette(e.target.value);
      lofiAudio.playKeyClick();
    });

    const glyphSelect = document.getElementById('glyph-select');
    glyphSelect.addEventListener('change', (e) => {
      this.renderer.setGlyphSet(e.target.value);
      lofiAudio.playKeyClick();
    });

    // Breeze Toggle
    const breezeBtn = document.getElementById('wind-toggle-btn');
    let breezeMode = 1;
    breezeBtn.addEventListener('click', () => {
      breezeMode = (breezeMode + 1) % 3;
      if (breezeMode === 0) {
        this.renderer.wind = 0;
        breezeBtn.textContent = '🍃 BREEZE: CALM';
      } else if (breezeMode === 1) {
        this.renderer.wind = 0.5;
        breezeBtn.textContent = '🍃 BREEZE: NORMAL';
      } else {
        this.renderer.wind = 1.6;
        breezeBtn.textContent = '🍃 BREEZE: GUSTY';
      }
      lofiAudio.playKeyClick();
    });

    // Code Copy Button
    const copyBtn = document.getElementById('copy-btn');
    const copyText = document.getElementById('copy-text');
    copyBtn.addEventListener('click', () => {
      const code = generateStandaloneCode(this.currentConcept);
      navigator.clipboard.writeText(code).then(() => {
        copyText.textContent = 'COPIED!';
        lofiAudio.playBloomChime();
        setTimeout(() => { copyText.textContent = 'COPY CODE'; }, 2000);
      });
    });

    // Code Download Button
    const downloadBtn = document.getElementById('download-btn');
    downloadBtn.addEventListener('click', () => {
      const code = generateStandaloneCode(this.currentConcept);
      const blob = new Blob([code], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ascii_${this.currentConcept.id}.html`;
      a.click();
      URL.revokeObjectURL(url);
      lofiAudio.playBloomChime();
    });
  }

  setConcept(concept) {
    this.currentConcept = concept;

    // Update Header Titles
    const titleEl = document.getElementById('art-title');
    const subtitleEl = document.getElementById('art-subtitle');
    const filenameEl = document.getElementById('code-filename');

    titleEl.innerHTML = concept.title.replace(/([A-Z][a-z]+)$/, '<span>$1</span>');
    subtitleEl.textContent = `${concept.subtitle} • Interactive Kinetic Canvas`;
    filenameEl.textContent = `ascii_${concept.id}.html`;

    // Update Palettes
    if (concept.defaultPalette) {
      this.renderer.setPalette(concept.defaultPalette);
      const palSelect = document.getElementById('palette-select');
      if (palSelect) palSelect.value = concept.defaultPalette;
    }
    if (concept.defaultGlyphs) {
      this.renderer.setGlyphSet(concept.defaultGlyphs);
      const glyphSelect = document.getElementById('glyph-select');
      if (glyphSelect) glyphSelect.value = concept.defaultGlyphs;
    }

    // Update Code Display
    this.updateCodeDisplay(concept);
  }

  updateCodeDisplay(concept) {
    const codeEl = document.getElementById('code-display');
    const rawCode = generateStandaloneCode(concept);

    // Escape and simple syntax colorization
    const escaped = rawCode
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    codeEl.innerHTML = escaped;
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    this.time += 0.02;

    this.renderer.resetGrid();

    // Render active concept onto character grid
    if (this.currentConcept && this.currentConcept.render) {
      this.currentConcept.render(this.renderer, this.time, this.pointer);
    }

    // Update floating blossom petals
    this.renderer.updateParticles(this.pointer);

    // Render character grid onto Canvas
    this.renderer.render();
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new AsciiAtelierApp();
});
