import React from 'react';

export interface DPCell {
  r: number;
  c: number;
  val: string | number;
  highlight?: 'current' | 'dependent' | 'done' | 'default';
}

export interface DPDependencyArrow {
  fromRow: number;
  fromCol: number;
  toRow: number;
  toCol: number;
  label?: string;
}

export interface DPTableDiagramProps {
  rowHeaders: (string | number)[];
  colHeaders: (string | number)[];
  cells: DPCell[];
  formula?: string;
  dependencies?: DPDependencyArrow[];
}

export const DPTableDiagram: React.FC<DPTableDiagramProps> = ({
  rowHeaders,
  colHeaders,
  cells,
  formula,
  dependencies = [],
}) => {
  const cellWidth = 46;
  const cellHeight = 36;
  const headerWidth = 60;
  const headerHeight = 32;

  const totalWidth = headerWidth + colHeaders.length * cellWidth + 20;
  const totalHeight = headerHeight + rowHeaders.length * cellHeight + 20;

  const cellMap = new Map<string, DPCell>();
  cells.forEach((c) => cellMap.set(`${c.r},${c.c}`, c));

  const getCellColors = (hl?: string) => {
    switch (hl) {
      case 'current':
        return { fill: 'rgba(56, 189, 248, 0.25)', stroke: '#38bdf8', text: '#38bdf8' };
      case 'dependent':
        return { fill: 'rgba(251, 191, 36, 0.25)', stroke: '#fbbf24', text: '#fbbf24' };
      case 'done':
        return { fill: 'rgba(52, 211, 153, 0.2)', stroke: '#34d399', text: '#34d399' };
      default:
        return { fill: '#0f172a', stroke: '#1e293b', text: '#94a3b8' };
    }
  };

  return (
    <div className="w-full flex flex-col items-center py-2 select-none">
      {formula && (
        <div className="mb-3 px-3 py-1.5 rounded-xl bg-slate-950 border border-cyan-500/30 text-xs font-mono text-cyan-300">
          <span className="text-slate-400 font-sans">Formula: </span>
          <span className="font-bold">{formula}</span>
        </div>
      )}

      <div className="overflow-x-auto custom-scrollbar w-full flex justify-center">
        <svg
          viewBox={`0 0 ${totalWidth} ${totalHeight}`}
          className="h-auto"
          style={{ minWidth: `${Math.min(totalWidth, 480)}px`, maxWidth: '520px' }}
        >
          <defs>
            <marker
              id="dp-arrow"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#fbbf24" />
            </marker>
          </defs>

          {/* Column Headers */}
          {colHeaders.map((col, cIdx) => (
            <text
              key={`ch-${cIdx}`}
              x={headerWidth + cIdx * cellWidth + cellWidth / 2}
              y={headerHeight - 10}
              fill="#64748b"
              fontSize="11"
              fontWeight="bold"
              textAnchor="middle"
              fontFamily="monospace"
            >
              {col}
            </text>
          ))}

          {/* Row Headers & Table Grid */}
          {rowHeaders.map((row, rIdx) => {
            const y = headerHeight + rIdx * cellHeight;

            return (
              <g key={`row-${rIdx}`}>
                {/* Row Header Label */}
                <text
                  x={headerWidth - 10}
                  y={y + cellHeight / 2 + 4}
                  fill="#64748b"
                  fontSize="11"
                  fontWeight="bold"
                  textAnchor="end"
                  fontFamily="monospace"
                >
                  {row}
                </text>

                {/* Row Cells */}
                {colHeaders.map((_, cIdx) => {
                  const x = headerWidth + cIdx * cellWidth;
                  const cell = cellMap.get(`${rIdx},${cIdx}`);
                  const val = cell ? cell.val : '-';
                  const { fill, stroke, text } = getCellColors(cell?.highlight);

                  return (
                    <g key={`cell-${rIdx}-${cIdx}`}>
                      <rect
                        x={x}
                        y={y}
                        width={cellWidth}
                        height={cellHeight}
                        fill={fill}
                        stroke={stroke}
                        strokeWidth="1.5"
                      />
                      <text
                        x={x + cellWidth / 2}
                        y={y + cellHeight / 2 + 4.5}
                        fill={text}
                        fontSize="12"
                        fontWeight="bold"
                        textAnchor="middle"
                        fontFamily="monospace"
                      >
                        {val}
                      </text>
                    </g>
                  );
                })}
              </g>
            );
          })}

          {/* Dependency Arrows */}
          {dependencies.map((dep, idx) => {
            const startX = headerWidth + dep.fromCol * cellWidth + cellWidth / 2;
            const startY = headerHeight + dep.fromRow * cellHeight + cellHeight / 2;
            const targetX = headerWidth + dep.toCol * cellWidth + cellWidth / 2;
            const targetY = headerHeight + dep.toRow * cellHeight + cellHeight / 2;

            return (
              <g key={`dep-${idx}`}>
                <path
                  d={`M ${startX} ${startY} Q ${(startX + targetX) / 2 + 10} ${(startY + targetY) / 2 - 10} ${targetX} ${targetY}`}
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="2"
                  strokeDasharray="3 2"
                  markerEnd="url(#dp-arrow)"
                />
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
