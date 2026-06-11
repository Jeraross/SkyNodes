import { describe, expect, it } from 'vitest';
import { shouldShowGlobalHud } from './aeroTaleHud';

describe('AeroTaleScreen hud visibility', () => {
  it('hides the global dialogue and action bar inside the airport', () => {
    expect(shouldShowGlobalHud('ENTRAR NO AEROPORTO')).toBe(false);
  });

  it('keeps the global hud visible on map flow actions', () => {
    expect(shouldShowGlobalHud('MAPA')).toBe(true);
    expect(shouldShowGlobalHud('VIAJAR')).toBe(true);
  });
});
