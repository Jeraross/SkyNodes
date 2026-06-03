import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { airports } from '@/data/airports';
import { REGION_COLOR } from '@/data/colors';
import type { Region } from '@/data/airports';

interface Props { degreeByAirport: Record<string, number>; }

const REGIONS: Region[] = ['Norte', 'Nordeste', 'Centro-Oeste', 'Sudeste', 'Sul'];

export default function DegreeDistributionChart({ degreeByAirport }: Props) {
  const [activeRegions, setActiveRegions] = useState<Set<Region>>(new Set(REGIONS));

  const toggle = (r: Region) =>
    setActiveRegions(prev => {
      const next = new Set(prev);
      next.has(r) ? next.delete(r) : next.add(r);
      return next.size === 0 ? new Set(REGIONS) : next;
    });

  const filteredIds = new Set(airports.filter(a => activeRegions.has(a.region)).map(a => a.id));
  const values = Object.entries(degreeByAirport)
    .filter(([id]) => filteredIds.has(id))
    .map(([, d]) => d);

  const freq: Record<number, number> = {};
  values.forEach(d => { freq[d] = (freq[d] ?? 0) + 1; });
  const data = Object.entries(freq)
    .map(([degree, count]) => ({ degree: Number(degree), count }))
    .sort((a, b) => a.degree - b.degree);

  const mean = values.length ? values.reduce((s, d) => s + d, 0) / values.length : 0;
  const maxCount = data.length ? Math.max(...data.map(d => d.count)) : 1;

  return (
    <Card className="border-cyan-400/20 bg-slate-950/70 text-white backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-cyan-100 text-sm">Distribuição de Grau</CardTitle>
        <CardDescription className="text-slate-400 text-xs">
          Frequência de aeroportos por grau — média {mean.toFixed(1)}
        </CardDescription>
        <div className="flex flex-wrap gap-1.5 pt-1">
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
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 14 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(34,211,238,0.04)" horizontal={false} />
            <XAxis
              dataKey="degree"
              type="number"
              domain={['dataMin', 'dataMax']}
              tick={{ fill: '#64748b', fontSize: 10 }}
              label={{ value: 'Grau', position: 'insideBottom', offset: -8, fill: '#475569', fontSize: 10 }}
            />
            <YAxis tick={{ fill: '#64748b', fontSize: 10 }} allowDecimals={false} />
            <Tooltip
              contentStyle={{ background: 'rgba(2,6,23,0.9)', border: '1px solid rgba(34,211,238,0.3)', color: '#e2e8f0' }}
              itemStyle={{ color: '#e2e8f0' }}
              labelStyle={{ color: '#94a3b8' }}
              formatter={(value, _name, props) => [`${value} aeroporto(s)`, `Grau ${props.payload.degree}`]}
            />
            {data.length > 0 && (
              <ReferenceLine
                x={mean}
                stroke="#ef4444"
                strokeDasharray="4 2"
                label={{ value: `Média: ${mean.toFixed(1)}`, position: 'top', fill: '#ef4444', fontSize: 10 }}
              />
            )}
            <Bar dataKey="count" radius={[3, 3, 0, 0]}>
              {data.map(entry => (
                <Cell
                  key={entry.degree}
                  fill={`rgba(34,211,238,${0.4 + 0.6 * (entry.count / maxCount)})`}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
