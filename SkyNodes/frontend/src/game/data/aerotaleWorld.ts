import type { GameAirport, GameMission, GameRoute } from '../types';
import { airports } from '../../data/airports';
import { routes } from '../../data/routes';
import { buildGraph } from '../../lib/graph/buildGraph';
import { dijkstra } from '../../lib/graph/dijkstra';

export const WORLD_SIZE = { width: 1600, height: 1000 };

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

export const GAME_AIRPORTS: GameAirport[] = airports.map(airport => ({
  id: airport.id,
  code: airport.id,
  name: airport.name,
  city: airport.city,
  region: airport.region,
  x: airport.lng,
  y: airport.lat,
}));

export const GAME_ROUTES: GameRoute[] = routes.map(route => ({
  id: route.id,
  from: route.from,
  to: route.to,
  cost: route.weight,
  state: 'locked',
}));

const graph = buildGraph(airports, routes);

export const GAME_MISSIONS: GameMission[] = AIRPORT_VISIT_ORDER.map((airportId, index) => {
  const from = index === 0 ? 'REC' : AIRPORT_VISIT_ORDER[index - 1];
  const airport = airports.find(item => item.id === airportId);
  const path = from === airportId ? { path: [airportId], routeIds: [], cost: 0 } : dijkstra(graph, from, airportId);

  return {
    id: `visit-${airportId.toLowerCase()}`,
    title: airportId === 'REC'
      ? 'Inicio Em Recife'
      : airportId === 'RBR'
        ? 'Rota Final Para Rio Branco'
        : `Visitar ${airport?.city ?? airportId}`,
    description: airportId === 'REC'
      ? 'A jornada comeca no Aeroporto Internacional do Recife. Confirme a partida para abrir o plano de viagem.'
      : `Calcule uma rota possivel de ${from} ate ${airportId} e confirme a viagem para ${airport?.city ?? airportId}.`,
    objectiveAirportId: airportId,
    unlocksRouteIds: path?.routeIds ?? [],
    anomalyRouteIds: path?.routeIds ?? [],
    rewardText: path
      ? `Caminho calculado: ${path.path.join(' -> ')}.`
      : `Nenhum caminho encontrado ate ${airportId}.`,
  };
});
