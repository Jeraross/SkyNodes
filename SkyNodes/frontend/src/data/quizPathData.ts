export type QuizMode = 'avd' | 'grafos' | 'mix';
export type NodeStatus = 'locked' | 'available' | 'completed' | 'boss';

export interface PathNode {
  id: string;
  label: string;
  tema: string;
  questionCount: number;
  x: number;
  y: number;
  type: 'normal' | 'boss';
}

export interface PathEdge {
  from: string;
  to: string;
  difficulty: 'Fácil' | 'Médio' | 'Difícil';
}

export interface PathData {
  mode: QuizMode;
  masteryStickerId: string;
  nodes: PathNode[];
  edges: PathEdge[];
}

// SVG viewport: 800 x 420
const BASE_NODES: Omit<PathNode, 'tema'>[] = [
  { id: 'n1',   label: '01', questionCount: 5,  x: 80,  y: 210, type: 'normal' },
  { id: 'n2',   label: '02', questionCount: 6,  x: 240, y: 210, type: 'normal' },
  { id: 'n3',   label: '03', questionCount: 7,  x: 360, y: 310, type: 'normal' },
  { id: 'n4',   label: '04', questionCount: 7,  x: 360, y: 110, type: 'normal' },
  { id: 'n5',   label: '05', questionCount: 8,  x: 520, y: 210, type: 'normal' },
  { id: 'boss', label: 'BOSS', questionCount: 1, x: 700, y: 210, type: 'boss'   },
];

const BASE_EDGES: PathEdge[] = [
  { from: 'n1',   to: 'n2',   difficulty: 'Fácil'   },
  { from: 'n2',   to: 'n4',   difficulty: 'Médio'   },
  { from: 'n2',   to: 'n3',   difficulty: 'Difícil' },
  { from: 'n4',   to: 'n5',   difficulty: 'Difícil' },
  { from: 'n3',   to: 'n5',   difficulty: 'Fácil'   },
  { from: 'n5',   to: 'boss', difficulty: 'Difícil' },
];

const TEMAS: Record<QuizMode, Record<string, string>> = {
  avd: {
    n1:   'Fundamentos de Visualização',
    n2:   'Gráficos de Barras e Linhas',
    n3:   'Distribuições e Histogramas',
    n4:   'Gráficos de Dispersão',
    n5:   'Dashboards e Boas Práticas',
    boss: 'Construção de Gráfico',
  },
  grafos: {
    n1:   'Conceitos Básicos de Grafos',
    n2:   'Representações e Tipos',
    n3:   'Busca em Largura (BFS)',
    n4:   'Busca em Profundidade (DFS)',
    n5:   'Caminhos Mínimos',
    boss: 'Construção de Grafo',
  },
  mix: {
    n1:   'Fundamentos Mistos',
    n2:   'Grafos e Dados',
    n3:   'Algoritmos e Visualizações',
    n4:   'Análise e Estruturas',
    n5:   'Integração AVD + Grafos',
    boss: 'Desafio Misto',
  },
};

const MASTERY: Record<QuizMode, string> = {
  avd:   'maestro_dados',
  grafos: 'maestro_grafos',
  mix:   'pokeball', // figurinha gamer
};

function buildPath(mode: QuizMode): PathData {
  return {
    mode,
    masteryStickerId: MASTERY[mode],
    nodes: BASE_NODES.map(n => ({ ...n, tema: TEMAS[mode][n.id] })),
    edges: BASE_EDGES,
  };
}

export const PATH_DATA: Record<QuizMode, PathData> = {
  avd:   buildPath('avd'),
  grafos: buildPath('grafos'),
  mix:   buildPath('mix'),
};

export function getNodeById(mode: QuizMode, nodeId: string): PathNode | undefined {
  return PATH_DATA[mode].nodes.find(n => n.id === nodeId);
}

export function getSuccessors(mode: QuizMode, nodeId: string): string[] {
  return PATH_DATA[mode].edges
    .filter(e => e.from === nodeId)
    .map(e => e.to);
}

export function getPredecessors(mode: QuizMode, nodeId: string): string[] {
  return PATH_DATA[mode].edges
    .filter(e => e.to === nodeId)
    .map(e => e.from);
}

/** Returns the root node id (no predecessors). */
export function getRootNodeId(mode: QuizMode): string {
  const nodeIds = PATH_DATA[mode].nodes.map(n => n.id);
  return nodeIds.find(id => getPredecessors(mode, id).length === 0) ?? nodeIds[0];
}
