import { LearningTopic } from '../../types';

export const DSA_LEARNING_TOPICS: LearningTopic[] = [
  {
    id: 'dsa-complexity',
    subject: 'dsa',
    title: 'Asymptotic Analysis & Master Theorem',
    category: 'Analysis of Algorithms',
    readTimeMinutes: 8,
    summary: 'Master Big-O, Big-Omega, Big-Theta notation, recurrence relations, and the Master Theorem shortcuts tested in GATE and product interviews.',
    content: {
      coreConcept: `Asymptotic analysis evaluates algorithm performance as input size $n \\to \\infty$, ignoring hardware-specific constants. 
- **Big-O ($O$)**: Tight/Loose Upper Bound ($f(n) \\le c \\cdot g(n)$)
- **Big-Omega ($\\Omega$)**: Lower Bound ($f(n) \\ge c \\cdot g(n)$)
- **Big-Theta ($\\Theta$)**: Tight Bound ($c_1 \\cdot g(n) \\le f(n) \\le c_2 \\cdot g(n)$)

### The Master Theorem for Divide & Conquer:
For recurrences of the form:
$$T(n) = a \\cdot T(n / b) + f(n)$$
where $a \\ge 1, b > 1$, compare $f(n)$ with $n^{\\log_b a}$:
1. **Case 1**: If $f(n) = O(n^{\\log_b a - \\epsilon})$, then $T(n) = \\Theta(n^{\\log_b a})$
2. **Case 2**: If $f(n) = \\Theta(n^{\\log_b a} \\cdot \\log^k n)$ where $k \\ge 0$, then $T(n) = \\Theta(n^{\\log_b a} \\cdot \\log^{k+1} n)$
3. **Case 3**: If $f(n) = \\Omega(n^{\\log_b a + \\epsilon})$ and regularity condition holds ($a \\cdot f(n/b) \\le c \\cdot f(n)$ for $c < 1$), then $T(n) = \\Theta(f(n))$.`,
      keyPoints: [
        'Order of growth: O(1) < O(log log n) < O(log n) < O(n^(1/2)) < O(n) < O(n log n) < O(n^2) < O(n^3) < O(2^n) < O(n!) < O(n^n)',
        'Master theorem cannot be applied if: a is not constant (e.g. 2^n), b <= 1, or f(n) is not polynomial (e.g. 2^n or sin(n))',
        'For T(n) = 2T(n-1) + 1, order is O(2^n). For T(n) = T(n-1) + n, order is O(n^2).'
      ],
      formulasAndRules: [
        { title: 'Merge Sort Recurrence', detail: 'T(n) = 2T(n/2) + O(n) => a=2, b=2 => n^(log_2 2) = n^1 => Case 2 (k=0) => Theta(n log n)' },
        { title: 'Binary Search Recurrence', detail: 'T(n) = T(n/2) + O(1) => a=1, b=2 => n^(log_2 1) = n^0 = 1 => Case 2 => Theta(log n)' },
        { title: 'Strassen Matrix Mult', detail: 'T(n) = 7T(n/2) + O(n^2) => n^(log_2 7) approx n^2.807 > n^2 => Theta(n^2.807)' }
      ],
      interviewPitfalls: [
        'Assuming inner loop with variable step runs in O(n): for (int j=1; j<=n; j*=2) runs in O(log n), making nested loop O(n log n), not O(n^2).',
        'Confusing Worst-Case with Upper Bound (Big-O is a notation, worst-case is an event scenario).'
      ],
      gateOrPlacementTip: 'In GATE, watch out for $T(n) = 2T(n/2) + n/\\log n$. Here $f(n) = n \\log^{-1} n$. Master theorem standard cases FAIL because difference is not polynomial $n^\\epsilon$. Extended Master theorem gives $\\Theta(n \\log \\log n)$.'
    },
    quickQuiz: [
      {
        question: 'What is the tight asymptotic bound for T(n) = 8T(n/2) + n^3?',
        options: ['Theta(n^3)', 'Theta(n^3 log n)', 'Theta(n^2)', 'Theta(2^n)'],
        correctAnswer: 1,
        explanation: 'a=8, b=2, so n^(log_2 8) = n^3. Since f(n) = n^3 = Theta(n^(log_b a) * log^0 n), this is Case 2 with k=0. Result is Theta(n^3 log n).'
      }
    ]
  },
  {
    id: 'dsa-trees-bst',
    subject: 'dsa',
    title: 'Binary Trees, BST & Self-Balancing Trees',
    category: 'Non-Linear Data Structures',
    readTimeMinutes: 10,
    summary: 'Traversals, node vs height formulas, BST properties, LCA, AVL tree rotations, and Red-Black tree properties.',
    content: {
      coreConcept: `A Binary Tree has at most 2 children per node.
- **Full Binary Tree**: Every node has 0 or 2 children.
- **Complete Binary Tree**: All levels filled except possibly the last, which is filled from left to right (used in Binary Heaps).
- **Perfect Binary Tree**: All internal nodes have 2 children, all leaves at same level. Total nodes = $2^{h+1} - 1$.
- **BST Property**: Left subtree values < Root value < Right subtree values. Inorder traversal always yields strictly sorted order!

### Balancing:
Unbalanced BST worst case degrades to $O(n)$ (skewed tree). AVL trees maintain balance factor $BF = |height(left) - height(right)| \\le 1$ using 4 rotation types:
- **LL Rotation** (Right rotation)
- **RR Rotation** (Left rotation)
- **LR Rotation** (Left-Right double rotation)
- **RL Rotation** (Right-Left double rotation)`,
      keyPoints: [
        'A binary tree with n nodes has exactly (n + 1) null references.',
        'Number of structurally unique binary trees with n nodes = nth Catalan Number = (2n)! / ((n+1)! * n!).',
        'Height of AVL tree with n nodes is strictly bounded by 1.44 * log_2(n).'
      ],
      diagramOrAscii: `
      AVL Tree LL Rotation:
          z (BF=+2)                y
         /                        / \\
        y (BF=+1)    --->        x   z
       /
      x
      Single Right Rotation at z balances the tree!
      `,
      interviewPitfalls: [
        'Checking BST by only comparing node with immediate left and right children. You MUST pass (minVal, maxVal) range bounds down recursion!',
        'Inorder traversal alone cannot uniquely reconstruct a binary tree. You need (Inorder + Preorder) or (Inorder + Postorder).'
      ],
      gateOrPlacementTip: 'GATE frequently asks: What is the minimum number of nodes in an AVL tree of height h? Relation is N(h) = N(h-1) + N(h-2) + 1 where N(0)=1, N(1)=2, N(2)=4, N(3)=7.'
    },
    quickQuiz: [
      {
        question: 'How many distinct binary search trees can be constructed with 4 distinct keys?',
        options: ['14', '24', '42', '12'],
        correctAnswer: 0,
        explanation: 'The number of BSTs with n keys is given by the nth Catalan number: C_4 = (2*4)! / (5! * 4!) = 40320 / (120 * 24) = 14.'
      }
    ]
  },
  {
    id: 'dsa-graphs',
    subject: 'dsa',
    title: 'Graph Algorithms & Shortest Paths',
    category: 'Advanced Data Structures',
    readTimeMinutes: 12,
    summary: 'BFS, DFS, Cycle Detection, Topological Sort (Kahn), Shortest Path (Dijkstra, Bellman-Ford, Floyd-Warshall), and MST (Kruskal, Prim).',
    content: {
      coreConcept: `Graphs $G=(V, E)$ represent networks of nodes connected by edges.
- **BFS (Breadth First Search)**: Uses Queue. Finds shortest path in unweighted graphs. Time $O(V + E)$.
- **DFS (Depth First Search)**: Uses Stack / Recursion. Used for topological sort, connected components, cycle detection. Time $O(V + E)$.

### Shortest Path Algorithms:
| Algorithm | Graph Type | Time Complexity | Notes |
| :--- | :--- | :--- | :--- |
| **BFS** | Unweighted | $O(V + E)$ | Optimal for unit weights |
| **Dijkstra** | Non-negative weights | $O((V+E) \\log V)$ | Greedy; fails on negative weight cycles |
| **Bellman-Ford** | Negative weights allowed | $O(V \\cdot E)$ | Dynamic programming; detects negative cycles |
| **Floyd-Warshall** | All-Pairs Shortest Path | $O(V^3)$ | Computes matrix $D[i][j]$ |

### Minimum Spanning Tree (MST):
- **Kruskal Algorithm**: Sorts edges ($O(E \\log E)$), uses Disjoint Set Union (DSU) with Path Compression and Union by Rank ($O(\\alpha(V))$).
- **Prim Algorithm**: Grows tree node-by-node using Min-Heap ($O(E \\log V)$).`,
      keyPoints: [
        'Topological sort exists ONLY in Directed Acyclic Graphs (DAG).',
        'Kahn Algorithm uses in-degree array. If vertices processed < V, cycle exists!',
        'Bellman-Ford runs (V-1) relaxation passes. If distance can still be reduced in Vth pass, a negative cycle exists.'
      ],
      interviewPitfalls: [
        'Running Dijkstra on graph with negative edge weights. Dijkstra assumes once a node is finalized from priority queue, its distance is optimal, which fails with negative weights.',
        'Using DFS recursion without tracking visited array or recursion stack, causing infinite recursion on cyclic graphs.'
      ],
      gateOrPlacementTip: 'If all edge weights in a graph are distinct, the Minimum Spanning Tree is guaranteed to be UNIQUE. However, the shortest path tree might not be unique.'
    },
    quickQuiz: [
      {
        question: 'What is the time complexity of Bellman-Ford algorithm for a dense graph with V vertices and E = O(V^2) edges?',
        options: ['O(V^2)', 'O(V^3)', 'O(V log V)', 'O(E log V)'],
        correctAnswer: 1,
        explanation: 'Bellman-Ford takes O(V * E). For a dense graph where E = O(V^2), the time complexity becomes O(V * V^2) = O(V^3).'
      }
    ]
  },
  {
    id: 'dsa-dp',
    subject: 'dsa',
    title: 'Dynamic Programming: Patterns & Memoization',
    category: 'Algorithms Design',
    readTimeMinutes: 10,
    summary: 'Optimal substructure, overlapping subproblems, 0/1 Knapsack, Longest Common Subsequence (LCS), Longest Increasing Subsequence (LIS), and Matrix Chain Multiplication.',
    content: {
      coreConcept: `Dynamic Programming solves complex problems by breaking them down into simpler overlapping subproblems and storing their solutions.

### Essential DP Patterns:
1. **0/1 Knapsack**: Pick item or don't. Recurrence:
   $$dp[i][w] = \\max(dp[i-1][w], \\text{val}[i-1] + dp[i-1][w - \\text{wt}[i-1]])$$
   Time $O(N \\times W)$, Space can be optimized to $O(W)$ using 1D array traversed backwards.
2. **Unbounded Knapsack / Coin Change**: Items can be used unlimited times. Traversed forwards in 1D array.
3. **Longest Common Subsequence (LCS)**:
   - If $s_1[i-1] == s_2[j-1]$: $dp[i][j] = 1 + dp[i-1][j-1]$
   - Else: $dp[i][j] = \\max(dp[i-1][j], dp[i][j-1])$
4. **Longest Increasing Subsequence (LIS)**: Standard DP is $O(N^2)$, but Binary Search ('std::lower_bound' / patience sorting) achieves $O(N \\log N)$.
5. **Matrix Chain Multiplication (MCM)**: Partition DP with recurrence $dp[i][j] = \\min_{k} (dp[i][k] + dp[k+1][j] + d_{i-1} d_k d_j)$.`,
      keyPoints: [
        'Top-down (Memoization) uses recursion + cache. Bottom-up (Tabulation) builds iteratively from base cases.',
        'Space optimization: If current row only depends on previous row, space can be reduced from O(N * W) to O(W).',
        'Fractional Knapsack uses Greedy (by value/weight ratio), but 0/1 Knapsack requires Dynamic Programming.'
      ],
      interviewPitfalls: [
        'When space-optimizing 0/1 knapsack to 1D array, forgetting to iterate capacity backwards. Iterating forwards turns it into Unbounded Knapsack!',
        'Thinking 0/1 Knapsack is polynomial time: it is Pseudo-Polynomial O(N * W) because W is numeric value, taking O(2^b) where b is number of bits.'
      ],
      gateOrPlacementTip: 'Placement coding rounds love Coin Change (Min coins vs total number of ways) and Edit Distance (Insert, Delete, Replace). Memorize the state transitions!'
    },
    quickQuiz: [
      {
        question: 'In 0/1 Knapsack with N items and maximum weight capacity W, what is the time complexity?',
        options: ['O(N + W)', 'O(N * W)', 'O(2^N)', 'O(N^2)'],
        correctAnswer: 1,
        explanation: 'Dynamic programming table size is (N+1) x (W+1), requiring O(N * W) state calculations. Note that this is pseudo-polynomial in terms of input bit length.'
      }
    ]
  }
];
