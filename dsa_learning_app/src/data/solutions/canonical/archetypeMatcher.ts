import { ProblemSolution, Question } from '../../../types/dsa';
import { CANONICAL_ARCHETYPES } from './index';

const ID_MAP: Record<string, string> = {
  // Strings
  'str-1': 'reverse_string',
  'str-2': 'valid_palindrome',
  'str-4': 'longest_palindromic_substring',
  'str-5': 'edit_distance',
  'str-6': 'group_anagrams',
  'str-8': 'longest_palindromic_substring',
  'str-14': 'edit_distance',
  'str-17': 'word_break',
  'str-23': 'count_occurrences_2d',
  'str-36': 'group_anagrams',
  'vault-valid-palindrome': 'valid_palindrome',
  'vault-group-anagrams': 'group_anagrams',
  'vault-longest-substring-without-repeat': 'longest_substring_without_repeating',
  'vault-longest-palindromic-substring': 'longest_palindromic_substring',

  // Linked List
  'll-1': 'reverse_linked_list',
  'll-3': 'detect_cycle_linked_list',
  'll-4': 'cycle_start_node',
  'll-5': 'intersection_two_lists',
  'll-6': 'merge_two_sorted_lists',
  'll-12': 'intersection_two_lists',
  'vault-reverse-linked-list': 'reverse_linked_list',
  'vault-linked-list-cycle': 'detect_cycle_linked_list',
  'vault-linked-list-cycle-ii': 'cycle_start_node',
  'vault-intersection-two-linked-lists': 'intersection_two_lists',
  'vault-merge-two-sorted-lists': 'merge_two_sorted_lists',

  // Trees & BST
  'tree-1': 'level_order_traversal',
  'tree-2': 'max_depth_binary_tree',
  'tree-4': 'invert_binary_tree',
  'tree-5': 'lowest_common_ancestor',
  'bst-1': 'validate_bst',
  'bst-5': 'validate_bst',
  'bst-7': 'lowest_common_ancestor',
  'vault-level-order-traversal': 'level_order_traversal',
  'vault-max-depth-binary-tree': 'max_depth_binary_tree',
  'vault-invert-binary-tree': 'invert_binary_tree',
  'vault-lowest-common-ancestor-binary-tree': 'lowest_common_ancestor',
  'vault-validate-bst': 'validate_bst',

  // Stacks & Queues
  'sq-1': 'valid_parentheses',
  'sq-2': 'next_greater_element',
  'sq-3': 'largest_rectangle_histogram',
  'sq-6': 'valid_parentheses',
  'sq-9': 'next_greater_element',
  'vault-valid-parentheses': 'valid_parentheses',
  'vault-next-greater-element': 'next_greater_element',
  'vault-largest-rectangle-histogram': 'largest_rectangle_histogram',
  'vault-trapping-rain-water': 'trapping_rain_water',

  // Graphs
  'grp-5': 'number_of_islands',
  'grp-6': 'course_schedule',
  'grp-4': 'dijkstra',
  'grp-12': 'dijkstra',
  'grp-15': 'course_schedule',
  'vault-number-of-islands': 'number_of_islands',
  'vault-course-schedule': 'course_schedule',
  'vault-course-schedule-ii': 'course_schedule',

  // DP
  'dp-1': 'knapsack_01',
  'dp-2': 'coin_change',
  'dp-5': 'house_robber',
  'vault-coin-change': 'coin_change',
  'vault-house-robber': 'house_robber',

  // Heaps & Greedy
  'heap-1': 'top_k_frequent',
  'grd-1': 'activity_selection',
  'grd-2': 'gas_station',
  'vault-top-k-frequent-elements': 'top_k_frequent',
  'vault-gas-station': 'gas_station',
  'vault-non-overlapping-intervals': 'activity_selection',

  // Backtracking & Bit
  'bck-1': 'n_queens',
  'bit-1': 'count_set_bits',
  'bit-3': 'single_number',
  'vault-n-queens': 'n_queens',
  'vault-single-number': 'single_number',

  // Arrays
  'arr-1': 'reverse_string',
  'arr-4': 'dutch_national_flag',
  'arr-8': 'maximum_subarray',
  'vault-two-sum': 'two_sum',
  'vault-merge-intervals': 'merge_intervals',
  'vault-maximum-subarray': 'maximum_subarray',
  'vault-sort-colors': 'dutch_national_flag',
};

