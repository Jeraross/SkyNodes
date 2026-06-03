import RoutesByRegionChart from '../../charts/RoutesByRegionChart';
import RoutesByTypeChart from '../../charts/RoutesByTypeChart';
import DistanceHeatmapChart from '../../charts/DistanceHeatmapChart';
import type { GraphMetrics } from '../../lib/graph/graphMetrics';

export default function RegionsPanel({ metrics }: { metrics: GraphMetrics }) {
  return (
    <div className="space-y-4">
      <RoutesByRegionChart regionMetrics={metrics.regionMetrics} />
      <RoutesByTypeChart routesByType={metrics.routesByType} />
      <DistanceHeatmapChart distanceMatrix={metrics.distanceMatrix} />
    </div>
  );
}
