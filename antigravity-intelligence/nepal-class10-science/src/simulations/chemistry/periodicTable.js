// Interactive Modern Periodic Table & Electronic Configuration Explorer

export class PeriodicTableSimulation {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.selectedElement = this.elements[0]; // Hydrogen by default
    this.render();
  }

  get elements() {
    return [
      { z: 1, s: 'H', n: 'Hydrogen', m: 1.008, grp: 'IA (1)', per: 1, val: 1, conf: '1s¹', k: '1', l: '0', m_sh: '0', type: 'Non-metal', use: 'Rocket fuel, Sun fusion' },
      { z: 2, s: 'He', n: 'Helium', m: 4.003, grp: 'VIIIA (18)', per: 1, val: 0, conf: '1s²', k: '2', l: '0', m_sh: '0', type: 'Noble Gas', use: 'Weather balloons, MRI magnets' },
      { z: 3, s: 'Li', n: 'Lithium', m: 6.94, grp: 'IA (1)', per: 2, val: 1, conf: '1s² 2s¹', k: '2', l: '1', m_sh: '0', type: 'Alkali Metal', use: 'EV & Phone batteries' },
      { z: 4, s: 'Be', n: 'Beryllium', m: 9.012, grp: 'IIA (2)', per: 2, val: 2, conf: '1s² 2s²', k: '2', l: '2', m_sh: '0', type: 'Alkaline Earth', use: 'Aerospace alloys, X-ray tubes' },
      { z: 5, s: 'B', n: 'Boron', m: 10.81, grp: 'IIIA (13)', per: 2, val: 3, conf: '1s² 2s² 2p¹', k: '2', l: '3', m_sh: '0', type: 'Metalloid', use: 'Pyrex heat glass, fertilizers' },
      { z: 6, s: 'C', n: 'Carbon', m: 12.011, grp: 'IVA (14)', per: 2, val: 4, conf: '1s² 2s² 2p²', k: '2', l: '4', m_sh: '0', type: 'Non-metal', use: 'Basis of all life, diamond, graphite' },
      { z: 7, s: 'N', n: 'Nitrogen', m: 14.007, grp: 'VA (15)', per: 2, val: 3, conf: '1s² 2s² 2p³', k: '2', l: '5', m_sh: '0', type: 'Non-metal', use: '78% of Earth air, protein, urea fertilizer' },
      { z: 8, s: 'O', n: 'Oxygen', m: 15.999, grp: 'VIA (16)', per: 2, val: 2, conf: '1s² 2s² 2p⁴', k: '2', l: '6', m_sh: '0', type: 'Non-metal', use: 'Respiration, combustion, ozone layer' },
      { z: 9, s: 'F', n: 'Fluorine', m: 18.998, grp: 'VIIA (17)', per: 2, val: 1, conf: '1s² 2s² 2p⁵', k: '2', l: '7', m_sh: '0', type: 'Halogen', use: 'Toothpaste (cavity prevention), Teflon' },
      { z: 10, s: 'Ne', n: 'Neon', m: 20.180, grp: 'VIIIA (18)', per: 2, val: 0, conf: '1s² 2s² 2p⁶', k: '2', l: '8', m_sh: '0', type: 'Noble Gas', use: 'Glowing red advertising signs' },
      { z: 11, s: 'Na', n: 'Sodium', m: 22.990, grp: 'IA (1)', per: 3, val: 1, conf: '[Ne] 3s¹', k: '2', l: '8', m_sh: '1', type: 'Alkali Metal', use: 'Table salt (NaCl), nerve signaling' },
      { z: 12, s: 'Mg', n: 'Magnesium', m: 24.305, grp: 'IIA (2)', per: 3, val: 2, conf: '[Ne] 3s²', k: '2', l: '8', m_sh: '2', type: 'Alkaline Earth', use: 'Chlorophyll center in plants, fireworks' },
      { z: 13, s: 'Al', n: 'Aluminium', m: 26.982, grp: 'IIIA (13)', per: 3, val: 3, conf: '[Ne] 3s² 3p¹', k: '2', l: '8', m_sh: '3', type: 'Post-transition', use: 'Airplane bodies, kitchen foil, windows' },
      { z: 14, s: 'Si', n: 'Silicon', m: 28.085, grp: 'IVA (14)', per: 3, val: 4, conf: '[Ne] 3s² 3p²', k: '2', l: '8', m_sh: '4', type: 'Metalloid', use: 'Computer microchips, solar cells, sand' },
      { z: 15, s: 'P', n: 'Phosphorus', m: 30.974, grp: 'VA (15)', per: 3, val: 3, conf: '[Ne] 3s² 3p³', k: '2', l: '8', m_sh: '5', type: 'Non-metal', use: 'DNA backbone, ATP energy, matchsticks' },
      { z: 16, s: 'S', n: 'Sulfur', m: 32.06, grp: 'VIA (16)', per: 3, val: 2, conf: '[Ne] 3s² 3p⁴', k: '2', l: '8', m_sh: '6', type: 'Non-metal', use: 'Sulfuric acid (king of chemicals), rubber' },
      { z: 17, s: 'Cl', n: 'Chlorine', m: 35.45, grp: 'VIIA (17)', per: 3, val: 1, conf: '[Ne] 3s² 3p⁵', k: '2', l: '8', m_sh: '7', type: 'Halogen', use: 'Drinking water purification, bleach' },
      { z: 18, s: 'Ar', n: 'Argon', m: 39.948, grp: 'VIIIA (18)', per: 3, val: 0, conf: '[Ne] 3s² 3p⁶', k: '2', l: '8', m_sh: '8', type: 'Noble Gas', use: 'Inert gas in incandescent electric bulbs' },
      { z: 19, s: 'K', n: 'Potassium', m: 39.098, grp: 'IA (1)', per: 4, val: 1, conf: '[Ar] 4s¹', k: '2', l: '8', m_sh: '8', n_sh: '1', type: 'Alkali Metal', use: 'NPK crop fertilizers, banana nutrient' },
      { z: 20, s: 'Ca', n: 'Calcium', m: 40.078, grp: 'IIA (2)', per: 4, val: 2, conf: '[Ar] 4s²', k: '2', l: '8', m_sh: '8', n_sh: '2', type: 'Alkaline Earth', use: 'Human bones, teeth, limestone (CaCO₃)' },
      { z: 26, s: 'Fe', n: 'Iron', m: 55.845, grp: 'VIIIB (8)', per: 4, val: 2, conf: '[Ar] 3d⁶ 4s²', k: '2', l: '8', m_sh: '14', n_sh: '2', type: 'Transition Metal', use: 'Bridges, steel buildings, hemoglobin blood' },
      { z: 29, s: 'Cu', n: 'Copper', m: 63.546, grp: 'IB (11)', per: 4, val: 2, conf: '[Ar] 3d¹⁰ 4s¹', k: '2', l: '8', m_sh: '18', n_sh: '1', type: 'Transition Metal', use: 'Electrical wiring cables, brass & bronze' },
      { z: 30, s: 'Zn', n: 'Zinc', m: 65.38, grp: 'IIB (12)', per: 4, val: 2, conf: '[Ar] 3d¹⁰ 4s²', k: '2', l: '8', m_sh: '18', n_sh: '2', type: 'Transition Metal', use: 'Galvanizing corrugated iron sheets in Nepal' },
      { z: 79, s: 'Au', n: 'Gold', m: 196.97, grp: 'IB (11)', per: 6, val: 1, conf: '[Xe] 4f¹⁴ 5d¹⁰ 6s¹', k: '2', l: '8', m_sh: '18', type: 'Noble Metal', use: 'Jewelry, corrosion-free satellite connectors' }
    ];
  }

  render() {
    if (!this.container) return;

    const el = this.selectedElement;

    this.container.innerHTML = `
      <div class="lab-card">
        <div class="lab-header">
          <div>
            <h3>Modern Periodic Table & Electronic Configurations (आधुनिक आवधिक तालिका)</h3>
            <p class="lab-desc">Click on any element to reveal atomic numbers, Bohr shell distributions (K, L, M, N), subshell configurations, valency, and real-world uses in Nepal.</p>
          </div>
          <div class="formula-badge">Modern Periodic Law (Henry Moseley)</div>
        </div>

        <div class="ptable-stage">
          <!-- Element Grid -->
          <div class="element-grid">
            ${this.elements.map(item => `
              <div class="el-cell ${item.s === el.s ? 'selected-el' : ''} ${item.type.toLowerCase().replace(/[\s-]/g, '_')}" data-symbol="${item.s}">
                <span class="el-z">${item.z}</span>
                <span class="el-symbol">${item.s}</span>
                <span class="el-name">${item.n}</span>
              </div>
            `).join('')}
          </div>

          <!-- Deep Inspector Card -->
          <div class="element-inspector">
            <div class="inspector-header">
              <div class="big-symbol">${el.s}</div>
              <div>
                <h4>${el.n} (परमाणु सङ्ख्या: ${el.z})</h4>
                <div class="el-type-tag">${el.type} • Group ${el.grp} • Period ${el.per}</div>
              </div>
            </div>

            <div class="inspector-data-grid">
              <div class="insp-stat">
                <span>Atomic Mass:</span>
                <strong>${el.m} amu</strong>
              </div>
              <div class="insp-stat">
                <span>Valency (संयोजकता):</span>
                <strong>${el.val}</strong>
              </div>
              <div class="insp-stat">
                <span>Bohr Shells (K, L, M, N):</span>
                <strong>${el.k}, ${el.l}, ${el.m_sh}${el.n_sh ? ', ' + el.n_sh : ''}</strong>
              </div>
              <div class="insp-stat">
                <span>Subshell Configuration:</span>
                <strong class="highlight-mono">${el.conf}</strong>
              </div>
            </div>

            <div class="el-practical-use">
              <strong>🌍 Practical Importance & Everyday Uses:</strong>
              <p>${el.use}</p>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    const cells = this.container.querySelectorAll('.el-cell');
    cells.forEach(cell => {
      cell.addEventListener('click', () => {
        const symbol = cell.dataset.symbol;
        const found = this.elements.find(e => e.s === symbol);
        if (found) {
          this.selectedElement = found;
          this.render();
        }
      });
    });
  }
}
