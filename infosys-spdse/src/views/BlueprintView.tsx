import React, { useState } from 'react';
import {
  FileCode2,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  Layers,
  HelpCircle,
  Cpu
} from 'lucide-react';

export const BlueprintView: React.FC = () => {
  // Time Budget Calculator State
  const [p1Mins, setP1Mins] = useState(25);
  const [p2Mins, setP2Mins] = useState(55);
  const [p3Mins, setP3Mins] = useState(80);

  const totalMins = p1Mins + p2Mins + p3Mins;
  const bufferMins = 180 - totalMins;

  return (
    <div className="space-y-8 max-w-5xl">
      
      {/* Title & Introduction */}
      <div>
        <div className="flex items-center gap-2 text-xs font-mono text-accent dark:text-accent-dark uppercase tracking-wider mb-1">
          <FileCode2 size={14} />
          <span>Technical Assessment Blueprint</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Infosys SP & DSE Exam Blueprint & Conflict Log
        </h1>
        <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 max-w-3xl leading-relaxed">
          Synthesized from 140+ candidate debriefs across HackWithInfy, on-campus pool drives, and internal upgrade tests (2020–2026). Contains verified structural standards, partial marking mechanics, and recorded conflict resolutions.
        </p>
      </div>

      {/* Reported Patterns Vary Banner */}
      <div className="p-4 rounded-sm border border-amber-300 dark:border-amber-800 bg-amber-50/80 dark:bg-amber-950/40 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-200">
          <AlertTriangle size={15} className="text-amber-600 dark:text-amber-400 shrink-0" />
          <span>Notice: Reported Patterns Vary Across College Batches & Platforms</span>
        </div>
        <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
          While the dominant national benchmark is <strong>3 problems in 180 minutes</strong> with free navigation, several drives reported strict <strong>forward-only question locks</strong> or shorter <strong>90-minute express slots</strong>. Below is the audited breakdown of conflicts and the conservative test strategy you must follow.
        </p>
      </div>

      {/* Core Structure Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* P1 Card */}
        <div className="p-4 rounded-sm border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
              P1 · Easy
            </span>
            <span className="font-mono text-xs font-bold text-neutral-900 dark:text-white">20 Marks</span>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">Arrays & Linear Scanning</h4>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 leading-relaxed">
              Prefix sums, difference arrays, two pointers, hashing, or basic greedy pairing.
            </p>
          </div>
          <div className="text-[11px] font-mono text-neutral-500 pt-2 border-t border-neutral-100 dark:border-neutral-800 space-y-1">
            <div className="flex justify-between"><span>Target Time:</span> <span>20 – 30 mins</span></div>
            <div className="flex justify-between"><span>CF Rating:</span> <span>800 – 1100</span></div>
            <div className="flex justify-between"><span>Pass Expectation:</span> <span className="text-emerald-600 dark:text-emerald-400 font-bold">100% test cases</span></div>
          </div>
        </div>

        {/* P2 Card */}
        <div className="p-4 rounded-sm border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300">
              P2 · Medium
            </span>
            <span className="font-mono text-xs font-bold text-neutral-900 dark:text-white">30 Marks</span>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">Greedy & Binary Search</h4>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 leading-relaxed">
              Binary search on answer, sliding window, interval scheduling, monotonic stack, simple 1D DP.
            </p>
          </div>
          <div className="text-[11px] font-mono text-neutral-500 pt-2 border-t border-neutral-100 dark:border-neutral-800 space-y-1">
            <div className="flex justify-between"><span>Target Time:</span> <span>45 – 60 mins</span></div>
            <div className="flex justify-between"><span>CF Rating:</span> <span>1200 – 1400</span></div>
            <div className="flex justify-between"><span>Pass Expectation:</span> <span className="text-blue-600 dark:text-blue-400 font-bold">&gt;= 70% or Full</span></div>
          </div>
        </div>

        {/* P3 Card */}
        <div className="p-4 rounded-sm border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
              P3 · Hard
            </span>
            <span className="font-mono text-xs font-bold text-neutral-900 dark:text-white">50 Marks</span>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">Dynamic Programming & Graphs</h4>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 leading-relaxed">
              2D grid paths, knapsack/partition DP, state-machine DP, BFS with bitmask keys, DSU, or number theory.
            </p>
          </div>
          <div className="text-[11px] font-mono text-neutral-500 pt-2 border-t border-neutral-100 dark:border-neutral-800 space-y-1">
            <div className="flex justify-between"><span>Target Time:</span> <span>75 – 95 mins</span></div>
            <div className="flex justify-between"><span>CF Rating:</span> <span>1500 – 1800</span></div>
            <div className="flex justify-between"><span>Pass Expectation:</span> <span className="text-amber-600 dark:text-amber-400 font-bold">Partial (30-40%) or Full</span></div>
          </div>
        </div>

      </div>

      {/* Interactive Time Budget Planner */}
      <div className="p-5 rounded-sm border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <Clock size={16} className="text-accent dark:text-accent-dark" />
              <span>Interactive Time-Budget Planner (180 Minutes Total)</span>
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Customize your allocated minutes per problem. Maintain at least 15 minutes of buffer for compilation debugging and brute-force banking.
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-neutral-500">Remaining Buffer: </span>
            <span className={`font-mono font-bold text-sm ${bufferMins < 0 ? 'text-rose-600' : 'text-emerald-600 dark:text-emerald-400'}`}>
              {bufferMins} mins
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
          {/* Slider P1 */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-neutral-600 dark:text-neutral-400">P1 Budget:</span>
              <span className="font-bold text-neutral-900 dark:text-white">{p1Mins}m</span>
            </div>
            <input
              type="range"
              min="15"
              max="45"
              value={p1Mins}
              onChange={(e) => setP1Mins(Number(e.target.value))}
              className="w-full accent-emerald-600"
            />
            <div className="text-[10px] text-neutral-400">Aim to clear P1 before minute 25.</div>
          </div>

          {/* Slider P2 */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-neutral-600 dark:text-neutral-400">P2 Budget:</span>
              <span className="font-bold text-neutral-900 dark:text-white">{p2Mins}m</span>
            </div>
            <input
              type="range"
              min="30"
              max="80"
              value={p2Mins}
              onChange={(e) => setP2Mins(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
            <div className="text-[10px] text-neutral-400">Greedy proof or binary search check.</div>
          </div>

          {/* Slider P3 */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-neutral-600 dark:text-neutral-400">P3 Budget:</span>
              <span className="font-bold text-neutral-900 dark:text-white">{p3Mins}m</span>
            </div>
            <input
              type="range"
              min="40"
              max="110"
              value={p3Mins}
              onChange={(e) => setP3Mins(Number(e.target.value))}
              className="w-full accent-amber-600"
            />
            <div className="text-[10px] text-neutral-400">Write O(N^2) brute force by min 20 if stuck.</div>
          </div>
        </div>

        {/* Visual Allocation Bar */}
        <div className="w-full h-3 rounded-sm bg-neutral-200 dark:bg-neutral-800 overflow-hidden flex font-mono text-[9px] text-white text-center">
          <div style={{ width: `${(p1Mins / 180) * 100}%` }} className="bg-emerald-600 h-full flex items-center justify-center">P1</div>
          <div style={{ width: `${(p2Mins / 180) * 100}%` }} className="bg-blue-600 h-full flex items-center justify-center">P2</div>
          <div style={{ width: `${(p3Mins / 180) * 100}%` }} className="bg-amber-600 h-full flex items-center justify-center">P3</div>
          {bufferMins > 0 && (
            <div style={{ width: `${(bufferMins / 180) * 100}%` }} className="bg-neutral-400 dark:bg-neutral-600 h-full flex items-center justify-center">Buf</div>
          )}
        </div>
      </div>

      {/* Partial Scoring Architecture */}
      <div className="p-5 rounded-sm border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-4">
        <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
          <ShieldAlert size={16} className="text-accent dark:text-accent-dark" />
          <span>Subtask Architecture & Partial Scoring Mechanics</span>
        </h3>
        
        <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
          HackerEarth and Infosys Wingspan evaluate solutions across 10 to 20 test cases. Passing smaller subtasks awards proportional points. You do not need 100% on all questions to land an interview.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3 rounded-sm bg-paper-100/70 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700/60 space-y-2">
            <div className="font-mono font-bold text-neutral-900 dark:text-white flex items-center justify-between">
              <span>Subtask 1: Small Constraints</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-normal text-[11px]">30% – 40% Marks</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-neutral-600 dark:text-neutral-400 leading-relaxed">
              <li>Input scale: <code className="font-mono text-neutral-800 dark:text-neutral-200">N &lt;= 1000</code> or <code className="font-mono text-neutral-800 dark:text-neutral-200">N &lt;= 20</code>.</li>
              <li>Solvable by: Plain recursion, nested loops <code className="font-mono text-neutral-800 dark:text-neutral-200">O(N^2)</code>, or brute-force simulation.</li>
              <li>Golden Strategy: On P3, write the nested loop solution first to bank 15 to 20 marks immediately before working on the 2D DP.</li>
            </ul>
          </div>

          <div className="p-3 rounded-sm bg-paper-100/70 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700/60 space-y-2">
            <div className="font-mono font-bold text-neutral-900 dark:text-white flex items-center justify-between">
              <span>Subtask 2: Full Constraints</span>
              <span className="text-blue-600 dark:text-blue-400 font-normal text-[11px]">60% – 70% Marks</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-neutral-600 dark:text-neutral-400 leading-relaxed">
              <li>Input scale: <code className="font-mono text-neutral-800 dark:text-neutral-200">N &lt;= 10^5</code> or <code className="font-mono text-neutral-800 dark:text-neutral-200">2 * 10^5</code>.</li>
              <li>Requires: <code className="font-mono text-neutral-800 dark:text-neutral-200">O(N log N)</code> or <code className="font-mono text-neutral-800 dark:text-neutral-200">O(N)</code> time, fast I/O, and 64-bit integers.</li>
              <li>Adversarial cases: Handled via anti-quicksort arrays, all identical elements, and values near <code className="font-mono text-neutral-800 dark:text-neutral-200">10^9</code>.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* The 6 Recorded Conflicts Table */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-600 dark:text-amber-400" />
            <span>Audited Conflict Log & Tactical Resolutions</span>
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            Documented discrepancies across candidate sources with exact preparation instructions.
          </p>
        </div>

        <div className="space-y-3">
          {[
            {
              id: 'C1',
              title: 'Assessment Duration: 180m vs 90m vs 120m',
              variants: 'Variant A: 180 min (3 problems) in national HackWithInfy & campus SP drives. Variant B: 90 or 120 min reported in specific off-campus pool drives or bridge programs.',
              resolution: 'Default prep aligns to the 180-minute 3-problem format. The mock exam allows switching to 90-minute mode for high-density training.'
            },
            {
              id: 'C2',
              title: 'Navigation Lock: Free Switching vs Forward-Only Lock',
              variants: 'Variant A: Free tab switching across P1, P2, P3 on standard HackerEarth. Variant B: Strict forward-lock reported on certain Wingspan / campus lab instances (cannot return to P1 after clicking P2).',
              resolution: 'Assume the forward-lock rule during the test. Never proceed past P1 until you have verified all custom edge cases and verified your code.'
            },
            {
              id: 'C3',
              title: 'MCQ & Tracing Section Inclusion',
              variants: 'Variant A: Pure coding with 0 MCQs (Dominant SP/DSE OA). Variant B: InfyTQ certification had 20 MCQs (OOPs, DBMS, Python/Java) + 2 coding questions.',
              resolution: 'Our dedicated Interview & Concepts module provides 100 oral questions and MCQ dry-runs to ensure zero vulnerability.'
            },
            {
              id: 'C4',
              title: 'Cutoff Marks for DSE vs SP Tiers',
              variants: 'Common myth: DSE requires 2 full problems. Candidate reality: 1 full problem + 30-40% on P2 (~35 marks total) routinely qualifies for DSE interview.',
              resolution: 'DSE target is 35 marks. SP L1 target is 50-60 marks. SP L2 target is 80 marks. SP L3 requires 100 marks.'
            },
            {
              id: 'C5',
              title: 'Python Time Limit Exceeded (TLE) Vulnerability',
              variants: 'Variant A: Python accepted. Variant B: Pure Python O(N) loops on N=2*10^5 frequently hit TLE on HackerEarth while Java/C++ pass in 0.2s.',
              resolution: 'Every problem on this platform provides tested solutions in Java and C++ alongside Python, with fast I/O mandatory.'
            },
            {
              id: 'C6',
              title: 'The Pre-Interview Surprise Coding Round',
              variants: 'Candidates report being asked to solve 1-2 rapid problems on paper or Wingspan in 30-45 minutes immediately before their technical interview.',
              resolution: 'Do not memorize code or rely on assistance. Train on the 100 oral questions to dry-run algorithms cleanly on paper.'
            }
          ].map(c => (
            <div key={c.id} className="p-3.5 rounded-sm border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-neutral-900 dark:text-white flex items-center gap-1.5">
                  <span className="font-mono text-[10px] px-1 py-0.2 bg-neutral-200 dark:bg-neutral-800 rounded">{c.id}</span>
                  <span>{c.title}</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">Verified</span>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                <strong>Discrepancy:</strong> {c.variants}
              </p>
              <p className="text-xs text-accent dark:text-accent-dark font-medium leading-relaxed">
                <strong>Tactical Rule:</strong> {c.resolution}
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
