import type { Airport } from '../../data/airports';
import type { Route } from '../../data/routes';

export interface GraphMetrics {
  totalAirports: number;
  totalRoutes: number;
  degreeByAirport: Record<string, number>;
  mostConnectedAirport: string;
  graphDensity: number;
  routesByRegion: Record<string, number>;
  routesByType: Record<string, number>;
  longestRoute: { id: string; from: string; to: string; weight: number } | null;
  regionMostConnected: string;
}

export function computeMetrics(airports: Airport[], routes: Route[]): GraphMetrics {
  const n = airports.length;
  const degreeByAirport: Record<string, number> = {};
  for (const a of airports) degreeByAirport[a.id] = 0;
  for (const r of routes) {
    degreeByAirport[r.from] = (degreeByAirport[r.from] ?? 0) + 1;
    degreeByAirport[r.to] = (degreeByAirport[r.to] ?? 0) + 1;
  }

  const mostConnectedAirport = Object.entries(degreeByAirport).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '';
  const maxEdges = n * (n - 1) / 2;
  const graphDensity = maxEdges > 0 ? routes.length / maxEdges : 0;

  const airportMap = new Map(airports.map(a => [a.id, a]));
  const routesByRegion: Record<string, number> = {};
  for (const r of routes) {
    const srcRegion = airportMap.get(r.from)?.region ?? 'Unknown';
    const dstRegion = airportMap.get(r.to)?.region ?? 'Unknown';
    routesByRegion[srcRegion] = (routesByRegion[srcRegion] ?? 0) + 1;
    if (dstRegion !== srcRegion) {
      routesByRegion[dstRegion] = (routesByRegion[dstRegion] ?? 0) + 1;
    }
  }

  const routesByType: Record<string, number> = {};
  for (const r of routes) {
    routesByType[r.type] = (routesByType[r.type] ?? 0) + 1;
  }

  const longestRoute = routes.reduce<Route | null>((acc, r) => (!acc || r.weight > acc.weight) ? r : acc, null);

  const regionMostConnected = Object.entries(routesByRegion).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '';

  return {
    totalAirports: n,
    totalRoutes: routes.length,
    degreeByAirport,
    mostConnectedAirport,
    graphDensity,
    routesByRegion,
    routesByType,
    longestRoute: longestRoute ? { id: longestRoute.id, from: longestRoute.from, to: longestRoute.to, weight: longestRoute.weight } : null,
    regionMostConnected,
  };
}
