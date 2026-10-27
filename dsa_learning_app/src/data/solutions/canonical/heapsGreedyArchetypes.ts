import { ProblemSolution } from '../../../types/dsa';

export const HEAPS_GREEDY_ARCHETYPES: Record<string, ProblemSolution> = {
  "top_k_frequent": {
    "questionId": "archetype-top_k_frequent",
    "pattern": "Bucket Sort by Frequencies",
    "intuition": [
      "Count frequencies of each unique number in a HashMap.",
      "Create buckets where index i holds all numbers that appeared with frequency i.",
      "Iterate backwards from highest frequency bucket N down to 0, collecting numbers into result list until k elements are gathered."
    ],
    "pseudocode": [
      "FUNCTION topKFrequent(nums, k):",
      "  count = HashMap(); buckets = Array(n + 1, [])",
      "  FOR num IN nums: count[num]++",
      "  FOR (num, freq) IN count: buckets[freq].add(num)",
      "  res = []",
      "  FOR f from n DOWNTO 0:",
      "    FOR num IN buckets[f]:",
      "      res.add(num)",
      "      IF res.length == k: RETURN res"
    ],
    "timeComplexity": "O(N)",
    "spaceComplexity": "O(N)",
    "complexityExplanation": "Counts element frequencies into a HashMap then places elements into an array of buckets indexed by frequency in linear O(N) time.",
    "edgeCases": [
      "k = 1",
      "k = number of unique elements",
      "All elements have equal frequency"
    ],
    "code": {
      "java": "import java.util.*;\n\npublic class Solution {\n    public int[] topKFrequent(int[] nums, int k) {\n        Map<Integer, Integer> count = new HashMap<>();\n        for (int num : nums) count.put(num, count.getOrDefault(num, 0) + 1);\n        List<Integer>[] buckets = new List[nums.length + 1];\n        for (int num : count.keySet()) {\n            int freq = count.get(num);\n            if (buckets[freq] == null) buckets[freq] = new ArrayList<>();\n            buckets[freq].add(num);\n        }\n        int[] res = new int[k];\n        int idx = 0;\n        for (int i = buckets.length - 1; i >= 0 && idx < k; i--) {\n            if (buckets[i] != null) {\n                for (int num : buckets[i]) {\n                    res[idx++] = num;\n                    if (idx == k) break;\n                }\n            }\n        }\n        return res;\n    }\n}",
      "python": "from collections import Counter\n\nclass Solution:\n    def topKFrequent(self, nums: list[int], k: int) -> list[int]:\n        count = Counter(nums)\n        buckets = [[] for _ in range(len(nums) + 1)]\n        for num, freq in count.items():\n            buckets[freq].append(num)\n        res = []\n        for i in range(len(buckets) - 1, -1, -1):\n            for num in buckets[i]:\n                res.append(num)\n                if len(res) == k: return res\n        return res",
      "cpp": "#include <vector>\n#include <unordered_map>\n\nclass Solution {\npublic:\n    std::vector<int> topKFrequent(std::vector<int>& nums, int k) {\n        std::unordered_map<int, int> count;\n        for (int x : nums) count[x]++;\n        std::vector<std::vector<int>> buckets(nums.size() + 1);\n        for (auto& p : count) buckets[p.second].push_back(p.first);\n        std::vector<int> res;\n        for (int i = (int)buckets.size() - 1; i >= 0 && (int)res.size() < k; i--) {\n            for (int x : buckets[i]) {\n                res.push_back(x);\n                if ((int)res.size() == k) break;\n            }\n        }\n        return res;\n    }\n};",
      "javascript": "function topKFrequent(nums, k) {\n    const count = new Map();\n    for (const x of nums) count.set(x, (count.get(x) || 0) + 1);\n    const buckets = Array.from({length: nums.length + 1}, () => []);\n    for (const [num, freq] of count) buckets[freq].push(num);\n    const res = [];\n    for (let i = buckets.length - 1; i >= 0 && res.length < k; i--) {\n        for (const num of buckets[i]) {\n            res.push(num);\n            if (res.length === k) return res;\n        }\n    }\n    return res;\n}"
    },
    "approaches": {
      "brute": {
        "name": "Brute Force (Sort Entire Frequency Map)",
        "tier": "brute",
        "badge": "\ud83e\udd49 Brute Force",
        "intuition": [
          "Full sorting of frequencies."
        ],
        "timeComplexity": "O(N log N)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Counts all frequencies into a list of pairs and sorts the entire list descending.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int[] topKFrequentBrute(int[] nums, int k) {\n        Map<Integer, Integer> count = new HashMap<>();\n        for (int num : nums) count.put(num, count.getOrDefault(num, 0) + 1);\n        List<Map.Entry<Integer, Integer>> list = new ArrayList<>(count.entrySet());\n        list.sort((a, b) -> b.getValue() - a.getValue());\n        int[] res = new int[k];\n        for (int i = 0; i < k; i++) res[i] = list.get(i).getKey();\n        return res;\n    }\n}",
          "python": "from collections import Counter\n\nclass Solution:\n    def topKFrequentBrute(self, nums: list[int], k: int) -> list[int]:\n        count = Counter(nums)\n        sorted_items = sorted(count.items(), key=lambda x: -x[1])\n        return [item[0] for item in sorted_items[:k]]",
          "cpp": "#include <vector>\n#include <unordered_map>\n#include <algorithm>\n\nclass Solution {\npublic:\n    std::vector<int> topKFrequentBrute(std::vector<int>& nums, int k) {\n        std::unordered_map<int, int> count;\n        for (int x : nums) count[x]++;\n        std::vector<std::pair<int, int>> pairs(count.begin(), count.end());\n        std::sort(pairs.begin(), pairs.end(), [](const auto& a, const auto& b) { return a.second > b.second; });\n        std::vector<int> res;\n        for (int i = 0; i < k; i++) res.push_back(pairs[i].first);\n        return res;\n    }\n};",
          "javascript": "function topKFrequentBrute(nums, k) {\n    const count = new Map();\n    for (const x of nums) count.set(x, (count.get(x) || 0) + 1);\n    const list = Array.from(count.entries());\n    list.sort((a, b) => b[1] - a[1]);\n    return list.slice(0, k).map(e => e[0]);\n}"
        }
      },
      "better": {
        "name": "Better (Min-Heap of Size K)",
        "tier": "better",
        "badge": "\ud83e\udd48 Better",
        "intuition": [
          "Min-Heap of size k."
        ],
        "timeComplexity": "O(N log K)",
        "spaceComplexity": "O(N + K)",
        "complexityExplanation": "Maintains top k elements in a Min-Heap; whenever heap size exceeds k, poll the minimum frequency element.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int[] topKFrequentBetter(int[] nums, int k) {\n        Map<Integer, Integer> count = new HashMap<>();\n        for (int num : nums) count.put(num, count.getOrDefault(num, 0) + 1);\n        PriorityQueue<Integer> heap = new PriorityQueue<>(Comparator.comparingInt(count::get));\n        for (int num : count.keySet()) {\n            heap.offer(num);\n            if (heap.size() > k) heap.poll();\n        }\n        int[] res = new int[k];\n        for (int i = 0; i < k; i++) res[i] = heap.poll();\n        return res;\n    }\n}",
          "python": "import heapq\nfrom collections import Counter\n\nclass Solution:\n    def topKFrequentBetter(self, nums: list[int], k: int) -> list[int]:\n        count = Counter(nums)\n        heap = []\n        for num, freq in count.items():\n            heapq.heappush(heap, (freq, num))\n            if len(heap) > k: heapq.heappop(heap)\n        return [num for _, num in heap]",
          "cpp": "#include <vector>\n#include <unordered_map>\n#include <queue>\n\nclass Solution {\npublic:\n    std::vector<int> topKFrequentBetter(std::vector<int>& nums, int k) {\n        std::unordered_map<int, int> count;\n        for (int x : nums) count[x]++;\n        auto cmp = [&](int a, int b) { return count[a] > count[b]; };\n        std::priority_queue<int, std::vector<int>, decltype(cmp)> heap(cmp);\n        for (auto& p : count) {\n            heap.push(p.first);\n            if (heap.size() > (size_t)k) heap.pop();\n        }\n        std::vector<int> res;\n        while (!heap.empty()) { res.push_back(heap.top()); heap.pop(); }\n        return res;\n    }\n};",
          "javascript": "function topKFrequentBetter(nums, k) {\n    const count = new Map();\n    for (const x of nums) count.set(x, (count.get(x) || 0) + 1);\n    const sorted = Array.from(count.entries()).sort((a, b) => b[1] - a[1]);\n    return sorted.slice(0, k).map(x => x[0]);\n}"
        }
      },
      "optimal": {
        "name": "Optimal (Bucket Sort by Frequencies)",
        "tier": "optimal",
        "badge": "\ud83e\udd47 Optimal",
        "intuition": [
          "Count frequencies of each unique number in a HashMap.",
          "Create buckets where index i holds all numbers that appeared with frequency i.",
          "Iterate backwards from highest frequency bucket N down to 0, collecting numbers into result list until k elements are gathered."
        ],
        "pseudocode": [
          "FUNCTION topKFrequent(nums, k):",
          "  count = HashMap(); buckets = Array(n + 1, [])",
          "  FOR num IN nums: count[num]++",
          "  FOR (num, freq) IN count: buckets[freq].add(num)",
          "  res = []",
          "  FOR f from n DOWNTO 0:",
          "    FOR num IN buckets[f]:",
          "      res.add(num)",
          "      IF res.length == k: RETURN res"
        ],
        "timeComplexity": "O(N)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Counts element frequencies into a HashMap then places elements into an array of buckets indexed by frequency in linear O(N) time.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int[] topKFrequent(int[] nums, int k) {\n        Map<Integer, Integer> count = new HashMap<>();\n        for (int num : nums) count.put(num, count.getOrDefault(num, 0) + 1);\n        List<Integer>[] buckets = new List[nums.length + 1];\n        for (int num : count.keySet()) {\n            int freq = count.get(num);\n            if (buckets[freq] == null) buckets[freq] = new ArrayList<>();\n            buckets[freq].add(num);\n        }\n        int[] res = new int[k];\n        int idx = 0;\n        for (int i = buckets.length - 1; i >= 0 && idx < k; i--) {\n            if (buckets[i] != null) {\n                for (int num : buckets[i]) {\n                    res[idx++] = num;\n                    if (idx == k) break;\n                }\n            }\n        }\n        return res;\n    }\n}",
          "python": "from collections import Counter\n\nclass Solution:\n    def topKFrequent(self, nums: list[int], k: int) -> list[int]:\n        count = Counter(nums)\n        buckets = [[] for _ in range(len(nums) + 1)]\n        for num, freq in count.items():\n            buckets[freq].append(num)\n        res = []\n        for i in range(len(buckets) - 1, -1, -1):\n            for num in buckets[i]:\n                res.append(num)\n                if len(res) == k: return res\n        return res",
          "cpp": "#include <vector>\n#include <unordered_map>\n\nclass Solution {\npublic:\n    std::vector<int> topKFrequent(std::vector<int>& nums, int k) {\n        std::unordered_map<int, int> count;\n        for (int x : nums) count[x]++;\n        std::vector<std::vector<int>> buckets(nums.size() + 1);\n        for (auto& p : count) buckets[p.second].push_back(p.first);\n        std::vector<int> res;\n        for (int i = (int)buckets.size() - 1; i >= 0 && (int)res.size() < k; i--) {\n            for (int x : buckets[i]) {\n                res.push_back(x);\n                if ((int)res.size() == k) break;\n            }\n        }\n        return res;\n    }\n};",
          "javascript": "function topKFrequent(nums, k) {\n    const count = new Map();\n    for (const x of nums) count.set(x, (count.get(x) || 0) + 1);\n    const buckets = Array.from({length: nums.length + 1}, () => []);\n    for (const [num, freq] of count) buckets[freq].push(num);\n    const res = [];\n    for (let i = buckets.length - 1; i >= 0 && res.length < k; i--) {\n        for (const num of buckets[i]) {\n            res.push(num);\n            if (res.length === k) return res;\n        }\n    }\n    return res;\n}"
        }
      }
    }
  },
  "activity_selection": {
    "questionId": "archetype-activity_selection",
    "pattern": "Greedy Sort by End Times",
    "intuition": [
      "Sort all activities by their finish time.",
      "Always pick the first activity (it frees resources earliest).",
      "For each subsequent activity, if its start time >= last picked activity's finish time, select it and update lastFinish.",
      "Returns the maximum number of mutually compatible activities."
    ],
    "pseudocode": [
      "FUNCTION activitySelection(start, end, n):",
      "  sort activities by end time",
      "  count = 1; lastEnd = activities[0].end",
      "  FOR i from 1 TO n - 1:",
      "    IF activities[i].start >= lastEnd:",
      "      count++",
      "      lastEnd = activities[i].end",
      "  RETURN count"
    ],
    "timeComplexity": "O(N log N)",
    "spaceComplexity": "O(1)",
    "complexityExplanation": "Sorts intervals/activities by finish time ascending and greedily selects the next activity that begins after current ends in O(N log N).",
    "edgeCases": [
      "Single activity",
      "All overlapping activities",
      "All mutually non-overlapping activities"
    ],
    "code": {
      "java": "import java.util.*;\n\npublic class Solution {\n    public int activitySelection(int[] start, int[] end, int n) {\n        int[][] acts = new int[n][2];\n        for (int i = 0; i < n; i++) { acts[i][0] = start[i]; acts[i][1] = end[i]; }\n        Arrays.sort(acts, Comparator.comparingInt(a -> a[1]));\n        int count = 1, lastEnd = acts[0][1];\n        for (int i = 1; i < n; i++) {\n            if (acts[i][0] >= lastEnd) {\n                count++;\n                lastEnd = acts[i][1];\n            }\n        }\n        return count;\n    }\n}",
      "python": "class Solution:\n    def activitySelection(self, start: list[int], end: list[int], n: int) -> int:\n        acts = sorted(zip(start, end), key=lambda x: x[1])\n        count = 1\n        last_end = acts[0][1]\n        for s, e in acts[1:]:\n            if s >= last_end:\n                count += 1\n                last_end = e\n        return count",
      "cpp": "#include <vector>\n#include <algorithm>\n\nclass Solution {\npublic:\n    int activitySelection(std::vector<int>& start, std::vector<int>& end, int n) {\n        std::vector<std::pair<int, int>> acts(n);\n        for (int i = 0; i < n; i++) acts[i] = {end[i], start[i]};\n        std::sort(acts.begin(), acts.end());\n        int count = 1, lastEnd = acts[0].first;\n        for (int i = 1; i < n; i++) {\n            if (acts[i].second >= lastEnd) {\n                count++;\n                lastEnd = acts[i].first;\n            }\n        }\n        return count;\n    }\n};",
      "javascript": "function activitySelection(start, end, n) {\n    const acts = [];\n    for (let i = 0; i < n; i++) acts.push([start[i], end[i]]);\n    acts.sort((a, b) => a[1] - b[1]);\n    let count = 1, lastEnd = acts[0][1];\n    for (let i = 1; i < n; i++) {\n        if (acts[i][0] >= lastEnd) {\n            count++;\n            lastEnd = acts[i][1];\n        }\n    }\n    return count;\n}"
    },
    "approaches": {
      "brute": {
        "name": "Brute Force (Check All 2^N Subsets for Overlaps)",
        "tier": "brute",
        "badge": "\ud83e\udd49 Brute Force",
        "intuition": [
          "Evaluate all subsets."
        ],
        "timeComplexity": "O(2\u207f)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Generates all candidate subsets of activities and checks if each is mutually non-overlapping.",
        "code": {
          "java": "public class Solution {\n    public int activitySelectionBrute(int[] start, int[] end, int n) {\n        int max = 0;\n        int total = 1 << n;\n        for (int mask = 0; mask < total; mask++) {\n            boolean valid = true;\n            int count = 0;\n            for (int i = 0; i < n; i++) {\n                if ((mask & (1 << i)) != 0) {\n                    count++;\n                    for (int j = i + 1; j < n; j++) {\n                        if ((mask & (1 << j)) != 0) {\n                            if (!(end[i] <= start[j] || end[j] <= start[i])) { valid = false; break; }\n                        }\n                    }\n                    if (!valid) break;\n                }\n            }\n            if (valid) max = Math.max(max, count);\n        }\n        return max;\n    }\n}",
          "python": "class Solution:\n    def activitySelectionBrute(self, start: list[int], end: list[int], n: int) -> int:\n        max_c = 0\n        for mask in range(1 << n):\n            selected = [i for i in range(n) if (mask & (1 << i))]\n            valid = True\n            for i in range(len(selected)):\n                for j in range(i + 1, len(selected)):\n                    a, b = selected[i], selected[j]\n                    if not (end[a] <= start[b] or end[b] <= start[a]):\n                        valid = False; break\n                if not valid: break\n            if valid: max_c = max(max_c, len(selected))\n        return max_c",
          "cpp": "#include <vector>\n#include <algorithm>\n\nclass Solution {\npublic:\n    int activitySelectionBrute(std::vector<int>& start, std::vector<int>& end, int n) {\n        int maxVal = 0;\n        int total = 1 << n;\n        for (int mask = 0; mask < total; mask++) {\n            bool valid = true;\n            int count = 0;\n            for (int i = 0; i < n; i++) {\n                if (mask & (1 << i)) {\n                    count++;\n                    for (int j = i + 1; j < n; j++) {\n                        if (mask & (1 << j)) {\n                            if (!(end[i] <= start[j] || end[j] <= start[i])) { valid = false; break; }\n                        }\n                    }\n                    if (!valid) break;\n                }\n            }\n            if (valid) maxVal = std::max(maxVal, count);\n        }\n        return maxVal;\n    }\n};",
          "javascript": "function activitySelectionBrute(start, end, n) {\n    let max = 0;\n    const total = 1 << n;\n    for (let mask = 0; mask < total; mask++) {\n        let valid = true, count = 0;\n        for (let i = 0; i < n; i++) {\n            if ((mask & (1 << i)) !== 0) {\n                count++;\n                for (let j = i + 1; j < n; j++) {\n                    if ((mask & (1 << j)) !== 0) {\n                        if (!(end[i] <= start[j] || end[j] <= start[i])) { valid = false; break; }\n                    }\n                }\n                if (!valid) break;\n            }\n        }\n        if (valid) max = Math.max(max, count);\n    }\n    return max;\n}"
        }
      },
      "better": {
        "name": "Better (Interval Scheduling Dynamic Programming)",
        "tier": "better",
        "badge": "\ud83e\udd48 Better",
        "intuition": [
          "Interval DP."
        ],
        "timeComplexity": "O(N\u00b2)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Sorts activities by start time and computes LIS-style DP for max compatible set.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int activitySelectionBetter(int[] start, int[] end, int n) {\n        int[][] acts = new int[n][2];\n        for (int i = 0; i < n; i++) { acts[i][0] = start[i]; acts[i][1] = end[i]; }\n        Arrays.sort(acts, Comparator.comparingInt(a -> a[0]));\n        int[] dp = new int[n];\n        Arrays.fill(dp, 1);\n        int max = 1;\n        for (int i = 1; i < n; i++) {\n            for (int j = 0; j < i; j++) {\n                if (acts[j][1] <= acts[i][0]) dp[i] = Math.max(dp[i], dp[j] + 1);\n            }\n            max = Math.max(max, dp[i]);\n        }\n        return max;\n    }\n}",
          "python": "class Solution:\n    def activitySelectionBetter(self, start: list[int], end: list[int], n: int) -> int:\n        acts = sorted(zip(start, end), key=lambda x: x[0])\n        dp = [1] * n\n        for i in range(1, n):\n            for j in range(i):\n                if acts[j][1] <= acts[i][0]:\n                    dp[i] = max(dp[i], dp[j] + 1)\n        return max(dp)",
          "cpp": "#include <vector>\n#include <algorithm>\n\nclass Solution {\npublic:\n    int activitySelectionBetter(std::vector<int>& start, std::vector<int>& end, int n) {\n        std::vector<std::pair<int, int>> acts(n);\n        for (int i = 0; i < n; i++) acts[i] = {start[i], end[i]};\n        std::sort(acts.begin(), acts.end());\n        std::vector<int> dp(n, 1);\n        int maxVal = 1;\n        for (int i = 1; i < n; i++) {\n            for (int j = 0; j < i; j++) {\n                if (acts[j].second <= acts[i].first) dp[i] = std::max(dp[i], dp[j] + 1);\n            }\n            maxVal = std::max(maxVal, dp[i]);\n        }\n        return maxVal;\n    }\n};",
          "javascript": "function activitySelectionBetter(start, end, n) {\n    const acts = [];\n    for (let i = 0; i < n; i++) acts.push([start[i], end[i]]);\n    acts.sort((a, b) => a[0] - b[0]);\n    const dp = new Array(n).fill(1);\n    let max = 1;\n    for (let i = 1; i < n; i++) {\n        for (let j = 0; j < i; j++) {\n            if (acts[j][1] <= acts[i][0]) dp[i] = Math.max(dp[i], dp[j] + 1);\n        }\n        max = Math.max(max, dp[i]);\n    }\n    return max;\n}"
        }
      },
      "optimal": {
        "name": "Optimal (Greedy Sort by End Times)",
        "tier": "optimal",
        "badge": "\ud83e\udd47 Optimal",
        "intuition": [
          "Sort all activities by their finish time.",
          "Always pick the first activity (it frees resources earliest).",
          "For each subsequent activity, if its start time >= last picked activity's finish time, select it and update lastFinish.",
          "Returns the maximum number of mutually compatible activities."
        ],
        "pseudocode": [
          "FUNCTION activitySelection(start, end, n):",
          "  sort activities by end time",
          "  count = 1; lastEnd = activities[0].end",
          "  FOR i from 1 TO n - 1:",
          "    IF activities[i].start >= lastEnd:",
          "      count++",
          "      lastEnd = activities[i].end",
          "  RETURN count"
        ],
        "timeComplexity": "O(N log N)",
        "spaceComplexity": "O(1)",
        "complexityExplanation": "Sorts intervals/activities by finish time ascending and greedily selects the next activity that begins after current ends in O(N log N).",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int activitySelection(int[] start, int[] end, int n) {\n        int[][] acts = new int[n][2];\n        for (int i = 0; i < n; i++) { acts[i][0] = start[i]; acts[i][1] = end[i]; }\n        Arrays.sort(acts, Comparator.comparingInt(a -> a[1]));\n        int count = 1, lastEnd = acts[0][1];\n        for (int i = 1; i < n; i++) {\n            if (acts[i][0] >= lastEnd) {\n                count++;\n                lastEnd = acts[i][1];\n            }\n        }\n        return count;\n    }\n}",
          "python": "class Solution:\n    def activitySelection(self, start: list[int], end: list[int], n: int) -> int:\n        acts = sorted(zip(start, end), key=lambda x: x[1])\n        count = 1\n        last_end = acts[0][1]\n        for s, e in acts[1:]:\n            if s >= last_end:\n                count += 1\n                last_end = e\n        return count",
          "cpp": "#include <vector>\n#include <algorithm>\n\nclass Solution {\npublic:\n    int activitySelection(std::vector<int>& start, std::vector<int>& end, int n) {\n        std::vector<std::pair<int, int>> acts(n);\n        for (int i = 0; i < n; i++) acts[i] = {end[i], start[i]};\n        std::sort(acts.begin(), acts.end());\n        int count = 1, lastEnd = acts[0].first;\n        for (int i = 1; i < n; i++) {\n            if (acts[i].second >= lastEnd) {\n                count++;\n                lastEnd = acts[i].first;\n            }\n        }\n        return count;\n    }\n};",
          "javascript": "function activitySelection(start, end, n) {\n    const acts = [];\n    for (let i = 0; i < n; i++) acts.push([start[i], end[i]]);\n    acts.sort((a, b) => a[1] - b[1]);\n    let count = 1, lastEnd = acts[0][1];\n    for (let i = 1; i < n; i++) {\n        if (acts[i][0] >= lastEnd) {\n            count++;\n            lastEnd = acts[i][1];\n        }\n    }\n    return count;\n}"
        }
      }
    }
  },
  "gas_station": {
    "questionId": "archetype-gas_station",
    "pattern": "Greedy Single-Pass Surplus Tracking",
    "intuition": [
      "Calculate total gas and total cost across all stations. If totalGas < totalCost, circuit is impossible (return -1).",
      "Maintain currentTank and startCandidate index.",
      "Iterate i from 0 to n - 1: add gas[i] - cost[i] to currentTank.",
      "If currentTank < 0, station startCandidate through i cannot reach i + 1. Reset startCandidate = i + 1 and currentTank = 0.",
      "Return startCandidate."
    ],
    "pseudocode": [
      "FUNCTION canCompleteCircuit(gas, cost):",
      "  totalGas = 0, totalCost = 0, tank = 0, start = 0",
      "  FOR i from 0 TO n - 1:",
      "    totalGas += gas[i]; totalCost += cost[i]",
      "    tank += gas[i] - cost[i]",
      "    IF tank < 0: start = i + 1; tank = 0",
      "  RETURN (totalGas < totalCost) ? -1 : start"
    ],
    "timeComplexity": "O(N)",
    "spaceComplexity": "O(1)",
    "complexityExplanation": "If totalGas >= totalCost, a valid starting index is guaranteed to exist. Reset start index to i+1 whenever running tank drops below 0.",
    "edgeCases": [
      "Single station with enough gas",
      "Single station with insufficient gas",
      "No valid starting station"
    ],
    "code": {
      "java": "public class Solution {\n    public int canCompleteCircuit(int[] gas, int[] cost) {\n        int totalGas = 0, totalCost = 0, tank = 0, start = 0;\n        for (int i = 0; i < gas.length; i++) {\n            totalGas += gas[i];\n            totalCost += cost[i];\n            tank += gas[i] - cost[i];\n            if (tank < 0) {\n                start = i + 1;\n                tank = 0;\n            }\n        }\n        return totalGas < totalCost ? -1 : start;\n    }\n}",
      "python": "class Solution:\n    def canCompleteCircuit(self, gas: list[int], cost: list[int]) -> int:\n        if sum(gas) < sum(cost): return -1\n        tank = start = 0\n        for i in range(len(gas)):\n            tank += gas[i] - cost[i]\n            if tank < 0:\n                start = i + 1\n                tank = 0\n        return start",
      "cpp": "#include <vector>\n#include <numeric>\n\nclass Solution {\npublic:\n    int canCompleteCircuit(std::vector<int>& gas, std::vector<int>& cost) {\n        int totalGas = 0, totalCost = 0, tank = 0, start = 0;\n        for (size_t i = 0; i < gas.size(); i++) {\n            totalGas += gas[i];\n            totalCost += cost[i];\n            tank += gas[i] - cost[i];\n            if (tank < 0) {\n                start = i + 1;\n                tank = 0;\n            }\n        }\n        return (totalGas < totalCost) ? -1 : start;\n    }\n};",
      "javascript": "function canCompleteCircuit(gas, cost) {\n    let totalGas = 0, totalCost = 0, tank = 0, start = 0;\n    for (let i = 0; i < gas.length; i++) {\n        totalGas += gas[i];\n        totalCost += cost[i];\n        tank += gas[i] - cost[i];\n        if (tank < 0) {\n            start = i + 1;\n            tank = 0;\n        }\n    }\n    return totalGas < totalCost ? -1 : start;\n}"
    },
    "approaches": {
      "brute": {
        "name": "Brute Force (Simulate Circular Tour from Every Station)",
        "tier": "brute",
        "badge": "\ud83e\udd49 Brute Force",
        "intuition": [
          "Exhaustive simulation of each start."
        ],
        "timeComplexity": "O(N\u00b2)",
        "spaceComplexity": "O(1)",
        "complexityExplanation": "Simulates starting at station i for every i from 0 to N-1 until a full lap is completed.",
        "code": {
          "java": "public class Solution {\n    public int canCompleteCircuitBrute(int[] gas, int[] cost) {\n        int n = gas.length;\n        for (int i = 0; i < n; i++) {\n            int tank = 0;\n            boolean can = true;\n            for (int step = 0; step < n; step++) {\n                int station = (i + step) % n;\n                tank += gas[station] - cost[station];\n                if (tank < 0) { can = false; break; }\n            }\n            if (can) return i;\n        }\n        return -1;\n    }\n}",
          "python": "class Solution:\n    def canCompleteCircuitBrute(self, gas: list[int], cost: list[int]) -> int:\n        n = len(gas)\n        for i in range(n):\n            tank = 0\n            can = True\n            for step in range(n):\n                st = (i + step) % n\n                tank += gas[st] - cost[st]\n                if tank < 0: can = False; break\n            if can: return i\n        return -1",
          "cpp": "#include <vector>\n\nclass Solution {\npublic:\n    int canCompleteCircuitBrute(std::vector<int>& gas, std::vector<int>& cost) {\n        int n = gas.size();\n        for (int i = 0; i < n; i++) {\n            int tank = 0;\n            bool can = true;\n            for (int step = 0; step < n; step++) {\n                int st = (i + step) % n;\n                tank += gas[st] - cost[st];\n                if (tank < 0) { can = false; break; }\n            }\n            if (can) return i;\n        }\n        return -1;\n    }\n};",
          "javascript": "function canCompleteCircuitBrute(gas, cost) {\n    const n = gas.length;\n    for (let i = 0; i < n; i++) {\n        let tank = 0, can = true;\n        for (let step = 0; step < n; step++) {\n            const st = (i + step) % n;\n            tank += gas[st] - cost[st];\n            if (tank < 0) { can = false; break; }\n        }\n        if (can) return i;\n    }\n    return -1;\n}"
        }
      },
      "better": {
        "name": "Better (Prefix Sum Lowest Deficit Index)",
        "tier": "better",
        "badge": "\ud83e\udd48 Better",
        "intuition": [
          "Lowest net deficit point."
        ],
        "timeComplexity": "O(N)",
        "spaceComplexity": "O(1)",
        "complexityExplanation": "Computes cumulative net surplus; the starting point is the station immediately following the lowest cumulative deficit.",
        "code": {
          "java": "public class Solution {\n    public int canCompleteCircuitBetter(int[] gas, int[] cost) {\n        int n = gas.length;\n        int minTank = Integer.MAX_VALUE, minIdx = 0, tank = 0;\n        for (int i = 0; i < n; i++) {\n            tank += gas[i] - cost[i];\n            if (tank < minTank) {\n                minTank = tank;\n                minIdx = i;\n            }\n        }\n        return tank < 0 ? -1 : (minIdx + 1) % n;\n    }\n}",
          "python": "class Solution:\n    def canCompleteCircuitBetter(self, gas: list[int], cost: list[int]) -> int:\n        tank = min_tank = 0\n        min_idx = -1\n        for i in range(len(gas)):\n            tank += gas[i] - cost[i]\n            if tank < min_tank:\n                min_tank = tank\n                min_idx = i\n        return -1 if tank < 0 else (min_idx + 1) % len(gas)",
          "cpp": "#include <vector>\n#include <climits>\n\nclass Solution {\npublic:\n    int canCompleteCircuitBetter(std::vector<int>& gas, std::vector<int>& cost) {\n        int tank = 0, minTank = INT_MAX, minIdx = 0;\n        for (size_t i = 0; i < gas.size(); i++) {\n            tank += gas[i] - cost[i];\n            if (tank < minTank) {\n                minTank = tank;\n                minIdx = i;\n            }\n        }\n        return tank < 0 ? -1 : (minIdx + 1) % gas.size();\n    }\n};",
          "javascript": "function canCompleteCircuitBetter(gas, cost) {\n    let tank = 0, minTank = Infinity, minIdx = 0;\n    for (let i = 0; i < gas.length; i++) {\n        tank += gas[i] - cost[i];\n        if (tank < minTank) {\n            minTank = tank;\n            minIdx = i;\n        }\n    }\n    return tank < 0 ? -1 : (minIdx + 1) % gas.length;\n}"
        }
      },
      "optimal": {
        "name": "Optimal (Greedy Single-Pass Surplus Tracking)",
        "tier": "optimal",
        "badge": "\ud83e\udd47 Optimal",
        "intuition": [
          "Calculate total gas and total cost across all stations. If totalGas < totalCost, circuit is impossible (return -1).",
          "Maintain currentTank and startCandidate index.",
          "Iterate i from 0 to n - 1: add gas[i] - cost[i] to currentTank.",
          "If currentTank < 0, station startCandidate through i cannot reach i + 1. Reset startCandidate = i + 1 and currentTank = 0.",
          "Return startCandidate."
        ],
        "pseudocode": [
          "FUNCTION canCompleteCircuit(gas, cost):",
          "  totalGas = 0, totalCost = 0, tank = 0, start = 0",
          "  FOR i from 0 TO n - 1:",
          "    totalGas += gas[i]; totalCost += cost[i]",
          "    tank += gas[i] - cost[i]",
          "    IF tank < 0: start = i + 1; tank = 0",
          "  RETURN (totalGas < totalCost) ? -1 : start"
        ],
        "timeComplexity": "O(N)",
        "spaceComplexity": "O(1)",
        "complexityExplanation": "If totalGas >= totalCost, a valid starting index is guaranteed to exist. Reset start index to i+1 whenever running tank drops below 0.",
        "code": {
          "java": "public class Solution {\n    public int canCompleteCircuit(int[] gas, int[] cost) {\n        int totalGas = 0, totalCost = 0, tank = 0, start = 0;\n        for (int i = 0; i < gas.length; i++) {\n            totalGas += gas[i];\n            totalCost += cost[i];\n            tank += gas[i] - cost[i];\n            if (tank < 0) {\n                start = i + 1;\n                tank = 0;\n            }\n        }\n        return totalGas < totalCost ? -1 : start;\n    }\n}",
          "python": "class Solution:\n    def canCompleteCircuit(self, gas: list[int], cost: list[int]) -> int:\n        if sum(gas) < sum(cost): return -1\n        tank = start = 0\n        for i in range(len(gas)):\n            tank += gas[i] - cost[i]\n            if tank < 0:\n                start = i + 1\n                tank = 0\n        return start",
          "cpp": "#include <vector>\n#include <numeric>\n\nclass Solution {\npublic:\n    int canCompleteCircuit(std::vector<int>& gas, std::vector<int>& cost) {\n        int totalGas = 0, totalCost = 0, tank = 0, start = 0;\n        for (size_t i = 0; i < gas.size(); i++) {\n            totalGas += gas[i];\n            totalCost += cost[i];\n            tank += gas[i] - cost[i];\n            if (tank < 0) {\n                start = i + 1;\n                tank = 0;\n            }\n        }\n        return (totalGas < totalCost) ? -1 : start;\n    }\n};",
          "javascript": "function canCompleteCircuit(gas, cost) {\n    let totalGas = 0, totalCost = 0, tank = 0, start = 0;\n    for (let i = 0; i < gas.length; i++) {\n        totalGas += gas[i];\n        totalCost += cost[i];\n        tank += gas[i] - cost[i];\n        if (tank < 0) {\n            start = i + 1;\n            tank = 0;\n        }\n    }\n    return totalGas < totalCost ? -1 : start;\n}"
        }
      }
    }
  }
};
