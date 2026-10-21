import React, { useState, useEffect } from 'react';
import { Compass, Play, RotateCcw, Award, Flag, User } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Cell {
  r: number;
  c: number;
  isObstacle: boolean;
  distance: number | null;
  isVisited: boolean;
  isCurrentFrontier: boolean;
  isPath: boolean;
}

const ROWS = 7;
const COLS = 9;

export const IslandRescueBfsGame: React.FC = () => {
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [startPos] = useState<{ r: number; c: number }>({ r: 0, c: 0 });
  const [targetPos, setTargetPos] = useState<{ r: number; c: number }>({ r: ROWS - 1, c: COLS - 1 });
  const [queue, setQueue] = useState<{ r: number; c: number; dist: number; parent?: { r: number; c: number } }[]>([]);
  const [parentMap, setParentMap] = useState<Record<string, { r: number; c: number }>>({});
  const [isDone, setIsDone] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<string>('');

  const initGrid = () => {
    const newGrid: Cell[][] = [];
    const target = { r: ROWS - 1, c: COLS - 1 };
    setTargetPos(target);

    for (let r = 0; r < ROWS; r++) {
      const row: Cell[] = [];
      for (let c = 0; c < COLS; c++) {
        const isStart = r === 0 && c === 0;
        const isTarget = r === target.r && c === target.c;
        const isObstacle = !isStart && !isTarget && Math.random() < 0.22;
        row.push({
          r,
          c,
          isObstacle,
          distance: isStart ? 0 : null,
          isVisited: isStart,
          isCurrentFrontier: isStart,
          isPath: false,
        });
      }
      newGrid.push(row);
    }

    setGrid(newGrid);
    setQueue([{ r: 0, c: 0, dist: 0 }]);
    setParentMap({});
    setIsDone(false);
    setStatusMsg('Click "Step BFS Wave" to advance queue level by level and reach the rescue beacon!');
  };

  useEffect(() => {
    initGrid();
  }, []);

  const stepBfs = () => {
    if (queue.length === 0 || isDone) return;

    const currentDist = queue[0].dist;
    const waveNodes: { r: number; c: number; dist: number; parent?: { r: number; c: number } }[] = [];
    const remainingQueue: { r: number; c: number; dist: number; parent?: { r: number; c: number } }[] = [];

    for (const item of queue) {
      if (item.dist === currentDist) {
        waveNodes.push(item);
      } else {
        remainingQueue.push(item);
      }
    }

    const nextWaveQueue: { r: number; c: number; dist: number; parent?: { r: number; c: number } }[] = [...remainingQueue];
    const newGrid = grid.map(row => row.map(cell => ({ ...cell, isCurrentFrontier: false })));
    const newParents = { ...parentMap };
    let foundTarget = false;

    const dirs = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ];

    for (const curr of waveNodes) {
      if (curr.r === targetPos.r && curr.c === targetPos.c) {
        foundTarget = true;
        break;
      }

      for (const [dr, dc] of dirs) {
        const nr = curr.r + dr;
        const nc = curr.c + dc;

        if (
          nr >= 0 &&
          nr < ROWS &&
          nc >= 0 &&
          nc < COLS &&
          !newGrid[nr][nc].isObstacle &&
          !newGrid[nr][nc].isVisited
        ) {
          newGrid[nr][nc].isVisited = true;
          newGrid[nr][nc].isCurrentFrontier = true;
          newGrid[nr][nc].distance = curr.dist + 1;
          newParents[`${nr},${nc}`] = { r: curr.r, c: curr.c };

          nextWaveQueue.push({ r: nr, c: nc, dist: curr.dist + 1 });

          if (nr === targetPos.r && nc === targetPos.c) {
            foundTarget = true;
          }
        }
      }
    }

    setParentMap(newParents);
    setGrid(newGrid);
    setQueue(nextWaveQueue);

    if (foundTarget) {
      setIsDone(true);
      let curr = targetPos;
      const pathCells: { r: number; c: number }[] = [curr];
      while (curr && !(curr.r === 0 && curr.c === 0)) {
        const parent = newParents[`${curr.r},${curr.c}`];
        if (!parent) break;
        pathCells.push(parent);
        curr = parent;
      }

      setGrid(prev =>
        prev.map(row =>
          row.map(cell => ({
            ...cell,
            isPath: pathCells.some(p => p.r === cell.r && p.c === cell.c),
          }))
        )
      );

      setStatusMsg(`🎯 Target Reached! Shortest Path: ${newGrid[targetPos.r][targetPos.c].distance} steps.`);
      try {
        confetti({ particleCount: 100, spread: 70 });
      } catch (e) {
        console.error(e);
      }
    } else if (nextWaveQueue.length === 0) {
      setIsDone(true);
      setStatusMsg('❌ Rescue beacon is blocked by obstacle terrain! Reset to generate a new map.');
    } else {
      setStatusMsg(`Wave ${currentDist + 1} expanded! Active queue size: ${nextWaveQueue.length} nodes.`);
    }
  };

  const autoSolve = () => {
    let q = [...queue];
    let parents = { ...parentMap };
    let curGrid = grid.map(r => r.map(c => ({ ...c })));
    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    let reached = false;

    while (q.length > 0 && !reached) {
      const curr = q.shift()!;
      if (curr.r === targetPos.r && curr.c === targetPos.c) {
        reached = true;
        break;
      }

      for (const [dr, dc] of dirs) {
        const nr = curr.r + dr;
        const nc = curr.c + dc;
        if (
          nr >= 0 &&
          nr < ROWS &&
          nc >= 0 &&
          nc < COLS &&
          !curGrid[nr][nc].isObstacle &&
          !curGrid[nr][nc].isVisited
        ) {
          curGrid[nr][nc].isVisited = true;
          curGrid[nr][nc].distance = curr.dist + 1;
          parents[`${nr},${nc}`] = { r: curr.r, c: curr.c };
          q.push({ r: nr, c: nc, dist: curr.dist + 1 });
          if (nr === targetPos.r && nc === targetPos.c) {
            reached = true;
            break;
          }
        }
      }
    }

    if (reached) {
      let curr = targetPos;
      const pathCells: { r: number; c: number }[] = [curr];
      while (curr && !(curr.r === 0 && curr.c === 0)) {
        const parent = parents[`${curr.r},${curr.c}`];
        if (!parent) break;
        pathCells.push(parent);
        curr = parent;
      }
      curGrid = curGrid.map(row =>
        row.map(cell => ({
          ...cell,
          isPath: pathCells.some(p => p.r === cell.r && p.c === cell.c),
        }))
      );
      setGrid(curGrid);
      setParentMap(parents);
      setIsDone(true);
      setStatusMsg(`Auto-solved! Shortest path length: ${curGrid[targetPos.r][targetPos.c].distance} steps.`);
      try {
        confetti({ particleCount: 100, spread: 70 });
      } catch (e) {
        console.error(e);
      }
    } else {
      setGrid(curGrid);
      setIsDone(true);
      setStatusMsg('No valid path exists on this generated terrain.');
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
              <Compass className="w-5 h-5" />
            </span>
            <h3 className="text-xl font-bold text-white">Grid BFS: Shortest Path Wave Simulator</h3>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            See Breadth-First Search expand concentric circular waves to guarantee the shortest distance!
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={stepBfs}
            disabled={isDone || queue.length === 0}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-emerald-500/20 transition disabled:opacity-40"
          >
            <Play className="w-4 h-4" /> Step BFS Wave
          </button>
          <button
            onClick={autoSolve}
            disabled={isDone}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold text-sm rounded-xl border border-cyan-500/30 transition disabled:opacity-40"
          >
            Auto Run BFS
          </button>
          <button
            onClick={initGrid}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-xl border border-slate-700 transition"
          >
            <RotateCcw className="w-4 h-4" /> New Map
          </button>
        </div>
      </div>

      <div className="flex justify-center p-4 bg-slate-950/80 rounded-2xl border border-slate-800 mb-6 overflow-x-auto">
        <div className="grid grid-rows-7 gap-2">
          {grid.map((row, r) => (
            <div key={r} className="flex gap-2">
              {row.map((cell, c) => {
                const isStart = r === startPos.r && c === startPos.c;
                const isTarget = r === targetPos.r && c === targetPos.c;

                let cellBg = 'bg-slate-900 border-slate-800 text-slate-500';
                if (cell.isObstacle) {
                  cellBg = 'bg-slate-800/80 border-slate-700/80 text-slate-600';
                } else if (cell.isPath) {
                  cellBg = 'bg-amber-500/30 border-amber-400 text-amber-300 ring-2 ring-amber-400/80 font-bold';
                } else if (cell.isCurrentFrontier) {
                  cellBg = 'bg-cyan-500/30 border-cyan-400 text-cyan-200 ring-2 ring-cyan-400 animate-pulse';
                } else if (cell.isVisited) {
                  cellBg = 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400';
                }

                return (
                  <div
                    key={c}
                    className={`w-11 h-11 sm:w-13 sm:h-13 rounded-xl border flex flex-col items-center justify-center font-mono text-xs transition-all duration-300 relative ${cellBg}`}
                  >
                    {isStart ? (
                      <span className="text-emerald-400 font-bold flex flex-col items-center">
                        <User className="w-4 h-4" />
                        <span className="text-[9px]">START</span>
                      </span>
                    ) : isTarget ? (
                      <span className="text-rose-400 font-bold flex flex-col items-center">
                        <Flag className="w-4 h-4" />
                        <span className="text-[9px]">TARGET</span>
                      </span>
                    ) : cell.isObstacle ? (
                      <span className="text-slate-600 font-bold text-[10px]">WALL</span>
                    ) : (
                      <span className="font-bold text-sm">
                        {cell.distance !== null ? cell.distance : ''}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-950/70 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2 text-sm text-slate-300">
          <Award className="w-4 h-4 text-emerald-400" />
          <span>{statusMsg}</span>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-cyan-500/40 border border-cyan-400"></span>
            <span>BFS Wave Frontier</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-500/40 border border-amber-400"></span>
            <span>Shortest Path</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-slate-800 border border-slate-700"></span>
            <span>Obstacle</span>
          </div>
        </div>
      </div>
    </div>
  );
};
