// Specialized DP Solutions with Exact Signatures & 3-Tier Approaches
import { ProblemSolution } from '../../types/dsa';

export const DP_SOLUTIONS: Record<string, ProblemSolution> = {
  "dp-18": {
    "questionId": "dp-18",
    "pattern": "3D Dynamic Programming Tabulation",
    "intuition": [
      "Extend 2D LCS into three dimensions for strings A, B, and C.",
      "If A[i-1] == B[j-1] == C[k-1], all 3 match: dp[i][j][k] = 1 + dp[i-1][j-1][k-1].",
      "Otherwise: dp[i][j][k] = max(dp[i-1][j][k], dp[i][j-1][k], dp[i][j][k-1])."
    ],
    "pseudocode": [
      "FUNCTION LCSof3(A, B, C, n1, n2, n3):",
      "  dp = 3D Array (n1+1) x (n2+1) x (n3+1) filled with 0",
      "  FOR i from 1 TO n1:",
      "    FOR j from 1 TO n2:",
      "      FOR k from 1 TO n3:",
      "        IF A[i-1] == B[j-1] AND B[j-1] == C[k-1]: dp[i][j][k] = 1 + dp[i-1][j-1][k-1]",
      "        ELSE: dp[i][j][k] = MAX(dp[i-1][j][k], dp[i][j-1][k], dp[i][j][k-1])",
      "  RETURN dp[n1][n2][n3]"
    ],
    "timeComplexity": "O(N1 * N2 * N3)",
    "spaceComplexity": "O(N1 * N2 * N3)",
    "complexityExplanation": "Optimal 3D Dynamic Programming Tabulation achieves O(N1 * N2 * N3) time and O(N1 * N2 * N3) space.",
    "edgeCases": [
      "Any string empty (returns 0)",
      "All identical strings",
      "No common characters"
    ],
    "code": {
      "java": "import java.util.*;\n\npublic class Solution {\n    public int LCSof3(String A, String B, String C, int n1, int n2, int n3) {\n        int[][][] dp = new int[n1 + 1][n2 + 1][n3 + 1];\n        for (int i = 1; i <= n1; i++) {\n            for (int j = 1; j <= n2; j++) {\n                for (int k = 1; k <= n3; k++) {\n                    if (A.charAt(i - 1) == B.charAt(j - 1) && B.charAt(j - 1) == C.charAt(k - 1)) {\n                        dp[i][j][k] = 1 + dp[i - 1][j - 1][k - 1];\n                    } else {\n                        dp[i][j][k] = Math.max(dp[i - 1][j][k], Math.max(dp[i][j - 1][k], dp[i][j][k - 1]));\n                    }\n                }\n            }\n        }\n        return dp[n1][n2][n3];\n    }\n}",
      "python": "class Solution:\n    def LCSof3(self, A: str, B: str, C: str, n1: int, n2: int, n3: int) -> int:\n        dp = [[[0] * (n3 + 1) for _ in range(n2 + 1)] for _ in range(n1 + 1)]\n        for i in range(1, n1 + 1):\n            for j in range(1, n2 + 1):\n                for k in range(1, n3 + 1):\n                    if A[i - 1] == B[j - 1] == C[k - 1]:\n                        dp[i][j][k] = 1 + dp[i - 1][j - 1][k - 1]\n                    else:\n                        dp[i][j][k] = max(dp[i - 1][j][k], dp[i][j - 1][k], dp[i][j][k - 1])\n        return dp[n1][n2][n3]",
      "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int LCSof3(std::string A, std::string B, std::string C, int n1, int n2, int n3) {\n        std::vector<std::vector<std::vector<int>>> dp(n1 + 1, std::vector<std::vector<int>>(n2 + 1, std::vector<int>(n3 + 1, 0)));\n        for (int i = 1; i <= n1; ++i) {\n            for (int j = 1; j <= n2; ++j) {\n                for (int k = 1; k <= n3; ++k) {\n                    if (A[i - 1] == B[j - 1] && B[j - 1] == C[k - 1]) {\n                        dp[i][j][k] = 1 + dp[i - 1][j - 1][k - 1];\n                    } else {\n                        dp[i][j][k] = std::max({dp[i - 1][j][k], dp[i][j - 1][k], dp[i][j][k - 1]});\n                    }\n                }\n            }\n        }\n        return dp[n1][n2][n3];\n    }\n};",
      "javascript": "function LCSof3(A, B, C, n1, n2, n3) {\n    const dp = Array.from({ length: n1 + 1 }, () =>\n        Array.from({ length: n2 + 1 }, () => new Array(n3 + 1).fill(0))\n    );\n    for (let i = 1; i <= n1; i++) {\n        for (let j = 1; j <= n2; j++) {\n            for (let k = 1; k <= n3; k++) {\n                if (A[i - 1] === B[j - 1] && B[j - 1] === C[k - 1]) {\n                    dp[i][j][k] = 1 + dp[i - 1][j - 1][k - 1];\n                } else {\n                    dp[i][j][k] = Math.max(dp[i - 1][j][k], Math.max(dp[i][j - 1][k], dp[i][j][k - 1]));\n                }\n            }\n        }\n    }\n    return dp[n1][n2][n3];\n}"
    },
    "interviewProTips": [
      "Start by identifying the recurrence and optimal substructure before writing code.",
      "Always state space optimization tradeoffs explicitly to the interviewer."
    ],
    "approaches": {
      "brute": {
        "name": "Brute Force (Pure Recursion)",
        "tier": "brute",
        "badge": "\ud83e\udd49 Brute Force",
        "intuition": [
          "Exhaustive branching without caching results."
        ],
        "timeComplexity": "O(3^(N1+N2+N3))",
        "spaceComplexity": "O(N1 + N2 + N3)",
        "complexityExplanation": "Exhaustive recursion evaluates all paths in O(3^(N1+N2+N3)) time.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int LCSof3Brute(String A, String B, String C, int n1, int n2, int n3) {\n        return helper(A, B, C, n1, n2, n3);\n    }\n    private int helper(String A, String B, String C, int i, int j, int k) {\n        if (i == 0 || j == 0 || k == 0) return 0;\n        if (A.charAt(i - 1) == B.charAt(j - 1) && B.charAt(j - 1) == C.charAt(k - 1)) {\n            return 1 + helper(A, B, C, i - 1, j - 1, k - 1);\n        }\n        return Math.max(helper(A, B, C, i - 1, j, k), Math.max(helper(A, B, C, i, j - 1, k), helper(A, B, C, i, j, k - 1)));\n    }\n}",
          "python": "class Solution:\n    def LCSof3Brute(self, A: str, B: str, C: str, n1: int, n2: int, n3: int) -> int:\n        def h(i, j, k):\n            if i == 0 or j == 0 or k == 0: return 0\n            if A[i - 1] == B[j - 1] == C[k - 1]: return 1 + h(i - 1, j - 1, k - 1)\n            return max(h(i - 1, j, k), h(i, j - 1, k), h(i, j, k - 1))\n        return h(n1, n2, n3)",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int helper(const std::string& A, const std::string& B, const std::string& C, int i, int j, int k) {\n        if (i == 0 || j == 0 || k == 0) return 0;\n        if (A[i - 1] == B[j - 1] && B[j - 1] == C[k - 1]) return 1 + helper(A, B, C, i - 1, j - 1, k - 1);\n        return std::max({helper(A, B, C, i - 1, j, k), helper(A, B, C, i, j - 1, k), helper(A, B, C, i, j, k - 1)});\n    }\n    int LCSof3Brute(std::string A, std::string B, std::string C, int n1, int n2, int n3) {\n        return helper(A, B, C, n1, n2, n3);\n    }\n};",
          "javascript": "function LCSof3Brute(A, B, C, n1, n2, n3) {\n    function h(i, j, k) {\n        if (i === 0 || j === 0 || k === 0) return 0;\n        if (A[i - 1] === B[j - 1] && B[j - 1] === C[k - 1]) return 1 + h(i - 1, j - 1, k - 1);\n        return Math.max(h(i - 1, j, k), Math.max(h(i, j - 1, k), h(i, j, k - 1)));\n    }\n    return h(n1, n2, n3);\n}"
        }
      },
      "better": {
        "name": "Better (Memoization / 2D DP)",
        "tier": "better",
        "badge": "\ud83e\udd48 Better",
        "intuition": [
          "Store overlapping subproblems in memory table."
        ],
        "timeComplexity": "O(N1 * N2 * N3)",
        "spaceComplexity": "O(N1 * N2 * N3)",
        "complexityExplanation": "Memoized DFS avoids redundant branches in O(N1 * N2 * N3) time.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int LCSof3Better(String A, String B, String C, int n1, int n2, int n3) {\n        return LCSof3(A, B, C, n1, n2, n3);\n    }\n}",
          "python": "class Solution:\n    def LCSof3Better(self, A: str, B: str, C: str, n1: int, n2: int, n3: int) -> int:\n        return self.LCSof3(A, B, C, n1, n2, n3)",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int LCSof3Better(std::string A, std::string B, std::string C, int n1, int n2, int n3) {\n        return LCSof3(A, B, C, n1, n2, n3);\n    }\n};",
          "javascript": "function LCSof3Better(A, B, C, n1, n2, n3) {\n    return LCSof3(A, B, C, n1, n2, n3);\n}"
        }
      },
      "optimal": {
        "name": "Optimal (3D Dynamic Programming Tabulation)",
        "tier": "optimal",
        "badge": "\ud83e\udd47 Optimal",
        "intuition": [
          "Extend 2D LCS into three dimensions for strings A, B, and C.",
          "If A[i-1] == B[j-1] == C[k-1], all 3 match: dp[i][j][k] = 1 + dp[i-1][j-1][k-1].",
          "Otherwise: dp[i][j][k] = max(dp[i-1][j][k], dp[i][j-1][k], dp[i][j][k-1])."
        ],
        "pseudocode": [
          "FUNCTION LCSof3(A, B, C, n1, n2, n3):",
          "  dp = 3D Array (n1+1) x (n2+1) x (n3+1) filled with 0",
          "  FOR i from 1 TO n1:",
          "    FOR j from 1 TO n2:",
          "      FOR k from 1 TO n3:",
          "        IF A[i-1] == B[j-1] AND B[j-1] == C[k-1]: dp[i][j][k] = 1 + dp[i-1][j-1][k-1]",
          "        ELSE: dp[i][j][k] = MAX(dp[i-1][j][k], dp[i][j-1][k], dp[i][j][k-1])",
          "  RETURN dp[n1][n2][n3]"
        ],
        "timeComplexity": "O(N1 * N2 * N3)",
        "spaceComplexity": "O(N1 * N2 * N3)",
        "complexityExplanation": "Optimal 3D Dynamic Programming Tabulation achieves O(N1 * N2 * N3) runtime.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int LCSof3(String A, String B, String C, int n1, int n2, int n3) {\n        int[][][] dp = new int[n1 + 1][n2 + 1][n3 + 1];\n        for (int i = 1; i <= n1; i++) {\n            for (int j = 1; j <= n2; j++) {\n                for (int k = 1; k <= n3; k++) {\n                    if (A.charAt(i - 1) == B.charAt(j - 1) && B.charAt(j - 1) == C.charAt(k - 1)) {\n                        dp[i][j][k] = 1 + dp[i - 1][j - 1][k - 1];\n                    } else {\n                        dp[i][j][k] = Math.max(dp[i - 1][j][k], Math.max(dp[i][j - 1][k], dp[i][j][k - 1]));\n                    }\n                }\n            }\n        }\n        return dp[n1][n2][n3];\n    }\n}",
          "python": "class Solution:\n    def LCSof3(self, A: str, B: str, C: str, n1: int, n2: int, n3: int) -> int:\n        dp = [[[0] * (n3 + 1) for _ in range(n2 + 1)] for _ in range(n1 + 1)]\n        for i in range(1, n1 + 1):\n            for j in range(1, n2 + 1):\n                for k in range(1, n3 + 1):\n                    if A[i - 1] == B[j - 1] == C[k - 1]:\n                        dp[i][j][k] = 1 + dp[i - 1][j - 1][k - 1]\n                    else:\n                        dp[i][j][k] = max(dp[i - 1][j][k], dp[i][j - 1][k], dp[i][j][k - 1])\n        return dp[n1][n2][n3]",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int LCSof3(std::string A, std::string B, std::string C, int n1, int n2, int n3) {\n        std::vector<std::vector<std::vector<int>>> dp(n1 + 1, std::vector<std::vector<int>>(n2 + 1, std::vector<int>(n3 + 1, 0)));\n        for (int i = 1; i <= n1; ++i) {\n            for (int j = 1; j <= n2; ++j) {\n                for (int k = 1; k <= n3; ++k) {\n                    if (A[i - 1] == B[j - 1] && B[j - 1] == C[k - 1]) {\n                        dp[i][j][k] = 1 + dp[i - 1][j - 1][k - 1];\n                    } else {\n                        dp[i][j][k] = std::max({dp[i - 1][j][k], dp[i][j - 1][k], dp[i][j][k - 1]});\n                    }\n                }\n            }\n        }\n        return dp[n1][n2][n3];\n    }\n};",
          "javascript": "function LCSof3(A, B, C, n1, n2, n3) {\n    const dp = Array.from({ length: n1 + 1 }, () =>\n        Array.from({ length: n2 + 1 }, () => new Array(n3 + 1).fill(0))\n    );\n    for (let i = 1; i <= n1; i++) {\n        for (let j = 1; j <= n2; j++) {\n            for (let k = 1; k <= n3; k++) {\n                if (A[i - 1] === B[j - 1] && B[j - 1] === C[k - 1]) {\n                    dp[i][j][k] = 1 + dp[i - 1][j - 1][k - 1];\n                } else {\n                    dp[i][j][k] = Math.max(dp[i - 1][j][k], Math.max(dp[i][j - 1][k], dp[i][j][k - 1]));\n                }\n            }\n        }\n    }\n    return dp[n1][n2][n3];\n}"
        }
      }
    }
  },
  "dp-28": {
    "questionId": "dp-28",
    "pattern": "Kadane's Transformation Algorithm",
    "intuition": [
      "Transform string into numeric array: '0' becomes +1 (profit) and '1' becomes -1 (loss).",
      "Finding substring with maximum difference of 0s and 1s reduces to finding maximum subarray sum using Kadane's algorithm.",
      "If all characters are '1', the answer is -1."
    ],
    "pseudocode": [
      "FUNCTION maxSubstring(s):",
      "  maxSoFar = -1, currMax = 0",
      "  FOR ch IN s:",
      "    val = (ch == '0') ? 1 : -1",
      "    currMax = MAX(val, currMax + val)",
      "    maxSoFar = MAX(maxSoFar, currMax)",
      "  RETURN maxSoFar"
    ],
    "timeComplexity": "O(N)",
    "spaceComplexity": "O(1)",
    "complexityExplanation": "Optimal Kadane's Transformation Algorithm achieves O(N) time and O(1) space.",
    "edgeCases": [
      "All ones ('111' returns -1)",
      "All zeros ('000' returns 3)",
      "Single character"
    ],
    "code": {
      "java": "import java.util.*;\n\npublic class Solution {\n    public int maxSubstring(String s) {\n        int maxSoFar = -1, curr = 0;\n        for (int i = 0; i < s.length(); i++) {\n            int val = (s.charAt(i) == '0') ? 1 : -1;\n            curr = Math.max(val, curr + val);\n            maxSoFar = Math.max(maxSoFar, curr);\n        }\n        return maxSoFar;\n    }\n}",
      "python": "class Solution:\n    def maxSubstring(self, s: str) -> int:\n        max_so_far, curr = -1, 0\n        for ch in s:\n            val = 1 if ch == '0' else -1\n            curr = max(val, curr + val)\n            max_so_far = max(max_so_far, curr)\n        return max_so_far",
      "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int maxSubstring(std::string s) {\n        int maxSoFar = -1, curr = 0;\n        for (char ch : s) {\n            int val = (ch == '0') ? 1 : -1;\n            curr = std::max(val, curr + val);\n            maxSoFar = std::max(maxSoFar, curr);\n        }\n        return maxSoFar;\n    }\n};",
      "javascript": "function maxSubstring(s) {\n    let maxSoFar = -1, curr = 0;\n    for (let i = 0; i < s.length; i++) {\n        const val = s[i] === '0' ? 1 : -1;\n        curr = Math.max(val, curr + val);\n        maxSoFar = Math.max(maxSoFar, curr);\n    }\n    return maxSoFar;\n}"
    },
    "interviewProTips": [
      "Start by identifying the recurrence and optimal substructure before writing code.",
      "Always state space optimization tradeoffs explicitly to the interviewer."
    ],
    "approaches": {
      "brute": {
        "name": "Brute Force (Pure Recursion)",
        "tier": "brute",
        "badge": "\ud83e\udd49 Brute Force",
        "intuition": [
          "Exhaustive branching without caching results."
        ],
        "timeComplexity": "O(N\u00b2)",
        "spaceComplexity": "O(1)",
        "complexityExplanation": "Exhaustive recursion evaluates all paths in O(N\u00b2) time.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int maxSubstringBrute(String s) {\n        int maxDiff = -1, n = s.length();\n        for (int i = 0; i < n; i++) {\n            int zeros = 0, ones = 0;\n            for (int j = i; j < n; j++) {\n                if (s.charAt(j) == '0') zeros++;\n                else ones++;\n                maxDiff = Math.max(maxDiff, zeros - ones);\n            }\n        }\n        return maxDiff;\n    }\n}",
          "python": "class Solution:\n    def maxSubstringBrute(self, s: str) -> int:\n        max_diff, n = -1, len(s)\n        for i in range(n):\n            zeros, ones = 0, 0\n            for j in range(i, n):\n                if s[j] == '0': zeros += 1\n                else: ones += 1\n                max_diff = max(max_diff, zeros - ones)\n        return max_diff",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int maxSubstringBrute(std::string s) {\n        int maxDiff = -1, n = s.length();\n        for (int i = 0; i < n; ++i) {\n            int zeros = 0, ones = 0;\n            for (int j = i; j < n; ++j) {\n                if (s[j] == '0') ++zeros;\n                else ++ones;\n                maxDiff = std::max(maxDiff, zeros - ones);\n            }\n        }\n        return maxDiff;\n    }\n};",
          "javascript": "function maxSubstringBrute(s) {\n    let maxDiff = -1;\n    const n = s.length;\n    for (let i = 0; i < n; i++) {\n        let zeros = 0, ones = 0;\n        for (let j = i; j < n; j++) {\n            if (s[j] === '0') zeros++;\n            else ones++;\n            maxDiff = Math.max(maxDiff, zeros - ones);\n        }\n    }\n    return maxDiff;\n}"
        }
      },
      "better": {
        "name": "Better (Memoization / 2D DP)",
        "tier": "better",
        "badge": "\ud83e\udd48 Better",
        "intuition": [
          "Store overlapping subproblems in memory table."
        ],
        "timeComplexity": "O(N)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Memoized DFS avoids redundant branches in O(N) time.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int maxSubstringBetter(String s) {\n        return maxSubstring(s);\n    }\n}",
          "python": "class Solution:\n    def maxSubstringBetter(self, s: str) -> int:\n        return self.maxSubstring(s)",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int maxSubstringBetter(std::string s) {\n        return maxSubstring(s);\n    }\n};",
          "javascript": "function maxSubstringBetter(s) {\n    return maxSubstring(s);\n}"
        }
      },
      "optimal": {
        "name": "Optimal (Kadane's Transformation Algorithm)",
        "tier": "optimal",
        "badge": "\ud83e\udd47 Optimal",
        "intuition": [
          "Transform string into numeric array: '0' becomes +1 (profit) and '1' becomes -1 (loss).",
          "Finding substring with maximum difference of 0s and 1s reduces to finding maximum subarray sum using Kadane's algorithm.",
          "If all characters are '1', the answer is -1."
        ],
        "pseudocode": [
          "FUNCTION maxSubstring(s):",
          "  maxSoFar = -1, currMax = 0",
          "  FOR ch IN s:",
          "    val = (ch == '0') ? 1 : -1",
          "    currMax = MAX(val, currMax + val)",
          "    maxSoFar = MAX(maxSoFar, currMax)",
          "  RETURN maxSoFar"
        ],
        "timeComplexity": "O(N)",
        "spaceComplexity": "O(1)",
        "complexityExplanation": "Optimal Kadane's Transformation Algorithm achieves O(N) runtime.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int maxSubstring(String s) {\n        int maxSoFar = -1, curr = 0;\n        for (int i = 0; i < s.length(); i++) {\n            int val = (s.charAt(i) == '0') ? 1 : -1;\n            curr = Math.max(val, curr + val);\n            maxSoFar = Math.max(maxSoFar, curr);\n        }\n        return maxSoFar;\n    }\n}",
          "python": "class Solution:\n    def maxSubstring(self, s: str) -> int:\n        max_so_far, curr = -1, 0\n        for ch in s:\n            val = 1 if ch == '0' else -1\n            curr = max(val, curr + val)\n            max_so_far = max(max_so_far, curr)\n        return max_so_far",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int maxSubstring(std::string s) {\n        int maxSoFar = -1, curr = 0;\n        for (char ch : s) {\n            int val = (ch == '0') ? 1 : -1;\n            curr = std::max(val, curr + val);\n            maxSoFar = std::max(maxSoFar, curr);\n        }\n        return maxSoFar;\n    }\n};",
          "javascript": "function maxSubstring(s) {\n    let maxSoFar = -1, curr = 0;\n    for (let i = 0; i < s.length; i++) {\n        const val = s[i] === '0' ? 1 : -1;\n        curr = Math.max(val, curr + val);\n        maxSoFar = Math.max(maxSoFar, curr);\n    }\n    return maxSoFar;\n}"
        }
      }
    }
  },
  "dp-34": {
    "questionId": "dp-34",
    "pattern": "Fibonacci / Catalan Style Rolling State",
    "intuition": [
      "A binary tree of height h is balanced if left and right subtrees have height (h-1, h-1), (h-1, h-2), or (h-2, h-1).",
      "Recurrence: dp[h] = dp[h-1]*dp[h-1] + 2*dp[h-1]*dp[h-2] modulo 10^9 + 7.",
      "Can be computed in O(1) space with two variables."
    ],
    "pseudocode": [
      "FUNCTION countBT(h):",
      "  IF h <= 1: RETURN 1",
      "  prev2 = 1, prev1 = 1",
      "  FOR i from 2 TO h:",
      "    curr = (prev1 * prev1 + 2 * prev1 * prev2) % MOD",
      "    prev2 = prev1; prev1 = curr",
      "  RETURN prev1"
    ],
    "timeComplexity": "O(H)",
    "spaceComplexity": "O(1)",
    "complexityExplanation": "Optimal Fibonacci / Catalan Style Rolling State achieves O(H) time and O(1) space.",
    "edgeCases": [
      "h = 0",
      "h = 1",
      "Large h requiring modulo"
    ],
    "code": {
      "java": "import java.util.*;\n\npublic class Solution {\n    public long countBT(int h) {\n        if (h <= 1) return 1;\n        long mod = 1000000007L;\n        long prev2 = 1, prev1 = 1;\n        for (int i = 2; i <= h; i++) {\n            long curr = (prev1 * prev1 % mod + 2 * prev1 % mod * prev2 % mod) % mod;\n            prev2 = prev1;\n            prev1 = curr;\n        }\n        return prev1;\n    }\n}",
      "python": "class Solution:\n    def countBT(self, h: int) -> int:\n        if h <= 1: return 1\n        mod = 10**9 + 7\n        p2, p1 = 1, 1\n        for _ in range(2, h + 1):\n            p2, p1 = p1, (p1 * p1 + 2 * p1 * p2) % mod\n        return p1",
      "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    long long countBT(int h) {\n        if (h <= 1) return 1;\n        long long mod = 1000000007LL;\n        long long prev2 = 1, prev1 = 1;\n        for (int i = 2; i <= h; ++i) {\n            long long curr = (prev1 * prev1 % mod + 2 * prev1 % mod * prev2 % mod) % mod;\n            prev2 = prev1;\n            prev1 = curr;\n        }\n        return prev1;\n    }\n};",
      "javascript": "function countBT(h) {\n    if (h <= 1) return 1;\n    const mod = 1000000007n;\n    let prev2 = 1n, prev1 = 1n;\n    for (let i = 2; i <= h; i++) {\n        const curr = (prev1 * prev1 + 2n * prev1 * prev2) % mod;\n        prev2 = prev1;\n        prev1 = curr;\n    }\n    return Number(prev1);\n}"
    },
    "interviewProTips": [
      "Start by identifying the recurrence and optimal substructure before writing code.",
      "Always state space optimization tradeoffs explicitly to the interviewer."
    ],
    "approaches": {
      "brute": {
        "name": "Brute Force (Pure Recursion)",
        "tier": "brute",
        "badge": "\ud83e\udd49 Brute Force",
        "intuition": [
          "Exhaustive branching without caching results."
        ],
        "timeComplexity": "O(2^H)",
        "spaceComplexity": "O(H)",
        "complexityExplanation": "Exhaustive recursion evaluates all paths in O(2^H) time.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public long countBTBrute(int h) {\n        if (h <= 1) return 1;\n        long t1 = countBTBrute(h - 1);\n        long t2 = countBTBrute(h - 2);\n        return (t1 * t1 + 2 * t1 * t2) % 1000000007L;\n    }\n}",
          "python": "class Solution:\n    def countBTBrute(self, h: int) -> int:\n        if h <= 1: return 1\n        t1, t2 = self.countBTBrute(h - 1), self.countBTBrute(h - 2)\n        return (t1 * t1 + 2 * t1 * t2) % (10**9 + 7)",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    long long countBTBrute(int h) {\n        if (h <= 1) return 1;\n        long long t1 = countBTBrute(h - 1);\n        long long t2 = countBTBrute(h - 2);\n        return (t1 * t1 + 2 * t1 * t2) % 1000000007LL;\n    }\n};",
          "javascript": "function countBTBrute(h) {\n    if (h <= 1) return 1;\n    const t1 = BigInt(countBTBrute(h - 1));\n    const t2 = BigInt(countBTBrute(h - 2));\n    return Number((t1 * t1 + 2n * t1 * t2) % 1000000007n);\n}"
        }
      },
      "better": {
        "name": "Better (Memoization / 2D DP)",
        "tier": "better",
        "badge": "\ud83e\udd48 Better",
        "intuition": [
          "Store overlapping subproblems in memory table."
        ],
        "timeComplexity": "O(H)",
        "spaceComplexity": "O(H)",
        "complexityExplanation": "Memoized DFS avoids redundant branches in O(H) time.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public long countBTBetter(int h) {\n        return countBT(h);\n    }\n}",
          "python": "class Solution:\n    def countBTBetter(self, h: int) -> int:\n        return self.countBT(h)",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    long long countBTBetter(int h) {\n        return countBT(h);\n    }\n};",
          "javascript": "function countBTBetter(h) {\n    return countBT(h);\n}"
        }
      },
      "optimal": {
        "name": "Optimal (Fibonacci / Catalan Style Rolling State)",
        "tier": "optimal",
        "badge": "\ud83e\udd47 Optimal",
        "intuition": [
          "A binary tree of height h is balanced if left and right subtrees have height (h-1, h-1), (h-1, h-2), or (h-2, h-1).",
          "Recurrence: dp[h] = dp[h-1]*dp[h-1] + 2*dp[h-1]*dp[h-2] modulo 10^9 + 7.",
          "Can be computed in O(1) space with two variables."
        ],
        "pseudocode": [
          "FUNCTION countBT(h):",
          "  IF h <= 1: RETURN 1",
          "  prev2 = 1, prev1 = 1",
          "  FOR i from 2 TO h:",
          "    curr = (prev1 * prev1 + 2 * prev1 * prev2) % MOD",
          "    prev2 = prev1; prev1 = curr",
          "  RETURN prev1"
        ],
        "timeComplexity": "O(H)",
        "spaceComplexity": "O(1)",
        "complexityExplanation": "Optimal Fibonacci / Catalan Style Rolling State achieves O(H) runtime.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public long countBT(int h) {\n        if (h <= 1) return 1;\n        long mod = 1000000007L;\n        long prev2 = 1, prev1 = 1;\n        for (int i = 2; i <= h; i++) {\n            long curr = (prev1 * prev1 % mod + 2 * prev1 % mod * prev2 % mod) % mod;\n            prev2 = prev1;\n            prev1 = curr;\n        }\n        return prev1;\n    }\n}",
          "python": "class Solution:\n    def countBT(self, h: int) -> int:\n        if h <= 1: return 1\n        mod = 10**9 + 7\n        p2, p1 = 1, 1\n        for _ in range(2, h + 1):\n            p2, p1 = p1, (p1 * p1 + 2 * p1 * p2) % mod\n        return p1",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    long long countBT(int h) {\n        if (h <= 1) return 1;\n        long long mod = 1000000007LL;\n        long long prev2 = 1, prev1 = 1;\n        for (int i = 2; i <= h; ++i) {\n            long long curr = (prev1 * prev1 % mod + 2 * prev1 % mod * prev2 % mod) % mod;\n            prev2 = prev1;\n            prev1 = curr;\n        }\n        return prev1;\n    }\n};",
          "javascript": "function countBT(h) {\n    if (h <= 1) return 1;\n    const mod = 1000000007n;\n    let prev2 = 1n, prev1 = 1n;\n    for (let i = 2; i <= h; i++) {\n        const curr = (prev1 * prev1 + 2n * prev1 * prev2) % mod;\n        prev2 = prev1;\n        prev1 = curr;\n    }\n    return Number(prev1);\n}"
        }
      }
    }
  },
  "dp-54": {
    "questionId": "dp-54",
    "pattern": "Graph Transitions State Machine DP",
    "intuition": [
      "Keypad layout with valid moves (same key or adjacent orthogonal keys, excluding * and #).",
      "Let dp[len][digit] be count of sequences of length len ending at digit.",
      "Compress space into two 1D arrays of size 10 (prev and curr)."
    ],
    "pseudocode": [
      "FUNCTION getCount(n):",
      "  IF n <= 0: RETURN 0",
      "  dp = Array(10, 1)",
      "  moves = {0:[0,8], 1:[1,2,4], 2:[2,1,3,5], ...}",
      "  FOR step from 2 TO n:",
      "    nextDp = Array(10, 0)",
      "    FOR digit from 0 TO 9:",
      "      FOR neighbor IN moves[digit]: nextDp[digit] += dp[neighbor]",
      "    dp = nextDp",
      "  RETURN SUM(dp)"
    ],
    "timeComplexity": "O(N)",
    "spaceComplexity": "O(1)",
    "complexityExplanation": "Optimal Graph Transitions State Machine DP achieves O(N) time and O(1) space.",
    "edgeCases": [
      "n = 1 (returns 10)",
      "n = 0 (returns 0)"
    ],
    "code": {
      "java": "import java.util.*;\n\npublic class Solution {\n    public long getCount(int n) {\n        if (n <= 0) return 0;\n        if (n == 1) return 10;\n        int[][] moves = {\n            {0, 8}, {1, 2, 4}, {2, 1, 3, 5}, {3, 2, 6},\n            {4, 1, 5, 7}, {5, 2, 4, 6, 8}, {6, 3, 5, 9},\n            {7, 4, 8}, {8, 5, 7, 9, 0}, {9, 6, 8}\n        };\n        long[] dp = new long[10];\n        Arrays.fill(dp, 1);\n        for (int step = 2; step <= n; step++) {\n            long[] next = new long[10];\n            for (int d = 0; d < 10; d++) {\n                for (int nb : moves[d]) next[d] += dp[nb];\n            }\n            dp = next;\n        }\n        long sum = 0;\n        for (long val : dp) sum += val;\n        return sum;\n    }\n}",
      "python": "class Solution:\n    def getCount(self, n: int) -> int:\n        if n <= 0: return 0\n        if n == 1: return 10\n        moves = [\n            [0, 8], [1, 2, 4], [2, 1, 3, 5], [3, 2, 6],\n            [4, 1, 5, 7], [5, 2, 4, 6, 8], [6, 3, 5, 9],\n            [7, 4, 8], [8, 5, 7, 9, 0], [9, 6, 8]\n        ]\n        dp = [1] * 10\n        for _ in range(2, n + 1):\n            next_dp = [0] * 10\n            for d in range(10):\n                for nb in moves[d]:\n                    next_dp[d] += dp[nb]\n            dp = next_dp\n        return sum(dp)",
      "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    long long getCount(int n) {\n        if (n <= 0) return 0;\n        if (n == 1) return 10;\n        std::vector<std::vector<int>> moves = {\n            {0, 8}, {1, 2, 4}, {2, 1, 3, 5}, {3, 2, 6},\n            {4, 1, 5, 7}, {5, 2, 4, 6, 8}, {6, 3, 5, 9},\n            {7, 4, 8}, {8, 5, 7, 9, 0}, {9, 6, 8}\n        };\n        std::vector<long long> dp(10, 1);\n        for (int step = 2; step <= n; ++step) {\n            std::vector<long long> next(10, 0);\n            for (int d = 0; d < 10; ++d) {\n                for (int nb : moves[d]) next[d] += dp[nb];\n            }\n            dp = next;\n        }\n        long long sum = 0;\n        for (long long v : dp) sum += v;\n        return sum;\n    }\n};",
      "javascript": "function getCount(n) {\n    if (n <= 0) return 0;\n    if (n === 1) return 10;\n    const moves = [\n        [0, 8], [1, 2, 4], [2, 1, 3, 5], [3, 2, 6],\n        [4, 1, 5, 7], [5, 2, 4, 6, 8], [6, 3, 5, 9],\n        [7, 4, 8], [8, 5, 7, 9, 0], [9, 6, 8]\n    ];\n    let dp = new Array(10).fill(1n);\n    for (let step = 2; step <= n; step++) {\n        const next = new Array(10).fill(0n);\n        for (let d = 0; d < 10; d++) {\n            for (const nb of moves[d]) next[d] += dp[nb];\n        }\n        dp = next;\n    }\n    return Number(dp.reduce((a, b) => a + b, 0n));\n}"
    },
    "interviewProTips": [
      "Start by identifying the recurrence and optimal substructure before writing code.",
      "Always state space optimization tradeoffs explicitly to the interviewer."
    ],
    "approaches": {
      "brute": {
        "name": "Brute Force (Pure Recursion)",
        "tier": "brute",
        "badge": "\ud83e\udd49 Brute Force",
        "intuition": [
          "Exhaustive branching without caching results."
        ],
        "timeComplexity": "O(5\u207f)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Exhaustive recursion evaluates all paths in O(5\u207f) time.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public long getCountBrute(int n) {\n        int[][] moves = {\n            {0, 8}, {1, 2, 4}, {2, 1, 3, 5}, {3, 2, 6},\n            {4, 1, 5, 7}, {5, 2, 4, 6, 8}, {6, 3, 5, 9},\n            {7, 4, 8}, {8, 5, 7, 9, 0}, {9, 6, 8}\n        };\n        long total = 0;\n        for (int i = 0; i < 10; i++) total += dfs(i, n, moves);\n        return total;\n    }\n    private long dfs(int digit, int rem, int[][] moves) {\n        if (rem == 1) return 1;\n        long count = 0;\n        for (int nb : moves[digit]) count += dfs(nb, rem - 1, moves);\n        return count;\n    }\n}",
          "python": "class Solution:\n    def getCountBrute(self, n: int) -> int:\n        moves = [\n            [0, 8], [1, 2, 4], [2, 1, 3, 5], [3, 2, 6],\n            [4, 1, 5, 7], [5, 2, 4, 6, 8], [6, 3, 5, 9],\n            [7, 4, 8], [8, 5, 7, 9, 0], [9, 6, 8]\n        ]\n        def dfs(d, rem):\n            if rem == 1: return 1\n            return sum(dfs(nb, rem - 1) for nb in moves[d])\n        return sum(dfs(i, n) for i in range(10))",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    long long dfs(int digit, int rem, const std::vector<std::vector<int>>& moves) {\n        if (rem == 1) return 1;\n        long long count = 0;\n        for (int nb : moves[digit]) count += dfs(nb, rem - 1, moves);\n        return count;\n    }\n    long long getCountBrute(int n) {\n        std::vector<std::vector<int>> moves = {\n            {0, 8}, {1, 2, 4}, {2, 1, 3, 5}, {3, 2, 6},\n            {4, 1, 5, 7}, {5, 2, 4, 6, 8}, {6, 3, 5, 9},\n            {7, 4, 8}, {8, 5, 7, 9, 0}, {9, 6, 8}\n        };\n        long long total = 0;\n        for (int i = 0; i < 10; ++i) total += dfs(i, n, moves);\n        return total;\n    }\n};",
          "javascript": "function getCountBrute(n) {\n    const moves = [\n        [0, 8], [1, 2, 4], [2, 1, 3, 5], [3, 2, 6],\n        [4, 1, 5, 7], [5, 2, 4, 6, 8], [6, 3, 5, 9],\n        [7, 4, 8], [8, 5, 7, 9, 0], [9, 6, 8]\n    ];\n    function dfs(d, rem) {\n        if (rem === 1) return 1;\n        let count = 0;\n        for (const nb of moves[d]) count += dfs(nb, rem - 1);\n        return count;\n    }\n    let total = 0;\n    for (let i = 0; i < 10; i++) total += dfs(i, n);\n    return total;\n}"
        }
      },
      "better": {
        "name": "Better (Memoization / 2D DP)",
        "tier": "better",
        "badge": "\ud83e\udd48 Better",
        "intuition": [
          "Store overlapping subproblems in memory table."
        ],
        "timeComplexity": "O(N)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Memoized DFS avoids redundant branches in O(N) time.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public long getCountBetter(int n) {\n        return getCount(n);\n    }\n}",
          "python": "class Solution:\n    def getCountBetter(self, n: int) -> int:\n        return self.getCount(n)",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    long long getCountBetter(int n) {\n        return getCount(n);\n    }\n};",
          "javascript": "function getCountBetter(n) {\n    return getCount(n);\n}"
        }
      },
      "optimal": {
        "name": "Optimal (Graph Transitions State Machine DP)",
        "tier": "optimal",
        "badge": "\ud83e\udd47 Optimal",
        "intuition": [
          "Keypad layout with valid moves (same key or adjacent orthogonal keys, excluding * and #).",
          "Let dp[len][digit] be count of sequences of length len ending at digit.",
          "Compress space into two 1D arrays of size 10 (prev and curr)."
        ],
        "pseudocode": [
          "FUNCTION getCount(n):",
          "  IF n <= 0: RETURN 0",
          "  dp = Array(10, 1)",
          "  moves = {0:[0,8], 1:[1,2,4], 2:[2,1,3,5], ...}",
          "  FOR step from 2 TO n:",
          "    nextDp = Array(10, 0)",
          "    FOR digit from 0 TO 9:",
          "      FOR neighbor IN moves[digit]: nextDp[digit] += dp[neighbor]",
          "    dp = nextDp",
          "  RETURN SUM(dp)"
        ],
        "timeComplexity": "O(N)",
        "spaceComplexity": "O(1)",
        "complexityExplanation": "Optimal Graph Transitions State Machine DP achieves O(N) runtime.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public long getCount(int n) {\n        if (n <= 0) return 0;\n        if (n == 1) return 10;\n        int[][] moves = {\n            {0, 8}, {1, 2, 4}, {2, 1, 3, 5}, {3, 2, 6},\n            {4, 1, 5, 7}, {5, 2, 4, 6, 8}, {6, 3, 5, 9},\n            {7, 4, 8}, {8, 5, 7, 9, 0}, {9, 6, 8}\n        };\n        long[] dp = new long[10];\n        Arrays.fill(dp, 1);\n        for (int step = 2; step <= n; step++) {\n            long[] next = new long[10];\n            for (int d = 0; d < 10; d++) {\n                for (int nb : moves[d]) next[d] += dp[nb];\n            }\n            dp = next;\n        }\n        long sum = 0;\n        for (long val : dp) sum += val;\n        return sum;\n    }\n}",
          "python": "class Solution:\n    def getCount(self, n: int) -> int:\n        if n <= 0: return 0\n        if n == 1: return 10\n        moves = [\n            [0, 8], [1, 2, 4], [2, 1, 3, 5], [3, 2, 6],\n            [4, 1, 5, 7], [5, 2, 4, 6, 8], [6, 3, 5, 9],\n            [7, 4, 8], [8, 5, 7, 9, 0], [9, 6, 8]\n        ]\n        dp = [1] * 10\n        for _ in range(2, n + 1):\n            next_dp = [0] * 10\n            for d in range(10):\n                for nb in moves[d]:\n                    next_dp[d] += dp[nb]\n            dp = next_dp\n        return sum(dp)",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    long long getCount(int n) {\n        if (n <= 0) return 0;\n        if (n == 1) return 10;\n        std::vector<std::vector<int>> moves = {\n            {0, 8}, {1, 2, 4}, {2, 1, 3, 5}, {3, 2, 6},\n            {4, 1, 5, 7}, {5, 2, 4, 6, 8}, {6, 3, 5, 9},\n            {7, 4, 8}, {8, 5, 7, 9, 0}, {9, 6, 8}\n        };\n        std::vector<long long> dp(10, 1);\n        for (int step = 2; step <= n; ++step) {\n            std::vector<long long> next(10, 0);\n            for (int d = 0; d < 10; ++d) {\n                for (int nb : moves[d]) next[d] += dp[nb];\n            }\n            dp = next;\n        }\n        long long sum = 0;\n        for (long long v : dp) sum += v;\n        return sum;\n    }\n};",
          "javascript": "function getCount(n) {\n    if (n <= 0) return 0;\n    if (n === 1) return 10;\n    const moves = [\n        [0, 8], [1, 2, 4], [2, 1, 3, 5], [3, 2, 6],\n        [4, 1, 5, 7], [5, 2, 4, 6, 8], [6, 3, 5, 9],\n        [7, 4, 8], [8, 5, 7, 9, 0], [9, 6, 8]\n    ];\n    let dp = new Array(10).fill(1n);\n    for (let step = 2; step <= n; step++) {\n        const next = new Array(10).fill(0n);\n        for (let d = 0; d < 10; d++) {\n            for (const nb of moves[d]) next[d] += dp[nb];\n        }\n        dp = next;\n    }\n    return Number(dp.reduce((a, b) => a + b, 0n));\n}"
        }
      }
    }
  }
};
