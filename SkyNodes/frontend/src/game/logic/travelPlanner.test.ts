import { describe, expect, it } from 'vitest';
import { findShortestPath } from './travelPlanner';
import type { GameAirport, GameRoute } from '../types';

const mkAirport = (id: string): GameAirport =>
  ({ id, code: id, name: id, city: id, x: 0, y: 0 } as GameAirport);

const mkRoute = (id: string, from: string, to: string, state: GameRoute['state'] = 'restored'): GameRoute =>
  ({ id, from, to, cost: 1, state } as GameRoute);

describe('findShortestPath', () => {
  it('returns null when origin equals destination', () => {
    const airports = [mkAirport('A')];
    expect(findShortestPath('A', 'A', airports, [])).toBeNull();
  });

  it('returns direct 1-hop path', () => {
    const airports = [mkAirport('A'), mkAirport('B')];
    const routes = [mkRoute('AB', 'A', 'B')];
    const result = findShortestPath('A', 'B', airports, routes);
    expect(result?.airportIds).toEqual(['A', 'B']);
    expect(result?.routeIds).toEqual(['AB']);
  });

  it('finds 2-hop path through intermediate', () => {
    const airports = [mkAirport('A'), mkAirport('B'), mkAirport('C')];
    const routes = [mkRoute('AB', 'A', 'B'), mkRoute('BC', 'B', 'C')];
    const result = findShortestPath('A', 'C', airports, routes);
    expect(result?.airportIds).toEqual(['A', 'B', 'C']);
    expect(result?.routeIds).toEqual(['AB', 'BC']);
  });

  it('returns null when no path exists', () => {
    const airports = [mkAirport('A'), mkAirport('B'), mkAirport('C')];
    const routes = [mkRoute('AB', 'A', 'B')];
    expect(findShortestPath('A', 'C', airports, routes)).toBeNull();
  });

  it('ignores locked routes', () => {
    const airports = [mkAirport('A'), mkAirport('B'), mkAirport('C')];
    const routes = [
      mkRoute('AB', 'A', 'B', 'locked'),
      mkRoute('BC', 'B', 'C'),
    ];
    expect(findShortestPath('A', 'C', airports, routes)).toBeNull();
  });

  it('treats available routes as traversable', () => {
    const airports = [mkAirport('A'), mkAirport('B')];
    const routes = [mkRoute('AB', 'A', 'B', 'available')];
    const result = findShortestPath('A', 'B', airports, routes);
    expect(result?.airportIds).toEqual(['A', 'B']);
  });

  it('finds shortest among two valid paths', () => {
    const airports = [mkAirport('A'), mkAirport('B'), mkAirport('C'), mkAirport('D')];
    const routes = [
      mkRoute('AB', 'A', 'B'),
      mkRoute('BD', 'B', 'D'),
      mkRoute('AC', 'A', 'C'),
      mkRoute('CD', 'C', 'D'),
      mkRoute('CB', 'C', 'B'),
    ];
    const result = findShortestPath('A', 'D', airports, routes);
    expect(result?.airportIds).toHaveLength(3);
    expect(result?.airportIds[0]).toBe('A');
    expect(result?.airportIds[2]).toBe('D');
  });
});
