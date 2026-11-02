import React, { useState, useEffect } from 'react';
import {
  Volume2,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  X,
} from 'lucide-react';
import { readAloudEngine, ReadAloudState } from '../../reader-core/speech/read-aloud';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  fullText: string;
}

export const ReadAloudBar: React.FC<Props> = ({ isOpen, onClose, fullText }) => {
  const [engineState, setEngineState] = useState<ReadAloudState>({
    isPlaying: false,
    isPaused: false,
    currentSentenceIndex: 0,
    currentCharIndex: 0,
    rate: 1.0,
  });

  const [activeSentence, setActiveSentence] = useState('');
  const [wordRange, setWordRange] = useState<{ start: number; length: number }>({
    start: 0,
    length: 0,
  });

  useEffect(() => {
    if (isOpen && fullText.trim()) {
      readAloudEngine.loadText(fullText);
      readAloudEngine.onSentenceChange = (_idx, sentence) => {
        setActiveSentence(sentence);
        setWordRange({ start: 0, length: 0 });
      };
      readAloudEngine.onWordBoundary = (charIndex, charLength) => {
        setWordRange({ start: charIndex, length: charLength });
      };
      readAloudEngine.onStateChange = setEngineState;
      readAloudEngine.play();
    } else {
      readAloudEngine.stop();
    }

    return () => {
      readAloudEngine.stop();
    };
  }, [isOpen, fullText]);

  if (!isOpen) return null;

  const handleTogglePlay = () => {
    if (engineState.isPlaying && !engineState.isPaused) {
      readAloudEngine.pause();
    } else if (engineState.isPaused) {
      readAloudEngine.resume();
    } else {
      readAloudEngine.play();
    }
  };

  const handleRateChange = (rate: number) => {
    readAloudEngine.setRate(rate);
  };

  // Render sentence with current word highlighted
  const renderSentenceWithHighlight = () => {
    if (!activeSentence) return null;
    const { start, length } = wordRange;
    if (length <= 0) return <span>{activeSentence}</span>;

    const before = activeSentence.slice(0, start);
    const highlighted = activeSentence.slice(start, start + length);
    const after = activeSentence.slice(start + length);

    return (
      <span>
        {before}
        <span className="bg-amber-400 text-amber-950 font-bold px-1 rounded shadow-2xs">
          {highlighted}
        </span>
        {after}
      </span>
    );
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-2xl px-5 py-3 max-w-xl w-[92%] flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-3 duration-150 select-none">
      {/* Live Sentence Display */}
      <div className="text-xs text-gray-700 dark:text-zinc-200 leading-relaxed max-h-12 overflow-y-auto">
        {renderSentenceWithHighlight()}
      </div>

      {/* Controls Bar */}
      <div className="flex items-center justify-between pt-1 border-t border-gray-100 dark:border-zinc-800 text-xs">
        <div className="flex items-center gap-1.5">
          <Volume2 className="w-4 h-4 text-amber-500" />
          <span className="font-semibold text-gray-800 dark:text-zinc-200 text-[11px]">
            Read-Aloud
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Prev */}
          <button
            onClick={() => readAloudEngine.prev()}
            className="p-1 rounded text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800"
            title="Previous sentence"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          {/* Play/Pause */}
          <button
            onClick={handleTogglePlay}
            className="p-2 rounded-full bg-amber-500 text-white shadow-xs hover:bg-amber-600 transition-colors"
            title={engineState.isPlaying && !engineState.isPaused ? 'Pause' : 'Play'}
          >
            {engineState.isPlaying && !engineState.isPaused ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4 fill-white ml-0.5" />
            )}
          </button>

          {/* Next */}
          <button
            onClick={() => readAloudEngine.next()}
            className="p-1 rounded text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800"
            title="Next sentence"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-gray-200 dark:border-zinc-800 mx-1" />

          {/* Speed Presets */}
          <div className="flex items-center bg-gray-100 dark:bg-zinc-800 p-0.5 rounded-lg text-[10px]">
            {[0.75, 1.0, 1.25, 1.5].map((speed) => (
              <button
                key={speed}
                onClick={() => handleRateChange(speed)}
                className={`px-1.5 py-0.5 rounded font-mono font-medium transition-all ${
                  engineState.rate === speed
                    ? 'bg-white dark:bg-zinc-700 text-amber-600 font-bold shadow-2xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
