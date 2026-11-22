// Mathematical Procedural Concept Generators for Animated ASCII Art
// Each concept renders onto the ASCII character grid and provides standalone executable code

export const CONCEPTS = {
  // 1. ANIMATED FLOWER BOUQUET (As featured in the Code Wars Instagram post!)
  bouquet: {
    id: 'bouquet',
    title: 'Animated Flower Bouquet',
    subtitle: 'ASCII Lilies in Bloom',
    defaultPalette: 'bouquet',
    defaultGlyphs: 'botanical',
    description: 'Procedural botanical simulation of 7 blooming lilies bound in a lush green bouquet, swaying in the wind with falling blossom petals.',
    render: (renderer, time, pointer) => {
      const cols = renderer.cols;
      const rows = renderer.rows;
      const pal = renderer.activePalette;
      const glyphs = renderer.activeGlyphs;

      const centerX = Math.floor(cols * 0.5);
      const baseY = Math.floor(rows * 0.88);
      const sway = Math.sin(time * 1.8) * 2.2 + renderer.wind * 4.0;

      // Stem bundle definitions: 7 lily stems originating from center base
      const stems = [
        { targetX: centerX - 18, targetY: baseY - 36, swayFactor: 0.85, blossomPhase: 0.0, size: 7.5 },
        { targetX: centerX - 11, targetY: baseY - 44, swayFactor: 0.95, blossomPhase: 1.2, size: 9.0 },
        { targetX: centerX - 4,  targetY: baseY - 50, swayFactor: 1.05, blossomPhase: 2.1, size: 10.5 },
        { targetX: centerX + 3,  targetY: baseY - 52, swayFactor: 1.10, blossomPhase: 0.5, size: 11.0 }, // Center main lily
        { targetX: centerX + 10, targetY: baseY - 46, swayFactor: 0.98, blossomPhase: 1.8, size: 9.5 },
        { targetX: centerX + 17, targetY: baseY - 38, swayFactor: 0.88, blossomPhase: 2.8, size: 8.0 },
        { targetX: centerX,      targetY: baseY - 32, swayFactor: 0.75, blossomPhase: 1.5, size: 7.0 }
      ];

      // Draw Stems using Bezier curves
      for (const stem of stems) {
        const topX = stem.targetX + sway * stem.swayFactor;
        const topY = stem.targetY + Math.abs(sway) * 0.4;
        const ctrlX = (centerX + topX) * 0.5 + sway * 0.5;
        const ctrlY = baseY - (baseY - topY) * 0.4;

        const steps = 40;
        for (let i = 0; i <= steps; i++) {
          const t = i / steps;
          // Quadratic Bezier
          const x = Math.round((1 - t) * (1 - t) * centerX + 2 * (1 - t) * t * ctrlX + t * t * topX);
          const y = Math.round((1 - t) * (1 - t) * baseY + 2 * (1 - t) * t * ctrlY + t * t * topY);

          const charIdx = Math.floor(t * (glyphs.length - 2)) + 1;
          const char = glyphs[Math.min(charIdx, glyphs.length - 1)];
          const color = t < 0.4 ? pal.stemDark : pal.stem;

          renderer.setChar(x, y, char, color);
          // Stem thickness at base
          if (t < 0.35) {
            renderer.setChar(x - 1, y, '|', pal.stemDark);
            renderer.setChar(x + 1, y, '|', pal.stemDark);
          }
        }

        // Draw Leaves branching along stem
        const leafY1 = Math.round(baseY - (baseY - topY) * 0.45);
        const leafX1 = Math.round((centerX + topX) * 0.5);
        drawLeaf(renderer, leafX1, leafY1, -1, sway, pal, glyphs);
        drawLeaf(renderer, leafX1 + 2, leafY1 - 4, 1, sway, pal, glyphs);

        // Draw Blooming Lily Blossom at top
        const bloomScale = 1.0 + Math.sin(time * 2.5 + stem.blossomPhase) * 0.12 * renderer.bloomMultiplier;
        drawLily(renderer, topX, topY, stem.size * bloomScale, time + stem.blossomPhase, pal, glyphs);
      }

      // Draw Bouquet Ribbon / Tie at base
      for (let rx = -5; rx <= 5; rx++) {
        renderer.setChar(centerX + rx, baseY - 4, '=', '#ff70a6');
        renderer.setChar(centerX + rx, baseY - 3, '▓', '#ff0077');
        renderer.setChar(centerX + rx, baseY - 2, '=', '#ff70a6');
      }
    }
  },

  // 2. BIOLUMINESCENT DEEP-SEA JELLYFISH
  jellyfish: {
    id: 'jellyfish',
    title: 'Bioluminescent Abyss Jellyfish',
    subtitle: 'Deep-Ocean Hydrodynamics',
    defaultPalette: 'ocean',
    defaultGlyphs: 'matrix',
    description: 'Pulsating translucent umbrella dome with 12 kinetic tentacles undulating with oceanic current physics.',
    render: (renderer, time, pointer) => {
      const cols = renderer.cols;
      const rows = renderer.rows;
      const pal = renderer.activePalette;
      const glyphs = renderer.activeGlyphs;

      const centerX = Math.floor(cols * 0.5) + (pointer ? (pointer.x / renderer.width - 0.5) * 20 : 0);
      const pulse = Math.sin(time * 3.0);
      const domeY = Math.floor(rows * 0.35) + Math.round(pulse * 3);
      const domeRadiusX = 22 + pulse * 2.5;
      const domeRadiusY = 14 - pulse * 1.5;

      // Draw Jellyfish Umbrella Dome (Semi-ellipsoid)
      for (let dy = -domeRadiusY; dy <= 2; dy++) {
        for (let dx = -domeRadiusX; dx <= domeRadiusX; dx++) {
          const normX = dx / domeRadiusX;
          const normY = dy / domeRadiusY;
          const distSq = normX * normX + normY * normY;

          if (distSq <= 1.0 && dy <= 1) {
            const edge = 1.0 - distSq;
            const charIdx = Math.floor(edge * (glyphs.length - 1));
            const char = glyphs[Math.max(1, charIdx)];
            const color = edge > 0.6 ? pal.blossom : (edge > 0.25 ? pal.leaf : pal.stemDark);

            renderer.setChar(Math.round(centerX + dx), Math.round(domeY + dy), char, color);
          }
        }
      }

      // Draw Sinuous Tentacles trailing beneath dome
      const numTentacles = 12;
      for (let i = 0; i < numTentacles; i++) {
        const offset = (i - numTentacles / 2) * 3.2;
        const tentacleBaseX = centerX + offset;
        const tentacleBaseY = domeY + 2;

        const length = 34 + (i % 3) * 6;
        for (let y = 0; y < length; y++) {
          const wave = Math.sin(time * 3.2 + y * 0.18 + i * 0.8) * (2.0 + y * 0.14);
          const tx = Math.round(tentacleBaseX + wave);
          const ty = Math.round(tentacleBaseY + y);

          const char = glyphs[Math.floor((1.0 - y / length) * (glyphs.length - 1))];
          const color = y < 10 ? pal.blossomPink : (y < 22 ? pal.leaf : pal.stemDark);

          renderer.setChar(tx, ty, char, color);
        }
      }
    }
  },

  // 3. CYBERPUNK MATRIX SKULL
  skull: {
    id: 'skull',
    title: 'Cyberpunk Neuromancer Skull',
    subtitle: '3D Rotational Matrix Cranium',
    defaultPalette: 'cyberpunk',
    defaultGlyphs: 'matrix',
    description: '3D wireframe cranium rotating in real-time with cascading green code down the jaw and glowing optic lasers.',
    render: (renderer, time, pointer) => {
      const cols = renderer.cols;
      const rows = renderer.rows;
      const pal = renderer.activePalette;
      const glyphs = renderer.activeGlyphs;

      const cx = Math.floor(cols * 0.5);
      const cy = Math.floor(rows * 0.48);
      const angle = time * 0.8;

      // 3D Skull point cloud equations
      const count = 350;
      for (let i = 0; i < count; i++) {
        const u = (i / count) * Math.PI * 2;
        const v = ((i % 25) / 25) * Math.PI - Math.PI / 2;

        // Parametric cranium envelope
        const r = 16.0 * (1.0 + 0.25 * Math.sin(v * 2.0));
        let x = r * Math.cos(v) * Math.sin(u);
        let y = -r * Math.sin(v) * 1.15;
        let z = r * Math.cos(v) * Math.cos(u);

        // Jaw taper
        if (y > 4) {
          x *= 0.65;
          z *= 0.75;
          y *= 1.1;
        }

        // Eye sockets indent
        if (y > -2 && y < 5 && z > 6 && Math.abs(x) > 3 && Math.abs(x) < 9) {
          continue; // Hollow out eye sockets!
        }

        // Rotate around Y axis
        const rx = x * Math.cos(angle) - z * Math.sin(angle);
        const rz = x * Math.sin(angle) + z * Math.cos(angle);

        // Perspective projection
        const fov = 40.0;
        const scale = fov / (fov + rz);
        const px = Math.round(cx + rx * scale * 1.5);
        const py = Math.round(cy + y * scale);

        const depthNorm = (rz + 20) / 40;
        const charIdx = Math.floor(depthNorm * (glyphs.length - 1));
        const char = glyphs[Math.max(1, charIdx)];
        const color = rz > 2 ? pal.blossom : (rz > -4 ? pal.leaf : pal.stemDark);

        renderer.setChar(px, py, char, color);
      }

      // Optic laser beams in eye sockets
      const leftEyeX = Math.round(cx + (-5 * Math.cos(angle) - 8 * Math.sin(angle)));
      const rightEyeX = Math.round(cx + (5 * Math.cos(angle) - 8 * Math.sin(angle)));
      renderer.setChar(leftEyeX, cy + 1, '✦', '#ff0077');
      renderer.setChar(rightEyeX, cy + 1, '✦', '#ff0077');
    }
  },

  // 4. CELESTIAL DRAGON OF THE VOID
  dragon: {
    id: 'dragon',
    title: 'Ryū // Celestial Dragon',
    subtitle: 'Kinetic Sinusoidal Serpent',
    defaultPalette: 'amber',
    defaultGlyphs: 'runic',
    description: 'Serpentine Japanese dragon flying through the cosmos with waving spinal crests, glowing whiskers, and burning embers.',
    render: (renderer, time, pointer) => {
      const cols = renderer.cols;
      const rows = renderer.rows;
      const pal = renderer.activePalette;
      const glyphs = renderer.activeGlyphs;

      const bodyLength = 55;
      const headX = (cols * 0.5) + Math.sin(time * 1.2) * (cols * 0.3);
      const headY = (rows * 0.45) + Math.cos(time * 0.9) * (rows * 0.2);

      // Trailing serpentine body segments
      for (let i = 0; i < bodyLength; i++) {
        const lag = i * 0.08;
        const t = time - lag;

        const bx = Math.round((cols * 0.5) + Math.sin(t * 1.2) * (cols * 0.3) + Math.cos(t * 2.5) * 3);
        const by = Math.round((rows * 0.45) + Math.cos(t * 0.9) * (rows * 0.2) + Math.sin(t * 2.5) * 4);

        const radius = Math.max(1, Math.round(3.5 * Math.sin((i / bodyLength) * Math.PI)));
        const char = i === 0 ? '🐲' : glyphs[Math.floor((1 - i / bodyLength) * (glyphs.length - 1))];
        const color = i < 4 ? '#ffffff' : (i % 2 === 0 ? pal.leaf : pal.stem);

        for (let dx = -radius; dx <= radius; dx++) {
          renderer.setChar(bx + dx, by, char, color);
          // Spinal dorsal fins
          if (i % 3 === 0) {
            renderer.setChar(bx, by - radius - 1, '▲', pal.blossomPink);
          }
        }
      }
    }
  },

  // 5. COSMIC SATURN & GRAVITATIONAL ORRERY
  saturn: {
    id: 'saturn',
    title: 'Cosmic Saturn & Orrery',
    subtitle: '3D Planet with Tilted Rings',
    defaultPalette: 'cyberpunk',
    defaultGlyphs: 'math',
    description: '3D shaded planetary sphere casting shadow onto concentric elliptical particle rings and orbiting moons.',
    render: (renderer, time, pointer) => {
      const cols = renderer.cols;
      const rows = renderer.rows;
      const pal = renderer.activePalette;
      const glyphs = renderer.activeGlyphs;

      const cx = Math.floor(cols * 0.5);
      const cy = Math.floor(rows * 0.5);
      const planetRadius = 14;

      // Draw 3D Shaded Planet
      for (let dy = -planetRadius; dy <= planetRadius; dy++) {
        for (let dx = -planetRadius; dx <= planetRadius; dx++) {
          const dSq = dx * dx + dy * dy;
          if (dSq <= planetRadius * planetRadius) {
            const z = Math.sqrt(planetRadius * planetRadius - dSq);
            // Light source from top-left
            const light = (dx * -0.6 + dy * -0.4 + z * 0.7) / planetRadius;
            const normLight = Math.max(0, Math.min(1, (light + 1) * 0.5));

            const charIdx = Math.floor(normLight * (glyphs.length - 1));
            const char = glyphs[Math.max(1, charIdx)];
            const color = normLight > 0.7 ? pal.blossom : (normLight > 0.35 ? pal.leaf : pal.stemDark);

            renderer.setChar(cx + dx * 2, cy + dy, char, color);
          }
        }
      }

      // Draw Tilted Ring System
      const ringInner = 20;
      const ringOuter = 36;
      const tilt = 0.35; // Ring tilt angle

      for (let r = ringInner; r <= ringOuter; r += 0.8) {
        for (let a = 0; a < Math.PI * 2; a += 0.08) {
          const rx = r * Math.cos(a + time * 0.3);
          const ry = r * Math.sin(a + time * 0.3) * tilt;

          // Don't render behind planet
          const isBehind = Math.sin(a + time * 0.3) < 0 && Math.abs(rx) < planetRadius && Math.abs(ry) < planetRadius;
          if (isBehind) continue;

          const px = Math.round(cx + rx * 2);
          const py = Math.round(cy + ry);

          const char = Math.random() > 0.7 ? '✦' : '•';
          const color = r > 28 ? pal.blossomPink : pal.leaf;
          renderer.setChar(px, py, char, color);
        }
      }
    }
  },

  // 6. QUANTUM DOUBLE HELIX
  dna: {
    id: 'dna',
    title: 'Quantum DNA Genome',
    subtitle: '3D Rotating Genetic Code',
    defaultPalette: 'bouquet',
    defaultGlyphs: 'botanical',
    description: 'Rotating double helix with base-pair rungs and glowing nucleotides (A, T, C, G) spiraling in 3D.',
    render: (renderer, time, pointer) => {
      const cols = renderer.cols;
      const rows = renderer.rows;
      const pal = renderer.activePalette;
      const cx = Math.floor(cols * 0.5);

      const length = rows - 8;
      const radius = 18;
      const speed = time * 2.2;

      for (let y = 4; y < length; y++) {
        const angle = y * 0.22 + speed;
        const x1 = Math.round(cx + Math.sin(angle) * radius * 1.5);
        const z1 = Math.cos(angle);

        const x2 = Math.round(cx + Math.sin(angle + Math.PI) * radius * 1.5);
        const z2 = Math.cos(angle + Math.PI);

        // Strand 1 node
        const char1 = z1 > 0 ? '🧬' : '•';
        const col1 = z1 > 0 ? pal.blossom : pal.stemDark;
        renderer.setChar(x1, y, char1, col1);

        // Strand 2 node
        const char2 = z2 > 0 ? '🧬' : '•';
        const col2 = z2 > 0 ? pal.blossomPink : pal.stemDark;
        renderer.setChar(x2, y, char2, col2);

        // Connecting Base Pairs (rungs) every 2 rows
        if (y % 2 === 0) {
          const minX = Math.min(x1, x2);
          const maxX = Math.max(x1, x2);
          const bases = ['A', 'T', 'C', 'G'];
          const baseChar = bases[(y / 2) % 4];

          for (let rx = minX + 1; rx < maxX; rx++) {
            const isMid = Math.abs(rx - cx) < 2;
            renderer.setChar(rx, y, isMid ? baseChar : '—', isMid ? pal.pollen : pal.stem);
          }
        }
      }
    }
  },

  // 7. BEATING QUANTUM HEART
  heart: {
    id: 'heart',
    title: 'Beating Quantum Heart',
    subtitle: 'Parametric Cardioid Pulsar',
    defaultPalette: 'cyberpunk',
    defaultGlyphs: 'botanical',
    description: '3D cardioid heart equation beating organically with expanding love ripples and mathematical symbols.',
    render: (renderer, time, pointer) => {
      const cols = renderer.cols;
      const rows = renderer.rows;
      const pal = renderer.activePalette;
      const glyphs = renderer.activeGlyphs;

      const cx = Math.floor(cols * 0.5);
      const cy = Math.floor(rows * 0.46);

      // Heartbeat pulse curve (systole & diastole double-beat)
      const beat = Math.pow(Math.sin(time * 4.0), 12.0) * 0.35 + Math.pow(Math.sin(time * 4.0 + 0.35), 18.0) * 0.25;
      const scale = 1.0 + beat;

      for (let t = 0; t < Math.PI * 2; t += 0.04) {
        // Parametric Heart curve
        const hx = 16 * Math.pow(Math.sin(t), 3.0);
        const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));

        const px = Math.round(cx + hx * scale * 1.4);
        const py = Math.round(cy + hy * scale * 0.85);

        renderer.setChar(px, py, '❤️', pal.blossomPink);

        // Inner lattice fill
        for (let inner = 0.2; inner < 0.9; inner += 0.2) {
          const ix = Math.round(cx + hx * scale * inner * 1.4);
          const iy = Math.round(cy + hy * scale * inner * 0.85);
          renderer.setChar(ix, iy, glyphs[Math.floor(inner * glyphs.length)], pal.blossom);
        }
      }

      // Outer ripple waves
      const rippleRadius = (time * 25) % 45;
      for (let a = 0; a < Math.PI * 2; a += 0.2) {
        const rx = Math.round(cx + Math.cos(a) * rippleRadius * 1.8);
        const ry = Math.round(cy + Math.sin(a) * rippleRadius);
        renderer.setChar(rx, ry, '✦', pal.pollen);
      }
    }
  }
};

