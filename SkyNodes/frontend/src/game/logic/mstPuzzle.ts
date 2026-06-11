export interface MstNode {
  id: string;
  label: string;
  x: number; // 0–1 relative to canvas
  y: number;
}

export interface MstEdge {
  id: string;
  from: string;
  to: string;
  weight: number;
}

export interface MstPuzzle {
  id: string;
  airportId: string;
  title: string;
  instruction: string;
  nodes: MstNode[];
  edges: MstEdge[];
  budget: number;
}

export type MstSelections = string[]; // selected edge ids

function isConnected(nodes: MstNode[], edges: MstEdge[], selectedIds: string[]): boolean {
  if (nodes.length === 0) return true;
  const adj: Record<string, string[]> = {};
  for (const n of nodes) adj[n.id] = [];
  for (const id of selectedIds) {
    const e = edges.find(x => x.id === id);
    if (!e) continue;
    adj[e.from].push(e.to);
    adj[e.to].push(e.from);
  }
  const visited = new Set([nodes[0].id]);
  const queue = [nodes[0].id];
  while (queue.length > 0) {
    const cur = queue.shift()!;
    for (const nb of adj[cur] ?? []) {
      if (!visited.has(nb)) { visited.add(nb); queue.push(nb); }
    }
  }
  return visited.size === nodes.length;
}

export function isMstSolved(puzzle: MstPuzzle, selectedIds: string[]): boolean {
  const total = selectedIds.reduce((sum, id) => {
    const e = puzzle.edges.find(x => x.id === id);
    return sum + (e?.weight ?? 0);
  }, 0);
  return total <= puzzle.budget && isConnected(puzzle.nodes, puzzle.edges, selectedIds);
}

export function totalWeight(puzzle: MstPuzzle, selectedIds: string[]): number {
  return selectedIds.reduce((sum, id) => {
    const e = puzzle.edges.find(x => x.id === id);
    return sum + (e?.weight ?? 0);
  }, 0);
}
