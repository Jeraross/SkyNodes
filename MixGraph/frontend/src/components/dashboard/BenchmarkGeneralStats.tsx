import { useMemo } from 'react';
import { airports } from '../../data/airports';
import { routes } from '../../data/routes';
import { buildGraph } from '../../lib/graph/buildGraph';
import { bfsLayers } from '../../lib/graph/bfsLayers';
import { dfsTree } from '../../lib/graph/dfsTree';
import { runGeneralBenchmark, bestIdx } from '../../lib/graph/benchmark';
import type { BenchmarkSummary } from '../../lib/graph/benchmark';
import BfsLayersChart from '../../charts/BfsLayersChart';
import DfsTreeChart from '../../charts/DfsTreeChart';

const graph = buildGraph(airports, routes);
const bfsResult = bfsLayers(graph, 'REC');
const dfsResult = dfsTree(graph, 'REC');

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
                  <td className="px-3 py-2 text-xs font-medium text-slate-200">{s.algorithm}</td>
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
        <BfsLayersChart bfsResult={bfsResult} />
        <DfsTreeChart dfsResult={dfsResult} />
      </div>
    </div>
  );
}
