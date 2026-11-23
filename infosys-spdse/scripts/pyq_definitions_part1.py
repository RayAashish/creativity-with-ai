# PYQ Solutions Part 1: PYQ-01 to PYQ-14

part1 = {
    "PYQ-01": {
        "idea": "Sort monsters by threshold power ascending. Defeat the weakest monster first to collect its bonus energy, maximizing experience to defeat subsequent monsters.",
        "complexity": "Time Complexity: O(N log N) sorting. Space Complexity: O(N) auxiliary.",
        "pitfalls": ["Energy accumulation can exceed 2*10^9, require 64-bit integers.", "Sorting by bonus instead of requirement yields suboptimal defeat order."],
        "java": """import java.io.*;
import java.util.*;

public class Solution {
    static class Monster {
        long power, bonus;
        Monster(long p, long b) { this.power = p; this.bonus = b; }
    }
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line = br.readLine();
        if (line == null || line.trim().isEmpty()) return;
        StringTokenizer st = new StringTokenizer(line);
        int n = Integer.parseInt(st.nextToken());
        long energy = Long.parseLong(st.nextToken());
        Monster[] monsters = new Monster[n];
        st = new StringTokenizer(br.readLine());
        for (int i = 0; i < n; i++) monsters[i] = new Monster(Long.parseLong(st.nextToken()), 0);
        st = new StringTokenizer(br.readLine());
        for (int i = 0; i < n; i++) monsters[i].bonus = Long.parseLong(st.nextToken());
        Arrays.sort(monsters, (m1, m2) -> Long.compare(m1.power, m2.power));
        int count = 0;
        for (Monster m : monsters) {
            if (energy >= m.power) { energy += m.bonus; count++; }
            else break;
        }
        System.out.println(count);
    }
}""",
        "cpp": """#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;
struct Monster { long long power, bonus; };
int main() {
    ios_base::sync_with_stdio(false); cin.tie(NULL);
    int n; long long energy;
    if (!(cin >> n >> energy)) return 0;
    vector<Monster> m(n);
    for (int i = 0; i < n; i++) cin >> m[i].power;
    for (int i = 0; i < n; i++) cin >> m[i].bonus;
    sort(m.begin(), m.end(), [](const Monster& a, const Monster& b) { return a.power < b.power; });
    int count = 0;
    for (const auto& it : m) {
        if (energy >= it.power) { energy += it.bonus; count++; }
        else break;
    }
    cout << count << "\\n";
    return 0;
}""",
        "python": """import sys
def solve():
    data = sys.stdin.read().split()
    if not data: return
    n, energy = int(data[0]), int(data[1])
    powers = [int(x) for x in data[2:2+n]]
    bonuses = [int(x) for x in data[2+n:2+2*n]]
    monsters = sorted(zip(powers, bonuses), key=lambda x: x[0])
    count = 0
    for p, b in monsters:
        if energy >= p:
            energy += b
            count += 1
        else:
            break
    print(count)
if __name__ == '__main__': solve()"""
    },

    "PYQ-02": {
        "idea": "Binary search on the minimum prefix K of villains to remove (0 to N). For candidate K, simulate heroes facing villains V[K...N-1]. Each hero battles sequentially until their health H is depleted. Return the minimum K requiring <= M heroes.",
        "complexity": "Time Complexity: O(N log N) binary search with linear simulation. Space Complexity: O(N).",
        "pitfalls": ["Villains must be fought in exact queue order.", "When a hero dies mid-villain, the villain retains full health against next hero per problem rules."],
        "java": """import java.io.*;
import java.util.*;

public class Solution {
    static boolean canDefeat(long[] v, int start, int m, long h) {
        int n = v.length, heroes = 1;
        long cur = h;
        for (int i = start; i < n; i++) {
            long villain = v[i];
            while (villain > 0) {
                if (cur > villain) { cur -= villain; villain = 0; }
                else if (cur == villain) {
                    villain = 0;
                    if (i + 1 < n) { heroes++; cur = h; }
                } else {
                    heroes++; cur = h;
                }
                if (heroes > m) return false;
            }
        }
        return heroes <= m;
    }
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line = br.readLine();
        if (line == null) return;
        StringTokenizer st = new StringTokenizer(line);
        int n = Integer.parseInt(st.nextToken()), m = Integer.parseInt(st.nextToken());
        long h = Long.parseLong(st.nextToken());
        long[] v = new long[n];
        st = new StringTokenizer(br.readLine());
        for (int i = 0; i < n; i++) v[i] = Long.parseLong(st.nextToken());
        int low = 0, high = n, ans = n;
        while (low <= high) {
            int mid = low + (high - low) / 2;
            if (canDefeat(v, mid, m, h)) { ans = mid; high = mid - 1; }
            else low = mid + 1;
        }
        System.out.println(ans);
    }
}""",
        "cpp": """#include <iostream>
#include <vector>
using namespace std;
bool canDefeat(const vector<long long>& v, int start, int m, long long h) {
    int n = v.size(), heroes = 1;
    long long cur = h;
    for (int i = start; i < n; i++) {
        long long vil = v[i];
        while (vil > 0) {
            if (cur > vil) { cur -= vil; vil = 0; }
            else if (cur == vil) {
                vil = 0;
                if (i + 1 < n) { heroes++; cur = h; }
            } else {
                heroes++; cur = h;
            }
            if (heroes > m) return false;
        }
    }
    return heroes <= m;
}
int main() {
    ios_base::sync_with_stdio(false); cin.tie(NULL);
    int n, m; long long h;
    if (!(cin >> n >> m >> h)) return 0;
    vector<long long> v(n);
    for (int i = 0; i < n; i++) cin >> v[i];
    int low = 0, high = n, ans = n;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (canDefeat(v, mid, m, h)) { ans = mid; high = mid - 1; }
        else low = mid + 1;
    }
    cout << ans << "\\n";
    return 0;
}""",
        "python": """import sys
def can_defeat(v, start, m, h):
    n, heroes, cur = len(v), 1, h
    for i in range(start, n):
        vil = v[i]
        while vil > 0:
            if cur > vil:
                cur -= vil
                vil = 0
            elif cur == vil:
                vil = 0
                if i + 1 < n:
                    heroes += 1
                    cur = h
            else:
                heroes += 1
                cur = h
            if heroes > m:
                return False
    return heroes <= m

def solve():
    data = sys.stdin.read().split()
    if not data: return
    n, m, h = int(data[0]), int(data[1]), int(data[2])
    v = [int(x) for x in data[3:3+n]]
    low, high, ans = 0, n, n
    while low <= high:
        mid = (low + high) // 2
        if can_defeat(v, mid, m, h):
            ans = mid
            high = mid - 1
        else:
            low = mid + 1
    print(ans)
if __name__ == '__main__': solve()"""
    },

    "PYQ-03": {
        "idea": "2D DP with 5 vowels and 3 states (start, UP, DOWN). Transition between allowed vowels while strictly alternating between UP and DOWN directions. Compute modulo 10^9+7.",
        "complexity": "Time Complexity: O(N) linear time. Space Complexity: O(1) rolling table.",
        "pitfalls": ["Modulo operations needed at each addition.", "First step can be either UP or DOWN."],
        "java": """import java.io.*;
import java.util.*;

public class Solution {
    static final int MOD = 1_000_000_007;
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line = br.readLine();
        if (line == null) return;
        int n = Integer.parseInt(line.trim());
        if (n <= 0) { System.out.println(0); return; }
        if (n == 1) { System.out.println(5); return; }
        int[][] adj = {{1}, {0, 2}, {0, 1, 3, 4}, {2, 4}, {0}};
        long[][] dp = new long[5][3];
        for (int v = 0; v < 5; v++) dp[v][0] = 1;
        for (int step = 2; step <= n; step++) {
            long[][] nextDp = new long[5][3];
            for (int u = 0; u < 5; u++) {
                for (int v : adj[u]) {
                    int dir = (v > u) ? 1 : 2;
                    if (step == 2) nextDp[v][dir] = (nextDp[v][dir] + dp[u][0]) % MOD;
                    else {
                        int req = (dir == 1) ? 2 : 1;
                        nextDp[v][dir] = (nextDp[v][dir] + dp[u][req]) % MOD;
                    }
                }
            }
            dp = nextDp;
        }
        long ans = 0;
        for (int v = 0; v < 5; v++) ans = (ans + dp[v][1] + dp[v][2]) % MOD;
        System.out.println(ans);
    }
}""",
        "cpp": """#include <iostream>
#include <vector>
using namespace std;
const int MOD = 1000000007;
int main() {
    ios_base::sync_with_stdio(false); cin.tie(NULL);
    int n; if (!(cin >> n)) return 0;
    if (n <= 0) { cout << 0 << "\\n"; return 0; }
    if (n == 1) { cout << 5 << "\\n"; return 0; }
    vector<vector<int>> adj = {{1}, {0, 2}, {0, 1, 3, 4}, {2, 4}, {0}};
    vector<vector<long long>> dp(5, vector<long long>(3, 0));
    for (int v = 0; v < 5; v++) dp[v][0] = 1;
    for (int step = 2; step <= n; step++) {
        vector<vector<long long>> nextDp(5, vector<long long>(3, 0));
        for (int u = 0; u < 5; u++) {
            for (int v : adj[u]) {
                int dir = (v > u) ? 1 : 2;
                if (step == 2) nextDp[v][dir] = (nextDp[v][dir] + dp[u][0]) % MOD;
                else {
                    int req = (dir == 1) ? 2 : 1;
                    nextDp[v][dir] = (nextDp[v][dir] + dp[u][req]) % MOD;
                }
            }
        }
        dp = nextDp;
    }
    long long ans = 0;
    for (int v = 0; v < 5; v++) ans = (ans + dp[v][1] + dp[v][2]) % MOD;
    cout << ans << "\\n";
    return 0;
}""",
        "python": """import sys
def solve():
    data = sys.stdin.read().split()
    if not data: return
    n, MOD = int(data[0]), 10**9 + 7
    if n <= 0: print(0); return
    if n == 1: print(5); return
    adj = {0: [1], 1: [0, 2], 2: [0, 1, 3, 4], 3: [2, 4], 4: [0]}
    dp = [[1, 0, 0] for _ in range(5)]
    for step in range(2, n + 1):
        next_dp = [[0]*3 for _ in range(5)]
        for u in range(5):
            for v in adj[u]:
                d = 1 if v > u else 2
                if step == 2: next_dp[v][d] = (next_dp[v][d] + dp[u][0]) % MOD
                else:
                    req = 2 if d == 1 else 1
                    next_dp[v][d] = (next_dp[v][d] + dp[u][req]) % MOD
        dp = next_dp
    print(sum(dp[v][1] + dp[v][2] for v in range(5)) % MOD)
if __name__ == '__main__': solve()"""
    },

    "PYQ-04": {
        "idea": "Multi-stage BFS: Compute shortest distance and unique path counts from start X to key K, then from key K to door O. The total shortest paths modulo 10^9+7 is (ways X->K) * (ways K->O) % MOD.",
        "complexity": "Time Complexity: O(R * C) grid BFS. Space Complexity: O(R * C) distance and path-count tables.",
        "pitfalls": ["Door must not be traversed before collecting key.", "Obstacle cells '#' must be ignored."],
        "java": """import java.io.*;
import java.util.*;

public class Solution {
    static final int MOD = 1_000_000_007;
    static int[] dr = {-1, 1, 0, 0}, dc = {0, 0, -1, 1};
    static long countPaths(char[][] g, int sr, int sc, int er, int ec) {
        int r = g.length, c = g[0].length;
        int[][] dist = new int[r][c];
        long[][] ways = new long[r][c];
        for (int[] row : dist) Arrays.fill(row, -1);
        Queue<int[]> q = new LinkedList<>();
        q.add(new int[]{sr, sc}); dist[sr][sc] = 0; ways[sr][sc] = 1;
        while (!q.isEmpty()) {
            int[] cur = q.poll();
            int cr = cur[0], cc = cur[1];
            for (int d = 0; d < 4; d++) {
                int nr = cr + dr[d], nc = cc + dc[d];
                if (nr >= 0 && nr < r && nc >= 0 && nc < c && g[nr][nc] != '#') {
                    if (dist[nr][nc] == -1) {
                        dist[nr][nc] = dist[cr][cc] + 1;
                        ways[nr][nc] = ways[cr][cc];
                        q.add(new int[]{nr, nc});
                    } else if (dist[nr][nc] == dist[cr][cc] + 1) {
                        ways[nr][nc] = (ways[nr][nc] + ways[cr][cc]) % MOD;
                    }
                }
            }
        }
        return ways[er][ec];
    }
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line = br.readLine();
        if (line == null) return;
        StringTokenizer st = new StringTokenizer(line);
        int r = Integer.parseInt(st.nextToken()), c = Integer.parseInt(st.nextToken());
        char[][] g = new char[r][c];
        int sx=0, sy=0, kx=0, ky=0, ox=0, oy=0;
        for (int i = 0; i < r; i++) {
            String row = br.readLine();
            for (int j = 0; j < c; j++) {
                g[i][j] = row.charAt(j);
                if (g[i][j] == 'X') { sx = i; sy = j; }
                else if (g[i][j] == 'K') { kx = i; ky = j; }
                else if (g[i][j] == 'O') { ox = i; oy = j; }
            }
        }
        long w1 = countPaths(g, sx, sy, kx, ky);
        long w2 = countPaths(g, kx, ky, ox, oy);
        System.out.println((w1 * w2) % MOD);
    }
}""",
        "cpp": """#include <iostream>
#include <vector>
#include <queue>
#include <string>
using namespace std;
const int MOD = 1000000007;
int dr[] = {-1, 1, 0, 0}, dc[] = {0, 0, -1, 1};
long long countPaths(const vector<string>& g, int sr, int sc, int er, int ec) {
    int r = g.size(), c = g[0].size();
    vector<vector<int>> dist(r, vector<int>(c, -1));
    vector<vector<long long>> ways(r, vector<long long>(c, 0));
    queue<pair<int, int>> q;
    q.push({sr, sc}); dist[sr][sc] = 0; ways[sr][sc] = 1;
    while (!q.empty()) {
        auto [cr, cc] = q.front(); q.pop();
        for (int d = 0; d < 4; d++) {
            int nr = cr + dr[d], nc = cc + dc[d];
            if (nr >= 0 && nr < r && nc >= 0 && nc < c && g[nr][nc] != '#') {
                if (dist[nr][nc] == -1) {
                    dist[nr][nc] = dist[cr][cc] + 1;
                    ways[nr][nc] = ways[cr][cc];
                    q.push({nr, nc});
                } else if (dist[nr][nc] == dist[cr][cc] + 1) {
                    ways[nr][nc] = (ways[nr][nc] + ways[cr][cc]) % MOD;
                }
            }
        }
    }
    return ways[er][ec];
}
int main() {
    ios_base::sync_with_stdio(false); cin.tie(NULL);
    int r, c; if (!(cin >> r >> c)) return 0;
    vector<string> g(r);
    int sx=0, sy=0, kx=0, ky=0, ox=0, oy=0;
    for (int i = 0; i < r; i++) {
        cin >> g[i];
        for (int j = 0; j < c; j++) {
            if (g[i][j] == 'X') { sx = i; sy = j; }
            else if (g[i][j] == 'K') { kx = i; ky = j; }
            else if (g[i][j] == 'O') { ox = i; oy = j; }
        }
    }
    long long w1 = countPaths(g, sx, sy, kx, ky);
    long long w2 = countPaths(g, kx, ky, ox, oy);
    cout << (w1 * w2) % MOD << "\\n";
    return 0;
}""",
        "python": """import sys
from collections import deque
def count_paths(g, sr, sc, er, ec):
    r, c, MOD = len(g), len(g[0]), 10**9 + 7
    dist = [[-1]*c for _ in range(r)]
    ways = [[0]*c for _ in range(r)]
    q = deque([(sr, sc)])
    dist[sr][sc] = 0; ways[sr][sc] = 1
    dr, dc = [-1, 1, 0, 0], [0, 0, -1, 1]
    while q:
        cr, cc = q.popleft()
        for d in range(4):
            nr, nc = cr + dr[d], cc + dc[d]
            if 0 <= nr < r and 0 <= nc < c and g[nr][nc] != '#':
                if dist[nr][nc] == -1:
                    dist[nr][nc] = dist[cr][cc] + 1
                    ways[nr][nc] = ways[cr][cc]
                    q.append((nr, nc))
                elif dist[nr][nc] == dist[cr][cc] + 1:
                    ways[nr][nc] = (ways[nr][nc] + ways[cr][cc]) % MOD
    return ways[er][ec]

def solve():
    data = sys.stdin.read().split()
    if not data: return
    r, c = int(data[0]), int(data[1])
    g = data[2:2+r]
    sx = sy = kx = ky = ox = oy = 0
    for i in range(r):
        for j in range(c):
            if g[i][j] == 'X': sx, sy = i, j
            elif g[i][j] == 'K': kx, ky = i, j
            elif g[i][j] == 'O': ox, oy = i, j
    w1 = count_paths(g, sx, sy, kx, ky)
    w2 = count_paths(g, kx, ky, ox, oy)
    print((w1 * w2) % (10**9 + 7))
if __name__ == '__main__': solve()"""
    },

    "PYQ-05": {
        "idea": "Dynamic programming dp[i][p]: minimum operations on prefix i to have p peaks. A peak at i requires H[i] > H[i-1] and H[i] > H[i+1], with adjacent peaks at least 2 steps apart.",
        "complexity": "Time Complexity: O(N * P) DP. Space Complexity: O(N * P).",
        "pitfalls": ["Peaks cannot be adjacent.", "Modifying neighbors can lower cost."],
        "java": """import java.io.*;
import java.util.*;

public class Solution {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line = br.readLine();
        if (line == null) return;
        StringTokenizer st = new StringTokenizer(line);
        int n = Integer.parseInt(st.nextToken()), p = Integer.parseInt(st.nextToken());
        long[] h = new long[n];
        st = new StringTokenizer(br.readLine());
        for (int i = 0; i < n; i++) h[i] = Long.parseLong(st.nextToken());
        long INF = 1L << 55;
        long[][][] dp = new long[n + 1][p + 1][2];
        for (int i = 0; i <= n; i++)
            for (int j = 0; j <= p; j++) Arrays.fill(dp[i][j], INF);
        dp[0][0][0] = 0;
        for (int i = 1; i <= n; i++) {
            for (int j = 0; j <= p; j++) {
                dp[i][j][0] = Math.min(dp[i - 1][j][0], dp[i - 1][j][1]);
                if (j > 0 && i >= 2 && i < n) {
                    long target = Math.max(h[i - 2], (i < n ? h[i] : 0)) + 1;
                    long cost = Math.max(0L, target - h[i - 1]);
                    dp[i][j][1] = dp[i - 2][j - 1][0] + cost;
                }
            }
        }
        long ans = Math.min(dp[n][p][0], dp[n][p][1]);
        System.out.println(ans >= INF / 2 ? -1 : ans);
    }
}""",
        "cpp": """#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;
const long long INF = 1e16;
int main() {
    ios_base::sync_with_stdio(false); cin.tie(NULL);
    int n, p; if (!(cin >> n >> p)) return 0;
    vector<long long> h(n);
    for (int i = 0; i < n; i++) cin >> h[i];
    vector<vector<vector<long long>>> dp(n + 1, vector<vector<long long>>(p + 1, vector<long long>(2, INF)));
    dp[0][0][0] = 0;
    for (int i = 1; i <= n; i++) {
        for (int j = 0; j <= p; j++) {
            dp[i][j][0] = min(dp[i - 1][j][0], dp[i - 1][j][1]);
            if (j > 0 && i >= 2 && i < n) {
                long long target = max(h[i - 2], h[i]) + 1;
                long long cost = max(0LL, target - h[i - 1]);
                dp[i][j][1] = dp[i - 2][j - 1][0] + cost;
            }
        }
    }
    long long ans = min(dp[n][p][0], dp[n][p][1]);
    cout << (ans >= INF / 2 ? -1 : ans) << "\\n";
    return 0;
}""",
        "python": """import sys
def solve():
    data = sys.stdin.read().split()
    if not data: return
    n, p = int(data[0]), int(data[1])
    h = [int(x) for x in data[2:2+n]]
    INF = 10**16
    dp = [[[INF]*2 for _ in range(p + 1)] for _ in range(n + 1)]
    dp[0][0][0] = 0
    for i in range(1, n + 1):
        for j in range(p + 1):
            dp[i][j][0] = min(dp[i - 1][j][0], dp[i - 1][j][1])
            if j > 0 and 2 <= i < n:
                target = max(h[i - 2], h[i]) + 1
                cost = max(0, target - h[i - 1])
                dp[i][j][1] = dp[i - 2][j - 1][0] + cost
    ans = min(dp[n][p][0], dp[n][p][1])
    print(-1 if ans >= INF // 2 else ans)
if __name__ == '__main__': solve()"""
    },

    "PYQ-06": {
        "idea": "Towers i and j communicate mutually iff |X[i] - X[j]| <= min(R[i], R[j]). Sort towers by position X. For each tower i, check neighbors j within range using two pointers / binary search.",
        "complexity": "Time Complexity: O(N log N) sorting + interval query. Space Complexity: O(N).",
        "pitfalls": ["Condition requires mutual transmission (both within each other's range).", "Distance can be large."],
        "java": """import java.io.*;
import java.util.*;

public class Solution {
    static class Tower {
        long x, r;
        Tower(long x, long r) { this.x = x; this.r = r; }
    }
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line = br.readLine();
        if (line == null) return;
        int n = Integer.parseInt(line.trim());
        Tower[] t = new Tower[n];
        for (int i = 0; i < n; i++) {
            StringTokenizer st = new StringTokenizer(br.readLine());
            t[i] = new Tower(Long.parseLong(st.nextToken()), Long.parseLong(st.nextToken()));
        }
        Arrays.sort(t, (a, b) -> Long.compare(a.x, b.x));
        long pairs = 0;
        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {
                long dist = t[j].x - t[i].x;
                if (dist > t[i].r) break;
                if (dist <= t[j].r) pairs++;
            }
        }
        System.out.println(pairs);
    }
}""",
        "cpp": """#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;
struct Tower { long long x, r; };
int main() {
    ios_base::sync_with_stdio(false); cin.tie(NULL);
    int n; if (!(cin >> n)) return 0;
    vector<Tower> t(n);
    for (int i = 0; i < n; i++) cin >> t[i].x >> t[i].r;
    sort(t.begin(), t.end(), [](const Tower& a, const Tower& b) { return a.x < b.x; });
    long long pairs = 0;
    for (int i = 0; i < n; i++) {
        for (int j = i + 1; j < n; j++) {
            long long dist = t[j].x - t[i].x;
            if (dist > t[i].r) break;
            if (dist <= t[j].r) pairs++;
        }
    }
    cout << pairs << "\\n";
    return 0;
}""",
        "python": """import sys
def solve():
    data = sys.stdin.read().split()
    if not data: return
    n = int(data[0])
    t = []
    idx = 1
    for _ in range(n):
        t.append((int(data[idx]), int(data[idx+1])))
        idx += 2
    t.sort(key=lambda x: x[0])
    pairs = 0
    for i in range(n):
        for j in range(i + 1, n):
            dist = t[j][0] - t[i][0]
            if dist > t[i][1]: break
            if dist <= t[j][1]: pairs += 1
    print(pairs)
if __name__ == '__main__': solve()"""
    },

    "PYQ-07": {
        "idea": "Group dish indices by dish type. For each unique type, compute max non-adjacent elements (House Robber logic: if consecutive occurrences are adjacent in array, cannot pick both). Return maximum count across all dish types.",
        "complexity": "Time Complexity: O(N) grouping and linear dynamic programming. Space Complexity: O(N).",
        "pitfalls": ["Only dishes of ONE single type may be picked.", "Adjacency is defined by position on the conveyor belt."],
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
        Map<Integer, List<Integer>> pos = new HashMap<>();
        for (int i = 0; i < n; i++) {
            a[i] = Integer.parseInt(st.nextToken());
            pos.computeIfAbsent(a[i], k -> new ArrayList<>()).add(i);
        }
        int maxCount = 0;
        for (List<Integer> list : pos.values()) {
            int m = list.size();
            int[] dp = new int[m + 1];
            dp[0] = 0;
            dp[1] = 1;
            for (int i = 2; i <= m; i++) {
                if (list.get(i - 1) == list.get(i - 2) + 1) {
                    dp[i] = Math.max(dp[i - 1], dp[i - 2] + 1);
                } else {
                    dp[i] = dp[i - 1] + 1;
                }
            }
            maxCount = Math.max(maxCount, dp[m]);
        }
        System.out.println(maxCount);
    }
}""",
        "cpp": """#include <iostream>
