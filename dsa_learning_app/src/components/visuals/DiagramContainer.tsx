import React from 'react';
import { Eye, Info, Sparkles, Gamepad2 } from 'lucide-react';
import { Stepper } from './Stepper';

export interface DiagramLegendItem {
  color: 'blue' | 'green' | 'orange' | 'red' | 'gray';
  label: string;
}

export interface DiagramContainerProps {
  title: string;
  description?: string;
  legend?: DiagramLegendItem[];
  gameId?: string;
  onNavigateToGame?: (gameId: string) => void;
  children: React.ReactNode;
  currentStep?: number;
  totalSteps?: number;
  stepCaption?: string;
  onStepChange?: (step: number) => void;
}

const DEFAULT_LEGEND: DiagramLegendItem[] = [
  { color: 'blue', label: 'Current / Focus' },
  { color: 'green', label: 'Found / Done / Valid' },
  { color: 'orange', label: 'Pointer / Active Window' },
  { color: 'red', label: 'Pruned / Conflict' },
  { color: 'gray', label: 'Unvisited / Neutral' },
];

export const DiagramContainer: React.FC<DiagramContainerProps> = ({
  title,
  description,
  legend = DEFAULT_LEGEND,
  gameId,
  onNavigateToGame,
  children,
  currentStep,
  totalSteps,
  stepCaption,
  onStepChange,
}) => {
  const getLegendDotColor = (color: DiagramLegendItem['color']) => {
    switch (color) {
      case 'blue':
        return 'bg-sky-400';
      case 'green':
        return 'bg-emerald-400';
      case 'orange':
        return 'bg-amber-400';
      case 'red':
        return 'bg-rose-400';
      case 'gray':
        return 'bg-slate-500';
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 sm:p-5 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Eye className="w-4 h-4" />
            </span>
            <h4 className="text-sm sm:text-base font-extrabold text-white">{title}</h4>
          </div>
          {description && (
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">{description}</p>
          )}
        </div>

        {gameId && onNavigateToGame && (
          <button
            onClick={() => onNavigateToGame(gameId)}
            className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 rounded-xl text-xs font-bold transition transform active:scale-95"
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>Play Pattern Game</span>
          </button>
        )}
      </div>

      {/* Diagram Canvas Area (Responsive Scroll Container) */}
      <div className="p-3 sm:p-4 rounded-xl bg-slate-950/80 border border-slate-800/90 overflow-x-auto custom-scrollbar flex items-center justify-center min-h-[140px]">
        {children}
      </div>

      {/* Stepper Controls if multiple steps exist */}
      {totalSteps !== undefined && currentStep !== undefined && onStepChange && (
        <Stepper
          currentStep={currentStep}
          totalSteps={totalSteps}
          caption={stepCaption}
          onStepChange={onStepChange}
        />
      )}

      {/* Standardized Color Legend */}
      {legend && legend.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-800/70 text-[11px] text-slate-400">
          <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Legend:</span>
          {legend.map((item, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${getLegendDotColor(item.color)}`} />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
