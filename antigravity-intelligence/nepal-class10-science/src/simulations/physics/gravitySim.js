// Interactive Gravitation & Universal Constant Lab
// Total Practicality: Cavendish Torsion Balance, Inverse-Square Vectors, Planetary Weights & Guinea-Feather Vacuum Drop

export function renderGravitySim(container, lang = 'en') {
  container.innerHTML = `
    <div class="sim-card">
      <div class="sim-header">
        <div class="sim-badge">PHYSICS LAB // भौतिक विज्ञान</div>
        <h2 class="sim-title">${lang === 'np' ? 'विश्वव्यापी गुरुत्वाकर्षण र स्थिर अङ्क (G) प्रयोगशाला' : 'Universal Gravitation & Constant (G) Practical Lab'}</h2>
        <p class="sim-desc">
          ${lang === 'np' 
            ? 'न्युटनको नियम, क्याभेन्डिसको टर्सन ब्यालेन्स, विभिन्न ग्रहहरूमा तौल र शून्यमा स्वतन्त्र खसाइको प्रत्यक्ष प्रयोगात्मक अनुभव लिनुहोस्।' 
            : 'Explore Newton\'s inverse-square law, Henry Cavendish\'s 1798 torsion balance, weight across the solar system, and free fall in vacuum.'}
        </p>
      </div>

      <!-- TAB CONTROLS FOR GRAVITY SUB-LABS -->
      <div class="lab-subtabs">
        <button class="subtab-btn active" data-subtab="cavendish">${lang === 'np' ? '⚖️ क्याभेन्डिसको टर्सन ब्यालेन्स' : '⚖️ Cavendish Torsion Balance'}</button>
        <button class="subtab-btn" data-subtab="vectors">${lang === 'np' ? '🪐 न्युटनको गुरुत्वाकर्षण बल' : '🪐 Newton\'s Gravity Law'}</button>
        <button class="subtab-btn" data-subtab="planets">${lang === 'np' ? '🌌 विभिन्न ग्रहहरूमा तौल' : '🌌 Weight on Planets'}</button>
        <button class="subtab-btn" data-subtab="vacuum">${lang === 'np' ? '🪶 सुनको सिक्का र प्वाँख (शून्य)' : '🪶 Coin & Feather Vacuum Drop'}</button>
      </div>

      <!-- 1. CAVENDISH TORSION BALANCE -->
      <div id="subtab-cavendish" class="subtab-content active">
        <div class="minimal-grid">
          <div class="interactive-panel">
            <h3 class="panel-heading">${lang === 'np' ? 'क्याभेन्डिसको टर्सन ब्यालेन्स उपकरण (१७९८)' : 'Cavendish Torsion Balance Apparatus (1798)'}</h3>
            <p class="text-muted">
              ${lang === 'np'
                ? 'हेनरी क्याभेन्डिसले मसिनो क्वार्ट्ज तारमा झुण्ड्याइएका साना सिसाका गोला (m) नजिक ठूला गह्रौँ सिसाका गोला (M) ल्याएर गुरुत्वाकर्षणको सूक्ष्म बल नापेका थिए। यसमार्फत G = ६.६७ × १०⁻¹¹ N·m²/kg² पत्ता लाग्यो।'
                : 'Henry Cavendish measured the tiny gravitational pull between two small lead spheres (m = 730g) and two large lead spheres (M = 158kg) using quartz wire torsion and reflected light.'}
            </p>

            <div class="canvas-wrapper">
              <svg id="cavendish-svg" viewBox="0 0 500 320" class="sim-svg">
                <!-- Torsion wire from ceiling -->
                <line x1="250" y1="20" x2="250" y2="120" stroke="#71717a" stroke-width="2" stroke-dasharray="3,3" />
                <rect x="235" y="10" width="30" height="10" fill="#27272a" rx="2" />
                <text x="250" y="8" text-anchor="middle" font-size="10" fill="#71717a">Rigid Ceiling</text>

                <!-- Mirror on wire -->
                <rect x="245" y="65" width="10" height="16" fill="#38bdf8" rx="2" />
                <text x="260" y="77" font-size="9" fill="#0284c7">Mirror</text>

                <!-- Incident and Reflected Laser -->
                <path d="M 80 60 L 245 73" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="4,2" />
                <text x="80" y="55" font-size="9" fill="#ef4444">Laser Source</text>
                
                <line id="laser-reflected" x1="255" y1="73" x2="420" y2="73" stroke="#ef4444" stroke-width="2" />
                <rect x="420" y="30" width="8" height="90" fill="#e4e4e7" stroke="#a1a1aa" />
                <text x="435" y="75" font-size="9" fill="#71717a" id="scale-deflection-text">Scale: 0.00 mm</text>

                <!-- Rotating Rod -->
                <g id="cavendish-rotor" transform="rotate(0, 250, 120)">
                  <line x1="160" y1="120" x2="340" y2="120" stroke="#18181b" stroke-width="4" stroke-linecap="round" />
                  <!-- Small sphere m1 -->
                  <circle cx="160" cy="120" r="14" fill="#52525b" />
                  <text x="160" y="124" text-anchor="middle" font-size="10" fill="#ffffff" font-weight="bold">m</text>
                  <!-- Small sphere m2 -->
                  <circle cx="340" cy="120" r="14" fill="#52525b" />
                  <text x="340" y="124" text-anchor="middle" font-size="10" fill="#ffffff" font-weight="bold">m</text>
                </g>

                <!-- Large sphere M1 -->
                <circle id="large-m1" cx="135" cy="170" r="28" fill="#18181b" />
                <text id="text-m1" x="135" y="175" text-anchor="middle" font-size="12" fill="#ffffff" font-weight="bold">M (158kg)</text>

                <!-- Large sphere M2 -->
                <circle id="large-m2" cx="365" cy="70" r="28" fill="#18181b" />
                <text id="text-m2" x="365" y="75" text-anchor="middle" font-size="12" fill="#ffffff" font-weight="bold">M (158kg)</text>

                <!-- Force Attraction Indicators -->
                <path d="M 150 135 L 142 152" stroke="#10b981" stroke-width="2" marker-end="url(#arrow)" />
                <path d="M 350 105 L 358 88" stroke="#10b981" stroke-width="2" />
                <text x="250" y="220" text-anchor="middle" font-size="11" fill="#10b981" font-weight="600">Gravitational Torque (τ = G·M·m·L / d²)</text>
              </svg>
            </div>

            <div class="control-row">
              <label class="control-label">
                <span>${lang === 'np' ? 'ठूला सिसाका गोलाको दूरी:' : 'Position of Large Lead Spheres (M):'}</span>
                <span id="cavendish-dist-val" class="value-pill">Close (समीप)</span>
              </label>
              <input type="range" id="cavendish-slider" min="1" max="100" value="85" class="minimal-slider" />
            </div>

            <div class="formula-box">
              <div class="formula-title">${lang === 'np' ? 'क्याभेन्डिसको नतिजा र सूत्र:' : 'Cavendish Formulation:'}</div>
              <div class="formula-math">G = \\frac{2 \\pi^2 \\cdot L \\cdot d^2 \\cdot \\theta}{T^2 \\cdot M} = 6.674 \\times 10^{-11} \\text{ N}\\cdot\\text{m}^2/\\text{kg}^2</div>
              <p class="formula-note">${lang === 'np' ? 'यो मान पत्ता लागेपछि वैज्ञानिकहरूले पृथ्वीको पिण्ड (M = ६ × १०²४ kg) पहिलोपटक नापे, त्यसैले यसलाई "पृथ्वी जोख्ने प्रयोग" पनि भनिन्छ।' : 'By determining G, Cavendish was able to accurately calculate Earth\'s mass (M ≈ 6 × 10²⁴ kg) for the first time in human history.'}</p>
            </div>
          </div>

          <div class="details-panel">
            <h4 class="details-heading">${lang === 'np' ? 'परीक्षामा सोधिने मुख्य बुँदाहरू' : 'High-Yield SEE Board Facts'}</h4>
            <ul class="clean-list">
              <li><strong>${lang === 'np' ? 'किन विश्वव्यापी भनिन्छ?' : 'Why is G called Universal?'}</strong> ${lang === 'np' ? 'किनभने यसको मान माध्यम, तापक्रम, चाप वा ब्रह्माण्डको कुनै पनि स्थानमा परिवर्तन हुँदैन।' : 'Because its value is completely independent of temperature, surrounding medium, nature of mass, or location in space.'}</li>
              <li><strong>${lang === 'np' ? 'मान र एकाइ:' : 'Value & SI Unit:'}</strong> $6.67 \\times 10^{-11}\\text{ N}\\cdot\\text{m}^2/\\text{kg}^2$ (${lang === 'np' ? 'अथवा' : 'or'} $\\text{m}^3/(\\text{kg}\\cdot\\text{s}^2)$).</li>
              <li><strong>${lang === 'np' ? 'G को परिभाषा:' : 'Definition of G:'}</strong> ${lang === 'np' ? '१ मिटरको दूरीमा राखिएका १/१ kg पिण्ड भएका दुई वस्तुहरू बीचको आकर्षण बल नै G हो।' : 'Gravitational force between two 1 kg unit masses placed 1 meter apart.'}</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- 2. INVERSE SQUARE VECTORS LAB -->
      <div id="subtab-vectors" class="subtab-content">
        <div class="interactive-panel">
          <div class="canvas-wrapper">
            <svg id="gravity-vector-svg" viewBox="0 0 600 240" class="sim-svg">
              <line x1="40" y1="120" x2="560" y2="120" stroke="#e4e4e7" stroke-width="1.5" stroke-dasharray="4,4" />
              
              <!-- Mass 1 -->
              <circle id="mass1-circle" cx="150" cy="120" r="30" fill="#18181b" />
              <text id="mass1-label" x="150" y="125" text-anchor="middle" font-size="12" fill="#ffffff" font-weight="bold">m₁</text>
              <line id="f1-arrow" x1="185" y1="120" x2="230" y2="120" stroke="#10b981" stroke-width="3" />
              <text id="f1-text" x="195" y="105" font-size="11" fill="#10b981" font-weight="600">F₁ →</text>

              <!-- Mass 2 -->
              <circle id="mass2-circle" cx="420" cy="120" r="24" fill="#3f3f46" />
              <text id="mass2-label" x="420" y="125" text-anchor="middle" font-size="12" fill="#ffffff" font-weight="bold">m₂</text>
              <line id="f2-arrow" x1="390" y1="120" x2="345" y2="120" stroke="#10b981" stroke-width="3" />
              <text id="f2-text" x="350" y="105" font-size="11" fill="#10b981" font-weight="600">← F₂</text>

              <!-- Distance indicator -->
              <line id="dist-line" x1="150" y1="190" x2="420" y2="190" stroke="#71717a" stroke-width="1.5" />
              <circle cx="150" cy="190" r="3" fill="#71717a" />
              <circle cx="420" cy="190" r="3" fill="#71717a" />
              <text id="dist-text-svg" x="285" y="180" text-anchor="middle" font-size="12" fill="#27272a" font-weight="600">d = 4.0 m</text>
            </svg>
          </div>

          <div class="control-grid-3">
            <div class="control-item">
              <label class="control-label">
                <span>Mass 1 ($m_1$):</span>
                <span id="m1-val" class="value-pill">50 × 10¹¹ kg</span>
              </label>
              <input type="range" id="m1-slider" min="10" max="100" value="50" class="minimal-slider" />
            </div>

            <div class="control-item">
              <label class="control-label">
                <span>Mass 2 ($m_2$):</span>
                <span id="m2-val" class="value-pill">20 × 10¹¹ kg</span>
              </label>
              <input type="range" id="m2-slider" min="10" max="100" value="20" class="minimal-slider" />
            </div>

            <div class="control-item">
              <label class="control-label">
                <span>Distance ($d$):</span>
                <span id="d-val" class="value-pill">4.0 m</span>
              </label>
              <input type="range" id="d-slider" min="20" max="100" value="40" class="minimal-slider" />
            </div>
          </div>

          <!-- Quick Action Buttons for Exam Proofs -->
          <div class="action-bar">
            <button id="btn-double-d" class="btn-minimal">⚡ ${lang === 'np' ? 'दूरी दोब्बर गर्नुहोस् (d × २)' : 'Double Distance (d × 2)'}</button>
            <button id="btn-double-m" class="btn-minimal">⚡ ${lang === 'np' ? 'पिण्ड १ दोब्बर गर्नुहोस् (m₁ × २)' : 'Double Mass 1 (m₁ × 2)'}</button>
            <button id="btn-reset-grav" class="btn-minimal secondary">↺ ${lang === 'np' ? 'सुरुवाती अवस्था' : 'Reset Values'}</button>
          </div>

          <div class="telemetry-bar">
            <div class="telemetry-item">
              <span class="telemetry-label">${lang === 'np' ? 'गणना गरिएको आकर्षण बल (F):' : 'Calculated Gravitational Force (F):'}</span>
              <span id="f-calculated-val" class="telemetry-value">4.17 × 10⁻⁸ N</span>
            </div>
            <div class="telemetry-item">
              <span class="telemetry-label">${lang === 'np' ? 'सम्बन्ध:' : 'Inverse-Square Relationship:'}</span>
              <span id="f-relationship-note" class="telemetry-note">F ∝ 1/d²</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. PLANETARY WEIGHT CALCULATOR -->
      <div id="subtab-planets" class="subtab-content">
        <div class="interactive-panel">
          <div class="input-inline-group">
            <label class="control-label">${lang === 'np' ? 'विद्यार्थीको पिण्ड (Mass in kg):' : 'Student Mass (kg):'}</label>
            <input type="number" id="student-mass-input" value="50" min="1" max="200" class="minimal-number-input" />
            <span class="unit-text">kg</span>
          </div>

          <div class="table-responsive">
            <table class="minimal-table">
              <thead>
                <tr>
                  <th>${lang === 'np' ? 'स्थान / खगोलीय पिण्ड' : 'Location / Celestial Body'}</th>
                  <th>${lang === 'np' ? 'गुरुत्वप्रवेग (g)' : 'Gravity (g)'}</th>
                  <th>${lang === 'np' ? 'तौल (W = m·g)' : 'Weight (W = m·g)'}</th>
                  <th>${lang === 'np' ? 'तुलना (पृथ्वीसँग)' : 'Comparison to Earth'}</th>
                </tr>
              </thead>
              <tbody id="planet-table-body">
                <!-- Dynamically populated -->
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- 4. GUINEA & FEATHER VACUUM DROP -->
      <div id="subtab-vacuum" class="subtab-content">
        <div class="minimal-grid">
          <div class="interactive-panel">
            <div class="canvas-wrapper">
              <svg id="vacuum-drop-svg" viewBox="0 0 400 300" class="sim-svg">
                <!-- Tube 1: Atmospheric Air -->
                <rect x="70" y="20" width="80" height="240" rx="40" fill="#f4f4f5" stroke="#71717a" stroke-width="2" />
                <text x="110" y="45" text-anchor="middle" font-size="11" fill="#71717a" font-weight="600">Normal Air Tube</text>
                <!-- Air molecules dots -->
                <g id="air-dots" opacity="0.6">
                  <circle cx="90" cy="80" r="2" fill="#a1a1aa" /><circle cx="125" cy="110" r="2" fill="#a1a1aa" />
                  <circle cx="100" cy="150" r="2" fill="#a1a1aa" /><circle cx="130" cy="180" r="2" fill="#a1a1aa" />
                  <circle cx="85" cy="210" r="2" fill="#a1a1aa" />
                </g>
                <!-- Objects in Air -->
                <circle id="coin-air" cx="95" cy="70" r="10" fill="#eab308" stroke="#ca8a04" stroke-width="1.5" />
                <text x="95" y="74" text-anchor="middle" font-size="9" fill="#713f12" font-weight="bold">Coin</text>
                
                <ellipse id="feather-air" cx="125" cy="70" rx="6" ry="14" fill="#a855f7" transform="rotate(20, 125, 70)" />
                <text x="125" y="74" text-anchor="middle" font-size="8" fill="#ffffff">🪶</text>

                <!-- Tube 2: Vacuum Tube -->
                <rect x="250" y="20" width="80" height="240" rx="40" fill="#fafafa" stroke="#18181b" stroke-width="2" />
                <text x="290" y="45" text-anchor="middle" font-size="11" fill="#18181b" font-weight="600">Vacuum Tube (शून्य)</text>
                
                <!-- Objects in Vacuum -->
                <circle id="coin-vac" cx="275" cy="70" r="10" fill="#eab308" stroke="#ca8a04" stroke-width="1.5" />
                <text x="275" y="74" text-anchor="middle" font-size="9" fill="#713f12" font-weight="bold">Coin</text>
                
                <ellipse id="feather-vac" cx="305" cy="70" rx="6" ry="14" fill="#a855f7" />
                <text x="305" y="74" text-anchor="middle" font-size="8" fill="#ffffff">🪶</text>

                <!-- Status indicator -->
                <text id="drop-status-text" x="200" y="285" text-anchor="middle" font-size="12" fill="#10b981" font-weight="600">Ready to drop</text>
              </svg>
            </div>

            <div class="action-bar">
              <button id="btn-start-drop" class="btn-minimal">▶ ${lang === 'np' ? 'खसाल्नुहोस् (Drop Both)' : 'Release Objects (Drop)'}</button>
              <button id="btn-reset-drop" class="btn-minimal secondary">↺ ${lang === 'np' ? 'उल्ट्याउनुहोस् (Reset Tube)' : 'Invert Tube (Reset)'}</button>
            </div>
          </div>

          <div class="details-panel">
            <h4 class="details-heading">${lang === 'np' ? 'प्रयोगात्मक निष्कर्ष' : 'Key Practical Takeaway'}</h4>
            <p class="text-muted">
              ${lang === 'np' 
                ? 'हावा भएको नलीमा हावाको अवरोधले गर्दा प्वाँख ढिलो खस्छ तर हावा निकालिएको शून्य नलीमा दुवै वस्तु एकैसाथ भुइँमा पुग्छन्। यसले गुरुत्वप्रवेग (g) वस्तुको पिण्डमा निर्भर गर्दैन भन्ने पुष्टि गर्दछ।' 
                : 'In air, drag slows down the feather. In vacuum, both coin and feather accelerate at exactly g = 9.8 m/s² and hit the bottom simultaneously. This proves acceleration due to gravity is independent of mass.'}
            </p>
            <div class="formula-box">
              <div class="formula-math">g = \\frac{GM}{R^2} \\quad (\\text{No } m \\text{ of the falling body!})</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // --- Attach Interactive Logic ---
  setupSubtabs(container);
  setupCavendish(container);
  setupVectors(container);
  setupPlanets(container, lang);
  setupVacuumDrop(container);
}

function setupSubtabs(container) {
  const btns = container.querySelectorAll('.subtab-btn');
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      container.querySelectorAll('.subtab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      const target = container.querySelector(`#subtab-${btn.dataset.subtab}`);
      if (target) target.classList.add('active');
    });
  });
}

