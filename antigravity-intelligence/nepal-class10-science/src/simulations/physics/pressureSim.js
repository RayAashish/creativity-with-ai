// Interactive Pressure, Pascal's Hydraulic Lift & Archimedes Upthrust Tank

export function renderPressureSim(container, lang = 'en') {
  container.innerHTML = `
    <div class="sim-card">
      <div class="sim-header">
        <div class="sim-badge">PHYSICS LAB // भौतिक विज्ञान</div>
        <h2 class="sim-title">${lang === 'np' ? 'तरल पदार्थको चाप, पास्कलको नियम र आर्किमिडिजको सिद्धान्त' : 'Pressure, Pascal\'s Hydraulic Lift & Archimedes Lab'}</h2>
        <p class="sim-desc">
          ${lang === 'np'
            ? 'पास्कलको नियममा आधारित हाइड्रोलिक ग्यारेज लिफ्ट र आर्किमिडिजको सिद्धान्तमा आधारित विस्थापित पानीको तौल र उर्ध्वचाप।'
            : 'Explore Pascal\'s Law through an interactive hydraulic car lift (F₁/A₁ = F₂/A₂) and Archimedes\' immersion tank with real displaced liquid overflow.'}
        </p>
      </div>

      <div class="lab-subtabs">
        <button class="subtab-btn active" data-sub="pascal">${lang === 'np' ? '🚗 पास्कलको नियम (हाइड्रोलिक लिफ्ट)' : '🚗 Pascal\'s Hydraulic Lift'}</button>
        <button class="subtab-btn" data-sub="archimedes">${lang === 'np' ? '⚖️ आर्किमिडिज र उर्ध्वचाप (Eureka Can)' : '⚖️ Archimedes & Upthrust Tank'}</button>
      </div>

      <!-- 1. PASCAL HYDRAULIC LIFT -->
      <div id="press-sub-pascal" class="subtab-content active">
        <div class="minimal-grid">
          <div class="interactive-panel">
            <h3 class="panel-heading">${lang === 'np' ? 'हाइड्रोलिक कार लिफ्ट (यान्त्रिक फाइदा)' : 'Hydraulic Garage Lift (Mechanical Advantage)'}</h3>

            <div class="canvas-wrapper">
              <svg viewBox="0 0 540 260" class="sim-svg">
                <!-- Hydraulic fluid connecting tube -->
                <path d="M 90 190 L 90 230 L 420 230 L 420 180" fill="none" stroke="#0284c7" stroke-width="26" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M 90 190 L 90 230 L 420 230 L 420 180" fill="none" stroke="#e0f2fe" stroke-width="22" stroke-linecap="round" stroke-linejoin="round" />

                <!-- Small Cylinder (Left, Area A1) -->
                <rect x="75" y="110" width="30" height="90" fill="none" stroke="#18181b" stroke-width="2" />
                <rect id="piston-small" x="76" y="140" width="28" height="12" fill="#52525b" rx="2" />
                <line id="piston-small-rod" x1="90" y1="70" x2="90" y2="140" stroke="#18181b" stroke-width="4" />
                <polygon points="85,60 95,60 90,70" fill="#ef4444" />
                <text x="90" y="50" text-anchor="middle" font-size="10" fill="#ef4444" font-weight="bold">F₁ (Input)</text>
                <text x="90" y="215" text-anchor="middle" font-size="9" fill="#0284c7" font-weight="bold">A₁ = 10 cm²</text>

                <!-- Large Cylinder (Right, Area A2) -->
                <rect x="360" y="90" width="120" height="110" fill="none" stroke="#18181b" stroke-width="2" />
                <rect id="piston-large" x="362" y="130" width="116" height="18" fill="#52525b" rx="3" />
                <rect id="lift-platform" x="340" y="124" width="160" height="8" fill="#18181b" rx="2" />
                
                <!-- Vehicle on platform -->
                <g id="lift-vehicle" transform="translate(370, 75)">
                  <!-- Car body -->
                  <rect x="15" y="20" width="70" height="25" fill="#3b82f6" rx="4" />
                  <polygon points="25,20 35,5 65,5 75,20" fill="#60a5fa" />
                  <circle cx="32" cy="46" r="8" fill="#18181b" /><circle cx="32" cy="46" r="3" fill="#ffffff" />
                  <circle cx="68" cy="46" r="8" fill="#18181b" /><circle cx="68" cy="46" r="3" fill="#ffffff" />
                  <text x="50" y="2" text-anchor="middle" font-size="10" fill="#18181b" font-weight="bold">Car (15,000 N)</text>
                </g>

                <text x="420" y="215" text-anchor="middle" font-size="9" fill="#0284c7" font-weight="bold">A₂ = 500 cm² (50x larger)</text>
              </svg>
            </div>

            <div class="control-row">
              <label class="control-label">
                <span>Input Force on Small Piston ($F_1$):</span>
                <span id="f1-val-text" class="value-pill">300 N</span>
              </label>
              <input type="range" id="f1-slider" min="50" max="600" value="300" class="minimal-slider" />
            </div>

            <div class="telemetry-bar">
              <div class="telemetry-item">
                <span class="telemetry-label">Output Force ($F_2 = F_1 \times A_2/A_1$):</span>
                <span id="f2-res-val" class="telemetry-value">15,000 N</span>
              </div>
              <div class="telemetry-item">
                <span class="telemetry-label">Mechanical Advantage:</span>
                <span class="telemetry-note">50x (50 N lifts 2,500 N!)</span>
              </div>
            </div>
          </div>

          <div class="details-panel">
            <h4 class="details-heading">${lang === 'np' ? 'पास्कलको नियम र सूत्र' : 'Pascal\'s Formulation'}</h4>
            <div class="formula-box">
              <div class="formula-math">P_1 = P_2 \\implies \\frac{F_1}{A_1} = \\frac{F_2}{A_2} \\implies F_2 = F_1 \\cdot \\frac{A_2}{A_1}</div>
            </div>
            <ul class="clean-list">
              <li><strong>${lang === 'np' ? 'समान प्रसारण:' : 'Undiminished Transmission:'}</strong> ${lang === 'np' ? 'बन्द भाँडोमा तरलमा दिइएको चाप सबैतिर बराबर फैलिन्छ।' : 'Pressure applied anywhere to an enclosed fluid transmits equally in all directions.'}</li>
              <li><strong>${lang === 'np' ? 'उपयोगहरू:' : 'SEE Applications:'}</strong> Hydraulic lift, hydraulic press, hydraulic brakes in cars and motorcycles.</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- 2. ARCHIMEDES IMMERSION TANK -->
      <div id="press-sub-archimedes" class="subtab-content">
        <div class="minimal-grid">
          <div class="interactive-panel">
            <div class="control-grid-3">
              <div class="control-item">
                <label class="control-label">Select Solid Object:</label>
                <select id="solid-select" class="minimal-select">
                  <option value="iron">Iron Block (7,870 kg/m³) - Sinks</option>
                  <option value="wood">Wood Block (600 kg/m³) - Floats</option>
                  <option value="ice">Ice Block (920 kg/m³) - Floats 92%</option>
                  <option value="alu">Aluminum (2,700 kg/m³) - Sinks</option>
                </select>
              </div>

              <div class="control-item">
                <label class="control-label">Select Liquid:</label>
                <select id="liquid-select" class="minimal-select">
                  <option value="water">Pure Water (1,000 kg/m³)</option>
                  <option value="salt">Salt Water (1,030 kg/m³)</option>
                  <option value="kerosene">Kerosene (800 kg/m³)</option>
                  <option value="mercury">Mercury (13,600 kg/m³)</option>
                </select>
              </div>

              <div class="control-item">
                <label class="control-label">Object Volume:</label>
                <input type="number" id="solid-vol" value="0.002" step="0.001" min="0.001" max="0.01" class="minimal-number-input" />
                <span class="unit-text">m³ (2 Litres)</span>
              </div>
            </div>

            <div class="telemetry-bar" style="margin-top: 1.5rem;">
              <div class="telemetry-item">
                <span class="telemetry-label">Upthrust ($U = V \cdot d \cdot g$):</span>
                <span id="arch-u-res" class="telemetry-value">19.6 N</span>
              </div>
              <div class="telemetry-item">
                <span class="telemetry-label">Weight in Air vs Liquid:</span>
                <span id="arch-w-res" class="telemetry-note">Air: 154.3 N → Apparent: 134.7 N</span>
              </div>
              <div class="telemetry-item">
                <span class="telemetry-label">Floatation Verdict:</span>
                <span id="arch-verdict" class="telemetry-value" style="color: #ef4444;">SINKS TO BOTTOM</span>
              </div>
            </div>
          </div>

          <div class="details-panel">
            <h4 class="details-heading">${lang === 'np' ? 'तैरने नियम (Law of Floatation)' : 'Conditions of Floatation'}</h4>
            <ul class="clean-list">
              <li><strong>${lang === 'np' ? 'डुब्ने अवस्था:' : 'Sinking Condition:'}</strong> When density of body > density of liquid ($d_{\\text{body}} > d_{\\text{liq}}$), Weight > Upthrust $\\to$ Sinks.</li>
              <li><strong>${lang === 'np' ? 'तैरने अवस्था:' : 'Floating Condition:'}</strong> When $d_{\\text{body}} \\le d_{\\text{liq}}$, Upthrust balances weight $\\to$ Floats.</li>
              <li><strong>${lang === 'np' ? 'नुनिलो पानीमा किन सजिलो?' : 'Why is swimming easier in salt water?'}</strong> Salt water has higher density ($1,030\\text{ kg/m}^3$) than fresh water, producing greater upthrust.</li>
            </ul>
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
      const target = container.querySelector(`#press-sub-${t.dataset.sub}`);
      if (target) target.classList.add('active');
    });
  });

  // Pascal Lift slider
  const f1Slider = container.querySelector('#f1-slider');
  const f1Text = container.querySelector('#f1-val-text');
  const f2Res = container.querySelector('#f2-res-val');
  const pSmall = container.querySelector('#piston-small');
  const pSmallRod = container.querySelector('#piston-small-rod');
  const pLarge = container.querySelector('#piston-large');
  const liftPlatform = container.querySelector('#lift-platform');
  const liftVehicle = container.querySelector('#lift-vehicle');

  f1Slider.addEventListener('input', () => {
    const f1 = parseFloat(f1Slider.value);
    const ratio = 50; // A2 / A1 = 50
    const f2 = f1 * ratio;

    f1Text.textContent = `${f1} N`;
    f2Res.textContent = `${f2.toLocaleString()} N`;

    // Visual displacement
    const maxPush = 25;
    const progress = (f1 - 50) / 550;
    const smallY = 140 + progress * maxPush;
    pSmall.setAttribute('y', smallY);
    pSmallRod.setAttribute('y2', smallY);

    const largeRise = progress * (maxPush / 3);
    const largeY = 130 - largeRise;
    pLarge.setAttribute('y', largeY);
    liftPlatform.setAttribute('y', 124 - largeRise);
    liftVehicle.setAttribute('transform', `translate(370, ${75 - largeRise})`);
  });

  // Archimedes calculator
  const solidSelect = container.querySelector('#solid-select');
  const liquidSelect = container.querySelector('#liquid-select');
  const volInput = container.querySelector('#solid-vol');
  const uRes = container.querySelector('#arch-u-res');
  const wRes = container.querySelector('#arch-w-res');
  const verdict = container.querySelector('#arch-verdict');

  const solidDensities = { iron: 7870, wood: 600, ice: 920, alu: 2700 };
  const liquidDensities = { water: 1000, salt: 1030, kerosene: 800, mercury: 13600 };

  const updateArchimedes = () => {
    const dSolid = solidDensities[solidSelect.value];
    const dLiq = liquidDensities[liquidSelect.value];
    const V = parseFloat(volInput.value) || 0.002;
    const g = 9.8;

    const W_air = V * dSolid * g;
    const U = V * dLiq * g;

    uRes.textContent = `${U.toFixed(1)} N`;

    if (dSolid > dLiq) {
      const W_app = W_air - U;
      wRes.textContent = `Air: ${W_air.toFixed(1)} N → Liquid: ${W_app.toFixed(1)} N`;
      verdict.textContent = `SINKS (डूब्यो) - d_solid (${dSolid}) > d_liq (${dLiq})`;
      verdict.style.color = '#ef4444';
    } else {
      const subFraction = ((dSolid / dLiq) * 100).toFixed(0);
      wRes.textContent = `Floats with ${subFraction}% submerged volume`;
      verdict.textContent = `FLOATS (तैरियो) - Upthrust balances weight`;
      verdict.style.color = '#10b981';
    }
  };

  solidSelect.addEventListener('change', updateArchimedes);
  liquidSelect.addEventListener('change', updateArchimedes);
  volInput.addEventListener('input', updateArchimedes);
  updateArchimedes();
}
