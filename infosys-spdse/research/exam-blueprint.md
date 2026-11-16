# Infosys SP / DSE Assessment Blueprint & Structure

## 1. Executive Overview
The Infosys recruitment engine for differential digital roles filters engineering talent into two primary bands:
- **Digital Specialist Engineer (DSE)**: Compensation band ₹6.25 LPA – ₹7.00 LPA.
- **Specialist Programmer (SP)**: Premium coding track split into three internal competence tiers:
  - **SP L1**: ~₹10.0 LPA – ₹11.0 LPA (Standard fresher SP package)
  - **SP L2**: ~₹16.0 LPA
  - **SP L3**: ~₹21.0 LPA (Elite competitive programming tier)

Assessments are administered either through national hackathons (**HackWithInfy**), campus hiring drives, off-campus pool drives, or the **InfyTQ / Springboard** certification track.

---

## 2. Assessment Platform & Operational Environment
- **Host Platforms**:
  - Primary: **HackerEarth** (for on-campus and national recruitment drives).
  - Secondary: **Infosys Wingspan / IWA Internal Portal** (used during proctored physical lab rounds and subsequent evaluation).
  - Occasional: **Wheebox** (historically used for remote proctored drives).
- **Proctoring**: Strict audio/video proctoring, full-screen lock enforcement, tab-switch monitoring (often terminating tests after 3 warning alerts).
- **Allowed Programming Languages**:
  - **Java**: Java 8 / 11 / 17. Must use fast I/O (`BufferedReader` / `StringTokenizer`) to prevent I/O-bound Time Limit Exceeded (TLE) errors.
  - **C++**: GCC C++14 / C++17 / C++20. Standard optimization template (`ios_base::sync_with_stdio(false); cin.tie(NULL);`) recommended.
  - **Python**: Python 3.8 / 3.10. Caution: Heavy loops in Python often hit TLE on $N \ge 10^5$ test cases; `sys.stdin.read` is mandatory.
  - **C / JavaScript**: Supported on HackerEarth, but standard CP practices favor C++, Java, or Python.

---

## 3. Exam Structure, Scoring, and Time Allocation

### Standard 3-Problem Format (Most Common: 180 Minutes)
| Position | Difficulty | Typical Topic Archetype | Marks Weightage | Target Time Budget |
| :--- | :--- | :--- | :--- | :--- |
| **P1** | **Easy / Warm-up** | Arrays, Strings, Two Pointers, Prefix Sum, Hashing, Basic Math | 20 Marks | 20 – 30 mins |
| **P2** | **Medium** | Greedy, Binary Search on Answer, Sliding Window, Monotonic Stack, Simple Intervals | 30 Marks | 40 – 55 mins |
| **P3** | **Hard** | Dynamic Programming (Grid, 2D, Knapsack/Partition), Trees, Graphs (Dijkstra/DSU), Bitmask | 50 Marks | 75 – 95 mins |
| **Buffer** | Debugging / Brute-force subtask fallback / Edge-case verification | | | 15 – 25 mins |

*Total Duration*: **180 minutes (3 hours)**. Total Marks: **100 marks**.

### Alternate 4-Problem Format (HackWithInfy Finale / Special Drives: 180 Minutes)
In HackWithInfy Round 2 or Grand Finale drives, a 4th problem is introduced:
- **P1 Easy (15 marks)**
- **P2 Medium (25 marks)**
- **P3 Hard (30 marks)**
- **P4 Complex / Advanced (30 marks)** (Complex graph flows, advanced DP on trees, segment trees/Fenwick trees).

---

## 4. Test Case Architecture & Partial Scoring Mechanics
Infosys does **not** evaluate code on an all-or-nothing basis. Submissions are graded against discrete test cases:

1. **Sample / Public Test Cases (2 to 3 test cases)**:
   - Visible in the problem pane.
   - Intended solely to verify comprehension of problem rules, input format, and basic constraints. Passing sample tests carries **0 score** on the final tally.
2. **Hidden Test Cases (10 to 20 test cases per problem)**:
   - **Subtask 1 (Small constraints, 30%–40% marks)**: $N \le 1000$. Solvable by $O(N^2)$ brute-force solutions (nested loops, basic recursion).
   - **Subtask 2 (Full constraints, 60%–70% marks)**: $N \le 10^5$ or $N \le 5 \times 10^5$. Requires $O(N)$ or $O(N \log N)$ optimal solutions.
   - **Hidden Edge Cases**: Handled via boundary testing:
     - Empty array or single element ($N=1$).
     - All identical elements or all zero / negative numbers.
     - Integer overflow: values up to $10^9$ requiring 64-bit integer (`long` in Java, `long long` in C++), or modulo $10^9+7$.
     - Extreme graph shapes: disconnected components, star graphs, linear chains (causing stack overflow in unoptimized recursion).

---

## 5. Strategic Rule of Engagement
1. **Solve P1 completely first**: Secure the guaranteed 20 marks within 25 minutes.
2. **Target P2 with full optimization**: A clean pass on P2 yields 50 marks cumulative, nearly guaranteeing the DSE interview shortlist.
3. **Write brute-force fallback on P3 immediately if stuck**: If the optimal $O(N \log N)$ or DP approach is not apparent within 15 minutes, code an $O(N^2)$ or recursive brute-force to bank 15 to 20 partial marks (bringing total score to 65–70 marks, which often triggers an SP L1 shortlist).
4. **Optimize P3**: Upgrade the memoization or state transitions to pass full test cases for SP L2/L3 eligibility.
