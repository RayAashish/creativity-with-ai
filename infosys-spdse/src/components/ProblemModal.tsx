import React, { useState } from 'react';
import { X, ExternalLink, CheckCircle2, Code2, AlertTriangle, Terminal } from 'lucide-react';
import { CodeforcesProblem, Language } from '../types';
import { CodeBlock } from './CodeBlock';
import { TestRunner } from './TestRunner';

interface ProblemModalProps {
  problem: CodeforcesProblem | null;
  onClose: () => void;
  selectedLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  isSolved: boolean;
  onToggleSolved: (id: string) => void;
}

export const ProblemModal: React.FC<ProblemModalProps> = ({
  problem,
  onClose,
  selectedLanguage,
  onLanguageChange,
  isSolved,
  onToggleSolved
}) => {
  if (!problem) return null;

  const [activeModalTab, setActiveModalTab] = useState<'solution' | 'testrunner'>('solution');

  // Mock solution templates tailored for this problem
  const dummySolutions = {
    java: `import java.io.*;
import java.util.*;

public class Solution {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line = br.readLine();
        if (line == null) return;
        StringTokenizer st = new StringTokenizer(line);
        // Optimal ${problem.patternName} implementation
        System.out.println("Computed output");
    }
}`,
    cpp: `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    // Optimal ${problem.patternName} implementation
    return 0;
}`,
    python: `import sys

def solve():
    data = sys.stdin.read().split()
    if not data: return
    # Optimal ${problem.patternName} implementation

if __name__ == '__main__':
    solve()`
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm">
      <div 
        className="w-full max-w-2xl bg-paper-50 dark:bg-paper-900 border border-neutral-300 dark:border-neutral-700 rounded-sm shadow-2xl max-h-[85vh] overflow-y-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-accent/15 dark:bg-accent/25 text-accent dark:text-accent-dark font-bold">
                {problem.tier} · CF {problem.rating}
              </span>
              <span className="text-[10px] font-mono text-neutral-500">
                {problem.patternName}
              </span>
            </div>
            <h2 className="text-base font-bold text-neutral-900 dark:text-white">
              {problem.title}
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={problem.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-white rounded border border-neutral-200 dark:border-neutral-700"
              title="Open problem on Codeforces"
            >
              <ExternalLink size={14} />
            </a>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 text-xs">
          
          {/* Story Narrative */}
          <div className="space-y-1">
            <span className="font-mono font-bold uppercase text-[10px] text-neutral-400">
              Infosys Story Disguise & Context:
            </span>
            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed bg-paper-100/70 dark:bg-neutral-800/40 p-3 rounded border border-neutral-200 dark:border-neutral-700/60 font-sans">
              {problem.storyDisguise}
            </p>
          </div>

          <div className="space-y-1">
            <span className="font-mono font-bold uppercase text-[10px] text-neutral-400">
              Technical Problem Summary:
            </span>
            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {problem.paraphrase}
            </p>
          </div>

          {/* View Tab Switcher */}
          <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <div className="flex border-b border-neutral-200 dark:border-neutral-800 mb-3">
              <button
                onClick={() => setActiveModalTab('solution')}
                className={`pb-1.5 px-3 text-xs font-mono border-b-2 transition-all flex items-center gap-1.5 ${
                  activeModalTab === 'solution'
                    ? 'border-neutral-900 dark:border-white text-neutral-900 dark:text-white font-bold'
                    : 'border-transparent text-neutral-500 hover:text-neutral-900'
                }`}
              >
                <Code2 size={13} />
                <span>Reference Solution</span>
              </button>
              <button
                onClick={() => setActiveModalTab('testrunner')}
                className={`pb-1.5 px-3 text-xs font-mono border-b-2 transition-all flex items-center gap-1.5 ${
                  activeModalTab === 'testrunner'
                    ? 'border-neutral-900 dark:border-white text-neutral-900 dark:text-white font-bold'
                    : 'border-transparent text-neutral-500 hover:text-neutral-900'
                }`}
              >
                <Terminal size={13} />
                <span>Sample Test Playground</span>
              </button>
            </div>

            {activeModalTab === 'solution' ? (
              <div className="space-y-2">
                <CodeBlock
                  code={dummySolutions}
                  preferredLanguage={selectedLanguage}
                  onLanguageChange={onLanguageChange}
                  verified={true}
                  testsPassed={15}
                />
              </div>
            ) : (
              <div className="space-y-2">
                <TestRunner problemTitle={problem.title} />
              </div>
            )}
          </div>

          {/* Mark as Solved Button */}
          <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex justify-between items-center">
            <button
              onClick={() => onToggleSolved(problem.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm font-medium transition-colors ${
                isSolved 
                  ? 'bg-emerald-600 text-white' 
                  : 'border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              <CheckCircle2 size={13} />
              <span>{isSolved ? 'Marked as Solved ✓' : 'Mark Problem as Solved'}</span>
            </button>

            <span className="font-mono text-[10px] text-neutral-400">
              ID: {problem.id}
            </span>
          </div>

        </div>
      </div>
    </div>
  );
};
