// Comprehensive Class 10 Science Syllabus & Educational Data (CDC Nepal & SEE Curriculum)
// Bilingual: English & Nepali (नेपाली)

export const SYLLABUS_DATA = {
  overview: {
    title: {
      en: "SEE Science Practical Lab",
      ne: "एस.ई.ई. विज्ञान प्रयोगात्मक प्रयोगशाला"
    },
    subtitle: {
      en: "Interactive, Visual & Practical Science for Grade 10 Students of Nepal (CDC Syllabus)",
      ne: "नेपाल कक्षा १० का विद्यार्थीहरूका लागि प्रत्यक्ष प्रयोगात्मक र अन्तरक्रियात्मक सिकाइ"
    },
    examStructure: {
      totalMarks: 100,
      theory: 75,
      practical: 25,
      time: "3 Hours",
      domains: [
        { name: "Physics (भौतिक विज्ञान)", marks: "~25 Marks", color: "#3b82f6" },
        { name: "Chemistry (रसायन विज्ञान)", marks: "~18 Marks", color: "#10b981" },
        { name: "Biology (जीव विज्ञान)", marks: "~22 Marks", color: "#ec4899" },
        { name: "Astronomy & Geology (भू तथा अन्तरिक्ष)", marks: "~10 Marks", color: "#8b5cf6" }
      ]
    }
  },

  units: [
    // ----------------------------------------------------
    // PHYSICS
    // ----------------------------------------------------
    {
      id: "gravity",
      domain: "physics",
      title: {
        en: "Force & Gravitation",
        ne: "बल र गुरुत्वाकर्षण"
      },
      badge: "Unit 1",
      description: {
        en: "Newton's universal law of gravitation, gravitational constant (G), acceleration due to gravity (g), free fall, and weightlessness.",
        ne: "न्युटनको गुरुत्वाकर्षणसम्बन्धी विश्वव्यापी नियम, स्थिर अङ्क (G), गुरुत्वप्रवेग (g), स्वतन्त्र खसाइ र तौलविहीनता।"
      },
      keyFormulas: [
        { formula: "F = G · (m₁ · m₂) / d²", desc: "Newton's Universal Gravitation Law" },
        { formula: "g = G · M / R²", desc: "Acceleration due to gravity on planet surface" },
        { formula: "W = m · g", desc: "Weight of a body" }
      ],
      deepDiveG: {
        title: {
          en: "Everything About Universal Gravitational Constant (G)",
          ne: "गुरुत्वाकर्षणको विश्वव्यापी स्थिर अङ्क (G) को विस्तृत व्याख्या"
        },
        value: "6.67 × 10⁻¹¹ N·m²/kg²",
        definition: {
          en: "The Universal Gravitational Constant (G) is numerically equal to the force of gravitational attraction between two bodies of unit mass (1 kg each) kept at a unit distance (1 meter) apart.",
          ne: "१ किलोग्राम पिण्ड भएका दुई वस्तुहरूलाई १ मिटरको दूरीमा राख्दा तिनीहरूबीच उत्पन्न हुने गुरुत्वाकर्षण बलको मान नै गुरुत्वाकर्षणको विश्वव्यापी स्थिर अङ्क (G) हो।"
        },
        whyUniversal: {
          en: "Why is 'G' called UNIVERSAL? Because its value remains constant everywhere in the entire universe—independent of time, temperature, pressure, medium between the bodies, chemical composition, or location (whether on Earth, Moon, Jupiter, or deep space).",
          ne: "किन 'G' लाई विश्वव्यापी (Universal) भनिएको हो? किनकि यसको मान ब्रह्माण्डको जुनसुकै स्थानमा पनि समान रहन्छ—माध्यम, तापक्रम, चाप वा वस्तुको बनोटले यसमा कुनै असर गर्दैन।"
        },
        cavendishDiscovery: {
          en: "In 1798, British scientist Henry Cavendish measured G for the very first time using a highly sensitive Torsion Balance with small and large lead spheres. By measuring the minute twist of a thin quartz fiber using a light beam reflected on a mirror, he 'weighed the Earth'!",
          ne: "सन् १७९८ मा वैज्ञानिक हेनरी क्याभेन्डिसले 'टर्सन ब्यालेन्स' (Torsion Balance) को प्रयोग गरी पहिलो पटक G को मान पत्ता लगाएका थिए।"
        },
        practicalIntuition: {
          en: "Think about this: Why don't you stick to your desk or classmate by gravity? Because 6.67 × 10⁻¹¹ is microscopic (0.0000000000667)! Two 50kg students sitting 1 meter apart attract each other with only 0.000000167 Newtons—less than the weight of a speck of dust! You only feel gravity when at least one mass is colossal (like Planet Earth with 6 × 10²⁴ kg)!",
          ne: "व्यावहारिक सोच: किन तपाईं आफ्नो साथीतिर तानिँदैन? किनकि G को मान अत्यन्त सानो (०.००००००००००६६७) हुन्छ! दुई ५० केजीका साथीहरू १ मिटर टाढा बस्दा केवल ०.००००००१६७ न्युटन बल लाग्छ। तर पृथ्वी यति विशाल (६ × १०²४ केजी) छ कि हामीलाई तल तानिन्छ!"
        }
      },
      seeExamQuestions: [
        {
          q: "Differentiate between Universal Gravitational Constant (G) and Acceleration due to Gravity (g).",
          a: "1) G is a scalar quantity (6.67 × 10⁻¹¹ N m²/kg²) and constant everywhere; g is a vector quantity (average 9.8 m/s² on Earth) and varies from place to place. 2) Unit of G is N·m²/kg², while unit of g is m/s²."
        },
        {
          q: "Why does a coin fall faster than a feather in air, but both fall together in a vacuum?",
          a: "In air, the feather experiences higher air resistance relative to its weight, which opposes its downward fall. In a vacuum, there is no air resistance, and both accelerate at the exact same rate (g = 9.8 m/s²) independent of their masses."
        },
        {
          q: "Under what conditions does a body experience weightlessness?",
          a: "1) During free fall (when downward acceleration a = g). 2) At the center of the Earth (g = 0). 3) In deep outer space far from any celestial body (g ≈ 0). 4) Inside an artificial satellite orbiting the Earth."
        }
      ]
    },

    {
      id: "pressure",
      domain: "physics",
      title: {
        en: "Pressure & Hydraulics",
        ne: "चाप र हाइड्रोलीक यन्त्रहरू"
      },
      badge: "Unit 2",
      description: {
        en: "Liquid pressure, Pascal's Law, Hydraulic machines (lift, brakes), Archimedes' Principle, upthrust, and law of floatation.",
        ne: "तरल पदार्थको चाप, पास्कलको नियम, हाइड्रोलीक मेसिनहरू, आर्किमिडिजको सिद्धान्त, उर्ध्वचाप र तैरने नियम।"
      },
      keyFormulas: [
        { formula: "P = F / A", desc: "Pressure = Force / Area" },
        { formula: "P = h · ρ · g", desc: "Liquid Pressure = depth × density × gravity" },
        { formula: "F₁ / A₁ = F₂ / A₂", desc: "Pascal's Law for Hydraulic Lift" },
        { formula: "U = V · ρ · g", desc: "Upthrust = volume of displaced liquid × density × g" }
      ],
      practicalIntuition: {
        en: "Pascal's Law is the secret of lifting a 2000kg car using one hand! A small push on a narrow syringe/piston creates intense fluid pressure that transmits undiminished to a wide piston, multiplying the force by the area ratio (A₂ / A₁)!",
        ne: "पास्कलको नियमले एउटै हातले २ टनको गाडी उचाल्न मद्दत गर्छ! सानो पिस्टनमा लगाएको चाप तरल पदार्थमार्फत चारैतिर समान रूपले फैलिएर ठूलो पिस्टनमा हजारौँ गुणा ठूलो बल बन्छ।"
      },
      seeExamQuestions: [
        {
          q: "State Archimedes' Principle and give its practical applications.",
          a: "Archimedes' Principle states that when a body is wholly or partially immersed in a fluid, it experiences an upthrust equal to the weight of the fluid displaced by it. Applications: Design of ships, submarines, and hydrometers."
        },
        {
          q: "Why is an iron nail sunk in water while a huge ship made of iron floats?",
          a: "An iron nail is solid and displaces very little water (upthrust is less than its weight). A ship is hollow and has a huge volume, so it displaces a large amount of water whose weight is greater than or equal to the ship's weight (Law of Floatation)."
        }
      ]
    },

    {
      id: "optics",
      domain: "physics",
      title: {
        en: "Light & Optical Lenses",
        ne: "प्रकाश र लेन्स"
      },
      badge: "Unit 3",
      description: {
        en: "Refraction through convex and concave lenses, ray diagrams, lens power, magnification, and human eye vision defect corrections.",
        ne: "उत्तल (Convex) र अवतल (Concave) लेन्सबाट प्रकाशको आवर्तन, किरण रेखाचित्र, आँखाका दृष्टि दोष र तिनको उपचार।"
      },
      keyFormulas: [
        { formula: "1/f = 1/u + 1/v", desc: "Lens Formula" },
        { formula: "P = 1 / f(in meters)", desc: "Power of Lens in Diopters (D)" },
        { formula: "m = v / u = height_img / height_obj", desc: "Magnification" }
      ],
      practicalIntuition: {
        en: "Ever used a magnifying glass to focus sunlight onto a dry leaf? That focal point is where parallel light rays converge. The closer the focal point (shorter f), the more powerful the lens (P = 1/f)!",
        ne: "घामको किरणलाई लेन्सबाट पातमा केन्द्रित गरेर आगो बाल्नुभएको छ? त्यो विन्दु नै फोकस हो। फोकस जति नजिक हुन्छ, लेन्सको सामर्थ्य (Power) त्यति नै धेरै हुन्छ!"
      },
      seeExamQuestions: [
        {
          q: "Explain Myopia (Short-sightedness) and its optical correction with ray diagram.",
          a: "Myopia is the eye defect where a person can see near objects clearly but distant objects appear blurred because the eyeball is elongated and rays focus in front of the retina. It is corrected using a Concave (diverging) lens with negative power."
        },
        {
          q: "What is 1 Diopter power of a lens?",
          a: "1 Diopter is the power of a lens having a focal length of exactly 1 meter (P = 1 / 1m = +1 D for convex, -1 D for concave)."
        }
      ]
    },

    {
      id: "electricity",
      domain: "physics",
      title: {
        en: "Current Electricity & Transformers",
        ne: "विद्युत् र ट्रान्सफर्मर"
      },
      badge: "Unit 4",
      description: {
        en: "Ohm's law, household electricity billing (kWh), safety fuses and earthing, electromagnetic induction, and step-up / step-down transformers.",
        ne: "ओहमको नियम, घरायसी बिजुलीको बिलिङ (युनिट), फ्युज, अर्थिङ, र ट्रान्सफर्मर (स्टेप-अप र स्टेप-डाउन)।"
      },
      keyFormulas: [
        { formula: "V = I · R", desc: "Ohm's Law (Voltage = Current × Resistance)" },
        { formula: "Units (kWh) = (Total Watts × Hours) / 1000", desc: "Electricity Bill Consumption Units" },
        { formula: "Vp / Vs = Np / Ns = Is / Ip", desc: "Transformer Equation" }
      ],
      practicalIntuition: {
        en: "Why do we need step-up transformers at hydroelectric dams like Kali Gandaki or Upper Tamakoshi? Stepping up voltage to 132,000 Volts drops the current, drastically minimizing heat loss (H = I²Rt) as power travels across Nepal's mountains to our homes!",
        ne: "कालीगण्डकी वा तामाकोशीमा उत्पादित बिजुलीलाई किन १ लाख ३२ हजार भोल्टमा स्टेप-अप गरिन्छ? भोल्टेज बढाउँदा करेन्ट (I) घट्छ, जसले गर्दा तारबाट तातो भएर खेर जाने ऊर्जा (I²Rt) न्यून हुन्छ!"
      },
      seeExamQuestions: [
        {
          q: "Why is the iron core of a transformer laminated instead of solid?",
          a: "To reduce energy loss caused by circulating eddy currents. Lamination with varnish insulates layers, breaking eddy current loops and preventing overheating."
        },
        {
          q: "Calculate the monthly electricity bill for a house running four 60W bulbs for 5 hours daily at NPR 10 per unit.",
          a: "Daily energy = (4 × 60W × 5h) = 1200 Wh = 1.2 kWh. Monthly units = 1.2 × 30 = 36 units. Cost = 36 × NPR 10 = NPR 360."
        }
      ]
    },

    // ----------------------------------------------------
    // CHEMISTRY
    // ----------------------------------------------------
    {
      id: "periodic",
      domain: "chemistry",
      title: {
        en: "Modern Periodic Table",
        ne: "आधुनिक आवधिक तालिका"
      },
      badge: "Unit 5",
      description: {
        en: "Modern periodic law (Henry Moseley), groups, periods, s-p-d-f blocks, subshell electronic configuration, and periodic trends in reactivity.",
        ne: "आधुनिक आवधिक नियम (हेनरी मोस्ले), समूह, पिरियड, s-p-d-f ब्लक, र उपतह (subshell) इलेक्ट्रोनिक विन्यास।"
      },
      keyFormulas: [
        { formula: "2n² rule", desc: "Maximum electrons in shell n (K=2, L=8, M=18, N=32)" },
        { formula: "1s, 2s 2p, 3s 3p, 4s 3d", desc: "Aufbau principle subshell filling sequence" }
      ],
      seeExamQuestions: [
        {
          q: "State Modern Periodic Law and differentiate it from Mendeleev's Periodic Law.",
          a: "Mendeleev arranged elements by atomic weight, which caused anomalies with isotopes. Modern Periodic Law states that 'physical and chemical properties of elements are periodic functions of their atomic numbers (proton numbers)'."
        },
        {
          q: "Why does atomic size decrease from left to right across a period?",
          a: "Because atomic number (nuclear positive charge) increases across a period while electrons enter the same shell, pulling electrons closer to the nucleus."
        }
      ]
    },

    {
      id: "gases",
      domain: "chemistry",
      title: {
        en: "Laboratory Gases (CO₂ & NH₃)",
        ne: "प्रयोगशाला ग्याँसहरू (CO₂ र NH₃)"
      },
      badge: "Unit 6",
      description: {
        en: "Apparatus setup, principles, tests, and industrial properties of Carbon Dioxide and Ammonia gas.",
        ne: "कार्बन डाइअक्साइड (CO₂) र एमोनिया (NH₃) ग्याँस बनाउने विधि, उपकरणको जडान र रासायनिक परीक्षण।"
      },
      keyFormulas: [
        { formula: "CaCO₃ + 2HCl → CaCl₂ + H₂O + CO₂↑", desc: "Lab Preparation of Carbon Dioxide" },
        { formula: "2NH₄Cl + Ca(OH)₂ → CaCl₂ + 2H₂O + 2NH₃↑", desc: "Lab Preparation of Ammonia Gas (2:1 ratio)" }
      ],
      seeExamQuestions: [
        {
          q: "Why is Ammonia gas collected by downward displacement of air, and the delivery tube clamped downward?",
          a: "1) Ammonia is lighter than air (density 0.77 g/L vs air 1.29 g/L) so it rises to the top of an inverted jar. 2) Ammonia cannot be collected over water because it is highly soluble in water. 3) The test tube is tilted downward so that condensing water vapor does not trickle back and crack the hot glass tube."
        },
        {
          q: "How do you test if a gas jar is full of CO₂?",
          a: "Bring a burning candle near the mouth of the jar: it will extinguish immediately because CO₂ does not support combustion. Pass the gas through clear lime water: it turns milky white."
        }
      ]
    },

    {
      id: "acids_bases",
      domain: "chemistry",
      title: {
        en: "Acids, Bases, Salts & pH",
        ne: "अम्ल, क्षार, लवण र pH स्केल"
      },
      badge: "Unit 7",
      description: {
        en: "pH scale (0-14), natural indicators, neutralization reactions, and practical uses of salts in Nepal's agriculture and health.",
        ne: "pH स्केल (० देखि १४), सूचकहरू (Indicators), तटीस्थीकरण प्रतिक्रिया र दैनिक जीवनमा लवणको महत्त्व।"
      },
      keyFormulas: [
        { formula: "Acid + Base → Salt + Water (Neutralization)", desc: "Ex: HCl + NaOH → NaCl + H₂O" },
        { formula: "pH < 7 (Acid) | pH = 7 (Neutral) | pH > 7 (Base)", desc: "pH Spectrum Scale" }
      ],
      seeExamQuestions: [
        {
          q: "Why do farmers add slaked lime (Ca(OH)₂) to agricultural soil?",
          a: "Continuous use of chemical fertilizers or acid rain makes soil acidic (pH < 6). Adding basic slaked lime neutralizes the excess acid, restoring ideal soil pH for crops."
        }
      ]
    },

    // ----------------------------------------------------
    // BIOLOGY
    // ----------------------------------------------------
    {
      id: "genetics",
      domain: "biology",
      title: {
        en: "Heredity & Mendel's Genetics",
        ne: "वंशाणुक्रम र मेन्डेलको नियम"
      },
      badge: "Unit 8",
      description: {
        en: "Chromosomes, DNA, genes, Mendel's monohybrid cross with garden peas, 3:1 phenotypic ratio, and human sex determination.",
        ne: "क्रोमोजोम, डिएनए, जिन, मेन्डेलको केराउको प्रयोग, ३:१ अनुपात, र मानवमा लिङ्ग निर्धारण।"
      },
      keyFormulas: [
        { formula: "Phenotypic Ratio = 3 Tall : 1 Dwarf (75% : 25%)", desc: "Mendel Monohybrid Cross F₂" },
        { formula: "Genotypic Ratio = 1 TT : 2 Tt : 1 tt (25% : 50% : 25%)", desc: "Mendel Monohybrid Cross F₂" },
        { formula: "Mother (XX) + Father (XY) → 50% XX (Girl) + 50% XY (Boy)", desc: "Sex Determination" }
      ],
      seeExamQuestions: [
        {
          q: "A mother in rural Nepal is blamed for giving birth to daughters. Prove scientifically why the father is responsible for the child's sex.",
          a: "Human females produce eggs containing only 'X' chromosomes (22+X). Males produce two types of sperm: 50% carrying 'X' and 50% carrying 'Y'. If an X-sperm fertilizes the egg, an XX female baby forms. If a Y-sperm fertilizes, an XY male baby forms. Therefore, the sex of the baby is solely determined by the father's sperm."
        }
      ]
    },

    {
      id: "circulatory",
      domain: "biology",
      title: {
        en: "Human Blood Circulatory System",
        ne: "मानव रक्तसञ्चार प्रणाली"
      },
      badge: "Unit 9",
      description: {
        en: "4-chambered heart anatomy, valves, double circulation, arteries vs veins, blood pressure (120/80 mmHg), and blood groups.",
        ne: "मुटुको संरचना, भल्भहरू, दोहोरो रक्तसञ्चार, धमनी र शिरा, रक्तचाप र रक्त समूह।"
      },
      keyFormulas: [
        { formula: "Normal Blood Pressure = 120 / 80 mmHg", desc: "Systolic (Contraction) / Diastolic (Relaxation)" }
      ],
      seeExamQuestions: [
        {
          q: "Why is the muscular wall of the Left Ventricle much thicker than the Right Ventricle?",
          a: "The Right Ventricle only pumps deoxygenated blood a short distance to the nearby lungs under low pressure. The Left Ventricle must pump oxygenated blood under immense pressure through the aorta to the entire body, from the brain down to the toes."
        },
        {
          q: "Differentiate between Arteries and Veins.",
          a: "1) Arteries carry oxygen-rich blood away from the heart at high pressure (thick elastic walls, no valves); Veins carry deoxygenated blood towards the heart at low pressure (thin walls, contain pocket valves to prevent backflow). Exception: Pulmonary artery & vein."
        }
      ]
    },

    {
      id: "honeybee",
      domain: "biology",
      title: {
        en: "Honeybee Caste & Apiculture",
        ne: "मौरीको जीवनचक्र र मौरीपालन"
      },
      badge: "Unit 10",
      description: {
        en: "Social colony organization, Queen, Drone, Worker castes, division of labor, royal jelly, and complete metamorphosis.",
        ne: "मौरीको सामाजिक जीवन, रानी, भाले र कर्मी मौरीका कामहरू, रोयल जेली र पूर्ण रुपान्तरण।"
      },
      seeExamQuestions: [
        {
          q: "Differentiate between Queen, Drone, and Worker bees.",
          a: "1) Queen: 1 per hive, fertile diploid female, lays up to 2000 eggs/day, fed royal jelly. 2) Drone: few hundreds, fertile haploid male developed from unfertilized eggs by parthenogenesis, mates with queen during nuptial flight. 3) Worker: thousands, sterile diploid females with sting and pollen baskets, cleans, nurses larvae, and collects nectar."
        }
      ]
    },

    // ----------------------------------------------------
    // ASTRONOMY & GEOLOGY
    // ----------------------------------------------------
    {
      id: "universe",
      domain: "astronomy",
      title: {
        en: "Universe & Lifecycle of Stars",
        ne: "ब्रह्माण्ड र ताराहरूको जीवनचक्र"
      },
      badge: "Unit 11",
      description: {
        en: "Big Bang theory, stellar evolution from nebula to white dwarf vs supernova, neutron stars, black holes, and Himalayan climate change.",
        ne: "महाविस्फोट सिद्धान्त (Big Bang), ताराहरूको जन्म र मृत्यु (White Dwarf, Supernova, Black Hole), र हिमालयमा जलवायु परिवर्तन।"
      },
      keyFormulas: [
        { formula: "1 Light Year ≈ 9.46 × 10¹² km", desc: "Distance traveled by light in 1 Earth year" },
        { formula: "E = m · c²", desc: "Nuclear fusion powering stars (Hydrogen to Helium)" }
      ],
      seeExamQuestions: [
        {
          q: "Trace the life cycle of a star like our Sun from birth to death.",
          a: "Stellar Nebula → Protostar → Main Sequence Star (stable fusion for ~10 billion years) → Red Giant (expands as core runs out of H) → Planetary Nebula → White Dwarf (dense, hot Earth-sized core) → Black Dwarf."
        },
        {
          q: "How does global warming affect Nepal's Himalayan glaciers?",
          a: "Rising temperatures accelerate the melting of glaciers, causing glacial lakes (like Tsho Rolpa, Imja) to swell, risking catastrophic Glacial Lake Outburst Floods (GLOFs) and jeopardizing downstream river systems."
        }
      ]
    }
  ],

  diyHomeExperiments: [
    {
      id: "diy_gravity",
      title: "DIY Free Fall Vacuum Test at Home",
      materials: "A flat sheet of paper and a heavy textbook.",
      steps: [
        "1. Hold the paper in one hand and the textbook in the other at the same height. Drop them together. The book hits first due to air resistance on the paper.",
        "2. Now, place the flat sheet of paper ON TOP of the textbook.",
        "3. Drop the book with the paper resting on it. Observe: they hit the ground at the EXACT SAME TIME!",
        "4. Why? The book blocks the upward air resistance pushing against the paper, proving both fall with the exact same gravitational acceleration g!"
      ]
    },
    {
      id: "diy_pressure",
      title: "DIY Hydraulic Piston with 2 Syringes",
      materials: "One 5ml syringe, one 20ml syringe, and flexible plastic pipe filled with water.",
      steps: [
        "1. Connect the nozzles of both syringes using the water-filled tube.",
        "2. Push the small 5ml plunger with a finger: notice how easily it pushes up the heavy 20ml plunger!",
        "3. Now try pushing the 20ml plunger to move the 5ml: it requires 4x more force!",
        "4. This proves Pascal's law: smaller area requires less input force to lift heavier loads."
      ]
    },
    {
      id: "diy_indicator",
      title: "DIY Red Cabbage / Turmeric pH Indicator",
      materials: "Turmeric powder (Besar), detergent water (Base), and lemon juice (Acid).",
      steps: [
        "1. Mix turmeric powder in water: it forms a bright yellow solution.",
        "2. Add a few drops of detergent/soap water (Base): it instantly turns deep RED-BROWN!",
        "3. Now squeeze fresh lemon juice (Acid) into the red mixture: watch it turn back to bright YELLOW!",
        "4. This is a real acid-base neutralization reaction using kitchen items!"
      ]
    }
  ]
};
