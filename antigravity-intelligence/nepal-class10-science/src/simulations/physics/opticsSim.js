// Interactive Optics, Convex Lens Ray Tracer & Eye Defects Lab

export function renderOpticsSim(container, lang = 'en') {
  container.innerHTML = `
    <div class="sim-card">
      <div class="sim-header">
        <div class="sim-badge">PHYSICS LAB // भौतिक विज्ञान</div>
        <h2 class="sim-title">${lang === 'np' ? 'प्रकाश, उत्तल लेन्स र आँखाका दोषहरू' : 'Optics, Convex Lens Ray Tracer & Eye Defects'}</h2>
        <p class="sim-desc">
          ${lang === 'np'
            ? 'उत्तल लेन्सको किरण रेखाचित्र (Ray diagram), लेन्सको सामर्थ्य (P = १/f), अदूर दृष्टि (Myopia) र दूर दृष्टि (Hypermetropia) चस्माद्वारा उपचार।'
            : 'Explore geometric ray tracing with a convex lens, lens power in Diopters, and spectacle corrections for Myopia and Hypermetropia.'}
        </p>
      </div>

      <div class="lab-subtabs">
        <button class="subtab-btn active" data-sub="raytracer">${lang === 'np' ? '🔬 लेन्सको किरण रेखाचित्र' : '🔬 Optical Bench Ray Tracer'}</button>
        <button class="subtab-btn" data-sub="eyedefects">${lang === 'np' ? '👁️ दृष्टिका दोषहरू र चस्मा' : '👁️ Human Eye Defects & Spectacles'}</button>
      </div>

      <!-- 1. RAY TRACER -->
      <div id="optics-sub-raytracer" class="subtab-content active">
        <div class="interactive-panel">
          <div class="canvas-wrapper">
            <svg id="ray-tracer-svg" viewBox="0 0 640 260" class="sim-svg">
              <!-- Principal Axis -->
              <line x1="20" y1="130" x2="620" y2="130" stroke="#71717a" stroke-width="1.5" />
              
              <!-- Lens Center Line (O) -->
              <line x1="320" y1="20" x2="320" y2="240" stroke="#0284c7" stroke-width="2.5" stroke-dasharray="4,4" />
              <path d="M 320 20 Q 335 130 320 240 Q 305 130 320 20" fill="#e0f2fe" fill-opacity="0.5" stroke="#0284c7" stroke-width="2" />
              <text x="325" y="145" font-size="11" fill="#0284c7" font-weight="bold">O</text>

              <!-- Focal Points and Centers of Curvature -->
              <!-- Left side -->
              <circle cx="240" cy="130" r="3" fill="#71717a" /><text x="240" y="145" text-anchor="middle" font-size="10" fill="#71717a">F₁</text>
              <circle cx="160" cy="130" r="3" fill="#71717a" /><text x="160" y="145" text-anchor="middle" font-size="10" fill="#71717a">2F₁</text>

              <!-- Right side -->
              <circle cx="400" cy="130" r="3" fill="#71717a" /><text x="400" y="145" text-anchor="middle" font-size="10" fill="#71717a">F₂</text>
              <circle cx="480" cy="130" r="3" fill="#71717a" /><text x="480" y="145" text-anchor="middle" font-size="10" fill="#71717a">2F₂</text>

              <!-- Object (Draggable Arrow) -->
              <line id="obj-arrow" x1="120" y1="130" x2="120" y2="70" stroke="#18181b" stroke-width="4" />
              <polygon id="obj-head" points="115,75 125,75 120,65" fill="#18181b" />
              <text id="obj-label" x="120" y="58" text-anchor="middle" font-size="11" fill="#18181b" font-weight="bold">Object (A)</text>

              <!-- Light Rays (Parallel and Central) -->
              <line id="ray-parallel-in" x1="120" y1="70" x2="320" y2="70" stroke="#ef4444" stroke-width="1.5" />
              <line id="ray-parallel-out" x1="320" y1="70" x2="520" y2="190" stroke="#ef4444" stroke-width="1.5" />
              
              <line id="ray-central" x1="120" y1="70" x2="520" y2="190" stroke="#10b981" stroke-width="1.5" />

              <!-- Image (Arrow formed on right) -->
              <line id="img-arrow" x1="520" y1="130" x2="520" y2="190" stroke="#0284c7" stroke-width="3" />
              <polygon id="img-head" points="515,185 525,185 520,195" fill="#0284c7" />
              <text id="img-label" x="520" y="210" text-anchor="middle" font-size="11" fill="#0284c7" font-weight="bold">Image (A')</text>
            </svg>
          </div>

          <div class="control-grid-3">
            <div class="control-item">
              <label class="control-label">
                <span>Object Distance (u):</span>
                <span id="opt-u-val" class="value-pill">25.0 cm</span>
              </label>
              <input type="range" id="opt-u-slider" min="9" max="45" value="25" class="minimal-slider" />
            </div>

            <div class="control-item">
              <label class="control-label">
                <span>Focal Length (f):</span>
                <span id="opt-f-val" class="value-pill">10.0 cm</span>
              </label>
              <input type="range" id="opt-f-slider" min="6" max="15" value="10" class="minimal-slider" />
            </div>

            <div class="control-item">
              <label class="control-label">
                <span>Lens Power (P = 1/f):</span>
                <span id="opt-power-val" class="value-pill">+10.0 D</span>
              </label>
              <div class="text-muted" style="font-size: 0.85rem; padding-top: 6px;">P = 100 / f(cm)</div>
            </div>
          </div>

          <div class="telemetry-bar">
            <div class="telemetry-item">
              <span class="telemetry-label">Image Position (v):</span>
              <span id="opt-v-res" class="telemetry-value">16.7 cm</span>
            </div>
            <div class="telemetry-item">
              <span class="telemetry-label">Image Nature:</span>
              <span id="opt-nature-res" class="telemetry-note">Real, Inverted, Diminished</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. EYE DEFECTS & CORRECTION -->
      <div id="optics-sub-eyedefects" class="subtab-content">
        <div class="minimal-grid">
          <div class="interactive-panel">
            <div class="radio-pill-group">
              <button class="radio-pill-btn active" data-eye="normal">Normal Eye (सामान्य आँखा)</button>
              <button class="radio-pill-btn" data-eye="myopia">Myopia / Short-Sighted (अदूर दृष्टि)</button>
              <button class="radio-pill-btn" data-eye="hyper">Hypermetropia / Long-Sighted (दूरी दृष्टि)</button>
            </div>

            <div class="canvas-wrapper" style="margin-top: 1rem;">
              <svg id="eye-svg" viewBox="0 0 460 220" class="sim-svg">
                <!-- Eyeball outline -->
                <ellipse id="eyeball-shape" cx="260" cy="110" rx="90" ry="75" fill="#fafafa" stroke="#18181b" stroke-width="2" />
                <path d="M 170 110 Q 155 110 160 80 Q 170 110 160 140" fill="#e0f2fe" stroke="#0284c7" stroke-width="1.5" />
                <!-- Crystalline Lens -->
                <ellipse cx="205" cy="110" rx="8" ry="24" fill="#bae6fd" stroke="#0284c7" stroke-width="1.5" />
                
                <!-- Retina line at back of eye -->
                <path d="M 330 60 Q 355 110 330 160" fill="none" stroke="#f59e0b" stroke-width="4" />
                <text x="365" y="115" font-size="10" fill="#f59e0b" font-weight="600">Retina</text>

                <!-- Spectacle Lens (placed in front of cornea) -->
                <g id="spectacle-glass" opacity="0">
                  <path id="spec-lens-shape" d="M 120 70 Q 115 110 120 150" fill="none" stroke="#6366f1" stroke-width="4" />
                  <text x="120" y="55" text-anchor="middle" font-size="9" fill="#6366f1" font-weight="600">Corrective Lens</text>
                </g>

                <!-- Incoming Parallel Light Rays -->
                <line x1="20" y1="90" x2="197" y2="90" stroke="#ef4444" stroke-width="1.5" />
                <line x1="20" y1="130" x2="197" y2="130" stroke="#ef4444" stroke-width="1.5" />

                <!-- Refracted rays inside eye -->
                <line id="eye-ray-top" x1="213" y1="90" x2="345" y2="110" stroke="#ef4444" stroke-width="1.5" />
                <line id="eye-ray-bot" x1="213" y1="130" x2="345" y2="110" stroke="#ef4444" stroke-width="1.5" />
                <circle id="focal-point-eye" cx="345" cy="110" r="4" fill="#ef4444" />
              </svg>
            </div>

            <div class="action-bar">
              <button id="btn-toggle-glasses" class="btn-minimal">👓 ${lang === 'np' ? 'चस्मा लगाउनुहोस् (Wear Spectacles)' : 'Apply Corrective Spectacles'}</button>
            </div>

            <div id="eye-defect-desc" class="telemetry-bar" style="margin-top: 1rem;">
              <span class="telemetry-label">Diagnosis:</span>
              <span id="eye-status-text" class="telemetry-value">Normal 20/20 vision (Image focuses sharply on retina).</span>
            </div>
          </div>

          <div class="details-panel">
            <h4 class="details-heading">${lang === 'np' ? 'SEE परीक्षामा सोधिने मुख्य फरकहरू' : 'SEE High-Yield Comparison'}</h4>
            <table class="minimal-table">
              <thead><tr><th>Defect</th><th>Cause</th><th>Correction</th></tr></thead>
              <tbody>
                <tr>
                  <td><strong>Myopia (अदूर दृष्टि)</strong></td>
                  <td>Eyeball too elongated; focus in FRONT of retina.</td>
                  <td><span class="value-highlight">Concave Lens (-D)</span></td>
                </tr>
                <tr>
                  <td><strong>Hypermetropia (दूरी दृष्टि)</strong></td>
                  <td>Eyeball too short; focus BEHIND retina.</td>
                  <td><span class="value-highlight">Convex Lens (+D)</span></td>
                </tr>
              </tbody>
            </table>
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
      const target = container.querySelector(`#optics-sub-${t.dataset.sub}`);
      if (target) target.classList.add('active');
    });
  });

  // Ray Tracer Logic
  const uSlider = container.querySelector('#opt-u-slider');
  const fSlider = container.querySelector('#opt-f-slider');
  const uVal = container.querySelector('#opt-u-val');
  const fVal = container.querySelector('#opt-f-val');
  const pVal = container.querySelector('#opt-power-val');
  const vRes = container.querySelector('#opt-v-res');
  const natRes = container.querySelector('#opt-nature-res');

  const objArrow = container.querySelector('#obj-arrow');
  const objHead = container.querySelector('#obj-head');
  const objLabel = container.querySelector('#obj-label');
  const rayParIn = container.querySelector('#ray-parallel-in');
  const rayParOut = container.querySelector('#ray-parallel-out');
  const rayCen = container.querySelector('#ray-central');
  const imgArrow = container.querySelector('#img-arrow');
  const imgHead = container.querySelector('#img-head');
  const imgLabel = container.querySelector('#img-label');

  const updateRayTracer = () => {
    const uCm = parseFloat(uSlider.value);
    const fCm = parseFloat(fSlider.value);
    uVal.textContent = `${uCm.toFixed(1)} cm`;
    fVal.textContent = `${fCm.toFixed(1)} cm`;

    const power = (100 / fCm).toFixed(1);
    pVal.textContent = `+${power} D`;

    // 1/v = 1/f - 1/u
    let vCm = 0;
    if (uCm === fCm) {
      vCm = Infinity;
      vRes.textContent = 'At Infinity (अनन्तमा)';
      natRes.textContent = 'Real, Inverted, Highly Magnified';
    } else if (uCm > fCm) {
      vCm = (fCm * uCm) / (uCm - fCm);
      vRes.textContent = `${vCm.toFixed(1)} cm`;
      const mag = vCm / uCm;
      natRes.textContent = `Real, Inverted, ${mag > 1.1 ? 'Magnified' : mag < 0.9 ? 'Diminished' : 'Same Size'}`;
    } else {
      // Virtual
      vCm = (fCm * uCm) / (fCm - uCm);
      vRes.textContent = `-${vCm.toFixed(1)} cm (Same side)`;
      natRes.textContent = 'Virtual, Erect, Magnified (Magnifying Glass effect)';
    }

    // Scale to SVG coords (O is at x=320, y=130)
    const scale = 8;
    const objX = 320 - uCm * scale;
    const objHeight = 55;
    objArrow.setAttribute('x1', objX);
    objArrow.setAttribute('x2', objX);
    objArrow.setAttribute('y1', 130);
    objArrow.setAttribute('y2', 130 - objHeight);
    objHead.setAttribute('points', `${objX - 5},${130 - objHeight + 10} ${objX + 5},${130 - objHeight + 10} ${objX},${130 - objHeight}`);
    objLabel.setAttribute('x', objX);

    rayParIn.setAttribute('x1', objX);
    rayParIn.setAttribute('y1', 130 - objHeight);
    rayParIn.setAttribute('y2', 130 - objHeight);

    rayCen.setAttribute('x1', objX);
    rayCen.setAttribute('y1', 130 - objHeight);

    if (uCm > fCm) {
      const imgX = 320 + Math.min(280, vCm * scale);
      const mag = vCm / uCm;
      const imgHeight = Math.min(90, objHeight * mag);
      const imgY = 130 + imgHeight;

      rayParOut.setAttribute('x2', imgX);
      rayParOut.setAttribute('y2', imgY);
      rayCen.setAttribute('x2', imgX);
      rayCen.setAttribute('y2', imgY);

      imgArrow.style.display = 'block';
      imgHead.style.display = 'block';
      imgLabel.style.display = 'block';
      imgArrow.setAttribute('x1', imgX);
      imgArrow.setAttribute('x2', imgX);
      imgArrow.setAttribute('y1', 130);
      imgArrow.setAttribute('y2', imgY);
      imgHead.setAttribute('points', `${imgX - 5},${imgY - 10} ${imgX + 5},${imgY - 10} ${imgX},${imgY}`);
      imgLabel.setAttribute('x', imgX);
      imgLabel.setAttribute('y', imgY + 15);
    } else {
      imgArrow.style.display = 'none';
      imgHead.style.display = 'none';
      imgLabel.style.display = 'none';
    }
  };

  uSlider.addEventListener('input', updateRayTracer);
  fSlider.addEventListener('input', updateRayTracer);
  updateRayTracer();

  // Eye Defect logic
  let activeEyeDefect = 'normal';
  let hasGlasses = false;

  const eyeBtns = container.querySelectorAll('.radio-pill-btn');
  const btnGlasses = container.querySelector('#btn-toggle-glasses');
  const specGlass = container.querySelector('#spectacle-glass');
  const rayTop = container.querySelector('#eye-ray-top');
  const rayBot = container.querySelector('#eye-ray-bot');
  const focalEye = container.querySelector('#focal-point-eye');
  const eyeStatus = container.querySelector('#eye-status-text');

  const updateEye = () => {
    specGlass.setAttribute('opacity', hasGlasses ? '1' : '0');
    let focalX = 345; // Exactly on retina for normal

    if (activeEyeDefect === 'normal') {
      focalX = 345;
      eyeStatus.textContent = 'Normal Eye (20/20 vision): Light focuses sharply onto the retina.';
      eyeStatus.style.color = '#10b981';
      btnGlasses.style.display = 'none';
    } else if (activeEyeDefect === 'myopia') {
      btnGlasses.style.display = 'inline-block';
      if (hasGlasses) {
        focalX = 345;
        eyeStatus.textContent = '✔ Corrected with Concave (-D) spectacles: Light now diverges correctly onto the retina.';
        eyeStatus.style.color = '#10b981';
      } else {
        focalX = 290; // In front of retina
        eyeStatus.textContent = 'Myopia (Short-sightedness): Light rays converge IN FRONT of the retina! Distant objects look blurry.';
        eyeStatus.style.color = '#ef4444';
      }
    } else if (activeEyeDefect === 'hyper') {
      btnGlasses.style.display = 'inline-block';
      if (hasGlasses) {
        focalX = 345;
        eyeStatus.textContent = '✔ Corrected with Convex (+D) spectacles: Light converges onto the retina.';
        eyeStatus.style.color = '#10b981';
      } else {
        focalX = 390; // Behind retina
        eyeStatus.textContent = 'Hypermetropia (Long-sightedness): Light rays focus BEHIND the retina! Nearby reading is blurry.';
        eyeStatus.style.color = '#ef4444';
      }
    }

    rayTop.setAttribute('x2', focalX);
    rayBot.setAttribute('x2', focalX);
    focalEye.setAttribute('cx', focalX);
  };

  eyeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      eyeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeEyeDefect = btn.dataset.eye;
      hasGlasses = false;
      btnGlasses.textContent = '👓 Apply Corrective Spectacles';
      updateEye();
    });
  });

  btnGlasses.addEventListener('click', () => {
    hasGlasses = !hasGlasses;
    btnGlasses.textContent = hasGlasses ? '❌ Remove Spectacles' : '👓 Apply Corrective Spectacles';
    updateEye();
  });

  updateEye();
}
