import { useState } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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
  const [activeRegions, setActiveRegions] = useState<Set<Region>>(new Set(REGIONS));

  const toggle = (r: Region) =>
    setActiveRegions(prev => {
      const next = new Set(prev);
      next.has(r) ? next.delete(r) : next.add(r);
      return next.size === 0 ? new Set(REGIONS) : next;
    });

  const data: DotEntry[] = airports
    .filter(a => activeRegions.has(a.region))
    .map(a => ({
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
          </ScatterChart>
        </ResponsiveContainer>
        <div className="mt-2 flex flex-wrap gap-3 text-[10px] text-slate-400">
          {REGIONS.filter(r => activeRegions.has(r)).map(r => (
            <span key={r} className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ background: REGION_COLOR[r] }} />
              {r}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
