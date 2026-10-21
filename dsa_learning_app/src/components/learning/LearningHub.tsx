import React, { useState } from 'react';
import { 
  BookOpen, 
  Code2, 
  Lightbulb, 
  CheckCircle, 
  Clock, 
  Gamepad2, 
  Sparkles, 
  ChevronRight,
  Eye,
  Layers
} from 'lucide-react';
import { LEARNING_MODULES, LearningModule } from '../../data/learningTopics';
import { IdeCodeBlock } from '../code/IdeCodeBlock';
import { DiagramContainer } from '../visuals/DiagramContainer';
import { ArrayDiagram } from '../visuals/ArrayDiagram';
import { LinkedListDiagram } from '../visuals/LinkedListDiagram';
import { TreeDiagram } from '../visuals/TreeDiagram';
import { GraphDiagram } from '../visuals/GraphDiagram';
import { DPTableDiagram } from '../visuals/DPTableDiagram';
import { VisualizerDemoPage } from '../visuals/VisualizerDemoPage';

interface LearningHubProps {
  onNavigateToGames: (gameId?: string) => void;
  onNavigateToSheet: (topicId?: string) => void;
}

export const LearningHub: React.FC<LearningHubProps> = ({
  onNavigateToGames,
  onNavigateToSheet,
}) => {
  const [viewMode, setViewMode] = useState<'curriculum' | 'diagram_demo'>('curriculum');
  const [selectedModuleId, setSelectedModuleId] = useState<string>('arrays');

  const currentModule: LearningModule = LEARNING_MODULES[selectedModuleId] || LEARNING_MODULES['arrays'];

  // Helper to render inline visual diagram for active module
  const renderModuleVisual = () => {
    switch (currentModule.id) {
      case 'arrays':
        return (
          <DiagramContainer
            title="Two Pointers (Opposite Direction) Visual Mechanism"
            description="Left and Right pointers converge inward from opposite boundaries to find target pair in O(N) time."
            gameId={currentModule.recommendedGameId}
            onNavigateToGame={onNavigateToGames}
          >
            <ArrayDiagram
              array={[2, 7, 11, 15]}
              pointers={[
                { label: 'Left', index: 0, color: 'orange' },
                { label: 'Right', index: 1, color: 'green' },
              ]}
              highlights={[
                { index: 0, color: 'orange', label: 'L' },
                { index: 1, color: 'green', label: 'Match' },
              ]}
            />
          </DiagramContainer>
        );

      case 'linked-list':
        return (
          <DiagramContainer
            title="Floyd's Fast & Slow Pointer Cycle Detection"
            description="Slow pointer moves 1 step; Fast moves 2 steps. The collision node confirms circular loop presence."
          >
            <LinkedListDiagram
              nodes={[
                { id: 1, val: 3, pointers: ['head'] },
                { id: 2, val: 2, pointers: ['slow'], highlight: 'blue' },
                { id: 3, val: 0 },
                { id: 4, val: -4, pointers: ['fast'], highlight: 'orange' },
              ]}
              cycleToIndex={1}
            />
          </DiagramContainer>
        );

      case 'stacks-queues':
        return (
          <DiagramContainer
            title="Monotonic Decreasing Stack for Next Greater Element"
            description="Stack preserves indices in descending value order. Pops elements when a greater value is encountered."
            gameId={currentModule.recommendedGameId}
            onNavigateToGame={onNavigateToGames}
          >
            <ArrayDiagram
              array={[73, 74, 75, 71, 69, 72, 76, 73]}
              pointers={[
                { label: 'curr (72)', index: 5, color: 'blue' },
                { label: 'pop (69)', index: 4, color: 'orange' },
              ]}
              highlights={[
                { index: 5, color: 'blue' },
                { index: 4, color: 'orange' },
              ]}
            />
          </DiagramContainer>
        );

      case 'binary-search':
        return (
          <DiagramContainer
            title="Binary Search Logarithmic Range Halving"
            description="Inspect mid element. If target is larger, discard entire left half; if smaller, discard right half."
            gameId={currentModule.recommendedGameId}
            onNavigateToGame={onNavigateToGames}
          >
            <ArrayDiagram
              array={[1, 3, 5, 7, 9, 11, 13, 15]}
              pointers={[
                { label: 'low', index: 0, color: 'orange' },
                { label: 'mid (7)', index: 3, color: 'blue' },
                { label: 'high', index: 7, color: 'orange' },
              ]}
              highlights={[{ index: 3, color: 'blue' }]}
            />
          </DiagramContainer>
        );

      case 'trees-bst':
        return (
          <DiagramContainer
            title="Binary Tree Pre-order DFS Traversal Sequence"
            description="Visit order: Root (1) -> Left Subtree (2 -> 4 -> 5) -> Right Subtree (3)."
          >
            <TreeDiagram
              nodes={[
                { id: '1', val: 1, x: 230, y: 40, leftId: '2', rightId: '3', highlight: 'green', orderBadge: 1 },
                { id: '2', val: 2, x: 140, y: 110, leftId: '4', rightId: '5', highlight: 'blue', orderBadge: 2 },
                { id: '3', val: 3, x: 320, y: 110 },
                { id: '4', val: 4, x: 90, y: 180 },
                { id: '5', val: 5, x: 190, y: 180 },
              ]}
              traversalSequence={[1, 2, 4, 5, 3]}
              traversalType="Pre-order"
            />
          </DiagramContainer>
        );

      case 'graphs':
        return (
          <DiagramContainer
            title="Kahn's Topological Sort In-Degree Graph & Table"
            description="Directed dependencies: Process nodes with in-degree 0, then decrement connected vertex in-degrees."
            gameId={currentModule.recommendedGameId}
            onNavigateToGame={onNavigateToGames}
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
        );

      case 'dp':
        return (
          <DiagramContainer
            title="0/1 Knapsack 2D Tabulation Grid & Dependency Transitions"
            description="Cell dp[1][2] is derived from cell directly above dp[0][2] or dp[0][0] + value."
            gameId={currentModule.recommendedGameId}
            onNavigateToGame={onNavigateToGames}
          >
            <DPTableDiagram
              rowHeaders={['Item 0 (w=0, v=0)', 'Item 1 (w=2, v=6)', 'Item 2 (w=3, v=10)']}
              colHeaders={['W=0', 'W=1', 'W=2', 'W=3', 'W=4', 'W=5']}
              cells={[
                { r: 0, c: 0, val: 0, highlight: 'dependent' },
                { r: 0, c: 2, val: 0, highlight: 'dependent' },
                { r: 1, c: 2, val: 6, highlight: 'current' },
              ]}
              formula="dp[i][w] = max(dp[i-1][w], dp[i-1][w - wt[i]] + val[i])"
              dependencies={[{ fromRow: 0, fromCol: 0, toRow: 1, toCol: 2 }]}
            />
          </DiagramContainer>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Academy Top Header */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950/30 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-500/10 text-teal-400 border border-teal-500/30 rounded-full text-xs font-semibold mb-3">
            <BookOpen className="w-3.5 h-3.5" /> Concept Academy & Interactive Visualizer
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Detailed DSA Patterns, Inline SVG Visuals & IDE-Style Code
          </h2>
          <p className="text-slate-300 text-sm sm:text-base mt-2 leading-relaxed">
            Move past rote memorization. Master the signature patterns asked in Google, Amazon, and Microsoft interviews with step-by-step inline SVG visualizers and complete IDE solutions in Java, Python, C++, and JavaScript.
          </p>
        </div>

        {/* View Mode Switcher: Curriculum vs Diagram Demo Playground */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('curriculum')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                viewMode === 'curriculum'
                  ? 'bg-gradient-to-r from-teal-500/20 to-cyan-500/20 text-teal-300 border border-teal-500/40 shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Full Concept Curriculum</span>
            </button>

            <button
              onClick={() => setViewMode('diagram_demo')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                viewMode === 'diagram_demo'
                  ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>🎨 Interactive Visualizer & IDE Demo Playground</span>
            </button>
          </div>
        </div>
      </div>

      {/* View 1: Interactive Diagram & IDE Showcase Demo Playground */}
      {viewMode === 'diagram_demo' ? (
        <VisualizerDemoPage />
      ) : (
        /* View 2: Full Curriculum */
        <>
          {/* Module Selector Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {Object.values(LEARNING_MODULES).map((mod) => {
              const isSelected = selectedModuleId === mod.id;
              return (
                <button
                  key={mod.id}
                  onClick={() => setSelectedModuleId(mod.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                    isSelected
                      ? 'bg-teal-500/20 text-teal-300 border-teal-500/50 shadow-md scale-105'
                      : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {mod.title.split(' ')[0]} {mod.title.split(' ')[1] || ''}
                </button>
              );
            })}
          </div>

          {/* Main Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Concept Overview Card */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
                <div className="flex items-center justify-between gap-4 mb-3 flex-wrap">
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white">{currentModule.title}</h3>
                  {currentModule.recommendedGameId && (
                    <button
                      onClick={() => onNavigateToGames(currentModule.recommendedGameId)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 rounded-xl text-xs font-bold transition transform active:scale-95"
                    >
                      <Gamepad2 className="w-3.5 h-3.5" />
                      <span>Play Pattern Game</span>
                    </button>
                  )}
                </div>

                <p className="text-xs sm:text-sm font-mono text-teal-400 mb-4">{currentModule.tagline}</p>

                <p className="text-slate-300 text-sm leading-relaxed mb-6">
                  {currentModule.overview}
                </p>

                {/* Mental Model & Analogy Box */}
                <div className="p-4 bg-teal-500/10 rounded-xl border border-teal-500/20 flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-teal-300 block mb-1">
                      Mental Model & Real-World Analogy
                    </span>
                    <span className="text-xs sm:text-sm text-slate-200 leading-relaxed">{currentModule.analogy}</span>
                  </div>
                </div>

                {/* Fundamental Pillars */}
                <div className="mt-6">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                    Fundamental Pillars
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {currentModule.coreConcepts.map((concept, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                        <CheckCircle className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
                        <span>{concept}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Inline Visual Diagram for Current Module */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
                  <Eye className="w-4 h-4" />
                  <span>Interactive Visual Diagram</span>
                </div>
                {renderModuleVisual()}
              </div>

              {/* Signature Algorithmic Patterns with IDE-Style Code */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-cyan-400" />
                  <span>Signature Patterns & IDE Solutions ({currentModule.patterns.length})</span>
                </h3>

                {currentModule.patterns.map((pat, idx) => {
                  return (
                    <div key={idx} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                      {/* Pattern Title & Badge */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h4 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-mono font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span>{pat.name}</span>
                        </h4>

                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-mono font-semibold">
                          {pat.badge}
                        </span>
                      </div>

                      {/* When to use */}
                      <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-300">
                        <strong className="text-cyan-400 font-semibold">Interview Signal / When to use: </strong>
                        <span>{pat.whenToUse}</span>
                      </div>

                      {/* Explanation */}
                      <p className="text-sm text-slate-200 leading-relaxed">
                        {pat.explanation}
                      </p>

                      {/* Key Takeaways */}
                      {pat.keyTakeaways && pat.keyTakeaways.length > 0 && (
                        <div className="space-y-1.5 pl-2 border-l-2 border-teal-500/40">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-teal-400 block mb-1">
                            Whiteboard Key Anchors:
                          </span>
                          {pat.keyTakeaways.map((point, kIdx) => (
                            <div key={kIdx} className="text-xs text-slate-300 flex items-start gap-1.5">
                              <span className="text-teal-400">•</span>
                              <span>{point}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Real IDE-Style Code Block Component */}
                      <div className="pt-2">
                        <IdeCodeBlock
                          title={`${pat.id}`}
                          codeMap={pat.solutions}
                          defaultLanguage="java"
                          highlightLines={[8, 11]}
                          annotations={
                            pat.keyTakeaways && pat.keyTakeaways.length > 0
                              ? [
                                  { line: 8, text: pat.keyTakeaways[0] },
                                  ...(pat.keyTakeaways.length > 1
                                    ? [{ line: 11, text: pat.keyTakeaways[1] }]
                                    : []),
                                ]
                              : undefined
                          }
                        />
                      </div>

                      {/* Practice Link Button */}
                      {pat.practiceTitle && (
                        <div className="pt-2 flex justify-end">
                          <button
                            onClick={() => onNavigateToSheet(currentModule.id)}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-cyan-600/15 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-bold transition transform active:scale-95"
                          >
                            <span>Practice {pat.practiceTitle} in 450 Sheet</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sidebar Details */}
            <div className="space-y-6">
              {/* Complexity Cheat Sheet */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
                <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>Complexity Cheatsheet</span>
                </h4>
                <div className="divide-y divide-slate-800/80 text-xs font-mono">
                  <div className="grid grid-cols-3 py-2 text-slate-500 font-semibold uppercase text-[11px]">
                    <span>Operation</span>
                    <span>Average</span>
                    <span>Worst</span>
                  </div>
                  {currentModule.cheatSheet.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-3 py-2.5 text-slate-300 text-[11px]">
                      <span className="text-slate-400">{item.operation}</span>
                      <span className="text-emerald-400">{item.average}</span>
                      <span className="text-amber-400">{item.worst}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interview Pitfalls & FAANG Tips */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
                <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>Interview Pitfalls & FAANG Tips</span>
                </h4>
                <div className="space-y-2.5 text-xs text-slate-300">
                  {currentModule.interviewTips.map((tip, idx) => (
                    <div key={idx} className="flex items-start gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
                      <span className="text-purple-400 font-bold">•</span>
                      <span className="leading-relaxed">{tip}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Practice in 450 Sheet CTA */}
              <div className="bg-gradient-to-br from-indigo-950/50 to-slate-900 border border-indigo-500/30 rounded-2xl p-5 shadow-xl text-center">
                <h4 className="text-sm font-bold text-white mb-1.5">Ready to Test Your Skills?</h4>
                <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                  Solve the curated 450 Sheet problems for this topic on LeetCode and GeeksforGeeks!
                </p>
                <button
                  onClick={() => onNavigateToSheet(currentModule.id)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-500/25 transition transform active:scale-95"
                >
                  <span>Practice {currentModule.title.split(' ')[0]} in 450 Sheet</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
