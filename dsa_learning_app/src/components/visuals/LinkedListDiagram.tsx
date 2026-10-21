import React from 'react';

export interface ListNodeData {
  id: string | number;
  val: string | number;
  highlight?: 'blue' | 'green' | 'orange' | 'red' | 'gray';
  pointers?: string[]; // e.g. ["slow", "head"]
}

export interface LinkedListDiagramProps {
  nodes: ListNodeData[];
  cycleToIndex?: number; // If set, draws a curved arrow back to nodes[cycleToIndex]
  nullTerminated?: boolean;
}

export const LinkedListDiagram: React.FC<LinkedListDiagramProps> = ({
  nodes,
  cycleToIndex,
  nullTerminated = true,
}) => {
  const nodeWidth = 72;
  const nodeHeight = 44;
  const gap = 38;
  const totalWidth = nodes.length * (nodeWidth + gap) + 60;
  const svgHeight = cycleToIndex !== undefined ? 180 : 130;
  const nodeY = 45;

  const getNodeColors = (hl?: string) => {
    switch (hl) {
      case 'blue':
        return { fill: 'rgba(56, 189, 248, 0.2)', stroke: '#38bdf8', text: '#38bdf8' };
      case 'green':
        return { fill: 'rgba(52, 211, 153, 0.2)', stroke: '#34d399', text: '#34d399' };
      case 'orange':
        return { fill: 'rgba(251, 191, 36, 0.2)', stroke: '#fbbf24', text: '#fbbf24' };
      case 'red':
        return { fill: 'rgba(248, 113, 113, 0.2)', stroke: '#f87171', text: '#f87171' };
      default:
        return { fill: '#0f172a', stroke: '#334155', text: '#f1f5f9' };
    }
  };

  return (
    <div className="w-full flex justify-center overflow-x-auto custom-scrollbar py-2">
      <svg
        viewBox={`0 0 ${Math.max(totalWidth, 380)} ${svgHeight}`}
        className="w-full max-w-2xl h-auto select-none"
        style={{ minWidth: `${Math.min(totalWidth, 580)}px` }}
      >
        <defs>
          <marker
            id="ll-arrow"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
          </marker>
          <marker
            id="ll-cycle-arrow"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#f87171" />
          </marker>
        </defs>

        {nodes.map((node, idx) => {
          const x = 30 + idx * (nodeWidth + gap);
          const { fill, stroke, text } = getNodeColors(node.highlight);
          const isLast = idx === nodes.length - 1;

          return (
            <g key={node.id}>
              {/* Pointer labels above node */}
              {node.pointers && node.pointers.length > 0 && (
                <g>
                  <text
                    x={x + nodeWidth / 2}
                    y={nodeY - 14}
                    fill="#fbbf24"
                    fontSize="11"
                    fontWeight="bold"
                    textAnchor="middle"
                    fontFamily="monospace"
                  >
                    {node.pointers.join(' | ')}
                  </text>
                  <line
                    x1={x + nodeWidth / 2}
                    y1={nodeY - 10}
                    x2={x + nodeWidth / 2}
                    y2={nodeY - 3}
                    stroke="#fbbf24"
                    strokeWidth="1.5"
                  />
                </g>
              )}

              {/* Node Outer Container (Data Compartment + Next Pointer Compartment) */}
              <rect
                x={x}
                y={nodeY}
                width={nodeWidth}
                height={nodeHeight}
                rx="8"
                fill={fill}
                stroke={stroke}
                strokeWidth="2"
              />

              {/* Divider between Val and Next */}
              <line
                x1={x + 44}
                y1={nodeY}
                x2={x + 44}
                y2={nodeY + nodeHeight}
                stroke={stroke}
                strokeWidth="1.5"
              />

              {/* Node Data Value */}
              <text
                x={x + 22}
                y={nodeY + nodeHeight / 2 + 5}
                fill={text}
                fontSize="14"
                fontWeight="bold"
                textAnchor="middle"
                fontFamily="monospace"
              >
                {node.val}
              </text>

              {/* Next Pointer Dot */}
              <circle
                cx={x + 58}
                cy={nodeY + nodeHeight / 2}
                r="3.5"
                fill={stroke}
              />

              {/* Forward Arrow to Next Node */}
              {!isLast && (
                <line
                  x1={x + nodeWidth}
                  y1={nodeY + nodeHeight / 2}
                  x2={x + nodeWidth + gap - 2}
                  y2={nodeY + nodeHeight / 2}
                  stroke="#38bdf8"
                  strokeWidth="2"
                  markerEnd="url(#ll-arrow)"
                />
              )}

              {/* Null terminator if last node and not cycle */}
              {isLast && cycleToIndex === undefined && nullTerminated && (
                <g>
                  <line
                    x1={x + nodeWidth}
                    y1={nodeY + nodeHeight / 2}
                    x2={x + nodeWidth + 24}
                    y2={nodeY + nodeHeight / 2}
                    stroke="#64748b"
                    strokeWidth="2"
                    markerEnd="url(#ll-arrow)"
                  />
                  <text
                    x={x + nodeWidth + 30}
                    y={nodeY + nodeHeight / 2 + 4}
                    fill="#64748b"
                    fontSize="11"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    NULL
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* Cycle Loop Curved Arrow */}
        {cycleToIndex !== undefined && cycleToIndex >= 0 && cycleToIndex < nodes.length && (
          <g>
            {(() => {
              const lastNodeX = 30 + (nodes.length - 1) * (nodeWidth + gap) + nodeWidth;
              const targetNodeX = 30 + cycleToIndex * (nodeWidth + gap) + nodeWidth / 2;
              const startY = nodeY + nodeHeight / 2;
              const bottomArcY = nodeY + nodeHeight + 45;

              return (
                <path
                  d={`M ${lastNodeX} ${startY} 
                      C ${lastNodeX + 35} ${bottomArcY}, ${targetNodeX - 25} ${bottomArcY}, ${targetNodeX} ${nodeY + nodeHeight + 8}`}
                  fill="none"
                  stroke="#f87171"
                  strokeWidth="2.5"
                  strokeDasharray="5 3"
                  markerEnd="url(#ll-cycle-arrow)"
                />
              );
            })()}
            <text
              x={30 + ((cycleToIndex + nodes.length - 1) / 2) * (nodeWidth + gap)}
              y={nodeY + nodeHeight + 42}
              fill="#f87171"
              fontSize="11"
              fontWeight="bold"
              textAnchor="middle"
              fontFamily="monospace"
            >
              🔄 Cycle back to node {nodes[cycleToIndex].val}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
};
