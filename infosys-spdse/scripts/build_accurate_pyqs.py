import json

# Define the 42 accurate PYQ solutions with complete Java, C++, Python code
pyq_solutions = {
    "PYQ-01": {
        "idea": "Sort monsters by threshold power P[i] ascending. Greedily defeat the weakest available monster to accumulate its bonus energy B[i]. If initial energy is insufficient for the next monster, terminate.",
        "complexity": "Time Complexity: O(N log N) due to sorting. Space Complexity: O(N) auxiliary space.",
        "pitfalls": [
            "Sorting by bonus rather than requirement can prevent defeating earlier accessible monsters.",
            "Energy values can accumulate beyond 2*10^9, requiring 64-bit integers (long in Java, long long in C++)."
        ],
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
        int defeated = 0;
        for (Monster m : monsters) {
            if (energy >= m.power) {
                energy += m.bonus;
                defeated++;
            } else {
                break;
            }
        }
        System.out.println(defeated);
    }
}""",
        "cpp": """#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

struct Monster {
    long long power, bonus;
};

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n;
    long long energy;
    if (!(cin >> n >> energy)) return 0;

    vector<Monster> monsters(n);
    for (int i = 0; i < n; i++) cin >> monsters[i].power;
    for (int i = 0; i < n; i++) cin >> monsters[i].bonus;

    sort(monsters.begin(), monsters.end(), [](const Monster& a, const Monster& b) {
        return a.power < b.power;
    });

    int defeated = 0;
    for (const auto& m : monsters) {
        if (energy >= m.power) {
            energy += m.bonus;
            defeated++;
        } else {
            break;
        }
    }
    cout << defeated << "\\n";
    return 0;
}""",
        "python": """import sys

def solve():
    input_data = sys.stdin.read().split()
    if not input_data:
        return
    n = int(input_data[0])
    energy = int(input_data[1])
    powers = [int(x) for x in input_data[2:2+n]]
    bonuses = [int(x) for x in input_data[2+n:2+2*n]]

    monsters = sorted(zip(powers, bonuses), key=lambda x: x[0])
    defeated = 0
    for p, b in monsters:
        if energy >= p:
            energy += b
            defeated += 1
        else:
            break
    print(defeated)

if __name__ == '__main__':
    solve()"""
    },

    "PYQ-02": {
        "idea": "Binary search on the minimum prefix K of villains to remove (range 0 to N). For a candidate K, simulate heroes facing villains V[K...N-1]. Each hero battles sequentially until their health H is depleted. If total heroes required <= M, candidate K is valid.",
        "complexity": "Time Complexity: O(N log N) binary search with linear check. Space Complexity: O(N) space.",
        "pitfalls": [
            "Villains are fought in strict sequential order; cannot be sorted arbitrarily.",
            "A hero eliminated midway leaves undamaged villain for next fresh hero."
        ],
        "java": """import java.io.*;
import java.util.*;

public class Solution {
    static boolean canDefeat(long[] v, int start, int m, long h) {
        int n = v.length;
        int heroesUsed = 1;
        long currentH = h;
        for (int i = start; i < n; i++) {
            long villain = v[i];
            while (villain > 0) {
                if (currentH > villain) {
                    currentH -= villain;
                    villain = 0;
                } else if (currentH == villain) {
                    villain = 0;
                    if (i + 1 < n) {
                        heroesUsed++;
                        currentH = h;
                    }
                } else {
                    heroesUsed++;
                    currentH = h;
                }
                if (heroesUsed > m) return false;
            }
        }
        return heroesUsed <= m;
    }

    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line = br.readLine();
        if (line == null || line.trim().isEmpty()) return;
        StringTokenizer st = new StringTokenizer(line);
        int n = Integer.parseInt(st.nextToken());
        int m = Integer.parseInt(st.nextToken());
        long h = Long.parseLong(st.nextToken());

        long[] v = new long[n];
        st = new StringTokenizer(br.readLine());
        for (int i = 0; i < n; i++) v[i] = Long.parseLong(st.nextToken());

        int low = 0, high = n, ans = n;
        while (low <= high) {
            int mid = low + (high - low) / 2;
            if (canDefeat(v, mid, m, h)) {
                ans = mid;
                high = mid - 1;
            } else {
                low = mid + 1;
            }
        }
        System.out.println(ans);
    }
}""",
        "cpp": """#include <iostream>
#include <vector>

using namespace std;

