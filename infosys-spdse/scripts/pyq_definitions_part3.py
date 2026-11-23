# PYQ Solutions Part 3: PYQ-29 to PYQ-42

part3 = {
    "PYQ-29": {
        "idea": "Linear Basis (Gaussian elimination over GF(2)): Insert all array elements into a 64-bit basis. For query X, iterate from MSB down to 0, XORing basis[b] if it increases X.",
        "complexity": "Time Complexity: O(N * 64 + Q * 64). Space Complexity: O(64) basis array.",
        "pitfalls": ["Always greedily set the most significant bit available."],
        "java": """import java.io.*;
import java.util.*;

public class Solution {
    static long[] basis = new long[64];
    static void insert(long mask) {
        for (int i = 62; i >= 0; i--) {
            if ((mask & (1L << i)) == 0) continue;
            if (basis[i] == 0) { basis[i] = mask; return; }
            mask ^= basis[i];
        }
    }
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line = br.readLine();
        if (line == null) return;
        StringTokenizer st = new StringTokenizer(line);
        int n = Integer.parseInt(st.nextToken()), q = Integer.parseInt(st.nextToken());
        st = new StringTokenizer(br.readLine());
        for (int i = 0; i < n; i++) insert(Long.parseLong(st.nextToken()));
        st = new StringTokenizer(br.readLine());
        StringBuilder sb = new StringBuilder();
        for (int j = 0; j < q; j++) {
            long x = Long.parseLong(st.nextToken());
            for (int i = 62; i >= 0; i--) {
                if ((x ^ basis[i]) > x) x ^= basis[i];
            }
            sb.append(x).append("\\n");
        }
        System.out.print(sb);
    }
}""",
        "cpp": """#include <iostream>
#include <vector>
using namespace std;
long long basis[64];
void insert(long long mask) {
    for (int i = 62; i >= 0; i--) {
        if ((mask & (1LL << i)) == 0) continue;
        if (!basis[i]) { basis[i] = mask; return; }
        mask ^= basis[i];
    }
}
int main() {
    ios_base::sync_with_stdio(false); cin.tie(NULL);
    int n, q; if (!(cin >> n >> q)) return 0;
    for (int i = 0; i < n; i++) { long long x; cin >> x; insert(x); }
    for (int j = 0; j < q; j++) {
        long long x; cin >> x;
        for (int i = 62; i >= 0; i--) {
            if ((x ^ basis[i]) > x) x ^= basis[i];
        }
        cout << x << "\\n";
    }
    return 0;
}""",
        "python": """import sys
def solve():
    data = sys.stdin.read().split()
    if not data: return
    n, q = int(data[0]), int(data[1])
    basis = [0]*64
    def insert(mask):
        for i in range(62, -1, -1):
            if (mask & (1 << i)) == 0: continue
            if not basis[i]:
                basis[i] = mask; return
            mask ^= basis[i]
    for i in range(n): insert(int(data[2 + i]))
    idx = 2 + n
    out = []
    for _ in range(q):
        x = int(data[idx]); idx += 1
        for i in range(62, -1, -1):
            if (x ^ basis[i]) > x: x ^= basis[i]
        out.append(str(x))
    print('\\n'.join(out))
if __name__ == '__main__': solve()"""
    },

    "PYQ-30": {
        "idea": "Net sum of demands is zero. The work to transport wine between house i and i+1 is exactly the absolute value of the net balance accumulated up to house i. Total work = sum_{i=0}^{N-1} |prefix[i]|.",
        "complexity": "Time Complexity: O(N) linear pass. Space Complexity: O(1) running accumulator.",
        "pitfalls": ["Cumulative balance requires 64-bit integers.", "Work is absolute value of running prefix."],
        "java": """import java.io.*;
import java.util.*;

public class Solution {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line = br.readLine();
        if (line == null) return;
        int n = Integer.parseInt(line.trim());
        StringTokenizer st = new StringTokenizer(br.readLine());
        long totalWork = 0, runningBalance = 0;
        for (int i = 0; i < n; i++) {
            long w = Long.parseLong(st.nextToken());
            runningBalance += w;
            totalWork += Math.abs(runningBalance);
        }
        System.out.println(totalWork);
    }
}""",
        "cpp": """#include <iostream>
#include <cmath>
using namespace std;
int main() {
    ios_base::sync_with_stdio(false); cin.tie(NULL);
    int n; if (!(cin >> n)) return 0;
    long long totalWork = 0, runningBalance = 0;
    for (int i = 0; i < n; i++) {
        long long w; cin >> w;
        runningBalance += w;
        totalWork += abs(runningBalance);
    }
    cout << totalWork << "\\n";
    return 0;
}""",
        "python": """import sys
def solve():
    data = sys.stdin.read().split()
    if not data: return
    n = int(data[0])
    total_work, running = 0, 0
    for i in range(n):
        running += int(data[1 + i])
        total_work += abs(running)
    print(total_work)
if __name__ == '__main__': solve()"""
    },

    "PYQ-31": {
        "idea": "Longest increasing subsequence with bitwise condition: dp[i] = 1 + max(dp[j]) for j < i with A[j] < A[i] and (A[j] & A[i]) * 2 < (A[j] | A[i]).",
        "complexity": "Time Complexity: O(N^2) dynamic programming. Space Complexity: O(N).",
        "pitfalls": ["Bitwise condition check strictly requires both < and bitwise formula."],
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
        int[] dp = new int[n];
        Arrays.fill(dp, 1);
        int maxLen = 1;
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < i; j++) {
                if (a[j] < a[i] && (a[j] & a[i]) * 2 < (a[j] | a[i])) {
                    dp[i] = Math.max(dp[i], dp[j] + 1);
                }
            }
            maxLen = Math.max(maxLen, dp[i]);
        }
        System.out.println(maxLen);
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
    vector<int> dp(n, 1);
    int maxLen = 1;
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < i; j++) {
            if (a[j] < a[i] && (a[j] & a[i]) * 2 < (a[j] | a[i])) {
                dp[i] = max(dp[i], dp[j] + 1);
            }
        }
        maxLen = max(maxLen, dp[i]);
    }
    cout << maxLen << "\\n";
    return 0;
}""",
        "python": """import sys
