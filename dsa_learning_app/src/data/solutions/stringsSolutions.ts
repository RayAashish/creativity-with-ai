import { ProblemSolution } from '../../types/dsa';

export const STRINGS_SOLUTIONS: Record<string, ProblemSolution> = {
  'str-1': {
    questionId: 'str-1',
    pattern: 'Two Pointers (In-place Character Swap)',
    intuition: [
      'In-place string reversal requires modifying the character array from both ends.',
      'Place `left = 0` and `right = s.length - 1`.',
      'Swap `s[left]` and `s[right]`, advancing `left` and decrementing `right` until they cross.',
      'Time complexity is O(N) with O(1) auxiliary space.'
    ],
    pseudocode: [
      'FUNCTION reverseString(s):',
      '  left = 0, right = s.length - 1',
      '  WHILE left < right:',
      '    SWAP(s[left], s[right])',
      '    left++, right--',
      '  RETURN s'
    ],
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(1)',
    complexityExplanation: 'Exactly N/2 swaps in-place.',
    edgeCases: ['Single character string', 'Even length string', 'Odd length string'],
    code: {
      cpp: `// C++ In-place String Reversal
#include <vector>
#include <algorithm>

void reverseString(std::vector<char>& s) {
    int left = 0, right = s.size() - 1;
    while (left < right) {
        std::swap(s[left++], s[right--]);
    }
}`,
      java: `// Java In-place Character Array Reversal
public class Solution {
    public void reverseString(char[] s) {
        int left = 0, right = s.length - 1;
        while (left < right) {
            char temp = s[left];
            s[left++] = s[right];
            s[right--] = temp;
        }
    }
}`,
      python: `# Python In-place List Reversal
def reverseString(s: list[str]) -> None:
    left, right = 0, len(s) - 1
    while left < right:
        s[left], s[right] = s[right], s[left]
        left += 1
        right -= 1`,
      javascript: `// JavaScript In-place Character Array Reversal
function reverseString(s) {
  let left = 0, right = s.length - 1;
  while (left < right) {
    [s[left], s[right]] = [s[right], s[left]];
    left++;
    right--;
  }
}`
    },
    interviewProTips: [
      'Be clear whether input is string or char[]. In Python and Java, strings are immutable, so char array or list is passed on LeetCode.'
    ]
  },

  'str-2': {
    questionId: 'str-2',
    pattern: 'Two Pointers (Alpha-Numeric Filter)',
    intuition: [
      'A phrase is a palindrome if it reads the same forwards and backwards after converting all uppercase letters to lowercase and removing all non-alphanumeric characters.',
      'Use two pointers starting at opposite ends.',
      'Skip non-alphanumeric characters using `isalnum()` / regex check.',
      'Compare lowercased characters; if any mismatch, immediately return false.'
    ],
    pseudocode: [
      'FUNCTION isPalindrome(s):',
      '  left = 0, right = s.length - 1',
      '  WHILE left < right:',
      '    WHILE left < right AND NOT isAlphaNumeric(s[left]): left++',
      '    WHILE left < right AND NOT isAlphaNumeric(s[right]): right--',
      '    IF toLower(s[left]) != toLower(s[right]): RETURN false',
      '    left++, right--',
      '  RETURN true'
    ],
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(1)',
    complexityExplanation: 'Single pass inspecting each character at most twice without allocating new strings.',
    edgeCases: ['Empty string or whitespace only', 'String with no alphanumeric characters', 'Case-insensitive matches'],
    code: {
      cpp: `// C++ Valid Palindrome
#include <string>
#include <cctype>

bool isPalindrome(std::string s) {
    int left = 0, right = s.size() - 1;
    while (left < right) {
        while (left < right && !isalnum(s[left])) left++;
        while (left < right && !isalnum(s[right])) right--;
        if (tolower(s[left]) != tolower(s[right])) return false;
        left++;
        right--;
    }
    return true;
}`,
      java: `// Java Valid Palindrome
public class Solution {
    public boolean isPalindrome(String s) {
        int left = 0, right = s.length() - 1;
        while (left < right) {
            while (left < right && !Character.isLetterOrDigit(s.charAt(left))) left++;
            while (left < right && !Character.isLetterOrDigit(s.charAt(right))) right--;
            if (Character.toLowerCase(s.charAt(left)) != Character.toLowerCase(s.charAt(right))) {
                return false;
            }
            left++;
            right--;
        }
        return true;
    }
}`,
      python: `# Python Valid Palindrome
def isPalindrome(s: str) -> bool:
    left, right = 0, len(s) - 1
    while left < right:
        while left < right and not s[left].isalnum():
            left += 1
        while left < right and not s[right].isalnum():
            right -= 1
        if s[left].lower() != s[right].lower():
            return False
        left += 1
        right -= 1
    return True`,
      javascript: `// JavaScript Valid Palindrome
function isPalindrome(s) {
  let left = 0, right = s.length - 1;
  const isAlphaNum = (ch) => /[a-zA-Z0-9]/.test(ch);

  while (left < right) {
    while (left < right && !isAlphaNum(s[left])) left++;
    while (left < right && !isAlphaNum(s[right])) right--;
    if (s[left].toLowerCase() !== s[right].toLowerCase()) return false;
    left++;
    right--;
  }
  return true;
}`
    },
    interviewProTips: [
      'Avoid regex `.replaceAll()` or `.split().reverse().join()` because creating a filtered copy consumes O(N) auxiliary space. In-place two pointers demonstrate mastery of O(1) space constraints.'
    ]
  },

  'str-4': {
    questionId: 'str-4',
    pattern: 'Expand Around Center',
    intuition: [
      'A palindrome mirrors around its center. A string of length N has 2N - 1 possible centers (N single-character centers for odd palindromes, and N-1 between-character centers for even palindromes).',
      'For each center `i`, expand outwards `(left--, right++)` while characters match.',
      'Track the longest palindromic substring discovered.',
      'This achieves O(N^2) time and optimal O(1) space, outperforming DP table approaches that allocate O(N^2) memory.'
    ],
    pseudocode: [
      'FUNCTION longestPalindrome(s):',
      '  start = 0, maxLen = 0',
      '  FOR i from 0 TO s.length - 1:',
      '    len1 = expandAroundCenter(s, i, i)     // Odd length',
      '    len2 = expandAroundCenter(s, i, i + 1) // Even length',
      '    currMax = MAX(len1, len2)',
      '    IF currMax > maxLen:',
      '      maxLen = currMax',
      '      start = i - (currMax - 1) / 2',
      '  RETURN s.substring(start, start + maxLen)'
    ],
    timeComplexity: 'O(N²)',
    spaceComplexity: 'O(1)',
    complexityExplanation: 'Expanding each center takes O(N) in worst case (e.g. "aaaaa"), total O(N^2) with zero extra space.',
    edgeCases: ['Single character', 'Entire string is palindrome', 'Even length palindrome like "abba"'],
    code: {
      cpp: `// C++ Expand Around Center
#include <string>
#include <algorithm>

class Solution {
    int expand(const std::string& s, int left, int right) {
        while (left >= 0 && right < s.size() && s[left] == s[right]) {
            left--;
            right++;
        }
        return right - left - 1;
    }
public:
    std::string longestPalindrome(std::string s) {
        if (s.empty()) return "";
        int start = 0, maxLen = 0;
        for (int i = 0; i < s.size(); ++i) {
            int len1 = expand(s, i, i);
            int len2 = expand(s, i, i + 1);
            int len = std::max(len1, len2);
            if (len > maxLen) {
                maxLen = len;
                start = i - (len - 1) / 2;
            }
        }
        return s.substr(start, maxLen);
    }
};`,
      java: `// Java Expand Around Center
public class Solution {
    private int expand(String s, int left, int right) {
        while (left >= 0 && right < s.length() && s.charAt(left) == s.charAt(right)) {
            left--;
            right++;
        }
        return right - left - 1;
    }

    public String longestPalindrome(String s) {
        if (s == null || s.length() < 1) return "";
        int start = 0, maxLen = 0;
        for (int i = 0; i < s.length(); i++) {
            int len1 = expand(s, i, i);
            int len2 = expand(s, i, i + 1);
            int len = Math.max(len1, len2);
            if (len > maxLen) {
                maxLen = len;
                start = i - (len - 1) / 2;
            }
        }
        return s.substring(start, start + maxLen);
    }
}`,
      python: `# Python Expand Around Center
class Solution:
    def longestPalindrome(self, s: str) -> str:
        if not s:
            return ""
            
        def expand(left: int, right: int) -> tuple[int, int]:
            while left >= 0 and right < len(s) and s[left] == s[right]:
                left -= 1
                right += 1
            return left + 1, right - 1

        start, end = 0, 0
        for i in range(len(s)):
            l1, r1 = expand(i, i)
            l2, r2 = expand(i, i + 1)
            if r1 - l1 > end - start:
                start, end = l1, r1
            if r2 - l2 > end - start:
                start, end = l2, r2
                
        return s[start:end + 1]`,
      javascript: `// JavaScript Expand Around Center
function longestPalindrome(s) {
  if (!s || s.length < 1) return "";
  let start = 0, maxLen = 0;

  function expand(left, right) {
    while (left >= 0 && right < s.length && s[left] === s[right]) {
      left--;
      right++;
    }
    return right - left - 1;
  }

  for (let i = 0; i < s.length; i++) {
    const len1 = expand(i, i);
    const len2 = expand(i, i + 1);
    const len = Math.max(len1, len2);
    if (len > maxLen) {
      maxLen = len;
      start = i - Math.floor((len - 1) / 2);
    }
  }
  return s.substring(start, start + maxLen);
}`
    },
    interviewProTips: [
      'Mention Manacher\'s algorithm exists for O(N) linear time, but Expand Around Center in O(N^2) and O(1) space is the expected, cleanest implementation in a 45-minute technical interview.'
    ]
  },
'str-17': {
    questionId: 'str-17',
    pattern: '1D Dynamic Programming with Hash Set',
    intuition: [
      'Define dp[i] as true if the prefix s[0...i-1] can be segmented into dictionary words.',
      'Base case: dp[0] = true (empty string is always valid).',
      'For each index i from 1 to n, split into prefix s[0...j-1] and suffix s[j...i-1]. If dp[j] is true and s[j...i] is in wordDict, then dp[i] = true.',
      'We can bound j by the maximum word length in wordDict to achieve O(N * maxWordLen) instead of O(N^2).'
    ],
    pseudocode: [
      'FUNCTION wordBreak(s, wordDict):',
      '  dict = Set(wordDict)',
      '  n = s.length',
      '  dp = Array(n + 1, false)',
      '  dp[0] = true',
      '  FOR i from 1 TO n:',
      '    FOR j from 0 TO i - 1:',
      '      IF dp[j] AND dict.contains(s.substring(j, i)):',
      '        dp[i] = true',
      '        BREAK',
      '  RETURN dp[n]'
    ],
    timeComplexity: 'O(N²)',
    spaceComplexity: 'O(N)',
    complexityExplanation: 'Iterating through all prefixes of length N with substring lookups in a hash set takes O(N^2) time and O(N) auxiliary space for the DP array.',
    edgeCases: ['Empty string', 'Single character matching dictionary', 'No segmentation possible', 'Repeated words in dictionary'],
    code: {
      cpp: `// C++ Optimal 1D DP Solution for Word Break
#include <string>
#include <vector>
#include <unordered_set>
#include <algorithm>

class Solution {
public:
    bool wordBreak(std::string s, std::vector<std::string>& wordDict) {
        std::unordered_set<std::string> dict(wordDict.begin(), wordDict.end());
        int n = s.length();
        int maxLen = 0;
        for (const auto& w : wordDict) maxLen = std::max(maxLen, (int)w.length());

        std::vector<bool> dp(n + 1, false);
        dp[0] = true;

        for (int i = 1; i <= n; i++) {
            for (int j = std::max(0, i - maxLen); j < i; j++) {
                if (dp[j] && dict.count(s.substr(j, i - j))) {
                    dp[i] = true;
                    break;
                }
            }
        }
        return dp[n];
    }
};`,
      java: `// Java Optimal 1D DP Solution for Word Break
import java.util.*;

class Solution {
    public boolean wordBreak(String s, List<String> wordDict) {
        Set<String> dict = new HashSet<>(wordDict);
        int n = s.length();
        int maxLen = 0;
        for (String w : wordDict) maxLen = Math.max(maxLen, w.length());

        boolean[] dp = new boolean[n + 1];
        dp[0] = true;

        for (int i = 1; i <= n; i++) {
            for (int j = Math.max(0, i - maxLen); j < i; j++) {
                if (dp[j] && dict.contains(s.substring(j, i))) {
                    dp[i] = true;
                    break;
                }
            }
        }
        return dp[n];
    }
}`,
      python: `# Python Optimal 1D DP Solution for Word Break
class Solution:
    def wordBreak(self, s: str, wordDict: list[str]) -> bool:
        word_set = set(wordDict)
        n = len(s)
        max_len = max(len(w) for w in wordDict) if wordDict else 0
        dp = [False] * (n + 1)
        dp[0] = True

        for i in range(1, n + 1):
            for j in range(max(0, i - max_len), i):
                if dp[j] and s[j:i] in word_set:
                    dp[i] = True
                    break
        return dp[n]`,
      javascript: `// JavaScript Optimal 1D DP Solution for Word Break
function wordBreak(s, wordDict) {
  const dict = new Set(wordDict);
  const n = s.length;
  let maxLen = 0;
  for (const w of wordDict) maxLen = Math.max(maxLen, w.length);

  const dp = new Array(n + 1).fill(false);
  dp[0] = true;

  for (let i = 1; i <= n; i++) {
    for (let j = Math.max(0, i - maxLen); j < i; j++) {
      if (dp[j] && dict.has(s.substring(j, i))) {
        dp[i] = true;
        break;
      }
    }
  }
  return dp[n];
}`
    },
    approaches: {
      brute: {
        name: 'Brute Force (Recursive Backtracking)',
        tier: 'brute',
        badge: '🥉 Brute Force',
        intuition: [
          'Recursively check every possible prefix of s.',
          'If the prefix exists in wordDict, recursively solve for the remaining suffix.',
          'Without memoization, overlapping subproblems cause exponential O(2^N) time complexity.'
        ],
        timeComplexity: 'O(2^N)',
        spaceComplexity: 'O(N)',
        complexityExplanation: 'In the worst case (e.g. s = "aaaaab" and wordDict = ["a", "aa", ...]), the recursion tree has depth N with branching at every step.',
        code: {
          cpp: `// C++ Brute Force Recursion
#include <string>
#include <vector>
#include <unordered_set>

class Solution {
    bool canSegment(const std::string& s, int start, const std::unordered_set<std::string>& dict) {
        if (start == s.length()) return true;
        for (int end = start + 1; end <= s.length(); end++) {
            if (dict.count(s.substr(start, end - start)) && canSegment(s, end, dict)) {
                return true;
            }
        }
        return false;
    }
public:
    bool wordBreakBrute(std::string s, std::vector<std::string>& wordDict) {
        std::unordered_set<std::string> dict(wordDict.begin(), wordDict.end());
        return canSegment(s, 0, dict);
    }
};`,
          java: `// Java Brute Force Recursion
import java.util.*;

class Solution {
    public boolean wordBreakBrute(String s, List<String> wordDict) {
        Set<String> dict = new HashSet<>(wordDict);
        return canSegment(s, 0, dict);
    }

    private boolean canSegment(String s, int start, Set<String> dict) {
        if (start == s.length()) return true;
        for (int end = start + 1; end <= s.length(); end++) {
            if (dict.contains(s.substring(start, end))) {
                if (canSegment(s, end, dict)) return true;
            }
        }
        return false;
    }
}`,
          python: `# Python Brute Force Recursion
class Solution:
    def wordBreakBrute(self, s: str, wordDict: list[str]) -> bool:
        dict_set = set(wordDict)
        def can_segment(start: int) -> bool:
            if start == len(s):
                return True
            for end in range(start + 1, len(s) + 1):
                if s[start:end] in dict_set and can_segment(end):
                    return True
            return False
        return can_segment(0)`,
          javascript: `// JavaScript Brute Force Recursion
function wordBreakBrute(s, wordDict) {
  const dict = new Set(wordDict);
  function canSegment(start) {
    if (start === s.length) return true;
    for (let end = start + 1; end <= s.length; end++) {
      if (dict.has(s.substring(start, end)) && canSegment(end)) {
        return true;
      }
    }
    return false;
  }
  return canSegment(0);
}`
        }
      },
      better: {
        name: 'Better (Top-Down Memoized DFS)',
        tier: 'better',
        badge: '🥈 Better (Memoized)',
        intuition: [
          'Add a memoization table (Map or Array) to cache results for index start.',
          'Once a suffix s[start...] is determined to be non-segmentable, never recompute it.',
          'Reduces time from exponential O(2^N) down to polynomial O(N^2).'
        ],
        timeComplexity: 'O(N²)',
        spaceComplexity: 'O(N)',
        complexityExplanation: 'There are N unique states (indices 0 to N-1). Each state evaluates at most N substrings.',
        code: {
          cpp: `// C++ Top-Down Memoized DFS
#include <string>
#include <vector>
#include <unordered_set>
#include <vector>

class Solution {
    bool dfs(const std::string& s, int start, const std::unordered_set<std::string>& dict, std::vector<int>& memo) {
        if (start == s.length()) return true;
        if (memo[start] != -1) return memo[start];

        for (int end = start + 1; end <= s.length(); end++) {
            if (dict.count(s.substr(start, end - start)) && dfs(s, end, dict, memo)) {
                return memo[start] = 1;
            }
        }
        return memo[start] = 0;
    }
public:
    bool wordBreakBetter(std::string s, std::vector<std::string>& wordDict) {
        std::unordered_set<std::string> dict(wordDict.begin(), wordDict.end());
        std::vector<int> memo(s.length(), -1);
        return dfs(s, 0, dict, memo);
    }
};`,
          java: `// Java Top-Down Memoized DFS
import java.util.*;

class Solution {
    public boolean wordBreakBetter(String s, List<String> wordDict) {
        Set<String> dict = new HashSet<>(wordDict);
        Boolean[] memo = new Boolean[s.length()];
        return dfs(s, 0, dict, memo);
    }

    private boolean dfs(String s, int start, Set<String> dict, Boolean[] memo) {
        if (start == s.length()) return true;
        if (memo[start] != null) return memo[start];

        for (int end = start + 1; end <= s.length(); end++) {
            if (dict.contains(s.substring(start, end)) && dfs(s, end, dict, memo)) {
                return memo[start] = true;
            }
        }
        return memo[start] = false;
    }
}`,
          python: `# Python Top-Down Memoized DFS
from functools import lru_cache

class Solution:
    def wordBreakBetter(self, s: str, wordDict: list[str]) -> bool:
        dict_set = set(wordDict)
        @lru_cache(None)
        def dfs(start: int) -> bool:
            if start == len(s):
                return True
            for end in range(start + 1, len(s) + 1):
                if s[start:end] in dict_set and dfs(end):
                    return True
            return False
        return dfs(0)`,
          javascript: `// JavaScript Top-Down Memoized DFS
function wordBreakBetter(s, wordDict) {
  const dict = new Set(wordDict);
  const memo = new Map();

  function dfs(start) {
    if (start === s.length) return true;
    if (memo.has(start)) return memo.get(start);

    for (let end = start + 1; end <= s.length; end++) {
      if (dict.has(s.substring(start, end)) && dfs(end)) {
        memo.set(start, true);
        return true;
      }
    }
    memo.set(start, false);
    return false;
  }
  return dfs(0);
}`
        }
      },
      optimal: {
        name: 'Optimal (1D DP with Max Length Pruning)',
        tier: 'optimal',
        badge: '🥇 Optimal',
        intuition: [
          'Iterate bottom-up from length 1 to n.',
          'Prune inner loop by maximum dictionary word length: only check j in [i - maxWordLen, i).',
          'Linear memory O(N) and optimal runtime.'
        ],
        timeComplexity: 'O(N * maxWordLen)',
        spaceComplexity: 'O(N)',
        complexityExplanation: 'Pruning inner loop ensures inner comparisons never exceed the longest dictionary word length.',
        code: {
          cpp: `// C++ Optimal 1D DP Solution for Word Break
#include <string>
#include <vector>
#include <unordered_set>
#include <algorithm>

class Solution {
public:
    bool wordBreak(std::string s, std::vector<std::string>& wordDict) {
        std::unordered_set<std::string> dict(wordDict.begin(), wordDict.end());
        int n = s.length();
        int maxLen = 0;
        for (const auto& w : wordDict) maxLen = std::max(maxLen, (int)w.length());

        std::vector<bool> dp(n + 1, false);
        dp[0] = true;

        for (int i = 1; i <= n; i++) {
            for (int j = std::max(0, i - maxLen); j < i; j++) {
                if (dp[j] && dict.count(s.substr(j, i - j))) {
                    dp[i] = true;
                    break;
                }
            }
        }
        return dp[n];
    }
};`,
          java: `// Java Optimal 1D DP Solution for Word Break
import java.util.*;

class Solution {
    public boolean wordBreak(String s, List<String> wordDict) {
        Set<String> dict = new HashSet<>(wordDict);
        int n = s.length();
        int maxLen = 0;
        for (String w : wordDict) maxLen = Math.max(maxLen, w.length());

        boolean[] dp = new boolean[n + 1];
        dp[0] = true;

        for (int i = 1; i <= n; i++) {
            for (int j = Math.max(0, i - maxLen); j < i; j++) {
                if (dp[j] && dict.contains(s.substring(j, i))) {
                    dp[i] = true;
                    break;
                }
            }
        }
        return dp[n];
    }
}`,
          python: `# Python Optimal 1D DP Solution for Word Break
class Solution:
    def wordBreak(self, s: str, wordDict: list[str]) -> bool:
        word_set = set(wordDict)
        n = len(s)
        max_len = max(len(w) for w in wordDict) if wordDict else 0
        dp = [False] * (n + 1)
        dp[0] = True

        for i in range(1, n + 1):
            for j in range(max(0, i - max_len), i):
                if dp[j] and s[j:i] in word_set:
                    dp[i] = True
                    break
        return dp[n]`,
          javascript: `// JavaScript Optimal 1D DP Solution for Word Break
function wordBreak(s, wordDict) {
  const dict = new Set(wordDict);
  const n = s.length;
  let maxLen = 0;
  for (const w of wordDict) maxLen = Math.max(maxLen, w.length);

  const dp = new Array(n + 1).fill(false);
  dp[0] = true;

  for (let i = 1; i <= n; i++) {
    for (let j = Math.max(0, i - maxLen); j < i; j++) {
      if (dp[j] && dict.has(s.substring(j, i))) {
        dp[i] = true;
        break;
      }
    }
  }
  return dp[n];
}`
        }
      }
    }
  },

  'str-23': {
    questionId: 'str-23',
    pattern: '8-Directional 2D Grid DFS Backtracking',
    intuition: [
      'We need to count how many times a given word appears in a 2D grid in any of the 8 straight directions (horizontal, vertical, diagonal).',
      'For every cell (r, c) matching word[0], explore all 8 directional vectors.',
      'Check sequentially if subsequent characters word[1...k-1] match in that direction without stepping out of grid boundaries.',
      'Total occurrences across all cells and directions is returned.'
    ],
    pseudocode: [
      'FUNCTION countOccurrences(grid, word):',
      '  dirs = 8 direction vectors (dx, dy)',
      '  total = 0',
      '  FOR r from 0 TO rows - 1:',
      '    FOR c from 0 TO cols - 1:',
      '      IF grid[r][c] == word[0]:',
      '        FOR EACH dir IN dirs:',
      '          IF matchStraightLine(grid, r, c, word, dir):',
      '            total++',
      '  RETURN total'
    ],
    timeComplexity: 'O(R * C * 8 * L)',
    spaceComplexity: 'O(1)',
    complexityExplanation: 'There are R * C cells. For each, we check up to 8 directions of length L (length of word). Space is O(1) auxiliary.',
    edgeCases: ['Word length greater than matrix dimensions', 'Single-letter word', 'Word not present in grid', '1x1 matrix'],
    code: {
      cpp: `// C++ 8-Directional Search in 2D Character Array
#include <vector>
#include <string>

class Solution {
    const int dx[8] = {-1, -1, -1, 0, 0, 1, 1, 1};
    const int dy[8] = {-1, 0, 1, -1, 1, -1, 0, 1};

    bool match(const std::vector<std::vector<char>>& grid, int r, int c, const std::string& word, int dir) {
        int rows = grid.size(), cols = grid[0].size();
        for (int k = 0; k < word.length(); k++) {
            if (r < 0 || r >= rows || c < 0 || c >= cols || grid[r][c] != word[k]) {
                return false;
            }
            r += dx[dir];
            c += dy[dir];
        }
        return true;
    }
public:
    int countOccurrences(std::vector<std::vector<char>>& grid, std::string word) {
        if (grid.empty() || word.empty()) return 0;
        int rows = grid.size(), cols = grid[0].size();
        int count = 0;

        for (int i = 0; i < rows; i++) {
            for (int j = 0; j < cols; j++) {
                if (grid[i][j] == word[0]) {
                    for (int d = 0; d < 8; d++) {
                        if (match(grid, i, j, word, d)) count++;
                    }
                }
            }
        }
        return count;
    }
};`,
      java: `// Java 8-Directional Search in 2D Character Array
class Solution {
    private static final int[] DX = {-1, -1, -1, 0, 0, 1, 1, 1};
    private static final int[] DY = {-1, 0, 1, -1, 1, -1, 0, 1};

    public int countOccurrences(char[][] grid, String word) {
        if (grid == null || grid.length == 0 || word == null || word.length() == 0) return 0;
        int rows = grid.length, cols = grid[0].length;
        int count = 0;

        for (int i = 0; i < rows; i++) {
            for (int j = 0; j < cols; j++) {
                if (grid[i][j] == word.charAt(0)) {
                    for (int dir = 0; dir < 8; dir++) {
                        if (matchPath(grid, i, j, word, dir)) {
                            count++;
                        }
                    }
                }
            }
        }
        return count;
    }

    private boolean matchPath(char[][] grid, int r, int c, String word, int dir) {
        int rows = grid.length, cols = grid[0].length;
        for (int k = 0; k < word.length(); k++) {
            if (r < 0 || r >= rows || c < 0 || c >= cols || grid[r][c] != word.charAt(k)) {
                return false;
            }
            r += DX[dir];
            c += DY[dir];
        }
        return true;
    }
}`,
      python: `# Python 8-Directional Search in 2D Character Array
class Solution:
    DX = [-1, -1, -1, 0, 0, 1, 1, 1]
    DY = [-1, 0, 1, -1, 1, -1, 0, 1]

    def countOccurrences(self, grid: list[list[str]], word: str) -> int:
        if not grid or not word:
            return 0
        rows, cols = len(grid), len(grid[0])
        count = 0

        def match(r: int, c: int, d: int) -> bool:
            for k in range(len(word)):
                if not (0 <= r < rows and 0 <= c < cols) or grid[r][c] != word[k]:
                    return False
                r += self.DX[d]
                c += self.DY[d]
            return True

        for i in range(rows):
            for j in range(cols):
                if grid[i][j] == word[0]:
                    for d in range(8):
                        if match(i, j, d):
                            count += 1
        return count`,
      javascript: `// JavaScript 8-Directional Search in 2D Character Array
function countOccurrences(grid, word) {
  if (!grid || grid.length === 0 || !word) return 0;
  const rows = grid.length, cols = grid[0].length;
  const dx = [-1, -1, -1, 0, 0, 1, 1, 1];
  const dy = [-1, 0, 1, -1, 1, -1, 0, 1];
  let count = 0;

  function match(r, c, dir) {
    for (let k = 0; k < word.length; k++) {
      if (r < 0 || r >= rows || c < 0 || c >= cols || grid[r][c] !== word[k]) {
        return false;
      }
      r += dx[dir];
      c += dy[dir];
    }
    return true;
  }

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (grid[i][j] === word[0]) {
        for (let d = 0; d < 8; d++) {
          if (match(i, j, d)) count++;
        }
      }
    }
  }
  return count;
}`
    },
    approaches: {
      brute: {
        name: 'Brute Force (Exhaustive Scan Across 8 Directions)',
        tier: 'brute',
        badge: '🥉 Brute Force',
        intuition: [
          'Scan every cell in the grid.',
          'From each cell, test all 8 directions character by character.',
          'This is already an O(R * C * 8 * L) approach with O(1) auxiliary space.'
        ],
        timeComplexity: 'O(R * C * 8 * L)',
        spaceComplexity: 'O(1)',
        complexityExplanation: 'Tests each candidate cell in all 8 directions linearly.',
        code: {
          cpp: `// C++ Brute Force Direct 8-Direction Search
#include <vector>
#include <string>

class Solution {
public:
    int countOccurrencesBrute(std::vector<std::vector<char>>& grid, std::string word) {
        int r = grid.size(), c = grid[0].size(), len = word.length();
        int ans = 0;
        int dx[8] = {-1,-1,-1,0,0,1,1,1}, dy[8] = {-1,0,1,-1,1,-1,0,1};

        for (int i = 0; i < r; i++) {
            for (int j = 0; j < c; j++) {
                for (int d = 0; d < 8; d++) {
                    bool ok = true;
                    for (int k = 0; k < len; k++) {
                        int ni = i + k * dx[d], nj = j + k * dy[d];
                        if (ni < 0 || ni >= r || nj < 0 || nj >= c || grid[ni][nj] != word[k]) {
                            ok = false;
                            break;
                        }
                    }
                    if (ok) ans++;
                }
            }
        }
        return ans;
    }
};`,
          java: `// Java Brute Force Direct 8-Direction Search
class Solution {
    public int countOccurrencesBrute(char[][] grid, String word) {
        int r = grid.length, c = grid[0].length, len = word.length();
        int ans = 0;
        int[][] dirs = {{-1,-1},{-1,0},{-1,1},{0,-1},{0,1},{1,-1},{1,0},{1,1}};

        for (int i = 0; i < r; i++) {
            for (int j = 0; j < c; j++) {
                for (int[] d : dirs) {
                    boolean ok = true;
                    for (int k = 0; k < len; k++) {
                        int ni = i + k * d[0], nj = j + k * d[1];
                        if (ni < 0 || ni >= r || nj < 0 || nj >= c || grid[ni][nj] != word.charAt(k)) {
                            ok = false;
                            break;
                        }
                    }
                    if (ok) ans++;
                }
            }
        }
        return ans;
    }
}`,
          python: `# Python Brute Force Direct 8-Direction Search
class Solution:
    def countOccurrencesBrute(self, grid: list[list[str]], word: str) -> int:
        r, c, l = len(grid), len(grid[0]), len(word)
        dirs = [(-1,-1),(-1,0),(-1,1),(0,-1),(0,1),(1,-1),(1,0),(1,1)]
        ans = 0
        for i in range(r):
            for j in range(c):
                for dr, dc in dirs:
                    if all(0 <= i + k*dr < r and 0 <= j + k*dc < c and grid[i + k*dr][j + k*dc] == word[k] for k in range(l)):
                        ans += 1
        return ans`,
          javascript: `// JavaScript Brute Force Direct 8-Direction Search
function countOccurrencesBrute(grid, word) {
  const r = grid.length, c = grid[0].length, len = word.length;
  const dirs = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
  let ans = 0;

  for (let i = 0; i < r; i++) {
    for (let j = 0; j < c; j++) {
      for (const [dr, dc] of dirs) {
        let ok = true;
        for (let k = 0; k < len; k++) {
          const ni = i + k * dr, nj = j + k * dc;
          if (ni < 0 || ni >= r || nj < 0 || nj >= c || grid[ni][nj] !== word[k]) {
            ok = false;
            break;
          }
        }
        if (ok) ans++;
      }
    }
  }
  return ans;
}`
        }
      },
      better: {
        name: 'Better (Early Exit Directional DFS)',
        tier: 'better',
        badge: '🥈 Better',
        intuition: [
          'Pre-filter starting points by matching grid[r][c] == word[0] before exploring.',
          'Abort immediately on character mismatch or boundary violation.',
          'Avoids exploring non-matching branches.'
        ],
        timeComplexity: 'O(R * C + Occurrences * L)',
        spaceComplexity: 'O(L) recursion stack',
        complexityExplanation: 'Only runs deep search when the first character matches, terminating on first mismatch.',
        code: {
          cpp: `// C++ Early Exit Directional DFS
#include <vector>
#include <string>

class Solution {
    int dx[8] = {-1,-1,-1,0,0,1,1,1};
    int dy[8] = {-1,0,1,-1,1,-1,0,1};
    bool dfs(const std::vector<std::vector<char>>& grid, int r, int c, const std::string& word, int idx, int dir) {
        if (idx == word.length()) return true;
        if (r < 0 || r >= grid.size() || c < 0 || c >= grid[0].size() || grid[r][c] != word[idx]) return false;
        return dfs(grid, r + dx[dir], c + dy[dir], word, idx + 1, dir);
    }
public:
    int countOccurrencesBetter(std::vector<std::vector<char>>& grid, std::string word) {
        int rows = grid.size(), cols = grid[0].size(), total = 0;
        for (int i = 0; i < rows; i++) {
            for (int j = 0; j < cols; j++) {
                if (grid[i][j] == word[0]) {
                    for (int d = 0; d < 8; d++) {
                        if (dfs(grid, i, j, word, 0, d)) total++;
                    }
                }
            }
        }
        return total;
    }
};`,
          java: `// Java Early Exit Directional DFS
class Solution {
    private static final int[] DX = {-1, -1, -1, 0, 0, 1, 1, 1};
    private static final int[] DY = {-1, 0, 1, -1, 1, -1, 0, 1};

    public int countOccurrencesBetter(char[][] grid, String word) {
        int rows = grid.length, cols = grid[0].length;
        int count = 0;
        for (int i = 0; i < rows; i++) {
            for (int j = 0; j < cols; j++) {
                if (grid[i][j] == word.charAt(0)) {
                    for (int dir = 0; dir < 8; dir++) {
                        if (dfs(grid, i, j, word, 0, dir)) count++;
                    }
                }
            }
        }
        return count;
    }

    private boolean dfs(char[][] grid, int r, int c, String word, int idx, int dir) {
        if (idx == word.length()) return true;
        if (r < 0 || r >= grid.length || c < 0 || c >= grid[0].length || grid[r][c] != word.charAt(idx)) {
            return false;
        }
        return dfs(grid, r + DX[dir], c + DY[dir], word, idx + 1, dir);
    }
}`,
          python: `# Python Early Exit Directional DFS
class Solution:
    DX = [-1, -1, -1, 0, 0, 1, 1, 1]
    DY = [-1, 0, 1, -1, 1, -1, 0, 1]

    def countOccurrencesBetter(self, grid: list[list[str]], word: str) -> int:
        rows, cols = len(grid), len(grid[0])
        def dfs(r: int, c: int, idx: int, d: int) -> bool:
            if idx == len(word):
                return True
            if not (0 <= r < rows and 0 <= c < cols) or grid[r][c] != word[idx]:
                return False
            return dfs(r + self.DX[d], c + self.DY[d], idx + 1, d)

        count = 0
        for i in range(rows):
            for j in range(cols):
                if grid[i][j] == word[0]:
                    for d in range(8):
                        if dfs(i, j, 0, d):
                            count += 1
        return count`,
          javascript: `// JavaScript Early Exit Directional DFS
function countOccurrencesBetter(grid, word) {
  const rows = grid.length, cols = grid[0].length;
  const dx = [-1, -1, -1, 0, 0, 1, 1, 1];
  const dy = [-1, 0, 1, -1, 1, -1, 0, 1];

  function dfs(r, c, idx, dir) {
    if (idx === word.length) return true;
    if (r < 0 || r >= rows || c < 0 || c >= cols || grid[r][c] !== word[idx]) return false;
    return dfs(r + dx[dir], c + dy[dir], idx + 1, dir);
  }

  let count = 0;
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (grid[i][j] === word[0]) {
        for (let d = 0; d < 8; d++) {
          if (dfs(i, j, 0, d)) count++;
        }
      }
    }
  }
  return count;
}`
        }
      },
      optimal: {
        name: 'Optimal (Boundary Invariant Iterative Verification)',
        tier: 'optimal',
        badge: '🥇 Optimal',
        intuition: [
          'Pre-check whether r + (L-1)*dx and c + (L-1)*dy lie within grid bounds before verifying characters.',
          'Eliminates all out-of-bound array checks inside inner loops.',
          'Zero heap allocations and zero recursion overhead.'
        ],
        timeComplexity: 'O(R * C * 8 * L)',
        spaceComplexity: 'O(1)',
        complexityExplanation: 'Zero auxiliary space, optimal constant factors.',
        code: {
          cpp: `// C++ Optimal Invariant Verification
#include <vector>
#include <string>

class Solution {
public:
    int countOccurrences(std::vector<std::vector<char>>& grid, std::string word) {
        int R = grid.size(), C = grid[0].size(), L = word.length();
        int dx[8] = {-1,-1,-1,0,0,1,1,1}, dy[8] = {-1,0,1,-1,1,-1,0,1};
        int count = 0;

        for (int r = 0; r < R; r++) {
            for (int c = 0; c < C; c++) {
                if (grid[r][c] != word[0]) continue;
                for (int d = 0; d < 8; d++) {
                    int endR = r + (L - 1) * dx[d];
                    int endC = c + (L - 1) * dy[d];
                    if (endR < 0 || endR >= R || endC < 0 || endC >= C) continue;

                    bool match = true;
                    for (int k = 1; k < L; k++) {
                        if (grid[r + k * dx[d]][c + k * dy[d]] != word[k]) {
                            match = false;
                            break;
                        }
                    }
                    if (match) count++;
                }
            }
        }
        return count;
    }
};`,
          java: `// Java Optimal Invariant Verification
class Solution {
    public int countOccurrences(char[][] grid, String word) {
        int R = grid.length, C = grid[0].length, L = word.length();
        int[] dx = {-1, -1, -1, 0, 0, 1, 1, 1};
        int[] dy = {-1, 0, 1, -1, 1, -1, 0, 1};
        int count = 0;

        for (int r = 0; r < R; r++) {
            for (int c = 0; c < C; c++) {
                if (grid[r][c] != word.charAt(0)) continue;
                for (int d = 0; d < 8; d++) {
                    int endR = r + (L - 1) * dx[d];
                    int endC = c + (L - 1) * dy[d];
                    if (endR < 0 || endR >= R || endC < 0 || endC >= C) continue;

                    boolean match = true;
                    for (int k = 1; k < L; k++) {
                        if (grid[r + k * dx[d]][c + k * dy[d]] != word.charAt(k)) {
                            match = false;
                            break;
                        }
                    }
                    if (match) count++;
                }
            }
        }
        return count;
    }
}`,
          python: `# Python Optimal Invariant Verification
class Solution:
    def countOccurrences(self, grid: list[list[str]], word: str) -> int:
        R, C, L = len(grid), len(grid[0]), len(word)
        dx = [-1, -1, -1, 0, 0, 1, 1, 1]
        dy = [-1, 0, 1, -1, 1, -1, 0, 1]
        count = 0

        for r in range(R):
            for c in range(C):
                if grid[r][c] != word[0]:
                    continue
                for d in range(8):
                    end_r = r + (L - 1) * dx[d]
                    end_c = c + (L - 1) * dy[d]
                    if not (0 <= end_r < R and 0 <= end_c < C):
                        continue
                    if all(grid[r + k * dx[d]][c + k * dy[d]] == word[k] for k in range(1, L)):
                        count += 1
        return count`,
          javascript: `// JavaScript Optimal Invariant Verification
function countOccurrences(grid, word) {
  const R = grid.length, C = grid[0].length, L = word.length;
  const dx = [-1, -1, -1, 0, 0, 1, 1, 1];
  const dy = [-1, 0, 1, -1, 1, -1, 0, 1];
  let count = 0;

  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      if (grid[r][c] !== word[0]) continue;
      for (let d = 0; d < 8; d++) {
        const endR = r + (L - 1) * dx[d];
        const endC = c + (L - 1) * dy[d];
        if (endR < 0 || endR >= R || endC < 0 || endC >= C) continue;

        let match = true;
        for (let k = 1; k < L; k++) {
          if (grid[r + k * dx[d]][c + k * dy[d]] !== word[k]) {
            match = false;
            break;
          }
        }
        if (match) count++;
      }
    }
  }
  return count;
}`
        }
      }
    }
  }
};
