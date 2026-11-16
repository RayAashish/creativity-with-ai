import React, { useState, useEffect, useMemo } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Target,
  Sparkles,
  ArrowRight,
  Flame,
  Layers,
  ChevronDown,
  ChevronUp,
  Download,
  Printer,
  ExternalLink,
  Code2,
  BookOpen,
  Timer,
  CheckSquare,
  Square,
  HelpCircle,
  Zap,
  Sliders,
  Calendar,
  RotateCcw
} from 'lucide-react';
import { rolesData } from '../data/rolesData';
import { codeforcesProblems } from '../data/problemsData';
import { pyqDatabase } from '../data/pyqData';
import { predictedSets } from '../data/predictedSetsData';
import { oralInterviewQuestions } from '../data/interviewData';
import { CodeforcesProblem, PatternId, PredictedSet } from '../types';

interface StudyPlanViewProps {
  targetRole?: string;
  onTargetRoleChange?: (role: string) => void;
  onViewProblemDetails?: (prob: CodeforcesProblem) => void;
  onNavigate?: (view: string, itemId?: string) => void;
  onLaunchMockSet?: (set: PredictedSet) => void;
}

export interface DayPlan {
  dayNumber: number;
  dateStr: string;
  phaseId: 1 | 2 | 3 | 4;
  phaseName: string;
  phaseBadge: string;
  topicTitle: string;
  patternId: PatternId;
  patternName: string;
  disguisedCues: string[];
  tasks: string[];
  assignedProblems: CodeforcesProblem[];
  assignedPYQId?: string;
  mockSetId?: string;
  interviewTopic?: string;
  timeAllocation: {
    theoryMinutes: number;
    codingMinutes: number;
    reviewMinutes: number;
  };
}

