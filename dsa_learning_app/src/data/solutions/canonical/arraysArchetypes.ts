import { ProblemSolution } from '../../../types/dsa';

export const ARRAYS_ARCHETYPES: Record<string, ProblemSolution> = {
  "two_sum": {
    "questionId": "archetype-two_sum",
    "pattern": "One-Pass Hash Map (Complement Lookup)",
    "intuition": [
      "Create an empty HashMap mapping element values to their indices.",
      "Iterate through the array with index i and value num.",
      "Compute complement = target - num.",
      "If complement is already in the map, return [map.get(complement), i].",
      "Otherwise, record map.put(num, i)."
    ],
    "pseudocode": [
      "FUNCTION twoSum(nums, target):",
      "  map = new Map()",
      "  FOR i from 0 TO nums.length - 1:",
      "    complement = target - nums[i]",
      "    IF map.has(complement):",
      "      RETURN [map.get(complement), i]",
      "    map.set(nums[i], i)",
      "  RETURN []"
    ],
    "timeComplexity": "O(N)",
    "spaceComplexity": "O(N)",
    "complexityExplanation": "For each element x, looks up complement = target - x in a HashMap in O(1) average time, solving in a single linear pass.",
    "edgeCases": [
      "Negative numbers in array",
      "Duplicate numbers forming target (e.g. 3 + 3 = 6)",
      "Target zero"
    ],
    "code": {
      "java": "import java.util.*;\n\npublic class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        Map<Integer, Integer> map = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int complement = target - nums[i];\n            if (map.containsKey(complement)) {\n                return new int[]{map.get(complement), i};\n            }\n            map.put(nums[i], i);\n        }\n        return new int[]{};\n    }\n}",
      "python": "class Solution:\n    def twoSum(self, nums: list[int], target: int) -> list[int]:\n        seen = {}\n        for i, num in enumerate(nums):\n            comp = target - num\n            if comp in seen: return [seen[comp], i]\n            seen[num] = i\n        return []",
      "cpp": "#include <vector>\n#include <unordered_map>\n\nclass Solution {\npublic:\n    std::vector<int> twoSum(std::vector<int>& nums, int target) {\n        std::unordered_map<int, int> map;\n        for (int i = 0; i < (int)nums.size(); i++) {\n            int comp = target - nums[i];\n            if (map.count(comp)) return {map[comp], i};\n            map[nums[i]] = i;\n        }\n        return {};\n    }\n};",
      "javascript": "function twoSum(nums, target) {\n    const map = new Map();\n    for (let i = 0; i < nums.length; i++) {\n        const comp = target - nums[i];\n        if (map.has(comp)) return [map.get(comp), i];\n        map.set(nums[i], i);\n    }\n    return [];\n}"
    },
    "approaches": {
      "brute": {
        "name": "Brute Force (Nested Loops Pair Testing)",
        "tier": "brute",
        "badge": "\ud83e\udd49 Brute Force",
        "intuition": [
          "Exhaustive pair checking."
        ],
        "timeComplexity": "O(N\u00b2)",
        "spaceComplexity": "O(1)",
        "complexityExplanation": "Tests every pair (i, j) with i < j to check if nums[i] + nums[j] == target.",
        "code": {
          "java": "public class Solution {\n    public int[] twoSumBrute(int[] nums, int target) {\n        for (int i = 0; i < nums.length; i++) {\n            for (int j = i + 1; j < nums.length; j++) {\n                if (nums[i] + nums[j] == target) return new int[]{i, j};\n            }\n        }\n        return new int[]{};\n    }\n}",
          "python": "class Solution:\n    def twoSumBrute(self, nums: list[int], target: int) -> list[int]:\n        for i in range(len(nums)):\n            for j in range(i + 1, len(nums)):\n                if nums[i] + nums[j] == target: return [i, j]\n        return []",
          "cpp": "#include <vector>\n\nclass Solution {\npublic:\n    std::vector<int> twoSumBrute(std::vector<int>& nums, int target) {\n        for (int i = 0; i < (int)nums.size(); i++) {\n            for (int j = i + 1; j < (int)nums.size(); j++) {\n                if (nums[i] + nums[j] == target) return {i, j};\n            }\n        }\n        return {};\n    }\n};",
          "javascript": "function twoSumBrute(nums, target) {\n    for (let i = 0; i < nums.length; i++) {\n        for (let j = i + 1; j < nums.length; j++) {\n            if (nums[i] + nums[j] === target) return [i, j];\n        }\n    }\n    return [];\n}"
        }
      },
      "better": {
        "name": "Better (Sort and Two Pointers)",
        "tier": "better",
        "badge": "\ud83e\udd48 Better",
        "intuition": [
          "Sort pairs and two pointers."
        ],
        "timeComplexity": "O(N log N)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Stores pairs (val, index), sorts by value, and uses inward two pointers.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int[] twoSumBetter(int[] nums, int target) {\n        int n = nums.length;\n        int[][] pairs = new int[n][2];\n        for (int i = 0; i < n; i++) { pairs[i][0] = nums[i]; pairs[i][1] = i; }\n        Arrays.sort(pairs, Comparator.comparingInt(a -> a[0]));\n        int left = 0, right = n - 1;\n        while (left < right) {\n            int sum = pairs[left][0] + pairs[right][0];\n            if (sum == target) return new int[]{pairs[left][1], pairs[right][1]};\n            else if (sum < target) left++;\n            else right--;\n        }\n        return new int[]{};\n    }\n}",
          "python": "class Solution:\n    def twoSumBetter(self, nums: list[int], target: int) -> list[int]:\n        pairs = sorted([(num, i) for i, num in enumerate(nums)])\n        l, r = 0, len(nums) - 1\n        while l < r:\n            s = pairs[l][0] + pairs[r][0]\n            if s == target: return [pairs[l][1], pairs[r][1]]\n            elif s < target: l += 1\n            else: r -= 1\n        return []",
          "cpp": "#include <vector>\n#include <algorithm>\n\nclass Solution {\npublic:\n    std::vector<int> twoSumBetter(std::vector<int>& nums, int target) {\n        int n = nums.size();\n        std::vector<std::pair<int, int>> pairs(n);\n        for (int i = 0; i < n; i++) pairs[i] = {nums[i], i};\n        std::sort(pairs.begin(), pairs.end());\n        int l = 0, r = n - 1;\n        while (l < r) {\n            int s = pairs[l].first + pairs[r].first;\n            if (s == target) return {pairs[l].second, pairs[r].second};\n            else if (s < target) l++;\n            else r--;\n        }\n        return {};\n    }\n};",
          "javascript": "function twoSumBetter(nums, target) {\n    const pairs = nums.map((v, i) => [v, i]);\n    pairs.sort((a, b) => a[0] - b[0]);\n    let l = 0, r = nums.length - 1;\n    while (l < r) {\n        const s = pairs[l][0] + pairs[r][0];\n        if (s === target) return [pairs[l][1], pairs[r][1]];\n        else if (s < target) l++;\n        else r--;\n    }\n    return [];\n}"
        }
      },
      "optimal": {
        "name": "Optimal (One-Pass Hash Map (Complement Lookup))",
        "tier": "optimal",
        "badge": "\ud83e\udd47 Optimal",
        "intuition": [
          "Create an empty HashMap mapping element values to their indices.",
          "Iterate through the array with index i and value num.",
          "Compute complement = target - num.",
          "If complement is already in the map, return [map.get(complement), i].",
          "Otherwise, record map.put(num, i)."
        ],
        "pseudocode": [
          "FUNCTION twoSum(nums, target):",
          "  map = new Map()",
          "  FOR i from 0 TO nums.length - 1:",
          "    complement = target - nums[i]",
          "    IF map.has(complement):",
          "      RETURN [map.get(complement), i]",
          "    map.set(nums[i], i)",
          "  RETURN []"
        ],
        "timeComplexity": "O(N)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "For each element x, looks up complement = target - x in a HashMap in O(1) average time, solving in a single linear pass.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        Map<Integer, Integer> map = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int complement = target - nums[i];\n            if (map.containsKey(complement)) {\n                return new int[]{map.get(complement), i};\n            }\n            map.put(nums[i], i);\n        }\n        return new int[]{};\n    }\n}",
          "python": "class Solution:\n    def twoSum(self, nums: list[int], target: int) -> list[int]:\n        seen = {}\n        for i, num in enumerate(nums):\n            comp = target - num\n            if comp in seen: return [seen[comp], i]\n            seen[num] = i\n        return []",
          "cpp": "#include <vector>\n#include <unordered_map>\n\nclass Solution {\npublic:\n    std::vector<int> twoSum(std::vector<int>& nums, int target) {\n        std::unordered_map<int, int> map;\n        for (int i = 0; i < (int)nums.size(); i++) {\n            int comp = target - nums[i];\n            if (map.count(comp)) return {map[comp], i};\n            map[nums[i]] = i;\n        }\n        return {};\n    }\n};",
          "javascript": "function twoSum(nums, target) {\n    const map = new Map();\n    for (let i = 0; i < nums.length; i++) {\n        const comp = target - nums[i];\n        if (map.has(comp)) return [map.get(comp), i];\n        map.set(nums[i], i);\n    }\n    return [];\n}"
        }
      }
    }
  },
  "maximum_subarray": {
    "questionId": "archetype-maximum_subarray",
    "pattern": "Kadane's Algorithm (Dynamic Programming)",
    "intuition": [
      "Initialize maxSoFar = nums[0] and currentSum = nums[0].",
      "For each element num starting from index 1:",
      "currentSum = max(num, currentSum + num).",
      "maxSoFar = max(maxSoFar, currentSum).",
      "Returns maxSoFar."
    ],
    "pseudocode": [
      "FUNCTION maxSubArray(nums):",
      "  curSum = nums[0]; maxSum = nums[0]",
      "  FOR i from 1 TO nums.length - 1:",
      "    curSum = MAX(nums[i], curSum + nums[i])",
      "    maxSum = MAX(maxSum, curSum)",
      "  RETURN maxSum"
    ],
    "timeComplexity": "O(N)",
    "spaceComplexity": "O(1)",
    "complexityExplanation": "Maintains running maximum sum ending at current index. Resets running sum to current element when running sum drops negative in O(N) time and O(1) space.",
    "edgeCases": [
      "All negative numbers (returns largest negative)",
      "Single element array",
      "All positive numbers"
    ],
    "code": {
      "java": "public class Solution {\n    public int maxSubArray(int[] nums) {\n        int maxSoFar = nums[0], currentSum = nums[0];\n        for (int i = 1; i < nums.length; i++) {\n            currentSum = Math.max(nums[i], currentSum + nums[i]);\n            maxSoFar = Math.max(maxSoFar, currentSum);\n        }\n        return maxSoFar;\n    }\n}",
      "python": "class Solution:\n    def maxSubArray(self, nums: list[int]) -> int:\n        max_so_far = cur = nums[0]\n        for x in nums[1:]:\n            cur = max(x, cur + x)\n            max_so_far = max(max_so_far, cur)\n        return max_so_far",
      "cpp": "#include <vector>\n#include <algorithm>\n\nclass Solution {\npublic:\n    int maxSubArray(std::vector<int>& nums) {\n        int maxSoFar = nums[0], cur = nums[0];\n        for (size_t i = 1; i < nums.size(); i++) {\n            cur = std::max(nums[i], cur + nums[i]);\n            maxSoFar = std::max(maxSoFar, cur);\n        }\n        return maxSoFar;\n    }\n};",
      "javascript": "function maxSubArray(nums) {\n    let maxSoFar = nums[0], cur = nums[0];\n    for (let i = 1; i < nums.length; i++) {\n        cur = Math.max(nums[i], cur + nums[i]);\n        maxSoFar = Math.max(maxSoFar, cur);\n    }\n    return maxSoFar;\n}"
    },
    "approaches": {
      "brute": {
        "name": "Brute Force (Evaluate All Subarray Sums)",
        "tier": "brute",
        "badge": "\ud83e\udd49 Brute Force",
        "intuition": [
          "Nested loop subarray checks."
        ],
        "timeComplexity": "O(N\u00b2)",
        "spaceComplexity": "O(1)",
        "complexityExplanation": "Loops over all start indices i and end indices j, maintaining running sum to find the global maximum.",
        "code": {
          "java": "public class Solution {\n    public int maxSubArrayBrute(int[] nums) {\n        int max = nums[0];\n        for (int i = 0; i < nums.length; i++) {\n            int sum = 0;\n            for (int j = i; j < nums.length; j++) {\n                sum += nums[j];\n                max = Math.max(max, sum);\n            }\n        }\n        return max;\n    }\n}",
          "python": "class Solution:\n    def maxSubArrayBrute(self, nums: list[int]) -> int:\n        max_sum = nums[0]\n        for i in range(len(nums)):\n            cur = 0\n            for j in range(i, len(nums)):\n                cur += nums[j]\n                max_sum = max(max_sum, cur)\n        return max_sum",
          "cpp": "#include <vector>\n#include <algorithm>\n\nclass Solution {\npublic:\n    int maxSubArrayBrute(std::vector<int>& nums) {\n        int maxVal = nums[0];\n        for (size_t i = 0; i < nums.size(); i++) {\n            int sum = 0;\n            for (size_t j = i; j < nums.size(); j++) {\n                sum += nums[j];\n                maxVal = std::max(maxVal, sum);\n            }\n        }\n        return maxVal;\n    }\n};",
          "javascript": "function maxSubArrayBrute(nums) {\n    let maxVal = nums[0];\n    for (let i = 0; i < nums.length; i++) {\n        let sum = 0;\n        for (let j = i; j < nums.length; j++) {\n            sum += nums[j];\n            maxVal = Math.max(maxVal, sum);\n        }\n    }\n    return maxVal;\n}"
        }
      },
      "better": {
        "name": "Better (Prefix Sums with Minimum Prefix Tracking)",
        "tier": "better",
        "badge": "\ud83e\udd48 Better",
        "intuition": [
          "Prefix sum tracking."
        ],
        "timeComplexity": "O(N)",
        "spaceComplexity": "O(1)",
        "complexityExplanation": "Computes prefix sum at each step; max subarray ending at i is prefix[i] - minPrefixSoFar.",
        "code": {
          "java": "public class Solution {\n    public int maxSubArrayBetter(int[] nums) {\n        int maxSum = nums[0], minPrefix = 0, prefix = 0;\n        for (int x : nums) {\n            prefix += x;\n            maxSum = Math.max(maxSum, prefix - minPrefix);\n            minPrefix = Math.min(minPrefix, prefix);\n        }\n        return maxSum;\n    }\n}",
          "python": "class Solution:\n    def maxSubArrayBetter(self, nums: list[int]) -> int:\n        max_sum, min_p, p = nums[0], 0, 0\n        for x in nums:\n            p += x\n            max_sum = max(max_sum, p - min_p)\n            min_p = min(min_p, p)\n        return max_sum",
          "cpp": "#include <vector>\n#include <algorithm>\n\nclass Solution {\npublic:\n    int maxSubArrayBetter(std::vector<int>& nums) {\n        int maxSum = nums[0], minPrefix = 0, prefix = 0;\n        for (int x : nums) {\n            prefix += x;\n            maxSum = std::max(maxSum, prefix - minPrefix);\n            minPrefix = std::min(minPrefix, prefix);\n        }\n        return maxSum;\n    }\n};",
          "javascript": "function maxSubArrayBetter(nums) {\n    let maxSum = nums[0], minPrefix = 0, prefix = 0;\n    for (const x of nums) {\n        prefix += x;\n        maxSum = Math.max(maxSum, prefix - minPrefix);\n        minPrefix = Math.min(minPrefix, prefix);\n    }\n    return maxSum;\n}"
        }
      },
      "optimal": {
        "name": "Optimal (Kadane's Algorithm (Dynamic Programming))",
        "tier": "optimal",
        "badge": "\ud83e\udd47 Optimal",
        "intuition": [
          "Initialize maxSoFar = nums[0] and currentSum = nums[0].",
          "For each element num starting from index 1:",
          "currentSum = max(num, currentSum + num).",
          "maxSoFar = max(maxSoFar, currentSum).",
          "Returns maxSoFar."
        ],
        "pseudocode": [
          "FUNCTION maxSubArray(nums):",
          "  curSum = nums[0]; maxSum = nums[0]",
          "  FOR i from 1 TO nums.length - 1:",
          "    curSum = MAX(nums[i], curSum + nums[i])",
          "    maxSum = MAX(maxSum, curSum)",
          "  RETURN maxSum"
        ],
        "timeComplexity": "O(N)",
        "spaceComplexity": "O(1)",
        "complexityExplanation": "Maintains running maximum sum ending at current index. Resets running sum to current element when running sum drops negative in O(N) time and O(1) space.",
        "code": {
          "java": "public class Solution {\n    public int maxSubArray(int[] nums) {\n        int maxSoFar = nums[0], currentSum = nums[0];\n        for (int i = 1; i < nums.length; i++) {\n            currentSum = Math.max(nums[i], currentSum + nums[i]);\n            maxSoFar = Math.max(maxSoFar, currentSum);\n        }\n        return maxSoFar;\n    }\n}",
          "python": "class Solution:\n    def maxSubArray(self, nums: list[int]) -> int:\n        max_so_far = cur = nums[0]\n        for x in nums[1:]:\n            cur = max(x, cur + x)\n            max_so_far = max(max_so_far, cur)\n        return max_so_far",
          "cpp": "#include <vector>\n#include <algorithm>\n\nclass Solution {\npublic:\n    int maxSubArray(std::vector<int>& nums) {\n        int maxSoFar = nums[0], cur = nums[0];\n        for (size_t i = 1; i < nums.size(); i++) {\n            cur = std::max(nums[i], cur + nums[i]);\n            maxSoFar = std::max(maxSoFar, cur);\n        }\n        return maxSoFar;\n    }\n};",
          "javascript": "function maxSubArray(nums) {\n    let maxSoFar = nums[0], cur = nums[0];\n    for (let i = 1; i < nums.length; i++) {\n        cur = Math.max(nums[i], cur + nums[i]);\n        maxSoFar = Math.max(maxSoFar, cur);\n    }\n    return maxSoFar;\n}"
        }
      }
    }
  },
  "dutch_national_flag": {
    "questionId": "archetype-dutch_national_flag",
    "pattern": "Dutch National Flag 3-Way Partitioning",
    "intuition": [
      "Initialize low = 0, mid = 0, high = n - 1.",
      "While mid <= high:",
      "If nums[mid] == 0: swap(nums[low], nums[mid]), low++, mid++.",
      "If nums[mid] == 1: mid++.",
      "If nums[mid] == 2: swap(nums[mid], nums[high]), high--."
    ],
    "pseudocode": [
      "FUNCTION sortColors(nums):",
      "  low = 0, mid = 0, high = nums.length - 1",
      "  WHILE mid <= high:",
      "    IF nums[mid] == 0: swap(nums[low++], nums[mid++])",
      "    ELSE IF nums[mid] == 1: mid++",
      "    ELSE: swap(nums[mid], nums[high--])"
    ],
    "timeComplexity": "O(N)",
    "spaceComplexity": "O(1)",
    "complexityExplanation": "Maintains 3 pointers (low, mid, high) to partition array into 0s, 1s, and 2s in-place in a single pass.",
    "edgeCases": [
      "Array with only 0s, 1s, or 2s",
      "Already sorted array",
      "Reverse sorted array"
    ],
    "code": {
      "java": "public class Solution {\n    public void sortColors(int[] nums) {\n        int low = 0, mid = 0, high = nums.length - 1;\n        while (mid <= high) {\n            if (nums[mid] == 0) {\n                int temp = nums[low]; nums[low] = nums[mid]; nums[mid] = temp;\n                low++; mid++;\n            } else if (nums[mid] == 1) {\n                mid++;\n            } else {\n                int temp = nums[mid]; nums[mid] = nums[high]; nums[high] = temp;\n                high--;\n            }\n        }\n    }\n}",
      "python": "class Solution:\n    def sortColors(self, nums: list[int]) -> None:\n        low, mid, high = 0, 0, len(nums) - 1\n        while mid <= high:\n            if nums[mid] == 0:\n                nums[low], nums[mid] = nums[mid], nums[low]\n                low += 1; mid += 1\n            elif nums[mid] == 1:\n                mid += 1\n            else:\n                nums[mid], nums[high] = nums[high], nums[mid]\n                high -= 1",
      "cpp": "#include <vector>\n#include <algorithm>\n\nclass Solution {\npublic:\n    void sortColors(std::vector<int>& nums) {\n        int low = 0, mid = 0, high = nums.size() - 1;\n        while (mid <= high) {\n            if (nums[mid] == 0) std::swap(nums[low++], nums[mid++]);\n            else if (nums[mid] == 1) mid++;\n            else std::swap(nums[mid], nums[high--]);\n        }\n    }\n};",
      "javascript": "function sortColors(nums) {\n    let low = 0, mid = 0, high = nums.length - 1;\n    while (mid <= high) {\n        if (nums[mid] === 0) {\n            [nums[low], nums[mid]] = [nums[mid], nums[low]];\n            low++; mid++;\n        } else if (nums[mid] === 1) {\n            mid++;\n        } else {\n            [nums[mid], nums[high]] = [nums[high], nums[mid]];\n            high--;\n        }\n    }\n}"
    },
    "approaches": {
      "brute": {
        "name": "Brute Force (Standard Library Sort)",
        "tier": "brute",
        "badge": "\ud83e\udd49 Brute Force",
        "intuition": [
          "Standard sort."
        ],
        "timeComplexity": "O(N log N)",
        "spaceComplexity": "O(1)",
        "complexityExplanation": "Uses language quicksort/timsort algorithm to sort the array.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public void sortColorsBrute(int[] nums) {\n        Arrays.sort(nums);\n    }\n}",
          "python": "class Solution:\n    def sortColorsBrute(self, nums: list[int]) -> None:\n        nums.sort()",
          "cpp": "#include <vector>\n#include <algorithm>\n\nclass Solution {\npublic:\n    void sortColorsBrute(std::vector<int>& nums) {\n        std::sort(nums.begin(), nums.end());\n    }\n};",
          "javascript": "function sortColorsBrute(nums) {\n    nums.sort((a, b) => a - b);\n}"
        }
      },
      "better": {
        "name": "Better (Two-Pass Counting Sort)",
        "tier": "better",
        "badge": "\ud83e\udd48 Better",
        "intuition": [
          "Two pass counting."
        ],
        "timeComplexity": "O(2N) = O(N)",
        "spaceComplexity": "O(1)",
        "complexityExplanation": "Counts occurrences of 0, 1, 2 in first pass, then overwrites array in second pass.",
        "code": {
          "java": "public class Solution {\n    public void sortColorsBetter(int[] nums) {\n        int c0 = 0, c1 = 0, c2 = 0;\n        for (int x : nums) {\n            if (x == 0) c0++;\n            else if (x == 1) c1++;\n            else c2++;\n        }\n        int idx = 0;\n        while (c0-- > 0) nums[idx++] = 0;\n        while (c1-- > 0) nums[idx++] = 1;\n        while (c2-- > 0) nums[idx++] = 2;\n    }\n}",
          "python": "class Solution:\n    def sortColorsBetter(self, nums: list[int]) -> None:\n        c0, c1, c2 = nums.count(0), nums.count(1), nums.count(2)\n        nums[:c0] = [0] * c0\n        nums[c0:c0+c1] = [1] * c1\n        nums[c0+c1:] = [2] * c2",
          "cpp": "#include <vector>\n\nclass Solution {\npublic:\n    void sortColorsBetter(std::vector<int>& nums) {\n        int c0 = 0, c1 = 0, c2 = 0;\n        for (int x : nums) { if (x == 0) c0++; else if (x == 1) c1++; else c2++; }\n        int idx = 0;\n        while (c0--) nums[idx++] = 0;\n        while (c1--) nums[idx++] = 1;\n        while (c2--) nums[idx++] = 2;\n    }\n};",
          "javascript": "function sortColorsBetter(nums) {\n    let c0 = 0, c1 = 0, c2 = 0;\n    for (const x of nums) { if (x === 0) c0++; else if (x === 1) c1++; else c2++; }\n    let idx = 0;\n    while (c0-- > 0) nums[idx++] = 0;\n    while (c1-- > 0) nums[idx++] = 1;\n    while (c2-- > 0) nums[idx++] = 2;\n}"
        }
      },
      "optimal": {
        "name": "Optimal (Dutch National Flag 3-Way Partitioning)",
        "tier": "optimal",
        "badge": "\ud83e\udd47 Optimal",
        "intuition": [
          "Initialize low = 0, mid = 0, high = n - 1.",
          "While mid <= high:",
          "If nums[mid] == 0: swap(nums[low], nums[mid]), low++, mid++.",
          "If nums[mid] == 1: mid++.",
          "If nums[mid] == 2: swap(nums[mid], nums[high]), high--."
        ],
        "pseudocode": [
          "FUNCTION sortColors(nums):",
          "  low = 0, mid = 0, high = nums.length - 1",
          "  WHILE mid <= high:",
          "    IF nums[mid] == 0: swap(nums[low++], nums[mid++])",
          "    ELSE IF nums[mid] == 1: mid++",
          "    ELSE: swap(nums[mid], nums[high--])"
        ],
        "timeComplexity": "O(N)",
        "spaceComplexity": "O(1)",
        "complexityExplanation": "Maintains 3 pointers (low, mid, high) to partition array into 0s, 1s, and 2s in-place in a single pass.",
        "code": {
          "java": "public class Solution {\n    public void sortColors(int[] nums) {\n        int low = 0, mid = 0, high = nums.length - 1;\n        while (mid <= high) {\n            if (nums[mid] == 0) {\n                int temp = nums[low]; nums[low] = nums[mid]; nums[mid] = temp;\n                low++; mid++;\n            } else if (nums[mid] == 1) {\n                mid++;\n            } else {\n                int temp = nums[mid]; nums[mid] = nums[high]; nums[high] = temp;\n                high--;\n            }\n        }\n    }\n}",
          "python": "class Solution:\n    def sortColors(self, nums: list[int]) -> None:\n        low, mid, high = 0, 0, len(nums) - 1\n        while mid <= high:\n            if nums[mid] == 0:\n                nums[low], nums[mid] = nums[mid], nums[low]\n                low += 1; mid += 1\n            elif nums[mid] == 1:\n                mid += 1\n            else:\n                nums[mid], nums[high] = nums[high], nums[mid]\n                high -= 1",
          "cpp": "#include <vector>\n#include <algorithm>\n\nclass Solution {\npublic:\n    void sortColors(std::vector<int>& nums) {\n        int low = 0, mid = 0, high = nums.size() - 1;\n        while (mid <= high) {\n            if (nums[mid] == 0) std::swap(nums[low++], nums[mid++]);\n            else if (nums[mid] == 1) mid++;\n            else std::swap(nums[mid], nums[high--]);\n        }\n    }\n};",
          "javascript": "function sortColors(nums) {\n    let low = 0, mid = 0, high = nums.length - 1;\n    while (mid <= high) {\n        if (nums[mid] === 0) {\n            [nums[low], nums[mid]] = [nums[mid], nums[low]];\n            low++; mid++;\n        } else if (nums[mid] === 1) {\n            mid++;\n        } else {\n            [nums[mid], nums[high]] = [nums[high], nums[mid]];\n            high--;\n        }\n    }\n}"
        }
      }
    }
  },
  "merge_intervals": {
    "questionId": "archetype-merge_intervals",
    "pattern": "Greedy Interval Merging",
    "intuition": [
      "Sort intervals by start time: intervals.sort(a[0] - b[0]).",
      "Initialize merged list with first interval.",
      "For each subsequent interval:",
      "If interval.start <= currentMerged.end, merge by setting currentMerged.end = max(currentMerged.end, interval.end).",
      "Else, add interval as a new non-overlapping range."
    ],
    "pseudocode": [
      "FUNCTION merge(intervals):",
      "  sort intervals by start time",
      "  merged = [intervals[0]]",
      "  FOR i from 1 TO n - 1:",
      "    last = merged.last()",
      "    IF intervals[i].start <= last.end:",
      "      last.end = MAX(last.end, intervals[i].end)",
      "    ELSE:",
      "      merged.add(intervals[i])",
      "  RETURN merged"
    ],
    "timeComplexity": "O(N log N)",
    "spaceComplexity": "O(N)",
    "complexityExplanation": "Sorts intervals by start time ascending. Greedily extends the current interval's end if next interval overlaps, else appends new interval in O(N log N).",
    "edgeCases": [
      "Single interval",
      "No overlapping intervals",
      "All intervals nested inside one large interval"
    ],
    "code": {
      "java": "import java.util.*;\n\npublic class Solution {\n    public int[][] merge(int[][] intervals) {\n        if (intervals.length <= 1) return intervals;\n        Arrays.sort(intervals, Comparator.comparingInt(a -> a[0]));\n        List<int[]> merged = new ArrayList<>();\n        int[] current = intervals[0];\n        merged.add(current);\n        for (int[] next : intervals) {\n            if (next[0] <= current[1]) {\n                current[1] = Math.max(current[1], next[1]);\n            } else {\n                current = next;\n                merged.add(current);\n            }\n        }\n        return merged.toArray(new int[merged.size()][]);\n    }\n}",
      "python": "class Solution:\n    def merge(self, intervals: list[list[int]]) -> list[list[int]]:\n        intervals.sort(key=lambda x: x[0])\n        merged = [intervals[0]]\n        for cur in intervals[1:]:\n            last = merged[-1]\n            if cur[0] <= last[1]:\n                last[1] = max(last[1], cur[1])\n            else:\n                merged.append(cur)\n        return merged",
      "cpp": "#include <vector>\n#include <algorithm>\n\nclass Solution {\npublic:\n    std::vector<std::vector<int>> merge(std::vector<std::vector<int>>& intervals) {\n        if (intervals.empty()) return {};\n        std::sort(intervals.begin(), intervals.end());\n        std::vector<std::vector<int>> res = {intervals[0]};\n        for (size_t i = 1; i < intervals.size(); i++) {\n            if (intervals[i][0] <= res.back()[1]) {\n                res.back()[1] = std::max(res.back()[1], intervals[i][1]);\n            } else {\n                res.push_back(intervals[i]);\n            }\n        }\n        return res;\n    }\n};",
      "javascript": "function merge(intervals) {\n    if (intervals.length <= 1) return intervals;\n    intervals.sort((a, b) => a[0] - b[0]);\n    const merged = [intervals[0]];\n    for (let i = 1; i < intervals.length; i++) {\n        const last = merged[merged.length - 1];\n        if (intervals[i][0] <= last[1]) {\n            last[1] = Math.max(last[1], intervals[i][1]);\n        } else {\n            merged.push(intervals[i]);\n        }\n    }\n    return merged;\n}"
    },
    "approaches": {
      "brute": {
        "name": "Brute Force (Pairwise Interval Merging Until Stable)",
        "tier": "brute",
        "badge": "\ud83e\udd49 Brute Force",
        "intuition": [
          "Exhaustive pair merger."
        ],
        "timeComplexity": "O(N\u00b3)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Repeatedly finds two overlapping intervals and replaces them with their union until no overlaps exist.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int[][] mergeBrute(int[][] intervals) {\n        List<int[]> list = new ArrayList<>(Arrays.asList(intervals));\n        boolean merged = true;\n        while (merged) {\n            merged = false;\n            for (int i = 0; i < list.size() && !merged; i++) {\n                for (int j = i + 1; j < list.size() && !merged; j++) {\n                    int[] a = list.get(i), b = list.get(j);\n                    if (!(a[1] < b[0] || b[1] < a[0])) {\n                        int[] u = new int[]{Math.min(a[0], b[0]), Math.max(a[1], b[1])};\n                        list.remove(j); list.remove(i);\n                        list.add(u);\n                        merged = true;\n                    }\n                }\n            }\n        }\n        return list.toArray(new int[list.size()][]);\n    }\n}",
          "python": "class Solution:\n    def mergeBrute(self, intervals: list[list[int]]) -> list[list[int]]:\n        items = list(intervals)\n        changed = True\n        while changed:\n            changed = False\n            for i in range(len(items)):\n                for j in range(i + 1, len(items)):\n                    a, b = items[i], items[j]\n                    if not (a[1] < b[0] or b[1] < a[0]):\n                        merged = [min(a[0], b[0]), max(a[1], b[1])]\n                        items.pop(j); items.pop(i)\n                        items.append(merged)\n                        changed = True; break\n                if changed: break\n        return sorted(items, key=lambda x: x[0])",
          "cpp": "#include <vector>\n#include <algorithm>\n\nclass Solution {\npublic:\n    std::vector<std::vector<int>> mergeBrute(std::vector<std::vector<int>>& intervals) {\n        auto list = intervals;\n        bool merged = true;\n        while (merged) {\n            merged = false;\n            for (size_t i = 0; i < list.size() && !merged; i++) {\n                for (size_t j = i + 1; j < list.size() && !merged; j++) {\n                    auto a = list[i], b = list[j];\n                    if (!(a[1] < b[0] || b[1] < a[0])) {\n                        std::vector<int> u = {std::min(a[0], b[0]), std::max(a[1], b[1])};\n                        list.erase(list.begin() + j);\n                        list.erase(list.begin() + i);\n                        list.push_back(u);\n                        merged = true;\n                    }\n                }\n            }\n        }\n        std::sort(list.begin(), list.end());\n        return list;\n    }\n};",
          "javascript": "function mergeBrute(intervals) {\n    let list = [...intervals];\n    let merged = true;\n    while (merged) {\n        merged = false;\n        for (let i = 0; i < list.length && !merged; i++) {\n            for (let j = i + 1; j < list.length && !merged; j++) {\n                const a = list[i], b = list[j];\n                if (!(a[1] < b[0] || b[1] < a[0])) {\n                    const u = [Math.min(a[0], b[0]), Math.max(a[1], b[1])];\n                    list.splice(j, 1);\n                    list.splice(i, 1);\n                    list.push(u);\n                    merged = true;\n                }\n            }\n        }\n    }\n    return list.sort((a, b) => a[0] - b[0]);\n}"
        }
      },
      "better": {
        "name": "Better (Connected Component Graph on Intervals)",
        "tier": "better",
        "badge": "\ud83e\udd48 Better",
        "intuition": [
          "Interval graph components."
        ],
        "timeComplexity": "O(N\u00b2)",
        "spaceComplexity": "O(N\u00b2)",
        "complexityExplanation": "Builds an overlap graph between intervals and runs BFS/DFS connected components to merge.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int[][] mergeBetter(int[][] intervals) {\n        int n = intervals.length;\n        Arrays.sort(intervals, Comparator.comparingInt(a -> a[0]));\n        List<int[]> res = new ArrayList<>();\n        int i = 0;\n        while (i < n) {\n            int start = intervals[i][0], end = intervals[i][1];\n            int j = i + 1;\n            while (j < n && intervals[j][0] <= end) {\n                end = Math.max(end, intervals[j][1]);\n                j++;\n            }\n            res.add(new int[]{start, end});\n            i = j;\n        }\n        return res.toArray(new int[res.size()][]);\n    }\n}",
          "python": "class Solution:\n    def mergeBetter(self, intervals: list[list[int]]) -> list[list[int]]:\n        intervals.sort(key=lambda x: x[0])\n        res, i, n = [], 0, len(intervals)\n        while i < n:\n            s, e = intervals[i]\n            j = i + 1\n            while j < n and intervals[j][0] <= e:\n                e = max(e, intervals[j][1]); j += 1\n            res.append([s, e])\n            i = j\n        return res",
          "cpp": "#include <vector>\n#include <algorithm>\n\nclass Solution {\npublic:\n    std::vector<std::vector<int>> mergeBetter(std::vector<std::vector<int>>& intervals) {\n        std::sort(intervals.begin(), intervals.end());\n        std::vector<std::vector<int>> res;\n        int i = 0, n = intervals.size();\n        while (i < n) {\n            int s = intervals[i][0], e = intervals[i][1], j = i + 1;\n            while (j < n && intervals[j][0] <= e) { e = std::max(e, intervals[j][1]); j++; }\n            res.push_back({s, e});\n            i = j;\n        }\n        return res;\n    }\n};",
          "javascript": "function mergeBetter(intervals) {\n    intervals.sort((a, b) => a[0] - b[0]);\n    const res = [];\n    let i = 0;\n    while (i < intervals.length) {\n        let s = intervals[i][0], e = intervals[i][1], j = i + 1;\n        while (j < intervals.length && intervals[j][0] <= e) {\n            e = Math.max(e, intervals[j][1]);\n            j++;\n        }\n        res.push([s, e]);\n        i = j;\n    }\n    return res;\n}"
        }
      },
      "optimal": {
        "name": "Optimal (Greedy Interval Merging)",
        "tier": "optimal",
        "badge": "\ud83e\udd47 Optimal",
        "intuition": [
          "Sort intervals by start time: intervals.sort(a[0] - b[0]).",
          "Initialize merged list with first interval.",
          "For each subsequent interval:",
          "If interval.start <= currentMerged.end, merge by setting currentMerged.end = max(currentMerged.end, interval.end).",
          "Else, add interval as a new non-overlapping range."
        ],
        "pseudocode": [
          "FUNCTION merge(intervals):",
          "  sort intervals by start time",
          "  merged = [intervals[0]]",
          "  FOR i from 1 TO n - 1:",
          "    last = merged.last()",
          "    IF intervals[i].start <= last.end:",
          "      last.end = MAX(last.end, intervals[i].end)",
          "    ELSE:",
          "      merged.add(intervals[i])",
          "  RETURN merged"
        ],
        "timeComplexity": "O(N log N)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Sorts intervals by start time ascending. Greedily extends the current interval's end if next interval overlaps, else appends new interval in O(N log N).",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int[][] merge(int[][] intervals) {\n        if (intervals.length <= 1) return intervals;\n        Arrays.sort(intervals, Comparator.comparingInt(a -> a[0]));\n        List<int[]> merged = new ArrayList<>();\n        int[] current = intervals[0];\n        merged.add(current);\n        for (int[] next : intervals) {\n            if (next[0] <= current[1]) {\n                current[1] = Math.max(current[1], next[1]);\n            } else {\n                current = next;\n                merged.add(current);\n            }\n        }\n        return merged.toArray(new int[merged.size()][]);\n    }\n}",
          "python": "class Solution:\n    def merge(self, intervals: list[list[int]]) -> list[list[int]]:\n        intervals.sort(key=lambda x: x[0])\n        merged = [intervals[0]]\n        for cur in intervals[1:]:\n            last = merged[-1]\n            if cur[0] <= last[1]:\n                last[1] = max(last[1], cur[1])\n            else:\n                merged.append(cur)\n        return merged",
          "cpp": "#include <vector>\n#include <algorithm>\n\nclass Solution {\npublic:\n    std::vector<std::vector<int>> merge(std::vector<std::vector<int>>& intervals) {\n        if (intervals.empty()) return {};\n        std::sort(intervals.begin(), intervals.end());\n        std::vector<std::vector<int>> res = {intervals[0]};\n        for (size_t i = 1; i < intervals.size(); i++) {\n            if (intervals[i][0] <= res.back()[1]) {\n                res.back()[1] = std::max(res.back()[1], intervals[i][1]);\n            } else {\n                res.push_back(intervals[i]);\n            }\n        }\n        return res;\n    }\n};",
          "javascript": "function merge(intervals) {\n    if (intervals.length <= 1) return intervals;\n    intervals.sort((a, b) => a[0] - b[0]);\n    const merged = [intervals[0]];\n    for (let i = 1; i < intervals.length; i++) {\n        const last = merged[merged.length - 1];\n        if (intervals[i][0] <= last[1]) {\n            last[1] = Math.max(last[1], intervals[i][1]);\n        } else {\n            merged.push(intervals[i]);\n        }\n    }\n    return merged;\n}"
        }
      }
    }
  }
};