def solve():
    data = sys.stdin.read().split()
    if not data: return
    n = int(data[0])
    a = [int(x) for x in data[1:1+n]]
    dp = [1]*n
    for i in range(n):
        for j in range(i):
            if a[j] < a[i] and (a[j] & a[i]) * 2 < (a[j] | a[i]):
                dp[i] = max(dp[i], dp[j] + 1)
    print(max(dp))
if __name__ == '__main__': solve()"""
    },

    "PYQ-32": {
        "idea": "Find smallest base B >= 2 such that N is all 1s (repunit: sum_{i=0}^{k-1} B^i = N). Binary search on base B for each length k from 62 down to 2.",
        "complexity": "Time Complexity: O(log^2 N) binary search across bit lengths. Space Complexity: O(1).",
        "pitfalls": ["Base B=N-1 is always valid for length k=2.", "Overflow when computing B^k."],
        "java": """import java.io.*;
import java.util.*;

public class Solution {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line = br.readLine();
        if (line == null) return;
        long n = Long.parseLong(line.trim());
        for (int k = 62; k >= 3; k--) {
            long low = 2, high = (long) Math.pow(n, 1.0 / (k - 1)) + 1;
            while (low <= high) {
                long mid = low + (high - low) / 2;
                long sum = 0, term = 1;
                boolean overflow = false;
                for (int i = 0; i < k; i++) {
                    sum += term;
                    if (i < k - 1) {
                        if (term > (n - 1) / mid) { overflow = true; break; }
                        term *= mid;
                    }
                }
                if (!overflow && sum == n) {
                    System.out.println(mid);
                    return;
                }
                if (overflow || sum > n) high = mid - 1;
                else low = mid + 1;
            }
        }
        System.out.println(n - 1);
    }
}""",
        "cpp": """#include <iostream>
#include <cmath>
using namespace std;
int main() {
    ios_base::sync_with_stdio(false); cin.tie(NULL);
    long long n; if (!(cin >> n)) return 0;
    for (int k = 62; k >= 3; k--) {
        long long low = 2, high = (long long)(pow(n, 1.0 / (k - 1))) + 1;
        while (low <= high) {
            long long mid = low + (high - low) / 2;
            long long sum = 0, term = 1;
            bool over = false;
            for (int i = 0; i < k; i++) {
                sum += term;
                if (i < k - 1) {
                    if (term > (n - 1) / mid) { over = true; break; }
                    term *= mid;
                }
            }
            if (!over && sum == n) { cout << mid << "\\n"; return 0; }
            if (over || sum > n) high = mid - 1;
            else low = mid + 1;
        }
    }
    cout << (n - 1) << "\\n";
    return 0;
}""",
        "python": """import sys
def solve():
    data = sys.stdin.read().split()
    if not data: return
    n = int(data[0])
    for k in range(62, 2, -1):
        low, high = 2, int(n**(1.0/(k - 1))) + 1
        while low <= high:
            mid = (low + high) // 2
            val = sum(mid**i for i in range(k))
            if val == n:
                print(mid); return
            elif val > n: high = mid - 1
            else: low = mid + 1
    print(n - 1)
if __name__ == '__main__': solve()"""
    },

    "PYQ-33": {
        "idea": "Binary search on minimum elevation threshold D. Use 2D BFS from (0, 0) to check if bottom-right (N-1, M-1) can be reached traversing only cells with elevation <= D.",
        "complexity": "Time Complexity: O(R * C log(MaxElevation)). Space Complexity: O(R * C).",
        "pitfalls": ["Cell (0, 0) elevation must be <= D.", "Queue BFS with visited array."],
        "java": """import java.io.*;
import java.util.*;

