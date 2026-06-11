export interface ChartBar {
  id: string;
  label: string;
  target: number; // 0-100
  initial: number; // corrupted starting value
}

export interface ChartCalibrationPuzzle {
  id: string;
  title: string;
  tolerance: number; // acceptable distance from target
  bars: ChartBar[];
}

const PUZZLES: Record<string, ChartCalibrationPuzzle> = {
  'rec-calibrate-systems': {
    id: 'rec-calibrate-systems',
    title: 'CALIBRAR SISTEMAS DA TORRE',
    tolerance: 5,
    bars: [
      { id: 'radar',    label: 'RADAR',   target: 75, initial: 18 },
      { id: 'potencia', label: 'POTENC.', target: 88, initial: 12 },
      { id: 'com',      label: 'COM.',    target: 70, initial: 40 },
      { id: 'pista',    label: 'PISTA',   target: 85, initial: 55 },
      { id: 'torre',    label: 'TORRE',   target: 80, initial: 22 },
    ],
  },
  'rec-route-weights': {
    id: 'rec-route-weights',
    title: 'CALIBRAR PESOS DAS ROTAS',
    tolerance: 4,
    // Weights normalized: regional 1.5 → 43, hub 3.0 → 86, inter_regional 3.5 → 100
    bars: [
      { id: 'jpa', label: 'JPA', target: 43, initial: 80 },
      { id: 'ssa', label: 'SSA', target: 43, initial: 20 },
      { id: 'for', label: 'FOR', target: 43, initial: 65 },
      { id: 'gru', label: 'GRU', target: 86, initial: 30 },
      { id: 'bsb', label: 'BSB', target: 100, initial: 55 },
    ],
  },
  'rec-frequency-scan': {
    id: 'rec-frequency-scan',
    title: 'VARREDURA DE FREQUÊNCIAS',
    tolerance: 5,
    bars: [
      { id: 'f12', label: 'F.12', target: 65, initial: 88 },
      { id: 'f24', label: 'F.24', target: 82, initial: 15 },
      { id: 'f36', label: 'F.36', target: 48, initial: 92 },
      { id: 'f48', label: 'F.48', target: 91, initial: 35 },
      { id: 'f60', label: 'F.60', target: 30, initial: 72 },
    ],
  },
  'bsb-map-northeast': {
    id: 'bsb-map-northeast',
    title: 'MAPA DE CONECTIVIDADE DO NORDESTE',
    tolerance: 5,
    bars: [
      { id: 'rec', label: 'REC', target: 70, initial: 30 },
      { id: 'ssa', label: 'SSA', target: 65, initial: 20 },
      { id: 'for', label: 'FOR', target: 60, initial: 45 },
      { id: 'nat', label: 'NAT', target: 55, initial: 15 },
      { id: 'jpa', label: 'JPA', target: 50, initial: 70 },
    ],
  },
  'gru-anomaly-map': {
    id: 'gru-anomaly-map',
    title: 'ANOMALIAS SOLARES — GUARULHOS',
    tolerance: 6,
    bars: [
      { id: 'freq1', label: 'F.1', target: 90, initial: 25 },
      { id: 'freq2', label: 'F.2', target: 45, initial: 80 },
      { id: 'freq3', label: 'F.3', target: 72, initial: 10 },
      { id: 'freq4', label: 'F.4', target: 60, initial: 90 },
    ],
  },

  // JPA — João Pessoa: grau de vértice, isolated nodes
  'jpa-degree-map': {
    id: 'jpa-degree-map',
    title: 'MAPA DE GRAU — JOÃO PESSOA',
    tolerance: 5,
    bars: [
      { id: 'terminal', label: 'TERMINAL', target: 3,  initial: 0 },
      { id: 'pista',    label: 'PISTA',    target: 4,  initial: 0 },
      { id: 'torre',    label: 'TORRE',    target: 2,  initial: 0 },
      { id: 'hangar',   label: 'HANGAR',   target: 1,  initial: 0 },
    ],
  },

  // NAT — Natal: alternating paths, blocked edges
  'nat-path-costs': {
    id: 'nat-path-costs',
    title: 'CUSTO DAS ROTAS — NATAL',
    tolerance: 5,
    bars: [
      { id: 'r1', label: 'ROTA-1', target: 35, initial: 90 },
      { id: 'r2', label: 'ROTA-2', target: 70, initial: 20 },
      { id: 'r3', label: 'ROTA-3', target: 55, initial: 85 },
      { id: 'r4', label: 'ROTA-4', target: 80, initial: 15 },
      { id: 'r5', label: 'ROTA-5', target: 45, initial: 75 },
    ],
  },
  'nat-frequency-restore': {
    id: 'nat-frequency-restore',
    title: 'RESTAURAR FREQUÊNCIAS — NATAL',
    tolerance: 6,
    bars: [
      { id: 'vhf1', label: 'VHF-1', target: 72, initial: 30 },
      { id: 'vhf2', label: 'VHF-2', target: 58, initial: 88 },
      { id: 'uhf1', label: 'UHF-1', target: 85, initial: 22 },
      { id: 'uhf2', label: 'UHF-2', target: 40, initial: 78 },
    ],
  },

  // THE — Teresina
  'the-echo-cancel': {
    id: 'the-echo-cancel',
    title: 'CANCELAR ECOS — TERESINA',
    tolerance: 6,
    bars: [
      { id: 'e1', label: 'ECO-1', target: 50, initial: 95 },
      { id: 'e2', label: 'ECO-2', target: 50, initial:  8 },
      { id: 'e3', label: 'ECO-3', target: 50, initial: 90 },
      { id: 'e4', label: 'ECO-4', target: 50, initial: 12 },
    ],
  },

  // BEL — Belém: connected components
  'bel-component-sync': {
    id: 'bel-component-sync',
    title: 'SINCRONIZAR COMPONENTES — BELÉM',
    tolerance: 5,
    bars: [
      { id: 'comp1',  label: 'COMP.1',  target: 80, initial: 20 },
      { id: 'comp2',  label: 'COMP.2',  target: 80, initial: 55 },
      { id: 'comp3',  label: 'COMP.3',  target: 80, initial: 10 },
      { id: 'trans1', label: 'TRANS.1', target: 60, initial: 90 },
      { id: 'trans2', label: 'TRANS.2', target: 60, initial: 30 },
    ],
  },

  // MAO — Manaus: bridge criticality
  'mao-bridge-strength': {
    id: 'mao-bridge-strength',
    title: 'REFORÇAR PONTES — MANAUS',
    tolerance: 5,
    bars: [
      { id: 'ponte1', label: 'PONTE-1', target: 90, initial: 25 },
      { id: 'ponte2', label: 'PONTE-2', target: 75, initial: 40 },
      { id: 'redund',  label: 'REDUND.',  target: 65, initial:  5 },
      { id: 'backup',  label: 'BACKUP',   target: 85, initial: 15 },
    ],
  },

  // GYN — Goiânia
  'gyn-hub-balance': {
    id: 'gyn-hub-balance',
    title: 'BALANCEAR HUB — GOIÂNIA',
    tolerance: 6,
    bars: [
      { id: 'fluxo',  label: 'FLUXO',  target: 60, initial: 95 },
      { id: 'carga',  label: 'CARGA',  target: 55, initial: 10 },
      { id: 'rota-n', label: 'ROTA-N', target: 70, initial: 30 },
      { id: 'rota-s', label: 'ROTA-S', target: 70, initial: 88 },
    ],
  },

  // CNF — Belo Horizonte (Confins): spanning tree, min edges
  'cnf-tree-construction': {
    id: 'cnf-tree-construction',
    title: 'CONSTRUIR ÁRVORE — CONF.',
    tolerance: 5,
    bars: [
      { id: 'trunk', label: 'TRONCO',  target: 100, initial: 45 },
      { id: 'b1',    label: 'GALHO-1', target:  60, initial: 90 },
      { id: 'b2',    label: 'GALHO-2', target:  60, initial: 15 },
      { id: 'b3',    label: 'GALHO-3', target:  60, initial: 85 },
      { id: 'leaf',  label: 'FOLHA',   target:  40, initial: 75 },
    ],
  },
  'cnf-cycle-detection': {
    id: 'cnf-cycle-detection',
    title: 'DETECTAR CICLOS — CONF.',
    tolerance: 5,
    bars: [
      { id: 'ciclo1', label: 'CICLO-1', target:  0, initial: 65 },
      { id: 'ciclo2', label: 'CICLO-2', target:  0, initial: 78 },
      { id: 'aresta', label: 'ARESTA',  target: 80, initial: 20 },
      { id: 'extra',  label: 'EXTRA',   target:  0, initial: 55 },
    ],
  },

  // VIX — Vitória
  'vix-coastal-freq': {
    id: 'vix-coastal-freq',
    title: 'FREQUÊNCIAS COSTEIRAS — VITÓRIA',
    tolerance: 6,
    bars: [
      { id: 'c1', label: 'COSTA-1', target: 65, initial: 20 },
      { id: 'c2', label: 'COSTA-2', target: 45, initial: 88 },
      { id: 'c3', label: 'COSTA-3', target: 78, initial: 35 },
      { id: 'c4', label: 'COSTA-4', target: 55, initial: 92 },
    ],
  },

  // GIG — Rio de Janeiro (Galeão): multiple paths
  'gig-route-verify': {
    id: 'gig-route-verify',
    title: 'VERIFICAR ROTAS — GALEÃO',
    tolerance: 5,
    bars: [
      { id: 'r-real',   label: 'R.REAL',   target: 90, initial: 20 },
      { id: 'r-falsa1', label: 'R.FALSA-1', target:  0, initial: 75 },
      { id: 'r-falsa2', label: 'R.FALSA-2', target:  0, initial: 60 },
      { id: 'r-alt',    label: 'R.ALT',    target: 75, initial: 10 },
      { id: 'r-sec',    label: 'R.SEC',    target: 60, initial: 85 },
    ],
  },
  'gig-resilience-map': {
    id: 'gig-resilience-map',
    title: 'MAPA DE RESILIÊNCIA — RJ',
    tolerance: 5,
    bars: [
      { id: 'res1', label: 'RES-N', target: 80, initial: 30 },
      { id: 'res2', label: 'RES-S', target: 70, initial: 15 },
      { id: 'res3', label: 'RES-L', target: 85, initial: 50 },
      { id: 'res4', label: 'RES-O', target: 75, initial: 88 },
    ],
  },

  // CGH — Congonhas
  'cgh-traffic-decongest': {
    id: 'cgh-traffic-decongest',
    title: 'DESCONGESTIONAR TRÁFEGO — CGH',
    tolerance: 5,
    bars: [
      { id: 't1', label: 'PISTA-1', target: 50, initial: 95 },
      { id: 't2', label: 'PISTA-2', target: 50, initial: 92 },
      { id: 't3', label: 'PISTA-3', target: 50, initial: 88 },
      { id: 't4', label: 'GATE-A',  target: 45, initial: 90 },
      { id: 't5', label: 'GATE-B',  target: 45, initial: 85 },
    ],
  },

  // GRU — Guarulhos (additional puzzles)
  'gru-dense-optimize': {
    id: 'gru-dense-optimize',
    title: 'OTIMIZAR MALHA DENSA — GRU',
    tolerance: 5,
    bars: [
      { id: 'hub1',   label: 'HUB-1',  target: 70, initial: 95 },
      { id: 'hub2',   label: 'HUB-2',  target: 65, initial: 90 },
      { id: 'hub3',   label: 'HUB-3',  target: 70, initial: 88 },
      { id: 'conn',   label: 'CONEX.', target: 80, initial: 20 },
      { id: 'redund', label: 'REDUND.', target: 30, initial: 85 },
    ],
  },
  'gru-route-prune': {
    id: 'gru-route-prune',
    title: 'PODAR ROTAS EXCEDENTES — GRU',
    tolerance: 6,
    bars: [
      { id: 'excess1', label: 'EXC.1',   target:  0, initial: 70 },
      { id: 'excess2', label: 'EXC.2',   target:  0, initial: 65 },
      { id: 'main1',   label: 'PRINC.1', target: 85, initial: 40 },
      { id: 'main2',   label: 'PRINC.2', target: 80, initial: 35 },
    ],
  },

  // CWB — Curitiba: BFS levels
  'cwb-bfs-levels': {
    id: 'cwb-bfs-levels',
    title: 'NÍVEIS BFS — CURITIBA',
    tolerance: 5,
    bars: [
      { id: 'lv0', label: 'NÍVEL-0', target: 100, initial: 20 },
      { id: 'lv1', label: 'NÍVEL-1', target:  75, initial: 10 },
      { id: 'lv2', label: 'NÍVEL-2', target:  50, initial: 90 },
      { id: 'lv3', label: 'NÍVEL-3', target:  25, initial: 80 },
      { id: 'lv4', label: 'NÍVEL-4', target:  10, initial: 60 },
    ],
  },
  'cwb-fog-clear': {
    id: 'cwb-fog-clear',
    title: 'DISSIPAR NEBLINA — CWB',
    tolerance: 6,
    bars: [
      { id: 'setor1', label: 'SETOR-1', target: 85, initial:  5 },
      { id: 'setor2', label: 'SETOR-2', target: 70, initial: 15 },
      { id: 'setor3', label: 'SETOR-3', target: 55, initial:  8 },
      { id: 'setor4', label: 'SETOR-4', target: 40, initial: 10 },
    ],
  },

  // FLN — Florianópolis: DFS
  'fln-dfs-trace': {
    id: 'fln-dfs-trace',
    title: 'RASTREAR PROFUNDIDADE — FLN',
    tolerance: 5,
    bars: [
      { id: 'd1', label: 'PROF-1', target: 20, initial: 80 },
      { id: 'd2', label: 'PROF-2', target: 45, initial: 15 },
      { id: 'd3', label: 'PROF-3', target: 70, initial: 90 },
      { id: 'd4', label: 'PROF-4', target: 90, initial: 10 },
      { id: 'd5', label: 'PROF-5', target: 65, initial: 85 },
    ],
  },
  'fln-backtrack': {
    id: 'fln-backtrack',
    title: 'RETROCEDER CORRETAMENTE — FLN',
    tolerance: 6,
    bars: [
      { id: 'bk1',  label: 'BECO-1', target:   0, initial: 60 },
      { id: 'bk2',  label: 'BECO-2', target:   0, initial: 55 },
      { id: 'saida', label: 'SAÍDA',  target: 100, initial: 15 },
      { id: 'volta', label: 'VOLTA',  target:  75, initial: 25 },
    ],
  },

  // POA — Porto Alegre: minimum path, weighted
  'poa-path-weights': {
    id: 'poa-path-weights',
    title: 'PESOS DE CAMINHO — P.ALEGRE',
    tolerance: 5,
    bars: [
      { id: 'w1', label: 'PESO-1', target: 30, initial: 85 },
      { id: 'w2', label: 'PESO-2', target: 55, initial: 10 },
      { id: 'w3', label: 'PESO-3', target: 45, initial: 90 },
      { id: 'w4', label: 'PESO-4', target: 70, initial: 20 },
      { id: 'w5', label: 'PESO-5', target: 25, initial: 75 },
    ],
  },
  'poa-minimum-route': {
    id: 'poa-minimum-route',
    title: 'ROTA MÍNIMA — P.ALEGRE',
    tolerance: 5,
    bars: [
      { id: 'custo',      label: 'CUSTO',    target: 35, initial: 80 },
      { id: 'hops',       label: 'SALTOS',   target: 60, initial: 15 },
      { id: 'combustivel', label: 'COMBUST.', target: 45, initial: 88 },
      { id: 'tempo',      label: 'TEMPO',    target: 50, initial: 12 },
    ],
  },

  // PVH — Porto Velho
  'pvh-border-clear': {
    id: 'pvh-border-clear',
    title: 'LIMPAR FRONTEIRA — P.VELHO',
    tolerance: 7,
    bars: [
      { id: 'b1', label: 'FRONT-1', target: 70, initial: 15 },
      { id: 'b2', label: 'FRONT-2', target: 70, initial: 85 },
      { id: 'b3', label: 'FRONT-3', target: 70, initial: 20 },
    ],
  },

  // RBR — Rio Branco
  'rbr-final-node': {
    id: 'rbr-final-node',
    title: 'NÓ FINAL — RIO BRANCO',
    tolerance: 7,
    bars: [
      { id: 'n1', label: 'NÓ-1', target: 100, initial: 25 },
      { id: 'n2', label: 'NÓ-2', target: 100, initial: 40 },
      { id: 'n3', label: 'NÓ-3', target: 100, initial: 10 },
    ],
  },
};

export function getChartCalibrationPuzzle(taskId: string): ChartCalibrationPuzzle | null {
  return PUZZLES[taskId] ?? null;
}
