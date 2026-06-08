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
