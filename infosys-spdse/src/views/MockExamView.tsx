import React, { useState, useEffect } from 'react';
import {
  Timer,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Save,
  ArrowRight,
  ShieldAlert,
  Code2,
  ChevronRight,
  ExternalLink,
  Clock
} from 'lucide-react';
import { predictedSets } from '../data/predictedSetsData';
import { PredictedSet, PredictedProblemItem, Language } from '../types';
import { TestRunner } from '../components/TestRunner';

interface MockExamViewProps {
  initialSet?: PredictedSet | null;
  selectedLanguage: Language;
  onLanguageChange: (lang: Language) => void;
}

export const MockExamView: React.FC<MockExamViewProps> = ({
  initialSet = null,
  selectedLanguage,
  onLanguageChange
}) => {
  const [activeSet, setActiveSet] = useState<PredictedSet>(initialSet || predictedSets[0]);
  const [examMode, setExamMode] = useState<'3-problem' | '2-problem'>('3-problem');
  const [examState, setExamState] = useState<'idle' | 'running' | 'completed'>('idle');
  const [activeProblemIndex, setActiveProblemIndex] = useState(0);
  
  // Timer state (seconds)
  const [secondsRemaining, setSecondsRemaining] = useState(180 * 60);
  const [timeSpentPerProblem, setTimeSpentPerProblem] = useState<number[]>([0, 0, 0, 0]);
  
  // Code editor drafts
  const [codeDrafts, setCodeDrafts] = useState<Record<number, string>>({});
  const [lastSaved, setLastSaved] = useState<string>('');

  // Post exam results state
  const [examScore, setExamScore] = useState(0);
  const [passedStatuses, setPassedStatuses] = useState<boolean[]>([false, false, false, false]);
  const [showTestRunner, setShowTestRunner] = useState(false);

  // Load set if prop changed
  useEffect(() => {
    if (initialSet) {
      setActiveSet(initialSet);
    }
  }, [initialSet]);

  // Exam Countdown Loop
  useEffect(() => {
    if (examState !== 'running') return;

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          handleFinishExam();
          return 0;
        }
        return prev - 1;
      });

      // Track time spent on current problem
      setTimeSpentPerProblem((prev) => {
        const copy = [...prev];
        copy[activeProblemIndex] = (copy[activeProblemIndex] || 0) + 1;
        return copy;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [examState, activeProblemIndex]);

  // Auto-save code draft to localStorage
  useEffect(() => {
    if (examState === 'running') {
      const timer = setTimeout(() => {
        localStorage.setItem(`spdse_mock_draft_${activeProblemIndex}`, codeDrafts[activeProblemIndex] || '');
        setLastSaved(new Date().toLocaleTimeString());
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [codeDrafts, activeProblemIndex, examState]);

  const handleStartExam = () => {
    const totalSecs = examMode === '3-problem' ? 180 * 60 : 90 * 60;
    setSecondsRemaining(totalSecs);
    setTimeSpentPerProblem([0, 0, 0, 0]);
    setExamState('running');
    setActiveProblemIndex(0);

    // Initial draft boilerplate
    const defaultBoilerplate = selectedLanguage === 'java' 
      ? `import java.io.*;\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) throws IOException {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        // Write your solution here\n    }\n}`
      : selectedLanguage === 'cpp'
        ? `#include <iostream>\n#include <vector>\n#include <algorithm>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write your solution here\n    return 0;\n}`
        : `import sys\n\ndef solve():\n    input_data = sys.stdin.read().split()\n    if not input_data: return\n    # Write your solution here\n\nif __name__ == '__main__':\n    solve()`;

    setCodeDrafts({
      0: defaultBoilerplate,
      1: defaultBoilerplate,
      2: defaultBoilerplate,
      3: defaultBoilerplate
    });
  };

  const handleFinishExam = () => {
    setExamState('completed');
    // Calculate score based on user self-reporting test passes
    let calculated = 0;
    passedStatuses.forEach((pass, idx) => {
      if (pass && activeSet.problems[idx]) {
        calculated += activeSet.problems[idx].marks;
      }
    });
    setExamScore(calculated);
  };

  const formatTimer = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const activeProblemItem: PredictedProblemItem | undefined = activeSet.problems[activeProblemIndex];

  // 1. SETUP SCREEN
  if (examState === 'idle') {
    return (
      <div className="space-y-6 max-w-4xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-accent dark:text-accent-dark uppercase tracking-wider mb-1">
            <Timer size={14} />
            <span>High-Fidelity Assessment Simulator</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Timed Mock Coding Assessment
          </h1>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 max-w-2xl leading-relaxed">
            Replicates real HackerEarth / Infosys assessment pressure: persistent countdown clock, solutions strictly hidden, real-time draft autosave, and post-exam role readiness diagnosis.
          </p>
        </div>

        <div className="p-5 rounded-sm border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-5">
          <div className="space-y-3">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200">
              1. Select Test Format & Duration
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => setExamMode('3-problem')}
                className={`p-3.5 text-left rounded-sm border transition-all ${
                  examMode === '3-problem'
                    ? 'border-neutral-900 dark:border-white bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
                    : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300'
                }`}
              >
                <div className="font-bold text-xs flex justify-between">
                  <span>Standard SP / DSE Assessment</span>
                  <span className="font-mono">180 Mins</span>
                </div>
                <div className="text-[11px] opacity-80 mt-1">3 Coding Questions (20m + 30m + 50m = 100 Marks)</div>
              </button>

              <button
                onClick={() => setExamMode('2-problem')}
                className={`p-3.5 text-left rounded-sm border transition-all ${
                  examMode === '2-problem'
                    ? 'border-neutral-900 dark:border-white bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
                    : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300'
                }`}
              >
                <div className="font-bold text-xs flex justify-between">
                  <span>Express Pool / Upgrade Slot</span>
                  <span className="font-mono">90 Mins</span>
                </div>
                <div className="text-[11px] opacity-80 mt-1">2 Coding Questions (High Speed Pressure)</div>
              </button>
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200">
              2. Select Assessment Problem Set
            </label>
            <select
              value={activeSet.id}
              onChange={(e) => {
                const s = predictedSets.find(x => x.id === e.target.value);
                if (s) setActiveSet(s);
              }}
              className="w-full text-xs font-mono p-2 border border-neutral-300 dark:border-neutral-700 rounded-sm bg-paper-50 dark:bg-neutral-800 text-neutral-900 dark:text-white"
            >
              {predictedSets.map(s => (
                <option key={s.id} value={s.id}>
                  {s.id.toUpperCase()} · {s.title} ({s.targetRole} Focus)
                </option>
              ))}
            </select>
          </div>

          {/* Test Rules Brief */}
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-sm text-xs text-amber-900 dark:text-amber-200 space-y-1">
            <div className="font-bold">Exam Integrity Rules:</div>
            <ul className="list-disc list-inside text-[11px] space-y-0.5 text-amber-800 dark:text-amber-300">
              <li>Solutions and hints are completely hidden during the test.</li>
              <li>You may use standard documentation, but external generative AI assistance is barred.</li>
              <li>Drafts are saved automatically in your browser's local storage every 5 seconds.</li>
            </ul>
          </div>

          <button
            onClick={handleStartExam}
            className="w-full py-2.5 px-4 bg-accent hover:bg-accent-dark text-white text-xs font-bold font-mono uppercase tracking-wider rounded-sm transition-colors flex items-center justify-center gap-2"
          >
            <Play size={14} />
            <span>Begin Timed Mock Assessment</span>
          </button>
        </div>
      </div>
    );
  }

  // 2. EXAM ACTIVE RUNNING STATE
  if (examState === 'running' && activeProblemItem) {
    const isUrgent = secondsRemaining < 900; // Under 15 mins

    return (
      <div className="space-y-4">
        
        {/* Top Sticky Assessment Bar */}
        <div className="p-3 rounded-sm border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-center justify-between gap-4 sticky top-16 z-20 shadow-sm">
          
          {/* Question Navigator Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {activeSet.problems.map((p, idx) => (
              <button
                key={idx}
                onClick={() => setActiveProblemIndex(idx)}
                className={`px-3 py-1 text-xs font-mono rounded-sm transition-colors ${
                  activeProblemIndex === idx
                    ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                {p.position} ({p.marks}m)
              </button>
            ))}
          </div>

          {/* Central Timer */}
          <div className={`flex items-center gap-2 px-3 py-1 rounded font-mono font-bold text-sm ${
            isUrgent 
              ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 animate-pulse'
              : 'bg-paper-100 dark:bg-neutral-800 text-neutral-900 dark:text-white'
          }`}>
            <Clock size={15} />
            <span>{formatTimer(secondsRemaining)}</span>
          </div>

          {/* Finish & Save status */}
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-[10px] font-mono text-neutral-400 flex items-center gap-1">
              <Save size={11} />
              <span>{lastSaved ? `Autosaved ${lastSaved}` : 'Autosaving...'}</span>
            </span>

            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to finalize and submit your mock exam?')) {
                  handleFinishExam();
                }
              }}
              className="px-3 py-1 text-xs font-bold font-mono bg-rose-600 hover:bg-rose-700 text-white rounded-sm transition-colors"
            >
              Submit Exam
            </button>
          </div>
        </div>

        {/* Two Pane Workspace: Left Problem Description, Right Code Editor */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          
          {/* Left Pane: Story Problem Statement */}
          <div className="p-4 rounded-sm border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-4 max-h-[70vh] overflow-y-auto">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-bold">
                  {activeProblemItem.position} · {activeProblemItem.marks} Marks
                </span>
                <span className="text-xs font-mono text-neutral-400">
                  Time Spent: {Math.floor((timeSpentPerProblem[activeProblemIndex] || 0) / 60)}m
                </span>
              </div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                {activeProblemItem.problem.title}
              </h2>
            </div>

            <div className="space-y-2 text-xs leading-relaxed text-neutral-800 dark:text-neutral-200">
              <h4 className="font-mono font-bold uppercase text-[11px] text-neutral-500">Problem Narrative:</h4>
              <p className="p-3 bg-paper-100/70 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700/60 rounded leading-relaxed">
                {activeProblemItem.storyDisguise}
              </p>
              <p>{activeProblemItem.problem.paraphrase}</p>
            </div>

            <div className="space-y-1 text-xs">
              <h4 className="font-mono font-bold uppercase text-[11px] text-neutral-500">Constraints:</h4>
              <code className="block p-2 font-mono text-[11px] bg-neutral-100 dark:bg-neutral-800 rounded">
                {activeProblemItem.problem.constraints}
              </code>
            </div>

            <div className="p-3 bg-neutral-50 dark:bg-neutral-800/30 border border-neutral-200 dark:border-neutral-700 rounded text-xs space-y-1">
              <div className="font-mono font-semibold text-[11px]">External Testing Verification:</div>
              <p className="text-neutral-500 text-[11px]">
                You can cross-compile and run your solution against real Codeforces test cases:
              </p>
              <a
                href={activeProblemItem.problem.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent dark:text-accent-dark hover:underline font-mono text-[11px] flex items-center gap-1 mt-1"
              >
                <span>Codeforces Problem Portal ({activeProblemItem.problem.contestId}{activeProblemItem.problem.index})</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>

          {/* Right Pane: Code Editor & Scratchpad */}
          <div className="p-4 rounded-sm border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <Code2 size={15} className="text-accent dark:text-accent-dark" />
                <span className="text-xs font-mono font-bold text-neutral-900 dark:text-white">Solution Editor</span>
              </div>

              {/* Language Switcher */}
              <div className="flex items-center border border-neutral-200 dark:border-neutral-700 rounded p-0.5 text-xs font-mono">
                {(['java', 'cpp', 'python'] as Language[]).map(lang => (
                  <button
                    key={lang}
                    onClick={() => onLanguageChange(lang)}
                    className={`px-2 py-0.5 rounded-sm ${selectedLanguage === lang ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold' : 'text-neutral-500'}`}
                  >
                    {lang === 'cpp' ? 'C++' : lang === 'java' ? 'Java' : 'Py'}
                  </button>
                ))}
              </div>
            </div>

            {/* Code Textarea */}
            <textarea
              value={codeDrafts[activeProblemIndex] || ''}
              onChange={(e) => setCodeDrafts({ ...codeDrafts, [activeProblemIndex]: e.target.value })}
              className="w-full flex-1 min-h-[300px] p-3 text-xs font-mono bg-neutral-950 text-neutral-100 rounded-sm border border-neutral-800 focus:outline-none focus:ring-1 focus:ring-accent selection:bg-accent/30 leading-relaxed"
              placeholder="// Write your fast IO solution code here..."
              spellCheck={false}
            />

            {/* In-Browser Sample Test Runner Toggle */}
            <div className="space-y-2">
              <button
                onClick={() => setShowTestRunner(!showTestRunner)}
                className="w-full py-1.5 px-3 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-mono rounded flex items-center justify-between border border-neutral-300 dark:border-neutral-700 transition-colors"
              >
                <span>{showTestRunner ? 'Hide Sample Test Runner' : 'Open In-Browser Sample Test Runner & Output Diff'}</span>
                <span className="text-[10px] uppercase font-bold text-accent dark:text-accent-dark">
                  {showTestRunner ? '▲' : '▼'}
                </span>
              </button>

              {showTestRunner && (
                <TestRunner problemTitle={activeProblemItem.problem.title} />
              )}
            </div>

            {/* Test Case Marking Toggle for Scoring */}
            <div className="p-2.5 rounded bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 flex items-center justify-between text-xs">
              <span className="text-neutral-600 dark:text-neutral-400">
                Mark as solved (all sample & hidden cases passed):
              </span>
              <input
                type="checkbox"
                checked={!!passedStatuses[activeProblemIndex]}
                onChange={(e) => {
                  const copy = [...passedStatuses];
                  copy[activeProblemIndex] = e.target.checked;
                  setPassedStatuses(copy);
                }}
                className="w-4 h-4 accent-accent"
              />
            </div>
          </div>

        </div>
      </div>
    );
  }

  // 3. POST-EXAM COMPLETED REVIEW & VERDICT
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="p-6 rounded-sm border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-5 text-center">
        <CheckCircle2 size={36} className="text-emerald-500 mx-auto" />
        <div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Assessment Session Submitted</h2>
          <p className="text-xs text-neutral-500 font-mono mt-1">
            Exam finished in {Math.floor((180 * 60 - secondsRemaining) / 60)} minutes.
          </p>
        </div>

        {/* Big Score Box */}
        <div className="max-w-xs mx-auto p-4 rounded-sm bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700">
          <div className="text-xs font-mono text-neutral-500 uppercase">Estimated Score</div>
          <div className="text-4xl font-bold font-mono text-neutral-900 dark:text-white mt-1">
            {examScore} <span className="text-base text-neutral-400">/ 100</span>
          </div>
        </div>

        {/* Role Readiness Verdict */}
        <div className="max-w-lg mx-auto p-4 rounded bg-paper-100 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700 text-left text-xs space-y-1.5">
          <div className="font-mono font-bold uppercase text-[11px] text-accent dark:text-accent-dark">
            Role Readiness Diagnostic Verdict:
          </div>
          {examScore >= 80 ? (
            <p className="text-emerald-800 dark:text-emerald-300">
              <strong>SP L2 / L3 Readiness Verified.</strong> You solved all foundational tiers and cleared Hard level test cases. Review low-level design for subsequent technical interview.
            </p>
          ) : examScore >= 50 ? (
            <p className="text-blue-800 dark:text-blue-300">
              <strong>SP L1 Qualified (₹10.5 LPA).</strong> Strong P1 and P2 pass rates. Focus on securing partial scores on P3 to break into SP L2.
            </p>
          ) : examScore >= 35 ? (
            <p className="text-amber-800 dark:text-amber-300">
              <strong>DSE Threshold Cleared (₹6.5 LPA).</strong> Sufficient for Digital Specialist Engineer shortlist. Work on P2 Binary Search on Answer to advance to SP.
            </p>
          ) : (
            <p className="text-rose-800 dark:text-rose-300">
              <strong>Below Shortlist Cutoff.</strong> Focus on P1 prefix sums and two pointers. Avoid getting bogged down on P3 before securing P1.
            </p>
          )}
        </div>

        {/* Time Spent Breakdown */}
        <div className="max-w-md mx-auto text-left text-xs font-mono border-t border-neutral-100 dark:border-neutral-800 pt-3 space-y-1">
          <div className="text-neutral-500 font-bold mb-1">Time Spent Breakdown:</div>
          {activeSet.problems.map((p, idx) => (
            <div key={idx} className="flex justify-between py-0.5 text-neutral-700 dark:text-neutral-300">
              <span>{p.position}: {p.problem.title}</span>
              <span className="font-bold">{Math.floor((timeSpentPerProblem[idx] || 0) / 60)} mins</span>
            </div>
          ))}
        </div>

        <button
          onClick={() => setExamState('idle')}
          className="mt-4 px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-medium rounded-sm inline-flex items-center gap-2"
        >
          <RotateCcw size={13} />
          <span>Reset and Try Another Mock Exam</span>
        </button>
      </div>
    </div>
  );
};
