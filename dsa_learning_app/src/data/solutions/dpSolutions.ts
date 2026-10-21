import { ProblemSolution } from '../../types/dsa';

export const DP_SOLUTIONS: Record<string, ProblemSolution> = {
  'dp-1': {
    questionId: 'dp-1',
    pattern: '0/1 Knapsack (Reverse 1D Tabulation)',
    intuition: [
      'For each item `i`, we have two choices: include it in the knapsack (if weight permits), or exclude it.',
      'Recurrence: `dp[w] = max(dp[w], value[i] + dp[w - weight[i]])`.',
      'Space optimization: Instead of a 2D table `dp[N][W]`, use a 1D array of size `W + 1`.',
      'Traverse capacity `w` backwards from `W` down to `weight[i]`. Backwards traversal ensures that each item is used at most ONCE (0/1 constraint).'
    ],
    pseudocode: [
      'FUNCTION knapSack(W, wt, val, n):',
      '  dp = array of size W + 1 filled with 0',
      '  FOR i from 0 TO n - 1:',
      '    FOR w from W DOWNTO wt[i]:',
      '      dp[w] = MAX(dp[w], val[i] + dp[w - wt[i]])',
      '  RETURN dp[W]'
    ],
    timeComplexity: 'O(N * W)',
    spaceComplexity: 'O(W)',
    complexityExplanation: 'Iterates through N items and W weight capacities, using only 1D memory of size W + 1.',
    edgeCases: ['Capacity W = 0', 'Item weight > Capacity W', 'All items have zero weight'],
    code: {
      cpp: `// C++ 0/1 Knapsack (1D Space Optimized)
#include <vector>
#include <algorithm>

int knapSack(int W, const std::vector<int>& wt, const std::vector<int>& val) {
    int n = wt.size();
    std::vector<int> dp(W + 1, 0);
    for (int i = 0; i < n; ++i) {
        for (int w = W; w >= wt[i]; --w) {
            dp[w] = std::max(dp[w], val[i] + dp[w - wt[i]]);
        }
    }
    return dp[W];
}`,
      java: `// Java 0/1 Knapsack (1D Space Optimized)
public class Solution {
    public int knapSack(int W, int[] wt, int[] val) {
        int n = wt.length;
        int[] dp = new int[W + 1];
        for (int i = 0; i < n; i++) {
            for (int w = W; w >= wt[i]; w--) {
                dp[w] = Math.max(dp[w], val[i] + dp[w - wt[i]]);
            }
        }
        return dp[W];
    }
}`,
      python: `# Python 0/1 Knapsack (1D Space Optimized)
def knapSack(W: int, wt: list[int], val: list[int]) -> int:
    dp = [0] * (W + 1)
    for i in range(len(wt)):
        for w in range(W, wt[i] - 1, -1):
            dp[w] = max(dp[w], val[i] + dp[w - wt[i]])
    return dp[W]`,
      javascript: `// JavaScript 0/1 Knapsack (1D Space Optimized)
function knapSack(W, wt, val) {
  const n = wt.length;
  const dp = new Array(W + 1).fill(0);
  for (let i = 0; i < n; i++) {
    for (let w = W; w >= wt[i]; w--) {
      dp[w] = Math.max(dp[w], val[i] + dp[w - wt[i]]);
    }
  }
  return dp[W];
}`
    },
    interviewProTips: [
      'Emphasize the difference between 0/1 Knapsack (inner loop runs backwards to prevent reusing the same item) and Unbounded Knapsack (inner loop runs forward because items can be reused).'
    ]
  },

  'dp-2': {
    questionId: 'dp-2',
    pattern: 'Unbounded Knapsack (Bottom-Up 1D DP)',
    intuition: [
      'Problem asks for the fewest number of coins that make up a target `amount`.',
      'Let `dp[i]` represent the minimum coins required to make amount `i`.',
      'Base case: `dp[0] = 0` (zero coins needed for amount 0). All other states initialized to infinity (`amount + 1`).',
      'For each amount `i` from 1 to `amount`: for each coin `c` where `c <= i`: `dp[i] = min(dp[i], dp[i - c] + 1)`.',
      'If `dp[amount] > amount`, return -1 (impossible).'
    ],
    pseudocode: [
      'FUNCTION coinChange(coins, amount):',
      '  dp = array of size amount + 1 filled with amount + 1',
      '  dp[0] = 0',
      '  FOR i from 1 TO amount:',
      '    FOR coin IN coins:',
      '      IF coin <= i:',
      '        dp[i] = MIN(dp[i], dp[i - coin] + 1)',
      '  RETURN dp[amount] > amount ? -1 : dp[amount]'
    ],
    timeComplexity: 'O(Amount * N)',
    spaceComplexity: 'O(Amount)',
    complexityExplanation: 'N = number of coins. Computes minimum coins for each sub-amount up to target.',
    edgeCases: ['Amount = 0 (returns 0)', 'Target amount cannot be formed (returns -1)', 'Coin denomination greater than amount'],
    code: {
      cpp: `// C++ Coin Change (Bottom-up DP)
#include <vector>
#include <algorithm>

int coinChange(std::vector<int>& coins, int amount) {
    std::vector<int> dp(amount + 1, amount + 1);
    dp[0] = 0;
    for (int i = 1; i <= amount; ++i) {
        for (int coin : coins) {
            if (coin <= i) {
                dp[i] = std::min(dp[i], dp[i - coin] + 1);
            }
        }
    }
    return dp[amount] > amount ? -1 : dp[amount];
}`,
      java: `// Java Coin Change (Bottom-up DP)
import java.util.Arrays;

public class Solution {
    public int coinChange(int[] coins, int amount) {
        int[] dp = new int[amount + 1];
        Arrays.fill(dp, amount + 1);
        dp[0] = 0;
        for (int i = 1; i <= amount; i++) {
            for (int coin : coins) {
                if (coin <= i) {
                    dp[i] = Math.min(dp[i], dp[i - coin] + 1);
                }
            }
        }
        return dp[amount] > amount ? -1 : dp[amount];
    }
}`,
      python: `# Python Coin Change (Bottom-up DP)
def coinChange(coins: list[int], amount: int) -> int:
    dp = [amount + 1] * (amount + 1)
    dp[0] = 0
    for i in range(1, amount + 1):
        for coin in coins:
            if coin <= i:
                dp[i] = min(dp[i], dp[i - coin] + 1)
    return dp[amount] if dp[amount] <= amount else -1`,
      javascript: `// JavaScript Coin Change (Bottom-up DP)
function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(amount + 1);
  dp[0] = 0;
  for (let i = 1; i <= amount; i++) {
    for (const coin of coins) {
      if (coin <= i) {
        dp[i] = Math.min(dp[i], dp[i - coin] + 1);
      }
    }
  }
  return dp[amount] > amount ? -1 : dp[amount];
}`
    },
    interviewProTips: [
      'Initialize `dp` with `amount + 1` instead of `Integer.MAX_VALUE` to avoid 32-bit integer overflow when calculating `dp[i - c] + 1`.'
    ]
  },

  'dp-3': {
    questionId: 'dp-3',
    pattern: '2D Grid Subsequence Matching',
    intuition: [
      'To find Longest Common Subsequence of `text1` and `text2`:',
      'If current characters match (`text1[i-1] == text2[j-1]`), they contribute 1 to the LCS: `dp[i][j] = 1 + dp[i-1][j-1]`.',
      'If they do not match, take the best choice between skipping `text1[i-1]` or skipping `text2[j-1]`: `dp[i][j] = max(dp[i-1][j], dp[i][j-1])`.',
      'The final answer is at `dp[m][n]`.'
    ],
    pseudocode: [
      'FUNCTION longestCommonSubsequence(text1, text2):',
      '  m = text1.length, n = text2.length',
      '  dp = 2D array (m + 1) x (n + 1) filled with 0',
      '  FOR i from 1 TO m:',
      '    FOR j from 1 TO n:',
      '      IF text1[i-1] == text2[j-1]:',
      '        dp[i][j] = 1 + dp[i-1][j-1]',
      '      ELSE:',
      '        dp[i][j] = MAX(dp[i-1][j], dp[i][j-1])',
      '  RETURN dp[m][n]'
    ],
    timeComplexity: 'O(M * N)',
    spaceComplexity: 'O(M * N) or O(min(M, N)) with 1D row rolling',
    complexityExplanation: 'Fills an (M+1) x (N+1) dynamic programming matrix.',
    edgeCases: ['Strings have no common characters (returns 0)', 'One string is substring of another', 'Identical strings'],
    code: {
      cpp: `// C++ Longest Common Subsequence
#include <string>
#include <vector>
#include <algorithm>

int longestCommonSubsequence(std::string text1, std::string text2) {
    int m = text1.size(), n = text2.size();
    std::vector<std::vector<int>> dp(m + 1, std::vector<int>(n + 1, 0));
    for (int i = 1; i <= m; ++i) {
        for (int j = 1; j <= n; ++j) {
            if (text1[i - 1] == text2[j - 1]) {
                dp[i][j] = 1 + dp[i - 1][j - 1];
            } else {
                dp[i][j] = std::max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }
    return dp[m][n];
}`,
      java: `// Java Longest Common Subsequence
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
      python: `# Python Longest Common Subsequence
def longestCommonSubsequence(text1: str, text2: str) -> int:
    m, n = len(text1), len(text2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if text1[i - 1] == text2[j - 1]:
                dp[i][j] = 1 + dp[i - 1][j - 1]
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
    return dp[m][n]`,
      javascript: `// JavaScript Longest Common Subsequence
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
    },
    interviewProTips: [
      'LCS is the foundation for Edit Distance, Longest Repeating Subsequence, Minimum Insertions to make Palindrome, and Shortest Common Supersequence.'
    ]
  }
};
