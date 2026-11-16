import React from 'react';

interface FrequencyChartProps {
  data: {
    total_sample_size: number;
    by_pattern: Record<string, number>;
    by_position: Record<string, number>;
    position_breakdown: Record<string, Record<string, number>>;
  };
}

const friendlyNames: Record<string, string> = {
  dp: 'Dynamic Programming',
  sorting_and_greedy: 'Sorting & Greedy',
  arrays_and_prefix_sums: 'Arrays & Prefix Sums',
  binary_search: 'Binary Search (on Answer)',
  graphs_and_bfs_dfs: 'Graphs & BFS/DFS',
  two_pointers_and_sliding_window: 'Two Pointers / Window',
  number_theory_and_math: 'Number Theory & Math',
  simulation_and_implementation: 'Simulation / Impl',
  stack_and_monotonic_stack: 'Monotonic Stack',
  bit_tricks: 'Bit Manipulation',
  strings: 'Strings & LCS',
  hashing: 'Hashing & Frequency'
};

export const PatternFrequencyBarChart: React.FC<FrequencyChartProps> = ({ data }) => {
  const total = data.total_sample_size;
  const sortedPatterns = Object.entries(data.by_pattern).sort((a, b) => b[1] - a[1]);
  const maxVal = sortedPatterns[0]?.[1] || 1;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-neutral-500 font-mono">
        <span>Pattern Occurrences (Sample: n = {total})</span>
        <span>Frequency %</span>
      </div>

      <div className="space-y-2">
        {sortedPatterns.map(([key, count]) => {
          const pct = Math.round((count / total) * 100);
          const barWidth = Math.round((count / maxVal) * 100);
          const name = friendlyNames[key] || key;

          return (
            <div key={key} className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-neutral-800 dark:text-neutral-200 truncate pr-2">
                  {name}
                </span>
                <span className="font-mono text-neutral-500 shrink-0 text-[11px]">
                  {count} ({pct}%)
                </span>
              </div>
              
              <div className="w-full h-2 bg-neutral-200 dark:bg-neutral-800 rounded-sm overflow-hidden">
                <div
                  className="h-full bg-accent dark:bg-accent-dark transition-all duration-300 rounded-sm"
                  style={{ width: `${barWidth}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const PositionBreakdownChart: React.FC<FrequencyChartProps> = ({ data }) => {
  const positions = [
    { pos: 'P1', label: 'P1 (Easy / 20m)', count: data.by_position['P1'] || 0, color: 'bg-emerald-600' },
    { pos: 'P2', label: 'P2 (Medium / 30m)', count: data.by_position['P2'] || 0, color: 'bg-blue-600' },
    { pos: 'P3', label: 'P3 (Hard / 50m)', count: data.by_position['P3'] || 0, countColor: 'bg-purple-600', color: 'bg-amber-600' },
    { pos: 'P4', label: 'P4 (Complex / 30m)', count: data.by_position['P4'] || 0, color: 'bg-rose-600' },
  ];

  return (
    <div className="space-y-4">
      <div className="text-xs text-neutral-500 font-mono">
        Problem Distribution by Assessment Position (n = {data.total_sample_size})
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {positions.map(p => (
          <div key={p.pos} className="p-3 rounded-sm border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60">
            <div className="text-[11px] font-mono text-neutral-500">{p.label}</div>
            <div className="text-xl font-bold font-mono text-neutral-900 dark:text-white mt-1">
              {p.count} <span className="text-xs font-normal text-neutral-400">questions</span>
            </div>
            <div className="text-[10px] text-neutral-400 mt-1">
              {Math.round((p.count / data.total_sample_size) * 100)}% of dataset
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const TopicHeatmap: React.FC<FrequencyChartProps> = ({ data }) => {
  const positions = ['P1', 'P2', 'P3', 'P4'];
  const topPatterns = Object.entries(data.by_pattern)
    .sort((a, b) => b[1] - a[1])
    .map(([k]) => k);

  const getIntensityClass = (val: number) => {
    if (val === 0) return 'bg-neutral-100 dark:bg-neutral-800/40 text-neutral-400';
    if (val === 1) return 'bg-accent/20 dark:bg-accent/30 text-accent font-semibold';
    if (val <= 3) return 'bg-accent/40 dark:bg-accent/50 text-neutral-900 dark:text-white font-semibold';
    return 'bg-accent dark:bg-accent-dark text-white font-bold';
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs border border-neutral-200 dark:border-neutral-800">
        <thead className="bg-neutral-100 dark:bg-neutral-800/80 font-mono text-[11px] text-neutral-600 dark:text-neutral-300">
          <tr>
            <th className="p-2 border-b border-r border-neutral-200 dark:border-neutral-800">Algorithmic Pattern</th>
            {positions.map(p => (
              <th key={p} className="p-2 border-b border-r border-neutral-200 dark:border-neutral-800 text-center font-mono">
                {p}
              </th>
            ))}
            <th className="p-2 border-b border-neutral-200 dark:border-neutral-800 text-center font-mono">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 font-mono">
          {topPatterns.map(pat => {
            const patName = friendlyNames[pat] || pat;
            const totalForPat = data.by_pattern[pat] || 0;

            return (
              <tr key={pat} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                <td className="p-2 font-sans font-medium text-neutral-800 dark:text-neutral-200 border-r border-neutral-200 dark:border-neutral-800">
                  {patName}
                </td>
                {positions.map(pos => {
                  const val = data.position_breakdown[pos]?.[pat] || 0;
                  return (
                    <td key={pos} className={`p-2 text-center border-r border-neutral-200 dark:border-neutral-800 text-[11px] ${getIntensityClass(val)}`}>
                      {val > 0 ? val : '·'}
                    </td>
                  );
                })}
                <td className="p-2 text-center font-bold text-neutral-900 dark:text-white bg-neutral-50/60 dark:bg-neutral-800/20">
                  {totalForPat}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
