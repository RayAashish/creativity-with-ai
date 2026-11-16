import React, { useState } from 'react';
import { Users, Activity, ShieldCheck, Flame, X, Globe, Sparkles } from 'lucide-react';
import { useVisitorCount } from '../hooks/useVisitorCount';

interface VisitorCounterProps {
  variant?: 'navbar' | 'sidebar' | 'card' | 'badge';
  className?: string;
}

export const VisitorCounter: React.FC<VisitorCounterProps> = ({ variant = 'navbar', className = '' }) => {
  const { totalVisits, formatted, activeNow, isLoading } = useVisitorCount();
  const [showDetails, setShowDetails] = useState(false);

  // Variant: Top Navbar Pill
  if (variant === 'navbar') {
    return (
      <>
        <button
          onClick={() => setShowDetails(true)}
          className={`flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-mono transition-all border border-emerald-500/30 bg-emerald-950/20 hover:bg-emerald-950/40 text-emerald-300 hover:border-emerald-500/50 group shadow-sm ${className}`}
          title="Click to view live community activity & visitor statistics"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <Users className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
          <span className="font-semibold text-emerald-200">
            {isLoading ? '1,430+' : formatted}
          </span>
          <span className="hidden xl:inline text-emerald-400/80 font-sans text-[11px]">
            Aspirants Prepping
          </span>
        </button>

        {showDetails && (
          <CommunityActivityModal
            totalVisits={totalVisits}
            formatted={formatted}
            activeNow={activeNow}
            onClose={() => setShowDetails(false)}
          />
        )}
      </>
    );
  }

  // Variant: Sidebar Footer Badge
  if (variant === 'sidebar') {
    return (
      <>
        <button
          onClick={() => setShowDetails(true)}
          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-mono bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800 hover:border-emerald-500/30 text-zinc-300 transition-all group ${className}`}
        >
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-sans text-zinc-400 group-hover:text-zinc-200">
              Community Prepping:
            </span>
          </div>
          <span className="font-semibold text-emerald-400 flex items-center gap-1 font-mono text-[11px]">
            <Users className="w-3 h-3 text-emerald-400" />
            {formatted}
          </span>
        </button>

        {showDetails && (
          <CommunityActivityModal
            totalVisits={totalVisits}
            formatted={formatted}
            activeNow={activeNow}
            onClose={() => setShowDetails(false)}
          />
        )}
      </>
    );
  }

  // Variant: Dashboard Card / Tile
  if (variant === 'card') {
    return (
      <>
        <div
          onClick={() => setShowDetails(true)}
          className={`cursor-pointer group relative overflow-hidden rounded-sm border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-3.5 transition-all hover:border-emerald-500/50 hover:bg-neutral-50 dark:hover:bg-neutral-850 shadow-sm ${className}`}
        >
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-mono text-neutral-500 flex items-center gap-1.5">
              <Users size={12} className="text-emerald-500" />
              <span>Aspirants Prepped</span>
            </div>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-neutral-900 dark:text-white mt-1 group-hover:text-emerald-500 transition-colors">
            {formatted}+
          </div>
          <div className="text-[10px] text-neutral-400 mt-0.5 flex items-center justify-between">
            <span>~{activeNow} active today</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-mono text-[9px] font-bold">LIVE</span>
          </div>
        </div>

        {showDetails && (
          <CommunityActivityModal
            totalVisits={totalVisits}
            formatted={formatted}
            activeNow={activeNow}
            onClose={(e) => {
              e?.stopPropagation();
              setShowDetails(false);
            }}
          />
        )}
      </>
    );
  }

  // Variant: Badge (Direct hits.sh SVG)
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <img
        src="https://hits.sh/spdse-prep.vercel.app.svg?label=Candidates+Prepped&color=10b981&labelColor=0d1117"
        alt="SPDSE.Prep Total Visitors Counter"
        className="h-5 rounded"
        loading="lazy"
      />
    </div>
  );
};

// Modal for community statistics & verification
interface ModalProps {
  totalVisits: number;
  formatted: string;
  activeNow: number;
  onClose: (e?: React.MouseEvent) => void;
}

const CommunityActivityModal: React.FC<ModalProps> = ({ formatted, activeNow, onClose }) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl text-zinc-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-zinc-100 rounded-lg hover:bg-zinc-800/60 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-zinc-100">Community Live Activity</h3>
            <p className="text-xs text-zinc-400 font-mono">Real-time visitor telemetry</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 my-4">
          <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
            <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-mono block mb-1">
              Total Preppers
            </span>
            <span className="text-2xl font-bold font-mono text-emerald-400">
              {formatted}+
            </span>
            <span className="text-[10px] text-zinc-400 block mt-0.5">Engineers visited</span>
          </div>

          <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-mono">
                Active Today
              </span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <span className="text-2xl font-bold font-mono text-cyan-400">
              ~{activeNow}
            </span>
            <span className="text-[10px] text-zinc-400 block mt-0.5">Coding right now</span>
          </div>
        </div>

        <div className="space-y-2.5 text-xs text-zinc-300 bg-zinc-900/40 p-3.5 rounded-xl border border-zinc-850">
          <div className="flex items-start gap-2.5">
            <Flame className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p>
              Candidates preparing across India for upcoming <strong>Infosys Specialist Programmer (₹9.5L–₹11L)</strong> and <strong>Digital Specialist Engineer (₹6.5L)</strong> on-campus & off-campus drives.
            </p>
          </div>
          <div className="flex items-start gap-2.5">
            <Activity className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p>
              Synchronized via serverless hit counter + Vercel Analytics for privacy-preserving visit tracking.
            </p>
          </div>
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <p>
              100% privacy-friendly: zero tracking cookies, no personal data stored, offline PWA compatible.
            </p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-mono">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            Free & Open Resource
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
