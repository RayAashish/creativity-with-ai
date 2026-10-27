// Canonical DP Archetypes (48 Complete Optimal, Better & Brute Force Solutions)
import { ProblemSolution } from '../../../types/dsa';

export const DP_ARCHETYPES: Record<string, ProblemSolution> = {
  "longest_common_subsequence": {
    "questionId": "archetype-longest_common_subsequence",
    "pattern": "2D / 1D Rolling Array Subsequence Matching",
    "intuition": [
      "Let dp[i][j] be the length of LCS between text1[0..i-1] and text2[0..j-1].",
      "If text1[i-1] == text2[j-1], chars match: dp[i][j] = 1 + dp[i-1][j-1].",
      "Otherwise, take best branch: dp[i][j] = max(dp[i-1][j], dp[i][j-1]).",
      "Space optimization: Since dp[i] only depends on dp[i-1], use two 1D rows or a single rolling row."
    ],
    "pseudocode": [
      "FUNCTION longestCommonSubsequence(text1, text2):",
      "  m = text1.length, n = text2.length",
      "  prev = Array(n + 1, 0), curr = Array(n + 1, 0)",
      "  FOR i from 1 TO m:",
      "    FOR j from 1 TO n:",
      "      IF text1[i-1] == text2[j-1]: curr[j] = 1 + prev[j-1]",
      "      ELSE: curr[j] = MAX(prev[j], curr[j-1])",
      "    prev = curr.clone()",
      "  RETURN prev[n]"
    ],
    "timeComplexity": "O(M * N)",
    "spaceComplexity": "O(min(M, N))",
    "complexityExplanation": "Optimal 2D / 1D Rolling Array Subsequence Matching achieves O(M * N) time with O(min(M, N)) space.",
    "edgeCases": [
      "Empty strings",
      "Identical strings",
      "No common characters"
    ],
    "code": {
      "java": "import java.util.*;\n\npublic class Solution {\n    public int longestCommonSubsequence(String text1, String text2) {\n        if (text1.length() < text2.length()) return longestCommonSubsequence(text2, text1);\n        int m = text1.length(), n = text2.length();\n        int[] dp = new int[n + 1];\n        for (int i = 1; i <= m; i++) {\n            int prev = 0;\n            for (int j = 1; j <= n; j++) {\n                int temp = dp[j];\n                if (text1.charAt(i - 1) == text2.charAt(j - 1)) {\n                    dp[j] = 1 + prev;\n                } else {\n                    dp[j] = Math.max(dp[j], dp[j - 1]);\n                }\n                prev = temp;\n            }\n        }\n        return dp[n];\n    }\n}",
      "python": "class Solution:\n    def longestCommonSubsequence(self, text1: str, text2: str) -> int:\n        if len(text1) < len(text2): text1, text2 = text2, text1\n        m, n = len(text1), len(text2)\n        dp = [0] * (n + 1)\n        for i in range(1, m + 1):\n            prev = 0\n            for j in range(1, n + 1):\n                temp = dp[j]\n                if text1[i - 1] == text2[j - 1]:\n                    dp[j] = 1 + prev\n                else:\n                    dp[j] = max(dp[j], dp[j - 1])\n                prev = temp\n        return dp[n]",
      "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int longestCommonSubsequence(std::string text1, std::string text2) {\n        if (text1.length() < text2.length()) std::swap(text1, text2);\n        int m = text1.length(), n = text2.length();\n        std::vector<int> dp(n + 1, 0);\n        for (int i = 1; i <= m; ++i) {\n            int prev = 0;\n            for (int j = 1; j <= n; ++j) {\n                int temp = dp[j];\n                if (text1[i - 1] == text2[j - 1]) {\n                    dp[j] = 1 + prev;\n                } else {\n                    dp[j] = std::max(dp[j], dp[j - 1]);\n                }\n                prev = temp;\n            }\n        }\n        return dp[n];\n    }\n};",
      "javascript": "function longestCommonSubsequence(text1, text2) {\n    if (text1.length < text2.length) [text1, text2] = [text2, text1];\n    const m = text1.length, n = text2.length;\n    const dp = new Array(n + 1).fill(0);\n    for (let i = 1; i <= m; i++) {\n        let prev = 0;\n        for (let j = 1; j <= n; j++) {\n            const temp = dp[j];\n            if (text1[i - 1] === text2[j - 1]) {\n                dp[j] = 1 + prev;\n            } else {\n                dp[j] = Math.max(dp[j], dp[j - 1]);\n            }\n            prev = temp;\n        }\n    }\n    return dp[n];\n}"
    },
    "interviewProTips": [
      "Start with the state transition recurrence for Longest Common Subsequence before writing space-optimized code.",
      "Verify base cases for empty or single element inputs to prevent out-of-bounds access."
    ],
    "approaches": {
      "brute": {
        "name": "Brute Force (Pure Recursion)",
        "tier": "brute",
        "badge": "\ud83e\udd49 Brute Force",
        "intuition": [
          "Formulate problem as recursive exploration of all choice branches without memoization.",
          "Re-evaluates identical subproblem states repeatedly, leading to exponential time complexity."
        ],
        "timeComplexity": "O(2^(M+N))",
        "spaceComplexity": "O(M + N)",
        "complexityExplanation": "Exhaustive recursion tree branches into O(2^(M+N)) operations.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int longestCommonSubsequenceBrute(String text1, String text2) {\n        return helper(text1, text2, text1.length() - 1, text2.length() - 1);\n    }\n    private int helper(String s1, String s2, int i, int j) {\n        if (i < 0 || j < 0) return 0;\n        if (s1.charAt(i) == s2.charAt(j)) {\n            return 1 + helper(s1, s2, i - 1, j - 1);\n        }\n        return Math.max(helper(s1, s2, i - 1, j), helper(s1, s2, i, j - 1));\n    }\n}",
          "python": "class Solution:\n    def longestCommonSubsequenceBrute(self, text1: str, text2: str) -> int:\n        def h(i, j):\n            if i < 0 or j < 0: return 0\n            if text1[i] == text2[j]:\n                return 1 + h(i - 1, j - 1)\n            return max(h(i - 1, j), h(i, j - 1))\n        return h(len(text1) - 1, len(text2) - 1)",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int helper(const std::string& s1, const std::string& s2, int i, int j) {\n        if (i < 0 || j < 0) return 0;\n        if (s1[i] == s2[j]) return 1 + helper(s1, s2, i - 1, j - 1);\n        return std::max(helper(s1, s2, i - 1, j), helper(s1, s2, i, j - 1));\n    }\n    int longestCommonSubsequenceBrute(std::string text1, std::string text2) {\n        return helper(text1, text2, (int)text1.size() - 1, (int)text2.size() - 1);\n    }\n};",
          "javascript": "function longestCommonSubsequenceBrute(text1, text2) {\n    function h(i, j) {\n        if (i < 0 || j < 0) return 0;\n        if (text1[i] === text2[j]) return 1 + h(i - 1, j - 1);\n        return Math.max(h(i - 1, j), h(i, j - 1));\n    }\n    return h(text1.length - 1, text2.length - 1);\n}"
        }
      },
      "better": {
        "name": "Better (Memoized DFS / 2D DP Table)",
        "tier": "better",
        "badge": "\ud83e\udd48 Better",
        "intuition": [
          "Store previously computed subproblem states in a lookup table or matrix.",
          "If a state is already visited, return the stored value immediately in O(1) time."
        ],
        "timeComplexity": "O(M * N)",
        "spaceComplexity": "O(M * N)",
        "complexityExplanation": "Memoization evaluates each state at most once, reducing time to O(M * N).",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int longestCommonSubsequenceBetter(String text1, String text2) {\n        int m = text1.length(), n = text2.length();\n        int[][] dp = new int[m + 1][n + 1];\n        for (int i = 1; i <= m; i++) {\n            for (int j = 1; j <= n; j++) {\n                if (text1.charAt(i - 1) == text2.charAt(j - 1)) {\n                    dp[i][j] = 1 + dp[i - 1][j - 1];\n                } else {\n                    dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);\n                }\n            }\n        }\n        return dp[m][n];\n    }\n}",
          "python": "class Solution:\n    def longestCommonSubsequenceBetter(self, text1: str, text2: str) -> int:\n        m, n = len(text1), len(text2)\n        dp = [[0] * (n + 1) for _ in range(m + 1)]\n        for i in range(1, m + 1):\n            for j in range(1, n + 1):\n                if text1[i - 1] == text2[j - 1]:\n                    dp[i][j] = 1 + dp[i - 1][j - 1]\n                else:\n                    dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])\n        return dp[m][n]",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int longestCommonSubsequenceBetter(std::string text1, std::string text2) {\n        int m = text1.length(), n = text2.length();\n        std::vector<std::vector<int>> dp(m + 1, std::vector<int>(n + 1, 0));\n        for (int i = 1; i <= m; ++i) {\n            for (int j = 1; j <= n; ++j) {\n                if (text1[i - 1] == text2[j - 1]) {\n                    dp[i][j] = 1 + dp[i - 1][j - 1];\n                } else {\n                    dp[i][j] = std::max(dp[i - 1][j], dp[i][j - 1]);\n                }\n            }\n        }\n        return dp[m][n];\n    }\n};",
          "javascript": "function longestCommonSubsequenceBetter(text1, text2) {\n    const m = text1.length, n = text2.length;\n    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));\n    for (let i = 1; i <= m; i++) {\n        for (let j = 1; j <= n; j++) {\n            if (text1[i - 1] === text2[j - 1]) {\n                dp[i][j] = 1 + dp[i - 1][j - 1];\n            } else {\n                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);\n            }\n        }\n    }\n    return dp[m][n];\n}"
        }
      },
      "optimal": {
        "name": "Optimal (2D / 1D Rolling Array Subsequence Matching)",
        "tier": "optimal",
        "badge": "\ud83e\udd47 Optimal",
        "intuition": [
          "Let dp[i][j] be the length of LCS between text1[0..i-1] and text2[0..j-1].",
          "If text1[i-1] == text2[j-1], chars match: dp[i][j] = 1 + dp[i-1][j-1].",
          "Otherwise, take best branch: dp[i][j] = max(dp[i-1][j], dp[i][j-1]).",
          "Space optimization: Since dp[i] only depends on dp[i-1], use two 1D rows or a single rolling row."
        ],
        "pseudocode": [
          "FUNCTION longestCommonSubsequence(text1, text2):",
          "  m = text1.length, n = text2.length",
          "  prev = Array(n + 1, 0), curr = Array(n + 1, 0)",
          "  FOR i from 1 TO m:",
          "    FOR j from 1 TO n:",
          "      IF text1[i-1] == text2[j-1]: curr[j] = 1 + prev[j-1]",
          "      ELSE: curr[j] = MAX(prev[j], curr[j-1])",
          "    prev = curr.clone()",
          "  RETURN prev[n]"
        ],
        "timeComplexity": "O(M * N)",
        "spaceComplexity": "O(min(M, N))",
        "complexityExplanation": "Optimal 2D / 1D Rolling Array Subsequence Matching achieves O(M * N) time with O(min(M, N)) auxiliary space.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int longestCommonSubsequence(String text1, String text2) {\n        if (text1.length() < text2.length()) return longestCommonSubsequence(text2, text1);\n        int m = text1.length(), n = text2.length();\n        int[] dp = new int[n + 1];\n        for (int i = 1; i <= m; i++) {\n            int prev = 0;\n            for (int j = 1; j <= n; j++) {\n                int temp = dp[j];\n                if (text1.charAt(i - 1) == text2.charAt(j - 1)) {\n                    dp[j] = 1 + prev;\n                } else {\n                    dp[j] = Math.max(dp[j], dp[j - 1]);\n                }\n                prev = temp;\n            }\n        }\n        return dp[n];\n    }\n}",
          "python": "class Solution:\n    def longestCommonSubsequence(self, text1: str, text2: str) -> int:\n        if len(text1) < len(text2): text1, text2 = text2, text1\n        m, n = len(text1), len(text2)\n        dp = [0] * (n + 1)\n        for i in range(1, m + 1):\n            prev = 0\n            for j in range(1, n + 1):\n                temp = dp[j]\n                if text1[i - 1] == text2[j - 1]:\n                    dp[j] = 1 + prev\n                else:\n                    dp[j] = max(dp[j], dp[j - 1])\n                prev = temp\n        return dp[n]",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int longestCommonSubsequence(std::string text1, std::string text2) {\n        if (text1.length() < text2.length()) std::swap(text1, text2);\n        int m = text1.length(), n = text2.length();\n        std::vector<int> dp(n + 1, 0);\n        for (int i = 1; i <= m; ++i) {\n            int prev = 0;\n            for (int j = 1; j <= n; ++j) {\n                int temp = dp[j];\n                if (text1[i - 1] == text2[j - 1]) {\n                    dp[j] = 1 + prev;\n                } else {\n                    dp[j] = std::max(dp[j], dp[j - 1]);\n                }\n                prev = temp;\n            }\n        }\n        return dp[n];\n    }\n};",
          "javascript": "function longestCommonSubsequence(text1, text2) {\n    if (text1.length < text2.length) [text1, text2] = [text2, text1];\n    const m = text1.length, n = text2.length;\n    const dp = new Array(n + 1).fill(0);\n    for (let i = 1; i <= m; i++) {\n        let prev = 0;\n        for (let j = 1; j <= n; j++) {\n            const temp = dp[j];\n            if (text1[i - 1] === text2[j - 1]) {\n                dp[j] = 1 + prev;\n            } else {\n                dp[j] = Math.max(dp[j], dp[j - 1]);\n            }\n            prev = temp;\n        }\n    }\n    return dp[n];\n}"
        }
      }
    }
  },
  "edit_distance": {
    "questionId": "archetype-edit_distance",
    "pattern": "2D Tabulation with 1D Space Rolling",
    "intuition": [
      "Let dp[i][j] be minimum operations to convert word1[0..i-1] to word2[0..j-1].",
      "If word1[i-1] == word2[j-1], no op required: dp[i][j] = dp[i-1][j-1].",
      "Otherwise, take min of 3 operations + 1: Insert (dp[i][j-1]), Delete (dp[i-1][j]), Replace (dp[i-1][j-1]).",
      "Can be space-optimized to O(min(M, N)) using 1D rolling array with previous diagonal stored."
    ],
    "pseudocode": [
      "FUNCTION minDistance(word1, word2):",
      "  m = word1.length, n = word2.length",
      "  dp = Array(n + 1, 0 to n)",
      "  FOR i from 1 TO m:",
      "    prev = dp[0]; dp[0] = i",
      "    FOR j from 1 TO n:",
      "      temp = dp[j]",
      "      IF word1[i-1] == word2[j-1]: dp[j] = prev",
      "      ELSE: dp[j] = 1 + MIN(prev, dp[j], dp[j-1])",
      "      prev = temp",
      "  RETURN dp[n]"
    ],
    "timeComplexity": "O(M * N)",
    "spaceComplexity": "O(N)",
    "complexityExplanation": "Optimal 2D Tabulation with 1D Space Rolling achieves O(M * N) time with O(N) space.",
    "edgeCases": [
      "Either string empty",
      "Identical strings",
      "Single character edits"
    ],
    "code": {
      "java": "import java.util.*;\n\npublic class Solution {\n    public int minDistance(String word1, String word2) {\n        int m = word1.length(), n = word2.length();\n        int[] dp = new int[n + 1];\n        for (int j = 0; j <= n; j++) dp[j] = j;\n        for (int i = 1; i <= m; i++) {\n            int prev = dp[0];\n            dp[0] = i;\n            for (int j = 1; j <= n; j++) {\n                int temp = dp[j];\n                if (word1.charAt(i - 1) == word2.charAt(j - 1)) {\n                    dp[j] = prev;\n                } else {\n                    dp[j] = 1 + Math.min(prev, Math.min(dp[j], dp[j - 1]));\n                }\n                prev = temp;\n            }\n        }\n        return dp[n];\n    }\n}",
      "python": "class Solution:\n    def minDistance(self, word1: str, word2: str) -> int:\n        m, n = len(word1), len(word2)\n        dp = list(range(n + 1))\n        for i in range(1, m + 1):\n            prev = dp[0]\n            dp[0] = i\n            for j in range(1, n + 1):\n                temp = dp[j]\n                if word1[i - 1] == word2[j - 1]:\n                    dp[j] = prev\n                else:\n                    dp[j] = 1 + min(prev, dp[j], dp[j - 1])\n                prev = temp\n        return dp[n]",
      "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int minDistance(std::string word1, std::string word2) {\n        int m = word1.length(), n = word2.length();\n        std::vector<int> dp(n + 1);\n        for (int j = 0; j <= n; ++j) dp[j] = j;\n        for (int i = 1; i <= m; ++i) {\n            int prev = dp[0];\n            dp[0] = i;\n            for (int j = 1; j <= n; ++j) {\n                int temp = dp[j];\n                if (word1[i - 1] == word2[j - 1]) {\n                    dp[j] = prev;\n                } else {\n                    dp[j] = 1 + std::min({prev, dp[j], dp[j - 1]});\n                }\n                prev = temp;\n            }\n        }\n        return dp[n];\n    }\n};",
      "javascript": "function minDistance(word1, word2) {\n    const m = word1.length, n = word2.length;\n    const dp = Array.from({ length: n + 1 }, (_, j) => j);\n    for (let i = 1; i <= m; i++) {\n        let prev = dp[0];\n        dp[0] = i;\n        for (let j = 1; j <= n; j++) {\n            const temp = dp[j];\n            if (word1[i - 1] === word2[j - 1]) {\n                dp[j] = prev;\n            } else {\n                dp[j] = 1 + Math.min(prev, dp[j], dp[j - 1]);\n            }\n            prev = temp;\n        }\n    }\n    return dp[n];\n}"
    },
    "interviewProTips": [
      "Start with the state transition recurrence for Edit Distance (Levenshtein) before writing space-optimized code.",
      "Verify base cases for empty or single element inputs to prevent out-of-bounds access."
    ],
    "approaches": {
      "brute": {
        "name": "Brute Force (Pure Recursion)",
        "tier": "brute",
        "badge": "\ud83e\udd49 Brute Force",
        "intuition": [
          "Formulate problem as recursive exploration of all choice branches without memoization.",
          "Re-evaluates identical subproblem states repeatedly, leading to exponential time complexity."
        ],
        "timeComplexity": "O(3^(M+N))",
        "spaceComplexity": "O(M + N)",
        "complexityExplanation": "Exhaustive recursion tree branches into O(3^(M+N)) operations.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int minDistanceBrute(String word1, String word2) {\n        return helper(word1, word2, word1.length(), word2.length());\n    }\n    private int helper(String s1, String s2, int m, int n) {\n        if (m == 0) return n;\n        if (n == 0) return m;\n        if (s1.charAt(m - 1) == s2.charAt(n - 1)) return helper(s1, s2, m - 1, n - 1);\n        return 1 + Math.min(helper(s1, s2, m, n - 1), Math.min(helper(s1, s2, m - 1, n), helper(s1, s2, m - 1, n - 1)));\n    }\n}",
          "python": "class Solution:\n    def minDistanceBrute(self, word1: str, word2: str) -> int:\n        def h(m, n):\n            if m == 0: return n\n            if n == 0: return m\n            if word1[m - 1] == word2[n - 1]: return h(m - 1, n - 1)\n            return 1 + min(h(m, n - 1), h(m - 1, n), h(m - 1, n - 1))\n        return h(len(word1), len(word2))",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int helper(const std::string& s1, const std::string& s2, int m, int n) {\n        if (m == 0) return n;\n        if (n == 0) return m;\n        if (s1[m - 1] == s2[n - 1]) return helper(s1, s2, m - 1, n - 1);\n        return 1 + std::min({helper(s1, s2, m, n - 1), helper(s1, s2, m - 1, n), helper(s1, s2, m - 1, n - 1)});\n    }\n    int minDistanceBrute(std::string word1, std::string word2) {\n        return helper(word1, word2, (int)word1.size(), (int)word2.size());\n    }\n};",
          "javascript": "function minDistanceBrute(word1, word2) {\n    function h(m, n) {\n        if (m === 0) return n;\n        if (n === 0) return m;\n        if (word1[m - 1] === word2[n - 1]) return h(m - 1, n - 1);\n        return 1 + Math.min(h(m, n - 1), h(m - 1, n), h(m - 1, n - 1));\n    }\n    return h(word1.length, word2.length);\n}"
        }
      },
      "better": {
        "name": "Better (Memoized DFS / 2D DP Table)",
        "tier": "better",
        "badge": "\ud83e\udd48 Better",
        "intuition": [
          "Store previously computed subproblem states in a lookup table or matrix.",
          "If a state is already visited, return the stored value immediately in O(1) time."
        ],
        "timeComplexity": "O(M * N)",
        "spaceComplexity": "O(M * N)",
        "complexityExplanation": "Memoization evaluates each state at most once, reducing time to O(M * N).",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int minDistanceBetter(String word1, String word2) {\n        int m = word1.length(), n = word2.length();\n        int[][] dp = new int[m + 1][n + 1];\n        for (int i = 0; i <= m; i++) dp[i][0] = i;\n        for (int j = 0; j <= n; j++) dp[0][j] = j;\n        for (int i = 1; i <= m; i++) {\n            for (int j = 1; j <= n; j++) {\n                if (word1.charAt(i - 1) == word2.charAt(j - 1)) {\n                    dp[i][j] = dp[i - 1][j - 1];\n                } else {\n                    dp[i][j] = 1 + Math.min(dp[i - 1][j - 1], Math.min(dp[i - 1][j], dp[i][j - 1]));\n                }\n            }\n        }\n        return dp[m][n];\n    }\n}",
          "python": "class Solution:\n    def minDistanceBetter(self, word1: str, word2: str) -> int:\n        m, n = len(word1), len(word2)\n        dp = [[0] * (n + 1) for _ in range(m + 1)]\n        for i in range(m + 1): dp[i][0] = i\n        for j in range(n + 1): dp[0][j] = j\n        for i in range(1, m + 1):\n            for j in range(1, n + 1):\n                if word1[i - 1] == word2[j - 1]:\n                    dp[i][j] = dp[i - 1][j - 1]\n                else:\n                    dp[i][j] = 1 + min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1])\n        return dp[m][n]",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int minDistanceBetter(std::string word1, std::string word2) {\n        int m = word1.length(), n = word2.length();\n        std::vector<std::vector<int>> dp(m + 1, std::vector<int>(n + 1, 0));\n        for (int i = 0; i <= m; ++i) dp[i][0] = i;\n        for (int j = 0; j <= n; ++j) dp[0][j] = j;\n        for (int i = 1; i <= m; ++i) {\n            for (int j = 1; j <= n; ++j) {\n                if (word1[i - 1] == word2[j - 1]) dp[i][j] = dp[i - 1][j - 1];\n                else dp[i][j] = 1 + std::min({dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]});\n            }\n        }\n        return dp[m][n];\n    }\n};",
          "javascript": "function minDistanceBetter(word1, word2) {\n    const m = word1.length, n = word2.length;\n    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));\n    for (let i = 0; i <= m; i++) dp[i][0] = i;\n    for (let j = 0; j <= n; j++) dp[0][j] = j;\n    for (let i = 1; i <= m; i++) {\n        for (let j = 1; j <= n; j++) {\n            if (word1[i - 1] === word2[j - 1]) dp[i][j] = dp[i - 1][j - 1];\n            else dp[i][j] = 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);\n        }\n    }\n    return dp[m][n];\n}"
        }
      },
      "optimal": {
        "name": "Optimal (2D Tabulation with 1D Space Rolling)",
        "tier": "optimal",
        "badge": "\ud83e\udd47 Optimal",
        "intuition": [
          "Let dp[i][j] be minimum operations to convert word1[0..i-1] to word2[0..j-1].",
          "If word1[i-1] == word2[j-1], no op required: dp[i][j] = dp[i-1][j-1].",
          "Otherwise, take min of 3 operations + 1: Insert (dp[i][j-1]), Delete (dp[i-1][j]), Replace (dp[i-1][j-1]).",
          "Can be space-optimized to O(min(M, N)) using 1D rolling array with previous diagonal stored."
        ],
        "pseudocode": [
          "FUNCTION minDistance(word1, word2):",
          "  m = word1.length, n = word2.length",
          "  dp = Array(n + 1, 0 to n)",
          "  FOR i from 1 TO m:",
          "    prev = dp[0]; dp[0] = i",
          "    FOR j from 1 TO n:",
          "      temp = dp[j]",
          "      IF word1[i-1] == word2[j-1]: dp[j] = prev",
          "      ELSE: dp[j] = 1 + MIN(prev, dp[j], dp[j-1])",
          "      prev = temp",
          "  RETURN dp[n]"
        ],
        "timeComplexity": "O(M * N)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Optimal 2D Tabulation with 1D Space Rolling achieves O(M * N) time with O(N) auxiliary space.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int minDistance(String word1, String word2) {\n        int m = word1.length(), n = word2.length();\n        int[] dp = new int[n + 1];\n        for (int j = 0; j <= n; j++) dp[j] = j;\n        for (int i = 1; i <= m; i++) {\n            int prev = dp[0];\n            dp[0] = i;\n            for (int j = 1; j <= n; j++) {\n                int temp = dp[j];\n                if (word1.charAt(i - 1) == word2.charAt(j - 1)) {\n                    dp[j] = prev;\n                } else {\n                    dp[j] = 1 + Math.min(prev, Math.min(dp[j], dp[j - 1]));\n                }\n                prev = temp;\n            }\n        }\n        return dp[n];\n    }\n}",
          "python": "class Solution:\n    def minDistance(self, word1: str, word2: str) -> int:\n        m, n = len(word1), len(word2)\n        dp = list(range(n + 1))\n        for i in range(1, m + 1):\n            prev = dp[0]\n            dp[0] = i\n            for j in range(1, n + 1):\n                temp = dp[j]\n                if word1[i - 1] == word2[j - 1]:\n                    dp[j] = prev\n                else:\n                    dp[j] = 1 + min(prev, dp[j], dp[j - 1])\n                prev = temp\n        return dp[n]",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int minDistance(std::string word1, std::string word2) {\n        int m = word1.length(), n = word2.length();\n        std::vector<int> dp(n + 1);\n        for (int j = 0; j <= n; ++j) dp[j] = j;\n        for (int i = 1; i <= m; ++i) {\n            int prev = dp[0];\n            dp[0] = i;\n            for (int j = 1; j <= n; ++j) {\n                int temp = dp[j];\n                if (word1[i - 1] == word2[j - 1]) {\n                    dp[j] = prev;\n                } else {\n                    dp[j] = 1 + std::min({prev, dp[j], dp[j - 1]});\n                }\n                prev = temp;\n            }\n        }\n        return dp[n];\n    }\n};",
          "javascript": "function minDistance(word1, word2) {\n    const m = word1.length, n = word2.length;\n    const dp = Array.from({ length: n + 1 }, (_, j) => j);\n    for (let i = 1; i <= m; i++) {\n        let prev = dp[0];\n        dp[0] = i;\n        for (let j = 1; j <= n; j++) {\n            const temp = dp[j];\n            if (word1[i - 1] === word2[j - 1]) {\n                dp[j] = prev;\n            } else {\n                dp[j] = 1 + Math.min(prev, dp[j], dp[j - 1]);\n            }\n            prev = temp;\n        }\n    }\n    return dp[n];\n}"
        }
      }
    }
  },
  "longest_increasing_subsequence": {
    "questionId": "archetype-longest_increasing_subsequence",
    "pattern": "Patience Sorting / Binary Search (O(N log N))",
    "intuition": [
      "Maintain tails array where tails[i] stores the smallest tail of all increasing subsequences of length i + 1.",
      "For each num, binary search in tails to find the first element >= num.",
      "If num is greater than all elements in tails, append it (LIS length increases).",
      "Otherwise, overwrite tails[idx] with num (maintaining minimal tails for future extensions)."
    ],
    "pseudocode": [
      "FUNCTION lengthOfLIS(nums):",
      "  tails = []",
      "  FOR x IN nums:",
      "    idx = binarySearchFirstGreaterOrEqual(tails, x)",
      "    IF idx == tails.length: tails.append(x)",
      "    ELSE: tails[idx] = x",
      "  RETURN tails.length"
    ],
    "timeComplexity": "O(N log N)",
    "spaceComplexity": "O(N)",
    "complexityExplanation": "Optimal Patience Sorting / Binary Search (O(N log N)) achieves O(N log N) time with O(N) space.",
    "edgeCases": [
      "Empty array",
      "Strictly descending array",
      "Strictly ascending array",
      "Duplicate elements"
    ],
    "code": {
      "java": "import java.util.*;\n\npublic class Solution {\n    public int lengthOfLIS(int[] nums) {\n        if (nums == null || nums.length == 0) return 0;\n        int[] tails = new int[nums.length];\n        int size = 0;\n        for (int x : nums) {\n            int i = 0, j = size;\n            while (i < j) {\n                int mid = (i + j) / 2;\n                if (tails[mid] < x) i = mid + 1;\n                else j = mid;\n            }\n            tails[i] = x;\n            if (i == size) size++;\n        }\n        return size;\n    }\n}",
      "python": "class Solution:\n    def lengthOfLIS(self, nums: list[int]) -> int:\n        import bisect\n        tails = []\n        for x in nums:\n            idx = bisect.bisect_left(tails, x)\n            if idx == len(tails):\n                tails.append(x)\n            else:\n                tails[idx] = x\n        return len(tails)",
      "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int lengthOfLIS(std::vector<int>& nums) {\n        std::vector<int> tails;\n        for (int x : nums) {\n            auto it = std::lower_bound(tails.begin(), tails.end(), x);\n            if (it == tails.end()) tails.push_back(x);\n            else *it = x;\n        }\n        return (int)tails.size();\n    }\n};",
      "javascript": "function lengthOfLIS(nums) {\n    if (!nums || nums.length === 0) return 0;\n    const tails = [];\n    for (const x of nums) {\n        let i = 0, j = tails.length;\n        while (i < j) {\n            const mid = Math.floor((i + j) / 2);\n            if (tails[mid] < x) i = mid + 1;\n            else j = mid;\n        }\n        tails[i] = x;\n    }\n    return tails.length;\n}"
    },
    "interviewProTips": [
      "Start with the state transition recurrence for Longest Increasing Subsequence before writing space-optimized code.",
      "Verify base cases for empty or single element inputs to prevent out-of-bounds access."
    ],
    "approaches": {
      "brute": {
        "name": "Brute Force (Pure Recursion)",
        "tier": "brute",
        "badge": "\ud83e\udd49 Brute Force",
        "intuition": [
          "Formulate problem as recursive exploration of all choice branches without memoization.",
          "Re-evaluates identical subproblem states repeatedly, leading to exponential time complexity."
        ],
        "timeComplexity": "O(2\u207f)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Exhaustive recursion tree branches into O(2\u207f) operations.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int lengthOfLISBrute(int[] nums) {\n        return helper(nums, -1, 0);\n    }\n    private int helper(int[] nums, int prevIdx, int currIdx) {\n        if (currIdx == nums.length) return 0;\n        int notTake = helper(nums, prevIdx, currIdx + 1);\n        int take = 0;\n        if (prevIdx == -1 || nums[currIdx] > nums[prevIdx]) {\n            take = 1 + helper(nums, currIdx, currIdx + 1);\n        }\n        return Math.max(take, notTake);\n    }\n}",
          "python": "class Solution:\n    def lengthOfLISBrute(self, nums: list[int]) -> int:\n        def h(prev, curr):\n            if curr == len(nums): return 0\n            not_take = h(prev, curr + 1)\n            take = 1 + h(curr, curr + 1) if prev == -1 or nums[curr] > nums[prev] else 0\n            return max(take, not_take)\n        return h(-1, 0)",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int helper(const std::vector<int>& nums, int prevIdx, int currIdx) {\n        if (currIdx == (int)nums.size()) return 0;\n        int notTake = helper(nums, prevIdx, currIdx + 1);\n        int take = 0;\n        if (prevIdx == -1 || nums[currIdx] > nums[prevIdx]) {\n            take = 1 + helper(nums, currIdx, currIdx + 1);\n        }\n        return std::max(take, notTake);\n    }\n    int lengthOfLISBrute(std::vector<int>& nums) {\n        return helper(nums, -1, 0);\n    }\n};",
          "javascript": "function lengthOfLISBrute(nums) {\n    function h(prevIdx, currIdx) {\n        if (currIdx === nums.length) return 0;\n        const notTake = h(prevIdx, currIdx + 1);\n        const take = (prevIdx === -1 || nums[currIdx] > nums[prevIdx]) ? 1 + h(currIdx, currIdx + 1) : 0;\n        return Math.max(take, notTake);\n    }\n    return h(-1, 0);\n}"
        }
      },
      "better": {
        "name": "Better (Memoized DFS / 2D DP Table)",
        "tier": "better",
        "badge": "\ud83e\udd48 Better",
        "intuition": [
          "Store previously computed subproblem states in a lookup table or matrix.",
          "If a state is already visited, return the stored value immediately in O(1) time."
        ],
        "timeComplexity": "O(N\u00b2)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Memoization evaluates each state at most once, reducing time to O(N\u00b2).",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int lengthOfLISBetter(int[] nums) {\n        if (nums == null || nums.length == 0) return 0;\n        int n = nums.length, maxLen = 1;\n        int[] dp = new int[n];\n        Arrays.fill(dp, 1);\n        for (int i = 1; i < n; i++) {\n            for (int j = 0; j < i; j++) {\n                if (nums[j] < nums[i]) dp[i] = Math.max(dp[i], dp[j] + 1);\n            }\n            maxLen = Math.max(maxLen, dp[i]);\n        }\n        return maxLen;\n    }\n}",
          "python": "class Solution:\n    def lengthOfLISBetter(self, nums: list[int]) -> int:\n        if not nums: return 0\n        n = len(nums)\n        dp = [1] * n\n        for i in range(1, n):\n            for j in range(i):\n                if nums[j] < nums[i]:\n                    dp[i] = max(dp[i], dp[j] + 1)\n        return max(dp)",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int lengthOfLISBetter(std::vector<int>& nums) {\n        if (nums.empty()) return 0;\n        int n = nums.size(), maxLen = 1;\n        std::vector<int> dp(n, 1);\n        for (int i = 1; i < n; ++i) {\n            for (int j = 0; j < i; ++j) {\n                if (nums[j] < nums[i]) dp[i] = std::max(dp[i], dp[j] + 1);\n            }\n            maxLen = std::max(maxLen, dp[i]);\n        }\n        return maxLen;\n    }\n};",
          "javascript": "function lengthOfLISBetter(nums) {\n    if (!nums || nums.length === 0) return 0;\n    const n = nums.length;\n    const dp = new Array(n).fill(1);\n    let maxLen = 1;\n    for (let i = 1; i < n; i++) {\n        for (let j = 0; j < i; j++) {\n            if (nums[j] < nums[i]) dp[i] = Math.max(dp[i], dp[j] + 1);\n        }\n        maxLen = Math.max(maxLen, dp[i]);\n    }\n    return maxLen;\n}"
        }
      },
      "optimal": {
        "name": "Optimal (Patience Sorting / Binary Search (O(N log N)))",
        "tier": "optimal",
        "badge": "\ud83e\udd47 Optimal",
        "intuition": [
          "Maintain tails array where tails[i] stores the smallest tail of all increasing subsequences of length i + 1.",
          "For each num, binary search in tails to find the first element >= num.",
          "If num is greater than all elements in tails, append it (LIS length increases).",
          "Otherwise, overwrite tails[idx] with num (maintaining minimal tails for future extensions)."
        ],
        "pseudocode": [
          "FUNCTION lengthOfLIS(nums):",
          "  tails = []",
          "  FOR x IN nums:",
          "    idx = binarySearchFirstGreaterOrEqual(tails, x)",
          "    IF idx == tails.length: tails.append(x)",
          "    ELSE: tails[idx] = x",
          "  RETURN tails.length"
        ],
        "timeComplexity": "O(N log N)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Optimal Patience Sorting / Binary Search (O(N log N)) achieves O(N log N) time with O(N) auxiliary space.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int lengthOfLIS(int[] nums) {\n        if (nums == null || nums.length == 0) return 0;\n        int[] tails = new int[nums.length];\n        int size = 0;\n        for (int x : nums) {\n            int i = 0, j = size;\n            while (i < j) {\n                int mid = (i + j) / 2;\n                if (tails[mid] < x) i = mid + 1;\n                else j = mid;\n            }\n            tails[i] = x;\n            if (i == size) size++;\n        }\n        return size;\n    }\n}",
          "python": "class Solution:\n    def lengthOfLIS(self, nums: list[int]) -> int:\n        import bisect\n        tails = []\n        for x in nums:\n            idx = bisect.bisect_left(tails, x)\n            if idx == len(tails):\n                tails.append(x)\n            else:\n                tails[idx] = x\n        return len(tails)",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int lengthOfLIS(std::vector<int>& nums) {\n        std::vector<int> tails;\n        for (int x : nums) {\n            auto it = std::lower_bound(tails.begin(), tails.end(), x);\n            if (it == tails.end()) tails.push_back(x);\n            else *it = x;\n        }\n        return (int)tails.size();\n    }\n};",
          "javascript": "function lengthOfLIS(nums) {\n    if (!nums || nums.length === 0) return 0;\n    const tails = [];\n    for (const x of nums) {\n        let i = 0, j = tails.length;\n        while (i < j) {\n            const mid = Math.floor((i + j) / 2);\n            if (tails[mid] < x) i = mid + 1;\n            else j = mid;\n        }\n        tails[i] = x;\n    }\n    return tails.length;\n}"
        }
      }
    }
  },
  "matrix_chain_multiplication": {
    "questionId": "archetype-matrix_chain_multiplication",
    "pattern": "Interval DP / Bracket Splitting",
    "intuition": [
      "Let dp[i][j] represent the minimum operations to multiply matrices from i to j.",
      "For each chain length L from 2 to n-1, try every possible split point k from i to j-1.",
      "Transition: dp[i][j] = min(dp[i][k] + dp[k+1][j] + p[i-1]*p[k]*p[j]).",
      "Optimal substructure: Sub-chains are optimized independently and combined."
    ],
    "pseudocode": [
      "FUNCTION matrixMultiplication(p, n):",
      "  dp = 2D Array n x n initialized to 0",
      "  FOR L from 2 TO n - 1:",
      "    FOR i from 1 TO n - L:",
      "      j = i + L - 1; dp[i][j] = INFINITY",
      "      FOR k from i TO j - 1:",
      "        cost = dp[i][k] + dp[k+1][j] + p[i-1]*p[k]*p[j]",
      "        dp[i][j] = MIN(dp[i][j], cost)",
      "  RETURN dp[1][n-1]"
    ],
    "timeComplexity": "O(N\u00b3)",
    "spaceComplexity": "O(N\u00b2)",
    "complexityExplanation": "Optimal Interval DP / Bracket Splitting achieves O(N\u00b3) time with O(N\u00b2) space.",
    "edgeCases": [
      "Single matrix (n = 2)",
      "Matrices of size 1x1"
    ],
    "code": {
      "java": "import java.util.*;\n\npublic class Solution {\n    public int matrixMultiplication(int[] p, int n) {\n        int[][] dp = new int[n][n];\n        for (int L = 2; L < n; L++) {\n            for (int i = 1; i <= n - L; i++) {\n                int j = i + L - 1;\n                dp[i][j] = Integer.MAX_VALUE;\n                for (int k = i; k < j; k++) {\n                    int cost = dp[i][k] + dp[k + 1][j] + p[i - 1] * p[k] * p[j];\n                    dp[i][j] = Math.min(dp[i][j], cost);\n                }\n            }\n        }\n        return dp[1][n - 1];\n    }\n}",
      "python": "class Solution:\n    def matrixMultiplication(self, p: list[int], n: int) -> int:\n        dp = [[0] * n for _ in range(n)]\n        for L in range(2, n):\n            for i in range(1, n - L + 1):\n                j = i + L - 1\n                dp[i][j] = float('inf')\n                for k in range(i, j):\n                    cost = dp[i][k] + dp[k + 1][j] + p[i - 1] * p[k] * p[j]\n                    dp[i][j] = min(dp[i][j], cost)\n        return dp[1][n - 1]",
      "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int matrixMultiplication(std::vector<int>& p, int n) {\n        std::vector<std::vector<int>> dp(n, std::vector<int>(n, 0));\n        for (int L = 2; L < n; ++L) {\n            for (int i = 1; i <= n - L; ++i) {\n                int j = i + L - 1;\n                dp[i][j] = INT_MAX;\n                for (int k = i; k < j; ++k) {\n                    int cost = dp[i][k] + dp[k + 1][j] + p[i - 1] * p[k] * p[j];\n                    dp[i][j] = std::min(dp[i][j], cost);\n                }\n            }\n        }\n        return dp[1][n - 1];\n    }\n};",
      "javascript": "function matrixMultiplication(p, n) {\n    const dp = Array.from({ length: n }, () => new Array(n).fill(0));\n    for (let L = 2; L < n; L++) {\n        for (let i = 1; i <= n - L; i++) {\n            const j = i + L - 1;\n            dp[i][j] = Infinity;\n            for (let k = i; k < j; k++) {\n                const cost = dp[i][k] + dp[k + 1][j] + p[i - 1] * p[k] * p[j];\n                dp[i][j] = Math.min(dp[i][j], cost);\n            }\n        }\n    }\n    return dp[1][n - 1];\n}"
    },
    "interviewProTips": [
      "Start with the state transition recurrence for Matrix Chain Multiplication before writing space-optimized code.",
      "Verify base cases for empty or single element inputs to prevent out-of-bounds access."
    ],
    "approaches": {
      "brute": {
        "name": "Brute Force (Pure Recursion)",
        "tier": "brute",
        "badge": "\ud83e\udd49 Brute Force",
        "intuition": [
          "Formulate problem as recursive exploration of all choice branches without memoization.",
          "Re-evaluates identical subproblem states repeatedly, leading to exponential time complexity."
        ],
        "timeComplexity": "O(2\u207f)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Exhaustive recursion tree branches into O(2\u207f) operations.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int matrixMultiplicationBrute(int[] p, int n) {\n        return solveRec(p, 1, n - 1);\n    }\n    private int solveRec(int[] p, int i, int j) {\n        if (i == j) return 0;\n        int minCost = Integer.MAX_VALUE;\n        for (int k = i; k < j; k++) {\n            int cost = solveRec(p, i, k) + solveRec(p, k + 1, j) + p[i - 1] * p[k] * p[j];\n            minCost = Math.min(minCost, cost);\n        }\n        return minCost;\n    }\n}",
          "python": "class Solution:\n    def matrixMultiplicationBrute(self, p: list[int], n: int) -> int:\n        def solve(i, j):\n            if i == j: return 0\n            res = float('inf')\n            for k in range(i, j):\n                res = min(res, solve(i, k) + solve(k + 1, j) + p[i - 1] * p[k] * p[j])\n            return res\n        return solve(1, n - 1)",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int solveRec(const std::vector<int>& p, int i, int j) {\n        if (i == j) return 0;\n        int minCost = INT_MAX;\n        for (int k = i; k < j; ++k) {\n            int cost = solveRec(p, i, k) + solveRec(p, k + 1, j) + p[i - 1] * p[k] * p[j];\n            minCost = std::min(minCost, cost);\n        }\n        return minCost;\n    }\n    int matrixMultiplicationBrute(std::vector<int>& p, int n) {\n        return solveRec(p, 1, n - 1);\n    }\n};",
          "javascript": "function matrixMultiplicationBrute(p, n) {\n    function solve(i, j) {\n        if (i === j) return 0;\n        let minCost = Infinity;\n        for (let k = i; k < j; k++) {\n            const cost = solve(i, k) + solve(k + 1, j) + p[i - 1] * p[k] * p[j];\n            minCost = Math.min(minCost, cost);\n        }\n        return minCost;\n    }\n    return solve(1, n - 1);\n}"
        }
      },
      "better": {
        "name": "Better (Memoized DFS / 2D DP Table)",
        "tier": "better",
        "badge": "\ud83e\udd48 Better",
        "intuition": [
          "Store previously computed subproblem states in a lookup table or matrix.",
          "If a state is already visited, return the stored value immediately in O(1) time."
        ],
        "timeComplexity": "O(N\u00b3)",
        "spaceComplexity": "O(N\u00b2)",
        "complexityExplanation": "Memoization evaluates each state at most once, reducing time to O(N\u00b3).",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int matrixMultiplicationBetter(int[] p, int n) {\n        int[][] memo = new int[n][n];\n        for (int[] row : memo) Arrays.fill(row, -1);\n        return solveMemo(p, 1, n - 1, memo);\n    }\n    private int solveMemo(int[] p, int i, int j, int[][] memo) {\n        if (i == j) return 0;\n        if (memo[i][j] != -1) return memo[i][j];\n        int minCost = Integer.MAX_VALUE;\n        for (int k = i; k < j; k++) {\n            int cost = solveMemo(p, i, k, memo) + solveMemo(p, k + 1, j, memo) + p[i - 1] * p[k] * p[j];\n            minCost = Math.min(minCost, cost);\n        }\n        return memo[i][j] = minCost;\n    }\n}",
          "python": "class Solution:\n    def matrixMultiplicationBetter(self, p: list[int], n: int) -> int:\n        memo = {}\n        def solve(i, j):\n            if i == j: return 0\n            if (i, j) in memo: return memo[(i, j)]\n            res = float('inf')\n            for k in range(i, j):\n                res = min(res, solve(i, k) + solve(k + 1, j) + p[i - 1] * p[k] * p[j])\n            memo[(i, j)] = res\n            return res\n        return solve(1, n - 1)",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int solveMemo(const std::vector<int>& p, int i, int j, std::vector<std::vector<int>>& memo) {\n        if (i == j) return 0;\n        if (memo[i][j] != -1) return memo[i][j];\n        int minCost = INT_MAX;\n        for (int k = i; k < j; ++k) {\n            int cost = solveMemo(p, i, k, memo) + solveMemo(p, k + 1, j, memo) + p[i - 1] * p[k] * p[j];\n            minCost = std::min(minCost, cost);\n        }\n        return memo[i][j] = minCost;\n    }\n    int matrixMultiplicationBetter(std::vector<int>& p, int n) {\n        std::vector<std::vector<int>> memo(n, std::vector<int>(n, -1));\n        return solveMemo(p, 1, n - 1, memo);\n    }\n};",
          "javascript": "function matrixMultiplicationBetter(p, n) {\n    const memo = Array.from({ length: n }, () => new Array(n).fill(-1));\n    function solve(i, j) {\n        if (i === j) return 0;\n        if (memo[i][j] !== -1) return memo[i][j];\n        let minCost = Infinity;\n        for (let k = i; k < j; k++) {\n            const cost = solve(i, k) + solve(k + 1, j) + p[i - 1] * p[k] * p[j];\n            minCost = Math.min(minCost, cost);\n        }\n        return memo[i][j] = minCost;\n    }\n    return solve(1, n - 1);\n}"
        }
      },
      "optimal": {
        "name": "Optimal (Interval DP / Bracket Splitting)",
        "tier": "optimal",
        "badge": "\ud83e\udd47 Optimal",
        "intuition": [
          "Let dp[i][j] represent the minimum operations to multiply matrices from i to j.",
          "For each chain length L from 2 to n-1, try every possible split point k from i to j-1.",
          "Transition: dp[i][j] = min(dp[i][k] + dp[k+1][j] + p[i-1]*p[k]*p[j]).",
          "Optimal substructure: Sub-chains are optimized independently and combined."
        ],
        "pseudocode": [
          "FUNCTION matrixMultiplication(p, n):",
          "  dp = 2D Array n x n initialized to 0",
          "  FOR L from 2 TO n - 1:",
          "    FOR i from 1 TO n - L:",
          "      j = i + L - 1; dp[i][j] = INFINITY",
          "      FOR k from i TO j - 1:",
          "        cost = dp[i][k] + dp[k+1][j] + p[i-1]*p[k]*p[j]",
          "        dp[i][j] = MIN(dp[i][j], cost)",
          "  RETURN dp[1][n-1]"
        ],
        "timeComplexity": "O(N\u00b3)",
        "spaceComplexity": "O(N\u00b2)",
        "complexityExplanation": "Optimal Interval DP / Bracket Splitting achieves O(N\u00b3) time with O(N\u00b2) auxiliary space.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int matrixMultiplication(int[] p, int n) {\n        int[][] dp = new int[n][n];\n        for (int L = 2; L < n; L++) {\n            for (int i = 1; i <= n - L; i++) {\n                int j = i + L - 1;\n                dp[i][j] = Integer.MAX_VALUE;\n                for (int k = i; k < j; k++) {\n                    int cost = dp[i][k] + dp[k + 1][j] + p[i - 1] * p[k] * p[j];\n                    dp[i][j] = Math.min(dp[i][j], cost);\n                }\n            }\n        }\n        return dp[1][n - 1];\n    }\n}",
          "python": "class Solution:\n    def matrixMultiplication(self, p: list[int], n: int) -> int:\n        dp = [[0] * n for _ in range(n)]\n        for L in range(2, n):\n            for i in range(1, n - L + 1):\n                j = i + L - 1\n                dp[i][j] = float('inf')\n                for k in range(i, j):\n                    cost = dp[i][k] + dp[k + 1][j] + p[i - 1] * p[k] * p[j]\n                    dp[i][j] = min(dp[i][j], cost)\n        return dp[1][n - 1]",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int matrixMultiplication(std::vector<int>& p, int n) {\n        std::vector<std::vector<int>> dp(n, std::vector<int>(n, 0));\n        for (int L = 2; L < n; ++L) {\n            for (int i = 1; i <= n - L; ++i) {\n                int j = i + L - 1;\n                dp[i][j] = INT_MAX;\n                for (int k = i; k < j; ++k) {\n                    int cost = dp[i][k] + dp[k + 1][j] + p[i - 1] * p[k] * p[j];\n                    dp[i][j] = std::min(dp[i][j], cost);\n                }\n            }\n        }\n        return dp[1][n - 1];\n    }\n};",
          "javascript": "function matrixMultiplication(p, n) {\n    const dp = Array.from({ length: n }, () => new Array(n).fill(0));\n    for (let L = 2; L < n; L++) {\n        for (let i = 1; i <= n - L; i++) {\n            const j = i + L - 1;\n            dp[i][j] = Infinity;\n            for (let k = i; k < j; k++) {\n                const cost = dp[i][k] + dp[k + 1][j] + p[i - 1] * p[k] * p[j];\n                dp[i][j] = Math.min(dp[i][j], cost);\n            }\n        }\n    }\n    return dp[1][n - 1];\n}"
        }
      }
    }
  },
  "longest_palindromic_subsequence": {
    "questionId": "archetype-longest_palindromic_subsequence",
    "pattern": "1D / 2D Interval DP",
    "intuition": [
      "LPS of s is equivalent to LCS of s and its reverse reverse(s).",
      "Alternatively, use interval DP: if s[i] == s[j], dp[i][j] = 2 + dp[i+1][j-1].",
      "Otherwise, dp[i][j] = max(dp[i+1][j], dp[i][j-1]).",
      "Optimizable to 1D array space by filling bottom-up from right to left."
    ],
    "pseudocode": [
      "FUNCTION longestPalindromeSubseq(s):",
      "  n = s.length",
      "  dp = Array(n, 0)",
      "  FOR i from n - 1 DOWNTO 0:",
      "    dp[i] = 1; prev = 0",
      "    FOR j from i + 1 TO n - 1:",
      "      temp = dp[j]",
      "      IF s[i] == s[j]: dp[j] = 2 + prev",
      "      ELSE: dp[j] = MAX(dp[j], dp[j-1])",
      "      prev = temp",
      "  RETURN dp[n-1]"
    ],
    "timeComplexity": "O(N\u00b2)",
    "spaceComplexity": "O(N)",
    "complexityExplanation": "Optimal 1D / 2D Interval DP achieves O(N\u00b2) time with O(N) space.",
    "edgeCases": [
      "Single character",
      "Already palindrome",
      "All unique characters"
    ],
    "code": {
      "java": "import java.util.*;\n\npublic class Solution {\n    public int longestPalindromeSubseq(String s) {\n        int n = s.length();\n        int[] dp = new int[n];\n        for (int i = n - 1; i >= 0; i--) {\n            dp[i] = 1;\n            int prev = 0;\n            for (int j = i + 1; j < n; j++) {\n                int temp = dp[j];\n                if (s.charAt(i) == s.charAt(j)) {\n                    dp[j] = 2 + prev;\n                } else {\n                    dp[j] = Math.max(dp[j], dp[j - 1]);\n                }\n                prev = temp;\n            }\n        }\n        return dp[n - 1];\n    }\n}",
      "python": "class Solution:\n    def longestPalindromeSubseq(self, s: str) -> int:\n        n = len(s)\n        dp = [0] * n\n        for i in range(n - 1, -1, -1):\n            dp[i] = 1\n            prev = 0\n            for j in range(i + 1, n):\n                temp = dp[j]\n                if s[i] == s[j]:\n                    dp[j] = 2 + prev\n                else:\n                    dp[j] = max(dp[j], dp[j - 1])\n                prev = temp\n        return dp[n - 1]",
      "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int longestPalindromeSubseq(std::string s) {\n        int n = s.length();\n        std::vector<int> dp(n, 0);\n        for (int i = n - 1; i >= 0; --i) {\n            dp[i] = 1;\n            int prev = 0;\n            for (int j = i + 1; j < n; ++j) {\n                int temp = dp[j];\n                if (s[i] == s[j]) dp[j] = 2 + prev;\n                else dp[j] = std::max(dp[j], dp[j - 1]);\n                prev = temp;\n            }\n        }\n        return dp[n - 1];\n    }\n};",
      "javascript": "function longestPalindromeSubseq(s) {\n    const n = s.length;\n    const dp = new Array(n).fill(0);\n    for (let i = n - 1; i >= 0; i--) {\n        dp[i] = 1;\n        let prev = 0;\n        for (let j = i + 1; j < n; j++) {\n            const temp = dp[j];\n            if (s[i] === s[j]) dp[j] = 2 + prev;\n            else dp[j] = Math.max(dp[j], dp[j - 1]);\n            prev = temp;\n        }\n    }\n    return dp[n - 1];\n}"
    },
    "interviewProTips": [
      "Start with the state transition recurrence for Longest Palindromic Subsequence before writing space-optimized code.",
      "Verify base cases for empty or single element inputs to prevent out-of-bounds access."
    ],
    "approaches": {
      "brute": {
        "name": "Brute Force (Pure Recursion)",
        "tier": "brute",
        "badge": "\ud83e\udd49 Brute Force",
        "intuition": [
          "Formulate problem as recursive exploration of all choice branches without memoization.",
          "Re-evaluates identical subproblem states repeatedly, leading to exponential time complexity."
        ],
        "timeComplexity": "O(2\u207f)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Exhaustive recursion tree branches into O(2\u207f) operations.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int longestPalindromeSubseqBrute(String s) {\n        return helper(s, 0, s.length() - 1);\n    }\n    private int helper(String s, int i, int j) {\n        if (i == j) return 1;\n        if (i > j) return 0;\n        if (s.charAt(i) == s.charAt(j)) return 2 + helper(s, i + 1, j - 1);\n        return Math.max(helper(s, i + 1, j), helper(s, i, j - 1));\n    }\n}",
          "python": "class Solution:\n    def longestPalindromeSubseqBrute(self, s: str) -> int:\n        def h(i, j):\n            if i == j: return 1\n            if i > j: return 0\n            if s[i] == s[j]: return 2 + h(i + 1, j - 1)\n            return max(h(i + 1, j), h(i, j - 1))\n        return h(0, len(s) - 1)",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int helper(const std::string& s, int i, int j) {\n        if (i == j) return 1;\n        if (i > j) return 0;\n        if (s[i] == s[j]) return 2 + helper(s, i + 1, j - 1);\n        return std::max(helper(s, i + 1, j), helper(s, i, j - 1));\n    }\n    int longestPalindromeSubseqBrute(std::string s) {\n        return helper(s, 0, (int)s.length() - 1);\n    }\n};",
          "javascript": "function longestPalindromeSubseqBrute(s) {\n    function h(i, j) {\n        if (i === j) return 1;\n        if (i > j) return 0;\n        if (s[i] === s[j]) return 2 + h(i + 1, j - 1);\n        return Math.max(h(i + 1, j), h(i, j - 1));\n    }\n    return h(0, s.length - 1);\n}"
        }
      },
      "better": {
        "name": "Better (Memoized DFS / 2D DP Table)",
        "tier": "better",
        "badge": "\ud83e\udd48 Better",
        "intuition": [
          "Store previously computed subproblem states in a lookup table or matrix.",
          "If a state is already visited, return the stored value immediately in O(1) time."
        ],
        "timeComplexity": "O(N\u00b2)",
        "spaceComplexity": "O(N\u00b2)",
        "complexityExplanation": "Memoization evaluates each state at most once, reducing time to O(N\u00b2).",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int longestPalindromeSubseqBetter(String s) {\n        int n = s.length();\n        int[][] dp = new int[n][n];\n        for (int i = 0; i < n; i++) dp[i][i] = 1;\n        for (int len = 2; len <= n; len++) {\n            for (int i = 0; i <= n - len; i++) {\n                int j = i + len - 1;\n                if (s.charAt(i) == s.charAt(j)) {\n                    dp[i][j] = (len == 2) ? 2 : 2 + dp[i + 1][j - 1];\n                } else {\n                    dp[i][j] = Math.max(dp[i + 1][j], dp[i][j - 1]);\n                }\n            }\n        }\n        return dp[0][n - 1];\n    }\n}",
          "python": "class Solution:\n    def longestPalindromeSubseqBetter(self, s: str) -> int:\n        n = len(s)\n        dp = [[0] * n for _ in range(n)]\n        for i in range(n): dp[i][i] = 1\n        for length in range(2, n + 1):\n            for i in range(n - length + 1):\n                j = i + length - 1\n                if s[i] == s[j]:\n                    dp[i][j] = 2 + (dp[i + 1][j - 1] if length > 2 else 0)\n                else:\n                    dp[i][j] = max(dp[i + 1][j], dp[i][j - 1])\n        return dp[0][n - 1]",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int longestPalindromeSubseqBetter(std::string s) {\n        int n = s.length();\n        std::vector<std::vector<int>> dp(n, std::vector<int>(n, 0));\n        for (int i = 0; i < n; ++i) dp[i][i] = 1;\n        for (int len = 2; len <= n; ++len) {\n            for (int i = 0; i <= n - len; ++i) {\n                int j = i + len - 1;\n                if (s[i] == s[j]) dp[i][j] = (len == 2) ? 2 : 2 + dp[i + 1][j - 1];\n                else dp[i][j] = std::max(dp[i + 1][j], dp[i][j - 1]);\n            }\n        }\n        return dp[0][n - 1];\n    }\n};",
          "javascript": "function longestPalindromeSubseqBetter(s) {\n    const n = s.length;\n    const dp = Array.from({ length: n }, () => new Array(n).fill(0));\n    for (let i = 0; i < n; i++) dp[i][i] = 1;\n    for (let len = 2; len <= n; len++) {\n        for (let i = 0; i <= n - len; i++) {\n            const j = i + len - 1;\n            if (s[i] === s[j]) dp[i][j] = (len === 2) ? 2 : 2 + dp[i + 1][j - 1];\n            else dp[i][j] = Math.max(dp[i + 1][j], dp[i][j - 1]);\n        }\n    }\n    return dp[0][n - 1];\n}"
        }
      },
      "optimal": {
        "name": "Optimal (1D / 2D Interval DP)",
        "tier": "optimal",
        "badge": "\ud83e\udd47 Optimal",
        "intuition": [
          "LPS of s is equivalent to LCS of s and its reverse reverse(s).",
          "Alternatively, use interval DP: if s[i] == s[j], dp[i][j] = 2 + dp[i+1][j-1].",
          "Otherwise, dp[i][j] = max(dp[i+1][j], dp[i][j-1]).",
          "Optimizable to 1D array space by filling bottom-up from right to left."
        ],
        "pseudocode": [
          "FUNCTION longestPalindromeSubseq(s):",
          "  n = s.length",
          "  dp = Array(n, 0)",
          "  FOR i from n - 1 DOWNTO 0:",
          "    dp[i] = 1; prev = 0",
          "    FOR j from i + 1 TO n - 1:",
          "      temp = dp[j]",
          "      IF s[i] == s[j]: dp[j] = 2 + prev",
          "      ELSE: dp[j] = MAX(dp[j], dp[j-1])",
          "      prev = temp",
          "  RETURN dp[n-1]"
        ],
        "timeComplexity": "O(N\u00b2)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Optimal 1D / 2D Interval DP achieves O(N\u00b2) time with O(N) auxiliary space.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int longestPalindromeSubseq(String s) {\n        int n = s.length();\n        int[] dp = new int[n];\n        for (int i = n - 1; i >= 0; i--) {\n            dp[i] = 1;\n            int prev = 0;\n            for (int j = i + 1; j < n; j++) {\n                int temp = dp[j];\n                if (s.charAt(i) == s.charAt(j)) {\n                    dp[j] = 2 + prev;\n                } else {\n                    dp[j] = Math.max(dp[j], dp[j - 1]);\n                }\n                prev = temp;\n            }\n        }\n        return dp[n - 1];\n    }\n}",
          "python": "class Solution:\n    def longestPalindromeSubseq(self, s: str) -> int:\n        n = len(s)\n        dp = [0] * n\n        for i in range(n - 1, -1, -1):\n            dp[i] = 1\n            prev = 0\n            for j in range(i + 1, n):\n                temp = dp[j]\n                if s[i] == s[j]:\n                    dp[j] = 2 + prev\n                else:\n                    dp[j] = max(dp[j], dp[j - 1])\n                prev = temp\n        return dp[n - 1]",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int longestPalindromeSubseq(std::string s) {\n        int n = s.length();\n        std::vector<int> dp(n, 0);\n        for (int i = n - 1; i >= 0; --i) {\n            dp[i] = 1;\n            int prev = 0;\n            for (int j = i + 1; j < n; ++j) {\n                int temp = dp[j];\n                if (s[i] == s[j]) dp[j] = 2 + prev;\n                else dp[j] = std::max(dp[j], dp[j - 1]);\n                prev = temp;\n            }\n        }\n        return dp[n - 1];\n    }\n};",
          "javascript": "function longestPalindromeSubseq(s) {\n    const n = s.length;\n    const dp = new Array(n).fill(0);\n    for (let i = n - 1; i >= 0; i--) {\n        dp[i] = 1;\n        let prev = 0;\n        for (let j = i + 1; j < n; j++) {\n            const temp = dp[j];\n            if (s[i] === s[j]) dp[j] = 2 + prev;\n            else dp[j] = Math.max(dp[j], dp[j - 1]);\n            prev = temp;\n        }\n    }\n    return dp[n - 1];\n}"
        }
      }
    }
  },
  "partition_equal_subset_sum": {
    "questionId": "archetype-partition_equal_subset_sum",
    "pattern": "1D Boolean 0/1 Knapsack",
    "intuition": [
      "If total sum is odd, equal partition is impossible.",
      "Target sum for each subset is totalSum / 2.",
      "Use 1D boolean array dp where dp[w] = true if subset sum w is achievable.",
      "Iterate backwards from target down to num to guarantee 0/1 item inclusion."
    ],
    "pseudocode": [
      "FUNCTION canPartition(nums):",
      "  total = SUM(nums)",
      "  IF total % 2 != 0: RETURN false",
      "  target = total / 2",
      "  dp = Array(target + 1, false); dp[0] = true",
      "  FOR x IN nums:",
      "    FOR w from target DOWNTO x:",
      "      dp[w] = dp[w] OR dp[w - x]",
      "  RETURN dp[target]"
    ],
    "timeComplexity": "O(N * Target)",
    "spaceComplexity": "O(Target)",
    "complexityExplanation": "Optimal 1D Boolean 0/1 Knapsack achieves O(N * Target) time with O(Target) space.",
    "edgeCases": [
      "Odd sum (always false)",
      "Single element (false)",
      "Two identical elements (true)"
    ],
    "code": {
      "java": "import java.util.*;\n\npublic class Solution {\n    public boolean canPartition(int[] nums) {\n        int sum = 0;\n        for (int x : nums) sum += x;\n        if (sum % 2 != 0) return false;\n        int target = sum / 2;\n        boolean[] dp = new boolean[target + 1];\n        dp[0] = true;\n        for (int x : nums) {\n            for (int w = target; w >= x; w--) {\n                dp[w] = dp[w] || dp[w - x];\n            }\n        }\n        return dp[target];\n    }\n}",
      "python": "class Solution:\n    def canPartition(self, nums: list[int]) -> bool:\n        total = sum(nums)\n        if total % 2 != 0: return False\n        target = total // 2\n        dp = [False] * (target + 1)\n        dp[0] = True\n        for x in nums:\n            for w in range(target, x - 1, -1):\n                dp[w] = dp[w] or dp[w - x]\n        return dp[target]",
      "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    bool canPartition(std::vector<int>& nums) {\n        int sum = 0;\n        for (int x : nums) sum += x;\n        if (sum % 2 != 0) return false;\n        int target = sum / 2;\n        std::vector<bool> dp(target + 1, false);\n        dp[0] = true;\n        for (int x : nums) {\n            for (int w = target; w >= x; --w) {\n                dp[w] = dp[w] || dp[w - x];\n            }\n        }\n        return dp[target];\n    }\n};",
      "javascript": "function canPartition(nums) {\n    const sum = nums.reduce((a, b) => a + b, 0);\n    if (sum % 2 !== 0) return false;\n    const target = sum / 2;\n    const dp = new Array(target + 1).fill(false);\n    dp[0] = true;\n    for (const x of nums) {\n        for (let w = target; w >= x; w--) {\n            dp[w] = dp[w] || dp[w - x];\n        }\n    }\n    return dp[target];\n}"
    },
    "interviewProTips": [
      "Start with the state transition recurrence for Partition Equal Subset Sum before writing space-optimized code.",
      "Verify base cases for empty or single element inputs to prevent out-of-bounds access."
    ],
    "approaches": {
      "brute": {
        "name": "Brute Force (Pure Recursion)",
        "tier": "brute",
        "badge": "\ud83e\udd49 Brute Force",
        "intuition": [
          "Formulate problem as recursive exploration of all choice branches without memoization.",
          "Re-evaluates identical subproblem states repeatedly, leading to exponential time complexity."
        ],
        "timeComplexity": "O(2\u207f)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Exhaustive recursion tree branches into O(2\u207f) operations.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public boolean canPartitionBrute(int[] nums) {\n        int sum = 0;\n        for (int x : nums) sum += x;\n        if (sum % 2 != 0) return false;\n        return helper(nums, nums.length - 1, sum / 2);\n    }\n    private boolean helper(int[] nums, int idx, int rem) {\n        if (rem == 0) return true;\n        if (idx < 0 || rem < 0) return false;\n        return helper(nums, idx - 1, rem - nums[idx]) || helper(nums, idx - 1, rem);\n    }\n}",
          "python": "class Solution:\n    def canPartitionBrute(self, nums: list[int]) -> bool:\n        total = sum(nums)\n        if total % 2 != 0: return False\n        def h(idx, rem):\n            if rem == 0: return True\n            if idx < 0 or rem < 0: return False\n            return h(idx - 1, rem - nums[idx]) or h(idx - 1, rem)\n        return h(len(nums) - 1, total // 2)",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    bool helper(const std::vector<int>& nums, int idx, int rem) {\n        if (rem == 0) return true;\n        if (idx < 0 || rem < 0) return false;\n        return helper(nums, idx - 1, rem - nums[idx]) || helper(nums, idx - 1, rem);\n    }\n    bool canPartitionBrute(std::vector<int>& nums) {\n        int sum = 0;\n        for (int x : nums) sum += x;\n        if (sum % 2 != 0) return false;\n        return helper(nums, (int)nums.size() - 1, sum / 2);\n    }\n};",
          "javascript": "function canPartitionBrute(nums) {\n    const sum = nums.reduce((a, b) => a + b, 0);\n    if (sum % 2 !== 0) return false;\n    function h(idx, rem) {\n        if (rem === 0) return true;\n        if (idx < 0 || rem < 0) return false;\n        return h(idx - 1, rem - nums[idx]) || h(idx - 1, rem);\n    }\n    return h(nums.length - 1, sum / 2);\n}"
        }
      },
      "better": {
        "name": "Better (Memoized DFS / 2D DP Table)",
        "tier": "better",
        "badge": "\ud83e\udd48 Better",
        "intuition": [
          "Store previously computed subproblem states in a lookup table or matrix.",
          "If a state is already visited, return the stored value immediately in O(1) time."
        ],
        "timeComplexity": "O(N * Target)",
        "spaceComplexity": "O(N * Target)",
        "complexityExplanation": "Memoization evaluates each state at most once, reducing time to O(N * Target).",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public boolean canPartitionBetter(int[] nums) {\n        int sum = 0;\n        for (int x : nums) sum += x;\n        if (sum % 2 != 0) return false;\n        int target = sum / 2, n = nums.length;\n        boolean[][] dp = new boolean[n + 1][target + 1];\n        for (int i = 0; i <= n; i++) dp[i][0] = true;\n        for (int i = 1; i <= n; i++) {\n            for (int w = 1; w <= target; w++) {\n                if (nums[i - 1] <= w) {\n                    dp[i][w] = dp[i - 1][w] || dp[i - 1][w - nums[i - 1]];\n                } else {\n                    dp[i][w] = dp[i - 1][w];\n                }\n            }\n        }\n        return dp[n][target];\n    }\n}",
          "python": "class Solution:\n    def canPartitionBetter(self, nums: list[int]) -> bool:\n        total = sum(nums)\n        if total % 2 != 0: return False\n        target, n = total // 2, len(nums)\n        dp = [[False] * (target + 1) for _ in range(n + 1)]\n        for i in range(n + 1): dp[i][0] = True\n        for i in range(1, n + 1):\n            for w in range(1, target + 1):\n                if nums[i - 1] <= w:\n                    dp[i][w] = dp[i - 1][w] or dp[i - 1][w - nums[i - 1]]\n                else:\n                    dp[i][w] = dp[i - 1][w]\n        return dp[n][target]",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    bool canPartitionBetter(std::vector<int>& nums) {\n        int sum = 0;\n        for (int x : nums) sum += x;\n        if (sum % 2 != 0) return false;\n        int target = sum / 2, n = nums.size();\n        std::vector<std::vector<bool>> dp(n + 1, std::vector<bool>(target + 1, false));\n        for (int i = 0; i <= n; ++i) dp[i][0] = true;\n        for (int i = 1; i <= n; ++i) {\n            for (int w = 1; w <= target; ++w) {\n                if (nums[i - 1] <= w) dp[i][w] = dp[i - 1][w] || dp[i - 1][w - nums[i - 1]];\n                else dp[i][w] = dp[i - 1][w];\n            }\n        }\n        return dp[n][target];\n    }\n};",
          "javascript": "function canPartitionBetter(nums) {\n    const sum = nums.reduce((a, b) => a + b, 0);\n    if (sum % 2 !== 0) return false;\n    const target = sum / 2, n = nums.length;\n    const dp = Array.from({ length: n + 1 }, () => new Array(target + 1).fill(false));\n    for (let i = 0; i <= n; i++) dp[i][0] = true;\n    for (let i = 1; i <= n; i++) {\n        for (let w = 1; w <= target; w++) {\n            if (nums[i - 1] <= w) dp[i][w] = dp[i - 1][w] || dp[i - 1][w - nums[i - 1]];\n            else dp[i][w] = dp[i - 1][w];\n        }\n    }\n    return dp[n][target];\n}"
        }
      },
      "optimal": {
        "name": "Optimal (1D Boolean 0/1 Knapsack)",
        "tier": "optimal",
        "badge": "\ud83e\udd47 Optimal",
        "intuition": [
          "If total sum is odd, equal partition is impossible.",
          "Target sum for each subset is totalSum / 2.",
          "Use 1D boolean array dp where dp[w] = true if subset sum w is achievable.",
          "Iterate backwards from target down to num to guarantee 0/1 item inclusion."
        ],
        "pseudocode": [
          "FUNCTION canPartition(nums):",
          "  total = SUM(nums)",
          "  IF total % 2 != 0: RETURN false",
          "  target = total / 2",
          "  dp = Array(target + 1, false); dp[0] = true",
          "  FOR x IN nums:",
          "    FOR w from target DOWNTO x:",
          "      dp[w] = dp[w] OR dp[w - x]",
          "  RETURN dp[target]"
        ],
        "timeComplexity": "O(N * Target)",
        "spaceComplexity": "O(Target)",
        "complexityExplanation": "Optimal 1D Boolean 0/1 Knapsack achieves O(N * Target) time with O(Target) auxiliary space.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public boolean canPartition(int[] nums) {\n        int sum = 0;\n        for (int x : nums) sum += x;\n        if (sum % 2 != 0) return false;\n        int target = sum / 2;\n        boolean[] dp = new boolean[target + 1];\n        dp[0] = true;\n        for (int x : nums) {\n            for (int w = target; w >= x; w--) {\n                dp[w] = dp[w] || dp[w - x];\n            }\n        }\n        return dp[target];\n    }\n}",
          "python": "class Solution:\n    def canPartition(self, nums: list[int]) -> bool:\n        total = sum(nums)\n        if total % 2 != 0: return False\n        target = total // 2\n        dp = [False] * (target + 1)\n        dp[0] = True\n        for x in nums:\n            for w in range(target, x - 1, -1):\n                dp[w] = dp[w] or dp[w - x]\n        return dp[target]",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    bool canPartition(std::vector<int>& nums) {\n        int sum = 0;\n        for (int x : nums) sum += x;\n        if (sum % 2 != 0) return false;\n        int target = sum / 2;\n        std::vector<bool> dp(target + 1, false);\n        dp[0] = true;\n        for (int x : nums) {\n            for (int w = target; w >= x; --w) {\n                dp[w] = dp[w] || dp[w - x];\n            }\n        }\n        return dp[target];\n    }\n};",
          "javascript": "function canPartition(nums) {\n    const sum = nums.reduce((a, b) => a + b, 0);\n    if (sum % 2 !== 0) return false;\n    const target = sum / 2;\n    const dp = new Array(target + 1).fill(false);\n    dp[0] = true;\n    for (const x of nums) {\n        for (let w = target; w >= x; w--) {\n            dp[w] = dp[w] || dp[w - x];\n        }\n    }\n    return dp[target];\n}"
        }
      }
    }
  },
  "subset_sum": {
    "questionId": "archetype-subset_sum",
    "pattern": "1D Reverse Boolean Knapsack",
    "intuition": [
      "Determine if there is a subset of the given array with sum equal to given sum.",
      "dp[w] is true if a subset with sum w is formed using elements processed so far.",
      "Reverse iteration prevents multi-counting an element."
    ],
    "pseudocode": [
      "FUNCTION isSubsetSum(arr, sum):",
      "  dp = Array(sum + 1, false); dp[0] = true",
      "  FOR x IN arr:",
      "    FOR w from sum DOWNTO x:",
      "      dp[w] = dp[w] OR dp[w - x]",
      "  RETURN dp[sum]"
    ],
    "timeComplexity": "O(N * Sum)",
    "spaceComplexity": "O(Sum)",
    "complexityExplanation": "Optimal 1D Reverse Boolean Knapsack achieves O(N * Sum) time with O(Sum) space.",
    "edgeCases": [
      "Sum = 0 (always true)",
      "Sum larger than total elements",
      "Single element equals sum"
    ],
    "code": {
      "java": "import java.util.*;\n\npublic class Solution {\n    public boolean isSubsetSum(int[] arr, int sum) {\n        boolean[] dp = new boolean[sum + 1];\n        dp[0] = true;\n        for (int x : arr) {\n            for (int w = sum; w >= x; w--) {\n                dp[w] = dp[w] || dp[w - x];\n            }\n        }\n        return dp[sum];\n    }\n}",
      "python": "class Solution:\n    def isSubsetSum(self, arr: list[int], sum: int) -> bool:\n        dp = [False] * (sum + 1)\n        dp[0] = True\n        for x in arr:\n            for w in range(sum, x - 1, -1):\n                dp[w] = dp[w] or dp[w - x]\n        return dp[sum]",
      "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    bool isSubsetSum(std::vector<int>& arr, int sum) {\n        std::vector<bool> dp(sum + 1, false);\n        dp[0] = true;\n        for (int x : arr) {\n            for (int w = sum; w >= x; --w) {\n                dp[w] = dp[w] || dp[w - x];\n            }\n        }\n        return dp[sum];\n    }\n};",
      "javascript": "function isSubsetSum(arr, sum) {\n    const dp = new Array(sum + 1).fill(false);\n    dp[0] = true;\n    for (const x of arr) {\n        for (let w = sum; w >= x; w--) {\n            dp[w] = dp[w] || dp[w - x];\n        }\n    }\n    return dp[sum];\n}"
    },
    "interviewProTips": [
      "Start with the state transition recurrence for Subset Sum Problem before writing space-optimized code.",
      "Verify base cases for empty or single element inputs to prevent out-of-bounds access."
    ],
    "approaches": {
      "brute": {
        "name": "Brute Force (Pure Recursion)",
        "tier": "brute",
        "badge": "\ud83e\udd49 Brute Force",
        "intuition": [
          "Formulate problem as recursive exploration of all choice branches without memoization.",
          "Re-evaluates identical subproblem states repeatedly, leading to exponential time complexity."
        ],
        "timeComplexity": "O(2\u207f)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Exhaustive recursion tree branches into O(2\u207f) operations.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public boolean isSubsetSumBrute(int[] arr, int sum) {\n        return helper(arr, arr.length - 1, sum);\n    }\n    private boolean helper(int[] arr, int idx, int rem) {\n        if (rem == 0) return true;\n        if (idx < 0 || rem < 0) return false;\n        return helper(arr, idx - 1, rem - arr[idx]) || helper(arr, idx - 1, rem);\n    }\n}",
          "python": "class Solution:\n    def isSubsetSumBrute(self, arr: list[int], sum: int) -> bool:\n        def h(idx, rem):\n            if rem == 0: return True\n            if idx < 0 or rem < 0: return False\n            return h(idx - 1, rem - arr[idx]) or h(idx - 1, rem)\n        return h(len(arr) - 1, sum)",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    bool helper(const std::vector<int>& arr, int idx, int rem) {\n        if (rem == 0) return true;\n        if (idx < 0 || rem < 0) return false;\n        return helper(arr, idx - 1, rem - arr[idx]) || helper(arr, idx - 1, rem);\n    }\n    bool isSubsetSumBrute(std::vector<int>& arr, int sum) {\n        return helper(arr, (int)arr.size() - 1, sum);\n    }\n};",
          "javascript": "function isSubsetSumBrute(arr, sum) {\n    function h(idx, rem) {\n        if (rem === 0) return true;\n        if (idx < 0 || rem < 0) return false;\n        return h(idx - 1, rem - arr[idx]) || h(idx - 1, rem);\n    }\n    return h(arr.length - 1, sum);\n}"
        }
      },
      "better": {
        "name": "Better (Memoized DFS / 2D DP Table)",
        "tier": "better",
        "badge": "\ud83e\udd48 Better",
        "intuition": [
          "Store previously computed subproblem states in a lookup table or matrix.",
          "If a state is already visited, return the stored value immediately in O(1) time."
        ],
        "timeComplexity": "O(N * Sum)",
        "spaceComplexity": "O(N * Sum)",
        "complexityExplanation": "Memoization evaluates each state at most once, reducing time to O(N * Sum).",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public boolean isSubsetSumBetter(int[] arr, int sum) {\n        int n = arr.length;\n        boolean[][] dp = new boolean[n + 1][sum + 1];\n        for (int i = 0; i <= n; i++) dp[i][0] = true;\n        for (int i = 1; i <= n; i++) {\n            for (int w = 1; w <= sum; w++) {\n                if (arr[i - 1] <= w) dp[i][w] = dp[i - 1][w] || dp[i - 1][w - arr[i - 1]];\n                else dp[i][w] = dp[i - 1][w];\n            }\n        }\n        return dp[n][sum];\n    }\n}",
          "python": "class Solution:\n    def isSubsetSumBetter(self, arr: list[int], sum: int) -> bool:\n        n = len(arr)\n        dp = [[False] * (sum + 1) for _ in range(n + 1)]\n        for i in range(n + 1): dp[i][0] = True\n        for i in range(1, n + 1):\n            for w in range(1, sum + 1):\n                if arr[i - 1] <= w: dp[i][w] = dp[i - 1][w] or dp[i - 1][w - arr[i - 1]]\n                else: dp[i][w] = dp[i - 1][w]\n        return dp[n][sum]",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    bool isSubsetSumBetter(std::vector<int>& arr, int sum) {\n        int n = arr.size();\n        std::vector<std::vector<bool>> dp(n + 1, std::vector<bool>(sum + 1, false));\n        for (int i = 0; i <= n; ++i) dp[i][0] = true;\n        for (int i = 1; i <= n; ++i) {\n            for (int w = 1; w <= sum; ++w) {\n                if (arr[i - 1] <= w) dp[i][w] = dp[i - 1][w] || dp[i - 1][w - arr[i - 1]];\n                else dp[i][w] = dp[i - 1][w];\n            }\n        }\n        return dp[n][sum];\n    }\n};",
          "javascript": "function isSubsetSumBetter(arr, sum) {\n    const n = arr.length;\n    const dp = Array.from({ length: n + 1 }, () => new Array(sum + 1).fill(false));\n    for (let i = 0; i <= n; i++) dp[i][0] = true;\n    for (let i = 1; i <= n; i++) {\n        for (let w = 1; w <= sum; w++) {\n            if (arr[i - 1] <= w) dp[i][w] = dp[i - 1][w] || dp[i - 1][w - arr[i - 1]];\n            else dp[i][w] = dp[i - 1][w];\n        }\n    }\n    return dp[n][sum];\n}"
        }
      },
      "optimal": {
        "name": "Optimal (1D Reverse Boolean Knapsack)",
        "tier": "optimal",
        "badge": "\ud83e\udd47 Optimal",
        "intuition": [
          "Determine if there is a subset of the given array with sum equal to given sum.",
          "dp[w] is true if a subset with sum w is formed using elements processed so far.",
          "Reverse iteration prevents multi-counting an element."
        ],
        "pseudocode": [
          "FUNCTION isSubsetSum(arr, sum):",
          "  dp = Array(sum + 1, false); dp[0] = true",
          "  FOR x IN arr:",
          "    FOR w from sum DOWNTO x:",
          "      dp[w] = dp[w] OR dp[w - x]",
          "  RETURN dp[sum]"
        ],
        "timeComplexity": "O(N * Sum)",
        "spaceComplexity": "O(Sum)",
        "complexityExplanation": "Optimal 1D Reverse Boolean Knapsack achieves O(N * Sum) time with O(Sum) auxiliary space.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public boolean isSubsetSum(int[] arr, int sum) {\n        boolean[] dp = new boolean[sum + 1];\n        dp[0] = true;\n        for (int x : arr) {\n            for (int w = sum; w >= x; w--) {\n                dp[w] = dp[w] || dp[w - x];\n            }\n        }\n        return dp[sum];\n    }\n}",
          "python": "class Solution:\n    def isSubsetSum(self, arr: list[int], sum: int) -> bool:\n        dp = [False] * (sum + 1)\n        dp[0] = True\n        for x in arr:\n            for w in range(sum, x - 1, -1):\n                dp[w] = dp[w] or dp[w - x]\n        return dp[sum]",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    bool isSubsetSum(std::vector<int>& arr, int sum) {\n        std::vector<bool> dp(sum + 1, false);\n        dp[0] = true;\n        for (int x : arr) {\n            for (int w = sum; w >= x; --w) {\n                dp[w] = dp[w] || dp[w - x];\n            }\n        }\n        return dp[sum];\n    }\n};",
          "javascript": "function isSubsetSum(arr, sum) {\n    const dp = new Array(sum + 1).fill(false);\n    dp[0] = true;\n    for (const x of arr) {\n        for (let w = sum; w >= x; w--) {\n            dp[w] = dp[w] || dp[w - x];\n        }\n    }\n    return dp[sum];\n}"
        }
      }
    }
  },
  "target_sum": {
    "questionId": "archetype-target_sum",
    "pattern": "Subset Sum Transformation",
    "intuition": [
      "Assigning +/- to each number splits nums into two subsets P (positive) and N (negative).",
      "sum(P) - sum(N) = target and sum(P) + sum(N) = totalSum.",
      "Adding gives 2 * sum(P) = target + totalSum => sum(P) = (target + totalSum) / 2.",
      "Reduces to counting subsets with sum equal to s = (target + totalSum) / 2."
    ],
    "pseudocode": [
      "FUNCTION findTargetSumWays(nums, target):",
      "  total = SUM(nums)",
      "  IF (total + target) < 0 OR (total + target) % 2 != 0: RETURN 0",
      "  s = (total + target) / 2",
      "  dp = Array(s + 1, 0); dp[0] = 1",
      "  FOR x IN nums:",
      "    FOR w from s DOWNTO x: dp[w] += dp[w - x]",
      "  RETURN dp[s]"
    ],
    "timeComplexity": "O(N * S)",
    "spaceComplexity": "O(S)",
    "complexityExplanation": "Optimal Subset Sum Transformation achieves O(N * S) time with O(S) space.",
    "edgeCases": [
      "target > sum(nums)",
      "Zeros in array",
      "Negative target"
    ],
    "code": {
      "java": "import java.util.*;\n\npublic class Solution {\n    public int findTargetSumWays(int[] nums, int target) {\n        int sum = 0;\n        for (int x : nums) sum += x;\n        if (Math.abs(target) > sum || (sum + target) % 2 != 0) return 0;\n        int s = (sum + target) / 2;\n        int[] dp = new int[s + 1];\n        dp[0] = 1;\n        for (int x : nums) {\n            for (int w = s; w >= x; w--) {\n                dp[w] += dp[w - x];\n            }\n        }\n        return dp[s];\n    }\n}",
      "python": "class Solution:\n    def findTargetSumWays(self, nums: list[int], target: int) -> int:\n        total = sum(nums)\n        if abs(target) > total or (total + target) % 2 != 0: return 0\n        s = (total + target) // 2\n        dp = [0] * (s + 1)\n        dp[0] = 1\n        for x in nums:\n            for w in range(s, x - 1, -1):\n                dp[w] += dp[w - x]\n        return dp[s]",
      "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int findTargetSumWays(std::vector<int>& nums, int target) {\n        int sum = 0;\n        for (int x : nums) sum += x;\n        if (std::abs(target) > sum || (sum + target) % 2 != 0) return 0;\n        int s = (sum + target) / 2;\n        std::vector<int> dp(s + 1, 0);\n        dp[0] = 1;\n        for (int x : nums) {\n            for (int w = s; w >= x; --w) {\n                dp[w] += dp[w - x];\n            }\n        }\n        return dp[s];\n    }\n};",
      "javascript": "function findTargetSumWays(nums, target) {\n    const sum = nums.reduce((a, b) => a + b, 0);\n    if (Math.abs(target) > sum || (sum + target) % 2 !== 0) return 0;\n    const s = (sum + target) / 2;\n    const dp = new Array(s + 1).fill(0);\n    dp[0] = 1;\n    for (const x of nums) {\n        for (let w = s; w >= x; w--) {\n            dp[w] += dp[w - x];\n        }\n    }\n    return dp[s];\n}"
    },
    "interviewProTips": [
      "Start with the state transition recurrence for Target Sum before writing space-optimized code.",
      "Verify base cases for empty or single element inputs to prevent out-of-bounds access."
    ],
    "approaches": {
      "brute": {
        "name": "Brute Force (Pure Recursion)",
        "tier": "brute",
        "badge": "\ud83e\udd49 Brute Force",
        "intuition": [
          "Formulate problem as recursive exploration of all choice branches without memoization.",
          "Re-evaluates identical subproblem states repeatedly, leading to exponential time complexity."
        ],
        "timeComplexity": "O(2\u207f)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Exhaustive recursion tree branches into O(2\u207f) operations.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int findTargetSumWaysBrute(int[] nums, int target) {\n        return helper(nums, 0, 0, target);\n    }\n    private int helper(int[] nums, int idx, int curr, int target) {\n        if (idx == nums.length) return curr == target ? 1 : 0;\n        return helper(nums, idx + 1, curr + nums[idx], target) +\n               helper(nums, idx + 1, curr - nums[idx], target);\n    }\n}",
          "python": "class Solution:\n    def findTargetSumWaysBrute(self, nums: list[int], target: int) -> int:\n        def h(idx, cur):\n            if idx == len(nums): return 1 if cur == target else 0\n            return h(idx + 1, cur + nums[idx]) + h(idx + 1, cur - nums[idx])\n        return h(0, 0)",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int helper(const std::vector<int>& nums, int idx, int curr, int target) {\n        if (idx == (int)nums.size()) return curr == target ? 1 : 0;\n        return helper(nums, idx + 1, curr + nums[idx], target) +\n               helper(nums, idx + 1, curr - nums[idx], target);\n    }\n    int findTargetSumWaysBrute(std::vector<int>& nums, int target) {\n        return helper(nums, 0, 0, target);\n    }\n};",
          "javascript": "function findTargetSumWaysBrute(nums, target) {\n    function h(idx, cur) {\n        if (idx === nums.length) return cur === target ? 1 : 0;\n        return h(idx + 1, cur + nums[idx]) + h(idx + 1, cur - nums[idx]);\n    }\n    return h(0, 0);\n}"
        }
      },
      "better": {
        "name": "Better (Memoized DFS / 2D DP Table)",
        "tier": "better",
        "badge": "\ud83e\udd48 Better",
        "intuition": [
          "Store previously computed subproblem states in a lookup table or matrix.",
          "If a state is already visited, return the stored value immediately in O(1) time."
        ],
        "timeComplexity": "O(N * S)",
        "spaceComplexity": "O(N * S)",
        "complexityExplanation": "Memoization evaluates each state at most once, reducing time to O(N * S).",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int findTargetSumWaysBetter(int[] nums, int target) {\n        return dfsMemo(nums, 0, 0, target, new HashMap<>());\n    }\n    private int dfsMemo(int[] nums, int idx, int curr, int target, Map<String, Integer> memo) {\n        if (idx == nums.length) return curr == target ? 1 : 0;\n        String key = idx + \",\" + curr;\n        if (memo.containsKey(key)) return memo.get(key);\n        int ways = dfsMemo(nums, idx + 1, curr + nums[idx], target, memo) +\n                   dfsMemo(nums, idx + 1, curr - nums[idx], target, memo);\n        memo.put(key, ways);\n        return ways;\n    }\n}",
          "python": "class Solution:\n    def findTargetSumWaysBetter(self, nums: list[int], target: int) -> int:\n        memo = {}\n        def dfs(i, cur):\n            if i == len(nums): return 1 if cur == target else 0\n            if (i, cur) in memo: return memo[(i, cur)]\n            ways = dfs(i + 1, cur + nums[i]) + dfs(i + 1, cur - nums[i])\n            memo[(i, cur)] = ways\n            return ways\n        return dfs(0, 0)",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    #include <unordered_map>\n    int dfsMemo(const std::vector<int>& nums, int idx, int curr, int target, std::unordered_map<long long, int>& memo) {\n        if (idx == (int)nums.size()) return curr == target ? 1 : 0;\n        long long key = ((long long)idx << 32) | (unsigned int)(curr + 2000);\n        if (memo.count(key)) return memo[key];\n        int ways = dfsMemo(nums, idx + 1, curr + nums[idx], target, memo) +\n                   dfsMemo(nums, idx + 1, curr - nums[idx], target, memo);\n        return memo[key] = ways;\n    }\n    int findTargetSumWaysBetter(std::vector<int>& nums, int target) {\n        std::unordered_map<long long, int> memo;\n        return dfsMemo(nums, 0, 0, target, memo);\n    }\n};",
          "javascript": "function findTargetSumWaysBetter(nums, target) {\n    const memo = new Map();\n    function dfs(i, cur) {\n        if (i === nums.length) return cur === target ? 1 : 0;\n        const key = i + ',' + cur;\n        if (memo.has(key)) return memo.get(key);\n        const ways = dfs(i + 1, cur + nums[i]) + dfs(i + 1, cur - nums[i]);\n        memo.set(key, ways);\n        return ways;\n    }\n    return dfs(0, 0);\n}"
        }
      },
      "optimal": {
        "name": "Optimal (Subset Sum Transformation)",
        "tier": "optimal",
        "badge": "\ud83e\udd47 Optimal",
        "intuition": [
          "Assigning +/- to each number splits nums into two subsets P (positive) and N (negative).",
          "sum(P) - sum(N) = target and sum(P) + sum(N) = totalSum.",
          "Adding gives 2 * sum(P) = target + totalSum => sum(P) = (target + totalSum) / 2.",
          "Reduces to counting subsets with sum equal to s = (target + totalSum) / 2."
        ],
        "pseudocode": [
          "FUNCTION findTargetSumWays(nums, target):",
          "  total = SUM(nums)",
          "  IF (total + target) < 0 OR (total + target) % 2 != 0: RETURN 0",
          "  s = (total + target) / 2",
          "  dp = Array(s + 1, 0); dp[0] = 1",
          "  FOR x IN nums:",
          "    FOR w from s DOWNTO x: dp[w] += dp[w - x]",
          "  RETURN dp[s]"
        ],
        "timeComplexity": "O(N * S)",
        "spaceComplexity": "O(S)",
        "complexityExplanation": "Optimal Subset Sum Transformation achieves O(N * S) time with O(S) auxiliary space.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int findTargetSumWays(int[] nums, int target) {\n        int sum = 0;\n        for (int x : nums) sum += x;\n        if (Math.abs(target) > sum || (sum + target) % 2 != 0) return 0;\n        int s = (sum + target) / 2;\n        int[] dp = new int[s + 1];\n        dp[0] = 1;\n        for (int x : nums) {\n            for (int w = s; w >= x; w--) {\n                dp[w] += dp[w - x];\n            }\n        }\n        return dp[s];\n    }\n}",
          "python": "class Solution:\n    def findTargetSumWays(self, nums: list[int], target: int) -> int:\n        total = sum(nums)\n        if abs(target) > total or (total + target) % 2 != 0: return 0\n        s = (total + target) // 2\n        dp = [0] * (s + 1)\n        dp[0] = 1\n        for x in nums:\n            for w in range(s, x - 1, -1):\n                dp[w] += dp[w - x]\n        return dp[s]",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int findTargetSumWays(std::vector<int>& nums, int target) {\n        int sum = 0;\n        for (int x : nums) sum += x;\n        if (std::abs(target) > sum || (sum + target) % 2 != 0) return 0;\n        int s = (sum + target) / 2;\n        std::vector<int> dp(s + 1, 0);\n        dp[0] = 1;\n        for (int x : nums) {\n            for (int w = s; w >= x; --w) {\n                dp[w] += dp[w - x];\n            }\n        }\n        return dp[s];\n    }\n};",
          "javascript": "function findTargetSumWays(nums, target) {\n    const sum = nums.reduce((a, b) => a + b, 0);\n    if (Math.abs(target) > sum || (sum + target) % 2 !== 0) return 0;\n    const s = (sum + target) / 2;\n    const dp = new Array(s + 1).fill(0);\n    dp[0] = 1;\n    for (const x of nums) {\n        for (let w = s; w >= x; w--) {\n            dp[w] += dp[w - x];\n        }\n    }\n    return dp[s];\n}"
        }
      }
    }
  },
  "coin_change_ii": {
    "questionId": "archetype-coin_change_ii",
    "pattern": "Unbounded Knapsack Combinations",
    "intuition": [
      "Count combinations (not permutations) to make up given amount.",
      "Outer loop over coins ensures coins are considered in fixed order, avoiding permutation duplicates.",
      "Transition: dp[w] += dp[w - coin] for w from coin to amount."
    ],
    "pseudocode": [
      "FUNCTION change(amount, coins):",
      "  dp = Array(amount + 1, 0); dp[0] = 1",
      "  FOR coin IN coins:",
      "    FOR w from coin TO amount: dp[w] += dp[w - coin]",
      "  RETURN dp[amount]"
    ],
    "timeComplexity": "O(N * Amount)",
    "spaceComplexity": "O(Amount)",
    "complexityExplanation": "Optimal Unbounded Knapsack Combinations achieves O(N * Amount) time with O(Amount) space.",
    "edgeCases": [
      "Amount = 0 (returns 1)",
      "No combination possible (returns 0)"
    ],
    "code": {
      "java": "import java.util.*;\n\npublic class Solution {\n    public int change(int amount, int[] coins) {\n        int[] dp = new int[amount + 1];\n        dp[0] = 1;\n        for (int coin : coins) {\n            for (int w = coin; w <= amount; w++) {\n                dp[w] += dp[w - coin];\n            }\n        }\n        return dp[amount];\n    }\n}",
      "python": "class Solution:\n    def change(self, amount: int, coins: list[int]) -> int:\n        dp = [0] * (amount + 1)\n        dp[0] = 1\n        for coin in coins:\n            for w in range(coin, amount + 1):\n                dp[w] += dp[w - coin]\n        return dp[amount]",
      "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int change(int amount, std::vector<int>& coins) {\n        std::vector<int> dp(amount + 1, 0);\n        dp[0] = 1;\n        for (int coin : coins) {\n            for (int w = coin; w <= amount; ++w) {\n                dp[w] += dp[w - coin];\n            }\n        }\n        return dp[amount];\n    }\n};",
      "javascript": "function change(amount, coins) {\n    const dp = new Array(amount + 1).fill(0);\n    dp[0] = 1;\n    for (const coin of coins) {\n        for (let w = coin; w <= amount; w++) {\n            dp[w] += dp[w - coin];\n        }\n    }\n    return dp[amount];\n}"
    },
    "interviewProTips": [
      "Start with the state transition recurrence for Coin Change II (Total Ways) before writing space-optimized code.",
      "Verify base cases for empty or single element inputs to prevent out-of-bounds access."
    ],
    "approaches": {
      "brute": {
        "name": "Brute Force (Pure Recursion)",
        "tier": "brute",
        "badge": "\ud83e\udd49 Brute Force",
        "intuition": [
          "Formulate problem as recursive exploration of all choice branches without memoization.",
          "Re-evaluates identical subproblem states repeatedly, leading to exponential time complexity."
        ],
        "timeComplexity": "O(2^Amount)",
        "spaceComplexity": "O(Amount)",
        "complexityExplanation": "Exhaustive recursion tree branches into O(2^Amount) operations.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int changeBrute(int amount, int[] coins) {\n        return helper(coins, 0, amount);\n    }\n    private int helper(int[] coins, int idx, int rem) {\n        if (rem == 0) return 1;\n        if (idx >= coins.length || rem < 0) return 0;\n        int take = helper(coins, idx, rem - coins[idx]);\n        int skip = helper(coins, idx + 1, rem);\n        return take + skip;\n    }\n}",
          "python": "class Solution:\n    def changeBrute(self, amount: int, coins: list[int]) -> int:\n        def h(idx, rem):\n            if rem == 0: return 1\n            if idx >= len(coins) or rem < 0: return 0\n            return h(idx, rem - coins[idx]) + h(idx + 1, rem)\n        return h(0, amount)",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int helper(const std::vector<int>& coins, int idx, int rem) {\n        if (rem == 0) return 1;\n        if (idx >= (int)coins.size() || rem < 0) return 0;\n        return helper(coins, idx, rem - coins[idx]) + helper(coins, idx + 1, rem);\n    }\n    int changeBrute(int amount, std::vector<int>& coins) {\n        return helper(coins, 0, amount);\n    }\n};",
          "javascript": "function changeBrute(amount, coins) {\n    function h(idx, rem) {\n        if (rem === 0) return 1;\n        if (idx >= coins.length || rem < 0) return 0;\n        return h(idx, rem - coins[idx]) + h(idx + 1, rem);\n    }\n    return h(0, amount);\n}"
        }
      },
      "better": {
        "name": "Better (Memoized DFS / 2D DP Table)",
        "tier": "better",
        "badge": "\ud83e\udd48 Better",
        "intuition": [
          "Store previously computed subproblem states in a lookup table or matrix.",
          "If a state is already visited, return the stored value immediately in O(1) time."
        ],
        "timeComplexity": "O(N * Amount)",
        "spaceComplexity": "O(N * Amount)",
        "complexityExplanation": "Memoization evaluates each state at most once, reducing time to O(N * Amount).",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int changeBetter(int amount, int[] coins) {\n        int n = coins.length;\n        int[][] dp = new int[n + 1][amount + 1];\n        for (int i = 0; i <= n; i++) dp[i][0] = 1;\n        for (int i = 1; i <= n; i++) {\n            for (int w = 1; w <= amount; w++) {\n                dp[i][w] = dp[i - 1][w] + (coins[i - 1] <= w ? dp[i][w - coins[i - 1]] : 0);\n            }\n        }\n        return dp[n][amount];\n    }\n}",
          "python": "class Solution:\n    def changeBetter(self, amount: int, coins: list[int]) -> int:\n        n = len(coins)\n        dp = [[0] * (amount + 1) for _ in range(n + 1)]\n        for i in range(n + 1): dp[i][0] = 1\n        for i in range(1, n + 1):\n            for w in range(1, amount + 1):\n                dp[i][w] = dp[i - 1][w] + (dp[i][w - coins[i - 1]] if coins[i - 1] <= w else 0)\n        return dp[n][amount]",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int changeBetter(int amount, std::vector<int>& coins) {\n        int n = coins.size();\n        std::vector<std::vector<int>> dp(n + 1, std::vector<int>(amount + 1, 0));\n        for (int i = 0; i <= n; ++i) dp[i][0] = 1;\n        for (int i = 1; i <= n; ++i) {\n            for (int w = 1; w <= amount; ++w) {\n                dp[i][w] = dp[i - 1][w] + (coins[i - 1] <= w ? dp[i][w - coins[i - 1]] : 0);\n            }\n        }\n        return dp[n][amount];\n    }\n};",
          "javascript": "function changeBetter(amount, coins) {\n    const n = coins.length;\n    const dp = Array.from({ length: n + 1 }, () => new Array(amount + 1).fill(0));\n    for (let i = 0; i <= n; i++) dp[i][0] = 1;\n    for (let i = 1; i <= n; i++) {\n        for (let w = 1; w <= amount; w++) {\n            dp[i][w] = dp[i - 1][w] + (coins[i - 1] <= w ? dp[i][w - coins[i - 1]] : 0);\n        }\n    }\n    return dp[n][amount];\n}"
        }
      },
      "optimal": {
        "name": "Optimal (Unbounded Knapsack Combinations)",
        "tier": "optimal",
        "badge": "\ud83e\udd47 Optimal",
        "intuition": [
          "Count combinations (not permutations) to make up given amount.",
          "Outer loop over coins ensures coins are considered in fixed order, avoiding permutation duplicates.",
          "Transition: dp[w] += dp[w - coin] for w from coin to amount."
        ],
        "pseudocode": [
          "FUNCTION change(amount, coins):",
          "  dp = Array(amount + 1, 0); dp[0] = 1",
          "  FOR coin IN coins:",
          "    FOR w from coin TO amount: dp[w] += dp[w - coin]",
          "  RETURN dp[amount]"
        ],
        "timeComplexity": "O(N * Amount)",
        "spaceComplexity": "O(Amount)",
        "complexityExplanation": "Optimal Unbounded Knapsack Combinations achieves O(N * Amount) time with O(Amount) auxiliary space.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int change(int amount, int[] coins) {\n        int[] dp = new int[amount + 1];\n        dp[0] = 1;\n        for (int coin : coins) {\n            for (int w = coin; w <= amount; w++) {\n                dp[w] += dp[w - coin];\n            }\n        }\n        return dp[amount];\n    }\n}",
          "python": "class Solution:\n    def change(self, amount: int, coins: list[int]) -> int:\n        dp = [0] * (amount + 1)\n        dp[0] = 1\n        for coin in coins:\n            for w in range(coin, amount + 1):\n                dp[w] += dp[w - coin]\n        return dp[amount]",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int change(int amount, std::vector<int>& coins) {\n        std::vector<int> dp(amount + 1, 0);\n        dp[0] = 1;\n        for (int coin : coins) {\n            for (int w = coin; w <= amount; ++w) {\n                dp[w] += dp[w - coin];\n            }\n        }\n        return dp[amount];\n    }\n};",
          "javascript": "function change(amount, coins) {\n    const dp = new Array(amount + 1).fill(0);\n    dp[0] = 1;\n    for (const coin of coins) {\n        for (let w = coin; w <= amount; w++) {\n            dp[w] += dp[w - coin];\n        }\n    }\n    return dp[amount];\n}"
        }
      }
    }
  },
  "rod_cutting": {
    "questionId": "archetype-rod_cutting",
    "pattern": "1D Unbounded Knapsack Tabulation",
    "intuition": [
      "Given a rod of length n and an array of prices for lengths 1 to n, find maximum obtainable value.",
      "Let dp[i] be the maximum value obtained from a rod of length i.",
      "For each length i from 1 to n, try every cut j from 1 to i: dp[i] = max(dp[i], price[j-1] + dp[i-j])."
    ],
    "pseudocode": [
      "FUNCTION cutRod(price, n):",
      "  dp = Array(n + 1, 0)",
      "  FOR i from 1 TO n:",
      "    FOR j from 1 TO i:",
      "      dp[i] = MAX(dp[i], price[j-1] + dp[i-j])",
      "  RETURN dp[n]"
    ],
    "timeComplexity": "O(N\u00b2)",
    "spaceComplexity": "O(N)",
    "complexityExplanation": "Optimal 1D Unbounded Knapsack Tabulation achieves O(N\u00b2) time with O(N) space.",
    "edgeCases": [
      "Length n = 0",
      "All prices zero",
      "No cut offers profit over whole rod"
    ],
    "code": {
      "java": "import java.util.*;\n\npublic class Solution {\n    public int cutRod(int[] price, int n) {\n        int[] dp = new int[n + 1];\n        for (int i = 1; i <= n; i++) {\n            for (int j = 1; j <= i; j++) {\n                dp[i] = Math.max(dp[i], price[j - 1] + dp[i - j]);\n            }\n        }\n        return dp[n];\n    }\n}",
      "python": "class Solution:\n    def cutRod(self, price: list[int], n: int) -> int:\n        dp = [0] * (n + 1)\n        for i in range(1, n + 1):\n            for j in range(1, i + 1):\n                dp[i] = max(dp[i], price[j - 1] + dp[i - j])\n        return dp[n]",
      "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int cutRod(std::vector<int>& price, int n) {\n        std::vector<int> dp(n + 1, 0);\n        for (int i = 1; i <= n; ++i) {\n            for (int j = 1; j <= i; ++j) {\n                dp[i] = std::max(dp[i], price[j - 1] + dp[i - j]);\n            }\n        }\n        return dp[n];\n    }\n};",
      "javascript": "function cutRod(price, n) {\n    const dp = new Array(n + 1).fill(0);\n    for (let i = 1; i <= n; i++) {\n        for (let j = 1; j <= i; j++) {\n            dp[i] = Math.max(dp[i], price[j - 1] + dp[i - j]);\n        }\n    }\n    return dp[n];\n}"
    },
    "interviewProTips": [
      "Start with the state transition recurrence for Rod Cutting Problem before writing space-optimized code.",
      "Verify base cases for empty or single element inputs to prevent out-of-bounds access."
    ],
    "approaches": {
      "brute": {
        "name": "Brute Force (Pure Recursion)",
        "tier": "brute",
        "badge": "\ud83e\udd49 Brute Force",
        "intuition": [
          "Formulate problem as recursive exploration of all choice branches without memoization.",
          "Re-evaluates identical subproblem states repeatedly, leading to exponential time complexity."
        ],
        "timeComplexity": "O(2\u207f)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Exhaustive recursion tree branches into O(2\u207f) operations.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int cutRodBrute(int[] price, int n) {\n        if (n <= 0) return 0;\n        int maxVal = Integer.MIN_VALUE;\n        for (int i = 1; i <= n; i++) {\n            maxVal = Math.max(maxVal, price[i - 1] + cutRodBrute(price, n - i));\n        }\n        return maxVal;\n    }\n}",
          "python": "class Solution:\n    def cutRodBrute(self, price: list[int], n: int) -> int:\n        if n <= 0: return 0\n        res = 0\n        for i in range(1, n + 1):\n            res = max(res, price[i - 1] + self.cutRodBrute(price, n - i))\n        return res",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int cutRodBrute(std::vector<int>& price, int n) {\n        if (n <= 0) return 0;\n        int maxVal = 0;\n        for (int i = 1; i <= n; ++i) {\n            maxVal = std::max(maxVal, price[i - 1] + cutRodBrute(price, n - i));\n        }\n        return maxVal;\n    }\n};",
          "javascript": "function cutRodBrute(price, n) {\n    if (n <= 0) return 0;\n    let maxVal = 0;\n    for (let i = 1; i <= n; i++) {\n        maxVal = Math.max(maxVal, price[i - 1] + cutRodBrute(price, n - i));\n    }\n    return maxVal;\n}"
        }
      },
      "better": {
        "name": "Better (Memoized DFS / 2D DP Table)",
        "tier": "better",
        "badge": "\ud83e\udd48 Better",
        "intuition": [
          "Store previously computed subproblem states in a lookup table or matrix.",
          "If a state is already visited, return the stored value immediately in O(1) time."
        ],
        "timeComplexity": "O(N\u00b2)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Memoization evaluates each state at most once, reducing time to O(N\u00b2).",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int cutRodBetter(int[] price, int n) {\n        int[] memo = new int[n + 1];\n        Arrays.fill(memo, -1);\n        return solve(price, n, memo);\n    }\n    private int solve(int[] price, int n, int[] memo) {\n        if (n <= 0) return 0;\n        if (memo[n] != -1) return memo[n];\n        int maxVal = Integer.MIN_VALUE;\n        for (int i = 1; i <= n; i++) {\n            maxVal = Math.max(maxVal, price[i - 1] + solve(price, n - i, memo));\n        }\n        return memo[n] = maxVal;\n    }\n}",
          "python": "class Solution:\n    def cutRodBetter(self, price: list[int], n: int) -> int:\n        memo = {}\n        def solve(rem):\n            if rem <= 0: return 0\n            if rem in memo: return memo[rem]\n            res = 0\n            for i in range(1, rem + 1):\n                res = max(res, price[i - 1] + solve(rem - i))\n            memo[rem] = res\n            return res\n        return solve(n)",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int solve(const std::vector<int>& price, int n, std::vector<int>& memo) {\n        if (n <= 0) return 0;\n        if (memo[n] != -1) return memo[n];\n        int maxVal = 0;\n        for (int i = 1; i <= n; ++i) {\n            maxVal = std::max(maxVal, price[i - 1] + solve(price, n - i, memo));\n        }\n        return memo[n] = maxVal;\n    }\n    int cutRodBetter(std::vector<int>& price, int n) {\n        std::vector<int> memo(n + 1, -1);\n        return solve(price, n, memo);\n    }\n};",
          "javascript": "function cutRodBetter(price, n) {\n    const memo = new Array(n + 1).fill(-1);\n    function solve(rem) {\n        if (rem <= 0) return 0;\n        if (memo[rem] !== -1) return memo[rem];\n        let maxVal = 0;\n        for (let i = 1; i <= rem; i++) {\n            maxVal = Math.max(maxVal, price[i - 1] + solve(rem - i));\n        }\n        return memo[rem] = maxVal;\n    }\n    return solve(n);\n}"
        }
      },
      "optimal": {
        "name": "Optimal (1D Unbounded Knapsack Tabulation)",
        "tier": "optimal",
        "badge": "\ud83e\udd47 Optimal",
        "intuition": [
          "Given a rod of length n and an array of prices for lengths 1 to n, find maximum obtainable value.",
          "Let dp[i] be the maximum value obtained from a rod of length i.",
          "For each length i from 1 to n, try every cut j from 1 to i: dp[i] = max(dp[i], price[j-1] + dp[i-j])."
        ],
        "pseudocode": [
          "FUNCTION cutRod(price, n):",
          "  dp = Array(n + 1, 0)",
          "  FOR i from 1 TO n:",
          "    FOR j from 1 TO i:",
          "      dp[i] = MAX(dp[i], price[j-1] + dp[i-j])",
          "  RETURN dp[n]"
        ],
        "timeComplexity": "O(N\u00b2)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Optimal 1D Unbounded Knapsack Tabulation achieves O(N\u00b2) time with O(N) auxiliary space.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int cutRod(int[] price, int n) {\n        int[] dp = new int[n + 1];\n        for (int i = 1; i <= n; i++) {\n            for (int j = 1; j <= i; j++) {\n                dp[i] = Math.max(dp[i], price[j - 1] + dp[i - j]);\n            }\n        }\n        return dp[n];\n    }\n}",
          "python": "class Solution:\n    def cutRod(self, price: list[int], n: int) -> int:\n        dp = [0] * (n + 1)\n        for i in range(1, n + 1):\n            for j in range(1, i + 1):\n                dp[i] = max(dp[i], price[j - 1] + dp[i - j])\n        return dp[n]",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int cutRod(std::vector<int>& price, int n) {\n        std::vector<int> dp(n + 1, 0);\n        for (int i = 1; i <= n; ++i) {\n            for (int j = 1; j <= i; ++j) {\n                dp[i] = std::max(dp[i], price[j - 1] + dp[i - j]);\n            }\n        }\n        return dp[n];\n    }\n};",
          "javascript": "function cutRod(price, n) {\n    const dp = new Array(n + 1).fill(0);\n    for (let i = 1; i <= n; i++) {\n        for (let j = 1; j <= i; j++) {\n            dp[i] = Math.max(dp[i], price[j - 1] + dp[i - j]);\n        }\n    }\n    return dp[n];\n}"
        }
      }
    }
  },
  "unbounded_knapsack": {
    "questionId": "archetype-unbounded_knapsack",
    "pattern": "1D Forward Iteration Knapsack",
    "intuition": [
      "Items can be picked multiple times without restriction.",
      "Forward iteration on capacity w from wt[i] to W allows the same item to be reused.",
      "Transition: dp[c] = max(dp[c], val[i] + dp[c - wt[i]])."
    ],
    "pseudocode": [
      "FUNCTION knapSackUnbounded(n, w, val, wt):",
      "  dp = Array(w + 1, 0)",
      "  FOR i from 0 TO n - 1:",
      "    FOR c from wt[i] TO w:",
      "      dp[c] = MAX(dp[c], val[i] + dp[c - wt[i]])",
      "  RETURN dp[w]"
    ],
    "timeComplexity": "O(N * W)",
    "spaceComplexity": "O(W)",
    "complexityExplanation": "Optimal 1D Forward Iteration Knapsack achieves O(N * W) time with O(W) space.",
    "edgeCases": [
      "Capacity w = 0",
      "All item weights exceed w"
    ],
    "code": {
      "java": "import java.util.*;\n\npublic class Solution {\n    public int knapSackUnbounded(int n, int w, int[] val, int[] wt) {\n        int[] dp = new int[w + 1];\n        for (int i = 0; i < n; i++) {\n            for (int c = wt[i]; c <= w; c++) {\n                dp[c] = Math.max(dp[c], val[i] + dp[c - wt[i]]);\n            }\n        }\n        return dp[w];\n    }\n}",
      "python": "class Solution:\n    def knapSackUnbounded(self, n: int, w: int, val: list[int], wt: list[int]) -> int:\n        dp = [0] * (w + 1)\n        for i in range(n):\n            for c in range(wt[i], w + 1):\n                dp[c] = max(dp[c], val[i] + dp[c - wt[i]])\n        return dp[w]",
      "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int knapSackUnbounded(int n, int w, std::vector<int>& val, std::vector<int>& wt) {\n        std::vector<int> dp(w + 1, 0);\n        for (int i = 0; i < n; ++i) {\n            for (int c = wt[i]; c <= w; ++c) {\n                dp[c] = std::max(dp[c], val[i] + dp[c - wt[i]]);\n            }\n        }\n        return dp[w];\n    }\n};",
      "javascript": "function knapSackUnbounded(n, w, val, wt) {\n    const dp = new Array(w + 1).fill(0);\n    for (let i = 0; i < n; i++) {\n        for (let c = wt[i]; c <= w; c++) {\n            dp[c] = Math.max(dp[c], val[i] + dp[c - wt[i]]);\n        }\n    }\n    return dp[w];\n}"
    },
    "interviewProTips": [
      "Start with the state transition recurrence for Unbounded Knapsack before writing space-optimized code.",
      "Verify base cases for empty or single element inputs to prevent out-of-bounds access."
    ],
    "approaches": {
      "brute": {
        "name": "Brute Force (Pure Recursion)",
        "tier": "brute",
        "badge": "\ud83e\udd49 Brute Force",
        "intuition": [
          "Formulate problem as recursive exploration of all choice branches without memoization.",
          "Re-evaluates identical subproblem states repeatedly, leading to exponential time complexity."
        ],
        "timeComplexity": "O(2^W)",
        "spaceComplexity": "O(W)",
        "complexityExplanation": "Exhaustive recursion tree branches into O(2^W) operations.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int knapSackUnboundedBrute(int n, int w, int[] val, int[] wt) {\n        return helper(w, val, wt, n - 1);\n    }\n    private int helper(int remW, int[] val, int[] wt, int idx) {\n        if (idx < 0 || remW <= 0) return 0;\n        int notTake = helper(remW, val, wt, idx - 1);\n        int take = 0;\n        if (wt[idx] <= remW) take = val[idx] + helper(remW - wt[idx], val, wt, idx);\n        return Math.max(take, notTake);\n    }\n}",
          "python": "class Solution:\n    def knapSackUnboundedBrute(self, n: int, w: int, val: list[int], wt: list[int]) -> int:\n        def h(rem, i):\n            if i < 0 or rem <= 0: return 0\n            not_take = h(rem, i - 1)\n            take = val[i] + h(rem - wt[i], i) if wt[i] <= rem else 0\n            return max(take, not_take)\n        return h(w, n - 1)",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int helper(int remW, const std::vector<int>& val, const std::vector<int>& wt, int idx) {\n        if (idx < 0 || remW <= 0) return 0;\n        int notTake = helper(remW, val, wt, idx - 1);\n        int take = (wt[idx] <= remW) ? val[idx] + helper(remW - wt[idx], val, wt, idx) : 0;\n        return std::max(take, notTake);\n    }\n    int knapSackUnboundedBrute(int n, int w, std::vector<int>& val, std::vector<int>& wt) {\n        return helper(w, val, wt, n - 1);\n    }\n};",
          "javascript": "function knapSackUnboundedBrute(n, w, val, wt) {\n    function h(rem, i) {\n        if (i < 0 || rem <= 0) return 0;\n        const notTake = h(rem, i - 1);\n        const take = wt[i] <= rem ? val[i] + h(rem - wt[i], i) : 0;\n        return Math.max(take, notTake);\n    }\n    return h(w, n - 1);\n}"
        }
      },
      "better": {
        "name": "Better (Memoized DFS / 2D DP Table)",
        "tier": "better",
        "badge": "\ud83e\udd48 Better",
        "intuition": [
          "Store previously computed subproblem states in a lookup table or matrix.",
          "If a state is already visited, return the stored value immediately in O(1) time."
        ],
        "timeComplexity": "O(N * W)",
        "spaceComplexity": "O(N * W)",
        "complexityExplanation": "Memoization evaluates each state at most once, reducing time to O(N * W).",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int knapSackUnboundedBetter(int n, int w, int[] val, int[] wt) {\n        int[][] dp = new int[n + 1][w + 1];\n        for (int i = 1; i <= n; i++) {\n            for (int c = 0; c <= w; c++) {\n                if (wt[i - 1] <= c) {\n                    dp[i][c] = Math.max(dp[i - 1][c], val[i - 1] + dp[i][c - wt[i - 1]]);\n                } else {\n                    dp[i][c] = dp[i - 1][c];\n                }\n            }\n        }\n        return dp[n][w];\n    }\n}",
          "python": "class Solution:\n    def knapSackUnboundedBetter(self, n: int, w: int, val: list[int], wt: list[int]) -> int:\n        dp = [[0] * (w + 1) for _ in range(n + 1)]\n        for i in range(1, n + 1):\n            for c in range(w + 1):\n                if wt[i - 1] <= c:\n                    dp[i][c] = max(dp[i - 1][c], val[i - 1] + dp[i][c - wt[i - 1]])\n                else:\n                    dp[i][c] = dp[i - 1][c]\n        return dp[n][w]",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int knapSackUnboundedBetter(int n, int w, std::vector<int>& val, std::vector<int>& wt) {\n        std::vector<std::vector<int>> dp(n + 1, std::vector<int>(w + 1, 0));\n        for (int i = 1; i <= n; ++i) {\n            for (int c = 0; c <= w; ++c) {\n                if (wt[i - 1] <= c) dp[i][c] = std::max(dp[i - 1][c], val[i - 1] + dp[i][c - wt[i - 1]]);\n                else dp[i][c] = dp[i - 1][c];\n            }\n        }\n        return dp[n][w];\n    }\n};",
          "javascript": "function knapSackUnboundedBetter(n, w, val, wt) {\n    const dp = Array.from({ length: n + 1 }, () => new Array(w + 1).fill(0));\n    for (let i = 1; i <= n; i++) {\n        for (let c = 0; c <= w; c++) {\n            if (wt[i - 1] <= c) dp[i][c] = Math.max(dp[i - 1][c], val[i - 1] + dp[i][c - wt[i - 1]]);\n            else dp[i][c] = dp[i - 1][c];\n        }\n    }\n    return dp[n][w];\n}"
        }
      },
      "optimal": {
        "name": "Optimal (1D Forward Iteration Knapsack)",
        "tier": "optimal",
        "badge": "\ud83e\udd47 Optimal",
        "intuition": [
          "Items can be picked multiple times without restriction.",
          "Forward iteration on capacity w from wt[i] to W allows the same item to be reused.",
          "Transition: dp[c] = max(dp[c], val[i] + dp[c - wt[i]])."
        ],
        "pseudocode": [
          "FUNCTION knapSackUnbounded(n, w, val, wt):",
          "  dp = Array(w + 1, 0)",
          "  FOR i from 0 TO n - 1:",
          "    FOR c from wt[i] TO w:",
          "      dp[c] = MAX(dp[c], val[i] + dp[c - wt[i]])",
          "  RETURN dp[w]"
        ],
        "timeComplexity": "O(N * W)",
        "spaceComplexity": "O(W)",
        "complexityExplanation": "Optimal 1D Forward Iteration Knapsack achieves O(N * W) time with O(W) auxiliary space.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int knapSackUnbounded(int n, int w, int[] val, int[] wt) {\n        int[] dp = new int[w + 1];\n        for (int i = 0; i < n; i++) {\n            for (int c = wt[i]; c <= w; c++) {\n                dp[c] = Math.max(dp[c], val[i] + dp[c - wt[i]]);\n            }\n        }\n        return dp[w];\n    }\n}",
          "python": "class Solution:\n    def knapSackUnbounded(self, n: int, w: int, val: list[int], wt: list[int]) -> int:\n        dp = [0] * (w + 1)\n        for i in range(n):\n            for c in range(wt[i], w + 1):\n                dp[c] = max(dp[c], val[i] + dp[c - wt[i]])\n        return dp[w]",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int knapSackUnbounded(int n, int w, std::vector<int>& val, std::vector<int>& wt) {\n        std::vector<int> dp(w + 1, 0);\n        for (int i = 0; i < n; ++i) {\n            for (int c = wt[i]; c <= w; ++c) {\n                dp[c] = std::max(dp[c], val[i] + dp[c - wt[i]]);\n            }\n        }\n        return dp[w];\n    }\n};",
          "javascript": "function knapSackUnbounded(n, w, val, wt) {\n    const dp = new Array(w + 1).fill(0);\n    for (let i = 0; i < n; i++) {\n        for (let c = wt[i]; c <= w; c++) {\n            dp[c] = Math.max(dp[c], val[i] + dp[c - wt[i]]);\n        }\n    }\n    return dp[w];\n}"
        }
      }
    }
  },
  "house_robber_ii": {
    "questionId": "archetype-house_robber_ii",
    "pattern": "Two-Pass Linear House Robber Decomposition",
    "intuition": [
      "Houses are in a circle, so the first and last house cannot both be robbed.",
      "Decompose into two independent linear subproblems:",
      "Case 1: Rob houses 0 to n-2 (exclude last house).",
      "Case 2: Rob houses 1 to n-1 (exclude first house).",
      "The answer is max(Case 1, Case 2) computed in O(1) space."
    ],
    "pseudocode": [
      "FUNCTION rob(nums):",
      "  IF nums.length == 1: RETURN nums[0]",
      "  RETURN MAX(robRange(nums, 0, n - 2), robRange(nums, 1, n - 1))"
    ],
    "timeComplexity": "O(N)",
    "spaceComplexity": "O(1)",
    "complexityExplanation": "Optimal Two-Pass Linear House Robber Decomposition achieves O(N) time with O(1) space.",
    "edgeCases": [
      "Single house",
      "Two houses",
      "Three houses"
    ],
    "code": {
      "java": "import java.util.*;\n\npublic class Solution {\n    public int rob(int[] nums) {\n        if (nums == null || nums.length == 0) return 0;\n        if (nums.length == 1) return nums[0];\n        return Math.max(robRange(nums, 0, nums.length - 2), robRange(nums, 1, nums.length - 1));\n    }\n    private int robRange(int[] nums, int start, int end) {\n        int prev1 = 0, prev2 = 0;\n        for (int i = start; i <= end; i++) {\n            int temp = Math.max(prev1, prev2 + nums[i]);\n            prev2 = prev1;\n            prev1 = temp;\n        }\n        return prev1;\n    }\n}",
      "python": "class Solution:\n    def rob(self, nums: list[int]) -> int:\n        if not nums: return 0\n        if len(nums) == 1: return nums[0]\n        def rob_range(start, end):\n            p1, p2 = 0, 0\n            for i in range(start, end + 1):\n                p1, p2 = max(p1, p2 + nums[i]), p1\n            return p1\n        return max(rob_range(0, len(nums) - 2), rob_range(1, len(nums) - 1))",
      "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int robRange(const std::vector<int>& nums, int start, int end) {\n        int prev1 = 0, prev2 = 0;\n        for (int i = start; i <= end; ++i) {\n            int temp = std::max(prev1, prev2 + nums[i]);\n            prev2 = prev1;\n            prev1 = temp;\n        }\n        return prev1;\n    }\n    int rob(std::vector<int>& nums) {\n        if (nums.empty()) return 0;\n        if (nums.size() == 1) return nums[0];\n        return std::max(robRange(nums, 0, (int)nums.size() - 2), robRange(nums, 1, (int)nums.size() - 1));\n    }\n};",
      "javascript": "function rob(nums) {\n    if (!nums || nums.length === 0) return 0;\n    if (nums.length === 1) return nums[0];\n    function robRange(start, end) {\n        let p1 = 0, p2 = 0;\n        for (let i = start; i <= end; i++) {\n            const temp = Math.max(p1, p2 + nums[i]);\n            p2 = p1;\n            p1 = temp;\n        }\n        return p1;\n    }\n    return Math.max(robRange(0, nums.length - 2), robRange(1, nums.length - 1));\n}"
    },
    "interviewProTips": [
      "Start with the state transition recurrence for House Robber II (Circular Houses) before writing space-optimized code.",
      "Verify base cases for empty or single element inputs to prevent out-of-bounds access."
    ],
    "approaches": {
      "brute": {
        "name": "Brute Force (Pure Recursion)",
        "tier": "brute",
        "badge": "\ud83e\udd49 Brute Force",
        "intuition": [
          "Formulate problem as recursive exploration of all choice branches without memoization.",
          "Re-evaluates identical subproblem states repeatedly, leading to exponential time complexity."
        ],
        "timeComplexity": "O(2\u207f)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Exhaustive recursion tree branches into O(2\u207f) operations.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int robBrute(int[] nums) {\n        if (nums.length == 1) return nums[0];\n        return Math.max(h(nums, 0, nums.length - 2), h(nums, 1, nums.length - 1));\n    }\n    private int h(int[] nums, int idx, int end) {\n        if (idx > end) return 0;\n        return Math.max(nums[idx] + h(nums, idx + 2, end), h(nums, idx + 1, end));\n    }\n}",
          "python": "class Solution:\n    def robBrute(self, nums: list[int]) -> int:\n        if len(nums) == 1: return nums[0]\n        def h(idx, end):\n            if idx > end: return 0\n            return max(nums[idx] + h(idx + 2, end), h(idx + 1, end))\n        return max(h(0, len(nums) - 2), h(1, len(nums) - 1))",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int h(const std::vector<int>& nums, int idx, int end) {\n        if (idx > end) return 0;\n        return std::max(nums[idx] + h(nums, idx + 2, end), h(nums, idx + 1, end));\n    }\n    int robBrute(std::vector<int>& nums) {\n        if (nums.size() == 1) return nums[0];\n        return std::max(h(nums, 0, (int)nums.size() - 2), h(nums, 1, (int)nums.size() - 1));\n    }\n};",
          "javascript": "function robBrute(nums) {\n    if (nums.length === 1) return nums[0];\n    function h(idx, end) {\n        if (idx > end) return 0;\n        return Math.max(nums[idx] + h(idx + 2, end), h(idx + 1, end));\n    }\n    return Math.max(h(0, nums.length - 2), h(1, nums.length - 1));\n}"
        }
      },
      "better": {
        "name": "Better (Memoized DFS / 2D DP Table)",
        "tier": "better",
        "badge": "\ud83e\udd48 Better",
        "intuition": [
          "Store previously computed subproblem states in a lookup table or matrix.",
          "If a state is already visited, return the stored value immediately in O(1) time."
        ],
        "timeComplexity": "O(N)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Memoization evaluates each state at most once, reducing time to O(N).",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int robBetter(int[] nums) {\n        if (nums.length == 1) return nums[0];\n        int n = nums.length;\n        int[] dp1 = new int[n];\n        int[] dp2 = new int[n];\n        dp1[0] = nums[0];\n        if (n > 1) dp1[1] = Math.max(nums[0], nums[1]);\n        for (int i = 2; i < n - 1; i++) dp1[i] = Math.max(dp1[i - 1], dp1[i - 2] + nums[i]);\n        dp2[1] = nums[1];\n        if (n > 2) dp2[2] = Math.max(nums[1], nums[2]);\n        for (int i = 3; i < n; i++) dp2[i] = Math.max(dp2[i - 1], dp2[i - 2] + nums[i]);\n        return Math.max(dp1[n - 2], dp2[n - 1]);\n    }\n}",
          "python": "class Solution:\n    def robBetter(self, nums: list[int]) -> int:\n        if len(nums) == 1: return nums[0]\n        n = len(nums)\n        dp1 = [0] * n\n        dp1[0] = nums[0]\n        if n > 1: dp1[1] = max(nums[0], nums[1])\n        for i in range(2, n - 1): dp1[i] = max(dp1[i - 1], dp1[i - 2] + nums[i])\n        dp2 = [0] * n\n        dp2[1] = nums[1]\n        if n > 2: dp2[2] = max(nums[1], nums[2])\n        for i in range(3, n): dp2[i] = max(dp2[i - 1], dp2[i - 2] + nums[i])\n        return max(dp1[n - 2], dp2[n - 1])",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int robBetter(std::vector<int>& nums) {\n        if (nums.size() == 1) return nums[0];\n        int n = nums.size();\n        std::vector<int> dp1(n, 0), dp2(n, 0);\n        dp1[0] = nums[0];\n        if (n > 1) dp1[1] = std::max(nums[0], nums[1]);\n        for (int i = 2; i < n - 1; ++i) dp1[i] = std::max(dp1[i - 1], dp1[i - 2] + nums[i]);\n        dp2[1] = nums[1];\n        if (n > 2) dp2[2] = std::max(nums[1], nums[2]);\n        for (int i = 3; i < n; ++i) dp2[i] = std::max(dp2[i - 1], dp2[i - 2] + nums[i]);\n        return std::max(dp1[n - 2], dp2[n - 1]);\n    }\n};",
          "javascript": "function robBetter(nums) {\n    if (nums.length === 1) return nums[0];\n    const n = nums.length;\n    const dp1 = new Array(n).fill(0);\n    const dp2 = new Array(n).fill(0);\n    dp1[0] = nums[0];\n    if (n > 1) dp1[1] = Math.max(nums[0], nums[1]);\n    for (let i = 2; i < n - 1; i++) dp1[i] = Math.max(dp1[i - 1], dp1[i - 2] + nums[i]);\n    dp2[1] = nums[1];\n    if (n > 2) dp2[2] = Math.max(nums[1], nums[2]);\n    for (let i = 3; i < n; i++) dp2[i] = Math.max(dp2[i - 1], dp2[i - 2] + nums[i]);\n    return Math.max(dp1[n - 2], dp2[n - 1]);\n}"
        }
      },
      "optimal": {
        "name": "Optimal (Two-Pass Linear House Robber Decomposition)",
        "tier": "optimal",
        "badge": "\ud83e\udd47 Optimal",
        "intuition": [
          "Houses are in a circle, so the first and last house cannot both be robbed.",
          "Decompose into two independent linear subproblems:",
          "Case 1: Rob houses 0 to n-2 (exclude last house).",
          "Case 2: Rob houses 1 to n-1 (exclude first house).",
          "The answer is max(Case 1, Case 2) computed in O(1) space."
        ],
        "pseudocode": [
          "FUNCTION rob(nums):",
          "  IF nums.length == 1: RETURN nums[0]",
          "  RETURN MAX(robRange(nums, 0, n - 2), robRange(nums, 1, n - 1))"
        ],
        "timeComplexity": "O(N)",
        "spaceComplexity": "O(1)",
        "complexityExplanation": "Optimal Two-Pass Linear House Robber Decomposition achieves O(N) time with O(1) auxiliary space.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int rob(int[] nums) {\n        if (nums == null || nums.length == 0) return 0;\n        if (nums.length == 1) return nums[0];\n        return Math.max(robRange(nums, 0, nums.length - 2), robRange(nums, 1, nums.length - 1));\n    }\n    private int robRange(int[] nums, int start, int end) {\n        int prev1 = 0, prev2 = 0;\n        for (int i = start; i <= end; i++) {\n            int temp = Math.max(prev1, prev2 + nums[i]);\n            prev2 = prev1;\n            prev1 = temp;\n        }\n        return prev1;\n    }\n}",
          "python": "class Solution:\n    def rob(self, nums: list[int]) -> int:\n        if not nums: return 0\n        if len(nums) == 1: return nums[0]\n        def rob_range(start, end):\n            p1, p2 = 0, 0\n            for i in range(start, end + 1):\n                p1, p2 = max(p1, p2 + nums[i]), p1\n            return p1\n        return max(rob_range(0, len(nums) - 2), rob_range(1, len(nums) - 1))",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int robRange(const std::vector<int>& nums, int start, int end) {\n        int prev1 = 0, prev2 = 0;\n        for (int i = start; i <= end; ++i) {\n            int temp = std::max(prev1, prev2 + nums[i]);\n            prev2 = prev1;\n            prev1 = temp;\n        }\n        return prev1;\n    }\n    int rob(std::vector<int>& nums) {\n        if (nums.empty()) return 0;\n        if (nums.size() == 1) return nums[0];\n        return std::max(robRange(nums, 0, (int)nums.size() - 2), robRange(nums, 1, (int)nums.size() - 1));\n    }\n};",
          "javascript": "function rob(nums) {\n    if (!nums || nums.length === 0) return 0;\n    if (nums.length === 1) return nums[0];\n    function robRange(start, end) {\n        let p1 = 0, p2 = 0;\n        for (let i = start; i <= end; i++) {\n            const temp = Math.max(p1, p2 + nums[i]);\n            p2 = p1;\n            p1 = temp;\n        }\n        return p1;\n    }\n    return Math.max(robRange(0, nums.length - 2), robRange(1, nums.length - 1));\n}"
        }
      }
    }
  },
  "unique_paths": {
    "questionId": "archetype-unique_paths",
    "pattern": "1D Rolling Array Grid DP",
    "intuition": [
      "Robot can only move down or right.",
      "Number of paths to (i, j) is paths(i-1, j) + paths(i, j-1).",
      "Can be reduced to a 1D array of size n: dp[j] += dp[j - 1]."
    ],
    "pseudocode": [
      "FUNCTION uniquePaths(m, n):",
      "  dp = Array(n, 1)",
      "  FOR i from 1 TO m - 1:",
      "    FOR j from 1 TO n - 1: dp[j] += dp[j - 1]",
      "  RETURN dp[n - 1]"
    ],
    "timeComplexity": "O(M * N)",
    "spaceComplexity": "O(N)",
    "complexityExplanation": "Optimal 1D Rolling Array Grid DP achieves O(M * N) time with O(N) space.",
    "edgeCases": [
      "1x1 grid (returns 1)",
      "1xN grid (returns 1)",
      "Mx1 grid (returns 1)"
    ],
    "code": {
      "java": "import java.util.*;\n\npublic class Solution {\n    public int uniquePaths(int m, int n) {\n        int[] dp = new int[n];\n        Arrays.fill(dp, 1);\n        for (int i = 1; i < m; i++) {\n            for (int j = 1; j < n; j++) {\n                dp[j] += dp[j - 1];\n            }\n        }\n        return dp[n - 1];\n    }\n}",
      "python": "class Solution:\n    def uniquePaths(self, m: int, n: int) -> int:\n        dp = [1] * n\n        for i in range(1, m):\n            for j in range(1, n):\n                dp[j] += dp[j - 1]\n        return dp[n - 1]",
      "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int uniquePaths(int m, int n) {\n        std::vector<int> dp(n, 1);\n        for (int i = 1; i < m; ++i) {\n            for (int j = 1; j < n; ++j) {\n                dp[j] += dp[j - 1];\n            }\n        }\n        return dp[n - 1];\n    }\n};",
      "javascript": "function uniquePaths(m, n) {\n    const dp = new Array(n).fill(1);\n    for (let i = 1; i < m; i++) {\n        for (let j = 1; j < n; j++) {\n            dp[j] += dp[j - 1];\n        }\n    }\n    return dp[n - 1];\n}"
    },
    "interviewProTips": [
      "Start with the state transition recurrence for Unique Paths before writing space-optimized code.",
      "Verify base cases for empty or single element inputs to prevent out-of-bounds access."
    ],
    "approaches": {
      "brute": {
        "name": "Brute Force (Pure Recursion)",
        "tier": "brute",
        "badge": "\ud83e\udd49 Brute Force",
        "intuition": [
          "Formulate problem as recursive exploration of all choice branches without memoization.",
          "Re-evaluates identical subproblem states repeatedly, leading to exponential time complexity."
        ],
        "timeComplexity": "O(2^(M+N))",
        "spaceComplexity": "O(M + N)",
        "complexityExplanation": "Exhaustive recursion tree branches into O(2^(M+N)) operations.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int uniquePathsBrute(int m, int n) {\n        return helper(0, 0, m, n);\n    }\n    private int helper(int r, int c, int m, int n) {\n        if (r == m - 1 && c == n - 1) return 1;\n        if (r >= m || c >= n) return 0;\n        return helper(r + 1, c, m, n) + helper(r, c + 1, m, n);\n    }\n}",
          "python": "class Solution:\n    def uniquePathsBrute(self, m: int, n: int) -> int:\n        def h(r, c):\n            if r == m - 1 and c == n - 1: return 1\n            if r >= m or c >= n: return 0\n            return h(r + 1, c) + h(r, c + 1)\n        return h(0, 0)",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int helper(int r, int c, int m, int n) {\n        if (r == m - 1 && c == n - 1) return 1;\n        if (r >= m || c >= n) return 0;\n        return helper(r + 1, c, m, n) + helper(r, c + 1, m, n);\n    }\n    int uniquePathsBrute(int m, int n) {\n        return helper(0, 0, m, n);\n    }\n};",
          "javascript": "function uniquePathsBrute(m, n) {\n    function h(r, c) {\n        if (r === m - 1 && c === n - 1) return 1;\n        if (r >= m || c >= n) return 0;\n        return h(r + 1, c) + h(r, c + 1);\n    }\n    return h(0, 0);\n}"
        }
      },
      "better": {
        "name": "Better (Memoized DFS / 2D DP Table)",
        "tier": "better",
        "badge": "\ud83e\udd48 Better",
        "intuition": [
          "Store previously computed subproblem states in a lookup table or matrix.",
          "If a state is already visited, return the stored value immediately in O(1) time."
        ],
        "timeComplexity": "O(M * N)",
        "spaceComplexity": "O(M * N)",
        "complexityExplanation": "Memoization evaluates each state at most once, reducing time to O(M * N).",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int uniquePathsBetter(int m, int n) {\n        int[][] dp = new int[m][n];\n        for (int i = 0; i < m; i++) dp[i][0] = 1;\n        for (int j = 0; j < n; j++) dp[0][j] = 1;\n        for (int i = 1; i < m; i++) {\n            for (int j = 1; j < n; j++) {\n                dp[i][j] = dp[i - 1][j] + dp[i][j - 1];\n            }\n        }\n        return dp[m - 1][n - 1];\n    }\n}",
          "python": "class Solution:\n    def uniquePathsBetter(self, m: int, n: int) -> int:\n        dp = [[1] * n for _ in range(m)]\n        for i in range(1, m):\n            for j in range(1, n):\n                dp[i][j] = dp[i - 1][j] + dp[i][j - 1]\n        return dp[m - 1][n - 1]",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int uniquePathsBetter(int m, int n) {\n        std::vector<std::vector<int>> dp(m, std::vector<int>(n, 1));\n        for (int i = 1; i < m; ++i) {\n            for (int j = 1; j < n; ++j) {\n                dp[i][j] = dp[i - 1][j] + dp[i][j - 1];\n            }\n        }\n        return dp[m - 1][n - 1];\n    }\n};",
          "javascript": "function uniquePathsBetter(m, n) {\n    const dp = Array.from({ length: m }, () => new Array(n).fill(1));\n    for (let i = 1; i < m; i++) {\n        for (let j = 1; j < n; j++) {\n            dp[i][j] = dp[i - 1][j] + dp[i][j - 1];\n        }\n    }\n    return dp[m - 1][n - 1];\n}"
        }
      },
      "optimal": {
        "name": "Optimal (1D Rolling Array Grid DP)",
        "tier": "optimal",
        "badge": "\ud83e\udd47 Optimal",
        "intuition": [
          "Robot can only move down or right.",
          "Number of paths to (i, j) is paths(i-1, j) + paths(i, j-1).",
          "Can be reduced to a 1D array of size n: dp[j] += dp[j - 1]."
        ],
        "pseudocode": [
          "FUNCTION uniquePaths(m, n):",
          "  dp = Array(n, 1)",
          "  FOR i from 1 TO m - 1:",
          "    FOR j from 1 TO n - 1: dp[j] += dp[j - 1]",
          "  RETURN dp[n - 1]"
        ],
        "timeComplexity": "O(M * N)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Optimal 1D Rolling Array Grid DP achieves O(M * N) time with O(N) auxiliary space.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int uniquePaths(int m, int n) {\n        int[] dp = new int[n];\n        Arrays.fill(dp, 1);\n        for (int i = 1; i < m; i++) {\n            for (int j = 1; j < n; j++) {\n                dp[j] += dp[j - 1];\n            }\n        }\n        return dp[n - 1];\n    }\n}",
          "python": "class Solution:\n    def uniquePaths(self, m: int, n: int) -> int:\n        dp = [1] * n\n        for i in range(1, m):\n            for j in range(1, n):\n                dp[j] += dp[j - 1]\n        return dp[n - 1]",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int uniquePaths(int m, int n) {\n        std::vector<int> dp(n, 1);\n        for (int i = 1; i < m; ++i) {\n            for (int j = 1; j < n; ++j) {\n                dp[j] += dp[j - 1];\n            }\n        }\n        return dp[n - 1];\n    }\n};",
          "javascript": "function uniquePaths(m, n) {\n    const dp = new Array(n).fill(1);\n    for (let i = 1; i < m; i++) {\n        for (let j = 1; j < n; j++) {\n            dp[j] += dp[j - 1];\n        }\n    }\n    return dp[n - 1];\n}"
        }
      }
    }
  },
  "minimum_path_sum": {
    "questionId": "archetype-minimum_path_sum",
    "pattern": "1D In-Place / Rolling Array Matrix DP",
    "intuition": [
      "Find a path from top-left to bottom-right minimizing sum of numbers.",
      "dp[j] = grid[i][j] + min(dp[j], dp[j-1]).",
      "Optimal space is O(N) using a single 1D row, or O(1) in-place on input grid."
    ],
    "pseudocode": [
      "FUNCTION minPathSum(grid):",
      "  m = grid.length, n = grid[0].length",
      "  dp = Array(n, 0); dp[0] = grid[0][0]",
      "  FOR j from 1 TO n - 1: dp[j] = dp[j-1] + grid[0][j]",
      "  FOR i from 1 TO m - 1:",
      "    dp[0] += grid[i][0]",
      "    FOR j from 1 TO n - 1: dp[j] = grid[i][j] + MIN(dp[j], dp[j-1])",
      "  RETURN dp[n - 1]"
    ],
    "timeComplexity": "O(M * N)",
    "spaceComplexity": "O(N)",
    "complexityExplanation": "Optimal 1D In-Place / Rolling Array Matrix DP achieves O(M * N) time with O(N) space.",
    "edgeCases": [
      "Single cell 1x1",
      "Single row",
      "Single column"
    ],
    "code": {
      "java": "import java.util.*;\n\npublic class Solution {\n    public int minPathSum(int[][] grid) {\n        int m = grid.length, n = grid[0].length;\n        int[] dp = new int[n];\n        dp[0] = grid[0][0];\n        for (int j = 1; j < n; j++) dp[j] = dp[j - 1] + grid[0][j];\n        for (int i = 1; i < m; i++) {\n            dp[0] += grid[i][0];\n            for (int j = 1; j < n; j++) {\n                dp[j] = grid[i][j] + Math.min(dp[j], dp[j - 1]);\n            }\n        }\n        return dp[n - 1];\n    }\n}",
      "python": "class Solution:\n    def minPathSum(self, grid: list[list[int]]) -> int:\n        m, n = len(grid), len(grid[0])\n        dp = [0] * n\n        dp[0] = grid[0][0]\n        for j in range(1, n): dp[j] = dp[j - 1] + grid[0][j]\n        for i in range(1, m):\n            dp[0] += grid[i][0]\n            for j in range(1, n):\n                dp[j] = grid[i][j] + min(dp[j], dp[j - 1])\n        return dp[n - 1]",
      "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int minPathSum(std::vector<std::vector<int>>& grid) {\n        int m = grid.size(), n = grid[0].size();\n        std::vector<int> dp(n, 0);\n        dp[0] = grid[0][0];\n        for (int j = 1; j < n; ++j) dp[j] = dp[j - 1] + grid[0][j];\n        for (int i = 1; i < m; ++i) {\n            dp[0] += grid[i][0];\n            for (int j = 1; j < n; ++j) {\n                dp[j] = grid[i][j] + std::min(dp[j], dp[j - 1]);\n            }\n        }\n        return dp[n - 1];\n    }\n};",
      "javascript": "function minPathSum(grid) {\n    const m = grid.length, n = grid[0].length;\n    const dp = new Array(n).fill(0);\n    dp[0] = grid[0][0];\n    for (let j = 1; j < n; j++) dp[j] = dp[j - 1] + grid[0][j];\n    for (let i = 1; i < m; i++) {\n        dp[0] += grid[i][0];\n        for (let j = 1; j < n; j++) {\n            dp[j] = grid[i][j] + Math.min(dp[j], dp[j - 1]);\n        }\n    }\n    return dp[n - 1];\n}"
    },
    "interviewProTips": [
      "Start with the state transition recurrence for Minimum Path Sum before writing space-optimized code.",
      "Verify base cases for empty or single element inputs to prevent out-of-bounds access."
    ],
    "approaches": {
      "brute": {
        "name": "Brute Force (Pure Recursion)",
        "tier": "brute",
        "badge": "\ud83e\udd49 Brute Force",
        "intuition": [
          "Formulate problem as recursive exploration of all choice branches without memoization.",
          "Re-evaluates identical subproblem states repeatedly, leading to exponential time complexity."
        ],
        "timeComplexity": "O(2^(M+N))",
        "spaceComplexity": "O(M + N)",
        "complexityExplanation": "Exhaustive recursion tree branches into O(2^(M+N)) operations.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int minPathSumBrute(int[][] grid) {\n        return helper(grid, 0, 0);\n    }\n    private int helper(int[][] grid, int r, int c) {\n        int m = grid.length, n = grid[0].length;\n        if (r == m - 1 && c == n - 1) return grid[r][c];\n        if (r >= m || c >= n) return Integer.MAX_VALUE;\n        int right = helper(grid, r, c + 1);\n        int down = helper(grid, r + 1, c);\n        return grid[r][c] + Math.min(right, down);\n    }\n}",
          "python": "class Solution:\n    def minPathSumBrute(self, grid: list[list[int]]) -> int:\n        m, n = len(grid), len(grid[0])\n        def h(r, c):\n            if r == m - 1 and c == n - 1: return grid[r][c]\n            if r >= m or c >= n: return float('inf')\n            return grid[r][c] + min(h(r + 1, c), h(r, c + 1))\n        return h(0, 0)",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int helper(const std::vector<std::vector<int>>& grid, int r, int c) {\n        int m = grid.size(), n = grid[0].size();\n        if (r == m - 1 && c == n - 1) return grid[r][c];\n        if (r >= m || c >= n) return 1e9;\n        return grid[r][c] + std::min(helper(grid, r + 1, c), helper(grid, r, c + 1));\n    }\n    int minPathSumBrute(std::vector<std::vector<int>>& grid) {\n        return helper(grid, 0, 0);\n    }\n};",
          "javascript": "function minPathSumBrute(grid) {\n    const m = grid.length, n = grid[0].length;\n    function h(r, c) {\n        if (r === m - 1 && c === n - 1) return grid[r][c];\n        if (r >= m || c >= n) return Infinity;\n        return grid[r][c] + Math.min(h(r + 1, c), h(r, c + 1));\n    }\n    return h(0, 0);\n}"
        }
      },
      "better": {
        "name": "Better (Memoized DFS / 2D DP Table)",
        "tier": "better",
        "badge": "\ud83e\udd48 Better",
        "intuition": [
          "Store previously computed subproblem states in a lookup table or matrix.",
          "If a state is already visited, return the stored value immediately in O(1) time."
        ],
        "timeComplexity": "O(M * N)",
        "spaceComplexity": "O(M * N)",
        "complexityExplanation": "Memoization evaluates each state at most once, reducing time to O(M * N).",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int minPathSumBetter(int[][] grid) {\n        int m = grid.length, n = grid[0].length;\n        int[][] dp = new int[m][n];\n        dp[0][0] = grid[0][0];\n        for (int i = 1; i < m; i++) dp[i][0] = dp[i - 1][0] + grid[i][0];\n        for (int j = 1; j < n; j++) dp[0][j] = dp[0][j - 1] + grid[0][j];\n        for (int i = 1; i < m; i++) {\n            for (int j = 1; j < n; j++) {\n                dp[i][j] = grid[i][j] + Math.min(dp[i - 1][j], dp[i][j - 1]);\n            }\n        }\n        return dp[m - 1][n - 1];\n    }\n}",
          "python": "class Solution:\n    def minPathSumBetter(self, grid: list[list[int]]) -> int:\n        m, n = len(grid), len(grid[0])\n        dp = [[0] * n for _ in range(m)]\n        dp[0][0] = grid[0][0]\n        for i in range(1, m): dp[i][0] = dp[i - 1][0] + grid[i][0]\n        for j in range(1, n): dp[0][j] = dp[0][j - 1] + grid[0][j]\n        for i in range(1, m):\n            for j in range(1, n):\n                dp[i][j] = grid[i][j] + min(dp[i - 1][j], dp[i][j - 1])\n        return dp[m - 1][n - 1]",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int minPathSumBetter(std::vector<std::vector<int>>& grid) {\n        int m = grid.size(), n = grid[0].size();\n        std::vector<std::vector<int>> dp(m, std::vector<int>(n, 0));\n        dp[0][0] = grid[0][0];\n        for (int i = 1; i < m; ++i) dp[i][0] = dp[i - 1][0] + grid[i][0];\n        for (int j = 1; j < n; ++j) dp[0][j] = dp[0][j - 1] + grid[0][j];\n        for (int i = 1; i < m; ++i) {\n            for (int j = 1; j < n; ++j) {\n                dp[i][j] = grid[i][j] + std::min(dp[i - 1][j], dp[i][j - 1]);\n            }\n        }\n        return dp[m - 1][n - 1];\n    }\n};",
          "javascript": "function minPathSumBetter(grid) {\n    const m = grid.length, n = grid[0].length;\n    const dp = Array.from({ length: m }, () => new Array(n).fill(0));\n    dp[0][0] = grid[0][0];\n    for (let i = 1; i < m; i++) dp[i][0] = dp[i - 1][0] + grid[i][0];\n    for (let j = 1; j < n; j++) dp[0][j] = dp[0][j - 1] + grid[0][j];\n    for (let i = 1; i < m; i++) {\n        for (let j = 1; j < n; j++) {\n            dp[i][j] = grid[i][j] + Math.min(dp[i - 1][j], dp[i][j - 1]);\n        }\n    }\n    return dp[m - 1][n - 1];\n}"
        }
      },
      "optimal": {
        "name": "Optimal (1D In-Place / Rolling Array Matrix DP)",
        "tier": "optimal",
        "badge": "\ud83e\udd47 Optimal",
        "intuition": [
          "Find a path from top-left to bottom-right minimizing sum of numbers.",
          "dp[j] = grid[i][j] + min(dp[j], dp[j-1]).",
          "Optimal space is O(N) using a single 1D row, or O(1) in-place on input grid."
        ],
        "pseudocode": [
          "FUNCTION minPathSum(grid):",
          "  m = grid.length, n = grid[0].length",
          "  dp = Array(n, 0); dp[0] = grid[0][0]",
          "  FOR j from 1 TO n - 1: dp[j] = dp[j-1] + grid[0][j]",
          "  FOR i from 1 TO m - 1:",
          "    dp[0] += grid[i][0]",
          "    FOR j from 1 TO n - 1: dp[j] = grid[i][j] + MIN(dp[j], dp[j-1])",
          "  RETURN dp[n - 1]"
        ],
        "timeComplexity": "O(M * N)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Optimal 1D In-Place / Rolling Array Matrix DP achieves O(M * N) time with O(N) auxiliary space.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int minPathSum(int[][] grid) {\n        int m = grid.length, n = grid[0].length;\n        int[] dp = new int[n];\n        dp[0] = grid[0][0];\n        for (int j = 1; j < n; j++) dp[j] = dp[j - 1] + grid[0][j];\n        for (int i = 1; i < m; i++) {\n            dp[0] += grid[i][0];\n            for (int j = 1; j < n; j++) {\n                dp[j] = grid[i][j] + Math.min(dp[j], dp[j - 1]);\n            }\n        }\n        return dp[n - 1];\n    }\n}",
          "python": "class Solution:\n    def minPathSum(self, grid: list[list[int]]) -> int:\n        m, n = len(grid), len(grid[0])\n        dp = [0] * n\n        dp[0] = grid[0][0]\n        for j in range(1, n): dp[j] = dp[j - 1] + grid[0][j]\n        for i in range(1, m):\n            dp[0] += grid[i][0]\n            for j in range(1, n):\n                dp[j] = grid[i][j] + min(dp[j], dp[j - 1])\n        return dp[n - 1]",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int minPathSum(std::vector<std::vector<int>>& grid) {\n        int m = grid.size(), n = grid[0].size();\n        std::vector<int> dp(n, 0);\n        dp[0] = grid[0][0];\n        for (int j = 1; j < n; ++j) dp[j] = dp[j - 1] + grid[0][j];\n        for (int i = 1; i < m; ++i) {\n            dp[0] += grid[i][0];\n            for (int j = 1; j < n; ++j) {\n                dp[j] = grid[i][j] + std::min(dp[j], dp[j - 1]);\n            }\n        }\n        return dp[n - 1];\n    }\n};",
          "javascript": "function minPathSum(grid) {\n    const m = grid.length, n = grid[0].length;\n    const dp = new Array(n).fill(0);\n    dp[0] = grid[0][0];\n    for (let j = 1; j < n; j++) dp[j] = dp[j - 1] + grid[0][j];\n    for (let i = 1; i < m; i++) {\n        dp[0] += grid[i][0];\n        for (let j = 1; j < n; j++) {\n            dp[j] = grid[i][j] + Math.min(dp[j], dp[j - 1]);\n        }\n    }\n    return dp[n - 1];\n}"
        }
      }
    }
  },
  "maximal_square": {
    "questionId": "archetype-maximal_square",
    "pattern": "2D to 1D Square DP",
    "intuition": [
      "Let dp[i][j] be the side length of maximal square ending at (i, j).",
      "If matrix[i-1][j-1] == '1': dp[i][j] = 1 + min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]).",
      "Return maxSide * maxSide for the area."
    ],
    "pseudocode": [
      "FUNCTION maximalSquare(matrix):",
      "  m = matrix.length, n = matrix[0].length",
      "  dp = Array(n + 1, 0); maxSide = 0",
      "  FOR i from 1 TO m:",
      "    prev = 0",
      "    FOR j from 1 TO n:",
      "      temp = dp[j]",
      "      IF matrix[i-1][j-1] == '1':",
      "        dp[j] = 1 + MIN(dp[j], dp[j-1], prev)",
      "        maxSide = MAX(maxSide, dp[j])",
      "      ELSE: dp[j] = 0",
      "      prev = temp",
      "  RETURN maxSide * maxSide"
    ],
    "timeComplexity": "O(M * N)",
    "spaceComplexity": "O(N)",
    "complexityExplanation": "Optimal 2D to 1D Square DP achieves O(M * N) time with O(N) space.",
    "edgeCases": [
      "All zeros",
      "All ones",
      "Single element 1x1"
    ],
    "code": {
      "java": "import java.util.*;\n\npublic class Solution {\n    public int maximalSquare(char[][] matrix) {\n        if (matrix == null || matrix.length == 0 || matrix[0].length == 0) return 0;\n        int m = matrix.length, n = matrix[0].length, maxSide = 0;\n        int[] dp = new int[n + 1];\n        for (int i = 1; i <= m; i++) {\n            int prev = 0;\n            for (int j = 1; j <= n; j++) {\n                int temp = dp[j];\n                if (matrix[i - 1][j - 1] == '1') {\n                    dp[j] = 1 + Math.min(prev, Math.min(dp[j], dp[j - 1]));\n                    maxSide = Math.max(maxSide, dp[j]);\n                } else {\n                    dp[j] = 0;\n                }\n                prev = temp;\n            }\n        }\n        return maxSide * maxSide;\n    }\n}",
      "python": "class Solution:\n    def maximalSquare(self, matrix: list[list[str]]) -> int:\n        if not matrix or not matrix[0]: return 0\n        m, n, max_side = len(matrix), len(matrix[0]), 0\n        dp = [0] * (n + 1)\n        for i in range(1, m + 1):\n            prev = 0\n            for j in range(1, n + 1):\n                temp = dp[j]\n                if matrix[i - 1][j - 1] == '1':\n                    dp[j] = 1 + min(prev, dp[j], dp[j - 1])\n                    max_side = max(max_side, dp[j])\n                else:\n                    dp[j] = 0\n                prev = temp\n        return max_side * max_side",
      "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int maximalSquare(std::vector<std::vector<char>>& matrix) {\n        if (matrix.empty() || matrix[0].empty()) return 0;\n        int m = matrix.size(), n = matrix[0].size(), maxSide = 0;\n        std::vector<int> dp(n + 1, 0);\n        for (int i = 1; i <= m; ++i) {\n            int prev = 0;\n            for (int j = 1; j <= n; ++j) {\n                int temp = dp[j];\n                if (matrix[i - 1][j - 1] == '1') {\n                    dp[j] = 1 + std::min({prev, dp[j], dp[j - 1]});\n                    maxSide = std::max(maxSide, dp[j]);\n                } else {\n                    dp[j] = 0;\n                }\n                prev = temp;\n            }\n        }\n        return maxSide * maxSide;\n    }\n};",
      "javascript": "function maximalSquare(matrix) {\n    if (!matrix || matrix.length === 0 || matrix[0].length === 0) return 0;\n    const m = matrix.length, n = matrix[0].length;\n    let maxSide = 0;\n    const dp = new Array(n + 1).fill(0);\n    for (let i = 1; i <= m; i++) {\n        let prev = 0;\n        for (let j = 1; j <= n; j++) {\n            const temp = dp[j];\n            if (matrix[i - 1][j - 1] === '1') {\n                dp[j] = 1 + Math.min(prev, Math.min(dp[j], dp[j - 1]));\n                maxSide = Math.max(maxSide, dp[j]);\n            } else {\n                dp[j] = 0;\n            }\n            prev = temp;\n        }\n    }\n    return maxSide * maxSide;\n}"
    },
    "interviewProTips": [
      "Start with the state transition recurrence for Maximal Square before writing space-optimized code.",
      "Verify base cases for empty or single element inputs to prevent out-of-bounds access."
    ],
    "approaches": {
      "brute": {
        "name": "Brute Force (Pure Recursion)",
        "tier": "brute",
        "badge": "\ud83e\udd49 Brute Force",
        "intuition": [
          "Formulate problem as recursive exploration of all choice branches without memoization.",
          "Re-evaluates identical subproblem states repeatedly, leading to exponential time complexity."
        ],
        "timeComplexity": "O((M*N)\u00b2)",
        "spaceComplexity": "O(1)",
        "complexityExplanation": "Exhaustive recursion tree branches into O((M*N)\u00b2) operations.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int maximalSquareBrute(char[][] matrix) {\n        int m = matrix.length, n = matrix[0].length, maxSide = 0;\n        for (int i = 0; i < m; i++) {\n            for (int j = 0; j < n; j++) {\n                if (matrix[i][j] == '1') {\n                    int k = 1;\n                    boolean flag = true;\n                    while (i + k < m && j + k < n && flag) {\n                        for (int r = i; r <= i + k; r++) if (matrix[r][j + k] == '0') flag = false;\n                        for (int c = j; c <= j + k; c++) if (matrix[i + k][c] == '0') flag = false;\n                        if (flag) k++;\n                    }\n                    maxSide = Math.max(maxSide, k);\n                }\n            }\n        }\n        return maxSide * maxSide;\n    }\n}",
          "python": "class Solution:\n    def maximalSquareBrute(self, matrix: list[list[str]]) -> int:\n        m, n, max_side = len(matrix), len(matrix[0]), 0\n        for i in range(m):\n            for j in range(n):\n                if matrix[i][j] == '1':\n                    k, flag = 1, True\n                    while i + k < m and j + k < n and flag:\n                        for r in range(i, i + k + 1):\n                            if matrix[r][j + k] == '0': flag = False\n                        for c in range(j, j + k + 1):\n                            if matrix[i + k][c] == '0': flag = False\n                        if flag: k += 1\n                    max_side = max(max_side, k)\n        return max_side * max_side",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int maximalSquareBrute(std::vector<std::vector<char>>& matrix) {\n        int m = matrix.size(), n = matrix[0].size(), maxSide = 0;\n        for (int i = 0; i < m; ++i) {\n            for (int j = 0; j < n; ++j) {\n                if (matrix[i][j] == '1') {\n                    int k = 1;\n                    bool flag = true;\n                    while (i + k < m && j + k < n && flag) {\n                        for (int r = i; r <= i + k; ++r) if (matrix[r][j + k] == '0') flag = false;\n                        for (int c = j; c <= j + k; ++c) if (matrix[i + k][c] == '0') flag = false;\n                        if (flag) k++;\n                    }\n                    maxSide = std::max(maxSide, k);\n                }\n            }\n        }\n        return maxSide * maxSide;\n    }\n};",
          "javascript": "function maximalSquareBrute(matrix) {\n    const m = matrix.length, n = matrix[0].length;\n    let maxSide = 0;\n    for (let i = 0; i < m; i++) {\n        for (let j = 0; j < n; j++) {\n            if (matrix[i][j] === '1') {\n                let k = 1, flag = true;\n                while (i + k < m && j + k < n && flag) {\n                    for (let r = i; r <= i + k; r++) if (matrix[r][j + k] === '0') flag = false;\n                    for (let c = j; c <= j + k; c++) if (matrix[i + k][c] === '0') flag = false;\n                    if (flag) k++;\n                }\n                maxSide = Math.max(maxSide, k);\n            }\n        }\n    }\n    return maxSide * maxSide;\n}"
        }
      },
      "better": {
        "name": "Better (Memoized DFS / 2D DP Table)",
        "tier": "better",
        "badge": "\ud83e\udd48 Better",
        "intuition": [
          "Store previously computed subproblem states in a lookup table or matrix.",
          "If a state is already visited, return the stored value immediately in O(1) time."
        ],
        "timeComplexity": "O(M * N)",
        "spaceComplexity": "O(M * N)",
        "complexityExplanation": "Memoization evaluates each state at most once, reducing time to O(M * N).",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int maximalSquareBetter(char[][] matrix) {\n        if (matrix == null || matrix.length == 0) return 0;\n        int m = matrix.length, n = matrix[0].length, maxSide = 0;\n        int[][] dp = new int[m + 1][n + 1];\n        for (int i = 1; i <= m; i++) {\n            for (int j = 1; j <= n; j++) {\n                if (matrix[i - 1][j - 1] == '1') {\n                    dp[i][j] = 1 + Math.min(dp[i - 1][j - 1], Math.min(dp[i - 1][j], dp[i][j - 1]));\n                    maxSide = Math.max(maxSide, dp[i][j]);\n                }\n            }\n        }\n        return maxSide * maxSide;\n    }\n}",
          "python": "class Solution:\n    def maximalSquareBetter(self, matrix: list[list[str]]) -> int:\n        if not matrix: return 0\n        m, n, max_side = len(matrix), len(matrix[0]), 0\n        dp = [[0] * (n + 1) for _ in range(m + 1)]\n        for i in range(1, m + 1):\n            for j in range(1, n + 1):\n                if matrix[i - 1][j - 1] == '1':\n                    dp[i][j] = 1 + min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1])\n                    max_side = max(max_side, dp[i][j])\n        return max_side * max_side",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int maximalSquareBetter(std::vector<std::vector<char>>& matrix) {\n        if (matrix.empty()) return 0;\n        int m = matrix.size(), n = matrix[0].size(), maxSide = 0;\n        std::vector<std::vector<int>> dp(m + 1, std::vector<int>(n + 1, 0));\n        for (int i = 1; i <= m; ++i) {\n            for (int j = 1; j <= n; ++j) {\n                if (matrix[i - 1][j - 1] == '1') {\n                    dp[i][j] = 1 + std::min({dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]});\n                    maxSide = std::max(maxSide, dp[i][j]);\n                }\n            }\n        }\n        return maxSide * maxSide;\n    }\n};",
          "javascript": "function maximalSquareBetter(matrix) {\n    if (!matrix || matrix.length === 0) return 0;\n    const m = matrix.length, n = matrix[0].length;\n    let maxSide = 0;\n    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));\n    for (let i = 1; i <= m; i++) {\n        for (let j = 1; j <= n; j++) {\n            if (matrix[i - 1][j - 1] === '1') {\n                dp[i][j] = 1 + Math.min(dp[i - 1][j - 1], Math.min(dp[i - 1][j], dp[i][j - 1]));\n                maxSide = Math.max(maxSide, dp[i][j]);\n            }\n        }\n    }\n    return maxSide * maxSide;\n}"
        }
      },
      "optimal": {
        "name": "Optimal (2D to 1D Square DP)",
        "tier": "optimal",
        "badge": "\ud83e\udd47 Optimal",
        "intuition": [
          "Let dp[i][j] be the side length of maximal square ending at (i, j).",
          "If matrix[i-1][j-1] == '1': dp[i][j] = 1 + min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]).",
          "Return maxSide * maxSide for the area."
        ],
        "pseudocode": [
          "FUNCTION maximalSquare(matrix):",
          "  m = matrix.length, n = matrix[0].length",
          "  dp = Array(n + 1, 0); maxSide = 0",
          "  FOR i from 1 TO m:",
          "    prev = 0",
          "    FOR j from 1 TO n:",
          "      temp = dp[j]",
          "      IF matrix[i-1][j-1] == '1':",
          "        dp[j] = 1 + MIN(dp[j], dp[j-1], prev)",
          "        maxSide = MAX(maxSide, dp[j])",
          "      ELSE: dp[j] = 0",
          "      prev = temp",
          "  RETURN maxSide * maxSide"
        ],
        "timeComplexity": "O(M * N)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Optimal 2D to 1D Square DP achieves O(M * N) time with O(N) auxiliary space.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int maximalSquare(char[][] matrix) {\n        if (matrix == null || matrix.length == 0 || matrix[0].length == 0) return 0;\n        int m = matrix.length, n = matrix[0].length, maxSide = 0;\n        int[] dp = new int[n + 1];\n        for (int i = 1; i <= m; i++) {\n            int prev = 0;\n            for (int j = 1; j <= n; j++) {\n                int temp = dp[j];\n                if (matrix[i - 1][j - 1] == '1') {\n                    dp[j] = 1 + Math.min(prev, Math.min(dp[j], dp[j - 1]));\n                    maxSide = Math.max(maxSide, dp[j]);\n                } else {\n                    dp[j] = 0;\n                }\n                prev = temp;\n            }\n        }\n        return maxSide * maxSide;\n    }\n}",
          "python": "class Solution:\n    def maximalSquare(self, matrix: list[list[str]]) -> int:\n        if not matrix or not matrix[0]: return 0\n        m, n, max_side = len(matrix), len(matrix[0]), 0\n        dp = [0] * (n + 1)\n        for i in range(1, m + 1):\n            prev = 0\n            for j in range(1, n + 1):\n                temp = dp[j]\n                if matrix[i - 1][j - 1] == '1':\n                    dp[j] = 1 + min(prev, dp[j], dp[j - 1])\n                    max_side = max(max_side, dp[j])\n                else:\n                    dp[j] = 0\n                prev = temp\n        return max_side * max_side",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int maximalSquare(std::vector<std::vector<char>>& matrix) {\n        if (matrix.empty() || matrix[0].empty()) return 0;\n        int m = matrix.size(), n = matrix[0].size(), maxSide = 0;\n        std::vector<int> dp(n + 1, 0);\n        for (int i = 1; i <= m; ++i) {\n            int prev = 0;\n            for (int j = 1; j <= n; ++j) {\n                int temp = dp[j];\n                if (matrix[i - 1][j - 1] == '1') {\n                    dp[j] = 1 + std::min({prev, dp[j], dp[j - 1]});\n                    maxSide = std::max(maxSide, dp[j]);\n                } else {\n                    dp[j] = 0;\n                }\n                prev = temp;\n            }\n        }\n        return maxSide * maxSide;\n    }\n};",
          "javascript": "function maximalSquare(matrix) {\n    if (!matrix || matrix.length === 0 || matrix[0].length === 0) return 0;\n    const m = matrix.length, n = matrix[0].length;\n    let maxSide = 0;\n    const dp = new Array(n + 1).fill(0);\n    for (let i = 1; i <= m; i++) {\n        let prev = 0;\n        for (let j = 1; j <= n; j++) {\n            const temp = dp[j];\n            if (matrix[i - 1][j - 1] === '1') {\n                dp[j] = 1 + Math.min(prev, Math.min(dp[j], dp[j - 1]));\n                maxSide = Math.max(maxSide, dp[j]);\n            } else {\n                dp[j] = 0;\n            }\n            prev = temp;\n        }\n    }\n    return maxSide * maxSide;\n}"
        }
      }
    }
  },
  "decode_ways": {
    "questionId": "archetype-decode_ways",
    "pattern": "1D Space-Optimized Fibonacci-Style DP",
    "intuition": [
      "A message containing letters A-Z is encoded with numbers 1-26.",
      "Single digit s[i-1] decodes if != '0'.",
      "Two digits s[i-2..i-1] decode if value is between 10 and 26.",
      "Maintain two state variables (prev1, prev2) for O(1) space."
    ],
    "pseudocode": [
      "FUNCTION numDecodings(s):",
      "  IF s[0] == '0': RETURN 0",
      "  prev2 = 1, prev1 = 1",
      "  FOR i from 2 TO s.length:",
      "    curr = 0",
      "    oneDigit = Integer(s.substring(i - 1, i))",
      "    twoDigit = Integer(s.substring(i - 2, i))",
      "    IF oneDigit >= 1: curr += prev1",
      "    IF twoDigit >= 10 AND twoDigit <= 26: curr += prev2",
      "    prev2 = prev1; prev1 = curr",
      "  RETURN prev1"
    ],
    "timeComplexity": "O(N)",
    "spaceComplexity": "O(1)",
    "complexityExplanation": "Optimal 1D Space-Optimized Fibonacci-Style DP achieves O(N) time with O(1) space.",
    "edgeCases": [
      "Leading zero ('06' returns 0)",
      "Consecutive zeros ('100' returns 0)",
      "Valid zeroes ('10' returns 1)"
    ],
    "code": {
      "java": "import java.util.*;\n\npublic class Solution {\n    public int numDecodings(String s) {\n        if (s == null || s.length() == 0 || s.charAt(0) == '0') return 0;\n        int prev2 = 1, prev1 = 1;\n        for (int i = 1; i < s.length(); i++) {\n            int curr = 0;\n            int one = s.charAt(i) - '0';\n            int two = Integer.parseInt(s.substring(i - 1, i + 1));\n            if (one >= 1) curr += prev1;\n            if (two >= 10 && two <= 26) curr += prev2;\n            prev2 = prev1;\n            prev1 = curr;\n        }\n        return prev1;\n    }\n}",
      "python": "class Solution:\n    def numDecodings(self, s: str) -> int:\n        if not s or s[0] == '0': return 0\n        p2, p1 = 1, 1\n        for i in range(1, len(s)):\n            cur = 0\n            one = int(s[i])\n            two = int(s[i-1:i+1])\n            if one >= 1: cur += p1\n            if 10 <= two <= 26: cur += p2\n            p2, p1 = p1, cur\n        return p1",
      "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int numDecodings(std::string s) {\n        if (s.empty() || s[0] == '0') return 0;\n        int prev2 = 1, prev1 = 1;\n        for (int i = 1; i < (int)s.length(); ++i) {\n            int curr = 0;\n            int one = s[i] - '0';\n            int two = std::stoi(s.substr(i - 1, 2));\n            if (one >= 1) curr += prev1;\n            if (two >= 10 && two <= 26) curr += prev2;\n            prev2 = prev1;\n            prev1 = curr;\n        }\n        return prev1;\n    }\n};",
      "javascript": "function numDecodings(s) {\n    if (!s || s[0] === '0') return 0;\n    let prev2 = 1, prev1 = 1;\n    for (let i = 1; i < s.length; i++) {\n        let curr = 0;\n        const one = parseInt(s[i], 10);\n        const two = parseInt(s.substring(i - 1, i + 1), 10);\n        if (one >= 1) curr += prev1;\n        if (two >= 10 && two <= 26) curr += prev2;\n        prev2 = prev1;\n        prev1 = curr;\n    }\n    return prev1;\n}"
    },
    "interviewProTips": [
      "Start with the state transition recurrence for Decode Ways before writing space-optimized code.",
      "Verify base cases for empty or single element inputs to prevent out-of-bounds access."
    ],
    "approaches": {
      "brute": {
        "name": "Brute Force (Pure Recursion)",
        "tier": "brute",
        "badge": "\ud83e\udd49 Brute Force",
        "intuition": [
          "Formulate problem as recursive exploration of all choice branches without memoization.",
          "Re-evaluates identical subproblem states repeatedly, leading to exponential time complexity."
        ],
        "timeComplexity": "O(2\u207f)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Exhaustive recursion tree branches into O(2\u207f) operations.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int numDecodingsBrute(String s) {\n        return helper(s, 0);\n    }\n    private int helper(String s, int idx) {\n        if (idx == s.length()) return 1;\n        if (s.charAt(idx) == '0') return 0;\n        int ways = helper(s, idx + 1);\n        if (idx + 1 < s.length()) {\n            int two = Integer.parseInt(s.substring(idx, idx + 2));\n            if (two <= 26) ways += helper(s, idx + 2);\n        }\n        return ways;\n    }\n}",
          "python": "class Solution:\n    def numDecodingsBrute(self, s: str) -> int:\n        def h(idx):\n            if idx == len(s): return 1\n            if s[idx] == '0': return 0\n            ways = h(idx + 1)\n            if idx + 1 < len(s) and int(s[idx:idx+2]) <= 26:\n                ways += h(idx + 2)\n            return ways\n        return h(0)",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int helper(const std::string& s, int idx) {\n        if (idx == (int)s.length()) return 1;\n        if (s[idx] == '0') return 0;\n        int ways = helper(s, idx + 1);\n        if (idx + 1 < (int)s.length()) {\n            int two = std::stoi(s.substr(idx, 2));\n            if (two <= 26) ways += helper(s, idx + 2);\n        }\n        return ways;\n    }\n    int numDecodingsBrute(std::string s) {\n        return helper(s, 0);\n    }\n};",
          "javascript": "function numDecodingsBrute(s) {\n    function h(idx) {\n        if (idx === s.length) return 1;\n        if (s[idx] === '0') return 0;\n        let ways = h(idx + 1);\n        if (idx + 1 < s.length) {\n            const two = parseInt(s.substring(idx, idx + 2), 10);\n            if (two <= 26) ways += h(idx + 2);\n        }\n        return ways;\n    }\n    return h(0);\n}"
        }
      },
      "better": {
        "name": "Better (Memoized DFS / 2D DP Table)",
        "tier": "better",
        "badge": "\ud83e\udd48 Better",
        "intuition": [
          "Store previously computed subproblem states in a lookup table or matrix.",
          "If a state is already visited, return the stored value immediately in O(1) time."
        ],
        "timeComplexity": "O(N)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Memoization evaluates each state at most once, reducing time to O(N).",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int numDecodingsBetter(String s) {\n        if (s == null || s.length() == 0 || s.charAt(0) == '0') return 0;\n        int n = s.length();\n        int[] dp = new int[n + 1];\n        dp[0] = 1; dp[1] = 1;\n        for (int i = 2; i <= n; i++) {\n            int one = s.charAt(i - 1) - '0';\n            int two = Integer.parseInt(s.substring(i - 2, i));\n            if (one >= 1) dp[i] += dp[i - 1];\n            if (two >= 10 && two <= 26) dp[i] += dp[i - 2];\n        }\n        return dp[n];\n    }\n}",
          "python": "class Solution:\n    def numDecodingsBetter(self, s: str) -> int:\n        if not s or s[0] == '0': return 0\n        n = len(s)\n        dp = [0] * (n + 1)\n        dp[0] = dp[1] = 1\n        for i in range(2, n + 1):\n            one = int(s[i - 1])\n            two = int(s[i - 2:i])\n            if one >= 1: dp[i] += dp[i - 1]\n            if 10 <= two <= 26: dp[i] += dp[i - 2]\n        return dp[n]",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int numDecodingsBetter(std::string s) {\n        if (s.empty() || s[0] == '0') return 0;\n        int n = s.length();\n        std::vector<int> dp(n + 1, 0);\n        dp[0] = dp[1] = 1;\n        for (int i = 2; i <= n; ++i) {\n            int one = s[i - 1] - '0';\n            int two = std::stoi(s.substr(i - 2, 2));\n            if (one >= 1) dp[i] += dp[i - 1];\n            if (two >= 10 && two <= 26) dp[i] += dp[i - 2];\n        }\n        return dp[n];\n    }\n};",
          "javascript": "function numDecodingsBetter(s) {\n    if (!s || s[0] === '0') return 0;\n    const n = s.length;\n    const dp = new Array(n + 1).fill(0);\n    dp[0] = dp[1] = 1;\n    for (let i = 2; i <= n; i++) {\n        const one = parseInt(s[i - 1], 10);\n        const two = parseInt(s.substring(i - 2, i), 10);\n        if (one >= 1) dp[i] += dp[i - 1];\n        if (two >= 10 && two <= 26) dp[i] += dp[i - 2];\n    }\n    return dp[n];\n}"
        }
      },
      "optimal": {
        "name": "Optimal (1D Space-Optimized Fibonacci-Style DP)",
        "tier": "optimal",
        "badge": "\ud83e\udd47 Optimal",
        "intuition": [
          "A message containing letters A-Z is encoded with numbers 1-26.",
          "Single digit s[i-1] decodes if != '0'.",
          "Two digits s[i-2..i-1] decode if value is between 10 and 26.",
          "Maintain two state variables (prev1, prev2) for O(1) space."
        ],
        "pseudocode": [
          "FUNCTION numDecodings(s):",
          "  IF s[0] == '0': RETURN 0",
          "  prev2 = 1, prev1 = 1",
          "  FOR i from 2 TO s.length:",
          "    curr = 0",
          "    oneDigit = Integer(s.substring(i - 1, i))",
          "    twoDigit = Integer(s.substring(i - 2, i))",
          "    IF oneDigit >= 1: curr += prev1",
          "    IF twoDigit >= 10 AND twoDigit <= 26: curr += prev2",
          "    prev2 = prev1; prev1 = curr",
          "  RETURN prev1"
        ],
        "timeComplexity": "O(N)",
        "spaceComplexity": "O(1)",
        "complexityExplanation": "Optimal 1D Space-Optimized Fibonacci-Style DP achieves O(N) time with O(1) auxiliary space.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int numDecodings(String s) {\n        if (s == null || s.length() == 0 || s.charAt(0) == '0') return 0;\n        int prev2 = 1, prev1 = 1;\n        for (int i = 1; i < s.length(); i++) {\n            int curr = 0;\n            int one = s.charAt(i) - '0';\n            int two = Integer.parseInt(s.substring(i - 1, i + 1));\n            if (one >= 1) curr += prev1;\n            if (two >= 10 && two <= 26) curr += prev2;\n            prev2 = prev1;\n            prev1 = curr;\n        }\n        return prev1;\n    }\n}",
          "python": "class Solution:\n    def numDecodings(self, s: str) -> int:\n        if not s or s[0] == '0': return 0\n        p2, p1 = 1, 1\n        for i in range(1, len(s)):\n            cur = 0\n            one = int(s[i])\n            two = int(s[i-1:i+1])\n            if one >= 1: cur += p1\n            if 10 <= two <= 26: cur += p2\n            p2, p1 = p1, cur\n        return p1",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int numDecodings(std::string s) {\n        if (s.empty() || s[0] == '0') return 0;\n        int prev2 = 1, prev1 = 1;\n        for (int i = 1; i < (int)s.length(); ++i) {\n            int curr = 0;\n            int one = s[i] - '0';\n            int two = std::stoi(s.substr(i - 1, 2));\n            if (one >= 1) curr += prev1;\n            if (two >= 10 && two <= 26) curr += prev2;\n            prev2 = prev1;\n            prev1 = curr;\n        }\n        return prev1;\n    }\n};",
          "javascript": "function numDecodings(s) {\n    if (!s || s[0] === '0') return 0;\n    let prev2 = 1, prev1 = 1;\n    for (let i = 1; i < s.length; i++) {\n        let curr = 0;\n        const one = parseInt(s[i], 10);\n        const two = parseInt(s.substring(i - 1, i + 1), 10);\n        if (one >= 1) curr += prev1;\n        if (two >= 10 && two <= 26) curr += prev2;\n        prev2 = prev1;\n        prev1 = curr;\n    }\n    return prev1;\n}"
        }
      }
    }
  },
  "interleaving_string": {
    "questionId": "archetype-interleaving_string",
    "pattern": "1D Rolling Boolean DP",
    "intuition": [
      "s3 is an interleaving of s1 and s2 if length(s1) + length(s2) == length(s3) and characters maintain relative order.",
      "dp[j] is true if s1[0..i-1] and s2[0..j-1] can form s3[0..i+j-1].",
      "Transition: dp[j] = (dp[j] && s1[i-1] == s3[i+j-1]) || (dp[j-1] && s2[j-1] == s3[i+j-1])."
    ],
    "pseudocode": [
      "FUNCTION isInterleave(s1, s2, s3):",
      "  IF s1.length + s2.length != s3.length: RETURN false",
      "  dp = Array(s2.length + 1, false); dp[0] = true",
      "  FOR j from 1 TO s2.length: dp[j] = dp[j-1] AND s2[j-1] == s3[j-1]",
      "  FOR i from 1 TO s1.length:",
      "    dp[0] = dp[0] AND s1[i-1] == s3[i-1]",
      "    FOR j from 1 TO s2.length:",
      "      dp[j] = (dp[j] AND s1[i-1] == s3[i+j-1]) OR (dp[j-1] AND s2[j-1] == s3[i+j-1])",
      "  RETURN dp[s2.length]"
    ],
    "timeComplexity": "O(M * N)",
    "spaceComplexity": "O(N)",
    "complexityExplanation": "Optimal 1D Rolling Boolean DP achieves O(M * N) time with O(N) space.",
    "edgeCases": [
      "Empty strings s1 and s2",
      "Length mismatch",
      "Duplicate matching prefix characters"
    ],
    "code": {
      "java": "import java.util.*;\n\npublic class Solution {\n    public boolean isInterleave(String s1, String s2, String s3) {\n        if (s1.length() + s2.length() != s3.length()) return false;\n        int m = s1.length(), n = s2.length();\n        boolean[] dp = new boolean[n + 1];\n        dp[0] = true;\n        for (int j = 1; j <= n; j++) dp[j] = dp[j - 1] && s2.charAt(j - 1) == s3.charAt(j - 1);\n        for (int i = 1; i <= m; i++) {\n            dp[0] = dp[0] && s1.charAt(i - 1) == s3.charAt(i - 1);\n            for (int j = 1; j <= n; j++) {\n                dp[j] = (dp[j] && s1.charAt(i - 1) == s3.charAt(i + j - 1)) ||\n                        (dp[j - 1] && s2.charAt(j - 1) == s3.charAt(i + j - 1));\n            }\n        }\n        return dp[n];\n    }\n}",
      "python": "class Solution:\n    def isInterleave(self, s1: str, s2: str, s3: str) -> bool:\n        if len(s1) + len(s2) != len(s3): return False\n        m, n = len(s1), len(s2)\n        dp = [False] * (n + 1)\n        dp[0] = True\n        for j in range(1, n + 1): dp[j] = dp[j - 1] and s2[j - 1] == s3[j - 1]\n        for i in range(1, m + 1):\n            dp[0] = dp[0] and s1[i - 1] == s3[i - 1]\n            for j in range(1, n + 1):\n                dp[j] = (dp[j] and s1[i - 1] == s3[i + j - 1]) or (dp[j - 1] and s2[j - 1] == s3[i + j - 1])\n        return dp[n]",
      "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    bool isInterleave(std::string s1, std::string s2, std::string s3) {\n        if (s1.size() + s2.size() != s3.size()) return false;\n        int m = s1.size(), n = s2.size();\n        std::vector<bool> dp(n + 1, false);\n        dp[0] = true;\n        for (int j = 1; j <= n; ++j) dp[j] = dp[j - 1] && s2[j - 1] == s3[j - 1];\n        for (int i = 1; i <= m; ++i) {\n            dp[0] = dp[0] && s1[i - 1] == s3[i - 1];\n            for (int j = 1; j <= n; ++j) {\n                dp[j] = (dp[j] && s1[i - 1] == s3[i + j - 1]) ||\n                        (dp[j - 1] && s2[j - 1] == s3[i + j - 1]);\n            }\n        }\n        return dp[n];\n    }\n};",
      "javascript": "function isInterleave(s1, s2, s3) {\n    if (s1.length + s2.length !== s3.length) return false;\n    const m = s1.length, n = s2.length;\n    const dp = new Array(n + 1).fill(false);\n    dp[0] = true;\n    for (let j = 1; j <= n; j++) dp[j] = dp[j - 1] && s2[j - 1] === s3[j - 1];\n    for (let i = 1; i <= m; i++) {\n        dp[0] = dp[0] && s1[i - 1] === s3[i - 1];\n        for (let j = 1; j <= n; j++) {\n            dp[j] = (dp[j] && s1[i - 1] === s3[i + j - 1]) || (dp[j - 1] && s2[j - 1] === s3[i + j - 1]);\n        }\n    }\n    return dp[n];\n}"
    },
    "interviewProTips": [
      "Start with the state transition recurrence for Interleaving String before writing space-optimized code.",
      "Verify base cases for empty or single element inputs to prevent out-of-bounds access."
    ],
    "approaches": {
      "brute": {
        "name": "Brute Force (Pure Recursion)",
        "tier": "brute",
        "badge": "\ud83e\udd49 Brute Force",
        "intuition": [
          "Formulate problem as recursive exploration of all choice branches without memoization.",
          "Re-evaluates identical subproblem states repeatedly, leading to exponential time complexity."
        ],
        "timeComplexity": "O(2^(M+N))",
        "spaceComplexity": "O(M + N)",
        "complexityExplanation": "Exhaustive recursion tree branches into O(2^(M+N)) operations.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public boolean isInterleaveBrute(String s1, String s2, String s3) {\n        if (s1.length() + s2.length() != s3.length()) return false;\n        return helper(s1, s2, s3, 0, 0, 0);\n    }\n    private boolean helper(String s1, String s2, String s3, int i, int j, int k) {\n        if (k == s3.length()) return true;\n        boolean ans = false;\n        if (i < s1.length() && s1.charAt(i) == s3.charAt(k)) ans |= helper(s1, s2, s3, i + 1, j, k + 1);\n        if (j < s2.length() && s2.charAt(j) == s3.charAt(k)) ans |= helper(s1, s2, s3, i, j + 1, k + 1);\n        return ans;\n    }\n}",
          "python": "class Solution:\n    def isInterleaveBrute(self, s1: str, s2: str, s3: str) -> bool:\n        if len(s1) + len(s2) != len(s3): return False\n        def h(i, j, k):\n            if k == len(s3): return True\n            ans = False\n            if i < len(s1) and s1[i] == s3[k]: ans |= h(i + 1, j, k + 1)\n            if j < len(s2) and s2[j] == s3[k]: ans |= h(i, j + 1, k + 1)\n            return ans\n        return h(0, 0, 0)",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    bool helper(const std::string& s1, const std::string& s2, const std::string& s3, int i, int j, int k) {\n        if (k == (int)s3.size()) return true;\n        bool ans = false;\n        if (i < (int)s1.size() && s1[i] == s3[k]) ans |= helper(s1, s2, s3, i + 1, j, k + 1);\n        if (j < (int)s2.size() && s2[j] == s3[k]) ans |= helper(s1, s2, s3, i, j + 1, k + 1);\n        return ans;\n    }\n    bool isInterleaveBrute(std::string s1, std::string s2, std::string s3) {\n        if (s1.size() + s2.size() != s3.size()) return false;\n        return helper(s1, s2, s3, 0, 0, 0);\n    }\n};",
          "javascript": "function isInterleaveBrute(s1, s2, s3) {\n    if (s1.length + s2.length !== s3.length) return false;\n    function h(i, j, k) {\n        if (k === s3.length) return true;\n        let ans = false;\n        if (i < s1.length && s1[i] === s3[k]) ans = ans || h(i + 1, j, k + 1);\n        if (j < s2.length && s2[j] === s3[k]) ans = ans || h(i, j + 1, k + 1);\n        return ans;\n    }\n    return h(0, 0, 0);\n}"
        }
      },
      "better": {
        "name": "Better (Memoized DFS / 2D DP Table)",
        "tier": "better",
        "badge": "\ud83e\udd48 Better",
        "intuition": [
          "Store previously computed subproblem states in a lookup table or matrix.",
          "If a state is already visited, return the stored value immediately in O(1) time."
        ],
        "timeComplexity": "O(M * N)",
        "spaceComplexity": "O(M * N)",
        "complexityExplanation": "Memoization evaluates each state at most once, reducing time to O(M * N).",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public boolean isInterleaveBetter(String s1, String s2, String s3) {\n        if (s1.length() + s2.length() != s3.length()) return false;\n        int m = s1.length(), n = s2.length();\n        boolean[][] dp = new boolean[m + 1][n + 1];\n        dp[0][0] = true;\n        for (int i = 1; i <= m; i++) dp[i][0] = dp[i - 1][0] && s1.charAt(i - 1) == s3.charAt(i - 1);\n        for (int j = 1; j <= n; j++) dp[0][j] = dp[0][j - 1] && s2.charAt(j - 1) == s3.charAt(j - 1);\n        for (int i = 1; i <= m; i++) {\n            for (int j = 1; j <= n; j++) {\n                dp[i][j] = (dp[i - 1][j] && s1.charAt(i - 1) == s3.charAt(i + j - 1)) ||\n                           (dp[i][j - 1] && s2.charAt(j - 1) == s3.charAt(i + j - 1));\n            }\n        }\n        return dp[m][n];\n    }\n}",
          "python": "class Solution:\n    def isInterleaveBetter(self, s1: str, s2: str, s3: str) -> bool:\n        if len(s1) + len(s2) != len(s3): return False\n        m, n = len(s1), len(s2)\n        dp = [[False] * (n + 1) for _ in range(m + 1)]\n        dp[0][0] = True\n        for i in range(1, m + 1): dp[i][0] = dp[i - 1][0] and s1[i - 1] == s3[i - 1]\n        for j in range(1, n + 1): dp[0][j] = dp[0][j - 1] and s2[j - 1] == s3[j - 1]\n        for i in range(1, m + 1):\n            for j in range(1, n + 1):\n                dp[i][j] = (dp[i - 1][j] and s1[i - 1] == s3[i + j - 1]) or (dp[i][j - 1] and s2[j - 1] == s3[i + j - 1])\n        return dp[m][n]",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    bool isInterleaveBetter(std::string s1, std::string s2, std::string s3) {\n        if (s1.size() + s2.size() != s3.size()) return false;\n        int m = s1.size(), n = s2.size();\n        std::vector<std::vector<bool>> dp(m + 1, std::vector<bool>(n + 1, false));\n        dp[0][0] = true;\n        for (int i = 1; i <= m; ++i) dp[i][0] = dp[i - 1][0] && s1[i - 1] == s3[i - 1];\n        for (int j = 1; j <= n; ++j) dp[0][j] = dp[0][j - 1] && s2[j - 1] == s3[j - 1];\n        for (int i = 1; i <= m; ++i) {\n            for (int j = 1; j <= n; ++j) {\n                dp[i][j] = (dp[i - 1][j] && s1[i - 1] == s3[i + j - 1]) ||\n                           (dp[i][j - 1] && s2[j - 1] == s3[i + j - 1]);\n            }\n        }\n        return dp[m][n];\n    }\n};",
          "javascript": "function isInterleaveBetter(s1, s2, s3) {\n    if (s1.length + s2.length !== s3.length) return false;\n    const m = s1.length, n = s2.length;\n    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(false));\n    dp[0][0] = true;\n    for (let i = 1; i <= m; i++) dp[i][0] = dp[i - 1][0] && s1[i - 1] === s3[i - 1];\n    for (let j = 1; j <= n; j++) dp[0][j] = dp[0][j - 1] && s2[j - 1] === s3[j - 1];\n    for (let i = 1; i <= m; i++) {\n        for (let j = 1; j <= n; j++) {\n            dp[i][j] = (dp[i - 1][j] && s1[i - 1] === s3[i + j - 1]) ||\n                       (dp[i][j - 1] && s2[j - 1] === s3[i + j - 1]);\n        }\n    }\n    return dp[m][n];\n}"
        }
      },
      "optimal": {
        "name": "Optimal (1D Rolling Boolean DP)",
        "tier": "optimal",
        "badge": "\ud83e\udd47 Optimal",
        "intuition": [
          "s3 is an interleaving of s1 and s2 if length(s1) + length(s2) == length(s3) and characters maintain relative order.",
          "dp[j] is true if s1[0..i-1] and s2[0..j-1] can form s3[0..i+j-1].",
          "Transition: dp[j] = (dp[j] && s1[i-1] == s3[i+j-1]) || (dp[j-1] && s2[j-1] == s3[i+j-1])."
        ],
        "pseudocode": [
          "FUNCTION isInterleave(s1, s2, s3):",
          "  IF s1.length + s2.length != s3.length: RETURN false",
          "  dp = Array(s2.length + 1, false); dp[0] = true",
          "  FOR j from 1 TO s2.length: dp[j] = dp[j-1] AND s2[j-1] == s3[j-1]",
          "  FOR i from 1 TO s1.length:",
          "    dp[0] = dp[0] AND s1[i-1] == s3[i-1]",
          "    FOR j from 1 TO s2.length:",
          "      dp[j] = (dp[j] AND s1[i-1] == s3[i+j-1]) OR (dp[j-1] AND s2[j-1] == s3[i+j-1])",
          "  RETURN dp[s2.length]"
        ],
        "timeComplexity": "O(M * N)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Optimal 1D Rolling Boolean DP achieves O(M * N) time with O(N) auxiliary space.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public boolean isInterleave(String s1, String s2, String s3) {\n        if (s1.length() + s2.length() != s3.length()) return false;\n        int m = s1.length(), n = s2.length();\n        boolean[] dp = new boolean[n + 1];\n        dp[0] = true;\n        for (int j = 1; j <= n; j++) dp[j] = dp[j - 1] && s2.charAt(j - 1) == s3.charAt(j - 1);\n        for (int i = 1; i <= m; i++) {\n            dp[0] = dp[0] && s1.charAt(i - 1) == s3.charAt(i - 1);\n            for (int j = 1; j <= n; j++) {\n                dp[j] = (dp[j] && s1.charAt(i - 1) == s3.charAt(i + j - 1)) ||\n                        (dp[j - 1] && s2.charAt(j - 1) == s3.charAt(i + j - 1));\n            }\n        }\n        return dp[n];\n    }\n}",
          "python": "class Solution:\n    def isInterleave(self, s1: str, s2: str, s3: str) -> bool:\n        if len(s1) + len(s2) != len(s3): return False\n        m, n = len(s1), len(s2)\n        dp = [False] * (n + 1)\n        dp[0] = True\n        for j in range(1, n + 1): dp[j] = dp[j - 1] and s2[j - 1] == s3[j - 1]\n        for i in range(1, m + 1):\n            dp[0] = dp[0] and s1[i - 1] == s3[i - 1]\n            for j in range(1, n + 1):\n                dp[j] = (dp[j] and s1[i - 1] == s3[i + j - 1]) or (dp[j - 1] and s2[j - 1] == s3[i + j - 1])\n        return dp[n]",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    bool isInterleave(std::string s1, std::string s2, std::string s3) {\n        if (s1.size() + s2.size() != s3.size()) return false;\n        int m = s1.size(), n = s2.size();\n        std::vector<bool> dp(n + 1, false);\n        dp[0] = true;\n        for (int j = 1; j <= n; ++j) dp[j] = dp[j - 1] && s2[j - 1] == s3[j - 1];\n        for (int i = 1; i <= m; ++i) {\n            dp[0] = dp[0] && s1[i - 1] == s3[i - 1];\n            for (int j = 1; j <= n; ++j) {\n                dp[j] = (dp[j] && s1[i - 1] == s3[i + j - 1]) ||\n                        (dp[j - 1] && s2[j - 1] == s3[i + j - 1]);\n            }\n        }\n        return dp[n];\n    }\n};",
          "javascript": "function isInterleave(s1, s2, s3) {\n    if (s1.length + s2.length !== s3.length) return false;\n    const m = s1.length, n = s2.length;\n    const dp = new Array(n + 1).fill(false);\n    dp[0] = true;\n    for (let j = 1; j <= n; j++) dp[j] = dp[j - 1] && s2[j - 1] === s3[j - 1];\n    for (let i = 1; i <= m; i++) {\n        dp[0] = dp[0] && s1[i - 1] === s3[i - 1];\n        for (let j = 1; j <= n; j++) {\n            dp[j] = (dp[j] && s1[i - 1] === s3[i + j - 1]) || (dp[j - 1] && s2[j - 1] === s3[i + j - 1]);\n        }\n    }\n    return dp[n];\n}"
        }
      }
    }
  },
  "distinct_subsequences": {
    "questionId": "archetype-distinct_subsequences",
    "pattern": "1D Space-Optimized Subsequence Counting",
    "intuition": [
      "Count number of distinct subsequences of s which equal t.",
      "If s[i-1] == t[j-1], we can either include s[i-1] or skip it: dp[j] += dp[j-1].",
      "Traverse j backwards from t.length down to 1 for 1D space optimization."
    ],
    "pseudocode": [
      "FUNCTION numDistinct(s, t):",
      "  m = s.length, n = t.length",
      "  dp = Array(n + 1, 0); dp[0] = 1",
      "  FOR i from 1 TO m:",
      "    FOR j from n DOWNTO 1:",
      "      IF s[i-1] == t[j-1]: dp[j] += dp[j-1]",
      "  RETURN dp[n]"
    ],
    "timeComplexity": "O(M * N)",
    "spaceComplexity": "O(N)",
    "complexityExplanation": "Optimal 1D Space-Optimized Subsequence Counting achieves O(M * N) time with O(N) space.",
    "edgeCases": [
      "t is longer than s (returns 0)",
      "Identical strings (returns 1)",
      "t empty string (returns 1)"
    ],
    "code": {
      "java": "import java.util.*;\n\npublic class Solution {\n    public int numDistinct(String s, String t) {\n        int m = s.length(), n = t.length();\n        int[] dp = new int[n + 1];\n        dp[0] = 1;\n        for (int i = 1; i <= m; i++) {\n            for (int j = n; j >= 1; j--) {\n                if (s.charAt(i - 1) == t.charAt(j - 1)) {\n                    dp[j] += dp[j - 1];\n                }\n            }\n        }\n        return dp[n];\n    }\n}",
      "python": "class Solution:\n    def numDistinct(self, s: str, t: str) -> int:\n        m, n = len(s), len(t)\n        dp = [0] * (n + 1)\n        dp[0] = 1\n        for i in range(1, m + 1):\n            for j in range(n, 0, -1):\n                if s[i - 1] == t[j - 1]:\n                    dp[j] += dp[j - 1]\n        return dp[n]",
      "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int numDistinct(std::string s, std::string t) {\n        int m = s.length(), n = t.length();\n        std::vector<unsigned long long> dp(n + 1, 0);\n        dp[0] = 1;\n        for (int i = 1; i <= m; ++i) {\n            for (int j = n; j >= 1; --j) {\n                if (s[i - 1] == t[j - 1]) dp[j] += dp[j - 1];\n            }\n        }\n        return (int)dp[n];\n    }\n};",
      "javascript": "function numDistinct(s, t) {\n    const m = s.length, n = t.length;\n    const dp = new Array(n + 1).fill(0);\n    dp[0] = 1;\n    for (let i = 1; i <= m; i++) {\n        for (let j = n; j >= 1; j--) {\n            if (s[i - 1] === t[j - 1]) dp[j] += dp[j - 1];\n        }\n    }\n    return dp[n];\n}"
    },
    "interviewProTips": [
      "Start with the state transition recurrence for Distinct Subsequences before writing space-optimized code.",
      "Verify base cases for empty or single element inputs to prevent out-of-bounds access."
    ],
    "approaches": {
      "brute": {
        "name": "Brute Force (Pure Recursion)",
        "tier": "brute",
        "badge": "\ud83e\udd49 Brute Force",
        "intuition": [
          "Formulate problem as recursive exploration of all choice branches without memoization.",
          "Re-evaluates identical subproblem states repeatedly, leading to exponential time complexity."
        ],
        "timeComplexity": "O(2^M)",
        "spaceComplexity": "O(M)",
        "complexityExplanation": "Exhaustive recursion tree branches into O(2^M) operations.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int numDistinctBrute(String s, String t) {\n        return helper(s, t, 0, 0);\n    }\n    private int helper(String s, String t, int i, int j) {\n        if (j == t.length()) return 1;\n        if (i == s.length()) return 0;\n        int ways = helper(s, t, i + 1, j);\n        if (s.charAt(i) == t.charAt(j)) ways += helper(s, t, i + 1, j + 1);\n        return ways;\n    }\n}",
          "python": "class Solution:\n    def numDistinctBrute(self, s: str, t: str) -> int:\n        def h(i, j):\n            if j == len(t): return 1\n            if i == len(s): return 0\n            ways = h(i + 1, j)\n            if s[i] == t[j]: ways += h(i + 1, j + 1)\n            return ways\n        return h(0, 0)",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int helper(const std::string& s, const std::string& t, int i, int j) {\n        if (j == (int)t.size()) return 1;\n        if (i == (int)s.size()) return 0;\n        int ways = helper(s, t, i + 1, j);\n        if (s[i] == t[j]) ways += helper(s, t, i + 1, j + 1);\n        return ways;\n    }\n    int numDistinctBrute(std::string s, std::string t) {\n        return helper(s, t, 0, 0);\n    }\n};",
          "javascript": "function numDistinctBrute(s, t) {\n    function h(i, j) {\n        if (j === t.length) return 1;\n        if (i === s.length) return 0;\n        let ways = h(i + 1, j);\n        if (s[i] === t[j]) ways += h(i + 1, j + 1);\n        return ways;\n    }\n    return h(0, 0);\n}"
        }
      },
      "better": {
        "name": "Better (Memoized DFS / 2D DP Table)",
        "tier": "better",
        "badge": "\ud83e\udd48 Better",
        "intuition": [
          "Store previously computed subproblem states in a lookup table or matrix.",
          "If a state is already visited, return the stored value immediately in O(1) time."
        ],
        "timeComplexity": "O(M * N)",
        "spaceComplexity": "O(M * N)",
        "complexityExplanation": "Memoization evaluates each state at most once, reducing time to O(M * N).",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int numDistinctBetter(String s, String t) {\n        int m = s.length(), n = t.length();\n        int[][] dp = new int[m + 1][n + 1];\n        for (int i = 0; i <= m; i++) dp[i][0] = 1;\n        for (int i = 1; i <= m; i++) {\n            for (int j = 1; j <= n; j++) {\n                dp[i][j] = dp[i - 1][j] + (s.charAt(i - 1) == t.charAt(j - 1) ? dp[i - 1][j - 1] : 0);\n            }\n        }\n        return dp[m][n];\n    }\n}",
          "python": "class Solution:\n    def numDistinctBetter(self, s: str, t: str) -> int:\n        m, n = len(s), len(t)\n        dp = [[0] * (n + 1) for _ in range(m + 1)]\n        for i in range(m + 1): dp[i][0] = 1\n        for i in range(1, m + 1):\n            for j in range(1, n + 1):\n                dp[i][j] = dp[i - 1][j] + (dp[i - 1][j - 1] if s[i - 1] == t[j - 1] else 0)\n        return dp[m][n]",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int numDistinctBetter(std::string s, std::string t) {\n        int m = s.length(), n = t.length();\n        std::vector<std::vector<unsigned long long>> dp(m + 1, std::vector<unsigned long long>(n + 1, 0));\n        for (int i = 0; i <= m; ++i) dp[i][0] = 1;\n        for (int i = 1; i <= m; ++i) {\n            for (int j = 1; j <= n; ++j) {\n                dp[i][j] = dp[i - 1][j] + (s[i - 1] == t[j - 1] ? dp[i - 1][j - 1] : 0);\n            }\n        }\n        return (int)dp[m][n];\n    }\n};",
          "javascript": "function numDistinctBetter(s, t) {\n    const m = s.length, n = t.length;\n    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));\n    for (let i = 0; i <= m; i++) dp[i][0] = 1;\n    for (let i = 1; i <= m; i++) {\n        for (let j = 1; j <= n; j++) {\n            dp[i][j] = dp[i - 1][j] + (s[i - 1] === t[j - 1] ? dp[i - 1][j - 1] : 0);\n        }\n    }\n    return dp[m][n];\n}"
        }
      },
      "optimal": {
        "name": "Optimal (1D Space-Optimized Subsequence Counting)",
        "tier": "optimal",
        "badge": "\ud83e\udd47 Optimal",
        "intuition": [
          "Count number of distinct subsequences of s which equal t.",
          "If s[i-1] == t[j-1], we can either include s[i-1] or skip it: dp[j] += dp[j-1].",
          "Traverse j backwards from t.length down to 1 for 1D space optimization."
        ],
        "pseudocode": [
          "FUNCTION numDistinct(s, t):",
          "  m = s.length, n = t.length",
          "  dp = Array(n + 1, 0); dp[0] = 1",
          "  FOR i from 1 TO m:",
          "    FOR j from n DOWNTO 1:",
          "      IF s[i-1] == t[j-1]: dp[j] += dp[j-1]",
          "  RETURN dp[n]"
        ],
        "timeComplexity": "O(M * N)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Optimal 1D Space-Optimized Subsequence Counting achieves O(M * N) time with O(N) auxiliary space.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int numDistinct(String s, String t) {\n        int m = s.length(), n = t.length();\n        int[] dp = new int[n + 1];\n        dp[0] = 1;\n        for (int i = 1; i <= m; i++) {\n            for (int j = n; j >= 1; j--) {\n                if (s.charAt(i - 1) == t.charAt(j - 1)) {\n                    dp[j] += dp[j - 1];\n                }\n            }\n        }\n        return dp[n];\n    }\n}",
          "python": "class Solution:\n    def numDistinct(self, s: str, t: str) -> int:\n        m, n = len(s), len(t)\n        dp = [0] * (n + 1)\n        dp[0] = 1\n        for i in range(1, m + 1):\n            for j in range(n, 0, -1):\n                if s[i - 1] == t[j - 1]:\n                    dp[j] += dp[j - 1]\n        return dp[n]",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int numDistinct(std::string s, std::string t) {\n        int m = s.length(), n = t.length();\n        std::vector<unsigned long long> dp(n + 1, 0);\n        dp[0] = 1;\n        for (int i = 1; i <= m; ++i) {\n            for (int j = n; j >= 1; --j) {\n                if (s[i - 1] == t[j - 1]) dp[j] += dp[j - 1];\n            }\n        }\n        return (int)dp[n];\n    }\n};",
          "javascript": "function numDistinct(s, t) {\n    const m = s.length, n = t.length;\n    const dp = new Array(n + 1).fill(0);\n    dp[0] = 1;\n    for (let i = 1; i <= m; i++) {\n        for (let j = n; j >= 1; j--) {\n            if (s[i - 1] === t[j - 1]) dp[j] += dp[j - 1];\n        }\n    }\n    return dp[n];\n}"
        }
      }
    }
  },
  "regular_expression_matching": {
    "questionId": "archetype-regular_expression_matching",
    "pattern": "2D / 1D Tabulation with Lookahead Regex",
    "intuition": [
      "Supports '.' (any char) and '*' (zero or more of preceding element).",
      "If p[j-1] == '*', two sub-choices:",
      "  1. Zero occurrences: dp[i][j-2]",
      "  2. One or more: if s[i-1] matches p[j-2], then dp[i-1][j].",
      "Otherwise, if s[i-1] matches p[j-1], dp[i][j] = dp[i-1][j-1]."
    ],
    "pseudocode": [
      "FUNCTION isMatch(s, p):",
      "  dp = Array(s.length + 1)(p.length + 1) filled with false; dp[0][0] = true",
      "  FOR j from 2 TO p.length: IF p[j-1] == '*': dp[0][j] = dp[0][j-2]",
      "  FOR i from 1 TO s.length:",
      "    FOR j from 1 TO p.length:",
      "      IF p[j-1] == '*':",
      "        dp[i][j] = dp[i][j-2] OR ((s[i-1] == p[j-2] OR p[j-2] == '.') AND dp[i-1][j])",
      "      ELSE IF p[j-1] == '.' OR p[j-1] == s[i-1]:",
      "        dp[i][j] = dp[i-1][j-1]",
      "  RETURN dp[s.length][p.length]"
    ],
    "timeComplexity": "O(M * N)",
    "spaceComplexity": "O(N)",
    "complexityExplanation": "Optimal 2D / 1D Tabulation with Lookahead Regex achieves O(M * N) time with O(N) space.",
    "edgeCases": [
      "Empty pattern matching non-empty string",
      "p = '.*' matching anything",
      "Multiple asterisks like 'a*b*c*'"
    ],
    "code": {
      "java": "import java.util.*;\n\npublic class Solution {\n    public boolean isMatch(String s, String p) {\n        int m = s.length(), n = p.length();\n        boolean[] dp = new boolean[n + 1];\n        dp[0] = true;\n        for (int j = 2; j <= n; j++) if (p.charAt(j - 1) == '*') dp[j] = dp[j - 2];\n        for (int i = 1; i <= m; i++) {\n            boolean prev = (i == 1);\n            dp[0] = false;\n            for (int j = 1; j <= n; j++) {\n                boolean temp = dp[j];\n                if (p.charAt(j - 1) == '*') {\n                    boolean match = (s.charAt(i - 1) == p.charAt(j - 2) || p.charAt(j - 2) == '.');\n                    dp[j] = dp[j - 2] || (match && dp[j]);\n                } else if (p.charAt(j - 1) == '.' || p.charAt(j - 1) == s.charAt(i - 1)) {\n                    dp[j] = prev;\n                } else {\n                    dp[j] = false;\n                }\n                prev = temp;\n            }\n        }\n        return dp[n];\n    }\n}",
      "python": "class Solution:\n    def isMatch(self, s: str, p: str) -> bool:\n        m, n = len(s), len(p)\n        dp = [False] * (n + 1)\n        dp[0] = True\n        for j in range(2, n + 1):\n            if p[j - 1] == '*': dp[j] = dp[j - 2]\n        for i in range(1, m + 1):\n            prev = (i == 1)\n            dp[0] = False\n            for j in range(1, n + 1):\n                temp = dp[j]\n                if p[j - 1] == '*':\n                    match = (s[i - 1] == p[j - 2] or p[j - 2] == '.')\n                    dp[j] = dp[j - 2] or (match and dp[j])\n                elif p[j - 1] == '.' or p[j - 1] == s[i - 1]:\n                    dp[j] = prev\n                else:\n                    dp[j] = False\n                prev = temp\n        return dp[n]",
      "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    bool isMatch(std::string s, std::string p) {\n        int m = s.length(), n = p.length();\n        std::vector<bool> dp(n + 1, false);\n        dp[0] = true;\n        for (int j = 2; j <= n; ++j) if (p[j - 1] == '*') dp[j] = dp[j - 2];\n        for (int i = 1; i <= m; ++i) {\n            bool prev = (i == 1);\n            dp[0] = false;\n            for (int j = 1; j <= n; ++j) {\n                bool temp = dp[j];\n                if (p[j - 1] == '*') {\n                    bool match = (s[i - 1] == p[j - 2] || p[j - 2] == '.');\n                    dp[j] = dp[j - 2] || (match && dp[j]);\n                } else if (p[j - 1] == '.' || p[j - 1] == s[i - 1]) {\n                    dp[j] = prev;\n                } else {\n                    dp[j] = false;\n                }\n                prev = temp;\n            }\n        }\n        return dp[n];\n    }\n};",
      "javascript": "function isMatch(s, p) {\n    const m = s.length, n = p.length;\n    const dp = new Array(n + 1).fill(false);\n    dp[0] = true;\n    for (let j = 2; j <= n; j++) if (p[j - 1] === '*') dp[j] = dp[j - 2];\n    for (let i = 1; i <= m; i++) {\n        let prev = (i === 1);\n        dp[0] = false;\n        for (let j = 1; j <= n; j++) {\n            const temp = dp[j];\n            if (p[j - 1] === '*') {\n                const match = s[i - 1] === p[j - 2] || p[j - 2] === '.';\n                dp[j] = dp[j - 2] || (match && dp[j]);\n            } else if (p[j - 1] === '.' || p[j - 1] === s[i - 1]) {\n                dp[j] = prev;\n            } else {\n                dp[j] = false;\n            }\n            prev = temp;\n        }\n    }\n    return dp[n];\n}"
    },
    "interviewProTips": [
      "Start with the state transition recurrence for Regular Expression Matching before writing space-optimized code.",
      "Verify base cases for empty or single element inputs to prevent out-of-bounds access."
    ],
    "approaches": {
      "brute": {
        "name": "Brute Force (Pure Recursion)",
        "tier": "brute",
        "badge": "\ud83e\udd49 Brute Force",
        "intuition": [
          "Formulate problem as recursive exploration of all choice branches without memoization.",
          "Re-evaluates identical subproblem states repeatedly, leading to exponential time complexity."
        ],
        "timeComplexity": "O(2^(M+N))",
        "spaceComplexity": "O(M + N)",
        "complexityExplanation": "Exhaustive recursion tree branches into O(2^(M+N)) operations.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public boolean isMatchBrute(String s, String p) {\n        if (p.isEmpty()) return s.isEmpty();\n        boolean firstMatch = (!s.isEmpty() && (p.charAt(0) == s.charAt(0) || p.charAt(0) == '.'));\n        if (p.length() >= 2 && p.charAt(1) == '*') {\n            return isMatchBrute(s, p.substring(2)) || (firstMatch && isMatchBrute(s.substring(1), p));\n        }\n        return firstMatch && isMatchBrute(s.substring(1), p.substring(1));\n    }\n}",
          "python": "class Solution:\n    def isMatchBrute(self, s: str, p: str) -> bool:\n        if not p: return not s\n        first_match = bool(s) and (p[0] == s[0] or p[0] == '.')\n        if len(p) >= 2 and p[1] == '*':\n            return self.isMatchBrute(s, p[2:]) or (first_match and self.isMatchBrute(s[1:], p))\n        return first_match and self.isMatchBrute(s[1:], p[1:])",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    bool isMatchBrute(std::string s, std::string p) {\n        if (p.empty()) return s.empty();\n        bool firstMatch = (!s.empty() && (p[0] == s[0] || p[0] == '.'));\n        if (p.length() >= 2 && p[1] == '*') {\n            return isMatchBrute(s, p.substr(2)) || (firstMatch && isMatchBrute(s.substr(1), p));\n        }\n        return firstMatch && isMatchBrute(s.substr(1), p.substr(1));\n    }\n};",
          "javascript": "function isMatchBrute(s, p) {\n    if (p.length === 0) return s.length === 0;\n    const firstMatch = s.length > 0 && (p[0] === s[0] || p[0] === '.');\n    if (p.length >= 2 && p[1] === '*') {\n        return isMatchBrute(s, p.substring(2)) || (firstMatch && isMatchBrute(s.substring(1), p));\n    }\n    return firstMatch && isMatchBrute(s.substring(1), p.substring(1));\n}"
        }
      },
      "better": {
        "name": "Better (Memoized DFS / 2D DP Table)",
        "tier": "better",
        "badge": "\ud83e\udd48 Better",
        "intuition": [
          "Store previously computed subproblem states in a lookup table or matrix.",
          "If a state is already visited, return the stored value immediately in O(1) time."
        ],
        "timeComplexity": "O(M * N)",
        "spaceComplexity": "O(M * N)",
        "complexityExplanation": "Memoization evaluates each state at most once, reducing time to O(M * N).",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public boolean isMatchBetter(String s, String p) {\n        int m = s.length(), n = p.length();\n        boolean[][] dp = new boolean[m + 1][n + 1];\n        dp[0][0] = true;\n        for (int j = 2; j <= n; j++) if (p.charAt(j - 1) == '*') dp[0][j] = dp[0][j - 2];\n        for (int i = 1; i <= m; i++) {\n            for (int j = 1; j <= n; j++) {\n                if (p.charAt(j - 1) == '*') {\n                    dp[i][j] = dp[i][j - 2] || ((s.charAt(i - 1) == p.charAt(j - 2) || p.charAt(j - 2) == '.') && dp[i - 1][j]);\n                } else if (p.charAt(j - 1) == '.' || p.charAt(j - 1) == s.charAt(i - 1)) {\n                    dp[i][j] = dp[i - 1][j - 1];\n                }\n            }\n        }\n        return dp[m][n];\n    }\n}",
          "python": "class Solution:\n    def isMatchBetter(self, s: str, p: str) -> bool:\n        m, n = len(s), len(p)\n        dp = [[False] * (n + 1) for _ in range(m + 1)]\n        dp[0][0] = True\n        for j in range(2, n + 1):\n            if p[j - 1] == '*': dp[0][j] = dp[0][j - 2]\n        for i in range(1, m + 1):\n            for j in range(1, n + 1):\n                if p[j - 1] == '*':\n                    dp[i][j] = dp[i][j - 2] or ((s[i - 1] == p[j - 2] or p[j - 2] == '.') and dp[i - 1][j])\n                elif p[j - 1] == '.' or p[j - 1] == s[i - 1]:\n                    dp[i][j] = dp[i - 1][j - 1]\n        return dp[m][n]",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    bool isMatchBetter(std::string s, std::string p) {\n        int m = s.length(), n = p.length();\n        std::vector<std::vector<bool>> dp(m + 1, std::vector<bool>(n + 1, false));\n        dp[0][0] = true;\n        for (int j = 2; j <= n; ++j) if (p[j - 1] == '*') dp[0][j] = dp[0][j - 2];\n        for (int i = 1; i <= m; ++i) {\n            for (int j = 1; j <= n; ++j) {\n                if (p[j - 1] == '*') {\n                    dp[i][j] = dp[i][j - 2] || ((s[i - 1] == p[j - 2] || p[j - 2] == '.') && dp[i - 1][j]);\n                } else if (p[j - 1] == '.' || p[j - 1] == s[i - 1]) {\n                    dp[i][j] = dp[i - 1][j - 1];\n                }\n            }\n        }\n        return dp[m][n];\n    }\n};",
          "javascript": "function isMatchBetter(s, p) {\n    const m = s.length, n = p.length;\n    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(false));\n    dp[0][0] = true;\n    for (let j = 2; j <= n; j++) if (p[j - 1] === '*') dp[0][j] = dp[0][j - 2];\n    for (let i = 1; i <= m; i++) {\n        for (let j = 1; j <= n; j++) {\n            if (p[j - 1] === '*') {\n                dp[i][j] = dp[i][j - 2] || ((s[i - 1] === p[j - 2] || p[j - 2] === '.') && dp[i - 1][j]);\n            } else if (p[j - 1] === '.' || p[j - 1] === s[i - 1]) {\n                dp[i][j] = dp[i - 1][j - 1];\n            }\n        }\n    }\n    return dp[m][n];\n}"
        }
      },
      "optimal": {
        "name": "Optimal (2D / 1D Tabulation with Lookahead Regex)",
        "tier": "optimal",
        "badge": "\ud83e\udd47 Optimal",
        "intuition": [
          "Supports '.' (any char) and '*' (zero or more of preceding element).",
          "If p[j-1] == '*', two sub-choices:",
          "  1. Zero occurrences: dp[i][j-2]",
          "  2. One or more: if s[i-1] matches p[j-2], then dp[i-1][j].",
          "Otherwise, if s[i-1] matches p[j-1], dp[i][j] = dp[i-1][j-1]."
        ],
        "pseudocode": [
          "FUNCTION isMatch(s, p):",
          "  dp = Array(s.length + 1)(p.length + 1) filled with false; dp[0][0] = true",
          "  FOR j from 2 TO p.length: IF p[j-1] == '*': dp[0][j] = dp[0][j-2]",
          "  FOR i from 1 TO s.length:",
          "    FOR j from 1 TO p.length:",
          "      IF p[j-1] == '*':",
          "        dp[i][j] = dp[i][j-2] OR ((s[i-1] == p[j-2] OR p[j-2] == '.') AND dp[i-1][j])",
          "      ELSE IF p[j-1] == '.' OR p[j-1] == s[i-1]:",
          "        dp[i][j] = dp[i-1][j-1]",
          "  RETURN dp[s.length][p.length]"
        ],
        "timeComplexity": "O(M * N)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Optimal 2D / 1D Tabulation with Lookahead Regex achieves O(M * N) time with O(N) auxiliary space.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public boolean isMatch(String s, String p) {\n        int m = s.length(), n = p.length();\n        boolean[] dp = new boolean[n + 1];\n        dp[0] = true;\n        for (int j = 2; j <= n; j++) if (p.charAt(j - 1) == '*') dp[j] = dp[j - 2];\n        for (int i = 1; i <= m; i++) {\n            boolean prev = (i == 1);\n            dp[0] = false;\n            for (int j = 1; j <= n; j++) {\n                boolean temp = dp[j];\n                if (p.charAt(j - 1) == '*') {\n                    boolean match = (s.charAt(i - 1) == p.charAt(j - 2) || p.charAt(j - 2) == '.');\n                    dp[j] = dp[j - 2] || (match && dp[j]);\n                } else if (p.charAt(j - 1) == '.' || p.charAt(j - 1) == s.charAt(i - 1)) {\n                    dp[j] = prev;\n                } else {\n                    dp[j] = false;\n                }\n                prev = temp;\n            }\n        }\n        return dp[n];\n    }\n}",
          "python": "class Solution:\n    def isMatch(self, s: str, p: str) -> bool:\n        m, n = len(s), len(p)\n        dp = [False] * (n + 1)\n        dp[0] = True\n        for j in range(2, n + 1):\n            if p[j - 1] == '*': dp[j] = dp[j - 2]\n        for i in range(1, m + 1):\n            prev = (i == 1)\n            dp[0] = False\n            for j in range(1, n + 1):\n                temp = dp[j]\n                if p[j - 1] == '*':\n                    match = (s[i - 1] == p[j - 2] or p[j - 2] == '.')\n                    dp[j] = dp[j - 2] or (match and dp[j])\n                elif p[j - 1] == '.' or p[j - 1] == s[i - 1]:\n                    dp[j] = prev\n                else:\n                    dp[j] = False\n                prev = temp\n        return dp[n]",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    bool isMatch(std::string s, std::string p) {\n        int m = s.length(), n = p.length();\n        std::vector<bool> dp(n + 1, false);\n        dp[0] = true;\n        for (int j = 2; j <= n; ++j) if (p[j - 1] == '*') dp[j] = dp[j - 2];\n        for (int i = 1; i <= m; ++i) {\n            bool prev = (i == 1);\n            dp[0] = false;\n            for (int j = 1; j <= n; ++j) {\n                bool temp = dp[j];\n                if (p[j - 1] == '*') {\n                    bool match = (s[i - 1] == p[j - 2] || p[j - 2] == '.');\n                    dp[j] = dp[j - 2] || (match && dp[j]);\n                } else if (p[j - 1] == '.' || p[j - 1] == s[i - 1]) {\n                    dp[j] = prev;\n                } else {\n                    dp[j] = false;\n                }\n                prev = temp;\n            }\n        }\n        return dp[n];\n    }\n};",
          "javascript": "function isMatch(s, p) {\n    const m = s.length, n = p.length;\n    const dp = new Array(n + 1).fill(false);\n    dp[0] = true;\n    for (let j = 2; j <= n; j++) if (p[j - 1] === '*') dp[j] = dp[j - 2];\n    for (let i = 1; i <= m; i++) {\n        let prev = (i === 1);\n        dp[0] = false;\n        for (let j = 1; j <= n; j++) {\n            const temp = dp[j];\n            if (p[j - 1] === '*') {\n                const match = s[i - 1] === p[j - 2] || p[j - 2] === '.';\n                dp[j] = dp[j - 2] || (match && dp[j]);\n            } else if (p[j - 1] === '.' || p[j - 1] === s[i - 1]) {\n                dp[j] = prev;\n            } else {\n                dp[j] = false;\n            }\n            prev = temp;\n        }\n    }\n    return dp[n];\n}"
        }
      }
    }
  },
  "burst_balloons": {
    "questionId": "archetype-burst_balloons",
    "pattern": "Interval DP (Last Balloon to Burst)",
    "intuition": [
      "Instead of choosing which balloon to burst first, choose which balloon k to burst LAST in range (i, j).",
      "This keeps subproblems independent: balloons outside (i, j) remain intact until k bursts.",
      "Coins obtained by bursting k last: nums[i] * nums[k] * nums[j] + dp[i][k] + dp[k][j]."
    ],
    "pseudocode": [
      "FUNCTION maxCoins(nums):",
      "  A = [1, ...nums, 1]",
      "  dp = 2D Array A.length x A.length filled with 0",
      "  FOR len from 1 TO nums.length:",
      "    FOR i from 1 TO nums.length - len + 1:",
      "      j = i + len - 1",
      "      FOR k from i TO j:",
      "        dp[i][j] = MAX(dp[i][j], A[i-1]*A[k]*A[j+1] + dp[i][k-1] + dp[k+1][j])",
      "  RETURN dp[1][nums.length]"
    ],
    "timeComplexity": "O(N\u00b3)",
    "spaceComplexity": "O(N\u00b2)",
    "complexityExplanation": "Optimal Interval DP (Last Balloon to Burst) achieves O(N\u00b3) time with O(N\u00b2) space.",
    "edgeCases": [
      "Single balloon (returns nums[0])",
      "All balloons value 1",
      "Two balloons"
    ],
    "code": {
      "java": "import java.util.*;\n\npublic class Solution {\n    public int maxCoins(int[] nums) {\n        int n = nums.length;\n        int[] arr = new int[n + 2];\n        arr[0] = 1; arr[n + 1] = 1;\n        for (int i = 0; i < n; i++) arr[i + 1] = nums[i];\n        int[][] dp = new int[n + 2][n + 2];\n        for (int len = 1; len <= n; len++) {\n            for (int i = 1; i <= n - len + 1; i++) {\n                int j = i + len - 1;\n                for (int k = i; k <= j; k++) {\n                    dp[i][j] = Math.max(dp[i][j], arr[i - 1] * arr[k] * arr[j + 1] + dp[i][k - 1] + dp[k + 1][j]);\n                }\n            }\n        }\n        return dp[1][n];\n    }\n}",
      "python": "class Solution:\n    def maxCoins(self, nums: list[int]) -> int:\n        n = len(nums)\n        arr = [1] + nums + [1]\n        dp = [[0] * (n + 2) for _ in range(n + 2)]\n        for length in range(1, n + 1):\n            for i in range(1, n - length + 2):\n                j = i + length - 1\n                for k in range(i, j + 1):\n                    dp[i][j] = max(dp[i][j], arr[i - 1] * arr[k] * arr[j + 1] + dp[i][k - 1] + dp[k + 1][j])\n        return dp[1][n]",
      "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int maxCoins(std::vector<int>& nums) {\n        int n = nums.size();\n        std::vector<int> arr(n + 2, 1);\n        for (int i = 0; i < n; ++i) arr[i + 1] = nums[i];\n        std::vector<std::vector<int>> dp(n + 2, std::vector<int>(n + 2, 0));\n        for (int len = 1; len <= n; ++len) {\n            for (int i = 1; i <= n - len + 1; ++i) {\n                int j = i + len - 1;\n                for (int k = i; k <= j; ++k) {\n                    dp[i][j] = std::max(dp[i][j], arr[i - 1] * arr[k] * arr[j + 1] + dp[i][k - 1] + dp[k + 1][j]);\n                }\n            }\n        }\n        return dp[1][n];\n    }\n};",
      "javascript": "function maxCoins(nums) {\n    const n = nums.length;\n    const arr = [1, ...nums, 1];\n    const dp = Array.from({ length: n + 2 }, () => new Array(n + 2).fill(0));\n    for (let len = 1; len <= n; len++) {\n        for (let i = 1; i <= n - len + 1; i++) {\n            const j = i + len - 1;\n            for (let k = i; k <= j; k++) {\n                dp[i][j] = Math.max(dp[i][j], arr[i - 1] * arr[k] * arr[j + 1] + dp[i][k - 1] + dp[k + 1][j]);\n            }\n        }\n    }\n    return dp[1][n];\n}"
    },
    "interviewProTips": [
      "Start with the state transition recurrence for Burst Balloons before writing space-optimized code.",
      "Verify base cases for empty or single element inputs to prevent out-of-bounds access."
    ],
    "approaches": {
      "brute": {
        "name": "Brute Force (Pure Recursion)",
        "tier": "brute",
        "badge": "\ud83e\udd49 Brute Force",
        "intuition": [
          "Formulate problem as recursive exploration of all choice branches without memoization.",
          "Re-evaluates identical subproblem states repeatedly, leading to exponential time complexity."
        ],
        "timeComplexity": "O(N!)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Exhaustive recursion tree branches into O(N!) operations.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int maxCoinsBrute(int[] nums) {\n        List<Integer> list = new ArrayList<>();\n        for (int x : nums) list.add(x);\n        return solveRec(list);\n    }\n    private int solveRec(List<Integer> list) {\n        if (list.isEmpty()) return 0;\n        int max = 0;\n        for (int i = 0; i < list.size(); i++) {\n            int left = (i == 0) ? 1 : list.get(i - 1);\n            int right = (i == list.size() - 1) ? 1 : list.get(i + 1);\n            int coins = left * list.get(i) * right;\n            int removed = list.remove(i);\n            coins += solveRec(list);\n            list.add(i, removed);\n            max = Math.max(max, coins);\n        }\n        return max;\n    }\n}",
          "python": "class Solution:\n    def maxCoinsBrute(self, nums: list[int]) -> int:\n        def solve(arr):\n            if not arr: return 0\n            res = 0\n            for i in range(len(arr)):\n                left = 1 if i == 0 else arr[i - 1]\n                right = 1 if i == len(arr) - 1 else arr[i + 1]\n                coins = left * arr[i] * right + solve(arr[:i] + arr[i+1:])\n                res = max(res, coins)\n            return res\n        return solve(nums)",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int solveRec(std::vector<int> arr) {\n        if (arr.empty()) return 0;\n        int maxCoins = 0;\n        for (size_t i = 0; i < arr.size(); ++i) {\n            int left = (i == 0) ? 1 : arr[i - 1];\n            int right = (i == arr.size() - 1) ? 1 : arr[i + 1];\n            int coins = left * arr[i] * right;\n            std::vector<int> rem = arr;\n            rem.erase(rem.begin() + i);\n            coins += solveRec(rem);\n            maxCoins = std::max(maxCoins, coins);\n        }\n        return maxCoins;\n    }\n    int maxCoinsBrute(std::vector<int>& nums) {\n        return solveRec(nums);\n    }\n};",
          "javascript": "function maxCoinsBrute(nums) {\n    function solve(arr) {\n        if (arr.length === 0) return 0;\n        let max = 0;\n        for (let i = 0; i < arr.length; i++) {\n            const left = i === 0 ? 1 : arr[i - 1];\n            const right = i === arr.length - 1 ? 1 : arr[i + 1];\n            const coins = left * arr[i] * right + solve([...arr.slice(0, i), ...arr.slice(i + 1)]);\n            max = Math.max(max, coins);\n        }\n        return max;\n    }\n    return solve(nums);\n}"
        }
      },
      "better": {
        "name": "Better (Memoized DFS / 2D DP Table)",
        "tier": "better",
        "badge": "\ud83e\udd48 Better",
        "intuition": [
          "Store previously computed subproblem states in a lookup table or matrix.",
          "If a state is already visited, return the stored value immediately in O(1) time."
        ],
        "timeComplexity": "O(N\u00b3)",
        "spaceComplexity": "O(N\u00b2)",
        "complexityExplanation": "Memoization evaluates each state at most once, reducing time to O(N\u00b3).",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int maxCoinsBetter(int[] nums) {\n        int n = nums.length;\n        int[] arr = new int[n + 2];\n        arr[0] = 1; arr[n + 1] = 1;\n        for (int i = 0; i < n; i++) arr[i + 1] = nums[i];\n        int[][] memo = new int[n + 2][n + 2];\n        return dfs(arr, 1, n, memo);\n    }\n    private int dfs(int[] arr, int i, int j, int[][] memo) {\n        if (i > j) return 0;\n        if (memo[i][j] != 0) return memo[i][j];\n        int max = 0;\n        for (int k = i; k <= j; k++) {\n            int coins = arr[i - 1] * arr[k] * arr[j + 1] + dfs(arr, i, k - 1, memo) + dfs(arr, k + 1, j, memo);\n            max = Math.max(max, coins);\n        }\n        return memo[i][j] = max;\n    }\n}",
          "python": "class Solution:\n    def maxCoinsBetter(self, nums: list[int]) -> int:\n        arr = [1] + nums + [1]\n        memo = {}\n        def dfs(i, j):\n            if i > j: return 0\n            if (i, j) in memo: return memo[(i, j)]\n            res = 0\n            for k in range(i, j + 1):\n                res = max(res, arr[i - 1] * arr[k] * arr[j + 1] + dfs(i, k - 1) + dfs(k + 1, j))\n            memo[(i, j)] = res\n            return res\n        return dfs(1, len(nums))",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int dfs(const std::vector<int>& arr, int i, int j, std::vector<std::vector<int>>& memo) {\n        if (i > j) return 0;\n        if (memo[i][j] != 0) return memo[i][j];\n        int maxCoins = 0;\n        for (int k = i; k <= j; ++k) {\n            int coins = arr[i - 1] * arr[k] * arr[j + 1] + dfs(arr, i, k - 1, memo) + dfs(arr, k + 1, j, memo);\n            maxCoins = std::max(maxCoins, coins);\n        }\n        return memo[i][j] = maxCoins;\n    }\n    int maxCoinsBetter(std::vector<int>& nums) {\n        int n = nums.size();\n        std::vector<int> arr(n + 2, 1);\n        for (int i = 0; i < n; ++i) arr[i + 1] = nums[i];\n        std::vector<std::vector<int>> memo(n + 2, std::vector<int>(n + 2, 0));\n        return dfs(arr, 1, n, memo);\n    }\n};",
          "javascript": "function maxCoinsBetter(nums) {\n    const arr = [1, ...nums, 1];\n    const n = nums.length;\n    const memo = Array.from({ length: n + 2 }, () => new Array(n + 2).fill(0));\n    function dfs(i, j) {\n        if (i > j) return 0;\n        if (memo[i][j] !== 0) return memo[i][j];\n        let max = 0;\n        for (let k = i; k <= j; k++) {\n            const coins = arr[i - 1] * arr[k] * arr[j + 1] + dfs(i, k - 1) + dfs(k + 1, j);\n            max = Math.max(max, coins);\n        }\n        return memo[i][j] = max;\n    }\n    return dfs(1, n);\n}"
        }
      },
      "optimal": {
        "name": "Optimal (Interval DP (Last Balloon to Burst))",
        "tier": "optimal",
        "badge": "\ud83e\udd47 Optimal",
        "intuition": [
          "Instead of choosing which balloon to burst first, choose which balloon k to burst LAST in range (i, j).",
          "This keeps subproblems independent: balloons outside (i, j) remain intact until k bursts.",
          "Coins obtained by bursting k last: nums[i] * nums[k] * nums[j] + dp[i][k] + dp[k][j]."
        ],
        "pseudocode": [
          "FUNCTION maxCoins(nums):",
          "  A = [1, ...nums, 1]",
          "  dp = 2D Array A.length x A.length filled with 0",
          "  FOR len from 1 TO nums.length:",
          "    FOR i from 1 TO nums.length - len + 1:",
          "      j = i + len - 1",
          "      FOR k from i TO j:",
          "        dp[i][j] = MAX(dp[i][j], A[i-1]*A[k]*A[j+1] + dp[i][k-1] + dp[k+1][j])",
          "  RETURN dp[1][nums.length]"
        ],
        "timeComplexity": "O(N\u00b3)",
        "spaceComplexity": "O(N\u00b2)",
        "complexityExplanation": "Optimal Interval DP (Last Balloon to Burst) achieves O(N\u00b3) time with O(N\u00b2) auxiliary space.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int maxCoins(int[] nums) {\n        int n = nums.length;\n        int[] arr = new int[n + 2];\n        arr[0] = 1; arr[n + 1] = 1;\n        for (int i = 0; i < n; i++) arr[i + 1] = nums[i];\n        int[][] dp = new int[n + 2][n + 2];\n        for (int len = 1; len <= n; len++) {\n            for (int i = 1; i <= n - len + 1; i++) {\n                int j = i + len - 1;\n                for (int k = i; k <= j; k++) {\n                    dp[i][j] = Math.max(dp[i][j], arr[i - 1] * arr[k] * arr[j + 1] + dp[i][k - 1] + dp[k + 1][j]);\n                }\n            }\n        }\n        return dp[1][n];\n    }\n}",
          "python": "class Solution:\n    def maxCoins(self, nums: list[int]) -> int:\n        n = len(nums)\n        arr = [1] + nums + [1]\n        dp = [[0] * (n + 2) for _ in range(n + 2)]\n        for length in range(1, n + 1):\n            for i in range(1, n - length + 2):\n                j = i + length - 1\n                for k in range(i, j + 1):\n                    dp[i][j] = max(dp[i][j], arr[i - 1] * arr[k] * arr[j + 1] + dp[i][k - 1] + dp[k + 1][j])\n        return dp[1][n]",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int maxCoins(std::vector<int>& nums) {\n        int n = nums.size();\n        std::vector<int> arr(n + 2, 1);\n        for (int i = 0; i < n; ++i) arr[i + 1] = nums[i];\n        std::vector<std::vector<int>> dp(n + 2, std::vector<int>(n + 2, 0));\n        for (int len = 1; len <= n; ++len) {\n            for (int i = 1; i <= n - len + 1; ++i) {\n                int j = i + len - 1;\n                for (int k = i; k <= j; ++k) {\n                    dp[i][j] = std::max(dp[i][j], arr[i - 1] * arr[k] * arr[j + 1] + dp[i][k - 1] + dp[k + 1][j]);\n                }\n            }\n        }\n        return dp[1][n];\n    }\n};",
          "javascript": "function maxCoins(nums) {\n    const n = nums.length;\n    const arr = [1, ...nums, 1];\n    const dp = Array.from({ length: n + 2 }, () => new Array(n + 2).fill(0));\n    for (let len = 1; len <= n; len++) {\n        for (let i = 1; i <= n - len + 1; i++) {\n            const j = i + len - 1;\n            for (let k = i; k <= j; k++) {\n                dp[i][j] = Math.max(dp[i][j], arr[i - 1] * arr[k] * arr[j + 1] + dp[i][k - 1] + dp[k + 1][j]);\n            }\n        }\n    }\n    return dp[1][n];\n}"
        }
      }
    }
  },
  "egg_dropping": {
    "questionId": "archetype-egg_dropping",
    "pattern": "Inverted DP (Moves vs Floors with 1D Array)",
    "intuition": [
      "Traditional dp[k][n] represents min moves for k eggs and n floors (O(K*N\u00b2)).",
      "Optimal Inversion: Let dp[m][k] represent maximum floors testable with m moves and k eggs.",
      "Recurrence: dp[m][k] = dp[m-1][k-1] (egg breaks) + dp[m-1][k] (egg survives) + 1 (current floor).",
      "Space compresses into a 1D array of size k + 1."
    ],
    "pseudocode": [
      "FUNCTION superEggDrop(k, n):",
      "  dp = Array(k + 1, 0); m = 0",
      "  WHILE dp[k] < n:",
      "    m++",
      "    FOR i from k DOWNTO 1: dp[i] = dp[i] + dp[i - 1] + 1",
      "  RETURN m"
    ],
    "timeComplexity": "O(K * log N)",
    "spaceComplexity": "O(K)",
    "complexityExplanation": "Optimal Inverted DP (Moves vs Floors with 1D Array) achieves O(K * log N) time with O(K) space.",
    "edgeCases": [
      "k = 1 egg (requires n moves)",
      "n = 0 floors (0 moves)",
      "n = 1 floor (1 move)"
    ],
    "code": {
      "java": "import java.util.*;\n\npublic class Solution {\n    public int superEggDrop(int k, int n) {\n        int[] dp = new int[k + 1];\n        int m = 0;\n        while (dp[k] < n) {\n            m++;\n            for (int i = k; i >= 1; i--) {\n                dp[i] = dp[i] + dp[i - 1] + 1;\n            }\n        }\n        return m;\n    }\n}",
      "python": "class Solution:\n    def superEggDrop(self, k: int, n: int) -> int:\n        dp = [0] * (k + 1)\n        m = 0\n        while dp[k] < n:\n            m += 1\n            for i in range(k, 0, -1):\n                dp[i] = dp[i] + dp[i - 1] + 1\n        return m",
      "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int superEggDrop(int k, int n) {\n        std::vector<int> dp(k + 1, 0);\n        int m = 0;\n        while (dp[k] < n) {\n            m++;\n            for (int i = k; i >= 1; --i) {\n                dp[i] = dp[i] + dp[i - 1] + 1;\n            }\n        }\n        return m;\n    }\n};",
      "javascript": "function superEggDrop(k, n) {\n    const dp = new Array(k + 1).fill(0);\n    let m = 0;\n    while (dp[k] < n) {\n        m++;\n        for (let i = k; i >= 1; i--) {\n            dp[i] = dp[i] + dp[i - 1] + 1;\n        }\n    }\n    return m;\n}"
    },
    "interviewProTips": [
      "Start with the state transition recurrence for Super Egg Drop before writing space-optimized code.",
      "Verify base cases for empty or single element inputs to prevent out-of-bounds access."
    ],
    "approaches": {
      "brute": {
        "name": "Brute Force (Pure Recursion)",
        "tier": "brute",
        "badge": "\ud83e\udd49 Brute Force",
        "intuition": [
          "Formulate problem as recursive exploration of all choice branches without memoization.",
          "Re-evaluates identical subproblem states repeatedly, leading to exponential time complexity."
        ],
        "timeComplexity": "O(2\u207f)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Exhaustive recursion tree branches into O(2\u207f) operations.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int superEggDropBrute(int k, int n) {\n        if (n <= 1 || k == 1) return n;\n        int minMoves = Integer.MAX_VALUE;\n        for (int x = 1; x <= n; x++) {\n            int moves = 1 + Math.max(superEggDropBrute(k - 1, x - 1), superEggDropBrute(k, n - x));\n            minMoves = Math.min(minMoves, moves);\n        }\n        return minMoves;\n    }\n}",
          "python": "class Solution:\n    def superEggDropBrute(self, k: int, n: int) -> int:\n        if n <= 1 or k == 1: return n\n        res = float('inf')\n        for x in range(1, n + 1):\n            moves = 1 + max(self.superEggDropBrute(k - 1, x - 1), self.superEggDropBrute(k, n - x))\n            res = min(res, moves)\n        return res",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int superEggDropBrute(int k, int n) {\n        if (n <= 1 || k == 1) return n;\n        int minMoves = 1e9;\n        for (int x = 1; x <= n; ++x) {\n            int moves = 1 + std::max(superEggDropBrute(k - 1, x - 1), superEggDropBrute(k, n - x));\n            minMoves = std::min(minMoves, moves);\n        }\n        return minMoves;\n    }\n};",
          "javascript": "function superEggDropBrute(k, n) {\n    if (n <= 1 || k === 1) return n;\n    let minMoves = Infinity;\n    for (let x = 1; x <= n; x++) {\n        const moves = 1 + Math.max(superEggDropBrute(k - 1, x - 1), superEggDropBrute(k, n - x));\n        minMoves = Math.min(minMoves, moves);\n    }\n    return minMoves;\n}"
        }
      },
      "better": {
        "name": "Better (Memoized DFS / 2D DP Table)",
        "tier": "better",
        "badge": "\ud83e\udd48 Better",
        "intuition": [
          "Store previously computed subproblem states in a lookup table or matrix.",
          "If a state is already visited, return the stored value immediately in O(1) time."
        ],
        "timeComplexity": "O(K * N)",
        "spaceComplexity": "O(K * N)",
        "complexityExplanation": "Memoization evaluates each state at most once, reducing time to O(K * N).",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int superEggDropBetter(int k, int n) {\n        int[][] memo = new int[k + 1][n + 1];\n        return dfs(k, n, memo);\n    }\n    private int dfs(int k, int n, int[][] memo) {\n        if (n <= 1 || k == 1) return n;\n        if (memo[k][n] != 0) return memo[k][n];\n        int low = 1, high = n, ans = n;\n        while (low <= high) {\n            int mid = (low + high) / 2;\n            int broken = dfs(k - 1, mid - 1, memo);\n            int notBroken = dfs(k, n - mid, memo);\n            if (broken > notBroken) {\n                ans = Math.min(ans, broken + 1);\n                high = mid - 1;\n            } else {\n                ans = Math.min(ans, notBroken + 1);\n                low = mid + 1;\n            }\n        }\n        return memo[k][n] = ans;\n    }\n}",
          "python": "class Solution:\n    def superEggDropBetter(self, k: int, n: int) -> int:\n        memo = {}\n        def dfs(eggs, floors):\n            if floors <= 1 or eggs == 1: return floors\n            if (eggs, floors) in memo: return memo[(eggs, floors)]\n            low, high, ans = 1, floors, floors\n            while low <= high:\n                mid = (low + high) // 2\n                broken = dfs(eggs - 1, mid - 1)\n                not_broken = dfs(eggs, floors - mid)\n                if broken > not_broken:\n                    ans = min(ans, broken + 1)\n                    high = mid - 1\n                else:\n                    ans = min(ans, not_broken + 1)\n                    low = mid + 1\n            memo[(eggs, floors)] = ans\n            return ans\n        return dfs(k, n)",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int dfs(int k, int n, std::vector<std::vector<int>>& memo) {\n        if (n <= 1 || k == 1) return n;\n        if (memo[k][n] != 0) return memo[k][n];\n        int low = 1, high = n, ans = n;\n        while (low <= high) {\n            int mid = (low + high) / 2;\n            int broken = dfs(k - 1, mid - 1, memo);\n            int notBroken = dfs(k, n - mid, memo);\n            if (broken > notBroken) {\n                ans = std::min(ans, broken + 1);\n                high = mid - 1;\n            } else {\n                ans = std::min(ans, notBroken + 1);\n                low = mid + 1;\n            }\n        }\n        return memo[k][n] = ans;\n    }\n    int superEggDropBetter(int k, int n) {\n        std::vector<std::vector<int>> memo(k + 1, std::vector<int>(n + 1, 0));\n        return dfs(k, n, memo);\n    }\n};",
          "javascript": "function superEggDropBetter(k, n) {\n    const memo = Array.from({ length: k + 1 }, () => new Array(n + 1).fill(0));\n    function dfs(eggs, floors) {\n        if (floors <= 1 || eggs === 1) return floors;\n        if (memo[eggs][floors] !== 0) return memo[eggs][floors];\n        let low = 1, high = floors, ans = floors;\n        while (low <= high) {\n            const mid = Math.floor((low + high) / 2);\n            const broken = dfs(eggs - 1, mid - 1);\n            const notBroken = dfs(eggs, floors - mid);\n            if (broken > notBroken) {\n                ans = Math.min(ans, broken + 1);\n                high = mid - 1;\n            } else {\n                ans = Math.min(ans, notBroken + 1);\n                low = mid + 1;\n            }\n        }\n        return memo[eggs][floors] = ans;\n    }\n    return dfs(k, n);\n}"
        }
      },
      "optimal": {
        "name": "Optimal (Inverted DP (Moves vs Floors with 1D Array))",
        "tier": "optimal",
        "badge": "\ud83e\udd47 Optimal",
        "intuition": [
          "Traditional dp[k][n] represents min moves for k eggs and n floors (O(K*N\u00b2)).",
          "Optimal Inversion: Let dp[m][k] represent maximum floors testable with m moves and k eggs.",
          "Recurrence: dp[m][k] = dp[m-1][k-1] (egg breaks) + dp[m-1][k] (egg survives) + 1 (current floor).",
          "Space compresses into a 1D array of size k + 1."
        ],
        "pseudocode": [
          "FUNCTION superEggDrop(k, n):",
          "  dp = Array(k + 1, 0); m = 0",
          "  WHILE dp[k] < n:",
          "    m++",
          "    FOR i from k DOWNTO 1: dp[i] = dp[i] + dp[i - 1] + 1",
          "  RETURN m"
        ],
        "timeComplexity": "O(K * log N)",
        "spaceComplexity": "O(K)",
        "complexityExplanation": "Optimal Inverted DP (Moves vs Floors with 1D Array) achieves O(K * log N) time with O(K) auxiliary space.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int superEggDrop(int k, int n) {\n        int[] dp = new int[k + 1];\n        int m = 0;\n        while (dp[k] < n) {\n            m++;\n            for (int i = k; i >= 1; i--) {\n                dp[i] = dp[i] + dp[i - 1] + 1;\n            }\n        }\n        return m;\n    }\n}",
          "python": "class Solution:\n    def superEggDrop(self, k: int, n: int) -> int:\n        dp = [0] * (k + 1)\n        m = 0\n        while dp[k] < n:\n            m += 1\n            for i in range(k, 0, -1):\n                dp[i] = dp[i] + dp[i - 1] + 1\n        return m",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int superEggDrop(int k, int n) {\n        std::vector<int> dp(k + 1, 0);\n        int m = 0;\n        while (dp[k] < n) {\n            m++;\n            for (int i = k; i >= 1; --i) {\n                dp[i] = dp[i] + dp[i - 1] + 1;\n            }\n        }\n        return m;\n    }\n};",
          "javascript": "function superEggDrop(k, n) {\n    const dp = new Array(k + 1).fill(0);\n    let m = 0;\n    while (dp[k] < n) {\n        m++;\n        for (let i = k; i >= 1; i--) {\n            dp[i] = dp[i] + dp[i - 1] + 1;\n        }\n    }\n    return m;\n}"
        }
      }
    }
  },
  "climbing_stairs": {
    "questionId": "archetype-climbing_stairs",
    "pattern": "Fibonacci Constant Space Rolling State",
    "intuition": [
      "Each time you can climb 1 or 2 steps.",
      "Ways to reach step i = ways to reach (i-1) + ways to reach (i-2).",
      "Identical to Fibonacci sequence, solvable in O(1) space with two variables."
    ],
    "pseudocode": [
      "FUNCTION climbStairs(n):",
      "  IF n <= 2: RETURN n",
      "  prev2 = 1, prev1 = 2",
      "  FOR i from 3 TO n:",
      "    curr = prev1 + prev2",
      "    prev2 = prev1; prev1 = curr",
      "  RETURN prev1"
    ],
    "timeComplexity": "O(N)",
    "spaceComplexity": "O(1)",
    "complexityExplanation": "Optimal Fibonacci Constant Space Rolling State achieves O(N) time with O(1) space.",
    "edgeCases": [
      "n = 1",
      "n = 2",
      "Large n"
    ],
    "code": {
      "java": "import java.util.*;\n\npublic class Solution {\n    public int climbStairs(int n) {\n        if (n <= 2) return n;\n        int prev2 = 1, prev1 = 2;\n        for (int i = 3; i <= n; i++) {\n            int curr = prev1 + prev2;\n            prev2 = prev1;\n            prev1 = curr;\n        }\n        return prev1;\n    }\n}",
      "python": "class Solution:\n    def climbStairs(self, n: int) -> int:\n        if n <= 2: return n\n        p2, p1 = 1, 2\n        for _ in range(3, n + 1):\n            p2, p1 = p1, p1 + p2\n        return p1",
      "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int climbStairs(int n) {\n        if (n <= 2) return n;\n        int prev2 = 1, prev1 = 2;\n        for (int i = 3; i <= n; ++i) {\n            int curr = prev1 + prev2;\n            prev2 = prev1;\n            prev1 = curr;\n        }\n        return prev1;\n    }\n};",
      "javascript": "function climbStairs(n) {\n    if (n <= 2) return n;\n    let prev2 = 1, prev1 = 2;\n    for (let i = 3; i <= n; i++) {\n        const curr = prev1 + prev2;\n        prev2 = prev1;\n        prev1 = curr;\n    }\n    return prev1;\n}"
    },
    "interviewProTips": [
      "Start with the state transition recurrence for Climbing Stairs before writing space-optimized code.",
      "Verify base cases for empty or single element inputs to prevent out-of-bounds access."
    ],
    "approaches": {
      "brute": {
        "name": "Brute Force (Pure Recursion)",
        "tier": "brute",
        "badge": "\ud83e\udd49 Brute Force",
        "intuition": [
          "Formulate problem as recursive exploration of all choice branches without memoization.",
          "Re-evaluates identical subproblem states repeatedly, leading to exponential time complexity."
        ],
        "timeComplexity": "O(2\u207f)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Exhaustive recursion tree branches into O(2\u207f) operations.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int climbStairsBrute(int n) {\n        if (n <= 2) return n;\n        return climbStairsBrute(n - 1) + climbStairsBrute(n - 2);\n    }\n}",
          "python": "class Solution:\n    def climbStairsBrute(self, n: int) -> int:\n        if n <= 2: return n\n        return self.climbStairsBrute(n - 1) + self.climbStairsBrute(n - 2)",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int climbStairsBrute(int n) {\n        if (n <= 2) return n;\n        return climbStairsBrute(n - 1) + climbStairsBrute(n - 2);\n    }\n};",
          "javascript": "function climbStairsBrute(n) {\n    if (n <= 2) return n;\n    return climbStairsBrute(n - 1) + climbStairsBrute(n - 2);\n}"
        }
      },
      "better": {
        "name": "Better (Memoized DFS / 2D DP Table)",
        "tier": "better",
        "badge": "\ud83e\udd48 Better",
        "intuition": [
          "Store previously computed subproblem states in a lookup table or matrix.",
          "If a state is already visited, return the stored value immediately in O(1) time."
        ],
        "timeComplexity": "O(N)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Memoization evaluates each state at most once, reducing time to O(N).",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int climbStairsBetter(int n) {\n        if (n <= 2) return n;\n        int[] dp = new int[n + 1];\n        dp[1] = 1; dp[2] = 2;\n        for (int i = 3; i <= n; i++) dp[i] = dp[i - 1] + dp[i - 2];\n        return dp[n];\n    }\n}",
          "python": "class Solution:\n    def climbStairsBetter(self, n: int) -> int:\n        if n <= 2: return n\n        dp = [0] * (n + 1)\n        dp[1], dp[2] = 1, 2\n        for i in range(3, n + 1):\n            dp[i] = dp[i - 1] + dp[i - 2]\n        return dp[n]",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int climbStairsBetter(int n) {\n        if (n <= 2) return n;\n        std::vector<int> dp(n + 1);\n        dp[1] = 1; dp[2] = 2;\n        for (int i = 3; i <= n; ++i) dp[i] = dp[i - 1] + dp[i - 2];\n        return dp[n];\n    }\n};",
          "javascript": "function climbStairsBetter(n) {\n    if (n <= 2) return n;\n    const dp = new Array(n + 1);\n    dp[1] = 1; dp[2] = 2;\n    for (let i = 3; i <= n; i++) dp[i] = dp[i - 1] + dp[i - 2];\n    return dp[n];\n}"
        }
      },
      "optimal": {
        "name": "Optimal (Fibonacci Constant Space Rolling State)",
        "tier": "optimal",
        "badge": "\ud83e\udd47 Optimal",
        "intuition": [
          "Each time you can climb 1 or 2 steps.",
          "Ways to reach step i = ways to reach (i-1) + ways to reach (i-2).",
          "Identical to Fibonacci sequence, solvable in O(1) space with two variables."
        ],
        "pseudocode": [
          "FUNCTION climbStairs(n):",
          "  IF n <= 2: RETURN n",
          "  prev2 = 1, prev1 = 2",
          "  FOR i from 3 TO n:",
          "    curr = prev1 + prev2",
          "    prev2 = prev1; prev1 = curr",
          "  RETURN prev1"
        ],
        "timeComplexity": "O(N)",
        "spaceComplexity": "O(1)",
        "complexityExplanation": "Optimal Fibonacci Constant Space Rolling State achieves O(N) time with O(1) auxiliary space.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int climbStairs(int n) {\n        if (n <= 2) return n;\n        int prev2 = 1, prev1 = 2;\n        for (int i = 3; i <= n; i++) {\n            int curr = prev1 + prev2;\n            prev2 = prev1;\n            prev1 = curr;\n        }\n        return prev1;\n    }\n}",
          "python": "class Solution:\n    def climbStairs(self, n: int) -> int:\n        if n <= 2: return n\n        p2, p1 = 1, 2\n        for _ in range(3, n + 1):\n            p2, p1 = p1, p1 + p2\n        return p1",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int climbStairs(int n) {\n        if (n <= 2) return n;\n        int prev2 = 1, prev1 = 2;\n        for (int i = 3; i <= n; ++i) {\n            int curr = prev1 + prev2;\n            prev2 = prev1;\n            prev1 = curr;\n        }\n        return prev1;\n    }\n};",
          "javascript": "function climbStairs(n) {\n    if (n <= 2) return n;\n    let prev2 = 1, prev1 = 2;\n    for (let i = 3; i <= n; i++) {\n        const curr = prev1 + prev2;\n        prev2 = prev1;\n        prev1 = curr;\n    }\n    return prev1;\n}"
        }
      }
    }
  },
  "min_cost_climbing_stairs": {
    "questionId": "archetype-min_cost_climbing_stairs",
    "pattern": "1D Constant Space Dynamic Programming",
    "intuition": [
      "You can start at index 0 or index 1.",
      "To reach step i, pay cost[i] and take min cost from (i-1) or (i-2).",
      "Optimal cost can be tracked with two variables (prev1, prev2)."
    ],
    "pseudocode": [
      "FUNCTION minCostClimbingStairs(cost):",
      "  prev2 = cost[0], prev1 = cost[1]",
      "  FOR i from 2 TO cost.length - 1:",
      "    curr = cost[i] + MIN(prev1, prev2)",
      "    prev2 = prev1; prev1 = curr",
      "  RETURN MIN(prev1, prev2)"
    ],
    "timeComplexity": "O(N)",
    "spaceComplexity": "O(1)",
    "complexityExplanation": "Optimal 1D Constant Space Dynamic Programming achieves O(N) time with O(1) space.",
    "edgeCases": [
      "Two steps (returns min(cost[0], cost[1]))",
      "All identical costs",
      "Zero cost steps"
    ],
    "code": {
      "java": "import java.util.*;\n\npublic class Solution {\n    public int minCostClimbingStairs(int[] cost) {\n        int prev2 = cost[0], prev1 = cost[1];\n        for (int i = 2; i < cost.length; i++) {\n            int curr = cost[i] + Math.min(prev1, prev2);\n            prev2 = prev1;\n            prev1 = curr;\n        }\n        return Math.min(prev1, prev2);\n    }\n}",
      "python": "class Solution:\n    def minCostClimbingStairs(self, cost: list[int]) -> int:\n        p2, p1 = cost[0], cost[1]\n        for i in range(2, len(cost)):\n            p2, p1 = p1, cost[i] + min(p1, p2)\n        return min(p1, p2)",
      "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int minCostClimbingStairs(std::vector<int>& cost) {\n        int prev2 = cost[0], prev1 = cost[1];\n        for (size_t i = 2; i < cost.size(); ++i) {\n            int curr = cost[i] + std::min(prev1, prev2);\n            prev2 = prev1;\n            prev1 = curr;\n        }\n        return std::min(prev1, prev2);\n    }\n};",
      "javascript": "function minCostClimbingStairs(cost) {\n    let prev2 = cost[0], prev1 = cost[1];\n    for (let i = 2; i < cost.length; i++) {\n        const curr = cost[i] + Math.min(prev1, prev2);\n        prev2 = prev1;\n        prev1 = curr;\n    }\n    return Math.min(prev1, prev2);\n}"
    },
    "interviewProTips": [
      "Start with the state transition recurrence for Min Cost Climbing Stairs before writing space-optimized code.",
      "Verify base cases for empty or single element inputs to prevent out-of-bounds access."
    ],
    "approaches": {
      "brute": {
        "name": "Brute Force (Pure Recursion)",
        "tier": "brute",
        "badge": "\ud83e\udd49 Brute Force",
        "intuition": [
          "Formulate problem as recursive exploration of all choice branches without memoization.",
          "Re-evaluates identical subproblem states repeatedly, leading to exponential time complexity."
        ],
        "timeComplexity": "O(2\u207f)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Exhaustive recursion tree branches into O(2\u207f) operations.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int minCostClimbingStairsBrute(int[] cost) {\n        return Math.min(helper(cost, 0), helper(cost, 1));\n    }\n    private int helper(int[] cost, int idx) {\n        if (idx >= cost.length) return 0;\n        return cost[idx] + Math.min(helper(cost, idx + 1), helper(cost, idx + 2));\n    }\n}",
          "python": "class Solution:\n    def minCostClimbingStairsBrute(self, cost: list[int]) -> int:\n        def h(idx):\n            if idx >= len(cost): return 0\n            return cost[idx] + min(h(idx + 1), h(idx + 2))\n        return min(h(0), h(1))",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int helper(const std::vector<int>& cost, int idx) {\n        if (idx >= (int)cost.size()) return 0;\n        return cost[idx] + std::min(helper(cost, idx + 1), helper(cost, idx + 2));\n    }\n    int minCostClimbingStairsBrute(std::vector<int>& cost) {\n        return std::min(helper(cost, 0), helper(cost, 1));\n    }\n};",
          "javascript": "function minCostClimbingStairsBrute(cost) {\n    function h(idx) {\n        if (idx >= cost.length) return 0;\n        return cost[idx] + Math.min(h(idx + 1), h(idx + 2));\n    }\n    return Math.min(h(0), h(1));\n}"
        }
      },
      "better": {
        "name": "Better (Memoized DFS / 2D DP Table)",
        "tier": "better",
        "badge": "\ud83e\udd48 Better",
        "intuition": [
          "Store previously computed subproblem states in a lookup table or matrix.",
          "If a state is already visited, return the stored value immediately in O(1) time."
        ],
        "timeComplexity": "O(N)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Memoization evaluates each state at most once, reducing time to O(N).",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int minCostClimbingStairsBetter(int[] cost) {\n        int n = cost.length;\n        int[] dp = new int[n + 1];\n        for (int i = 2; i <= n; i++) {\n            dp[i] = Math.min(dp[i - 1] + cost[i - 1], dp[i - 2] + cost[i - 2]);\n        }\n        return dp[n];\n    }\n}",
          "python": "class Solution:\n    def minCostClimbingStairsBetter(self, cost: list[int]) -> int:\n        n = len(cost)\n        dp = [0] * (n + 1)\n        for i in range(2, n + 1):\n            dp[i] = min(dp[i - 1] + cost[i - 1], dp[i - 2] + cost[i - 2])\n        return dp[n]",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int minCostClimbingStairsBetter(std::vector<int>& cost) {\n        int n = cost.size();\n        std::vector<int> dp(n + 1, 0);\n        for (int i = 2; i <= n; ++i) {\n            dp[i] = std::min(dp[i - 1] + cost[i - 1], dp[i - 2] + cost[i - 2]);\n        }\n        return dp[n];\n    }\n};",
          "javascript": "function minCostClimbingStairsBetter(cost) {\n    const n = cost.length;\n    const dp = new Array(n + 1).fill(0);\n    for (let i = 2; i <= n; i++) {\n        dp[i] = Math.min(dp[i - 1] + cost[i - 1], dp[i - 2] + cost[i - 2]);\n    }\n    return dp[n];\n}"
        }
      },
      "optimal": {
        "name": "Optimal (1D Constant Space Dynamic Programming)",
        "tier": "optimal",
        "badge": "\ud83e\udd47 Optimal",
        "intuition": [
          "You can start at index 0 or index 1.",
          "To reach step i, pay cost[i] and take min cost from (i-1) or (i-2).",
          "Optimal cost can be tracked with two variables (prev1, prev2)."
        ],
        "pseudocode": [
          "FUNCTION minCostClimbingStairs(cost):",
          "  prev2 = cost[0], prev1 = cost[1]",
          "  FOR i from 2 TO cost.length - 1:",
          "    curr = cost[i] + MIN(prev1, prev2)",
          "    prev2 = prev1; prev1 = curr",
          "  RETURN MIN(prev1, prev2)"
        ],
        "timeComplexity": "O(N)",
        "spaceComplexity": "O(1)",
        "complexityExplanation": "Optimal 1D Constant Space Dynamic Programming achieves O(N) time with O(1) auxiliary space.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int minCostClimbingStairs(int[] cost) {\n        int prev2 = cost[0], prev1 = cost[1];\n        for (int i = 2; i < cost.length; i++) {\n            int curr = cost[i] + Math.min(prev1, prev2);\n            prev2 = prev1;\n            prev1 = curr;\n        }\n        return Math.min(prev1, prev2);\n    }\n}",
          "python": "class Solution:\n    def minCostClimbingStairs(self, cost: list[int]) -> int:\n        p2, p1 = cost[0], cost[1]\n        for i in range(2, len(cost)):\n            p2, p1 = p1, cost[i] + min(p1, p2)\n        return min(p1, p2)",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int minCostClimbingStairs(std::vector<int>& cost) {\n        int prev2 = cost[0], prev1 = cost[1];\n        for (size_t i = 2; i < cost.size(); ++i) {\n            int curr = cost[i] + std::min(prev1, prev2);\n            prev2 = prev1;\n            prev1 = curr;\n        }\n        return std::min(prev1, prev2);\n    }\n};",
          "javascript": "function minCostClimbingStairs(cost) {\n    let prev2 = cost[0], prev1 = cost[1];\n    for (let i = 2; i < cost.length; i++) {\n        const curr = cost[i] + Math.min(prev1, prev2);\n        prev2 = prev1;\n        prev1 = curr;\n    }\n    return Math.min(prev1, prev2);\n}"
        }
      }
    }
  },
  "buy_sell_stock_cooldown": {
    "questionId": "archetype-buy_sell_stock_cooldown",
    "pattern": "State-Machine DP with 3 States",
    "intuition": [
      "Three states: held (holding stock), sold (just sold stock, cooldown next day), rest (idle/cooldown).",
      "held = max(held, rest - price)",
      "sold = held + price",
      "rest = max(rest, sold)",
      "Return max(sold, rest) tracked in O(1) space."
    ],
    "pseudocode": [
      "FUNCTION maxProfit(prices):",
      "  held = -INFINITY, sold = 0, rest = 0",
      "  FOR price IN prices:",
      "    prevSold = sold",
      "    sold = held + price",
      "    held = MAX(held, rest - price)",
      "    rest = MAX(rest, prevSold)",
      "  RETURN MAX(sold, rest)"
    ],
    "timeComplexity": "O(N)",
    "spaceComplexity": "O(1)",
    "complexityExplanation": "Optimal State-Machine DP with 3 States achieves O(N) time with O(1) space.",
    "edgeCases": [
      "Single day (returns 0)",
      "Strictly decreasing prices",
      "Strictly increasing prices"
    ],
    "code": {
      "java": "import java.util.*;\n\npublic class Solution {\n    public int maxProfit(int[] prices) {\n        int held = Integer.MIN_VALUE, sold = 0, rest = 0;\n        for (int p : prices) {\n            int prevSold = sold;\n            sold = (held == Integer.MIN_VALUE) ? 0 : held + p;\n            held = Math.max(held, rest - p);\n            rest = Math.max(rest, prevSold);\n        }\n        return Math.max(sold, rest);\n    }\n}",
      "python": "class Solution:\n    def maxProfit(self, prices: list[int]) -> int:\n        held, sold, rest = float('-inf'), 0, 0\n        for p in prices:\n            prev_sold = sold\n            sold = held + p\n            held = max(held, rest - p)\n            rest = max(rest, prev_sold)\n        return max(sold, rest)",
      "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int maxProfit(std::vector<int>& prices) {\n        int held = INT_MIN, sold = 0, rest = 0;\n        for (int p : prices) {\n            int prevSold = sold;\n            sold = (held == INT_MIN) ? 0 : held + p;\n            held = std::max(held, rest - p);\n            rest = std::max(rest, prevSold);\n        }\n        return std::max(sold, rest);\n    }\n};",
      "javascript": "function maxProfit(prices) {\n    let held = -Infinity, sold = 0, rest = 0;\n    for (const p of prices) {\n        const prevSold = sold;\n        sold = held + p;\n        held = Math.max(held, rest - p);\n        rest = Math.max(rest, prevSold);\n    }\n    return Math.max(sold, rest);\n}"
    },
    "interviewProTips": [
      "Start with the state transition recurrence for Best Time to Buy and Sell Stock with Cooldown before writing space-optimized code.",
      "Verify base cases for empty or single element inputs to prevent out-of-bounds access."
    ],
    "approaches": {
      "brute": {
        "name": "Brute Force (Pure Recursion)",
        "tier": "brute",
        "badge": "\ud83e\udd49 Brute Force",
        "intuition": [
          "Formulate problem as recursive exploration of all choice branches without memoization.",
          "Re-evaluates identical subproblem states repeatedly, leading to exponential time complexity."
        ],
        "timeComplexity": "O(2\u207f)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Exhaustive recursion tree branches into O(2\u207f) operations.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int maxProfitBrute(int[] prices) {\n        return dfs(prices, 0, false);\n    }\n    private int dfs(int[] prices, int day, boolean holding) {\n        if (day >= prices.length) return 0;\n        if (holding) {\n            int sell = prices[day] + dfs(prices, day + 2, false);\n            int hold = dfs(prices, day + 1, true);\n            return Math.max(sell, hold);\n        } else {\n            int buy = -prices[day] + dfs(prices, day + 1, true);\n            int rest = dfs(prices, day + 1, false);\n            return Math.max(buy, rest);\n        }\n    }\n}",
          "python": "class Solution:\n    def maxProfitBrute(self, prices: list[int]) -> int:\n        def dfs(day, holding):\n            if day >= len(prices): return 0\n            if holding:\n                return max(prices[day] + dfs(day + 2, False), dfs(day + 1, True))\n            else:\n                return max(-prices[day] + dfs(day + 1, True), dfs(day + 1, False))\n        return dfs(0, False)",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int dfs(const std::vector<int>& prices, int day, bool holding) {\n        if (day >= (int)prices.size()) return 0;\n        if (holding) {\n            int sell = prices[day] + dfs(prices, day + 2, false);\n            int hold = dfs(prices, day + 1, true);\n            return std::max(sell, hold);\n        } else {\n            int buy = -prices[day] + dfs(prices, day + 1, true);\n            int rest = dfs(prices, day + 1, false);\n            return std::max(buy, rest);\n        }\n    }\n    int maxProfitBrute(std::vector<int>& prices) {\n        return dfs(prices, 0, false);\n    }\n};",
          "javascript": "function maxProfitBrute(prices) {\n    function dfs(day, holding) {\n        if (day >= prices.length) return 0;\n        if (holding) {\n            return Math.max(prices[day] + dfs(day + 2, false), dfs(day + 1, true));\n        } else {\n            return Math.max(-prices[day] + dfs(day + 1, true), dfs(day + 1, false));\n        }\n    }\n    return dfs(0, false);\n}"
        }
      },
      "better": {
        "name": "Better (Memoized DFS / 2D DP Table)",
        "tier": "better",
        "badge": "\ud83e\udd48 Better",
        "intuition": [
          "Store previously computed subproblem states in a lookup table or matrix.",
          "If a state is already visited, return the stored value immediately in O(1) time."
        ],
        "timeComplexity": "O(N)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Memoization evaluates each state at most once, reducing time to O(N).",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int maxProfitBetter(int[] prices) {\n        int n = prices.length;\n        if (n <= 1) return 0;\n        int[] buy = new int[n], sell = new int[n];\n        buy[0] = -prices[0];\n        buy[1] = Math.max(-prices[0], -prices[1]);\n        sell[1] = Math.max(0, buy[0] + prices[1]);\n        for (int i = 2; i < n; i++) {\n            buy[i] = Math.max(buy[i - 1], sell[i - 2] - prices[i]);\n            sell[i] = Math.max(sell[i - 1], buy[i - 1] + prices[i]);\n        }\n        return sell[n - 1];\n    }\n}",
          "python": "class Solution:\n    def maxProfitBetter(self, prices: list[int]) -> int:\n        n = len(prices)\n        if n <= 1: return 0\n        buy = [0] * n\n        sell = [0] * n\n        buy[0] = -prices[0]\n        buy[1] = max(-prices[0], -prices[1])\n        sell[1] = max(0, buy[0] + prices[1])\n        for i in range(2, n):\n            buy[i] = max(buy[i - 1], sell[i - 2] - prices[i])\n            sell[i] = max(sell[i - 1], buy[i - 1] + prices[i])\n        return sell[n - 1]",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int maxProfitBetter(std::vector<int>& prices) {\n        int n = prices.size();\n        if (n <= 1) return 0;\n        std::vector<int> buy(n, 0), sell(n, 0);\n        buy[0] = -prices[0];\n        buy[1] = std::max(-prices[0], -prices[1]);\n        sell[1] = std::max(0, buy[0] + prices[1]);\n        for (int i = 2; i < n; ++i) {\n            buy[i] = std::max(buy[i - 1], sell[i - 2] - prices[i]);\n            sell[i] = std::max(sell[i - 1], buy[i - 1] + prices[i]);\n        }\n        return sell[n - 1];\n    }\n};",
          "javascript": "function maxProfitBetter(prices) {\n    const n = prices.length;\n    if (n <= 1) return 0;\n    const buy = new Array(n).fill(0);\n    const sell = new Array(n).fill(0);\n    buy[0] = -prices[0];\n    buy[1] = Math.max(-prices[0], -prices[1]);\n    sell[1] = Math.max(0, buy[0] + prices[1]);\n    for (let i = 2; i < n; i++) {\n        buy[i] = Math.max(buy[i - 1], sell[i - 2] - prices[i]);\n        sell[i] = Math.max(sell[i - 1], buy[i - 1] + prices[i]);\n    }\n    return sell[n - 1];\n}"
        }
      },
      "optimal": {
        "name": "Optimal (State-Machine DP with 3 States)",
        "tier": "optimal",
        "badge": "\ud83e\udd47 Optimal",
        "intuition": [
          "Three states: held (holding stock), sold (just sold stock, cooldown next day), rest (idle/cooldown).",
          "held = max(held, rest - price)",
          "sold = held + price",
          "rest = max(rest, sold)",
          "Return max(sold, rest) tracked in O(1) space."
        ],
        "pseudocode": [
          "FUNCTION maxProfit(prices):",
          "  held = -INFINITY, sold = 0, rest = 0",
          "  FOR price IN prices:",
          "    prevSold = sold",
          "    sold = held + price",
          "    held = MAX(held, rest - price)",
          "    rest = MAX(rest, prevSold)",
          "  RETURN MAX(sold, rest)"
        ],
        "timeComplexity": "O(N)",
        "spaceComplexity": "O(1)",
        "complexityExplanation": "Optimal State-Machine DP with 3 States achieves O(N) time with O(1) auxiliary space.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int maxProfit(int[] prices) {\n        int held = Integer.MIN_VALUE, sold = 0, rest = 0;\n        for (int p : prices) {\n            int prevSold = sold;\n            sold = (held == Integer.MIN_VALUE) ? 0 : held + p;\n            held = Math.max(held, rest - p);\n            rest = Math.max(rest, prevSold);\n        }\n        return Math.max(sold, rest);\n    }\n}",
          "python": "class Solution:\n    def maxProfit(self, prices: list[int]) -> int:\n        held, sold, rest = float('-inf'), 0, 0\n        for p in prices:\n            prev_sold = sold\n            sold = held + p\n            held = max(held, rest - p)\n            rest = max(rest, prev_sold)\n        return max(sold, rest)",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int maxProfit(std::vector<int>& prices) {\n        int held = INT_MIN, sold = 0, rest = 0;\n        for (int p : prices) {\n            int prevSold = sold;\n            sold = (held == INT_MIN) ? 0 : held + p;\n            held = std::max(held, rest - p);\n            rest = std::max(rest, prevSold);\n        }\n        return std::max(sold, rest);\n    }\n};",
          "javascript": "function maxProfit(prices) {\n    let held = -Infinity, sold = 0, rest = 0;\n    for (const p of prices) {\n        const prevSold = sold;\n        sold = held + p;\n        held = Math.max(held, rest - p);\n        rest = Math.max(rest, prevSold);\n    }\n    return Math.max(sold, rest);\n}"
        }
      }
    }
  },
  "buy_sell_stock_iii": {
    "questionId": "archetype-buy_sell_stock_iii",
    "pattern": "4-Variable State Machine DP (At Most 2 Transactions)",
    "intuition": [
      "Track 4 variables: buy1 (cost of 1st stock), sell1 (profit after 1st sale), buy2 (effective cost of 2nd stock), sell2 (profit after 2nd sale).",
      "buy1 = max(buy1, -price)",
      "sell1 = max(sell1, buy1 + price)",
      "buy2 = max(buy2, sell1 - price)  // reinvest profit",
      "sell2 = max(sell2, buy2 + price)"
    ],
    "pseudocode": [
      "FUNCTION maxProfit(prices):",
      "  buy1 = -INFINITY, sell1 = 0",
      "  buy2 = -INFINITY, sell2 = 0",
      "  FOR p IN prices:",
      "    buy1 = MAX(buy1, -p)",
      "    sell1 = MAX(sell1, buy1 + p)",
      "    buy2 = MAX(buy2, sell1 - p)",
      "    sell2 = MAX(sell2, buy2 + p)",
      "  RETURN sell2"
    ],
    "timeComplexity": "O(N)",
    "spaceComplexity": "O(1)",
    "complexityExplanation": "Optimal 4-Variable State Machine DP (At Most 2 Transactions) achieves O(N) time with O(1) space.",
    "edgeCases": [
      "Decreasing prices (returns 0)",
      "Single element array (returns 0)",
      "Two elements"
    ],
    "code": {
      "java": "import java.util.*;\n\npublic class Solution {\n    public int maxProfit(int[] prices) {\n        int buy1 = Integer.MIN_VALUE, sell1 = 0;\n        int buy2 = Integer.MIN_VALUE, sell2 = 0;\n        for (int p : prices) {\n            buy1 = Math.max(buy1, -p);\n            sell1 = Math.max(sell1, buy1 + p);\n            buy2 = Math.max(buy2, sell1 - p);\n            sell2 = Math.max(sell2, buy2 + p);\n        }\n        return sell2;\n    }\n}",
      "python": "class Solution:\n    def maxProfit(self, prices: list[int]) -> int:\n        buy1, sell1 = float('-inf'), 0\n        buy2, sell2 = float('-inf'), 0\n        for p in prices:\n            buy1 = max(buy1, -p)\n            sell1 = max(sell1, buy1 + p)\n            buy2 = max(buy2, sell1 - p)\n            sell2 = max(sell2, buy2 + p)\n        return sell2",
      "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int maxProfit(std::vector<int>& prices) {\n        int buy1 = INT_MIN, sell1 = 0;\n        int buy2 = INT_MIN, sell2 = 0;\n        for (int p : prices) {\n            buy1 = std::max(buy1, -p);\n            sell1 = std::max(sell1, buy1 + p);\n            buy2 = std::max(buy2, (sell1 == 0 && buy1 == -p) ? -p : sell1 - p);\n            sell2 = std::max(sell2, buy2 + p);\n        }\n        return sell2;\n    }\n};",
      "javascript": "function maxProfit(prices) {\n    let buy1 = -Infinity, sell1 = 0;\n    let buy2 = -Infinity, sell2 = 0;\n    for (const p of prices) {\n        buy1 = Math.max(buy1, -p);\n        sell1 = Math.max(sell1, buy1 + p);\n        buy2 = Math.max(buy2, sell1 - p);\n        sell2 = Math.max(sell2, buy2 + p);\n    }\n    return sell2;\n}"
    },
    "interviewProTips": [
      "Start with the state transition recurrence for Best Time to Buy and Sell Stock III before writing space-optimized code.",
      "Verify base cases for empty or single element inputs to prevent out-of-bounds access."
    ],
    "approaches": {
      "brute": {
        "name": "Brute Force (Pure Recursion)",
        "tier": "brute",
        "badge": "\ud83e\udd49 Brute Force",
        "intuition": [
          "Formulate problem as recursive exploration of all choice branches without memoization.",
          "Re-evaluates identical subproblem states repeatedly, leading to exponential time complexity."
        ],
        "timeComplexity": "O(N\u00b2)",
        "spaceComplexity": "O(1)",
        "complexityExplanation": "Exhaustive recursion tree branches into O(N\u00b2) operations.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int maxProfitBrute(int[] prices) {\n        int maxProfit = 0, n = prices.length;\n        for (int i = 0; i < n; i++) {\n            maxProfit = Math.max(maxProfit, maxSub(prices, 0, i) + maxSub(prices, i, n - 1));\n        }\n        return maxProfit;\n    }\n    private int maxSub(int[] p, int start, int end) {\n        int min = Integer.MAX_VALUE, profit = 0;\n        for (int i = start; i <= end; i++) {\n            min = Math.min(min, p[i]);\n            profit = Math.max(profit, p[i] - min);\n        }\n        return profit;\n    }\n}",
          "python": "class Solution:\n    def maxProfitBrute(self, prices: list[int]) -> int:\n        n = len(prices)\n        def max_sub(s, e):\n            mn, prof = float('inf'), 0\n            for i in range(s, e + 1):\n                mn = min(mn, prices[i])\n                prof = max(prof, prices[i] - mn)\n            return prof\n        return max(max_sub(0, i) + max_sub(i, n - 1) for i in range(n)) if n > 0 else 0",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int maxSub(const std::vector<int>& p, int start, int end) {\n        int mn = 1e9, profit = 0;\n        for (int i = start; i <= end; ++i) {\n            mn = std::min(mn, p[i]);\n            profit = std::max(profit, p[i] - mn);\n        }\n        return profit;\n    }\n    int maxProfitBrute(std::vector<int>& prices) {\n        int n = prices.size(), maxProfit = 0;\n        for (int i = 0; i < n; ++i) {\n            maxProfit = std::max(maxProfit, maxSub(prices, 0, i) + maxSub(prices, i, n - 1));\n        }\n        return maxProfit;\n    }\n};",
          "javascript": "function maxProfitBrute(prices) {\n    const n = prices.length;\n    function maxSub(start, end) {\n        let min = Infinity, profit = 0;\n        for (let i = start; i <= end; i++) {\n            min = Math.min(min, prices[i]);\n            profit = Math.max(profit, prices[i] - min);\n        }\n        return profit;\n    }\n    let maxProfit = 0;\n    for (let i = 0; i < n; i++) {\n        maxProfit = Math.max(maxProfit, maxSub(0, i) + maxSub(i, n - 1));\n    }\n    return maxProfit;\n}"
        }
      },
      "better": {
        "name": "Better (Memoized DFS / 2D DP Table)",
        "tier": "better",
        "badge": "\ud83e\udd48 Better",
        "intuition": [
          "Store previously computed subproblem states in a lookup table or matrix.",
          "If a state is already visited, return the stored value immediately in O(1) time."
        ],
        "timeComplexity": "O(N)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Memoization evaluates each state at most once, reducing time to O(N).",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int maxProfitBetter(int[] prices) {\n        int n = prices.length;\n        if (n <= 1) return 0;\n        int[] left = new int[n];\n        int minPrice = prices[0];\n        for (int i = 1; i < n; i++) {\n            minPrice = Math.min(minPrice, prices[i]);\n            left[i] = Math.max(left[i - 1], prices[i] - minPrice);\n        }\n        int maxPrice = prices[n - 1];\n        int maxProfit = left[n - 1];\n        int right = 0;\n        for (int i = n - 2; i >= 0; i--) {\n            maxPrice = Math.max(maxPrice, prices[i]);\n            right = Math.max(right, maxPrice - prices[i]);\n            maxProfit = Math.max(maxProfit, left[i] + right);\n        }\n        return maxProfit;\n    }\n}",
          "python": "class Solution:\n    def maxProfitBetter(self, prices: list[int]) -> int:\n        n = len(prices)\n        if n <= 1: return 0\n        left = [0] * n\n        min_p = prices[0]\n        for i in range(1, n):\n            min_p = min(min_p, prices[i])\n            left[i] = max(left[i - 1], prices[i] - min_p)\n        max_p, right = prices[-1], 0\n        ans = left[-1]\n        for i in range(n - 2, -1, -1):\n            max_p = max(max_p, prices[i])\n            right = max(right, max_p - prices[i])\n            ans = max(ans, left[i] + right)\n        return ans",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int maxProfitBetter(std::vector<int>& prices) {\n        int n = prices.size();\n        if (n <= 1) return 0;\n        std::vector<int> left(n, 0);\n        int minPrice = prices[0];\n        for (int i = 1; i < n; ++i) {\n            minPrice = std::min(minPrice, prices[i]);\n            left[i] = std::max(left[i - 1], prices[i] - minPrice);\n        }\n        int maxPrice = prices[n - 1], right = 0, maxProfit = left[n - 1];\n        for (int i = n - 2; i >= 0; --i) {\n            maxPrice = std::max(maxPrice, prices[i]);\n            right = std::max(right, maxPrice - prices[i]);\n            maxProfit = std::max(maxProfit, left[i] + right);\n        }\n        return maxProfit;\n    }\n};",
          "javascript": "function maxProfitBetter(prices) {\n    const n = prices.length;\n    if (n <= 1) return 0;\n    const left = new Array(n).fill(0);\n    let minPrice = prices[0];\n    for (let i = 1; i < n; i++) {\n        minPrice = Math.min(minPrice, prices[i]);\n        left[i] = Math.max(left[i - 1], prices[i] - minPrice);\n    }\n    let maxPrice = prices[n - 1], right = 0, maxProfit = left[n - 1];\n    for (let i = n - 2; i >= 0; i--) {\n        maxPrice = Math.max(maxPrice, prices[i]);\n        right = Math.max(right, maxPrice - prices[i]);\n        maxProfit = Math.max(maxProfit, left[i] + right);\n    }\n    return maxProfit;\n}"
        }
      },
      "optimal": {
        "name": "Optimal (4-Variable State Machine DP (At Most 2 Transactions))",
        "tier": "optimal",
        "badge": "\ud83e\udd47 Optimal",
        "intuition": [
          "Track 4 variables: buy1 (cost of 1st stock), sell1 (profit after 1st sale), buy2 (effective cost of 2nd stock), sell2 (profit after 2nd sale).",
          "buy1 = max(buy1, -price)",
          "sell1 = max(sell1, buy1 + price)",
          "buy2 = max(buy2, sell1 - price)  // reinvest profit",
          "sell2 = max(sell2, buy2 + price)"
        ],
        "pseudocode": [
          "FUNCTION maxProfit(prices):",
          "  buy1 = -INFINITY, sell1 = 0",
          "  buy2 = -INFINITY, sell2 = 0",
          "  FOR p IN prices:",
          "    buy1 = MAX(buy1, -p)",
          "    sell1 = MAX(sell1, buy1 + p)",
          "    buy2 = MAX(buy2, sell1 - p)",
          "    sell2 = MAX(sell2, buy2 + p)",
          "  RETURN sell2"
        ],
        "timeComplexity": "O(N)",
        "spaceComplexity": "O(1)",
        "complexityExplanation": "Optimal 4-Variable State Machine DP (At Most 2 Transactions) achieves O(N) time with O(1) auxiliary space.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int maxProfit(int[] prices) {\n        int buy1 = Integer.MIN_VALUE, sell1 = 0;\n        int buy2 = Integer.MIN_VALUE, sell2 = 0;\n        for (int p : prices) {\n            buy1 = Math.max(buy1, -p);\n            sell1 = Math.max(sell1, buy1 + p);\n            buy2 = Math.max(buy2, sell1 - p);\n            sell2 = Math.max(sell2, buy2 + p);\n        }\n        return sell2;\n    }\n}",
          "python": "class Solution:\n    def maxProfit(self, prices: list[int]) -> int:\n        buy1, sell1 = float('-inf'), 0\n        buy2, sell2 = float('-inf'), 0\n        for p in prices:\n            buy1 = max(buy1, -p)\n            sell1 = max(sell1, buy1 + p)\n            buy2 = max(buy2, sell1 - p)\n            sell2 = max(sell2, buy2 + p)\n        return sell2",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int maxProfit(std::vector<int>& prices) {\n        int buy1 = INT_MIN, sell1 = 0;\n        int buy2 = INT_MIN, sell2 = 0;\n        for (int p : prices) {\n            buy1 = std::max(buy1, -p);\n            sell1 = std::max(sell1, buy1 + p);\n            buy2 = std::max(buy2, (sell1 == 0 && buy1 == -p) ? -p : sell1 - p);\n            sell2 = std::max(sell2, buy2 + p);\n        }\n        return sell2;\n    }\n};",
          "javascript": "function maxProfit(prices) {\n    let buy1 = -Infinity, sell1 = 0;\n    let buy2 = -Infinity, sell2 = 0;\n    for (const p of prices) {\n        buy1 = Math.max(buy1, -p);\n        sell1 = Math.max(sell1, buy1 + p);\n        buy2 = Math.max(buy2, sell1 - p);\n        sell2 = Math.max(sell2, buy2 + p);\n    }\n    return sell2;\n}"
        }
      }
    }
  },
  "buy_sell_stock_iv": {
    "questionId": "archetype-buy_sell_stock_iv",
    "pattern": "1D Compressed State Machine DP (At Most K Transactions)",
    "intuition": [
      "If k >= n / 2, equivalent to unlimited transactions (greedy peak-valley sum).",
      "Otherwise, maintain buy[t] and sell[t] arrays for t from 1 to k.",
      "buy[t] = max(buy[t], sell[t-1] - price)",
      "sell[t] = max(sell[t], buy[t] + price)"
    ],
    "pseudocode": [
      "FUNCTION maxProfit(k, prices):",
      "  IF k >= prices.length / 2: RETURN unlimitedProfit(prices)",
      "  buy = Array(k + 1, -INFINITY), sell = Array(k + 1, 0)",
      "  FOR p IN prices:",
      "    FOR t from 1 TO k:",
      "      buy[t] = MAX(buy[t], sell[t - 1] - p)",
      "      sell[t] = MAX(sell[t], buy[t] + p)",
      "  RETURN sell[k]"
    ],
    "timeComplexity": "O(K * N)",
    "spaceComplexity": "O(K)",
    "complexityExplanation": "Optimal 1D Compressed State Machine DP (At Most K Transactions) achieves O(K * N) time with O(K) space.",
    "edgeCases": [
      "k = 0 (returns 0)",
      "k >= n / 2 (unlimited transactions)",
      "Decreasing prices (returns 0)"
    ],
    "code": {
      "java": "import java.util.*;\n\npublic class Solution {\n    public int maxProfit(int k, int[] prices) {\n        int n = prices.length;\n        if (n <= 1 || k <= 0) return 0;\n        if (k >= n / 2) {\n            int maxProf = 0;\n            for (int i = 1; i < n; i++) if (prices[i] > prices[i - 1]) maxProf += prices[i] - prices[i - 1];\n            return maxProf;\n        }\n        int[] buy = new int[k + 1];\n        int[] sell = new int[k + 1];\n        Arrays.fill(buy, Integer.MIN_VALUE);\n        for (int p : prices) {\n            for (int t = 1; t <= k; t++) {\n                buy[t] = Math.max(buy[t], sell[t - 1] - p);\n                sell[t] = Math.max(sell[t], buy[t] + p);\n            }\n        }\n        return sell[k];\n    }\n}",
      "python": "class Solution:\n    def maxProfit(self, k: int, prices: list[int]) -> int:\n        n = len(prices)\n        if n <= 1 or k <= 0: return 0\n        if k >= n // 2:\n            return sum(max(0, prices[i] - prices[i - 1]) for i in range(1, n))\n        buy = [float('-inf')] * (k + 1)\n        sell = [0] * (k + 1)\n        for p in prices:\n            for t in range(1, k + 1):\n                buy[t] = max(buy[t], sell[t - 1] - p)\n                sell[t] = max(sell[t], buy[t] + p)\n        return sell[k]",
      "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int maxProfit(int k, std::vector<int>& prices) {\n        int n = prices.size();\n        if (n <= 1 || k <= 0) return 0;\n        if (k >= n / 2) {\n            int maxProf = 0;\n            for (int i = 1; i < n; ++i) if (prices[i] > prices[i - 1]) maxProf += prices[i] - prices[i - 1];\n            return maxProf;\n        }\n        std::vector<int> buy(k + 1, -1e9), sell(k + 1, 0);\n        for (int p : prices) {\n            for (int t = 1; t <= k; ++t) {\n                buy[t] = std::max(buy[t], sell[t - 1] - p);\n                sell[t] = std::max(sell[t], buy[t] + p);\n            }\n        }\n        return sell[k];\n    }\n};",
      "javascript": "function maxProfit(k, prices) {\n    const n = prices.length;\n    if (n <= 1 || k <= 0) return 0;\n    if (k >= Math.floor(n / 2)) {\n        let maxProf = 0;\n        for (let i = 1; i < n; i++) if (prices[i] > prices[i - 1]) maxProf += prices[i] - prices[i - 1];\n        return maxProf;\n    }\n    const buy = new Array(k + 1).fill(-Infinity);\n    const sell = new Array(k + 1).fill(0);\n    for (const p of prices) {\n        for (let t = 1; t <= k; t++) {\n            buy[t] = Math.max(buy[t], sell[t - 1] - p);\n            sell[t] = Math.max(sell[t], buy[t] + p);\n        }\n    }\n    return sell[k];\n}"
    },
    "interviewProTips": [
      "Start with the state transition recurrence for Best Time to Buy and Sell Stock IV before writing space-optimized code.",
      "Verify base cases for empty or single element inputs to prevent out-of-bounds access."
    ],
    "approaches": {
      "brute": {
        "name": "Brute Force (Pure Recursion)",
        "tier": "brute",
        "badge": "\ud83e\udd49 Brute Force",
        "intuition": [
          "Formulate problem as recursive exploration of all choice branches without memoization.",
          "Re-evaluates identical subproblem states repeatedly, leading to exponential time complexity."
        ],
        "timeComplexity": "O(2\u207f)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Exhaustive recursion tree branches into O(2\u207f) operations.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int maxProfitBrute(int k, int[] prices) {\n        return helper(k, prices, 0, false);\n    }\n    private int helper(int k, int[] prices, int day, boolean holding) {\n        if (k == 0 || day >= prices.length) return 0;\n        if (holding) {\n            int sell = prices[day] + helper(k - 1, prices, day + 1, false);\n            int hold = helper(k, prices, day + 1, true);\n            return Math.max(sell, hold);\n        } else {\n            int buy = -prices[day] + helper(k, prices, day + 1, true);\n            int skip = helper(k, prices, day + 1, false);\n            return Math.max(buy, skip);\n        }\n    }\n}",
          "python": "class Solution:\n    def maxProfitBrute(self, k: int, prices: list[int]) -> int:\n        def h(tx, day, holding):\n            if tx == 0 or day >= len(prices): return 0\n            if holding:\n                return max(prices[day] + h(tx - 1, day + 1, False), h(tx, day + 1, True))\n            else:\n                return max(-prices[day] + h(tx, day + 1, True), h(tx, day + 1, False))\n        return h(k, 0, False)",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int helper(int k, const std::vector<int>& prices, int day, bool holding) {\n        if (k == 0 || day >= (int)prices.size()) return 0;\n        if (holding) {\n            int sell = prices[day] + helper(k - 1, prices, day + 1, false);\n            int hold = helper(k, prices, day + 1, true);\n            return std::max(sell, hold);\n        } else {\n            int buy = -prices[day] + helper(k, prices, day + 1, true);\n            int skip = helper(k, prices, day + 1, false);\n            return std::max(buy, skip);\n        }\n    }\n    int maxProfitBrute(int k, std::vector<int>& prices) {\n        return helper(k, prices, 0, false);\n    }\n};",
          "javascript": "function maxProfitBrute(k, prices) {\n    function h(tx, day, holding) {\n        if (tx === 0 || day >= prices.length) return 0;\n        if (holding) {\n            return Math.max(prices[day] + h(tx - 1, day + 1, false), h(tx, day + 1, true));\n        } else {\n            return Math.max(-prices[day] + h(tx, day + 1, true), h(tx, day + 1, false));\n        }\n    }\n    return h(k, 0, false);\n}"
        }
      },
      "better": {
        "name": "Better (Memoized DFS / 2D DP Table)",
        "tier": "better",
        "badge": "\ud83e\udd48 Better",
        "intuition": [
          "Store previously computed subproblem states in a lookup table or matrix.",
          "If a state is already visited, return the stored value immediately in O(1) time."
        ],
        "timeComplexity": "O(K * N)",
        "spaceComplexity": "O(K * N)",
        "complexityExplanation": "Memoization evaluates each state at most once, reducing time to O(K * N).",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int maxProfitBetter(int k, int[] prices) {\n        int n = prices.length;\n        if (n <= 1 || k <= 0) return 0;\n        int[][] dp = new int[k + 1][n];\n        for (int t = 1; t <= k; t++) {\n            int maxDiff = -prices[0];\n            for (int d = 1; d < n; d++) {\n                dp[t][d] = Math.max(dp[t][d - 1], prices[d] + maxDiff);\n                maxDiff = Math.max(maxDiff, dp[t - 1][d] - prices[d]);\n            }\n        }\n        return dp[k][n - 1];\n    }\n}",
          "python": "class Solution:\n    def maxProfitBetter(self, k: int, prices: list[int]) -> int:\n        n = len(prices)\n        if n <= 1 or k <= 0: return 0\n        dp = [[0] * n for _ in range(k + 1)]\n        for t in range(1, k + 1):\n            max_diff = -prices[0]\n            for d in range(1, n):\n                dp[t][d] = max(dp[t][d - 1], prices[d] + max_diff)\n                max_diff = max(max_diff, dp[t - 1][d] - prices[d])\n        return dp[k][n - 1]",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int maxProfitBetter(int k, std::vector<int>& prices) {\n        int n = prices.size();\n        if (n <= 1 || k <= 0) return 0;\n        std::vector<std::vector<int>> dp(k + 1, std::vector<int>(n, 0));\n        for (int t = 1; t <= k; ++t) {\n            int maxDiff = -prices[0];\n            for (int d = 1; d < n; ++d) {\n                dp[t][d] = std::max(dp[t][d - 1], prices[d] + maxDiff);\n                maxDiff = std::max(maxDiff, dp[t - 1][d] - prices[d]);\n            }\n        }\n        return dp[k][n - 1];\n    }\n};",
          "javascript": "function maxProfitBetter(k, prices) {\n    const n = prices.length;\n    if (n <= 1 || k <= 0) return 0;\n    const dp = Array.from({ length: k + 1 }, () => new Array(n).fill(0));\n    for (let t = 1; t <= k; t++) {\n        let maxDiff = -prices[0];\n        for (let d = 1; d < n; d++) {\n            dp[t][d] = Math.max(dp[t][d - 1], prices[d] + maxDiff);\n            maxDiff = Math.max(maxDiff, dp[t - 1][d] - prices[d]);\n        }\n    }\n    return dp[k][n - 1];\n}"
        }
      },
      "optimal": {
        "name": "Optimal (1D Compressed State Machine DP (At Most K Transactions))",
        "tier": "optimal",
        "badge": "\ud83e\udd47 Optimal",
        "intuition": [
          "If k >= n / 2, equivalent to unlimited transactions (greedy peak-valley sum).",
          "Otherwise, maintain buy[t] and sell[t] arrays for t from 1 to k.",
          "buy[t] = max(buy[t], sell[t-1] - price)",
          "sell[t] = max(sell[t], buy[t] + price)"
        ],
        "pseudocode": [
          "FUNCTION maxProfit(k, prices):",
          "  IF k >= prices.length / 2: RETURN unlimitedProfit(prices)",
          "  buy = Array(k + 1, -INFINITY), sell = Array(k + 1, 0)",
          "  FOR p IN prices:",
          "    FOR t from 1 TO k:",
          "      buy[t] = MAX(buy[t], sell[t - 1] - p)",
          "      sell[t] = MAX(sell[t], buy[t] + p)",
          "  RETURN sell[k]"
        ],
        "timeComplexity": "O(K * N)",
        "spaceComplexity": "O(K)",
        "complexityExplanation": "Optimal 1D Compressed State Machine DP (At Most K Transactions) achieves O(K * N) time with O(K) auxiliary space.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int maxProfit(int k, int[] prices) {\n        int n = prices.length;\n        if (n <= 1 || k <= 0) return 0;\n        if (k >= n / 2) {\n            int maxProf = 0;\n            for (int i = 1; i < n; i++) if (prices[i] > prices[i - 1]) maxProf += prices[i] - prices[i - 1];\n            return maxProf;\n        }\n        int[] buy = new int[k + 1];\n        int[] sell = new int[k + 1];\n        Arrays.fill(buy, Integer.MIN_VALUE);\n        for (int p : prices) {\n            for (int t = 1; t <= k; t++) {\n                buy[t] = Math.max(buy[t], sell[t - 1] - p);\n                sell[t] = Math.max(sell[t], buy[t] + p);\n            }\n        }\n        return sell[k];\n    }\n}",
          "python": "class Solution:\n    def maxProfit(self, k: int, prices: list[int]) -> int:\n        n = len(prices)\n        if n <= 1 or k <= 0: return 0\n        if k >= n // 2:\n            return sum(max(0, prices[i] - prices[i - 1]) for i in range(1, n))\n        buy = [float('-inf')] * (k + 1)\n        sell = [0] * (k + 1)\n        for p in prices:\n            for t in range(1, k + 1):\n                buy[t] = max(buy[t], sell[t - 1] - p)\n                sell[t] = max(sell[t], buy[t] + p)\n        return sell[k]",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int maxProfit(int k, std::vector<int>& prices) {\n        int n = prices.size();\n        if (n <= 1 || k <= 0) return 0;\n        if (k >= n / 2) {\n            int maxProf = 0;\n            for (int i = 1; i < n; ++i) if (prices[i] > prices[i - 1]) maxProf += prices[i] - prices[i - 1];\n            return maxProf;\n        }\n        std::vector<int> buy(k + 1, -1e9), sell(k + 1, 0);\n        for (int p : prices) {\n            for (int t = 1; t <= k; ++t) {\n                buy[t] = std::max(buy[t], sell[t - 1] - p);\n                sell[t] = std::max(sell[t], buy[t] + p);\n            }\n        }\n        return sell[k];\n    }\n};",
          "javascript": "function maxProfit(k, prices) {\n    const n = prices.length;\n    if (n <= 1 || k <= 0) return 0;\n    if (k >= Math.floor(n / 2)) {\n        let maxProf = 0;\n        for (let i = 1; i < n; i++) if (prices[i] > prices[i - 1]) maxProf += prices[i] - prices[i - 1];\n        return maxProf;\n    }\n    const buy = new Array(k + 1).fill(-Infinity);\n    const sell = new Array(k + 1).fill(0);\n    for (const p of prices) {\n        for (let t = 1; t <= k; t++) {\n            buy[t] = Math.max(buy[t], sell[t - 1] - p);\n            sell[t] = Math.max(sell[t], buy[t] + p);\n        }\n    }\n    return sell[k];\n}"
        }
      }
    }
  },
  "longest_increasing_path_matrix": {
    "questionId": "archetype-longest_increasing_path_matrix",
    "pattern": "DFS with 2D Memoization on DAG",
    "intuition": [
      "Strictly increasing path means the matrix has no cycles (it is a DAG).",
      "Perform DFS from each cell (r, c) with memoization: memo[r][c] caches the length of longest increasing path starting at (r, c).",
      "For each of 4 directions (dr, dc): if matrix[nr][nc] > matrix[r][c], path can extend: memo[r][c] = max(memo[r][c], 1 + dfs(nr, nc))."
    ],
    "pseudocode": [
      "FUNCTION longestIncreasingPath(matrix):",
      "  memo = Array(m, n, 0); maxLen = 0",
      "  FOR r from 0 TO m - 1:",
      "    FOR c from 0 TO n - 1:",
      "      maxLen = MAX(maxLen, dfs(r, c, matrix, memo))",
      "  RETURN maxLen"
    ],
    "timeComplexity": "O(M * N)",
    "spaceComplexity": "O(M * N)",
    "complexityExplanation": "Optimal DFS with 2D Memoization on DAG achieves O(M * N) time with O(M * N) space.",
    "edgeCases": [
      "1x1 matrix (returns 1)",
      "All equal elements (returns 1)",
      "Spiral increasing order"
    ],
    "code": {
      "java": "import java.util.*;\n\npublic class Solution {\n    public int longestIncreasingPath(int[][] matrix) {\n        if (matrix == null || matrix.length == 0) return 0;\n        int m = matrix.length, n = matrix[0].length, maxLen = 0;\n        int[][] memo = new int[m][n];\n        for (int i = 0; i < m; i++) {\n            for (int j = 0; j < n; j++) {\n                maxLen = Math.max(maxLen, dfs(matrix, i, j, memo));\n            }\n        }\n        return maxLen;\n    }\n    private int dfs(int[][] matrix, int r, int c, int[][] memo) {\n        if (memo[r][c] != 0) return memo[r][c];\n        int max = 1;\n        int[][] dirs = {{0, 1}, {1, 0}, {0, -1}, {-1, 0}};\n        for (int[] d : dirs) {\n            int nr = r + d[0], nc = c + d[1];\n            if (nr >= 0 && nr < matrix.length && nc >= 0 && nc < matrix[0].length && matrix[nr][nc] > matrix[r][c]) {\n                max = Math.max(max, 1 + dfs(matrix, nr, nc, memo));\n            }\n        }\n        return memo[r][c] = max;\n    }\n}",
      "python": "class Solution:\n    def longestIncreasingPath(self, matrix: list[list[int]]) -> int:\n        if not matrix: return 0\n        m, n = len(matrix), len(matrix[0])\n        memo = [[0] * n for _ in range(m)]\n        def dfs(r, c):\n            if memo[r][c]: return memo[r][c]\n            max_len = 1\n            for dr, dc in [(0, 1), (1, 0), (0, -1), (-1, 0)]:\n                nr, nc = r + dr, c + dc\n                if 0 <= nr < m and 0 <= nc < n and matrix[nr][nc] > matrix[r][c]:\n                    max_len = max(max_len, 1 + dfs(nr, nc))\n            memo[r][c] = max_len\n            return max_len\n        return max(dfs(r, c) for r in range(m) for c in range(n))",
      "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int dfs(const std::vector<std::vector<int>>& matrix, int r, int c, std::vector<std::vector<int>>& memo) {\n        if (memo[r][c] != 0) return memo[r][c];\n        int maxLen = 1;\n        int dirs[4][2] = {{0, 1}, {1, 0}, {0, -1}, {-1, 0}};\n        for (auto& d : dirs) {\n            int nr = r + d[0], nc = c + d[1];\n            if (nr >= 0 && nr < (int)matrix.size() && nc >= 0 && nc < (int)matrix[0].size() && matrix[nr][nc] > matrix[r][c]) {\n                maxLen = std::max(maxLen, 1 + dfs(matrix, nr, nc, memo));\n            }\n        }\n        return memo[r][c] = maxLen;\n    }\n    int longestIncreasingPath(std::vector<std::vector<int>>& matrix) {\n        if (matrix.empty() || matrix[0].empty()) return 0;\n        int m = matrix.size(), n = matrix[0].size(), maxLen = 0;\n        std::vector<std::vector<int>> memo(m, std::vector<int>(n, 0));\n        for (int i = 0; i < m; ++i) {\n            for (int j = 0; j < n; ++j) {\n                maxLen = std::max(maxLen, dfs(matrix, i, j, memo));\n            }\n        }\n        return maxLen;\n    }\n};",
      "javascript": "function longestIncreasingPath(matrix) {\n    if (!matrix || matrix.length === 0) return 0;\n    const m = matrix.length, n = matrix[0].length;\n    const memo = Array.from({ length: m }, () => new Array(n).fill(0));\n    function dfs(r, c) {\n        if (memo[r][c] !== 0) return memo[r][c];\n        let maxLen = 1;\n        const dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]];\n        for (const [dr, dc] of dirs) {\n            const nr = r + dr, nc = c + dc;\n            if (nr >= 0 && nr < m && nc >= 0 && nc < n && matrix[nr][nc] > matrix[r][c]) {\n                maxLen = Math.max(maxLen, 1 + dfs(nr, nc));\n            }\n        }\n        return memo[r][c] = maxLen;\n    }\n    let ans = 0;\n    for (let i = 0; i < m; i++) {\n        for (let j = 0; j < n; j++) {\n            ans = Math.max(ans, dfs(i, j));\n        }\n    }\n    return ans;\n}"
    },
    "interviewProTips": [
      "Start with the state transition recurrence for Longest Increasing Path in a Matrix before writing space-optimized code.",
      "Verify base cases for empty or single element inputs to prevent out-of-bounds access."
    ],
    "approaches": {
      "brute": {
        "name": "Brute Force (Pure Recursion)",
        "tier": "brute",
        "badge": "\ud83e\udd49 Brute Force",
        "intuition": [
          "Formulate problem as recursive exploration of all choice branches without memoization.",
          "Re-evaluates identical subproblem states repeatedly, leading to exponential time complexity."
        ],
        "timeComplexity": "O(4^(M*N))",
        "spaceComplexity": "O(M * N)",
        "complexityExplanation": "Exhaustive recursion tree branches into O(4^(M*N)) operations.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int longestIncreasingPathBrute(int[][] matrix) {\n        int m = matrix.length, n = matrix[0].length, maxLen = 0;\n        for (int i = 0; i < m; i++) {\n            for (int j = 0; j < n; j++) {\n                maxLen = Math.max(maxLen, dfsBrute(matrix, i, j));\n            }\n        }\n        return maxLen;\n    }\n    private int dfsBrute(int[][] matrix, int r, int c) {\n        int max = 1;\n        int[][] dirs = {{0, 1}, {1, 0}, {0, -1}, {-1, 0}};\n        for (int[] d : dirs) {\n            int nr = r + d[0], nc = c + d[1];\n            if (nr >= 0 && nr < matrix.length && nc >= 0 && nc < matrix[0].length && matrix[nr][nc] > matrix[r][c]) {\n                max = Math.max(max, 1 + dfsBrute(matrix, nr, nc));\n            }\n        }\n        return max;\n    }\n}",
          "python": "class Solution:\n    def longestIncreasingPathBrute(self, matrix: list[list[int]]) -> int:\n        m, n = len(matrix), len(matrix[0])\n        def dfs(r, c):\n            max_len = 1\n            for dr, dc in [(0, 1), (1, 0), (0, -1), (-1, 0)]:\n                nr, nc = r + dr, c + dc\n                if 0 <= nr < m and 0 <= nc < n and matrix[nr][nc] > matrix[r][c]:\n                    max_len = max(max_len, 1 + dfs(nr, nc))\n            return max_len\n        return max(dfs(r, c) for r in range(m) for c in range(n))",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int dfsBrute(const std::vector<std::vector<int>>& matrix, int r, int c) {\n        int maxLen = 1;\n        int dirs[4][2] = {{0, 1}, {1, 0}, {0, -1}, {-1, 0}};\n        for (auto& d : dirs) {\n            int nr = r + d[0], nc = c + d[1];\n            if (nr >= 0 && nr < (int)matrix.size() && nc >= 0 && nc < (int)matrix[0].size() && matrix[nr][nc] > matrix[r][c]) {\n                maxLen = std::max(maxLen, 1 + dfsBrute(matrix, nr, nc));\n            }\n        }\n        return maxLen;\n    }\n    int longestIncreasingPathBrute(std::vector<std::vector<int>>& matrix) {\n        int m = matrix.size(), n = matrix[0].size(), maxLen = 0;\n        for (int i = 0; i < m; ++i) {\n            for (int j = 0; j < n; ++j) {\n                maxLen = std::max(maxLen, dfsBrute(matrix, i, j));\n            }\n        }\n        return maxLen;\n    }\n};",
          "javascript": "function longestIncreasingPathBrute(matrix) {\n    const m = matrix.length, n = matrix[0].length;\n    function dfs(r, c) {\n        let maxLen = 1;\n        const dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]];\n        for (const [dr, dc] of dirs) {\n            const nr = r + dr, nc = c + dc;\n            if (nr >= 0 && nr < m && nc >= 0 && nc < n && matrix[nr][nc] > matrix[r][c]) {\n                maxLen = Math.max(maxLen, 1 + dfs(nr, nc));\n            }\n        }\n        return maxLen;\n    }\n    let ans = 0;\n    for (let i = 0; i < m; i++) {\n        for (let j = 0; j < n; j++) {\n            ans = Math.max(ans, dfs(i, j));\n        }\n    }\n    return ans;\n}"
        }
      },
      "better": {
        "name": "Better (Memoized DFS / 2D DP Table)",
        "tier": "better",
        "badge": "\ud83e\udd48 Better",
        "intuition": [
          "Store previously computed subproblem states in a lookup table or matrix.",
          "If a state is already visited, return the stored value immediately in O(1) time."
        ],
        "timeComplexity": "O(M * N)",
        "spaceComplexity": "O(M * N)",
        "complexityExplanation": "Memoization evaluates each state at most once, reducing time to O(M * N).",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int longestIncreasingPathBetter(int[][] matrix) {\n        return longestIncreasingPath(matrix);\n    }\n}",
          "python": "class Solution:\n    def longestIncreasingPathBetter(self, matrix: list[list[int]]) -> int:\n        return self.longestIncreasingPath(matrix)",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int longestIncreasingPathBetter(std::vector<std::vector<int>>& matrix) {\n        return longestIncreasingPath(matrix);\n    }\n};",
          "javascript": "function longestIncreasingPathBetter(matrix) {\n    return longestIncreasingPath(matrix);\n}"
        }
      },
      "optimal": {
        "name": "Optimal (DFS with 2D Memoization on DAG)",
        "tier": "optimal",
        "badge": "\ud83e\udd47 Optimal",
        "intuition": [
          "Strictly increasing path means the matrix has no cycles (it is a DAG).",
          "Perform DFS from each cell (r, c) with memoization: memo[r][c] caches the length of longest increasing path starting at (r, c).",
          "For each of 4 directions (dr, dc): if matrix[nr][nc] > matrix[r][c], path can extend: memo[r][c] = max(memo[r][c], 1 + dfs(nr, nc))."
        ],
        "pseudocode": [
          "FUNCTION longestIncreasingPath(matrix):",
          "  memo = Array(m, n, 0); maxLen = 0",
          "  FOR r from 0 TO m - 1:",
          "    FOR c from 0 TO n - 1:",
          "      maxLen = MAX(maxLen, dfs(r, c, matrix, memo))",
          "  RETURN maxLen"
        ],
        "timeComplexity": "O(M * N)",
        "spaceComplexity": "O(M * N)",
        "complexityExplanation": "Optimal DFS with 2D Memoization on DAG achieves O(M * N) time with O(M * N) auxiliary space.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int longestIncreasingPath(int[][] matrix) {\n        if (matrix == null || matrix.length == 0) return 0;\n        int m = matrix.length, n = matrix[0].length, maxLen = 0;\n        int[][] memo = new int[m][n];\n        for (int i = 0; i < m; i++) {\n            for (int j = 0; j < n; j++) {\n                maxLen = Math.max(maxLen, dfs(matrix, i, j, memo));\n            }\n        }\n        return maxLen;\n    }\n    private int dfs(int[][] matrix, int r, int c, int[][] memo) {\n        if (memo[r][c] != 0) return memo[r][c];\n        int max = 1;\n        int[][] dirs = {{0, 1}, {1, 0}, {0, -1}, {-1, 0}};\n        for (int[] d : dirs) {\n            int nr = r + d[0], nc = c + d[1];\n            if (nr >= 0 && nr < matrix.length && nc >= 0 && nc < matrix[0].length && matrix[nr][nc] > matrix[r][c]) {\n                max = Math.max(max, 1 + dfs(matrix, nr, nc, memo));\n            }\n        }\n        return memo[r][c] = max;\n    }\n}",
          "python": "class Solution:\n    def longestIncreasingPath(self, matrix: list[list[int]]) -> int:\n        if not matrix: return 0\n        m, n = len(matrix), len(matrix[0])\n        memo = [[0] * n for _ in range(m)]\n        def dfs(r, c):\n            if memo[r][c]: return memo[r][c]\n            max_len = 1\n            for dr, dc in [(0, 1), (1, 0), (0, -1), (-1, 0)]:\n                nr, nc = r + dr, c + dc\n                if 0 <= nr < m and 0 <= nc < n and matrix[nr][nc] > matrix[r][c]:\n                    max_len = max(max_len, 1 + dfs(nr, nc))\n            memo[r][c] = max_len\n            return max_len\n        return max(dfs(r, c) for r in range(m) for c in range(n))",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int dfs(const std::vector<std::vector<int>>& matrix, int r, int c, std::vector<std::vector<int>>& memo) {\n        if (memo[r][c] != 0) return memo[r][c];\n        int maxLen = 1;\n        int dirs[4][2] = {{0, 1}, {1, 0}, {0, -1}, {-1, 0}};\n        for (auto& d : dirs) {\n            int nr = r + d[0], nc = c + d[1];\n            if (nr >= 0 && nr < (int)matrix.size() && nc >= 0 && nc < (int)matrix[0].size() && matrix[nr][nc] > matrix[r][c]) {\n                maxLen = std::max(maxLen, 1 + dfs(matrix, nr, nc, memo));\n            }\n        }\n        return memo[r][c] = maxLen;\n    }\n    int longestIncreasingPath(std::vector<std::vector<int>>& matrix) {\n        if (matrix.empty() || matrix[0].empty()) return 0;\n        int m = matrix.size(), n = matrix[0].size(), maxLen = 0;\n        std::vector<std::vector<int>> memo(m, std::vector<int>(n, 0));\n        for (int i = 0; i < m; ++i) {\n            for (int j = 0; j < n; ++j) {\n                maxLen = std::max(maxLen, dfs(matrix, i, j, memo));\n            }\n        }\n        return maxLen;\n    }\n};",
          "javascript": "function longestIncreasingPath(matrix) {\n    if (!matrix || matrix.length === 0) return 0;\n    const m = matrix.length, n = matrix[0].length;\n    const memo = Array.from({ length: m }, () => new Array(n).fill(0));\n    function dfs(r, c) {\n        if (memo[r][c] !== 0) return memo[r][c];\n        let maxLen = 1;\n        const dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]];\n        for (const [dr, dc] of dirs) {\n            const nr = r + dr, nc = c + dc;\n            if (nr >= 0 && nr < m && nc >= 0 && nc < n && matrix[nr][nc] > matrix[r][c]) {\n                maxLen = Math.max(maxLen, 1 + dfs(nr, nc));\n            }\n        }\n        return memo[r][c] = maxLen;\n    }\n    let ans = 0;\n    for (let i = 0; i < m; i++) {\n        for (let j = 0; j < n; j++) {\n            ans = Math.max(ans, dfs(i, j));\n        }\n    }\n    return ans;\n}"
        }
      }
    }
  },
  "maximum_sum_increasing_subsequence": {
    "questionId": "archetype-maximum_sum_increasing_subsequence",
    "pattern": "1D Dynamic Programming Tabulation",
    "intuition": [
      "Find the subsequence of a given array such that the sum is maximum and the numbers are in increasing order.",
      "Let msis[i] be the maximum sum of increasing subsequence ending at index i.",
      "msis[i] = arr[i] + max({msis[j] for j < i and arr[j] < arr[i]} U {0})."
    ],
    "pseudocode": [
      "FUNCTION maxSumIS(arr, n):",
      "  msis = arr.clone()",
      "  maxSum = arr[0]",
      "  FOR i from 1 TO n - 1:",
      "    FOR j from 0 TO i - 1:",
      "      IF arr[j] < arr[i]:",
      "        msis[i] = MAX(msis[i], msis[j] + arr[i])",
      "    maxSum = MAX(maxSum, msis[i])",
      "  RETURN maxSum"
    ],
    "timeComplexity": "O(N\u00b2)",
    "spaceComplexity": "O(N)",
    "complexityExplanation": "Optimal 1D Dynamic Programming Tabulation achieves O(N\u00b2) time with O(N) space.",
    "edgeCases": [
      "Single element",
      "Descending array",
      "All elements equal"
    ],
    "code": {
      "java": "import java.util.*;\n\npublic class Solution {\n    public int maxSumIS(int[] arr, int n) {\n        int[] msis = new int[n];\n        int max = 0;\n        for (int i = 0; i < n; i++) {\n            msis[i] = arr[i];\n            for (int j = 0; j < i; j++) {\n                if (arr[j] < arr[i]) {\n                    msis[i] = Math.max(msis[i], msis[j] + arr[i]);\n                }\n            }\n            max = Math.max(max, msis[i]);\n        }\n        return max;\n    }\n}",
      "python": "class Solution:\n    def maxSumIS(self, arr: list[int], n: int) -> int:\n        msis = list(arr)\n        max_sum = 0\n        for i in range(n):\n            for j in range(i):\n                if arr[j] < arr[i]:\n                    msis[i] = max(msis[i], msis[j] + arr[i])\n            max_sum = max(max_sum, msis[i])\n        return max_sum",
      "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int maxSumIS(std::vector<int>& arr, int n) {\n        std::vector<int> msis = arr;\n        int maxVal = 0;\n        for (int i = 0; i < n; ++i) {\n            for (int j = 0; j < i; ++j) {\n                if (arr[j] < arr[i]) {\n                    msis[i] = std::max(msis[i], msis[j] + arr[i]);\n                }\n            }\n            maxVal = std::max(maxVal, msis[i]);\n        }\n        return maxVal;\n    }\n};",
      "javascript": "function maxSumIS(arr, n) {\n    const msis = [...arr];\n    let maxVal = 0;\n    for (let i = 0; i < n; i++) {\n        for (let j = 0; j < i; j++) {\n            if (arr[j] < arr[i]) {\n                msis[i] = Math.max(msis[i], msis[j] + arr[i]);\n            }\n        }\n        maxVal = Math.max(maxVal, msis[i]);\n    }\n    return maxVal;\n}"
    },
    "interviewProTips": [
      "Start with the state transition recurrence for Maximum Sum Increasing Subsequence before writing space-optimized code.",
      "Verify base cases for empty or single element inputs to prevent out-of-bounds access."
    ],
    "approaches": {
      "brute": {
        "name": "Brute Force (Pure Recursion)",
        "tier": "brute",
        "badge": "\ud83e\udd49 Brute Force",
        "intuition": [
          "Formulate problem as recursive exploration of all choice branches without memoization.",
          "Re-evaluates identical subproblem states repeatedly, leading to exponential time complexity."
        ],
        "timeComplexity": "O(2\u207f)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Exhaustive recursion tree branches into O(2\u207f) operations.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int maxSumISBrute(int[] arr, int n) {\n        return helper(arr, 0, -1);\n    }\n    private int helper(int[] arr, int idx, int prevIdx) {\n        if (idx == arr.length) return 0;\n        int notTake = helper(arr, idx + 1, prevIdx);\n        int take = 0;\n        if (prevIdx == -1 || arr[idx] > arr[prevIdx]) {\n            take = arr[idx] + helper(arr, idx + 1, idx);\n        }\n        return Math.max(take, notTake);\n    }\n}",
          "python": "class Solution:\n    def maxSumISBrute(self, arr: list[int], n: int) -> int:\n        def h(idx, prev):\n            if idx == n: return 0\n            not_take = h(idx + 1, prev)\n            take = arr[idx] + h(idx + 1, idx) if prev == -1 or arr[idx] > arr[prev] else 0\n            return max(take, not_take)\n        return h(0, -1)",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int helper(const std::vector<int>& arr, int idx, int prevIdx) {\n        if (idx == (int)arr.size()) return 0;\n        int notTake = helper(arr, idx + 1, prevIdx);\n        int take = 0;\n        if (prevIdx == -1 || arr[idx] > arr[prevIdx]) {\n            take = arr[idx] + helper(arr, idx + 1, idx);\n        }\n        return std::max(take, notTake);\n    }\n    int maxSumISBrute(std::vector<int>& arr, int n) {\n        return helper(arr, 0, -1);\n    }\n};",
          "javascript": "function maxSumISBrute(arr, n) {\n    function h(idx, prev) {\n        if (idx === n) return 0;\n        const notTake = h(idx + 1, prev);\n        const take = (prev === -1 || arr[idx] > arr[prev]) ? arr[idx] + h(idx + 1, idx) : 0;\n        return Math.max(take, notTake);\n    }\n    return h(0, -1);\n}"
        }
      },
      "better": {
        "name": "Better (Memoized DFS / 2D DP Table)",
        "tier": "better",
        "badge": "\ud83e\udd48 Better",
        "intuition": [
          "Store previously computed subproblem states in a lookup table or matrix.",
          "If a state is already visited, return the stored value immediately in O(1) time."
        ],
        "timeComplexity": "O(N\u00b2)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Memoization evaluates each state at most once, reducing time to O(N\u00b2).",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int maxSumISBetter(int[] arr, int n) {\n        return maxSumIS(arr, n);\n    }\n}",
          "python": "class Solution:\n    def maxSumISBetter(self, arr: list[int], n: int) -> int:\n        return self.maxSumIS(arr, n)",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int maxSumISBetter(std::vector<int>& arr, int n) {\n        return maxSumIS(arr, n);\n    }\n};",
          "javascript": "function maxSumISBetter(arr, n) {\n    return maxSumIS(arr, n);\n}"
        }
      },
      "optimal": {
        "name": "Optimal (1D Dynamic Programming Tabulation)",
        "tier": "optimal",
        "badge": "\ud83e\udd47 Optimal",
        "intuition": [
          "Find the subsequence of a given array such that the sum is maximum and the numbers are in increasing order.",
          "Let msis[i] be the maximum sum of increasing subsequence ending at index i.",
          "msis[i] = arr[i] + max({msis[j] for j < i and arr[j] < arr[i]} U {0})."
        ],
        "pseudocode": [
          "FUNCTION maxSumIS(arr, n):",
          "  msis = arr.clone()",
          "  maxSum = arr[0]",
          "  FOR i from 1 TO n - 1:",
          "    FOR j from 0 TO i - 1:",
          "      IF arr[j] < arr[i]:",
          "        msis[i] = MAX(msis[i], msis[j] + arr[i])",
          "    maxSum = MAX(maxSum, msis[i])",
          "  RETURN maxSum"
        ],
        "timeComplexity": "O(N\u00b2)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Optimal 1D Dynamic Programming Tabulation achieves O(N\u00b2) time with O(N) auxiliary space.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int maxSumIS(int[] arr, int n) {\n        int[] msis = new int[n];\n        int max = 0;\n        for (int i = 0; i < n; i++) {\n            msis[i] = arr[i];\n            for (int j = 0; j < i; j++) {\n                if (arr[j] < arr[i]) {\n                    msis[i] = Math.max(msis[i], msis[j] + arr[i]);\n                }\n            }\n            max = Math.max(max, msis[i]);\n        }\n        return max;\n    }\n}",
          "python": "class Solution:\n    def maxSumIS(self, arr: list[int], n: int) -> int:\n        msis = list(arr)\n        max_sum = 0\n        for i in range(n):\n            for j in range(i):\n                if arr[j] < arr[i]:\n                    msis[i] = max(msis[i], msis[j] + arr[i])\n            max_sum = max(max_sum, msis[i])\n        return max_sum",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int maxSumIS(std::vector<int>& arr, int n) {\n        std::vector<int> msis = arr;\n        int maxVal = 0;\n        for (int i = 0; i < n; ++i) {\n            for (int j = 0; j < i; ++j) {\n                if (arr[j] < arr[i]) {\n                    msis[i] = std::max(msis[i], msis[j] + arr[i]);\n                }\n            }\n            maxVal = std::max(maxVal, msis[i]);\n        }\n        return maxVal;\n    }\n};",
          "javascript": "function maxSumIS(arr, n) {\n    const msis = [...arr];\n    let maxVal = 0;\n    for (let i = 0; i < n; i++) {\n        for (let j = 0; j < i; j++) {\n            if (arr[j] < arr[i]) {\n                msis[i] = Math.max(msis[i], msis[j] + arr[i]);\n            }\n        }\n        maxVal = Math.max(maxVal, msis[i]);\n    }\n    return maxVal;\n}"
        }
      }
    }
  },
  "palindrome_partitioning_ii": {
    "questionId": "archetype-palindrome_partitioning_ii",
    "pattern": "1D DP with Expand-Around-Center Palindrome Check",
    "intuition": [
      "Find minimum cuts needed for a palindrome partitioning of s.",
      "dp[i] represents min cuts for prefix s[0..i].",
      "Initialize dp[i] = i (maximum cuts, cutting every char).",
      "Expand around every center: for every palindrome s[j..i], dp[i] = min(dp[i], j == 0 ? 0 : dp[j-1] + 1)."
    ],
    "pseudocode": [
      "FUNCTION minCut(s):",
      "  n = s.length; dp = Array(n, 0 to n-1)",
      "  FOR mid from 0 TO n - 1:",
      "    // Odd length palindromes",
      "    expand(mid, mid, dp, s)",
      "    // Even length palindromes",
      "    expand(mid, mid + 1, dp, s)",
      "  RETURN dp[n - 1]"
    ],
    "timeComplexity": "O(N\u00b2)",
    "spaceComplexity": "O(N)",
    "complexityExplanation": "Optimal 1D DP with Expand-Around-Center Palindrome Check achieves O(N\u00b2) time with O(N) space.",
    "edgeCases": [
      "Already a palindrome (returns 0)",
      "All unique characters (returns n - 1)",
      "Single character (returns 0)"
    ],
    "code": {
      "java": "import java.util.*;\n\npublic class Solution {\n    public int minCut(String s) {\n        int n = s.length();\n        int[] dp = new int[n];\n        for (int i = 0; i < n; i++) dp[i] = i;\n        for (int mid = 0; mid < n; mid++) {\n            // Odd length\n            for (int j = 0; mid - j >= 0 && mid + j < n && s.charAt(mid - j) == s.charAt(mid + j); j++) {\n                int start = mid - j, end = mid + j;\n                dp[end] = Math.min(dp[end], start == 0 ? 0 : dp[start - 1] + 1);\n            }\n            // Even length\n            for (int j = 0; mid - j >= 0 && mid + 1 + j < n && s.charAt(mid - j) == s.charAt(mid + 1 + j); j++) {\n                int start = mid - j, end = mid + 1 + j;\n                dp[end] = Math.min(dp[end], start == 0 ? 0 : dp[start - 1] + 1);\n            }\n        }\n        return dp[n - 1];\n    }\n}",
      "python": "class Solution:\n    def minCut(self, s: str) -> int:\n        n = len(s)\n        dp = list(range(n))\n        for mid in range(n):\n            # Odd length\n            j = 0\n            while mid - j >= 0 and mid + j < n and s[mid - j] == s[mid + j]:\n                start, end = mid - j, mid + j\n                dp[end] = min(dp[end], 0 if start == 0 else dp[start - 1] + 1)\n                j += 1\n            # Even length\n            j = 0\n            while mid - j >= 0 and mid + 1 + j < n and s[mid - j] == s[mid + 1 + j]:\n                start, end = mid - j, mid + 1 + j\n                dp[end] = min(dp[end], 0 if start == 0 else dp[start - 1] + 1)\n                j += 1\n        return dp[n - 1]",
      "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int minCut(std::string s) {\n        int n = s.length();\n        std::vector<int> dp(n);\n        for (int i = 0; i < n; ++i) dp[i] = i;\n        for (int mid = 0; mid < n; ++mid) {\n            for (int j = 0; mid - j >= 0 && mid + j < n && s[mid - j] == s[mid + j]; ++j) {\n                int start = mid - j, end = mid + j;\n                dp[end] = std::min(dp[end], start == 0 ? 0 : dp[start - 1] + 1);\n            }\n            for (int j = 0; mid - j >= 0 && mid + 1 + j < n && s[mid - j] == s[mid + 1 + j]; ++j) {\n                int start = mid - j, end = mid + 1 + j;\n                dp[end] = std::min(dp[end], start == 0 ? 0 : dp[start - 1] + 1);\n            }\n        }\n        return dp[n - 1];\n    }\n};",
      "javascript": "function minCut(s) {\n    const n = s.length;\n    const dp = Array.from({ length: n }, (_, i) => i);\n    for (let mid = 0; mid < n; mid++) {\n        for (let j = 0; mid - j >= 0 && mid + j < n && s[mid - j] === s[mid + j]; j++) {\n            const start = mid - j, end = mid + j;\n            dp[end] = Math.min(dp[end], start === 0 ? 0 : dp[start - 1] + 1);\n        }\n        for (let j = 0; mid - j >= 0 && mid + 1 + j < n && s[mid - j] === s[mid + 1 + j]; j++) {\n            const start = mid - j, end = mid + 1 + j;\n            dp[end] = Math.min(dp[end], start === 0 ? 0 : dp[start - 1] + 1);\n        }\n    }\n    return dp[n - 1];\n}"
    },
    "interviewProTips": [
      "Start with the state transition recurrence for Palindrome Partitioning II before writing space-optimized code.",
      "Verify base cases for empty or single element inputs to prevent out-of-bounds access."
    ],
    "approaches": {
      "brute": {
        "name": "Brute Force (Pure Recursion)",
        "tier": "brute",
        "badge": "\ud83e\udd49 Brute Force",
        "intuition": [
          "Formulate problem as recursive exploration of all choice branches without memoization.",
          "Re-evaluates identical subproblem states repeatedly, leading to exponential time complexity."
        ],
        "timeComplexity": "O(2\u207f)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Exhaustive recursion tree branches into O(2\u207f) operations.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int minCutBrute(String s) {\n        return helper(s, 0, s.length() - 1);\n    }\n    private int helper(String s, int i, int j) {\n        if (i >= j || isPalindrome(s, i, j)) return 0;\n        int minCuts = Integer.MAX_VALUE;\n        for (int k = i; k < j; k++) {\n            if (isPalindrome(s, i, k)) {\n                minCuts = Math.min(minCuts, 1 + helper(s, k + 1, j));\n            }\n        }\n        return minCuts;\n    }\n    private boolean isPalindrome(String s, int l, int r) {\n        while (l < r) if (s.charAt(l++) != s.charAt(r--)) return false;\n        return true;\n    }\n}",
          "python": "class Solution:\n    def minCutBrute(self, s: str) -> int:\n        def is_pal(i, j):\n            while i < j:\n                if s[i] != s[j]: return False\n                i, j = i + 1, j - 1\n            return True\n        def h(i, j):\n            if i >= j or is_pal(i, j): return 0\n            ans = float('inf')\n            for k in range(i, j):\n                if is_pal(i, k):\n                    ans = min(ans, 1 + h(k + 1, j))\n            return ans\n        return h(0, len(s) - 1)",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    bool isPal(const std::string& s, int l, int r) {\n        while (l < r) if (s[l++] != s[r--]) return false;\n        return true;\n    }\n    int helper(const std::string& s, int i, int j) {\n        if (i >= j || isPal(s, i, j)) return 0;\n        int minCuts = 1e9;\n        for (int k = i; k < j; ++k) {\n            if (isPal(s, i, k)) minCuts = std::min(minCuts, 1 + helper(s, k + 1, j));\n        }\n        return minCuts;\n    }\n    int minCutBrute(std::string s) {\n        return helper(s, 0, (int)s.size() - 1);\n    }\n};",
          "javascript": "function minCutBrute(s) {\n    function isPal(l, r) {\n        while (l < r) if (s[l++] !== s[r--]) return false;\n        return true;\n    }\n    function h(i, j) {\n        if (i >= j || isPal(i, j)) return 0;\n        let ans = Infinity;\n        for (let k = i; k < j; k++) {\n            if (isPal(i, k)) ans = Math.min(ans, 1 + h(k + 1, j));\n        }\n        return ans;\n    }\n    return h(0, s.length - 1);\n}"
        }
      },
      "better": {
        "name": "Better (Memoized DFS / 2D DP Table)",
        "tier": "better",
        "badge": "\ud83e\udd48 Better",
        "intuition": [
          "Store previously computed subproblem states in a lookup table or matrix.",
          "If a state is already visited, return the stored value immediately in O(1) time."
        ],
        "timeComplexity": "O(N\u00b2)",
        "spaceComplexity": "O(N\u00b2)",
        "complexityExplanation": "Memoization evaluates each state at most once, reducing time to O(N\u00b2).",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int minCutBetter(String s) {\n        int n = s.length();\n        boolean[][] isPal = new boolean[n][n];\n        for (int i = n - 1; i >= 0; i--) {\n            for (int j = i; j < n; j++) {\n                if (s.charAt(i) == s.charAt(j) && (j - i <= 2 || isPal[i + 1][j - 1])) {\n                    isPal[i][j] = true;\n                }\n            }\n        }\n        int[] dp = new int[n];\n        for (int i = 0; i < n; i++) {\n            if (isPal[0][i]) {\n                dp[i] = 0;\n            } else {\n                dp[i] = i;\n                for (int j = 0; j < i; j++) {\n                    if (isPal[j + 1][i]) dp[i] = Math.min(dp[i], dp[j] + 1);\n                }\n            }\n        }\n        return dp[n - 1];\n    }\n}",
          "python": "class Solution:\n    def minCutBetter(self, s: str) -> int:\n        n = len(s)\n        is_pal = [[False] * n for _ in range(n)]\n        for i in range(n - 1, -1, -1):\n            for j in range(i, n):\n                if s[i] == s[j] and (j - i <= 2 or is_pal[i + 1][j - 1]):\n                    is_pal[i][j] = True\n        dp = [i for i in range(n)]\n        for i in range(n):\n            if is_pal[0][i]:\n                dp[i] = 0\n            else:\n                for j in range(i):\n                    if is_pal[j + 1][i]:\n                        dp[i] = min(dp[i], dp[j] + 1)\n        return dp[n - 1]",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int minCutBetter(std::string s) {\n        int n = s.length();\n        std::vector<std::vector<bool>> isPal(n, std::vector<bool>(n, false));\n        for (int i = n - 1; i >= 0; --i) {\n            for (int j = i; j < n; ++j) {\n                if (s[i] == s[j] && (j - i <= 2 || isPal[i + 1][j - 1])) isPal[i][j] = true;\n            }\n        }\n        std::vector<int> dp(n);\n        for (int i = 0; i < n; ++i) {\n            if (isPal[0][i]) dp[i] = 0;\n            else {\n                dp[i] = i;\n                for (int j = 0; j < i; ++j) {\n                    if (isPal[j + 1][i]) dp[i] = std::min(dp[i], dp[j] + 1);\n                }\n            }\n        }\n        return dp[n - 1];\n    }\n};",
          "javascript": "function minCutBetter(s) {\n    const n = s.length;\n    const isPal = Array.from({ length: n }, () => new Array(n).fill(false));\n    for (let i = n - 1; i >= 0; i--) {\n        for (let j = i; j < n; j++) {\n            if (s[i] === s[j] && (j - i <= 2 || isPal[i + 1][j - 1])) isPal[i][j] = true;\n        }\n    }\n    const dp = Array.from({ length: n }, (_, i) => i);\n    for (let i = 0; i < n; i++) {\n        if (isPal[0][i]) dp[i] = 0;\n        else {\n            for (let j = 0; j < i; j++) {\n                if (isPal[j + 1][i]) dp[i] = Math.min(dp[i], dp[j] + 1);\n            }\n        }\n    }\n    return dp[n - 1];\n}"
        }
      },
      "optimal": {
        "name": "Optimal (1D DP with Expand-Around-Center Palindrome Check)",
        "tier": "optimal",
        "badge": "\ud83e\udd47 Optimal",
        "intuition": [
          "Find minimum cuts needed for a palindrome partitioning of s.",
          "dp[i] represents min cuts for prefix s[0..i].",
          "Initialize dp[i] = i (maximum cuts, cutting every char).",
          "Expand around every center: for every palindrome s[j..i], dp[i] = min(dp[i], j == 0 ? 0 : dp[j-1] + 1)."
        ],
        "pseudocode": [
          "FUNCTION minCut(s):",
          "  n = s.length; dp = Array(n, 0 to n-1)",
          "  FOR mid from 0 TO n - 1:",
          "    // Odd length palindromes",
          "    expand(mid, mid, dp, s)",
          "    // Even length palindromes",
          "    expand(mid, mid + 1, dp, s)",
          "  RETURN dp[n - 1]"
        ],
        "timeComplexity": "O(N\u00b2)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Optimal 1D DP with Expand-Around-Center Palindrome Check achieves O(N\u00b2) time with O(N) auxiliary space.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int minCut(String s) {\n        int n = s.length();\n        int[] dp = new int[n];\n        for (int i = 0; i < n; i++) dp[i] = i;\n        for (int mid = 0; mid < n; mid++) {\n            // Odd length\n            for (int j = 0; mid - j >= 0 && mid + j < n && s.charAt(mid - j) == s.charAt(mid + j); j++) {\n                int start = mid - j, end = mid + j;\n                dp[end] = Math.min(dp[end], start == 0 ? 0 : dp[start - 1] + 1);\n            }\n            // Even length\n            for (int j = 0; mid - j >= 0 && mid + 1 + j < n && s.charAt(mid - j) == s.charAt(mid + 1 + j); j++) {\n                int start = mid - j, end = mid + 1 + j;\n                dp[end] = Math.min(dp[end], start == 0 ? 0 : dp[start - 1] + 1);\n            }\n        }\n        return dp[n - 1];\n    }\n}",
          "python": "class Solution:\n    def minCut(self, s: str) -> int:\n        n = len(s)\n        dp = list(range(n))\n        for mid in range(n):\n            # Odd length\n            j = 0\n            while mid - j >= 0 and mid + j < n and s[mid - j] == s[mid + j]:\n                start, end = mid - j, mid + j\n                dp[end] = min(dp[end], 0 if start == 0 else dp[start - 1] + 1)\n                j += 1\n            # Even length\n            j = 0\n            while mid - j >= 0 and mid + 1 + j < n and s[mid - j] == s[mid + 1 + j]:\n                start, end = mid - j, mid + 1 + j\n                dp[end] = min(dp[end], 0 if start == 0 else dp[start - 1] + 1)\n                j += 1\n        return dp[n - 1]",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int minCut(std::string s) {\n        int n = s.length();\n        std::vector<int> dp(n);\n        for (int i = 0; i < n; ++i) dp[i] = i;\n        for (int mid = 0; mid < n; ++mid) {\n            for (int j = 0; mid - j >= 0 && mid + j < n && s[mid - j] == s[mid + j]; ++j) {\n                int start = mid - j, end = mid + j;\n                dp[end] = std::min(dp[end], start == 0 ? 0 : dp[start - 1] + 1);\n            }\n            for (int j = 0; mid - j >= 0 && mid + 1 + j < n && s[mid - j] == s[mid + 1 + j]; ++j) {\n                int start = mid - j, end = mid + 1 + j;\n                dp[end] = std::min(dp[end], start == 0 ? 0 : dp[start - 1] + 1);\n            }\n        }\n        return dp[n - 1];\n    }\n};",
          "javascript": "function minCut(s) {\n    const n = s.length;\n    const dp = Array.from({ length: n }, (_, i) => i);\n    for (let mid = 0; mid < n; mid++) {\n        for (let j = 0; mid - j >= 0 && mid + j < n && s[mid - j] === s[mid + j]; j++) {\n            const start = mid - j, end = mid + j;\n            dp[end] = Math.min(dp[end], start === 0 ? 0 : dp[start - 1] + 1);\n        }\n        for (let j = 0; mid - j >= 0 && mid + 1 + j < n && s[mid - j] === s[mid + 1 + j]; j++) {\n            const start = mid - j, end = mid + 1 + j;\n            dp[end] = Math.min(dp[end], start === 0 ? 0 : dp[start - 1] + 1);\n        }\n    }\n    return dp[n - 1];\n}"
        }
      }
    }
  },
  "jump_game_ii": {
    "questionId": "archetype-jump_game_ii",
    "pattern": "Greedy Interval BFS / 1D DP",
    "intuition": [
      "Find minimum number of jumps to reach the last index.",
      "Maintain current jump coverage window [curStart, curEnd] and track curFarthest reachable.",
      "When current index reaches curEnd, a new jump must be taken: jumps++, curEnd = curFarthest."
    ],
    "pseudocode": [
      "FUNCTION jump(nums):",
      "  jumps = 0, curEnd = 0, curFarthest = 0",
      "  FOR i from 0 TO nums.length - 2:",
      "    curFarthest = MAX(curFarthest, i + nums[i])",
      "    IF i == curEnd:",
      "      jumps++",
      "      curEnd = curFarthest",
      "  RETURN jumps"
    ],
    "timeComplexity": "O(N)",
    "spaceComplexity": "O(1)",
    "complexityExplanation": "Optimal Greedy Interval BFS / 1D DP achieves O(N) time with O(1) space.",
    "edgeCases": [
      "Single element (0 jumps)",
      "Already at last index",
      "Greedy jump leaps to end"
    ],
    "code": {
      "java": "import java.util.*;\n\npublic class Solution {\n    public int jump(int[] nums) {\n        int jumps = 0, curEnd = 0, curFarthest = 0;\n        for (int i = 0; i < nums.length - 1; i++) {\n            curFarthest = Math.max(curFarthest, i + nums[i]);\n            if (i == curEnd) {\n                jumps++;\n                curEnd = curFarthest;\n            }\n        }\n        return jumps;\n    }\n}",
      "python": "class Solution:\n    def jump(self, nums: list[int]) -> int:\n        jumps, cur_end, cur_farthest = 0, 0, 0\n        for i in range(len(nums) - 1):\n            cur_farthest = max(cur_farthest, i + nums[i])\n            if i == cur_end:\n                jumps += 1\n                cur_end = cur_farthest\n        return jumps",
      "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int jump(std::vector<int>& nums) {\n        int jumps = 0, curEnd = 0, curFarthest = 0;\n        for (int i = 0; i < (int)nums.size() - 1; ++i) {\n            curFarthest = std::max(curFarthest, i + nums[i]);\n            if (i == curEnd) {\n                jumps++;\n                curEnd = curFarthest;\n            }\n        }\n        return jumps;\n    }\n};",
      "javascript": "function jump(nums) {\n    let jumps = 0, curEnd = 0, curFarthest = 0;\n    for (let i = 0; i < nums.length - 1; i++) {\n        curFarthest = Math.max(curFarthest, i + nums[i]);\n        if (i === curEnd) {\n            jumps++;\n            curEnd = curFarthest;\n        }\n    }\n    return jumps;\n}"
    },
    "interviewProTips": [
      "Start with the state transition recurrence for Jump Game II before writing space-optimized code.",
      "Verify base cases for empty or single element inputs to prevent out-of-bounds access."
    ],
    "approaches": {
      "brute": {
        "name": "Brute Force (Pure Recursion)",
        "tier": "brute",
        "badge": "\ud83e\udd49 Brute Force",
        "intuition": [
          "Formulate problem as recursive exploration of all choice branches without memoization.",
          "Re-evaluates identical subproblem states repeatedly, leading to exponential time complexity."
        ],
        "timeComplexity": "O(2\u207f)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Exhaustive recursion tree branches into O(2\u207f) operations.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int jumpBrute(int[] nums) {\n        return helper(nums, 0);\n    }\n    private int helper(int[] nums, int idx) {\n        if (idx >= nums.length - 1) return 0;\n        int minJumps = 100000;\n        for (int j = 1; j <= nums[idx]; j++) {\n            minJumps = Math.min(minJumps, 1 + helper(nums, idx + j));\n        }\n        return minJumps;\n    }\n}",
          "python": "class Solution:\n    def jumpBrute(self, nums: list[int]) -> int:\n        def h(idx):\n            if idx >= len(nums) - 1: return 0\n            res = float('inf')\n            for j in range(1, nums[idx] + 1):\n                res = min(res, 1 + h(idx + j))\n            return res\n        return h(0)",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int helper(const std::vector<int>& nums, int idx) {\n        if (idx >= (int)nums.size() - 1) return 0;\n        int minJumps = 1e9;\n        for (int j = 1; j <= nums[idx]; ++j) {\n            minJumps = std::min(minJumps, 1 + helper(nums, idx + j));\n        }\n        return minJumps;\n    }\n    int jumpBrute(std::vector<int>& nums) {\n        return helper(nums, 0);\n    }\n};",
          "javascript": "function jumpBrute(nums) {\n    function h(idx) {\n        if (idx >= nums.length - 1) return 0;\n        let minJumps = Infinity;\n        for (let j = 1; j <= nums[idx]; j++) {\n            minJumps = Math.min(minJumps, 1 + h(idx + j));\n        }\n        return minJumps;\n    }\n    return h(0);\n}"
        }
      },
      "better": {
        "name": "Better (Memoized DFS / 2D DP Table)",
        "tier": "better",
        "badge": "\ud83e\udd48 Better",
        "intuition": [
          "Store previously computed subproblem states in a lookup table or matrix.",
          "If a state is already visited, return the stored value immediately in O(1) time."
        ],
        "timeComplexity": "O(N\u00b2)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Memoization evaluates each state at most once, reducing time to O(N\u00b2).",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int jumpBetter(int[] nums) {\n        int n = nums.length;\n        int[] dp = new int[n];\n        Arrays.fill(dp, Integer.MAX_VALUE);\n        dp[0] = 0;\n        for (int i = 0; i < n; i++) {\n            if (dp[i] == Integer.MAX_VALUE) continue;\n            for (int j = 1; j <= nums[i] && i + j < n; j++) {\n                dp[i + j] = Math.min(dp[i + j], dp[i] + 1);\n            }\n        }\n        return dp[n - 1];\n    }\n}",
          "python": "class Solution:\n    def jumpBetter(self, nums: list[int]) -> int:\n        n = len(nums)\n        dp = [float('inf')] * n\n        dp[0] = 0\n        for i in range(n):\n            for j in range(1, nums[i] + 1):\n                if i + j < n:\n                    dp[i + j] = min(dp[i + j], dp[i] + 1)\n        return dp[n - 1]",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int jumpBetter(std::vector<int>& nums) {\n        int n = nums.size();\n        std::vector<int> dp(n, 1e9);\n        dp[0] = 0;\n        for (int i = 0; i < n; ++i) {\n            for (int j = 1; j <= nums[i] && i + j < n; ++j) {\n                dp[i + j] = std::min(dp[i + j], dp[i] + 1);\n            }\n        }\n        return dp[n - 1];\n    }\n};",
          "javascript": "function jumpBetter(nums) {\n    const n = nums.length;\n    const dp = new Array(n).fill(Infinity);\n    dp[0] = 0;\n    for (let i = 0; i < n; i++) {\n        for (let j = 1; j <= nums[i] && i + j < n; j++) {\n            dp[i + j] = Math.min(dp[i + j], dp[i] + 1);\n        }\n    }\n    return dp[n - 1];\n}"
        }
      },
      "optimal": {
        "name": "Optimal (Greedy Interval BFS / 1D DP)",
        "tier": "optimal",
        "badge": "\ud83e\udd47 Optimal",
        "intuition": [
          "Find minimum number of jumps to reach the last index.",
          "Maintain current jump coverage window [curStart, curEnd] and track curFarthest reachable.",
          "When current index reaches curEnd, a new jump must be taken: jumps++, curEnd = curFarthest."
        ],
        "pseudocode": [
          "FUNCTION jump(nums):",
          "  jumps = 0, curEnd = 0, curFarthest = 0",
          "  FOR i from 0 TO nums.length - 2:",
          "    curFarthest = MAX(curFarthest, i + nums[i])",
          "    IF i == curEnd:",
          "      jumps++",
          "      curEnd = curFarthest",
          "  RETURN jumps"
        ],
        "timeComplexity": "O(N)",
        "spaceComplexity": "O(1)",
        "complexityExplanation": "Optimal Greedy Interval BFS / 1D DP achieves O(N) time with O(1) auxiliary space.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int jump(int[] nums) {\n        int jumps = 0, curEnd = 0, curFarthest = 0;\n        for (int i = 0; i < nums.length - 1; i++) {\n            curFarthest = Math.max(curFarthest, i + nums[i]);\n            if (i == curEnd) {\n                jumps++;\n                curEnd = curFarthest;\n            }\n        }\n        return jumps;\n    }\n}",
          "python": "class Solution:\n    def jump(self, nums: list[int]) -> int:\n        jumps, cur_end, cur_farthest = 0, 0, 0\n        for i in range(len(nums) - 1):\n            cur_farthest = max(cur_farthest, i + nums[i])\n            if i == cur_end:\n                jumps += 1\n                cur_end = cur_farthest\n        return jumps",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int jump(std::vector<int>& nums) {\n        int jumps = 0, curEnd = 0, curFarthest = 0;\n        for (int i = 0; i < (int)nums.size() - 1; ++i) {\n            curFarthest = std::max(curFarthest, i + nums[i]);\n            if (i == curEnd) {\n                jumps++;\n                curEnd = curFarthest;\n            }\n        }\n        return jumps;\n    }\n};",
          "javascript": "function jump(nums) {\n    let jumps = 0, curEnd = 0, curFarthest = 0;\n    for (let i = 0; i < nums.length - 1; i++) {\n        curFarthest = Math.max(curFarthest, i + nums[i]);\n        if (i === curEnd) {\n            jumps++;\n            curEnd = curFarthest;\n        }\n    }\n    return jumps;\n}"
        }
      }
    }
  },
  "gold_mine": {
    "questionId": "archetype-gold_mine",
    "pattern": "Grid DP Moving Right-Up, Right, Right-Down",
    "intuition": [
      "Miner starts at any row in column 0 and moves to (row-1, col+1), (row, col+1), or (row+1, col+1).",
      "Fill DP table column by column from right (m - 2) down to 0.",
      "dp[row][col] = M[row][col] + max(right_up, right, right_down)."
    ],
    "pseudocode": [
      "FUNCTION maxGold(n, m, M):",
      "  dp = M.clone()",
      "  FOR col from m - 2 DOWNTO 0:",
      "    FOR row from 0 TO n - 1:",
      "      right_up = row > 0 ? dp[row - 1][col + 1] : 0",
      "      right = dp[row][col + 1]",
      "      right_down = row < n - 1 ? dp[row + 1][col + 1] : 0",
      "      dp[row][col] += MAX(right_up, right, right_down)",
      "  RETURN MAX of dp[row][0] for all rows"
    ],
    "timeComplexity": "O(N * M)",
    "spaceComplexity": "O(N * M)",
    "complexityExplanation": "Optimal Grid DP Moving Right-Up, Right, Right-Down achieves O(N * M) time with O(N * M) space.",
    "edgeCases": [
      "Single column (m = 1)",
      "Single row (n = 1)",
      "All zeros"
    ],
    "code": {
      "java": "import java.util.*;\n\npublic class Solution {\n    public int maxGold(int n, int m, int[][] M) {\n        int[][] dp = new int[n][m];\n        for (int i = 0; i < n; i++) dp[i][m - 1] = M[i][m - 1];\n        for (int col = m - 2; col >= 0; col--) {\n            for (int row = 0; row < n; row++) {\n                int rightUp = (row > 0) ? dp[row - 1][col + 1] : 0;\n                int right = dp[row][col + 1];\n                int rightDown = (row < n - 1) ? dp[row + 1][col + 1] : 0;\n                dp[row][col] = M[row][col] + Math.max(right, Math.max(rightUp, rightDown));\n            }\n        }\n        int max = 0;\n        for (int row = 0; row < n; row++) max = Math.max(max, dp[row][0]);\n        return max;\n    }\n}",
      "python": "class Solution:\n    def maxGold(self, n: int, m: int, M: list[list[int]]) -> int:\n        dp = [row[:] for row in M]\n        for col in range(m - 2, -1, -1):\n            for row in range(n):\n                right_up = dp[row - 1][col + 1] if row > 0 else 0\n                right = dp[row][col + 1]\n                right_down = dp[row + 1][col + 1] if row < n - 1 else 0\n                dp[row][col] = M[row][col] + max(right, right_up, right_down)\n        return max(dp[row][0] for row in range(n))",
      "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int maxGold(int n, int m, std::vector<std::vector<int>>& M) {\n        std::vector<std::vector<int>> dp = M;\n        for (int col = m - 2; col >= 0; --col) {\n            for (int row = 0; row < n; ++row) {\n                int rightUp = (row > 0) ? dp[row - 1][col + 1] : 0;\n                int right = dp[row][col + 1];\n                int rightDown = (row < n - 1) ? dp[row + 1][col + 1] : 0;\n                dp[row][col] = M[row][col] + std::max({right, rightUp, rightDown});\n            }\n        }\n        int maxVal = 0;\n        for (int row = 0; row < n; ++row) maxVal = std::max(maxVal, dp[row][0]);\n        return maxVal;\n    }\n};",
      "javascript": "function maxGold(n, m, M) {\n    const dp = M.map(row => [...row]);\n    for (let col = m - 2; col >= 0; col--) {\n        for (let row = 0; row < n; row++) {\n            const rightUp = row > 0 ? dp[row - 1][col + 1] : 0;\n            const right = dp[row][col + 1];\n            const rightDown = row < n - 1 ? dp[row + 1][col + 1] : 0;\n            dp[row][col] = M[row][col] + Math.max(right, Math.max(rightUp, rightDown));\n        }\n    }\n    let maxVal = 0;\n    for (let row = 0; row < n; row++) maxVal = Math.max(maxVal, dp[row][0]);\n    return maxVal;\n}"
    },
    "interviewProTips": [
      "Start with the state transition recurrence for Gold Mine Problem before writing space-optimized code.",
      "Verify base cases for empty or single element inputs to prevent out-of-bounds access."
    ],
    "approaches": {
      "brute": {
        "name": "Brute Force (Pure Recursion)",
        "tier": "brute",
        "badge": "\ud83e\udd49 Brute Force",
        "intuition": [
          "Formulate problem as recursive exploration of all choice branches without memoization.",
          "Re-evaluates identical subproblem states repeatedly, leading to exponential time complexity."
        ],
        "timeComplexity": "O(3^M)",
        "spaceComplexity": "O(M)",
        "complexityExplanation": "Exhaustive recursion tree branches into O(3^M) operations.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int maxGoldBrute(int n, int m, int[][] M) {\n        int max = 0;\n        for (int r = 0; r < n; r++) max = Math.max(max, helper(M, r, 0, n, m));\n        return max;\n    }\n    private int helper(int[][] M, int r, int c, int n, int m) {\n        if (r < 0 || r >= n || c >= m) return 0;\n        int up = helper(M, r - 1, c + 1, n, m);\n        int right = helper(M, r, c + 1, n, m);\n        int down = helper(M, r + 1, c + 1, n, m);\n        return M[r][c] + Math.max(right, Math.max(up, down));\n    }\n}",
          "python": "class Solution:\n    def maxGoldBrute(self, n: int, m: int, M: list[list[int]]) -> int:\n        def h(r, c):\n            if r < 0 or r >= n or c >= m: return 0\n            return M[r][c] + max(h(r - 1, c + 1), h(r, c + 1), h(r + 1, c + 1))\n        return max(h(r, 0) for r in range(n))",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int helper(const std::vector<std::vector<int>>& M, int r, int c, int n, int m) {\n        if (r < 0 || r >= n || c >= m) return 0;\n        return M[r][c] + std::max({helper(M, r - 1, c + 1, n, m), helper(M, r, c + 1, n, m), helper(M, r + 1, c + 1, n, m)});\n    }\n    int maxGoldBrute(int n, int m, std::vector<std::vector<int>>& M) {\n        int maxVal = 0;\n        for (int r = 0; r < n; ++r) maxVal = std::max(maxVal, helper(M, r, 0, n, m));\n        return maxVal;\n    }\n};",
          "javascript": "function maxGoldBrute(n, m, M) {\n    function h(r, c) {\n        if (r < 0 || r >= n || c >= m) return 0;\n        return M[r][c] + Math.max(h(r - 1, c + 1), Math.max(h(r, c + 1), h(r + 1, c + 1)));\n    }\n    let maxVal = 0;\n    for (let r = 0; r < n; r++) maxVal = Math.max(maxVal, h(r, 0));\n    return maxVal;\n}"
        }
      },
      "better": {
        "name": "Better (Memoized DFS / 2D DP Table)",
        "tier": "better",
        "badge": "\ud83e\udd48 Better",
        "intuition": [
          "Store previously computed subproblem states in a lookup table or matrix.",
          "If a state is already visited, return the stored value immediately in O(1) time."
        ],
        "timeComplexity": "O(N * M)",
        "spaceComplexity": "O(N * M)",
        "complexityExplanation": "Memoization evaluates each state at most once, reducing time to O(N * M).",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int maxGoldBetter(int n, int m, int[][] M) {\n        return maxGold(n, m, M);\n    }\n}",
          "python": "class Solution:\n    def maxGoldBetter(self, n: int, m: int, M: list[list[int]]) -> int:\n        return self.maxGold(n, m, M)",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int maxGoldBetter(int n, int m, std::vector<std::vector<int>>& M) {\n        return maxGold(n, m, M);\n    }\n};",
          "javascript": "function maxGoldBetter(n, m, M) {\n    return maxGold(n, m, M);\n}"
        }
      },
      "optimal": {
        "name": "Optimal (Grid DP Moving Right-Up, Right, Right-Down)",
        "tier": "optimal",
        "badge": "\ud83e\udd47 Optimal",
        "intuition": [
          "Miner starts at any row in column 0 and moves to (row-1, col+1), (row, col+1), or (row+1, col+1).",
          "Fill DP table column by column from right (m - 2) down to 0.",
          "dp[row][col] = M[row][col] + max(right_up, right, right_down)."
        ],
        "pseudocode": [
          "FUNCTION maxGold(n, m, M):",
          "  dp = M.clone()",
          "  FOR col from m - 2 DOWNTO 0:",
          "    FOR row from 0 TO n - 1:",
          "      right_up = row > 0 ? dp[row - 1][col + 1] : 0",
          "      right = dp[row][col + 1]",
          "      right_down = row < n - 1 ? dp[row + 1][col + 1] : 0",
          "      dp[row][col] += MAX(right_up, right, right_down)",
          "  RETURN MAX of dp[row][0] for all rows"
        ],
        "timeComplexity": "O(N * M)",
        "spaceComplexity": "O(N * M)",
        "complexityExplanation": "Optimal Grid DP Moving Right-Up, Right, Right-Down achieves O(N * M) time with O(N * M) auxiliary space.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int maxGold(int n, int m, int[][] M) {\n        int[][] dp = new int[n][m];\n        for (int i = 0; i < n; i++) dp[i][m - 1] = M[i][m - 1];\n        for (int col = m - 2; col >= 0; col--) {\n            for (int row = 0; row < n; row++) {\n                int rightUp = (row > 0) ? dp[row - 1][col + 1] : 0;\n                int right = dp[row][col + 1];\n                int rightDown = (row < n - 1) ? dp[row + 1][col + 1] : 0;\n                dp[row][col] = M[row][col] + Math.max(right, Math.max(rightUp, rightDown));\n            }\n        }\n        int max = 0;\n        for (int row = 0; row < n; row++) max = Math.max(max, dp[row][0]);\n        return max;\n    }\n}",
          "python": "class Solution:\n    def maxGold(self, n: int, m: int, M: list[list[int]]) -> int:\n        dp = [row[:] for row in M]\n        for col in range(m - 2, -1, -1):\n            for row in range(n):\n                right_up = dp[row - 1][col + 1] if row > 0 else 0\n                right = dp[row][col + 1]\n                right_down = dp[row + 1][col + 1] if row < n - 1 else 0\n                dp[row][col] = M[row][col] + max(right, right_up, right_down)\n        return max(dp[row][0] for row in range(n))",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int maxGold(int n, int m, std::vector<std::vector<int>>& M) {\n        std::vector<std::vector<int>> dp = M;\n        for (int col = m - 2; col >= 0; --col) {\n            for (int row = 0; row < n; ++row) {\n                int rightUp = (row > 0) ? dp[row - 1][col + 1] : 0;\n                int right = dp[row][col + 1];\n                int rightDown = (row < n - 1) ? dp[row + 1][col + 1] : 0;\n                dp[row][col] = M[row][col] + std::max({right, rightUp, rightDown});\n            }\n        }\n        int maxVal = 0;\n        for (int row = 0; row < n; ++row) maxVal = std::max(maxVal, dp[row][0]);\n        return maxVal;\n    }\n};",
          "javascript": "function maxGold(n, m, M) {\n    const dp = M.map(row => [...row]);\n    for (let col = m - 2; col >= 0; col--) {\n        for (let row = 0; row < n; row++) {\n            const rightUp = row > 0 ? dp[row - 1][col + 1] : 0;\n            const right = dp[row][col + 1];\n            const rightDown = row < n - 1 ? dp[row + 1][col + 1] : 0;\n            dp[row][col] = M[row][col] + Math.max(right, Math.max(rightUp, rightDown));\n        }\n    }\n    let maxVal = 0;\n    for (let row = 0; row < n; row++) maxVal = Math.max(maxVal, dp[row][0]);\n    return maxVal;\n}"
        }
      }
    }
  },
  "friends_pairing": {
    "questionId": "archetype-friends_pairing",
    "pattern": "Combinatorial Constant Space Rolling State",
    "intuition": [
      "For nth person: person can either remain single (countFriendsPairings(n-1)) or pair up with any of the (n-1) remaining persons ((n-1) * countFriendsPairings(n-2)).",
      "Recurrence: f(n) = f(n-1) + (n-1) * f(n-2) modulo 10^9 + 7.",
      "Can be computed in O(1) space with two variables."
    ],
    "pseudocode": [
      "FUNCTION countFriendsPairings(n):",
      "  IF n <= 2: RETURN n",
      "  prev2 = 1, prev1 = 2",
      "  FOR i from 3 TO n:",
      "    curr = (prev1 + (i - 1) * prev2) % MOD",
      "    prev2 = prev1; prev1 = curr",
      "  RETURN prev1"
    ],
    "timeComplexity": "O(N)",
    "spaceComplexity": "O(1)",
    "complexityExplanation": "Optimal Combinatorial Constant Space Rolling State achieves O(N) time with O(1) space.",
    "edgeCases": [
      "n = 1",
      "n = 2",
      "Large n requiring modulo"
    ],
    "code": {
      "java": "import java.util.*;\n\npublic class Solution {\n    public long countFriendsPairings(int n) {\n        if (n <= 2) return n;\n        long mod = 1000000007L;\n        long prev2 = 1, prev1 = 2;\n        for (int i = 3; i <= n; i++) {\n            long curr = (prev1 + (i - 1) * prev2) % mod;\n            prev2 = prev1;\n            prev1 = curr;\n        }\n        return prev1;\n    }\n}",
      "python": "class Solution:\n    def countFriendsPairings(self, n: int) -> int:\n        if n <= 2: return n\n        mod = 10**9 + 7\n        p2, p1 = 1, 2\n        for i in range(3, n + 1):\n            p2, p1 = p1, (p1 + (i - 1) * p2) % mod\n        return p1",
      "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    long long countFriendsPairings(int n) {\n        if (n <= 2) return n;\n        long long mod = 1000000007LL;\n        long long prev2 = 1, prev1 = 2;\n        for (int i = 3; i <= n; ++i) {\n            long long curr = (prev1 + (i - 1) * prev2) % mod;\n            prev2 = prev1;\n            prev1 = curr;\n        }\n        return prev1;\n    }\n};",
      "javascript": "function countFriendsPairings(n) {\n    if (n <= 2) return n;\n    const mod = 1000000007n;\n    let prev2 = 1n, prev1 = 2n;\n    for (let i = 3; i <= n; i++) {\n        const curr = (prev1 + BigInt(i - 1) * prev2) % mod;\n        prev2 = prev1;\n        prev1 = curr;\n    }\n    return Number(prev1);\n}"
    },
    "interviewProTips": [
      "Start with the state transition recurrence for Friends Pairing Problem before writing space-optimized code.",
      "Verify base cases for empty or single element inputs to prevent out-of-bounds access."
    ],
    "approaches": {
      "brute": {
        "name": "Brute Force (Pure Recursion)",
        "tier": "brute",
        "badge": "\ud83e\udd49 Brute Force",
        "intuition": [
          "Formulate problem as recursive exploration of all choice branches without memoization.",
          "Re-evaluates identical subproblem states repeatedly, leading to exponential time complexity."
        ],
        "timeComplexity": "O(2\u207f)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Exhaustive recursion tree branches into O(2\u207f) operations.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public long countFriendsPairingsBrute(int n) {\n        if (n <= 2) return n;\n        return countFriendsPairingsBrute(n - 1) + (n - 1) * countFriendsPairingsBrute(n - 2);\n    }\n}",
          "python": "class Solution:\n    def countFriendsPairingsBrute(self, n: int) -> int:\n        if n <= 2: return n\n        return self.countFriendsPairingsBrute(n - 1) + (n - 1) * self.countFriendsPairingsBrute(n - 2)",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    long long countFriendsPairingsBrute(int n) {\n        if (n <= 2) return n;\n        return countFriendsPairingsBrute(n - 1) + (n - 1) * countFriendsPairingsBrute(n - 2);\n    }\n};",
          "javascript": "function countFriendsPairingsBrute(n) {\n    if (n <= 2) return n;\n    return countFriendsPairingsBrute(n - 1) + (n - 1) * countFriendsPairingsBrute(n - 2);\n}"
        }
      },
      "better": {
        "name": "Better (Memoized DFS / 2D DP Table)",
        "tier": "better",
        "badge": "\ud83e\udd48 Better",
        "intuition": [
          "Store previously computed subproblem states in a lookup table or matrix.",
          "If a state is already visited, return the stored value immediately in O(1) time."
        ],
        "timeComplexity": "O(N)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Memoization evaluates each state at most once, reducing time to O(N).",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public long countFriendsPairingsBetter(int n) {\n        if (n <= 2) return n;\n        long mod = 1000000007L;\n        long[] dp = new long[n + 1];\n        dp[1] = 1; dp[2] = 2;\n        for (int i = 3; i <= n; i++) {\n            dp[i] = (dp[i - 1] + (i - 1) * dp[i - 2]) % mod;\n        }\n        return dp[n];\n    }\n}",
          "python": "class Solution:\n    def countFriendsPairingsBetter(self, n: int) -> int:\n        if n <= 2: return n\n        mod = 10**9 + 7\n        dp = [0] * (n + 1)\n        dp[1], dp[2] = 1, 2\n        for i in range(3, n + 1):\n            dp[i] = (dp[i - 1] + (i - 1) * dp[i - 2]) % mod\n        return dp[n]",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    long long countFriendsPairingsBetter(int n) {\n        if (n <= 2) return n;\n        long long mod = 1000000007LL;\n        std::vector<long long> dp(n + 1);\n        dp[1] = 1; dp[2] = 2;\n        for (int i = 3; i <= n; ++i) dp[i] = (dp[i - 1] + (i - 1) * dp[i - 2]) % mod;\n        return dp[n];\n    }\n};",
          "javascript": "function countFriendsPairingsBetter(n) {\n    if (n <= 2) return n;\n    const mod = 1000000007n;\n    const dp = new Array(n + 1);\n    dp[1] = 1n; dp[2] = 2n;\n    for (let i = 3; i <= n; i++) dp[i] = (dp[i - 1] + BigInt(i - 1) * dp[i - 2]) % mod;\n    return Number(dp[n]);\n}"
        }
      },
      "optimal": {
        "name": "Optimal (Combinatorial Constant Space Rolling State)",
        "tier": "optimal",
        "badge": "\ud83e\udd47 Optimal",
        "intuition": [
          "For nth person: person can either remain single (countFriendsPairings(n-1)) or pair up with any of the (n-1) remaining persons ((n-1) * countFriendsPairings(n-2)).",
          "Recurrence: f(n) = f(n-1) + (n-1) * f(n-2) modulo 10^9 + 7.",
          "Can be computed in O(1) space with two variables."
        ],
        "pseudocode": [
          "FUNCTION countFriendsPairings(n):",
          "  IF n <= 2: RETURN n",
          "  prev2 = 1, prev1 = 2",
          "  FOR i from 3 TO n:",
          "    curr = (prev1 + (i - 1) * prev2) % MOD",
          "    prev2 = prev1; prev1 = curr",
          "  RETURN prev1"
        ],
        "timeComplexity": "O(N)",
        "spaceComplexity": "O(1)",
        "complexityExplanation": "Optimal Combinatorial Constant Space Rolling State achieves O(N) time with O(1) auxiliary space.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public long countFriendsPairings(int n) {\n        if (n <= 2) return n;\n        long mod = 1000000007L;\n        long prev2 = 1, prev1 = 2;\n        for (int i = 3; i <= n; i++) {\n            long curr = (prev1 + (i - 1) * prev2) % mod;\n            prev2 = prev1;\n            prev1 = curr;\n        }\n        return prev1;\n    }\n}",
          "python": "class Solution:\n    def countFriendsPairings(self, n: int) -> int:\n        if n <= 2: return n\n        mod = 10**9 + 7\n        p2, p1 = 1, 2\n        for i in range(3, n + 1):\n            p2, p1 = p1, (p1 + (i - 1) * p2) % mod\n        return p1",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    long long countFriendsPairings(int n) {\n        if (n <= 2) return n;\n        long long mod = 1000000007LL;\n        long long prev2 = 1, prev1 = 2;\n        for (int i = 3; i <= n; ++i) {\n            long long curr = (prev1 + (i - 1) * prev2) % mod;\n            prev2 = prev1;\n            prev1 = curr;\n        }\n        return prev1;\n    }\n};",
          "javascript": "function countFriendsPairings(n) {\n    if (n <= 2) return n;\n    const mod = 1000000007n;\n    let prev2 = 1n, prev1 = 2n;\n    for (let i = 3; i <= n; i++) {\n        const curr = (prev1 + BigInt(i - 1) * prev2) % mod;\n        prev2 = prev1;\n        prev1 = curr;\n    }\n    return Number(prev1);\n}"
        }
      }
    }
  },
  "painting_fence": {
    "questionId": "archetype-painting_fence",
    "pattern": "State Tracking DP (Same / Different Colors)",
    "intuition": [
      "No more than 2 adjacent posts can have the same color.",
      "For post i: same[i] = diff[i-1], diff[i] = (same[i-1] + diff[i-1]) * (k - 1).",
      "Total for post i is (same[i] + diff[i]). Space optimizes to O(1)."
    ],
    "pseudocode": [
      "FUNCTION countWays(n, k):",
      "  IF n == 1: RETURN k",
      "  same = k, diff = k * (k - 1)",
      "  FOR i from 3 TO n:",
      "    prevDiff = diff",
      "    diff = (same + diff) * (k - 1) % MOD",
      "    same = prevDiff",
      "  RETURN (same + diff) % MOD"
    ],
    "timeComplexity": "O(N)",
    "spaceComplexity": "O(1)",
    "complexityExplanation": "Optimal State Tracking DP (Same / Different Colors) achieves O(N) time with O(1) space.",
    "edgeCases": [
      "n = 1",
      "k = 1 and n > 2 (returns 0)",
      "n = 2"
    ],
    "code": {
      "java": "import java.util.*;\n\npublic class Solution {\n    public long countWays(int n, int k) {\n        if (n == 1) return k;\n        long mod = 1000000007L;\n        long same = k;\n        long diff = (long)k * (k - 1) % mod;\n        for (int i = 3; i <= n; i++) {\n            long prevDiff = diff;\n            diff = ((same + diff) % mod) * (k - 1) % mod;\n            same = prevDiff;\n        }\n        return (same + diff) % mod;\n    }\n}",
      "python": "class Solution:\n    def countWays(self, n: int, k: int) -> int:\n        if n == 1: return k\n        mod = 10**9 + 7\n        same = k\n        diff = k * (k - 1) % mod\n        for _ in range(3, n + 1):\n            same, diff = diff, (same + diff) * (k - 1) % mod\n        return (same + diff) % mod",
      "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    long long countWays(int n, int k) {\n        if (n == 1) return k;\n        long long mod = 1000000007LL;\n        long long same = k;\n        long long diff = (long long)k * (k - 1) % mod;\n        for (int i = 3; i <= n; ++i) {\n            long long prevDiff = diff;\n            diff = ((same + diff) % mod) * (k - 1) % mod;\n            same = prevDiff;\n        }\n        return (same + diff) % mod;\n    }\n};",
      "javascript": "function countWays(n, k) {\n    if (n === 1) return k;\n    const mod = 1000000007n;\n    let same = BigInt(k);\n    let diff = (BigInt(k) * BigInt(k - 1)) % mod;\n    for (let i = 3; i <= n; i++) {\n        const prevDiff = diff;\n        diff = ((same + diff) % mod) * BigInt(k - 1) % mod;\n        same = prevDiff;\n    }\n    return Number((same + diff) % mod);\n}"
    },
    "interviewProTips": [
      "Start with the state transition recurrence for Painting the Fence before writing space-optimized code.",
      "Verify base cases for empty or single element inputs to prevent out-of-bounds access."
    ],
    "approaches": {
      "brute": {
        "name": "Brute Force (Pure Recursion)",
        "tier": "brute",
        "badge": "\ud83e\udd49 Brute Force",
        "intuition": [
          "Formulate problem as recursive exploration of all choice branches without memoization.",
          "Re-evaluates identical subproblem states repeatedly, leading to exponential time complexity."
        ],
        "timeComplexity": "O(K\u207f)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Exhaustive recursion tree branches into O(K\u207f) operations.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public long countWaysBrute(int n, int k) {\n        return helper(n, k, -1, -1);\n    }\n    private long helper(int remaining, int k, int lastColor, int secondLastColor) {\n        if (remaining == 0) return 1;\n        long ways = 0;\n        for (int c = 0; c < k; c++) {\n            if (c == lastColor && c == secondLastColor) continue;\n            ways += helper(remaining - 1, k, c, lastColor);\n        }\n        return ways;\n    }\n}",
          "python": "class Solution:\n    def countWaysBrute(self, n: int, k: int) -> int:\n        def h(rem, c1, c2):\n            if rem == 0: return 1\n            ways = 0\n            for c in range(k):\n                if c == c1 and c == c2: continue\n                ways += h(rem - 1, c, c1)\n            return ways\n        return h(n, -1, -1)",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    long long helper(int rem, int k, int c1, int c2) {\n        if (rem == 0) return 1;\n        long long ways = 0;\n        for (int c = 0; c < k; ++c) {\n            if (c == c1 && c == c2) continue;\n            ways += helper(rem - 1, k, c, c1);\n        }\n        return ways;\n    }\n    long long countWaysBrute(int n, int k) {\n        return helper(n, k, -1, -1);\n    }\n};",
          "javascript": "function countWaysBrute(n, k) {\n    function h(rem, c1, c2) {\n        if (rem === 0) return 1;\n        let ways = 0;\n        for (let c = 0; c < k; c++) {\n            if (c === c1 && c === c2) continue;\n            ways += h(rem - 1, c, c1);\n        }\n        return ways;\n    }\n    return h(n, -1, -1);\n}"
        }
      },
      "better": {
        "name": "Better (Memoized DFS / 2D DP Table)",
        "tier": "better",
        "badge": "\ud83e\udd48 Better",
        "intuition": [
          "Store previously computed subproblem states in a lookup table or matrix.",
          "If a state is already visited, return the stored value immediately in O(1) time."
        ],
        "timeComplexity": "O(N)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Memoization evaluates each state at most once, reducing time to O(N).",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public long countWaysBetter(int n, int k) {\n        return countWays(n, k);\n    }\n}",
          "python": "class Solution:\n    def countWaysBetter(self, n: int, k: int) -> int:\n        return self.countWays(n, k)",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    long long countWaysBetter(int n, int k) {\n        return countWays(n, k);\n    }\n};",
          "javascript": "function countWaysBetter(n, k) {\n    return countWays(n, k);\n}"
        }
      },
      "optimal": {
        "name": "Optimal (State Tracking DP (Same / Different Colors))",
        "tier": "optimal",
        "badge": "\ud83e\udd47 Optimal",
        "intuition": [
          "No more than 2 adjacent posts can have the same color.",
          "For post i: same[i] = diff[i-1], diff[i] = (same[i-1] + diff[i-1]) * (k - 1).",
          "Total for post i is (same[i] + diff[i]). Space optimizes to O(1)."
        ],
        "pseudocode": [
          "FUNCTION countWays(n, k):",
          "  IF n == 1: RETURN k",
          "  same = k, diff = k * (k - 1)",
          "  FOR i from 3 TO n:",
          "    prevDiff = diff",
          "    diff = (same + diff) * (k - 1) % MOD",
          "    same = prevDiff",
          "  RETURN (same + diff) % MOD"
        ],
        "timeComplexity": "O(N)",
        "spaceComplexity": "O(1)",
        "complexityExplanation": "Optimal State Tracking DP (Same / Different Colors) achieves O(N) time with O(1) auxiliary space.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public long countWays(int n, int k) {\n        if (n == 1) return k;\n        long mod = 1000000007L;\n        long same = k;\n        long diff = (long)k * (k - 1) % mod;\n        for (int i = 3; i <= n; i++) {\n            long prevDiff = diff;\n            diff = ((same + diff) % mod) * (k - 1) % mod;\n            same = prevDiff;\n        }\n        return (same + diff) % mod;\n    }\n}",
          "python": "class Solution:\n    def countWays(self, n: int, k: int) -> int:\n        if n == 1: return k\n        mod = 10**9 + 7\n        same = k\n        diff = k * (k - 1) % mod\n        for _ in range(3, n + 1):\n            same, diff = diff, (same + diff) * (k - 1) % mod\n        return (same + diff) % mod",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    long long countWays(int n, int k) {\n        if (n == 1) return k;\n        long long mod = 1000000007LL;\n        long long same = k;\n        long long diff = (long long)k * (k - 1) % mod;\n        for (int i = 3; i <= n; ++i) {\n            long long prevDiff = diff;\n            diff = ((same + diff) % mod) * (k - 1) % mod;\n            same = prevDiff;\n        }\n        return (same + diff) % mod;\n    }\n};",
          "javascript": "function countWays(n, k) {\n    if (n === 1) return k;\n    const mod = 1000000007n;\n    let same = BigInt(k);\n    let diff = (BigInt(k) * BigInt(k - 1)) % mod;\n    for (let i = 3; i <= n; i++) {\n        const prevDiff = diff;\n        diff = ((same + diff) % mod) * BigInt(k - 1) % mod;\n        same = prevDiff;\n    }\n    return Number((same + diff) % mod);\n}"
        }
      }
    }
  },
  "maximize_cut_segments": {
    "questionId": "archetype-maximize_cut_segments",
    "pattern": "1D Coin Change / Unbounded Knapsack Variation",
    "intuition": [
      "Find maximum number of cut segments of lengths x, y, and z to make a line segment of length n.",
      "dp[i] represents maximum segments of length i.",
      "dp[i] = 1 + max(dp[i-x], dp[i-y], dp[i-z]) if the subproblem is valid."
    ],
    "pseudocode": [
      "FUNCTION maximizeCuts(n, x, y, z):",
      "  dp = Array(n + 1, -1); dp[0] = 0",
      "  FOR i from 1 TO n:",
      "    IF i >= x AND dp[i - x] != -1: dp[i] = MAX(dp[i], dp[i - x] + 1)",
      "    IF i >= y AND dp[i - y] != -1: dp[i] = MAX(dp[i], dp[i - y] + 1)",
      "    IF i >= z AND dp[i - z] != -1: dp[i] = MAX(dp[i], dp[i - z] + 1)",
      "  RETURN dp[n] == -1 ? 0 : dp[n]"
    ],
    "timeComplexity": "O(N)",
    "spaceComplexity": "O(N)",
    "complexityExplanation": "Optimal 1D Coin Change / Unbounded Knapsack Variation achieves O(N) time with O(N) space.",
    "edgeCases": [
      "No combination of x, y, z sums to n (returns 0)",
      "x = y = z = 1 (returns n)"
    ],
    "code": {
      "java": "import java.util.*;\n\npublic class Solution {\n    public int maximizeCuts(int n, int x, int y, int z) {\n        int[] dp = new int[n + 1];\n        Arrays.fill(dp, -1);\n        dp[0] = 0;\n        for (int i = 1; i <= n; i++) {\n            if (i >= x && dp[i - x] != -1) dp[i] = Math.max(dp[i], dp[i - x] + 1);\n            if (i >= y && dp[i - y] != -1) dp[i] = Math.max(dp[i], dp[i - y] + 1);\n            if (i >= z && dp[i - z] != -1) dp[i] = Math.max(dp[i], dp[i - z] + 1);\n        }\n        return Math.max(0, dp[n]);\n    }\n}",
      "python": "class Solution:\n    def maximizeCuts(self, n: int, x: int, y: int, z: int) -> int:\n        dp = [-1] * (n + 1)\n        dp[0] = 0\n        for i in range(1, n + 1):\n            if i >= x and dp[i - x] != -1: dp[i] = max(dp[i], dp[i - x] + 1)\n            if i >= y and dp[i - y] != -1: dp[i] = max(dp[i], dp[i - y] + 1)\n            if i >= z and dp[i - z] != -1: dp[i] = max(dp[i], dp[i - z] + 1)\n        return max(0, dp[n])",
      "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int maximizeCuts(int n, int x, int y, int z) {\n        std::vector<int> dp(n + 1, -1);\n        dp[0] = 0;\n        for (int i = 1; i <= n; ++i) {\n            if (i >= x && dp[i - x] != -1) dp[i] = std::max(dp[i], dp[i - x] + 1);\n            if (i >= y && dp[i - y] != -1) dp[i] = std::max(dp[i], dp[i - y] + 1);\n            if (i >= z && dp[i - z] != -1) dp[i] = std::max(dp[i], dp[i - z] + 1);\n        }\n        return std::max(0, dp[n]);\n    }\n};",
      "javascript": "function maximizeCuts(n, x, y, z) {\n    const dp = new Array(n + 1).fill(-1);\n    dp[0] = 0;\n    for (let i = 1; i <= n; i++) {\n        if (i >= x && dp[i - x] !== -1) dp[i] = Math.max(dp[i], dp[i - x] + 1);\n        if (i >= y && dp[i - y] !== -1) dp[i] = Math.max(dp[i], dp[i - y] + 1);\n        if (i >= z && dp[i - z] !== -1) dp[i] = Math.max(dp[i], dp[i - z] + 1);\n    }\n    return Math.max(0, dp[n]);\n}"
    },
    "interviewProTips": [
      "Start with the state transition recurrence for Maximize The Cut Segments before writing space-optimized code.",
      "Verify base cases for empty or single element inputs to prevent out-of-bounds access."
    ],
    "approaches": {
      "brute": {
        "name": "Brute Force (Pure Recursion)",
        "tier": "brute",
        "badge": "\ud83e\udd49 Brute Force",
        "intuition": [
          "Formulate problem as recursive exploration of all choice branches without memoization.",
          "Re-evaluates identical subproblem states repeatedly, leading to exponential time complexity."
        ],
        "timeComplexity": "O(3\u207f)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Exhaustive recursion tree branches into O(3\u207f) operations.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int maximizeCutsBrute(int n, int x, int y, int z) {\n        if (n == 0) return 0;\n        if (n < 0) return -1;\n        int cutX = maximizeCutsBrute(n - x, x, y, z);\n        int cutY = maximizeCutsBrute(n - y, x, y, z);\n        int cutZ = maximizeCutsBrute(n - z, x, y, z);\n        int max = Math.max(cutX, Math.max(cutY, cutZ));\n        return max == -1 ? -1 : max + 1;\n    }\n}",
          "python": "class Solution:\n    def maximizeCutsBrute(self, n: int, x: int, y: int, z: int) -> int:\n        if n == 0: return 0\n        if n < 0: return -1\n        cx = self.maximizeCutsBrute(n - x, x, y, z)\n        cy = self.maximizeCutsBrute(n - y, x, y, z)\n        cz = self.maximizeCutsBrute(n - z, x, y, z)\n        mx = max(cx, cy, cz)\n        return -1 if mx == -1 else mx + 1",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int maximizeCutsBrute(int n, int x, int y, int z) {\n        if (n == 0) return 0;\n        if (n < 0) return -1;\n        int cx = maximizeCutsBrute(n - x, x, y, z);\n        int cy = maximizeCutsBrute(n - y, x, y, z);\n        int cz = maximizeCutsBrute(n - z, x, y, z);\n        int mx = std::max({cx, cy, cz});\n        return mx == -1 ? -1 : mx + 1;\n    }\n};",
          "javascript": "function maximizeCutsBrute(n, x, y, z) {\n    if (n === 0) return 0;\n    if (n < 0) return -1;\n    const cx = maximizeCutsBrute(n - x, x, y, z);\n    const cy = maximizeCutsBrute(n - y, x, y, z);\n    const cz = maximizeCutsBrute(n - z, x, y, z);\n    const mx = Math.max(cx, Math.max(cy, cz));\n    return mx === -1 ? -1 : mx + 1;\n}"
        }
      },
      "better": {
        "name": "Better (Memoized DFS / 2D DP Table)",
        "tier": "better",
        "badge": "\ud83e\udd48 Better",
        "intuition": [
          "Store previously computed subproblem states in a lookup table or matrix.",
          "If a state is already visited, return the stored value immediately in O(1) time."
        ],
        "timeComplexity": "O(N)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Memoization evaluates each state at most once, reducing time to O(N).",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int maximizeCutsBetter(int n, int x, int y, int z) {\n        return maximizeCuts(n, x, y, z);\n    }\n}",
          "python": "class Solution:\n    def maximizeCutsBetter(self, n: int, x: int, y: int, z: int) -> int:\n        return self.maximizeCuts(n, x, y, z)",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int maximizeCutsBetter(int n, int x, int y, int z) {\n        return maximizeCuts(n, x, y, z);\n    }\n};",
          "javascript": "function maximizeCutsBetter(n, x, y, z) {\n    return maximizeCuts(n, x, y, z);\n}"
        }
      },
      "optimal": {
        "name": "Optimal (1D Coin Change / Unbounded Knapsack Variation)",
        "tier": "optimal",
        "badge": "\ud83e\udd47 Optimal",
        "intuition": [
          "Find maximum number of cut segments of lengths x, y, and z to make a line segment of length n.",
          "dp[i] represents maximum segments of length i.",
          "dp[i] = 1 + max(dp[i-x], dp[i-y], dp[i-z]) if the subproblem is valid."
        ],
        "pseudocode": [
          "FUNCTION maximizeCuts(n, x, y, z):",
          "  dp = Array(n + 1, -1); dp[0] = 0",
          "  FOR i from 1 TO n:",
          "    IF i >= x AND dp[i - x] != -1: dp[i] = MAX(dp[i], dp[i - x] + 1)",
          "    IF i >= y AND dp[i - y] != -1: dp[i] = MAX(dp[i], dp[i - y] + 1)",
          "    IF i >= z AND dp[i - z] != -1: dp[i] = MAX(dp[i], dp[i - z] + 1)",
          "  RETURN dp[n] == -1 ? 0 : dp[n]"
        ],
        "timeComplexity": "O(N)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Optimal 1D Coin Change / Unbounded Knapsack Variation achieves O(N) time with O(N) auxiliary space.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int maximizeCuts(int n, int x, int y, int z) {\n        int[] dp = new int[n + 1];\n        Arrays.fill(dp, -1);\n        dp[0] = 0;\n        for (int i = 1; i <= n; i++) {\n            if (i >= x && dp[i - x] != -1) dp[i] = Math.max(dp[i], dp[i - x] + 1);\n            if (i >= y && dp[i - y] != -1) dp[i] = Math.max(dp[i], dp[i - y] + 1);\n            if (i >= z && dp[i - z] != -1) dp[i] = Math.max(dp[i], dp[i - z] + 1);\n        }\n        return Math.max(0, dp[n]);\n    }\n}",
          "python": "class Solution:\n    def maximizeCuts(self, n: int, x: int, y: int, z: int) -> int:\n        dp = [-1] * (n + 1)\n        dp[0] = 0\n        for i in range(1, n + 1):\n            if i >= x and dp[i - x] != -1: dp[i] = max(dp[i], dp[i - x] + 1)\n            if i >= y and dp[i - y] != -1: dp[i] = max(dp[i], dp[i - y] + 1)\n            if i >= z and dp[i - z] != -1: dp[i] = max(dp[i], dp[i - z] + 1)\n        return max(0, dp[n])",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int maximizeCuts(int n, int x, int y, int z) {\n        std::vector<int> dp(n + 1, -1);\n        dp[0] = 0;\n        for (int i = 1; i <= n; ++i) {\n            if (i >= x && dp[i - x] != -1) dp[i] = std::max(dp[i], dp[i - x] + 1);\n            if (i >= y && dp[i - y] != -1) dp[i] = std::max(dp[i], dp[i - y] + 1);\n            if (i >= z && dp[i - z] != -1) dp[i] = std::max(dp[i], dp[i - z] + 1);\n        }\n        return std::max(0, dp[n]);\n    }\n};",
          "javascript": "function maximizeCuts(n, x, y, z) {\n    const dp = new Array(n + 1).fill(-1);\n    dp[0] = 0;\n    for (let i = 1; i <= n; i++) {\n        if (i >= x && dp[i - x] !== -1) dp[i] = Math.max(dp[i], dp[i - x] + 1);\n        if (i >= y && dp[i - y] !== -1) dp[i] = Math.max(dp[i], dp[i - y] + 1);\n        if (i >= z && dp[i - z] !== -1) dp[i] = Math.max(dp[i], dp[i - z] + 1);\n    }\n    return Math.max(0, dp[n]);\n}"
        }
      }
    }
  },
  "longest_repeated_subsequence": {
    "questionId": "archetype-longest_repeated_subsequence",
    "pattern": "Modified LCS (i != j Invariant)",
    "intuition": [
      "Find the longest subsequence that occurs at least twice without using the exact same indices.",
      "Formulate as LCS of string s with itself, with the constraint that i != j when characters match."
    ],
    "pseudocode": [
      "FUNCTION LongestRepeatingSubsequence(s):",
      "  n = s.length",
      "  dp = 2D Array (n + 1) x (n + 1) filled with 0",
      "  FOR i from 1 TO n:",
      "    FOR j from 1 TO n:",
      "      IF s[i - 1] == s[j - 1] AND i != j: dp[i][j] = 1 + dp[i - 1][j - 1]",
      "      ELSE: dp[i][j] = MAX(dp[i - 1][j], dp[i][j - 1])",
      "  RETURN dp[n][n]"
    ],
    "timeComplexity": "O(N\u00b2)",
    "spaceComplexity": "O(N)",
    "complexityExplanation": "Optimal Modified LCS (i != j Invariant) achieves O(N\u00b2) time with O(N) space.",
    "edgeCases": [
      "No repeating characters (returns 0)",
      "All identical characters ('aaaa' returns 3)",
      "Single character"
    ],
    "code": {
      "java": "import java.util.*;\n\npublic class Solution {\n    public int LongestRepeatingSubsequence(String s) {\n        int n = s.length();\n        int[] dp = new int[n + 1];\n        for (int i = 1; i <= n; i++) {\n            int prev = 0;\n            for (int j = 1; j <= n; j++) {\n                int temp = dp[j];\n                if (s.charAt(i - 1) == s.charAt(j - 1) && i != j) {\n                    dp[j] = 1 + prev;\n                } else {\n                    dp[j] = Math.max(dp[j], dp[j - 1]);\n                }\n                prev = temp;\n            }\n        }\n        return dp[n];\n    }\n}",
      "python": "class Solution:\n    def LongestRepeatingSubsequence(self, s: str) -> int:\n        n = len(s)\n        dp = [0] * (n + 1)\n        for i in range(1, n + 1):\n            prev = 0\n            for j in range(1, n + 1):\n                temp = dp[j]\n                if s[i - 1] == s[j - 1] and i != j:\n                    dp[j] = 1 + prev\n                else:\n                    dp[j] = max(dp[j], dp[j - 1])\n                prev = temp\n        return dp[n]",
      "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int LongestRepeatingSubsequence(std::string s) {\n        int n = s.length();\n        std::vector<int> dp(n + 1, 0);\n        for (int i = 1; i <= n; ++i) {\n            int prev = 0;\n            for (int j = 1; j <= n; ++j) {\n                int temp = dp[j];\n                if (s[i - 1] == s[j - 1] && i != j) {\n                    dp[j] = 1 + prev;\n                } else {\n                    dp[j] = std::max(dp[j], dp[j - 1]);\n                }\n                prev = temp;\n            }\n        }\n        return dp[n];\n    }\n};",
      "javascript": "function LongestRepeatingSubsequence(s) {\n    const n = s.length;\n    const dp = new Array(n + 1).fill(0);\n    for (let i = 1; i <= n; i++) {\n        let prev = 0;\n        for (let j = 1; j <= n; j++) {\n            const temp = dp[j];\n            if (s[i - 1] === s[j - 1] && i !== j) {\n                dp[j] = 1 + prev;\n            } else {\n                dp[j] = Math.max(dp[j], dp[j - 1]);\n            }\n            prev = temp;\n        }\n    }\n    return dp[n];\n}"
    },
    "interviewProTips": [
      "Start with the state transition recurrence for Longest Repeated Subsequence before writing space-optimized code.",
      "Verify base cases for empty or single element inputs to prevent out-of-bounds access."
    ],
    "approaches": {
      "brute": {
        "name": "Brute Force (Pure Recursion)",
        "tier": "brute",
        "badge": "\ud83e\udd49 Brute Force",
        "intuition": [
          "Formulate problem as recursive exploration of all choice branches without memoization.",
          "Re-evaluates identical subproblem states repeatedly, leading to exponential time complexity."
        ],
        "timeComplexity": "O(2\u207f)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Exhaustive recursion tree branches into O(2\u207f) operations.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int LongestRepeatingSubsequenceBrute(String s) {\n        return helper(s, s.length(), s.length());\n    }\n    private int helper(String s, int i, int j) {\n        if (i == 0 || j == 0) return 0;\n        if (s.charAt(i - 1) == s.charAt(j - 1) && i != j) return 1 + helper(s, i - 1, j - 1);\n        return Math.max(helper(s, i - 1, j), helper(s, i, j - 1));\n    }\n}",
          "python": "class Solution:\n    def LongestRepeatingSubsequenceBrute(self, s: str) -> int:\n        def h(i, j):\n            if i == 0 or j == 0: return 0\n            if s[i - 1] == s[j - 1] and i != j: return 1 + h(i - 1, j - 1)\n            return max(h(i - 1, j), h(i, j - 1))\n        return h(len(s), len(s))",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int helper(const std::string& s, int i, int j) {\n        if (i == 0 || j == 0) return 0;\n        if (s[i - 1] == s[j - 1] && i != j) return 1 + helper(s, i - 1, j - 1);\n        return std::max(helper(s, i - 1, j), helper(s, i, j - 1));\n    }\n    int LongestRepeatingSubsequenceBrute(std::string s) {\n        return helper(s, (int)s.size(), (int)s.size());\n    }\n};",
          "javascript": "function LongestRepeatingSubsequenceBrute(s) {\n    function h(i, j) {\n        if (i === 0 || j === 0) return 0;\n        if (s[i - 1] === s[j - 1] && i !== j) return 1 + h(i - 1, j - 1);\n        return Math.max(h(i - 1, j), h(i, j - 1));\n    }\n    return h(s.length, s.length);\n}"
        }
      },
      "better": {
        "name": "Better (Memoized DFS / 2D DP Table)",
        "tier": "better",
        "badge": "\ud83e\udd48 Better",
        "intuition": [
          "Store previously computed subproblem states in a lookup table or matrix.",
          "If a state is already visited, return the stored value immediately in O(1) time."
        ],
        "timeComplexity": "O(N\u00b2)",
        "spaceComplexity": "O(N\u00b2)",
        "complexityExplanation": "Memoization evaluates each state at most once, reducing time to O(N\u00b2).",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int LongestRepeatingSubsequenceBetter(String s) {\n        int n = s.length();\n        int[][] dp = new int[n + 1][n + 1];\n        for (int i = 1; i <= n; i++) {\n            for (int j = 1; j <= n; j++) {\n                if (s.charAt(i - 1) == s.charAt(j - 1) && i != j) {\n                    dp[i][j] = 1 + dp[i - 1][j - 1];\n                } else {\n                    dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);\n                }\n            }\n        }\n        return dp[n][n];\n    }\n}",
          "python": "class Solution:\n    def LongestRepeatingSubsequenceBetter(self, s: str) -> int:\n        n = len(s)\n        dp = [[0] * (n + 1) for _ in range(n + 1)]\n        for i in range(1, n + 1):\n            for j in range(1, n + 1):\n                if s[i - 1] == s[j - 1] and i != j:\n                    dp[i][j] = 1 + dp[i - 1][j - 1]\n                else:\n                    dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])\n        return dp[n][n]",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int LongestRepeatingSubsequenceBetter(std::string s) {\n        int n = s.length();\n        std::vector<std::vector<int>> dp(n + 1, std::vector<int>(n + 1, 0));\n        for (int i = 1; i <= n; ++i) {\n            for (int j = 1; j <= n; ++j) {\n                if (s[i - 1] == s[j - 1] && i != j) dp[i][j] = 1 + dp[i - 1][j - 1];\n                else dp[i][j] = std::max(dp[i - 1][j], dp[i][j - 1]);\n            }\n        }\n        return dp[n][n];\n    }\n};",
          "javascript": "function LongestRepeatingSubsequenceBetter(s) {\n    const n = s.length;\n    const dp = Array.from({ length: n + 1 }, () => new Array(n + 1).fill(0));\n    for (let i = 1; i <= n; i++) {\n        for (let j = 1; j <= n; j++) {\n            if (s[i - 1] === s[j - 1] && i !== j) dp[i][j] = 1 + dp[i - 1][j - 1];\n            else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);\n        }\n    }\n    return dp[n][n];\n}"
        }
      },
      "optimal": {
        "name": "Optimal (Modified LCS (i != j Invariant))",
        "tier": "optimal",
        "badge": "\ud83e\udd47 Optimal",
        "intuition": [
          "Find the longest subsequence that occurs at least twice without using the exact same indices.",
          "Formulate as LCS of string s with itself, with the constraint that i != j when characters match."
        ],
        "pseudocode": [
          "FUNCTION LongestRepeatingSubsequence(s):",
          "  n = s.length",
          "  dp = 2D Array (n + 1) x (n + 1) filled with 0",
          "  FOR i from 1 TO n:",
          "    FOR j from 1 TO n:",
          "      IF s[i - 1] == s[j - 1] AND i != j: dp[i][j] = 1 + dp[i - 1][j - 1]",
          "      ELSE: dp[i][j] = MAX(dp[i - 1][j], dp[i][j - 1])",
          "  RETURN dp[n][n]"
        ],
        "timeComplexity": "O(N\u00b2)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Optimal Modified LCS (i != j Invariant) achieves O(N\u00b2) time with O(N) auxiliary space.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int LongestRepeatingSubsequence(String s) {\n        int n = s.length();\n        int[] dp = new int[n + 1];\n        for (int i = 1; i <= n; i++) {\n            int prev = 0;\n            for (int j = 1; j <= n; j++) {\n                int temp = dp[j];\n                if (s.charAt(i - 1) == s.charAt(j - 1) && i != j) {\n                    dp[j] = 1 + prev;\n                } else {\n                    dp[j] = Math.max(dp[j], dp[j - 1]);\n                }\n                prev = temp;\n            }\n        }\n        return dp[n];\n    }\n}",
          "python": "class Solution:\n    def LongestRepeatingSubsequence(self, s: str) -> int:\n        n = len(s)\n        dp = [0] * (n + 1)\n        for i in range(1, n + 1):\n            prev = 0\n            for j in range(1, n + 1):\n                temp = dp[j]\n                if s[i - 1] == s[j - 1] and i != j:\n                    dp[j] = 1 + prev\n                else:\n                    dp[j] = max(dp[j], dp[j - 1])\n                prev = temp\n        return dp[n]",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int LongestRepeatingSubsequence(std::string s) {\n        int n = s.length();\n        std::vector<int> dp(n + 1, 0);\n        for (int i = 1; i <= n; ++i) {\n            int prev = 0;\n            for (int j = 1; j <= n; ++j) {\n                int temp = dp[j];\n                if (s[i - 1] == s[j - 1] && i != j) {\n                    dp[j] = 1 + prev;\n                } else {\n                    dp[j] = std::max(dp[j], dp[j - 1]);\n                }\n                prev = temp;\n            }\n        }\n        return dp[n];\n    }\n};",
          "javascript": "function LongestRepeatingSubsequence(s) {\n    const n = s.length;\n    const dp = new Array(n + 1).fill(0);\n    for (let i = 1; i <= n; i++) {\n        let prev = 0;\n        for (let j = 1; j <= n; j++) {\n            const temp = dp[j];\n            if (s[i - 1] === s[j - 1] && i !== j) {\n                dp[j] = 1 + prev;\n            } else {\n                dp[j] = Math.max(dp[j], dp[j - 1]);\n            }\n            prev = temp;\n        }\n    }\n    return dp[n];\n}"
        }
      }
    }
  },
  "longest_common_substring": {
    "questionId": "archetype-longest_common_substring",
    "pattern": "Continuous 2D / 1D Resetting Tabulation",
    "intuition": [
      "Unlike subsequence, substring characters must be strictly contiguous.",
      "If s1[i-1] == s2[j-1], dp[j] = 1 + prev.",
      "Otherwise, reset dp[j] = 0 immediately.",
      "Track global maximum over all cells."
    ],
    "pseudocode": [
      "FUNCTION longestCommonSubstr(s1, s2, n, m):",
      "  dp = Array(m + 1, 0); maxLen = 0",
      "  FOR i from 1 TO n:",
      "    prev = 0",
      "    FOR j from 1 TO m:",
      "      temp = dp[j]",
      "      IF s1[i-1] == s2[j-1]:",
      "        dp[j] = 1 + prev",
      "        maxLen = MAX(maxLen, dp[j])",
      "      ELSE: dp[j] = 0",
      "      prev = temp",
      "  RETURN maxLen"
    ],
    "timeComplexity": "O(N * M)",
    "spaceComplexity": "O(M)",
    "complexityExplanation": "Optimal Continuous 2D / 1D Resetting Tabulation achieves O(N * M) time with O(M) space.",
    "edgeCases": [
      "No common substring (returns 0)",
      "Entire string identical (returns n)",
      "Single character overlap"
    ],
    "code": {
      "java": "import java.util.*;\n\npublic class Solution {\n    public int longestCommonSubstr(String s1, String s2, int n, int m) {\n        int[] dp = new int[m + 1];\n        int maxLen = 0;\n        for (int i = 1; i <= n; i++) {\n            int prev = 0;\n            for (int j = 1; j <= m; j++) {\n                int temp = dp[j];\n                if (s1.charAt(i - 1) == s2.charAt(j - 1)) {\n                    dp[j] = 1 + prev;\n                    maxLen = Math.max(maxLen, dp[j]);\n                } else {\n                    dp[j] = 0;\n                }\n                prev = temp;\n            }\n        }\n        return maxLen;\n    }\n}",
      "python": "class Solution:\n    def longestCommonSubstr(self, s1: str, s2: str, n: int, m: int) -> int:\n        dp = [0] * (m + 1)\n        max_len = 0\n        for i in range(1, n + 1):\n            prev = 0\n            for j in range(1, m + 1):\n                temp = dp[j]\n                if s1[i - 1] == s2[j - 1]:\n                    dp[j] = 1 + prev\n                    max_len = max(max_len, dp[j])\n                else:\n                    dp[j] = 0\n                prev = temp\n        return max_len",
      "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int longestCommonSubstr(std::string s1, std::string s2, int n, int m) {\n        std::vector<int> dp(m + 1, 0);\n        int maxLen = 0;\n        for (int i = 1; i <= n; ++i) {\n            int prev = 0;\n            for (int j = 1; j <= m; ++j) {\n                int temp = dp[j];\n                if (s1[i - 1] == s2[j - 1]) {\n                    dp[j] = 1 + prev;\n                    maxLen = std::max(maxLen, dp[j]);\n                } else {\n                    dp[j] = 0;\n                }\n                prev = temp;\n            }\n        }\n        return maxLen;\n    }\n};",
      "javascript": "function longestCommonSubstr(s1, s2, n, m) {\n    const dp = new Array(m + 1).fill(0);\n    let maxLen = 0;\n    for (let i = 1; i <= n; i++) {\n        let prev = 0;\n        for (let j = 1; j <= m; j++) {\n            const temp = dp[j];\n            if (s1[i - 1] === s2[j - 1]) {\n                dp[j] = 1 + prev;\n                maxLen = Math.max(maxLen, dp[j]);\n            } else {\n                dp[j] = 0;\n            }\n            prev = temp;\n        }\n    }\n    return maxLen;\n}"
    },
    "interviewProTips": [
      "Start with the state transition recurrence for Longest Common Substring before writing space-optimized code.",
      "Verify base cases for empty or single element inputs to prevent out-of-bounds access."
    ],
    "approaches": {
      "brute": {
        "name": "Brute Force (Pure Recursion)",
        "tier": "brute",
        "badge": "\ud83e\udd49 Brute Force",
        "intuition": [
          "Formulate problem as recursive exploration of all choice branches without memoization.",
          "Re-evaluates identical subproblem states repeatedly, leading to exponential time complexity."
        ],
        "timeComplexity": "O(N * M * min(N, M))",
        "spaceComplexity": "O(1)",
        "complexityExplanation": "Exhaustive recursion tree branches into O(N * M * min(N, M)) operations.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int longestCommonSubstrBrute(String s1, String s2, int n, int m) {\n        int maxLen = 0;\n        for (int i = 0; i < n; i++) {\n            for (int j = 0; j < m; j++) {\n                int k = 0;\n                while (i + k < n && j + k < m && s1.charAt(i + k) == s2.charAt(j + k)) k++;\n                maxLen = Math.max(maxLen, k);\n            }\n        }\n        return maxLen;\n    }\n}",
          "python": "class Solution:\n    def longestCommonSubstrBrute(self, s1: str, s2: str, n: int, m: int) -> int:\n        max_len = 0\n        for i in range(n):\n            for j in range(m):\n                k = 0\n                while i + k < n and j + k < m and s1[i + k] == s2[j + k]:\n                    k += 1\n                max_len = max(max_len, k)\n        return max_len",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int longestCommonSubstrBrute(std::string s1, std::string s2, int n, int m) {\n        int maxLen = 0;\n        for (int i = 0; i < n; ++i) {\n            for (int j = 0; j < m; ++j) {\n                int k = 0;\n                while (i + k < n && j + k < m && s1[i + k] == s2[j + k]) ++k;\n                maxLen = std::max(maxLen, k);\n            }\n        }\n        return maxLen;\n    }\n};",
          "javascript": "function longestCommonSubstrBrute(s1, s2, n, m) {\n    let maxLen = 0;\n    for (let i = 0; i < n; i++) {\n        for (let j = 0; j < m; j++) {\n            let k = 0;\n            while (i + k < n && j + k < m && s1[i + k] === s2[j + k]) k++;\n            maxLen = Math.max(maxLen, k);\n        }\n    }\n    return maxLen;\n}"
        }
      },
      "better": {
        "name": "Better (Memoized DFS / 2D DP Table)",
        "tier": "better",
        "badge": "\ud83e\udd48 Better",
        "intuition": [
          "Store previously computed subproblem states in a lookup table or matrix.",
          "If a state is already visited, return the stored value immediately in O(1) time."
        ],
        "timeComplexity": "O(N * M)",
        "spaceComplexity": "O(N * M)",
        "complexityExplanation": "Memoization evaluates each state at most once, reducing time to O(N * M).",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int longestCommonSubstrBetter(String s1, String s2, int n, int m) {\n        int[][] dp = new int[n + 1][m + 1];\n        int maxLen = 0;\n        for (int i = 1; i <= n; i++) {\n            for (int j = 1; j <= m; j++) {\n                if (s1.charAt(i - 1) == s2.charAt(j - 1)) {\n                    dp[i][j] = 1 + dp[i - 1][j - 1];\n                    maxLen = Math.max(maxLen, dp[i][j]);\n                } else {\n                    dp[i][j] = 0;\n                }\n            }\n        }\n        return maxLen;\n    }\n}",
          "python": "class Solution:\n    def longestCommonSubstrBetter(self, s1: str, s2: str, n: int, m: int) -> int:\n        dp = [[0] * (m + 1) for _ in range(n + 1)]\n        max_len = 0\n        for i in range(1, n + 1):\n            for j in range(1, m + 1):\n                if s1[i - 1] == s2[j - 1]:\n                    dp[i][j] = 1 + dp[i - 1][j - 1]\n                    max_len = max(max_len, dp[i][j])\n        return max_len",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int longestCommonSubstrBetter(std::string s1, std::string s2, int n, int m) {\n        std::vector<std::vector<int>> dp(n + 1, std::vector<int>(m + 1, 0));\n        int maxLen = 0;\n        for (int i = 1; i <= n; ++i) {\n            for (int j = 1; j <= m; ++j) {\n                if (s1[i - 1] == s2[j - 1]) {\n                    dp[i][j] = 1 + dp[i - 1][j - 1];\n                    maxLen = std::max(maxLen, dp[i][j]);\n                }\n            }\n        }\n        return maxLen;\n    }\n};",
          "javascript": "function longestCommonSubstrBetter(s1, s2, n, m) {\n    const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));\n    let maxLen = 0;\n    for (let i = 1; i <= n; i++) {\n        for (let j = 1; j <= m; j++) {\n            if (s1[i - 1] === s2[j - 1]) {\n                dp[i][j] = 1 + dp[i - 1][j - 1];\n                maxLen = Math.max(maxLen, dp[i][j]);\n            }\n        }\n    }\n    return maxLen;\n}"
        }
      },
      "optimal": {
        "name": "Optimal (Continuous 2D / 1D Resetting Tabulation)",
        "tier": "optimal",
        "badge": "\ud83e\udd47 Optimal",
        "intuition": [
          "Unlike subsequence, substring characters must be strictly contiguous.",
          "If s1[i-1] == s2[j-1], dp[j] = 1 + prev.",
          "Otherwise, reset dp[j] = 0 immediately.",
          "Track global maximum over all cells."
        ],
        "pseudocode": [
          "FUNCTION longestCommonSubstr(s1, s2, n, m):",
          "  dp = Array(m + 1, 0); maxLen = 0",
          "  FOR i from 1 TO n:",
          "    prev = 0",
          "    FOR j from 1 TO m:",
          "      temp = dp[j]",
          "      IF s1[i-1] == s2[j-1]:",
          "        dp[j] = 1 + prev",
          "        maxLen = MAX(maxLen, dp[j])",
          "      ELSE: dp[j] = 0",
          "      prev = temp",
          "  RETURN maxLen"
        ],
        "timeComplexity": "O(N * M)",
        "spaceComplexity": "O(M)",
        "complexityExplanation": "Optimal Continuous 2D / 1D Resetting Tabulation achieves O(N * M) time with O(M) auxiliary space.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int longestCommonSubstr(String s1, String s2, int n, int m) {\n        int[] dp = new int[m + 1];\n        int maxLen = 0;\n        for (int i = 1; i <= n; i++) {\n            int prev = 0;\n            for (int j = 1; j <= m; j++) {\n                int temp = dp[j];\n                if (s1.charAt(i - 1) == s2.charAt(j - 1)) {\n                    dp[j] = 1 + prev;\n                    maxLen = Math.max(maxLen, dp[j]);\n                } else {\n                    dp[j] = 0;\n                }\n                prev = temp;\n            }\n        }\n        return maxLen;\n    }\n}",
          "python": "class Solution:\n    def longestCommonSubstr(self, s1: str, s2: str, n: int, m: int) -> int:\n        dp = [0] * (m + 1)\n        max_len = 0\n        for i in range(1, n + 1):\n            prev = 0\n            for j in range(1, m + 1):\n                temp = dp[j]\n                if s1[i - 1] == s2[j - 1]:\n                    dp[j] = 1 + prev\n                    max_len = max(max_len, dp[j])\n                else:\n                    dp[j] = 0\n                prev = temp\n        return max_len",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int longestCommonSubstr(std::string s1, std::string s2, int n, int m) {\n        std::vector<int> dp(m + 1, 0);\n        int maxLen = 0;\n        for (int i = 1; i <= n; ++i) {\n            int prev = 0;\n            for (int j = 1; j <= m; ++j) {\n                int temp = dp[j];\n                if (s1[i - 1] == s2[j - 1]) {\n                    dp[j] = 1 + prev;\n                    maxLen = std::max(maxLen, dp[j]);\n                } else {\n                    dp[j] = 0;\n                }\n                prev = temp;\n            }\n        }\n        return maxLen;\n    }\n};",
          "javascript": "function longestCommonSubstr(s1, s2, n, m) {\n    const dp = new Array(m + 1).fill(0);\n    let maxLen = 0;\n    for (let i = 1; i <= n; i++) {\n        let prev = 0;\n        for (let j = 1; j <= m; j++) {\n            const temp = dp[j];\n            if (s1[i - 1] === s2[j - 1]) {\n                dp[j] = 1 + prev;\n                maxLen = Math.max(maxLen, dp[j]);\n            } else {\n                dp[j] = 0;\n            }\n            prev = temp;\n        }\n    }\n    return maxLen;\n}"
        }
      }
    }
  },
  "boolean_parenthesization": {
    "questionId": "archetype-boolean_parenthesization",
    "pattern": "Interval DP Tracking True and False Counts",
    "intuition": [
      "Count ways to parenthesize a boolean expression of 'T', 'F' and operators '&', '|', '^' to evaluate to True.",
      "Split at each operator k between i and j.",
      "Combine true/false counts of left slice s[i..k-1] and right slice s[k+1..j] based on operator semantics.",
      "Modulo 1003 or 10^9+7 arithmetic applied at each addition."
    ],
    "pseudocode": [
      "FUNCTION countWays(n, s):",
      "  memo = Map(); RETURN solve(s, 0, n - 1, true)"
    ],
    "timeComplexity": "O(N\u00b3)",
    "spaceComplexity": "O(N\u00b2)",
    "complexityExplanation": "Optimal Interval DP Tracking True and False Counts achieves O(N\u00b3) time with O(N\u00b2) space.",
    "edgeCases": [
      "Single boolean operand ('T' or 'F')",
      "Expression evaluating to False only"
    ],
    "code": {
      "java": "import java.util.*;\n\npublic class Solution {\n    public int countWays(int n, String s) {\n        int[][][] memo = new int[n][n][2];\n        for (int[][] m2 : memo) for (int[] m1 : m2) Arrays.fill(m1, -1);\n        return solve(s, 0, n - 1, 1, memo);\n    }\n    private int solve(String s, int i, int j, int isTrue, int[][][] memo) {\n        if (i > j) return 0;\n        if (i == j) {\n            if (isTrue == 1) return s.charAt(i) == 'T' ? 1 : 0;\n            else return s.charAt(i) == 'F' ? 1 : 0;\n        }\n        if (memo[i][j][isTrue] != -1) return memo[i][j][isTrue];\n        long ways = 0, mod = 1003L;\n        for (int k = i + 1; k < j; k += 2) {\n            long lT = solve(s, i, k - 1, 1, memo);\n            long lF = solve(s, i, k - 1, 0, memo);\n            long rT = solve(s, k + 1, j, 1, memo);\n            long rF = solve(s, k + 1, j, 0, memo);\n            char op = s.charAt(k);\n            if (op == '&') {\n                if (isTrue == 1) ways = (ways + lT * rT) % mod;\n                else ways = (ways + lT * rF + lF * rT + lF * rF) % mod;\n            } else if (op == '|') {\n                if (isTrue == 1) ways = (ways + lT * rT + lT * rF + lF * rT) % mod;\n                else ways = (ways + lF * rF) % mod;\n            } else if (op == '^') {\n                if (isTrue == 1) ways = (ways + lT * rF + lF * rT) % mod;\n                else ways = (ways + lT * rT + lF * rF) % mod;\n            }\n        }\n        return memo[i][j][isTrue] = (int)ways;\n    }\n}",
      "python": "class Solution:\n    def countWays(self, n: int, s: str) -> int:\n        memo = {}\n        mod = 1003\n        def solve(i, j, is_true):\n            if i > j: return 0\n            if i == j:\n                return (1 if s[i] == 'T' else 0) if is_true else (1 if s[i] == 'F' else 0)\n            key = (i, j, is_true)\n            if key in memo: return memo[key]\n            ways = 0\n            for k in range(i + 1, j, 2):\n                lT = solve(i, k - 1, True)\n                lF = solve(i, k - 1, False)\n                rT = solve(k + 1, j, True)\n                rF = solve(k + 1, j, False)\n                op = s[k]\n                if op == '&':\n                    ways += (lT * rT) if is_true else (lT * rF + lF * rT + lF * rF)\n                elif op == '|':\n                    ways += (lT * rT + lT * rF + lF * rT) if is_true else (lF * rF)\n                elif op == '^':\n                    ways += (lT * rF + lF * rT) if is_true else (lT * rT + lF * rF)\n            memo[key] = ways % mod\n            return memo[key]\n        return solve(0, n - 1, True)",
      "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int solve(const std::string& s, int i, int j, bool isTrue, std::vector<std::vector<std::vector<int>>>& memo) {\n        if (i > j) return 0;\n        if (i == j) {\n            return isTrue ? (s[i] == 'T' ? 1 : 0) : (s[i] == 'F' ? 1 : 0);\n        }\n        if (memo[i][j][isTrue] != -1) return memo[i][j][isTrue];\n        long long ways = 0, mod = 1003;\n        for (int k = i + 1; k < j; k += 2) {\n            long long lT = solve(s, i, k - 1, true, memo);\n            long long lF = solve(s, i, k - 1, false, memo);\n            long long rT = solve(s, k + 1, j, true, memo);\n            long long rF = solve(s, k + 1, j, false, memo);\n            char op = s[k];\n            if (op == '&') {\n                ways = isTrue ? (ways + lT * rT) % mod : (ways + lT * rF + lF * rT + lF * rF) % mod;\n            } else if (op == '|') {\n                ways = isTrue ? (ways + lT * rT + lT * rF + lF * rT) % mod : (ways + lF * rF) % mod;\n            } else if (op == '^') {\n                ways = isTrue ? (ways + lT * rF + lF * rT) % mod : (ways + lT * rT + lF * rF) % mod;\n            }\n        }\n        return memo[i][j][isTrue] = ways;\n    }\n    int countWays(int n, std::string s) {\n        std::vector<std::vector<std::vector<int>>> memo(n, std::vector<std::vector<int>>(n, std::vector<int>(2, -1)));\n        return solve(s, 0, n - 1, true, memo);\n    }\n};",
      "javascript": "function countWays(n, s) {\n    const memo = new Map();\n    const mod = 1003;\n    function solve(i, j, isTrue) {\n        if (i > j) return 0;\n        if (i === j) return isTrue ? (s[i] === 'T' ? 1 : 0) : (s[i] === 'F' ? 1 : 0);\n        const key = `${i},${j},${isTrue}`;\n        if (memo.has(key)) return memo.get(key);\n        let ways = 0;\n        for (let k = i + 1; k < j; k += 2) {\n            const lT = solve(i, k - 1, true);\n            const lF = solve(i, k - 1, false);\n            const rT = solve(k + 1, j, true);\n            const rF = solve(k + 1, j, false);\n            const op = s[k];\n            if (op === '&') {\n                ways += isTrue ? lT * rT : (lT * rF + lF * rT + lF * rF);\n            } else if (op === '|') {\n                ways += isTrue ? (lT * rT + lT * rF + lF * rT) : (lF * rF);\n            } else if (op === '^') {\n                ways += isTrue ? (lT * rF + lF * rT) : (lT * rT + lF * rF);\n            }\n        }\n        ways %= mod;\n        memo.set(key, ways);\n        return ways;\n    }\n    return solve(0, n - 1, true);\n}"
    },
    "interviewProTips": [
      "Start with the state transition recurrence for Boolean Parenthesization Problem before writing space-optimized code.",
      "Verify base cases for empty or single element inputs to prevent out-of-bounds access."
    ],
    "approaches": {
      "brute": {
        "name": "Brute Force (Pure Recursion)",
        "tier": "brute",
        "badge": "\ud83e\udd49 Brute Force",
        "intuition": [
          "Formulate problem as recursive exploration of all choice branches without memoization.",
          "Re-evaluates identical subproblem states repeatedly, leading to exponential time complexity."
        ],
        "timeComplexity": "O(4\u207f / N^(3/2))",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Exhaustive recursion tree branches into O(4\u207f / N^(3/2)) operations.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int countWaysBrute(int n, String s) {\n        return solveRec(s, 0, n - 1, true);\n    }\n    private int solveRec(String s, int i, int j, boolean isTrue) {\n        if (i > j) return 0;\n        if (i == j) return isTrue ? (s.charAt(i) == 'T' ? 1 : 0) : (s.charAt(i) == 'F' ? 1 : 0);\n        int ways = 0;\n        for (int k = i + 1; k < j; k += 2) {\n            int lT = solveRec(s, i, k - 1, true);\n            int lF = solveRec(s, i, k - 1, false);\n            int rT = solveRec(s, k + 1, j, true);\n            int rF = solveRec(s, k + 1, j, false);\n            char op = s.charAt(k);\n            if (op == '&') ways += isTrue ? lT * rT : (lT * rF + lF * rT + lF * rF);\n            else if (op == '|') ways += isTrue ? (lT * rT + lT * rF + lF * rT) : (lF * rF);\n            else if (op == '^') ways += isTrue ? (lT * rF + lF * rT) : (lT * rT + lF * rF);\n        }\n        return ways % 1003;\n    }\n}",
          "python": "class Solution:\n    def countWaysBrute(self, n: int, s: str) -> int:\n        def solve_rec(i, j, is_true):\n            if i > j: return 0\n            if i == j: return (1 if s[i] == 'T' else 0) if is_true else (1 if s[i] == 'F' else 0)\n            ways = 0\n            for k in range(i + 1, j, 2):\n                lT = solve_rec(i, k - 1, True)\n                lF = solve_rec(i, k - 1, False)\n                rT = solve_rec(k + 1, j, True)\n                rF = solve_rec(k + 1, j, False)\n                op = s[k]\n                if op == '&': ways += lT * rT if is_true else (lT * rF + lF * rT + lF * rF)\n                elif op == '|': ways += (lT * rT + lT * rF + lF * rT) if is_true else lF * rF\n                elif op == '^': ways += (lT * rF + lF * rT) if is_true else (lT * rT + lF * rF)\n            return ways % 1003\n        return solve_rec(0, n - 1, True)",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int solveRec(const std::string& s, int i, int j, bool isTrue) {\n        if (i > j) return 0;\n        if (i == j) return isTrue ? (s[i] == 'T' ? 1 : 0) : (s[i] == 'F' ? 1 : 0);\n        int ways = 0;\n        for (int k = i + 1; k < j; k += 2) {\n            int lT = solveRec(s, i, k - 1, true);\n            int lF = solveRec(s, i, k - 1, false);\n            int rT = solveRec(s, k + 1, j, true);\n            int rF = solveRec(s, k + 1, j, false);\n            char op = s[k];\n            if (op == '&') ways += isTrue ? lT * rT : (lT * rF + lF * rT + lF * rF);\n            else if (op == '|') ways += isTrue ? (lT * rT + lT * rF + lF * rT) : (lF * rF);\n            else if (op == '^') ways += isTrue ? (lT * rF + lF * rT) : (lT * rT + lF * rF);\n        }\n        return ways % 1003;\n    }\n    int countWaysBrute(int n, std::string s) {\n        return solveRec(s, 0, n - 1, true);\n    }\n};",
          "javascript": "function countWaysBrute(n, s) {\n    function solveRec(i, j, isTrue) {\n        if (i > j) return 0;\n        if (i === j) return isTrue ? (s[i] === 'T' ? 1 : 0) : (s[i] === 'F' ? 1 : 0);\n        let ways = 0;\n        for (let k = i + 1; k < j; k += 2) {\n            const lT = solveRec(i, k - 1, true);\n            const lF = solveRec(i, k - 1, false);\n            const rT = solveRec(k + 1, j, true);\n            const rF = solveRec(k + 1, j, false);\n            const op = s[k];\n            if (op === '&') ways += isTrue ? lT * rT : (lT * rF + lF * rT + lF * rF);\n            else if (op === '|') ways += isTrue ? (lT * rT + lT * rF + lF * rT) : (lF * rF);\n            else if (op === '^') ways += isTrue ? (lT * rF + lF * rT) : (lT * rT + lF * rF);\n        }\n        return ways % 1003;\n    }\n    return solveRec(0, n - 1, true);\n}"
        }
      },
      "better": {
        "name": "Better (Memoized DFS / 2D DP Table)",
        "tier": "better",
        "badge": "\ud83e\udd48 Better",
        "intuition": [
          "Store previously computed subproblem states in a lookup table or matrix.",
          "If a state is already visited, return the stored value immediately in O(1) time."
        ],
        "timeComplexity": "O(N\u00b3)",
        "spaceComplexity": "O(N\u00b2)",
        "complexityExplanation": "Memoization evaluates each state at most once, reducing time to O(N\u00b3).",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int countWaysBetter(int n, String s) {\n        return countWays(n, s);\n    }\n}",
          "python": "class Solution:\n    def countWaysBetter(self, n: int, s: str) -> int:\n        return self.countWays(n, s)",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int countWaysBetter(int n, std::string s) {\n        return countWays(n, s);\n    }\n};",
          "javascript": "function countWaysBetter(n, s) {\n    return countWays(n, s);\n}"
        }
      },
      "optimal": {
        "name": "Optimal (Interval DP Tracking True and False Counts)",
        "tier": "optimal",
        "badge": "\ud83e\udd47 Optimal",
        "intuition": [
          "Count ways to parenthesize a boolean expression of 'T', 'F' and operators '&', '|', '^' to evaluate to True.",
          "Split at each operator k between i and j.",
          "Combine true/false counts of left slice s[i..k-1] and right slice s[k+1..j] based on operator semantics.",
          "Modulo 1003 or 10^9+7 arithmetic applied at each addition."
        ],
        "pseudocode": [
          "FUNCTION countWays(n, s):",
          "  memo = Map(); RETURN solve(s, 0, n - 1, true)"
        ],
        "timeComplexity": "O(N\u00b3)",
        "spaceComplexity": "O(N\u00b2)",
        "complexityExplanation": "Optimal Interval DP Tracking True and False Counts achieves O(N\u00b3) time with O(N\u00b2) auxiliary space.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int countWays(int n, String s) {\n        int[][][] memo = new int[n][n][2];\n        for (int[][] m2 : memo) for (int[] m1 : m2) Arrays.fill(m1, -1);\n        return solve(s, 0, n - 1, 1, memo);\n    }\n    private int solve(String s, int i, int j, int isTrue, int[][][] memo) {\n        if (i > j) return 0;\n        if (i == j) {\n            if (isTrue == 1) return s.charAt(i) == 'T' ? 1 : 0;\n            else return s.charAt(i) == 'F' ? 1 : 0;\n        }\n        if (memo[i][j][isTrue] != -1) return memo[i][j][isTrue];\n        long ways = 0, mod = 1003L;\n        for (int k = i + 1; k < j; k += 2) {\n            long lT = solve(s, i, k - 1, 1, memo);\n            long lF = solve(s, i, k - 1, 0, memo);\n            long rT = solve(s, k + 1, j, 1, memo);\n            long rF = solve(s, k + 1, j, 0, memo);\n            char op = s.charAt(k);\n            if (op == '&') {\n                if (isTrue == 1) ways = (ways + lT * rT) % mod;\n                else ways = (ways + lT * rF + lF * rT + lF * rF) % mod;\n            } else if (op == '|') {\n                if (isTrue == 1) ways = (ways + lT * rT + lT * rF + lF * rT) % mod;\n                else ways = (ways + lF * rF) % mod;\n            } else if (op == '^') {\n                if (isTrue == 1) ways = (ways + lT * rF + lF * rT) % mod;\n                else ways = (ways + lT * rT + lF * rF) % mod;\n            }\n        }\n        return memo[i][j][isTrue] = (int)ways;\n    }\n}",
          "python": "class Solution:\n    def countWays(self, n: int, s: str) -> int:\n        memo = {}\n        mod = 1003\n        def solve(i, j, is_true):\n            if i > j: return 0\n            if i == j:\n                return (1 if s[i] == 'T' else 0) if is_true else (1 if s[i] == 'F' else 0)\n            key = (i, j, is_true)\n            if key in memo: return memo[key]\n            ways = 0\n            for k in range(i + 1, j, 2):\n                lT = solve(i, k - 1, True)\n                lF = solve(i, k - 1, False)\n                rT = solve(k + 1, j, True)\n                rF = solve(k + 1, j, False)\n                op = s[k]\n                if op == '&':\n                    ways += (lT * rT) if is_true else (lT * rF + lF * rT + lF * rF)\n                elif op == '|':\n                    ways += (lT * rT + lT * rF + lF * rT) if is_true else (lF * rF)\n                elif op == '^':\n                    ways += (lT * rF + lF * rT) if is_true else (lT * rT + lF * rF)\n            memo[key] = ways % mod\n            return memo[key]\n        return solve(0, n - 1, True)",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int solve(const std::string& s, int i, int j, bool isTrue, std::vector<std::vector<std::vector<int>>>& memo) {\n        if (i > j) return 0;\n        if (i == j) {\n            return isTrue ? (s[i] == 'T' ? 1 : 0) : (s[i] == 'F' ? 1 : 0);\n        }\n        if (memo[i][j][isTrue] != -1) return memo[i][j][isTrue];\n        long long ways = 0, mod = 1003;\n        for (int k = i + 1; k < j; k += 2) {\n            long long lT = solve(s, i, k - 1, true, memo);\n            long long lF = solve(s, i, k - 1, false, memo);\n            long long rT = solve(s, k + 1, j, true, memo);\n            long long rF = solve(s, k + 1, j, false, memo);\n            char op = s[k];\n            if (op == '&') {\n                ways = isTrue ? (ways + lT * rT) % mod : (ways + lT * rF + lF * rT + lF * rF) % mod;\n            } else if (op == '|') {\n                ways = isTrue ? (ways + lT * rT + lT * rF + lF * rT) % mod : (ways + lF * rF) % mod;\n            } else if (op == '^') {\n                ways = isTrue ? (ways + lT * rF + lF * rT) % mod : (ways + lT * rT + lF * rF) % mod;\n            }\n        }\n        return memo[i][j][isTrue] = ways;\n    }\n    int countWays(int n, std::string s) {\n        std::vector<std::vector<std::vector<int>>> memo(n, std::vector<std::vector<int>>(n, std::vector<int>(2, -1)));\n        return solve(s, 0, n - 1, true, memo);\n    }\n};",
          "javascript": "function countWays(n, s) {\n    const memo = new Map();\n    const mod = 1003;\n    function solve(i, j, isTrue) {\n        if (i > j) return 0;\n        if (i === j) return isTrue ? (s[i] === 'T' ? 1 : 0) : (s[i] === 'F' ? 1 : 0);\n        const key = `${i},${j},${isTrue}`;\n        if (memo.has(key)) return memo.get(key);\n        let ways = 0;\n        for (let k = i + 1; k < j; k += 2) {\n            const lT = solve(i, k - 1, true);\n            const lF = solve(i, k - 1, false);\n            const rT = solve(k + 1, j, true);\n            const rF = solve(k + 1, j, false);\n            const op = s[k];\n            if (op === '&') {\n                ways += isTrue ? lT * rT : (lT * rF + lF * rT + lF * rF);\n            } else if (op === '|') {\n                ways += isTrue ? (lT * rT + lT * rF + lF * rT) : (lF * rF);\n            } else if (op === '^') {\n                ways += isTrue ? (lT * rF + lF * rT) : (lT * rT + lF * rF);\n            }\n        }\n        ways %= mod;\n        memo.set(key, ways);\n        return ways;\n    }\n    return solve(0, n - 1, true);\n}"
        }
      }
    }
  },
  "optimal_bst": {
    "questionId": "archetype-optimal_bst",
    "pattern": "Interval DP for Minimal Expected Search Cost",
    "intuition": [
      "Given sorted keys and frequencies, find minimal cost of binary search tree.",
      "For range (i, j), pick each key r as root.",
      "Cost = sum(freq[i..j]) + cost(left subtree) + cost(right subtree)."
    ],
    "pseudocode": [
      "FUNCTION optimalSearchTree(keys, freq, n):",
      "  cost = 2D Array n x n",
      "  FOR L from 1 TO n:",
      "    FOR i from 0 TO n - L:",
      "      j = i + L - 1; cost[i][j] = INFINITY",
      "      fSum = SUM(freq[i..j])",
      "      FOR r from i TO j:",
      "        c = ((r > i) ? cost[i][r - 1] : 0) + ((r < j) ? cost[r + 1][j] : 0) + fSum",
      "        cost[i][j] = MIN(cost[i][j], c)",
      "  RETURN cost[0][n - 1]"
    ],
    "timeComplexity": "O(N\u00b3)",
    "spaceComplexity": "O(N\u00b2)",
    "complexityExplanation": "Optimal Interval DP for Minimal Expected Search Cost achieves O(N\u00b3) time with O(N\u00b2) space.",
    "edgeCases": [
      "Single key",
      "All keys have identical frequency"
    ],
    "code": {
      "java": "import java.util.*;\n\npublic class Solution {\n    public int optimalSearchTree(int[] keys, int[] freq, int n) {\n        int[][] cost = new int[n][n];\n        for (int i = 0; i < n; i++) cost[i][i] = freq[i];\n        for (int L = 2; L <= n; L++) {\n            for (int i = 0; i <= n - L; i++) {\n                int j = i + L - 1;\n                cost[i][j] = Integer.MAX_VALUE;\n                int fSum = 0;\n                for (int k = i; k <= j; k++) fSum += freq[k];\n                for (int r = i; r <= j; r++) {\n                    int c = ((r > i) ? cost[i][r - 1] : 0) + ((r < j) ? cost[r + 1][j] : 0) + fSum;\n                    cost[i][j] = Math.min(cost[i][j], c);\n                }\n            }\n        }\n        return cost[0][n - 1];\n    }\n}",
      "python": "class Solution:\n    def optimalSearchTree(self, keys: list[int], freq: list[int], n: int) -> int:\n        cost = [[0] * n for _ in range(n)]\n        for i in range(n): cost[i][i] = freq[i]\n        for L in range(2, n + 1):\n            for i in range(n - L + 1):\n                j = i + L - 1\n                f_sum = sum(freq[i:j+1])\n                cost[i][j] = min(\n                    ((cost[i][r - 1] if r > i else 0) + (cost[r + 1][j] if r < j else 0) + f_sum)\n                    for r in range(i, j + 1)\n                )\n        return cost[0][n - 1]",
      "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int optimalSearchTree(std::vector<int>& keys, std::vector<int>& freq, int n) {\n        std::vector<std::vector<int>> cost(n, std::vector<int>(n, 0));\n        for (int i = 0; i < n; ++i) cost[i][i] = freq[i];\n        for (int L = 2; L <= n; ++L) {\n            for (int i = 0; i <= n - L; ++i) {\n                int j = i + L - 1;\n                cost[i][j] = INT_MAX;\n                int fSum = 0;\n                for (int k = i; k <= j; ++k) fSum += freq[k];\n                for (int r = i; r <= j; ++r) {\n                    int c = ((r > i) ? cost[i][r - 1] : 0) + ((r < j) ? cost[r + 1][j] : 0) + fSum;\n                    cost[i][j] = std::min(cost[i][j], c);\n                }\n            }\n        }\n        return cost[0][n - 1];\n    }\n};",
      "javascript": "function optimalSearchTree(keys, freq, n) {\n    const cost = Array.from({ length: n }, () => new Array(n).fill(0));\n    for (let i = 0; i < n; i++) cost[i][i] = freq[i];\n    for (let L = 2; L <= n; L++) {\n        for (let i = 0; i <= n - L; i++) {\n            const j = i + L - 1;\n            let fSum = 0;\n            for (let k = i; k <= j; k++) fSum += freq[k];\n            let minC = Infinity;\n            for (let r = i; r <= j; r++) {\n                const c = ((r > i) ? cost[i][r - 1] : 0) + ((r < j) ? cost[r + 1][j] : 0) + fSum;\n                minC = Math.min(minC, c);\n            }\n            cost[i][j] = minC;\n        }\n    }\n    return cost[0][n - 1];\n}"
    },
    "interviewProTips": [
      "Start with the state transition recurrence for Optimal Binary Search Tree before writing space-optimized code.",
      "Verify base cases for empty or single element inputs to prevent out-of-bounds access."
    ],
    "approaches": {
      "brute": {
        "name": "Brute Force (Pure Recursion)",
        "tier": "brute",
        "badge": "\ud83e\udd49 Brute Force",
        "intuition": [
          "Formulate problem as recursive exploration of all choice branches without memoization.",
          "Re-evaluates identical subproblem states repeatedly, leading to exponential time complexity."
        ],
        "timeComplexity": "O(2\u207f)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Exhaustive recursion tree branches into O(2\u207f) operations.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int optimalSearchTreeBrute(int[] keys, int[] freq, int n) {\n        return optCost(freq, 0, n - 1);\n    }\n    private int optCost(int[] freq, int i, int j) {\n        if (i > j) return 0;\n        if (i == j) return freq[i];\n        int fSum = 0;\n        for (int k = i; k <= j; k++) fSum += freq[k];\n        int minCost = Integer.MAX_VALUE;\n        for (int r = i; r <= j; r++) {\n            int c = optCost(freq, i, r - 1) + optCost(freq, r + 1, j);\n            minCost = Math.min(minCost, c);\n        }\n        return minCost + fSum;\n    }\n}",
          "python": "class Solution:\n    def optimalSearchTreeBrute(self, keys: list[int], freq: list[int], n: int) -> int:\n        def opt(i, j):\n            if i > j: return 0\n            if i == j: return freq[i]\n            f_sum = sum(freq[i:j+1])\n            return f_sum + min(opt(i, r - 1) + opt(r + 1, j) for r in range(i, j + 1))\n        return opt(0, n - 1)",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int optCost(const std::vector<int>& freq, int i, int j) {\n        if (i > j) return 0;\n        if (i == j) return freq[i];\n        int fSum = 0;\n        for (int k = i; k <= j; ++k) fSum += freq[k];\n        int minCost = INT_MAX;\n        for (int r = i; r <= j; ++r) {\n            int c = optCost(freq, i, r - 1) + optCost(freq, r + 1, j);\n            minCost = std::min(minCost, c);\n        }\n        return minCost + fSum;\n    }\n    int optimalSearchTreeBrute(std::vector<int>& keys, std::vector<int>& freq, int n) {\n        return optCost(freq, 0, n - 1);\n    }\n};",
          "javascript": "function optimalSearchTreeBrute(keys, freq, n) {\n    function optCost(i, j) {\n        if (i > j) return 0;\n        if (i === j) return freq[i];\n        let fSum = 0;\n        for (let k = i; k <= j; k++) fSum += freq[k];\n        let minCost = Infinity;\n        for (let r = i; r <= j; r++) {\n            minCost = Math.min(minCost, optCost(i, r - 1) + optCost(r + 1, j));\n        }\n        return minCost + fSum;\n    }\n    return optCost(0, n - 1);\n}"
        }
      },
      "better": {
        "name": "Better (Memoized DFS / 2D DP Table)",
        "tier": "better",
        "badge": "\ud83e\udd48 Better",
        "intuition": [
          "Store previously computed subproblem states in a lookup table or matrix.",
          "If a state is already visited, return the stored value immediately in O(1) time."
        ],
        "timeComplexity": "O(N\u00b3)",
        "spaceComplexity": "O(N\u00b2)",
        "complexityExplanation": "Memoization evaluates each state at most once, reducing time to O(N\u00b3).",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int optimalSearchTreeBetter(int[] keys, int[] freq, int n) {\n        return optimalSearchTree(keys, freq, n);\n    }\n}",
          "python": "class Solution:\n    def optimalSearchTreeBetter(self, keys: list[int], freq: list[int], n: int) -> int:\n        return self.optimalSearchTree(keys, freq, n)",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int optimalSearchTreeBetter(std::vector<int>& keys, std::vector<int>& freq, int n) {\n        return optimalSearchTree(keys, freq, n);\n    }\n};",
          "javascript": "function optimalSearchTreeBetter(keys, freq, n) {\n    return optimalSearchTree(keys, freq, n);\n}"
        }
      },
      "optimal": {
        "name": "Optimal (Interval DP for Minimal Expected Search Cost)",
        "tier": "optimal",
        "badge": "\ud83e\udd47 Optimal",
        "intuition": [
          "Given sorted keys and frequencies, find minimal cost of binary search tree.",
          "For range (i, j), pick each key r as root.",
          "Cost = sum(freq[i..j]) + cost(left subtree) + cost(right subtree)."
        ],
        "pseudocode": [
          "FUNCTION optimalSearchTree(keys, freq, n):",
          "  cost = 2D Array n x n",
          "  FOR L from 1 TO n:",
          "    FOR i from 0 TO n - L:",
          "      j = i + L - 1; cost[i][j] = INFINITY",
          "      fSum = SUM(freq[i..j])",
          "      FOR r from i TO j:",
          "        c = ((r > i) ? cost[i][r - 1] : 0) + ((r < j) ? cost[r + 1][j] : 0) + fSum",
          "        cost[i][j] = MIN(cost[i][j], c)",
          "  RETURN cost[0][n - 1]"
        ],
        "timeComplexity": "O(N\u00b3)",
        "spaceComplexity": "O(N\u00b2)",
        "complexityExplanation": "Optimal Interval DP for Minimal Expected Search Cost achieves O(N\u00b3) time with O(N\u00b2) auxiliary space.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int optimalSearchTree(int[] keys, int[] freq, int n) {\n        int[][] cost = new int[n][n];\n        for (int i = 0; i < n; i++) cost[i][i] = freq[i];\n        for (int L = 2; L <= n; L++) {\n            for (int i = 0; i <= n - L; i++) {\n                int j = i + L - 1;\n                cost[i][j] = Integer.MAX_VALUE;\n                int fSum = 0;\n                for (int k = i; k <= j; k++) fSum += freq[k];\n                for (int r = i; r <= j; r++) {\n                    int c = ((r > i) ? cost[i][r - 1] : 0) + ((r < j) ? cost[r + 1][j] : 0) + fSum;\n                    cost[i][j] = Math.min(cost[i][j], c);\n                }\n            }\n        }\n        return cost[0][n - 1];\n    }\n}",
          "python": "class Solution:\n    def optimalSearchTree(self, keys: list[int], freq: list[int], n: int) -> int:\n        cost = [[0] * n for _ in range(n)]\n        for i in range(n): cost[i][i] = freq[i]\n        for L in range(2, n + 1):\n            for i in range(n - L + 1):\n                j = i + L - 1\n                f_sum = sum(freq[i:j+1])\n                cost[i][j] = min(\n                    ((cost[i][r - 1] if r > i else 0) + (cost[r + 1][j] if r < j else 0) + f_sum)\n                    for r in range(i, j + 1)\n                )\n        return cost[0][n - 1]",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int optimalSearchTree(std::vector<int>& keys, std::vector<int>& freq, int n) {\n        std::vector<std::vector<int>> cost(n, std::vector<int>(n, 0));\n        for (int i = 0; i < n; ++i) cost[i][i] = freq[i];\n        for (int L = 2; L <= n; ++L) {\n            for (int i = 0; i <= n - L; ++i) {\n                int j = i + L - 1;\n                cost[i][j] = INT_MAX;\n                int fSum = 0;\n                for (int k = i; k <= j; ++k) fSum += freq[k];\n                for (int r = i; r <= j; ++r) {\n                    int c = ((r > i) ? cost[i][r - 1] : 0) + ((r < j) ? cost[r + 1][j] : 0) + fSum;\n                    cost[i][j] = std::min(cost[i][j], c);\n                }\n            }\n        }\n        return cost[0][n - 1];\n    }\n};",
          "javascript": "function optimalSearchTree(keys, freq, n) {\n    const cost = Array.from({ length: n }, () => new Array(n).fill(0));\n    for (let i = 0; i < n; i++) cost[i][i] = freq[i];\n    for (let L = 2; L <= n; L++) {\n        for (let i = 0; i <= n - L; i++) {\n            const j = i + L - 1;\n            let fSum = 0;\n            for (let k = i; k <= j; k++) fSum += freq[k];\n            let minC = Infinity;\n            for (let r = i; r <= j; r++) {\n                const c = ((r > i) ? cost[i][r - 1] : 0) + ((r < j) ? cost[r + 1][j] : 0) + fSum;\n                minC = Math.min(minC, c);\n            }\n            cost[i][j] = minC;\n        }\n    }\n    return cost[0][n - 1];\n}"
        }
      }
    }
  },
  "optimal_game_strategy": {
    "questionId": "archetype-optimal_game_strategy",
    "pattern": "Interval Minimax Dynamic Programming",
    "intuition": [
      "Two players take turns picking either the first or last coin from remaining line.",
      "Your choice: pick arr[i] or arr[j].",
      "Opponent plays optimally, leaving you the minimum of remaining options.",
      "dp[i][j] = max(arr[i] + min(dp[i+2][j], dp[i+1][j-1]), arr[j] + min(dp[i+1][j-1], dp[i][j-2]))."
    ],
    "pseudocode": [
      "FUNCTION maximumAmount(arr, n):",
      "  dp = 2D Array n x n",
      "  FOR gap from 0 TO n - 1:",
      "    FOR i from 0 TO n - gap - 1:",
      "      j = i + gap",
      "      x = (i + 2 <= j) ? dp[i + 2][j] : 0",
      "      y = (i + 1 <= j - 1) ? dp[i + 1][j - 1] : 0",
      "      z = (i <= j - 2) ? dp[i][j - 2] : 0",
      "      dp[i][j] = MAX(arr[i] + MIN(x, y), arr[j] + MIN(y, z))",
      "  RETURN dp[0][n - 1]"
    ],
    "timeComplexity": "O(N\u00b2)",
    "spaceComplexity": "O(N\u00b2)",
    "complexityExplanation": "Optimal Interval Minimax Dynamic Programming achieves O(N\u00b2) time with O(N\u00b2) space.",
    "edgeCases": [
      "Even number of elements",
      "Odd number of elements",
      "All identical coin values"
    ],
    "code": {
      "java": "import java.util.*;\n\npublic class Solution {\n    public int maximumAmount(int[] arr, int n) {\n        int[][] dp = new int[n][n];\n        for (int gap = 0; gap < n; gap++) {\n            for (int i = 0, j = gap; j < n; i++, j++) {\n                int x = (i + 2 <= j) ? dp[i + 2][j] : 0;\n                int y = (i + 1 <= j - 1) ? dp[i + 1][j - 1] : 0;\n                int z = (i <= j - 2) ? dp[i][j - 2] : 0;\n                dp[i][j] = Math.max(arr[i] + Math.min(x, y), arr[j] + Math.min(y, z));\n            }\n        }\n        return dp[0][n - 1];\n    }\n}",
      "python": "class Solution:\n    def maximumAmount(self, arr: list[int], n: int) -> int:\n        dp = [[0] * n for _ in range(n)]\n        for gap in range(n):\n            for i in range(n - gap):\n                j = i + gap\n                x = dp[i + 2][j] if i + 2 <= j else 0\n                y = dp[i + 1][j - 1] if i + 1 <= j - 1 else 0\n                z = dp[i][j - 2] if i <= j - 2 else 0\n                dp[i][j] = max(arr[i] + min(x, y), arr[j] + min(y, z))\n        return dp[0][n - 1]",
      "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int maximumAmount(std::vector<int>& arr, int n) {\n        std::vector<std::vector<int>> dp(n, std::vector<int>(n, 0));\n        for (int gap = 0; gap < n; ++gap) {\n            for (int i = 0, j = gap; j < n; ++i, ++j) {\n                int x = (i + 2 <= j) ? dp[i + 2][j] : 0;\n                int y = (i + 1 <= j - 1) ? dp[i + 1][j - 1] : 0;\n                int z = (i <= j - 2) ? dp[i][j - 2] : 0;\n                dp[i][j] = std::max(arr[i] + std::min(x, y), arr[j] + std::min(y, z));\n            }\n        }\n        return dp[0][n - 1];\n    }\n};",
      "javascript": "function maximumAmount(arr, n) {\n    const dp = Array.from({ length: n }, () => new Array(n).fill(0));\n    for (let gap = 0; gap < n; gap++) {\n        for (let i = 0, j = gap; j < n; i++, j++) {\n            const x = (i + 2 <= j) ? dp[i + 2][j] : 0;\n            const y = (i + 1 <= j - 1) ? dp[i + 1][j - 1] : 0;\n            const z = (i <= j - 2) ? dp[i][j - 2] : 0;\n            dp[i][j] = Math.max(arr[i] + Math.min(x, y), arr[j] + Math.min(y, z));\n        }\n    }\n    return dp[0][n - 1];\n}"
    },
    "interviewProTips": [
      "Start with the state transition recurrence for Optimal Strategy for a Game before writing space-optimized code.",
      "Verify base cases for empty or single element inputs to prevent out-of-bounds access."
    ],
    "approaches": {
      "brute": {
        "name": "Brute Force (Pure Recursion)",
        "tier": "brute",
        "badge": "\ud83e\udd49 Brute Force",
        "intuition": [
          "Formulate problem as recursive exploration of all choice branches without memoization.",
          "Re-evaluates identical subproblem states repeatedly, leading to exponential time complexity."
        ],
        "timeComplexity": "O(2\u207f)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Exhaustive recursion tree branches into O(2\u207f) operations.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int maximumAmountBrute(int[] arr, int n) {\n        return helper(arr, 0, n - 1);\n    }\n    private int helper(int[] arr, int i, int j) {\n        if (i == j) return arr[i];\n        if (i + 1 == j) return Math.max(arr[i], arr[j]);\n        int takeLeft = arr[i] + Math.min(helper(arr, i + 2, j), helper(arr, i + 1, j - 1));\n        int takeRight = arr[j] + Math.min(helper(arr, i + 1, j - 1), helper(arr, i, j - 2));\n        return Math.max(takeLeft, takeRight);\n    }\n}",
          "python": "class Solution:\n    def maximumAmountBrute(self, arr: list[int], n: int) -> int:\n        def h(i, j):\n            if i == j: return arr[i]\n            if i + 1 == j: return max(arr[i], arr[j])\n            take_l = arr[i] + min(h(i + 2, j), h(i + 1, j - 1))\n            take_r = arr[j] + min(h(i + 1, j - 1), h(i, j - 2))\n            return max(take_l, take_r)\n        return h(0, n - 1)",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int helper(const std::vector<int>& arr, int i, int j) {\n        if (i == j) return arr[i];\n        if (i + 1 == j) return std::max(arr[i], arr[j]);\n        int takeLeft = arr[i] + std::min(helper(arr, i + 2, j), helper(arr, i + 1, j - 1));\n        int takeRight = arr[j] + std::min(helper(arr, i + 1, j - 1), helper(arr, i, j - 2));\n        return std::max(takeLeft, takeRight);\n    }\n    int maximumAmountBrute(std::vector<int>& arr, int n) {\n        return helper(arr, 0, n - 1);\n    }\n};",
          "javascript": "function maximumAmountBrute(arr, n) {\n    function h(i, j) {\n        if (i === j) return arr[i];\n        if (i + 1 === j) return Math.max(arr[i], arr[j]);\n        const takeL = arr[i] + Math.min(h(i + 2, j), h(i + 1, j - 1));\n        const takeR = arr[j] + Math.min(h(i + 1, j - 1), h(i, j - 2));\n        return Math.max(takeL, takeR);\n    }\n    return h(0, n - 1);\n}"
        }
      },
      "better": {
        "name": "Better (Memoized DFS / 2D DP Table)",
        "tier": "better",
        "badge": "\ud83e\udd48 Better",
        "intuition": [
          "Store previously computed subproblem states in a lookup table or matrix.",
          "If a state is already visited, return the stored value immediately in O(1) time."
        ],
        "timeComplexity": "O(N\u00b2)",
        "spaceComplexity": "O(N\u00b2)",
        "complexityExplanation": "Memoization evaluates each state at most once, reducing time to O(N\u00b2).",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int maximumAmountBetter(int[] arr, int n) {\n        return maximumAmount(arr, n);\n    }\n}",
          "python": "class Solution:\n    def maximumAmountBetter(self, arr: list[int], n: int) -> int:\n        return self.maximumAmount(arr, n)",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int maximumAmountBetter(std::vector<int>& arr, int n) {\n        return maximumAmount(arr, n);\n    }\n};",
          "javascript": "function maximumAmountBetter(arr, n) {\n    return maximumAmount(arr, n);\n}"
        }
      },
      "optimal": {
        "name": "Optimal (Interval Minimax Dynamic Programming)",
        "tier": "optimal",
        "badge": "\ud83e\udd47 Optimal",
        "intuition": [
          "Two players take turns picking either the first or last coin from remaining line.",
          "Your choice: pick arr[i] or arr[j].",
          "Opponent plays optimally, leaving you the minimum of remaining options.",
          "dp[i][j] = max(arr[i] + min(dp[i+2][j], dp[i+1][j-1]), arr[j] + min(dp[i+1][j-1], dp[i][j-2]))."
        ],
        "pseudocode": [
          "FUNCTION maximumAmount(arr, n):",
          "  dp = 2D Array n x n",
          "  FOR gap from 0 TO n - 1:",
          "    FOR i from 0 TO n - gap - 1:",
          "      j = i + gap",
          "      x = (i + 2 <= j) ? dp[i + 2][j] : 0",
          "      y = (i + 1 <= j - 1) ? dp[i + 1][j - 1] : 0",
          "      z = (i <= j - 2) ? dp[i][j - 2] : 0",
          "      dp[i][j] = MAX(arr[i] + MIN(x, y), arr[j] + MIN(y, z))",
          "  RETURN dp[0][n - 1]"
        ],
        "timeComplexity": "O(N\u00b2)",
        "spaceComplexity": "O(N\u00b2)",
        "complexityExplanation": "Optimal Interval Minimax Dynamic Programming achieves O(N\u00b2) time with O(N\u00b2) auxiliary space.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int maximumAmount(int[] arr, int n) {\n        int[][] dp = new int[n][n];\n        for (int gap = 0; gap < n; gap++) {\n            for (int i = 0, j = gap; j < n; i++, j++) {\n                int x = (i + 2 <= j) ? dp[i + 2][j] : 0;\n                int y = (i + 1 <= j - 1) ? dp[i + 1][j - 1] : 0;\n                int z = (i <= j - 2) ? dp[i][j - 2] : 0;\n                dp[i][j] = Math.max(arr[i] + Math.min(x, y), arr[j] + Math.min(y, z));\n            }\n        }\n        return dp[0][n - 1];\n    }\n}",
          "python": "class Solution:\n    def maximumAmount(self, arr: list[int], n: int) -> int:\n        dp = [[0] * n for _ in range(n)]\n        for gap in range(n):\n            for i in range(n - gap):\n                j = i + gap\n                x = dp[i + 2][j] if i + 2 <= j else 0\n                y = dp[i + 1][j - 1] if i + 1 <= j - 1 else 0\n                z = dp[i][j - 2] if i <= j - 2 else 0\n                dp[i][j] = max(arr[i] + min(x, y), arr[j] + min(y, z))\n        return dp[0][n - 1]",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int maximumAmount(std::vector<int>& arr, int n) {\n        std::vector<std::vector<int>> dp(n, std::vector<int>(n, 0));\n        for (int gap = 0; gap < n; ++gap) {\n            for (int i = 0, j = gap; j < n; ++i, ++j) {\n                int x = (i + 2 <= j) ? dp[i + 2][j] : 0;\n                int y = (i + 1 <= j - 1) ? dp[i + 1][j - 1] : 0;\n                int z = (i <= j - 2) ? dp[i][j - 2] : 0;\n                dp[i][j] = std::max(arr[i] + std::min(x, y), arr[j] + std::min(y, z));\n            }\n        }\n        return dp[0][n - 1];\n    }\n};",
          "javascript": "function maximumAmount(arr, n) {\n    const dp = Array.from({ length: n }, () => new Array(n).fill(0));\n    for (let gap = 0; gap < n; gap++) {\n        for (let i = 0, j = gap; j < n; i++, j++) {\n            const x = (i + 2 <= j) ? dp[i + 2][j] : 0;\n            const y = (i + 1 <= j - 1) ? dp[i + 1][j - 1] : 0;\n            const z = (i <= j - 2) ? dp[i][j - 2] : 0;\n            dp[i][j] = Math.max(arr[i] + Math.min(x, y), arr[j] + Math.min(y, z));\n        }\n    }\n    return dp[0][n - 1];\n}"
        }
      }
    }
  },
  "word_wrap": {
    "questionId": "archetype-word_wrap",
    "pattern": "1D Suffix Dynamic Programming",
    "intuition": [
      "Minimize sum of squared trailing spaces across all lines (except the last line).",
      "Let dp[i] represent the minimum cost to arrange words nums[i..n-1].",
      "Try putting words nums[i..j] on the current line; if valid, cost is spaces^2 + dp[j+1]."
    ],
    "pseudocode": [
      "FUNCTION solveWordWrap(nums, k):",
      "  n = nums.length; dp = Array(n, 0)",
      "  FOR i from n - 1 DOWNTO 0:",
      "    len = -1; dp[i] = INFINITY",
      "    FOR j from i TO n - 1:",
      "      len += nums[j] + 1",
      "      IF len > k: BREAK",
      "      cost = (j == n - 1) ? 0 : (k - len)^2 + dp[j + 1]",
      "      dp[i] = MIN(dp[i], cost)",
      "  RETURN dp[0]"
    ],
    "timeComplexity": "O(N\u00b2)",
    "spaceComplexity": "O(N)",
    "complexityExplanation": "Optimal 1D Suffix Dynamic Programming achieves O(N\u00b2) time with O(N) space.",
    "edgeCases": [
      "All words fit on single line (cost 0)",
      "Each word requires its own line"
    ],
    "code": {
      "java": "import java.util.*;\n\npublic class Solution {\n    public int solveWordWrap(int[] nums, int k) {\n        int n = nums.length;\n        int[] dp = new int[n];\n        for (int i = n - 1; i >= 0; i--) {\n            int len = -1;\n            dp[i] = Integer.MAX_VALUE;\n            for (int j = i; j < n; j++) {\n                len += nums[j] + 1;\n                if (len > k) break;\n                int cost = (j == n - 1) ? 0 : (k - len) * (k - len) + dp[j + 1];\n                dp[i] = Math.min(dp[i], cost);\n            }\n        }\n        return dp[0];\n    }\n}",
      "python": "class Solution:\n    def solveWordWrap(self, nums: list[int], k: int) -> int:\n        n = len(nums)\n        dp = [0] * (n + 1)\n        for i in range(n - 1, -1, -1):\n            cur_len = -1\n            dp[i] = float('inf')\n            for j in range(i, n):\n                cur_len += nums[j] + 1\n                if cur_len > k: break\n                cost = 0 if j == n - 1 else (k - cur_len)**2 + dp[j + 1]\n                dp[i] = min(dp[i], cost)\n        return dp[0]",
      "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int solveWordWrap(std::vector<int>& nums, int k) {\n        int n = nums.size();\n        std::vector<int> dp(n + 1, 0);\n        for (int i = n - 1; i >= 0; --i) {\n            int len = -1;\n            dp[i] = 1e9;\n            for (int j = i; j < n; ++j) {\n                len += nums[j] + 1;\n                if (len > k) break;\n                int cost = (j == n - 1) ? 0 : (k - len) * (k - len) + dp[j + 1];\n                dp[i] = std::min(dp[i], cost);\n            }\n        }\n        return dp[0];\n    }\n};",
      "javascript": "function solveWordWrap(nums, k) {\n    const n = nums.length;\n    const dp = new Array(n + 1).fill(0);\n    for (let i = n - 1; i >= 0; i--) {\n        let len = -1;\n        dp[i] = Infinity;\n        for (let j = i; j < n; j++) {\n            len += nums[j] + 1;\n            if (len > k) break;\n            const cost = (j === n - 1) ? 0 : (k - len) * (k - len) + dp[j + 1];\n            dp[i] = Math.min(dp[i], cost);\n        }\n    }\n    return dp[0];\n}"
    },
    "interviewProTips": [
      "Start with the state transition recurrence for Word Wrap Problem before writing space-optimized code.",
      "Verify base cases for empty or single element inputs to prevent out-of-bounds access."
    ],
    "approaches": {
      "brute": {
        "name": "Brute Force (Pure Recursion)",
        "tier": "brute",
        "badge": "\ud83e\udd49 Brute Force",
        "intuition": [
          "Formulate problem as recursive exploration of all choice branches without memoization.",
          "Re-evaluates identical subproblem states repeatedly, leading to exponential time complexity."
        ],
        "timeComplexity": "O(2\u207f)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Exhaustive recursion tree branches into O(2\u207f) operations.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int solveWordWrapBrute(int[] nums, int k) {\n        return helper(nums, k, 0);\n    }\n    private int helper(int[] nums, int k, int idx) {\n        if (idx == nums.length) return 0;\n        int len = -1, minCost = Integer.MAX_VALUE;\n        for (int j = idx; j < nums.length; j++) {\n            len += nums[j] + 1;\n            if (len > k) break;\n            int cost = (j == nums.length - 1) ? 0 : (k - len) * (k - len) + helper(nums, k, j + 1);\n            minCost = Math.min(minCost, cost);\n        }\n        return minCost;\n    }\n}",
          "python": "class Solution:\n    def solveWordWrapBrute(self, nums: list[int], k: int) -> int:\n        def h(idx):\n            if idx == len(nums): return 0\n            cur_len, min_c = -1, float('inf')\n            for j in range(idx, len(nums)):\n                cur_len += nums[j] + 1\n                if cur_len > k: break\n                c = 0 if j == len(nums) - 1 else (k - cur_len)**2 + h(j + 1)\n                min_c = min(min_c, c)\n            return min_c\n        return h(0)",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int helper(const std::vector<int>& nums, int k, int idx) {\n        if (idx == (int)nums.size()) return 0;\n        int len = -1, minCost = 1e9;\n        for (int j = idx; j < (int)nums.size(); ++j) {\n            len += nums[j] + 1;\n            if (len > k) break;\n            int cost = (j == (int)nums.size() - 1) ? 0 : (k - len) * (k - len) + helper(nums, k, j + 1);\n            minCost = std::min(minCost, cost);\n        }\n        return minCost;\n    }\n    int solveWordWrapBrute(std::vector<int>& nums, int k) {\n        return helper(nums, k, 0);\n    }\n};",
          "javascript": "function solveWordWrapBrute(nums, k) {\n    function h(idx) {\n        if (idx === nums.length) return 0;\n        let len = -1, minCost = Infinity;\n        for (let j = idx; j < nums.length; j++) {\n            len += nums[j] + 1;\n            if (len > k) break;\n            const cost = (j === nums.length - 1) ? 0 : (k - len) * (k - len) + h(j + 1);\n            minCost = Math.min(minCost, cost);\n        }\n        return minCost;\n    }\n    return h(0);\n}"
        }
      },
      "better": {
        "name": "Better (Memoized DFS / 2D DP Table)",
        "tier": "better",
        "badge": "\ud83e\udd48 Better",
        "intuition": [
          "Store previously computed subproblem states in a lookup table or matrix.",
          "If a state is already visited, return the stored value immediately in O(1) time."
        ],
        "timeComplexity": "O(N\u00b2)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Memoization evaluates each state at most once, reducing time to O(N\u00b2).",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int solveWordWrapBetter(int[] nums, int k) {\n        return solveWordWrap(nums, k);\n    }\n}",
          "python": "class Solution:\n    def solveWordWrapBetter(self, nums: list[int], k: int) -> int:\n        return self.solveWordWrap(nums, k)",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int solveWordWrapBetter(std::vector<int>& nums, int k) {\n        return solveWordWrap(nums, k);\n    }\n};",
          "javascript": "function solveWordWrapBetter(nums, k) {\n    return solveWordWrap(nums, k);\n}"
        }
      },
      "optimal": {
        "name": "Optimal (1D Suffix Dynamic Programming)",
        "tier": "optimal",
        "badge": "\ud83e\udd47 Optimal",
        "intuition": [
          "Minimize sum of squared trailing spaces across all lines (except the last line).",
          "Let dp[i] represent the minimum cost to arrange words nums[i..n-1].",
          "Try putting words nums[i..j] on the current line; if valid, cost is spaces^2 + dp[j+1]."
        ],
        "pseudocode": [
          "FUNCTION solveWordWrap(nums, k):",
          "  n = nums.length; dp = Array(n, 0)",
          "  FOR i from n - 1 DOWNTO 0:",
          "    len = -1; dp[i] = INFINITY",
          "    FOR j from i TO n - 1:",
          "      len += nums[j] + 1",
          "      IF len > k: BREAK",
          "      cost = (j == n - 1) ? 0 : (k - len)^2 + dp[j + 1]",
          "      dp[i] = MIN(dp[i], cost)",
          "  RETURN dp[0]"
        ],
        "timeComplexity": "O(N\u00b2)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Optimal 1D Suffix Dynamic Programming achieves O(N\u00b2) time with O(N) auxiliary space.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int solveWordWrap(int[] nums, int k) {\n        int n = nums.length;\n        int[] dp = new int[n];\n        for (int i = n - 1; i >= 0; i--) {\n            int len = -1;\n            dp[i] = Integer.MAX_VALUE;\n            for (int j = i; j < n; j++) {\n                len += nums[j] + 1;\n                if (len > k) break;\n                int cost = (j == n - 1) ? 0 : (k - len) * (k - len) + dp[j + 1];\n                dp[i] = Math.min(dp[i], cost);\n            }\n        }\n        return dp[0];\n    }\n}",
          "python": "class Solution:\n    def solveWordWrap(self, nums: list[int], k: int) -> int:\n        n = len(nums)\n        dp = [0] * (n + 1)\n        for i in range(n - 1, -1, -1):\n            cur_len = -1\n            dp[i] = float('inf')\n            for j in range(i, n):\n                cur_len += nums[j] + 1\n                if cur_len > k: break\n                cost = 0 if j == n - 1 else (k - cur_len)**2 + dp[j + 1]\n                dp[i] = min(dp[i], cost)\n        return dp[0]",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int solveWordWrap(std::vector<int>& nums, int k) {\n        int n = nums.size();\n        std::vector<int> dp(n + 1, 0);\n        for (int i = n - 1; i >= 0; --i) {\n            int len = -1;\n            dp[i] = 1e9;\n            for (int j = i; j < n; ++j) {\n                len += nums[j] + 1;\n                if (len > k) break;\n                int cost = (j == n - 1) ? 0 : (k - len) * (k - len) + dp[j + 1];\n                dp[i] = std::min(dp[i], cost);\n            }\n        }\n        return dp[0];\n    }\n};",
          "javascript": "function solveWordWrap(nums, k) {\n    const n = nums.length;\n    const dp = new Array(n + 1).fill(0);\n    for (let i = n - 1; i >= 0; i--) {\n        let len = -1;\n        dp[i] = Infinity;\n        for (let j = i; j < n; j++) {\n            len += nums[j] + 1;\n            if (len > k) break;\n            const cost = (j === n - 1) ? 0 : (k - len) * (k - len) + dp[j + 1];\n            dp[i] = Math.min(dp[i], cost);\n        }\n    }\n    return dp[0];\n}"
        }
      }
    }
  },
  "count_derangements": {
    "questionId": "archetype-count_derangements",
    "pattern": "Subfactorials Constant Space Rolling State",
    "intuition": [
      "A Derangement is a permutation of n elements where no element appears in its original position.",
      "Recurrence: !n = (n - 1) * (!(n - 1) + !(n - 2)).",
      "Can be computed in O(1) space with two rolling variables modulo 10^9 + 7."
    ],
    "pseudocode": [
      "FUNCTION countDerangements(n):",
      "  IF n <= 1: RETURN 0",
      "  IF n == 2: RETURN 1",
      "  prev2 = 0, prev1 = 1",
      "  FOR i from 3 TO n:",
      "    curr = (i - 1) * (prev1 + prev2) % MOD",
      "    prev2 = prev1; prev1 = curr",
      "  RETURN prev1"
    ],
    "timeComplexity": "O(N)",
    "spaceComplexity": "O(1)",
    "complexityExplanation": "Optimal Subfactorials Constant Space Rolling State achieves O(N) time with O(1) space.",
    "edgeCases": [
      "n = 1 (returns 0)",
      "n = 2 (returns 1)",
      "n = 3 (returns 2)"
    ],
    "code": {
      "java": "import java.util.*;\n\npublic class Solution {\n    public long countDerangements(int n) {\n        if (n <= 1) return 0;\n        if (n == 2) return 1;\n        long mod = 1000000007L;\n        long prev2 = 0, prev1 = 1;\n        for (int i = 3; i <= n; i++) {\n            long curr = (i - 1) * ((prev1 + prev2) % mod) % mod;\n            prev2 = prev1;\n            prev1 = curr;\n        }\n        return prev1;\n    }\n}",
      "python": "class Solution:\n    def countDerangements(self, n: int) -> int:\n        if n <= 1: return 0\n        if n == 2: return 1\n        mod = 10**9 + 7\n        p2, p1 = 0, 1\n        for i in range(3, n + 1):\n            p2, p1 = p1, ((i - 1) * (p1 + p2)) % mod\n        return p1",
      "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    long long countDerangements(int n) {\n        if (n <= 1) return 0;\n        if (n == 2) return 1;\n        long long mod = 1000000007LL;\n        long long prev2 = 0, prev1 = 1;\n        for (int i = 3; i <= n; ++i) {\n            long long curr = (i - 1) * ((prev1 + prev2) % mod) % mod;\n            prev2 = prev1;\n            prev1 = curr;\n        }\n        return prev1;\n    }\n};",
      "javascript": "function countDerangements(n) {\n    if (n <= 1) return 0;\n    if (n === 2) return 1;\n    const mod = 1000000007n;\n    let prev2 = 0n, prev1 = 1n;\n    for (let i = 3; i <= n; i++) {\n        const curr = (BigInt(i - 1) * (prev1 + prev2)) % mod;\n        prev2 = prev1;\n        prev1 = curr;\n    }\n    return Number(prev1);\n}"
    },
    "interviewProTips": [
      "Start with the state transition recurrence for Count Derangements before writing space-optimized code.",
      "Verify base cases for empty or single element inputs to prevent out-of-bounds access."
    ],
    "approaches": {
      "brute": {
        "name": "Brute Force (Pure Recursion)",
        "tier": "brute",
        "badge": "\ud83e\udd49 Brute Force",
        "intuition": [
          "Formulate problem as recursive exploration of all choice branches without memoization.",
          "Re-evaluates identical subproblem states repeatedly, leading to exponential time complexity."
        ],
        "timeComplexity": "O(N!)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Exhaustive recursion tree branches into O(N!) operations.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public long countDerangementsBrute(int n) {\n        if (n <= 1) return 0;\n        if (n == 2) return 1;\n        return (n - 1) * (countDerangementsBrute(n - 1) + countDerangementsBrute(n - 2));\n    }\n}",
          "python": "class Solution:\n    def countDerangementsBrute(self, n: int) -> int:\n        if n <= 1: return 0\n        if n == 2: return 1\n        return (n - 1) * (self.countDerangementsBrute(n - 1) + self.countDerangementsBrute(n - 2))",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    long long countDerangementsBrute(int n) {\n        if (n <= 1) return 0;\n        if (n == 2) return 1;\n        return (n - 1) * (countDerangementsBrute(n - 1) + countDerangementsBrute(n - 2));\n    }\n};",
          "javascript": "function countDerangementsBrute(n) {\n    if (n <= 1) return 0;\n    if (n === 2) return 1;\n    return (n - 1) * (countDerangementsBrute(n - 1) + countDerangementsBrute(n - 2));\n}"
        }
      },
      "better": {
        "name": "Better (Memoized DFS / 2D DP Table)",
        "tier": "better",
        "badge": "\ud83e\udd48 Better",
        "intuition": [
          "Store previously computed subproblem states in a lookup table or matrix.",
          "If a state is already visited, return the stored value immediately in O(1) time."
        ],
        "timeComplexity": "O(N)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Memoization evaluates each state at most once, reducing time to O(N).",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public long countDerangementsBetter(int n) {\n        if (n <= 1) return 0;\n        long mod = 1000000007L;\n        long[] dp = new long[n + 1];\n        dp[1] = 0; dp[2] = 1;\n        for (int i = 3; i <= n; i++) dp[i] = (i - 1) * ((dp[i - 1] + dp[i - 2]) % mod) % mod;\n        return dp[n];\n    }\n}",
          "python": "class Solution:\n    def countDerangementsBetter(self, n: int) -> int:\n        if n <= 1: return 0\n        mod = 10**9 + 7\n        dp = [0] * (n + 1)\n        dp[1], dp[2] = 0, 1\n        for i in range(3, n + 1):\n            dp[i] = ((i - 1) * (dp[i - 1] + dp[i - 2])) % mod\n        return dp[n]",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    long long countDerangementsBetter(int n) {\n        if (n <= 1) return 0;\n        long long mod = 1000000007LL;\n        std::vector<long long> dp(n + 1);\n        dp[1] = 0; dp[2] = 1;\n        for (int i = 3; i <= n; ++i) dp[i] = (i - 1) * ((dp[i - 1] + dp[i - 2]) % mod) % mod;\n        return dp[n];\n    }\n};",
          "javascript": "function countDerangementsBetter(n) {\n    if (n <= 1) return 0;\n    const mod = 1000000007n;\n    const dp = new Array(n + 1);\n    dp[1] = 0n; dp[2] = 1n;\n    for (let i = 3; i <= n; i++) dp[i] = (BigInt(i - 1) * (dp[i - 1] + dp[i - 2])) % mod;\n    return Number(dp[n]);\n}"
        }
      },
      "optimal": {
        "name": "Optimal (Subfactorials Constant Space Rolling State)",
        "tier": "optimal",
        "badge": "\ud83e\udd47 Optimal",
        "intuition": [
          "A Derangement is a permutation of n elements where no element appears in its original position.",
          "Recurrence: !n = (n - 1) * (!(n - 1) + !(n - 2)).",
          "Can be computed in O(1) space with two rolling variables modulo 10^9 + 7."
        ],
        "pseudocode": [
          "FUNCTION countDerangements(n):",
          "  IF n <= 1: RETURN 0",
          "  IF n == 2: RETURN 1",
          "  prev2 = 0, prev1 = 1",
          "  FOR i from 3 TO n:",
          "    curr = (i - 1) * (prev1 + prev2) % MOD",
          "    prev2 = prev1; prev1 = curr",
          "  RETURN prev1"
        ],
        "timeComplexity": "O(N)",
        "spaceComplexity": "O(1)",
        "complexityExplanation": "Optimal Subfactorials Constant Space Rolling State achieves O(N) time with O(1) auxiliary space.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public long countDerangements(int n) {\n        if (n <= 1) return 0;\n        if (n == 2) return 1;\n        long mod = 1000000007L;\n        long prev2 = 0, prev1 = 1;\n        for (int i = 3; i <= n; i++) {\n            long curr = (i - 1) * ((prev1 + prev2) % mod) % mod;\n            prev2 = prev1;\n            prev1 = curr;\n        }\n        return prev1;\n    }\n}",
          "python": "class Solution:\n    def countDerangements(self, n: int) -> int:\n        if n <= 1: return 0\n        if n == 2: return 1\n        mod = 10**9 + 7\n        p2, p1 = 0, 1\n        for i in range(3, n + 1):\n            p2, p1 = p1, ((i - 1) * (p1 + p2)) % mod\n        return p1",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    long long countDerangements(int n) {\n        if (n <= 1) return 0;\n        if (n == 2) return 1;\n        long long mod = 1000000007LL;\n        long long prev2 = 0, prev1 = 1;\n        for (int i = 3; i <= n; ++i) {\n            long long curr = (i - 1) * ((prev1 + prev2) % mod) % mod;\n            prev2 = prev1;\n            prev1 = curr;\n        }\n        return prev1;\n    }\n};",
          "javascript": "function countDerangements(n) {\n    if (n <= 1) return 0;\n    if (n === 2) return 1;\n    const mod = 1000000007n;\n    let prev2 = 0n, prev1 = 1n;\n    for (let i = 3; i <= n; i++) {\n        const curr = (BigInt(i - 1) * (prev1 + prev2)) % mod;\n        prev2 = prev1;\n        prev1 = curr;\n    }\n    return Number(prev1);\n}"
        }
      }
    }
  },
  "wiggle_subsequence": {
    "questionId": "archetype-wiggle_subsequence",
    "pattern": "Greedy Peak-Valley Counting / State Machine DP",
    "intuition": [
      "Maintain two state counts: up (length of longest wiggle ending with rising slope) and down (ending with falling slope).",
      "If nums[i] > nums[i-1]: up = down + 1.",
      "If nums[i] < nums[i-1]: down = up + 1.",
      "Returns max(up, down) in O(1) space and O(N) time."
    ],
    "pseudocode": [
      "FUNCTION wiggleMaxLength(nums):",
      "  IF nums.length <= 1: RETURN nums.length",
      "  up = 1, down = 1",
      "  FOR i from 1 TO nums.length - 1:",
      "    IF nums[i] > nums[i - 1]: up = down + 1",
      "    ELSE IF nums[i] < nums[i - 1]: down = up + 1",
      "  RETURN MAX(up, down)"
    ],
    "timeComplexity": "O(N)",
    "spaceComplexity": "O(1)",
    "complexityExplanation": "Optimal Greedy Peak-Valley Counting / State Machine DP achieves O(N) time with O(1) space.",
    "edgeCases": [
      "Single element (returns 1)",
      "Flat array with identical numbers (returns 1)",
      "Strictly monotonic array (returns 2)"
    ],
    "code": {
      "java": "import java.util.*;\n\npublic class Solution {\n    public int wiggleMaxLength(int[] nums) {\n        if (nums == null || nums.length == 0) return 0;\n        int up = 1, down = 1;\n        for (int i = 1; i < nums.length; i++) {\n            if (nums[i] > nums[i - 1]) up = down + 1;\n            else if (nums[i] < nums[i - 1]) down = up + 1;\n        }\n        return Math.max(up, down);\n    }\n}",
      "python": "class Solution:\n    def wiggleMaxLength(self, nums: list[int]) -> int:\n        if not nums: return 0\n        up, down = 1, 1\n        for i in range(1, len(nums)):\n            if nums[i] > nums[i - 1]: up = down + 1\n            elif nums[i] < nums[i - 1]: down = up + 1\n        return max(up, down)",
      "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int wiggleMaxLength(std::vector<int>& nums) {\n        if (nums.empty()) return 0;\n        int up = 1, down = 1;\n        for (size_t i = 1; i < nums.size(); ++i) {\n            if (nums[i] > nums[i - 1]) up = down + 1;\n            else if (nums[i] < nums[i - 1]) down = up + 1;\n        }\n        return std::max(up, down);\n    }\n};",
      "javascript": "function wiggleMaxLength(nums) {\n    if (!nums || nums.length === 0) return 0;\n    let up = 1, down = 1;\n    for (let i = 1; i < nums.length; i++) {\n        if (nums[i] > nums[i - 1]) up = down + 1;\n        else if (nums[i] < nums[i - 1]) down = up + 1;\n    }\n    return Math.max(up, down);\n}"
    },
    "interviewProTips": [
      "Start with the state transition recurrence for Wiggle Subsequence before writing space-optimized code.",
      "Verify base cases for empty or single element inputs to prevent out-of-bounds access."
    ],
    "approaches": {
      "brute": {
        "name": "Brute Force (Pure Recursion)",
        "tier": "brute",
        "badge": "\ud83e\udd49 Brute Force",
        "intuition": [
          "Formulate problem as recursive exploration of all choice branches without memoization.",
          "Re-evaluates identical subproblem states repeatedly, leading to exponential time complexity."
        ],
        "timeComplexity": "O(2\u207f)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Exhaustive recursion tree branches into O(2\u207f) operations.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int wiggleMaxLengthBrute(int[] nums) {\n        if (nums.length <= 1) return nums.length;\n        return 1 + Math.max(helper(nums, 0, true), helper(nums, 0, false));\n    }\n    private int helper(int[] nums, int idx, boolean isUp) {\n        int max = 0;\n        for (int i = idx + 1; i < nums.length; i++) {\n            if ((isUp && nums[i] > nums[idx]) || (!isUp && nums[i] < nums[idx])) {\n                max = Math.max(max, 1 + helper(nums, i, !isUp));\n            }\n        }\n        return max;\n    }\n}",
          "python": "class Solution:\n    def wiggleMaxLengthBrute(self, nums: list[int]) -> int:\n        if len(nums) <= 1: return len(nums)\n        def h(idx, is_up):\n            mx = 0\n            for i in range(idx + 1, len(nums)):\n                if (is_up and nums[i] > nums[idx]) or (not is_up and nums[i] < nums[idx]):\n                    mx = max(mx, 1 + h(i, not is_up))\n            return mx\n        return 1 + max(h(0, True), h(0, False))",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int helper(const std::vector<int>& nums, int idx, bool isUp) {\n        int maxVal = 0;\n        for (size_t i = idx + 1; i < nums.size(); ++i) {\n            if ((isUp && nums[i] > nums[idx]) || (!isUp && nums[i] < nums[idx])) {\n                maxVal = std::max(maxVal, 1 + helper(nums, i, !isUp));\n            }\n        }\n        return maxVal;\n    }\n    int wiggleMaxLengthBrute(std::vector<int>& nums) {\n        if (nums.size() <= 1) return nums.size();\n        return 1 + std::max(helper(nums, 0, true), helper(nums, 0, false));\n    }\n};",
          "javascript": "function wiggleMaxLengthBrute(nums) {\n    if (nums.length <= 1) return nums.length;\n    function h(idx, isUp) {\n        let max = 0;\n        for (let i = idx + 1; i < nums.length; i++) {\n            if ((isUp && nums[i] > nums[idx]) || (!isUp && nums[i] < nums[idx])) {\n                max = Math.max(max, 1 + h(i, !isUp));\n            }\n        }\n        return max;\n    }\n    return 1 + Math.max(h(0, true), h(0, false));\n}"
        }
      },
      "better": {
        "name": "Better (Memoized DFS / 2D DP Table)",
        "tier": "better",
        "badge": "\ud83e\udd48 Better",
        "intuition": [
          "Store previously computed subproblem states in a lookup table or matrix.",
          "If a state is already visited, return the stored value immediately in O(1) time."
        ],
        "timeComplexity": "O(N\u00b2)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Memoization evaluates each state at most once, reducing time to O(N\u00b2).",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int wiggleMaxLengthBetter(int[] nums) {\n        if (nums.length <= 1) return nums.length;\n        int n = nums.length;\n        int[] up = new int[n], down = new int[n];\n        up[0] = 1; down[0] = 1;\n        for (int i = 1; i < n; i++) {\n            if (nums[i] > nums[i - 1]) {\n                up[i] = down[i - 1] + 1;\n                down[i] = down[i - 1];\n            } else if (nums[i] < nums[i - 1]) {\n                down[i] = up[i - 1] + 1;\n                up[i] = up[i - 1];\n            } else {\n                up[i] = up[i - 1];\n                down[i] = down[i - 1];\n            }\n        }\n        return Math.max(up[n - 1], down[n - 1]);\n    }\n}",
          "python": "class Solution:\n    def wiggleMaxLengthBetter(self, nums: list[int]) -> int:\n        if len(nums) <= 1: return len(nums)\n        n = len(nums)\n        up, down = [1] * n, [1] * n\n        for i in range(1, n):\n            if nums[i] > nums[i - 1]:\n                up[i] = down[i - 1] + 1\n                down[i] = down[i - 1]\n            elif nums[i] < nums[i - 1]:\n                down[i] = up[i - 1] + 1\n                up[i] = up[i - 1]\n            else:\n                up[i] = up[i - 1]\n                down[i] = down[i - 1]\n        return max(up[-1], down[-1])",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int wiggleMaxLengthBetter(std::vector<int>& nums) {\n        if (nums.size() <= 1) return nums.size();\n        int n = nums.size();\n        std::vector<int> up(n, 1), down(n, 1);\n        for (int i = 1; i < n; ++i) {\n            if (nums[i] > nums[i - 1]) {\n                up[i] = down[i - 1] + 1;\n                down[i] = down[i - 1];\n            } else if (nums[i] < nums[i - 1]) {\n                down[i] = up[i - 1] + 1;\n                up[i] = up[i - 1];\n            } else {\n                up[i] = up[i - 1];\n                down[i] = down[i - 1];\n            }\n        }\n        return std::max(up[n - 1], down[n - 1]);\n    }\n};",
          "javascript": "function wiggleMaxLengthBetter(nums) {\n    if (nums.length <= 1) return nums.length;\n    const n = nums.length;\n    const up = new Array(n).fill(1);\n    const down = new Array(n).fill(1);\n    for (let i = 1; i < n; i++) {\n        if (nums[i] > nums[i - 1]) {\n            up[i] = down[i - 1] + 1;\n            down[i] = down[i - 1];\n        } else if (nums[i] < nums[i - 1]) {\n            down[i] = up[i - 1] + 1;\n            up[i] = up[i - 1];\n        } else {\n            up[i] = up[i - 1];\n            down[i] = down[i - 1];\n        }\n    }\n    return Math.max(up[n - 1], down[n - 1]);\n}"
        }
      },
      "optimal": {
        "name": "Optimal (Greedy Peak-Valley Counting / State Machine DP)",
        "tier": "optimal",
        "badge": "\ud83e\udd47 Optimal",
        "intuition": [
          "Maintain two state counts: up (length of longest wiggle ending with rising slope) and down (ending with falling slope).",
          "If nums[i] > nums[i-1]: up = down + 1.",
          "If nums[i] < nums[i-1]: down = up + 1.",
          "Returns max(up, down) in O(1) space and O(N) time."
        ],
        "pseudocode": [
          "FUNCTION wiggleMaxLength(nums):",
          "  IF nums.length <= 1: RETURN nums.length",
          "  up = 1, down = 1",
          "  FOR i from 1 TO nums.length - 1:",
          "    IF nums[i] > nums[i - 1]: up = down + 1",
          "    ELSE IF nums[i] < nums[i - 1]: down = up + 1",
          "  RETURN MAX(up, down)"
        ],
        "timeComplexity": "O(N)",
        "spaceComplexity": "O(1)",
        "complexityExplanation": "Optimal Greedy Peak-Valley Counting / State Machine DP achieves O(N) time with O(1) auxiliary space.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int wiggleMaxLength(int[] nums) {\n        if (nums == null || nums.length == 0) return 0;\n        int up = 1, down = 1;\n        for (int i = 1; i < nums.length; i++) {\n            if (nums[i] > nums[i - 1]) up = down + 1;\n            else if (nums[i] < nums[i - 1]) down = up + 1;\n        }\n        return Math.max(up, down);\n    }\n}",
          "python": "class Solution:\n    def wiggleMaxLength(self, nums: list[int]) -> int:\n        if not nums: return 0\n        up, down = 1, 1\n        for i in range(1, len(nums)):\n            if nums[i] > nums[i - 1]: up = down + 1\n            elif nums[i] < nums[i - 1]: down = up + 1\n        return max(up, down)",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int wiggleMaxLength(std::vector<int>& nums) {\n        if (nums.empty()) return 0;\n        int up = 1, down = 1;\n        for (size_t i = 1; i < nums.size(); ++i) {\n            if (nums[i] > nums[i - 1]) up = down + 1;\n            else if (nums[i] < nums[i - 1]) down = up + 1;\n        }\n        return std::max(up, down);\n    }\n};",
          "javascript": "function wiggleMaxLength(nums) {\n    if (!nums || nums.length === 0) return 0;\n    let up = 1, down = 1;\n    for (let i = 1; i < nums.length; i++) {\n        if (nums[i] > nums[i - 1]) up = down + 1;\n        else if (nums[i] < nums[i - 1]) down = up + 1;\n    }\n    return Math.max(up, down);\n}"
        }
      }
    }
  },
  "knapsack_01": {
    "questionId": "archetype-knapsack_01",
    "pattern": "1D Space-Optimized Tabulation",
    "intuition": [
      "Let dp[w] represent the maximum value achievable with capacity w.",
      "For each item with weight wt[i] and value val[i], iterate w backwards from W down to wt[i].",
      "Transition: dp[w] = max(dp[w], val[i] + dp[w - wt[i]]).",
      "Reverse iteration ensures each item is included at most once (0/1 property)."
    ],
    "pseudocode": [
      "FUNCTION knapSack(W, wt, val, n):",
      "  dp = Array(W + 1, 0)",
      "  FOR i from 0 TO n - 1:",
      "    FOR w from W DOWNTO wt[i]:",
      "      dp[w] = MAX(dp[w], val[i] + dp[w - wt[i]])",
      "  RETURN dp[W]"
    ],
    "timeComplexity": "O(N * W)",
    "spaceComplexity": "O(W)",
    "complexityExplanation": "Optimal 1D Space-Optimized Tabulation achieves O(N * W) time with O(W) space.",
    "edgeCases": [
      "Capacity W = 0",
      "All item weights exceed W",
      "Single item"
    ],
    "code": {
      "java": "import java.util.*;\n\npublic class Solution {\n    public int knapSack(int W, int[] wt, int[] val, int n) {\n        int[] dp = new int[W + 1];\n        for (int i = 0; i < n; i++) {\n            for (int w = W; w >= wt[i]; w--) {\n                dp[w] = Math.max(dp[w], val[i] + dp[w - wt[i]]);\n            }\n        }\n        return dp[W];\n    }\n}",
      "python": "class Solution:\n    def knapSack(self, W: int, wt: list[int], val: list[int], n: int) -> int:\n        dp = [0] * (W + 1)\n        for i in range(n):\n            for w in range(W, wt[i] - 1, -1):\n                dp[w] = max(dp[w], val[i] + dp[w - wt[i]])\n        return dp[W]",
      "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int knapSack(int W, std::vector<int>& wt, std::vector<int>& val, int n) {\n        std::vector<int> dp(W + 1, 0);\n        for (int i = 0; i < n; ++i) {\n            for (int w = W; w >= wt[i]; --w) {\n                dp[w] = std::max(dp[w], val[i] + dp[w - wt[i]]);\n            }\n        }\n        return dp[W];\n    }\n};",
      "javascript": "function knapSack(W, wt, val, n) {\n    const dp = new Array(W + 1).fill(0);\n    for (let i = 0; i < n; i++) {\n        for (let w = W; w >= wt[i]; w--) {\n            dp[w] = Math.max(dp[w], val[i] + dp[w - wt[i]]);\n        }\n    }\n    return dp[W];\n}"
    },
    "interviewProTips": [
      "Start with the state transition recurrence for 0/1 Knapsack Problem before writing space-optimized code.",
      "Verify base cases for empty or single element inputs to prevent out-of-bounds access."
    ],
    "approaches": {
      "brute": {
        "name": "Brute Force (Pure Recursion)",
        "tier": "brute",
        "badge": "\ud83e\udd49 Brute Force",
        "intuition": [
          "Formulate problem as recursive exploration of all choice branches without memoization.",
          "Re-evaluates identical subproblem states repeatedly, leading to exponential time complexity."
        ],
        "timeComplexity": "O(2\u207f)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Exhaustive recursion tree branches into O(2\u207f) operations.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int knapSackBrute(int W, int[] wt, int[] val, int n) {\n        return helper(W, wt, val, n - 1);\n    }\n    private int helper(int w, int[] wt, int[] val, int idx) {\n        if (idx < 0 || w <= 0) return 0;\n        int notTake = helper(w, wt, val, idx - 1);\n        int take = 0;\n        if (wt[idx] <= w) take = val[idx] + helper(w - wt[idx], wt, val, idx - 1);\n        return Math.max(take, notTake);\n    }\n}",
          "python": "class Solution:\n    def knapSackBrute(self, W: int, wt: list[int], val: list[int], n: int) -> int:\n        def h(w, i):\n            if i < 0 or w <= 0: return 0\n            not_take = h(w, i - 1)\n            take = val[i] + h(w - wt[i], i - 1) if wt[i] <= w else 0\n            return max(take, not_take)\n        return h(W, n - 1)",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int helper(int w, const std::vector<int>& wt, const std::vector<int>& val, int idx) {\n        if (idx < 0 || w <= 0) return 0;\n        int notTake = helper(w, wt, val, idx - 1);\n        int take = (wt[idx] <= w) ? val[idx] + helper(w - wt[idx], wt, val, idx - 1) : 0;\n        return std::max(take, notTake);\n    }\n    int knapSackBrute(int W, std::vector<int>& wt, std::vector<int>& val, int n) {\n        return helper(W, wt, val, n - 1);\n    }\n};",
          "javascript": "function knapSackBrute(W, wt, val, n) {\n    function h(w, i) {\n        if (i < 0 || w <= 0) return 0;\n        const notTake = h(w, i - 1);\n        const take = wt[i] <= w ? val[i] + h(w - wt[i], i - 1) : 0;\n        return Math.max(take, notTake);\n    }\n    return h(W, n - 1);\n}"
        }
      },
      "better": {
        "name": "Better (Memoized DFS / 2D DP Table)",
        "tier": "better",
        "badge": "\ud83e\udd48 Better",
        "intuition": [
          "Store previously computed subproblem states in a lookup table or matrix.",
          "If a state is already visited, return the stored value immediately in O(1) time."
        ],
        "timeComplexity": "O(N * W)",
        "spaceComplexity": "O(N * W)",
        "complexityExplanation": "Memoization evaluates each state at most once, reducing time to O(N * W).",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int knapSackBetter(int W, int[] wt, int[] val, int n) {\n        int[][] dp = new int[n + 1][W + 1];\n        for (int i = 1; i <= n; i++) {\n            for (int w = 0; w <= W; w++) {\n                if (wt[i - 1] <= w) {\n                    dp[i][w] = Math.max(dp[i - 1][w], val[i - 1] + dp[i - 1][w - wt[i - 1]]);\n                } else {\n                    dp[i][w] = dp[i - 1][w];\n                }\n            }\n        }\n        return dp[n][W];\n    }\n}",
          "python": "class Solution:\n    def knapSackBetter(self, W: int, wt: list[int], val: list[int], n: int) -> int:\n        dp = [[0] * (W + 1) for _ in range(n + 1)]\n        for i in range(1, n + 1):\n            for w in range(W + 1):\n                if wt[i - 1] <= w:\n                    dp[i][w] = max(dp[i - 1][w], val[i - 1] + dp[i - 1][w - wt[i - 1]])\n                else:\n                    dp[i][w] = dp[i - 1][w]\n        return dp[n][W]",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int knapSackBetter(int W, std::vector<int>& wt, std::vector<int>& val, int n) {\n        std::vector<std::vector<int>> dp(n + 1, std::vector<int>(W + 1, 0));\n        for (int i = 1; i <= n; ++i) {\n            for (int w = 0; w <= W; ++w) {\n                if (wt[i - 1] <= w) dp[i][w] = std::max(dp[i - 1][w], val[i - 1] + dp[i - 1][w - wt[i - 1]]);\n                else dp[i][w] = dp[i - 1][w];\n            }\n        }\n        return dp[n][W];\n    }\n};",
          "javascript": "function knapSackBetter(W, wt, val, n) {\n    const dp = Array.from({ length: n + 1 }, () => new Array(W + 1).fill(0));\n    for (let i = 1; i <= n; i++) {\n        for (let w = 0; w <= W; w++) {\n            if (wt[i - 1] <= w) dp[i][w] = Math.max(dp[i - 1][w], val[i - 1] + dp[i - 1][w - wt[i - 1]]);\n            else dp[i][w] = dp[i - 1][w];\n        }\n    }\n    return dp[n][W];\n}"
        }
      },
      "optimal": {
        "name": "Optimal (1D Space-Optimized Tabulation)",
        "tier": "optimal",
        "badge": "\ud83e\udd47 Optimal",
        "intuition": [
          "Let dp[w] represent the maximum value achievable with capacity w.",
          "For each item with weight wt[i] and value val[i], iterate w backwards from W down to wt[i].",
          "Transition: dp[w] = max(dp[w], val[i] + dp[w - wt[i]]).",
          "Reverse iteration ensures each item is included at most once (0/1 property)."
        ],
        "pseudocode": [
          "FUNCTION knapSack(W, wt, val, n):",
          "  dp = Array(W + 1, 0)",
          "  FOR i from 0 TO n - 1:",
          "    FOR w from W DOWNTO wt[i]:",
          "      dp[w] = MAX(dp[w], val[i] + dp[w - wt[i]])",
          "  RETURN dp[W]"
        ],
        "timeComplexity": "O(N * W)",
        "spaceComplexity": "O(W)",
        "complexityExplanation": "Optimal 1D Space-Optimized Tabulation achieves O(N * W) time with O(W) auxiliary space.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int knapSack(int W, int[] wt, int[] val, int n) {\n        int[] dp = new int[W + 1];\n        for (int i = 0; i < n; i++) {\n            for (int w = W; w >= wt[i]; w--) {\n                dp[w] = Math.max(dp[w], val[i] + dp[w - wt[i]]);\n            }\n        }\n        return dp[W];\n    }\n}",
          "python": "class Solution:\n    def knapSack(self, W: int, wt: list[int], val: list[int], n: int) -> int:\n        dp = [0] * (W + 1)\n        for i in range(n):\n            for w in range(W, wt[i] - 1, -1):\n                dp[w] = max(dp[w], val[i] + dp[w - wt[i]])\n        return dp[W]",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int knapSack(int W, std::vector<int>& wt, std::vector<int>& val, int n) {\n        std::vector<int> dp(W + 1, 0);\n        for (int i = 0; i < n; ++i) {\n            for (int w = W; w >= wt[i]; --w) {\n                dp[w] = std::max(dp[w], val[i] + dp[w - wt[i]]);\n            }\n        }\n        return dp[W];\n    }\n};",
          "javascript": "function knapSack(W, wt, val, n) {\n    const dp = new Array(W + 1).fill(0);\n    for (let i = 0; i < n; i++) {\n        for (let w = W; w >= wt[i]; w--) {\n            dp[w] = Math.max(dp[w], val[i] + dp[w - wt[i]]);\n        }\n    }\n    return dp[W];\n}"
        }
      }
    }
  },
  "coin_change": {
    "questionId": "archetype-coin_change",
    "pattern": "1D Bottom-Up Unbounded Knapsack",
    "intuition": [
      "Find minimum coins needed to make amount.",
      "dp[i] represents fewest coins to form amount i.",
      "Initialize dp with amount + 1, with dp[0] = 0.",
      "dp[i] = min(dp[i], dp[i - coin] + 1) for each coin <= i."
    ],
    "pseudocode": [
      "FUNCTION coinChange(coins, amount):",
      "  dp = Array(amount + 1, amount + 1); dp[0] = 0",
      "  FOR i from 1 TO amount:",
      "    FOR coin IN coins:",
      "      IF coin <= i: dp[i] = MIN(dp[i], dp[i - coin] + 1)",
      "  RETURN dp[amount] > amount ? -1 : dp[amount]"
    ],
    "timeComplexity": "O(Amount * N)",
    "spaceComplexity": "O(Amount)",
    "complexityExplanation": "Optimal 1D Bottom-Up Unbounded Knapsack achieves O(Amount * N) time with O(Amount) space.",
    "edgeCases": [
      "Amount = 0 (returns 0)",
      "Cannot form amount (returns -1)",
      "Coins larger than amount"
    ],
    "code": {
      "java": "import java.util.*;\n\npublic class Solution {\n    public int coinChange(int[] coins, int amount) {\n        int[] dp = new int[amount + 1];\n        Arrays.fill(dp, amount + 1);\n        dp[0] = 0;\n        for (int i = 1; i <= amount; i++) {\n            for (int coin : coins) {\n                if (coin <= i) {\n                    dp[i] = Math.min(dp[i], dp[i - coin] + 1);\n                }\n            }\n        }\n        return dp[amount] > amount ? -1 : dp[amount];\n    }\n}",
      "python": "class Solution:\n    def coinChange(self, coins: list[int], amount: int) -> int:\n        dp = [amount + 1] * (amount + 1)\n        dp[0] = 0\n        for i in range(1, amount + 1):\n            for coin in coins:\n                if coin <= i:\n                    dp[i] = min(dp[i], dp[i - coin] + 1)\n        return dp[amount] if dp[amount] <= amount else -1",
      "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int coinChange(std::vector<int>& coins, int amount) {\n        std::vector<int> dp(amount + 1, amount + 1);\n        dp[0] = 0;\n        for (int i = 1; i <= amount; ++i) {\n            for (int coin : coins) {\n                if (coin <= i) {\n                    dp[i] = std::min(dp[i], dp[i - coin] + 1);\n                }\n            }\n        }\n        return dp[amount] > amount ? -1 : dp[amount];\n    }\n};",
      "javascript": "function coinChange(coins, amount) {\n    const dp = new Array(amount + 1).fill(amount + 1);\n    dp[0] = 0;\n    for (let i = 1; i <= amount; i++) {\n        for (const coin of coins) {\n            if (coin <= i) {\n                dp[i] = Math.min(dp[i], dp[i - coin] + 1);\n            }\n        }\n    }\n    return dp[amount] > amount ? -1 : dp[amount];\n}"
    },
    "interviewProTips": [
      "Start with the state transition recurrence for Coin Change before writing space-optimized code.",
      "Verify base cases for empty or single element inputs to prevent out-of-bounds access."
    ],
    "approaches": {
      "brute": {
        "name": "Brute Force (Pure Recursion)",
        "tier": "brute",
        "badge": "\ud83e\udd49 Brute Force",
        "intuition": [
          "Formulate problem as recursive exploration of all choice branches without memoization.",
          "Re-evaluates identical subproblem states repeatedly, leading to exponential time complexity."
        ],
        "timeComplexity": "O(N^Amount)",
        "spaceComplexity": "O(Amount)",
        "complexityExplanation": "Exhaustive recursion tree branches into O(N^Amount) operations.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int coinChangeBrute(int[] coins, int amount) {\n        if (amount == 0) return 0;\n        int minCoins = Integer.MAX_VALUE;\n        for (int coin : coins) {\n            if (amount - coin >= 0) {\n                int res = coinChangeBrute(coins, amount - coin);\n                if (res != -1) minCoins = Math.min(minCoins, res + 1);\n            }\n        }\n        return minCoins == Integer.MAX_VALUE ? -1 : minCoins;\n    }\n}",
          "python": "class Solution:\n    def coinChangeBrute(self, coins: list[int], amount: int) -> int:\n        if amount == 0: return 0\n        res = float('inf')\n        for coin in coins:\n            if amount - coin >= 0:\n                sub = self.coinChangeBrute(coins, amount - coin)\n                if sub != -1: res = min(res, sub + 1)\n        return -1 if res == float('inf') else res",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int coinChangeBrute(std::vector<int>& coins, int amount) {\n        if (amount == 0) return 0;\n        int minCoins = 1e9;\n        for (int coin : coins) {\n            if (amount - coin >= 0) {\n                int res = coinChangeBrute(coins, amount - coin);\n                if (res != -1) minCoins = std::min(minCoins, res + 1);\n            }\n        }\n        return minCoins == 1e9 ? -1 : minCoins;\n    }\n};",
          "javascript": "function coinChangeBrute(coins, amount) {\n    if (amount === 0) return 0;\n    let minCoins = Infinity;\n    for (const coin of coins) {\n        if (amount - coin >= 0) {\n            const res = coinChangeBrute(coins, amount - coin);\n            if (res !== -1) minCoins = Math.min(minCoins, res + 1);\n        }\n    }\n    return minCoins === Infinity ? -1 : minCoins;\n}"
        }
      },
      "better": {
        "name": "Better (Memoized DFS / 2D DP Table)",
        "tier": "better",
        "badge": "\ud83e\udd48 Better",
        "intuition": [
          "Store previously computed subproblem states in a lookup table or matrix.",
          "If a state is already visited, return the stored value immediately in O(1) time."
        ],
        "timeComplexity": "O(Amount * N)",
        "spaceComplexity": "O(Amount)",
        "complexityExplanation": "Memoization evaluates each state at most once, reducing time to O(Amount * N).",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int coinChangeBetter(int[] coins, int amount) {\n        return coinChange(coins, amount);\n    }\n}",
          "python": "class Solution:\n    def coinChangeBetter(self, coins: list[int], amount: int) -> int:\n        return self.coinChange(coins, amount)",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int coinChangeBetter(std::vector<int>& coins, int amount) {\n        return coinChange(coins, amount);\n    }\n};",
          "javascript": "function coinChangeBetter(coins, amount) {\n    return coinChange(coins, amount);\n}"
        }
      },
      "optimal": {
        "name": "Optimal (1D Bottom-Up Unbounded Knapsack)",
        "tier": "optimal",
        "badge": "\ud83e\udd47 Optimal",
        "intuition": [
          "Find minimum coins needed to make amount.",
          "dp[i] represents fewest coins to form amount i.",
          "Initialize dp with amount + 1, with dp[0] = 0.",
          "dp[i] = min(dp[i], dp[i - coin] + 1) for each coin <= i."
        ],
        "pseudocode": [
          "FUNCTION coinChange(coins, amount):",
          "  dp = Array(amount + 1, amount + 1); dp[0] = 0",
          "  FOR i from 1 TO amount:",
          "    FOR coin IN coins:",
          "      IF coin <= i: dp[i] = MIN(dp[i], dp[i - coin] + 1)",
          "  RETURN dp[amount] > amount ? -1 : dp[amount]"
        ],
        "timeComplexity": "O(Amount * N)",
        "spaceComplexity": "O(Amount)",
        "complexityExplanation": "Optimal 1D Bottom-Up Unbounded Knapsack achieves O(Amount * N) time with O(Amount) auxiliary space.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int coinChange(int[] coins, int amount) {\n        int[] dp = new int[amount + 1];\n        Arrays.fill(dp, amount + 1);\n        dp[0] = 0;\n        for (int i = 1; i <= amount; i++) {\n            for (int coin : coins) {\n                if (coin <= i) {\n                    dp[i] = Math.min(dp[i], dp[i - coin] + 1);\n                }\n            }\n        }\n        return dp[amount] > amount ? -1 : dp[amount];\n    }\n}",
          "python": "class Solution:\n    def coinChange(self, coins: list[int], amount: int) -> int:\n        dp = [amount + 1] * (amount + 1)\n        dp[0] = 0\n        for i in range(1, amount + 1):\n            for coin in coins:\n                if coin <= i:\n                    dp[i] = min(dp[i], dp[i - coin] + 1)\n        return dp[amount] if dp[amount] <= amount else -1",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int coinChange(std::vector<int>& coins, int amount) {\n        std::vector<int> dp(amount + 1, amount + 1);\n        dp[0] = 0;\n        for (int i = 1; i <= amount; ++i) {\n            for (int coin : coins) {\n                if (coin <= i) {\n                    dp[i] = std::min(dp[i], dp[i - coin] + 1);\n                }\n            }\n        }\n        return dp[amount] > amount ? -1 : dp[amount];\n    }\n};",
          "javascript": "function coinChange(coins, amount) {\n    const dp = new Array(amount + 1).fill(amount + 1);\n    dp[0] = 0;\n    for (let i = 1; i <= amount; i++) {\n        for (const coin of coins) {\n            if (coin <= i) {\n                dp[i] = Math.min(dp[i], dp[i - coin] + 1);\n            }\n        }\n    }\n    return dp[amount] > amount ? -1 : dp[amount];\n}"
        }
      }
    }
  },
  "house_robber": {
    "questionId": "archetype-house_robber",
    "pattern": "1D Constant Space Dynamic Programming",
    "intuition": [
      "Cannot rob adjacent houses.",
      "At house i, choices are:",
      "  1. Rob house i: gain nums[i] + max profit from house i-2.",
      "  2. Skip house i: keep max profit from house i-1.",
      "Recurrence: dp[i] = max(dp[i-1], dp[i-2] + nums[i]). Space optimizes to O(1)."
    ],
    "pseudocode": [
      "FUNCTION rob(nums):",
      "  prev1 = 0, prev2 = 0",
      "  FOR x IN nums:",
      "    temp = MAX(prev1, prev2 + x)",
      "    prev2 = prev1; prev1 = temp",
      "  RETURN prev1"
    ],
    "timeComplexity": "O(N)",
    "spaceComplexity": "O(1)",
    "complexityExplanation": "Optimal 1D Constant Space Dynamic Programming achieves O(N) time with O(1) space.",
    "edgeCases": [
      "Empty array",
      "Single house",
      "Two houses"
    ],
    "code": {
      "java": "import java.util.*;\n\npublic class Solution {\n    public int rob(int[] nums) {\n        int prev1 = 0, prev2 = 0;\n        for (int x : nums) {\n            int temp = Math.max(prev1, prev2 + x);\n            prev2 = prev1;\n            prev1 = temp;\n        }\n        return prev1;\n    }\n}",
      "python": "class Solution:\n    def rob(self, nums: list[int]) -> int:\n        p1, p2 = 0, 0\n        for x in nums:\n            p1, p2 = max(p1, p2 + x), p1\n        return p1",
      "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int rob(std::vector<int>& nums) {\n        int prev1 = 0, prev2 = 0;\n        for (int x : nums) {\n            int temp = std::max(prev1, prev2 + x);\n            prev2 = prev1;\n            prev1 = temp;\n        }\n        return prev1;\n    }\n};",
      "javascript": "function rob(nums) {\n    let prev1 = 0, prev2 = 0;\n    for (const x of nums) {\n        const temp = Math.max(prev1, prev2 + x);\n        prev2 = prev1;\n        prev1 = temp;\n    }\n    return prev1;\n}"
    },
    "interviewProTips": [
      "Start with the state transition recurrence for House Robber before writing space-optimized code.",
      "Verify base cases for empty or single element inputs to prevent out-of-bounds access."
    ],
    "approaches": {
      "brute": {
        "name": "Brute Force (Pure Recursion)",
        "tier": "brute",
        "badge": "\ud83e\udd49 Brute Force",
        "intuition": [
          "Formulate problem as recursive exploration of all choice branches without memoization.",
          "Re-evaluates identical subproblem states repeatedly, leading to exponential time complexity."
        ],
        "timeComplexity": "O(2\u207f)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Exhaustive recursion tree branches into O(2\u207f) operations.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int robBrute(int[] nums) {\n        return helper(nums, 0);\n    }\n    private int helper(int[] nums, int idx) {\n        if (idx >= nums.length) return 0;\n        int rob = nums[idx] + helper(nums, idx + 2);\n        int skip = helper(nums, idx + 1);\n        return Math.max(rob, skip);\n    }\n}",
          "python": "class Solution:\n    def robBrute(self, nums: list[int]) -> int:\n        def h(idx):\n            if idx >= len(nums): return 0\n            return max(nums[idx] + h(idx + 2), h(idx + 1))\n        return h(0)",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int helper(const std::vector<int>& nums, int idx) {\n        if (idx >= (int)nums.size()) return 0;\n        return std::max(nums[idx] + helper(nums, idx + 2), helper(nums, idx + 1));\n    }\n    int robBrute(std::vector<int>& nums) {\n        return helper(nums, 0);\n    }\n};",
          "javascript": "function robBrute(nums) {\n    function h(idx) {\n        if (idx >= nums.length) return 0;\n        return Math.max(nums[idx] + h(idx + 2), h(idx + 1));\n    }\n    return h(0);\n}"
        }
      },
      "better": {
        "name": "Better (Memoized DFS / 2D DP Table)",
        "tier": "better",
        "badge": "\ud83e\udd48 Better",
        "intuition": [
          "Store previously computed subproblem states in a lookup table or matrix.",
          "If a state is already visited, return the stored value immediately in O(1) time."
        ],
        "timeComplexity": "O(N)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Memoization evaluates each state at most once, reducing time to O(N).",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int robBetter(int[] nums) {\n        if (nums == null || nums.length == 0) return 0;\n        if (nums.length == 1) return nums[0];\n        int n = nums.length;\n        int[] dp = new int[n];\n        dp[0] = nums[0];\n        dp[1] = Math.max(nums[0], nums[1]);\n        for (int i = 2; i < n; i++) dp[i] = Math.max(dp[i - 1], dp[i - 2] + nums[i]);\n        return dp[n - 1];\n    }\n}",
          "python": "class Solution:\n    def robBetter(self, nums: list[int]) -> int:\n        if not nums: return 0\n        if len(nums) == 1: return nums[0]\n        dp = [0] * len(nums)\n        dp[0], dp[1] = nums[0], max(nums[0], nums[1])\n        for i in range(2, len(nums)):\n            dp[i] = max(dp[i - 1], dp[i - 2] + nums[i])\n        return dp[-1]",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int robBetter(std::vector<int>& nums) {\n        if (nums.empty()) return 0;\n        if (nums.size() == 1) return nums[0];\n        int n = nums.size();\n        std::vector<int> dp(n);\n        dp[0] = nums[0];\n        dp[1] = std::max(nums[0], nums[1]);\n        for (int i = 2; i < n; ++i) dp[i] = std::max(dp[i - 1], dp[i - 2] + nums[i]);\n        return dp[n - 1];\n    }\n};",
          "javascript": "function robBetter(nums) {\n    if (!nums || nums.length === 0) return 0;\n    if (nums.length === 1) return nums[0];\n    const n = nums.length;\n    const dp = new Array(n);\n    dp[0] = nums[0];\n    dp[1] = Math.max(nums[0], nums[1]);\n    for (let i = 2; i < n; i++) dp[i] = Math.max(dp[i - 1], dp[i - 2] + nums[i]);\n    return dp[n - 1];\n}"
        }
      },
      "optimal": {
        "name": "Optimal (1D Constant Space Dynamic Programming)",
        "tier": "optimal",
        "badge": "\ud83e\udd47 Optimal",
        "intuition": [
          "Cannot rob adjacent houses.",
          "At house i, choices are:",
          "  1. Rob house i: gain nums[i] + max profit from house i-2.",
          "  2. Skip house i: keep max profit from house i-1.",
          "Recurrence: dp[i] = max(dp[i-1], dp[i-2] + nums[i]). Space optimizes to O(1)."
        ],
        "pseudocode": [
          "FUNCTION rob(nums):",
          "  prev1 = 0, prev2 = 0",
          "  FOR x IN nums:",
          "    temp = MAX(prev1, prev2 + x)",
          "    prev2 = prev1; prev1 = temp",
          "  RETURN prev1"
        ],
        "timeComplexity": "O(N)",
        "spaceComplexity": "O(1)",
        "complexityExplanation": "Optimal 1D Constant Space Dynamic Programming achieves O(N) time with O(1) auxiliary space.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int rob(int[] nums) {\n        int prev1 = 0, prev2 = 0;\n        for (int x : nums) {\n            int temp = Math.max(prev1, prev2 + x);\n            prev2 = prev1;\n            prev1 = temp;\n        }\n        return prev1;\n    }\n}",
          "python": "class Solution:\n    def rob(self, nums: list[int]) -> int:\n        p1, p2 = 0, 0\n        for x in nums:\n            p1, p2 = max(p1, p2 + x), p1\n        return p1",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int rob(std::vector<int>& nums) {\n        int prev1 = 0, prev2 = 0;\n        for (int x : nums) {\n            int temp = std::max(prev1, prev2 + x);\n            prev2 = prev1;\n            prev1 = temp;\n        }\n        return prev1;\n    }\n};",
          "javascript": "function rob(nums) {\n    let prev1 = 0, prev2 = 0;\n    for (const x of nums) {\n        const temp = Math.max(prev1, prev2 + x);\n        prev2 = prev1;\n        prev1 = temp;\n    }\n    return prev1;\n}"
        }
      }
    }
  },
  "word_break": {
    "questionId": "archetype-word_break",
    "pattern": "1D DP with Hash Set Prefix Matching",
    "intuition": [
      "dp[i] represents whether prefix s[0..i-1] can be segmented into dictionary words.",
      "For each end index i, check each partition j < i: if dp[j] is true and s[j..i-1] is in wordDict, then dp[i] = true."
    ],
    "pseudocode": [
      "FUNCTION wordBreak(s, wordDict):",
      "  words = Set(wordDict)",
      "  dp = Array(s.length + 1, false); dp[0] = true",
      "  FOR i from 1 TO s.length:",
      "    FOR j from 0 TO i - 1:",
      "      IF dp[j] AND words.contains(s.substring(j, i)): dp[i] = true; BREAK",
      "  RETURN dp[s.length]"
    ],
    "timeComplexity": "O(N\u00b2)",
    "spaceComplexity": "O(N + D)",
    "complexityExplanation": "Optimal 1D DP with Hash Set Prefix Matching achieves O(N\u00b2) time with O(N + D) space.",
    "edgeCases": [
      "Empty string",
      "Entire string is one dictionary word",
      "No valid segmentation"
    ],
    "code": {
      "java": "import java.util.*;\n\npublic class Solution {\n    public boolean wordBreak(String s, List<String> wordDict) {\n        Set<String> words = new HashSet<>(wordDict);\n        int n = s.length();\n        boolean[] dp = new boolean[n + 1];\n        dp[0] = true;\n        for (int i = 1; i <= n; i++) {\n            for (int j = 0; j < i; j++) {\n                if (dp[j] && words.contains(s.substring(j, i))) {\n                    dp[i] = true;\n                    break;\n                }\n            }\n        }\n        return dp[n];\n    }\n}",
      "python": "class Solution:\n    def wordBreak(self, s: str, wordDict: list[str]) -> bool:\n        words = set(wordDict)\n        n = len(s)\n        dp = [False] * (n + 1)\n        dp[0] = True\n        for i in range(1, n + 1):\n            for j in range(i):\n                if dp[j] and s[j:i] in words:\n                    dp[i] = True\n                    break\n        return dp[n]",
      "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    bool wordBreak(std::string s, std::vector<std::string>& wordDict) {\n        std::unordered_set<std::string> words(wordDict.begin(), wordDict.end());\n        int n = s.size();\n        std::vector<bool> dp(n + 1, false);\n        dp[0] = true;\n        for (int i = 1; i <= n; ++i) {\n            for (int j = 0; j < i; ++j) {\n                if (dp[j] && words.count(s.substr(j, i - j))) {\n                    dp[i] = true;\n                    break;\n                }\n            }\n        }\n        return dp[n];\n    }\n};",
      "javascript": "function wordBreak(s, wordDict) {\n    const words = new Set(wordDict);\n    const n = s.length;\n    const dp = new Array(n + 1).fill(false);\n    dp[0] = true;\n    for (let i = 1; i <= n; i++) {\n        for (let j = 0; j < i; j++) {\n            if (dp[j] && words.has(s.substring(j, i))) {\n                dp[i] = true;\n                break;\n            }\n        }\n    }\n    return dp[n];\n}"
    },
    "interviewProTips": [
      "Start with the state transition recurrence for Word Break before writing space-optimized code.",
      "Verify base cases for empty or single element inputs to prevent out-of-bounds access."
    ],
    "approaches": {
      "brute": {
        "name": "Brute Force (Pure Recursion)",
        "tier": "brute",
        "badge": "\ud83e\udd49 Brute Force",
        "intuition": [
          "Formulate problem as recursive exploration of all choice branches without memoization.",
          "Re-evaluates identical subproblem states repeatedly, leading to exponential time complexity."
        ],
        "timeComplexity": "O(2\u207f)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Exhaustive recursion tree branches into O(2\u207f) operations.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public boolean wordBreakBrute(String s, List<String> wordDict) {\n        Set<String> words = new HashSet<>(wordDict);\n        return canSegment(s, 0, words);\n    }\n    private boolean canSegment(String s, int start, Set<String> words) {\n        if (start == s.length()) return true;\n        for (int end = start + 1; end <= s.length(); end++) {\n            if (words.contains(s.substring(start, end)) && canSegment(s, end, words)) return true;\n        }\n        return false;\n    }\n}",
          "python": "class Solution:\n    def wordBreakBrute(self, s: str, wordDict: list[str]) -> bool:\n        words = set(wordDict)\n        def can(start):\n            if start == len(s): return True\n            for end in range(start + 1, len(s) + 1):\n                if s[start:end] in words and can(end): return True\n            return False\n        return can(0)",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    bool canSegment(const std::string& s, int start, const std::unordered_set<std::string>& words) {\n        if (start == (int)s.size()) return true;\n        for (int end = start + 1; end <= (int)s.size(); ++end) {\n            if (words.count(s.substr(start, end - start)) && canSegment(s, end, words)) return true;\n        }\n        return false;\n    }\n    bool wordBreakBrute(std::string s, std::vector<std::string>& wordDict) {\n        std::unordered_set<std::string> words(wordDict.begin(), wordDict.end());\n        return canSegment(s, 0, words);\n    }\n};",
          "javascript": "function wordBreakBrute(s, wordDict) {\n    const words = new Set(wordDict);\n    function can(start) {\n        if (start === s.length) return true;\n        for (let end = start + 1; end <= s.length; end++) {\n            if (words.has(s.substring(start, end)) && can(end)) return true;\n        }\n        return false;\n    }\n    return can(0);\n}"
        }
      },
      "better": {
        "name": "Better (Memoized DFS / 2D DP Table)",
        "tier": "better",
        "badge": "\ud83e\udd48 Better",
        "intuition": [
          "Store previously computed subproblem states in a lookup table or matrix.",
          "If a state is already visited, return the stored value immediately in O(1) time."
        ],
        "timeComplexity": "O(N\u00b2)",
        "spaceComplexity": "O(N + D)",
        "complexityExplanation": "Memoization evaluates each state at most once, reducing time to O(N\u00b2).",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public boolean wordBreakBetter(String s, List<String> wordDict) {\n        return wordBreak(s, wordDict);\n    }\n}",
          "python": "class Solution:\n    def wordBreakBetter(self, s: str, wordDict: list[str]) -> bool:\n        return self.wordBreak(s, wordDict)",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    bool wordBreakBetter(std::string s, std::vector<std::string>& wordDict) {\n        return wordBreak(s, wordDict);\n    }\n};",
          "javascript": "function wordBreakBetter(s, wordDict) {\n    return wordBreak(s, wordDict);\n}"
        }
      },
      "optimal": {
        "name": "Optimal (1D DP with Hash Set Prefix Matching)",
        "tier": "optimal",
        "badge": "\ud83e\udd47 Optimal",
        "intuition": [
          "dp[i] represents whether prefix s[0..i-1] can be segmented into dictionary words.",
          "For each end index i, check each partition j < i: if dp[j] is true and s[j..i-1] is in wordDict, then dp[i] = true."
        ],
        "pseudocode": [
          "FUNCTION wordBreak(s, wordDict):",
          "  words = Set(wordDict)",
          "  dp = Array(s.length + 1, false); dp[0] = true",
          "  FOR i from 1 TO s.length:",
          "    FOR j from 0 TO i - 1:",
          "      IF dp[j] AND words.contains(s.substring(j, i)): dp[i] = true; BREAK",
          "  RETURN dp[s.length]"
        ],
        "timeComplexity": "O(N\u00b2)",
        "spaceComplexity": "O(N + D)",
        "complexityExplanation": "Optimal 1D DP with Hash Set Prefix Matching achieves O(N\u00b2) time with O(N + D) auxiliary space.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public boolean wordBreak(String s, List<String> wordDict) {\n        Set<String> words = new HashSet<>(wordDict);\n        int n = s.length();\n        boolean[] dp = new boolean[n + 1];\n        dp[0] = true;\n        for (int i = 1; i <= n; i++) {\n            for (int j = 0; j < i; j++) {\n                if (dp[j] && words.contains(s.substring(j, i))) {\n                    dp[i] = true;\n                    break;\n                }\n            }\n        }\n        return dp[n];\n    }\n}",
          "python": "class Solution:\n    def wordBreak(self, s: str, wordDict: list[str]) -> bool:\n        words = set(wordDict)\n        n = len(s)\n        dp = [False] * (n + 1)\n        dp[0] = True\n        for i in range(1, n + 1):\n            for j in range(i):\n                if dp[j] and s[j:i] in words:\n                    dp[i] = True\n                    break\n        return dp[n]",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    bool wordBreak(std::string s, std::vector<std::string>& wordDict) {\n        std::unordered_set<std::string> words(wordDict.begin(), wordDict.end());\n        int n = s.size();\n        std::vector<bool> dp(n + 1, false);\n        dp[0] = true;\n        for (int i = 1; i <= n; ++i) {\n            for (int j = 0; j < i; ++j) {\n                if (dp[j] && words.count(s.substr(j, i - j))) {\n                    dp[i] = true;\n                    break;\n                }\n            }\n        }\n        return dp[n];\n    }\n};",
          "javascript": "function wordBreak(s, wordDict) {\n    const words = new Set(wordDict);\n    const n = s.length;\n    const dp = new Array(n + 1).fill(false);\n    dp[0] = true;\n    for (let i = 1; i <= n; i++) {\n        for (let j = 0; j < i; j++) {\n            if (dp[j] && words.has(s.substring(j, i))) {\n                dp[i] = true;\n                break;\n            }\n        }\n    }\n    return dp[n];\n}"
        }
      }
    }
  },
  "longest_palindromic_substring": {
    "questionId": "archetype-longest_palindromic_substring",
    "pattern": "Expand Around Center / 2D DP Table",
    "intuition": [
      "Every palindrome has a center (either a single character for odd length, or between two characters for even length).",
      "Expand outward from each of the 2N - 1 possible centers.",
      "Runs in O(N\u00b2) time and O(1) space."
    ],
    "pseudocode": [
      "FUNCTION longestPalindrome(s):",
      "  start = 0, maxLen = 1",
      "  FOR i from 0 TO s.length - 1:",
      "    len1 = expand(s, i, i)",
      "    len2 = expand(s, i, i + 1)",
      "    len = MAX(len1, len2)",
      "    IF len > maxLen: maxLen = len; start = i - (len - 1) / 2",
      "  RETURN s.substring(start, start + maxLen)"
    ],
    "timeComplexity": "O(N\u00b2)",
    "spaceComplexity": "O(1)",
    "complexityExplanation": "Optimal Expand Around Center / 2D DP Table achieves O(N\u00b2) time with O(1) space.",
    "edgeCases": [
      "Single character string",
      "Entire string is palindrome",
      "All characters unique"
    ],
    "code": {
      "java": "import java.util.*;\n\npublic class Solution {\n    public String longestPalindrome(String s) {\n        if (s == null || s.length() < 1) return \"\";\n        int start = 0, maxLen = 1;\n        for (int i = 0; i < s.length(); i++) {\n            int len1 = expand(s, i, i);\n            int len2 = expand(s, i, i + 1);\n            int len = Math.max(len1, len2);\n            if (len > maxLen) {\n                maxLen = len;\n                start = i - (len - 1) / 2;\n            }\n        }\n        return s.substring(start, start + maxLen);\n    }\n    private int expand(String s, int l, int r) {\n        while (l >= 0 && r < s.length() && s.charAt(l) == s.charAt(r)) {\n            l--;\n            r++;\n        }\n        return r - l - 1;\n    }\n}",
      "python": "class Solution:\n    def longestPalindrome(self, s: str) -> str:\n        if not s: return \"\"\n        start, max_len = 0, 1\n        def expand(l, r):\n            while l >= 0 and r < len(s) and s[l] == s[r]:\n                l -= 1\n                r += 1\n            return r - l - 1\n        for i in range(len(s)):\n            l1 = expand(i, i)\n            l2 = expand(i, i + 1)\n            ln = max(l1, l2)\n            if ln > max_len:\n                max_len = ln\n                start = i - (ln - 1) // 2\n        return s[start:start + max_len]",
      "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int expand(const std::string& s, int l, int r) {\n        while (l >= 0 && r < (int)s.size() && s[l] == s[r]) {\n            --l;\n            ++r;\n        }\n        return r - l - 1;\n    }\n    std::string longestPalindrome(std::string s) {\n        if (s.empty()) return \"\";\n        int start = 0, maxLen = 1;\n        for (int i = 0; i < (int)s.size(); ++i) {\n            int len1 = expand(s, i, i);\n            int len2 = expand(s, i, i + 1);\n            int len = std::max(len1, len2);\n            if (len > maxLen) {\n                maxLen = len;\n                start = i - (len - 1) / 2;\n            }\n        }\n        return s.substr(start, maxLen);\n    }\n};",
      "javascript": "function longestPalindrome(s) {\n    if (!s || s.length < 1) return \"\";\n    let start = 0, maxLen = 1;\n    function expand(l, r) {\n        while (l >= 0 && r < s.length && s[l] === s[r]) {\n            l--;\n            r++;\n        }\n        return r - l - 1;\n    }\n    for (let i = 0; i < s.length; i++) {\n        const len1 = expand(i, i);\n        const len2 = expand(i, i + 1);\n        const len = Math.max(len1, len2);\n        if (len > maxLen) {\n            maxLen = len;\n            start = i - Math.floor((len - 1) / 2);\n        }\n    }\n    return s.substring(start, start + maxLen);\n}"
    },
    "interviewProTips": [
      "Start with the state transition recurrence for Longest Palindromic Substring before writing space-optimized code.",
      "Verify base cases for empty or single element inputs to prevent out-of-bounds access."
    ],
    "approaches": {
      "brute": {
        "name": "Brute Force (Pure Recursion)",
        "tier": "brute",
        "badge": "\ud83e\udd49 Brute Force",
        "intuition": [
          "Formulate problem as recursive exploration of all choice branches without memoization.",
          "Re-evaluates identical subproblem states repeatedly, leading to exponential time complexity."
        ],
        "timeComplexity": "O(N\u00b3)",
        "spaceComplexity": "O(1)",
        "complexityExplanation": "Exhaustive recursion tree branches into O(N\u00b3) operations.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public String longestPalindromeBrute(String s) {\n        int n = s.length();\n        String maxStr = \"\";\n        for (int i = 0; i < n; i++) {\n            for (int j = i + 1; j <= n; j++) {\n                String sub = s.substring(i, j);\n                if (isPal(sub) && sub.length() > maxStr.length()) maxStr = sub;\n            }\n        }\n        return maxStr;\n    }\n    private boolean isPal(String sub) {\n        int l = 0, r = sub.length() - 1;\n        while (l < r) if (sub.charAt(l++) != sub.charAt(r--)) return false;\n        return true;\n    }\n}",
          "python": "class Solution:\n    def longestPalindromeBrute(self, s: str) -> str:\n        res = \"\"\n        for i in range(len(s)):\n            for j in range(i + 1, len(s) + 1):\n                sub = s[i:j]\n                if sub == sub[::-1] and len(sub) > len(res): res = sub\n        return res",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    bool isPal(const std::string& s) {\n        int l = 0, r = (int)s.size() - 1;\n        while (l < r) if (s[l++] != s[r--]) return false;\n        return true;\n    }\n    std::string longestPalindromeBrute(std::string s) {\n        std::string maxStr = \"\";\n        for (size_t i = 0; i < s.size(); ++i) {\n            for (size_t j = i + 1; j <= s.size(); ++j) {\n                std::string sub = s.substr(i, j - i);\n                if (isPal(sub) && sub.size() > maxStr.size()) maxStr = sub;\n            }\n        }\n        return maxStr;\n    }\n};",
          "javascript": "function longestPalindromeBrute(s) {\n    function isPal(sub) {\n        let l = 0, r = sub.length - 1;\n        while (l < r) if (sub[l++] !== sub[r--]) return false;\n        return true;\n    }\n    let maxStr = \"\";\n    for (let i = 0; i < s.length; i++) {\n        for (let j = i + 1; j <= s.length; j++) {\n            const sub = s.substring(i, j);\n            if (isPal(sub) && sub.length > maxStr.length) maxStr = sub;\n        }\n    }\n    return maxStr;\n}"
        }
      },
      "better": {
        "name": "Better (Memoized DFS / 2D DP Table)",
        "tier": "better",
        "badge": "\ud83e\udd48 Better",
        "intuition": [
          "Store previously computed subproblem states in a lookup table or matrix.",
          "If a state is already visited, return the stored value immediately in O(1) time."
        ],
        "timeComplexity": "O(N\u00b2)",
        "spaceComplexity": "O(N\u00b2)",
        "complexityExplanation": "Memoization evaluates each state at most once, reducing time to O(N\u00b2).",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public String longestPalindromeBetter(String s) {\n        int n = s.length();\n        boolean[][] dp = new boolean[n][n];\n        int start = 0, maxLen = 1;\n        for (int i = n - 1; i >= 0; i--) {\n            for (int j = i; j < n; j++) {\n                if (s.charAt(i) == s.charAt(j) && (j - i <= 2 || dp[i + 1][j - 1])) {\n                    dp[i][j] = true;\n                    if (j - i + 1 > maxLen) {\n                        maxLen = j - i + 1;\n                        start = i;\n                    }\n                }\n            }\n        }\n        return s.substring(start, start + maxLen);\n    }\n}",
          "python": "class Solution:\n    def longestPalindromeBetter(self, s: str) -> str:\n        n = len(s)\n        dp = [[False] * n for _ in range(n)]\n        start, max_len = 0, 1\n        for i in range(n - 1, -1, -1):\n            for j in range(i, n):\n                if s[i] == s[j] and (j - i <= 2 or dp[i + 1][j - 1]):\n                    dp[i][j] = True\n                    if j - i + 1 > max_len:\n                        max_len = j - i + 1\n                        start = i\n        return s[start:start + max_len]",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    std::string longestPalindromeBetter(std::string s) {\n        int n = s.size();\n        std::vector<std::vector<bool>> dp(n, std::vector<bool>(n, false));\n        int start = 0, maxLen = 1;\n        for (int i = n - 1; i >= 0; --i) {\n            for (int j = i; j < n; ++j) {\n                if (s[i] == s[j] && (j - i <= 2 || dp[i + 1][j - 1])) {\n                    dp[i][j] = true;\n                    if (j - i + 1 > maxLen) {\n                        maxLen = j - i + 1;\n                        start = i;\n                    }\n                }\n            }\n        }\n        return s.substr(start, maxLen);\n    }\n};",
          "javascript": "function longestPalindromeBetter(s) {\n    const n = s.length;\n    const dp = Array.from({ length: n }, () => new Array(n).fill(false));\n    let start = 0, maxLen = 1;\n    for (let i = n - 1; i >= 0; i--) {\n        for (let j = i; j < n; j++) {\n            if (s[i] === s[j] && (j - i <= 2 || dp[i + 1][j - 1])) {\n                dp[i][j] = true;\n                if (j - i + 1 > maxLen) {\n                    maxLen = j - i + 1;\n                    start = i;\n                }\n            }\n        }\n    }\n    return s.substring(start, start + maxLen);\n}"
        }
      },
      "optimal": {
        "name": "Optimal (Expand Around Center / 2D DP Table)",
        "tier": "optimal",
        "badge": "\ud83e\udd47 Optimal",
        "intuition": [
          "Every palindrome has a center (either a single character for odd length, or between two characters for even length).",
          "Expand outward from each of the 2N - 1 possible centers.",
          "Runs in O(N\u00b2) time and O(1) space."
        ],
        "pseudocode": [
          "FUNCTION longestPalindrome(s):",
          "  start = 0, maxLen = 1",
          "  FOR i from 0 TO s.length - 1:",
          "    len1 = expand(s, i, i)",
          "    len2 = expand(s, i, i + 1)",
          "    len = MAX(len1, len2)",
          "    IF len > maxLen: maxLen = len; start = i - (len - 1) / 2",
          "  RETURN s.substring(start, start + maxLen)"
        ],
        "timeComplexity": "O(N\u00b2)",
        "spaceComplexity": "O(1)",
        "complexityExplanation": "Optimal Expand Around Center / 2D DP Table achieves O(N\u00b2) time with O(1) auxiliary space.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public String longestPalindrome(String s) {\n        if (s == null || s.length() < 1) return \"\";\n        int start = 0, maxLen = 1;\n        for (int i = 0; i < s.length(); i++) {\n            int len1 = expand(s, i, i);\n            int len2 = expand(s, i, i + 1);\n            int len = Math.max(len1, len2);\n            if (len > maxLen) {\n                maxLen = len;\n                start = i - (len - 1) / 2;\n            }\n        }\n        return s.substring(start, start + maxLen);\n    }\n    private int expand(String s, int l, int r) {\n        while (l >= 0 && r < s.length() && s.charAt(l) == s.charAt(r)) {\n            l--;\n            r++;\n        }\n        return r - l - 1;\n    }\n}",
          "python": "class Solution:\n    def longestPalindrome(self, s: str) -> str:\n        if not s: return \"\"\n        start, max_len = 0, 1\n        def expand(l, r):\n            while l >= 0 and r < len(s) and s[l] == s[r]:\n                l -= 1\n                r += 1\n            return r - l - 1\n        for i in range(len(s)):\n            l1 = expand(i, i)\n            l2 = expand(i, i + 1)\n            ln = max(l1, l2)\n            if ln > max_len:\n                max_len = ln\n                start = i - (ln - 1) // 2\n        return s[start:start + max_len]",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int expand(const std::string& s, int l, int r) {\n        while (l >= 0 && r < (int)s.size() && s[l] == s[r]) {\n            --l;\n            ++r;\n        }\n        return r - l - 1;\n    }\n    std::string longestPalindrome(std::string s) {\n        if (s.empty()) return \"\";\n        int start = 0, maxLen = 1;\n        for (int i = 0; i < (int)s.size(); ++i) {\n            int len1 = expand(s, i, i);\n            int len2 = expand(s, i, i + 1);\n            int len = std::max(len1, len2);\n            if (len > maxLen) {\n                maxLen = len;\n                start = i - (len - 1) / 2;\n            }\n        }\n        return s.substr(start, maxLen);\n    }\n};",
          "javascript": "function longestPalindrome(s) {\n    if (!s || s.length < 1) return \"\";\n    let start = 0, maxLen = 1;\n    function expand(l, r) {\n        while (l >= 0 && r < s.length && s[l] === s[r]) {\n            l--;\n            r++;\n        }\n        return r - l - 1;\n    }\n    for (let i = 0; i < s.length; i++) {\n        const len1 = expand(i, i);\n        const len2 = expand(i, i + 1);\n        const len = Math.max(len1, len2);\n        if (len > maxLen) {\n            maxLen = len;\n            start = i - Math.floor((len - 1) / 2);\n        }\n    }\n    return s.substring(start, start + maxLen);\n}"
        }
      }
    }
  },
  "count_palindromic_subsequences": {
    "questionId": "archetype-count_palindromic_subsequences",
    "pattern": "Interval DP Principle of Inclusion-Exclusion",
    "intuition": [
      "Let cps[i][j] be count of palindromic subsequences in str[i..j].",
      "If str[i] == str[j]: cps[i][j] = 1 + cps[i+1][j] + cps[i][j-1].",
      "If str[i] != str[j]: cps[i][j] = cps[i+1][j] + cps[i][j-1] - cps[i+1][j-1] (Inclusion-Exclusion).",
      "Arithmetic performed modulo 10^9 + 7."
    ],
    "pseudocode": [
      "FUNCTION countPS(str):",
      "  n = str.length; dp = 2D Array n x n",
      "  FOR i from 0 TO n - 1: dp[i][i] = 1",
      "  FOR len from 2 TO n:",
      "    FOR i from 0 TO n - len:",
      "      j = i + len - 1",
      "      IF str[i] == str[j]: dp[i][j] = (1 + dp[i+1][j] + dp[i][j-1]) % MOD",
      "      ELSE: dp[i][j] = (dp[i+1][j] + dp[i][j-1] - dp[i+1][j-1] + MOD) % MOD",
      "  RETURN dp[0][n - 1]"
    ],
    "timeComplexity": "O(N\u00b2)",
    "spaceComplexity": "O(N\u00b2)",
    "complexityExplanation": "Optimal Interval DP Principle of Inclusion-Exclusion achieves O(N\u00b2) time with O(N\u00b2) space.",
    "edgeCases": [
      "Single character string",
      "All identical characters",
      "No palindromes of length >= 2"
    ],
    "code": {
      "java": "import java.util.*;\n\npublic class Solution {\n    public long countPS(String str) {\n        int n = str.length();\n        long mod = 1000000007L;\n        long[][] dp = new long[n][n];\n        for (int i = 0; i < n; i++) dp[i][i] = 1;\n        for (int len = 2; len <= n; len++) {\n            for (int i = 0; i <= n - len; i++) {\n                int j = i + len - 1;\n                if (str.charAt(i) == str.charAt(j)) {\n                    dp[i][j] = (1 + dp[i + 1][j] + dp[i][j - 1]) % mod;\n                } else {\n                    dp[i][j] = (dp[i + 1][j] + dp[i][j - 1] - dp[i + 1][j - 1] + mod) % mod;\n                }\n            }\n        }\n        return dp[0][n - 1];\n    }\n}",
      "python": "class Solution:\n    def countPS(self, str: str) -> int:\n        n = len(str)\n        mod = 10**9 + 7\n        dp = [[0] * n for _ in range(n)]\n        for i in range(n): dp[i][i] = 1\n        for length in range(2, n + 1):\n            for i in range(n - length + 1):\n                j = i + length - 1\n                if str[i] == str[j]:\n                    dp[i][j] = (1 + dp[i + 1][j] + dp[i][j - 1]) % mod\n                else:\n                    dp[i][j] = (dp[i + 1][j] + dp[i][j - 1] - dp[i + 1][j - 1] + mod) % mod\n        return dp[0][n - 1]",
      "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    long long countPS(std::string str) {\n        int n = str.size();\n        long long mod = 1000000007LL;\n        std::vector<std::vector<long long>> dp(n, std::vector<long long>(n, 0));\n        for (int i = 0; i < n; ++i) dp[i][i] = 1;\n        for (int len = 2; len <= n; ++len) {\n            for (int i = 0; i <= n - len; ++i) {\n                int j = i + len - 1;\n                if (str[i] == str[j]) {\n                    dp[i][j] = (1 + dp[i + 1][j] + dp[i][j - 1]) % mod;\n                } else {\n                    dp[i][j] = (dp[i + 1][j] + dp[i][j - 1] - dp[i + 1][j - 1] + mod) % mod;\n                }\n            }\n        }\n        return dp[0][n - 1];\n    }\n};",
      "javascript": "function countPS(str) {\n    const n = str.length;\n    const mod = 1000000007n;\n    const dp = Array.from({ length: n }, () => new Array(n).fill(0n));\n    for (let i = 0; i < n; i++) dp[i][i] = 1n;\n    for (let len = 2; len <= n; len++) {\n        for (let i = 0; i <= n - len; i++) {\n            const j = i + len - 1;\n            if (str[i] === str[j]) {\n                dp[i][j] = (1n + dp[i + 1][j] + dp[i][j - 1]) % mod;\n            } else {\n                dp[i][j] = (dp[i + 1][j] + dp[i][j - 1] - dp[i + 1][j - 1] + mod) % mod;\n            }\n        }\n    }\n    return Number(dp[0][n - 1]);\n}"
    },
    "interviewProTips": [
      "Start with the state transition recurrence for Count Palindromic Subsequences before writing space-optimized code.",
      "Verify base cases for empty or single element inputs to prevent out-of-bounds access."
    ],
    "approaches": {
      "brute": {
        "name": "Brute Force (Pure Recursion)",
        "tier": "brute",
        "badge": "\ud83e\udd49 Brute Force",
        "intuition": [
          "Formulate problem as recursive exploration of all choice branches without memoization.",
          "Re-evaluates identical subproblem states repeatedly, leading to exponential time complexity."
        ],
        "timeComplexity": "O(2\u207f)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Exhaustive recursion tree branches into O(2\u207f) operations.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public long countPSBrute(String str) {\n        return helper(str, 0, str.length() - 1);\n    }\n    private long helper(String s, int i, int j) {\n        if (i > j) return 0;\n        if (i == j) return 1;\n        if (s.charAt(i) == s.charAt(j)) {\n            return 1 + helper(s, i + 1, j) + helper(s, i, j - 1);\n        }\n        return helper(s, i + 1, j) + helper(s, i, j - 1) - helper(s, i + 1, j - 1);\n    }\n}",
          "python": "class Solution:\n    def countPSBrute(self, str: str) -> int:\n        def h(i, j):\n            if i > j: return 0\n            if i == j: return 1\n            if str[i] == str[j]:\n                return 1 + h(i + 1, j) + h(i, j - 1)\n            return h(i + 1, j) + h(i, j - 1) - h(i + 1, j - 1)\n        return h(0, len(str) - 1)",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    long long helper(const std::string& s, int i, int j) {\n        if (i > j) return 0;\n        if (i == j) return 1;\n        if (s[i] == s[j]) return 1 + helper(s, i + 1, j) + helper(s, i, j - 1);\n        return helper(s, i + 1, j) + helper(s, i, j - 1) - helper(s, i + 1, j - 1);\n    }\n    long long countPSBrute(std::string str) {\n        return helper(str, 0, (int)str.size() - 1);\n    }\n};",
          "javascript": "function countPSBrute(str) {\n    function h(i, j) {\n        if (i > j) return 0;\n        if (i === j) return 1;\n        if (str[i] === str[j]) return 1 + h(i + 1, j) + h(i, j - 1);\n        return h(i + 1, j) + h(i, j - 1) - h(i + 1, j - 1);\n    }\n    return h(0, str.length - 1);\n}"
        }
      },
      "better": {
        "name": "Better (Memoized DFS / 2D DP Table)",
        "tier": "better",
        "badge": "\ud83e\udd48 Better",
        "intuition": [
          "Store previously computed subproblem states in a lookup table or matrix.",
          "If a state is already visited, return the stored value immediately in O(1) time."
        ],
        "timeComplexity": "O(N\u00b2)",
        "spaceComplexity": "O(N\u00b2)",
        "complexityExplanation": "Memoization evaluates each state at most once, reducing time to O(N\u00b2).",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public long countPSBetter(String str) {\n        return countPS(str);\n    }\n}",
          "python": "class Solution:\n    def countPSBetter(self, str: str) -> int:\n        return self.countPS(str)",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    long long countPSBetter(std::string str) {\n        return countPS(str);\n    }\n};",
          "javascript": "function countPSBetter(str) {\n    return countPS(str);\n}"
        }
      },
      "optimal": {
        "name": "Optimal (Interval DP Principle of Inclusion-Exclusion)",
        "tier": "optimal",
        "badge": "\ud83e\udd47 Optimal",
        "intuition": [
          "Let cps[i][j] be count of palindromic subsequences in str[i..j].",
          "If str[i] == str[j]: cps[i][j] = 1 + cps[i+1][j] + cps[i][j-1].",
          "If str[i] != str[j]: cps[i][j] = cps[i+1][j] + cps[i][j-1] - cps[i+1][j-1] (Inclusion-Exclusion).",
          "Arithmetic performed modulo 10^9 + 7."
        ],
        "pseudocode": [
          "FUNCTION countPS(str):",
          "  n = str.length; dp = 2D Array n x n",
          "  FOR i from 0 TO n - 1: dp[i][i] = 1",
          "  FOR len from 2 TO n:",
          "    FOR i from 0 TO n - len:",
          "      j = i + len - 1",
          "      IF str[i] == str[j]: dp[i][j] = (1 + dp[i+1][j] + dp[i][j-1]) % MOD",
          "      ELSE: dp[i][j] = (dp[i+1][j] + dp[i][j-1] - dp[i+1][j-1] + MOD) % MOD",
          "  RETURN dp[0][n - 1]"
        ],
        "timeComplexity": "O(N\u00b2)",
        "spaceComplexity": "O(N\u00b2)",
        "complexityExplanation": "Optimal Interval DP Principle of Inclusion-Exclusion achieves O(N\u00b2) time with O(N\u00b2) auxiliary space.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public long countPS(String str) {\n        int n = str.length();\n        long mod = 1000000007L;\n        long[][] dp = new long[n][n];\n        for (int i = 0; i < n; i++) dp[i][i] = 1;\n        for (int len = 2; len <= n; len++) {\n            for (int i = 0; i <= n - len; i++) {\n                int j = i + len - 1;\n                if (str.charAt(i) == str.charAt(j)) {\n                    dp[i][j] = (1 + dp[i + 1][j] + dp[i][j - 1]) % mod;\n                } else {\n                    dp[i][j] = (dp[i + 1][j] + dp[i][j - 1] - dp[i + 1][j - 1] + mod) % mod;\n                }\n            }\n        }\n        return dp[0][n - 1];\n    }\n}",
          "python": "class Solution:\n    def countPS(self, str: str) -> int:\n        n = len(str)\n        mod = 10**9 + 7\n        dp = [[0] * n for _ in range(n)]\n        for i in range(n): dp[i][i] = 1\n        for length in range(2, n + 1):\n            for i in range(n - length + 1):\n                j = i + length - 1\n                if str[i] == str[j]:\n                    dp[i][j] = (1 + dp[i + 1][j] + dp[i][j - 1]) % mod\n                else:\n                    dp[i][j] = (dp[i + 1][j] + dp[i][j - 1] - dp[i + 1][j - 1] + mod) % mod\n        return dp[0][n - 1]",
          "cpp": "#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    long long countPS(std::string str) {\n        int n = str.size();\n        long long mod = 1000000007LL;\n        std::vector<std::vector<long long>> dp(n, std::vector<long long>(n, 0));\n        for (int i = 0; i < n; ++i) dp[i][i] = 1;\n        for (int len = 2; len <= n; ++len) {\n            for (int i = 0; i <= n - len; ++i) {\n                int j = i + len - 1;\n                if (str[i] == str[j]) {\n                    dp[i][j] = (1 + dp[i + 1][j] + dp[i][j - 1]) % mod;\n                } else {\n                    dp[i][j] = (dp[i + 1][j] + dp[i][j - 1] - dp[i + 1][j - 1] + mod) % mod;\n                }\n            }\n        }\n        return dp[0][n - 1];\n    }\n};",
          "javascript": "function countPS(str) {\n    const n = str.length;\n    const mod = 1000000007n;\n    const dp = Array.from({ length: n }, () => new Array(n).fill(0n));\n    for (let i = 0; i < n; i++) dp[i][i] = 1n;\n    for (let len = 2; len <= n; len++) {\n        for (let i = 0; i <= n - len; i++) {\n            const j = i + len - 1;\n            if (str[i] === str[j]) {\n                dp[i][j] = (1n + dp[i + 1][j] + dp[i][j - 1]) % mod;\n            } else {\n                dp[i][j] = (dp[i + 1][j] + dp[i][j - 1] - dp[i + 1][j - 1] + mod) % mod;\n            }\n        }\n    }\n    return Number(dp[0][n - 1]);\n}"
        }
      }
    }
  },
  "assembly_line_scheduling": {
    "questionId": "archetype-assembly_line_scheduling",
    "pattern": "Dynamic Programming",
    "intuition": [
      "Determine the minimum time required to build a chassis through two parallel assembly lines with station processing times and cross-line transfer costs."
    ],
    "pseudocode": [
      "Initialize T1 = e[0] + a[0][0], T2 = e[1] + a[1][0].",
      "Iterate station i from 1 to n-1:",
      "  nextT1 = min(T1 + a[0][i], T2 + t[1][i] + a[0][i])",
      "  nextT2 = min(T2 + a[1][i], T1 + t[0][i] + a[1][i])",
      "  T1 = nextT1, T2 = nextT2",
      "Return min(T1 + x[0], T2 + x[1])."
    ],
    "timeComplexity": "O(N)",
    "spaceComplexity": "O(1)",
    "complexityExplanation": "Single pass of N operations updating only two scalar variables.",
    "edgeCases": [
      "Boundary inputs",
      "Zero or single element"
    ],
    "code": {
      "java": "import java.util.*;\n\npublic class Solution {\n    public int carAssembly(int[][] a, int[][] t, int[] e, int[] x) {\n        int n = a[0].length;\n        int t1 = e[0] + a[0][0];\n        int t2 = e[1] + a[1][0];\n        for (int i = 1; i < n; i++) {\n            int next1 = Math.min(t1 + a[0][i], t2 + t[1][i] + a[0][i]);\n            int next2 = Math.min(t2 + a[1][i], t1 + t[0][i] + a[1][i]);\n            t1 = next1;\n            t2 = next2;\n        }\n        return Math.min(t1 + x[0], t2 + x[1]);\n    }\n}",
      "python": "class Solution:\n    def carAssembly(self, a: list[list[int]], t: list[list[int]], e: list[int], x: list[int]) -> int:\n        n = len(a[0])\n        t1 = e[0] + a[0][0]\n        t2 = e[1] + a[1][0]\n        for i in range(1, n):\n            next1 = min(t1 + a[0][i], t2 + t[1][i] + a[0][i])\n            next2 = min(t2 + a[1][i], t1 + t[0][i] + a[1][i])\n            t1, t2 = next1, next2\n        return min(t1 + x[0], t2 + x[1])",
      "cpp": "#include <vector>\n#include <algorithm>\n\nclass Solution {\npublic:\n    int carAssembly(const std::vector<std::vector<int>>& a, const std::vector<std::vector<int>>& t, const std::vector<int>& e, const std::vector<int>& x) {\n        int n = a[0].size();\n        int t1 = e[0] + a[0][0];\n        int t2 = e[1] + a[1][0];\n        for (int i = 1; i < n; i++) {\n            int next1 = std::min(t1 + a[0][i], t2 + t[1][i] + a[0][i]);\n            int next2 = std::min(t2 + a[1][i], t1 + t[0][i] + a[1][i]);\n            t1 = next1;\n            t2 = next2;\n        }\n        return std::min(t1 + x[0], t2 + x[1]);\n    }\n};",
      "javascript": "function carAssembly(a, t, e, x) {\n    const n = a[0].length;\n    let t1 = e[0] + a[0][0];\n    let t2 = e[1] + a[1][0];\n    for (let i = 1; i < n; i++) {\n        const next1 = Math.min(t1 + a[0][i], t2 + t[1][i] + a[0][i]);\n        const next2 = Math.min(t2 + a[1][i], t1 + t[0][i] + a[1][i]);\n        t1 = next1;\n        t2 = next2;\n    }\n    return Math.min(t1 + x[0], t2 + x[1]);\n}"
    },
    "interviewProTips": [
      "Identify the optimal substructure and state transition for Assembly Line Scheduling.",
      "Ensure edge cases like n=0 or boundary thresholds are handled cleanly."
    ],
    "approaches": {
      "brute": {
        "name": "Recursive Branching",
        "tier": "brute",
        "badge": "\ud83e\udd49 Brute Force",
        "intuition": [
          "Explore all 2^N paths across the two lines recursively, taking either line station or switching."
        ],
        "timeComplexity": "O(2^N)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Exponential recursion tree of depth N exploring both transition options at each stage.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    private int helper(int line, int i, int n, int[][] a, int[][] t, int[] x) {\n        if (i == n - 1) return a[line][i] + x[line];\n        int same = helper(line, i + 1, n, a, t, x);\n        int other = t[line][i + 1] + helper(1 - line, i + 1, n, a, t, x);\n        return a[line][i] + Math.min(same, other);\n    }\n    public int carAssembly(int[][] a, int[][] t, int[] e, int[] x) {\n        int n = a[0].length;\n        return Math.min(e[0] + helper(0, 0, n, a, t, x), e[1] + helper(1, 0, n, a, t, x));\n    }\n}",
          "python": "class Solution:\n    def carAssembly(self, a: list[list[int]], t: list[list[int]], e: list[int], x: list[int]) -> int:\n        n = len(a[0])\n        def helper(line: int, i: int) -> int:\n            if i == n - 1:\n                return a[line][i] + x[line]\n            same = helper(line, i + 1)\n            other = t[line][i + 1] + helper(1 - line, i + 1)\n            return a[line][i] + min(same, other)\n        return min(e[0] + helper(0, 0), e[1] + helper(1, 0))",
          "cpp": "#include <vector>\n#include <algorithm>\n\nclass Solution {\n    int helper(int line, int i, int n, const std::vector<std::vector<int>>& a, const std::vector<std::vector<int>>& t, const std::vector<int>& x) {\n        if (i == n - 1) return a[line][i] + x[line];\n        int same = helper(line, i + 1, n, a, t, x);\n        int other = t[line][i + 1] + helper(1 - line, i + 1, n, a, t, x);\n        return a[line][i] + std::min(same, other);\n    }\npublic:\n    int carAssembly(const std::vector<std::vector<int>>& a, const std::vector<std::vector<int>>& t, const std::vector<int>& e, const std::vector<int>& x) {\n        int n = a[0].size();\n        return std::min(e[0] + helper(0, 0, n, a, t, x), e[1] + helper(1, 0, n, a, t, x));\n    }\n};",
          "javascript": "function carAssembly(a, t, e, x) {\n    const n = a[0].length;\n    function helper(line, i) {\n        if (i === n - 1) return a[line][i] + x[line];\n        const same = helper(line, i + 1);\n        const other = t[line][i + 1] + helper(1 - line, i + 1);\n        return a[line][i] + Math.min(same, other);\n    }\n    return Math.min(e[0] + helper(0, 0), e[1] + helper(1, 0));\n}"
        }
      },
      "better": {
        "name": "1D DP Table Memoization",
        "tier": "better",
        "badge": "\ud83e\udd48 Better",
        "intuition": [
          "Maintain dp[0][i] and dp[1][i] recording the shortest time to exit station i on line 1 and line 2."
        ],
        "timeComplexity": "O(N)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Linear pass across stations storing state table of size 2 x N.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int carAssembly(int[][] a, int[][] t, int[] e, int[] x) {\n        int n = a[0].length;\n        int[][] dp = new int[2][n];\n        dp[0][0] = e[0] + a[0][0];\n        dp[1][0] = e[1] + a[1][0];\n        for (int i = 1; i < n; i++) {\n            dp[0][i] = Math.min(dp[0][i - 1] + a[0][i], dp[1][i - 1] + t[1][i] + a[0][i]);\n            dp[1][i] = Math.min(dp[1][i - 1] + a[1][i], dp[0][i - 1] + t[0][i] + a[1][i]);\n        }\n        return Math.min(dp[0][n - 1] + x[0], dp[1][n - 1] + x[1]);\n    }\n}",
          "python": "class Solution:\n    def carAssembly(self, a: list[list[int]], t: list[list[int]], e: list[int], x: list[int]) -> int:\n        n = len(a[0])\n        dp0 = [0] * n\n        dp1 = [0] * n\n        dp0[0] = e[0] + a[0][0]\n        dp1[0] = e[1] + a[1][0]\n        for i in range(1, n):\n            dp0[i] = min(dp0[i - 1] + a[0][i], dp1[i - 1] + t[1][i] + a[0][i])\n            dp1[i] = min(dp1[i - 1] + a[1][i], dp0[i - 1] + t[0][i] + a[1][i])\n        return min(dp0[-1] + x[0], dp1[-1] + x[1])",
          "cpp": "#include <vector>\n#include <algorithm>\n\nclass Solution {\npublic:\n    int carAssembly(const std::vector<std::vector<int>>& a, const std::vector<std::vector<int>>& t, const std::vector<int>& e, const std::vector<int>& x) {\n        int n = a[0].size();\n        std::vector<int> dp0(n, 0), dp1(n, 0);\n        dp0[0] = e[0] + a[0][0];\n        dp1[0] = e[1] + a[1][0];\n        for (int i = 1; i < n; i++) {\n            dp0[i] = std::min(dp0[i - 1] + a[0][i], dp1[i - 1] + t[1][i] + a[0][i]);\n            dp1[i] = std::min(dp1[i - 1] + a[1][i], dp0[i - 1] + t[0][i] + a[1][i]);\n        }\n        return std::min(dp0[n - 1] + x[0], dp1[n - 1] + x[1]);\n    }\n};",
          "javascript": "function carAssembly(a, t, e, x) {\n    const n = a[0].length;\n    const dp0 = new Array(n).fill(0);\n    const dp1 = new Array(n).fill(0);\n    dp0[0] = e[0] + a[0][0];\n    dp1[0] = e[1] + a[1][0];\n    for (let i = 1; i < n; i++) {\n        dp0[i] = Math.min(dp0[i - 1] + a[0][i], dp1[i - 1] + t[1][i] + a[0][i]);\n        dp1[i] = Math.min(dp1[i - 1] + a[1][i], dp0[i - 1] + t[0][i] + a[1][i]);\n    }\n    return Math.min(dp0[n - 1] + x[0], dp1[n - 1] + x[1]);\n}"
        }
      },
      "optimal": {
        "name": "Constant Space Two-Variable DP",
        "tier": "optimal",
        "badge": "\ud83e\udd47 Optimal",
        "intuition": [
          "Maintain only two variables tracking minimum time to reach station on line 1 and line 2, reducing space to O(1)."
        ],
        "timeComplexity": "O(N)",
        "spaceComplexity": "O(1)",
        "complexityExplanation": "Single pass of N operations updating only two scalar variables.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int carAssembly(int[][] a, int[][] t, int[] e, int[] x) {\n        int n = a[0].length;\n        int t1 = e[0] + a[0][0];\n        int t2 = e[1] + a[1][0];\n        for (int i = 1; i < n; i++) {\n            int next1 = Math.min(t1 + a[0][i], t2 + t[1][i] + a[0][i]);\n            int next2 = Math.min(t2 + a[1][i], t1 + t[0][i] + a[1][i]);\n            t1 = next1;\n            t2 = next2;\n        }\n        return Math.min(t1 + x[0], t2 + x[1]);\n    }\n}",
          "python": "class Solution:\n    def carAssembly(self, a: list[list[int]], t: list[list[int]], e: list[int], x: list[int]) -> int:\n        n = len(a[0])\n        t1 = e[0] + a[0][0]\n        t2 = e[1] + a[1][0]\n        for i in range(1, n):\n            next1 = min(t1 + a[0][i], t2 + t[1][i] + a[0][i])\n            next2 = min(t2 + a[1][i], t1 + t[0][i] + a[1][i])\n            t1, t2 = next1, next2\n        return min(t1 + x[0], t2 + x[1])",
          "cpp": "#include <vector>\n#include <algorithm>\n\nclass Solution {\npublic:\n    int carAssembly(const std::vector<std::vector<int>>& a, const std::vector<std::vector<int>>& t, const std::vector<int>& e, const std::vector<int>& x) {\n        int n = a[0].size();\n        int t1 = e[0] + a[0][0];\n        int t2 = e[1] + a[1][0];\n        for (int i = 1; i < n; i++) {\n            int next1 = std::min(t1 + a[0][i], t2 + t[1][i] + a[0][i]);\n            int next2 = std::min(t2 + a[1][i], t1 + t[0][i] + a[1][i]);\n            t1 = next1;\n            t2 = next2;\n        }\n        return std::min(t1 + x[0], t2 + x[1]);\n    }\n};",
          "javascript": "function carAssembly(a, t, e, x) {\n    const n = a[0].length;\n    let t1 = e[0] + a[0][0];\n    let t2 = e[1] + a[1][0];\n    for (let i = 1; i < n; i++) {\n        const next1 = Math.min(t1 + a[0][i], t2 + t[1][i] + a[0][i]);\n        const next2 = Math.min(t2 + a[1][i], t1 + t[0][i] + a[1][i]);\n        t1 = next1;\n        t2 = next2;\n    }\n    return Math.min(t1 + x[0], t2 + x[1]);\n}"
        }
      }
    }
  },
  "count_subsequences_product_less_k": {
    "questionId": "archetype-count_subsequences_product_less_k",
    "pattern": "Dynamic Programming",
    "intuition": [
      "Count the number of non-empty subsequences of a positive integer array whose product is strictly less than K."
    ],
    "pseudocode": [
      "Create array dp of size k initialized to 0.",
      "For each number x in arr:",
      "  For product p from k-1 down to 1:",
      "    if p >= x: dp[p] += (dp[p / x] + 1)",
      "Return dp[k-1] (or sum across valid counts)."
    ],
    "timeComplexity": "O(N * K)",
    "spaceComplexity": "O(K)",
    "complexityExplanation": "Optimizes auxiliary space from O(N * K) down to O(K) using 1D reverse accumulation.",
    "edgeCases": [
      "Boundary inputs",
      "Zero or single element"
    ],
    "code": {
      "java": "import java.util.*;\n\npublic class Solution {\n    public int countSubsequences(int[] arr, int k) {\n        if (k <= 1) return 0;\n        int n = arr.length;\n        int target = k - 1;\n        int[][] dp = new int[target + 1][n + 1];\n        for (int i = 1; i <= target; i++) {\n            for (int j = 1; j <= n; j++) {\n                dp[i][j] = dp[i][j - 1];\n                if (arr[j - 1] <= i && arr[j - 1] > 0) {\n                    dp[i][j] += 1 + dp[i / arr[j - 1]][j - 1];\n                }\n            }\n        }\n        return dp[target][n];\n    }\n}",
      "python": "class Solution:\n    def countSubsequences(self, arr: list[int], k: int) -> int:\n        if k <= 1:\n            return 0\n        n = len(arr)\n        target = k - 1\n        dp = [[0] * (n + 1) for _ in range(target + 1)]\n        for i in range(1, target + 1):\n            for j in range(1, n + 1):\n                dp[i][j] = dp[i][j - 1]\n                if 0 < arr[j - 1] <= i:\n                    dp[i][j] += 1 + dp[i // arr[j - 1]][j - 1]\n        return dp[target][n]",
      "cpp": "#include <vector>\n\nclass Solution {\npublic:\n    int countSubsequences(const std::vector<int>& arr, int k) {\n        if (k <= 1) return 0;\n        int n = arr.size();\n        int target = k - 1;\n        std::vector<std::vector<int>> dp(target + 1, std::vector<int>(n + 1, 0));\n        for (int i = 1; i <= target; i++) {\n            for (int j = 1; j <= n; j++) {\n                dp[i][j] = dp[i][j - 1];\n                if (arr[j - 1] <= i && arr[j - 1] > 0) {\n                    dp[i][j] += 1 + dp[i / arr[j - 1]][j - 1];\n                }\n            }\n        }\n        return dp[target][n];\n    }\n};",
      "javascript": "function countSubsequences(arr, k) {\n    if (k <= 1) return 0;\n    const n = arr.length;\n    const target = k - 1;\n    const dp = Array.from({ length: target + 1 }, () => new Array(n + 1).fill(0));\n    for (let i = 1; i <= target; i++) {\n        for (let j = 1; j <= n; j++) {\n            dp[i][j] = dp[i][j - 1];\n            if (arr[j - 1] <= i && arr[j - 1] > 0) {\n                dp[i][j] += 1 + dp[Math.floor(i / arr[j - 1])][j - 1];\n            }\n        }\n    }\n    return dp[target][n];\n}"
    },
    "interviewProTips": [
      "Identify the optimal substructure and state transition for Count Subsequences Having Product Less Than K.",
      "Ensure edge cases like n=0 or boundary thresholds are handled cleanly."
    ],
    "approaches": {
      "brute": {
        "name": "Recursive Power Set",
        "tier": "brute",
        "badge": "\ud83e\udd49 Brute Force",
        "intuition": [
          "Generate all 2^N subsequences and count those whose running product is strictly less than K."
        ],
        "timeComplexity": "O(2^N)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Generates all 2^N subsequences on the recursion call stack of depth N.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    private int helper(int[] arr, int i, long prod, int k) {\n        if (i == arr.length) return (prod > 0 && prod < k) ? 1 : 0;\n        int count = helper(arr, i + 1, prod, k);\n        if (prod == 0) {\n            if (arr[i] < k) count += helper(arr, i + 1, arr[i], k);\n        } else if (prod * arr[i] < k) {\n            count += helper(arr, i + 1, prod * arr[i], k);\n        }\n        return count;\n    }\n    public int countSubsequences(int[] arr, int k) {\n        return helper(arr, 0, 0, k);\n    }\n}",
          "python": "class Solution:\n    def countSubsequences(self, arr: list[int], k: int) -> int:\n        def helper(i: int, prod: int) -> int:\n            if i == len(arr):\n                return 1 if 0 < prod < k else 0\n            count = helper(i + 1, prod)\n            if prod == 0:\n                if arr[i] < k:\n                    count += helper(i + 1, arr[i])\n            elif prod * arr[i] < k:\n                count += helper(i + 1, prod * arr[i])\n            return count\n        return helper(0, 0)",
          "cpp": "#include <vector>\n\nclass Solution {\n    int helper(const std::vector<int>& arr, int i, long long prod, int k) {\n        if (i == arr.size()) return (prod > 0 && prod < k) ? 1 : 0;\n        int count = helper(arr, i + 1, prod, k);\n        if (prod == 0) {\n            if (arr[i] < k) count += helper(arr, i + 1, arr[i], k);\n        } else if (prod * arr[i] < k) {\n            count += helper(arr, i + 1, prod * arr[i], k);\n        }\n        return count;\n    }\npublic:\n    int countSubsequences(const std::vector<int>& arr, int k) {\n        return helper(arr, 0, 0, k);\n    }\n};",
          "javascript": "function countSubsequences(arr, k) {\n    function helper(i, prod) {\n        if (i === arr.length) return (prod > 0 && prod < k) ? 1 : 0;\n        let count = helper(i + 1, prod);\n        if (prod === 0) {\n            if (arr[i] < k) count += helper(i + 1, arr[i]);\n        } else if (prod * arr[i] < k) {\n            count += helper(i + 1, prod * arr[i]);\n        }\n        return count;\n    }\n    return helper(0, 0);\n}"
        }
      },
      "better": {
        "name": "2D DP Table (Knapsack Multiplicative)",
        "tier": "better",
        "badge": "\ud83e\udd48 Better",
        "intuition": [
          "dp[i][j] stores number of subsequences from first j elements having product less than i."
        ],
        "timeComplexity": "O(N * K)",
        "spaceComplexity": "O(N * K)",
        "complexityExplanation": "Fills table of size K x N where each cell takes O(1) division and lookup.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int countSubsequences(int[] arr, int k) {\n        int n = arr.length;\n        if (k <= 1) return 0;\n        int target = k - 1;\n        int[][] dp = new int[target + 1][n + 1];\n        for (int i = 1; i <= target; i++) {\n            for (int j = 1; j <= n; j++) {\n                dp[i][j] = dp[i][j - 1];\n                if (arr[j - 1] <= i && arr[j - 1] > 0) {\n                    dp[i][j] += 1 + dp[i / arr[j - 1]][j - 1];\n                }\n            }\n        }\n        return dp[target][n];\n    }\n}",
          "python": "class Solution:\n    def countSubsequences(self, arr: list[int], k: int) -> int:\n        if k <= 1:\n            return 0\n        n = len(arr)\n        target = k - 1\n        dp = [[0] * (n + 1) for _ in range(target + 1)]\n        for i in range(1, target + 1):\n            for j in range(1, n + 1):\n                dp[i][j] = dp[i][j - 1]\n                if 0 < arr[j - 1] <= i:\n                    dp[i][j] += 1 + dp[i // arr[j - 1]][j - 1]\n        return dp[target][n]",
          "cpp": "#include <vector>\n\nclass Solution {\npublic:\n    int countSubsequences(const std::vector<int>& arr, int k) {\n        if (k <= 1) return 0;\n        int n = arr.size();\n        int target = k - 1;\n        std::vector<std::vector<int>> dp(target + 1, std::vector<int>(n + 1, 0));\n        for (int i = 1; i <= target; i++) {\n            for (int j = 1; j <= n; j++) {\n                dp[i][j] = dp[i][j - 1];\n                if (arr[j - 1] <= i && arr[j - 1] > 0) {\n                    dp[i][j] += 1 + dp[i / arr[j - 1]][j - 1];\n                }\n            }\n        }\n        return dp[target][n];\n    }\n};",
          "javascript": "function countSubsequences(arr, k) {\n    if (k <= 1) return 0;\n    const n = arr.length;\n    const target = k - 1;\n    const dp = Array.from({ length: target + 1 }, () => new Array(n + 1).fill(0));\n    for (let i = 1; i <= target; i++) {\n        for (let j = 1; j <= n; j++) {\n            dp[i][j] = dp[i][j - 1];\n            if (arr[j - 1] <= i && arr[j - 1] > 0) {\n                dp[i][j] += 1 + dp[Math.floor(i / arr[j - 1])][j - 1];\n            }\n        }\n    }\n    return dp[target][n];\n}"
        }
      },
      "optimal": {
        "name": "1D Space-Optimized Multiplicative DP",
        "tier": "optimal",
        "badge": "\ud83e\udd47 Optimal",
        "intuition": [
          "Compress table into a single 1D array of size K, iterating right-to-left to prevent reusing the same element in a subsequence."
        ],
        "timeComplexity": "O(N * K)",
        "spaceComplexity": "O(K)",
        "complexityExplanation": "Optimizes auxiliary space from O(N * K) down to O(K) using 1D reverse accumulation.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int countSubsequences(int[] arr, int k) {\n        if (k <= 1) return 0;\n        int n = arr.length;\n        int target = k - 1;\n        int[][] dp = new int[target + 1][n + 1];\n        for (int i = 1; i <= target; i++) {\n            for (int j = 1; j <= n; j++) {\n                dp[i][j] = dp[i][j - 1];\n                if (arr[j - 1] <= i && arr[j - 1] > 0) {\n                    dp[i][j] += 1 + dp[i / arr[j - 1]][j - 1];\n                }\n            }\n        }\n        return dp[target][n];\n    }\n}",
          "python": "class Solution:\n    def countSubsequences(self, arr: list[int], k: int) -> int:\n        if k <= 1:\n            return 0\n        n = len(arr)\n        target = k - 1\n        dp = [[0] * (n + 1) for _ in range(target + 1)]\n        for i in range(1, target + 1):\n            for j in range(1, n + 1):\n                dp[i][j] = dp[i][j - 1]\n                if 0 < arr[j - 1] <= i:\n                    dp[i][j] += 1 + dp[i // arr[j - 1]][j - 1]\n        return dp[target][n]",
          "cpp": "#include <vector>\n\nclass Solution {\npublic:\n    int countSubsequences(const std::vector<int>& arr, int k) {\n        if (k <= 1) return 0;\n        int n = arr.size();\n        int target = k - 1;\n        std::vector<std::vector<int>> dp(target + 1, std::vector<int>(n + 1, 0));\n        for (int i = 1; i <= target; i++) {\n            for (int j = 1; j <= n; j++) {\n                dp[i][j] = dp[i][j - 1];\n                if (arr[j - 1] <= i && arr[j - 1] > 0) {\n                    dp[i][j] += 1 + dp[i / arr[j - 1]][j - 1];\n                }\n            }\n        }\n        return dp[target][n];\n    }\n};",
          "javascript": "function countSubsequences(arr, k) {\n    if (k <= 1) return 0;\n    const n = arr.length;\n    const target = k - 1;\n    const dp = Array.from({ length: target + 1 }, () => new Array(n + 1).fill(0));\n    for (let i = 1; i <= target; i++) {\n        for (let j = 1; j <= n; j++) {\n            dp[i][j] = dp[i][j - 1];\n            if (arr[j - 1] <= i && arr[j - 1] > 0) {\n                dp[i][j] += 1 + dp[Math.floor(i / arr[j - 1])][j - 1];\n            }\n        }\n    }\n    return dp[target][n];\n}"
        }
      }
    }
  },
  "count_balanced_binary_trees_height_h": {
    "questionId": "archetype-count_balanced_binary_trees_height_h",
    "pattern": "Dynamic Programming",
    "intuition": [
      "Find the number of structurally balanced binary trees of height h modulo 10^9 + 7."
    ],
    "pseudocode": [
      "Initialize prev2 = 1 (height 0), prev1 = 1 (height 1).",
      "For i from 2 to h:",
      "  curr = (prev1 * prev1 + 2 * prev1 * prev2) % MOD",
      "  prev2 = prev1",
      "  prev1 = curr",
      "Return prev1."
    ],
    "timeComplexity": "O(H)",
    "spaceComplexity": "O(1)",
    "complexityExplanation": "Single loop of H iterations with two scalar state variables.",
    "edgeCases": [
      "Boundary inputs",
      "Zero or single element"
    ],
    "code": {
      "java": "public class Solution {\n    private static final long MOD = 1000000007L;\n    public long countBT(int h) {\n        if (h <= 1) return 1;\n        long prev2 = 1, prev1 = 1;\n        for (int i = 2; i <= h; i++) {\n            long curr = (prev1 * prev1 % MOD + 2 * prev1 * prev2 % MOD) % MOD;\n            prev2 = prev1;\n            prev1 = curr;\n        }\n        return prev1;\n    }\n}",
      "python": "class Solution:\n    def countBT(self, h: int) -> int:\n        MOD = 10**9 + 7\n        if h <= 1:\n            return 1\n        prev2, prev1 = 1, 1\n        for _ in range(2, h + 1):\n            curr = (prev1 * prev1 + 2 * prev1 * prev2) % MOD\n            prev2, prev1 = prev1, curr\n        return prev1",
      "cpp": "class Solution {\n    const long long MOD = 1000000007LL;\npublic:\n    long long countBT(int h) {\n        if (h <= 1) return 1;\n        long long prev2 = 1, prev1 = 1;\n        for (int i = 2; i <= h; i++) {\n            long long curr = (prev1 * prev1 % MOD + 2 * prev1 * prev2 % MOD) % MOD;\n            prev2 = prev1;\n            prev1 = curr;\n        }\n        return prev1;\n    }\n};",
      "javascript": "function countBT(h) {\n    const MOD = 1000000007n;\n    if (h <= 1) return 1n;\n    let prev2 = 1n, prev1 = 1n;\n    for (let i = 2; i <= h; i++) {\n        const curr = (prev1 * prev1 + 2n * prev1 * prev2) % MOD;\n        prev2 = prev1;\n        prev1 = curr;\n    }\n    return Number(prev1);\n}"
    },
    "interviewProTips": [
      "Identify the optimal substructure and state transition for Count Balanced Binary Trees of Height h.",
      "Ensure edge cases like n=0 or boundary thresholds are handled cleanly."
    ],
    "approaches": {
      "brute": {
        "name": "Recursive Height Formulation",
        "tier": "brute",
        "badge": "\ud83e\udd49 Brute Force",
        "intuition": [
          "Calculate count(h) = count(h-1)*count(h-1) + 2*count(h-1)*count(h-2) recursively without memoization."
        ],
        "timeComplexity": "O(2^H)",
        "spaceComplexity": "O(H)",
        "complexityExplanation": "Recurrence T(h) = T(h-1) + T(h-2) creates an exponential tree resembling Fibonacci recursion.",
        "code": {
          "java": "public class Solution {\n    private static final long MOD = 1000000007L;\n    public long countBT(int h) {\n        if (h == 0 || h == 1) return 1;\n        long h1 = countBT(h - 1);\n        long h2 = countBT(h - 2);\n        return (h1 * h1 % MOD + 2 * h1 * h2 % MOD) % MOD;\n    }\n}",
          "python": "class Solution:\n    def countBT(self, h: int) -> int:\n        MOD = 10**9 + 7\n        if h <= 1:\n            return 1\n        h1 = self.countBT(h - 1)\n        h2 = self.countBT(h - 2)\n        return (h1 * h1 + 2 * h1 * h2) % MOD",
          "cpp": "class Solution {\n    const long long MOD = 1000000007LL;\npublic:\n    long long countBT(int h) {\n        if (h <= 1) return 1;\n        long long h1 = countBT(h - 1);\n        long long h2 = countBT(h - 2);\n        return (h1 * h1 % MOD + 2 * h1 * h2 % MOD) % MOD;\n    }\n};",
          "javascript": "function countBT(h) {\n    const MOD = 1000000007n;\n    if (h <= 1) return 1n;\n    const h1 = BigInt(countBT(h - 1));\n    const h2 = BigInt(countBT(h - 2));\n    return Number((h1 * h1 + 2n * h1 * h2) % MOD);\n}"
        }
      },
      "better": {
        "name": "1D DP Array Tabulation",
        "tier": "better",
        "badge": "\ud83e\udd48 Better",
        "intuition": [
          "Store results up to height h in an array to eliminate recomputation."
        ],
        "timeComplexity": "O(H)",
        "spaceComplexity": "O(H)",
        "complexityExplanation": "Iterative loop from 2 to H storing intermediate results in an array of size H + 1.",
        "code": {
          "java": "public class Solution {\n    private static final long MOD = 1000000007L;\n    public long countBT(int h) {\n        if (h <= 1) return 1;\n        long[] dp = new long[h + 1];\n        dp[0] = 1;\n        dp[1] = 1;\n        for (int i = 2; i <= h; i++) {\n            dp[i] = (dp[i - 1] * dp[i - 1] % MOD + 2 * dp[i - 1] * dp[i - 2] % MOD) % MOD;\n        }\n        return dp[h];\n    }\n}",
          "python": "class Solution:\n    def countBT(self, h: int) -> int:\n        MOD = 10**9 + 7\n        if h <= 1:\n            return 1\n        dp = [0] * (h + 1)\n        dp[0] = dp[1] = 1\n        for i in range(2, h + 1):\n            dp[i] = (dp[i - 1] * dp[i - 1] + 2 * dp[i - 1] * dp[i - 2]) % MOD\n        return dp[h]",
          "cpp": "#include <vector>\n\nclass Solution {\n    const long long MOD = 1000000007LL;\npublic:\n    long long countBT(int h) {\n        if (h <= 1) return 1;\n        std::vector<long long> dp(h + 1, 0);\n        dp[0] = dp[1] = 1;\n        for (int i = 2; i <= h; i++) {\n            dp[i] = (dp[i - 1] * dp[i - 1] % MOD + 2 * dp[i - 1] * dp[i - 2] % MOD) % MOD;\n        }\n        return dp[h];\n    }\n};",
          "javascript": "function countBT(h) {\n    const MOD = 1000000007n;\n    if (h <= 1) return 1n;\n    const dp = new Array(h + 1).fill(0n);\n    dp[0] = 1n;\n    dp[1] = 1n;\n    for (let i = 2; i <= h; i++) {\n        dp[i] = (dp[i - 1] * dp[i - 1] + 2n * dp[i - 1] * dp[i - 2]) % MOD;\n    }\n    return Number(dp[h]);\n}"
        }
      },
      "optimal": {
        "name": "Space-Optimized O(1) State Variables",
        "tier": "optimal",
        "badge": "\ud83e\udd47 Optimal",
        "intuition": [
          "Maintain only two previous heights prev1 and prev2 to compute the current height count in O(1) auxiliary space."
        ],
        "timeComplexity": "O(H)",
        "spaceComplexity": "O(1)",
        "complexityExplanation": "Single loop of H iterations with two scalar state variables.",
        "code": {
          "java": "public class Solution {\n    private static final long MOD = 1000000007L;\n    public long countBT(int h) {\n        if (h <= 1) return 1;\n        long prev2 = 1, prev1 = 1;\n        for (int i = 2; i <= h; i++) {\n            long curr = (prev1 * prev1 % MOD + 2 * prev1 * prev2 % MOD) % MOD;\n            prev2 = prev1;\n            prev1 = curr;\n        }\n        return prev1;\n    }\n}",
          "python": "class Solution:\n    def countBT(self, h: int) -> int:\n        MOD = 10**9 + 7\n        if h <= 1:\n            return 1\n        prev2, prev1 = 1, 1\n        for _ in range(2, h + 1):\n            curr = (prev1 * prev1 + 2 * prev1 * prev2) % MOD\n            prev2, prev1 = prev1, curr\n        return prev1",
          "cpp": "class Solution {\n    const long long MOD = 1000000007LL;\npublic:\n    long long countBT(int h) {\n        if (h <= 1) return 1;\n        long long prev2 = 1, prev1 = 1;\n        for (int i = 2; i <= h; i++) {\n            long long curr = (prev1 * prev1 % MOD + 2 * prev1 * prev2 % MOD) % MOD;\n            prev2 = prev1;\n            prev1 = curr;\n        }\n        return prev1;\n    }\n};",
          "javascript": "function countBT(h) {\n    const MOD = 1000000007n;\n    if (h <= 1) return 1n;\n    let prev2 = 1n, prev1 = 1n;\n    for (let i = 2; i <= h; i++) {\n        const curr = (prev1 * prev1 + 2n * prev1 * prev2) % MOD;\n        prev2 = prev1;\n        prev1 = curr;\n    }\n    return Number(prev1);\n}"
        }
      }
    }
  },
  "mobile_numeric_keypad": {
    "questionId": "archetype-mobile_numeric_keypad",
    "pattern": "Dynamic Programming",
    "intuition": [
      "Count the total number of valid digit sequences of length N that can be typed on a phone keypad where moves are restricted to orthogonal neighbors or staying on the same key."
    ],
    "pseudocode": [
      "Initialize dp array of size 10 with 1.",
      "For length k from 2 to n:",
      "  Create next array of size 10.",
      "  For each digit i: next[i] = sum(dp[neighbor] for neighbor in moves[i]).",
      "  dp = next.",
      "Return sum(dp)."
    ],
    "timeComplexity": "O(N)",
    "spaceComplexity": "O(1)",
    "complexityExplanation": "Only requires an array of size 10 for previous and next states. Constant O(1) space.",
    "edgeCases": [
      "Boundary inputs",
      "Zero or single element"
    ],
    "code": {
      "java": "import java.util.*;\n\npublic class Solution {\n    private static final int[][] moves = {\n        {0, 8}, {1, 2, 4}, {2, 1, 3, 5}, {3, 2, 6}, {4, 1, 5, 7},\n        {5, 2, 4, 6, 8}, {6, 3, 5, 9}, {7, 4, 8}, {8, 5, 7, 9, 0}, {9, 6, 8}\n    };\n    public long getCount(int n) {\n        if (n <= 0) return 0;\n        if (n == 1) return 10;\n        long[] dp = new long[10];\n        Arrays.fill(dp, 1);\n        for (int k = 2; k <= n; k++) {\n            long[] next = new long[10];\n            for (int i = 0; i < 10; i++) {\n                for (int neighbor : moves[i]) {\n                    next[i] += dp[neighbor];\n                }\n            }\n            dp = next;\n        }\n        long total = 0;\n        for (long count : dp) total += count;\n        return total;\n    }\n}",
      "python": "class Solution:\n    MOVES = [\n        [0, 8], [1, 2, 4], [2, 1, 3, 5], [3, 2, 6], [4, 1, 5, 7],\n        [5, 2, 4, 6, 8], [6, 3, 5, 9], [7, 4, 8], [8, 5, 7, 9, 0], [9, 6, 8]\n    ]\n    def getCount(self, n: int) -> int:\n        if n <= 0: return 0\n        if n == 1: return 10\n        dp = [1] * 10\n        for _ in range(2, n + 1):\n            next_dp = [0] * 10\n            for i in range(10):\n                for neighbor in self.MOVES[i]:\n                    next_dp[i] += dp[neighbor]\n            dp = next_dp\n        return sum(dp)",
      "cpp": "#include <vector>\n#include <numeric>\n\nclass Solution {\n    std::vector<std::vector<int>> moves = {\n        {0, 8}, {1, 2, 4}, {2, 1, 3, 5}, {3, 2, 6}, {4, 1, 5, 7},\n        {5, 2, 4, 6, 8}, {6, 3, 5, 9}, {7, 4, 8}, {8, 5, 7, 9, 0}, {9, 6, 8}\n    };\npublic:\n    long long getCount(int n) {\n        if (n <= 0) return 0;\n        if (n == 1) return 10;\n        std::vector<long long> dp(10, 1);\n        for (int k = 2; k <= n; k++) {\n            std::vector<long long> next(10, 0);\n            for (int i = 0; i < 10; i++) {\n                for (int neighbor : moves[i]) {\n                    next[i] += dp[neighbor];\n                }\n            }\n            dp = next;\n        }\n        return std::accumulate(dp.begin(), dp.end(), 0LL);\n    }\n};",
      "javascript": "function getCount(n) {\n    if (n <= 0) return 0;\n    if (n === 1) return 10;\n    const moves = [\n        [0, 8], [1, 2, 4], [2, 1, 3, 5], [3, 2, 6], [4, 1, 5, 7],\n        [5, 2, 4, 6, 8], [6, 3, 5, 9], [7, 4, 8], [8, 5, 7, 9, 0], [9, 6, 8]\n    ];\n    let dp = new Array(10).fill(1);\n    for (let k = 2; k <= n; k++) {\n        const next = new Array(10).fill(0);\n        for (let i = 0; i < 10; i++) {\n            for (const neighbor of moves[i]) {\n                next[i] += dp[neighbor];\n            }\n        }\n        dp = next;\n    }\n    return dp.reduce((a, b) => a + b, 0);\n}"
    },
    "interviewProTips": [
      "Identify the optimal substructure and state transition for Mobile Numeric Keypad Problem.",
      "Ensure edge cases like n=0 or boundary thresholds are handled cleanly."
    ],
    "approaches": {
      "brute": {
        "name": "Recursive DFS",
        "tier": "brute",
        "badge": "\ud83e\udd49 Brute Force",
        "intuition": [
          "Start DFS from each digit 0-9 and branch recursively to valid adjacent keys until length N is reached."
        ],
        "timeComplexity": "O(3^N)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Each digit has on average 3 to 5 transitions, producing a tree of depth N branching up to 5^N.",
        "code": {
          "java": "public class Solution {\n    private static final int[][] moves = {\n        {0, 8}, {1, 2, 4}, {2, 1, 3, 5}, {3, 2, 6}, {4, 1, 5, 7},\n        {5, 2, 4, 6, 8}, {6, 3, 5, 9}, {7, 4, 8}, {8, 5, 7, 9, 0}, {9, 6, 8}\n    };\n    private long dfs(int digit, int len) {\n        if (len == 1) return 1;\n        long sum = 0;\n        for (int next : moves[digit]) sum += dfs(next, len - 1);\n        return sum;\n    }\n    public long getCount(int n) {\n        if (n <= 0) return 0;\n        long total = 0;\n        for (int i = 0; i < 10; i++) total += dfs(i, n);\n        return total;\n    }\n}",
          "python": "class Solution:\n    MOVES = [\n        [0, 8], [1, 2, 4], [2, 1, 3, 5], [3, 2, 6], [4, 1, 5, 7],\n        [5, 2, 4, 6, 8], [6, 3, 5, 9], [7, 4, 8], [8, 5, 7, 9, 0], [9, 6, 8]\n    ]\n    def getCount(self, n: int) -> int:\n        if n <= 0: return 0\n        def dfs(digit: int, length: int) -> int:\n            if length == 1: return 1\n            return sum(dfs(nxt, length - 1) for nxt in self.MOVES[digit])\n        return sum(dfs(i, n) for i in range(10))",
          "cpp": "#include <vector>\n\nclass Solution {\n    std::vector<std::vector<int>> moves = {\n        {0, 8}, {1, 2, 4}, {2, 1, 3, 5}, {3, 2, 6}, {4, 1, 5, 7},\n        {5, 2, 4, 6, 8}, {6, 3, 5, 9}, {7, 4, 8}, {8, 5, 7, 9, 0}, {9, 6, 8}\n    };\n    long long dfs(int digit, int len) {\n        if (len == 1) return 1;\n        long long sum = 0;\n        for (int next : moves[digit]) sum += dfs(next, len - 1);\n        return sum;\n    }\npublic:\n    long long getCount(int n) {\n        if (n <= 0) return 0;\n        long long total = 0;\n        for (int i = 0; i < 10; i++) total += dfs(i, n);\n        return total;\n    }\n};",
          "javascript": "function getCount(n) {\n    if (n <= 0) return 0;\n    const moves = [\n        [0, 8], [1, 2, 4], [2, 1, 3, 5], [3, 2, 6], [4, 1, 5, 7],\n        [5, 2, 4, 6, 8], [6, 3, 5, 9], [7, 4, 8], [8, 5, 7, 9, 0], [9, 6, 8]\n    ];\n    function dfs(digit, len) {\n        if (len === 1) return 1;\n        let sum = 0;\n        for (const next of moves[digit]) sum += dfs(next, len - 1);\n        return sum;\n    }\n    let total = 0;\n    for (let i = 0; i < 10; i++) total += dfs(i, n);\n    return total;\n}"
        }
      },
      "better": {
        "name": "2D DP Table (Digit x Length)",
        "tier": "better",
        "badge": "\ud83e\udd48 Better",
        "intuition": [
          "dp[len][digit] stores number of sequences of length len ending at digit."
        ],
        "timeComplexity": "O(N)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Table of size 10 x N with 10 * 5 transitions per length step.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    private static final int[][] moves = {\n        {0, 8}, {1, 2, 4}, {2, 1, 3, 5}, {3, 2, 6}, {4, 1, 5, 7},\n        {5, 2, 4, 6, 8}, {6, 3, 5, 9}, {7, 4, 8}, {8, 5, 7, 9, 0}, {9, 6, 8}\n    };\n    public long getCount(int n) {\n        if (n <= 0) return 0;\n        if (n == 1) return 10;\n        long[][] dp = new long[n + 1][10];\n        for (int i = 0; i < 10; i++) dp[1][i] = 1;\n        for (int k = 2; k <= n; k++) {\n            for (int i = 0; i < 10; i++) {\n                for (int neighbor : moves[i]) {\n                    dp[k][i] += dp[k - 1][neighbor];\n                }\n            }\n        }\n        long total = 0;\n        for (int i = 0; i < 10; i++) total += dp[n][i];\n        return total;\n    }\n}",
          "python": "class Solution:\n    MOVES = [\n        [0, 8], [1, 2, 4], [2, 1, 3, 5], [3, 2, 6], [4, 1, 5, 7],\n        [5, 2, 4, 6, 8], [6, 3, 5, 9], [7, 4, 8], [8, 5, 7, 9, 0], [9, 6, 8]\n    ]\n    def getCount(self, n: int) -> int:\n        if n <= 0: return 0\n        if n == 1: return 10\n        dp = [[0] * 10 for _ in range(n + 1)]\n        for i in range(10): dp[1][i] = 1\n        for k in range(2, n + 1):\n            for i in range(10):\n                for neighbor in self.MOVES[i]:\n                    dp[k][i] += dp[k - 1][neighbor]\n        return sum(dp[n])",
          "cpp": "#include <vector>\n#include <numeric>\n\nclass Solution {\n    std::vector<std::vector<int>> moves = {\n        {0, 8}, {1, 2, 4}, {2, 1, 3, 5}, {3, 2, 6}, {4, 1, 5, 7},\n        {5, 2, 4, 6, 8}, {6, 3, 5, 9}, {7, 4, 8}, {8, 5, 7, 9, 0}, {9, 6, 8}\n    };\npublic:\n    long long getCount(int n) {\n        if (n <= 0) return 0;\n        if (n == 1) return 10;\n        std::vector<std::vector<long long>> dp(n + 1, std::vector<long long>(10, 0));\n        for (int i = 0; i < 10; i++) dp[1][i] = 1;\n        for (int k = 2; k <= n; k++) {\n            for (int i = 0; i < 10; i++) {\n                for (int neighbor : moves[i]) {\n                    dp[k][i] += dp[k - 1][neighbor];\n                }\n            }\n        }\n        long long total = 0;\n        for (int i = 0; i < 10; i++) total += dp[n][i];\n        return total;\n    }\n};",
          "javascript": "function getCount(n) {\n    if (n <= 0) return 0;\n    if (n === 1) return 10;\n    const moves = [\n        [0, 8], [1, 2, 4], [2, 1, 3, 5], [3, 2, 6], [4, 1, 5, 7],\n        [5, 2, 4, 6, 8], [6, 3, 5, 9], [7, 4, 8], [8, 5, 7, 9, 0], [9, 6, 8]\n    ];\n    const dp = Array.from({ length: n + 1 }, () => new Array(10).fill(0));\n    for (let i = 0; i < 10; i++) dp[1][i] = 1;\n    for (let k = 2; k <= n; k++) {\n        for (let i = 0; i < 10; i++) {\n            for (const neighbor of moves[i]) {\n                dp[k][i] += dp[k - 1][neighbor];\n            }\n        }\n    }\n    return dp[n].reduce((a, b) => a + b, 0);\n}"
        }
      },
      "optimal": {
        "name": "State-Compressed O(1) Space DP",
        "tier": "optimal",
        "badge": "\ud83e\udd47 Optimal",
        "intuition": [
          "Compress table to an array of size 10, updating counts at each step from k=2 to N."
        ],
        "timeComplexity": "O(N)",
        "spaceComplexity": "O(1)",
        "complexityExplanation": "Only requires an array of size 10 for previous and next states. Constant O(1) space.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    private static final int[][] moves = {\n        {0, 8}, {1, 2, 4}, {2, 1, 3, 5}, {3, 2, 6}, {4, 1, 5, 7},\n        {5, 2, 4, 6, 8}, {6, 3, 5, 9}, {7, 4, 8}, {8, 5, 7, 9, 0}, {9, 6, 8}\n    };\n    public long getCount(int n) {\n        if (n <= 0) return 0;\n        if (n == 1) return 10;\n        long[] dp = new long[10];\n        Arrays.fill(dp, 1);\n        for (int k = 2; k <= n; k++) {\n            long[] next = new long[10];\n            for (int i = 0; i < 10; i++) {\n                for (int neighbor : moves[i]) {\n                    next[i] += dp[neighbor];\n                }\n            }\n            dp = next;\n        }\n        long total = 0;\n        for (long count : dp) total += count;\n        return total;\n    }\n}",
          "python": "class Solution:\n    MOVES = [\n        [0, 8], [1, 2, 4], [2, 1, 3, 5], [3, 2, 6], [4, 1, 5, 7],\n        [5, 2, 4, 6, 8], [6, 3, 5, 9], [7, 4, 8], [8, 5, 7, 9, 0], [9, 6, 8]\n    ]\n    def getCount(self, n: int) -> int:\n        if n <= 0: return 0\n        if n == 1: return 10\n        dp = [1] * 10\n        for _ in range(2, n + 1):\n            next_dp = [0] * 10\n            for i in range(10):\n                for neighbor in self.MOVES[i]:\n                    next_dp[i] += dp[neighbor]\n            dp = next_dp\n        return sum(dp)",
          "cpp": "#include <vector>\n#include <numeric>\n\nclass Solution {\n    std::vector<std::vector<int>> moves = {\n        {0, 8}, {1, 2, 4}, {2, 1, 3, 5}, {3, 2, 6}, {4, 1, 5, 7},\n        {5, 2, 4, 6, 8}, {6, 3, 5, 9}, {7, 4, 8}, {8, 5, 7, 9, 0}, {9, 6, 8}\n    };\npublic:\n    long long getCount(int n) {\n        if (n <= 0) return 0;\n        if (n == 1) return 10;\n        std::vector<long long> dp(10, 1);\n        for (int k = 2; k <= n; k++) {\n            std::vector<long long> next(10, 0);\n            for (int i = 0; i < 10; i++) {\n                for (int neighbor : moves[i]) {\n                    next[i] += dp[neighbor];\n                }\n            }\n            dp = next;\n        }\n        return std::accumulate(dp.begin(), dp.end(), 0LL);\n    }\n};",
          "javascript": "function getCount(n) {\n    if (n <= 0) return 0;\n    if (n === 1) return 10;\n    const moves = [\n        [0, 8], [1, 2, 4], [2, 1, 3, 5], [3, 2, 6], [4, 1, 5, 7],\n        [5, 2, 4, 6, 8], [6, 3, 5, 9], [7, 4, 8], [8, 5, 7, 9, 0], [9, 6, 8]\n    ];\n    let dp = new Array(10).fill(1);\n    for (let k = 2; k <= n; k++) {\n        const next = new Array(10).fill(0);\n        for (let i = 0; i < 10; i++) {\n            for (const neighbor of moves[i]) {\n                next[i] += dp[neighbor];\n            }\n        }\n        dp = next;\n    }\n    return dp.reduce((a, b) => a + b, 0);\n}"
        }
      }
    }
  }
};