#include <vector>
#include <unordered_map>
#include <algorithm>
using namespace std;
int main() {
    ios_base::sync_with_stdio(false); cin.tie(NULL);
    int n; if (!(cin >> n)) return 0;
    unordered_map<int, vector<int>> pos;
    for (int i = 0; i < n; i++) {
        int x; cin >> x; pos[x].push_back(i);
    }
    int maxCount = 0;
    for (const auto& [type, list] : pos) {
        int m = list.size();
        vector<int> dp(m + 1, 0);
        dp[1] = 1;
        for (int i = 2; i <= m; i++) {
            if (list[i - 1] == list[i - 2] + 1) dp[i] = max(dp[i - 1], dp[i - 2] + 1);
            else dp[i] = dp[i - 1] + 1;
        }
        maxCount = max(maxCount, dp[m]);
    }
    cout << maxCount << "\\n";
    return 0;
}""",
        "python": """import sys
from collections import defaultdict
def solve():
    data = sys.stdin.read().split()
    if not data: return
    n = int(data[0])
    pos = defaultdict(list)
    for i in range(n):
        pos[int(data[1 + i])].append(i)
    max_count = 0
    for l in pos.values():
        m = len(l)
        dp = [0]*(m + 1)
        dp[1] = 1
        for i in range(2, m + 1):
            if l[i - 1] == l[i - 2] + 1:
                dp[i] = max(dp[i - 1], dp[i - 2] + 1)
            else:
                dp[i] = dp[i - 1] + 1
        max_count = max(max_count, dp[m])
    print(max_count)
