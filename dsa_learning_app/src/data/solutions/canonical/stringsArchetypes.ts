import { ProblemSolution } from '../../../types/dsa';

export const STRINGS_ARCHETYPES: Record<string, ProblemSolution> = {
  "word_break": {
    "questionId": "archetype-word_break",
    "pattern": "1D Dynamic Programming with Hash Set",
    "intuition": [
      "Define dp[i] as true if prefix s[0...i-1] can be segmented into dictionary words.",
      "Base case: dp[0] = true (empty string is always valid).",
      "For each index i from 1 to n, split into prefix s[0...j-1] and suffix s[j...i-1]. If dp[j] is true and s[j...i] is in wordDict, then dp[i] = true."
    ],
    "pseudocode": [
      "FUNCTION wordBreak(s, wordDict):",
      "  dp = Array(s.length + 1, false); dp[0] = true",
      "  FOR i from 1 TO s.length:",
      "    FOR j from 0 TO i - 1:",
      "      IF dp[j] AND dict.contains(s.substring(j, i)): dp[i] = true; BREAK",
      "  RETURN dp[s.length]"
    ],
    "timeComplexity": "O(N\u00b2)",
    "spaceComplexity": "O(N)",
    "complexityExplanation": "Iterating through all prefixes of length N with substring lookups in a hash set takes O(N^2) time and O(N) auxiliary space.",
    "edgeCases": [
      "Empty string",
      "Single char word",
      "Repeated words"
    ],
    "code": {
      "java": "import java.util.*;\n\npublic class Solution {\n    public boolean wordBreak(String s, List<String> wordDict) {\n        Set<String> set = new HashSet<>(wordDict);\n        int n = s.length();\n        boolean[] dp = new boolean[n + 1];\n        dp[0] = true;\n        int maxLen = 0;\n        for (String w : wordDict) maxLen = Math.max(maxLen, w.length());\n        for (int i = 1; i <= n; i++) {\n            for (int j = Math.max(0, i - maxLen); j < i; j++) {\n                if (dp[j] && set.contains(s.substring(j, i))) {\n                    dp[i] = true;\n                    break;\n                }\n            }\n        }\n        return dp[n];\n    }\n}",
      "python": "class Solution:\n    def wordBreak(self, s: str, wordDict: list[str]) -> bool:\n        words, n = set(wordDict), len(s)\n        dp = [False] * (n + 1)\n        dp[0] = True\n        max_l = max(len(w) for w in wordDict) if wordDict else 0\n        for i in range(1, n + 1):\n            for j in range(max(0, i - max_l), i):\n                if dp[j] and s[j:i] in words:\n                    dp[i] = True\n                    break\n        return dp[n]",
      "cpp": "#include <string>\n#include <vector>\n#include <unordered_set>\n#include <algorithm>\n\nclass Solution {\npublic:\n    bool wordBreak(std::string s, std::vector<std::string>& wordDict) {\n        std::unordered_set<std::string> dict(wordDict.begin(), wordDict.end());\n        int n = s.length();\n        std::vector<bool> dp(n + 1, false);\n        dp[0] = true;\n        int maxLen = 0;\n        for (const auto& w : wordDict) maxLen = std::max(maxLen, (int)w.length());\n        for (int i = 1; i <= n; i++) {\n            for (int j = std::max(0, i - maxLen); j < i; j++) {\n                if (dp[j] && dict.count(s.substr(j, i - j))) {\n                    dp[i] = true;\n                    break;\n                }\n            }\n        }\n        return dp[n];\n    }\n};",
      "javascript": "function wordBreak(s, wordDict) {\n    const words = new Set(wordDict);\n    const n = s.length;\n    const dp = new Array(n + 1).fill(false);\n    dp[0] = true;\n    let maxLen = 0;\n    for (const w of wordDict) maxLen = Math.max(maxLen, w.length);\n    for (let i = 1; i <= n; i++) {\n        for (let j = Math.max(0, i - maxLen); j < i; j++) {\n            if (dp[j] && words.has(s.substring(j, i))) {\n                dp[i] = true;\n                break;\n            }\n        }\n    }\n    return dp[n];\n}"
    },
    "approaches": {
      "brute": {
        "name": "Brute Force (Pure Recursion)",
        "tier": "brute",
        "badge": "\ud83e\udd49 Brute Force",
        "intuition": [
          "Try all prefix splits recursively."
        ],
        "timeComplexity": "O(2\u207f)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Branching without memoization re-evaluates duplicate suffixes.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public boolean wordBreakBrute(String s, List<String> wordDict) {\n        Set<String> set = new HashSet<>(wordDict);\n        return canSegment(s, 0, set);\n    }\n    private boolean canSegment(String s, int start, Set<String> dict) {\n        if (start == s.length()) return true;\n        for (int end = start + 1; end <= s.length(); end++) {\n            if (dict.contains(s.substring(start, end)) && canSegment(s, end, dict)) return true;\n        }\n        return false;\n    }\n}",
          "python": "class Solution:\n    def wordBreakBrute(self, s: str, wordDict: list[str]) -> bool:\n        words = set(wordDict)\n        def can(start):\n            if start == len(s): return True\n            for end in range(start + 1, len(s) + 1):\n                if s[start:end] in words and can(end): return True\n            return False\n        return can(0)",
          "cpp": "#include <string>\n#include <vector>\n#include <unordered_set>\n\nclass Solution {\n    bool can(const std::string& s, int start, const std::unordered_set<std::string>& dict) {\n        if (start == s.length()) return true;\n        for (int end = start + 1; end <= s.length(); end++) {\n            if (dict.count(s.substr(start, end - start)) && can(s, end, dict)) return true;\n        }\n        return false;\n    }\npublic:\n    bool wordBreakBrute(std::string s, std::vector<std::string>& wordDict) {\n        std::unordered_set<std::string> dict(wordDict.begin(), wordDict.end());\n        return can(s, 0, dict);\n    }\n};",
          "javascript": "function wordBreakBrute(s, wordDict) {\n    const words = new Set(wordDict);\n    function can(start) {\n        if (start === s.length) return true;\n        for (let end = start + 1; end <= s.length; end++) {\n            if (words.has(s.substring(start, end)) && can(end)) return true;\n        }\n        return false;\n    }\n    return can(0);\n}"
        }
      },
      "better": {
        "name": "Better (Top-Down Memoization)",
        "tier": "better",
        "badge": "\ud83e\udd48 Better",
        "intuition": [
          "Cache recursive subproblem states using a memo table."
        ],
        "timeComplexity": "O(N\u00b2)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Memo array caches solved suffixes.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public boolean wordBreakBetter(String s, List<String> wordDict) {\n        Set<String> dict = new HashSet<>(wordDict);\n        Boolean[] memo = new Boolean[s.length()];\n        return dfs(s, 0, dict, memo);\n    }\n    private boolean dfs(String s, int start, Set<String> dict, Boolean[] memo) {\n        if (start == s.length()) return true;\n        if (memo[start] != null) return memo[start];\n        for (int end = start + 1; end <= s.length(); end++) {\n            if (dict.contains(s.substring(start, end)) && dfs(s, end, dict, memo)) return memo[start] = true;\n        }\n        return memo[start] = false;\n    }\n}",
          "python": "class Solution:\n    def wordBreakBetter(self, s: str, wordDict: list[str]) -> bool:\n        words, memo = set(wordDict), {}\n        def dfs(start: int) -> bool:\n            if start == len(s): return True\n            if start in memo: return memo[start]\n            for end in range(start + 1, len(s) + 1):\n                if s[start:end] in words and dfs(end):\n                    memo[start] = True; return True\n            memo[start] = False; return False\n        return dfs(0)",
          "cpp": "#include <string>\n#include <vector>\n#include <unordered_set>\n\nclass Solution {\n    bool dfs(const std::string& s, int start, const std::unordered_set<std::string>& dict, std::vector<int>& memo) {\n        if (start == s.length()) return true;\n        if (memo[start] != -1) return memo[start];\n        for (int end = start + 1; end <= s.length(); end++) {\n            if (dict.count(s.substr(start, end - start)) && dfs(s, end, dict, memo)) return memo[start] = 1;\n        }\n        return memo[start] = 0;\n    }\npublic:\n    bool wordBreakBetter(std::string s, std::vector<std::string>& wordDict) {\n        std::unordered_set<std::string> dict(wordDict.begin(), wordDict.end());\n        std::vector<int> memo(s.length(), -1);\n        return dfs(s, 0, dict, memo);\n    }\n};",
          "javascript": "function wordBreakBetter(s, wordDict) {\n    const words = new Set(wordDict), memo = new Map();\n    function dfs(start) {\n        if (start === s.length) return true;\n        if (memo.has(start)) return memo.get(start);\n        for (let end = start + 1; end <= s.length; end++) {\n            if (words.has(s.substring(start, end)) && dfs(end)) {\n                memo.set(start, true); return true;\n            }\n        }\n        memo.set(start, false); return false;\n    }\n    return dfs(0);\n}"
        }
      },
      "optimal": {
        "name": "Optimal (1D Dynamic Programming with Hash Set)",
        "tier": "optimal",
        "badge": "\ud83e\udd47 Optimal",
        "intuition": [
          "Define dp[i] as true if prefix s[0...i-1] can be segmented into dictionary words.",
          "Base case: dp[0] = true (empty string is always valid).",
          "For each index i from 1 to n, split into prefix s[0...j-1] and suffix s[j...i-1]. If dp[j] is true and s[j...i] is in wordDict, then dp[i] = true."
        ],
        "pseudocode": [
          "FUNCTION wordBreak(s, wordDict):",
          "  dp = Array(s.length + 1, false); dp[0] = true",
          "  FOR i from 1 TO s.length:",
          "    FOR j from 0 TO i - 1:",
          "      IF dp[j] AND dict.contains(s.substring(j, i)): dp[i] = true; BREAK",
          "  RETURN dp[s.length]"
        ],
        "timeComplexity": "O(N\u00b2)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Iterating through all prefixes of length N with substring lookups in a hash set takes O(N^2) time and O(N) auxiliary space.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public boolean wordBreak(String s, List<String> wordDict) {\n        Set<String> set = new HashSet<>(wordDict);\n        int n = s.length();\n        boolean[] dp = new boolean[n + 1];\n        dp[0] = true;\n        int maxLen = 0;\n        for (String w : wordDict) maxLen = Math.max(maxLen, w.length());\n        for (int i = 1; i <= n; i++) {\n            for (int j = Math.max(0, i - maxLen); j < i; j++) {\n                if (dp[j] && set.contains(s.substring(j, i))) {\n                    dp[i] = true;\n                    break;\n                }\n            }\n        }\n        return dp[n];\n    }\n}",
          "python": "class Solution:\n    def wordBreak(self, s: str, wordDict: list[str]) -> bool:\n        words, n = set(wordDict), len(s)\n        dp = [False] * (n + 1)\n        dp[0] = True\n        max_l = max(len(w) for w in wordDict) if wordDict else 0\n        for i in range(1, n + 1):\n            for j in range(max(0, i - max_l), i):\n                if dp[j] and s[j:i] in words:\n                    dp[i] = True\n                    break\n        return dp[n]",
          "cpp": "#include <string>\n#include <vector>\n#include <unordered_set>\n#include <algorithm>\n\nclass Solution {\npublic:\n    bool wordBreak(std::string s, std::vector<std::string>& wordDict) {\n        std::unordered_set<std::string> dict(wordDict.begin(), wordDict.end());\n        int n = s.length();\n        std::vector<bool> dp(n + 1, false);\n        dp[0] = true;\n        int maxLen = 0;\n        for (const auto& w : wordDict) maxLen = std::max(maxLen, (int)w.length());\n        for (int i = 1; i <= n; i++) {\n            for (int j = std::max(0, i - maxLen); j < i; j++) {\n                if (dp[j] && dict.count(s.substr(j, i - j))) {\n                    dp[i] = true;\n                    break;\n                }\n            }\n        }\n        return dp[n];\n    }\n};",
          "javascript": "function wordBreak(s, wordDict) {\n    const words = new Set(wordDict);\n    const n = s.length;\n    const dp = new Array(n + 1).fill(false);\n    dp[0] = true;\n    let maxLen = 0;\n    for (const w of wordDict) maxLen = Math.max(maxLen, w.length);\n    for (let i = 1; i <= n; i++) {\n        for (let j = Math.max(0, i - maxLen); j < i; j++) {\n            if (dp[j] && words.has(s.substring(j, i))) {\n                dp[i] = true;\n                break;\n            }\n        }\n    }\n    return dp[n];\n}"
        }
      }
    }
  },
  "count_occurrences_2d": {
    "questionId": "archetype-count_occurrences_2d",
    "pattern": "8-Directional 2D Grid DFS Backtracking",
    "intuition": [
      "For each cell (r, c) matching word[0], check all 8 direction vectors.",
      "Verify each step word[i] stays within grid boundaries and matches the character.",
      "Increment total occurrences if all characters match."
    ],
    "pseudocode": [
      "FUNCTION countOccurrences(grid, word):",
      "  FOR r in rows, c in cols:",
      "    IF grid[r][c] == word[0]:",
      "      FOR dir in 8_dirs: IF match(r, c, dir, word): total++",
      "  RETURN total"
    ],
    "timeComplexity": "O(R * C * 8 * L)",
    "spaceComplexity": "O(1)",
    "complexityExplanation": "Searches in 8 straight directions from every cell matching word[0] without extra auxiliary storage.",
    "edgeCases": [
      "Word longer than dimensions",
      "Single letter word",
      "No match"
    ],
    "code": {
      "java": "public class Solution {\n    private static final int[] dx = {-1, -1, -1, 0, 0, 1, 1, 1};\n    private static final int[] dy = {-1, 0, 1, -1, 1, -1, 0, 1};\n    public int countOccurrences(char[][] grid, String word) {\n        if (grid == null || grid.length == 0 || word == null || word.length() == 0) return 0;\n        int rows = grid.length, cols = grid[0].length, count = 0;\n        for (int r = 0; r < rows; r++) {\n            for (int c = 0; c < cols; c++) {\n                if (grid[r][c] == word.charAt(0)) {\n                    for (int d = 0; d < 8; d++) {\n                        if (checkDir(grid, r, c, word, dx[d], dy[d])) count++;\n                    }\n                }\n            }\n        }\n        return count;\n    }\n    private boolean checkDir(char[][] grid, int r, int c, String word, int dr, int dc) {\n        int rows = grid.length, cols = grid[0].length;\n        for (int i = 0; i < word.length(); i++) {\n            int nr = r + i * dr, nc = c + i * dc;\n            if (nr < 0 || nr >= rows || nc < 0 || nc >= cols || grid[nr][nc] != word.charAt(i)) return false;\n        }\n        return true;\n    }\n}",
      "python": "class Solution:\n    def countOccurrences(self, grid: list[list[str]], word: str) -> int:\n        if not grid or not grid[0] or not word: return 0\n        R, C = len(grid), len(grid[0])\n        dirs = [(-1,-1),(-1,0),(-1,1),(0,-1),(0,1),(1,-1),(1,0),(1,1)]\n        count = 0\n        for r in range(R):\n            for c in range(C):\n                if grid[r][c] == word[0]:\n                    for dr, dc in dirs:\n                        if all(0 <= r + i*dr < R and 0 <= c + i*dc < C and grid[r + i*dr][c + i*dc] == word[i] for i in range(len(word))):\n                            count += 1\n        return count",
      "cpp": "#include <vector>\n#include <string>\n\nclass Solution {\n    const int dx[8] = {-1,-1,-1,0,0,1,1,1};\n    const int dy[8] = {-1,0,1,-1,1,-1,0,1};\npublic:\n    int countOccurrences(const std::vector<std::vector<char>>& grid, const std::string& word) {\n        if (grid.empty() || word.empty()) return 0;\n        int R = grid.size(), C = grid[0].size(), count = 0;\n        for (int r = 0; r < R; r++) {\n            for (int c = 0; c < C; c++) {\n                if (grid[r][c] == word[0]) {\n                    for (int d = 0; d < 8; d++) {\n                        bool ok = true;\n                        for (int i = 0; i < (int)word.length(); i++) {\n                            int nr = r + i * dx[d], nc = c + i * dy[d];\n                            if (nr < 0 || nr >= R || nc < 0 || nc >= C || grid[nr][nc] != word[i]) {\n                                ok = false; break;\n                            }\n                        }\n                        if (ok) count++;\n                    }\n                }\n            }\n        }\n        return count;\n    }\n};",
      "javascript": "function countOccurrences(grid, word) {\n    if (!grid || !grid.length || !word) return 0;\n    const R = grid.length, C = grid[0].length;\n    const dirs = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];\n    let count = 0;\n    for (let r = 0; r < R; r++) {\n        for (let c = 0; c < C; c++) {\n            if (grid[r][c] === word[0]) {\n                for (const [dr, dc] of dirs) {\n                    let ok = true;\n                    for (let i = 0; i < word.length; i++) {\n                        const nr = r + i*dr, nc = c + i*dc;\n                        if (nr < 0 || nr >= R || nc < 0 || nc >= C || grid[nr][nc] !== word[i]) {\n                            ok = false; break;\n                        }\n                    }\n                    if (ok) count++;\n                }\n            }\n        }\n    }\n    return count;\n}"
    },
    "approaches": {
      "brute": {
        "name": "Brute Force (String Buffer Extraction)",
        "tier": "brute",
        "badge": "\ud83e\udd49 Brute Force",
        "intuition": [
          "Construct candidate string for each direction and compare."
        ],
        "timeComplexity": "O(R * C * 8 * L)",
        "spaceComplexity": "O(L)",
        "complexityExplanation": "Extracts candidate substring into buffer and compares.",
        "code": {
          "java": "public class Solution {\n    public int countOccurrencesBrute(char[][] grid, String word) {\n        int R = grid.length, C = grid[0].length, count = 0;\n        int[] dx = {-1,-1,-1,0,0,1,1,1}, dy = {-1,0,1,-1,1,-1,0,1};\n        for (int r = 0; r < R; r++) {\n            for (int c = 0; c < C; c++) {\n                for (int d = 0; d < 8; d++) {\n                    StringBuilder sb = new StringBuilder();\n                    for (int i = 0; i < word.length(); i++) {\n                        int nr = r + i*dx[d], nc = c + i*dy[d];\n                        if (nr < 0 || nr >= R || nc < 0 || nc >= C) break;\n                        sb.append(grid[nr][nc]);\n                    }\n                    if (sb.toString().equals(word)) count++;\n                }\n            }\n        }\n        return count;\n    }\n}",
          "python": "class Solution:\n    def countOccurrencesBrute(self, grid: list[list[str]], word: str) -> int:\n        R, C, count = len(grid), len(grid[0]), 0\n        dirs = [(-1,-1),(-1,0),(-1,1),(0,-1),(0,1),(1,-1),(1,0),(1,1)]\n        for r in range(R):\n            for c in range(C):\n                for dr, dc in dirs:\n                    chars = []\n                    for i in range(len(word)):\n                        nr, nc = r + i*dr, c + i*dc\n                        if 0 <= nr < R and 0 <= nc < C: chars.append(grid[nr][nc])\n                        else: break\n                    if \"\".join(chars) == word: count += 1\n        return count",
          "cpp": "#include <vector>\n#include <string>\n\nclass Solution {\npublic:\n    int countOccurrencesBrute(const std::vector<std::vector<char>>& grid, const std::string& word) {\n        int R = grid.size(), C = grid[0].size(), count = 0;\n        int dx[8] = {-1,-1,-1,0,0,1,1,1}, dy[8] = {-1,0,1,-1,1,-1,0,1};\n        for (int r = 0; r < R; r++) {\n            for (int c = 0; c < C; c++) {\n                for (int d = 0; d < 8; d++) {\n                    std::string cand = \"\";\n                    for (int i = 0; i < (int)word.length(); i++) {\n                        int nr = r + i*dx[d], nc = c + i*dy[d];\n                        if (nr < 0 || nr >= R || nc < 0 || nc >= C) break;\n                        cand += grid[nr][nc];\n                    }\n                    if (cand == word) count++;\n                }\n            }\n        }\n        return count;\n    }\n};",
          "javascript": "function countOccurrencesBrute(grid, word) {\n    const R = grid.length, C = grid[0].length;\n    const dirs = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];\n    let count = 0;\n    for (let r = 0; r < R; r++) {\n        for (let c = 0; c < C; c++) {\n            for (const [dr, dc] of dirs) {\n                let cand = \"\";\n                for (let i = 0; i < word.length; i++) {\n                    const nr = r + i*dr, nc = c + i*dc;\n                    if (nr < 0 || nr >= R || nc < 0 || nc >= C) break;\n                    cand += grid[nr][nc];\n                }\n                if (cand === word) count++;\n            }\n        }\n    }\n    return count;\n}"
        }
      },
      "better": {
        "name": "Better (Boundary Pruned Search)",
        "tier": "better",
        "badge": "\ud83e\udd48 Better",
        "intuition": [
          "Validate endpoint coordinates before checking character by character."
        ],
        "timeComplexity": "O(R * C * 8 * L)",
        "spaceComplexity": "O(1)",
        "complexityExplanation": "Checks endpoint boundary in O(1) before looping through word characters.",
        "code": {
          "java": "public class Solution {\n    public int countOccurrencesBetter(char[][] grid, String word) {\n        int R = grid.length, C = grid[0].length, L = word.length(), count = 0;\n        int[] dx = {-1,-1,-1,0,0,1,1,1}, dy = {-1,0,1,-1,1,-1,0,1};\n        for (int r = 0; r < R; r++) {\n            for (int c = 0; c < C; c++) {\n                if (grid[r][c] != word.charAt(0)) continue;\n                for (int d = 0; d < 8; d++) {\n                    int endR = r + (L-1)*dx[d], endC = c + (L-1)*dy[d];\n                    if (endR < 0 || endR >= R || endC < 0 || endC >= C) continue;\n                    boolean ok = true;\n                    for (int i = 1; i < L; i++) {\n                        if (grid[r + i*dx[d]][c + i*dy[d]] != word.charAt(i)) { ok = false; break; }\n                    }\n                    if (ok) count++;\n                }\n            }\n        }\n        return count;\n    }\n}",
          "python": "class Solution:\n    def countOccurrencesBetter(self, grid: list[list[str]], word: str) -> int:\n        R, C, L = len(grid), len(grid[0]), len(word)\n        dirs = [(-1,-1),(-1,0),(-1,1),(0,-1),(0,1),(1,-1),(1,0),(1,1)]\n        count = 0\n        for r in range(R):\n            for c in range(C):\n                if grid[r][c] != word[0]: continue\n                for dr, dc in dirs:\n                    endR, endC = r + (L-1)*dr, c + (L-1)*dc\n                    if not (0 <= endR < R and 0 <= endC < C): continue\n                    if all(grid[r + i*dr][c + i*dc] == word[i] for i in range(1, L)): count += 1\n        return count",
          "cpp": "#include <vector>\n#include <string>\n\nclass Solution {\npublic:\n    int countOccurrencesBetter(const std::vector<std::vector<char>>& grid, const std::string& word) {\n        int R = grid.size(), C = grid[0].size(), L = word.length(), count = 0;\n        int dx[8] = {-1,-1,-1,0,0,1,1,1}, dy[8] = {-1,0,1,-1,1,-1,0,1};\n        for (int r = 0; r < R; r++) {\n            for (int c = 0; c < C; c++) {\n                if (grid[r][c] != word[0]) continue;\n                for (int d = 0; d < 8; d++) {\n                    int endR = r + (L-1)*dx[d], endC = c + (L-1)*dy[d];\n                    if (endR < 0 || endR >= R || endC < 0 || endC >= C) continue;\n                    bool ok = true;\n                    for (int i = 1; i < L; i++) {\n                        if (grid[r + i*dx[d]][c + i*dy[d]] != word[i]) { ok = false; break; }\n                    }\n                    if (ok) count++;\n                }\n            }\n        }\n        return count;\n    }\n};",
          "javascript": "function countOccurrencesBetter(grid, word) {\n    const R = grid.length, C = grid[0].length, L = word.length;\n    const dirs = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];\n    let count = 0;\n    for (let r = 0; r < R; r++) {\n        for (let c = 0; c < C; c++) {\n            if (grid[r][c] !== word[0]) continue;\n            for (const [dr, dc] of dirs) {\n                const endR = r + (L-1)*dr, endC = c + (L-1)*dc;\n                if (endR < 0 || endR >= R || endC < 0 || endC >= C) continue;\n                let ok = true;\n                for (let i = 1; i < L; i++) {\n                    if (grid[r + i*dr][c + i*dc] !== word[i]) { ok = false; break; }\n                }\n                if (ok) count++;\n            }\n        }\n    }\n    return count;\n}"
        }
      },
      "optimal": {
        "name": "Optimal (8-Directional 2D Grid DFS Backtracking)",
        "tier": "optimal",
        "badge": "\ud83e\udd47 Optimal",
        "intuition": [
          "For each cell (r, c) matching word[0], check all 8 direction vectors.",
          "Verify each step word[i] stays within grid boundaries and matches the character.",
          "Increment total occurrences if all characters match."
        ],
        "pseudocode": [
          "FUNCTION countOccurrences(grid, word):",
          "  FOR r in rows, c in cols:",
          "    IF grid[r][c] == word[0]:",
          "      FOR dir in 8_dirs: IF match(r, c, dir, word): total++",
          "  RETURN total"
        ],
        "timeComplexity": "O(R * C * 8 * L)",
        "spaceComplexity": "O(1)",
        "complexityExplanation": "Searches in 8 straight directions from every cell matching word[0] without extra auxiliary storage.",
        "code": {
          "java": "public class Solution {\n    private static final int[] dx = {-1, -1, -1, 0, 0, 1, 1, 1};\n    private static final int[] dy = {-1, 0, 1, -1, 1, -1, 0, 1};\n    public int countOccurrences(char[][] grid, String word) {\n        if (grid == null || grid.length == 0 || word == null || word.length() == 0) return 0;\n        int rows = grid.length, cols = grid[0].length, count = 0;\n        for (int r = 0; r < rows; r++) {\n            for (int c = 0; c < cols; c++) {\n                if (grid[r][c] == word.charAt(0)) {\n                    for (int d = 0; d < 8; d++) {\n                        if (checkDir(grid, r, c, word, dx[d], dy[d])) count++;\n                    }\n                }\n            }\n        }\n        return count;\n    }\n    private boolean checkDir(char[][] grid, int r, int c, String word, int dr, int dc) {\n        int rows = grid.length, cols = grid[0].length;\n        for (int i = 0; i < word.length(); i++) {\n            int nr = r + i * dr, nc = c + i * dc;\n            if (nr < 0 || nr >= rows || nc < 0 || nc >= cols || grid[nr][nc] != word.charAt(i)) return false;\n        }\n        return true;\n    }\n}",
          "python": "class Solution:\n    def countOccurrences(self, grid: list[list[str]], word: str) -> int:\n        if not grid or not grid[0] or not word: return 0\n        R, C = len(grid), len(grid[0])\n        dirs = [(-1,-1),(-1,0),(-1,1),(0,-1),(0,1),(1,-1),(1,0),(1,1)]\n        count = 0\n        for r in range(R):\n            for c in range(C):\n                if grid[r][c] == word[0]:\n                    for dr, dc in dirs:\n                        if all(0 <= r + i*dr < R and 0 <= c + i*dc < C and grid[r + i*dr][c + i*dc] == word[i] for i in range(len(word))):\n                            count += 1\n        return count",
          "cpp": "#include <vector>\n#include <string>\n\nclass Solution {\n    const int dx[8] = {-1,-1,-1,0,0,1,1,1};\n    const int dy[8] = {-1,0,1,-1,1,-1,0,1};\npublic:\n    int countOccurrences(const std::vector<std::vector<char>>& grid, const std::string& word) {\n        if (grid.empty() || word.empty()) return 0;\n        int R = grid.size(), C = grid[0].size(), count = 0;\n        for (int r = 0; r < R; r++) {\n            for (int c = 0; c < C; c++) {\n                if (grid[r][c] == word[0]) {\n                    for (int d = 0; d < 8; d++) {\n                        bool ok = true;\n                        for (int i = 0; i < (int)word.length(); i++) {\n                            int nr = r + i * dx[d], nc = c + i * dy[d];\n                            if (nr < 0 || nr >= R || nc < 0 || nc >= C || grid[nr][nc] != word[i]) {\n                                ok = false; break;\n                            }\n                        }\n                        if (ok) count++;\n                    }\n                }\n            }\n        }\n        return count;\n    }\n};",
          "javascript": "function countOccurrences(grid, word) {\n    if (!grid || !grid.length || !word) return 0;\n    const R = grid.length, C = grid[0].length;\n    const dirs = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];\n    let count = 0;\n    for (let r = 0; r < R; r++) {\n        for (let c = 0; c < C; c++) {\n            if (grid[r][c] === word[0]) {\n                for (const [dr, dc] of dirs) {\n                    let ok = true;\n                    for (let i = 0; i < word.length; i++) {\n                        const nr = r + i*dr, nc = c + i*dc;\n                        if (nr < 0 || nr >= R || nc < 0 || nc >= C || grid[nr][nc] !== word[i]) {\n                            ok = false; break;\n                        }\n                    }\n                    if (ok) count++;\n                }\n            }\n        }\n    }\n    return count;\n}"
        }
      }
    }
  },
  "longest_substring_without_repeating": {
    "questionId": "archetype-longest_substring_without_repeating",
    "pattern": "Sliding Window with Last-Seen Index Map",
    "intuition": [
      "Use two pointers (left, right) representing the current valid substring without duplicates.",
      "Maintain a map storing each character's latest observed index.",
      "When encountering s[right], if it was seen at or after left, advance left to map.get(s[right]) + 1.",
      "Update the maximum window length (right - left + 1) at each step."
    ],
    "pseudocode": [
      "FUNCTION lengthOfLongestSubstring(s):",
      "  map = new Map(); maxLen = 0; left = 0",
      "  FOR right from 0 TO s.length - 1:",
      "    IF map.has(s[right]) AND map.get(s[right]) >= left:",
      "      left = map.get(s[right]) + 1",
      "    map.set(s[right], right)",
      "    maxLen = MAX(maxLen, right - left + 1)",
      "  RETURN maxLen"
    ],
    "timeComplexity": "O(N)",
    "spaceComplexity": "O(min(N, M))",
    "complexityExplanation": "Expands right pointer while tracking each character's latest index, jumping left pointer past duplicates in O(1).",
    "edgeCases": [
      "Empty string",
      "String with all identical chars",
      "String with all distinct chars"
    ],
    "code": {
      "java": "import java.util.*;\n\npublic class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        int[] last = new int[128];\n        Arrays.fill(last, -1);\n        int maxLen = 0, left = 0;\n        for (int right = 0; right < s.length(); right++) {\n            char c = s.charAt(right);\n            if (last[c] >= left) {\n                left = last[c] + 1;\n            }\n            last[c] = right;\n            maxLen = Math.max(maxLen, right - left + 1);\n        }\n        return maxLen;\n    }\n}",
      "python": "class Solution:\n    def lengthOfLongestSubstring(self, s: str) -> int:\n        last = {}\n        max_len = left = 0\n        for right, c in enumerate(s):\n            if c in last and last[c] >= left:\n                left = last[c] + 1\n            last[c] = right\n            max_len = max(max_len, right - left + 1)\n        return max_len",
      "cpp": "#include <string>\n#include <vector>\n#include <algorithm>\n\nclass Solution {\npublic:\n    int lengthOfLongestSubstring(std::string s) {\n        std::vector<int> last(128, -1);\n        int maxLen = 0, left = 0;\n        for (int right = 0; right < (int)s.length(); right++) {\n            if (last[(unsigned char)s[right]] >= left) {\n                left = last[(unsigned char)s[right]] + 1;\n            }\n            last[(unsigned char)s[right]] = right;\n            maxLen = std::max(maxLen, right - left + 1);\n        }\n        return maxLen;\n    }\n};",
      "javascript": "function lengthOfLongestSubstring(s) {\n    const last = new Map();\n    let maxLen = 0, left = 0;\n    for (let right = 0; right < s.length; right++) {\n        const c = s[right];\n        if (last.has(c) && last.get(c) >= left) {\n            left = last.get(c) + 1;\n        }\n        last.set(c, right);\n        maxLen = Math.max(maxLen, right - left + 1);\n    }\n    return maxLen;\n}"
    },
    "approaches": {
      "brute": {
        "name": "Brute Force (Check All Substrings for Uniqueness)",
        "tier": "brute",
        "badge": "\ud83e\udd49 Brute Force",
        "intuition": [
          "Exhaustively check every substring."
        ],
        "timeComplexity": "O(N\u00b3)",
        "spaceComplexity": "O(min(N, M))",
        "complexityExplanation": "Checks all O(N\u00b2) substrings, each taking O(N) to test uniqueness.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int lengthOfLongestSubstringBrute(String s) {\n        int maxLen = 0;\n        for (int i = 0; i < s.length(); i++) {\n            for (int j = i; j < s.length(); j++) {\n                if (allUnique(s, i, j)) maxLen = Math.max(maxLen, j - i + 1);\n            }\n        }\n        return maxLen;\n    }\n    private boolean allUnique(String s, int start, int end) {\n        boolean[] seen = new boolean[128];\n        for (int k = start; k <= end; k++) {\n            if (seen[s.charAt(k)]) return false;\n            seen[s.charAt(k)] = true;\n        }\n        return true;\n    }\n}",
          "python": "class Solution:\n    def lengthOfLongestSubstringBrute(self, s: str) -> int:\n        max_len = 0\n        for i in range(len(s)):\n            for j in range(i, len(s)):\n                sub = s[i:j+1]\n                if len(sub) == len(set(sub)):\n                    max_len = max(max_len, len(sub))\n        return max_len",
          "cpp": "#include <string>\n#include <vector>\n#include <algorithm>\n\nclass Solution {\n    bool allUnique(const std::string& s, int l, int r) {\n        std::vector<bool> seen(128, false);\n        for (int i = l; i <= r; i++) {\n            if (seen[(unsigned char)s[i]]) return false;\n            seen[(unsigned char)s[i]] = true;\n        }\n        return true;\n    }\npublic:\n    int lengthOfLongestSubstringBrute(std::string s) {\n        int maxLen = 0;\n        for (int i = 0; i < (int)s.length(); i++) {\n            for (int j = i; j < (int)s.length(); j++) {\n                if (allUnique(s, i, j)) maxLen = std::max(maxLen, j - i + 1);\n            }\n        }\n        return maxLen;\n    }\n};",
          "javascript": "function lengthOfLongestSubstringBrute(s) {\n    let maxLen = 0;\n    for (let i = 0; i < s.length; i++) {\n        for (let j = i; j < s.length; j++) {\n            const sub = s.substring(i, j + 1);\n            if (new Set(sub).size === sub.length) {\n                maxLen = Math.max(maxLen, sub.length);\n            }\n        }\n    }\n    return maxLen;\n}"
        }
      },
      "better": {
        "name": "Better (Sliding Window with Hash Set)",
        "tier": "better",
        "badge": "\ud83e\udd48 Better",
        "intuition": [
          "Use a HashSet to represent current window; remove from left until duplicate is cleared."
        ],
        "timeComplexity": "O(2N) = O(N)",
        "spaceComplexity": "O(min(N, M))",
        "complexityExplanation": "Each character is visited at most twice (by left and right).",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int lengthOfLongestSubstringBetter(String s) {\n        Set<Character> set = new HashSet<>();\n        int left = 0, right = 0, maxLen = 0;\n        while (right < s.length()) {\n            if (!set.contains(s.charAt(right))) {\n                set.add(s.charAt(right++));\n                maxLen = Math.max(maxLen, set.size());\n            } else {\n                set.remove(s.charAt(left++));\n            }\n        }\n        return maxLen;\n    }\n}",
          "python": "class Solution:\n    def lengthOfLongestSubstringBetter(self, s: str) -> int:\n        seen = set()\n        l = r = max_len = 0\n        while r < len(s):\n            if s[r] not in seen:\n                seen.add(s[r])\n                r += 1\n                max_len = max(max_len, len(seen))\n            else:\n                seen.remove(s[l])\n                l += 1\n        return max_len",
          "cpp": "#include <string>\n#include <unordered_set>\n#include <algorithm>\n\nclass Solution {\npublic:\n    int lengthOfLongestSubstringBetter(std::string s) {\n        std::unordered_set<char> set;\n        int l = 0, r = 0, maxLen = 0;\n        while (r < (int)s.length()) {\n            if (set.find(s[r]) == set.end()) {\n                set.insert(s[r++]);\n                maxLen = std::max(maxLen, (int)set.size());\n            } else {\n                set.erase(s[l++]);\n            }\n        }\n        return maxLen;\n    }\n};",
          "javascript": "function lengthOfLongestSubstringBetter(s) {\n    const set = new Set();\n    let l = 0, r = 0, maxLen = 0;\n    while (r < s.length) {\n        if (!set.has(s[r])) {\n            set.add(s[r++]);\n            maxLen = Math.max(maxLen, set.size);\n        } else {\n            set.delete(s[l++]);\n        }\n    }\n    return maxLen;\n}"
        }
      },
      "optimal": {
        "name": "Optimal (Sliding Window with Last-Seen Index Map)",
        "tier": "optimal",
        "badge": "\ud83e\udd47 Optimal",
        "intuition": [
          "Use two pointers (left, right) representing the current valid substring without duplicates.",
          "Maintain a map storing each character's latest observed index.",
          "When encountering s[right], if it was seen at or after left, advance left to map.get(s[right]) + 1.",
          "Update the maximum window length (right - left + 1) at each step."
        ],
        "pseudocode": [
          "FUNCTION lengthOfLongestSubstring(s):",
          "  map = new Map(); maxLen = 0; left = 0",
          "  FOR right from 0 TO s.length - 1:",
          "    IF map.has(s[right]) AND map.get(s[right]) >= left:",
          "      left = map.get(s[right]) + 1",
          "    map.set(s[right], right)",
          "    maxLen = MAX(maxLen, right - left + 1)",
          "  RETURN maxLen"
        ],
        "timeComplexity": "O(N)",
        "spaceComplexity": "O(min(N, M))",
        "complexityExplanation": "Expands right pointer while tracking each character's latest index, jumping left pointer past duplicates in O(1).",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        int[] last = new int[128];\n        Arrays.fill(last, -1);\n        int maxLen = 0, left = 0;\n        for (int right = 0; right < s.length(); right++) {\n            char c = s.charAt(right);\n            if (last[c] >= left) {\n                left = last[c] + 1;\n            }\n            last[c] = right;\n            maxLen = Math.max(maxLen, right - left + 1);\n        }\n        return maxLen;\n    }\n}",
          "python": "class Solution:\n    def lengthOfLongestSubstring(self, s: str) -> int:\n        last = {}\n        max_len = left = 0\n        for right, c in enumerate(s):\n            if c in last and last[c] >= left:\n                left = last[c] + 1\n            last[c] = right\n            max_len = max(max_len, right - left + 1)\n        return max_len",
          "cpp": "#include <string>\n#include <vector>\n#include <algorithm>\n\nclass Solution {\npublic:\n    int lengthOfLongestSubstring(std::string s) {\n        std::vector<int> last(128, -1);\n        int maxLen = 0, left = 0;\n        for (int right = 0; right < (int)s.length(); right++) {\n            if (last[(unsigned char)s[right]] >= left) {\n                left = last[(unsigned char)s[right]] + 1;\n            }\n            last[(unsigned char)s[right]] = right;\n            maxLen = std::max(maxLen, right - left + 1);\n        }\n        return maxLen;\n    }\n};",
          "javascript": "function lengthOfLongestSubstring(s) {\n    const last = new Map();\n    let maxLen = 0, left = 0;\n    for (let right = 0; right < s.length; right++) {\n        const c = s[right];\n        if (last.has(c) && last.get(c) >= left) {\n            left = last.get(c) + 1;\n        }\n        last.set(c, right);\n        maxLen = Math.max(maxLen, right - left + 1);\n    }\n    return maxLen;\n}"
        }
      }
    }
  },
  "edit_distance": {
    "questionId": "archetype-edit_distance",
    "pattern": "2D Dynamic Programming / Space-Optimized DP",
    "intuition": [
      "If characters match, no operation is needed: dp[i][j] = dp[i-1][j-1].",
      "If characters differ, take 1 + min of: Insert (dp[i][j-1]), Delete (dp[i-1][j]), Replace (dp[i-1][j-1]).",
      "Base cases: empty string requires inserting all characters of the other string."
    ],
    "pseudocode": [
      "FUNCTION minDistance(word1, word2):",
      "  dp = 1D array of size N+1",
      "  FOR j from 0 to N: dp[j] = j",
      "  FOR i from 1 to M:",
      "    prev = dp[0]; dp[0] = i",
      "    FOR j from 1 to N:",
      "      temp = dp[j]",
      "      IF word1[i-1] == word2[j-1]: dp[j] = prev",
      "      ELSE: dp[j] = 1 + MIN(prev, dp[j], dp[j-1])",
      "      prev = temp",
      "  RETURN dp[N]"
    ],
    "timeComplexity": "O(M * N)",
    "spaceComplexity": "O(min(M, N))",
    "complexityExplanation": "Fills a 2D grid where dp[i][j] is the min edits between s1[0...i-1] and s2[0...j-1], optimized to 1D row array.",
    "edgeCases": [
      "One empty string",
      "Both empty strings",
      "Identical strings"
    ],
    "code": {
      "java": "public class Solution {\n    public int minDistance(String word1, String word2) {\n        int m = word1.length(), n = word2.length();\n        int[] dp = new int[n + 1];\n        for (int j = 0; j <= n; j++) dp[j] = j;\n        for (int i = 1; i <= m; i++) {\n            int prev = dp[0];\n            dp[0] = i;\n            for (int j = 1; j <= n; j++) {\n                int temp = dp[j];\n                if (word1.charAt(i - 1) == word2.charAt(j - 1)) {\n                    dp[j] = prev;\n                } else {\n                    dp[j] = 1 + Math.min(prev, Math.min(dp[j], dp[j - 1]));\n                }\n                prev = temp;\n            }\n        }\n        return dp[n];\n    }\n}",
      "python": "class Solution:\n    def minDistance(self, word1: str, word2: str) -> int:\n        m, n = len(word1), len(word2)\n        dp = list(range(n + 1))\n        for i in range(1, m + 1):\n            prev = dp[0]\n            dp[0] = i\n            for j in range(1, n + 1):\n                temp = dp[j]\n                if word1[i - 1] == word2[j - 1]:\n                    dp[j] = prev\n                else:\n                    dp[j] = 1 + min(prev, dp[j], dp[j - 1])\n                prev = temp\n        return dp[n]",
      "cpp": "#include <string>\n#include <vector>\n#include <algorithm>\n\nclass Solution {\npublic:\n    int minDistance(std::string word1, std::string word2) {\n        int m = word1.length(), n = word2.length();\n        std::vector<int> dp(n + 1);\n        for (int j = 0; j <= n; j++) dp[j] = j;\n        for (int i = 1; i <= m; i++) {\n            int prev = dp[0];\n            dp[0] = i;\n            for (int j = 1; j <= n; j++) {\n                int temp = dp[j];\n                if (word1[i - 1] == word2[j - 1]) {\n                    dp[j] = prev;\n                } else {\n                    dp[j] = 1 + std::min({prev, dp[j], dp[j - 1]});\n                }\n                prev = temp;\n            }\n        }\n        return dp[n];\n    }\n};",
      "javascript": "function minDistance(word1, word2) {\n    const m = word1.length, n = word2.length;\n    const dp = Array.from({length: n + 1}, (_, i) => i);\n    for (let i = 1; i <= m; i++) {\n        let prev = dp[0];\n        dp[0] = i;\n        for (let j = 1; j <= n; j++) {\n            const temp = dp[j];\n            if (word1[i - 1] === word2[j - 1]) {\n                dp[j] = prev;\n            } else {\n                dp[j] = 1 + Math.min(prev, dp[j], dp[j - 1]);\n            }\n            prev = temp;\n        }\n    }\n    return dp[n];\n}"
    },
    "approaches": {
      "brute": {
        "name": "Brute Force (Pure Exponential Recursion)",
        "tier": "brute",
        "badge": "\ud83e\udd49 Brute Force",
        "intuition": [
          "Recursive exploration of 3 operations."
        ],
        "timeComplexity": "O(3^(M+N))",
        "spaceComplexity": "O(M + N)",
        "complexityExplanation": "Branching into insert, delete, replace at each index without caching.",
        "code": {
          "java": "public class Solution {\n    public int minDistanceBrute(String word1, String word2) {\n        return helper(word1, word2, word1.length(), word2.length());\n    }\n    private int helper(String w1, String w2, int i, int j) {\n        if (i == 0) return j;\n        if (j == 0) return i;\n        if (w1.charAt(i - 1) == w2.charAt(j - 1)) return helper(w1, w2, i - 1, j - 1);\n        int insert = helper(w1, w2, i, j - 1);\n        int delete = helper(w1, w2, i - 1, j);\n        int replace = helper(w1, w2, i - 1, j - 1);\n        return 1 + Math.min(insert, Math.min(delete, replace));\n    }\n}",
          "python": "class Solution:\n    def minDistanceBrute(self, word1: str, word2: str) -> int:\n        def h(i, j):\n            if i == 0: return j\n            if j == 0: return i\n            if word1[i-1] == word2[j-1]: return h(i-1, j-1)\n            return 1 + min(h(i, j-1), h(i-1, j), h(i-1, j-1))\n        return h(len(word1), len(word2))",
          "cpp": "#include <string>\n#include <algorithm>\n\nclass Solution {\n    int h(const std::string& w1, const std::string& w2, int i, int j) {\n        if (i == 0) return j;\n        if (j == 0) return i;\n        if (w1[i-1] == w2[j-1]) return h(w1, w2, i-1, j-1);\n        return 1 + std::min({h(w1, w2, i, j-1), h(w1, w2, i-1, j), h(w1, w2, i-1, j-1)});\n    }\npublic:\n    int minDistanceBrute(std::string word1, std::string word2) {\n        return h(word1, word2, word1.length(), word2.length());\n    }\n};",
          "javascript": "function minDistanceBrute(word1, word2) {\n    function h(i, j) {\n        if (i === 0) return j;\n        if (j === 0) return i;\n        if (word1[i - 1] === word2[j - 1]) return h(i - 1, j - 1);\n        return 1 + Math.min(h(i, j - 1), h(i - 1, j), h(i - 1, j - 1));\n    }\n    return h(word1.length, word2.length);\n}"
        }
      },
      "better": {
        "name": "Better (2D DP Matrix)",
        "tier": "better",
        "badge": "\ud83e\udd48 Better",
        "intuition": [
          "2D DP grid storage."
        ],
        "timeComplexity": "O(M * N)",
        "spaceComplexity": "O(M * N)",
        "complexityExplanation": "Full M x N table with explicit state transitions.",
        "code": {
          "java": "public class Solution {\n    public int minDistanceBetter(String word1, String word2) {\n        int m = word1.length(), n = word2.length();\n        int[][] dp = new int[m + 1][n + 1];\n        for (int i = 0; i <= m; i++) dp[i][0] = i;\n        for (int j = 0; j <= n; j++) dp[0][j] = j;\n        for (int i = 1; i <= m; i++) {\n            for (int j = 1; j <= n; j++) {\n                if (word1.charAt(i - 1) == word2.charAt(j - 1)) dp[i][j] = dp[i - 1][j - 1];\n                else dp[i][j] = 1 + Math.min(dp[i - 1][j - 1], Math.min(dp[i - 1][j], dp[i][j - 1]));\n            }\n        }\n        return dp[m][n];\n    }\n}",
          "python": "class Solution:\n    def minDistanceBetter(self, word1: str, word2: str) -> int:\n        m, n = len(word1), len(word2)\n        dp = [[0] * (n + 1) for _ in range(m + 1)]\n        for i in range(m + 1): dp[i][0] = i\n        for j in range(n + 1): dp[0][j] = j\n        for i in range(1, m + 1):\n            for j in range(1, n + 1):\n                if word1[i-1] == word2[j-1]: dp[i][j] = dp[i-1][j-1]\n                else: dp[i][j] = 1 + min(dp[i-1][j-1], dp[i-1][j], dp[i][j-1])\n        return dp[m][n]",
          "cpp": "#include <string>\n#include <vector>\n#include <algorithm>\n\nclass Solution {\npublic:\n    int minDistanceBetter(std::string word1, std::string word2) {\n        int m = word1.length(), n = word2.length();\n        std::vector<std::vector<int>> dp(m + 1, std::vector<int>(n + 1));\n        for (int i = 0; i <= m; i++) dp[i][0] = i;\n        for (int j = 0; j <= n; j++) dp[0][j] = j;\n        for (int i = 1; i <= m; i++) {\n            for (int j = 1; j <= n; j++) {\n                if (word1[i-1] == word2[j-1]) dp[i][j] = dp[i-1][j-1];\n                else dp[i][j] = 1 + std::min({dp[i-1][j-1], dp[i-1][j], dp[i][j-1]});\n            }\n        }\n        return dp[m][n];\n    }\n};",
          "javascript": "function minDistanceBetter(word1, word2) {\n    const m = word1.length, n = word2.length;\n    const dp = Array.from({length: m + 1}, () => new Array(n + 1).fill(0));\n    for (let i = 0; i <= m; i++) dp[i][0] = i;\n    for (let j = 0; j <= n; j++) dp[0][j] = j;\n    for (let i = 1; i <= m; i++) {\n        for (let j = 1; j <= n; j++) {\n            if (word1[i - 1] === word2[j - 1]) dp[i][j] = dp[i - 1][j - 1];\n            else dp[i][j] = 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);\n        }\n    }\n    return dp[m][n];\n}"
        }
      },
      "optimal": {
        "name": "Optimal (2D Dynamic Programming / Space-Optimized DP)",
        "tier": "optimal",
        "badge": "\ud83e\udd47 Optimal",
        "intuition": [
          "If characters match, no operation is needed: dp[i][j] = dp[i-1][j-1].",
          "If characters differ, take 1 + min of: Insert (dp[i][j-1]), Delete (dp[i-1][j]), Replace (dp[i-1][j-1]).",
          "Base cases: empty string requires inserting all characters of the other string."
        ],
        "pseudocode": [
          "FUNCTION minDistance(word1, word2):",
          "  dp = 1D array of size N+1",
          "  FOR j from 0 to N: dp[j] = j",
          "  FOR i from 1 to M:",
          "    prev = dp[0]; dp[0] = i",
          "    FOR j from 1 to N:",
          "      temp = dp[j]",
          "      IF word1[i-1] == word2[j-1]: dp[j] = prev",
          "      ELSE: dp[j] = 1 + MIN(prev, dp[j], dp[j-1])",
          "      prev = temp",
          "  RETURN dp[N]"
        ],
        "timeComplexity": "O(M * N)",
        "spaceComplexity": "O(min(M, N))",
        "complexityExplanation": "Fills a 2D grid where dp[i][j] is the min edits between s1[0...i-1] and s2[0...j-1], optimized to 1D row array.",
        "code": {
          "java": "public class Solution {\n    public int minDistance(String word1, String word2) {\n        int m = word1.length(), n = word2.length();\n        int[] dp = new int[n + 1];\n        for (int j = 0; j <= n; j++) dp[j] = j;\n        for (int i = 1; i <= m; i++) {\n            int prev = dp[0];\n            dp[0] = i;\n            for (int j = 1; j <= n; j++) {\n                int temp = dp[j];\n                if (word1.charAt(i - 1) == word2.charAt(j - 1)) {\n                    dp[j] = prev;\n                } else {\n                    dp[j] = 1 + Math.min(prev, Math.min(dp[j], dp[j - 1]));\n                }\n                prev = temp;\n            }\n        }\n        return dp[n];\n    }\n}",
          "python": "class Solution:\n    def minDistance(self, word1: str, word2: str) -> int:\n        m, n = len(word1), len(word2)\n        dp = list(range(n + 1))\n        for i in range(1, m + 1):\n            prev = dp[0]\n            dp[0] = i\n            for j in range(1, n + 1):\n                temp = dp[j]\n                if word1[i - 1] == word2[j - 1]:\n                    dp[j] = prev\n                else:\n                    dp[j] = 1 + min(prev, dp[j], dp[j - 1])\n                prev = temp\n        return dp[n]",
          "cpp": "#include <string>\n#include <vector>\n#include <algorithm>\n\nclass Solution {\npublic:\n    int minDistance(std::string word1, std::string word2) {\n        int m = word1.length(), n = word2.length();\n        std::vector<int> dp(n + 1);\n        for (int j = 0; j <= n; j++) dp[j] = j;\n        for (int i = 1; i <= m; i++) {\n            int prev = dp[0];\n            dp[0] = i;\n            for (int j = 1; j <= n; j++) {\n                int temp = dp[j];\n                if (word1[i - 1] == word2[j - 1]) {\n                    dp[j] = prev;\n                } else {\n                    dp[j] = 1 + std::min({prev, dp[j], dp[j - 1]});\n                }\n                prev = temp;\n            }\n        }\n        return dp[n];\n    }\n};",
          "javascript": "function minDistance(word1, word2) {\n    const m = word1.length, n = word2.length;\n    const dp = Array.from({length: n + 1}, (_, i) => i);\n    for (let i = 1; i <= m; i++) {\n        let prev = dp[0];\n        dp[0] = i;\n        for (let j = 1; j <= n; j++) {\n            const temp = dp[j];\n            if (word1[i - 1] === word2[j - 1]) {\n                dp[j] = prev;\n            } else {\n                dp[j] = 1 + Math.min(prev, dp[j], dp[j - 1]);\n            }\n            prev = temp;\n        }\n    }\n    return dp[n];\n}"
        }
      }
    }
  },
  "reverse_string": {
    "questionId": "archetype-reverse_string",
    "pattern": "Two Pointers (In-place Mutation)",
    "intuition": [
      "Initialize pointer left at 0 and right at length - 1.",
      "Swap elements at left and right.",
      "Advance left and retreat right until they meet."
    ],
    "pseudocode": [
      "FUNCTION reverseString(s):",
      "  left = 0, right = s.length - 1",
      "  WHILE left < right:",
      "    swap(s[left], s[right])",
      "    left++; right--",
      "  RETURN s"
    ],
    "timeComplexity": "O(N)",
    "spaceComplexity": "O(1)",
    "complexityExplanation": "Swaps opposite elements from outer boundaries toward center in O(N/2) swaps with zero auxiliary allocation.",
    "edgeCases": [
      "Empty string / array",
      "Single char",
      "Even length",
      "Odd length"
    ],
    "code": {
      "java": "public class Solution {\n    public void reverseString(char[] s) {\n        int left = 0, right = s.length - 1;\n        while (left < right) {\n            char temp = s[left];\n            s[left] = s[right];\n            s[right] = temp;\n            left++; right--;\n        }\n    }\n}",
      "python": "class Solution:\n    def reverseString(self, s: list[str]) -> None:\n        l, r = 0, len(s) - 1\n        while l < r:\n            s[l], s[r] = s[r], s[l]\n            l += 1; r -= 1",
      "cpp": "#include <vector>\n#include <algorithm>\n\nclass Solution {\npublic:\n    void reverseString(std::vector<char>& s) {\n        int l = 0, r = s.size() - 1;\n        while (l < r) {\n            std::swap(s[l++], s[r--]);\n        }\n    }\n};",
      "javascript": "function reverseString(s) {\n    let l = 0, r = s.length - 1;\n    while (l < r) {\n        [s[l], s[r]] = [s[r], s[l]];\n        l++; r--;\n    }\n}"
    },
    "approaches": {
      "brute": {
        "name": "Brute Force (New Array Copy)",
        "tier": "brute",
        "badge": "\ud83e\udd49 Brute Force",
        "intuition": [
          "Auxiliary copy."
        ],
        "timeComplexity": "O(N)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Allocates a new auxiliary array and copies backwards.",
        "code": {
          "java": "public class Solution {\n    public void reverseStringBrute(char[] s) {\n        int n = s.length;\n        char[] temp = new char[n];\n        for (int i = 0; i < n; i++) temp[i] = s[n - 1 - i];\n        for (int i = 0; i < n; i++) s[i] = temp[i];\n    }\n}",
          "python": "class Solution:\n    def reverseStringBrute(self, s: list[str]) -> None:\n        temp = [s[len(s) - 1 - i] for i in range(len(s))]\n        for i in range(len(s)): s[i] = temp[i]",
          "cpp": "#include <vector>\n\nclass Solution {\npublic:\n    void reverseStringBrute(std::vector<char>& s) {\n        int n = s.size();\n        std::vector<char> temp(n);\n        for (int i = 0; i < n; i++) temp[i] = s[n - 1 - i];\n        for (int i = 0; i < n; i++) s[i] = temp[i];\n    }\n};",
          "javascript": "function reverseStringBrute(s) {\n    const n = s.length;\n    const temp = new Array(n);\n    for (let i = 0; i < n; i++) temp[i] = s[n - 1 - i];\n    for (let i = 0; i < n; i++) s[i] = temp[i];\n}"
        }
      },
      "better": {
        "name": "Better (Stack Buffer Reversal)",
        "tier": "better",
        "badge": "\ud83e\udd48 Better",
        "intuition": [
          "Use LIFO property of stack."
        ],
        "timeComplexity": "O(N)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Pushes all characters onto stack and pops back in reverse order.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public void reverseStringBetter(char[] s) {\n        Stack<Character> stack = new Stack<>();\n        for (char c : s) stack.push(c);\n        for (int i = 0; i < s.length; i++) s[i] = stack.pop();\n    }\n}",
          "python": "class Solution:\n    def reverseStringBetter(self, s: list[str]) -> None:\n        stack = list(s)\n        for i in range(len(s)): s[i] = stack.pop()",
          "cpp": "#include <vector>\n#include <stack>\n\nclass Solution {\npublic:\n    void reverseStringBetter(std::vector<char>& s) {\n        std::stack<char> st;\n        for (char c : s) st.push(c);\n        for (int i = 0; i < (int)s.size(); i++) {\n            s[i] = st.top(); st.pop();\n        }\n    }\n};",
          "javascript": "function reverseStringBetter(s) {\n    const stack = [...s];\n    for (let i = 0; i < s.length; i++) s[i] = stack.pop();\n}"
        }
      },
      "optimal": {
        "name": "Optimal (Two Pointers (In-place Mutation))",
        "tier": "optimal",
        "badge": "\ud83e\udd47 Optimal",
        "intuition": [
          "Initialize pointer left at 0 and right at length - 1.",
          "Swap elements at left and right.",
          "Advance left and retreat right until they meet."
        ],
        "pseudocode": [
          "FUNCTION reverseString(s):",
          "  left = 0, right = s.length - 1",
          "  WHILE left < right:",
          "    swap(s[left], s[right])",
          "    left++; right--",
          "  RETURN s"
        ],
        "timeComplexity": "O(N)",
        "spaceComplexity": "O(1)",
        "complexityExplanation": "Swaps opposite elements from outer boundaries toward center in O(N/2) swaps with zero auxiliary allocation.",
        "code": {
          "java": "public class Solution {\n    public void reverseString(char[] s) {\n        int left = 0, right = s.length - 1;\n        while (left < right) {\n            char temp = s[left];\n            s[left] = s[right];\n            s[right] = temp;\n            left++; right--;\n        }\n    }\n}",
          "python": "class Solution:\n    def reverseString(self, s: list[str]) -> None:\n        l, r = 0, len(s) - 1\n        while l < r:\n            s[l], s[r] = s[r], s[l]\n            l += 1; r -= 1",
          "cpp": "#include <vector>\n#include <algorithm>\n\nclass Solution {\npublic:\n    void reverseString(std::vector<char>& s) {\n        int l = 0, r = s.size() - 1;\n        while (l < r) {\n            std::swap(s[l++], s[r--]);\n        }\n    }\n};",
          "javascript": "function reverseString(s) {\n    let l = 0, r = s.length - 1;\n    while (l < r) {\n        [s[l], s[r]] = [s[r], s[l]];\n        l++; r--;\n    }\n}"
        }
      }
    }
  }
};
