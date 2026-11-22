// Interactive Biology Module: 4-Chambered Human Heart & Double Circulation Simulation
// Essential SEE Physiological Systems Unit

export class HeartSimulation {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.isBeating = true;
    this.bpm = 72;
    this.flowStep = 0;

    this.render();
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="lab-card">
        <div class="lab-header">
          <div>
            <h3>Human Blood Circulatory System (मानव रक्तसञ्चार प्रणाली)</h3>
            <p class="lab-desc">Trace deoxygenated blue blood to the lungs and oxygen-rich red blood pumped via the aorta to the entire body in real time.</p>
          </div>
          <div class="formula-badge">Normal BP = 120 / 80 mmHg</div>
        </div>

        <div class="heart-stage">
          <svg class="heart-svg" viewBox="0 0 640 380">
            <!-- Background Body Loop Indicator -->
            <rect x="20" y="20" width="600" height="340" rx="16" fill="rgba(255,255,255,0.03)" stroke="#334155"/>

            <!-- Lungs Schematic (Top) -->
            <g transform="translate(320, 45)">
              <rect x="-80" y="-20" width="160" height="40" rx="20" fill="rgba(56, 189, 248, 0.2)" stroke="#38bdf8"/>
              <text x="0" y="5" fill="#38bdf8" font-size="12" font-weight="bold" text-anchor="middle">🫁 Lungs (फोक्सो - O₂ / CO₂ Exchange)</text>
            </g>

            <!-- 4-Chambered Heart Diagram -->
            <g transform="translate(320, 200)">
              <!-- Heart Muscle Base -->
              <path d="M -140 -80 C -140 -120, -40 -120, 0 -60 C 40 -120, 140 -120, 140 -80 C 140 20, 50 120, 0 140 C -50 120, -140 20, -140 -80 Z" fill="#1e1b4b" stroke="#6366f1" stroke-width="3"/>

              <!-- Septum (Divider Wall) -->
              <line x1="0" y1="-60" x2="0" y2="135" stroke="#475569" stroke-width="6"/>

              <!-- 1. Right Atrium (RA) - Blue / Deoxygenated -->
              <rect x="-110" y="-70" width="90" height="60" rx="8" fill="rgba(59, 130, 246, 0.35)" stroke="#3b82f6" stroke-width="2"/>
              <text x="-65" y="-45" fill="#93c5fd" font-size="11" font-weight="bold" text-anchor="middle">Right Atrium</text>
              <text x="-65" y="-30" fill="#bfdbfe" font-size="9" text-anchor="middle">(दायाँ अलिन्द)</text>

              <!-- 2. Right Ventricle (RV) - Blue -->
              <rect x="-110" y="10" width="90" height="75" rx="8" fill="rgba(59, 130, 246, 0.45)" stroke="#3b82f6" stroke-width="2"/>
              <text x="-65" y="45" fill="#93c5fd" font-size="11" font-weight="bold" text-anchor="middle">Right Ventricle</text>
              <text x="-65" y="60" fill="#bfdbfe" font-size="9" text-anchor="middle">(दायाँ निलय)</text>

              <!-- Tricuspid Valve -->
              <line x1="-100" y1="0" x2="-30" y2="0" stroke="#f59e0b" stroke-width="3" stroke-dasharray="3,3"/>
              <text x="-65" y="-5" fill="#f59e0b" font-size="9" text-anchor="middle">Tricuspid Valve</text>

              <!-- 3. Left Atrium (LA) - Red / Oxygenated -->
              <rect x="20" y="-70" width="90" height="60" rx="8" fill="rgba(239, 68, 68, 0.35)" stroke="#ef4444" stroke-width="2"/>
              <text x="65" y="-45" fill="#fca5a5" font-size="11" font-weight="bold" text-anchor="middle">Left Atrium</text>
              <text x="65" y="-30" fill="#fecaca" font-size="9" text-anchor="middle">(बायाँ अलिन्द)</text>

              <!-- 4. Left Ventricle (LV) - Red (Thick Muscular Wall!) -->
              <rect x="20" y="10" width="90" height="75" rx="8" fill="rgba(239, 68, 68, 0.55)" stroke="#ef4444" stroke-width="4"/>
              <text x="65" y="45" fill="#fca5a5" font-size="11" font-weight="bold" text-anchor="middle">Left Ventricle</text>
              <text x="65" y="60" fill="#fecaca" font-size="9" text-anchor="middle">(बायाँ निलय - Thickest)</text>

              <!-- Bicuspid / Mitral Valve -->
              <line x1="30" y1="0" x2="100" y2="0" stroke="#f59e0b" stroke-width="3" stroke-dasharray="3,3"/>
              <text x="65" y="-5" fill="#f59e0b" font-size="9" text-anchor="middle">Bicuspid Valve</text>
            </g>

            <!-- Blood Vessels (Flow Paths) -->
            <!-- Vena Cava (Deoxygenated blue into RA) -->
            <path d="M 100 320 L 100 150 L 210 150" fill="none" stroke="#3b82f6" stroke-width="4"/>
            <text x="90" y="240" fill="#3b82f6" font-size="10" transform="rotate(-90, 90, 240)">Vena Cava (महाशिरा)</text>

            <!-- Pulmonary Artery (from RV to Lungs) -->
            <path d="M 210 240 L 160 240 L 160 50 L 240 50" fill="none" stroke="#3b82f6" stroke-width="4"/>
            <text x="145" y="150" fill="#3b82f6" font-size="10" transform="rotate(-90, 145, 150)">Pulmonary Artery</text>

            <!-- Pulmonary Vein (from Lungs to LA) -->
            <path d="M 400 50 L 480 50 L 480 150 L 430 150" fill="none" stroke="#ef4444" stroke-width="4"/>
            <text x="495" y="150" fill="#ef4444" font-size="10" transform="rotate(90, 495, 150)">Pulmonary Vein</text>

            <!-- Aorta (from LV to Body under High Pressure) -->
            <path d="M 430 245 L 540 245 L 540 320" fill="none" stroke="#ef4444" stroke-width="5"/>
            <text x="555" y="270" fill="#ef4444" font-size="10" transform="rotate(90, 555, 270)">Aorta (महाधमनी)</text>
          </svg>
        </div>

        <!-- Vital Statistics & Medical Knowledge -->
        <div class="calculation-box">
          <div class="calc-row">
            <strong>Resting Heart Rate:</strong> 72 Beats / minute &nbsp;|&nbsp;
            <strong>Systolic Pressure:</strong> 120 mmHg (Ventricle Contraction) &nbsp;|&nbsp;
            <strong>Diastolic Pressure:</strong> 80 mmHg (Heart Relaxation)
          </div>
          <div class="calc-result">
            Double Circulation: <strong>Pulmonary Circulation</strong> (Heart ⇄ Lungs) + <strong>Systemic Circulation</strong> (Heart ⇄ Body).
          </div>
        </div>
      </div>
    `;
  }
}
