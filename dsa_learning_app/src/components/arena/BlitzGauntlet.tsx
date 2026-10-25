import React, { useState, useEffect, useRef } from 'react';
import { 
  Timer, 
  Flame, 
  Trophy, 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Zap, 
  AlertCircle,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface BlitzQuestion {
  id: string;
  title: string;
  prompt: string;
  constraints: string;
  correctPattern: string;
  correctComplexity: string;
  patternOptions: string[];
  complexityOptions: string[];
  explanation: string;
  archetypeId: string;
}

const BLITZ_QUESTIONS: BlitzQuestion[] = [
  {
    id: 'bz-1',
    title: 'Daily Temperatures',
    prompt: 'Given daily temperatures [73, 74, 75, 71, 69, 72, 76, 73], for each day find the number of days until a warmer temperature occurs.',
    constraints: 'N <= 10^5, temperatures[i] <= 100. Must solve in O(N) time.',
    correctPattern: 'Monotonic Stack',
    correctComplexity: 'O(N)',
    patternOptions: ['Monotonic Stack', 'Sliding Window', 'Two Pointers', 'Binary Search'],
    complexityOptions: ['O(N)', 'O(N²)', 'O(N log N)', 'O(1)'],
    explanation: 'We need the "next greater element" for each position. A decreasing monotonic stack resolves nearest peaks in a single linear pass.',
    archetypeId: 'vault-daily-temperatures'
  },
  {
    id: 'bz-2',
    title: 'Longest Substring Without Repeating Characters',
    prompt: 'Find length of the longest contiguous substring containing only unique characters.',
    constraints: 'N <= 5 * 10^4. Input consists of English letters, digits, and symbols.',
    correctPattern: 'Sliding Window',
    correctComplexity: 'O(N)',
    patternOptions: ['Sliding Window', 'Dynamic Programming', 'Monotonic Stack', 'Prefix Sums'],
    complexityOptions: ['O(N)', 'O(N²)', 'O(2^N)', 'O(N log N)'],
    explanation: 'The request for contiguous substring with uniqueness is the textbook signature for a Sliding Window with a hash frequency set.',
    archetypeId: 'vault-longest-substring-without-repeat'
  },
  {
    id: 'bz-3',
    title: 'Course Schedule (Prerequisite Deadlock)',
    prompt: 'Given numCourses and prerequisite pairs [a, b], determine if all courses can be finished without circular dependencies.',
    constraints: 'V <= 2000, E <= 5000.',
    correctPattern: 'Topological Sort',
    correctComplexity: 'O(V + E)',
    patternOptions: ['Topological Sort', 'Dijkstra Shortest Path', 'Union-Find', 'Two Pointers'],
    complexityOptions: ['O(V + E)', 'O(V²)', 'O(V * E)', 'O(V log V)'],
    explanation: 'Prerequisites form a directed graph. Finishing courses corresponds to verifying the graph is a Directed Acyclic Graph (DAG) via Kahn\'s algorithm.',
    archetypeId: 'vault-course-schedule'
  },
  {
    id: 'bz-4',
    title: 'Trapping Rain Water',
    prompt: 'Given bar heights on elevation map, calculate total volume of rainwater trapped between peaks.',
    constraints: 'N <= 2 * 10^4, height[i] <= 10^5. Must achieve O(1) auxiliary space.',
    correctPattern: 'Two Pointers',
    correctComplexity: 'O(N)',
    patternOptions: ['Two Pointers', 'Breadth-First Search', 'Segment Tree', 'Backtracking'],
    complexityOptions: ['O(N)', 'O(N log N)', 'O(N²)', 'O(1)'],
    explanation: 'Two pointers converging from opposite ends with leftMax and rightMax bounds track the lower bottleneck in O(1) auxiliary space.',
    archetypeId: 'vault-trapping-rain-water'
  },
  {
    id: 'bz-5',
    title: 'Coin Change (Fewest Coins)',
    prompt: 'You have coins of denominations [1, 2, 5] and an amount 11. Find the fewest number of coins needed to make up that amount.',
    constraints: 'amount <= 10^4, coins.length <= 12.',
    correctPattern: 'Unbounded Knapsack DP',
    correctComplexity: 'O(Amount * Coins)',
    patternOptions: ['Unbounded Knapsack DP', 'Greedy Choice', 'Divide & Conquer', 'Two Pointers'],
    complexityOptions: ['O(Amount * Coins)', 'O(Coins log Coins)', 'O(2^Amount)', 'O(Amount)'],
    explanation: 'Greedy fails for arbitrary coin systems (e.g. coins [1, 3, 4] for amount 6 -> greedy picks 4,1,1=3 coins, optimal is 3,3=2 coins). Dynamic Programming is required.',
    archetypeId: 'vault-coin-change'
  },
  {
    id: 'bz-6',
    title: 'LRU Cache Design',
    prompt: 'Design a data structure with O(1) average time complexity for both get(key) and put(key, value) operations.',
    constraints: 'capacity <= 3000, operations <= 2 * 10^5.',
    correctPattern: 'Hash Map + Doubly Linked List',
    correctComplexity: 'O(1) per op',
    patternOptions: ['Hash Map + Doubly Linked List', 'Array + Binary Search', 'Binary Search Tree', 'Min-Heap Priority Queue'],
    complexityOptions: ['O(1) per op', 'O(log N) per op', 'O(N) per op', 'O(N log N)'],
    explanation: 'Hash Map gives O(1) lookups. Doubly Linked List enables O(1) deletion and insertion at the most-recently-used head without shifting elements.',
    archetypeId: 'vault-lru-cache'
  },
  {
    id: 'bz-7',
    title: 'Single Number',
    prompt: 'Every element in array appears twice except for one unique element. Find that single number in O(1) space.',
    constraints: 'N <= 3 * 10^4, elements can be negative.',
    correctPattern: 'Bitwise XOR',
    correctComplexity: 'O(N)',
    patternOptions: ['Bitwise XOR', 'Binary Search', 'Hash Set', 'Sorting'],
    complexityOptions: ['O(N)', 'O(N log N)', 'O(1)', 'O(N²)'],
    explanation: 'XOR has algebraic properties: a ^ a = 0 and a ^ 0 = a. XORing all elements cancels duplicates leaving the unique element in O(1) memory.',
    archetypeId: 'vault-single-number'
  },
  {
    id: 'bz-8',
    title: 'Merge Intervals',
    prompt: 'Given overlapping ranges [[1,3],[2,6],[8,10],[15,18]], consolidate all overlapping intervals into non-overlapping spans.',
    constraints: 'N <= 10^4. Ranges are unsorted.',
    correctPattern: 'Sort by Start + Linear Merge',
    correctComplexity: 'O(N log N)',
    patternOptions: ['Sort by Start + Linear Merge', 'Interval Heap', 'Two Pointers Inward', 'Graph BFS'],
    complexityOptions: ['O(N log N)', 'O(N²)', 'O(N)', 'O(2^N)'],
    explanation: 'Sorting intervals by their starting times orders them monotonically. A single pass merges intervals whenever curr.start <= prev.end.',
    archetypeId: 'vault-merge-intervals'
  }
];

interface BlitzGauntletProps {
  onOpenArchetype: (questionId: string) => void;
}

export const BlitzGauntlet: React.FC<BlitzGauntletProps> = ({ onOpenArchetype }) => {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [maxStreak, setMaxStreak] = useState<number>(0);
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);
  const [highScore, setHighScore] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem('akr-dsa-blitz-high-score') || '0', 10);
    } catch (e) {
      return 0;
    }
  });

  const timerRef = useRef<number | null>(null);

  const currentQ = BLITZ_QUESTIONS[currentIndex % BLITZ_QUESTIONS.length];

  const startGame = () => {
    setGameState('playing');
    setTimeLeft(60);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setCurrentIndex(0);
    setSelectedPattern(null);
    setFeedback(null);
  };

  useEffect(() => {
    if (gameState === 'playing') {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setGameState('gameover');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState]);

  useEffect(() => {
    if (gameState === 'gameover') {
      if (score > highScore) {
        setHighScore(score);
        try {
          localStorage.setItem('akr-dsa-blitz-high-score', score.toString());
        } catch (e) {
          // ignore
        }
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }
  }, [gameState, score, highScore]);

  const handleSelectPattern = (option: string) => {
    if (feedback !== null || gameState !== 'playing') return;

    setSelectedPattern(option);
    const isCorrect = option === currentQ.correctPattern;

    if (isCorrect) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > maxStreak) setMaxStreak(newStreak);

      const multiplier = newStreak >= 5 ? 3 : newStreak >= 3 ? 2 : 1;
      const pointsAdded = 100 * multiplier;
      setScore(s => s + pointsAdded);

      setFeedback({
        isCorrect: true,
        message: `Correct! +${pointsAdded} pts (${multiplier}x combo). ${currentQ.explanation}`
      });

      if (newStreak >= 3) {
        confetti({
          particleCount: 25,
          spread: 45,
          origin: { y: 0.7 }
        });
      }

      setTimeout(() => {
        setSelectedPattern(null);
        setFeedback(null);
        setCurrentIndex(i => i + 1);
      }, 1400);
    } else {
      setStreak(0);
      setTimeLeft(t => Math.max(0, t - 3)); // 3 second penalty
      setFeedback({
        isCorrect: false,
        message: `Incorrect! Correct pattern was: ${currentQ.correctPattern}. -3s penalty. ${currentQ.explanation}`
      });

      setTimeout(() => {
        setSelectedPattern(null);
        setFeedback(null);
        setCurrentIndex(i => i + 1);
      }, 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Crazy Mode
            </span>
            <span className="text-xs font-mono text-[var(--text-muted)]">
              Real-Time Reflex Training
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            60-Second Pattern Blitz Gauntlet
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 max-w-xl">
            Top competitive programmers identify algorithm patterns in under 15 seconds. Test your intuition against real FAANG problem prompts with streak multipliers!
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[10px] font-mono uppercase text-[var(--text-muted)]">All-Time High</div>
            <div className="text-lg font-bold font-mono text-[var(--text-primary)]">{highScore} pts</div>
          </div>
          {gameState === 'idle' && (
            <button
              type="button"
              onClick={startGame}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--text-primary)] text-[var(--text-inverse)] font-mono text-xs font-bold hover:opacity-90 transition active:scale-95 shadow-sm"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Launch Gauntlet</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Game Interface */}
      {gameState === 'playing' && (
        <div className="space-y-4">
          {/* HUD Bar */}
          <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Timer */}
              <div className="flex items-center gap-2">
                <Timer className={`w-5 h-5 ${timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-[var(--text-primary)]'}`} />
                <span className={`text-xl font-bold font-mono ${timeLeft <= 10 ? 'text-red-400 font-extrabold' : 'text-[var(--text-primary)]'}`}>
                  {timeLeft}s
                </span>
              </div>

              {/* Score */}
              <div className="border-l border-[var(--border-subtle)] pl-4">
                <div className="text-[10px] font-mono text-[var(--text-muted)] uppercase">Score</div>
                <div className="text-lg font-bold font-mono text-[var(--text-primary)]">{score}</div>
              </div>
            </div>

            {/* Streak Multiplier */}
            <div className="flex items-center gap-2">
              <Flame className={`w-5 h-5 ${streak >= 3 ? 'text-amber-400 fill-amber-400 animate-bounce' : 'text-[var(--text-muted)]'}`} />
              <div className="text-right">
                <div className="text-[10px] font-mono text-[var(--text-muted)] uppercase">Streak</div>
                <div className="text-sm font-bold font-mono text-[var(--text-primary)]">
                  {streak}x {streak >= 5 ? '🔥 GODLIKE' : streak >= 3 ? '⚡ RAMPAGE' : ''}
                </div>
              </div>
            </div>
          </div>

          {/* Question Card */}
          <div className="p-6 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-[var(--text-muted)]">
                Challenge #{currentIndex + 1}
              </span>
              <span className="text-xs font-mono font-bold text-[var(--text-primary)]">
                {currentQ.title}
              </span>
            </div>

            <div className="p-4 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-subtle)]">
              <p className="text-sm sm:text-base font-medium text-[var(--text-primary)] leading-relaxed">
                "{currentQ.prompt}"
              </p>
              <div className="mt-2 text-xs font-mono text-[var(--text-muted)]">
                Constraints: {currentQ.constraints}
              </div>
            </div>

            {/* Prompt */}
            <div className="text-xs font-mono font-semibold text-[var(--text-muted)] uppercase tracking-wider">
              Which algorithmic pattern solves this optimally?
            </div>

            {/* 4 Choices */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentQ.patternOptions.map((opt) => {
                const isSelected = selectedPattern === opt;
                let btnStyle = 'bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-[var(--border-active)]';

                if (feedback) {
                  if (opt === currentQ.correctPattern) {
                    btnStyle = 'bg-emerald-500/10 border-emerald-500 text-emerald-400 font-bold';
                  } else if (isSelected) {
                    btnStyle = 'bg-red-500/10 border-red-500 text-red-400 line-through';
                  } else {
                    btnStyle = 'opacity-40 border-[var(--border-subtle)] text-[var(--text-muted)]';
                  }
                }

                return (
                  <button
                    key={opt}
                    type="button"
                    disabled={feedback !== null}
                    onClick={() => handleSelectPattern(opt)}
                    className={`p-4 rounded-xl border text-left transition flex items-center justify-between text-xs sm:text-sm font-mono font-semibold ${btnStyle}`}
                  >
                    <span>{opt}</span>
                    {feedback && opt === currentQ.correctPattern && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    )}
                    {feedback && isSelected && opt !== currentQ.correctPattern && (
                      <XCircle className="w-4 h-4 text-red-400" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Feedback Message */}
            {feedback && (
              <div className={`p-3.5 rounded-lg border text-xs leading-relaxed animate-fade-in ${
                feedback.isCorrect 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                  : 'bg-red-500/10 border-red-500/30 text-red-300'
              }`}>
                {feedback.message}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Game Over Screen */}
      {gameState === 'gameover' && (
        <div className="p-8 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-center space-y-6 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-center justify-center mx-auto text-amber-400">
            <Trophy className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
              Gauntlet Complete!
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
              Your algorithmic pattern reflex evaluation:
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 p-4 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-subtle)] font-mono">
            <div>
              <div className="text-[10px] uppercase text-[var(--text-muted)]">Final Score</div>
              <div className="text-xl font-bold text-[var(--text-primary)]">{score}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase text-[var(--text-muted)]">Max Streak</div>
              <div className="text-xl font-bold text-amber-400">{maxStreak}x</div>
            </div>
            <div>
              <div className="text-[10px] uppercase text-[var(--text-muted)]">Completed</div>
              <div className="text-xl font-bold text-[var(--text-primary)]">{currentIndex}</div>
            </div>
          </div>

          <button
            type="button"
            onClick={startGame}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-[var(--text-primary)] text-[var(--text-inverse)] font-mono text-xs font-bold hover:opacity-90 transition"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Again</span>
          </button>
        </div>
      )}

      {/* Idle / Rules Screen */}
      {gameState === 'idle' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
            <div className="w-8 h-8 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-center justify-center mb-3 text-[var(--text-primary)]">
              <Timer className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-[var(--text-primary)] mb-1">60 Seconds on Clock</h4>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Every round challenges you with a new interview problem. Correct answers award 100+ points; wrong answers trigger a 3-second time penalty!
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
            <div className="w-8 h-8 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-center justify-center mb-3 text-amber-400">
              <Flame className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-[var(--text-primary)] mb-1">Streak Combo Multipliers</h4>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Chain consecutive correct answers to unlock 2x Rampage and 3x Godlike score multipliers.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
            <div className="w-8 h-8 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-center justify-center mb-3 text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-[var(--text-primary)] mb-1">Instant Intuition Feedback</h4>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Immediately reveals why other candidate algorithms fail and which cues give away the optimal linear or logarithmic strategy.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
