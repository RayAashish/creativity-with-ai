import React, { useState } from 'react';
import { ALGORITHMIC_PATTERNS, AlgorithmicPattern } from '../../data/patternsData';
import { 
  Zap, 
  Clock, 
  Database, 
  AlertTriangle, 
  Copy, 
  Check, 
  ArrowRight, 
  Sparkles,
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface PatternRadarProps {
  onFilterByPattern: (patternName: string) => void;
  onOpenArchetype: (questionId: string) => void;
}

export const PatternRadar: React.FC<PatternRadarProps> = ({
  onFilterByPattern,
  onOpenArchetype
}) => {
  const [selectedPatternId, setSelectedPatternId] = useState<string>(ALGORITHMIC_PATTERNS[0].id);
  const [templateLang, setTemplateLang] = useState<'java' | 'cpp' | 'python' | 'javascript'>('java');
  const [copied, setCopied] = useState<boolean>(false);

  const activePattern = ALGORITHMIC_PATTERNS.find(p => p.id === selectedPatternId) || ALGORITHMIC_PATTERNS[0];

  const handleCopy = (code: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header banner */}
      <div className="p-5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase bg-[var(--text-primary)] text-[var(--text-inverse)]">
                Pattern Matrix
              </span>
              <span className="text-xs font-mono text-[var(--text-muted)]">
                14 Universal Archetypes
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)]">
              The Algorithmic Blueprint Radar
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 max-w-2xl">
              Over 90% of FAANG & tier-1 technical interviews test variations of these 14 universal patterns. Master the recognition cues to identify the optimal algorithm in under 15 seconds.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onFilterByPattern(activePattern.name)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-mono font-semibold bg-[var(--text-primary)] text-[var(--text-inverse)] hover:opacity-90 transition whitespace-nowrap self-start sm:self-auto"
          >
            <span>Filter Vault by this Pattern</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Grid of Pattern Pills / Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-2">
        {ALGORITHMIC_PATTERNS.map((p) => {
          const isSelected = p.id === selectedPatternId;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelectedPatternId(p.id)}
              className={`p-3 rounded-lg border text-left transition flex flex-col justify-between ${
                isSelected
                  ? 'bg-[var(--bg-subtle)] border-[var(--border-active)] shadow-sm'
                  : 'bg-[var(--bg-card)] border-[var(--border-subtle)] hover:border-[var(--border-active)]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-lg mb-1.5">
                  <span>{p.emoji}</span>
                  <span className={`text-[9px] font-mono px-1 rounded ${
                    p.frequencyInInterviews === 'Extremely High'
                      ? 'bg-red-500/10 text-red-400 font-bold'
                      : 'bg-[var(--bg-subtle)] text-[var(--text-muted)]'
                  }`}>
                    {p.frequencyInInterviews === 'Extremely High' ? 'Top Tier' : 'Core'}
                  </span>
                </div>
                <div className={`text-xs font-bold leading-snug tracking-tight truncate ${
                  isSelected ? 'text-[var(--text-primary)] font-mono' : 'text-[var(--text-secondary)]'
                }`}>
                  {p.name}
                </div>
              </div>
              <div className="text-[10px] font-mono text-[var(--text-muted)] mt-2">
                {p.timeComplexity.split(' ')[0]}
              </div>
            </button>
          );
        })}
      </div>

      {/* Detailed Blueprint Panel for Selected Pattern */}
      <div className="p-5 sm:p-6 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
          <div className="flex items-start gap-3">
            <span className="text-3xl p-2 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-subtle)]">
              {activePattern.emoji}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-bold tracking-tight text-[var(--text-primary)]">
                  {activePattern.name}
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-[var(--text-muted)]">
                  Frequency: {activePattern.frequencyInInterviews}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
                {activePattern.oneLiner}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-xs font-mono">
              <Clock className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              <span className="text-[var(--text-primary)]">{activePattern.timeComplexity}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-xs font-mono">
              <Database className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              <span className="text-[var(--text-primary)]">{activePattern.spaceComplexity}</span>
            </div>
          </div>
        </div>

        {/* 2-Column Layout: Recognition Cues vs Boilerplate Code */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Cues & Edge Cases */}
          <div className="lg:col-span-5 space-y-4">
            <div>
              <h4 className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>When to Trigger This Pattern</span>
              </h4>
              <ul className="space-y-2">
                {activePattern.identifyingCues.map((cue, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-[var(--text-secondary)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-primary)] mt-1.5 flex-shrink-0" />
                    <span>{cue}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-3 border-t border-[var(--border-subtle)]">
              <h4 className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                <span>Common Interview Traps & Pitfalls</span>
              </h4>
              <ul className="space-y-2">
                {activePattern.keyPitfalls.map((pitfall, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-[var(--text-secondary)]">
                    <span className="text-red-400 font-bold">✕</span>
                    <span>{pitfall}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono text-[var(--text-muted)] block">Archetype Problem</span>
                <span className="text-xs font-bold text-[var(--text-primary)]">{activePattern.archetypeProblem}</span>
              </div>
              <button
                type="button"
                onClick={() => onOpenArchetype(activePattern.archetypeQuestionId)}
                className="btn-outline px-2.5 py-1.5 rounded text-xs font-mono"
              >
                Inspect Archetype
              </button>
            </div>
          </div>

          {/* Right Column: Golden Boilerplate Code */}
          <div className="lg:col-span-7 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-semibold text-[var(--text-primary)]">
                  Golden Blueprint Template
                </span>
              </div>

              {/* Multi-Language Navigable Switcher (Java Default) */}
              <div className="flex items-center gap-1 bg-[var(--bg-subtle)] p-1 rounded-lg border border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => setTemplateLang('java')}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono transition ${
                    templateLang === 'java'
                      ? 'bg-[var(--bg-card)] text-[var(--text-primary)] font-bold border border-[var(--border-subtle)]'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                  }`}
                >
                  ☕ Java
                </button>
                <button
                  type="button"
                  onClick={() => setTemplateLang('cpp')}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono transition ${
                    templateLang === 'cpp'
                      ? 'bg-[var(--bg-card)] text-[var(--text-primary)] font-bold border border-[var(--border-subtle)]'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                  }`}
                >
                  ⚡ C++
                </button>
                <button
                  type="button"
                  onClick={() => setTemplateLang('python')}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono transition ${
                    templateLang === 'python'
                      ? 'bg-[var(--bg-card)] text-[var(--text-primary)] font-bold border border-[var(--border-subtle)]'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                  }`}
                >
                  🐍 Python
                </button>
                <button
                  type="button"
                  onClick={() => setTemplateLang('javascript')}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono transition ${
                    templateLang === 'javascript'
                      ? 'bg-[var(--bg-card)] text-[var(--text-primary)] font-bold border border-[var(--border-subtle)]'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                  }`}
                >
                  🟨 JS
                </button>
              </div>

              <button
                type="button"
                onClick={() => handleCopy(activePattern.templateCodes[templateLang])}
                className="flex items-center gap-1 text-[11px] font-mono text-[var(--text-muted)] hover:text-[var(--text-primary)] transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="rounded-lg bg-[#0d1117] border border-[#30363d] p-3.5 overflow-x-auto text-xs font-mono text-[#e6edf3] leading-relaxed shadow-inner">
              <pre>
                <code>{activePattern.templateCodes[templateLang]}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
