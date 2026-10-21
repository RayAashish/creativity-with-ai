import { ProblemSolution } from '../../types/dsa';

export const LINKED_LIST_SOLUTIONS: Record<string, ProblemSolution> = {
  'll-1': {
    questionId: 'll-1',
    pattern: 'Pointer Redirection (prev, curr, next)',
    intuition: [
      'In a singly linked list, each node points to the next node. Reversal means changing each `curr.next` to point to `prev`.',
      'Because modifying `curr.next` destroys the link to the remaining list, store `next = curr.next` before redirecting.',
      'Set `curr.next = prev`, then shift both pointers: `prev = curr` and `curr = next`.',
      'When `curr == null`, `prev` points to the new head of the reversed list.'
    ],
    pseudocode: [
      'FUNCTION reverseList(head):',
      '  prev = null, curr = head',
      '  WHILE curr is NOT null:',
      '    nextTemp = curr.next',
      '    curr.next = prev',
      '    prev = curr',
      '    curr = nextTemp',
      '  RETURN prev'
    ],
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(1)',
    complexityExplanation: 'Single linear pass visiting each node once without heap allocation.',
    edgeCases: ['Empty list (head == null)', 'Single node list', 'Two-node list'],
    code: {
      cpp: `// C++ Reverse Linked List (Iterative)
struct ListNode {
    int val;
    ListNode *next;
    ListNode(int x) : val(x), next(nullptr) {}
};

ListNode* reverseList(ListNode* head) {
    ListNode* prev = nullptr;
    ListNode* curr = head;
    while (curr != nullptr) {
        ListNode* nextTemp = curr->next;
        curr->next = prev;
        prev = curr;
        curr = nextTemp;
    }
    return prev;
}`,
      java: `// Java Reverse Linked List (Iterative)
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
      python: `# Python Reverse Linked List (Iterative)
class Solution:
    def reverseList(self, head: Optional[ListNode]) -> Optional[ListNode]:
        prev = None
        curr = head
        while curr:
            next_temp = curr.next
            curr.next = prev
            prev = curr
            curr = next_temp
        return prev`,
      javascript: `// JavaScript Reverse Linked List (Iterative)
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
    },
    interviewProTips: [
      'Always sketch the 3 pointers (prev, curr, nextTemp) on a whiteboard first. Mention the recursive approach exists but uses O(N) stack frames, so iterative O(1) space is preferred.'
    ]
  },

  'll-3': {
    questionId: 'll-3',
    pattern: "Floyd's Tortoise and Hare (Fast & Slow Pointers)",
    intuition: [
      'Use two pointers moving at different speeds: `slow` moves 1 step at a time, `fast` moves 2 steps at a time.',
      'If the linked list is acyclic, `fast` will hit `null` and terminate.',
      'If there is a cycle, `fast` enters the loop first. With each step, the distance between `fast` and `slow` inside the loop decreases by exactly 1.',
      'Therefore, `fast` is guaranteed to catch up to `slow` in at most the cycle length steps without looping infinitely.'
    ],
    pseudocode: [
      'FUNCTION hasCycle(head):',
      '  IF head is null: RETURN false',
      '  slow = head, fast = head',
      '  WHILE fast is NOT null AND fast.next is NOT null:',
      '    slow = slow.next',
      '    fast = fast.next.next',
      '    IF slow == fast: RETURN true',
      '  RETURN false'
    ],
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(1)',
    complexityExplanation: 'Fast pointer catches slow in at most O(N) operations without using hash tables.',
    edgeCases: ['List with 0 or 1 node without cycle', 'Single node pointing to itself', 'Cycle spanning entire list'],
    code: {
      cpp: `// C++ Floyd's Cycle Detection
bool hasCycle(ListNode *head) {
    if (!head) return false;
    ListNode *slow = head;
    ListNode *fast = head;
    while (fast != nullptr && fast->next != nullptr) {
        slow = slow->next;
        fast = fast->next->next;
        if (slow == fast) return true;
    }
    return false;
}`,
      java: `// Java Floyd's Cycle Detection
public class Solution {
    public boolean hasCycle(ListNode head) {
        if (head == null) return false;
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
      python: `# Python Floyd's Cycle Detection
class Solution:
    def hasCycle(self, head: Optional[ListNode]) -> bool:
        slow = fast = head
        while fast and fast.next:
            slow = slow.next
            fast = fast.next.next
            if slow == fast:
                return True
        return False`,
      javascript: `// JavaScript Floyd's Cycle Detection
function hasCycle(head) {
  let slow = head;
  let fast = head;
  while (fast !== null && fast.next !== null) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) return true;
  }
  return false;
}`
    },
    interviewProTips: [
      'Explain mathematical proof: relative speed of fast relative to slow is 2 - 1 = 1 node per iteration, so distance between them modulo loop length strictly decreases by 1.'
    ]
  },

  'll-4': {
    questionId: 'll-4',
    pattern: "Floyd's Cycle Origin Math",
    intuition: [
      'Detect collision point using slow and fast pointers.',
      'Math proof: Let distance from head to cycle entrance be `L1`, and distance from entrance to meeting point be `L2`.',
      'Total distance slow traveled = `L1 + L2`. Fast traveled = `L1 + L2 + n * C` (where C is cycle length).',
      'Since fast moves twice as fast: `2*(L1 + L2) = L1 + L2 + n*C` -> `L1 = n*C - L2`.',
      'This means: if we reset one pointer back to `head` and advance both pointers 1 step at a time, they will meet exactly at the cycle entrance!'
    ],
    pseudocode: [
      'FUNCTION detectCycle(head):',
      '  slow = head, fast = head',
      '  WHILE fast and fast.next:',
      '    slow = slow.next, fast = fast.next.next',
      '    IF slow == fast:',
      '      entry = head',
      '      WHILE entry != slow:',
      '        entry = entry.next',
      '        slow = slow.next',
      '      RETURN entry',
      '  RETURN null'
    ],
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(1)',
    complexityExplanation: 'Finding collision takes O(N), finding cycle start takes another O(N). Total O(N) time with O(1) space.',
    edgeCases: ['No cycle exists', 'Cycle begins immediately at head', 'Single node loop'],
    code: {
      cpp: `// C++ Find Starting Node of Loop
ListNode *detectCycle(ListNode *head) {
    ListNode *slow = head, *fast = head;
    while (fast && fast->next) {
        slow = slow->next;
        fast = fast->next->next;
        if (slow == fast) {
            ListNode *entry = head;
            while (entry != slow) {
                entry = entry->next;
                slow = slow->next;
            }
            return entry;
        }
    }
    return nullptr;
}`,
      java: `// Java Find Starting Node of Loop
public class Solution {
    public ListNode detectCycle(ListNode head) {
        ListNode slow = head, fast = head;
        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
            if (slow == fast) {
                ListNode entry = head;
                while (entry != slow) {
                    entry = entry.next;
                    slow = slow.next;
                }
                return entry;
            }
        }
        return null;
    }
}`,
      python: `# Python Find Starting Node of Loop
class Solution:
    def detectCycle(self, head: Optional[ListNode]) -> Optional[ListNode]:
        slow = fast = head
        while fast and fast.next:
            slow = slow.next
            fast = fast.next.next
            if slow == fast:
                entry = head
                while entry != slow:
                    entry = entry.next
                    slow = slow.next
                return entry
        return None`,
      javascript: `// JavaScript Find Starting Node of Loop
function detectCycle(head) {
  let slow = head, fast = head;
  while (fast !== null && fast.next !== null) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) {
      let entry = head;
      while (entry !== slow) {
        entry = entry.next;
        slow = slow.next;
      }
      return entry;
    }
  }
  return null;
}`
    },
    interviewProTips: [
      'Explaining the algebra equation `L1 = n*C - L2` clearly is the #1 way to stand out during this classic interview question.'
    ]
  }
};
