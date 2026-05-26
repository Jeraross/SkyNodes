import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { airports } from '@/data/airports';

interface Props {
  distanceMatrix: Record<string, Record<string, number | null>>;
}

function ylOrRd(t: number): string {
  // YlOrRd: yellow (254,227,145) → orange (253,141,60) → dark red (128,0,38)
  if (t < 0.5) {
    const u = t * 2;
    const r = Math.round(254 + u * (253 - 254));
    const g = Math.round(227 + u * (141 - 227));
    const b = Math.round(145 + u * (60 - 145));
    return `rgb(${r},${g},${b})`;
  }
  const u = (t - 0.5) * 2;
  const r = Math.round(253 + u * (128 - 253));
  const g = Math.round(141 + u * (0 - 141));
  const b = Math.round(60 + u * (38 - 60));
  return `rgb(${r},${g},${b})`;
}

export default function DistanceHeatmapChart({ distanceMatrix }: Props) {
  const [tooltip, setTooltip] = useState<{ from: string; to: string; cost: number | null } | null>(null);

  const ids = airports.map(a => a.id);

  const allDists: number[] = [];
  for (const from of ids) {
    for (const to of ids) {
      if (from !== to) {
        const d = distanceMatrix[from]?.[to];
        if (d !== null && d !== undefined) allDists.push(d);
      }
    }
  }
  const minDist = Math.min(...allDists);
  const maxDist = Math.max(...allDists);
  const range = maxDist - minDist || 1;

  const CELL = 22;

  return (
    <Card className="border-cyan-400/20 bg-slate-950/70 text-white backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-cyan-100 text-sm">Distâncias Mínimas (Dijkstra)</CardTitle>
        <CardDescription className="text-slate-400 text-xs">
          Custo mínimo entre cada par — escala YlOrRd (amarelo = próximo, vermelho = distante)
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <div style={{ position: 'relative', paddingTop: 52, paddingLeft: 28 }}>
          {/* Column headers — rotated */}
          <div style={{ display: 'flex', position: 'absolute', top: 0, left: 28 }}>
            {ids.map(id => (
              <div
                key={id}
                style={{
                  width: CELL,
                  transform: 'rotate(-45deg)',
                  transformOrigin: 'bottom left',
                  fontSize: 8,
                  color: '#64748b',
                  whiteSpace: 'nowrap',
                  height: 52,
                  display: 'flex',
                  alignItems: 'flex-end',
                  paddingBottom: 2,
                }}
              >
                {id}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {ids.map(from => (
              <div key={from} style={{ display: 'flex', alignItems: 'center' }}>
                {/* Row label */}
                <div style={{ width: 28, fontSize: 8, color: '#64748b', textAlign: 'right', paddingRight: 4, flexShrink: 0 }}>
                  {from}
                </div>
                {ids.map(to => {
                  const cost = distanceMatrix[from]?.[to] ?? null;
                  const isDiag = from === to;
                  let bg = '#1e293b';
                  if (!isDiag && cost !== null) {
                    bg = ylOrRd((cost - minDist) / range);
                  }
                  const isHovered = tooltip?.from === from && tooltip?.to === to;
                  return (
                    <div
                      key={to}
                      style={{
                        width: CELL,
                        height: CELL,
                        background: bg,
                        border: isHovered ? '1px solid rgba(34,211,238,0.8)' : '1px solid rgba(2,6,23,0.5)',
                        cursor: isDiag ? 'default' : 'pointer',
                        flexShrink: 0,
                        boxSizing: 'border-box',
                      }}
                      onMouseEnter={() => !isDiag && setTooltip({ from, to, cost })}
                      onMouseLeave={() => setTooltip(null)}
                    />
                  );
                })}
              </div>
            ))}
          </div>

          {tooltip && tooltip.from !== tooltip.to && (
            <div
              style={{
                position: 'sticky',
                bottom: 0,
                left: 0,
                background: 'rgba(2,6,23,0.95)',
                border: '1px solid rgba(34,211,238,0.3)',
                borderRadius: 4,
                padding: '4px 8px',
                fontSize: 11,
                color: '#e2e8f0',
                marginTop: 8,
                display: 'inline-block',
              }}
            >
              {tooltip.from} → {tooltip.to}:{' '}
              {tooltip.cost !== null ? tooltip.cost.toFixed(1) : 'inalcançável'}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
