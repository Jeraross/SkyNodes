import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { REGION_COLOR } from '@/data/colors';
import type { RegionMetric } from '@/lib/graph/graphMetrics';
import type { Region } from '@/data/airports';

interface Props { regionMetrics: RegionMetric[]; }

const REGIONS: Region[] = ['Norte', 'Nordeste', 'Centro-Oeste', 'Sudeste', 'Sul'];

type SeriesKey = 'Ordem |V|' | 'Tamanho |E|' | 'Densidade×10';
const SERIES: { key: SeriesKey; color: string }[] = [
  { key: 'Ordem |V|',     color: '#3b82f6' },
  { key: 'Tamanho |E|',   color: '#f59e0b' },
  { key: 'Densidade×10',  color: '#10b981' },
];

export default function RoutesByRegionChart({ regionMetrics }: Props) {
  const [activeRegions, setActiveRegions] = useState<Set<Region>>(new Set(REGIONS));
  const [activeSeries, setActiveSeries] = useState<Set<SeriesKey>>(new Set(SERIES.map(s => s.key)));

  const toggleRegion = (r: Region) =>
    setActiveRegions(prev => {
      const next = new Set(prev);
      next.has(r) ? next.delete(r) : next.add(r);
      return next.size === 0 ? new Set(REGIONS) : next;
    });

  const toggleSeries = (k: SeriesKey) =>
    setActiveSeries(prev => {
      const next = new Set(prev);
      next.has(k) ? next.delete(k) : next.add(k);
      return next.size === 0 ? new Set(SERIES.map(s => s.key)) : next;
    });

  const data = regionMetrics
    .filter(m => activeRegions.has(m.region as Region))
    .map(m => ({
      region: m.region,
      'Ordem |V|':    m.order,
      'Tamanho |E|':  m.size,
      'Densidade×10': parseFloat((m.density * 10).toFixed(3)),
      _density: m.density,
    }));

  return (
    <Card className="border-cyan-400/20 bg-slate-950/70 text-white backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-cyan-100 text-sm">Métricas por Região</CardTitle>
        <CardDescription className="text-slate-400 text-xs">
          Ordem, tamanho e densidade por região
        </CardDescription>
        <div className="flex flex-col gap-2 pt-1">
          {/* Region chips */}
          <div className="flex flex-wrap gap-1.5">
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
          {/* Series chips */}
          <div className="flex gap-1.5">
            {SERIES.map(({ key, color }) => (
              <button
                key={key}
                onClick={() => toggleSeries(key)}
                className="rounded px-2 py-0.5 text-[10px] font-medium transition-all"
                style={{
                  background: color + '22',
                  border: `1px solid ${color}55`,
                  color: activeSeries.has(key) ? color : '#475569',
                  opacity: activeSeries.has(key) ? 1 : 0.4,
                }}
              >
                {key}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 4, right: 8, left: -10, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(34,211,238,0.04)" horizontal={false} />
            <XAxis dataKey="region" tick={{ fill: '#64748b', fontSize: 9 }} />
            <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
            <Tooltip
              contentStyle={{ background: 'rgba(2,6,23,0.9)', border: '1px solid rgba(34,211,238,0.3)', color: '#e2e8f0' }}
              itemStyle={{ color: '#e2e8f0' }}
              labelStyle={{ color: '#94a3b8' }}
              formatter={(value, name, props) => {
                if (name === 'Densidade×10') return [props.payload._density.toFixed(4), 'Densidade'];
                return [value, name as string];
              }}
            />
            <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 11 }} />
            {SERIES.filter(s => activeSeries.has(s.key)).map(({ key, color }) => (
              <Bar key={key} dataKey={key} fill={color} radius={[2, 2, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
        <p className="mt-1 text-center text-[10px] text-slate-500">Densidade ×10 (escala)</p>
      </CardContent>
    </Card>
  );
}
