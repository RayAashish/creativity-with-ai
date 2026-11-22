// The Infinite Concept Generator
// Procedural synthesis of thousands of animated ASCII concepts via Superformulas & Parametric Curves

export class InfiniteConceptGenerator {
  constructor() {
    this.conceptLibrary = [
      { name: 'Crystal Lotus', formula: 'superformula', m: 8, n1: 0.5, n2: 1.0, n3: 1.0, palette: 'bouquet' },
      { name: 'Solar Phoenix', formula: 'lissajous', a: 5, b: 4, delta: Math.PI / 2, palette: 'amber' },
      { name: 'Quantum Nautilus', formula: 'spiral', turns: 4.5, growth: 1.18, palette: 'ocean' },
      { name: 'Cosmic Mandala', formula: 'superformula', m: 12, n1: 1.2, n2: 1.7, n3: 1.7, palette: 'cyberpunk' },
      { name: 'Hypercube Tesseract', formula: 'hypercube', dim: 4, palette: 'matrix' },
      { name: 'Tree of Eternity', formula: 'tree', depth: 6, palette: 'bouquet' },
      { name: 'Supernova Vortex', formula: 'lissajous', a: 7, b: 6, delta: Math.PI / 3, palette: 'amber' },
      { name: 'Alchemical Caduceus', formula: 'helix', strands: 3, palette: 'cyberpunk' }
    ];
  }

  generateFromPrompt(prompt) {
    const p = prompt.toLowerCase();
    // Compute hash for deterministic procedural generation
    let hash = 0;
    for (let i = 0; i < p.length; i++) {
      hash = (hash << 5) - hash + p.charCodeAt(i);
      hash |= 0;
    }

    const m = (Math.abs(hash) % 12) + 3; // Symmetry petals (3 to 14)
    const n1 = 0.2 + (Math.abs(hash % 30) / 10);
    const n2 = 0.5 + (Math.abs(hash % 20) / 10);
    const n3 = n2;

    const palettes = ['bouquet', 'matrix', 'cyberpunk', 'amber', 'ocean', 'monochrome'];
    const palette = palettes[Math.abs(hash) % palettes.length];

    const glyphSets = ['botanical', 'matrix', 'ascii', 'runic', 'math', 'stars'];
    const glyphs = glyphSets[Math.abs(hash * 3) % glyphSets.length];

    return {
      id: `gen-${Math.abs(hash)}`,
      title: prompt.charAt(0).toUpperCase() + prompt.slice(1),
      subtitle: `Procedural Parametric Manifold [M=${m}]`,
      defaultPalette: palette,
      defaultGlyphs: glyphs,
      description: `Synthesized parametric kinetic geometry with m=${m} rotational symmetries, derived from semantic prompt "${prompt}".`,
      render: (renderer, time, pointer) => {
        const cols = renderer.cols;
        const rows = renderer.rows;
        const pal = renderer.activePalette;
        const activeGlyphs = renderer.activeGlyphs;

        const cx = Math.floor(cols * 0.5);
        const cy = Math.floor(rows * 0.48);
        const radius = 24.0;

        // Johan Gielis Superformula in polar coordinates: r(phi)
        for (let phi = 0; phi < Math.PI * 2; phi += 0.02) {
          const t1 = Math.pow(Math.abs(Math.cos(m * phi / 4.0)), n2);
          const t2 = Math.pow(Math.abs(Math.sin(m * phi / 4.0)), n3);
          const rBase = Math.pow(t1 + t2, -1.0 / n1);

          const r = rBase * radius * (1.0 + Math.sin(time * 3.0 + phi * 2.0) * 0.15);
          const px = Math.round(cx + r * Math.cos(phi + time * 0.4) * 1.5);
          const py = Math.round(cy + r * Math.sin(phi + time * 0.4));

          const normR = Math.min(1.0, r / (radius * 1.5));
          const charIdx = Math.floor(normR * (activeGlyphs.length - 1));
          const char = activeGlyphs[Math.max(1, charIdx)];
          const col = normR > 0.6 ? pal.blossom : (normR > 0.25 ? pal.leaf : pal.stem);

          renderer.setChar(px, py, char, col);

          // Inner harmonic echo
          const rInner = r * 0.5;
          const ix = Math.round(cx + rInner * Math.cos(-phi + time * 0.6) * 1.5);
          const iy = Math.round(cy + rInner * Math.sin(-phi + time * 0.6));
          renderer.setChar(ix, iy, '✦', pal.blossomPink);
        }
      }
    };
  }

  getRandomSurprise() {
    const adjectives = ['Cosmic', 'Bioluminescent', 'Cyberpunk', 'Quantum', 'Botanical', 'Alchemical', 'Hyper-dimensional', 'Ethereal'];
    const nouns = ['Lotus', 'Dragon', 'Phoenix', 'Nautilus', 'Mandala', 'Vortex', 'Orrery', 'Hydra', 'Galaxy', 'Sakura Bouquet'];

    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    return this.generateFromPrompt(`${adj} ${noun}`);
  }
}

export const conceptGenerator = new InfiniteConceptGenerator();
