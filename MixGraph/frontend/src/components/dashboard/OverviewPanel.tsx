import AeroMetricBento from './AeroMetricBento';
import type { GraphMetrics } from '../../lib/graph/graphMetrics';

export default function OverviewPanel({ metrics }: { metrics: GraphMetrics }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-1 text-sm font-medium text-slate-400">Métricas da Malha</h3>
        <AeroMetricBento metrics={metrics} />
      </div>
    </div>
  );
}