public class Solution {
    static int[] dr = {-1, 1, 0, 0}, dc = {0, 0, -1, 1};
    static boolean canReach(int[][] g, int maxElev) {
        int r = g.length, c = g[0].length;
        if (g[0][0] > maxElev || g[r - 1][c - 1] > maxElev) return false;
        boolean[][] vis = new boolean[r][c];
        Queue<int[]> q = new LinkedList<>();
        q.add(new int[]{0, 0}); vis[0][0] = true;
        while (!q.isEmpty()) {
            int[] cur = q.poll();
            if (cur[0] == r - 1 && cur[1] == c - 1) return true;
            for (int d = 0; d < 4; d++) {
                int nr = cur[0] + dr[d], nc = cur[1] + dc[d];
                if (nr >= 0 && nr < r && nc >= 0 && nc < c && !vis[nr][nc] && g[nr][nc] <= maxElev) {
                    vis[nr][nc] = true;
                    q.add(new int[]{nr, nc});
                }
            }
        }
        return false;
    }
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line = br.readLine();
        if (line == null) return;
        StringTokenizer st = new StringTokenizer(line);
        int r = Integer.parseInt(st.nextToken()), c = Integer.parseInt(st.nextToken());
        int[][] g = new int[r][c];
        int low = 0, high = 0;
        for (int i = 0; i < r; i++) {
            st = new StringTokenizer(br.readLine());
            for (int j = 0; j < c; j++) {
                g[i][j] = Integer.parseInt(st.nextToken());
                high = Math.max(high, g[i][j]);
            }
        }
        int ans = high;
        while (low <= high) {
            int mid = low + (high - low) / 2;
            if (canReach(g, mid)) { ans = mid; high = mid - 1; }
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
int dr[] = {-1, 1, 0, 0}, dc[] = {0, 0, -1, 1};
bool canReach(const vector<vector<int>>& g, int maxElev) {
    int r = g.size(), c = g[0].size();
    if (g[0][0] > maxElev || g[r - 1][c - 1] > maxElev) return false;
    vector<vector<bool>> vis(r, vector<bool>(c, false));
    queue<pair<int, int>> q;
    q.push({0, 0}); vis[0][0] = true;
    while (!q.empty()) {
        auto [cr, cc] = q.front(); q.pop();
        if (cr == r - 1 && cc == c - 1) return true;
        for (int d = 0; d < 4; d++) {
            int nr = cr + dr[d], nc = cc + dc[d];
            if (nr >= 0 && nr < r && nc >= 0 && nc < c && !vis[nr][nc] && g[nr][nc] <= maxElev) {
                vis[nr][nc] = true; q.push({nr, nc});
            }
        }
    }
    return false;
}
int main() {
    ios_base::sync_with_stdio(false); cin.tie(NULL);
    int r, c; if (!(cin >> r >> c)) return 0;
    vector<vector<int>> g(r, vector<int>(c));
    int low = 0, high = 0;
    for (int i = 0; i < r; i++) {
        for (int j = 0; j < c; j++) { cin >> g[i][j]; high = max(high, g[i][j]); }
    }
    int ans = high;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (canReach(g, mid)) { ans = mid; high = mid - 1; }
        else low = mid + 1;
    }
    cout << ans << "\\n";
    return 0;
}""",
        "python": """import sys
from collections import deque
def can_reach(g, max_elev):
    r, c = len(g), len(g[0])
    if g[0][0] > max_elev or g[r - 1][c - 1] > max_elev: return False
    vis = [[False]*c for _ in range(r)]
    q = deque([(0, 0)])
    vis[0][0] = True
    dr, dc = [-1, 1, 0, 0], [0, 0, -1, 1]
    while q:
        cr, cc = q.popleft()
        if cr == r - 1 and cc == c - 1: return True
        for d in range(4):
            nr, nc = cr + dr[d], cc + dc[d]
            if 0 <= nr < r and 0 <= nc < c and not vis[nr][nc] and g[nr][nc] <= max_elev:
                vis[nr][nc] = True
                q.append((nr, nc))
    return False

def solve():
    data = sys.stdin.read().split()
    if not data: return
    r, c = int(data[0]), int(data[1])
    g = []
    idx = 2
    for _ in range(r):
        g.append([int(data[idx+j]) for j in range(c)])
        idx += c
    low, high = 0, max(max(row) for row in g)
    ans = high
    while low <= high:
        mid = (low + high) // 2
        if can_reach(g, mid):
            ans = mid; high = mid - 1
        else:
            low = mid + 1
    print(ans)
if __name__ == '__main__': solve()"""
    },

    "PYQ-34": {
        "idea": "Binary search on minimum hamper capacity C. Check if items can be packed into <= K hampers greedily.",
        "complexity": "Time Complexity: O(N log(Sum W)). Space Complexity: O(N).",
        "pitfalls": ["Single item weight > C is invalid.", "Items packed sequentially."],
        "java": """import java.io.*;
import java.util.*;

public class Solution {
    static boolean check(long[] w, int k, long cap) {
        int hampers = 1;
        long cur = 0;
        for (long x : w) {
            if (x > cap) return false;
            if (cur + x > cap) { hampers++; cur = x; }
            else cur += x;
        }
        return hampers <= k;
    }
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line = br.readLine();
        if (line == null) return;
        StringTokenizer st = new StringTokenizer(line);
        int n = Integer.parseInt(st.nextToken()), k = Integer.parseInt(st.nextToken());
        long[] w = new long[n];
        long maxW = 0, sumW = 0;
        st = new StringTokenizer(br.readLine());
        for (int i = 0; i < n; i++) {
            w[i] = Long.parseLong(st.nextToken());
            maxW = Math.max(maxW, w[i]);
            sumW += w[i];
        }
        long low = maxW, high = sumW, ans = sumW;
        while (low <= high) {
            long mid = low + (high - low) / 2;
            if (check(w, k, mid)) { ans = mid; high = mid - 1; }
            else low = mid + 1;
        }
        System.out.println(ans);
    }
}""",
        "cpp": """#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;
