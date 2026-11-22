// Interactive Physics: Pascal's Hydraulic Lift & Archimedes' Principle Upthrust Simulator

export class PressureSimulation {
  constructor(containerId) {
    this.container = document.getElementById(containerId);

    // Hydraulic Lift parameters
    this.a1 = 4.0; // cm²
    this.a2 = 120.0; // cm²
    this.f1 = 50.0; // Newtons applied by hand

    // Archimedes parameters
    this.selectedMaterial = 'aluminum';
    this.selectedLiquid = 'water';
    this.objectVolume = 0.002; // m³ (2 Liters)

    this.materials = {
      wood: { name: 'Wood (काठ)', density: 700, emoji: '🪵' },
      ice: { name: 'Ice (बरफ)', density: 917, emoji: '🧊' },
      aluminum: { name: 'Aluminum (अल्युमिनियम)', density: 2700, emoji: '⚙️' },
      iron: { name: 'Iron (फलाम)', density: 7870, emoji: '🔩' }
    };

    this.liquids = {
      water: { name: 'Pure Water (शुद्ध पानी)', density: 1000, color: '#38bdf8' },
      saltWater: { name: 'Dead Sea / Salty Water (नुनिलो पानी)', density: 1080, color: '#0284c7' },
      kerosene: { name: 'Kerosene (मट्टितेल)', density: 800, color: '#fbbf24' },
      mercury: { name: 'Mercury (पारो)', density: 13600, color: '#94a3b8' }
    };

    this.render();
  }

