import json

# Graphs (grp-7 to grp-44, 38 items)
grp_addl = [
  {
    "id": "grp-7",
    "title": "Minimum Step by Knight",
    "topic": "graphs",
    "difficulty": "Medium",
    "platform": "GeeksforGeeks",
    "url": "https://practice.geeksforgeeks.org/problems/steps-by-knight5927/1",
    "companies": ["Amazon", "Microsoft"],
    "description": "Find minimum steps knight takes to reach target position on N x N chessboard using BFS queue."
  },
  {
    "id": "grp-8",
    "title": "Flood Fill Algorithm",
    "topic": "graphs",
    "difficulty": "Easy",
    "platform": "LeetCode",
    "url": "https://leetcode.com/problems/flood-fill/",
    "companies": ["Amazon", "Google", "Microsoft"],
    "description": "Perform flood fill on 2D image starting from pixel (sr, sc) using DFS or BFS queue."
  },
  {
    "id": "grp-9",
    "title": "Clone a graph",
    "topic": "graphs",
    "difficulty": "Medium",
    "platform": "LeetCode",
    "url": "https://leetcode.com/problems/clone-graph/",
    "companies": ["Amazon", "Google", "Facebook", "Microsoft"],
    "description": "Given reference of node in connected undirected graph, return deep copy (clone) of graph using hash map."
  },
  {
    "id": "grp-10",
    "title": "Making wired Connections (Number of Operations to Make Network Connected)",
    "topic": "graphs",
    "difficulty": "Medium",
    "platform": "LeetCode",
    "url": "https://leetcode.com/problems/number-of-operations-to-make-network-connected/",
    "companies": ["Amazon"],
    "description": "Find minimum cable moves to connect all computers using Disjoint Set Union (DSU) or connected components count."
  },
  {
    "id": "grp-11",
    "title": "Word Ladder",
    "topic": "graphs",
    "difficulty": "Hard",
    "platform": "LeetCode",
    "url": "https://leetcode.com/problems/word-ladder/",
    "companies": ["Amazon", "Google", "Facebook"],
    "description": "Find the length of shortest transformation sequence from beginWord to endWord using Bidirectional BFS."
  },
  {
    "id": "grp-12",
    "title": "Dijkstra Algorithm",
    "topic": "graphs",
    "difficulty": "Medium",
    "platform": "GeeksforGeeks",
    "url": "https://practice.geeksforgeeks.org/problems/implementing-dijkstra-set-1-adjacency-matrix/1",
    "companies": ["Amazon", "Microsoft", "Google"],
    "description": "Find shortest paths from single source vertex to all other vertices in non-negative weighted graph using priority queue."
  },
  {
    "id": "grp-13",
    "title": "Implement Topological Sort",
    "topic": "graphs",
    "difficulty": "Medium",
    "platform": "GeeksforGeeks",
    "url": "https://practice.geeksforgeeks.org/problems/topological-sort/1",
    "companies": ["Amazon", "Microsoft", "Flipkart"],
    "description": "Produce linear ordering of vertices in Directed Acyclic Graph (DAG) using Kahn's algorithm or DFS stack."
  },
  {
    "id": "grp-14",
    "title": "Minimum time taken by each job to be completed given by a DAG",
    "topic": "graphs",
    "difficulty": "Medium",
    "platform": "GeeksforGeeks",
    "url": "https://www.geeksforgeeks.org/minimum-time-taken-by-each-job-to-be-completed-given-by-a-directed-acyclic-graph/",
    "companies": ["Amazon"],
    "description": "Find minimum time required to complete each job given prerequisites using in-degree topological level queue."
  },
  {
    "id": "grp-15",
    "title": "Course Schedule (Detect cycle in directed graph / task dependencies)",
    "topic": "graphs",
    "difficulty": "Medium",
    "platform": "LeetCode",
    "url": "https://leetcode.com/problems/course-schedule/",
    "companies": ["Amazon", "Google", "Facebook", "Microsoft"],
    "description": "Determine if you can finish all courses given prerequisite dependencies using topological sort cycle detection."
  },
  {
    "id": "grp-16",
    "title": "Find the no. of Islands",
    "topic": "graphs",
    "difficulty": "Medium",
    "platform": "LeetCode",
    "url": "https://leetcode.com/problems/number-of-islands/",
    "companies": ["Amazon", "Google", "Microsoft", "Facebook", "Bloomberg"],
    "description": "Count number of connected 4-directional islands formed by '1's (land) surrounded by '0's (water) using DFS/BFS."
  },
  {
    "id": "grp-17",
    "title": "Alien Dictionary",
    "topic": "graphs",
    "difficulty": "Hard",
    "platform": "GeeksforGeeks",
    "url": "https://practice.geeksforgeeks.org/problems/alien-dictionary/1",
    "companies": ["Amazon", "Google", "Microsoft", "Facebook"],
    "description": "Derive alphabetical order of characters in alien language given sorted dictionary using topological sort on DAG."
  },
  {
    "id": "grp-18",
    "title": "Implement Kruskal's Algorithm",
    "topic": "graphs",
    "difficulty": "Medium",
    "platform": "GeeksforGeeks",
    "url": "https://practice.geeksforgeeks.org/problems/minimum-spanning-tree/1",
    "companies": ["Amazon", "Microsoft", "Google"],
    "description": "Find Minimum Spanning Tree of connected edge-weighted graph using Disjoint Set Union (Union by Rank & Path Compression)."
  },
  {
    "id": "grp-19",
    "title": "Implement Prim's Algorithm",
    "topic": "graphs",
    "difficulty": "Medium",
    "platform": "GeeksforGeeks",
    "url": "https://practice.geeksforgeeks.org/problems/minimum-spanning-tree/1",
    "companies": ["Amazon", "Microsoft"],
    "description": "Find Minimum Spanning Tree using Prim's greedy priority queue approach growing tree from seed vertex."
  },
  {
    "id": "grp-20",
    "title": "Total number of Spanning Trees in a Graph",
    "topic": "graphs",
    "difficulty": "Hard",
    "platform": "GeeksforGeeks",
    "url": "https://www.geeksforgeeks.org/total-number-spanning-trees-graph/",
    "companies": ["Amazon"],
    "description": "Compute total number of spanning trees in undirected graph using Kirchhoff's Matrix Tree Theorem."
  },
  {
    "id": "grp-21",
    "title": "Implement Bellman Ford Algorithm",
    "topic": "graphs",
    "difficulty": "Medium",
    "platform": "GeeksforGeeks",
    "url": "https://practice.geeksforgeeks.org/problems/distance-from-the-source-bellman-ford-algorithm/1",
    "companies": ["Amazon", "Microsoft"],
    "description": "Find shortest paths from single source vertex with negative edge weights and detect negative weight cycles."
  },
  {
    "id": "grp-22",
    "title": "Implement Floyd Warshall Algorithm",
    "topic": "graphs",
    "difficulty": "Medium",
    "platform": "GeeksforGeeks",
    "url": "https://practice.geeksforgeeks.org/problems/implementing-floyd-warshall2042/1",
    "companies": ["Amazon", "Microsoft"],
    "description": "Find all-pairs shortest paths between every pair of vertices in weighted graph in O(V^3) time."
  },
  {
    "id": "grp-23",
    "title": "Travelling Salesman Problem",
    "topic": "graphs",
    "difficulty": "Hard",
    "platform": "GeeksforGeeks",
    "url": "https://practice.geeksforgeeks.org/problems/travelling-salesman-problem2732/1",
    "companies": ["Amazon"],
    "description": "Find minimum cost Hamiltonian cycle visiting every city exactly once and returning to origin using DP with bitmask."
  },
  {
    "id": "grp-24",
    "title": "Graph Colouring Problem",
    "topic": "graphs",
    "difficulty": "Medium",
    "platform": "GeeksforGeeks",
    "url": "https://www.geeksforgeeks.org/graph-coloring-applications/",
    "companies": ["Amazon"],
    "description": "Assign colors to vertices such that no two adjacent vertices share the same color using greedy Welsh-Powell."
  },
  {
    "id": "grp-25",
    "title": "Snake and Ladder Problem",
    "topic": "graphs",
    "difficulty": "Medium",
    "platform": "LeetCode",
    "url": "https://leetcode.com/problems/snakes-and-ladders/",
    "companies": ["Amazon", "Microsoft", "Google"],
    "description": "Find least number of dice rolls required to reach destination square 100 from square 1 using BFS."
  },
  {
    "id": "grp-26",
    "title": "Find bridge in a graph (Critical Connections in a Network)",
    "topic": "graphs",
    "difficulty": "Hard",
    "platform": "LeetCode",
    "url": "https://leetcode.com/problems/critical-connections-in-a-network/",
    "companies": ["Amazon", "Facebook"],
    "description": "Find all edges in undirected connected graph whose removal disconnects the graph using Tarjan's discovery and low times."
  },
  {
    "id": "grp-27",
    "title": "Count Strongly Connected Components (Kosaraju's Algo)",
    "topic": "graphs",
    "difficulty": "Medium",
    "platform": "GeeksforGeeks",
    "url": "https://practice.geeksforgeeks.org/problems/strongly-connected-components-kosarajus-algo/1",
    "companies": ["Amazon", "Microsoft"],
    "description": "Find number of strongly connected components in directed graph using Kosaraju's two-pass DFS on transposed graph."
  },
  {
    "id": "grp-28",
    "title": "Check whether a graph is Bipartite or Not",
    "topic": "graphs",
    "difficulty": "Medium",
    "platform": "LeetCode",
    "url": "https://leetcode.com/problems/is-graph-bipartite/",
    "companies": ["Amazon", "Google", "Facebook"],
    "description": "Determine if graph can be partitioned into two independent sets using 2-color BFS/DFS."
  },
  {
    "id": "grp-29",
    "title": "Detect Negative cycle in a graph",
    "topic": "graphs",
    "difficulty": "Medium",
    "platform": "GeeksforGeeks",
    "url": "https://practice.geeksforgeeks.org/problems/negative-weight-cycle3504/1",
    "companies": ["Amazon"],
    "description": "Check if directed graph contains negative weight cycle using Bellman-Ford Nth iteration check."
  },
  {
    "id": "grp-30",
    "title": "Longest Path in a Directed Acyclic Graph",
    "topic": "graphs",
    "difficulty": "Hard",
    "platform": "GeeksforGeeks",
    "url": "https://www.geeksforgeeks.org/find-longest-path-directed-acyclic-graph/",
    "companies": ["Amazon"],
    "description": "Find longest path from given source in weighted DAG in O(V+E) time using topological sorting relaxation."
  },
  {
    "id": "grp-31",
    "title": "Journey to the Moon",
    "topic": "graphs",
    "difficulty": "Medium",
    "platform": "HackerRank",
    "url": "https://www.hackerrank.com/challenges/journey-to-the-moon/problem",
    "companies": ["Amazon"],
    "description": "Compute number of pairs of astronauts from different countries using connected components sizes."
  },
  {
    "id": "grp-32",
    "title": "Minimum edges to reverse to make path from source to destination",
    "topic": "graphs",
    "difficulty": "Hard",
    "platform": "GeeksforGeeks",
    "url": "https://www.geeksforgeeks.org/minimum-edges-reverse-make-path-source-destination/",
    "companies": ["Amazon"],
    "description": "Assign weight 0 to existing edges and 1 to reversed edges, then apply 0-1 BFS with deque."
  },
  {
    "id": "grp-33",
    "title": "Paths to travel each nodes using each edge (Eulerian Circuit)",
    "topic": "graphs",
    "difficulty": "Hard",
    "platform": "GeeksforGeeks",
    "url": "https://www.geeksforgeeks.org/euler-circuit-directed-graph/",
    "companies": ["Amazon"],
    "description": "Check if directed graph contains Eulerian Circuit using in-degree == out-degree and strong connectivity."
  },
  {
    "id": "grp-34",
    "title": "Oliver and the Game (Euler Tour / Trees in Graph)",
    "topic": "graphs",
    "difficulty": "Medium",
    "platform": "HackerEarth",
    "url": "https://www.hackerearth.com/practice/algorithms/graphs/topological-sort/practice-problems/algorithm/oliver-and-the-game-3/",
    "companies": ["Amazon"],
    "description": "Determine if node X is an ancestor of node Y using entry and exit timestamps from Euler tour DFS."
  },
  {
    "id": "grp-35",
    "title": "Water Jug problem using BFS",
    "topic": "graphs",
    "difficulty": "Medium",
    "platform": "LeetCode",
    "url": "https://leetcode.com/problems/water-and-jug-problem/",
    "companies": ["Amazon", "Microsoft", "Google"],
    "description": "Determine whether target amount can be measured using two jugs with capacities x and y using GCD or state BFS."
  },
  {
    "id": "grp-36",
    "title": "Find if there is a path of more than k length from a source",
    "topic": "graphs",
    "difficulty": "Hard",
    "platform": "GeeksforGeeks",
    "url": "https://www.geeksforgeeks.org/find-if-there-is-a-path-of-more-than-k-length-from-a-source/",
    "companies": ["Amazon"],
    "description": "Find if simple path from source exists with length >= k using backtracking DFS with visited tracking."
  },
  {
    "id": "grp-37",
    "title": "M-Colouring Problem",
    "topic": "graphs",
    "difficulty": "Medium",
    "platform": "GeeksforGeeks",
    "url": "https://practice.geeksforgeeks.org/problems/m-coloring-problem-1587115620/1",
    "companies": ["Amazon", "Microsoft"],
    "description": "Check if graph vertices can be colored using M colors such that adjacent vertices have distinct colors."
  },
  {
    "id": "grp-38",
    "title": "Minimum steps to reach target by a Knight (Bidirectional BFS)",
    "topic": "graphs",
    "difficulty": "Medium",
    "platform": "GeeksforGeeks",
    "url": "https://practice.geeksforgeeks.org/problems/steps-by-knight5927/1",
    "companies": ["Amazon"],
    "description": "Find shortest path of knight on chessboard using Bidirectional Breadth-First Search."
  },
  {
    "id": "grp-39",
    "title": "Two Clique Problem",
    "topic": "graphs",
    "difficulty": "Hard",
    "platform": "GeeksforGeeks",
    "url": "https://www.geeksforgeeks.org/two-clique-problem-check-can-divided-two-cliques/",
    "companies": ["Amazon"],
    "description": "Check if graph can be partitioned into two cliques by checking if complement graph is bipartite."
  },
  {
    "id": "grp-40",
    "title": "Tarjan's Algorithm for Strongly Connected Components",
    "topic": "graphs",
    "difficulty": "Hard",
    "platform": "GeeksforGeeks",
    "url": "https://practice.geeksforgeeks.org/problems/strongly-connected-component-tarjanss-algo-1587115621/1",
    "companies": ["Amazon", "Google"],
    "description": "Find strongly connected components of directed graph in single DFS pass using discovery and low times stack."
  },
  {
    "id": "grp-41",
    "title": "Minimum Cost Path in a Grid (Dijkstra on Grid)",
    "topic": "graphs",
    "difficulty": "Hard",
    "platform": "GeeksforGeeks",
    "url": "https://practice.geeksforgeeks.org/problems/minimum-cost-path3833/1",
    "companies": ["Amazon", "Google", "Samsung"],
    "description": "Find min cost path from top-left to bottom-right moving in 4 directions on weighted grid using Dijkstra."
  },
  {
    "id": "grp-42",
    "title": "Articulation Points (Cut Vertices) in a Graph",
    "topic": "graphs",
    "difficulty": "Hard",
    "platform": "GeeksforGeeks",
    "url": "https://practice.geeksforgeeks.org/problems/articulation-point-1/1",
    "companies": ["Amazon", "Microsoft"],
    "description": "Find all vertices whose removal increases connected components in graph using low time discovery DFS."
  },
  {
    "id": "grp-43",
    "title": "Find if an undirected graph has a cycle using Disjoint Set Union (DSU)",
    "topic": "graphs",
    "difficulty": "Medium",
    "platform": "GeeksforGeeks",
    "url": "https://practice.geeksforgeeks.org/problems/detect-cycle-using-dsu/1",
    "companies": ["Amazon"],
    "description": "Detect cycle in undirected graph by checking if two endpoints of an edge belong to same disjoint set."
  },
  {
    "id": "grp-44",
    "title": "Eulerian path and circuit for undirected graph",
    "topic": "graphs",
    "difficulty": "Medium",
    "platform": "GeeksforGeeks",
    "url": "https://practice.geeksforgeeks.org/problems/euler-circuit-and-path/1",
    "companies": ["Amazon"],
    "description": "Check if connected undirected graph has Eulerian path (2 odd degree vertices) or Eulerian circuit (0 odd degree vertices)."
  }
]

