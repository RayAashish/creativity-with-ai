import React, { useState } from 'react';
import { 
  BookOpen, 
  Code2, 
  Lightbulb, 
  CheckCircle, 
  Clock, 
  Gamepad2, 
  Sparkles, 
  Copy, 
  Check, 
  ChevronRight
} from 'lucide-react';
import { LEARNING_MODULES, LearningModule } from '../../data/learningTopics';

interface LearningHubProps {
  onNavigateToGames: (gameId?: string) => void;
  onNavigateToSheet: (topicId?: string) => void;
}

export const LearningHub: React.FC<LearningHubProps> = ({
  onNavigateToGames,
  onNavigateToSheet,
}) => {
  const [selectedModuleId, setSelectedModuleId] = useState<string>('arrays');
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  const currentModule: LearningModule = LEARNING_MODULES[selectedModuleId] || LEARNING_MODULES['arrays'];

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-900 via-teal-950/30 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-500/10 text-teal-400 border border-teal-500/30 rounded-full text-xs font-semibold mb-3">
            <BookOpen className="w-3.5 h-3.5" /> Comprehensive DSA Concept & Pattern Academy
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Detailed DSA Patterns, Intuition & Code
          </h2>
          <p className="text-slate-300 text-sm sm:text-base mt-2 leading-relaxed">
            Move past rote memorization. Learn the high-frequency algorithmic patterns asked in Google, Amazon, and Microsoft interviews. Each concept is mapped to mental models, complexity cheat-sheets, and playable mini-games!
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {Object.values(LEARNING_MODULES).map((mod) => {
          const isSelected = selectedModuleId === mod.id;
          return (
            <button
              key={mod.id}
              onClick={() => setSelectedModuleId(mod.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                isSelected
                  ? 'bg-teal-500/20 text-teal-300 border-teal-500/50 shadow-md scale-105'
                  : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              {mod.title.split(' ')[0]} {mod.title.split(' ')[1] || ''}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
            <div className="flex items-center justify-between gap-4 mb-3">
              <h3 className="text-xl sm:text-2xl font-extrabold text-white">{currentModule.title}</h3>
              {currentModule.recommendedGameId && (
                <button
                  onClick={() => onNavigateToGames(currentModule.recommendedGameId)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 rounded-xl text-xs font-bold transition transform active:scale-95"
                >
                  <Gamepad2 className="w-3.5 h-3.5" />
                  <span>Play Pattern Game</span>
                </button>
              )}
            </div>

            <p className="text-xs sm:text-sm font-mono text-teal-400 mb-4">{currentModule.tagline}</p>

            <p className="text-slate-300 text-sm leading-relaxed mb-6">
              {currentModule.overview}
            </p>

            <div className="p-4 bg-teal-500/10 rounded-xl border border-teal-500/20 flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-teal-300 block mb-1">
                  Mental Model & Real-World Analogy
                </span>
                <span className="text-xs sm:text-sm text-slate-200">{currentModule.analogy}</span>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Fundamental Pillars
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {currentModule.coreConcepts.map((concept, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                    <CheckCircle className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
                    <span>{concept}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Code2 className="w-5 h-5 text-cyan-400" />
              <span>Signature Algorithmic Patterns</span>
            </h3>

            {currentModule.patterns.map((pat, idx) => (
              <div key={idx} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <h4 className="text-base font-bold text-white">{pat.name}</h4>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-mono">
                    {pat.badge}
                  </span>
                </div>

                <p className="text-xs text-slate-400 mb-3">
                  <strong className="text-slate-300">When to use:</strong> {pat.whenToUse}
                </p>

                <p className="text-sm text-slate-200 mb-4 leading-relaxed">
                  {pat.explanation}
                </p>

                <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
                  <div className="px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span>Clean Solution Pattern</span>
                    <button
                      onClick={() => copyToClipboard(pat.codeSnippet.code, `${currentModule.id}-${idx}`)}
                      className="flex items-center gap-1 hover:text-white transition"
                    >
                      {copiedSnippet === `${currentModule.id}-${idx}` ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-4 text-xs font-mono text-cyan-200 overflow-x-auto leading-relaxed">
                    <code>{pat.codeSnippet.code}</code>
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Complexity Cheatsheet</span>
            </h4>
            <div className="divide-y divide-slate-800/80 text-xs font-mono">
              <div className="grid grid-cols-3 py-2 text-slate-500 font-semibold uppercase">
                <span>Operation</span>
                <span>Average</span>
                <span>Worst</span>
              </div>
              {currentModule.cheatSheet.map((item, idx) => (
                <div key={idx} className="grid grid-cols-3 py-2.5 text-slate-300">
                  <span className="text-slate-400">{item.operation}</span>
                  <span className="text-emerald-400">{item.average}</span>
                  <span className="text-amber-400">{item.worst}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Interview Pitfalls & FAANG Tips</span>
            </h4>
            <div className="space-y-2.5 text-xs text-slate-300">
              {currentModule.interviewTips.map((tip, idx) => (
                <div key={idx} className="flex items-start gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
                  <span className="text-purple-400 font-bold">•</span>
                  <span className="leading-relaxed">{tip}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-950/50 to-slate-900 border border-indigo-500/30 rounded-2xl p-5 shadow-xl text-center">
            <h4 className="text-sm font-bold text-white mb-1.5">Ready to Test Your Skills?</h4>
            <p className="text-xs text-slate-300 mb-4">
              Solve the curated 450 Sheet problems for this topic on LeetCode and GeeksforGeeks!
            </p>
            <button
              onClick={() => onNavigateToSheet(currentModule.id)}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-500/25 transition"
            >
              <span>Practice {currentModule.title.split(' ')[0]} in 450 Sheet</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
