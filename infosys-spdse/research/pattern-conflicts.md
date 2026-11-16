# Conflict Log: Discrepancies Across Candidate Reports, Coaching Sites, and Recruitment Drives

When analyzing reports from GeeksforGeeks, PrepInsta, FACE Prep, LeetCode Discuss, Reddit (`r/developersIndia`, `r/Infosys`), and Glassdoor across 2020–2026, several structural conflicts emerge. These are logged below with their verified variants and prep implications.

---

## Conflict 1: Assessment Duration & Time Limits
- **Variant A (Dominant / Official HackWithInfy & National SP Drive)**: **180 minutes (3 hours)** for 3 problems. Supported by PrepInsta, GeeksforGeeks, and official Infosys campus mailers for 2021–2025.
- **Variant B (Off-Campus Pool / Express Assessment)**: **90 minutes or 120 minutes** for 3 problems. Reported on `r/developersIndia` for specific off-campus batches where candidates received shorter slots, often with P1 and P2 slightly watered down.
- **Variant C (Internal Upgrade / Bridge Program SE to DSE/SP)**: **60 to 90 minutes** for 2 coding problems.
- **Resolution & Strategy**:
  - The prep platform defaults to the **180-minute / 3-problem** model (standard benchmark).
  - The mock exam simulator allows switching between **180-min (3 problems)** and **90-min (2 problems)** modes so candidates prepare for both time densities.

---

## Conflict 2: Question Count & Tier Distribution
- **Variant A**: **3 Problems (Easy, Medium, Hard)** with marks 20 + 30 + 50 = 100. (Standard on HackerEarth).
- **Variant B**: **4 Problems (Easy, Medium, Hard, Complex)**. Reported in HackWithInfy Round 2 / National Finalist evaluations.
- **Variant C**: **2 Problems**. Reported in pre-interview onsite rounds or pen-and-paper "surprise verification" rounds immediately preceding the technical interview.
- **Resolution & Strategy**:
  - The core curriculum and predicted sets support 3-problem sets by default with an optional 4th Complex problem for SP L3 candidates.

---

## Conflict 3: Sectional & Problem Navigation Rules
- **Variant A (Free Tab Navigation)**: Candidates can click between P1, P2, and P3 at will, submit code iteratively, run test cases, and return to earlier problems anytime before the 180 minutes expire. (Typical on standard HackerEarth configurations).
- **Variant B (Forward-Only Lock)**: Candidates reported that once a problem was submitted or the next problem was clicked, navigation back to previous problems was disabled (lock-in). This was reported on certain Infosys internal portal / Wingspan test instances.
- **Resolution & Strategy**:
  - Candidates **must always be trained under the conservative assumption**: Do not advance past P1 until you have verified all possible edge cases and test cases, because a forward-lock prevents fixing regressions later.

---

## Conflict 4: Inclusion of MCQs & Pseudocode Tracing
- **Variant A (Pure Coding Assessment)**: Zero MCQs. Pure algorithmic coding on HackerEarth with standard stdin/stdout. (Dominant SP / DSE OA format).
- **Variant B (InfyTQ Certification Route)**: 20 MCQs (covering OOPs, DBMS/SQL, Data Structures, and Python/Java syntax) followed by 2 hands-on coding questions.
- **Variant C (Pseudocode Tracing Section)**: Some colleges reported a 15–20 question Pseudocode / Algorithmic tracing section preceding the coding window.
- **Resolution & Strategy**:
  - The site includes a dedicated **Pseudocode Tracing, OOP & DBMS Interview Module** to ensure candidates who face an MCQ or interview screening segment are not caught unprepared, while keeping the main coding track focused on DSA.

---

## Conflict 5: Role Cut-Off Thresholds (DSE vs SP L1 vs SP L2 vs SP L3)
- **Starting Hypothesis**:
  - DSE: ~1 to 1.5 problems.
  - SP: ~2+ problems.
- **Candidate Findings & Nuances**:
  - **DSE Cutoff**: Candidates with **1 full problem + 30%–50% test cases on P2** routinely receive interview invites for DSE (~₹6.25 LPA). Passing only 1 problem with 0 marks on other questions is borderline and depends on college batch percentiles.
  - **SP L1 Cutoff**: Requires **2 full problems (P1 + P2 = 50 marks)** or **1 full problem + high partials on both P2 and P3 (~55–65 marks)**.
  - **SP L2 Cutoff**: Requires **2 full problems + significant partials on P3 (>70–80 marks)**.
  - **SP L3 Cutoff**: Requires **all 3 problems fully solved (100 marks)** or 3.5 problems on 4-problem sets, with optimal time and space complexity and clean code.
- **Data Configuration**: Stored cleanly in `/data/roles.json` with editable parameters.

---

## Conflict 6: Allowed Languages and Compiler Nuances
- **Variant A (Standard)**: C, C++, Java, Python.
- **Variant B (Strict / Restricted in certain drives)**: Some college drives only permitted Java and Python, or only C++ and Java.
- **Performance Discrepancy**: Python solutions that pass sample test cases frequently fail with TLE on HackerEarth due to interpreter overhead when $N \ge 2 \times 10^5$, whereas the identical $O(N)$ algorithm in Java/C++ passes comfortably in 0.15s.
- **Resolution**:
  - Provide tested solutions in all 3 languages (Java, C++, Python) for every problem.
  - Provide explicit TLE warnings and Fast I/O snippets for Python and Java.
