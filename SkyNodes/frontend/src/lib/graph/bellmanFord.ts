import type { Airport } from '../../data/airports';
import type { Route } from '../../data/routes';
import type { PathResult } from './bfs';

export function bellmanFord(
  airports: Airport[],
  routes: Route[],
  origin: string,
  destination: string
): PathResult | null {
  const ids = airports.map(a => a.id);
  if (!ids.includes(origin) || !ids.includes(destination)) return null;
  const dist: Record<string, number> = {};
  const prev: Record<string, { node: string; routeId: string } | null> = {};

  for (const id of ids) { dist[id] = Infinity; prev[id] = null; }
  dist[origin] = 0;

  const edges = [
    ...routes.map(r => ({ u: r.from, v: r.to, w: r.weight, id: r.id })),
    ...routes.map(r => ({ u: r.to, v: r.from, w: r.weight, id: r.id })),
  ];

  for (let i = 0; i < ids.length - 1; i++) {
    for (const { u, v, w, id } of edges) {
      if (dist[u] !== Infinity && dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w;
        prev[v] = { node: u, routeId: id };
      }
    }
  }

  if (dist[destination] === Infinity) return null;

  const path: string[] = [];
  const routeIds: string[] = [];
  let cur: string | null = destination;
  while (cur !== null) {
    path.unshift(cur);
    const p: { node: string; routeId: string } | null = prev[cur] ?? null;
    if (p) routeIds.unshift(p.routeId);
    cur = p ? p.node : null;
  }

  return { path, routeIds, cost: dist[destination] };
}
