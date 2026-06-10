import { describe, expect, it } from 'vitest';
import { getIntroVisual } from './introVisuals';

describe('AeroTale intro visuals', () => {
  it('uses solar visual for the opening year and storm scenes', () => {
    expect(getIntroVisual(0).visualId).toBe('solar');
    expect(getIntroVisual(1).visualId).toBe('solar');
  });

  it('uses telephone visual for the phone call scenes (7-11)', () => {
    for (let i = 7; i <= 11; i++) {
      expect(getIntroVisual(i).visualId).toBe('telephone');
    }
  });

  it('uses title visual for the final title card', () => {
    expect(getIntroVisual(12).visualId).toBe('title');
  });

  it('uses a visible Pixi scene for each cinematic beat', () => {
    for (let sceneIndex = 0; sceneIndex < 13; sceneIndex++) {
      expect(getIntroVisual(sceneIndex).visualId).toBeTruthy();
    }
  });
});