if __name__ == '__main__': solve()"""
    },

    "PYQ-08": {
        "idea": "Buy on day i and sell on day j >= i + (P[i] % 10) + 1. Precompute suffix maximum array of prices. For each day i, query max selling price from suffix array.",
        "complexity": "Time Complexity: O(N) precomputation and scan. Space Complexity: O(N) suffix array.",
        "pitfalls": ["Permitted sell day can exceed array length (out of bounds check).", "Profit cannot be negative (return 0)."],
        "java": """import java.io.*;
import java.util.*;

public class Solution {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line = br.readLine();
        if (line == null) return;
        int n = Integer.parseInt(line.trim());
        long[] p = new long[n];
        StringTokenizer st = new StringTokenizer(br.readLine());
        for (int i = 0; i < n; i++) p[i] = Long.parseLong(st.nextToken());
        long[] suff = new long[n + 1];
        suff[n] = 0;
        for (int i = n - 1; i >= 0; i--) suff[i] = Math.max(suff[i + 1], p[i]);
        long maxProfit = 0;
        for (int i = 0; i < n; i++) {
            int sellDay = i + (int)(p[i] % 10) + 1;
            if (sellDay < n) {
                maxProfit = Math.max(maxProfit, suff[sellDay] - p[i]);
            }
        }
        System.out.println(maxProfit);
    }
}""",
        "cpp": """#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;
