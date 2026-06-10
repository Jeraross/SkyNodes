import { describe, it, expect } from 'vitest';
import type { AirportStatus, DialogueLine, DialogueSequence, GameAirport } from './types';

describe('AirportStatus', () => {
  it('accepts all six valid status values', () => {
    const statuses: AirportStatus[] = [
      'unknown', 'detected', 'corrupted', 'disconnected', 'connected', 'completed',
    ];
    expect(statuses).toHaveLength(6);
  });
});

describe('DialogueSequence', () => {
  it('accepts a sequence with glitch lines', () => {
    const seq: DialogueSequence = {
      id: 'test',
      lines: [
        { speaker: 'AGENTE_J', text: 'Olá' },
        { speaker: 'GLITCH_FRAGMENTO', text: 'ERRO', glitch: true },
      ],
    };
    expect(seq.lines[1].glitch).toBe(true);
  });
});

describe('GameAirport', () => {
  it('accepts status field', () => {
    const airport: GameAirport = {
      id: 'REC', code: 'REC', name: 'Recife', city: 'Recife',
      region: 'Nordeste', x: 0, y: 0, status: 'connected',
    };
    expect(airport.status).toBe('connected');
  });
});
