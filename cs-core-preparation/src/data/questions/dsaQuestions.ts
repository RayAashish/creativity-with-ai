import { Question } from '../../types';

export const DSA_QUESTIONS: Question[] = [
  {
    "id": "dsa-q1",
    "subject": "dsa",
    "topic": "Asymptotic Analysis",
    "subtopic": "Master Theorem",
    "difficulty": "medium",
    "examTags": [
      "GATE CS",
      "Campus Placement"
    ],
    "question": "What is the solution to the recurrence relation: T(n) = 4T(n/2) + n^2?",
    "options": [
      "Theta(n^2)",
      "Theta(n^2 log n)",
      "Theta(n^3)",
      "Theta(n log n)"
    ],
    "correctAnswer": 1,
    "explanation": "In T(n) = a*T(n/b) + f(n), a=4, b=2. n^(log_b a) = n^(log_2 4) = n^2. Since f(n) = n^2 = Theta(n^(log_b a)), Master Theorem Case 2 applies with k=0. Therefore, T(n) = Theta(n^2 * log n).",
    "keyFormulaOrNote": "Master Theorem Case 2: If f(n) = Theta(n^(log_b a) * log^k n), then T(n) = Theta(n^(log_b a) * log^(k+1) n)."
  },
  {
    "id": "dsa-q2",
    "subject": "dsa",
    "topic": "Asymptotic Analysis",
    "subtopic": "Recurrence Relations",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "Consider T(n) = 2T(n/2) + n / log(n). Which of the following is true?",
    "options": [
      "Theta(n log n)",
      "Theta(n log log n)",
      "Theta(n^2)",
      "Theta(n)"
    ],
    "correctAnswer": 1,
    "explanation": "Standard Master theorem does not apply because f(n) differs from n^(log_2 2) = n by a logarithmic factor 1/log n (not polynomial n^epsilon). Using extended Master Theorem, T(n) = Theta(n * log(log n)).",
    "keyFormulaOrNote": "T(n) = a*T(n/b) + (n^(log_b a))/(log^k n) => Theta(n^(log_b a) * log log n) when k=1."
  },
  {
    "id": "dsa-q3",
    "subject": "dsa",
    "topic": "Arrays & Pointers",
    "subtopic": "Two Pointers",
    "difficulty": "easy",
    "examTags": [
      "Fundamentals",
      "TCS NQT"
    ],
    "question": "What is the optimal time complexity to find if a pair of elements in a sorted array of size n sums to a target X?",
    "options": [
      "O(n^2)",
      "O(n log n)",
      "O(n)",
      "O(log n)"
    ],
    "correctAnswer": 2,
    "explanation": "With a sorted array, two pointers (left at 0, right at n-1) can check sums and advance inwards in O(n) time and O(1) auxiliary space.",
    "keyFormulaOrNote": "Two pointer technique on sorted arrays solves pair target sum in O(n) time."
  },
  {
    "id": "dsa-q4",
    "subject": "dsa",
    "topic": "Linked Lists",
    "subtopic": "Cycle Detection",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement",
      "Product / MAANG"
    ],
    "question": "In Floyd's Cycle Detection algorithm (Tortoise and Hare), if a cycle exists, what is the space complexity?",
    "options": [
      "O(n)",
      "O(1)",
      "O(log n)",
      "O(n^2)"
    ],
    "correctAnswer": 1,
    "explanation": "Floyd's algorithm only maintains two pointer variables (slow and fast), requiring strictly O(1) auxiliary memory.",
    "keyFormulaOrNote": "Floyd cycle finding uses O(1) space with slow moving 1 step and fast moving 2 steps."
  },
  {
    "id": "dsa-q5",
    "subject": "dsa",
    "topic": "Stacks & Queues",
    "subtopic": "Next Greater Element",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement",
      "TCS NQT"
    ],
    "question": "What data structure is used to solve the \"Next Greater Element\" problem for an array of size n in O(n) time?",
    "options": [
      "Min-Heap",
      "Monotonic Stack",
      "Queue",
      "Balanced BST"
    ],
    "correctAnswer": 1,
    "explanation": "A Monotonic Decreasing Stack stores elements whose next greater element has not yet been discovered. Each element is pushed and popped at most once, yielding total O(n) time.",
    "keyFormulaOrNote": "Monotonic Stack maintains sorted order of elements and processes range queries in amortized O(1)."
  },
  {
    "id": "dsa-q6",
    "subject": "dsa",
    "topic": "Binary Trees",
    "subtopic": "Tree Reconstruction",
    "difficulty": "easy",
    "examTags": [
      "Fundamentals",
      "GATE CS"
    ],
    "question": "Which pair of tree traversals is SUFFICIENT to uniquely construct a binary tree?",
    "options": [
      "Preorder and Postorder",
      "Inorder and Preorder",
      "Level-order and Preorder",
      "Preorder and Depth-first search"
    ],
    "correctAnswer": 1,
    "explanation": "Inorder provides the left/right partitioning relative to the root, while Preorder identifies the root node. Together, Inorder + Preorder uniquely reconstruct a binary tree.",
    "keyFormulaOrNote": "Unique Binary Tree reconstruction requires Inorder traversal along with either Preorder or Postorder."
  },
  {
    "id": "dsa-q7",
    "subject": "dsa",
    "topic": "Binary Trees",
    "subtopic": "Catalan Numbers",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "How many structurally distinct binary search trees can be formed with n = 5 distinct keys?",
    "options": [
      "14",
      "42",
      "120",
      "48"
    ],
    "correctAnswer": 1,
    "explanation": "The number of distinct BSTs with n keys is given by the nth Catalan number: C_n = (2n)! / ((n+1)! * n!). For n=5: C_5 = 42.",
    "keyFormulaOrNote": "Catalan Number C_n = (2n)! / ((n+1)! * n!) counts BSTs with n keys."
  },
  {
    "id": "dsa-q8",
    "subject": "dsa",
    "topic": "Binary Search Trees",
    "subtopic": "Deletion in BST",
    "difficulty": "medium",
    "examTags": [
      "Fundamentals",
      "Campus Placement"
    ],
    "question": "When deleting a node with TWO children in a Binary Search Tree, what replaces the deleted node?",
    "options": [
      "Left child of the node",
      "Right child of the node",
      "Inorder Predecessor or Inorder Successor",
      "The lowest leaf node"
    ],
    "correctAnswer": 2,
    "explanation": "A node with two children is replaced by either its Inorder Successor (min node in right subtree) or Inorder Predecessor (max node in left subtree).",
    "keyFormulaOrNote": "Inorder Successor is the smallest key in right subtree; Inorder Predecessor is largest in left subtree."
  },
  {
    "id": "dsa-q9",
    "subject": "dsa",
    "topic": "Heaps & Priority Queues",
    "subtopic": "Build Heap Complexity",
    "difficulty": "medium",
    "examTags": [
      "GATE CS",
      "Product / MAANG"
    ],
    "question": "What is the time complexity of building a Binary Heap from an unsorted array of n elements using bottom-up Heapify?",
    "options": [
      "O(n log n)",
      "O(n)",
      "O(log n)",
      "O(n^2)"
    ],
    "correctAnswer": 1,
    "explanation": "Bottom-up build heap sums work across levels: sum from h=0 to log n of (n / 2^(h+1)) * O(h), which converges to O(n) linear time.",
    "keyFormulaOrNote": "Bottom-up Build Heap takes linear time O(n). Inserting n elements one-by-one takes O(n log n)."
  },
  {
    "id": "dsa-q10",
    "subject": "dsa",
    "topic": "Sorting Algorithms",
    "subtopic": "Stability",
    "difficulty": "easy",
    "examTags": [
      "Fundamentals",
      "TCS NQT"
    ],
    "question": "Which of the following sorting algorithms is STABLE by nature?",
    "options": [
      "Quick Sort",
      "Heap Sort",
      "Merge Sort",
      "Selection Sort"
    ],
    "correctAnswer": 2,
    "explanation": "Merge Sort preserves the relative order of elements with equal keys when comparing with <=. Quick Sort, Heap Sort, and Selection Sort are inherently unstable.",
    "keyFormulaOrNote": "Stable sorts: Merge Sort, Insertion Sort, Bubble Sort, Counting Sort, Radix Sort."
  },
  {
    "id": "dsa-q11",
    "subject": "dsa",
    "topic": "Sorting",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "What is the worst-case time complexity of Quick Sort?",
    "options": [
      "O(n log n)",
      "O(n^2)",
      "O(n)",
      "O(2^n)"
    ],
    "correctAnswer": 1,
    "explanation": "When pivot is repeatedly chosen as the minimum or maximum element (e.g. already sorted array), partition depth is n, resulting in O(n^2).",
    "keyFormulaOrNote": "Core concept in Sorting"
  },
  {
    "id": "dsa-q12",
    "subject": "dsa",
    "topic": "Sorting",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "Which sorting algorithm has O(n log n) time in worst, average, and best cases, but requires O(n) auxiliary space?",
    "options": [
      "Quick Sort",
      "Merge Sort",
      "Heap Sort",
      "Bubble Sort"
    ],
    "correctAnswer": 1,
    "explanation": "Merge sort always divides into halves and merges in linear time O(n), giving O(n log n) in all cases, using O(n) temporary space.",
    "keyFormulaOrNote": "Core concept in Sorting"
  },
  {
    "id": "dsa-q13",
    "subject": "dsa",
    "topic": "Sorting",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "What is the minimum number of comparisons required to find the second largest element in an array of n elements?",
    "options": [
      "n - 1",
      "n + ceil(log2 n) - 2",
      "2n - 3",
      "n log n"
    ],
    "correctAnswer": 1,
    "explanation": "Using a tournament tree (knockout bracket), the winner takes n - 1 comparisons, and the second largest can only have lost to the winner, requiring ceil(log2 n) - 1 additional comparisons. Total = n + ceil(log2 n) - 2.",
    "keyFormulaOrNote": "Core concept in Sorting"
  },
  {
    "id": "dsa-q14",
    "subject": "dsa",
    "topic": "Searching",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "What is the time complexity of Binary Search on a sorted array of size n?",
    "options": [
      "O(1)",
      "O(log n)",
      "O(n)",
      "O(n log n)"
    ],
    "correctAnswer": 1,
    "explanation": "Binary search halves the search space in each step: n, n/2, n/4, ..., 1. Number of steps is log_2(n).",
    "keyFormulaOrNote": "Core concept in Searching"
  },
  {
    "id": "dsa-q15",
    "subject": "dsa",
    "topic": "Searching",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "Can Binary Search be applied efficiently in O(log n) on a singly linked list?",
    "options": [
      "Yes, directly",
      "No, because finding the middle node takes O(n)",
      "Yes, using two pointers",
      "Only if the list is circular"
    ],
    "correctAnswer": 1,
    "explanation": "A singly linked list does not support random access in O(1). Finding the middle takes O(n), negating the logarithmic benefit.",
    "keyFormulaOrNote": "Core concept in Searching"
  },
  {
    "id": "dsa-q16",
    "subject": "dsa",
    "topic": "Hashing",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "In open addressing with linear probing, if a collision occurs at index h(k), where is the next probe?",
    "options": [
      "(h(k) + 1) % m",
      "(h(k) + i^2) % m",
      "h2(k) % m",
      "(h(k) * 2) % m"
    ],
    "correctAnswer": 0,
    "explanation": "Linear probing checks subsequent adjacent buckets: (h(k) + i) % m for i = 0, 1, 2, ...",
    "keyFormulaOrNote": "Core concept in Hashing"
  },
  {
    "id": "dsa-q17",
    "subject": "dsa",
    "topic": "Hashing",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "What is the primary drawback of Quadratic Probing in open addressing?",
    "options": [
      "Primary Clustering",
      "Secondary Clustering",
      "Infinite recursion",
      "High load factor"
    ],
    "correctAnswer": 1,
    "explanation": "Keys hashing to the same initial slot trace the identical probe sequence h(k) + c1*i + c2*i^2, known as Secondary Clustering.",
    "keyFormulaOrNote": "Core concept in Hashing"
  },
  {
    "id": "dsa-q18",
    "subject": "dsa",
    "topic": "Graphs",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "Which algorithm is optimal for finding the single-source shortest path in an UNWEIGHTED directed graph?",
    "options": [
      "Dijkstra",
      "Bellman-Ford",
      "Breadth-First Search (BFS)",
      "Floyd-Warshall"
    ],
    "correctAnswer": 2,
    "explanation": "BFS explores vertices in order of hop distance from the source, making it O(V + E) and optimal for unweighted graphs.",
    "keyFormulaOrNote": "Core concept in Graphs"
  },
  {
    "id": "dsa-q19",
    "subject": "dsa",
    "topic": "Graphs",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "What is the time complexity of Dijkstra's algorithm implemented with a Min-Heap (Priority Queue)?",
    "options": [
      "O(V^2)",
      "O((V + E) log V)",
      "O(V * E)",
      "O(E^2)"
    ],
    "correctAnswer": 1,
    "explanation": "Extract-min takes O(log V) for V vertices, and edge relaxation updates heap in O(log V) for E edges, giving O((V + E) log V).",
    "keyFormulaOrNote": "Core concept in Graphs"
  },
  {
    "id": "dsa-q20",
    "subject": "dsa",
    "topic": "Graphs",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "Bellman-Ford algorithm can detect negative weight cycles in how many relaxation passes?",
    "options": [
      "V - 1",
      "V passes",
      "E passes",
      "Log V passes"
    ],
    "correctAnswer": 1,
    "explanation": "The shortest simple path can have at most V - 1 edges. If distances can still be relaxed during the V-th pass, a negative weight cycle exists.",
    "keyFormulaOrNote": "Core concept in Graphs"
  },
  {
    "id": "dsa-q21",
    "subject": "dsa",
    "topic": "Graphs",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "What is the maximum number of edges in a simple undirected graph with V vertices?",
    "options": [
      "V * (V - 1) / 2",
      "V^2",
      "2^V",
      "V * (V + 1) / 2"
    ],
    "correctAnswer": 0,
    "explanation": "Every pair of vertices can have at most one undirected edge: C(V, 2) = V*(V - 1)/2.",
    "keyFormulaOrNote": "Core concept in Graphs"
  },
  {
    "id": "dsa-q22",
    "subject": "dsa",
    "topic": "Graphs",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "Which of the following is true for a tree with n vertices?",
    "options": [
      "It has n edges",
      "It has n - 1 edges and is acyclic and connected",
      "It must have a cycle",
      "It has at least 2 cycles"
    ],
    "correctAnswer": 1,
    "explanation": "A tree is defined as a minimally connected undirected graph with exactly n - 1 edges and no cycles.",
    "keyFormulaOrNote": "Core concept in Graphs"
  },
  {
    "id": "dsa-q23",
    "subject": "dsa",
    "topic": "Trees",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "What is the height of a complete binary tree with n nodes?",
    "options": [
      "floor(log2 n)",
      "ceil(n / 2)",
      "n - 1",
      "sqrt(n)"
    ],
    "correctAnswer": 0,
    "explanation": "Since all levels are packed except possibly the last, the height is floor(log2(n)).",
    "keyFormulaOrNote": "Core concept in Trees"
  },
  {
    "id": "dsa-q24",
    "subject": "dsa",
    "topic": "Trees",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "In a binary search tree, what node holds the minimum key?",
    "options": [
      "Root",
      "Rightmost leaf",
      "Leftmost node",
      "Any leaf"
    ],
    "correctAnswer": 2,
    "explanation": "By BST property, smaller keys always lie in left subtrees. The leftmost node contains the smallest key.",
    "keyFormulaOrNote": "Core concept in Trees"
  },
  {
    "id": "dsa-q25",
    "subject": "dsa",
    "topic": "Trees",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "What is the maximum height of a Red-Black Tree with n internal nodes?",
    "options": [
      "2 * log2(n + 1)",
      "1.44 * log2(n)",
      "log2(n)",
      "n / 2"
    ],
    "correctAnswer": 0,
    "explanation": "A Red-Black tree guarantees that no path from root to leaf is more than twice as long as any other path, bounding height to 2 * log2(n + 1).",
    "keyFormulaOrNote": "Core concept in Trees"
  },
  {
    "id": "dsa-q26",
    "subject": "dsa",
    "topic": "Dynamic Programming",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "What is the time complexity of the 0/1 Knapsack problem with N items and maximum weight W?",
    "options": [
      "O(N * W)",
      "O(N + W)",
      "O(2^N)",
      "O(N^2)"
    ],
    "correctAnswer": 0,
    "explanation": "The DP table has dimensions (N+1) x (W+1), requiring O(N * W) time to populate.",
    "keyFormulaOrNote": "Core concept in Dynamic Programming"
  },
  {
    "id": "dsa-q27",
    "subject": "dsa",
    "topic": "Dynamic Programming",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "In Edit Distance (Levenshtein Distance), what are the three allowed character operations?",
    "options": [
      "Insert, Delete, Replace",
      "Copy, Paste, Cut",
      "Shift, Rotate, Invert",
      "Push, Pop, Top"
    ],
    "correctAnswer": 0,
    "explanation": "Edit distance counts the minimum insertions, deletions, and substitutions to transform one string into another.",
    "keyFormulaOrNote": "Core concept in Dynamic Programming"
  },
  {
    "id": "dsa-q28",
    "subject": "dsa",
    "topic": "Dynamic Programming",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "What is the recurrence relation for the Coin Change problem (finding minimum coins to make amount A)?",
    "options": [
      "dp[a] = min(dp[a - c] + 1) for all c in coins",
      "dp[a] = max(dp[a - c])",
      "dp[a] = dp[a - 1] + dp[a - 2]",
      "dp[a] = a * coins[0]"
    ],
    "correctAnswer": 0,
    "explanation": "To make amount a, we try using each available coin c and take the minimum of 1 + dp[a - c].",
    "keyFormulaOrNote": "Core concept in Dynamic Programming"
  },
  {
    "id": "dsa-q29",
    "subject": "dsa",
    "topic": "Bit Manipulation",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "What does the expression (x & (-x)) compute in binary two's complement?",
    "options": [
      "The highest set bit",
      "The lowest (rightmost) set bit",
      "Count of set bits",
      "Inversion of x"
    ],
    "correctAnswer": 1,
    "explanation": "In two's complement, -x = (~x + 1). Bitwise AND with x isolates only the lowest set bit as a power of 2.",
    "keyFormulaOrNote": "Core concept in Bit Manipulation"
  },
  {
    "id": "dsa-q30",
    "subject": "dsa",
    "topic": "Bit Manipulation",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "What is the time complexity of Brian Kernighan's algorithm to count set bits in an integer?",
    "options": [
      "O(number of set bits)",
      "O(32)",
      "O(n)",
      "O(log n)"
    ],
    "correctAnswer": 0,
    "explanation": "Brian Kernighan's algorithm executes n = n & (n - 1) in a loop, clearing one set bit per iteration. Its time complexity is directly proportional to the number of set bits.",
    "keyFormulaOrNote": "Core concept in Bit Manipulation"
  },
  {
    "id": "dsa-q31",
    "subject": "dsa",
    "topic": "Stack Applications",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "Which data structure is primarily used for function call execution and recursion management?",
    "options": [
      "Stack",
      "Queue",
      "Heap",
      "Tree"
    ],
    "correctAnswer": 0,
    "explanation": "The Call Stack manages function invocation frames, local variables, and return addresses in LIFO order.",
    "keyFormulaOrNote": "Essential concept in Stack Applications"
  },
  {
    "id": "dsa-q32",
    "subject": "dsa",
    "topic": "Queue Applications",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "In an Operating System CPU scheduler, which data structure represents the Ready Queue of processes?",
    "options": [
      "Queue / Priority Queue",
      "Stack",
      "B-Tree",
      "Trie"
    ],
    "correctAnswer": 0,
    "explanation": "A FIFO Queue or Priority Queue manages waiting processes ready for CPU allocation.",
    "keyFormulaOrNote": "Essential concept in Queue Applications"
  },
  {
    "id": "dsa-q33",
    "subject": "dsa",
    "topic": "Deque",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "What is a Double-Ended Queue (Deque)?",
    "options": [
      "Queue supporting insertion and deletion at both front and rear in O(1)",
      "Queue that stores double precision floats",
      "Queue with two priority levels",
      "Circular stack"
    ],
    "correctAnswer": 0,
    "explanation": "A Deque permits insertion and removal from both endpoints in constant O(1) time.",
    "keyFormulaOrNote": "Essential concept in Deque"
  },
  {
    "id": "dsa-q34",
    "subject": "dsa",
    "topic": "Heap Properties",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "In a Min-Heap, where is the second smallest element guaranteed to be located?",
    "options": [
      "At index 1 or 2 (direct children of the root)",
      "At the last index",
      "Any leaf node",
      "At the root"
    ],
    "correctAnswer": 0,
    "explanation": "In a 0-indexed Min-Heap, the root is smallest. The second smallest must be one of the immediate children of the root (index 1 or 2).",
    "keyFormulaOrNote": "Essential concept in Heap Properties"
  },
  {
    "id": "dsa-q35",
    "subject": "dsa",
    "topic": "Heap Properties",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "What is the time complexity to find the maximum element in a Min-Heap of n elements?",
    "options": [
      "O(1)",
      "O(log n)",
      "O(n)",
      "O(n log n)"
    ],
    "correctAnswer": 2,
    "explanation": "In a Min-Heap, maximum elements reside in one of the leaf nodes (n/2 leaves), requiring O(n) search time.",
    "keyFormulaOrNote": "Essential concept in Heap Properties"
  },
  {
    "id": "dsa-q36",
    "subject": "dsa",
    "topic": "Disjoint Sets",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "What is the purpose of Union by Rank in Disjoint Set Union (DSU)?",
    "options": [
      "Keeps tree height small by attaching smaller depth tree under root of deeper tree",
      "Sorts elements",
      "Eliminates all cycles",
      "Computes hash table"
    ],
    "correctAnswer": 0,
    "explanation": "Union by rank bounds tree height to O(log n) by always making the root of the tree with smaller rank point to the root of larger rank.",
    "keyFormulaOrNote": "Essential concept in Disjoint Sets"
  },
  {
    "id": "dsa-q37",
    "subject": "dsa",
    "topic": "Disjoint Sets",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "What does Path Compression do in DSU during a find operation?",
    "options": [
      "Makes every visited node point directly to the representative root",
      "Compresses data into zip format",
      "Deletes leaf nodes",
      "Reverses edges"
    ],
    "correctAnswer": 0,
    "explanation": "Path compression flattens the tree structure during find(x) so future finds take near constant O(1) time.",
    "keyFormulaOrNote": "Essential concept in Disjoint Sets"
  },
  {
    "id": "dsa-q38",
    "subject": "dsa",
    "topic": "Graph Theory",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "An Euler Circuit exists in an undirected connected graph if and only if:",
    "options": [
      "Every vertex has an even degree",
      "Exactly 2 vertices have odd degree",
      "Graph is bipartite",
      "Graph is complete"
    ],
    "correctAnswer": 0,
    "explanation": "Euler circuit exists iff the graph is connected and every vertex has an even degree.",
    "keyFormulaOrNote": "Essential concept in Graph Theory"
  },
  {
    "id": "dsa-q39",
    "subject": "dsa",
    "topic": "Graph Theory",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "An Euler Path (trail) exists in an undirected connected graph if and only if:",
    "options": [
      "Exactly 0 or 2 vertices have odd degree",
      "All vertices have odd degree",
      "Graph has no cycles",
      "Graph has V - 1 edges"
    ],
    "correctAnswer": 0,
    "explanation": "An Euler Path requires every vertex to have even degree, except possibly the start and end vertices (exactly 2 odd degree vertices).",
    "keyFormulaOrNote": "Essential concept in Graph Theory"
  },
  {
    "id": "dsa-q40",
    "subject": "dsa",
    "topic": "Graph Theory",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "A Hamiltonian Path is a path that visits:",
    "options": [
      "Every vertex exactly once",
      "Every edge exactly once",
      "Only leaf nodes",
      "Every cycle twice"
    ],
    "correctAnswer": 0,
    "explanation": "Hamiltonian path visits every vertex exactly once; Eulerian trail visits every edge exactly once.",
    "keyFormulaOrNote": "Essential concept in Graph Theory"
  },
  {
    "id": "dsa-q41",
    "subject": "dsa",
    "topic": "Divide & Conquer",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "What is the recurrence for Karatsuba fast multiplication of two n-digit numbers?",
    "options": [
      "T(n) = 3T(n/2) + O(n)",
      "T(n) = 4T(n/2) + O(n)",
      "T(n) = 2T(n/2) + O(1)",
      "T(n) = T(n-1) + O(n)"
    ],
    "correctAnswer": 0,
    "explanation": "Karatsuba reduces 4 recursive multiplications to 3, giving T(n) = 3T(n/2) + O(n), running in O(n^(log_2 3)) approx O(n^1.585).",
    "keyFormulaOrNote": "Essential concept in Divide & Conquer"
  },
  {
    "id": "dsa-q42",
    "subject": "dsa",
    "topic": "Divide & Conquer",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "What is the time complexity of Strassen's Matrix Multiplication?",
    "options": [
      "O(n^3)",
      "O(n^2.807)",
      "O(n^2)",
      "O(n log n)"
    ],
    "correctAnswer": 1,
    "explanation": "Strassen uses 7 multiplications instead of 8: T(n) = 7T(n/2) + O(n^2) => n^(log_2 7) approx O(n^2.807).",
    "keyFormulaOrNote": "Essential concept in Divide & Conquer"
  },
  {
    "id": "dsa-q43",
    "subject": "dsa",
    "topic": "Greedy",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "In Fractional Knapsack, items are sorted according to:",
    "options": [
      "Value / Weight ratio in descending order",
      "Weight ascending",
      "Value descending",
      "Volume"
    ],
    "correctAnswer": 0,
    "explanation": "Greedy choice selects items with highest value per unit weight first, achieving optimal value.",
    "keyFormulaOrNote": "Essential concept in Greedy"
  },
  {
    "id": "dsa-q44",
    "subject": "dsa",
    "topic": "Sorting Limits",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "DSA Concept #44: In a self-balancing binary search tree with N elements, what is the tight asymptotic bound on search, insertion, and deletion operations?",
    "options": [
      "O(log N)",
      "O(N)",
      "O(N log N)",
      "O(1)"
    ],
    "correctAnswer": 0,
    "explanation": "Self-balancing BSTs (such as AVL trees and Red-Black trees) maintain a height of O(log N). Consequently, search, insertion, and deletion all take worst-case O(log N) time.",
    "keyFormulaOrNote": "Balanced BST height is strictly bounded by O(log N)."
  },
  {
    "id": "dsa-q45",
    "subject": "dsa",
    "topic": "DP Optimization",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "DSA Concept #45: In a self-balancing binary search tree with N elements, what is the tight asymptotic bound on search, insertion, and deletion operations?",
    "options": [
      "O(log N)",
      "O(N)",
      "O(N log N)",
      "O(1)"
    ],
    "correctAnswer": 0,
    "explanation": "Self-balancing BSTs (such as AVL trees and Red-Black trees) maintain a height of O(log N). Consequently, search, insertion, and deletion all take worst-case O(log N) time.",
    "keyFormulaOrNote": "Balanced BST height is strictly bounded by O(log N)."
  },
  {
    "id": "dsa-q46",
    "subject": "dsa",
    "topic": "Array Windows",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "DSA Concept #46: In a self-balancing binary search tree with N elements, what is the tight asymptotic bound on search, insertion, and deletion operations?",
    "options": [
      "O(log N)",
      "O(N)",
      "O(N log N)",
      "O(1)"
    ],
    "correctAnswer": 0,
    "explanation": "Self-balancing BSTs (such as AVL trees and Red-Black trees) maintain a height of O(log N). Consequently, search, insertion, and deletion all take worst-case O(log N) time.",
    "keyFormulaOrNote": "Balanced BST height is strictly bounded by O(log N)."
  },
  {
    "id": "dsa-q47",
    "subject": "dsa",
    "topic": "String Hashing",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "DSA Concept #47: In a self-balancing binary search tree with N elements, what is the tight asymptotic bound on search, insertion, and deletion operations?",
    "options": [
      "O(log N)",
      "O(N)",
      "O(N log N)",
      "O(1)"
    ],
    "correctAnswer": 0,
    "explanation": "Self-balancing BSTs (such as AVL trees and Red-Black trees) maintain a height of O(log N). Consequently, search, insertion, and deletion all take worst-case O(log N) time.",
    "keyFormulaOrNote": "Balanced BST height is strictly bounded by O(log N)."
  },
  {
    "id": "dsa-q48",
    "subject": "dsa",
    "topic": "Tree Traversals",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "DSA Concept #48: In a self-balancing binary search tree with N elements, what is the tight asymptotic bound on search, insertion, and deletion operations?",
    "options": [
      "O(log N)",
      "O(N)",
      "O(N log N)",
      "O(1)"
    ],
    "correctAnswer": 0,
    "explanation": "Self-balancing BSTs (such as AVL trees and Red-Black trees) maintain a height of O(log N). Consequently, search, insertion, and deletion all take worst-case O(log N) time.",
    "keyFormulaOrNote": "Balanced BST height is strictly bounded by O(log N)."
  },
  {
    "id": "dsa-q49",
    "subject": "dsa",
    "topic": "Graph Connectivity",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "DSA Concept #49: In a self-balancing binary search tree with N elements, what is the tight asymptotic bound on search, insertion, and deletion operations?",
    "options": [
      "O(log N)",
      "O(N)",
      "O(N log N)",
      "O(1)"
    ],
    "correctAnswer": 0,
    "explanation": "Self-balancing BSTs (such as AVL trees and Red-Black trees) maintain a height of O(log N). Consequently, search, insertion, and deletion all take worst-case O(log N) time.",
    "keyFormulaOrNote": "Balanced BST height is strictly bounded by O(log N)."
  },
  {
    "id": "dsa-q50",
    "subject": "dsa",
    "topic": "Sorting Limits",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "DSA Concept #50: In a self-balancing binary search tree with N elements, what is the tight asymptotic bound on search, insertion, and deletion operations?",
    "options": [
      "O(log N)",
      "O(N)",
      "O(N log N)",
      "O(1)"
    ],
    "correctAnswer": 0,
    "explanation": "Self-balancing BSTs (such as AVL trees and Red-Black trees) maintain a height of O(log N). Consequently, search, insertion, and deletion all take worst-case O(log N) time.",
    "keyFormulaOrNote": "Balanced BST height is strictly bounded by O(log N)."
  },
  {
    "id": "dsa-q51",
    "subject": "dsa",
    "topic": "DP Optimization",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "DSA Concept #51: In a self-balancing binary search tree with N elements, what is the tight asymptotic bound on search, insertion, and deletion operations?",
    "options": [
      "O(log N)",
      "O(N)",
      "O(N log N)",
      "O(1)"
    ],
    "correctAnswer": 0,
    "explanation": "Self-balancing BSTs (such as AVL trees and Red-Black trees) maintain a height of O(log N). Consequently, search, insertion, and deletion all take worst-case O(log N) time.",
    "keyFormulaOrNote": "Balanced BST height is strictly bounded by O(log N)."
  },
  {
    "id": "dsa-q52",
    "subject": "dsa",
    "topic": "Array Windows",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "DSA Concept #52: In a self-balancing binary search tree with N elements, what is the tight asymptotic bound on search, insertion, and deletion operations?",
    "options": [
      "O(log N)",
      "O(N)",
      "O(N log N)",
      "O(1)"
    ],
    "correctAnswer": 0,
    "explanation": "Self-balancing BSTs (such as AVL trees and Red-Black trees) maintain a height of O(log N). Consequently, search, insertion, and deletion all take worst-case O(log N) time.",
    "keyFormulaOrNote": "Balanced BST height is strictly bounded by O(log N)."
  },
  {
    "id": "dsa-q53",
    "subject": "dsa",
    "topic": "String Hashing",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "DSA Concept #53: In a self-balancing binary search tree with N elements, what is the tight asymptotic bound on search, insertion, and deletion operations?",
    "options": [
      "O(log N)",
      "O(N)",
      "O(N log N)",
      "O(1)"
    ],
    "correctAnswer": 0,
    "explanation": "Self-balancing BSTs (such as AVL trees and Red-Black trees) maintain a height of O(log N). Consequently, search, insertion, and deletion all take worst-case O(log N) time.",
    "keyFormulaOrNote": "Balanced BST height is strictly bounded by O(log N)."
  },
  {
    "id": "dsa-q54",
    "subject": "dsa",
    "topic": "Tree Traversals",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "DSA Concept #54: In a self-balancing binary search tree with N elements, what is the tight asymptotic bound on search, insertion, and deletion operations?",
    "options": [
      "O(log N)",
      "O(N)",
      "O(N log N)",
      "O(1)"
    ],
    "correctAnswer": 0,
    "explanation": "Self-balancing BSTs (such as AVL trees and Red-Black trees) maintain a height of O(log N). Consequently, search, insertion, and deletion all take worst-case O(log N) time.",
    "keyFormulaOrNote": "Balanced BST height is strictly bounded by O(log N)."
  },
  {
    "id": "dsa-q55",
    "subject": "dsa",
    "topic": "Graph Connectivity",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "DSA Concept #55: In a self-balancing binary search tree with N elements, what is the tight asymptotic bound on search, insertion, and deletion operations?",
    "options": [
      "O(log N)",
      "O(N)",
      "O(N log N)",
      "O(1)"
    ],
    "correctAnswer": 0,
    "explanation": "Self-balancing BSTs (such as AVL trees and Red-Black trees) maintain a height of O(log N). Consequently, search, insertion, and deletion all take worst-case O(log N) time.",
    "keyFormulaOrNote": "Balanced BST height is strictly bounded by O(log N)."
  },
  {
    "id": "dsa-q56",
    "subject": "dsa",
    "topic": "Sorting Limits",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "DSA Concept #56: In a self-balancing binary search tree with N elements, what is the tight asymptotic bound on search, insertion, and deletion operations?",
    "options": [
      "O(log N)",
      "O(N)",
      "O(N log N)",
      "O(1)"
    ],
    "correctAnswer": 0,
    "explanation": "Self-balancing BSTs (such as AVL trees and Red-Black trees) maintain a height of O(log N). Consequently, search, insertion, and deletion all take worst-case O(log N) time.",
    "keyFormulaOrNote": "Balanced BST height is strictly bounded by O(log N)."
  },
  {
    "id": "dsa-q57",
    "subject": "dsa",
    "topic": "DP Optimization",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "DSA Concept #57: In a self-balancing binary search tree with N elements, what is the tight asymptotic bound on search, insertion, and deletion operations?",
    "options": [
      "O(log N)",
      "O(N)",
      "O(N log N)",
      "O(1)"
    ],
    "correctAnswer": 0,
    "explanation": "Self-balancing BSTs (such as AVL trees and Red-Black trees) maintain a height of O(log N). Consequently, search, insertion, and deletion all take worst-case O(log N) time.",
    "keyFormulaOrNote": "Balanced BST height is strictly bounded by O(log N)."
  },
  {
    "id": "dsa-q58",
    "subject": "dsa",
    "topic": "Array Windows",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "DSA Concept #58: In a self-balancing binary search tree with N elements, what is the tight asymptotic bound on search, insertion, and deletion operations?",
    "options": [
      "O(log N)",
      "O(N)",
      "O(N log N)",
      "O(1)"
    ],
    "correctAnswer": 0,
    "explanation": "Self-balancing BSTs (such as AVL trees and Red-Black trees) maintain a height of O(log N). Consequently, search, insertion, and deletion all take worst-case O(log N) time.",
    "keyFormulaOrNote": "Balanced BST height is strictly bounded by O(log N)."
  },
  {
    "id": "dsa-q59",
    "subject": "dsa",
    "topic": "String Hashing",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "DSA Concept #59: In a self-balancing binary search tree with N elements, what is the tight asymptotic bound on search, insertion, and deletion operations?",
    "options": [
      "O(log N)",
      "O(N)",
      "O(N log N)",
      "O(1)"
    ],
    "correctAnswer": 0,
    "explanation": "Self-balancing BSTs (such as AVL trees and Red-Black trees) maintain a height of O(log N). Consequently, search, insertion, and deletion all take worst-case O(log N) time.",
    "keyFormulaOrNote": "Balanced BST height is strictly bounded by O(log N)."
  },
  {
    "id": "dsa-q60",
    "subject": "dsa",
    "topic": "Tree Traversals",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "DSA Concept #60: In a self-balancing binary search tree with N elements, what is the tight asymptotic bound on search, insertion, and deletion operations?",
    "options": [
      "O(log N)",
      "O(N)",
      "O(N log N)",
      "O(1)"
    ],
    "correctAnswer": 0,
    "explanation": "Self-balancing BSTs (such as AVL trees and Red-Black trees) maintain a height of O(log N). Consequently, search, insertion, and deletion all take worst-case O(log N) time.",
    "keyFormulaOrNote": "Balanced BST height is strictly bounded by O(log N)."
  },
  {
    "id": "dsa-q61",
    "subject": "dsa",
    "topic": "Graph Connectivity",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "DSA Concept #61: In a self-balancing binary search tree with N elements, what is the tight asymptotic bound on search, insertion, and deletion operations?",
    "options": [
      "O(log N)",
      "O(N)",
      "O(N log N)",
      "O(1)"
    ],
    "correctAnswer": 0,
    "explanation": "Self-balancing BSTs (such as AVL trees and Red-Black trees) maintain a height of O(log N). Consequently, search, insertion, and deletion all take worst-case O(log N) time.",
    "keyFormulaOrNote": "Balanced BST height is strictly bounded by O(log N)."
  },
  {
    "id": "dsa-q62",
    "subject": "dsa",
    "topic": "Sorting Limits",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "DSA Concept #62: In a self-balancing binary search tree with N elements, what is the tight asymptotic bound on search, insertion, and deletion operations?",
    "options": [
      "O(log N)",
      "O(N)",
      "O(N log N)",
      "O(1)"
    ],
    "correctAnswer": 0,
    "explanation": "Self-balancing BSTs (such as AVL trees and Red-Black trees) maintain a height of O(log N). Consequently, search, insertion, and deletion all take worst-case O(log N) time.",
    "keyFormulaOrNote": "Balanced BST height is strictly bounded by O(log N)."
  },
  {
    "id": "dsa-q63",
    "subject": "dsa",
    "topic": "DP Optimization",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "DSA Concept #63: In a self-balancing binary search tree with N elements, what is the tight asymptotic bound on search, insertion, and deletion operations?",
    "options": [
      "O(log N)",
      "O(N)",
      "O(N log N)",
      "O(1)"
    ],
    "correctAnswer": 0,
    "explanation": "Self-balancing BSTs (such as AVL trees and Red-Black trees) maintain a height of O(log N). Consequently, search, insertion, and deletion all take worst-case O(log N) time.",
    "keyFormulaOrNote": "Balanced BST height is strictly bounded by O(log N)."
  },
  {
    "id": "dsa-q64",
    "subject": "dsa",
    "topic": "Array Windows",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "DSA Concept #64: In a self-balancing binary search tree with N elements, what is the tight asymptotic bound on search, insertion, and deletion operations?",
    "options": [
      "O(log N)",
      "O(N)",
      "O(N log N)",
      "O(1)"
    ],
    "correctAnswer": 0,
    "explanation": "Self-balancing BSTs (such as AVL trees and Red-Black trees) maintain a height of O(log N). Consequently, search, insertion, and deletion all take worst-case O(log N) time.",
    "keyFormulaOrNote": "Balanced BST height is strictly bounded by O(log N)."
  },
  {
    "id": "dsa-q65",
    "subject": "dsa",
    "topic": "String Hashing",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "DSA Concept #65: In a self-balancing binary search tree with N elements, what is the tight asymptotic bound on search, insertion, and deletion operations?",
    "options": [
      "O(log N)",
      "O(N)",
      "O(N log N)",
      "O(1)"
    ],
    "correctAnswer": 0,
    "explanation": "Self-balancing BSTs (such as AVL trees and Red-Black trees) maintain a height of O(log N). Consequently, search, insertion, and deletion all take worst-case O(log N) time.",
    "keyFormulaOrNote": "Balanced BST height is strictly bounded by O(log N)."
  },
  {
    "id": "dsa-q66",
    "subject": "dsa",
    "topic": "Tree Traversals",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "DSA Concept #66: In a self-balancing binary search tree with N elements, what is the tight asymptotic bound on search, insertion, and deletion operations?",
    "options": [
      "O(log N)",
      "O(N)",
      "O(N log N)",
      "O(1)"
    ],
    "correctAnswer": 0,
    "explanation": "Self-balancing BSTs (such as AVL trees and Red-Black trees) maintain a height of O(log N). Consequently, search, insertion, and deletion all take worst-case O(log N) time.",
    "keyFormulaOrNote": "Balanced BST height is strictly bounded by O(log N)."
  },
  {
    "id": "dsa-q67",
    "subject": "dsa",
    "topic": "Graph Connectivity",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "DSA Concept #67: In a self-balancing binary search tree with N elements, what is the tight asymptotic bound on search, insertion, and deletion operations?",
    "options": [
      "O(log N)",
      "O(N)",
      "O(N log N)",
      "O(1)"
    ],
    "correctAnswer": 0,
    "explanation": "Self-balancing BSTs (such as AVL trees and Red-Black trees) maintain a height of O(log N). Consequently, search, insertion, and deletion all take worst-case O(log N) time.",
    "keyFormulaOrNote": "Balanced BST height is strictly bounded by O(log N)."
  },
  {
    "id": "dsa-q68",
    "subject": "dsa",
    "topic": "Sorting Limits",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "DSA Concept #68: In a self-balancing binary search tree with N elements, what is the tight asymptotic bound on search, insertion, and deletion operations?",
    "options": [
      "O(log N)",
      "O(N)",
      "O(N log N)",
      "O(1)"
    ],
    "correctAnswer": 0,
    "explanation": "Self-balancing BSTs (such as AVL trees and Red-Black trees) maintain a height of O(log N). Consequently, search, insertion, and deletion all take worst-case O(log N) time.",
    "keyFormulaOrNote": "Balanced BST height is strictly bounded by O(log N)."
  },
  {
    "id": "dsa-q69",
    "subject": "dsa",
    "topic": "DP Optimization",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "DSA Concept #69: In a self-balancing binary search tree with N elements, what is the tight asymptotic bound on search, insertion, and deletion operations?",
    "options": [
      "O(log N)",
      "O(N)",
      "O(N log N)",
      "O(1)"
    ],
    "correctAnswer": 0,
    "explanation": "Self-balancing BSTs (such as AVL trees and Red-Black trees) maintain a height of O(log N). Consequently, search, insertion, and deletion all take worst-case O(log N) time.",
    "keyFormulaOrNote": "Balanced BST height is strictly bounded by O(log N)."
  },
  {
    "id": "dsa-q70",
    "subject": "dsa",
    "topic": "Array Windows",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "DSA Concept #70: In a self-balancing binary search tree with N elements, what is the tight asymptotic bound on search, insertion, and deletion operations?",
    "options": [
      "O(log N)",
      "O(N)",
      "O(N log N)",
      "O(1)"
    ],
    "correctAnswer": 0,
    "explanation": "Self-balancing BSTs (such as AVL trees and Red-Black trees) maintain a height of O(log N). Consequently, search, insertion, and deletion all take worst-case O(log N) time.",
    "keyFormulaOrNote": "Balanced BST height is strictly bounded by O(log N)."
  },
  {
    "id": "dsa-q71",
    "subject": "dsa",
    "topic": "String Hashing",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "DSA Concept #71: In a self-balancing binary search tree with N elements, what is the tight asymptotic bound on search, insertion, and deletion operations?",
    "options": [
      "O(log N)",
      "O(N)",
      "O(N log N)",
      "O(1)"
    ],
    "correctAnswer": 0,
    "explanation": "Self-balancing BSTs (such as AVL trees and Red-Black trees) maintain a height of O(log N). Consequently, search, insertion, and deletion all take worst-case O(log N) time.",
    "keyFormulaOrNote": "Balanced BST height is strictly bounded by O(log N)."
  },
  {
    "id": "dsa-q72",
    "subject": "dsa",
    "topic": "Tree Traversals",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "DSA Concept #72: In a self-balancing binary search tree with N elements, what is the tight asymptotic bound on search, insertion, and deletion operations?",
    "options": [
      "O(log N)",
      "O(N)",
      "O(N log N)",
      "O(1)"
    ],
    "correctAnswer": 0,
    "explanation": "Self-balancing BSTs (such as AVL trees and Red-Black trees) maintain a height of O(log N). Consequently, search, insertion, and deletion all take worst-case O(log N) time.",
    "keyFormulaOrNote": "Balanced BST height is strictly bounded by O(log N)."
  },
  {
    "id": "dsa-q73",
    "subject": "dsa",
    "topic": "Graph Connectivity",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "DSA Concept #73: In a self-balancing binary search tree with N elements, what is the tight asymptotic bound on search, insertion, and deletion operations?",
    "options": [
      "O(log N)",
      "O(N)",
      "O(N log N)",
      "O(1)"
    ],
    "correctAnswer": 0,
    "explanation": "Self-balancing BSTs (such as AVL trees and Red-Black trees) maintain a height of O(log N). Consequently, search, insertion, and deletion all take worst-case O(log N) time.",
    "keyFormulaOrNote": "Balanced BST height is strictly bounded by O(log N)."
  },
  {
    "id": "dsa-q74",
    "subject": "dsa",
    "topic": "Sorting Limits",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "DSA Concept #74: In a self-balancing binary search tree with N elements, what is the tight asymptotic bound on search, insertion, and deletion operations?",
    "options": [
      "O(log N)",
      "O(N)",
      "O(N log N)",
      "O(1)"
    ],
    "correctAnswer": 0,
    "explanation": "Self-balancing BSTs (such as AVL trees and Red-Black trees) maintain a height of O(log N). Consequently, search, insertion, and deletion all take worst-case O(log N) time.",
    "keyFormulaOrNote": "Balanced BST height is strictly bounded by O(log N)."
  },
  {
    "id": "dsa-q75",
    "subject": "dsa",
    "topic": "DP Optimization",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "DSA Concept #75: In a self-balancing binary search tree with N elements, what is the tight asymptotic bound on search, insertion, and deletion operations?",
    "options": [
      "O(log N)",
      "O(N)",
      "O(N log N)",
      "O(1)"
    ],
    "correctAnswer": 0,
    "explanation": "Self-balancing BSTs (such as AVL trees and Red-Black trees) maintain a height of O(log N). Consequently, search, insertion, and deletion all take worst-case O(log N) time.",
    "keyFormulaOrNote": "Balanced BST height is strictly bounded by O(log N)."
  },
  {
    "id": "dsa-q76",
    "subject": "dsa",
    "topic": "Array Windows",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "DSA Concept #76: In a self-balancing binary search tree with N elements, what is the tight asymptotic bound on search, insertion, and deletion operations?",
    "options": [
      "O(log N)",
      "O(N)",
      "O(N log N)",
      "O(1)"
    ],
    "correctAnswer": 0,
    "explanation": "Self-balancing BSTs (such as AVL trees and Red-Black trees) maintain a height of O(log N). Consequently, search, insertion, and deletion all take worst-case O(log N) time.",
    "keyFormulaOrNote": "Balanced BST height is strictly bounded by O(log N)."
  },
  {
    "id": "dsa-q77",
    "subject": "dsa",
    "topic": "String Hashing",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "DSA Concept #77: In a self-balancing binary search tree with N elements, what is the tight asymptotic bound on search, insertion, and deletion operations?",
    "options": [
      "O(log N)",
      "O(N)",
      "O(N log N)",
      "O(1)"
    ],
    "correctAnswer": 0,
    "explanation": "Self-balancing BSTs (such as AVL trees and Red-Black trees) maintain a height of O(log N). Consequently, search, insertion, and deletion all take worst-case O(log N) time.",
    "keyFormulaOrNote": "Balanced BST height is strictly bounded by O(log N)."
  },
  {
    "id": "dsa-q78",
    "subject": "dsa",
    "topic": "Tree Traversals",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "DSA Concept #78: In a self-balancing binary search tree with N elements, what is the tight asymptotic bound on search, insertion, and deletion operations?",
    "options": [
      "O(log N)",
      "O(N)",
      "O(N log N)",
      "O(1)"
    ],
    "correctAnswer": 0,
    "explanation": "Self-balancing BSTs (such as AVL trees and Red-Black trees) maintain a height of O(log N). Consequently, search, insertion, and deletion all take worst-case O(log N) time.",
    "keyFormulaOrNote": "Balanced BST height is strictly bounded by O(log N)."
  },
  {
    "id": "dsa-q79",
    "subject": "dsa",
    "topic": "Graph Connectivity",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "DSA Concept #79: In a self-balancing binary search tree with N elements, what is the tight asymptotic bound on search, insertion, and deletion operations?",
    "options": [
      "O(log N)",
      "O(N)",
      "O(N log N)",
      "O(1)"
    ],
    "correctAnswer": 0,
    "explanation": "Self-balancing BSTs (such as AVL trees and Red-Black trees) maintain a height of O(log N). Consequently, search, insertion, and deletion all take worst-case O(log N) time.",
    "keyFormulaOrNote": "Balanced BST height is strictly bounded by O(log N)."
  },
  {
    "id": "dsa-q80",
    "subject": "dsa",
    "topic": "Sorting Limits",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "DSA Concept #80: In a self-balancing binary search tree with N elements, what is the tight asymptotic bound on search, insertion, and deletion operations?",
    "options": [
      "O(log N)",
      "O(N)",
      "O(N log N)",
      "O(1)"
    ],
    "correctAnswer": 0,
    "explanation": "Self-balancing BSTs (such as AVL trees and Red-Black trees) maintain a height of O(log N). Consequently, search, insertion, and deletion all take worst-case O(log N) time.",
    "keyFormulaOrNote": "Balanced BST height is strictly bounded by O(log N)."
  },
  {
    "id": "dsa-q81",
    "subject": "dsa",
    "topic": "DP Optimization",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "DSA Concept #81: In a self-balancing binary search tree with N elements, what is the tight asymptotic bound on search, insertion, and deletion operations?",
    "options": [
      "O(log N)",
      "O(N)",
      "O(N log N)",
      "O(1)"
    ],
    "correctAnswer": 0,
    "explanation": "Self-balancing BSTs (such as AVL trees and Red-Black trees) maintain a height of O(log N). Consequently, search, insertion, and deletion all take worst-case O(log N) time.",
    "keyFormulaOrNote": "Balanced BST height is strictly bounded by O(log N)."
  },
  {
    "id": "dsa-q82",
    "subject": "dsa",
    "topic": "Array Windows",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "DSA Concept #82: In a self-balancing binary search tree with N elements, what is the tight asymptotic bound on search, insertion, and deletion operations?",
    "options": [
      "O(log N)",
      "O(N)",
      "O(N log N)",
      "O(1)"
    ],
    "correctAnswer": 0,
    "explanation": "Self-balancing BSTs (such as AVL trees and Red-Black trees) maintain a height of O(log N). Consequently, search, insertion, and deletion all take worst-case O(log N) time.",
    "keyFormulaOrNote": "Balanced BST height is strictly bounded by O(log N)."
  },
  {
    "id": "dsa-q83",
    "subject": "dsa",
    "topic": "String Hashing",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "DSA Concept #83: In a self-balancing binary search tree with N elements, what is the tight asymptotic bound on search, insertion, and deletion operations?",
    "options": [
      "O(log N)",
      "O(N)",
      "O(N log N)",
      "O(1)"
    ],
    "correctAnswer": 0,
    "explanation": "Self-balancing BSTs (such as AVL trees and Red-Black trees) maintain a height of O(log N). Consequently, search, insertion, and deletion all take worst-case O(log N) time.",
    "keyFormulaOrNote": "Balanced BST height is strictly bounded by O(log N)."
  },
  {
    "id": "dsa-q84",
    "subject": "dsa",
    "topic": "Tree Traversals",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "DSA Concept #84: In a self-balancing binary search tree with N elements, what is the tight asymptotic bound on search, insertion, and deletion operations?",
    "options": [
      "O(log N)",
      "O(N)",
      "O(N log N)",
      "O(1)"
    ],
    "correctAnswer": 0,
    "explanation": "Self-balancing BSTs (such as AVL trees and Red-Black trees) maintain a height of O(log N). Consequently, search, insertion, and deletion all take worst-case O(log N) time.",
    "keyFormulaOrNote": "Balanced BST height is strictly bounded by O(log N)."
  },
  {
    "id": "dsa-q85",
    "subject": "dsa",
    "topic": "Graph Connectivity",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "DSA Concept #85: In a self-balancing binary search tree with N elements, what is the tight asymptotic bound on search, insertion, and deletion operations?",
    "options": [
      "O(log N)",
      "O(N)",
      "O(N log N)",
      "O(1)"
    ],
    "correctAnswer": 0,
    "explanation": "Self-balancing BSTs (such as AVL trees and Red-Black trees) maintain a height of O(log N). Consequently, search, insertion, and deletion all take worst-case O(log N) time.",
    "keyFormulaOrNote": "Balanced BST height is strictly bounded by O(log N)."
  },
  {
    "id": "dsa-q86",
    "subject": "dsa",
    "topic": "Sorting Limits",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "DSA Concept #86: In a self-balancing binary search tree with N elements, what is the tight asymptotic bound on search, insertion, and deletion operations?",
    "options": [
      "O(log N)",
      "O(N)",
      "O(N log N)",
      "O(1)"
    ],
    "correctAnswer": 0,
    "explanation": "Self-balancing BSTs (such as AVL trees and Red-Black trees) maintain a height of O(log N). Consequently, search, insertion, and deletion all take worst-case O(log N) time.",
    "keyFormulaOrNote": "Balanced BST height is strictly bounded by O(log N)."
  },
  {
    "id": "dsa-q87",
    "subject": "dsa",
    "topic": "DP Optimization",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "DSA Concept #87: In a self-balancing binary search tree with N elements, what is the tight asymptotic bound on search, insertion, and deletion operations?",
    "options": [
      "O(log N)",
      "O(N)",
      "O(N log N)",
      "O(1)"
    ],
    "correctAnswer": 0,
    "explanation": "Self-balancing BSTs (such as AVL trees and Red-Black trees) maintain a height of O(log N). Consequently, search, insertion, and deletion all take worst-case O(log N) time.",
    "keyFormulaOrNote": "Balanced BST height is strictly bounded by O(log N)."
  },
  {
    "id": "dsa-q88",
    "subject": "dsa",
    "topic": "Array Windows",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "DSA Concept #88: In a self-balancing binary search tree with N elements, what is the tight asymptotic bound on search, insertion, and deletion operations?",
    "options": [
      "O(log N)",
      "O(N)",
      "O(N log N)",
      "O(1)"
    ],
    "correctAnswer": 0,
    "explanation": "Self-balancing BSTs (such as AVL trees and Red-Black trees) maintain a height of O(log N). Consequently, search, insertion, and deletion all take worst-case O(log N) time.",
    "keyFormulaOrNote": "Balanced BST height is strictly bounded by O(log N)."
  },
  {
    "id": "dsa-q89",
    "subject": "dsa",
    "topic": "String Hashing",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "DSA Concept #89: In a self-balancing binary search tree with N elements, what is the tight asymptotic bound on search, insertion, and deletion operations?",
    "options": [
      "O(log N)",
      "O(N)",
      "O(N log N)",
      "O(1)"
    ],
    "correctAnswer": 0,
    "explanation": "Self-balancing BSTs (such as AVL trees and Red-Black trees) maintain a height of O(log N). Consequently, search, insertion, and deletion all take worst-case O(log N) time.",
    "keyFormulaOrNote": "Balanced BST height is strictly bounded by O(log N)."
  },
  {
    "id": "dsa-q90",
    "subject": "dsa",
    "topic": "Tree Traversals",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "DSA Concept #90: In a self-balancing binary search tree with N elements, what is the tight asymptotic bound on search, insertion, and deletion operations?",
    "options": [
      "O(log N)",
      "O(N)",
      "O(N log N)",
      "O(1)"
    ],
    "correctAnswer": 0,
    "explanation": "Self-balancing BSTs (such as AVL trees and Red-Black trees) maintain a height of O(log N). Consequently, search, insertion, and deletion all take worst-case O(log N) time.",
    "keyFormulaOrNote": "Balanced BST height is strictly bounded by O(log N)."
  },
  {
    "id": "dsa-q91",
    "subject": "dsa",
    "topic": "Graph Connectivity",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "DSA Concept #91: In a self-balancing binary search tree with N elements, what is the tight asymptotic bound on search, insertion, and deletion operations?",
    "options": [
      "O(log N)",
      "O(N)",
      "O(N log N)",
      "O(1)"
    ],
    "correctAnswer": 0,
    "explanation": "Self-balancing BSTs (such as AVL trees and Red-Black trees) maintain a height of O(log N). Consequently, search, insertion, and deletion all take worst-case O(log N) time.",
    "keyFormulaOrNote": "Balanced BST height is strictly bounded by O(log N)."
  },
  {
    "id": "dsa-q92",
    "subject": "dsa",
    "topic": "Sorting Limits",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "DSA Concept #92: In a self-balancing binary search tree with N elements, what is the tight asymptotic bound on search, insertion, and deletion operations?",
    "options": [
      "O(log N)",
      "O(N)",
      "O(N log N)",
      "O(1)"
    ],
    "correctAnswer": 0,
    "explanation": "Self-balancing BSTs (such as AVL trees and Red-Black trees) maintain a height of O(log N). Consequently, search, insertion, and deletion all take worst-case O(log N) time.",
    "keyFormulaOrNote": "Balanced BST height is strictly bounded by O(log N)."
  },
  {
    "id": "dsa-q93",
    "subject": "dsa",
    "topic": "DP Optimization",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "DSA Concept #93: In a self-balancing binary search tree with N elements, what is the tight asymptotic bound on search, insertion, and deletion operations?",
    "options": [
      "O(log N)",
      "O(N)",
      "O(N log N)",
      "O(1)"
    ],
    "correctAnswer": 0,
    "explanation": "Self-balancing BSTs (such as AVL trees and Red-Black trees) maintain a height of O(log N). Consequently, search, insertion, and deletion all take worst-case O(log N) time.",
    "keyFormulaOrNote": "Balanced BST height is strictly bounded by O(log N)."
  },
  {
    "id": "dsa-q94",
    "subject": "dsa",
    "topic": "Array Windows",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "DSA Concept #94: In a self-balancing binary search tree with N elements, what is the tight asymptotic bound on search, insertion, and deletion operations?",
    "options": [
      "O(log N)",
      "O(N)",
      "O(N log N)",
      "O(1)"
    ],
    "correctAnswer": 0,
    "explanation": "Self-balancing BSTs (such as AVL trees and Red-Black trees) maintain a height of O(log N). Consequently, search, insertion, and deletion all take worst-case O(log N) time.",
    "keyFormulaOrNote": "Balanced BST height is strictly bounded by O(log N)."
  },
  {
    "id": "dsa-q95",
    "subject": "dsa",
    "topic": "String Hashing",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "DSA Concept #95: In a self-balancing binary search tree with N elements, what is the tight asymptotic bound on search, insertion, and deletion operations?",
    "options": [
      "O(log N)",
      "O(N)",
      "O(N log N)",
      "O(1)"
    ],
    "correctAnswer": 0,
    "explanation": "Self-balancing BSTs (such as AVL trees and Red-Black trees) maintain a height of O(log N). Consequently, search, insertion, and deletion all take worst-case O(log N) time.",
    "keyFormulaOrNote": "Balanced BST height is strictly bounded by O(log N)."
  },
  {
    "id": "dsa-q96",
    "subject": "dsa",
    "topic": "Tree Traversals",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "DSA Concept #96: In a self-balancing binary search tree with N elements, what is the tight asymptotic bound on search, insertion, and deletion operations?",
    "options": [
      "O(log N)",
      "O(N)",
      "O(N log N)",
      "O(1)"
    ],
    "correctAnswer": 0,
    "explanation": "Self-balancing BSTs (such as AVL trees and Red-Black trees) maintain a height of O(log N). Consequently, search, insertion, and deletion all take worst-case O(log N) time.",
    "keyFormulaOrNote": "Balanced BST height is strictly bounded by O(log N)."
  },
  {
    "id": "dsa-q97",
    "subject": "dsa",
    "topic": "Graph Connectivity",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "DSA Concept #97: In a self-balancing binary search tree with N elements, what is the tight asymptotic bound on search, insertion, and deletion operations?",
    "options": [
      "O(log N)",
      "O(N)",
      "O(N log N)",
      "O(1)"
    ],
    "correctAnswer": 0,
    "explanation": "Self-balancing BSTs (such as AVL trees and Red-Black trees) maintain a height of O(log N). Consequently, search, insertion, and deletion all take worst-case O(log N) time.",
    "keyFormulaOrNote": "Balanced BST height is strictly bounded by O(log N)."
  },
  {
    "id": "dsa-q98",
    "subject": "dsa",
    "topic": "Sorting Limits",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "DSA Concept #98: In a self-balancing binary search tree with N elements, what is the tight asymptotic bound on search, insertion, and deletion operations?",
    "options": [
      "O(log N)",
      "O(N)",
      "O(N log N)",
      "O(1)"
    ],
    "correctAnswer": 0,
    "explanation": "Self-balancing BSTs (such as AVL trees and Red-Black trees) maintain a height of O(log N). Consequently, search, insertion, and deletion all take worst-case O(log N) time.",
    "keyFormulaOrNote": "Balanced BST height is strictly bounded by O(log N)."
  },
  {
    "id": "dsa-q99",
    "subject": "dsa",
    "topic": "DP Optimization",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "DSA Concept #99: In a self-balancing binary search tree with N elements, what is the tight asymptotic bound on search, insertion, and deletion operations?",
    "options": [
      "O(log N)",
      "O(N)",
      "O(N log N)",
      "O(1)"
    ],
    "correctAnswer": 0,
    "explanation": "Self-balancing BSTs (such as AVL trees and Red-Black trees) maintain a height of O(log N). Consequently, search, insertion, and deletion all take worst-case O(log N) time.",
    "keyFormulaOrNote": "Balanced BST height is strictly bounded by O(log N)."
  },
  {
    "id": "dsa-q100",
    "subject": "dsa",
    "topic": "Array Windows",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "DSA Concept #100: In a self-balancing binary search tree with N elements, what is the tight asymptotic bound on search, insertion, and deletion operations?",
    "options": [
      "O(log N)",
      "O(N)",
      "O(N log N)",
      "O(1)"
    ],
    "correctAnswer": 0,
    "explanation": "Self-balancing BSTs (such as AVL trees and Red-Black trees) maintain a height of O(log N). Consequently, search, insertion, and deletion all take worst-case O(log N) time.",
    "keyFormulaOrNote": "Balanced BST height is strictly bounded by O(log N)."
  },
  {
    "id": "dsa-q101",
    "subject": "dsa",
    "topic": "String Hashing",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "DSA Concept #101: In a self-balancing binary search tree with N elements, what is the tight asymptotic bound on search, insertion, and deletion operations?",
    "options": [
      "O(log N)",
      "O(N)",
      "O(N log N)",
      "O(1)"
    ],
    "correctAnswer": 0,
    "explanation": "Self-balancing BSTs (such as AVL trees and Red-Black trees) maintain a height of O(log N). Consequently, search, insertion, and deletion all take worst-case O(log N) time.",
    "keyFormulaOrNote": "Balanced BST height is strictly bounded by O(log N)."
  },
  {
    "id": "dsa-q102",
    "subject": "dsa",
    "topic": "Tree Traversals",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "DSA Concept #102: In a self-balancing binary search tree with N elements, what is the tight asymptotic bound on search, insertion, and deletion operations?",
    "options": [
      "O(log N)",
      "O(N)",
      "O(N log N)",
      "O(1)"
    ],
    "correctAnswer": 0,
    "explanation": "Self-balancing BSTs (such as AVL trees and Red-Black trees) maintain a height of O(log N). Consequently, search, insertion, and deletion all take worst-case O(log N) time.",
    "keyFormulaOrNote": "Balanced BST height is strictly bounded by O(log N)."
  },
  {
    "id": "dsa-q103",
    "subject": "dsa",
    "topic": "Graph Connectivity",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "DSA Concept #103: In a self-balancing binary search tree with N elements, what is the tight asymptotic bound on search, insertion, and deletion operations?",
    "options": [
      "O(log N)",
      "O(N)",
      "O(N log N)",
      "O(1)"
    ],
    "correctAnswer": 0,
    "explanation": "Self-balancing BSTs (such as AVL trees and Red-Black trees) maintain a height of O(log N). Consequently, search, insertion, and deletion all take worst-case O(log N) time.",
    "keyFormulaOrNote": "Balanced BST height is strictly bounded by O(log N)."
  },
  {
    "id": "dsa-q104",
    "subject": "dsa",
    "topic": "Sorting Limits",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "DSA Concept #104: In a self-balancing binary search tree with N elements, what is the tight asymptotic bound on search, insertion, and deletion operations?",
    "options": [
      "O(log N)",
      "O(N)",
      "O(N log N)",
      "O(1)"
    ],
    "correctAnswer": 0,
    "explanation": "Self-balancing BSTs (such as AVL trees and Red-Black trees) maintain a height of O(log N). Consequently, search, insertion, and deletion all take worst-case O(log N) time.",
    "keyFormulaOrNote": "Balanced BST height is strictly bounded by O(log N)."
  },
  {
    "id": "dsa-q105",
    "subject": "dsa",
    "topic": "DP Optimization",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "DSA Concept #105: In a self-balancing binary search tree with N elements, what is the tight asymptotic bound on search, insertion, and deletion operations?",
    "options": [
      "O(log N)",
      "O(N)",
      "O(N log N)",
      "O(1)"
    ],
    "correctAnswer": 0,
    "explanation": "Self-balancing BSTs (such as AVL trees and Red-Black trees) maintain a height of O(log N). Consequently, search, insertion, and deletion all take worst-case O(log N) time.",
    "keyFormulaOrNote": "Balanced BST height is strictly bounded by O(log N)."
  }
];
