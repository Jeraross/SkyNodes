import { describe, expect, it } from 'vitest';
import {
  connectNetworkRoute,
  getNetworkRestorationPuzzle,
  isNetworkRestorationSolved,
  moveNetworkNode,
} from './networkRestoration';

describe('network restoration puzzle', () => {
  it('defines Recife tutorial as a network restoration canvas with guide pages', () => {
    const puzzle = getNetworkRestorationPuzzle('rec-restore-network');

    expect(puzzle?.airportId).toBe('REC');
    expect(puzzle?.requiredNodeIds).toEqual(['REC', 'JPA']);
    expect(puzzle?.requiredRouteIds).toEqual(['route-3']);
    expect(puzzle?.candidateRoutes.map(route => route.id)).toEqual(['route-3', 'route-0', 'route-1']);
    expect(puzzle?.guidePages.length).toBeGreaterThan(1);
  });

  it('moves nodes inside the canvas bounds', () => {
    const puzzle = getNetworkRestorationPuzzle('rec-restore-network');
    expect(puzzle).toBeTruthy();

    const positions = moveNetworkNode(puzzle!, {}, 'JPA', 999, -40);

    expect(positions.JPA).toEqual({ x: puzzle!.canvas.width, y: 0 });
  });

  it('connects only possible routes and ignores blocked or unknown routes', () => {
    const puzzle = getNetworkRestorationPuzzle('rec-restore-network');
    expect(puzzle).toBeTruthy();

    const withBlockedRoute = connectNetworkRoute(puzzle!, [], 'REC', 'SSA');
    const withRequiredRoute = connectNetworkRoute(puzzle!, [], 'REC', 'JPA');
    const withUnknownRoute = connectNetworkRoute(puzzle!, [], 'JPA', 'FOR');

    expect(withBlockedRoute).toEqual([]);
    expect(withRequiredRoute).toEqual(['route-3']);
    expect(withUnknownRoute).toEqual([]);
    expect(isNetworkRestorationSolved(puzzle!, withBlockedRoute)).toBe(false);
    expect(isNetworkRestorationSolved(puzzle!, withRequiredRoute)).toBe(true);
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
