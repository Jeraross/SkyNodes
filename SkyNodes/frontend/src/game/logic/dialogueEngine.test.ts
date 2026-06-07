import { describe, expect, it } from 'vitest';
import { chooseDialogueOption, getDialogueNode, type DialogueScript } from './dialogueEngine';

const script: DialogueScript = {
  start: 'intro',
  nodes: {
    intro: {
      speakerId: 'carlos',
      text: 'A rede caiu.',
      next: 'question',
    },
    question: {
      speakerId: 'antonio',
      text: 'O que fazemos?',
      choices: [
        { label: 'Validar caminho', next: 'graph' },
        { label: 'Comprar combustivel', next: 'shop' },
      ],
    },
    graph: {
      speakerId: 'carlos',
      text: 'Comece pelos vizinhos.',
    },
    shop: {
      speakerId: 'ana',
      text: 'A loja fica no terminal.',
    },
  },
};

describe('dialogue engine', () => {
  it('gets the starting node', () => {
    expect(getDialogueNode(script, script.start)?.text).toBe('A rede caiu.');
  });

  it('advances through linear dialogue', () => {
    expect(chooseDialogueOption(script, 'intro', null)).toBe('question');
  });

  it('branches through choices', () => {
    expect(chooseDialogueOption(script, 'question', 0)).toBe('graph');
    expect(chooseDialogueOption(script, 'question', 1)).toBe('shop');
  });

  it('stays on current node when a choice is invalid', () => {
    expect(chooseDialogueOption(script, 'question', 99)).toBe('question');
  });
});
