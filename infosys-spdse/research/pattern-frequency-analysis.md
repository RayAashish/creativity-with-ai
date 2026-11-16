# Pattern Frequency and Positional Distribution Analysis

> **Empirical Basis**: Derived from an audited sample of $n = 42$ verified previous-year questions (PYQs) from Infosys Specialist Programmer (SP), Digital Specialist Engineer (DSE), and HackWithInfy drives between 2020 and 2026. Every statistic is bound to this explicit sample size.

---

## 1. Overall Frequency Distribution ($n = 42$)

| Rank | Algorithmic Pattern | Total Occurrences | Frequency (%) | Primary Problem Positions |
| :--- | :--- | :--- | :--- | :--- |
| **1** | **Dynamic Programming (DP)** | 12 | **28.6%** | P3 (Hard), P4 (Complex), P2 (Medium) |
| **2** | **Sorting & Greedy Optimization** | 5 | **11.9%** | P1 (Easy), P2 (Medium) |
| **3** | **Arrays & Prefix Sums** | 5 | **11.9%** | P1 (Easy), P2 (Medium) |
| **4** | **Binary Search (incl. on Answer)** | 4 | **9.5%** | P2 (Medium) |
| **5** | **Graphs & Trees (BFS / DFS / DSU)** | 4 | **9.5%** | P2 (Medium), P3 (Hard) |
| **6** | **Two Pointers & Sliding Window** | 4 | **9.5%** | P1 (Easy), P2 (Medium) |
| **7** | **Number Theory & Modular Math** | 2 | **4.8%** | P3 (Hard) |
| **8** | **Simulation & Implementation** | 2 | **4.8%** | P1 (Easy), P2 (Medium) |
| **9** | **Bit Tricks / XOR Basis** | 1 | **2.4%** | P3 (Hard) |
| **10** | **Monotonic Stack / Queue** | 1 | **2.4%** | P3 (Hard) |
| **11** | **Strings / LCS Palindromes** | 1 | **2.4%** | P3 (Hard) |
| **12** | **Hashing & Frequency Maps** | 1 | **2.4%** | P1 (Easy) |

---

## 2. Positional Breakdown (Which Pattern at Which Position?)

### Position 1: P1 (Easy / Warm-up, 20 Marks, $n = 10$)
- **Arrays & Prefix Sums**: 40.0% ($4 / 10$)
- **Sorting & Greedy**: 20.0% ($2 / 10$)
- **Two Pointers & Sliding Window**: 20.0% ($2 / 10$)
- **Hashing**: 10.0% ($1 / 10$)
- **Simulation**: 10.0% ($1 / 10$)
- **Takeaway**: P1 is almost exclusively array manipulation, difference arrays/prefix sums, two-pointer scanning, or greedy pairing. A candidate with strong array fundamentals solves P1 in 15–25 minutes.

### Position 2: P2 (Medium, 30 Marks, $n = 15$)
- **Binary Search on Answer**: 26.7% ($4 / 15$)
- **Sorting & Greedy**: 20.0% ($3 / 15$)
- **Two Pointers & Sliding Window**: 13.3% ($2 / 15$)
- **Dynamic Programming (1D / Matrix)**: 20.0% ($3 / 15$)
- **Graphs (Connected Components / DSU)**: 6.7% ($1 / 15$)
- **Arrays & Prefix Sums**: 6.7% ($1 / 15$)
- **Simulation**: 6.7% ($1 / 15$)
- **Takeaway**: P2 is heavily dominated by **Binary Search on Answer** (`isPossible(mid)`) and **Greedy Interval / Scheduling** logic. Mastering these two archetypes ensures clearing P2 and landing the DSE threshold.

### Position 3: P3 (Hard, 50 Marks, $n = 15$)
- **Dynamic Programming (2D, Knapsack, Grid, State Machine)**: 46.7% ($7 / 15$)
- **Graphs & Trees (BFS with Bitmask / Dijkstra / Tree GCD)**: 20.0% ($3 / 15$)
- **Number Theory & Modular Math**: 13.3% ($2 / 15$)
- **Bit Manipulation (XOR Basis)**: 6.7% ($1 / 15$)
- **Monotonic Stack with DP**: 6.7% ($1 / 15$)
- **Interval String DP**: 6.7% ($1 / 15$)
- **Takeaway**: P3 is decisively a **Dynamic Programming** or **Advanced Graph Traversal** problem. Brute-force $O(N^2)$ recursive solutions earn 15–20 partial marks; full solution requires 2D memoization or graph reduction.

### Position 4: P4 (Complex / HackWithInfy Finale & SP L3, $n = 2$)
- **Advanced DP with Teleport / Coordinate Compression**: 50.0% ($1 / 2$)
- **LIS Partition DP**: 50.0% ($1 / 2$)
- **Takeaway**: P4 combines multiple advanced paradigms (e.g., LIS + interval DP or DAG topological order + suffix arrays).

---

## 3. High-Yield Preparation Matrix for the 3-Week Window

1. **Tier 1 (Non-Negotiable - 65% of test marks)**:
   - Dynamic Programming (1D, 2D grid, Knapsack, House Robber/State machines)
   - Greedy Scheduling & Sorting
   - Binary Search on Answer (`low, high, mid`)
2. **Tier 2 (Core Enablers - 25% of test marks)**:
   - Prefix Sums, Difference Arrays, Two Pointers
   - Graph BFS/DFS, Disjoint Set Union (DSU)
3. **Tier 3 (Edge Differentiators for SP L2/L3 - 10% of marks)**:
   - Number Theory (Sieve, GCD, Modular Inverse)
   - Monotonic Stack
   - Bitwise Basis / Trie
