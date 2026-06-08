import { describe, expect, it } from 'vitest';
import { getGraphPuzzleForTask, isGraphPuzzleSolved, placeGraphPuzzleToken } from './graphPuzzle';

describe('graph puzzle', () => {
  it('provides Recife tutorial puzzles for graph tasks', () => {
    expect(getGraphPuzzleForTask('rec-identify-nodes')?.slots.map(slot => slot.id)).toEqual(['node-a', 'node-b']);
    expect(getGraphPuzzleForTask('rec-identify-edges')?.slots.map(slot => slot.id)).toEqual(['from', 'edge', 'to']);
    expect(getGraphPuzzleForTask('rec-validate-jpa-route')?.slots.map(slot => slot.id)).toEqual(['origin', 'safe-edge', 'destination']);
  });

  it('places tokens only when the slot accepts them', () => {
    const puzzle = getGraphPuzzleForTask('rec-validate-jpa-route');
    expect(puzzle).toBeTruthy();

    const rejected = placeGraphPuzzleToken(puzzle!, {}, 'safe-edge', 'rec');
    const accepted = placeGraphPuzzleToken(puzzle!, {}, 'safe-edge', 'route-rec-jpa');

    expect(rejected).toEqual({});
    expect(accepted).toEqual({ 'safe-edge': 'route-rec-jpa' });
  });

  it('solves a puzzle only when every slot has an accepted token', () => {
    const puzzle = getGraphPuzzleForTask('rec-validate-jpa-route');
    expect(puzzle).toBeTruthy();

    expect(isGraphPuzzleSolved(puzzle!, { origin: 'rec', destination: 'jpa' })).toBe(false);
    expect(isGraphPuzzleSolved(puzzle!, {
      origin: 'rec',
      'safe-edge': 'route-rec-jpa',
      destination: 'jpa',
    })).toBe(true);
  });
});
