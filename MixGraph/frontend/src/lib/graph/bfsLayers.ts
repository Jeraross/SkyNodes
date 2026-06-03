import type { Graph } from './buildGraph';

export interface BfsLayersResult {
  levels: Record<number, string[]>;
  treeEdges: [string, string][];
}

export function bfsLayers(graph: Graph, origin: string): BfsLayersResult {
  const levels: Record<number, string[]> = {};
  const treeEdges: [string, string][] = [];
  const visited = new Set<string>();

  if (!graph[origin]) return { levels, treeEdges };

  const queue: { node: string; level: number }[] = [{ node: origin, level: 0 }];
  visited.add(origin);

  while (queue.length > 0) {
    const { node, level } = queue.shift()!;
    if (!levels[level]) levels[level] = [];
    levels[level].push(node);

    for (const edge of graph[node] ?? []) {
      if (!visited.has(edge.to)) {
        visited.add(edge.to);
        treeEdges.push([node, edge.to]);
        queue.push({ node: edge.to, level: level + 1 });
      }
    }
  }

  return { levels, treeEdges };
}
