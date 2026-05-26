import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Region } from '@/data/airports';

interface RegionMetric {
  region: Region;
  order: number;
  size: number;
  density: number;
}

interface Props { regionMetrics: RegionMetric[]; }

export default function RoutesByRegionChart({ regionMetrics }: Props) {
  const data = regionMetrics.map(m => ({
    region: m.region,
    'Ordem |V|': m.order,
    'Tamanho |E|': m.size,
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
            <Bar dataKey="Ordem |V|" fill="#3b82f6" radius={[2, 2, 0, 0]} />
            <Bar dataKey="Tamanho |E|" fill="#f59e0b" radius={[2, 2, 0, 0]} />
            <Bar dataKey="Densidade×10" fill="#10b981" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <p className="mt-1 text-center text-[10px] text-slate-500">Densidade ×10 (escala)</p>
      </CardContent>
    </Card>
  );
}
