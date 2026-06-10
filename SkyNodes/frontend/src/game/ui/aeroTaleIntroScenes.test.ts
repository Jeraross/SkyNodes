import { describe, expect, it } from 'vitest';
import { AEROTALE_INTRO_SCENES } from './introScenes';

describe('AeroTale intro scenes', () => {
  it('has exactly 13 scenes', () => {
    expect(AEROTALE_INTRO_SCENES).toHaveLength(13);
  });

  it('opens with the year 2082 setting scene', () => {
    const scene = AEROTALE_INTRO_SCENES[0];
    const copy = [...scene.lines, scene.accent ?? ''].join('\n');
    expect(copy).toContain('2082');
  });

  it('includes the solar storm scene with flash', () => {
    const scene = AEROTALE_INTRO_SCENES[1];
    const copy = scene.lines.join('\n');
    expect(copy).toContain('TEMPESTADE SOLAR');
    expect(scene.flash).toBe(true);
  });

  it('includes the phone call scenes (Agente J and Presidente)', () => {
    const agentScene = AEROTALE_INTRO_SCENES[7];
    const presidentScene = AEROTALE_INTRO_SCENES[8];
    expect(agentScene.lines.join('\n')).toContain('AGENTE J');
    expect(presidentScene.lines.join('\n')).toContain('PRESIDENTE');
  });

  it('ends with the AEROTALE title card', () => {
    const last = AEROTALE_INTRO_SCENES[12];
    expect(last.lines.join('\n')).toContain('AEROTALE');
    expect(last.bigTitle).toBe(true);
  });

  it('does not show terminal progress UI (no loading bars or percentages)', () => {
    for (const scene of AEROTALE_INTRO_SCENES) {
      const copy = [...scene.lines, scene.accent ?? ''].join('\n');
      expect(copy).not.toMatch(/\[[^\]]*[█░][^\]]*\]/);
      expect(copy).not.toMatch(/\d+%/);
      expect(copy).not.toContain('CARREG');
    }
  });
});
