// Searchable Science Formula & SI Unit Handbook (विज्ञान सूत्र तथा एकाइ पुस्तिका)
import { UNITS_DATA } from '../../data/unitsData.js';

export function renderFormulaHandbook(container, lang = 'en') {
  container.innerHTML = `
    <div class="sim-card">
      <div class="sim-header">
        <div class="sim-badge">FORMULAS & LAWS // सूत्र र नियम</div>
        <h2 class="sim-title">${lang === 'np' ? 'कक्षा १० विज्ञान सम्पूर्ण सूत्र तथा एकाइ पुस्तिका' : 'Comprehensive Class 10 Formula & SI Units Handbook'}</h2>
        <p class="sim-desc">
          ${lang === 'np'
            ? 'पाठ्यक्रमका सम्पूर्ण भौतिक, रासायनिक तथा जीववैज्ञानिक सूत्रहरू, SI एकाइहरू र सम्बन्धित नियमहरू।'
            : 'Interactive searchable encyclopedia of all equations, SI units, variables, and physical constants required for the CDC SEE examinations.'}
        </p>
      </div>

      <div class="search-handbook-bar">
        <input type="text" id="formula-search-input" placeholder="${lang === 'np' ? 'सूत्र, एकाइ वा नियम खोज्नुहोस् (उदा: F = G, Pascal, Diopter, kWh)...' : 'Search formula, unit, or concept (e.g. F = G, Pascal, Lens, Ohm, kWh)...'}" class="minimal-search-input" />
      </div>

      <div id="formula-cards-grid" class="cards-grid-2">
        <!-- Rendered formulas -->
      </div>
    </div>
  `;

  const searchInput = container.querySelector('#formula-search-input');
  const grid = container.querySelector('#formula-cards-grid');

  // Extract all formulas from UNITS_DATA
  const formulasList = [];
  UNITS_DATA.forEach(u => {
    if (u.keyConcepts) {
      u.keyConcepts.forEach(c => {
        if (c.formula) {
          formulasList.push({
            unitId: u.id,
            subject: u.subject,
            unitTitle: u.titleEn,
            unitTitleNp: u.titleNp,
            concept: c.conceptEn,
            conceptNp: c.conceptNp,
            formula: c.formula,
            unit: c.unit || (c.variables ? c.variables[0]?.unit : ''),
            def: c.defEn,
            defNp: c.defNp
          });
        }
      });
    }
  });

  const renderList = (filterText = '') => {
    const q = filterText.toLowerCase().trim();
    const matches = formulasList.filter(f => 
      !q || 
      f.concept.toLowerCase().includes(q) || 
      f.conceptNp.toLowerCase().includes(q) ||
      f.formula.toLowerCase().includes(q) ||
      f.unitTitle.toLowerCase().includes(q) ||
      (f.unit && f.unit.toLowerCase().includes(q))
    );

    if (matches.length === 0) {
      grid.innerHTML = `<div class="empty-state">${lang === 'np' ? 'कुनै सूत्र फेला परेन।' : 'No matching formulas found.'}</div>`;
      return;
    }

    grid.innerHTML = matches.map(item => `
      <div class="handbook-card">
        <div class="handbook-meta">
          <span class="value-pill">${item.subject.toUpperCase()}</span>
          <span class="text-muted" style="font-size: 0.85rem;">${lang === 'np' ? item.unitTitleNp : item.unitTitle}</span>
        </div>
        <h3 class="handbook-title">${lang === 'np' ? item.conceptNp : item.concept}</h3>
        <div class="formula-box">
          <div class="formula-math">${item.formula}</div>
        </div>
        ${item.unit ? `<div class="unit-badge"><strong>SI Unit:</strong> <code>${item.unit}</code></div>` : ''}
        <p class="text-muted" style="font-size: 0.9rem; margin-top: 0.5rem;">${lang === 'np' ? item.defNp : item.def}</p>
      </div>
    `).join('');
  };

  searchInput.addEventListener('input', (e) => renderList(e.target.value));
  renderList();
}
