export interface GraphPuzzleToken {
  id: string;
  label: string;
}

export interface GraphPuzzleSlot {
  id: string;
  label: string;
  accepts: string[];
}

export interface GraphPuzzleDefinition {
  id: string;
  title: string;
  instruction: string;
  tokens: GraphPuzzleToken[];
  slots: GraphPuzzleSlot[];
}

export type GraphPuzzleAssignments = Record<string, string>;

const PUZZLES: Record<string, GraphPuzzleDefinition> = {
  'rec-identify-nodes': {
    id: 'rec-identify-nodes',
    title: 'NOS DA MALHA',
    instruction: 'Arraste os aeroportos para os dois espacos de no.',
    tokens: [
      { id: 'rec', label: 'REC' },
      { id: 'jpa', label: 'JPA' },
      { id: 'solar-wave', label: 'ONDA SOLAR' },
    ],
    slots: [
      { id: 'node-a', label: 'NO 1', accepts: ['rec'] },
      { id: 'node-b', label: 'NO 2', accepts: ['jpa'] },
    ],
  },
  'rec-identify-edges': {
    id: 'rec-identify-edges',
    title: 'ARESTA ENTRE NOS',
    instruction: 'Monte uma conexao simples: origem, aresta e destino.',
    tokens: [
      { id: 'rec', label: 'REC' },
      { id: 'jpa', label: 'JPA' },
      { id: 'edge', label: 'ARESTA' },
      { id: 'solar-wave', label: 'ONDA SOLAR' },
    ],
    slots: [
      { id: 'from', label: 'ORIGEM', accepts: ['rec'] },
      { id: 'edge', label: 'CONEXAO', accepts: ['edge'] },
      { id: 'to', label: 'DESTINO', accepts: ['jpa'] },
    ],
  },
  'rec-validate-jpa-route': {
    id: 'rec-validate-jpa-route',
    title: 'ROTA SEGURA',
    instruction: 'Escolha a unica aresta segura saindo de Recife.',
    tokens: [
      { id: 'rec', label: 'REC' },
      { id: 'jpa', label: 'JPA' },
      { id: 'route-rec-jpa', label: 'REC-JPA' },
      { id: 'route-rec-ssa', label: 'REC-SSA ~' },
      { id: 'route-rec-for', label: 'REC-FOR ~' },
    ],
    slots: [
      { id: 'origin', label: 'ORIGEM', accepts: ['rec'] },
      { id: 'safe-edge', label: 'ARESTA SEGURA', accepts: ['route-rec-jpa'] },
      { id: 'destination', label: 'DESTINO', accepts: ['jpa'] },
    ],
  },
};

export function getGraphPuzzleForTask(taskId: string): GraphPuzzleDefinition | null {
  return PUZZLES[taskId] ?? null;
}

export function placeGraphPuzzleToken(
  puzzle: GraphPuzzleDefinition,
  assignments: GraphPuzzleAssignments,
  slotId: string,
  tokenId: string,
): GraphPuzzleAssignments {
  const slot = puzzle.slots.find(item => item.id === slotId);
  const token = puzzle.tokens.find(item => item.id === tokenId);
  if (!slot || !token || !slot.accepts.includes(token.id)) return assignments;

  return Object.fromEntries([
    ...Object.entries(assignments).filter(([, assignedTokenId]) => assignedTokenId !== tokenId),
    [slotId, tokenId],
  ]);
}

export function isGraphPuzzleSolved(
  puzzle: GraphPuzzleDefinition,
  assignments: GraphPuzzleAssignments,
): boolean {
  return puzzle.slots.every(slot => {
    const tokenId = assignments[slot.id];
    return Boolean(tokenId && slot.accepts.includes(tokenId));
  });
}
