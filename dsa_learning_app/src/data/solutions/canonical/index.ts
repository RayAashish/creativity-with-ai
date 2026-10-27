import { ProblemSolution } from '../../../types/dsa';
import { STRINGS_ARCHETYPES } from './stringsArchetypes';
import { LINKED_LIST_ARCHETYPES } from './linkedListArchetypes';
import { TREES_BST_ARCHETYPES } from './treesBstArchetypes';
import { STACKS_QUEUES_ARCHETYPES } from './stacksQueuesArchetypes';
import { GRAPHS_ARCHETYPES } from './graphsArchetypes';
import { DP_ARCHETYPES } from './dpArchetypes';
import { HEAPS_GREEDY_ARCHETYPES } from './heapsGreedyArchetypes';
import { BACKTRACKING_BIT_ARCHETYPES } from './backtrackingBitArchetypes';
import { ARRAYS_ARCHETYPES } from './arraysArchetypes';

export const CANONICAL_ARCHETYPES: Record<string, ProblemSolution> = {
  ...STRINGS_ARCHETYPES,
  ...LINKED_LIST_ARCHETYPES,
  ...TREES_BST_ARCHETYPES,
  ...STACKS_QUEUES_ARCHETYPES,
  ...GRAPHS_ARCHETYPES,
  ...DP_ARCHETYPES,
  ...HEAPS_GREEDY_ARCHETYPES,
  ...BACKTRACKING_BIT_ARCHETYPES,
  ...ARRAYS_ARCHETYPES,
};
