export type QuizMode    = 'avd' | 'grafos' | 'mix';
export type NodeType    = 'inicio' | 'normal' | 'decisorio' | 'boss';
export type NodeStatus  = 'locked' | 'available' | 'completed' | 'current';

export interface PathNode {
  id:            string;
  label:         string;
  tema:          string;
  questionCount: number;  // 0 for decisorio/inicio/final
  x:             number;
  y:             number;
  type:          NodeType;
}

export interface PathEdge {
  from:       string;
  to:         string;
  difficulty: 'Fácil' | 'Médio' | 'Difícil' | 'none';
}

export interface PathData {
  mode:             QuizMode;
  masteryStickerId: string;
  nodes:            PathNode[];
  edges:            PathEdge[];
}

// ─── SVG viewport 900 × 480 ───────────────────────────────────────────────────
//
// Path shape (all modes share same topology, themes differ):
//
//  [inicio] → [n1] → [n2] → [dec] → [n3a] → [n4a] → [boss_hard]
//                               ↓
//                            [n3b] → [n4b] → [boss_easy]

const BASE_NODES: Omit<PathNode, 'tema'>[] = [
  { id: 'inicio',    label: 'INÍCIO',    questionCount: 0, x: 70,  y: 240, type: 'inicio'    },
  { id: 'n1',        label: 'NÓ 1',      questionCount: 5, x: 190, y: 240, type: 'normal'    },
  { id: 'n2',        label: 'NÓ 2',      questionCount: 6, x: 310, y: 240, type: 'normal'    },
  { id: 'dec',       label: 'DEC',       questionCount: 0, x: 430, y: 240, type: 'decisorio' },
  { id: 'n3a',       label: 'NÓ 3A',     questionCount: 7, x: 550, y: 130, type: 'normal'    },
  { id: 'n3b',       label: 'NÓ 3B',     questionCount: 5, x: 550, y: 350, type: 'normal'    },
  { id: 'n4a',       label: 'NÓ 4A',     questionCount: 8, x: 670, y: 130, type: 'normal'    },
  { id: 'n4b',       label: 'NÓ 4B',     questionCount: 6, x: 670, y: 350, type: 'normal'    },
  { id: 'boss_hard', label: 'BOSS',      questionCount: 1, x: 790, y: 130, type: 'boss'      },
  { id: 'boss_easy', label: 'BOSS FÁCIL', questionCount: 1, x: 790, y: 350, type: 'boss'     },
];

const BASE_EDGES: PathEdge[] = [
  { from: 'inicio',    to: 'n1',        difficulty: 'none'    },
  { from: 'n1',        to: 'n2',        difficulty: 'Fácil'   },
  { from: 'n2',        to: 'dec',       difficulty: 'none'    },
  { from: 'dec',       to: 'n3a',       difficulty: 'Difícil' },
  { from: 'dec',       to: 'n3b',       difficulty: 'Fácil'   },
  { from: 'n3a',       to: 'n4a',       difficulty: 'Médio'   },
  { from: 'n3b',       to: 'n4b',       difficulty: 'Médio'   },
  { from: 'n4a',       to: 'boss_hard', difficulty: 'Difícil' },
  { from: 'n4b',       to: 'boss_easy', difficulty: 'Fácil'   },
];

const TEMAS: Record<QuizMode, Record<string, string>> = {
  avd: {
    inicio:    'Início — Caminho de Dados',
    n1:        'Fundamentos de Visualização',
    n2:        'Gráficos de Barras e Linhas',
    dec:       'Decisório — Escolha seu ramo',
    n3a:       'Distribuições Estatísticas',
    n3b:       'Gráficos de Dispersão',
    n4a:       'Dashboards e Interatividade',
    n4b:       'Boas Práticas de Visualização',
    boss_hard: 'Boss Difícil — Gráfico Avançado',
    boss_easy: 'Boss Fácil — Gráfico Básico',
  },
  grafos: {
    inicio:    'Início — Caminho de Grafos',
    n1:        'Conceitos Básicos de Grafos',
    n2:        'Representações e Tipos',
    dec:       'Decisório — Escolha seu ramo',
    n3a:       'BFS — Busca em Largura',
    n3b:       'DFS — Busca em Profundidade',
    n4a:       'Caminhos Mínimos (Dijkstra)',
    n4b:       'Árvores e Spanning Trees',
    boss_hard: 'Boss Difícil — Grafo Complexo',
    boss_easy: 'Boss Fácil — Árvore Simples',
  },
  mix: {
    inicio:    'Início — Caminho Mix',
    n1:        'Fundamentos Mistos',
    n2:        'Grafos e Visualização',
    dec:       'Decisório — Escolha seu ramo',
    n3a:       'Algoritmos e Análise',
    n3b:       'Dados e Estruturas de Grafos',
    n4a:       'Integração AVD + Grafos',
    n4b:       'Otimização e Visualização',
    boss_hard: 'Boss Difícil — Desafio Misto',
    boss_easy: 'Boss Fácil — Introdução ao Mix',
  },
};

const MASTERY: Record<QuizMode, string> = {
  avd:    'maestro_dados',
  grafos: 'maestro_grafos',
  mix:    'pokeball',
};

function buildPath(mode: QuizMode): PathData {
  return {
    mode,
    masteryStickerId: MASTERY[mode],
    nodes: BASE_NODES.map(n => ({ ...n, tema: TEMAS[mode][n.id] ?? n.id })),
    edges: BASE_EDGES,
  };
}

export const PATH_DATA: Record<QuizMode, PathData> = {
  avd:    buildPath('avd'),
  grafos: buildPath('grafos'),
  mix:    buildPath('mix'),
};

export function getNodeById(mode: QuizMode, nodeId: string): PathNode | undefined {
  return PATH_DATA[mode].nodes.find(n => n.id === nodeId);
}

export function getSuccessors(mode: QuizMode, nodeId: string): string[] {
  return PATH_DATA[mode].edges.filter(e => e.from === nodeId).map(e => e.to);
}

export function getPredecessors(mode: QuizMode, nodeId: string): string[] {
  return PATH_DATA[mode].edges.filter(e => e.to === nodeId).map(e => e.from);
}

export function getRootNodeId(mode: QuizMode): string {
  const ids = PATH_DATA[mode].nodes.map(n => n.id);
  return ids.find(id => getPredecessors(mode, id).length === 0) ?? ids[0];
}

export function isQuestionNode(node: PathNode): boolean {
  return node.type === 'normal' || node.type === 'boss';
}
