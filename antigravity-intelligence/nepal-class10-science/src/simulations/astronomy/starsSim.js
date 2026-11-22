// Interactive Stellar Evolution & Himalayan Glaciers Lab

export function renderStarsSim(container, lang = 'en') {
  container.innerHTML = `
    <div class="sim-card">
      <div class="sim-header">
        <div class="sim-badge">ASTRONOMY & GEOLOGY // खगोल तथा भू-विज्ञान</div>
        <h2 class="sim-title">${lang === 'np' ? 'ताराहरूको जीवन चक्र र हिमालयन हिमताल' : 'Stellar Evolution & Himalayan Glaciers Lab'}</h2>
        <p class="sim-desc">
          ${lang === 'np'
            ? 'सूर्य र विशाल ताराहरूको जीवन चक्र (Supernova, Black hole), चन्द्रशेखर सीमा (१.४४ M☉) र नेपालका इम्जा तथा छो-रोल्पा हिमतालको जलवायु अध्ययन।'
            : 'Explore stellar lifecycles across mass boundaries (Chandrasekhar limit 1.44 M☉), and model Himalayan glacier retreat and GLOF flood risks in Nepal.'}
        </p>
      </div>

      <div class="lab-subtabs">
        <button class="subtab-btn active" data-sub="stars">${lang === 'np' ? '✨ ताराहरूको जीवन चक्र' : '✨ Stellar Evolution'}</button>
        <button class="subtab-btn" data-sub="glaciers">${lang === 'np' ? '🏔️ हिमालयन हिमताल र बाढी (GLOF)' : '🏔️ Himalayan Glaciers & GLOF'}</button>
      </div>

      <!-- 1. STELLAR EVOLUTION -->
      <div id="astro-sub-stars" class="subtab-content active">
        <div class="minimal-grid">
          <div class="interactive-panel">
            <h3 class="panel-heading">${lang === 'np' ? 'पिण्ड अनुसार ताराको अन्तिम अवस्था' : 'Fate of a Star based on Initial Mass'}</h3>

            <div class="control-row">
              <label class="control-label">
                <span>Initial Stellar Mass (in Solar Masses $M_\\odot$):</span>
                <span id="star-mass-val" class="value-pill">1.0 M☉ (Sun-like)</span>
              </label>
              <input type="range" id="star-mass-slider" min="0.5" max="30" step="0.5" value="1.0" class="minimal-slider" />
            </div>

            <div class="canvas-wrapper" style="margin-top: 1rem;">
              <svg id="star-life-svg" viewBox="0 0 520 200" class="sim-svg">
                <!-- Lifecycle sequence diagram -->
                <!-- Stage 1: Nebula -->
                <circle cx="60" cy="100" r="28" fill="#e4e4e7" stroke="#71717a" stroke-width="1.5" />
                <text x="60" y="105" text-anchor="middle" font-size="9" fill="#18181b">Stellar Nebula</text>
                <path d="M 90 100 L 130 100" stroke="#71717a" stroke-width="1.5" />

                <!-- Stage 2: Main Sequence -->
                <circle id="star-main-seq" cx="160" cy="100" r="20" fill="#f59e0b" />
                <text x="160" y="104" text-anchor="middle" font-size="8" fill="#ffffff" font-weight="bold">Main Seq.</text>
                <path d="M 185 100 L 235 100" stroke="#71717a" stroke-width="1.5" />

                <!-- Stage 3: Giant Phase -->
                <circle id="star-giant" cx="280" cy="100" r="38" fill="#ef4444" opacity="0.8" />
                <text id="star-giant-text" x="280" y="104" text-anchor="middle" font-size="9" fill="#ffffff" font-weight="bold">Red Giant</text>
                <path d="M 322 100 L 372 100" stroke="#71717a" stroke-width="1.5" />

                <!-- Stage 4: Final Corpse -->
                <circle id="star-corpse" cx="420" cy="100" r="12" fill="#38bdf8" stroke="#0284c7" stroke-width="2" />
                <text id="star-corpse-text" x="420" y="130" text-anchor="middle" font-size="10" fill="#0284c7" font-weight="bold">White Dwarf</text>
              </svg>
            </div>

            <div class="telemetry-bar" style="margin-top: 1rem;">
              <span class="telemetry-label">Stellar Destiny:</span>
              <span id="star-destiny-text" class="telemetry-value">Sun-like Star → Red Giant → Planetary Nebula → White Dwarf</span>
            </div>
          </div>

          <div class="details-panel">
            <h4 class="details-heading">${lang === 'np' ? 'चन्द्रशेखर सीमा (Chandrasekhar Limit)' : 'The Chandrasekhar Limit'}</h4>
            <div class="formula-box">
              <div class="formula-math">M_{\\text{core}} \\le 1.44 \\, M_\\odot \\implies \\text{White Dwarf}</div>
            </div>
            <p class="text-muted">
              ${lang === 'np' 
                ? 'यदि ताराको अवशेषको पिण्ड १.४४ सौर्य पिण्डभन्दा बढी छ भने यो White Dwarf मा अडिन सक्दैन र Supernova विस्फोट भई Neutron Star वा Black Hole बन्दछ।' 
                : 'If a stellar core exceeds 1.44 solar masses, electron degeneracy pressure fails, collapsing the core into a Neutron Star or Black Hole.'}
            </p>
          </div>
        </div>
      </div>

      <!-- 2. HIMALAYAN GLACIERS & GLOF -->
      <div id="astro-sub-glaciers" class="subtab-content">
        <div class="minimal-grid">
          <div class="interactive-panel">
            <h3 class="panel-heading">${lang === 'np' ? 'तापक्रम वृद्धि र हिमताल विस्फोट (GLOF) जोखिम' : 'Temperature Rise & Glacial Lake Outburst Risk'}</h3>

            <div class="control-row">
              <label class="control-label">
                <span>Temperature Anomaly (तापक्रम वृद्धि):</span>
                <span id="temp-anom-val" class="value-pill">+1.5 °C</span>
              </label>
              <input type="range" id="temp-anom-slider" min="0" max="4" step="0.5" value="1.5" class="minimal-slider" />
            </div>

            <div class="canvas-wrapper" style="margin-top: 1rem;">
              <svg viewBox="0 0 520 220" class="sim-svg">
                <!-- Mountain profile -->
                <polygon points="20,200 140,40 240,110 340,30 500,200" fill="#f4f4f5" stroke="#71717a" stroke-width="2" />
                
                <!-- Glacier ice sheet -->
                <polygon id="glacier-poly" points="100,85 140,40 180,75 220,105 130,120" fill="#bae6fd" stroke="#0284c7" stroke-width="1.5" />
                <text x="140" y="65" text-anchor="middle" font-size="9" fill="#0369a1" font-weight="bold">Glacier Ice</text>

                <!-- Glacial Lake (e.g. Imja / Tsho Rolpa) behind loose moraine dam -->
                <rect id="glacier-lake" x="220" y="110" width="110" height="35" rx="4" fill="#38bdf8" opacity="0.8" />
                <polygon points="325,100 340,145 320,145" fill="#a1a1aa" />
                <text x="335" y="160" text-anchor="middle" font-size="9" fill="#52525b">Moraine Dam</text>
                <text x="275" y="130" text-anchor="middle" font-size="10" fill="#ffffff" font-weight="bold">Glacial Lake</text>

                <!-- Downstream river (Dudh Koshi / Tama Koshi) -->
                <path d="M 335 145 Q 400 170 500 190" fill="none" stroke="#0284c7" stroke-width="4" />
                <text x="440" y="180" font-size="9" fill="#0369a1">Downstream Valley</text>
              </svg>
            </div>

            <div class="telemetry-bar" style="margin-top: 1rem;">
              <span class="telemetry-label">GLOF Risk Alert:</span>
              <span id="glof-risk-text" class="telemetry-value" style="color: #f59e0b;">MODERATE RISK (Imja Lake depth expanding)</span>
            </div>
          </div>

          <div class="details-panel">
            <h4 class="details-heading">${lang === 'np' ? 'नेपालमा जोखिमयुक्त हिमतालहरू' : 'Critical Glacial Lakes in Nepal'}</h4>
            <ul class="clean-list">
              <li><strong>Tsho Rolpa (छो रोल्पा):</strong> Located in Dolakha district, holds over 80 million cubic meters of meltwater.</li>
              <li><strong>Imja Tsho (इम्जा ताल):</strong> Located in Everest Khumbu region; one of the fastest expanding glacial lakes in the world.</li>
              <li><strong>Mitigation:</strong> Controlled siphon drainage channels and early warning siren networks established by Department of Hydrology & Meteorology Nepal.</li>
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
      const target = container.querySelector(`#astro-sub-${t.dataset.sub}`);
      if (target) target.classList.add('active');
    });
  });

  // Stellar evolution slider
  const massSlider = container.querySelector('#star-mass-slider');
  const massVal = container.querySelector('#star-mass-val');
  const giantCircle = container.querySelector('#star-giant');
  const giantText = container.querySelector('#star-giant-text');
  const corpseCircle = container.querySelector('#star-corpse');
  const corpseText = container.querySelector('#star-corpse-text');
  const destinyText = container.querySelector('#star-destiny-text');

  massSlider.addEventListener('input', () => {
    const m = parseFloat(massSlider.value);
    massVal.textContent = `${m.toFixed(1)} M☉`;

    if (m < 8) {
      // Sun-like
      giantCircle.setAttribute('fill', '#ef4444');
      giantCircle.setAttribute('r', '38');
      giantText.textContent = 'Red Giant';
      corpseCircle.setAttribute('fill', '#38bdf8');
      corpseCircle.setAttribute('r', '12');
      corpseText.textContent = 'White Dwarf';
      corpseText.setAttribute('fill', '#0284c7');
      destinyText.textContent = 'Sun-like Star (M < 8 M☉) → Red Giant → Planetary Nebula → White Dwarf';
    } else if (m < 20) {
      // Supernova to Neutron star
      giantCircle.setAttribute('fill', '#dc2626');
      giantCircle.setAttribute('r', '48');
      giantText.textContent = 'Supergiant';
      corpseCircle.setAttribute('fill', '#818cf8');
      corpseCircle.setAttribute('r', '9');
      corpseText.textContent = 'Neutron Star';
      corpseText.setAttribute('fill', '#4f46e5');
      destinyText.textContent = 'Massive Star (8-20 M☉) → Red Supergiant → Supernova Explosion → Pulsar / Neutron Star';
    } else {
      // Black hole
      giantCircle.setAttribute('fill', '#991b1b');
      giantCircle.setAttribute('r', '52');
      giantText.textContent = 'Supergiant';
      corpseCircle.setAttribute('fill', '#09090b');
      corpseCircle.setAttribute('r', '15');
      corpseText.textContent = 'Black Hole (अन्तरिक्ष सिङ्गुलेरिटी)';
      corpseText.setAttribute('fill', '#09090b');
      destinyText.textContent = 'Supermassive Star (M > 20 M☉) → Hypernova → Infinite gravitational collapse into BLACK HOLE!';
    }
  });

  // Glacier slider
  const tempSlider = container.querySelector('#temp-anom-slider');
  const tempVal = container.querySelector('#temp-anom-val');
  const lake = container.querySelector('#glacier-lake');
  const riskText = container.querySelector('#glof-risk-text');

  tempSlider.addEventListener('input', () => {
    const dt = parseFloat(tempSlider.value);
    tempVal.textContent = `+${dt.toFixed(1)} °C`;

    lake.setAttribute('height', 35 + dt * 10);
    lake.setAttribute('y', 110 - dt * 5);

    if (dt <= 1.0) {
      riskText.textContent = 'LOW RISK: Glacial melt balanced by seasonal winter snowfall.';
      riskText.style.color = '#10b981';
    } else if (dt <= 2.5) {
      riskText.textContent = 'MODERATE RISK: Rapid snout retreat; Imja & Tsho Rolpa lake volumes expanding.';
      riskText.style.color = '#f59e0b';
    } else {
      riskText.textContent = 'CRITICAL GLOF WARNING: Moraine breach imminent! Extreme flood risk in Dudh Koshi valley!';
      riskText.style.color = '#ef4444';
    }
  });
}
