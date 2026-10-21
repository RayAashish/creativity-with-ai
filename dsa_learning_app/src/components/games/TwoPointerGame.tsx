import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, RotateCcw, Zap, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';

export const TwoPointerGame: React.FC = () => {
  const [array, setArray] = useState<number[]>([]);
  const [target, setTarget] = useState<number>(0);
  const [left, setLeft] = useState<number>(0);
  const [right, setRight] = useState<number>(0);
  const [bridgesBuilt, setBridgesBuilt] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string>('');

  const generateLevel = () => {
    const len = 10;
    const nums: number[] = [];
    let cur = Math.floor(Math.random() * 5) + 2;
    for (let i = 0; i < len; i++) {
      cur += Math.floor(Math.random() * 7) + 3;
      nums.push(cur);
    }

    const i1 = Math.floor(Math.random() * 4);
    const i2 = Math.floor(Math.random() * 4) + 5;
    const solutionTarget = nums[i1] + nums[i2];

    setArray(nums);
    setTarget(solutionTarget);
    setLeft(0);
    setRight(nums.length - 1);
    setFeedback(`Find a pair with sum ${solutionTarget} by adjusting pointers!`);
  };

  useEffect(() => {
    generateLevel();
    setBridgesBuilt(0);
    setTimeLeft(60);
    setIsGameOver(false);
  }, []);

  useEffect(() => {
    if (isGameOver || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isGameOver, timeLeft]);

  const currentSum = array.length > 0 && left < right ? array[left] + array[right] : 0;

  const moveLeftRight = () => {
    if (left + 1 < right) {
      const nextL = left + 1;
      setLeft(nextL);
      const newSum = array[nextL] + array[right];
      if (newSum === target) {
        setFeedback(`Exact Match! Sum = ${newSum}. Click 'Build Bridge' now!`);
      } else if (newSum < target) {
        setFeedback(`Sum ${newSum} is still < ${target}. Move Left rightward again.`);
      } else {
        setFeedback(`Sum ${newSum} > ${target}! Move Right pointer leftward to decrease.`);
      }
    }
  };

  const moveRightLeft = () => {
    if (right - 1 > left) {
      const nextR = right - 1;
      setRight(nextR);
      const newSum = array[left] + array[nextR];
      if (newSum === target) {
        setFeedback(`Exact Match! Sum = ${newSum}. Click 'Build Bridge' now!`);
      } else if (newSum > target) {
        setFeedback(`Sum ${newSum} is still > ${target}. Move Right leftward again.`);
      } else {
        setFeedback(`Sum ${newSum} < ${target}! Move Left rightward to increase.`);
      }
    }
  };

  const checkMatch = () => {
    if (currentSum === target) {
      try {
        confetti({ particleCount: 80, spread: 60 });
      } catch (e) {
        console.error(e);
      }
      const newBridges = bridgesBuilt + 1;
      setBridgesBuilt(newBridges);
      if (newBridges >= 5) {
        setIsGameOver(true);
        setFeedback('🏆 Canyon successfully crossed! You mastered the Two-Pointer technique!');
      } else {
        setFeedback(`🎉 Perfect! Bridge #${newBridges} built! Next challenge loading...`);
        setTimeout(() => {
          generateLevel();
        }, 1000);
      }
    } else {
      setFeedback(`❌ Mismatch! arr[${left}] + arr[${right}] = ${currentSum}, but target is ${target}.`);
    }
  };

  const restart = () => {
    setBridgesBuilt(0);
    setTimeLeft(60);
    setIsGameOver(false);
    generateLevel();
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
              <Zap className="w-5 h-5" />
            </span>
            <h3 className="text-xl font-bold text-white">Two-Pointer Canyon: Target Pair Speedrun</h3>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Build 5 bridges before time runs out using optimal inward two-pointer convergence!
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700/60 text-center">
            <div className="text-xs text-slate-400 uppercase tracking-wider">Target Sum</div>
            <div className="text-xl font-black text-cyan-400">{target}</div>
          </div>
          <div className="bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700/60 text-center">
            <div className="text-xs text-slate-400 uppercase tracking-wider">Bridges Built</div>
            <div className="text-xl font-black text-emerald-400">{bridgesBuilt} / 5</div>
          </div>
          <div className="bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700/60 text-center">
            <div className="text-xs text-slate-400 uppercase tracking-wider">Time Left</div>
            <div className={`text-xl font-black ${timeLeft < 15 ? 'text-rose-400 animate-pulse' : 'text-amber-400'}`}>
              {timeLeft}s
            </div>
          </div>
          <button
            onClick={restart}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-xl border border-slate-700 transition"
          >
            <RotateCcw className="w-4 h-4" /> Restart
          </button>
        </div>
      </div>

      <div className="relative py-6 px-4 bg-slate-950/80 rounded-2xl border border-slate-800/80 mb-6 overflow-x-auto">
        <div className="flex items-center justify-between gap-3 min-w-[600px]">
          {array.map((num, idx) => {
            const isL = idx === left;
            const isR = idx === right;
            const isMatched = currentSum === target && (isL || isR);

            let borderStyle = 'border-slate-800 bg-slate-900 text-slate-300';
            if (isMatched) {
              borderStyle = 'border-emerald-400 bg-emerald-500/20 text-emerald-300 ring-2 ring-emerald-400 animate-bounce-short';
            } else if (isL) {
              borderStyle = 'border-cyan-400 bg-cyan-500/20 text-cyan-300 ring-2 ring-cyan-400';
            } else if (isR) {
              borderStyle = 'border-purple-400 bg-purple-500/20 text-purple-300 ring-2 ring-purple-400';
            }

            return (
              <div key={idx} className="flex-1 flex flex-col items-center">
                <div className="h-6 mb-1 text-xs font-bold font-mono">
                  {isL && <span className="text-cyan-400">Pointer L ⬇</span>}
                  {isR && <span className="text-purple-400">Pointer R ⬇</span>}
                </div>

                <div
                  className={`w-full aspect-square max-w-[60px] rounded-xl flex flex-col items-center justify-center font-mono font-bold text-lg border transition-all duration-200 ${borderStyle}`}
                >
                  <span>{num}</span>
                  <span className="text-[10px] text-slate-500">[{idx}]</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-950/90 rounded-xl border border-slate-800 mb-6">
        <div className="flex items-center gap-3 font-mono text-base">
          <span className="text-cyan-400 font-bold">arr[{left}] ({array[left]})</span>
          <span className="text-slate-500">+</span>
          <span className="text-purple-400 font-bold">arr[{right}] ({array[right]})</span>
          <span className="text-slate-500">=</span>
          <span
            className={`px-3 py-1 rounded-lg font-black ${
              currentSum === target ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-slate-800 text-slate-200'
            }`}
          >
            {currentSum}
          </span>
          <span className="text-xs text-slate-400">
            {currentSum < target ? `(< Target ${target}) ➡️ Need larger sum` : currentSum > target ? `(> Target ${target}) ⬅️ Need smaller sum` : `MATCH! 🎯`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={moveLeftRight}
            disabled={left + 1 >= right || isGameOver}
            className="flex items-center gap-1.5 px-3 py-2 bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 border border-cyan-500/40 rounded-xl text-sm font-semibold transition disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Left ++ <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={moveRightLeft}
            disabled={right - 1 <= left || isGameOver}
            className="flex items-center gap-1.5 px-3 py-2 bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 border border-purple-500/40 rounded-xl text-sm font-semibold transition disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4" /> Right --
          </button>
          <button
            onClick={checkMatch}
            disabled={isGameOver}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/20 transition transform active:scale-95 disabled:opacity-40"
          >
            <CheckCircle2 className="w-4 h-4" /> Build Bridge!
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm px-4 py-3 bg-slate-800/40 rounded-xl border border-slate-700/50 text-slate-300">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>{feedback}</span>
        </div>
        <span className="text-xs text-slate-500 font-mono">Pattern: Sorted Two Pointers O(N)</span>
      </div>
    </div>
  );
};