bool check(const vector<long long>& w, int k, long long cap) {
    int hampers = 1; long long cur = 0;
    for (long long x : w) {
        if (x > cap) return false;
        if (cur + x > cap) { hampers++; cur = x; }
        else cur += x;
    }
    return hampers <= k;
}
int main() {
    ios_base::sync_with_stdio(false); cin.tie(NULL);
    int n, k; if (!(cin >> n >> k)) return 0;
    vector<long long> w(n);
    long long maxW = 0, sumW = 0;
    for (int i = 0; i < n; i++) { cin >> w[i]; maxW = max(maxW, w[i]); sumW += w[i]; }
    long long low = maxW, high = sumW, ans = sumW;
    while (low <= high) {
        long long mid = low + (high - low) / 2;
        if (check(w, k, mid)) { ans = mid; high = mid - 1; }
        else low = mid + 1;
    }
    cout << ans << "\\n";
    return 0;
}""",
        "python": """import sys
def check(w, k, cap):
    hampers, cur = 1, 0
    for x in w:
        if x > cap: return False
        if cur + x > cap: hampers += 1; cur = x
        else: cur += x
    return hampers <= k

def solve():
    data = sys.stdin.read().split()
    if not data: return
    n, k = int(data[0]), int(data[1])
    w = [int(x) for x in data[2:2+n]]
    low, high, ans = max(w), sum(w), sum(w)
    while low <= high:
        mid = (low + high) // 2
        if check(w, k, mid):
            ans = mid; high = mid - 1
        else:
            low = mid + 1
    print(ans)
if __name__ == '__main__': solve()"""
    },

    "PYQ-35": {
        "idea": "Two conveyor belts of length M. DP state: dp0[i] = min cost to reach cell i on belt 0, dp1[i] = min cost to reach cell i on belt 1. Switching between belts incurs cost S.",
        "complexity": "Time Complexity: O(M) linear time. Space Complexity: O(1) rolling states.",
        "pitfalls": ["Switching can happen at any step.", "Both starting on belt 0 and belt 1 are valid."],
        "java": """import java.io.*;
import java.util.*;

public class Solution {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line = br.readLine();
        if (line == null) return;
        StringTokenizer st = new StringTokenizer(line);
        int m = Integer.parseInt(st.nextToken());
        long s = Long.parseLong(st.nextToken());
        long[] c0 = new long[m], c1 = new long[m];
        st = new StringTokenizer(br.readLine());
        for (int i = 0; i < m; i++) c0[i] = Long.parseLong(st.nextToken());
        st = new StringTokenizer(br.readLine());
        for (int i = 0; i < m; i++) c1[i] = Long.parseLong(st.nextToken());
        long dp0 = c0[0], dp1 = c1[0];
        for (int i = 1; i < m; i++) {
            long n0 = c0[i] + Math.min(dp0, dp1 + s);
            long n1 = c1[i] + Math.min(dp1, dp0 + s);
            dp0 = n0; dp1 = n1;
        }
        System.out.println(Math.min(dp0, dp1));
    }
}""",
        "cpp": """#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;
int main() {
    ios_base::sync_with_stdio(false); cin.tie(NULL);
    int m; long long s; if (!(cin >> m >> s)) return 0;
    vector<long long> c0(m), c1(m);
    for (int i = 0; i < m; i++) cin >> c0[i];
    for (int i = 0; i < m; i++) cin >> c1[i];
    long long dp0 = c0[0], dp1 = c1[0];
    for (int i = 1; i < m; i++) {
        long long n0 = c0[i] + min(dp0, dp1 + s);
        long long n1 = c1[i] + min(dp1, dp0 + s);
        dp0 = n0; dp1 = n1;
    }
    cout << min(dp0, dp1) << "\\n";
    return 0;
}""",
        "python": """import sys
def solve():
    data = sys.stdin.read().split()
    if not data: return
    m, s = int(data[0]), int(data[1])
    c0 = [int(x) for x in data[2:2+m]]
    c1 = [int(x) for x in data[2+m:2+2*m]]
    dp0, dp1 = c0[0], c1[0]
    for i in range(1, m):
        n0 = c0[i] + min(dp0, dp1 + s)
        n1 = c1[i] + min(dp1, dp0 + s)
        dp0, dp1 = n0, n1
    print(min(dp0, dp1))
