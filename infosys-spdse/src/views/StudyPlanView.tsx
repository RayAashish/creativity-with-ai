import React, { useState } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Target,
  Sparkles,
  ArrowRight,
  Flame,
  Layers
} from 'lucide-react';
import { rolesData } from '../data/rolesData';

export const StudyPlanView: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState('sp_l1');
  const [dailyHours, setDailyHours] = useState(4);
  const [completedDays, setCompletedDays] = useState<Record<number, boolean>>(() => {
    try {
      const stored = localStorage.getItem('spdse_completed_days');
      if (stored) return JSON.parse(stored);
    } catch {}
    return {};
  });

  const toggleDayComplete = (day: number) => {
    const updated = { ...completedDays, [day]: !completedDays[day] };
    setCompletedDays(updated);
    localStorage.setItem('spdse_completed_days', JSON.stringify(updated));
  };

  const scheduleDays = [
    // Phase 1 (Days 1 - 7): Foundations & P1 Guarantee
    { day: 1, phase: 'Phase 1: P1 Mastery', topic: 'Arrays & Prefix Sums', tasks: 'Master 1D prefix sums and difference arrays for O(1) range updates. Solve 4 P1 problems.', hours: dailyHours },
    { day: 2, phase: 'Phase 1: P1 Mastery', topic: 'Two Pointers & Sliding Window', tasks: 'Monotonic window expansion and contraction. Solve 4 P1/P2 problems.', hours: dailyHours },
    { day: 3, phase: 'Phase 1: P1 Mastery', topic: 'Hashing & Frequency Counting', tasks: 'Two-sum complements, anagram frequency, and modulus normalization ((sum % K) + K) % K.', hours: dailyHours },
    { day: 4, phase: 'Phase 1: P1 Mastery', topic: 'Sorting & Greedy Mechanics', tasks: 'Custom comparator sorting in Java & C++. Solve RPG Monster Quest (PYQ-01).', hours: dailyHours },
    { day: 5, phase: 'Phase 1: P1 Mastery', topic: 'Fast I/O & Bitwise Basics', tasks: 'Implement custom BufferedReader in Java. Practice XOR cancellation (PYQ-29).', hours: dailyHours },
    { day: 6, phase: 'Phase 1: P1 Mastery', topic: 'Simulation & Grid Navigation', tasks: 'Direction vectors dx/dy with boundary guards. Solve 3 simulation problems.', hours: dailyHours },
    { day: 7, phase: 'Phase 1: P1 Mastery', topic: 'Phase 1 Review & Mini Mock', tasks: 'Timed 60-minute session: Solve 2 P1 problems back-to-back with zero syntax errors.', hours: dailyHours },

    // Phase 2 (Days 8 - 14): Core Medium & DSE Cutoff
    { day: 8, phase: 'Phase 2: P2 Core & DSE Cutoff', topic: 'Binary Search on Answer (Part 1)', tasks: 'Monotonic predicate checking (isPossible). Ship packages in D days archetype.', hours: dailyHours },
    { day: 9, phase: 'Phase 2: P2 Core & DSE Cutoff', topic: 'Binary Search on Answer (Part 2)', tasks: 'Solve Heroes and Villains (PYQ-02) and Minimize Ugliness (PYQ-26).', hours: dailyHours },
    { day: 10, phase: 'Phase 2: P2 Core & DSE Cutoff', topic: 'Interval Scheduling & Two Pointers', tasks: 'Non-overlapping interval greedy selection. Solve Range of Towers (PYQ-06).', hours: dailyHours },
    { day: 11, phase: 'Phase 2: P2 Core & DSE Cutoff', topic: 'Monotonic Stack (Next Greater)', tasks: 'O(N) Next Greater Element and histogram bounds. Solve Stress Points (PYQ-40).', hours: dailyHours },
    { day: 12, phase: 'Phase 2: P2 Core & DSE Cutoff', topic: 'Introductory 1D Dynamic Programming', tasks: 'House Robber and Maximum Dish Selection (PYQ-07) with state transitions.', hours: dailyHours },
    { day: 13, phase: 'Phase 2: P2 Core & DSE Cutoff', topic: 'Story Recognition Drills', tasks: 'Complete 40 Story-to-Pattern recognition drills in the Trainer module.', hours: dailyHours },
    { day: 14, phase: 'Phase 2: P2 Core & DSE Cutoff', topic: 'Full 180-Minute Mock Exam #1', tasks: 'Run Predicted Set 01 under timed exam simulator. Review mistakes.', hours: dailyHours },

    // Phase 3 (Days 15 - 19): Hard Tiers & SP Breakthrough
    { day: 15, phase: 'Phase 3: SP Optimization', topic: '2D Grid DP & Path Costs', tasks: 'Conveyor belt switching penalty (PYQ-35) and Unique Paths with Keys (PYQ-04).', hours: dailyHours },
    { day: 16, phase: 'Phase 3: SP Optimization', topic: 'Knapsack & Partition DP', tasks: '0/1 Knapsack, Subset Sum, and Last Stone Weight II resonance variant (PYQ-10).', hours: dailyHours },
    { day: 17, phase: 'Phase 3: SP Optimization', topic: 'Graphs (BFS & Disjoint Set Union)', tasks: 'DSU with path compression and connected components (PYQ-36 Roads and Libraries).', hours: dailyHours },
    { day: 18, phase: 'Phase 3: SP Optimization', topic: 'Partial Score Subtask Strategy', tasks: 'Practice writing O(N^2) brute force on Hard problems to bank 20 marks in 15 mins.', hours: dailyHours },
    { day: 19, phase: 'Phase 3: SP Optimization', topic: 'Full 180-Minute Mock Exam #2', tasks: 'Run Predicted Set 16 under timed exam conditions. Target 55+ marks for SP L1.', hours: dailyHours },

    // Phase 4 (Days 20 - 21): Final Consolidation & Pre-Interview
    { day: 20, phase: 'Phase 4: Final Consolidation', topic: 'Oral Interview & Pre-Interview Round', tasks: 'Review 50 oral DSA questions and write Dutch National Flag / BFS on paper.', hours: dailyHours },
    { day: 21, phase: 'Phase 4: Final Consolidation', topic: 'Last 48h Mode: Review & Checklists', tasks: 'Review all logged mistakes in Spaced Repetition log. Memorize fast IO templates.', hours: dailyHours },
  ];

  const completedCount = Object.values(completedDays).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / scheduleDays.length) * 100);

  return (
    <div className="space-y-6 max-w-4xl">
      
      {/* Title */}
      <div>
        <div className="flex items-center gap-2 text-xs font-mono text-accent dark:text-accent-dark uppercase tracking-wider mb-1">
          <CalendarDays size={14} />
          <span>Strategic Timeline</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          21-Day High-Signal Study Plan
        </h1>
        <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 max-w-2xl leading-relaxed">
          Structured for maximum signal per hour. Divided into 4 sequential phases: P1 Guarantee, Core Medium & DSE cutoff, SP DP Breakthrough, and Final Timed Simulation.
        </p>
      </div>

      {/* Controls Bar */}
      <div className="p-4 rounded-sm border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        
        {/* Role Selector */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-neutral-500 font-mono">Target Role:</span>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="p-1.5 border border-neutral-300 dark:border-neutral-700 rounded-sm bg-paper-50 dark:bg-neutral-800 font-mono text-xs focus:outline-none"
          >
            {rolesData.map(r => (
              <option key={r.id} value={r.id}>{r.name} ({r.ctc})</option>
            ))}
          </select>
        </div>

        {/* Daily Hours Slider */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="text-neutral-500">Daily Study Time:</span>
          <input
            type="range"
            min="2"
            max="8"
            step="1"
            value={dailyHours}
            onChange={(e) => setDailyHours(Number(e.target.value))}
            className="accent-accent w-24"
          />
          <span className="font-bold text-neutral-900 dark:text-white">{dailyHours}h / day</span>
        </div>

      </div>

      {/* Progress Summary Card */}
      <div className="p-4 rounded-sm border border-neutral-200 dark:border-neutral-800 bg-paper-100/60 dark:bg-neutral-900/60 flex items-center justify-between text-xs">
        <div>
          <span className="font-mono text-neutral-500">Overall 21-Day Completion: </span>
          <span className="font-mono font-bold text-neutral-900 dark:text-white">
            {completedCount} of 21 Days ({progressPercent}%)
          </span>
        </div>
        <div className="w-36 h-2 bg-neutral-200 dark:bg-neutral-800 rounded-sm overflow-hidden">
          <div
            className="h-full bg-accent dark:bg-accent-dark transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Day by Day Cards List */}
      <div className="space-y-2.5">
        {scheduleDays.map((item) => {
          const isDone = !!completedDays[item.day];

          return (
            <div
              key={item.day}
              className={`p-3.5 rounded-sm border transition-all ${
                isDone
                  ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/10'
                  : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleDayComplete(item.day)}
                    className={`mt-0.5 w-4 h-4 rounded-sm border flex items-center justify-center transition-colors ${
                      isDone
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-neutral-300 dark:border-neutral-600 hover:border-neutral-400'
                    }`}
                    aria-label="Toggle Complete"
                  >
                    {isDone && <CheckCircle2 size={12} />}
                  </button>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-neutral-900 dark:text-white">
                        Day {String(item.day).padStart(2, '0')}: {item.topic}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                        {item.phase}
                      </span>
                    </div>

                    <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-2xl">
                      {item.tasks}
                    </p>
                  </div>
                </div>

                <div className="text-right font-mono text-[11px] text-neutral-400 shrink-0">
                  {item.hours}h Study
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
