import { describe, expect, it } from 'vitest';
import { airports as sourceAirports } from '../../data/airports';
import { routes as sourceRoutes } from '../../data/routes';
import { INITIAL_PROGRESS } from '../state/gameProgress';
import { GAME_AIRPORTS, GAME_MISSIONS, GAME_ROUTES } from './aerotaleWorld';

describe('aerotale world data', () => {
  it('uses every airport from the SkyNodes map', () => {
    expect(GAME_AIRPORTS.map(airport => airport.id).sort()).toEqual(
      sourceAirports.map(airport => airport.id).sort(),
    );
  });

  it('starts in Recife and keeps all routes disconnected before any trip', () => {
    expect(INITIAL_PROGRESS.currentAirportId).toBe('REC');
    expect(INITIAL_PROGRESS.activeMissionId).toBe('visit-rec');
    expect(GAME_MISSIONS[0].objectiveAirportId).toBe('REC');
    expect(INITIAL_PROGRESS.restoredRouteIds).toEqual([]);
    expect(GAME_ROUTES).toHaveLength(sourceRoutes.length);
    expect(GAME_ROUTES.every(route => route.state === 'locked')).toBe(true);
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
});
