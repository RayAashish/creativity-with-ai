// Interactive 10-Question Comprehensive SEE Practice Quiz
import { UNITS_DATA } from '../../data/unitsData.js';

export const SEE_QUIZ_QUESTIONS = [
  {
    id: 1,
    unit: "force-motion",
    questionEn: "What is the numerical value and SI unit of the Universal Gravitational Constant (G)?",
    questionNp: "विश्वव्यापी गुरुत्वाकर्षण स्थिर अङ्क (G) को मान र SI एकाइ कुन हो?",
    options: [
      "6.67 × 10⁻¹¹ N·m²/kg²",
      "9.8 m/s²",
      "6.67 × 10⁻¹¹ N/kg",
      "6 × 10²⁴ kg"
    ],
    correct: 0,
    explanationEn: "G was measured by Henry Cavendish in 1798 using a quartz torsion balance. Its universal value is 6.674 × 10⁻¹¹ N·m²/kg².",
    explanationNp: "हेनरी क्याभेन्डिसले १७९८ मा टर्सन ब्यालेन्स प्रयोग गरी G को मान ६.६७ × १०⁻¹¹ N·m²/kg² पत्ता लगाएका थिए।"
  },
  {
    id: 2,
    unit: "pressure",
    questionEn: "Why does a hydrometer sink deeper in kerosene (density 800 kg/m³) than in pure water (1000 kg/m³)?",
    questionNp: "हाइड्रोमिटर शुद्ध पानीभन्दा मट्टीतेलमा किन धेरै गहिरो डुब्छ?",
    options: [
      "Because kerosene has lower density so greater volume must be displaced to balance its weight",
      "Because kerosene is warmer than water",
      "Because water exerts zero upthrust",
      "Because hydrometer reacts chemically with kerosene"
    ],
    correct: 0,
    explanationEn: "By the Law of Floatation, Weight of floating body = Weight of displaced liquid (V × d × g). Since kerosene has a lower density (800 vs 1000 kg/m³), the hydrometer must displace a larger volume of kerosene, sinking deeper.",
    explanationNp: "मट्टीतेलको घनत्व पानीभन्दा कम भएकाले आफ्नो तौल बराबरको उर्ध्वचाप पाउन यसले धेरै आयतन विस्थापित गर्नुपर्छ, त्यसैले धेरै डुब्छ।"
  },
  {
    id: 3,
    unit: "energy-heat",
    questionEn: "At what temperature does pure water possess its maximum density and minimum volume?",
    questionNp: "कति तापक्रममा शुद्ध पानीको घनत्व अधिकतम र आयतन न्यूनतम हुन्छ?",
    options: [
      "4 °C",
      "0 °C",
      "-4 °C",
      "100 °C"
    ],
    correct: 0,
    explanationEn: "Due to anomalous expansion of water, between 0°C and 4°C water contracts. At 4°C its density reaches maximum (1000 kg/m³).",
    explanationNp: "पानीको असामान्य प्रसारका कारण ०°C बाट ४°C सम्म तताउँदा पानी खुम्चिन्छ र ४°C मा यसको घनत्व सबैभन्दा बढी (१००० kg/m³) हुन्छ।"
  },
  {
    id: 4,
    unit: "light-optics",
    questionEn: "A person with Myopia (short-sightedness) cannot see distant objects clearly. Which spectacle lens corrects this defect?",
    questionNp: "अदूर दृष्टि (Myopia) भएको व्यक्तिका लागि कुन लेन्स भएको चस्मा उपयुक्त हुन्छ?",
    options: [
      "Concave Lens (अवतल लेन्स - Negative Diopter)",
      "Convex Lens (उत्तल लेन्स - Positive Diopter)",
      "Bifocal Lens",
      "Cylindrical Lens"
    ],
    correct: 0,
    explanationEn: "In Myopia, light rays converge in front of the retina. A diverging (concave) lens spreads the light rays outwards so that they focus precisely on the retina.",
    explanationNp: "अदूर दृष्टिमा प्रकाशका किरणहरू रेटिनाभन्दा अगाडि नै जोडिन्छन्। अवतल लेन्सले किरणहरूलाई फैलाएर रेटिनामा केन्द्रित गराउँछ।"
  },
  {
    id: 5,
    unit: "electricity-magnetism",
    questionEn: "Why is the soft iron core of an electrical transformer laminated into thin sheets insulated by varnish?",
    questionNp: "ट्रान्सफर्मरको सफ्ट आइरन कोरलाई किन पातला पाताहरूमा लेमिनेसन गरिन्छ?",
    options: [
      "To reduce energy loss in the form of heat caused by eddy currents",
      "To increase mechanical weight",
      "To convert AC into DC",
      "To make the transformer waterproof"
    ],
    correct: 0,
    explanationEn: "Alternating magnetic flux induces circulating currents (eddy currents) in the iron core, causing heating loss. Laminating the core breaks these circulating paths, minimizing energy loss.",
    explanationNp: "फलामको कोरमा भँवर करेन्ट (Eddy currents) उत्पन्न भई ताप ऊर्जा खेर जानबाट रोक्न कोरलाई लेमिनेसन गरिन्छ।"
  },
  {
    id: 6,
    unit: "periodic-classification",
    questionEn: "What is the basis of Moseley's Modern Periodic Law?",
    questionNp: "आधुनिक आवर्त नियम कुन कुरामा आधारित छ?",
    options: [
      "Atomic Number (पारमाणविक सङ्ख्या - Number of protons)",
      "Atomic Mass (पारमाणविक पिण्ड)",
      "Valency only",
      "Physical density"
    ],
    correct: 0,
    explanationEn: "Henry Moseley discovered that physical and chemical properties of elements are periodic functions of their Atomic Numbers (Z), which cured all flaws in Mendeleev's mass-based table.",
    explanationNp: "मोज्लेको आधुनिक आवर्त नियमअनुसार तत्वहरूका गुणहरू तिनीहरूको पारमाणविक सङ्ख्याका आवर्त स्वरूप हुन्छन्।"
  },
  {
    id: 7,
    unit: "industrial-gases",
    questionEn: "During laboratory preparation of Ammonia (NH₃), why must the hard glass test tube mouth be tilted downward?",
    questionNp: "एमोनिया ग्यास बनाउँदा टेस्टट्युबको मुख किन तलतिर ढल्काइन्छ?",
    options: [
      "To prevent water droplets from trickling back into the hot test tube and breaking it",
      "To allow heat to escape faster",
      "To make ammonia gas heavier",
      "To prevent atmospheric oxygen from entering"
    ],
    correct: 0,
    explanationEn: "The chemical reaction produces water vapor (2NH₄Cl + Ca(OH)₂ → CaCl₂ + 2H₂O + 2NH₃). If the tube were erect, steam would condense and drip back onto the red-hot glass bottom, cracking it instantly.",
    explanationNp: "प्रतिक्रियामा बन्ने पानीको बाफ चिसो भएर थोपा बनी तातो टेस्टट्युबको फेदमा फर्किएर फुट्न नदिन टेस्टट्युबको मुख तलतिर ढल्काइन्छ।"
  },
  {
    id: 8,
    unit: "heredity-genetics",
    questionEn: "In Mendel's monohybrid cross of pea plants (TT × tt), what is the phenotypic ratio in the F₂ generation?",
    questionNp: "मेन्डेलको केराउको एकजोडी गुण संकरणमा F₂ वंशको स्वरुप अनुपात (Phenotypic Ratio) कति हुन्छ?",
    options: [
      "3 Tall : 1 Dwarf (३ अग्लो : १ पुड्को)",
      "1 Tall : 2 Medium : 1 Dwarf",
      "9 : 3 : 3 : 1",
      "1 : 1"
    ],
    correct: 0,
    explanationEn: "In the F₂ generation, genotypes are 1 TT, 2 Tt, and 1 tt. Because T is dominant, TT and Tt both appear Tall, yielding a 3:1 phenotypic ratio (75% Tall : 25% Dwarf).",
    explanationNp: "F₂ वंशमा जिन १ TT, २ Tt र १ tt हुन्छ। T प्रबल भएकाले ३ वटा अग्लो र १ वटा पुड्को बन्दछ (३:१ अनुपात)।"
  },
  {
    id: 9,
    unit: "blood-circulation",
    questionEn: "Which chamber of the human heart has the thickest muscular wall, and why?",
    questionNp: "मानव मुटुको कुन कोठाको भित्ता सबैभन्दा बाक्लो हुन्छ र किन?",
    options: [
      "Left Ventricle, because it pumps blood with high pressure to the entire body",
      "Right Ventricle, because it holds cold blood",
      "Right Atrium, because it receives vena cava",
      "Left Atrium, because it connects to lungs"
    ],
    correct: 0,
    explanationEn: "The Left Ventricle has the thickest muscular myocardium because it must generate high systemic pressure (120 mmHg) to pump blood through the aorta across the entire body.",
    explanationNp: "बायाँ भेन्ट्रिकलले महाधमनी (Aorta) मार्फत उच्च चापमा टाउकोदेखि खुट्टासम्म रगत पम्प गर्नुपर्ने भएकाले यसको मांसपेशीको भित्ता सबैभन्दा बाक्लो हुन्छ।"
  },
  {
    id: 10,
    unit: "earth-geology",
    questionEn: "Why is Nepal situated in a high-seismic active earthquake zone?",
    questionNp: "नेपाल उच्च भूकम्पीय जोखिम क्षेत्रमा पर्नुको मुख्य कारण के हो?",
    options: [
      "Due to collision of Indian plate subducting beneath Eurasian plate",
      "Due to volcanic eruptions in the Himalayas",
      "Due to melting glaciers",
      "Due to high atmospheric pressure"
    ],
    correct: 0,
    explanationEn: "The Indian tectonic plate continuously pushes northward into the Eurasian plate at ~4-5 cm/year, building immense stress along the Himalayan Main Frontal Thrust fault line.",
    explanationNp: "भारतीय टेक्टोनिक प्लेट वार्षिक करिब ४-५ सेमीका दरले उत्तरतर्फ सर्दै युरेसियन प्लेट मुनि घस्रने क्रममा उत्पन्न हुने अत्यधिक चापका कारण नेपाल उच्च भूकम्पीय क्षेत्रमा पर्दछ।"
  }
];

