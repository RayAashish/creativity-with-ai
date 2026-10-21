import { LearningTopic } from '../../types';

export const APTITUDE_LEARNING_TOPICS: LearningTopic[] = [
  {
    id: 'apt-speed-distance',
    subject: 'aptitude',
    title: 'Quantitative: Time, Speed, Distance & Relative Motion',
    category: 'Quantitative Aptitude',
    readTimeMinutes: 9,
    summary: 'Conversion factors, Average Speed formula, Trains crossing poles/platforms, Relative speed in same/opposite directions, and Boats & Streams.',
    content: {
      coreConcept: `Core relationship: $\\text{Distance} = \\text{Speed} \\times \\text{Time}$.

### Critical Conversion & Formulas:
- **Unit Conversion**: $1 \\text{ km/h} = \\frac{5}{18} \\text{ m/s}$ and $1 \\text{ m/s} = \\frac{18}{5} \\text{ km/h}$.
- **Average Speed**: $\\frac{\\text{Total Distance}}{\\text{Total Time}}$.
  - If equal distances are covered at speeds $x$ and $y$: $\\text{Average Speed} = \\frac{2xy}{x+y}$.
- **Relative Speed**:
  - Two objects moving in **opposite directions**: $S_{\\text{rel}} = S_1 + S_2$.
  - Two objects moving in the **same direction**: $S_{\\text{rel}} = |S_1 - S_2|$.
- **Trains**:
  - Crossing a point object (pole, person, standing tree): $\\text{Distance} = L_{\\text{train}}$.
  - Crossing an extended object (platform, bridge, tunnel): $\\text{Distance} = L_{\\text{train}} + L_{\\text{platform}}$.
- **Boats and Streams**:
  - Downstream speed $D = u + v$, Upstream speed $U = u - v$ (where $u$ = boat speed in still water, $v$ = stream speed).
  - Boat speed $u = \\frac{D + U}{2}$, Stream speed $v = \\frac{D - U}{2}$.`,
      keyPoints: [
        'Average speed is the harmonic mean when distances are equal, NOT arithmetic mean (x+y)/2.',
        'When time is constant, Distance is directly proportional to Speed: D1/D2 = S1/S2.',
        'When distance is constant, Speed is inversely proportional to Time: S1/S2 = T2/T1.'
      ],
      formulasAndRules: [
        { title: 'Equal Distance Avg Speed', detail: 'Avg Speed = 2xy / (x + y)' },
        { title: 'Train crossing platform', detail: 'Time = (Length of Train + Length of Platform) / Speed of Train' },
        { title: 'Boat in Still Water', detail: 'u = (Downstream + Upstream) / 2' }
      ],
      interviewPitfalls: [
        'Calculating average speed by taking the arithmetic mean of the two speeds: (60 + 40)/2 = 50 is WRONG for round trips! Correct answer is 2*60*40/(60+40) = 48 km/h.',
        'Forgetting to convert km/h to m/s when train lengths are given in meters.'
      ],
      gateOrPlacementTip: 'TCS NQT favorite: "A train 150m long traveling at 54 km/h crosses a platform in 20 seconds. Find platform length." (54 km/h = 15 m/s. Total distance = 15 * 20 = 300m. Platform = 300 - 150 = 150m).'
    },
    quickQuiz: [
      {
        question: 'A person drives to office at 40 km/h and returns along the same route at 60 km/h. What is the average speed for the entire journey?',
        options: ['50 km/h', '48 km/h', '45 km/h', '52 km/h'],
        correctAnswer: 1,
        explanation: 'For equal distance covered at speeds x and y, Average Speed = 2xy / (x + y) = (2 * 40 * 60) / (40 + 60) = 4800 / 100 = 48 km/h.'
      }
    ]
  },
  {
    id: 'apt-work-pipes',
    subject: 'aptitude',
    title: 'Quantitative: Time & Work, Pipes & Cisterns',
    category: 'Quantitative Aptitude',
    readTimeMinutes: 9,
    summary: 'LCM efficiency method, Man-Days formula (M1*D1*H1/W1 = M2*D2*H2/W2), Alternating day work, and Negative efficiency of leak pipes.',
    content: {
      coreConcept: `Work done is directly proportional to time and efficiency: $\\text{Work} = \\text{Efficiency} \\times \\text{Time}$.

### The High-Speed LCM Method:
Instead of dealing with fractions $\\frac{1}{A} + \\frac{1}{B}$, assume Total Work = $\\text{LCM}(T_A, T_B, \\dots)$.
- Example: $A$ takes 12 days, $B$ takes 15 days.
  - Let Total Work = $\\text{LCM}(12, 15) = 60$ units.
  - $A$\'s efficiency = $\\frac{60}{12} = 5$ units/day.
  - $B$\'s efficiency = $\\frac{60}{15} = 4$ units/day.
  - Combined efficiency = $5 + 4 = 9$ units/day.
  - Combined time = $\\frac{60}{9} = \\frac{20}{3} = 6.67$ days.

### Chain Rule (Man-Days Formula):
$$\\frac{M_1 \\cdot D_1 \\cdot H_1 \\cdot E_1}{W_1} = \\frac{M_2 \\cdot D_2 \\cdot H_2 \\cdot E_2}{W_2}$$
where $M$ = people, $D$ = days, $H$ = hours/day, $E$ = efficiency, $W$ = work/output.

### Pipes and Cisterns:
- Inlet pipes have **positive efficiency**.
- Outlet/Leak pipes have **negative efficiency**.
- If inlet fills in $x$ hours and leak empties in $y$ hours ($y > x$), net rate = $\\frac{1}{x} - \\frac{1}{y}$.`,
      keyPoints: [
        'Efficiency is inversely proportional to time taken: If A is 3 times as efficient as B, ratio of time taken is 1:3.',
        'Negative efficiency in pipes: Leaks drain tank, subtract their unit rate from filling pipes.'
      ],
      formulasAndRules: [
        { title: 'Chain Rule', detail: '(M1 * D1 * H1) / W1 = (M2 * D2 * H2) / W2' },
        { title: 'Combined Work Time', detail: 'T_together = (A * B) / (A + B) for two workers' }
      ],
      interviewPitfalls: [
        'When workers work on alternate days: always calculate work done in pairs of cycles (e.g., 2-day work blocks) and handle the remainder cautiously.',
        'Mixing up Work (wages earned, walls built) in numerator instead of denominator in Chain Rule.'
      ],
      gateOrPlacementTip: 'Wipro / Infosys favorite: "12 men can complete a work in 8 days. After 3 days, 3 more men joined. In how many more days will the work finish?" Use remaining work: 12 men had 5 days left = 60 man-days. With 15 men: 60/15 = 4 days.'
    },
    quickQuiz: [
      {
        question: 'Pipe A can fill a tank in 6 hours, and Pipe B can empty it in 8 hours. If both pipes are opened simultaneously, in how many hours will the tank fill?',
        options: ['14 hours', '24 hours', '18 hours', '12 hours'],
        correctAnswer: 1,
        explanation: 'LCM(6, 8) = 24 units. A rate = +4 units/hr, B rate = -3 units/hr. Net filling rate = 4 - 3 = +1 unit/hr. Time required = 24 / 1 = 24 hours.'
      }
    ]
  },
  {
    id: 'apt-logical-syllogisms',
    subject: 'aptitude',
    title: 'Logical Reasoning: Syllogisms & Venn Deductions',
    category: 'Logical Reasoning',
    readTimeMinutes: 10,
    summary: 'Standard categorical propositions (A, E, I, O), Venn diagram analysis, Neither-Nor vs Either-Or rules, and Possibility conclusions.',
    content: {
      coreConcept: `Syllogism tests logical deductions based strictly on given statements, irrespective of real-world facts.

### 4 Standard Proposition Types:
1. **Universal Affirmative (A)**: \`All X are Y\` (Circle X inside Circle Y).
2. **Universal Negative (E)**: \`No X is Y\` (Disjoint circles with cross barrier).
3. **Particular Affirmative (I)**: \`Some X are Y\` (Overlapping circles).
4. **Particular Negative (O)**: \`Some X are not Y\`.

### Either-Or (Complementary Pair) Conditions:
Two conclusions form an **Either-Or** condition if:
1. Both conclusions are individually **indefinite / false** based on basic Venn diagram.
2. Both share the **same subject and predicate**.
3. They form complementary pairs:
   - (\`Some\` + \`No\`)
   - (\`All\` + \`Some not\`)
   - (\`Some\` + \`Some not\`) *(Note: \`All\` + \`No\` NEVER forms an Either-Or pair!)*

### Dealing with Possibility:
- If a conclusion is already definitely true, its possibility is **FALSE**.
- If a conclusion can be true in ANY one valid Venn diagram without violating statements, its possibility is **TRUE**.`,
      keyPoints: [
        'Only A are B translates to: All B are A (and no other element can touch B).',
        'Few, A few, At least some, Many, Most all translate to: SOME.',
        'Never bring outside real-world common sense (e.g. "All cats are dogs"). Treat statements as absolute truth.'
      ],
      diagramOrAscii: `
      "Some A are B" + "All B are C":
         +---+
         | A |-----+
         +---+  B  |
                |  C  |
                +-----+
      Deductions:
      - "Some A are C" is DEFINITELY TRUE!
      - "All A are C" is a POSSIBILITY, not definite.
      `,
      interviewPitfalls: [
        'Pairing "All A are B" with "No A is B" as Either-Or: Both can be simultaneously false if "Some A are B and Some A are not B".',
        'Rejecting a possibility just because it does not appear in the basic minimal diagram.'
      ],
      gateOrPlacementTip: 'TCS NQT and Campus placement rounds always have 2-3 Syllogism questions. Master the Venn diagram method and memorize the 3 Either-Or rules!'
    },
    quickQuiz: [
      {
        question: 'Statements: "All cars are bikes. No bike is train." Conclusions: I. No car is train. II. Some bikes are cars.',
        options: ['Only I follows', 'Only II follows', 'Both I and II follow', 'Neither follows'],
        correctAnswer: 2,
        explanation: 'Since all cars are inside bikes, and no bike touches trains, car can never touch train (I definitely follows). Also since all cars are bikes, there must be some bikes that are cars (II follows). Both follow.'
      }
    ]
  },
  {
    id: 'apt-logical-blood-relations',
    subject: 'aptitude',
    title: 'Logical Reasoning: Blood Relations & Direction Sense',
    category: 'Logical Reasoning',
    readTimeMinutes: 8,
    summary: 'Family tree generation symbols, Gender identification rules, Coded relations (A + B means A is father of B), and 8-point cardinal direction vectors.',
    content: {
      coreConcept: `Family tree diagramming standard conventions:
- **Male**: $\\square$ or $[+]$
- **Female**: $\\bigcirc$ or $[-]$
- **Spouse**: Double horizontal line ($=$)
- **Siblings**: Single horizontal line ($-$)
- **Generations**: Vertical drop line ($|$)

### Cardinal Directions & Vector Steps:
- North ($+y$), South ($-y$), East ($+x$), West ($-x$).
- Turning Right from North $\\to$ East ($90^\\circ$ clockwise).
- Turning Left from North $\\to$ West ($90^\\circ$ counter-clockwise).
- Shortest straight-line displacement uses Pythagoras theorem:
$$d = \\sqrt{(\\Delta x)^2 + (\\Delta y)^2}$$`,
      keyPoints: [
        'Never assume gender based on name (e.g. "Kiran", "Taylor", "Alex"). Gender must be explicitly deduced from pronouns or relationship descriptors.',
        'Maternal: Mother\'s side (Maternal uncle = Mother\'s brother). Paternal: Father\'s side.',
        'Shadow questions: At sunrise, shadows fall to the West. At sunset, shadows fall to the East. At noon, no shadow is cast directly.'
      ],
      interviewPitfalls: [
        'Confusing "Pointing to a photograph" speaker perspective. Always break sentences from the end: "He is the son of [the only daughter of my father]".',
        'Misjudging left and right turns when facing South (Facing South, Right is West, Left is East).'
      ],
      gateOrPlacementTip: 'Campus exams love coded blood relations: "If P + Q means P is mother of Q, P * Q means P is father of Q... find if A is grandfather of B." Trace generational levels (+1, -1) to eliminate options rapidly.'
    },
    quickQuiz: [
      {
        question: 'A man walks 4 km North, turns right and walks 3 km. How far and in which direction is he from his starting point?',
        options: ['5 km North-East', '7 km North', '5 km North-West', '7 km North-East'],
        correctAnswer: 0,
        explanation: 'Vertical change dy = +4 km (North), Horizontal change dx = +3 km (East). By Pythagoras theorem, Distance = sqrt(4^2 + 3^2) = sqrt(25) = 5 km in the North-East direction.'
      }
    ]
  }
];
