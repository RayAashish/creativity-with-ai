# PYQ Solutions Part 2: PYQ-15 to PYQ-28

part2 = {
    "PYQ-15": {
        "idea": "Merge arrays A and B preserving order with pairwise inversion penalty C(x, y). Use 2D Dynamic Programming dp[i][j]: minimum penalty merging prefix A[0...i-1] and B[0...j-1].",
        "complexity": "Time Complexity: O(M * N) 2D DP. Space Complexity: O(M * N).",
        "pitfalls": ["Relative order of A and B must strictly be preserved.", "Penalty depends on which element precedes which."],
        "java": """import java.io.*;
import java.util.*;

public class Solution {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line = br.readLine();
        if (line == null) return;
        StringTokenizer st = new StringTokenizer(line);
        int m = Integer.parseInt(st.nextToken()), n = Integer.parseInt(st.nextToken());
        int[] a = new int[m], b = new int[n];
        st = new StringTokenizer(br.readLine());
        for (int i = 0; i < m; i++) a[i] = Integer.parseInt(st.nextToken());
        st = new StringTokenizer(br.readLine());
        for (int j = 0; j < n; j++) b[j] = Integer.parseInt(st.nextToken());
        long[][] dp = new long[m + 1][n + 1];
        long INF = 1L << 50;
        for (long[] row : dp) Arrays.fill(row, INF);
        dp[0][0] = 0;
        for (int i = 0; i <= m; i++) {
            for (int j = 0; j <= n; j++) {
                if (i < m) {
                    long cost = (j > 0 && a[i] < b[j - 1]) ? 1 : 0;
                    dp[i + 1][j] = Math.min(dp[i + 1][j], dp[i][j] + cost);
                }
                if (j < n) {
                    long cost = (i > 0 && b[j] < a[i - 1]) ? 1 : 0;
                    dp[i][j + 1] = Math.min(dp[i][j + 1], dp[i][j] + cost);
                }
            }
        }
        System.out.println(dp[m][n]);
    }
}""",
        "cpp": """#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;
const long long INF = 1e16;
int main() {
    ios_base::sync_with_stdio(false); cin.tie(NULL);
    int m, n; if (!(cin >> m >> n)) return 0;
    vector<int> a(m), b(n);
    for (int i = 0; i < m; i++) cin >> a[i];
    for (int j = 0; j < n; j++) cin >> b[j];
    vector<vector<long long>> dp(m + 1, vector<long long>(n + 1, INF));
    dp[0][0] = 0;
    for (int i = 0; i <= m; i++) {
        for (int j = 0; j <= n; j++) {
            if (i < m) {
                long long cost = (j > 0 && a[i] < b[j - 1]) ? 1 : 0;
                dp[i + 1][j] = min(dp[i + 1][j], dp[i][j] + cost);
            }
            if (j < n) {
                long long cost = (i > 0 && b[j] < a[i - 1]) ? 1 : 0;
                dp[i][j + 1] = min(dp[i][j + 1], dp[i][j] + cost);
            }
        }
    }
    cout << dp[m][n] << "\\n";
    return 0;
}""",
        "python": """import sys
def solve():
    data = sys.stdin.read().split()
    if not data: return
    m, n = int(data[0]), int(data[1])
    a = [int(x) for x in data[2:2+m]]
    b = [int(x) for x in data[2+m:2+m+n]]
    INF = 10**16
    dp = [[INF]*(n + 1) for _ in range(m + 1)]
    dp[0][0] = 0
    for i in range(m + 1):
        for j in range(n + 1):
            if i < m:
                cost = 1 if j > 0 and a[i] < b[j - 1] else 0
                dp[i + 1][j] = min(dp[i + 1][j], dp[i][j] + cost)
            if j < n:
                cost = 1 if i > 0 and b[j] < a[i - 1] else 0
                dp[i][j + 1] = min(dp[i][j + 1], dp[i][j] + cost)
    print(dp[m][n])
if __name__ == '__main__': solve()"""
    },

    "PYQ-16": {
        "idea": "Binary search on minimum makespan C. Check if N tasks can be distributed across M identical servers using greedy bin packing or priority queue simulation.",
        "complexity": "Time Complexity: O(N log(Sum T)). Space Complexity: O(M) heap.",
        "pitfalls": ["Single task execution time T[i] > candidate C makes C immediately invalid.", "Tasks cannot be split across servers."],
        "java": """import java.io.*;
import java.util.*;

public class Solution {
    static boolean check(long[] t, int m, long maxLoad) {
        PriorityQueue<Long> pq = new PriorityQueue<>();
        for (int i = 0; i < m; i++) pq.add(0L);
        for (int i = t.length - 1; i >= 0; i--) {
            long load = pq.poll();
            if (load + t[i] > maxLoad) return false;
            pq.add(load + t[i]);
        }
        return true;
    }
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line = br.readLine();
        if (line == null) return;
        StringTokenizer st = new StringTokenizer(line);
        int n = Integer.parseInt(st.nextToken()), m = Integer.parseInt(st.nextToken());
        long[] t = new long[n];
        long maxT = 0, sumT = 0;
        st = new StringTokenizer(br.readLine());
        for (int i = 0; i < n; i++) {
            t[i] = Long.parseLong(st.nextToken());
            maxT = Math.max(maxT, t[i]);
            sumT += t[i];
        }
        Arrays.sort(t);
        long low = maxT, high = sumT, ans = sumT;
        while (low <= high) {
            long mid = low + (high - low) / 2;
            if (check(t, m, mid)) { ans = mid; high = mid - 1; }
            else low = mid + 1;
        }
        System.out.println(ans);
    }
}""",
        "cpp": """#include <iostream>
#include <vector>
#include <queue>
#include <algorithm>
using namespace std;
bool check(const vector<long long>& t, int m, long long maxLoad) {
    priority_queue<long long, vector<long long>, greater<long long>> pq;
    for (int i = 0; i < m; i++) pq.push(0);
    for (int i = (int)t.size() - 1; i >= 0; i--) {
        long long load = pq.top(); pq.pop();
        if (load + t[i] > maxLoad) return false;
        pq.push(load + t[i]);
    }
    return true;
}
int main() {
    ios_base::sync_with_stdio(false); cin.tie(NULL);
    int n, m; if (!(cin >> n >> m)) return 0;
    vector<long long> t(n);
    long long maxT = 0, sumT = 0;
    for (int i = 0; i < n; i++) { cin >> t[i]; maxT = max(maxT, t[i]); sumT += t[i]; }
    sort(t.begin(), t.end());
    long long low = maxT, high = sumT, ans = sumT;
    while (low <= high) {
        long long mid = low + (high - low) / 2;
        if (check(t, m, mid)) { ans = mid; high = mid - 1; }
        else low = mid + 1;
    }
    cout << ans << "\\n";
    return 0;
}""",
        "python": """import sys, heapq
def check(t, m, max_load):
    pq = [0]*m
    for x in reversed(t):
        load = heapq.heappop(pq)
        if load + x > max_load: return False
        heapq.heappush(pq, load + x)
    return True

def solve():
    data = sys.stdin.read().split()
    if not data: return
    n, m = int(data[0]), int(data[1])
    t = sorted([int(x) for x in data[2:2+n]])
    low, high, ans = max(t), sum(t), sum(t)
    while low <= high:
        mid = (low + high) // 2
        if check(t, m, mid):
            ans = mid; high = mid - 1
        else:
            low = mid + 1
    print(ans)
if __name__ == '__main__': solve()"""
    },

    "PYQ-17": {
        "idea": "Partition array into minimum number of contiguous subarrays such that beauty (LIS length) strictly increases from left to right. Precompute LIS lengths of subarrays and run DP.",
        "complexity": "Time Complexity: O(N^2) DP with subarray LIS. Space Complexity: O(N^2).",
        "pitfalls": ["Beauty values must be strictly increasing.", "If no valid partition exists, return -1."],
        "java": """import java.io.*;
import java.util.*;

public class Solution {
    static int calcLIS(int[] a, int l, int r) {
        List<Integer> tails = new ArrayList<>();
        for (int i = l; i <= r; i++) {
            int x = a[i];
            int idx = Collections.binarySearch(tails, x);
            if (idx < 0) idx = -(idx + 1);
            if (idx == tails.size()) tails.add(x);
            else tails.set(idx, x);
        }
        return tails.size();
    }
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line = br.readLine();
        if (line == null) return;
        int n = Integer.parseInt(line.trim());
        int[] a = new int[n];
        StringTokenizer st = new StringTokenizer(br.readLine());
        for (int i = 0; i < n; i++) a[i] = Integer.parseInt(st.nextToken());
        int[][] lis = new int[n][n];
        for (int i = 0; i < n; i++)
            for (int j = i; j < n; j++) lis[i][j] = calcLIS(a, i, j);
        int[] minCuts = new int[n + 1];
        int[] lastBeauty = new int[n + 1];
        Arrays.fill(minCuts, 10000);
        minCuts[0] = 0; lastBeauty[0] = 0;
        for (int i = 1; i <= n; i++) {
            for (int j = 0; j < i; j++) {
                if (minCuts[j] < 10000 && lis[j][i - 1] > lastBeauty[j]) {
                    if (minCuts[j] + 1 < minCuts[i]) {
                        minCuts[i] = minCuts[j] + 1;
                        lastBeauty[i] = lis[j][i - 1];
                    }
                }
            }
        }
        System.out.println(minCuts[n] >= 10000 ? -1 : minCuts[n]);
    }
}""",
        "cpp": """#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;
int calcLIS(const vector<int>& a, int l, int r) {
    vector<int> tails;
    for (int i = l; i <= r; i++) {
        auto it = lower_bound(tails.begin(), tails.end(), a[i]);
        if (it == tails.end()) tails.push_back(a[i]);
        else *it = a[i];
    }
    return tails.size();
}
int main() {
    ios_base::sync_with_stdio(false); cin.tie(NULL);
    int n; if (!(cin >> n)) return 0;
    vector<int> a(n);
    for (int i = 0; i < n; i++) cin >> a[i];
    vector<vector<int>> lis(n, vector<int>(n, 0));
    for (int i = 0; i < n; i++)
        for (int j = i; j < n; j++) lis[i][j] = calcLIS(a, i, j);
    vector<int> minCuts(n + 1, 10000), lastB(n + 1, 0);
    minCuts[0] = 0;
    for (int i = 1; i <= n; i++) {
        for (int j = 0; j < i; j++) {
            if (minCuts[j] < 10000 && lis[j][i - 1] > lastB[j]) {
                if (minCuts[j] + 1 < minCuts[i]) {
                    minCuts[i] = minCuts[j] + 1;
                    lastB[i] = lis[j][i - 1];
                }
            }
        }
    }
    cout << (minCuts[n] >= 10000 ? -1 : minCuts[n]) << "\\n";
    return 0;
}""",
        "python": """import sys, bisect
def calc_lis(a, l, r):
    tails = []
    for i in range(l, r + 1):
        idx = bisect.bisect_left(tails, a[i])
        if idx == len(tails): tails.append(a[i])
        else: tails[idx] = a[i]
    return len(tails)

def solve():
    data = sys.stdin.read().split()
    if not data: return
    n = int(data[0])
    a = [int(x) for x in data[1:1+n]]
    lis = [[calc_lis(a, i, j) for j in range(n)] for i in range(n)]
    min_cuts = [10000]*(n + 1)
    last_b = [0]*(n + 1)
    min_cuts[0] = 0
    for i in range(1, n + 1):
        for j in range(i):
            if min_cuts[j] < 10000 and lis[j][i - 1] > last_b[j]:
                if min_cuts[j] + 1 < min_cuts[i]:
                    min_cuts[i] = min_cuts[j] + 1
                    last_b[i] = lis[j][i - 1]
    print(-1 if min_cuts[n] >= 10000 else min_cuts[n])
if __name__ == '__main__': solve()"""
    },

    "PYQ-18": {
        "idea": "Circular pizza with 3N slices, choose N non-adjacent slices. Break circular array into two linear subproblems: slices 0 to 3N-2 and slices 1 to 3N-1. DP dp[i][j]: max sum choosing j elements from first i.",
        "complexity": "Time Complexity: O(N^2). Space Complexity: O(N^2).",
        "pitfalls": ["Slices 0 and 3N-1 are circular neighbors and cannot both be picked without tokens."],
        "java": """import java.io.*;
import java.util.*;

public class Solution {
    static int solveLinear(int[] slices, int l, int r, int k) {
        int m = r - l + 1;
        int[][] dp = new int[m + 1][k + 1];
        for (int i = 1; i <= m; i++) {
            int val = slices[l + i - 1];
            for (int j = 1; j <= k; j++) {
                int take = val + (i >= 2 ? dp[i - 2][j - 1] : 0);
                int skip = dp[i - 1][j];
                dp[i][j] = Math.max(take, skip);
            }
        }
        return dp[m][k];
    }
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line = br.readLine();
        if (line == null) return;
        int n3 = Integer.parseInt(line.trim());
        int[] slices = new int[n3];
        StringTokenizer st = new StringTokenizer(br.readLine());
        for (int i = 0; i < n3; i++) slices[i] = Integer.parseInt(st.nextToken());
        int k = n3 / 3;
        int ans1 = solveLinear(slices, 0, n3 - 2, k);
        int ans2 = solveLinear(slices, 1, n3 - 1, k);
        System.out.println(Math.max(ans1, ans2));
    }
}""",
        "cpp": """#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;
int solveLinear(const vector<int>& s, int l, int r, int k) {
    int m = r - l + 1;
    vector<vector<int>> dp(m + 1, vector<int>(k + 1, 0));
    for (int i = 1; i <= m; i++) {
        int val = s[l + i - 1];
        for (int j = 1; j <= k; j++) {
            int take = val + (i >= 2 ? dp[i - 2][j - 1] : 0);
            int skip = dp[i - 1][j];
            dp[i][j] = max(take, skip);
        }
    }
    return dp[m][k];
}
int main() {
    ios_base::sync_with_stdio(false); cin.tie(NULL);
    int n3; if (!(cin >> n3)) return 0;
    vector<int> s(n3);
    for (int i = 0; i < n3; i++) cin >> s[i];
    int k = n3 / 3;
    cout << max(solveLinear(s, 0, n3 - 2, k), solveLinear(s, 1, n3 - 1, k)) << "\\n";
    return 0;
}""",
        "python": """import sys
def solve_linear(s, l, r, k):
    m = r - l + 1
    dp = [[0]*(k + 1) for _ in range(m + 1)]
    for i in range(1, m + 1):
        val = s[l + i - 1]
        for j in range(1, k + 1):
            take = val + (dp[i - 2][j - 1] if i >= 2 else 0)
            skip = dp[i - 1][j]
            dp[i][j] = max(take, skip)
    return dp[m][k]

def solve():
    data = sys.stdin.read().split()
    if not data: return
    n3 = int(data[0])
    s = [int(x) for x in data[1:1+n3]]
    k = n3 // 3
    print(max(solve_linear(s, 0, n3 - 2, k), solve_linear(s, 1, n3 - 1, k)))
if __name__ == '__main__': solve()"""
    },

    "PYQ-19": {
        "idea": "Sort array. Use sliding window [L, R] covering at least ceil(N/2) elements. Minimize the value range A[R] - A[L] + 1.",
        "complexity": "Time Complexity: O(N log N) sorting. Space Complexity: O(N).",
        "pitfalls": ["Required elimination count is at least ceil(N/2).", "Range length is A[R] - A[L] + 1."],
        "java": """import java.io.*;
import java.util.*;

public class Solution {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line = br.readLine();
        if (line == null) return;
        int n = Integer.parseInt(line.trim());
        long[] a = new long[n];
        StringTokenizer st = new StringTokenizer(br.readLine());
        for (int i = 0; i < n; i++) a[i] = Long.parseLong(st.nextToken());
        Arrays.sort(a);
        int target = (n + 1) / 2;
        long minRange = Long.MAX_VALUE;
        for (int l = 0; l + target - 1 < n; l++) {
            int r = l + target - 1;
            minRange = Math.min(minRange, a[r] - a[l] + 1);
        }
        System.out.println(minRange);
    }
}""",
        "cpp": """#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;
int main() {
    ios_base::sync_with_stdio(false); cin.tie(NULL);
    int n; if (!(cin >> n)) return 0;
    vector<long long> a(n);
    for (int i = 0; i < n; i++) cin >> a[i];
    sort(a.begin(), a.end());
    int target = (n + 1) / 2;
    long long minRange = 1e18;
    for (int l = 0; l + target - 1 < n; l++) {
        int r = l + target - 1;
        minRange = min(minRange, a[r] - a[l] + 1);
    }
    cout << minRange << "\\n";
    return 0;
}""",
        "python": """import sys
def solve():
    data = sys.stdin.read().split()
    if not data: return
    n = int(data[0])
    a = sorted([int(x) for x in data[1:1+n]])
    target = (n + 1) // 2
    min_range = min(a[l + target - 1] - a[l] + 1 for l in range(n - target + 1))
    print(min_range)
if __name__ == '__main__': solve()"""
    },

    "PYQ-20": {
        "idea": "Separate rods by material (0 and 1). Sort both descending. Greedily pair the i-th longest rod of material 0 with the i-th longest rod of material 1. Score is min(L0[i], L1[i]), sum modulo 10^9+7.",
        "complexity": "Time Complexity: O(N log N) sorting. Space Complexity: O(N).",
        "pitfalls": ["Unpaired rods of excess material are discarded.", "Modulo 10^9+7 applied to sum."],
        "java": """import java.io.*;
import java.util.*;

public class Solution {
    static final int MOD = 1_000_000_007;
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line = br.readLine();
        if (line == null) return;
        int n = Integer.parseInt(line.trim());
        List<Long> m0 = new ArrayList<>(), m1 = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            StringTokenizer st = new StringTokenizer(br.readLine());
            long len = Long.parseLong(st.nextToken());
            int mat = Integer.parseInt(st.nextToken());
            if (mat == 0) m0.add(len);
            else m1.add(len);
        }
        m0.sort(Collections.reverseOrder());
        m1.sort(Collections.reverseOrder());
        int pairs = Math.min(m0.size(), m1.size());
        long totalScore = 0;
        for (int i = 0; i < pairs; i++) {
            totalScore = (totalScore + Math.min(m0.get(i), m1.get(i))) % MOD;
        }
        System.out.println(totalScore);
    }
}""",
        "cpp": """#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;
const int MOD = 1000000007;
int main() {
    ios_base::sync_with_stdio(false); cin.tie(NULL);
    int n; if (!(cin >> n)) return 0;
    vector<long long> m0, m1;
    for (int i = 0; i < n; i++) {
        long long len; int mat; cin >> len >> mat;
        if (mat == 0) m0.push_back(len);
        else m1.push_back(len);
    }
    sort(m0.rbegin(), m0.rend());
    sort(m1.rbegin(), m1.rend());
    int pairs = min(m0.size(), m1.size());
    long long total = 0;
    for (int i = 0; i < pairs; i++) total = (total + min(m0[i], m1[i])) % MOD;
    cout << total << "\\n";
    return 0;
}""",
        "python": """import sys
def solve():
    data = sys.stdin.read().split()
    if not data: return
    n, MOD = int(data[0]), 10**9 + 7
    m0, m1 = [], []
    idx = 1
    for _ in range(n):
        l, m = int(data[idx]), int(data[idx+1])
        idx += 2
        if m == 0: m0.append(l)
        else: m1.append(l)
    m0.sort(reverse=True)
    m1.sort(reverse=True)
    total = sum(min(a, b) for a, b in zip(m0, m1)) % MOD
    print(total)
if __name__ == '__main__': solve()"""
    },

    "PYQ-21": {
        "idea": "Partition array into minimum number of contiguous subarrays such that sum(x) + max(x) <= MaxTension. Use greedy forward sliding window.",
        "complexity": "Time Complexity: O(N) linear pass. Space Complexity: O(N).",
        "pitfalls": ["Single element with x + x > MaxTension makes partitioning impossible (-1)."],
        "java": """import java.io.*;
import java.util.*;

public class Solution {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line = br.readLine();
        if (line == null) return;
        StringTokenizer st = new StringTokenizer(line);
        int n = Integer.parseInt(st.nextToken());
        long maxTension = Long.parseLong(st.nextToken());
        long[] a = new long[n];
        st = new StringTokenizer(br.readLine());
        for (int i = 0; i < n; i++) {
            a[i] = Long.parseLong(st.nextToken());
            if (a[i] * 2 > maxTension) { System.out.println(-1); return; }
        }
        int parts = 1;
        long curSum = a[0], curMax = a[0];
        for (int i = 1; i < n; i++) {
            long nextSum = curSum + a[i];
            long nextMax = Math.max(curMax, a[i]);
            if (nextSum + nextMax <= maxTension) {
                curSum = nextSum; curMax = nextMax;
            } else {
                parts++;
                curSum = a[i]; curMax = a[i];
            }
        }
        System.out.println(parts);
    }
}""",
        "cpp": """#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;
int main() {
    ios_base::sync_with_stdio(false); cin.tie(NULL);
    int n; long long maxTension;
    if (!(cin >> n >> maxTension)) return 0;
    vector<long long> a(n);
    for (int i = 0; i < n; i++) {
        cin >> a[i];
        if (a[i] * 2 > maxTension) { cout << -1 << "\\n"; return 0; }
    }
    int parts = 1;
    long long curSum = a[0], curMax = a[0];
    for (int i = 1; i < n; i++) {
        long long nSum = curSum + a[i];
        long long nMax = max(curMax, a[i]);
        if (nSum + nMax <= maxTension) {
            curSum = nSum; curMax = nMax;
        } else {
            parts++; curSum = a[i]; curMax = a[i];
        }
    }
    cout << parts << "\\n";
    return 0;
}""",
        "python": """import sys
def solve():
    data = sys.stdin.read().split()
    if not data: return
    n, max_tension = int(data[0]), int(data[1])
    a = [int(x) for x in data[2:2+n]]
    for x in a:
        if x * 2 > max_tension: print(-1); return
    parts, cur_sum, cur_max = 1, a[0], a[0]
    for i in range(1, n):
        n_sum = cur_sum + a[i]
        n_max = max(cur_max, a[i])
        if n_sum + n_max <= max_tension:
            cur_sum, cur_max = n_sum, n_max
        else:
            parts += 1
            cur_sum, cur_max = a[i], a[i]
    print(parts)
if __name__ == '__main__': solve()"""
    },

    "PYQ-22": {
        "idea": "Street lamps illuminate posts i-1, i, i+1. Generator revives at most K consecutive dead posts. Use sliding window to find optimal K posts to revive, then greedily place lamps.",
        "complexity": "Time Complexity: O(N) sliding window and greedy pass. Space Complexity: O(N).",
        "pitfalls": ["Consecutive dead posts revived must be <= K.", "Greedy lamp covers up to 3 posts."],
        "java": """import java.io.*;
import java.util.*;

public class Solution {
    static int minLamps(char[] s) {
        int n = s.length, count = 0, i = 0;
        while (i < n) {
            if (s[i] == 'D') {
                int lampPos = Math.min(n - 1, i + 1);
                count++;
                i = lampPos + 2;
            } else {
                i++;
            }
        }
        return count;
    }
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line = br.readLine();
        if (line == null) return;
        StringTokenizer st = new StringTokenizer(line);
        int n = Integer.parseInt(st.nextToken()), k = Integer.parseInt(st.nextToken());
        char[] s = br.readLine().trim().toCharArray();
        int best = minLamps(s);
        for (int i = 0; i < n; i++) {
            char[] copy = s.clone();
            for (int j = i; j < Math.min(n, i + k); j++) copy[j] = 'L';
            best = Math.min(best, minLamps(copy));
        }
        System.out.println(best);
    }
}""",
        "cpp": """#include <iostream>
#include <string>
#include <vector>
#include <algorithm>
using namespace std;
int minLamps(string s) {
    int n = s.size(), count = 0, i = 0;
    while (i < n) {
        if (s[i] == 'D') {
            int lamp = min(n - 1, i + 1);
            count++;
            i = lamp + 2;
        } else {
            i++;
        }
    }
    return count;
}
int main() {
    ios_base::sync_with_stdio(false); cin.tie(NULL);
    int n, k; if (!(cin >> n >> k)) return 0;
    string s; cin >> s;
    int best = minLamps(s);
    for (int i = 0; i < n; i++) {
        string cp = s;
        for (int j = i; j < min(n, i + k); j++) cp[j] = 'L';
        best = min(best, minLamps(cp));
    }
    cout << best << "\\n";
    return 0;
}""",
        "python": """import sys
def min_lamps(s):
    n, count, i = len(s), 0, 0
    while i < n:
        if s[i] == 'D':
            lamp = min(n - 1, i + 1)
            count += 1
            i = lamp + 2
        else:
            i += 1
    return count

def solve():
    data = sys.stdin.read().split()
    if not data: return
    n, k = int(data[0]), int(data[1])
    s = list(data[2])
    best = min_lamps(s)
    for i in range(n):
        cp = s[:]
        for j in range(i, min(n, i + k)): cp[j] = 'L'
        best = min(best, min_lamps(cp))
    print(best)
if __name__ == '__main__': solve()"""
    },

    "PYQ-23": {
        "idea": "3D Dynamic Programming dp[i][cntA][lastCity]: min cost placing first i candidates with cntA sent to City A, and candidate i-1 sent to lastCity (0=A, 1=B). Consecutive identical dispatches incur penalty P.",
        "complexity": "Time Complexity: O(N^2) DP. Space Complexity: O(N^2).",
        "pitfalls": ["Exactly N/2 candidates must go to each city.", "Consecutive same city dispatch adds penalty P."],
        "java": """import java.io.*;
import java.util.*;

public class Solution {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line = br.readLine();
        if (line == null) return;
        StringTokenizer st = new StringTokenizer(line);
        int n = Integer.parseInt(st.nextToken());
        long p = Long.parseLong(st.nextToken());
        long[] a = new long[n], b = new long[n];
        for (int i = 0; i < n; i++) {
            st = new StringTokenizer(br.readLine());
            a[i] = Long.parseLong(st.nextToken());
            b[i] = Long.parseLong(st.nextToken());
        }
        int half = n / 2;
        long INF = 1L << 55;
        long[][][] dp = new long[n + 1][half + 1][2];
        for (int i = 0; i <= n; i++)
            for (int j = 0; j <= half; j++) Arrays.fill(dp[i][j], INF);
        dp[0][0][0] = 0; dp[0][0][1] = 0;
        for (int i = 1; i <= n; i++) {
            for (int ca = 0; ca <= half && ca <= i; ca++) {
                if (ca > 0) {
                    long costA = a[i - 1];
                    long fromA = (i == 1 ? dp[0][0][0] : dp[i - 1][ca - 1][0] + p);
                    long fromB = dp[i - 1][ca - 1][1];
                    dp[i][ca][0] = costA + Math.min(fromA, fromB);
                }
                int cb = i - ca;
                if (cb > 0 && cb <= half) {
                    long costB = b[i - 1];
                    long fromA = dp[i - 1][ca][0];
                    long fromB = (i == 1 ? dp[0][0][1] : dp[i - 1][ca][1] + p);
                    dp[i][ca][1] = costB + Math.min(fromA, fromB);
                }
            }
        }
        System.out.println(Math.min(dp[n][half][0], dp[n][half][1]));
    }
}""",
        "cpp": """#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;
const long long INF = 1e16;
int main() {
    ios_base::sync_with_stdio(false); cin.tie(NULL);
    int n; long long p; if (!(cin >> n >> p)) return 0;
    vector<long long> a(n), b(n);
    for (int i = 0; i < n; i++) cin >> a[i] >> b[i];
    int half = n / 2;
    vector<vector<vector<long long>>> dp(n + 1, vector<vector<long long>>(half + 1, vector<long long>(2, INF)));
    dp[0][0][0] = 0; dp[0][0][1] = 0;
    for (int i = 1; i <= n; i++) {
        for (int ca = 0; ca <= half && ca <= i; ca++) {
            if (ca > 0) {
                long long fromA = (i == 1 ? dp[0][0][0] : dp[i - 1][ca - 1][0] + p);
                dp[i][ca][0] = a[i - 1] + min(fromA, dp[i - 1][ca - 1][1]);
            }
            int cb = i - ca;
            if (cb > 0 && cb <= half) {
                long long fromB = (i == 1 ? dp[0][0][1] : dp[i - 1][ca][1] + p);
                dp[i][ca][1] = b[i - 1] + min(dp[i - 1][ca][0], fromB);
            }
        }
    }
    cout << min(dp[n][half][0], dp[n][half][1]) << "\\n";
    return 0;
}""",
        "python": """import sys
def solve():
    data = sys.stdin.read().split()
    if not data: return
    n, p = int(data[0]), int(data[1])
    a, b = [], []
    idx = 2
    for _ in range(n):
        a.append(int(data[idx])); b.append(int(data[idx+1]))
        idx += 2
    half = n // 2
    INF = 10**16
    dp = [[[INF]*2 for _ in range(half + 1)] for _ in range(n + 1)]
    dp[0][0][0] = 0; dp[0][0][1] = 0
    for i in range(1, n + 1):
        for ca in range(min(half, i) + 1):
            if ca > 0:
                from_a = dp[0][0][0] if i == 1 else dp[i - 1][ca - 1][0] + p
                dp[i][ca][0] = a[i - 1] + min(from_a, dp[i - 1][ca - 1][1])
            cb = i - ca
            if 0 < cb <= half:
                from_b = dp[0][0][1] if i == 1 else dp[i - 1][ca][1] + p
                dp[i][ca][1] = b[i - 1] + min(dp[i - 1][ca][0], from_b)
    print(min(dp[n][half][0], dp[n][half][1]))
if __name__ == '__main__': solve()"""
    },

    "PYQ-24": {
        "idea": "Car pooling simulation via Difference Array. Increment passengers at pickup station 'from', decrement at dropoff station 'to'. Take prefix sums and verify capacity is never exceeded.",
        "complexity": "Time Complexity: O(N + MaxStation) linear sweep. Space Complexity: O(MaxStation).",
        "pitfalls": ["Passengers leave at 'to', so capacity is freed before new pickups at 'to'."],
        "java": """import java.io.*;
import java.util.*;

public class Solution {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line = br.readLine();
        if (line == null) return;
        StringTokenizer st = new StringTokenizer(line);
        int n = Integer.parseInt(st.nextToken()), capacity = Integer.parseInt(st.nextToken());
        int[] diff = new int[1001];
        for (int i = 0; i < n; i++) {
            st = new StringTokenizer(br.readLine());
            int num = Integer.parseInt(st.nextToken());
            int from = Integer.parseInt(st.nextToken());
            int to = Integer.parseInt(st.nextToken());
            diff[from] += num;
            diff[to] -= num;
        }
        int cur = 0;
        for (int d : diff) {
            cur += d;
            if (cur > capacity) { System.out.println("false"); return; }
        }
        System.out.println("true");
    }
}""",
        "cpp": """#include <iostream>
#include <vector>
using namespace std;
int main() {
    ios_base::sync_with_stdio(false); cin.tie(NULL);
    int n, cap; if (!(cin >> n >> cap)) return 0;
    vector<int> diff(1005, 0);
    for (int i = 0; i < n; i++) {
        int num, from, to; cin >> num >> from >> to;
        diff[from] += num; diff[to] -= num;
    }
    int cur = 0;
    for (int x : diff) {
        cur += x;
        if (cur > cap) { cout << "false\\n"; return 0; }
    }
    cout << "true\\n";
    return 0;
}""",
        "python": """import sys
def solve():
    data = sys.stdin.read().split()
    if not data: return
    n, cap = int(data[0]), int(data[1])
    diff = [0] * 1005
    idx = 2
    for _ in range(n):
        num, f, t = int(data[idx]), int(data[idx+1]), int(data[idx+2])
        diff[f] += num; diff[t] -= num
        idx += 3
    cur = 0
    for x in diff:
        cur += x
        if cur > cap: print("false"); return
    print("true")
if __name__ == '__main__': solve()"""
    },

    "PYQ-25": {
        "idea": "Maximum vacation days via 2D Dynamic Programming dp[week][city]: maximum vacation days accrued up to week w ending in city c. Transition from city c' if flights exist from c' to c.",
        "complexity": "Time Complexity: O(N * K^2) DP. Space Complexity: O(N * K).",
        "pitfalls": ["Starts at city 0 in week 0.", "Can stay in same city without taking a flight."],
        "java": """import java.io.*;
import java.util.*;

public class Solution {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line = br.readLine();
        if (line == null) return;
        StringTokenizer st = new StringTokenizer(line);
        int k = Integer.parseInt(st.nextToken()), n = Integer.parseInt(st.nextToken());
        int[][] flights = new int[k][k];
        for (int i = 0; i < k; i++) {
            st = new StringTokenizer(br.readLine());
            for (int j = 0; j < k; j++) flights[i][j] = Integer.parseInt(st.nextToken());
            flights[i][i] = 1; // Can stay in same city
        }
        int[][] days = new int[k][n];
        for (int i = 0; i < k; i++) {
            st = new StringTokenizer(br.readLine());
            for (int j = 0; j < n; j++) days[i][j] = Integer.parseInt(st.nextToken());
        }
        int[] dp = new int[k];
        Arrays.fill(dp, -1);
        dp[0] = 0;
        for (int w = 0; w < n; w++) {
            int[] nextDp = new int[k];
            Arrays.fill(nextDp, -1);
            for (int cur = 0; cur < k; cur++) {
                for (int prev = 0; prev < k; prev++) {
                    if (dp[prev] != -1 && flights[prev][cur] == 1) {
                        nextDp[cur] = Math.max(nextDp[cur], dp[prev] + days[cur][w]);
                    }
                }
            }
            dp = nextDp;
        }
        int maxDays = 0;
        for (int d : dp) maxDays = Math.max(maxDays, d);
        System.out.println(maxDays);
    }
}""",
        "cpp": """#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;
int main() {
    ios_base::sync_with_stdio(false); cin.tie(NULL);
    int k, n; if (!(cin >> k >> n)) return 0;
    vector<vector<int>> flights(k, vector<int>(k));
    for (int i = 0; i < k; i++) {
        for (int j = 0; j < k; j++) cin >> flights[i][j];
        flights[i][i] = 1;
    }
    vector<vector<int>> days(k, vector<int>(n));
    for (int i = 0; i < k; i++)
        for (int j = 0; j < n; j++) cin >> days[i][j];
    vector<int> dp(k, -1);
    dp[0] = 0;
    for (int w = 0; w < n; w++) {
        vector<int> nextDp(k, -1);
        for (int cur = 0; cur < k; cur++) {
            for (int prev = 0; prev < k; prev++) {
                if (dp[prev] != -1 && flights[prev][cur] == 1) {
                    nextDp[cur] = max(nextDp[cur], dp[prev] + days[cur][w]);
                }
            }
        }
        dp = nextDp;
    }
    int ans = 0;
    for (int d : dp) ans = max(ans, d);
    cout << ans << "\\n";
    return 0;
}""",
        "python": """import sys
def solve():
    data = sys.stdin.read().split()
    if not data: return
    k, n = int(data[0]), int(data[1])
    flights = []
    idx = 2
    for i in range(k):
        row = [int(data[idx+j]) for j in range(k)]
        row[i] = 1
        flights.append(row)
        idx += k
    days = []
    for _ in range(k):
        days.append([int(data[idx+j]) for j in range(n)])
        idx += n
    dp = [-1]*k
    dp[0] = 0
    for w in range(n):
        next_dp = [-1]*k
        for cur in range(k):
            for prev in range(k):
                if dp[prev] != -1 and flights[prev][cur] == 1:
                    next_dp[cur] = max(next_dp[cur], dp[prev] + days[cur][w])
        dp = next_dp
    print(max(dp))
if __name__ == '__main__': solve()"""
    },

    "PYQ-26": {
        "idea": "Binary search on minimum ugliness L in range [1, N]. For candidate L, greedily scan consecutive identical character runs: a run of length len requires len // (L + 1) flips. Valid if total flips <= K.",
        "complexity": "Time Complexity: O(N log N) binary search. Space Complexity: O(N).",
        "pitfalls": ["Edge case L=1 requires alternating parity checks (0101... or 1010...)."],
        "java": """import java.io.*;
import java.util.*;

public class Solution {
    static boolean check(String s, int maxRun, int k) {
        if (maxRun == 1) {
            int flips0 = 0, flips1 = 0;
            for (int i = 0; i < s.length(); i++) {
                char exp0 = (i % 2 == 0) ? '0' : '1';
                if (s.charAt(i) != exp0) flips0++;
                else flips1++;
            }
            return Math.min(flips0, flips1) <= k;
        }
        int flips = 0, curRun = 1;
        for (int i = 1; i < s.length(); i++) {
            if (s.charAt(i) == s.charAt(i - 1)) {
                curRun++;
            } else {
                flips += curRun / (maxRun + 1);
                curRun = 1;
            }
        }
        flips += curRun / (maxRun + 1);
        return flips <= k;
    }
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line = br.readLine();
        if (line == null) return;
        StringTokenizer st = new StringTokenizer(line);
        int n = Integer.parseInt(st.nextToken()), k = Integer.parseInt(st.nextToken());
        String s = br.readLine().trim();
        int low = 1, high = n, ans = n;
        while (low <= high) {
            int mid = low + (high - low) / 2;
            if (check(s, mid, k)) { ans = mid; high = mid - 1; }
            else low = mid + 1;
        }
        System.out.println(ans);
    }
}""",
        "cpp": """#include <iostream>
#include <string>
#include <algorithm>
using namespace std;
bool check(const string& s, int maxRun, int k) {
    if (maxRun == 1) {
        int f0 = 0, f1 = 0;
        for (int i = 0; i < (int)s.size(); i++) {
            char e0 = (i % 2 == 0) ? '0' : '1';
            if (s[i] != e0) f0++; else f1++;
        }
        return min(f0, f1) <= k;
    }
    int flips = 0, cur = 1;
    for (int i = 1; i < (int)s.size(); i++) {
        if (s[i] == s[i - 1]) cur++;
        else { flips += cur / (maxRun + 1); cur = 1; }
    }
    flips += cur / (maxRun + 1);
    return flips <= k;
}
int main() {
    ios_base::sync_with_stdio(false); cin.tie(NULL);
    int n, k; if (!(cin >> n >> k)) return 0;
    string s; cin >> s;
    int low = 1, high = n, ans = n;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (check(s, mid, k)) { ans = mid; high = mid - 1; }
        else low = mid + 1;
    }
    cout << ans << "\\n";
    return 0;
}""",
        "python": """import sys
def check(s, max_run, k):
    if max_run == 1:
        f0 = sum(1 for i, ch in enumerate(s) if ch != ('0' if i % 2 == 0 else '1'))
        return min(f0, len(s) - f0) <= k
    flips, cur = 0, 1
    for i in range(1, len(s)):
        if s[i] == s[i - 1]: cur += 1
        else:
            flips += cur // (max_run + 1)
            cur = 1
    flips += cur // (max_run + 1)
    return flips <= k

def solve():
    data = sys.stdin.read().split()
    if not data: return
    n, k = int(data[0]), int(data[1])
    s = data[2]
    low, high, ans = 1, n, n
    while low <= high:
        mid = (low + high) // 2
        if check(s, mid, k):
            ans = mid; high = mid - 1
        else:
            low = mid + 1
    print(ans)
if __name__ == '__main__': solve()"""
    },

    "PYQ-27": {
        "idea": "Dynamic programming with precomputed divisor graph: dp[i][val] = count of valid arrays of length i ending in val. dp[i][val] = sum over d | val of dp[i-1][d] + sum over multiples m of val of dp[i-1][m] (avoiding double counting val).",
        "complexity": "Time Complexity: O(N * M log M). Space Complexity: O(M).",
        "pitfalls": ["Double counting when d == val.", "Modulo 10^9+7 arithmetic."],
        "java": """import java.io.*;
import java.util.*;

public class Solution {
    static final int MOD = 1_000_000_007;
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line = br.readLine();
        if (line == null) return;
        StringTokenizer st = new StringTokenizer(line);
        int n = Integer.parseInt(st.nextToken()), m = Integer.parseInt(st.nextToken());
        List<Integer>[] neighbors = new ArrayList[m + 1];
        for (int i = 1; i <= m; i++) neighbors[i] = new ArrayList<>();
        for (int i = 1; i <= m; i++) {
            for (int j = i; j <= m; j += i) {
                neighbors[j].add(i); // i divides j
                if (i != j) neighbors[i].add(j); // j is multiple of i
            }
        }
        long[] dp = new long[m + 1];
        Arrays.fill(dp, 1);
        dp[0] = 0;
        for (int step = 2; step <= n; step++) {
            long[] nextDp = new long[m + 1];
            for (int val = 1; val <= m; val++) {
                long sum = 0;
                for (int nb : neighbors[val]) sum = (sum + dp[nb]) % MOD;
                nextDp[val] = sum;
            }
            dp = nextDp;
        }
        long total = 0;
        for (int i = 1; i <= m; i++) total = (total + dp[i]) % MOD;
        System.out.println(total);
    }
}""",
        "cpp": """#include <iostream>
#include <vector>
using namespace std;
const int MOD = 1000000007;
int main() {
    ios_base::sync_with_stdio(false); cin.tie(NULL);
    int n, m; if (!(cin >> n >> m)) return 0;
    vector<vector<int>> neighbors(m + 1);
    for (int i = 1; i <= m; i++) {
        for (int j = i; j <= m; j += i) {
            neighbors[j].push_back(i);
            if (i != j) neighbors[i].push_back(j);
        }
    }
    vector<long long> dp(m + 1, 1);
    dp[0] = 0;
    for (int step = 2; step <= n; step++) {
        vector<long long> nextDp(m + 1, 0);
        for (int val = 1; val <= m; val++) {
            long long s = 0;
            for (int nb : neighbors[val]) s = (s + dp[nb]) % MOD;
            nextDp[val] = s;
        }
        dp = nextDp;
    }
    long long total = 0;
    for (int i = 1; i <= m; i++) total = (total + dp[i]) % MOD;
    cout << total << "\\n";
    return 0;
}""",
        "python": """import sys
def solve():
    data = sys.stdin.read().split()
    if not data: return
    n, m, MOD = int(data[0]), int(data[1]), 10**9 + 7
    neighbors = [[] for _ in range(m + 1)]
    for i in range(1, m + 1):
        for j in range(i, m + 1, i):
            neighbors[j].append(i)
            if i != j: neighbors[i].append(j)
    dp = [1]*(m + 1)
    dp[0] = 0
    for _ in range(2, n + 1):
        next_dp = [0]*(m + 1)
        for val in range(1, m + 1):
            next_dp[val] = sum(dp[nb] for nb in neighbors[val]) % MOD
        dp = next_dp
    print(sum(dp[1:]) % MOD)
if __name__ == '__main__': solve()"""
    },

    "PYQ-28": {
        "idea": "Find longest strict mountain subsequence. Compute prefix LIS (inc[i]) and suffix LDS (dec[i]) using binary search O(N log N). Peak requires inc[i] > 1 and dec[i] > 1. Min removals is N - max(inc[i] + dec[i] - 1).",
        "complexity": "Time Complexity: O(N log N) patient sorting LIS/LDS. Space Complexity: O(N).",
        "pitfalls": ["Mountain must have both strictly increasing and strictly decreasing sides (inc[i] > 1, dec[i] > 1)."],
        "java": """import java.io.*;
import java.util.*;

public class Solution {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line = br.readLine();
        if (line == null) return;
        int n = Integer.parseInt(line.trim());
        int[] a = new int[n];
        StringTokenizer st = new StringTokenizer(br.readLine());
        for (int i = 0; i < n; i++) a[i] = Integer.parseInt(st.nextToken());
        int[] inc = new int[n], dec = new int[n];
        List<Integer> tails = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            int idx = Collections.binarySearch(tails, a[i]);
            if (idx < 0) idx = -(idx + 1);
            if (idx == tails.size()) tails.add(a[i]);
            else tails.set(idx, a[i]);
            inc[i] = idx + 1;
        }
        tails.clear();
        for (int i = n - 1; i >= 0; i--) {
            int idx = Collections.binarySearch(tails, a[i]);
            if (idx < 0) idx = -(idx + 1);
            if (idx == tails.size()) tails.add(a[i]);
            else tails.set(idx, a[i]);
            dec[i] = idx + 1;
        }
        int maxMountain = 0;
        for (int i = 1; i < n - 1; i++) {
            if (inc[i] > 1 && dec[i] > 1) {
                maxMountain = Math.max(maxMountain, inc[i] + dec[i] - 1);
            }
        }
        System.out.println(maxMountain >= 3 ? n - maxMountain : -1);
    }
}""",
        "cpp": """#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;
int main() {
    ios_base::sync_with_stdio(false); cin.tie(NULL);
    int n; if (!(cin >> n)) return 0;
    vector<int> a(n);
    for (int i = 0; i < n; i++) cin >> a[i];
    vector<int> inc(n), dec(n), tails;
    for (int i = 0; i < n; i++) {
        auto it = lower_bound(tails.begin(), tails.end(), a[i]);
        int idx = it - tails.begin();
        if (it == tails.end()) tails.push_back(a[i]);
        else *it = a[i];
        inc[i] = idx + 1;
    }
    tails.clear();
    for (int i = n - 1; i >= 0; i--) {
        auto it = lower_bound(tails.begin(), tails.end(), a[i]);
        int idx = it - tails.begin();
        if (it == tails.end()) tails.push_back(a[i]);
        else *it = a[i];
        dec[i] = idx + 1;
    }
    int maxM = 0;
    for (int i = 1; i < n - 1; i++) {
        if (inc[i] > 1 && dec[i] > 1) maxM = max(maxM, inc[i] + dec[i] - 1);
    }
    cout << (maxM >= 3 ? n - maxM : -1) << "\\n";
    return 0;
}""",
        "python": """import sys, bisect
def solve():
    data = sys.stdin.read().split()
    if not data: return
    n = int(data[0])
    a = [int(x) for x in data[1:1+n]]
    inc, dec = [0]*n, [0]*n
    tails = []
    for i in range(n):
        idx = bisect.bisect_left(tails, a[i])
        if idx == len(tails): tails.append(a[i])
        else: tails[idx] = a[i]
        inc[i] = idx + 1
    tails = []
    for i in range(n - 1, -1, -1):
        idx = bisect.bisect_left(tails, a[i])
        if idx == len(tails): tails.append(a[i])
        else: tails[idx] = a[i]
        dec[i] = idx + 1
    max_m = 0
    for i in range(1, n - 1):
        if inc[i] > 1 and dec[i] > 1:
            max_m = max(max_m, inc[i] + dec[i] - 1)
    print(n - max_m if max_m >= 3 else -1)
if __name__ == '__main__': solve()"""
    }
}
