import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Props { degreeByAirport: Record<string, number>; }

export default function DegreeDistributionChart({ degreeByAirport }: Props) {
  const data = Object.entries(degreeByAirport)
    .map(([id, degree]) => ({ id, degree }))
    .sort((a, b) => b.degree - a.degree)
    .slice(0, 12);

  return (
    <Card className="border-cyan-400/20 bg-slate-950/70 text-white backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-cyan-100 text-sm">Distribuição de Grau</CardTitle>
        <CardDescription className="text-slate-400 text-xs">
          Conexões diretas por aeroporto
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(34,211,238,0.04)" horizontal={false} />
            <XAxis dataKey="id" tick={{ fill: '#64748b', fontSize: 10 }} />
            <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
            <Tooltip contentStyle={{ background: 'rgba(2,6,23,0.9)', border: '1px solid rgba(34,211,238,0.3)', color: '#e2e8f0' }} />
            <Bar dataKey="degree" fill="rgba(34,211,238,0.7)" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
