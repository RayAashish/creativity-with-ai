import React, { useState } from 'react';
import {
  Wrench,
  Cpu,
  Zap,
  ShieldAlert,
  Printer,
  Copy,
  Check,
  CheckCircle2,
  Code2,
  HelpCircle,
  Calculator
} from 'lucide-react';
import { complexityRules, javaGotchas, edgeCaseChecklist, examDayChecklist } from '../data/toolkitData';

export const ToolkitView: React.FC = () => {
  // Interactive Constraint Reader State
  const [inputN, setInputN] = useState<string>('100000');
  const [computedAdvice, setComputedAdvice] = useState<string>('');

  // Edge case generator selection
  const [selectedProblemType, setSelectedProblemType] = useState<string>('array');

  const handleComputeComplexity = () => {
    const raw = inputN.trim().toLowerCase();
    let val = 0;
    try {
      if (raw.includes('10^')) {
        const p = parseFloat(raw.split('10^')[1]) || 5;
        val = Math.pow(10, p);
      } else if (raw.includes('1e')) {
        val = parseFloat(raw);
      } else {
        val = parseFloat(raw) || 0;
      }
    } catch {
      val = parseFloat(raw) || 0;
    }

    if (val <= 11) {
      setComputedAdvice("Target Complexity: O(N!) or O(N^2 * 2^N). Use permutations, traveling salesperson, or heavy branch-and-bound pruning.");
    } else if (val <= 22) {
      setComputedAdvice("Target Complexity: O(2^N) or O(N * 2^N). Use Bitmask Dynamic Programming, Meet in the Middle, or subset generation.");
    } else if (val <= 100) {
      setComputedAdvice("Target Complexity: O(N^3) or O(N^4 / 24). Use Floyd-Warshall, Matrix Chain Multiplication, or 3D Dynamic Programming.");
    } else if (val <= 2000) {
      setComputedAdvice("Target Complexity: O(N^2). Use 2D Grid DP, Knapsack 0/1, LCS, or All-Pairs quadratic check. Submitting this on Hard banks 30-40% partial marks.");
    } else if (val <= 200000) {
      setComputedAdvice("Target Complexity: O(N log N) or O(N). MUST USE Binary Search on Answer, Sorting + Greedy, Monotonic Stack, or Two Pointers. Fast I/O mandatory.");
    } else if (val <= 10000000) {
      setComputedAdvice("Target Complexity: O(N) or O(N log log N). Linear scan, Difference Array, Sieve of Eratosthenes, or Bit frequency array.");
    } else {
      setComputedAdvice("Target Complexity: O(log N) or O(sqrt(N)) or O(1). Use Binary Search on range, Prime factor trial division, or Math exponentiation.");
    }
  };

  const dynamicEdgeCases: Record<string, string[]> = {
    array: [
      "Empty array (N = 0) or single element (N = 1)",
      "All elements identical (e.g. [7, 7, 7, 7] - checks sorting & duplicates)",
      "All negative numbers (checks Kadane reset logic)",
      "Values up to 10^9 (sums overflow 32-bit int -> requires long in Java)",
      "Array already sorted ascending or strictly descending"
    ],
    strings: [
      "Empty string (length 0) or single character",
      "String with all identical characters ('aaaa')",
      "String already a palindrome ('racecar')",
      "Non-matching characters (LCS length = 0)",
      "Odd length vs even length palindrome centers"
    ],
    graph: [
      "Disconnected components (ensure BFS/DFS iterates 1..N to visit all components)",
      "Graph has cycles vs acyclic DAG",
      "Graph is a single tree or linear line (depth N causing StackOverflow)",
      "Self-loops and parallel edges",
      "1-based vs 0-based node indexing in problem description"
    ],
    dp: [
      "Base cases: dp[0] or dp[0][0] initialized properly",
      "Target capacity = 0 in knapsack",
      "Modulo 10^9+7 required at every intermediate addition",
      "Table space too large for memory limits (reduce O(N*M) to 1D or 2 rows)",
      "Recursion depth exceeding 10^4 (use iterative bottom-up tabulation)"
    ]
  };

  const fastIoJava = `import java.io.*;
import java.util.*;

public class FastIO {
    static class FastReader {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        StringTokenizer st;
        String next() {
            while (st == null || !st.hasMoreTokens()) {
                try {
                    String line = br.readLine();
                    if (line == null) return null;
                    st = new StringTokenizer(line);
                } catch (IOException e) { return null; }
            }
            return st.nextToken();
        }
        int nextInt() { return Integer.parseInt(next()); }
        long nextLong() { return Long.parseLong(next()); }
    }
}`;

  const fastIoCpp = `#include <iostream>
using namespace std;

int main() {
    // Fast I/O template
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    return 0;
}`;

  const fastIoPy = `import sys

def main():
    # Fast I/O: reads all tokens into memory at once
    input_data = sys.stdin.read().split()
    if not input_data:
        return
    # Process tokens sequentially
    
if __name__ == '__main__':
    main()`;

  return (
    <div className="space-y-8 max-w-5xl">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-accent dark:text-accent-dark uppercase tracking-wider mb-1">
            <Wrench size={14} />
            <span>Developer Reference Desk</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Competitive Programming Toolkit & Cheat Sheets
          </h1>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 max-w-2xl leading-relaxed">
            Essential reference tables: complexity inference from constraints, copy-paste fast I/O templates, Java-specific gotchas, edge-case checklist generator, and printable exam-day reference.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-medium rounded-sm hover:border-neutral-400 transition-colors shrink-0"
        >
          <Printer size={13} />
          <span>Print Cheat Sheet (PDF)</span>
        </button>
      </div>

      {/* Feature 1: Interactive Constraint Reader Tool */}
      <div className="p-5 rounded-sm border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-4">
        <div className="flex items-center gap-2">
          <Calculator size={16} className="text-accent dark:text-accent-dark" />
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
            Interactive Constraint Reader & Complexity Analyzer
          </h3>
        </div>
        <p className="text-xs text-neutral-500">
          Paste the input scale $N$ from your problem statement (e.g. <code className="font-mono">10^5</code>, <code className="font-mono">2000</code>, or <code className="font-mono">20</code>) to instantly compute the allowable asymptotic bound and candidate approaches.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            value={inputN}
            onChange={(e) => setInputN(e.target.value)}
            placeholder="e.g. 100000 or 10^5"
            className="w-full sm:max-w-xs p-2 text-xs font-mono bg-paper-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-sm focus:outline-none"
          />
          <button
            onClick={handleComputeComplexity}
            className="w-full sm:w-auto px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-bold rounded-sm"
          >
            Infer Target Complexity
          </button>
        </div>

        {computedAdvice && (
          <div className="p-3 rounded bg-accent/10 border border-accent/30 text-xs text-neutral-900 dark:text-neutral-100 font-mono">
            {computedAdvice}
          </div>
        )}
      </div>

      {/* Feature 2: Complexity from Constraints Reference Table */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-neutral-900 dark:text-white flex items-center gap-2">
          <Cpu size={14} />
          <span>Complexity-from-Constraints Reference Guide</span>
        </h3>

        <div className="overflow-x-auto border border-neutral-200 dark:border-neutral-800 rounded-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-100 dark:bg-neutral-800/80 font-mono text-[11px] text-neutral-600 dark:text-neutral-300">
              <tr>
                <th className="p-2.5 border-b border-r border-neutral-200 dark:border-neutral-800">Constraint Bound (N)</th>
                <th className="p-2.5 border-b border-r border-neutral-200 dark:border-neutral-800">Max Operations</th>
                <th className="p-2.5 border-b border-r border-neutral-200 dark:border-neutral-800">Target Complexity</th>
                <th className="p-2.5 border-b border-neutral-200 dark:border-neutral-800">Eligible Algorithmic Patterns</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 font-mono">
              {complexityRules.map((r, idx) => (
                <tr key={idx} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                  <td className="p-2.5 font-bold text-accent dark:text-accent-dark border-r border-neutral-200 dark:border-neutral-800">
                    {r.constraint}
                  </td>
                  <td className="p-2.5 text-neutral-500 border-r border-neutral-200 dark:border-neutral-800">
                    {r.maxOps}
                  </td>
                  <td className="p-2.5 font-semibold text-neutral-900 dark:text-white border-r border-neutral-200 dark:border-neutral-800">
                    {r.expectedComplexity}
                  </td>
                  <td className="p-2.5 font-sans text-neutral-600 dark:text-neutral-400">
                    {r.candidatePatterns}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Feature 3: Fast I/O Boilerplates */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-neutral-900 dark:text-white flex items-center gap-2">
          <Zap size={14} className="text-accent dark:text-accent-dark" />
          <span>Fast I/O Production Boilerplates</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 rounded-sm border border-neutral-200 dark:border-neutral-800 bg-neutral-950 text-neutral-100 font-mono text-[11px] space-y-2">
            <div className="text-neutral-400 font-bold border-b border-neutral-800 pb-1">Java (BufferedReader)</div>
            <pre className="overflow-x-auto max-h-48 text-[11px]"><code>{fastIoJava}</code></pre>
          </div>

          <div className="p-3 rounded-sm border border-neutral-200 dark:border-neutral-800 bg-neutral-950 text-neutral-100 font-mono text-[11px] space-y-2">
            <div className="text-neutral-400 font-bold border-b border-neutral-800 pb-1">C++ (cin.tie)</div>
            <pre className="overflow-x-auto max-h-48 text-[11px]"><code>{fastIoCpp}</code></pre>
          </div>

          <div className="p-3 rounded-sm border border-neutral-200 dark:border-neutral-800 bg-neutral-950 text-neutral-100 font-mono text-[11px] space-y-2">
            <div className="text-neutral-400 font-bold border-b border-neutral-800 pb-1">Python (sys.stdin.read)</div>
            <pre className="overflow-x-auto max-h-48 text-[11px]"><code>{fastIoPy}</code></pre>
          </div>
        </div>
      </div>

      {/* Feature 4: Java Gotchas & Anti-Quicksort Vulnerabilities */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-neutral-900 dark:text-white flex items-center gap-2">
          <ShieldAlert size={14} className="text-amber-500" />
          <span>Java Hidden Traps on HackerEarth / Wingspan</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {javaGotchas.map((g, idx) => (
            <div key={idx} className="p-3.5 rounded-sm border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-2 text-xs">
              <div className="font-bold text-neutral-900 dark:text-white">
                {g.title}
              </div>
              <div className="p-2 rounded bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 font-mono text-[11px]">
                ❌ WRONG: {g.codeWrong}
              </div>
              <div className="p-2 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-mono text-[11px]">
                ✓ FIX: {g.codeCorrect}
              </div>
              <p className="text-neutral-500 text-[11px] leading-relaxed">
                {g.explanation}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Feature 5: Edge-Case Generator & Exam Checklist */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Dynamic Edge Case Checklist Generator */}
        <div className="p-4 rounded-sm border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
              Edge-Case Checklist Generator
            </h4>
            <select
              value={selectedProblemType}
              onChange={(e) => setSelectedProblemType(e.target.value)}
              className="text-xs font-mono p-1 border rounded bg-paper-50 dark:bg-neutral-800"
            >
              <option value="array">Array / Subarray</option>
              <option value="strings">Strings & LCS</option>
              <option value="graph">Graphs & Trees</option>
              <option value="dp">Dynamic Programming</option>
            </select>
          </div>

          <ul className="space-y-1.5 text-xs text-neutral-700 dark:text-neutral-300">
            {(dynamicEdgeCases[selectedProblemType] || []).map((ec, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <input type="checkbox" className="mt-0.5 accent-accent" />
                <span>{ec}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Exam-Day 8-Point Protocol */}
        <div className="p-4 rounded-sm border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-3">
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
            Exam-Day 8-Point Submission Protocol
          </h4>
          <ul className="space-y-1.5 text-xs text-neutral-700 dark:text-neutral-300">
            {examDayChecklist.slice(0, 5).map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle2 size={13} className="text-accent dark:text-accent-dark shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>

    </div>
  );
};