if __name__ == '__main__': solve()"""
    },

    "PYQ-36": {
        "idea": "Connected components via BFS/DSU. If server cost <= road cost, build a server in all N cities. Otherwise, for each connected component with V cities, build 1 server and V-1 roads.",
        "complexity": "Time Complexity: O(N + M) graph traversal. Space Complexity: O(N + M).",
        "pitfalls": ["Disconnected cities each require a server."],
        "java": """import java.io.*;
import java.util.*;

public class Solution {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line = br.readLine();
        if (line == null) return;
        StringTokenizer st = new StringTokenizer(line);
        int n = Integer.parseInt(st.nextToken()), m = Integer.parseInt(st.nextToken());
        long cServer = Long.parseLong(st.nextToken()), cRoad = Long.parseLong(st.nextToken());
        if (cServer <= cRoad) {
            System.out.println(1L * n * cServer);
            return;
        }
        List<Integer>[] adj = new ArrayList[n + 1];
        for (int i = 1; i <= n; i++) adj[i] = new ArrayList<>();
        for (int i = 0; i < m; i++) {
            st = new StringTokenizer(br.readLine());
            int u = Integer.parseInt(st.nextToken()), v = Integer.parseInt(st.nextToken());
            adj[u].add(v); adj[v].add(u);
        }
        boolean[] vis = new boolean[n + 1];
        long totalCost = 0;
        for (int i = 1; i <= n; i++) {
            if (!vis[i]) {
                int compSize = 0;
                Queue<Integer> q = new LinkedList<>();
                q.add(i); vis[i] = true;
                while (!q.isEmpty()) {
                    int u = q.poll(); compSize++;
                    for (int v : adj[u]) {
                        if (!vis[v]) { vis[v] = true; q.add(v); }
                    }
                }
                totalCost += cServer + 1L * (compSize - 1) * cRoad;
            }
        }
        System.out.println(totalCost);
    }
}""",
        "cpp": """#include <iostream>
#include <vector>
#include <queue>
using namespace std;
int main() {
    ios_base::sync_with_stdio(false); cin.tie(NULL);
    int n, m; long long cServer, cRoad;
    if (!(cin >> n >> m >> cServer >> cRoad)) return 0;
    if (cServer <= cRoad) { cout << 1LL * n * cServer << "\\n"; return 0; }
    vector<vector<int>> adj(n + 1);
    for (int i = 0; i < m; i++) {
        int u, v; cin >> u >> v; adj[u].push_back(v); adj[v].push_back(u);
    }
    vector<bool> vis(n + 1, false);
    long long total = 0;
    for (int i = 1; i <= n; i++) {
        if (!vis[i]) {
            int comp = 0; queue<int> q; q.push(i); vis[i] = true;
            while (!q.empty()) {
                int u = q.front(); q.pop(); comp++;
                for (int v : adj[u]) if (!vis[v]) { vis[v] = true; q.push(v); }
            }
            total += cServer + 1LL * (comp - 1) * cRoad;
        }
    }
    cout << total << "\\n";
    return 0;
}""",
        "python": """import sys
from collections import deque
def solve():
    data = sys.stdin.read().split()
    if not data: return
    n, m = int(data[0]), int(data[1])
    c_server, c_road = int(data[2]), int(data[3])
    if c_server <= c_road:
        print(n * c_server); return
    adj = [[] for _ in range(n + 1)]
    idx = 4
    for _ in range(m):
        u, v = int(data[idx]), int(data[idx+1])
        adj[u].append(v); adj[v].append(u)
        idx += 2
    vis = [False]*(n + 1)
    total = 0
    for i in range(1, n + 1):
        if not vis[i]:
            comp = 0; q = deque([i]); vis[i] = True
            while q:
                u = q.popleft(); comp += 1
                for v in adj[u]:
                    if not vis[v]: vis[v] = True; q.append(v)
            total += c_server + (comp - 1) * c_road
    print(total)
if __name__ == '__main__': solve()"""
    },

    "PYQ-37": {
        "idea": "Minimum insertions to make a palindrome = length(S) - Longest Palindromic Subsequence(S), which equals length(S) - LCS(S, reverse(S)).",
        "complexity": "Time Complexity: O(N^2) LCS. Space Complexity: O(N) rolling array.",
        "pitfalls": ["String can contain up to 2000 chars."],
        "java": """import java.io.*;
import java.util.*;

public class Solution {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String s = br.readLine();
        if (s == null) return;
        s = s.trim();
        int n = s.length();
        String rev = new StringBuilder(s).reverse().toString();
        int[] dp = new int[n + 1];
        for (int i = 1; i <= n; i++) {
            int[] nextDp = new int[n + 1];
            for (int j = 1; j <= n; j++) {
                if (s.charAt(i - 1) == rev.charAt(j - 1)) nextDp[j] = dp[j - 1] + 1;
                else nextDp[j] = Math.max(dp[j], nextDp[j - 1]);
            }
            dp = nextDp;
        }
        System.out.println(n - dp[n]);
    }
}""",
        "cpp": """#include <iostream>
