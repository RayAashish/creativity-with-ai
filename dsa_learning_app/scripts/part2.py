import json

# Stacks & Queues (sq-6 to sq-38, 33 items)
sq_addl = [
  {
    "id": "sq-6",
    "title": "Check the expression has valid or Balanced parenthesis or not",
    "topic": "stacks-queues",
    "difficulty": "Easy",
    "platform": "LeetCode",
    "url": "https://leetcode.com/problems/valid-parentheses/",
    "companies": ["Amazon", "Google", "Facebook", "Microsoft"],
    "description": "Given string containing bracket characters, determine if brackets close in correct order."
  },
  {
    "id": "sq-7",
    "title": "Reverse a String using Stack",
    "topic": "stacks-queues",
    "difficulty": "Easy",
    "platform": "GeeksforGeeks",
    "url": "https://practice.geeksforgeeks.org/problems/reverse-a-string-using-stack/1",
    "companies": ["Amazon", "Paytm"],
    "description": "Reverse a string using LIFO property of stack."
  },
  {
    "id": "sq-8",
    "title": "Design a stack that supports getMin() in O(1) time and O(1) extra space",
    "topic": "stacks-queues",
    "difficulty": "Medium",
    "platform": "LeetCode",
    "url": "https://leetcode.com/problems/min-stack/",
    "companies": ["Amazon", "Microsoft", "Bloomberg", "Google"],
    "description": "Implement MinStack with push, pop, top, and getMin in O(1) time using encoded elements 2*val - min."
  },
  {
    "id": "sq-9",
    "title": "Find the Next Greater Element (NGE)",
    "topic": "stacks-queues",
    "difficulty": "Medium",
    "platform": "LeetCode",
    "url": "https://leetcode.com/problems/next-greater-element-i/",
    "companies": ["Amazon", "Flipkart", "Microsoft"],
    "description": "Find next greater element for every element in an array using a monotonic decreasing stack."
  },
  {
    "id": "sq-10",
    "title": "The Celebrity Problem",
    "topic": "stacks-queues",
    "difficulty": "Medium",
    "platform": "GeeksforGeeks",
    "url": "https://practice.geeksforgeeks.org/problems/the-celebrity-problem/1",
    "companies": ["Amazon", "Google", "Microsoft", "Flipkart"],
    "description": "Find person in party known by everyone but who knows nobody using stack or two pointers in O(N) time."
  },
  {
    "id": "sq-11",
    "title": "Evaluation of Postfix Expression",
    "topic": "stacks-queues",
    "difficulty": "Easy",
    "platform": "LeetCode",
    "url": "https://leetcode.com/problems/evaluate-reverse-polish-notation/",
    "companies": ["Amazon", "Google", "Microsoft"],
    "description": "Evaluate the value of an arithmetic expression in Reverse Polish Notation (RPN) using operand stack."
  },
  {
    "id": "sq-12",
    "title": "Insert an element at the bottom of a stack without extra space (Recursion)",
    "topic": "stacks-queues",
    "difficulty": "Medium",
    "platform": "GeeksforGeeks",
    "url": "https://practice.geeksforgeeks.org/problems/insert-an-element-at-the-bottom-of-a-stack/1",
    "companies": ["Amazon"],
    "description": "Insert element at bottom of stack using call stack recursion."
  },
  {
    "id": "sq-13",
    "title": "Reverse a stack using recursion",
    "topic": "stacks-queues",
    "difficulty": "Medium",
    "platform": "GeeksforGeeks",
    "url": "https://www.geeksforgeeks.org/reverse-a-stack-using-recursion/",
    "companies": ["Amazon", "Microsoft"],
    "description": "Reverse stack using call stack frames and insertAtBottom helper without auxiliary loops."
  },
  {
    "id": "sq-14",
    "title": "Sort a stack using recursion",
    "topic": "stacks-queues",
    "difficulty": "Medium",
    "platform": "GeeksforGeeks",
    "url": "https://practice.geeksforgeeks.org/problems/sort-a-stack/1",
    "companies": ["Amazon", "Microsoft", "Goldman Sachs"],
    "description": "Sort stack elements such that top element is the greatest using recursive sortedInsert."
  },
  {
    "id": "sq-15",
    "title": "Merge Overlapping Intervals using stack",
    "topic": "stacks-queues",
    "difficulty": "Medium",
    "platform": "LeetCode",
    "url": "https://leetcode.com/problems/merge-intervals/",
    "companies": ["Amazon", "Google", "Facebook", "Microsoft"],
    "description": "Given an array of intervals, merge all overlapping intervals using sorted order and interval stack."
  },
  {
    "id": "sq-16",
    "title": "Largest Rectangular Area in Histogram",
    "topic": "stacks-queues",
    "difficulty": "Hard",
    "platform": "LeetCode",
    "url": "https://leetcode.com/problems/largest-rectangle-in-histogram/",
    "companies": ["Google", "Amazon", "Facebook", "Microsoft"],
    "description": "Find area of largest rectangle in histogram using monotonic stack to find previous and next smaller bounds in O(N)."
  },
  {
    "id": "sq-17",
    "title": "Length of the Longest Valid Substring of parentheses",
    "topic": "stacks-queues",
    "difficulty": "Hard",
    "platform": "LeetCode",
    "url": "https://leetcode.com/problems/longest-valid-parentheses/",
    "companies": ["Amazon", "Google", "Facebook"],
    "description": "Find the length of the longest valid (well-formed) parentheses substring using index stack or left-right counters."
  },
  {
    "id": "sq-18",
    "title": "Expression contains redundant bracket or not",
    "topic": "stacks-queues",
    "difficulty": "Medium",
    "platform": "GeeksforGeeks",
    "url": "https://www.geeksforgeeks.org/expression-contains-redundant-bracket-not/",
    "companies": ["Amazon"],
    "description": "Check if expression contains duplicate or unnecessary pairs of parenthesis enclosing operators."
  },
  {
    "id": "sq-19",
    "title": "Implement Stack using Queues",
    "topic": "stacks-queues",
    "difficulty": "Easy",
    "platform": "LeetCode",
    "url": "https://leetcode.com/problems/implement-stack-using-queues/",
    "companies": ["Amazon", "Microsoft", "Bloomberg"],
    "description": "Implement a last-in-first-out (LIFO) stack using only two standard FIFO queues."
  },
  {
    "id": "sq-20",
    "title": "Implement Queue using Stacks",
    "topic": "stacks-queues",
    "difficulty": "Easy",
    "platform": "LeetCode",
    "url": "https://leetcode.com/problems/implement-queue-using-stacks/",
    "companies": ["Amazon", "Microsoft", "Bloomberg", "Google"],
    "description": "Implement a first-in-first-out (FIFO) queue using two LIFO stacks with amortized O(1) operations."
  },
  {
    "id": "sq-21",
    "title": "Implement 'k' Queues in a single array",
    "topic": "stacks-queues",
    "difficulty": "Hard",
    "platform": "GeeksforGeeks",
    "url": "https://www.geeksforgeeks.org/efficiently-implement-k-queues-single-array/",
    "companies": ["Amazon"],
    "description": "Efficiently implement k queues in a single array of size N using front, rear, and next index arrays."
  },
  {
    "id": "sq-22",
    "title": "Implement Circular Queue",
    "topic": "stacks-queues",
    "difficulty": "Medium",
    "platform": "LeetCode",
    "url": "https://leetcode.com/problems/design-circular-queue/",
    "companies": ["Amazon", "Microsoft", "Facebook"],
    "description": "Design circular queue buffer where last position connects back to first position to make use of spaces."
  },
  {
    "id": "sq-23",
    "title": "Implement LRU Cache",
    "topic": "stacks-queues",
    "difficulty": "Medium",
    "platform": "LeetCode",
    "url": "https://leetcode.com/problems/lru-cache/",
    "companies": ["Amazon", "Google", "Microsoft", "Facebook", "Apple"],
    "description": "Design data structure that follows Least Recently Used (LRU) cache constraints with O(1) get and put using Hash Map + DLL."
  },
  {
    "id": "sq-24",
    "title": "Reverse a Queue using recursion",
    "topic": "stacks-queues",
    "difficulty": "Easy",
    "platform": "GeeksforGeeks",
    "url": "https://practice.geeksforgeeks.org/problems/queue-reversal/1",
    "companies": ["Amazon", "Microsoft"],
    "description": "Reverse all elements of a queue using call stack recursion."
  },
  {
    "id": "sq-25",
    "title": "Reverse the first 'K' elements of a queue",
    "topic": "stacks-queues",
    "difficulty": "Easy",
    "platform": "GeeksforGeeks",
    "url": "https://practice.geeksforgeeks.org/problems/reverse-first-k-elements-of-queue/1",
    "companies": ["Amazon", "Microsoft"],
    "description": "Reverse order of first k elements of queue while keeping order of remaining elements intact."
  },
  {
    "id": "sq-26",
    "title": "Interleave the first half of the queue with second half",
    "topic": "stacks-queues",
    "difficulty": "Medium",
    "platform": "GeeksforGeeks",
    "url": "https://www.geeksforgeeks.org/interleave-first-half-queue-second-half/",
    "companies": ["Amazon"],
    "description": "Rearrange queue [q1, q2, ..., qk, qk+1, ..., q2k] into [q1, qk+1, q2, qk+2, ...] using auxiliary stack or queue."
  },
  {
    "id": "sq-27",
    "title": "Gas Station (Circular Tour)",
    "topic": "stacks-queues",
    "difficulty": "Medium",
    "platform": "LeetCode",
    "url": "https://leetcode.com/problems/gas-station/",
    "companies": ["Amazon", "Google", "Microsoft"],
    "description": "Find starting gas station index from which car can travel around circle once clockwise in O(N) time."
  },
  {
    "id": "sq-28",
    "title": "Rotting Oranges (Min time to rot all oranges)",
    "topic": "stacks-queues",
    "difficulty": "Medium",
    "platform": "LeetCode",
    "url": "https://leetcode.com/problems/rotting-oranges/",
    "companies": ["Amazon", "Microsoft", "Google"],
    "description": "Return minimum minutes until no fresh orange remains in grid using multi-source BFS queue."
  },
  {
    "id": "sq-29",
    "title": "Distance of nearest cell having 1 in a binary matrix",
    "topic": "stacks-queues",
    "difficulty": "Medium",
    "platform": "LeetCode",
    "url": "https://leetcode.com/problems/01-matrix/",
    "companies": ["Amazon", "Google"],
    "description": "Find distance of nearest 0/1 for each cell in binary matrix using multi-source queue BFS."
  },
  {
    "id": "sq-30",
    "title": "First negative integer in every window of size k",
    "topic": "stacks-queues",
    "difficulty": "Medium",
    "platform": "GeeksforGeeks",
    "url": "https://practice.geeksforgeeks.org/problems/first-negative-integer-in-every-window-of-size-k3345/1",
    "companies": ["Amazon"],
    "description": "Find first negative integer for each and every contiguous window of size k using sliding window deque."
  },
  {
    "id": "sq-31",
    "title": "Check if all levels of two trees are anagrams or not",
    "topic": "stacks-queues",
    "difficulty": "Medium",
    "platform": "GeeksforGeeks",
    "url": "https://www.geeksforgeeks.org/check-if-all-levels-of-two-trees-are-anagrams-or-not/",
    "companies": ["Amazon"],
    "description": "Determine if two binary trees are level-by-level anagrams using two level-order queues."
  },
  {
    "id": "sq-32",
    "title": "Sum of minimum and maximum elements of all subarrays of size k",
    "topic": "stacks-queues",
    "difficulty": "Medium",
    "platform": "GeeksforGeeks",
    "url": "https://www.geeksforgeeks.org/sum-minimum-maximum-elements-subarrays-size-k/",
    "companies": ["Amazon"],
    "description": "Calculate sum of min and max elements of all subarrays of size k using two double-ended queues."
  },
  {
    "id": "sq-33",
    "title": "Game of Strings (Min sum of squares of character counts)",
    "topic": "stacks-queues",
    "difficulty": "Medium",
    "platform": "GeeksforGeeks",
    "url": "https://practice.geeksforgeeks.org/problems/game-with-string4100/1",
    "companies": ["Amazon"],
    "description": "Minimize sum of squares of character frequencies after removing k characters using Max Priority Queue."
  },
  {
    "id": "sq-34",
    "title": "Queue based approach for first non-repeating character in a stream",
    "topic": "stacks-queues",
    "difficulty": "Medium",
    "platform": "GeeksforGeeks",
    "url": "https://practice.geeksforgeeks.org/problems/first-non-repeating-character-in-a-stream1216/1",
    "companies": ["Amazon", "Google", "Flipkart"],
    "description": "Use queue and frequency count map to answer first non-repeating character queries dynamically."
  },
  {
    "id": "sq-35",
    "title": "Next Smaller Element",
    "topic": "stacks-queues",
    "difficulty": "Medium",
    "platform": "GeeksforGeeks",
    "url": "https://www.geeksforgeeks.org/next-smaller-element/",
    "companies": ["Amazon", "Microsoft"],
    "description": "Find next smaller element for every element in an array using monotonic stack."
  },
  {
    "id": "sq-36",
    "title": "Trapping Rain Water using Stack",
    "topic": "stacks-queues",
    "difficulty": "Hard",
    "platform": "LeetCode",
    "url": "https://leetcode.com/problems/trapping-rain-water/",
    "companies": ["Amazon", "Google", "Microsoft", "Facebook"],
    "description": "Compute how much water it can trap after raining using monotonic stack to find bounded basins."
  },
  {
    "id": "sq-37",
    "title": "Sliding Window Maximum (Maximum of all subarrays of size k)",
    "topic": "stacks-queues",
    "difficulty": "Hard",
    "platform": "LeetCode",
    "url": "https://leetcode.com/problems/sliding-window-maximum/",
    "companies": ["Google", "Amazon", "Microsoft", "Uber"],
    "description": "Return max sliding window for array nums with window size k in O(N) time using monotonic deque."
  },
  {
    "id": "sq-38",
    "title": "Minimum number of bracket reversals to make balanced",
    "topic": "stacks-queues",
    "difficulty": "Medium",
    "platform": "GeeksforGeeks",
    "url": "https://practice.geeksforgeeks.org/problems/count-the-reversals0401/1",
    "companies": ["Amazon", "Paytm"],
    "description": "Find minimum reversals of parentheses needed to make the expression balanced using stack cancellation."
  }
]

