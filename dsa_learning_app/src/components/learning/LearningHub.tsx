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
  ChevronRight,
  ExternalLink,
  Cpu,
  Layers
} from 'lucide-react';
import { LEARNING_MODULES, LearningModule, PatternDetail } from '../../data/learningTopics';
import { SupportedLanguage } from '../../types/dsa';

interface LearningHubProps {
  onNavigateToGames: (gameId?: string) => void;
  onNavigateToSheet: (topicId?: string) => void;
}

const LANGUAGES: { id: SupportedLanguage; label: string; icon: string; ext: string }[] = [
  { id: 'cpp', label: 'C++', icon: '⚡', ext: '.cpp' },
  { id: 'java', label: 'Java', icon: '☕', ext: '.java' },
  { id: 'python', label: 'Python', icon: '🐍', ext: '.py' },
  { id: 'javascript', label: 'JavaScript', icon: '🟨', ext: '.js' },
];

export const LearningHub: React.FC<LearningHubProps> = ({
  onNavigateToGames,
  onNavigateToSheet,
}) => {
  const [selectedModuleId, setSelectedModuleId] = useState<string>('arrays');
  const [selectedLang, setSelectedLang] = useState<SupportedLanguage>('cpp');
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  const currentModule: LearningModule = LEARNING_MODULES[selectedModuleId] || LEARNING_MODULES['arrays'];

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Academy Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950/30 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-500/10 text-teal-400 border border-teal-500/30 rounded-full text-xs font-semibold mb-3">
            <BookOpen className="w-3.5 h-3.5" /> Comprehensive DSA Concept & Pattern Academy
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Detailed DSA Patterns, Mental Models & Multi-Language Code
          </h2>
          <p className="text-slate-300 text-sm sm:text-base mt-2 leading-relaxed">
            Move past rote memorization. Learn the high-frequency algorithmic patterns asked in Google, Amazon, and Microsoft interviews. Each concept features mental models, complexity cheat-sheets, and complete solutions in C++, Java, Python, and JavaScript.
          </p>
        </div>

        {/* Global Language Selector Header */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <Code2 className="w-4 h-4 text-cyan-400" />
            <span>Active Code Language:</span>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 border border-slate-800 rounded-2xl overflow-x-auto">
            {LANGUAGES.map((lang) => {
              const isActive = selectedLang === lang.id;
              return (
                <button
                  key={lang.id}
                  onClick={() => setSelectedLang(lang.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                    isActive
                      ? 'bg-gradient-to-r from-teal-500/20 to-cyan-500/20 text-teal-300 border border-teal-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                  }`}
                >
                  <span>{lang.icon}</span>
                  <span>{lang.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Module Selector Tabs */}
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

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Module Concept Overview Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
            <div className="flex items-center justify-between gap-4 mb-3 flex-wrap">
              <h3 className="text-xl sm:text-2xl font-extrabold text-white">{currentModule.title}</h3>
              {currentModule.recommendedGameId && (
                <button
                  onClick={() => onNavigateToGames(currentModule.recommendedGameId)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 rounded-xl text-xs font-bold transition transform active:scale-95"
                >
                  <Gamepad2 className="w-3.5 h-3.5" />
                  <span>Play Interactive Game</span>
                </button>
              )}
            </div>

            <p className="text-xs sm:text-sm font-mono text-teal-400 mb-4">{currentModule.tagline}</p>

            <p className="text-slate-300 text-sm leading-relaxed mb-6">
              {currentModule.overview}
            </p>

            {/* Mental Model & Analogy Box */}
            <div className="p-4 bg-teal-500/10 rounded-xl border border-teal-500/20 flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-teal-300 block mb-1">
                  Mental Model & Real-World Analogy
                </span>
                <span className="text-xs sm:text-sm text-slate-200 leading-relaxed">{currentModule.analogy}</span>
              </div>
            </div>

            {/* Fundamental Pillars */}
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

          {/* Signature Algorithmic Patterns List */}
          <div className="space-y-5">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Code2 className="w-5 h-5 text-cyan-400" />
              <span>Signature Patterns ({currentModule.patterns.length})</span>
            </h3>

            {currentModule.patterns.map((pat, idx) => {
              const code = pat.solutions[selectedLang] || '// Implementation in progress';
              const langMeta = LANGUAGES.find(l => l.id === selectedLang);

              return (
                <div key={idx} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                  {/* Pattern Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-mono font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span>{pat.name}</span>
                    </h4>

                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-mono font-semibold">
                      {pat.badge}
                    </span>
                  </div>

                  {/* When to use */}
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-300">
                    <strong className="text-cyan-400 font-semibold">Interview Signal / When to use: </strong>
                    <span>{pat.whenToUse}</span>
                  </div>

                  {/* Explanation */}
                  <p className="text-sm text-slate-200 leading-relaxed">
                    {pat.explanation}
                  </p>

                  {/* Whiteboard Key Takeaways */}
                  {pat.keyTakeaways && pat.keyTakeaways.length > 0 && (
                    <div className="space-y-1.5 pl-2 border-l-2 border-teal-500/40">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-teal-400 block mb-1">
                        Whiteboard Key Anchors:
                      </span>
                      {pat.keyTakeaways.map((point, kIdx) => (
                        <div key={kIdx} className="text-xs text-slate-300 flex items-start gap-1.5">
                          <span className="text-teal-400">•</span>
                          <span>{point}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 4-Language Code Window */}
                  <div className="rounded-xl border border-slate-800 overflow-hidden shadow-inner bg-slate-950">
                    {/* IDE Header Bar */}
                    <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                          <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                        </div>
                        <span className="font-mono text-slate-300 text-[11px] ml-2">
                          {pat.id}{langMeta?.ext}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-[11px] font-mono text-slate-500 uppercase">
                          {selectedLang}
                        </span>
                        <button
                          onClick={() => copyToClipboard(code, `${pat.id}-${selectedLang}`)}
                          className="flex items-center gap-1 text-slate-300 hover:text-white transition px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[11px]"
                        >
                          {copiedSnippet === `${pat.id}-${selectedLang}` ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Code Body */}
                    <pre className="p-4 text-xs font-mono text-cyan-200 overflow-x-auto leading-relaxed max-h-80">
                      <code>{code}</code>
                    </pre>
                  </div>

                  {/* Practice Button */}
                  {pat.practiceTitle && (
                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => onNavigateToSheet(currentModule.id)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 bg-cyan-600/15 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-bold transition transform active:scale-95"
                      >
                        <span>Practice in 450 Sheet</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar Information */}
        <div className="space-y-6">
          {/* Complexity Cheat Sheet */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Complexity Cheatsheet</span>
            </h4>
            <div className="divide-y divide-slate-800/80 text-xs font-mono">
              <div className="grid grid-cols-3 py-2 text-slate-500 font-semibold uppercase text-[11px]">
                <span>Operation</span>
                <span>Average</span>
                <span>Worst</span>
              </div>
              {currentModule.cheatSheet.map((item, idx) => (
                <div key={idx} className="grid grid-cols-3 py-2.5 text-slate-300 text-[11px]">
                  <span className="text-slate-400">{item.operation}</span>
                  <span className="text-emerald-400">{item.average}</span>
                  <span className="text-amber-400">{item.worst}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Interview Pitfalls & FAANG Tips */}
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

          {/* Practice in 450 Sheet Card */}
          <div className="bg-gradient-to-br from-indigo-950/50 to-slate-900 border border-indigo-500/30 rounded-2xl p-5 shadow-xl text-center">
            <h4 className="text-sm font-bold text-white mb-1.5">Ready to Test Your Skills?</h4>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Solve the curated 450 Sheet problems for this topic on LeetCode and GeeksforGeeks!
            </p>
            <button
              onClick={() => onNavigateToSheet(currentModule.id)}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-500/25 transition transform active:scale-95"
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
