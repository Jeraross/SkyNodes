import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Props { degreeByAirport: Record<string, number>; }

export default function CentralityRankingChart({ degreeByAirport }: Props) {
  const data = Object.entries(degreeByAirport)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([id, degree]) => ({ id, degree }));

  return (
    <Card className="border-cyan-400/20 bg-slate-950/70 text-white backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-cyan-100 text-sm">Ranking de Hubs</CardTitle>
        <CardDescription className="text-slate-400 text-xs">Aeroportos com maior centralidade de grau</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 4, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(34,211,238,0.04)" horizontal={false} />
            <XAxis type="number" tick={{ fill: '#64748b', fontSize: 10 }} />
            <YAxis type="category" dataKey="id" tick={{ fill: '#a5f3fc', fontSize: 10 }} width={36} />
            <Tooltip contentStyle={{ background: 'rgba(2,6,23,0.9)', border: '1px solid rgba(34,211,238,0.3)', color: '#e2e8f0' }} />
            <Bar dataKey="degree" fill="rgba(167,139,250,0.75)" radius={[0, 3, 3, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
