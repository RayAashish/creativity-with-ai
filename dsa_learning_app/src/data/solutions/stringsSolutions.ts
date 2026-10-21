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
  }
};
