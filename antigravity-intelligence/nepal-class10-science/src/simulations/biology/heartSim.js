// Interactive Human Heart & Double Circulation Simulator (मानव मुटु र रक्तसञ्चार)

export function renderHeartSim(container, lang = 'en') {
  container.innerHTML = `
    <div class="sim-card">
      <div class="sim-header">
        <div class="sim-badge">BIOLOGY LAB // जीव विज्ञान</div>
        <h2 class="sim-title">${lang === 'np' ? 'मानव मुटुको संरचना र दोहोरो रक्तसञ्चार' : 'Human Heart Anatomy & Double Circulation'}</h2>
        <p class="sim-desc">
          ${lang === 'np'
            ? 'मुटुका चार कोठाहरू, भल्भहरू (Tricuspid, Bicuspid), फुक्सो र शरीरबीचको दोहोरो रक्तसञ्चार तथा रक्तचाप (१२०/८० mmHg)।'
            : 'Explore the 4-chambered heart, valves, oxygenated (red) vs deoxygenated (blue) blood paths, and systolic/diastolic blood pressure.'}
        </p>
      </div>

      <div class="minimal-grid">
        <div class="interactive-panel">
          <div class="canvas-wrapper">
            <svg id="heart-svg" viewBox="0 0 520 280" class="sim-svg">
              <!-- Double circulation loop paths -->
              <!-- Lungs at top -->
              <rect x="210" y="10" width="100" height="30" rx="15" fill="#fecdd3" stroke="#f43f5e" stroke-width="2" />
              <text x="260" y="30" text-anchor="middle" font-size="11" fill="#be123c" font-weight="bold">🫁 Lungs (फुक्सो)</text>

              <!-- Body tissues at bottom -->
              <rect x="190" y="240" width="140" height="30" rx="15" fill="#e0f2fe" stroke="#0284c7" stroke-width="2" />
              <text x="260" y="260" text-anchor="middle" font-size="11" fill="#0369a1" font-weight="bold">Body Tissues (शरीरका अङ्गहरू)</text>

              <!-- Central 4-chambered heart box -->
              <rect x="170" y="65" width="180" height="150" rx="16" fill="#fafafa" stroke="#18181b" stroke-width="3" />
              
              <!-- Septum divider (Muscular wall) -->
              <line x1="260" y1="65" x2="260" y2="215" stroke="#18181b" stroke-width="4" />
              <!-- Horizontal divider -->
              <line x1="170" y1="135" x2="350" y2="135" stroke="#71717a" stroke-width="2" stroke-dasharray="4,4" />

              <!-- Right Atrium (Blue - Deoxygenated) -->
              <rect x="172" y="67" width="86" height="66" fill="#e0f2fe" opacity="0.6" rx="14" />
              <text x="215" y="95" text-anchor="middle" font-size="10" fill="#0369a1" font-weight="bold">Right Atrium</text>
              <text x="215" y="112" text-anchor="middle" font-size="9" fill="#0284c7">(Deoxygenated)</text>

              <!-- Left Atrium (Red - Oxygenated) -->
              <rect x="262" y="67" width="86" height="66" fill="#ffe4e6" opacity="0.6" rx="14" />
              <text x="305" y="95" text-anchor="middle" font-size="10" fill="#be123c" font-weight="bold">Left Atrium</text>
              <text x="305" y="112" text-anchor="middle" font-size="9" fill="#f43f5e">(Oxygenated)</text>

              <!-- Right Ventricle -->
              <rect x="172" y="137" width="86" height="76" fill="#bae6fd" opacity="0.6" rx="14" />
              <text x="215" y="170" text-anchor="middle" font-size="10" fill="#0369a1" font-weight="bold">Right Ventricle</text>
              <text x="215" y="188" text-anchor="middle" font-size="8" fill="#0284c7">To Lungs (Pulmonary)</text>

              <!-- Left Ventricle (Thickest wall) -->
              <rect x="262" y="137" width="86" height="76" fill="#fecdd3" opacity="0.6" rx="14" />
              <text x="305" y="170" text-anchor="middle" font-size="10" fill="#be123c" font-weight="bold">Left Ventricle</text>
              <text x="305" y="188" text-anchor="middle" font-size="8" fill="#be123c">Thick Wall (To Body)</text>

              <!-- Flow circulation arrows -->
              <!-- Vena Cava from body to RA -->
              <path d="M 190 240 Q 120 180 172 100" fill="none" stroke="#0284c7" stroke-width="3" marker-end="url(#arrow)" />
              <text x="110" y="170" font-size="9" fill="#0284c7" font-weight="600">Vena Cava</text>

              <!-- Pulmonary Artery from RV to Lungs -->
              <path d="M 215 137 Q 140 80 210 25" fill="none" stroke="#0284c7" stroke-width="3" />
              <text x="120" y="55" font-size="9" fill="#0284c7" font-weight="600">Pulmonary Artery</text>

              <!-- Pulmonary Vein from Lungs to LA -->
              <path d="M 310 25 Q 380 80 348 100" fill="none" stroke="#ef4444" stroke-width="3" />
              <text x="375" y="55" font-size="9" fill="#ef4444" font-weight="600">Pulmonary Vein</text>

              <!-- Aorta from LV to Body -->
              <path d="M 305 213 Q 390 240 330 250" fill="none" stroke="#ef4444" stroke-width="3" />
              <text x="380" y="215" font-size="9" fill="#ef4444" font-weight="600">Aorta (महाधमनी)</text>
            </svg>
          </div>

          <div class="action-bar">
            <button id="btn-pulse-heart" class="btn-minimal">💓 ${lang === 'np' ? 'मुटुको चाल महसुस गर्नुहोस् (Simulate Heartbeat)' : 'Simulate Cardiac Cycle'}</button>
          </div>

          <div class="telemetry-bar" style="margin-top: 1rem;">
            <div class="telemetry-item">
              <span class="telemetry-label">Normal Blood Pressure:</span>
              <span class="telemetry-value" style="color: #10b981;">120 / 80 mmHg</span>
            </div>
            <div class="telemetry-item">
              <span class="telemetry-label">Heart Rate:</span>
              <span id="heart-rate-text" class="telemetry-note">72 beats/min</span>
            </div>
          </div>
        </div>

        <div class="details-panel">
          <h4 class="details-heading">${lang === 'np' ? 'दोहोरो रक्तसञ्चारको महत्व' : 'Why Double Circulation?'}</h4>
          <ul class="clean-list">
            <li><strong>${lang === 'np' ? 'अक्सिजनयुक्त र विहीन रगत अलग:' : 'Complete Separation:'}</strong> The muscular septum completely separates oxygen-rich blood from carbon-dioxide-rich blood, enabling high metabolic efficiency for warm-blooded humans.</li>
            <li><strong>${lang === 'np' ? 'बायाँ भेन्ट्रिकलको भित्ता किन बाक्लो?' : 'Why is Left Ventricle wall thickest?'}</strong> Because it must pump blood under high hydrostatic pressure throughout the entire body (from head to toe).</li>
            <li><strong>${lang === 'np' ? 'मुटुका भल्भहरू:' : 'Heart Valves:'}</strong> Tricuspid valve (Right) and Bicuspid/Mitral valve (Left) prevent backflow of blood during ventricular contraction (systole).</li>
          </ul>
        </div>
      </div>
    </div>
  `;

  const btnPulse = container.querySelector('#btn-pulse-heart');
  const hrText = container.querySelector('#heart-rate-text');

  btnPulse.addEventListener('click', () => {
    const bpm = Math.floor(70 + Math.random() * 15);
    hrText.textContent = `${bpm} beats/min (Systole: Pumping 120 mmHg, Diastole: Filling 80 mmHg)`;
    hrText.style.color = '#ef4444';
  });
}
