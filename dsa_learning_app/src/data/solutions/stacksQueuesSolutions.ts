import { ProblemSolution } from '../../types/dsa';

export const STACKS_QUEUES_SOLUTIONS: Record<string, ProblemSolution> = {
  'sq-1': {
    questionId: 'sq-1',
    pattern: 'LIFO Stack Matching',
    intuition: [
      'Parentheses matching enforces that the most recently opened bracket must be the first one closed (Last-In, First-Out).',
      'Traverse character by character. When encountering an opening bracket `(`, `{`, `[`, push the expected closing bracket `)`, `}`, `]` onto the stack.',
      'When encountering a closing bracket, pop from the stack and ensure it matches the current character.',
      'If the stack is empty when expecting a match, or if any unclosed opening bracket remains at the end, the string is invalid.'
    ],
    pseudocode: [
      'FUNCTION isValid(s):',
      '  stack = []',
      '  FOR char IN s:',
      '    IF char == "(": stack.push(")")',
      '    ELSE IF char == "{": stack.push("}")',
      '    ELSE IF char == "[": stack.push("]")',
      '    ELSE:',
      '      IF stack is empty OR stack.pop() != char: RETURN false',
      '  RETURN stack is empty'
    ],
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(N)',
    complexityExplanation: 'Single pass visiting each character once. Stack stores at most N characters.',
    edgeCases: ['Odd length string (cannot be valid)', 'Only opening brackets "((("', 'Only closing brackets ")))"'],
    code: {
      cpp: `// C++ Valid Parentheses
#include <string>
#include <stack>

bool isValid(std::string s) {
    if (s.length() % 2 != 0) return false;
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
      java: `// Java Valid Parentheses
import java.util.Stack;

public class Solution {
    public boolean isValid(String s) {
        if (s.length() % 2 != 0) return false;
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
      python: `# Python Valid Parentheses
class Solution:
    def isValid(self, s: str) -> bool:
        if len(s) % 2 != 0:
            return False
        stack = []
        mapping = {')': '(', '}': '{', ']': '['}
        for char in s:
            if char in mapping:
                top_element = stack.pop() if stack else '#'
                if mapping[char] != top_element:
                    return False
            else:
                stack.append(char)
        return not stack`,
      javascript: `// JavaScript Valid Parentheses
function isValid(s) {
  if (s.length % 2 !== 0) return false;
  const stack = [];
  for (const c of s) {
    if (c === '(') stack.push(')');
    else if (c === '{') stack.push('}');
    else if (c === '[') stack.push(']');
    else {
      if (stack.length === 0 || stack.pop() !== c) return false;
    }
  }
  return stack.length === 0;
}`
    },
    interviewProTips: [
      'Pushing the expected *closing* bracket onto the stack instead of the opening bracket simplifies matching to a single equality check `st.pop() == c`.'
    ]
  },

  'sq-2': {
    questionId: 'sq-2',
    pattern: 'Monotonic Decreasing Stack',
    intuition: [
      'To find the next greater element for each index in linear O(N) time instead of quadratic O(N^2), use a monotonic stack.',
      'Scan the array from right to left.',
      'Maintain a stack of candidate greater elements in strictly decreasing order from bottom to top.',
      'Pop elements from the stack that are smaller than or equal to `nums[i]` because `nums[i]` will shadow them for all preceding elements.',
      'The top of the stack is now the Next Greater Element (or -1 if stack is empty). Push `nums[i]` onto stack.'
    ],
    pseudocode: [
      'FUNCTION nextGreaterElements(nums):',
      '  n = nums.length',
      '  result = array of size n filled with -1',
      '  stack = []',
      '  FOR i from n - 1 DOWNTO 0:',
      '    WHILE stack is NOT empty AND stack.peek() <= nums[i]:',
      '      stack.pop()',
      '    IF stack is NOT empty: result[i] = stack.peek()',
      '    stack.push(nums[i])',
      '  RETURN result'
    ],
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(N)',
    complexityExplanation: 'Each element is pushed once and popped at most once across the entire traversal, guaranteeing amortized linear time.',
    edgeCases: ['Array strictly decreasing (all answers are -1)', 'Array strictly increasing', 'All equal elements'],
    code: {
      cpp: `// C++ Next Greater Element (Monotonic Stack)
#include <vector>
#include <stack>

std::vector<int> nextGreaterElement(const std::vector<int>& nums) {
    int n = nums.size();
    std::vector<int> result(n, -1);
    std::stack<int> st;
    for (int i = n - 1; i >= 0; --i) {
        while (!st.empty() && st.top() <= nums[i]) {
            st.pop();
        }
        if (!st.empty()) {
            result[i] = st.top();
        }
        st.push(nums[i]);
    }
    return result;
}`,
      java: `// Java Next Greater Element (Monotonic Stack)
import java.util.Stack;

public class Solution {
    public int[] nextGreaterElement(int[] nums) {
        int n = nums.length;
        int[] result = new int[n];
        Stack<Integer> st = new Stack<>();
        for (int i = n - 1; i >= 0; i--) {
            while (!st.isEmpty() && st.peek() <= nums[i]) {
                st.pop();
            }
            result[i] = st.isEmpty() ? -1 : st.peek();
            st.push(nums[i]);
        }
        return result;
    }
}`,
      python: `# Python Next Greater Element (Monotonic Stack)
def nextGreaterElement(nums: list[int]) -> list[int]:
    n = len(nums)
    result = [-1] * n
    stack = []
    for i in range(n - 1, -1, -1):
        while stack and stack[-1] <= nums[i]:
            stack.pop()
        if stack:
            result[i] = stack[-1]
        stack.append(nums[i])
    return result`,
      javascript: `// JavaScript Next Greater Element (Monotonic Stack)
function nextGreaterElement(nums) {
  const n = nums.length;
  const result = new Array(n).fill(-1);
  const stack = [];
  for (let i = n - 1; i >= 0; i--) {
    while (stack.length > 0 && stack[stack.length - 1] <= nums[i]) {
      stack.pop();
    }
    if (stack.length > 0) {
      result[i] = stack[stack.length - 1];
    }
    stack.push(nums[i]);
  }
  return result;
}`
    },
    interviewProTips: [
      'Explain amortized complexity: even though there is a while loop inside a for loop, no element is popped twice. Hence, total operations = 2N, which is strictly O(N).'
    ]
  },

  'sq-5': {
    questionId: 'sq-5',
    pattern: 'Hash Map + Doubly Linked List',
    intuition: [
      'LRU Cache requires O(1) average time for both `get(key)` and `put(key, value)`.',
      'A Hash Map provides O(1) key-to-node lookups.',
      'A Doubly Linked List allows O(1) removal and insertion of nodes at boundaries.',
      'Head is Most Recently Used (MRU), Tail is Least Recently Used (LRU).',
      'When a node is accessed or updated, unlink it from its current position and move it directly after Head.',
      'When capacity exceeds, evict node right before Tail and remove its key from the Hash Map.'
    ],
    pseudocode: [
      'CLASS LRUCache:',
      '  capacity, map, dummyHead, dummyTail',
      '  FUNCTION get(key):',
      '    IF key in map:',
      '      node = map[key]',
      '      removeNode(node); insertAtHead(node)',
      '      RETURN node.val',
      '    RETURN -1',
      '  FUNCTION put(key, val):',
      '    IF key in map:',
      '      removeNode(map[key])',
      '    ELSE IF map.size == capacity:',
      '      evictTail()',
      '    insertAtHead(newNode)'
    ],
    timeComplexity: 'O(1) for get and put',
    spaceComplexity: 'O(Capacity)',
    complexityExplanation: 'HashMap stores capacity keys; Doubly Linked List stores capacity nodes.',
    edgeCases: ['Updating existing key (does not evict, just updates value and freshness)', 'Capacity of 1', 'Repeated gets on same key'],
    code: {
      cpp: `// C++ LRU Cache (HashMap + Doubly Linked List)
#include <unordered_map>

class LRUCache {
    struct Node {
        int key, val;
        Node *prev, *next;
        Node(int k, int v) : key(k), val(v), prev(nullptr), next(nullptr) {}
    };
    int cap;
    std::unordered_map<int, Node*> map;
    Node *head, *tail;

    void remove(Node* node) {
        node->prev->next = node->next;
        node->next->prev = node->prev;
    }
    void insertHead(Node* node) {
        node->next = head->next;
        node->prev = head;
        head->next->prev = node;
        head->next = node;
    }
public:
    LRUCache(int capacity) : cap(capacity) {
        head = new Node(-1, -1);
        tail = new Node(-1, -1);
        head->next = tail;
        tail->prev = head;
    }
    int get(int key) {
        if (map.find(key) == map.end()) return -1;
        Node* node = map[key];
        remove(node);
        insertHead(node);
        return node->val;
    }
    void put(int key, int value) {
        if (map.find(key) != map.end()) {
            remove(map[key]);
            delete map[key];
        } else if (map.size() >= cap) {
            Node* lru = tail->prev;
            remove(lru);
            map.erase(lru->key);
            delete lru;
        }
        Node* node = new Node(key, value);
        insertHead(node);
        map[key] = node;
    }
};`,
      java: `// Java LRU Cache (HashMap + Doubly Linked List)
import java.util.HashMap;
import java.util.Map;

class LRUCache {
    class Node {
        int key, val;
        Node prev, next;
        Node(int k, int v) { this.key = k; this.val = v; }
    }
    private int capacity;
    private Map<Integer, Node> map;
    private Node head, tail;

    public LRUCache(int capacity) {
        this.capacity = capacity;
        this.map = new HashMap<>();
        head = new Node(-1, -1);
        tail = new Node(-1, -1);
        head.next = tail;
        tail.prev = head;
    }
    private void remove(Node node) {
        node.prev.next = node.next;
        node.next.prev = node.prev;
    }
    private void insertHead(Node node) {
        node.next = head.next;
        node.prev = head;
        head.next.prev = node;
        head.next = node;
    }
    public int get(int key) {
        if (!map.containsKey(key)) return -1;
        Node node = map.get(key);
        remove(node);
        insertHead(node);
        return node.val;
    }
    public void put(int key, int value) {
        if (map.containsKey(key)) {
            remove(map.get(key));
        } else if (map.size() >= capacity) {
            Node lru = tail.prev;
            remove(lru);
            map.remove(lru.key);
        }
        Node node = new Node(key, value);
        insertHead(node);
        map.put(key, node);
    }
}`,
      python: `# Python LRU Cache (HashMap + Doubly Linked List)
class Node:
    def __init__(self, key: int, val: int):
        self.key = key
        self.val = val
        self.prev = None
        self.next = None

class LRUCache:
    def __init__(self, capacity: int):
        self.cap = capacity
        self.map = {}
        self.head = Node(-1, -1)
        self.tail = Node(-1, -1)
        self.head.next = self.tail
        self.tail.prev = self.head

    def _remove(self, node: Node):
        node.prev.next = node.next
        node.next.prev = node.prev

    def _insert_head(self, node: Node):
        node.next = self.head.next
        node.prev = self.head
        self.head.next.prev = node
        self.head.next = node

    def get(self, key: int) -> int:
        if key not in self.map:
            return -1
        node = self.map[key]
        self._remove(node)
        self._insert_head(node)
        return node.val

    def put(self, key: int, value: int) -> None:
        if key in self.map:
            self._remove(self.map[key])
        elif len(self.map) >= self.cap:
            lru = self.tail.prev
            self._remove(lru)
            del self.map[lru.key]
        node = Node(key, value)
        self._insert_head(node)
        self.map[key] = node`,
      javascript: `// JavaScript LRU Cache (Map order-preserving)
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.map = new Map();
  }
  get(key) {
    if (!this.map.has(key)) return -1;
    const val = this.map.get(key);
    this.map.delete(key);
    this.map.set(key, val); // Re-insert to refresh order
    return val;
  }
  put(key, value) {
    if (this.map.has(key)) {
      this.map.delete(key);
    } else if (this.map.size >= this.capacity) {
      // Evict oldest (first key in map iterator)
      const oldestKey = this.map.keys().next().value;
      this.map.delete(oldestKey);
    }
    this.map.set(key, value);
  }
}`
    },
    interviewProTips: [
      'In JavaScript, Map maintains key insertion order, but in interviews interviewers expect you to explain the Doubly Linked List + HashMap architecture because it is language-agnostic.'
    ]
  }
};