#include <string>
#include <vector>
#include <algorithm>
using namespace std;
int main() {
    ios_base::sync_with_stdio(false); cin.tie(NULL);
    string s; if (!(cin >> s)) return 0;
    int n = s.size();
    string rev = s; reverse(rev.begin(), rev.end());
    vector<int> dp(n + 1, 0);
    for (int i = 1; i <= n; i++) {
        vector<int> nextDp(n + 1, 0);
        for (int j = 1; j <= n; j++) {
            if (s[i - 1] == rev[j - 1]) nextDp[j] = dp[j - 1] + 1;
            else nextDp[j] = max(dp[j], nextDp[j - 1]);
        }
        dp = nextDp;
    }
    cout << n - dp[n] << "\\n";
    return 0;
}""",
        "python": """import sys
def solve():
    s = sys.stdin.read().strip()
    if not s: return
    n = len(s)
    rev = s[::-1]
    dp = [0]*(n + 1)
    for i in range(1, n + 1):
        next_dp = [0]*(n + 1)
        for j in range(1, n + 1):
            if s[i - 1] == rev[j - 1]: next_dp[j] = dp[j - 1] + 1
            else: next_dp[j] = max(dp[j], next_dp[j - 1])
        dp = next_dp
    print(n - dp[n])
if __name__ == '__main__': solve()"""
    },

    "PYQ-38": {
        "idea": "Count contiguous subarrays with sum divisible by K. Track prefix sum modulo K. Use remainder frequency array remCount[K]. If prefix sum % K == r, it forms remCount[r] valid subarrays.",
        "complexity": "Time Complexity: O(N) single linear pass. Space Complexity: O(K) frequency table.",
        "pitfalls": ["In C++/Java, negative prefix sums require (prefix % K + K) % K to avoid negative array indices.", "Initial remCount[0] = 1."],
        "java": """import java.io.*;
import java.util.*;

public class Solution {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line = br.readLine();
        if (line == null) return;
        StringTokenizer st = new StringTokenizer(line);
        int n = Integer.parseInt(st.nextToken()), k = Integer.parseInt(st.nextToken());
        long[] countRem = new long[k];
        countRem[0] = 1;
        long prefix = 0, total = 0;
        st = new StringTokenizer(br.readLine());
        for (int i = 0; i < n; i++) {
            long x = Long.parseLong(st.nextToken());
            prefix = ((prefix + x) % k + k) % k;
            total += countRem[(int) prefix];
            countRem[(int) prefix]++;
        }
        System.out.println(total);
    }
}""",
        "cpp": """#include <iostream>
#include <vector>
using namespace std;
int main() {
    ios_base::sync_with_stdio(false); cin.tie(NULL);
    int n, k; if (!(cin >> n >> k)) return 0;
    vector<long long> countRem(k, 0);
    countRem[0] = 1;
    long long prefix = 0, total = 0;
    for (int i = 0; i < n; i++) {
        long long x; cin >> x;
        prefix = ((prefix + x) % k + k) % k;
        total += countRem[prefix];
        countRem[prefix]++;
    }
    cout << total << "\\n";
    return 0;
}""",
        "python": """import sys
def solve():
    data = sys.stdin.read().split()
    if not data: return
    n, k = int(data[0]), int(data[1])
    count_rem = [0]*k
    count_rem[0] = 1
    prefix, total = 0, 0
    for i in range(n):
        prefix = (prefix + int(data[2 + i])) % k
        total += count_rem[prefix]
        count_rem[prefix] += 1
    print(total)
if __name__ == '__main__': solve()"""
    },

    "PYQ-39": {
        "idea": "Tree paths with GCD > 1. Find prime factors of each node value. For each prime p, form components of nodes where p divides V[i]. For a component of size S, it contributes S*(S-1)/2 paths.",
        "complexity": "Time Complexity: O(N * sqrt(MaxV)). Space Complexity: O(N).",
        "pitfalls": ["Single node path GCD is V[i] (if counting pairs u != v).", "Must count pairs, not directed paths."],
        "java": """import java.io.*;
import java.util.*;

public class Solution {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line = br.readLine();
        if (line == null) return;
        int n = Integer.parseInt(line.trim());
        int[] v = new int[n + 1];
        StringTokenizer st = new StringTokenizer(br.readLine());
        for (int i = 1; i <= n; i++) v[i] = Integer.parseInt(st.nextToken());
        List<Integer>[] adj = new ArrayList[n + 1];
        for (int i = 1; i <= n; i++) adj[i] = new ArrayList<>();
        for (int i = 0; i < n - 1; i++) {
            st = new StringTokenizer(br.readLine());
            int a = Integer.parseInt(st.nextToken()), b = Integer.parseInt(st.nextToken());
            adj[a].add(b); adj[b].add(a);
        }
        Map<Integer, List<Integer>> primeToNodes = new HashMap<>();
        for (int i = 1; i <= n; i++) {
            int val = v[i];
            for (int d = 2; d * d <= val; d++) {
                if (val % d == 0) {
                    primeToNodes.computeIfAbsent(d, k -> new ArrayList<>()).add(i);
                    while (val % d == 0) val /= d;
                }
            }
            if (val > 1) primeToNodes.computeIfAbsent(val, k -> new ArrayList<>()).add(i);
        }
        long totalPaths = 0;
        Set<Integer> active = new HashSet<>();
        for (List<Integer> nodes : primeToNodes.values()) {
            active.clear();
            active.addAll(nodes);
            Set<Integer> vis = new HashSet<>();
            for (int u : nodes) {
                if (!vis.contains(u)) {
                    int comp = 0;
                    Queue<Integer> q = new LinkedList<>();
                    q.add(u); vis.add(u);
                    while (!q.isEmpty()) {
                        int cur = q.poll(); comp++;
                        for (int nxt : adj[cur]) {
                            if (active.contains(nxt) && !vis.contains(nxt)) {
                                vis.add(nxt); q.add(nxt);
                            }
                        }
                    }
                    totalPaths += 1L * comp * (comp - 1) / 2;
                }
            }
        }
        System.out.println(totalPaths);
    }
}""",
        "cpp": """#include <iostream>
