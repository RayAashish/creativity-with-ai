export interface PatternDetail {
  name: string;
  badge: string;
  whenToUse: string;
  timeComplexity: string;
  spaceComplexity: string;
  codeSnippet: {
    language: string;
    code: string;
  };
  explanation: string;
}

export interface LearningModule {
  id: string;
  title: string;
  tagline: string;
  overview: string;
  analogy: string;
  coreConcepts: string[];
  patterns: PatternDetail[];
  cheatSheet: {
    operation: string;
    average: string;
    worst: string;
  }[];
  interviewTips: string[];
  recommendedGameId?: string;
}

export const LEARNING_MODULES: Record<string, LearningModule> = {
  'arrays': {
    id: 'arrays',
    title: 'Arrays & Two-Pointers Mastery',
    tagline: 'The bedrock of DSA: sequential memory, two-pointers, sliding window & prefix sums',
    overview: 'Arrays are continuous memory blocks with instant O(1) index access. Mastering arrays requires knowing when to avoid brute force O(N²) quadratic loops by using Two-Pointers, Sliding Window, Kadane algorithm, or Prefix Sums.',
    analogy: 'Imagine a street of numbered lockers. You can inspect any locker instantly if you know the number. Searching through them all without an index requires walking door-to-door.',
    coreConcepts: [
      'Contiguous memory allocation and cache-locality benefits',
      'In-place modification without extra memory allocation O(1)',
      'Subarray vs Subsequence (contiguous vs non-contiguous order-preserving)',
      'Prefix and Suffix accumulators for range query acceleration'
    ],
    patterns: [
      {
        name: 'Two Pointers (Opposite Direction)',
        badge: 'O(N) Time, O(1) Space',
        whenToUse: 'Sorted arrays, pair sum targets, palindrome checks, reversing in-place.',
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(1)',
        explanation: 'Initialize Left at 0 and Right at N-1. Move Left rightward to increase sum, move Right leftward to decrease sum.',
        codeSnippet: {
          language: 'typescript',
          code: `function twoSumSorted(arr: number[], target: number): [number, number] | null {
  let left = 0, right = arr.length - 1;
  while (left < right) {
    const currentSum = arr[left] + arr[right];
    if (currentSum === target) return [left, right];
    if (currentSum < target) left++; // Need a bigger number
    else right--;                   // Need a smaller number
  }
  return null;
}`
        }
      },
      {
        name: "Kadane's Algorithm (Max Subarray Sum)",
        badge: 'Dynamic Subarray Optimizer',
        whenToUse: 'Finding the contiguous subarray with the maximum sum in linear time.',
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(1)',
        explanation: 'At each element, decide whether to append it to the current running sum or restart a new subarray from this element.',
        codeSnippet: {
          language: 'typescript',
          code: `function maxSubArray(nums: number[]): number {
  let maxSoFar = nums[0];
  let currentMax = nums[0];
  for (let i = 1; i < nums.length; i++) {
    // Either extend the previous subarray or start fresh from nums[i]
    currentMax = Math.max(nums[i], currentMax + nums[i]);
    maxSoFar = Math.max(maxSoFar, currentMax);
  }
  return maxSoFar;
}`
        }
      },
      {
        name: 'Sliding Window (Dynamic & Fixed)',
        badge: 'Contiguous Subsegment',
        whenToUse: 'Subarrays matching constraints (e.g. longest substring without repeating characters, min size sum >= target).',
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(K)',
        explanation: 'Expand the right boundary until the window satisfies the condition, then shrink from the left to optimize.',
        codeSnippet: {
          language: 'typescript',
          code: `function minSubArrayLen(target: number, nums: number[]): number {
  let left = 0, sum = 0, minLen = Infinity;
  for (let right = 0; right < nums.length; right++) {
    sum += nums[right];
    while (sum >= target) {
      minLen = Math.min(minLen, right - left + 1);
      sum -= nums[left++]; // shrink window from left
    }
  }
  return minLen === Infinity ? 0 : minLen;
}`
        }
      }
    ],
    cheatSheet: [
      { operation: 'Access by Index', average: 'O(1)', worst: 'O(1)' },
      { operation: 'Insert / Delete at End', average: 'O(1) amortized', worst: 'O(N)' },
      { operation: 'Insert / Delete at Beginning', average: 'O(N)', worst: 'O(N)' },
      { operation: 'Linear Search', average: 'O(N)', worst: 'O(N)' },
      { operation: 'Binary Search (Sorted)', average: 'O(log N)', worst: 'O(log N)' }
    ],
    interviewTips: [
      'Watch out for integer overflow when computing mid = (low + high) / 2. Use mid = low + Math.floor((high - low) / 2).',
      'If the array is sorted, immediately think Two Pointers or Binary Search.',
      'Check for empty arrays, single-element arrays, and arrays with duplicates.'
    ],
    recommendedGameId: 'game-two-pointer'
  },
  'binary-search': {
    id: 'binary-search',
    title: 'Binary Search & Monotonic Spaces',
    tagline: 'Logarithmic superpower: Halve the search space every single step',
    overview: 'Binary Search is not just for finding an element in a sorted array; it applies to any monotonic predicate F(x) where answers transition from FALSE to TRUE (Search on Answer space).',
    analogy: 'Guessing a number between 1 and 100 with "higher" or "lower" clues: asking 50 eliminates half the universe in one turn.',
    coreConcepts: [
      'Search space bounds: low, high, and mid index calculation',
      'Loop condition: low <= high vs low < high',
      'Boundary shifting: low = mid + 1, high = mid - 1',
      'Binary search on answer space (Koko eating bananas, Book allocation, Ship packages)'
    ],
    patterns: [
      {
        name: 'Classic Binary Search',
        badge: 'O(log N) Time',
        whenToUse: 'Finding an exact target in sorted array.',
        timeComplexity: 'O(log N)',
        spaceComplexity: 'O(1)',
        explanation: 'Check the middle element. If match, return. If target is smaller, search left half; else right half.',
        codeSnippet: {
          language: 'typescript',
          code: `function binarySearch(arr: number[], target: number): number {
  let low = 0, high = arr.length - 1;
  while (low <= high) {
    const mid = low + Math.floor((high - low) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) low = mid + 1;
    else high = mid - 1;
  }
  return -1; // Not found
}`
        }
      },
      {
        name: 'Search on Answer Space (Min/Max Optimization)',
        badge: 'High Frequency in FAANG',
        whenToUse: 'When asked for "minimum possible maximum" or "maximum possible minimum".',
        timeComplexity: 'O(N log(Range))',
        spaceComplexity: 'O(1)',
        explanation: 'Define low = min possible answer, high = max possible answer. Test if mid is valid with a helper function isPossible(mid).',
        codeSnippet: {
          language: 'typescript',
          code: `function minEatingSpeed(piles: number[], h: number): number {
  let low = 1, high = Math.max(...piles);
  let ans = high;
  
  function canFinish(k: number): boolean {
    let hours = 0;
    for (const p of piles) hours += Math.ceil(p / k);
    return hours <= h;
  }
  
  while (low <= high) {
    const mid = low + Math.floor((high - low) / 2);
    if (canFinish(mid)) {
      ans = mid;        // try a slower speed
      high = mid - 1;
    } else {
      low = mid + 1;    // must eat faster
    }
  }
  return ans;
}`
        }
      }
    ],
    cheatSheet: [
      { operation: 'Finding Target', average: 'O(log N)', worst: 'O(log N)' },
      { operation: 'Lower Bound (first element >= x)', average: 'O(log N)', worst: 'O(log N)' },
      { operation: 'Upper Bound (first element > x)', average: 'O(log N)', worst: 'O(log N)' }
    ],
    interviewTips: [
      'Notice whenever a question mentions "maximize the minimum" or "minimize the maximum". 95% of the time, that is Binary Search on Answer!',
      'Make sure your search range [low, high] covers all valid edge answers.'
    ],
    recommendedGameId: 'game-binary-sentry'
  },
  'stacks-queues': {
    id: 'stacks-queues',
    title: 'Stacks, Queues & Monotonic Power',
    tagline: 'LIFO & FIFO structures, Monotonic Stacks, and Next Greater Element',
    overview: 'Stacks follow Last-In-First-Out (LIFO) and Queues follow First-In-First-Out (FIFO). Monotonic Stacks maintain strictly increasing or decreasing orders to solve Next/Previous Greater/Smaller element problems in linear time O(N).',
    analogy: 'A stack is like a stack of plates at a buffet (last plate placed is first removed). A queue is a line at a movie ticket counter.',
    coreConcepts: [
      'Call stack recursion simulation',
      'Monotonic Stack: popping elements that violate monotonic property',
      'Next Greater / Previous Smaller Element pattern',
      'Deque (Double-Ended Queue) for sliding window maximum'
    ],
    patterns: [
      {
        name: 'Monotonic Decreasing Stack (Next Greater Element)',
        badge: 'O(N) Time, O(N) Space',
        whenToUse: 'Finding the next larger element for every index in an array.',
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(N)',
        explanation: 'Traverse right-to-left. Pop all elements from stack smaller than or equal to current element. Top is then the next greater element.',
        codeSnippet: {
          language: 'typescript',
          code: `function nextGreaterElements(nums: number[]): number[] {
  const n = nums.length;
  const result = new Array(n).fill(-1);
  const stack: number[] = []; // stores indices or values

  for (let i = n - 1; i >= 0; i--) {
    while (stack.length > 0 && stack[stack.length - 1] <= nums[i]) {
      stack.pop(); // discard smaller elements
    }
    if (stack.length > 0) {
      result[i] = stack[stack.length - 1];
    }
    stack.push(nums[i]);
  }
  return result;
}`
        }
      }
    ],
    cheatSheet: [
      { operation: 'Push / Enqueue', average: 'O(1)', worst: 'O(1)' },
      { operation: 'Pop / Dequeue', average: 'O(1)', worst: 'O(1)' },
      { operation: 'Peek / Top', average: 'O(1)', worst: 'O(1)' },
      { operation: 'Search', average: 'O(N)', worst: 'O(N)' }
    ],
    interviewTips: [
      'Always check if stack is empty before calling peek or pop.',
      'Remember that each element is pushed once and popped at most once in a monotonic stack, guaranteeing O(N) amortized time!'
    ],
    recommendedGameId: 'game-monotonic-stack'
  },
  'graphs': {
    id: 'graphs',
    title: 'Graphs & BFS / DFS Pathfinding',
    tagline: 'Modeling networks, relations, shortest paths, and topological dependencies',
    overview: 'Graphs represent relationships between entities using vertices and edges. Core traversal algorithms (BFS and DFS) solve connectivity, cycle detection, shortest paths in unweighted graphs, and DAG topological sorting.',
    analogy: 'Think of social networks where users are nodes and friendships are edges, or GPS roadmaps connecting cities with roads.',
    coreConcepts: [
      'Adjacency List vs Adjacency Matrix representations',
      'BFS: Level-by-level shortest path in unweighted graphs using a Queue',
      'DFS: Deep exploration and backtracking using a Stack / Recursion',
      'Cycle detection in directed vs undirected graphs',
      'Dijkstra priority queue for weighted graphs'
    ],
    patterns: [
      {
        name: 'Breadth-First Search (Shortest Path)',
        badge: 'Queue-Driven O(V + E)',
        whenToUse: 'Shortest path in unweighted graphs, level order, flood fill.',
        timeComplexity: 'O(V + E)',
        spaceComplexity: 'O(V)',
        explanation: 'Push starting node into queue. While queue is not empty, pop node, inspect neighbors, mark visited, and push unvisited neighbors.',
        codeSnippet: {
          language: 'typescript',
          code: `function bfsShortestPath(adj: number[][], start: number, target: number): number {
  const visited = new Set<number>([start]);
  const queue: [number, number][] = [[start, 0]]; // [node, distance]

  while (queue.length > 0) {
    const [curr, dist] = queue.shift()!;
    if (curr === target) return dist;

    for (const neighbor of adj[curr]) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push([neighbor, dist + 1]);
      }
    }
  }
  return -1; // Unreachable
}`
        }
      }
    ],
    cheatSheet: [
      { operation: 'BFS Traversal', average: 'O(V + E)', worst: 'O(V + E)' },
      { operation: 'DFS Traversal', average: 'O(V + E)', worst: 'O(V + E)' },
      { operation: 'Dijkstra (with Min-Heap)', average: 'O((V + E) log V)', worst: 'O((V + E) log V)' },
      { operation: 'Topological Sort (Kahn)', average: 'O(V + E)', worst: 'O(V + E)' }
    ],
    interviewTips: [
      'In a grid BFS (matrix coordinates [r,c]), use directional arrays const dirs = [[0,1],[0,-1],[1,0],[-1,0]] to clean up movement code.',
      'Always mark nodes as visited immediately upon enqueuing in BFS to prevent duplicate queue insertions.'
    ],
    recommendedGameId: 'game-island-bfs'
  },
  'dp': {
    id: 'dp',
    title: 'Dynamic Programming Decoded',
    tagline: 'Never solve the same subproblem twice: Memoization & Tabulation',
    overview: 'Dynamic Programming breaks down complex problems into overlapping subproblems with optimal substructure. It saves the results of subproblems to achieve polynomial time instead of exponential branch explosion.',
    analogy: 'If I write 1 + 1 + 1 + 1 on a board and ask how many, you count 4. If I add another + 1 at the end, you instantly say 5 because you remembered the previous 4!',
    coreConcepts: [
      'Overlapping subproblems & Optimal substructure',
      'Top-Down with Memoization (Recursion + Cache)',
      'Bottom-Up with Tabulation (Iterative base cases up to target)',
      'Space optimization: keeping only the previous 1 or 2 rows/states'
    ],
    patterns: [
      {
        name: 'Coin Change (Unbounded Knapsack / Minimum Cost)',
        badge: 'O(Amount * Coins)',
        whenToUse: 'Finding min coins/steps to reach an exact value where elements can be reused.',
        timeComplexity: 'O(Amount * N)',
        spaceComplexity: 'O(Amount)',
        explanation: 'dp[i] represents minimum coins to make amount i. For every coin <= i, dp[i] = min(dp[i], dp[i - coin] + 1).',
        codeSnippet: {
          language: 'typescript',
          code: `function coinChange(coins: number[], amount: number): number {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0; // 0 coins needed for amount 0

  for (let i = 1; i <= amount; i++) {
    for (const coin of coins) {
      if (i - coin >= 0 && dp[i - coin] !== Infinity) {
        dp[i] = Math.min(dp[i], dp[i - coin] + 1);
      }
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}`
        }
      }
    ],
    cheatSheet: [
      { operation: '0/1 Knapsack', average: 'O(N * W)', worst: 'O(N * W)' },
      { operation: 'Longest Common Subsequence', average: 'O(N * M)', worst: 'O(N * M)' },
      { operation: 'Longest Increasing Subsequence', average: 'O(N log N)', worst: 'O(N²)' }
    ],
    interviewTips: [
      'Always start by writing down the mathematical recurrence relation before writing code: dp[state] = ...',
      'Identify the base cases first (e.g. amount 0 requires 0 coins, empty string has length 0).'
    ],
    recommendedGameId: 'game-dp-coin'
  }
};
