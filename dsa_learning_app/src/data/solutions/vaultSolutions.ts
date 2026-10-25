import { ProblemSolution } from '../../types/dsa';

export const VAULT_SOLUTIONS: Record<string, ProblemSolution> = {
  'vault-two-sum': {
    questionId: 'vault-two-sum',
    pattern: 'Hash Map / Complement Lookup',
    intuition: [
      'The brute force checks all pairs (i, j) with nested loops taking O(N²) time.',
      'To achieve O(N), we observe that for every number x, its required partner is target - x.',
      'We can look up this complement in O(1) time by storing previous numbers and their indices in a hash map as we iterate.'
    ],
    pseudocode: [
      'Initialize map = {}',
      'For i from 0 to nums.length - 1:',
      '  complement = target - nums[i]',
      '  if complement in map: return [map[complement], i]',
      '  map[nums[i]] = i',
      'return []'
    ],
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(N)',
    complexityExplanation: 'We traverse the list containing N elements exactly once. Each hash map lookup and insertion takes O(1) average time. Hash map uses O(N) extra space.',
    edgeCases: ['Array with negative numbers', 'Target that requires two identical numbers (e.g., [3, 3] target 6)', 'Minimal array length of 2'],
    approaches: {
      brute: {
        name: 'Brute Force (Nested Loops)',
        tier: 'brute',
        badge: '🥉 Brute Force',
        intuition: ['Check every possible pair (i, j) with i < j and see if nums[i] + nums[j] == target.'],
        timeComplexity: 'O(N²)',
        spaceComplexity: 'O(1)',
        complexityExplanation: 'Double loop checks N*(N-1)/2 pairs in worst case.',
        code: {
          cpp: `vector<int> twoSum(vector<int>& nums, int target) {
    int n = nums.size();
    for (int i = 0; i < n; i++) {
        for (int j = i + 1; j < n; j++) {
            if (nums[i] + nums[j] == target) return {i, j};
        }
    }
    return {};
}`,
          java: `public int[] twoSum(int[] nums, int target) {
    for (int i = 0; i < nums.length; i++) {
        for (int j = i + 1; j < nums.length; j++) {
            if (nums[i] + nums[j] == target) return new int[]{i, j};
        }
    }
    return new int[]{};
}`,
          python: `def twoSum(nums: list[int], target: int) -> list[int]:
    n = len(nums)
    for i in range(n):
        for j in range(i + 1, n):
            if nums[i] + nums[j] == target:
                return [i, j]
    return []`,
          javascript: `function twoSum(nums, target) {
    for (let i = 0; i < nums.length; i++) {
        for (let j = i + 1; j < nums.length; j++) {
            if (nums[i] + nums[j] === target) return [i, j];
        }
    }
    return [];
}`
        }
      },
      optimal: {
        name: 'Single Pass Hash Map',
        tier: 'optimal',
        badge: '⚡ Optimal (Single Pass)',
        intuition: [
          'Trade space for time: maintain a hash map mapping number to index.',
          'Before inserting nums[i], check if target - nums[i] already exists in the map.'
        ],
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(N)',
        complexityExplanation: 'Single pass through array of N elements with O(1) hash map operations.',
        code: {
          cpp: `vector<int> twoSum(vector<int>& nums, int target) {
    unordered_map<int, int> seen;
    for (int i = 0; i < (int)nums.size(); i++) {
        int complement = target - nums[i];
        if (seen.count(complement)) {
            return {seen[complement], i};
        }
        seen[nums[i]] = i;
    }
    return {};
}`,
          java: `public int[] twoSum(int[] nums, int target) {
    Map<Integer, Integer> map = new HashMap<>();
    for (int i = 0; i < nums.length; i++) {
        int complement = target - nums[i];
        if (map.containsKey(complement)) {
            return new int[]{map.get(complement), i};
        }
        map.put(nums[i], i);
    }
    return new int[]{};
}`,
          python: `def twoSum(nums: list[int], target: int) -> list[int]:
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []`,
          javascript: `function twoSum(nums, target) {
    const seen = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (seen.has(complement)) {
            return [seen.get(complement), i];
        }
        seen.set(nums[i], i);
    }
    return [];
}`
        }
      }
    },
    code: {
      cpp: `vector<int> twoSum(vector<int>& nums, int target) {
    unordered_map<int, int> seen;
    for (int i = 0; i < (int)nums.size(); i++) {
        int complement = target - nums[i];
        if (seen.count(complement)) return {seen[complement], i};
        seen[nums[i]] = i;
    }
    return {};
}`,
      java: `public int[] twoSum(int[] nums, int target) {
    Map<Integer, Integer> map = new HashMap<>();
    for (int i = 0; i < nums.length; i++) {
        int complement = target - nums[i];
        if (map.containsKey(complement)) return new int[]{map.get(complement), i};
        map.put(nums[i], i);
    }
    return new int[]{};
}`,
      python: `def twoSum(nums: list[int], target: int) -> list[int]:
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []`,
      javascript: `function twoSum(nums, target) {
    const seen = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (seen.has(complement)) return [seen.get(complement), i];
        seen.set(nums[i], i);
    }
    return [];
}`
    }
  },

  'vault-3sum': {
    questionId: 'vault-3sum',
    pattern: 'Two Pointers (Inward Converging)',
    intuition: [
      'Sorting allows us to fix one element and turn the remaining subproblem into Two Sum II on a sorted array.',
      'To prevent duplicate triplets, skip elements identical to their immediate predecessors.',
      'If sum < 0, advance left pointer to increase sum; if sum > 0, decrement right pointer.'
    ],
    pseudocode: [
      'Sort nums ascending',
      'For i from 0 to n - 3:',
      '  if i > 0 and nums[i] == nums[i-1]: continue',
      '  left = i + 1, right = n - 1',
      '  while left < right:',
      '    sum = nums[i] + nums[left] + nums[right]',
      '    if sum == 0: add triplet, skip duplicate left/right, left++, right--',
      '    else if sum < 0: left++',
      '    else: right--'
    ],
    timeComplexity: 'O(N²)',
    spaceComplexity: 'O(1) auxiliary (or O(N) for sorting recursion stack)',
    complexityExplanation: 'Sorting takes O(N log N). The outer loop runs N times and inner two-pointer sweep takes O(N), yielding O(N²).',
    edgeCases: ['Array with fewer than 3 elements', 'All zeros [0, 0, 0, 0]', 'No triplets summing to zero'],
    approaches: {
      optimal: {
        name: 'Sorted + Two Pointers',
        tier: 'optimal',
        badge: '⚡ Optimal Two-Pointer',
        intuition: ['Sort array to enable monotonic two-pointer convergence and easy duplicate deduplication.'],
        timeComplexity: 'O(N²)',
        spaceComplexity: 'O(1) extra space',
        complexityExplanation: 'O(N log N) sort + N * O(N) two-pointer scans = O(N²).',
        code: {
          cpp: `vector<vector<int>> threeSum(vector<int>& nums) {
    sort(nums.begin(), nums.end());
    vector<vector<int>> res;
    int n = nums.size();
    for (int i = 0; i < n - 2; i++) {
        if (i > 0 && nums[i] == nums[i - 1]) continue;
        if (nums[i] > 0) break; // impossible to sum to 0
        int left = i + 1, right = n - 1;
        while (left < right) {
            int sum = nums[i] + nums[left] + nums[right];
            if (sum == 0) {
                res.push_back({nums[i], nums[left], nums[right]});
                while (left < right && nums[left] == nums[left + 1]) left++;
                while (left < right && nums[right] == nums[right - 1]) right--;
                left++; right--;
            } else if (sum < 0) {
                left++;
            } else {
                right--;
            }
        }
    }
    return res;
}`,
          java: `public List<List<Integer>> threeSum(int[] nums) {
    Arrays.sort(nums);
    List<List<Integer>> res = new ArrayList<>();
    int n = nums.length;
    for (int i = 0; i < n - 2; i++) {
        if (i > 0 && nums[i] == nums[i - 1]) continue;
        if (nums[i] > 0) break;
        int left = i + 1, right = n - 1;
        while (left < right) {
            int sum = nums[i] + nums[left] + nums[right];
            if (sum == 0) {
                res.add(Arrays.asList(nums[i], nums[left], nums[right]));
                while (left < right && nums[left] == nums[left + 1]) left++;
                while (left < right && nums[right] == nums[right - 1]) right--;
                left++; right--;
            } else if (sum < 0) {
                left++;
            } else {
                right--;
            }
        }
    }
    return res;
}`,
          python: `def threeSum(nums: list[int]) -> list[list[int]]:
    nums.sort()
    res = []
    n = len(nums)
    for i in range(n - 2):
        if i > 0 and nums[i] == nums[i - 1]:
            continue
        if nums[i] > 0:
            break
        left, right = i + 1, n - 1
        while left < right:
            s = nums[i] + nums[left] + nums[right]
            if s == 0:
                res.append([nums[i], nums[left], nums[right]])
                while left < right and nums[left] == nums[left + 1]:
                    left += 1
                while left < right and nums[right] == nums[right - 1]:
                    right -= 1
                left += 1
                right -= 1
            elif s < 0:
                left += 1
            else:
                right -= 1
    return res`,
          javascript: `function threeSum(nums) {
    nums.sort((a, b) => a - b);
    const res = [];
    const n = nums.length;
    for (let i = 0; i < n - 2; i++) {
        if (i > 0 && nums[i] === nums[i - 1]) continue;
        if (nums[i] > 0) break;
        let left = i + 1, right = n - 1;
        while (left < right) {
            const sum = nums[i] + nums[left] + nums[right];
            if (sum === 0) {
                res.push([nums[i], nums[left], nums[right]]);
                while (left < right && nums[left] === nums[left + 1]) left++;
                while (left < right && nums[right] === nums[right - 1]) right--;
                left++; right--;
            } else if (sum < 0) {
                left++;
            } else {
                right--;
            }
        }
    }
    return res;
}`
        }
      }
    },
    code: {
      cpp: `vector<vector<int>> threeSum(vector<int>& nums) {
    sort(nums.begin(), nums.end());
    vector<vector<int>> res;
    for (int i = 0; i < (int)nums.size() - 2; i++) {
        if (i > 0 && nums[i] == nums[i - 1]) continue;
        int left = i + 1, right = nums.size() - 1;
        while (left < right) {
            int sum = nums[i] + nums[left] + nums[right];
            if (sum == 0) {
                res.push_back({nums[i], nums[left], nums[right]});
                while (left < right && nums[left] == nums[left + 1]) left++;
                while (left < right && nums[right] == nums[right - 1]) right--;
                left++; right--;
            } else if (sum < 0) left++;
            else right--;
        }
    }
    return res;
}`,
      java: `public List<List<Integer>> threeSum(int[] nums) {
    Arrays.sort(nums);
    List<List<Integer>> res = new ArrayList<>();
    for (int i = 0; i < nums.length - 2; i++) {
        if (i > 0 && nums[i] == nums[i - 1]) continue;
        int left = i + 1, right = nums.length - 1;
        while (left < right) {
            int sum = nums[i] + nums[left] + nums[right];
            if (sum == 0) {
                res.add(Arrays.asList(nums[i], nums[left], nums[right]));
                while (left < right && nums[left] == nums[left + 1]) left++;
                while (left < right && nums[right] == nums[right - 1]) right--;
                left++; right--;
            } else if (sum < 0) left++;
            else right--;
        }
    }
    return res;
}`,
      python: `def threeSum(nums: list[int]) -> list[list[int]]:
    nums.sort()
    res = []
    for i in range(len(nums) - 2):
        if i > 0 and nums[i] == nums[i - 1]:
            continue
        left, right = i + 1, len(nums) - 1
        while left < right:
            s = nums[i] + nums[left] + nums[right]
            if s == 0:
                res.append([nums[i], nums[left], nums[right]])
                while left < right and nums[left] == nums[left + 1]: left += 1
                while left < right and nums[right] == nums[right - 1]: right -= 1
                left += 1; right -= 1
            elif s < 0: left += 1
            else: right -= 1
    return res`,
      javascript: `function threeSum(nums) {
    nums.sort((a, b) => a - b);
    const res = [];
    for (let i = 0; i < nums.length - 2; i++) {
        if (i > 0 && nums[i] === nums[i - 1]) continue;
        let left = i + 1, right = nums.length - 1;
        while (left < right) {
            const sum = nums[i] + nums[left] + nums[right];
            if (sum === 0) {
                res.push([nums[i], nums[left], nums[right]]);
                while (left < right && nums[left] === nums[left + 1]) left++;
                while (left < right && nums[right] === nums[right - 1]) right--;
                left++; right--;
            } else if (sum < 0) left++;
            else right--;
        }
    }
    return res;
}`
    }
  },

  'vault-trapping-rain-water': {
    questionId: 'vault-trapping-rain-water',
    pattern: 'Two Pointers (Inward Max Bounding)',
    intuition: [
      'The water level trapped above bar i is dictated strictly by min(maxLeft, maxRight) - height[i].',
      'Instead of precalculating prefix and suffix max arrays in O(N) space, two pointers left=0 and right=n-1 can compute it in O(1) space.',
      'If leftMax < rightMax, the bottleneck for the left pointer is definitely leftMax, regardless of future bars. Hence we can safely calculate trapped water at left and increment it.'
    ],
    pseudocode: [
      'left = 0, right = n - 1',
      'leftMax = 0, rightMax = 0, water = 0',
      'while left < right:',
      '  if height[left] < height[right]:',
      '    if height[left] >= leftMax: leftMax = height[left]',
      '    else: water += leftMax - height[left]',
      '    left++',
      '  else:',
      '    if height[right] >= rightMax: rightMax = height[right]',
      '    else: water += rightMax - height[right]',
      '    right--',
      'return water'
    ],
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(1)',
    complexityExplanation: 'Single pass with two pointers visiting each bar exactly once without auxiliary arrays.',
    edgeCases: ['Array with fewer than 3 bars (cannot trap water)', 'Monotonically increasing or decreasing heights', 'All bars equal height'],
    code: {
      cpp: `int trap(vector<int>& height) {
    int left = 0, right = height.size() - 1;
    int leftMax = 0, rightMax = 0, totalWater = 0;
    while (left < right) {
        if (height[left] < height[right]) {
            if (height[left] >= leftMax) leftMax = height[left];
            else totalWater += leftMax - height[left];
            left++;
        } else {
            if (height[right] >= rightMax) rightMax = height[right];
            else totalWater += rightMax - height[right];
            right--;
        }
    }
    return totalWater;
}`,
      java: `public int trap(int[] height) {
    int left = 0, right = height.length - 1;
    int leftMax = 0, rightMax = 0, totalWater = 0;
    while (left < right) {
        if (height[left] < height[right]) {
            if (height[left] >= leftMax) leftMax = height[left];
            else totalWater += leftMax - height[left];
            left++;
        } else {
            if (height[right] >= rightMax) rightMax = height[right];
            else totalWater += rightMax - height[right];
            right--;
        }
    }
    return totalWater;
}`,
      python: `def trap(height: list[int]) -> int:
    left, right = 0, len(height) - 1
    left_max, right_max = 0, 0
    water = 0
    while left < right:
        if height[left] < height[right]:
            if height[left] >= left_max:
                left_max = height[left]
            else:
                water += left_max - height[left]
            left += 1
        else:
            if height[right] >= right_max:
                right_max = height[right]
            else:
                water += right_max - height[right]
            right -= 1
    return water`,
      javascript: `function trap(height) {
    let left = 0, right = height.length - 1;
    let leftMax = 0, rightMax = 0, water = 0;
    while (left < right) {
        if (height[left] < height[right]) {
            if (height[left] >= leftMax) leftMax = height[left];
            else water += leftMax - height[left];
            left++;
        } else {
            if (height[right] >= rightMax) rightMax = height[right];
            else water += rightMax - height[right];
            right--;
        }
    }
    return water;
}`
    }
  },

  'vault-valid-parentheses': {
    questionId: 'vault-valid-parentheses',
    pattern: 'LIFO Stack',
    intuition: [
      'Every closing bracket must match the most recently seen opening bracket of the same type.',
      'A LIFO (Last In First Out) stack perfectly tracks open bracket history.',
      'A clean implementation trick is pushing the expected closing bracket when seeing an opener.'
    ],
    pseudocode: [
      'stack = []',
      'for char c in s:',
      '  if c == "(": stack.push(")")',
      '  else if c == "{": stack.push("}")',
      '  else if c == "[": stack.push("]")',
      '  else if stack is empty or stack.pop() != c: return false',
      'return stack.length == 0'
    ],
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(N)',
    complexityExplanation: 'Iterate over string of length N once. Stack stores at most N characters.',
    edgeCases: ['Single character string', 'String starting with closing bracket', 'Unmatched trailing openers e.g. "((("'],
    code: {
      cpp: `bool isValid(string s) {
    stack<char> st;
    for (char c : s) {
        if (c == '(') st.push(')');
        else if (c == '{') st.push('}');
        else if (c == '[') st.push(']');
        else {
            if (st.empty() || st.top() != c) return false;
            st.pop();
        }
    }
    return st.empty();
}`,
      java: `public boolean isValid(String s) {
    Deque<Character> stack = new ArrayDeque<>();
    for (char c : s.toCharArray()) {
        if (c == '(') stack.push(')');
        else if (c == '{') stack.push('}');
        else if (c == '[') stack.push(']');
        else if (stack.isEmpty() || stack.pop() != c) return false;
    }
    return stack.isEmpty();
}`,
      python: `def isValid(s: str) -> bool:
    stack = []
    mapping = {')': '(', '}': '{', ']': '['}
    for char in s:
        if char in mapping:
            if not stack or stack[-1] != mapping[char]:
                return False
            stack.pop()
        else:
            stack.append(char)
    return len(stack) == 0`,
      javascript: `function isValid(s) {
    const stack = [];
    for (const c of s) {
        if (c === '(') stack.push(')');
        else if (c === '{') stack.push('}');
        else if (c === '[') stack.push(']');
        else if (stack.length === 0 || stack.pop() !== c) return false;
    }
    return stack.length === 0;
}`
    }
  },

  'vault-lru-cache': {
    questionId: 'vault-lru-cache',
    pattern: 'Hash Map + Doubly Linked List',
    intuition: [
      'To achieve O(1) for both get and put operations, we combine two data structures:',
      '1. Hash Map provides O(1) key-to-node lookup.',
      '2. Doubly Linked List provides O(1) node deletion and insertion at the most-recently-used head.',
      'Using dummy head and tail sentinel nodes eliminates annoying null pointer boundary checks.'
    ],
    pseudocode: [
      'Node: key, val, prev, next',
      'get(key): if key exists in map, removeNode(node), insertAtHead(node), return node.val; else return -1',
      'put(key, value):',
      '  if key in map: removeNode(node)',
      '  node = new Node(key, value); insertAtHead(node); map[key] = node',
      '  if map.size > capacity: lru = tail.prev; removeNode(lru); delete map[lru.key]'
    ],
    timeComplexity: 'O(1) for both get() and put()',
    spaceComplexity: 'O(Capacity)',
    complexityExplanation: 'Map and doubly linked list both store at most Capacity nodes at any time.',
    edgeCases: ['Capacity = 1', 'Updating value of existing key without increasing size', 'Eviction when capacity exceeded'],
    code: {
      cpp: `class LRUCache {
    struct Node {
        int key, val;
        Node *prev, *next;
        Node(int k, int v) : key(k), val(v), prev(nullptr), next(nullptr) {}
    };
    int cap;
    unordered_map<int, Node*> map;
    Node *head, *tail;
    
    void removeNode(Node* node) {
        node->prev->next = node->next;
        node->next->prev = node->prev;
    }
    void addToHead(Node* node) {
        node->next = head->next;
        node->prev = head;
        head->next->prev = node;
        head->next = node;
    }
public:
    LRUCache(int capacity) : cap(capacity) {
        head = new Node(0, 0);
        tail = new Node(0, 0);
        head->next = tail;
        tail->prev = head;
    }
    int get(int key) {
        if (!map.count(key)) return -1;
        Node* node = map[key];
        removeNode(node);
        addToHead(node);
        return node->val;
    }
    void put(int key, int value) {
        if (map.count(key)) {
            removeNode(map[key]);
            delete map[key];
        } else if ((int)map.size() >= cap) {
            Node* lru = tail->prev;
            removeNode(lru);
            map.erase(lru->key);
            delete lru;
        }
        Node* newNode = new Node(key, value);
        addToHead(newNode);
        map[key] = newNode;
    }
};`,
      java: `class LRUCache {
    class Node {
        int key, val;
        Node prev, next;
        Node(int k, int v) { key = k; val = v; }
    }
    private final int capacity;
    private final Map<Integer, Node> map = new HashMap<>();
    private final Node head = new Node(0, 0);
    private final Node tail = new Node(0, 0);

    public LRUCache(int capacity) {
        this.capacity = capacity;
        head.next = tail;
        tail.prev = head;
    }
    private void remove(Node node) {
        node.prev.next = node.next;
        node.next.prev = node.prev;
    }
    private void add(Node node) {
        node.next = head.next;
        node.prev = head;
        head.next.prev = node;
        head.next = node;
    }
    public int get(int key) {
        Node node = map.get(key);
        if (node == null) return -1;
        remove(node);
        add(node);
        return node.val;
    }
    public void put(int key, int value) {
        Node existing = map.get(key);
        if (existing != null) remove(existing);
        else if (map.size() >= capacity) {
            Node lru = tail.prev;
            remove(lru);
            map.remove(lru.key);
        }
        Node fresh = new Node(key, value);
        add(fresh);
        map.put(key, fresh);
    }
}`,
      python: `class Node:
    def __init__(self, key=0, val=0):
        self.key, self.val = key, val
        self.prev = self.next = None

class LRUCache:
    def __init__(self, capacity: int):
        self.cap = capacity
        self.cache = {}
        self.head, self.tail = Node(), Node()
        self.head.next, self.tail.prev = self.tail, self.head

    def _remove(self, node: Node):
        node.prev.next = node.next
        node.next.prev = node.prev

    def _add(self, node: Node):
        node.next = self.head.next
        node.prev = self.head
        self.head.next.prev = node
        self.head.next = node

    def get(self, key: int) -> int:
        if key not in self.cache:
            return -1
        node = self.cache[key]
        self._remove(node)
        self._add(node)
        return node.val

    def put(self, key: int, value: int) -> None:
        if key in self.cache:
            self._remove(self.cache[key])
        elif len(self.cache) >= self.cap:
            lru = self.tail.prev
            self._remove(lru)
            del self.cache[lru.key]
        new_node = Node(key, value)
        self._add(new_node)
        self.cache[key] = new_node`,
      javascript: `class LRUCache {
    constructor(capacity) {
        this.capacity = capacity;
        this.map = new Map();
        this.head = { key: 0, val: 0, prev: null, next: null };
        this.tail = { key: 0, val: 0, prev: null, next: null };
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }
    _remove(node) {
        node.prev.next = node.next;
        node.next.prev = node.prev;
    }
    _add(node) {
        node.next = this.head.next;
        node.prev = this.head;
        this.head.next.prev = node;
        this.head.next = node;
    }
    get(key) {
        if (!this.map.has(key)) return -1;
        const node = this.map.get(key);
        this._remove(node);
        this._add(node);
        return node.val;
    }
    put(key, value) {
        if (this.map.has(key)) {
            this._remove(this.map.get(key));
        } else if (this.map.size >= this.capacity) {
            const lru = this.tail.prev;
            this._remove(lru);
            this.map.delete(lru.key);
        }
        const node = { key, val: value, prev: null, next: null };
        this._add(node);
        this.map.set(key, node);
    }
}`
    }
  },

  'vault-course-schedule': {
    questionId: 'vault-course-schedule',
    pattern: 'Topological Sort (Kahn\'s BFS)',
    intuition: [
      'Prerequisites define directed edges: [a, b] means b -> a (must take b before a).',
      'A cycle in directed graph means impossible dependencies (deadlock).',
      'Kahn\'s algorithm processes nodes with in-degree 0 (no prerequisites). When a node is taken, decrement neighbor in-degrees.',
      'If total nodes processed == numCourses, a valid topological order exists.'
    ],
    pseudocode: [
      'Build adj = [[] * numCourses], inDegree = [0 * numCourses]',
      'For [course, prereq] in prerequisites:',
      '  adj[prereq].push(course), inDegree[course]++',
      'Queue = all courses with inDegree == 0',
      'processed = 0',
      'while queue not empty:',
      '  curr = queue.pop()',
      '  processed++',
      '  for next in adj[curr]:',
      '    inDegree[next]--',
      '    if inDegree[next] == 0: queue.push(next)',
      'return processed == numCourses'
    ],
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V + E)',
    complexityExplanation: 'Building adjacency list visits all E edges. BFS visits each of the V vertices and E edges once.',
    edgeCases: ['No prerequisites (prerequisites is empty)', 'Self-dependency [0, 0]', 'Disconnected graph components'],
    code: {
      cpp: `bool canFinish(int numCourses, vector<vector<int>>& prerequisites) {
    vector<int> inDegree(numCourses, 0);
    vector<vector<int>> adj(numCourses);
    for (auto& p : prerequisites) {
        adj[p[1]].push_back(p[0]);
        inDegree[p[0]]++;
    }
    queue<int> q;
    for (int i = 0; i < numCourses; i++) {
        if (inDegree[i] == 0) q.push(i);
    }
    int count = 0;
    while (!q.empty()) {
        int u = q.front(); q.pop();
        count++;
        for (int v : adj[u]) {
            if (--inDegree[v] == 0) q.push(v);
        }
    }
    return count == numCourses;
}`,
      java: `public boolean canFinish(int numCourses, int[][] prerequisites) {
    int[] inDegree = new int[numCourses];
    List<List<Integer>> adj = new ArrayList<>();
    for (int i = 0; i < numCourses; i++) adj.add(new ArrayList<>());
    for (int[] p : prerequisites) {
        adj.get(p[1]).add(p[0]);
        inDegree[p[0]]++;
    }
    Queue<Integer> q = new LinkedList<>();
    for (int i = 0; i < numCourses; i++) {
        if (inDegree[i] == 0) q.offer(i);
    }
    int count = 0;
    while (!q.isEmpty()) {
        int u = q.poll();
        count++;
        for (int v : adj.get(u)) {
            if (--inDegree[v] == 0) q.offer(v);
        }
    }
    return count == numCourses;
}`,
      python: `def canFinish(numCourses: int, prerequisites: list[list[int]]) -> bool:
    in_degree = [0] * numCourses
    adj = [[] for _ in range(numCourses)]
    for course, prereq in prerequisites:
        adj[prereq].append(course)
        in_degree[course] += 1
    
    queue = [i for i in range(numCourses) if in_degree[i] == 0]
    count = 0
    while queue:
        u = queue.pop(0)
        count += 1
        for v in adj[u]:
            in_degree[v] -= 1
            if in_degree[v] == 0:
                queue.append(v)
    return count == numCourses`,
      javascript: `function canFinish(numCourses, prerequisites) {
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
        const u = queue.shift();
        count++;
        for (const v of adj[u]) {
            inDegree[v]--;
            if (inDegree[v] === 0) queue.push(v);
        }
    }
    return count === numCourses;
}`
    }
  },

  'vault-coin-change': {
    questionId: 'vault-coin-change',
    pattern: 'Unbounded Knapsack DP',
    intuition: [
      'To make amount X, we can take any coin c (where c <= X) and add 1 to the minimum coins needed for (X - c).',
      'Optimal Substructure: dp[x] = min(dp[x], dp[x - coin] + 1).',
      'Initialize dp array of size amount + 1 with Infinity, set dp[0] = 0.'
    ],
    pseudocode: [
      'dp = [Infinity * (amount + 1)]',
      'dp[0] = 0',
      'for coin in coins:',
      '  for x from coin to amount:',
      '    dp[x] = min(dp[x], dp[x - coin] + 1)',
      'return dp[amount] == Infinity ? -1 : dp[amount]'
    ],
    timeComplexity: 'O(Amount * Coins.length)',
    spaceComplexity: 'O(Amount)',
    complexityExplanation: 'We compute dp values from 1 to Amount for each available coin denomination.',
    edgeCases: ['Amount = 0 (returns 0)', 'Amount cannot be formed (returns -1)', 'Coin values larger than Amount'],
    code: {
      cpp: `int coinChange(vector<int>& coins, int amount) {
    vector<int> dp(amount + 1, amount + 1);
    dp[0] = 0;
    for (int coin : coins) {
        for (int x = coin; x <= amount; x++) {
            dp[x] = min(dp[x], dp[x - coin] + 1);
        }
    }
    return dp[amount] > amount ? -1 : dp[amount];
}`,
      java: `public int coinChange(int[] coins, int amount) {
    int[] dp = new int[amount + 1];
    Arrays.fill(dp, amount + 1);
    dp[0] = 0;
    for (int coin : coins) {
        for (int x = coin; x <= amount; x++) {
            dp[x] = Math.min(dp[x], dp[x - coin] + 1);
        }
    }
    return dp[amount] > amount ? -1 : dp[amount];
}`,
      python: `def coinChange(coins: list[int], amount: int) -> int:
    dp = [float('inf')] * (amount + 1)
    dp[0] = 0
    for coin in coins:
        for x in range(coin, amount + 1):
            dp[x] = min(dp[x], dp[x - coin] + 1)
    return dp[amount] if dp[amount] != float('inf') else -1`,
      javascript: `function coinChange(coins, amount) {
    const dp = new Array(amount + 1).fill(Infinity);
    dp[0] = 0;
    for (const coin of coins) {
        for (let x = coin; x <= amount; x++) {
            dp[x] = Math.min(dp[x], dp[x - coin] + 1);
        }
    }
    return dp[amount] === Infinity ? -1 : dp[amount];
}`
    }
  }
};
