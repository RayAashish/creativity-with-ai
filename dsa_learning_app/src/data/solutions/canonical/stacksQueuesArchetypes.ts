import { ProblemSolution } from '../../../types/dsa';

export const STACKS_QUEUES_ARCHETYPES: Record<string, ProblemSolution> = {
  "valid_parentheses": {
    "questionId": "archetype-valid_parentheses",
    "pattern": "Monotonic Stack Character Matching",
    "intuition": [
      "For each opening bracket '(', '{', '[', push the corresponding closing bracket ')', '}', ']'.",
      "For each closing bracket, check if stack is non-empty and popped element matches.",
      "At the end of string, the stack must be completely empty."
    ],
    "pseudocode": [
      "FUNCTION isValid(s):",
      "  stack = []",
      "  FOR char c IN s:",
      "    IF c == '(': stack.push(')')",
      "    ELSE IF c == '{': stack.push('}')",
      "    ELSE IF c == '[': stack.push(']')",
      "    ELSE IF stack.isEmpty() OR stack.pop() != c: RETURN false",
      "  RETURN stack.isEmpty()"
    ],
    "timeComplexity": "O(N)",
    "spaceComplexity": "O(N)",
    "complexityExplanation": "Pushes expected closing brackets onto a stack when opening brackets are encountered; pops and checks on closers.",
    "edgeCases": [
      "Empty string",
      "Odd length string (immediately false)",
      "Starting with closing bracket",
      "Unclosed opening brackets"
    ],
    "code": {
      "java": "import java.util.*;\n\npublic class Solution {\n    public boolean isValid(String s) {\n        if (s.length() % 2 != 0) return false;\n        Stack<Character> stack = new Stack<>();\n        for (char c : s.toCharArray()) {\n            if (c == '(') stack.push(')');\n            else if (c == '{') stack.push('}');\n            else if (c == '[') stack.push(']');\n            else if (stack.isEmpty() || stack.pop() != c) return false;\n        }\n        return stack.isEmpty();\n    }\n}",
      "python": "class Solution:\n    def isValid(self, s: str) -> bool:\n        if len(s) % 2 != 0: return False\n        stack = []\n        mapping = {'(': ')', '{': '}', '[': ']'}\n        for c in s:\n            if c in mapping: stack.append(mapping[c])\n            elif not stack or stack.pop() != c: return False\n        return not stack",
      "cpp": "#include <string>\n#include <stack>\n\nclass Solution {\npublic:\n    bool isValid(std::string s) {\n        if (s.length() % 2 != 0) return false;\n        std::stack<char> st;\n        for (char c : s) {\n            if (c == '(') st.push(')');\n            else if (c == '{') st.push('}');\n            else if (c == '[') st.push(']');\n            else if (st.empty() || st.top() != c) return false;\n            else st.pop();\n        }\n        return st.empty();\n    }\n};",
      "javascript": "function isValid(s) {\n    if (s.length % 2 !== 0) return false;\n    const stack = [];\n    for (let i = 0; i < s.length; i++) {\n        const c = s[i];\n        if (c === '(') stack.push(')');\n        else if (c === '{') stack.push('}');\n        else if (c === '[') stack.push(']');\n        else if (stack.length === 0 || stack.pop() !== c) return false;\n    }\n    return stack.length === 0;\n}"
    },
    "approaches": {
      "brute": {
        "name": "Brute Force (String Replacement of Matching Pairs)",
        "tier": "brute",
        "badge": "\ud83e\udd49 Brute Force",
        "intuition": [
          "Repeated string pair reduction."
        ],
        "timeComplexity": "O(N\u00b2)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Repeatedly replaces instances of '()', '{}', '[]' with empty string until none remain.",
        "code": {
          "java": "public class Solution {\n    public boolean isValidBrute(String s) {\n        int len;\n        do {\n            len = s.length();\n            s = s.replace(\"()\", \"\").replace(\"{}\", \"\").replace(\"[]\", \"\");\n        } while (s.length() < len);\n        return s.isEmpty();\n    }\n}",
          "python": "class Solution:\n    def isValidBrute(self, s: str) -> bool:\n        while '()' in s or '{}' in s or '[]' in s:\n            s = s.replace('()', '').replace('{}', '').replace('[]', '')\n        return len(s) == 0",
          "cpp": "#include <string>\n\nclass Solution {\npublic:\n    bool isValidBrute(std::string s) {\n        size_t len;\n        do {\n            len = s.length();\n            size_t pos;\n            if ((pos = s.find(\"()\")) != std::string::npos) s.erase(pos, 2);\n            else if ((pos = s.find(\"{}\")) != std::string::npos) s.erase(pos, 2);\n            else if ((pos = s.find(\"[]\")) != std::string::npos) s.erase(pos, 2);\n        } while (s.length() < len);\n        return s.empty();\n    }\n};",
          "javascript": "function isValidBrute(s) {\n    let len;\n    do {\n        len = s.length;\n        s = s.replace(\"()\", \"\").replace(\"{}\", \"\").replace(\"[]\", \"\");\n    } while (s.length < len);\n    return s.length === 0;\n}"
        }
      },
      "better": {
        "name": "Better (Stack with HashMap Lookup)",
        "tier": "better",
        "badge": "\ud83e\udd48 Better",
        "intuition": [
          "Map closer to opener."
        ],
        "timeComplexity": "O(N)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Uses a lookup map for closing-to-opening bracket relations with explicit stack management.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public boolean isValidBetter(String s) {\n        Map<Character, Character> map = new HashMap<>();\n        map.put(')', '('); map.put('}', '{'); map.put(']', '[');\n        Stack<Character> stack = new Stack<>();\n        for (char c : s.toCharArray()) {\n            if (map.containsKey(c)) {\n                if (stack.isEmpty() || stack.pop() != map.get(c)) return false;\n            } else {\n                stack.push(c);\n            }\n        }\n        return stack.isEmpty();\n    }\n}",
          "python": "class Solution:\n    def isValidBetter(self, s: str) -> bool:\n        map_brackets = {')': '(', '}': '{', ']': '['}\n        stack = []\n        for c in s:\n            if c in map_brackets:\n                if not stack or stack.pop() != map_brackets[c]: return False\n            else:\n                stack.append(c)\n        return not stack",
          "cpp": "#include <string>\n#include <stack>\n#include <unordered_map>\n\nclass Solution {\npublic:\n    bool isValidBetter(std::string s) {\n        std::unordered_map<char, char> map = {{')','('},{'}','{'},{']','['}};\n        std::stack<char> st;\n        for (char c : s) {\n            if (map.count(c)) {\n                if (st.empty() || st.top() != map[c]) return false;\n                st.pop();\n            } else st.push(c);\n        }\n        return st.empty();\n    }\n};",
          "javascript": "function isValidBetter(s) {\n    const map = { ')': '(', '}': '{', ']': '[' };\n    const stack = [];\n    for (const c of s) {\n        if (c in map) {\n            if (stack.length === 0 || stack.pop() !== map[c]) return false;\n        } else {\n            stack.push(c);\n        }\n    }\n    return stack.length === 0;\n}"
        }
      },
      "optimal": {
        "name": "Optimal (Monotonic Stack Character Matching)",
        "tier": "optimal",
        "badge": "\ud83e\udd47 Optimal",
        "intuition": [
          "For each opening bracket '(', '{', '[', push the corresponding closing bracket ')', '}', ']'.",
          "For each closing bracket, check if stack is non-empty and popped element matches.",
          "At the end of string, the stack must be completely empty."
        ],
        "pseudocode": [
          "FUNCTION isValid(s):",
          "  stack = []",
          "  FOR char c IN s:",
          "    IF c == '(': stack.push(')')",
          "    ELSE IF c == '{': stack.push('}')",
          "    ELSE IF c == '[': stack.push(']')",
          "    ELSE IF stack.isEmpty() OR stack.pop() != c: RETURN false",
          "  RETURN stack.isEmpty()"
        ],
        "timeComplexity": "O(N)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Pushes expected closing brackets onto a stack when opening brackets are encountered; pops and checks on closers.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public boolean isValid(String s) {\n        if (s.length() % 2 != 0) return false;\n        Stack<Character> stack = new Stack<>();\n        for (char c : s.toCharArray()) {\n            if (c == '(') stack.push(')');\n            else if (c == '{') stack.push('}');\n            else if (c == '[') stack.push(']');\n            else if (stack.isEmpty() || stack.pop() != c) return false;\n        }\n        return stack.isEmpty();\n    }\n}",
          "python": "class Solution:\n    def isValid(self, s: str) -> bool:\n        if len(s) % 2 != 0: return False\n        stack = []\n        mapping = {'(': ')', '{': '}', '[': ']'}\n        for c in s:\n            if c in mapping: stack.append(mapping[c])\n            elif not stack or stack.pop() != c: return False\n        return not stack",
          "cpp": "#include <string>\n#include <stack>\n\nclass Solution {\npublic:\n    bool isValid(std::string s) {\n        if (s.length() % 2 != 0) return false;\n        std::stack<char> st;\n        for (char c : s) {\n            if (c == '(') st.push(')');\n            else if (c == '{') st.push('}');\n            else if (c == '[') st.push(']');\n            else if (st.empty() || st.top() != c) return false;\n            else st.pop();\n        }\n        return st.empty();\n    }\n};",
          "javascript": "function isValid(s) {\n    if (s.length % 2 !== 0) return false;\n    const stack = [];\n    for (let i = 0; i < s.length; i++) {\n        const c = s[i];\n        if (c === '(') stack.push(')');\n        else if (c === '{') stack.push('}');\n        else if (c === '[') stack.push(']');\n        else if (stack.length === 0 || stack.pop() !== c) return false;\n    }\n    return stack.length === 0;\n}"
        }
      }
    }
  },
  "next_greater_element": {
    "questionId": "archetype-next_greater_element",
    "pattern": "Monotonic Decreasing Stack",
    "intuition": [
      "Traverse from index n - 1 down to 0.",
      "Pop elements from stack that are less than or equal to current element (they cannot be next greater for any element to the left).",
      "If stack is empty, next greater is -1; otherwise, it is stack.peek().",
      "Push current element onto stack."
    ],
    "pseudocode": [
      "FUNCTION nextGreaterElements(nums):",
      "  stack = []; res = Array(n, -1)",
      "  FOR i from n - 1 DOWNTO 0:",
      "    WHILE !stack.isEmpty() AND stack.peek() <= nums[i]:",
      "      stack.pop()",
      "    res[i] = stack.isEmpty() ? -1 : stack.peek()",
      "    stack.push(nums[i])",
      "  RETURN res"
    ],
    "timeComplexity": "O(N)",
    "spaceComplexity": "O(N)",
    "complexityExplanation": "Traverse array backwards, maintaining elements in strictly decreasing order on stack to find next greater in O(1) amortized.",
    "edgeCases": [
      "Array with strictly decreasing elements (all -1)",
      "Array with strictly increasing elements",
      "Duplicates"
    ],
    "code": {
      "java": "import java.util.*;\n\npublic class Solution {\n    public int[] nextGreaterElements(int[] nums) {\n        int n = nums.length;\n        int[] res = new int[n];\n        Stack<Integer> stack = new Stack<>();\n        for (int i = n - 1; i >= 0; i--) {\n            while (!stack.isEmpty() && stack.peek() <= nums[i]) {\n                stack.pop();\n            }\n            res[i] = stack.isEmpty() ? -1 : stack.peek();\n            stack.push(nums[i]);\n        }\n        return res;\n    }\n}",
      "python": "class Solution:\n    def nextGreaterElements(self, nums: list[int]) -> list[int]:\n        n = len(nums)\n        res, stack = [-1] * n, []\n        for i in range(n - 1, -1, -1):\n            while stack and stack[-1] <= nums[i]:\n                stack.pop()\n            res[i] = stack[-1] if stack else -1\n            stack.append(nums[i])\n        return res",
      "cpp": "#include <vector>\n#include <stack>\n\nclass Solution {\npublic:\n    std::vector<int> nextGreaterElements(std::vector<int>& nums) {\n        int n = nums.size();\n        std::vector<int> res(n, -1);\n        std::stack<int> st;\n        for (int i = n - 1; i >= 0; i--) {\n            while (!st.empty() && st.top() <= nums[i]) st.pop();\n            res[i] = st.empty() ? -1 : st.top();\n            st.push(nums[i]);\n        }\n        return res;\n    }\n};",
      "javascript": "function nextGreaterElements(nums) {\n    const n = nums.length;\n    const res = new Array(n).fill(-1);\n    const stack = [];\n    for (let i = n - 1; i >= 0; i--) {\n        while (stack.length > 0 && stack[stack.length - 1] <= nums[i]) {\n            stack.pop();\n        }\n        res[i] = stack.length === 0 ? -1 : stack[stack.length - 1];\n        stack.push(nums[i]);\n    }\n    return res;\n}"
    },
    "approaches": {
      "brute": {
        "name": "Brute Force (Nested Loops Search to the Right)",
        "tier": "brute",
        "badge": "\ud83e\udd49 Brute Force",
        "intuition": [
          "Exhaustive scan rightward."
        ],
        "timeComplexity": "O(N\u00b2)",
        "spaceComplexity": "O(1)",
        "complexityExplanation": "For each element at index i, scans all indices j > i to find the first greater element.",
        "code": {
          "java": "public class Solution {\n    public int[] nextGreaterElementsBrute(int[] nums) {\n        int n = nums.length;\n        int[] res = new int[n];\n        for (int i = 0; i < n; i++) {\n            res[i] = -1;\n            for (int j = i + 1; j < n; j++) {\n                if (nums[j] > nums[i]) {\n                    res[i] = nums[j];\n                    break;\n                }\n            }\n        }\n        return res;\n    }\n}",
          "python": "class Solution:\n    def nextGreaterElementsBrute(self, nums: list[int]) -> list[int]:\n        n = len(nums)\n        res = [-1] * n\n        for i in range(n):\n            for j in range(i + 1, n):\n                if nums[j] > nums[i]:\n                    res[i] = nums[j]\n                    break\n        return res",
          "cpp": "#include <vector>\n\nclass Solution {\npublic:\n    std::vector<int> nextGreaterElementsBrute(std::vector<int>& nums) {\n        int n = nums.size();\n        std::vector<int> res(n, -1);\n        for (int i = 0; i < n; i++) {\n            for (int j = i + 1; j < n; j++) {\n                if (nums[j] > nums[i]) { res[i] = nums[j]; break; }\n            }\n        }\n        return res;\n    }\n};",
          "javascript": "function nextGreaterElementsBrute(nums) {\n    const n = nums.length;\n    const res = new Array(n).fill(-1);\n    for (let i = 0; i < n; i++) {\n        for (let j = i + 1; j < n; j++) {\n            if (nums[j] > nums[i]) { res[i] = nums[j]; break; }\n        }\n    }\n    return res;\n}"
        }
      },
      "better": {
        "name": "Better (Forward Pass Stack Storing Indices)",
        "tier": "better",
        "badge": "\ud83e\udd48 Better",
        "intuition": [
          "Forward pass index stack."
        ],
        "timeComplexity": "O(N)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Traverses left-to-right pushing unresolved indices onto stack, resolving when greater element found.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int[] nextGreaterElementsBetter(int[] nums) {\n        int n = nums.length;\n        int[] res = new int[n];\n        Arrays.fill(res, -1);\n        Stack<Integer> stack = new Stack<>();\n        for (int i = 0; i < n; i++) {\n            while (!stack.isEmpty() && nums[i] > nums[stack.peek()]) {\n                res[stack.pop()] = nums[i];\n            }\n            stack.push(i);\n        }\n        return res;\n    }\n}",
          "python": "class Solution:\n    def nextGreaterElementsBetter(self, nums: list[int]) -> list[int]:\n        res, stack = [-1] * len(nums), []\n        for i, num in enumerate(nums):\n            while stack and num > nums[stack[-1]]:\n                res[stack.pop()] = num\n            stack.append(i)\n        return res",
          "cpp": "#include <vector>\n#include <stack>\n\nclass Solution {\npublic:\n    std::vector<int> nextGreaterElementsBetter(std::vector<int>& nums) {\n        int n = nums.size();\n        std::vector<int> res(n, -1);\n        std::stack<int> st;\n        for (int i = 0; i < n; i++) {\n            while (!st.empty() && nums[i] > nums[st.top()]) {\n                res[st.top()] = nums[i]; st.pop();\n            }\n            st.push(i);\n        }\n        return res;\n    }\n};",
          "javascript": "function nextGreaterElementsBetter(nums) {\n    const n = nums.length;\n    const res = new Array(n).fill(-1);\n    const stack = [];\n    for (let i = 0; i < n; i++) {\n        while (stack.length > 0 && nums[i] > nums[stack[stack.length - 1]]) {\n            res[stack.pop()] = nums[i];\n        }\n        stack.push(i);\n    }\n    return res;\n}"
        }
      },
      "optimal": {
        "name": "Optimal (Monotonic Decreasing Stack)",
        "tier": "optimal",
        "badge": "\ud83e\udd47 Optimal",
        "intuition": [
          "Traverse from index n - 1 down to 0.",
          "Pop elements from stack that are less than or equal to current element (they cannot be next greater for any element to the left).",
          "If stack is empty, next greater is -1; otherwise, it is stack.peek().",
          "Push current element onto stack."
        ],
        "pseudocode": [
          "FUNCTION nextGreaterElements(nums):",
          "  stack = []; res = Array(n, -1)",
          "  FOR i from n - 1 DOWNTO 0:",
          "    WHILE !stack.isEmpty() AND stack.peek() <= nums[i]:",
          "      stack.pop()",
          "    res[i] = stack.isEmpty() ? -1 : stack.peek()",
          "    stack.push(nums[i])",
          "  RETURN res"
        ],
        "timeComplexity": "O(N)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Traverse array backwards, maintaining elements in strictly decreasing order on stack to find next greater in O(1) amortized.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int[] nextGreaterElements(int[] nums) {\n        int n = nums.length;\n        int[] res = new int[n];\n        Stack<Integer> stack = new Stack<>();\n        for (int i = n - 1; i >= 0; i--) {\n            while (!stack.isEmpty() && stack.peek() <= nums[i]) {\n                stack.pop();\n            }\n            res[i] = stack.isEmpty() ? -1 : stack.peek();\n            stack.push(nums[i]);\n        }\n        return res;\n    }\n}",
          "python": "class Solution:\n    def nextGreaterElements(self, nums: list[int]) -> list[int]:\n        n = len(nums)\n        res, stack = [-1] * n, []\n        for i in range(n - 1, -1, -1):\n            while stack and stack[-1] <= nums[i]:\n                stack.pop()\n            res[i] = stack[-1] if stack else -1\n            stack.append(nums[i])\n        return res",
          "cpp": "#include <vector>\n#include <stack>\n\nclass Solution {\npublic:\n    std::vector<int> nextGreaterElements(std::vector<int>& nums) {\n        int n = nums.size();\n        std::vector<int> res(n, -1);\n        std::stack<int> st;\n        for (int i = n - 1; i >= 0; i--) {\n            while (!st.empty() && st.top() <= nums[i]) st.pop();\n            res[i] = st.empty() ? -1 : st.top();\n            st.push(nums[i]);\n        }\n        return res;\n    }\n};",
          "javascript": "function nextGreaterElements(nums) {\n    const n = nums.length;\n    const res = new Array(n).fill(-1);\n    const stack = [];\n    for (let i = n - 1; i >= 0; i--) {\n        while (stack.length > 0 && stack[stack.length - 1] <= nums[i]) {\n            stack.pop();\n        }\n        res[i] = stack.length === 0 ? -1 : stack[stack.length - 1];\n        stack.push(nums[i]);\n    }\n    return res;\n}"
        }
      }
    }
  },
  "largest_rectangle_histogram": {
    "questionId": "archetype-largest_rectangle_histogram",
    "pattern": "Monotonic Increasing Stack",
    "intuition": [
      "Initialize stack with -1 representing left boundary.",
      "Iterate index i from 0 to n. When heights[i] < heights[stack.peek()], pop height h.",
      "Width = i - stack.peek() - 1. Area = h * width. Update maxArea.",
      "Append 0-height sentinel at the end to flush all remaining bars from stack."
    ],
    "pseudocode": [
      "FUNCTION largestRectangleArea(heights):",
      "  stack = [-1]; maxArea = 0",
      "  FOR i from 0 TO heights.length:",
      "    h = (i == n) ? 0 : heights[i]",
      "    WHILE stack.peek() != -1 AND heights[stack.peek()] >= h:",
      "      height = heights[stack.pop()]",
      "      width = i - stack.peek() - 1",
      "      maxArea = MAX(maxArea, height * width)",
      "    stack.push(i)",
      "  RETURN maxArea"
    ],
    "timeComplexity": "O(N)",
    "spaceComplexity": "O(N)",
    "complexityExplanation": "Maintains bar indices in increasing height order; when current bar is shorter than top, pop and calculate area with popped bar as bottleneck.",
    "edgeCases": [
      "Single bar",
      "All equal heights",
      "Strictly increasing heights",
      "Strictly decreasing heights"
    ],
    "code": {
      "java": "import java.util.*;\n\npublic class Solution {\n    public int largestRectangleArea(int[] heights) {\n        int n = heights.length, maxArea = 0;\n        Stack<Integer> stack = new Stack<>();\n        stack.push(-1);\n        for (int i = 0; i <= n; i++) {\n            int h = (i == n) ? 0 : heights[i];\n            while (stack.peek() != -1 && heights[stack.peek()] >= h) {\n                int height = heights[stack.pop()];\n                int width = i - stack.peek() - 1;\n                maxArea = Math.max(maxArea, height * width);\n            }\n            stack.push(i);\n        }\n        return maxArea;\n    }\n}",
      "python": "class Solution:\n    def largestRectangleArea(self, heights: list[int]) -> int:\n        stack, max_area = [-1], 0\n        heights.append(0)\n        for i, h in enumerate(heights):\n            while stack[-1] != -1 and heights[stack[-1]] >= h:\n                height = heights[stack.pop()]\n                width = i - stack[-1] - 1\n                max_area = max(max_area, height * width)\n            stack.append(i)\n        heights.pop()\n        return max_area",
      "cpp": "#include <vector>\n#include <stack>\n#include <algorithm>\n\nclass Solution {\npublic:\n    int largestRectangleArea(std::vector<int>& heights) {\n        int n = heights.size(), maxArea = 0;\n        std::stack<int> st;\n        st.push(-1);\n        for (int i = 0; i <= n; i++) {\n            int h = (i == n) ? 0 : heights[i];\n            while (st.top() != -1 && heights[st.top()] >= h) {\n                int height = heights[st.top()]; st.pop();\n                int width = i - st.top() - 1;\n                maxArea = std::max(maxArea, height * width);\n            }\n            st.push(i);\n        }\n        return maxArea;\n    }\n};",
      "javascript": "function largestRectangleArea(heights) {\n    const stack = [-1];\n    let maxArea = 0;\n    const n = heights.length;\n    for (let i = 0; i <= n; i++) {\n        const h = i === n ? 0 : heights[i];\n        while (stack[stack.length - 1] !== -1 && heights[stack[stack.length - 1]] >= h) {\n            const height = heights[stack.pop()];\n            const width = i - stack[stack.length - 1] - 1;\n            maxArea = Math.max(maxArea, height * width);\n        }\n        stack.push(i);\n    }\n    return maxArea;\n}"
    },
    "approaches": {
      "brute": {
        "name": "Brute Force (Expand Outward from Every Bar)",
        "tier": "brute",
        "badge": "\ud83e\udd49 Brute Force",
        "intuition": [
          "Expand left and right for every bar."
        ],
        "timeComplexity": "O(N\u00b2)",
        "spaceComplexity": "O(1)",
        "complexityExplanation": "For each bar i, expands left and right until encountering a shorter bar, then calculates area.",
        "code": {
          "java": "public class Solution {\n    public int largestRectangleAreaBrute(int[] heights) {\n        int n = heights.length, maxArea = 0;\n        for (int i = 0; i < n; i++) {\n            int l = i, r = i;\n            while (l >= 0 && heights[l] >= heights[i]) l--;\n            while (r < n && heights[r] >= heights[i]) r++;\n            int width = r - l - 1;\n            maxArea = Math.max(maxArea, heights[i] * width);\n        }\n        return maxArea;\n    }\n}",
          "python": "class Solution:\n    def largestRectangleAreaBrute(self, heights: list[int]) -> int:\n        n, max_area = len(heights), 0\n        for i in range(n):\n            l, r = i, i\n            while l >= 0 and heights[l] >= heights[i]: l -= 1\n            while r < n and heights[r] >= heights[i]: r += 1\n            max_area = max(max_area, heights[i] * (r - l - 1))\n        return max_area",
          "cpp": "#include <vector>\n#include <algorithm>\n\nclass Solution {\npublic:\n    int largestRectangleAreaBrute(std::vector<int>& heights) {\n        int n = heights.size(), maxArea = 0;\n        for (int i = 0; i < n; i++) {\n            int l = i, r = i;\n            while (l >= 0 && heights[l] >= heights[i]) l--;\n            while (r < n && heights[r] >= heights[i]) r++;\n            maxArea = std::max(maxArea, heights[i] * (r - l - 1));\n        }\n        return maxArea;\n    }\n};",
          "javascript": "function largestRectangleAreaBrute(heights) {\n    let maxArea = 0;\n    const n = heights.length;\n    for (let i = 0; i < n; i++) {\n        let l = i, r = i;\n        while (l >= 0 && heights[l] >= heights[i]) l--;\n        while (r < n && heights[r] >= heights[i]) r++;\n        maxArea = Math.max(maxArea, heights[i] * (r - l - 1));\n    }\n    return maxArea;\n}"
        }
      },
      "better": {
        "name": "Better (Previous and Next Smaller Element Arrays)",
        "tier": "better",
        "badge": "\ud83e\udd48 Better",
        "intuition": [
          "Precompute left and right boundaries."
        ],
        "timeComplexity": "O(N)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Precomputes left smaller and right smaller boundary arrays using two monotonic stack passes.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int largestRectangleAreaBetter(int[] heights) {\n        int n = heights.length;\n        int[] left = new int[n], right = new int[n];\n        Stack<Integer> st = new Stack<>();\n        for (int i = 0; i < n; i++) {\n            while (!st.isEmpty() && heights[st.peek()] >= heights[i]) st.pop();\n            left[i] = st.isEmpty() ? 0 : st.peek() + 1;\n            st.push(i);\n        }\n        st.clear();\n        for (int i = n - 1; i >= 0; i--) {\n            while (!st.isEmpty() && heights[st.peek()] >= heights[i]) st.pop();\n            right[i] = st.isEmpty() ? n - 1 : st.peek() - 1;\n            st.push(i);\n        }\n        int maxArea = 0;\n        for (int i = 0; i < n; i++) {\n            maxArea = Math.max(maxArea, heights[i] * (right[i] - left[i] + 1));\n        }\n        return maxArea;\n    }\n}",
          "python": "class Solution:\n    def largestRectangleAreaBetter(self, heights: list[int]) -> int:\n        n = len(heights)\n        left, right = [0] * n, [n - 1] * n\n        st = []\n        for i in range(n):\n            while st and heights[st[-1]] >= heights[i]: st.pop()\n            left[i] = 0 if not st else st[-1] + 1\n            st.append(i)\n        st.clear()\n        for i in range(n - 1, -1, -1):\n            while st and heights[st[-1]] >= heights[i]: st.pop()\n            right[i] = n - 1 if not st else st[-1] - 1\n            st.append(i)\n        return max(heights[i] * (right[i] - left[i] + 1) for i in range(n))",
          "cpp": "#include <vector>\n#include <stack>\n#include <algorithm>\n\nclass Solution {\npublic:\n    int largestRectangleAreaBetter(std::vector<int>& heights) {\n        int n = heights.size();\n        std::vector<int> left(n), right(n);\n        std::stack<int> st;\n        for (int i = 0; i < n; i++) {\n            while (!st.empty() && heights[st.top()] >= heights[i]) st.pop();\n            left[i] = st.empty() ? 0 : st.top() + 1;\n            st.push(i);\n        }\n        while (!st.empty()) st.pop();\n        for (int i = n - 1; i >= 0; i--) {\n            while (!st.empty() && heights[st.top()] >= heights[i]) st.pop();\n            right[i] = st.empty() ? n - 1 : st.top() - 1;\n            st.push(i);\n        }\n        int maxArea = 0;\n        for (int i = 0; i < n; i++) {\n            maxArea = std::max(maxArea, heights[i] * (right[i] - left[i] + 1));\n        }\n        return maxArea;\n    }\n};",
          "javascript": "function largestRectangleAreaBetter(heights) {\n    const n = heights.length;\n    const left = new Array(n), right = new Array(n);\n    const st = [];\n    for (let i = 0; i < n; i++) {\n        while (st.length > 0 && heights[st[st.length - 1]] >= heights[i]) st.pop();\n        left[i] = st.length === 0 ? 0 : st[st.length - 1] + 1;\n        st.push(i);\n    }\n    st.length = 0;\n    for (let i = n - 1; i >= 0; i--) {\n        while (st.length > 0 && heights[st[st.length - 1]] >= heights[i]) st.pop();\n        right[i] = st.length === 0 ? n - 1 : st[st.length - 1] - 1;\n        st.push(i);\n    }\n    let maxArea = 0;\n    for (let i = 0; i < n; i++) {\n        maxArea = Math.max(maxArea, heights[i] * (right[i] - left[i] + 1));\n    }\n    return maxArea;\n}"
        }
      },
      "optimal": {
        "name": "Optimal (Monotonic Increasing Stack)",
        "tier": "optimal",
        "badge": "\ud83e\udd47 Optimal",
        "intuition": [
          "Initialize stack with -1 representing left boundary.",
          "Iterate index i from 0 to n. When heights[i] < heights[stack.peek()], pop height h.",
          "Width = i - stack.peek() - 1. Area = h * width. Update maxArea.",
          "Append 0-height sentinel at the end to flush all remaining bars from stack."
        ],
        "pseudocode": [
          "FUNCTION largestRectangleArea(heights):",
          "  stack = [-1]; maxArea = 0",
          "  FOR i from 0 TO heights.length:",
          "    h = (i == n) ? 0 : heights[i]",
          "    WHILE stack.peek() != -1 AND heights[stack.peek()] >= h:",
          "      height = heights[stack.pop()]",
          "      width = i - stack.peek() - 1",
          "      maxArea = MAX(maxArea, height * width)",
          "    stack.push(i)",
          "  RETURN maxArea"
        ],
        "timeComplexity": "O(N)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Maintains bar indices in increasing height order; when current bar is shorter than top, pop and calculate area with popped bar as bottleneck.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int largestRectangleArea(int[] heights) {\n        int n = heights.length, maxArea = 0;\n        Stack<Integer> stack = new Stack<>();\n        stack.push(-1);\n        for (int i = 0; i <= n; i++) {\n            int h = (i == n) ? 0 : heights[i];\n            while (stack.peek() != -1 && heights[stack.peek()] >= h) {\n                int height = heights[stack.pop()];\n                int width = i - stack.peek() - 1;\n                maxArea = Math.max(maxArea, height * width);\n            }\n            stack.push(i);\n        }\n        return maxArea;\n    }\n}",
          "python": "class Solution:\n    def largestRectangleArea(self, heights: list[int]) -> int:\n        stack, max_area = [-1], 0\n        heights.append(0)\n        for i, h in enumerate(heights):\n            while stack[-1] != -1 and heights[stack[-1]] >= h:\n                height = heights[stack.pop()]\n                width = i - stack[-1] - 1\n                max_area = max(max_area, height * width)\n            stack.append(i)\n        heights.pop()\n        return max_area",
          "cpp": "#include <vector>\n#include <stack>\n#include <algorithm>\n\nclass Solution {\npublic:\n    int largestRectangleArea(std::vector<int>& heights) {\n        int n = heights.size(), maxArea = 0;\n        std::stack<int> st;\n        st.push(-1);\n        for (int i = 0; i <= n; i++) {\n            int h = (i == n) ? 0 : heights[i];\n            while (st.top() != -1 && heights[st.top()] >= h) {\n                int height = heights[st.top()]; st.pop();\n                int width = i - st.top() - 1;\n                maxArea = std::max(maxArea, height * width);\n            }\n            st.push(i);\n        }\n        return maxArea;\n    }\n};",
          "javascript": "function largestRectangleArea(heights) {\n    const stack = [-1];\n    let maxArea = 0;\n    const n = heights.length;\n    for (let i = 0; i <= n; i++) {\n        const h = i === n ? 0 : heights[i];\n        while (stack[stack.length - 1] !== -1 && heights[stack[stack.length - 1]] >= h) {\n            const height = heights[stack.pop()];\n            const width = i - stack[stack.length - 1] - 1;\n            maxArea = Math.max(maxArea, height * width);\n        }\n        stack.push(i);\n    }\n    return maxArea;\n}"
        }
      }
    }
  },
  "trapping_rain_water": {
    "questionId": "archetype-trapping_rain_water",
    "pattern": "Two Pointers (Inward Contraction)",
    "intuition": [
      "Initialize left = 0, right = n - 1, leftMax = 0, rightMax = 0.",
      "While left < right, if height[left] < height[right]:",
      "  If height[left] >= leftMax, update leftMax; otherwise add (leftMax - height[left]) to trapped water. Advance left++.",
      "Else:",
      "  If height[right] >= rightMax, update rightMax; otherwise add (rightMax - height[right]) to trapped water. Retreat right--."
    ],
    "pseudocode": [
      "FUNCTION trap(height):",
      "  left = 0, right = n - 1, leftMax = 0, rightMax = 0, water = 0",
      "  WHILE left < right:",
      "    IF height[left] < height[right]:",
      "      IF height[left] >= leftMax: leftMax = height[left]",
      "      ELSE: water += leftMax - height[left]",
      "      left++",
      "    ELSE:",
      "      IF height[right] >= rightMax: rightMax = height[right]",
      "      ELSE: water += rightMax - height[right]",
      "      right--",
      "  RETURN water"
    ],
    "timeComplexity": "O(N)",
    "spaceComplexity": "O(1)",
    "complexityExplanation": "Pointers left and right track leftMax and rightMax. Water trapped at lower boundary is determined solely by that boundary's historical maximum in O(1) space.",
    "edgeCases": [
      "Empty array",
      "Length < 3 (cannot trap water)",
      "Monotonically increasing or decreasing heights"
    ],
    "code": {
      "java": "public class Solution {\n    public int trap(int[] height) {\n        int left = 0, right = height.length - 1;\n        int leftMax = 0, rightMax = 0, water = 0;\n        while (left < right) {\n            if (height[left] < height[right]) {\n                if (height[left] >= leftMax) leftMax = height[left];\n                else water += leftMax - height[left];\n                left++;\n            } else {\n                if (height[right] >= rightMax) rightMax = height[right];\n                else water += rightMax - height[right];\n                right--;\n            }\n        }\n        return water;\n    }\n}",
      "python": "class Solution:\n    def trap(self, height: list[int]) -> int:\n        l, r = 0, len(height) - 1\n        left_max = right_max = water = 0\n        while l < r:\n            if height[l] < height[r]:\n                if height[l] >= left_max: left_max = height[l]\n                else: water += left_max - height[l]\n                l += 1\n            else:\n                if height[r] >= right_max: right_max = height[r]\n                else: water += right_max - height[r]\n                r -= 1\n        return water",
      "cpp": "#include <vector>\n#include <algorithm>\n\nclass Solution {\npublic:\n    int trap(std::vector<int>& height) {\n        int l = 0, r = height.size() - 1;\n        int leftMax = 0, rightMax = 0, water = 0;\n        while (l < r) {\n            if (height[l] < height[r]) {\n                if (height[l] >= leftMax) leftMax = height[l];\n                else water += leftMax - height[l];\n                l++;\n            } else {\n                if (height[r] >= rightMax) rightMax = height[r];\n                else water += rightMax - height[r];\n                r--;\n            }\n        }\n        return water;\n    }\n};",
      "javascript": "function trap(height) {\n    let l = 0, r = height.length - 1;\n    let leftMax = 0, rightMax = 0, water = 0;\n    while (l < r) {\n        if (height[l] < height[r]) {\n            if (height[l] >= leftMax) leftMax = height[l];\n            else water += leftMax - height[l];\n            l++;\n        } else {\n            if (height[r] >= rightMax) rightMax = height[r];\n            else water += rightMax - height[r];\n            r--;\n        }\n    }\n    return water;\n}"
    },
    "approaches": {
      "brute": {
        "name": "Brute Force (Scan Left & Right for Every Index)",
        "tier": "brute",
        "badge": "\ud83e\udd49 Brute Force",
        "intuition": [
          "Find boundaries independently for each bar."
        ],
        "timeComplexity": "O(N\u00b2)",
        "spaceComplexity": "O(1)",
        "complexityExplanation": "Scans entire left side and right side for every index i to find boundaries.",
        "code": {
          "java": "public class Solution {\n    public int trapBrute(int[] height) {\n        int n = height.length, water = 0;\n        for (int i = 0; i < n; i++) {\n            int lMax = 0, rMax = 0;\n            for (int j = 0; j <= i; j++) lMax = Math.max(lMax, height[j]);\n            for (int j = i; j < n; j++) rMax = Math.max(rMax, height[j]);\n            water += Math.min(lMax, rMax) - height[i];\n        }\n        return water;\n    }\n}",
          "python": "class Solution:\n    def trapBrute(self, height: list[int]) -> int:\n        n, water = len(height), 0\n        for i in range(n):\n            l_max = max(height[:i+1])\n            r_max = max(height[i:])\n            water += min(l_max, r_max) - height[i]\n        return water",
          "cpp": "#include <vector>\n#include <algorithm>\n\nclass Solution {\npublic:\n    int trapBrute(std::vector<int>& height) {\n        int n = height.size(), water = 0;\n        for (int i = 0; i < n; i++) {\n            int lMax = 0, rMax = 0;\n            for (int j = 0; j <= i; j++) lMax = std::max(lMax, height[j]);\n            for (int j = i; j < n; j++) rMax = std::max(rMax, height[j]);\n            water += std::min(lMax, rMax) - height[i];\n        }\n        return water;\n    }\n};",
          "javascript": "function trapBrute(height) {\n    const n = height.length;\n    let water = 0;\n    for (let i = 0; i < n; i++) {\n        let lMax = 0, rMax = 0;\n        for (let j = 0; j <= i; j++) lMax = Math.max(lMax, height[j]);\n        for (let j = i; j < n; j++) rMax = Math.max(rMax, height[j]);\n        water += Math.min(lMax, rMax) - height[i];\n    }\n    return water;\n}"
        }
      },
      "better": {
        "name": "Better (Prefix Max and Suffix Max Arrays)",
        "tier": "better",
        "badge": "\ud83e\udd48 Better",
        "intuition": [
          "Prefix and suffix maximums."
        ],
        "timeComplexity": "O(N)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Precomputes prefixMax[i] and suffixMax[i] arrays; water at i is min(prefixMax[i], suffixMax[i]) - height[i].",
        "code": {
          "java": "public class Solution {\n    public int trapBetter(int[] height) {\n        int n = height.length;\n        if (n == 0) return 0;\n        int[] leftMax = new int[n], rightMax = new int[n];\n        leftMax[0] = height[0];\n        for (int i = 1; i < n; i++) leftMax[i] = Math.max(leftMax[i - 1], height[i]);\n        rightMax[n - 1] = height[n - 1];\n        for (int i = n - 2; i >= 0; i--) rightMax[i] = Math.max(rightMax[i + 1], height[i]);\n        int water = 0;\n        for (int i = 0; i < n; i++) {\n            water += Math.min(leftMax[i], rightMax[i]) - height[i];\n        }\n        return water;\n    }\n}",
          "python": "class Solution:\n    def trapBetter(self, height: list[int]) -> int:\n        n = len(height)\n        if n == 0: return 0\n        l_max, r_max = [0] * n, [0] * n\n        l_max[0] = height[0]\n        for i in range(1, n): l_max[i] = max(l_max[i-1], height[i])\n        r_max[n-1] = height[n-1]\n        for i in range(n - 2, -1, -1): r_max[i] = max(r_max[i+1], height[i])\n        return sum(min(l_max[i], r_max[i]) - height[i] for i in range(n))",
          "cpp": "#include <vector>\n#include <algorithm>\n\nclass Solution {\npublic:\n    int trapBetter(std::vector<int>& height) {\n        int n = height.size();\n        if (n == 0) return 0;\n        std::vector<int> leftMax(n), rightMax(n);\n        leftMax[0] = height[0];\n        for (int i = 1; i < n; i++) leftMax[i] = std::max(leftMax[i-1], height[i]);\n        rightMax[n-1] = height[n-1];\n        for (int i = n - 2; i >= 0; i--) rightMax[i] = std::max(rightMax[i+1], height[i]);\n        int water = 0;\n        for (int i = 0; i < n; i++) {\n            water += std::min(leftMax[i], rightMax[i]) - height[i];\n        }\n        return water;\n    }\n};",
          "javascript": "function trapBetter(height) {\n    const n = height.length;\n    if (n === 0) return 0;\n    const lMax = new Array(n), rMax = new Array(n);\n    lMax[0] = height[0];\n    for (let i = 1; i < n; i++) lMax[i] = Math.max(lMax[i-1], height[i]);\n    rMax[n-1] = height[n-1];\n    for (let i = n - 2; i >= 0; i--) rMax[i] = Math.max(rMax[i+1], height[i]);\n    let water = 0;\n    for (let i = 0; i < n; i++) {\n        water += Math.min(lMax[i], rMax[i]) - height[i];\n    }\n    return water;\n}"
        }
      },
      "optimal": {
        "name": "Optimal (Two Pointers (Inward Contraction))",
        "tier": "optimal",
        "badge": "\ud83e\udd47 Optimal",
        "intuition": [
          "Initialize left = 0, right = n - 1, leftMax = 0, rightMax = 0.",
          "While left < right, if height[left] < height[right]:",
          "  If height[left] >= leftMax, update leftMax; otherwise add (leftMax - height[left]) to trapped water. Advance left++.",
          "Else:",
          "  If height[right] >= rightMax, update rightMax; otherwise add (rightMax - height[right]) to trapped water. Retreat right--."
        ],
        "pseudocode": [
          "FUNCTION trap(height):",
          "  left = 0, right = n - 1, leftMax = 0, rightMax = 0, water = 0",
          "  WHILE left < right:",
          "    IF height[left] < height[right]:",
          "      IF height[left] >= leftMax: leftMax = height[left]",
          "      ELSE: water += leftMax - height[left]",
          "      left++",
          "    ELSE:",
          "      IF height[right] >= rightMax: rightMax = height[right]",
          "      ELSE: water += rightMax - height[right]",
          "      right--",
          "  RETURN water"
        ],
        "timeComplexity": "O(N)",
        "spaceComplexity": "O(1)",
        "complexityExplanation": "Pointers left and right track leftMax and rightMax. Water trapped at lower boundary is determined solely by that boundary's historical maximum in O(1) space.",
        "code": {
          "java": "public class Solution {\n    public int trap(int[] height) {\n        int left = 0, right = height.length - 1;\n        int leftMax = 0, rightMax = 0, water = 0;\n        while (left < right) {\n            if (height[left] < height[right]) {\n                if (height[left] >= leftMax) leftMax = height[left];\n                else water += leftMax - height[left];\n                left++;\n            } else {\n                if (height[right] >= rightMax) rightMax = height[right];\n                else water += rightMax - height[right];\n                right--;\n            }\n        }\n        return water;\n    }\n}",
          "python": "class Solution:\n    def trap(self, height: list[int]) -> int:\n        l, r = 0, len(height) - 1\n        left_max = right_max = water = 0\n        while l < r:\n            if height[l] < height[r]:\n                if height[l] >= left_max: left_max = height[l]\n                else: water += left_max - height[l]\n                l += 1\n            else:\n                if height[r] >= right_max: right_max = height[r]\n                else: water += right_max - height[r]\n                r -= 1\n        return water",
          "cpp": "#include <vector>\n#include <algorithm>\n\nclass Solution {\npublic:\n    int trap(std::vector<int>& height) {\n        int l = 0, r = height.size() - 1;\n        int leftMax = 0, rightMax = 0, water = 0;\n        while (l < r) {\n            if (height[l] < height[r]) {\n                if (height[l] >= leftMax) leftMax = height[l];\n                else water += leftMax - height[l];\n                l++;\n            } else {\n                if (height[r] >= rightMax) rightMax = height[r];\n                else water += rightMax - height[r];\n                r--;\n            }\n        }\n        return water;\n    }\n};",
          "javascript": "function trap(height) {\n    let l = 0, r = height.length - 1;\n    let leftMax = 0, rightMax = 0, water = 0;\n    while (l < r) {\n        if (height[l] < height[r]) {\n            if (height[l] >= leftMax) leftMax = height[l];\n            else water += leftMax - height[l];\n            l++;\n        } else {\n            if (height[r] >= rightMax) rightMax = height[r];\n            else water += rightMax - height[r];\n            r--;\n        }\n    }\n    return water;\n}"
        }
      }
    }
  }
};
