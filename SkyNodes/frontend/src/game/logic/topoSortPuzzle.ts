export interface TopoNode {
  id: string;
  label: string;
}

export interface TopoEdge {
  from: string; // must come BEFORE to
  to: string;
}

export interface TopoSortPuzzle {
  id: string;
  airportId: string;
  title: string;
  instruction: string;
  nodes: TopoNode[];
  edges: TopoEdge[]; // directed dependency edges
}

// sequence is an ordered array of node ids (slot 0 = first, etc.)
export function isTopoSortValid(puzzle: TopoSortPuzzle, sequence: string[]): boolean {
  if (sequence.length !== puzzle.nodes.length) return false;
  const position: Record<string, number> = {};
  sequence.forEach((id, i) => { position[id] = i; });
  return puzzle.edges.every(edge => (position[edge.from] ?? Infinity) < (position[edge.to] ?? -1));
}

// Returns true if placing nodeId at slot index violates any dependency
export function isPlacementValid(
  puzzle: TopoSortPuzzle,
  sequence: (string | null)[],
  nodeId: string,
  slotIndex: number,
): boolean {
  // All nodes that must come BEFORE nodeId
  const mustBeBefore = puzzle.edges.filter(e => e.to === nodeId).map(e => e.from);
  // All nodes that must come AFTER nodeId
  const mustBeAfter = puzzle.edges.filter(e => e.from === nodeId).map(e => e.to);

  for (const pred of mustBeBefore) {
    const predSlot = sequence.findIndex(id => id === pred);
    if (predSlot !== -1 && predSlot >= slotIndex) return false;
  }
  for (const succ of mustBeAfter) {
    const succSlot = sequence.findIndex(id => id === succ);
    if (succSlot !== -1 && succSlot <= slotIndex) return false;
  }
  return true;
}
