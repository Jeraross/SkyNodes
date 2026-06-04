import type { QuizMode } from './quizPathData';

export interface CanvasNode {
  id: string;
  x: number;
  y: number;
  label: string;
}

export interface CanvasEdge {
  from: string;
  to: string;
}

export interface ChartBar {
  label: string;
  value: number;
}

export interface CanvasState {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  bars: ChartBar[];
}

export interface BossProperty {
  id: string;
  label: string;
  tooltip: string;
  check: (state: CanvasState) => boolean;
}

export interface BossQuestion {
  id: string;
  mode: QuizMode;
  type: 'graph' | 'chart';
  enunciado: string;
  properties: BossProperty[];
  hints: [string, string, string];
}

function hasCycle(nodes: CanvasNode[], edges: CanvasEdge[]): boolean {
  const adj: Record<string, string[]> = {};
  nodes.forEach(n => (adj[n.id] = []));
  edges.forEach(e => {
    adj[e.from]?.push(e.to);
    adj[e.to]?.push(e.from);
  });
  const visited = new Set<string>();
  function dfs(id: string, parent: string | null): boolean {
    visited.add(id);
    for (const nb of adj[id] ?? []) {
      if (!visited.has(nb)) { if (dfs(nb, id)) return true; }
      else if (nb !== parent) return true;
    }
    return false;
  }
  return nodes.some(n => !visited.has(n.id) && dfs(n.id, null));
}

function isConnected(nodes: CanvasNode[], edges: CanvasEdge[]): boolean {
  if (nodes.length === 0) return true;
  const adj: Record<string, string[]> = {};
  nodes.forEach(n => (adj[n.id] = []));
  edges.forEach(e => {
    adj[e.from]?.push(e.to);
    adj[e.to]?.push(e.from);
  });
  const visited = new Set<string>();
  const stack = [nodes[0].id];
  while (stack.length) {
    const id = stack.pop()!;
    if (visited.has(id)) continue;
    visited.add(id);
    adj[id]?.forEach(nb => stack.push(nb));
  }
  return visited.size === nodes.length;
}

function nodeDegree(nodeId: string, edges: CanvasEdge[]): number {
  return edges.filter(e => e.from === nodeId || e.to === nodeId).length;
}

