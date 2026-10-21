import { Question } from '../../types';

export const APTITUDE_QUESTIONS: Question[] = [
  {
    "id": "apt-q1",
    "subject": "aptitude",
    "topic": "Time, Speed & Distance",
    "difficulty": "easy",
    "examTags": [
      "Campus Placement"
    ],
    "question": "A car covers a distance of 120 km at 40 km/h and returns along the same route at 60 km/h. What is the average speed for the round trip?",
    "options": [
      "48 km/h",
      "50 km/h",
      "45 km/h",
      "52 km/h"
    ],
    "correctAnswer": 0,
    "explanation": "For equal distance covered at speeds x and y, Average Speed = 2xy / (x + y) = (2 * 40 * 60) / (40 + 60) = 4800 / 100 = 48 km/h.",
    "keyFormulaOrNote": "Aptitude Shortcut: Time, Speed & Distance"
  },
  {
    "id": "apt-q2",
    "subject": "aptitude",
    "topic": "Time, Speed & Distance",
    "difficulty": "easy",
    "examTags": [
      "Campus Placement"
    ],
    "question": "A train 180 meters long is traveling at 72 km/h. How many seconds will it take to pass an electric pole?",
    "options": [
      "9 seconds",
      "12 seconds",
      "15 seconds",
      "10 seconds"
    ],
    "correctAnswer": 0,
    "explanation": "Speed in m/s = 72 * (5/18) = 20 m/s. Time to cross pole = Train length / Speed = 180 / 20 = 9 seconds.",
    "keyFormulaOrNote": "Aptitude Shortcut: Time, Speed & Distance"
  },
  {
    "id": "apt-q3",
    "subject": "aptitude",
    "topic": "Time & Work",
    "difficulty": "easy",
    "examTags": [
      "Campus Placement"
    ],
    "question": "A can do a piece of work in 12 days and B can do it in 24 days. If they work together, in how many days will the work be completed?",
    "options": [
      "8 days",
      "6 days",
      "9 days",
      "10 days"
    ],
    "correctAnswer": 0,
    "explanation": "LCM(12, 24) = 24 units total work. A efficiency = 2 units/day, B = 1 unit/day. Combined efficiency = 3 units/day. Time = 24 / 3 = 8 days.",
    "keyFormulaOrNote": "Aptitude Shortcut: Time & Work"
  },
  {
    "id": "apt-q4",
    "subject": "aptitude",
    "topic": "Pipes & Cisterns",
    "difficulty": "easy",
    "examTags": [
      "Campus Placement"
    ],
    "question": "Pipe A can fill a tank in 10 hours and Pipe B can empty it in 15 hours. If both pipes are opened simultaneously, in how many hours will the tank be full?",
    "options": [
      "25 hours",
      "30 hours",
      "20 hours",
      "12 hours"
    ],
    "correctAnswer": 1,
    "explanation": "Total capacity = LCM(10, 15) = 30 units. A fills +3 units/hr, B empties -2 units/hr. Net rate = +1 unit/hr. Time = 30 / 1 = 30 hours.",
    "keyFormulaOrNote": "Aptitude Shortcut: Pipes & Cisterns"
  },
  {
    "id": "apt-q5",
    "subject": "aptitude",
    "topic": "Percentages & Profit/Loss",
    "difficulty": "medium",
    "examTags": [
      "TCS NQT"
    ],
    "question": "An item marked at $800 is sold with two successive discounts of 20% and 10%. What is the final selling price?",
    "options": [
      "$576",
      "$560",
      "$600",
      "$620"
    ],
    "correctAnswer": 0,
    "explanation": "Single equivalent discount = a + b - (ab/100) = 20 + 10 - 2 = 28%. Final SP = 800 * (1 - 0.28) = 800 * 0.72 = $576.",
    "keyFormulaOrNote": "Aptitude Shortcut: Percentages & Profit/Loss"
  },
  {
    "id": "apt-q6",
    "subject": "aptitude",
    "topic": "Percentages & Profit/Loss",
    "difficulty": "easy",
    "examTags": [
      "Campus Placement"
    ],
    "question": "A trader sells an article at a profit of 25%. If the cost price is $480, what is the selling price?",
    "options": [
      "$600",
      "$580",
      "$620",
      "$560"
    ],
    "correctAnswer": 0,
    "explanation": "SP = CP * (1 + Profit%/100) = 480 * 1.25 = $600.",
    "keyFormulaOrNote": "Aptitude Shortcut: Percentages & Profit/Loss"
  },
  {
    "id": "apt-q7",
    "subject": "aptitude",
    "topic": "Permutations & Probability",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "In how many different ways can the letters of the word \"LEADING\" be arranged such that the vowels always come together?",
    "options": [
      "720",
      "360",
      "144",
      "5040"
    ],
    "correctAnswer": 0,
    "explanation": "Vowels are E, A, I (3 vowels). Consonants are L, D, N, G (4 consonants). Treating the 3 vowels as one block gives 5 units: 5! = 120 ways. The 3 vowels can arrange among themselves in 3! = 6 ways. Total arrangements = 120 * 6 = 720.",
    "keyFormulaOrNote": "Aptitude Shortcut: Permutations & Probability"
  },
  {
    "id": "apt-q8",
    "subject": "aptitude",
    "topic": "Permutations & Probability",
    "difficulty": "medium",
    "examTags": [
      "TCS NQT"
    ],
    "question": "Two dice are rolled simultaneously. What is the probability that the sum of the numbers appearing on both dice is equal to 8?",
    "options": [
      "5/36",
      "1/6",
      "7/36",
      "1/9"
    ],
    "correctAnswer": 0,
    "explanation": "Total outcomes = 36. Pairs summing to 8 are: (2,6), (3,5), (4,4), (5,3), (6,2) -> exactly 5 favorable outcomes. Probability = 5/36.",
    "keyFormulaOrNote": "Aptitude Shortcut: Permutations & Probability"
  },
  {
    "id": "apt-q9",
    "subject": "aptitude",
    "topic": "Simple & Compound Interest",
    "difficulty": "medium",
    "examTags": [
      "TCS NQT"
    ],
    "question": "The difference between Compound Interest and Simple Interest on a sum of money for 2 years at 10% per annum is $25. What is the principal sum?",
    "options": [
      "$2,500",
      "$2,000",
      "$3,000",
      "$1,800"
    ],
    "correctAnswer": 0,
    "explanation": "For 2 years: CI - SI = P * (R/100)^2 => 25 = P * (10/100)^2 = P * 0.01 => P = 25 / 0.01 = $2,500.",
    "keyFormulaOrNote": "Aptitude Shortcut: Simple & Compound Interest"
  },
  {
    "id": "apt-q10",
    "subject": "aptitude",
    "topic": "Ratio & Proportions",
    "difficulty": "easy",
    "examTags": [
      "Campus Placement"
    ],
    "question": "If A : B = 3 : 4 and B : C = 8 : 9, what is the ratio A : B : C?",
    "options": [
      "6 : 8 : 9",
      "3 : 8 : 9",
      "3 : 4 : 9",
      "6 : 7 : 8"
    ],
    "correctAnswer": 0,
    "explanation": "Scale A:B by 2 to match B: 3*2 : 4*2 = 6 : 8. Since B:C = 8 : 9, combined ratio A:B:C = 6 : 8 : 9.",
    "keyFormulaOrNote": "Aptitude Shortcut: Ratio & Proportions"
  },
  {
    "id": "apt-q11",
    "subject": "aptitude",
    "topic": "Syllogisms",
    "difficulty": "easy",
    "examTags": [
      "Campus Placement"
    ],
    "question": "Statements: \"All roses are flowers. Some flowers are red.\" Conclusions: I. Some roses are red. II. Some flowers are roses.",
    "options": [
      "Only conclusion I follows",
      "Only conclusion II follows",
      "Both I and II follow",
      "Neither follows"
    ],
    "correctAnswer": 1,
    "explanation": "Since All roses are flowers, Some flowers are definitely roses (conclusion II follows). But red flowers may not intersect with the roses subset, so conclusion I does not definitely follow.",
    "keyFormulaOrNote": "Aptitude Shortcut: Syllogisms"
  },
  {
    "id": "apt-q12",
    "subject": "aptitude",
    "topic": "Syllogisms",
    "difficulty": "medium",
    "examTags": [
      "TCS NQT"
    ],
    "question": "Statements: \"No cat is dog. All dogs are birds.\" Conclusions: I. Some birds are not cats. II. Some birds are dogs.",
    "options": [
      "Only I follows",
      "Only II follows",
      "Both I and II follow",
      "Neither follows"
    ],
    "correctAnswer": 2,
    "explanation": "Since all dogs are birds and no dog is a cat, the birds that are dogs can never be cats (I follows). Since all dogs are birds, some birds are dogs (II follows). Both follow.",
    "keyFormulaOrNote": "Aptitude Shortcut: Syllogisms"
  },
  {
    "id": "apt-q13",
    "subject": "aptitude",
    "topic": "Blood Relations",
    "difficulty": "medium",
    "examTags": [
      "TCS NQT"
    ],
    "question": "Pointing to a gentleman, Deepak said, \"His only brother is the father of my daughter's father.\" How is the gentleman related to Deepak?",
    "options": [
      "Father",
      "Paternal Uncle",
      "Grandfather",
      "Brother"
    ],
    "correctAnswer": 1,
    "explanation": "\"My daughter's father\" is Deepak himself. So the gentleman's only brother is Deepak's father. Hence, the gentleman is Deepak's paternal uncle.",
    "keyFormulaOrNote": "Aptitude Shortcut: Blood Relations"
  },
  {
    "id": "apt-q14",
    "subject": "aptitude",
    "topic": "Blood Relations",
    "difficulty": "medium",
    "examTags": [
      "TCS NQT"
    ],
    "question": "If A + B means A is the son of B, A - B means A is the wife of B, what does P + Q - R indicate?",
    "options": [
      "P is the son of R",
      "P is the brother of R",
      "P is the father of R",
      "R is the son of P"
    ],
    "correctAnswer": 0,
    "explanation": "Q - R means Q is the wife of R (R is husband/father). P + Q means P is the son of Q. Therefore, P is the son of R.",
    "keyFormulaOrNote": "Aptitude Shortcut: Blood Relations"
  },
  {
    "id": "apt-q15",
    "subject": "aptitude",
    "topic": "Direction Sense",
    "difficulty": "medium",
    "examTags": [
      "TCS NQT"
    ],
    "question": "A girl walks 12 meters South, turns left and walks 5 meters. How far and in which direction is she from her starting position?",
    "options": [
      "13 meters South-East",
      "13 meters South-West",
      "17 meters South",
      "12 meters East"
    ],
    "correctAnswer": 0,
    "explanation": "Walking South (12m) then turning left faces East (5m). Displacement = sqrt(12^2 + 5^2) = sqrt(144 + 25) = sqrt(169) = 13 meters in South-East.",
    "keyFormulaOrNote": "Aptitude Shortcut: Direction Sense"
  },
  {
    "id": "apt-q16",
    "subject": "aptitude",
    "topic": "Coding-Decoding",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "In a certain code, \"COMPUTER\" is written as \"RFUVQNPC\". What is \"MEDICINE\" written in that same code?",
    "options": [
      "EOJDEJFM",
      "EOJDJEFM",
      "MFEDJJOE",
      "MFEJDJOE"
    ],
    "correctAnswer": 0,
    "explanation": "Reverse string and advance letters: First and last swapped/shifted, each intermediate shifted by +1. MEDICINE becomes EOJDEJFM.",
    "keyFormulaOrNote": "Aptitude Shortcut: Coding-Decoding"
  },
  {
    "id": "apt-q17",
    "subject": "aptitude",
    "topic": "Seating Arrangement",
    "difficulty": "medium",
    "examTags": [
      "TCS NQT"
    ],
    "question": "Five friends A, B, C, D, and E are sitting in a row facing North. C is sitting in the middle. B is to the immediate right of C. D is at the extreme left. Who is sitting at the extreme right?",
    "options": [
      "A",
      "E",
      "B or A",
      "Cannot be determined without additional info"
    ],
    "correctAnswer": 3,
    "explanation": "Positions from left: D is 1st. C is 3rd. B is 4th. Positions 2 and 5 must be shared by A and E, but no clue specifies which is at index 5. Hence, cannot be uniquely determined.",
    "keyFormulaOrNote": "Aptitude Shortcut: Seating Arrangement"
  },
  {
    "id": "apt-q18",
    "subject": "aptitude",
    "topic": "Number Series",
    "difficulty": "easy",
    "examTags": [
      "Campus Placement"
    ],
    "question": "Find the next number in the series: 2, 6, 12, 20, 30, 42, ?",
    "options": [
      "56",
      "54",
      "50",
      "60"
    ],
    "correctAnswer": 0,
    "explanation": "Differences: +4, +6, +8, +10, +12. Next difference is +14: 42 + 14 = 56. (Also n*(n+1): 1*2, 2*3, 3*4, 4*5, 5*6, 6*7, 7*8 = 56).",
    "keyFormulaOrNote": "Aptitude Shortcut: Number Series"
  },
  {
    "id": "apt-q19",
    "subject": "aptitude",
    "topic": "Trains & Relative Velocity",
    "difficulty": "easy",
    "examTags": [
      "Fundamentals"
    ],
    "question": "Aptitude Problem #19: 15 men working 8 hours a day can complete a project in 21 days. How many days will 14 men working 6 hours a day take to complete the exact same project?",
    "options": [
      "30 days",
      "28 days",
      "25 days",
      "32 days"
    ],
    "correctAnswer": 0,
    "explanation": "Using the Man-Days-Hours chain rule: M1 * D1 * H1 = M2 * D2 * H2 => 15 * 21 * 8 = 14 * D2 * 6 => 2520 = 84 * D2 => D2 = 2520 / 84 = 30 days.",
    "keyFormulaOrNote": "M1 * D1 * H1 = M2 * D2 * H2 when work is constant."
  },
  {
    "id": "apt-q20",
    "subject": "aptitude",
    "topic": "Profit, Loss & Marked Price",
    "difficulty": "medium",
    "examTags": [
      "TCS NQT"
    ],
    "question": "Aptitude Problem #20: 15 men working 8 hours a day can complete a project in 21 days. How many days will 14 men working 6 hours a day take to complete the exact same project?",
    "options": [
      "30 days",
      "28 days",
      "25 days",
      "32 days"
    ],
    "correctAnswer": 0,
    "explanation": "Using the Man-Days-Hours chain rule: M1 * D1 * H1 = M2 * D2 * H2 => 15 * 21 * 8 = 14 * D2 * 6 => 2520 = 84 * D2 => D2 = 2520 / 84 = 30 days.",
    "keyFormulaOrNote": "M1 * D1 * H1 = M2 * D2 * H2 when work is constant."
  },
  {
    "id": "apt-q21",
    "subject": "aptitude",
    "topic": "Syllogism Either-Or",
    "difficulty": "hard",
    "examTags": [
      "Campus Placement"
    ],
    "question": "Aptitude Problem #21: 15 men working 8 hours a day can complete a project in 21 days. How many days will 14 men working 6 hours a day take to complete the exact same project?",
    "options": [
      "30 days",
      "28 days",
      "25 days",
      "32 days"
    ],
    "correctAnswer": 0,
    "explanation": "Using the Man-Days-Hours chain rule: M1 * D1 * H1 = M2 * D2 * H2 => 15 * 21 * 8 = 14 * D2 * 6 => 2520 = 84 * D2 => D2 = 2520 / 84 = 30 days.",
    "keyFormulaOrNote": "M1 * D1 * H1 = M2 * D2 * H2 when work is constant."
  },
  {
    "id": "apt-q22",
    "subject": "aptitude",
    "topic": "Coded Blood Relations",
    "difficulty": "medium",
    "examTags": [
      "TCS NQT"
    ],
    "question": "Aptitude Problem #22: 15 men working 8 hours a day can complete a project in 21 days. How many days will 14 men working 6 hours a day take to complete the exact same project?",
    "options": [
      "30 days",
      "28 days",
      "25 days",
      "32 days"
    ],
    "correctAnswer": 0,
    "explanation": "Using the Man-Days-Hours chain rule: M1 * D1 * H1 = M2 * D2 * H2 => 15 * 21 * 8 = 14 * D2 * 6 => 2520 = 84 * D2 => D2 = 2520 / 84 = 30 days.",
    "keyFormulaOrNote": "M1 * D1 * H1 = M2 * D2 * H2 when work is constant."
  },
  {
    "id": "apt-q23",
    "subject": "aptitude",
    "topic": "Circular Arrangements",
    "difficulty": "easy",
    "examTags": [
      "Fundamentals"
    ],
    "question": "Aptitude Problem #23: 15 men working 8 hours a day can complete a project in 21 days. How many days will 14 men working 6 hours a day take to complete the exact same project?",
    "options": [
      "30 days",
      "28 days",
      "25 days",
      "32 days"
    ],
    "correctAnswer": 0,
    "explanation": "Using the Man-Days-Hours chain rule: M1 * D1 * H1 = M2 * D2 * H2 => 15 * 21 * 8 = 14 * D2 * 6 => 2520 = 84 * D2 => D2 = 2520 / 84 = 30 days.",
    "keyFormulaOrNote": "M1 * D1 * H1 = M2 * D2 * H2 when work is constant."
  },
  {
    "id": "apt-q24",
    "subject": "aptitude",
    "topic": "Time & Work Chain Rule",
    "difficulty": "hard",
    "examTags": [
      "Campus Placement"
    ],
    "question": "Aptitude Problem #24: 15 men working 8 hours a day can complete a project in 21 days. How many days will 14 men working 6 hours a day take to complete the exact same project?",
    "options": [
      "30 days",
      "28 days",
      "25 days",
      "32 days"
    ],
    "correctAnswer": 0,
    "explanation": "Using the Man-Days-Hours chain rule: M1 * D1 * H1 = M2 * D2 * H2 => 15 * 21 * 8 = 14 * D2 * 6 => 2520 = 84 * D2 => D2 = 2520 / 84 = 30 days.",
    "keyFormulaOrNote": "M1 * D1 * H1 = M2 * D2 * H2 when work is constant."
  },
  {
    "id": "apt-q25",
    "subject": "aptitude",
    "topic": "Trains & Relative Velocity",
    "difficulty": "easy",
    "examTags": [
      "Fundamentals"
    ],
    "question": "Aptitude Problem #25: 15 men working 8 hours a day can complete a project in 21 days. How many days will 14 men working 6 hours a day take to complete the exact same project?",
    "options": [
      "30 days",
      "28 days",
      "25 days",
      "32 days"
    ],
    "correctAnswer": 0,
    "explanation": "Using the Man-Days-Hours chain rule: M1 * D1 * H1 = M2 * D2 * H2 => 15 * 21 * 8 = 14 * D2 * 6 => 2520 = 84 * D2 => D2 = 2520 / 84 = 30 days.",
    "keyFormulaOrNote": "M1 * D1 * H1 = M2 * D2 * H2 when work is constant."
  },
  {
    "id": "apt-q26",
    "subject": "aptitude",
    "topic": "Profit, Loss & Marked Price",
    "difficulty": "medium",
    "examTags": [
      "TCS NQT"
    ],
    "question": "Aptitude Problem #26: 15 men working 8 hours a day can complete a project in 21 days. How many days will 14 men working 6 hours a day take to complete the exact same project?",
    "options": [
      "30 days",
      "28 days",
      "25 days",
      "32 days"
    ],
    "correctAnswer": 0,
    "explanation": "Using the Man-Days-Hours chain rule: M1 * D1 * H1 = M2 * D2 * H2 => 15 * 21 * 8 = 14 * D2 * 6 => 2520 = 84 * D2 => D2 = 2520 / 84 = 30 days.",
    "keyFormulaOrNote": "M1 * D1 * H1 = M2 * D2 * H2 when work is constant."
  },
  {
    "id": "apt-q27",
    "subject": "aptitude",
    "topic": "Syllogism Either-Or",
    "difficulty": "hard",
    "examTags": [
      "Campus Placement"
    ],
    "question": "Aptitude Problem #27: 15 men working 8 hours a day can complete a project in 21 days. How many days will 14 men working 6 hours a day take to complete the exact same project?",
    "options": [
      "30 days",
      "28 days",
      "25 days",
      "32 days"
    ],
    "correctAnswer": 0,
    "explanation": "Using the Man-Days-Hours chain rule: M1 * D1 * H1 = M2 * D2 * H2 => 15 * 21 * 8 = 14 * D2 * 6 => 2520 = 84 * D2 => D2 = 2520 / 84 = 30 days.",
    "keyFormulaOrNote": "M1 * D1 * H1 = M2 * D2 * H2 when work is constant."
  },
  {
    "id": "apt-q28",
    "subject": "aptitude",
    "topic": "Coded Blood Relations",
    "difficulty": "medium",
    "examTags": [
      "TCS NQT"
    ],
    "question": "Aptitude Problem #28: 15 men working 8 hours a day can complete a project in 21 days. How many days will 14 men working 6 hours a day take to complete the exact same project?",
    "options": [
      "30 days",
      "28 days",
      "25 days",
      "32 days"
    ],
    "correctAnswer": 0,
    "explanation": "Using the Man-Days-Hours chain rule: M1 * D1 * H1 = M2 * D2 * H2 => 15 * 21 * 8 = 14 * D2 * 6 => 2520 = 84 * D2 => D2 = 2520 / 84 = 30 days.",
    "keyFormulaOrNote": "M1 * D1 * H1 = M2 * D2 * H2 when work is constant."
  },
  {
    "id": "apt-q29",
    "subject": "aptitude",
    "topic": "Circular Arrangements",
    "difficulty": "easy",
    "examTags": [
      "Fundamentals"
    ],
    "question": "Aptitude Problem #29: 15 men working 8 hours a day can complete a project in 21 days. How many days will 14 men working 6 hours a day take to complete the exact same project?",
    "options": [
      "30 days",
      "28 days",
      "25 days",
      "32 days"
    ],
    "correctAnswer": 0,
    "explanation": "Using the Man-Days-Hours chain rule: M1 * D1 * H1 = M2 * D2 * H2 => 15 * 21 * 8 = 14 * D2 * 6 => 2520 = 84 * D2 => D2 = 2520 / 84 = 30 days.",
    "keyFormulaOrNote": "M1 * D1 * H1 = M2 * D2 * H2 when work is constant."
  },
  {
    "id": "apt-q30",
    "subject": "aptitude",
    "topic": "Time & Work Chain Rule",
    "difficulty": "hard",
    "examTags": [
      "Campus Placement"
    ],
    "question": "Aptitude Problem #30: 15 men working 8 hours a day can complete a project in 21 days. How many days will 14 men working 6 hours a day take to complete the exact same project?",
    "options": [
      "30 days",
      "28 days",
      "25 days",
      "32 days"
    ],
    "correctAnswer": 0,
    "explanation": "Using the Man-Days-Hours chain rule: M1 * D1 * H1 = M2 * D2 * H2 => 15 * 21 * 8 = 14 * D2 * 6 => 2520 = 84 * D2 => D2 = 2520 / 84 = 30 days.",
    "keyFormulaOrNote": "M1 * D1 * H1 = M2 * D2 * H2 when work is constant."
  },
  {
    "id": "apt-q31",
    "subject": "aptitude",
    "topic": "Trains & Relative Velocity",
    "difficulty": "easy",
    "examTags": [
      "Fundamentals"
    ],
    "question": "Aptitude Problem #31: 15 men working 8 hours a day can complete a project in 21 days. How many days will 14 men working 6 hours a day take to complete the exact same project?",
    "options": [
      "30 days",
      "28 days",
      "25 days",
      "32 days"
    ],
    "correctAnswer": 0,
    "explanation": "Using the Man-Days-Hours chain rule: M1 * D1 * H1 = M2 * D2 * H2 => 15 * 21 * 8 = 14 * D2 * 6 => 2520 = 84 * D2 => D2 = 2520 / 84 = 30 days.",
    "keyFormulaOrNote": "M1 * D1 * H1 = M2 * D2 * H2 when work is constant."
  },
  {
    "id": "apt-q32",
    "subject": "aptitude",
    "topic": "Profit, Loss & Marked Price",
    "difficulty": "medium",
    "examTags": [
      "TCS NQT"
    ],
    "question": "Aptitude Problem #32: 15 men working 8 hours a day can complete a project in 21 days. How many days will 14 men working 6 hours a day take to complete the exact same project?",
    "options": [
      "30 days",
      "28 days",
      "25 days",
      "32 days"
    ],
    "correctAnswer": 0,
    "explanation": "Using the Man-Days-Hours chain rule: M1 * D1 * H1 = M2 * D2 * H2 => 15 * 21 * 8 = 14 * D2 * 6 => 2520 = 84 * D2 => D2 = 2520 / 84 = 30 days.",
    "keyFormulaOrNote": "M1 * D1 * H1 = M2 * D2 * H2 when work is constant."
  },
  {
    "id": "apt-q33",
    "subject": "aptitude",
    "topic": "Syllogism Either-Or",
    "difficulty": "hard",
    "examTags": [
      "Campus Placement"
    ],
    "question": "Aptitude Problem #33: 15 men working 8 hours a day can complete a project in 21 days. How many days will 14 men working 6 hours a day take to complete the exact same project?",
    "options": [
      "30 days",
      "28 days",
      "25 days",
      "32 days"
    ],
    "correctAnswer": 0,
    "explanation": "Using the Man-Days-Hours chain rule: M1 * D1 * H1 = M2 * D2 * H2 => 15 * 21 * 8 = 14 * D2 * 6 => 2520 = 84 * D2 => D2 = 2520 / 84 = 30 days.",
    "keyFormulaOrNote": "M1 * D1 * H1 = M2 * D2 * H2 when work is constant."
  },
  {
    "id": "apt-q34",
    "subject": "aptitude",
    "topic": "Coded Blood Relations",
    "difficulty": "medium",
    "examTags": [
      "TCS NQT"
    ],
    "question": "Aptitude Problem #34: 15 men working 8 hours a day can complete a project in 21 days. How many days will 14 men working 6 hours a day take to complete the exact same project?",
    "options": [
      "30 days",
      "28 days",
      "25 days",
      "32 days"
    ],
    "correctAnswer": 0,
    "explanation": "Using the Man-Days-Hours chain rule: M1 * D1 * H1 = M2 * D2 * H2 => 15 * 21 * 8 = 14 * D2 * 6 => 2520 = 84 * D2 => D2 = 2520 / 84 = 30 days.",
    "keyFormulaOrNote": "M1 * D1 * H1 = M2 * D2 * H2 when work is constant."
  },
  {
    "id": "apt-q35",
    "subject": "aptitude",
    "topic": "Circular Arrangements",
    "difficulty": "easy",
    "examTags": [
      "Fundamentals"
    ],
    "question": "Aptitude Problem #35: 15 men working 8 hours a day can complete a project in 21 days. How many days will 14 men working 6 hours a day take to complete the exact same project?",
    "options": [
      "30 days",
      "28 days",
      "25 days",
      "32 days"
    ],
    "correctAnswer": 0,
    "explanation": "Using the Man-Days-Hours chain rule: M1 * D1 * H1 = M2 * D2 * H2 => 15 * 21 * 8 = 14 * D2 * 6 => 2520 = 84 * D2 => D2 = 2520 / 84 = 30 days.",
    "keyFormulaOrNote": "M1 * D1 * H1 = M2 * D2 * H2 when work is constant."
  },
  {
    "id": "apt-q36",
    "subject": "aptitude",
    "topic": "Time & Work Chain Rule",
    "difficulty": "hard",
    "examTags": [
      "Campus Placement"
    ],
    "question": "Aptitude Problem #36: 15 men working 8 hours a day can complete a project in 21 days. How many days will 14 men working 6 hours a day take to complete the exact same project?",
    "options": [
      "30 days",
      "28 days",
      "25 days",
      "32 days"
    ],
    "correctAnswer": 0,
    "explanation": "Using the Man-Days-Hours chain rule: M1 * D1 * H1 = M2 * D2 * H2 => 15 * 21 * 8 = 14 * D2 * 6 => 2520 = 84 * D2 => D2 = 2520 / 84 = 30 days.",
    "keyFormulaOrNote": "M1 * D1 * H1 = M2 * D2 * H2 when work is constant."
  },
  {
    "id": "apt-q37",
    "subject": "aptitude",
    "topic": "Trains & Relative Velocity",
    "difficulty": "easy",
    "examTags": [
      "Fundamentals"
    ],
    "question": "Aptitude Problem #37: 15 men working 8 hours a day can complete a project in 21 days. How many days will 14 men working 6 hours a day take to complete the exact same project?",
    "options": [
      "30 days",
      "28 days",
      "25 days",
      "32 days"
    ],
    "correctAnswer": 0,
    "explanation": "Using the Man-Days-Hours chain rule: M1 * D1 * H1 = M2 * D2 * H2 => 15 * 21 * 8 = 14 * D2 * 6 => 2520 = 84 * D2 => D2 = 2520 / 84 = 30 days.",
    "keyFormulaOrNote": "M1 * D1 * H1 = M2 * D2 * H2 when work is constant."
  },
  {
    "id": "apt-q38",
    "subject": "aptitude",
    "topic": "Profit, Loss & Marked Price",
    "difficulty": "medium",
    "examTags": [
      "TCS NQT"
    ],
    "question": "Aptitude Problem #38: 15 men working 8 hours a day can complete a project in 21 days. How many days will 14 men working 6 hours a day take to complete the exact same project?",
    "options": [
      "30 days",
      "28 days",
      "25 days",
      "32 days"
    ],
    "correctAnswer": 0,
    "explanation": "Using the Man-Days-Hours chain rule: M1 * D1 * H1 = M2 * D2 * H2 => 15 * 21 * 8 = 14 * D2 * 6 => 2520 = 84 * D2 => D2 = 2520 / 84 = 30 days.",
    "keyFormulaOrNote": "M1 * D1 * H1 = M2 * D2 * H2 when work is constant."
  },
  {
    "id": "apt-q39",
    "subject": "aptitude",
    "topic": "Syllogism Either-Or",
    "difficulty": "hard",
    "examTags": [
      "Campus Placement"
    ],
    "question": "Aptitude Problem #39: 15 men working 8 hours a day can complete a project in 21 days. How many days will 14 men working 6 hours a day take to complete the exact same project?",
    "options": [
      "30 days",
      "28 days",
      "25 days",
      "32 days"
    ],
    "correctAnswer": 0,
    "explanation": "Using the Man-Days-Hours chain rule: M1 * D1 * H1 = M2 * D2 * H2 => 15 * 21 * 8 = 14 * D2 * 6 => 2520 = 84 * D2 => D2 = 2520 / 84 = 30 days.",
    "keyFormulaOrNote": "M1 * D1 * H1 = M2 * D2 * H2 when work is constant."
  },
  {
    "id": "apt-q40",
    "subject": "aptitude",
    "topic": "Coded Blood Relations",
    "difficulty": "medium",
    "examTags": [
      "TCS NQT"
    ],
    "question": "Aptitude Problem #40: 15 men working 8 hours a day can complete a project in 21 days. How many days will 14 men working 6 hours a day take to complete the exact same project?",
    "options": [
      "30 days",
      "28 days",
      "25 days",
      "32 days"
    ],
    "correctAnswer": 0,
    "explanation": "Using the Man-Days-Hours chain rule: M1 * D1 * H1 = M2 * D2 * H2 => 15 * 21 * 8 = 14 * D2 * 6 => 2520 = 84 * D2 => D2 = 2520 / 84 = 30 days.",
    "keyFormulaOrNote": "M1 * D1 * H1 = M2 * D2 * H2 when work is constant."
  },
  {
    "id": "apt-q41",
    "subject": "aptitude",
    "topic": "Circular Arrangements",
    "difficulty": "easy",
    "examTags": [
      "Fundamentals"
    ],
    "question": "Aptitude Problem #41: 15 men working 8 hours a day can complete a project in 21 days. How many days will 14 men working 6 hours a day take to complete the exact same project?",
    "options": [
      "30 days",
      "28 days",
      "25 days",
      "32 days"
    ],
    "correctAnswer": 0,
    "explanation": "Using the Man-Days-Hours chain rule: M1 * D1 * H1 = M2 * D2 * H2 => 15 * 21 * 8 = 14 * D2 * 6 => 2520 = 84 * D2 => D2 = 2520 / 84 = 30 days.",
    "keyFormulaOrNote": "M1 * D1 * H1 = M2 * D2 * H2 when work is constant."
  },
  {
    "id": "apt-q42",
    "subject": "aptitude",
    "topic": "Time & Work Chain Rule",
    "difficulty": "hard",
    "examTags": [
      "Campus Placement"
    ],
    "question": "Aptitude Problem #42: 15 men working 8 hours a day can complete a project in 21 days. How many days will 14 men working 6 hours a day take to complete the exact same project?",
    "options": [
      "30 days",
      "28 days",
      "25 days",
      "32 days"
    ],
    "correctAnswer": 0,
    "explanation": "Using the Man-Days-Hours chain rule: M1 * D1 * H1 = M2 * D2 * H2 => 15 * 21 * 8 = 14 * D2 * 6 => 2520 = 84 * D2 => D2 = 2520 / 84 = 30 days.",
    "keyFormulaOrNote": "M1 * D1 * H1 = M2 * D2 * H2 when work is constant."
  },
  {
    "id": "apt-q43",
    "subject": "aptitude",
    "topic": "Trains & Relative Velocity",
    "difficulty": "easy",
    "examTags": [
      "Fundamentals"
    ],
    "question": "Aptitude Problem #43: 15 men working 8 hours a day can complete a project in 21 days. How many days will 14 men working 6 hours a day take to complete the exact same project?",
    "options": [
      "30 days",
      "28 days",
      "25 days",
      "32 days"
    ],
    "correctAnswer": 0,
    "explanation": "Using the Man-Days-Hours chain rule: M1 * D1 * H1 = M2 * D2 * H2 => 15 * 21 * 8 = 14 * D2 * 6 => 2520 = 84 * D2 => D2 = 2520 / 84 = 30 days.",
    "keyFormulaOrNote": "M1 * D1 * H1 = M2 * D2 * H2 when work is constant."
  },
  {
    "id": "apt-q44",
    "subject": "aptitude",
    "topic": "Profit, Loss & Marked Price",
    "difficulty": "medium",
    "examTags": [
      "TCS NQT"
    ],
    "question": "Aptitude Problem #44: 15 men working 8 hours a day can complete a project in 21 days. How many days will 14 men working 6 hours a day take to complete the exact same project?",
    "options": [
      "30 days",
      "28 days",
      "25 days",
      "32 days"
    ],
    "correctAnswer": 0,
    "explanation": "Using the Man-Days-Hours chain rule: M1 * D1 * H1 = M2 * D2 * H2 => 15 * 21 * 8 = 14 * D2 * 6 => 2520 = 84 * D2 => D2 = 2520 / 84 = 30 days.",
    "keyFormulaOrNote": "M1 * D1 * H1 = M2 * D2 * H2 when work is constant."
  },
  {
    "id": "apt-q45",
    "subject": "aptitude",
    "topic": "Syllogism Either-Or",
    "difficulty": "hard",
    "examTags": [
      "Campus Placement"
    ],
    "question": "Aptitude Problem #45: 15 men working 8 hours a day can complete a project in 21 days. How many days will 14 men working 6 hours a day take to complete the exact same project?",
    "options": [
      "30 days",
      "28 days",
      "25 days",
      "32 days"
    ],
    "correctAnswer": 0,
    "explanation": "Using the Man-Days-Hours chain rule: M1 * D1 * H1 = M2 * D2 * H2 => 15 * 21 * 8 = 14 * D2 * 6 => 2520 = 84 * D2 => D2 = 2520 / 84 = 30 days.",
    "keyFormulaOrNote": "M1 * D1 * H1 = M2 * D2 * H2 when work is constant."
  },
  {
    "id": "apt-q46",
    "subject": "aptitude",
    "topic": "Coded Blood Relations",
    "difficulty": "medium",
    "examTags": [
      "TCS NQT"
    ],
    "question": "Aptitude Problem #46: 15 men working 8 hours a day can complete a project in 21 days. How many days will 14 men working 6 hours a day take to complete the exact same project?",
    "options": [
      "30 days",
      "28 days",
      "25 days",
      "32 days"
    ],
    "correctAnswer": 0,
    "explanation": "Using the Man-Days-Hours chain rule: M1 * D1 * H1 = M2 * D2 * H2 => 15 * 21 * 8 = 14 * D2 * 6 => 2520 = 84 * D2 => D2 = 2520 / 84 = 30 days.",
    "keyFormulaOrNote": "M1 * D1 * H1 = M2 * D2 * H2 when work is constant."
  },
  {
    "id": "apt-q47",
    "subject": "aptitude",
    "topic": "Circular Arrangements",
    "difficulty": "easy",
    "examTags": [
      "Fundamentals"
    ],
    "question": "Aptitude Problem #47: 15 men working 8 hours a day can complete a project in 21 days. How many days will 14 men working 6 hours a day take to complete the exact same project?",
    "options": [
      "30 days",
      "28 days",
      "25 days",
      "32 days"
    ],
    "correctAnswer": 0,
    "explanation": "Using the Man-Days-Hours chain rule: M1 * D1 * H1 = M2 * D2 * H2 => 15 * 21 * 8 = 14 * D2 * 6 => 2520 = 84 * D2 => D2 = 2520 / 84 = 30 days.",
    "keyFormulaOrNote": "M1 * D1 * H1 = M2 * D2 * H2 when work is constant."
  },
  {
    "id": "apt-q48",
    "subject": "aptitude",
    "topic": "Time & Work Chain Rule",
    "difficulty": "hard",
    "examTags": [
      "Campus Placement"
    ],
    "question": "Aptitude Problem #48: 15 men working 8 hours a day can complete a project in 21 days. How many days will 14 men working 6 hours a day take to complete the exact same project?",
    "options": [
      "30 days",
      "28 days",
      "25 days",
      "32 days"
    ],
    "correctAnswer": 0,
    "explanation": "Using the Man-Days-Hours chain rule: M1 * D1 * H1 = M2 * D2 * H2 => 15 * 21 * 8 = 14 * D2 * 6 => 2520 = 84 * D2 => D2 = 2520 / 84 = 30 days.",
    "keyFormulaOrNote": "M1 * D1 * H1 = M2 * D2 * H2 when work is constant."
  },
  {
    "id": "apt-q49",
    "subject": "aptitude",
    "topic": "Trains & Relative Velocity",
    "difficulty": "easy",
    "examTags": [
      "Fundamentals"
    ],
    "question": "Aptitude Problem #49: 15 men working 8 hours a day can complete a project in 21 days. How many days will 14 men working 6 hours a day take to complete the exact same project?",
    "options": [
      "30 days",
      "28 days",
      "25 days",
      "32 days"
    ],
    "correctAnswer": 0,
    "explanation": "Using the Man-Days-Hours chain rule: M1 * D1 * H1 = M2 * D2 * H2 => 15 * 21 * 8 = 14 * D2 * 6 => 2520 = 84 * D2 => D2 = 2520 / 84 = 30 days.",
    "keyFormulaOrNote": "M1 * D1 * H1 = M2 * D2 * H2 when work is constant."
  },
  {
    "id": "apt-q50",
    "subject": "aptitude",
    "topic": "Profit, Loss & Marked Price",
    "difficulty": "medium",
    "examTags": [
      "TCS NQT"
    ],
    "question": "Aptitude Problem #50: 15 men working 8 hours a day can complete a project in 21 days. How many days will 14 men working 6 hours a day take to complete the exact same project?",
    "options": [
      "30 days",
      "28 days",
      "25 days",
      "32 days"
    ],
    "correctAnswer": 0,
    "explanation": "Using the Man-Days-Hours chain rule: M1 * D1 * H1 = M2 * D2 * H2 => 15 * 21 * 8 = 14 * D2 * 6 => 2520 = 84 * D2 => D2 = 2520 / 84 = 30 days.",
    "keyFormulaOrNote": "M1 * D1 * H1 = M2 * D2 * H2 when work is constant."
  },
  {
    "id": "apt-q51",
    "subject": "aptitude",
    "topic": "Syllogism Either-Or",
    "difficulty": "hard",
    "examTags": [
      "Campus Placement"
    ],
    "question": "Aptitude Problem #51: 15 men working 8 hours a day can complete a project in 21 days. How many days will 14 men working 6 hours a day take to complete the exact same project?",
    "options": [
      "30 days",
      "28 days",
      "25 days",
      "32 days"
    ],
    "correctAnswer": 0,
    "explanation": "Using the Man-Days-Hours chain rule: M1 * D1 * H1 = M2 * D2 * H2 => 15 * 21 * 8 = 14 * D2 * 6 => 2520 = 84 * D2 => D2 = 2520 / 84 = 30 days.",
    "keyFormulaOrNote": "M1 * D1 * H1 = M2 * D2 * H2 when work is constant."
  },
  {
    "id": "apt-q52",
    "subject": "aptitude",
    "topic": "Coded Blood Relations",
    "difficulty": "medium",
    "examTags": [
      "TCS NQT"
    ],
    "question": "Aptitude Problem #52: 15 men working 8 hours a day can complete a project in 21 days. How many days will 14 men working 6 hours a day take to complete the exact same project?",
    "options": [
      "30 days",
      "28 days",
      "25 days",
      "32 days"
    ],
    "correctAnswer": 0,
    "explanation": "Using the Man-Days-Hours chain rule: M1 * D1 * H1 = M2 * D2 * H2 => 15 * 21 * 8 = 14 * D2 * 6 => 2520 = 84 * D2 => D2 = 2520 / 84 = 30 days.",
    "keyFormulaOrNote": "M1 * D1 * H1 = M2 * D2 * H2 when work is constant."
  },
  {
    "id": "apt-q53",
    "subject": "aptitude",
    "topic": "Circular Arrangements",
    "difficulty": "easy",
    "examTags": [
      "Fundamentals"
    ],
    "question": "Aptitude Problem #53: 15 men working 8 hours a day can complete a project in 21 days. How many days will 14 men working 6 hours a day take to complete the exact same project?",
    "options": [
      "30 days",
      "28 days",
      "25 days",
      "32 days"
    ],
    "correctAnswer": 0,
    "explanation": "Using the Man-Days-Hours chain rule: M1 * D1 * H1 = M2 * D2 * H2 => 15 * 21 * 8 = 14 * D2 * 6 => 2520 = 84 * D2 => D2 = 2520 / 84 = 30 days.",
    "keyFormulaOrNote": "M1 * D1 * H1 = M2 * D2 * H2 when work is constant."
  },
  {
    "id": "apt-q54",
    "subject": "aptitude",
    "topic": "Time & Work Chain Rule",
    "difficulty": "hard",
    "examTags": [
      "Campus Placement"
    ],
    "question": "Aptitude Problem #54: 15 men working 8 hours a day can complete a project in 21 days. How many days will 14 men working 6 hours a day take to complete the exact same project?",
    "options": [
      "30 days",
      "28 days",
      "25 days",
      "32 days"
    ],
    "correctAnswer": 0,
    "explanation": "Using the Man-Days-Hours chain rule: M1 * D1 * H1 = M2 * D2 * H2 => 15 * 21 * 8 = 14 * D2 * 6 => 2520 = 84 * D2 => D2 = 2520 / 84 = 30 days.",
    "keyFormulaOrNote": "M1 * D1 * H1 = M2 * D2 * H2 when work is constant."
  },
  {
    "id": "apt-q55",
    "subject": "aptitude",
    "topic": "Trains & Relative Velocity",
    "difficulty": "easy",
    "examTags": [
      "Fundamentals"
    ],
    "question": "Aptitude Problem #55: 15 men working 8 hours a day can complete a project in 21 days. How many days will 14 men working 6 hours a day take to complete the exact same project?",
    "options": [
      "30 days",
      "28 days",
      "25 days",
      "32 days"
    ],
    "correctAnswer": 0,
    "explanation": "Using the Man-Days-Hours chain rule: M1 * D1 * H1 = M2 * D2 * H2 => 15 * 21 * 8 = 14 * D2 * 6 => 2520 = 84 * D2 => D2 = 2520 / 84 = 30 days.",
    "keyFormulaOrNote": "M1 * D1 * H1 = M2 * D2 * H2 when work is constant."
  },
  {
    "id": "apt-q56",
    "subject": "aptitude",
    "topic": "Profit, Loss & Marked Price",
    "difficulty": "medium",
    "examTags": [
      "TCS NQT"
    ],
    "question": "Aptitude Problem #56: 15 men working 8 hours a day can complete a project in 21 days. How many days will 14 men working 6 hours a day take to complete the exact same project?",
    "options": [
      "30 days",
      "28 days",
      "25 days",
      "32 days"
    ],
    "correctAnswer": 0,
    "explanation": "Using the Man-Days-Hours chain rule: M1 * D1 * H1 = M2 * D2 * H2 => 15 * 21 * 8 = 14 * D2 * 6 => 2520 = 84 * D2 => D2 = 2520 / 84 = 30 days.",
    "keyFormulaOrNote": "M1 * D1 * H1 = M2 * D2 * H2 when work is constant."
  },
  {
    "id": "apt-q57",
    "subject": "aptitude",
    "topic": "Syllogism Either-Or",
    "difficulty": "hard",
    "examTags": [
      "Campus Placement"
    ],
    "question": "Aptitude Problem #57: 15 men working 8 hours a day can complete a project in 21 days. How many days will 14 men working 6 hours a day take to complete the exact same project?",
    "options": [
      "30 days",
      "28 days",
      "25 days",
      "32 days"
    ],
    "correctAnswer": 0,
    "explanation": "Using the Man-Days-Hours chain rule: M1 * D1 * H1 = M2 * D2 * H2 => 15 * 21 * 8 = 14 * D2 * 6 => 2520 = 84 * D2 => D2 = 2520 / 84 = 30 days.",
    "keyFormulaOrNote": "M1 * D1 * H1 = M2 * D2 * H2 when work is constant."
  },
  {
    "id": "apt-q58",
    "subject": "aptitude",
    "topic": "Coded Blood Relations",
    "difficulty": "medium",
    "examTags": [
      "TCS NQT"
    ],
    "question": "Aptitude Problem #58: 15 men working 8 hours a day can complete a project in 21 days. How many days will 14 men working 6 hours a day take to complete the exact same project?",
    "options": [
      "30 days",
      "28 days",
      "25 days",
      "32 days"
    ],
    "correctAnswer": 0,
    "explanation": "Using the Man-Days-Hours chain rule: M1 * D1 * H1 = M2 * D2 * H2 => 15 * 21 * 8 = 14 * D2 * 6 => 2520 = 84 * D2 => D2 = 2520 / 84 = 30 days.",
    "keyFormulaOrNote": "M1 * D1 * H1 = M2 * D2 * H2 when work is constant."
  },
  {
    "id": "apt-q59",
    "subject": "aptitude",
    "topic": "Circular Arrangements",
    "difficulty": "easy",
    "examTags": [
      "Fundamentals"
    ],
    "question": "Aptitude Problem #59: 15 men working 8 hours a day can complete a project in 21 days. How many days will 14 men working 6 hours a day take to complete the exact same project?",
    "options": [
      "30 days",
      "28 days",
      "25 days",
      "32 days"
    ],
    "correctAnswer": 0,
    "explanation": "Using the Man-Days-Hours chain rule: M1 * D1 * H1 = M2 * D2 * H2 => 15 * 21 * 8 = 14 * D2 * 6 => 2520 = 84 * D2 => D2 = 2520 / 84 = 30 days.",
    "keyFormulaOrNote": "M1 * D1 * H1 = M2 * D2 * H2 when work is constant."
  },
  {
    "id": "apt-q60",
    "subject": "aptitude",
    "topic": "Time & Work Chain Rule",
    "difficulty": "hard",
    "examTags": [
      "Campus Placement"
    ],
    "question": "Aptitude Problem #60: 15 men working 8 hours a day can complete a project in 21 days. How many days will 14 men working 6 hours a day take to complete the exact same project?",
    "options": [
      "30 days",
      "28 days",
      "25 days",
      "32 days"
    ],
    "correctAnswer": 0,
    "explanation": "Using the Man-Days-Hours chain rule: M1 * D1 * H1 = M2 * D2 * H2 => 15 * 21 * 8 = 14 * D2 * 6 => 2520 = 84 * D2 => D2 = 2520 / 84 = 30 days.",
    "keyFormulaOrNote": "M1 * D1 * H1 = M2 * D2 * H2 when work is constant."
  },
  {
    "id": "apt-q61",
    "subject": "aptitude",
    "topic": "Trains & Relative Velocity",
    "difficulty": "easy",
    "examTags": [
      "Fundamentals"
    ],
    "question": "Aptitude Problem #61: 15 men working 8 hours a day can complete a project in 21 days. How many days will 14 men working 6 hours a day take to complete the exact same project?",
    "options": [
      "30 days",
      "28 days",
      "25 days",
      "32 days"
    ],
    "correctAnswer": 0,
    "explanation": "Using the Man-Days-Hours chain rule: M1 * D1 * H1 = M2 * D2 * H2 => 15 * 21 * 8 = 14 * D2 * 6 => 2520 = 84 * D2 => D2 = 2520 / 84 = 30 days.",
    "keyFormulaOrNote": "M1 * D1 * H1 = M2 * D2 * H2 when work is constant."
  },
  {
    "id": "apt-q62",
    "subject": "aptitude",
    "topic": "Profit, Loss & Marked Price",
    "difficulty": "medium",
    "examTags": [
      "TCS NQT"
    ],
    "question": "Aptitude Problem #62: 15 men working 8 hours a day can complete a project in 21 days. How many days will 14 men working 6 hours a day take to complete the exact same project?",
    "options": [
      "30 days",
      "28 days",
      "25 days",
      "32 days"
    ],
    "correctAnswer": 0,
    "explanation": "Using the Man-Days-Hours chain rule: M1 * D1 * H1 = M2 * D2 * H2 => 15 * 21 * 8 = 14 * D2 * 6 => 2520 = 84 * D2 => D2 = 2520 / 84 = 30 days.",
    "keyFormulaOrNote": "M1 * D1 * H1 = M2 * D2 * H2 when work is constant."
  },
  {
    "id": "apt-q63",
    "subject": "aptitude",
    "topic": "Syllogism Either-Or",
    "difficulty": "hard",
    "examTags": [
      "Campus Placement"
    ],
    "question": "Aptitude Problem #63: 15 men working 8 hours a day can complete a project in 21 days. How many days will 14 men working 6 hours a day take to complete the exact same project?",
    "options": [
      "30 days",
      "28 days",
      "25 days",
      "32 days"
    ],
    "correctAnswer": 0,
    "explanation": "Using the Man-Days-Hours chain rule: M1 * D1 * H1 = M2 * D2 * H2 => 15 * 21 * 8 = 14 * D2 * 6 => 2520 = 84 * D2 => D2 = 2520 / 84 = 30 days.",
    "keyFormulaOrNote": "M1 * D1 * H1 = M2 * D2 * H2 when work is constant."
  },
  {
    "id": "apt-q64",
    "subject": "aptitude",
    "topic": "Coded Blood Relations",
    "difficulty": "medium",
    "examTags": [
      "TCS NQT"
    ],
    "question": "Aptitude Problem #64: 15 men working 8 hours a day can complete a project in 21 days. How many days will 14 men working 6 hours a day take to complete the exact same project?",
    "options": [
      "30 days",
      "28 days",
      "25 days",
      "32 days"
    ],
    "correctAnswer": 0,
    "explanation": "Using the Man-Days-Hours chain rule: M1 * D1 * H1 = M2 * D2 * H2 => 15 * 21 * 8 = 14 * D2 * 6 => 2520 = 84 * D2 => D2 = 2520 / 84 = 30 days.",
    "keyFormulaOrNote": "M1 * D1 * H1 = M2 * D2 * H2 when work is constant."
  },
  {
    "id": "apt-q65",
    "subject": "aptitude",
    "topic": "Circular Arrangements",
    "difficulty": "easy",
    "examTags": [
      "Fundamentals"
    ],
    "question": "Aptitude Problem #65: 15 men working 8 hours a day can complete a project in 21 days. How many days will 14 men working 6 hours a day take to complete the exact same project?",
    "options": [
      "30 days",
      "28 days",
      "25 days",
      "32 days"
    ],
    "correctAnswer": 0,
    "explanation": "Using the Man-Days-Hours chain rule: M1 * D1 * H1 = M2 * D2 * H2 => 15 * 21 * 8 = 14 * D2 * 6 => 2520 = 84 * D2 => D2 = 2520 / 84 = 30 days.",
    "keyFormulaOrNote": "M1 * D1 * H1 = M2 * D2 * H2 when work is constant."
  },
  {
    "id": "apt-q66",
    "subject": "aptitude",
    "topic": "Time & Work Chain Rule",
    "difficulty": "hard",
    "examTags": [
      "Campus Placement"
    ],
    "question": "Aptitude Problem #66: 15 men working 8 hours a day can complete a project in 21 days. How many days will 14 men working 6 hours a day take to complete the exact same project?",
    "options": [
      "30 days",
      "28 days",
      "25 days",
      "32 days"
    ],
    "correctAnswer": 0,
    "explanation": "Using the Man-Days-Hours chain rule: M1 * D1 * H1 = M2 * D2 * H2 => 15 * 21 * 8 = 14 * D2 * 6 => 2520 = 84 * D2 => D2 = 2520 / 84 = 30 days.",
    "keyFormulaOrNote": "M1 * D1 * H1 = M2 * D2 * H2 when work is constant."
  },
  {
    "id": "apt-q67",
    "subject": "aptitude",
    "topic": "Trains & Relative Velocity",
    "difficulty": "easy",
    "examTags": [
      "Fundamentals"
    ],
    "question": "Aptitude Problem #67: 15 men working 8 hours a day can complete a project in 21 days. How many days will 14 men working 6 hours a day take to complete the exact same project?",
    "options": [
      "30 days",
      "28 days",
      "25 days",
      "32 days"
    ],
    "correctAnswer": 0,
    "explanation": "Using the Man-Days-Hours chain rule: M1 * D1 * H1 = M2 * D2 * H2 => 15 * 21 * 8 = 14 * D2 * 6 => 2520 = 84 * D2 => D2 = 2520 / 84 = 30 days.",
    "keyFormulaOrNote": "M1 * D1 * H1 = M2 * D2 * H2 when work is constant."
  },
  {
    "id": "apt-q68",
    "subject": "aptitude",
    "topic": "Profit, Loss & Marked Price",
    "difficulty": "medium",
    "examTags": [
      "TCS NQT"
    ],
    "question": "Aptitude Problem #68: 15 men working 8 hours a day can complete a project in 21 days. How many days will 14 men working 6 hours a day take to complete the exact same project?",
    "options": [
      "30 days",
      "28 days",
      "25 days",
      "32 days"
    ],
    "correctAnswer": 0,
    "explanation": "Using the Man-Days-Hours chain rule: M1 * D1 * H1 = M2 * D2 * H2 => 15 * 21 * 8 = 14 * D2 * 6 => 2520 = 84 * D2 => D2 = 2520 / 84 = 30 days.",
    "keyFormulaOrNote": "M1 * D1 * H1 = M2 * D2 * H2 when work is constant."
  },
  {
    "id": "apt-q69",
    "subject": "aptitude",
    "topic": "Syllogism Either-Or",
    "difficulty": "hard",
    "examTags": [
      "Campus Placement"
    ],
    "question": "Aptitude Problem #69: 15 men working 8 hours a day can complete a project in 21 days. How many days will 14 men working 6 hours a day take to complete the exact same project?",
    "options": [
      "30 days",
      "28 days",
      "25 days",
      "32 days"
    ],
    "correctAnswer": 0,
    "explanation": "Using the Man-Days-Hours chain rule: M1 * D1 * H1 = M2 * D2 * H2 => 15 * 21 * 8 = 14 * D2 * 6 => 2520 = 84 * D2 => D2 = 2520 / 84 = 30 days.",
    "keyFormulaOrNote": "M1 * D1 * H1 = M2 * D2 * H2 when work is constant."
  },
  {
    "id": "apt-q70",
    "subject": "aptitude",
    "topic": "Coded Blood Relations",
    "difficulty": "medium",
    "examTags": [
      "TCS NQT"
    ],
    "question": "Aptitude Problem #70: 15 men working 8 hours a day can complete a project in 21 days. How many days will 14 men working 6 hours a day take to complete the exact same project?",
    "options": [
      "30 days",
      "28 days",
      "25 days",
      "32 days"
    ],
    "correctAnswer": 0,
    "explanation": "Using the Man-Days-Hours chain rule: M1 * D1 * H1 = M2 * D2 * H2 => 15 * 21 * 8 = 14 * D2 * 6 => 2520 = 84 * D2 => D2 = 2520 / 84 = 30 days.",
    "keyFormulaOrNote": "M1 * D1 * H1 = M2 * D2 * H2 when work is constant."
  },
  {
    "id": "apt-q71",
    "subject": "aptitude",
    "topic": "Circular Arrangements",
    "difficulty": "easy",
    "examTags": [
      "Fundamentals"
    ],
    "question": "Aptitude Problem #71: 15 men working 8 hours a day can complete a project in 21 days. How many days will 14 men working 6 hours a day take to complete the exact same project?",
    "options": [
      "30 days",
      "28 days",
      "25 days",
      "32 days"
    ],
    "correctAnswer": 0,
    "explanation": "Using the Man-Days-Hours chain rule: M1 * D1 * H1 = M2 * D2 * H2 => 15 * 21 * 8 = 14 * D2 * 6 => 2520 = 84 * D2 => D2 = 2520 / 84 = 30 days.",
    "keyFormulaOrNote": "M1 * D1 * H1 = M2 * D2 * H2 when work is constant."
  },
  {
    "id": "apt-q72",
    "subject": "aptitude",
    "topic": "Time & Work Chain Rule",
    "difficulty": "hard",
    "examTags": [
      "Campus Placement"
    ],
    "question": "Aptitude Problem #72: 15 men working 8 hours a day can complete a project in 21 days. How many days will 14 men working 6 hours a day take to complete the exact same project?",
    "options": [
      "30 days",
      "28 days",
      "25 days",
      "32 days"
    ],
    "correctAnswer": 0,
    "explanation": "Using the Man-Days-Hours chain rule: M1 * D1 * H1 = M2 * D2 * H2 => 15 * 21 * 8 = 14 * D2 * 6 => 2520 = 84 * D2 => D2 = 2520 / 84 = 30 days.",
    "keyFormulaOrNote": "M1 * D1 * H1 = M2 * D2 * H2 when work is constant."
  },
  {
    "id": "apt-q73",
    "subject": "aptitude",
    "topic": "Trains & Relative Velocity",
    "difficulty": "easy",
    "examTags": [
      "Fundamentals"
    ],
    "question": "Aptitude Problem #73: 15 men working 8 hours a day can complete a project in 21 days. How many days will 14 men working 6 hours a day take to complete the exact same project?",
    "options": [
      "30 days",
      "28 days",
      "25 days",
      "32 days"
    ],
    "correctAnswer": 0,
    "explanation": "Using the Man-Days-Hours chain rule: M1 * D1 * H1 = M2 * D2 * H2 => 15 * 21 * 8 = 14 * D2 * 6 => 2520 = 84 * D2 => D2 = 2520 / 84 = 30 days.",
    "keyFormulaOrNote": "M1 * D1 * H1 = M2 * D2 * H2 when work is constant."
  },
  {
    "id": "apt-q74",
    "subject": "aptitude",
    "topic": "Profit, Loss & Marked Price",
    "difficulty": "medium",
    "examTags": [
      "TCS NQT"
    ],
    "question": "Aptitude Problem #74: 15 men working 8 hours a day can complete a project in 21 days. How many days will 14 men working 6 hours a day take to complete the exact same project?",
    "options": [
      "30 days",
      "28 days",
      "25 days",
      "32 days"
    ],
    "correctAnswer": 0,
    "explanation": "Using the Man-Days-Hours chain rule: M1 * D1 * H1 = M2 * D2 * H2 => 15 * 21 * 8 = 14 * D2 * 6 => 2520 = 84 * D2 => D2 = 2520 / 84 = 30 days.",
    "keyFormulaOrNote": "M1 * D1 * H1 = M2 * D2 * H2 when work is constant."
  },
  {
    "id": "apt-q75",
    "subject": "aptitude",
    "topic": "Syllogism Either-Or",
    "difficulty": "hard",
    "examTags": [
      "Campus Placement"
    ],
    "question": "Aptitude Problem #75: 15 men working 8 hours a day can complete a project in 21 days. How many days will 14 men working 6 hours a day take to complete the exact same project?",
    "options": [
      "30 days",
      "28 days",
      "25 days",
      "32 days"
    ],
    "correctAnswer": 0,
    "explanation": "Using the Man-Days-Hours chain rule: M1 * D1 * H1 = M2 * D2 * H2 => 15 * 21 * 8 = 14 * D2 * 6 => 2520 = 84 * D2 => D2 = 2520 / 84 = 30 days.",
    "keyFormulaOrNote": "M1 * D1 * H1 = M2 * D2 * H2 when work is constant."
  },
  {
    "id": "apt-q76",
    "subject": "aptitude",
    "topic": "Coded Blood Relations",
    "difficulty": "medium",
    "examTags": [
      "TCS NQT"
    ],
    "question": "Aptitude Problem #76: 15 men working 8 hours a day can complete a project in 21 days. How many days will 14 men working 6 hours a day take to complete the exact same project?",
    "options": [
      "30 days",
      "28 days",
      "25 days",
      "32 days"
    ],
    "correctAnswer": 0,
    "explanation": "Using the Man-Days-Hours chain rule: M1 * D1 * H1 = M2 * D2 * H2 => 15 * 21 * 8 = 14 * D2 * 6 => 2520 = 84 * D2 => D2 = 2520 / 84 = 30 days.",
    "keyFormulaOrNote": "M1 * D1 * H1 = M2 * D2 * H2 when work is constant."
  },
  {
    "id": "apt-q77",
    "subject": "aptitude",
    "topic": "Circular Arrangements",
    "difficulty": "easy",
    "examTags": [
      "Fundamentals"
    ],
    "question": "Aptitude Problem #77: 15 men working 8 hours a day can complete a project in 21 days. How many days will 14 men working 6 hours a day take to complete the exact same project?",
    "options": [
      "30 days",
      "28 days",
      "25 days",
      "32 days"
    ],
    "correctAnswer": 0,
    "explanation": "Using the Man-Days-Hours chain rule: M1 * D1 * H1 = M2 * D2 * H2 => 15 * 21 * 8 = 14 * D2 * 6 => 2520 = 84 * D2 => D2 = 2520 / 84 = 30 days.",
    "keyFormulaOrNote": "M1 * D1 * H1 = M2 * D2 * H2 when work is constant."
  },
  {
    "id": "apt-q78",
    "subject": "aptitude",
    "topic": "Time & Work Chain Rule",
    "difficulty": "hard",
    "examTags": [
      "Campus Placement"
    ],
    "question": "Aptitude Problem #78: 15 men working 8 hours a day can complete a project in 21 days. How many days will 14 men working 6 hours a day take to complete the exact same project?",
    "options": [
      "30 days",
      "28 days",
      "25 days",
      "32 days"
    ],
    "correctAnswer": 0,
    "explanation": "Using the Man-Days-Hours chain rule: M1 * D1 * H1 = M2 * D2 * H2 => 15 * 21 * 8 = 14 * D2 * 6 => 2520 = 84 * D2 => D2 = 2520 / 84 = 30 days.",
    "keyFormulaOrNote": "M1 * D1 * H1 = M2 * D2 * H2 when work is constant."
  },
  {
    "id": "apt-q79",
    "subject": "aptitude",
    "topic": "Trains & Relative Velocity",
    "difficulty": "easy",
    "examTags": [
      "Fundamentals"
    ],
    "question": "Aptitude Problem #79: 15 men working 8 hours a day can complete a project in 21 days. How many days will 14 men working 6 hours a day take to complete the exact same project?",
    "options": [
      "30 days",
      "28 days",
      "25 days",
      "32 days"
    ],
    "correctAnswer": 0,
    "explanation": "Using the Man-Days-Hours chain rule: M1 * D1 * H1 = M2 * D2 * H2 => 15 * 21 * 8 = 14 * D2 * 6 => 2520 = 84 * D2 => D2 = 2520 / 84 = 30 days.",
    "keyFormulaOrNote": "M1 * D1 * H1 = M2 * D2 * H2 when work is constant."
  },
  {
    "id": "apt-q80",
    "subject": "aptitude",
    "topic": "Profit, Loss & Marked Price",
    "difficulty": "medium",
    "examTags": [
      "TCS NQT"
    ],
    "question": "Aptitude Problem #80: 15 men working 8 hours a day can complete a project in 21 days. How many days will 14 men working 6 hours a day take to complete the exact same project?",
    "options": [
      "30 days",
      "28 days",
      "25 days",
      "32 days"
    ],
    "correctAnswer": 0,
    "explanation": "Using the Man-Days-Hours chain rule: M1 * D1 * H1 = M2 * D2 * H2 => 15 * 21 * 8 = 14 * D2 * 6 => 2520 = 84 * D2 => D2 = 2520 / 84 = 30 days.",
    "keyFormulaOrNote": "M1 * D1 * H1 = M2 * D2 * H2 when work is constant."
  },
  {
    "id": "apt-q81",
    "subject": "aptitude",
    "topic": "Syllogism Either-Or",
    "difficulty": "hard",
    "examTags": [
      "Campus Placement"
    ],
    "question": "Aptitude Problem #81: 15 men working 8 hours a day can complete a project in 21 days. How many days will 14 men working 6 hours a day take to complete the exact same project?",
    "options": [
      "30 days",
      "28 days",
      "25 days",
      "32 days"
    ],
    "correctAnswer": 0,
    "explanation": "Using the Man-Days-Hours chain rule: M1 * D1 * H1 = M2 * D2 * H2 => 15 * 21 * 8 = 14 * D2 * 6 => 2520 = 84 * D2 => D2 = 2520 / 84 = 30 days.",
    "keyFormulaOrNote": "M1 * D1 * H1 = M2 * D2 * H2 when work is constant."
  },
  {
    "id": "apt-q82",
    "subject": "aptitude",
    "topic": "Coded Blood Relations",
    "difficulty": "medium",
    "examTags": [
      "TCS NQT"
    ],
    "question": "Aptitude Problem #82: 15 men working 8 hours a day can complete a project in 21 days. How many days will 14 men working 6 hours a day take to complete the exact same project?",
    "options": [
      "30 days",
      "28 days",
      "25 days",
      "32 days"
    ],
    "correctAnswer": 0,
    "explanation": "Using the Man-Days-Hours chain rule: M1 * D1 * H1 = M2 * D2 * H2 => 15 * 21 * 8 = 14 * D2 * 6 => 2520 = 84 * D2 => D2 = 2520 / 84 = 30 days.",
    "keyFormulaOrNote": "M1 * D1 * H1 = M2 * D2 * H2 when work is constant."
  },
  {
    "id": "apt-q83",
    "subject": "aptitude",
    "topic": "Circular Arrangements",
    "difficulty": "easy",
    "examTags": [
      "Fundamentals"
    ],
    "question": "Aptitude Problem #83: 15 men working 8 hours a day can complete a project in 21 days. How many days will 14 men working 6 hours a day take to complete the exact same project?",
    "options": [
      "30 days",
      "28 days",
      "25 days",
      "32 days"
    ],
    "correctAnswer": 0,
    "explanation": "Using the Man-Days-Hours chain rule: M1 * D1 * H1 = M2 * D2 * H2 => 15 * 21 * 8 = 14 * D2 * 6 => 2520 = 84 * D2 => D2 = 2520 / 84 = 30 days.",
    "keyFormulaOrNote": "M1 * D1 * H1 = M2 * D2 * H2 when work is constant."
  },
  {
    "id": "apt-q84",
    "subject": "aptitude",
    "topic": "Time & Work Chain Rule",
    "difficulty": "hard",
    "examTags": [
      "Campus Placement"
    ],
    "question": "Aptitude Problem #84: 15 men working 8 hours a day can complete a project in 21 days. How many days will 14 men working 6 hours a day take to complete the exact same project?",
    "options": [
      "30 days",
      "28 days",
      "25 days",
      "32 days"
    ],
    "correctAnswer": 0,
    "explanation": "Using the Man-Days-Hours chain rule: M1 * D1 * H1 = M2 * D2 * H2 => 15 * 21 * 8 = 14 * D2 * 6 => 2520 = 84 * D2 => D2 = 2520 / 84 = 30 days.",
    "keyFormulaOrNote": "M1 * D1 * H1 = M2 * D2 * H2 when work is constant."
  },
  {
    "id": "apt-q85",
    "subject": "aptitude",
    "topic": "Trains & Relative Velocity",
    "difficulty": "easy",
    "examTags": [
      "Fundamentals"
    ],
    "question": "Aptitude Problem #85: 15 men working 8 hours a day can complete a project in 21 days. How many days will 14 men working 6 hours a day take to complete the exact same project?",
    "options": [
      "30 days",
      "28 days",
      "25 days",
      "32 days"
    ],
    "correctAnswer": 0,
    "explanation": "Using the Man-Days-Hours chain rule: M1 * D1 * H1 = M2 * D2 * H2 => 15 * 21 * 8 = 14 * D2 * 6 => 2520 = 84 * D2 => D2 = 2520 / 84 = 30 days.",
    "keyFormulaOrNote": "M1 * D1 * H1 = M2 * D2 * H2 when work is constant."
  },
  {
    "id": "apt-q86",
    "subject": "aptitude",
    "topic": "Profit, Loss & Marked Price",
    "difficulty": "medium",
    "examTags": [
      "TCS NQT"
    ],
    "question": "Aptitude Problem #86: 15 men working 8 hours a day can complete a project in 21 days. How many days will 14 men working 6 hours a day take to complete the exact same project?",
    "options": [
      "30 days",
      "28 days",
      "25 days",
      "32 days"
    ],
    "correctAnswer": 0,
    "explanation": "Using the Man-Days-Hours chain rule: M1 * D1 * H1 = M2 * D2 * H2 => 15 * 21 * 8 = 14 * D2 * 6 => 2520 = 84 * D2 => D2 = 2520 / 84 = 30 days.",
    "keyFormulaOrNote": "M1 * D1 * H1 = M2 * D2 * H2 when work is constant."
  },
  {
    "id": "apt-q87",
    "subject": "aptitude",
    "topic": "Syllogism Either-Or",
    "difficulty": "hard",
    "examTags": [
      "Campus Placement"
    ],
    "question": "Aptitude Problem #87: 15 men working 8 hours a day can complete a project in 21 days. How many days will 14 men working 6 hours a day take to complete the exact same project?",
    "options": [
      "30 days",
      "28 days",
      "25 days",
      "32 days"
    ],
    "correctAnswer": 0,
    "explanation": "Using the Man-Days-Hours chain rule: M1 * D1 * H1 = M2 * D2 * H2 => 15 * 21 * 8 = 14 * D2 * 6 => 2520 = 84 * D2 => D2 = 2520 / 84 = 30 days.",
    "keyFormulaOrNote": "M1 * D1 * H1 = M2 * D2 * H2 when work is constant."
  },
  {
    "id": "apt-q88",
    "subject": "aptitude",
    "topic": "Coded Blood Relations",
    "difficulty": "medium",
    "examTags": [
      "TCS NQT"
    ],
    "question": "Aptitude Problem #88: 15 men working 8 hours a day can complete a project in 21 days. How many days will 14 men working 6 hours a day take to complete the exact same project?",
    "options": [
      "30 days",
      "28 days",
      "25 days",
      "32 days"
    ],
    "correctAnswer": 0,
    "explanation": "Using the Man-Days-Hours chain rule: M1 * D1 * H1 = M2 * D2 * H2 => 15 * 21 * 8 = 14 * D2 * 6 => 2520 = 84 * D2 => D2 = 2520 / 84 = 30 days.",
    "keyFormulaOrNote": "M1 * D1 * H1 = M2 * D2 * H2 when work is constant."
  },
  {
    "id": "apt-q89",
    "subject": "aptitude",
    "topic": "Circular Arrangements",
    "difficulty": "easy",
    "examTags": [
      "Fundamentals"
    ],
    "question": "Aptitude Problem #89: 15 men working 8 hours a day can complete a project in 21 days. How many days will 14 men working 6 hours a day take to complete the exact same project?",
    "options": [
      "30 days",
      "28 days",
      "25 days",
      "32 days"
    ],
    "correctAnswer": 0,
    "explanation": "Using the Man-Days-Hours chain rule: M1 * D1 * H1 = M2 * D2 * H2 => 15 * 21 * 8 = 14 * D2 * 6 => 2520 = 84 * D2 => D2 = 2520 / 84 = 30 days.",
    "keyFormulaOrNote": "M1 * D1 * H1 = M2 * D2 * H2 when work is constant."
  },
  {
    "id": "apt-q90",
    "subject": "aptitude",
    "topic": "Time & Work Chain Rule",
    "difficulty": "hard",
    "examTags": [
      "Campus Placement"
    ],
    "question": "Aptitude Problem #90: 15 men working 8 hours a day can complete a project in 21 days. How many days will 14 men working 6 hours a day take to complete the exact same project?",
    "options": [
      "30 days",
      "28 days",
      "25 days",
      "32 days"
    ],
    "correctAnswer": 0,
    "explanation": "Using the Man-Days-Hours chain rule: M1 * D1 * H1 = M2 * D2 * H2 => 15 * 21 * 8 = 14 * D2 * 6 => 2520 = 84 * D2 => D2 = 2520 / 84 = 30 days.",
    "keyFormulaOrNote": "M1 * D1 * H1 = M2 * D2 * H2 when work is constant."
  },
  {
    "id": "apt-q91",
    "subject": "aptitude",
    "topic": "Trains & Relative Velocity",
    "difficulty": "easy",
    "examTags": [
      "Fundamentals"
    ],
    "question": "Aptitude Problem #91: 15 men working 8 hours a day can complete a project in 21 days. How many days will 14 men working 6 hours a day take to complete the exact same project?",
    "options": [
      "30 days",
      "28 days",
      "25 days",
      "32 days"
    ],
    "correctAnswer": 0,
    "explanation": "Using the Man-Days-Hours chain rule: M1 * D1 * H1 = M2 * D2 * H2 => 15 * 21 * 8 = 14 * D2 * 6 => 2520 = 84 * D2 => D2 = 2520 / 84 = 30 days.",
    "keyFormulaOrNote": "M1 * D1 * H1 = M2 * D2 * H2 when work is constant."
  },
  {
    "id": "apt-q92",
    "subject": "aptitude",
    "topic": "Profit, Loss & Marked Price",
    "difficulty": "medium",
    "examTags": [
      "TCS NQT"
    ],
    "question": "Aptitude Problem #92: 15 men working 8 hours a day can complete a project in 21 days. How many days will 14 men working 6 hours a day take to complete the exact same project?",
    "options": [
      "30 days",
      "28 days",
      "25 days",
      "32 days"
    ],
    "correctAnswer": 0,
    "explanation": "Using the Man-Days-Hours chain rule: M1 * D1 * H1 = M2 * D2 * H2 => 15 * 21 * 8 = 14 * D2 * 6 => 2520 = 84 * D2 => D2 = 2520 / 84 = 30 days.",
    "keyFormulaOrNote": "M1 * D1 * H1 = M2 * D2 * H2 when work is constant."
  },
  {
    "id": "apt-q93",
    "subject": "aptitude",
    "topic": "Syllogism Either-Or",
    "difficulty": "hard",
    "examTags": [
      "Campus Placement"
    ],
    "question": "Aptitude Problem #93: 15 men working 8 hours a day can complete a project in 21 days. How many days will 14 men working 6 hours a day take to complete the exact same project?",
    "options": [
      "30 days",
      "28 days",
      "25 days",
      "32 days"
    ],
    "correctAnswer": 0,
    "explanation": "Using the Man-Days-Hours chain rule: M1 * D1 * H1 = M2 * D2 * H2 => 15 * 21 * 8 = 14 * D2 * 6 => 2520 = 84 * D2 => D2 = 2520 / 84 = 30 days.",
    "keyFormulaOrNote": "M1 * D1 * H1 = M2 * D2 * H2 when work is constant."
  },
  {
    "id": "apt-q94",
    "subject": "aptitude",
    "topic": "Coded Blood Relations",
    "difficulty": "medium",
    "examTags": [
      "TCS NQT"
    ],
    "question": "Aptitude Problem #94: 15 men working 8 hours a day can complete a project in 21 days. How many days will 14 men working 6 hours a day take to complete the exact same project?",
    "options": [
      "30 days",
      "28 days",
      "25 days",
      "32 days"
    ],
    "correctAnswer": 0,
    "explanation": "Using the Man-Days-Hours chain rule: M1 * D1 * H1 = M2 * D2 * H2 => 15 * 21 * 8 = 14 * D2 * 6 => 2520 = 84 * D2 => D2 = 2520 / 84 = 30 days.",
    "keyFormulaOrNote": "M1 * D1 * H1 = M2 * D2 * H2 when work is constant."
  },
  {
    "id": "apt-q95",
    "subject": "aptitude",
    "topic": "Circular Arrangements",
    "difficulty": "easy",
    "examTags": [
      "Fundamentals"
    ],
    "question": "Aptitude Problem #95: 15 men working 8 hours a day can complete a project in 21 days. How many days will 14 men working 6 hours a day take to complete the exact same project?",
    "options": [
      "30 days",
      "28 days",
      "25 days",
      "32 days"
    ],
    "correctAnswer": 0,
    "explanation": "Using the Man-Days-Hours chain rule: M1 * D1 * H1 = M2 * D2 * H2 => 15 * 21 * 8 = 14 * D2 * 6 => 2520 = 84 * D2 => D2 = 2520 / 84 = 30 days.",
    "keyFormulaOrNote": "M1 * D1 * H1 = M2 * D2 * H2 when work is constant."
  },
  {
    "id": "apt-q96",
    "subject": "aptitude",
    "topic": "Time & Work Chain Rule",
    "difficulty": "hard",
    "examTags": [
      "Campus Placement"
    ],
    "question": "Aptitude Problem #96: 15 men working 8 hours a day can complete a project in 21 days. How many days will 14 men working 6 hours a day take to complete the exact same project?",
    "options": [
      "30 days",
      "28 days",
      "25 days",
      "32 days"
    ],
    "correctAnswer": 0,
    "explanation": "Using the Man-Days-Hours chain rule: M1 * D1 * H1 = M2 * D2 * H2 => 15 * 21 * 8 = 14 * D2 * 6 => 2520 = 84 * D2 => D2 = 2520 / 84 = 30 days.",
    "keyFormulaOrNote": "M1 * D1 * H1 = M2 * D2 * H2 when work is constant."
  },
  {
    "id": "apt-q97",
    "subject": "aptitude",
    "topic": "Trains & Relative Velocity",
    "difficulty": "easy",
    "examTags": [
      "Fundamentals"
    ],
    "question": "Aptitude Problem #97: 15 men working 8 hours a day can complete a project in 21 days. How many days will 14 men working 6 hours a day take to complete the exact same project?",
    "options": [
      "30 days",
      "28 days",
      "25 days",
      "32 days"
    ],
    "correctAnswer": 0,
    "explanation": "Using the Man-Days-Hours chain rule: M1 * D1 * H1 = M2 * D2 * H2 => 15 * 21 * 8 = 14 * D2 * 6 => 2520 = 84 * D2 => D2 = 2520 / 84 = 30 days.",
    "keyFormulaOrNote": "M1 * D1 * H1 = M2 * D2 * H2 when work is constant."
  },
  {
    "id": "apt-q98",
    "subject": "aptitude",
    "topic": "Profit, Loss & Marked Price",
    "difficulty": "medium",
    "examTags": [
      "TCS NQT"
    ],
    "question": "Aptitude Problem #98: 15 men working 8 hours a day can complete a project in 21 days. How many days will 14 men working 6 hours a day take to complete the exact same project?",
    "options": [
      "30 days",
      "28 days",
      "25 days",
      "32 days"
    ],
    "correctAnswer": 0,
    "explanation": "Using the Man-Days-Hours chain rule: M1 * D1 * H1 = M2 * D2 * H2 => 15 * 21 * 8 = 14 * D2 * 6 => 2520 = 84 * D2 => D2 = 2520 / 84 = 30 days.",
    "keyFormulaOrNote": "M1 * D1 * H1 = M2 * D2 * H2 when work is constant."
  },
  {
    "id": "apt-q99",
    "subject": "aptitude",
    "topic": "Syllogism Either-Or",
    "difficulty": "hard",
    "examTags": [
      "Campus Placement"
    ],
    "question": "Aptitude Problem #99: 15 men working 8 hours a day can complete a project in 21 days. How many days will 14 men working 6 hours a day take to complete the exact same project?",
    "options": [
      "30 days",
      "28 days",
      "25 days",
      "32 days"
    ],
    "correctAnswer": 0,
    "explanation": "Using the Man-Days-Hours chain rule: M1 * D1 * H1 = M2 * D2 * H2 => 15 * 21 * 8 = 14 * D2 * 6 => 2520 = 84 * D2 => D2 = 2520 / 84 = 30 days.",
    "keyFormulaOrNote": "M1 * D1 * H1 = M2 * D2 * H2 when work is constant."
  },
  {
    "id": "apt-q100",
    "subject": "aptitude",
    "topic": "Coded Blood Relations",
    "difficulty": "medium",
    "examTags": [
      "TCS NQT"
    ],
    "question": "Aptitude Problem #100: 15 men working 8 hours a day can complete a project in 21 days. How many days will 14 men working 6 hours a day take to complete the exact same project?",
    "options": [
      "30 days",
      "28 days",
      "25 days",
      "32 days"
    ],
    "correctAnswer": 0,
    "explanation": "Using the Man-Days-Hours chain rule: M1 * D1 * H1 = M2 * D2 * H2 => 15 * 21 * 8 = 14 * D2 * 6 => 2520 = 84 * D2 => D2 = 2520 / 84 = 30 days.",
    "keyFormulaOrNote": "M1 * D1 * H1 = M2 * D2 * H2 when work is constant."
  },
  {
    "id": "apt-q101",
    "subject": "aptitude",
    "topic": "Circular Arrangements",
    "difficulty": "easy",
    "examTags": [
      "Fundamentals"
    ],
    "question": "Aptitude Problem #101: 15 men working 8 hours a day can complete a project in 21 days. How many days will 14 men working 6 hours a day take to complete the exact same project?",
    "options": [
      "30 days",
      "28 days",
      "25 days",
      "32 days"
    ],
    "correctAnswer": 0,
    "explanation": "Using the Man-Days-Hours chain rule: M1 * D1 * H1 = M2 * D2 * H2 => 15 * 21 * 8 = 14 * D2 * 6 => 2520 = 84 * D2 => D2 = 2520 / 84 = 30 days.",
    "keyFormulaOrNote": "M1 * D1 * H1 = M2 * D2 * H2 when work is constant."
  },
  {
    "id": "apt-q102",
    "subject": "aptitude",
    "topic": "Time & Work Chain Rule",
    "difficulty": "hard",
    "examTags": [
      "Campus Placement"
    ],
    "question": "Aptitude Problem #102: 15 men working 8 hours a day can complete a project in 21 days. How many days will 14 men working 6 hours a day take to complete the exact same project?",
    "options": [
      "30 days",
      "28 days",
      "25 days",
      "32 days"
    ],
    "correctAnswer": 0,
    "explanation": "Using the Man-Days-Hours chain rule: M1 * D1 * H1 = M2 * D2 * H2 => 15 * 21 * 8 = 14 * D2 * 6 => 2520 = 84 * D2 => D2 = 2520 / 84 = 30 days.",
    "keyFormulaOrNote": "M1 * D1 * H1 = M2 * D2 * H2 when work is constant."
  },
  {
    "id": "apt-q103",
    "subject": "aptitude",
    "topic": "Trains & Relative Velocity",
    "difficulty": "easy",
    "examTags": [
      "Fundamentals"
    ],
    "question": "Aptitude Problem #103: 15 men working 8 hours a day can complete a project in 21 days. How many days will 14 men working 6 hours a day take to complete the exact same project?",
    "options": [
      "30 days",
      "28 days",
      "25 days",
      "32 days"
    ],
    "correctAnswer": 0,
    "explanation": "Using the Man-Days-Hours chain rule: M1 * D1 * H1 = M2 * D2 * H2 => 15 * 21 * 8 = 14 * D2 * 6 => 2520 = 84 * D2 => D2 = 2520 / 84 = 30 days.",
    "keyFormulaOrNote": "M1 * D1 * H1 = M2 * D2 * H2 when work is constant."
  },
  {
    "id": "apt-q104",
    "subject": "aptitude",
    "topic": "Profit, Loss & Marked Price",
    "difficulty": "medium",
    "examTags": [
      "TCS NQT"
    ],
    "question": "Aptitude Problem #104: 15 men working 8 hours a day can complete a project in 21 days. How many days will 14 men working 6 hours a day take to complete the exact same project?",
    "options": [
      "30 days",
      "28 days",
      "25 days",
      "32 days"
    ],
    "correctAnswer": 0,
    "explanation": "Using the Man-Days-Hours chain rule: M1 * D1 * H1 = M2 * D2 * H2 => 15 * 21 * 8 = 14 * D2 * 6 => 2520 = 84 * D2 => D2 = 2520 / 84 = 30 days.",
    "keyFormulaOrNote": "M1 * D1 * H1 = M2 * D2 * H2 when work is constant."
  },
  {
    "id": "apt-q105",
    "subject": "aptitude",
    "topic": "Syllogism Either-Or",
    "difficulty": "hard",
    "examTags": [
      "Campus Placement"
    ],
    "question": "Aptitude Problem #105: 15 men working 8 hours a day can complete a project in 21 days. How many days will 14 men working 6 hours a day take to complete the exact same project?",
    "options": [
      "30 days",
      "28 days",
      "25 days",
      "32 days"
    ],
    "correctAnswer": 0,
    "explanation": "Using the Man-Days-Hours chain rule: M1 * D1 * H1 = M2 * D2 * H2 => 15 * 21 * 8 = 14 * D2 * 6 => 2520 = 84 * D2 => D2 = 2520 / 84 = 30 days.",
    "keyFormulaOrNote": "M1 * D1 * H1 = M2 * D2 * H2 when work is constant."
  }
];
