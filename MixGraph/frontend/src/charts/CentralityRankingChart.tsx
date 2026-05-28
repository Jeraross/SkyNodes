import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { REGION_COLOR } from '@/data/colors';
import { airports } from '@/data/airports';
import type { Region } from '@/data/airports';

interface Props { degreeByAirport: Record<string, number>; }

const HUB_IDS = ['GRU', 'BSB', 'GIG'];
const REGIONS: Region[] = ['Norte', 'Nordeste', 'Centro-Oeste', 'Sudeste', 'Sul'];
const TOP_OPTIONS = [5, 10, 20] as const;

export default function CentralityRankingChart({ degreeByAirport }: Props) {
  const [activeRegions, setActiveRegions] = useState<Set<Region>>(new Set(REGIONS));
  const [topN, setTopN] = useState<number>(20);

  const toggle = (r: Region) =>
    setActiveRegions(prev => {
      const next = new Set(prev);
      next.has(r) ? next.delete(r) : next.add(r);
      return next.size === 0 ? new Set(REGIONS) : next;
    });

  const regionByAirport = new Map(airports.map(a => [a.id, a.region]));

  const data = Object.entries(degreeByAirport)
    .sort((a, b) => b[1] - a[1])
    .map(([id, degree]) => ({ id, degree, region: regionByAirport.get(id)! }))
    .filter(d => activeRegions.has(d.region))
    .slice(0, topN);

  const chartHeight = Math.max(180, data.length * 26);

  return (
    <Card className="border-cyan-400/20 bg-slate-950/70 text-white backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-cyan-100 text-sm">Ranking de Centralidade</CardTitle>
        <CardDescription className="text-slate-400 text-xs">Grau dos aeroportos por região</CardDescription>
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <div className="flex flex-wrap gap-1.5">
            {REGIONS.map(r => (
              <button
                key={r}
                onClick={() => toggle(r)}
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
          <div className="flex gap-1 ml-auto">
            {TOP_OPTIONS.map(n => (
              <button
                key={n}
                onClick={() => setTopN(n)}
                className="rounded px-2 py-0.5 text-[10px] font-medium transition-all"
                style={{
                  background: topN === n ? 'rgba(34,211,238,0.15)' : 'rgba(34,211,238,0.04)',
                  border: `1px solid ${topN === n ? 'rgba(34,211,238,0.5)' : 'rgba(34,211,238,0.15)'}`,
                  color: topN === n ? '#67e8f9' : '#475569',
                }}
              >
                Top {n}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(34,211,238,0.04)" vertical={false} />
            <XAxis type="number" tick={{ fill: '#64748b', fontSize: 10 }} />
            <YAxis type="category" dataKey="id" tick={{ fill: '#a5f3fc', fontSize: 10 }} width={40} />
            <Tooltip
              contentStyle={{ background: 'rgba(2,6,23,0.9)', border: '1px solid rgba(34,211,238,0.3)', color: '#e2e8f0' }}
              itemStyle={{ color: '#e2e8f0' }}
              labelStyle={{ color: '#94a3b8' }}
              formatter={(value, _name, props) => [
                `Grau: ${value} — ${props.payload.region}`,
                props.payload.id,
              ]}
            />
            <Bar dataKey="degree" radius={[0, 3, 3, 0]}>
              {data.map(entry => (
                <Cell
                  key={entry.id}
                  fill={REGION_COLOR[entry.region]}
                  fillOpacity={HUB_IDS.includes(entry.id) ? 1 : 0.75}
                  stroke={HUB_IDS.includes(entry.id) ? 'rgba(255,255,255,0.5)' : 'none'}
                  strokeWidth={HUB_IDS.includes(entry.id) ? 1.5 : 0}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
