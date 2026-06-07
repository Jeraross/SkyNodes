import { describe, expect, it } from 'vitest';
import type { GameAirport, GameMission } from '../types';
import { buildRetroScreenModel } from './retroScreen';

const rec: GameAirport = {
  id: 'REC',
  code: 'REC',
  name: 'Aeroporto Recife',
  city: 'Recife',
  region: 'Nordeste',
  x: 0,
  y: 0,
};

const mission: GameMission = {
  id: 'first-flight',
  title: 'Primeira Decolagem',
  description: 'Pouse em Salvador para confirmar uma rota simples.',
  objectiveAirportId: 'SSA',
  unlocksRouteIds: ['SSA-BSB'],
  anomalyRouteIds: ['SSA-BSB'],
  rewardText: 'Rota Salvador-Brasilia liberada.',
};

describe('retro screen model', () => {
  it('formats the active game state for the prototype-style HUD', () => {
    const model = buildRetroScreenModel({
      currentAirport: rec,
      activeMission: mission,
      completedCount: 1,
      totalMissions: 4,
      nearbyAirport: null,
      credits: 1200,
      fuel: 80,
    });

    expect(model.stats).toEqual([
      { label: 'LOCAL', value: 'RECIFE', tone: 'green' },
      { label: 'COMBUSTIVEL', value: '80', tone: 'yellow' },
      { label: 'CREDITOS', value: '1200', tone: 'yellow' },
      { label: 'REPUTACAO', value: '1/4', tone: 'cyan' },
    ]);
    expect(model.missionLine).toBe('MISSAO: PRIMEIRA DECOLAGEM');
    expect(model.dialogueSpeaker).toBe('CONTROLADOR CARLOS:');
    expect(model.dialogueLines).toEqual([
      'POUSE EM SALVADOR PARA CONFIRMAR UMA ROTA SIMPLES.',
      'ANOMALIA DETECTADA NO CAMINHO: VALIDE AS CONEXOES DA MALHA.',
      'USE AS SETAS OU CLIQUE NO MAPA PARA NAVEGAR.',
    ]);
  });

  it('prompts landing when the player is near an airport', () => {
    const model = buildRetroScreenModel({
      currentAirport: rec,
      activeMission: mission,
      completedCount: 0,
      totalMissions: 4,
      nearbyAirport: rec,
      credits: 1200,
      fuel: 80,
    });

    expect(model.dialogueLines[2]).toBe('AEROPORTO REC AO ALCANCE. USE VIAJAR PARA POUSAR.');
  });

  it('mentions route anomalies when the active mission path is corrupted', () => {
    const model = buildRetroScreenModel({
      currentAirport: rec,
      activeMission: mission,
      completedCount: 0,
      totalMissions: 4,
      nearbyAirport: null,
      credits: 1200,
      fuel: 80,
    });

    expect(model.dialogueLines[1]).toBe('ANOMALIA DETECTADA NO CAMINHO: VALIDE AS CONEXOES DA MALHA.');
  });
});
