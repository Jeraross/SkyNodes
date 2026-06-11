import { describe, expect, it } from 'vitest';
import { AIRPORT_MENUS, getAirportMenu } from './airportMenus';

describe('airport menus', () => {
  it('provides distinct NPCs and tasks for key airports', () => {
    expect(getAirportMenu('REC').npcs.map(npc => npc.name)).toContain('Lia');
    expect(getAirportMenu('JPA').npcs.map(npc => npc.id)).toContain('prefeito');
    expect(getAirportMenu('BSB').npcs.map(npc => npc.id)).toContain('helena');
    expect(getAirportMenu('GRU').tasks.some(task => task.kind === 'chart')).toBe(true);
    expect(getAirportMenu('MAO').tasks.some(task => task.kind === 'graph')).toBe(true);
  });

  it('makes Recife a guided tutorial with Lia as the guide NPC', () => {
    const rec = getAirportMenu('REC');

    expect(rec.status).toContain('TUTORIAL');
    expect(rec.npcs.find(npc => npc.id === 'lia')?.role).toContain('Operadora');
    expect(rec.tasks.map(task => [task.id, task.kind])).toEqual([
      ['rec-restore-network', 'restore-network'],
      ['rec-calibrate-systems', 'chart'],
      ['rec-route-weights',    'chart'],
      ['rec-frequency-scan',  'chart'],
    ]);
  });

  it('provides Twine-like branching dialogue metadata for NPCs', () => {
    const lia = getAirportMenu('REC').npcs.find(npc => npc.id === 'lia');

    expect(lia?.sprite).toBe('lia');
    expect(lia?.dialogue.start).toBe('abertura');
    expect(lia?.dialogue.nodes['agente-j-entendido'].speakerId).toBe('agente-j');
    expect(lia?.dialogue.nodes['agente-j-entendido'].choices?.length).toBeGreaterThan(1);
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
