import type { Route } from '../../data/routes';

export interface PathResult {
  path: string[];
  routeIds: string[];
  cost: number;
}

function findRouteId(from: string, to: string, routes: Route[]): string {
  return (
    routes.find(
      r => (r.from === from && r.to === to) || (r.from === to && r.to === from)
    )?.id ?? ''
  );
}

export function backendPathToResult(
  caminho: string[],
  custo: number | null,
  routes: Route[],
): PathResult {
  const routeIds: string[] = [];
  for (let i = 0; i < caminho.length - 1; i++) {
    routeIds.push(findRouteId(caminho[i], caminho[i + 1], routes));
  }
  return { path: caminho, routeIds, cost: custo ?? 0 };
}
