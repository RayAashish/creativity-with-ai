import { ProblemSolution } from '../../../types/dsa';

export const LINKED_LIST_ARCHETYPES: Record<string, ProblemSolution> = {
  "reverse_linked_list": {
    "questionId": "archetype-reverse_linked_list",
    "pattern": "In-Place Pointer Mutation (3 Pointers)",
    "intuition": [
      "Maintain three pointers: prev (null), curr (head), next (curr.next).",
      "At each node, redirect curr.next = prev.",
      "Advance prev = curr and curr = next until curr becomes null.",
      "Return prev, which is the new head of the reversed list."
    ],
    "pseudocode": [
      "FUNCTION reverseList(head):",
      "  prev = null; curr = head",
      "  WHILE curr != null:",
      "    next = curr.next",
      "    curr.next = prev",
      "    prev = curr; curr = next",
      "  RETURN prev"
    ],
    "timeComplexity": "O(N)",
    "spaceComplexity": "O(1)",
    "complexityExplanation": "Traverse list once maintaining prev, curr, next pointers to reverse arrows in O(N) time and O(1) extra space.",
    "edgeCases": [
      "Empty list (head == null)",
      "Single node list",
      "List with cycle"
    ],
    "code": {
      "java": "class ListNode {\n    int val;\n    ListNode next;\n    ListNode(int val) { this.val = val; }\n}\n\npublic class Solution {\n    public ListNode reverseList(ListNode head) {\n        ListNode prev = null, curr = head;\n        while (curr != null) {\n            ListNode next = curr.next;\n            curr.next = prev;\n            prev = curr;\n            curr = next;\n        }\n        return prev;\n    }\n}",
      "python": "class ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\nclass Solution:\n    def reverseList(self, head: ListNode | None) -> ListNode | None:\n        prev, curr = None, head\n        while curr:\n            next_node = curr.next\n            curr.next = prev\n            prev = curr\n            curr = next_node\n        return prev",
      "cpp": "struct ListNode {\n    int val;\n    ListNode *next;\n    ListNode(int x) : val(x), next(nullptr) {}\n};\n\nclass Solution {\npublic:\n    ListNode* reverseList(ListNode* head) {\n        ListNode *prev = nullptr, *curr = head;\n        while (curr != nullptr) {\n            ListNode *next = curr->next;\n            curr->next = prev;\n            prev = curr;\n            curr = next;\n        }\n        return prev;\n    }\n};",
      "javascript": "function reverseList(head) {\n    let prev = null, curr = head;\n    while (curr !== null) {\n        const next = curr.next;\n        curr.next = prev;\n        prev = curr;\n        curr = next;\n    }\n    return prev;\n}"
    },
    "approaches": {
      "brute": {
        "name": "Brute Force (Array List Value Extraction)",
        "tier": "brute",
        "badge": "\ud83e\udd49 Brute Force",
        "intuition": [
          "Extract node values to array, reverse array, rewrite list values."
        ],
        "timeComplexity": "O(N)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Copies all values into a dynamic array, reverses the array, and copies values back.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public ListNode reverseListBrute(ListNode head) {\n        List<Integer> values = new ArrayList<>();\n        ListNode curr = head;\n        while (curr != null) {\n            values.add(curr.val);\n            curr = curr.next;\n        }\n        curr = head;\n        for (int i = values.size() - 1; i >= 0; i--) {\n            curr.val = values.get(i);\n            curr = curr.next;\n        }\n        return head;\n    }\n}",
          "python": "class Solution:\n    def reverseListBrute(self, head: ListNode | None) -> ListNode | None:\n        vals = []\n        curr = head\n        while curr:\n            vals.append(curr.val)\n            curr = curr.next\n        curr = head\n        for v in reversed(vals):\n            curr.val = v\n            curr = curr.next\n        return head",
          "cpp": "#include <vector>\n\nclass Solution {\npublic:\n    ListNode* reverseListBrute(ListNode* head) {\n        std::vector<int> vals;\n        ListNode *curr = head;\n        while (curr) { vals.push_back(curr->val); curr = curr->next; }\n        curr = head;\n        for (int i = (int)vals.size() - 1; i >= 0; i--) {\n            curr->val = vals[i];\n            curr = curr->next;\n        }\n        return head;\n    }\n};",
          "javascript": "function reverseListBrute(head) {\n    const vals = [];\n    let curr = head;\n    while (curr) { vals.push(curr.val); curr = curr.next; }\n    curr = head;\n    for (let i = vals.length - 1; i >= 0; i--) {\n        curr.val = vals[i];\n        curr = curr.next;\n    }\n    return head;\n}"
        }
      },
      "better": {
        "name": "Better (Stack-Based Reversal)",
        "tier": "better",
        "badge": "\ud83e\udd48 Better",
        "intuition": [
          "Push all nodes onto a stack and pop to rebuild reversed list."
        ],
        "timeComplexity": "O(N)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Uses LIFO stack to store all nodes then rewires next pointers.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public ListNode reverseListBetter(ListNode head) {\n        if (head == null || head.next == null) return head;\n        Stack<ListNode> stack = new Stack<>();\n        ListNode curr = head;\n        while (curr != null) {\n            stack.push(curr);\n            curr = curr.next;\n        }\n        ListNode newHead = stack.pop();\n        curr = newHead;\n        while (!stack.isEmpty()) {\n            curr.next = stack.pop();\n            curr = curr.next;\n        }\n        curr.next = null;\n        return newHead;\n    }\n}",
          "python": "class Solution:\n    def reverseListBetter(self, head: ListNode | None) -> ListNode | None:\n        if not head or not head.next: return head\n        stack = []\n        curr = head\n        while curr:\n            stack.append(curr)\n            curr = curr.next\n        new_head = stack.pop()\n        curr = new_head\n        while stack:\n            curr.next = stack.pop()\n            curr = curr.next\n        curr.next = None\n        return new_head",
          "cpp": "#include <stack>\n\nclass Solution {\npublic:\n    ListNode* reverseListBetter(ListNode* head) {\n        if (!head || !head->next) return head;\n        std::stack<ListNode*> st;\n        ListNode *curr = head;\n        while (curr) { st.push(curr); curr = curr->next; }\n        ListNode *newHead = st.top(); st.pop();\n        curr = newHead;\n        while (!st.empty()) {\n            curr->next = st.top(); st.pop();\n            curr = curr->next;\n        }\n        curr->next = nullptr;\n        return newHead;\n    }\n};",
          "javascript": "function reverseListBetter(head) {\n    if (!head || !head.next) return head;\n    const stack = [];\n    let curr = head;\n    while (curr) { stack.push(curr); curr = curr.next; }\n    const newHead = stack.pop();\n    curr = newHead;\n    while (stack.length > 0) {\n        curr.next = stack.pop();\n        curr = curr.next;\n    }\n    curr.next = null;\n    return newHead;\n}"
        }
      },
      "optimal": {
        "name": "Optimal (In-Place Pointer Mutation (3 Pointers))",
        "tier": "optimal",
        "badge": "\ud83e\udd47 Optimal",
        "intuition": [
          "Maintain three pointers: prev (null), curr (head), next (curr.next).",
          "At each node, redirect curr.next = prev.",
          "Advance prev = curr and curr = next until curr becomes null.",
          "Return prev, which is the new head of the reversed list."
        ],
        "pseudocode": [
          "FUNCTION reverseList(head):",
          "  prev = null; curr = head",
          "  WHILE curr != null:",
          "    next = curr.next",
          "    curr.next = prev",
          "    prev = curr; curr = next",
          "  RETURN prev"
        ],
        "timeComplexity": "O(N)",
        "spaceComplexity": "O(1)",
        "complexityExplanation": "Traverse list once maintaining prev, curr, next pointers to reverse arrows in O(N) time and O(1) extra space.",
        "code": {
          "java": "class ListNode {\n    int val;\n    ListNode next;\n    ListNode(int val) { this.val = val; }\n}\n\npublic class Solution {\n    public ListNode reverseList(ListNode head) {\n        ListNode prev = null, curr = head;\n        while (curr != null) {\n            ListNode next = curr.next;\n            curr.next = prev;\n            prev = curr;\n            curr = next;\n        }\n        return prev;\n    }\n}",
          "python": "class ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\nclass Solution:\n    def reverseList(self, head: ListNode | None) -> ListNode | None:\n        prev, curr = None, head\n        while curr:\n            next_node = curr.next\n            curr.next = prev\n            prev = curr\n            curr = next_node\n        return prev",
          "cpp": "struct ListNode {\n    int val;\n    ListNode *next;\n    ListNode(int x) : val(x), next(nullptr) {}\n};\n\nclass Solution {\npublic:\n    ListNode* reverseList(ListNode* head) {\n        ListNode *prev = nullptr, *curr = head;\n        while (curr != nullptr) {\n            ListNode *next = curr->next;\n            curr->next = prev;\n            prev = curr;\n            curr = next;\n        }\n        return prev;\n    }\n};",
          "javascript": "function reverseList(head) {\n    let prev = null, curr = head;\n    while (curr !== null) {\n        const next = curr.next;\n        curr.next = prev;\n        prev = curr;\n        curr = next;\n    }\n    return prev;\n}"
        }
      }
    }
  },
  "detect_cycle_linked_list": {
    "questionId": "archetype-detect_cycle_linked_list",
    "pattern": "Floyd's Tortoise and Hare (Fast & Slow Pointers)",
    "intuition": [
      "Initialize slow = head, fast = head.",
      "Advance slow by 1 step (slow = slow.next) and fast by 2 steps (fast = fast.next.next).",
      "If slow == fast at any point, a cycle exists (return true).",
      "If fast reaches null or fast.next is null, the list terminates (return false)."
    ],
    "pseudocode": [
      "FUNCTION hasCycle(head):",
      "  slow = head, fast = head",
      "  WHILE fast != null AND fast.next != null:",
      "    slow = slow.next",
      "    fast = fast.next.next",
      "    IF slow == fast: RETURN true",
      "  RETURN false"
    ],
    "timeComplexity": "O(N)",
    "spaceComplexity": "O(1)",
    "complexityExplanation": "Moves slow pointer by 1 step and fast pointer by 2 steps. If a cycle exists, fast must lap slow inside the loop in O(N) time and O(1) space.",
    "edgeCases": [
      "Empty list",
      "Single node with no cycle",
      "Single node cycling to itself",
      "Cycle of length 2"
    ],
    "code": {
      "java": "public class Solution {\n    public boolean hasCycle(ListNode head) {\n        if (head == null) return false;\n        ListNode slow = head, fast = head;\n        while (fast != null && fast.next != null) {\n            slow = slow.next;\n            fast = fast.next.next;\n            if (slow == fast) return true;\n        }\n        return false;\n    }\n}",
      "python": "class Solution:\n    def hasCycle(self, head: ListNode | None) -> bool:\n        slow = fast = head\n        while fast and fast.next:\n            slow = slow.next\n            fast = fast.next.next\n            if slow == fast: return True\n        return False",
      "cpp": "class Solution {\npublic:\n    bool hasCycle(ListNode *head) {\n        ListNode *slow = head, *fast = head;\n        while (fast && fast->next) {\n            slow = slow->next;\n            fast = fast->next->next;\n            if (slow == fast) return true;\n        }\n        return false;\n    }\n};",
      "javascript": "function hasCycle(head) {\n    let slow = head, fast = head;\n    while (fast !== null && fast.next !== null) {\n        slow = slow.next;\n        fast = fast.next.next;\n        if (slow === fast) return true;\n    }\n    return false;\n}"
    },
    "approaches": {
      "brute": {
        "name": "Brute Force (Node Count Threshold / Sentinel Value)",
        "tier": "brute",
        "badge": "\ud83e\udd49 Brute Force",
        "intuition": [
          "Step up to max possible problem constraints (10,000 steps)."
        ],
        "timeComplexity": "O(N)",
        "spaceComplexity": "O(1)",
        "complexityExplanation": "Traverses up to maximum constraint limit (e.g. 10,001 steps). If limit exceeded, cycle exists.",
        "code": {
          "java": "public class Solution {\n    public boolean hasCycleBrute(ListNode head) {\n        ListNode curr = head;\n        int steps = 0;\n        while (curr != null) {\n            if (++steps > 10005) return true;\n            curr = curr.next;\n        }\n        return false;\n    }\n}",
          "python": "class Solution:\n    def hasCycleBrute(self, head: ListNode | None) -> bool:\n        curr, steps = head, 0\n        while curr:\n            steps += 1\n            if steps > 10005: return True\n            curr = curr.next\n        return False",
          "cpp": "class Solution {\npublic:\n    bool hasCycleBrute(ListNode *head) {\n        ListNode *curr = head;\n        int steps = 0;\n        while (curr) {\n            if (++steps > 10005) return true;\n            curr = curr->next;\n        }\n        return false;\n    }\n};",
          "javascript": "function hasCycleBrute(head) {\n    let curr = head, steps = 0;\n    while (curr !== null) {\n        if (++steps > 10005) return true;\n        curr = curr.next;\n    }\n    return false;\n}"
        }
      },
      "better": {
        "name": "Better (Hash Set of Visited Nodes)",
        "tier": "better",
        "badge": "\ud83e\udd48 Better",
        "intuition": [
          "Keep a HashSet of visited node references."
        ],
        "timeComplexity": "O(N)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Stores node references in a Set to detect previously visited nodes.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public boolean hasCycleBetter(ListNode head) {\n        Set<ListNode> seen = new HashSet<>();\n        ListNode curr = head;\n        while (curr != null) {\n            if (seen.contains(curr)) return true;\n            seen.add(curr);\n            curr = curr.next;\n        }\n        return false;\n    }\n}",
          "python": "class Solution:\n    def hasCycleBetter(self, head: ListNode | None) -> bool:\n        seen = set()\n        curr = head\n        while curr:\n            if curr in seen: return True\n            seen.add(curr)\n            curr = curr.next\n        return False",
          "cpp": "#include <unordered_set>\n\nclass Solution {\npublic:\n    bool hasCycleBetter(ListNode *head) {\n        std::unordered_set<ListNode*> seen;\n        ListNode *curr = head;\n        while (curr) {\n            if (seen.count(curr)) return true;\n            seen.insert(curr);\n            curr = curr->next;\n        }\n        return false;\n    }\n};",
          "javascript": "function hasCycleBetter(head) {\n    const seen = new Set();\n    let curr = head;\n    while (curr !== null) {\n        if (seen.has(curr)) return true;\n        seen.add(curr);\n        curr = curr.next;\n    }\n    return false;\n}"
        }
      },
      "optimal": {
        "name": "Optimal (Floyd's Tortoise and Hare (Fast & Slow Pointers))",
        "tier": "optimal",
        "badge": "\ud83e\udd47 Optimal",
        "intuition": [
          "Initialize slow = head, fast = head.",
          "Advance slow by 1 step (slow = slow.next) and fast by 2 steps (fast = fast.next.next).",
          "If slow == fast at any point, a cycle exists (return true).",
          "If fast reaches null or fast.next is null, the list terminates (return false)."
        ],
        "pseudocode": [
          "FUNCTION hasCycle(head):",
          "  slow = head, fast = head",
          "  WHILE fast != null AND fast.next != null:",
          "    slow = slow.next",
          "    fast = fast.next.next",
          "    IF slow == fast: RETURN true",
          "  RETURN false"
        ],
        "timeComplexity": "O(N)",
        "spaceComplexity": "O(1)",
        "complexityExplanation": "Moves slow pointer by 1 step and fast pointer by 2 steps. If a cycle exists, fast must lap slow inside the loop in O(N) time and O(1) space.",
        "code": {
          "java": "public class Solution {\n    public boolean hasCycle(ListNode head) {\n        if (head == null) return false;\n        ListNode slow = head, fast = head;\n        while (fast != null && fast.next != null) {\n            slow = slow.next;\n            fast = fast.next.next;\n            if (slow == fast) return true;\n        }\n        return false;\n    }\n}",
          "python": "class Solution:\n    def hasCycle(self, head: ListNode | None) -> bool:\n        slow = fast = head\n        while fast and fast.next:\n            slow = slow.next\n            fast = fast.next.next\n            if slow == fast: return True\n        return False",
          "cpp": "class Solution {\npublic:\n    bool hasCycle(ListNode *head) {\n        ListNode *slow = head, *fast = head;\n        while (fast && fast->next) {\n            slow = slow->next;\n            fast = fast->next->next;\n            if (slow == fast) return true;\n        }\n        return false;\n    }\n};",
          "javascript": "function hasCycle(head) {\n    let slow = head, fast = head;\n    while (fast !== null && fast.next !== null) {\n        slow = slow.next;\n        fast = fast.next.next;\n        if (slow === fast) return true;\n    }\n    return false;\n}"
        }
      }
    }
  },
  "cycle_start_node": {
    "questionId": "archetype-cycle_start_node",
    "pattern": "Floyd's Cycle Start Finder",
    "intuition": [
      "Detect meeting point of fast and slow using Floyd's cycle detection.",
      "If fast reaches null, there is no cycle (return null).",
      "Reset slow = head while keeping fast at the meeting node.",
      "Advance both slow and fast by 1 step simultaneously until they meet; that node is the cycle start."
    ],
    "pseudocode": [
      "FUNCTION detectCycle(head):",
      "  slow = head, fast = head",
      "  WHILE fast != null AND fast.next != null:",
      "    slow = slow.next; fast = fast.next.next",
      "    IF slow == fast: BREAK",
      "  IF fast == null OR fast.next == null: RETURN null",
      "  slow = head",
      "  WHILE slow != fast:",
      "    slow = slow.next; fast = fast.next",
      "  RETURN slow"
    ],
    "timeComplexity": "O(N)",
    "spaceComplexity": "O(1)",
    "complexityExplanation": "Once fast meets slow at k steps from loop start, reset slow to head. Moving both 1 step at a time guarantees they meet at the cycle entry node.",
    "edgeCases": [
      "No cycle",
      "Cycle at head (head.next = head)",
      "Cycle at tail"
    ],
    "code": {
      "java": "public class Solution {\n    public ListNode detectCycle(ListNode head) {\n        if (head == null || head.next == null) return null;\n        ListNode slow = head, fast = head;\n        while (fast != null && fast.next != null) {\n            slow = slow.next;\n            fast = fast.next.next;\n            if (slow == fast) break;\n        }\n        if (fast == null || fast.next == null) return null;\n        slow = head;\n        while (slow != fast) {\n            slow = slow.next;\n            fast = fast.next;\n        }\n        return slow;\n    }\n}",
      "python": "class Solution:\n    def detectCycle(self, head: ListNode | None) -> ListNode | None:\n        slow = fast = head\n        while fast and fast.next:\n            slow = slow.next\n            fast = fast.next.next\n            if slow == fast: break\n        else:\n            return None\n        slow = head\n        while slow != fast:\n            slow = slow.next\n            fast = fast.next\n        return slow",
      "cpp": "class Solution {\npublic:\n    ListNode *detectCycle(ListNode *head) {\n        ListNode *slow = head, *fast = head;\n        while (fast && fast->next) {\n            slow = slow->next;\n            fast = fast->next->next;\n            if (slow == fast) break;\n        }\n        if (!fast || !fast->next) return nullptr;\n        slow = head;\n        while (slow != fast) {\n            slow = slow->next;\n            fast = fast->next;\n        }\n        return slow;\n    }\n};",
      "javascript": "function detectCycle(head) {\n    if (!head || !head.next) return null;\n    let slow = head, fast = head;\n    while (fast !== null && fast.next !== null) {\n        slow = slow.next;\n        fast = fast.next.next;\n        if (slow === fast) break;\n    }\n    if (fast === null || fast.next === null) return null;\n    slow = head;\n    while (slow !== fast) {\n        slow = slow.next;\n        fast = fast.next;\n    }\n    return slow;\n}"
    },
    "approaches": {
      "brute": {
        "name": "Brute Force (Nested Traversal for Loop Reachability)",
        "tier": "brute",
        "badge": "\ud83e\udd49 Brute Force",
        "intuition": [
          "Test reachability from each candidate node."
        ],
        "timeComplexity": "O(N\u00b2)",
        "spaceComplexity": "O(1)",
        "complexityExplanation": "For each node, tests if it can be reached again by stepping up to N times.",
        "code": {
          "java": "public class Solution {\n    public ListNode detectCycleBrute(ListNode head) {\n        ListNode curr = head;\n        int maxSteps = 10005;\n        while (curr != null && maxSteps-- > 0) {\n            ListNode check = curr.next;\n            int inner = 0;\n            while (check != null && inner++ < 10005) {\n                if (check == curr) return curr;\n                check = check.next;\n            }\n            curr = curr.next;\n        }\n        return null;\n    }\n}",
          "python": "class Solution:\n    def detectCycleBrute(self, head: ListNode | None) -> ListNode | None:\n        curr, limit = head, 10005\n        while curr and limit > 0:\n            limit -= 1\n            check, inner = curr.next, 0\n            while check and inner < 10005:\n                inner += 1\n                if check == curr: return curr\n                check = check.next\n            curr = curr.next\n        return None",
          "cpp": "class Solution {\npublic:\n    ListNode *detectCycleBrute(ListNode *head) {\n        ListNode *curr = head;\n        int limit = 10005;\n        while (curr && limit-- > 0) {\n            ListNode *check = curr->next;\n            int inner = 0;\n            while (check && inner++ < 10005) {\n                if (check == curr) return curr;\n                check = check->next;\n            }\n            curr = curr->next;\n        }\n        return nullptr;\n    }\n};",
          "javascript": "function detectCycleBrute(head) {\n    let curr = head, limit = 10005;\n    while (curr && limit-- > 0) {\n        let check = curr.next, inner = 0;\n        while (check && inner++ < 10005) {\n            if (check === curr) return curr;\n            check = check.next;\n        }\n        curr = curr.next;\n    }\n    return null;\n}"
        }
      },
      "better": {
        "name": "Better (Hash Set of Visited Nodes)",
        "tier": "better",
        "badge": "\ud83e\udd48 Better",
        "intuition": [
          "First node seen twice in a HashSet is the entry point."
        ],
        "timeComplexity": "O(N)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Tracks visited node references in a Set; the first duplicate node encountered is the cycle start.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public ListNode detectCycleBetter(ListNode head) {\n        Set<ListNode> seen = new HashSet<>();\n        ListNode curr = head;\n        while (curr != null) {\n            if (seen.contains(curr)) return curr;\n            seen.add(curr);\n            curr = curr.next;\n        }\n        return null;\n    }\n}",
          "python": "class Solution:\n    def detectCycleBetter(self, head: ListNode | None) -> ListNode | None:\n        seen = set()\n        curr = head\n        while curr:\n            if curr in seen: return curr\n            seen.add(curr)\n            curr = curr.next\n        return None",
          "cpp": "#include <unordered_set>\n\nclass Solution {\npublic:\n    ListNode *detectCycleBetter(ListNode *head) {\n        std::unordered_set<ListNode*> seen;\n        ListNode *curr = head;\n        while (curr) {\n            if (seen.count(curr)) return curr;\n            seen.insert(curr);\n            curr = curr->next;\n        }\n        return nullptr;\n    }\n};",
          "javascript": "function detectCycleBetter(head) {\n    const seen = new Set();\n    let curr = head;\n    while (curr !== null) {\n        if (seen.has(curr)) return curr;\n        seen.add(curr);\n        curr = curr.next;\n    }\n    return null;\n}"
        }
      },
      "optimal": {
        "name": "Optimal (Floyd's Cycle Start Finder)",
        "tier": "optimal",
        "badge": "\ud83e\udd47 Optimal",
        "intuition": [
          "Detect meeting point of fast and slow using Floyd's cycle detection.",
          "If fast reaches null, there is no cycle (return null).",
          "Reset slow = head while keeping fast at the meeting node.",
          "Advance both slow and fast by 1 step simultaneously until they meet; that node is the cycle start."
        ],
        "pseudocode": [
          "FUNCTION detectCycle(head):",
          "  slow = head, fast = head",
          "  WHILE fast != null AND fast.next != null:",
          "    slow = slow.next; fast = fast.next.next",
          "    IF slow == fast: BREAK",
          "  IF fast == null OR fast.next == null: RETURN null",
          "  slow = head",
          "  WHILE slow != fast:",
          "    slow = slow.next; fast = fast.next",
          "  RETURN slow"
        ],
        "timeComplexity": "O(N)",
        "spaceComplexity": "O(1)",
        "complexityExplanation": "Once fast meets slow at k steps from loop start, reset slow to head. Moving both 1 step at a time guarantees they meet at the cycle entry node.",
        "code": {
          "java": "public class Solution {\n    public ListNode detectCycle(ListNode head) {\n        if (head == null || head.next == null) return null;\n        ListNode slow = head, fast = head;\n        while (fast != null && fast.next != null) {\n            slow = slow.next;\n            fast = fast.next.next;\n            if (slow == fast) break;\n        }\n        if (fast == null || fast.next == null) return null;\n        slow = head;\n        while (slow != fast) {\n            slow = slow.next;\n            fast = fast.next;\n        }\n        return slow;\n    }\n}",
          "python": "class Solution:\n    def detectCycle(self, head: ListNode | None) -> ListNode | None:\n        slow = fast = head\n        while fast and fast.next:\n            slow = slow.next\n            fast = fast.next.next\n            if slow == fast: break\n        else:\n            return None\n        slow = head\n        while slow != fast:\n            slow = slow.next\n            fast = fast.next\n        return slow",
          "cpp": "class Solution {\npublic:\n    ListNode *detectCycle(ListNode *head) {\n        ListNode *slow = head, *fast = head;\n        while (fast && fast->next) {\n            slow = slow->next;\n            fast = fast->next->next;\n            if (slow == fast) break;\n        }\n        if (!fast || !fast->next) return nullptr;\n        slow = head;\n        while (slow != fast) {\n            slow = slow->next;\n            fast = fast->next;\n        }\n        return slow;\n    }\n};",
          "javascript": "function detectCycle(head) {\n    if (!head || !head.next) return null;\n    let slow = head, fast = head;\n    while (fast !== null && fast.next !== null) {\n        slow = slow.next;\n        fast = fast.next.next;\n        if (slow === fast) break;\n    }\n    if (fast === null || fast.next === null) return null;\n    slow = head;\n    while (slow !== fast) {\n        slow = slow.next;\n        fast = fast.next;\n    }\n    return slow;\n}"
        }
      }
    }
  },
  "merge_two_sorted_lists": {
    "questionId": "archetype-merge_two_sorted_lists",
    "pattern": "Dummy Head Two Pointers",
    "intuition": [
      "Create a dummy node and a tail pointer pointing to dummy.",
      "Compare list1.val and list2.val. Attach smaller node to tail.next.",
      "Advance smaller list pointer and tail.",
      "Once one list is exhausted, attach the remaining non-null list directly.",
      "Return dummy.next."
    ],
    "pseudocode": [
      "FUNCTION mergeTwoLists(l1, l2):",
      "  dummy = new Node(0); tail = dummy",
      "  WHILE l1 != null AND l2 != null:",
      "    IF l1.val <= l2.val: tail.next = l1; l1 = l1.next",
      "    ELSE: tail.next = l2; l2 = l2.next",
      "    tail = tail.next",
      "  tail.next = (l1 != null) ? l1 : l2",
      "  RETURN dummy.next"
    ],
    "timeComplexity": "O(N + M)",
    "spaceComplexity": "O(1)",
    "complexityExplanation": "Uses a dummy head sentinel and splices smaller nodes iteratively in O(N + M) time and O(1) space.",
    "edgeCases": [
      "Both lists empty",
      "One list empty",
      "Lists of unequal lengths"
    ],
    "code": {
      "java": "public class Solution {\n    public ListNode mergeTwoLists(ListNode list1, ListNode list2) {\n        ListNode dummy = new ListNode(0), tail = dummy;\n        while (list1 != null && list2 != null) {\n            if (list1.val <= list2.val) {\n                tail.next = list1;\n                list1 = list1.next;\n            } else {\n                tail.next = list2;\n                list2 = list2.next;\n            }\n            tail = tail.next;\n        }\n        tail.next = (list1 != null) ? list1 : list2;\n        return dummy.next;\n    }\n}",
      "python": "class Solution:\n    def mergeTwoLists(self, list1: ListNode | None, list2: ListNode | None) -> ListNode | None:\n        dummy = tail = ListNode(0)\n        while list1 and list2:\n            if list1.val <= list2.val:\n                tail.next = list1\n                list1 = list1.next\n            else:\n                tail.next = list2\n                list2 = list2.next\n            tail = tail.next\n        tail.next = list1 or list2\n        return dummy.next",
      "cpp": "class Solution {\npublic:\n    ListNode* mergeTwoLists(ListNode* list1, ListNode* list2) {\n        ListNode dummy(0);\n        ListNode* tail = &dummy;\n        while (list1 && list2) {\n            if (list1->val <= list2->val) {\n                tail->next = list1;\n                list1 = list1->next;\n            } else {\n                tail->next = list2;\n                list2 = list2->next;\n            }\n            tail = tail->next;\n        }\n        tail->next = list1 ? list1 : list2;\n        return dummy.next;\n    }\n};",
      "javascript": "function mergeTwoLists(list1, list2) {\n    const dummy = { val: 0, next: null };\n    let tail = dummy;\n    while (list1 !== null && list2 !== null) {\n        if (list1.val <= list2.val) {\n            tail.next = list1;\n            list1 = list1.next;\n        } else {\n            tail.next = list2;\n            list2 = list2.next;\n        }\n        tail = tail.next;\n    }\n    tail.next = list1 !== null ? list1 : list2;\n    return dummy.next;\n}"
    },
    "approaches": {
      "brute": {
        "name": "Brute Force (Collect All Values, Sort, Rebuild)",
        "tier": "brute",
        "badge": "\ud83e\udd49 Brute Force",
        "intuition": [
          "Array collect, sort, and rebuild."
        ],
        "timeComplexity": "O((N + M) log(N + M))",
        "spaceComplexity": "O(N + M)",
        "complexityExplanation": "Dumps all node values into an array, sorts array, and constructs new linked list.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public ListNode mergeTwoListsBrute(ListNode l1, ListNode l2) {\n        List<Integer> list = new ArrayList<>();\n        while (l1 != null) { list.add(l1.val); l1 = l1.next; }\n        while (l2 != null) { list.add(l2.val); l2 = l2.next; }\n        Collections.sort(list);\n        ListNode dummy = new ListNode(0), curr = dummy;\n        for (int v : list) {\n            curr.next = new ListNode(v);\n            curr = curr.next;\n        }\n        return dummy.next;\n    }\n}",
          "python": "class Solution:\n    def mergeTwoListsBrute(self, l1: ListNode | None, l2: ListNode | None) -> ListNode | None:\n        vals = []\n        while l1: vals.append(l1.val); l1 = l1.next\n        while l2: vals.append(l2.val); l2 = l2.next\n        vals.sort()\n        dummy = curr = ListNode(0)\n        for v in vals:\n            curr.next = ListNode(v)\n            curr = curr.next\n        return dummy.next",
          "cpp": "#include <vector>\n#include <algorithm>\n\nclass Solution {\npublic:\n    ListNode* mergeTwoListsBrute(ListNode* l1, ListNode* l2) {\n        std::vector<int> vals;\n        while (l1) { vals.push_back(l1->val); l1 = l1->next; }\n        while (l2) { vals.push_back(l2->val); l2 = l2->next; }\n        std::sort(vals.begin(), vals.end());\n        ListNode dummy(0);\n        ListNode* curr = &dummy;\n        for (int v : vals) {\n            curr->next = new ListNode(v);\n            curr = curr->next;\n        }\n        return dummy.next;\n    }\n};",
          "javascript": "function mergeTwoListsBrute(l1, l2) {\n    const vals = [];\n    while (l1) { vals.push(l1.val); l1 = l1.next; }\n    while (l2) { vals.push(l2.val); l2 = l2.next; }\n    vals.sort((a, b) => a - b);\n    const dummy = { val: 0, next: null };\n    let curr = dummy;\n    for (const v of vals) {\n        curr.next = { val: v, next: null };\n        curr = curr.next;\n    }\n    return dummy.next;\n}"
        }
      },
      "better": {
        "name": "Better (Recursive Splicing)",
        "tier": "better",
        "badge": "\ud83e\udd48 Better",
        "intuition": [
          "Recursive merge."
        ],
        "timeComplexity": "O(N + M)",
        "spaceComplexity": "O(N + M)",
        "complexityExplanation": "Recursively returns smaller head connected to merged remainder; takes O(N+M) recursion stack.",
        "code": {
          "java": "public class Solution {\n    public ListNode mergeTwoListsBetter(ListNode l1, ListNode l2) {\n        if (l1 == null) return l2;\n        if (l2 == null) return l1;\n        if (l1.val <= l2.val) {\n            l1.next = mergeTwoListsBetter(l1.next, l2);\n            return l1;\n        } else {\n            l2.next = mergeTwoListsBetter(l1, l2.next);\n            return l2;\n        }\n    }\n}",
          "python": "class Solution:\n    def mergeTwoListsBetter(self, l1: ListNode | None, l2: ListNode | None) -> ListNode | None:\n        if not l1: return l2\n        if not l2: return l1\n        if l1.val <= l2.val:\n            l1.next = self.mergeTwoListsBetter(l1.next, l2)\n            return l1\n        else:\n            l2.next = self.mergeTwoListsBetter(l1, l2.next)\n            return l2",
          "cpp": "class Solution {\npublic:\n    ListNode* mergeTwoListsBetter(ListNode* l1, ListNode* l2) {\n        if (!l1) return l2;\n        if (!l2) return l1;\n        if (l1->val <= l2->val) {\n            l1->next = mergeTwoListsBetter(l1->next, l2);\n            return l1;\n        } else {\n            l2->next = mergeTwoListsBetter(l1, l2->next);\n            return l2;\n        }\n    }\n};",
          "javascript": "function mergeTwoListsBetter(l1, l2) {\n    if (!l1) return l2;\n    if (!l2) return l1;\n    if (l1.val <= l2.val) {\n        l1.next = mergeTwoListsBetter(l1.next, l2);\n        return l1;\n    } else {\n        l2.next = mergeTwoListsBetter(l1, l2.next);\n        return l2;\n    }\n}"
        }
      },
      "optimal": {
        "name": "Optimal (Dummy Head Two Pointers)",
        "tier": "optimal",
        "badge": "\ud83e\udd47 Optimal",
        "intuition": [
          "Create a dummy node and a tail pointer pointing to dummy.",
          "Compare list1.val and list2.val. Attach smaller node to tail.next.",
          "Advance smaller list pointer and tail.",
          "Once one list is exhausted, attach the remaining non-null list directly.",
          "Return dummy.next."
        ],
        "pseudocode": [
          "FUNCTION mergeTwoLists(l1, l2):",
          "  dummy = new Node(0); tail = dummy",
          "  WHILE l1 != null AND l2 != null:",
          "    IF l1.val <= l2.val: tail.next = l1; l1 = l1.next",
          "    ELSE: tail.next = l2; l2 = l2.next",
          "    tail = tail.next",
          "  tail.next = (l1 != null) ? l1 : l2",
          "  RETURN dummy.next"
        ],
        "timeComplexity": "O(N + M)",
        "spaceComplexity": "O(1)",
        "complexityExplanation": "Uses a dummy head sentinel and splices smaller nodes iteratively in O(N + M) time and O(1) space.",
        "code": {
          "java": "public class Solution {\n    public ListNode mergeTwoLists(ListNode list1, ListNode list2) {\n        ListNode dummy = new ListNode(0), tail = dummy;\n        while (list1 != null && list2 != null) {\n            if (list1.val <= list2.val) {\n                tail.next = list1;\n                list1 = list1.next;\n            } else {\n                tail.next = list2;\n                list2 = list2.next;\n            }\n            tail = tail.next;\n        }\n        tail.next = (list1 != null) ? list1 : list2;\n        return dummy.next;\n    }\n}",
          "python": "class Solution:\n    def mergeTwoLists(self, list1: ListNode | None, list2: ListNode | None) -> ListNode | None:\n        dummy = tail = ListNode(0)\n        while list1 and list2:\n            if list1.val <= list2.val:\n                tail.next = list1\n                list1 = list1.next\n            else:\n                tail.next = list2\n                list2 = list2.next\n            tail = tail.next\n        tail.next = list1 or list2\n        return dummy.next",
          "cpp": "class Solution {\npublic:\n    ListNode* mergeTwoLists(ListNode* list1, ListNode* list2) {\n        ListNode dummy(0);\n        ListNode* tail = &dummy;\n        while (list1 && list2) {\n            if (list1->val <= list2->val) {\n                tail->next = list1;\n                list1 = list1->next;\n            } else {\n                tail->next = list2;\n                list2 = list2->next;\n            }\n            tail = tail->next;\n        }\n        tail->next = list1 ? list1 : list2;\n        return dummy.next;\n    }\n};",
          "javascript": "function mergeTwoLists(list1, list2) {\n    const dummy = { val: 0, next: null };\n    let tail = dummy;\n    while (list1 !== null && list2 !== null) {\n        if (list1.val <= list2.val) {\n            tail.next = list1;\n            list1 = list1.next;\n        } else {\n            tail.next = list2;\n            list2 = list2.next;\n        }\n        tail = tail.next;\n    }\n    tail.next = list1 !== null ? list1 : list2;\n    return dummy.next;\n}"
        }
      }
    }
  },
  "intersection_two_lists": {
    "questionId": "archetype-intersection_two_lists",
    "pattern": "Two Pointers Pointer Swap",
    "intuition": [
      "Initialize ptrA = headA, ptrB = headB.",
      "When ptrA reaches null, redirect it to headB; similarly when ptrB reaches null, redirect to headA.",
      "If lists intersect, ptrA and ptrB meet at the intersection node on their second pass.",
      "If lists do not intersect, both hit null simultaneously."
    ],
    "pseudocode": [
      "FUNCTION getIntersectionNode(headA, headB):",
      "  pA = headA, pB = headB",
      "  WHILE pA != pB:",
      "    pA = (pA == null) ? headB : pA.next",
      "    pB = (pB == null) ? headA : pB.next",
      "  RETURN pA"
    ],
    "timeComplexity": "O(N + M)",
    "spaceComplexity": "O(1)",
    "complexityExplanation": "Pointer A advances along list A then jumps to head B; pointer B advances along list B then jumps to head A. They travel identical total distance (a + b) and meet at the intersection in O(1) space.",
    "edgeCases": [
      "No intersection",
      "Identical lists",
      "Intersection at head",
      "Different lengths"
    ],
    "code": {
      "java": "public class Solution {\n    public ListNode getIntersectionNode(ListNode headA, ListNode headB) {\n        if (headA == null || headB == null) return null;\n        ListNode pA = headA, pB = headB;\n        while (pA != pB) {\n            pA = (pA == null) ? headB : pA.next;\n            pB = (pB == null) ? headA : pB.next;\n        }\n        return pA;\n    }\n}",
      "python": "class Solution:\n    def getIntersectionNode(self, headA: ListNode, headB: ListNode) -> ListNode | None:\n        if not headA or not headB: return None\n        pA, pB = headA, headB\n        while pA != pB:\n            pA = headB if not pA else pA.next\n            pB = headA if not pB else pB.next\n        return pA",
      "cpp": "class Solution {\npublic:\n    ListNode *getIntersectionNode(ListNode *headA, ListNode *headB) {\n        if (!headA || !headB) return nullptr;\n        ListNode *pA = headA, *pB = headB;\n        while (pA != pB) {\n            pA = pA ? pA->next : headB;\n            pB = pB ? pB->next : headA;\n        }\n        return pA;\n    }\n};",
      "javascript": "function getIntersectionNode(headA, headB) {\n    if (!headA || !headB) return null;\n    let pA = headA, pB = headB;\n    while (pA !== pB) {\n        pA = pA === null ? headB : pA.next;\n        pB = pB === null ? headA : pB.next;\n    }\n    return pA;\n}"
    },
    "approaches": {
      "brute": {
        "name": "Brute Force (Hash Set of List A Nodes)",
        "tier": "brute",
        "badge": "\ud83e\udd49 Brute Force",
        "intuition": [
          "Store nodes of A in HashSet."
        ],
        "timeComplexity": "O(N + M)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Stores all nodes of List A in a Set and checks each node of List B.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public ListNode getIntersectionNodeBrute(ListNode headA, ListNode headB) {\n        Set<ListNode> set = new HashSet<>();\n        ListNode curr = headA;\n        while (curr != null) { set.add(curr); curr = curr.next; }\n        curr = headB;\n        while (curr != null) {\n            if (set.contains(curr)) return curr;\n            curr = curr.next;\n        }\n        return null;\n    }\n}",
          "python": "class Solution:\n    def getIntersectionNodeBrute(self, headA: ListNode, headB: ListNode) -> ListNode | None:\n        seen = set()\n        curr = headA\n        while curr: seen.add(curr); curr = curr.next\n        curr = headB\n        while curr:\n            if curr in seen: return curr\n            curr = curr.next\n        return None",
          "cpp": "#include <unordered_set>\n\nclass Solution {\npublic:\n    ListNode *getIntersectionNodeBrute(ListNode *headA, ListNode *headB) {\n        std::unordered_set<ListNode*> set;\n        ListNode *curr = headA;\n        while (curr) { set.insert(curr); curr = curr->next; }\n        curr = headB;\n        while (curr) {\n            if (set.count(curr)) return curr;\n            curr = curr->next;\n        }\n        return nullptr;\n    }\n};",
          "javascript": "function getIntersectionNodeBrute(headA, headB) {\n    const set = new Set();\n    let curr = headA;\n    while (curr) { set.add(curr); curr = curr.next; }\n    curr = headB;\n    while (curr) {\n        if (set.has(curr)) return curr;\n        curr = curr.next;\n    }\n    return null;\n}"
        }
      },
      "better": {
        "name": "Better (Length Difference Alignment)",
        "tier": "better",
        "badge": "\ud83e\udd48 Better",
        "intuition": [
          "Align starting positions by length difference."
        ],
        "timeComplexity": "O(N + M)",
        "spaceComplexity": "O(1)",
        "complexityExplanation": "Computes lengths of both lists and advances the longer list by difference delta.",
        "code": {
          "java": "public class Solution {\n    public ListNode getIntersectionNodeBetter(ListNode headA, ListNode headB) {\n        int lenA = getLen(headA), lenB = getLen(headB);\n        ListNode pA = headA, pB = headB;\n        while (lenA > lenB) { pA = pA.next; lenA--; }\n        while (lenB > lenA) { pB = pB.next; lenB--; }\n        while (pA != null && pB != null) {\n            if (pA == pB) return pA;\n            pA = pA.next;\n            pB = pB.next;\n        }\n        return null;\n    }\n    private int getLen(ListNode h) {\n        int l = 0; while (h != null) { l++; h = h.next; } return l;\n    }\n}",
          "python": "class Solution:\n    def getIntersectionNodeBetter(self, headA: ListNode, headB: ListNode) -> ListNode | None:\n        def get_len(h):\n            l = 0\n            while h: l += 1; h = h.next\n            return l\n        lenA, lenB = get_len(headA), get_len(headB)\n        pA, pB = headA, headB\n        while lenA > lenB: pA = pA.next; lenA -= 1\n        while lenB > lenA: pB = pB.next; lenB -= 1\n        while pA and pB:\n            if pA == pB: return pA\n            pA = pA.next; pB = pB.next\n        return None",
          "cpp": "class Solution {\n    int getLen(ListNode* h) { int l = 0; while (h) { l++; h = h->next; } return l; }\npublic:\n    ListNode *getIntersectionNodeBetter(ListNode *headA, ListNode *headB) {\n        int lenA = getLen(headA), lenB = getLen(headB);\n        ListNode *pA = headA, *pB = headB;\n        while (lenA > lenB) { pA = pA->next; lenA--; }\n        while (lenB > lenA) { pB = pB->next; lenB--; }\n        while (pA && pB) {\n            if (pA == pB) return pA;\n            pA = pA->next; pB = pB->next;\n        }\n        return nullptr;\n    }\n};",
          "javascript": "function getIntersectionNodeBetter(headA, headB) {\n    function getLen(h) { let l = 0; while (h) { l++; h = h.next; } return l; }\n    let lenA = getLen(headA), lenB = getLen(headB);\n    let pA = headA, pB = headB;\n    while (lenA > lenB) { pA = pA.next; lenA--; }\n    while (lenB > lenA) { pB = pB.next; lenB--; }\n    while (pA && pB) {\n        if (pA === pB) return pA;\n        pA = pA.next; pB = pB.next;\n    }\n    return null;\n}"
        }
      },
      "optimal": {
        "name": "Optimal (Two Pointers Pointer Swap)",
        "tier": "optimal",
        "badge": "\ud83e\udd47 Optimal",
        "intuition": [
          "Initialize ptrA = headA, ptrB = headB.",
          "When ptrA reaches null, redirect it to headB; similarly when ptrB reaches null, redirect to headA.",
          "If lists intersect, ptrA and ptrB meet at the intersection node on their second pass.",
          "If lists do not intersect, both hit null simultaneously."
        ],
        "pseudocode": [
          "FUNCTION getIntersectionNode(headA, headB):",
          "  pA = headA, pB = headB",
          "  WHILE pA != pB:",
          "    pA = (pA == null) ? headB : pA.next",
          "    pB = (pB == null) ? headA : pB.next",
          "  RETURN pA"
        ],
        "timeComplexity": "O(N + M)",
        "spaceComplexity": "O(1)",
        "complexityExplanation": "Pointer A advances along list A then jumps to head B; pointer B advances along list B then jumps to head A. They travel identical total distance (a + b) and meet at the intersection in O(1) space.",
        "code": {
          "java": "public class Solution {\n    public ListNode getIntersectionNode(ListNode headA, ListNode headB) {\n        if (headA == null || headB == null) return null;\n        ListNode pA = headA, pB = headB;\n        while (pA != pB) {\n            pA = (pA == null) ? headB : pA.next;\n            pB = (pB == null) ? headA : pB.next;\n        }\n        return pA;\n    }\n}",
          "python": "class Solution:\n    def getIntersectionNode(self, headA: ListNode, headB: ListNode) -> ListNode | None:\n        if not headA or not headB: return None\n        pA, pB = headA, headB\n        while pA != pB:\n            pA = headB if not pA else pA.next\n            pB = headA if not pB else pB.next\n        return pA",
          "cpp": "class Solution {\npublic:\n    ListNode *getIntersectionNode(ListNode *headA, ListNode *headB) {\n        if (!headA || !headB) return nullptr;\n        ListNode *pA = headA, *pB = headB;\n        while (pA != pB) {\n            pA = pA ? pA->next : headB;\n            pB = pB ? pB->next : headA;\n        }\n        return pA;\n    }\n};",
          "javascript": "function getIntersectionNode(headA, headB) {\n    if (!headA || !headB) return null;\n    let pA = headA, pB = headB;\n    while (pA !== pB) {\n        pA = pA === null ? headB : pA.next;\n        pB = pB === null ? headA : pB.next;\n    }\n    return pA;\n}"
        }
      }
    }
  }
};
