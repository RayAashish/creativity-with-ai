// Interactive SEE Numerical Problems Solver (संख्यात्मक समस्या समाधानकर्ता)
import { NUMERICALS_BANK } from '../../data/numericalsBank.js';

export function renderNumericalSolver(container, lang = 'en') {
  container.innerHTML = `
    <div class="sim-card">
      <div class="sim-header">
        <div class="sim-badge">MATHEMATICAL PHYSICS & CHEMISTRY // गणितीय विज्ञान</div>
        <h2 class="sim-title">${lang === 'np' ? 'SEE बोर्ड परीक्षा गणितीय समस्या समाधानकर्ता' : 'Interactive SEE Numericals Solver & Calculator'}</h2>
        <p class="sim-desc">
          ${lang === 'np'
            ? 'विगत वर्षका SEE परीक्षामा सोधिएका महत्वपूर्ण गणितीय समस्याहरूको चरणबद्ध समाधान हेर्नुहोस् र आफ्नै मानहरू राखेर तुरुन्तै हिसाब गर्नुहोस्।'
            : 'Explore step-by-step mathematical solutions to high-yield SEE Board examination numericals. Modify the input parameters to calculate your own practice values!'}
        </p>
      </div>

      <div class="solver-container">
        <!-- Selector for Numerical Problem -->
        <div class="problem-selector-bar">
          <label class="control-label">${lang === 'np' ? 'समस्या छान्नुहोस्:' : 'Select Problem:'}</label>
          <select id="problem-select" class="minimal-select">
            ${NUMERICALS_BANK.map((item, idx) => `
              <option value="${item.id}">[Unit: ${item.unit}] #${idx + 1}: ${item.topic}</option>
            `).join('')}
          </select>
        </div>

        <div id="problem-display-card" class="problem-card">
          <!-- Dynamically filled -->
        </div>
      </div>
    </div>
  `;

  const selector = container.querySelector('#problem-select');
  const display = container.querySelector('#problem-display-card');

  const updateProblem = (problemId) => {
    const prob = NUMERICALS_BANK.find(p => p.id === problemId) || NUMERICALS_BANK[0];
    
    display.innerHTML = `
      <div class="problem-statement-box">
        <div class="problem-topic-tag">${prob.topic}</div>
        <h3 class="problem-question-en">${prob.questionEn}</h3>
        <h4 class="problem-question-np text-muted">${prob.questionNp}</h4>
      </div>

      <div class="minimal-grid">
        <div class="given-steps-panel">
          <h4 class="details-heading">${lang === 'np' ? 'दिइएको जानकारी (Given Data):' : 'Given Data & Parameters:'}</h4>
          <ul class="clean-list">
            ${Object.entries(prob.given).map(([k, v]) => `<li><code>${k}</code> = <strong>${v}</strong></li>`).join('')}
          </ul>

          <h4 class="details-heading" style="margin-top: 1rem;">${lang === 'np' ? 'प्रयोग हुने सूत्र (Formula):' : 'Applicable Formula:'}</h4>
          <div class="formula-box">
            <div class="formula-math">${prob.formula}</div>
          </div>

          <h4 class="details-heading" style="margin-top: 1rem;">${lang === 'np' ? 'चरणबद्ध समाधान (Step-by-Step Steps):' : 'Detailed Step-by-Step Working:'}</h4>
          <ol class="steps-list">
            ${prob.steps.map(step => `<li>${step}</li>`).join('')}
          </ol>

          <div class="final-answer-box">
            <span>${lang === 'np' ? 'अन्तिम उत्तर (Final Answer):' : 'Final Answer:'}</span>
            <span class="answer-badge">${prob.answer}</span>
          </div>
        </div>

        <div class="interactive-calc-panel">
          <h4 class="details-heading">${lang === 'np' ? '🧮 आफ्नै मान राखेर हिसाब गर्नुहोस्:' : '🧮 Live Interactive Calculator:'}</h4>
          <p class="text-muted">${lang === 'np' ? 'तलका मानहरू परिवर्तन गरेर नयाँ नतिजा हेर्नुहोस्:' : 'Tweak the numbers below to see instant calculations:'}</p>

          <div id="calc-inputs-container" class="calc-inputs-box">
            ${Object.entries(prob.defaultInputs).map(([key, val]) => `
              <div class="control-row">
                <label class="control-label">${key}:</label>
                <input type="number" id="input-${key}" value="${val}" class="minimal-number-input" />
              </div>
            `).join('')}
          </div>

          <button id="btn-calc-run" class="btn-minimal full-width" style="margin-top: 1rem;">⚡ ${lang === 'np' ? 'हिसाब गर्नुहोस्' : 'Calculate Live Solution'}</button>

          <div id="calc-live-result" class="live-result-box" style="margin-top: 1rem;">
            <!-- Output from calculationCode -->
          </div>
        </div>
      </div>
    `;

    const btnRun = display.querySelector('#btn-calc-run');
    const resultBox = display.querySelector('#calc-live-result');

    const runCalc = () => {
      const inputs = {};
      Object.keys(prob.defaultInputs).forEach(k => {
        const inp = display.querySelector(`#input-${k}`);
        if (inp) inputs[k] = parseFloat(inp.value) || 0;
      });

      const calcRes = prob.calculationCode(inputs);
      resultBox.innerHTML = `
        <div class="res-row">
          <span class="res-label">Result:</span>
          <span class="res-value">${calcRes.result}</span>
        </div>
        <div class="res-steps text-muted">${calcRes.steps}</div>
      `;
    };

    btnRun.addEventListener('click', runCalc);
    runCalc();
  };

  selector.addEventListener('change', (e) => updateProblem(e.target.value));
  updateProblem(selector.value);
}
