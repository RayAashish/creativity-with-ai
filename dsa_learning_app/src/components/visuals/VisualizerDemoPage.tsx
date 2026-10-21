import React, { useState } from 'react';
import { 
  Sparkles, 
  Layers, 
  Code2, 
  GitCommit, 
  Network, 
  Binary, 
  Table2,
  Cpu,
  ArrowRight
} from 'lucide-react';
import { DiagramContainer } from './DiagramContainer';
import { ArrayDiagram } from './ArrayDiagram';
import { LinkedListDiagram } from './LinkedListDiagram';
import { TreeDiagram } from './TreeDiagram';
import { GraphDiagram } from './GraphDiagram';
import { DPTableDiagram } from './DPTableDiagram';
import { IdeCodeBlock } from '../code/IdeCodeBlock';

export const VisualizerDemoPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'arrays' | 'linkedlist' | 'trees' | 'graphs' | 'dp' | 'ide'>('arrays');

  // 1. Array Two Pointers Stepper State
  const [arrayStep, setArrayStep] = useState<number>(0);
  const arrayStepsData = [
    {
      array: [2, 7, 11, 15],
      pointers: [
        { label: 'Left', index: 0, color: 'orange' as const },
        { label: 'Right', index: 3, color: 'blue' as const },
      ],
      highlights: [
        { index: 0, color: 'orange' as const },
        { index: 3, color: 'blue' as const },
      ],
      caption: 'Step 1: Left = 0 (val 2), Right = 3 (val 15). Sum = 2 + 15 = 17 > 9 (target). Decrement Right.',
    },
    {
      array: [2, 7, 11, 15],
      pointers: [
        { label: 'Left', index: 0, color: 'orange' as const },
        { label: 'Right', index: 2, color: 'blue' as const },
      ],
      highlights: [
        { index: 0, color: 'orange' as const },
        { index: 2, color: 'blue' as const },
      ],
      caption: 'Step 2: Left = 0 (val 2), Right = 2 (val 11). Sum = 2 + 11 = 13 > 9. Decrement Right again.',
    },
    {
      array: [2, 7, 11, 15],
      pointers: [
        { label: 'Left', index: 0, color: 'green' as const },
        { label: 'Right', index: 1, color: 'green' as const },
      ],
      highlights: [
        { index: 0, color: 'green' as const },
        { index: 1, color: 'green' as const },
      ],
      caption: 'Step 3: Left = 0 (val 2), Right = 1 (val 7). Sum = 2 + 7 = 9 (TARGET MATCH!). Solution found in O(N).',
    },
  ];

  // 2. Linked List Cycle Stepper State
  const [llStep, setLlStep] = useState<number>(0);
  const llStepsData = [
    {
      nodes: [
        { id: 1, val: 3, pointers: ['slow', 'fast'], highlight: 'orange' as const },
        { id: 2, val: 2 },
        { id: 3, val: 0 },
        { id: 4, val: -4 },
      ],
      caption: 'Step 1: Slow and Fast both initialize at head (node 3).',
    },
    {
      nodes: [
        { id: 1, val: 3 },
        { id: 2, val: 2, pointers: ['slow'], highlight: 'blue' as const },
        { id: 3, val: 0, pointers: ['fast'], highlight: 'orange' as const },
        { id: 4, val: -4 },
      ],
      caption: 'Step 2: Slow advances 1 step (to 2); Fast advances 2 steps (to 0).',
    },
    {
      nodes: [
        { id: 1, val: 3 },
        { id: 2, val: 2, pointers: ['fast'], highlight: 'orange' as const },
        { id: 3, val: 0, pointers: ['slow'], highlight: 'blue' as const },
        { id: 4, val: -4 },
      ],
      caption: 'Step 3: Slow advances 1 step (to 0); Fast jumps around cycle back to node 2.',
    },
    {
      nodes: [
        { id: 1, val: 3 },
        { id: 2, val: 2 },
        { id: 3, val: 0 },
        { id: 4, val: -4, pointers: ['slow', 'fast'], highlight: 'green' as const },
      ],
      caption: 'Step 4: Slow and Fast collide at node -4! Cycle existence confirmed mathematically.',
    },
  ];

  // 3. Tree Traversal Stepper State
  const [treeStep, setTreeStep] = useState<number>(0);
  const treeStepsData = [
    {
      nodes: [
        { id: '1', val: 1, x: 230, y: 40, leftId: '2', rightId: '3', highlight: 'blue' as const, orderBadge: 1 },
        { id: '2', val: 2, x: 140, y: 110, leftId: '4', rightId: '5' },
        { id: '3', val: 3, x: 320, y: 110 },
        { id: '4', val: 4, x: 90, y: 180 },
        { id: '5', val: 5, x: 190, y: 180 },
      ],
      sequence: [1],
      caption: 'Step 1: Visit Root node (1). Push to call stack, then traverse left subtree.',
    },
    {
      nodes: [
        { id: '1', val: 1, x: 230, y: 40, leftId: '2', rightId: '3', highlight: 'green' as const, orderBadge: 1 },
        { id: '2', val: 2, x: 140, y: 110, leftId: '4', rightId: '5', highlight: 'blue' as const, orderBadge: 2 },
        { id: '3', val: 3, x: 320, y: 110 },
        { id: '4', val: 4, x: 90, y: 180 },
        { id: '5', val: 5, x: 190, y: 180 },
      ],
      sequence: [1, 2],
      caption: 'Step 2: Visit left child (2). Push to stack and descend to left child (4).',
    },
    {
      nodes: [
        { id: '1', val: 1, x: 230, y: 40, leftId: '2', rightId: '3', highlight: 'green' as const, orderBadge: 1 },
        { id: '2', val: 2, x: 140, y: 110, leftId: '4', rightId: '5', highlight: 'green' as const, orderBadge: 2 },
        { id: '3', val: 3, x: 320, y: 110 },
        { id: '4', val: 4, x: 90, y: 180, highlight: 'blue' as const, orderBadge: 3 },
        { id: '5', val: 5, x: 190, y: 180 },
      ],
      sequence: [1, 2, 4],
      caption: 'Step 3: Visit leaf node (4). Both children null; backtrack to 2.',
    },
    {
      nodes: [
        { id: '1', val: 1, x: 230, y: 40, leftId: '2', rightId: '3', highlight: 'green' as const, orderBadge: 1 },
        { id: '2', val: 2, x: 140, y: 110, leftId: '4', rightId: '5', highlight: 'green' as const, orderBadge: 2 },
        { id: '3', val: 3, x: 320, y: 110, highlight: 'blue' as const, orderBadge: 5 },
        { id: '4', val: 4, x: 90, y: 180, highlight: 'green' as const, orderBadge: 3 },
        { id: '5', val: 5, x: 190, y: 180, highlight: 'green' as const, orderBadge: 4 },
      ],
      sequence: [1, 2, 4, 5, 3],
      caption: 'Step 4: Visit right sibling (5), then backtrack and visit node 3. Pre-order complete!',
    },
  ];

  // 4. DP Knapsack Stepper State
  const [dpStep, setDpStep] = useState<number>(0);
  const dpStepsData = [
    {
      cells: [
        { r: 0, c: 0, val: 0, highlight: 'done' as const },
        { r: 0, c: 1, val: 0, highlight: 'done' as const },
        { r: 0, c: 2, val: 0, highlight: 'done' as const },
        { r: 0, c: 3, val: 0, highlight: 'done' as const },
        { r: 1, c: 0, val: 0, highlight: 'done' as const },
        { r: 1, c: 1, val: '-', highlight: 'default' as const },
      ],
      dependencies: [],
      caption: 'Base Case: Weight capacity 0 has value 0. Zero items have value 0.',
    },
    {
      cells: [
        { r: 0, c: 0, val: 0, highlight: 'dependent' as const },
        { r: 0, c: 2, val: 0, highlight: 'dependent' as const },
        { r: 1, c: 2, val: 6, highlight: 'current' as const },
      ],
      dependencies: [{ fromRow: 0, fromCol: 0, toRow: 1, toCol: 2 }],
      caption: 'Item 1 (wt=2, val=6): dp[1][2] = max(dp[0][2], dp[0][2-2] + 6) = max(0, 6) = 6.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Demo Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-full text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Stage 1 Architecture Delivery
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Interactive Visual Diagrams & IDE-Style Code Engine
          </h2>
          <p className="text-slate-300 text-sm mt-2 leading-relaxed">
            Data-driven inline SVG diagram components (Arrays, Linked Lists, Trees, Graphs, DP Tables) coupled with stepper animations and real IDE code blocks featuring Java, Python, C++, and JavaScript.
          </p>
        </div>

        {/* Component Selector Tabs */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto">
          {[
            { id: 'arrays', label: '1. Array Diagram', icon: Layers },
            { id: 'linkedlist', label: '2. Linked List Diagram', icon: GitCommit },
            { id: 'trees', label: '3. Tree Diagram', icon: Network },
            { id: 'graphs', label: '4. Graph Diagram', icon: Binary },
            { id: 'dp', label: '5. DP Table Diagram', icon: Table2 },
            { id: 'ide', label: '6. IDE Code Block', icon: Code2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap border ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-md scale-105'
                    : 'bg-slate-950/80 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Showcase Showcase Panels */}
      {activeTab === 'arrays' && (
        <DiagramContainer
          title="Two Pointers (Opposite Direction) Step-Through"
          description="Searching for target pair sum = 9 in sorted array [2, 7, 11, 15]. Watch Left and Right pointers converge in linear time."
          totalSteps={arrayStepsData.length}
          currentStep={arrayStep}
          stepCaption={arrayStepsData[arrayStep].caption}
          onStepChange={setArrayStep}
          gameId="two-pointer"
        >
          <ArrayDiagram
            array={arrayStepsData[arrayStep].array}
            pointers={arrayStepsData[arrayStep].pointers}
            highlights={arrayStepsData[arrayStep].highlights}
          />
        </DiagramContainer>
      )}

      {activeTab === 'linkedlist' && (
        <DiagramContainer
          title="Floyd's Tortoise and Hare Cycle Finding"
          description="Fast pointer advances 2 nodes while Slow pointer advances 1 node. Collision proves loop presence without auxiliary hash set memory."
          totalSteps={llStepsData.length}
          currentStep={llStep}
          stepCaption={llStepsData[llStep].caption}
          onStepChange={setLlStep}
        >
          <LinkedListDiagram
            nodes={llStepsData[llStep].nodes}
            cycleToIndex={1} // Loop back to node 2
          />
        </DiagramContainer>
      )}

      {activeTab === 'trees' && (
        <DiagramContainer
          title="Binary Tree Pre-order DFS Traversal"
          description="Visit order: Root -> Left Subtree -> Right Subtree. Watch the visit order badges illuminate sequentially."
          totalSteps={treeStepsData.length}
          currentStep={treeStep}
          stepCaption={treeStepsData[treeStep].caption}
          onStepChange={setTreeStep}
        >
          <TreeDiagram
            nodes={treeStepsData[treeStep].nodes}
            traversalSequence={treeStepsData[treeStep].sequence}
            traversalType="Pre-order"
          />
        </DiagramContainer>
      )}

      {activeTab === 'graphs' && (
        <DiagramContainer
          title="Directed Acyclic Graph (DAG) & Topological In-Degrees"
          description="Kahn's Algorithm tracks in-degree count per vertex. Nodes with in-degree 0 are ready to process."
        >
          <GraphDiagram
            vertices={[
              { id: '0', label: '0', x: 70, y: 110, highlight: 'green' },
              { id: '1', label: '1', x: 190, y: 50, highlight: 'blue' },
              { id: '2', label: '2', x: 190, y: 170, highlight: 'gray' },
              { id: '3', label: '3', x: 330, y: 110, highlight: 'gray' },
            ]}
            edges={[
              { from: '0', to: '1', directed: true, highlight: true },
              { from: '0', to: '2', directed: true },
              { from: '1', to: '3', directed: true },
              { from: '2', to: '3', directed: true },
            ]}
            inDegreeTable={[
              { node: '0', inDegree: 0 },
              { node: '1', inDegree: 0 },
              { node: '2', inDegree: 1 },
              { node: '3', inDegree: 2 },
            ]}
          />
        </DiagramContainer>
      )}

      {activeTab === 'dp' && (
        <DiagramContainer
          title="0/1 Knapsack 2D Tabulation Grid with Dependency Arrows"
          description="Each cell dp[i][w] depends on cell directly above dp[i-1][w] or subproblem dp[i-1][w - weight]."
          totalSteps={dpStepsData.length}
          currentStep={dpStep}
          stepCaption={dpStepsData[dpStep].caption}
          onStepChange={setDpStep}
          gameId="coin-quest"
        >
          <DPTableDiagram
            rowHeaders={['Item 0 (w=0, v=0)', 'Item 1 (w=2, v=6)', 'Item 2 (w=3, v=10)']}
            colHeaders={['W=0', 'W=1', 'W=2', 'W=3', 'W=4', 'W=5']}
            cells={dpStepsData[dpStep].cells}
            formula="dp[i][w] = max(dp[i-1][w], dp[i-1][w - wt[i]] + val[i])"
            dependencies={dpStepsData[dpStep].dependencies}
          />
        </DiagramContainer>
      )}

      {activeTab === 'ide' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <strong className="text-cyan-400">Real Code Editor: </strong>
            Features Java default, Python second, C++, and JavaScript tabs, One Dark Pro syntax coloring, line numbers, line highlighting, and inline annotations.
          </div>

          <IdeCodeBlock
            title="TwoSumSorted.java"
            highlightLines={[8, 10, 13]}
            annotations={[
              { line: 8, text: '🎯 Target found: return 1-based indices' },
              { line: 10, text: '⚡ Sum too small: move Left pointer inward' },
              { line: 13, text: '🛡️ Sum too large: move Right pointer inward' },
            ]}
            codeMap={{
              java: `// Java: Two Pointers (Opposite Direction)
public class Solution {
    public int[] twoSumSorted(int[] numbers, int target) {
        int left = 0;
        int right = numbers.length - 1;
        while (left < right) {
            int sum = numbers[left] + numbers[right];
            if (sum == target) {
                return new int[]{left + 1, right + 1};
            } else if (sum < target) {
                left++;
            } else {
                right--;
            }
        }
        return new int[]{};
    }
}`,
              python: `# Python: Two Pointers (Opposite Direction)
def two_sum_sorted(numbers: list[int], target: int) -> list[int]:
    left, right = 0, len(numbers) - 1
    while left < right:
        curr_sum = numbers[left] + numbers[right]
        if curr_sum == target:
            return [left + 1, right + 1]
        elif curr_sum < target:
            left += 1
        else:
            right -= 1
    return []`,
              cpp: `// C++: Two Pointers (Opposite Direction)
#include <vector>

std::vector<int> twoSumSorted(const std::vector<int>& numbers, int target) {
    int left = 0, right = numbers.size() - 1;
    while (left < right) {
        int sum = numbers[left] + numbers[right];
        if (sum == target) return {left + 1, right + 1};
        else if (sum < target) left++;
        else right--;
    }
    return {};
}`,
              javascript: `// JavaScript: Two Pointers (Opposite Direction)
function twoSumSorted(numbers, target) {
  let left = 0, right = numbers.length - 1;
  while (left < right) {
    const sum = numbers[left] + numbers[right];
    if (sum === target) return [left + 1, right + 1];
    if (sum < target) left++;
    else right--;
  }
  return [];
}`,
            }}
          />
        </div>
      )}
    </div>
  );
};
