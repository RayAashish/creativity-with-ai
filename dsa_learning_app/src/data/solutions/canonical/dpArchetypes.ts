import { ProblemSolution } from '../../../types/dsa';

export const DP_ARCHETYPES: Record<string, ProblemSolution> = {
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
    "complexityExplanation": "Iterates through items while filling a single 1D array backwards from W down to wt[i], preventing multi-inclusion in O(W) auxiliary space.",
    "edgeCases": [
      "Capacity W = 0",
      "All item weights exceed W",
      "Single item"
    ],
    "code": {
      "java": "public class Solution {\n    public int knapSack(int W, int[] wt, int[] val, int n) {\n        int[] dp = new int[W + 1];\n        for (int i = 0; i < n; i++) {\n            for (int w = W; w >= wt[i]; w--) {\n                dp[w] = Math.max(dp[w], val[i] + dp[w - wt[i]]);\n            }\n        }\n        return dp[W];\n    }\n}",
      "python": "class Solution:\n    def knapSack(self, W: int, wt: list[int], val: list[int], n: int) -> int:\n        dp = [0] * (W + 1)\n        for i in range(n):\n            for w in range(W, wt[i] - 1, -1):\n                dp[w] = max(dp[w], val[i] + dp[w - wt[i]])\n        return dp[W]",
      "cpp": "#include <vector>\n#include <algorithm>\n\nclass Solution {\npublic:\n    int knapSack(int W, std::vector<int>& wt, std::vector<int>& val, int n) {\n        std::vector<int> dp(W + 1, 0);\n        for (int i = 0; i < n; i++) {\n            for (int w = W; w >= wt[i]; w--) {\n                dp[w] = std::max(dp[w], val[i] + dp[w - wt[i]]);\n            }\n        }\n        return dp[W];\n    }\n};",
      "javascript": "function knapSack(W, wt, val, n) {\n    const dp = new Array(W + 1).fill(0);\n    for (let i = 0; i < n; i++) {\n        for (let w = W; w >= wt[i]; w--) {\n            dp[w] = Math.max(dp[w], val[i] + dp[w - wt[i]]);\n        }\n    }\n    return dp[W];\n}"
    },
    "approaches": {
      "brute": {
        "name": "Brute Force (Pure Exponential Recursion)",
        "tier": "brute",
        "badge": "\ud83e\udd49 Brute Force",
        "intuition": [
          "Recursive exploration of 2^N subsets."
        ],
        "timeComplexity": "O(2\u207f)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Explores both include and exclude branches at each item index without memoization.",
        "code": {
          "java": "public class Solution {\n    public int knapSackBrute(int W, int[] wt, int[] val, int n) {\n        return helper(W, wt, val, n - 1);\n    }\n    private int helper(int w, int[] wt, int[] val, int idx) {\n        if (idx < 0 || w <= 0) return 0;\n        int notTake = helper(w, wt, val, idx - 1);\n        int take = 0;\n        if (wt[idx] <= w) take = val[idx] + helper(w - wt[idx], wt, val, idx - 1);\n        return Math.max(take, notTake);\n    }\n}",
          "python": "class Solution:\n    def knapSackBrute(self, W: int, wt: list[int], val: list[int], n: int) -> int:\n        def h(w, i):\n            if i < 0 or w <= 0: return 0\n            not_take = h(w, i - 1)\n            take = val[i] + h(w - wt[i], i - 1) if wt[i] <= w else 0\n            return max(take, not_take)\n        return h(W, n - 1)",
          "cpp": "#include <vector>\n#include <algorithm>\n\nclass Solution {\n    int h(int w, const std::vector<int>& wt, const std::vector<int>& val, int i) {\n        if (i < 0 || w <= 0) return 0;\n        int notTake = h(w, wt, val, i - 1);\n        int take = (wt[i] <= w) ? val[i] + h(w - wt[i], wt, val, i - 1) : 0;\n        return std::max(take, notTake);\n    }\npublic:\n    int knapSackBrute(int W, std::vector<int>& wt, std::vector<int>& val, int n) {\n        return h(W, wt, val, n - 1);\n    }\n};",
          "javascript": "function knapSackBrute(W, wt, val, n) {\n    function h(w, i) {\n        if (i < 0 || w <= 0) return 0;\n        const notTake = h(w, i - 1);\n        const take = wt[i] <= w ? val[i] + h(w - wt[i], i - 1) : 0;\n        return Math.max(take, notTake);\n    }\n    return h(W, n - 1);\n}"
        }
      },
      "better": {
        "name": "Better (2D DP Table Tabulation)",
        "tier": "better",
        "badge": "\ud83e\udd48 Better",
        "intuition": [
          "2D DP grid representation."
        ],
        "timeComplexity": "O(N * W)",
        "spaceComplexity": "O(N * W)",
        "complexityExplanation": "Explicit N x W table where dp[i][w] stores optimal value using first i items.",
        "code": {
          "java": "public class Solution {\n    public int knapSackBetter(int W, int[] wt, int[] val, int n) {\n        int[][] dp = new int[n + 1][W + 1];\n        for (int i = 1; i <= n; i++) {\n            for (int w = 0; w <= W; w++) {\n                if (wt[i - 1] <= w) {\n                    dp[i][w] = Math.max(dp[i - 1][w], val[i - 1] + dp[i - 1][w - wt[i - 1]]);\n                } else {\n                    dp[i][w] = dp[i - 1][w];\n                }\n            }\n        }\n        return dp[n][W];\n    }\n}",
          "python": "class Solution:\n    def knapSackBetter(self, W: int, wt: list[int], val: list[int], n: int) -> int:\n        dp = [[0] * (W + 1) for _ in range(n + 1)]\n        for i in range(1, n + 1):\n            for w in range(W + 1):\n                if wt[i - 1] <= w:\n                    dp[i][w] = max(dp[i - 1][w], val[i - 1] + dp[i - 1][w - wt[i - 1]])\n                else:\n                    dp[i][w] = dp[i - 1][w]\n        return dp[n][W]",
          "cpp": "#include <vector>\n#include <algorithm>\n\nclass Solution {\npublic:\n    int knapSackBetter(int W, std::vector<int>& wt, std::vector<int>& val, int n) {\n        std::vector<std::vector<int>> dp(n + 1, std::vector<int>(W + 1, 0));\n        for (int i = 1; i <= n; i++) {\n            for (int w = 0; w <= W; w++) {\n                if (wt[i - 1] <= w) {\n                    dp[i][w] = std::max(dp[i - 1][w], val[i - 1] + dp[i - 1][w - wt[i - 1]]);\n                } else {\n                    dp[i][w] = dp[i - 1][w];\n                }\n            }\n        }\n        return dp[n][W];\n    }\n};",
          "javascript": "function knapSackBetter(W, wt, val, n) {\n    const dp = Array.from({length: n + 1}, () => new Array(W + 1).fill(0));\n    for (let i = 1; i <= n; i++) {\n        for (let w = 0; w <= W; w++) {\n            if (wt[i - 1] <= w) {\n                dp[i][w] = Math.max(dp[i - 1][w], val[i - 1] + dp[i - 1][w - wt[i - 1]]);\n            } else {\n                dp[i][w] = dp[i - 1][w];\n            }\n        }\n    }\n    return dp[n][W];\n}"
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
        "complexityExplanation": "Iterates through items while filling a single 1D array backwards from W down to wt[i], preventing multi-inclusion in O(W) auxiliary space.",
        "code": {
          "java": "public class Solution {\n    public int knapSack(int W, int[] wt, int[] val, int n) {\n        int[] dp = new int[W + 1];\n        for (int i = 0; i < n; i++) {\n            for (int w = W; w >= wt[i]; w--) {\n                dp[w] = Math.max(dp[w], val[i] + dp[w - wt[i]]);\n            }\n        }\n        return dp[W];\n    }\n}",
          "python": "class Solution:\n    def knapSack(self, W: int, wt: list[int], val: list[int], n: int) -> int:\n        dp = [0] * (W + 1)\n        for i in range(n):\n            for w in range(W, wt[i] - 1, -1):\n                dp[w] = max(dp[w], val[i] + dp[w - wt[i]])\n        return dp[W]",
          "cpp": "#include <vector>\n#include <algorithm>\n\nclass Solution {\npublic:\n    int knapSack(int W, std::vector<int>& wt, std::vector<int>& val, int n) {\n        std::vector<int> dp(W + 1, 0);\n        for (int i = 0; i < n; i++) {\n            for (int w = W; w >= wt[i]; w--) {\n                dp[w] = std::max(dp[w], val[i] + dp[w - wt[i]]);\n            }\n        }\n        return dp[W];\n    }\n};",
          "javascript": "function knapSack(W, wt, val, n) {\n    const dp = new Array(W + 1).fill(0);\n    for (let i = 0; i < n; i++) {\n        for (let w = W; w >= wt[i]; w--) {\n            dp[w] = Math.max(dp[w], val[i] + dp[w - wt[i]]);\n        }\n    }\n    return dp[W];\n}"
        }
      }
    }
  },
  "coin_change": {
    "questionId": "archetype-coin_change",
    "pattern": "1D Bottom-Up Dynamic Programming",
    "intuition": [
      "Initialize dp array of size amount + 1 filled with infinity; dp[0] = 0.",
      "For each sub-amount a from 1 to amount, test each coin c:",
      "If a - c >= 0, dp[a] = min(dp[a], dp[a - c] + 1).",
      "If dp[amount] > amount, return -1 (unreachable target); otherwise return dp[amount]."
    ],
    "pseudocode": [
      "FUNCTION coinChange(coins, amount):",
      "  dp = Array(amount + 1, INF); dp[0] = 0",
      "  FOR a from 1 TO amount:",
      "    FOR c IN coins:",
      "      IF a - c >= 0: dp[a] = MIN(dp[a], dp[a - c] + 1)",
      "  RETURN dp[amount] > amount ? -1 : dp[amount]"
    ],
    "timeComplexity": "O(N * amount)",
    "spaceComplexity": "O(amount)",
    "complexityExplanation": "Computes min coins needed for all sub-amounts 1..amount in O(N * amount) time and O(amount) space.",
    "edgeCases": [
      "amount = 0 (returns 0)",
      "Coins cannot form amount (returns -1)",
      "Single coin matching amount"
    ],
    "code": {
      "java": "import java.util.*;\n\npublic class Solution {\n    public int coinChange(int[] coins, int amount) {\n        int max = amount + 1;\n        int[] dp = new int[amount + 1];\n        Arrays.fill(dp, max);\n        dp[0] = 0;\n        for (int a = 1; a <= amount; a++) {\n            for (int c : coins) {\n                if (a - c >= 0) {\n                    dp[a] = Math.min(dp[a], dp[a - c] + 1);\n                }\n            }\n        }\n        return dp[amount] > amount ? -1 : dp[amount];\n    }\n}",
      "python": "class Solution:\n    def coinChange(self, coins: list[int], amount: int) -> int:\n        dp = [float('inf')] * (amount + 1)\n        dp[0] = 0\n        for a in range(1, amount + 1):\n            for c in coins:\n                if a - c >= 0:\n                    dp[a] = min(dp[a], dp[a - c] + 1)\n        return dp[amount] if dp[amount] != float('inf') else -1",
      "cpp": "#include <vector>\n#include <algorithm>\n\nclass Solution {\npublic:\n    int coinChange(std::vector<int>& coins, int amount) {\n        int maxVal = amount + 1;\n        std::vector<int> dp(amount + 1, maxVal);\n        dp[0] = 0;\n        for (int a = 1; a <= amount; a++) {\n            for (int c : coins) {\n                if (a - c >= 0) dp[a] = std::min(dp[a], dp[a - c] + 1);\n            }\n        }\n        return dp[amount] > amount ? -1 : dp[amount];\n    }\n};",
      "javascript": "function coinChange(coins, amount) {\n    const maxVal = amount + 1;\n    const dp = new Array(amount + 1).fill(maxVal);\n    dp[0] = 0;\n    for (let a = 1; a <= amount; a++) {\n        for (const c of coins) {\n            if (a - c >= 0) dp[a] = Math.min(dp[a], dp[a - c] + 1);\n        }\n    }\n    return dp[amount] > amount ? -1 : dp[amount];\n}"
    },
    "approaches": {
      "brute": {
        "name": "Brute Force (Pure Exponential Recursion)",
        "tier": "brute",
        "badge": "\ud83e\udd49 Brute Force",
        "intuition": [
          "Recursive branching."
        ],
        "timeComplexity": "O(S^N)",
        "spaceComplexity": "O(amount)",
        "complexityExplanation": "Explores every coin choice recursively without memoization.",
        "code": {
          "java": "public class Solution {\n    public int coinChangeBrute(int[] coins, int amount) {\n        if (amount == 0) return 0;\n        int min = Integer.MAX_VALUE;\n        for (int c : coins) {\n            if (amount - c >= 0) {\n                int res = coinChangeBrute(coins, amount - c);\n                if (res != -1 && res < min) min = 1 + res;\n            }\n        }\n        return min == Integer.MAX_VALUE ? -1 : min;\n    }\n}",
          "python": "class Solution:\n    def coinChangeBrute(self, coins: list[int], amount: int) -> int:\n        if amount == 0: return 0\n        min_coins = float('inf')\n        for c in coins:\n            if amount - c >= 0:\n                res = self.coinChangeBrute(coins, amount - c)\n                if res != -1: min_coins = min(min_coins, 1 + res)\n        return min_coins if min_coins != float('inf') else -1",
          "cpp": "#include <vector>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\npublic:\n    int coinChangeBrute(std::vector<int>& coins, int amount) {\n        if (amount == 0) return 0;\n        int minCoins = INT_MAX;\n        for (int c : coins) {\n            if (amount - c >= 0) {\n                int res = coinChangeBrute(coins, amount - c);\n                if (res != -1 && res < minCoins) minCoins = 1 + res;\n            }\n        }\n        return minCoins == INT_MAX ? -1 : minCoins;\n    }\n};",
          "javascript": "function coinChangeBrute(coins, amount) {\n    if (amount === 0) return 0;\n    let minCoins = Infinity;\n    for (const c of coins) {\n        if (amount - c >= 0) {\n            const res = coinChangeBrute(coins, amount - c);\n            if (res !== -1) minCoins = Math.min(minCoins, 1 + res);\n        }\n    }\n    return minCoins === Infinity ? -1 : minCoins;\n}"
        }
      },
      "better": {
        "name": "Better (Top-Down Memoized DFS)",
        "tier": "better",
        "badge": "\ud83e\udd48 Better",
        "intuition": [
          "Memoized DFS."
        ],
        "timeComplexity": "O(N * amount)",
        "spaceComplexity": "O(amount)",
        "complexityExplanation": "Caches min coins for remaining amount in a memo array of size amount + 1.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int coinChangeBetter(int[] coins, int amount) {\n        int[] memo = new int[amount + 1];\n        return dfs(coins, amount, memo);\n    }\n    private int dfs(int[] coins, int rem, int[] memo) {\n        if (rem < 0) return -1;\n        if (rem == 0) return 0;\n        if (memo[rem] != 0) return memo[rem];\n        int min = Integer.MAX_VALUE;\n        for (int c : coins) {\n            int res = dfs(coins, rem - c, memo);\n            if (res >= 0 && res < min) min = 1 + res;\n        }\n        memo[rem] = (min == Integer.MAX_VALUE) ? -1 : min;\n        return memo[rem];\n    }\n}",
          "python": "class Solution:\n    def coinChangeBetter(self, coins: list[int], amount: int) -> int:\n        memo = {}\n        def dfs(rem):\n            if rem < 0: return -1\n            if rem == 0: return 0\n            if rem in memo: return memo[rem]\n            min_c = float('inf')\n            for c in coins:\n                res = dfs(rem - c)\n                if res >= 0: min_c = min(min_c, 1 + res)\n            memo[rem] = min_c if min_c != float('inf') else -1\n            return memo[rem]\n        return dfs(amount)",
          "cpp": "#include <vector>\n#include <algorithm>\n#include <climits>\n\nclass Solution {\n    int dfs(const std::vector<int>& coins, int rem, std::vector<int>& memo) {\n        if (rem < 0) return -1;\n        if (rem == 0) return 0;\n        if (memo[rem] != -2) return memo[rem];\n        int minCoins = INT_MAX;\n        for (int c : coins) {\n            int res = dfs(coins, rem - c, memo);\n            if (res >= 0 && res < minCoins) minCoins = 1 + res;\n        }\n        memo[rem] = (minCoins == INT_MAX) ? -1 : minCoins;\n        return memo[rem];\n    }\npublic:\n    int coinChangeBetter(std::vector<int>& coins, int amount) {\n        std::vector<int> memo(amount + 1, -2);\n        return dfs(coins, amount, memo);\n    }\n};",
          "javascript": "function coinChangeBetter(coins, amount) {\n    const memo = new Map();\n    function dfs(rem) {\n        if (rem < 0) return -1;\n        if (rem === 0) return 0;\n        if (memo.has(rem)) return memo.get(rem);\n        let minCoins = Infinity;\n        for (const c of coins) {\n            const res = dfs(rem - c);\n            if (res >= 0) minCoins = Math.min(minCoins, 1 + res);\n        }\n        const ans = minCoins === Infinity ? -1 : minCoins;\n        memo.set(rem, ans);\n        return ans;\n    }\n    return dfs(amount);\n}"
        }
      },
      "optimal": {
        "name": "Optimal (1D Bottom-Up Dynamic Programming)",
        "tier": "optimal",
        "badge": "\ud83e\udd47 Optimal",
        "intuition": [
          "Initialize dp array of size amount + 1 filled with infinity; dp[0] = 0.",
          "For each sub-amount a from 1 to amount, test each coin c:",
          "If a - c >= 0, dp[a] = min(dp[a], dp[a - c] + 1).",
          "If dp[amount] > amount, return -1 (unreachable target); otherwise return dp[amount]."
        ],
        "pseudocode": [
          "FUNCTION coinChange(coins, amount):",
          "  dp = Array(amount + 1, INF); dp[0] = 0",
          "  FOR a from 1 TO amount:",
          "    FOR c IN coins:",
          "      IF a - c >= 0: dp[a] = MIN(dp[a], dp[a - c] + 1)",
          "  RETURN dp[amount] > amount ? -1 : dp[amount]"
        ],
        "timeComplexity": "O(N * amount)",
        "spaceComplexity": "O(amount)",
        "complexityExplanation": "Computes min coins needed for all sub-amounts 1..amount in O(N * amount) time and O(amount) space.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int coinChange(int[] coins, int amount) {\n        int max = amount + 1;\n        int[] dp = new int[amount + 1];\n        Arrays.fill(dp, max);\n        dp[0] = 0;\n        for (int a = 1; a <= amount; a++) {\n            for (int c : coins) {\n                if (a - c >= 0) {\n                    dp[a] = Math.min(dp[a], dp[a - c] + 1);\n                }\n            }\n        }\n        return dp[amount] > amount ? -1 : dp[amount];\n    }\n}",
          "python": "class Solution:\n    def coinChange(self, coins: list[int], amount: int) -> int:\n        dp = [float('inf')] * (amount + 1)\n        dp[0] = 0\n        for a in range(1, amount + 1):\n            for c in coins:\n                if a - c >= 0:\n                    dp[a] = min(dp[a], dp[a - c] + 1)\n        return dp[amount] if dp[amount] != float('inf') else -1",
          "cpp": "#include <vector>\n#include <algorithm>\n\nclass Solution {\npublic:\n    int coinChange(std::vector<int>& coins, int amount) {\n        int maxVal = amount + 1;\n        std::vector<int> dp(amount + 1, maxVal);\n        dp[0] = 0;\n        for (int a = 1; a <= amount; a++) {\n            for (int c : coins) {\n                if (a - c >= 0) dp[a] = std::min(dp[a], dp[a - c] + 1);\n            }\n        }\n        return dp[amount] > amount ? -1 : dp[amount];\n    }\n};",
          "javascript": "function coinChange(coins, amount) {\n    const maxVal = amount + 1;\n    const dp = new Array(amount + 1).fill(maxVal);\n    dp[0] = 0;\n    for (let a = 1; a <= amount; a++) {\n        for (const c of coins) {\n            if (a - c >= 0) dp[a] = Math.min(dp[a], dp[a - c] + 1);\n        }\n    }\n    return dp[amount] > amount ? -1 : dp[amount];\n}"
        }
      }
    }
  },
  "house_robber": {
    "questionId": "archetype-house_robber",
    "pattern": "State Machine / Space-Optimized DP",
    "intuition": [
      "At each house, we have two choices: rob current house + loot from i-2, or skip current house and keep loot from i-1.",
      "Transition: newRob = max(nums[i] + rob1, rob2).",
      "Update rob1 = rob2, rob2 = newRob.",
      "Return rob2 after iterating through all houses."
    ],
    "pseudocode": [
      "FUNCTION rob(nums):",
      "  rob1 = 0, rob2 = 0",
      "  FOR num IN nums:",
      "    temp = MAX(num + rob1, rob2)",
      "    rob1 = rob2",
      "    rob2 = temp",
      "  RETURN rob2"
    ],
    "timeComplexity": "O(N)",
    "spaceComplexity": "O(1)",
    "complexityExplanation": "Maintains two rolling variables rob1 (max loot excluding prev house) and rob2 (max loot including prev house) in O(N) time and O(1) space.",
    "edgeCases": [
      "Empty array",
      "Single house",
      "Two houses"
    ],
    "code": {
      "java": "public class Solution {\n    public int rob(int[] nums) {\n        int rob1 = 0, rob2 = 0;\n        for (int num : nums) {\n            int temp = Math.max(num + rob1, rob2);\n            rob1 = rob2;\n            rob2 = temp;\n        }\n        return rob2;\n    }\n}",
      "python": "class Solution:\n    def rob(self, nums: list[int]) -> int:\n        rob1, rob2 = 0, 0\n        for num in nums:\n            rob1, rob2 = rob2, max(num + rob1, rob2)\n        return rob2",
      "cpp": "#include <vector>\n#include <algorithm>\n\nclass Solution {\npublic:\n    int rob(std::vector<int>& nums) {\n        int rob1 = 0, rob2 = 0;\n        for (int num : nums) {\n            int temp = std::max(num + rob1, rob2);\n            rob1 = rob2;\n            rob2 = temp;\n        }\n        return rob2;\n    }\n};",
      "javascript": "function rob(nums) {\n    let rob1 = 0, rob2 = 0;\n    for (const num of nums) {\n        const temp = Math.max(num + rob1, rob2);\n        rob1 = rob2;\n        rob2 = temp;\n    }\n    return rob2;\n}"
    },
    "approaches": {
      "brute": {
        "name": "Brute Force (Pure Exponential Recursion)",
        "tier": "brute",
        "badge": "\ud83e\udd49 Brute Force",
        "intuition": [
          "Recursive pick/skip."
        ],
        "timeComplexity": "O(2\u207f)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Explores both choices at every house without memoization.",
        "code": {
          "java": "public class Solution {\n    public int robBrute(int[] nums) {\n        return helper(nums, nums.length - 1);\n    }\n    private int helper(int[] nums, int i) {\n        if (i < 0) return 0;\n        return Math.max(nums[i] + helper(nums, i - 2), helper(nums, i - 1));\n    }\n}",
          "python": "class Solution:\n    def robBrute(self, nums: list[int]) -> int:\n        def h(i):\n            if i < 0: return 0\n            return max(nums[i] + h(i - 2), h(i - 1))\n        return h(len(nums) - 1)",
          "cpp": "#include <vector>\n#include <algorithm>\n\nclass Solution {\n    int h(const std::vector<int>& nums, int i) {\n        if (i < 0) return 0;\n        return std::max(nums[i] + h(nums, i - 2), h(nums, i - 1));\n    }\npublic:\n    int robBrute(std::vector<int>& nums) {\n        return h(nums, (int)nums.size() - 1);\n    }\n};",
          "javascript": "function robBrute(nums) {\n    function h(i) {\n        if (i < 0) return 0;\n        return Math.max(nums[i] + h(i - 2), h(i - 1));\n    }\n    return h(nums.length - 1);\n}"
        }
      },
      "better": {
        "name": "Better (1D DP Array)",
        "tier": "better",
        "badge": "\ud83e\udd48 Better",
        "intuition": [
          "1D DP array."
        ],
        "timeComplexity": "O(N)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Fills a 1D DP table where dp[i] is max profit considering houses up to i.",
        "code": {
          "java": "public class Solution {\n    public int robBetter(int[] nums) {\n        if (nums.length == 0) return 0;\n        if (nums.length == 1) return nums[0];\n        int[] dp = new int[nums.length];\n        dp[0] = nums[0];\n        dp[1] = Math.max(nums[0], nums[1]);\n        for (int i = 2; i < nums.length; i++) {\n            dp[i] = Math.max(dp[i - 1], nums[i] + dp[i - 2]);\n        }\n        return dp[nums.length - 1];\n    }\n}",
          "python": "class Solution:\n    def robBetter(self, nums: list[int]) -> int:\n        if not nums: return 0\n        if len(nums) <= 2: return max(nums)\n        dp = [0] * len(nums)\n        dp[0] = nums[0]\n        dp[1] = max(nums[0], nums[1])\n        for i in range(2, len(nums)):\n            dp[i] = max(dp[i-1], nums[i] + dp[i-2])\n        return dp[-1]",
          "cpp": "#include <vector>\n#include <algorithm>\n\nclass Solution {\npublic:\n    int robBetter(std::vector<int>& nums) {\n        if (nums.empty()) return 0;\n        if (nums.size() == 1) return nums[0];\n        std::vector<int> dp(nums.size());\n        dp[0] = nums[0];\n        dp[1] = std::max(nums[0], nums[1]);\n        for (size_t i = 2; i < nums.size(); i++) {\n            dp[i] = std::max(dp[i - 1], nums[i] + dp[i - 2]);\n        }\n        return dp.back();\n    }\n};",
          "javascript": "function robBetter(nums) {\n    if (nums.length === 0) return 0;\n    if (nums.length === 1) return nums[0];\n    const dp = new Array(nums.length);\n    dp[0] = nums[0];\n    dp[1] = Math.max(nums[0], nums[1]);\n    for (let i = 2; i < nums.length; i++) {\n        dp[i] = Math.max(dp[i - 1], nums[i] + dp[i - 2]);\n    }\n    return dp[nums.length - 1];\n}"
        }
      },
      "optimal": {
        "name": "Optimal (State Machine / Space-Optimized DP)",
        "tier": "optimal",
        "badge": "\ud83e\udd47 Optimal",
        "intuition": [
          "At each house, we have two choices: rob current house + loot from i-2, or skip current house and keep loot from i-1.",
          "Transition: newRob = max(nums[i] + rob1, rob2).",
          "Update rob1 = rob2, rob2 = newRob.",
          "Return rob2 after iterating through all houses."
        ],
        "pseudocode": [
          "FUNCTION rob(nums):",
          "  rob1 = 0, rob2 = 0",
          "  FOR num IN nums:",
          "    temp = MAX(num + rob1, rob2)",
          "    rob1 = rob2",
          "    rob2 = temp",
          "  RETURN rob2"
        ],
        "timeComplexity": "O(N)",
        "spaceComplexity": "O(1)",
        "complexityExplanation": "Maintains two rolling variables rob1 (max loot excluding prev house) and rob2 (max loot including prev house) in O(N) time and O(1) space.",
        "code": {
          "java": "public class Solution {\n    public int rob(int[] nums) {\n        int rob1 = 0, rob2 = 0;\n        for (int num : nums) {\n            int temp = Math.max(num + rob1, rob2);\n            rob1 = rob2;\n            rob2 = temp;\n        }\n        return rob2;\n    }\n}",
          "python": "class Solution:\n    def rob(self, nums: list[int]) -> int:\n        rob1, rob2 = 0, 0\n        for num in nums:\n            rob1, rob2 = rob2, max(num + rob1, rob2)\n        return rob2",
          "cpp": "#include <vector>\n#include <algorithm>\n\nclass Solution {\npublic:\n    int rob(std::vector<int>& nums) {\n        int rob1 = 0, rob2 = 0;\n        for (int num : nums) {\n            int temp = std::max(num + rob1, rob2);\n            rob1 = rob2;\n            rob2 = temp;\n        }\n        return rob2;\n    }\n};",
          "javascript": "function rob(nums) {\n    let rob1 = 0, rob2 = 0;\n    for (const num of nums) {\n        const temp = Math.max(num + rob1, rob2);\n        rob1 = rob2;\n        rob2 = temp;\n    }\n    return rob2;\n}"
        }
      }
    }
  }
};
