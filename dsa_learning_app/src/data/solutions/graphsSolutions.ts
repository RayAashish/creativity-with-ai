import { ProblemSolution } from '../../types/dsa';

export const GRAPHS_SOLUTIONS: Record<string, ProblemSolution> = {
  'grp-5': {
    questionId: 'grp-5',
    pattern: '2D Grid Flood Fill (BFS / DFS Connected Components)',
    intuition: [
      'An island is formed by horizontally or vertically connected "1"s surrounded by "0"s.',
      'Iterate through every cell in the grid.',
      'Whenever we hit a cell with `"1"`, we have discovered a new island: increment our `islandCount++`.',
      'Immediately trigger a DFS or BFS flood-fill starting from that cell to "sink" the entire island (flip all connected `"1"`s to `"0"` or visited).',
      'This guarantees that each land cell is visited once and prevents double-counting.'
    ],
    pseudocode: [
      'FUNCTION numIslands(grid):',
      '  count = 0',
      '  FOR r from 0 TO rows - 1:',
      '    FOR c from 0 TO cols - 1:',
      '      IF grid[r][c] == "1":',
      '        count++',
      '        dfsSink(grid, r, c)',
      '  RETURN count',
      'FUNCTION dfsSink(grid, r, c):',
      '  IF out of bounds OR grid[r][c] != "1": RETURN',
      '  grid[r][c] = "0" // sink land',
      '  dfsSink(grid, r + 1, c); dfsSink(grid, r - 1, c)',
      '  dfsSink(grid, r, c + 1); dfsSink(grid, r, c - 1)'
    ],
    timeComplexity: 'O(R * C)',
    spaceComplexity: 'O(R * C) recursion stack in worst case (grid completely filled with land)',
    complexityExplanation: 'Every cell in the matrix is examined at most once.',
    edgeCases: ['Grid with all water (returns 0)', 'Grid with all land (returns 1)', 'Single cell grid ["1"] vs ["0"]'],
    code: {
      cpp: `// C++ Number of Islands (DFS Flood Fill)
#include <vector>

class Solution {
    void dfs(std::vector<std::vector<char>>& grid, int r, int c) {
        if (r < 0 || r >= grid.size() || c < 0 || c >= grid[0].size() || grid[r][c] != '1') {
            return;
        }
        grid[r][c] = '0'; // Sink current cell
        dfs(grid, r + 1, c);
        dfs(grid, r - 1, c);
        dfs(grid, r, c + 1);
        dfs(grid, r, c - 1);
    }
public:
    int numIslands(std::vector<std::vector<char>>& grid) {
        if (grid.empty()) return 0;
        int count = 0;
        for (int r = 0; r < grid.size(); ++r) {
            for (int c = 0; c < grid[0].size(); ++c) {
                if (grid[r][c] == '1') {
                    count++;
                    dfs(grid, r, c);
                }
            }
        }
        return count;
    }
};`,
      java: `// Java Number of Islands (DFS Flood Fill)
public class Solution {
    private void dfs(char[][] grid, int r, int c) {
        if (r < 0 || r >= grid.length || c < 0 || c >= grid[0].length || grid[r][c] != '1') {
            return;
        }
        grid[r][c] = '0'; // sink
        dfs(grid, r + 1, c);
        dfs(grid, r - 1, c);
        dfs(grid, r, c + 1);
        dfs(grid, r, c - 1);
    }

    public int numIslands(char[][] grid) {
        if (grid == null || grid.length == 0) return 0;
        int count = 0;
        for (int r = 0; r < grid.length; r++) {
            for (int c = 0; c < grid[0].length; c++) {
                if (grid[r][c] == '1') {
                    count++;
                    dfs(grid, r, c);
                }
            }
        }
        return count;
    }
}`,
      python: `# Python Number of Islands (DFS Flood Fill)
class Solution:
    def numIslands(self, grid: list[list[str]]) -> int:
        if not grid:
            return 0
        rows, cols = len(grid), len(grid[0])
        count = 0
        
        def dfs(r, c):
            if r < 0 or r >= rows or c < 0 or c >= cols or grid[r][c] != '1':
                return
            grid[r][c] = '0' # sink
            dfs(r + 1, c)
            dfs(r - 1, c)
            dfs(r, c + 1)
            dfs(r, c - 1)
            
        for r in range(rows):
            for c in range(cols):
                if grid[r][c] == '1':
                    count += 1
                    dfs(r, c)
                    
        return count`,
      javascript: `// JavaScript Number of Islands (DFS Flood Fill)
function numIslands(grid) {
  if (!grid || grid.length === 0) return 0;
  const rows = grid.length;
  const cols = grid[0].length;
  let count = 0;

  function dfs(r, c) {
    if (r < 0 || r >= rows || c < 0 || c >= cols || grid[r][c] !== '1') {
      return;
    }
    grid[r][c] = '0'; // sink land
    dfs(r + 1, c);
    dfs(r - 1, c);
    dfs(r, c + 1);
    dfs(r, c - 1);
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === '1') {
        count++;
        dfs(r, c);
      }
    }
  }
  return count;
}`
    },
    interviewProTips: [
      'If mutating the original input grid is disallowed by the interviewer, maintain a boolean `visited[r][c]` 2D array or Set of coordinate strings instead.'
    ]
  },

  'grp-6': {
    questionId: 'grp-6',
    pattern: "Topological Sort (Kahn's In-degree BFS / Cycle Detection in DAG)",
    intuition: [
      'Courses and their prerequisites form a directed graph where an edge `u -> v` means course `u` is a prerequisite for `v`.',
      'A student can finish all courses if and only if the directed graph contains NO cycles (Directed Acyclic Graph - DAG).',
      "Use Kahn's Algorithm (BFS Topological Sort):",
      '1. Compute the in-degree (number of prerequisite dependencies) for every node.',
      '2. Enqueue all courses with in-degree == 0 (no prerequisites needed).',
      '3. While queue is not empty, dequeue course `curr`, increment `processedCourses++`, and decrement in-degree for all adjacent neighbors.',
      '4. If any neighbor reaches in-degree == 0, enqueue it.',
      '5. If `processedCourses == numCourses`, all courses can be taken; otherwise, a cycle exists!'
    ],
    pseudocode: [
      'FUNCTION canFinish(numCourses, prerequisites):',
      '  adj = adjacency list, inDegree = array of size numCourses (all 0)',
      '  FOR [dest, src] IN prerequisites:',
      '    adj[src].push(dest); inDegree[dest]++',
      '  queue = [nodes where inDegree == 0]',
      '  count = 0',
      '  WHILE queue is not empty:',
      '    curr = queue.shift()',
      '    count++',
      '    FOR neighbor IN adj[curr]:',
      '      inDegree[neighbor]--',
      '      IF inDegree[neighbor] == 0: queue.push(neighbor)',
      '  RETURN count == numCourses'
    ],
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V + E)',
    complexityExplanation: 'V = numCourses, E = prerequisites. Building graph and processing queue takes linear time.',
    edgeCases: ['Graph with disconnected components', 'Self-dependency prerequisite [1, 1]', 'Already acyclic linear chain'],
    code: {
      cpp: `// C++ Course Schedule (Kahn's BFS Topological Sort)
#include <vector>
#include <queue>

bool canFinish(int numCourses, std::vector<std::vector<int>>& prerequisites) {
    std::vector<std::vector<int>> adj(numCourses);
    std::vector<int> inDegree(numCourses, 0);
    for (const auto& edge : prerequisites) {
        adj[edge[1]].push_back(edge[0]);
        inDegree[edge[0]]++;
    }
    std::queue<int> q;
    for (int i = 0; i < numCourses; ++i) {
        if (inDegree[i] == 0) q.push(i);
    }
    int count = 0;
    while (!q.empty()) {
        int curr = q.front();
        q.pop();
        count++;
        for (int neighbor : adj[curr]) {
            if (--inDegree[neighbor] == 0) {
                q.push(neighbor);
            }
        }
    }
    return count == numCourses;
}`,
      java: `// Java Course Schedule (Kahn's BFS Topological Sort)
import java.util.*;

public class Solution {
    public boolean canFinish(int numCourses, int[][] prerequisites) {
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < numCourses; i++) adj.add(new ArrayList<>());
        int[] inDegree = new int[numCourses];

        for (int[] p : prerequisites) {
            adj.get(p[1]).add(p[0]);
            inDegree[p[0]]++;
        }

        Queue<Integer> queue = new LinkedList<>();
        for (int i = 0; i < numCourses; i++) {
            if (inDegree[i] == 0) queue.offer(i);
        }

        int count = 0;
        while (!queue.isEmpty()) {
            int curr = queue.poll();
            count++;
            for (int neighbor : adj.get(curr)) {
                if (--inDegree[neighbor] == 0) {
                    queue.offer(neighbor);
                }
            }
        }
        return count == numCourses;
    }
}`,
      python: `# Python Course Schedule (Kahn's BFS Topological Sort)
from collections import deque

class Solution:
    def canFinish(self, numCourses: int, prerequisites: list[list[int]]) -> bool:
        adj = [[] for _ in range(numCourses)]
        in_degree = [0] * numCourses
        
        for dest, src in prerequisites:
            adj[src].append(dest)
            in_degree[dest] += 1
            
        queue = deque([i for i in range(numCourses) if in_degree[i] == 0])
        count = 0
        
        while queue:
            curr = queue.popleft()
            count += 1
            for neighbor in adj[curr]:
                in_degree[neighbor] -= 1
                if in_degree[neighbor] == 0:
                    queue.append(neighbor)
                    
        return count == numCourses`,
      javascript: `// JavaScript Course Schedule (Kahn's BFS Topological Sort)
function canFinish(numCourses, prerequisites) {
  const adj = Array.from({ length: numCourses }, () => []);
  const inDegree = new Array(numCourses).fill(0);

  for (const [dest, src] of prerequisites) {
    adj[src].push(dest);
    inDegree[dest]++;
  }

  const queue = [];
  for (let i = 0; i < numCourses; i++) {
    if (inDegree[i] === 0) queue.push(i);
  }

  let count = 0;
  while (queue.length > 0) {
    const curr = queue.shift();
    count++;
    for (const neighbor of adj[curr]) {
      inDegree[neighbor]--;
      if (inDegree[neighbor] === 0) {
        queue.push(neighbor);
      }
    }
  }

  return count === numCourses;
}`
    },
    interviewProTips: [
      'Topological sort is one of the most frequently tested graph patterns. If asked to return the order of courses (Course Schedule II), store each popped node in an array and return it if `count == numCourses`.'
    ]
  }
};
