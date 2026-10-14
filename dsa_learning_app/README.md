# 🚀 AlgoMaster Pro — Interactive DSA Learning & 450 Sheet Platform

An all-in-one Data Structures and Algorithms learning web application built for students, interview prep candidates, and software engineers aiming for FAANG/product company coding rounds.

---

## 🌟 Key Features

### 1. 📋 The Famous DSA 450 Sheet Tracker
- **Authentic Curated Question Bank**: High-frequency interview questions across 11+ categories:
  - **Arrays & Matrix** (Two Pointers, Sliding Window, Kadane's Algorithm, 3-Way Partitioning, Trapping Rain Water, etc.)
  - **Strings** (Palindromes, KMP, Subsequences, Anagrams, Edit Distance, etc.)
  - **Linked Lists** (Cycle Detection, Reversal, Merge, Flattening, Intersection, etc.)
  - **Stacks & Queues** (Monotonic Stack, Next Greater Element, Histogram, LRU Cache, etc.)
  - **Trees & Binary Search Trees** (Traversals, LCA, Diameter, Views, BST Validation, etc.)
  - **Graphs** (BFS/DFS, Dijkstra, Topological Sort, Bipartite, Island Flood Fill, etc.)
  - **Dynamic Programming** (0/1 Knapsack, Coin Change, LCS, LIS, Interval DP, Grid DP, etc.)
  - **Heaps & Hashing** (Min/Max Heap, Median of Stream, Top-K, etc.)
  - **Greedy Algorithms** (Interval Scheduling, Fractional Knapsack, Minimum Platforms, etc.)
  - **Backtracking** (N-Queens, Rat in a Maze, Sudoku Solver, etc.)
  - **Bit Manipulation** (Brian Kernighan, Power of 2, Single Number, Subsets Masking, etc.)
- **Direct Jump to Platforms**: Every problem has a direct link to **LeetCode** or **GeeksforGeeks** with difficulty badge (Easy / Medium / Hard) and company tags (Google, Amazon, Microsoft, Meta, Apple, etc.).
- **"Already Done" Toggle**: Mark questions as completed with celebratory confetti and persistent local storage.
- **Starred / Bookmark & Notes**: Expand notes on any problem to write down your intuition, edge cases, and code hints.

---

### 2. 🎲 Random Question Selector ("Problem Roulette")
- **Category-Specific Random Roll**: Click *"🎲 Random [Topic] Question"* to get an unsolved problem from that specific data structure (e.g. Arrays).
- **Global 450 Roulette**: Click *"⚡ Global 450 Roulette"* to pick across all 450 sheet categories.
- **Strict "Already Done" Filter**:
  - The random selector **strictly filters out any question you have already marked as done**, ensuring you never waste time solving repeated problems!
  - If you complete every problem in a category, a celebratory screen invites you to either switch topics or toggle **Revision Mode** to revisit completed questions.

---

### 3. 🎮 Built-in Playable DSA Mini-Games
Playable interactive games that build intuitive mental models for core algorithmic concepts:

1. **Target Sentry: Binary Search Game**:
   - Master $O(\log N)$ divide & conquer.
   - Inspect sorted cyber vaults with interactive `low`, `mid`, and `high` pointers, eliminating half the search space with every move.
2. **Two-Pointer Canyon Crossing**:
   - Sorted array stepping-stones race.
   - Converge Left ($L++$) and Right ($R--$) pointers inward to match target pair sums against the clock in linear $O(N)$ time.
3. **Island Rescue: Grid BFS Simulator**:
   - Concentric BFS queue waves expanding level-by-level to rescue stranded astronauts.
   - Visualizes why BFS guarantees the shortest unweighted path and how visited arrays prevent cycles.
4. **DP Coin Quest: Greedy Trap vs DP**:
   - Dramatic demonstration of why greedy heuristics fail on coins `[1, 3, 4]` for 6¢ (Greedy takes 3 coins, DP finds 2 coins!).
   - Step-by-step interactive 1D DP table builder.
5. **Monotonic Stack: Asteroid Defense**:
   - Defend against incoming asteroid threats by popping smaller items from laser stack to maintain strictly decreasing monotonic order and solve Next Greater Element in amortized $O(N)$.

---

### 4. 📚 Concept & Pattern Academy
- Detailed breakdowns of signature algorithmic patterns.
- Time & Space Complexity cheat-sheets (Average vs Worst case).
- Multi-language solution patterns with 1-click code copying.
- FAANG interview pitfalls & edge-case tips.

---

### 5. 📊 Analytics & Consistency Dashboard
- Total problems solved out of 450 with circular progress percentages.
- Topic-wise completion bars.
- Difficulty breakdown (Easy, Medium, Hard).
- Streak tracker & consistency motivator.
- **Export / Import JSON**: Back up your study progress to a JSON file or restore anytime.

---

## 🛠️ Tech Stack
- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS with dark-mode aesthetic
- **Icons**: Lucide React
- **Animations & Effects**: Canvas Confetti

---

## 🚀 Running the App Locally

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev

# 3. Build for production
npm run build
```

The application runs at **`http://localhost:5173/`**.
All progress is stored in browser `localStorage`, so no backend configuration is required.
