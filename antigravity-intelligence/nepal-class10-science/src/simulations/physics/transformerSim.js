// Interactive Electricity & Transformer Module: Step-Up / Step-Down Simulator
// and Household Electricity Consumption & Billing Calculator (NEA Standards)

export class TransformerSimulation {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.np = 100; // Primary turns
    this.ns = 400; // Secondary turns
    this.vp = 220; // Primary AC Voltage (Volts)
    this.ip = 4.0; // Primary current (Amperes)

    // Household Appliances for Electricity Calculator
    this.appliances = [
      { name: 'LED Bulbs (एलईडी चिम)', watts: 15, count: 6, hours: 5 },
      { name: 'Ceiling Fans (पङ्खा)', watts: 75, count: 2, hours: 6 },
      { name: 'Color Television (टिभी)', watts: 80, count: 1, hours: 4 },
      { name: 'Refrigerator (फ्रिज)', watts: 200, count: 1, hours: 12 },
      { name: 'Rice Cooker (राइस कुकर)', watts: 700, count: 1, hours: 1 },
      { name: 'Electric Heater (हिटर)', watts: 1200, count: 1, hours: 2 }
    ];
    this.ratePerUnit = 10.0; // NPR per kWh unit

    this.render();
  }

  calculateTransformer() {
    // Vp / Vs = Np / Ns => Vs = Vp * (Ns / Np)
    const vs = this.vp * (this.ns / this.np);
    // Ip / Is = Ns / Np => Is = Ip * (Np / Ns)
    const is = this.ip * (this.np / this.ns);
    const isStepUp = this.ns > this.np;
    const turnsRatio = (this.ns / this.np).toFixed(2);

    return { vs, is, isStepUp, turnsRatio };
  }

  calculateElectricityBill() {
    let totalDailyWattHours = 0;
    this.appliances.forEach(app => {
      totalDailyWattHours += app.watts * app.count * app.hours;
    });

    const dailyUnits = totalDailyWattHours / 1000; // kWh
    const monthlyUnits = dailyUnits * 30;
    const monthlyCost = monthlyUnits * this.ratePerUnit;

    return { dailyUnits, monthlyUnits, monthlyCost };
  }

  render() {
    if (!this.container) return;

    const t = this.calculateTransformer();
    const bill = this.calculateElectricityBill();

    this.container.innerHTML = `
      <div class="lab-card">
        <div class="lab-header">
          <div>
            <h3>Current Electricity & Transformers (विद्युत् र ट्रान्सफर्मर)</h3>
            <p class="lab-desc">Transformers alter alternating voltage (AC) via mutual electromagnetic induction without changing frequency.</p>
          </div>
          <div class="formula-badge">Vp / Vs = Np / Ns = Is / Ip</div>
        </div>

        <!-- Transformer Visual Stage -->
        <div class="transformer-stage">
          <div class="coil-panel primary-panel">
            <span class="coil-title">Primary Coil (इनपुट)</span>
            <div class="voltage-input">Vp = ${this.vp} V (AC)</div>
            <div class="turns-count">Turns (Np): ${this.np}</div>
            <div class="copper-turns primary-turns" style="height: ${Math.min(180, 40 + this.np * 0.35)}px;"></div>
            <div class="current-badge">Ip = ${this.ip.toFixed(1)} A</div>
          </div>

          <!-- Laminated Soft Iron Core -->
          <div class="iron-core">
            <div class="core-label">
              <span>Laminated Soft Iron Core</span>
              <span class="core-sub">(पातला पत्तीहरू जोडेर बनेको लेमिनेटेड फलाम)</span>
            </div>
            <div class="flux-lines">
              <span class="flux-arrow">⇄ Mutual Magnetic Flux (Φ) ⇄</span>
            </div>
          </div>

          <div class="coil-panel secondary-panel">
            <span class="coil-title">Secondary Coil (आउटपुट)</span>
            <div class="voltage-output ${t.isStepUp ? 'step-up-text' : 'step-down-text'}">
              Vs = ${t.vs.toFixed(0)} V
            </div>
            <div class="turns-count">Turns (Ns): ${this.ns}</div>
            <div class="copper-turns secondary-turns" style="height: ${Math.min(180, 40 + this.ns * 0.35)}px;"></div>
            <div class="current-badge">Is = ${t.is.toFixed(2)} A</div>
          </div>

          <!-- Connected Output Load / Light Bulb -->
          <div class="output-bulb-stage">
            <div class="bulb-icon ${t.vs > 100 ? (t.vs > 400 ? 'bulb-super-bright' : 'bulb-bright') : 'bulb-dim'}">
              💡
            </div>
            <span class="bulb-status">
              ${t.vs > 500 ? '⚠️ High Voltage Output!' : (t.vs > 100 ? 'Output Bulb Glowing Bright' : 'Dim Output Bulb')}
            </span>
          </div>
        </div>

        <!-- Real-time Mathematical Working -->
        <div class="calculation-box">
          <div class="calc-row">
            <strong>Transformer Type:</strong> 
            <span class="badge-type ${t.isStepUp ? 'step-up' : 'step-down'}">
              ${t.isStepUp ? '⚡ STEP-UP TRANSFORMER (स्टेप-अप: बढाउने)' : '🔽 STEP-DOWN TRANSFORMER (स्टेप-डाउन: घटाउने)'}
            </span>
            &nbsp;|&nbsp; <strong>Turns Ratio (Ns / Np):</strong> ${t.turnsRatio}
          </div>
          <div class="calc-formula">
            Vs = Vp × (Ns / Np) = (${this.vp} V) × (${this.ns} / ${this.np}) = <strong>${t.vs.toFixed(1)} Volts</strong>
          </div>
        </div>

        <!-- Sliders -->
        <div class="controls-grid">
          <div class="ctrl-item">
            <label>Primary Turns (Np): <span id="lbl-np">${this.np}</span></label>
            <input type="range" id="slider-np" min="50" max="500" step="10" value="${this.np}">
          </div>

          <div class="ctrl-item">
            <label>Secondary Turns (Ns): <span id="lbl-ns">${this.ns}</span></label>
            <input type="range" id="slider-ns" min="50" max="500" step="10" value="${this.ns}">
          </div>
        </div>

        <hr class="lab-divider">

        <!-- Electricity Meter Consumption & Billing Calculator (NEA) -->
        <div class="billing-section">
          <div class="lab-header">
            <div>
              <h3>Electricity Consumption & Billing Calculator (घरायसी बिजुली मिटर रिडिङ)</h3>
              <p class="lab-desc">1 Unit of electricity = 1 Kilowatt-hour (kWh) = 3.6 × 10⁶ Joules. Calculate your home's monthly electricity bill based on NEA rates!</p>
            </div>
            <div class="formula-badge">Units (kWh) = (Watts × Hours) / 1000</div>
          </div>

          <div class="appliance-table-container">
            <table class="appliance-table">
              <thead>
                <tr>
                  <th>Appliance (उपकरण)</th>
                  <th>Power (Watts)</th>
                  <th>Quantity (संख्या)</th>
                  <th>Daily Hours (दैनिक घण्टा)</th>
                  <th>Daily Units (kWh)</th>
                </tr>
              </thead>
              <tbody>
                ${this.appliances.map((app, idx) => `
                  <tr>
                    <td><strong>${app.name}</strong></td>
                    <td>${app.watts} W</td>
                    <td>
                      <input type="number" min="0" max="20" value="${app.count}" class="input-table count-input" data-idx="${idx}">
                    </td>
                    <td>
                      <input type="number" min="0" max="24" value="${app.hours}" class="input-table hours-input" data-idx="${idx}">
                    </td>
                    <td>${((app.watts * app.count * app.hours) / 1000).toFixed(3)} units</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <!-- Total Bill Summary -->
          <div class="bill-summary-card">
            <div class="bill-metric">
              <span>Daily Consumption:</span>
              <strong>${bill.dailyUnits.toFixed(2)} Units (kWh/day)</strong>
            </div>
            <div class="bill-metric">
              <span>Monthly Consumption (30 Days):</span>
              <strong>${bill.monthlyUnits.toFixed(1)} Units</strong>
            </div>
            <div class="bill-metric highlight">
              <span>Estimated Monthly Bill (@ NPR ${this.ratePerUnit}/unit):</span>
              <strong>NPR ${bill.monthlyCost.toFixed(2)}</strong>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    const sNp = document.getElementById('slider-np');
    const sNs = document.getElementById('slider-ns');

    if (sNp) {
      sNp.addEventListener('input', (e) => {
        this.np = parseInt(e.target.value);
        this.render();
      });
    }

    if (sNs) {
      sNs.addEventListener('input', (e) => {
        this.ns = parseInt(e.target.value);
        this.render();
      });
    }

    // Appliance table inputs
    const countInputs = document.querySelectorAll('.count-input');
    countInputs.forEach(input => {
      input.addEventListener('change', (e) => {
        const idx = parseInt(e.target.dataset.idx);
        this.appliances[idx].count = parseInt(e.target.value) || 0;
        this.render();
      });
    });

    const hoursInputs = document.querySelectorAll('.hours-input');
    hoursInputs.forEach(input => {
      input.addEventListener('change', (e) => {
        const idx = parseInt(e.target.dataset.idx);
        this.appliances[idx].hours = parseFloat(e.target.value) || 0;
        this.render();
      });
    });
  }
}
