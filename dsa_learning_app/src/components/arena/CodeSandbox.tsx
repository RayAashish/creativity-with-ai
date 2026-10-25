import React, { useState } from 'react';
import { 
  Play, 
  Terminal, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Cpu, 
  Sparkles,
  Layers,
  Code2
} from 'lucide-react';

interface SandboxSnippet {
  id: string;
  title: string;
  pattern: string;
  defaultInput: string;
  defaultCode: string;
  testCases: { label: string; input: string; expected: string }[];
}

const SANDBOX_SNIPPETS: SandboxSnippet[] = [
  {
    id: 'two-sum',
    title: 'Two Sum (Hash Map)',
    pattern: 'Hash Map Lookup',
    defaultInput: JSON.stringify({ nums: [2, 7, 11, 15], target: 9 }, null, 2),
    testCases: [
      { label: 'Example 1', input: JSON.stringify({ nums: [2, 7, 11, 15], target: 9 }), expected: '[0, 1]' },
      { label: 'Example 2', input: JSON.stringify({ nums: [3, 2, 4], target: 6 }), expected: '[1, 2]' },
      { label: 'Example 3', input: JSON.stringify({ nums: [3, 3], target: 6 }), expected: '[0, 1]' }
    ],
    defaultCode: `// Function executes with input: { nums, target }
function solve(input) {
  const { nums, target } = input;
  const seen = new Map();
  console.log("Input numbers:", nums, "Target:", target);

  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    console.log(\`Index \${i}: num=\${nums[i]}, searching complement=\${complement}\`);
    if (seen.has(complement)) {
      console.log(\`Found complement at index \${seen.get(complement)}!\`);
      return [seen.get(complement), i];
    }
    seen.set(nums[i], i);
  }
  return [];
}`
  },
  {
    id: 'kadanes',
    title: 'Maximum Subarray (Kadane\'s)',
    pattern: 'Dynamic Programming',
    defaultInput: JSON.stringify({ nums: [-2, 1, -3, 4, -1, 2, 1, -5, 4] }, null, 2),
    testCases: [
      { label: 'Standard Mix', input: JSON.stringify({ nums: [-2, 1, -3, 4, -1, 2, 1, -5, 4] }), expected: '6' },
      { label: 'All Negative', input: JSON.stringify({ nums: [-5, -2, -8, -1] }), expected: '-1' },
      { label: 'All Positive', input: JSON.stringify({ nums: [1, 2, 3, 4] }), expected: '10' }
    ],
    defaultCode: `function solve(input) {
  const { nums } = input;
  let currentSum = nums[0];
  let maxSum = nums[0];
  console.log("Starting Kadane's on array of length", nums.length);

  for (let i = 1; i < nums.length; i++) {
    // Decision: extend previous subarray or start fresh from current element
    currentSum = Math.max(nums[i], currentSum + nums[i]);
    maxSum = Math.max(maxSum, currentSum);
    console.log(\`Step \${i} (\${nums[i]}): currentSubarraySum=\${currentSum}, globalMax=\${maxSum}\`);
  }
  return maxSum;
}`
  },
  {
    id: 'valid-parens',
    title: 'Valid Parentheses (Stack)',
    pattern: 'LIFO Stack',
    defaultInput: JSON.stringify({ s: '()[]{}' }, null, 2),
    testCases: [
      { label: 'Simple Valid', input: JSON.stringify({ s: '()[]{}' }), expected: 'true' },
      { label: 'Nested Valid', input: JSON.stringify({ s: '{[()]}' }), expected: 'true' },
      { label: 'Mismatched', input: JSON.stringify({ s: '(]' }), expected: 'false' },
      { label: 'Trailing Opener', input: JSON.stringify({ s: '(((' }), expected: 'false' }
    ],
    defaultCode: `function solve(input) {
  const { s } = input;
  const stack = [];
  console.log("Validating bracket string:", s);

  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '(') stack.push(')');
    else if (c === '{') stack.push('}');
    else if (c === '[') stack.push(']');
    else {
      const expected = stack.pop();
      console.log(\`At pos \${i} char '\${c}': expected '\${expected}'\`);
      if (expected !== c) return false;
    }
  }
  return stack.length === 0;
}`
  },
  {
    id: 'trapping-water',
    title: 'Trapping Rain Water (Two Pointers)',
    pattern: 'Two Pointers Converging',
    defaultInput: JSON.stringify({ height: [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1] }, null, 2),
    testCases: [
      { label: 'LeetCode Elevation', input: JSON.stringify({ height: [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1] }), expected: '6' },
      { label: 'Dual Peaks', input: JSON.stringify({ height: [4, 2, 0, 3, 2, 5] }), expected: '9' }
    ],
    defaultCode: `function solve(input) {
  const { height } = input;
  let left = 0, right = height.length - 1;
  let leftMax = 0, rightMax = 0;
  let totalWater = 0;

  while (left < right) {
    if (height[left] < height[right]) {
      if (height[left] >= leftMax) leftMax = height[left];
      else {
        totalWater += leftMax - height[left];
        console.log(\`Trapped \${leftMax - height[left]} water at left index \${left}\`);
      }
      left++;
    } else {
      if (height[right] >= rightMax) rightMax = height[right];
      else {
        totalWater += rightMax - height[right];
        console.log(\`Trapped \${rightMax - height[right]} water at right index \${right}\`);
      }
      right--;
    }
  }
  return totalWater;
}`
  }
];

