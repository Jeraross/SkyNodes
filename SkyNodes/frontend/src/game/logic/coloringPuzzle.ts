export interface ColoringNode {
  id: string;
  label: string;
  x: number; // 0–1 relative to canvas
  y: number;
}

export interface ColoringEdge {
  from: string;
  to: string;
}

export interface ColoringPuzzle {
  id: string;
  airportId: string;
  title: string;
  instruction: string;
  nodes: ColoringNode[];
  edges: ColoringEdge[];
  colors: string[]; // hex strings e.g. '#00aaff'
  colorLabels: string[]; // e.g. 'AZUL'
  maxColors: number;
}

export type ColoringAssignments = Record<string, string>; // nodeId → colorHex

export function getConflicts(puzzle: ColoringPuzzle, assignments: ColoringAssignments): Set<string> {
  const conflicted = new Set<string>();
  for (const edge of puzzle.edges) {
    const ca = assignments[edge.from];
    const cb = assignments[edge.to];
    if (ca && cb && ca === cb) {
      conflicted.add(edge.from);
      conflicted.add(edge.to);
    }
  }
  return conflicted;
}

export function isColoringSolved(puzzle: ColoringPuzzle, assignments: ColoringAssignments): boolean {
  const allColored = puzzle.nodes.every(n => Boolean(assignments[n.id]));
  if (!allColored) return false;
  return getConflicts(puzzle, assignments).size === 0;
}
