import type { AirportStatus, GameAirport, GameMission, GameRoute } from '../types';
import { airports } from '../../data/airports';
import { routes } from '../../data/routes';
import { buildGraph } from '../../lib/graph/buildGraph';
import { dijkstra } from '../../lib/graph/dijkstra';

export const WORLD_SIZE = { width: 1600, height: 1000 };
export const RECIFE_TUTORIAL_MISSION_ID = 'tutorial-rec';
export const RECIFE_TO_JPA_ROUTE_ID = 'route-3';

export const AIRPORT_VISIT_ORDER = [
  'REC',
  'JPA',
  'NAT',
  'FOR',
  'THE',
  'SSA',
  'BSB',
  'GYN',
  'CNF',
  'VIX',
  'GIG',
  'CGH',
  'GRU',
  'CWB',
  'FLN',
  'POA',
  'MAO',
  'BEL',
  'PVH',
  'RBR',
] as const;

export const GAME_AIRPORTS: GameAirport[] = airports.map(airport => {
  let status: AirportStatus = 'unknown';
  if (airport.id === 'REC') status = 'connected';
  if (airport.id === 'JPA') status = 'detected';
  return {
    id: airport.id,
    code: airport.id,
    name: airport.name,
    city: airport.city,
    region: airport.region,
    x: airport.lng,
    y: airport.lat,
    status,
  };
});

export const GAME_ROUTES: GameRoute[] = routes.map(route => ({
  id: route.id,
  from: route.from,
  to: route.to,
  cost: route.weight,
  state: 'locked',
}));

const graph = buildGraph(airports, routes);

export function buildRoutesForProgress(baseRoutes: GameRoute[], progress: { completedMissionIds: string[]; restoredRouteIds: string[] }): GameRoute[] {
  const tutorialComplete = progress.completedMissionIds.includes(RECIFE_TUTORIAL_MISSION_ID);

  return baseRoutes.map(route => {
    if (progress.restoredRouteIds.includes(route.id)) {
      return { ...route, state: 'restored' };
    }

    if (tutorialComplete && (route.from === 'REC' || route.to === 'REC')) {
      if (route.id === RECIFE_TO_JPA_ROUTE_ID) {
        return { ...route, state: 'available' };
      }
      return { ...route, state: 'blocked', blockReason: 'solar-anomaly' };
    }

    return { ...route, state: 'locked' };
  });
}

export const GAME_MISSIONS: GameMission[] = AIRPORT_VISIT_ORDER.map((airportId, index) => {
  const from = index === 0 ? 'REC' : AIRPORT_VISIT_ORDER[index - 1];
  const airport = airports.find(item => item.id === airportId);
  const path = from === airportId ? { path: [airportId], routeIds: [], cost: 0 } : dijkstra(graph, from, airportId);

  return {
    id: airportId === 'REC' ? RECIFE_TUTORIAL_MISSION_ID : `visit-${airportId.toLowerCase()}`,
    title: airportId === 'REC'
      ? 'Tutorial Em Recife'
      : airportId === 'RBR'
        ? 'Rota Final Para Rio Branco'
        : `Visitar ${airport?.city ?? airportId}`,
    description: airportId === 'REC'
      ? 'Agente J deve mapear nos, arestas e a primeira rota segura da malha aerea com apoio de Lia.'
      : `Calcule uma rota possivel de ${from} ate ${airportId} e confirme a viagem para ${airport?.city ?? airportId}.`,
    objectiveAirportId: airportId,
    unlocksRouteIds: path?.routeIds ?? [],
    anomalyRouteIds: path?.routeIds ?? [],
    rewardText: path
      ? `Caminho calculado: ${path.path.join(' -> ')}.`
      : `Nenhum caminho encontrado ate ${airportId}.`,
  };
});
