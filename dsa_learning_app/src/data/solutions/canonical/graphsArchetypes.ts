import { ProblemSolution } from '../../../types/dsa';

export const GRAPHS_ARCHETYPES: Record<string, ProblemSolution> = {
  "number_of_islands": {
    "questionId": "archetype-number_of_islands",
    "pattern": "2D Grid Connected Components DFS (In-Place Sinking)",
    "intuition": [
      "Iterate over every cell (r, c) in the M x N grid.",
      "When grid[r][c] == '1', we found a new island. Increment count.",
      "Launch DFS from (r, c) sinking all connected land cells by setting grid[nr][nc] = '0'.",
      "Mutating in-place avoids allocating an auxiliary visited matrix, using only recursion stack space."
    ],
    "pseudocode": [
      "FUNCTION numIslands(grid):",
      "  count = 0",
      "  FOR r from 0 TO M - 1:",
      "    FOR c from 0 TO N - 1:",
      "      IF grid[r][c] == '1':",
      "        count++",
      "        dfsSink(grid, r, c)",
      "  RETURN count"
    ],
    "timeComplexity": "O(M * N)",
    "spaceComplexity": "O(M * N) recursion",
    "complexityExplanation": "Traverse grid; upon encountering '1', sink the entire connected island by mutating cells to '0' via 4-directional DFS in O(M*N) time.",
    "edgeCases": [
      "Grid with no land (all '0')",
      "Grid with all land (all '1')",
      "Diagonal cells (not connected)"
    ],
    "code": {
      "java": "public class Solution {\n    public int numIslands(char[][] grid) {\n        if (grid == null || grid.length == 0) return 0;\n        int m = grid.length, n = grid[0].length, count = 0;\n        for (int r = 0; r < m; r++) {\n            for (int c = 0; c < n; c++) {\n                if (grid[r][c] == '1') {\n                    count++;\n                    dfs(grid, r, c);\n                }\n            }\n        }\n        return count;\n    }\n    private void dfs(char[][] grid, int r, int c) {\n        if (r < 0 || r >= grid.length || c < 0 || c >= grid[0].length || grid[r][c] != '1') return;\n        grid[r][c] = '0';\n        dfs(grid, r + 1, c);\n        dfs(grid, r - 1, c);\n        dfs(grid, r, c + 1);\n        dfs(grid, r, c - 1);\n    }\n}",
      "python": "class Solution:\n    def numIslands(self, grid: list[list[str]]) -> int:\n        if not grid: return 0\n        m, n, count = len(grid), len(grid[0]), 0\n        def dfs(r, c):\n            if r < 0 or r >= m or c < 0 or c >= n or grid[r][c] != '1': return\n            grid[r][c] = '0'\n            dfs(r + 1, c); dfs(r - 1, c); dfs(r, c + 1); dfs(r, c - 1)\n        for r in range(m):\n            for c in range(n):\n                if grid[r][c] == '1':\n                    count += 1\n                    dfs(r, c)\n        return count",
      "cpp": "#include <vector>\n\nclass Solution {\n    void dfs(std::vector<std::vector<char>>& grid, int r, int c) {\n        int m = grid.size(), n = grid[0].size();\n        if (r < 0 || r >= m || c < 0 || c >= n || grid[r][c] != '1') return;\n        grid[r][c] = '0';\n        dfs(grid, r + 1, c);\n        dfs(grid, r - 1, c);\n        dfs(grid, r, c + 1);\n        dfs(grid, r, c - 1);\n    }\npublic:\n    int numIslands(std::vector<std::vector<char>>& grid) {\n        if (grid.empty()) return 0;\n        int m = grid.size(), n = grid[0].size(), count = 0;\n        for (int r = 0; r < m; r++) {\n            for (int c = 0; c < n; c++) {\n                if (grid[r][c] == '1') {\n                    count++;\n                    dfs(grid, r, c);\n                }\n            }\n        }\n        return count;\n    }\n};",
      "javascript": "function numIslands(grid) {\n    if (!grid || grid.length === 0) return 0;\n    const m = grid.length, n = grid[0].length;\n    let count = 0;\n    function dfs(r, c) {\n        if (r < 0 || r >= m || c < 0 || c >= n || grid[r][c] !== '1') return;\n        grid[r][c] = '0';\n        dfs(r + 1, c); dfs(r - 1, c); dfs(r, c + 1); dfs(r, c - 1);\n    }\n    for (let r = 0; r < m; r++) {\n        for (let c = 0; c < n; c++) {\n            if (grid[r][c] === '1') {\n                count++;\n                dfs(r, c);\n            }\n        }\n    }\n    return count;\n}"
    },
    "approaches": {
      "brute": {
        "name": "Brute Force (Disjoint Set Union / Auxiliary Visited Matrix)",
        "tier": "brute",
        "badge": "\ud83e\udd49 Brute Force",
        "intuition": [
          "Disjoint Set Union."
        ],
        "timeComplexity": "O(M * N * \u03b1(M*N))",
        "spaceComplexity": "O(M * N)",
        "complexityExplanation": "Allocates explicit boolean visited array and unions neighboring land cells.",
        "code": {
          "java": "public class Solution {\n    public int numIslandsBrute(char[][] grid) {\n        if (grid == null || grid.length == 0) return 0;\n        int m = grid.length, n = grid[0].length;\n        boolean[][] visited = new boolean[m][n];\n        int count = 0;\n        for (int r = 0; r < m; r++) {\n            for (int c = 0; c < n; c++) {\n                if (grid[r][c] == '1' && !visited[r][c]) {\n                    count++;\n                    dfsVis(grid, r, c, visited);\n                }\n            }\n        }\n        return count;\n    }\n    private void dfsVis(char[][] grid, int r, int c, boolean[][] vis) {\n        if (r < 0 || r >= grid.length || c < 0 || c >= grid[0].length || grid[r][c] != '1' || vis[r][c]) return;\n        vis[r][c] = true;\n        dfsVis(grid, r + 1, c, vis);\n        dfsVis(grid, r - 1, c, vis);\n        dfsVis(grid, r, c + 1, vis);\n        dfsVis(grid, r, c - 1, vis);\n    }\n}",
          "python": "class Solution:\n    def numIslandsBrute(self, grid: list[list[str]]) -> int:\n        if not grid: return 0\n        m, n, count = len(grid), len(grid[0]), 0\n        vis = [[False] * n for _ in range(m)]\n        def dfs(r, c):\n            if r < 0 or r >= m or c < 0 or c >= n or grid[r][c] != '1' or vis[r][c]: return\n            vis[r][c] = True\n            dfs(r + 1, c); dfs(r - 1, c); dfs(r, c + 1); dfs(r, c - 1)\n        for r in range(m):\n            for c in range(n):\n                if grid[r][c] == '1' and not vis[r][c]:\n                    count += 1\n                    dfs(r, c)\n        return count",
          "cpp": "#include <vector>\n\nclass Solution {\n    void dfs(const std::vector<std::vector<char>>& grid, int r, int c, std::vector<std::vector<bool>>& vis) {\n        int m = grid.size(), n = grid[0].size();\n        if (r < 0 || r >= m || c < 0 || c >= n || grid[r][c] != '1' || vis[r][c]) return;\n        vis[r][c] = true;\n        dfs(grid, r + 1, c, vis);\n        dfs(grid, r - 1, c, vis);\n        dfs(grid, r, c + 1, vis);\n        dfs(grid, r, c - 1, vis);\n    }\npublic:\n    int numIslandsBrute(const std::vector<std::vector<char>>& grid) {\n        if (grid.empty()) return 0;\n        int m = grid.size(), n = grid[0].size(), count = 0;\n        std::vector<std::vector<bool>> vis(m, std::vector<bool>(n, false));\n        for (int r = 0; r < m; r++) {\n            for (int c = 0; c < n; c++) {\n                if (grid[r][c] == '1' && !vis[r][c]) {\n                    count++;\n                    dfs(grid, r, c, vis);\n                }\n            }\n        }\n        return count;\n    }\n};",
          "javascript": "function numIslandsBrute(grid) {\n    if (!grid || grid.length === 0) return 0;\n    const m = grid.length, n = grid[0].length;\n    const vis = Array.from({length: m}, () => new Array(n).fill(false));\n    let count = 0;\n    function dfs(r, c) {\n        if (r < 0 || r >= m || c < 0 || c >= n || grid[r][c] !== '1' || vis[r][c]) return;\n        vis[r][c] = true;\n        dfs(r + 1, c); dfs(r - 1, c); dfs(r, c + 1); dfs(r, c - 1);\n    }\n    for (let r = 0; r < m; r++) {\n        for (let c = 0; c < n; c++) {\n            if (grid[r][c] === '1' && !vis[r][c]) {\n                count++;\n                dfs(r, c);\n            }\n        }\n    }\n    return count;\n}"
        }
      },
      "better": {
        "name": "Better (Breadth-First Search with Queue)",
        "tier": "better",
        "badge": "\ud83e\udd48 Better",
        "intuition": [
          "BFS level queue."
        ],
        "timeComplexity": "O(M * N)",
        "spaceComplexity": "O(min(M, N))",
        "complexityExplanation": "Explores island boundaries level-by-level using a FIFO queue; bounds memory by diagonal grid width.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int numIslandsBetter(char[][] grid) {\n        if (grid == null || grid.length == 0) return 0;\n        int m = grid.length, n = grid[0].length, count = 0;\n        int[][] dirs = {{1,0},{-1,0},{0,1},{0,-1}};\n        for (int r = 0; r < m; r++) {\n            for (int c = 0; c < n; c++) {\n                if (grid[r][c] == '1') {\n                    count++;\n                    grid[r][c] = '0';\n                    Queue<int[]> queue = new LinkedList<>();\n                    queue.offer(new int[]{r, c});\n                    while (!queue.isEmpty()) {\n                        int[] cell = queue.poll();\n                        for (int[] d : dirs) {\n                            int nr = cell[0] + d[0], nc = cell[1] + d[1];\n                            if (nr >= 0 && nr < m && nc >= 0 && nc < n && grid[nr][nc] == '1') {\n                                grid[nr][nc] = '0';\n                                queue.offer(new int[]{nr, nc});\n                            }\n                        }\n                    }\n                }\n            }\n        }\n        return count;\n    }\n}",
          "python": "from collections import deque\n\nclass Solution:\n    def numIslandsBetter(self, grid: list[list[str]]) -> int:\n        if not grid: return 0\n        m, n, count = len(grid), len(grid[0]), 0\n        dirs = [(1,0),(-1,0),(0,1),(0,-1)]\n        for r in range(m):\n            for c in range(n):\n                if grid[r][c] == '1':\n                    count += 1\n                    grid[r][c] = '0'\n                    q = deque([(r, c)])\n                    while q:\n                        cr, cc = q.popleft()\n                        for dr, dc in dirs:\n                            nr, nc = cr + dr, cc + dc\n                            if 0 <= nr < m and 0 <= nc < n and grid[nr][nc] == '1':\n                                grid[nr][nc] = '0'\n                                q.append((nr, nc))\n        return count",
          "cpp": "#include <vector>\n#include <queue>\n\nclass Solution {\npublic:\n    int numIslandsBetter(std::vector<std::vector<char>>& grid) {\n        if (grid.empty()) return 0;\n        int m = grid.size(), n = grid[0].size(), count = 0;\n        int dirs[4][2] = {{1,0},{-1,0},{0,1},{0,-1}};\n        for (int r = 0; r < m; r++) {\n            for (int c = 0; c < n; c++) {\n                if (grid[r][c] == '1') {\n                    count++;\n                    grid[r][c] = '0';\n                    std::queue<std::pair<int, int>> q;\n                    q.push({r, c});\n                    while (!q.empty()) {\n                        auto [cr, cc] = q.front(); q.pop();\n                        for (auto& d : dirs) {\n                            int nr = cr + d[0], nc = cc + d[1];\n                            if (nr >= 0 && nr < m && nc >= 0 && nc < n && grid[nr][nc] == '1') {\n                                grid[nr][nc] = '0';\n                                q.push({nr, nc});\n                            }\n                        }\n                    }\n                }\n            }\n        }\n        return count;\n    }\n};",
          "javascript": "function numIslandsBetter(grid) {\n    if (!grid || grid.length === 0) return 0;\n    const m = grid.length, n = grid[0].length;\n    let count = 0;\n    const dirs = [[1,0],[-1,0],[0,1],[0,-1]];\n    for (let r = 0; r < m; r++) {\n        for (let c = 0; c < n; c++) {\n            if (grid[r][c] === '1') {\n                count++;\n                grid[r][c] = '0';\n                const q = [[r, c]];\n                while (q.length > 0) {\n                    const [cr, cc] = q.shift();\n                    for (const [dr, dc] of dirs) {\n                        const nr = cr + dr, nc = cc + dc;\n                        if (nr >= 0 && nr < m && nc >= 0 && nc < n && grid[nr][nc] === '1') {\n                            grid[nr][nc] = '0';\n                            q.push([nr, nc]);\n                        }\n                    }\n                }\n            }\n        }\n    }\n    return count;\n}"
        }
      },
      "optimal": {
        "name": "Optimal (2D Grid Connected Components DFS (In-Place Sinking))",
        "tier": "optimal",
        "badge": "\ud83e\udd47 Optimal",
        "intuition": [
          "Iterate over every cell (r, c) in the M x N grid.",
          "When grid[r][c] == '1', we found a new island. Increment count.",
          "Launch DFS from (r, c) sinking all connected land cells by setting grid[nr][nc] = '0'.",
          "Mutating in-place avoids allocating an auxiliary visited matrix, using only recursion stack space."
        ],
        "pseudocode": [
          "FUNCTION numIslands(grid):",
          "  count = 0",
          "  FOR r from 0 TO M - 1:",
          "    FOR c from 0 TO N - 1:",
          "      IF grid[r][c] == '1':",
          "        count++",
          "        dfsSink(grid, r, c)",
          "  RETURN count"
        ],
        "timeComplexity": "O(M * N)",
        "spaceComplexity": "O(M * N) recursion",
        "complexityExplanation": "Traverse grid; upon encountering '1', sink the entire connected island by mutating cells to '0' via 4-directional DFS in O(M*N) time.",
        "code": {
          "java": "public class Solution {\n    public int numIslands(char[][] grid) {\n        if (grid == null || grid.length == 0) return 0;\n        int m = grid.length, n = grid[0].length, count = 0;\n        for (int r = 0; r < m; r++) {\n            for (int c = 0; c < n; c++) {\n                if (grid[r][c] == '1') {\n                    count++;\n                    dfs(grid, r, c);\n                }\n            }\n        }\n        return count;\n    }\n    private void dfs(char[][] grid, int r, int c) {\n        if (r < 0 || r >= grid.length || c < 0 || c >= grid[0].length || grid[r][c] != '1') return;\n        grid[r][c] = '0';\n        dfs(grid, r + 1, c);\n        dfs(grid, r - 1, c);\n        dfs(grid, r, c + 1);\n        dfs(grid, r, c - 1);\n    }\n}",
          "python": "class Solution:\n    def numIslands(self, grid: list[list[str]]) -> int:\n        if not grid: return 0\n        m, n, count = len(grid), len(grid[0]), 0\n        def dfs(r, c):\n            if r < 0 or r >= m or c < 0 or c >= n or grid[r][c] != '1': return\n            grid[r][c] = '0'\n            dfs(r + 1, c); dfs(r - 1, c); dfs(r, c + 1); dfs(r, c - 1)\n        for r in range(m):\n            for c in range(n):\n                if grid[r][c] == '1':\n                    count += 1\n                    dfs(r, c)\n        return count",
          "cpp": "#include <vector>\n\nclass Solution {\n    void dfs(std::vector<std::vector<char>>& grid, int r, int c) {\n        int m = grid.size(), n = grid[0].size();\n        if (r < 0 || r >= m || c < 0 || c >= n || grid[r][c] != '1') return;\n        grid[r][c] = '0';\n        dfs(grid, r + 1, c);\n        dfs(grid, r - 1, c);\n        dfs(grid, r, c + 1);\n        dfs(grid, r, c - 1);\n    }\npublic:\n    int numIslands(std::vector<std::vector<char>>& grid) {\n        if (grid.empty()) return 0;\n        int m = grid.size(), n = grid[0].size(), count = 0;\n        for (int r = 0; r < m; r++) {\n            for (int c = 0; c < n; c++) {\n                if (grid[r][c] == '1') {\n                    count++;\n                    dfs(grid, r, c);\n                }\n            }\n        }\n        return count;\n    }\n};",
          "javascript": "function numIslands(grid) {\n    if (!grid || grid.length === 0) return 0;\n    const m = grid.length, n = grid[0].length;\n    let count = 0;\n    function dfs(r, c) {\n        if (r < 0 || r >= m || c < 0 || c >= n || grid[r][c] !== '1') return;\n        grid[r][c] = '0';\n        dfs(r + 1, c); dfs(r - 1, c); dfs(r, c + 1); dfs(r, c - 1);\n    }\n    for (let r = 0; r < m; r++) {\n        for (let c = 0; c < n; c++) {\n            if (grid[r][c] === '1') {\n                count++;\n                dfs(r, c);\n            }\n        }\n    }\n    return count;\n}"
        }
      }
    }
  },
  "course_schedule": {
    "questionId": "archetype-course_schedule",
    "pattern": "Kahn's Topological Sort (BFS with In-Degree Array)",
    "intuition": [
      "Build adjacency list and in-degree array of size numCourses.",
      "Enqueue all courses with inDegree == 0 (no prerequisites).",
      "While queue is non-empty, poll course, increment processed count, and decrement in-degrees of dependent courses.",
      "If a neighbor's in-degree drops to 0, enqueue it.",
      "If processed count == numCourses, all courses can be finished (no cycle). Otherwise, a cycle exists."
    ],
    "pseudocode": [
      "FUNCTION canFinish(numCourses, prerequisites):",
      "  inDegree = Array(numCourses, 0); adj = Map()",
      "  FOR [u, v] IN prerequisites: adj[v].add(u); inDegree[u]++",
      "  q = [all nodes with inDegree == 0]",
      "  count = 0",
      "  WHILE q is not empty:",
      "    node = q.poll(); count++",
      "    FOR neighbor IN adj[node]:",
      "      IF --inDegree[neighbor] == 0: q.add(neighbor)",
      "  RETURN count == numCourses"
    ],
    "timeComplexity": "O(V + E)",
    "spaceComplexity": "O(V + E)",
    "complexityExplanation": "Builds adjacency list and in-degree counts. Pushes all courses with 0 prerequisites to queue. Polling reduces neighbor in-degrees, detecting cycles in O(V + E).",
    "edgeCases": [
      "No prerequisites (immediately true)",
      "Self dependency ([0, 0] cycle)",
      "Two-node cycle ([0, 1] and [1, 0])"
    ],
    "code": {
      "java": "import java.util.*;\n\npublic class Solution {\n    public boolean canFinish(int numCourses, int[][] prerequisites) {\n        List<List<Integer>> adj = new ArrayList<>();\n        for (int i = 0; i < numCourses; i++) adj.add(new ArrayList<>());\n        int[] inDegree = new int[numCourses];\n        for (int[] p : prerequisites) {\n            adj.get(p[1]).add(p[0]);\n            inDegree[p[0]]++;\n        }\n        Queue<Integer> queue = new LinkedList<>();\n        for (int i = 0; i < numCourses; i++) {\n            if (inDegree[i] == 0) queue.offer(i);\n        }\n        int count = 0;\n        while (!queue.isEmpty()) {\n            int course = queue.poll();\n            count++;\n            for (int next : adj.get(course)) {\n                if (--inDegree[next] == 0) queue.offer(next);\n            }\n        }\n        return count == numCourses;\n    }\n}",
      "python": "from collections import deque, defaultdict\n\nclass Solution:\n    def canFinish(self, numCourses: int, prerequisites: list[list[int]]) -> bool:\n        adj = defaultdict(list)\n        in_degree = [0] * numCourses\n        for dest, src in prerequisites:\n            adj[src].append(dest)\n            in_degree[dest] += 1\n        q = deque([i for i in range(numCourses) if in_degree[i] == 0])\n        count = 0\n        while q:\n            course = q.popleft()\n            count += 1\n            for nxt in adj[course]:\n                in_degree[nxt] -= 1\n                if in_degree[nxt] == 0: q.append(nxt)\n        return count == numCourses",
      "cpp": "#include <vector>\n#include <queue>\n\nclass Solution {\npublic:\n    bool canFinish(int numCourses, std::vector<std::vector<int>>& prerequisites) {\n        std::vector<std::vector<int>> adj(numCourses);\n        std::vector<int> inDegree(numCourses, 0);\n        for (auto& p : prerequisites) {\n            adj[p[1]].push_back(p[0]);\n            inDegree[p[0]]++;\n        }\n        std::queue<int> q;\n        for (int i = 0; i < numCourses; i++) if (inDegree[i] == 0) q.push(i);\n        int count = 0;\n        while (!q.empty()) {\n            int node = q.front(); q.pop();\n            count++;\n            for (int next : adj[node]) {\n                if (--inDegree[next] == 0) q.push(next);\n            }\n        }\n        return count == numCourses;\n    }\n};",
      "javascript": "function canFinish(numCourses, prerequisites) {\n    const adj = Array.from({length: numCourses}, () => []);\n    const inDegree = new Array(numCourses).fill(0);\n    for (const [dest, src] of prerequisites) {\n        adj[src].push(dest);\n        inDegree[dest]++;\n    }\n    const q = [];\n    for (let i = 0; i < numCourses; i++) if (inDegree[i] === 0) q.push(i);\n    let count = 0;\n    while (q.length > 0) {\n        const course = q.shift();\n        count++;\n        for (const next of adj[course]) {\n            if (--inDegree[next] === 0) q.push(next);\n        }\n    }\n    return count === numCourses;\n}"
    },
    "approaches": {
      "brute": {
        "name": "Brute Force (DFS from Every Node Without Global Visited)",
        "tier": "brute",
        "badge": "\ud83e\udd49 Brute Force",
        "intuition": [
          "Exhaustive cycle search from every node."
        ],
        "timeComplexity": "O(V * (V + E))",
        "spaceComplexity": "O(V)",
        "complexityExplanation": "Runs DFS cycle search independently from each vertex resetting recursion stack.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public boolean canFinishBrute(int numCourses, int[][] prerequisites) {\n        List<List<Integer>> adj = new ArrayList<>();\n        for (int i = 0; i < numCourses; i++) adj.add(new ArrayList<>());\n        for (int[] p : prerequisites) adj.get(p[1]).add(p[0]);\n        for (int i = 0; i < numCourses; i++) {\n            boolean[] onPath = new boolean[numCourses];\n            if (hasCycleFrom(adj, i, onPath)) return false;\n        }\n        return true;\n    }\n    private boolean hasCycleFrom(List<List<Integer>> adj, int node, boolean[] onPath) {\n        if (onPath[node]) return true;\n        onPath[node] = true;\n        for (int next : adj.get(node)) {\n            if (hasCycleFrom(adj, next, onPath)) return true;\n        }\n        onPath[node] = false;\n        return false;\n    }\n}",
          "python": "from collections import defaultdict\n\nclass Solution:\n    def canFinishBrute(self, numCourses: int, prerequisites: list[list[int]]) -> bool:\n        adj = defaultdict(list)\n        for dest, src in prerequisites: adj[src].append(dest)\n        def cycle(u, on_path):\n            if on_path[u]: return True\n            on_path[u] = True\n            for v in adj[u]:\n                if cycle(v, on_path): return True\n            on_path[u] = False\n            return False\n        for i in range(numCourses):\n            if cycle(i, [False] * numCourses): return False\n        return True",
          "cpp": "#include <vector>\n\nclass Solution {\n    bool cycle(const std::vector<std::vector<int>>& adj, int u, std::vector<bool>& onPath) {\n        if (onPath[u]) return true;\n        onPath[u] = true;\n        for (int v : adj[u]) {\n            if (cycle(adj, v, onPath)) return true;\n        }\n        onPath[u] = false;\n        return false;\n    }\npublic:\n    bool canFinishBrute(int numCourses, std::vector<std::vector<int>>& prerequisites) {\n        std::vector<std::vector<int>> adj(numCourses);\n        for (auto& p : prerequisites) adj[p[1]].push_back(p[0]);\n        for (int i = 0; i < numCourses; i++) {\n            std::vector<bool> onPath(numCourses, false);\n            if (cycle(adj, i, onPath)) return false;\n        }\n        return true;\n    }\n};",
          "javascript": "function canFinishBrute(numCourses, prerequisites) {\n    const adj = Array.from({length: numCourses}, () => []);\n    for (const [dest, src] of prerequisites) adj[src].push(dest);\n    function cycle(u, onPath) {\n        if (onPath[u]) return true;\n        onPath[u] = true;\n        for (const v of adj[u]) {\n            if (cycle(v, onPath)) return true;\n        }\n        onPath[u] = false;\n        return false;\n    }\n    for (let i = 0; i < numCourses; i++) {\n        if (cycle(i, new Array(numCourses).fill(false))) return false;\n    }\n    return true;\n}"
        }
      },
      "better": {
        "name": "Better (3-Color DFS Cycle Detection)",
        "tier": "better",
        "badge": "\ud83e\udd48 Better",
        "intuition": [
          "3-state DFS cycle detection."
        ],
        "timeComplexity": "O(V + E)",
        "spaceComplexity": "O(V + E)",
        "complexityExplanation": "Colors nodes: 0 (unvisited), 1 (visiting in current recursion branch), 2 (fully visited). Cycle if visiting encountered.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public boolean canFinishBetter(int numCourses, int[][] prerequisites) {\n        List<List<Integer>> adj = new ArrayList<>();\n        for (int i = 0; i < numCourses; i++) adj.add(new ArrayList<>());\n        for (int[] p : prerequisites) adj.get(p[1]).add(p[0]);\n        int[] state = new int[numCourses];\n        for (int i = 0; i < numCourses; i++) {\n            if (state[i] == 0 && hasCycle(adj, i, state)) return false;\n        }\n        return true;\n    }\n    private boolean hasCycle(List<List<Integer>> adj, int node, int[] state) {\n        state[node] = 1;\n        for (int next : adj.get(node)) {\n            if (state[next] == 1) return true;\n            if (state[next] == 0 && hasCycle(adj, next, state)) return true;\n        }\n        state[node] = 2;\n        return false;\n    }\n}",
          "python": "from collections import defaultdict\n\nclass Solution:\n    def canFinishBetter(self, numCourses: int, prerequisites: list[list[int]]) -> bool:\n        adj = defaultdict(list)\n        for dest, src in prerequisites: adj[src].append(dest)\n        state = [0] * numCourses\n        def has_cycle(u):\n            state[u] = 1\n            for v in adj[u]:\n                if state[v] == 1: return True\n                if state[v] == 0 and has_cycle(v): return True\n            state[u] = 2\n            return False\n        for i in range(numCourses):\n            if state[i] == 0 and has_cycle(i): return False\n        return True",
          "cpp": "#include <vector>\n\nclass Solution {\n    bool hasCycle(const std::vector<std::vector<int>>& adj, int u, std::vector<int>& state) {\n        state[u] = 1;\n        for (int v : adj[u]) {\n            if (state[v] == 1) return true;\n            if (state[v] == 0 && hasCycle(adj, v, state)) return true;\n        }\n        state[u] = 2;\n        return false;\n    }\npublic:\n    bool canFinishBetter(int numCourses, std::vector<std::vector<int>>& prerequisites) {\n        std::vector<std::vector<int>> adj(numCourses);\n        for (auto& p : prerequisites) adj[p[1]].push_back(p[0]);\n        std::vector<int> state(numCourses, 0);\n        for (int i = 0; i < numCourses; i++) {\n            if (state[i] == 0 && hasCycle(adj, i, state)) return false;\n        }\n        return true;\n    }\n};",
          "javascript": "function canFinishBetter(numCourses, prerequisites) {\n    const adj = Array.from({length: numCourses}, () => []);\n    for (const [dest, src] of prerequisites) adj[src].push(dest);\n    const state = new Array(numCourses).fill(0);\n    function hasCycle(u) {\n        state[u] = 1;\n        for (const v of adj[u]) {\n            if (state[v] === 1) return true;\n            if (state[v] === 0 && hasCycle(v)) return true;\n        }\n        state[u] = 2;\n        return false;\n    }\n    for (let i = 0; i < numCourses; i++) {\n        if (state[i] === 0 && hasCycle(i)) return false;\n    }\n    return true;\n}"
        }
      },
      "optimal": {
        "name": "Optimal (Kahn's Topological Sort (BFS with In-Degree Array))",
        "tier": "optimal",
        "badge": "\ud83e\udd47 Optimal",
        "intuition": [
          "Build adjacency list and in-degree array of size numCourses.",
          "Enqueue all courses with inDegree == 0 (no prerequisites).",
          "While queue is non-empty, poll course, increment processed count, and decrement in-degrees of dependent courses.",
          "If a neighbor's in-degree drops to 0, enqueue it.",
          "If processed count == numCourses, all courses can be finished (no cycle). Otherwise, a cycle exists."
        ],
        "pseudocode": [
          "FUNCTION canFinish(numCourses, prerequisites):",
          "  inDegree = Array(numCourses, 0); adj = Map()",
          "  FOR [u, v] IN prerequisites: adj[v].add(u); inDegree[u]++",
          "  q = [all nodes with inDegree == 0]",
          "  count = 0",
          "  WHILE q is not empty:",
          "    node = q.poll(); count++",
          "    FOR neighbor IN adj[node]:",
          "      IF --inDegree[neighbor] == 0: q.add(neighbor)",
          "  RETURN count == numCourses"
        ],
        "timeComplexity": "O(V + E)",
        "spaceComplexity": "O(V + E)",
        "complexityExplanation": "Builds adjacency list and in-degree counts. Pushes all courses with 0 prerequisites to queue. Polling reduces neighbor in-degrees, detecting cycles in O(V + E).",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public boolean canFinish(int numCourses, int[][] prerequisites) {\n        List<List<Integer>> adj = new ArrayList<>();\n        for (int i = 0; i < numCourses; i++) adj.add(new ArrayList<>());\n        int[] inDegree = new int[numCourses];\n        for (int[] p : prerequisites) {\n            adj.get(p[1]).add(p[0]);\n            inDegree[p[0]]++;\n        }\n        Queue<Integer> queue = new LinkedList<>();\n        for (int i = 0; i < numCourses; i++) {\n            if (inDegree[i] == 0) queue.offer(i);\n        }\n        int count = 0;\n        while (!queue.isEmpty()) {\n            int course = queue.poll();\n            count++;\n            for (int next : adj.get(course)) {\n                if (--inDegree[next] == 0) queue.offer(next);\n            }\n        }\n        return count == numCourses;\n    }\n}",
          "python": "from collections import deque, defaultdict\n\nclass Solution:\n    def canFinish(self, numCourses: int, prerequisites: list[list[int]]) -> bool:\n        adj = defaultdict(list)\n        in_degree = [0] * numCourses\n        for dest, src in prerequisites:\n            adj[src].append(dest)\n            in_degree[dest] += 1\n        q = deque([i for i in range(numCourses) if in_degree[i] == 0])\n        count = 0\n        while q:\n            course = q.popleft()\n            count += 1\n            for nxt in adj[course]:\n                in_degree[nxt] -= 1\n                if in_degree[nxt] == 0: q.append(nxt)\n        return count == numCourses",
          "cpp": "#include <vector>\n#include <queue>\n\nclass Solution {\npublic:\n    bool canFinish(int numCourses, std::vector<std::vector<int>>& prerequisites) {\n        std::vector<std::vector<int>> adj(numCourses);\n        std::vector<int> inDegree(numCourses, 0);\n        for (auto& p : prerequisites) {\n            adj[p[1]].push_back(p[0]);\n            inDegree[p[0]]++;\n        }\n        std::queue<int> q;\n        for (int i = 0; i < numCourses; i++) if (inDegree[i] == 0) q.push(i);\n        int count = 0;\n        while (!q.empty()) {\n            int node = q.front(); q.pop();\n            count++;\n            for (int next : adj[node]) {\n                if (--inDegree[next] == 0) q.push(next);\n            }\n        }\n        return count == numCourses;\n    }\n};",
          "javascript": "function canFinish(numCourses, prerequisites) {\n    const adj = Array.from({length: numCourses}, () => []);\n    const inDegree = new Array(numCourses).fill(0);\n    for (const [dest, src] of prerequisites) {\n        adj[src].push(dest);\n        inDegree[dest]++;\n    }\n    const q = [];\n    for (let i = 0; i < numCourses; i++) if (inDegree[i] === 0) q.push(i);\n    let count = 0;\n    while (q.length > 0) {\n        const course = q.shift();\n        count++;\n        for (const next of adj[course]) {\n            if (--inDegree[next] === 0) q.push(next);\n        }\n    }\n    return count === numCourses;\n}"
        }
      }
    }
  },
  "dijkstra": {
    "questionId": "archetype-dijkstra",
    "pattern": "PriorityQueue Min-Heap Relaxation",
    "intuition": [
      "Initialize distance array dist with infinity; dist[src] = 0.",
      "Push (0, src) to a Min-PriorityQueue.",
      "While PQ is non-empty, poll (d, u). If d > dist[u], continue (stale entry).",
      "For each neighbor (v, weight), if dist[u] + weight < dist[v], update dist[v] and push (dist[v], v)."
    ],
    "pseudocode": [
      "FUNCTION dijkstra(V, adj, src):",
      "  dist = Array(V, INF); dist[src] = 0",
      "  pq = MinHeap([(0, src)])",
      "  WHILE pq is not empty:",
      "    (d, u) = pq.poll()",
      "    IF d > dist[u]: CONTINUE",
      "    FOR (v, w) IN adj[u]:",
      "      IF dist[u] + w < dist[v]:",
      "        dist[v] = dist[u] + w",
      "        pq.offer((dist[v], v))",
      "  RETURN dist"
    ],
    "timeComplexity": "O((V + E) log V)",
    "spaceComplexity": "O(V + E)",
    "complexityExplanation": "Greedily extracts the unvisited vertex with smallest current distance using a Min-Heap, relaxing adjacent edges in O((V + E) log V).",
    "edgeCases": [
      "Disconnected graph (unreachable nodes have dist = INF)",
      "Single node graph",
      "Multiple shortest paths with equal weight"
    ],
    "code": {
      "java": "import java.util.*;\n\npublic class Solution {\n    public int[] dijkstra(int V, ArrayList<ArrayList<ArrayList<Integer>>> adj, int src) {\n        int[] dist = new int[V];\n        Arrays.fill(dist, Integer.MAX_VALUE);\n        dist[src] = 0;\n        PriorityQueue<int[]> pq = new PriorityQueue<>(Comparator.comparingInt(a -> a[0]));\n        pq.offer(new int[]{0, src});\n        while (!pq.isEmpty()) {\n            int[] top = pq.poll();\n            int d = top[0], u = top[1];\n            if (d > dist[u]) continue;\n            for (ArrayList<Integer> edge : adj.get(u)) {\n                int v = edge.get(0), w = edge.get(1);\n                if (dist[u] + w < dist[v]) {\n                    dist[v] = dist[u] + w;\n                    pq.offer(new int[]{dist[v], v});\n                }\n            }\n        }\n        return dist;\n    }\n}",
      "python": "import heapq\n\nclass Solution:\n    def dijkstra(self, V: int, adj: list[list[list[int]]], src: int) -> list[int]:\n        dist = [float('inf')] * V\n        dist[src] = 0\n        pq = [(0, src)]\n        while pq:\n            d, u = heapq.heappop(pq)\n            if d > dist[u]: continue\n            for v, w in adj[u]:\n                if dist[u] + w < dist[v]:\n                    dist[v] = dist[u] + w\n                    heapq.heappush(pq, (dist[v], v))\n        return dist",
      "cpp": "#include <vector>\n#include <queue>\n#include <climits>\n\nclass Solution {\npublic:\n    std::vector<int> dijkstra(int V, std::vector<std::vector<std::vector<int>>>& adj, int src) {\n        std::vector<int> dist(V, INT_MAX);\n        dist[src] = 0;\n        std::priority_queue<std::pair<int, int>, std::vector<std::pair<int, int>>, std::greater<>> pq;\n        pq.push({0, src});\n        while (!pq.empty()) {\n            auto [d, u] = pq.top(); pq.pop();\n            if (d > dist[u]) continue;\n            for (auto& edge : adj[u]) {\n                int v = edge[0], w = edge[1];\n                if (dist[u] + w < dist[v]) {\n                    dist[v] = dist[u] + w;\n                    pq.push({dist[v], v});\n                }\n            }\n        }\n        return dist;\n    }\n};",
      "javascript": "function dijkstra(V, adj, src) {\n    const dist = new Array(V).fill(Infinity);\n    dist[src] = 0;\n    const visited = new Array(V).fill(false);\n    for (let i = 0; i < V; i++) {\n        let u = -1;\n        for (let j = 0; j < V; j++) {\n            if (!visited[j] && (u === -1 || dist[j] < dist[u])) u = j;\n        }\n        if (u === -1 || dist[u] === Infinity) break;\n        visited[u] = true;\n        for (const [v, w] of adj[u]) {\n            if (dist[u] + w < dist[v]) dist[v] = dist[u] + w;\n        }\n    }\n    return dist;\n}"
    },
    "approaches": {
      "brute": {
        "name": "Brute Force (Bellman-Ford V-1 Edge Relaxations)",
        "tier": "brute",
        "badge": "\ud83e\udd49 Brute Force",
        "intuition": [
          "Bellman-Ford baseline."
        ],
        "timeComplexity": "O(V * E)",
        "spaceComplexity": "O(V)",
        "complexityExplanation": "Relaxes all E edges V-1 times sequentially.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int[] dijkstraBrute(int V, ArrayList<ArrayList<ArrayList<Integer>>> adj, int src) {\n        int[] dist = new int[V];\n        Arrays.fill(dist, Integer.MAX_VALUE);\n        dist[src] = 0;\n        for (int i = 0; i < V - 1; i++) {\n            for (int u = 0; u < V; u++) {\n                if (dist[u] == Integer.MAX_VALUE) continue;\n                for (ArrayList<Integer> edge : adj.get(u)) {\n                    int v = edge.get(0), w = edge.get(1);\n                    if (dist[u] + w < dist[v]) dist[v] = dist[u] + w;\n                }\n            }\n        }\n        return dist;\n    }\n}",
          "python": "class Solution:\n    def dijkstraBrute(self, V: int, adj: list[list[list[int]]], src: int) -> list[int]:\n        dist = [float('inf')] * V\n        dist[src] = 0\n        for _ in range(V - 1):\n            for u in range(V):\n                if dist[u] == float('inf'): continue\n                for v, w in adj[u]:\n                    if dist[u] + w < dist[v]: dist[v] = dist[u] + w\n        return dist",
          "cpp": "#include <vector>\n#include <climits>\n\nclass Solution {\npublic:\n    std::vector<int> dijkstraBrute(int V, std::vector<std::vector<std::vector<int>>>& adj, int src) {\n        std::vector<int> dist(V, INT_MAX);\n        dist[src] = 0;\n        for (int i = 0; i < V - 1; i++) {\n            for (int u = 0; u < V; u++) {\n                if (dist[u] == INT_MAX) continue;\n                for (auto& edge : adj[u]) {\n                    int v = edge[0], w = edge[1];\n                    if (dist[u] + w < dist[v]) dist[v] = dist[u] + w;\n                }\n            }\n        }\n        return dist;\n    }\n};",
          "javascript": "function dijkstraBrute(V, adj, src) {\n    const dist = new Array(V).fill(Infinity);\n    dist[src] = 0;\n    for (let i = 0; i < V - 1; i++) {\n        for (let u = 0; u < V; u++) {\n            if (dist[u] === Infinity) continue;\n            for (const [v, w] of adj[u]) {\n                if (dist[u] + w < dist[v]) dist[v] = dist[u] + w;\n            }\n        }\n    }\n    return dist;\n}"
        }
      },
      "better": {
        "name": "Better (Linear Array Scan Dijkstra)",
        "tier": "better",
        "badge": "\ud83e\udd48 Better",
        "intuition": [
          "Dense graph O(V^2) scan."
        ],
        "timeComplexity": "O(V\u00b2)",
        "spaceComplexity": "O(V)",
        "complexityExplanation": "Scans array linearly for minimum distance node at each of V iterations (optimal for dense graphs).",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int[] dijkstraBetter(int V, ArrayList<ArrayList<ArrayList<Integer>>> adj, int src) {\n        int[] dist = new int[V];\n        boolean[] vis = new boolean[V];\n        Arrays.fill(dist, Integer.MAX_VALUE);\n        dist[src] = 0;\n        for (int i = 0; i < V; i++) {\n            int u = -1;\n            for (int j = 0; j < V; j++) {\n                if (!vis[j] && (u == -1 || dist[j] < dist[u])) u = j;\n            }\n            if (u == -1 || dist[u] == Integer.MAX_VALUE) break;\n            vis[u] = true;\n            for (ArrayList<Integer> edge : adj.get(u)) {\n                int v = edge.get(0), w = edge.get(1);\n                if (dist[u] + w < dist[v]) dist[v] = dist[u] + w;\n            }\n        }\n        return dist;\n    }\n}",
          "python": "class Solution:\n    def dijkstraBetter(self, V: int, adj: list[list[list[int]]], src: int) -> list[int]:\n        dist = [float('inf')] * V\n        dist[src] = 0\n        vis = [False] * V\n        for _ in range(V):\n            u = -1\n            for j in range(V):\n                if not vis[j] and (u == -1 or dist[j] < dist[u]): u = j\n            if u == -1 or dist[u] == float('inf'): break\n            vis[u] = True\n            for v, w in adj[u]:\n                if dist[u] + w < dist[v]: dist[v] = dist[u] + w\n        return dist",
          "cpp": "#include <vector>\n#include <climits>\n\nclass Solution {\npublic:\n    std::vector<int> dijkstraBetter(int V, std::vector<std::vector<std::vector<int>>>& adj, int src) {\n        std::vector<int> dist(V, INT_MAX);\n        std::vector<bool> vis(V, false);\n        dist[src] = 0;\n        for (int i = 0; i < V; i++) {\n            int u = -1;\n            for (int j = 0; j < V; j++) {\n                if (!vis[j] && (u == -1 || dist[j] < dist[u])) u = j;\n            }\n            if (u == -1 || dist[u] == INT_MAX) break;\n            vis[u] = true;\n            for (auto& edge : adj[u]) {\n                int v = edge[0], w = edge[1];\n                if (dist[u] + w < dist[v]) dist[v] = dist[u] + w;\n            }\n        }\n        return dist;\n    }\n};",
          "javascript": "function dijkstraBetter(V, adj, src) {\n    const dist = new Array(V).fill(Infinity);\n    const vis = new Array(V).fill(false);\n    dist[src] = 0;\n    for (let i = 0; i < V; i++) {\n        let u = -1;\n        for (let j = 0; j < V; j++) {\n            if (!vis[j] && (u === -1 || dist[j] < dist[u])) u = j;\n        }\n        if (u === -1 || dist[u] === Infinity) break;\n        vis[u] = true;\n        for (const [v, w] of adj[u]) {\n            if (dist[u] + w < dist[v]) dist[v] = dist[u] + w;\n        }\n    }\n    return dist;\n}"
        }
      },
      "optimal": {
        "name": "Optimal (PriorityQueue Min-Heap Relaxation)",
        "tier": "optimal",
        "badge": "\ud83e\udd47 Optimal",
        "intuition": [
          "Initialize distance array dist with infinity; dist[src] = 0.",
          "Push (0, src) to a Min-PriorityQueue.",
          "While PQ is non-empty, poll (d, u). If d > dist[u], continue (stale entry).",
          "For each neighbor (v, weight), if dist[u] + weight < dist[v], update dist[v] and push (dist[v], v)."
        ],
        "pseudocode": [
          "FUNCTION dijkstra(V, adj, src):",
          "  dist = Array(V, INF); dist[src] = 0",
          "  pq = MinHeap([(0, src)])",
          "  WHILE pq is not empty:",
          "    (d, u) = pq.poll()",
          "    IF d > dist[u]: CONTINUE",
          "    FOR (v, w) IN adj[u]:",
          "      IF dist[u] + w < dist[v]:",
          "        dist[v] = dist[u] + w",
          "        pq.offer((dist[v], v))",
          "  RETURN dist"
        ],
        "timeComplexity": "O((V + E) log V)",
        "spaceComplexity": "O(V + E)",
        "complexityExplanation": "Greedily extracts the unvisited vertex with smallest current distance using a Min-Heap, relaxing adjacent edges in O((V + E) log V).",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int[] dijkstra(int V, ArrayList<ArrayList<ArrayList<Integer>>> adj, int src) {\n        int[] dist = new int[V];\n        Arrays.fill(dist, Integer.MAX_VALUE);\n        dist[src] = 0;\n        PriorityQueue<int[]> pq = new PriorityQueue<>(Comparator.comparingInt(a -> a[0]));\n        pq.offer(new int[]{0, src});\n        while (!pq.isEmpty()) {\n            int[] top = pq.poll();\n            int d = top[0], u = top[1];\n            if (d > dist[u]) continue;\n            for (ArrayList<Integer> edge : adj.get(u)) {\n                int v = edge.get(0), w = edge.get(1);\n                if (dist[u] + w < dist[v]) {\n                    dist[v] = dist[u] + w;\n                    pq.offer(new int[]{dist[v], v});\n                }\n            }\n        }\n        return dist;\n    }\n}",
          "python": "import heapq\n\nclass Solution:\n    def dijkstra(self, V: int, adj: list[list[list[int]]], src: int) -> list[int]:\n        dist = [float('inf')] * V\n        dist[src] = 0\n        pq = [(0, src)]\n        while pq:\n            d, u = heapq.heappop(pq)\n            if d > dist[u]: continue\n            for v, w in adj[u]:\n                if dist[u] + w < dist[v]:\n                    dist[v] = dist[u] + w\n                    heapq.heappush(pq, (dist[v], v))\n        return dist",
          "cpp": "#include <vector>\n#include <queue>\n#include <climits>\n\nclass Solution {\npublic:\n    std::vector<int> dijkstra(int V, std::vector<std::vector<std::vector<int>>>& adj, int src) {\n        std::vector<int> dist(V, INT_MAX);\n        dist[src] = 0;\n        std::priority_queue<std::pair<int, int>, std::vector<std::pair<int, int>>, std::greater<>> pq;\n        pq.push({0, src});\n        while (!pq.empty()) {\n            auto [d, u] = pq.top(); pq.pop();\n            if (d > dist[u]) continue;\n            for (auto& edge : adj[u]) {\n                int v = edge[0], w = edge[1];\n                if (dist[u] + w < dist[v]) {\n                    dist[v] = dist[u] + w;\n                    pq.push({dist[v], v});\n                }\n            }\n        }\n        return dist;\n    }\n};",
          "javascript": "function dijkstra(V, adj, src) {\n    const dist = new Array(V).fill(Infinity);\n    dist[src] = 0;\n    const visited = new Array(V).fill(false);\n    for (let i = 0; i < V; i++) {\n        let u = -1;\n        for (let j = 0; j < V; j++) {\n            if (!visited[j] && (u === -1 || dist[j] < dist[u])) u = j;\n        }\n        if (u === -1 || dist[u] === Infinity) break;\n        visited[u] = true;\n        for (const [v, w] of adj[u]) {\n            if (dist[u] + w < dist[v]) dist[v] = dist[u] + w;\n        }\n    }\n    return dist;\n}"
        }
      }
    }
  }
};
