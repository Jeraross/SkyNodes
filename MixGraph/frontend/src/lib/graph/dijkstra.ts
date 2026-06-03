import type { Graph } from './buildGraph';
import type { PathResult } from './bfs';

export function dijkstra(graph: Graph, origin: string, destination: string): PathResult | null {
  if (!graph[origin] || !graph[destination]) return null;

  const dist: Record<string, number> = {};
  const prev: Record<string, { node: string; routeId: string } | null> = {};
  const unvisited = new Set(Object.keys(graph));

  for (const node of unvisited) { dist[node] = Infinity; prev[node] = null; }
  dist[origin] = 0;

  while (unvisited.size > 0) {
    let u: string | null = null;
    let minDist = Infinity;
    for (const node of unvisited) {
      if (dist[node] < minDist) { minDist = dist[node]; u = node; }
    }
    if (u === null || u === destination) break;
    unvisited.delete(u);

    for (const edge of graph[u] ?? []) {
      if (!unvisited.has(edge.to)) continue;
      const alt = dist[u] + edge.weight;
      if (alt < dist[edge.to]) {
        dist[edge.to] = alt;
        prev[edge.to] = { node: u, routeId: edge.routeId };
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
