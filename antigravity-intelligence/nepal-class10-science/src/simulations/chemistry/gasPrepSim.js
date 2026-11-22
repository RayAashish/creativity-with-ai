// Interactive Chemistry Module: Laboratory Preparation of CO₂ & NH₃ Gases
// Essential SEE Practical Apparatus, Chemical Reactions & Tests

export class GasPrepSimulation {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.activeGas = 'co2'; // 'co2' | 'nh3'
    this.isReacting = false;
    this.testActive = null; // 'candle' | 'limewater' | 'litmus' | 'hcl_rod'

    this.render();
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="lab-card">
        <div class="lab-header">
          <div>
            <h3>Laboratory Preparation of Industrial Gases (ग्याँसहरूको प्रयोगशाला विधि)</h3>
            <p class="lab-desc">Master apparatus setup, reagents, displacement methods, and verification tests for Carbon Dioxide (CO₂) and Ammonia (NH₃).</p>
          </div>
          <div class="gas-selector-tabs">
            <button id="tab-co2" class="tab-btn ${this.activeGas === 'co2' ? 'active' : ''}">
              🧪 Carbon Dioxide (CO₂)
            </button>
            <button id="tab-nh3" class="tab-btn ${this.activeGas === 'nh3' ? 'active' : ''}">
              🧪 Ammonia (NH₃)
            </button>
          </div>
        </div>

        ${this.activeGas === 'co2' ? this.renderCO2() : this.renderNH3()}
      </div>
    `;

    this.bindEvents();
  }

  renderCO2() {
    return `
      <div class="gas-prep-body">
        <div class="reaction-banner">
          <span class="chem-eq">CaCO₃ (मार्बल टुक्रा) + 2HCl (पातलो अम्ल) → CaCl₂ + H₂O + CO₂↑</span>
          <span class="prep-principle">No heat required (सामान्य तापक्रममा हुने प्रतिक्रिया)</span>
        </div>

        <div class="apparatus-stage">
          <svg class="apparatus-svg" viewBox="0 0 680 300">
            <!-- Table Base -->
            <rect x="20" y="270" width="640" height="15" fill="#334155" rx="3"/>

            <!-- Woulfe's Bottle -->
            <rect x="160" y="140" width="120" height="130" fill="rgba(255,255,255,0.08)" stroke="#94a3b8" stroke-width="2" rx="10"/>
            <rect x="180" y="120" width="25" height="20" fill="none" stroke="#94a3b8" stroke-width="2"/>
            <rect x="235" y="120" width="25" height="20" fill="none" stroke="#94a3b8" stroke-width="2"/>

            <!-- Marble Chips (CaCO3) inside bottle -->
            <circle cx="180" cy="250" r="12" fill="#cbd5e1"/>
            <circle cx="210" cy="255" r="14" fill="#cbd5e1"/>
            <circle cx="245" cy="248" r="11" fill="#cbd5e1"/>
            <text x="220" y="260" fill="#0f172a" font-size="10" font-weight="bold" text-anchor="middle">CaCO₃</text>

            <!-- Dilute HCl Liquid -->
            <path d="M 162 210 L 278 210 L 278 265 Q 220 270 162 265 Z" fill="rgba(56, 189, 248, 0.35)"/>
            <text x="220" y="225" fill="#38bdf8" font-size="11" text-anchor="middle">dil. HCl Acid</text>

            <!-- Thistle Funnel (lower end dip in liquid) -->
            <path d="M 185 40 L 195 40 L 195 240 L 185 240 Z" fill="#94a3b8"/>
            <polygon points="175,40 205,40 195,65 185,65" fill="#94a3b8"/>
            <text x="190" y="30" fill="#f8fafc" font-size="10" text-anchor="middle">Thistle Funnel</text>

            <!-- Delivery Tube -->
            <path d="M 247 125 L 247 90 L 440 90 L 440 220" fill="none" stroke="#94a3b8" stroke-width="4"/>
            <text x="340" y="80" fill="#94a3b8" font-size="11" text-anchor="middle">Delivery Tube</text>

            <!-- Upright Gas Jar (Upward displacement of air) -->
            <rect x="410" y="140" width="60" height="130" fill="rgba(255,255,255,0.08)" stroke="#94a3b8" stroke-width="2"/>
            <text x="440" y="285" fill="#e2e8f0" font-size="11" text-anchor="middle">Upright Gas Jar</text>

            <!-- Bubbles when reacting -->
            ${this.isReacting ? `
              <circle cx="205" cy="180" r="5" fill="#fff" opacity="0.8">
                <animate attributeName="cy" values="220;140" dur="0.8s" repeatCount="indefinite"/>
              </circle>
              <circle cx="230" cy="190" r="4" fill="#fff" opacity="0.8">
                <animate attributeName="cy" values="220;140" dur="0.6s" repeatCount="indefinite"/>
              </circle>
              <!-- CO2 in gas jar -->
              <rect x="412" y="180" width="56" height="88" fill="rgba(234, 179, 8, 0.2)"/>
              <text x="440" y="210" fill="#eab308" font-size="12" font-weight="bold" text-anchor="middle">CO₂ Gas</text>
            ` : ''}