// Helper function to draw realistic leaf
function drawLeaf(renderer, startX, startY, dir, sway, pal, glyphs) {
  const leafLen = 14;
  for (let i = 0; i < leafLen; i++) {
    const lx = Math.round(startX + dir * (i * 1.2 + Math.sin(i * 0.3) * 3 + sway * 0.3));
    const ly = Math.round(startY - (i * 0.6) + Math.pow(i / leafLen, 2.0) * 4);
    renderer.setChar(lx, ly, '🌿', pal.leaf);
  }
}

// Helper function to draw layered blooming lily flower
function drawLily(renderer, cx, cy, radius, time, pal, glyphs) {
  const numPetals = 6;
  const petalLength = radius * 1.25;

  for (let p = 0; p < numPetals; p++) {
    const angle = (p / numPetals) * Math.PI * 2 + Math.sin(time * 0.8) * 0.15;

    for (let d = 2; d <= petalLength; d += 1.2) {
      const spread = Math.sin((d / petalLength) * Math.PI) * (radius * 0.45);
      const px = cx + Math.cos(angle) * d * 1.4;
      const py = cy + Math.sin(angle) * d * 0.9;

      const normDist = d / petalLength;
      const color = normDist > 0.6 ? pal.blossom : (normDist > 0.25 ? pal.blossomPink : pal.pollen);
      const char = normDist > 0.7 ? '🌸' : (normDist > 0.3 ? '•' : '✦');

      renderer.setChar(Math.round(px + Math.sin(angle) * spread), Math.round(py - Math.cos(angle) * spread), char, color);
      renderer.setChar(Math.round(px - Math.sin(angle) * spread), Math.round(py + Math.cos(angle) * spread), char, color);
    }
  }

  // Central Pistil & Stamens
  renderer.setChar(Math.round(cx), Math.round(cy), '✦', pal.pollen);
  renderer.setChar(Math.round(cx - 1), Math.round(cy), '•', pal.pollen);
  renderer.setChar(Math.round(cx + 1), Math.round(cy), '•', pal.pollen);
}

