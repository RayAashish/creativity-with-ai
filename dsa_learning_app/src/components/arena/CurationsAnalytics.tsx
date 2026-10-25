import React, { useState, useMemo } from 'react';
import { 
  Award, 
  CheckCircle2, 
  Layers, 
  Zap, 
  TrendingUp, 
  ArrowRight, 
  Target,
  Flame,
  LayoutGrid,
  Check
} from 'lucide-react';
import { CuratedQuestion, CURATED_VAULT_QUESTIONS } from '../../data/curatedVault';
import { TOPICS } from '../../data/topics';
import { UserProgress, Topic, Difficulty } from '../../types/dsa';
import { getProblemStatus } from '../../utils/storage';

export type CuratedTrackKey = 'all' | 'striver_sde' | 'neetcode150' | 'blind75' | 'faang_top';

interface CurationsAnalyticsProps {
  progress: UserProgress;
  onSelectTrackForPractice: (track: CuratedTrackKey) => void;
}

interface TrackMeta {
  key: CuratedTrackKey;
  name: string;
  tagline: string;
  emoji: string;
  badge: string;
  color: string;
}

const TRACKS_METADATA: TrackMeta[] = [
  {
    key: 'striver_sde',
    name: "Striver's SDE Sheet",
    tagline: "Comprehensive 27-day battle-tested curriculum with all 190+ canonical problems",
    emoji: "💎",
    badge: "190+ Problems",
    color: "from-sky-500/10 to-indigo-500/10 border-sky-500/20",
  },
  {
    key: 'neetcode150',
    name: "NeetCode 150",
    tagline: "Pattern-first structured roadmap spanning all 18 algorithmic design paradigms",
    emoji: "⚡",
    badge: "155 Problems",
    color: "from-amber-500/10 to-orange-500/10 border-amber-500/20",
  },
  {
    key: 'blind75',
    name: "Blind 75",
    tagline: "The legendary, high-yield foundational core that started modern interview prep",
    emoji: "🔥",
    badge: "81 Problems",
    color: "from-emerald-500/10 to-teal-500/10 border-emerald-500/20",
  },
  {
    key: 'faang_top',
    name: "FAANG Hot Pick",
    tagline: "Highest-frequency technical interview questions from Meta, Google & Amazon",
    emoji: "🎯",
    badge: "140 Problems",
    color: "from-rose-500/10 to-pink-500/10 border-rose-500/20",
  },
  {
    key: 'all',
    name: "All Master Vault",
    tagline: "The super-vault union with zero duplicates, complete solutions & code sandboxes",
    emoji: "👑",
    badge: "261 Problems",
    color: "from-violet-500/10 to-purple-500/10 border-violet-500/20",
  },
];

