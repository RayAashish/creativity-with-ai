// SEE Science Numerical Problems Bank (कक्षा १० विज्ञान गणितीय समस्याहरू)
// Complete with Step-by-Step Solutions and Formula Calculators

export const NUMERICALS_BANK = [
  // ================= GRAVITATION NUMERICALS =================
  {
    id: "num-grav-1",
    unit: "force-motion",
    topic: "Newton's Gravitational Force",
    questionEn: "Calculate the gravitational force of attraction between two lead spheres of mass 50 kg and 80 kg placed with their centres 2 meters apart. (G = 6.67 × 10⁻¹¹ N·m²/kg²)",
    questionNp: "५० kg र ८० kg पिण्ड भएका दुई सिसाका गोलाहरूलाई तिनीहरूको केन्द्र बीच २ मिटरको दूरीमा राख्दा तिनीहरू बीच उत्पन्न हुने गुरुत्वाकर्षण बल गणना गर्नुहोस्।",
    given: {
      "m₁": "50 kg",
      "m₂": "80 kg",
      "d": "2 m",
      "G": "6.67 × 10⁻¹¹ N·m²/kg²"
    },
    formula: "F = \\frac{G \\cdot m_1 \\cdot m_2}{d^2}",
    steps: [
      "Formula: F = (G × m₁ × m₂) / d²",
      "Substitute values: F = (6.67 × 10⁻¹¹ × 50 × 80) / (2)²",
      "Numerator: 6.67 × 10⁻¹¹ × 4,000 = 2.668 × 10⁻⁷",
      "Denominator: 2² = 4",
      "Division: F = (2.668 × 10⁻⁷) / 4 = 6.67 × 10⁻⁸ N"
    ],
    answer: "6.67 × 10⁻⁸ N",
    calculationCode: (inputs) => {
      const m1 = inputs.m1 || 50;
      const m2 = inputs.m2 || 80;
      const d = inputs.d || 2;
      const G = 6.67e-11;
      const F = (G * m1 * m2) / (d * d);
      return { result: F.toExponential(4) + " N", steps: `F = (6.67e-11 × ${m1} × ${m2}) / (${d})² = ${F.toExponential(4)} N` };
    },
    defaultInputs: { m1: 50, m2: 80, d: 2 }
  },

  {
    id: "num-grav-2",
    unit: "force-motion",
    topic: "Acceleration due to Gravity on Moon",
    questionEn: "The mass of the Moon is 7.2 × 10²² kg and its radius is 1.7 × 10⁶ m. Calculate the acceleration due to gravity on the Moon's surface and find the weight of a 60 kg person on the Moon.",
    questionNp: "चन्द्रमाको पिण्ड ७.२ × १०²² kg र अर्धव्यास १.७ × १०⁶ m छ भने चन्द्रमाको सतहमा गुरुत्वप्रवेग र ६० kg पिण्ड भएको व्यक्तिको तौल पत्ता लगाउनुहोस्।",
    given: {
      "M": "7.2 × 10²² kg",
      "R": "1.7 × 10⁶ m",
      "G": "6.67 × 10⁻¹¹ N·m²/kg²",
      "m": "60 kg"
    },
    formula: "g = \\frac{GM}{R^2}, \\quad W = m \\cdot g",
    steps: [
      "Formula for g: g = (G × M) / R²",
      "Substitute: g = (6.67 × 10⁻¹¹ × 7.2 × 10²²) / (1.7 × 10⁶)²",
      "Numerator: 4.8024 × 10¹²",
      "Denominator: 2.89 × 10¹²",
      "g = 4.8024 / 2.89 = 1.66 m/s²",
      "Weight on Moon: W = m × g = 60 kg × 1.66 m/s² = 99.6 N (~100 N vs 588 N on Earth!)"
    ],
    answer: "g = 1.66 m/s², W = 99.6 N",
    calculationCode: (inputs) => {
      const M = inputs.M || 7.2e22;
      const R = inputs.R || 1.7e6;
      const m = inputs.m || 60;
      const G = 6.67e-11;
      const g = (G * M) / (R * R);
      const W = m * g;
      return { result: `g = ${g.toFixed(2)} m/s², W = ${W.toFixed(1)} N`, steps: `g = ${g.toFixed(2)} m/s²; Weight = ${m} × ${g.toFixed(2)} = ${W.toFixed(1)} N` };
    },
    defaultInputs: { M: 7.2e22, R: 1.7e6, m: 60 }
  },

  {
    id: "num-grav-3",
    unit: "force-motion",
    topic: "g at Mt. Everest Altitude",
    questionEn: "If acceleration due to gravity at sea level is 9.8 m/s² and Earth's radius is 6,400 km, calculate the acceleration due to gravity at the summit of Mt. Everest (height 8,848.86 m).",
    questionNp: "पृथ्वीको समुद्र सतहमा गुरुत्वप्रवेग ९.८ m/s² र अर्धव्यास ६४०० km भए सगरमाथाको चुचुरो (८८४८.८६ मिटर) मा गुरुत्वप्रवेग कति होला?",
    given: {
      "g": "9.8 m/s²",
      "R": "6,400,000 m",
      "h": "8,849 m"
    },
    formula: "g' = g \\left(\\frac{R}{R + h}\\right)^2",
    steps: [
      "Formula: g' = g × [R / (R + h)]²",
      "R + h = 6,400,000 + 8,849 = 6,408,849 m",
      "Ratio: 6,400,000 / 6,408,849 = 0.99862",
      "Square: (0.99862)² = 0.99724",
      "g' = 9.8 × 0.99724 = 9.77 m/s²"
    ],
    answer: "9.77 m/s²",
    calculationCode: (inputs) => {
      const g = inputs.g || 9.8;
      const R = inputs.R || 6400000;
      const h = inputs.h || 8849;
      const gPrime = g * Math.pow(R / (R + h), 2);
      return { result: `${gPrime.toFixed(3)} m/s²`, steps: `g' = 9.8 × (${R} / ${R + h})² = ${gPrime.toFixed(3)} m/s²` };
    },
    defaultInputs: { g: 9.8, R: 6400000, h: 8849 }
  },

  // ================= PRESSURE NUMERICALS =================
  {
    id: "num-pres-1",
    unit: "pressure",
    topic: "Pascal's Law Hydraulic Lift",
    questionEn: "In a car servicing garage hydraulic lift, the cross-sectional area of the narrow piston is 50 cm² and that of the wider piston is 2.5 m². What force must be exerted on the small piston to lift a car weighing 15,000 N?",
    questionNp: "कुनै ग्यारेजको हाइड्रोलिक लिफ्टको सानो पिस्टनको क्षेत्रफल ५० cm² र ठूलो पिस्टनको क्षेत्रफल २.५ m² छ। १५,००० N तौल भएको गाडी उचाल्न सानो पिस्टनमा कति बल लगाउनुपर्छ?",
    given: {
      "A₁": "50 cm² = 50 × 10⁻⁴ m² = 0.005 m²",
      "A₂": "2.5 m²",
      "F₂": "15,000 N"
    },
    formula: "\\frac{F_1}{A_1} = \\frac{F_2}{A_2} \\implies F_1 = F_2 \\times \\frac{A_1}{A_2}",
    steps: [
      "Convert units: A₁ = 50 / 10,000 = 0.005 m²",
      "Apply Pascal's formula: F₁ = F₂ × (A₁ / A₂)",
      "Substitute: F₁ = 15,000 × (0.005 / 2.5)",
      "F₁ = 15,000 × 0.002 = 30 N",
      "Remarkable: Just 30 N force (the weight of a 3 kg bag of rice!) can lift a 1,500 kg vehicle!"
    ],
    answer: "30 N",
    calculationCode: (inputs) => {
      const a1 = inputs.a1 || 0.005;
      const a2 = inputs.a2 || 2.5;
      const f2 = inputs.f2 || 15000;
      const f1 = f2 * (a1 / a2);
      return { result: `${f1.toFixed(1)} N`, steps: `F₁ = ${f2} × (${a1} / ${a2}) = ${f1.toFixed(1)} N` };
    },
    defaultInputs: { a1: 0.005, a2: 2.5, f2: 15000 }
  },

  {
    id: "num-pres-2",
    unit: "pressure",
    topic: "Archimedes' Upthrust & Apparent Weight",
    questionEn: "A stone of mass 5 kg and volume 0.002 m³ is completely immersed in water (density = 1000 kg/m³). Calculate: (i) Upthrust exerted by water, (ii) Apparent weight of stone in water. (g = 9.8 m/s²)",
    questionNp: "५ kg पिण्ड र ०.००२ m³ आयतन भएको ढुङ्गालाई पानीमा पूरै डुबाउँदा (पानीको घनत्व = १००० kg/m³): (क) पानीले दिने उर्ध्वचाप, (ख) पानीमा ढुङ्गाको आभासी तौल कति हुन्छ?",
    given: {
      "m": "5 kg",
      "V": "0.002 m³",
      "d": "1000 kg/m³",
      "g": "9.8 m/s²"
    },
    formula: "U = V \\cdot d \\cdot g, \\quad W' = W - U",
    steps: [
      "Weight in air W = m × g = 5 × 9.8 = 49 N",
      "Upthrust U = V × d × g = 0.002 × 1000 × 9.8 = 19.6 N",
      "Apparent weight in water W' = W - U = 49 - 19.6 = 29.4 N"
    ],
    answer: "Upthrust = 19.6 N, Apparent Weight = 29.4 N",
    calculationCode: (inputs) => {
      const m = inputs.m || 5;
      const V = inputs.V || 0.002;
      const d = inputs.d || 1000;
      const g = 9.8;
      const W = m * g;
      const U = V * d * g;
      const Wprime = W - U;
      return { result: `U = ${U.toFixed(1)} N, W' = ${Wprime.toFixed(1)} N`, steps: `W = ${W.toFixed(1)} N, U = ${U.toFixed(1)} N, W' = ${Wprime.toFixed(1)} N` };
    },
    defaultInputs: { m: 5, V: 0.002, d: 1000 }
  },

  // ================= HEAT & THERMODYNAMICS =================
  {
    id: "num-heat-1",
    unit: "energy-heat",
    topic: "Heat Equation & Specific Heat",
    questionEn: "How much heat energy is required to raise the temperature of 2 kg of pure water from 20°C to 100°C? (Specific heat capacity of water = 4,200 J/kg·°C)",
    questionNp: "२ kg शुद्ध पानीको तापक्रम २०°C बाट १००°C सम्म बढाउन कति ताप ऊर्जा चाहिन्छ? (पानीको विशिष्ट तापधारण क्षमता = ४२०० J/kg·°C)",
    given: {
      "m": "2 kg",
      "θ₁": "20°C",
      "θ₂": "100°C",
      "c": "4,200 J/kg·°C"
    },
    formula: "Q = m \\cdot c \\cdot \\Delta\\theta = m \\cdot c \\cdot (\\theta_2 - \\theta_1)",
    steps: [
      "Temperature difference: Δθ = 100 - 20 = 80°C",
      "Formula: Q = m × c × Δθ",
      "Substitute: Q = 2 × 4200 × 80",
      "Q = 672,000 Joules = 6.72 × 10⁵ J = 672 kJ"
    ],
    answer: "672,000 J (672 kJ)",
    calculationCode: (inputs) => {
      const m = inputs.m || 2;
      const t1 = inputs.t1 || 20;
      const t2 = inputs.t2 || 100;
      const c = inputs.c || 4200;
      const Q = m * c * (t2 - t1);
      return { result: `${(Q / 1000).toFixed(1)} kJ (${Q} J)`, steps: `Q = ${m} × ${c} × (${t2} - ${t1}) = ${Q} J` };
    },
    defaultInputs: { m: 2, t1: 20, t2: 100, c: 4200 }
  },

  // ================= LIGHT & OPTICS =================
  {
    id: "num-opt-1",
    unit: "light-optics",
    topic: "Convex Lens Formula & Magnification",
    questionEn: "An object of height 4 cm is placed at a distance of 30 cm in front of a convex lens of focal length 20 cm. Find the position, nature, and size of the image formed.",
    questionNp: "२० cm फोकल दूरी भएको उत्तल लेन्सको अगाडि ३० cm को दूरीमा ४ cm उचाइ भएको वस्तु राखिएको छ। बन्ने प्रतिबिम्बको स्थान, प्रकृति र आकार पत्ता लगाउनुहोस्।",
    given: {
      "u": "-30 cm (by sign convention)",
      "f": "+20 cm (convex lens)",
      "h_o": "4 cm"
    },
    formula: "\\frac{1}{f} = \\frac{1}{v} - \\frac{1}{u}, \\quad m = \\frac{v}{u} = \\frac{h_i}{h_o}",
    steps: [
      "Lens formula: 1/f = 1/v - 1/u → 1/v = 1/f + 1/u",
      "Substitute: 1/v = 1/20 + 1/(-30) = 1/20 - 1/30",
      "LCM of 20 and 30 is 60: 1/v = (3 - 2) / 60 = 1/60",
      "v = +60 cm (Positive sign indicates real and inverted image formed behind the lens)",
      "Magnification: m = v / u = 60 / (-30) = -2",
      "Image height: h_i = m × h_o = -2 × 4 = -8 cm (Inverted and doubled in height)"
    ],
    answer: "Position v = 60 cm, Real, Inverted, Height = 8 cm",
    calculationCode: (inputs) => {
      const u = inputs.u || -30;
      const f = inputs.f || 20;
      const ho = inputs.ho || 4;
      const invV = 1/f + 1/u;
      const v = 1 / invV;
      const m = v / Math.abs(u);
      const hi = m * ho;
      return { result: `v = ${v.toFixed(1)} cm, Magnification = ${m.toFixed(1)}x, Height = ${hi.toFixed(1)} cm`, steps: `1/v = 1/${f} + 1/(${u}) → v = ${v.toFixed(1)} cm` };
    },
    defaultInputs: { u: -30, f: 20, ho: 4 }
  },

  {
    id: "num-opt-2",
    unit: "light-optics",
    topic: "Power of Lens & Defect Correction",
    questionEn: "A student wears spectacles of power -2.5 D. (i) What type of eye defect does the student have? (ii) What is the focal length of the spectacle lens? (iii) What is the far point of the eye?",
    questionNp: "कुनै विद्यार्थीले -२.५ D सामर्थ्यको चस्मा प्रयोग गर्दछ। (क) उसलाई आँखाको कुन दोष भएको छ? (ख) लेन्सको फोकल दूरी कति हो? (ग) उसको आँखाको दूर बिन्दु कति हो?",
    given: {
      "P": "-2.5 Diopter"
    },
    formula: "P = \\frac{1}{f \\text{ (m)}} \\implies f = \\frac{1}{P}",
    steps: [
      "Sign of power is negative (-), hence the lens is a Concave lens.",
      "The eye defect corrected by concave lens is Myopia (Short-sightedness / अदूर दृष्टि).",
      "Focal length f = 1 / P = 1 / (-2.5) = -0.4 m = -40 cm.",
      "For a myopic eye corrected to see distant objects at infinity (u = ∞):",
      "1/f = 1/v - 1/u → 1/(-40) = 1/v - 0 → Far Point v = 40 cm.",
      "The student can only see clearly up to 40 cm without spectacles!"
    ],
    answer: "Defect: Myopia, Focal length = -40 cm, Far point = 40 cm",
    calculationCode: (inputs) => {
      const P = inputs.P || -2.5;
      const f_m = 1 / P;
      const f_cm = f_m * 100;
      return { result: `f = ${f_cm.toFixed(1)} cm (${f_m.toFixed(2)} m), Myopia`, steps: `f = 1 / ${P} = ${f_m.toFixed(2)} m = ${f_cm.toFixed(1)} cm` };
    },
    defaultInputs: { P: -2.5 }
  },

  // ================= ELECTRICITY & TRANSFORMER =================
  {
    id: "num-elec-1",
    unit: "electricity-magnetism",
    topic: "Transformer Turns & Voltage Ratio",
    questionEn: "A step-down transformer connected to a 220V AC domestic supply delivers 11V to charge a mobile phone. If the primary coil has 2,000 turns, calculate the number of turns in the secondary coil.",
    questionNp: "२२० V को मुख्य लाइनमा जोडिएको स्टेप-डाउन ट्रान्सफर्मरले मोबाइल चार्ज गर्न ११ V भोल्टेज दिन्छ। प्राथमिक कुण्डलीमा २००० फन्का भए दोस्रो कुण्डलीमा कति फन्का होलान्?",
    given: {
      "V_p": "220 V",
      "V_s": "11 V",
      "N_p": "2,000 turns"
    },
    formula: "\\frac{V_p}{V_s} = \\frac{N_p}{N_s} \\implies N_s = N_p \\times \\frac{V_s}{V_p}",
    steps: [
      "Formula: Vp / Vs = Np / Ns",
      "Rearrange: Ns = Np × (Vs / Vp)",
      "Substitute: Ns = 2000 × (11 / 220)",
      "Simplify ratio: 11 / 220 = 1 / 20",
      "Ns = 2000 / 20 = 100 turns."
    ],
    answer: "100 turns",
    calculationCode: (inputs) => {
      const vp = inputs.vp || 220;
      const vs = inputs.vs || 11;
      const np = inputs.np || 2000;
      const ns = (np * vs) / vp;
      return { result: `${Math.round(ns)} turns`, steps: `Ns = ${np} × (${vs} / ${vp}) = ${Math.round(ns)} turns` };
    },
    defaultInputs: { vp: 220, vs: 11, np: 2000 }
  },

  {
    id: "num-elec-2",
    unit: "electricity-magnetism",
    topic: "Domestic Power & NEA Electricity Bill",
    questionEn: "In a house in Kathmandu, five 15W LED bulbs run for 8 hours daily, a 150W refrigerator runs continuously (average 12 hours compressor active), and a 1200W electric induction cooker runs for 1.5 hours daily. Calculate: (i) Total units consumed in 30 days, (ii) Total cost if rate is Rs. 4/unit for first 20 units and Rs. 8.5/unit for units above 20.",
    questionNp: "काठमाडौँको एक घरमा १५ W का ५ वटा LED चिम दैनिक ८ घण्टा, १५० W को फ्रिज दैनिक १२ घण्टा र १२०० W को इन्डक्सन चुल्हो दैनिक १.५ घण्टा चल्दछ। ३० दिनमा खपत हुने विद्युत युनिट र महसुल गणना गर्नुहोस्।",
    given: {
      "LED": "5 × 15W × 8h",
      "Fridge": "1 × 150W × 12h",
      "Induction": "1 × 1200W × 1.5h",
      "Days": "30 days"
    },
    formula: "\\text{Daily Energy (Wh)} = \\sum (P \\times t), \\quad \\text{Units} = \\frac{\\text{Total Wh}}{1000}",
    steps: [
      "LED bulbs: 5 × 15 × 8 = 600 Wh",
      "Refrigerator: 150 × 12 = 1,800 Wh",
      "Induction Cooker: 1200 × 1.5 = 1,800 Wh",
      "Total daily energy = 600 + 1800 + 1800 = 4,200 Wh = 4.2 kWh (units/day)",
      "Monthly consumption (30 days) = 4.2 × 30 = 126 units (kWh)",
      "Billing calculation:",
      "First 20 units @ Rs. 4 = Rs. 80",
      "Remaining 106 units @ Rs. 8.5 = Rs. 901",
      "Total Monthly Electricity Bill = Rs. 80 + Rs. 901 = Rs. 981."
    ],
    answer: "126 units, Total Bill = Rs. 981",
    calculationCode: (inputs) => {
      const unitsPerDay = inputs.unitsPerDay || 4.2;
      const days = inputs.days || 30;
      const totalUnits = unitsPerDay * days;
      const cost20 = Math.min(totalUnits, 20) * 4;
      const costRem = Math.max(0, totalUnits - 20) * 8.5;
      const total = cost20 + costRem;
      return { result: `${totalUnits.toFixed(1)} units, Rs. ${total.toFixed(0)}`, steps: `Units = ${totalUnits.toFixed(1)}; Cost = Rs. ${total.toFixed(0)}` };
    },
    defaultInputs: { unitsPerDay: 4.2, days: 30 }
  }
];
