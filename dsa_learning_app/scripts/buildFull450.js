const fs = require('fs');
const path = require('path');

// Read the existing questions to preserve arr-1 to arr-20, str-1 to str-7, etc.
const existingFile = fs.readFileSync(path.join(__dirname, '../src/data/questions450.ts'), 'utf8');

// Function to extract existing questions
function extractExistingQuestions() {
  const content = existingFile.slice(existingFile.indexOf('export const QUESTIONS_450: Question[] = ['));
  // We can evaluate or parse
  const qStr = content.slice(content.indexOf('['), content.lastIndexOf(']') + 1);
  return eval(qStr);
}

const existingQuestions = extractExistingQuestions();
console.log('Loaded existing:', existingQuestions.length);

// Now define the remaining questions to reach exactly 450
const additionalQuestions = [
  // ================= ARRAYS & MATRIX CONT. (arr-21 to arr-45) =================
  {
    id: 'arr-21',
    title: 'Subarray with 0 sum',
    topic: 'arrays',
    difficulty: 'Easy',
    platform: 'GeeksforGeeks',
    url: 'https://practice.geeksforgeeks.org/problems/subarray-with-0-sum-1587115621/1',
    companies: ['Amazon', 'Microsoft', 'Paytm'],
    description: 'Determine if there exists a subarray with sum equal to 0 using prefix sum and hash set.'
  },
  {
    id: 'arr-22',
    title: 'Factorial of a large number',
    topic: 'arrays',
    difficulty: 'Medium',
    platform: 'GeeksforGeeks',
    url: 'https://practice.geeksforgeeks.org/problems/factorials-of-large-numbers2591/1',
    companies: ['Adobe', 'Amazon', 'MakeMyTrip'],
    description: 'Compute factorial of numbers up to 1000 using array representation of digits.'
  },
  {
    id: 'arr-23',
    title: 'Maximum Product Subarray',
    topic: 'arrays',
    difficulty: 'Medium',
    platform: 'LeetCode',
    url: 'https://leetcode.com/problems/maximum-product-subarray/',
    companies: ['Google', 'Amazon', 'Microsoft', 'LinkedIn'],
    description: 'Find contiguous subarray within an array which has the largest product.'
  },
  {
    id: 'arr-24',
    title: 'Longest Consecutive Subsequence',
    topic: 'arrays',
    difficulty: 'Medium',
    platform: 'LeetCode',
    url: 'https://leetcode.com/problems/longest-consecutive-sequence/',
    companies: ['Google', 'Amazon', 'Spotify'],
    description: 'Find the length of the longest consecutive elements sequence in O(N) time using HashSet.'
  },
  {
    id: 'arr-25',
    title: 'Given an array of size n and number k, find all elements that appear more than n/k times',
    topic: 'arrays',
    difficulty: 'Medium',
    platform: 'GeeksforGeeks',
    url: 'https://www.geeksforgeeks.org/given-an-array-of-of-size-n-finds-all-elements-that-appear-more-than-nk-times/',
    companies: ['Amazon', 'Microsoft'],
    description: 'Find majority candidates appearing more than n/k times using Boyer-Moore Voting extension.'
  },
  {
    id: 'arr-26',
    title: 'Maximum profit by buying and selling a share at most twice',
    topic: 'arrays',
    difficulty: 'Hard',
    platform: 'LeetCode',
    url: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iii/',
    companies: ['Amazon', 'Google', 'Facebook'],
    description: 'Calculate max profit with at most two transactions using dynamic state variables.'
  },
  {
    id: 'arr-27',
    title: 'Find whether an array is subset of another array',
    topic: 'arrays',
    difficulty: 'Easy',
    platform: 'GeeksforGeeks',
    url: 'https://practice.geeksforgeeks.org/problems/array-subset-of-another-array2317/1',
    companies: ['Amazon', 'Cisco'],
    description: 'Determine if arr2 is a subset of arr1 using frequency counting or sorting.'
  },
  {
    id: 'arr-28',
    title: 'Triplet Sum in Array (3Sum)',
    topic: 'arrays',
    difficulty: 'Medium',
    platform: 'LeetCode',
    url: 'https://leetcode.com/problems/3sum/',
    companies: ['Facebook', 'Amazon', 'Microsoft', 'Google'],
    description: 'Find all unique triplets [nums[i], nums[j], nums[k]] such that they sum to zero.'
  },
  {
    id: 'arr-29',
    title: 'Trapping Rain Water',
    topic: 'arrays',
    difficulty: 'Hard',
    platform: 'LeetCode',
    url: 'https://leetcode.com/problems/trapping-rain-water/',
    companies: ['Google', 'Amazon', 'Microsoft', 'Apple', 'Bloomberg'],
    description: 'Compute how much water can be trapped after raining using two pointers or monotonic stack.'
  },
  {
    id: 'arr-30',
    title: 'Chocolate Distribution Problem',
    topic: 'arrays',
    difficulty: 'Easy',
    platform: 'GeeksforGeeks',
    url: 'https://practice.geeksforgeeks.org/problems/chocolate-distribution-problem3825/1',
    companies: ['Amazon', 'Flipkart'],
    description: 'Distribute chocolate packets to m children such that difference between max and min is minimized.'
  },
  {
    id: 'arr-31',
    title: 'Smallest subarray with sum greater than a given value',
    topic: 'arrays',
    difficulty: 'Medium',
    platform: 'LeetCode',
    url: 'https://leetcode.com/problems/minimum-size-subarray-sum/',
    companies: ['Facebook', 'Amazon', 'Goldman Sachs'],
    description: 'Find minimal length of contiguous subarray of which the sum is >= target using sliding window.'
  },
  {
    id: 'arr-32',
    title: 'Three way partitioning of an array around a given range',
    topic: 'arrays',
    difficulty: 'Easy',
    platform: 'GeeksforGeeks',
    url: 'https://practice.geeksforgeeks.org/problems/three-way-partitioning/1',
    companies: ['Amazon', 'Paytm'],
    description: 'Partition array into three parts: values < a, values between a and b, and values > b.'
  },
  {
    id: 'arr-33',
    title: 'Minimum swaps required to bring elements less than or equal to k together',
    topic: 'arrays',
    difficulty: 'Medium',
    platform: 'GeeksforGeeks',
    url: 'https://practice.geeksforgeeks.org/problems/minimum-swaps-required-to-bring-all-elements-less-than-or-equal-to-k-together4847/1',
    companies: ['Amazon', 'Microsoft'],
    description: 'Find minimum swaps to bring elements <= k together using sliding window of size count.'
  },
  {
    id: 'arr-34',
    title: 'Minimum number of operations to make an array palindrome',
    topic: 'arrays',
    difficulty: 'Medium',
    platform: 'GeeksforGeeks',
    url: 'https://www.geeksforgeeks.org/find-minimum-number-of-merge-operations-to-make-an-array-palindrome/',
    companies: ['Amazon', 'Google'],
    description: 'Find minimum merge operations needed to make array elements form a palindrome.'
  },
  {
    id: 'arr-35',
    title: 'Median of 2 sorted arrays of equal size',
    topic: 'arrays',
    difficulty: 'Hard',
    platform: 'GeeksforGeeks',
    url: 'https://www.geeksforgeeks.org/median-of-two-sorted-arrays/',
    companies: ['Amazon', 'Microsoft'],
    description: 'Compute median of two sorted arrays of size N in O(log N) time using divide and conquer.'
  },
  {
    id: 'arr-36',
    title: 'Median of 2 sorted arrays of different sizes',
    topic: 'arrays',
    difficulty: 'Hard',
    platform: 'LeetCode',
    url: 'https://leetcode.com/problems/median-of-two-sorted-arrays/',
    companies: ['Google', 'Amazon', 'Microsoft', 'Apple'],
    description: 'Find median of two sorted arrays of size m and n in O(log(min(m, n))) binary search.'
  },
  {
    id: 'arr-37',
    title: 'Spiral Traversal on a Matrix',
    topic: 'arrays',
    difficulty: 'Medium',
    platform: 'LeetCode',
    url: 'https://leetcode.com/problems/spiral-matrix/',
    companies: ['Microsoft', 'Amazon', 'Paytm', 'Oracle'],
    description: 'Return all elements of matrix in spiral order using top, bottom, left, right bounds.'
  },
  {
    id: 'arr-38',
    title: 'Search an element in a 2D Matrix',
    topic: 'arrays',
    difficulty: 'Medium',
    platform: 'LeetCode',
    url: 'https://leetcode.com/problems/search-a-2d-matrix/',
    companies: ['Amazon', 'Paytm', 'Oracle', 'Facebook'],
    description: 'Search target in m x n matrix where each row is sorted and first integer of row > last of prev.'
  },
  {
    id: 'arr-39',
    title: 'Find median in a row-wise sorted matrix',
    topic: 'arrays',
    difficulty: 'Hard',
    platform: 'GeeksforGeeks',
    url: 'https://practice.geeksforgeeks.org/problems/median-in-a-row-wise-sorted-matrix1527/1',
    companies: ['Amazon', 'Samsung'],
    description: 'Find median in an R x C row-sorted matrix in O(32 * R * log C) binary search on answer.'
  },
  {
    id: 'arr-40',
    title: 'Find row with maximum number of 1s',
    topic: 'arrays',
    difficulty: 'Medium',
    platform: 'GeeksforGeeks',
    url: 'https://practice.geeksforgeeks.org/problems/row-with-max-1s0023/1',
    companies: ['Amazon', 'Microsoft', 'Paytm'],
    description: 'Find index of row with maximum count of 1s in a boolean 2D array where each row is sorted.'
  },
  {
    id: 'arr-41',
    title: 'Print elements in sorted order using row-column sorted matrix',
    topic: 'arrays',
    difficulty: 'Medium',
    platform: 'GeeksforGeeks',
    url: 'https://practice.geeksforgeeks.org/problems/sorted-matrix2333/1',
    companies: ['Amazon', 'Samsung'],
    description: 'Sort and return all elements of an N x N row and column sorted matrix.'
  },
  {
    id: 'arr-42',
    title: 'Maximum size rectangle of all 1s in a boolean matrix',
    topic: 'arrays',
    difficulty: 'Hard',
    platform: 'LeetCode',
    url: 'https://leetcode.com/problems/maximal-rectangle/',
    companies: ['Google', 'Amazon', 'Microsoft'],
    description: 'Find largest rectangle containing only 1s using largest rectangle in histogram for each row.'
  },
  {
    id: 'arr-43',
    title: 'Find a specific pair in matrix',
    topic: 'arrays',
    difficulty: 'Hard',
    platform: 'GeeksforGeeks',
    url: 'https://www.geeksforgeeks.org/find-a-specific-pair-in-matrix/',
    companies: ['Amazon', 'Adobe'],
    description: 'Find max value of mat[c][d] - mat[a][b] such that c > a and d > b in an N x N matrix.'
  },
  {
    id: 'arr-44',
    title: 'Rotate matrix by 90 degrees',
    topic: 'arrays',
    difficulty: 'Medium',
    platform: 'LeetCode',
    url: 'https://leetcode.com/problems/rotate-image/',
    companies: ['Amazon', 'Microsoft', 'Google', 'Apple'],
    description: 'Rotate n x n 2D matrix clockwise by 90 degrees in-place by transpose and row reversal.'
  },
  {
    id: 'arr-45',
    title: 'Kth smallest element in a row-column sorted matrix',
    topic: 'arrays',
    difficulty: 'Medium',
    platform: 'LeetCode',
    url: 'https://leetcode.com/problems/kth-smallest-element-in-a-sorted-matrix/',
    companies: ['Google', 'Facebook', 'Amazon'],
    description: 'Find kth smallest element in an n x n matrix where rows and columns are sorted.'
  },

  // ================= SEARCHING & SORTING (arr-46 to arr-75) =================
  {
    id: 'arr-46',
    title: 'Find first and last positions of an element in a sorted array',
    topic: 'arrays',
    difficulty: 'Medium',
    platform: 'LeetCode',
    url: 'https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/',
    companies: ['Amazon', 'Microsoft', 'Google'],
    description: 'Find starting and ending index of given target value using binary search in O(log N).'
  },
  {
    id: 'arr-47',
    title: 'Find a Fixed Point (Value equal to index) in a given array',
    topic: 'arrays',
    difficulty: 'Easy',
    platform: 'GeeksforGeeks',
    url: 'https://practice.geeksforgeeks.org/problems/value-equal-to-index-value1330/1',
    companies: ['Amazon', 'Flipkart'],
    description: 'Find element such that arr[i] == i in a sorted array in O(log N) time.'
  },
  {
    id: 'arr-48',
    title: 'Search in Rotated Sorted Array',
    topic: 'arrays',
    difficulty: 'Medium',
    platform: 'LeetCode',
    url: 'https://leetcode.com/problems/search-in-rotated-sorted-array/',
    companies: ['Google', 'Amazon', 'Microsoft', 'Bloomberg'],
    description: 'Search target in sorted array rotated at unknown pivot in O(log N) time.'
  },
  {
    id: 'arr-49',
    title: 'Square root of an integer',
    topic: 'arrays',
    difficulty: 'Easy',
    platform: 'LeetCode',
    url: 'https://leetcode.com/problems/sqrtx/',
    companies: ['Amazon', 'Microsoft', 'Apple'],
    description: 'Compute and return floor of square root of integer x using binary search.'
  },
  {
    id: 'arr-50',
    title: 'Find the repeating and the missing number',
    topic: 'arrays',
    difficulty: 'Medium',
    platform: 'GeeksforGeeks',
    url: 'https://practice.geeksforgeeks.org/problems/find-missing-and-repeating2512/1',
    companies: ['Amazon', 'Microsoft', 'Samsung'],
    description: 'Find number appearing twice and number missing in range 1 to N using math or XOR.'
  },
  {
    id: 'arr-51',
    title: 'Find majority element (Boyer-Moore Voting)',
    topic: 'arrays',
    difficulty: 'Easy',
    platform: 'LeetCode',
    url: 'https://leetcode.com/problems/majority-element/',
    companies: ['Amazon', 'Google', 'Microsoft'],
    description: 'Find element appearing more than n/2 times in O(N) time and O(1) space.'
  },
  {
    id: 'arr-52',
    title: 'Searching in an array where adjacent differ by at most k',
    topic: 'arrays',
    difficulty: 'Easy',
    platform: 'GeeksforGeeks',
    url: 'https://practice.geeksforgeeks.org/problems/searching-in-an-array-where-adjacent-differ-by-at-most-k0335/1',
    companies: ['Amazon'],
    description: 'Optimized search skipping step = max(1, abs(arr[i] - x)/k).'
  },
  {
    id: 'arr-53',
    title: 'Find pair given difference (arr[j] - arr[i] = diff)',
    topic: 'arrays',
    difficulty: 'Easy',
    platform: 'GeeksforGeeks',
    url: 'https://practice.geeksforgeeks.org/problems/find-pair-given-difference1559/1',
    companies: ['Amazon', 'Visa'],
    description: 'Find if there exists a pair with given difference using two pointers or hash map.'
  },
  {
    id: 'arr-54',
    title: 'Find four elements that sum to a given value (4Sum)',
    topic: 'arrays',
    difficulty: 'Medium',
    platform: 'LeetCode',
    url: 'https://leetcode.com/problems/4sum/',
    companies: ['Amazon', 'Microsoft', 'Google'],
    description: 'Find all unique quadruplets summing to target in O(N^3) time using sorting and two pointers.'
  },
  {
    id: 'arr-55',
    title: 'Maximum sum such that no 2 elements are adjacent (House Robber)',
    topic: 'arrays',
    difficulty: 'Medium',
    platform: 'LeetCode',
    url: 'https://leetcode.com/problems/house-robber/',
    companies: ['Amazon', 'Microsoft', 'Google'],
    description: 'Find maximum amount of money you can rob without alerting police (no adjacent houses).'
  },
  {
    id: 'arr-56',
    title: 'Count triplet with sum smaller than a given value',
    topic: 'arrays',
    difficulty: 'Medium',
    platform: 'GeeksforGeeks',
    url: 'https://practice.geeksforgeeks.org/problems/count-triplets-with-sum-smaller-than-x5549/1',
    companies: ['Amazon', 'Adobe'],
    description: 'Count triplets with sum < X in O(N^2) time using sorting and two pointers.'
  },
  {
    id: 'arr-57',
    title: 'Merge 2 sorted arrays without extra space',
    topic: 'arrays',
    difficulty: 'Hard',
    platform: 'GeeksforGeeks',
    url: 'https://practice.geeksforgeeks.org/problems/merge-two-sorted-arrays-1587115620/1',
    companies: ['Amazon', 'Microsoft', 'Goldman Sachs'],
    description: 'Merge two sorted arrays in-place using Gap Method (Shell sort logic) in O((N+M)log(N+M)).'
  },
  {
    id: 'arr-58',
    title: 'Product array puzzle (Product of Array Except Self)',
    topic: 'arrays',
    difficulty: 'Medium',
    platform: 'LeetCode',
    url: 'https://leetcode.com/problems/product-of-array-except-self/',
    companies: ['Amazon', 'Facebook', 'Microsoft', 'Apple'],
    description: 'Return array where output[i] equals product of all elements except nums[i] in O(N) without division.'
  },
  {
    id: 'arr-59',
    title: 'Sort array according to count of set bits',
    topic: 'arrays',
    difficulty: 'Medium',
    platform: 'GeeksforGeeks',
    url: 'https://practice.geeksforgeeks.org/problems/sort-by-set-bit-count1153/1',
    companies: ['Amazon', 'Samsung'],
    description: 'Sort array elements in descending order of count of set bits using stable sort.'
  },
  {
    id: 'arr-60',
    title: 'Minimum number of swaps needed to sort the array',
    topic: 'arrays',
    difficulty: 'Medium',
    platform: 'GeeksforGeeks',
    url: 'https://practice.geeksforgeeks.org/problems/minimum-swaps/1',
    companies: ['Amazon', 'Microsoft'],
    description: 'Find minimum swaps required to sort an array using graph cycle decomposition.'
  },
  {
    id: 'arr-61',
    title: 'Bishu and Soldiers (Binary Search Problem)',
    topic: 'arrays',
    difficulty: 'Easy',
    platform: 'HackerEarth',
    url: 'https://www.hackerearth.com/practice/algorithms/searching/binary-search/practice-problems/algorithm/bishu-and-soldiers-227/',
    companies: ['Samsung', 'Amazon'],
    description: 'Find count and cumulative power of soldiers Bishu can defeat using binary search and prefix sum.'
  },
  {
    id: 'arr-62',
    title: 'Kth element of two sorted Arrays',
    topic: 'arrays',
    difficulty: 'Medium',
    platform: 'GeeksforGeeks',
    url: 'https://practice.geeksforgeeks.org/problems/k-th-element-of-two-sorted-array1317/1',
    companies: ['Amazon', 'Microsoft', 'Google'],
    description: 'Find kth element in union of two sorted arrays in O(log(min(N, M))) binary search.'
  },
  {
    id: 'arr-63',
    title: 'Aggressive cows (Binary Search on Answer)',
    topic: 'arrays',
    difficulty: 'Medium',
    platform: 'SPOJ',
    url: 'https://www.spoj.com/problems/AGGRCOW/',
    companies: ['Amazon', 'Google', 'Flipkart'],
    description: 'Assign C cows to N stalls such that minimum distance between any two cows is maximized.'
  },
  {
    id: 'arr-64',
    title: 'Book Allocation Problem',
    topic: 'arrays',
    difficulty: 'Hard',
    platform: 'GeeksforGeeks',
    url: 'https://practice.geeksforgeeks.org/problems/allocate-minimum-number-of-pages0937/1',
    companies: ['Google', 'Amazon', 'Microsoft'],
    description: 'Allocate books to m students such that maximum pages allocated to a student is minimized.'
  },
  {
    id: 'arr-65',
    title: 'EKOSPOJ (Woodcutter / Eko Eko)',
    topic: 'arrays',
    difficulty: 'Medium',
    platform: 'SPOJ',
    url: 'https://www.spoj.com/problems/EKO/',
    companies: ['Amazon', 'Directi'],
    description: 'Find max integer saw height H to collect at least M meters of wood using binary search on answer.'
  },
  {
    id: 'arr-66',
    title: 'Missing Number in Arithmetic Progression',
    topic: 'arrays',
    difficulty: 'Easy',
    platform: 'GeeksforGeeks',
    url: 'https://practice.geeksforgeeks.org/problems/missing-element-of-ap2228/1',
    companies: ['Amazon', 'Morgan Stanley'],
    description: 'Find missing element in a sorted array representing AP in O(log N) binary search.'
  },
  {
    id: 'arr-67',
    title: 'Smallest factorial number with trailing zeroes',
    topic: 'arrays',
    difficulty: 'Medium',
    platform: 'GeeksforGeeks',
    url: 'https://practice.geeksforgeeks.org/problems/smallest-factorial-number5929/1',
    companies: ['Amazon', 'Microsoft'],
    description: 'Find smallest number n whose factorial contains at least digits trailing zeroes.'
  },
  {
    id: 'arr-68',
    title: 'Painter\'s Partition Problem',
    topic: 'arrays',
    difficulty: 'Hard',
    platform: 'GeeksforGeeks',
    url: 'https://practice.geeksforgeeks.org/problems/the-painters-partition-problem1535/1',
    companies: ['Google', 'Amazon', 'Microsoft'],
    description: 'Paint N boards of varying lengths with K painters in minimum time using binary search on answer.'
  },
  {
    id: 'arr-69',
    title: 'ROTI-Prata (SPOJ Binary Search)',
    topic: 'arrays',
    difficulty: 'Hard',
    platform: 'SPOJ',
    url: 'https://www.spoj.com/problems/PRATA/',
    companies: ['Google', 'DE Shaw'],
    description: 'Find minimum time needed to make P pratas by N cooks with varying ranks.'
  },
  {
    id: 'arr-70',
    title: 'Double Helix (SPOJ Intersection Paths)',
    topic: 'arrays',
    difficulty: 'Medium',
    platform: 'SPOJ',
    url: 'https://www.spoj.com/problems/ANARC05B/',
    companies: ['Amazon'],
    description: 'Find path with maximum sum in two sorted sequences crossing at common bridge elements.'
  },
  {
    id: 'arr-71',
    title: 'Subset Sums with target constraints (Binary Search on Subsets)',
    topic: 'arrays',
    difficulty: 'Hard',
    platform: 'SPOJ',
    url: 'https://www.spoj.com/problems/SUBSUMS/',
    companies: ['Google'],
    description: 'Given sequence of N integers, calculate how many subsets have sum between A and B (Meet in Middle).'
  },
  {
    id: 'arr-72',
    title: 'Find pivot element in sorted and rotated array',
    topic: 'arrays',
    difficulty: 'Easy',
    platform: 'LeetCode',
    url: 'https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/',
    companies: ['Amazon', 'Microsoft', 'Bloomberg'],
    description: 'Find minimum element / pivot in sorted rotated array in O(log N) time.'
  },
  {
    id: 'arr-73',
    title: 'Kth Smallest Number Again (Segment Searching)',
    topic: 'arrays',
    difficulty: 'Medium',
    platform: 'HackerEarth',
    url: 'https://www.hackerearth.com/practice/algorithms/searching/binary-search/practice-problems/algorithm/kth-smallest-number-again-2/',
    companies: ['Amazon'],
    description: 'Merge overlapping intervals and find kth smallest number within the unified segments.'
  },
  {
    id: 'arr-74',
    title: 'Optimum location of point to minimize total distance',
    topic: 'arrays',
    difficulty: 'Hard',
    platform: 'GeeksforGeeks',
    url: 'https://www.geeksforgeeks.org/optimum-location-point-minimize-total-distance/',
    companies: ['Amazon', 'Microsoft'],
    description: 'Find point on given line that minimizes total Euclidean distance to set of points (Ternary Search).'
  },
  {
    id: 'arr-75',
    title: 'Job Sequencing with Deadlines & Profits',
    topic: 'arrays',
    difficulty: 'Medium',
    platform: 'GeeksforGeeks',
    url: 'https://practice.geeksforgeeks.org/problems/job-sequencing-problem-1587115620/1',
    companies: ['Amazon', 'Microsoft'],
    description: 'Maximize profit by scheduling jobs within their deadlines using greedy sorting and DSU.'
  }
];

// Combine arrays
console.log('Additional questions prepared.');
