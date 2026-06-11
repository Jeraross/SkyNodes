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
    canvas: { width: 640, height: 380 },
    // Positions follow geographic layout: north=up, east=right
    nodes: [
      { id: 'THE', label: 'THE', x: 75,  y: 95  }, // Teresina — northwest
      { id: 'FOR', label: 'FOR', x: 300, y: 40  }, // Fortaleza — north
      { id: 'NAT', label: 'NAT', x: 515, y: 75  }, // Natal — northeast
      { id: 'BSB', label: 'BSB', x: 65,  y: 260 }, // Brasília — west
      { id: 'REC', label: 'REC', x: 265, y: 195 }, // Recife — center hub
      { id: 'JPA', label: 'JPA', x: 430, y: 140 }, // João Pessoa — northeast (safe)
      { id: 'SSA', label: 'SSA', x: 410, y: 310 }, // Salvador — south
      { id: 'GRU', label: 'GRU', x: 195, y: 340 }, // Guarulhos — far southwest
    ],
    // All 7 routes connected to REC in the dataset; REC-JPA is the only operational one
    candidateRoutes: [
      { id: 'route-3',  from: 'REC', to: 'JPA' },
      { id: 'route-0',  from: 'REC', to: 'SSA', blocked: true },
      { id: 'route-1',  from: 'REC', to: 'FOR', blocked: true },
      { id: 'route-2',  from: 'REC', to: 'NAT', blocked: true },
      { id: 'route-4',  from: 'REC', to: 'THE', blocked: true },
      { id: 'route-37', from: 'REC', to: 'GRU', blocked: true },
      { id: 'route-47', from: 'BSB', to: 'REC', blocked: true },
    ],
    requiredNodeIds: ['REC', 'JPA', 'SSA', 'FOR', 'NAT', 'THE', 'GRU', 'BSB'],
    requiredRouteIds: ['route-3', 'route-0', 'route-1', 'route-2', 'route-4', 'route-37', 'route-47'],
    guidePages: [
      'Todo aeroporto e um no. Recife (REC) e o hub da malha nordestina — 7 rotas partem daqui.',
      'Mapeie TODAS as arestas: operacionais e danificadas. Rotas com onda solar (~) estao bloqueadas pelo PROTOCOLO-M mas ainda fazem parte do grafo.',
      'Clique em dois nos para registrar a aresta entre eles. Conecte todas as 7 rotas para completar o mapeamento.',
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
  if (!route) return selectedRouteIds;

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
