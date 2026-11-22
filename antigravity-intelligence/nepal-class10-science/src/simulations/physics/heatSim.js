// Interactive Heat, Specific Heat Capacity & Anomalous Expansion of Water Lab

export function renderHeatSim(container, lang = 'en') {
  container.innerHTML = `
    <div class="sim-card">
      <div class="sim-header">
        <div class="sim-badge">PHYSICS LAB // भौतिक विज्ञान</div>
        <h2 class="sim-title">${lang === 'np' ? 'ताप, विशिष्ट तापधारण क्षमता र पानीको असामान्य प्रसार' : 'Heat, Specific Heat & Anomalous Expansion Lab'}</h2>
        <p class="sim-desc">
          ${lang === 'np'
            ? 'पानीको असामान्य प्रसार (०°C देखि १०°C सम्म), हिमाली तालहरूमा माछा बाँच्ने कारण र क्यालोरीमिति समीकरण (Q = mcΔθ)।'
            : 'Explore the anomalous expansion of water (0°C to 10°C), survival of aquatic life under frozen ice, and calorimetry equilibrium.'}
        </p>
      </div>

      <div class="lab-subtabs">
        <button class="subtab-btn active" data-sub="anomalous">${lang === 'np' ? '🧊 पानीको असामान्य प्रसार' : '🧊 Anomalous Expansion of Water'}</button>
        <button class="subtab-btn" data-sub="calorimeter">${lang === 'np' ? '🌡️ क्यालोरीमिति र विशिष्ट ताप' : '🌡️ Specific Heat & Calorimeter'}</button>
      </div>

      <div id="heat-subtab-anomalous" class="subtab-content active">
        <div class="minimal-grid">
          <div class="interactive-panel">
            <h3 class="panel-heading">${lang === 'np' ? 'तापक्रम अनुसार पानीको आयतन र घनत्व' : 'Water Density & Volume vs Temperature'}</h3>

            <div class="canvas-wrapper">
              <svg viewBox="0 0 500 260" class="sim-svg">
                <!-- Axes -->
                <line x1="60" y1="210" x2="450" y2="210" stroke="#71717a" stroke-width="1.5" />
                <line x1="60" y1="210" x2="60" y2="30" stroke="#71717a" stroke-width="1.5" />
                <text x="250" y="245" text-anchor="middle" font-size="11" fill="#71717a">Temperature (°C)</text>
                <text x="25" y="120" text-anchor="middle" font-size="11" fill="#71717a" transform="rotate(-90, 25, 120)">Density (kg/m³)</text>

                <!-- Temperature Marks -->
                <text x="60" y="225" text-anchor="middle" font-size="10" fill="#71717a">0°</text>
                <text x="140" y="225" text-anchor="middle" font-size="10" fill="#10b981" font-weight="bold">4°C (Peak)</text>
                <line x1="140" y1="210" x2="140" y2="50" stroke="#10b981" stroke-width="1" stroke-dasharray="3,3" />
                <text x="250" y="225" text-anchor="middle" font-size="10" fill="#71717a">10°C</text>
                <text x="420" y="225" text-anchor="middle" font-size="10" fill="#71717a">100°C</text>

                <!-- Density Curve (rises 0 to 4, then drops) -->
                <path d="M 60 160 Q 140 50 420 180" fill="none" stroke="#0284c7" stroke-width="3" />

                <!-- Current Temp Marker -->
                <circle id="temp-marker" cx="140" cy="50" r="7" fill="#10b981" stroke="#ffffff" stroke-width="2" />
                <text id="marker-temp-text" x="155" y="55" font-size="11" fill="#10b981" font-weight="600">4°C: Max Density (1000 kg/m³)</text>
              </svg>
            </div>

            <div class="control-row">
              <label class="control-label">
                <span>Temperature (°C):</span>
                <span id="water-temp-val" class="value-pill">4 °C</span>
              </label>
              <input type="range" id="water-temp-slider" min="0" max="15" value="4" class="minimal-slider" />
            </div>

            <!-- Frozen Lake Simulation Diagram -->
            <div class="lake-diagram-box">
              <h4 class="details-heading">${lang === 'np' ? 'जाडोयाममा हिमाली तालको अवस्था:' : 'Himalayan Lake in Freezing Winter:'}</h4>
              <div class="lake-layers">
                <div class="lake-layer ice">❄️ Surface Ice Layer: 0°C (Ice floats because d = 920 kg/m³)</div>
                <div class="lake-layer water-sub">💧 Sub-surface Water: 1°C - 3°C</div>
                <div class="lake-layer bottom">🐟 Deep Lake Bottom: 4°C (DENSEST WATER Sinks to bottom, fish survive!)</div>
              </div>
            </div>
          </div>

          <div class="details-panel">
            <h4 class="details-heading">${lang === 'np' ? 'पानीको असामान्य प्रसारको महत्व' : 'Biological Importance'}</h4>
            <p class="text-muted">
              ${lang === 'np'
                ? 'सामान्यतया पदार्थहरू तताउँदा फैलिन्छन् र चिस्याउँदा खुम्चिन्छन्। तर पानीलाई ०°C बाट ४°C सम्म तताउँदा यो खुम्चिन्छ र यसको आयतन न्यूनतम तथा घनत्व अधिकतम (१००० kg/m³) हुन्छ।'
                : 'Most liquids expand when heated. Water uniquely contracts between 0°C and 4°C. At 4°C, water reaches its minimum volume and maximum density.'}
            </p>
            <ul class="clean-list">
              <li><strong>${lang === 'np' ? 'हिउँ किन तैरिन्छ?' : 'Why Ice Floats:'}</strong> Density of ice at 0°C is ~920 kg/m³, which is less than water (1000 kg/m³).</li>
              <li><strong>${lang === 'np' ? 'माछा कसरी बाँच्छन्?' : 'Aquatic Survival:'}</strong> Heavy 4°C water remains at the lake bottom, preventing lakes from freezing solid to the ground.</li>
            </ul>
          </div>
        </div>
      </div>

      <div id="heat-subtab-calorimeter" class="subtab-content">
        <div class="minimal-grid">
          <div class="interactive-panel">
            <h3 class="panel-heading">${lang === 'np' ? 'क्यालोरीमिति समीकरण र विशिष्ट ताप' : 'Calorimetry & Heat Equation'}</h3>
            <div class="formula-box">
              <div class="formula-math">Q = m \\cdot c \\cdot \\Delta\\theta</div>
            </div>

            <div class="control-grid-3">
              <div class="control-item">
                <label class="control-label">Mass of Water (m):</label>
                <input type="number" id="cal-mass" value="2" min="0.1" step="0.5" class="minimal-number-input" />
                <span class="unit-text">kg</span>
              </div>
              <div class="control-item">
                <label class="control-label">Initial Temp (θ₁):</label>
                <input type="number" id="cal-t1" value="20" min="0" max="100" class="minimal-number-input" />
                <span class="unit-text">°C</span>
              </div>
              <div class="control-item">
                <label class="control-label">Final Temp (θ₂):</label>
                <input type="number" id="cal-t2" value="80" min="0" max="100" class="minimal-number-input" />
                <span class="unit-text">°C</span>
              </div>
            </div>

            <div class="telemetry-bar" style="margin-top: 1.5rem;">
              <div class="telemetry-item">
                <span class="telemetry-label">Required Heat Energy (Q):</span>
                <span id="cal-q-result" class="telemetry-value">504.0 kJ</span>
              </div>
              <div class="telemetry-item">
                <span class="telemetry-label">Formula:</span>
                <span id="cal-formula-steps" class="telemetry-note">Q = 2 × 4200 × (80 - 20)</span>
              </div>
            </div>
          </div>

          <div class="details-panel">
            <h4 class="details-heading">${lang === 'np' ? 'विशिष्ट तापधारण क्षमताहरू' : 'Specific Heat Values (c)'}</h4>
            <table class="minimal-table">
              <thead><tr><th>Substance</th><th>c (J/kg·°C)</th></tr></thead>
              <tbody>
                <tr><td>Water (पानी)</td><td><strong>4,200</strong> (Highest common liquid)</td></tr>
                <tr><td>Ice (हिउँ)</td><td>2,100</td></tr>
                <tr><td>Iron (फलाम)</td><td>460</td></tr>
                <tr><td>Copper (तामा)</td><td>385</td></tr>
                <tr><td>Mercury (पारो)</td><td>140 (Fast heat response)</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;

  // Subtab switching
  const tabs = container.querySelectorAll('.subtab-btn');
  tabs.forEach(t => {
    t.addEventListener('click', () => {
      tabs.forEach(tab => tab.classList.remove('active'));
      container.querySelectorAll('.subtab-content').forEach(c => c.classList.remove('active'));
      t.classList.add('active');
      const target = container.querySelector(`#heat-subtab-${t.dataset.sub}`);
      if (target) target.classList.add('active');
    });
  });

  // Anomalous expansion slider
  const slider = container.querySelector('#water-temp-slider');
  const tempVal = container.querySelector('#water-temp-val');
  const marker = container.querySelector('#temp-marker');
  const markerText = container.querySelector('#marker-temp-text');

  slider.addEventListener('input', () => {
    const t = parseFloat(slider.value);
    tempVal.textContent = `${t} °C`;
    
    // X position in SVG
    const cx = 60 + (t / 15) * 360;
    // Y position based on quadratic curve peak at 4
    const diff = t - 4;
    const cy = 50 + diff * diff * 3.5;
    marker.setAttribute('cx', cx);
    marker.setAttribute('cy', cy);

    let density = 1000 - diff * diff * 0.45;
    if (t === 4) {
      markerText.textContent = `4°C: Maximum Density (1000.0 kg/m³) & Minimum Volume`;
      markerText.setAttribute('fill', '#10b981');
    } else {
      markerText.textContent = `${t}°C: Density ≈ ${density.toFixed(1)} kg/m³`;
      markerText.setAttribute('fill', '#0284c7');
    }
  });

  // Calorimetry calculator
  const mInput = container.querySelector('#cal-mass');
  const t1Input = container.querySelector('#cal-t1');
  const t2Input = container.querySelector('#cal-t2');
  const qResult = container.querySelector('#cal-q-result');
  const stepsResult = container.querySelector('#cal-formula-steps');

  const updateCal = () => {
    const m = parseFloat(mInput.value) || 1;
    const t1 = parseFloat(t1Input.value) || 0;
    const t2 = parseFloat(t2Input.value) || 0;
    const c = 4200;
    const dTheta = Math.abs(t2 - t1);
    const Q = m * c * dTheta;
    qResult.textContent = `${(Q / 1000).toFixed(1)} kJ (${Q.toLocaleString()} J)`;
    stepsResult.textContent = `Q = ${m} kg × 4200 J/kg·°C × |${t2} - ${t1}| = ${Q.toLocaleString()} J`;
  };

  mInput.addEventListener('input', updateCal);
  t1Input.addEventListener('input', updateCal);
  t2Input.addEventListener('input', updateCal);
  updateCal();
}
