import { describe, expect, it } from 'vitest';
import type { GameAirport } from '../types';
import { isHighlightedAirport, MAP_LABEL_OFFSETS, MAP_POSITIONS } from './WorldMapPanel';

const rec: GameAirport = { id: 'REC', code: 'REC', name: 'Recife', city: 'Recife', region: 'Nordeste', x: 0, y: 0 };
const jpa: GameAirport = { id: 'JPA', code: 'JPA', name: 'Joao Pessoa', city: 'Joao Pessoa', region: 'Nordeste', x: 1, y: 1 };

describe('WorldMapPanel map positions', () => {
  it('places Rio Branco in Acre, southwest of Porto Velho', () => {
    expect(MAP_POSITIONS.RBR.x).toBeLessThan(MAP_POSITIONS.PVH.x);
    expect(MAP_POSITIONS.RBR.y).toBeGreaterThan(MAP_POSITIONS.PVH.y);
  });

  it('offsets labels for dense airport clusters', () => {
    expect(MAP_LABEL_OFFSETS.REC.anchor).toBe('start');
    expect(MAP_LABEL_OFFSETS.JPA.anchor).toBe('start');
    expect(MAP_LABEL_OFFSETS.GRU.anchor).toBe('end');
    expect(MAP_LABEL_OFFSETS.CGH.anchor).toBe('end');
  });

  it('places Sao Paulo airports side by side inside the same state', () => {
    expect(MAP_POSITIONS.GRU.y).toBeLessThan(MAP_POSITIONS.CGH.y);
    expect(MAP_POSITIONS.CGH.x).toBeGreaterThan(MAP_POSITIONS.GRU.x);
  });

  it('highlights only the airport where the player currently is', () => {
    expect(isHighlightedAirport(rec, rec)).toBe(true);
    expect(isHighlightedAirport(jpa, rec)).toBe(false);
  });

});