export const CurationsAnalytics: React.FC<CurationsAnalyticsProps> = ({
  progress,
  onSelectTrackForPractice,
}) => {
  const [selectedTrack, setSelectedTrack] = useState<CuratedTrackKey>('striver_sde');

  // Compute stats for all tracks
  const trackStats = useMemo(() => {
    return TRACKS_METADATA.map((meta) => {
      const questions = CURATED_VAULT_QUESTIONS.filter((q) =>
        meta.key === 'all' ? true : q.curations.includes(meta.key as any)
      );

      const total = questions.length;
      let solved = 0;
      let easyTotal = 0, easySolved = 0;
      let medTotal = 0, medSolved = 0;
      let hardTotal = 0, hardSolved = 0;

      const topicCounts: Record<Topic, { total: number; solved: number }> = {
        arrays: { total: 0, solved: 0 },
        strings: { total: 0, solved: 0 },
        'linked-list': { total: 0, solved: 0 },
        'stacks-queues': { total: 0, solved: 0 },
        trees: { total: 0, solved: 0 },
        bst: { total: 0, solved: 0 },
        graphs: { total: 0, solved: 0 },
        dp: { total: 0, solved: 0 },
        'heaps-hashing': { total: 0, solved: 0 },
        greedy: { total: 0, solved: 0 },
        backtracking: { total: 0, solved: 0 },
        'bit-manipulation': { total: 0, solved: 0 },
      };

      questions.forEach((q) => {
        const isSolved = getProblemStatus(progress, q.id) === 'solved';
        if (isSolved) solved++;

        if (q.difficulty === 'Easy') {
          easyTotal++;
          if (isSolved) easySolved++;
        } else if (q.difficulty === 'Medium') {
          medTotal++;
          if (isSolved) medSolved++;
        } else if (q.difficulty === 'Hard') {
          hardTotal++;
          if (isSolved) hardSolved++;
        }

        if (topicCounts[q.topic]) {
          topicCounts[q.topic].total++;
          if (isSolved) topicCounts[q.topic].solved++;
        }
      });

      const percentage = total > 0 ? Math.round((solved / total) * 100) : 0;

      return {
        ...meta,
        total,
        solved,
        percentage,
        difficulty: {
          easy: { total: easyTotal, solved: easySolved, pct: easyTotal > 0 ? Math.round((easySolved / easyTotal) * 100) : 0 },
          medium: { total: medTotal, solved: medSolved, pct: medTotal > 0 ? Math.round((medSolved / medTotal) * 100) : 0 },
          hard: { total: hardTotal, solved: hardSolved, pct: hardTotal > 0 ? Math.round((hardSolved / hardTotal) * 100) : 0 },
        },
        topicCounts,
      };
    });
  }, [progress]);

  const activeStats = useMemo(() => {
    return trackStats.find((s) => s.key === selectedTrack) || trackStats[0];
  }, [trackStats, selectedTrack]);

  return (
    <div className="space-y-6">
      {/* Top Banner Overview of All 5 Curations */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {trackStats.map((track) => {
          const isSelected = track.key === selectedTrack;
          return (
            <button
              key={track.key}
              type="button"
              onClick={() => setSelectedTrack(track.key)}
              className={`p-3.5 rounded-2xl text-left border transition-all relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? 'bg-[var(--bg-card)] border-[var(--text-primary)] shadow-sm ring-1 ring-[var(--text-primary)]'
                  : 'bg-[var(--bg-card)] border-[var(--border-subtle)] hover:border-[var(--border-strong)]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl">{track.emoji}</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                    isSelected 
                      ? 'bg-[var(--text-primary)] text-[var(--text-inverse)] border-[var(--text-primary)] font-bold' 
                      : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] border-[var(--border-subtle)]'
                  }`}>
                    {track.badge}
                  </span>
                </div>
                <h2 className="text-xs font-bold text-[var(--text-primary)] truncate">
                  {track.name}
                </h2>
                <div className="flex items-baseline gap-1 mt-1 font-mono">
                  <span className="text-base font-bold text-[var(--text-primary)]">
                    {track.solved}
                  </span>
                  <span className="text-[11px] text-[var(--text-muted)]">
                    / {track.total}
                  </span>
                  <span className="text-[11px] font-bold text-[var(--text-secondary)] ml-auto">
                    {track.percentage}%
                  </span>
                </div>
              </div>

              {/* Mini progress bar */}
              <div className="w-full bg-[var(--bg-subtle)] h-1 rounded-full overflow-hidden mt-3 border border-[var(--border-subtle)]">
                <div
                  className="bg-[var(--text-primary)] h-full transition-all duration-500 rounded-full"
                  style={{ width: `${track.percentage}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Deep-Dive Inspection Panel for Selected Curation */}
      <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5 sm:p-6 shadow-sm space-y-6">
        {/* Header of selected curation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-3">
            <span className="text-3xl p-2.5 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)]">
              {activeStats.emoji}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] tracking-tight">
                  {activeStats.name}
                </h2>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[var(--badge-bg)] text-[var(--badge-text)] border border-[var(--border-subtle)]">
                  {activeStats.total} Questions
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                {activeStats.tagline}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onSelectTrackForPractice(activeStats.key)}
            className="btn-solid flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold self-start sm:self-auto"
          >
            <span>Practice this Curation</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* High-Level Completion & Difficulty Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Master Progress Card */}
          <div className="p-4 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex flex-col justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-muted)] font-semibold">
              Overall Solved
            </span>
            <div className="my-2">
              <div className="flex items-baseline gap-1.5 font-mono">
                <span className="text-3xl font-extrabold text-[var(--text-primary)]">
                  {activeStats.percentage}%
                </span>
                <span className="text-xs text-[var(--text-muted)] font-medium">
                  completed
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-1 font-mono">
                {activeStats.solved} of {activeStats.total} problems solved
              </p>
            </div>
            <div className="w-full bg-[var(--border-subtle)] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[var(--text-primary)] h-full transition-all duration-500 rounded-full"
                style={{ width: `${activeStats.percentage}%` }}
              />
            </div>
          </div>

          {/* Easy Breakdown */}
          <div className="p-4 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold">
                Easy Tier
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold">
                {activeStats.difficulty.easy.pct}%
              </span>
            </div>
            <div className="my-2 font-mono">
              <div className="text-2xl font-bold text-[var(--text-primary)]">
                {activeStats.difficulty.easy.solved}{' '}
                <span className="text-xs text-[var(--text-muted)] font-normal">
                  / {activeStats.difficulty.easy.total}
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                Foundation & basic patterns
              </p>
            </div>
            <div className="w-full bg-[var(--border-subtle)] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full transition-all duration-500 rounded-full"
                style={{ width: `${activeStats.difficulty.easy.pct}%` }}
              />
            </div>
          </div>

          {/* Medium Breakdown */}
          <div className="p-4 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-amber-600 dark:text-amber-400 font-bold">
                Medium Tier
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-bold">
                {activeStats.difficulty.medium.pct}%
              </span>
            </div>
            <div className="my-2 font-mono">
              <div className="text-2xl font-bold text-[var(--text-primary)]">
                {activeStats.difficulty.medium.solved}{' '}
                <span className="text-xs text-[var(--text-muted)] font-normal">
                  / {activeStats.difficulty.medium.total}
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                Core FAANG interview targets
              </p>
            </div>
            <div className="w-full bg-[var(--border-subtle)] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-full transition-all duration-500 rounded-full"
                style={{ width: `${activeStats.difficulty.medium.pct}%` }}
              />
            </div>
          </div>

          {/* Hard Breakdown */}
          <div className="p-4 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-rose-600 dark:text-rose-400 font-bold">
                Hard Tier
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-bold">
                {activeStats.difficulty.hard.pct}%
              </span>
            </div>
            <div className="my-2 font-mono">
              <div className="text-2xl font-bold text-[var(--text-primary)]">
                {activeStats.difficulty.hard.solved}{' '}
                <span className="text-xs text-[var(--text-muted)] font-normal">
                  / {activeStats.difficulty.hard.total}
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                Senior & staff level edge problems
              </p>
            </div>
            <div className="w-full bg-[var(--border-subtle)] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-rose-500 h-full transition-all duration-500 rounded-full"
                style={{ width: `${activeStats.difficulty.hard.pct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Data Structure / Topic Matrix Breakdown */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] font-bold">
              Topic & Data Structure Distribution in {activeStats.name}
            </h3>
            <span className="text-[11px] font-mono text-[var(--text-secondary)]">
              {Object.values(activeStats.topicCounts).filter(t => t.total > 0).length} Topics Covered
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {TOPICS.map((topic) => {
              const item = activeStats.topicCounts[topic.id] || { total: 0, solved: 0 };
              if (item.total === 0) return null;

              const pct = item.total > 0 ? Math.round((item.solved / item.total) * 100) : 0;
              const isFinished = item.solved === item.total && item.total > 0;

              return (
                <div
                  key={topic.id}
                  className="p-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] space-y-2 hover:border-[var(--border-strong)] transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--text-primary)]">
                      {topic.name}
                    </span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                      isFinished
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-bold'
                        : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-subtle)]'
                    }`}>
                      {item.solved} / {item.total} ({pct}%)
                    </span>
                  </div>

                  <div className="w-full bg-[var(--border-subtle)] h-1 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        isFinished ? 'bg-emerald-500' : 'bg-[var(--text-primary)]'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
