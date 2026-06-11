import { describe, expect, it } from 'vitest';
import { COMBAT_ENCOUNTERS } from '../data/combatEncounters';
import { getAtariSprite, getSpriteMetrics } from './atariSprites';

describe('atari sprite catalog', () => {
  it('provides a named pixel sprite for every combat encounter', () => {
    for (const encounter of COMBAT_ENCOUNTERS) {
      const sprite = getAtariSprite(encounter.spriteId);
      const metrics = getSpriteMetrics(sprite);

      expect(metrics.width).toBeGreaterThanOrEqual(12);
      expect(metrics.height).toBeGreaterThanOrEqual(12);
      expect(sprite.rows.join('')).not.toMatch(/[^\s.0-9A-Z]/);
    }
  });

  it('keeps Agente J and Lia as Atari-scale character sprites', () => {
    const agenteJ = getAtariSprite('agente-j');
    const lia = getAtariSprite('lia');

    expect(getSpriteMetrics(agenteJ)).toEqual({ width: 18, height: 24 });
    expect(getSpriteMetrics(lia)).toEqual({ width: 18, height: 24 });
  });

  it('keeps character sprites tall enough to read as people, not square icons', () => {
    for (const id of ['agente-j', 'lia'] as const) {
      const metrics = getSpriteMetrics(getAtariSprite(id));

      expect(metrics.height / metrics.width).toBeGreaterThan(1.25);
      expect(metrics.height / metrics.width).toBeLessThan(1.5);
    }
  });
});
