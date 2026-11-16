import React, { useState, useEffect } from 'react';
import {
  Clock,
  Target,
  ArrowRight,
  Sparkles,
  FileCode2,
  GitBranch,
  Layers,
  History,
  Timer,
  CheckCircle2,
  AlertTriangle,
  Settings,
  Calendar,
  Zap,
  Coffee
} from 'lucide-react';
import { rolesData, examDefaults } from '../data/rolesData';
import { patternFrequencyData } from '../data/frequencyData';

interface DashboardViewProps {
  onNavigate: (view: string, itemId?: string) => void;
  targetRole: string;
  onTargetRoleChange: (role: string) => void;
  solvedProblems: string[];
  onOpenSupport?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  targetRole,
  onTargetRoleChange,
  solvedProblems,
  onOpenSupport
}) => {
  const [examDate, setExamDate] = useState<string>(() => {
    return localStorage.getItem('spdse_exam_date') || examDefaults.defaultExamDate;
  });

  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0, hours: 0, minutes: 0, seconds: 0
  });

  const [showDateModal, setShowDateModal] = useState(false);
  const [customDateInput, setCustomDateInput] = useState(examDate.slice(0, 16));

  // Countdown timer calculation
  useEffect(() => {
    const calculateTime = () => {
      const target = new Date(examDate).getTime();
      const now = new Date().getTime();
      const diff = Math.max(0, target - now);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [examDate]);

  const handleSaveDate = () => {
    setExamDate(customDateInput);
    localStorage.setItem('spdse_exam_date', customDateInput);
    setShowDateModal(false);
  };

  const activeRoleConfig = rolesData.find(r => r.id === targetRole) || rolesData[0];

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Countdown & Primary Target Role */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Countdown Box */}
        <div className="lg:col-span-2 p-5 rounded-sm border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-xs font-mono text-neutral-500 uppercase tracking-wide">
              <Clock size={14} className="text-accent dark:text-accent-dark" />
              <span>Assessment Countdown</span>
            </div>
            
            <button
              onClick={() => setShowDateModal(true)}
              className="flex items-center gap-1 text-[11px] font-mono text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 px-2 py-0.5 rounded border border-neutral-200 dark:border-neutral-700 hover:border-neutral-300"
            >
              <Settings size={11} />
              <span>Adjust Date</span>
            </button>
          </div>

          {/* Large Countdown Units */}
          <div className="grid grid-cols-4 gap-2 text-center py-2">
            <div className="p-3 bg-neutral-100 dark:bg-neutral-800/60 rounded-sm">
              <div className="text-3xl sm:text-4xl font-mono font-bold text-neutral-900 dark:text-white">
                {timeLeft.days}
              </div>
              <div className="text-[10px] font-mono text-neutral-500 uppercase mt-1">Days</div>
            </div>
            <div className="p-3 bg-neutral-100 dark:bg-neutral-800/60 rounded-sm">
              <div className="text-3xl sm:text-4xl font-mono font-bold text-neutral-900 dark:text-white">
                {timeLeft.hours}
              </div>
              <div className="text-[10px] font-mono text-neutral-500 uppercase mt-1">Hours</div>
            </div>
            <div className="p-3 bg-neutral-100 dark:bg-neutral-800/60 rounded-sm">
              <div className="text-3xl sm:text-4xl font-mono font-bold text-neutral-900 dark:text-white">
                {timeLeft.minutes}
              </div>
              <div className="text-[10px] font-mono text-neutral-500 uppercase mt-1">Mins</div>
            </div>
            <div className="p-3 bg-neutral-100 dark:bg-neutral-800/60 rounded-sm">
              <div className="text-3xl sm:text-4xl font-mono font-bold text-neutral-900 dark:text-white">
                {timeLeft.seconds}
              </div>
              <div className="text-[10px] font-mono text-neutral-500 uppercase mt-1">Secs</div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800/60 flex items-center justify-between text-xs text-neutral-500 font-mono">
            <span>Target Drive Date: {new Date(examDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            <span className="text-accent dark:text-accent-dark font-medium">180 Mins · 3 Coding Problems</span>
          </div>
        </div>

        {/* Current Role Target Summary Card */}
        <div className="p-5 rounded-sm border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wide text-neutral-400">Target Track</span>
              <span className="font-mono text-xs px-2 py-0.5 rounded-sm bg-accent/15 dark:bg-accent/25 text-accent dark:text-accent-dark font-semibold">
                {activeRoleConfig.ctc}
              </span>
            </div>

            <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-1">
              {activeRoleConfig.name}
            </h3>

            <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2 mb-3">
              {activeRoleConfig.description}
            </p>

            <div className="space-y-1.5 text-xs text-neutral-700 dark:text-neutral-300 bg-paper-100/70 dark:bg-neutral-800/40 p-2.5 rounded-sm border border-neutral-200 dark:border-neutral-800">
              <div className="flex justify-between">
                <span className="text-neutral-500">Benchmark Cutoff:</span>
                <span className="font-mono font-medium">{activeRoleConfig.minSolvedThreshold.fullProblems} Full + {activeRoleConfig.minSolvedThreshold.partialPercentage}% Partial</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Target Score:</span>
                <span className="font-mono font-bold text-neutral-900 dark:text-white">{activeRoleConfig.targetMarks} / 100</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('role-tracks')}
            className="w-full mt-4 flex items-center justify-center gap-1.5 py-1.5 px-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-medium rounded-sm hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors"
          >
            <span>Open Must-Do Track Checklist</span>
            <ArrowRight size={13} />
          </button>
        </div>

      </div>

      {/* Verified Catalog Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div 
          onClick={() => onNavigate('pyq')}
          className="p-3.5 rounded-sm border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700 cursor-pointer transition-colors"
        >
          <div className="text-[11px] font-mono text-neutral-500 flex items-center gap-1">
            <History size={12} />
            <span>Verified PYQs</span>
          </div>
          <div className="text-2xl font-bold font-mono text-neutral-900 dark:text-white mt-1">42</div>
          <div className="text-[10px] text-neutral-400 mt-0.5">2020–2026 real drives</div>
        </div>

        <div 
          onClick={() => onNavigate('patterns')}
          className="p-3.5 rounded-sm border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700 cursor-pointer transition-colors"
        >
          <div className="text-[11px] font-mono text-neutral-500 flex items-center gap-1">
            <Layers size={12} />
            <span>CF Benchmark Bank</span>
          </div>
          <div className="text-2xl font-bold font-mono text-neutral-900 dark:text-white mt-1">327</div>
          <div className="text-[10px] text-neutral-400 mt-0.5">Real verified problem links</div>
        </div>

        <div 
          onClick={() => onNavigate('predicted-sets')}
          className="p-3.5 rounded-sm border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700 cursor-pointer transition-colors"
        >
          <div className="text-[11px] font-mono text-neutral-500 flex items-center gap-1">
            <Sparkles size={12} />
            <span>Predicted Sets</span>
          </div>
          <div className="text-2xl font-bold font-mono text-neutral-900 dark:text-white mt-1">52</div>
          <div className="text-[10px] text-neutral-400 mt-0.5">Weighted by real frequency</div>
        </div>

        <div 
          onClick={() => onNavigate('trainer')}
          className="p-3.5 rounded-sm border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700 cursor-pointer transition-colors"
        >
          <div className="text-[11px] font-mono text-neutral-500 flex items-center gap-1">
            <Target size={12} />
            <span>Pattern Drills</span>
          </div>
          <div className="text-2xl font-bold font-mono text-neutral-900 dark:text-white mt-1">216</div>
          <div className="text-[10px] text-neutral-400 mt-0.5">Story-to-pattern cues</div>
        </div>
      </div>

      {/* Main Two-Column Row: Today's Action Plan + Continue Where You Left Off */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Today's Action Plan (3-Week Curve) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold font-mono text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Calendar size={15} className="text-accent dark:text-accent-dark" />
              <span>Recommended Today's Blueprint</span>
            </h2>
            <button 
              onClick={() => onNavigate('study-plan')}
              className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white flex items-center gap-1"
            >
              <span>Full 21-Day Schedule</span>
              <ArrowRight size={12} />
            </button>
          </div>

          <div className="space-y-3">
            {/* Task 1 */}
            <div className="p-4 rounded-sm border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-semibold">
                    HIGH SIGNAL
                  </span>
                  <span className="text-xs font-semibold text-neutral-900 dark:text-white">
                    Master P1 Guarantee: Prefix Sums & Difference Arrays
                  </span>
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  P1 accounts for 20 marks and appears in 40% of tests as prefix sum or two pointers. Complete 3 must-do exercises with fast I/O.
                </p>
              </div>
              <button
                onClick={() => onNavigate('patterns', 'arrays_and_prefix_sums')}
                className="shrink-0 text-xs px-3 py-1.5 border border-neutral-200 dark:border-neutral-700 rounded-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 font-medium"
              >
                Practice
              </button>
            </div>

            {/* Task 2 */}
            <div className="p-4 rounded-sm border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 font-semibold">
                    DSE CUTOFF KEY
                  </span>
                  <span className="text-xs font-semibold text-neutral-900 dark:text-white">
                    P2 Core: Binary Search on Answer ('Minimize the Maximum')
                  </span>
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  26.7% of medium problems require binary searching the answer. Understand monotonicity check and boundary guard clauses.
                </p>
              </div>
              <button
                onClick={() => onNavigate('patterns', 'binary_search')}
                className="shrink-0 text-xs px-3 py-1.5 border border-neutral-200 dark:border-neutral-700 rounded-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 font-medium"
              >
                Practice
              </button>
            </div>

            {/* Task 3 */}
            <div className="p-4 rounded-sm border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 font-semibold">
                    DRILL
                  </span>
                  <span className="text-xs font-semibold text-neutral-900 dark:text-white">
                    Complete 15 Story-to-Pattern Recognition Drills
                  </span>
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  Infosys hides standard algorithms inside multi-paragraph narratives. Train your instant cue recognition.
                </p>
              </div>
              <button
                onClick={() => onNavigate('trainer')}
                className="shrink-0 text-xs px-3 py-1.5 border border-neutral-200 dark:border-neutral-700 rounded-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 font-medium"
              >
                Start Drills
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: Continue Where You Left Off & Quick Tools */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold font-mono text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Zap size={15} className="text-accent dark:text-accent-dark" />
            <span>Quick Resume</span>
          </h2>

          <div className="p-4 rounded-sm border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-3">
            <div className="text-xs text-neutral-500 font-mono">Simulate Real Pressure</div>
            <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
              Timed Mock Exam (180 Mins)
            </h4>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              3 random problems matching exact SP/DSE difficulty weights with auto-save and role readiness score.
            </p>
            <button
              onClick={() => onNavigate('mock-exam')}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-medium rounded-sm hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors"
            >
              <Timer size={14} />
              <span>Launch Timed Mock Exam</span>
            </button>
          </div>

          {/* Conflict Alert Banner */}
          <div className="p-3.5 rounded-sm border border-amber-300 dark:border-amber-800/80 bg-amber-50/70 dark:bg-amber-950/30 text-xs text-amber-900 dark:text-amber-200 space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold">
              <AlertTriangle size={14} className="text-amber-600 dark:text-amber-400" />
              <span>Reported Patterns Vary Alert</span>
            </div>
            <p className="text-[11px] leading-relaxed text-amber-800 dark:text-amber-300">
              Some test drives enforce a strict forward-only lock on questions, while others allow free tab switching. Always treat P1 as locked before advancing.
            </p>
            <button
              onClick={() => onNavigate('blueprint')}
              className="text-[11px] font-semibold underline text-amber-900 dark:text-amber-100 block pt-1"
            >
              Read full conflict resolution guide →
            </button>
          </div>

          {/* Buy Me a Coffee Indie Dev Card */}
          {onOpenSupport && (
            <div className="p-3.5 rounded-sm border border-amber-300 dark:border-amber-700/80 bg-gradient-to-br from-amber-50 to-orange-50/50 dark:from-amber-950/25 dark:to-neutral-900 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-xs text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                  <Coffee size={14} className="text-amber-600 dark:text-amber-400" />
                  <span>Buy Me a Coffee ☕</span>
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 bg-amber-500/20 text-amber-900 dark:text-amber-300 rounded font-bold">
                  Indie Dev
                </span>
              </div>
              <p className="text-[11px] leading-relaxed text-neutral-700 dark:text-neutral-300">
                Cracked your SP / DSE online assessment or interview with this platform? A small contribution (cost of a cutting chai or coffee) directly fuels hosting and upcoming 2026 drive updates.
              </p>
              <button
                onClick={onOpenSupport}
                className="w-full py-1.5 px-3 bg-amber-500 hover:bg-amber-600 text-white font-mono text-[11px] font-bold rounded-sm transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                <span>Support with PhonePe / Any UPI →</span>
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Adjust Date Modal */}
      {showDateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm">
          <div className="bg-paper-50 dark:bg-paper-900 p-5 rounded-sm border border-neutral-300 dark:border-neutral-700 max-w-sm w-full space-y-4">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Set Your Infosys Exam Date</h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              The dashboard countdown and 21-day study plan automatically adjust to your specific drive date.
            </p>
            <input
              type="datetime-local"
              value={customDateInput}
              onChange={(e) => setCustomDateInput(e.target.value)}
              className="w-full text-xs font-mono p-2 border border-neutral-300 dark:border-neutral-700 rounded-sm bg-white dark:bg-neutral-800"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowDateModal(false)}
                className="px-3 py-1.5 text-xs text-neutral-600 hover:text-neutral-900 dark:text-neutral-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveDate}
                className="px-3 py-1.5 text-xs bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-sm font-medium"
              >
                Save Date
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