# Bit Manipulation (bit-4 to bit-15, 12 items)
bit_addl = [
  {
    "id": "bit-4",
    "title": "Count total set bits in all numbers from 1 to n",
    "topic": "bit-manipulation",
    "difficulty": "Medium",
    "platform": "GeeksforGeeks",
    "url": "https://practice.geeksforgeeks.org/problems/count-total-set-bits-1587115620/1",
    "companies": ["Amazon", "Microsoft"],
    "description": "Count total set bits in binary representation of all integers from 1 to N in O(log N) time."
  },
  {
    "id": "bit-5",
    "title": "Program to find whether a no is power of two",
    "topic": "bit-manipulation",
    "difficulty": "Easy",
    "platform": "LeetCode",
    "url": "https://leetcode.com/problems/power-of-two/",
    "companies": ["Amazon", "Google"],
    "description": "Check if an integer is a power of two using bitwise AND operation (n & (n - 1)) == 0 in O(1) time."
  },
  {
    "id": "bit-6",
    "title": "Find position of the only set bit",
    "topic": "bit-manipulation",
    "difficulty": "Easy",
    "platform": "GeeksforGeeks",
    "url": "https://practice.geeksforgeeks.org/problems/find-position-of-set-bit3706/1",
    "companies": ["Amazon"],
    "description": "Given a number having only one set bit, find the 1-based position of the bit using log2."
  },
  {
    "id": "bit-7",
    "title": "Copy set bits in a range",
    "topic": "bit-manipulation",
    "difficulty": "Easy",
    "platform": "GeeksforGeeks",
    "url": "https://practice.geeksforgeeks.org/problems/copy-set-bits-in-range0607/1",
    "companies": ["Amazon"],
    "description": "Copy set bits of integer y into x in the range [l, r] using a bitmask."
  },
  {
    "id": "bit-8",
    "title": "Divide two integers without using multiplication, division and mod operator",
    "topic": "bit-manipulation",
    "difficulty": "Medium",
    "platform": "LeetCode",
    "url": "https://leetcode.com/problems/divide-two-integers/",
    "companies": ["Amazon", "Microsoft", "Facebook"],
    "description": "Divide two integers using bitwise left shifts to subtract multiples of divisor in O(log N) time."
  },
  {
    "id": "bit-9",
    "title": "Calculate square of a number without using *, / and pow()",
    "topic": "bit-manipulation",
    "difficulty": "Medium",
    "platform": "GeeksforGeeks",
    "url": "https://www.geeksforgeeks.org/calculate-square-of-a-number-without-using-and-pow/",
    "companies": ["Amazon"],
    "description": "Compute n^2 using bit shifts: if n is even (n/2)^2 * 4, if odd 4*(n/2)^2 + 4*(n/2) + 1."
  },
  {
    "id": "bit-10",
    "title": "Power Set: Print all possible subsets of a string/set using bitwise operations",
    "topic": "bit-manipulation",
    "difficulty": "Easy",
    "platform": "GeeksforGeeks",
    "url": "https://practice.geeksforgeeks.org/problems/power-set4302/1",
    "companies": ["Amazon", "Microsoft"],
    "description": "Generate all 2^N subsets of string using numbers from 0 to 2^N-1 and bit checking."
  },
  {
    "id": "bit-11",
    "title": "Find the two non-repeating elements in an array of repeating elements",
    "topic": "bit-manipulation",
    "difficulty": "Medium",
    "platform": "LeetCode",
    "url": "https://leetcode.com/problems/single-number-iii/",
    "companies": ["Amazon", "Google", "Microsoft"],
    "description": "Find two numbers appearing once while all other numbers appear twice using overall XOR and lowest set bit."
  },
  {
    "id": "bit-12",
    "title": "Bit Difference (Sum of bit differences among all pairs)",
    "topic": "bit-manipulation",
    "difficulty": "Medium",
    "platform": "GeeksforGeeks",
    "url": "https://practice.geeksforgeeks.org/problems/find-sum-of-different-corresponding-bits-for-all-pairs4652/1",
    "companies": ["Amazon", "Google"],
    "description": "Calculate sum of bit differences between all pairs in array in O(32*N) time by counting set bits at each bit position."
  },
  {
    "id": "bit-13",
    "title": "Swap two numbers without using a temporary variable",
    "topic": "bit-manipulation",
    "difficulty": "Easy",
    "platform": "GeeksforGeeks",
    "url": "https://practice.geeksforgeeks.org/problems/swap-two-numbers3844/1",
    "companies": ["Amazon", "Samsung"],
    "description": "Swap two numbers in-place using XOR: a = a ^ b, b = a ^ b, a = a ^ b."
  },
  {
    "id": "bit-14",
    "title": "Find XOR of numbers from 1 to n",
    "topic": "bit-manipulation",
    "difficulty": "Easy",
    "platform": "GeeksforGeeks",
    "url": "https://www.geeksforgeeks.org/calculate-xor-1-n/",
    "companies": ["Amazon"],
    "description": "Calculate 1 ^ 2 ^ ... ^ n in O(1) time based on n % 4 pattern."
  },
  {
    "id": "bit-15",
    "title": "Reverse Bits of a 32-bit unsigned integer",
    "topic": "bit-manipulation",
    "difficulty": "Easy",
    "platform": "LeetCode",
    "url": "https://leetcode.com/problems/reverse-bits/",
    "companies": ["Amazon", "Apple", "Microsoft"],
    "description": "Reverse bits of a given 32 bits unsigned integer using bit shifting and masking."
  }
]

with open('scripts/grp_addl.json', 'w') as f:
    json.dump(grp_addl, f, indent=2)
print('Saved grp_addl:', len(grp_addl))

with open('scripts/bit_addl.json', 'w') as f:
    json.dump(bit_addl, f, indent=2)
print('Saved bit_addl:', len(bit_addl))
