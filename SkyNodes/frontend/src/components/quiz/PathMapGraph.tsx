import { useState } from 'react';
import type { PathData, PathNode } from '../../data/quizPathData';
import type { PathProgress } from '../../hooks/usePathProgress';
import { getNodeStatus } from '../../hooks/usePathProgress';

interface Props {
  pathData:       PathData;
  progress:       PathProgress;
  onNodeClick:    (nodeId: string) => void;
  onNodeHover:    (nodeId: string | null) => void;
}

const DIFF_COLOR: Record<string, string> = {
  'Fácil':   '#4ADE80',
  'Médio':   '#FFD166',
  'Difícil': '#FF4757',
  'none':    'rgba(255,255,255,0.15)',
};

// ── Node renderers by type ───────────────────────────────────────────────────

function InícioNode({ x, y, status }: { x: number; y: number; status: string }) {
  const c = status === 'completed' ? '#4ADE80' : '#22D3EE';
  return (
    <g>
      <circle cx={x} cy={y} r={24} fill="#0c2c4a" stroke={c} strokeWidth={2.5} />
      {/* Play triangle */}
      <polygon points={`${x-7},${y-9} ${x+12},${y} ${x-7},${y+9}`} fill={c} />
    </g>
  );
}

function NormalNode({ x, y, label, status, hovered }: { x: number; y: number; label: string; status: string; hovered: boolean }) {
  const completed  = status === 'completed';
  const available  = status === 'available';
  const fill   = completed ? '#0A2215' : available ? '#0D1B4B' : '#0D0B1E';
  const stroke = completed ? '#4ADE80' : available ? '#22D3EE' : '#2A2640';
  const text   = completed ? '#4ADE80' : available ? '#F1EEF8' : '#3D3A5C';
  const r = hovered && available ? 26 : 24;

  return (
    <g>
      {available && (
        <circle cx={x} cy={y} r={r + 10} fill="none" stroke={stroke} strokeWidth={1} opacity={0}>
          <animate attributeName="r" values={`${r + 8};${r + 16};${r + 8}`} dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.35;0;0.35" dur="2s" repeatCount="indefinite" />
        </circle>
      )}
      <circle cx={x} cy={y} r={r} fill={fill} stroke={stroke} strokeWidth={available ? 2.5 : 2}
        style={{ transition: 'r 0.15s, stroke-width 0.15s' }} />
      {completed && (
        <text x={x} y={y + 5} textAnchor="middle" style={{ fontFamily: 'Sora', fontSize: 14, fontWeight: 700 }} fill="#4ADE80">✓</text>
      )}
      {!completed && (
        <text x={x} y={y + 5} textAnchor="middle" style={{ fontFamily: 'Sora', fontSize: 10, fontWeight: 600 }} fill={text}>
          {label.replace('NÓ ', '')}
        </text>
      )}
    </g>
  );
}

function DecisórioNode({ x, y, status, hovered }: { x: number; y: number; status: string; hovered: boolean }) {
  const available = status === 'available';
  const completed = status === 'completed';
  const s = hovered && available ? 30 : 26;
  const fill   = completed ? '#1A0C07' : available ? '#1A1400' : '#0D0B1E';
  const stroke = completed ? '#4ADE80' : available ? '#FFD166' : '#2A2640';

  // Diamond points
  const pts = `${x},${y-s} ${x+s},${y} ${x},${y+s} ${x-s},${y}`;

  return (
    <g>
      {available && (
        <polygon points={`${x},${y-(s+12)} ${x+(s+12)},${y} ${x},${y+(s+12)} ${x-(s+12)},${y}`}
          fill="none" stroke={stroke} strokeWidth={1} opacity={0}>
          <animate attributeName="opacity" values="0.4;0;0.4" dur="1.8s" repeatCount="indefinite" />
        </polygon>
      )}
      <polygon points={pts} fill={fill} stroke={stroke} strokeWidth={available ? 2.5 : 2}
        style={{ transition: 'stroke-width 0.15s' }} />
      {/* Split arrow icon */}
      <text x={x} y={y + 5} textAnchor="middle" style={{ fontFamily: 'Sora', fontSize: 12 }} fill={stroke}>⑂</text>
    </g>
  );
}

function BossNode({ x, y, status, hovered, nodeId }: { x: number; y: number; status: string; hovered: boolean; nodeId: string }) {
  const available = status === 'available';
  const easy      = nodeId === 'boss_easy';
  const r = hovered && available ? 29 : 26;
  const accent = easy ? '#22D3EE' : '#F59E0B';
  const stroke = status === 'completed' ? '#4ADE80' : available ? accent : (easy ? '#082a33' : '#3D2800');
  const fill   = status === 'completed' ? '#0A1A08' : easy ? '#041318' : '#1A0E00';
  const icon   = easy ? '♟' : '♛';

  return (
    <g>
      {available && (
        <circle cx={x} cy={y} r={r + 12} fill="none" stroke={accent} strokeWidth={1.5} opacity={0}>
          <animate attributeName="opacity" values="0.5;0;0.5" dur="1.5s" repeatCount="indefinite" />
          <animate attributeName="r" values={`${r+10};${r+18};${r+10}`} dur="1.5s" repeatCount="indefinite" />
        </circle>
      )}
      <circle cx={x} cy={y} r={r} fill={fill} stroke={stroke} strokeWidth={2.5} />
      <text x={x} y={y + 6} textAnchor="middle" style={{ fontSize: 18 }} fill={stroke}>{icon}</text>
    </g>
  );
}

