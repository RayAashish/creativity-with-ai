import React, { useEffect, useState } from 'react';
import { X, Clock, Flame, BookOpen, Sparkles, TrendingUp, Calendar } from 'lucide-react';
import { ReadingStatsRecord, DEFAULT_STATS } from '../../types';
import { insightsService } from '../../services/insights-service';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ReadingInsightsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [stats, setStats] = useState<ReadingStatsRecord>(DEFAULT_STATS);

  useEffect(() => {
    if (isOpen) {
      insightsService.getStats().then(setStats);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const totalMinutes = Math.round(stats.totalReadingSeconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-2xl max-w-lg w-full flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500 text-white flex items-center justify-center shadow-xs">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-zinc-100 text-sm">
                Reading Insights & Streaks
              </h3>
              <p className="text-xs text-gray-500 dark:text-zinc-400">
                100% Private & Stored On-Device
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-3">
            {/* Streak */}
            <div className="p-4 rounded-xl border border-orange-200 dark:border-orange-900/60 bg-orange-50/50 dark:bg-orange-950/20 flex flex-col justify-between">
              <div className="flex items-center justify-between text-orange-600 dark:text-orange-400">
                <span className="text-xs font-semibold">Active Streak</span>
                <Flame className="w-4 h-4 fill-current" />
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold text-gray-900 dark:text-zinc-100">
                  {stats.currentStreakDays}
                </span>
                <span className="text-xs text-gray-500 ml-1">days</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-1">Best: {stats.bestStreakDays} days</p>
            </div>

            {/* Reading Time */}
            <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/20 flex flex-col justify-between">
              <div className="flex items-center justify-between text-blue-600 dark:text-blue-400">
                <span className="text-xs font-semibold">Time Read</span>
                <Clock className="w-4 h-4" />
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold text-gray-900 dark:text-zinc-100">
                  {hours > 0 ? `${hours}h ` : ''}{remainingMinutes}m
                </span>
              </div>
              <p className="text-[10px] text-gray-400 mt-1">Total focused reading</p>
            </div>

            {/* Words Learned */}
            <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 flex flex-col justify-between">
              <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
                <span className="text-xs font-semibold">Vocabulary</span>
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold text-gray-900 dark:text-zinc-100">
                  {stats.totalWordsLearned}
                </span>
                <span className="text-xs text-gray-500 ml-1">words</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-1">Bilingual terms saved</p>
            </div>

            {/* Pages Read */}
            <div className="p-4 rounded-xl border border-purple-200 dark:border-purple-900/60 bg-purple-50/50 dark:bg-purple-950/20 flex flex-col justify-between">
              <div className="flex items-center justify-between text-purple-600 dark:text-purple-400">
                <span className="text-xs font-semibold">Activity</span>
                <Calendar className="w-4 h-4" />
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold text-gray-900 dark:text-zinc-100">
                  {stats.dailyHistory.length}
                </span>
                <span className="text-xs text-gray-500 ml-1">days active</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-1">Last active: {stats.lastActiveDate}</p>
            </div>
          </div>

          {/* Habit Encouragement Quote */}
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-zinc-800/60 border border-amber-200 dark:border-zinc-700 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
            <BookOpen className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Consistency is key:</strong> Reading just 15 minutes a day with instant Hindi & Nepali lookups compounds into over 1,500 new technical terms mastered every year.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