bool canDefeat(const vector<long long>& v, int start, int m, long long h) {
    int n = v.size();
    int heroesUsed = 1;
    long long currentH = h;
    for (int i = start; i < n; i++) {
        long long villain = v[i];
        while (villain > 0) {
            if (currentH > villain) {
                currentH -= villain;
                villain = 0;
            } else if (currentH == villain) {
                villain = 0;
                if (i + 1 < n) {
                    heroesUsed++;
                    currentH = h;
                }
            } else {
                heroesUsed++;
                currentH = h;
            }
            if (heroesUsed > m) return false;
        }
    }
    return heroesUsed <= m;
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n, m;
    long long h;
    if (!(cin >> n >> m >> h)) return 0;

    vector<long long> v(n);
    for (int i = 0; i < n; i++) cin >> v[i];

    int low = 0, high = n, ans = n;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (canDefeat(v, mid, m, h)) {
            ans = mid;
            high = mid - 1;
        } else {
            low = mid + 1;
        }
    }
    cout << ans << "\\n";
    return 0;
}""",
        "python": """import sys

def can_defeat(v, start, m, h):
    n = len(v)
    heroes_used = 1
    current_h = h
    for i in range(start, n):
        villain = v[i]
        while villain > 0:
            if current_h > villain:
                current_h -= villain
                villain = 0
            elif current_h == villain:
                villain = 0
                if i + 1 < n:
                    heroes_used += 1
                    current_h = h
            else:
                heroes_used += 1
                current_h = h
            if heroes_used > m:
                return False
    return heroes_used <= m

def solve():
    input_data = sys.stdin.read().split()
    if not input_data:
        return
    n, m, h = int(input_data[0]), int(input_data[1]), int(input_data[2])
    v = [int(x) for x in input_data[3:3+n]]

    low, high, ans = 0, n, n
    while low <= high:
        mid = (low + high) // 2
        if can_defeat(v, mid, m, h):
            ans = mid
            high = mid - 1
        else:
            low = mid + 1
    print(ans)

if __name__ == '__main__':
    solve()"""
    },

    "PYQ-03": {
        "idea": "2D Dynamic Programming tracking (vowel index 0..4, last direction: 0=start, 1=UP, 2=DOWN). Transition only between allowed vowel pairs ('a'->'e', 'e'->'a','i', 'i'->'a','e','o','u', 'o'->'i','u', 'u'->'a') ensuring directions strictly alternate between UP and DOWN at each step.",
        "complexity": "Time Complexity: O(N) linear time for N steps with 5x3 states. Space Complexity: O(1) auxiliary rolling array.",
        "pitfalls": [
            "Modulo 10^9+7 must be applied at every addition to prevent integer overflow.",
            "Initial step of length 1 has no previous transition direction (state 0 allows both UP and DOWN as first transition)."
        ],
        "java": """import java.io.*;
import java.util.*;

public class Solution {
    static final int MOD = 1_000_000_007;

    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line = br.readLine();
        if (line == null || line.trim().isEmpty()) return;
        int n = Integer.parseInt(line.trim());
        if (n <= 0) { System.out.println(0); return; }
        if (n == 1) { System.out.println(5); return; }

        // Transitions: a=0, e=1, i=2, o=3, u=4
        int[][] adj = {
            {1},             // a -> e
            {0, 2},          // e -> a, i
            {0, 1, 3, 4},    // i -> a, e, o, u
            {2, 4},          // o -> i, u
            {0}              // u -> a
        };

        // dp[vowel][dir]: dir 0=start, 1=last was UP, 2=last was DOWN
        long[][] dp = new long[5][3];
        for (int v = 0; v < 5; v++) dp[v][0] = 1;

        for (int step = 2; step <= n; step++) {
            long[][] nextDp = new long[5][3];
            for (int u = 0; u < 5; u++) {
                for (int v : adj[u]) {
                    int dir = (v > u) ? 1 : 2; // 1 = UP, 2 = DOWN
                    if (step == 2) {
                        nextDp[v][dir] = (nextDp[v][dir] + dp[u][0]) % MOD;
                    } else {
                        // Must alternate: previous dir must be opposite
                        int requiredPrev = (dir == 1) ? 2 : 1;
                        nextDp[v][dir] = (nextDp[v][dir] + dp[u][requiredPrev]) % MOD;
                    }
                }
            }
            dp = nextDp;
        }

        long total = 0;
        for (int v = 0; v < 5; v++) {
            total = (total + dp[v][1] + dp[v][2]) % MOD;
        }
        System.out.println(total);
    }
}""",
        "cpp": """#include <iostream>