int main() {
    ios_base::sync_with_stdio(false); cin.tie(NULL);
    int n; if (!(cin >> n)) return 0;
    vector<long long> p(n);
    for (int i = 0; i < n; i++) cin >> p[i];
    vector<long long> suff(n + 1, 0);
    for (int i = n - 1; i >= 0; i--) suff[i] = max(suff[i + 1], p[i]);
    long long maxProfit = 0;
    for (int i = 0; i < n; i++) {
        int sellDay = i + (p[i] % 10) + 1;
        if (sellDay < n) maxProfit = max(maxProfit, suff[sellDay] - p[i]);
    }
    cout << maxProfit << "\\n";
    return 0;
}""",
        "python": """import sys
def solve():
    data = sys.stdin.read().split()
    if not data: return
    n = int(data[0])
    p = [int(x) for x in data[1:1+n]]
    suff = [0]*(n + 1)
    for i in range(n - 1, -1, -1): suff[i] = max(suff[i + 1], p[i])
    max_profit = 0
    for i in range(n):
        sell_day = i + (p[i] % 10) + 1
        if sell_day < n:
            max_profit = max(max_profit, suff[sell_day] - p[i])
    print(max_profit)
if __name__ == '__main__': solve()"""
    },

    "PYQ-09": {
        "idea": "Buy 2 get 1 free up to V times. Sort prices descending. For each triple of items, pay for the two most expensive and take the third for free, repeating up to V times.",
        "complexity": "Time Complexity: O(N log N) sorting. Space Complexity: O(N).",
        "pitfalls": ["Cannot get more than V free items.", "The free item must be <= both paid items (grouping triples greedily from most expensive achieves this)."],
        "java": """import java.io.*;