export function findArchetypeSolution(q: Question): ProblemSolution | null {
  // 1. Direct ID match
  if (ID_MAP[q.id] && CANONICAL_ARCHETYPES[ID_MAP[q.id]]) {
    const arch = CANONICAL_ARCHETYPES[ID_MAP[q.id]];
    return { ...arch, questionId: q.id };
  }

  const text = `${q.title} ${q.description || ''}`.toLowerCase();

  // 2. Exact Semantic Keyword Matches
  let matchedKey: string | null = null;

  if (text.includes('word break') && !text.includes('ii') && !text.includes('sentences')) {
    matchedKey = 'word_break';
  } else if (text.includes('2d character array') || text.includes('occurrences of a given string in a 2d')) {
    matchedKey = 'count_occurrences_2d';
  } else if (text.includes('edit distance')) {
    matchedKey = 'edit_distance';
  } else if (text.includes('longest substring without repeating')) {
    matchedKey = 'longest_substring_without_repeating';
  } else if (text.includes('longest palindromic substring') || text.includes('longest palindrome in a string')) {
    matchedKey = 'longest_palindromic_substring';
  } else if (text.includes('group anagrams') || text.includes('anagrams together')) {
    matchedKey = 'group_anagrams';
  } else if (text.includes('palindrome') && (text.includes('check') || text.includes('valid') || text.includes('is palindrome'))) {
    matchedKey = 'valid_palindrome';
  } else if (text.includes('reverse') && text.includes('linked list')) {
    matchedKey = 'reverse_linked_list';
  } else if (text.includes('detect loop') || (text.includes('detect cycle') && text.includes('linked list'))) {
    matchedKey = 'detect_cycle_linked_list';
  } else if (text.includes('starting point of the loop') || text.includes('cycle start')) {
    matchedKey = 'cycle_start_node';
  } else if (text.includes('intersection point') || text.includes('intersection of two linked list')) {
    matchedKey = 'intersection_two_lists';
  } else if (text.includes('merge two sorted linked list') || text.includes('merge two sorted list')) {
    matchedKey = 'merge_two_sorted_lists';
  } else if (text.includes('level order traversal')) {
    matchedKey = 'level_order_traversal';
  } else if (text.includes('height / maximum depth') || text.includes('maximum depth of binary tree') || text.includes('max depth')) {
    matchedKey = 'max_depth_binary_tree';
  } else if ((text.includes('invert') || text.includes('mirror')) && text.includes('binary tree')) {
    matchedKey = 'invert_binary_tree';
  } else if (text.includes('lowest common ancestor') || text.includes('lca')) {
    matchedKey = 'lowest_common_ancestor';
  } else if (text.includes('validate binary search tree') || text.includes('validate bst') || text.includes('check if a tree is a bst')) {
    matchedKey = 'validate_bst';
  } else if (text.includes('parenthesis checker') || text.includes('valid parentheses') || text.includes('balanced parenthesis')) {
    matchedKey = 'valid_parentheses';
  } else if (text.includes('next greater element')) {
    matchedKey = 'next_greater_element';
  } else if (text.includes('largest rectangle in histogram')) {
    matchedKey = 'largest_rectangle_histogram';
  } else if (text.includes('trapping rain water') || text.includes('trap rain water')) {
    matchedKey = 'trapping_rain_water';
  } else if (text.includes('number of islands')) {
    matchedKey = 'number_of_islands';
  } else if (text.includes('course schedule') || text.includes('topological sort')) {
    matchedKey = 'course_schedule';
  } else if (text.includes('dijkstra')) {
    matchedKey = 'dijkstra';
  } else if (text.includes('0/1 knapsack') || text.includes('knapsack problem')) {
    matchedKey = 'knapsack_01';
  } else if (text.includes('coin change')) {
    matchedKey = 'coin_change';
  } else if (text.includes('house robber')) {
    matchedKey = 'house_robber';
  } else if (text.includes('top k frequent')) {
    matchedKey = 'top_k_frequent';
  } else if (text.includes('activity selection') || text.includes('non-overlapping intervals')) {
    matchedKey = 'activity_selection';
  } else if (text.includes('gas station') || text.includes('circular tour')) {
    matchedKey = 'gas_station';
  } else if (text.includes('n-queens') || text.includes('n queens')) {
    matchedKey = 'n_queens';
  } else if (text.includes('count set bits') || text.includes('brian kernighan')) {
    matchedKey = 'count_set_bits';
  } else if (text.includes('single number')) {
    matchedKey = 'single_number';
  } else if (text.includes('two sum') || text.includes('pair with given sum')) {
    matchedKey = 'two_sum';
  } else if (text.includes('kadane') || text.includes('largest contiguous subarray sum') || text.includes('maximum subarray')) {
    matchedKey = 'maximum_subarray';
  } else if (text.includes('dutch national flag') || text.includes('sort an array of 0s, 1s') || text.includes('sort colors')) {
    matchedKey = 'dutch_national_flag';
  } else if (text.includes('merge intervals') || text.includes('merge overlapping intervals')) {
    matchedKey = 'merge_intervals';
  }

  if (matchedKey && CANONICAL_ARCHETYPES[matchedKey]) {
    const arch = CANONICAL_ARCHETYPES[matchedKey];
    return { ...arch, questionId: q.id };
  }

  return null;
}
