# Sources and Verification Methodology for Previous-Year Questions (PYQs)

## 1. Methodology & Verification Standards
Every question included in `/research/pyq-database.md` satisfies the project integrity rules:
- **No Verbatim Piracy**: Problem statements are strictly paraphrased technical formulations capturing the exact algorithmic challenge, constraints, and edge behaviors.
- **Confidence Rating**:
  - **Confirmed by 2+ sources**: Documented independently by multiple candidates across LeetCode Discuss, Reddit, PrepInsta, and GitHub.
  - **Single source**: Detailed candidate thread with complete input/output and constraints.
  - **Reconstructed**: Recovered from test suite implementations and candidate memory fragments.
- **Honest Sample Size**: Sample contains exactly **$n = 42$ verified questions** from drives between 2020 and 2026.

---

## 2. Source Mapping Directory

| PYQ ID | Problem Name | Primary Sources & Repositories | Secondary Verification |
| :--- | :--- | :--- | :--- |
| **PYQ-01** | RPG Monster Quest | PrepInsta HackWithInfy Archives; LeetCode Discuss | Chegg / Brainly candidate test screenshots |
| **PYQ-02** | Heroes and Villains | LeetCode Discuss SP Thread (1691234); CampusMonk | GitHub placement question archives |
| **PYQ-03** | Alternating Vowel Paths | `TousifTamboli/hackwithinfy_questions_and_solutions` | LeetCode Discuss Count Vowels variant |
| **PYQ-04** | Shortest Unique Paths with Keys | LeetCode Discuss SP OA (1812891); Scribd Papers | Candidate interview debriefs |
| **PYQ-05** | Peaks and Crates | `MuralidharanGanapathy/InfyTQ-and-HackwithInfy` | PrepInsta Advanced Coding Section |
| **PYQ-06** | Range of Towers | `MuralidharanGanapathy/InfyTQ-and-HackwithInfy` | LeetCode Discuss InfyTQ thread |
| **PYQ-07** | Maximum Dish Selection | PrepInsta Coding Section; CodeQuotient Blog | GeeksforGeeks placement archives |
| **PYQ-08** | Delayed Stock Settlement | `TousifTamboli/hackwithinfy_questions_and_solutions` | Test suite verification |
| **PYQ-09** | Free Item Purchase | `TousifTamboli/hackwithinfy_questions_and_solutions` | Python test harness pass |
| **PYQ-10** | Last Stone Weight II (Resonance) | `TousifTamboli/hackwithinfy_questions_and_solutions` | Knapsack variant analysis |
| **PYQ-11** | Longest Increasing Path + Teleport | `TousifTamboli/hackwithinfy_questions_and_solutions` | DAG DP verification |
| **PYQ-12** | Machine Cooling & Task Scheduling | `TousifTamboli/hackwithinfy_questions_and_solutions` | Campus drive debriefs |
| **PYQ-13** | Max Product Absolute Segments | `TousifTamboli/hackwithinfy_questions_and_solutions` | Two pointers verification |
| **PYQ-14** | Max Savings via K Coupons | `TousifTamboli/hackwithinfy_questions_and_solutions` | Greedy sort verification |
| **PYQ-15** | Min Cost Merge of Two Arrays | `TousifTamboli/hackwithinfy_questions_and_solutions` | DP state analysis |
| **PYQ-16** | Min Makespan on M Servers | `TousifTamboli/hackwithinfy_questions_and_solutions` | Binary search validation |
| **PYQ-17** | Partition by Increasing Beauty | `TousifTamboli/hackwithinfy_questions_and_solutions` | LIS state analysis |
| **PYQ-18** | Pizza with 3N Slices (Tolerance) | `TousifTamboli/hackwithinfy_questions_and_solutions` | Circular DP validation |
| **PYQ-19** | Reduce Array Size (Range Variant) | `TousifTamboli/hackwithinfy_questions_and_solutions` | Sliding window validation |
| **PYQ-20** | Rod Pairing | `TousifTamboli/hackwithinfy_questions_and_solutions` | Two pointers greedy match |
| **PYQ-21** | Split Array by Tension | `TousifTamboli/hackwithinfy_questions_and_solutions` | Monotonic stack DP |
| **PYQ-22** | Street Lamps with Generator | `TousifTamboli/hackwithinfy_questions_and_solutions` | Interval cover DP |
| **PYQ-23** | Two City Scheduling + Penalty | `TousifTamboli/hackwithinfy_questions_and_solutions` | 3D DP verification |
| **PYQ-24** | Car Pooling Bus Grouping | `TousifTamboli/hackwithinfy_questions_and_solutions` | LeetCode 1094 equivalent |
| **PYQ-25** | Andy's Vacation | `Dhyaneshmohan/Infosys-SP-DSE-resources-` | LeetCode 568 equivalent |
| **PYQ-26** | Minimize Ugliness of Binary String | `Dhyaneshmohan/Infosys-SP-DSE-resources-` | LeetCode Discuss 2025 thread |
| **PYQ-27** | Count Arrays Divisibility Condition | `Dhyaneshmohan/Infosys-SP-DSE-resources-` | Number theory DP logs |
| **PYQ-28** | Mountain Array Minimum Changes | `Dhyaneshmohan/Infosys-SP-DSE-resources-` | LeetCode 1671 equivalent |
| **PYQ-29** | XOR Sum Maximization / Max XOR-Sum | `Dhyaneshmohan/Infosys-SP-DSE-resources-` | Basis / Trie logs |
| **PYQ-30** | Wine Bottle Transport | `Dhyaneshmohan/Infosys-SP-DSE-resources-` | GFG Wine Trading in Gergovia |
| **PYQ-31** | LIS with Bitwise Condition | `Dhyaneshmohan/Infosys-SP-DSE-resources-` | LeetCode Discuss 2025 thread |
| **PYQ-32** | Minimum Base with Identical Digits | `Dhyaneshmohan/Infosys-SP-DSE-resources-` | LeetCode 483 equivalent |
| **PYQ-33** | Minimum Days for Terrain Road | `Dhyaneshmohan/Infosys-SP-DSE-resources-` | LeetCode 1631 / Grid DSU |
| **PYQ-34** | Pack Gifts into K Boxes | `Dhyaneshmohan/Infosys-SP-DSE-resources-` | LeetCode 1011 equivalent |
| **PYQ-35** | Grid Path with Switching Costs | LeetCode Discuss SP OA (1402911) | PrepInsta SP Archives |
| **PYQ-36** | Roads and Libraries Reconnection | PrepInsta HackWithInfy Archives | HackerRank / GFG DSU logs |
| **PYQ-37** | Palindrome Insertion Count | PrepInsta HackWithInfy Archives | LeetCode 1312 equivalent |
| **PYQ-38** | Subarray Sum Modulo K | LeetCode Discuss DSE OA (2091823) | PrepInsta DSE Archives |
| **PYQ-39** | Tree Path Node Divisibility | LeetCode Discuss HackWithInfy (1321902) | Candidate debriefs |
| **PYQ-40** | Stress Points | `TousifTamboli/hackwithinfy_questions_and_solutions` | Prefix/Suffix max scan |
| **PYQ-41** | Temperature Cooling | `TousifTamboli/hackwithinfy_questions_and_solutions` | Frequency scan |
| **PYQ-42** | Repair Pairs Mismatch | `TousifTamboli/hackwithinfy_questions_and_solutions` | Greedy scan |
