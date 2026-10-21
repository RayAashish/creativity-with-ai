import React from 'react';

export interface ArrayPointer {
  label: string; // e.g. "Left", "Right", "Slow", "Fast", "mid"
  index: number;
  color?: 'orange' | 'blue' | 'green' | 'red';
  position?: 'top' | 'bottom';
}

export interface ArrayHighlight {
  index: number;
  color: 'blue' | 'green' | 'orange' | 'red' | 'gray';
  label?: string;
}

export interface ArrayWindow {
  start: number;
  end: number;
  label?: string;
}

export interface ArrayDiagramProps {
  array: (string | number)[];
  pointers?: ArrayPointer[];
  highlights?: ArrayHighlight[];
  window?: ArrayWindow;
  showIndices?: boolean;
}

export const ArrayDiagram: React.FC<ArrayDiagramProps> = ({
  array,
  pointers = [],
  highlights = [],
  window,
  showIndices = true,
}) => {
  const boxWidth = 56;
  const boxHeight = 48;
  const gap = 8;
  const totalWidth = array.length * (boxWidth + gap) - gap + 40;
  const svgHeight = 170;
  const arrayY = 65;

  const getCellFill = (index: number) => {
    const h = highlights.find((x) => x.index === index);
    if (!h) return { fill: '#0f172a', stroke: '#334155', text: '#f1f5f9' };
    switch (h.color) {
      case 'blue':
        return { fill: 'rgba(56, 189, 248, 0.2)', stroke: '#38bdf8', text: '#38bdf8' };
      case 'green':
        return { fill: 'rgba(52, 211, 153, 0.2)', stroke: '#34d399', text: '#34d399' };
      case 'orange':
        return { fill: 'rgba(251, 191, 36, 0.2)', stroke: '#fbbf24', text: '#fbbf24' };
      case 'red':
        return { fill: 'rgba(248, 113, 113, 0.2)', stroke: '#f87171', text: '#f87171' };
      default:
        return { fill: '#1e293b', stroke: '#475569', text: '#94a3b8' };
    }
  };

  const getPointerColor = (color?: string) => {
    switch (color) {
      case 'blue':
        return '#38bdf8';
      case 'green':
        return '#34d399';
      case 'red':
        return '#f87171';
      default:
        return '#fbbf24'; // orange default
    }
  };

  return (
    <div className="w-full flex justify-center overflow-x-auto custom-scrollbar py-2">
      <svg
        viewBox={`0 0 ${Math.max(totalWidth, 380)} ${svgHeight}`}
        className="w-full max-w-2xl h-auto select-none"
        style={{ minWidth: `${Math.min(totalWidth, 600)}px` }}
      >
        <defs>
          <marker
            id="arr-arrow-down"
            viewBox="0 0 10 10"
            refX="5"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#fbbf24" />
          </marker>
          <marker
            id="arr-arrow-up"
            viewBox="0 0 10 10"
            refX="5"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#fbbf24" />
          </marker>
        </defs>

        {/* Sliding Window Bracket Overlay */}
        {window && window.start <= window.end && (
          <g>
            {(() => {
              const x1 = 20 + window.start * (boxWidth + gap) - 4;
              const x2 = 20 + window.end * (boxWidth + gap) + boxWidth + 4;
              const wWidth = x2 - x1;
              return (
                <rect
                  x={x1}
                  y={arrayY - 4}
                  width={wWidth}
                  height={boxHeight + 8}
                  rx="12"
                  fill="rgba(56, 189, 248, 0.08)"
                  stroke="#38bdf8"
                  strokeWidth="2"
                  strokeDasharray="4 3"
                />
              );
            })()}
            {window.label && (
              <text
                x={20 + ((window.start + window.end) / 2) * (boxWidth + gap) + boxWidth / 2}
                y={arrayY - 12}
                fill="#38bdf8"
                fontSize="11"
                fontWeight="bold"
                textAnchor="middle"
                fontFamily="monospace"
              >
                {window.label}
              </text>
            )}
          </g>
        )}

        {/* Array Boxes & Values */}
        {array.map((val, idx) => {
          const x = 20 + idx * (boxWidth + gap);
          const { fill, stroke, text } = getCellFill(idx);

          return (
            <g key={idx}>
              {/* Box */}
              <rect
                x={x}
                y={arrayY}
                width={boxWidth}
                height={boxHeight}
                rx="8"
                fill={fill}
                stroke={stroke}
                strokeWidth="2"
              />

              {/* Value */}
              <text
                x={x + boxWidth / 2}
                y={arrayY + boxHeight / 2 + 5}
                fill={text}
                fontSize="15"
                fontWeight="bold"
                textAnchor="middle"
                fontFamily="monospace"
              >
                {val}
              </text>

              {/* Index Number */}
              {showIndices && (
                <text
                  x={x + boxWidth / 2}
                  y={arrayY + boxHeight + 18}
                  fill="#64748b"
                  fontSize="10"
                  textAnchor="middle"
                  fontFamily="monospace"
                >
                  [{idx}]
                </text>
              )}
            </g>
          );
        })}

        {/* Top Pointers */}
        {pointers
          .filter((p) => p.position !== 'bottom')
          .map((p, idx) => {
            const x = 20 + p.index * (boxWidth + gap) + boxWidth / 2;
            const color = getPointerColor(p.color);
            return (
              <g key={`top-${idx}`}>
                <text
                  x={x}
                  y={arrayY - 26}
                  fill={color}
                  fontSize="12"
                  fontWeight="bold"
                  textAnchor="middle"
                  fontFamily="monospace"
                >
                  {p.label}
                </text>
                <line
                  x1={x}
                  y1={arrayY - 22}
                  x2={x}
                  y2={arrayY - 6}
                  stroke={color}
                  strokeWidth="2"
                  markerEnd="url(#arr-arrow-down)"
                />
              </g>
            );
          })}

        {/* Bottom Pointers */}
        {pointers
          .filter((p) => p.position === 'bottom')
          .map((p, idx) => {
            const x = 20 + p.index * (boxWidth + gap) + boxWidth / 2;
            const color = getPointerColor(p.color);
            return (
              <g key={`bottom-${idx}`}>
                <line
                  x1={x}
                  y1={arrayY + boxHeight + 28}
                  x2={x}
                  y2={arrayY + boxHeight + 8}
                  stroke={color}
                  strokeWidth="2"
                />
                <text
                  x={x}
                  y={arrayY + boxHeight + 42}
                  fill={color}
                  fontSize="12"
                  fontWeight="bold"
                  textAnchor="middle"
                  fontFamily="monospace"
                >
                  {p.label}
                </text>
              </g>
            );
          })}
      </svg>
    </div>
  );
};
