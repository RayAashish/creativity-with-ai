import React, { useState } from 'react';
import { Cpu, Play, RotateCcw, AlertTriangle, CheckCircle2, Sparkles, TrendingUp } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Scenario {
  title: string;
  coins: number[];
  target: number;
  greedyResult: number[];
  dpResult: number[];
  explanation: string;
}

const SCENARIOS: Scenario[] = [
  {
    title: 'The Classic 6-Cent Trap',
    coins: [1, 3, 4],
    target: 6,
    greedyResult: [4, 1, 1], // 3 coins
    dpResult: [3, 3],        // 2 coins
    explanation: 'Greedy picks the largest coin (4), leaving 2 cents, which forces two 1-cent coins (3 coins total). DP tests all subproblems and discovers 3 + 3 = 6 using only 2 coins!'
  },
  {
    title: 'The 11-Cent Stumble',
    coins: [1, 5, 6, 8],
    target: 11,
    greedyResult: [8, 1, 1, 1], // 4 coins
    dpResult: [6, 5],           // 2 coins
    explanation: 'Greedy greedily consumes the 8-cent coin, leaving 3 cents for three 1-cent coins (4 coins). DP finds 6 + 5 = 11 in just 2 coins!'
  },
  {
    title: 'The 14-Cent Puzzle',
    coins: [1, 7, 10],
    target: 14,
    greedyResult: [10, 1, 1, 1, 1], // 5 coins
    dpResult: [7, 7],              // 2 coins
    explanation: 'Greedy grabs 10, needing four 1s (5 coins). DP finds 7 + 7 = 14 (2 coins).'
  }
];

