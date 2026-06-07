import { describe, expect, it } from 'vitest';
import type { GameMission, GameProgress } from '../types';
import { completeMissionAtAirport, getActiveMission, isRouteRestored } from './missions';

const missions: GameMission[] = [
  {
    id: 'first-flight',
    title: 'Primeira Decolagem',
    description: 'Pouse em SSA.',
    objectiveAirportId: 'SSA',
    unlocksRouteIds: ['SSA-BSB'],
    anomalyRouteIds: ['SSA-BSB'],
    rewardText: 'Rota liberada.',
  },
  {
    id: 'hub',
    title: 'Hub',
    description: 'Pouse em BSB.',
    objectiveAirportId: 'BSB',
    requiredRouteId: 'SSA-BSB',
    unlocksRouteIds: [],
    anomalyRouteIds: [],
    rewardText: 'Hub ativo.',
  },
];

const progress: GameProgress = {
  currentAirportId: 'REC',
  restoredRouteIds: [],
  completedMissionIds: [],
  activeMissionId: 'first-flight',
  credits: 1200,
  fuel: 80,
};

describe('missions', () => {
  it('returns active mission', () => {
    expect(getActiveMission(missions, progress)?.id).toBe('first-flight');
  });

  it('does not complete mission at wrong airport', () => {
    expect(completeMissionAtAirport(missions, progress, 'REC')).toEqual(progress);
  });

  it('completes mission and unlocks route at objective airport', () => {
    const next = completeMissionAtAirport(missions, progress, 'SSA');
    expect(next.completedMissionIds).toEqual(['first-flight']);
    expect(next.restoredRouteIds).toEqual(['SSA-BSB']);
    expect(next.activeMissionId).toBe('hub');
  });

  it('checks route restoration', () => {
    expect(isRouteRestored({ ...progress, restoredRouteIds: ['SSA-BSB'] }, 'SSA-BSB')).toBe(true);
  });
});
