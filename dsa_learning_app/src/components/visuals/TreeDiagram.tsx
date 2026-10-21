import React from 'react';

export interface TreeNodeVisual {
  id: string;
  val: string | number;
  orderBadge?: number; // e.g. visit order 1, 2, 3
  highlight?: 'blue' | 'green' | 'orange' | 'red' | 'gray';
  x: number; // percentage 0 - 100 or coordinate
  y: number; // coordinate
  leftId?: string;
  rightId?: string;
}

export interface TreeDiagramProps {
  nodes: TreeNodeVisual[];
  title?: string;
  traversalSequence?: (string | number)[];
  traversalType?: 'Pre-order' | 'In-order' | 'Post-order' | 'Level-order (BFS)';
}

export const TreeDiagram: React.FC<TreeDiagramProps> = ({
  nodes,
  traversalSequence,
  traversalType = 'Pre-order',
}) => {
  const width = 460;
  const height = 240;
  const nodeRadius = 18;

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  const getNodeColors = (hl?: string) => {
    switch (hl) {
      case 'blue':
        return { fill: 'rgba(56, 189, 248, 0.25)', stroke: '#38bdf8', text: '#38bdf8' };
      case 'green':
        return { fill: 'rgba(52, 211, 153, 0.25)', stroke: '#34d399', text: '#34d399' };
      case 'orange':
        return { fill: 'rgba(251, 191, 36, 0.25)', stroke: '#fbbf24', text: '#fbbf24' };
      case 'red':
        return { fill: 'rgba(248, 113, 113, 0.25)', stroke: '#f87171', text: '#f87171' };
      default:
        return { fill: '#0f172a', stroke: '#334155', text: '#94a3b8' };
    }
  };

  return (
    <div className="w-full flex flex-col items-center select-none py-2">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full max-w-lg h-auto"
      >
        {/* Draw Connecting Edges First */}
        {nodes.map((node) => {
          const edges = [];
          if (node.leftId && nodeMap.has(node.leftId)) {
            const child = nodeMap.get(node.leftId)!;
            edges.push(
              <line
                key={`${node.id}-${child.id}`}
                x1={node.x}
                y1={node.y}
                x2={child.x}
                y2={child.y}
                stroke="#334155"
                strokeWidth="2"
              />
            );
          }
          if (node.rightId && nodeMap.has(node.rightId)) {
            const child = nodeMap.get(node.rightId)!;
            edges.push(
              <line
                key={`${node.id}-${child.id}`}
                x1={node.x}
                y1={node.y}
                x2={child.x}
                y2={child.y}
                stroke="#334155"
                strokeWidth="2"
              />
            );
          }
          return edges;
        })}

        {/* Draw Nodes */}
        {nodes.map((node) => {
          const { fill, stroke, text } = getNodeColors(node.highlight);

          return (
            <g key={node.id} className="transition-all duration-300">
              {/* Outer Glow if active */}
              {node.highlight && node.highlight !== 'gray' && (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={nodeRadius + 4}
                  fill="none"
                  stroke={stroke}
                  strokeWidth="1.5"
                  opacity="0.5"
                />
              )}

              {/* Node Circle */}
              <circle
                cx={node.x}
                cy={node.y}
                r={nodeRadius}
                fill={fill}
                stroke={stroke}
                strokeWidth="2"
              />

              {/* Node Value */}
              <text
                x={node.x}
                y={node.y + 4.5}
                fill={text}
                fontSize="13"
                fontWeight="bold"
                textAnchor="middle"
                fontFamily="monospace"
              >
                {node.val}
              </text>

              {/* Visit Order Badge */}
              {node.orderBadge !== undefined && (
                <g>
                  <circle
                    cx={node.x + 15}
                    cy={node.y - 14}
                    r="8.5"
                    fill="#38bdf8"
                    stroke="#0f172a"
                    strokeWidth="1.5"
                  />
                  <text
                    x={node.x + 15}
                    y={node.y - 11}
                    fill="#0f172a"
                    fontSize="9.5"
                    fontWeight="black"
                    textAnchor="middle"
                    fontFamily="monospace"
                  >
                    {node.orderBadge}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>

      {/* Traversal Order Pill Bar */}
      {traversalSequence && traversalSequence.length > 0 && (
        <div className="mt-2 flex items-center gap-2 p-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono">
          <span className="text-slate-400 font-semibold">{traversalType} Order:</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {traversalSequence.map((item, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-bold"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
