import React, { useMemo } from 'react';
import { Flame, Trophy, Calendar, Sparkles } from 'lucide-react';
import { getHeatmapData, HeatmapDay } from '../../utils/storage';

interface ActivityHeatmapProps {
  activityLog?: Record<string, number>;
  currentStreak: number;
  longestStreak: number;
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({
  activityLog = {},
  currentStreak,
  longestStreak,
}) => {
  const { weeks, totalActiveDays, totalSolvedPeriod } = useMemo(() => {
    return getHeatmapData(activityLog, 24); // 24 weeks (~5.5 months)
  }, [activityLog]);

  const getCellColor = (level: number) => {
    switch (level) {
      case 1:
        return 'bg-emerald-500/35 border-emerald-500/40 hover:bg-emerald-500/50';
      case 2:
        return 'bg-emerald-500/60 border-emerald-400/60 hover:bg-emerald-500/80';
      case 3:
        return 'bg-emerald-400 border-emerald-300 hover:bg-emerald-300';
      case 4:
        return 'bg-cyan-400 border-cyan-300 shadow-sm shadow-cyan-400/40 hover:bg-cyan-300';
      default:
        return 'bg-slate-900 border-slate-800/80 hover:border-slate-700';
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute -top-16 -right-16 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Calendar className="w-4 h-4" />
            </span>
            <h3 className="text-base sm:text-lg font-extrabold text-white">
              Problem Solving Activity Heatmap
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            {totalSolvedPeriod} problems solved across {totalActiveDays} active days over the last 24 weeks
          </p>
        </div>

        {/* Streaks Callout */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
            <Flame className="w-4 h-4 fill-amber-500/30 text-amber-400" />
            <span>Current: {currentStreak}d</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold">
            <Trophy className="w-4 h-4 text-cyan-400" />
            <span>Best: {longestStreak}d</span>
          </div>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto pb-2 custom-scrollbar">
        <div className="min-w-[620px]">
          <div className="flex gap-1.5">
            {/* Day of Week Labels */}
            <div className="flex flex-col justify-between pr-2 text-[10px] font-mono text-slate-500 py-0.5 select-none">
              <span>Mon</span>
              <span>Wed</span>
              <span>Fri</span>
            </div>

            {/* Weeks columns */}
            <div className="flex gap-1.5 flex-1">
              {weeks.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-1.5 flex-1">
                  {week.map((day, dIdx) => (
                    <div
                      key={dIdx}
                      className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-md border transition-all duration-150 cursor-pointer group relative ${getCellColor(
                        day.level
                      )}`}
                    >
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center z-30 pointer-events-none whitespace-nowrap">
                        <div className="bg-slate-950 text-white text-[11px] font-medium py-1 px-2.5 rounded-lg border border-slate-700 shadow-2xl">
                          <span className="font-bold text-emerald-400">
                            {day.count === 0 ? 'No problems' : `${day.count} problem${day.count > 1 ? 's' : ''}`}
                          </span>{' '}
                          solved on {day.date}
                        </div>
                        <div className="w-2 h-2 bg-slate-950 border-r border-b border-slate-700 rotate-45 -mt-1" />
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-4 pt-3 border-t border-slate-800/60">
            <span className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Consistent daily practice yields compound interview breakthroughs.</span>
            </span>

            <div className="flex items-center gap-1.5">
              <span>Less</span>
              <div className="w-3 h-3 rounded-sm bg-slate-900 border border-slate-800" />
              <div className="w-3 h-3 rounded-sm bg-emerald-500/35 border border-emerald-500/40" />
              <div className="w-3 h-3 rounded-sm bg-emerald-500/60 border border-emerald-400/60" />
              <div className="w-3 h-3 rounded-sm bg-emerald-400 border border-emerald-300" />
              <div className="w-3 h-3 rounded-sm bg-cyan-400 border border-cyan-300" />
              <span>More</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
