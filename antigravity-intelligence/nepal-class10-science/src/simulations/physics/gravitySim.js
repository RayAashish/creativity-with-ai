// Interactive Physics Module: Newton's Universal Gravitation, Cavendish Experiment,
// Guinea & Feather Free Fall, and Solar System Weight Calculator

export class GravitySimulation {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.m1 = 50; // kg or 10^9 scale
    this.m2 = 80;
    this.d = 4.0; // meters
    this.G = 6.674e-11;

    // Guinea feather state
    this.isDropping = false;
    this.vacuumActive = false;
    this.coinY = 0;
    this.featherY = 0;

    this.render();
  }

  calculateForce() {
    return (this.G * this.m1 * this.m2) / (this.d * this.d);
  }

  render() {
    if (!this.container) return;

    const force = this.calculateForce();
    const scientificForce = force.toExponential(4);

    this.container.innerHTML = `
      <div class="lab-card">
        <div class="lab-header">
          <div>
            <h3>Newton's Universal Law of Gravitation (गुरुत्वाकर्षणको नियम)</h3>
            <p class="lab-desc">Every body in the universe attracts every other body with a force directly proportional to the product of their masses and inversely proportional to the square of the distance between their centers.</p>
          </div>
          <div class="formula-badge">F = G · (m₁ · m₂) / d²</div>
        </div>

        <!-- Interactive 2D Gravitational Canvas -->
        <div class="gravity-stage">
          <div class="mass-node mass-1" style="width: ${30 + this.m1 * 0.4}px; height: ${30 + this.m1 * 0.4}px;">
            <span class="mass-label">m₁ = ${this.m1} kg</span>
            <div class="force-arrow arrow-right" style="width: ${Math.min(120, 20 + force * 1e11 * 40)}px;">
              <span class="force-text">F₁</span>
            </div>
          </div>

          <!-- Distance ruler -->
          <div class="distance-line">
            <span class="distance-badge">d = ${this.d.toFixed(1)} m</span>
          </div>

          <div class="mass-node mass-2" style="width: ${30 + this.m2 * 0.4}px; height: ${30 + this.m2 * 0.4}px;">
            <div class="force-arrow arrow-left" style="width: ${Math.min(120, 20 + force * 1e11 * 40)}px;">
              <span class="force-text">F₂</span>
            </div>
            <span class="mass-label">m₂ = ${this.m2} kg</span>
          </div>
        </div>

        <!-- Real-time Step-by-Step Mathematical Working -->
        <div class="calculation-box">
          <div class="calc-row">
            <strong>G:</strong> 6.674 × 10⁻¹¹ N·m²/kg² &nbsp;|&nbsp;
            <strong>m₁:</strong> ${this.m1} kg &nbsp;|&nbsp;
            <strong>m₂:</strong> ${this.m2} kg &nbsp;|&nbsp;
            <strong>d:</strong> ${this.d} m
          </div>
          <div class="calc-formula">
            F = [ (6.674 × 10⁻¹¹) × (${this.m1}) × (${this.m2}) ] / (${this.d})²
          </div>
          <div class="calc-result">
            Gravitational Force (F) = <strong>${scientificForce} Newtons</strong>
            <span class="calc-note">(Notice how tiny this force is between ordinary objects!)</span>
          </div>
        </div>

        <!-- Interactive Sliders & Quick Experiments -->
        <div class="controls-grid">
          <div class="ctrl-item">
            <label>Mass 1 (m₁): <span id="lbl-m1">${this.m1} kg</span></label>
            <input type="range" id="slider-m1" min="10" max="150" value="${this.m1}">
          </div>

          <div class="ctrl-item">
            <label>Mass 2 (m₂): <span id="lbl-m2">${this.m2} kg</span></label>
            <input type="range" id="slider-m2" min="10" max="150" value="${this.m2}">
          </div>

          <div class="ctrl-item">
            <label>Distance (d): <span id="lbl-d">${this.d.toFixed(1)} m</span></label>
            <input type="range" id="slider-d" min="1.5" max="10.0" step="0.2" value="${this.d}">
          </div>
        </div>

        <!-- Quick SEE Concept Proof Buttons -->
        <div class="preset-buttons-row">
          <button id="btn-double-d" class="btn-subtle">⚡ Double Distance (d × 2) ➔ Force drops to 1/4th (Inverse Square)</button>
          <button id="btn-half-d" class="btn-subtle">⚡ Halve Distance (d / 2) ➔ Force quadruples (4F)</button>
          <button id="btn-double-m" class="btn-subtle">⚡ Double Mass (m₁ × 2) ➔ Force doubles (2F)</button>
        </div>

        <hr class="lab-divider">

        <!-- Deep Dive: Henry Cavendish's Torsion Balance -->
        <div class="cavendish-section">
          <h4>🧪 How Henry Cavendish Measured "G" (Torsion Balance Experiment - 1798)</h4>
          <p class="cavendish-desc">
            Since G is microscopic (0.0000000000667), ordinary scales cannot measure it. Henry Cavendish suspended two small lead balls (m) from a light wooden rod held by a delicate quartz wire. He then brought two massive 158kg lead spheres (M) nearby. The gravitational attraction caused the wire to twist by a tiny fraction of a millimeter. To detect this, he bounced a beam of light off a mirror onto a distant ruler, magnifying the angle of twist to 'weigh the Earth'!
          </p>
          <div class="cavendish-interactive">
            <div class="torsion-balance-diagram">
              <div class="suspended-wire"></div>
              <div class="torsion-rod">
                <div class="small-ball left">m</div>
                <div class="mirror-indicator">🪞 Mirror</div>
                <div class="small-ball right">m</div>
              </div>
              <div class="large-ball big-left">M (158 kg)</div>
              <div class="large-ball big-right">M (158 kg)</div>
            </div>
            <div class="torsion-notes">
              <div class="fact-pill">✔ Deflection: θ = F · L / c</div>
              <div class="fact-pill">✔ Calculated: G = 6.67 × 10⁻¹¹ N m²/kg²</div>
              <div class="fact-pill">✔ Resulted in first true mass of Earth: M = 5.97 × 10²⁴ kg</div>
            </div>
          </div>
        </div>

        <hr class="lab-divider">

        <!-- Solar System Weight Comparison Simulator -->
        <div class="planet-weight-section">
          <h4>🪐 What Would You Weigh on Other Worlds? (Mass vs Weight: W = m · g)</h4>
          <div class="weight-calculator-row">
            <label>Enter your Mass (kg): </label>
            <input type="number" id="input-student-mass" value="50" min="10" max="200" class="input-inline">
            <span>kg (Your mass stays identical everywhere in the cosmos!)</span>
          </div>

          <div class="planets-grid">
            <div class="planet-card" data-g="9.8" data-name="Earth">
              <div class="planet-emoji">🌍</div>
              <div class="planet-name">Earth (Surface)</div>
              <div class="planet-g">g = 9.8 m/s²</div>
              <div class="planet-weight" id="w-earth">490 N (50 kg)</div>
            </div>

            <div class="planet-card" data-g="1.62" data-name="Moon">
              <div class="planet-emoji">🌕</div>
              <div class="planet-name">Moon (चन्द्रमा)</div>
              <div class="planet-g">g = 1.62 m/s² (1/6th)</div>
              <div class="planet-weight" id="w-moon">81 N (8.3 kg)</div>
            </div>

            <div class="planet-card" data-g="24.79" data-name="Jupiter">
              <div class="planet-emoji">🪐</div>
              <div class="planet-name">Jupiter (बृहस्पति)</div>
              <div class="planet-g">g = 24.79 m/s² (2.5x)</div>
              <div class="planet-weight" id="w-jupiter">1240 N (126 kg)</div>
            </div>

            <div class="planet-card" data-g="9.77" data-name="Everest">
              <div class="planet-emoji">🏔️</div>
              <div class="planet-name">Mt. Everest (8848.86m)</div>
              <div class="planet-g">g = 9.77 m/s²</div>
              <div class="planet-weight" id="w-everest">488.5 N (49.8 kg)</div>
            </div>

            <div class="planet-card" data-g="0" data-name="Space">
              <div class="planet-emoji">🚀</div>
              <div class="planet-name">Deep Space (तौलविहीन)</div>
              <div class="planet-g">g = 0 m/s²</div>
              <div class="planet-weight" id="w-space">0 N (0 kg - Weightless!)</div>
            </div>
          </div>
        </div>

        <hr class="lab-divider">

        <!-- Guinea and Feather Vacuum Tube Interactive Lab -->
        <div class="vacuum-drop-section">
          <h4>🪶 Coin & Feather Experiment (Guinea & Feather in Vacuum)</h4>
          <p class="drop-desc">Galileo's famous proof: does a heavier object fall faster because of gravity? No! Gravity accelerates all masses equally (g). Only air resistance slows the feather down.</p>
          
          <div class="drop-controls">
            <button id="btn-toggle-vacuum" class="btn-primary">
              ${this.vacuumActive ? '💨 Fill Tube with Normal Air' : '⚡ EVACUATE AIR (Create Vacuum)'}
            </button>
            <button id="btn-start-drop" class="btn-secondary">🎬 DROP COIN & FEATHER</button>
            <span class="tube-status-badge ${this.vacuumActive ? 'vacuum' : 'air'}">
              ${this.vacuumActive ? 'TUBE IS 100% VACUUM (No Air Drag)' : 'TUBE HAS NORMAL AIR (Air Resistance Active)'}
            </span>
          </div>

          <div class="drop-tube-container">
            <div class="drop-tube">
              <div class="falling-body coin" id="drop-coin">🪙 Coin (5g)</div>
              <div class="falling-body feather" id="drop-feather">🪶 Feather (0.1g)</div>
              <div class="tube-ground">Base of Vacuum Glass Tube</div>
            </div>
            <div class="drop-explanation" id="drop-explanation">
              ${this.vacuumActive ?
                '✔ In a vacuum, both coin and feather experience identical downward acceleration g = 9.8 m/s² and hit the bottom at the exact same millisecond!' :
                '⚠️ In air, the feather has a broad surface area relative to its light weight, so upward air resistance balances its gravity quickly, making it flutter down slowly.'
              }
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    const sM1 = document.getElementById('slider-m1');
    const sM2 = document.getElementById('slider-m2');
    const sD = document.getElementById('slider-d');

    const updateValues = () => {
      this.m1 = parseFloat(sM1.value);
      this.m2 = parseFloat(sM2.value);
      this.d = parseFloat(sD.value);
      this.render();
    };

    if (sM1) sM1.addEventListener('input', updateValues);
    if (sM2) sM2.addEventListener('input', updateValues);
    if (sD) sD.addEventListener('input', updateValues);

    const btnDoubleD = document.getElementById('btn-double-d');
    if (btnDoubleD) {
      btnDoubleD.addEventListener('click', () => {
        this.d = Math.min(10.0, this.d * 2);
        this.render();
      });
    }

    const btnHalfD = document.getElementById('btn-half-d');
    if (btnHalfD) {
      btnHalfD.addEventListener('click', () => {
        this.d = Math.max(1.5, this.d / 2);
        this.render();
      });
    }

    const btnDoubleM = document.getElementById('btn-double-m');
    if (btnDoubleM) {
      btnDoubleM.addEventListener('click', () => {
        this.m1 = Math.min(150, this.m1 * 2);
        this.render();
      });
    }

    // Student Mass Input
    const massInput = document.getElementById('input-student-mass');
    if (massInput) {
      massInput.addEventListener('input', (e) => {
        const m = parseFloat(e.target.value) || 0;
        document.getElementById('w-earth').textContent = `${(m * 9.8).toFixed(1)} N (${m} kg)`;
        document.getElementById('w-moon').textContent = `${(m * 1.62).toFixed(1)} N (${(m / 6).toFixed(1)} kg)`;
        document.getElementById('w-jupiter').textContent = `${(m * 24.79).toFixed(1)} N (${(m * 2.53).toFixed(1)} kg)`;
        document.getElementById('w-everest').textContent = `${(m * 9.77).toFixed(1)} N (${(m * 0.997).toFixed(1)} kg)`;
        document.getElementById('w-space').textContent = `0 N (0 kg - Weightless!)`;
      });
    }

    // Vacuum Drop Experiment
    const btnVac = document.getElementById('btn-toggle-vacuum');
    if (btnVac) {
      btnVac.addEventListener('click', () => {
        this.vacuumActive = !this.vacuumActive;
        this.render();
      });
    }

    const btnDrop = document.getElementById('btn-start-drop');
    if (btnDrop) {
      btnDrop.addEventListener('click', () => {
        this.triggerDropAnimation();
      });
    }
  }

  triggerDropAnimation() {
    const coin = document.getElementById('drop-coin');
    const feather = document.getElementById('drop-feather');
    if (!coin || !feather) return;

    // Reset positions
    coin.style.transition = 'none';
    feather.style.transition = 'none';
    coin.style.top = '10px';
    feather.style.top = '10px';

    setTimeout(() => {
      if (this.vacuumActive) {
        // Fall together in 1.2s
        coin.style.transition = 'top 1.2s cubic-bezier(0.5, 0, 1, 1)';
        feather.style.transition = 'top 1.2s cubic-bezier(0.5, 0, 1, 1)';
        coin.style.top = '220px';
        feather.style.top = '220px';
      } else {
        // Air resistance: coin falls in 1.2s, feather flutters down in 3.6s
        coin.style.transition = 'top 1.2s cubic-bezier(0.5, 0, 1, 1)';
        feather.style.transition = 'top 3.6s ease-in-out';
        coin.style.top = '220px';
        feather.style.top = '220px';
      }
    }, 50);
  }
}