  render() {
    if (!this.container) return;

    // Hydraulic calculations
    const pressure = this.f1 / (this.a1 * 0.0001); // Pascals (N/m²)
    const f2 = pressure * (this.a2 * 0.0001); // Newtons lifted
    const mechanicalAdvantage = this.a2 / this.a1;
    const carMass = (f2 / 9.8).toFixed(1);

    // Archimedes calculations
    const mat = this.materials[this.selectedMaterial];
    const liq = this.liquids[this.selectedLiquid];

    const massObject = mat.density * this.objectVolume; // kg
    const weightInAir = massObject * 9.8; // Newtons
    const upthrust = liq.density * this.objectVolume * 9.8; // U = V * rho * g
    const apparentWeight = Math.max(0, weightInAir - upthrust);
    const willFloat = mat.density <= liq.density;

    this.container.innerHTML = `
      <div class="lab-card">
        <div class="lab-header">
          <div>
            <h3>Pascal's Law & Hydraulic Machines (पास्कलको नियम र हाइड्रोलीक यन्त्र)</h3>
            <p class="lab-desc">Pressure exerted anywhere in an enclosed liquid is transmitted equally and undiminished in all directions perpendicularly to the walls of the container.</p>
          </div>
          <div class="formula-badge">F₁ / A₁ = F₂ / A₂</div>
        </div>

        <!-- Hydraulic Lift Stage -->
        <div class="hydraulic-stage">
          <div class="piston-side small-side">
            <div class="piston-label">Small Piston (A₁ = ${this.a1} cm²)</div>
            <div class="piston-shaft small-shaft" id="piston-small" style="width: ${20 + this.a1 * 4}px;">
              <span class="force-input-badge">Push: ${this.f1} N</span>
            </div>
          </div>

          <div class="hydraulic-pipe">
            <span class="fluid-pressure-text">Uniform Fluid Pressure P = ${(pressure / 1000).toFixed(1)} kPa</span>
          </div>

          <div class="piston-side large-side">
            <div class="piston-label">Large Piston (A₂ = ${this.a2} cm²)</div>
            <div class="piston-shaft large-shaft" id="piston-large" style="width: ${Math.min(180, 50 + this.a2 * 0.7)}px;">
              <span class="lifted-car">🚗 Lifting: ${f2.toFixed(0)} N (${carMass} kg)</span>
            </div>
          </div>
        </div>

        <!-- Hydraulic Telemetry -->
        <div class="calculation-box">
          <div class="calc-row">
            <strong>Input Force (F₁):</strong> ${this.f1} N &nbsp;|&nbsp;
            <strong>Area A₁:</strong> ${this.a1} cm² &nbsp;|&nbsp;
            <strong>Area A₂:</strong> ${this.a2} cm² &nbsp;|&nbsp;
            <strong>Mechanical Advantage (MA):</strong> ${mechanicalAdvantage.toFixed(1)}×
          </div>
          <div class="calc-formula">
            Output Force F₂ = F₁ × (A₂ / A₁) = (${this.f1} N) × (${this.a2} / ${this.a1}) = <strong>${f2.toFixed(1)} N</strong>
          </div>
        </div>

        <!-- Hydraulic Sliders -->
        <div class="controls-grid">
          <div class="ctrl-item">
            <label>Input Hand Force (F₁): <span id="lbl-f1">${this.f1} N</span></label>
            <input type="range" id="slider-f1" min="10" max="250" value="${this.f1}">
          </div>

          <div class="ctrl-item">
            <label>Small Piston Area (A₁): <span id="lbl-a1">${this.a1} cm²</span></label>
            <input type="range" id="slider-a1" min="2" max="15" value="${this.a1}">
          </div>

          <div class="ctrl-item">
            <label>Large Piston Area (A₂): <span id="lbl-a2">${this.a2} cm²</span></label>
            <input type="range" id="slider-a2" min="50" max="400" step="10" value="${this.a2}">
          </div>
        </div>

        <hr class="lab-divider">

        <!-- Archimedes' Principle & Upthrust Tank -->
        <div class="archimedes-section">
          <div class="lab-header">
            <div>
              <h3>Archimedes' Principle & Law of Floatation (आर्किमिडिजको सिद्धान्त र तैरने नियम)</h3>
              <p class="lab-desc">Upthrust (U) on an object immersed in a liquid equals the weight of the displaced liquid: U = V · ρ_liquid · g.</p>
            </div>
            <div class="formula-badge">U = V · ρ · g</div>
          </div>

          <div class="archimedes-tank-grid">
            <div class="water-tank" style="background: linear-gradient(to bottom, transparent 25%, ${liq.color} 25%);">
              <div class="submerged-object ${willFloat ? 'floating' : 'sunk'}" style="top: ${willFloat ? '18%' : '75%'};">
                <span class="obj-emoji">${mat.emoji}</span>
                <span class="obj-name">${mat.name}</span>
                <span class="obj-state">${willFloat ? 'FLOATING (तैरन्छ)' : 'SUNKEN (डुब्छ)'}</span>
              </div>
            </div>

            <div class="archimedes-stats">
              <div class="stat-pill">
                <span>Material: </span>
                <select id="select-mat" class="ctrl-select">
                  <option value="wood" ${this.selectedMaterial === 'wood' ? 'selected' : ''}>🪵 Wood (700 kg/m³)</option>
                  <option value="ice" ${this.selectedMaterial === 'ice' ? 'selected' : ''}>🧊 Ice (917 kg/m³)</option>
                  <option value="aluminum" ${this.selectedMaterial === 'aluminum' ? 'selected' : ''}>⚙️ Aluminum (2700 kg/m³)</option>
                  <option value="iron" ${this.selectedMaterial === 'iron' ? 'selected' : ''}>🔩 Iron (7870 kg/m³)</option>
                </select>
              </div>

              <div class="stat-pill">
                <span>Liquid Medium: </span>
                <select id="select-liq" class="ctrl-select">
                  <option value="water" ${this.selectedLiquid === 'water' ? 'selected' : ''}>💧 Pure Water (1000 kg/m³)</option>
                  <option value="saltWater" ${this.selectedLiquid === 'saltWater' ? 'selected' : ''}>🌊 Salty Sea Water (1080 kg/m³)</option>
                  <option value="kerosene" ${this.selectedLiquid === 'kerosene' ? 'selected' : ''}>🛢️ Kerosene (800 kg/m³)</option>
                  <option value="mercury" ${this.selectedLiquid === 'mercury' ? 'selected' : ''}>🧪 Dense Mercury (13600 kg/m³)</option>
                </select>
              </div>

              <div class="balance-sheet">
                <div>Weight of Object in Air (W₁): <strong>${weightInAir.toFixed(2)} N</strong></div>
                <div>Upthrust from Liquid (U): <strong>${upthrust.toFixed(2)} N</strong></div>
                <div>Apparent Weight in Liquid (W₂ = W₁ - U): <strong>${apparentWeight.toFixed(2)} N</strong></div>
                <div class="density-comparison">
                  Density of Object: <strong>${mat.density} kg/m³</strong> vs Density of Liquid: <strong>${liq.density} kg/m³</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    const sF1 = document.getElementById('slider-f1');
    const sA1 = document.getElementById('slider-a1');
    const sA2 = document.getElementById('slider-a2');

    const updateHydraulic = () => {
      this.f1 = parseFloat(sF1.value);
      this.a1 = parseFloat(sA1.value);
      this.a2 = parseFloat(sA2.value);
      this.render();
    };

    if (sF1) sF1.addEventListener('input', updateHydraulic);
    if (sA1) sA1.addEventListener('input', updateHydraulic);
    if (sA2) sA2.addEventListener('input', updateHydraulic);

    const selMat = document.getElementById('select-mat');
    if (selMat) {
      selMat.addEventListener('change', (e) => {
        this.selectedMaterial = e.target.value;
        this.render();
      });
    }

    const selLiq = document.getElementById('select-liq');
    if (selLiq) {
      selLiq.addEventListener('change', (e) => {
        this.selectedLiquid = e.target.value;
        this.render();
      });
    }
  }
}
