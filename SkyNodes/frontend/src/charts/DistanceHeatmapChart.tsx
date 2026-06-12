import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { airports } from '@/data/airports';
import { airportMap } from '@/data/airports';
import { REGION_COLOR } from '@/data/colors';
import type { Region } from '@/data/airports';

interface Props {
  distanceMatrix: Record<string, Record<string, number | null>>;
}

const REGIONS: Region[] = ['Norte', 'Nordeste', 'Centro-Oeste', 'Sudeste', 'Sul'];

// Airports sorted by region for visual clustering
const SORTED_AIRPORTS = REGIONS.flatMap(r => airports.filter(a => a.region === r));

const CELL = 34;
const ROW_LABEL_W = 44;
const COL_LABEL_H = 60;
const REGION_BAR = 4;

function ylOrRd(t: number): string {
  if (t < 0.5) {
    const u = t * 2;
    return `rgb(${Math.round(254 + u * -1)},${Math.round(227 + u * -86)},${Math.round(145 + u * -85)})`;
  }
  const u = (t - 0.5) * 2;
  return `rgb(${Math.round(253 + u * -125)},${Math.round(141 + u * -141)},${Math.round(60 + u * -22)})`;
}

// Returns black or white for contrast against a YlOrRd cell
function textColor(t: number): string {
  return t < 0.55 ? '#1a1a1a' : '#f8fafc';
}

interface HoveredCell {
  from: string;
  to: string;
  cost: number | null;
}

