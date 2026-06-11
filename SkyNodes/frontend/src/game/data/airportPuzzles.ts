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
  label?: string;
  hubNodeId: string;
  winCondition: 'all_connected';
  nodes: PuzzleNode[];
  availableEdges: PuzzleEdge[];
}

export const RECIFE_PUZZLE: AirportPuzzle = {
  airportId: 'REC',
  label: 'RECIFE',
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

// JPA — Grau do vértice (star: hub degree = 4)
const JPA_PUZZLE: AirportPuzzle = {
  airportId: 'JPA',
  label: 'JOÃO PESSOA',
  hubNodeId: 'torre',
  winCondition: 'all_connected',
  nodes: [
    { id: 'torre',    label: 'TORRE',    x: 0.5,  y: 0.5,  status: 'active'   },
    { id: 'terminal', label: 'TERMINAL', x: 0.5,  y: 0.1,  status: 'inactive' },
    { id: 'hangar',   label: 'HANGAR',   x: 0.9,  y: 0.5,  status: 'inactive' },
    { id: 'pista',    label: 'PISTA',    x: 0.5,  y: 0.9,  status: 'inactive' },
    { id: 'radar',    label: 'RADAR',    x: 0.1,  y: 0.5,  status: 'inactive' },
  ],
  availableEdges: [
    { id: 'torre-terminal', from: 'torre', to: 'terminal' },
    { id: 'torre-hangar',   from: 'torre', to: 'hangar'   },
    { id: 'torre-pista',    from: 'torre', to: 'pista'    },
    { id: 'torre-radar',    from: 'torre', to: 'radar'    },
  ],
};

// NAT — Caminhos alternativos (two parallel paths to same destination)
const NAT_PUZZLE: AirportPuzzle = {
  airportId: 'NAT',
  label: 'NATAL',
  hubNodeId: 'base',
  winCondition: 'all_connected',
  nodes: [
    { id: 'base',   label: 'BASE',   x: 0.1,  y: 0.5,  status: 'active'   },
    { id: 'via_a',  label: 'VIA A',  x: 0.35, y: 0.2,  status: 'inactive' },
    { id: 'via_b',  label: 'VIA B',  x: 0.35, y: 0.8,  status: 'inactive' },
    { id: 'nexo',   label: 'NEXO',   x: 0.65, y: 0.5,  status: 'inactive' },
    { id: 'pista',  label: 'PISTA',  x: 0.9,  y: 0.5,  status: 'inactive' },
  ],
  availableEdges: [
    { id: 'base-via_a',  from: 'base',  to: 'via_a'  },
    { id: 'base-via_b',  from: 'base',  to: 'via_b'  },
    { id: 'via_a-nexo',  from: 'via_a', to: 'nexo'   },
    { id: 'via_b-nexo',  from: 'via_b', to: 'nexo'   },
    { id: 'nexo-pista',  from: 'nexo',  to: 'pista'  },
  ],
};

// FOR — Hub com grau elevado (hub + 5 leaves, one ring edge)
const FOR_PUZZLE: AirportPuzzle = {
  airportId: 'FOR',
  label: 'FORTALEZA',
  hubNodeId: 'hub',
  winCondition: 'all_connected',
  nodes: [
    { id: 'hub',    label: 'HUB',    x: 0.5,  y: 0.45, status: 'active'    },
    { id: 'norte',  label: 'NORTE',  x: 0.5,  y: 0.08, status: 'inactive'  },
    { id: 'leste',  label: 'LESTE',  x: 0.87, y: 0.4,  status: 'inactive'  },
    { id: 'sul',    label: 'SUL',    x: 0.65, y: 0.85, status: 'inactive'  },
    { id: 'oeste',  label: 'OESTE',  x: 0.13, y: 0.4,  status: 'inactive'  },
    { id: 'centro', label: 'CENTRO', x: 0.35, y: 0.85, status: 'corrupted' },
  ],
  availableEdges: [
    { id: 'hub-norte',   from: 'hub',   to: 'norte'  },
    { id: 'hub-leste',   from: 'hub',   to: 'leste'  },
    { id: 'hub-sul',     from: 'hub',   to: 'sul'    },
    { id: 'hub-oeste',   from: 'hub',   to: 'oeste'  },
    { id: 'hub-centro',  from: 'hub',   to: 'centro' },
    { id: 'sul-centro',  from: 'sul',   to: 'centro' },
  ],
};

// THE — Padrão simétrico em cruz (cross/diamond)
const THE_PUZZLE: AirportPuzzle = {
  airportId: 'THE',
  label: 'TERESINA',
  hubNodeId: 'nucleo',
  winCondition: 'all_connected',
  nodes: [
    { id: 'nucleo', label: 'NÚCLEO', x: 0.5,  y: 0.5,  status: 'active'   },
    { id: 'norte',  label: 'NORTE',  x: 0.5,  y: 0.1,  status: 'inactive' },
    { id: 'leste',  label: 'LESTE',  x: 0.9,  y: 0.5,  status: 'inactive' },
    { id: 'sul',    label: 'SUL',    x: 0.5,  y: 0.9,  status: 'inactive' },
    { id: 'oeste',  label: 'OESTE',  x: 0.1,  y: 0.5,  status: 'inactive' },
  ],
  availableEdges: [
    { id: 'nucleo-norte', from: 'nucleo', to: 'norte' },
    { id: 'nucleo-leste', from: 'nucleo', to: 'leste' },
    { id: 'nucleo-sul',   from: 'nucleo', to: 'sul'   },
    { id: 'nucleo-oeste', from: 'nucleo', to: 'oeste' },
    { id: 'norte-leste',  from: 'norte',  to: 'leste' },
    { id: 'sul-oeste',    from: 'sul',    to: 'oeste' },
  ],
};

// SSA — Dois fragmentos isolados, hub como ponte
const SSA_PUZZLE: AirportPuzzle = {
  airportId: 'SSA',
  label: 'SALVADOR',
  hubNodeId: 'coord',
  winCondition: 'all_connected',
  nodes: [
    { id: 'coord',   label: 'COORD',   x: 0.5,  y: 0.5,  status: 'active'    },
    { id: 'frag_a1', label: 'FRAG A1', x: 0.15, y: 0.25, status: 'corrupted' },
    { id: 'frag_a2', label: 'FRAG A2', x: 0.15, y: 0.75, status: 'corrupted' },
    { id: 'frag_b1', label: 'FRAG B1', x: 0.85, y: 0.25, status: 'corrupted' },
    { id: 'frag_b2', label: 'FRAG B2', x: 0.85, y: 0.75, status: 'corrupted' },
  ],
  availableEdges: [
    { id: 'coord-frag_a1',    from: 'coord',   to: 'frag_a1' },
    { id: 'coord-frag_b1',    from: 'coord',   to: 'frag_b1' },
    { id: 'frag_a1-frag_a2',  from: 'frag_a1', to: 'frag_a2' },
    { id: 'frag_b1-frag_b2',  from: 'frag_b1', to: 'frag_b2' },
    { id: 'coord-frag_a2',    from: 'coord',   to: 'frag_a2' },
    { id: 'coord-frag_b2',    from: 'coord',   to: 'frag_b2' },
  ],
};

// BSB — Centralidade (boss: dense graph, CENTRAL has max degree)
const BSB_PUZZLE: AirportPuzzle = {
  airportId: 'BSB',
  label: 'BRASÍLIA',
  hubNodeId: 'central',
  winCondition: 'all_connected',
  nodes: [
    { id: 'central', label: 'CENTRAL', x: 0.5,  y: 0.5,  status: 'active'    },
    { id: 'n1',      label: 'NÓ 1',    x: 0.2,  y: 0.15, status: 'corrupted' },
    { id: 'n2',      label: 'NÓ 2',    x: 0.8,  y: 0.15, status: 'corrupted' },
    { id: 'n3',      label: 'NÓ 3',    x: 0.85, y: 0.75, status: 'corrupted' },
    { id: 'n4',      label: 'NÓ 4',    x: 0.15, y: 0.75, status: 'corrupted' },
  ],
  availableEdges: [
    { id: 'central-n1', from: 'central', to: 'n1' },
    { id: 'central-n2', from: 'central', to: 'n2' },
    { id: 'central-n3', from: 'central', to: 'n3' },
    { id: 'central-n4', from: 'central', to: 'n4' },
    { id: 'n1-n2',      from: 'n1',      to: 'n2' },
    { id: 'n2-n3',      from: 'n2',      to: 'n3' },
    { id: 'n3-n4',      from: 'n3',      to: 'n4' },
    { id: 'n4-n1',      from: 'n4',      to: 'n1' },
  ],
};

// GYN — Equilíbrio do hub (two balanced branches)
const GYN_PUZZLE: AirportPuzzle = {
  airportId: 'GYN',
  label: 'GOIÂNIA',
  hubNodeId: 'equil',
  winCondition: 'all_connected',
  nodes: [
    { id: 'equil',   label: 'EQUIL',   x: 0.5,  y: 0.5,  status: 'active'   },
    { id: 'left_1',  label: 'ESQ 1',   x: 0.2,  y: 0.25, status: 'inactive' },
    { id: 'left_2',  label: 'ESQ 2',   x: 0.2,  y: 0.75, status: 'inactive' },
    { id: 'right_1', label: 'DIR 1',   x: 0.8,  y: 0.25, status: 'inactive' },
    { id: 'right_2', label: 'DIR 2',   x: 0.8,  y: 0.75, status: 'inactive' },
  ],
  availableEdges: [
    { id: 'equil-left_1',   from: 'equil',  to: 'left_1'  },
    { id: 'equil-right_1',  from: 'equil',  to: 'right_1' },
    { id: 'left_1-left_2',  from: 'left_1', to: 'left_2'  },
    { id: 'right_1-right_2',from: 'right_1',to: 'right_2' },
    { id: 'equil-left_2',   from: 'equil',  to: 'left_2'  },
    { id: 'equil-right_2',  from: 'equil',  to: 'right_2' },
  ],
};

// CNF — Árvore geradora (spanning tree, no cycles needed)
const CNF_PUZZLE: AirportPuzzle = {
  airportId: 'CNF',
  label: 'CONFINS (BH)',
  hubNodeId: 'raiz',
  winCondition: 'all_connected',
  nodes: [
    { id: 'raiz',     label: 'RAIZ',     x: 0.5,  y: 0.12, status: 'active'   },
    { id: 'branch_a', label: 'RAMO A',   x: 0.25, y: 0.45, status: 'inactive' },
    { id: 'branch_b', label: 'RAMO B',   x: 0.75, y: 0.45, status: 'inactive' },
    { id: 'leaf_1',   label: 'FOLHA 1',  x: 0.15, y: 0.82, status: 'inactive' },
    { id: 'leaf_2',   label: 'FOLHA 2',  x: 0.85, y: 0.82, status: 'inactive' },
  ],
  availableEdges: [
    { id: 'raiz-branch_a',     from: 'raiz',     to: 'branch_a' },
    { id: 'raiz-branch_b',     from: 'raiz',     to: 'branch_b' },
    { id: 'branch_a-leaf_1',   from: 'branch_a', to: 'leaf_1'   },
    { id: 'branch_b-leaf_2',   from: 'branch_b', to: 'leaf_2'   },
    { id: 'branch_a-branch_b', from: 'branch_a', to: 'branch_b' },
    { id: 'leaf_1-leaf_2',     from: 'leaf_1',   to: 'leaf_2'   },
  ],
};

// VIX — Rotas costeiras (chain with branch)
const VIX_PUZZLE: AirportPuzzle = {
  airportId: 'VIX',
  label: 'VITÓRIA',
  hubNodeId: 'porto',
  winCondition: 'all_connected',
  nodes: [
    { id: 'porto',   label: 'PORTO',   x: 0.1,  y: 0.5,  status: 'active'   },
    { id: 'costa_1', label: 'COSTA 1', x: 0.35, y: 0.2,  status: 'inactive' },
    { id: 'costa_2', label: 'COSTA 2', x: 0.65, y: 0.2,  status: 'inactive' },
    { id: 'terra',   label: 'TERRA',   x: 0.5,  y: 0.72, status: 'inactive' },
    { id: 'pista',   label: 'PISTA',   x: 0.9,  y: 0.5,  status: 'inactive' },
  ],
  availableEdges: [
    { id: 'porto-costa_1',  from: 'porto',   to: 'costa_1' },
    { id: 'costa_1-costa_2',from: 'costa_1', to: 'costa_2' },
    { id: 'costa_2-pista',  from: 'costa_2', to: 'pista'   },
    { id: 'porto-terra',    from: 'porto',   to: 'terra'   },
    { id: 'terra-pista',    from: 'terra',   to: 'pista'   },
    { id: 'terra-costa_1',  from: 'terra',   to: 'costa_1' },
  ],
};

// GIG — Resiliência por ciclos (cycle with redundant chord)
const GIG_PUZZLE: AirportPuzzle = {
  airportId: 'GIG',
  label: 'RIO DE JANEIRO',
  hubNodeId: 'nexo',
  winCondition: 'all_connected',
  nodes: [
    { id: 'nexo',   label: 'NEXO',   x: 0.5,  y: 0.5,  status: 'active'   },
    { id: 'anel_1', label: 'ANEL 1', x: 0.5,  y: 0.1,  status: 'inactive' },
    { id: 'anel_2', label: 'ANEL 2', x: 0.88, y: 0.35, status: 'inactive' },
    { id: 'anel_3', label: 'ANEL 3', x: 0.75, y: 0.85, status: 'inactive' },
    { id: 'anel_4', label: 'ANEL 4', x: 0.25, y: 0.85, status: 'inactive' },
    { id: 'anel_5', label: 'ANEL 5', x: 0.12, y: 0.35, status: 'inactive' },
  ],
  availableEdges: [
    { id: 'nexo-anel_1',   from: 'nexo',   to: 'anel_1' },
    { id: 'anel_1-anel_2', from: 'anel_1', to: 'anel_2' },
    { id: 'anel_2-anel_3', from: 'anel_2', to: 'anel_3' },
    { id: 'anel_3-anel_4', from: 'anel_3', to: 'anel_4' },
    { id: 'anel_4-anel_5', from: 'anel_4', to: 'anel_5' },
    { id: 'anel_5-nexo',   from: 'anel_5', to: 'nexo'   },
    { id: 'nexo-anel_3',   from: 'nexo',   to: 'anel_3' },
  ],
};

// CGH — Congestionamento / gargalo (bottleneck star)
const CGH_PUZZLE: AirportPuzzle = {
  airportId: 'CGH',
  label: 'SÃO PAULO CGH',
  hubNodeId: 'gargalo',
  winCondition: 'all_connected',
  nodes: [
    { id: 'gargalo',  label: 'GARGALO',  x: 0.5,  y: 0.5,  status: 'active'    },
    { id: 'entry_1',  label: 'ENTRADA1', x: 0.15, y: 0.2,  status: 'inactive'  },
    { id: 'entry_2',  label: 'ENTRADA2', x: 0.15, y: 0.8,  status: 'inactive'  },
    { id: 'exit_1',   label: 'SAÍDA 1',  x: 0.85, y: 0.2,  status: 'corrupted' },
    { id: 'exit_2',   label: 'SAÍDA 2',  x: 0.85, y: 0.8,  status: 'corrupted' },
  ],
  availableEdges: [
    { id: 'entry_1-gargalo',  from: 'entry_1', to: 'gargalo' },
    { id: 'entry_2-gargalo',  from: 'entry_2', to: 'gargalo' },
    { id: 'gargalo-exit_1',   from: 'gargalo', to: 'exit_1'  },
    { id: 'gargalo-exit_2',   from: 'gargalo', to: 'exit_2'  },
    { id: 'entry_1-entry_2',  from: 'entry_1', to: 'entry_2' },
    { id: 'exit_1-exit_2',    from: 'exit_1',  to: 'exit_2'  },
  ],
};

// GRU — Grafo denso (near-complete graph K5)
const GRU_PUZZLE: AirportPuzzle = {
  airportId: 'GRU',
  label: 'SÃO PAULO GRU',
  hubNodeId: 'malha',
  winCondition: 'all_connected',
  nodes: [
    { id: 'malha', label: 'MALHA', x: 0.5,  y: 0.5,  status: 'active'    },
    { id: 'a',     label: 'NÓ A',  x: 0.2,  y: 0.18, status: 'corrupted' },
    { id: 'b',     label: 'NÓ B',  x: 0.8,  y: 0.18, status: 'corrupted' },
    { id: 'c',     label: 'NÓ C',  x: 0.85, y: 0.78, status: 'corrupted' },
    { id: 'd',     label: 'NÓ D',  x: 0.15, y: 0.78, status: 'corrupted' },
  ],
  availableEdges: [
    { id: 'malha-a', from: 'malha', to: 'a' },
    { id: 'malha-b', from: 'malha', to: 'b' },
    { id: 'malha-c', from: 'malha', to: 'c' },
    { id: 'malha-d', from: 'malha', to: 'd' },
    { id: 'a-b',     from: 'a',     to: 'b' },
    { id: 'b-c',     from: 'b',     to: 'c' },
    { id: 'c-d',     from: 'c',     to: 'd' },
    { id: 'd-a',     from: 'd',     to: 'a' },
    { id: 'a-c',     from: 'a',     to: 'c' },
    { id: 'b-d',     from: 'b',     to: 'd' },
  ],
};

// CWB — BFS (BFS tree: level-by-level)
const CWB_PUZZLE: AirportPuzzle = {
  airportId: 'CWB',
  label: 'CURITIBA',
  hubNodeId: 'raiz',
  winCondition: 'all_connected',
  nodes: [
    { id: 'raiz',   label: 'RAIZ',   x: 0.5,  y: 0.1,  status: 'active'   },
    { id: 'lv1_a',  label: 'N1-A',   x: 0.25, y: 0.42, status: 'inactive' },
    { id: 'lv1_b',  label: 'N1-B',   x: 0.75, y: 0.42, status: 'inactive' },
    { id: 'lv2_a',  label: 'N2-A',   x: 0.12, y: 0.78, status: 'inactive' },
    { id: 'lv2_b',  label: 'N2-B',   x: 0.88, y: 0.78, status: 'inactive' },
  ],
  availableEdges: [
    { id: 'raiz-lv1_a',  from: 'raiz',  to: 'lv1_a' },
    { id: 'raiz-lv1_b',  from: 'raiz',  to: 'lv1_b' },
    { id: 'lv1_a-lv2_a', from: 'lv1_a', to: 'lv2_a' },
    { id: 'lv1_b-lv2_b', from: 'lv1_b', to: 'lv2_b' },
    { id: 'lv1_a-lv2_b', from: 'lv1_a', to: 'lv2_b' },
    { id: 'lv1_b-lv2_a', from: 'lv1_b', to: 'lv2_a' },
  ],
};

// FLN — DFS (deep chain, single path)
const FLN_PUZZLE: AirportPuzzle = {
  airportId: 'FLN',
  label: 'FLORIANÓPOLIS',
  hubNodeId: 'orig',
  winCondition: 'all_connected',
  nodes: [
    { id: 'orig',   label: 'ORIGEM', x: 0.1,  y: 0.5,  status: 'active'   },
    { id: 'deep_1', label: 'D1',     x: 0.33, y: 0.2,  status: 'inactive' },
    { id: 'deep_2', label: 'D2',     x: 0.55, y: 0.5,  status: 'inactive' },
    { id: 'deep_3', label: 'D3',     x: 0.33, y: 0.8,  status: 'inactive' },
    { id: 'end',    label: 'FIM',    x: 0.9,  y: 0.5,  status: 'inactive' },
  ],
  availableEdges: [
    { id: 'orig-deep_1',   from: 'orig',   to: 'deep_1' },
    { id: 'deep_1-deep_2', from: 'deep_1', to: 'deep_2' },
    { id: 'deep_2-deep_3', from: 'deep_2', to: 'deep_3' },
    { id: 'deep_3-end',    from: 'deep_3', to: 'end'    },
    { id: 'orig-deep_3',   from: 'orig',   to: 'deep_3' },
    { id: 'deep_2-end',    from: 'deep_2', to: 'end'    },
  ],
};

// POA — Dijkstra / caminho mínimo (multiple paths with shortcut)
const POA_PUZZLE: AirportPuzzle = {
  airportId: 'POA',
  label: 'PORTO ALEGRE',
  hubNodeId: 'fonte',
  winCondition: 'all_connected',
  nodes: [
    { id: 'fonte', label: 'FONTE', x: 0.1,  y: 0.5,  status: 'active'   },
    { id: 'via_a', label: 'VIA A', x: 0.38, y: 0.18, status: 'inactive' },
    { id: 'via_b', label: 'VIA B', x: 0.38, y: 0.82, status: 'inactive' },
    { id: 'inter', label: 'INTER', x: 0.65, y: 0.5,  status: 'inactive' },
    { id: 'meta',  label: 'META',  x: 0.9,  y: 0.5,  status: 'inactive' },
  ],
  availableEdges: [
    { id: 'fonte-via_a',  from: 'fonte', to: 'via_a' },
    { id: 'fonte-via_b',  from: 'fonte', to: 'via_b' },
    { id: 'via_a-inter',  from: 'via_a', to: 'inter' },
    { id: 'via_b-inter',  from: 'via_b', to: 'inter' },
    { id: 'inter-meta',   from: 'inter', to: 'meta'  },
    { id: 'fonte-inter',  from: 'fonte', to: 'inter' },
  ],
};

// MAO — Ponte crítica (bridge: two clusters, one critical edge)
const MAO_PUZZLE: AirportPuzzle = {
  airportId: 'MAO',
  label: 'MANAUS',
  hubNodeId: 'ponte',
  winCondition: 'all_connected',
  nodes: [
    { id: 'ponte',   label: 'PONTE',   x: 0.5,  y: 0.5,  status: 'active'   },
    { id: 'west_1',  label: 'OESTE 1', x: 0.15, y: 0.25, status: 'inactive' },
    { id: 'west_2',  label: 'OESTE 2', x: 0.15, y: 0.75, status: 'inactive' },
    { id: 'east_1',  label: 'LESTE 1', x: 0.85, y: 0.25, status: 'inactive' },
    { id: 'east_2',  label: 'LESTE 2', x: 0.85, y: 0.75, status: 'inactive' },
  ],
  availableEdges: [
    { id: 'ponte-west_1',   from: 'ponte',  to: 'west_1'  },
    { id: 'ponte-east_1',   from: 'ponte',  to: 'east_1'  },
    { id: 'west_1-west_2',  from: 'west_1', to: 'west_2'  },
    { id: 'east_1-east_2',  from: 'east_1', to: 'east_2'  },
    { id: 'ponte-west_2',   from: 'ponte',  to: 'west_2'  },
    { id: 'ponte-east_2',   from: 'ponte',  to: 'east_2'  },
  ],
};

// BEL — Componentes conexos (two components merged by hub)
const BEL_PUZZLE: AirportPuzzle = {
  airportId: 'BEL',
  label: 'BELÉM',
  hubNodeId: 'juncao',
  winCondition: 'all_connected',
  nodes: [
    { id: 'juncao',   label: 'JUNÇÃO',  x: 0.5,  y: 0.5,  status: 'active'    },
    { id: 'comp_a1',  label: 'COMP A1', x: 0.15, y: 0.22, status: 'corrupted' },
    { id: 'comp_a2',  label: 'COMP A2', x: 0.15, y: 0.78, status: 'corrupted' },
    { id: 'comp_b1',  label: 'COMP B1', x: 0.85, y: 0.22, status: 'corrupted' },
    { id: 'comp_b2',  label: 'COMP B2', x: 0.85, y: 0.78, status: 'corrupted' },
  ],
  availableEdges: [
    { id: 'juncao-comp_a1',    from: 'juncao',  to: 'comp_a1' },
    { id: 'juncao-comp_b1',    from: 'juncao',  to: 'comp_b1' },
    { id: 'comp_a1-comp_a2',   from: 'comp_a1', to: 'comp_a2' },
    { id: 'comp_b1-comp_b2',   from: 'comp_b1', to: 'comp_b2' },
    { id: 'juncao-comp_a2',    from: 'juncao',  to: 'comp_a2' },
    { id: 'juncao-comp_b2',    from: 'juncao',  to: 'comp_b2' },
  ],
};

// PVH — Fronteira norte (isolated outpost star)
const PVH_PUZZLE: AirportPuzzle = {
  airportId: 'PVH',
  label: 'PORTO VELHO',
  hubNodeId: 'base',
  winCondition: 'all_connected',
  nodes: [
    { id: 'base',   label: 'BASE',    x: 0.5,  y: 0.5,  status: 'active'   },
    { id: 'posto1', label: 'POSTO 1', x: 0.5,  y: 0.1,  status: 'inactive' },
    { id: 'posto2', label: 'POSTO 2', x: 0.88, y: 0.65, status: 'inactive' },
    { id: 'posto3', label: 'POSTO 3', x: 0.65, y: 0.9,  status: 'inactive' },
    { id: 'posto4', label: 'POSTO 4', x: 0.12, y: 0.65, status: 'inactive' },
  ],
  availableEdges: [
    { id: 'base-posto1', from: 'base', to: 'posto1' },
    { id: 'base-posto2', from: 'base', to: 'posto2' },
    { id: 'base-posto3', from: 'base', to: 'posto3' },
    { id: 'base-posto4', from: 'base', to: 'posto4' },
  ],
};

// RBR — Nó final (final star, all paths end here)
const RBR_PUZZLE: AirportPuzzle = {
  airportId: 'RBR',
  label: 'RIO BRANCO',
  hubNodeId: 'final',
  winCondition: 'all_connected',
  nodes: [
    { id: 'final',  label: 'FINAL',  x: 0.5,  y: 0.5,  status: 'active'   },
    { id: 'leaf_1', label: 'ROTA 1', x: 0.15, y: 0.2,  status: 'inactive' },
    { id: 'leaf_2', label: 'ROTA 2', x: 0.85, y: 0.2,  status: 'inactive' },
    { id: 'leaf_3', label: 'ROTA 3', x: 0.85, y: 0.8,  status: 'inactive' },
    { id: 'leaf_4', label: 'ROTA 4', x: 0.15, y: 0.8,  status: 'inactive' },
  ],
  availableEdges: [
    { id: 'final-leaf_1', from: 'final', to: 'leaf_1' },
    { id: 'final-leaf_2', from: 'final', to: 'leaf_2' },
    { id: 'final-leaf_3', from: 'final', to: 'leaf_3' },
    { id: 'final-leaf_4', from: 'final', to: 'leaf_4' },
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
  JPA: JPA_PUZZLE,
  NAT: NAT_PUZZLE,
  FOR: FOR_PUZZLE,
  THE: THE_PUZZLE,
  SSA: SSA_PUZZLE,
  BSB: BSB_PUZZLE,
  GYN: GYN_PUZZLE,
  CNF: CNF_PUZZLE,
  VIX: VIX_PUZZLE,
  GIG: GIG_PUZZLE,
  CGH: CGH_PUZZLE,
  GRU: GRU_PUZZLE,
  CWB: CWB_PUZZLE,
  FLN: FLN_PUZZLE,
  POA: POA_PUZZLE,
  MAO: MAO_PUZZLE,
  BEL: BEL_PUZZLE,
  PVH: PVH_PUZZLE,
  RBR: RBR_PUZZLE,
};
