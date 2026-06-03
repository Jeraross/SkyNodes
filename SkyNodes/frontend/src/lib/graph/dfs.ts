import type { Graph } from './buildGraph';
import type { PathResult } from './bfs';

export function dfs(graph: Graph, origin: string, destination: string): PathResult | null {
  if (!graph[origin] || !graph[destination]) return null;

  const stack: { node: string; path: string[]; routeIds: string[]; cost: number }[] = [
    { node: origin, path: [origin], routeIds: [], cost: 0 },
  ];
  const visited = new Set<string>();

  while (stack.length > 0) {
    const current = stack.pop()!;
    if (current.node === destination) {
      return { path: current.path, routeIds: current.routeIds, cost: current.cost };
    }
    if (visited.has(current.node)) continue;
    visited.add(current.node);

    for (const edge of graph[current.node] ?? []) {
      if (!visited.has(edge.to)) {
        stack.push({
          node: edge.to,
          path: [...current.path, edge.to],
          routeIds: [...current.routeIds, edge.routeId],
          cost: current.cost + edge.weight,
        });
      }
    }
  }
  return null;
}
