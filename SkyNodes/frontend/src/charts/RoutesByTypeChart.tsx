import { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, Label } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ROUTE_COLOR } from '@/data/colors';
import type { RouteType } from '@/data/routes';

interface Props { routesByType: Record<string, number>; }

const ROUTE_TYPES: RouteType[] = ['hub', 'regional', 'inter_regional'];
const LABELS: Record<RouteType, string> = {
  hub: 'Hub',
  regional: 'Regional',
  inter_regional: 'Inter-regional',
};

export default function RoutesByTypeChart({ routesByType }: Props) {
  const [activeTypes, setActiveTypes] = useState<Set<RouteType>>(new Set(ROUTE_TYPES));

  const toggle = (t: RouteType) =>
    setActiveTypes(prev => {
      const next = new Set(prev);
      next.has(t) ? next.delete(t) : next.add(t);
      return next.size === 0 ? new Set(ROUTE_TYPES) : next;
    });

  const data = Object.entries(routesByType)
    .filter(([type]) => activeTypes.has(type as RouteType))
    .map(([type, value]) => ({ name: type, value }));

  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <Card className="border-cyan-400/20 bg-slate-950/70 text-white backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-cyan-100 text-sm">Tipos de Rotas</CardTitle>
        <CardDescription className="text-slate-400 text-xs">Proporção de hub / regional / inter-regional</CardDescription>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {ROUTE_TYPES.map(t => {
            const color = ROUTE_COLOR[t];
            return (
              <button
                key={t}
                onClick={() => toggle(t)}
                className="rounded px-2 py-0.5 text-[10px] font-medium transition-all"
                style={{
                  background: color + '22',
                  border: `1px solid ${color}55`,
                  color: activeTypes.has(t) ? color : '#475569',
                  opacity: activeTypes.has(t) ? 1 : 0.4,
                }}
              >
                {LABELS[t]}
              </button>
            );
          })}
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={65}
            >
              {data.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={ROUTE_COLOR[entry.name as RouteType] ?? 'rgba(255,255,255,0.5)'}
                />
              ))}
              <Label
                content={() => (
                  <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fill="#94a3b8" fontSize={13}>
                    {total}
                  </text>
                )}
              />
            </Pie>
            <Tooltip
              contentStyle={{ background: 'rgba(2,6,23,0.9)', border: '1px solid rgba(34,211,238,0.3)', color: '#e2e8f0' }}
              itemStyle={{ color: '#e2e8f0' }}
              labelStyle={{ color: '#94a3b8' }}
            />
            <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 11 }} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
