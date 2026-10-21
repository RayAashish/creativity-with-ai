import React from 'react';
import { X, Sparkles, CheckCircle2 } from 'lucide-react';
import { SAMPLE_IMAGES } from '../utils/sampleImages';
import { SampleImage } from '../types';

interface SamplePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSample: (sample: SampleImage) => void;
}

export const SamplePickerModal: React.FC<SamplePickerModalProps> = ({
  isOpen,
  onClose,
  onSelectSample,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Choose a Sample Image</h3>
              <p className="text-xs text-slate-400">
                Test in-image text replacement instantly with realistic templates.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Grid of Samples */}
        <div className="p-5 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SAMPLE_IMAGES.map((sample) => (
            <div
              key={sample.id}
              onClick={() => {
                onSelectSample(sample);
                onClose();
              }}
              className="group cursor-pointer rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/80 hover:bg-slate-850 overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 flex flex-col"
            >
              {/* Image Preview */}
              <div className="relative aspect-[4/3] bg-slate-900 flex items-center justify-center overflow-hidden border-b border-slate-800">
                <img
                  src={sample.thumbnail}
                  alt={sample.title}
                  className="w-full h-full object-contain p-2 group-hover:scale-102 transition-transform duration-300"
                />
                <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-900/80 text-indigo-300 border border-indigo-500/30 backdrop-blur-md">
                  {sample.category}
                </span>
              </div>

              {/* Info */}
              <div className="p-3.5 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors mb-1">
                    {sample.title}
                  </h4>
                  <p className="text-xs text-slate-400 line-clamp-2">
                    {sample.description}
                  </p>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-indigo-400 font-medium">
                  <span>Load Template</span>
                  <span className="text-slate-500 group-hover:text-indigo-400">→</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