export default function DistanceHeatmapChart({ distanceMatrix }: Props) {
  const [activeRegions, setActiveRegions] = useState<Set<Region>>(new Set(REGIONS));
  const [hovered, setHovered] = useState<HoveredCell | null>(null);

  const toggleRegion = (r: Region) =>
    setActiveRegions(prev => {
      const next = new Set(prev);
      next.has(r) ? next.delete(r) : next.add(r);
      return next.size === 0 ? new Set(REGIONS) : next;
    });

  const ids = SORTED_AIRPORTS.filter(a => activeRegions.has(a.region)).map(a => a.id);
  const n = ids.length;

  const allDists: number[] = [];
  for (const from of ids) {
    for (const to of ids) {
      if (from !== to) {
        const d = distanceMatrix[from]?.[to];
        if (d !== null && d !== undefined) allDists.push(d);
      }
    }
  }
  const minDist = allDists.length ? Math.min(...allDists) : 0;
  const maxDist = allDists.length ? Math.max(...allDists) : 1;
  const range = maxDist - minDist || 1;

  const tOf = (cost: number) => (cost - minDist) / range;

  // Region boundaries for separator lines
  const regionBoundaries: number[] = [];
  let count = 0;
  for (const region of REGIONS) {
    if (!activeRegions.has(region)) continue;
    const regionCount = SORTED_AIRPORTS.filter(a => a.region === region && activeRegions.has(a.region)).length;
    count += regionCount;
    if (count < n) regionBoundaries.push(count);
  }

  const matrixW = n * CELL;
  const matrixH = n * CELL;
  const svgW = ROW_LABEL_W + REGION_BAR + matrixW;
  const svgH = COL_LABEL_H + REGION_BAR + matrixH;

  return (
    <Card className="border-cyan-400/20 bg-slate-950/70 text-white backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-cyan-100 text-sm">Distâncias Mínimas — Dijkstra</CardTitle>
        <CardDescription className="text-slate-400 text-xs">
          Custo mínimo entre cada par · aeroportos agrupados por região · amarelo = próximo · vermelho = distante
        </CardDescription>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {REGIONS.map(r => (
            <button
              key={r}
              onClick={() => toggleRegion(r)}
              className="rounded px-2 py-0.5 text-[10px] font-medium transition-all"
              style={{
                background: REGION_COLOR[r] + '22',
                border: `1px solid ${REGION_COLOR[r]}55`,
                color: activeRegions.has(r) ? REGION_COLOR[r] : '#475569',
                opacity: activeRegions.has(r) ? 1 : 0.4,
              }}
            >
              {r}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="overflow-auto p-4">
        {/* Info bar on hover */}
        <div className="mb-3 h-8 flex items-center">
          {hovered && hovered.from !== hovered.to ? (
            <div className="flex items-center gap-3 rounded border border-cyan-500/30 bg-slate-900/80 px-3 py-1.5 text-xs">
              <span className="font-bold text-cyan-300">
                {hovered.from}
                <span className="mx-1 text-slate-500">→</span>
                {hovered.to}
              </span>
              <span className="text-slate-400">
                {airportMap.get(hovered.from)?.city} → {airportMap.get(hovered.to)?.city}
              </span>
              <span className="font-mono text-yellow-400 font-semibold">
                {hovered.cost !== null ? `custo ${hovered.cost.toFixed(1)}` : 'inalcançável'}
              </span>
            </div>
          ) : (
            <p className="text-[10px] text-slate-600">Passe o mouse sobre uma célula para ver o par</p>
          )}
        </div>

        <div className="overflow-auto">
          <svg
            width={svgW}
            height={svgH}
            style={{ display: 'block', minWidth: svgW }}
          >
            {/* Column region color bar */}
            {ids.map((id, j) => {
              const airport = airportMap.get(id);
              if (!airport) return null;
              const color = REGION_COLOR[airport.region];
              return (
                <rect
                  key={`cbar-${id}`}
                  x={ROW_LABEL_W + REGION_BAR + j * CELL}
                  y={COL_LABEL_H}
                  width={CELL}
                  height={REGION_BAR}
                  fill={color}
                  opacity={0.8}
                />
              );
            })}

            {/* Row region color bar */}
            {ids.map((id, i) => {
              const airport = airportMap.get(id);
              if (!airport) return null;
              const color = REGION_COLOR[airport.region];
              return (
                <rect
                  key={`rbar-${id}`}
                  x={ROW_LABEL_W}
                  y={COL_LABEL_H + REGION_BAR + i * CELL}
                  width={REGION_BAR}
                  height={CELL}
                  fill={color}
                  opacity={0.8}
                />
              );
            })}

            {/* Column labels (rotated) */}
            {ids.map((id, j) => (
              <text
                key={`col-${id}`}
                x={ROW_LABEL_W + REGION_BAR + j * CELL + CELL / 2}
                y={COL_LABEL_H - 6}
                textAnchor="start"
                fontSize={9}
                fill="#94a3b8"
                fontFamily="monospace"
                transform={`rotate(-50, ${ROW_LABEL_W + REGION_BAR + j * CELL + CELL / 2}, ${COL_LABEL_H - 6})`}
              >
                {id}
              </text>
            ))}

            {/* Row labels */}
            {ids.map((id, i) => (
              <text
                key={`row-${id}`}
                x={ROW_LABEL_W - 6}
                y={COL_LABEL_H + REGION_BAR + i * CELL + CELL / 2 + 1}
                textAnchor="end"
                dominantBaseline="middle"
                fontSize={9}
                fill="#94a3b8"
                fontFamily="monospace"
              >
                {id}
              </text>
            ))}

            {/* Cells */}
            {ids.map((from, i) =>
              ids.map((to, j) => {
                const cost = distanceMatrix[from]?.[to] ?? null;
                const isDiag = from === to;
                const t = (!isDiag && cost !== null) ? tOf(cost) : -1;
                const bg = isDiag ? '#0f172a' : cost === null ? '#1e293b' : ylOrRd(t);
                const isHov = hovered?.from === from && hovered?.to === to;
                const cx = ROW_LABEL_W + REGION_BAR + j * CELL;
                const cy = COL_LABEL_H + REGION_BAR + i * CELL;

                return (
                  <g key={`${from}-${to}`}>
                    <rect
                      x={cx}
                      y={cy}
                      width={CELL}
                      height={CELL}
                      fill={bg}
                      stroke={isHov ? 'rgba(34,211,238,0.9)' : 'rgba(2,6,23,0.6)'}
                      strokeWidth={isHov ? 1.5 : 0.5}
                      onMouseEnter={() => !isDiag && setHovered({ from, to, cost })}
                      onMouseLeave={() => setHovered(null)}
                      style={{ cursor: isDiag ? 'default' : 'pointer' }}
                    />
                    {!isDiag && cost !== null && (
                      <text
                        x={cx + CELL / 2}
                        y={cy + CELL / 2 + 1}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize={8}
                        fontFamily="monospace"
                        fontWeight="600"
                        fill={textColor(t)}
                        style={{ pointerEvents: 'none', userSelect: 'none' }}
                      >
                        {cost.toFixed(1)}
                      </text>
                    )}
                    {isDiag && (
                      <line
                        x1={cx + 6} y1={cy + 6}
                        x2={cx + CELL - 6} y2={cy + CELL - 6}
                        stroke="#334155"
                        strokeWidth={1}
                        style={{ pointerEvents: 'none' }}
                      />
                    )}
                  </g>
                );
              })
            )}

            {/* Region separator lines */}
            {regionBoundaries.map(b => (
              <g key={`sep-${b}`}>
                <line
                  x1={ROW_LABEL_W + REGION_BAR}
                  y1={COL_LABEL_H + REGION_BAR + b * CELL}
                  x2={ROW_LABEL_W + REGION_BAR + matrixW}
                  y2={COL_LABEL_H + REGION_BAR + b * CELL}
                  stroke="rgba(148,163,184,0.35)"
                  strokeWidth={1}
                  strokeDasharray="3 2"
                />
                <line
                  x1={ROW_LABEL_W + REGION_BAR + b * CELL}
                  y1={COL_LABEL_H + REGION_BAR}
                  x2={ROW_LABEL_W + REGION_BAR + b * CELL}
                  y2={COL_LABEL_H + REGION_BAR + matrixH}
                  stroke="rgba(148,163,184,0.35)"
                  strokeWidth={1}
                  strokeDasharray="3 2"
                />
              </g>
            ))}
          </svg>
        </div>

        {/* Color scale legend */}
        <div className="mt-4 flex items-center gap-3">
          <span className="text-[10px] text-slate-500 shrink-0">
            {minDist.toFixed(1)}
          </span>
          <div
            className="h-3 flex-1 rounded-sm"
            style={{
              background: 'linear-gradient(to right, rgb(254,227,145), rgb(253,141,60), rgb(128,0,38))',
            }}
          />
          <span className="text-[10px] text-slate-500 shrink-0">
            {maxDist.toFixed(1)}
          </span>
          <span className="text-[10px] text-slate-600 ml-1">custo mínimo</span>
        </div>

        {/* Region legend */}
        <div className="mt-2 flex flex-wrap gap-3">
          {REGIONS.filter(r => activeRegions.has(r)).map(r => (
            <span key={r} className="flex items-center gap-1.5 text-[10px] text-slate-400">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ background: REGION_COLOR[r] }} />
              {r}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
