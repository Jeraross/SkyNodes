import type { Graph } from './buildGraph';

export interface DfsTreeResult {
  depthMap: Record<string, number>;
  levels: Record<number, string[]>;
  treeEdges: [string, string][];
  order: string[];
}

export function dfsTree(graph: Graph, origin: string): DfsTreeResult {
  const depthMap: Record<string, number> = {};
  const levels: Record<number, string[]> = {};
  const treeEdges: [string, string][] = [];
  const order: string[] = [];
  const visited = new Set<string>();

  function visit(node: string, depth: number) {
    visited.add(node);
    depthMap[node] = depth;
    order.push(node);
    if (!levels[depth]) levels[depth] = [];
    levels[depth].push(node);

    for (const edge of graph[node] ?? []) {
      if (!visited.has(edge.to)) {
        treeEdges.push([node, edge.to]);
        visit(edge.to, depth + 1);
      }
    }
  }

  if (graph[origin]) visit(origin, 0);
  return { depthMap, levels, treeEdges, order };
}
