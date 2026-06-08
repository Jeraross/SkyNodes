import { describe, expect, it } from 'vitest';
import { airports as sourceAirports } from '../../data/airports';
import { routes as sourceRoutes } from '../../data/routes';
import { INITIAL_PROGRESS } from '../state/gameProgress';
import { GAME_AIRPORTS, GAME_MISSIONS, GAME_ROUTES, RECIFE_TUTORIAL_MISSION_ID, buildRoutesForProgress } from './aerotaleWorld';

describe('aerotale world data', () => {
  it('uses every airport from the SkyNodes map', () => {
    expect(GAME_AIRPORTS.map(airport => airport.id).sort()).toEqual(
      sourceAirports.map(airport => airport.id).sort(),
    );
  });

  it('starts in Recife and keeps all routes disconnected before any trip', () => {
    expect(INITIAL_PROGRESS.currentAirportId).toBe('REC');
    expect(INITIAL_PROGRESS.activeMissionId).toBe(RECIFE_TUTORIAL_MISSION_ID);
    expect(GAME_MISSIONS[0].objectiveAirportId).toBe('REC');
    expect(INITIAL_PROGRESS.restoredRouteIds).toEqual([]);
    expect(GAME_ROUTES).toHaveLength(sourceRoutes.length);
    expect(GAME_ROUTES.every(route => route.state === 'locked')).toBe(true);
  });

  it('keeps travel locked during Recife tutorial', () => {
    const routes = buildRoutesForProgress(GAME_ROUTES, INITIAL_PROGRESS);

    expect(routes.filter(route => route.state !== 'locked')).toEqual([]);
  });

  it('unlocks only REC to JPA after the Recife tutorial and marks other Recife routes as solar anomalies', () => {
    const tutorialComplete = {
      ...INITIAL_PROGRESS,
      completedMissionIds: [RECIFE_TUTORIAL_MISSION_ID],
      activeMissionId: 'visit-jpa',
    };

    const recRoutes = buildRoutesForProgress(GAME_ROUTES, tutorialComplete)
      .filter(route => route.from === 'REC' || route.to === 'REC');
    const availableRoutes = recRoutes.filter(route => route.state === 'available');
    const blockedRoutes = recRoutes.filter(route => route.state === 'blocked');

    expect(availableRoutes.map(route => [route.from, route.to])).toEqual([['REC', 'JPA']]);
    expect(blockedRoutes.length).toBeGreaterThan(0);
    expect(blockedRoutes.every(route => route.blockReason === 'solar-anomaly')).toBe(true);
  });

  it('visits every airport once as an objective and finishes in Rio Branco', () => {
    const objectives = GAME_MISSIONS.map(mission => mission.objectiveAirportId);

    expect(objectives).toHaveLength(sourceAirports.length);
    expect(objectives[0]).toBe('REC');
    expect(new Set(objectives).size).toBe(objectives.length);
    expect(objectives.at(-1)).toBe('RBR');
  });

  it('unlocks only route ids that exist in the source graph', () => {
    const routeIds = new Set(GAME_ROUTES.map(route => route.id));

    for (const mission of GAME_MISSIONS) {
      if (mission.objectiveAirportId !== 'REC') {
        expect(mission.unlocksRouteIds.length).toBeGreaterThan(0);
      }
      expect(mission.unlocksRouteIds.every(routeId => routeIds.has(routeId))).toBe(true);
    }
  });

  it('places anomalies on the calculated path to each next airport', () => {
    const intro = GAME_MISSIONS[0];
    expect(intro.objectiveAirportId).toBe('REC');
    expect(intro.anomalyRouteIds).toEqual([]);

    for (const mission of GAME_MISSIONS.slice(1)) {
      expect(mission.anomalyRouteIds).toEqual(mission.unlocksRouteIds);
      expect(mission.anomalyRouteIds.length).toBeGreaterThan(0);
    }
  });
});
