// CDC Nepal Class 10 Science & Technology Syllabus - Comprehensive Database
// Bilingual (English & Nepali) - Theory, Formulas, Experiments, Misconceptions & SEE Model Questions

export const UNITS_DATA = [
  // =================== PHYSICS (भौतिक विज्ञान) ===================
  {
    id: "force-motion",
    unitNumber: 1,
    subject: "physics",
    titleEn: "Force, Gravitation & Motion",
    titleNp: "बल, गुरुत्वाकर्षण र गति",
    curriculumMarks: 8,
    overviewEn: "Covers Newton's Universal Law of Gravitation, the Universal Gravitational Constant (G), acceleration due to gravity (g) and its variations, mass vs weight, free fall, and weightlessness.",
    overviewNp: "न्युटनको विश्वव्यापी गुरुत्वाकर्षणको नियम, गुरुत्वाकर्षण स्थिर अङ्क (G), गुरुत्वप्रवेग (g) र यसमा आउने परिवर्तनहरू, पिण्ड र तौल, स्वतन्त्र खसाइ तथा तौलविहीनता।",
    keyConcepts: [
      {
        conceptEn: "Newton's Law of Gravitation",
        conceptNp: "न्युटनको गुरुत्वाकर्षणसम्बन्धी नियम",
        defEn: "Every particle in the universe attracts every other particle with a force directly proportional to the product of their masses and inversely proportional to the square of the distance between their centres.",
        defNp: "ब्रह्माण्डमा रहेका कुनै दुई पिण्डहरू बीच लाग्ने आकर्षण बल तिनीहरूको पिण्डको गुणनफलसँग समानुपातिक र तिनीहरूको केन्द्र बीचको दूरीको वर्गसँग व्युत्क्रमानुपातिक हुन्छ।",
        formula: "F = G \\frac{m_1 m_2}{d^2}",
        variables: [
          { symbol: "F", name: "Gravitational force (गुरुत्वाकर्षण बल)", unit: "Newton (N)" },
          { symbol: "G", name: "Universal Gravitational Constant (गुरुत्वाकर्षण स्थिर अङ्क)", unit: "N·m²/kg²", value: "6.67 × 10⁻¹¹" },
          { symbol: "m₁, m₂", name: "Masses of objects (पिण्डहरू)", unit: "Kilogram (kg)" },
          { symbol: "d", name: "Distance between centers (केन्द्रहरू बीचको दूरी)", unit: "Meter (m)" }
        ]
      },
      {
        conceptEn: "Universal Gravitational Constant (G)",
        conceptNp: "विश्वव्यापी गुरुत्वाकर्षण स्थिर अङ्क (G)",
        defEn: "The force of attraction between two unit masses (1 kg each) placed at a unit distance (1 meter) apart from their centres. Its value is 6.67 × 10⁻¹¹ N·m²/kg² everywhere in the universe.",
        defNp: "१ मिटरको दूरीमा राखिएका १/१ किलोग्राम पिण्ड भएका दुई वस्तुहरू बीच उत्पन्न हुने गुरुत्वाकर्षण बलको मानलाई G भनिन्छ। यसको मान ६.६७ × १०⁻¹¹ N·m²/kg² हुन्छ।",
        formula: "G = \\frac{F \\cdot d^2}{m_1 \\cdot m_2}",
        unit: "N·m²/kg² or m³/(kg·s²)"
      },
      {
        conceptEn: "Acceleration due to Gravity (g)",
        conceptNp: "गुरुत्वप्रवेग (g)",
        defEn: "The uniform acceleration produced in a freely falling body towards the centre of a planet due to gravity. Average value on Earth is 9.8 m/s².",
        defNp: "गुरुत्वबलका कारण स्वतन्त्र रूपमा खसिरहेको वस्तुमा उत्पन्न हुने प्रवेगलाई गुरुत्वप्रवेग भनिन्छ। पृथ्वीको सतहमा यसको औसत मान ९.८ m/s² हुन्छ।",
        formula: "g = \\frac{GM}{R^2}",
        variations: [
          "At Earth's Poles (ध्रुवमा): R is minimum (~6,357 km) → g is maximum (~9.83 m/s²)",
          "At Earth's Equator (भूमध्यरेखामा): R is maximum (~6,378 km) → g is minimum (~9.78 m/s²)",
          "At Height h (उचाइमा): g' = GM / (R + h)² → g decreases with altitude (e.g. Mt. Everest summit g ≈ 9.77 m/s²)",
          "At Depth d (गहिराइमा): g decreases linearly towards centre of Earth where g = 0"
        ]
      },
      {
        conceptEn: "Free Fall & Weightlessness",
        conceptNp: "स्वतन्त्र खसाइ र तौलविहीनता",
        defEn: "Free fall occurs when a body falls under the sole influence of gravity with zero air resistance (acceleration = g). Weightlessness occurs when effective reaction force on the body is zero (apparent weight = 0).",
        defNp: "हावाको अवरोध बिना केवल गुरुत्वबलको प्रभावमा मात्र कुनै वस्तु खसिरहेको अवस्थालाई स्वतन्त्र खसाइ भनिन्छ। वस्तुको आभासी तौल शून्य भएको अवस्थालाई तौलविहीनता भनिन्छ।"
      }
    ],
    practicalExperiments: [
      {
        titleEn: "Henry Cavendish Torsion Balance Simulation",
        titleNp: "हेनरी क्याभेन्डिसको टर्सन ब्यालेन्स प्रयोग",
        apparatus: "Light quartz fiber, mirror, light source, light scale, two small lead spheres (m = 730g), two large lead spheres (M = 158kg).",
        procedure: [
          "Suspend the light dumbbell with two small lead spheres using a very fine quartz torsion wire.",
          "Place two large heavy lead spheres near the small spheres on opposite sides.",
          "Observe the minute gravitational torque twisting the wire.",
          "Direct a beam of light at the suspended mirror and measure the reflected angle on a calibrated scale.",
          "Calculate G using wire's torsion constant and deflection angle: G = 6.67 × 10⁻¹¹ N·m²/kg²."
        ]
      },
      {
        titleEn: "Guinea-and-Feather Tube (Free Fall in Vacuum)",
        titleNp: "गिनी र प्वाँखको नली प्रयोग (शून्यमा स्वतन्त्र खसाइ)",
        apparatus: "Long evacuated glass tube (1.5m), vacuum pump, stopcock, coin, feather.",
        procedure: [
          "In air: Invert the tube and observe coin reaches bottom much faster than feather due to air resistance.",
          "Evacuate air using a vacuum pump until pressure drops below 10⁻³ atm.",
          "Invert the tube again: Both coin and feather strike the bottom at the exact same instant.",
          "Conclusion: Acceleration due to gravity is independent of the falling object's mass."
        ]
      }
    ],
    commonMisconceptions: [
      {
        myth: "Heavy objects fall faster than light objects under gravity.",
        fact: "In vacuum, all objects fall with the exact same acceleration (g = 9.8 m/s²). Differences in air are purely due to aerodynamic drag (surface area to mass ratio).",
        examTip: "In SEE, always state: 'In the absence of air resistance, acceleration due to gravity is independent of mass (g = GM/R²)'."
      },
      {
        myth: "G and g are the same thing.",
        fact: "G is a universal scalar constant (6.67 × 10⁻¹¹ N·m²/kg²) identical across the universe. g is a local vector quantity (acceleration, ~9.8 m/s²) that changes with planet, altitude, and latitude."
      },
      {
        myth: "There is zero gravity inside the International Space Station (ISS).",
        fact: "Gravity at ISS altitude (~400 km) is still ~89% of Earth's surface (g ≈ 8.7 m/s²). Astronauts float because both the station and astronauts are in continuous free fall in orbit."
      }
    ],
    seeQuestions: [
      {
        group: "A",
        marks: 1,
        question: "State the SI unit and value of Universal Gravitational Constant (G).",
        answer: "Value: 6.67 × 10⁻¹¹ N·m²/kg² (or m³/(kg·s²)). SI Unit: N·m²/kg²."
      },
      {
        group: "B",
        marks: 2,
        question: "Why does the value of acceleration due to gravity (g) vary from place to place on Earth's surface?",
        answer: "Earth is not a perfect sphere but an oblate spheroid flattened at poles and bulged at the equator. Since g = GM/R², g is inversely proportional to R². Polar radius (Rp) is less than equatorial radius (Re), so g at poles (9.83 m/s²) is greater than at the equator (9.78 m/s²)."
      },
      {
        group: "C",
        marks: 3,
        question: "Prove that a body in free fall experiences apparent weightlessness.",
        answer: "Apparent weight R = m(g - a). In free fall, acceleration a = g. Therefore, R = m(g - g) = 0 N. Hence, a freely falling body exerts no reaction force and feels completely weightless."
      },
      {
        group: "D",
        marks: 4,
        question: "A mass of 80 kg is taken from Earth's surface to the summit of Mt. Everest (height 8,848.86 m). Given Earth's mass M = 6 × 10²⁴ kg and radius R = 6,400 km, calculate: (i) acceleration due to gravity at the summit, (ii) weight of the mass at the summit.",
        solution: "R = 6,400,000 m, h = 8,849 m → R + h = 6,408,849 m.\ng' = GM / (R + h)² = (6.67 × 10⁻¹¹ × 6 × 10²⁴) / (6,408,849)² ≈ 9.74 m/s².\nWeight W' = m × g' = 80 kg × 9.74 m/s² = 779.2 N."
      }
    ]
  },

  {
    id: "pressure",
    unitNumber: 2,
    subject: "physics",
    titleEn: "Pressure & Fluid Mechanics",
    titleNp: "चाप र तरल पदार्थको यान्त्रिकी",
    curriculumMarks: 7,
    overviewEn: "Covers liquid pressure (P = hdg), Pascal's Law and hydraulic machines, Archimedes' Principle, Upthrust, Law of Floatation, Atmospheric Pressure, and barometers.",
    overviewNp: "तरल पदार्थको चाप (P = hdg), पास्कलको नियम र हाइड्रोेलिक मेसिनहरू, आर्किमिडिजको सिद्धान्त, उर्ध्वचाप, तैरने नियम, वायुमण्डलीय चाप र ब्यारोमिटर।",
    keyConcepts: [
      {
        conceptEn: "Liquid Pressure",
        conceptNp: "तरल पदार्थको चाप",
        defEn: "The perpendicular force exerted by a liquid per unit area of the surface in contact.",
        formula: "P = h \\cdot d \\cdot g",
        variables: [
          { symbol: "P", name: "Liquid pressure", unit: "Pascal (Pa or N/m²)" },
          { symbol: "h", name: "Depth of liquid column (गहिराइ)", unit: "m" },
          { symbol: "d", name: "Density of liquid (घनत्व)", unit: "kg/m³" },
          { symbol: "g", name: "Acceleration due to gravity", unit: "m/s²" }
        ]
      },
      {
        conceptEn: "Pascal's Law",
        conceptNp: "पास्कलको नियम",
        defEn: "When pressure is applied to an enclosed liquid at rest, it is transmitted equally and undiminished in all directions throughout the liquid.",
        defNp: "कुनै बन्द भाँडोमा रहेको तरल पदार्थमा बाहिरबाट चाप दिइयो भने त्यो चाप सबै दिशामा समान रूपले लम्ब भएर प्रसारण हुन्छ।",
        formula: "\\frac{F_1}{A_1} = \\frac{F_2}{A_2} \\implies F_2 = F_1 \\cdot \\frac{A_2}{A_1}",
        applications: ["Hydraulic Press (हाइड्रोलिक प्रेस)", "Hydraulic Lift (ग्यारेज लिफ्ट)", "Hydraulic Brakes in automobiles"]
      },
      {
        conceptEn: "Archimedes' Principle & Upthrust",
        conceptNp: "आर्किमिडिजको सिद्धान्त र उर्ध्वचाप",
        defEn: "When a body is wholly or partially immersed in a fluid at rest, it experiences an upward force (upthrust) equal to the weight of the fluid displaced by it.",
        defNp: "कुनै वस्तुलाई तरल पदार्थमा पूरै वा आंशिक रूपमा डुबाउँदा, त्यस वस्तुले विस्थापित गरेको तरलको तौल बराबरको उर्ध्वचाप अनुभव गर्दछ।",
        formula: "U = V \\cdot d \\cdot g = W_{\\text{displaced fluid}}",
        apparentWeight: "W' = W_{\\text{air}} - U"
      },
      {
        conceptEn: "Law of Floatation",
        conceptNp: "तैरने नियम",
        defEn: "A floating body displaces liquid equal to its own weight. Weight of floating body = Weight of displaced liquid.",
        conditions: [
          "If d_body > d_liquid: Body sinks to bottom (e.g. Iron nail in water).",
          "If d_body = d_liquid: Body floats fully submerged.",
          "If d_body < d_liquid: Body floats partially submerged (e.g. Ice d=920 in water d=1000 floats with 92% submerged, 8% above surface)."
        ]
      }
    ],
    practicalExperiments: [
      {
        titleEn: "Verification of Archimedes' Principle with Eureka Can",
        titleNp: "युरेका क्यानद्वारा आर्किमिडिजको सिद्धान्त प्रमाणीकरण",
        apparatus: "Spring balance, Eureka can (overflow can), measuring cylinder, stone, water.",
        procedure: [
          "Weigh the dry stone in air using spring balance (e.g., W₁ = 2.5 N).",
          "Fill Eureka can with water up to spout until excess drips out.",
          "Place dry empty measuring cylinder under spout.",
          "Slowly lower stone into water and note apparent weight (e.g., W₂ = 1.7 N).",
          "Calculate Upthrust U = W₁ - W₂ = 2.5 - 1.7 = 0.8 N.",
          "Weigh displaced water: Volume V = 80 mL = 80 cm³, mass = 0.08 kg, Weight = 0.08 × 9.8 ≈ 0.8 N.",
          "Conclusion: Upthrust equals the weight of displaced water (Archimedes' Principle verified)."
        ]
      }
    ],
    seeQuestions: [
      {
        group: "B",
        marks: 2,
        question: "Why does an iron nail sink in water but a massive ship made of iron floats?",
        answer: "An iron nail has density (7,870 kg/m³) greater than water (1,000 kg/m³), and displaces very little water so upthrust is less than its weight. A ship is hollow with vast enclosed air volume, making its average density much less than water. It displaces water equal to its enormous weight and satisfies the Law of Floatation."
      },
      {
        group: "D",
        marks: 4,
        question: "In a hydraulic lift, the area of small piston is 0.02 m² and large piston is 1.5 m². What force must be applied to the small piston to lift a truck of mass 3,000 kg? (g = 9.8 m/s²)",
        solution: "Weight of truck F₂ = m × g = 3,000 × 9.8 = 29,400 N.\nBy Pascal's law: F₁ / A₁ = F₂ / A₂\nF₁ = F₂ × (A₁ / A₂) = 29,400 × (0.02 / 1.5) = 392 N.\nInput force required is only 392 N (~40 kg weight) to lift a 3,000 kg truck!"
      }
    ]
  },

  {
    id: "energy-heat",
    unitNumber: 3,
    subject: "physics",
    titleEn: "Energy, Heat & Thermodynamics",
    titleNp: "ऊर्जा, ताप र तापगतिकी",
    curriculumMarks: 6,
    overviewEn: "Sources of energy, hydropower potential of Nepal, Heat vs Temperature, Specific Heat Capacity (Q = mcΔθ), Anomalous expansion of water, and Calorimetry.",
    overviewNp: "ऊर्जाका स्रोतहरू, नेपालको जलविद्युत सम्भावना, ताप र तापक्रम, विशिष्ट तापधारण क्षमता (Q = mcΔθ), पानीको असामान्य प्रसार र क्यालोरीमिति।",
    keyConcepts: [
      {
        conceptEn: "Hydropower in Nepal",
        conceptNp: "नेपालको जलविद्युत",
        defEn: "Theoretical potential: ~83,000 MW; Economically feasible potential: ~42,000 MW across Karnali, Koshi, Gandaki, and Mahakali river basins.",
        formula: "P_{\\text{hydro}} = \\eta \\cdot \\rho \\cdot g \\cdot Q \\cdot H"
      },
      {
        conceptEn: "Specific Heat Capacity (s or c)",
        conceptNp: "विशिष्ट तापधारण क्षमता",
        defEn: "Amount of heat required to raise the temperature of 1 kg mass of a substance by 1°C (or 1 K).",
        formula: "Q = m \\cdot c \\cdot \\Delta\\theta \\implies c = \\frac{Q}{m \\cdot \\Delta\\theta}",
        unit: "J/(kg·°C) or J/(kg·K)",
        highValueExample: "Water has very high specific heat capacity (4,200 J/kg·°C). Used in hot water bags for fermentation and car radiators as coolant."
      },
      {
        conceptEn: "Anomalous Expansion of Water",
        conceptNp: "पानीको असामान्य प्रसार",
        defEn: "When water is heated from 0°C to 4°C, it contracts instead of expanding, and its volume decreases while density increases. At 4°C, water has maximum density (1,000 kg/m³) and minimum volume.",
        biologicalImportance: "In cold Himalayan winters, lakes freeze from the top down. 4°C dense water sinks to the bottom, allowing fish and aquatic organisms to survive under surface ice."
      }
    ],
    seeQuestions: [
      {
        group: "B",
        marks: 2,
        question: "Why is water used as a coolant in car engines and in hot water bags for healing?",
        answer: "Water has an exceptionally high specific heat capacity (4,200 J/(kg·°C)). It can absorb large quantities of heat with minimal temperature rise (ideal coolant), and retains heat for a long time when cooling down (ideal for hot water fermentation)."
      }
    ]
  },

  {
    id: "light-optics",
    unitNumber: 4,
    subject: "physics",
    titleEn: "Light, Refraction & Human Eye",
    titleNp: "प्रकाश, अपवर्तन र मानव आँखा",
    curriculumMarks: 7,
    overviewEn: "Refraction of light, Snell's Law, Total Internal Reflection, Convex and Concave lenses, Ray tracing, Lens formula, Power of lens, Human eye defects (Myopia & Hypermetropia) and optical instruments.",
    overviewNp: "प्रकाशको अपवर्तन, स्नेलको नियम, पूर्ण आन्तरिक परावर्तन, उत्तल र अवतल लेन्स, किरण रेखाचित्र, लेन्सको सामर्थ्य, आँखाका दोषहरू (दूरी दृष्टि र अदूर दृष्टि) र चस्माद्वारा उपचार।",
    keyConcepts: [
      {
        conceptEn: "Laws of Refraction & Snell's Law",
        conceptNp: "अपवर्तनका नियमहरू र स्नेलको नियम",
        defEn: "Ratio of sine of angle of incidence to sine of angle of refraction is constant for a given pair of media.",
        formula: "\\mu = \\frac{\\sin i}{\\sin r} = \\frac{v_1}{v_2} = \\frac{\\text{Real Depth}}{\\text{Apparent Depth}}"
      },
      {
        conceptEn: "Lens Power & Lens Formula",
        conceptNp: "लेन्सको सामर्थ्य र सूत्र",
        formula: "P = \\frac{1}{f \\text{ (in meters)}} = \\frac{100}{f \\text{ (in cm)}}",
        lensFormula: "\\frac{1}{f} = \\frac{1}{v} - \\frac{1}{u}",
        unit: "Diopter (D). Convex lens: +D; Concave lens: -D."
      },
      {
        conceptEn: "Defects of Vision & Spectacle Correction",
        conceptNp: "दृष्टिका दोषहरू र चस्माद्वारा उपचार",
        defEn: "Myopia (Short-sightedness): Eyeball too long or lens too curved; distant light focuses in front of retina. Corrected with Concave (diverging) lens.\nHypermetropia (Long-sightedness): Eyeball too short or lens too flat; nearby light focuses behind retina. Corrected with Convex (converging) lens."
      }
    ],
    seeQuestions: [
      {
        group: "C",
        marks: 3,
        question: "A person cannot see objects clearly beyond 1.5 m. Identify the defect of vision and calculate the power of lens required to correct it.",
        solution: "Defect: Myopia (Short-sightedness).\nFor correcting lens: object distance u = ∞, image distance v = -1.5 m (virtual image).\n1/f = 1/v - 1/u = 1/(-1.5) - 1/∞ = -1/1.5\nf = -1.5 m (Concave lens).\nPower P = 1/f = 1/(-1.5) = -0.67 Diopter."
      }
    ]
  },

  {
    id: "electricity-magnetism",
    unitNumber: 5,
    subject: "physics",
    titleEn: "Current Electricity & Magnetism",
    titleNp: "विद्युत् र चुम्बकत्व",
    curriculumMarks: 8,
    overviewEn: "Ohm's Law, Series and Parallel combinations, Heating effect (Joule's law), Domestic wiring safety (Fuse, MCB, Earth wire), NEA Electricity bill calculation, Faraday's Electromagnetic Induction, and Transformers.",
    overviewNp: "ओहमको नियम, श्रेणीक्रम र समानान्तर जोड, विद्युतको ताप असर, घरेलु वाइरिङ र सुरक्षा, विद्युत महसुल गणना, फराडेको विद्युत चुम्बकीय उपप्रेरण र ट्रान्सफर्मर।",
    keyConcepts: [
      {
        conceptEn: "Ohm's Law & Circuits",
        conceptNp: "ओहमको नियम र परिपथ",
        formula: "V = I \\cdot R",
        series: "R_s = R_1 + R_2 + R_3",
        parallel: "\\frac{1}{R_p} = \\frac{1}{R_1} + \\frac{1}{R_2} + \\frac{1}{R_3}"
      },
      {
        conceptEn: "Domestic Electric Energy & NEA Billing",
        conceptNp: "विद्युतीय ऊर्जा र महसुल गणना",
        formula: "\\text{Units (kWh)} = \\frac{P \\text{ (Watts)} \\times t \\text{ (Hours)} \\times \\text{Days}}{1000}"
      },
      {
        conceptEn: "Transformer Principle",
        conceptNp: "ट्रान्सफर्मरको सिद्धान्त",
        defEn: "A static device that converts alternating voltage from one level to another via mutual induction without changing frequency.",
        formula: "\\frac{V_p}{V_s} = \\frac{N_p}{N_s} = \\frac{I_s}{I_p}",
        lamination: "Core is made of thin laminated soft iron sheets insulated with varnish to prevent energy loss due to eddy currents."
      }
    ],
    seeQuestions: [
      {
        group: "D",
        marks: 4,
        question: "A Nepali household uses: four 20W LED bulbs for 6 hours daily, one 1000W electric heater for 2 hours daily, and one 750W water pump for 1 hour daily. Calculate total electricity units consumed in the month of Baishakh (30 days). If NEA charges Rs. 3 per unit for first 20 units and Rs. 7 per unit for remaining units, calculate the total bill.",
        solution: "Total daily energy:\nBulbs: 4 × 20W × 6h = 480 Wh\nHeater: 1 × 1000W × 2h = 2000 Wh\nPump: 1 × 750W × 1h = 750 Wh\nTotal Wh per day = 480 + 2000 + 750 = 3230 Wh = 3.23 kWh.\nMonthly units = 3.23 kWh × 30 days = 96.9 units ≈ 97 units.\nCost:\nFirst 20 units: 20 × Rs. 3 = Rs. 60\nRemaining 77 units: 77 × Rs. 7 = Rs. 539\nTotal Electricity Bill = Rs. 60 + Rs. 539 = Rs. 599."
      }
    ]
  },

  // =================== CHEMISTRY (रसायन विज्ञान) ===================
  {
    id: "periodic-classification",
    unitNumber: 6,
    subject: "chemistry",
    titleEn: "Classification of Elements",
    titleNp: "तत्वहरूको वर्गीकरण",
    curriculumMarks: 5,
    overviewEn: "Modern Periodic Law based on atomic numbers (Moseley), 7 periods and 18 groups, s/p/d/f blocks, electronic configuration of first 30 elements, and periodic trends (atomic size, valency, metallic character, ionization energy).",
    overviewNp: "आधुनिक आवर्त नियम, ७ पिरियड र १८ समूह, s, p, d, f ब्लक, पहिलो ३० तत्वहरूको इलेक्ट्रोन विन्यास, र आवर्त प्रवृत्तिहरू (पारमाणविक आकार, संयोजकता, धातुय गुण)।",
    keyConcepts: [
      {
        conceptEn: "Modern Periodic Law",
        conceptNp: "आधुनिक आवर्त नियम",
        defEn: "The physical and chemical properties of elements are periodic functions of their atomic numbers.",
        defNp: "तत्वहरूको भौतिक तथा रासायनिक गुणहरू तिनीहरूको पारमाणविक सङ्ख्याको आवर्त स्वरूप हुन्छन्।"
      },
      {
        conceptEn: "Aufbau Principle & Subshell Filling",
        conceptNp: "अफबाउ सिद्धान्त र सबसेल विन्यास",
        formula: "1s < 2s < 2p < 3s < 3p < 4s < 3d < 4p",
        subshellCapacities: "s: 2, p: 6, d: 10, f: 14 electrons."
      }
    ],
    seeQuestions: [
      {
        group: "A",
        marks: 1,
        question: "Why is Modern Periodic Table superior to Mendeleev's Periodic Table?",
        answer: "Moseley arranged elements by Atomic Number (number of protons) rather than Atomic Mass, resolving anomalies like position of isotopes, cobalt-nickel inversion, and grouping elements by identical valence configurations."
      }
    ]
  },

  {
    id: "chemical-reaction",
    unitNumber: 7,
    subject: "chemistry",
    titleEn: "Chemical Reactions & Rates",
    titleNp: "रासायनिक प्रतिक्रिया र दर",
    curriculumMarks: 5,
    overviewEn: "Types of chemical reactions (Combination, Decomposition, Displacement, Double Displacement, Neutralization, Redox), factors affecting reaction rates (temperature, concentration, surface area, catalysts), and balancing equations.",
    overviewNp: "रासायनिक प्रतिक्रियाका प्रकारहरू (संयोजन, विच्छेदन, विस्थापन, दोहोरो विस्थापन, उदासिनीकरण, रेडक्स), प्रतिक्रिया दरमा असर पार्ने तत्वहरू र रासायनिक समीकरण सन्तुलन।",
    keyConcepts: [
      {
        conceptEn: "Factors Affecting Reaction Rate",
        conceptNp: "प्रतिक्रिया दरमा असर पार्ने तत्वहरू",
        factors: [
          "Temperature (तापक्रम): Raising 10°C roughly doubles reaction rate due to increased kinetic energy and collision frequency.",
          "Surface Area (सतहको क्षेत्रफल): Powdered reactants react faster than solid lumps (e.g. Powdered marble chips react faster with HCl than big lumps).",
          "Concentration (गाढापन): Higher reactant concentration increases collision frequency.",
          "Catalysts (उत्प्रेरक): Positive catalysts (e.g. MnO₂ in H₂O₂ decomposition) lower activation energy."
        ]
      }
    ]
  },

  {
    id: "acid-base-salt",
    unitNumber: 8,
    subject: "chemistry",
    titleEn: "Acids, Bases & Salts",
    titleNp: "अम्ल, क्षार र लवण",
    curriculumMarks: 5,
    overviewEn: "Properties of acids, bases, and alkalis, pH scale (0-14), indicators (litmus, methyl orange, phenolphthalein, universal indicator), neutralization reaction, and uses of salts in daily life and agriculture in Nepal.",
    overviewNp: "अम्ल, बेस र क्षारका गुणहरू, pH स्केल, सूचकहरू, उदासिनीकरण प्रतिक्रिया, र दैनिक जीवन तथा कृषिमा लवणको प्रयोग।"
  },

  {
    id: "industrial-gases",
    unitNumber: 9,
    subject: "chemistry",
    titleEn: "Laboratory Preparation of Gases",
    titleNp: "केही ग्यासहरूको प्रयोगशाला तयारी",
    curriculumMarks: 6,
    overviewEn: "Complete laboratory preparation, balanced equations, physical and chemical properties, collection methods, and tests for Carbon Dioxide (CO₂), Ammonia (NH₃), Nitrogen (N₂), Oxygen (O₂), and Hydrogen (H₂).",
    overviewNp: "कार्बन डाइअक्साइड (CO₂), एमोनिया (NH₃), नाइट्रोजन (N₂), अक्सिजन (O₂) र हाइड्रोजन (H₂) ग्यासको प्रयोगशाला तयारी, समीकरण, गुण, सङ्कलन विधि र परीक्षणहरू।",
    gases: [
      {
        name: "Carbon Dioxide (CO₂)",
        equation: "CaCO₃ + 2HCl → CaCl₂ + H₂O + CO₂↑",
        apparatus: "Woulfe's bottle, thistle funnel, delivery tube, gas jar.",
        collection: "Upward displacement of air (heavier than air, vapor density 22 vs air 14.4).",
        tests: "Turns moist blue litmus red; turns lime water Ca(OH)₂ milky due to insoluble CaCO₃ precipitate."
      },
      {
        name: "Ammonia (NH₃)",
        equation: "2NH₄Cl + Ca(OH)₂ →[Δ] CaCl₂ + 2H₂O + 2NH₃↑",
        apparatus: "Hard glass test tube tilted downward, delivery tube, Lime tower (CaO drying agent), inverted gas jar.",
        precautions: "Test tube MUST be clamped with its mouth tilted downward so water vapor formed does not trickle back and crack the hot test tube bottom.",
        collection: "Downward displacement of air (lighter than air, vapor density 8.5).",
        tests: "Pungent choking odor; turns moist red litmus blue; forms dense white fumes of NH₄Cl when glass rod dipped in conc. HCl is brought near."
      }
    ]
  },

  {
    id: "metals-metallurgy",
    unitNumber: 10,
    subject: "chemistry",
    titleEn: "Metals, Reactivity Series & Metallurgy",
    titleNp: "धातु, सक्रियता श्रेणी र धातु निष्कासन",
    curriculumMarks: 5,
    overviewEn: "Physical and chemical properties of metals vs non-metals, metal reactivity series, extraction of Iron (haematite in blast furnace), Copper (copper pyrites), and Aluminium (bauxite), corrosion and rust prevention.",
    overviewNp: "धातु र अधातुका गुणहरू, सक्रियता श्रेणी, फलाम, तामा र आल्मुनियमको निष्कासन, धातुको खिया लाग्ने प्रक्रिया र रोकथामका उपायहरू।"
  },

  {
    id: "carbon-compounds",
    unitNumber: 11,
    subject: "chemistry",
    titleEn: "Carbon & Its Organic Compounds",
    titleNp: "कार्बन र यसका जैविक यौगिकहरू",
    curriculumMarks: 5,
    overviewEn: "Tetravalency and catenation of carbon, allotropes (diamond, graphite, fullerenes), hydrocarbons (alkanes, alkenes, alkynes C1-C10), IUPAC nomenclature, isomerism, functional groups, ethanol and glycerol.",
    overviewNp: "कार्बनको चतुःसंयोजकता र क्याटेनेसन, बहुरुपहरू, हाइड्रोकार्बन (अल्केन, अल्किन, अल्काइन), IUPAC नामकरण, आइसोमेरिजम, इथानोल र ग्लिसरोल।"
  },

  {
    id: "daily-materials",
    unitNumber: 12,
    subject: "chemistry",
    titleEn: "Materials Used in Daily Life",
    titleNp: "दैनिक जीवनमा प्रयोग हुने वस्तुहरू",
    curriculumMarks: 4,
    overviewEn: "Cement manufacturing (Chobhar/Udayapur), setting of cement and RCC, glass types (soda, hard, Pyrex, optical), ceramics, plastics (thermoplastics vs thermosetting), chemical fertilizers (NPK), soaps and detergents.",
    overviewNp: "सिमेन्ट उत्पादन र जम्ने प्रक्रिया, सिसाका प्रकारहरू, सेरामिक्स, प्लास्टिक (थर्मोप्लास्टिक र थर्मोसेटिङ), रासायनिक मल (NPK), साबुन र डिटर्जेन्ट।"
  },

  // =================== BIOLOGY (जीव विज्ञान) ===================
  {
    id: "invertebrates-insects",
    unitNumber: 13,
    subject: "biology",
    titleEn: "Invertebrates: Silkworm & Honeybee",
    titleNp: "ढाड नभएका जन्तुहरू: रेशमकीरा र मौरी",
    curriculumMarks: 4,
    overviewEn: "Life cycle of Silkworm (Bombyx mori) and sericulture in Nepal; caste system of Honeybee (Apis mellifera: Queen, Drone, Worker), waggle dance communication, and economic importance of apiculture.",
    overviewNp: "रेशमकीरा (Bombyx mori) को जीवनचक्र र रेशम खेती; मौरी (Apis mellifera) को सामाजिक संरचना (रानी, भाले, कर्मी), नृत्य सञ्चार र मह उत्पादन।"
  },

  {
    id: "nervous-endocrine",
    unitNumber: 14,
    subject: "biology",
    titleEn: "Human Nervous & Glandular Systems",
    titleNp: "मानव स्नायु र ग्रन्थी प्रणाली",
    curriculumMarks: 5,
    overviewEn: "Central nervous system (Brain: Cerebrum, Cerebellum, Medulla; Spinal cord), Reflex Arc, Endocrine glands (Pituitary, Thyroid, Adrenal, Pancreas, Gonads), hormones and disorders (Goitre, Diabetes, Dwarfism).",
    overviewNp: "केन्द्रीय स्नायु प्रणाली (मस्तिष्क: प्रमस्तिष्क, अनुमस्तिष्क, मेडुला; मेरुदण्ड), रिफ्लेक्स आर्क, इन्डोक्राइन ग्रन्थीहरू र हर्मोनजन्य रोगहरू।"
  },

  {
    id: "blood-circulation",
    unitNumber: 15,
    subject: "biology",
    titleEn: "Human Circulatory System",
    titleNp: "मानव रक्तसञ्चार प्रणाली",
    curriculumMarks: 6,
    overviewEn: "Composition of blood (RBC, WBC, Platelets, Plasma), Blood groups (ABO & Rh factor), Anatomy of 4-chambered heart, Pulmonary vs Systemic double circulation, Cardiac cycle, and Blood pressure (120/80 mmHg).",
    overviewNp: "रगतको संरचना (RBC, WBC, प्लेटलेट्स), रक्त समूह, मुटुको आन्तरिक संरचना, दोहोरो रक्तसञ्चार (फुक्सो र शरीर), रक्तचाप र मुटुरोग।"
  },

  {
    id: "heredity-genetics",
    unitNumber: 16,
    subject: "biology",
    titleEn: "Heredity & Chromosomal Genetics",
    titleNp: "वंशानुक्रम र आनुवंशिकी",
    curriculumMarks: 6,
    overviewEn: "Chromosomes, DNA, Genes, Mendel's Laws of Inheritance, Monohybrid cross (3:1 and 1:2:1), Dihybrid cross (9:3:3:1), Human sex determination (XX female vs XY male, 50% probability, father determines child's sex).",
    overviewNp: "क्रोमोजोम, DNA, जिन, मेन्डेलका नियमहरू, एकजोडी गुण संकरण, मानवमा लिंग निर्धारण (५०% सम्भावना, बाबुको शुक्राणुले लिंग निर्धारण गर्दछ)।"
  },

  {
    id: "reproduction-growth",
    unitNumber: 17,
    subject: "biology",
    titleEn: "Reproduction in Plants & Animals",
    titleNp: "प्रजनन र वृद्धि",
    curriculumMarks: 5,
    overviewEn: "Asexual reproduction (fission, budding, vegetative propagation: grafting, layering, tissue culture), Sexual reproduction in flowering plants (flower anatomy, pollination, fertilization), Human male and female reproduction.",
    overviewNp: "अलैंगिक प्रजनन (कलमी, ग्राफ्टिङ, तन्तु प्रविधि), फूल फुल्ने बिरुवामा लैंगिक प्रजनन, परागसेचन, गर्भाधान र मानव प्रजनन प्रणाली।"
  },

  {
    id: "ecosystem-biodiversity",
    unitNumber: 18,
    subject: "biology",
    titleEn: "Ecosystem & Environmental Balance",
    titleNp: "पारिस्थितिक प्रणाली र वातावरणीय सन्तुलन",
    curriculumMarks: 4,
    overviewEn: "Biotic and abiotic factors, Food chains, Food webs, Trophic pyramids and 10% energy law, Biogeochemical cycles (Carbon and Nitrogen cycles), Biodiversity conservation in Nepal's National Parks.",
    overviewNp: "जैविक र अजैविक तत्वहरू, खाद्य सञ्जाल, ऊर्जा पिरामिड, नाइट्रोजन चक्र, कार्बन चक्र, र नेपालका राष्ट्रिय निकुञ्जहरूमा जैविक विविधता संरक्षण।"
  },

  // =================== GEOLOGY & ASTRONOMY (भू तथा खगोल विज्ञान) ===================
  {
    id: "earth-geology",
    unitNumber: 19,
    subject: "astronomy",
    titleEn: "Geology of Nepal & Natural Hazards",
    titleNp: "नेपालको भू-विज्ञान र प्राकृतिक प्रकोप",
    curriculumMarks: 5,
    overviewEn: "Tectonic plate collision (Indian Plate under Eurasian Plate creating the Himalayas), Earthquakes (focus, epicenter, P and S waves, seismographs), Glacial Lake Outburst Floods (GLOFs: Tsho Rolpa, Imja), and Soil erosion.",
    overviewNp: "टेक्टोनिक प्लेटको चाल र हिमालयको निर्माण, भूकम्प (केन्द्र, अधिकेन्द्र, P र S तरङ्ग), हिमताल विस्फोट (GLOFs), र भू-क्षय।"
  },

  {
    id: "universe-stars",
    unitNumber: 20,
    subject: "astronomy",
    titleEn: "The Universe, Stars & Space Science",
    titleNp: "ब्रह्माण्ड, तारा र अन्तरिक्ष विज्ञान",
    curriculumMarks: 5,
    overviewEn: "Big Bang Theory and cosmic expansion, Nuclear fusion in stars, Life cycle of Sun-like stars vs Massive stars (Supernova, Black hole, Chandrasekhar limit 1.44 M☉), Artificial satellites, and Nepal's NepaliSat-1.",
    overviewNp: "बिग ब्याङ सिद्धान्त, ताराहरूमा आणविक फ्युजन, सूर्यजस्ता र विशाल ताराहरूको जीवन चक्र (सुपरनोभा, ब्ल्याक होल), कृत्रिम उपग्रह र नेपालीस्याट-१।"
  }
];
