import React, { useMemo } from 'react';
import { 
  Trophy, 
  Flame, 
  Download, 
  Upload, 
  RotateCcw, 
  Award, 
  Target, 
  BarChart3,
  ExternalLink
} from 'lucide-react';
import { QUESTIONS_450 } from '../../data/questions450';
import { TOPICS } from '../../data/topics';
import { UserProgress } from '../../types/dsa';
import { ActivityHeatmap } from './ActivityHeatmap';

interface ProgressDashboardProps {
  progress: UserProgress;
  onImportProgress: (imported: UserProgress) => void;
  onResetProgress: () => void;
  onNavigateToSheet: (topicId?: string) => void;
}

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({
  progress,
  onImportProgress,
  onResetProgress,
  onNavigateToSheet,
}) => {
  const totalQuestions = QUESTIONS_450.length;
  const doneCount = useMemo(() => {
    return QUESTIONS_450.filter(q => progress.doneQuestions[q.id]).length;
  }, [progress.doneQuestions]);

  const percentage = Math.round((doneCount / totalQuestions) * 100);

  const diffStats = useMemo(() => {
    const stats = {
      Easy: { total: 0, done: 0 },
      Medium: { total: 0, done: 0 },
      Hard: { total: 0, done: 0 },
    };
    QUESTIONS_450.forEach(q => {
      stats[q.difficulty].total++;
      if (progress.doneQuestions[q.id]) {
        stats[q.difficulty].done++;
      }
    });
    return stats;
  }, [progress.doneQuestions]);

  const topicStats = useMemo(() => {
    return TOPICS.map(topic => {
      const topicQuestions = QUESTIONS_450.filter(q => q.topic === topic.id);
      const done = topicQuestions.filter(q => progress.doneQuestions[q.id]).length;
      const total = topicQuestions.length;
      const pct = total > 0 ? Math.round((done / total) * 100) : 0;
      return {
        ...topic,
        done,
        total,
        percentage: pct,
      };
    });
  }, [progress.doneQuestions]);

  const handleExport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(progress, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `dsaspace_progress_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed && typeof parsed === 'object') {
            onImportProgress(parsed);
          }
        } catch (err) {
          alert('Invalid progress JSON file.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-900 via-purple-950/30 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/30 rounded-full text-xs font-semibold mb-3">
              <BarChart3 className="w-3.5 h-3.5" /> Performance & Consistency Tracker
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              DSASpace Interview Readiness
            </h2>
            <p className="text-slate-300 text-sm mt-1.5 leading-relaxed">
              Track your journey across the legendary 450 Sheet on <span className="text-cyan-400 font-mono">dsaspace.vercel.app</span>. Identify weak topics, monitor difficulty coverage, and keep your daily problem-solving streak alive.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition"
              title="Download your DSASpace progress as JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>

            <label className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>Import</span>
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>

            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to reset all solved progress on DSASpace?')) {
                  onResetProgress();
                }
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-semibold transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800">
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
            <div className="flex items-center gap-2 text-cyan-400 mb-1">
              <Trophy className="w-4 h-4" />
              <span className="text-xs uppercase tracking-wider font-semibold">Total Solved</span>
            </div>
            <div className="text-2xl font-black text-white">
              {doneCount} <span className="text-sm font-normal text-slate-500">/ {totalQuestions}</span>
            </div>
            <div className="text-xs text-cyan-400 mt-1 font-mono">{percentage}% Completed</div>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
            <div className="flex items-center gap-2 text-amber-400 mb-1">
              <Flame className="w-4 h-4" />
              <span className="text-xs uppercase tracking-wider font-semibold">Active Streak</span>
            </div>
            <div className="text-2xl font-black text-amber-400">
              {progress.streak} <span className="text-sm font-normal text-slate-400">days</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">Keep it burning! 🔥</div>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
            <div className="flex items-center gap-2 text-purple-400 mb-1">
              <Target className="w-4 h-4" />
              <span className="text-xs uppercase tracking-wider font-semibold">Starred for Rev</span>
            </div>
            <div className="text-2xl font-black text-purple-300">
              {Object.values(progress.starredQuestions).filter(Boolean).length}
            </div>
            <div className="text-xs text-slate-400 mt-1">Bookmarked problems</div>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
            <div className="flex items-center gap-2 text-emerald-400 mb-1">
              <Award className="w-4 h-4" />
              <span className="text-xs uppercase tracking-wider font-semibold">Personal Notes</span>
            </div>
            <div className="text-2xl font-black text-emerald-400">
              {Object.keys(progress.notes).filter(k => progress.notes[k]?.trim()).length}
            </div>
            <div className="text-xs text-slate-400 mt-1">Annotated problems</div>
          </div>
        </div>
      </div>

      <ActivityHeatmap
        activityLog={progress.activityLog}
        currentStreak={progress.streak}
        longestStreak={progress.longestStreak || progress.streak}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/90 border border-emerald-500/30 p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-emerald-400">Easy Problems</span>
            <span className="text-xs font-mono text-emerald-300 font-bold">
              {diffStats.Easy.done} / {diffStats.Easy.total}
            </span>
          </div>
          <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
            <div
              className="bg-emerald-500 h-full transition-all duration-500"
              style={{
                width: `${diffStats.Easy.total ? (diffStats.Easy.done / diffStats.Easy.total) * 100 : 0}%`,
              }}
            ></div>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-amber-500/30 p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-amber-400">Medium Problems</span>
            <span className="text-xs font-mono text-amber-300 font-bold">
              {diffStats.Medium.done} / {diffStats.Medium.total}
            </span>
          </div>
          <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
            <div
              className="bg-amber-500 h-full transition-all duration-500"
              style={{
                width: `${diffStats.Medium.total ? (diffStats.Medium.done / diffStats.Medium.total) * 100 : 0}%`,
              }}
            ></div>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-rose-500/30 p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-rose-400">Hard Problems</span>
            <span className="text-xs font-mono text-rose-300 font-bold">
              {diffStats.Hard.done} / {diffStats.Hard.total}
            </span>
          </div>
          <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
            <div
              className="bg-rose-500 h-full transition-all duration-500"
              style={{
                width: `${diffStats.Hard.total ? (diffStats.Hard.done / diffStats.Hard.total) * 100 : 0}%`,
              }}
            ></div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-lg font-bold text-white mb-4">Topic-Wise Progress Breakdown</h3>

        <div className="space-y-4">
          {topicStats.map((t) => (
            <div key={t.id} className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
              <div className="flex items-center justify-between text-xs sm:text-sm font-semibold mb-2">
                <button
                  onClick={() => onNavigateToSheet(t.id)}
                  className="text-white hover:text-cyan-400 transition flex items-center gap-1.5"
                >
                  <span>{t.name}</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </button>
                <div className="flex items-center gap-3">
                  <span className="text-slate-400 font-mono">
                    {t.done} / {t.total} solved
                  </span>
                  <span className="text-xs font-bold text-cyan-400 w-10 text-right">
                    {t.percentage}%
                  </span>
                </div>
              </div>

              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                  style={{ width: `${t.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
