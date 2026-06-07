import type { GameAirport, GameMission, GameRoute } from '../types';

export const WORLD_SIZE = { width: 1600, height: 1000 };

export const GAME_AIRPORTS: GameAirport[] = [
  { id: 'REC', code: 'REC', name: 'Aeroporto Recife', city: 'Recife', region: 'Nordeste', x: 1215, y: 360 },
  { id: 'SSA', code: 'SSA', name: 'Terminal Salvador', city: 'Salvador', region: 'Nordeste', x: 1120, y: 505 },
  { id: 'NAT', code: 'NAT', name: 'Base Natal', city: 'Natal', region: 'Nordeste', x: 1245, y: 285 },
  { id: 'BSB', code: 'BSB', name: 'Hub Brasilia', city: 'Brasilia', region: 'Centro-Oeste', x: 880, y: 520 },
  { id: 'GRU', code: 'GRU', name: 'Nucleo Guarulhos', city: 'Sao Paulo', region: 'Sudeste', x: 1015, y: 735 },
  { id: 'CNF', code: 'CNF', name: 'Estacao Confins', city: 'Belo Horizonte', region: 'Sudeste', x: 990, y: 640 },
];

export const GAME_ROUTES: GameRoute[] = [
  { id: 'REC-SSA', from: 'REC', to: 'SSA', cost: 2, state: 'available' },
  { id: 'REC-NAT', from: 'REC', to: 'NAT', cost: 1, state: 'available' },
  { id: 'SSA-BSB', from: 'SSA', to: 'BSB', cost: 4, state: 'locked' },
  { id: 'NAT-BSB', from: 'NAT', to: 'BSB', cost: 3, state: 'blocked' },
  { id: 'BSB-CNF', from: 'BSB', to: 'CNF', cost: 2, state: 'locked' },
  { id: 'CNF-GRU', from: 'CNF', to: 'GRU', cost: 2, state: 'locked' },
];

export const GAME_MISSIONS: GameMission[] = [
  {
    id: 'first-flight',
    title: 'Primeira Decolagem',
    description: 'Decole de Recife e pouse em Salvador para confirmar uma rota simples.',
    objectiveAirportId: 'SSA',
    unlocksRouteIds: ['SSA-BSB'],
    rewardText: 'Rota Salvador-Brasilia liberada para restauracao.',
  },
  {
    id: 'restore-hub-route',
    title: 'Rota Para o Hub',
    description: 'Restaure a conexao Salvador-Brasilia e alcance o hub central.',
    objectiveAirportId: 'BSB',
    requiredRouteId: 'SSA-BSB',
    unlocksRouteIds: ['BSB-CNF'],
    rewardText: 'A malha central voltou a responder.',
  },
  {
    id: 'southeast-link',
    title: 'Ligacao Sudeste',
    description: 'Use o hub para chegar a Confins e abrir caminho ate Guarulhos.',
    objectiveAirportId: 'CNF',
    requiredRouteId: 'BSB-CNF',
    unlocksRouteIds: ['CNF-GRU'],
    rewardText: 'Rota final ate Guarulhos desbloqueada.',
  },
  {
    id: 'reach-gru',
    title: 'Nucleo Nacional',
    description: 'Pouse em Guarulhos para completar o primeiro arco da rede.',
    objectiveAirportId: 'GRU',
    requiredRouteId: 'CNF-GRU',
    unlocksRouteIds: [],
    rewardText: 'MVP concluido: a primeira cadeia de aeroportos foi reconstruida.',
  },
];
