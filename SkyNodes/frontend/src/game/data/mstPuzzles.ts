import type { MstPuzzle } from '../logic/mstPuzzle';

const PUZZLES: Record<string, MstPuzzle> = {
  'ssa-mst-nordeste': {
    id: 'ssa-mst-nordeste',
    airportId: 'SSA',
    title: 'RECONECTAR REDE NORDESTINA',
    instruction: 'Selecione arestas para conectar todos os aeroportos gastando no máximo o orçamento.',
    nodes: [
      { id: 'SSA', label: 'SSA', x: 0.5,  y: 0.5  },
      { id: 'REC', label: 'REC', x: 0.85, y: 0.2  },
      { id: 'FOR', label: 'FOR', x: 0.15, y: 0.2  },
      { id: 'NAT', label: 'NAT', x: 0.5,  y: 0.08 },
      { id: 'JPA', label: 'JPA', x: 0.85, y: 0.5  },
    ],
    edges: [
      { id: 'SSA-REC', from: 'SSA', to: 'REC', weight: 8  },
      { id: 'SSA-FOR', from: 'SSA', to: 'FOR', weight: 12 },
      { id: 'SSA-NAT', from: 'SSA', to: 'NAT', weight: 14 },
      { id: 'REC-NAT', from: 'REC', to: 'NAT', weight: 10 },
      { id: 'REC-JPA', from: 'REC', to: 'JPA', weight: 6  },
      { id: 'FOR-NAT', from: 'FOR', to: 'NAT', weight: 5  },
    ],
    budget: 31,
  },
  'mao-amazon-network': {
    id: 'mao-amazon-network',
    airportId: 'MAO',
    title: 'RECONECTAR REDE AMAZÔNICA',
    instruction: 'A floresta dificulta a infraestrutura. Conecte todos com o menor custo possível.',
    nodes: [
      { id: 'MAO', label: 'MAO', x: 0.5,  y: 0.5  },
      { id: 'BEL', label: 'BEL', x: 0.85, y: 0.2  },
      { id: 'STM', label: 'STM', x: 0.2,  y: 0.2  },
      { id: 'TEF', label: 'TEF', x: 0.15, y: 0.65 },
      { id: 'PVH', label: 'PVH', x: 0.5,  y: 0.88 },
      { id: 'RBR', label: 'RBR', x: 0.85, y: 0.75 },
    ],
    edges: [
      { id: 'MAO-BEL', from: 'MAO', to: 'BEL', weight: 14 },
      { id: 'MAO-STM', from: 'MAO', to: 'STM', weight: 9  },
      { id: 'MAO-TEF', from: 'MAO', to: 'TEF', weight: 7  },
      { id: 'MAO-PVH', from: 'MAO', to: 'PVH', weight: 11 },
      { id: 'BEL-STM', from: 'BEL', to: 'STM', weight: 8  },
      { id: 'TEF-PVH', from: 'TEF', to: 'PVH', weight: 6  },
      { id: 'PVH-RBR', from: 'PVH', to: 'RBR', weight: 5  },
      { id: 'BEL-RBR', from: 'BEL', to: 'RBR', weight: 16 },
    ],
    budget: 37,
  },
};

export function getMstPuzzle(taskId: string): MstPuzzle | null {
  return PUZZLES[taskId] ?? null;
}
