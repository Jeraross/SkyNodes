import { describe, expect, it } from 'vitest';
import type { GameAirport, GameRoute } from '../types';
import { buildTravelOptions, calculateTravelPlan } from './travelPlanner';

const airports: GameAirport[] = [
  { id: 'REC', code: 'REC', name: 'Recife', city: 'Recife', region: 'Nordeste', x: 0, y: 0 },
  { id: 'JPA', code: 'JPA', name: 'Joao Pessoa', city: 'Joao Pessoa', region: 'Nordeste', x: 1, y: 1 },
  { id: 'NAT', code: 'NAT', name: 'Natal', city: 'Natal', region: 'Nordeste', x: 2, y: 2 },
  { id: 'SSA', code: 'SSA', name: 'Salvador', city: 'Salvador', region: 'Nordeste', x: 3, y: 3 },
];

const routes: GameRoute[] = [
  { id: 'rec-jpa', from: 'REC', to: 'JPA', cost: 2, state: 'available' },
  { id: 'jpa-nat', from: 'JPA', to: 'NAT', cost: 2, state: 'available' },
  { id: 'rec-ssa', from: 'REC', to: 'SSA', cost: 8, state: 'available' },
];

describe('travel planner', () => {
  it('only offers airports connected by a direct route from the origin', () => {
    expect(buildTravelOptions('REC', airports, routes).map(option => option.airport.id)).toEqual(['JPA', 'SSA']);
  });

  it('hides locked routes but keeps blocked anomaly routes visible as unavailable options', () => {
    const knownRoutes: GameRoute[] = [
      { id: 'rec-jpa', from: 'REC', to: 'JPA', cost: 2, state: 'available' },
      { id: 'rec-ssa', from: 'REC', to: 'SSA', cost: 8, state: 'blocked', blockReason: 'solar-anomaly' },
      { id: 'rec-nat', from: 'REC', to: 'NAT', cost: 3, state: 'locked' },
    ];

    expect(buildTravelOptions('REC', airports, knownRoutes).map(option => [option.airport.id, option.route.state])).toEqual([
      ['JPA', 'available'],
      ['SSA', 'blocked'],
    ]);
  });

  it('calculates a route plan with anomaly and storm costs on edges', () => {
    const plan = calculateTravelPlan({
      airportIds: ['REC', 'JPA', 'NAT'],
      routes,
      anomalyRouteIds: ['rec-jpa'],
      stormRouteIds: ['jpa-nat'],
    });

    expect(plan).toEqual({
      valid: true,
      routeIds: ['rec-jpa', 'jpa-nat'],
      totalCost: 9,
      edges: [
        { routeId: 'rec-jpa', from: 'REC', to: 'JPA', baseCost: 2, anomaly: true, storm: false, finalCost: 5 },
        { routeId: 'jpa-nat', from: 'JPA', to: 'NAT', baseCost: 2, anomaly: false, storm: true, finalCost: 4 },
      ],
    });
  });

  it('rejects plans that skip required connections', () => {
    expect(calculateTravelPlan({ airportIds: ['REC', 'NAT'], routes, anomalyRouteIds: [], stormRouteIds: [] }).valid).toBe(false);
  });

  it('rejects plans through blocked or locked routes', () => {
    expect(calculateTravelPlan({
      airportIds: ['REC', 'SSA'],
      routes: [{ id: 'rec-ssa', from: 'REC', to: 'SSA', cost: 8, state: 'blocked', blockReason: 'solar-anomaly' }],
      anomalyRouteIds: ['rec-ssa'],
      stormRouteIds: [],
    }).valid).toBe(false);
  });
});