import java.util.*;

public class Solution {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line = br.readLine();
        if (line == null) return;
        StringTokenizer st = new StringTokenizer(line);
        int n = Integer.parseInt(st.nextToken()), v = Integer.parseInt(st.nextToken());
        Long[] c = new Long[n];
        st = new StringTokenizer(br.readLine());
        for (int i = 0; i < n; i++) c[i] = Long.parseLong(st.nextToken());
        Arrays.sort(c, Collections.reverseOrder());
        long total = 0;
        int freeUsed = 0;
        for (int i = 0; i < n; i++) {
            if (i % 3 == 2 && freeUsed < v) {
                freeUsed++;
            } else {
                total += c[i];
            }
        }
        System.out.println(total);
    }
}""",
        "cpp": """#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;
int main() {
    ios_base::sync_with_stdio(false); cin.tie(NULL);
    int n, v; if (!(cin >> n >> v)) return 0;
    vector<long long> c(n);
    for (int i = 0; i < n; i++) cin >> c[i];
    sort(c.rbegin(), c.rend());
    long long total = 0;
    int freeUsed = 0;
    for (int i = 0; i < n; i++) {
        if (i % 3 == 2 && freeUsed < v) freeUsed++;
        else total += c[i];
    }
    cout << total << "\\n";
    return 0;
}""",
        "python": """import sys
