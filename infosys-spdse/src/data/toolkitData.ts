export interface ComplexityRule {
  constraint: string;
  maxOps: string;
  expectedComplexity: string;
  candidatePatterns: string;
}

export interface JavaGotcha {
  title: string;
  codeWrong: string;
  codeCorrect: string;
  explanation: string;
}

export const complexityRules: ComplexityRule[] = [
  {
    constraint: "N <= 10 to 11",
    maxOps: "~3.6 * 10^6",
    expectedComplexity: "O(N!) or O(N^2 * 2^N)",
    candidatePatterns: "Permutations, Traveling Salesperson, Backtracking with Pruning"
  },
  {
    constraint: "N <= 20 to 22",
    maxOps: "~4.1 * 10^6",
    expectedComplexity: "O(2^N) or O(N * 2^N)",
    candidatePatterns: "Bitmask Dynamic Programming, Meet in the Middle, Subset Search"
  },
  {
    constraint: "N <= 100",
    maxOps: "~10^6",
    expectedComplexity: "O(N^3) or O(N^4 / 24)",
    candidatePatterns: "Floyd-Warshall, Matrix Chain Multiplication, 3D Dynamic Programming"
  },
  {
    constraint: "N <= 500 to 1000",
    maxOps: "~10^6 to 10^8",
    expectedComplexity: "O(N^2)",
    candidatePatterns: "2D Grid DP, 0/1 Knapsack, LCS, All Pairs comparison, Brute force partial score"
  },
  {
    constraint: "N <= 10^5 to 2 * 10^5",
    maxOps: "~2 * 10^6 to 4 * 10^6",
    expectedComplexity: "O(N log N) or O(N)",
    candidatePatterns: "Sorting + Greedy, Binary Search on Answer, Two Pointers, Fenwick Tree, Monotonic Stack"
  },
  {
    constraint: "N <= 10^6 to 10^7",
    maxOps: "~10^7",
    expectedComplexity: "O(N) or O(N log log N)",
    candidatePatterns: "Linear scan, Sieve of Eratosthenes, Difference Array, Prefix Sums"
  },
  {
    constraint: "N <= 10^12 to 10^18",
    maxOps: "~60 ops",
    expectedComplexity: "O(log N) or O(sqrt(N)) or O(1)",
    candidatePatterns: "Binary Search, Matrix Exponentiation, Prime Factorization, Modular Inverse"
  }
];

export const javaGotchas: JavaGotcha[] = [
  {
    title: "Dual int multiplication causing overflow before long assignment",
    codeWrong: "long area = width * height; // if width and height are int, overflow occurs BEFORE widening!",
    codeCorrect: "long area = (long) width * height;",
    explanation: "In Java, binary operations on ints produce an int. If width*height exceeds 2*10^9, it wraps around to negative before being cast to long."
  },
  {
    title: "Arrays.sort() on primitive int[] worst case O(N^2)",
    codeWrong: "int[] arr = new int[n];\nArrays.sort(arr); // Uses Dual-Pivot Quicksort, vulnerable to anti-quicksort test cases O(N^2) TLE!",
    codeCorrect: "// Use Integer[] with custom sort or shuffle before sorting:\nInteger[] arr = new Integer[n];\nArrays.sort(arr); // Uses TimSort O(N log N) worst-case",
    explanation: "HackerEarth hidden test cases sometimes include adversarial arrays designed to trigger O(N^2) worst case in Dual-Pivot Quicksort. TimSort (on Integer[]) is guaranteed O(N log N)."
  },
  {
    title: "Object equality vs value equality with Integer and Long",
    codeWrong: "if (list.get(i) == list.get(j)) // Fails for values outside -128 to 127 due to Integer cache!",
    codeCorrect: "if (list.get(i).equals(list.get(j))) // Always compares value",
    explanation: "Java caches Integer objects between -128 and 127. Values outside this range create distinct object references, making '==' false even when values match."
  },
  {
    title: "String concatenation inside loops creating O(N^2) garbage",
    codeWrong: "String s = \"\";\nfor (int i = 0; i < n; i++) s += arr[i]; // Copies entire string each iteration O(N^2) TLE!",
    codeCorrect: "StringBuilder sb = new StringBuilder();\nfor (int i = 0; i < n; i++) sb.append(arr[i]);",
    explanation: "Strings are immutable in Java. Re-assigning '+' allocates a new char array and copies all existing chars, destroying performance."
  }
];

export const edgeCaseChecklist = [
  "N = 0 or N = 1 (Single element array, zero iterations)",
  "All elements identical (e.g. [5, 5, 5, 5] causing infinite loops or zero differences)",
  "Negative numbers in sum modulo K ((sum % K + K) % K)",
  "Integer values up to 10^9 (sums exceed 2*10^9 -> requires 64-bit long)",
  "All positive numbers vs all negative numbers (Kadane's reset logic)",
  "Target element not present / impossible configuration (return -1 or 0)",
  "Disconnected graphs (multiple components; run BFS/DFS in a component loop)",
  "String with all identical characters or already a palindrome",
  "Graph with self-loops or parallel edges",
  "Extreme values: K = 1, K = N, or K > N"
];

export const examDayChecklist = [
  "Verify compiler versions and test standard stdin/stdout in the warm-up problem.",
  "Check whether tab switching between P1, P2, P3 is unrestricted or forward-locked.",
  "Always read constraints first: identify the target complexity before writing a single line of code.",
  "Implement fast I/O immediately in Java (BufferedReader) or C++ (cin.tie(NULL)).",
  "If optimal approach on P3 is not clear within 15 minutes, write and submit a brute-force solution to bank 15-20 partial marks.",
  "Check for 64-bit integer overflow on every multiplication and cumulative sum.",
  "Verify custom test cases with edge values: N=1, maximum array elements, and all negative numbers.",
  "Do not leave any print/debug statements in the code before clicking Final Submit."
];
