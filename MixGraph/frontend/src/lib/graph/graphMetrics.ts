import type { Airport, Region } from '../../data/airports';
import type { Route } from '../../data/routes';
import type { Graph } from './buildGraph';
import type { PathResult } from './bfs';
import { dijkstra } from './dijkstra';

export interface RegionMetric {
  region: Region;
  order: number;
  size: number;
  density: number;
}

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
  dijkstraPaths: { recPoa: PathResult; maoGru: PathResult };
  egoByAirport: Record<string, number>;
  regionMetrics: RegionMetric[];
  distanceMatrix: Record<string, Record<string, number | null>>;
}

export function computeMetrics(airports: Airport[], routes: Route[], graph: Graph): GraphMetrics {
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

  const recPoa = dijkstra(graph, 'REC', 'POA') ?? { path: [], routeIds: [], cost: 0 };
  const maoGru = dijkstra(graph, 'MAO', 'GRU') ?? { path: [], routeIds: [], cost: 0 };

  const neighborMap: Record<string, Set<string>> = {};
  for (const id of Object.keys(graph)) neighborMap[id] = new Set();
  for (const r of routes) {
    neighborMap[r.from]?.add(r.to);
    neighborMap[r.to]?.add(r.from);
  }
  const egoByAirport: Record<string, number> = {};
  for (const id of Object.keys(graph)) {
    const neighbors = [...(neighborMap[id] ?? [])];
    const k = neighbors.length;
    if (k < 2) { egoByAirport[id] = 0; continue; }
    let internalEdges = 0;
    for (let i = 0; i < neighbors.length; i++) {
      for (let j = i + 1; j < neighbors.length; j++) {
        if (neighborMap[neighbors[i]]?.has(neighbors[j])) internalEdges++;
      }
    }
    egoByAirport[id] = internalEdges / (k * (k - 1) / 2);
  }

  const regionAirports: Record<string, string[]> = {};
  for (const a of airports) {
    if (!regionAirports[a.region]) regionAirports[a.region] = [];
    regionAirports[a.region].push(a.id);
  }
  const regionMetrics: RegionMetric[] = (Object.keys(regionAirports) as Region[]).map(region => {
    const ids = new Set(regionAirports[region]);
    const order = ids.size;
    const regionRoutes = routes.filter(r => ids.has(r.from) && ids.has(r.to));
    const size = regionRoutes.length;
    const maxPossible = order * (order - 1) / 2;
    const density = maxPossible > 0 ? size / maxPossible : 0;
    return { region, order, size, density };
  });

  const allIds = airports.map(a => a.id);
  const distanceMatrix: Record<string, Record<string, number | null>> = {};
  for (const id of allIds) {
    distanceMatrix[id] = {};
    for (const other of allIds) {
      if (id === other) { distanceMatrix[id][other] = 0; continue; }
      const result = dijkstra(graph, id, other);
      distanceMatrix[id][other] = result ? result.cost : null;
    }
  }

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
    dijkstraPaths: { recPoa, maoGru },
    egoByAirport,
    regionMetrics,
    distanceMatrix,
  };
}
