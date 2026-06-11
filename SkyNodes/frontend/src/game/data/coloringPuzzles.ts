import type { ColoringPuzzle } from '../logic/coloringPuzzle';

const COLORS = ['#00aaff', '#00ff88', '#ffdd00'];
const COLOR_LABELS = ['AZUL', 'VERDE', 'AMARELO'];

const PUZZLES: Record<string, ColoringPuzzle> = {
  'cnf-frequency-coloring': {
    id: 'cnf-frequency-coloring',
    airportId: 'CNF',
    title: 'ALOCAR FREQUÊNCIAS SEM INTERFERÊNCIA',
    instruction: 'Atribua cores (frequências) aos nós. Nós adjacentes não podem ter a mesma cor.',
    nodes: [
      { id: 'CNF', label: 'CNF', x: 0.5,  y: 0.5  },
      { id: 'BHZ', label: 'BHZ', x: 0.2,  y: 0.2  },
      { id: 'MOC', label: 'MOC', x: 0.8,  y: 0.2  },
      { id: 'GOV', label: 'GOV', x: 0.85, y: 0.65 },
      { id: 'IPN', label: 'IPN', x: 0.5,  y: 0.88 },
      { id: 'PLU', label: 'PLU', x: 0.15, y: 0.65 },
    ],
    edges: [
      { from: 'CNF', to: 'BHZ' },
      { from: 'CNF', to: 'MOC' },
      { from: 'CNF', to: 'GOV' },
      { from: 'CNF', to: 'IPN' },
      { from: 'CNF', to: 'PLU' },
      { from: 'BHZ', to: 'MOC' },
      { from: 'PLU', to: 'IPN' },
    ],
    colors: COLORS,
    colorLabels: COLOR_LABELS,
    maxColors: 3,
  },
  'pvh-sector-coloring': {
    id: 'pvh-sector-coloring',
    airportId: 'PVH',
    title: 'COLORIR SETORES DE CONTROLE',
    instruction: 'Setores adjacentes não podem usar o mesmo canal de comunicação.',
    nodes: [
      { id: 'PVH',  label: 'PVH',  x: 0.5,  y: 0.5  },
      { id: 'JIO',  label: 'JIO',  x: 0.2,  y: 0.15 },
      { id: 'ARQ',  label: 'ARQ',  x: 0.75, y: 0.15 },
      { id: 'CAO',  label: 'CAO',  x: 0.88, y: 0.55 },
      { id: 'VLH',  label: 'VLH',  x: 0.6,  y: 0.88 },
      { id: 'GJM',  label: 'GJM',  x: 0.2,  y: 0.75 },
    ],
    edges: [
      { from: 'PVH', to: 'JIO'  },
      { from: 'PVH', to: 'ARQ'  },
      { from: 'PVH', to: 'CAO'  },
      { from: 'PVH', to: 'VLH'  },
      { from: 'PVH', to: 'GJM'  },
      { from: 'JIO', to: 'ARQ'  },
      { from: 'CAO', to: 'VLH'  },
      { from: 'VLH', to: 'GJM'  },
    ],
    colors: COLORS,
    colorLabels: COLOR_LABELS,
    maxColors: 3,
  },
};

export function getColoringPuzzle(taskId: string): ColoringPuzzle | null {
  return PUZZLES[taskId] ?? null;
}
