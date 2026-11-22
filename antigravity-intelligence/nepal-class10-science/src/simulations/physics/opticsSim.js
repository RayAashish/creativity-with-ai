// Interactive Optics Module: Convex Lens Ray Tracer & Eye Vision Defect Simulator

export class OpticsSimulation {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.f = 50; // Focal length in mm/pixels
    this.u = 110; // Object distance in mm/pixels
    this.objHeight = 40;

    // Eye defect state
    this.activeDefect = 'myopia'; // 'normal' | 'myopia' | 'hypermetropia'
    this.correctionApplied = false;

    this.render();
  }

  calculateImage() {
    // 1/f = 1/u + 1/v => 1/v = 1/f - 1/u => v = (u * f) / (u - f)
    if (this.u === this.f) {
      return { v: Infinity, height: Infinity, isReal: true, desc: "At Infinity (समानान्तर)" };
    }
    const v = (this.u * this.f) / (this.u - this.f);
    const m = -v / this.u;
    const imgHeight = this.objHeight * m;
    const isReal = v > 0;

    let nature = "";
    if (this.u > 2 * this.f) nature = "Real, Inverted, Diminished (वास्तविक, उल्टो, सानो)";
    else if (this.u === 2 * this.f) nature = "Real, Inverted, Same Size at 2F (वास्तविक, उल्टो, बराबर)";
    else if (this.u > this.f) nature = "Real, Inverted, Magnified beyond 2F (वास्तविक, उल्टो, ठूलो)";
    else nature = "Virtual, Erect, Magnified on same side (अवास्तविक, सुल्टो, ठूलो - Magnifying Glass)";

    return { v, height: imgHeight, isReal, nature };
  }

  render() {
    if (!this.container) return;

    const img = this.calculateImage();
    const vDisplay = Math.abs(img.v) === Infinity ? "Infinity (∞)" : `${img.v.toFixed(1)} cm`;
    const power = (100 / this.f).toFixed(2); // Diopters

    this.container.innerHTML = `
      <div class="lab-card">
        <div class="lab-header">
          <div>
            <h3>Light & Optical Lenses (प्रकाश र लेन्सको आवर्तन)</h3>
            <p class="lab-desc">Explore image formation through convex lenses at all 6 standard object positions, calculate lens power, and correct human vision defects.</p>
          </div>
          <div class="formula-badge">1/f = 1/u + 1/v &nbsp;|&nbsp; P = 1/f(m)</div>
        </div>

        <!-- 2D Ray Tracer Canvas Area -->
        <div class="optics-stage">
          <svg class="optics-svg" viewBox="0 0 700 240">
            <!-- Principal Axis -->
            <line x1="20" y1="120" x2="680" y2="120" stroke="#475569" stroke-width="2" stroke-dasharray="4,4"/>

            <!-- Lens Center & Planes -->
            <!-- Convex Lens Graphic -->
            <path d="M 350 20 Q 375 120 350 220 Q 325 120 350 20 Z" fill="rgba(56, 189, 248, 0.25)" stroke="#38bdf8" stroke-width="2"/>
            <line x1="350" y1="20" x2="350" y2="220" stroke="#38bdf8" stroke-width="1" stroke-dasharray="2,2"/>

            <!-- Focal Points & 2F Marks -->
            <!-- Left Side -->
            <circle cx="${350 - this.f}" cy="120" r="4" fill="#f59e0b"/>
            <text x="${350 - this.f}" y="140" fill="#f59e0b" font-size="11" text-anchor="middle">F₁ (${this.f}cm)</text>

            <circle cx="${350 - 2 * this.f}" cy="120" r="4" fill="#f59e0b"/>
            <text x="${350 - 2 * this.f}" y="140" fill="#f59e0b" font-size="11" text-anchor="middle">2F₁ (${2 * this.f}cm)</text>

            <!-- Right Side -->
            <circle cx="${350 + this.f}" cy="120" r="4" fill="#f59e0b"/>
            <text x="${350 + this.f}" y="140" fill="#f59e0b" font-size="11" text-anchor="middle">F₂</text>

            <circle cx="${350 + 2 * this.f}" cy="120" r="4" fill="#f59e0b"/>
            <text x="${350 + 2 * this.f}" y="140" fill="#f59e0b" font-size="11" text-anchor="middle">2F₂</text>

            <!-- Object (Candle) at distance u to the left of lens -->
            <g transform="translate(${350 - this.u}, 120)">
              <line x1="0" y1="0" x2="0" y2="${-this.objHeight}" stroke="#ef4444" stroke-width="3"/>
              <!-- Arrow head -->
              <polygon points="0,${-this.objHeight} -5,${-this.objHeight + 10} 5,${-this.objHeight + 10}" fill="#ef4444"/>
              <text x="0" y="${-this.objHeight - 8}" fill="#ef4444" font-size="11" text-anchor="middle">Candle (u)</text>
            </g>

            <!-- Ray 1: Parallel to axis, passes through F₂ -->
            <line x1="${350 - this.u}" y1="${120 - this.objHeight}" x2="350" y2="${120 - this.objHeight}" stroke="#38bdf8" stroke-width="1.5"/>
            <line x1="350" y1="${120 - this.objHeight}" x2="680" y2="${120 - this.objHeight + (this.objHeight / this.f) * (680 - 350)}" stroke="#38bdf8" stroke-width="1.5"/>

            <!-- Ray 2: Through optical center O without deviation -->
            <line x1="${350 - this.u}" y1="${120 - this.objHeight}" x2="680" y2="${120 + (this.objHeight / this.u) * (680 - 350)}" stroke="#a855f7" stroke-width="1.5"/>

            <!-- Formed Image (if real) -->
            ${img.isReal && img.v < 330 ? `
              <g transform="translate(${350 + img.v}, 120)">
                <line x1="0" y1="0" x2="0" y2="${-img.height}" stroke="#10b981" stroke-width="3"/>
                <polygon points="0,${-img.height} -5,${-img.height - 10} 5,${-img.height - 10}" fill="#10b981"/>
                <text x="0" y="${-img.height + 18}" fill="#10b981" font-size="11" text-anchor="middle">Image (v)</text>
              </g>
            ` : ''}
          </svg>
        </div>

        <!-- Telemetry & Calculations -->
        <div class="calculation-box">
          <div class="calc-row">
            <strong>Object Distance (u):</strong> ${this.u} cm &nbsp;|&nbsp;
            <strong>Focal Length (f):</strong> ${this.f} cm &nbsp;|&nbsp;
            <strong>Image Distance (v):</strong> ${vDisplay} &nbsp;|&nbsp;
            <strong>Lens Power (P = 1/f):</strong> +${power} Diopters (D)
          </div>
          <div class="calc-result">
            Image Nature: <strong>${img.nature}</strong>
          </div>
        </div>

        <!-- Slider Controls -->
        <div class="controls-grid">
          <div class="ctrl-item">
            <label>Object Distance (u): <span id="lbl-u">${this.u} cm</span></label>
            <input type="range" id="slider-u" min="30" max="180" value="${this.u}">
          </div>

          <div class="ctrl-item">
            <label>Focal Length (f): <span id="lbl-f">${this.f} cm</span></label>
            <input type="range" id="slider-f" min="30" max="75" value="${this.f}">
          </div>
        </div>

        <!-- Quick 6 Positions for SEE Exam -->
        <div class="preset-buttons-row">
          <button id="pos-beyond-2f" class="btn-subtle">📍 Beyond 2F (Diminished, camera)</button>
          <button id="pos-at-2f" class="btn-subtle">📍 Exactly at 2F (Same size, 1:1)</button>
          <button id="pos-between-f-2f" class="btn-subtle">📍 Between F and 2F (Magnified projector)</button>
          <button id="pos-at-f" class="btn-subtle">📍 At Focus F (Parallel searchlight)</button>
          <button id="pos-inside-f" class="btn-subtle">📍 Inside F (Magnifying Glass)</button>
        </div>

        <hr class="lab-divider">

        <!-- Human Eye Defect & Spectacle Correction Simulator -->
        <div class="eye-defect-section">
          <h4>👁️ Defects of Vision & Optical Correction (आँखाका दृष्टि दोष र चश्माको प्रयोग)</h4>
          <p class="lab-desc">Test how elongated eyeballs cause Myopia (short-sightedness) and shortened eyeballs cause Hypermetropia (long-sightedness), and how doctors prescribe concave vs convex spectacles.</p>

          <div class="defect-toggles">
            <button id="btn-eye-myopia" class="btn-secondary ${this.activeDefect === 'myopia' ? 'active' : ''}">👓 Myopia (Short-sighted)</button>
            <button id="btn-eye-hyper" class="btn-secondary ${this.activeDefect === 'hypermetropia' ? 'active' : ''}">👓 Hypermetropia (Far-sighted)</button>
            <button id="btn-eye-correct" class="btn-primary">
              ${this.correctionApplied ? '❌ Remove Spectacles' : '✔ WEAR CORRECTIVE SPECTACLES'}
            </button>
          </div>

          <div class="eye-diagram-box">
            <div class="eye-visual">
              <div class="eyeball ${this.activeDefect}">
                <div class="cornea"></div>
                ${this.correctionApplied ? `<div class="spectacle-lens ${this.activeDefect === 'myopia' ? 'concave-glass' : 'convex-glass'}">
                  ${this.activeDefect === 'myopia' ? 'Concave (-D)' : 'Convex (+D)'}
                </div>` : ''}
                <div class="eye-lens">Natural Lens</div>
                <div class="retina-wall">
                  <span class="retina-label">Retina (दृष्टिपटल)</span>
                </div>
                <!-- Focal focal point marker -->
                <div class="focus-marker ${this.correctionApplied ? 'on-retina' : (this.activeDefect === 'myopia' ? 'in-front' : 'behind')}">
                  ${this.correctionApplied ? '🎯 Focused on Retina (Clear 20/20 Vision!)' : (this.activeDefect === 'myopia' ? '⚠️ Blurry: Focuses IN FRONT of retina' : '⚠️ Blurry: Focuses BEHIND retina')}
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
    const sU = document.getElementById('slider-u');
    const sF = document.getElementById('slider-f');

    if (sU) {
      sU.addEventListener('input', (e) => {
        this.u = parseFloat(e.target.value);
        this.render();
      });
    }

    if (sF) {
      sF.addEventListener('input', (e) => {
        this.f = parseFloat(e.target.value);
        this.render();
      });
    }

    // Quick Position presets
    const setU = (val) => {
      this.u = val;
      this.render();
    };

    const bBeyond = document.getElementById('pos-beyond-2f');
    if (bBeyond) bBeyond.addEventListener('click', () => setU(this.f * 2.5));

    const bAt2F = document.getElementById('pos-at-2f');
    if (bAt2F) bAt2F.addEventListener('click', () => setU(this.f * 2));

    const bBetween = document.getElementById('pos-between-f-2f');
    if (bBetween) bBetween.addEventListener('click', () => setU(this.f * 1.5));

    const bAtF = document.getElementById('pos-at-f');
    if (bAtF) bAtF.addEventListener('click', () => setU(this.f));

    const bInsideF = document.getElementById('pos-inside-f');
    if (bInsideF) bInsideF.addEventListener('click', () => setU(this.f * 0.7));

    // Eye defect buttons
    const btnMyopia = document.getElementById('btn-eye-myopia');
    if (btnMyopia) {
      btnMyopia.addEventListener('click', () => {
        this.activeDefect = 'myopia';
        this.correctionApplied = false;
        this.render();
      });
    }

    const btnHyper = document.getElementById('btn-eye-hyper');
    if (btnHyper) {
      btnHyper.addEventListener('click', () => {
        this.activeDefect = 'hypermetropia';
        this.correctionApplied = false;
        this.render();
      });
    }

    const btnCorrect = document.getElementById('btn-eye-correct');
    if (btnCorrect) {
      btnCorrect.addEventListener('click', () => {
        this.correctionApplied = !this.correctionApplied;
        this.render();
      });
    }
  }
}
