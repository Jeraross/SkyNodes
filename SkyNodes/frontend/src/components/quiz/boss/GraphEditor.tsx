import { useState, useRef, useCallback, useId } from 'react';
import type { CanvasNode, CanvasEdge } from '../../../data/bossQuestions';

const PIXEL = { fontFamily: "'Press Start 2P', monospace" };
const GRID  = 40;
const NODE_LABELS = ['A', 'B', 'C', 'D', 'E'];

interface Props {
  nodes:    CanvasNode[];
  edges:    CanvasEdge[];
  onChange: (nodes: CanvasNode[], edges: CanvasEdge[]) => void;
}

function snapToGrid(v: number) {
  return Math.round(v / GRID) * GRID;
}

export default function GraphEditor({ nodes, edges, onChange }: Props) {
  const svgRef        = useRef<SVGSVGElement>(null);
  const [edgeStart, setEdgeStart] = useState<string | null>(null);
  const [dragging, setDragging]   = useState<{ id: string; ox: number; oy: number } | null>(null);
  const [tool, setTool]           = useState<'move' | 'edge'>('move');
  const counter = useRef(nodes.length);

  const svgPoint = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current!;
    const rect = svg.getBoundingClientRect();
    return {
      x: snapToGrid(clientX - rect.left),
      y: snapToGrid(clientY - rect.top),
    };
  }, []);

  const addNode = (e: React.MouseEvent<SVGSVGElement>) => {
    if (tool !== 'move') return;
    if ((e.target as SVGElement).closest('circle,text')) return;
    if (nodes.length >= 6) return;
    const { x, y } = svgPoint(e.clientX, e.clientY);
    const id = `node_${counter.current++}`;
    const label = NODE_LABELS[nodes.length] ?? String(nodes.length + 1);
    onChange([...nodes, { id, x, y, label }], edges);
  };

  const startDrag = (e: React.PointerEvent, nodeId: string) => {
    if (tool === 'edge') {
      if (edgeStart === null) {
        setEdgeStart(nodeId);
      } else if (edgeStart !== nodeId) {
        const exists = edges.some(
          ed => (ed.from === edgeStart && ed.to === nodeId) || (ed.from === nodeId && ed.to === edgeStart),
        );
        if (!exists) {
          onChange(nodes, [...edges, { from: edgeStart, to: nodeId }]);
        } else {
          onChange(nodes, edges.filter(ed => !(
            (ed.from === edgeStart && ed.to === nodeId) || (ed.from === nodeId && ed.to === edgeStart)
          )));
        }
        setEdgeStart(null);
      }
      return;
    }
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging({ id: nodeId, ox: e.clientX, oy: e.clientY });
  };

  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!dragging) return;
    const { x, y } = svgPoint(e.clientX, e.clientY);
    onChange(
      nodes.map(n => n.id === dragging.id ? { ...n, x, y } : n),
      edges,
    );
  };

  const stopDrag = () => setDragging(null);

  const removeNode = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    onChange(
      nodes.filter(n => n.id !== nodeId),
      edges.filter(ed => ed.from !== nodeId && ed.to !== nodeId),
    );
  };

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Toolbar */}
      <div className="flex gap-2 flex-shrink-0">
        {(['move', 'edge'] as const).map(t => (
          <button
            key={t}
            onClick={() => { setTool(t); setEdgeStart(null); }}
            className="px-3 py-1 rounded border transition-all cursor-pointer"
            style={{
              borderColor: tool === t ? '#22d3ee' : 'rgba(6,182,212,0.2)',
              background:  tool === t ? 'rgba(6,182,212,0.12)' : 'transparent',
            }}
          >
            <p style={{ ...PIXEL, fontSize: 7 }} className={tool === t ? 'text-cyan-300' : 'text-slate-500'}>
              {t === 'move' ? 'MOVER/ADD' : 'ARESTA'}
            </p>
          </button>
        ))}
        <p style={{ ...PIXEL, fontSize: 6 }} className="text-slate-600 self-center ml-2">
          {tool === 'move' ? 'Clique para add no. Arraste para mover. Dbl para remover.' : edgeStart ? 'Clique no 2o no para conectar' : 'Clique no 1o no'}
        </p>
      </div>

      {/* SVG canvas */}
      <svg
        ref={svgRef}
        className="flex-1 w-full rounded-xl cursor-crosshair"
        style={{ background: '#060d1f', border: '1px solid rgba(6,182,212,0.15)', minHeight: 260 }}
        onClick={addNode}
        onPointerMove={onPointerMove}
        onPointerUp={stopDrag}
      >
        {/* Grid dots */}
        <defs>
          <pattern id="grid" width={GRID} height={GRID} patternUnits="userSpaceOnUse">
            <circle cx={GRID / 2} cy={GRID / 2} r={1} fill="rgba(6,182,212,0.1)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Edges */}
        {edges.map(edge => {
          const f = nodes.find(n => n.id === edge.from);
          const t = nodes.find(n => n.id === edge.to);
          if (!f || !t) return null;
          return (
            <line
              key={`${edge.from}-${edge.to}`}
              x1={f.x} y1={f.y} x2={t.x} y2={t.y}
              stroke="#22d3ee" strokeWidth={2} opacity={0.6}
            />
          );
        })}

        {/* Nodes */}
        {nodes.map(node => (
          <g key={node.id}>
            <circle
              cx={node.x} cy={node.y} r={20}
              fill={edgeStart === node.id ? '#0e4d6e' : '#0c2c4a'}
              stroke={edgeStart === node.id ? '#f59e0b' : '#22d3ee'}
              strokeWidth={edgeStart === node.id ? 3 : 2}
              style={{ cursor: tool === 'edge' ? 'pointer' : 'grab' }}
              onPointerDown={e => startDrag(e, node.id)}
              onDoubleClick={e => removeNode(e, node.id)}
            />
            <text
              x={node.x} y={node.y + 5}
              textAnchor="middle"
              style={{ ...PIXEL, fontSize: 11, pointerEvents: 'none' }}
              fill="#22d3ee"
            >
              {node.label}
            </text>
          </g>
        ))}

        {nodes.length === 0 && (
          <text x="50%" y="50%" textAnchor="middle" fill="rgba(6,182,212,0.25)"
            style={{ fontFamily: 'ui-monospace, monospace', fontSize: 13 }}>
            Clique para adicionar nos
          </text>
        )}
      </svg>
    </div>
  );
}
