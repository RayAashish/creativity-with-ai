// Interactive Astronomy & Geology Module: Lifecycle of Stars & Himalayan Climate Simulator

export class StarsSimulation {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.starPath = 'average'; // 'average' (Sun-like) | 'massive' (Supergiant)
    this.himalayanTempAnomaly = 1.5; // °C increase

    this.render();
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="lab-card">
        <div class="lab-header">
          <div>
            <h3>The Universe & Lifecycle of Stars (ब्रह्माण्ड र ताराहरूको जीवनचक्र)</h3>
            <p class="lab-desc">Trace the cosmic birth, nuclear fusion life, and explosive death of low-mass stars (like our Sun) versus massive stars (forming neutron stars and black holes).</p>
          </div>
          <div class="gas-selector-tabs">
            <button id="tab-sun" class="tab-btn ${this.starPath === 'average' ? 'active' : ''}">
              ☀️ Sun-like Stars (कम पिण्ड भएका)
            </button>
            <button id="tab-massive" class="tab-btn ${this.starPath === 'massive' ? 'active' : ''}">
              💥 Massive Stars (अत्यधिक पिण्ड भएका)
            </button>
          </div>
        </div>

        <div class="star-lifecycle-stage">
          ${this.starPath === 'average' ? `
            <div class="evolution-timeline">
              <div class="evo-step">
                <span class="evo-icon">🌌</span>
                <h4>1. Stellar Nebula</h4>
                <p>Cloud of cold hydrogen gas & interstellar dust contracts under gravity.</p>
              </div>
              <div class="evo-arrow">➔</div>
              <div class="evo-step">
                <span class="evo-icon">☀️</span>
                <h4>2. Main Sequence (Sun)</h4>
                <p>Nuclear fusion: 4H → He + Energy (E = mc²). Stable for ~10 billion years.</p>
              </div>
              <div class="evo-arrow">➔</div>
              <div class="evo-step">
                <span class="evo-icon">🔴</span>
                <h4>3. Red Giant</h4>
                <p>Core exhausts hydrogen; outer layers expand over 100x, engulfing inner planets.</p>
              </div>
              <div class="evo-arrow">➔</div>
              <div class="evo-step">
                <span class="evo-icon">💨</span>
                <h4>4. Planetary Nebula</h4>
                <p>Outer ionized gas shell blows away into glowing interstellar space.</p>
              </div>
              <div class="evo-arrow">➔</div>
              <div class="evo-step">
                <span class="evo-icon">⚪</span>
                <h4>5. White Dwarf</h4>
                <p>Ultra-dense, Earth-sized dead carbon-oxygen core slowly cooling down.</p>
              </div>
            </div>
          ` : `
            <div class="evolution-timeline">
              <div class="evo-step">
                <span class="evo-icon">🌌</span>
                <h4>1. Stellar Nebula</h4>
                <p>Massive gravitational collapse of dense interstellar gas clouds (>8 solar masses).</p>
              </div>
              <div class="evo-arrow">➔</div>
              <div class="evo-step">
                <span class="evo-icon">🔵</span>
                <h4>2. Blue Supergiant</h4>
                <p>Burns nuclear fuel at ferocious rates, living only millions of years.</p>
              </div>
              <div class="evo-arrow">➔</div>
              <div class="evo-step">
                <span class="evo-icon">🔴</span>
                <h4>3. Red Supergiant</h4>
                <p>Fuses heavy elements up to Iron (Fe). Core runs out of fuel.</p>
              </div>
              <div class="evo-arrow">➔</div>
              <div class="evo-step">
                <span class="evo-icon">💥</span>
                <h4>4. SUPERNOVA!</h4>
                <p>Cataclysmic core-collapse explosion outshining entire galaxies!</p>
              </div>
              <div class="evo-arrow">➔</div>
              <div class="evo-step">
                <span class="evo-icon">🕳️</span>
                <h4>5. Neutron Star / Black Hole</h4>
                <p>Super-dense pulsar or infinite gravitational singularity.</p>
              </div>
            </div>
          `}
        </div>

        <hr class="lab-divider">

        <!-- Himalayan Climate Change Simulator -->
        <div class="glacier-section">
          <h4>🏔️ Climate Change in Nepal's Himalayas (जलवायु परिवर्तन र हिमनदी)</h4>
          <p class="lab-desc">Nepal's Hindu Kush Himalaya is the 'Third Pole'. Adjust global temperature anomaly to see how warming melts glaciers and creates hazardous Glacial Lake Outburst Floods (GLOFs).</p>

          <div class="glacier-slider-row">
            <label>Global Warming Anomaly: <span id="lbl-temp">+${this.himalayanTempAnomaly.toFixed(1)} °C</span></label>
            <input type="range" id="slider-temp" min="0.5" max="4.0" step="0.1" value="${this.himalayanTempAnomaly}">
          </div>

          <div class="glacier-impact-grid">
            <div class="impact-card">
              <span class="impact-title">Glacier Volume Loss</span>
              <strong class="impact-val" id="val-glacier-loss">${Math.round(this.himalayanTempAnomaly * 18)}% Melted</strong>
              <p>Accelerating retreat of Khumbu and Langtang glaciers.</p>
            </div>
            <div class="impact-card">
              <span class="impact-title">Glacial Lake Floods (GLOF Risk)</span>
              <strong class="impact-val" id="val-glof-risk" style="color: ${this.himalayanTempAnomaly > 2.0 ? '#ef4444' : '#f59e0b'};">
                ${this.himalayanTempAnomaly > 2.0 ? '🚨 HIGH HAZARD (खतरा)' : '⚠️ MODERATE RISK'}
              </strong>
              <p>Threat to downstream villages along Koshi, Gandaki & Karnali basins.</p>
            </div>
            <div class="impact-card">
              <span class="impact-title">Himalayan Biodiversity</span>
              <strong class="impact-val">Treeline Shifting Upward</strong>
              <p>Rhododendron blooming earlier; alpine species forced higher.</p>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    const tabSun = document.getElementById('tab-sun');
    const tabMassive = document.getElementById('tab-massive');

    if (tabSun) {
      tabSun.addEventListener('click', () => {
        this.starPath = 'average';
        this.render();
      });
    }

    if (tabMassive) {
      tabMassive.addEventListener('click', () => {
        this.starPath = 'massive';
        this.render();
      });
    }

    const sliderTemp = document.getElementById('slider-temp');
    if (sliderTemp) {
      sliderTemp.addEventListener('input', (e) => {
        this.himalayanTempAnomaly = parseFloat(e.target.value);
        this.render();
      });
    }
  }
}
