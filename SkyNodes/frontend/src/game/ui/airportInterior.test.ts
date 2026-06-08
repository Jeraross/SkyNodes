import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import AirportMenuPanel, { AIRPORT_INTERIOR_ROOMS, getDefaultAirportRoom } from './AirportMenuPanel';
import type { GameAirport } from '../types';

const recAirport: GameAirport = {
  id: 'REC',
  code: 'REC',
  name: 'Aeroporto de Recife',
  city: 'Recife',
  region: 'Nordeste',
  x: 0,
  y: 0,
};

describe('airport interior rooms', () => {
  it('keeps the REC tutorial focused on the control tower', () => {
    expect(getDefaultAirportRoom('REC')).toBe('tower');
    const tower = AIRPORT_INTERIOR_ROOMS.find(room => room.id === 'tower');

    expect(tower?.npcIds).toContain('carlos');
    expect(tower?.detail).toBe('npcs');
  });

  it('exposes the expected airport room grid', () => {
    expect(AIRPORT_INTERIOR_ROOMS.map(room => room.id)).toEqual([
      'terminal',
      'tower',
      'tasks',
      'workshop',
      'shop',
      'exit',
    ]);
    expect(AIRPORT_INTERIOR_ROOMS.find(room => room.id === 'tasks')?.detail).toBe('tasks');
  });

  it('does not render a bottom airport action bar', () => {
    const html = renderToStaticMarkup(
      createElement(AirportMenuPanel, {
        airport: recAirport,
        completedTaskIds: [],
        onCompleteTask: () => undefined,
        onBuyFuel: () => undefined,
      }),
    );

    expect(html).not.toContain('aria-label="Acoes do aeroporto"');
  });

  it('does not render credits and fuel in the airport interior header', () => {
    const html = renderToStaticMarkup(
      createElement(AirportMenuPanel, {
        airport: recAirport,
        completedTaskIds: [],
        onCompleteTask: () => undefined,
        onBuyFuel: () => undefined,
      }),
    );

    expect(html).not.toContain('C$1200');
    expect(html).not.toContain('F80');
  });
});
