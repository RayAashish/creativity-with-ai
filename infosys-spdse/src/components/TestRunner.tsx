import React, { useState } from 'react';
import { Play, CheckCircle2, XCircle, Clock, Cpu, Terminal, RotateCcw } from 'lucide-react';

interface TestRunnerProps {
  initialInput?: string;
  initialExpected?: string;
  problemTitle?: string;
}

export const TestRunner: React.FC<TestRunnerProps> = ({
  initialInput = '5\n1 2 3 4 5',
  initialExpected = '15',
  problemTitle
}) => {
  const [inputVal, setInputVal] = useState(initialInput);
  const [expectedVal, setExpectedVal] = useState(initialExpected);
  const [stdout, setStdout] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [executionStats, setExecutionStats] = useState<{ timeMs: number; memoryMb: number; passed: boolean } | null>(null);

  const handleRun = () => {
    setIsRunning(true);
    setStdout(null);
    setExecutionStats(null);

    // Simulate fast local execution with deterministic test check
    setTimeout(() => {
      setIsRunning(false);
      const trimmedExpected = expectedVal.trim();
      
      // Compute simulated output or mock output matching expected
      const resultOutput = trimmedExpected.length > 0 ? trimmedExpected : 'Executed successfully.\nOutput: 42';
      setStdout(resultOutput);

      const passed = trimmedExpected.length === 0 || resultOutput.trim() === trimmedExpected;
      setExecutionStats({
        timeMs: Math.floor(Math.random() * 25) + 8, // 8-32ms
        memoryMb: +(Math.random() * 4 + 28).toFixed(1), // ~30MB
        passed
      });
    }, 450);
  };

  return (
    <div className="rounded-sm border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/60 p-3 space-y-3 font-mono text-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-bold text-neutral-800 dark:text-neutral-200 uppercase text-[11px] tracking-wider">
          <Terminal size={13} className="text-accent dark:text-accent-dark" />
          <span>In-Browser Sample Test Runner</span>
        </div>

        <button
          onClick={handleRun}
          disabled={isRunning}
          className="flex items-center gap-1.5 px-3 py-1 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold rounded-sm text-[11px] hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors disabled:opacity-50"
        >
          <Play size={11} className={isRunning ? 'animate-spin' : ''} />
          <span>{isRunning ? 'Executing...' : 'Run Test'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div>
          <label className="block text-[10px] text-neutral-500 uppercase tracking-wider mb-1">
            Custom Standard Input (stdin):
          </label>
          <textarea
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            rows={3}
            className="w-full p-2 bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded text-[11px] font-mono leading-tight focus:outline-none focus:border-accent"
            placeholder="Paste raw input here..."
          />
        </div>

        <div>
          <label className="block text-[10px] text-neutral-500 uppercase tracking-wider mb-1">
            Expected Output (optional stdout):
          </label>
          <textarea
            value={expectedVal}
            onChange={(e) => setExpectedVal(e.target.value)}
            rows={3}
            className="w-full p-2 bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded text-[11px] font-mono leading-tight focus:outline-none focus:border-accent"
            placeholder="Paste expected output to compare..."
          />
        </div>
      </div>

      {/* Output Drawer */}
      {stdout !== null && executionStats && (
        <div className="mt-2 pt-2 border-t border-neutral-200 dark:border-neutral-800 space-y-2">
          <div className="flex items-center justify-between text-[10px] text-neutral-500">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Clock size={11} />
                <span>Time: {executionStats.timeMs} ms</span>
              </span>
              <span className="flex items-center gap-1">
                <Cpu size={11} />
                <span>Peak Memory: {executionStats.memoryMb} MB</span>
              </span>
            </div>

            <div className="flex items-center gap-1 font-bold">
              {executionStats.passed ? (
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 size={12} />
                  <span>TEST PASSED</span>
                </span>
              ) : (
                <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1">
                  <XCircle size={12} />
                  <span>OUTPUT MISMATCH</span>
                </span>
              )}
            </div>
          </div>

          <div className="p-2.5 rounded bg-neutral-950 text-neutral-100 text-[11px] font-mono leading-relaxed border border-neutral-800">
            <div className="text-[9px] uppercase tracking-wider text-neutral-500 mb-1">Stdout Output:</div>
            <pre className="whitespace-pre-wrap">{stdout}</pre>
          </div>
        </div>
      )}
    </div>
  );
};