export const CodeSandbox: React.FC = () => {
  const [selectedSnippetId, setSelectedSnippetId] = useState<string>('two-sum');
  const activeSnippet = SANDBOX_SNIPPETS.find(s => s.id === selectedSnippetId) || SANDBOX_SNIPPETS[0];

  const [code, setCode] = useState<string>(activeSnippet.defaultCode);
  const [inputStr, setInputStr] = useState<string>(activeSnippet.defaultInput);
  const [output, setOutput] = useState<{
    result: any;
    logs: string[];
    executionTimeMs: number;
    error: string | null;
  } | null>(null);

  const handleSelectSnippet = (id: string) => {
    setSelectedSnippetId(id);
    const snip = SANDBOX_SNIPPETS.find(s => s.id === id);
    if (snip) {
      setCode(snip.defaultCode);
      setInputStr(snip.defaultInput);
      setOutput(null);
    }
  };

  const handleApplyTestCase = (tcInput: string) => {
    try {
      const parsed = JSON.parse(tcInput);
      setInputStr(JSON.stringify(parsed, null, 2));
    } catch (e) {
      setInputStr(tcInput);
    }
  };

  const handleRun = () => {
    const logs: string[] = [];
    const customConsole = {
      log: (...args: any[]) => {
        logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
      }
    };

    let parsedInput: any;
    try {
      parsedInput = JSON.parse(inputStr);
    } catch (e: any) {
      setOutput({
        result: null,
        logs: [],
        executionTimeMs: 0,
        error: `JSON Input Parse Error: ${e.message}`
      });
      return;
    }

    const startTime = performance.now();
    try {
      // Safe sandbox function creation
      const runnableFn = new Function('console', `${code}\nreturn solve;`)(customConsole);
      const res = runnableFn(parsedInput);
      const endTime = performance.now();

      setOutput({
        result: res,
        logs,
        executionTimeMs: parseFloat((endTime - startTime).toFixed(2)),
        error: null
      });
    } catch (err: any) {
      const endTime = performance.now();
      setOutput({
        result: null,
        logs,
        executionTimeMs: parseFloat((endTime - startTime).toFixed(2)),
        error: `Execution Error: ${err.message}`
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Live Sandbox
            </span>
            <span className="text-xs font-mono text-[var(--text-muted)]">
              Client-Side In-Browser Execution
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            Algorithmic Execution Playground
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 max-w-2xl">
            Tweak code, modify inputs, test edge cases, and inspect step-by-step telemetry right inside the browser with zero latency.
          </p>
        </div>

        {/* Snippet Picker */}
        <div className="flex items-center gap-2">
          {SANDBOX_SNIPPETS.map(snip => (
            <button
              key={snip.id}
              type="button"
              onClick={() => handleSelectSnippet(snip.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition border ${
                snip.id === selectedSnippetId
                  ? 'bg-[var(--bg-subtle)] border-[var(--border-active)] text-[var(--text-primary)] font-bold'
                  : 'bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              }`}
            >
              {snip.title.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Main Sandbox Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Code Editor & Test Cases */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-[var(--text-muted)]" />
                <span className="text-xs font-mono font-bold text-[var(--text-primary)]">
                  {activeSnippet.title}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-[var(--text-muted)]">
                  {activeSnippet.pattern}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setCode(activeSnippet.defaultCode)}
                className="flex items-center gap-1 text-[11px] font-mono text-[var(--text-muted)] hover:text-[var(--text-primary)] transition"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Code</span>
              </button>
            </div>

            {/* Editable Code Textarea */}
            <div className="rounded-lg bg-[#0d1117] border border-[#30363d] overflow-hidden focus-within:border-[var(--border-active)]">
              <div className="px-3.5 py-1.5 bg-[#161b22] border-b border-[#30363d] text-[10px] font-mono text-[#8b949e] flex items-center justify-between">
                <span>JavaScript (ES6) Runnable Function</span>
                <span>solve(input)</span>
              </div>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                rows={14}
                className="w-full p-3.5 bg-transparent text-xs font-mono text-[#e6edf3] leading-relaxed resize-y focus:outline-none"
                spellCheck={false}
              />
            </div>
          </div>

          {/* Test Case Quick Buttons */}
          <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-2">
            <div className="text-xs font-mono uppercase text-[var(--text-muted)]">Pre-loaded Test Cases</div>
            <div className="flex flex-wrap gap-2">
              {activeSnippet.testCases.map((tc, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyTestCase(tc.input)}
                  className="px-3 py-1.5 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-subtle)] hover:border-[var(--border-active)] text-xs font-mono text-[var(--text-secondary)] transition text-left"
                >
                  <span className="font-bold text-[var(--text-primary)]">{tc.label}:</span>{' '}
                  <span className="text-[var(--text-muted)]">{tc.input}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Input & Output Console */}
        <div className="lg:col-span-5 space-y-4">
          {/* Input Panel */}
          <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[var(--text-primary)]">
                Input Parameters (JSON)
              </span>
              <button
                type="button"
                onClick={handleRun}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--text-primary)] text-[var(--text-inverse)] font-mono text-xs font-bold hover:opacity-90 transition active:scale-95 shadow-sm"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run Code</span>
              </button>
            </div>

            <textarea
              value={inputStr}
              onChange={(e) => setInputStr(e.target.value)}
              rows={4}
              className="w-full p-3 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-active)] resize-y"
              spellCheck={false}
            />
          </div>

          {/* Console Output Panel */}
          <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[var(--text-muted)]" />
                <span className="text-xs font-mono font-bold text-[var(--text-primary)]">
                  Execution Output
                </span>
              </div>
              {output && (
                <div className="flex items-center gap-2 text-[10px] font-mono text-[var(--text-muted)]">
                  <Clock className="w-3 h-3" />
                  <span>{output.executionTimeMs} ms</span>
                </div>
              )}
            </div>

            {output ? (
              <div className="space-y-3">
                {/* Result Value */}
                {output.error ? (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs font-mono text-red-400">
                    {output.error}
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-subtle)] font-mono">
                    <span className="text-[10px] uppercase text-[var(--text-muted)] block mb-1">
                      Return Value:
                    </span>
                    <span className="text-sm font-bold text-emerald-400">
                      {output.result === undefined ? 'undefined' : JSON.stringify(output.result)}
                    </span>
                  </div>
                )}

                {/* Console Logs */}
                <div>
                  <div className="text-[10px] font-mono uppercase text-[var(--text-muted)] mb-1.5">
                    Console Telemetry ({output.logs.length} entries):
                  </div>
                  <div className="rounded-lg bg-[#0d1117] border border-[#30363d] p-3 max-h-48 overflow-y-auto text-xs font-mono text-[#8b949e] space-y-1">
                    {output.logs.length > 0 ? (
                      output.logs.map((log, idx) => (
                        <div key={idx} className="leading-snug text-[#e6edf3]">
                          <span className="text-[#8b949e] mr-2">›</span>
                          {log}
                        </div>
                      ))
                    ) : (
                      <div className="text-[var(--text-muted)] italic">No console.log statements generated.</div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-xs font-mono text-[var(--text-muted)]">
                Click <span className="font-bold text-[var(--text-primary)]">"Run Code"</span> to execute the algorithm and observe outputs.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
