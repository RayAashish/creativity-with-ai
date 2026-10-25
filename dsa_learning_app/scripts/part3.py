import json

# Greedy (grd-3 to grd-35, 33 items)
grd_addl = [
  {
    "id": "grd-3",
    "title": "Huffman Coding",
    "topic": "greedy",
    "difficulty": "Hard",
    "platform": "GeeksforGeeks",
    "url": "https://practice.geeksforgeeks.org/problems/huffman-encoding3345/1",
    "companies": ["Amazon", "Microsoft"],
    "description": "Construct optimal prefix-free binary tree for characters using Min-Heap priority queue."
  },
  {
    "id": "grd-4",
    "title": "Water Connection Problem",
    "topic": "greedy",
    "difficulty": "Medium",
    "platform": "GeeksforGeeks",
    "url": "https://practice.geeksforgeeks.org/problems/water-connection-problem5822/1",
    "companies": ["Amazon"],
    "description": "Find efficient water tank and tap placements for network of pipes using DFS path traversal."
  },
  {
    "id": "grd-5",
    "title": "Fractional Knapsack Problem",
    "topic": "greedy",
    "difficulty": "Medium",
    "platform": "GeeksforGeeks",
    "url": "https://practice.geeksforgeeks.org/problems/fractional-knapsack-1587115620/1",
    "companies": ["Amazon", "Microsoft"],
    "description": "Maximize knapsack value where items can be broken into fractional amounts by sorting value-to-weight ratio."
  },
  {
    "id": "grd-6",
    "title": "Greedy Algorithm to find minimum number of Coins",
    "topic": "greedy",
    "difficulty": "Easy",
    "platform": "GeeksforGeeks",
    "url": "https://practice.geeksforgeeks.org/problems/min-coin5549/1",
    "companies": ["Amazon", "Paytm"],
    "description": "Find minimum coins/notes to make value V for canonical currency denominations."
  },
  {
    "id": "grd-7",
    "title": "Maximum trains for which stoppage can be provided",
    "topic": "greedy",
    "difficulty": "Medium",
    "platform": "GeeksforGeeks",
    "url": "https://www.geeksforgeeks.org/maximum-trains-stoppage-can-provided/",
    "companies": ["Amazon"],
    "description": "Maximize train stoppages on N platforms without schedule collisions using greedy activity selection."
  },
  {
    "id": "grd-8",
    "title": "Minimum Platforms problem",
    "topic": "greedy",
    "difficulty": "Medium",
    "platform": "GeeksforGeeks",
    "url": "https://practice.geeksforgeeks.org/problems/minimum-platforms-1587115620/1",
    "companies": ["Amazon", "Microsoft", "Paytm", "Google"],
    "description": "Find minimum number of platforms required for railway station so no train waits using two-pointer sorting."
  },
  {
    "id": "grd-9",
    "title": "Buy Maximum Stocks if i stocks can be bought on i-th day",
    "topic": "greedy",
    "difficulty": "Medium",
    "platform": "GeeksforGeeks",
    "url": "https://www.geeksforgeeks.org/buy-maximum-stocks-stocks-can-bought-th-day/",
    "companies": ["Amazon"],
    "description": "Maximize stocks bought with budget K where on day i one can buy at most i stocks at price arr[i]."
  },
  {
    "id": "grd-10",
    "title": "Shop in Candy Store (Find min and max cash to buy all candies)",
    "topic": "greedy",
    "difficulty": "Easy",
    "platform": "GeeksforGeeks",
    "url": "https://practice.geeksforgeeks.org/problems/shop-in-candy-store1145/1",
    "companies": ["Amazon", "Flipkart"],
    "description": "Find minimum and maximum amount of money to buy all N candies when 1 candy purchase gives K free candies."
  },
  {
    "id": "grd-11",
    "title": "Minimize Cash Flow among a given set of friends",
    "topic": "greedy",
    "difficulty": "Hard",
    "platform": "GeeksforGeeks",
    "url": "https://www.geeksforgeeks.org/minimize-cash-flow-among-given-set-friends-borrowed-money/",
    "companies": ["Amazon"],
    "description": "Minimize total cash flow between friends by repeatedly matching maximum debtor with maximum creditor."
  },
  {
    "id": "grd-12",
    "title": "Minimum Cost to cut a board into squares (Board Cutting)",
    "topic": "greedy",
    "difficulty": "Hard",
    "platform": "GeeksforGeeks",
    "url": "https://www.geeksforgeeks.org/minimum-cost-cut-board-squares/",
    "companies": ["Amazon"],
    "description": "Find minimum cost to break m x n chocolate board into 1x1 squares by greedily picking costliest cut first."
  },
  {
    "id": "grd-13",
    "title": "Check if it is possible to survive on Island",
    "topic": "greedy",
    "difficulty": "Easy",
    "platform": "GeeksforGeeks",
    "url": "https://practice.geeksforgeeks.org/problems/check-if-it-is-possible-to-survive-on-island4922/1",
    "companies": ["Amazon"],
    "description": "Determine if person can survive S days requiring M food daily when shop is closed on Sundays."
  },
  {
    "id": "grd-14",
    "title": "Find maximum meetings in one room (N meetings in one room)",
    "topic": "greedy",
    "difficulty": "Easy",
    "platform": "GeeksforGeeks",
    "url": "https://practice.geeksforgeeks.org/problems/n-meetings-in-one-room-1587115620/1",
    "companies": ["Amazon", "Microsoft", "Flipkart"],
    "description": "Find maximum number of meetings that can be accommodated in one room by sorting by finish time."
  },
  {
    "id": "grd-15",
    "title": "Maximum product subset of an array",
    "topic": "greedy",
    "difficulty": "Medium",
    "platform": "GeeksforGeeks",
    "url": "https://practice.geeksforgeeks.org/problems/maximum-product-subset-of-an-array/1",
    "companies": ["Amazon"],
    "description": "Find the maximum product of a non-empty subset of numbers modulo 10^9+7."
  },
  {
    "id": "grd-16",
    "title": "Maximize array sum after K negations",
    "topic": "greedy",
    "difficulty": "Easy",
    "platform": "LeetCode",
    "url": "https://leetcode.com/problems/maximize-sum-of-array-after-k-negations/",
    "companies": ["Amazon"],
    "description": "Maximize sum of array after modifying array by choosing any element and replacing with -nums[i] k times."
  },
  {
    "id": "grd-17",
    "title": "Maximize the sum of arr[i]*i",
    "topic": "greedy",
    "difficulty": "Easy",
    "platform": "GeeksforGeeks",
    "url": "https://practice.geeksforgeeks.org/problems/maximize-arrii-of-an-array0026/1",
    "companies": ["Amazon"],
    "description": "Maximize sum of arr[i]*i for all 0 <= i < N by sorting elements in ascending order."
  },
  {
    "id": "grd-18",
    "title": "Maximum sum of absolute difference of any permutation",
    "topic": "greedy",
    "difficulty": "Medium",
    "platform": "GeeksforGeeks",
    "url": "https://www.geeksforgeeks.org/maximum-sum-absolute-difference-array/",
    "companies": ["Amazon"],
    "description": "Rearrange array to maximize sum of absolute differences between consecutive circular elements."
  },
  {
    "id": "grd-19",
    "title": "Maximize sum of consecutive differences in a circular array",
    "topic": "greedy",
    "difficulty": "Medium",
    "platform": "GeeksforGeeks",
    "url": "https://practice.geeksforgeeks.org/problems/swap-and-maximize5859/1",
    "companies": ["Amazon"],
    "description": "Maximize sum of |arr[i] - arr[i+1]| in circular array using alternate minimum and maximum placement."
  },
  {
    "id": "grd-20",
    "title": "Minimum sum of absolute differences of two arrays",
    "topic": "greedy",
    "difficulty": "Easy",
    "platform": "GeeksforGeeks",
    "url": "https://practice.geeksforgeeks.org/problems/minimum-sum-of-absolute-differences-of-pairs/1",
    "companies": ["Amazon"],
    "description": "Sort both arrays in ascending order and pair corresponding indices to minimize sum of absolute differences."
  },
  {
    "id": "grd-21",
    "title": "Program for Shortest Job First (or SJF) CPU Scheduling",
    "topic": "greedy",
    "difficulty": "Medium",
    "platform": "GeeksforGeeks",
    "url": "https://www.geeksforgeeks.org/program-for-shortest-job-first-or-sjf-cpu-scheduling-set-1-non-preemptive/",
    "companies": ["Amazon"],
    "description": "Schedule processes to minimize average waiting time by executing shortest burst times first."
  },
  {
    "id": "grd-22",
    "title": "Program for Least Recently Used (LRU) Page Replacement",
    "topic": "greedy",
    "difficulty": "Medium",
    "platform": "GeeksforGeeks",
    "url": "https://www.geeksforgeeks.org/program-for-least-recently-used-lru-page-replacement-algorithm/",
    "companies": ["Amazon"],
    "description": "Count page faults in OS paging using LRU cache eviction policy."
  },
  {
    "id": "grd-23",
    "title": "Smallest subset with sum greater than all other elements",
    "topic": "greedy",
    "difficulty": "Easy",
    "platform": "GeeksforGeeks",
    "url": "https://practice.geeksforgeeks.org/problems/smallest-subset-with-greater-sum/1",
    "companies": ["Amazon"],
    "description": "Find minimum number of elements such that their sum is strictly greater than sum of remaining elements."
  },
  {
    "id": "grd-24",
    "title": "Chocolate Distribution Problem",
    "topic": "greedy",
    "difficulty": "Easy",
    "platform": "GeeksforGeeks",
    "url": "https://practice.geeksforgeeks.org/problems/chocolate-distribution-problem3825/1",
    "companies": ["Amazon", "Flipkart"],
    "description": "Distribute M packets among M students such that difference between max and min chocolates is minimized."
  },
  {
    "id": "grd-25",
    "title": "DEFKIN - Defense of a Kingdom",
    "topic": "greedy",
    "difficulty": "Medium",
    "platform": "SPOJ",
    "url": "https://www.spoj.com/problems/DEFKIN/",
    "companies": ["Amazon"],
    "description": "Find the maximum undefended rectangular area on grid guarded by towers at given coordinates."
  },
  {
    "id": "grd-26",
    "title": "DIEHARD - DIE HARD",
    "topic": "greedy",
    "difficulty": "Medium",
    "platform": "SPOJ",
    "url": "https://www.spoj.com/problems/DIEHARD/",
    "companies": ["Amazon"],
    "description": "Maximize survival time moving between Air, Water, and Fire with specified health and armor transitions."
  },
  {
    "id": "grd-27",
    "title": "GERGOVIA - Wine trading in Gergovia",
    "topic": "greedy",
    "difficulty": "Medium",
    "platform": "SPOJ",
    "url": "https://www.spoj.com/problems/GERGOVIA/",
    "companies": ["Amazon"],
    "description": "Calculate minimum work units to balance all wine buy and sell demands on a street."
  },
  {
    "id": "grd-28",
    "title": "Picking Up Chicks (Google Code Jam)",
    "topic": "greedy",
    "difficulty": "Medium",
    "platform": "SPOJ",
    "url": "https://www.spoj.com/problems/GCJ101BB/",
    "companies": ["Google"],
    "description": "Calculate minimum swaps to let at least K chicks reach the barn in T seconds."
  },
  {
    "id": "grd-29",
    "title": "CHOCOLA - Chocolate Problem",
    "topic": "greedy",
    "difficulty": "Hard",
    "platform": "SPOJ",
    "url": "https://www.spoj.com/problems/CHOCOLA/",
    "companies": ["Amazon"],
    "description": "Break chocolate bar into 1x1 pieces with minimal cost using greedy cuts."
  },
  {
    "id": "grd-30",
    "title": "ARRANGE - Arranging Amplifiers",
    "topic": "greedy",
    "difficulty": "Medium",
    "platform": "SPOJ",
    "url": "https://www.spoj.com/problems/ARRANGE/",
    "companies": ["Amazon"],
    "description": "Arrange amplifiers so that output a1^(a2^(a3...)) is maximized."
  },
  {
    "id": "grd-31",
    "title": "K Centers Problem",
    "topic": "greedy",
    "difficulty": "Hard",
    "platform": "GeeksforGeeks",
    "url": "https://www.geeksforgeeks.org/k-centers-problem-set-1-greedy-approximate-algorithm/",
    "companies": ["Amazon"],
    "description": "Greedy 2-approximation algorithm for K-centers problem picking farthest point in each step."
  },
  {
    "id": "grd-32",
    "title": "Minimum Cost of ropes",
    "topic": "greedy",
    "difficulty": "Easy",
    "platform": "GeeksforGeeks",
    "url": "https://practice.geeksforgeeks.org/problems/minimum-cost-of-ropes-1587115620/1",
    "companies": ["Amazon", "Microsoft", "Goldman Sachs"],
    "description": "Connect N ropes with minimum cost using Min-Heap priority queue repeatedly combining 2 smallest ropes."
  },
  {
    "id": "grd-33",
    "title": "Find smallest number with given number of digits and sum of digits",
    "topic": "greedy",
    "difficulty": "Medium",
    "platform": "GeeksforGeeks",
    "url": "https://practice.geeksforgeeks.org/problems/smallest-number5829/1",
    "companies": ["Amazon"],
    "description": "Construct smallest number with D digits and digit sum S by greedily placing 9s from the right."
  },
  {
    "id": "grd-34",
    "title": "Rearrange characters in string such that no two adjacent are same (Greedy)",
    "topic": "greedy",
    "difficulty": "Medium",
    "platform": "LeetCode",
    "url": "https://leetcode.com/problems/reorganize-string/",
    "companies": ["Amazon", "Google", "Facebook"],
    "description": "Reorganize characters using max frequency character pairing."
  },
  {
    "id": "grd-35",
    "title": "Maximum trains stoppage at a station",
    "topic": "greedy",
    "difficulty": "Medium",
    "platform": "GeeksforGeeks",
    "url": "https://www.geeksforgeeks.org/maximum-trains-stoppage-can-provided/",
    "companies": ["Amazon"],
    "description": "Find maximum number of trains that can be given stoppage on given platforms."
  }
]

