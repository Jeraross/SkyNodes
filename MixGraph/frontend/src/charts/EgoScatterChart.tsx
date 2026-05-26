import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { REGION_COLOR } from '@/data/colors';
import { airports } from '@/data/airports';
import type { Region } from '@/data/airports';

interface Props {
  egoByAirport: Record<string, number>;
  degreeByAirport: Record<string, number>;
}

type DotEntry = {
  id: string;
  city: string;
  region: Region;
  degree: number;
  ego: number;
};

const REGIONS: Region[] = ['Norte', 'Nordeste', 'Centro-Oeste', 'Sudeste', 'Sul'];

function CustomDot(props: { cx?: number; cy?: number; payload?: DotEntry }) {
  const { cx = 0, cy = 0, payload } = props;
  if (!payload) return null;
  return (
    <circle
      cx={cx}
      cy={cy}
      r={Math.max(4, payload.degree * 3)}
      fill={REGION_COLOR[payload.region]}
      fillOpacity={0.75}
      stroke="rgba(255,255,255,0.2)"
      strokeWidth={1}
    />
  );
}

export default function EgoScatterChart({ egoByAirport, degreeByAirport }: Props) {
  const data: DotEntry[] = airports.map(a => ({
    id: a.id,
    city: a.city,
    region: a.region,
    degree: degreeByAirport[a.id] ?? 0,
    ego: egoByAirport[a.id] ?? 0,
  }));

  return (
    <Card className="border-cyan-400/20 bg-slate-950/70 text-white backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-cyan-100 text-sm">Grau × Densidade Ego</CardTitle>
        <CardDescription className="text-slate-400 text-xs">
          Cada ponto = 1 aeroporto — tamanho proporcional ao grau
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <ScatterChart margin={{ top: 8, right: 16, left: -10, bottom: 16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(34,211,238,0.04)" />
            <XAxis
              type="number"
              dataKey="degree"
              name="Grau"
              tick={{ fill: '#64748b', fontSize: 10 }}
              label={{ value: 'Grau', position: 'insideBottom', offset: -8, fill: '#475569', fontSize: 10 }}
              allowDecimals={false}
            />
            <YAxis
              type="number"
              dataKey="ego"
              name="Densidade Ego"
              tick={{ fill: '#64748b', fontSize: 10 }}
              domain={[0, 1]}
              tickFormatter={v => v.toFixed(2)}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const p = payload[0].payload as DotEntry;
                return (
                  <div className="rounded border border-cyan-500/30 bg-slate-900/95 p-2 text-xs">
                    <p className="font-bold text-cyan-300">{p.id} — {p.city}</p>
                    <p className="text-slate-300">Região: {p.region}</p>
                    <p className="text-slate-300">Grau: {p.degree}</p>
                    <p className="text-slate-300">Densidade ego: {p.ego.toFixed(3)}</p>
                  </div>
                );
              }}
            />
            <Scatter data={data} shape={<CustomDot />} />
            <Legend
              payload={REGIONS.map(r => ({ value: r, type: 'circle' as const, color: REGION_COLOR[r] }))}
              wrapperStyle={{ color: '#94a3b8', fontSize: 10 }}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
