import type { TopoSortPuzzle } from '../logic/topoSortPuzzle';

const PUZZLES: Record<string, TopoSortPuzzle> = {
  'gyn-inspection-order': {
    id: 'gyn-inspection-order',
    airportId: 'GYN',
    title: 'SEQUENCIAR INSPEÇÃO DE PISTAS',
    instruction: 'Arraste as etapas para os slots respeitando as dependências (setas).',
    nodes: [
      { id: 'pre-voo',    label: 'PRÉ-VOO'   },
      { id: 'pista',      label: 'PISTA'     },
      { id: 'radar',      label: 'RADAR'     },
      { id: 'torre',      label: 'TORRE'     },
      { id: 'liberacao',  label: 'LIBERAÇÃO' },
    ],
    edges: [
      { from: 'pre-voo',   to: 'pista'     },
      { from: 'pre-voo',   to: 'radar'     },
      { from: 'pista',     to: 'torre'     },
      { from: 'radar',     to: 'torre'     },
      { from: 'torre',     to: 'liberacao' },
    ],
  },
  'cgh-maintenance-sequence': {
    id: 'cgh-maintenance-sequence',
    airportId: 'CGH',
    title: 'SEQUENCIAR PROTOCOLO DE MANUTENÇÃO',
    instruction: 'A manutenção tem dependências rígidas. Ordene as etapas corretamente.',
    nodes: [
      { id: 'inspecao',      label: 'INSPEÇÃO'    },
      { id: 'abastecimento', label: 'ABASTEC.'    },
      { id: 'checklist',     label: 'CHECKLIST'   },
      { id: 'teste-motor',   label: 'TESTE-MOT.'  },
      { id: 'aprovacao',     label: 'APROVAÇÃO'   },
      { id: 'embarque',      label: 'EMBARQUE'    },
    ],
    edges: [
      { from: 'inspecao',      to: 'checklist'     },
      { from: 'inspecao',      to: 'teste-motor'   },
      { from: 'abastecimento', to: 'checklist'     },
      { from: 'checklist',     to: 'aprovacao'     },
      { from: 'teste-motor',   to: 'aprovacao'     },
      { from: 'aprovacao',     to: 'embarque'      },
    ],
  },
};

export function getTopoSortPuzzle(taskId: string): TopoSortPuzzle | null {
  return PUZZLES[taskId] ?? null;
}
