export interface AlgorithmicPattern {
  id: string;
  name: string;
  emoji: string;
  oneLiner: string;
  identifyingCues: string[];
  archetypeProblem: string;
  archetypeQuestionId: string;
  timeComplexity: string;
  spaceComplexity: string;
  templateCode: string;
  whenToUse: string;
  keyPitfalls: string[];
  frequencyInInterviews: 'Extremely High' | 'Very High' | 'High';
}

export const ALGORITHMIC_PATTERNS: AlgorithmicPattern[] = [
  {
    id: 'sliding-window',
    name: 'Sliding Window',
    emoji: '🪟',
    oneLiner: 'Track optimal contiguous subarrays or substrings with dynamic expanding/shrinking boundaries.',
    identifyingCues: [
      'Problem asks for longest, shortest, or target contiguous subarray / substring',
      'Input is an array, string, or stream with monotonic criteria',
      'Naive approach requires O(N²) nested loops with j = i...n'
    ],
    archetypeProblem: 'Longest Substring Without Repeating Characters',
    archetypeQuestionId: 'str-4',
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(K) where K = alphabet / unique items',
    whenToUse: 'Whenever calculating sums, maximums, or target frequencies over contiguous sequences where sliding a boundary preserves state in O(1).',
    keyPitfalls: [
      'Forgetting to shrink the left pointer until the window becomes valid again',
      'Off-by-one window length calculations: length is always (right - left + 1)',
      'Not handling empty arrays or windows that can never satisfy constraints'
    ],
    frequencyInInterviews: 'Extremely High',
    templateCode: `function slidingWindow(nums, k) {
  let left = 0, currentSum = 0, maxLen = 0;
  for (let right = 0; right < nums.length; right++) {
    currentSum += nums[right];
    while (/* window violates constraint */ currentSum > k && left <= right) {
      currentSum -= nums[left];
      left++;
    }
    maxLen = Math.max(maxLen, right - left + 1);
  }
  return maxLen;
}`
  },
  {
    id: 'two-pointers',
    name: 'Two Pointers (Inward & Outward)',
    emoji: '👉👈',
    oneLiner: 'Converge from opposite ends or diverge from center to prune search space in sorted or symmetric data.',
    identifyingCues: [
      'Input array is sorted (or can be sorted in O(N log N))',
      'Searching for pairs, triplets, or sub-sequences matching a target sum / property',
      'Palindrome verification or in-place element swapping'
    ],
    archetypeProblem: 'Two Sum II / 3Sum / Container With Most Water',
    archetypeQuestionId: 'arr-18',
    timeComplexity: 'O(N) or O(N log N) if sorting',
    spaceComplexity: 'O(1) in-place',
    whenToUse: 'Eliminating nested loops by leveraging order: moving left pointer strictly increases value, moving right strictly decreases it.',
    keyPitfalls: [
      'Infinite while loop if neither left++ nor right-- happens in an else branch',
      'Handling duplicates when skipping triplets in 3Sum (while nums[i] == nums[i-1])',
      'Pointer crossover: ensure loop terminates with left < right or left <= right strictly'
    ],
    frequencyInInterviews: 'Extremely High',
    templateCode: `function twoPointers(sortedArr, target) {
  let left = 0, right = sortedArr.length - 1;
  while (left < right) {
    const sum = sortedArr[left] + sortedArr[right];
    if (sum === target) return [left, right];
    if (sum < target) left++;
    else right--;
  }
  return [-1, -1];
}`
  },
  {
    id: 'fast-slow',
    name: 'Fast & Slow Pointers (Floyd\'s Cycle)',
    emoji: '🐢🐇',
    oneLiner: 'Detect cycles, find midpoints, or calculate loop entrance points with differential pointer speeds.',
    identifyingCues: [
      'Linked list cycle detection or finding the middle node in single pass',
      'Array where values point to indices forming a cyclic functional graph',
      'Happy Number or finite state repetition problems'
    ],
    archetypeProblem: 'Linked List Cycle II & Find Duplicate Number',
    archetypeQuestionId: 'll-3',
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(1)',
    whenToUse: 'Cycle detection and midpoint determination without extra hash set memory.',
    keyPitfalls: [
      'NullPointerException: always check while (fast && fast.next) before fast = fast.next.next',
      'Odd vs even length linked lists returning first vs second middle node',
      'For cycle entry: reset one pointer to head and advance both at speed 1'
    ],
    frequencyInInterviews: 'Very High',
    templateCode: `function hasCycle(head) {
  let slow = head, fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) return true; // Cycle detected
  }
  return false;
}`
  },
  {
    id: 'monotonic-stack',
    name: 'Monotonic Stack / Queue',
    emoji: '🥞',
    oneLiner: 'Maintain strictly increasing or decreasing elements to resolve Next Greater / Previous Smaller in linear time.',
    identifyingCues: [
      'Find the "next greater element", "previous smaller element", or nearest peak',
      'Histogram largest rectangle, daily temperatures, or stock span',
      'Subarray minimums/maximums contribution counting'
    ],
    archetypeProblem: 'Daily Temperatures / Next Greater Element / Largest Rectangle',
    archetypeQuestionId: 'sq-1',
    timeComplexity: 'O(N) amortized (each element pushed/popped at most once)',
    spaceComplexity: 'O(N)',
    whenToUse: 'When an element\'s answer depends on finding the first element to its left or right that breaks an inequality.',
    keyPitfalls: [
      'Deciding whether to store values or indices (indices almost always store strictly more information)',
      'Strict vs non-strict inequalities: stack.top() <= arr[i] vs < arr[i]',
      'Flushing remaining elements from the stack after the main loop finishes'
    ],
    frequencyInInterviews: 'Extremely High',
    templateCode: `function nextGreaterElements(nums) {
  const n = nums.length;
  const res = new Array(n).fill(-1);
  const stack = []; // Stores indices
  for (let i = 0; i < n; i++) {
    while (stack.length > 0 && nums[stack[stack.length - 1]] < nums[i]) {
      const idx = stack.pop();
      res[idx] = nums[i];
    }
    stack.push(i);
  }
  return res;
}`
  },
  {
    id: 'merge-intervals',
    name: 'Merge Intervals',
    emoji: '📏',
    oneLiner: 'Sort intervals by start boundary to merge overlaps or compute non-overlapping schedules.',
    identifyingCues: [
      'Inputs are pairs [start, end] representing intervals, meeting times, or ranges',
      'Keywords: overlap, merge, conflict, minimum meeting rooms, calendar booking',
      'Finding intersection or union of ranges'
    ],
    archetypeProblem: 'Merge Intervals & Meeting Rooms II',
    archetypeQuestionId: 'arr-8',
    timeComplexity: 'O(N log N) for sorting, O(N) linear sweep',
    spaceComplexity: 'O(N) for merged output',
    whenToUse: 'Whenever resolving overlapping schedules, range insertions, or time-window consolidations.',
    keyPitfalls: [
      'Forgetting to sort intervals before comparing neighbors',
      'Checking curr.start <= prev.end vs curr.start < prev.end (touching intervals vs strictly overlapping)',
      'Updating prev.end = Math.max(prev.end, curr.end) rather than simply assigning curr.end'
    ],
    frequencyInInterviews: 'Extremely High',
    templateCode: `function mergeIntervals(intervals) {
  if (intervals.length <= 1) return intervals;
  intervals.sort((a, b) => a[0] - b[0]);
  const merged = [intervals[0]];
  for (let i = 1; i < intervals.length; i++) {
    const prev = merged[merged.length - 1];
    const curr = intervals[i];
    if (curr[0] <= prev[1]) {
      prev[1] = Math.max(prev[1], curr[1]);
    } else {
      merged.push(curr);
    }
  }
  return merged;
}`
  },
  {
    id: 'tree-bfs',
    name: 'Tree / Graph BFS (Level Order)',
    emoji: '🌲🌊',
    oneLiner: 'Explore hierarchical structures layer-by-layer using a FIFO queue to discover shortest paths or level aggregates.',
    identifyingCues: [
      'Tree level-order traversal, zigzag order, or right side view',
      'Shortest path in unweighted graph or grid (min knight moves, word ladder)',
      'Finding nodes at distance K from target'
    ],
    archetypeProblem: 'Binary Tree Level Order Traversal & Rotting Oranges',
    archetypeQuestionId: 'tree-1',
    timeComplexity: 'O(V + E) or O(N)',
    spaceComplexity: 'O(W) where W is max tree width or O(V)',
    whenToUse: 'Finding the shortest distance in an unweighted domain or processing level by level.',
    keyPitfalls: [
      'Snapshoting queue size at the start of each level: const levelSize = queue.length',
      'Forgetting visited set in general graphs leading to infinite loops',
      'Pushing null nodes into the queue without filtering'
    ],
    frequencyInInterviews: 'Extremely High',
    templateCode: `function levelOrder(root) {
  if (!root) return [];
  const result = [];
  const queue = [root];
  while (queue.length > 0) {
    const levelSize = queue.length;
    const currentLevel = [];
    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift();
      currentLevel.push(node.val);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    result.push(currentLevel);
  }
  return result;
}`
  },
  {
    id: 'tree-dfs',
    name: 'Tree DFS (Divide & Conquer)',
    emoji: '🌳🎯',
    oneLiner: 'Recursively solve left and right subproblems, combining sub-results with optimal post-order evaluation.',
    identifyingCues: [
      'Maximum path sum, diameter of binary tree, lowest common ancestor',
      'Validating BST properties where subtree values must fall inside (min, max) bounds',
      'Serialization / deserialization of trees'
    ],
    archetypeProblem: 'Diameter of Binary Tree & Lowest Common Ancestor',
    archetypeQuestionId: 'tree-5',
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(H) recursion stack where H = tree height (O(log N) balanced, O(N) skewed)',
    whenToUse: 'Aggregating subtree properties upward to the root (bottom-up DP on trees).',
    keyPitfalls: [
      'Distinguishing between what the recursive function returns to its parent vs the global maximum updated in passing',
      'Base case returns: null tree height is 0 vs -1 depending on edge vs node definitions',
      'Stack overflow on unbalanced linked-list shaped trees'
    ],
    frequencyInInterviews: 'Extremely High',
    templateCode: `function maxDepth(root) {
  if (!root) return 0;
  const leftDepth = maxDepth(root.left);
  const rightDepth = maxDepth(root.right);
  return 1 + Math.max(leftDepth, rightDepth);
}`
  },
  {
    id: 'top-k-elements',
    name: 'Top K Elements / QuickSelect',
    emoji: '🏆',
    oneLiner: 'Leverage Min-Heap of size K or QuickSelect partitioning to find K largest/smallest elements in linear or O(N log K) time.',
    identifyingCues: [
      'Find Kth largest/smallest element in unsorted array or stream',
      'Top K frequent words / numbers',
      'K closest points to origin'
    ],
    archetypeProblem: 'Kth Largest Element & Top K Frequent Elements',
    archetypeQuestionId: 'arr-3',
    timeComplexity: 'O(N log K) with Min-Heap, O(N) average with QuickSelect',
    spaceComplexity: 'O(K) heap storage',
    whenToUse: 'When sorting the entire array (O(N log N)) is wasteful because only the top K elements matter.',
    keyPitfalls: [
      'Using a Max-Heap instead of a Min-Heap: To find K largest, maintain a MIN-heap of size K so the minimum of the top K is at root',
      'QuickSelect worst-case O(N²) without randomized pivot selection',
      'Heap comparator inversions between languages (Java PriorityQueue default is min-heap; C++ priority_queue default is max-heap)'
    ],
    frequencyInInterviews: 'Very High',
    templateCode: `// Pseudo-heap logic for K largest elements
function findKthLargest(nums, k) {
  // Maintain min-heap of capacity K
  const minHeap = new MinPriorityQueue();
  for (const num of nums) {
    minHeap.enqueue(num);
    if (minHeap.size() > k) {
      minHeap.dequeue();
    }
  }
  return minHeap.front().element;
}`
  },
  {
    id: 'topological-sort',
    name: 'Topological Sort (Kahn\'s Algorithm)',
    emoji: '🧭📦',
    oneLiner: 'Linear ordering of vertices in a Directed Acyclic Graph (DAG) respecting dependency prerequisites.',
    identifyingCues: [
      'Course schedule with prerequisites',
      'Build system compilation order',
      'Alien dictionary alphabetical order recovery'
    ],
    archetypeProblem: 'Course Schedule I & II',
    archetypeQuestionId: 'grp-5',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V + E)',
    whenToUse: 'Resolving task scheduling dependencies and verifying graph acyclicity (DAG verification).',
    keyPitfalls: [
      'Detecting cycle: If count of processed nodes < total vertices V, the graph contains a cycle',
      'Correctly tracking in-degrees: indegree[v] is incremented when an edge u -> v exists',
      'Disconnected graphs: ensure all vertices with in-degree 0 are queued initially'
    ],
    frequencyInInterviews: 'High',
    templateCode: `function canFinish(numCourses, prerequisites) {
  const inDegree = new Array(numCourses).fill(0);
  const adj = Array.from({ length: numCourses }, () => []);
  for (const [course, prereq] of prerequisites) {
    adj[prereq].push(course);
    inDegree[course]++;
  }
  const queue = [];
  for (let i = 0; i < numCourses; i++) {
    if (inDegree[i] === 0) queue.push(i);
  }
  let count = 0;
  while (queue.length > 0) {
    const node = queue.shift();
    count++;
    for (const neighbor of adj[node]) {
      inDegree[neighbor]--;
      if (inDegree[neighbor] === 0) queue.push(neighbor);
    }
  }
  return count === numCourses;
}`
  },
  {
    id: 'knapsack-dp',
    name: '0/1 & Unbounded Knapsack DP',
    emoji: '🎒💎',
    oneLiner: 'Make binary take-or-leave decisions over discrete weights/values with optimal subproblem memoization.',
    identifyingCues: [
      'Partition array into equal subsets or subset sum equal to target',
      'Coin change (minimum coins or number of combinations)',
      'Maximize profit given limited capacity constraint'
    ],
    archetypeProblem: 'Coin Change & Partition Equal Subset Sum',
    archetypeQuestionId: 'dp-1',
    timeComplexity: 'O(N * W) pseudo-polynomial',
    spaceComplexity: 'O(W) with 1D rolling array optimization',
    whenToUse: 'Discrete decision problems where greed fails and states have overlapping subproblems dependent on capacity.',
    keyPitfalls: [
      '0/1 Knapsack 1D loop must run BACKWARDS (W down to weight[i]) to avoid reusing the same item twice',
      'Unbounded Knapsack (like Coin Change) 1D loop runs FORWARDS from weight[i] to W',
      'Base cases: dp[0] = 0 or 1 depending on whether counting ways or minimum count'
    ],
    frequencyInInterviews: 'Extremely High',
    templateCode: `function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (const coin of coins) {
    for (let x = coin; x <= amount; x++) {
      dp[x] = Math.min(dp[x], dp[x - coin] + 1);
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}`
  },
  {
    id: 'binary-search-answer',
    name: 'Binary Search on Answer Space',
    emoji: '🎯⚖️',
    oneLiner: 'Monotonically test feasibility across a bounded answer range [low, high] to converge in logarithmic time.',
    identifyingCues: [
      'Problem asks for "minimum of maximums" or "maximum of minimums"',
      'Given speed / days / allocation, determining whether a candidate X works is O(N) greedy',
      'Input array doesn\'t need to be sorted, but the feasibility predicate is monotonic: F F F T T T'
    ],
    archetypeProblem: 'Koko Eating Bananas & Capacity To Ship Packages Within D Days',
    archetypeQuestionId: 'arr-4',
    timeComplexity: 'O(N * log(Range))',
    spaceComplexity: 'O(1)',
    whenToUse: 'When computing the direct answer is difficult, but validating whether a hypothetical answer X is valid can be done easily in O(N).',
    keyPitfalls: [
      'Boundary definitions: mid = Math.floor(low + (high - low) / 2) to prevent 32-bit integer overflow',
      'Terminating conditions: low <= high with ans variable vs low < high',
      'Monotonicity validation: double-check that if X is valid, then all X+1 or X-1 are also valid'
    ],
    frequencyInInterviews: 'Extremely High',
    templateCode: `function shipWithinDays(weights, days) {
  let low = Math.max(...weights);
  let high = weights.reduce((a, b) => a + b, 0);
  
  function canShip(capacity) {
    let dayCount = 1, current = 0;
    for (const w of weights) {
      if (current + w > capacity) {
        dayCount++;
        current = w;
      } else {
        current += w;
      }
    }
    return dayCount <= days;
  }
  
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (canShip(mid)) {
      high = mid - 1; // Try smaller capacity
    } else {
      low = mid + 1; // Must be larger
    }
  }
  return low;
}`
  },
  {
    id: 'backtracking',
    name: 'Backtracking & Pruning',
    emoji: '🔄🧩',
    oneLiner: 'Recursively explore candidate solutions on state space trees, pruning branches immediately when constraints fail.',
    identifyingCues: [
      'Generate all permutations, combinations, or subsets',
      'Solve puzzles like N-Queens, Sudoku, or Word Search',
      'Constraint satisfaction where decisions can be made and unmade'
    ],
    archetypeProblem: 'Subsets, Combination Sum, & N-Queens',
    archetypeQuestionId: 'bck-1',
    timeComplexity: 'O(2^N) or O(N!) factorial',
    spaceComplexity: 'O(N) recursion call stack depth',
    whenToUse: 'Generating exhaustive valid outputs where constraints prune invalid branches early.',
    keyPitfalls: [
      'Forgetting the "un-choose" step: state.pop() or visited[r][c] = false after recursive call',
      'Deep copy: when adding path to result list, write result.push([...path]) in JS or new ArrayList<>(path) in Java',
      'Duplicate suppression: sorting input first and skipping if nums[i] == nums[i-1] && i > start'
    ],
    frequencyInInterviews: 'Very High',
    templateCode: `function subsets(nums) {
  const result = [];
  function backtrack(start, path) {
    result.push([...path]); // Snapshot
    for (let i = start; i < nums.length; i++) {
      path.push(nums[i]);       // Choose
      backtrack(i + 1, path);   // Explore
      path.pop();               // Un-choose (Backtrack)
    }
  }
  backtrack(0, []);
  return result;
}`
  },
  {
    id: 'union-find',
    name: 'Union-Find (Disjoint Set Union)',
    emoji: '⛓️🌐',
    oneLiner: 'Near O(1) connectivity queries and dynamic component merging using path compression & union by rank.',
    identifyingCues: [
      'Dynamic connected components as edges are added',
      'Cycle detection in undirected graphs (Kruskal\'s MST)',
      'Account merge, redundant connection, number of provinces'
    ],
    archetypeProblem: 'Number of Connected Components & Redundant Connection',
    archetypeQuestionId: 'grp-6',
    timeComplexity: 'O(α(N)) amortized nearly O(1) with Path Compression & Union by Rank',
    spaceComplexity: 'O(N) for parent and rank arrays',
    whenToUse: 'Graph connectivity when edges are given dynamically and shortest path weights are not required.',
    keyPitfalls: [
      'Missing path compression in find(x): parent[x] = find(parent[x])',
      'Comparing elements instead of their root representatives find(x) == find(y)',
      'Handling 1-indexed vs 0-indexed vertex labeling'
    ],
    frequencyInInterviews: 'High',
    templateCode: `class DSU {
  constructor(n) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.rank = new Array(n).fill(0);
  }
  find(x) {
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x]); // Path compression
    }
    return this.parent[x];
  }
  union(x, y) {
    const rootX = this.find(x);
    const rootY = this.find(y);
    if (rootX === rootY) return false; // Cycle detected
    if (this.rank[rootX] < this.rank[rootY]) {
      this.parent[rootX] = rootY;
    } else if (this.rank[rootX] > this.rank[rootY]) {
      this.parent[rootY] = rootX;
    } else {
      this.parent[rootY] = rootX;
      this.rank[rootX]++;
    }
    return true;
  }
}`
  },
  {
    id: 'bit-manipulation',
    name: 'Bitwise Operators & Bitmasking',
    emoji: '⚡01',
    oneLiner: 'Execute lightning-fast boolean operations, XOR cancelation, and compact exponential state tracking.',
    identifyingCues: [
      'Single number where all other numbers appear twice (XOR cancellation: x ^ x = 0)',
      'Counting set bits (Brian Kernighan\'s n & (n-1))',
      'Small N (N <= 20) subset states represented as integer bitmasks'
    ],
    archetypeProblem: 'Single Number, Counting Bits, & Subsets via Bitmask',
    archetypeQuestionId: 'bit-1',
    timeComplexity: 'O(1) to O(N)',
    spaceComplexity: 'O(1)',
    whenToUse: 'Space-constrained problems, parity checking, power of two verification (n > 0 && (n & (n-1)) === 0).',
    keyPitfalls: [
      'Operator precedence: (x & 1) === 1 requires parentheses because === binds tighter than &',
      'Sign bit propagation with >> vs >>> (arithmetic vs logical shift) in 32-bit signed ints',
      'Integer overflow when shifting 1 << 31 in signed languages'
    ],
    frequencyInInterviews: 'High',
    templateCode: `function singleNumber(nums) {
  let xor = 0;
  for (const num of nums) {
    xor ^= num; // Same numbers cancel out: a ^ a = 0
  }
  return xor;
}`
  }
];
