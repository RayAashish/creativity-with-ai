import React, { useState, useEffect } from 'react';
import { Layers, Shield, Play, RotateCcw, Check, Sparkles, AlertCircle, ArrowUp } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Asteroid {
  id: number;
  height: number;
  nge: number | null;
}

export const MonotonicStackDefenseGame: React.FC = () => {
  const [asteroids, setAsteroids] = useState<Asteroid[]>([]);
  const [stack, setStack] = useState<number[]>([]); // stores asteroid values
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [statusText, setStatusText] = useState<string>('');

  const initGame = () => {
    // Generate 7 asteroid heights
    const raw = [3, 1, 5, 2, 7, 4, 6];
    setAsteroids(raw.map((h, i) => ({ id: i, height: h, nge: null })));
    setStack([]);
    setCurrentIndex(0);
    setScore(0);
    setIsGameOver(false);
    setStatusText('Process incoming asteroids left to right to build the monotonic stack & find Next Greater Elements!');
  };

  useEffect(() => {
    initGame();
  }, []);

  const currentAsteroid = asteroids[currentIndex];

  const handlePop = () => {
    if (stack.length === 0) {
      setStatusText('Stack is already empty! Nothing to pop.');
      return;
    }
    const top = stack[stack.length - 1];
    if (currentAsteroid && top <= currentAsteroid.height) {
      // Correct pop
      setStack(prev => prev.slice(0, prev.length - 1));
      setScore(prev => prev + 10);
      setStatusText(`✅ Popped ${top} because it is <= incoming ${currentAsteroid.height}. Monotonic invariant maintained!`);
    } else {
      setStatusText(`⚠️ Careful: top element (${top}) is > incoming (${currentAsteroid?.height}). Do NOT pop larger elements!`);
    }
  };

  const handlePush = () => {
    if (!currentAsteroid) return;

    const top = stack[stack.length - 1];
    if (stack.length > 0 && top <= currentAsteroid.height) {
      setStatusText(`❌ Invariant violation! Stack top (${top}) is <= incoming (${currentAsteroid.height}). You must pop smaller elements first!`);
      return;
    }

    // Set NGE for current asteroid if applicable, or we're building stack
    setStack(prev => [...prev, currentAsteroid.height]);
    setScore(prev => prev + 15);

    const nextIdx = currentIndex + 1;
    setCurrentIndex(nextIdx);

    if (nextIdx >= asteroids.length) {
      setIsGameOver(true);
      setStatusText('🎉 Congratulations! Monotonic stack fully resolved in linear O(N) time!');
      try {
        confetti({ particleCount: 80, spread: 60 });
      } catch (e) {
        console.error(e);
      }
    } else {
      setStatusText(`✅ Pushed ${currentAsteroid.height} into stack. Next asteroid approaching: ${asteroids[nextIdx].height}`);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-500/20 text-amber-400 rounded-lg">
              <Layers className="w-5 h-5" />
            </span>
            <h3 className="text-xl font-bold text-white">Monotonic Stack: Asteroid Defense</h3>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Maintain a strictly decreasing stack to solve Next Greater Element in amortized O(N) time!
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700/60 text-center">
            <div className="text-xs text-slate-400 uppercase tracking-wider">Score</div>
            <div className="text-lg font-black text-amber-400">{score} pts</div>
          </div>
          <button
            onClick={initGame}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-xl border border-slate-700 transition"
          >
            <RotateCcw className="w-4 h-4" /> Reset
          </button>
        </div>
      </div>

      {/* Battlefield & Visual Stack Display */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Asteroids Stream */}
        <div className="md:col-span-2 bg-slate-950/80 p-5 rounded-2xl border border-slate-800">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
            Incoming Asteroid Stream
          </h4>
          <div className="flex items-end gap-3 h-48 border-b border-slate-700 pb-2 px-2 overflow-x-auto">
            {asteroids.map((ast, idx) => {
              const isCurrent = idx === currentIndex && !isGameOver;
              const isProcessed = idx < currentIndex;
              const heightPx = Math.max(ast.height * 18, 30);

              let barBg = 'bg-slate-800 border-slate-700 text-slate-400';
              if (isCurrent) {
                barBg = 'bg-amber-500/30 border-amber-400 text-amber-300 ring-2 ring-amber-400 animate-pulse';
              } else if (isProcessed) {
                barBg = 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400';
              }

              return (
                <div key={ast.id} className="flex-1 flex flex-col items-center justify-end">
                  {isCurrent && (
                    <span className="text-[10px] font-bold text-amber-400 mb-1 flex items-center">
                      <ArrowUp className="w-3 h-3 animate-bounce" /> Current
                    </span>
                  )}
                  <div
                    style={{ height: `${heightPx}px` }}
                    className={`w-full max-w-[48px] rounded-t-xl border flex flex-col items-center justify-center font-mono font-bold transition-all duration-200 ${barBg}`}
                  >
                    <span>{ast.height}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 font-mono">[{idx}]</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Laser Monotonic Stack Container */}
        <div className="bg-slate-950/90 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Laser Stack (LIFO)
              </h4>
              <span className="text-[10px] px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded font-mono">
                Top at top
              </span>
            </div>

            <div className="flex flex-col-reverse gap-1.5 min-h-[140px] bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
              {stack.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-600 italic">
                  Stack is Empty
                </div>
              ) : (
                stack.map((val, i) => (
                  <div
                    key={i}
                    className={`p-2 rounded-lg text-center font-mono font-bold text-sm border ${
                      i === stack.length - 1
                        ? 'bg-amber-500/30 border-amber-400 text-amber-200'
                        : 'bg-slate-800 border-slate-700 text-slate-300'
                    }`}
                  >
                    Asteroid {val} {i === stack.length - 1 && '⬅ TOP'}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={handlePop}
              disabled={stack.length === 0 || isGameOver}
              className="flex-1 py-2 px-3 bg-rose-600/30 hover:bg-rose-600/50 text-rose-300 border border-rose-500/40 rounded-xl text-xs font-bold transition disabled:opacity-30"
            >
              Pop Top
            </button>
            <button
              onClick={handlePush}
              disabled={isGameOver || !currentAsteroid}
              className="flex-1 py-2 px-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-amber-500/20 transition disabled:opacity-30"
            >
              Push Asteroid
            </button>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 text-sm text-slate-300 flex items-center gap-3">
        <Sparkles className="w-5 h-5 text-amber-400 flex-shrink-0" />
        <span>{statusText}</span>
      </div>
    </div>
  );
};