export const BOSS_QUESTIONS: BossQuestion[] = [
  {
    id: 'boss_grafos',
    mode: 'grafos',
    type: 'graph',
    enunciado:
      'Monte um grafo não-direcionado com exatamente 5 nós onde: o grafo seja conectado (todos os nós alcançáveis), exista pelo menos um ciclo, e o nó A tenha grau maior ou igual a 3.',
    hints: [
      'Um grafo conectado significa que você consegue chegar de qualquer nó a qualquer outro nó seguindo as arestas.',
      'Um ciclo é um caminho que começa e termina no mesmo nó. Se você tem 3 nós A-B-C com arestas A-B, B-C e C-A, isso forma um ciclo.',
      'O grau de um nó é o número de arestas que saem dele. Para que o nó A tenha grau ≥ 3, conecte pelo menos 3 outras arestas a ele.',
    ],
    properties: [
      {
        id: 'five_nodes',
        label: 'Exatamente 5 nós',
        tooltip: 'O grafo deve ter exatamente 5 nós posicionados na área.',
        check: s => s.nodes.length === 5,
      },
      {
        id: 'connected',
        label: 'Grafo conectado',
        tooltip: 'Todo nó deve ser alcançável a partir de qualquer outro nó.',
        check: s => isConnected(s.nodes, s.edges),
      },
      {
        id: 'has_cycle',
        label: 'Contém pelo menos um ciclo',
        tooltip: 'Um ciclo é um caminho que começa e termina no mesmo nó.',
        check: s => hasCycle(s.nodes, s.edges),
      },
      {
        id: 'node_a_degree',
        label: 'Nó A com grau ≥ 3',
        tooltip: 'O nó A deve ter pelo menos 3 arestas conectadas a ele.',
        check: s => {
          const nodeA = s.nodes.find(n => n.label === 'A');
          return nodeA ? nodeDegree(nodeA.id, s.edges) >= 3 : false;
        },
      },
    ],
  },
  {
    id: 'boss_avd',
    mode: 'avd',
    type: 'chart',
    enunciado:
      'Monte um gráfico de barras com os 4 valores fornecidos organizados em ordem crescente da esquerda para a direita. Valores: Rio (42), São Paulo (78), Brasília (31), Salvador (55).',
    hints: [
      'Ordem crescente significa do menor para o maior valor. Coloque o menor valor na primeira barra à esquerda.',
      'Os valores são: Rio 42, São Paulo 78, Brasília 31, Salvador 55. O menor é Brasília com 31.',
      'A ordem correta é: Brasília (31) → Rio (42) → Salvador (55) → São Paulo (78).',
    ],
    properties: [
      {
        id: 'four_bars',
        label: 'Exatamente 4 barras',
        tooltip: 'O gráfico deve ter as 4 barras posicionadas.',
        check: s => s.bars.length === 4,
      },
      {
        id: 'ascending',
        label: 'Ordem crescente',
        tooltip: 'Os valores devem aumentar da esquerda para a direita.',
        check: s => s.bars.every((b, i) => i === 0 || b.value >= s.bars[i - 1].value),
      },
      {
        id: 'correct_values',
        label: 'Valores corretos',
        tooltip: 'Todos os valores originais devem estar presentes.',
        check: s => {
          const vals = s.bars.map(b => b.value).sort((a, b) => a - b);
          return JSON.stringify(vals) === JSON.stringify([31, 42, 55, 78]);
        },
      },
    ],
  },
  {
    id: 'boss_mix_graph',
    mode: 'mix',
    type: 'graph',
    enunciado:
      'Monte um grafo não-direcionado com exatamente 4 nós onde: o grafo seja conectado e todo nó tenha grau exatamente 2 (forma um ciclo completo).',
    hints: [
      'Se todo nó tem grau 2 em um grafo conectado com 4 nós, o resultado é um ciclo: A-B-C-D-A.',
      'Comece conectando os nós em anel: A com B, B com C, C com D, D com A.',
      'Verifique se cada nó tem exatamente 2 arestas conectadas. Nenhum nó deve ter 1 ou 3 arestas.',
    ],
    properties: [
      {
        id: 'four_nodes',
        label: 'Exatamente 4 nós',
        tooltip: 'O grafo deve ter exatamente 4 nós.',
        check: s => s.nodes.length === 4,
      },
      {
        id: 'connected',
        label: 'Grafo conectado',
        tooltip: 'Todo nó deve ser alcançável a partir de qualquer outro.',
        check: s => isConnected(s.nodes, s.edges),
      },
      {
        id: 'all_degree_2',
        label: 'Todo nó com grau exatamente 2',
        tooltip: 'Cada nó deve ter exatamente 2 arestas — nem mais, nem menos.',
        check: s => s.nodes.every(n => nodeDegree(n.id, s.edges) === 2),
      },
    ],
  },
  {
    id: 'boss_mix_chart',
    mode: 'mix',
    type: 'chart',
    enunciado:
      'Monte um gráfico de barras com os 3 valores em ordem decrescente (maior à esquerda). Valores: Nó A (90), Nó B (45), Nó C (70).',
    hints: [
      'Ordem decrescente é do maior para o menor. Coloque o maior valor na primeira barra.',
      'Os valores são: Nó A = 90, Nó B = 45, Nó C = 70. O maior é Nó A com 90.',
      'A ordem correta é: Nó A (90) → Nó C (70) → Nó B (45).',
    ],
    properties: [
      {
        id: 'three_bars',
        label: 'Exatamente 3 barras',
        tooltip: 'O gráfico deve ter as 3 barras posicionadas.',
        check: s => s.bars.length === 3,
      },
      {
        id: 'descending',
        label: 'Ordem decrescente',
        tooltip: 'Os valores devem diminuir da esquerda para a direita.',
        check: s => s.bars.every((b, i) => i === 0 || b.value <= s.bars[i - 1].value),
      },
      {
        id: 'correct_values',
        label: 'Valores corretos',
        tooltip: 'Todos os valores originais devem estar presentes.',
        check: s => {
          const vals = s.bars.map(b => b.value).sort((a, b) => a - b);
          return JSON.stringify(vals) === JSON.stringify([45, 70, 90]);
        },
      },
    ],
  },
];

export function getBossQuestions(mode: QuizMode): BossQuestion[] {
  return BOSS_QUESTIONS.filter(b => b.mode === mode);
}