def solve():
    data = sys.stdin.read().split()
    if not data: return
    n, v = int(data[0]), int(data[1])
    c = sorted([int(x) for x in data[2:2+n]], reverse=True)
    total, free_used = 0, 0
    for i in range(n):
        if i % 3 == 2 and free_used < v: free_used += 1
        else: total += c[i]
    print(total)
if __name__ == '__main__': solve()"""
    },

    "PYQ-10": {
        "idea": "Partition N stones into Set A (k stones, sum S) and Set B (N-k stones). Difference is |(2*S - TotalSum) + (2*k - N)*R|. Use 2D subset sum DP dp[k][s] to find all reachable (k, S) combinations and minimize difference.",
        "complexity": "Time Complexity: O(N^2 * Sum) subset DP. Space Complexity: O(N * Sum).",
        "pitfalls": ["Resonance factor R introduces count dependency.", "All stones must be partitioned into exactly two sets."],
        "java": """import java.io.*;
import java.util.*;

public class Solution {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line = br.readLine();
        if (line == null) return;
        StringTokenizer st = new StringTokenizer(line);
        int n = Integer.parseInt(st.nextToken());
        long r = Long.parseLong(st.nextToken());
        int[] w = new int[n];
        int sum = 0;
        st = new StringTokenizer(br.readLine());
        for (int i = 0; i < n; i++) { w[i] = Integer.parseInt(st.nextToken()); sum += w[i]; }
        boolean[][] dp = new boolean[n + 1][sum + 1];
        dp[0][0] = true;
        for (int weight : w) {
            for (int k = n; k >= 1; k--) {
                for (int s = sum; s >= weight; s--) {
                    if (dp[k - 1][s - weight]) dp[k][s] = true;
                }
            }
        }
        long minDiff = Long.MAX_VALUE;
        for (int k = 0; k <= n; k++) {
            for (int s = 0; s <= sum; s++) {
                if (dp[k][s]) {
                    long diff = Math.abs((2L * s - sum) + (2L * k - n) * r);
                    minDiff = Math.min(minDiff, diff);
                }
            }
        }
        System.out.println(minDiff);
    }
}""",
        "cpp": """#include <iostream>
#include <vector>
#include <cmath>
#include <numeric>
using namespace std;
int main() {
    ios_base::sync_with_stdio(false); cin.tie(NULL);
    int n; long long r; if (!(cin >> n >> r)) return 0;
    vector<int> w(n);
    int sum = 0;
    for (int i = 0; i < n; i++) { cin >> w[i]; sum += w[i]; }
    vector<vector<bool>> dp(n + 1, vector<bool>(sum + 1, false));
    dp[0][0] = true;
    for (int weight : w) {
        for (int k = n; k >= 1; k--) {
            for (int s = sum; s >= weight; s--) {
                if (dp[k - 1][s - weight]) dp[k][s] = true;
            }
        }
    }
    long long minDiff = 1e18;
    for (int k = 0; k <= n; k++) {
        for (int s = 0; s <= sum; s++) {
            if (dp[k][s]) {
                long long diff = abs((2LL * s - sum) + (2LL * k - n) * r);
                minDiff = min(minDiff, diff);
            }
        }
    }
    cout << minDiff << "\\n";
    return 0;
}""",
        "python": """import sys
def solve():
    data = sys.stdin.read().split()
    if not data: return
    n, r = int(data[0]), int(data[1])
    w = [int(x) for x in data[2:2+n]]
    total_sum = sum(w)
    dp = {0: {0}}
    for weight in w:
        for k in range(n, 0, -1):
            if k - 1 in dp:
                if k not in dp: dp[k] = set()
                for s in dp[k - 1]:
                    dp[k].add(s + weight)
    min_diff = float('inf')
    for k in dp:
        for s in dp[k]:
            diff = abs((2 * s - total_sum) + (2 * k - n) * r)
            min_diff = min(min_diff, diff)
    print(min_diff)
if __name__ == '__main__': solve()"""
    },

    "PYQ-11": {
        "idea": "Longest increasing path on grid with 1 teleportation jump to any cell of strictly greater value. Sort cells by value. Track dp0 (standard moves) and dp1 (with teleportation).",
        "complexity": "Time Complexity: O(R * C log(R*C)). Space Complexity: O(R * C).",
        "pitfalls": ["Teleport destination must be strictly greater in value.", "Teleport can only be used at most once."],
        "java": """import java.io.*;
