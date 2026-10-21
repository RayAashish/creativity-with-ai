import React, { useState } from 'react';
import { LearningTopic } from '../../types';
import {
  Clock,
  Lightbulb,
  AlertTriangle,
  Code,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Award
} from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

interface TopicViewerProps {
  topic: LearningTopic;
}

export const TopicViewer: React.FC<TopicViewerProps> = ({ topic }) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showQuizResults, setShowQuizResults] = useState(false);

  const handleSelectQuizOption = (qIdx: number, optIdx: number) => {
    sounds.playClick();
    setSelectedAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
  };

  const handleCheckQuiz = () => {
    sounds.playFanfare();
    setShowQuizResults(true);
  };

  const handleResetQuiz = () => {
    sounds.playClick();
    setSelectedAnswers({});
    setShowQuizResults(false);
  };

  return (
    <article className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-2 mb-2 text-xs">
          <span className="px-2.5 py-0.5 rounded-full font-bold uppercase bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
            {topic.subject.toUpperCase()}
          </span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-600 dark:text-slate-400 font-medium">
            {topic.category}
          </span>
          <span className="text-slate-400">•</span>
          <span className="flex items-center gap-1 text-slate-500">
            <Clock className="w-3.5 h-3.5" />
            <span>{topic.readTimeMinutes} min read</span>
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
          {topic.title}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          {topic.summary}
        </p>
      </div>

      {/* Core Concept */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-indigo-500" />
          <span>Core Concept & Theory</span>
        </h2>
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm leading-relaxed text-slate-700 dark:text-slate-200 whitespace-pre-line font-normal">
          {topic.content.coreConcept}
        </div>
      </div>

      {/* Visual or ASCII Diagram */}
      {topic.content.diagramOrAscii && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
            Visual Architecture / Representation
          </h2>
          <div className="p-4 rounded-xl bg-slate-950 text-cyan-300 font-mono text-xs overflow-x-auto border border-slate-800 shadow-inner">
            <pre className="whitespace-pre">{topic.content.diagramOrAscii}</pre>
          </div>
        </div>
      )}

      {/* Key Takeaways */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Key Takeaways & High-Yield Points
        </h2>
        <div className="grid grid-cols-1 gap-2.5">
          {topic.content.keyPoints.map((point, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2.5"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
              <span>{point}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Code Example (if available) */}
      {topic.content.codeExample && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Code className="w-5 h-5 text-indigo-500" />
            <span>Code Implementation ({topic.content.codeExample.language.toUpperCase()})</span>
          </h2>
          <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-lg">
            <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs font-mono text-slate-400 flex items-center justify-between">
              <span>{topic.content.codeExample.language}</span>
              <span>Syntax Highlighted</span>
            </div>
            <pre className="p-4 text-xs font-mono text-indigo-300 overflow-x-auto leading-relaxed">
              <code>{topic.content.codeExample.code}</code>
            </pre>
          </div>
          <p className="text-xs text-slate-500 italic">
            {topic.content.codeExample.explanation}
          </p>
        </div>
      )}

      {/* Formulas & Rules */}
      {topic.content.formulasAndRules && topic.content.formulasAndRules.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Essential Formulas & Rules
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {topic.content.formulasAndRules.map((f, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/60"
              >
                <div className="text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wide mb-1">
                  {f.title}
                </div>
                <div className="text-xs sm:text-sm font-mono text-slate-800 dark:text-slate-200">
                  {f.detail}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interview Pitfalls & Traps */}
      {topic.content.interviewPitfalls.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-amber-600 dark:text-amber-400 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            <span>Common Interview Pitfalls & Candidate Traps</span>
          </h2>
          <div className="space-y-2">
            {topic.content.interviewPitfalls.map((pitfall, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-xs sm:text-sm text-amber-900 dark:text-amber-200"
              >
                ⚠️ {pitfall}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* GATE / Placement Pro-Tip */}
      {topic.content.gateOrPlacementTip && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-indigo-500/10 border border-purple-300 dark:border-purple-800 flex items-start gap-3">
          <Award className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm">
            <span className="font-bold text-purple-700 dark:text-purple-300 block mb-0.5">
              Exam Benchmark Pro-Tip:
            </span>
            <span className="text-slate-700 dark:text-slate-300">
              {topic.content.gateOrPlacementTip}
            </span>
          </div>
        </div>
      )}

      {/* Quick Check Mini Quiz */}
      {topic.quickQuiz.length > 0 && (
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-indigo-500" />
              <span>Concept Check Quiz ({topic.quickQuiz.length} Qs)</span>
            </h2>
            {showQuizResults && (
              <button
                onClick={handleResetQuiz}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Reset Quiz
              </button>
            )}
          </div>

          <div className="space-y-4">
            {topic.quickQuiz.map((q, qIdx) => {
              const selectedOpt = selectedAnswers[qIdx];
              const isAnswered = selectedOpt !== undefined;

              return (
                <div
                  key={qIdx}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm"
                >
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                    {qIdx + 1}. {q.question}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options.map((opt, optIdx) => {
                      let btnStyle = 'border-slate-200 dark:border-slate-800 hover:border-indigo-500 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300';
                      if (selectedOpt === optIdx) {
                        btnStyle = 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-bold';
                      }
                      if (showQuizResults) {
                        if (optIdx === q.correctAnswer) {
                          btnStyle = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200 font-bold';
                        } else if (selectedOpt === optIdx) {
                          btnStyle = 'border-rose-500 bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-200';
                        }
                      }

                      return (
                        <button
                          key={optIdx}
                          disabled={showQuizResults}
                          onClick={() => handleSelectQuizOption(qIdx, optIdx)}
                          className={`text-left p-3 rounded-xl border text-xs transition-all flex items-start gap-2 ${btnStyle}`}
                        >
                          <span className="w-4 h-4 rounded bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span>{opt}</span>
                        </button>
                      );
                    })}
                  </div>

                  {showQuizResults && (
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-1.5 font-bold mb-1">
                        {selectedOpt === q.correctAnswer ? (
                          <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" /> Correct Answer!
                          </span>
                        ) : (
                          <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1">
                            <XCircle className="w-4 h-4" /> Incorrect
                          </span>
                        )}
                      </div>
                      <p>{q.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {!showQuizResults && (
            <button
              onClick={handleCheckQuiz}
              disabled={Object.keys(selectedAnswers).length === 0}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm shadow-md transition"
            >
              Check Quiz Answers
            </button>
          )}
        </div>
      )}
    </article>
  );
};