function setupCavendish(container) {
  const slider = container.querySelector('#cavendish-slider');
  const rotor = container.querySelector('#cavendish-rotor');
  const laserReflected = container.querySelector('#laser-reflected');
  const scaleText = container.querySelector('#scale-deflection-text');
  const distVal = container.querySelector('#cavendish-dist-val');

  if (!slider) return;

  slider.addEventListener('input', () => {
    const val = parseFloat(slider.value);
    const deflectionDeg = (val / 100) * 8.5; // up to 8.5 degrees
    rotor.setAttribute('transform', `rotate(${deflectionDeg}, 250, 120)`);
    
    // Laser reflects at 2x angle (Law of reflection)
    const reflectedAngleRad = (deflectionDeg * 2 * Math.PI) / 180;
    const endY = 73 + Math.sin(reflectedAngleRad) * 165;
    laserReflected.setAttribute('y2', endY);

    const deflectionMm = (deflectionDeg * 1.8).toFixed(2);
    scaleText.textContent = `Scale: ${deflectionMm} mm`;
    distVal.textContent = val > 70 ? 'Very Close (अत्यन्तै समीप)' : val > 30 ? 'Medium (मध्यम)' : 'Far (टाढा)';
  });
}

function setupVectors(container) {
  const m1Slider = container.querySelector('#m1-slider');
  const m2Slider = container.querySelector('#m2-slider');
  const dSlider = container.querySelector('#d-slider');

  const m1Val = container.querySelector('#m1-val');
  const m2Val = container.querySelector('#m2-val');
  const dVal = container.querySelector('#d-val');

  const m1Circle = container.querySelector('#mass1-circle');
  const m2Circle = container.querySelector('#mass2-circle');
  const distTextSvg = container.querySelector('#dist-text-svg');
  const fCalcVal = container.querySelector('#f-calculated-val');

  const update = () => {
    const m1 = parseFloat(m1Slider.value);
    const m2 = parseFloat(m2Slider.value);
    const d = parseFloat(dSlider.value) / 10; // 2.0 to 10.0 meters

    m1Val.textContent = `${m1} × 10¹¹ kg`;
    m2Val.textContent = `${m2} × 10¹¹ kg`;
    dVal.textContent = `${d.toFixed(1)} m`;
    distTextSvg.textContent = `d = ${d.toFixed(1)} m`;

    m1Circle.setAttribute('r', 18 + m1 * 0.25);
    m2Circle.setAttribute('r', 16 + m2 * 0.2);

    const G = 6.674e-11;
    const massProduct = (m1 * 1e11) * (m2 * 1e11);
    const force = (G * massProduct) / (d * d);

    fCalcVal.textContent = `${force.toExponential(4)} N`;
  };

  m1Slider.addEventListener('input', update);
  m2Slider.addEventListener('input', update);
  dSlider.addEventListener('input', update);

  container.querySelector('#btn-double-d')?.addEventListener('click', () => {
    const cur = parseFloat(dSlider.value);
    dSlider.value = Math.min(100, cur * 2);
    update();
  });

  container.querySelector('#btn-double-m')?.addEventListener('click', () => {
    const cur = parseFloat(m1Slider.value);
    m1Slider.value = Math.min(100, cur * 2);
    update();
  });

  container.querySelector('#btn-reset-grav')?.addEventListener('click', () => {
    m1Slider.value = 50;
    m2Slider.value = 20;
    dSlider.value = 40;
    update();
  });

  update();
}

