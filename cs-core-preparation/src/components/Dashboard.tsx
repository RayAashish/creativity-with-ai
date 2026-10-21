import React, { useState } from 'react';
import {
  Sparkles,
  Timer,
  BookOpen,
  CheckCircle2,
  Bookmark,
  Layers,
  ArrowRight,
  TrendingUp,
  Award,
  Zap,
  Target,
  BarChart3,
  HelpCircle
} from 'lucide-react';
import { SUBJECTS } from '../data/subjects';
import { SubjectId, Question } from '../types';
import { getSubjectStats, ALL_QUESTIONS } from '../data/questions';
import { useProgress } from '../context/ProgressContext';
import { sounds } from '../utils/soundEffects';
import confetti from 'canvas-confetti';

interface DashboardProps {
  onStartFullMock: () => void;
  onStartPresetMock: (preset: 'tcs_nqt' | 'gate_cs') => void;
  onSelectSubjectPractice: (subjectId: SubjectId) => void;
  onSelectSubjectLearning: (subjectId: SubjectId) => void;
  onSelectSubjectMock: (subjectId: SubjectId) => void;
  onNavigateToTab: (tab: 'learning' | 'practice' | 'mock' | 'flashcards' | 'mistakes') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onStartFullMock,
  onStartPresetMock,
  onSelectSubjectPractice,
  onSelectSubjectLearning,
  onSelectSubjectMock,
  onNavigateToTab
}) => {
  const { progress, recordQuestionAttempt } = useProgress();

  // Pick deterministic Daily Question based on today's date
  const [dailyQuestion] = useState<Question>(() => {
    const today = new Date().toISOString().split('T')[0];
    const hash = today.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return ALL_QUESTIONS[hash % ALL_QUESTIONS.length];
  });

  const [selectedDailyOption, setSelectedDailyOption] = useState<number | null>(null);
  const [hasAnsweredDaily, setHasAnsweredDaily] = useState(false);

  const handleAnswerDaily = (idx: number) => {
    if (hasAnsweredDaily) return;
    setSelectedDailyOption(idx);
    setHasAnsweredDaily(true);
    const isCorrect = idx === dailyQuestion.correctAnswer;
    if (isCorrect) {
      sounds.playCorrect();
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
    } else {
      sounds.playIncorrect();
    }
    recordQuestionAttempt(dailyQuestion.id, isCorrect, idx);
  };

  const accuracy = progress.totalQuestionsSolved > 0
    ? Math.round((progress.totalCorrect / progress.totalQuestionsSolved) * 100)
    : 0;

  return (
    <div className="space-y-10 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white p-6 sm:p-10 shadow-2xl border border-indigo-800/40">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-80 h-80 rounded-full bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-pink-300 mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Complete CS Engineering & Placement Mastery Platform</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight text-white mb-4">
            Crack Core CS Interviews,{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-pink-400 to-amber-300 bg-clip-text text-transparent">
              TCS NQT & GATE
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-8 max-w-2xl">
            Over <strong>630+</strong> hand-crafted questions across DSA, Networks, OOPs, DBMS, Operating Systems, and Aptitude. Dive into concept cheatsheets, challenge timed full-length mocks, and diagnose your focus areas.
          </p>

          {/* Quick Mock Launchers */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                sounds.playClick();
                onStartFullMock();
              }}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 font-bold text-sm shadow-lg shadow-indigo-500/30 transform hover:-translate-y-0.5 transition-all"
            >
              <Timer className="w-4 h-4" />
              <span>Full Balanced CS Mock (30 Qs)</span>
            </button>

            <button
              onClick={() => {
                sounds.playClick();
                onStartPresetMock('tcs_nqt');
              }}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 font-semibold text-sm backdrop-blur-md transition-all"
            >
              <Award className="w-4 h-4 text-cyan-400" />
              <span>TCS NQT / Campus Special</span>
            </button>

            <button
              onClick={() => {
                sounds.playClick();
                onStartPresetMock('gate_cs');
              }}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 font-semibold text-sm backdrop-blur-md transition-all"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>GATE High-Yield Challenge</span>
            </button>
          </div>
        </div>

        {/* Hero Mini Stats Ribbon */}
        <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white">630+</div>
            <div className="text-xs text-slate-400">Total Questions</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-cyan-400">6</div>
            <div className="text-xs text-slate-400">Core Subjects</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-pink-400">3 Levels</div>
            <div className="text-xs text-slate-400">Concept • NQT • GATE</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">100%</div>
            <div className="text-xs text-slate-400">Explanations & Formulas</div>
          </div>
        </div>
      </section>

      {/* User Stats & Daily Challenge Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Progress Card */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-500" />
                <span>Your Prep Momentum</span>
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                Active
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="text-xs text-slate-500 mb-1">Questions Solved</div>
                <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                  {progress.totalQuestionsSolved}
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="text-xs text-slate-500 mb-1">Overall Accuracy</div>
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  {accuracy}%
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="text-xs text-slate-500 mb-1">Tests Completed</div>
                <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                  {progress.testHistory.length}
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="text-xs text-slate-500 mb-1">Mistakes to Fix</div>
                <div className="text-2xl font-bold text-rose-500">
                  {progress.mistakeNotebook.length}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <button
              onClick={() => onNavigateToTab('mistakes')}
              className="font-semibold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Review Mistake Notebook</span>
            </button>
            <button
              onClick={() => onNavigateToTab('flashcards')}
              className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Flashcard Deck</span>
            </button>
          </div>
        </div>

        {/* Daily CS Challenge Card */}
        <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-pink-100 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400">
                  <Target className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
                  Question of the Day
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full uppercase bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                  {dailyQuestion.subject.toUpperCase()}
                </span>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                  dailyQuestion.difficulty === 'hard'
                    ? 'bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-900'
                    : dailyQuestion.difficulty === 'medium'
                    ? 'bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-950/40 dark:border-amber-900'
                    : 'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-900'
                }`}>
                  {dailyQuestion.difficulty}
                </span>
              </div>
            </div>

            <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-4 leading-relaxed">
              {dailyQuestion.question}
            </p>

            {/* Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
              {dailyQuestion.options.map((opt, idx) => {
                let btnStyle = 'border-slate-200 dark:border-slate-800 hover:border-indigo-500 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-200';
                if (hasAnsweredDaily) {
                  if (idx === dailyQuestion.correctAnswer) {
                    btnStyle = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 font-bold';
                  } else if (idx === selectedDailyOption) {
                    btnStyle = 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={hasAnsweredDaily}
                    onClick={() => handleAnswerDaily(idx)}
                    className={`text-left p-3 rounded-xl border text-xs sm:text-sm transition-all flex items-start gap-2.5 ${btnStyle}`}
                  >
                    <span className="w-5 h-5 rounded-md bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="leading-snug">{opt}</span>
                  </button>
                );
              })}
            </div>

            {/* Explanation box on reveal */}
            {hasAnsweredDaily && (
              <div className="mt-3 p-3.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 text-xs leading-relaxed animate-in fade-in">
                <span className="font-bold text-indigo-700 dark:text-indigo-300 block mb-1">
                  💡 Explanation:
                </span>
                <p className="text-slate-700 dark:text-slate-300">
                  {dailyQuestion.explanation}
                </p>
                {dailyQuestion.keyFormulaOrNote && (
                  <div className="mt-2 text-[11px] font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-100/50 dark:bg-indigo-900/40 p-1.5 rounded">
                    📌 {dailyQuestion.keyFormulaOrNote}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>Topic: {dailyQuestion.topic}</span>
            <span>Refreshes daily at midnight</span>
          </div>
        </div>
      </section>

      {/* 6 Subjects Learning & Practice Matrix */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Subject Mastery Arenas
            </h2>
            <p className="text-sm text-slate-500">
              Pick a subject to explore concepts, solve 100+ questions, or launch a focused mock test.
            </p>
          </div>
          <button
            onClick={() => onNavigateToTab('practice')}
            className="self-start sm:self-auto flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            <span>Explore All 630+ Questions</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SUBJECTS.map(subj => {
            const stats = getSubjectStats(subj.id);
            return (
              <div
                key={subj.id}
                className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-xl hover:border-indigo-500/50 transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${subj.gradient} flex items-center justify-center text-white shadow-md font-bold text-lg`}>
                        {subj.shortName[0]}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-base text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {subj.name}
                        </h3>
                        <span className="text-xs text-slate-500 font-medium">
                          {stats.total} Questions Available
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 line-clamp-2 leading-relaxed">
                    {subj.tagline}
                  </p>

                  {/* Difficulty Badges */}
                  <div className="flex items-center gap-1.5 mb-4 text-[11px]">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-medium border border-emerald-200 dark:border-emerald-800">
                      Easy: {stats.easy}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 font-medium border border-amber-200 dark:border-amber-800">
                      Medium: {stats.medium}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 font-medium border border-rose-200 dark:border-rose-800">
                      GATE: {stats.hard}
                    </span>
                  </div>

                  {/* Featured Topics Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {subj.featuredTopics.slice(0, 3).map((top, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                      >
                        {top}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Subject Actions */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-2 text-xs font-semibold">
                  <button
                    onClick={() => {
                      sounds.playClick();
                      onSelectSubjectLearning(subj.id);
                    }}
                    className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1 transition"
                    title="Read Concept Notes"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Notes</span>
                  </button>

                  <button
                    onClick={() => {
                      sounds.playClick();
                      onSelectSubjectPractice(subj.id);
                    }}
                    className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 flex items-center justify-center gap-1 transition font-bold"
                    title="Practice Questions"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Practice</span>
                  </button>

                  <button
                    onClick={() => {
                      sounds.playClick();
                      onSelectSubjectMock(subj.id);
                    }}
                    className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 flex items-center justify-center gap-1 transition font-bold"
                    title="Start Timed Subject Mock"
                  >
                    <Timer className="w-3.5 h-3.5" />
                    <span>Mock</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Feature Highlights & Study Arsenal */}
      <section className="rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-6 sm:p-8">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          Your Built-in Study Arsenal
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mb-6">
          Everything designed to make your preparation seamless and effective.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 w-fit mb-3">
              <Bookmark className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 mb-1">
              Mistake Notebook
            </h3>
            <p className="text-xs text-slate-500">
              Any question you miss in mock tests is auto-saved so you can re-test yourself until you achieve 100% mastery.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 w-fit mb-3">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 mb-1">
              Focus Areas Analytics
            </h3>
            <p className="text-xs text-slate-500">
              After every test, our analytics advisor detects weak subtopics (accuracy &lt; 60%) and recommends targeted revision.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="p-2 rounded-lg bg-pink-100 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 w-fit mb-3">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 mb-1">
              3D Flashcards
            </h3>
            <p className="text-xs text-slate-500">
              Rapid memory revision for Big-O bounds, TCP handshakes, normal form rules, and formula shortcuts.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 w-fit mb-3">
              <HelpCircle className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 mb-1">
              GATE Calc & Scratchpad
            </h3>
            <p className="text-xs text-slate-500">
              Simulate actual GATE screen conditions with an on-screen scientific calculator and persistent rough notepad.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
