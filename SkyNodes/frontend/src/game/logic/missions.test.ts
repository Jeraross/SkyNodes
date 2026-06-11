import { describe, expect, it } from 'vitest';
import type { GameMission, GameProgress } from '../types';
import { completeAirportTask, completeMissionAtAirport, getActiveMission, isRouteRestored } from './missions';

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
  completedTaskIds: [],
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

  it('completes the Recife tutorial only after all four REC tasks are done', () => {
    const tutorialMissions: GameMission[] = [
      {
        id: 'tutorial-rec',
        title: 'Tutorial Em Recife',
        description: 'Aprenda a mapear rotas em Recife.',
        objectiveAirportId: 'REC',
        unlocksRouteIds: [],
        anomalyRouteIds: [],
        rewardText: 'Rota para JPA liberada.',
      },
      {
        id: 'visit-jpa',
        title: 'Visitar Joao Pessoa',
        description: 'Va para JPA.',
        objectiveAirportId: 'JPA',
        unlocksRouteIds: [],
        anomalyRouteIds: [],
        rewardText: 'JPA alcancada.',
      },
    ];
    const tutorialProgress: GameProgress = {
      ...progress,
      completedTaskIds: [],
      activeMissionId: 'tutorial-rec',
    };

    // Single task does NOT complete the tutorial
    const afterFirst = completeAirportTask(tutorialMissions, tutorialProgress, 'rec-restore-network');
    expect(afterFirst.completedTaskIds).toEqual(['rec-restore-network']);
    expect(afterFirst.completedMissionIds).toEqual([]);
    expect(afterFirst.activeMissionId).toBe('tutorial-rec');

    // All four tasks complete the tutorial and advance to JPA
    const afterAll = [
      'rec-restore-network',
      'rec-calibrate-systems',
      'rec-route-weights',
      'rec-frequency-scan',
    ].reduce(
      (p, taskId) => completeAirportTask(tutorialMissions, p, taskId),
      tutorialProgress,
    );
    expect(afterAll.completedTaskIds).toEqual([
      'rec-restore-network',
      'rec-calibrate-systems',
      'rec-route-weights',
      'rec-frequency-scan',
    ]);
    expect(afterAll.completedMissionIds).toEqual(['tutorial-rec']);
    expect(afterAll.activeMissionId).toBe('visit-jpa');
  });
});
