import React, { useState, useEffect } from 'react';
import { Target, RotateCcw, Award, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Vault {
  index: number;
  value: number;
  isEliminated: boolean;
  isInspected: boolean;
}

export const BinarySentryGame: React.FC = () => {
  const [arraySize] = useState<number>(15);
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [target, setTarget] = useState<number>(0);
  const [low, setLow] = useState<number>(0);
  const [high, setHigh] = useState<number>(14);
  const [attempts, setAttempts] = useState<number>(0);
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing');
  const [message, setMessage] = useState<string>('');
  const [log, setLog] = useState<string[]>([]);

  const maxOptimalMoves = Math.floor(Math.log2(arraySize)) + 1; // 4 moves for 15 elements

  const initGame = () => {
    // Generate 15 distinct sorted numbers
    const base = Math.floor(Math.random() * 20) + 10;
    const nums: number[] = [];
    let current = base;
    for (let i = 0; i < arraySize; i++) {
      current += Math.floor(Math.random() * 6) + 3;
      nums.push(current);
    }
    const chosenTarget = nums[Math.floor(Math.random() * nums.length)];

    setVaults(nums.map((val, idx) => ({
      index: idx,
      value: val,
      isEliminated: false,
      isInspected: false,
    })));
    setTarget(chosenTarget);
    setLow(0);
    setHigh(arraySize - 1);
    setAttempts(0);
    setGameState('playing');
    setMessage(`Find the target value ${chosenTarget} in <= ${maxOptimalMoves} moves using Binary Search!`);
    setLog([`Game started. Target is ${chosenTarget}. Search space: [0 .. ${arraySize - 1}].`]);
  };

  useEffect(() => {
    initGame();
  }, []);

  const mid = low <= high ? Math.floor((low + high) / 2) : -1;

  const inspectIndex = (index: number) => {
    if (gameState !== 'playing') return;
    if (index < low || index > high) {
      setMessage(`Index ${index} is outside current active search boundaries [${low} .. ${high}]!`);
      return;
    }

    const val = vaults[index].value;
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);

    // Mark inspected
    setVaults(prev => prev.map(v => v.index === index ? { ...v, isInspected: true } : v));

    if (val === target) {
      setGameState('won');
      setMessage(`🎉 TARGET FOUND at index ${index}! Value: ${val}. Moves: ${nextAttempts}`);
      setLog(prev => [`🎯 FOUND! Index ${index} contains ${val} in ${nextAttempts} moves!`, ...prev]);
      try {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      } catch (e) {
        console.error(e);
      }
      return;
    }

    if (val < target) {
      // Eliminate left half including index
      const newLow = index + 1;
      setLow(newLow);
      setVaults(prev => prev.map(v => v.index <= index ? { ...v, isEliminated: true } : v));
      const logMsg = `Inspected index ${index} (${val}) < Target (${target}) ➡️ Shifting low = ${newLow}. Left half eliminated!`;
      setMessage(logMsg);
      setLog(prev => [logMsg, ...prev]);

      if (newLow > high) {
        setGameState('lost');
        setMessage('Search space exhausted without finding target.');
      }
    } else {
      // val > target -> Eliminate right half including index
      const newHigh = index - 1;
      setHigh(newHigh);
      setVaults(prev => prev.map(v => v.index >= index ? { ...v, isEliminated: true } : v));
      const logMsg = `Inspected index ${index} (${val}) > Target (${target}) ⬅️ Shifting high = ${newHigh}. Right half eliminated!`;
      setMessage(logMsg);
      setLog(prev => [logMsg, ...prev]);

      if (low > newHigh) {
        setGameState('lost');
        setMessage('Search space exhausted without finding target.');
      }
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
              <Target className="w-5 h-5" />
            </span>
            <h3 className="text-xl font-bold text-white">Binary Sentry: The Log(N) Vault</h3>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Master divide & conquer by cutting the search space in half each step!
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700/60 text-center">
            <div className="text-xs text-slate-400 uppercase tracking-wider">Target</div>
            <div className="text-lg font-black text-cyan-400">{target}</div>
          </div>
          <div className="bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700/60 text-center">
            <div className="text-xs text-slate-400 uppercase tracking-wider">Moves / Optimal</div>
            <div className={`text-lg font-black ${attempts <= maxOptimalMoves ? 'text-emerald-400' : 'text-amber-400'}`}>
              {attempts} / {maxOptimalMoves}
            </div>
          </div>
          <button
            onClick={initGame}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-xl border border-slate-700 transition"
          >
            <RotateCcw className="w-4 h-4" /> Reset
          </button>
        </div>
      </div>

      {/* Pointer Boundaries Indicator */}
      <div className="flex items-center justify-between bg-slate-950/60 p-3 rounded-xl border border-slate-800 mb-6 text-xs sm:text-sm font-mono">
        <div className="flex items-center gap-2 text-emerald-400">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>LOW: index {low}</span>
        </div>
        <div className="flex items-center gap-2 text-cyan-400 font-bold">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
          <span>MID: index {mid >= 0 ? mid : 'None'}</span>
        </div>
        <div className="flex items-center gap-2 text-rose-400">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-pulse"></span>
          <span>HIGH: index {high}</span>
        </div>
      </div>

      {/* Vault Array Grid */}
      <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-15 gap-2 mb-6">
        {vaults.map((vault) => {
          const isMid = vault.index === mid && gameState === 'playing';
          const isLow = vault.index === low && gameState === 'playing';
          const isHigh = vault.index === high && gameState === 'playing';
          const isTargetFound = gameState === 'won' && vault.value === target;

          let cardStyle = 'bg-slate-800/90 border-slate-700 text-slate-200 hover:border-cyan-500/80';
          if (vault.isEliminated) {
            cardStyle = 'bg-slate-950/40 border-slate-900 text-slate-600 line-through opacity-40 cursor-not-allowed';
          } else if (isTargetFound) {
            cardStyle = 'bg-emerald-500/20 border-emerald-400 text-emerald-300 ring-2 ring-emerald-400 animate-bounce-short';
          } else if (isMid) {
            cardStyle = 'bg-cyan-500/20 border-cyan-400 text-cyan-200 ring-2 ring-cyan-400/80';
          }

          return (
            <button
              key={vault.index}
              disabled={vault.isEliminated || gameState !== 'playing'}
              onClick={() => inspectIndex(vault.index)}
              className={`relative flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all duration-200 ${cardStyle}`}
            >
              <span className="text-[10px] font-mono text-slate-500">#{vault.index}</span>
              <span className="text-base sm:text-lg font-bold font-mono my-0.5">
                {vault.isInspected || vault.isEliminated || gameState === 'won' ? vault.value : '?'}
              </span>
              
              <div className="flex gap-1 mt-0.5">
                {isLow && <span className="text-[9px] px-1 bg-emerald-500/30 text-emerald-300 rounded">L</span>}
                {isMid && <span className="text-[9px] px-1 bg-cyan-500/30 text-cyan-300 font-bold rounded">M</span>}
                {isHigh && <span className="text-[9px] px-1 bg-rose-500/30 text-rose-300 rounded">H</span>}
              </div>
            </button>
          );
        })}
      </div>

      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-950/70 rounded-xl border border-slate-800 mb-6">
        <div className="flex items-center gap-2 text-sm text-slate-300">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>{message}</span>
        </div>

        {gameState === 'playing' && mid >= 0 && (
          <button
            onClick={() => inspectIndex(mid)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-cyan-500/20 transition transform active:scale-95"
          >
            Probe Mid Point (#{mid}) <ArrowRight className="w-4 h-4" />
          </button>
        )}

        {gameState === 'won' && (
          <div className="flex items-center gap-2 text-emerald-400 font-bold">
            <Award className="w-5 h-5" />
            <span>Optimal search achieved! You saved {arraySize - attempts} redundant inspections!</span>
          </div>
        )}
      </div>

      {/* Algorithmic Log */}
      <div>
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Algorithm Execution Log</h4>
        <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 max-h-32 overflow-y-auto font-mono text-xs text-slate-300 space-y-1">
          {log.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="text-slate-600">[{log.length - idx}]</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