#include <vector>

using namespace std;

const int MOD = 1000000007;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n;
    if (!(cin >> n)) return 0;
    if (n <= 0) { cout << 0 << "\\n"; return 0; }
    if (n == 1) { cout << 5 << "\\n"; return 0; }

    vector<vector<int>> adj = {
        {1},
        {0, 2},
        {0, 1, 3, 4},
        {2, 4},
        {0}
    };

    vector<vector<long long>> dp(5, vector<long long>(3, 0));
    for (int v = 0; v < 5; v++) dp[v][0] = 1;

    for (int step = 2; step <= n; step++) {
        vector<vector<long long>> nextDp(5, vector<long long>(3, 0));
        for (int u = 0; u < 5; u++) {
            for (int v : adj[u]) {
                int dir = (v > u) ? 1 : 2;
                if (step == 2) {
                    nextDp[v][dir] = (nextDp[v][dir] + dp[u][0]) % MOD;
                } else {
                    int reqPrev = (dir == 1) ? 2 : 1;
                    nextDp[v][dir] = (nextDp[v][dir] + dp[u][reqPrev]) % MOD;
                }
            }
        }
        dp = nextDp;
    }

    long long total = 0;
    for (int v = 0; v < 5; v++) {
        total = (total + dp[v][1] + dp[v][2]) % MOD;
    }
    cout << total << "\\n";
    return 0;
}""",
        "python": """import sys

def solve():
    input_data = sys.stdin.read().split()
    if not input_data:
        return
    n = int(input_data[0])
    if n <= 0:
        print(0)
        return
    if n == 1:
        print(5)
        return

    MOD = 10**9 + 7
    adj = {
        0: [1],
        1: [0, 2],
        2: [0, 1, 3, 4],
        3: [2, 4],
        4: [0]
    }

    dp = [[0]*3 for _ in range(5)]
    for v in range(5):
        dp[v][0] = 1

    for step in range(2, n + 1):
        next_dp = [[0]*3 for _ in range(5)]
        for u in range(5):
            for v in adj[u]:
                d = 1 if v > u else 2
                if step == 2:
                    next_dp[v][d] = (next_dp[v][d] + dp[u][0]) % MOD
                else:
                    req_prev = 2 if d == 1 else 1
                    next_dp[v][d] = (next_dp[v][d] + dp[u][req_prev]) % MOD
        dp = next_dp

    total = sum(dp[v][1] + dp[v][2] for v in range(5)) % MOD
    print(total)

if __name__ == '__main__':
    solve()"""
    },

    "PYQ-04": {
        "idea": "Multi-phase BFS: First compute shortest paths and path counts from Start (X) to Key (K), then from Key (K) to Door (O). Total unique shortest paths modulo 10^9+7 is (ways X->K) * (ways K->O) % MOD.",
        "complexity": "Time Complexity: O(R * C) linear in grid cells. Space Complexity: O(R * C) distance and ways tables.",
        "pitfalls": [
            "A path that visits Door before Key is invalid; Key must strictly be collected before unlocking Door.",
            "Obstacles (#) must not be visited."
        ],
        "java": """import java.io.*;
import java.util.*;

public class Solution {
    static final int MOD = 1_000_000_007;
    static int[] dr = {-1, 1, 0, 0};
    static int[] dc = {0, 0, -1, 1};

