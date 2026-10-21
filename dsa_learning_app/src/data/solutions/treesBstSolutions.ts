import { ProblemSolution } from '../../types/dsa';

export const TREES_BST_SOLUTIONS: Record<string, ProblemSolution> = {
  'tree-1': {
    questionId: 'tree-1',
    pattern: 'Breadth-First Search (Queue Level Processing)',
    intuition: [
      'Level order traversal visits all nodes layer by layer from top to bottom and left to right.',
      'Use a FIFO Queue.',
      'At each iteration of the outer while loop, record `levelSize = queue.size()`.',
      'Pop exactly `levelSize` nodes from the queue to collect all values belonging to the current level, and enqueue their non-null children for the next level.'
    ],
    pseudocode: [
      'FUNCTION levelOrder(root):',
      '  IF root is null: RETURN []',
      '  queue = [root], result = []',
      '  WHILE queue is not empty:',
      '    levelSize = queue.length',
      '    currentLevel = []',
      '    FOR i from 0 TO levelSize - 1:',
      '      node = queue.shift()',
      '      currentLevel.push(node.val)',
      '      IF node.left: queue.push(node.left)',
      '      IF node.right: queue.push(node.right)',
      '    result.push(currentLevel)',
      '  RETURN result'
    ],
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(W) where W is maximum tree width (up to N/2)',
    complexityExplanation: 'Each node is enqueued and dequeued exactly once.',
    edgeCases: ['Empty tree (returns [])', 'Skewed tree (single branch)', 'Perfect binary tree'],
    code: {
      cpp: `// C++ Binary Tree Level Order Traversal
#include <vector>
#include <queue>

struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
};

std::vector<std::vector<int>> levelOrder(TreeNode* root) {
    if (!root) return {};
    std::vector<std::vector<int>> result;
    std::queue<TreeNode*> q;
    q.push(root);
    while (!q.empty()) {
        int levelSize = q.size();
        std::vector<int> currentLevel;
        for (int i = 0; i < levelSize; ++i) {
            TreeNode* node = q.front();
            q.pop();
            currentLevel.push_back(node->val);
            if (node->left) q.push(node->left);
            if (node->right) q.push(node->right);
        }
        result.push_back(currentLevel);
    }
    return result;
}`,
      java: `// Java Binary Tree Level Order Traversal
import java.util.*;

public class Solution {
    public List<List<Integer>> levelOrder(TreeNode root) {
        List<List<Integer>> result = new ArrayList<>();
        if (root == null) return result;
        Queue<TreeNode> queue = new LinkedList<>();
        queue.offer(root);
        while (!queue.isEmpty()) {
            int levelSize = queue.size();
            List<Integer> currentLevel = new ArrayList<>();
            for (int i = 0; i < levelSize; i++) {
                TreeNode node = queue.poll();
                currentLevel.add(node.val);
                if (node.left != null) queue.offer(node.left);
                if (node.right != null) queue.offer(node.right);
            }
            result.add(currentLevel);
        }
        return result;
    }
}`,
      python: `# Python Binary Tree Level Order Traversal
from collections import deque

class Solution:
    def levelOrder(self, root: Optional[TreeNode]) -> list[list[int]]:
        if not root:
            return []
        result = []
        queue = deque([root])
        while queue:
            level_size = len(queue)
            current_level = []
            for _ in range(level_size):
                node = queue.popleft()
                current_level.append(node.val)
                if node.left:
                    queue.append(node.left)
                if node.right:
                    queue.append(node.right)
            result.append(current_level)
        return result`,
      javascript: `// JavaScript Binary Tree Level Order Traversal
function levelOrder(root) {
  if (!root) return [];
  const result = [];
  const queue = [root];
  while (queue.length > 0) {
    const levelSize = queue.length;
    const currentLevel = [];
    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift();
      currentLevel.push(node.val);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    result.push(currentLevel);
  }
  return result;
}`
    },
    interviewProTips: [
      'The crucial detail is caching `levelSize = queue.size()` before the inner loop starts, because `queue.push()` dynamically modifies the queue length during the loop.'
    ]
  },

  'tree-5': {
    questionId: 'tree-5',
    pattern: 'Post-order DFS Subtree Disjunction',
    intuition: [
      'Lowest Common Ancestor (LCA) of nodes `p` and `q` is the deepest node that has both `p` and `q` as descendants.',
      'Recursively traverse subtrees bottom-up.',
      'Base cases: if `root == null`, return `null`. If `root == p` or `root == q`, return `root`.',
      'Search left and right subtrees: `left = LCA(root.left)` and `right = LCA(root.right)`.',
      'If both `left` and `right` return non-null, `root` is the split point where `p` and `q` diverge: `root` IS the LCA!',
      'Otherwise, bubble up whichever non-null child was returned.'
    ],
    pseudocode: [
      'FUNCTION lowestCommonAncestor(root, p, q):',
      '  IF root is null OR root == p OR root == q: RETURN root',
      '  left = lowestCommonAncestor(root.left, p, q)',
      '  right = lowestCommonAncestor(root.right, p, q)',
      '  IF left != null AND right != null: RETURN root',
      '  RETURN left != null ? left : right'
    ],
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(H) recursion stack height (O(log N) balanced, O(N) worst)',
    complexityExplanation: 'Visits each node once in bottom-up postorder traversal.',
    edgeCases: ['p is ancestor of q (returns p)', 'p and q are sibling leaves', 'Root is p or q'],
    code: {
      cpp: `// C++ Lowest Common Ancestor
TreeNode* lowestCommonAncestor(TreeNode* root, TreeNode* p, TreeNode* q) {
    if (!root || root == p || root == q) return root;
    TreeNode* left = lowestCommonAncestor(root->left, p, q);
    TreeNode* right = lowestCommonAncestor(root->right, p, q);
    if (left && right) return root;
    return left ? left : right;
}`,
      java: `// Java Lowest Common Ancestor
public class Solution {
    public TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {
        if (root == null || root == p || root == q) return root;
        TreeNode left = lowestCommonAncestor(root.left, p, q);
        TreeNode right = lowestCommonAncestor(root.right, p, q);
        if (left != null && right != null) return root;
        return left != null ? left : right;
    }
}`,
      python: `# Python Lowest Common Ancestor
class Solution:
    def lowestCommonAncestor(self, root: 'TreeNode', p: 'TreeNode', q: 'TreeNode') -> 'TreeNode':
        if not root or root == p or root == q:
            return root
        left = self.lowestCommonAncestor(root.left, p, q)
        right = self.lowestCommonAncestor(root.right, p, q)
        if left and right:
            return root
        return left if left else right`,
      javascript: `// JavaScript Lowest Common Ancestor
function lowestCommonAncestor(root, p, q) {
  if (!root || root === p || root === q) return root;
  const left = lowestCommonAncestor(root.left, p, q);
  const right = lowestCommonAncestor(root.right, p, q);
  if (left && right) return root;
  return left ? left : right;
}`
    },
    interviewProTips: [
      'Distinguish LCA in a regular Binary Tree (requires visiting both branches) from LCA in a BST (can navigate left or right in O(H) using BST value ordering).'
    ]
  },

  'bst-1': {
    questionId: 'bst-1',
    pattern: 'Valid Range Boundaries (-∞, +∞)',
    intuition: [
      'A common pitfall is only checking `node.left.val < node.val < node.right.val`. This fails for trees like `[10, 5, 15, null, null, 6, 20]` where 6 is in the right subtree of 10!',
      'In a valid BST, EVERY node in the left subtree must be strictly less than `root.val`, and EVERY node in the right subtree must be strictly greater.',
      'Pass valid bounds `(minVal, maxVal)` recursively down the tree.',
      'When branching left: `maxVal = node.val`. When branching right: `minVal = node.val`.'
    ],
    pseudocode: [
      'FUNCTION isValidBST(root):',
      '  RETURN validate(root, -infinity, +infinity)',
      'FUNCTION validate(node, minVal, maxVal):',
      '  IF node is null: RETURN true',
      '  IF node.val <= minVal OR node.val >= maxVal: RETURN false',
      '  RETURN validate(node.left, minVal, node.val) AND validate(node.right, node.val, maxVal)'
    ],
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(H) recursion stack',
    complexityExplanation: 'Each node is inspected against its bounding interval in single DFS pass.',
    edgeCases: ['Nodes with Integer.MIN_VALUE or Integer.MAX_VALUE (use 64-bit Long / null bounds)', 'Duplicate values (BST requires strict inequality)', 'Single node tree'],
    code: {
      cpp: `// C++ Validate Binary Search Tree
class Solution {
    bool validate(TreeNode* node, long minVal, long maxVal) {
        if (!node) return true;
        if (node->val <= minVal || node->val >= maxVal) return false;
        return validate(node->left, minVal, node->val) && 
               validate(node->right, node->val, maxVal);
    }
public:
    bool isValidBST(TreeNode* root) {
        return validate(root, LONG_MIN, LONG_MAX);
    }
};`,
      java: `// Java Validate Binary Search Tree
public class Solution {
    private boolean validate(TreeNode node, Long minVal, Long maxVal) {
        if (node == null) return true;
        if ((minVal != null && node.val <= minVal) || (maxVal != null && node.val >= maxVal)) {
            return false;
        }
        return validate(node.left, minVal, (long)node.val) && 
               validate(node.right, (long)node.val, maxVal);
    }

    public boolean isValidBST(TreeNode root) {
        return validate(root, null, null);
    }
}`,
      python: `# Python Validate Binary Search Tree
class Solution:
    def isValidBST(self, root: Optional[TreeNode]) -> bool:
        def validate(node, min_val, max_val):
            if not node:
                return True
            if node.val <= min_val or node.val >= max_val:
                return False
            return validate(node.left, min_val, node.val) and validate(node.right, node.val, max_val)
            
        return validate(root, float('-inf'), float('inf'))`,
      javascript: `// JavaScript Validate Binary Search Tree
function isValidBST(root) {
  function validate(node, minVal, maxVal) {
    if (!node) return true;
    if (node.val <= minVal || node.val >= maxVal) return false;
    return validate(node.left, minVal, node.val) && 
           validate(node.right, node.val, maxVal);
  }
  return validate(root, -Infinity, Infinity);
}`
    },
    interviewProTips: [
      'Mention that an in-order traversal of a valid BST must produce a strictly monotonically increasing sequence. This is an equally valid alternative implementation.'
    ]
  }
};
