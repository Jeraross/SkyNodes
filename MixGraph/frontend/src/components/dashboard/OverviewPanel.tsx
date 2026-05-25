// src/components/dashboard/OverviewPanel.tsx
import Folder from '@reactbits/Folder/Folder';
import AeroMetricBento from './AeroMetricBento';
import type { GraphMetrics } from '../../lib/graph/graphMetrics';

export default function OverviewPanel({ metrics }: { metrics: GraphMetrics }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-1 text-sm font-medium text-slate-400">Métricas da Malha</h3>
        <AeroMetricBento metrics={metrics} />
      </div>
      <div className="flex items-center gap-4">
        <Folder
          color="#0891b2"
          size={0.8}
          items={[
            <span className="text-[10px] text-slate-700">airports.ts</span>,
            <span className="text-[10px] text-slate-700">routes.ts</span>,
            <span className="text-[10px] text-slate-700">graph.ts</span>,
          ]}
        />
        <div className="text-xs text-slate-400">
          <p className="font-mono text-cyan-400">Dataset MixGraph</p>
          <p>20 aeroportos · 50 rotas · Grafo não-direcionado</p>
        </div>
      </div>
    </div>
  );
}