# Trees (tree-6 to tree-35, 30 items)
trees_addl = [
  {
    "id": "tree-6",
    "title": "Inorder Traversal of a tree both using recursion and iteration",
    "topic": "trees",
    "difficulty": "Easy",
    "platform": "LeetCode",
    "url": "https://leetcode.com/problems/binary-tree-inorder-traversal/",
    "companies": ["Amazon", "Microsoft", "Google"],
    "description": "Perform inorder traversal (Left -> Node -> Right) iteratively using explicit node stack."
  },
  {
    "id": "tree-7",
    "title": "Preorder Traversal of a tree both using recursion and iteration",
    "topic": "trees",
    "difficulty": "Easy",
    "platform": "LeetCode",
    "url": "https://leetcode.com/problems/binary-tree-preorder-traversal/",
    "companies": ["Amazon", "Microsoft"],
    "description": "Perform preorder traversal (Node -> Left -> Right) iteratively using stack."
  },
  {
    "id": "tree-8",
    "title": "Postorder Traversal of a tree both using recursion and iteration",
    "topic": "trees",
    "difficulty": "Easy",
    "platform": "LeetCode",
    "url": "https://leetcode.com/problems/binary-tree-postorder-traversal/",
    "companies": ["Amazon", "Microsoft"],
    "description": "Perform postorder traversal (Left -> Right -> Node) using two stacks or single stack with prev pointer."
  },
  {
    "id": "tree-9",
    "title": "Left View of a tree",
    "topic": "trees",
    "difficulty": "Easy",
    "platform": "GeeksforGeeks",
    "url": "https://practice.geeksforgeeks.org/problems/left-view-of-binary-tree/1",
    "companies": ["Amazon", "Flipkart", "Paytm"],
    "description": "Print nodes visible from the left side of a binary tree using level order traversal or max level tracker."
  },
  {
    "id": "tree-10",
    "title": "Right View of a Tree",
    "topic": "trees",
    "difficulty": "Medium",
    "platform": "LeetCode",
    "url": "https://leetcode.com/problems/binary-tree-right-side-view/",
    "companies": ["Amazon", "Google", "Facebook"],
    "description": "Return the values of nodes you can see ordered from top to bottom standing on the right side."
  },
  {
    "id": "tree-11",
    "title": "Top View of a tree",
    "topic": "trees",
    "difficulty": "Medium",
    "platform": "GeeksforGeeks",
    "url": "https://practice.geeksforgeeks.org/problems/top-view-of-binary-tree/1",
    "companies": ["Amazon", "Microsoft", "Paytm"],
    "description": "Print nodes visible from the top of a binary tree using horizontal distance and BFS queue."
  },
  {
    "id": "tree-12",
    "title": "Bottom View of a tree",
    "topic": "trees",
    "difficulty": "Medium",
    "platform": "GeeksforGeeks",
    "url": "https://practice.geeksforgeeks.org/problems/bottom-view-of-binary-tree/1",
    "companies": ["Amazon", "Paytm"],
    "description": "Print bottom-most nodes for each horizontal distance coordinate from root using BFS."
  },
  {
    "id": "tree-13",
    "title": "Zig-Zag traversal of a binary tree",
    "topic": "trees",
    "difficulty": "Medium",
    "platform": "LeetCode",
    "url": "https://leetcode.com/problems/binary-tree-zigzag-level-order-traversal/",
    "companies": ["Amazon", "Microsoft", "Bloomberg"],
    "description": "Return zigzag level order traversal of binary tree alternating left-to-right and right-to-left."
  },
  {
    "id": "tree-14",
    "title": "Check if a tree is balanced or not",
    "topic": "trees",
    "difficulty": "Easy",
    "platform": "LeetCode",
    "url": "https://leetcode.com/problems/balanced-binary-tree/",
    "companies": ["Amazon", "Google", "Facebook"],
    "description": "Determine if binary tree is height-balanced (depth difference between two subtrees <= 1 at every node)."
  },
  {
    "id": "tree-15",
    "title": "Diagonal Traversal of a Binary tree",
    "topic": "trees",
    "difficulty": "Medium",
    "platform": "GeeksforGeeks",
    "url": "https://practice.geeksforgeeks.org/problems/diagonal-traversal-of-binary-tree/1",
    "companies": ["Amazon", "Microsoft"],
    "description": "Perform diagonal traversal of binary tree grouped by diagonal slope level."
  },
  {
    "id": "tree-16",
    "title": "Boundary traversal of a Binary tree",
    "topic": "trees",
    "difficulty": "Medium",
    "platform": "GeeksforGeeks",
    "url": "https://practice.geeksforgeeks.org/problems/boundary-traversal-of-binary-tree/1",
    "companies": ["Amazon", "Microsoft", "Flipkart"],
    "description": "Print boundary nodes of binary tree anti-clockwise: left boundary, leaves, and reverse right boundary."
  },
  {
    "id": "tree-17",
    "title": "Construct Binary Tree from String with bracket representation",
    "topic": "trees",
    "difficulty": "Medium",
    "platform": "GeeksforGeeks",
    "url": "https://www.geeksforgeeks.org/construct-binary-tree-string-bracket-representation/",
    "companies": ["Amazon"],
    "description": "Construct binary tree from string like '4(2(3)(1))(6(5))' using stack or recursive parsing."
  },
  {
    "id": "tree-18",
    "title": "Convert Binary tree into Doubly Linked List",
    "topic": "trees",
    "difficulty": "Hard",
    "platform": "GeeksforGeeks",
    "url": "https://practice.geeksforgeeks.org/problems/binary-tree-to-dll/1",
    "companies": ["Amazon", "Microsoft", "Goldman Sachs"],
    "description": "Convert binary tree to circular/linear doubly linked list in-place according to inorder traversal."
  },
  {
    "id": "tree-19",
    "title": "Convert Binary tree into Sum tree",
    "topic": "trees",
    "difficulty": "Medium",
    "platform": "GeeksforGeeks",
    "url": "https://practice.geeksforgeeks.org/problems/transform-to-sum-tree/1",
    "companies": ["Amazon"],
    "description": "Convert binary tree so every node stores sum of left and right subtrees in original tree."
  },
  {
    "id": "tree-20",
    "title": "Construct Binary tree from Inorder and Preorder traversal",
    "topic": "trees",
    "difficulty": "Medium",
    "platform": "LeetCode",
    "url": "https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/",
    "companies": ["Amazon", "Microsoft", "Google"],
    "description": "Construct binary tree given preorder and inorder traversal arrays using index hash map in O(N)."
  },
  {
    "id": "tree-21",
    "title": "Find minimum swaps required to convert a Binary tree into BST",
    "topic": "trees",
    "difficulty": "Medium",
    "platform": "GeeksforGeeks",
    "url": "https://www.geeksforgeeks.org/minimum-swap-required-convert-binary-tree-binary-search-tree/",
    "companies": ["Amazon"],
    "description": "Compute inorder traversal and find minimum cycle swaps required to sort that array."
  },
  {
    "id": "tree-22",
    "title": "Check if Binary tree is Sum tree or not",
    "topic": "trees",
    "difficulty": "Medium",
    "platform": "GeeksforGeeks",
    "url": "https://practice.geeksforgeeks.org/problems/sum-tree/1",
    "companies": ["Amazon", "Microsoft"],
    "description": "Check if value of every non-leaf node equals sum of nodes in its left and right subtrees."
  },
  {
    "id": "tree-23",
    "title": "Check if all leaf nodes are at same level or not",
    "topic": "trees",
    "difficulty": "Easy",
    "platform": "GeeksforGeeks",
    "url": "https://practice.geeksforgeeks.org/problems/leaf-at-same-level/1",
    "companies": ["Amazon"],
    "description": "Check whether all leaf nodes of a binary tree are at the exact same level."
  },
  {
    "id": "tree-24",
    "title": "Check if a given tree is Subtree of another tree",
    "topic": "trees",
    "difficulty": "Easy",
    "platform": "LeetCode",
    "url": "https://leetcode.com/problems/subtree-of-another-tree/",
    "companies": ["Amazon", "Google", "Facebook"],
    "description": "Check if root has a subtree with the exact same structure and node values as subRoot."
  },
  {
    "id": "tree-25",
    "title": "Check if a binary tree has duplicate subtrees of size 2 or more",
    "topic": "trees",
    "difficulty": "Medium",
    "platform": "GeeksforGeeks",
    "url": "https://practice.geeksforgeeks.org/problems/duplicate-subtree-in-binary-tree/1",
    "companies": ["Amazon", "Google"],
    "description": "Find if there exists duplicate subtrees of size 2 or more in binary tree using serialization."
  },
  {
    "id": "tree-26",
    "title": "Check if two trees are Mirror of each other (Symmetric Tree)",
    "topic": "trees",
    "difficulty": "Easy",
    "platform": "LeetCode",
    "url": "https://leetcode.com/problems/symmetric-tree/",
    "companies": ["Amazon", "Microsoft", "LinkedIn"],
    "description": "Check whether binary tree is a symmetric mirror of itself around its center."
  },
  {
    "id": "tree-27",
    "title": "Sum of Nodes on the Longest path from root to leaf node",
    "topic": "trees",
    "difficulty": "Medium",
    "platform": "GeeksforGeeks",
    "url": "https://practice.geeksforgeeks.org/problems/sum-of-the-longest-bloodline-of-a-tree/1",
    "companies": ["Amazon"],
    "description": "Find the sum of all nodes on the longest path from root to any leaf node."
  },
  {
    "id": "tree-28",
    "title": "Check if given graph is tree or not",
    "topic": "trees",
    "difficulty": "Medium",
    "platform": "LeetCode",
    "url": "https://leetcode.com/problems/graph-valid-tree/",
    "companies": ["Google", "Amazon", "Facebook"],
    "description": "Given n nodes labeled 0 to n-1 and list of undirected edges, check if edges form valid tree (no cycles, connected)."
  },
  {
    "id": "tree-29",
    "title": "Find Largest subtree sum in a tree",
    "topic": "trees",
    "difficulty": "Medium",
    "platform": "GeeksforGeeks",
    "url": "https://www.geeksforgeeks.org/find-largest-subtree-sum-tree/",
    "companies": ["Amazon"],
    "description": "Find the maximum subtree sum among all subtrees in a given binary tree using postorder DFS."
  },
  {
    "id": "tree-30",
    "title": "Maximum Sum of nodes in Binary tree such that no two are adjacent",
    "topic": "trees",
    "difficulty": "Medium",
    "platform": "LeetCode",
    "url": "https://leetcode.com/problems/house-robber-iii/",
    "companies": ["Amazon", "Google", "Uber"],
    "description": "Determine maximum amount of money thief can rob from binary tree houses where adjacent houses cannot be robbed."
  },
  {
    "id": "tree-31",
    "title": "Print all 'K' sum paths in a binary tree",
    "topic": "trees",
    "difficulty": "Medium",
    "platform": "LeetCode",
    "url": "https://leetcode.com/problems/path-sum-iii/",
    "companies": ["Amazon", "Microsoft"],
    "description": "Find number of paths where the sum of values along path equals targetSum using prefix sum hash map."
  },
  {
    "id": "tree-32",
    "title": "Find LCA in a Binary tree",
    "topic": "trees",
    "difficulty": "Medium",
    "platform": "LeetCode",
    "url": "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/",
    "companies": ["Amazon", "Microsoft", "Google", "Facebook"],
    "description": "Find lowest common ancestor (LCA) of two given nodes p and q in binary tree."
  },
  {
    "id": "tree-33",
    "title": "Find distance between two nodes in a Binary tree",
    "topic": "trees",
    "difficulty": "Medium",
    "platform": "GeeksforGeeks",
    "url": "https://practice.geeksforgeeks.org/problems/min-distance-between-two-given-nodes-of-a-binary-tree/1",
    "companies": ["Amazon", "Microsoft"],
    "description": "Find minimum distance between two given nodes a and b: dist(root, a) + dist(root, b) - 2*dist(root, LCA)."
  },
  {
    "id": "tree-34",
    "title": "Kth Ancestor of node in a Binary tree",
    "topic": "trees",
    "difficulty": "Medium",
    "platform": "GeeksforGeeks",
    "url": "https://practice.geeksforgeeks.org/problems/kth-ancestor-in-a-tree/1",
    "companies": ["Amazon"],
    "description": "Find the kth ancestor of a given node in binary tree using binary lifting or backtracking."
  },
  {
    "id": "tree-35",
    "title": "Find all Duplicate subtrees in a Binary tree",
    "topic": "trees",
    "difficulty": "Medium",
    "platform": "LeetCode",
    "url": "https://leetcode.com/problems/find-duplicate-subtrees/",
    "companies": ["Amazon", "Google"],
    "description": "Return all duplicate subtrees in a binary tree by serializing subtrees into string IDs."
  }
]

