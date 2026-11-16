# SPDSE.Prep — Infosys SP & DSE Technical Assessment Preparation Engine

> A focused, story-based algorithmic preparation platform engineered specifically for candidates targeting the **Infosys Specialist Programmer (SP - L1/L2/L3)** and **Digital Specialist Engineer (DSE)** online assessments and technical interviews.

---

## Architecture & Design Principles

Unlike standard LeetCode repositories, Infosys assessment problems wrap classical algorithms inside complex real-world narrative disguises (e.g., conveyor belts, transit scheduling, RPG game powerups, cryptographic tokens). 

This platform trains **Story-to-Pattern Recognition**, provides verified Codeforces benchmarks, models the exact subtask partial scoring system (HackerEarth/Wingspan), and offers compiled solutions across **Java (Fast I/O)**, **C++17**, and **Python 3**.

---

## Key Features

1. **Countdown & Role Diagnostic Dashboard**:
   - Real-time countdown timer to your specific assessment date (configurable).
   - Automated cutoff tracker for DSE (₹6.5L), SP L1 (₹10.5L), SP L2 (₹16L), and SP L3 (₹21L).
2. **Exam Blueprint & Audited Conflict Log**:
   - 180-minute 3-problem standard assessment breakdown (20m + 30m + 50m = 100 marks).
   - Resolves all 6 reported discrepancies across batches (time limits, forward-lock navigation, MCQ inclusion, Python TLE, pre-interview pen-and-paper surprise rounds).
   - Interactive time-budget calculator.
3. **Non-Skippable Role Progression Tracks**:
   - Ordered checklist of MUST-DO problems per role.
   - Lock-in hierarchy: foundational tiers must be completed before higher tiers unlock; higher tracks automatically include all lower track problems.
4. **The 12 Algorithmic Patterns Library**:
   - Detailed breakdown of Arrays & Prefix Sums, Two Pointers, Greedy, Binary Search on Answer, Dynamic Programming, Graphs/BFS/DSU, Number Theory, Monotonic Stack, Strings, Bit Tricks, and Simulation.
   - 3 to 5 real story disguises with cue words per pattern.
   - Partial score playbook: how to write brute force first to bank 30-40% marks.
5. **Previous-Year Questions (PYQ) Database ($n = 42$)**:
   - 42 real candidate-reported questions from 2020–2026 drives.
   - Paraphrased technical descriptions, constraints, common wrong attempts, subtask tips, and verified 3-language code.
   - Interactive SVG charts: pattern frequency by position, topic heatmap table.
6. **52 Predicted Assessment Sets**:
   - Mirror real exam structure: P1 Easy, P2 Medium, P3 Hard, optional P4 Complex.
   - Interactive "Reveal Pattern" button to test recognition before seeing hints.
   - Coverage matrix ensures balanced topic distribution with zero problem over-use ($\le 1$).
7. **Timed Mock Assessment Simulator**:
   - 180-minute standard or 90-minute express exam mode.
   - Solutions hidden during testing, auto-saves drafts to local storage, and computes a role-readiness diagnostic score upon submission.
8. **Story-to-Pattern Trainer (216 Drills)**:
   - 18 realistic narrative scenarios across 12 algorithmic patterns with instant verification and constraint explanations.
9. **Competitive Programming Developer Toolkit**:
   - Complexity-from-constraints table and interactive constraint reader.
   - Production Fast I/O snippets for Java, C++, and Python.
   - Java-specific traps on HackerEarth (anti-quicksort $O(N^2)$, integer multiplication overflow, Integer object equality).
   - Dynamic edge-case checklist generator.
   - Printable cheat sheet formatting (`@media print` clean PDF layout).
10. **Mistake Log & Spaced Repetition (SRS)**:
    - Active review intervals (Day 1 → Day 3 → Day 7).
    - Local storage persistence with JSON backup and restore.
11. **100 Oral DSA & CS Questions**:
    - Pre-interview preparation covering BFS/DFS dry runs, SQL window functions (`DENSE_RANK`), DBMS indexing, OOPs virtual tables, and OS deadlocks.

---

## How to Re-Run Verification Test Harness

The project includes an automated multi-language test harness in `/verify` that compiles and runs Java (`javac`), C++ (`clang++`), and Python against randomized stress tests and a brute-force oracle.

To execute the test harness:

```bash
python3 verify/runner.py
```

The harness will:
1. Compile `Solution.java` using the local Java compiler.
2. Compile `solution.cpp` with `-O3 -std=c++17`.
3. Run 15 randomized stress test cases against Python, C++, and Java binaries.
4. Verify 100% agreement between all 3 languages and the brute-force oracle.
5. Update `/verify/verification-report.json`.

---

## How to Add a New Problem

1. Add the verified problem entry to `/data/problems.json`:
   ```json
   {
     "id": "cf-XXXX-y",
     "contestId": XXXX,
     "index": "Y",
     "title": "Problem Title",
     "url": "https://codeforces.com/problemset/problem/XXXX/Y",
     "rating": 1300,
     "tier": "P2 Medium",
     "pattern": "binary_search",
     "patternName": "Binary Search (incl. on Answer)",
     "tags": ["binary search"],
     "storyDisguise": "In a logistics hub...",
     "paraphrase": "Paraphrased 2-3 sentence technical summary...",
     "constraints": "N <= 10^5, time limit 1.0s"
   }
   ```
2. Re-run `npm run build` to validate schema integrity and rebuild the static bundle.

---

## Local Development & Static Export

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Build static production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## Verification Audit Summary

See [`/VERIFICATION.md`](file:///Users/aashishkumarray/Desktop/creativity-with-ai/infosys-spdse/VERIFICATION.md) for full audit metrics:
- 327 verified Codeforces problems
- 42 verified PYQs from 2020–2026 drives
- 52 predicted sets
- 216 pattern recognition drills
- 100 oral interview questions
- 100% compiled & stress-tested multi-language code
