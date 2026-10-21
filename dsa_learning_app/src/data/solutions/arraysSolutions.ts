import { ProblemSolution } from '../../types/dsa';

export const ARRAYS_SOLUTIONS: Record<string, ProblemSolution> = {
  'arr-1': {
    questionId: 'arr-1',
    pattern: 'Two Pointers (Opposite Direction)',
    intuition: [
      'An array reversal simply swaps symmetric elements from the boundaries inward.',
      'Initialize a pointer `left` at index 0 and `right` at index `n - 1`.',
      'Swap `arr[left]` and `arr[right]`, then advance `left++` and retreat `right--`.',
      'Stop when `left >= right`. This runs in O(N/2) swaps which is linear O(N) time and requires zero extra space O(1).'
    ],
    pseudocode: [
      'FUNCTION reverseArray(arr):',
      '  left = 0, right = arr.length - 1',
      '  WHILE left < right:',
      '    SWAP(arr[left], arr[right])',
      '    left = left + 1',
      '    right = right - 1',
      '  RETURN arr'
    ],
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(1)',
    complexityExplanation: 'We perform N/2 swaps in-place without auxiliary data structures.',
    edgeCases: [
      'Empty array (length == 0)',
      'Single element array (left and right meet at index 0 without swapping)',
      'Array with all identical elements'
    ],
    code: {
      cpp: `// C++ Solution - In-place Two Pointers
#include <vector>
#include <algorithm>

void reverseArray(std::vector<int>& arr) {
    int left = 0;
    int right = arr.size() - 1;
    while (left < right) {
        std::swap(arr[left], arr[right]);
        left++;
        right--;
    }
}`,
      java: `// Java Solution - In-place Two Pointers
public class Solution {
    public void reverseArray(int[] arr) {
        int left = 0;
        int right = arr.length - 1;
        while (left < right) {
            int temp = arr[left];
            arr[left] = arr[right];
            arr[right] = temp;
            left++;
            right--;
        }
    }
}`,
      python: `# Python Solution - Two Pointers
def reverseArray(arr: list[int]) -> list[int]:
    left, right = 0, len(arr) - 1
    while left < right:
        arr[left], arr[right] = arr[right], arr[left]
        left += 1
        right -= 1
    return arr`,
      javascript: `// JavaScript Solution - In-place Two Pointers
function reverseArray(arr) {
  let left = 0;
  let right = arr.length - 1;
  while (left < right) {
    [arr[left], arr[right]] = [arr[right], arr[left]];
    left++;
    right--;
  }
  return arr;
}`
    },
    interviewProTips: [
      'Always mention that strings in Java and Python are immutable, so you must convert them to a character array or list before in-place reversal.',
      'In C++, `std::reverse(arr.begin(), arr.end())` is the STL idiom.'
    ],
    approaches: {
      brute: {
        name: 'Auxiliary Array Copy',
        tier: 'brute',
        badge: '🥉 Brute Force',
        intuition: [
          'Create a new auxiliary array of size N.',
          'Iterate through the original array from the end to the beginning, copying elements into the new array.',
          'Copy the new array back into the original array.',
          'While intuitive, it takes O(N) extra space which is rejected by interviewers when O(1) in-place is possible.'
        ],
        pseudocode: [
          'FUNCTION reverseArray_brute(arr):',
          '  n = arr.length',
          '  temp = new Array(n)',
          '  FOR i from 0 TO n - 1:',
          '    temp[i] = arr[n - 1 - i]',
          '  FOR i from 0 TO n - 1:',
          '    arr[i] = temp[i]',
          '  RETURN arr'
        ],
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(N)',
        complexityExplanation: 'Requires allocating an auxiliary array of size N, taking O(N) auxiliary space.',
        code: {
          cpp: `// Brute Force - Auxiliary Array Copy
#include <vector>

void reverseArrayBrute(std::vector<int>& arr) {
    int n = arr.size();
    std::vector<int> temp(n);
    for (int i = 0; i < n; i++) {
        temp[i] = arr[n - 1 - i];
    }
    for (int i = 0; i < n; i++) {
        arr[i] = temp[i];
    }
}`,
          java: `// Brute Force - Auxiliary Array Copy
public class Solution {
    public void reverseArrayBrute(int[] arr) {
        int n = arr.length;
        int[] temp = new int[n];
        for (int i = 0; i < n; i++) {
            temp[i] = arr[n - 1 - i];
        }
        for (int i = 0; i < n; i++) {
            arr[i] = temp[i];
        }
    }
}`,
          python: `# Brute Force - Auxiliary List Copy
def reverseArrayBrute(arr: list[int]) -> list[int]:
    n = len(arr)
    temp = [0] * n
    for i in range(n):
        temp[i] = arr[n - 1 - i]
    for i in range(n):
        arr[i] = temp[i]
    return arr`,
          javascript: `// Brute Force - Auxiliary Array Copy
function reverseArrayBrute(arr) {
  const n = arr.length;
  const temp = new Array(n);
  for (let i = 0; i < n; i++) {
    temp[i] = arr[n - 1 - i];
  }
  for (let i = 0; i < n; i++) {
    arr[i] = temp[i];
  }
  return arr;
}`
        }
      },
      better: {
        name: 'Stack-Based Reversal',
        tier: 'better',
        badge: '🥈 Better / Stack Buffer',
        intuition: [
          'Push all elements of the array onto a Last-In, First-Out (LIFO) Stack.',
          'Pop elements off the stack one by one and write them back into the array from index 0.',
          'Because the stack reverses insertion order, the array is naturally reversed.',
          'Demonstrates understanding of LIFO data structures, but still uses O(N) auxiliary stack memory.'
        ],
        pseudocode: [
          'FUNCTION reverseArray_stack(arr):',
          '  stack = new Stack()',
          '  FOR EACH elem IN arr:',
          '    stack.push(elem)',
          '  FOR i from 0 TO arr.length - 1:',
          '    arr[i] = stack.pop()',
          '  RETURN arr'
        ],
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(N)',
        complexityExplanation: 'Two sequential passes (N pushes, N pops) with O(N) auxiliary stack memory.',
        code: {
          cpp: `// Better - Stack Based Reversal
#include <vector>
#include <stack>

void reverseArrayStack(std::vector<int>& arr) {
    std::stack<int> st;
    for (int num : arr) {
        st.push(num);
    }
    for (size_t i = 0; i < arr.size(); i++) {
        arr[i] = st.top();
        st.pop();
    }
}`,
          java: `// Better - Stack Based Reversal
import java.util.Stack;

public class Solution {
    public void reverseArrayStack(int[] arr) {
        Stack<Integer> stack = new Stack<>();
        for (int num : arr) {
            stack.push(num);
        }
        for (int i = 0; i < arr.length; i++) {
            arr[i] = stack.pop();
        }
    }
}`,
          python: `# Better - Stack Based Reversal
def reverseArrayStack(arr: list[int]) -> list[int]:
    stack = []
    for num in arr:
        stack.append(num)
    for i in range(len(arr)):
        arr[i] = stack.pop()
    return arr`,
          javascript: `// Better - Stack Based Reversal
function reverseArrayStack(arr) {
  const stack = [];
  for (const num of arr) {
    stack.push(num);
  }
  for (let i = 0; i < arr.length; i++) {
    arr[i] = stack.pop();
  }
  return arr;
}`
        }
      },
      optimal: {
        name: 'In-Place Two Pointers',
        tier: 'optimal',
        badge: '🥇 Optimal (In-Place O(1) Memory)',
        intuition: [
          'Place pointer `left = 0` at the start and `right = n - 1` at the end.',
          'Swap elements at left and right indices directly in-place.',
          'Increment `left++` and decrement `right--` until pointers meet or cross.',
          'Requires only N/2 swaps, linear O(N) time, and strictly zero auxiliary memory O(1).'
        ],
        pseudocode: [
          'FUNCTION reverseArray_optimal(arr):',
          '  left = 0, right = arr.length - 1',
          '  WHILE left < right:',
          '    SWAP(arr[left], arr[right])',
          '    left++, right--',
          '  RETURN arr'
        ],
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(1)',
        complexityExplanation: 'Operates directly in-place with exactly N/2 swaps and no extra memory allocated.',
        code: {
          cpp: `// Optimal - In-place Two Pointers
#include <vector>
#include <algorithm>

void reverseArray(std::vector<int>& arr) {
    int left = 0;
    int right = arr.size() - 1;
    while (left < right) {
        std::swap(arr[left], arr[right]);
        left++;
        right--;
    }
}`,
          java: `// Optimal - In-place Two Pointers
public class Solution {
    public void reverseArray(int[] arr) {
        int left = 0;
        int right = arr.length - 1;
        while (left < right) {
            int temp = arr[left];
            arr[left] = arr[right];
            arr[right] = temp;
            left++;
            right--;
        }
    }
}`,
          python: `# Optimal - In-place Two Pointers
def reverseArray(arr: list[int]) -> list[int]:
    left, right = 0, len(arr) - 1
    while left < right:
        arr[left], arr[right] = arr[right], arr[left]
        left += 1
        right -= 1
    return arr`,
          javascript: `// Optimal - In-place Two Pointers
function reverseArray(arr) {
  let left = 0;
  let right = arr.length - 1;
  while (left < right) {
    [arr[left], arr[right]] = [arr[right], arr[left]];
    left++;
    right--;
  }
  return arr;
}`
        }
      }
    }
  },

  'arr-2': {
    questionId: 'arr-2',
    pattern: 'Pairwise Comparison / Tournament Method',
    intuition: [
      'Standard sequential scan compares each element against both min and max, taking 2*(N-1) comparisons.',
      'Optimized tournament approach: compare elements in pairs! Compare `arr[i]` and `arr[i+1]` with 1 comparison.',
      'Then compare the larger one against global `max`, and smaller one against global `min`.',
      'Total comparisons reduce from 2N to 3N/2 - 2 (25% fewer comparisons).'
    ],
    pseudocode: [
      'FUNCTION getMinMax(arr):',
      '  IF arr is empty: RETURN null',
      '  Initialize minVal, maxVal from first 1 or 2 elements',
      '  FOR i from start TO n - 1 STEP 2:',
      '    Compare arr[i] with arr[i+1]',
      '    Update maxVal with the larger element',
      '    Update minVal with the smaller element',
      '  RETURN (minVal, maxVal)'
    ],
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(1)',
    complexityExplanation: 'Requires only 3*(N/2) comparisons in worst case.',
    edgeCases: [
      'Odd length array vs Even length array',
      'All negative numbers',
      'Array where all elements are identical'
    ],
    code: {
      cpp: `// C++ Pairwise Tournament Method
#include <vector>
#include <utility>
#include <algorithm>

std::pair<int, int> getMinMax(const std::vector<int>& arr) {
    int n = arr.size();
    int minVal, maxVal, i;
    if (n % 2 == 0) {
        minVal = std::min(arr[0], arr[1]);
        maxVal = std::max(arr[0], arr[1]);
        i = 2;
    } else {
        minVal = maxVal = arr[0];
        i = 1;
    }
    while (i < n - 1) {
        if (arr[i] < arr[i + 1]) {
            minVal = std::min(minVal, arr[i]);
            maxVal = std::max(maxVal, arr[i + 1]);
        } else {
            minVal = std::min(minVal, arr[i + 1]);
            maxVal = std::max(maxVal, arr[i]);
        }
        i += 2;
    }
    return {minVal, maxVal};
}`,
      java: `// Java Pairwise Comparison
public class Solution {
    public static class Pair {
        public int min;
        public int max;
        public Pair(int min, int max) { this.min = min; this.max = max; }
    }

    public Pair getMinMax(int[] arr) {
        int n = arr.length;
        int minVal, maxVal, i;
        if (n % 2 == 0) {
            minVal = Math.min(arr[0], arr[1]);
            maxVal = Math.max(arr[0], arr[1]);
            i = 2;
        } else {
            minVal = maxVal = arr[0];
            i = 1;
        }
        while (i < n - 1) {
            if (arr[i] < arr[i + 1]) {
                minVal = Math.min(minVal, arr[i]);
                maxVal = Math.max(maxVal, arr[i + 1]);
            } else {
                minVal = Math.min(minVal, arr[i + 1]);
                maxVal = Math.max(maxVal, arr[i]);
            }
            i += 2;
        }
        return new Pair(minVal, maxVal);
    }
}`,
      python: `# Python Pairwise Comparison
def getMinMax(arr: list[int]) -> tuple[int, int]:
    n = len(arr)
    if n % 2 == 0:
        min_val = min(arr[0], arr[1])
        max_val = max(arr[0], arr[1])
        i = 2
    else:
        min_val = max_val = arr[0]
        i = 1
        
    while i < n - 1:
        if arr[i] < arr[i + 1]:
            min_val = min(min_val, arr[i])
            max_val = max(max_val, arr[i + 1])
        else:
            min_val = min(min_val, arr[i + 1])
            max_val = max(max_val, arr[i])
        i += 2
        
    return (min_val, max_val)`,
      javascript: `// JavaScript Pairwise Comparison
function getMinMax(arr) {
  const n = arr.length;
  let minVal, maxVal, i;
  if (n % 2 === 0) {
    minVal = Math.min(arr[0], arr[1]);
    maxVal = Math.max(arr[0], arr[1]);
    i = 2;
  } else {
    minVal = maxVal = arr[0];
    i = 1;
  }
  while (i < n - 1) {
    if (arr[i] < arr[i + 1]) {
      minVal = Math.min(minVal, arr[i]);
      maxVal = Math.max(maxVal, arr[i + 1]);
    } else {
      minVal = Math.min(minVal, arr[i + 1]);
      maxVal = Math.max(maxVal, arr[i]);
    }
    i += 2;
  }
  return { min: minVal, max: maxVal };
}`
    },
    interviewProTips: [
      'Interviewers love asking: "Can you do it in fewer than 2N comparisons?" Mentioning the Pairwise Tournament method demonstrates strong algorithmic rigor.'
    ]
  },

  'arr-4': {
    questionId: 'arr-4',
    pattern: 'Dutch National Flag (3-Way Partitioning)',
    intuition: [
      'Problem asks to sort array of 0s, 1s, and 2s in-place in a single pass without using library sort.',
      'Maintain 3 pointers: `low` (boundary for 0s), `mid` (current element), and `high` (boundary for 2s).',
      'Invariant: [0 .. low-1] are 0s, [low .. mid-1] are 1s, [mid .. high] are unexamined, [high+1 .. n-1] are 2s.',
      'If `arr[mid] == 0`: swap with `arr[low]`, increment both `low++` and `mid++`.',
      'If `arr[mid] == 1`: just increment `mid++`.',
      'If `arr[mid] == 2`: swap with `arr[high]`, decrement `high--` (do NOT increment mid because swapped element needs evaluation).'
    ],
    pseudocode: [
      'FUNCTION sortColors(nums):',
      '  low = 0, mid = 0, high = nums.length - 1',
      '  WHILE mid <= high:',
      '    IF nums[mid] == 0:',
      '      SWAP(nums[low], nums[mid])',
      '      low++, mid++',
      '    ELSE IF nums[mid] == 1:',
      '      mid++',
      '    ELSE:',
      '      SWAP(nums[mid], nums[high])',
      '      high--',
      '  RETURN nums'
    ],
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(1)',
    complexityExplanation: 'Each step increments mid or decrements high; array elements are processed in a single pass.',
    edgeCases: [
      'Array with only one type of element (e.g. all 2s)',
      'Array already sorted [0, 0, 1, 1, 2, 2]',
      'Reverse sorted array [2, 2, 1, 1, 0, 0]'
    ],
    code: {
      cpp: `// C++ Dutch National Flag Algorithm
#include <vector>
#include <algorithm>

void sortColors(std::vector<int>& nums) {
    int low = 0, mid = 0, high = nums.size() - 1;
    while (mid <= high) {
        if (nums[mid] == 0) {
            std::swap(nums[low++], nums[mid++]);
        } else if (nums[mid] == 1) {
            mid++;
        } else {
            std::swap(nums[mid], nums[high--]);
        }
    }
}`,
      java: `// Java Dutch National Flag Algorithm
public class Solution {
    public void sortColors(int[] nums) {
        int low = 0, mid = 0, high = nums.length - 1;
        while (mid <= high) {
            if (nums[mid] == 0) {
                int temp = nums[low];
                nums[low] = nums[mid];
                nums[mid] = temp;
                low++;
                mid++;
            } else if (nums[mid] == 1) {
                mid++;
            } else {
                int temp = nums[mid];
                nums[mid] = nums[high];
                nums[high] = temp;
                high--;
            }
        }
    }
}`,
      python: `# Python Dutch National Flag Algorithm
def sortColors(nums: list[int]) -> None:
    low, mid, high = 0, 0, len(nums) - 1
    while mid <= high:
        if nums[mid] == 0:
            nums[low], nums[mid] = nums[mid], nums[low]
            low += 1
            mid += 1
        elif nums[mid] == 1:
            mid += 1
        else:
            nums[mid], nums[high] = nums[high], nums[mid]
            high -= 1`,
      javascript: `// JavaScript Dutch National Flag Algorithm
function sortColors(nums) {
  let low = 0, mid = 0, high = nums.length - 1;
  while (mid <= high) {
    if (nums[mid] === 0) {
      [nums[low], nums[mid]] = [nums[mid], nums[low]];
      low++;
      mid++;
    } else if (nums[mid] === 1) {
      mid++;
    } else {
      [nums[mid], nums[high]] = [nums[high], nums[mid]];
      high--;
    }
  }
}`
    },
    interviewProTips: [
      'The common bug is incrementing `mid` when swapping with `high`. Emphasize that the element swapped from `high` has not been checked yet, so `mid` must NOT be incremented.'
    ],
    approaches: {
      brute: {
        name: 'Standard Comparison Sort',
        tier: 'brute',
        badge: '🥉 Brute Force',
        intuition: [
          'Use standard comparison-based sorting (such as Merge Sort or Dual-Pivot QuickSort) to sort the array of numbers.',
          'While completely functional, it ignores the special constraint that the array only contains three discrete values (0, 1, 2).',
          'Comparison sorts are bound by the theoretical lower limit of Omega(N log N) comparisons.',
          'Interviewers explicitly disallow library sort for this problem to test partitioning knowledge.'
        ],
        pseudocode: [
          'FUNCTION sortColors_brute(nums):',
          '  // Standard library or quicksort',
          '  sort(nums.begin(), nums.end())',
          '  RETURN nums'
        ],
        timeComplexity: 'O(N log N)',
        spaceComplexity: 'O(1)',
        complexityExplanation: 'Standard comparison sorting takes O(N log N) time and O(1) auxiliary space (or O(log N) recursion stack).',
        code: {
          cpp: `// Brute Force - Standard Comparison Sort O(N log N)
#include <vector>
#include <algorithm>

void sortColorsBrute(std::vector<int>& nums) {
    std::sort(nums.begin(), nums.end());
}`,
          java: `// Brute Force - Standard Comparison Sort O(N log N)
import java.util.Arrays;

public class Solution {
    public void sortColorsBrute(int[] nums) {
        Arrays.sort(nums);
    }
}`,
          python: `# Brute Force - Standard Comparison Sort O(N log N)
def sortColorsBrute(nums: list[int]) -> None:
    nums.sort()`,
          javascript: `// Brute Force - Standard Comparison Sort O(N log N)
function sortColorsBrute(nums) {
  nums.sort((a, b) => a - b);
}`
        }
      },
      better: {
        name: 'Two-Pass Counting Sort',
        tier: 'better',
        badge: '🥈 Better (2-Pass Count)',
        intuition: [
          'First pass: count the frequency of 0s, 1s, and 2s by iterating through the array once.',
          'Second pass: overwrite the array with the counted number of 0s, followed by 1s, then 2s.',
          'Brings the time complexity down from O(N log N) to linear O(N) using only three scalar counters.',
          'However, it still requires two full passes through the array instead of a single in-place pass.'
        ],
        pseudocode: [
          'FUNCTION sortColors_counting(nums):',
          '  c0 = 0, c1 = 0, c2 = 0',
          '  FOR EACH x IN nums:',
          '    IF x == 0: c0++',
          '    ELSE IF x == 1: c1++',
          '    ELSE: c2++',
          '  idx = 0',
          '  WHILE c0-- > 0: nums[idx++] = 0',
          '  WHILE c1-- > 0: nums[idx++] = 1',
          '  WHILE c2-- > 0: nums[idx++] = 2'
        ],
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(1)',
        complexityExplanation: 'Two linear passes (2N iterations) using three scalar integer counters.',
        code: {
          cpp: `// Better - Two-Pass Counting Sort O(N)
#include <vector>

void sortColorsCounting(std::vector<int>& nums) {
    int count0 = 0, count1 = 0, count2 = 0;
    for (int num : nums) {
        if (num == 0) count0++;
        else if (num == 1) count1++;
        else count2++;
    }
    int idx = 0;
    while (count0--) nums[idx++] = 0;
    while (count1--) nums[idx++] = 1;
    while (count2--) nums[idx++] = 2;
}`,
          java: `// Better - Two-Pass Counting Sort O(N)
public class Solution {
    public void sortColorsCounting(int[] nums) {
        int count0 = 0, count1 = 0, count2 = 0;
        for (int num : nums) {
            if (num == 0) count0++;
            else if (num == 1) count1++;
            else count2++;
        }
        int idx = 0;
        while (count0-- > 0) nums[idx++] = 0;
        while (count1-- > 0) nums[idx++] = 1;
        while (count2-- > 0) nums[idx++] = 2;
    }
}`,
          python: `# Better - Two-Pass Counting Sort O(N)
def sortColorsCounting(nums: list[int]) -> None:
    c0 = c1 = c2 = 0
    for num in nums:
        if num == 0: c0 += 1
        elif num == 1: c1 += 1
        else: c2 += 1
    idx = 0
    for _ in range(c0):
        nums[idx] = 0; idx += 1
    for _ in range(c1):
        nums[idx] = 1; idx += 1
    for _ in range(c2):
        nums[idx] = 2; idx += 1`,
          javascript: `// Better - Two-Pass Counting Sort O(N)
function sortColorsCounting(nums) {
  let c0 = 0, c1 = 0, c2 = 0;
  for (const num of nums) {
    if (num === 0) c0++;
    else if (num === 1) c1++;
    else c2++;
  }
  let idx = 0;
  while (c0-- > 0) nums[idx++] = 0;
  while (c1-- > 0) nums[idx++] = 1;
  while (c2-- > 0) nums[idx++] = 2;
}`
        }
      },
      optimal: {
        name: 'Dutch National Flag 3-Way Partitioning',
        tier: 'optimal',
        badge: '🥇 Optimal (Single Pass In-Place)',
        intuition: [
          'Maintain 3 pointers: `low` (boundary for 0s), `mid` (current element), and `high` (boundary for 2s).',
          'Invariant: [0 .. low-1] are 0s, [low .. mid-1] are 1s, [mid .. high] are unexamined, [high+1 .. n-1] are 2s.',
          'If `nums[mid] == 0`: swap with `nums[low]`, increment both `low++` and `mid++`.',
          'If `nums[mid] == 1`: just advance `mid++`.',
          'If `nums[mid] == 2`: swap with `nums[high]`, decrement `high--` (re-examine swapped element at mid).',
          'Completes in a strictly single pass O(N) with O(1) in-place memory.'
        ],
        pseudocode: [
          'FUNCTION sortColors_optimal(nums):',
          '  low = 0, mid = 0, high = nums.length - 1',
          '  WHILE mid <= high:',
          '    IF nums[mid] == 0:',
          '      SWAP(nums[low++], nums[mid++])',
          '    ELSE IF nums[mid] == 1:',
          '      mid++',
          '    ELSE:',
          '      SWAP(nums[mid], nums[high--])'
        ],
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(1)',
        complexityExplanation: 'Single linear pass with exactly one traversal: each step either increments mid or decrements high.',
        code: {
          cpp: `// Optimal - Dutch National Flag 3-Way Partition
#include <vector>
#include <algorithm>

void sortColors(std::vector<int>& nums) {
    int low = 0, mid = 0, high = nums.size() - 1;
    while (mid <= high) {
        if (nums[mid] == 0) {
            std::swap(nums[low++], nums[mid++]);
        } else if (nums[mid] == 1) {
            mid++;
        } else {
            std::swap(nums[mid], nums[high--]);
        }
    }
}`,
          java: `// Optimal - Dutch National Flag 3-Way Partition
public class Solution {
    public void sortColors(int[] nums) {
        int low = 0, mid = 0, high = nums.length - 1;
        while (mid <= high) {
            if (nums[mid] == 0) {
                int temp = nums[low];
                nums[low++] = nums[mid];
                nums[mid++] = temp;
            } else if (nums[mid] == 1) {
                mid++;
            } else {
                int temp = nums[mid];
                nums[mid] = nums[high];
                nums[high--] = temp;
            }
        }
    }
}`,
          python: `# Optimal - Dutch National Flag 3-Way Partition
def sortColors(nums: list[int]) -> None:
    low, mid, high = 0, 0, len(nums) - 1
    while mid <= high:
        if nums[mid] == 0:
            nums[low], nums[mid] = nums[mid], nums[low]
            low += 1
            mid += 1
        elif nums[mid] == 1:
            mid += 1
        else:
            nums[mid], nums[high] = nums[high], nums[mid]
            high -= 1`,
          javascript: `// Optimal - Dutch National Flag 3-Way Partition
function sortColors(nums) {
  let low = 0, mid = 0, high = nums.length - 1;
  while (mid <= high) {
    if (nums[mid] === 0) {
      [nums[low], nums[mid]] = [nums[mid], nums[low]];
      low++;
      mid++;
    } else if (nums[mid] === 1) {
      mid++;
    } else {
      [nums[mid], nums[high]] = [nums[high], nums[mid]];
      high--;
    }
  }
}`
        }
      }
    }
  },

  'arr-8': {
    questionId: 'arr-8',
    pattern: "Kadane's Dynamic Programming Algorithm",
    intuition: [
      'At each index `i`, we decide whether to add `nums[i]` to our existing running subarray sum, or start a fresh subarray right at `nums[i]`.',
      'If `currentSum + nums[i] < nums[i]` (which means `currentSum < 0`), carrying `currentSum` forward hurts future sums! We discard it and reset.',
      'Recurrence relation: `currentSum = max(nums[i], currentSum + nums[i])`.',
      'Track the running maximum with `maxSum = max(maxSum, currentSum)`.'
    ],
    pseudocode: [
      'FUNCTION maxSubArray(nums):',
      '  maxSum = nums[0]',
      '  currentSum = nums[0]',
      '  FOR i from 1 to nums.length - 1:',
      '    currentSum = MAX(nums[i], currentSum + nums[i])',
      '    maxSum = MAX(maxSum, currentSum)',
      '  RETURN maxSum'
    ],
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(1)',
    complexityExplanation: 'Single linear pass through the array with two scalar trackers.',
    edgeCases: [
      'All negative numbers (e.g. [-3, -1, -5] -> returns -1, which is the least negative)',
      'Single element array',
      'All positive numbers'
    ],
    code: {
      cpp: `// C++ Kadane's Algorithm
#include <vector>
#include <algorithm>

int maxSubArray(std::vector<int>& nums) {
    int currentSum = nums[0];
    int maxSum = nums[0];
    for (size_t i = 1; i < nums.size(); ++i) {
        currentSum = std::max(nums[i], currentSum + nums[i]);
        maxSum = std::max(maxSum, currentSum);
    }
    return maxSum;
}`,
      java: `// Java Kadane's Algorithm
public class Solution {
    public int maxSubArray(int[] nums) {
        int currentSum = nums[0];
        int maxSum = nums[0];
        for (int i = 1; i < nums.length; i++) {
            currentSum = Math.max(nums[i], currentSum + nums[i]);
            maxSum = Math.max(maxSum, currentSum);
        }
        return maxSum;
    }
}`,
      python: `# Python Kadane's Algorithm
def maxSubArray(nums: list[int]) -> int:
    current_sum = max_sum = nums[0]
    for num in nums[1:]:
        current_sum = max(num, current_sum + num)
        max_sum = max(max_sum, current_sum)
    return max_sum`,
      javascript: `// JavaScript Kadane's Algorithm
function maxSubArray(nums) {
  let currentSum = nums[0];
  let maxSum = nums[0];
  for (let i = 1; i < nums.length; i++) {
    currentSum = Math.max(nums[i], currentSum + nums[i]);
    maxSum = Math.max(maxSum, currentSum);
  }
  return maxSum;
}`
    },
    interviewProTips: [
      'If the interviewer asks: "Can you return the start and end indices of the subarray?", maintain `start = 0, end = 0, tempStart = 0` and update `start = tempStart, end = i` whenever `maxSum` updates.'
    ]
  },

  'arr-18': {
    questionId: 'arr-18',
    pattern: 'Two Pointers (Inward Water Height Boundaries)',
    intuition: [
      'Water trapped above index `i` is determined by `min(maxLeft, maxRight) - height[i]`.',
      'Instead of precalculating prefix/suffix arrays in O(N) space, two pointers solve it in O(1) space!',
      'Maintain `left = 0`, `right = n - 1`, `leftMax = 0`, and `rightMax = 0`.',
      'Whichever side is smaller dictates the water level: if `height[left] <= height[right]`, we know for certain that `leftMax` is the bottleneck, so water trapped at `left` is `leftMax - height[left]`.',
      'Move the pointer on the smaller side inward.'
    ],
    pseudocode: [
      'FUNCTION trap(height):',
      '  left = 0, right = height.length - 1',
      '  leftMax = 0, rightMax = 0',
      '  totalWater = 0',
      '  WHILE left < right:',
      '    IF height[left] <= height[right]:',
      '      IF height[left] >= leftMax: leftMax = height[left]',
      '      ELSE: totalWater += leftMax - height[left]',
      '      left++',
      '    ELSE:',
      '      IF height[right] >= rightMax: rightMax = height[right]',
      '      ELSE: totalWater += rightMax - height[right]',
      '      right--',
      '  RETURN totalWater'
    ],
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(1)',
    complexityExplanation: 'Each bar is inspected once by either left or right pointer, using zero extra memory.',
    edgeCases: [
      'Heights strictly increasing or decreasing (traps 0 water)',
      'Array length < 3 (cannot trap water)',
      'Uniform plateau heights'
    ],
    code: {
      cpp: `// C++ Trapping Rain Water (Two Pointers)
#include <vector>
#include <algorithm>

int trap(std::vector<int>& height) {
    int left = 0, right = height.size() - 1;
    int leftMax = 0, rightMax = 0;
    int totalWater = 0;
    while (left < right) {
        if (height[left] <= height[right]) {
            if (height[left] >= leftMax) leftMax = height[left];
            else totalWater += leftMax - height[left];
            left++;
        } else {
            if (height[right] >= rightMax) rightMax = height[right];
            else totalWater += rightMax - height[right];
            right--;
        }
    }
    return totalWater;
}`,
      java: `// Java Trapping Rain Water (Two Pointers)
public class Solution {
    public int trap(int[] height) {
        int left = 0, right = height.length - 1;
        int leftMax = 0, rightMax = 0;
        int totalWater = 0;
        while (left < right) {
            if (height[left] <= height[right]) {
                if (height[left] >= leftMax) leftMax = height[left];
                else totalWater += leftMax - height[left];
                left++;
            } else {
                if (height[right] >= rightMax) rightMax = height[right];
                else totalWater += rightMax - height[right];
                right--;
            }
        }
        return totalWater;
    }
}`,
      python: `# Python Trapping Rain Water (Two Pointers)
def trap(height: list[int]) -> int:
    left, right = 0, len(height) - 1
    left_max, right_max = 0, 0
    total_water = 0
    while left < right:
        if height[left] <= height[right]:
            if height[left] >= left_max:
                left_max = height[left]
            else:
                total_water += left_max - height[left]
            left += 1
        else:
            if height[right] >= right_max:
                right_max = height[right]
            else:
                total_water += right_max - height[right]
            right -= 1
    return total_water`,
      javascript: `// JavaScript Trapping Rain Water (Two Pointers)
function trap(height) {
  let left = 0, right = height.length - 1;
  let leftMax = 0, rightMax = 0;
  let totalWater = 0;
  while (left < right) {
    if (height[left] <= height[right]) {
      if (height[left] >= leftMax) leftMax = height[left];
      else totalWater += leftMax - height[left];
      left++;
    } else {
      if (height[right] >= rightMax) rightMax = height[right];
      else totalWater += rightMax - height[right];
      right--;
    }
  }
  return totalWater;
}`
    },
    interviewProTips: [
      'This is a top Google and Amazon favorite problem. Mention the DP approach first (prefix/suffix arrays O(N) space), then say: "We can optimize space from O(N) to O(1) using two pointers since we only care about min(leftMax, rightMax)" to demonstrate problem-solving maturity.'
    ]
  }
};