# Backtracking (bck-3 to bck-19, 17 items)
bck_addl = [
  {
    "id": "bck-3",
    "title": "Word Break Problem using Backtracking",
    "topic": "backtracking",
    "difficulty": "Hard",
    "platform": "LeetCode",
    "url": "https://leetcode.com/problems/word-break-ii/",
    "companies": ["Amazon", "Microsoft", "Google"],
    "description": "Return all possible space-separated sentences where each word is a valid dictionary word using backtracking."
  },
  {
    "id": "bck-4",
    "title": "Remove Invalid Parentheses",
    "topic": "backtracking",
    "difficulty": "Hard",
    "platform": "LeetCode",
    "url": "https://leetcode.com/problems/remove-invalid-parentheses/",
    "companies": ["Facebook", "Amazon", "Google"],
    "description": "Remove the minimum number of invalid parentheses to make the input string valid using DFS/BFS."
  },
  {
    "id": "bck-5",
    "title": "Sudoku Solver",
    "topic": "backtracking",
    "difficulty": "Hard",
    "platform": "LeetCode",
    "url": "https://leetcode.com/problems/sudoku-solver/",
    "companies": ["Amazon", "Microsoft", "Google"],
    "description": "Write a program to solve a 9x9 Sudoku puzzle by filling empty cells with valid digits 1-9."
  },
  {
    "id": "bck-6",
    "title": "m Coloring Problem",
    "topic": "backtracking",
    "difficulty": "Medium",
    "platform": "GeeksforGeeks",
    "url": "https://practice.geeksforgeeks.org/problems/m-coloring-problem-1587115620/1",
    "companies": ["Amazon", "Microsoft"],
    "description": "Determine if undirected graph can be colored with at most M colors such that no two adjacent vertices have same color."
  },
  {
    "id": "bck-7",
    "title": "Print all palindromic partitions of a string",
    "topic": "backtracking",
    "difficulty": "Medium",
    "platform": "LeetCode",
    "url": "https://leetcode.com/problems/palindrome-partitioning/",
    "companies": ["Amazon", "Google", "Bloomberg"],
    "description": "Partition string s such that every substring of partition is a palindrome; return all possible partitions."
  },
  {
    "id": "bck-8",
    "title": "Subset Sum Problem (Print all subsets with given sum)",
    "topic": "backtracking",
    "difficulty": "Medium",
    "platform": "GeeksforGeeks",
    "url": "https://practice.geeksforgeeks.org/problems/subset-sum-problem2014/1",
    "companies": ["Amazon", "Microsoft"],
    "description": "Find all subsets of given array that sum up to target value using recursion and pruning."
  },
  {
    "id": "bck-9",
    "title": "The Knight's tour problem",
    "topic": "backtracking",
    "difficulty": "Hard",
    "platform": "GeeksforGeeks",
    "url": "https://www.geeksforgeeks.org/the-knights-tour-problem-backtracking-set-1/",
    "companies": ["Amazon"],
    "description": "Move knight on N x N chessboard so that it visits every single square exactly once."
  },
  {
    "id": "bck-10",
    "title": "Tug of War",
    "topic": "backtracking",
    "difficulty": "Hard",
    "platform": "GeeksforGeeks",
    "url": "https://www.geeksforgeeks.org/tug-of-war/",
    "companies": ["Amazon"],
    "description": "Divide set of n integers into two subsets of size n/2 and (n-1)/2 or n/2 such that sum difference is minimized."
  },
  {
    "id": "bck-11",
    "title": "Find shortest safe route in a path with landmines",
    "topic": "backtracking",
    "difficulty": "Hard",
    "platform": "GeeksforGeeks",
    "url": "https://www.geeksforgeeks.org/find-shortest-safe-route-in-a-path-with-landmines/",
    "companies": ["Amazon"],
    "description": "Find shortest path from any cell in first column to any cell in last column avoiding landmines and adjacent cells."
  },
  {
    "id": "bck-12",
    "title": "Combinational Sum",
    "topic": "backtracking",
    "difficulty": "Medium",
    "platform": "LeetCode",
    "url": "https://leetcode.com/problems/combination-sum/",
    "companies": ["Amazon", "Google", "Microsoft", "Facebook"],
    "description": "Given candidates and target, return list of all unique combinations where candidate numbers sum to target."
  },
  {
    "id": "bck-13",
    "title": "Find Maximum number possible by doing at-most K swaps",
    "topic": "backtracking",
    "difficulty": "Hard",
    "platform": "GeeksforGeeks",
    "url": "https://practice.geeksforgeeks.org/problems/largest-number-in-k-swaps-1587115620/1",
    "companies": ["Amazon", "Microsoft"],
    "description": "Find largest number possible by swapping digits of given positive number at most K times."
  },
  {
    "id": "bck-14",
    "title": "Print all permutations of a string (Backtracking)",
    "topic": "backtracking",
    "difficulty": "Medium",
    "platform": "LeetCode",
    "url": "https://leetcode.com/problems/permutations/",
    "companies": ["Amazon", "Microsoft", "Google"],
    "description": "Generate all possible permutations of an array/string using in-place swap backtracking."
  },
  {
    "id": "bck-15",
    "title": "Find if there is a path of more than k length from a source",
    "topic": "backtracking",
    "difficulty": "Hard",
    "platform": "GeeksforGeeks",
    "url": "https://www.geeksforgeeks.org/find-if-there-is-a-path-of-more-than-k-length-from-a-source/",
    "companies": ["Amazon"],
    "description": "Check if there is a simple path from given source vertex with total weight greater than or equal to k."
  },
  {
    "id": "bck-16",
    "title": "Longest Possible Route in a Matrix with Hurdles",
    "topic": "backtracking",
    "difficulty": "Hard",
    "platform": "GeeksforGeeks",
    "url": "https://www.geeksforgeeks.org/longest-possible-route-in-a-matrix-with-hurdles/",
    "companies": ["Amazon"],
    "description": "Find length of longest safe route from source cell to destination cell in matrix containing blocked hurdles."
  },
  {
    "id": "bck-17",
    "title": "Print all possible paths from top left to bottom right of a mXn matrix",
    "topic": "backtracking",
    "difficulty": "Medium",
    "platform": "GeeksforGeeks",
    "url": "https://www.geeksforgeeks.org/print-all-possible-paths-from-top-left-to-bottom-right-of-a-mxn-matrix/",
    "companies": ["Amazon"],
    "description": "Print all paths from (0,0) to (m-1,n-1) moving only down and right."
  },
  {
    "id": "bck-18",
    "title": "Partition of a set into K subsets with equal sum",
    "topic": "backtracking",
    "difficulty": "Hard",
    "platform": "LeetCode",
    "url": "https://leetcode.com/problems/partition-to-k-equal-sum-subsets/",
    "companies": ["Amazon", "Google", "LinkedIn"],
    "description": "Determine if array can be partitioned into k subsets whose sums are all equal."
  },
  {
    "id": "bck-19",
    "title": "Find the K-th Permutation Sequence of first N natural numbers",
    "topic": "backtracking",
    "difficulty": "Hard",
    "platform": "LeetCode",
    "url": "https://leetcode.com/problems/permutation-sequence/",
    "companies": ["Amazon", "Microsoft"],
    "description": "Given n and k, return kth permutation sequence of numbers [1, 2, ..., n] using factorial number system in O(N^2)."
  }
]

