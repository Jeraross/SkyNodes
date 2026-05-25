// src/components/dashboard/CentralityPanel.tsx
import DegreeDistributionChart from '../../charts/DegreeDistributionChart';
import CentralityRankingChart from '../../charts/CentralityRankingChart';
import type { GraphMetrics } from '../../lib/graph/graphMetrics';

export default function CentralityPanel({ metrics }: { metrics: GraphMetrics }) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-400">
        O <strong className="text-cyan-300">grau</strong> representa quantas conexões diretas um aeroporto possui no grafo.
        Aeroportos com grau alto são hubs estratégicos da malha aérea.
      </p>
      <CentralityRankingChart degreeByAirport={metrics.degreeByAirport} />
      <DegreeDistributionChart degreeByAirport={metrics.degreeByAirport} />
    </div>
  );
}
