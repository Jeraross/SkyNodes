import { describe, expect, it } from 'vitest';
import type { GameAirport, GameRoute } from '../types';
import { distance, findNearbyAirport, routeConnectsAirport } from './navigation';

const airports: GameAirport[] = [
  { id: 'REC', code: 'REC', name: 'Recife', city: 'Recife', region: 'NE', x: 100, y: 100 },
  { id: 'SSA', code: 'SSA', name: 'Salvador', city: 'Salvador', region: 'NE', x: 200, y: 100 },
];

const route: GameRoute = { id: 'REC-SSA', from: 'REC', to: 'SSA', cost: 2, state: 'available' };

describe('navigation', () => {
  it('computes Euclidean distance', () => {
    expect(distance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
  });

  it('finds an airport inside landing radius', () => {
    expect(findNearbyAirport({ x: 112, y: 100 }, airports, 24)?.id).toBe('REC');
  });

  it('returns null when no airport is close enough', () => {
    expect(findNearbyAirport({ x: 150, y: 150 }, airports, 24)).toBeNull();
  });

  it('checks whether a route touches an airport', () => {
    expect(routeConnectsAirport(route, 'REC')).toBe(true);
    expect(routeConnectsAirport(route, 'BSB')).toBe(false);
  });
});