#include <vector>
#include <unordered_map>
#include <unordered_set>
#include <queue>
using namespace std;
int main() {
    ios_base::sync_with_stdio(false); cin.tie(NULL);
    int n; if (!(cin >> n)) return 0;
    vector<int> v(n + 1);
    for (int i = 1; i <= n; i++) cin >> v[i];
    vector<vector<int>> adj(n + 1);
    for (int i = 0; i < n - 1; i++) {
        int a, b; cin >> a >> b; adj[a].push_back(b); adj[b].push_back(a);
    }
    unordered_map<int, vector<int>> pNodes;
    for (int i = 1; i <= n; i++) {
        int val = v[i];
        for (int d = 2; d * d <= val; d++) {
            if (val % d == 0) {
                pNodes[d].push_back(i);
                while (val % d == 0) val /= d;
            }
        }
        if (val > 1) pNodes[val].push_back(i);
    }
    long long total = 0;
    for (const auto& [p, nodes] : pNodes) {
        unordered_set<int> active(nodes.begin(), nodes.end()), vis;
        for (int u : nodes) {
            if (!vis.count(u)) {
                int comp = 0; queue<int> q; q.push(u); vis.insert(u);
                while (!q.empty()) {
                    int cur = q.front(); q.pop(); comp++;
                    for (int nxt : adj[cur]) {
                        if (active.count(nxt) && !vis.count(nxt)) {
                            vis.insert(nxt); q.push(nxt);
                        }
                    }
                }
                total += 1LL * comp * (comp - 1) / 2;
            }
        }
    }
    cout << total << "\\n";
    return 0;
}""",
        "python": """import sys
from collections import defaultdict, deque
def solve():
    data = sys.stdin.read().split()
    if not data: return
    n = int(data[0])
    v = [0] + [int(x) for x in data[1:1+n]]
    adj = [[] for _ in range(n + 1)]
    idx = 1 + n
    for _ in range(n - 1):
        a, b = int(data[idx]), int(data[idx+1])
        adj[a].append(b); adj[b].append(a)
        idx += 2
    p_nodes = defaultdict(list)
    for i in range(1, n + 1):
        val = v[i]
        d = 2
        while d * d <= val:
            if val % d == 0:
                p_nodes[d].append(i)
                while val % d == 0: val //= d
            d += 1
        if val > 1: p_nodes[val].append(i)
    total = 0
    for nodes in p_nodes.values():
        active = set(nodes)
        vis = set()
        for u in nodes:
            if u not in vis:
                comp = 0; q = deque([u]); vis.add(u)
                while q:
                    cur = q.popleft(); comp += 1
                    for nxt in adj[cur]:
                        if nxt in active and nxt not in vis:
                            vis.add(nxt); q.append(nxt)
                total += comp * (comp - 1) // 2
    print(total)
