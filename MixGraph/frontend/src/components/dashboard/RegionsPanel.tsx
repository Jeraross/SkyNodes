// src/components/dashboard/RegionsPanel.tsx
import RoutesByRegionChart from '../../charts/RoutesByRegionChart';
import RoutesByTypeChart from '../../charts/RoutesByTypeChart';
import type { GraphMetrics } from '../../lib/graph/graphMetrics';

export default function RegionsPanel({ metrics }: { metrics: GraphMetrics }) {
  return (
    <div className="space-y-4">
      <RoutesByRegionChart routesByRegion={metrics.routesByRegion} />
      <RoutesByTypeChart routesByType={metrics.routesByType} />
    </div>
  );
}