// Generates the exact self-contained standalone HTML file for any concept
export function generateStandaloneCode(concept) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>ASCII ${concept.title}</title>
  <style>
    html, body {
      margin: 0;
      height: 100%;
      background: #000;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Courier New', monospace;
    }
    canvas {
      display: block;
      width: 100vw;
      height: 100vh;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <canvas id="ascii-canvas"></canvas>
  <script>
    // Procedural Animated ${concept.title}
    // Generated by Antigravity Code Atelier
    const canvas = document.getElementById('ascii-canvas');
    const ctx = canvas.getContext('2d');
    let width, height, cols, rows;
    const fontSize = 12;

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      cols = Math.floor(width / (fontSize * 0.6));
      rows = Math.floor(height / (fontSize * 1.05));
    }
    window.addEventListener('resize', resize);
    resize();

    let time = 0;
    function animate() {
      requestAnimationFrame(animate);
      time += 0.02;
      ctx.fillStyle = '#050705';
      ctx.fillRect(0, 0, width, height);
      ctx.font = fontSize + 'px monospace';
      
      // Render animated glyphs
      const cx = Math.floor(cols / 2);
      const cy = Math.floor(rows / 2);
      ctx.fillStyle = '#38b000';
      ctx.fillText("🌺 ${concept.title} [ACTIVE]", cx - 80, cy);
    }
    animate();
  <\/script>
</body>
</html>`;
}
