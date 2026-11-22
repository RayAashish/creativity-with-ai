// Interactive Biology Module: Mendel's Monohybrid Cross, Punnett Squares & Human Sex Determination
// Essential SEE Genetics & Heredity Unit

export class GeneticsSimulation {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.mode = 'mendel'; // 'mendel' | 'sex_determination'
    this.f2Generated = false;

    this.render();
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="lab-card">
        <div class="lab-header">
          <div>
            <h3>Heredity & Mendel's Genetics (वंशाणुक्रम र मेन्डेलको नियम)</h3>
            <p class="lab-desc">Understand how dominant and recessive alleles transfer traits across generations through Gregor Mendel's classic pea experiments and human chromosome sex determination.</p>
          </div>
          <div class="gas-selector-tabs">
            <button id="tab-mendel" class="tab-btn ${this.mode === 'mendel' ? 'active' : ''}">
              🌱 Mendel's Monohybrid Cross (केराउको प्रयोग)
            </button>
            <button id="tab-sex" class="tab-btn ${this.mode === 'sex_determination' ? 'active' : ''}">
              🧬 Human Sex Determination (मानव लिङ्ग निर्धारण)
            </button>
          </div>
        </div>

        ${this.mode === 'mendel' ? this.renderMendel() : this.renderSexDetermination()}
      </div>
    `;

    this.bindEvents();
  }

  renderMendel() {
    return `
      <div class="genetics-stage">
        <!-- P1 Generation (Parents) -->
        <div class="gen-box">
          <span class="gen-title">P₁ Generation (जनक पुस्ता)</span>
          <div class="parents-row">
            <div class="pea-plant tall">
              <span class="plant-emoji">🌿</span>
              <strong>Pure Tall (अग्लो)</strong>
              <span class="genotype">TT (Homozygous Dominant)</span>
            </div>
            <div class="cross-symbol">✖ (Cross-Pollination)</div>
            <div class="pea-plant dwarf">
              <span class="plant-emoji">🌱</span>
              <strong>Pure Dwarf (होचो)</strong>
              <span class="genotype">tt (Homozygous Recessive)</span>
            </div>
          </div>
        </div>

        <!-- F1 Generation -->
        <div class="gen-box">
          <span class="gen-title">F₁ Generation (पहिलो वंशधर)</span>
          <div class="f1-result">
            <div class="pea-plant tall hybrid">
              <span class="plant-emoji">🌿</span>
              <strong>100% Hybrid Tall (सबै अग्लो)</strong>
              <span class="genotype">Tt (Heterozygous)</span>
              <p class="law-tag">✔ Law of Dominance: Tall (T) masks Dwarf (t)</p>
            </div>
          </div>
          <button id="btn-self-f1" class="btn-primary" style="margin-top: 1rem;">
            🔄 Self-Pollinate F₁ Generation (Tt × Tt)
          </button>
        </div>

        <!-- F2 Generation Interactive Punnett Square -->
        ${this.f2Generated ? `
          <div class="gen-box f2-highlight">
            <span class="gen-title">F₂ Generation & Punnett Square (दोस्रो वंशधर)</span>
            
            <div class="punnett-wrapper">
              <table class="punnett-square">
                <thead>
                  <tr>
                    <th>Gametes</th>
                    <th>T (Dominant)</th>
                    <th>t (Recessive)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th>T</th>
                    <td class="cell-tall">
                      <strong>TT</strong>
                      <span>Pure Tall (२५%)</span>
                    </td>
                    <td class="cell-tall">
                      <strong>Tt</strong>
                      <span>Hybrid Tall (२५%)</span>
                    </td>
                  </tr>
                  <tr>
                    <th>t</th>
                    <td class="cell-tall">
                      <strong>Tt</strong>
                      <span>Hybrid Tall (२५%)</span>
                    </td>
                    <td class="cell-dwarf">
                      <strong>tt</strong>
                      <span>Pure Dwarf (२५%)</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Ratios Summary -->
            <div class="ratios-card">
              <div class="ratio-item">
                <span>Phenotypic Ratio (स्वरुप अनुपात):</span>
                <strong>3 Tall : 1 Dwarf (75% : 25%)</strong>
              </div>
              <div class="ratio-item">
                <span>Genotypic Ratio (जिन अनुपात):</span>
                <strong>1 TT : 2 Tt : 1 tt (25% : 50% : 25%)</strong>
              </div>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  renderSexDetermination() {
    return `
      <div class="genetics-stage">
        <div class="sci-awareness-box">
          <h4>💡 Scientific Truth for Nepali Society (वैज्ञानिक सत्य):</h4>
          <p>In human reproduction, the mother provides only an <strong>X</strong> chromosome in every ovum. The father's sperm carries either an <strong>X</strong> (50%) or a <strong>Y</strong> (50%) chromosome. Therefore, the sex of the child is entirely determined by the father's fertilizing sperm. Blaming mothers for having daughters is completely unscientific!</p>
        </div>

        <div class="punnett-wrapper" style="margin-top: 1.5rem;">
          <table class="punnett-square">
            <thead>
              <tr>
                <th>Gametes</th>
                <th>Father's Sperm: X (50%)</th>
                <th>Father's Sperm: Y (50%)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>Mother's Ovum: X</th>
                <td class="cell-female">
                  <span class="gender-emoji">👧</span>
                  <strong>XX (Female Child)</strong>
                  <span>छोरी (२५%)</span>
                </td>
                <td class="cell-male">
                  <span class="gender-emoji">👦</span>
                  <strong>XY (Male Child)</strong>
                  <span>छोरा (२५%)</span>
                </td>
              </tr>
              <tr>
                <th>Mother's Ovum: X</th>
                <td class="cell-female">
                  <span class="gender-emoji">👧</span>
                  <strong>XX (Female Child)</strong>
                  <span>छोरी (२५%)</span>
                </td>
                <td class="cell-male">
                  <span class="gender-emoji">👦</span>
                  <strong>XY (Male Child)</strong>
                  <span>छोरा (२५%)</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="ratios-card" style="margin-top: 1rem;">
          <div class="ratio-item">
            <span>Probability of Daughter (XX):</span>
            <strong>50% Probability (१/२)</strong>
          </div>
          <div class="ratio-item">
            <span>Probability of Son (XY):</span>
            <strong>50% Probability (१/२)</strong>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    const tabMendel = document.getElementById('tab-mendel');
    const tabSex = document.getElementById('tab-sex');

    if (tabMendel) {
      tabMendel.addEventListener('click', () => {
        this.mode = 'mendel';
        this.render();
      });
    }

    if (tabSex) {
      tabSex.addEventListener('click', () => {
        this.mode = 'sex_determination';
        this.render();
      });
    }

    const btnSelf = document.getElementById('btn-self-f1');
    if (btnSelf) {
      btnSelf.addEventListener('click', () => {
        this.f2Generated = true;
        this.render();
      });
    }
  }
}
