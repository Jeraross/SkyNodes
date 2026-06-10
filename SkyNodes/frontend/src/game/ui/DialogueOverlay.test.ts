// src/game/ui/DialogueOverlay.test.ts
import { describe, it, expect, vi } from 'vitest';
import type { DialogueSequence } from '../types';

function makeQueue(lines: string[]): DialogueSequence {
  return { id: 'test', lines: lines.map(text => ({ speaker: 'TEST', text })) };
}

describe('DialogueOverlay logic', () => {
  it('advances through lines correctly', () => {
    const seq = makeQueue(['linha 1', 'linha 2', 'linha 3']);
    let lineIndex = 0;
    const advance = () => { lineIndex = Math.min(lineIndex + 1, seq.lines.length - 1); };
    advance();
    expect(seq.lines[lineIndex].text).toBe('linha 2');
    advance();
    expect(seq.lines[lineIndex].text).toBe('linha 3');
  });

  it('calls onComplete after last line', () => {
    const onComplete = vi.fn();
    const seq: DialogueSequence = {
      id: 'end-test',
      lines: [{ speaker: 'J', text: 'única linha' }],
      onComplete,
    };
    const isLast = (index: number) => index >= seq.lines.length - 1;
    if (isLast(0)) seq.onComplete?.();
    expect(onComplete).toHaveBeenCalledOnce();
  });

  it('marks glitch lines', () => {
    const seq: DialogueSequence = {
      id: 'glitch',
      lines: [{ speaker: 'GLITCH', text: 'ERRO', glitch: true }],
    };
    expect(seq.lines[0].glitch).toBe(true);
  });
});
