import React, { useState } from 'react';
import {
  Target,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Filter
} from 'lucide-react';
import { patternDrills } from '../data/drillsData';
import { PatternDrill } from '../types';

export const PatternTrainerView: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [filterPattern, setFilterPattern] = useState<string>('All');

  const activeDrills = filterPattern === 'All' 
    ? patternDrills 
    : patternDrills.filter(d => d.correctSlug === filterPattern);

  const currentDrill: PatternDrill = activeDrills[currentIndex % activeDrills.length] || patternDrills[0];

  const handleSelectOption = (opt: string) => {
    if (selectedOption !== null) return; // Prevent double select
    setSelectedOption(opt);
    if (opt === currentDrill.correctPattern) {
      setScore(s => s + 1);
      setStreak(st => st + 1);
    } else {
      setStreak(0);
    }
  };

  const handleNext = () => {
    setSelectedOption(null);
    setCurrentIndex(i => (i + 1) % activeDrills.length);
  };

  const handleReset = () => {
    setSelectedOption(null);
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
  };

  const isAnswered = selectedOption !== null;
  const isCorrect = selectedOption === currentDrill.correctPattern;

  return (
    <div className="space-y-6 max-w-3xl">
      
      {/* Title */}
      <div>
        <div className="flex items-center gap-2 text-xs font-mono text-accent dark:text-accent-dark uppercase tracking-wider mb-1">
          <Target size={14} />
          <span>Rapid Drill Engine</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Story-to-Pattern Recognition Trainer (216 Items)
        </h1>
        <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 max-w-2xl leading-relaxed">
          In the Infosys exam, you lose the most time translating stories into algorithms. Train your instant instinct: read the narrative snippet and identify the underlying algorithm and constraint clue within 15 seconds.
        </p>
      </div>

      {/* Stats Bar */}
      <div className="p-3.5 rounded-sm border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-neutral-400">Drill: </span>
            <span className="font-bold text-neutral-900 dark:text-white">{(currentIndex % activeDrills.length) + 1} / {activeDrills.length}</span>
          </div>
          <div>
            <span className="text-neutral-400">Score: </span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">{score}</span>
          </div>
          <div>
            <span className="text-neutral-400">Streak: </span>
            <span className="font-bold text-accent dark:text-accent-dark">{streak} 🔥</span>
          </div>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-1 text-[11px] text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
        >
          <RotateCcw size={12} />
          <span>Reset</span>
        </button>
      </div>

      {/* Drill Flashcard */}
      <div className="p-5 rounded-sm border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-5 shadow-sm">
        
        {/* Scenario Box */}
        <div className="space-y-2">
          <div className="text-[11px] font-mono text-neutral-400 uppercase tracking-wide">
            Narrative Scenario Clue:
          </div>
          <p className="text-sm font-serif italic text-neutral-900 dark:text-neutral-100 leading-relaxed bg-paper-100/60 dark:bg-neutral-800/40 p-4 rounded-sm border border-neutral-200 dark:border-neutral-700/60">
            "{currentDrill.scenario}"
          </p>
        </div>

        {/* Constraint clue tag */}
        <div className="flex items-center gap-2 text-xs font-mono text-neutral-500">
          <span className="text-neutral-400">Constraint Clue:</span>
          <code className="px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-bold">
            {currentDrill.constraintClue}
          </code>
        </div>

        {/* 4 Multiple Choice Options */}
        <div className="space-y-2">
          <div className="text-xs font-mono font-bold text-neutral-700 dark:text-neutral-300">
            Identify the optimal algorithmic pattern:
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {currentDrill.options.map((opt, oIdx) => {
              let btnStyle = 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 bg-paper-50 dark:bg-neutral-800/50 text-neutral-800 dark:text-neutral-200';
              
              if (isAnswered) {
                if (opt === currentDrill.correctPattern) {
                  btnStyle = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 font-bold';
                } else if (opt === selectedOption) {
                  btnStyle = 'border-rose-500 bg-rose-50 dark:bg-rose-950/60 text-rose-900 dark:text-rose-200';
                } else {
                  btnStyle = 'opacity-40 border-neutral-200 dark:border-neutral-800';
                }
              }

              return (
                <button
                  key={oIdx}
                  onClick={() => handleSelectOption(opt)}
                  disabled={isAnswered}
                  className={`p-3 text-left rounded-sm border text-xs transition-all flex items-center justify-between ${btnStyle}`}
                >
                  <span>{opt}</span>
                  {isAnswered && opt === currentDrill.correctPattern && (
                    <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400" />
                  )}
                  {isAnswered && opt === selectedOption && opt !== currentDrill.correctPattern && (
                    <XCircle size={14} className="text-rose-600" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Feedback Explanation Drawer */}
        {isAnswered && (
          <div className={`p-4 rounded-sm border text-xs space-y-2 ${
            isCorrect 
              ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
              : 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
          }`}>
            <div className="font-bold flex items-center gap-2">
              {isCorrect ? <CheckCircle2 size={15} /> : <XCircle size={15} />}
              <span>{isCorrect ? 'Correct Recognition!' : 'Incorrect Pattern Choice'}</span>
            </div>

            <p className="leading-relaxed">
              {currentDrill.explanation}
            </p>

            <div className="pt-2 border-t border-black/10 dark:border-white/10 font-mono text-[11px]">
              <strong>Key Recognition Rule: </strong>
              <span>{currentDrill.keyInsight}</span>
            </div>

            <button
              onClick={handleNext}
              className="mt-2 w-full py-2 px-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold rounded-sm flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Next Scenario Drill</span>
              <ArrowRight size={13} />
            </button>
          </div>
        )}

      </div>

    </div>
  );
};
