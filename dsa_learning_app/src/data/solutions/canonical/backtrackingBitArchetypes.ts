import { ProblemSolution } from '../../../types/dsa';

export const BACKTRACKING_BIT_ARCHETYPES: Record<string, ProblemSolution> = {
  "n_queens": {
    "questionId": "archetype-n_queens",
    "pattern": "Backtracking with O(1) Bitmask/Array Constraint Checks",
    "intuition": [
      "Place queens row by row from r = 0 to N - 1.",
      "A queen at (r, c) threatens column c, major diagonal (r - c + N - 1), and minor diagonal (r + c).",
      "Track these constraints in boolean arrays for O(1) conflict validation.",
      "When row == N, all N queens are placed legally; record the board configuration and backtrack."
    ],
    "pseudocode": [
      "FUNCTION solveNQueens(n):",
      "  cols = Array(n, false); d1 = Array(2n, false); d2 = Array(2n, false)",
      "  board = empty nxn grid; res = []",
      "  backtrack(0, cols, d1, d2, board, res)",
      "  RETURN res"
    ],
    "timeComplexity": "O(N!)",
    "spaceComplexity": "O(N)",
    "complexityExplanation": "Places one queen per row while tracking occupied columns and both diagonals in boolean arrays to validate safety in O(1) time.",
    "edgeCases": [
      "n = 1 (1 solution)",
      "n = 2, 3 (0 solutions)",
      "n = 4 (2 solutions)"
    ],
    "code": {
      "java": "import java.util.*;\n\npublic class Solution {\n    public List<List<String>> solveNQueens(int n) {\n        List<List<String>> res = new ArrayList<>();\n        char[][] board = new char[n][n];\n        for (char[] row : board) Arrays.fill(row, '.');\n        boolean[] cols = new boolean[n];\n        boolean[] d1 = new boolean[2 * n];\n        boolean[] d2 = new boolean[2 * n];\n        backtrack(0, n, board, cols, d1, d2, res);\n        return res;\n    }\n    private void backtrack(int r, int n, char[][] board, boolean[] cols, boolean[] d1, boolean[] d2, List<List<String>> res) {\n        if (r == n) {\n            List<String> list = new ArrayList<>();\n            for (char[] row : board) list.add(new String(row));\n            res.add(list);\n            return;\n        }\n        for (int c = 0; c < n; c++) {\n            int id1 = r - c + n, id2 = r + c;\n            if (!cols[c] && !d1[id1] && !d2[id2]) {\n                board[r][c] = 'Q';\n                cols[c] = d1[id1] = d2[id2] = true;\n                backtrack(r + 1, n, board, cols, d1, d2, res);\n                board[r][c] = '.';\n                cols[c] = d1[id1] = d2[id2] = false;\n            }\n        }\n    }\n}",
      "python": "class Solution:\n    def solveNQueens(self, n: int) -> list[list[str]]:\n        res, board = [], [['.'] * n for _ in range(n)]\n        cols, d1, d2 = set(), set(), set()\n        def backtrack(r):\n            if r == n:\n                res.append([''.join(row) for row in board])\n                return\n            for c in range(n):\n                if c in cols or (r - c) in d1 or (r + c) in d2: continue\n                board[r][c] = 'Q'\n                cols.add(c); d1.add(r - c); d2.add(r + c)\n                backtrack(r + 1)\n                board[r][c] = '.'\n                cols.remove(c); d1.remove(r - c); d2.remove(r + c)\n        backtrack(0)\n        return res",
      "cpp": "#include <vector>\n#include <string>\n\nclass Solution {\n    void backtrack(int r, int n, std::vector<std::string>& board, std::vector<bool>& cols,\n                   std::vector<bool>& d1, std::vector<bool>& d2, std::vector<std::vector<std::string>>& res) {\n        if (r == n) { res.push_back(board); return; }\n        for (int c = 0; c < n; c++) {\n            int id1 = r - c + n, id2 = r + c;\n            if (!cols[c] && !d1[id1] && !d2[id2]) {\n                board[r][c] = 'Q';\n                cols[c] = d1[id1] = d2[id2] = true;\n                backtrack(r + 1, n, board, cols, d1, d2, res);\n                board[r][c] = '.';\n                cols[c] = d1[id1] = d2[id2] = false;\n            }\n        }\n    }\npublic:\n    std::vector<std::vector<std::string>> solveNQueens(int n) {\n        std::vector<std::vector<std::string>> res;\n        std::vector<std::string> board(n, std::string(n, '.'));\n        std::vector<bool> cols(n, false), d1(2 * n, false), d2(2 * n, false);\n        backtrack(0, n, board, cols, d1, d2, res);\n        return res;\n    }\n};",
      "javascript": "function solveNQueens(n) {\n    const res = [];\n    const board = Array.from({length: n}, () => new Array(n).fill('.'));\n    const cols = new Set(), d1 = new Set(), d2 = new Set();\n    function backtrack(r) {\n        if (r === n) {\n            res.push(board.map(row => row.join('')));\n            return;\n        }\n        for (let c = 0; c < n; c++) {\n            if (cols.has(c) || d1.has(r - c) || d2.has(r + c)) continue;\n            board[r][c] = 'Q';\n            cols.add(c); d1.add(r - c); d2.add(r + c);\n            backtrack(r + 1);\n            board[r][c] = '.';\n            cols.delete(c); d1.delete(r - c); d2.delete(r + c);\n        }\n    }\n    backtrack(0);\n    return res;\n}"
    },
    "approaches": {
      "brute": {
        "name": "Brute Force (Permutations of Columns with Full Board Scan)",
        "tier": "brute",
        "badge": "\ud83e\udd49 Brute Force",
        "intuition": [
          "Permutations with full diagonal test."
        ],
        "timeComplexity": "O(N! * N\u00b2)",
        "spaceComplexity": "O(N\u00b2)",
        "complexityExplanation": "Generates all N! column permutations and tests if any diagonal pairs collide.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public List<List<String>> solveNQueensBrute(int n) {\n        List<List<String>> res = new ArrayList<>();\n        int[] cols = new int[n];\n        for (int i = 0; i < n; i++) cols[i] = i;\n        permute(cols, 0, n, res);\n        return res;\n    }\n    private void permute(int[] cols, int idx, int n, List<List<String>> res) {\n        if (idx == n) {\n            if (validDiagonals(cols, n)) {\n                List<String> board = new ArrayList<>();\n                for (int r = 0; r < n; r++) {\n                    char[] row = new char[n];\n                    Arrays.fill(row, '.');\n                    row[cols[r]] = 'Q';\n                    board.add(new String(row));\n                }\n                res.add(board);\n            }\n            return;\n        }\n        for (int i = idx; i < n; i++) {\n            swap(cols, idx, i);\n            permute(cols, idx + 1, n, res);\n            swap(cols, idx, i);\n        }\n    }\n    private boolean validDiagonals(int[] cols, int n) {\n        for (int i = 0; i < n; i++) {\n            for (int j = i + 1; j < n; j++) {\n                if (Math.abs(i - j) == Math.abs(cols[i] - cols[j])) return false;\n            }\n        }\n        return true;\n    }\n    private void swap(int[] arr, int i, int j) { int t = arr[i]; arr[i] = arr[j]; arr[j] = t; }\n}",
          "python": "from itertools import permutations\n\nclass Solution:\n    def solveNQueensBrute(self, n: int) -> list[list[str]]:\n        res = []\n        for p in permutations(range(n)):\n            diag1 = {i - p[i] for i in range(n)}\n            diag2 = {i + p[i] for i in range(n)}\n            if len(diag1) == n and len(diag2) == n:\n                res.append(['.' * col + 'Q' + '.' * (n - col - 1) for col in p])\n        return res",
          "cpp": "#include <vector>\n#include <string>\n#include <numeric>\n#include <algorithm>\n\nclass Solution {\npublic:\n    std::vector<std::vector<std::string>> solveNQueensBrute(int n) {\n        std::vector<std::vector<std::string>> res;\n        std::vector<int> cols(n);\n        std::iota(cols.begin(), cols.end(), 0);\n        do {\n            bool ok = true;\n            for (int i = 0; i < n; i++) {\n                for (int j = i + 1; j < n; j++) {\n                    if (std::abs(i - j) == std::abs(cols[i] - cols[j])) { ok = false; break; }\n                }\n                if (!ok) break;\n            }\n            if (ok) {\n                std::vector<std::string> b(n, std::string(n, '.'));\n                for (int r = 0; r < n; r++) b[r][cols[r]] = 'Q';\n                res.push_back(b);\n            }\n        } while (std::next_permutation(cols.begin(), cols.end()));\n        return res;\n    }\n};",
          "javascript": "function solveNQueensBrute(n) {\n    const res = [];\n    const cols = Array.from({length: n}, (_, i) => i);\n    function permute(idx) {\n        if (idx === n) {\n            let ok = true;\n            for (let i = 0; i < n; i++) {\n                for (let j = i + 1; j < n; j++) {\n                    if (Math.abs(i - j) === Math.abs(cols[i] - cols[j])) { ok = false; break; }\n                }\n                if (!ok) break;\n            }\n            if (ok) {\n                const b = [];\n                for (let r = 0; r < n; r++) {\n                    const row = new Array(n).fill('.');\n                    row[cols[r]] = 'Q';\n                    b.push(row.join(''));\n                }\n                res.push(b);\n            }\n            return;\n        }\n        for (let i = idx; i < n; i++) {\n            [cols[idx], cols[i]] = [cols[i], cols[idx]];\n            permute(idx + 1);\n            [cols[idx], cols[i]] = [cols[i], cols[idx]];\n        }\n    }\n    permute(0);\n    return res;\n}"
        }
      },
      "better": {
        "name": "Better (Row by Row with Linear Diagonal Checking)",
        "tier": "better",
        "badge": "\ud83e\udd48 Better",
        "intuition": [
          "Linear ray safety check."
        ],
        "timeComplexity": "O(N\u00b2 * N!)",
        "spaceComplexity": "O(N\u00b2)",
        "complexityExplanation": "Scans entire column and both diagonal rays in O(N) at each queen candidate placement.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public List<List<String>> solveNQueensBetter(int n) {\n        List<List<String>> res = new ArrayList<>();\n        char[][] board = new char[n][n];\n        for (char[] row : board) Arrays.fill(row, '.');\n        backtrack(0, n, board, res);\n        return res;\n    }\n    private void backtrack(int r, int n, char[][] board, List<List<String>> res) {\n        if (r == n) {\n            List<String> list = new ArrayList<>();\n            for (char[] row : board) list.add(new String(row));\n            res.add(list);\n            return;\n        }\n        for (int c = 0; c < n; c++) {\n            if (isSafe(board, r, c, n)) {\n                board[r][c] = 'Q';\n                backtrack(r + 1, n, board, res);\n                board[r][c] = '.';\n            }\n        }\n    }\n    private boolean isSafe(char[][] b, int r, int c, int n) {\n        for (int i = 0; i < r; i++) if (b[i][c] == 'Q') return false;\n        for (int i = r - 1, j = c - 1; i >= 0 && j >= 0; i--, j--) if (b[i][j] == 'Q') return false;\n        for (int i = r - 1, j = c + 1; i >= 0 && j < n; i--, j++) if (b[i][j] == 'Q') return false;\n        return true;\n    }\n}",
          "python": "class Solution:\n    def solveNQueensBetter(self, n: int) -> list[list[str]]:\n        res, board = [], [['.'] * n for _ in range(n)]\n        def is_safe(r, c):\n            for i in range(r):\n                if board[i][c] == 'Q': return False\n                if c - (r - i) >= 0 and board[i][c - (r - i)] == 'Q': return False\n                if c + (r - i) < n and board[i][c + (r - i)] == 'Q': return False\n            return True\n        def backtrack(r):\n            if r == n:\n                res.append([''.join(row) for row in board])\n                return\n            for c in range(n):\n                if is_safe(r, c):\n                    board[r][c] = 'Q'\n                    backtrack(r + 1)\n                    board[r][c] = '.'\n        backtrack(0)\n        return res",
          "cpp": "#include <vector>\n#include <string>\n\nclass Solution {\n    bool isSafe(const std::vector<std::string>& b, int r, int c, int n) {\n        for (int i = 0; i < r; i++) if (b[i][c] == 'Q') return false;\n        for (int i = r - 1, j = c - 1; i >= 0 && j >= 0; i--, j--) if (b[i][j] == 'Q') return false;\n        for (int i = r - 1, j = c + 1; i >= 0 && j < n; i--, j++) if (b[i][j] == 'Q') return false;\n        return true;\n    }\n    void backtrack(int r, int n, std::vector<std::string>& b, std::vector<std::vector<std::string>>& res) {\n        if (r == n) { res.push_back(b); return; }\n        for (int c = 0; c < n; c++) {\n            if (isSafe(b, r, c, n)) {\n                b[r][c] = 'Q';\n                backtrack(r + 1, n, b, res);\n                b[r][c] = '.';\n            }\n        }\n    }\npublic:\n    std::vector<std::vector<std::string>> solveNQueensBetter(int n) {\n        std::vector<std::vector<std::string>> res;\n        std::vector<std::string> b(n, std::string(n, '.'));\n        backtrack(0, n, b, res);\n        return res;\n    }\n};",
          "javascript": "function solveNQueensBetter(n) {\n    const res = [];\n    const b = Array.from({length: n}, () => new Array(n).fill('.'));\n    function isSafe(r, c) {\n        for (let i = 0; i < r; i++) if (b[i][c] === 'Q') return false;\n        for (let i = r - 1, j = c - 1; i >= 0 && j >= 0; i--, j--) if (b[i][j] === 'Q') return false;\n        for (let i = r - 1, j = c + 1; i >= 0 && j < n; i--, j++) if (b[i][j] === 'Q') return false;\n        return true;\n    }\n    function backtrack(r) {\n        if (r === n) {\n            res.push(b.map(row => row.join('')));\n            return;\n        }\n        for (let c = 0; c < n; c++) {\n            if (isSafe(r, c)) {\n                b[r][c] = 'Q';\n                backtrack(r + 1);\n                b[r][c] = '.';\n            }\n        }\n    }\n    backtrack(0);\n    return res;\n}"
        }
      },
      "optimal": {
        "name": "Optimal (Backtracking with O(1) Bitmask/Array Constraint Checks)",
        "tier": "optimal",
        "badge": "\ud83e\udd47 Optimal",
        "intuition": [
          "Place queens row by row from r = 0 to N - 1.",
          "A queen at (r, c) threatens column c, major diagonal (r - c + N - 1), and minor diagonal (r + c).",
          "Track these constraints in boolean arrays for O(1) conflict validation.",
          "When row == N, all N queens are placed legally; record the board configuration and backtrack."
        ],
        "pseudocode": [
          "FUNCTION solveNQueens(n):",
          "  cols = Array(n, false); d1 = Array(2n, false); d2 = Array(2n, false)",
          "  board = empty nxn grid; res = []",
          "  backtrack(0, cols, d1, d2, board, res)",
          "  RETURN res"
        ],
        "timeComplexity": "O(N!)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Places one queen per row while tracking occupied columns and both diagonals in boolean arrays to validate safety in O(1) time.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public List<List<String>> solveNQueens(int n) {\n        List<List<String>> res = new ArrayList<>();\n        char[][] board = new char[n][n];\n        for (char[] row : board) Arrays.fill(row, '.');\n        boolean[] cols = new boolean[n];\n        boolean[] d1 = new boolean[2 * n];\n        boolean[] d2 = new boolean[2 * n];\n        backtrack(0, n, board, cols, d1, d2, res);\n        return res;\n    }\n    private void backtrack(int r, int n, char[][] board, boolean[] cols, boolean[] d1, boolean[] d2, List<List<String>> res) {\n        if (r == n) {\n            List<String> list = new ArrayList<>();\n            for (char[] row : board) list.add(new String(row));\n            res.add(list);\n            return;\n        }\n        for (int c = 0; c < n; c++) {\n            int id1 = r - c + n, id2 = r + c;\n            if (!cols[c] && !d1[id1] && !d2[id2]) {\n                board[r][c] = 'Q';\n                cols[c] = d1[id1] = d2[id2] = true;\n                backtrack(r + 1, n, board, cols, d1, d2, res);\n                board[r][c] = '.';\n                cols[c] = d1[id1] = d2[id2] = false;\n            }\n        }\n    }\n}",
          "python": "class Solution:\n    def solveNQueens(self, n: int) -> list[list[str]]:\n        res, board = [], [['.'] * n for _ in range(n)]\n        cols, d1, d2 = set(), set(), set()\n        def backtrack(r):\n            if r == n:\n                res.append([''.join(row) for row in board])\n                return\n            for c in range(n):\n                if c in cols or (r - c) in d1 or (r + c) in d2: continue\n                board[r][c] = 'Q'\n                cols.add(c); d1.add(r - c); d2.add(r + c)\n                backtrack(r + 1)\n                board[r][c] = '.'\n                cols.remove(c); d1.remove(r - c); d2.remove(r + c)\n        backtrack(0)\n        return res",
          "cpp": "#include <vector>\n#include <string>\n\nclass Solution {\n    void backtrack(int r, int n, std::vector<std::string>& board, std::vector<bool>& cols,\n                   std::vector<bool>& d1, std::vector<bool>& d2, std::vector<std::vector<std::string>>& res) {\n        if (r == n) { res.push_back(board); return; }\n        for (int c = 0; c < n; c++) {\n            int id1 = r - c + n, id2 = r + c;\n            if (!cols[c] && !d1[id1] && !d2[id2]) {\n                board[r][c] = 'Q';\n                cols[c] = d1[id1] = d2[id2] = true;\n                backtrack(r + 1, n, board, cols, d1, d2, res);\n                board[r][c] = '.';\n                cols[c] = d1[id1] = d2[id2] = false;\n            }\n        }\n    }\npublic:\n    std::vector<std::vector<std::string>> solveNQueens(int n) {\n        std::vector<std::vector<std::string>> res;\n        std::vector<std::string> board(n, std::string(n, '.'));\n        std::vector<bool> cols(n, false), d1(2 * n, false), d2(2 * n, false);\n        backtrack(0, n, board, cols, d1, d2, res);\n        return res;\n    }\n};",
          "javascript": "function solveNQueens(n) {\n    const res = [];\n    const board = Array.from({length: n}, () => new Array(n).fill('.'));\n    const cols = new Set(), d1 = new Set(), d2 = new Set();\n    function backtrack(r) {\n        if (r === n) {\n            res.push(board.map(row => row.join('')));\n            return;\n        }\n        for (let c = 0; c < n; c++) {\n            if (cols.has(c) || d1.has(r - c) || d2.has(r + c)) continue;\n            board[r][c] = 'Q';\n            cols.add(c); d1.add(r - c); d2.add(r + c);\n            backtrack(r + 1);\n            board[r][c] = '.';\n            cols.delete(c); d1.delete(r - c); d2.delete(r + c);\n        }\n    }\n    backtrack(0);\n    return res;\n}"
        }
      }
    }
  },
  "count_set_bits": {
    "questionId": "archetype-count_set_bits",
    "pattern": "Brian Kernighan's Bit Manipulation Algorithm",
    "intuition": [
      "Initialize count = 0.",
      "While n != 0, execute n = n & (n - 1).",
      "Subtracting 1 from n flips all bits from the rightmost set bit inclusive. AND-ing with n cancels this set bit.",
      "Increment count at each step until n becomes 0."
    ],
    "pseudocode": [
      "FUNCTION countSetBits(n):",
      "  count = 0",
      "  WHILE n != 0:",
      "    n = n & (n - 1)",
      "    count++",
      "  RETURN count"
    ],
    "timeComplexity": "O(K) where K = set bits",
    "spaceComplexity": "O(1)",
    "complexityExplanation": "n &= (n - 1) clears the lowest set bit in O(1) operations. Runs in exactly K steps where K is the number of 1-bits.",
    "edgeCases": [
      "n = 0 (0 set bits)",
      "Powers of 2 (exactly 1 bit)",
      "All 1s / 0xFFFFFFFF"
    ],
    "code": {
      "java": "public class Solution {\n    public int countSetBits(int n) {\n        int count = 0;\n        while (n != 0) {\n            n &= (n - 1);\n            count++;\n        }\n        return count;\n    }\n}",
      "python": "class Solution:\n    def countSetBits(self, n: int) -> int:\n        count = 0\n        while n:\n            n &= (n - 1)\n            count += 1\n        return count",
      "cpp": "class Solution {\npublic:\n    int countSetBits(int n) {\n        int count = 0;\n        while (n) {\n            n &= (n - 1);\n            count++;\n        }\n        return count;\n    }\n};",
      "javascript": "function countSetBits(n) {\n    let count = 0;\n    while (n !== 0) {\n        n &= (n - 1);\n        count++;\n    }\n    return count;\n}"
    },
    "approaches": {
      "brute": {
        "name": "Brute Force (Check All 32 Bits Linearly)",
        "tier": "brute",
        "badge": "\ud83e\udd49 Brute Force",
        "intuition": [
          "Iterate 32 bits."
        ],
        "timeComplexity": "O(32) = O(1)",
        "spaceComplexity": "O(1)",
        "complexityExplanation": "Checks each of the 32 bits individually using shift and mask (n >> i) & 1.",
        "code": {
          "java": "public class Solution {\n    public int countSetBitsBrute(int n) {\n        int count = 0;\n        for (int i = 0; i < 32; i++) {\n            if (((n >>> i) & 1) == 1) count++;\n        }\n        return count;\n    }\n}",
          "python": "class Solution:\n    def countSetBitsBrute(self, n: int) -> int:\n        count = 0\n        for i in range(32):\n            if (n >> i) & 1: count += 1\n        return count",
          "cpp": "class Solution {\npublic:\n    int countSetBitsBrute(int n) {\n        int count = 0;\n        for (int i = 0; i < 32; i++) {\n            if ((n >> i) & 1) count++;\n        }\n        return count;\n    }\n};",
          "javascript": "function countSetBitsBrute(n) {\n    let count = 0;\n    for (let i = 0; i < 32; i++) {\n        if ((n >>> i) & 1) count++;\n    }\n    return count;\n}"
        }
      },
      "better": {
        "name": "Better (Lookup Table for Bytes)",
        "tier": "better",
        "badge": "\ud83e\udd48 Better",
        "intuition": [
          "Byte lookup table."
        ],
        "timeComplexity": "O(1) (4 operations)",
        "spaceComplexity": "O(1)",
        "complexityExplanation": "Precomputes 256-element byte bit count table and checks all 4 bytes of integer in O(1).",
        "code": {
          "java": "public class Solution {\n    private static final int[] table = new int[256];\n    static {\n        for (int i = 0; i < 256; i++) table[i] = (i & 1) + table[i / 2];\n    }\n    public int countSetBitsBetter(int n) {\n        return table[n & 0xff] +\n               table[(n >> 8) & 0xff] +\n               table[(n >> 16) & 0xff] +\n               table[(n >>> 24) & 0xff];\n    }\n}",
          "python": "class Solution:\n    table = [0] * 256\n    for i in range(256): table[i] = (i & 1) + table[i // 2]\n    def countSetBitsBetter(self, n: int) -> int:\n        t = Solution.table\n        return t[n & 0xff] + t[(n >> 8) & 0xff] + t[(n >> 16) & 0xff] + t[(n >> 24) & 0xff]",
          "cpp": "#include <vector>\n\nclass Solution {\npublic:\n    int countSetBitsBetter(unsigned int n) {\n        static std::vector<int> table(256, 0);\n        static bool init = false;\n        if (!init) {\n            for (int i = 0; i < 256; i++) table[i] = (i & 1) + table[i / 2];\n            init = true;\n        }\n        return table[n & 0xff] + table[(n >> 8) & 0xff] + table[(n >> 16) & 0xff] + table[(n >> 24) & 0xff];\n    }\n};",
          "javascript": "function countSetBitsBetter(n) {\n    const table = new Array(256).fill(0);\n    for (let i = 0; i < 256; i++) table[i] = (i & 1) + table[Math.floor(i / 2)];\n    return table[n & 0xff] +\n           table[(n >> 8) & 0xff] +\n           table[(n >> 16) & 0xff] +\n           table[(n >>> 24) & 0xff];\n}"
        }
      },
      "optimal": {
        "name": "Optimal (Brian Kernighan's Bit Manipulation Algorithm)",
        "tier": "optimal",
        "badge": "\ud83e\udd47 Optimal",
        "intuition": [
          "Initialize count = 0.",
          "While n != 0, execute n = n & (n - 1).",
          "Subtracting 1 from n flips all bits from the rightmost set bit inclusive. AND-ing with n cancels this set bit.",
          "Increment count at each step until n becomes 0."
        ],
        "pseudocode": [
          "FUNCTION countSetBits(n):",
          "  count = 0",
          "  WHILE n != 0:",
          "    n = n & (n - 1)",
          "    count++",
          "  RETURN count"
        ],
        "timeComplexity": "O(K) where K = set bits",
        "spaceComplexity": "O(1)",
        "complexityExplanation": "n &= (n - 1) clears the lowest set bit in O(1) operations. Runs in exactly K steps where K is the number of 1-bits.",
        "code": {
          "java": "public class Solution {\n    public int countSetBits(int n) {\n        int count = 0;\n        while (n != 0) {\n            n &= (n - 1);\n            count++;\n        }\n        return count;\n    }\n}",
          "python": "class Solution:\n    def countSetBits(self, n: int) -> int:\n        count = 0\n        while n:\n            n &= (n - 1)\n            count += 1\n        return count",
          "cpp": "class Solution {\npublic:\n    int countSetBits(int n) {\n        int count = 0;\n        while (n) {\n            n &= (n - 1);\n            count++;\n        }\n        return count;\n    }\n};",
          "javascript": "function countSetBits(n) {\n    let count = 0;\n    while (n !== 0) {\n        n &= (n - 1);\n        count++;\n    }\n    return count;\n}"
        }
      }
    }
  },
  "single_number": {
    "questionId": "archetype-single_number",
    "pattern": "Bitwise XOR Accumulator",
    "intuition": [
      "Initialize res = 0.",
      "XOR every number into res: res ^= num.",
      "Because XOR is commutative and associative, all paired duplicates cancel out (x ^ x = 0).",
      "The single unique number remains: 0 ^ unique = unique."
    ],
    "pseudocode": [
      "FUNCTION singleNumber(nums):",
      "  res = 0",
      "  FOR num IN nums: res ^= num",
      "  RETURN res"
    ],
    "timeComplexity": "O(N)",
    "spaceComplexity": "O(1)",
    "complexityExplanation": "XOR of any number with itself is 0 (a ^ a = 0) and with 0 is itself (a ^ 0 = a). XOR fold across array cancels duplicate pairs, leaving the unique number in O(N) time and O(1) space.",
    "edgeCases": [
      "Single element array",
      "Negative numbers",
      "Large arrays"
    ],
    "code": {
      "java": "public class Solution {\n    public int singleNumber(int[] nums) {\n        int res = 0;\n        for (int num : nums) res ^= num;\n        return res;\n    }\n}",
      "python": "class Solution:\n    def singleNumber(self, nums: list[int]) -> int:\n        res = 0\n        for num in nums: res ^= num\n        return res",
      "cpp": "#include <vector>\n\nclass Solution {\npublic:\n    int singleNumber(std::vector<int>& nums) {\n        int res = 0;\n        for (int x : nums) res ^= x;\n        return res;\n    }\n};",
      "javascript": "function singleNumber(nums) {\n    let res = 0;\n    for (const x of nums) res ^= x;\n    return res;\n}"
    },
    "approaches": {
      "brute": {
        "name": "Brute Force (Nested Count Loops)",
        "tier": "brute",
        "badge": "\ud83e\udd49 Brute Force",
        "intuition": [
          "Count occurrences with nested loops."
        ],
        "timeComplexity": "O(N\u00b2)",
        "spaceComplexity": "O(1)",
        "complexityExplanation": "For each element, counts its frequency across the entire array.",
        "code": {
          "java": "public class Solution {\n    public int singleNumberBrute(int[] nums) {\n        for (int i = 0; i < nums.length; i++) {\n            int count = 0;\n            for (int j = 0; j < nums.length; j++) {\n                if (nums[i] == nums[j]) count++;\n            }\n            if (count == 1) return nums[i];\n        }\n        return -1;\n    }\n}",
          "python": "class Solution:\n    def singleNumberBrute(self, nums: list[int]) -> int:\n        for x in nums:\n            if nums.count(x) == 1: return x\n        return -1",
          "cpp": "#include <vector>\n\nclass Solution {\npublic:\n    int singleNumberBrute(std::vector<int>& nums) {\n        for (size_t i = 0; i < nums.size(); i++) {\n            int count = 0;\n            for (size_t j = 0; j < nums.size(); j++) {\n                if (nums[i] == nums[j]) count++;\n            }\n            if (count == 1) return nums[i];\n        }\n        return -1;\n    }\n};",
          "javascript": "function singleNumberBrute(nums) {\n    for (let i = 0; i < nums.length; i++) {\n        let count = 0;\n        for (let j = 0; j < nums.length; j++) {\n            if (nums[i] === nums[j]) count++;\n        }\n        if (count === 1) return nums[i];\n    }\n    return -1;\n}"
        }
      },
      "better": {
        "name": "Better (Hash Set of Unique Elements)",
        "tier": "better",
        "badge": "\ud83e\udd48 Better",
        "intuition": [
          "HashSet element tracking."
        ],
        "timeComplexity": "O(N)",
        "spaceComplexity": "O(N)",
        "complexityExplanation": "Adds numbers to a Set; if already present, removes it. The sole remaining element is returned.",
        "code": {
          "java": "import java.util.*;\n\npublic class Solution {\n    public int singleNumberBetter(int[] nums) {\n        Set<Integer> set = new HashSet<>();\n        for (int num : nums) {\n            if (set.contains(num)) set.remove(num);\n            else set.add(num);\n        }\n        return set.iterator().next();\n    }\n}",
          "python": "class Solution:\n    def singleNumberBetter(self, nums: list[int]) -> int:\n        seen = set()\n        for x in nums:\n            if x in seen: seen.remove(x)\n            else: seen.add(x)\n        return seen.pop()",
          "cpp": "#include <vector>\n#include <unordered_set>\n\nclass Solution {\npublic:\n    int singleNumberBetter(std::vector<int>& nums) {\n        std::unordered_set<int> seen;\n        for (int x : nums) {\n            if (seen.count(x)) seen.erase(x);\n            else seen.insert(x);\n        }\n        return *seen.begin();\n    }\n};",
          "javascript": "function singleNumberBetter(nums) {\n    const seen = new Set();\n    for (const x of nums) {\n        if (seen.has(x)) seen.delete(x);\n        else seen.add(x);\n    }\n    return seen.values().next().value;\n}"
        }
      },
      "optimal": {
        "name": "Optimal (Bitwise XOR Accumulator)",
        "tier": "optimal",
        "badge": "\ud83e\udd47 Optimal",
        "intuition": [
          "Initialize res = 0.",
          "XOR every number into res: res ^= num.",
          "Because XOR is commutative and associative, all paired duplicates cancel out (x ^ x = 0).",
          "The single unique number remains: 0 ^ unique = unique."
        ],
        "pseudocode": [
          "FUNCTION singleNumber(nums):",
          "  res = 0",
          "  FOR num IN nums: res ^= num",
          "  RETURN res"
        ],
        "timeComplexity": "O(N)",
        "spaceComplexity": "O(1)",
        "complexityExplanation": "XOR of any number with itself is 0 (a ^ a = 0) and with 0 is itself (a ^ 0 = a). XOR fold across array cancels duplicate pairs, leaving the unique number in O(N) time and O(1) space.",
        "code": {
          "java": "public class Solution {\n    public int singleNumber(int[] nums) {\n        int res = 0;\n        for (int num : nums) res ^= num;\n        return res;\n    }\n}",
          "python": "class Solution:\n    def singleNumber(self, nums: list[int]) -> int:\n        res = 0\n        for num in nums: res ^= num\n        return res",
          "cpp": "#include <vector>\n\nclass Solution {\npublic:\n    int singleNumber(std::vector<int>& nums) {\n        int res = 0;\n        for (int x : nums) res ^= x;\n        return res;\n    }\n};",
          "javascript": "function singleNumber(nums) {\n    let res = 0;\n    for (const x of nums) res ^= x;\n    return res;\n}"
        }
      }
    }
  }
};
