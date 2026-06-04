import { useState, useCallback } from 'react';
import { getQuestions } from '../data/quizQuestions';
import type { QuizQuestion, QuizDifficulty } from '../data/quizQuestions';
import type { QuizMode } from '../data/quizPathData';

export type SessionPhase = 'playing' | 'feedback' | 'complete';

export interface NodeSessionState {
  phase:           SessionPhase;
  questions:       QuizQuestion[];
  currentIndex:    number;
  selectedAnswer:  'A' | 'B' | 'C' | 'D' | null;
  score:           number;
  streak:          number;
  maxStreak:       number;
  hintsUsed:       number;
  skippedCount:    number;
  powerUpsUsed:    { eliminate: boolean; audience: boolean };
  eliminatedOpts:  ('A' | 'B' | 'C' | 'D')[];
}

const INITIAL_STATE: NodeSessionState = {
  phase: 'playing',
  questions: [],
  currentIndex: 0,
  selectedAnswer: null,
  score: 0,
  streak: 0,
  maxStreak: 0,
  hintsUsed: 0,
  skippedCount: 0,
  powerUpsUsed: { eliminate: false, audience: false },
  eliminatedOpts: [],
};

const CATEGORY_MAP: Record<QuizMode, 'grafos' | 'avd' | 'mix'> = {
  grafos: 'grafos', avd: 'avd', mix: 'mix',
};

export function useNodeSession(mode: QuizMode, questionCount: number) {
  const [state, setState] = useState<NodeSessionState>(() => {
    const questions = getQuestions(CATEGORY_MAP[mode], 'all', questionCount);
    return { ...INITIAL_STATE, questions };
  });

  const submitAnswer = useCallback((answer: 'A' | 'B' | 'C' | 'D') => {
    setState(prev => {
      if (prev.phase !== 'playing') return prev;
      const q = prev.questions[prev.currentIndex];
      const correct = answer === q.respostaCorreta;
      const streak  = correct ? prev.streak + 1 : 0;
      return {
        ...prev,
        phase: 'feedback',
        selectedAnswer: answer,
        score:     correct ? prev.score + 1 : prev.score,
        streak,
        maxStreak: Math.max(prev.maxStreak, streak),
      };
    });
  }, []);

  const nextQuestion = useCallback(() => {
    setState(prev => {
      const isLast = prev.currentIndex === prev.questions.length - 1;
      if (isLast) return { ...prev, phase: 'complete' };
      return {
        ...prev,
        phase: 'playing',
        currentIndex:  prev.currentIndex + 1,
        selectedAnswer: null,
        eliminatedOpts: [],
        powerUpsUsed: { eliminate: false, audience: false },
      };
    });
  }, []);

  const skipQuestion = useCallback(() => {
    setState(prev => {
      const isLast = prev.currentIndex === prev.questions.length - 1;
      if (isLast) return { ...prev, phase: 'complete', skippedCount: prev.skippedCount + 1 };
      return {
        ...prev,
        phase: 'playing',
        currentIndex:  prev.currentIndex + 1,
        selectedAnswer: null,
        skippedCount:  prev.skippedCount + 1,
        eliminatedOpts: [],
        powerUpsUsed: { eliminate: false, audience: false },
      };
    });
  }, []);

  const useHint = useCallback(() => {
    setState(prev => ({ ...prev, hintsUsed: prev.hintsUsed + 1 }));
  }, []);

  const useEliminate = useCallback(() => {
    setState(prev => {
      if (prev.powerUpsUsed.eliminate) return prev;
      const q = prev.questions[prev.currentIndex];
      const wrong = (['A', 'B', 'C', 'D'] as const)
        .filter(l => l !== q.respostaCorreta && !prev.eliminatedOpts.includes(l));
      const toElim = wrong.slice(0, 2) as ('A' | 'B' | 'C' | 'D')[];
      return { ...prev, eliminatedOpts: toElim, powerUpsUsed: { ...prev.powerUpsUsed, eliminate: true } };
    });
  }, []);

  const useAudience = useCallback(() => {
    setState(prev => ({ ...prev, powerUpsUsed: { ...prev.powerUpsUsed, audience: true } }));
  }, []);

  return { state, submitAnswer, nextQuestion, skipQuestion, useHint, useEliminate, useAudience };
}
