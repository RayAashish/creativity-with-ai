// High-Performance ASCII Canvas Renderer with Bloom, Color Layers & Wind Physics

export class AsciiRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    this.fontSize = 12;
    this.charWidth = 7.2;
    this.charHeight = 12.0;
    this.cols = 0;
    this.rows = 0;

    // Glyph sets
    this.glyphSets = {
      botanical: ' .:-=+*#%@░▒▓█',
      matrix: ' ｦｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜ',
      ascii: ' .`^",:;Il!i~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$',
      runic: ' ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛈᛉᛋᛏᛒᛖᛗᛚᛜᛟᛞ',
      math: ' ·÷±≈≠≤≥∑∏√∫∂∇∞∝',
      stars: ' .·:°*✦✧★✵'
    };
    this.activeGlyphs = this.glyphSets.botanical;

    // Color Palettes
    this.palettes = {
      bouquet: {
        bg: '#050705',
        stem: '#38b000',
        stemDark: '#1b4d00',
        leaf: '#70e000',
        blossom: '#ffffff',
        blossomPink: '#ff70a6',
        pollen: '#ffe600',
        glow: 'rgba(56, 176, 0, 0.25)'
      },
      matrix: {
        bg: '#020502',
        stem: '#00ff66',
        stemDark: '#005522',
        leaf: '#33ff99',
        blossom: '#ffffff',
        blossomPink: '#00ffaa',
        pollen: '#88ffcc',
        glow: 'rgba(0, 255, 102, 0.3)'
      },
      cyberpunk: {
        bg: '#06030c',
        stem: '#7700ff',
        stemDark: '#3b0080',
        leaf: '#00f0ff',
        blossom: '#ff0077',
        blossomPink: '#ff70a6',
        pollen: '#ffe600',
        glow: 'rgba(255, 0, 119, 0.3)'
      },
      amber: {
        bg: '#080502',
        stem: '#d4380d',
        stemDark: '#611b00',
        leaf: '#fb8500',
        blossom: '#ffb703',
        blossomPink: '#ffe49e',
        pollen: '#ffffff',
        glow: 'rgba(251, 133, 0, 0.3)'
      },
      ocean: {
        bg: '#02060d',
        stem: '#0077b6',
        stemDark: '#023e8a',
        leaf: '#00b4d8',
        blossom: '#90e0ef',
        blossomPink: '#7209b7',
        pollen: '#caf0f8',
        glow: 'rgba(0, 180, 216, 0.3)'
      },
      monochrome: {
        bg: '#0a0a0a',
        stem: '#adb5bd',
        stemDark: '#495057',
        leaf: '#dee2e6',
        blossom: '#f8f9fa',
        blossomPink: '#e9ecef',
        pollen: '#ffffff',
        glow: 'rgba(248, 249, 250, 0.25)'
      }
    };
    this.activePalette = this.palettes.bouquet;

    // Environmental physics
    this.wind = 0;
    this.targetWind = 0;
    this.bloomMultiplier = 1.0;
    this.time = 0;

    // Interactive Falling Petals / Sparks
    this.particles = [];
    this.initParticles(60);

    // Grid Buffer
    this.grid = [];
    this.colorGrid = [];

    this.resize();
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = this.canvas.getBoundingClientRect();
    const w = rect.width || window.innerWidth;
    const h = rect.height || window.innerHeight;

    this.canvas.width = w * dpr;
    this.canvas.height = h * dpr;
    this.ctx.scale(dpr, dpr);

    this.width = w;
    this.height = h;

    this.charWidth = this.fontSize * 0.6;
    this.charHeight = this.fontSize * 1.05;

    this.cols = Math.floor(w / this.charWidth);
    this.rows = Math.floor(h / this.charHeight);

    this.resetGrid();
  }

  resetGrid() {
    this.grid = new Array(this.cols * this.rows).fill(' ');
    this.colorGrid = new Array(this.cols * this.rows).fill('#ffffff');
  }

  setChar(col, row, char, color) {
    if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) return;
    const idx = row * this.cols + col;
    this.grid[idx] = char;
    this.colorGrid[idx] = color;
  }

  initParticles(count) {
    this.particles = [];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * (this.width || 800),
        y: Math.random() * (this.height || 600),
        vx: (Math.random() - 0.5) * 1.2,
        vy: 0.6 + Math.random() * 1.4,
        rot: Math.random() * Math.PI * 2,
        vrot: (Math.random() - 0.5) * 0.08,
        char: Math.random() > 0.5 ? '🌸' : (Math.random() > 0.5 ? '✦' : '•'),
        color: Math.random() > 0.4 ? '#ff70a6' : '#ffffff',
        size: 8 + Math.random() * 6
      });
    }
  }

  updateParticles(pointer) {
    for (const p of this.particles) {
      p.x += p.vx + this.wind * 1.5;
      p.y += p.vy;
      p.rot += p.vrot;

      // Mouse interactive wind
      if (pointer && pointer.active) {
        const dx = p.x - pointer.x;
        const dy = p.y - pointer.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120 && dist > 1) {
          p.x += (dx / dist) * 3.5;
          p.y += (dy / dist) * 3.5;
        }
      }

      // Recycle at bottom
      if (p.y > this.height + 20) {
        p.y = -20;
        p.x = Math.random() * this.width;
      }
      if (p.x < -20) p.x = this.width + 20;
      if (p.x > this.width + 20) p.x = -20;
    }
  }

  render() {
    const ctx = this.ctx;
    ctx.fillStyle = this.activePalette.bg;
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.font = `${this.fontSize}px 'JetBrains Mono', 'Courier New', monospace`;
    ctx.textBaseline = 'top';

    // Render characters
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const idx = r * this.cols + c;
        const char = this.grid[idx];
        if (char !== ' ') {
          ctx.fillStyle = this.colorGrid[idx];
          ctx.fillText(char, c * this.charWidth, r * this.charHeight);
        }
      }
    }

    // Render floating particle petals / sparks
    for (const p of this.particles) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.font = `${p.size}px 'JetBrains Mono', monospace`;
      ctx.fillText(p.char, -p.size / 2, -p.size / 2);
      ctx.restore();
    }
  }

  setPalette(name) {
    if (this.palettes[name]) {
      this.activePalette = this.palettes[name];
    }
  }

  setGlyphSet(name) {
    if (this.glyphSets[name]) {
      this.activeGlyphs = this.glyphSets[name];
    }
  }
}