if __name__ == '__main__': solve()"""
    },

    "PYQ-40": {
        "idea": "Precompute prefixMax[i] = max(A[0...i]) and suffixMin[i] = min(A[i...N-1]). Index i is a stress point iff prefixMax[i-1] < A[i] < suffixMin[i+1].",
        "complexity": "Time Complexity: O(N) three linear passes. Space Complexity: O(N).",
        "pitfalls": ["Boundary elements 0 and N-1 check left or right respectively.", "Strict inequalities required."],
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
        long[] pMax = new long[n], sMin = new long[n];
        pMax[0] = a[0];
        for (int i = 1; i < n; i++) pMax[i] = Math.max(pMax[i - 1], a[i]);
        sMin[n - 1] = a[n - 1];
        for (int i = n - 2; i >= 0; i--) sMin[i] = Math.min(sMin[i + 1], a[i]);
        int count = 0;
        for (int i = 0; i < n; i++) {
            boolean leftOk = (i == 0 || pMax[i - 1] < a[i]);
            boolean rightOk = (i == n - 1 || a[i] < sMin[i + 1]);
            if (leftOk && rightOk) count++;
        }
        System.out.println(count);
    }
}""",
        "cpp": """#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;
int main() {
    ios_base::sync_with_stdio(false); cin.tie(NULL);
    int n; if (!(cin >> n)) return 0;
    vector<long long> a(n), pMax(n), sMin(n);
    for (int i = 0; i < n; i++) cin >> a[i];
    pMax[0] = a[0];
    for (int i = 1; i < n; i++) pMax[i] = max(pMax[i - 1], a[i]);
    sMin[n - 1] = a[n - 1];
    for (int i = n - 2; i >= 0; i--) sMin[i] = min(sMin[i + 1], a[i]);
    int count = 0;
    for (int i = 0; i < n; i++) {
        if ((i == 0 || pMax[i - 1] < a[i]) && (i == n - 1 || a[i] < sMin[i + 1])) count++;
    }
    cout << count << "\\n";
    return 0;
}""",
        "python": """import sys
def solve():
    data = sys.stdin.read().split()
    if not data: return
    n = int(data[0])
    a = [int(x) for x in data[1:1+n]]
    p_max = [0]*n
    p_max[0] = a[0]
    for i in range(1, n): p_max[i] = max(p_max[i - 1], a[i])
    s_min = [0]*n
    s_min[-1] = a[-1]
    for i in range(n - 2, -1, -1): s_min[i] = min(s_min[i + 1], a[i])
    count = sum(1 for i in range(n) if (i == 0 or p_max[i - 1] < a[i]) and (i == n - 1 or a[i] < s_min[i + 1]))
    print(count)
if __name__ == '__main__': solve()"""
    },

    "PYQ-41": {
        "idea": "Group elements by distinct temperature values. Sort unique values descending. To reduce all elements to the minimum temperature, each unique temperature at rank k from bottom requires k reductions per occurrence.",
        "complexity": "Time Complexity: O(N log N) sorting unique values. Space Complexity: O(N).",
        "pitfalls": ["Minimum temperature requires 0 reductions.", "Frequency can be large."],
        "java": """import java.io.*;
import java.util.*;

public class Solution {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line = br.readLine();
        if (line == null) return;
        int n = Integer.parseInt(line.trim());
        Map<Long, Integer> freq = new HashMap<>();
        StringTokenizer st = new StringTokenizer(br.readLine());
        for (int i = 0; i < n; i++) {
            long t = Long.parseLong(st.nextToken());
            freq.put(t, freq.getOrDefault(t, 0) + 1);
        }
        List<Long> sortedVals = new ArrayList<>(freq.keySet());
        Collections.sort(sortedVals); // ascending
        long totalSteps = 0;
        for (int rank = 0; rank < sortedVals.size(); rank++) {
            totalSteps += 1L * rank * freq.get(sortedVals.get(rank));
        }
        System.out.println(totalSteps);
    }
}""",
        "cpp": """#include <iostream>
#include <map>
using namespace std;
int main() {
    ios_base::sync_with_stdio(false); cin.tie(NULL);
    int n; if (!(cin >> n)) return 0;
    map<long long, int> freq;
    for (int i = 0; i < n; i++) { long long x; cin >> x; freq[x]++; }
    long long totalSteps = 0;
    int rank = 0;
    for (const auto& [val, count] : freq) {
        totalSteps += 1LL * rank * count;
        rank++;
    }
    cout << totalSteps << "\\n";
    return 0;
}""",
        "python": """import sys
from collections import Counter
def solve():
    data = sys.stdin.read().split()
    if not data: return
    n = int(data[0])
    counts = Counter(int(x) for x in data[1:1+n])
    sorted_vals = sorted(counts.keys())
    total_steps = sum(rank * counts[val] for rank, val in enumerate(sorted_vals))
    print(total_steps)
if __name__ == '__main__': solve()"""
    },

    "PYQ-42": {
        "idea": "Count initial mismatched bit positions where A[i] != B[i] (say M). Each flip operation fixes one mismatch. Minimum remaining mismatches after K flips is max(0, M - K).",
        "complexity": "Time Complexity: O(N) single linear pass. Space Complexity: O(1).",
        "pitfalls": ["If K >= M, remaining mismatches is 0."],
        "java": """import java.io.*;
import java.util.*;

public class Solution {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line = br.readLine();
        if (line == null) return;
        StringTokenizer st = new StringTokenizer(line);
        int n = Integer.parseInt(st.nextToken()), k = Integer.parseInt(st.nextToken());
        String a = br.readLine().trim(), b = br.readLine().trim();
        int mismatches = 0;
        for (int i = 0; i < n; i++) {
            if (a.charAt(i) != b.charAt(i)) mismatches++;
        }
        System.out.println(Math.max(0, mismatches - k));
    }
}""",
        "cpp": """#include <iostream>
#include <string>
#include <algorithm>
using namespace std;
int main() {
    ios_base::sync_with_stdio(false); cin.tie(NULL);
    int n, k; if (!(cin >> n >> k)) return 0;
    string a, b; cin >> a >> b;
    int mismatches = 0;
    for (int i = 0; i < n; i++) if (a[i] != b[i]) mismatches++;
    cout << max(0, mismatches - k) << "\\n";
    return 0;
}""",
        "python": """import sys
def solve():
    data = sys.stdin.read().split()
    if not data: return
    n, k = int(data[0]), int(data[1])
    a, b = data[2], data[3]
    mismatches = sum(1 for i in range(n) if a[i] != b[i])
    print(max(0, mismatches - k))
if __name__ == '__main__': solve()"""
    }
}
