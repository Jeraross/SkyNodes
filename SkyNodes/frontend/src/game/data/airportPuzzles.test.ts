// src/game/data/airportPuzzles.test.ts
import { describe, it, expect } from 'vitest';
import { RECIFE_PUZZLE, checkWinCondition } from './airportPuzzles';

describe('RECIFE_PUZZLE', () => {
  it('has 5 nodes', () => {
    expect(RECIFE_PUZZLE.nodes).toHaveLength(5);
  });

  it('has torre as hub', () => {
    expect(RECIFE_PUZZLE.hubNodeId).toBe('torre');
    const hub = RECIFE_PUZZLE.nodes.find(n => n.id === 'torre');
    expect(hub).toBeDefined();
  });

  it('has 4 available edges all from/to torre', () => {
    expect(RECIFE_PUZZLE.availableEdges).toHaveLength(4);
    const allConnectToTorre = RECIFE_PUZZLE.availableEdges.every(
      e => e.from === 'torre' || e.to === 'torre'
    );
    expect(allConnectToTorre).toBe(true);
  });

  it('radar node starts as corrupted', () => {
    const radar = RECIFE_PUZZLE.nodes.find(n => n.id === 'radar');
    expect(radar?.status).toBe('corrupted');
  });
});

describe('checkWinCondition', () => {
  it('returns false with no edges', () => {
    expect(checkWinCondition(RECIFE_PUZZLE, [])).toBe(false);
  });

  it('returns false when only 3 of 4 edges created', () => {
    const edges = ['torre-terminal', 'torre-pista', 'torre-gerador'];
    expect(checkWinCondition(RECIFE_PUZZLE, edges)).toBe(false);
  });

  it('returns true when all 4 edges created', () => {
    const edges = ['torre-terminal', 'torre-radar', 'torre-pista', 'torre-gerador'];
    expect(checkWinCondition(RECIFE_PUZZLE, edges)).toBe(true);
  });
});
