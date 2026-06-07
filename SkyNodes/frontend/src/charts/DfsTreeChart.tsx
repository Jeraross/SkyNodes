import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { airports } from '@/data/airports';
import { routes } from '@/data/routes';
import { buildGraph } from '@/lib/graph/buildGraph';
import { dfsTree } from '@/lib/graph/dfsTree';

const graph = buildGraph(airports, routes);

const NODE_R = 16;
const COL_W = 80;
const ROW_H = 42;
const PAD_X = 40;
const PAD_Y = 30;

function discoveryColor(idx: number, total: number): string {
  const t = total > 1 ? idx / (total - 1) : 0;
  const r = Math.round(251 - t * 30);
  const g = Math.round(146 + t * 30);
  const b = Math.round(60 - t * 20);
  return `rgb(${r},${g},${b})`;
}

export default function DfsTreeChart() {
  const [startId, setStartId] = useState('REC');
  const [hovered, setHovered] = useState<string | null>(null);

  const dfsResult = useMemo(() => dfsTree(graph, startId), [startId]);

  const { levels, treeEdges, order, depthMap } = dfsResult;
  const maxLevel = Math.max(...Object.keys(levels).map(Number));
  const maxNodesInLevel = Math.max(...Object.values(levels).map(a => a.length));
  const total = order.length;

  const svgWidth = (maxLevel + 1) * COL_W + PAD_X * 2;
  const svgHeight = maxNodesInLevel * ROW_H + PAD_Y * 2;

  const pos = new Map<string, { x: number; y: number }>();
  for (const [levelStr, nodes] of Object.entries(levels)) {
    const level = Number(levelStr);
    nodes.forEach((id, i) => {
      const x = PAD_X + level * COL_W;
      const y = PAD_Y + i * ROW_H + ((maxNodesInLevel - nodes.length) * ROW_H) / 2;
      pos.set(id, { x, y });
    });
  }

  const startAirport = airports.find(a => a.id === startId);

  return (
    <Card className="border-orange-400/20 bg-slate-950/70 text-white backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-orange-200 text-sm">Árvore DFS</CardTitle>
        <CardDescription className="text-slate-400 text-xs">
          Exploração em profundidade a partir de {startAirport?.city ?? startId} · cor = ordem de descoberta
        </CardDescription>
        <div className="pt-1 w-48">
          <Select value={startId} onValueChange={value => { if (value) setStartId(value); }}>
            <SelectTrigger className="border-slate-700 bg-slate-900 text-slate-200 text-xs h-7">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-slate-700 bg-slate-900">
              {airports.map(a => (
                <SelectItem key={a.id} value={a.id} className="text-slate-200 focus:bg-slate-800 text-xs">
                  {a.id} — {a.city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <svg width={svgWidth} height={svgHeight} style={{ display: 'block' }}>
          {treeEdges.map(([a, b], i) => {
            const pa = pos.get(a);
            const pb = pos.get(b);
            if (!pa || !pb) return null;
            return (
              <line
                key={`e-${i}`}
                x1={pa.x} y1={pa.y}
                x2={pb.x} y2={pb.y}
                stroke="#f97316"
                strokeOpacity={0.7}
                strokeWidth={1.5}
              />
            );
          })}

          {order.map((id, discoveryIdx) => {
            const p = pos.get(id);
            if (!p) return null;
            const isHovered = hovered === id;
            const color = discoveryColor(discoveryIdx, total);
            return (
              <g
                key={id}
                onMouseEnter={() => setHovered(id)}
                onMouseLeave={() => setHovered(null)}
                style={{ cursor: 'pointer' }}
              >
                <circle
                  cx={p.x} cy={p.y}
                  r={isHovered ? NODE_R + 2 : NODE_R}
                  fill={color}
                  stroke={isHovered ? '#fff' : 'rgba(255,255,255,0.2)'}
                  strokeWidth={isHovered ? 1.5 : 1}
                />
                <text
                  x={p.x} y={p.y}
                  textAnchor="middle" dominantBaseline="middle"
                  fontSize={9} fill="#0f172a" fontWeight="bold"
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                  {id}
                </text>
                <text
                  x={p.x + NODE_R - 2} y={p.y - NODE_R + 2}
                  textAnchor="middle" dominantBaseline="middle"
                  fontSize={7} fill="rgba(255,255,255,0.7)"
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                  {discoveryIdx + 1}
                </text>
                {isHovered && (
                  <g>
                    <rect
                      x={p.x + NODE_R + 4} y={p.y - 22}
                      width={100} height={44}
                      rx={4}
                      fill="rgba(2,6,23,0.95)"
                      stroke="rgba(249,115,22,0.3)"
                      strokeWidth={1}
                    />
                    <text x={p.x + NODE_R + 8} y={p.y - 10} fontSize={10} fill="#fb923c" fontWeight="bold">{id}</text>
                    <text x={p.x + NODE_R + 8} y={p.y + 4} fontSize={9} fill="#94a3b8">Profund. {depthMap[id]}</text>
                    <text x={p.x + NODE_R + 8} y={p.y + 16} fontSize={9} fill="#94a3b8">Ordem #{discoveryIdx + 1}</text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </CardContent>
    </Card>
  );
}