import java.util.*;

public class Solution {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line = br.readLine();
        if (line == null) return;
        StringTokenizer st = new StringTokenizer(line);
        int r = Integer.parseInt(st.nextToken()), c = Integer.parseInt(st.nextToken());
        int[][] g = new int[r][c];
        List<int[]> cells = new ArrayList<>();
        for (int i = 0; i < r; i++) {
            st = new StringTokenizer(br.readLine());
            for (int j = 0; j < c; j++) {
                g[i][j] = Integer.parseInt(st.nextToken());
                cells.add(new int[]{g[i][j], i, j});
            }
        }
        cells.sort((a, b) -> Integer.compare(a[0], b[0]));
        int[][] dp0 = new int[r][c];
        int[][] dp1 = new int[r][c];
        for (int[] row : dp0) Arrays.fill(row, 1);
        for (int[] row : dp1) Arrays.fill(row, 1);
        int maxLen = 1;
        int maxDp0SoFar = 1;
        for (int[] cell : cells) {
            int val = cell[0], cr = cell[1], cc = cell[2];
            dp1[cr][cc] = Math.max(dp1[cr][cc], maxDp0SoFar + 1);
            int[] dr = {-1, 1, 0, 0}, dc = {0, 0, -1, 1};
            for (int d = 0; d < 4; d++) {
                int nr = cr + dr[d], nc = cc + dc[d];
                if (nr >= 0 && nr < r && nc >= 0 && nc < c && g[nr][nc] < val) {
                    dp0[cr][cc] = Math.max(dp0[cr][cc], dp0[nr][nc] + 1);
                    dp1[cr][cc] = Math.max(dp1[cr][cc], dp1[nr][nc] + 1);
                }
            }
            maxDp0SoFar = Math.max(maxDp0SoFar, dp0[cr][cc]);
            maxLen = Math.max(maxLen, Math.max(dp0[cr][cc], dp1[cr][cc]));
        }
        System.out.println(maxLen);
    }
}""",
        "cpp": """#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;
struct Cell { int val, r, c; };
int main() {
    ios_base::sync_with_stdio(false); cin.tie(NULL);
    int r, c; if (!(cin >> r >> c)) return 0;
    vector<vector<int>> g(r, vector<int>(c));
    vector<Cell> cells;
    for (int i = 0; i < r; i++) {
        for (int j = 0; j < c; j++) {
            cin >> g[i][j]; cells.push_back({g[i][j], i, j});
        }
    }
    sort(cells.begin(), cells.end(), [](const Cell& a, const Cell& b) { return a.val < b.val; });
    vector<vector<int>> dp0(r, vector<int>(c, 1));
    vector<vector<int>> dp1(r, vector<int>(c, 1));
    int maxLen = 1, maxDp0 = 1;
    int dr[] = {-1, 1, 0, 0}, dc[] = {0, 0, -1, 1};
    for (const auto& cell : cells) {
        int cr = cell.r, cc = cell.c, val = cell.val;
        dp1[cr][cc] = max(dp1[cr][cc], maxDp0 + 1);
        for (int d = 0; d < 4; d++) {
            int nr = cr + dr[d], nc = cc + dc[d];
            if (nr >= 0 && nr < r && nc >= 0 && nc < c && g[nr][nc] < val) {
                dp0[cr][cc] = max(dp0[cr][cc], dp0[nr][nc] + 1);
                dp1[cr][cc] = max(dp1[cr][cc], dp1[nr][nc] + 1);
            }
        }
        maxDp0 = max(maxDp0, dp0[cr][cc]);
        maxLen = max({maxLen, dp0[cr][cc], dp1[cr][cc]});
    }
    cout << maxLen << "\\n";
    return 0;
}""",
        "python": """import sys
def solve():
    data = sys.stdin.read().split()
    if not data: return
    r, c = int(data[0]), int(data[1])
    g = []
    cells = []
    idx = 2
    for i in range(r):
        row = []
        for j in range(c):
            val = int(data[idx]); idx += 1
            row.append(val)
            cells.append((val, i, j))
        g.append(row)
    cells.sort(key=lambda x: x[0])
    dp0 = [[1]*c for _ in range(r)]
    dp1 = [[1]*c for _ in range(r)]
    max_len = 1; max_dp0 = 1
    dr, dc = [-1, 1, 0, 0], [0, 0, -1, 1]
    for val, cr, cc in cells:
        dp1[cr][cc] = max(dp1[cr][cc], max_dp0 + 1)
        for d in range(4):
            nr, nc = cr + dr[d], cc + dc[d]
            if 0 <= nr < r and 0 <= nc < c and g[nr][nc] < val:
                dp0[cr][cc] = max(dp0[cr][cc], dp0[nr][nc] + 1)
                dp1[cr][cc] = max(dp1[cr][cc], dp1[nr][nc] + 1)
        max_dp0 = max(max_dp0, dp0[cr][cc])
        max_len = max(max_len, dp0[cr][cc], dp1[cr][cc])
    print(max_len)
if __name__ == '__main__': solve()"""
    },

    "PYQ-12": {
        "idea": "Greedy tracking of consecutive executed tasks. When a task arrives at time slot A[i], if executing it makes consecutive tasks exceed D, it must be skipped for mandatory cooldown.",
        "complexity": "Time Complexity: O(N) linear scan. Space Complexity: O(N).",
        "pitfalls": ["Cooldown is only needed after D strictly consecutive time slots.", "Tasks arriving with gaps naturally reset consecutive counter."],
        "java": """import java.io.*;
import java.util.*;

