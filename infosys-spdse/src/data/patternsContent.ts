import { PatternId } from '../types';

export interface PatternInfo {
  id: PatternId;
  name: string;
  frequency: string;
  difficultyFocus: string;
  summary: string;
  storyDisguises: {
    title: string;
    scenario: string;
    cueWords: string[];
  }[];
  templates: {
    java: string;
    cpp: string;
    python: string;
  };
  partialScorePlaybook: {
    bruteForceApproach: string;
    optimizingInsight: string;
    breakingHiddenTests: string[];
  };
}

export const patternsContent: PatternInfo[] = [
  {
    id: "arrays_and_prefix_sums",
    name: "Arrays & Prefix Sums",
    frequency: "40% of P1, 12% overall",
    difficultyFocus: "P1 Easy to P2 Medium",
    summary: "Precalculating cumulative sums allows answering range sum queries in O(1) time. Combined with difference arrays, supports O(1) range updates.",
    storyDisguises: [
      {
        title: "Toll Road Traffic Logger",
        scenario: "Vehicles pass through checkpoints on a highway segment. Queries ask for total volume between marker L and marker R.",
        cueWords: ["range total", "interval sum", "between checkpoint L and R", "static ledger"]
      },
      {
        title: "Energy Consumption Window",
        scenario: "Smart meters record electricity spikes at specific hours. Determine if any sub-interval had net energy consumption divisible by K.",
        cueWords: ["divisible by K", "continuous window", "net balance", "cumulative wattage"]
      },
      {
        title: "Flight Altitude Variation",
        scenario: "An aircraft climbs or descends by delta units over various route segments. Compute the final altitude after all scheduled flight legs.",
        cueWords: ["batch updates", "range modifications", "difference array", "final heights"]
      }
    ],
    templates: {
      java: `// Prefix Sum Array & Difference Array Template
public class PrefixSumTemplate {
    public static long[] buildPrefix(int[] arr) {
        int n = arr.length;
        long[] pref = new long[n + 1];
        for (int i = 0; i < n; i++) pref[i + 1] = pref[i] + arr[i];
        return pref;
    }
    // Query sum [L, R] 0-indexed inclusive
    public static long query(long[] pref, int L, int R) {
        return pref[R + 1] - pref[L];
    }
}`,
      cpp: `// Prefix Sum in C++
#include <vector>
using namespace std;

vector<long long> buildPrefix(const vector<int>& arr) {
    int n = arr.size();
    vector<long long> pref(n + 1, 0);
    for (int i = 0; i < n; ++i) pref[i + 1] = pref[i] + arr[i];
    return pref;
}
long long query(const vector<long long>& pref, int L, int R) {
    return pref[R + 1] - pref[L];
}`,
      python: `# Prefix Sum in Python
def build_prefix(arr):
    pref = [0] * (len(arr) + 1)
    for i, x in enumerate(arr):
        pref[i + 1] = pref[i] + x
    return pref

def query(pref, L, R):
    return pref[R + 1] - pref[L]`
    },
    partialScorePlaybook: {
      bruteForceApproach: "Run nested loops i from 0 to N-1, j from i to N-1, summing elements directly. Earns 30-40% marks on N <= 1000.",
      optimizingInsight: "Replace inner loop with pref[R+1] - pref[L] to drop time from O(N^2) to O(N).",
      breakingHiddenTests: ["Large sums exceeding 2^31-1 (use 64-bit int)", "Zero-length ranges", "Negative values in modulo arithmetic"]
    }
  },
  {
    id: "two_pointers_and_sliding_window",
    name: "Two Pointers & Sliding Window",
    frequency: "20% of P1, 13% of P2",
    difficultyFocus: "P1 Easy to P2 Medium",
    summary: "Two pointers move monotonically across a sequence to identify subarrays or pairs meeting monotonic constraints in linear time.",
    storyDisguises: [
      {
        title: "Video Streaming Buffer Window",
        scenario: "A streaming client maintains packet bitrate buffers. Find the longest contiguous video duration where bandwidth variance does not exceed B.",
        cueWords: ["longest contiguous segment", "at most K violations", "shrinking/expanding buffer"]
      },
      {
        title: "Pair Matching in Logistics Delivery",
        scenario: "Pair warehouse rovers of capacity A with packages of weight B such that all differences fall within clearance tolerance.",
        cueWords: ["pair difference", "sorted queues", "two convergence points", "closest sum"]
      }
    ],
    templates: {
      java: `// Sliding Window Template (Longest Subarray with Sum <= K)
public class SlidingWindow {
    public static int longestSubarray(int[] arr, long K) {
        int left = 0, maxLen = 0;
        long currentSum = 0;
        for (int right = 0; right < arr.length; right++) {
            currentSum += arr[right];
            while (currentSum > K && left <= right) {
                currentSum -= arr[left++];
            }
            maxLen = Math.max(maxLen, right - left + 1);
        }
        return maxLen;
    }
}`,
      cpp: `// Sliding Window in C++
#include <vector>
#include <algorithm>
using namespace std;

int longestSubarray(const vector<int>& arr, long long K) {
    int left = 0, maxLen = 0;
    long long currentSum = 0;
    for (int right = 0; right < (int)arr.size(); ++right) {
        currentSum += arr[right];
        while (currentSum > K && left <= right) {
            currentSum -= arr[left++];
        }
        maxLen = max(maxLen, right - left + 1);
    }
    return maxLen;
}`,
      python: `# Sliding Window in Python
def longest_subarray(arr, K):
    left = 0
    current_sum = 0
    max_len = 0
    for right, val in enumerate(arr):
        current_sum += val
        while current_sum > K and left <= right:
            current_sum -= arr[left]
            left += 1
        max_len = max(max_len, right - left + 1)
    return max_len`
    },
    partialScorePlaybook: {
      bruteForceApproach: "Check every pair (L, R) and calculate window properties manually in O(N^2) or O(N^3).",
      optimizingInsight: "Since the window condition is monotonic (expanding right only increases sum), left only ever advances forward.",
      breakingHiddenTests: ["Arrays with all elements exceeding K (returns 0)", "Single element arrays", "Left pointer catching up to right pointer"]
    }
  },
  {
    id: "sorting_and_greedy",
    name: "Sorting & Greedy Optimization",
    frequency: "20% of P1, 20% of P2",
    difficultyFocus: "P1 Easy to P2 Medium",
    summary: "Greedily picking the local optimal item (e.g. earliest deadline, minimum threshold, or highest ratio) yields the global optimum.",
    storyDisguises: [
      {
        title: "RPG Monster Arena Battle",
        scenario: "You enter a battle with initial energy E. Each monster has a minimum power requirement P[i] and yields a bonus B[i]. Maximize monsters slain.",
        cueWords: ["defeat monsters", "initial energy", "gain bonus", "any order allowed"]
      },
      {
        title: "Meeting Room / Interval Scheduler",
        scenario: "Conference halls need to schedule client presentations without schedule overlap. Find maximum presentations accommodated.",
        cueWords: ["start and end intervals", "non-overlapping", "maximum tasks completed"]
      }
    ],
    templates: {
      java: `// Greedy Sorting: Monster Quest
import java.util.*;

public class GreedyScheduler {
    static class Item implements Comparable<Item> {
        long req, gain;
        Item(long r, long g) { this.req = r; this.gain = g; }
        public int compareTo(Item o) {
            if (this.req != o.req) return Long.compare(this.req, o.req);
            return Long.compare(o.gain, this.gain);
        }
    }
}`,
      cpp: `// Greedy Sorting in C++
#include <vector>
#include <algorithm>
using namespace std;

struct Item {
    long long req, gain;
    bool operator<(const Item& other) const {
        if (req != other.req) return req < other.req;
        return gain > other.gain;
    }
};`,
      python: `# Greedy Sorting in Python
def solve_greedy(items, initial_val):
    # Sort by requirement ascending, then gain descending
    items.sort(key=lambda x: (x[0], -x[1]))
    count = 0
    val = initial_val
    for req, gain in items:
        if val >= req:
            val += gain
            count += 1
        else:
            break
    return count`
    },
    partialScorePlaybook: {
      bruteForceApproach: "Recursively try every permutation of orderings (O(N!)) or O(N^2) search.",
      optimizingInsight: "Prove exchange property: fighting a lower-threshold monster first can never worsen your ability to fight a higher one later.",
      breakingHiddenTests: ["Equal requirement ties broken incorrectly", "Initial budget already higher than all items", "Zero bonus items"]
    }
  },
  {
    id: "binary_search",
    name: "Binary Search (incl. on Answer)",
    frequency: "26.7% of P2 (Highest for P2)",
    difficultyFocus: "P2 Medium to P3 Hard",
    summary: "When the question asks to 'minimize the maximum' or 'find smallest valid X', test candidate values in O(log(Range)) using a monotonic predicate.",
    storyDisguises: [
      {
        title: "Cargo Ship Conveyor Capacity",
        scenario: "Containers must be shipped in fixed order within D days. Find minimum ship conveyor capacity required.",
        cueWords: ["minimize the maximum", "split array into K parts", "within D days", "capacity"]
      },
      {
        title: "Terrain Road Elevation Barrier",
        scenario: "Find the minimum day on which workers can traverse from start to finish without exceeding day-specific elevation caps.",
        cueWords: ["minimum threshold", "feasibility check", "can reach destination"]
      }
    ],
    templates: {
      java: `// Binary Search on Answer Template
public class BinarySearchAnswer {
    static boolean check(long mid, int[] arr, int k) {
        int parts = 1;
        long currentSum = 0;
        for (int x : arr) {
            if (x > mid) return false;
            if (currentSum + x > mid) {
                parts++;
                currentSum = x;
            } else {
                currentSum += x;
            }
        }
        return parts <= k;
    }
    public static long findMinCap(int[] arr, int k) {
        long low = 0, high = 0;
        for (int x : arr) { low = Math.max(low, x); high += x; }
        long ans = high;
        while (low <= high) {
            long mid = low + (high - low) / 2;
            if (check(mid, arr, k)) {
                ans = mid;
                high = mid - 1; // Try smaller
            } else {
                low = mid + 1; // Must be larger
            }
        }
        return ans;
    }
}`,
      cpp: `// Binary Search on Answer in C++
#include <vector>
#include <numeric>
#include <algorithm>
using namespace std;

bool check(long long mid, const vector<int>& arr, int k) {
    int parts = 1;
    long long current = 0;
    for (int x : arr) {
        if (x > mid) return false;
        if (current + x > mid) { parts++; current = x; }
        else current += x;
    }
    return parts <= k;
}`,
      python: `# Binary Search on Answer in Python
def check(mid, arr, k):
    parts = 1
    current = 0
    for x in arr:
        if x > mid: return False
        if current + x > mid:
            parts += 1
            current = x
        else:
            current += x
    return parts <= k`
    },
    partialScorePlaybook: {
      bruteForceApproach: "Iterate candidate answer X from low to high one by one in O(Range * N). Earns 30% marks on small ranges.",
      optimizingInsight: "Because check(X) is monotonic (False, False, ..., True, True), binary search reduces iterations from Range to log2(Range).",
      breakingHiddenTests: ["Setting high boundary too low (causing overflow / missing answer)", "Integer division overflow in mid calculation (use low + (high-low)/2)", "Off-by-one errors on boundary conditions"]
    }
  },
  {
    id: "dp",
    name: "Basic & Intermediate Dynamic Programming",
    frequency: "46.7% of P3 (Dominant Hard Topic)",
    difficultyFocus: "P3 Hard to P4 Complex",
    summary: "Breaking problems into overlapping subproblems and memoizing states. Core subtypes: 1D linear, 2D Grid paths, 0/1 Knapsack, LIS variants, and Interval DP.",
    storyDisguises: [
      {
        title: "Dual Conveyor Belt Switching",
        scenario: "Boxes move across two parallel belts with individual slot costs and a penalty S to switch between belts. Compute minimum transit cost.",
        cueWords: ["two tracks/belts", "switching penalty", "transition cost", "minimal route"]
      },
      {
        title: "Alternating Pattern Generation",
        scenario: "Generate alphanumeric serial codes of length N where every transition alternates between uppercase and lowercase. Count valid codes modulo 10^9+7.",
        cueWords: ["modulo 10^9+7", "alternating directions", "count valid sequences", "state memory"]
      }
    ],
    templates: {
      java: `// 2D Grid DP with Transition Cost Template
public class GridDP {
    public static long minPath(int[][] cost, int switchPenalty) {
        int n = cost[0].length;
        long[][] dp = new long[2][n];
        dp[0][0] = cost[0][0];
        dp[1][0] = cost[1][0];
        for (int j = 1; j < n; j++) {
            dp[0][j] = cost[0][j] + Math.min(dp[0][j - 1], dp[1][j - 1] + switchPenalty);
            dp[1][j] = cost[1][j] + Math.min(dp[1][j - 1], dp[0][j - 1] + switchPenalty);
        }
        return Math.min(dp[0][n - 1], dp[1][n - 1]);
    }
}`,
      cpp: `// 2D Grid DP in C++
#include <vector>
#include <algorithm>
using namespace std;

long long minPath(const vector<vector<int>>& cost, int switchPenalty) {
    int n = cost[0].size();
    vector<vector<long long>> dp(2, vector<long long>(n));
    dp[0][0] = cost[0][0];
    dp[1][0] = cost[1][0];
    for (int j = 1; j < n; ++j) {
        dp[0][j] = cost[0][j] + min(dp[0][j - 1], dp[1][j - 1] + switchPenalty);
        dp[1][j] = cost[1][j] + min(dp[1][j - 1], dp[0][j - 1] + switchPenalty);
    }
    return min(dp[0][n - 1], dp[1][n - 1]);
}`,
      python: `# 2D Grid DP in Python
def min_path(cost, switch_penalty):
    n = len(cost[0])
    dp0 = cost[0][0]
    dp1 = cost[1][0]
    for j in range(1, n):
        new_dp0 = cost[0][j] + min(dp0, dp1 + switch_penalty)
        new_dp1 = cost[1][j] + min(dp1, dp0 + switch_penalty)
        dp0, dp1 = new_dp0, new_dp1
    return min(dp0, dp1)`
    },
    partialScorePlaybook: {
      bruteForceApproach: "Plain recursion without memoization (O(2^N)). Passes 25% of hidden test cases on small N <= 20.",
      optimizingInsight: "Add a memo table dp[index][state] to cache overlapping branches in O(N * States) time.",
      breakingHiddenTests: ["Recursion depth limit exceeded (Python sys.setrecursionlimit or use bottom-up)", "Forgetting modulo 10^9+7 at each addition", "State space too large for memory limits"]
    }
  },
  {
    id: "graphs_and_bfs_dfs",
    name: "BFS/DFS on Grids & Graphs",
    frequency: "20% of P3, 10% overall",
    difficultyFocus: "P2 Medium to P3 Hard",
    summary: "Graph modeling: Disjoint Set Union (DSU) for connectivity, BFS for unweighted shortest paths, and Dijkstra for weighted minimum latency.",
    storyDisguises: [
      {
        title: "Maze Escape with Master Key",
        scenario: "An adventurer starts at X, must collect key K, and exit through door O while avoiding traps. Count shortest paths.",
        cueWords: ["shortest route", "key required", "grid obstacles", "unweighted steps"]
      },
      {
        title: "City Water Network Connection",
        scenario: "Towns can build a reservoir or lay pipes between connected towns. Minimize total infrastructure expenditure.",
        cueWords: ["connected components", "roads and libraries", "minimum spanning tree", "DSU"]
      }
    ],
    templates: {
      java: `// Disjoint Set Union (DSU) Template
public class DSU {
    int[] parent, rank;
    public DSU(int n) {
        parent = new int[n];
        rank = new int[n];
        for (int i = 0; i < n; i++) parent[i] = i;
    }
    public int find(int i) {
        if (parent[i] == i) return i;
        return parent[i] = find(parent[i]); // Path compression
    }
    public boolean union(int i, int j) {
        int rootI = find(i), rootJ = find(j);
        if (rootI == rootJ) return false;
        if (rank[rootI] < rank[rootJ]) parent[rootI] = rootJ;
        else if (rank[rootI] > rank[rootJ]) parent[rootJ] = rootI;
        else { parent[rootJ] = rootI; rank[rootI]++; }
        return true;
    }
}`,
      cpp: `// DSU in C++
#include <vector>
using namespace std;

struct DSU {
    vector<int> parent, rank;
    DSU(int n) : parent(n), rank(n, 0) {
        for (int i = 0; i < n; ++i) parent[i] = i;
    }
    int find(int i) {
        if (parent[i] == i) return i;
        return parent[i] = find(parent[i]);
    }
    bool unite(int i, int j) {
        int rI = find(i), rJ = find(j);
        if (rI == rJ) return false;
        if (rank[rI] < rank[rJ]) parent[rI] = rJ;
        else if (rank[rI] > rank[rJ]) parent[rJ] = rI;
        else { parent[rJ] = rI; rank[rI]++; }
        return true;
    }
};`,
      python: `# DSU in Python
class DSU:
    def __init__(self, n):
        self.parent = list(range(n))
        self.rank = [0] * n
    def find(self, i):
        if self.parent[i] == i: return i
        self.parent[i] = self.find(self.parent[i])
        return self.parent[i]
    def union(self, i, j):
        ri, rj = self.find(i), self.find(j)
        if ri == rj: return False
        if self.rank[ri] < self.rank[rj]: self.parent[ri] = rj
        elif self.rank[ri] > self.rank[rj]: self.parent[rj] = ri
        else: self.parent[rj] = ri; self.rank[ri] += 1
        return True`
    },
    partialScorePlaybook: {
      bruteForceApproach: "Run Floyd-Warshall O(V^3) or unoptimized DFS without visited sets.",
      optimizingInsight: "Use BFS for shortest hops in unit graphs; use DSU with path compression for dynamic component queries.",
      breakingHiddenTests: ["Disconnected graphs (some nodes unreachable)", "Cycles causing infinite loops without visited set", "1-based vs 0-based node indexing"]
    }
  },
  {
    id: "number_theory_and_math",
    name: "Number Theory & Modular Math",
    frequency: "13.3% of P3, 5% overall",
    difficultyFocus: "P2 Medium to P3 Hard",
    summary: "Divisibility, prime factorization via Sieve of Eratosthenes, GCD (Euclidean algorithm), and fast modular exponentiation.",
    storyDisguises: [
      {
        title: "Cryptographic Prime Key Generation",
        scenario: "Verify whether pair factors satisfy coprime conditions under high security bounds.",
        cueWords: ["prime divisors", "greatest common divisor", "coprime", "modulo arithmetic"]
      }
    ],
    templates: {
      java: `// Sieve & Modular Exponentiation
public class MathTemplate {
    public static long power(long base, long exp, long mod) {
        long res = 1; base %= mod;
        while (exp > 0) {
            if ((exp & 1) == 1) res = (res * base) % mod;
            base = (base * base) % mod;
            exp >>= 1;
        }
        return res;
    }
    public static boolean[] sieve(int n) {
        boolean[] isPrime = new boolean[n + 1];
        java.util.Arrays.fill(isPrime, true);
        isPrime[0] = isPrime[1] = false;
        for (int p = 2; p * p <= n; p++) {
            if (isPrime[p]) {
                for (int i = p * p; i <= n; i += p) isPrime[i] = false;
            }
        }
        return isPrime;
    }
}`,
      cpp: `// Math in C++
long long power(long long base, long long exp, long long mod) {
    long long res = 1; base %= mod;
    while (exp > 0) {
        if (exp & 1) res = (__int128(res) * base) % mod;
        base = (__int128(base) * base) % mod;
        exp >>= 1;
    }
    return res;
}`,
      python: `# Math in Python
def power(base, exp, mod):
    return pow(base, exp, mod)`
    },
    partialScorePlaybook: {
      bruteForceApproach: "Trial division up to N for every query (O(Q * N)).",
      optimizingInsight: "Precompute primes up to sqrt(N) or 10^6 once using Sieve in O(N log log N).",
      breakingHiddenTests: ["N=1 edge case in prime checks", "Modulo arithmetic overflow during multiplication", "Negative numbers modulo P"]
    }
  },
  {
    id: "stack_and_monotonic_stack",
    name: "Stack & Monotonic Stack",
    frequency: "6.7% of P3",
    difficultyFocus: "P2 Medium to P3 Hard",
    summary: "Maintains elements in strictly increasing or decreasing order to compute Next Greater Element or Largest Rectangle in O(N) linear time.",
    storyDisguises: [
      {
        title: "Stock Market Surge Detector",
        scenario: "Given daily prices, for each day find the next upcoming day that has a strictly higher market price.",
        cueWords: ["next greater", "previous smaller", "histogram area", "temperature rise"]
      }
    ],
    templates: {
      java: `// Monotonic Stack (Next Greater Element)
import java.util.*;

public class MonoStack {
    public static int[] nextGreater(int[] arr) {
        int n = arr.length;
        int[] result = new int[n];
        Arrays.fill(result, -1);
        ArrayDeque<Integer> stack = new ArrayDeque<>();
        for (int i = 0; i < n; i++) {
            while (!stack.isEmpty() && arr[stack.peek()] < arr[i]) {
                result[stack.pop()] = arr[i];
            }
            stack.push(i);
        }
        return result;
    }
}`,
      cpp: `// Monotonic Stack in C++
#include <vector>
#include <stack>
using namespace std;

vector<int> nextGreater(const vector<int>& arr) {
    int n = arr.size();
    vector<int> result(n, -1);
    stack<int> st;
    for (int i = 0; i < n; ++i) {
        while (!st.empty() && arr[st.top()] < arr[i]) {
            result[st.top()] = arr[i];
            st.pop();
        }
        st.push(i);
    }
    return result;
}`,
      python: `# Monotonic Stack in Python
def next_greater(arr):
    n = len(arr)
    result = [-1] * n
    stack = []
    for i, x in enumerate(arr):
        while stack and arr[stack[-1]] < x:
            result[stack.pop()] = x
        stack.append(i)
    return result`
    },
    partialScorePlaybook: {
      bruteForceApproach: "Scan rightward from index i to N-1 for each element in O(N^2).",
      optimizingInsight: "Every index is pushed and popped from stack at most once, guaranteeing total O(N) time.",
      breakingHiddenTests: ["No greater element exists (must remain -1)", "All elements strictly descending", "Duplicate values"]
    }
  },
  {
    id: "bit_tricks",
    name: "Bit Manipulation & Bitmasking",
    frequency: "6.7% of P3",
    difficultyFocus: "P2 Medium to P3 Hard",
    summary: "Exploiting properties of XOR (self-canceling x ^ x = 0), bitwise AND/OR, and bitmasks to represent subsets up to size N <= 20.",
    storyDisguises: [
      {
        title: "Network Packet Parity Check",
        scenario: "Every sensor broadcasts its ID twice except for a faulty device broadcasting once. Identify the rogue beacon.",
        cueWords: ["single unique ID", "pairwise cancellation", "binary representation", "bitmask state"]
      }
    ],
    templates: {
      java: `// Bit Tricks Template
public class BitUtils {
    public static boolean isPowerOfTwo(long x) { return x > 0 && (x & (x - 1)) == 0; }
    public static int countBits(long x) { return Long.bitCount(x); }
    public static int singleNumber(int[] nums) {
        int xor = 0;
        for (int x : nums) xor ^= x;
        return xor;
    }
}`,
      cpp: `// Bit Tricks in C++
bool isPowerOfTwo(long long x) { return x > 0 && (x & (x - 1)) == 0; }
int countBits(long long x) { return __builtin_popcountll(x); }
int singleNumber(const vector<int>& nums) {
    int x = 0;
    for (int n : nums) x ^= n;
    return x;
}`,
      python: `# Bit Tricks in Python
def is_power_of_two(x): return x > 0 and (x & (x - 1)) == 0
def single_number(nums):
    xor = 0
    for x in nums: xor ^= x
    return xor`
    },
    partialScorePlaybook: {
      bruteForceApproach: "Hash set to count occurrences in O(N) space.",
      optimizingInsight: "XOR accumulation uses O(1) auxiliary space without hash collisions.",
      breakingHiddenTests: ["Shift operator overflow (use 1L << i instead of 1 << i for shifts >= 31)", "Operator precedence (== binds tighter than &)"]
    }
  },
  {
    id: "hashing",
    name: "Hashing & Frequency Maps",
    frequency: "10% of P1",
    difficultyFocus: "P1 Easy",
    summary: "O(1) average lookup to record element frequencies, find complement pairs (target - x), or verify anagrams.",
    storyDisguises: [
      {
        title: "Cash Register Complement Tender",
        scenario: "Customers pay using two bills whose sum matches target total. Find if a valid combination exists.",
        cueWords: ["two sum", "frequency count", "complement lookup", "unique categories"]
      }
    ],
    templates: {
      java: `// Two Sum Hashing in Java
import java.util.*;

public class HashTemplate {
    public static int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int comp = target - nums[i];
            if (map.containsKey(comp)) return new int[]{map.get(comp), i};
            map.put(nums[i], i);
        }
        return new int[0];
    }
}`,
      cpp: `// Hashing in C++
#include <vector>
#include <unordered_map>
using namespace std;

vector<int> twoSum(const vector<int>& nums, int target) {
    unordered_map<int, int> seen;
    for (int i = 0; i < (int)nums.size(); ++i) {
        int comp = target - nums[i];
        if (seen.count(comp)) return {seen[comp], i};
        seen[nums[i]] = i;
    }
    return {};
}`,
      python: `# Hashing in Python
def two_sum(nums, target):
    seen = {}
    for i, x in enumerate(nums):
        comp = target - x
        if comp in seen: return [seen[comp], i]
        seen[x] = i
    return []`
    },
    partialScorePlaybook: {
      bruteForceApproach: "Double loop checking all pairs in O(N^2).",
      optimizingInsight: "Store seen elements in hash map to check complement in O(1).",
      breakingHiddenTests: ["Using the same element twice when target = 2*x", "Hash collisions on malicious inputs in C++ (use custom hash)"]
    }
  },
  {
    id: "strings",
    name: "Strings & Pattern Matching",
    frequency: "6.7% of P3",
    difficultyFocus: "P2 Medium to P3 Hard",
    summary: "String manipulation, palindrome construction, Longest Common Subsequence, and edit distance.",
    storyDisguises: [
      {
        title: "Genome Subsequence Alignment",
        scenario: "Compare two genetic sequences to find minimum deletions required to make them identical.",
        cueWords: ["palindrome insertion", "delete operations", "longest common subsequence"]
      }
    ],
    templates: {
      java: `// Longest Common Subsequence Template
public class LCSTemplate {
    public static int lcs(String s1, String s2) {
        int m = s1.length(), n = s2.length();
        int[][] dp = new int[m + 1][n + 1];
        for (int i = 1; i <= m; i++) {
            for (int j = 1; j <= n; j++) {
                if (s1.charAt(i - 1) == s2.charAt(j - 1)) dp[i][j] = 1 + dp[i - 1][j - 1];
                else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
        return dp[m][n];
    }
}`,
      cpp: `// LCS in C++
#include <string>
#include <vector>
#include <algorithm>
using namespace std;

int lcs(const string& s1, const string& s2) {
    int m = s1.size(), n = s2.size();
    vector<vector<int>> dp(m + 1, vector<int>(n + 1, 0));
    for (int i = 1; i <= m; ++i) {
        for (int j = 1; j <= n; ++j) {
            if (s1[i - 1] == s2[j - 1]) dp[i][j] = 1 + dp[i - 1][j - 1];
            else dp[i][j] = max(dp[i - 1][j], dp[i][j - 1]);
        }
    }
    return dp[m][n];
}`,
      python: `# LCS in Python
def lcs(s1, s2):
    m, n = len(s1), len(s2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if s1[i - 1] == s2[j - 1]: dp[i][j] = 1 + dp[i - 1][j - 1]
            else: dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
    return dp[m][n]`
    },
    partialScorePlaybook: {
      bruteForceApproach: "Recursive string generation (O(2^N)).",
      optimizingInsight: "2D dynamic programming table reduces complexity to O(M * N).",
      breakingHiddenTests: ["Strings with no matching characters (returns 0)", "Strings already palindromes", "Memory limit on 5000 x 5000 table (use 2 rows)"]
    }
  },
  {
    id: "simulation_and_implementation",
    name: "Simulation & Implementation",
    frequency: "10% of P1",
    difficultyFocus: "P1 Easy",
    summary: "Faithfully modeling physical or rule-based processes with matrices, state flags, and step-by-step updates.",
    storyDisguises: [
      {
        title: "Robotic Vacuum Grid Cleaning",
        scenario: "A cleaning rover follows a list of motion instructions (N, S, E, W) in a grid, cleaning dirty tiles. Output final cleaned count.",
        cueWords: ["simulate movement", "turn 90 degrees", "follow rules step by step"]
      }
    ],
    templates: {
      java: `// 2D Directional Simulation
public class GridSimulation {
    static int[] dx = {0, 1, 0, -1}; // R, D, L, U
    static int[] dy = {1, 0, -1, 0};
    public static boolean inBounds(int r, int c, int R, int C) {
        return r >= 0 && r < R && c >= 0 && c < C;
    }
}`,
      cpp: `// Grid Simulation in C++
int dx[] = {0, 1, 0, -1};
int dy[] = {1, 0, -1, 0};
bool inBounds(int r, int c, int R, int C) {
    return r >= 0 && r < R && c >= 0 && c < C;
}`,
      python: `# Simulation in Python
DIRECTIONS = [(0, 1), (1, 0), (0, -1), (-1, 0)]
def in_bounds(r, c, R, C):
    return 0 <= r < R and 0 <= c < C`
    },
    partialScorePlaybook: {
      bruteForceApproach: "Direct step simulation with print statements.",
      optimizingInsight: "Use coordinate arithmetic and boundary checks rather than nested condition statements.",
      breakingHiddenTests: ["Steps taking entity out of grid boundaries", "Infinite cycles or loops", "Off-by-one index mismatch"]
    }
  }
];
