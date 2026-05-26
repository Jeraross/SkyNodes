import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { REGION_COLOR } from '@/data/colors';
import { airports } from '@/data/airports';

interface Props { degreeByAirport: Record<string, number>; }

const HUB_IDS = ['GRU', 'BSB', 'GIG'];

export default function CentralityRankingChart({ degreeByAirport }: Props) {
  const regionByAirport = new Map(airports.map(a => [a.id, a.region]));

  const data = Object.entries(degreeByAirport)
    .sort((a, b) => b[1] - a[1])
    .map(([id, degree]) => ({ id, degree, region: regionByAirport.get(id)! }));

  return (
    <Card className="border-cyan-400/20 bg-slate-950/70 text-white backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-cyan-100 text-sm">Ranking de Centralidade</CardTitle>
        <CardDescription className="text-slate-400 text-xs">Grau de todos os 20 aeroportos por região</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={500}>
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
