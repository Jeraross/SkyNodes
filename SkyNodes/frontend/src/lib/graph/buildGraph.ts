import type { Airport } from '../../data/airports';
import type { Route } from '../../data/routes';

export interface GraphEdge {
  to: string;
  weight: number;
  routeId: string;
}

export type Graph = Record<string, GraphEdge[]>;

export function buildGraph(airports: Airport[], routes: Route[]): Graph {
  const graph: Graph = {};
  for (const a of airports) graph[a.id] = [];

  for (const r of routes) {
    graph[r.from]?.push({ to: r.to, weight: r.weight, routeId: r.id });
    graph[r.to]?.push({ to: r.from, weight: r.weight, routeId: r.id });
  }
  return graph;
}
