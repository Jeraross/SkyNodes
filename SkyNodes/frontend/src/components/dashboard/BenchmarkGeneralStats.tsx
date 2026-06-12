import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ScatterChart, Scatter, ZAxis, ReferenceLine,
} from 'recharts';
import { airports } from '../../data/airports';
import { routes } from '../../data/routes';
import { buildGraph } from '../../lib/graph/buildGraph';
import { runGeneralBenchmark, bestIdx } from '../../lib/graph/benchmark';
import type { BenchmarkSummary } from '../../lib/graph/benchmark';
import BfsLayersChart from '../../charts/BfsLayersChart';
import DfsTreeChart from '../../charts/DfsTreeChart';

const graph = buildGraph(airports, routes);

const ALGO_COLOR: Record<string, string> = {
  BFS:           '#3b82f6',
  DFS:           '#f59e0b',
  Dijkstra:      '#10b981',
  'Bellman-Ford':'#f87171',
};

export default function BenchmarkGeneralStats() {
  const summaries = useMemo(() => runGeneralBenchmark(graph, airports, routes), []);

  const bestTime    = bestIdx<BenchmarkSummary>(summaries, 'avgTimeMs',   true);
  const bestSuccess = bestIdx<BenchmarkSummary>(summaries, 'successRate', false);
  const bestCost    = bestIdx<BenchmarkSummary>(summaries, 'avgCost',     true);
  const bestHops    = bestIdx<BenchmarkSummary>(summaries, 'avgHops',     true);

  const cell = (value: string, isBest: boolean) => (
    <td className={`px-3 py-2 text-right font-mono text-xs ${isBest ? 'text-cyan-300 font-semibold' : 'text-slate-300'}`}>
      {value}
    </td>
  );

  // Bar chart data: one bar group per algorithm
  const barData = summaries.map(s => ({
    name: s.algorithm,
    'Custo médio': s.avgCost !== null ? parseFloat(s.avgCost.toFixed(2)) : 0,
    'Saltos médios': s.avgHops !== null ? parseFloat(s.avgHops.toFixed(2)) : 0,
  }));

  // Scatter data: each algorithm is one point — X=saltos médios, Y=tempo médio
  const scatterData = summaries
    .filter(s => s.avgHops !== null)
    .map(s => ({
      name: s.algorithm,
      hops: s.avgHops ?? 0,
      timeMs: s.avgTimeMs,
      fill: ALGO_COLOR[s.algorithm] ?? '#94a3b8',
    }));

  const tooltipStyle = {
    contentStyle: { background: 'rgba(2,6,23,0.92)', border: '1px solid rgba(34,211,238,0.3)', color: '#e2e8f0' },
    itemStyle: { color: '#e2e8f0' },
    labelStyle: { color: '#94a3b8' },
  };

  return (
    <div className="space-y-6">
      {/* Tabela de stats */}
      <div>
        <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-slate-500">
          Estatísticas Gerais — {airports.length * (airports.length - 1)} pares
        </p>
        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60">
                {['Algoritmo', 'Tempo médio (ms)', 'Sucesso (%)', 'Custo médio', 'Saltos médios'].map(h => (
                  <th key={h} className="px-3 py-2 text-right first:text-left text-[10px] uppercase tracking-wider text-slate-500">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {summaries.map((s, i) => (
                <tr key={s.algorithm} className="border-b border-slate-800/50 last:border-0 hover:bg-slate-900/30 transition-colors">
                  <td className="px-3 py-2 text-xs font-medium flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full shrink-0" style={{ background: ALGO_COLOR[s.algorithm] }} />
                    {s.algorithm}
                  </td>
                  {cell(s.avgTimeMs.toFixed(4),                              i === bestTime)}
                  {cell((s.successRate * 100).toFixed(1) + '%',              i === bestSuccess)}
                  {cell(s.avgCost !== null ? s.avgCost.toFixed(1) : '—',     i === bestCost)}
                  {cell(s.avgHops !== null ? s.avgHops.toFixed(2) : '—',     i === bestHops)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Gráfico de barras — Custo e Saltos por algoritmo */}
      <div>
        <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-slate-500">
          Custo Médio &amp; Saltos Médios
        </p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={barData} margin={{ top: 4, right: 16, left: -16, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(34,211,238,0.05)" horizontal={false} />
            <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} />
            <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={(v: number) => v.toFixed(2)} />
            <Tooltip {...tooltipStyle} formatter={(v: number) => v.toFixed(2)} />
            <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 11 }} />
            <Bar dataKey="Custo médio"   fill="#10b981" radius={[3, 3, 0, 0]} />
            <Bar dataKey="Saltos médios" fill="#3b82f6" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <p className="mt-1 text-center text-[10px] text-slate-500">
          Custo = soma dos pesos da rota · Saltos = número de arestas percorridas
        </p>
      </div>

      {/* Gráfico de dispersão — Saltos Médios × Tempo de Execução */}
      <div>
        <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-slate-500">
          Dispersão — Saltos Médios × Tempo de Execução
        </p>
        <ResponsiveContainer width="100%" height={220}>
          <ScatterChart margin={{ top: 16, right: 24, left: -16, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(34,211,238,0.05)" />
            <XAxis
              type="number"
              dataKey="hops"
              name="Saltos médios"
              tick={{ fill: '#64748b', fontSize: 10 }}
              label={{ value: 'Saltos médios', position: 'insideBottom', offset: -12, fill: '#475569', fontSize: 10 }}
            />
            <YAxis
              type="number"
              dataKey="timeMs"
              name="Tempo (ms)"
              tick={{ fill: '#64748b', fontSize: 10 }}
              tickFormatter={v => v.toFixed(3)}
              label={{ value: 'Tempo (ms)', angle: -90, position: 'insideLeft', offset: 12, fill: '#475569', fontSize: 10 }}
            />
            <ZAxis range={[120, 120]} />
            <Tooltip
              cursor={{ strokeDasharray: '3 3', stroke: 'rgba(34,211,238,0.3)' }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="rounded border border-cyan-500/30 bg-slate-900/95 p-2 text-xs">
                    <p className="font-bold" style={{ color: d.fill }}>{d.name}</p>
                    <p className="text-slate-300">Saltos médios: {d.hops.toFixed(2)}</p>
                    <p className="text-slate-300">Tempo médio: {d.timeMs.toFixed(4)} ms</p>
                  </div>
                );
              }}
            />
            {scatterData.map(d => (
              <Scatter
                key={d.name}
                name={d.name}
                data={[d]}
                fill={d.fill}
                shape={(props: { cx?: number; cy?: number }) => {
                  const { cx = 0, cy = 0 } = props;
                  return (
                    <g>
                      <circle cx={cx} cy={cy} r={10} fill={d.fill} fillOpacity={0.85} stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
                      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fontSize={8} fill="#0f172a" fontWeight="bold">
                        {d.name.slice(0, 3)}
                      </text>
                    </g>
                  );
                }}
              />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
        <div className="mt-2 flex flex-wrap gap-3 justify-center text-[10px] text-slate-400">
          {scatterData.map(d => (
            <span key={d.name} className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ background: d.fill }} />
              {d.name}
            </span>
          ))}
        </div>
        <p className="mt-1 text-center text-[10px] text-slate-500">
          Algoritmos mais à direita percorrem mais saltos; mais acima consomem mais tempo
        </p>
      </div>

      {/* Legenda de traversal */}
      <div className="flex gap-4 text-[10px] text-slate-500 font-mono">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full bg-blue-400/70" />
          BFS — nós coloridos por nível (largura)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full bg-orange-400/70" />
          DFS — nós coloridos por ordem de descoberta (profundidade)
        </span>
      </div>

      {/* Charts lado a lado */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <BfsLayersChart />
        <DfsTreeChart />
      </div>
    </div>
  );
}