# Heaps & Hashing (heap-3 to heap-28, 26 items)
heap_addl = [
  {
    "id": "heap-3",
    "title": "Maximum of all subarrays of size k (Sliding Window Maximum)",
    "topic": "heaps-hashing",
    "difficulty": "Hard",
    "platform": "LeetCode",
    "url": "https://leetcode.com/problems/sliding-window-maximum/",
    "companies": ["Amazon", "Google", "Microsoft"],
    "description": "Find maximum element in each sliding window of size k using max-heap or monotonic deque."
  },
  {
    "id": "heap-4",
    "title": "'k' largest elements in an array",
    "topic": "heaps-hashing",
    "difficulty": "Medium",
    "platform": "LeetCode",
    "url": "https://leetcode.com/problems/kth-largest-element-in-an-array/",
    "companies": ["Amazon", "Google", "Facebook"],
    "description": "Find the k largest elements in an array using a Min-Heap of size k in O(N log k) time."
  },
  {
    "id": "heap-5",
    "title": "Kth smallest element in an unsorted array",
    "topic": "heaps-hashing",
    "difficulty": "Medium",
    "platform": "GeeksforGeeks",
    "url": "https://practice.geeksforgeeks.org/problems/kth-smallest-element5635/1",
    "companies": ["Amazon", "Microsoft", "Snapdeal"],
    "description": "Find kth smallest element in array using Max-Heap of size k or QuickSelect in O(N) average time."
  },
  {
    "id": "heap-6",
    "title": "Merge 'K' sorted arrays",
    "topic": "heaps-hashing",
    "difficulty": "Medium",
    "platform": "GeeksforGeeks",
    "url": "https://practice.geeksforgeeks.org/problems/merge-k-sorted-arrays/1",
    "companies": ["Amazon", "Microsoft"],
    "description": "Merge k sorted arrays into one single sorted array using Min-Heap of size k containing pointers."
  },
  {
    "id": "heap-7",
    "title": "Merge 2 Binary Max Heaps",
    "topic": "heaps-hashing",
    "difficulty": "Easy",
    "platform": "GeeksforGeeks",
    "url": "https://practice.geeksforgeeks.org/problems/merge-two-binary-max-heap0144/1",
    "companies": ["Amazon"],
    "description": "Merge two binary max heaps into a single max heap by concatenating arrays and applying buildHeap in O(N+M)."
  },
  {
    "id": "heap-8",
    "title": "Kth largest sum continuous subarrays",
    "topic": "heaps-hashing",
    "difficulty": "Medium",
    "platform": "GeeksforGeeks",
    "url": "https://practice.geeksforgeeks.org/problems/k-th-largest-sum-contiguous-subarray/1",
    "companies": ["Amazon"],
    "description": "Find kth largest contiguous subarray sum using prefix sums and Min-Heap of size k."
  },
  {
    "id": "heap-9",
    "title": "Reorganize String (Rearrange characters)",
    "topic": "heaps-hashing",
    "difficulty": "Medium",
    "platform": "LeetCode",
    "url": "https://leetcode.com/problems/reorganize-string/",
    "companies": ["Amazon", "Google", "Facebook"],
    "description": "Rearrange characters of string such that no two adjacent characters are identical using Max-Heap."
  },
  {
    "id": "heap-10",
    "title": "Merge K sorted linked lists",
    "topic": "heaps-hashing",
    "difficulty": "Hard",
    "platform": "LeetCode",
    "url": "https://leetcode.com/problems/merge-k-sorted-lists/",
    "companies": ["Amazon", "Google", "Facebook", "Microsoft"],
    "description": "Merge k sorted linked lists into one sorted linked list using a Min-Heap of node pointers."
  },
  {
    "id": "heap-11",
    "title": "Smallest range in K lists",
    "topic": "heaps-hashing",
    "difficulty": "Hard",
    "platform": "LeetCode",
    "url": "https://leetcode.com/problems/smallest-range-covering-elements-from-k-lists/",
    "companies": ["Amazon", "Google"],
    "description": "Find smallest range [a, b] that includes at least one number from each of the k sorted lists using Min-Heap."
  },
  {
    "id": "heap-12",
    "title": "Median in a stream of running integers",
    "topic": "heaps-hashing",
    "difficulty": "Hard",
    "platform": "LeetCode",
    "url": "https://leetcode.com/problems/find-median-from-data-stream/",
    "companies": ["Amazon", "Google", "Microsoft", "Apple"],
    "description": "Maintain running median of numeric stream in O(log N) insert time using balanced max-heap and min-heap."
  },
  {
    "id": "heap-13",
    "title": "Check if a Binary Tree is Heap",
    "topic": "heaps-hashing",
    "difficulty": "Easy",
    "platform": "GeeksforGeeks",
    "url": "https://practice.geeksforgeeks.org/problems/is-binary-tree-heap/1",
    "companies": ["Amazon"],
    "description": "Verify that binary tree is complete binary tree and satisfies max-heap property at all nodes."
  },
  {
    "id": "heap-14",
    "title": "Connect 'n' ropes with minimum cost",
    "topic": "heaps-hashing",
    "difficulty": "Easy",
    "platform": "GeeksforGeeks",
    "url": "https://practice.geeksforgeeks.org/problems/minimum-cost-of-ropes-1587115620/1",
    "companies": ["Amazon", "Microsoft", "Goldman Sachs"],
    "description": "Connect ropes with minimum total cost using a priority queue."
  },
  {
    "id": "heap-15",
    "title": "Convert BST to Min Heap",
    "topic": "heaps-hashing",
    "difficulty": "Medium",
    "platform": "GeeksforGeeks",
    "url": "https://www.geeksforgeeks.org/convert-bst-min-heap/",
    "companies": ["Amazon"],
    "description": "Convert BST into Min-Heap such that values in left subtree are smaller than right subtree using preorder assignment."
  },
  {
    "id": "heap-16",
    "title": "Convert min Heap to max Heap",
    "topic": "heaps-hashing",
    "difficulty": "Medium",
    "platform": "GeeksforGeeks",
    "url": "https://www.geeksforgeeks.org/convert-min-heap-to-max-heap/",
    "companies": ["Amazon"],
    "description": "Convert Min-Heap array representation into Max-Heap in O(N) time using bottom-up maxHeapify."
  },
  {
    "id": "heap-17",
    "title": "Rearrange characters in string such that no two adjacent are same",
    "topic": "heaps-hashing",
    "difficulty": "Medium",
    "platform": "GeeksforGeeks",
    "url": "https://practice.geeksforgeeks.org/problems/rearrange-characters4649/1",
    "companies": ["Amazon"],
    "description": "Check if valid rearrangement exists and construct it using character frequencies and priority queue."
  },
  {
    "id": "heap-18",
    "title": "Minimum sum of two numbers formed from digits of an array",
    "topic": "heaps-hashing",
    "difficulty": "Medium",
    "platform": "GeeksforGeeks",
    "url": "https://practice.geeksforgeeks.org/problems/min-sum-formed-by-digits3305/1",
    "companies": ["Amazon"],
    "description": "Form two numbers using digits from array such that their sum is minimized by alternating sorted digits."
  },
  {
    "id": "heap-19",
    "title": "Top K Frequent Elements",
    "topic": "heaps-hashing",
    "difficulty": "Medium",
    "platform": "LeetCode",
    "url": "https://leetcode.com/problems/top-k-frequent-elements/",
    "companies": ["Amazon", "Google", "Facebook"],
    "description": "Return the k most frequent elements in an array using frequency map and bucket sort or Min-Heap."
  },
  {
    "id": "heap-20",
    "title": "Find whether an array is subset of another array (Hashing)",
    "topic": "heaps-hashing",
    "difficulty": "Easy",
    "platform": "GeeksforGeeks",
    "url": "https://practice.geeksforgeeks.org/problems/array-subset-of-another-array2317/1",
    "companies": ["Amazon", "Cisco"],
    "description": "Determine if array arr2 is a subset of arr1 using hash map count verification."
  },
  {
    "id": "heap-21",
    "title": "Zero Sum Subarrays (Count subarrays with zero sum)",
    "topic": "heaps-hashing",
    "difficulty": "Medium",
    "platform": "GeeksforGeeks",
    "url": "https://practice.geeksforgeeks.org/problems/zero-sum-subarrays1825/1",
    "companies": ["Amazon", "Microsoft", "Paytm"],
    "description": "Count total number of subarrays having sum equal to zero using prefix sum frequency map in O(N)."
  },
  {
    "id": "heap-22",
    "title": "Count distinct elements in every window of size k",
    "topic": "heaps-hashing",
    "difficulty": "Easy",
    "platform": "GeeksforGeeks",
    "url": "https://practice.geeksforgeeks.org/problems/count-distinct-elements-in-every-window/1",
    "companies": ["Amazon", "Microsoft"],
    "description": "Count distinct elements in every sliding window of size k using hash map to track counts."
  },
  {
    "id": "heap-23",
    "title": "Longest Consecutive Subsequence (Hashing)",
    "topic": "heaps-hashing",
    "difficulty": "Medium",
    "platform": "LeetCode",
    "url": "https://leetcode.com/problems/longest-consecutive-sequence/",
    "companies": ["Amazon", "Google", "Spotify"],
    "description": "Find length of longest consecutive elements sequence in O(N) time using HashSet lookup."
  },
  {
    "id": "heap-24",
    "title": "Array Pair Sum Divisibility Problem",
    "topic": "heaps-hashing",
    "difficulty": "Medium",
    "platform": "GeeksforGeeks",
    "url": "https://practice.geeksforgeeks.org/problems/array-pair-sum-divisibility-problem3257/1",
    "companies": ["Amazon"],
    "description": "Determine if array of integers can be divided into pairs such that sum of every pair is divisible by k."
  },
  {
    "id": "heap-25",
    "title": "Find itinerary from a given list of tickets",
    "topic": "heaps-hashing",
    "difficulty": "Medium",
    "platform": "LeetCode",
    "url": "https://leetcode.com/problems/reconstruct-itinerary/",
    "companies": ["Amazon", "Google"],
    "description": "Reconstruct itinerary in order from list of airline tickets using hash map graph and Hierholzer's algorithm."
  },
  {
    "id": "heap-26",
    "title": "Check if two arrays are equal or not",
    "topic": "heaps-hashing",
    "difficulty": "Easy",
    "platform": "GeeksforGeeks",
    "url": "https://practice.geeksforgeeks.org/problems/check-if-two-arrays-are-equal-or-not3847/1",
    "companies": ["Amazon", "Goldman Sachs"],
    "description": "Check if two arrays are equal (contain same elements with same frequencies) using frequency hash map."
  },
  {
    "id": "heap-27",
    "title": "Group Anagrams",
    "topic": "heaps-hashing",
    "difficulty": "Medium",
    "platform": "LeetCode",
    "url": "https://leetcode.com/problems/group-anagrams/",
    "companies": ["Amazon", "Google", "Facebook"],
    "description": "Group an array of strings into anagram clusters using sorted word or character count hash keys."
  },
  {
    "id": "heap-28",
    "title": "Smallest subarray with all occurrences of a most frequent element",
    "topic": "heaps-hashing",
    "difficulty": "Medium",
    "platform": "LeetCode",
    "url": "https://leetcode.com/problems/degree-of-an-array/",
    "companies": ["Amazon"],
    "description": "Find smallest subarray containing all occurrences of the maximum frequency element using hash tracking of first/last index."
  }
]

with open('scripts/grd_addl.json', 'w') as f:
    json.dump(grd_addl, f, indent=2)
print('Saved grd_addl:', len(grd_addl))

with open('scripts/bck_addl.json', 'w') as f:
    json.dump(bck_addl, f, indent=2)
print('Saved bck_addl:', len(bck_addl))

with open('scripts/heap_addl.json', 'w') as f:
    json.dump(heap_addl, f, indent=2)
print('Saved heap_addl:', len(heap_addl))
