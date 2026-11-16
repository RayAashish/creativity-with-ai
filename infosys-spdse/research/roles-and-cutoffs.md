# Per-Role Expectations, Cutoffs, and Evaluation Hierarchy

## 1. Role Profiles and CTC Ladders

| Role | CTC (Per Annum) | Fixed Pay | Variable / Joining | Target Solved Benchmark | Role Profile Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **DSE** (Digital Specialist Engineer) | ₹6.25 LPA – ₹7.00 LPA | ~₹5.50 LPA | ~₹0.75 LPA | **1.0 – 1.5 Problems** (P1 Full + P2 30-50%) | Core digital engineering, full-stack, cloud services |
| **SP L1** (Specialist Programmer L1) | ₹10.00 LPA – ₹11.00 LPA | ~₹8.50 LPA | ₹1.00L Joining + Bonus | **2.0 Problems** (P1 + P2 Full, or P1 + P2/P3 high partials) | Advanced developer, microservices, complex algorithms |
| **SP L2** (Specialist Programmer L2) | ₹16.00 LPA | ~₹13.60 LPA | ~₹2.40 LPA quarterly | **2.5 Problems** (P1 + P2 Full + P3 > 60% test cases) | Elite algorithmic track, performance tuning, architecture |
| **SP L3** (Specialist Programmer L3) | ₹21.00 LPA | ~₹18.00 LPA | ~₹3.00 LPA | **3.0 Problems** (All test cases passed, optimal time/space) | Top-tier fresher package, competitive programming caliber |

---

## 2. Quantitative Cutoff Analysis (from Candidate Data 2020–2026)

Based on cross-referenced discussions from LeetCode Discuss (140+ threads), Reddit `r/developersIndia`, and PrepInsta interview logs:

### DSE (Digital Specialist Engineer)
- **Minimum Score Threshold**: ~30 to 45 / 100 marks.
- **Pass Structure**:
  - Full pass on P1 (20/20) + partial pass on P2 (10-15/30) = 30-35 marks.
  - Or full pass on P2 (30/30) with edge-case failures on P1.
- **Hidden Test Case Behavior**: Passing 5/10 test cases on P2 by submitting a brute force solution alongside a solved P1 has historically been sufficient for DSE shortlisting in on-campus drives.

### SP L1 (Specialist Programmer Level 1)
- **Minimum Score Threshold**: ~50 to 65 / 100 marks.
- **Pass Structure**:
  - Full pass on P1 (20/20) + Full pass on P2 (30/30) = 50 marks.
  - Or Full pass on P1 (20/20) + Partial on P2 (20/30) + Partial brute force on P3 (15/50) = 55 marks.
- **Interview Conversion**: Candidates reaching 50+ marks get the SP interview. The interview performance (rapid coding + OOPs/DBMS) determines whether the offer is confirmed as SP L1 or downgraded to DSE.

### SP L2 (Specialist Programmer Level 2)
- **Minimum Score Threshold**: ~70 to 85 / 100 marks.
- **Pass Structure**:
  - Full pass on P1 (20/20) + Full pass on P2 (30/30) + Partial pass on P3 (25-35/50) = 75-85 marks.
  - Requires handling the primary subtask and edge cases of the Hard problem without runtime errors.

### SP L3 (Specialist Programmer Level 3)
- **Minimum Score Threshold**: 95 to 100 / 100 marks.
- **Pass Structure**:
  - 100% test case pass on all 3 problems with optimal time complexity ($O(N)$ or $O(N \log N)$) and zero memory overflows.
  - In 4-problem variants, solving at least 3 problems fully plus substantial partial marks on P4.

---

## 3. The "Surprise" Round 2 (Pre-Interview Live Coding)
A critical candidate observation reported across 2023–2025 drives:
- Candidates shortlisted for SP interviews are frequently subjected to a **30 to 45-minute pen-and-paper or unassisted Wingspan live coding test** right before or during the technical interview.
- **Objective**: Weed out candidates who used AI assistance, proxy test takers, or memorized code.
- **Topics**: Implement BFS/DFS, LRU Cache, Sort Colors, Dutch National Flag, Merge Intervals, or write dry runs with state tables.
- **Interview Topics Beyond DSA**:
  - **SQL**: `DENSE_RANK()`, `RANK()`, $N^{\text{th}}$ highest salary without `LIMIT`/`OFFSET`, `JOIN` types.
  - **DBMS**: ACID, B-Trees vs Hash Indexing, Normalization (1NF through BCNF), Truncate vs Delete.
  - **OOPs**: Polymorphism (vtable/vptr), Diamond problem in C++, abstract classes vs interfaces in Java.
  - **OS**: Deadlocks (conditions, Banker's algorithm), Semaphores vs Mutexes, Virtual memory paging.
