import { describe, expect, it } from 'vitest';
import { normalizeCombatKey } from '../logic/combatInput';

describe('combat key normalization', () => {
  it('normalizes arrow keys and WASD to lowercase movement keys', () => {
    expect(normalizeCombatKey('ArrowLeft')).toBe('arrowleft');
    expect(normalizeCombatKey('ArrowRight')).toBe('arrowright');
    expect(normalizeCombatKey('W')).toBe('w');
    expect(normalizeCombatKey('d')).toBe('d');
  });
});
