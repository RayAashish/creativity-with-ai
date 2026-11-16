import React, { useState } from 'react';
import {
  GitBranch,
  CheckCircle2,
  Lock,
  Unlock,
  ExternalLink,
  Layers,
  Info,
  X,
  AlertTriangle,
  Flame,
  Check
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

  // Progression lock toggle (Default ON to enforce strict P1 -> P2 -> P3 discipline)
  const [enforceLock, setEnforceLock] = useState<boolean>(() => {
    return localStorage.getItem('spdse_enforce_lock') !== 'false';
  });

  // Filter problems by specific tier ('all' or specific Tier)
  const [tierFilter, setTierFilter] = useState<string>('all');

  // Locked alert toast message
  const [lockedAlert, setLockedAlert] = useState<string | null>(null);

  const handleToggleEnforceLock = () => {
    const nextVal = !enforceLock;
    setEnforceLock(nextVal);
    localStorage.setItem('spdse_enforce_lock', String(nextVal));
  };

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
  // Candidate cannot move to Tier 2 until 50% of Tier 1 is solved
  const tier1Count = trackProblems.filter(p => p.tier === 'P1 Easy').length;
  const tier1Solved = trackProblems.filter(p => p.tier === 'P1 Easy' && solvedProblems.includes(p.id)).length;
  const tier1Threshold = Math.max(1, Math.ceil(tier1Count * 0.5));
  const tier1Unlocked = true;

  const tier2Count = trackProblems.filter(p => p.tier === 'P2 Medium').length;
  const tier2Solved = trackProblems.filter(p => p.tier === 'P2 Medium' && solvedProblems.includes(p.id)).length;
  const tier2Threshold = Math.max(1, Math.ceil(tier2Count * 0.5));
  const tier2Unlocked = !enforceLock || tier1Solved >= tier1Threshold;

  const tier3Count = trackProblems.filter(p => p.tier === 'P3 Hard').length;
  const tier3Solved = trackProblems.filter(p => p.tier === 'P3 Hard' && solvedProblems.includes(p.id)).length;
  const tier3Threshold = Math.max(1, Math.ceil(tier3Count * 0.5));
  const tier3Unlocked = !enforceLock || (tier2Unlocked && tier2Solved >= tier2Threshold);

  const tier4Count = trackProblems.filter(p => p.tier === 'P4 Complex').length;
  const tier4Solved = trackProblems.filter(p => p.tier === 'P4 Complex' && solvedProblems.includes(p.id)).length;
  const tier4Threshold = Math.max(1, Math.ceil(tier4Count * 0.5));
  const tier4Unlocked = !enforceLock || (tier3Unlocked && tier3Solved >= tier3Threshold);

  // Helper to determine exact lock status and explanation for any problem
  const getProblemLockInfo = (prob: CodeforcesProblem) => {
    if (!enforceLock) {
      return { isLocked: false, reason: '', prereq: '' };
    }

    if (prob.tier === 'P1 Easy') {
      return { isLocked: false, reason: '', prereq: '' };
    }

    if (prob.tier === 'P2 Medium') {
      if (!tier2Unlocked) {
        const remaining = Math.max(0, tier1Threshold - tier1Solved);
        return {
          isLocked: true,
          prereq: 'Tier 1 (P1 Easy)',
          reason: `Locked: Solve ${remaining} more Tier 1 (P1 Easy) problem${remaining > 1 ? 's' : ''} to unlock Tier 2 (${tier1Solved}/${tier1Threshold} completed).`
        };
      }
      return { isLocked: false, reason: '', prereq: '' };
    }

    if (prob.tier === 'P3 Hard') {
      if (!tier2Unlocked) {
        return {
          isLocked: true,
          prereq: 'Tier 1 & Tier 2',
          reason: `Locked: Tier 2 requirements must be unlocked before accessing Tier 3.`
        };
      }
      if (!tier3Unlocked) {
        const remaining = Math.max(0, tier2Threshold - tier2Solved);
        return {
          isLocked: true,
          prereq: 'Tier 2 (P2 Medium)',
          reason: `Locked: Solve ${remaining} more Tier 2 (P2 Medium) problem${remaining > 1 ? 's' : ''} to unlock Tier 3 (${tier2Solved}/${tier2Threshold} completed).`
        };
      }
      return { isLocked: false, reason: '', prereq: '' };
    }

    if (prob.tier === 'P4 Complex') {
      if (!tier3Unlocked) {
        return {
          isLocked: true,
          prereq: 'Tier 2 & Tier 3',
          reason: `Locked: Unlock Tier 3 first before accessing Tier 4.`
        };
      }
      if (!tier4Unlocked) {
        const remaining = Math.max(0, tier4Threshold - tier3Solved);
        return {
          isLocked: true,
          prereq: 'Tier 3 (P3 Hard)',
          reason: `Locked: Solve ${remaining} more Tier 3 (P3 Hard) problems to unlock Tier 4 (${tier3Solved}/${tier4Threshold} completed).`
        };
      }
      return { isLocked: false, reason: '', prereq: '' };
    }

    return { isLocked: false, reason: '', prereq: '' };
  };

  const hoursRemaining = Math.max(0, Math.round(((trackProblems.length - solvedInTrack) / trackProblems.length) * activeRole.estimatedPrepHours));

  // Filtered problems list
  const filteredProblems = trackProblems.filter(p => {
    if (tierFilter === 'all') return true;
    return p.tier === tierFilter;
  });

  return (
    <div className="space-y-6 max-w-5xl">
      
      {/* Top Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-mono text-accent dark:text-accent-dark uppercase tracking-wider mb-1">
          <GitBranch size={14} />
          <span>Role Progression Ladders</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Non-Skippable Role Tracks
            </h1>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 max-w-3xl leading-relaxed">
              Higher tracks strictly superset all problems from lower tiers with enforced lock-in progression. Every listed problem carries a non-filterable <span className="font-mono font-bold text-accent dark:text-accent-dark">MUST-DO</span> flag.
            </p>
          </div>

          {/* Enforce Lock-in Toggle */}
          <div className="shrink-0">
            <button
              onClick={handleToggleEnforceLock}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm border text-xs font-mono transition-all ${
                enforceLock
                  ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 border-neutral-900 dark:border-neutral-100 font-bold shadow-xs'
                  : 'bg-paper-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-neutral-300 dark:border-neutral-700 hover:text-neutral-900 dark:hover:text-white'
              }`}
              title="Toggle progression lock enforcement"
            >
              {enforceLock ? (
                <>
                  <Lock size={12} className="text-amber-400 dark:text-amber-600" />
                  <span>Lock Progression: STRICT (ON)</span>
                </>
              ) : (
                <>
                  <Unlock size={12} className="text-emerald-500" />
                  <span>Lock Progression: FREE PRACTICE (OFF)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Locked Toast Alert */}
      {lockedAlert && (
        <div className="p-3.5 rounded-sm bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-xs flex items-center justify-between gap-3 animate-in fade-in duration-150 shadow-sm">
          <div className="flex items-center gap-2">
            <Lock size={15} className="text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="font-medium">{lockedAlert}</span>
          </div>
          <button
            onClick={() => setLockedAlert(null)}
            className="p-1 text-amber-700 dark:text-amber-300 hover:text-amber-950 dark:hover:text-white"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Role Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-2">
        {rolesData.map((r) => {
          const isActive = r.id === activeRole.id;
          return (
            <button
              key={r.id}
              onClick={() => {
                onRoleSelect(r.id);
                setTierFilter('all');
              }}
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

      {/* Lock-in Ladder Status Cards (Click to filter) */}
      <div>
        <div className="flex items-center justify-between text-xs text-neutral-500 font-mono mb-2">
          <span>Tier Progression Status</span>
          <span className="text-[11px]">Click a tier card to filter problem list</span>
        </div>

        <div className={`grid grid-cols-1 ${tier4Count > 0 ? 'sm:grid-cols-4' : 'sm:grid-cols-3'} gap-3 text-xs`}>
          
          {/* Tier 1: Foundations (P1) */}
          <div
            onClick={() => setTierFilter(tierFilter === 'P1 Easy' ? 'all' : 'P1 Easy')}
            className={`p-3 rounded-sm border cursor-pointer transition-all ${
              tierFilter === 'P1 Easy' ? 'ring-2 ring-emerald-500' : ''
            } ${
              tier1Solved >= tier1Threshold
                ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20'
                : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900'
            }`}
          >
            <div className="flex items-center justify-between font-mono text-[11px] mb-1">
              <span className="font-bold text-neutral-900 dark:text-white">Tier 1: Foundations (P1)</span>
              <CheckCircle2 size={13} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-neutral-600 dark:text-neutral-300 text-[11px] font-mono">
              {tier1Solved}/{tier1Count} Solved · <span className="text-emerald-600 dark:text-emerald-400 font-bold">Unlocked</span>
            </p>
            <div className="mt-1.5 w-full h-1 bg-neutral-200 dark:bg-neutral-800 rounded overflow-hidden">
              <div
                className="h-full bg-emerald-500"
                style={{ width: `${Math.min(100, (tier1Solved / (tier1Count || 1)) * 100)}%` }}
              />
            </div>
            <span className="text-[10px] text-neutral-400 block mt-1">
              Prereq for Tier 2: {tier1Threshold} problems
            </span>
          </div>

          {/* Tier 2: Core Medium (P2) */}
          <div
            onClick={() => setTierFilter(tierFilter === 'P2 Medium' ? 'all' : 'P2 Medium')}
            className={`p-3 rounded-sm border cursor-pointer transition-all ${
              tierFilter === 'P2 Medium' ? 'ring-2 ring-blue-500' : ''
            } ${
              tier2Unlocked
                ? 'border-blue-300 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20'
                : 'border-neutral-300 dark:border-neutral-800 bg-neutral-100/70 dark:bg-neutral-900/60 opacity-85'
            }`}
          >
            <div className="flex items-center justify-between font-mono text-[11px] mb-1">
              <span className="font-bold text-neutral-900 dark:text-white">Tier 2: Core Medium (P2)</span>
              {tier2Unlocked ? (
                <CheckCircle2 size={13} className="text-blue-600 dark:text-blue-400" />
              ) : (
                <Lock size={13} className="text-amber-500" />
              )}
            </div>
            <p className="text-neutral-600 dark:text-neutral-300 text-[11px] font-mono">
              {tier2Solved}/{tier2Count} Solved · {tier2Unlocked ? (
                <span className="text-blue-600 dark:text-blue-400 font-bold">Unlocked</span>
              ) : (
                <span className="text-amber-600 dark:text-amber-400 font-bold">Locked</span>
              )}
            </p>
            <div className="mt-1.5 w-full h-1 bg-neutral-200 dark:bg-neutral-800 rounded overflow-hidden">
              <div
                className="h-full bg-blue-500"
                style={{ width: `${Math.min(100, (tier2Solved / (tier2Count || 1)) * 100)}%` }}
              />
            </div>
            <span className="text-[10px] text-neutral-400 block mt-1">
              {tier2Unlocked ? `Prereq for Tier 3: ${tier2Threshold} problems` : `Requires ${tier1Threshold} P1 solved (${tier1Solved}/${tier1Threshold})`}
            </span>
          </div>

          {/* Tier 3: Advanced Optimization (P3) */}
          <div
            onClick={() => setTierFilter(tierFilter === 'P3 Hard' ? 'all' : 'P3 Hard')}
            className={`p-3 rounded-sm border cursor-pointer transition-all ${
              tierFilter === 'P3 Hard' ? 'ring-2 ring-amber-500' : ''
            } ${
              tier3Unlocked
                ? 'border-amber-300 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20'
                : 'border-neutral-300 dark:border-neutral-800 bg-neutral-100/70 dark:bg-neutral-900/60 opacity-85'
            }`}
          >
            <div className="flex items-center justify-between font-mono text-[11px] mb-1">
              <span className="font-bold text-neutral-900 dark:text-white">Tier 3: Advanced (P3)</span>
              {tier3Unlocked ? (
                <CheckCircle2 size={13} className="text-amber-600 dark:text-amber-400" />
              ) : (
                <Lock size={13} className="text-amber-500" />
              )}
            </div>
            <p className="text-neutral-600 dark:text-neutral-300 text-[11px] font-mono">
              {tier3Solved}/{tier3Count} Solved · {tier3Unlocked ? (
                <span className="text-amber-600 dark:text-amber-400 font-bold">Unlocked</span>
              ) : (
                <span className="text-amber-600 dark:text-amber-400 font-bold">Locked</span>
              )}
            </p>
            <div className="mt-1.5 w-full h-1 bg-neutral-200 dark:bg-neutral-800 rounded overflow-hidden">
              <div
                className="h-full bg-amber-500"
                style={{ width: `${Math.min(100, (tier3Solved / (tier3Count || 1)) * 100)}%` }}
              />
            </div>
            <span className="text-[10px] text-neutral-400 block mt-1">
              {tier3Unlocked ? 'SP L1/L2 High Tier' : `Requires ${tier2Threshold} P2 solved (${tier2Solved}/${tier2Threshold})`}
            </span>
          </div>

          {/* Tier 4: Complex Simulation (P4) if role has it */}
          {tier4Count > 0 && (
            <div
              onClick={() => setTierFilter(tierFilter === 'P4 Complex' ? 'all' : 'P4 Complex')}
              className={`p-3 rounded-sm border cursor-pointer transition-all ${
                tierFilter === 'P4 Complex' ? 'ring-2 ring-purple-500' : ''
              } ${
                tier4Unlocked
                  ? 'border-purple-300 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/20'
                  : 'border-neutral-300 dark:border-neutral-800 bg-neutral-100/70 dark:bg-neutral-900/60 opacity-85'
              }`}
            >
              <div className="flex items-center justify-between font-mono text-[11px] mb-1">
                <span className="font-bold text-neutral-900 dark:text-white">Tier 4: Complex (P4)</span>
                {tier4Unlocked ? (
                  <CheckCircle2 size={13} className="text-purple-600 dark:text-purple-400" />
                ) : (
                  <Lock size={13} className="text-amber-500" />
                )}
              </div>
              <p className="text-neutral-600 dark:text-neutral-300 text-[11px] font-mono">
                {tier4Solved}/{tier4Count} Solved · {tier4Unlocked ? (
                  <span className="text-purple-600 dark:text-purple-400 font-bold">Unlocked</span>
                ) : (
                  <span className="text-amber-600 dark:text-amber-400 font-bold">Locked</span>
                )}
              </p>
              <div className="mt-1.5 w-full h-1 bg-neutral-200 dark:bg-neutral-800 rounded overflow-hidden">
                <div
                  className="h-full bg-purple-500"
                  style={{ width: `${Math.min(100, (tier4Solved / (tier4Count || 1)) * 100)}%` }}
                />
              </div>
              <span className="text-[10px] text-neutral-400 block mt-1">
                {tier4Unlocked ? 'SP L2/L3 Mastery' : `Requires ${tier3Threshold} P3 solved (${tier3Solved}/${tier3Threshold})`}
              </span>
            </div>
          )}

        </div>
      </div>

      {/* Problem Checklist Header with Filter Pills */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-neutral-700 dark:text-neutral-300 font-bold">
              Non-Skippable Problem Ladder ({filteredProblems.length} Items)
            </span>
            {tierFilter !== 'all' && (
              <button
                onClick={() => setTierFilter('all')}
                className="text-[10px] text-accent dark:text-accent-dark underline hover:no-underline"
              >
                Clear filter (show all {trackProblems.length})
              </button>
            )}
          </div>

          {/* Quick Filter Tabs */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setTierFilter('all')}
              className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                tierFilter === 'all'
                  ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              All ({trackProblems.length})
            </button>
            <button
              onClick={() => setTierFilter('P1 Easy')}
              className={`px-2 py-0.5 rounded text-[11px] transition-colors flex items-center gap-1 ${
                tierFilter === 'P1 Easy'
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <span>P1 ({tier1Count})</span>
              <Check size={10} className="text-emerald-400" />
            </button>
            <button
              onClick={() => setTierFilter('P2 Medium')}
              className={`px-2 py-0.5 rounded text-[11px] transition-colors flex items-center gap-1 ${
                tierFilter === 'P2 Medium'
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <span>P2 ({tier2Count})</span>
              {tier2Unlocked ? <Check size={10} className="text-blue-400" /> : <Lock size={10} className="text-amber-500" />}
            </button>
            <button
              onClick={() => setTierFilter('P3 Hard')}
              className={`px-2 py-0.5 rounded text-[11px] transition-colors flex items-center gap-1 ${
                tierFilter === 'P3 Hard'
                  ? 'bg-amber-600 text-white font-semibold'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <span>P3 ({tier3Count})</span>
              {tier3Unlocked ? <Check size={10} className="text-amber-400" /> : <Lock size={10} className="text-amber-500" />}
            </button>
            {tier4Count > 0 && (
              <button
                onClick={() => setTierFilter('P4 Complex')}
                className={`px-2 py-0.5 rounded text-[11px] transition-colors flex items-center gap-1 ${
                  tierFilter === 'P4 Complex'
                    ? 'bg-purple-600 text-white font-semibold'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <span>P4 ({tier4Count})</span>
                {tier4Unlocked ? <Check size={10} className="text-purple-400" /> : <Lock size={10} className="text-amber-500" />}
              </button>
            )}
          </div>
        </div>

        {/* Problem List */}
        <div className="space-y-2">
          {filteredProblems.map((prob) => {
            const problemIndex = trackProblems.findIndex(p => p.id === prob.id);
            const isSolved = solvedProblems.includes(prob.id);
            const lockInfo = getProblemLockInfo(prob);
            const isLocked = lockInfo.isLocked;

            return (
              <div
                key={prob.id}
                className={`p-3.5 rounded-sm border transition-all ${
                  isSolved
                    ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/30 dark:bg-emerald-950/15'
                    : isLocked
                      ? 'border-dashed border-neutral-300 dark:border-neutral-800 bg-neutral-100/40 dark:bg-neutral-900/40 opacity-75'
                      : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  
                  {/* Left: Checkbox & Problem Info */}
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => {
                        if (isLocked) {
                          setLockedAlert(lockInfo.reason);
                          return;
                        }
                        onToggleSolved(prob.id);
                      }}
                      className={`mt-0.5 w-4 h-4 rounded-sm border flex items-center justify-center transition-colors ${
                        isSolved
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : isLocked
                            ? 'border-neutral-300 dark:border-neutral-700 bg-neutral-200/50 dark:bg-neutral-800/50 text-neutral-400 cursor-not-allowed'
                            : 'border-neutral-300 dark:border-neutral-600 hover:border-neutral-400'
                      }`}
                      aria-label={isLocked ? lockInfo.reason : "Toggle Solved"}
                      title={isLocked ? lockInfo.reason : isSolved ? "Mark as unsolved" : "Mark as solved"}
                    >
                      {isSolved ? (
                        <CheckCircle2 size={12} />
                      ) : isLocked ? (
                        <Lock size={10} className="text-neutral-400" />
                      ) : null}
                    </button>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-[10px] text-neutral-400">
                          #{String(problemIndex + 1).padStart(3, '0')}
                        </span>

                        <span className={`text-xs font-bold ${isLocked ? 'text-neutral-700 dark:text-neutral-300' : 'text-neutral-900 dark:text-white'}`}>
                          {prob.title}
                        </span>

                        <span className="font-mono text-[9px] px-1.5 py-0.2 rounded-sm bg-accent/15 dark:bg-accent/25 text-accent dark:text-accent-dark font-bold uppercase tracking-wider">
                          MUST-DO
                        </span>

                        {isLocked ? (
                          <span className="inline-flex items-center gap-1 font-mono text-[9px] px-1.5 py-0.2 rounded-sm bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 font-bold uppercase tracking-wider border border-amber-300 dark:border-amber-800">
                            <Lock size={9} />
                            LOCKED · {prob.tier}
                          </span>
                        ) : (
                          <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-sm ${
                            prob.tier === 'P1 Easy'
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                              : prob.tier === 'P2 Medium'
                                ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300'
                                : prob.tier === 'P3 Hard'
                                  ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                                  : 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300'
                          }`}>
                            {prob.tier} · CF {prob.rating}
                          </span>
                        )}

                        <span className="text-[10px] text-neutral-500 font-mono">
                          {prob.patternName}
                        </span>
                      </div>

                      <p className={`text-xs leading-relaxed max-w-2xl ${isLocked ? 'text-neutral-500 dark:text-neutral-400' : 'text-neutral-600 dark:text-neutral-300'}`}>
                        {prob.paraphrase}
                      </p>

                      <div className="text-[11px] text-neutral-500 font-mono pt-0.5">
                        <span className="text-neutral-400">Story Cue: </span>
                        <span>{prob.storyDisguise}</span>
                      </div>

                      {/* Locked requirement callout */}
                      {isLocked && (
                        <div className="mt-1 inline-flex items-center gap-1.5 text-[11px] font-mono text-amber-800 dark:text-amber-300 bg-amber-50/80 dark:bg-amber-950/30 px-2 py-0.5 rounded border border-amber-200/80 dark:border-amber-900/60">
                          <Lock size={11} className="text-amber-600 dark:text-amber-400 shrink-0" />
                          <span>{lockInfo.reason}</span>
                        </div>
                      )}
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

                    {isLocked ? (
                      <button
                        onClick={() => setLockedAlert(lockInfo.reason)}
                        className="px-2.5 py-1 text-xs border border-amber-300/80 dark:border-amber-700/80 rounded-sm bg-amber-50/60 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 font-mono font-medium flex items-center gap-1.5 hover:bg-amber-100 dark:hover:bg-amber-950/50 transition-colors shadow-2xs"
                        title={lockInfo.reason}
                      >
                        <Lock size={12} className="text-amber-600 dark:text-amber-400" />
                        <span>Solution Locked</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => onViewProblemDetails(prob)}
                        className="px-2.5 py-1 text-xs border border-neutral-200 dark:border-neutral-700 rounded-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 font-medium transition-colors"
                      >
                        View Solution
                      </button>
                    )}
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
