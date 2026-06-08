import type { AirportId, RouteId } from '../types';

export interface NetworkNode {
  id: AirportId;
  label: string;
  x: number;
  y: number;
}

export interface NetworkCandidateRoute {
  id: RouteId;
  from: AirportId;
  to: AirportId;
  blocked?: boolean;
}

export interface NetworkRestorationPuzzle {
  id: string;
  airportId: AirportId;
  title: string;
  canvas: { width: number; height: number };
  nodes: NetworkNode[];
  candidateRoutes: NetworkCandidateRoute[];
  requiredNodeIds: AirportId[];
  requiredRouteIds: RouteId[];
  guidePages: string[];
}

export type NetworkNodePositions = Record<AirportId, { x: number; y: number }>;

const PUZZLES: Record<string, NetworkRestorationPuzzle> = {
  'rec-restore-network': {
    id: 'rec-restore-network',
    airportId: 'REC',
    title: 'RESTABELECER MALHA DE RECIFE',
    canvas: { width: 520, height: 280 },
    nodes: [
      { id: 'REC', label: 'REC', x: 90, y: 140 },
      { id: 'JPA', label: 'JPA', x: 250, y: 95 },
      { id: 'SSA', label: 'SSA', x: 400, y: 195 },
      { id: 'FOR', label: 'FOR', x: 380, y: 70 },
    ],
    candidateRoutes: [
      { id: 'route-3', from: 'REC', to: 'JPA' },
      { id: 'route-0', from: 'REC', to: 'SSA', blocked: true },
      { id: 'route-1', from: 'REC', to: 'FOR', blocked: true },
    ],
    requiredNodeIds: ['REC', 'JPA'],
    requiredRouteIds: ['route-3'],
    guidePages: [
      'Todo aeroporto e um no. Recife deve ficar como ponto de partida da malha local.',
      'Uma rota e uma aresta. Arestas com ondas solares nao podem ser usadas agora.',
      'Conecte todos os nos alcancaveis usando todas as rotas possiveis do aeroporto atual.',
    ],
  },
};

export function getNetworkRestorationPuzzle(taskId: string): NetworkRestorationPuzzle | null {
  return PUZZLES[taskId] ?? null;
}

export function moveNetworkNode(
  puzzle: NetworkRestorationPuzzle,
  positions: NetworkNodePositions,
  nodeId: AirportId,
  x: number,
  y: number,
): NetworkNodePositions {
  if (!puzzle.nodes.some(node => node.id === nodeId)) return positions;
  return {
    ...positions,
    [nodeId]: {
      x: clamp(x, 0, puzzle.canvas.width),
      y: clamp(y, 0, puzzle.canvas.height),
    },
  };
}

export function connectNetworkRoute(
  puzzle: NetworkRestorationPuzzle,
  selectedRouteIds: RouteId[],
  from: AirportId,
  to: AirportId,
): RouteId[] {
  const route = puzzle.candidateRoutes.find(candidate => routeConnects(candidate, from, to));
  if (!route || route.blocked) return selectedRouteIds;

  return selectedRouteIds.includes(route.id)
    ? selectedRouteIds.filter(routeId => routeId !== route.id)
    : [...selectedRouteIds, route.id];
}

export function isNetworkRestorationSolved(
  puzzle: NetworkRestorationPuzzle,
  selectedRouteIds: RouteId[],
): boolean {
  const selected = new Set(selectedRouteIds);
  const hasEveryPossibleRoute = puzzle.requiredRouteIds.every(routeId => selected.has(routeId));
  const hasOnlyPossibleRoutes = selectedRouteIds.every(routeId => puzzle.requiredRouteIds.includes(routeId));
  return hasEveryPossibleRoute && hasOnlyPossibleRoutes && connectsRequiredNodes(puzzle, selected);
}

function connectsRequiredNodes(puzzle: NetworkRestorationPuzzle, selectedRouteIds: Set<RouteId>): boolean {
  const [startNodeId] = puzzle.requiredNodeIds;
  if (!startNodeId) return false;

  const adjacency = new Map<AirportId, AirportId[]>();
  for (const route of puzzle.candidateRoutes) {
    if (!selectedRouteIds.has(route.id)) continue;
    adjacency.set(route.from, [...(adjacency.get(route.from) ?? []), route.to]);
    adjacency.set(route.to, [...(adjacency.get(route.to) ?? []), route.from]);
  }

  const visited = new Set<AirportId>();
  const queue: AirportId[] = [startNodeId];
  while (queue.length) {
    const nodeId = queue.shift();
    if (!nodeId || visited.has(nodeId)) continue;
    visited.add(nodeId);
    for (const neighbor of adjacency.get(nodeId) ?? []) {
      if (!visited.has(neighbor)) queue.push(neighbor);
    }
  }

  return puzzle.requiredNodeIds.every(nodeId => visited.has(nodeId));
}

function routeConnects(route: NetworkCandidateRoute, from: AirportId, to: AirportId): boolean {
  return (route.from === from && route.to === to) || (route.from === to && route.to === from);
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
