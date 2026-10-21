import React, { useEffect, useState } from 'react';
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

export interface StepperProps {
  currentStep: number;
  totalSteps: number;
  caption?: string;
  onStepChange: (step: number) => void;
  autoPlayInterval?: number;
}

export const Stepper: React.FC<StepperProps> = ({
  currentStep,
  totalSteps,
  caption,
  onStepChange,
  autoPlayInterval = 1800,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  useEffect(() => {
    let timer: any = null;
    if (isPlaying) {
      timer = setInterval(() => {
        if (currentStep >= totalSteps - 1) {
          setIsPlaying(false);
        } else {
          onStepChange(currentStep + 1);
        }
      }, autoPlayInterval);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, currentStep, totalSteps, autoPlayInterval, onStepChange]);

  const handlePrev = () => {
    setIsPlaying(false);
    if (currentStep > 0) onStepChange(currentStep - 1);
  };

  const handleNext = () => {
    setIsPlaying(false);
    if (currentStep < totalSteps - 1) onStepChange(currentStep + 1);
  };

  const handleReset = () => {
    setIsPlaying(false);
    onStepChange(0);
  };

  const handleTogglePlay = () => {
    if (!isPlaying && currentStep >= totalSteps - 1) {
      onStepChange(0);
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="space-y-3 pt-2">
      {/* Step Explanation Banner */}
      {caption && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs sm:text-sm text-slate-200">
          <Sparkles className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <span className="font-medium leading-relaxed">{caption}</span>
        </div>
      )}

      {/* Stepper Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2 bg-slate-900/90 rounded-2xl border border-slate-800">
        {/* Step Indicator & Dots */}
        <div className="flex items-center gap-2 pl-2">
          <span className="text-xs font-mono font-bold text-slate-400">
            Step <span className="text-cyan-400">{currentStep + 1}</span> of {totalSteps}
          </span>

          <div className="hidden sm:flex items-center gap-1.5 ml-2">
            {Array.from({ length: totalSteps }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setIsPlaying(false);
                  onStepChange(idx);
                }}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  idx === currentStep
                    ? 'bg-cyan-400 w-5'
                    : idx < currentStep
                    ? 'bg-emerald-500/80'
                    : 'bg-slate-700 hover:bg-slate-600'
                }`}
                title={`Jump to step ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Action Buttons: Reset, Prev, Play/Pause, Next */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleReset}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"
            title="Reset to step 1"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 disabled:hover:bg-slate-800 transition"
            title="Previous step"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Prev</span>
          </button>

          <button
            onClick={handleTogglePlay}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg border transition ${
              isPlaying
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/30'
            }`}
            title={isPlaying ? 'Pause animation' : 'Auto play steps'}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Play</span>
              </>
            )}
          </button>

          <button
            onClick={handleNext}
            disabled={currentStep >= totalSteps - 1}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 disabled:hover:bg-slate-800 transition"
            title="Next step"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
