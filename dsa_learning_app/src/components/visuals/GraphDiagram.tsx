import React from 'react';

export interface GraphVertex {
  id: string;
  label: string;
  x: number;
  y: number;
  highlight?: 'blue' | 'green' | 'orange' | 'red' | 'gray';
}

export interface GraphEdge {
  from: string;
  to: string;
  weight?: string | number;
  directed?: boolean;
  highlight?: boolean;
}

export interface InDegreeEntry {
  node: string;
  inDegree: number;
}

export interface GraphDiagramProps {
  vertices: GraphVertex[];
  edges: GraphEdge[];
  inDegreeTable?: InDegreeEntry[];
}

export const GraphDiagram: React.FC<GraphDiagramProps> = ({
  vertices,
  edges,
  inDegreeTable,
}) => {
  const width = 460;
  const height = 230;
  const nodeRadius = 18;

  const vertexMap = new Map(vertices.map((v) => [v.id, v]));

  const getVertexColors = (hl?: string) => {
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
    <div className="w-full flex flex-col md:flex-row items-center justify-center gap-6 py-2 select-none">
      {/* Graph Canvas */}
      <div className="flex-1 max-w-md w-full">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
          <defs>
            <marker
              id="graph-arrow"
              viewBox="0 0 10 10"
              refX="16"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#64748b" />
            </marker>
            <marker
              id="graph-arrow-hl"
              viewBox="0 0 10 10"
              refX="16"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
            </marker>
          </defs>

          {/* Edges */}
          {edges.map((edge, idx) => {
            const u = vertexMap.get(edge.from);
            const v = vertexMap.get(edge.to);
            if (!u || !v) return null;

            const isHl = Boolean(edge.highlight);
            const strokeColor = isHl ? '#38bdf8' : '#334155';
            const marker = edge.directed
              ? isHl
                ? 'url(#graph-arrow-hl)'
                : 'url(#graph-arrow)'
              : undefined;

            return (
              <g key={idx}>
                <line
                  x1={u.x}
                  y1={u.y}
                  x2={v.x}
                  y2={v.y}
                  stroke={strokeColor}
                  strokeWidth={isHl ? '2.5' : '1.5'}
                  markerEnd={marker}
                />
                {edge.weight !== undefined && (
                  <text
                    x={(u.x + v.x) / 2}
                    y={(u.y + v.y) / 2 - 6}
                    fill="#94a3b8"
                    fontSize="10"
                    fontWeight="bold"
                    textAnchor="middle"
                    fontFamily="monospace"
                  >
                    {edge.weight}
                  </text>
                )}
              </g>
            );
          })}

          {/* Vertices */}
          {vertices.map((node) => {
            const { fill, stroke, text } = getVertexColors(node.highlight);

            return (
              <g key={node.id} className="transition-all duration-300">
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={nodeRadius}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth="2"
                />
                <text
                  x={node.x}
                  y={node.y + 4.5}
                  fill={text}
                  fontSize="13"
                  fontWeight="bold"
                  textAnchor="middle"
                  fontFamily="monospace"
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Optional In-Degree / Distance Table */}
      {inDegreeTable && inDegreeTable.length > 0 && (
        <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs font-mono w-full sm:w-auto">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 border-b border-slate-800 pb-1">
            Kahn In-Degree Tracker
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-slate-300">
            {inDegreeTable.map((entry, idx) => (
              <div key={idx} className="flex items-center justify-between gap-3">
                <span className="font-bold text-slate-400">Node {entry.node}:</span>
                <span
                  className={`px-1.5 py-0.2 rounded font-bold ${
                    entry.inDegree === 0
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'text-slate-300'
                  }`}
                >
                  {entry.inDegree}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
