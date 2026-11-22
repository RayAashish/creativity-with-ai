// Interactive Virtual Chemistry Lab: Gas Preparation & Tests
// Laboratory preparation of CO₂ and NH₃ with apparatus, chemical equations, and tests

export function renderGasPrepSim(container, lang = 'en') {
  let currentGas = 'co2';
  let isReacting = false;

  container.innerHTML = `
    <div class="sim-card">
      <div class="sim-header">
        <div class="sim-badge">CHEMISTRY LAB // रसायन विज्ञान</div>
        <h2 class="sim-title">${lang === 'np' ? 'केही ग्यासहरूको प्रयोगशाला तयारी र परीक्षण' : 'Virtual Chemical Laboratory: Gas Preparation'}</h2>
        <p class="sim-desc">
          ${lang === 'np'
            ? 'कार्बन डाइअक्साइड (CO₂) र एमोनिया (NH₃) ग्यासको प्रयोगशाला उपकरण जडान, रासायनिक प्रतिक्रिया र परीक्षणहरू।'
            : 'Assemble real apparatus, mix reactants, trigger reactions, and test Carbon Dioxide (CO₂) and Ammonia (NH₃) gases with litmus, lime water, and acid fumes.'}
        </p>
      </div>

      <div class="lab-subtabs">
        <button class="subtab-btn active" data-gas="co2">${lang === 'np' ? '💨 कार्बन डाइअक्साइड (CO₂)' : '💨 Carbon Dioxide (CO₂)'}</button>
        <button class="subtab-btn" data-gas="nh3">${lang === 'np' ? '🧪 एमोनिया ग्यास (NH₃)' : '🧪 Ammonia Gas (NH₃)'}</button>
      </div>

      <div id="gas-lab-workbench">
        <!-- Rendered based on selected gas -->
      </div>
    </div>
  `;

  const bench = container.querySelector('#gas-lab-workbench');
  const tabs = container.querySelectorAll('.subtab-btn');

  const renderWorkbench = (gasType) => {
    currentGas = gasType;
    isReacting = false;

    if (gasType === 'co2') {
      bench.innerHTML = `
        <div class="minimal-grid">
          <div class="interactive-panel">
            <h3 class="panel-heading">${lang === 'np' ? 'CO₂ ग्यासको प्रयोगशाला उपकरण (Woulfe\'s Bottle)' : 'CO₂ Preparation Apparatus (Woulfe\'s Bottle)'}</h3>

            <div class="canvas-wrapper">
              <svg viewBox="0 0 500 300" class="sim-svg">
                <!-- Table bench -->
                <line x1="20" y1="270" x2="480" y2="270" stroke="#71717a" stroke-width="3" />

                <!-- Woulfe's Bottle -->
                <rect x="80" y="140" width="100" height="130" rx="12" fill="#fafafa" stroke="#18181b" stroke-width="2" />
                <path d="M 100 140 L 100 115 L 120 115 L 120 140" fill="#fafafa" stroke="#18181b" stroke-width="1.5" />
                <path d="M 140 140 L 140 115 L 160 115 L 160 140" fill="#fafafa" stroke="#18181b" stroke-width="1.5" />
                <text x="130" y="180" text-anchor="middle" font-size="11" fill="#71717a">Woulfe's Bottle</text>

                <!-- Marble chips (CaCO3) in bottle -->
                <g id="marble-chips">
                  <polygon points="95,255 105,240 118,252 110,265" fill="#a1a1aa" />
                  <polygon points="120,260 135,245 145,258 135,268" fill="#a1a1aa" />
                  <polygon points="148,252 160,242 168,260 155,266" fill="#a1a1aa" />
                  <text x="130" y="235" text-anchor="middle" font-size="9" fill="#52525b">CaCO₃ chips</text>
                </g>

                <!-- Thistle funnel inserted in left neck -->
                <line x1="110" y1="40" x2="110" y2="245" stroke="#18181b" stroke-width="2" />
                <polygon points="90,40 130,40 110,75" fill="#e4e4e7" stroke="#18181b" stroke-width="1.5" />
                <text x="110" y="32" text-anchor="middle" font-size="9" fill="#71717a">Thistle Funnel</text>

                <!-- Delivery tube from right neck to gas jar -->
                <path id="co2-delivery" d="M 150 120 L 150 90 L 320 90 L 320 230" fill="none" stroke="#18181b" stroke-width="2.5" />

                <!-- Gas Jar (Erect - Upward displacement of air) -->
                <rect x="290" y="120" width="60" height="150" fill="#ffffff" stroke="#18181b" stroke-width="2" rx="4" />
                <text x="320" y="150" text-anchor="middle" font-size="10" fill="#71717a">Gas Jar</text>
                <text x="320" y="260" text-anchor="middle" font-size="9" fill="#18181b">Erect (अपवर्ड)</text>

                <!-- Animated bubbles when reacting -->
                <g id="co2-bubbles" opacity="0">
                  <circle cx="115" cy="220" r="3" fill="#38bdf8" /><circle cx="140" cy="210" r="4" fill="#38bdf8" />
                  <circle cx="125" cy="195" r="3" fill="#38bdf8" /><circle cx="145" cy="180" r="3" fill="#38bdf8" />
                  <!-- Gas rising in jar -->
                  <rect id="co2-gas-level" x="292" y="210" width="56" height="58" fill="#e0f2fe" opacity="0.7" />
                </g>
              </svg>
            </div>

            <div class="action-bar">
              <button id="btn-add-acid" class="btn-minimal">💧 ${lang === 'np' ? 'थिसल फनेलबाट HCl खन्याउनुहोस्' : 'Pour Dilute HCl Acid'}</button>
              <button id="btn-test-litmus" class="btn-minimal secondary">🔵 ${lang === 'np' ? 'नीलो लिटमस परीक्षण' : 'Test Blue Litmus'}</button>
              <button id="btn-test-limewater" class="btn-minimal secondary">🥛 ${lang === 'np' ? 'चुनपानी परीक्षण' : 'Pass in Lime Water'}</button>
            </div>

            <div id="co2-reaction-result" class="telemetry-bar" style="margin-top: 1rem;">
              <span class="telemetry-label">Status:</span>
              <span id="co2-status" class="telemetry-value">Ready to pour dilute HCl</span>
            </div>
          </div>

          <div class="details-panel">
            <h4 class="details-heading">${lang === 'np' ? 'रासायनिक समीकरण र सिद्धान्त' : 'Chemical Equation & Theory'}</h4>
            <div class="formula-box">
              <div class="formula-math">\\text{CaCO}_3 + 2\\text{HCl} \\to \\text{CaCl}_2 + \\text{H}_2\\text{O} + \\text{CO}_2\\uparrow</div>
            </div>
            <ul class="clean-list">
              <li><strong>${lang === 'np' ? 'सङ्कलन विधि:' : 'Collection Method:'}</strong> ${lang === 'np' ? 'हावाको माथितिर विस्थापन (Upward displacement of air) किनभने यो हावाभन्दा १.५ गुणा गह्रौँ हुन्छ।' : 'Upward displacement of air (heavier than air, vapor density 22 vs air 14.4).'}</li>
              <li><strong>${lang === 'np' ? 'पानीमा किन सङ्कलन गरिँदैन?' : 'Why not over water?'}</strong> ${lang === 'np' ? 'किनभने CO₂ पानीमा मध्यम रूपमा घुलनशील हुन्छ र कार्बोनिक अम्ल (H₂CO₃) बनाउँछ।' : 'Because it is fairly soluble in water to form carbonic acid.'}</li>
              <li><strong>${lang === 'np' ? 'चुनपानी परीक्षण:' : 'Lime Water Test:'}</strong> $\\text{Ca(OH)}_2 + \\text{CO}_2 \\to \\text{CaCO}_3\\downarrow + \\text{H}_2\\text{O}$ (${lang === 'np' ? 'दूधजस्तै सेतो बन्दछ' : 'Turns milky white due to insoluble calcium carbonate'}).</li>
            </ul>
          </div>
        </div>
      `;

      // CO2 Interactive triggers
      const btnAddAcid = bench.querySelector('#btn-add-acid');
      const btnLitmus = bench.querySelector('#btn-test-litmus');
      const btnLime = bench.querySelector('#btn-test-limewater');
      const bubbles = bench.querySelector('#co2-bubbles');
      const status = bench.querySelector('#co2-status');

      btnAddAcid.addEventListener('click', () => {
        isReacting = true;
        bubbles.setAttribute('opacity', '1');
        status.textContent = 'Brisk effervescence! CO₂ gas is evolving and filling the jar.';
        status.style.color = '#0284c7';
      });

      btnLitmus.addEventListener('click', () => {
        if (!isReacting) {
          alert('First pour dilute HCl to generate CO₂ gas!');
          return;
        }
        status.textContent = '✔ Moist blue litmus turns FAINT RED (proving CO₂ is a weakly acidic oxide).';
        status.style.color = '#ef4444';
      });

      btnLime.addEventListener('click', () => {
        if (!isReacting) {
          alert('First pour dilute HCl to generate CO₂ gas!');
          return;
        }
        status.textContent = '✔ Clear Lime Water Ca(OH)₂ turns MILKY WHITE due to CaCO₃ precipitate!';
        status.style.color = '#10b981';
      });

    } else {
      // NH3 WORKBENCH
      bench.innerHTML = `
        <div class="minimal-grid">
          <div class="interactive-panel">
            <h3 class="panel-heading">${lang === 'np' ? 'NH₃ ग्यासको प्रयोगशाला उपकरण (तलतिर ढल्किएको टेस्टट्युब)' : 'Ammonia (NH₃) Apparatus (Tilted Hard Glass Tube)'}</h3>

            <div class="canvas-wrapper">
              <svg viewBox="0 0 500 300" class="sim-svg">
                <line x1="20" y1="270" x2="480" y2="270" stroke="#71717a" stroke-width="3" />

                <!-- Burner -->
                <rect x="90" y="220" width="30" height="50" fill="#71717a" />
                <path id="burner-flame" d="M 105 220 Q 95 190 105 175 Q 115 190 105 220" fill="#f59e0b" opacity="0" />

                <!-- Tilted Hard Glass Test Tube (Mouth downwards!) -->
                <g transform="rotate(18, 110, 150)">
                  <rect x="70" y="130" width="110" height="30" rx="15" fill="#fafafa" stroke="#18181b" stroke-width="2" />
                  <!-- Reactants NH4Cl + Ca(OH)2 mixture -->
                  <ellipse cx="88" cy="145" rx="14" ry="10" fill="#e4e4e7" stroke="#a1a1aa" />
                  <text x="88" y="148" text-anchor="middle" font-size="8" fill="#3f3f46">2:1 Mix</text>
                </g>
                <text x="140" y="120" font-size="10" fill="#ef4444" font-weight="600">⚠ Tilted Downwards!</text>

                <!-- Lime Tower (Drying agent CaO) -->
                <rect x="230" y="130" width="40" height="120" fill="#ffffff" stroke="#18181b" stroke-width="2" rx="4" />
                <text x="250" y="170" text-anchor="middle" font-size="9" fill="#71717a">CaO</text>
                <text x="250" y="185" text-anchor="middle" font-size="8" fill="#a1a1aa">Tower</text>

                <!-- Inverted Gas Jar (Downward displacement of air) -->
                <rect x="340" y="60" width="60" height="140" fill="#fafafa" stroke="#18181b" stroke-width="2" rx="4" />
                <text x="370" y="100" text-anchor="middle" font-size="10" fill="#71717a">Gas Jar</text>
                <text x="370" y="120" text-anchor="middle" font-size="9" fill="#18181b">Inverted (उल्टो)</text>

                <!-- Connection Tubes -->
                <path d="M 180 180 L 230 180" stroke="#18181b" stroke-width="2" fill="none" />
                <path d="M 270 150 L 370 150 L 370 70" stroke="#18181b" stroke-width="2" fill="none" />

                <!-- Gas vapor in jar -->
                <g id="nh3-gas" opacity="0">
                  <rect x="342" y="62" width="56" height="50" fill="#fef08a" opacity="0.4" />
                </g>
              </svg>
            </div>

            <div class="action-bar">
              <button id="btn-heat-tube" class="btn-minimal">🔥 ${lang === 'np' ? 'बर्नर बालेर तताउनुहोस्' : 'Heat Mixture with Burner'}</button>
              <button id="btn-test-nh3-litmus" class="btn-minimal secondary">🔴 ${lang === 'np' ? 'रातो लिटमस परीक्षण' : 'Test Red Litmus'}</button>
              <button id="btn-test-hcl-rod" class="btn-minimal secondary">☁️ ${lang === 'np' ? 'conc. HCl रड परीक्षण' : 'Bring Glass Rod in conc. HCl'}</button>
            </div>

            <div class="telemetry-bar" style="margin-top: 1rem;">
              <span class="telemetry-label">Status:</span>
              <span id="nh3-status" class="telemetry-value">Ready to ignite burner</span>
            </div>
          </div>

          <div class="details-panel">
            <h4 class="details-heading">${lang === 'np' ? 'रासायनिक समीकरण र मुख्य कारणहरू' : 'Chemical Equation & SEE Facts'}</h4>
            <div class="formula-box">
              <div class="formula-math">2\\text{NH}_4\\text{Cl} + \\text{Ca(OH)}_2 \\xrightarrow{\\Delta} \\text{CaCl}_2 + 2\\text{H}_2\\text{O} + 2\\text{NH}_3\\uparrow</div>
            </div>
            <ul class="clean-list">
              <li><strong>${lang === 'np' ? 'टेस्टट्युब किन तलतिर ढल्काइन्छ?' : 'Why is test tube mouth tilted down?'}</strong> ${lang === 'np' ? 'प्रतिक्रियामा बन्ने पानीको बाफ चिसो भएर तातो टेस्टट्युबको फेदमा फर्किएर फुट्न नदिन।' : 'To prevent condensed water from running back into the red-hot tube base and cracking the glass.'}</li>
              <li><strong>${lang === 'np' ? 'लाइम टावर (CaO) को काम:' : 'Role of Lime Tower (CaO):'}</strong> ${lang === 'np' ? 'अमोनिया ग्यासलाई सुक्खा बनाउन (Drying agent)। H₂SO₄ प्रयोग गर्न मिल्दैन किनभने अमोनियासँग प्रतिक्रिया गर्दछ।' : 'Absorbs moisture. Acidic drying agents like conc. H₂SO₄ cannot be used because basic NH₃ reacts with them.'}</li>
              <li><strong>${lang === 'np' ? 'सङ्कलन विधि:' : 'Collection Method:'}</strong> ${lang === 'np' ? 'हावाको तलतिर विस्थापन (Downward displacement of air) किनभने यो हावाभन्दा हलुका हुन्छ।' : 'Downward displacement of air (lighter than air, vapor density 8.5 vs air 14.4).'}</li>
            </ul>
          </div>
        </div>
      `;

      const btnHeat = bench.querySelector('#btn-heat-tube');
      const btnRedLitmus = bench.querySelector('#btn-test-nh3-litmus');
      const btnHclRod = bench.querySelector('#btn-test-hcl-rod');
      const flame = bench.querySelector('#burner-flame');
      const gas = bench.querySelector('#nh3-gas');
      const status = bench.querySelector('#nh3-status');

      btnHeat.addEventListener('click', () => {
        isReacting = true;
        flame.setAttribute('opacity', '1');
        gas.setAttribute('opacity', '1');
        status.textContent = 'Heating! Ammonia gas produced, dried by CaO tower, collecting in inverted jar.';
        status.style.color = '#f59e0b';
      });

      btnRedLitmus.addEventListener('click', () => {
        if (!isReacting) {
          alert('Heat the mixture first!');
          return;
        }
        status.textContent = '✔ Moist RED litmus turns DEEP BLUE (proving NH₃ is a basic/alkaline gas).';
        status.style.color = '#0284c7';
      });

      btnHclRod.addEventListener('click', () => {
        if (!isReacting) {
          alert('Heat the mixture first!');
          return;
        }
        status.textContent = '✔ DENSE WHITE FUMES of Ammonium Chloride (NH₄Cl) formed! (NH₃ + HCl → NH₄Cl).';
        status.style.color = '#10b981';
      });
    }
  };

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderWorkbench(tab.dataset.gas);
    });
  });

  renderWorkbench('co2');
}
