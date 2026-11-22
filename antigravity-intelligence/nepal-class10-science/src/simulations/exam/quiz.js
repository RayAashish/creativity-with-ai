// Interactive SEE Exam Practice Quiz & Mastery Assessment

export class SEEQuiz {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.currentScore = 0;
    this.answered = {};

    this.questions = [
      {
        id: 1,
        unit: "Physics - Gravitation",
        q: "What is the numerical value and SI unit of the Universal Gravitational Constant (G)?",
        options: [
          "9.8 m/s²",
          "6.67 × 10⁻¹¹ N·m²/kg²",
          "6.67 × 10¹¹ N·kg²/m²",
          "3 × 10⁸ m/s"
        ],
        correct: 1,
        explanation: "G = 6.674 × 10⁻¹¹ N·m²/kg². It was first experimentally determined by Henry Cavendish in 1798 using a torsion balance."
      },
      {
        id: 2,
        unit: "Physics - Gravitation",
        q: "According to Newton's Universal Law of Gravitation, if the distance (d) between two bodies is doubled, what happens to the gravitational force between them?",
        options: [
          "Force doubles (2F)",
          "Force halves (F/2)",
          "Force becomes one-fourth (F/4)",
          "Force quadruples (4F)"
        ],
        correct: 2,
        explanation: "Gravitational force obeys the inverse-square law: F ∝ 1/d². If distance is doubled (2d), the new force is F' = 1/(2d)² = 1/(4d²) = F/4."
      },
      {
        id: 3,
        unit: "Physics - Pressure",
        q: "Which law is the operational principle of hydraulic lifts and hydraulic brakes?",
        options: [
          "Archimedes' Principle",
          "Pascal's Law",
          "Boyle's Law",
          "Newton's Third Law"
        ],
        correct: 1,
        explanation: "Pascal's Law states that pressure applied to an enclosed liquid is transmitted equally and undiminished in all directions."
      },
      {
        id: 4,
        unit: "Physics - Optics",
        q: "Which lens is prescribed by an eye specialist to correct Myopia (short-sightedness)?",
        options: [
          "Convex Lens (Abhisari)",
          "Concave Lens (Apasari)",
          "Bifocal Lens",
          "Cylindrical Lens"
        ],
        correct: 1,
        explanation: "In Myopia, rays focus in front of the elongated retina. A concave (diverging) lens with negative power diverges incoming rays so they focus sharply on the retina."
      },
      {
        id: 5,
        unit: "Physics - Electricity",
        q: "A house runs four 60-Watt bulbs for 5 hours every day. How many electricity units (kWh) are consumed in 30 days?",
        options: [
          "12 units",
          "36 units",
          "72 units",
          "360 units"
        ],
        correct: 1,
        explanation: "Daily kWh = (4 × 60W × 5h) / 1000 = 1.2 kWh. Monthly units = 1.2 × 30 days = 36 units."
      },
      {
        id: 6,
        unit: "Chemistry - Gases",
        q: "Why is the hard glass test tube clamped with its mouth tilting downwards during the laboratory preparation of Ammonia (NH₃)?",
        options: [
          "To allow Ammonia gas to escape faster",
          "To prevent condensed water vapor from trickling back and cracking the hot glass tube",
          "Because Ammonia is heavier than air",
          "To prevent oxygen from entering the tube"
        ],
        correct: 1,
        explanation: "Water vapor is formed during the reaction (2NH₄Cl + Ca(OH)₂). If tilted upward, water droplets would run down to the red-hot bottom of the tube and shatter it due to thermal shock."
      },
      {
        id: 7,
        unit: "Chemistry - Periodic Table",
        q: "Modern Periodic Law states that properties of elements are periodic functions of their:",
        options: [
          "Atomic weight / mass",
          "Atomic number (number of protons)",
          "Number of neutrons",
          "Density"
        ],
        correct: 1,
        explanation: "Henry Moseley established that atomic number (proton number) is the fundamental property of elements, resolving Mendeleev's periodic table anomalies."
      },
      {
        id: 8,
        unit: "Biology - Genetics",
        q: "What is the phenotypic ratio in the F₂ generation of Mendel's monohybrid cross of tall and dwarf garden peas?",
        options: [
          "1 : 2 : 1",
          "3 Tall : 1 Dwarf (75% : 25%)",
          "9 : 3 : 3 : 1",
          "100% Tall"
        ],
        correct: 1,
        explanation: "Phenotypic ratio is 3 Tall : 1 Dwarf. The genotypic ratio is 1 TT : 2 Tt : 1 tt."
      },
      {
        id: 9,
        unit: "Biology - Genetics",
        q: "In human sex determination, who is scientifically responsible for whether the baby is a boy or a girl?",
        options: [
          "The Mother (because she carries the baby for 9 months)",
          "The Father's sperm (which carries either an X or a Y chromosome)",
          "Both parents equally contribute the Y chromosome",
          "Environmental temperature"
        ],
        correct: 1,
        explanation: "Mothers always provide an X chromosome. The father's sperm has a 50% chance of carrying X (producing girl XX) or Y (producing boy XY)."
      },
      {
        id: 10,
        unit: "Biology - Circulatory System",
        q: "Which chamber of the human heart has the thickest and most muscular wall?",
        options: [
          "Right Atrium",
          "Right Ventricle",
          "Left Atrium",
          "Left Ventricle"
        ],
        correct: 3,
        explanation: "The Left Ventricle has the thickest muscular wall because it must generate high pressure to pump oxygenated blood through the aorta to the entire body."
      }
    ];

