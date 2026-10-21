import React, { useState } from 'react';
import { Gamepad2, Target, Zap, Compass, Cpu, Layers } from 'lucide-react';
import { BinarySentryGame } from './BinarySentryGame';
import { TwoPointerGame } from './TwoPointerGame';
import { IslandRescueBfsGame } from './IslandRescueBfsGame';
import { DpCoinQuestGame } from './DpCoinQuestGame';
import { MonotonicStackDefenseGame } from './MonotonicStackDefenseGame';

export const GamesHub: React.FC = () => {
  const [activeGame, setActiveGame] = useState<'binary' | 'two-pointer' | 'bfs' | 'dp' | 'stack'>('binary');

  const games = [
    {
      id: 'binary' as const,
      name: 'Binary Sentry',
      pattern: 'Binary Search (Log N)',
      icon: Target,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10 border-cyan-500/30',
      description: 'Cut the search space in half with every probe to find hidden vaults.'
    },
    {
      id: 'two-pointer' as const,
      name: 'Two-Pointer Canyon',
      pattern: 'Sorted Two Pointers O(N)',
      icon: Zap,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10 border-indigo-500/30',
      description: 'Inward pointer convergence to beat the clock matching target sums.'
    },
    {
      id: 'bfs' as const,
      name: 'Grid BFS Explorer',
      pattern: 'Breadth-First Search Wave',
      icon: Compass,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10 border-emerald-500/30',
      description: 'Visualize concentric BFS waves guaranteeing the shortest unweighted path.'
    },
    {
      id: 'dp' as const,
      name: 'DP Coin Quest',
      pattern: 'Dynamic Programming vs Greedy',
      icon: Cpu,
      color: 'text-rose-400',
      bgColor: 'bg-rose-500/10 border-rose-500/30',
      description: 'See why greedy choices fail and how bottom-up DP finds the true minimum.'
    },
    {
      id: 'stack' as const,
      name: 'Monotonic Defense',
      pattern: 'Monotonic Stack Invariant',
      icon: Layers,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10 border-amber-500/30',
      description: 'Pop smaller incoming threats to preserve monotonic decreasing order.'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full text-xs font-semibold mb-3">
            <Gamepad2 className="w-3.5 h-3.5" /> Interactive DSA Game Arcade
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Play, Internalize, and Master DSA Patterns
          </h2>
          <p className="text-slate-300 text-sm sm:text-base mt-2 leading-relaxed">
            Forget passive memorization. Play these hands-on mini-games designed specifically to build visceral muscle memory for binary search, two-pointer boundaries, monotonic stack invariants, BFS shortest paths, and dynamic programming.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {games.map((g) => {
          const Icon = g.icon;
          const isActive = activeGame === g.id;

          return (
            <button
              key={g.id}
              onClick={() => setActiveGame(g.id)}
              className={`p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between ${
                isActive
                  ? `${g.bgColor} ring-2 ring-cyan-400/50 shadow-lg scale-[1.02]`
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`p-2 rounded-xl bg-slate-950/80 ${g.color}`}>
                    <Icon className="w-5 h-5" />
                  </span>
                  {isActive && (
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                  )}
                </div>
                <h4 className="font-bold text-white text-sm">{g.name}</h4>
                <p className="text-[11px] text-cyan-400 font-mono mt-0.5">{g.pattern}</p>
              </div>
              <p className="text-xs text-slate-400 mt-2 line-clamp-2">{g.description}</p>
            </button>
          );
        })}
      </div>

      <div className="mt-4">
        {activeGame === 'binary' && <BinarySentryGame />}
        {activeGame === 'two-pointer' && <TwoPointerGame />}
        {activeGame === 'bfs' && <IslandRescueBfsGame />}
        {activeGame === 'dp' && <DpCoinQuestGame />}
        {activeGame === 'stack' && <MonotonicStackDefenseGame />}
      </div>
    </div>
  );
};
