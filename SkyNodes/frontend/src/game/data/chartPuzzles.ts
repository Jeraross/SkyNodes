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
};

export function getChartCalibrationPuzzle(taskId: string): ChartCalibrationPuzzle | null {
  return PUZZLES[taskId] ?? null;
}
