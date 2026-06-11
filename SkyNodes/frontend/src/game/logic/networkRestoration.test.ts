import { describe, expect, it } from 'vitest';
import {
  connectNetworkRoute,
  getNetworkRestorationPuzzle,
  isNetworkRestorationSolved,
  moveNetworkNode,
} from './networkRestoration';

describe('network restoration puzzle', () => {
  it('defines Recife tutorial with all 7 REC routes and all 8 connected nodes', () => {
    const puzzle = getNetworkRestorationPuzzle('rec-restore-network');

    expect(puzzle?.airportId).toBe('REC');
    expect(puzzle?.requiredNodeIds).toEqual(['REC', 'JPA', 'SSA', 'FOR', 'NAT', 'THE', 'GRU', 'BSB']);
    expect(puzzle?.requiredRouteIds).toEqual([
      'route-3', 'route-0', 'route-1', 'route-2', 'route-4', 'route-37', 'route-47',
    ]);
    expect(puzzle?.candidateRoutes.map(route => route.id)).toEqual([
      'route-3', 'route-0', 'route-1', 'route-2', 'route-4', 'route-37', 'route-47',
    ]);
    expect(puzzle?.guidePages.length).toBeGreaterThan(1);
  });

  it('moves nodes inside the canvas bounds', () => {
    const puzzle = getNetworkRestorationPuzzle('rec-restore-network');
    expect(puzzle).toBeTruthy();

    const positions = moveNetworkNode(puzzle!, {}, 'JPA', 999, -40);

    expect(positions.JPA).toEqual({ x: puzzle!.canvas.width, y: 0 });
  });

  it('allows selecting blocked routes and ignores unknown routes', () => {
    const puzzle = getNetworkRestorationPuzzle('rec-restore-network');
    expect(puzzle).toBeTruthy();

    const withBlockedRoute = connectNetworkRoute(puzzle!, [], 'REC', 'SSA');
    const withSafeRoute = connectNetworkRoute(puzzle!, [], 'REC', 'JPA');
    const withUnknownRoute = connectNetworkRoute(puzzle!, [], 'JPA', 'FOR');

    expect(withBlockedRoute).toEqual(['route-0']);
    expect(withSafeRoute).toEqual(['route-3']);
    expect(withUnknownRoute).toEqual([]);
  });

  it('is solved only when all 7 routes are selected', () => {
    const puzzle = getNetworkRestorationPuzzle('rec-restore-network');
    expect(puzzle).toBeTruthy();

    const allRoutes = ['route-3', 'route-0', 'route-1', 'route-2', 'route-4', 'route-37', 'route-47'];
    expect(isNetworkRestorationSolved(puzzle!, ['route-3'])).toBe(false);
    expect(isNetworkRestorationSolved(puzzle!, allRoutes.slice(0, 6))).toBe(false);
    expect(isNetworkRestorationSolved(puzzle!, allRoutes)).toBe(true);
  });

  it('requires every possible route for the current airport and a connected graph over required nodes', () => {
    const puzzle = {
      id: 'test',
      airportId: 'AAA',
      title: 'Teste',
      canvas: { width: 300, height: 200 },
      nodes: [
        { id: 'AAA', label: 'AAA', x: 40, y: 80 },
        { id: 'BBB', label: 'BBB', x: 140, y: 50 },
        { id: 'CCC', label: 'CCC', x: 240, y: 120 },
      ],
      candidateRoutes: [
        { id: 'aaa-bbb', from: 'AAA', to: 'BBB' },
        { id: 'bbb-ccc', from: 'BBB', to: 'CCC' },
        { id: 'aaa-ccc', from: 'AAA', to: 'CCC', blocked: true },
      ],
      requiredNodeIds: ['AAA', 'BBB', 'CCC'],
      requiredRouteIds: ['aaa-bbb', 'bbb-ccc'],
      guidePages: ['Conecte todos.'],
    };

    expect(isNetworkRestorationSolved(puzzle, ['aaa-bbb'])).toBe(false);
    expect(isNetworkRestorationSolved(puzzle, ['aaa-bbb', 'bbb-ccc'])).toBe(true);
    expect(isNetworkRestorationSolved(puzzle, ['aaa-bbb', 'bbb-ccc', 'aaa-ccc'])).toBe(false);
  });
});
