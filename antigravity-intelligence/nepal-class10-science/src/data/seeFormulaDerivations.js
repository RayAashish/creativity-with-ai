// Comprehensive Mathematical Derivations of Class 10 CDC Science Formulas
// Step-by-Step Proofs from First Principles for SEE Board Examinations

export const FORMULA_DERIVATIONS_BANK = [
  // ================= 1. NEWTON'S LAW OF GRAVITATION =================
  {
    id: "deriv-1",
    unit: "force-motion",
    titleEn: "Derivation of Newton's Law of Gravitation (F = G·m₁·m₂ / d²)",
    titleNp: "न्युटनको गुरुत्वाकर्षण नियमको गणितीय प्रमाणीकरण",
    statementEn: "Every particle in the universe attracts every other particle with a force directly proportional to the product of their masses and inversely proportional to the square of the distance between their centres.",
    statementNp: "ब्रह्माण्डमा रहेका कुनै दुई पिण्डहरू बीच लाग्ने आकर्षण बल तिनीहरूको पिण्डको गुणनफलसँग समानुपातिक र तिनीहरूको केन्द्र बीचको दूरीको वर्गसँग व्युत्क्रमानुपातिक हुन्छ।",
    steps: [
      "Step 1: Consider two spherical bodies of mass m₁ and m₂ separated by a distance d between their geometric centres.",
      "Step 2: Let F be the mutual gravitational force of attraction exerted between them.",
      "Step 3: According to Newton's First Proportionality: The force is directly proportional to the product of their masses.",
      "Mathematical Statement: F ∝ m₁ × m₂   ... (Equation 1)",
      "Step 4: According to Newton's Second Proportionality: The force is inversely proportional to the square of the distance between their centres.",
      "Mathematical Statement: F ∝ 1 / d²   ... (Equation 2)",
      "Step 5: Combining Equations (1) and (2) simultaneously:",
      "F ∝ (m₁ × m₂) / d²",
      "Step 6: Introduce a constant of proportionality to convert the proportionality into an exact equality:",
      "F = G × (m₁ × m₂) / d²   ... (Equation 3)",
      "Step 7: Here, G is the Universal Gravitational Constant. Its value does not depend on medium, temperature, or chemical nature.",
      "Experimentally determined by Henry Cavendish (1798) using a quartz torsion balance: G = 6.674 × 10⁻¹¹ N·m²/kg²."
    ],
    dimensionsAndUnits: {
      siUnit: "N·m²/kg² or m³/(kg·s²)",
      dimensionalFormula: "[M⁻¹ L³ T⁻²]",
      scalarOrVector: "Scalar constant (Force F is a vector directed along the line joining centres)"
    }
  },

  // ================= 2. ACCELERATION DUE TO GRAVITY =================
  {
    id: "deriv-2",
    unit: "force-motion",
    titleEn: "Derivation of Acceleration due to Gravity on Planet Surface (g = GM / R²)",
    titleNp: "ग्रहको सतहमा गुरुत्वप्रवेगको सूत्र (g = GM / R²) प्रमाणीकरण",
    statementEn: "Prove that the acceleration due to gravity on the surface of a planet depends only on the mass and radius of the planet, and is independent of the mass of the falling object.",
    statementNp: "कुनै ग्रहको सतहमा गुरुत्वप्रवेग केवल ग्रहको पिण्ड र अर्धव्यासमा भर पर्छ तर खसिरहेको वस्तुको पिण्डमा भर पर्दैन भनी प्रमाणित गर्नुहोस्।",
    steps: [
      "Step 1: Let M be the mass of the planet (e.g. Earth) and R be the radius of the planet.",
      "Step 2: Let an object of small mass m be placed at rest on the surface of the planet.",
      "Step 3: According to Newton's Universal Law of Gravitation, the gravitational force exerted by the planet on the mass m is:",
      "F = G × (M × m) / R²   ... (Equation 1)",
      "Step 4: According to Newton's Second Law of Motion, the force acting on the body produces acceleration g (acceleration due to gravity):",
      "F = m × g   ... (Equation 2)",
      "Step 5: Equating the two expressions for gravitational force from Equations (1) and (2):",
      "m × g = G × (M × m) / R²",
      "Step 6: Divide both sides by the small mass m of the falling body:",
      "g = G × M / R²   ... (Equation 3)",
      "Step 7: Conclusion: The small mass m completely cancels out from the equation.",
      "Therefore, acceleration due to gravity (g) is completely independent of the mass, shape, size, or material of the falling body."
    ],
    variationNotes: [
      "Earth is an oblate spheroid: Polar radius Rp (~6,357 km) < Equatorial radius Re (~6,378 km).",
      "Since g ∝ 1/R², g at poles (9.83 m/s²) is greater than g at equator (9.78 m/s²)."
    ]
  },

  // ================= 3. GRAVITY VARIATION WITH ALTITUDE =================
  {
    id: "deriv-3",
    unit: "force-motion",
    titleEn: "Derivation of Acceleration due to Gravity at Height h (g' = g · [R / (R + h)]²)",
    titleNp: "उचाइ h मा गुरुत्वप्रवेगको सूत्र प्रमाणीकरण",
    statementEn: "Derive an expression for the acceleration due to gravity at an altitude h above the surface of the Earth.",
    statementNp: "पृथ्वीको सतहबाट h उचाइमा गुरुत्वप्रवेगको मान घट्छ भनी प्रमाणित गर्नुहोस्।",
    steps: [
      "Step 1: At the surface of the Earth (distance from centre = R):",
      "g = GM / R²   ... (Equation 1)",
      "Step 2: Let an object be taken to an altitude h above the surface of the Earth.",
      "Step 3: The new distance of the object from the centre of the Earth is (R + h).",
      "Step 4: The acceleration due to gravity at height h (denoted by g') is:",
      "g' = GM / (R + h)²   ... (Equation 2)",
      "Step 5: Divide Equation (2) by Equation (1):",
      "g' / g = [GM / (R + h)²] / [GM / R²]",
      "g' / g = R² / (R + h)² = [R / (R + h)]²",
      "Step 6: Multiplying both sides by surface gravity g:",
      "g' = g × [R / (R + h)]²   ... (Equation 3)",
      "Step 7: Since (R + h) > R, the fraction [R / (R + h)] < 1, which implies g' < g.",
      "Conclusion: Acceleration due to gravity decreases continuously as altitude above Earth increases."
    ],
    numericalApplication: "At the summit of Mt. Everest (h = 8,848.86 m), g drops from 9.80 m/s² to ~9.77 m/s²."
  },

  // ================= 4. LIQUID COLUMN PRESSURE =================
  {
    id: "deriv-4",
    unit: "pressure",
    titleEn: "Derivation of Liquid Pressure (P = h · d · g)",
    titleNp: "तरल पदार्थको चापको सूत्र (P = h · d · g) प्रमाणीकरण",
    statementEn: "Prove that the hydrostatic pressure exerted by a liquid column at depth h is P = h·d·g.",
    statementNp: "तरल पदार्थको चाप गहिराइ h, घनत्व d र गुरुत्वप्रवेग g को गुणनफलसँग बराबर हुन्छ भनी प्रमाणित गर्नुहोस्।",
    steps: [
      "Step 1: Consider a vessel containing a resting liquid of uniform density d.",
      "Step 2: Imagine a cylindrical column of liquid of cross-sectional area A and height h inside the liquid.",
      "Step 3: Volume of the cylindrical liquid column: V = Area of cross-section × Height = A × h.",
      "Step 4: Mass of this liquid column: Mass = Volume × Density = (A × h) × d.",
      "Step 5: Weight of the liquid column acting vertically downwards on the bottom surface area A:",
      "Weight W = Mass × acceleration due to gravity = (A × h × d) × g.",
      "Step 6: Force exerted on the bottom surface area A is equal to the weight of the liquid column:",
      "Thrust F = A × h × d × g.",
      "Step 7: By definition, Liquid Pressure P is the force acting perpendicularly per unit area:",
      "P = Force / Area = F / A",
      "P = (A × h × d × g) / A",
      "Step 8: Area A cancels out:",
      "P = h × d × g   ... (Equation 1)",
      "Conclusion: Liquid pressure is directly proportional to depth (h), density (d), and acceleration due to gravity (g)."
    ]
  },

  // ================= 5. PASCAL'S LAW MECHANICAL ADVANTAGE =================
  {
    id: "deriv-5",
    unit: "pressure",
    titleEn: "Derivation of Hydraulic Machine Force Multiplier (F₂ = F₁ · A₂ / A₁)",
    titleNp: "पास्कलको नियममा आधारित हाइड्रोलिक मेसिनको बल गुणन सूत्र",
    statementEn: "Prove that a hydraulic lift provides mechanical advantage proportional to the ratio of piston areas.",
    statementNp: "हाइड्रोलिक लिफ्टले पिस्टनहरूको क्षेत्रफलको अनुपात अनुसार यान्त्रिक फाइदा प्रदान गर्दछ भनी प्रमाणित गर्नुहोस्।",
    steps: [
      "Step 1: Consider a hydraulic machine containing an incompressible liquid connecting two cylinders of areas A₁ and A₂ (A₂ > A₁).",
      "Step 2: Let a downward force F₁ be applied to the smaller piston of area A₁.",
      "Step 3: Pressure exerted on the liquid under the small piston:",
      "P₁ = F₁ / A₁   ... (Equation 1)",
      "Step 4: According to Pascal's Law: Pressure applied to an enclosed liquid is transmitted equally and undiminished in all directions.",
      "Therefore, pressure transmitted to the larger piston P₂ is equal to P₁:",
      "P₂ = P₁   ... (Equation 2)",
      "Step 5: Upward force F₂ produced on the larger piston of area A₂:",
      "F₂ = P₂ × A₂ = P₁ × A₂",
      "Step 6: Substitute P₁ = F₁ / A₁ into the expression:",
      "F₂ = (F₁ / A₁) × A₂",
      "F₂ = F₁ × (A₂ / A₁)   ... (Equation 3)",
      "Step 7: Mechanical Advantage MA = Output Force / Input Force = F₂ / F₁ = A₂ / A₁.",
      "Conclusion: Since A₂ >> A₁, the output force F₂ is much greater than the input force F₁, enabling small forces to lift massive vehicles."
    ]
  },

  // ================= 6. ARCHIMEDES' PRINCIPLE & UPTHRUST =================
  {
    id: "deriv-6",
    unit: "pressure",
    titleEn: "Derivation of Upthrust on Submerged Body (U = V · d · g)",
    titleNp: "उर्ध्वचापको सूत्र (U = V · d · g) को गणितीय प्रमाणीकरण",
    statementEn: "Derive the mathematical expression for the upthrust experienced by a submerged rectangular block in a liquid.",
    statementNp: "तरलमा डुबेको वस्तुले पाउने उर्ध्वचाप U = V·d·g हुन्छ भनी प्रमाणित गर्नुहोस्।",
    steps: [
      "Step 1: Consider a rectangular block of height L and cross-sectional area A immersed in a liquid of density d.",
      "Step 2: Let the top surface be at depth h₁ below the liquid surface, and bottom surface at depth h₂ (where h₂ - h₁ = L).",
      "Step 3: Downward liquid pressure on the top surface: P₁ = h₁ × d × g.",
      "Downward force on top surface: F₁ = P₁ × A = h₁ × d × g × A.",
      "Step 4: Upward liquid pressure on the bottom surface: P₂ = h₂ × d × g.",
      "Upward force on bottom surface: F₂ = P₂ × A = h₂ × d × g × A.",
      "Step 5: Lateral forces acting on opposite vertical sides cancel each other out due to symmetry.",
      "Step 6: Net upward force (Upthrust U) = Upward force F₂ - Downward force F₁:",
      "U = F₂ - F₁ = (h₂ × d × g × A) - (h₁ × d × g × A)",
      "U = (h₂ - h₁) × A × d × g",
      "Step 7: Since (h₂ - h₁) = L (height of block), and Area A × Height L = Volume of block V:",
      "U = V × d × g   ... (Equation 1)",
      "Step 8: Notice that V × d = Mass of liquid displaced by the submerged block.",
      "Mass of displaced liquid × g = Weight of displaced liquid.",
      "Conclusion: Upthrust U = Weight of liquid displaced (Archimedes' Principle verified mathematically)."
    ]
  },

  // ================= 7. HEAT EQUATION =================
  {
    id: "deriv-7",
    unit: "energy-heat",
    titleEn: "Derivation of Heat Equation (Q = m · c · Δθ)",
    titleNp: "ताप समीकरण (Q = m · c · Δθ) प्रमाणीकरण",
    statementEn: "Prove that the heat energy absorbed or released by a substance is Q = m·c·Δθ.",
    statementNp: "वस्तुले लिने वा दिने ताप ऊर्जा पिण्ड, विशिष्ट ताप र तापक्रम परिवर्तनको गुणनफलसँग बराबर हुन्छ भनी प्रमाणित गर्नुहोस्।",
    steps: [
      "Step 1: Consider a substance of mass m subjected to a temperature change Δθ = (θ₂ - θ₁).",
      "Step 2: Let Q be the quantity of heat energy absorbed or lost by the substance.",
      "Step 3: Experimental Observation 1: Heat absorbed is directly proportional to mass m (heating 2 kg water requires twice the heat of 1 kg water for same temperature rise).",
      "Q ∝ m   ... (Equation 1)",
      "Step 4: Experimental Observation 2: Heat absorbed is directly proportional to change in temperature Δθ.",
      "Q ∝ Δθ   ... (Equation 2)",
      "Step 5: Combining Equations (1) and (2):",
      "Q ∝ m × Δθ",
      "Step 6: Introduce constant of proportionality c (or s):",
      "Q = c × m × Δθ = m × c × Δθ   ... (Equation 3)",
      "Step 7: Here c is the Specific Heat Capacity of the substance.",
      "If m = 1 kg and Δθ = 1°C, then Q = c.",
      "Definition: Specific Heat Capacity is the amount of heat energy required to raise the temperature of 1 kg mass of a substance by 1°C."
    ]
  },

  // ================= 8. LENS FORMULA =================
  {
    id: "deriv-8",
    unit: "light-optics",
    titleEn: "Derivation of Lens Formula (1/f = 1/v - 1/u)",
    titleNp: "लेन्सको सूत्र (१/f = १/v - १/u) को किरण रेखाचित्र प्रमाणीकरण",
    statementEn: "Using geometric ray tracing of similar triangles for a thin convex lens, derive the lens equation 1/f = 1/v - 1/u.",
    statementNp: "उत्तल लेन्सको किरण रेखाचित्र र समरुप त्रिभुजको सम्बन्ध प्रयोग गरी लेन्स सूत्र प्रमाणित गर्नुहोस्।",
    steps: [
      "Step 1: Consider a thin convex lens of focal length f and optical centre O.",
      "Step 2: Place an object AB of height h_o perpendicular to principal axis at distance u from O (object distance = -u by sign convention).",
      "Step 3: Ray 1 parallel to principal axis refracts through principal focus F₂ on the other side.",
      "Step 4: Ray 2 passes straight through optical centre O without deviation.",
      "Step 5: The two refracted rays intersect to form a real inverted image A'B' of height h_i at distance v from O.",
      "Step 6: Consider similar triangles ΔABO and ΔA'B'O:",
      "A'B' / AB = OB' / OB = v / (-u)   ... (Equation 1)",
      "Step 7: Consider similar triangles ΔOF₂C (where OC = AB) and ΔA'B'F₂:",
      "A'B' / OC = A'B' / AB = F₂B' / OF₂ = (v - f) / f   ... (Equation 2)",
      "Step 8: Equating ratios from Equations (1) and (2):",
      "v / (-u) = (v - f) / f",
      "-v / u = v/f - 1",
      "Step 9: Divide the entire equation by v:",
      "-1/u = 1/f - 1/v",
      "Step 10: Rearranging terms gives:",
      "1/f = 1/v - 1/u   ... (Equation 3)",
      "Conclusion: This fundamental relation holds true for all thin spherical lenses with standard Cartesian sign convention."
    ]
  },

  // ================= 9. TRANSFORMER TURNS & VOLTAGE RATIO =================
  {
    id: "deriv-9",
    unit: "electricity-magnetism",
    titleEn: "Derivation of Transformer Ratio (Vp / Vs = Np / Ns = Is / Ip)",
    titleNp: "ट्रान्सफर्मरको फन्का र भोल्टेज अनुपातको सूत्र प्रमाणीकरण",
    statementEn: "Using Faraday's Law of Electromagnetic Induction and the Principle of Conservation of Energy, derive the transformer turns ratio.",
    statementNp: "फराडेको विद्युत चुम्बकीय उपप्रेरण र ऊर्जा संरक्षणको नियम प्रयोग गरी ट्रान्सफर्मर सूत्र प्रमाणित गर्नुहोस्।",
    steps: [
      "Step 1: Consider an ideal transformer consisting of primary coil of Np turns and secondary coil of Ns turns wound on a laminated soft iron core.",
      "Step 2: When alternating voltage Vp is applied to primary, an alternating magnetic flux Φ links both coils through the iron core.",
      "Step 3: Rate of change of magnetic flux in each turn is dΦ/dt.",
      "Step 4: According to Faraday's Law of Induction, induced emf in primary coil:",
      "ep = -Np × (dΦ/dt)",
      "Assuming negligible resistance in primary, Vp ≈ ep = -Np × (dΦ/dt)   ... (Equation 1)",
      "Step 5: Induced emf in secondary coil:",
      "es = -Ns × (dΦ/dt)",
      "Output secondary voltage Vs ≈ es = -Ns × (dΦ/dt)   ... (Equation 2)",
      "Step 6: Divide Equation (1) by Equation (2):",
      "Vp / Vs = [-Np × (dΦ/dt)] / [-Ns × (dΦ/dt)]",
      "Vp / Vs = Np / Ns   ... (Equation 3)",
      "Step 7: For an ideal 100% efficient transformer, Input Power = Output Power:",
      "Pin = Pout",
      "Vp × Ip = Vs × Is",
      "Vp / Vs = Is / Ip   ... (Equation 4)",
      "Step 8: Combining Equations (3) and (4):",
      "Vp / Vs = Np / Ns = Is / Ip   ... (Equation 5)",
      "Conclusion: If Ns > Np, then Vs > Vp (Step-Up Transformer). If Ns < Np, then Vs < Vp (Step-Down Transformer)."
    ]
  }
];