    this.render();
  }

  render() {
    if (!this.container) return;

    const totalAnswered = Object.keys(this.answered).length;
    let score = 0;
    Object.entries(this.answered).forEach(([qIdx, optIdx]) => {
      if (this.questions[qIdx].correct === optIdx) score++;
    });

    this.container.innerHTML = `
      <div class="lab-card">
        <div class="lab-header">
          <div>
            <h3>SEE Exam Science Mastery Quiz (एस.ई.ई. परीक्षा तयारी परीक्षा)</h3>
            <p class="lab-desc">10 High-Yield Questions covering Physics, Chemistry, Biology & Astronomy with instant explanations.</p>
          </div>
          <div class="quiz-score-badge">
            Score: ${score} / ${this.questions.length} (${totalAnswered} answered)
          </div>
        </div>

        <div class="quiz-list">
          ${this.questions.map((q, qIdx) => {
            const userChoice = this.answered[qIdx];
            const isAnswered = userChoice !== undefined;
            const isCorrect = isAnswered && userChoice === q.correct;

            return `
              <div class="quiz-item ${isAnswered ? (isCorrect ? 'correct-border' : 'wrong-border') : ''}">
                <div class="q-meta">
                  <span class="q-number">Question ${qIdx + 1}</span>
                  <span class="q-unit">${q.unit}</span>
                </div>
                <h4 class="q-text">${q.q}</h4>

                <div class="options-grid">
                  ${q.options.map((opt, optIdx) => {
                    let optClass = "quiz-opt";
                    if (isAnswered) {
                      if (optIdx === q.correct) optClass += " correct-opt";
                      else if (optIdx === userChoice) optClass += " wrong-opt";
                    }

                    return `
                      <button class="${optClass}" data-q="${qIdx}" data-opt="${optIdx}" ${isAnswered ? 'disabled' : ''}>
                        ${opt}
                      </button>
                    `;
                  }).join('')}
                </div>

                ${isAnswered ? `
                  <div class="explanation-box ${isCorrect ? 'correct-expl' : 'wrong-expl'}">
                    <strong>${isCorrect ? '✔ Correct Answer!' : '❌ Incorrect.'}</strong> ${q.explanation}
                  </div>
                ` : ''}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    const buttons = this.container.querySelectorAll('.quiz-opt');
    buttons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const qIdx = parseInt(e.target.dataset.q);
        const optIdx = parseInt(e.target.dataset.opt);
        this.answered[qIdx] = optIdx;
        this.render();
      });
    });
  }
}
