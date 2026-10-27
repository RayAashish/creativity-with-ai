import { ProblemSolution } from '../../../types/dsa';

export const TREES_BST_ARCHETYPES: Record<string, ProblemSolution> = {
  "level_order_traversal": {
    "questionId": "archetype-level_order_traversal",
    "pattern": "Breadth-First Search with Queue",
    "intuition": [
      "Push root to a FIFO Queue.",
      "While queue is not empty, snapshot the level size (queue.size()).",
      "Poll that many nodes, append their values to the current level list, and push their children.",
      "Append the completed level list to the final result."
    ],
    "pseudocode": [
      "FUNCTION levelOrder(root):",
      "  IF root == null: RETURN []",
      "  q = [root]; res = []",
      "  WHILE q is not empty:",
      "    level = []; size = q.size()",
      "    FOR i from 0 TO size - 1:",
      "      node = q.poll(); level.add(node.val)",
      "      IF node.left: q.add(node.left)",
      "      IF node.right: q.add(node.right)",
      "    res.add(level)",
      "  RETURN res"
    ],
    "timeComplexity": "O(N)",
    "spaceComplexity": "O(W) = O(N)",
    "complexityExplanation": "Processes nodes level by level using a FIFO Queue; maximum memory bounded by tree maximum width W <= N/2.",
    "edgeCases": [
      "Empty tree (root == null)",
      "Single node tree",
      "Skewed tree (linked list line)"
    ],
    "code": {
      "java": "import java.util.*;\n\nclass TreeNode {\n    int val;\n    TreeNode left, right;\n    TreeNode(int val) { this.val = val; }\n}\n\npublic class Solution {\n    public List<List<Integer>> levelOrder(TreeNode root) {\n        List<List<Integer>> res = new ArrayList<>();\n        if (root == null) return res;\n        Queue<TreeNode> queue = new LinkedList<>();\n        queue.offer(root);\n        while (!queue.isEmpty()) {\n            int levelSize = queue.size();\n            List<Integer> currentLevel = new ArrayList<>();\n            for (int i = 0; i < levelSize; i++) {\n                TreeNode node = queue.poll();\n                currentLevel.add(node.val);\n                if (node.left != null) queue.offer(node.left);\n                if (node.right != null) queue.offer(node.right);\n            }\n            res.add(currentLevel);\n        }\n        return res;\n    }\n}",
      "python": "from collections import deque\n\nclass TreeNode:\n    def __init__(self, val=0, left=None, right=None):\n        self.val = val\n        self.left = left\n        self.right = right\n\nclass Solution:\n    def levelOrder(self, root: TreeNode | None) -> list[list[int]]:\n        if not root: return []\n        res, q = [], deque([root])\n        while q:\n            level = []\n            for _ in range(len(q)):\n                node = q.popleft()\n                level.append(node.val)\n                if node.left: q.append(node.left)\n                if node.right: q.append(node.right)\n            res.append(level)\n        return res",
      "cpp": "#include <vector>\n#include <queue>\n\nstruct TreeNode {\n    int val;\n    TreeNode *left, *right;\n    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}\n};\n\nclass Solution {\npublic:\n    std::vector<std::vector<int>> levelOrder(TreeNode* root) {\n        std::vector<std::vector<int>> res;\n        if (!root) return res;\n        std::queue<TreeNode*> q;\n        q.push(root);\n        while (!q.empty()) {\n            int size = q.size();\n            std::vector<int> level;\n            for (int i = 0; i < size; i++) {\n                TreeNode* node = q.front(); q.pop();\n                level.push_back(node->val);\n                if (node->left) q.push(node->left);\n                if (node->right) q.push(node->right);\n            }\n            res.push_back(level);\n        }\n        return res;\n    }\n};",
      "javascript": "function levelOrder(root) {\n    if (!root) return [];\n    const res = [], q = [root];\n    while (q.length > 0) {\n        const size = q.length, level = [];\n        for (let i = 0; i < size; i++) {\n            const node = q.shift();\n            level.push(node.val);\n            if (node.left) q.push(node.left);\n            if (node.right) q.push(node.right);\n        }\n        res.push(level);\n    }\n    return res;\n}"
    },
    "approaches": {
      "brute": {
        "name": "Brute Force (Repeated Depth-Bounded Inquiries)",
        "tier": "brute",
        "badge": "\ud83e\udd49 Brute Force",
        "intuition": [
          "Iterative scan for each depth."
        ],
        "timeComplexity": "O(N * H)",
        "spaceComplexity": "O(H)",
        "complexityExplanation": "Finds tree height H then loops d from 1 to H, printing all nodes at distance d via full recursive scans.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public List<List<Integer>> levelOrderBrute(TreeNode root) {\n        List<List<Integer>> res = new ArrayList<>();\n        int h = height(root);\n        for (int i = 1; i <= h; i++) {\n            List<Integer> level = new ArrayList<>();\n            getNodesAtLevel(root, i, level);\n            res.add(level);\n        }\n        return res;\n    }\n    private int height(TreeNode node) {\n        if (node == null) return 0;\n        return 1 + Math.max(height(node.left), height(node.right));\n    }\n    private void getNodesAtLevel(TreeNode node, int level, List<Integer> list) {\n        if (node == null) return;\n        if (level == 1) list.add(node.val);\n        else {\n            getNodesAtLevel(node.left, level - 1, list);\n            getNodesAtLevel(node.right, level - 1, list);\n        }\n    }\n}",
          "python": "class Solution:\n    def levelOrderBrute(self, root: TreeNode | None) -> list[list[int]]:\n        def h(node):\n            return 0 if not node else 1 + max(h(node.left), h(node.right))\n        def get_lvl(node, lvl, acc):\n            if not node: return\n            if lvl == 1: acc.append(node.val)\n            else:\n                get_lvl(node.left, lvl - 1, acc)\n                get_lvl(node.right, lvl - 1, acc)\n        height, res = h(root), []\n        for i in range(1, height + 1):\n            cur = []\n            get_lvl(root, i, cur)\n            res.append(cur)\n        return res",
          "cpp": "#include <vector>\n#include <algorithm>\n\nclass Solution {\n    int height(TreeNode* node) {\n        if (!node) return 0;\n        return 1 + std::max(height(node->left), height(node->right));\n    }\n    void getNodes(TreeNode* node, int level, std::vector<int>& out) {\n        if (!node) return;\n        if (level == 1) out.push_back(node->val);\n        else {\n            getNodes(node->left, level - 1, out);\n            getNodes(node->right, level - 1, out);\n        }\n    }\npublic:\n    std::vector<std::vector<int>> levelOrderBrute(TreeNode* root) {\n        std::vector<std::vector<int>> res;\n        int h = height(root);\n        for (int i = 1; i <= h; i++) {\n            std::vector<int> level;\n            getNodes(root, i, level);\n            res.push_back(level);\n        }\n        return res;\n    }\n};",
          "javascript": "function levelOrderBrute(root) {\n    function h(node) { return !node ? 0 : 1 + Math.max(h(node.left), h(node.right)); }\n    function getNodes(node, level, acc) {\n        if (!node) return;\n        if (level === 1) acc.push(node.val);\n        else {\n            getNodes(node.left, level - 1, acc);\n            getNodes(node.right, level - 1, acc);\n        }\n    }\n    const height = h(root), res = [];\n    for (let i = 1; i <= height; i++) {\n        const cur = [];\n        getNodes(root, i, cur);\n        res.push(cur);\n    }\n    return res;\n}"
        }
      },
      "better": {
        "name": "Better (DFS with Level Depth Tracking)",
        "tier": "better",
        "badge": "\ud83e\udd48 Better",
        "intuition": [
          "DFS with depth index."
        ],
        "timeComplexity": "O(N)",
        "spaceComplexity": "O(H) recursion",
        "complexityExplanation": "Traverses tree with preorder DFS passing depth level as argument and placing node.val into res[depth].",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public List<List<Integer>> levelOrderBetter(TreeNode root) {\n        List<List<Integer>> res = new ArrayList<>();\n        dfs(root, 0, res);\n        return res;\n    }\n    private void dfs(TreeNode node, int level, List<List<Integer>> res) {\n        if (node == null) return;\n        if (level == res.size()) res.add(new ArrayList<>());\n        res.get(level).add(node.val);\n        dfs(node.left, level + 1, res);\n        dfs(node.right, level + 1, res);\n    }\n}",
          "python": "class Solution:\n    def levelOrderBetter(self, root: TreeNode | None) -> list[list[int]]:\n        res = []\n        def dfs(node, level):\n            if not node: return\n            if level == len(res): res.append([])\n            res[level].append(node.val)\n            dfs(node.left, level + 1)\n            dfs(node.right, level + 1)\n        dfs(root, 0)\n        return res",
          "cpp": "#include <vector>\n\nclass Solution {\n    void dfs(TreeNode* node, int level, std::vector<std::vector<int>>& res) {\n        if (!node) return;\n        if (level == (int)res.size()) res.push_back({});\n        res[level].push_back(node->val);\n        dfs(node->left, level + 1, res);\n        dfs(node->right, level + 1, res);\n    }\npublic:\n    std::vector<std::vector<int>> levelOrderBetter(TreeNode* root) {\n        std::vector<std::vector<int>> res;\n        dfs(root, 0, res);\n        return res;\n    }\n};",
          "javascript": "function levelOrderBetter(root) {\n    const res = [];\n    function dfs(node, level) {\n        if (!node) return;\n        if (level === res.length) res.push([]);\n        res[level].push(node.val);\n        dfs(node.left, level + 1);\n        dfs(node.right, level + 1);\n    }\n    dfs(root, 0);\n    return res;\n}"
        }
      },
      "optimal": {
        "name": "Optimal (Breadth-First Search with Queue)",
        "tier": "optimal",
        "badge": "\ud83e\udd47 Optimal",
        "intuition": [
          "Push root to a FIFO Queue.",
          "While queue is not empty, snapshot the level size (queue.size()).",
          "Poll that many nodes, append their values to the current level list, and push their children.",
          "Append the completed level list to the final result."
        ],
        "pseudocode": [
          "FUNCTION levelOrder(root):",
          "  IF root == null: RETURN []",
          "  q = [root]; res = []",
          "  WHILE q is not empty:",
          "    level = []; size = q.size()",
          "    FOR i from 0 TO size - 1:",
          "      node = q.poll(); level.add(node.val)",
          "      IF node.left: q.add(node.left)",
          "      IF node.right: q.add(node.right)",
          "    res.add(level)",
          "  RETURN res"
        ],
        "timeComplexity": "O(N)",
        "spaceComplexity": "O(W) = O(N)",
        "complexityExplanation": "Processes nodes level by level using a FIFO Queue; maximum memory bounded by tree maximum width W <= N/2.",
        "code": {
          "java": "import java.util.*;\n\nclass TreeNode {\n    int val;\n    TreeNode left, right;\n    TreeNode(int val) { this.val = val; }\n}\n\npublic class Solution {\n    public List<List<Integer>> levelOrder(TreeNode root) {\n        List<List<Integer>> res = new ArrayList<>();\n        if (root == null) return res;\n        Queue<TreeNode> queue = new LinkedList<>();\n        queue.offer(root);\n        while (!queue.isEmpty()) {\n            int levelSize = queue.size();\n            List<Integer> currentLevel = new ArrayList<>();\n            for (int i = 0; i < levelSize; i++) {\n                TreeNode node = queue.poll();\n                currentLevel.add(node.val);\n                if (node.left != null) queue.offer(node.left);\n                if (node.right != null) queue.offer(node.right);\n            }\n            res.add(currentLevel);\n        }\n        return res;\n    }\n}",
          "python": "from collections import deque\n\nclass TreeNode:\n    def __init__(self, val=0, left=None, right=None):\n        self.val = val\n        self.left = left\n        self.right = right\n\nclass Solution:\n    def levelOrder(self, root: TreeNode | None) -> list[list[int]]:\n        if not root: return []\n        res, q = [], deque([root])\n        while q:\n            level = []\n            for _ in range(len(q)):\n                node = q.popleft()\n                level.append(node.val)\n                if node.left: q.append(node.left)\n                if node.right: q.append(node.right)\n            res.append(level)\n        return res",
          "cpp": "#include <vector>\n#include <queue>\n\nstruct TreeNode {\n    int val;\n    TreeNode *left, *right;\n    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}\n};\n\nclass Solution {\npublic:\n    std::vector<std::vector<int>> levelOrder(TreeNode* root) {\n        std::vector<std::vector<int>> res;\n        if (!root) return res;\n        std::queue<TreeNode*> q;\n        q.push(root);\n        while (!q.empty()) {\n            int size = q.size();\n            std::vector<int> level;\n            for (int i = 0; i < size; i++) {\n                TreeNode* node = q.front(); q.pop();\n                level.push_back(node->val);\n                if (node->left) q.push(node->left);\n                if (node->right) q.push(node->right);\n            }\n            res.push_back(level);\n        }\n        return res;\n    }\n};",
          "javascript": "function levelOrder(root) {\n    if (!root) return [];\n    const res = [], q = [root];\n    while (q.length > 0) {\n        const size = q.length, level = [];\n        for (let i = 0; i < size; i++) {\n            const node = q.shift();\n            level.push(node.val);\n            if (node.left) q.push(node.left);\n            if (node.right) q.push(node.right);\n        }\n        res.push(level);\n    }\n    return res;\n}"
        }
      }
    }
  },
  "max_depth_binary_tree": {
    "questionId": "archetype-max_depth_binary_tree",
    "pattern": "Divide and Conquer Post-Order DFS",
    "intuition": [
      "Base case: if root is null, depth is 0.",
      "Recursively compute depth of left subtree and right subtree.",
      "Current node adds 1 to the maximum of the two subtree depths.",
      "Return 1 + Math.max(leftDepth, rightDepth)."
    ],
    "pseudocode": [
      "FUNCTION maxDepth(root):",
      "  IF root == null: RETURN 0",
      "  left = maxDepth(root.left)",
      "  right = maxDepth(root.right)",
      "  RETURN 1 + MAX(left, right)"
    ],
    "timeComplexity": "O(N)",
    "spaceComplexity": "O(H)",
    "complexityExplanation": "Calculates max depth recursively: 1 + max(maxDepth(left), maxDepth(right)) in O(N) time and O(H) call stack.",
    "edgeCases": [
      "Empty tree (root == null)",
      "Single node",
      "Left/right skewed chain"
    ],
    "code": {
      "java": "public class Solution {\n    public int maxDepth(TreeNode root) {\n        if (root == null) return 0;\n        int left = maxDepth(root.left);\n        int right = maxDepth(root.right);\n        return 1 + Math.max(left, right);\n    }\n}",
      "python": "class Solution:\n    def maxDepth(self, root: TreeNode | None) -> int:\n        if not root: return 0\n        return 1 + max(self.maxDepth(root.left), self.maxDepth(root.right))",
      "cpp": "class Solution {\npublic:\n    int maxDepth(TreeNode* root) {\n        if (!root) return 0;\n        return 1 + std::max(maxDepth(root->left), maxDepth(root->right));\n    }\n};",
      "javascript": "function maxDepth(root) {\n    if (!root) return 0;\n    return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));\n}"
    },
    "approaches": {
      "brute": {
        "name": "Brute Force (Root to Leaf Path Collection)",
        "tier": "brute",
        "badge": "\ud83e\udd49 Brute Force",
        "intuition": [
          "Find all paths and pick max length."
        ],
        "timeComplexity": "O(N\u00b2)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Traverses all root-to-leaf paths, storing lengths in an array, then returns the maximum.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int maxDepthBrute(TreeNode root) {\n        if (root == null) return 0;\n        List<Integer> lengths = new ArrayList<>();\n        findPaths(root, 1, lengths);\n        int max = 0;\n        for (int l : lengths) max = Math.max(max, l);\n        return max;\n    }\n    private void findPaths(TreeNode node, int len, List<Integer> lengths) {\n        if (node == null) return;\n        if (node.left == null && node.right == null) {\n            lengths.add(len);\n            return;\n        }\n        findPaths(node.left, len + 1, lengths);\n        findPaths(node.right, len + 1, lengths);\n    }\n}",
          "python": "class Solution:\n    def maxDepthBrute(self, root: TreeNode | None) -> int:\n        if not root: return 0\n        lens = []\n        def dfs(node, cur):\n            if not node: return\n            if not node.left and not node.right: lens.append(cur); return\n            dfs(node.left, cur + 1)\n            dfs(node.right, cur + 1)\n        dfs(root, 1)\n        return max(lens) if lens else 0",
          "cpp": "#include <vector>\n#include <algorithm>\n\nclass Solution {\n    void dfs(TreeNode* node, int cur, std::vector<int>& out) {\n        if (!node) return;\n        if (!node->left && !node->right) { out.push_back(cur); return; }\n        dfs(node->left, cur + 1, out);\n        dfs(node->right, cur + 1, out);\n    }\npublic:\n    int maxDepthBrute(TreeNode* root) {\n        if (!root) return 0;\n        std::vector<int> lens;\n        dfs(root, 1, lens);\n        return *std::max_element(lens.begin(), lens.end());\n    }\n};",
          "javascript": "function maxDepthBrute(root) {\n    if (!root) return 0;\n    const lens = [];\n    function dfs(node, cur) {\n        if (!node) return;\n        if (!node.left && !node.right) { lens.push(cur); return; }\n        dfs(node.left, cur + 1);\n        dfs(node.right, cur + 1);\n    }\n    dfs(root, 1);\n    return Math.max(...lens);\n}"
        }
      },
      "better": {
        "name": "Better (Iterative BFS Level Count)",
        "tier": "better",
        "badge": "\ud83e\udd48 Better",
        "intuition": [
          "Count levels with BFS."
        ],
        "timeComplexity": "O(N)",
        "spaceComplexity": "O(W) = O(N)",
        "complexityExplanation": "Counts the number of complete levels dequeued using a Queue.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int maxDepthBetter(TreeNode root) {\n        if (root == null) return 0;\n        Queue<TreeNode> queue = new LinkedList<>();\n        queue.offer(root);\n        int depth = 0;\n        while (!queue.isEmpty()) {\n            int size = queue.size();\n            for (int i = 0; i < size; i++) {\n                TreeNode node = queue.poll();\n                if (node.left != null) queue.offer(node.left);\n                if (node.right != null) queue.offer(node.right);\n            }\n            depth++;\n        }\n        return depth;\n    }\n}",
          "python": "from collections import deque\n\nclass Solution:\n    def maxDepthBetter(self, root: TreeNode | None) -> int:\n        if not root: return 0\n        q, depth = deque([root]), 0\n        while q:\n            for _ in range(len(q)):\n                n = q.popleft()\n                if n.left: q.append(n.left)\n                if n.right: q.append(n.right)\n            depth += 1\n        return depth",
          "cpp": "#include <queue>\n\nclass Solution {\npublic:\n    int maxDepthBetter(TreeNode* root) {\n        if (!root) return 0;\n        std::queue<TreeNode*> q;\n        q.push(root);\n        int depth = 0;\n        while (!q.empty()) {\n            int size = q.size();\n            for (int i = 0; i < size; i++) {\n                TreeNode* n = q.front(); q.pop();\n                if (n->left) q.push(n->left);\n                if (n->right) q.push(n->right);\n            }\n            depth++;\n        }\n        return depth;\n    }\n};",
          "javascript": "function maxDepthBetter(root) {\n    if (!root) return 0;\n    const q = [root];\n    let depth = 0;\n    while (q.length > 0) {\n        const size = q.length;\n        for (let i = 0; i < size; i++) {\n            const n = q.shift();\n            if (n.left) q.push(n.left);\n            if (n.right) q.push(n.right);\n        }\n        depth++;\n    }\n    return depth;\n}"
        }
      },
      "optimal": {
        "name": "Optimal (Divide and Conquer Post-Order DFS)",
        "tier": "optimal",
        "badge": "\ud83e\udd47 Optimal",
        "intuition": [
          "Base case: if root is null, depth is 0.",
          "Recursively compute depth of left subtree and right subtree.",
          "Current node adds 1 to the maximum of the two subtree depths.",
          "Return 1 + Math.max(leftDepth, rightDepth)."
        ],
        "pseudocode": [
          "FUNCTION maxDepth(root):",
          "  IF root == null: RETURN 0",
          "  left = maxDepth(root.left)",
          "  right = maxDepth(root.right)",
          "  RETURN 1 + MAX(left, right)"
        ],
        "timeComplexity": "O(N)",
        "spaceComplexity": "O(H)",
        "complexityExplanation": "Calculates max depth recursively: 1 + max(maxDepth(left), maxDepth(right)) in O(N) time and O(H) call stack.",
        "code": {
          "java": "public class Solution {\n    public int maxDepth(TreeNode root) {\n        if (root == null) return 0;\n        int left = maxDepth(root.left);\n        int right = maxDepth(root.right);\n        return 1 + Math.max(left, right);\n    }\n}",
          "python": "class Solution:\n    def maxDepth(self, root: TreeNode | None) -> int:\n        if not root: return 0\n        return 1 + max(self.maxDepth(root.left), self.maxDepth(root.right))",
          "cpp": "class Solution {\npublic:\n    int maxDepth(TreeNode* root) {\n        if (!root) return 0;\n        return 1 + std::max(maxDepth(root->left), maxDepth(root->right));\n    }\n};",
          "javascript": "function maxDepth(root) {\n    if (!root) return 0;\n    return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));\n}"
        }
      }
    }
  },
  "validate_bst": {
    "questionId": "archetype-validate_bst",
    "pattern": "Min/Max Range Bounded DFS",
    "intuition": [
      "For root, bounds are (-infinity, +infinity).",
      "When moving to left child, update upper bound: (minVal, node.val).",
      "When moving to right child, update lower bound: (node.val, maxVal).",
      "If node.val <= minVal or node.val >= maxVal, the BST invariant is violated (return false)."
    ],
    "pseudocode": [
      "FUNCTION isValidBST(root):",
      "  RETURN validate(root, -INF, +INF)",
      "FUNCTION validate(node, min, max):",
      "  IF node == null: RETURN true",
      "  IF node.val <= min OR node.val >= max: RETURN false",
      "  RETURN validate(node.left, min, node.val) AND validate(node.right, node.val, max)"
    ],
    "timeComplexity": "O(N)",
    "spaceComplexity": "O(H)",
    "complexityExplanation": "Validates that every node's value falls strictly between (minVal, maxVal), updating bounds dynamically on left/right descent.",
    "edgeCases": [
      "Values at Integer.MIN_VALUE or MAX_VALUE",
      "Duplicates in BST (invalid by definition)",
      "Subtree violation deep in right branch"
    ],
    "code": {
      "java": "public class Solution {\n    public boolean isValidBST(TreeNode root) {\n        return validate(root, Long.MIN_VALUE, Long.MAX_VALUE);\n    }\n    private boolean validate(TreeNode node, long min, long max) {\n        if (node == null) return true;\n        if (node.val <= min || node.val >= max) return false;\n        return validate(node.left, min, node.val) && validate(node.right, node.val, max);\n    }\n}",
      "python": "class Solution:\n    def isValidBST(self, root: TreeNode | None) -> bool:\n        def validate(node, low, high):\n            if not node: return True\n            if not (low < node.val < high): return False\n            return validate(node.left, low, node.val) and validate(node.right, node.val, high)\n        return validate(root, float('-inf'), float('inf'))",
      "cpp": "#include <climits>\n\nclass Solution {\n    bool validate(TreeNode* node, long minVal, long maxVal) {\n        if (!node) return true;\n        if (node->val <= minVal || node->val >= maxVal) return false;\n        return validate(node->left, minVal, node->val) && validate(node->right, node->val, maxVal);\n    }\npublic:\n    bool isValidBST(TreeNode* root) {\n        return validate(root, LONG_MIN, LONG_MAX);\n    }\n};",
      "javascript": "function isValidBST(root) {\n    function validate(node, min, max) {\n        if (!node) return true;\n        if (node.val <= min || node.val >= max) return false;\n        return validate(node.left, min, node.val) && validate(node.right, node.val, max);\n    }\n    return validate(root, -Infinity, Infinity);\n}"
    },
    "approaches": {
      "brute": {
        "name": "Brute Force (Inorder to Array and Check Sorted)",
        "tier": "brute",
        "badge": "\ud83e\udd49 Brute Force",
        "intuition": [
          "Flatten to array via inorder and verify sorted."
        ],
        "timeComplexity": "O(N)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Extracts all values via inorder traversal to an array and verifies strict ascending order.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public boolean isValidBSTBrute(TreeNode root) {\n        List<Integer> list = new ArrayList<>();\n        inorder(root, list);\n        for (int i = 1; i < list.size(); i++) {\n            if (list.get(i) <= list.get(i - 1)) return false;\n        }\n        return true;\n    }\n    private void inorder(TreeNode node, List<Integer> list) {\n        if (node == null) return;\n        inorder(node.left, list);\n        list.add(node.val);\n        inorder(node.right, list);\n    }\n}",
          "python": "class Solution:\n    def isValidBSTBrute(self, root: TreeNode | None) -> bool:\n        vals = []\n        def inorder(n):\n            if not n: return\n            inorder(n.left)\n            vals.append(n.val)\n            inorder(n.right)\n        inorder(root)\n        return all(vals[i] < vals[i+1] for i in range(len(vals) - 1))",
          "cpp": "#include <vector>\n\nclass Solution {\n    void inorder(TreeNode* n, std::vector<int>& out) {\n        if (!n) return;\n        inorder(n->left, out);\n        out.push_back(n->val);\n        inorder(n->right, out);\n    }\npublic:\n    bool isValidBSTBrute(TreeNode* root) {\n        std::vector<int> vals;\n        inorder(root, vals);\n        for (int i = 1; i < (int)vals.size(); i++) {\n            if (vals[i] <= vals[i - 1]) return false;\n        }\n        return true;\n    }\n};",
          "javascript": "function isValidBSTBrute(root) {\n    const vals = [];\n    function inorder(n) {\n        if (!n) return;\n        inorder(n.left);\n        vals.push(n.val);\n        inorder(n.right);\n    }\n    inorder(root);\n    for (let i = 1; i < vals.length; i++) {\n        if (vals[i] <= vals[i - 1]) return false;\n    }\n    return true;\n}"
        }
      },
      "better": {
        "name": "Better (Iterative Inorder with Previous Node Tracking)",
        "tier": "better",
        "badge": "\ud83e\udd48 Better",
        "intuition": [
          "Inorder traversal must produce strictly ascending sequence."
        ],
        "timeComplexity": "O(N)",
        "spaceComplexity": "O(H)",
        "complexityExplanation": "Performs inorder traversal tracking previous element; values must be strictly increasing.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public boolean isValidBSTBetter(TreeNode root) {\n        Stack<TreeNode> stack = new Stack<>();\n        TreeNode curr = root;\n        TreeNode prev = null;\n        while (curr != null || !stack.isEmpty()) {\n            while (curr != null) {\n                stack.push(curr);\n                curr = curr.left;\n            }\n            curr = stack.pop();\n            if (prev != null && curr.val <= prev.val) return false;\n            prev = curr;\n            curr = curr.right;\n        }\n        return true;\n    }\n}",
          "python": "class Solution:\n    def isValidBSTBetter(self, root: TreeNode | None) -> bool:\n        stack, prev, curr = [], None, root\n        while curr or stack:\n            while curr:\n                stack.append(curr)\n                curr = curr.left\n            curr = stack.pop()\n            if prev and curr.val <= prev.val: return False\n            prev, curr = curr, curr.right\n        return True",
          "cpp": "#include <stack>\n\nclass Solution {\npublic:\n    bool isValidBSTBetter(TreeNode* root) {\n        std::stack<TreeNode*> stack;\n        TreeNode *curr = root, *prev = nullptr;\n        while (curr || !stack.empty()) {\n            while (curr) { stack.push(curr); curr = curr->left; }\n            curr = stack.top(); stack.pop();\n            if (prev && curr->val <= prev->val) return false;\n            prev = curr;\n            curr = curr->right;\n        }\n        return true;\n    }\n};",
          "javascript": "function isValidBSTBetter(root) {\n    const stack = [];\n    let curr = root, prev = null;\n    while (curr || stack.length > 0) {\n        while (curr) { stack.push(curr); curr = curr.left; }\n        curr = stack.pop();\n        if (prev && curr.val <= prev.val) return false;\n        prev = curr;\n        curr = curr.right;\n    }\n    return true;\n}"
        }
      },
      "optimal": {
        "name": "Optimal (Min/Max Range Bounded DFS)",
        "tier": "optimal",
        "badge": "\ud83e\udd47 Optimal",
        "intuition": [
          "For root, bounds are (-infinity, +infinity).",
          "When moving to left child, update upper bound: (minVal, node.val).",
          "When moving to right child, update lower bound: (node.val, maxVal).",
          "If node.val <= minVal or node.val >= maxVal, the BST invariant is violated (return false)."
        ],
        "pseudocode": [
          "FUNCTION isValidBST(root):",
          "  RETURN validate(root, -INF, +INF)",
          "FUNCTION validate(node, min, max):",
          "  IF node == null: RETURN true",
          "  IF node.val <= min OR node.val >= max: RETURN false",
          "  RETURN validate(node.left, min, node.val) AND validate(node.right, node.val, max)"
        ],
        "timeComplexity": "O(N)",
        "spaceComplexity": "O(H)",
        "complexityExplanation": "Validates that every node's value falls strictly between (minVal, maxVal), updating bounds dynamically on left/right descent.",
        "code": {
          "java": "public class Solution {\n    public boolean isValidBST(TreeNode root) {\n        return validate(root, Long.MIN_VALUE, Long.MAX_VALUE);\n    }\n    private boolean validate(TreeNode node, long min, long max) {\n        if (node == null) return true;\n        if (node.val <= min || node.val >= max) return false;\n        return validate(node.left, min, node.val) && validate(node.right, node.val, max);\n    }\n}",
          "python": "class Solution:\n    def isValidBST(self, root: TreeNode | None) -> bool:\n        def validate(node, low, high):\n            if not node: return True\n            if not (low < node.val < high): return False\n            return validate(node.left, low, node.val) and validate(node.right, node.val, high)\n        return validate(root, float('-inf'), float('inf'))",
          "cpp": "#include <climits>\n\nclass Solution {\n    bool validate(TreeNode* node, long minVal, long maxVal) {\n        if (!node) return true;\n        if (node->val <= minVal || node->val >= maxVal) return false;\n        return validate(node->left, minVal, node->val) && validate(node->right, node->val, maxVal);\n    }\npublic:\n    bool isValidBST(TreeNode* root) {\n        return validate(root, LONG_MIN, LONG_MAX);\n    }\n};",
          "javascript": "function isValidBST(root) {\n    function validate(node, min, max) {\n        if (!node) return true;\n        if (node.val <= min || node.val >= max) return false;\n        return validate(node.left, min, node.val) && validate(node.right, node.val, max);\n    }\n    return validate(root, -Infinity, Infinity);\n}"
        }
      }
    }
  },
  "lowest_common_ancestor": {
    "questionId": "archetype-lowest_common_ancestor",
    "pattern": "Divide and Conquer DFS",
    "intuition": [
      "Base condition: if root == null or root == p or root == q, return root.",
      "Recurse on left child and right child.",
      "If both left and right return non-null nodes, p and q lie in different subtrees; therefore root is the Lowest Common Ancestor.",
      "If only one subtree returns a non-null node, propagate that node upward."
    ],
    "pseudocode": [
      "FUNCTION lowestCommonAncestor(root, p, q):",
      "  IF root == null OR root == p OR root == q: RETURN root",
      "  left = lowestCommonAncestor(root.left, p, q)",
      "  right = lowestCommonAncestor(root.right, p, q)",
      "  IF left != null AND right != null: RETURN root",
      "  RETURN (left != null) ? left : right"
    ],
    "timeComplexity": "O(N)",
    "spaceComplexity": "O(H)",
    "complexityExplanation": "Traverses tree once: if root is null, p, or q, return root. Recursively search left and right. If both return non-null, root is LCA.",
    "edgeCases": [
      "p is ancestor of q",
      "p and q in separate branches",
      "p or q is root"
    ],
    "code": {
      "java": "public class Solution {\n    public TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {\n        if (root == null || root == p || root == q) return root;\n        TreeNode left = lowestCommonAncestor(root.left, p, q);\n        TreeNode right = lowestCommonAncestor(root.right, p, q);\n        if (left != null && right != null) return root;\n        return left != null ? left : right;\n    }\n}",
      "python": "class Solution:\n    def lowestCommonAncestor(self, root: TreeNode, p: TreeNode, q: TreeNode) -> TreeNode | None:\n        if not root or root == p or root == q: return root\n        left = self.lowestCommonAncestor(root.left, p, q)\n        right = self.lowestCommonAncestor(root.right, p, q)\n        if left and right: return root\n        return left or right",
      "cpp": "class Solution {\npublic:\n    TreeNode* lowestCommonAncestor(TreeNode* root, TreeNode* p, TreeNode* q) {\n        if (!root || root == p || root == q) return root;\n        TreeNode* left = lowestCommonAncestor(root->left, p, q);\n        TreeNode* right = lowestCommonAncestor(root->right, p, q);\n        if (left && right) return root;\n        return left ? left : right;\n    }\n};",
      "javascript": "function lowestCommonAncestor(root, p, q) {\n    if (!root || root === p || root === q) return root;\n    const left = lowestCommonAncestor(root.left, p, q);\n    const right = lowestCommonAncestor(root.right, p, q);\n    if (left && right) return root;\n    return left || right;\n}"
    },
    "approaches": {
      "brute": {
        "name": "Brute Force (Root to Node Paths Comparison)",
        "tier": "brute",
        "badge": "\ud83e\udd49 Brute Force",
        "intuition": [
          "Compute both root-to-node paths and find last common element."
        ],
        "timeComplexity": "O(N)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Finds path from root to p and path from root to q into two lists, then returns the last common node.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public TreeNode lowestCommonAncestorBrute(TreeNode root, TreeNode p, TreeNode q) {\n        List<TreeNode> pathP = new ArrayList<>(), pathQ = new ArrayList<>();\n        findPath(root, p, pathP);\n        findPath(root, q, pathQ);\n        TreeNode lca = null;\n        int i = 0;\n        while (i < pathP.size() && i < pathQ.size() && pathP.get(i) == pathQ.get(i)) {\n            lca = pathP.get(i);\n            i++;\n        }\n        return lca;\n    }\n    private boolean findPath(TreeNode root, TreeNode target, List<TreeNode> path) {\n        if (root == null) return false;\n        path.add(root);\n        if (root == target) return true;\n        if (findPath(root.left, target, path) || findPath(root.right, target, path)) return true;\n        path.remove(path.size() - 1);\n        return false;\n    }\n}",
          "python": "class Solution:\n    def lowestCommonAncestorBrute(self, root: TreeNode, p: TreeNode, q: TreeNode) -> TreeNode | None:\n        def get_path(node, target, path):\n            if not node: return False\n            path.append(node)\n            if node == target: return True\n            if get_path(node.left, target, path) or get_path(node.right, target, path): return True\n            path.pop()\n            return False\n        p1, p2 = [], []\n        get_path(root, p, p1)\n        get_path(root, q, p2)\n        lca = None\n        for a, b in zip(p1, p2):\n            if a == b: lca = a\n            else: break\n        return lca",
          "cpp": "#include <vector>\n\nclass Solution {\n    bool getPath(TreeNode* node, TreeNode* target, std::vector<TreeNode*>& path) {\n        if (!node) return false;\n        path.push_back(node);\n        if (node == target) return true;\n        if (getPath(node->left, target, path) || getPath(node->right, target, path)) return true;\n        path.pop_back();\n        return false;\n    }\npublic:\n    TreeNode* lowestCommonAncestorBrute(TreeNode* root, TreeNode* p, TreeNode* q) {\n        std::vector<TreeNode*> p1, p2;\n        getPath(root, p, p1);\n        getPath(root, q, p2);\n        TreeNode* lca = nullptr;\n        for (int i = 0; i < (int)std::min(p1.size(), p2.size()); i++) {\n            if (p1[i] == p2[i]) lca = p1[i];\n            else break;\n        }\n        return lca;\n    }\n};",
          "javascript": "function lowestCommonAncestorBrute(root, p, q) {\n    function getPath(node, target, path) {\n        if (!node) return false;\n        path.push(node);\n        if (node === target) return true;\n        if (getPath(node.left, target, path) || getPath(node.right, target, path)) return true;\n        path.pop();\n        return false;\n    }\n    const p1 = [], p2 = [];\n    getPath(root, p, p1);\n    getPath(root, q, p2);\n    let lca = null;\n    for (let i = 0; i < Math.min(p1.length, p2.length); i++) {\n        if (p1[i] === p2[i]) lca = p1[i];\n        else break;\n    }\n    return lca;\n}"
        }
      },
      "better": {
        "name": "Better (Parent Pointer Hash Map)",
        "tier": "better",
        "badge": "\ud83e\udd48 Better",
        "intuition": [
          "BFS to build parent pointers, then track ancestors in Set."
        ],
        "timeComplexity": "O(N)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Stores parent references for every node in a HashMap using BFS, then walks up p's ancestors with a Set.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public TreeNode lowestCommonAncestorBetter(TreeNode root, TreeNode p, TreeNode q) {\n        Map<TreeNode, TreeNode> parent = new HashMap<>();\n        Queue<TreeNode> queue = new LinkedList<>();\n        parent.put(root, null);\n        queue.offer(root);\n        while (!parent.containsKey(p) || !parent.containsKey(q)) {\n            TreeNode node = queue.poll();\n            if (node.left != null) { parent.put(node.left, node); queue.offer(node.left); }\n            if (node.right != null) { parent.put(node.right, node); queue.offer(node.right); }\n        }\n        Set<TreeNode> ancestors = new HashSet<>();\n        while (p != null) { ancestors.add(p); p = parent.get(p); }\n        while (!ancestors.contains(q)) { q = parent.get(q); }\n        return q;\n    }\n}",
          "python": "class Solution:\n    def lowestCommonAncestorBetter(self, root: TreeNode, p: TreeNode, q: TreeNode) -> TreeNode:\n        parent = {root: None}\n        queue = [root]\n        while p not in parent or q not in parent:\n            node = queue.pop(0)\n            if node.left: parent[node.left] = node; queue.append(node.left)\n            if node.right: parent[node.right] = node; queue.append(node.right)\n        ancestors = set()\n        while p: ancestors.add(p); p = parent[p]\n        while q not in ancestors: q = parent[q]\n        return q",
          "cpp": "#include <unordered_map>\n#include <unordered_set>\n#include <queue>\n\nclass Solution {\npublic:\n    TreeNode* lowestCommonAncestorBetter(TreeNode* root, TreeNode* p, TreeNode* q) {\n        std::unordered_map<TreeNode*, TreeNode*> parent;\n        parent[root] = nullptr;\n        std::queue<TreeNode*> qu; qu.push(root);\n        while (parent.find(p) == parent.end() || parent.find(q) == parent.end()) {\n            TreeNode* node = qu.front(); qu.pop();\n            if (node->left) { parent[node->left] = node; qu.push(node->left); }\n            if (node->right) { parent[node->right] = node; qu.push(node->right); }\n        }\n        std::unordered_set<TreeNode*> anc;\n        while (p) { anc.insert(p); p = parent[p]; }\n        while (anc.find(q) == anc.end()) { q = parent[q]; }\n        return q;\n    }\n};",
          "javascript": "function lowestCommonAncestorBetter(root, p, q) {\n    const parent = new Map();\n    parent.set(root, null);\n    const qu = [root];\n    while (!parent.has(p) || !parent.has(q)) {\n        const node = qu.shift();\n        if (node.left) { parent.set(node.left, node); qu.push(node.left); }\n        if (node.right) { parent.set(node.right, node); qu.push(node.right); }\n    }\n    const anc = new Set();\n    while (p) { anc.add(p); p = parent.get(p); }\n    while (!anc.has(q)) { q = parent.get(q); }\n    return q;\n}"
        }
      },
      "optimal": {
        "name": "Optimal (Divide and Conquer DFS)",
        "tier": "optimal",
        "badge": "\ud83e\udd47 Optimal",
        "intuition": [
          "Base condition: if root == null or root == p or root == q, return root.",
          "Recurse on left child and right child.",
          "If both left and right return non-null nodes, p and q lie in different subtrees; therefore root is the Lowest Common Ancestor.",
          "If only one subtree returns a non-null node, propagate that node upward."
        ],
        "pseudocode": [
          "FUNCTION lowestCommonAncestor(root, p, q):",
          "  IF root == null OR root == p OR root == q: RETURN root",
          "  left = lowestCommonAncestor(root.left, p, q)",
          "  right = lowestCommonAncestor(root.right, p, q)",
          "  IF left != null AND right != null: RETURN root",
          "  RETURN (left != null) ? left : right"
        ],
        "timeComplexity": "O(N)",
        "spaceComplexity": "O(H)",
        "complexityExplanation": "Traverses tree once: if root is null, p, or q, return root. Recursively search left and right. If both return non-null, root is LCA.",
        "code": {
          "java": "public class Solution {\n    public TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {\n        if (root == null || root == p || root == q) return root;\n        TreeNode left = lowestCommonAncestor(root.left, p, q);\n        TreeNode right = lowestCommonAncestor(root.right, p, q);\n        if (left != null && right != null) return root;\n        return left != null ? left : right;\n    }\n}",
          "python": "class Solution:\n    def lowestCommonAncestor(self, root: TreeNode, p: TreeNode, q: TreeNode) -> TreeNode | None:\n        if not root or root == p or root == q: return root\n        left = self.lowestCommonAncestor(root.left, p, q)\n        right = self.lowestCommonAncestor(root.right, p, q)\n        if left and right: return root\n        return left or right",
          "cpp": "class Solution {\npublic:\n    TreeNode* lowestCommonAncestor(TreeNode* root, TreeNode* p, TreeNode* q) {\n        if (!root || root == p || root == q) return root;\n        TreeNode* left = lowestCommonAncestor(root->left, p, q);\n        TreeNode* right = lowestCommonAncestor(root->right, p, q);\n        if (left && right) return root;\n        return left ? left : right;\n    }\n};",
          "javascript": "function lowestCommonAncestor(root, p, q) {\n    if (!root || root === p || root === q) return root;\n    const left = lowestCommonAncestor(root.left, p, q);\n    const right = lowestCommonAncestor(root.right, p, q);\n    if (left && right) return root;\n    return left || right;\n}"
        }
      }
    }
  },
  "invert_binary_tree": {
    "questionId": "archetype-invert_binary_tree",
    "pattern": "Post-Order Recursive Swap",
    "intuition": [
      "Base condition: if root is null, return null.",
      "Recursively invert the left subtree and right subtree.",
      "Swap root.left and root.right.",
      "Return root."
    ],
    "pseudocode": [
      "FUNCTION invertTree(root):",
      "  IF root == null: RETURN null",
      "  left = invertTree(root.left)",
      "  right = invertTree(root.right)",
      "  root.left = right; root.right = left",
      "  RETURN root"
    ],
    "timeComplexity": "O(N)",
    "spaceComplexity": "O(H)",
    "complexityExplanation": "Recursively inverts left and right subtrees and swaps the pointers in O(N) time and O(H) call stack.",
    "edgeCases": [
      "Empty tree",
      "Single node",
      "Full binary tree"
    ],
    "code": {
      "java": "public class Solution {\n    public TreeNode invertTree(TreeNode root) {\n        if (root == null) return null;\n        TreeNode left = invertTree(root.left);\n        TreeNode right = invertTree(root.right);\n        root.left = right;\n        root.right = left;\n        return root;\n    }\n}",
      "python": "class Solution:\n    def invertTree(self, root: TreeNode | None) -> TreeNode | None:\n        if not root: return None\n        root.left, root.right = self.invertTree(root.right), self.invertTree(root.left)\n        return root",
      "cpp": "class Solution {\npublic:\n    TreeNode* invertTree(TreeNode* root) {\n        if (!root) return nullptr;\n        TreeNode* left = invertTree(root->left);\n        TreeNode* right = invertTree(root->right);\n        root->left = right;\n        root->right = left;\n        return root;\n    }\n};",
      "javascript": "function invertTree(root) {\n    if (!root) return null;\n    const left = invertTree(root.left);\n    const right = invertTree(root.right);\n    root.left = right;\n    root.right = left;\n    return root;\n}"
    },
    "approaches": {
      "brute": {
        "name": "Brute Force (New Mirrored Tree Construction)",
        "tier": "brute",
        "badge": "\ud83e\udd49 Brute Force",
        "intuition": [
          "Construct clone with reversed children."
        ],
        "timeComplexity": "O(N)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Constructs an entirely new TreeNode tree allocating mirrored child nodes.",
        "code": {
          "java": "public class Solution {\n    public TreeNode invertTreeBrute(TreeNode root) {\n        if (root == null) return null;\n        TreeNode copy = new TreeNode(root.val);\n        copy.left = invertTreeBrute(root.right);\n        copy.right = invertTreeBrute(root.left);\n        return copy;\n    }\n}",
          "python": "class Solution:\n    def invertTreeBrute(self, root: TreeNode | None) -> TreeNode | None:\n        if not root: return None\n        copy = TreeNode(root.val)\n        copy.left = self.invertTreeBrute(root.right)\n        copy.right = self.invertTreeBrute(root.left)\n        return copy",
          "cpp": "class Solution {\npublic:\n    TreeNode* invertTreeBrute(TreeNode* root) {\n        if (!root) return nullptr;\n        TreeNode* copy = new TreeNode(root->val);\n        copy->left = invertTreeBrute(root->right);\n        copy->right = invertTreeBrute(root->left);\n        return copy;\n    }\n};",
          "javascript": "function invertTreeBrute(root) {\n    if (!root) return null;\n    const copy = { val: root.val, left: null, right: null };\n    copy.left = invertTreeBrute(root.right);\n    copy.right = invertTreeBrute(root.left);\n    return copy;\n}"
        }
      },
      "better": {
        "name": "Better (Iterative BFS Queue Swap)",
        "tier": "better",
        "badge": "\ud83e\udd48 Better",
        "intuition": [
          "Iterative BFS swap."
        ],
        "timeComplexity": "O(N)",
        "spaceComplexity": "O(W) = O(N)",
        "complexityExplanation": "Enqueues nodes in FIFO queue and swaps child references at each polled node.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public TreeNode invertTreeBetter(TreeNode root) {\n        if (root == null) return null;\n        Queue<TreeNode> queue = new LinkedList<>();\n        queue.offer(root);\n        while (!queue.isEmpty()) {\n            TreeNode node = queue.poll();\n            TreeNode temp = node.left;\n            node.left = node.right;\n            node.right = temp;\n            if (node.left != null) queue.offer(node.left);\n            if (node.right != null) queue.offer(node.right);\n        }\n        return root;\n    }\n}",
          "python": "from collections import deque\n\nclass Solution:\n    def invertTreeBetter(self, root: TreeNode | None) -> TreeNode | None:\n        if not root: return None\n        q = deque([root])\n        while q:\n            n = q.popleft()\n            n.left, n.right = n.right, n.left\n            if n.left: q.append(n.left)\n            if n.right: q.append(n.right)\n        return root",
          "cpp": "#include <queue>\n\nclass Solution {\npublic:\n    TreeNode* invertTreeBetter(TreeNode* root) {\n        if (!root) return nullptr;\n        std::queue<TreeNode*> q; q.push(root);\n        while (!q.empty()) {\n            TreeNode* node = q.front(); q.pop();\n            std::swap(node->left, node->right);\n            if (node->left) q.push(node->left);\n            if (node->right) q.push(node->right);\n        }\n        return root;\n    }\n};",
          "javascript": "function invertTreeBetter(root) {\n    if (!root) return null;\n    const q = [root];\n    while (q.length > 0) {\n        const node = q.shift();\n        const temp = node.left;\n        node.left = node.right;\n        node.right = temp;\n        if (node.left) q.push(node.left);\n        if (node.right) q.push(node.right);\n    }\n    return root;\n}"
        }
      },
      "optimal": {
        "name": "Optimal (Post-Order Recursive Swap)",
        "tier": "optimal",
        "badge": "\ud83e\udd47 Optimal",
        "intuition": [
          "Base condition: if root is null, return null.",
          "Recursively invert the left subtree and right subtree.",
          "Swap root.left and root.right.",
          "Return root."
        ],
        "pseudocode": [
          "FUNCTION invertTree(root):",
          "  IF root == null: RETURN null",
          "  left = invertTree(root.left)",
          "  right = invertTree(root.right)",
          "  root.left = right; root.right = left",
          "  RETURN root"
        ],
        "timeComplexity": "O(N)",
        "spaceComplexity": "O(H)",
        "complexityExplanation": "Recursively inverts left and right subtrees and swaps the pointers in O(N) time and O(H) call stack.",
        "code": {
          "java": "public class Solution {\n    public TreeNode invertTree(TreeNode root) {\n        if (root == null) return null;\n        TreeNode left = invertTree(root.left);\n        TreeNode right = invertTree(root.right);\n        root.left = right;\n        root.right = left;\n        return root;\n    }\n}",
          "python": "class Solution:\n    def invertTree(self, root: TreeNode | None) -> TreeNode | None:\n        if not root: return None\n        root.left, root.right = self.invertTree(root.right), self.invertTree(root.left)\n        return root",
          "cpp": "class Solution {\npublic:\n    TreeNode* invertTree(TreeNode* root) {\n        if (!root) return nullptr;\n        TreeNode* left = invertTree(root->left);\n        TreeNode* right = invertTree(root->right);\n        root->left = right;\n        root->right = left;\n        return root;\n    }\n};",
          "javascript": "function invertTree(root) {\n    if (!root) return null;\n    const left = invertTree(root.left);\n    const right = invertTree(root.right);\n    root.left = right;\n    root.right = left;\n    return root;\n}"
        }
      }
    }
  }
};
