export interface PatternDetail {
  id: string;
  name: string;
  badge: string;
  whenToUse: string;
  timeComplexity: string;
  spaceComplexity: string;
  explanation: string;
  keyTakeaways?: string[];
  practiceQuestionId?: string;
  practiceTitle?: string;
  solutions: {
    cpp: string;
    java: string;
    python: string;
    javascript: string;
  };
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
  // ================= 1. ARRAYS & TWO POINTERS =================
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
    recommendedGameId: 'two-pointer',
    patterns: [
      {
        id: 'two-pointers-opposite',
        name: 'Two Pointers (Opposite Direction)',
        badge: 'O(N) Time, O(1) Space',
        whenToUse: 'Sorted arrays, pair sum targets (Two Sum II), palindrome checks, reversing arrays in-place.',
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(1)',
        explanation: 'Initialize left pointer at index 0 and right pointer at index N-1. Move left rightward to increase value or right leftward to decrease value until they meet.',
        keyTakeaways: [
          'Requires sorted array or symmetric property',
          'Eliminates need for nested O(N^2) loops',
          'Guaranteed to terminate in N/2 iterations'
        ],
        practiceQuestionId: 'arr-1',
        practiceTitle: 'Reverse the Array / Two Sum II',
        solutions: {
          cpp: `// C++: Two Pointers (Opposite Direction)
#include <vector>

std::vector<int> twoSumSorted(const std::vector<int>& numbers, int target) {
    int left = 0, right = numbers.size() - 1;
    while (left < right) {
        int currentSum = numbers[left] + numbers[right];
        if (currentSum == target) {
            return {left + 1, right + 1}; // 1-indexed
        } else if (currentSum < target) {
            left++; // Need larger sum
        } else {
            right--; // Need smaller sum
        }
    }
    return {};
}`,
          java: `// Java: Two Pointers (Opposite Direction)
public class Solution {
    public int[] twoSumSorted(int[] numbers, int target) {
        int left = 0, right = numbers.length - 1;
        while (left < right) {
            int sum = numbers[left] + numbers[right];
            if (sum == target) {
                return new int[]{left + 1, right + 1};
            } else if (sum < target) {
                left++;
            } else {
                right--;
            }
        }
        return new int[]{};
    }
}`,
          python: `# Python: Two Pointers (Opposite Direction)
def two_sum_sorted(numbers: list[int], target: int) -> list[int]:
    left, right = 0, len(numbers) - 1
    while left < right:
        curr_sum = numbers[left] + numbers[right]
        if curr_sum == target:
            return [left + 1, right + 1]
        elif curr_sum < target:
            left += 1
        else:
            right -= 1
    return []`,
          javascript: `// JavaScript: Two Pointers (Opposite Direction)
function twoSumSorted(numbers, target) {
  let left = 0, right = numbers.length - 1;
  while (left < right) {
    const sum = numbers[left] + numbers[right];
    if (sum === target) return [left + 1, right + 1];
    if (sum < target) left++;
    else right--;
  }
  return [];
}`
        }
      },
      {
        id: 'kadane-algorithm',
        name: "Kadane's Algorithm (Max Subarray Sum)",
        badge: 'Dynamic Subarray Optimizer',
        whenToUse: 'Finding contiguous subarray with the maximum sum in linear O(N) time.',
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(1)',
        explanation: 'At each element, decide whether to extend the running subarray sum or start fresh from the current element if the running sum drops below zero.',
        keyTakeaways: [
          'currentMax = max(nums[i], currentMax + nums[i])',
          'Keep running tracker of overall maxSoFar',
          'Handles negative arrays by tracking single largest element'
        ],
        practiceQuestionId: 'arr-8',
        practiceTitle: "Find Largest Contiguous Subarray Sum (Kadane's)",
        solutions: {
          cpp: `// C++: Kadane's Algorithm
#include <vector>
#include <algorithm>

int maxSubArray(const std::vector<int>& nums) {
    int maxSoFar = nums[0];
    int currentMax = nums[0];
    for (size_t i = 1; i < nums.size(); i++) {
        currentMax = std::max(nums[i], currentMax + nums[i]);
        maxSoFar = std::max(maxSoFar, currentMax);
    }
    return maxSoFar;
}`,
          java: `// Java: Kadane's Algorithm
public class Solution {
    public int maxSubArray(int[] nums) {
        int maxSoFar = nums[0];
        int currentMax = nums[0];
        for (int i = 1; i < nums.length; i++) {
            currentMax = Math.max(nums[i], currentMax + nums[i]);
            maxSoFar = Math.max(maxSoFar, currentMax);
        }
        return maxSoFar;
    }
}`,
          python: `# Python: Kadane's Algorithm
def max_sub_array(nums: list[int]) -> int:
    max_so_far = nums[0]
    current_max = nums[0]
    for num in nums[1:]:
        current_max = max(num, current_max + num)
        max_so_far = max(max_so_far, current_max)
    return max_so_far`,
          javascript: `// JavaScript: Kadane's Algorithm
function maxSubArray(nums) {
  let maxSoFar = nums[0];
  let currentMax = nums[0];
  for (let i = 1; i < nums.length; i++) {
    currentMax = Math.max(nums[i], currentMax + nums[i]);
    maxSoFar = Math.max(maxSoFar, currentMax);
  }
  return maxSoFar;
}`
        }
      },
      {
        id: 'sliding-window-dynamic',
        name: 'Sliding Window (Dynamic & Fixed)',
        badge: 'Contiguous Range Optimizer',
        whenToUse: 'Substrings or subarrays matching constraints (e.g. longest substring without repeating characters, minimum window substring).',
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(K) where K is unique elements',
        explanation: 'Expand the right boundary until the window matches the constraint, then shrink the left boundary to find the optimal subarray.',
        keyTakeaways: [
          'Both left and right pointers only move forward (amortized O(2N) = O(N))',
          'Use hash map or frequency array to validate window constraints'
        ],
        practiceQuestionId: 'str-3',
        practiceTitle: 'Longest Substring Without Repeating Characters',
        solutions: {
          cpp: `// C++: Dynamic Sliding Window
#include <string>
#include <unordered_map>
#include <algorithm>

int lengthOfLongestSubstring(const std::string& s) {
    std::unordered_map<char, int> lastSeen;
    int maxLen = 0, left = 0;
    for (int right = 0; right < s.length(); right++) {
        char ch = s[right];
        if (lastSeen.count(ch) && lastSeen[ch] >= left) {
            left = lastSeen[ch] + 1; // Shrink window past duplicate
        }
        lastSeen[ch] = right;
        maxLen = std::max(maxLen, right - left + 1);
    }
    return maxLen;
}`,
          java: `// Java: Dynamic Sliding Window
import java.util.HashMap;

public class Solution {
    public int lengthOfLongestSubstring(String s) {
        HashMap<Character, Integer> lastSeen = new HashMap<>();
        int maxLen = 0, left = 0;
        for (int right = 0; right < s.length(); right++) {
            char ch = s.charAt(right);
            if (lastSeen.containsKey(ch) && lastSeen.get(ch) >= left) {
                left = lastSeen.get(ch) + 1;
            }
            lastSeen.put(ch, right);
            maxLen = Math.max(maxLen, right - left + 1);
        }
        return maxLen;
    }
}`,
          python: `# Python: Dynamic Sliding Window
def length_of_longest_substring(s: str) -> int:
    last_seen = {}
    max_len = 0
    left = 0
    for right, ch in enumerate(s):
        if ch in last_seen and last_seen[ch] >= left:
            left = last_seen[ch] + 1
        last_seen[ch] = right
        max_len = max(max_len, right - left + 1)
    return max_len`,
          javascript: `// JavaScript: Dynamic Sliding Window
function lengthOfLongestSubstring(s) {
  const lastSeen = new Map();
  let maxLen = 0, left = 0;
  for (let right = 0; right < s.length; right++) {
    const ch = s[right];
    if (lastSeen.has(ch) && lastSeen.get(ch) >= left) {
      left = lastSeen.get(ch) + 1;
    }
    lastSeen.set(ch, right);
    maxLen = Math.max(maxLen, right - left + 1);
  }
  return maxLen;
}`
        }
      },
      {
        id: 'dutch-national-flag',
        name: 'Dutch National Flag (3-Way Partition)',
        badge: 'In-Place Partitioning O(1)',
        whenToUse: 'Sort array containing only 3 distinct values (e.g. 0, 1, 2 or Colors).',
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(1)',
        explanation: 'Maintain 3 pointers: low, mid, and high. Partition values such that nums[0..low-1] are 0s, nums[low..mid-1] are 1s, and nums[high+1..end] are 2s.',
        keyTakeaways: [
          'Sorts in a single pass without extra memory',
          'Underlying mechanism of 3-way QuickSort'
        ],
        practiceQuestionId: 'arr-4',
        practiceTitle: 'Sort an Array of 0s, 1s and 2s (Sort Colors)',
        solutions: {
          cpp: `// C++: Dutch National Flag
#include <vector>
#include <algorithm>

void sortColors(std::vector<int>& nums) {
    int low = 0, mid = 0, high = nums.size() - 1;
    while (mid <= high) {
        if (nums[mid] == 0) {
            std::swap(nums[low++], nums[mid++]);
        } else if (nums[mid] == 1) {
            mid++;
        } else {
            std::swap(nums[mid], nums[high--]); // Don't advance mid
        }
    }
}`,
          java: `// Java: Dutch National Flag
public class Solution {
    public void sortColors(int[] nums) {
        int low = 0, mid = 0, high = nums.length - 1;
        while (mid <= high) {
            if (nums[mid] == 0) {
                int temp = nums[low];
                nums[low++] = nums[mid];
                nums[mid++] = temp;
            } else if (nums[mid] == 1) {
                mid++;
            } else {
                int temp = nums[mid];
                nums[mid] = nums[high];
                nums[high--] = temp;
            }
        }
    }
}`,
          python: `# Python: Dutch National Flag
def sort_colors(nums: list[int]) -> None:
    low, mid, high = 0, 0, len(nums) - 1
    while mid <= high:
        if nums[mid] == 0:
            nums[low], nums[mid] = nums[mid], nums[low]
            low += 1
            mid += 1
        elif nums[mid] == 1:
            mid += 1
        else:
            nums[mid], nums[high] = nums[high], nums[mid]
            high -= 1`,
          javascript: `// JavaScript: Dutch National Flag
function sortColors(nums) {
  let low = 0, mid = 0, high = nums.length - 1;
  while (mid <= high) {
    if (nums[mid] === 0) {
      [nums[low], nums[mid]] = [nums[mid], nums[low]];
      low++;
      mid++;
    } else if (nums[mid] === 1) {
      mid++;
    } else {
      [nums[mid], nums[high]] = [nums[high], nums[mid]];
      high--;
    }
  }
}`
        }
      }
    ],
    cheatSheet: [
      { operation: 'Index Access arr[i]', average: 'O(1)', worst: 'O(1)' },
      { operation: 'Insertion at End', average: 'O(1) amortized', worst: 'O(N)' },
      { operation: 'Insertion at Beginning/Middle', average: 'O(N)', worst: 'O(N)' },
      { operation: 'Search (Unsorted)', average: 'O(N)', worst: 'O(N)' },
      { operation: 'Search (Sorted Binary)', average: 'O(log N)', worst: 'O(log N)' }
    ],
    interviewTips: [
      'Always ask if the array is sorted. If it is, immediately consider Two Pointers or Binary Search.',
      'Check for integer overflow when computing middle: use `left + (right - left) / 2` instead of `(left + right) / 2`.',
      'Watch out for boundary conditions with empty arrays or single elements.'
    ]
  },

  // ================= 2. LINKED LISTS =================
  'linked-list': {
    id: 'linked-list',
    title: 'Linked List Pointers & Cycles',
    tagline: 'Non-contiguous node chains, pointer mutation, cycle finding & dummy headers',
    overview: 'Linked lists excel at dynamic insertion and deletion without shifting elements O(1), but lack random indexing. Pointer manipulation requires meticulous tracking of next references to avoid memory leaks or circular reference infinite loops.',
    analogy: 'A treasure scavenger hunt where each clue card only contains the address of the next clue. You cannot jump to clue #5 without reading clues 1 through 4.',
    coreConcepts: [
      'Nodes containing data + reference pointer to next node',
      'Dummy Head sentinel technique to eliminate head-null edge cases',
      'Floyd Tortoise and Hare fast/slow pointer theorem',
      'In-place reference reversal without auxiliary memory'
    ],
    recommendedGameId: 'two-pointer',
    patterns: [
      {
        id: 'floyd-cycle-detection',
        name: "Floyd's Cycle Detection (Tortoise & Hare)",
        badge: 'O(N) Time, O(1) Space',
        whenToUse: 'Detect circular loops in linked lists, find loop entry node, duplicate integer in array.',
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(1)',
        explanation: 'Slow pointer moves 1 step; fast pointer moves 2 steps. If a cycle exists, they are guaranteed to meet inside the loop.',
        keyTakeaways: [
          'Fast catches slow by 1 step per iteration inside the loop',
          'To find start of cycle: reset slow to head and move both 1 step until they meet'
        ],
        practiceQuestionId: 'll-3',
        practiceTitle: "Detect Loop in Linked List (Floyd's Algorithm)",
        solutions: {
          cpp: `// C++: Floyd's Cycle Detection
struct ListNode {
    int val;
    ListNode *next;
    ListNode(int x) : val(x), next(nullptr) {}
};

bool hasCycle(ListNode *head) {
    ListNode *slow = head;
    ListNode *fast = head;
    while (fast != nullptr && fast->next != nullptr) {
        slow = slow->next;
        fast = fast->next->next;
        if (slow == fast) return true; // Cycle detected
    }
    return false;
}`,
          java: `// Java: Floyd's Cycle Detection
class ListNode {
    int val;
    ListNode next;
    ListNode(int x) { val = x; next = null; }
}

public class Solution {
    public boolean hasCycle(ListNode head) {
        ListNode slow = head;
        ListNode fast = head;
        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
            if (slow == fast) return true;
        }
        return false;
    }
}`,
          python: `# Python: Floyd's Cycle Detection
class ListNode:
    def __init__(self, x):
        self.val = x
        self.next = None

def has_cycle(head: ListNode | None) -> bool:
    slow, fast = head, head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow == fast:
            return True
    return False`,
          javascript: `// JavaScript: Floyd's Cycle Detection
function hasCycle(head) {
  let slow = head;
  let fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) return true;
  }
  return false;
}`
        }
      },
      {
        id: 'reverse-linked-list',
        name: 'In-Place Pointer Reversal',
        badge: 'Fundamental Mutation',
        whenToUse: 'Reversing singly linked list, checking palindrome list, reverse in K-group.',
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(1)',
        explanation: 'Maintain 3 pointers: prev (null), curr (head), and nextTemp. Disconnect curr.next and point it backwards to prev.',
        keyTakeaways: [
          'Save next node in nextTemp before breaking curr.next',
          'At the end of loop, prev points to the new head'
        ],
        practiceQuestionId: 'll-1',
        practiceTitle: 'Reverse a Linked List',
        solutions: {
          cpp: `// C++: Reverse Linked List
ListNode* reverseList(ListNode* head) {
    ListNode* prev = nullptr;
    ListNode* curr = head;
    while (curr != nullptr) {
        ListNode* nextTemp = curr->next;
        curr->next = prev; // Reverse pointer
        prev = curr;
        curr = nextTemp;
    }
    return prev;
}`,
          java: `// Java: Reverse Linked List
public class Solution {
    public ListNode reverseList(ListNode head) {
        ListNode prev = null;
        ListNode curr = head;
        while (curr != null) {
            ListNode nextTemp = curr.next;
            curr.next = prev;
            prev = curr;
            curr = nextTemp;
        }
        return prev;
    }
}`,
          python: `# Python: Reverse Linked List
def reverse_list(head: ListNode | None) -> ListNode | None:
    prev = None
    curr = head
    while curr:
        next_temp = curr.next
        curr.next = prev
        prev = curr
        curr = next_temp
    return prev`,
          javascript: `// JavaScript: Reverse Linked List
function reverseList(head) {
  let prev = null;
  let curr = head;
  while (curr !== null) {
    const nextTemp = curr.next;
    curr.next = prev;
    prev = curr;
    curr = nextTemp;
  }
  return prev;
}`
        }
      }
    ],
    cheatSheet: [
      { operation: 'Access / Search', average: 'O(N)', worst: 'O(N)' },
      { operation: 'Insert at Head', average: 'O(1)', worst: 'O(1)' },
      { operation: 'Insert at Tail (with tail ptr)', average: 'O(1)', worst: 'O(1)' },
      { operation: 'Delete given Node pointer', average: 'O(1)', worst: 'O(1)' }
    ],
    interviewTips: [
      'Always initialize a Dummy Sentinel Node (`dummy.next = head`) to avoid handling empty list or head replacement as special cases.',
      'Check `fast != null && fast.next != null` to prevent NullPointerExceptions in two-step traversal.'
    ]
  },

  // ================= 3. STACKS & QUEUES =================
  'stacks-queues': {
    id: 'stacks-queues',
    title: 'Stacks, Queues & Monotonic Sequences',
    tagline: 'LIFO & FIFO primitives: monotonic stack, matching brackets, sliding window deque',
    overview: 'Stacks (LIFO) model recursive call stacks and backwards dependencies. A Monotonic Stack keeps elements sorted in monotonic order, finding the Next Greater or Smaller Element in optimal linear O(N) time.',
    analogy: 'A spring-loaded plate dispenser in a cafeteria: you can only pick the top plate or push a new plate onto the top.',
    coreConcepts: [
      'LIFO (Last-In-First-Out) vs FIFO (First-In-First-Out)',
      'Monotonic Stack property: pop elements until invariant holds',
      'Doubly linked list + Hash Map for O(1) LRU Cache eviction'
    ],
    recommendedGameId: 'monotonic-stack',
    patterns: [
      {
        id: 'monotonic-decreasing-stack',
        name: 'Monotonic Stack (Next Greater Element)',
        badge: 'O(N) Linear Scan',
        whenToUse: 'Finding next greater / smaller element, daily temperatures, stock span, largest rectangle in histogram.',
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(N)',
        explanation: 'Maintain a stack of indices. For each element, pop all smaller elements because the current element is their next greater element!',
        keyTakeaways: [
          'Every index is pushed and popped at most once: strict O(N) total time',
          'Store indices in stack rather than values to compute distances'
        ],
        practiceQuestionId: 'sq-2',
        practiceTitle: 'Next Greater Element I & II',
        solutions: {
          cpp: `// C++: Monotonic Stack
#include <vector>
#include <stack>

std::vector<int> nextGreaterElements(const std::vector<int>& nums) {
    int n = nums.size();
    std::vector<int> result(n, -1);
    std::stack<int> s; // stores indices

    for (int i = 0; i < n; i++) {
        while (!s.empty() && nums[s.top()] < nums[i]) {
            result[s.top()] = nums[i];
            s.pop();
        }
        s.push(i);
    }
    return result;
}`,
          java: `// Java: Monotonic Stack
import java.util.Stack;
import java.util.Arrays;

public class Solution {
    public int[] nextGreaterElements(int[] nums) {
        int n = nums.length;
        int[] result = new int[n];
        Arrays.fill(result, -1);
        Stack<Integer> stack = new Stack<>();

        for (int i = 0; i < n; i++) {
            while (!stack.isEmpty() && nums[stack.peek()] < nums[i]) {
                result[stack.pop()] = nums[i];
            }
            stack.push(i);
        }
        return result;
    }
}`,
          python: `# Python: Monotonic Stack
def next_greater_elements(nums: list[int]) -> list[int]:
    n = len(nums)
    result = [-1] * n
    stack = [] # stores indices

    for i in range(n):
        while stack and nums[stack[-1]] < nums[i]:
            result[stack.pop()] = nums[i]
        stack.append(i)
    return result`,
          javascript: `// JavaScript: Monotonic Stack
function nextGreaterElements(nums) {
  const n = nums.length;
  const result = new Array(n).fill(-1);
  const stack = []; // indices

  for (let i = 0; i < n; i++) {
    while (stack.length > 0 && nums[stack[stack.length - 1]] < nums[i]) {
      result[stack.pop()] = nums[i];
    }
    stack.push(i);
  }
  return result;
}`
        }
      },
      {
        id: 'valid-parentheses',
        name: 'Matching Pairs / Balanced Parentheses',
        badge: 'Classic LIFO',
        whenToUse: 'Valid brackets, nested tags, expressions evaluation, string decoding.',
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(N)',
        explanation: 'Push expected closing brackets onto stack when opening bracket is encountered. If next character does not match stack top, string is invalid.',
        keyTakeaways: [
          'Clean trick: Push matching closing bracket when opening bracket seen',
          'Stack must be completely empty at the end'
        ],
        practiceQuestionId: 'sq-1',
        practiceTitle: 'Valid Parentheses',
        solutions: {
          cpp: `// C++: Valid Parentheses
#include <string>
#include <stack>

bool isValid(const std::string& s) {
    std::stack<char> st;
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
          java: `// Java: Valid Parentheses
import java.util.Stack;

public class Solution {
    public boolean isValid(String s) {
        Stack<Character> stack = new Stack<>();
        for (char c : s.toCharArray()) {
            if (c == '(') stack.push(')');
            else if (c == '{') stack.push('}');
            else if (c == '[') stack.push(']');
            else {
                if (stack.isEmpty() || stack.pop() != c) return false;
            }
        }
        return stack.isEmpty();
    }
}`,
          python: `# Python: Valid Parentheses
def is_valid(s: str) -> bool:
    stack = []
    mapping = {")": "(", "}": "{", "]": "["}
    for char in s:
        if char in mapping.values():
            stack.append(char)
        elif char in mapping:
            if not stack or stack.pop() != mapping[char]:
                return False
        else:
            return False
    return len(stack) == 0`,
          javascript: `// JavaScript: Valid Parentheses
function isValid(s) {
  const stack = [];
  const map = { '(': ')', '{': '}', '[': ']' };
  for (const c of s) {
    if (map[c]) stack.push(map[c]);
    else if (stack.pop() !== c) return false;
  }
  return stack.length === 0;
}`
        }
      }
    ],
    cheatSheet: [
      { operation: 'Push', average: 'O(1)', worst: 'O(1)' },
      { operation: 'Pop', average: 'O(1)', worst: 'O(1)' },
      { operation: 'Peek / Top', average: 'O(1)', worst: 'O(1)' },
      { operation: 'Monotonic Sweep', average: 'O(N)', worst: 'O(N)' }
    ],
    interviewTips: [
      'In JavaScript/Python, standard arrays (`push`/`pop`) act as fast stacks.',
      'Always verify if empty stack check is handled before calling `top()` or `pop()`.'
    ]
  },

  // ================= 4. BINARY SEARCH =================
  'binary-search': {
    id: 'binary-search',
    title: 'Binary Search & Solution Space',
    tagline: 'Logarithmic O(log N) elimination, sorted spaces & monotonic predicate functions',
    overview: 'Binary Search is not limited to finding a number in an array. Any monotonic condition (True True True False False) can be solved via Binary Search on the Answer Space in O(log(Max-Min)) iterations.',
    analogy: 'High-Low guessing game: you guess 50. If told "too high", you immediately eliminate numbers 50 to 100 in one turn.',
    coreConcepts: [
      'Search space halving at each comparison step',
      'Preventing integer overflow: `mid = left + (right - left) / 2`',
      'Binary Search on Answer with feasibility checker function `canAchieve(mid)`'
    ],
    recommendedGameId: 'binary-sentry',
    patterns: [
      {
        id: 'binary-search-answer',
        name: 'Binary Search on Answer (Feasibility Range)',
        badge: 'O(N log Range)',
        whenToUse: '"Find minimum capacity / rate / time to complete task" (Koko Eating Bananas, Capacity to Ship Packages, Aggressive Cows).',
        timeComplexity: 'O(N log(Max - Min))',
        spaceComplexity: 'O(1)',
        explanation: 'Define min and max possible answers. Binary search the value of mid and check if mid is feasible. If feasible, try smaller to minimize!',
        keyTakeaways: [
          'Feasibility function `isValid(speed)` is monotonic',
          'Search space is numerical range [minVal, maxVal], not array indices'
        ],
        practiceQuestionId: 'arr-3',
        practiceTitle: 'Kth Element / Binary Search on Answer',
        solutions: {
          cpp: `// C++: Binary Search on Answer (Koko Bananas)
#include <vector>
#include <algorithm>
#include <cmath>

bool canFinish(const std::vector<int>& piles, int h, int k) {
    long long totalHours = 0;
    for (int p : piles) {
        totalHours += (p + k - 1) / k; // Ceiling division
    }
    return totalHours <= h;
}

int minEatingSpeed(const std::vector<int>& piles, int h) {
    int low = 1;
    int high = *std::max_element(piles.begin(), piles.end());
    int ans = high;

    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (canFinish(piles, h, mid)) {
            ans = mid;
            high = mid - 1; // Try smaller speed
        } else {
            low = mid + 1;  // Too slow, increase speed
        }
    }
    return ans;
}`,
          java: `// Java: Binary Search on Answer
public class Solution {
    public int minEatingSpeed(int[] piles, int h) {
        int low = 1, high = 1;
        for (int p : piles) high = Math.max(high, p);
        int ans = high;

        while (low <= high) {
            int mid = low + (high - low) / 2;
            long hours = 0;
            for (int p : piles) hours += (p + mid - 1) / mid;
            if (hours <= h) {
                ans = mid;
                high = mid - 1;
            } else {
                low = mid + 1;
            }
        }
        return ans;
    }
}`,
          python: `# Python: Binary Search on Answer
import math

def min_eating_speed(piles: list[int], h: int) -> int:
    def can_finish(k: int) -> bool:
        return sum(math.ceil(p / k) for p in piles) <= h

    low, high = 1, max(piles)
    ans = high
    while low <= high:
        mid = (low + high) // 2
        if can_finish(mid):
            ans = mid
            high = mid - 1
        else:
            low = mid + 1
    return ans`,
          javascript: `// JavaScript: Binary Search on Answer
function minEatingSpeed(piles, h) {
  let low = 1, high = Math.max(...piles);
  let ans = high;

  function canFinish(k) {
    let hours = 0;
    for (const p of piles) hours += Math.ceil(p / k);
    return hours <= h;
  }

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (canFinish(mid)) {
      ans = mid;
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }
  return ans;
}`
        }
      }
    ],
    cheatSheet: [
      { operation: 'Standard Binary Search', average: 'O(log N)', worst: 'O(log N)' },
      { operation: 'Search Rotated Array', average: 'O(log N)', worst: 'O(log N)' },
      { operation: 'Binary Search on Answer', average: 'O(N log K)', worst: 'O(N log K)' }
    ],
    interviewTips: [
      'Whenever the problem asks to "Minimize the Maximum" or "Maximize the Minimum", it is virtually guaranteed to be Binary Search on Answer.',
      'Check ceiling integer division: `(a + b - 1) / b` computes `ceil(a / b)` accurately without floating point rounding errors.'
    ]
  },

  // ================= 5. TREES & BST =================
  'trees-bst': {
    id: 'trees-bst',
    title: 'Trees & Binary Search Trees',
    tagline: 'Hierarchical recursion, divide-and-conquer, BFS levels & BST range invariants',
    overview: 'Trees represent hierarchical relationships. DFS traverses depth-first (Pre-order, In-order, Post-order), while BFS traverses breadth-first level-by-level using a FIFO queue. In a BST, the in-order traversal yields elements in strictly sorted order.',
    analogy: 'An organizational corporate chart: a CEO at root, managers as child nodes, and individual contributors as leaf nodes.',
    coreConcepts: [
      'Divide and conquer: solve for left subtree and right subtree, then combine at root',
      'BST Invariant: left < root < right',
      'Lowest Common Ancestor (LCA) node discovery'
    ],
    recommendedGameId: 'binary-sentry',
    patterns: [
      {
        id: 'tree-dfs-divide-conquer',
        name: 'Tree DFS / Maximum Depth & Diameter',
        badge: 'Divide & Conquer O(N)',
        whenToUse: 'Max depth, tree diameter, balanced tree check, invert binary tree.',
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(H) recursion stack where H is tree height',
        explanation: 'Recursively compute result for left child and right child, then return combination at current node.',
        keyTakeaways: [
          'Base case: null node returns 0',
          'Height = 1 + max(leftHeight, rightHeight)'
        ],
        practiceQuestionId: 'tree-5',
        practiceTitle: 'Lowest Common Ancestor in Binary Tree',
        solutions: {
          cpp: `// C++: Lowest Common Ancestor (DFS)
struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
};

TreeNode* lowestCommonAncestor(TreeNode* root, TreeNode* p, TreeNode* q) {
    if (root == nullptr || root == p || root == q) return root;
    TreeNode* left = lowestCommonAncestor(root->left, p, q);
    TreeNode* right = lowestCommonAncestor(root->right, p, q);
    if (left != nullptr && right != nullptr) return root; // p and q in different branches
    return left != nullptr ? left : right;
}`,
          java: `// Java: Lowest Common Ancestor (DFS)
public class Solution {
    public TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {
        if (root == null || root == p || root == q) return root;
        TreeNode left = lowestCommonAncestor(root.left, p, q);
        TreeNode right = lowestCommonAncestor(root.right, p, q);
        if (left != null && right != null) return root;
        return left != null ? left : right;
    }
}`,
          python: `# Python: Lowest Common Ancestor (DFS)
def lowest_common_ancestor(root: 'TreeNode', p: 'TreeNode', q: 'TreeNode') -> 'TreeNode':
    if not root or root == p or root == q:
        return root
    left = lowest_common_ancestor(root.left, p, q)
    right = lowest_common_ancestor(root.right, p, q)
    if left and right:
        return root
    return left or right`,
          javascript: `// JavaScript: Lowest Common Ancestor (DFS)
function lowestCommonAncestor(root, p, q) {
  if (!root || root === p || root === q) return root;
  const left = lowestCommonAncestor(root.left, p, q);
  const right = lowestCommonAncestor(root.right, p, q);
  if (left && right) return root;
  return left || right;
}`
        }
      },
      {
        id: 'tree-bfs-level-order',
        name: 'Tree BFS (Level-Order Queue Traversal)',
        badge: 'Queue-Based Layer Traversal',
        whenToUse: 'Level by level tree traversal, zigzag order, right view of tree.',
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(W) where W is max tree width',
        explanation: 'Use a FIFO queue. Record queue size at start of each iteration to process exactly one tree level at a time.',
        keyTakeaways: [
          'Capture `levelSize = queue.size()` before inner loop',
          'Enables calculating average or leftmost/rightmost node per level'
        ],
        practiceQuestionId: 'tree-1',
        practiceTitle: 'Level Order Traversal of Binary Tree',
        solutions: {
          cpp: `// C++: Level Order Traversal (BFS)
#include <vector>
#include <queue>

std::vector<std::vector<int>> levelOrder(TreeNode* root) {
    if (!root) return {};
    std::vector<std::vector<int>> result;
    std::queue<TreeNode*> q;
    q.push(root);

    while (!q.empty()) {
        int levelSize = q.size();
        std::vector<int> currentLevel;
        for (int i = 0; i < levelSize; i++) {
            TreeNode* node = q.front();
            q.pop();
            currentLevel.push_back(node->val);
            if (node->left) q.push(node->left);
            if (node->right) q.push(node->right);
        }
        result.push_back(currentLevel);
    }
    return result;
}`,
          java: `// Java: Level Order Traversal (BFS)
import java.util.*;

public class Solution {
    public List<List<Integer>> levelOrder(TreeNode root) {
        List<List<Integer>> result = new ArrayList<>();
        if (root == null) return result;
        Queue<TreeNode> queue = new LinkedList<>();
        queue.offer(root);

        while (!queue.isEmpty()) {
            int levelSize = queue.size();
            List<Integer> currentLevel = new ArrayList<>();
            for (int i = 0; i < levelSize; i++) {
                TreeNode node = queue.poll();
                currentLevel.add(node.val);
                if (node.left != null) queue.offer(node.left);
                if (node.right != null) queue.offer(node.right);
            }
            result.add(currentLevel);
        }
        return result;
    }
}`,
          python: `# Python: Level Order Traversal (BFS)
from collections import deque

def level_order(root: TreeNode | None) -> list[list[int]]:
    if not root:
        return []
    result = []
    q = deque([root])
    while q:
        level_size = len(q)
        current_level = []
        for _ in range(level_size):
            node = q.popleft()
            current_level.append(node.val)
            if node.left:
                q.append(node.left)
            if node.right:
                q.append(node.right)
        result.append(current_level)
    return result`,
          javascript: `// JavaScript: Level Order Traversal (BFS)
function levelOrder(root) {
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
        }
      }
    ],
    cheatSheet: [
      { operation: 'BST Search (Balanced)', average: 'O(log N)', worst: 'O(N) skewed' },
      { operation: 'BST Insert', average: 'O(log N)', worst: 'O(N)' },
      { operation: 'Full Tree Traversal (DFS/BFS)', average: 'O(N)', worst: 'O(N)' }
    ],
    interviewTips: [
      'In-order traversal of a valid BST is ALWAYS strictly increasing.',
      'To validate a BST, pass range bounds `(minVal, maxVal)` downward rather than checking only direct children.'
    ]
  },

  // ================= 6. GRAPHS =================
  'graphs': {
    id: 'graphs',
    title: 'Graphs, BFS/DFS & Topo Sort',
    tagline: 'Vertices & edges: connected components, cycle checks, topological sort & Dijkstra',
    overview: 'Graphs model networks (social connections, road maps, web links). BFS finds shortest paths in unweighted graphs; DFS explores deep dependencies. Kahn\'s algorithm computes topological order for prerequisite tasks.',
    analogy: 'Airline flight routes connecting airports: finding the flight with the minimum layovers is BFS shortest path.',
    coreConcepts: [
      'Adjacency List representation: unordered_map or array of lists',
      'Visited set or in-place marking to prevent infinite loops in cycles',
      'Topological Sort with In-Degree tracking (Kahn\'s Algorithm)'
    ],
    recommendedGameId: 'island-rescue',
    patterns: [
      {
        id: 'graph-dfs-flood-fill',
        name: 'DFS Flood Fill / Number of Islands',
        badge: 'Grid Traversal O(M * N)',
        whenToUse: 'Connected components on 2D matrix, perimeter, word search, enclosed regions.',
        timeComplexity: 'O(M * N)',
        spaceComplexity: 'O(M * N) call stack worst-case',
        explanation: 'Iterate through grid. When unvisited land "1" is hit, increment island count and fire DFS in 4 directions to sink the entire island into "0".',
        keyTakeaways: [
          'Mutating matrix to "0" avoids extra visited set memory',
          'Direction arrays `dRow = {-1, 1, 0, 0}`, `dCol = {0, 0, -1, 1}` keep code clean'
        ],
        practiceQuestionId: 'grp-5',
        practiceTitle: 'Find Number of Islands (Flood Fill)',
        solutions: {
          cpp: `// C++: Number of Islands (DFS)
#include <vector>

void dfsSink(std::vector<std::vector<char>>& grid, int r, int c) {
    if (r < 0 || r >= grid.size() || c < 0 || c >= grid[0].size() || grid[r][c] != '1')
        return;
    grid[r][c] = '0'; // Sink land
    dfsSink(grid, r + 1, c);
    dfsSink(grid, r - 1, c);
    dfsSink(grid, r, c + 1);
    dfsSink(grid, r, c - 1);
}

int numIslands(std::vector<std::vector<char>>& grid) {
    if (grid.empty()) return 0;
    int count = 0;
    for (int r = 0; r < grid.size(); r++) {
        for (int c = 0; c < grid[0].size(); c++) {
            if (grid[r][c] == '1') {
                count++;
                dfsSink(grid, r, c);
            }
        }
    }
    return count;
}`,
          java: `// Java: Number of Islands (DFS)
public class Solution {
    public int numIslands(char[][] grid) {
        if (grid == null || grid.length == 0) return 0;
        int count = 0;
        for (int r = 0; r < grid.length; r++) {
            for (int c = 0; c < grid[0].length; c++) {
                if (grid[r][c] == '1') {
                    count++;
                    dfsSink(grid, r, c);
                }
            }
        }
        return count;
    }

    private void dfsSink(char[][] grid, int r, int c) {
        if (r < 0 || r >= grid.length || c < 0 || c >= grid[0].length || grid[r][c] != '1')
            return;
        grid[r][c] = '0';
        dfsSink(grid, r + 1, c);
        dfsSink(grid, r - 1, c);
        dfsSink(grid, r, c + 1);
        dfsSink(grid, r, c - 1);
    }
}`,
          python: `# Python: Number of Islands (DFS)
def num_islands(grid: list[list[str]]) -> int:
    if not grid:
        return 0
    rows, cols = len(grid), len(grid[0])
    count = 0

    def dfs(r: int, c: int):
        if r < 0 or r >= rows or c < 0 or c >= cols or grid[r][c] != "1":
            return
        grid[r][c] = "0" # Sink
        dfs(r + 1, c)
        dfs(r - 1, c)
        dfs(r, c + 1)
        dfs(r, c - 1)

    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == "1":
                count += 1
                dfs(r, c)
    return count`,
          javascript: `// JavaScript: Number of Islands (DFS)
function numIslands(grid) {
  if (!grid || grid.length === 0) return 0;
  const rows = grid.length, cols = grid[0].length;
  let count = 0;

  function dfs(r, c) {
    if (r < 0 || r >= rows || c < 0 || c >= cols || grid[r][c] !== '1') return;
    grid[r][c] = '0'; // Sink
    dfs(r + 1, c);
    dfs(r - 1, c);
    dfs(r, c + 1);
    dfs(r, c - 1);
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === '1') {
        count++;
        dfs(r, c);
      }
    }
  }
  return count;
}`
        }
      },
      {
        id: 'kahns-topological-sort',
        name: "Topological Sort (Kahn's Algorithm)",
        badge: 'DAG In-Degree BFS',
        whenToUse: 'Course schedule prerequisites, package build systems, task scheduling.',
        timeComplexity: 'O(V + E)',
        spaceComplexity: 'O(V + E)',
        explanation: 'Compute in-degree for all vertices. Push 0-in-degree vertices into queue. As nodes are processed, decrement neighbor in-degrees and enqueue new 0s.',
        keyTakeaways: [
          'If processed count < V, graph contains a cycle (cannot finish all courses)',
          'Requires Directed Acyclic Graph (DAG)'
        ],
        practiceQuestionId: 'grp-6',
        practiceTitle: "Course Schedule / Detect Cycle in Directed Graph",
        solutions: {
          cpp: `// C++: Kahn's Topological Sort (Course Schedule)
#include <vector>
#include <queue>

bool canFinish(int numCourses, const std::vector<std::vector<int>>& prerequisites) {
    std::vector<std::vector<int>> adj(numCourses);
    std::vector<int> inDegree(numCourses, 0);

    for (const auto& pre : prerequisites) {
        adj[pre[1]].push_back(pre[0]);
        inDegree[pre[0]]++;
    }

    std::queue<int> q;
    for (int i = 0; i < numCourses; i++) {
        if (inDegree[i] == 0) q.push(i);
    }

    int processed = 0;
    while (!q.empty()) {
        int u = q.front();
        q.pop();
        processed++;
        for (int v : adj[u]) {
            if (--inDegree[v] == 0) q.push(v);
        }
    }
    return processed == numCourses;
}`,
          java: `// Java: Kahn's Topological Sort
import java.util.*;

public class Solution {
    public boolean canFinish(int numCourses, int[][] prerequisites) {
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < numCourses; i++) adj.add(new ArrayList<>());
        int[] inDegree = new int[numCourses];

        for (int[] pre : prerequisites) {
            adj.get(pre[1]).add(pre[0]);
            inDegree[pre[0]]++;
        }

        Queue<Integer> q = new LinkedList<>();
        for (int i = 0; i < numCourses; i++) {
            if (inDegree[i] == 0) q.offer(i);
        }

        int processed = 0;
        while (!q.isEmpty()) {
            int curr = q.poll();
            processed++;
            for (int neighbor : adj.get(curr)) {
                if (--inDegree[neighbor] == 0) q.offer(neighbor);
            }
        }
        return processed == numCourses;
    }
}`,
          python: `# Python: Kahn's Topological Sort
from collections import deque

def can_finish(num_courses: int, prerequisites: list[list[int]]) -> bool:
    adj = {i: [] for i in range(num_courses)}
    in_degree = [0] * num_courses

    for course, pre in prerequisites:
        adj[pre].append(course)
        in_degree[course] += 1

    q = deque([i for i in range(num_courses) if in_degree[i] == 0])
    processed = 0

    while q:
        curr = q.popleft()
        processed += 1
        for neighbor in adj[curr]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                q.append(neighbor)

    return processed == num_courses`,
          javascript: `// JavaScript: Kahn's Topological Sort
function canFinish(numCourses, prerequisites) {
  const adj = Array.from({ length: numCourses }, () => []);
  const inDegree = new Array(numCourses).fill(0);

  for (const [course, pre] of prerequisites) {
    adj[pre].push(course);
    inDegree[course]++;
  }

  const queue = [];
  for (let i = 0; i < numCourses; i++) {
    if (inDegree[i] === 0) queue.push(i);
  }

  let processed = 0;
  while (queue.length > 0) {
    const curr = queue.shift();
    processed++;
    for (const neighbor of adj[curr]) {
      inDegree[neighbor]--;
      if (inDegree[neighbor] === 0) queue.push(neighbor);
    }
  }

  return processed === numCourses;
}`
        }
      }
    ],
    cheatSheet: [
      { operation: 'BFS / DFS Traversal', average: 'O(V + E)', worst: 'O(V + E)' },
      { operation: 'Topological Sort (Kahn)', average: 'O(V + E)', worst: 'O(V + E)' },
      { operation: 'Dijkstra (with Min-Heap)', average: 'O(E log V)', worst: 'O(E log V)' }
    ],
    interviewTips: [
      'In a grid problem, total vertices V = M * N and edges E = 4 * M * N, so O(V + E) = O(M * N).',
      'For shortest path in unweighted graphs, ALWAYS use BFS. DFS does not guarantee shortest path.'
    ]
  },

  // ================= 7. DYNAMIC PROGRAMMING =================
  'dp': {
    id: 'dp',
    title: 'Dynamic Programming & Memoization',
    tagline: 'Optimal substructure & overlapping subproblems: 0/1 knapsack, LCS & state tabulation',
    overview: 'Dynamic Programming eliminates exponential brute force recursion by storing results of subproblems. Formulate base cases, identify recurring state transitions, and optimize space using 1D rolling arrays.',
    analogy: 'Writing down 1 + 1 + 1 = 3 on paper. If someone adds another 1, you don\'t re-add everything from scratch—you know 3 + 1 = 4 because you memorized 3.',
    coreConcepts: [
      'Top-Down with Memoization vs Bottom-Up with Tabulation',
      'Knapsack formulations (Bounded 0/1 vs Unbounded)',
      '1D Space Optimization: when dp[i] depends only on dp[i-1]'
    ],
    recommendedGameId: 'coin-quest',
    patterns: [
      {
        id: 'dp-01-knapsack',
        name: '0/1 Knapsack (Subset Selection)',
        badge: 'O(N * W) Time, O(W) Space',
        whenToUse: 'Subset sum equals target, partition equal subset sum, target sum.',
        timeComplexity: 'O(N * W)',
        spaceComplexity: 'O(W) with backwards 1D array',
        explanation: 'For each item with weight w and value v, choose whether to include it or skip it. Iterate weight capacity backwards from W down to w to reuse the same 1D array in-place.',
        keyTakeaways: [
          'Iterate capacity backwards to avoid using the same item twice',
          'dp[w] = max(dp[w], dp[w - weight[i]] + val[i])'
        ],
        practiceQuestionId: 'dp-1',
        practiceTitle: '0/1 Knapsack Problem',
        solutions: {
          cpp: `// C++: 0/1 Knapsack (1D Space Optimized)
#include <vector>
#include <algorithm>

int knapSack(int W, const std::vector<int>& wt, const std::vector<int>& val, int n) {
    std::vector<int> dp(W + 1, 0);
    for (int i = 0; i < n; i++) {
        // Iterate backwards so we don't reuse current item
        for (int w = W; w >= wt[i]; w--) {
            dp[w] = std::max(dp[w], dp[w - wt[i]] + val[i]);
        }
    }
    return dp[W];
}`,
          java: `// Java: 0/1 Knapsack (1D Space Optimized)
public class Solution {
    public int knapSack(int W, int[] wt, int[] val, int n) {
        int[] dp = new int[W + 1];
        for (int i = 0; i < n; i++) {
            for (int w = W; w >= wt[i]; w--) {
                dp[w] = Math.max(dp[w], dp[w - wt[i]] + val[i]);
            }
        }
        return dp[W];
    }
}`,
          python: `# Python: 0/1 Knapsack (1D Space Optimized)
def knap_sack(W: int, wt: list[int], val: list[int], n: int) -> int:
    dp = [0] * (W + 1)
    for i in range(n):
        for w in range(W, wt[i] - 1, -1):
            dp[w] = max(dp[w], dp[w - wt[i]] + val[i])
    return dp[W]`,
          javascript: `// JavaScript: 0/1 Knapsack (1D Space Optimized)
function knapSack(W, wt, val, n) {
  const dp = new Array(W + 1).fill(0);
  for (let i = 0; i < n; i++) {
    for (let w = W; w >= wt[i]; w--) {
      dp[w] = Math.max(dp[w], dp[w - wt[i]] + val[i]);
    }
  }
  return dp[W];
}`
        }
      },
      {
        id: 'dp-lcs',
        name: 'Longest Common Subsequence (2D Grid)',
        badge: 'O(M * N) String DP',
        whenToUse: 'LCS, edit distance, longest palindromic subsequence, minimum insertions to palindrome.',
        timeComplexity: 'O(M * N)',
        spaceComplexity: 'O(M * N) or O(N)',
        explanation: 'If characters match (s1[i] == s2[j]), dp[i][j] = 1 + dp[i-1][j-1]. If they differ, take maximum of skipping one character: max(dp[i-1][j], dp[i][j-1]).',
        keyTakeaways: [
          'Subsequence retains relative order but is not necessarily contiguous',
          'Base row and column initialized to 0'
        ],
        practiceQuestionId: 'dp-3',
        practiceTitle: 'Longest Common Subsequence',
        solutions: {
          cpp: `// C++: Longest Common Subsequence
#include <string>
#include <vector>
#include <algorithm>

int longestCommonSubsequence(const std::string& text1, const std::string& text2) {
    int m = text1.length(), n = text2.length();
    std::vector<std::vector<int>> dp(m + 1, std::vector<int>(n + 1, 0));

    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (text1[i - 1] == text2[j - 1]) {
                dp[i][j] = 1 + dp[i - 1][j - 1];
            } else {
                dp[i][j] = std::max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }
    return dp[m][n];
}`,
          java: `// Java: Longest Common Subsequence
public class Solution {
    public int longestCommonSubsequence(String text1, String text2) {
        int m = text1.length(), n = text2.length();
        int[][] dp = new int[m + 1][n + 1];

        for (int i = 1; i <= m; i++) {
            for (int j = 1; j <= n; j++) {
                if (text1.charAt(i - 1) == text2.charAt(j - 1)) {
                    dp[i][j] = 1 + dp[i - 1][j - 1];
                } else {
                    dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
                }
            }
        }
        return dp[m][n];
    }
}`,
          python: `# Python: Longest Common Subsequence
def longest_common_subsequence(text1: str, text2: str) -> int:
    m, n = len(text1), len(text2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]

    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if text1[i - 1] == text2[j - 1]:
                dp[i][j] = 1 + dp[i - 1][j - 1]
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
    return dp[m][n]`,
          javascript: `// JavaScript: Longest Common Subsequence
function longestCommonSubsequence(text1, text2) {
  const m = text1.length, n = text2.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (text1[i - 1] === text2[j - 1]) {
        dp[i][j] = 1 + dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  return dp[m][n];
}`
        }
      }
    ],
    cheatSheet: [
      { operation: '0/1 Knapsack', average: 'O(N * W)', worst: 'O(N * W)' },
      { operation: 'Coin Change (Unbounded)', average: 'O(N * Amount)', worst: 'O(N * Amount)' },
      { operation: 'Longest Common Subsequence', average: 'O(M * N)', worst: 'O(M * N)' },
      { operation: 'Longest Increasing Subsequence', average: 'O(N log N)', worst: 'O(N log N)' }
    ],
    interviewTips: [
      'Write down state formula explicitly: "dp[i] represents the optimal value up to index i".',
      'If iterating bounded items, iterate inner loop backwards; if unbounded (unlimited coins), iterate forwards.'
    ]
  }
};
