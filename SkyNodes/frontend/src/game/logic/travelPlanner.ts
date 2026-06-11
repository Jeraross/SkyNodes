import type { GameAirport, GameRoute, RouteId } from '../types';

export interface TravelOption {
  airport: GameAirport;
  route: GameRoute;
}

export interface TravelPlanEdge {
  routeId: RouteId;
  from: string;
  to: string;
  baseCost: number;
  anomaly: boolean;
  storm: boolean;
  finalCost: number;
}

export interface TravelPlan {
  valid: boolean;
  routeIds: RouteId[];
  totalCost: number;
  edges: TravelPlanEdge[];
}

interface TravelPlanInput {
  airportIds: string[];
  routes: GameRoute[];
  anomalyRouteIds: RouteId[];
  stormRouteIds: RouteId[];
}

const ANOMALY_COST = 3;
const STORM_COST = 2;

export function buildTravelOptions(originAirportId: string, airports: GameAirport[], routes: GameRoute[]): TravelOption[] {
  return routes.flatMap(route => {
    if (route.state === 'locked') return [];
    const destinationId = route.from === originAirportId ? route.to : route.to === originAirportId ? route.from : null;
    const airport = destinationId ? airports.find(item => item.id === destinationId) : null;
    return airport ? [{ airport, route }] : [];
  });
}

export function calculateTravelPlan({
  airportIds,
  routes,
  anomalyRouteIds,
  stormRouteIds,
}: TravelPlanInput): TravelPlan {
  const edges: TravelPlanEdge[] = [];
  const routeIds: RouteId[] = [];

  for (let index = 0; index < airportIds.length - 1; index += 1) {
    const from = airportIds[index];
    const to = airportIds[index + 1];
    const route = routes.find(item => routeConnects(item, from, to));
    if (!route || route.state === 'locked' || route.state === 'blocked') {
      return { valid: false, routeIds: [], totalCost: 0, edges: [] };
    }

    const anomaly = anomalyRouteIds.includes(route.id);
    const storm = stormRouteIds.includes(route.id);
    const finalCost = route.cost + (anomaly ? ANOMALY_COST : 0) + (storm ? STORM_COST : 0);
    routeIds.push(route.id);
    edges.push({ routeId: route.id, from, to, baseCost: route.cost, anomaly, storm, finalCost });
  }

  return {
    valid: true,
    routeIds,
    totalCost: edges.reduce((sum, edge) => sum + edge.finalCost, 0),
    edges,
  };
}

function routeConnects(route: GameRoute, from: string, to: string): boolean {
  return (route.from === from && route.to === to) || (route.from === to && route.to === from);
}

export interface ShortestPath {
  airportIds: string[];
  routeIds: string[];
}

export function findShortestPath(
  fromId: string,
  toId: string,
  airports: GameAirport[],
  routes: GameRoute[],
): ShortestPath | null {
  if (fromId === toId) return null;

  const airportSet = new Set(airports.map(a => a.id));
  const visited = new Set<string>([fromId]);
  const queue: Array<{ airportId: string; path: string[]; routeIds: string[] }> = [
    { airportId: fromId, path: [fromId], routeIds: [] },
  ];

  while (queue.length > 0) {
    const current = queue.shift()!;
    const traversable = routes.filter(r => {
      if (r.state === 'locked' || r.state === 'blocked') return false;
      return (r.from === current.airportId && airportSet.has(r.to)) ||
             (r.to === current.airportId && airportSet.has(r.from));
    });

    for (const route of traversable) {
      const neighborId = route.from === current.airportId ? route.to : route.from;
      if (visited.has(neighborId)) continue;
      visited.add(neighborId);
      const newPath = [...current.path, neighborId];
      const newRouteIds = [...current.routeIds, route.id];
      if (neighborId === toId) {
        return { airportIds: newPath, routeIds: newRouteIds };
      }
      queue.push({ airportId: neighborId, path: newPath, routeIds: newRouteIds });
    }
  }

  return null;
}
