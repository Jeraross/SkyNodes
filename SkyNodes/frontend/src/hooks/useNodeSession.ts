import { useState, useCallback } from 'react';
import { getQuestions } from '../data/quizQuestions';
import type { QuizQuestion } from '../data/quizQuestions';
import type { QuizMode } from '../data/quizPathData';

export type SessionPhase = 'selecting' | 'feedback' | 'complete';

export interface NodeSessionState {
  phase:           SessionPhase;
  questions:       QuizQuestion[];
  currentIndex:    number;
  pendingAnswer:   'A' | 'B' | 'C' | 'D' | null; // selected but not confirmed
  submittedAnswer: 'A' | 'B' | 'C' | 'D' | null; // confirmed
  score:           number;
  streak:          number;
  maxStreak:       number;
  points:          number;
  hintsUsed:       number;   // per question, resets on next
  hintsRevealedThisQ: number[]; // which hint indices shown for current Q
  skippedCount:    number;
  eliminatedOpts:  ('A' | 'B' | 'C' | 'D')[];
  audienceUsed:    boolean;
}

const INITIAL_STATE: NodeSessionState = {
  phase: 'selecting',
  questions: [],
  currentIndex: 0,
  pendingAnswer: null,
  submittedAnswer: null,
  score: 0,
  streak: 0,
  maxStreak: 0,
  points: 0,
  hintsUsed: 0,
  hintsRevealedThisQ: [],
  skippedCount: 0,
  eliminatedOpts: [],
  audienceUsed: false,
};

export function useNodeSession(mode: QuizMode, questionCount: number) {
  const [state, setState] = useState<NodeSessionState>(() => {
    const pool = mode === 'mix' ? 'mix' : mode === 'avd' ? 'avd' : 'grafos';
    const questions = getQuestions(pool, 'all', questionCount);
    return { ...INITIAL_STATE, questions };
  });

  const selectAnswer = useCallback((answer: 'A' | 'B' | 'C' | 'D') => {
    setState(prev => {
      if (prev.phase !== 'selecting') return prev;
      // Toggle deselect
      if (prev.pendingAnswer === answer) return { ...prev, pendingAnswer: null };
      return { ...prev, pendingAnswer: answer };
    });
  }, []);

  const confirmAnswer = useCallback(() => {
    setState(prev => {
      if (prev.phase !== 'selecting' || !prev.pendingAnswer) return prev;
      const q = prev.questions[prev.currentIndex];
      const correct = prev.pendingAnswer === q.respostaCorreta;
      const streak  = correct ? prev.streak + 1 : 0;
      const bonus   = correct ? 100 + streak * 50 : 0;
      return {
        ...prev,
        phase:           'feedback',
        submittedAnswer: prev.pendingAnswer,
        score:           correct ? prev.score + 1 : prev.score,
        streak,
        maxStreak:       Math.max(prev.maxStreak, streak),
        points:          prev.points + bonus,
      };
    });
  }, []);

  const nextQuestion = useCallback(() => {
    setState(prev => {
      const isLast = prev.currentIndex === prev.questions.length - 1;
      if (isLast) return { ...prev, phase: 'complete' };
      return {
        ...prev,
        phase:           'selecting',
        currentIndex:    prev.currentIndex + 1,
        pendingAnswer:   null,
        submittedAnswer: null,
        eliminatedOpts:  [],
        hintsRevealedThisQ: [],
        hintsUsed:       0,
        audienceUsed:    false,
      };
    });
  }, []);

  const skipQuestion = useCallback(() => {
    setState(prev => {
      const isLast = prev.currentIndex === prev.questions.length - 1;
      if (isLast) return { ...prev, phase: 'complete', skippedCount: prev.skippedCount + 1 };
      return {
        ...prev,
        phase:           'selecting',
        currentIndex:    prev.currentIndex + 1,
        pendingAnswer:   null,
        submittedAnswer: null,
        skippedCount:    prev.skippedCount + 1,
        eliminatedOpts:  [],
        hintsRevealedThisQ: [],
        hintsUsed:       0,
        audienceUsed:    false,
      };
    });
  }, []);

  const revealHint = useCallback((hintIdx: number) => {
    setState(prev => {
      if (prev.hintsRevealedThisQ.includes(hintIdx)) return prev;
      return {
        ...prev,
        hintsUsed:          prev.hintsUsed + 1,
        hintsRevealedThisQ: [...prev.hintsRevealedThisQ, hintIdx],
      };
    });
  }, []);

  const useEliminate = useCallback(() => {
    setState(prev => {
      const q = prev.questions[prev.currentIndex];
      const wrong = (['A', 'B', 'C', 'D'] as const)
        .filter(l => l !== q.respostaCorreta && !prev.eliminatedOpts.includes(l));
      return { ...prev, eliminatedOpts: wrong.slice(0, 2) as ('A' | 'B' | 'C' | 'D')[] };
    });
  }, []);

  const useAudience = useCallback(() => {
    setState(prev => ({ ...prev, audienceUsed: true }));
  }, []);

  return { state, selectAnswer, confirmAnswer, nextQuestion, skipQuestion, revealHint, useEliminate, useAudience };
}
