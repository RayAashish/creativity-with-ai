// Interactive Transformer Simulator & NEA Domestic Electricity Meter

export function renderTransformerSim(container, lang = 'en') {
  container.innerHTML = `
    <div class="sim-card">
      <div class="sim-header">
        <div class="sim-badge">PHYSICS LAB // भौतिक विज्ञान</div>
        <h2 class="sim-title">${lang === 'np' ? 'ट्रान्सफर्मर र नेपाल विद्युत प्राधिकरण (NEA) महसुल मिटर' : 'Transformers & Domestic Electricity Meter'}</h2>
        <p class="sim-desc">
          ${lang === 'np'
            ? 'स्टेप-अप र स्टेप-डाउन ट्रान्सफर्मरको कुण्डली फन्का (Np/Ns), लेमिनेटेड सफ्ट आइरन कोर र नेपाली घरहरूको विद्युत युनिट तथा बिल गणना।'
            : 'Explore mutual induction in Step-Up and Step-Down transformers (Vp/Vs = Np/Ns = Is/Ip) and calculate household electricity tariffs for Nepal Electricity Authority (NEA).'}
        </p>
      </div>

      <div class="lab-subtabs">
        <button class="subtab-btn active" data-sub="transformer">${lang === 'np' ? '⚡ ट्रान्सफर्मर प्रयोगशाला' : '⚡ Transformer Lab'}</button>
        <button class="subtab-btn" data-sub="neameter">${lang === 'np' ? '🔌 NEA विद्युत महसुल मिटर' : '🔌 NEA Domestic Tariff Meter'}</button>
      </div>

      <!-- 1. TRANSFORMER LAB -->
      <div id="elec-sub-transformer" class="subtab-content active">
        <div class="minimal-grid">
          <div class="interactive-panel">
            <div class="canvas-wrapper">
              <svg id="transformer-svg" viewBox="0 0 520 260" class="sim-svg">
                <!-- Soft Iron Core (Laminated Frame) -->
                <rect x="140" y="30" width="240" height="200" fill="#f4f4f5" stroke="#18181b" stroke-width="4" rx="8" />
                <rect x="200" y="80" width="120" height="100" fill="#ffffff" stroke="#18181b" stroke-width="3" rx="4" />
                
                <!-- Lamination strips lines -->
                <line x1="140" y1="50" x2="380" y2="50" stroke="#d4d4d8" stroke-width="1" />
                <line x1="140" y1="65" x2="380" y2="65" stroke="#d4d4d8" stroke-width="1" />
                <line x1="140" y1="195" x2="380" y2="195" stroke="#d4d4d8" stroke-width="1" />
                <line x1="140" y1="210" x2="380" y2="210" stroke="#d4d4d8" stroke-width="1" />
                <text x="260" y="135" text-anchor="middle" font-size="9" fill="#71717a">Laminated Soft Iron Core</text>

                <!-- Primary Coil (Left) -->
                <g id="primary-coil-group">
                  <rect x="125" y="60" width="30" height="140" fill="none" stroke="#ef4444" stroke-width="3" stroke-dasharray="8,6" rx="4" />
                  <text x="90" y="110" font-size="11" fill="#ef4444" font-weight="bold">Primary</text>
                  <text id="np-label-svg" x="90" y="130" font-size="10" fill="#71717a">Np = 500</text>
                  <text id="vp-label-svg" x="90" y="148" font-size="10" fill="#ef4444" font-weight="bold">Vp = 220V</text>
                </g>

                <!-- Secondary Coil (Right) -->
                <g id="secondary-coil-group">
                  <rect x="365" y="60" width="30" height="140" fill="none" stroke="#3b82f6" stroke-width="3" stroke-dasharray="14,10" rx="4" />
                  <text x="405" y="110" font-size="11" fill="#3b82f6" font-weight="bold">Secondary</text>
                  <text id="ns-label-svg" x="405" y="130" font-size="10" fill="#71717a">Ns = 250</text>
                  <text id="vs-label-svg" x="405" y="148" font-size="10" fill="#3b82f6" font-weight="bold">Vs = 110V</text>
                </g>

                <!-- Magnetic Flux arrows in core -->
                <path d="M 170 50 L 350 50 L 350 210 L 170 210 Z" fill="none" stroke="#10b981" stroke-width="2" stroke-dasharray="6,4" />
                <text x="260" y="45" text-anchor="middle" font-size="9" fill="#10b981" font-weight="600">Alternating Magnetic Flux (Φ)</text>
              </svg>
            </div>

            <div class="control-grid-3">
              <div class="control-item">
                <label class="control-label">Primary Voltage ($V_p$):</label>
                <select id="tf-vp-select" class="minimal-select">
                  <option value="220">220 V (Nepal Mains Grid)</option>
                  <option value="11000">11,000 V (11 kV Substation)</option>
                  <option value="33000">33,000 V (33 kV Transmission)</option>
                </select>
              </div>

              <div class="control-item">
                <label class="control-label">Primary Turns ($N_p$):</label>
                <input type="range" id="tf-np-slider" min="100" max="2000" step="50" value="500" class="minimal-slider" />
                <span id="tf-np-val" class="value-pill">500 turns</span>
              </div>

              <div class="control-item">
                <label class="control-label">Secondary Turns ($N_s$):</label>
                <input type="range" id="tf-ns-slider" min="50" max="2000" step="50" value="250" class="minimal-slider" />
                <span id="tf-ns-val" class="value-pill">250 turns</span>
              </div>
            </div>

            <div class="telemetry-bar" style="margin-top: 1rem;">
              <div class="telemetry-item">
                <span class="telemetry-label">Output Secondary Voltage ($V_s$):</span>
                <span id="tf-vs-res" class="telemetry-value">110.0 V</span>
              </div>
              <div class="telemetry-item">
                <span class="telemetry-label">Transformer Type:</span>
                <span id="tf-type-badge" class="telemetry-note" style="color: #0284c7; font-weight: bold;">STEP-DOWN (स्टेप-डाउन)</span>
              </div>
            </div>
          </div>

          <div class="details-panel">
            <h4 class="details-heading">${lang === 'np' ? 'ट्रान्सफर्मर सूत्र र सिद्धान्त' : 'Transformer Formula'}</h4>
            <div class="formula-box">
              <div class="formula-math">\\frac{V_p}{V_s} = \\frac{N_p}{N_s} = \\frac{I_s}{I_p}</div>
            </div>
            <ul class="clean-list">
              <li><strong>${lang === 'np' ? 'स्टेप-अप:' : 'Step-Up:'}</strong> $N_s > N_p \\implies V_s > V_p$ (Used at power generation stations like Marshyangdi/Kaligandaki to step up voltage for long distance transmission).</li>
              <li><strong>${lang === 'np' ? 'स्टेप-डाउन:' : 'Step-Down:'}</strong> $N_s < N_p \\implies V_s < V_p$ (Used on poles to step down 11 kV to 220V for household appliances).</li>
              <li><strong>${lang === 'np' ? 'कोर लेमिनेसन:' : 'Lamination Reason:'}</strong> Reduces heating energy loss from eddy currents.</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- 2. NEA ELECTRICITY BILL METER -->
      <div id="elec-sub-neameter" class="subtab-content">
        <div class="minimal-grid">
          <div class="interactive-panel">
            <h3 class="panel-heading">${lang === 'np' ? 'घरेलु विद्युतीय उपकरणहरू र महसुल क्याल्कुलेटर' : 'Household Appliances & NEA Bill Calculator'}</h3>

            <div class="table-responsive">
              <table class="minimal-table">
                <thead>
                  <tr>
                    <th>Appliance (उपकरण)</th>
                    <th>Power (Watts)</th>
                    <th>Count (सङ्ख्या)</th>
                    <th>Daily Hours</th>
                    <th>Daily Wh</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>💡 LED Bulbs</td>
                    <td>15 W</td>
                    <td><input type="number" id="app-led-count" value="6" min="0" max="30" class="table-input" /></td>
                    <td><input type="number" id="app-led-hrs" value="6" min="0" max="24" class="table-input" /></td>
                    <td id="wh-led">540 Wh</td>
                  </tr>
                  <tr>
                    <td>🍚 Rice Cooker</td>
                    <td>700 W</td>
                    <td><input type="number" id="app-rice-count" value="1" min="0" max="5" class="table-input" /></td>
                    <td><input type="number" id="app-rice-hrs" value="1.5" step="0.5" min="0" max="24" class="table-input" /></td>
                    <td id="wh-rice">1050 Wh</td>
                  </tr>
                  <tr>
                    <td>❄️ Refrigerator</td>
                    <td>150 W</td>
                    <td><input type="number" id="app-fridge-count" value="1" min="0" max="3" class="table-input" /></td>
                    <td><input type="number" id="app-fridge-hrs" value="10" min="0" max="24" class="table-input" /></td>
                    <td id="wh-fridge">1500 Wh</td>
                  </tr>
                  <tr>
                    <td>🚰 Water Pump</td>
                    <td>750 W (1 HP)</td>
                    <td><input type="number" id="app-pump-count" value="1" min="0" max="2" class="table-input" /></td>
                    <td><input type="number" id="app-pump-hrs" value="0.5" step="0.5" min="0" max="24" class="table-input" /></td>
                    <td id="wh-pump">375 Wh</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="telemetry-bar" style="margin-top: 1.5rem;">
              <div class="telemetry-item">
                <span class="telemetry-label">Monthly Consumption:</span>
                <span id="nea-monthly-units" class="telemetry-value">103.9 Units (kWh)</span>
              </div>
              <div class="telemetry-item">
                <span class="telemetry-label">Estimated NEA Bill:</span>
                <span id="nea-bill-val" class="telemetry-value" style="color: #10b981;">Rs. 793.00</span>
              </div>
            </div>
          </div>

          <div class="details-panel">
            <h4 class="details-heading">${lang === 'np' ? 'विद्युत युनिट सूत्र' : 'Electrical Energy Formula'}</h4>
            <div class="formula-box">
              <div class="formula-math">\\text{Units (kWh)} = \\frac{P \\text{ (Watts)} \\times t \\text{ (Hours)} \\times \\text{Days}}{1000}</div>
            </div>
            <p class="text-muted">${lang === 'np' ? '१ किलोवाट-घण्टा (1 kWh) विद्युत शक्ति १ घण्टासम्म खर्च हुँदा १ युनिट विद्युत उठ्छ।' : '1 Unit equals 1 kilowatt-hour (1,000 Watts consumed for 1 hour).'}</p>
          </div>
        </div>
      </div>
    </div>
  `;

  // Subtabs
  const tabs = container.querySelectorAll('.subtab-btn');
  tabs.forEach(t => {
    t.addEventListener('click', () => {
      tabs.forEach(tab => tab.classList.remove('active'));
      container.querySelectorAll('.subtab-content').forEach(c => c.classList.remove('active'));
      t.classList.add('active');
      const target = container.querySelector(`#elec-sub-${t.dataset.sub}`);
      if (target) target.classList.add('active');
    });
  });

  // Transformer logic
  const vpSelect = container.querySelector('#tf-vp-select');
  const npSlider = container.querySelector('#tf-np-slider');
  const nsSlider = container.querySelector('#tf-ns-slider');
  const npVal = container.querySelector('#tf-np-val');
  const nsVal = container.querySelector('#tf-ns-val');
  const vsRes = container.querySelector('#tf-vs-res');
  const typeBadge = container.querySelector('#tf-type-badge');

  const npLabel = container.querySelector('#np-label-svg');
  const nsLabel = container.querySelector('#ns-label-svg');
  const vpLabel = container.querySelector('#vp-label-svg');
  const vsLabel = container.querySelector('#vs-label-svg');

  const updateTransformer = () => {
    const Vp = parseFloat(vpSelect.value);
    const Np = parseFloat(npSlider.value);
    const Ns = parseFloat(nsSlider.value);

    npVal.textContent = `${Np} turns`;
    nsVal.textContent = `${Ns} turns`;
    npLabel.textContent = `Np = ${Np}`;
    nsLabel.textContent = `Ns = ${Ns}`;
    vpLabel.textContent = `Vp = ${Vp}V`;

    const Vs = (Vp * Ns) / Np;
    vsRes.textContent = `${Vs >= 1000 ? (Vs / 1000).toFixed(2) + ' kV' : Vs.toFixed(1) + ' V'}`;
    vsLabel.textContent = `Vs = ${Vs.toFixed(0)}V`;

    if (Ns > Np) {
      typeBadge.textContent = 'STEP-UP (स्टेप-अप: Vs > Vp)';
      typeBadge.style.color = '#ef4444';
    } else if (Ns < Np) {
      typeBadge.textContent = 'STEP-DOWN (स्टेप-डाउन: Vs < Vp)';
      typeBadge.style.color = '#0284c7';
    } else {
      typeBadge.textContent = 'ISOLATION (1:1 Ratio)';
      typeBadge.style.color = '#71717a';
    }
  };

  vpSelect.addEventListener('change', updateTransformer);
  npSlider.addEventListener('input', updateTransformer);
  nsSlider.addEventListener('input', updateTransformer);
  updateTransformer();

  // NEA Tariff logic
  const inputs = [
    container.querySelector('#app-led-count'),
    container.querySelector('#app-led-hrs'),
    container.querySelector('#app-rice-count'),
    container.querySelector('#app-rice-hrs'),
    container.querySelector('#app-fridge-count'),
    container.querySelector('#app-fridge-hrs'),
    container.querySelector('#app-pump-count'),
    container.querySelector('#app-pump-hrs')
  ];

  const updateBill = () => {
    const ledWh = (parseFloat(inputs[0].value) || 0) * 15 * (parseFloat(inputs[1].value) || 0);
    const riceWh = (parseFloat(inputs[2].value) || 0) * 700 * (parseFloat(inputs[3].value) || 0);
    const fridgeWh = (parseFloat(inputs[4].value) || 0) * 150 * (parseFloat(inputs[5].value) || 0);
    const pumpWh = (parseFloat(inputs[6].value) || 0) * 750 * (parseFloat(inputs[7].value) || 0);

    container.querySelector('#wh-led').textContent = `${ledWh} Wh`;
    container.querySelector('#wh-rice').textContent = `${riceWh} Wh`;
    container.querySelector('#wh-fridge').textContent = `${fridgeWh} Wh`;
    container.querySelector('#wh-pump').textContent = `${pumpWh} Wh`;

    const totalDailyWh = ledWh + riceWh + fridgeWh + pumpWh;
    const monthlyUnits = (totalDailyWh * 30) / 1000;
    container.querySelector('#nea-monthly-units').textContent = `${monthlyUnits.toFixed(1)} Units (kWh)`;

    // NEA Tier Rates: First 20 units @ Rs. 3, next 80 units @ Rs. 7, above 100 @ Rs. 9.5
    let bill = 0;
    if (monthlyUnits <= 20) {
      bill = monthlyUnits * 3;
    } else if (monthlyUnits <= 100) {
      bill = 20 * 3 + (monthlyUnits - 20) * 7;
    } else {
      bill = 20 * 3 + 80 * 7 + (monthlyUnits - 100) * 9.5;
    }

    container.querySelector('#nea-bill-val').textContent = `Rs. ${bill.toFixed(2)}`;
  };

  inputs.forEach(inp => inp.addEventListener('input', updateBill));
  updateBill();
}