            <!-- Active Test Visual -->
            ${this.testActive === 'candle' ? `
              <!-- Candle near jar mouth -->
              <rect x="435" y="115" width="10" height="25" fill="#f8fafc"/>
              <text x="440" y="105" fill="#ef4444" font-size="16" text-anchor="middle">💨 (Flame Extinguished!)</text>
            ` : ''}

            ${this.testActive === 'limewater' ? `
              <!-- Lime water turns milky white -->
              <rect x="520" y="160" width="70" height="110" fill="rgba(255,255,255,0.9)" stroke="#94a3b8" stroke-width="2" rx="6"/>
              <text x="555" y="220" fill="#0f172a" font-size="11" font-weight="bold" text-anchor="middle">Milky White!</text>
              <text x="555" y="240" fill="#0f172a" font-size="9" text-anchor="middle">CaCO₃ ppt</text>
            ` : ''}
          </svg>
        </div>

        <!-- Interactive Reaction Trigger & Tests -->
        <div class="prep-actions">
          <button id="btn-react-co2" class="btn-primary">
            ${this.isReacting ? '⏹ Stop Reaction' : '▶ Pour dil. HCl (Start Reaction)'}
          </button>
          <button id="btn-test-candle" class="btn-secondary" ${!this.isReacting ? 'disabled' : ''}>
            🕯️ Test 1: Burning Candle Test (Does CO₂ Burn?)
          </button>
          <button id="btn-test-limewater" class="btn-secondary" ${!this.isReacting ? 'disabled' : ''}>
            🥛 Test 2: Pass into Lime Water (चुनपानी)
          </button>
        </div>

        <!-- Precautions & SEE Exam Notes -->
        <div class="precautions-card">
          <h4>⚠️ Mandatory Lab Precautions (SEE परीक्षामा सोधिने मुख्य सावधानीहरू):</h4>
          <ul>
            <li><strong>Thistle Funnel Submersion:</strong> The bottom end of the thistle funnel MUST be submerged inside the acid solution; otherwise, the produced CO₂ gas will escape out through the thistle funnel instead of into the delivery tube!</li>
            <li><strong>Upward Displacement of Air:</strong> CO₂ is collected in an upright gas jar because it is approximately 1.5 times denser than air.</li>
          </ul>
        </div>
      </div>
    `;
  }

  renderNH3() {
    return `
      <div class="gas-prep-body">
        <div class="reaction-banner">
          <span class="chem-eq">2NH₄Cl (एमोनियम क्लोराइड) + Ca(OH)₂ (स्लेक्ड लाइम) → CaCl₂ + 2H₂O + 2NH₃↑</span>
          <span class="prep-principle">Ratio: 2:1 by mass • Requires Bunsen heating (तातो चाहिन्छ)</span>
        </div>

        <div class="apparatus-stage">
          <svg class="apparatus-svg" viewBox="0 0 680 300">
            <!-- Table Base -->
            <rect x="20" y="270" width="640" height="15" fill="#334155" rx="3"/>

            <!-- Hard Glass Test Tube tilted downward -->
            <g transform="rotate(15, 200, 160)">
              <rect x="120" y="140" width="160" height="30" fill="rgba(255,255,255,0.12)" stroke="#94a3b8" stroke-width="2" rx="6"/>
              <text x="180" y="160" fill="#f8fafc" font-size="10">NH₄Cl + Ca(OH)₂ (2:1)</text>
            </g>

            <!-- Bunsen Burner heating tube -->
            <rect x="180" y="210" width="25" height="60" fill="#64748b"/>
            ${this.isReacting ? `
              <polygon points="180,210 205,210 192,175" fill="#f97316">
                <animate attributeName="points" values="180,210 205,210 192,175; 180,210 205,210 192,168; 180,210 205,210 192,175" dur="0.3s" repeatCount="indefinite"/>
              </polygon>
            ` : ''}

            <!-- Lime Tower (Drying Agent CaO) -->
            <rect x="360" y="110" width="45" height="120" fill="rgba(255,255,255,0.08)" stroke="#94a3b8" stroke-width="2"/>
            <text x="382" y="170" fill="#38bdf8" font-size="10" text-anchor="middle">CaO</text>
            <text x="382" y="185" fill="#94a3b8" font-size="9" text-anchor="middle">(Lime Tower)</text>

            <!-- Delivery Tube to Inverted Gas Jar -->
            <path d="M 270 185 L 360 185 M 405 130 L 460 130 L 460 70" fill="none" stroke="#94a3b8" stroke-width="4"/>

            <!-- Inverted Gas Jar (Downward displacement of air) -->
            <rect x="430" y="50" width="60" height="130" fill="rgba(255,255,255,0.08)" stroke="#94a3b8" stroke-width="2"/>
            <text x="460" y="40" fill="#e2e8f0" font-size="11" text-anchor="middle">Inverted Gas Jar (उल्टो)</text>

