// Interactive Modern Periodic Table & Electron Orbit Simulator (आधुनिक आवर्त तालिका)
import { ELEMENTS_DATA } from '../../data/elementsData.js';

export function renderPeriodicTableSim(container, lang = 'en') {
  let selectedElement = ELEMENTS_DATA[0]; // Hydrogen default

  container.innerHTML = `
    <div class="sim-card">
      <div class="sim-header">
        <div class="sim-badge">CHEMISTRY LAB // रसायन विज्ञान</div>
        <h2 class="sim-title">${lang === 'np' ? 'आधुनिक आवर्त तालिका र इलेक्ट्रोन विन्यास' : 'Interactive Modern Periodic Table & Bohr Shells'}</h2>
        <p class="sim-desc">
          ${lang === 'np'
            ? 'पहिलो ३० तत्वहरूको पारमाणविक संरचना, Bohr-Rutherford अर्बिट, सबसेल विन्यास (s, p, d, f) र नेपालमा तिनको व्यावहारिक प्रयोगहरू।'
            : 'Explore the first 30 elements of Mendeleev/Moseley Modern Periodic Table. View dynamic Bohr electron orbits, subshell configurations, and industrial uses in Nepal.'}
        </p>
      </div>

      <div class="minimal-grid">
        <!-- LEFT: ELEMENT GRID -->
        <div class="periodic-grid-panel">
          <div class="periodic-legend-row">
            <span class="legend-pill" style="border-left: 3px solid #fca5a5;">s-block (Alkali/Alkaline)</span>
            <span class="legend-pill" style="border-left: 3px solid #fcd34d;">p-block (Non-metals/Halogens)</span>
            <span class="legend-pill" style="border-left: 3px solid #a5b4fc;">d-block (Transition Metals)</span>
            <span class="legend-pill" style="border-left: 3px solid #c4b5fd;">Noble Gases</span>
          </div>

          <div class="elements-cells-grid">
            ${ELEMENTS_DATA.map(el => `
              <div class="element-tile ${el.z === 1 ? 'selected' : ''}" data-z="${el.z}">
                <div class="el-z">${el.z}</div>
                <div class="el-sym">${el.sym}</div>
                <div class="el-name">${lang === 'np' ? el.nameNp : el.nameEn}</div>
                <div class="el-mass">${el.mass.toFixed(1)}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- RIGHT: INSPECTOR & BOHR MODEL -->
        <div class="element-inspector-panel">
          <div id="inspector-content">
            <!-- Dynamically populated -->
          </div>
        </div>
      </div>
    </div>
  `;

  const tiles = container.querySelectorAll('.element-tile');
  const inspector = container.querySelector('#inspector-content');

  const updateInspector = (el) => {
    selectedElement = el;
    tiles.forEach(t => t.classList.toggle('selected', parseInt(t.dataset.z) === el.z));

    // Generate Bohr shell SVG
    const maxRadius = 110;
    const shellsCount = el.shells.length;
    const shellRadii = [35, 58, 82, 105];

    let shellsSvg = '';
    // Orbits
    el.shells.forEach((electrons, sIdx) => {
      const r = shellRadii[sIdx];
      shellsSvg += `<circle cx="130" cy="130" r="${r}" fill="none" stroke="#e4e4e7" stroke-width="1.5" stroke-dasharray="3,3" />`;
      shellsSvg += `<text x="130" y="${130 - r - 4}" text-anchor="middle" font-size="9" fill="#a1a1aa">${['K','L','M','N'][sIdx]}=${electrons}</text>`;
      
      // Place electrons along circumference
      for (let i = 0; i < electrons; i++) {
        const angle = (i * 2 * Math.PI) / electrons;
        const ex = 130 + r * Math.cos(angle);
        const ey = 130 + r * Math.sin(angle);
        shellsSvg += `<circle cx="${ex}" cy="${ey}" r="4" fill="#0284c7" stroke="#ffffff" stroke-width="1" />`;
      }
    });

    inspector.innerHTML = `
      <div class="inspector-header">
        <div class="inspector-badge">${el.block.toUpperCase()}-BLOCK // GROUP ${el.group} // PERIOD ${el.period}</div>
        <h3 class="inspector-title">
          <span class="sym-big">${el.sym}</span> 
          <span>${lang === 'np' ? el.nameNp : el.nameEn} (Z = ${el.z})</span>
        </h3>
      </div>

      <div class="canvas-wrapper" style="min-height: 270px;">
        <svg viewBox="0 0 260 260" class="sim-svg">
          <!-- Nucleus -->
          <circle cx="130" cy="130" r="18" fill="#18181b" />
          <text x="130" y="134" text-anchor="middle" font-size="9" fill="#ffffff" font-weight="bold">${el.z}p, ${(Math.round(el.mass) - el.z)}n</text>
          ${shellsSvg}
        </svg>
      </div>

      <div class="specs-grid">
        <div class="spec-card">
          <span class="spec-label">${lang === 'np' ? 'इलेक्ट्रोन विन्यास:' : 'Electronic Config:'}</span>
          <code class="spec-val">${el.config}</code>
        </div>
        <div class="spec-card">
          <span class="spec-label">${lang === 'np' ? 'संयोजकता (Valency):' : 'Valency:'}</span>
          <span class="spec-val value-highlight">${el.valency}</span>
        </div>
        <div class="spec-card">
          <span class="spec-label">${lang === 'np' ? 'पारमाणविक पिण्ड:' : 'Atomic Mass:'}</span>
          <span class="spec-val">${el.mass} u</span>
        </div>
        <div class="spec-card">
          <span class="spec-label">${lang === 'np' ? 'Bohr शेल्स (K, L, M, N):' : 'Bohr Shells:'}</span>
          <span class="spec-val">[ ${el.shells.join(', ')} ]</span>
        </div>
      </div>

      <div class="nepal-context-box">
        <div class="context-tag">🇳🇵 ${lang === 'np' ? 'नेपालमा प्रयोग र महत्व:' : 'Context & Uses in Nepal:'}</div>
        <p class="context-text">${el.usesNepal}</p>
      </div>
    `;
  };

  tiles.forEach(tile => {
    tile.addEventListener('click', () => {
      const z = parseInt(tile.dataset.z);
      const el = ELEMENTS_DATA.find(e => e.z === z);
      if (el) updateInspector(el);
    });
  });

  updateInspector(selectedElement);
}
