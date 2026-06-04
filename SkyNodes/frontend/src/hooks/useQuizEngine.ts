import { useState, useCallback } from 'react';
import { getQuestions } from '../data/quizQuestions';
import type { QuizCategory, QuizDifficulty, QuizQuestion } from '../data/quizQuestions';

export type QuizPhase = 'idle' | 'playing' | 'feedback' | 'achievement' | 'result';
export type DifficultyFilter = 'all' | 'Fácil' | 'Médio' | 'Difícil';

export interface QuizState {
  phase: QuizPhase;
  category: QuizCategory | null;
  difficulty: DifficultyFilter;
  questions: QuizQuestion[];
  currentIndex: number;
  selectedAnswer: 'A' | 'B' | 'C' | 'D' | null;
  score: number;
  streak: number;
  maxStreak: number;
  unlockedThisSession: string[];
  pendingAchievements: string[];
}

interface Achievement {
  stickerId: string;
  name: string;
  description: string;
}

const ACHIEVEMENTS: Achievement[] = [
  { stickerId: 'd20',      name: 'Rolou o D20',           description: 'Streak de 3 acertos seguidos' },
  { stickerId: 'pokeball', name: "Gotta Learn 'Em All",   description: 'Completou uma sessao inteira' },
  { stickerId: 'greek',    name: 'Escolhido dos Deuses',  description: 'Sessao de Grafos com 8 ou mais acertos' },
  { stickerId: 'bigben',   name: 'Licenca para Aprender', description: 'Sessao com 7 ou mais acertos' },
  { stickerId: 'spider',   name: 'Sentido de Aranha',     description: 'Streak de 5 acertos seguidos' },
  { stickerId: 'block',    name: 'Sobrevivente',          description: 'Sessao completa no modo Dificil' },
  { stickerId: 'peeper',   name: 'Das Profundezas',       description: '10 de 10 acertos — pontuacao perfeita' },
];

export function getAchievement(stickerId: string): Achievement | undefined {
  return ACHIEVEMENTS.find(a => a.stickerId === stickerId);
}

const INITIAL_STATE: QuizState = {
  phase: 'idle',
  category: null,
  difficulty: 'all',
  questions: [],
  currentIndex: 0,
  selectedAnswer: null,
  score: 0,
  streak: 0,
  maxStreak: 0,
  unlockedThisSession: [],
  pendingAchievements: [],
};

function computeNewAchievements(
  state: QuizState,
  newStreak: number,
  newScore: number,
  isLastQuestion: boolean,
): string[] {
  const already = new Set(state.unlockedThisSession);
  const unlocks: string[] = [];

  const maybe = (id: string) => {
    if (!already.has(id) && !unlocks.includes(id)) unlocks.push(id);
  };

  if (newStreak >= 3) maybe('d20');
  if (newStreak >= 5) maybe('spider');

  if (isLastQuestion) {
    maybe('pokeball');
    if (newScore >= 7) maybe('bigben');
    if (newScore === 10) maybe('peeper');
    if (state.category === 'grafos' && newScore >= 8) maybe('greek');
    if (state.difficulty === 'Difícil') maybe('block');
  }

  return unlocks;
}

export function useQuizEngine() {
  const [state, setState] = useState<QuizState>(INITIAL_STATE);

  const startQuiz = useCallback((category: QuizCategory, difficulty: DifficultyFilter, alreadyUnlocked: string[]) => {
    const questions = getQuestions(
      category,
      difficulty === 'all' ? 'all' : difficulty,
      10,
    );
    setState({
      ...INITIAL_STATE,
      phase: 'playing',
      category,
      difficulty,
      questions,
      unlockedThisSession: [...alreadyUnlocked],
    });
  }, []);

  const submitAnswer = useCallback((answer: 'A' | 'B' | 'C' | 'D') => {
    setState(prev => {
      if (prev.phase !== 'playing') return prev;
      const question = prev.questions[prev.currentIndex];
      const isCorrect = answer === question.respostaCorreta;
      const newStreak  = isCorrect ? prev.streak + 1 : 0;
      const newScore   = isCorrect ? prev.score + 1 : prev.score;
      const newMaxStreak = Math.max(prev.maxStreak, newStreak);
      const isLast = prev.currentIndex === prev.questions.length - 1;

      const newUnlocks = computeNewAchievements(
        { ...prev, score: newScore },
        newStreak,
        newScore,
        isLast,
      );

      return {
        ...prev,
        phase: 'feedback',
        selectedAnswer: answer,
        score: newScore,
        streak: newStreak,
        maxStreak: newMaxStreak,
        unlockedThisSession: [...prev.unlockedThisSession, ...newUnlocks],
        pendingAchievements: newUnlocks,
      };
    });
  }, []);

  const nextQuestion = useCallback(() => {
    setState(prev => {
      if (prev.phase !== 'feedback') return prev;
      if (prev.pendingAchievements.length > 0) {
        return { ...prev, phase: 'achievement' };
      }
      const isLast = prev.currentIndex === prev.questions.length - 1;
      if (isLast) {
        return { ...prev, phase: 'result' };
      }
      return {
        ...prev,
        phase: 'playing',
        currentIndex: prev.currentIndex + 1,
        selectedAnswer: null,
        pendingAchievements: [],
      };
    });
  }, []);

  const continueAfterAchievement = useCallback(() => {
    setState(prev => {
      if (prev.phase !== 'achievement') return prev;
      const remaining = prev.pendingAchievements.slice(1);
      if (remaining.length > 0) {
        return { ...prev, pendingAchievements: remaining };
      }
      const isLast = prev.currentIndex === prev.questions.length - 1;
      if (isLast) {
        return { ...prev, phase: 'result', pendingAchievements: [] };
      }
      return {
        ...prev,
        phase: 'playing',
        currentIndex: prev.currentIndex + 1,
        selectedAnswer: null,
        pendingAchievements: [],
      };
    });
  }, []);

  const resetQuiz = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  return { state, startQuiz, submitAnswer, nextQuestion, continueAfterAchievement, resetQuiz };
}