export const StudyPlanView: React.FC<StudyPlanViewProps> = ({
  targetRole = 'sp_l1',
  onTargetRoleChange,
  onViewProblemDetails,
  onNavigate,
  onLaunchMockSet
}) => {
  // Plan Parameters (10 to 45 days, 1 to 8 hours/day)
  const [totalDays, setTotalDays] = useState<number>(() => {
    const stored = localStorage.getItem('spdse_plan_days');
    return stored ? Math.min(45, Math.max(10, Number(stored))) : 21;
  });

  const [dailyHours, setDailyHours] = useState<number>(() => {
    const stored = localStorage.getItem('spdse_plan_daily_hours');
    return stored ? Math.min(8, Math.max(1, Number(stored))) : 4;
  });

  const [startDateStr, setStartDateStr] = useState<string>(() => {
    const today = new Date().toISOString().split('T')[0];
    return localStorage.getItem('spdse_plan_start_date') || today;
  });

  const [selectedRole, setSelectedRole] = useState<string>(targetRole);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [expandedDay, setExpandedDay] = useState<number | null>(1); // Default expand Day 1 so it's immediately active!

  // Completed Days & Task Tracking
  const [completedDays, setCompletedDays] = useState<Record<number, boolean>>(() => {
    try {
      const stored = localStorage.getItem('spdse_completed_days');
      if (stored) return JSON.parse(stored);
    } catch {}
    return {};
  });

  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>(() => {
    try {
      const stored = localStorage.getItem('spdse_completed_day_tasks');
      if (stored) return JSON.parse(stored);
    } catch {}
    return {};
  });

  // Solved problems tracking within study plan
  const [solvedProblemIds, setSolvedProblemIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('spdse_solved_problems');
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  });

  // Sync role changes
  useEffect(() => {
    setSelectedRole(targetRole);
  }, [targetRole]);

  const handleRoleChange = (roleId: string) => {
    setSelectedRole(roleId);
    if (onTargetRoleChange) onTargetRoleChange(roleId);
  };

  // Save config changes
  useEffect(() => {
    localStorage.setItem('spdse_plan_days', totalDays.toString());
    localStorage.setItem('spdse_plan_daily_hours', dailyHours.toString());
    localStorage.setItem('spdse_plan_start_date', startDateStr);
  }, [totalDays, dailyHours, startDateStr]);

  const toggleDayComplete = (day: number) => {
    const updated = { ...completedDays, [day]: !completedDays[day] };
    setCompletedDays(updated);
    localStorage.setItem('spdse_completed_days', JSON.stringify(updated));
  };

  const toggleTaskComplete = (taskKey: string) => {
    const updated = { ...completedTasks, [taskKey]: !completedTasks[taskKey] };
    setCompletedTasks(updated);
    localStorage.setItem('spdse_completed_day_tasks', JSON.stringify(updated));
  };

  const toggleProblemComplete = (pid: string) => {
    let updated: string[];
    if (solvedProblemIds.includes(pid)) {
      updated = solvedProblemIds.filter(id => id !== pid);
    } else {
      updated = [...solvedProblemIds, pid];
    }
    setSolvedProblemIds(updated);
    localStorage.setItem('spdse_solved_problems', JSON.stringify(updated));
  };

  // Preset Cadences
  const handlePresetSelect = (days: number) => {
    setTotalDays(days);
    setExpandedDay(1);
  };

  // Dynamic Day Plan Generation Engine
  const scheduleDays: DayPlan[] = useMemo(() => {
    const days: DayPlan[] = [];

    // Phase distribution math
    const p1Len = Math.max(2, Math.round(totalDays * 0.30));
    const p2Len = Math.max(2, Math.round(totalDays * 0.35));
    const p3Len = Math.max(2, Math.round(totalDays * 0.23));
    const p4Len = totalDays - (p1Len + p2Len + p3Len);

    // Group Codeforces problems by pattern
    const patternMap = new Map<PatternId, CodeforcesProblem[]>();
    for (const p of codeforcesProblems) {
      if (!patternMap.has(p.pattern)) patternMap.set(p.pattern, []);
      patternMap.get(p.pattern)!.push(p);
    }

    // Pattern Syllabus Rotation
    const phase1Patterns: { pat: PatternId; title: string; cues: string[] }[] = [
      { pat: 'arrays_and_prefix_sums', title: 'Arrays & 1D Prefix Sums', cues: ['Storage racks', 'Subarray sum queries', 'O(1) range updates'] },
      { pat: 'two_pointers_and_sliding_window', title: 'Two Pointers & Sliding Window', cues: ['Monotonic window expansion', 'Target pair convergence', 'Subsegment contraction'] },
      { pat: 'hashing', title: 'Hashing & Frequency Counting', cues: ['Two-sum complements', 'Distinct element window', 'Coordinate compression'] },
      { pat: 'sorting_and_greedy', title: 'Sorting & Greedy Mechanics', cues: ['Custom comparator sorting', 'Deadline intervals', 'Power/bonus prioritization'] },
      { pat: 'bit_tricks', title: 'Bitwise Invariants & XOR', cues: ['Lowest set bit isolation', 'XOR cancellation', 'Subset mask generation'] },
      { pat: 'simulation_and_implementation', title: 'Grid Navigation & Simulation', cues: ['Direction vectors dx/dy', 'State machine stepping', 'Boundary reflection guards'] }
    ];

    const phase2Patterns: { pat: PatternId; title: string; cues: string[] }[] = [
      { pat: 'binary_search', title: 'Binary Search on Answer (Part 1)', cues: ['Monotonic predicate isPossible(mid)', 'Ship packages in D days', 'Minimax allocation'] },
      { pat: 'binary_search', title: 'Binary Search on Answer (Part 2)', cues: ['Heroes & Villains archetype', 'K-split subarray sums', 'Upper/lower bound indexes'] },
      { pat: 'sorting_and_greedy', title: 'Interval Scheduling & Two Pointers', cues: ['Non-overlapping interval greedy', 'Range of Towers archetype', 'Greedy exchange proof'] },
      { pat: 'stack_and_monotonic_stack', title: 'Monotonic Stack (Next Greater)', cues: ['O(N) Next Greater Element', 'Largest rectangle in histogram', 'Stock span indices'] },
      { pat: 'dp', title: 'Introductory 1D Dynamic Programming', cues: ['House Robber transitions', 'Maximum path metrics', 'State memoization table'] },
      { pat: 'number_theory_and_math', title: 'Number Theory & Modulo Math', cues: ['Euclidean GCD', 'Fast binary exponentiation', 'Prime sieve of Eratosthenes'] },
      { pat: 'strings', title: 'String Invariants & Pattern Matching', cues: ['Prefix functions (KMP)', 'Rolling polynomial hash', 'Anagram signatures'] }
    ];

    const phase3Patterns: { pat: PatternId; title: string; cues: string[] }[] = [
      { pat: 'dp', title: '2D Grid DP & Matrix Path Costs', cues: ['Conveyor belt switching penalty', 'Unique paths with obstacle keys', 'Prefix DP transitions'] },
      { pat: 'dp', title: '0/1 Knapsack & Partition DP', cues: ['Subset sum equivalence', '1D rolling array compression', 'Bounded item choices'] },
      { pat: 'graphs_and_bfs_dfs', title: 'Graphs (BFS & Connected Components)', cues: ['Adjacency list queue traversal', 'Level-order shortest path', 'Connected islands'] },
      { pat: 'graphs_and_bfs_dfs', title: 'Graphs (Disjoint Set Union & Dijkstra)', cues: ['DSU with path compression', 'Weighted edge relaxation', 'Roads & Libraries archetype'] },
      { pat: 'dp', title: 'Partial Score Subtask Strategy', cues: ['Writing O(N^2) brute force', 'Subtask testcase banking', 'Small bounds fallback'] }
    ];

    const phase4Patterns: { pat: PatternId; title: string; cues: string[] }[] = [
      { pat: 'simulation_and_implementation', title: 'Full 180-Minute Mock Assessment', cues: ['Time management across P1/P2/P3', 'Zero syntax penalties', 'HackerEarth test submission'] },
      { pat: 'number_theory_and_math', title: 'Pen-and-Paper Surprise Coding & Oral DSA', cues: ['Writing clean syntax on blank paper', 'Explaining complexity out loud', 'Vtable & SQL dry runs'] },
      { pat: 'bit_tricks', title: 'Last 48 Hours: Mistake Log & SRS Review', cues: ['Revising past failed submissions', 'Fast I/O template memorization', 'Edge-case boundary checklist'] }
    ];

    // Compute base start date
    const startObj = new Date(startDateStr);

    for (let dayNum = 1; dayNum <= totalDays; dayNum++) {
      // Calculate date
      const currDate = new Date(startObj);
      currDate.setDate(startObj.getDate() + (dayNum - 1));
      const dateStr = currDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

      let phaseId: 1 | 2 | 3 | 4 = 1;
      let phaseName = 'Phase 1: P1 Guarantee';
      let phaseBadge = 'P1 Mastery';
      let patternMeta = phase1Patterns[(dayNum - 1) % phase1Patterns.length];

      if (dayNum <= p1Len) {
        phaseId = 1;
        phaseName = 'Phase 1: P1 Guarantee';
        phaseBadge = 'P1 Mastery';
        patternMeta = phase1Patterns[(dayNum - 1) % phase1Patterns.length];
      } else if (dayNum <= p1Len + p2Len) {
        phaseId = 2;
        phaseName = 'Phase 2: Core Cutoff & P2 Mastery';
        phaseBadge = 'DSE / SP Cutoff';
        patternMeta = phase2Patterns[(dayNum - p1Len - 1) % phase2Patterns.length];
      } else if (dayNum <= p1Len + p2Len + p3Len) {
        phaseId = 3;
        phaseName = 'Phase 3: SP Breakthrough';
        phaseBadge = 'Hard DP & Graph';
        patternMeta = phase3Patterns[(dayNum - p1Len - p2Len - 1) % phase3Patterns.length];
      } else {
        phaseId = 4;
        phaseName = 'Phase 4: Timed Simulations & Interview';
        phaseBadge = 'Exam Simulation';
        patternMeta = phase4Patterns[(dayNum - p1Len - p2Len - p3Len - 1) % phase4Patterns.length];
      }

      // Pick 2-3 matching problems from this pattern
      const candidateProbs = patternMap.get(patternMeta.pat) || [];
      const tierFilter = phaseId === 1 ? 'P1 Easy' : phaseId === 2 ? 'P2 Medium' : 'P3 Hard';
      const filteredTier = candidateProbs.filter(p => p.tier === tierFilter);
      const chosenList = filteredTier.length >= 2 ? filteredTier : candidateProbs;
      
      const probIndexStart = ((dayNum * 2) % Math.max(1, chosenList.length - 2));
      const assignedProblems = chosenList.slice(probIndexStart, probIndexStart + (dailyHours >= 5 ? 3 : 2));

      // Calculate Time Allocation based on Daily Hours
      const totalMins = dailyHours * 60;
      const theoryMins = Math.max(15, Math.round(totalMins * 0.20));
      const codingMins = Math.max(30, Math.round(totalMins * 0.55));
      const reviewMins = totalMins - theoryMins - codingMins;

      // Assign PYQs / Mock Sets for milestone days
      let assignedPYQId: string | undefined;
      let mockSetId: string | undefined;
      if (dayNum === 1) assignedPYQId = 'PYQ-01';
      else if (dayNum === Math.round(totalDays * 0.35)) assignedPYQId = 'PYQ-02';
      else if (dayNum === Math.round(totalDays * 0.65)) assignedPYQId = 'PYQ-35';
      
      if (phaseId === 4 || dayNum === Math.round(totalDays * 0.5) || dayNum === totalDays) {
        mockSetId = `SET-${String(((dayNum * 3) % 52) + 1).padStart(2, '0')}`;
      }

      // Interview / concept focus
      const interviewQuestion = oralInterviewQuestions[(dayNum * 3) % oralInterviewQuestions.length];

      days.push({
        dayNumber: dayNum,
        dateStr,
        phaseId,
        phaseName,
        phaseBadge,
        topicTitle: patternMeta.title,
        patternId: patternMeta.pat,
        patternName: patternMeta.title,
        disguisedCues: patternMeta.cues,
        assignedProblems: assignedProblems.length > 0 ? assignedProblems : candidateProbs.slice(0, 2),
        assignedPYQId,
        mockSetId,
        interviewTopic: interviewQuestion ? interviewQuestion.question : undefined,
        tasks: [
          `Study disguised story cues for ${patternMeta.title} (${theoryMins}m)`,
          `Implement ${assignedProblems[0]?.title || 'Core Problem'} in Java/C++/Python (${Math.round(codingMins / 2)}m)`,
          assignedProblems[1] ? `Solve ${assignedProblems[1].title} & verify edge cases (${Math.round(codingMins / 2)}m)` : `Verify boundary edge cases (N=1, negative numbers, overflow)`,
          `Review mistake log & dry-run oral questions (${reviewMins}m)`
        ],
        timeAllocation: {
          theoryMinutes: theoryMins,
          codingMinutes: codingMins,
          reviewMinutes: reviewMins
        }
      });
    }

    return days;
  }, [totalDays, dailyHours, startDateStr]);

  const completedCount = scheduleDays.filter(d => completedDays[d.dayNumber]).length;
  const progressPercent = Math.round((completedCount / scheduleDays.length) * 100);
  const totalStudyHours = totalDays * dailyHours;

  // Role Readiness Diagnostic Analysis
  const roleReadinessAnalysis = useMemo(() => {
    const roleObj = rolesData.find(r => r.id === selectedRole) || rolesData[1];
    const estimatedNeededHours = roleObj.estimatedPrepHours;
    const ratio = totalStudyHours / estimatedNeededHours;

    let verdict = 'Optimal Budget';
    let detail = `Allocated ${totalStudyHours} total hours for ${roleObj.name}. This comfortably satisfies the ~${estimatedNeededHours}h recommended benchmark.`;
    let color = 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800';

    if (ratio < 0.7) {
      verdict = 'High Triage / Fast-Paced';
      detail = `With ${totalStudyHours}h vs recommended ${estimatedNeededHours}h for ${roleObj.name}, focus strictly on Phase 1 & Phase 2 must-do problems. Skip esoteric P4 algorithms.`;
      color = 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800';
    } else if (ratio >= 1.2) {
      verdict = 'High Probability / SP Mastery';
      detail = `${totalStudyHours}h provides extensive runway. You will comfortably finish all core P1/P2 problems and build deep partial-score mastery on P3 Hard DP.`;
      color = 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800';
    }

    return { verdict, detail, color, roleObj };
  }, [totalStudyHours, selectedRole]);

  // Client-Side iCalendar (.ics) Export
  const handleExportICS = () => {
    let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//SPDSE Prep//Study Plan Scheduler//EN\nCALSCALE:GREGORIAN\nMETHOD:PUBLISH\n";
    
    scheduleDays.forEach(day => {
      const startObj = new Date(startDateStr);
      startObj.setDate(startObj.getDate() + (day.dayNumber - 1));
      const year = startObj.getFullYear();
      const month = String(startObj.getMonth() + 1).padStart(2, '0');
      const date = String(startObj.getDate()).padStart(2, '0');
      const dateKey = `${year}${month}${date}`;

      const summary = `Day ${day.dayNumber}: ${day.topicTitle} (${dailyHours}h Study)`;
      const description = `Phase: ${day.phaseName}\\nTasks:\\n${day.tasks.map(t => `- ${t}`).join('\\n')}\\nTarget Problems: ${day.assignedProblems.map(p => p.title).join(', ')}`;

      icsContent += `BEGIN:VEVENT\nUID:spdse-plan-day-${day.dayNumber}-${Date.now()}@spdse-prep.vercel.app\nDTSTAMP:${year}${month}${date}T000000Z\nDTSTART;VALUE=DATE:${dateKey}\nDTEND;VALUE=DATE:${dateKey}\nSUMMARY:${summary}\nDESCRIPTION:${description}\nSTATUS:CONFIRMED\nEND:VEVENT\n`;
    });

    icsContent += "END:VCALENDAR\n";

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `spdse-prep-${totalDays}d-plan.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-mono text-accent dark:text-accent-dark uppercase tracking-wider mb-1">
          <CalendarDays size={14} />
          <span>Dynamic Algorithmic Flight Plan</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          {totalDays}-Day Adaptive Study Plan
        </h1>
        <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 max-w-2xl leading-relaxed">
          Calibrated to your exact available runway ({totalDays} days) and daily bandwidth ({dailyHours}h/day). Click on any day to open its live **Mission Control**, inspect assigned Codeforces problems, and launch verified solutions directly.
        </p>
      </div>

      {/* Interactive Controls & Parameter Tuner */}
      <div className="p-4 rounded-sm border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-4">
        
        {/* Row 1: Target Role & Date Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-3 border-b border-neutral-100 dark:border-neutral-800">
          <div>
            <label className="block text-[11px] font-mono text-neutral-500 uppercase tracking-wider mb-1">
              Target Assessment Role:
            </label>
            <select
              value={selectedRole}
              onChange={(e) => handleRoleChange(e.target.value)}
              className="w-full p-2 border border-neutral-300 dark:border-neutral-700 rounded-sm bg-paper-50 dark:bg-neutral-800 font-mono text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-accent"
            >
              {rolesData.map(r => (
                <option key={r.id} value={r.id}>{r.name} ({r.ctc})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-neutral-500 uppercase tracking-wider mb-1">
              Plan Start Date:
            </label>
            <input
              type="date"
              value={startDateStr}
              onChange={(e) => setStartDateStr(e.target.value)}
              className="w-full p-2 border border-neutral-300 dark:border-neutral-700 rounded-sm bg-paper-50 dark:bg-neutral-800 font-mono text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-accent"
            />
          </div>
        </div>

        {/* Row 2: Total Days Slider & Quick Presets */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-neutral-700 dark:text-neutral-300 font-semibold flex items-center gap-1.5">
              <Calendar size={13} className="text-accent dark:text-accent-dark" />
              <span>Plan Duration: <strong className="text-accent dark:text-accent-dark font-mono text-sm">{totalDays} Days</strong></span>
            </span>
            <div className="flex items-center gap-1 text-[11px] font-mono text-neutral-400">
              <span>Range: 10d – 45d</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="range"
              min="10"
              max="45"
              step="1"
              value={totalDays}
              onChange={(e) => {
                setTotalDays(Number(e.target.value));
                setExpandedDay(1);
              }}
              className="flex-1 accent-accent cursor-pointer"
            />
          </div>

          {/* Preset Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            <span className="text-[10px] font-mono text-neutral-400 mr-1">Presets:</span>
            {[
              { days: 10, label: '10d Crash Sprint' },
              { days: 14, label: '14d Express' },
              { days: 21, label: '21d Standard' },
              { days: 30, label: '30d Intensive' },
              { days: 45, label: '45d Mastery' }
            ].map(p => (
              <button
                key={p.days}
                onClick={() => handlePresetSelect(p.days)}
                className={`px-2 py-0.5 text-[11px] font-mono rounded-sm border transition-colors ${
                  totalDays === p.days
                    ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border-neutral-900 dark:border-white font-bold'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:border-neutral-400'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Row 3: Daily Study Time Slider (1h to 8h) */}
        <div className="space-y-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-neutral-700 dark:text-neutral-300 font-semibold flex items-center gap-1.5">
              <Clock size={13} className="text-accent dark:text-accent-dark" />
              <span>Daily Study Time: <strong className="text-accent dark:text-accent-dark font-mono text-sm">{dailyHours} Hours / Day</strong></span>
            </span>
            <span className="font-mono text-[11px] text-neutral-400">
              Total Budget: <strong className="text-neutral-900 dark:text-white">{totalStudyHours} Hours</strong>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="range"
              min="1"
              max="8"
              step="1"
              value={dailyHours}
              onChange={(e) => setDailyHours(Number(e.target.value))}
              className="flex-1 accent-accent cursor-pointer"
            />
            <span className="w-12 text-right font-mono text-xs font-bold text-neutral-900 dark:text-white">
              {dailyHours}h/day
            </span>
          </div>
        </div>

      </div>

      {/* Readiness & Total Metric Card */}
      <div className={`p-4 rounded-sm border ${roleReadinessAnalysis.color} space-y-2`}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Zap size={14} />
            <span className="font-mono font-bold text-xs uppercase tracking-wider">
              Timeline Readiness Diagnostic: {roleReadinessAnalysis.verdict}
            </span>
          </div>
          <span className="font-mono text-[11px] font-semibold">
            {totalDays} Days × {dailyHours}h = {totalStudyHours} Hours Total
          </span>
        </div>
        <p className="text-xs leading-relaxed font-sans">
          {roleReadinessAnalysis.detail}
        </p>
      </div>

      {/* Progress & Controls Strip */}
      <div className="p-3.5 rounded-sm border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        
        {/* Progress bar */}
        <div className="space-y-1 w-full sm:w-72">
          <div className="flex justify-between text-[11px] font-mono">
            <span className="text-neutral-500">Curriculum Progress:</span>
            <span className="font-bold text-neutral-900 dark:text-white">
              {completedCount} of {totalDays} Days ({progressPercent}%)
            </span>
          </div>
          <div className="w-full h-2 bg-neutral-200 dark:bg-neutral-800 rounded-sm overflow-hidden">
            <div
              className="h-full bg-accent dark:bg-accent-dark transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Actions: View Switcher, iCal Export */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="flex border border-neutral-200 dark:border-neutral-700 rounded-sm p-0.5 font-mono text-[11px]">
            <button
              onClick={() => setViewMode('list')}
              className={`px-2 py-1 rounded-sm ${viewMode === 'list' ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold' : 'text-neutral-500'}`}
            >
              List View
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-2 py-1 rounded-sm ${viewMode === 'calendar' ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold' : 'text-neutral-500'}`}
            >
              Calendar Matrix
            </button>
          </div>

          <button
            onClick={handleExportICS}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 font-mono text-[11px] rounded-sm border border-neutral-300 dark:border-neutral-700 transition-colors"
            title="Download .ics schedule for Apple Calendar, Google Calendar, or Outlook"
          >
            <Download size={12} />
            <span>Export Calendar (.ics)</span>
          </button>
        </div>

      </div>

      {/* CALENDAR MATRIX VIEW */}
      {viewMode === 'calendar' && (
        <div className="p-4 rounded-sm border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-neutral-500">
            <span>High-Density Calendar Matrix ({totalDays} Days)</span>
            <span>Click any day tile to open its Mission Control below</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
            {scheduleDays.map(d => {
              const isDone = !!completedDays[d.dayNumber];
              const isSelected = expandedDay === d.dayNumber;

              let phaseBg = 'border-blue-200 dark:border-blue-900/60 bg-blue-50/20';
              if (d.phaseId === 2) phaseBg = 'border-amber-200 dark:border-amber-900/60 bg-amber-50/20';
              if (d.phaseId === 3) phaseBg = 'border-purple-200 dark:border-purple-900/60 bg-purple-50/20';
              if (d.phaseId === 4) phaseBg = 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/20';

              return (
                <button
                  key={d.dayNumber}
                  onClick={() => {
                    setExpandedDay(d.dayNumber);
                    setViewMode('list');
                  }}
                  className={`p-2.5 rounded-sm border text-left transition-all flex flex-col justify-between min-h-[75px] ${phaseBg} ${
                    isSelected ? 'ring-2 ring-accent dark:ring-accent-dark' : 'hover:scale-[1.02]'
                  } ${isDone ? 'opacity-60 bg-emerald-100/40 dark:bg-emerald-950/20' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-neutral-900 dark:text-white">
                      Day {d.dayNumber}
                    </span>
                    {isDone && <CheckCircle2 size={13} className="text-emerald-600 dark:text-emerald-400" />}
                  </div>
                  <div className="text-[10px] text-neutral-500 font-mono">{d.dateStr}</div>
                  <div className="text-[10px] font-semibold text-neutral-800 dark:text-neutral-200 truncate mt-1">
                    {d.topicTitle}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* LIST VIEW / MISSION CONTROL CARDS */}
      <div className="space-y-3">
        {scheduleDays.map((item) => {
          const isDone = !!completedDays[item.dayNumber];
          const isExpanded = expandedDay === item.dayNumber;

          let phaseColorBadge = 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300';
          if (item.phaseId === 2) phaseColorBadge = 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300';
          if (item.phaseId === 3) phaseColorBadge = 'bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300';
          if (item.phaseId === 4) phaseColorBadge = 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300';

          return (
            <div
              key={item.dayNumber}
              className={`rounded-sm border transition-all ${
                isExpanded
                  ? 'border-neutral-400 dark:border-neutral-600 bg-white dark:bg-neutral-900 shadow-md ring-1 ring-neutral-300 dark:ring-neutral-700'
                  : isDone
                    ? 'border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/20 dark:bg-emerald-950/10'
                    : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700'
              }`}
            >
              {/* Day Card Header Bar */}
              <div
                onClick={() => setExpandedDay(isExpanded ? null : item.dayNumber)}
                className="p-3.5 flex items-start justify-between gap-3 cursor-pointer select-none"
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleDayComplete(item.dayNumber);
                    }}
                    className={`mt-0.5 w-5 h-5 rounded-sm border flex items-center justify-center transition-colors ${
                      isDone
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-neutral-300 dark:border-neutral-600 hover:border-neutral-400 bg-white dark:bg-neutral-800'
                    }`}
                    aria-label="Toggle Complete Day"
                  >
                    {isDone && <CheckCircle2 size={13} />}
                  </button>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-neutral-900 dark:text-white">
                        Day {String(item.dayNumber).padStart(2, '0')} · {item.dateStr}
                      </span>
                      <span className="font-bold text-xs text-neutral-900 dark:text-white">
                        {item.topicTitle}
                      </span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-medium ${phaseColorBadge}`}>
                        {item.phaseBadge}
                      </span>
                      {isDone && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 font-bold">
                          COMPLETED ✓
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-neutral-500 flex items-center gap-2 flex-wrap">
                      <span>Cues: {item.disguisedCues.join(' · ')}</span>
                      <span>·</span>
                      <span className="font-mono text-accent dark:text-accent-dark font-medium">
                        {item.assignedProblems.length} Targeted Problems
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-mono text-[11px] text-neutral-400">
                    {dailyHours}h Study
                  </span>
                  <div className="text-neutral-400">
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>
              </div>

              {/* EXPANDED DAY MISSION CONTROL DRAWER */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-neutral-100 dark:border-neutral-800 space-y-4 text-xs">
                  
                  {/* Today's Schedule Time Budgeting */}
                  <div className="p-3 rounded-sm bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/60 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono text-neutral-600 dark:text-neutral-400">
                      <span className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                        <Clock size={12} className="text-accent dark:text-accent-dark" />
                        <span>Today's {dailyHours}h Time Budget Allocation:</span>
                      </span>
                      <span>{item.timeAllocation.theoryMinutes}m Theory · {item.timeAllocation.codingMinutes}m Coding · {item.timeAllocation.reviewMinutes}m Review</span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-mono">
                      <div className="p-2 rounded bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                        <div className="text-neutral-400 uppercase text-[9px]">1. Invariant & Disguises</div>
                        <div className="font-bold text-neutral-900 dark:text-white mt-0.5">{item.timeAllocation.theoryMinutes} Mins</div>
                        <div className="text-[10px] text-neutral-500 mt-0.5">Read pattern template & story cues</div>
                      </div>

                      <div className="p-2 rounded bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                        <div className="text-neutral-400 uppercase text-[9px]">2. Hands-on Problem Solving</div>
                        <div className="font-bold text-neutral-900 dark:text-white mt-0.5">{item.timeAllocation.codingMinutes} Mins</div>
                        <div className="text-[10px] text-neutral-500 mt-0.5">Write Fast I/O code for {item.assignedProblems.length} problems</div>
                      </div>

                      <div className="p-2 rounded bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                        <div className="text-neutral-400 uppercase text-[9px]">3. Edge Cases & Mistake Log</div>
                        <div className="font-bold text-neutral-900 dark:text-white mt-0.5">{item.timeAllocation.reviewMinutes} Mins</div>
                        <div className="text-[10px] text-neutral-500 mt-0.5">SRS review & oral dry run</div>
                      </div>
                    </div>
                  </div>

                  {/* Assigned Practice Problems */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-mono font-bold uppercase text-[10px] text-accent dark:text-accent-dark tracking-wider flex items-center gap-1.5">
                        <Code2 size={12} />
                        <span>Assigned Practice Problems for Day {item.dayNumber} ({item.assignedProblems.length}):</span>
                      </div>
                      <span className="text-[10px] font-mono text-neutral-400">
                        Click 'Solve & View Solution' to launch in-browser modal
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-2.5">
                      {item.assignedProblems.map(prob => {
                        const isProbSolved = solvedProblemIds.includes(prob.id);

                        return (
                          <div
                            key={prob.id}
                            className="p-3 rounded-sm border border-neutral-200 dark:border-neutral-700/80 bg-paper-100/40 dark:bg-neutral-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono text-xs font-bold text-neutral-900 dark:text-white">
                                  {prob.title}
                                </span>
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-accent/15 dark:bg-accent/25 text-accent dark:text-accent-dark font-bold">
                                  {prob.tier} · CF {prob.rating}
                                </span>
                                <span className="text-[10px] font-mono text-neutral-500">
                                  CF {prob.contestId}{prob.index}
                                </span>
                              </div>

                              <p className="text-[11px] text-neutral-600 dark:text-neutral-400 max-w-xl line-clamp-2">
                                {prob.paraphrase}
                              </p>
                            </div>

                            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                              <button
                                onClick={() => {
                                  if (onViewProblemDetails) onViewProblemDetails(prob);
                                }}
                                className="px-3 py-1.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-mono font-bold rounded-sm hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors flex items-center gap-1.5 shadow-sm"
                              >
                                <Code2 size={12} />
                                <span>Solve & View Solution</span>
                              </button>

                              <a
                                href={prob.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-white rounded border border-neutral-300 dark:border-neutral-700"
                                title="Open on Codeforces portal"
                              >
                                <ExternalLink size={13} />
                              </a>

                              <button
                                onClick={() => toggleProblemComplete(prob.id)}
                                className={`p-1.5 rounded border transition-colors ${
                                  isProbSolved
                                    ? 'bg-emerald-600 border-emerald-600 text-white'
                                    : 'border-neutral-300 dark:border-neutral-700 text-neutral-400 hover:border-neutral-400'
                                }`}
                                title={isProbSolved ? 'Solved' : 'Mark Solved'}
                              >
                                <CheckCircle2 size={13} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Assigned Mock Set or PYQ Spotlight (if scheduled) */}
                  {(item.assignedPYQId || item.mockSetId) && (
                    <div className="p-3 rounded-sm bg-accent/5 dark:bg-accent/10 border border-accent/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <div className="font-mono font-bold uppercase text-[10px] text-accent dark:text-accent-dark tracking-wider">
                          Special Assessment Focus for Day {item.dayNumber}:
                        </div>
                        <div className="font-bold text-xs text-neutral-900 dark:text-white mt-0.5">
                          {item.assignedPYQId ? `Infosys Verified PYQ: ${item.assignedPYQId}` : `Timed Mock Exam Set: ${item.mockSetId}`}
                        </div>
                        <div className="text-[11px] text-neutral-500 mt-0.5">
                          {item.assignedPYQId
                            ? 'Compare your solution against the verified Infosys subtask grading rubric.'
                            : 'Simulate full 180-minute HackerEarth assessment conditions with countdown timer.'}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {item.assignedPYQId && (
                          <button
                            onClick={() => {
                              if (onNavigate) onNavigate('pyq', item.assignedPYQId);
                            }}
                            className="px-3 py-1 bg-accent text-white font-mono text-xs rounded-sm hover:bg-accent-dark transition-colors flex items-center gap-1"
                          >
                            <span>Open PYQ #{item.assignedPYQId}</span>
                            <ArrowRight size={12} />
                          </button>
                        )}

                        {item.mockSetId && (
                          <button
                            onClick={() => {
                              const s = predictedSets.find(x => x.id.toUpperCase() === item.mockSetId) || predictedSets[0];
                              if (onLaunchMockSet) onLaunchMockSet(s);
                              else if (onNavigate) onNavigate('mock-exam');
                            }}
                            className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-mono text-xs rounded-sm transition-colors flex items-center gap-1"
                          >
                            <Timer size={12} />
                            <span>Launch Mock Exam</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Oral Interview & Dry Run Question */}
                  {item.interviewTopic && (
                    <div className="p-2.5 rounded bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 flex items-center justify-between gap-3 text-[11px]">
                      <div>
                        <strong className="text-amber-900 dark:text-amber-200 font-mono text-[10px] uppercase block">
                          Technical Round Oral Grilling Focus:
                        </strong>
                        <span className="text-amber-800 dark:text-amber-300">
                          "{item.interviewTopic}"
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          if (onNavigate) onNavigate('interview');
                        }}
                        className="text-amber-900 dark:text-amber-200 hover:underline font-mono text-[11px] shrink-0 font-bold"
                      >
                        Practice Oral Q&A →
                      </button>
                    </div>
                  )}

                  {/* Daily Step-by-Step Task Checklist */}
                  <div className="space-y-1.5 pt-1">
                    <div className="font-mono font-bold uppercase text-[10px] text-neutral-400">
                      Day {item.dayNumber} Action Checklist:
                    </div>
                    <div className="space-y-1">
                      {item.tasks.map((task, tIdx) => {
                        const taskKey = `d${item.dayNumber}_t${tIdx}`;
                        const isTaskDone = !!completedTasks[taskKey];

                        return (
                          <div
                            key={tIdx}
                            onClick={() => toggleTaskComplete(taskKey)}
                            className={`p-2 rounded border flex items-center gap-2.5 cursor-pointer transition-colors ${
                              isTaskDone
                                ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40 text-neutral-400 line-through'
                                : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isTaskDone}
                              onChange={() => {}} // handled by parent onClick
                              className="accent-accent w-3.5 h-3.5"
                            />
                            <span className="text-xs">{task}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Day Footer Action Buttons */}
                  <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (onNavigate) onNavigate('patterns', item.patternId);
                        }}
                        className="px-2.5 py-1 text-xs font-mono text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white border border-neutral-200 dark:border-neutral-700 rounded flex items-center gap-1.5"
                      >
                        <Layers size={12} />
                        <span>Study {item.patternName} Cheat Sheet</span>
                      </button>

                      <button
                        onClick={() => {
                          if (onNavigate) onNavigate('trainer');
                        }}
                        className="px-2.5 py-1 text-xs font-mono text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white border border-neutral-200 dark:border-neutral-700 rounded flex items-center gap-1.5"
                      >
                        <Target size={12} />
                        <span>Run 10 Pattern Drills</span>
                      </button>
                    </div>

                    <button
                      onClick={() => toggleDayComplete(item.dayNumber)}
                      className={`px-3 py-1 rounded-sm text-xs font-mono font-bold transition-colors ${
                        isDone
                          ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                    >
                      {isDone ? 'Mark Day Incomplete' : 'Mark Entire Day as Complete ✓'}
                    </button>
                  </div>

                </div>
              )}

            </div>
          );
        })}
      </div>

    </div>
  );
};
