import { ProblemSolution } from '../../types/dsa';

export const HEAPS_GREEDY_SOLUTIONS: Record<string, ProblemSolution> = {
  'heap-1': {
    questionId: 'heap-1',
    pattern: 'Min-Heap of Size K / Bucket Sort',
    intuition: [
      'To find the top K most frequent elements, we first count element frequencies using a hash map.',
      'We can maintain a min-heap of size K ordered by frequency. When a new element has higher frequency than heap top, pop and push.',
      'At the end of processing, the heap retains the top K highest frequency elements.',
      'Alternative O(N) approach: Bucket sort where index represents frequency (0 to N). We iterate buckets backwards from N down to 1 until we gather K elements.'
    ],
    pseudocode: [
      'FUNCTION topKFrequent(nums, k):',
      '  freqMap = count occurrences of each element',
      '  minHeap = empty priority queue storing (freq, num)',
      '  FOR EACH (num, freq) IN freqMap:',
      '    push (freq, num) into minHeap',
      '    IF minHeap.size > k:',
      '      minHeap.pop()',
      '  result = [element for (freq, element) in minHeap]',
      '  RETURN result'
    ],
    timeComplexity: 'O(N log K) with Min-Heap, or O(N) with Bucket Sort',
    spaceComplexity: 'O(N)',
    complexityExplanation: 'Building frequency map takes O(N). Maintaining a heap of size K takes O(log K) for each of the unique M elements. Bucket sort avoids the log factor entirely.',
    edgeCases: [
      'k equals the number of unique elements',
      'Array contains negative numbers or zeros',
      'All elements have identical frequency (e.g., [1, 2, 3], k=2)'
    ],
    code: {
      cpp: `// C++ Solution - Min-Heap of size K
#include <vector>
#include <unordered_map>
#include <queue>

class Solution {
public:
    std::vector<int> topKFrequent(std::vector<int>& nums, int k) {
        std::unordered_map<int, int> count;
        for (int n : nums) count[n]++;

        // Min-heap storing pair: {frequency, number}
        std::priority_queue<std::pair<int, int>, 
                            std::vector<std::pair<int, int>>, 
                            std::greater<std::pair<int, int>>> minHeap;

        for (auto& [num, freq] : count) {
            minHeap.push({freq, num});
            if (minHeap.size() > k) {
                minHeap.pop();
            }
        }

        std::vector<int> result;
        while (!minHeap.empty()) {
            result.push_back(minHeap.top().second);
            minHeap.pop();
        }
        return result;
    }
};`,
      java: `// Java Solution - PriorityQueue (Min-Heap)
import java.util.*;

class Solution {
    public int[] topKFrequent(int[] nums, int k) {
        Map<Integer, Integer> count = new HashMap<>();
        for (int n : nums) {
            count.put(n, count.getOrDefault(n, 0) + 1);
        }

        // Min-heap ordered by frequency ascending
        PriorityQueue<Integer> heap = new PriorityQueue<>((a, b) -> count.get(a) - count.get(b));

        for (int num : count.keySet()) {
            heap.offer(num);
            if (heap.size() > k) {
                heap.poll();
            }
        }

        int[] result = new int[k];
        for (int i = 0; i < k; i++) {
            result[i] = heap.poll();
        }
        return result;
    }
}`,
      python: `# Python Solution - Counter & heapq / Bucket Sort
from collections import Counter
import heapq

class Solution:
    def topKFrequent(self, nums: list[int], k: int) -> list[int]:
        count = Counter(nums)
        # Min-heap of size k
        return heapq.nlargest(k, count.keys(), key=count.get)`,
      javascript: `// JavaScript Solution - Hash Map + Bucket Sort O(N)
function topKFrequent(nums, k) {
    const freqMap = new Map();
    for (const num of nums) {
        freqMap.set(num, (freqMap.get(num) || 0) + 1);
    }

    // Buckets indexed by frequency
    const buckets = Array.from({ length: nums.length + 1 }, () => []);
    for (const [num, freq] of freqMap.entries()) {
        buckets[freq].push(num);
    }

    const result = [];
    for (let i = buckets.length - 1; i >= 0 && result.length < k; i--) {
        if (buckets[i].length > 0) {
            result.push(...buckets[i]);
        }
    }
    return result.slice(0, k);
}`
    },
    interviewProTips: [
      'In FAANG interviews, start with O(N log K) heap approach, then impress the interviewer by pivoting to O(N) Bucket Sort.',
      'Explain why min-heap is better than max-heap: max-heap requires storing all elements O(N log N) space/time, while min-heap caps size at K.'
    ]
  },

  'heap-2': {
    questionId: 'heap-2',
    pattern: 'Two Heaps (Max-Heap + Min-Heap Balancing)',
    intuition: [
      'To find the median dynamically, we divide numbers into two equal halves: the smaller half and the larger half.',
      'The largest number of the smaller half (Max-Heap `lower`) and the smallest number of the larger half (Min-Heap `upper`) are candidate medians.',
      'Invariance rules:',
      '1. Every element in `lower` <= every element in `upper`.',
      '2. The size of `lower` is either equal to `upper.size()` or `upper.size() + 1`.',
      'If odd total elements, median is `lower.top()`. If even, median is `(lower.top() + upper.top()) / 2.0`.'
    ],
    pseudocode: [
      'CLASS MedianFinder:',
      '  lower = MaxHeap()',
      '  upper = MinHeap()',
      '  FUNCTION addNum(num):',
      '    lower.push(num)',
      '    upper.push(lower.pop())',
      '    IF upper.size > lower.size:',
      '      lower.push(upper.pop())',
      '  FUNCTION findMedian():',
      '    IF lower.size > upper.size: RETURN lower.top()',
      '    RETURN (lower.top() + upper.top()) / 2.0'
    ],
    timeComplexity: 'addNum: O(log N), findMedian: O(1)',
    spaceComplexity: 'O(N)',
    complexityExplanation: 'Each number insertion triggers at most 2 heap operations costing O(log N). Median retrieval is instantaneous O(1) from heap tops.',
    edgeCases: [
      'Stream with duplicate values',
      'Single element stream (median is that element)',
      'Large stream with integer overflow when adding tops'
    ],
    code: {
      cpp: `// C++ Solution - Dual Heaps
#include <queue>

class MedianFinder {
private:
    std::priority_queue<int> lower; // Max-heap for lower half
    std::priority_queue<int, std::vector<int>, std::greater<int>> upper; // Min-heap for upper half

public:
    MedianFinder() {}

    void addNum(int num) {
        lower.push(num);
        upper.push(lower.top());
        lower.pop();

        if (upper.size() > lower.size()) {
            lower.push(upper.top());
            upper.pop();
        }
    }

    double findMedian() {
        if (lower.size() > upper.size()) {
            return lower.top();
        }
        return (lower.top() + upper.top()) / 2.0;
    }
};`,
      java: `// Java Solution - Dual PriorityQueues
import java.util.PriorityQueue;
import java.util.Collections;

class MedianFinder {
    private PriorityQueue<Integer> lower = new PriorityQueue<>(Collections.reverseOrder());
    private PriorityQueue<Integer> upper = new PriorityQueue<>();

    public MedianFinder() {}

    public void addNum(int num) {
        lower.offer(num);
        upper.offer(lower.poll());

        if (upper.size() > lower.size()) {
            lower.offer(upper.poll());
        }
    }

    public double findMedian() {
        if (lower.size() > upper.size()) {
            return lower.peek();
        }
        return (lower.peek() + upper.peek()) / 2.0;
    }
}`,
      python: `# Python Solution - heapq dual heaps
import heapq

class MedianFinder:
    def __init__(self):
        self.lower = [] # Max-heap (invert values)
        self.upper = [] # Min-heap

    def addNum(self, num: int) -> None:
        heapq.heappush(self.lower, -num)
        heapq.heappush(self.upper, -heapq.heappop(self.lower))

        if len(self.upper) > len(self.lower):
            heapq.heappush(self.lower, -heapq.heappop(self.upper))

    def findMedian(self) -> float:
        if len(self.lower) > len(self.upper):
            return -self.lower[0]
        return (-self.lower[0] + self.upper[0]) / 2.0`,
      javascript: `// JavaScript Solution - Dual Heaps (or Binary Search Insertion)
class MedianFinder {
    constructor() {
        this.arr = [];
    }

    addNum(num) {
        // Binary search insertion maintains sorted order in O(N)
        let low = 0, high = this.arr.length;
        while (low < high) {
            const mid = Math.floor((low + high) / 2);
            if (this.arr[mid] < num) low = mid + 1;
            else high = mid;
        }
        this.arr.splice(low, 0, num);
    }

    findMedian() {
        const n = this.arr.length;
        const mid = Math.floor(n / 2);
        if (n % 2 !== 0) return this.arr[mid];
        return (this.arr[mid - 1] + this.arr[mid]) / 2;
    }
}`
    },
    interviewProTips: [
      'This is a top-3 classic Google & Amazon system design and DSA question.',
      'Follow-up: What if 99% of all numbers are in the range [0, 100]? Use a frequency array of size 101 for O(1) time and space!'
    ]
  },

  'grd-1': {
    questionId: 'grd-1',
    pattern: 'Greedy Interval Scheduling (Sort by End Time)',
    intuition: [
      'To maximize non-overlapping intervals (or minimize removals), we should always pick the interval that finishes earliest.',
      'Finishing early leaves the maximum possible remaining time window for future intervals.',
      '1. Sort intervals by their end time in ascending order.',
      '2. Keep track of `prevEnd`. For each interval [start, end]:',
      '   - If `start >= prevEnd`, no overlap! Update `prevEnd = end`.',
      '   - If `start < prevEnd`, overlap detected! We must remove this interval to preserve earlier finishing ones (increment removal count).'
    ],
    pseudocode: [
      'FUNCTION eraseOverlapIntervals(intervals):',
      '  SORT intervals by end time ascending',
      '  removed = 0',
      '  prevEnd = intervals[0].end',
      '  FOR i = 1 TO intervals.length - 1:',
      '    IF intervals[i].start < prevEnd:',
      '      removed = removed + 1',
      '    ELSE:',
      '      prevEnd = intervals[i].end',
      '  RETURN removed'
    ],
    timeComplexity: 'O(N log N)',
    spaceComplexity: 'O(1) auxiliary (or O(N) for sorting)',
    complexityExplanation: 'Sorting N intervals takes O(N log N). A single linear sweep through the intervals takes O(N) time.',
    edgeCases: [
      'Empty or single interval (0 removals needed)',
      'All intervals identical (removals = N - 1)',
      'Touch points e.g. [1, 2] and [2, 3] do NOT count as overlapping'
    ],
    code: {
      cpp: `// C++ Solution - Greedy by End Time
#include <vector>
#include <algorithm>

class Solution {
public:
    int eraseOverlapIntervals(std::vector<std::vector<int>>& intervals) {
        if (intervals.empty()) return 0;
        
        // Sort intervals by their end coordinate
        std::sort(intervals.begin(), intervals.end(), [](const auto& a, const auto& b) {
            return a[1] < b[1];
        });

        int removals = 0;
        int prevEnd = intervals[0][1];

        for (size_t i = 1; i < intervals.size(); i++) {
            if (intervals[i][0] < prevEnd) {
                removals++; // Overlap: remove current
            } else {
                prevEnd = intervals[i][1];
            }
        }
        return removals;
    }
};`,
      java: `// Java Solution - Greedy Interval Scheduling
import java.util.Arrays;

class Solution {
    public int eraseOverlapIntervals(int[][] intervals) {
        if (intervals.length == 0) return 0;

        // Sort by end time
        Arrays.sort(intervals, (a, b) -> Integer.compare(a[1], b[1]));

        int removals = 0;
        int prevEnd = intervals[0][1];

        for (int i = 1; i < intervals.length; i++) {
            if (intervals[i][0] < prevEnd) {
                removals++;
            } else {
                prevEnd = intervals[i][1];
            }
        }
        return removals;
    }
}`,
      python: `# Python Solution - Sort by End Time
class Solution:
    def eraseOverlapIntervals(self, intervals: list[list[int]]) -> int:
        if not intervals:
            return 0
        intervals.sort(key=lambda x: x[1])
        removals = 0
        prev_end = intervals[0][1]

        for start, end in intervals[1:]:
            if start < prev_end:
                removals += 1
            else:
                prev_end = end
        return removals`,
      javascript: `// JavaScript Solution - Greedy Interval Scheduling
function eraseOverlapIntervals(intervals) {
    if (intervals.length === 0) return 0;
    intervals.sort((a, b) => a[1] - b[1]);

    let removals = 0;
    let prevEnd = intervals[0][1];

    for (let i = 1; i < intervals.length; i++) {
        if (intervals[i][0] < prevEnd) {
            removals++;
        } else {
            prevEnd = intervals[i][1];
        }
    }
    return removals;
}`
    },
    interviewProTips: [
      'Why sort by end time instead of start time? Sorting by start time can trick greedy logic if a very early interval spans the entire timeline.',
      'This problem is isomorphic to LeetCode 452 (Minimum Number of Arrows to Burst Balloons).'
    ]
  },

  'grd-2': {
    questionId: 'grd-2',
    pattern: 'Single-Pass Greedy Running Sum',
    intuition: [
      'Notice two crucial properties:',
      '1. If the total gas accumulated across all stations is less than total cost, completing the circuit is mathematically impossible (return -1).',
      '2. If you start at station A and run out of gas before station B, then NO station between A and B can reach B either! Hence, our next candidate start must be B + 1.',
      'By maintaining `totalTank` and `currTank`, we can find the valid starting index in a single pass.'
    ],
    pseudocode: [
      'FUNCTION canCompleteCircuit(gas, cost):',
      '  totalTank = 0, currTank = 0, startIndex = 0',
      '  FOR i = 0 TO gas.length - 1:',
      '    diff = gas[i] - cost[i]',
      '    totalTank += diff',
      '    currTank += diff',
      '    IF currTank < 0:',
      '      startIndex = i + 1',
      '      currTank = 0',
      '  IF totalTank < 0: RETURN -1',
      '  RETURN startIndex'
    ],
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(1)',
    complexityExplanation: 'We only traverse the gas and cost arrays once. No extra dynamic memory is used.',
    edgeCases: [
      'Single station with gas[0] >= cost[0] (return 0)',
      'Total gas < total cost (always impossible, return -1)',
      'Starting candidate reaches the very last station'
    ],
    code: {
      cpp: `// C++ Solution - Single Pass Greedy
#include <vector>

class Solution {
public:
    int canCompleteCircuit(std::vector<int>& gas, std::vector<int>& cost) {
        int totalGas = 0, currGas = 0;
        int startIndex = 0;

        for (size_t i = 0; i < gas.size(); i++) {
            int net = gas[i] - cost[i];
            totalGas += net;
            currGas += net;

            if (currGas < 0) {
                startIndex = i + 1;
                currGas = 0;
            }
        }
        return totalGas >= 0 ? startIndex : -1;
    }
};`,
      java: `// Java Solution - Single Pass O(N) Greedy
class Solution {
    public int canCompleteCircuit(int[] gas, int[] cost) {
        int totalGas = 0;
        int currGas = 0;
        int startIndex = 0;

        for (int i = 0; i < gas.length; i++) {
            int net = gas[i] - cost[i];
            totalGas += net;
            currGas += net;

            if (currGas < 0) {
                startIndex = i + 1;
                currGas = 0;
            }
        }
        return totalGas >= 0 ? startIndex : -1;
    }
}`,
      python: `# Python Solution - Single Pass Greedy
class Solution:
    def canCompleteCircuit(self, gas: list[int], cost: list[int]) -> int:
        if sum(gas) < sum(cost):
            return -1

        curr_gas = 0
        start_idx = 0

        for i in range(len(gas)):
            curr_gas += gas[i] - cost[i]
            if curr_gas < 0:
                curr_gas = 0
                start_idx = i + 1

        return start_idx`,
      javascript: `// JavaScript Solution - Single Pass Greedy
function canCompleteCircuit(gas, cost) {
    let totalTank = 0;
    let currTank = 0;
    let startIndex = 0;

    for (let i = 0; i < gas.length; i++) {
        const net = gas[i] - cost[i];
        totalTank += net;
        currTank += net;

        if (currTank < 0) {
            startIndex = i + 1;
            currTank = 0;
        }
    }

    return totalTank >= 0 ? startIndex : -1;
}`
    },
    interviewProTips: [
      'Explain the elimination rule clearly to the interviewer: "If station i cannot reach station j, no station k between i and j can reach j either because you arrived at k with >= 0 gas."',
      'This eliminates an O(N^2) brute force check in one clean O(N) sweep.'
    ]
  }
};
