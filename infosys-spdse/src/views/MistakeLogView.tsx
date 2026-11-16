import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
  BookOpen,
  Calendar
} from 'lucide-react';
import { MistakeItem } from '../types';

export const MistakeLogView: React.FC = () => {
  const [mistakes, setMistakes] = useState<MistakeItem[]>(() => {
    try {
      const stored = localStorage.getItem('spdse_mistake_log');
      if (stored) return JSON.parse(stored);
    } catch {}
    // Seed initial high-frequency traps if empty
    return [
      {
        id: 'seed-01',
        problemTitle: 'Dual Track Conveyor Belt Switching',
        pattern: 'dp',
        mistakeReason: 'Allocated new 2D array inside loop causing O(N^2) memory and GC pauses; hit MLE on hidden subtask 2.',
        correctiveInsight: 'State j only depends on column j-1. Reduced 2xN table to two variables prev0, prev1 in O(1) space.',
        addedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
        nextReviewAt: new Date().toISOString(),
        intervalDays: 1,
        reviewedCount: 0
      },
      {
        id: 'seed-02',
        problemTitle: 'Subarray Sum Divisible by K',
        pattern: 'arrays_and_prefix_sums',
        mistakeReason: 'Negative prefix sums produced negative remainders in Python & Java, corrupting hash map frequencies.',
        correctiveInsight: 'Always normalize remainder: rem = ((prefix % K) + K) % K before querying or updating the frequency table.',
        addedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
        nextReviewAt: new Date().toISOString(),
        intervalDays: 3,
        reviewedCount: 1
      }
    ];
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPattern, setNewPattern] = useState('dp');
  const [newReason, setNewReason] = useState('');
  const [newInsight, setNewInsight] = useState('');

  // Persist to local storage
  useEffect(() => {
    localStorage.setItem('spdse_mistake_log', JSON.stringify(mistakes));
  }, [mistakes]);

  const handleAddMistake = () => {
    if (!newTitle.trim()) return;

    const now = new Date();
    const nextDate = new Date(now.getTime() + 24 * 3600 * 1000); // 1 day interval initially

    const item: MistakeItem = {
      id: `mistake-${Date.now()}`,
      problemTitle: newTitle.trim(),
      pattern: newPattern,
      mistakeReason: newReason.trim() || 'Failed hidden test cases under time pressure.',
      correctiveInsight: newInsight.trim() || 'Review edge cases and target complexity.',
      addedAt: now.toISOString(),
      nextReviewAt: nextDate.toISOString(),
      intervalDays: 1,
      reviewedCount: 0
    };

    setMistakes([item, ...mistakes]);
    setNewTitle('');
    setNewReason('');
    setNewInsight('');
    setShowAddModal(false);
  };

  const handleDelete = (id: string) => {
    setMistakes(mistakes.filter(m => m.id !== id));
  };

  const handleAdvanceSRS = (id: string) => {
    setMistakes(mistakes.map(m => {
      if (m.id !== id) return m;

      let nextInterval: 1 | 3 | 7 = 3;
      if (m.intervalDays === 1) nextInterval = 3;
      else if (m.intervalDays === 3) nextInterval = 7;
      else nextInterval = 7; // Mastered

      const nextDue = new Date(Date.now() + nextInterval * 24 * 3600 * 1000).toISOString();

      return {
        ...m,
        intervalDays: nextInterval,
        reviewedCount: m.reviewedCount + 1,
        nextReviewAt: nextDue
      };
    }));
  };

  const nowTime = new Date().getTime();
  const dueCount = mistakes.filter(m => new Date(m.nextReviewAt).getTime() <= nowTime).length;

  return (
    <div className="space-y-6 max-w-4xl">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-accent dark:text-accent-dark uppercase tracking-wider mb-1">
            <AlertTriangle size={14} />
            <span>Spaced Repetition System (1, 3, 7 Days)</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Mistake Log & Active Revision
          </h1>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 max-w-2xl leading-relaxed">
            Record every test failure, TLE, or subtle edge-case bug. Review cards on scheduled intervals (Day 1 → Day 3 → Day 7) to guarantee you never repeat the same algorithmic error during the live assessment.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-medium rounded-sm hover:bg-neutral-800 transition-colors shrink-0"
        >
          <Plus size={14} />
          <span>Log New Mistake</span>
        </button>
      </div>

      {/* SRS Status Summary */}
      <div className="p-4 rounded-sm border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-neutral-400">Total Logged Traps: </span>
            <span className="font-bold text-neutral-900 dark:text-white">{mistakes.length}</span>
          </div>
          <div>
            <span className="text-neutral-400">Due for Review Today: </span>
            <span className={`font-bold ${dueCount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
              {dueCount} items
            </span>
          </div>
        </div>

        <span className="text-[11px] text-neutral-500">
          Intervals: Day 1 → Day 3 → Day 7
        </span>
      </div>

      {/* Mistakes Card List */}
      <div className="space-y-3">
        {mistakes.map((m) => {
          const isDue = new Date(m.nextReviewAt).getTime() <= nowTime;

          return (
            <div
              key={m.id}
              className={`p-4 rounded-sm border transition-all ${
                isDue
                  ? 'border-amber-400 dark:border-amber-700/80 bg-amber-50/20 dark:bg-amber-950/15'
                  : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-neutral-900 dark:text-white">
                      {m.problemTitle}
                    </span>
                    <span className="font-mono text-[10px] px-1.5 py-0.2 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 rounded">
                      {m.pattern}
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.2 rounded font-semibold ${
                      isDue ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'
                    }`}>
                      {isDue ? '⚠️ Review Due Now' : `Next Review: Stage ${m.intervalDays}d`}
                    </span>
                    <span className="text-[10px] text-neutral-400 font-mono">
                      (Reviewed {m.reviewedCount}x)
                    </span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="p-2 rounded bg-rose-50/70 dark:bg-rose-950/25 border border-rose-200 dark:border-rose-900/50 text-rose-900 dark:text-rose-200 leading-relaxed">
                      <strong>Root Cause Bug:</strong> {m.mistakeReason}
                    </div>
                    <div className="p-2 rounded bg-emerald-50/70 dark:bg-emerald-950/25 border border-emerald-200 dark:border-emerald-900/50 text-emerald-900 dark:text-emerald-200 leading-relaxed">
                      <strong>Corrective Fix:</strong> {m.correctiveInsight}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleAdvanceSRS(m.id)}
                    className="p-1.5 text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 rounded border border-neutral-200 dark:border-neutral-700 hover:border-emerald-400 transition-colors"
                    title="Mark reviewed and advance SRS interval"
                  >
                    <CheckCircle2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(m.id)}
                    className="p-1.5 text-neutral-400 hover:text-rose-600 rounded border border-neutral-200 dark:border-neutral-700 hover:border-rose-300 transition-colors"
                    title="Delete mistake"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm">
          <div className="bg-paper-50 dark:bg-paper-900 p-5 rounded-sm border border-neutral-300 dark:border-neutral-700 max-w-md w-full space-y-4">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Log an Assessment Mistake</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-mono text-neutral-500 block mb-1">Problem Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Heroes and Villains / Binary Search on Answer"
                  className="w-full p-2 border border-neutral-300 dark:border-neutral-700 rounded-sm bg-white dark:bg-neutral-800 font-mono text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-neutral-500 block mb-1">Algorithmic Pattern</label>
                <select
                  value={newPattern}
                  onChange={(e) => setNewPattern(e.target.value)}
                  className="w-full p-2 border border-neutral-300 dark:border-neutral-700 rounded-sm bg-white dark:bg-neutral-800 font-mono text-xs focus:outline-none"
                >
                  <option value="dp">Dynamic Programming</option>
                  <option value="binary_search">Binary Search on Answer</option>
                  <option value="sorting_and_greedy">Sorting & Greedy</option>
                  <option value="arrays_and_prefix_sums">Arrays & Prefix Sums</option>
                  <option value="two_pointers_and_sliding_window">Two Pointers</option>
                  <option value="graphs_and_bfs_dfs">Graphs & BFS/DFS</option>
                  <option value="stack_and_monotonic_stack">Monotonic Stack</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-mono text-neutral-500 block mb-1">Why Did It Fail / TLE?</label>
                <textarea
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  placeholder="e.g. Integer multiplication overflowed 32-bit int before casting to long."
                  className="w-full p-2 border border-neutral-300 dark:border-neutral-700 rounded-sm bg-white dark:bg-neutral-800 text-xs focus:outline-none h-16"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-neutral-500 block mb-1">Key Corrective Takeaway</label>
                <textarea
                  value={newInsight}
                  onChange={(e) => setNewInsight(e.target.value)}
                  placeholder="e.g. Cast operand to (long) before multiplication."
                  className="w-full p-2 border border-neutral-300 dark:border-neutral-700 rounded-sm bg-white dark:bg-neutral-800 text-xs focus:outline-none h-16"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 text-xs text-neutral-600 dark:text-neutral-400"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMistake}
                className="px-3 py-1.5 text-xs bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold rounded-sm"
              >
                Save Mistake to SRS
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
