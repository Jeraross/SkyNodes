import { useState } from 'react';
import type { PathData, PathNode, PathEdge } from '../../data/quizPathData';
import type { PathProgress } from '../../hooks/usePathProgress';
import { getNodeStatus } from '../../hooks/usePathProgress';

const PIXEL = { fontFamily: "'Press Start 2P', monospace" };
const MONO  = { fontFamily: 'ui-monospace, SFMono-Regular, monospace' };

const STATUS_COLORS = {
  locked:    { fill: '#1e293b', stroke: '#334155',  text: '#475569' },
  available: { fill: '#0c4a6e', stroke: '#22d3ee',  text: '#22d3ee' },
  completed: { fill: '#14532d', stroke: '#4ade80',  text: '#4ade80' },
  boss:      { fill: '#451a03', stroke: '#f59e0b',  text: '#f59e0b' },
};

const DIFFICULTY_COLOR: Record<string, string> = {
  'Fácil':   '#4ade80',
  'Médio':   '#fbbf24',
  'Difícil': '#f87171',
};

interface Props {
  pathData:   PathData;
  progress:   PathProgress;
  onNodeClick: (nodeId: string) => void;
  onNodeHover: (nodeId: string | null) => void;
}

export default function PathMapGraph({ pathData, progress, onNodeClick, onNodeHover }: Props) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const { nodes, edges, mode } = pathData;

  const getStatus = (nodeId: string) => getNodeStatus(nodeId, mode, progress);

  const handleHover = (id: string | null) => {
    setHoveredId(id);
    onNodeHover(id);
  };

  const mid = (a: number, b: number) => (a + b) / 2;

  return (
    <svg viewBox="0 0 800 420" className="w-full h-full" style={{ maxHeight: 360 }}>
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Edges */}
      {edges.map(edge => {
        const from = nodes.find(n => n.id === edge.from)!;
        const to   = nodes.find(n => n.id === edge.to)!;
        const fromStatus = getStatus(edge.from);
        const toStatus   = getStatus(edge.to);
        const active = fromStatus === 'completed' || toStatus === 'completed';
        const color  = active ? DIFFICULTY_COLOR[edge.difficulty] : '#1e293b';
        const mx = mid(from.x, to.x);
        const my = mid(from.y, to.y);

        return (
          <g key={`${edge.from}-${edge.to}`}>
            <line
              x1={from.x} y1={from.y} x2={to.x} y2={to.y}
              stroke={color} strokeWidth={active ? 2 : 1.5}
              strokeDasharray={active ? '0' : '6 4'}
              opacity={active ? 0.8 : 0.3}
            />
            {/* Difficulty label */}
            <text
              x={mx} y={my - 10}
              textAnchor="middle"
              style={{ ...PIXEL, fontSize: 6 }}
              fill={color} opacity={0.7}
            >
              {edge.difficulty.toUpperCase()}
            </text>
          </g>
        );
      })}

      {/* Nodes */}
      {nodes.map(node => {
        const status = getStatus(node.id);
        const colors = node.type === 'boss' && status === 'available'
          ? STATUS_COLORS.boss
          : STATUS_COLORS[status];
        const r = node.type === 'boss' ? 34 : 28;
        const isHovered = hoveredId === node.id && status === 'available';
        const isAvailable = status === 'available';

        return (
          <g
            key={node.id}
            style={{ cursor: isAvailable ? 'pointer' : 'default' }}
            onClick={() => isAvailable && onNodeClick(node.id)}
            onMouseEnter={() => handleHover(node.id)}
            onMouseLeave={() => handleHover(null)}
          >
            {/* Glow ring for available nodes */}
            {isAvailable && (
              <circle
                cx={node.x} cy={node.y} r={r + 8}
                fill="none"
                stroke={colors.stroke}
                strokeWidth={1.5}
                opacity={0.4}
                filter="url(#glow)"
              >
                <animate attributeName="r" values={`${r + 6};${r + 12};${r + 6}`} dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.4;0.1;0.4" dur="2s" repeatCount="indefinite" />
              </circle>
            )}

            {/* Main circle */}
            <circle
              cx={node.x} cy={node.y} r={isHovered ? r + 3 : r}
              fill={colors.fill}
              stroke={colors.stroke}
              strokeWidth={isHovered ? 3 : 2}
              style={{ transition: 'r 0.15s, stroke-width 0.15s' }}
            />

            {/* Label */}
            {node.type === 'boss' ? (
              <text x={node.x} y={node.y + 5} textAnchor="middle"
                style={{ ...PIXEL, fontSize: 9 }} fill={colors.text}>
                BOSS
              </text>
            ) : (
              <text x={node.x} y={node.y + 5} textAnchor="middle"
                style={{ ...PIXEL, fontSize: 10 }} fill={colors.text}>
                {node.label}
              </text>
            )}

            {/* Checkmark for completed */}
            {status === 'completed' && (
              <text x={node.x + r - 6} y={node.y - r + 10} textAnchor="middle"
                style={{ fontSize: 14 }} fill="#4ade80">
                ✓
              </text>
            )}

            {/* Tooltip on hover */}
            {isHovered && (
              <g>
                <rect
                  x={node.x - 90} y={node.y + r + 8}
                  width={180} height={50} rx={8}
                  fill="#0a111f" stroke="rgba(6,182,212,0.3)" strokeWidth={1}
                />
                <text x={node.x} y={node.y + r + 26}
                  textAnchor="middle"
                  style={{ ...MONO, fontSize: 11 }} fill="#94a3b8">
                  {node.tema}
                </text>
                <text x={node.x} y={node.y + r + 44}
                  textAnchor="middle"
                  style={{ ...PIXEL, fontSize: 7 }} fill="#475569">
                  {node.questionCount} QUESTOES
                </text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}
