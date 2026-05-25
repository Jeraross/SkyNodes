import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const TYPE_COLORS: Record<string, string> = {
  regional: 'rgba(74,222,128,0.85)',
  hub: 'rgba(34,211,238,0.85)',
  inter_regional: 'rgba(167,139,250,0.85)',
};

interface Props { routesByType: Record<string, number>; }

export default function RoutesByTypeChart({ routesByType }: Props) {
  const data = Object.entries(routesByType).map(([type, value]) => ({ name: type, value }));
  return (
    <Card className="border-cyan-400/20 bg-slate-950/70 text-white backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-cyan-100 text-sm">Tipos de Rotas</CardTitle>
        <CardDescription className="text-slate-400 text-xs">Proporção de hub / regional / inter-regional</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={65} label>
              {data.map((entry, i) => (
                <Cell key={i} fill={TYPE_COLORS[entry.name] ?? 'rgba(255,255,255,0.5)'} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ background: 'rgba(2,6,23,0.9)', border: '1px solid rgba(34,211,238,0.3)', color: '#e2e8f0' }} />
            <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 11 }} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
