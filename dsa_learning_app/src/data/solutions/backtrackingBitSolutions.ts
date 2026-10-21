import { ProblemSolution } from '../../types/dsa';

export const BACKTRACKING_BIT_SOLUTIONS: Record<string, ProblemSolution> = {
  'bck-1': {
    questionId: 'bck-1',
    pattern: 'Backtracking with Constraint Propagation (Row-by-Row Placement)',
    intuition: [
      'The N-Queens puzzle requires placing N chess queens on an N×N board such that no two queens attack each other.',
      'Since each row can have exactly one queen, we can place queens row by row from row 0 to N-1.',
      'For each row, iterate over all possible columns c (0 to N-1):',
      '1. Check if column `c` is already occupied.',
      '2. Check if the major diagonal `(row - c)` is occupied.',
      '3. Check if the minor diagonal `(row + c)` is occupied.',
      'If all 3 are free, place queen at (row, c), record column/diagonals in hash sets or bitmasks, and recurse for row + 1.',
      'Backtrack by removing queen and clearing column/diagonals.'
    ],
    pseudocode: [
      'FUNCTION solveNQueens(n):',
      '  board = empty N x N grid with "."',
      '  cols = set(), diag1 = set(), diag2 = set(), results = []',
      '  FUNCTION backtrack(row):',
      '    IF row == n:',
      '      results.append(snapshot of board)',
      '      RETURN',
      '    FOR col = 0 TO n - 1:',
      '      IF col IN cols OR (row - col) IN diag1 OR (row + col) IN diag2: CONTINUE',
      '      board[row][col] = "Q"',
      '      cols.add(col); diag1.add(row - col); diag2.add(row + col)',
      '      backtrack(row + 1)',
      '      board[row][col] = "."',
      '      cols.remove(col); diag1.remove(row - col); diag2.remove(row + col)',
      '  backtrack(0)',
      '  RETURN results'
    ],
    timeComplexity: 'O(N!)',
    spaceComplexity: 'O(N^2) for solutions storage, O(N) recursion stack',
    complexityExplanation: 'There are N choices in the first row, N-1 or N-2 in the second row, etc., yielding O(N!) search space exploration.',
    edgeCases: [
      'n = 1 (Trivial solution: [["Q"]])',
      'n = 2 or n = 3 (No valid placements exist, returns empty list)',
      'Large n (4 <= n <= 9)'
    ],
    code: {
      cpp: `// C++ Solution - Backtracking with Hash Sets
#include <vector>
#include <string>
#include <unordered_set>

class Solution {
public:
    std::vector<std::vector<std::string>> solveNQueens(int n) {
        std::vector<std::vector<std::string>> result;
        std::vector<std::string> board(n, std::string(n, '.'));
        std::unordered_set<int> cols, diag1, diag2;

        auto backtrack = [&](auto& self, int row) -> void {
            if (row == n) {
                result.push_back(board);
                return;
            }
            for (int col = 0; col < n; col++) {
                if (cols.count(col) || diag1.count(row - col) || diag2.count(row + col))
                    continue;

                board[row][col] = 'Q';
                cols.insert(col);
                diag1.insert(row - col);
                diag2.insert(row + col);

                self(self, row + 1);

                board[row][col] = '.';
                cols.erase(col);
                diag1.erase(row - col);
                diag2.erase(row + col);
            }
        };

        backtrack(backtrack, 0);
        return result;
    }
};`,
      java: `// Java Solution - Backtracking with Sets
import java.util.*;

class Solution {
    private List<List<String>> result = new ArrayList<>();
    private Set<Integer> cols = new HashSet<>();
    private Set<Integer> diag1 = new HashSet<>(); // row - col
    private Set<Integer> diag2 = new HashSet<>(); // row + col

    public List<List<String>> solveNQueens(int n) {
        char[][] board = new char[n][n];
        for (int i = 0; i < n; i++) Arrays.fill(board[i], '.');
        backtrack(0, n, board);
        return result;
    }

    private void backtrack(int row, int n, char[][] board) {
        if (row == n) {
            List<String> valid = new ArrayList<>();
            for (char[] r : board) valid.add(new String(r));
            result.add(valid);
            return;
        }

        for (int col = 0; col < n; col++) {
            if (cols.contains(col) || diag1.contains(row - col) || diag2.contains(row + col))
                continue;

            board[row][col] = 'Q';
            cols.add(col);
            diag1.add(row - col);
            diag2.add(row + col);

            backtrack(row + 1, n, board);

            board[row][col] = '.';
            cols.remove(col);
            diag1.remove(row - col);
            diag2.remove(row + col);
        }
    }
}`,
      python: `# Python Solution - Backtracking
class Solution:
    def solveNQueens(self, n: int) -> list[list[str]]:
        cols, diag1, diag2 = set(), set(), set()
        board = [["."] * n for _ in range(n)]
        result = []

        def backtrack(row: int):
            if row == n:
                result.append(["".join(r) for r in board])
                return

            for col in range(n):
                if col in cols or (row - col) in diag1 or (row + col) in diag2:
                    continue

                board[row][col] = "Q"
                cols.add(col)
                diag1.add(row - col)
                diag2.add(row + col)

                backtrack(row + 1)

                board[row][col] = "."
                cols.remove(col)
                diag1.remove(row - col)
                diag2.remove(row + col)

        backtrack(0)
        return result`,
      javascript: `// JavaScript Solution - Backtracking
function solveNQueens(n) {
    const result = [];
    const board = Array.from({ length: n }, () => Array(n).fill('.'));
    const cols = new Set();
    const diag1 = new Set();
    const diag2 = new Set();

    function backtrack(row) {
        if (row === n) {
            result.push(board.map(r => r.join('')));
            return;
        }

        for (let col = 0; col < n; col++) {
            if (cols.has(col) || diag1.has(row - col) || diag2.has(row + col)) {
                continue;
            }

            board[row][col] = 'Q';
            cols.add(col);
            diag1.add(row - col);
            diag2.add(row + col);

            backtrack(row + 1);

            board[row][col] = '.';
            cols.delete(col);
            diag1.delete(row - col);
            diag2.delete(row + col);
        }
    }

    backtrack(0);
    return result;
}`
    },
    interviewProTips: [
      'Diag1 (\\) formula is `row - col`, which is constant along diagonal from top-left to bottom-right.',
      'Diag2 (/) formula is `row + col`, which is constant along anti-diagonal from top-right to bottom-left.',
      'Using bitmasking instead of hash sets can speed up execution by 5-10x.'
    ]
  },

  'bck-2': {
    questionId: 'bck-2',
    pattern: 'Constraint Backtracking on 9x9 Grid',
    intuition: [
      'Sudoku Solver fills empty cells with digits "1" to "9".',
      'Scan the 9x9 board cell by cell. When an empty cell \'.\' is encountered:',
      'Try placing digits \'1\' through \'9\'. For each candidate digit, check whether it already exists in the same row, same column, or current 3x3 sub-box.',
      'If valid, place the digit and recursively call solver on the next empty cell.',
      'If recursive call succeeds, propagate true upward. If it leads to a dead end, backtrack by resetting cell to \'.\' and try the next digit.'
    ],
    pseudocode: [
      'FUNCTION solveSudoku(board):',
      '  FOR r = 0 TO 8:',
      '    FOR c = 0 TO 8:',
      '      IF board[r][c] == ".":',
      '        FOR char = "1" TO "9":',
      '          IF isValid(board, r, c, char):',
      '            board[r][c] = char',
      '            IF solveSudoku(board) == TRUE: RETURN TRUE',
      '            board[r][c] = "."',
      '        RETURN FALSE',
      '  RETURN TRUE'
    ],
    timeComplexity: 'O(9^(M)) where M is count of empty cells',
    spaceComplexity: 'O(M) recursion call stack depth (at most 81 frames)',
    complexityExplanation: 'In the worst case, 9 possible digits are tested for each empty cell, constrained heavily by the validity check.',
    edgeCases: [
      'Board already nearly full',
      'Sub-box boundaries (box index: 3 * (r / 3) + i / 3, 3 * (c / 3) + i % 3)'
    ],
    code: {
      cpp: `// C++ Solution - In-place Sudoku Solver
#include <vector>

class Solution {
public:
    void solveSudoku(std::vector<std::vector<char>>& board) {
        solve(board);
    }

private:
    bool solve(std::vector<std::vector<char>>& board) {
        for (int r = 0; r < 9; r++) {
            for (int c = 0; c < 9; c++) {
                if (board[r][c] == '.') {
                    for (char ch = '1'; ch <= '9'; ch++) {
                        if (isValid(board, r, c, ch)) {
                            board[r][c] = ch;
                            if (solve(board)) return true;
                            board[r][c] = '.'; // Backtrack
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }

    bool isValid(std::vector<std::vector<char>>& board, int row, int col, char ch) {
        for (int i = 0; i < 9; i++) {
            if (board[row][i] == ch) return false;
            if (board[i][col] == ch) return false;
            if (board[3 * (row / 3) + i / 3][3 * (col / 3) + i % 3] == ch) return false;
        }
        return true;
    }
};`,
      java: `// Java Solution - In-place Backtracking Sudoku Solver
class Solution {
    public void solveSudoku(char[][] board) {
        solve(board);
    }

    private boolean solve(char[][] board) {
        for (int r = 0; r < 9; r++) {
            for (int c = 0; c < 9; c++) {
                if (board[r][c] == '.') {
                    for (char ch = '1'; ch <= '9'; ch++) {
                        if (isValid(board, r, c, ch)) {
                            board[r][c] = ch;
                            if (solve(board)) return true;
                            board[r][c] = '.';
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }

    private boolean isValid(char[][] board, int row, int col, char ch) {
        for (int i = 0; i < 9; i++) {
            if (board[row][i] == ch) return false;
            if (board[i][col] == ch) return false;
            if (board[3 * (row / 3) + i / 3][3 * (col / 3) + i % 3] == ch) return false;
        }
        return true;
    }
}`,
      python: `# Python Solution - Backtracking
class Solution:
    def solveSudoku(self, board: list[list[str]]) -> None:
        def is_valid(r: int, c: int, ch: str) -> bool:
            for i in range(9):
                if board[r][i] == ch or board[i][c] == ch:
                    return False
                if board[3 * (r // 3) + i // 3][3 * (c // 3) + i % 3] == ch:
                    return False
            return True

        def solve() -> bool:
            for r in range(9):
                for c in range(9):
                    if board[r][c] == ".":
                        for ch in "123456789":
                            if is_valid(r, c, ch):
                                board[r][c] = ch
                                if solve():
                                    return True
                                board[r][c] = "."
                        return False
            return True

        solve()`,
      javascript: `// JavaScript Solution - Backtracking Sudoku Solver
function solveSudoku(board) {
    function isValid(row, col, ch) {
        for (let i = 0; i < 9; i++) {
            if (board[row][i] === ch) return false;
            if (board[i][col] === ch) return false;
            const subRow = 3 * Math.floor(row / 3) + Math.floor(i / 3);
            const subCol = 3 * Math.floor(col / 3) + (i % 3);
            if (board[subRow][subCol] === ch) return false;
        }
        return true;
    }

    function solve() {
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (board[r][c] === '.') {
                    for (let d = 1; d <= 9; d++) {
                        const ch = String(d);
                        if (isValid(r, c, ch)) {
                            board[r][c] = ch;
                            if (solve()) return true;
                            board[r][c] = '.';
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }

    solve();
}`
    },
    interviewProTips: [
      'The subgrid formula `3 * (row / 3) + i / 3` and `3 * (col / 3) + i % 3` condenses 3 separate loops into a single 9-step loop.'
    ]
  },

  'bit-1': {
    questionId: 'bit-1',
    pattern: "Brian Kernighan's Bit Trick",
    intuition: [
      'Subtracting 1 from an integer flips all bits after the rightmost set bit (including the rightmost set bit itself).',
      'Therefore, `n & (n - 1)` clears the lowest set bit of `n` to zero in a single operation.',
      'Instead of looping over all 32 bits, we loop only as many times as there are set bits (1s) in the number.',
      'If a number has 3 set bits, the loop runs exactly 3 times!'
    ],
    pseudocode: [
      'FUNCTION countSetBits(n):',
      '  count = 0',
      '  WHILE n > 0:',
      '    n = n & (n - 1)  // Clears the lowest set bit',
      '    count = count + 1',
      '  RETURN count'
    ],
    timeComplexity: 'O(k) where k is the number of set bits (at most 32 or 64)',
    spaceComplexity: 'O(1)',
    complexityExplanation: 'Runs strictly proportional to the number of set bits, which is <= 32 for 32-bit integers.',
    edgeCases: [
      'n = 0 (returns 0 immediately)',
      'n = 2^k (single set bit, loop runs once)',
      'Negative numbers in 2s complement representation (use unsigned representation)'
    ],
    code: {
      cpp: `// C++ Solution - Brian Kernighan's Algorithm
class Solution {
public:
    int hammingWeight(uint32_t n) {
        int count = 0;
        while (n != 0) {
            n &= (n - 1); // Clears the lowest set bit
            count++;
        }
        return count;
    }
};`,
      java: `// Java Solution - Brian Kernighan's Algorithm
public class Solution {
    public int hammingWeight(int n) {
        int count = 0;
        while (n != 0) {
            n &= (n - 1);
            count++;
        }
        return count;
    }
}`,
      python: `# Python Solution - Brian Kernighan's Bit Trick
class Solution:
    def hammingWeight(self, n: int) -> int:
        count = 0
        while n:
            n &= (n - 1)
            count += 1
        return count`,
      javascript: `// JavaScript Solution - Brian Kernighan's Algorithm
function hammingWeight(n) {
    let count = 0;
    while (n !== 0) {
        n = (n & (n - 1)) >>> 0; // >>> 0 converts to unsigned 32-bit integer
        count++;
    }
    return count;
}`
    },
    interviewProTips: [
      'Mention that C++ provides `__builtin_popcount(n)` which maps directly to a single hardware instruction `POPCNT` on x86/ARM processors.'
    ]
  },

  'bit-2': {
    questionId: 'bit-2',
    pattern: 'Bitmask Subsets (2^N Generation)',
    intuition: [
      'An array of N elements has exactly 2^N unique subsets (the power set).',
      'Each subset can be represented as an N-bit binary integer from 0 to (2^N - 1).',
      'If the j-th bit of mask `i` is 1 (`(i >> j) & 1 == 1`), include `nums[j]` in the current subset.',
      'If the j-th bit is 0, exclude `nums[j]`.',
      'This generates all subsets iteratively without recursion or call stack overhead.'
    ],
    pseudocode: [
      'FUNCTION subsets(nums):',
      '  n = nums.length',
      '  totalSubsets = 1 << n  // 2^n',
      '  result = []',
      '  FOR mask = 0 TO totalSubsets - 1:',
      '    current = []',
      '    FOR j = 0 TO n - 1:',
      '      IF (mask >> j) & 1 == 1:',
      '        current.append(nums[j])',
      '    result.append(current)',
      '  RETURN result'
    ],
    timeComplexity: 'O(N * 2^N)',
    spaceComplexity: 'O(N * 2^N) for output storage',
    complexityExplanation: 'There are 2^N total subsets, and each subset takes O(N) time to construct.',
    edgeCases: [
      'Empty input array (yields [[]])',
      'Single element array (yields [[], [num]])',
      'Array with negative numbers'
    ],
    code: {
      cpp: `// C++ Solution - Bitmasking Power Set
#include <vector>

class Solution {
public:
    std::vector<std::vector<int>> subsets(std::vector<int>& nums) {
        int n = nums.size();
        int total = 1 << n; // 2^n
        std::vector<std::vector<int>> result;
        result.reserve(total);

        for (int mask = 0; mask < total; mask++) {
            std::vector<int> subset;
            for (int j = 0; j < n; j++) {
                if ((mask >> j) & 1) {
                    subset.push_back(nums[j]);
                }
            }
            result.push_back(subset);
        }
        return result;
    }
};`,
      java: `// Java Solution - Bitmask Power Set
import java.util.*;

class Solution {
    public List<List<Integer>> subsets(int[] nums) {
        int n = nums.length;
        int total = 1 << n;
        List<List<Integer>> result = new ArrayList<>(total);

        for (int mask = 0; mask < total; mask++) {
            List<Integer> subset = new ArrayList<>();
            for (int j = 0; j < n; j++) {
                if (((mask >> j) & 1) == 1) {
                    subset.add(nums[j]);
                }
            }
            result.add(subset);
        }
        return result;
    }
}`,
      python: `# Python Solution - Bitmask Generation
class Solution:
    def subsets(self, nums: list[int]) -> list[list[int]]:
        n = len(nums)
        result = []
        for mask in range(1 << n):
            subset = [nums[j] for j in range(n) if (mask >> j) & 1]
            result.append(subset)
        return result`,
      javascript: `// JavaScript Solution - Bitmask Generation
function subsets(nums) {
    const n = nums.length;
    const total = 1 << n;
    const result = [];

    for (let mask = 0; mask < total; mask++) {
        const subset = [];
        for (let j = 0; j < n; j++) {
            if ((mask >> j) & 1) {
                subset.push(nums[j]);
            }
        }
        result.push(subset);
    }
    return result;
}`
    },
    interviewProTips: [
      'Contrast bitmask generation with recursive backtracking: bitmasking avoids recursion depth, but backtracking can be pruned early with conditions.'
    ]
  },

  'bit-3': {
    questionId: 'bit-3',
    pattern: 'XOR Bit Manipulation (Self-Canceling Property)',
    intuition: [
      'The XOR operator (`^`) has three core mathematical properties:',
      '1. Identity: `x ^ 0 = x`',
      '2. Self-inverse: `x ^ x = 0`',
      '3. Commutative and Associative: `a ^ b ^ a = (a ^ a) ^ b = 0 ^ b = b`',
      'Since every number appears twice except one number which appears once, XORing all elements together cancels out all duplicate pairs (`x ^ x = 0`), leaving only the single number behind.'
    ],
    pseudocode: [
      'FUNCTION singleNumber(nums):',
      '  result = 0',
      '  FOR EACH num IN nums:',
      '    result = result ^ num',
      '  RETURN result'
    ],
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(1)',
    complexityExplanation: 'Iterates through the array once in linear time using a single accumulator variable.',
    edgeCases: [
      'Single element array `[k]` (returns `k`)',
      'Array with negative numbers (XOR works identical for negative integers in 2s complement)'
    ],
    code: {
      cpp: `// C++ Solution - XOR Property
#include <vector>

class Solution {
public:
    int singleNumber(std::vector<int>& nums) {
        int result = 0;
        for (int num : nums) {
            result ^= num;
        }
        return result;
    }
};`,
      java: `// Java Solution - XOR Property
class Solution {
    public int singleNumber(int[] nums) {
        int result = 0;
        for (int num : nums) {
            result ^= num;
        }
        return result;
    }
}`,
      python: `# Python Solution - XOR Fold / Accumulator
from functools import reduce

class Solution:
    def singleNumber(self, nums: list[int]) -> int:
        return reduce(lambda x, y: x ^ y, nums)`,
      javascript: `// JavaScript Solution - Array.prototype.reduce with XOR
function singleNumber(nums) {
    return nums.reduce((acc, curr) => acc ^ curr, 0);
}`
    },
    interviewProTips: [
      'Highlight the contrast with naive approaches: Hash Map takes O(N) space, Sorting takes O(N log N) time; XOR achieves O(N) time and O(1) space optimal performance.'
    ]
  }
};