export const DpCoinQuestGame: React.FC = () => {
  const [scenarioIdx, setScenarioIdx] = useState<number>(0);
  const scenario = SCENARIOS[scenarioIdx];
  const [dpStep, setDpStep] = useState<number>(0);
  const [showComparison, setShowComparison] = useState<boolean>(false);

  // Compute DP table for the scenario
  const target = scenario.target;
  const coins = scenario.coins;
  const dp: number[] = new Array(target + 1).fill(Infinity);
  dp[0] = 0;
  for (let i = 1; i <= target; i++) {
    for (const c of coins) {
      if (i - c >= 0 && dp[i - c] !== Infinity) {
        dp[i] = Math.min(dp[i], dp[i - c] + 1);
      }
    }
  }

  const nextStep = () => {
    if (dpStep < target) {
      setDpStep(prev => prev + 1);
    } else {
      setShowComparison(true);
      try {
        confetti({ particleCount: 70, spread: 60 });
      } catch (e) {
        console.error(e);
      }
    }
  };

  const reset = () => {
    setDpStep(0);
    setShowComparison(false);
  };

  const selectScenario = (idx: number) => {
    setScenarioIdx(idx);
    setDpStep(0);
    setShowComparison(false);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-rose-500/20 text-rose-400 rounded-lg">
              <Cpu className="w-5 h-5" />
            </span>
            <h3 className="text-xl font-bold text-white">DP Coin Quest: Dynamic Programming vs Greedy Trap</h3>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            See exactly why greedy local choices fail and how DP builds the globally optimal answer!
          </p>
        </div>

        <div className="flex items-center gap-2">
          {SCENARIOS.map((s, idx) => (
            <button
              key={idx}
              onClick={() => selectScenario(idx)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                scenarioIdx === idx
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
            >
              Trap #{idx + 1}
            </button>
          ))}
          <button
            onClick={reset}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
        </div>
      </div>

      {/* Scenario Details Header */}
      <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <span>{scenario.title}</span>
            </h4>
            <div className="flex items-center gap-3 mt-1 text-sm text-slate-400">
              <span>Available Coin Denominations:</span>
              <div className="flex gap-1.5">
                {coins.map((c, i) => (
                  <span key={i} className="px-2 py-0.5 bg-slate-800 text-cyan-300 font-mono font-bold rounded-lg border border-slate-700 text-xs">
                    {c}¢
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="bg-slate-900 px-4 py-2 rounded-xl border border-slate-800 text-center">
            <span className="text-xs text-slate-400 uppercase tracking-wider block">Target Amount</span>
            <span className="text-xl font-black text-rose-400">{scenario.target}¢</span>
          </div>
        </div>
      </div>

      {/* Head to Head Duel: Greedy vs DP */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Greedy Result Card */}
        <div className="bg-slate-950/80 p-5 rounded-2xl border border-amber-500/30 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <h5 className="font-bold text-amber-300">Greedy Approach (Local Choice)</h5>
            </div>
            <span className="text-xs bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-full font-bold">
              Suboptimal!
            </span>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Greedy always selects the highest denomination coin ≤ remaining value.
          </p>

          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-slate-400">Coins chosen:</span>
            <div className="flex gap-1.5">
              {scenario.greedyResult.map((c, i) => (
                <span key={i} className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-xl font-mono font-bold text-sm">
                  {c}¢
                </span>
              ))}
            </div>
          </div>
          <div className="text-sm font-semibold text-slate-300">
            Total Coins Used: <span className="text-amber-400 font-bold text-base">{scenario.greedyResult.length}</span>
          </div>
        </div>

        {/* DP Result Card */}
        <div className="bg-slate-950/80 p-5 rounded-2xl border border-emerald-500/40 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <h5 className="font-bold text-emerald-300">Dynamic Programming (Global Optimal)</h5>
            </div>
            <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-full font-bold">
              Optimal!
            </span>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            DP considers all coin transitions: <code>dp[i] = min(dp[i], dp[i - c] + 1)</code>
          </p>

          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-slate-400">Coins chosen:</span>
            <div className="flex gap-1.5">
              {scenario.dpResult.map((c, i) => (
                <span key={i} className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-xl font-mono font-bold text-sm">
                  {c}¢
                </span>
              ))}
            </div>
          </div>
          <div className="text-sm font-semibold text-slate-300">
            Total Coins Used: <span className="text-emerald-400 font-bold text-base">{scenario.dpResult.length}</span>
          </div>
        </div>
      </div>

      {/* Interactive Bottom-Up DP Table Builder */}
      <div className="p-4 bg-slate-950/90 rounded-2xl border border-slate-800 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div>
            <h5 className="font-bold text-slate-200 text-sm">Interactive 1D DP Array Progression: <code>dp[amount]</code></h5>
            <p className="text-xs text-slate-400">Step through bottom-up calculation to witness subproblem reuse.</p>
          </div>
          <button
            onClick={nextStep}
            disabled={dpStep >= target && showComparison}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-rose-500/20 transition disabled:opacity-40"
          >
            <Play className="w-3.5 h-3.5" />
            {dpStep >= target ? 'Reveal Comparison' : `Compute dp[${dpStep + 1}]`}
          </button>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {Array.from({ length: target + 1 }).map((_, amount) => {
            const isComputed = amount <= dpStep;
            const isCurrent = amount === dpStep;
            const isFinalTarget = amount === target;

            let style = 'bg-slate-900 border-slate-800 text-slate-600';
            if (isCurrent) {
              style = 'bg-rose-500/20 border-rose-400 text-rose-300 ring-2 ring-rose-400';
            } else if (isComputed) {
              style = 'bg-slate-800/90 border-slate-700 text-cyan-300';
            }

            return (
              <div
                key={amount}
                className={`min-w-[50px] p-2 rounded-xl border flex flex-col items-center justify-center font-mono transition-all ${style}`}
              >
                <span className="text-[10px] text-slate-500">{amount}¢</span>
                <span className="text-sm font-bold">
                  {isComputed ? (dp[amount] === Infinity ? '∞' : dp[amount]) : '?'}
                </span>
                {isFinalTarget && <span className="text-[8px] text-rose-400 font-bold uppercase mt-0.5">Goal</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Explanation Banner */}
      <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/60 text-xs sm:text-sm text-slate-300 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-white">Why DP Triumphs: </span>
          <span>{scenario.explanation}</span>
        </div>
      </div>
    </div>
  );
};