function setupPlanets(container, lang) {
  const massInput = container.querySelector('#student-mass-input');
  const tbody = container.querySelector('#planet-table-body');

  const planets = [
    { name: lang === 'np' ? 'पृथ्वी (Earth - Average)' : 'Earth (Sea Level)', g: 9.8, note: '1.0x (Standard)' },
    { name: lang === 'np' ? 'सगरमाथाको चुचुरो (Mt. Everest Summit)' : 'Mt. Everest Summit (8,849m)', g: 9.77, note: lang === 'np' ? 'उचाइका कारण कम' : '0.997x (Altitude effect)' },
    { name: lang === 'np' ? 'पृथ्वीको ध्रुव (Earth\'s Poles)' : 'Earth\'s Poles (R is min)', g: 9.83, note: '1.003x (Maximum on Earth)' },
    { name: lang === 'np' ? 'चन्द्रमा (Moon)' : 'Moon (चन्द्रमा)', g: 1.62, note: '1/6th of Earth' },
    { name: lang === 'np' ? 'बृहस्पति (Jupiter)' : 'Jupiter (बृहस्पति)', g: 24.79, note: '2.53x (Crushing gravity)' },
    { name: lang === 'np' ? 'मंगल ग्रह (Mars)' : 'Mars (मंगल)', g: 3.72, note: '0.38x of Earth' },
    { name: lang === 'np' ? 'सूर्यको सतह (Sun\'s Surface)' : 'Sun (सतह)', g: 274.0, note: '28x (Enormous mass)' },
    { name: lang === 'np' ? 'अन्तर्राष्ट्रिय अन्तरिक्ष स्टेशन (ISS Orbit 400km)' : 'ISS Orbit (400 km)', g: 8.7, note: lang === 'np' ? '८९% गुरुत्व तर स्वतन्त्र खसाइमा' : '89% of Earth (in free fall)' },
    { name: lang === 'np' ? 'गहिरो अन्तरिक्ष (Deep Space)' : 'Deep Space', g: 0.0, note: lang === 'np' ? 'पूर्ण तौलविहीनता' : 'True Weightlessness (0 N)' }
  ];

  const renderTable = () => {
    const m = parseFloat(massInput.value) || 50;
    tbody.innerHTML = planets.map(p => {
      const weight = (m * p.g).toFixed(1);
      return `
        <tr>
          <td><strong>${p.name}</strong></td>
          <td><code>${p.g.toFixed(2)} m/s²</code></td>
          <td><span class="value-highlight">${weight} N</span></td>
          <td class="text-muted">${p.note}</td>
        </tr>
      `;
    }).join('');
  };

  massInput.addEventListener('input', renderTable);
  renderTable();
}

