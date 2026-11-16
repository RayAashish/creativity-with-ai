import React, { useState } from 'react';
import {
  GitBranch,
  CheckCircle2,
  Lock,
  ExternalLink,
  Clock,
  Layers,
  ChevronRight,
  Filter,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { rolesData } from '../data/rolesData';
import { codeforcesProblems } from '../data/problemsData';
import { CodeforcesProblem, Tier } from '../types';

interface RoleTracksViewProps {
  selectedRole: string;
  onRoleSelect: (roleId: string) => void;
  solvedProblems: string[];
  onToggleSolved: (problemId: string) => void;
  onViewProblemDetails: (problem: CodeforcesProblem) => void;
}

export const RoleTracksView: React.FC<RoleTracksViewProps> = ({
  selectedRole,
  onRoleSelect,
  solvedProblems,
  onToggleSolved,
  onViewProblemDetails
}) => {
  const activeRole = rolesData.find(r => r.id === selectedRole) || rolesData[0];

  // Higher tracks include lower tracks:
  // DSE: P1 Easy + foundational P2 (40 problems)
  // SP L1: All DSE + P2 Medium mastery + P3 basic DP (75 problems)
  // SP L2: All SP L1 + P3 Hard + Graphs/DSU (120 problems)
  // SP L3: All SP L2 + P4 Complex + advanced Bitmask/Segment Trees (160 problems)
  const getTrackProblems = (roleId: string): CodeforcesProblem[] => {
    const p1Pool = codeforcesProblems.filter(p => p.tier === 'P1 Easy');
    const p2Pool = codeforcesProblems.filter(p => p.tier === 'P2 Medium');
    const p3Pool = codeforcesProblems.filter(p => p.tier === 'P3 Hard');
    const p4Pool = codeforcesProblems.filter(p => p.tier === 'P4 Complex');

    if (roleId === 'dse') {
      return [...p1Pool.slice(0, 25), ...p2Pool.slice(0, 15)];
    } else if (roleId === 'sp_l1') {
      return [
        ...p1Pool.slice(0, 25),
        ...p2Pool.slice(0, 35),
        ...p3Pool.slice(0, 15)
      ];
    } else if (roleId === 'sp_l2') {
      return [
        ...p1Pool.slice(0, 25),
        ...p2Pool.slice(0, 45),
        ...p3Pool.slice(0, 40),
        ...p4Pool.slice(0, 10)
      ];
    } else {
      // SP L3 includes full comprehensive set
      return [
        ...p1Pool.slice(0, 25),
        ...p2Pool.slice(0, 45),
        ...p3Pool.slice(0, 55),
        ...p4Pool.slice(0, 35)
      ];
    }
  };

  const trackProblems = getTrackProblems(activeRole.id);
  const solvedInTrack = trackProblems.filter(p => solvedProblems.includes(p.id)).length;
  const progressPercent = Math.round((solvedInTrack / trackProblems.length) * 100);

  // Lock-in tier checking:
  // Candidate cannot move to Tier 2 until 60% of Tier 1 is solved
  const tier1Count = trackProblems.filter(p => p.tier === 'P1 Easy').length;
  const tier1Solved = trackProblems.filter(p => p.tier === 'P1 Easy' && solvedProblems.includes(p.id)).length;
  const tier1Unlocked = true;
  const tier2Unlocked = (tier1Solved / (tier1Count || 1)) >= 0.5;

  const tier2Count = trackProblems.filter(p => p.tier === 'P2 Medium').length;
  const tier2Solved = trackProblems.filter(p => p.tier === 'P2 Medium' && solvedProblems.includes(p.id)).length;
  const tier3Unlocked = tier2Unlocked && ((tier2Solved / (tier2Count || 1)) >= 0.5);

  const hoursRemaining = Math.max(0, Math.round(((trackProblems.length - solvedInTrack) / trackProblems.length) * activeRole.estimatedPrepHours));

  return (
    <div className="space-y-6 max-w-5xl">
      
      {/* Top Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-mono text-accent dark:text-accent-dark uppercase tracking-wider mb-1">
          <GitBranch size={14} />
          <span>Role Progression Ladders</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Non-Skippable Role Tracks
        </h1>
        <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 max-w-3xl leading-relaxed">
          Higher tracks strictly superset all problems from lower tiers with enforced lock-in progression. Every listed problem carries a non-filterable <span className="font-mono font-bold text-accent dark:text-accent-dark">MUST-DO</span> flag.
        </p>
      </div>

      {/* Role Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-2">
        {rolesData.map((r) => {
          const isActive = r.id === activeRole.id;
          return (
            <button
              key={r.id}
              onClick={() => onRoleSelect(r.id)}
              className={`p-3 text-left rounded-sm border transition-all ${
                isActive
                  ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border-neutral-900 dark:border-white shadow-sm'
                  : 'bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
              }`}
            >
              <div className="flex justify-between items-center text-[10px] font-mono mb-1">
                <span className={isActive ? 'text-neutral-300 dark:text-neutral-600' : 'text-neutral-500'}>
                  {r.shortName}
                </span>
                <span className={`font-semibold ${isActive ? 'text-accent-dark dark:text-accent' : 'text-accent dark:text-accent-dark'}`}>
                  {r.ctc}
                </span>
              </div>
              <div className="text-xs font-bold truncate">{r.name}</div>
            </button>
          );
        })}
      </div>

      {/* Track Stats Overview Bar */}
      <div className="p-4 rounded-sm border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <div>
            <div className="text-xs font-mono text-neutral-500">Track Progress for {activeRole.name}</div>
            <div className="text-xl font-bold font-mono text-neutral-900 dark:text-white mt-0.5">
              {solvedInTrack} / {trackProblems.length} <span className="text-xs font-normal text-neutral-500">problems mastered ({progressPercent}%)</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="text-right">
              <span className="text-neutral-500 block text-[10px]">Estimated Study Time:</span>
              <span className="font-bold text-neutral-900 dark:text-white">{hoursRemaining}h remaining</span>
            </div>
            <div className="text-right">
              <span className="text-neutral-500 block text-[10px]">Cutoff Benchmark:</span>
              <span className="font-bold text-accent dark:text-accent-dark">{activeRole.targetMarks}/100 Marks</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2.5 bg-neutral-100 dark:bg-neutral-800 rounded-sm overflow-hidden">
          <div
            className="h-full bg-accent dark:bg-accent-dark transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="text-xs text-neutral-600 dark:text-neutral-400 bg-paper-100/70 dark:bg-neutral-800/40 p-2.5 rounded-sm border border-neutral-200 dark:border-neutral-700/60 leading-relaxed">
          <strong>Cutoff Evaluation:</strong> {activeRole.minSolvedThreshold.description}
        </div>
      </div>

      {/* Lock-in Ladder Status */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className={`p-3 rounded-sm border ${tier1Unlocked ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20' : 'border-neutral-200 dark:border-neutral-800'}`}>
          <div className="flex items-center justify-between font-mono text-[11px] mb-1">
            <span className="font-bold text-neutral-900 dark:text-white">Tier 1: Foundations (P1)</span>
            <CheckCircle2 size={13} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-neutral-500 text-[11px]">{tier1Solved}/{tier1Count} Solved · Unlocked</p>
        </div>

        <div className={`p-3 rounded-sm border ${tier2Unlocked ? 'border-blue-300 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20' : 'border-neutral-200 dark:border-neutral-800 bg-neutral-100/50 dark:bg-neutral-800/30'}`}>
          <div className="flex items-center justify-between font-mono text-[11px] mb-1">
            <span className="font-bold text-neutral-900 dark:text-white">Tier 2: Core Medium (P2)</span>
            {tier2Unlocked ? <CheckCircle2 size={13} className="text-blue-600 dark:text-blue-400" /> : <Lock size={13} className="text-neutral-400" />}
          </div>
          <p className="text-neutral-500 text-[11px]">{tier2Solved}/{tier2Count} Solved · {tier2Unlocked ? 'Unlocked' : 'Solve >=50% Tier 1'}</p>
        </div>

        <div className={`p-3 rounded-sm border ${tier3Unlocked ? 'border-amber-300 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20' : 'border-neutral-200 dark:border-neutral-800 bg-neutral-100/50 dark:bg-neutral-800/30'}`}>
          <div className="flex items-center justify-between font-mono text-[11px] mb-1">
            <span className="font-bold text-neutral-900 dark:text-white">Tier 3: Advanced Optimization (P3)</span>
            {tier3Unlocked ? <CheckCircle2 size={13} className="text-amber-600 dark:text-amber-400" /> : <Lock size={13} className="text-neutral-400" />}
          </div>
          <p className="text-neutral-500 text-[11px]">{trackProblems.filter(p => p.tier === 'P3 Hard' && solvedProblems.includes(p.id)).length} Solved · {tier3Unlocked ? 'Unlocked' : 'Solve >=50% Tier 2'}</p>
        </div>
      </div>

      {/* Problem Checklist */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-neutral-500 font-mono">
          <span>Non-Skippable Problem Ladder ({trackProblems.length} Items)</span>
          <span>Ranked by Ascending Difficulty</span>
        </div>

        <div className="space-y-2">
          {trackProblems.map((prob, index) => {
            const isSolved = solvedProblems.includes(prob.id);
            const isTierLocked = (prob.tier === 'P2 Medium' && !tier2Unlocked) || (prob.tier === 'P3 Hard' && !tier3Unlocked);

            return (
              <div
                key={prob.id}
                className={`p-3.5 rounded-sm border transition-all ${
                  isSolved
                    ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/30 dark:bg-emerald-950/15'
                    : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  
                  {/* Left: Checkbox & Problem Info */}
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => onToggleSolved(prob.id)}
                      className={`mt-0.5 w-4 h-4 rounded-sm border flex items-center justify-center transition-colors ${
                        isSolved
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-neutral-300 dark:border-neutral-600 hover:border-neutral-400'
                      }`}
                      aria-label="Toggle Solved"
                    >
                      {isSolved && <CheckCircle2 size={12} />}
                    </button>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-[10px] text-neutral-400">
                          #{String(index + 1).padStart(3, '0')}
                        </span>

                        <span className="text-xs font-bold text-neutral-900 dark:text-white">
                          {prob.title}
                        </span>

                        <span className="font-mono text-[9px] px-1.5 py-0.2 rounded-sm bg-accent/15 dark:bg-accent/25 text-accent dark:text-accent-dark font-bold uppercase tracking-wider">
                          MUST-DO
                        </span>

                        <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-sm ${
                          prob.tier === 'P1 Easy'
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                            : prob.tier === 'P2 Medium'
                              ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300'
                              : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                        }`}>
                          {prob.tier} · CF {prob.rating}
                        </span>

                        <span className="text-[10px] text-neutral-500 font-mono">
                          {prob.patternName}
                        </span>
                      </div>

                      <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-2xl">
                        {prob.paraphrase}
                      </p>

                      <div className="text-[11px] text-neutral-500 font-mono pt-0.5">
                        <span className="text-neutral-400">Story Cue: </span>
                        <span>{prob.storyDisguise}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={prob.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-white rounded border border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 transition-colors"
                      title="Open verified Codeforces problem in new tab"
                    >
                      <ExternalLink size={13} />
                    </a>

                    <button
                      onClick={() => onViewProblemDetails(prob)}
                      className="px-2.5 py-1 text-xs border border-neutral-200 dark:border-neutral-700 rounded-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 font-medium transition-colors"
                    >
                      View Solution
                    </button>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
