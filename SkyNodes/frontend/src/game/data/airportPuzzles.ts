// src/game/data/airportPuzzles.ts

export interface PuzzleNode {
  id: string;
  label: string;
  x: number;  // relative position 0–1 in canvas
  y: number;
  status: 'active' | 'corrupted' | 'inactive';
}

export interface PuzzleEdge {
  id: string;   // format: "from-to"
  from: string;
  to: string;
}

export interface AirportPuzzle {
  airportId: string;
  hubNodeId: string;
  winCondition: 'all_connected';
  nodes: PuzzleNode[];
  availableEdges: PuzzleEdge[];
}

export const RECIFE_PUZZLE: AirportPuzzle = {
  airportId: 'REC',
  hubNodeId: 'torre',
  winCondition: 'all_connected',
  nodes: [
    { id: 'torre',    label: 'TORRE',    x: 0.5,  y: 0.5,  status: 'active'    },
    { id: 'terminal', label: 'TERMINAL', x: 0.2,  y: 0.2,  status: 'inactive'  },
    { id: 'radar',    label: 'RADAR',    x: 0.8,  y: 0.2,  status: 'corrupted' },
    { id: 'pista',    label: 'PISTA',    x: 0.2,  y: 0.8,  status: 'inactive'  },
    { id: 'gerador',  label: 'GERADOR',  x: 0.8,  y: 0.8,  status: 'inactive'  },
  ],
  availableEdges: [
    { id: 'torre-terminal', from: 'torre', to: 'terminal' },
    { id: 'torre-radar',    from: 'torre', to: 'radar'    },
    { id: 'torre-pista',    from: 'torre', to: 'pista'    },
    { id: 'torre-gerador',  from: 'torre', to: 'gerador'  },
  ],
};

/** BFS from hub — returns true if all nodes are reachable */
export function checkWinCondition(puzzle: AirportPuzzle, createdEdgeIds: string[]): boolean {
  const adj: Record<string, string[]> = {};
  for (const node of puzzle.nodes) adj[node.id] = [];

  for (const edgeId of createdEdgeIds) {
    const edge = puzzle.availableEdges.find(e => e.id === edgeId);
    if (!edge) continue;
    adj[edge.from].push(edge.to);
    adj[edge.to].push(edge.from);
  }

  const visited = new Set<string>([puzzle.hubNodeId]);
  const queue = [puzzle.hubNodeId];
  while (queue.length > 0) {
    const cur = queue.shift()!;
    for (const neighbor of adj[cur] ?? []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
  return visited.size === puzzle.nodes.length;
}

export const AIRPORT_PUZZLES: Record<string, AirportPuzzle> = {
  REC: RECIFE_PUZZLE,
};