function FinalNode({ x, y, status }: { x: number; y: number; status: string }) {
  const completed = status === 'completed';
  const available = status === 'available';
  const c = completed ? '#4ADE80' : available ? '#FFD166' : '#2A2640';

  // Star polygon (5 points)
  const starPts = (cx: number, cy: number, or: number, ir: number) =>
    Array.from({ length: 10 }, (_, i) => {
      const a = (Math.PI / 5) * i - Math.PI / 2;
      const r = i % 2 === 0 ? or : ir;
      return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
    }).join(' ');

  return (
    <g>
      <polygon points={starPts(x, y, 24, 11)}
        fill={completed ? '#0A2215' : available ? '#1A1400' : '#0D0B1E'}
        stroke={c} strokeWidth={2} />
      <text x={x} y={y + 5} textAnchor="middle" style={{ fontSize: 11 }} fill={c}>★</text>
    </g>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export default function PathMapGraph({ pathData, progress, onNodeClick, onNodeHover }: Props) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const { nodes, edges, mode } = pathData;

  const status = (id: string) => getNodeStatus(id, mode, progress);

  const handleHover = (id: string | null) => { setHoveredId(id); onNodeHover(id); };

  const isClickable = (node: PathNode) => {
    const s = status(node.id);
    return s === 'available' && node.type !== 'inicio';
  };

  return (
    <svg viewBox="20 85 900 340" className="w-full h-full" style={{ overflow: 'visible' }}>
      <defs>
        <filter id="glow-gold">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="glow-green">
          <feGaussianBlur stdDeviation="2" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Edges */}
      {edges.map(edge => {
        const f = nodes.find(n => n.id === edge.from)!;
        const t = nodes.find(n => n.id === edge.to)!;
        const fs = status(edge.from);
        const ts = status(edge.to);
        const active = fs === 'completed';
        const color  = active ? DIFF_COLOR[edge.difficulty] : DIFF_COLOR['none'];

        return (
          <g key={`${edge.from}-${edge.to}`}>
            <line x1={f.x} y1={f.y} x2={t.x} y2={t.y}
              stroke={color} strokeWidth={active ? 2.5 : 1.5}
              strokeDasharray={active ? 'none' : '5 4'}
              opacity={active ? 0.85 : 0.3}
            />
            {/* Moving particle on active edges */}
            {active && (
              <circle r="4" fill={color} opacity="0.9">
                <animateMotion dur="1.6s" repeatCount="indefinite"
                  path={`M${f.x},${f.y} L${t.x},${t.y}`} />
              </circle>
            )}
            {/* Difficulty label (skip 'none') */}
            {edge.difficulty !== 'none' && (
              <g>
                <rect
                  x={(f.x + t.x) / 2 - 24} y={(f.y + t.y) / 2 - 10}
                  width={48} height={18} rx={9}
                  fill="#080B18" stroke={color} strokeWidth={1} opacity={0.9}
                />
                <text
                  x={(f.x + t.x) / 2} y={(f.y + t.y) / 2 + 5}
                  textAnchor="middle"
                  style={{ fontFamily: 'Sora, sans-serif', fontSize: 8, fontWeight: 600 }}
                  fill={color}
                >
                  {edge.difficulty.toUpperCase()}
                </text>
              </g>
            )}
          </g>
        );
      })}

      {/* Nodes */}
      {nodes.map(node => {
        const s   = status(node.id);
        const hov = hoveredId === node.id;
        const clickable = isClickable(node);
        const filterAttr = s === 'available' ? 'url(#glow-gold)' : s === 'completed' ? 'url(#glow-green)' : 'none';

        return (
          <g
            key={node.id}
            style={{ cursor: clickable ? 'pointer' : 'default' }}
            onClick={() => clickable && onNodeClick(node.id)}
            onMouseEnter={() => handleHover(node.id)}
            onMouseLeave={() => handleHover(null)}
            filter={filterAttr}
          >
            {node.type === 'inicio'    && <InícioNode    x={node.x} y={node.y} status={s} />}
            {node.type === 'normal'    && <NormalNode     x={node.x} y={node.y} label={node.label} status={s} hovered={hov} />}
            {node.type === 'decisorio' && <DecisórioNode  x={node.x} y={node.y} status={s} hovered={hov} />}
            {node.type === 'boss'      && <BossNode       x={node.x} y={node.y} status={s} hovered={hov} nodeId={node.id} />}

            {/* Hover tooltip */}
            {hov && node.type !== 'inicio' && (
              <g>
                <rect
                  x={node.x - 100} y={node.y + 34}
                  width={200} height={node.questionCount > 0 ? 56 : 42}
                  rx={10} fill="#0A0C1E"
                  stroke="rgba(255,255,255,0.1)" strokeWidth={1}
                />
                <text
                  x={node.x} y={node.y + 52}
                  textAnchor="middle"
                  style={{ fontFamily: 'Sora, sans-serif', fontSize: 11, fontWeight: 600 }}
                  fill="#C4BFD8"
                >
                  {node.tema.length > 28 ? node.tema.slice(0, 26) + '…' : node.tema}
                </text>
                {node.questionCount > 0 && (
                  <text
                    x={node.x} y={node.y + 70}
                    textAnchor="middle"
                    style={{ fontFamily: 'Sora, sans-serif', fontSize: 10 }}
                    fill="#7B7899"
                  >
                    {node.questionCount} questões
                  </text>
                )}
              </g>
            )}
          </g>
        );
      })}

    </svg>
  );
}
