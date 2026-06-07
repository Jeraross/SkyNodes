import { describe, expect, it } from 'vitest';
import { AIRPORT_MENUS, getAirportMenu } from './airportMenus';

describe('airport menus', () => {
  it('provides distinct NPCs and tasks for key airports', () => {
    expect(getAirportMenu('REC').npcs.map(npc => npc.name)).toContain('Controlador Carlos');
    expect(getAirportMenu('JPA').npcs.map(npc => npc.id)).toContain('prefeito');
    expect(getAirportMenu('BSB').npcs.map(npc => npc.id)).toContain('helena');
    expect(getAirportMenu('GRU').tasks.some(task => task.kind === 'chart')).toBe(true);
    expect(getAirportMenu('MAO').tasks.some(task => task.kind === 'graph')).toBe(true);
  });

  it('provides Twine-like branching dialogue metadata for NPCs', () => {
    const carlos = getAirportMenu('REC').npcs.find(npc => npc.id === 'carlos');

    expect(carlos?.sprite).toBe('carlos');
    expect(carlos?.dialogue.start).toBe('abertura');
    expect(carlos?.dialogue.nodes['antonio-acabei'].speakerId).toBe('antonio');
    expect(carlos?.dialogue.nodes['antonio-acabei'].choices?.length).toBeGreaterThan(1);
  });

  it('falls back to a generic regional airport menu', () => {
    const menu = getAirportMenu('XXX');

    expect(menu.airportId).toBe('XXX');
    expect(menu.npcs.length).toBeGreaterThan(0);
    expect(menu.tasks.length).toBeGreaterThan(0);
  });

  it('keeps all configured airports with shop fuel options', () => {
    for (const menu of Object.values(AIRPORT_MENUS)) {
      expect(menu.shop.fuelOptions.length).toBeGreaterThan(0);
      expect(menu.shop.fuelOptions.every(option => option.amount > 0 && option.cost > 0)).toBe(true);
    }
  });
});
