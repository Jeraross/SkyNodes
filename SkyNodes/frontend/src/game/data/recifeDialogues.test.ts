import { describe, it, expect } from 'vitest';
import {
  RECIFE_CHEGADA,
  RECIFE_TUTORIAL_VERTICES,
  RECIFE_TUTORIAL_ARESTAS,
  RECIFE_GLITCH_APARECE,
  RECIFE_PRE_PUZZLE,
  RECIFE_ENCERRAMENTO,
  ALL_RECIFE_DIALOGUES,
} from './recifeDialogues';

describe('Recife dialogues', () => {
  it('exports 6 sequences', () => {
    expect(ALL_RECIFE_DIALOGUES).toHaveLength(6);
  });

  it('each sequence has a unique id', () => {
    const ids = ALL_RECIFE_DIALOGUES.map(s => s.id);
    expect(new Set(ids).size).toBe(6);
  });

  it('RECIFE_CHEGADA has at least 10 lines (chegada + encontro Lia)', () => {
    expect(RECIFE_CHEGADA.lines.length).toBeGreaterThanOrEqual(10);
  });

  it('RECIFE_GLITCH_APARECE has glitch lines', () => {
    const hasGlitch = RECIFE_GLITCH_APARECE.lines.some(l => l.glitch === true);
    expect(hasGlitch).toBe(true);
  });

  it('RECIFE_ENCERRAMENTO mentions pizza', () => {
    const hasPizza = RECIFE_ENCERRAMENTO.lines.some(l =>
      l.text.toLowerCase().includes('pizza')
    );
    expect(hasPizza).toBe(true);
  });

  it('no sequence has empty lines', () => {
    for (const seq of ALL_RECIFE_DIALOGUES) {
      for (const line of seq.lines) {
        expect(line.text.trim().length).toBeGreaterThan(0);
      }
    }
  });
});