# BST (bst-4 to bst-22, 19 items)
bst_addl = [
  {
    "id": "bst-4",
    "title": "Find inorder predecessor and successor for a given key in BST",
    "topic": "bst",
    "difficulty": "Medium",
    "platform": "GeeksforGeeks",
    "url": "https://practice.geeksforgeeks.org/problems/predecessor-and-successor/1",
    "companies": ["Amazon", "Microsoft"],
    "description": "Find inorder predecessor and successor of given key in BST in O(H) time and O(1) space."
  },
  {
    "id": "bst-5",
    "title": "Check if a tree is a BST or not (Validate BST)",
    "topic": "bst",
    "difficulty": "Medium",
    "platform": "LeetCode",
    "url": "https://leetcode.com/problems/validate-binary-search-tree/",
    "companies": ["Amazon", "Microsoft", "Google", "Facebook"],
    "description": "Determine if binary tree is valid BST with strictly bounded ranges [minVal, maxVal]."
  },
  {
    "id": "bst-6",
    "title": "Populate Inorder Successor for all nodes",
    "topic": "bst",
    "difficulty": "Medium",
    "platform": "GeeksforGeeks",
    "url": "https://practice.geeksforgeeks.org/problems/populate-inorder-successor-for-all-nodes/1",
    "companies": ["Amazon", "Microsoft"],
    "description": "Populate next pointer for all nodes to point to their inorder successor using reverse inorder traversal."
  },
  {
    "id": "bst-7",
    "title": "Find LCA of 2 nodes in a BST",
    "topic": "bst",
    "difficulty": "Easy",
    "platform": "LeetCode",
    "url": "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/",
    "companies": ["Amazon", "Microsoft", "Twitter"],
    "description": "Find LCA of two nodes in BST in O(H) time by comparing node values with root value."
  },
  {
    "id": "bst-8",
    "title": "Construct BST from preorder traversal",
    "topic": "bst",
    "difficulty": "Medium",
    "platform": "LeetCode",
    "url": "https://leetcode.com/problems/construct-binary-search-tree-from-preorder-traversal/",
    "companies": ["Amazon", "Microsoft"],
    "description": "Construct BST from preorder traversal array in O(N) time using upper bound limits."
  },
  {
    "id": "bst-9",
    "title": "Convert Binary tree into BST",
    "topic": "bst",
    "difficulty": "Medium",
    "platform": "GeeksforGeeks",
    "url": "https://practice.geeksforgeeks.org/problems/binary-tree-to-bst/1",
    "companies": ["Amazon"],
    "description": "Convert binary tree to BST preserving original tree structure using sorted inorder traversal array."
  },
  {
    "id": "bst-10",
    "title": "Convert a normal BST to Balanced BST",
    "topic": "bst",
    "difficulty": "Medium",
    "platform": "LeetCode",
    "url": "https://leetcode.com/problems/balance-a-binary-search-tree/",
    "companies": ["Amazon", "Facebook"],
    "description": "Convert unbalanced BST to balanced BST in O(N) time by extracting sorted inorder array and binary building."
  },
  {
    "id": "bst-11",
    "title": "Merge two BSTs",
    "topic": "bst",
    "difficulty": "Medium",
    "platform": "GeeksforGeeks",
    "url": "https://practice.geeksforgeeks.org/problems/merge-two-bst-s/1",
    "companies": ["Amazon", "Google"],
    "description": "Merge two BSTs into a single balanced BST or sorted list in O(M+N) time."
  },
  {
    "id": "bst-12",
    "title": "Find Kth largest element in BST",
    "topic": "bst",
    "difficulty": "Easy",
    "platform": "GeeksforGeeks",
    "url": "https://practice.geeksforgeeks.org/problems/kth-largest-element-in-bst/1",
    "companies": ["Amazon", "Microsoft", "Samsung"],
    "description": "Find kth largest element in BST in O(H + K) time using reverse inorder traversal (Right -> Root -> Left)."
  },
  {
    "id": "bst-13",
    "title": "Find Kth smallest element in BST",
    "topic": "bst",
    "difficulty": "Medium",
    "platform": "LeetCode",
    "url": "https://leetcode.com/problems/kth-smallest-element-in-a-bst/",
    "companies": ["Amazon", "Google", "Facebook"],
    "description": "Find kth smallest element in BST using inorder traversal stack."
  },
  {
    "id": "bst-14",
    "title": "Count pairs from 2 BST whose sum is equal to given value 'X'",
    "topic": "bst",
    "difficulty": "Medium",
    "platform": "GeeksforGeeks",
    "url": "https://practice.geeksforgeeks.org/problems/brothers-from-different-root/1",
    "companies": ["Amazon"],
    "description": "Count pairs (node1 from bst1, node2 from bst2) such that node1.data + node2.data = X using two BST iterators."
  },
  {
    "id": "bst-15",
    "title": "Find the median of BST in O(n) time and O(1) space",
    "topic": "bst",
    "difficulty": "Hard",
    "platform": "GeeksforGeeks",
    "url": "https://www.geeksforgeeks.org/find-median-bst-time-o1-space/",
    "companies": ["Amazon"],
    "description": "Find median of BST using Morris Inorder Traversal to count nodes and find middle element in O(1) space."
  },
  {
    "id": "bst-16",
    "title": "Count BST nodes that lie in a given range",
    "topic": "bst",
    "difficulty": "Easy",
    "platform": "GeeksforGeeks",
    "url": "https://practice.geeksforgeeks.org/problems/count-bst-nodes-that-lie-in-a-given-range/1",
    "companies": ["Amazon", "Microsoft"],
    "description": "Count number of nodes in BST that fall within range [low, high] with optimal pruning."
  },
  {
    "id": "bst-17",
    "title": "Replace every element with the least greater element on its right",
    "topic": "bst",
    "difficulty": "Hard",
    "platform": "GeeksforGeeks",
    "url": "https://www.geeksforgeeks.org/replace-every-element-with-the-least-greater-element-on-its-right/",
    "companies": ["Amazon"],
    "description": "Insert elements from right to left into a BST and track inorder successor for each inserted node."
  },
  {
    "id": "bst-18",
    "title": "Given 'n' appointments, find the conflicting appointments",
    "topic": "bst",
    "difficulty": "Medium",
    "platform": "GeeksforGeeks",
    "url": "https://www.geeksforgeeks.org/given-n-appointments-find-conflicting-appointments/",
    "companies": ["Amazon"],
    "description": "Identify conflicting appointments using an Interval Tree or BST of intervals."
  },
  {
    "id": "bst-19",
    "title": "Check preorder valid for BST or not",
    "topic": "bst",
    "difficulty": "Medium",
    "platform": "GeeksforGeeks",
    "url": "https://practice.geeksforgeeks.org/problems/preorder-to-postorder4423/1",
    "companies": ["Amazon"],
    "description": "Check if an array represents valid preorder traversal of a BST using monotonic stack in O(N) time."
  },
  {
    "id": "bst-20",
    "title": "Check whether BST contains Dead End",
    "topic": "bst",
    "difficulty": "Easy",
    "platform": "GeeksforGeeks",
    "url": "https://practice.geeksforgeeks.org/problems/check-whether-bst-contains-dead-end/1",
    "companies": ["Amazon"],
    "description": "Check whether BST contains node where no other integer node can be inserted (i.e. min == max)."
  },
  {
    "id": "bst-21",
    "title": "Largest BST in a Binary Tree",
    "topic": "bst",
    "difficulty": "Hard",
    "platform": "GeeksforGeeks",
    "url": "https://practice.geeksforgeeks.org/problems/largest-bst/1",
    "companies": ["Amazon", "Microsoft"],
    "description": "Find size of largest subtree in binary tree which is also a valid BST using bottom-up postorder DFS."
  },
  {
    "id": "bst-22",
    "title": "Flatten BST to sorted list",
    "topic": "bst",
    "difficulty": "Medium",
    "platform": "GeeksforGeeks",
    "url": "https://www.geeksforgeeks.org/flatten-bst-to-sorted-list-increasing-order/",
    "companies": ["Amazon"],
    "description": "Flatten BST to sorted linked list (or right-skewed tree) in-place without auxiliary memory."
  }
]

with open('scripts/sq_addl.json', 'w') as f:
    json.dump(sq_addl, f, indent=2)
print('Saved sq_addl:', len(sq_addl))

with open('scripts/trees_addl.json', 'w') as f:
    json.dump(trees_addl, f, indent=2)
print('Saved trees_addl:', len(trees_addl))

with open('scripts/bst_addl.json', 'w') as f:
    json.dump(bst_addl, f, indent=2)
print('Saved bst_addl:', len(bst_addl))