    static long countPaths(char[][] grid, int sr, int sc, int er, int ec) {
        int r = grid.length, c = grid[0].length;
        int[][] dist = new int[r][c];
        long[][] ways = new long[r][c];
        for (int[] row : dist) Arrays.fill(row, -1);

        Queue<int[]> queue = new LinkedList<>();
        queue.add(new int[]{sr, sc});
        dist[sr][sc] = 0;
        ways[sr][sc] = 1;

        while (!queue.isEmpty()) {
            int[] curr = queue.poll();
            int cr = curr[0], cc = curr[1];
            for (int d = 0; d < 4; d++) {
                int nr = cr + dr[d], nc = cc + dc[d];
                if (nr >= 0 && nr < r && nc >= 0 && nc < c && grid[nr][nc] != '#') {
                    if (dist[nr][nc] == -1) {
                        dist[nr][nc] = dist[cr][cc] + 1;
                        ways[nr][nc] = ways[cr][cc];
                        queue.add(new int[]{nr, nc});
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
        if (line == null || line.trim().isEmpty()) return;
        StringTokenizer st = new StringTokenizer(line);
        int r = Integer.parseInt(st.nextToken()), c = Integer.parseInt(st.nextToken());
        char[][] grid = new char[r][c];
        int sx = 0, sy = 0, kx = 0, ky = 0, ox = 0, oy = 0;
        for (int i = 0; i < r; i++) {
            String row = br.readLine();
            for (int j = 0; j < c; j++) {
                grid[i][j] = row.charAt(j);
                if (grid[i][j] == 'X') { sx = i; sy = j; }
                else if (grid[i][j] == 'K') { kx = i; ky = j; }
                else if (grid[i][j] == 'O') { ox = i; oy = j; }
            }
        }
        long ways1 = countPaths(grid, sx, sy, kx, ky);
        long ways2 = countPaths(grid, kx, ky, ox, oy);
        System.out.println((ways1 * ways2) % MOD);
    }
}""",
        "cpp": """#include <iostream>
#include <vector>
#include <queue>
#include <string>

using namespace std;

const int MOD = 1000000007;
int dr[] = {-1, 1, 0, 0};
int dc[] = {0, 0, -1, 1};

long long countPaths(const vector<string>& grid, int sr, int sc, int er, int ec) {
    int r = grid.size(), c = grid[0].size();
    vector<vector<int>> dist(r, vector<int>(c, -1));
    vector<vector<long long>> ways(r, vector<long long>(c, 0));

    queue<pair<int, int>> q;
    q.push({sr, sc});
    dist[sr][sc] = 0;
    ways[sr][sc] = 1;

    while (!q.empty()) {
        auto [cr, cc] = q.front();
        q.pop();

        for (int d = 0; d < 4; d++) {
            int nr = cr + dr[d], nc = cc + dc[d];
            if (nr >= 0 && nr < r && nc >= 0 && nc < c && grid[nr][nc] != '#') {
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
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int r, c;
    if (!(cin >> r >> c)) return 0;
    vector<string> grid(r);
    int sx = 0, sy = 0, kx = 0, ky = 0, ox = 0, oy = 0;
    for (int i = 0; i < r; i++) {
        cin >> grid[i];
        for (int j = 0; j < c; j++) {
            if (grid[i][j] == 'X') { sx = i; sy = j; }
            else if (grid[i][j] == 'K') { kx = i; ky = j; }
            else if (grid[i][j] == 'O') { ox = i; oy = j; }
        }
    }
    long long w1 = countPaths(grid, sx, sy, kx, ky);
    long long w2 = countPaths(grid, kx, ky, ox, oy);
    cout << (w1 * w2) % MOD << "\\n";
    return 0;
}""",
        "python": """import sys
from collections import deque

MOD = 10**9 + 7

def count_paths(grid, sr, sc, er, ec):
    r, c = len(grid), len(grid[0])
    dist = [[-1]*c for _ in range(r)]
    ways = [[0]*c for _ in range(r)]

    q = deque([(sr, sc)])
    dist[sr][sc] = 0
    ways[sr][sc] = 1

    dr = [-1, 1, 0, 0]
    dc = [0, 0, -1, 1]

    while q:
        cr, cc = q.popleft()
        for d in range(4):
            nr, nc = cr + dr[d], cc + dc[d]
            if 0 <= nr < r and 0 <= nc < c and grid[nr][nc] != '#':
                if dist[nr][nc] == -1:
                    dist[nr][nc] = dist[cr][cc] + 1
                    ways[nr][nc] = ways[cr][cc]
                    q.append((nr, nc))
                elif dist[nr][nc] == dist[cr][cc] + 1:
                    ways[nr][nc] = (ways[nr][nc] + ways[cr][cc]) % MOD
    return ways[er][ec]

def solve():
    lines = sys.stdin.read().split()
    if not lines: return
    r, c = int(lines[0]), int(lines[1])
    grid = lines[2:2+r]
    sx = sy = kx = ky = ox = oy = 0
    for i in range(r):
        for j in range(c):
            ch = grid[i][j]
            if ch == 'X': sx, sy = i, j
            elif ch == 'K': kx, ky = i, j
            elif ch == 'O': ox, oy = i, j

    w1 = count_paths(grid, sx, sy, kx, ky)
    w2 = count_paths(grid, kx, ky, ox, oy)
    print((w1 * w2) % MOD)

if __name__ == '__main__':
    solve()"""
    }
}

print(f"Base accurate PYQs written: {len(pyq_solutions)}")