            ${this.isReacting ? `
              <rect x="432" y="52" width="56" height="85" fill="rgba(56, 189, 248, 0.25)"/>
              <text x="460" y="90" fill="#38bdf8" font-size="12" font-weight="bold" text-anchor="middle">NH₃ Gas</text>
            ` : ''}

            <!-- Active Test Visual -->
            ${this.testActive === 'litmus' ? `
              <rect x="450" y="185" width="20" height="40" fill="#3b82f6"/>
              <text x="460" y="240" fill="#3b82f6" font-size="11" font-weight="bold" text-anchor="middle">Moist Red Litmus Turned BLUE! (Basic Gas)</text>
            ` : ''}

            ${this.testActive === 'hcl_rod' ? `
              <line x1="460" y1="180" x2="490" y2="230" stroke="#f8fafc" stroke-width="4"/>
              <circle cx="460" cy="180" r="14" fill="rgba(255,255,255,0.85)"/>
              <text x="460" y="165" fill="#f8fafc" font-size="10" font-weight="bold" text-anchor="middle">Dense White Fumes (NH₄Cl)</text>
            ` : ''}
          </svg>
        </div>

        <!-- Interactive Reaction Trigger & Tests -->
        <div class="prep-actions">
          <button id="btn-react-nh3" class="btn-primary">
            ${this.isReacting ? '⏹ Extinguish Flame' : '🔥 Light Burner (Heat Mixture)'}
          </button>
          <button id="btn-test-litmus" class="btn-secondary" ${!this.isReacting ? 'disabled' : ''}>
            📄 Test 1: Moist Red Litmus Paper
          </button>
          <button id="btn-test-hcl" class="btn-secondary" ${!this.isReacting ? 'disabled' : ''}>
            🥢 Test 2: Glass Rod with conc. HCl (White Fumes)
          </button>
        </div>

        <!-- Precautions & SEE Exam Notes -->
        <div class="precautions-card">
          <h4>⚠️ Mandatory Lab Precautions (SEE परीक्षामा सोधिने मुख्य सावधानीहरू):</h4>
          <ul>
            <li><strong>Downward Tilt of Test Tube:</strong> The hard glass test tube MUST be clamped with its mouth tilted downward. Why? Water is produced during the reaction; if the tube were horizontal or upward, condensing water vapor would trickle back to the hot glass bottom, causing it to crack and shatter!</li>
            <li><strong>Why is CaO (Quicklime) used as drying agent?</strong> Ammonia is basic; common drying agents like conc. H₂SO₄ or P₂O₅ are acidic and would react with Ammonia instead of just drying it! CaO is basic and does not react.</li>
            <li><strong>Downward Displacement of Air:</strong> Ammonia is collected in an INVERTED jar because it is lighter than air (density 0.77 g/L) and cannot be collected over water due to extreme solubility.</li>
          </ul>
        </div>
      </div>
    `;
  }

  bindEvents() {
    const tabCO2 = document.getElementById('tab-co2');
    const tabNH3 = document.getElementById('tab-nh3');

    if (tabCO2) {
      tabCO2.addEventListener('click', () => {
        this.activeGas = 'co2';
        this.isReacting = false;
        this.testActive = null;
        this.render();
      });
    }

    if (tabNH3) {
      tabNH3.addEventListener('click', () => {
        this.activeGas = 'nh3';
        this.isReacting = false;
        this.testActive = null;
        this.render();
      });
    }

    // Reaction toggles
    const btnReactCO2 = document.getElementById('btn-react-co2');
    if (btnReactCO2) {
      btnReactCO2.addEventListener('click', () => {
        this.isReacting = !this.isReacting;
        this.render();
      });
    }

    const btnReactNH3 = document.getElementById('btn-react-nh3');
    if (btnReactNH3) {
      btnReactNH3.addEventListener('click', () => {
        this.isReacting = !this.isReacting;
        this.render();
      });
    }

    // Tests
    const btnCandle = document.getElementById('btn-test-candle');
    if (btnCandle) {
      btnCandle.addEventListener('click', () => {
        this.testActive = 'candle';
        this.render();
      });
    }

    const btnLimeWater = document.getElementById('btn-test-limewater');
    if (btnLimeWater) {
      btnLimeWater.addEventListener('click', () => {
        this.testActive = 'limewater';
        this.render();
      });
    }

    const btnLitmus = document.getElementById('btn-test-litmus');
    if (btnLitmus) {
      btnLitmus.addEventListener('click', () => {
        this.testActive = 'litmus';
        this.render();
      });
    }

    const btnHCl = document.getElementById('btn-test-hcl');
    if (btnHCl) {
      btnHCl.addEventListener('click', () => {
        this.testActive = 'hcl_rod';
        this.render();
      });
    }
  }
}
