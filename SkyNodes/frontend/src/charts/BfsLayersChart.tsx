import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { airports } from '@/data/airports';
import { routes } from '@/data/routes';
import { buildGraph } from '@/lib/graph/buildGraph';
import { bfsLayers } from '@/lib/graph/bfsLayers';

const graph = buildGraph(airports, routes);

const NODE_R = 16;
const COL_W = 80;
const ROW_H = 42;
const PAD_X = 40;
const PAD_Y = 30;

function levelColor(level: number, maxLevel: number): string {
  const t = maxLevel > 0 ? level / maxLevel : 0;
  const r = Math.round(219 - t * 160);
  const g = Math.round(234 - t * 140);
  const b = Math.round(254 - t * 60);
  return `rgb(${r},${g},${b})`;
}

export default function BfsLayersChart() {
  const [startId, setStartId] = useState('REC');
  const [hovered, setHovered] = useState<string | null>(null);

  const bfsResult = useMemo(() => bfsLayers(graph, startId), [startId]);

  const { levels, treeEdges } = bfsResult;
  const maxLevel = Math.max(...Object.keys(levels).map(Number));
  const maxNodesInLevel = Math.max(...Object.values(levels).map(arr => arr.length));

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
    <Card className="border-cyan-400/20 bg-slate-950/70 text-white backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-cyan-100 text-sm">Camadas BFS</CardTitle>
        <CardDescription className="text-slate-400 text-xs">
          Exploração em largura a partir de {startAirport?.city ?? startId}
        </CardDescription>
        <div className="pt-1 w-48">
          <Select value={startId} onValueChange={setStartId}>
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
                key={`tree-${i}`}
                x1={pa.x} y1={pa.y}
                x2={pb.x} y2={pb.y}
                stroke="#3b82f6"
                strokeOpacity={0.9}
                strokeWidth={1.5}
              />
            );
          })}

          {Object.entries(levels).flatMap(([levelStr, nodes]) =>
            nodes.map(id => {
              const level = Number(levelStr);
              const p = pos.get(id);
              if (!p) return null;
              const isHovered = hovered === id;
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
                    fill={levelColor(level, maxLevel)}
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
                  {isHovered && (
                    <g>
                      <rect
                        x={p.x + NODE_R + 4} y={p.y - 18}
                        width={80} height={36}
                        rx={4}
                        fill="rgba(2,6,23,0.95)"
                        stroke="rgba(34,211,238,0.3)"
                        strokeWidth={1}
                      />
                      <text x={p.x + NODE_R + 8} y={p.y - 5} fontSize={10} fill="#67e8f9" fontWeight="bold">{id}</text>
                      <text x={p.x + NODE_R + 8} y={p.y + 10} fontSize={9} fill="#94a3b8">Nível {levelStr}</text>
                    </g>
                  )}
                </g>
              );
            })
          )}
        </svg>
      </CardContent>
    </Card>
  );
}
