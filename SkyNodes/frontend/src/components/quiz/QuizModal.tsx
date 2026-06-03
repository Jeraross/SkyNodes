import { useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import gsap from 'gsap';
import QuizSetup       from './QuizSetup';
import QuizQuestion    from './QuizQuestion';
import QuizFeedback    from './QuizFeedback';
import QuizAchievement from './QuizAchievement';
import QuizResult      from './QuizResult';
import { useQuizEngine } from '../../hooks/useQuizEngine';
import type { QuizCategory, DifficultyFilter } from '../../hooks/useQuizEngine';

const PIXEL = { fontFamily: "'Press Start 2P', monospace" };

interface Props {
  open:            boolean;
  alreadyUnlocked: string[];
  onClose:         () => void;
  onUnlockSticker: (id: string) => void;
  onViewAlbum:     () => void;
}

export default function QuizModal({
  open,
  alreadyUnlocked,
  onClose,
  onUnlockSticker,
  onViewAlbum,
}: Props) {
  const { state, startQuiz, submitAnswer, nextQuestion, continueAfterAchievement, resetQuiz } =
    useQuizEngine();

  const backdropRef = useRef<HTMLDivElement>(null);
  const modalRef    = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    gsap.set(backdropRef.current, { opacity: 0 });
    gsap.set(modalRef.current,    { scale: 0.85, opacity: 0, y: 40 });
    gsap.to(backdropRef.current,  { opacity: 1, duration: 0.25 });
    gsap.to(modalRef.current,     { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: 'back.out(1.2)' });
  }, [open]);

  const handleClose = () => {
    const tl = gsap.timeline({ onComplete: () => { resetQuiz(); onClose(); } });
    tl.to(modalRef.current,    { scale: 0.85, opacity: 0, y: 40, duration: 0.35, ease: 'power2.in' });
    tl.to(backdropRef.current, { opacity: 0, duration: 0.2 }, '-=0.1');
  };

  const handleStart = (category: QuizCategory, difficulty: DifficultyFilter) => {
    startQuiz(category, difficulty, alreadyUnlocked);
  };

  const handleNext = () => {
    nextQuestion();
  };

  const handleContinueAchievement = () => {
    const currentAchievement = state.pendingAchievements[0];
    if (currentAchievement) onUnlockSticker(currentAchievement);
    continueAfterAchievement();
  };

  const handlePlayAgain = () => {
    resetQuiz();
  };

  const handleViewAlbum = () => {
    handleClose();
    setTimeout(onViewAlbum, 400);
  };

  if (!open) return null;

  const question = state.questions[state.currentIndex];
  const isLastQ  = state.currentIndex === state.questions.length - 1;

  return (
    <>
      <div
        ref={backdropRef}
        className="fixed inset-0 z-[49] bg-black/85 backdrop-blur-sm"
        onClick={state.phase === 'idle' ? handleClose : undefined}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <div
          ref={modalRef}
          className="relative pointer-events-auto rounded-2xl overflow-hidden"
          style={{
            width: 'min(640px, 94vw)',
            background: '#0a111f',
            border: '1px solid rgba(6,182,212,0.2)',
            boxShadow: '0 30px 80px rgba(0,0,0,0.95)',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-6 py-4"
            style={{ borderBottom: '1px solid rgba(6,182,212,0.12)' }}
          >
            <p style={{ ...PIXEL, fontSize: 9 }} className="text-cyan-400 tracking-widest">
              {state.phase === 'idle'        && 'QUIZ'}
              {state.phase === 'playing'     && `QUESTAO ${state.currentIndex + 1}`}
              {state.phase === 'feedback'    && `QUESTAO ${state.currentIndex + 1}`}
              {state.phase === 'achievement' && 'CONQUISTA'}
              {state.phase === 'result'      && 'RESULTADO'}
            </p>
            <button
              onClick={handleClose}
              className="bg-transparent border-0 text-slate-500 hover:text-white transition-colors cursor-pointer"
              style={{ ...PIXEL, fontSize: 9 }}
            >
              X
            </button>
          </div>

          {/* Content */}
          <div className="relative" style={{ minHeight: 420 }}>
            <AnimatePresence mode="wait">
              {state.phase === 'idle' && (
                <motion.div
                  key="setup"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.25 }}
                >
                  <QuizSetup onStart={handleStart} />
                </motion.div>
              )}

              {(state.phase === 'playing' || state.phase === 'feedback') && question && (
                <motion.div
                  key={`question-${state.currentIndex}`}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.3 }}
                  className="relative"
                >
                  <QuizQuestion
                    question={question}
                    questionNumber={state.currentIndex + 1}
                    totalQuestions={state.questions.length}
                    streak={state.streak}
                    selectedAnswer={state.selectedAnswer}
                    onAnswer={submitAnswer}
                  />
                  <AnimatePresence>
                    {state.phase === 'feedback' && (
                      <QuizFeedback
                        isCorrect={state.selectedAnswer === question.respostaCorreta}
                        explicacao={question.explicacao}
                        isLastQuestion={isLastQ}
                        onNext={handleNext}
                      />
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              {state.phase === 'achievement' && state.pendingAchievements[0] && (
                <motion.div
                  key={`achievement-${state.pendingAchievements[0]}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="relative"
                  style={{ minHeight: 420 }}
                >
                  <QuizAchievement
                    stickerId={state.pendingAchievements[0]}
                    onContinue={handleContinueAchievement}
                  />
                </motion.div>
              )}

              {state.phase === 'result' && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                >
                  <QuizResult
                    score={state.score}
                    totalQuestions={state.questions.length}
                    unlockedThisSession={state.unlockedThisSession}
                    onPlayAgain={handlePlayAgain}
                    onViewAlbum={handleViewAlbum}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
}