function setupVacuumDrop(container) {
  const btnStart = container.querySelector('#btn-start-drop');
  const btnReset = container.querySelector('#btn-reset-drop');
  const coinAir = container.querySelector('#coin-air');
  const featherAir = container.querySelector('#feather-air');
  const coinVac = container.querySelector('#coin-vac');
  const featherVac = container.querySelector('#feather-vac');
  const statusText = container.querySelector('#drop-status-text');

  let animFrame = null;
  let startTime = null;

  const reset = () => {
    if (animFrame) cancelAnimationFrame(animFrame);
    coinAir.setAttribute('cy', 70);
    featherAir.setAttribute('cy', 70);
    coinVac.setAttribute('cy', 70);
    featherVac.setAttribute('cy', 70);
    statusText.textContent = 'Ready to drop';
    statusText.setAttribute('fill', '#10b981');
  };

  btnReset.addEventListener('click', reset);

  btnStart.addEventListener('click', () => {
    reset();
    startTime = performance.now();
    statusText.textContent = 'Falling under gravity...';
    statusText.setAttribute('fill', '#0284c7');

    const durationVac = 1200; // ms to hit bottom
    const durationAirFeather = 3200; // feather takes much longer in air

    const loop = (now) => {
      const elapsed = now - startTime;

      // Free fall in vacuum (accelerating quadratically: y = y0 + 0.5*g*t^2)
      const progVac = Math.min(1, Math.pow(elapsed / durationVac, 2));
      const yVac = 70 + progVac * 165;
      coinVac.setAttribute('cy', yVac);
      featherVac.setAttribute('cy', yVac);

      // In air: coin falls almost as fast, feather flutters with air drag
      const progCoinAir = Math.min(1, Math.pow(elapsed / (durationVac * 1.08), 2));
      const yCoinAir = 70 + progCoinAir * 165;
      coinAir.setAttribute('cy', yCoinAir);

      const progFeatherAir = Math.min(1, elapsed / durationAirFeather);
      const yFeatherAir = 70 + progFeatherAir * 165;
      featherAir.setAttribute('cy', yFeatherAir);

      if (elapsed < durationAirFeather) {
        animFrame = requestAnimationFrame(loop);
      } else {
        statusText.textContent = 'Done! In vacuum both arrived together.';
        statusText.setAttribute('fill', '#10b981');
      }
    };

    animFrame = requestAnimationFrame(loop);
  });
}
