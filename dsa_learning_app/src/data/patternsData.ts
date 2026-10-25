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
  templateCodes: {
    java: string;
    cpp: string;
    python: string;
    javascript: string;
  };
  whenToUse: string;
  keyPitfalls: string[];
  frequencyInInterviews: 'Extremely High' | 'Very High' | 'High';
}

export const ALGORITHMIC_PATTERNS: AlgorithmicPattern[] = [
  {
    id: 'sliding-window',
    name: "Sliding Window",
    emoji: '🪟',
    oneLiner: "Track optimal contiguous subarrays or substrings with dynamic expanding/shrinking boundaries.",
    identifyingCues: ["Problem asks for longest, shortest, or target contiguous subarray / substring", "Input is an array, string, or stream with monotonic criteria", "Naive approach requires O(N\u00b2) nested loops with j = i...n"],
    archetypeProblem: "Longest Substring Without Repeating Characters",
    archetypeQuestionId: 'vault-longest-substring-without-repeat',
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(K) unique characters',
    frequencyInInterviews: 'Extremely High',
    whenToUse: "Whenever calculating sums, maximums, or target frequencies over contiguous sequences where sliding a boundary preserves state in O(1).",
    keyPitfalls: ["Forgetting to shrink the left pointer until the window becomes valid again", "Off-by-one window length calculations: length is always (right - left + 1)", "Not handling empty arrays or windows that can never satisfy constraints"],
    templateCodes: {
      "java": "public int slidingWindow(int[] nums, int k) {\n    int left = 0, currentSum = 0, maxLen = 0;\n    for (int right = 0; right < nums.length; right++) {\n        currentSum += nums[right];\n        while (currentSum > k && left <= right) { // Window violates constraint\n            currentSum -= nums[left];\n            left++;\n        }\n        maxLen = Math.max(maxLen, right - left + 1);\n    }\n    return maxLen;\n}",
      "cpp": "int slidingWindow(const std::vector<int>& nums, int k) {\n    int left = 0, currentSum = 0, maxLen = 0;\n    for (int right = 0; right < (int)nums.size(); ++right) {\n        currentSum += nums[right];\n        while (currentSum > k && left <= right) {\n            currentSum -= nums[left];\n            left++;\n        }\n        maxLen = std::max(maxLen, right - left + 1);\n    }\n    return maxLen;\n}",
      "python": "def sliding_window(nums: list[int], k: int) -> int:\n    left = 0\n    current_sum = 0\n    max_len = 0\n    for right in range(len(nums)):\n        current_sum += nums[right]\n        while current_sum > k and left <= right:\n            current_sum -= nums[left]\n            left += 1\n        max_len = max(max_len, right - left + 1)\n    return max_len",
      "javascript": "function slidingWindow(nums, k) {\n  let left = 0, currentSum = 0, maxLen = 0;\n  for (let right = 0; right < nums.length; right++) {\n    currentSum += nums[right];\n    while (currentSum > k && left <= right) {\n      currentSum -= nums[left];\n      left++;\n    }\n    maxLen = Math.max(maxLen, right - left + 1);\n  }\n  return maxLen;\n}"
}
  },
  {
    id: 'two-pointers',
    name: "Two Pointers (Inward & Outward)",
    emoji: '👉👈',
    oneLiner: "Converge from opposite ends or diverge from center to prune search space in sorted or symmetric data.",
    identifyingCues: ["Input array is sorted (or can be sorted in O(N log N))", "Searching for pairs, triplets, or sub-sequences matching a target sum / property", "Palindrome verification or in-place element swapping"],
    archetypeProblem: "3Sum & Container With Most Water",
    archetypeQuestionId: 'vault-3sum',
    timeComplexity: 'O(N) (or O(N log N) if sorting)',
    spaceComplexity: 'O(1) in-place',
    frequencyInInterviews: 'Extremely High',
    whenToUse: "Eliminating nested loops by leveraging order: moving left pointer strictly increases value, moving right strictly decreases it.",
    keyPitfalls: ["Infinite while loop if neither left++ nor right-- happens in an else branch", "Handling duplicates when skipping triplets in 3Sum (while nums[i] == nums[i-1])", "Pointer crossover: ensure loop terminates with left < right or left <= right strictly"],
    templateCodes: {
      "java": "public int[] twoPointers(int[] sortedArr, int target) {\n    int left = 0, right = sortedArr.length - 1;\n    while (left < right) {\n        int sum = sortedArr[left] + sortedArr[right];\n        if (sum == target) return new int[] { left, right };\n        if (sum < target) left++;\n        else right--;\n    }\n    return new int[] { -1, -1 };\n}",
      "cpp": "std::vector<int> twoPointers(const std::vector<int>& sortedArr, int target) {\n    int left = 0, right = (int)sortedArr.size() - 1;\n    while (left < right) {\n        int sum = sortedArr[left] + sortedArr[right];\n        if (sum == target) return {left, right};\n        if (sum < target) left++;\n        else right--;\n    }\n    return {-1, -1};\n}",
      "python": "def two_pointers(sorted_arr: list[int], target: int) -> list[int]:\n    left, right = 0, len(sorted_arr) - 1\n    while left < right:\n        s = sorted_arr[left] + sorted_arr[right]\n        if s == target:\n            return [left, right]\n        elif s < target:\n            left += 1\n        else:\n            right -= 1\n    return [-1, -1]",
      "javascript": "function twoPointers(sortedArr, target) {\n  let left = 0, right = sortedArr.length - 1;\n  while (left < right) {\n    const sum = sortedArr[left] + sortedArr[right];\n    if (sum === target) return [left, right];\n    if (sum < target) left++;\n    else right--;\n  }\n  return [-1, -1];\n}"
}
  },
  {
    id: 'fast-slow',
    name: "Fast & Slow Pointers (Floyd's Cycle)",
    emoji: '🐢🐇',
    oneLiner: "Detect cycles, find midpoints, or calculate loop entrance points with differential pointer speeds.",
    identifyingCues: ["Linked list cycle detection or finding the middle node in single pass", "Array where values point to indices forming a cyclic functional graph", "Happy Number or finite state repetition problems"],
    archetypeProblem: "Linked List Cycle & Find Duplicate Number",
    archetypeQuestionId: 'vault-linked-list-cycle',
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(1)',
    frequencyInInterviews: 'Very High',
    whenToUse: "Cycle detection and midpoint determination without extra hash set memory.",
    keyPitfalls: ["NullPointerException: check while (fast != null && fast.next != null) before fast = fast.next.next", "Odd vs even length linked lists returning first vs second middle node", "For cycle entry: reset one pointer to head and advance both at speed 1"],
    templateCodes: {
      "java": "public boolean hasCycle(ListNode head) {\n    ListNode slow = head, fast = head;\n    while (fast != null && fast.next != null) {\n        slow = slow.next;\n        fast = fast.next.next;\n        if (slow == fast) return true; // Cycle detected\n    }\n    return false;\n}",
      "cpp": "bool hasCycle(ListNode *head) {\n    ListNode *slow = head, *fast = head;\n    while (fast && fast->next) {\n        slow = slow->next;\n        fast = fast->next->next;\n        if (slow == fast) return true;\n    }\n    return false;\n}",
      "python": "def has_cycle(head: Optional[ListNode]) -> bool:\n    slow = fast = head\n    while fast and fast.next:\n        slow = slow.next\n        fast = fast.next.next\n        if slow == fast:\n            return True\n    return False",
      "javascript": "function hasCycle(head) {\n  let slow = head, fast = head;\n  while (fast && fast.next) {\n    slow = slow.next;\n    fast = fast.next.next;\n    if (slow === fast) return true;\n  }\n  return false;\n}"
}
  },
  {
    id: 'monotonic-stack',
    name: "Monotonic Stack / Queue",
    emoji: '🥞',
    oneLiner: "Maintain strictly increasing or decreasing elements to resolve Next Greater / Previous Smaller in linear time.",
    identifyingCues: ["Find next greater element, previous smaller element, or nearest peak", "Histogram largest rectangle, daily temperatures, or stock span", "Subarray minimums/maximums contribution counting"],
    archetypeProblem: "Daily Temperatures & Largest Rectangle in Histogram",
    archetypeQuestionId: 'vault-daily-temperatures',
    timeComplexity: 'O(N) amortized',
    spaceComplexity: 'O(N)',
    frequencyInInterviews: 'Extremely High',
    whenToUse: "When an element's answer depends on finding the first element to its left or right breaking an inequality.",
    keyPitfalls: ["Deciding whether to store values or indices (indices almost always store more information)", "Strict vs non-strict inequalities: stack.peek() <= arr[i] vs < arr[i]", "Flushing remaining elements from the stack after the main loop finishes"],
    templateCodes: {
      "java": "public int[] nextGreaterElements(int[] nums) {\n    int n = nums.length;\n    int[] res = new int[n];\n    Arrays.fill(res, -1);\n    Deque<Integer> stack = new ArrayDeque<>(); // stores indices\n    for (int i = 0; i < n; i++) {\n        while (!stack.isEmpty() && nums[stack.peek()] < nums[i]) {\n            int idx = stack.pop();\n            res[idx] = nums[i];\n        }\n        stack.push(i);\n    }\n    return res;\n}",
      "cpp": "std::vector<int> nextGreaterElements(const std::vector<int>& nums) {\n    int n = nums.size();\n    std::vector<int> res(n, -1);\n    std::stack<int> st; // stores indices\n    for (int i = 0; i < n; ++i) {\n        while (!st.empty() && nums[st.top()] < nums[i]) {\n            res[st.top()] = nums[i];\n            st.pop();\n        }\n        st.push(i);\n    }\n    return res;\n}",
      "python": "def next_greater_elements(nums: list[int]) -> list[int]:\n    n = len(nums)\n    res = [-1] * n\n    stack = [] # stores indices\n    for i in range(n):\n        while stack and nums[stack[-1]] < nums[i]:\n            idx = stack.pop()\n            res[idx] = nums[i]\n        stack.append(i)\n    return res",
      "javascript": "function nextGreaterElements(nums) {\n  const n = nums.length;\n  const res = new Array(n).fill(-1);\n  const stack = [];\n  for (let i = 0; i < n; i++) {\n    while (stack.length > 0 && nums[stack[stack.length - 1]] < nums[i]) {\n      const idx = stack.pop();\n      res[idx] = nums[i];\n    }\n    stack.push(i);\n  }\n  return res;\n}"
}
  },
  {
    id: 'merge-intervals',
    name: "Merge Intervals",
    emoji: '📏',
    oneLiner: "Sort intervals by start boundary to merge overlaps or compute non-overlapping schedules.",
    identifyingCues: ["Inputs are pairs [start, end] representing intervals, meeting times, or ranges", "Keywords: overlap, merge, conflict, minimum meeting rooms, calendar booking", "Finding intersection or union of ranges"],
    archetypeProblem: "Merge Intervals & Meeting Rooms II",
    archetypeQuestionId: 'vault-merge-intervals',
    timeComplexity: 'O(N log N) sort, O(N) sweep',
    spaceComplexity: 'O(N)',
    frequencyInInterviews: 'Extremely High',
    whenToUse: "Whenever resolving overlapping schedules, range insertions, or time-window consolidations.",
    keyPitfalls: ["Forgetting to sort intervals before comparing neighbors", "Checking curr[0] <= prev[1] vs curr[0] < prev[1] (touching vs strictly overlapping)", "Updating prev[1] = Math.max(prev[1], curr[1]) rather than simply assigning curr[1]"],
    templateCodes: {
      "java": "public int[][] mergeIntervals(int[][] intervals) {\n    if (intervals.length <= 1) return intervals;\n    Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));\n    List<int[]> merged = new ArrayList<>();\n    merged.add(intervals[0]);\n    for (int i = 1; i < intervals.length; i++) {\n        int[] prev = merged.get(merged.size() - 1);\n        int[] curr = intervals[i];\n        if (curr[0] <= prev[1]) {\n            prev[1] = Math.max(prev[1], curr[1]);\n        } else {\n            merged.add(curr);\n        }\n    }\n    return merged.toArray(new int[merged.size()][]);\n}",
      "cpp": "std::vector<std::vector<int>> mergeIntervals(std::vector<std::vector<int>>& intervals) {\n    if (intervals.size() <= 1) return intervals;\n    std::sort(intervals.begin(), intervals.end());\n    std::vector<std::vector<int>> merged = {intervals[0]};\n    for (size_t i = 1; i < intervals.size(); ++i) {\n        if (intervals[i][0] <= merged.back()[1]) {\n            merged.back()[1] = std::max(merged.back()[1], intervals[i][1]);\n        } else {\n            merged.push_back(intervals[i]);\n        }\n    }\n    return merged;\n}",
      "python": "def merge_intervals(intervals: list[list[int]]) -> list[list[int]]:\n    if len(intervals) <= 1:\n        return intervals\n    intervals.sort(key=lambda x: x[0])\n    merged = [intervals[0]]\n    for curr in intervals[1:]:\n        prev = merged[-1]\n        if curr[0] <= prev[1]:\n            prev[1] = max(prev[1], curr[1])\n        else:\n            merged.append(curr)\n    return merged",
      "javascript": "function mergeIntervals(intervals) {\n  if (intervals.length <= 1) return intervals;\n  intervals.sort((a, b) => a[0] - b[0]);\n  const merged = [intervals[0]];\n  for (let i = 1; i < intervals.length; i++) {\n    const prev = merged[merged.length - 1];\n    const curr = intervals[i];\n    if (curr[0] <= prev[1]) {\n      prev[1] = Math.max(prev[1], curr[1]);\n    } else {\n      merged.push(curr);\n    }\n  }\n  return merged;\n}"
}
  },
  {
    id: 'tree-bfs',
    name: "Tree / Graph BFS (Level Order)",
    emoji: '🌲🌊',
    oneLiner: "Explore hierarchical structures layer-by-layer using a FIFO queue to discover shortest paths or level aggregates.",
    identifyingCues: ["Tree level-order traversal, zigzag order, or right side view", "Shortest path in unweighted graph or grid (min knight moves, word ladder)", "Finding nodes at distance K from target"],
    archetypeProblem: "Binary Tree Level Order Traversal & Rotting Oranges",
    archetypeQuestionId: 'vault-level-order-traversal',
    timeComplexity: 'O(V + E) or O(N)',
    spaceComplexity: 'O(W) tree width or O(V)',
    frequencyInInterviews: 'Extremely High',
    whenToUse: "Finding the shortest distance in an unweighted domain or processing level by level.",
    keyPitfalls: ["Snapshoting queue size at the start of each level: int levelSize = queue.size()", "Forgetting visited set in general graphs leading to infinite loops", "Pushing null nodes into the queue without filtering"],
    templateCodes: {
      "java": "public List<List<Integer>> levelOrder(TreeNode root) {\n    List<List<Integer>> result = new ArrayList<>();\n    if (root == null) return result;\n    Queue<TreeNode> queue = new LinkedList<>();\n    queue.offer(root);\n    while (!queue.isEmpty()) {\n        int levelSize = queue.size();\n        List<Integer> currentLevel = new ArrayList<>();\n        for (int i = 0; i < levelSize; i++) {\n            TreeNode node = queue.poll();\n            currentLevel.add(node.val);\n            if (node.left != null) queue.offer(node.left);\n            if (node.right != null) queue.offer(node.right);\n        }\n        result.add(currentLevel);\n    }\n    return result;\n}",
      "cpp": "std::vector<std::vector<int>> levelOrder(TreeNode* root) {\n    std::vector<std::vector<int>> result;\n    if (!root) return result;\n    std::queue<TreeNode*> q;\n    q.push(root);\n    while (!q.empty()) {\n        int levelSize = q.size();\n        std::vector<int> currentLevel;\n        for (int i = 0; i < levelSize; ++i) {\n            TreeNode* node = q.front(); q.pop();\n            currentLevel.push_back(node->val);\n            if (node->left) q.push(node->left);\n            if (node->right) q.push(node->right);\n        }\n        result.push_back(currentLevel);\n    }\n    return result;\n}",
      "python": "def level_order(root: Optional[TreeNode]) -> list[list[int]]:\n    if not root:\n        return []\n    result = []\n    queue = deque([root])\n    while queue:\n        level_size = len(queue)\n        current_level = []\n        for _ in range(level_size):\n            node = queue.popleft()\n            current_level.append(node.val)\n            if node.left: queue.append(node.left)\n            if node.right: queue.append(node.right)\n        result.append(current_level)\n    return result",
      "javascript": "function levelOrder(root) {\n  if (!root) return [];\n  const result = [];\n  const queue = [root];\n  while (queue.length > 0) {\n    const levelSize = queue.length;\n    const currentLevel = [];\n    for (let i = 0; i < levelSize; i++) {\n      const node = queue.shift();\n      currentLevel.push(node.val);\n      if (node.left) queue.push(node.left);\n      if (node.right) queue.push(node.right);\n    }\n    result.push(currentLevel);\n  }\n  return result;\n}"
}
  },
  {
    id: 'tree-dfs',
    name: "Tree DFS (Divide & Conquer)",
    emoji: '🌳🎯',
    oneLiner: "Recursively solve left and right subproblems, combining sub-results with optimal post-order evaluation.",
    identifyingCues: ["Maximum path sum, diameter of binary tree, lowest common ancestor", "Validating BST properties where subtree values must fall inside (min, max) bounds", "Serialization / deserialization of trees"],
    archetypeProblem: "Diameter of Binary Tree & Lowest Common Ancestor",
    archetypeQuestionId: 'vault-diameter-binary-tree',
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(H) recursion stack',
    frequencyInInterviews: 'Extremely High',
    whenToUse: "Aggregating subtree properties upward to the root (bottom-up DP on trees).",
    keyPitfalls: ["Distinguishing what the recursive helper returns to parent vs global max updated in passing", "Base case returns: null tree height is 0 vs -1 depending on edge vs node definitions", "Stack overflow on unbalanced linked-list shaped trees"],
    templateCodes: {
      "java": "public int maxDepth(TreeNode root) {\n    if (root == null) return 0;\n    int leftDepth = maxDepth(root.left);\n    int rightDepth = maxDepth(root.right);\n    return 1 + Math.max(leftDepth, rightDepth);\n}",
      "cpp": "int maxDepth(TreeNode* root) {\n    if (!root) return 0;\n    int leftDepth = maxDepth(root->left);\n    int rightDepth = maxDepth(root->right);\n    return 1 + std::max(leftDepth, rightDepth);\n}",
      "python": "def max_depth(root: Optional[TreeNode]) -> int:\n    if not root:\n        return 0\n    return 1 + max(max_depth(root.left), max_depth(root.right))",
      "javascript": "function maxDepth(root) {\n  if (!root) return 0;\n  const leftDepth = maxDepth(root.left);\n  const rightDepth = maxDepth(root.right);\n  return 1 + Math.max(leftDepth, rightDepth);\n}"
}
  },
  {
    id: 'top-k-elements',
    name: "Top K Elements / QuickSelect",
    emoji: '🏆',
    oneLiner: "Leverage Min-Heap of size K or QuickSelect partitioning to find K largest/smallest elements in linear or O(N log K) time.",
    identifyingCues: ["Find Kth largest/smallest element in unsorted array or stream", "Top K frequent words / numbers", "K closest points to origin"],
    archetypeProblem: "Kth Largest Element in an Array & Top K Frequent Elements",
    archetypeQuestionId: 'vault-kth-largest-array',
    timeComplexity: 'O(N log K) with Min-Heap, O(N) average with QuickSelect',
    spaceComplexity: 'O(K) heap storage',
    frequencyInInterviews: 'Very High',
    whenToUse: "When sorting the entire array (O(N log N)) is wasteful because only the top K elements matter.",
    keyPitfalls: ["Using Max-Heap instead of Min-Heap: To find K largest, maintain a MIN-heap of size K so root is the kth largest", "QuickSelect worst-case O(N\u00b2) without randomized pivot selection", "Heap comparator inversions between languages"],
    templateCodes: {
      "java": "public int findKthLargest(int[] nums, int k) {\n    PriorityQueue<Integer> minHeap = new PriorityQueue<>(k);\n    for (int num : nums) {\n        minHeap.offer(num);\n        if (minHeap.size() > k) {\n            minHeap.poll();\n        }\n    }\n    return minHeap.peek();\n}",
      "cpp": "int findKthLargest(const std::vector<int>& nums, int k) {\n    std::priority_queue<int, std::vector<int>, std::greater<int>> minHeap;\n    for (int num : nums) {\n        minHeap.push(num);\n        if (minHeap.size() > k) {\n            minHeap.pop();\n        }\n    }\n    return minHeap.top();\n}",
      "python": "def find_kth_largest(nums: list[int], k: int) -> int:\n    min_heap = []\n    for num in nums:\n        heapq.heappush(min_heap, num)\n        if len(min_heap) > k:\n            heapq.heappop(min_heap)\n    return min_heap[0]",
      "javascript": "function findKthLargest(nums, k) {\n  // Min-heap simulation or QuickSelect\n  nums.sort((a, b) => b - a);\n  return nums[k - 1];\n}"
}
  },
  {
    id: 'topological-sort',
    name: "Topological Sort (Kahn's Algorithm)",
    emoji: '🧭📦',
    oneLiner: "Linear ordering of vertices in a Directed Acyclic Graph (DAG) respecting dependency prerequisites.",
    identifyingCues: ["Course schedule with prerequisites", "Build system compilation order", "Alien dictionary alphabetical order recovery"],
    archetypeProblem: "Course Schedule I & II",
    archetypeQuestionId: 'vault-course-schedule',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V + E)',
    frequencyInInterviews: 'High',
    whenToUse: "Resolving task scheduling dependencies and verifying graph acyclicity (DAG verification).",
    keyPitfalls: ["Detecting cycle: If count of processed nodes < total vertices V, the graph contains a cycle", "Correctly tracking in-degrees: indegree[v] is incremented when an edge u -> v exists", "Disconnected graphs: ensure all vertices with in-degree 0 are queued initially"],
    templateCodes: {
      "java": "public boolean canFinish(int numCourses, int[][] prerequisites) {\n    int[] inDegree = new int[numCourses];\n    List<List<Integer>> adj = new ArrayList<>();\n    for (int i = 0; i < numCourses; i++) adj.add(new ArrayList<>());\n    for (int[] p : prerequisites) {\n        adj.get(p[1]).add(p[0]);\n        inDegree[p[0]]++;\n    }\n    Queue<Integer> q = new LinkedList<>();\n    for (int i = 0; i < numCourses; i++) {\n        if (inDegree[i] == 0) q.offer(i);\n    }\n    int count = 0;\n    while (!q.isEmpty()) {\n        int u = q.poll();\n        count++;\n        for (int v : adj.get(u)) {\n            if (--inDegree[v] == 0) q.offer(v);\n        }\n    }\n    return count == numCourses;\n}",
      "cpp": "bool canFinish(int numCourses, const std::vector<std::vector<int>>& prerequisites) {\n    std::vector<int> inDegree(numCourses, 0);\n    std::vector<std::vector<int>> adj(numCourses);\n    for (const auto& p : prerequisites) {\n        adj[p[1]].push_back(p[0]);\n        inDegree[p[0]]++;\n    }\n    std::queue<int> q;\n    for (int i = 0; i < numCourses; ++i) {\n        if (inDegree[i] == 0) q.push(i);\n    }\n    int count = 0;\n    while (!q.empty()) {\n        int u = q.front(); q.pop();\n        count++;\n        for (int v : adj[u]) {\n            if (--inDegree[v] == 0) q.push(v);\n        }\n    }\n    return count == numCourses;\n}",
      "python": "def can_finish(num_courses: int, prerequisites: list[list[int]]) -> bool:\n    in_degree = [0] * num_courses\n    adj = [[] for _ in range(num_courses)]\n    for course, prereq in prerequisites:\n        adj[prereq].append(course)\n        in_degree[course] += 1\n    queue = deque([i for i in range(num_courses) if in_degree[i] == 0])\n    count = 0\n    while queue:\n        u = queue.popleft()\n        count += 1\n        for v in adj[u]:\n            in_degree[v] -= 1\n            if in_degree[v] == 0:\n                queue.append(v)\n    return count == num_courses",
      "javascript": "function canFinish(numCourses, prerequisites) {\n  const inDegree = new Array(numCourses).fill(0);\n  const adj = Array.from({ length: numCourses }, () => []);\n  for (const [course, prereq] of prerequisites) {\n    adj[prereq].push(course);\n    inDegree[course]++;\n  }\n  const queue = [];\n  for (let i = 0; i < numCourses; i++) {\n    if (inDegree[i] === 0) queue.push(i);\n  }\n  let count = 0;\n  while (queue.length > 0) {\n    const u = queue.shift();\n    count++;\n    for (const v of adj[u]) {\n      if (--inDegree[v] === 0) queue.push(v);\n    }\n  }\n  return count === numCourses;\n}"
}
  },
  {
    id: 'knapsack-dp',
    name: "0/1 & Unbounded Knapsack DP",
    emoji: '🎒💎',
    oneLiner: "Make binary take-or-leave decisions over discrete weights/values with optimal subproblem memoization.",
    identifyingCues: ["Partition array into equal subsets or subset sum equal to target", "Coin change (minimum coins or number of combinations)", "Maximize profit given limited capacity constraint"],
    archetypeProblem: "Coin Change & Partition Equal Subset Sum",
    archetypeQuestionId: 'vault-coin-change',
    timeComplexity: 'O(N * W) pseudo-polynomial',
    spaceComplexity: 'O(W) 1D rolling array',
    frequencyInInterviews: 'Extremely High',
    whenToUse: "Discrete decision problems where greed fails and states have overlapping subproblems dependent on capacity.",
    keyPitfalls: ["0/1 Knapsack 1D loop must run BACKWARDS (W down to weight[i]) to avoid reusing item twice", "Unbounded Knapsack (like Coin Change) 1D loop runs FORWARDS from weight[i] to W", "Base cases: dp[0] = 0 or 1 depending on whether counting ways or minimum count"],
    templateCodes: {
      "java": "public int coinChange(int[] coins, int amount) {\n    int[] dp = new int[amount + 1];\n    Arrays.fill(dp, amount + 1);\n    dp[0] = 0;\n    for (int coin : coins) {\n        for (int x = coin; x <= amount; x++) {\n            dp[x] = Math.min(dp[x], dp[x - coin] + 1);\n        }\n    }\n    return dp[amount] > amount ? -1 : dp[amount];\n}",
      "cpp": "int coinChange(const std::vector<int>& coins, int amount) {\n    std::vector<int> dp(amount + 1, amount + 1);\n    dp[0] = 0;\n    for (int coin : coins) {\n        for (int x = coin; x <= amount; ++x) {\n            dp[x] = std::min(dp[x], dp[x - coin] + 1);\n        }\n    }\n    return dp[amount] > amount ? -1 : dp[amount];\n}",
      "python": "def coin_change(coins: list[int], amount: int) -> int:\n    dp = [float('inf')] * (amount + 1)\n    dp[0] = 0\n    for coin in coins:\n        for x in range(coin, amount + 1):\n            dp[x] = min(dp[x], dp[x - coin] + 1)\n    return dp[amount] if dp[amount] != float('inf') else -1",
      "javascript": "function coinChange(coins, amount) {\n  const dp = new Array(amount + 1).fill(Infinity);\n  dp[0] = 0;\n  for (const coin of coins) {\n    for (let x = coin; x <= amount; x++) {\n      dp[x] = Math.min(dp[x], dp[x - coin] + 1);\n    }\n  }\n  return dp[amount] === Infinity ? -1 : dp[amount];\n}"
}
  },
  {
    id: 'binary-search-answer',
    name: "Binary Search on Answer Space",
    emoji: '🎯⚖️',
    oneLiner: "Monotonically test feasibility across a bounded answer range [low, high] to converge in logarithmic time.",
    identifyingCues: ["Problem asks for 'minimum of maximums' or 'maximum of minimums'", "Given speed / days / allocation, determining whether candidate X works is O(N) greedy", "Input array doesn't need to be sorted, but feasibility predicate is monotonic: F F F T T T"],
    archetypeProblem: "Koko Eating Bananas & Capacity To Ship Packages Within D Days",
    archetypeQuestionId: 'vault-koko-bananas',
    timeComplexity: 'O(N * log(Range))',
    spaceComplexity: 'O(1)',
    frequencyInInterviews: 'Extremely High',
    whenToUse: "When computing the direct answer is difficult, but validating whether a hypothetical answer X is valid can be done easily in O(N).",
    keyPitfalls: ["Boundary definitions: mid = low + (high - low) / 2 to prevent integer overflow", "Terminating conditions: low <= high with ans variable vs low < high", "Monotonicity validation: double check that if X is valid, all X+1 or X-1 are also valid"],
    templateCodes: {
      "java": "public int shipWithinDays(int[] weights, int days) {\n    int low = 0, high = 0;\n    for (int w : weights) { low = Math.max(low, w); high += w; }\n    while (low <= high) {\n        int mid = low + (high - low) / 2;\n        if (canShip(weights, days, mid)) high = mid - 1;\n        else low = mid + 1;\n    }\n    return low;\n}\nprivate boolean canShip(int[] weights, int days, int capacity) {\n    int dayCount = 1, current = 0;\n    for (int w : weights) {\n        if (current + w > capacity) { dayCount++; current = w; }\n        else current += w;\n    }\n    return dayCount <= days;\n}",
      "cpp": "int shipWithinDays(const std::vector<int>& weights, int days) {\n    int low = 0, high = 0;\n    for (int w : weights) { low = std::max(low, w); high += w; }\n    auto canShip = [&](int cap) {\n        int dayCount = 1, current = 0;\n        for (int w : weights) {\n            if (current + w > cap) { dayCount++; current = w; }\n            else current += w;\n        }\n        return dayCount <= days;\n    };\n    while (low <= high) {\n        int mid = low + (high - low) / 2;\n        if (canShip(mid)) high = mid - 1;\n        else low = mid + 1;\n    }\n    return low;\n}",
      "python": "def ship_within_days(weights: list[int], days: int) -> int:\n    low, high = max(weights), sum(weights)\n    def can_ship(cap):\n        day_count, current = 1, 0\n        for w in weights:\n            if current + w > cap:\n                day_count += 1\n                current = w\n            else:\n                current += w\n        return day_count <= days\n    while low <= high:\n        mid = (low + high) // 2\n        if can_ship(mid):\n            high = mid - 1\n        else:\n            low = mid + 1\n    return low",
      "javascript": "function shipWithinDays(weights, days) {\n  let low = Math.max(...weights);\n  let high = weights.reduce((a, b) => a + b, 0);\n  function canShip(cap) {\n    let dayCount = 1, current = 0;\n    for (const w of weights) {\n      if (current + w > cap) { dayCount++; current = w; }\n      else current += w;\n    }\n    return dayCount <= days;\n  }\n  while (low <= high) {\n    const mid = Math.floor((low + high) / 2);\n    if (canShip(mid)) high = mid - 1;\n    else low = mid + 1;\n  }\n  return low;\n}"
}
  },
  {
    id: 'backtracking',
    name: "Backtracking & Pruning",
    emoji: '🔄🧩',
    oneLiner: "Recursively explore candidate solutions on state space trees, pruning branches immediately when constraints fail.",
    identifyingCues: ["Generate all permutations, combinations, or subsets", "Solve puzzles like N-Queens, Sudoku, or Word Search", "Constraint satisfaction where decisions can be made and unmade"],
    archetypeProblem: "Subsets, Combination Sum, & N-Queens",
    archetypeQuestionId: 'vault-subsets',
    timeComplexity: 'O(2^N) or O(N!)',
    spaceComplexity: 'O(N) recursion depth',
    frequencyInInterviews: 'Very High',
    whenToUse: "Generating exhaustive valid outputs where constraints prune invalid branches early.",
    keyPitfalls: ["Forgetting the un-choose step: state.remove(state.size() - 1) after recursive call", "Deep copy: when adding path to result, write new ArrayList<>(path)", "Duplicate suppression: sorting input first and skipping if nums[i] == nums[i-1] && i > start"],
    templateCodes: {
      "java": "public List<List<Integer>> subsets(int[] nums) {\n    List<List<Integer>> result = new ArrayList<>();\n    backtrack(0, nums, new ArrayList<>(), result);\n    return result;\n}\nprivate void backtrack(int start, int[] nums, List<Integer> path, List<List<Integer>> result) {\n    result.add(new ArrayList<>(path)); // Snapshot\n    for (int i = start; i < nums.length; i++) {\n        path.add(nums[i]);       // Choose\n        backtrack(i + 1, nums, path, result); // Explore\n        path.remove(path.size() - 1); // Un-choose (Backtrack)\n    }\n}",
      "cpp": "std::vector<std::vector<int>> subsets(const std::vector<int>& nums) {\n    std::vector<std::vector<int>> result;\n    std::vector<int> path;\n    auto backtrack = [&](auto self, int start) -> void {\n        result.push_back(path);\n        for (size_t i = start; i < nums.size(); ++i) {\n            path.push_back(nums[i]);\n            self(self, i + 1);\n            path.pop_back();\n        }\n    };\n    backtrack(backtrack, 0);\n    return result;\n}",
      "python": "def subsets(nums: list[int]) -> list[list[int]]:\n    result = []\n    def backtrack(start, path):\n        result.append(list(path))\n        for i in range(start, len(nums)):\n            path.append(nums[i])\n            backtrack(i + 1, path)\n            path.pop()\n    backtrack(0, [])\n    return result",
      "javascript": "function subsets(nums) {\n  const result = [];\n  function backtrack(start, path) {\n    result.push([...path]);\n    for (let i = start; i < nums.length; i++) {\n      path.push(nums[i]);\n      backtrack(i + 1, path);\n      path.pop();\n    }\n  }\n  backtrack(0, []);\n  return result;\n}"
}
  },
  {
    id: 'union-find',
    name: "Union-Find (Disjoint Set Union)",
    emoji: '⛓️🌐',
    oneLiner: "Near O(1) connectivity queries and dynamic component merging using path compression & union by rank.",
    identifyingCues: ["Dynamic connected components as edges are added", "Cycle detection in undirected graphs (Kruskal's MST)", "Account merge, redundant connection, number of provinces"],
    archetypeProblem: "Number of Connected Components & Redundant Connection",
    archetypeQuestionId: 'vault-number-connected-components',
    timeComplexity: 'O(α(N)) amortized O(1)',
    spaceComplexity: 'O(N)',
    frequencyInInterviews: 'High',
    whenToUse: "Graph connectivity when edges are given dynamically and shortest path weights are not required.",
    keyPitfalls: ["Missing path compression in find(x): parent[x] = find(parent[x])", "Comparing elements instead of their root representatives find(x) == find(y)", "Handling 1-indexed vs 0-indexed vertex labeling"],
    templateCodes: {
      "java": "class DSU {\n    int[] parent, rank;\n    public DSU(int n) {\n        parent = new int[n]; rank = new int[n];\n        for (int i = 0; i < n; i++) parent[i] = i;\n    }\n    public int find(int x) {\n        if (parent[x] != x) parent[x] = find(parent[x]); // Path compression\n        return parent[x];\n    }\n    public boolean union(int x, int y) {\n        int rootX = find(x), rootY = find(y);\n        if (rootX == rootY) return false; // Cycle detected\n        if (rank[rootX] < rank[rootY]) parent[rootX] = rootY;\n        else if (rank[rootX] > rank[rootY]) parent[rootY] = rootX;\n        else { parent[rootY] = rootX; rank[rootX]++; }\n        return true;\n    }\n}",
      "cpp": "class DSU {\n    std::vector<int> parent, rank;\npublic:\n    DSU(int n) : parent(n), rank(n, 0) {\n        for (int i = 0; i < n; ++i) parent[i] = i;\n    }\n    int find(int x) {\n        if (parent[x] != x) parent[x] = find(parent[x]);\n        return parent[x];\n    }\n    bool unionSets(int x, int y) {\n        int rootX = find(x), rootY = find(y);\n        if (rootX == rootY) return false;\n        if (rank[rootX] < rank[rootY]) parent[rootX] = rootY;\n        else if (rank[rootX] > rank[rootY]) parent[rootY] = rootX;\n        else { parent[rootY] = rootX; rank[rootX]++; }\n        return true;\n    }\n};",
      "python": "class DSU:\n    def __init__(self, n: int):\n        self.parent = list(range(n))\n        self.rank = [0] * n\n    def find(self, x: int) -> int:\n        if self.parent[x] != x:\n            self.parent[x] = self.find(self.parent[x]) # Path compression\n        return self.parent[x]\n    def union(self, x: int, y: int) -> bool:\n        root_x, root_y = self.find(x), self.find(y)\n        if root_x == root_y:\n            return False\n        if self.rank[root_x] < self.rank[root_y]:\n            self.parent[root_x] = root_y\n        elif self.rank[root_x] > self.rank[root_y]:\n            self.parent[root_y] = root_x\n        else:\n            self.parent[root_y] = root_x\n            self.rank[root_x] += 1\n        return True",
      "javascript": "class DSU {\n  constructor(n) {\n    this.parent = Array.from({ length: n }, (_, i) => i);\n    this.rank = new Array(n).fill(0);\n  }\n  find(x) {\n    if (this.parent[x] !== x) {\n      this.parent[x] = this.find(this.parent[x]);\n    }\n    return this.parent[x];\n  }\n  union(x, y) {\n    const rootX = this.find(x), rootY = this.find(y);\n    if (rootX === rootY) return false;\n    if (this.rank[rootX] < this.rank[rootY]) this.parent[rootX] = rootY;\n    else if (this.rank[rootX] > this.rank[rootY]) this.parent[rootY] = rootX;\n    else { this.parent[rootY] = rootX; this.rank[rootX]++; }\n    return true;\n  }\n}"
}
  },
  {
    id: 'bit-manipulation',
    name: "Bitwise Operators & Bitmasking",
    emoji: '⚡01',
    oneLiner: "Execute lightning-fast boolean operations, XOR cancelation, and compact exponential state tracking.",
    identifyingCues: ["Single number where all other numbers appear twice (XOR cancellation: x ^ x = 0)", "Counting set bits (Brian Kernighan's n & (n-1))", "Small N (N <= 20) subset states represented as integer bitmasks"],
    archetypeProblem: "Single Number, Counting Bits, & Subsets via Bitmask",
    archetypeQuestionId: 'vault-single-number',
    timeComplexity: 'O(1) to O(N)',
    spaceComplexity: 'O(1)',
    frequencyInInterviews: 'High',
    whenToUse: "Space-constrained problems, parity checking, power of two verification (n > 0 && (n & (n-1)) == 0).",
    keyPitfalls: ["Operator precedence: (x & 1) == 1 requires parentheses because == binds tighter than &", "Sign bit propagation with >> vs >>> in signed languages", "Integer overflow when shifting 1 << 31 in signed 32-bit types"],
    templateCodes: {
      "java": "public int singleNumber(int[] nums) {\n    int xor = 0;\n    for (int num : nums) {\n        xor ^= num; // Same numbers cancel out: a ^ a = 0\n    }\n    return xor;\n}",
      "cpp": "int singleNumber(const std::vector<int>& nums) {\n    int xorVal = 0;\n    for (int num : nums) {\n        xorVal ^= num;\n    }\n    return xorVal;\n}",
      "python": "def single_number(nums: list[int]) -> int:\n    xor_val = 0\n    for num in nums:\n        xor_val ^= num\n    return xor_val",
      "javascript": "function singleNumber(nums) {\n  let xor = 0;\n  for (const num of nums) {\n    xor ^= num;\n  }\n  return xor;\n}"
}
  }
];