export function renderQuiz(container, lang = 'en') {
  let score = 0;
  let answered = {};

  container.innerHTML = `
    <div class="sim-card">
      <div class="sim-header">
        <div class="sim-badge">SEE BOARD PRACTICE // परीक्षा तयारी</div>
        <h2 class="sim-title">${lang === 'np' ? 'SEE विज्ञान नमुना परीक्षा प्रश्नोत्तर (१० अंक)' : 'SEE Science High-Yield Board Exam Quiz'}</h2>
        <p class="sim-desc">
          ${lang === 'np'
            ? 'विगत वर्षका SEE परीक्षामा बारम्बार सोधिने महत्वपूर्ण १० वस्तुगत प्रश्नहरूको अभ्यास गर्नुहोस्।'
            : 'Test your understanding with 10 high-yield questions curated directly from CDC Nepal Board papers. Instant feedback and explanations provided!'}
        </p>
      </div>

      <div class="quiz-score-header">
        <span class="telemetry-label">Score:</span>
        <span id="quiz-live-score" class="telemetry-value" style="color: #10b981;">0 / ${SEE_QUIZ_QUESTIONS.length}</span>
      </div>

      <div class="quiz-questions-list">
        ${SEE_QUIZ_QUESTIONS.map((q, idx) => `
          <div class="quiz-card" id="qcard-${q.id}">
            <div class="quiz-q-num">Question ${idx + 1} of ${SEE_QUIZ_QUESTIONS.length}</div>
            <h3 class="quiz-q-text-en">${q.questionEn}</h3>
            <h4 class="quiz-q-text-np text-muted">${q.questionNp}</h4>

            <div class="quiz-options-grid">
              ${q.options.map((opt, optIdx) => `
                <button class="quiz-opt-btn" data-qid="${q.id}" data-opt="${optIdx}">
                  <span class="opt-alpha">${['A', 'B', 'C', 'D'][optIdx]}</span>
                  <span class="opt-label">${opt}</span>
                </button>
              `).join('')}
            </div>

            <div id="quiz-fb-${q.id}" class="quiz-feedback" style="display: none;"></div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  const scoreDisplay = container.querySelector('#quiz-live-score');
  const optButtons = container.querySelectorAll('.quiz-opt-btn');

  optButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const qid = parseInt(btn.dataset.qid);
      const optIdx = parseInt(btn.dataset.opt);
      const q = SEE_QUIZ_QUESTIONS.find(item => item.id === qid);

      if (answered[qid] !== undefined) return; // already answered
      answered[qid] = optIdx;

      const qCard = container.querySelector(`#qcard-${qid}`);
      const fbBox = container.querySelector(`#quiz-fb-${qid}`);
      const allQBtns = qCard.querySelectorAll('.quiz-opt-btn');

      if (optIdx === q.correct) {
        score++;
        btn.classList.add('correct');
        fbBox.className = 'quiz-feedback correct';
        fbBox.innerHTML = `
          <strong>✔ Correct! / सही उत्तर!</strong>
          <p>${lang === 'np' ? q.explanationNp : q.explanationEn}</p>
        `;
      } else {
        btn.classList.add('wrong');
        allQBtns[q.correct].classList.add('correct');
        fbBox.className = 'quiz-feedback wrong';
        fbBox.innerHTML = `
          <strong>✖ Incorrect! / गलत उत्तर!</strong>
          <p>${lang === 'np' ? q.explanationNp : q.explanationEn}</p>
        `;
      }

      fbBox.style.display = 'block';
      scoreDisplay.textContent = `${score} / ${SEE_QUIZ_QUESTIONS.length}`;
    });
  });
}
