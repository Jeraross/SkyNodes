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
      { label: 'MALHA', value: '1/4', tone: 'cyan' },
    ]);
    expect(model.missionLine).toBe('PROTOCOLO-M: PRIMEIRA DECOLAGEM');
    expect(model.dialogueSpeaker).toBe('LIA:');
    expect(model.dialogueLines).toEqual([
      'PROTOCOLO-M ATIVO. MALHA AEREA BRASILEIRA COMPROMETIDA.',
      'ANOMALIA DETECTADA NO CAMINHO: VALIDE AS CONEXOES DA MALHA.',
      'MOVA-SE PELO MAPA PARA EXPLORAR NOVOS AEROPORTOS.',
    ]);
  });

  it('prompts airport entry when the player is already at the current airport', () => {
    const model = buildRetroScreenModel({
      currentAirport: rec,
      activeMission: mission,
      completedCount: 0,
      totalMissions: 4,
      nearbyAirport: rec,
      credits: 1200,
      fuel: 80,
    });

    expect(model.dialogueLines[2]).toBe('RECIFE ESTA COM O NODO CORROMPIDO. ENTRE NO AEROPORTO E RESTAURE A TORRE.');
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