public class Solution {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line = br.readLine();
        if (line == null) return;
        StringTokenizer st = new StringTokenizer(line);
        int n = Integer.parseInt(st.nextToken()), d = Integer.parseInt(st.nextToken());
        int[] a = new int[n];
        st = new StringTokenizer(br.readLine());
        for (int i = 0; i < n; i++) a[i] = Integer.parseInt(st.nextToken());
        Arrays.sort(a);
        int count = 0, consecutive = 0, lastTime = -2;
        for (int t : a) {
            if (t == lastTime + 1) {
                if (consecutive < d) {
                    consecutive++;
                    lastTime = t;
                    count++;
                }
            } else {
                consecutive = 1;
                lastTime = t;
                count++;
            }
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
    int n, d; if (!(cin >> n >> d)) return 0;
    vector<int> a(n);
    for (int i = 0; i < n; i++) cin >> a[i];
    sort(a.begin(), a.end());
    int count = 0, consecutive = 0, lastTime = -2;
    for (int t : a) {
        if (t == lastTime + 1) {
            if (consecutive < d) { consecutive++; lastTime = t; count++; }
        } else {
            consecutive = 1; lastTime = t; count++;
        }
    }
    cout << count << "\\n";
    return 0;
}""",
        "python": """import sys
def solve():
    data = sys.stdin.read().split()
    if not data: return
    n, d = int(data[0]), int(data[1])
    a = sorted([int(x) for x in data[2:2+n]])
    count, consecutive, last_time = 0, 0, -2
    for t in a:
        if t == last_time + 1:
            if consecutive < d:
                consecutive += 1; last_time = t; count += 1
        else:
            consecutive = 1; last_time = t; count += 1
    print(count)
if __name__ == '__main__': solve()"""
    },

    "PYQ-13": {
        "idea": "Scan array and segment when |nums[i]| <= |nums[i-1]|. For each segment, compute product of elements modulo 10^9+7, taking maximum across all segments.",
        "complexity": "Time Complexity: O(N) single pass. Space Complexity: O(1).",
        "pitfalls": ["Modulo 10^9+7 must be applied.", "Absolute values determine strictly increasing condition, but original values are multiplied."],
        "java": """import java.io.*;
import java.util.*;

public class Solution {
    static final int MOD = 1_000_000_007;
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line = br.readLine();
        if (line == null) return;
        int n = Integer.parseInt(line.trim());
        long[] a = new long[n];
        StringTokenizer st = new StringTokenizer(br.readLine());
        for (int i = 0; i < n; i++) a[i] = Long.parseLong(st.nextToken());
        long maxProd = 0, curProd = 1;
        for (int i = 0; i < n; i++) {
            if (i > 0 && Math.abs(a[i]) <= Math.abs(a[i - 1])) {
                curProd = 1;
            }
            curProd = (curProd * ((a[i] % MOD + MOD) % MOD)) % MOD;
            maxProd = Math.max(maxProd, curProd);
        }
        System.out.println(maxProd);
    }
}""",
        "cpp": """#include <iostream>
#include <vector>
#include <cmath>
using namespace std;
const int MOD = 1000000007;
int main() {
    ios_base::sync_with_stdio(false); cin.tie(NULL);
    int n; if (!(cin >> n)) return 0;
    vector<long long> a(n);
    for (int i = 0; i < n; i++) cin >> a[i];
    long long maxProd = 0, curProd = 1;
    for (int i = 0; i < n; i++) {
        if (i > 0 && abs(a[i]) <= abs(a[i - 1])) curProd = 1;
        curProd = (curProd * ((a[i] % MOD + MOD) % MOD)) % MOD;
        maxProd = max(maxProd, curProd);
    }
    cout << maxProd << "\\n";
    return 0;
}""",
        "python": """import sys
def solve():
    data = sys.stdin.read().split()
    if not data: return
    n, MOD = int(data[0]), 10**9 + 7
    a = [int(x) for x in data[1:1+n]]
    max_prod, cur_prod = 0, 1
    for i in range(n):
        if i > 0 and abs(a[i]) <= abs(a[i - 1]):
            cur_prod = 1
        cur_prod = (cur_prod * (a[i] % MOD)) % MOD
        max_prod = max(max_prod, cur_prod)
    print(max_prod)
if __name__ == '__main__': solve()"""
    },

    "PYQ-14": {
        "idea": "Given item prices and K flat coupons of discount D. To maximize savings, sort prices descending and apply coupons to items with price >= D first, saving min(P[i], D) per coupon.",
        "complexity": "Time Complexity: O(N log N) sorting. Space Complexity: O(N).",
        "pitfalls": ["Discount cannot exceed price (final price >= 0).", "At most one coupon per item."],
        "java": """import java.io.*;
import java.util.*;

public class Solution {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line = br.readLine();
        if (line == null) return;
        StringTokenizer st = new StringTokenizer(line);
        int n = Integer.parseInt(st.nextToken()), k = Integer.parseInt(st.nextToken());
        long d = Long.parseLong(st.nextToken());
        Long[] p = new Long[n];
        st = new StringTokenizer(br.readLine());
        for (int i = 0; i < n; i++) p[i] = Long.parseLong(st.nextToken());
        Arrays.sort(p, Collections.reverseOrder());
        long totalSavings = 0;
        int used = Math.min(n, k);
        for (int i = 0; i < used; i++) {
            totalSavings += Math.min(p[i], d);
        }
        System.out.println(totalSavings);
    }
}""",
        "cpp": """#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;
int main() {
    ios_base::sync_with_stdio(false); cin.tie(NULL);
    int n, k; long long d;
    if (!(cin >> n >> k >> d)) return 0;
    vector<long long> p(n);
    for (int i = 0; i < n; i++) cin >> p[i];
    sort(p.rbegin(), p.rend());
    long long savings = 0;
    int used = min(n, k);
    for (int i = 0; i < used; i++) savings += min(p[i], d);
    cout << savings << "\\n";
    return 0;
}""",
        "python": """import sys
def solve():
    data = sys.stdin.read().split()
    if not data: return
    n, k, d = int(data[0]), int(data[1]), int(data[2])
    p = sorted([int(x) for x in data[3:3+n]], reverse=True)
    savings = sum(min(p[i], d) for i in range(min(n, k)))
    print(savings)
if __name__ == '__main__': solve()"""
    }
}
