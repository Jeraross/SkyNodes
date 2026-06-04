import { useRef, useEffect, useState } from 'react';
import { useLocation, useParams } from 'wouter';
import { AnimatePresence, motion } from 'motion/react';
import gsap from 'gsap';
import { Flame } from 'lucide-react';
import QuizPresenter3D from '../components/presenter/QuizPresenter3D';
import PowerUps from '../components/quiz/PowerUps';
import { useNodeSession } from '../hooks/useNodeSession';
import { usePathProgress } from '../hooks/usePathProgress';
import { getNodeById } from '../data/quizPathData';
import type { QuizMode } from '../data/quizPathData';

const PIXEL = { fontFamily: "'Press Start 2P', monospace" };
const MONO  = { fontFamily: 'ui-monospace, SFMono-Regular, monospace' };
const LABELS = ['A', 'B', 'C', 'D'] as const;

const AUDIENCE_DIST = (correct: 'A' | 'B' | 'C' | 'D') =>
  Object.fromEntries(
    LABELS.map(l => [l, l === correct ? Math.floor(Math.random() * 20 + 55) : Math.floor(Math.random() * 20)])
  ) as Record<'A' | 'B' | 'C' | 'D', number>;

interface SessionProps {
  mode:         QuizMode;
  nodeId:       string;
  skipsRemaining: number;
  onComplete:   (score: number, total: number) => void;
  onUseSkip:    () => void;
}

function NodeSession({ mode, nodeId, skipsRemaining, onComplete, onUseSkip }: SessionProps) {
  const node = getNodeById(mode, nodeId);
  const count = node?.questionCount ?? 6;
  const {
    state, submitAnswer, nextQuestion, skipQuestion,
    useHint, useEliminate, useAudience,
  } = useNodeSession(mode, count);

  const [presenterState, setPresenterState] = useState<'idle' | 'talking' | 'celebrating' | 'thinking' | 'empathy'>('idle');
  const [dialogueKey, setDialogueKey]       = useState<string | null>(null);
  const [audienceDist, setAudienceDist]     = useState<Record<string, number> | null>(null);
  const [currentHintText, setCurrentHintText] = useState<string | null>(null);

  useEffect(() => {
    if (state.phase === 'complete') {
      onComplete(state.score, state.questions.length);
    }
  }, [state.phase]);

  const handleAnswer = (answer: 'A' | 'B' | 'C' | 'D') => {
    submitAnswer(answer);
    const correct = answer === state.questions[state.currentIndex].respostaCorreta;
    setPresenterState(correct ? 'celebrating' : 'empathy');
    setDialogueKey(correct ? 'correctAnswer' : 'wrongAnswer');
  };

  const handleHint = () => {
    if (state.hintsUsed >= 3) return;
    useHint();
    const hintIndex = state.hintsUsed; // 0,1,2
    // hints are stored inline in question (fallback generic)
    const q = state.questions[state.currentIndex] as any;
    const text = q[`dica_${hintIndex + 1}`] ?? 'Reflita sobre os conceitos envolvidos na pergunta.';
    setCurrentHintText(text);
    setPresenterState('thinking');
    setDialogueKey(`hint${hintIndex + 1}`);
  };

  const handleSkip = () => {
    if (skipsRemaining <= 0) return;
    onUseSkip();
    skipQuestion();
    setPresenterState('idle');
    setDialogueKey('skipUsed');
    setCurrentHintText(null);
    setAudienceDist(null);
  };

  const handleEliminate = () => {
    useEliminate();
    setPresenterState('talking');
    setDialogueKey('powerUpEliminate');
  };

  const handleAudience = () => {
    useAudience();
    const q = state.questions[state.currentIndex];
    setAudienceDist(AUDIENCE_DIST(q.respostaCorreta));
    setPresenterState('talking');
    setDialogueKey('powerUpAudience');
  };

  const handleNext = () => {
    nextQuestion();
    setPresenterState('idle');
    setDialogueKey(null);
    setCurrentHintText(null);
    setAudienceDist(null);
  };

  const q = state.questions[state.currentIndex];
  if (!q) return null;

  const progress = ((state.currentIndex) / state.questions.length) * 100;

  return (
    <div className="flex-1 flex gap-4 px-6 py-4 overflow-hidden">
      {/* Left: question */}
      <div className="flex-1 flex flex-col gap-5 min-w-0">
        {/* Progress */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <p style={{ ...PIXEL, fontSize: 7 }} className="text-slate-500">
              QUESTAO {state.currentIndex + 1}/{state.questions.length}
            </p>
            {state.streak >= 2 && (
              <div className="flex items-center gap-1">
                <Flame size={12} className="text-orange-400" />
                <p style={{ ...PIXEL, fontSize: 7 }} className="text-orange-400">{state.streak}x</p>
              </div>
            )}
          </div>
          <div className="relative h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(6,182,212,0.1)' }}>
            <motion.div
              className="absolute left-0 top-0 h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #22d3ee, #3b82f6)' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Tema */}
        <p style={{ ...PIXEL, fontSize: 7 }} className="text-cyan-500/60">{q.tema.toUpperCase()}</p>

        {/* Pergunta */}
        <p style={{ ...MONO, fontSize: 15 }} className="text-white leading-relaxed">{q.pergunta}</p>

        {/* Audience dist */}
        {audienceDist && (
          <div className="flex gap-2 items-end">
            {LABELS.map(l => (
              <div key={l} className="flex flex-col items-center gap-1 flex-1">
                <p style={{ ...PIXEL, fontSize: 7 }} className="text-violet-400">{audienceDist[l]}%</p>
                <div className="w-full rounded-t" style={{ height: audienceDist[l] * 0.6, background: 'rgba(167,139,250,0.3)', border: '1px solid rgba(167,139,250,0.4)' }} />
                <p style={{ ...PIXEL, fontSize: 7 }} className="text-slate-500">{l}</p>
              </div>
            ))}
          </div>
        )}

        {/* Alternatives */}
        <div className="grid grid-cols-2 gap-3">
          {q.alternativas.map((alt, i) => {
            const label = LABELS[i];
            const isSelected  = state.selectedAnswer === label;
            const isDisabled  = state.phase === 'feedback' || state.eliminatedOpts.includes(label);
            const isCorrect   = state.phase === 'feedback' && label === q.respostaCorreta;
            const isWrong     = state.phase === 'feedback' && isSelected && !isCorrect;
            const isEliminated = state.eliminatedOpts.includes(label);

            let borderColor = 'rgba(6,182,212,0.2)';
            let bg = 'rgba(2,6,23,0.6)';
            let textColor = '#94a3b8';

            if (isEliminated) { borderColor = 'rgba(100,116,139,0.1)'; bg = 'rgba(2,6,23,0.3)'; textColor = '#1e293b'; }
            else if (isCorrect) { borderColor = '#4ade80'; bg = 'rgba(74,222,128,0.12)'; textColor = '#4ade80'; }
            else if (isWrong)   { borderColor = '#f87171'; bg = 'rgba(248,113,113,0.12)'; textColor = '#f87171'; }

            return (
              <motion.button
                key={label}
                onClick={() => !isDisabled && handleAnswer(label)}
                whileHover={!isDisabled ? { scale: 1.02 } : {}}
                whileTap={!isDisabled ? { scale: 0.97 } : {}}
                disabled={isDisabled}
                className="flex items-start gap-3 p-4 rounded-xl border-2 text-left cursor-pointer disabled:cursor-default"
                style={{ borderColor, background: bg, opacity: isEliminated ? 0.25 : 1 }}
              >
                <span style={{ ...PIXEL, fontSize: 8, color: textColor, flexShrink: 0, marginTop: 2 }}>{label}</span>
                <span style={{ ...MONO, fontSize: 13, color: textColor, lineHeight: 1.5 }}>{alt}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Hint text */}
        {currentHintText && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl"
            style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)' }}
          >
            <p style={{ ...MONO, fontSize: 12 }} className="text-yellow-300">{currentHintText}</p>
          </motion.div>
        )}

        {/* Feedback */}
        <AnimatePresence>
          {state.phase === 'feedback' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-3"
            >
              <div className="p-4 rounded-xl" style={{ background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.15)' }}>
                <p style={{ ...MONO, fontSize: 13 }} className="text-slate-300 leading-relaxed">{q.explicacao}</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleNext}
                className="py-3 px-8 self-end rounded-xl border-2 border-cyan-500/60 cursor-pointer"
                style={{ background: 'rgba(6,182,212,0.12)' }}
              >
                <p style={{ ...PIXEL, fontSize: 9 }} className="text-cyan-300">
                  {state.currentIndex === state.questions.length - 1 ? 'CONCLUIR' : 'PROXIMA →'}
                </p>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right: presenter + power-ups */}
      <div className="flex flex-col items-center gap-4 flex-shrink-0 w-36">
        <div className="hidden lg:block">
          <QuizPresenter3D presenterState={presenterState} dialogueKey={dialogueKey} size="compact" />
        </div>
        <PowerUps
          hintsUsed={state.hintsUsed}
          maxHints={3}
          skipsRemaining={skipsRemaining}
          eliminateUsed={state.powerUpsUsed.eliminate}
          audienceUsed={state.powerUpsUsed.audience}
          onHint={handleHint}
          onSkip={handleSkip}
          onEliminate={handleEliminate}
          onAudience={handleAudience}
        />
      </div>
    </div>
  );
}

export default function QuizNodeSession() {
  const [, navigate] = useLocation();
  const params = useParams<{ mode: string; nodeId: string }>();
  const mode   = (params.mode   ?? 'grafos') as QuizMode;
  const nodeId =  params.nodeId ?? 'n1';
  const node   = getNodeById(mode, nodeId);

  const { progress, completeNode, useSkip: consumeSkip } = usePathProgress(mode);
  const skipsRemaining = progress.skipsRemaining;

  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.fromTo(pageRef.current, { x: '100vw', opacity: 0 }, { x: 0, opacity: 1, duration: 0.45, ease: 'power3.out' });
  }, []);

  const goBack = () => {
    gsap.to(pageRef.current, {
      x: '100vw', opacity: 0, duration: 0.35, ease: 'power3.in',
      onComplete: () => navigate(`/quiz/map/${mode}`),
    });
  };

  const handleUseSkip = () => consumeSkip();

  const handleComplete = (score: number, total: number) => {
    completeNode(nodeId);
    sessionStorage.setItem(`node_result_${mode}_${nodeId}`, JSON.stringify({ score, total }));
    gsap.to(pageRef.current, {
      x: '-100vw', opacity: 0, duration: 0.35, ease: 'power3.in',
      onComplete: () => navigate(`/quiz/map/${mode}`),
    });
  };

  return (
    <div ref={pageRef} className="fixed inset-0 z-50 bg-[#020617] flex flex-col">
      {/* Header */}
      <div
        className="flex items-center justify-between px-6 py-4 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(6,182,212,0.12)' }}
      >
        <button onClick={goBack} className="text-slate-500 hover:text-slate-300 cursor-pointer transition-colors">
          <p style={{ ...PIXEL, fontSize: 7 }}>← MAPA</p>
        </button>
        <p style={{ ...PIXEL, fontSize: 9 }} className="text-cyan-400">
          {node?.tema.toUpperCase() ?? 'QUESTOES'}
        </p>
        <p style={{ ...PIXEL, fontSize: 7 }} className="text-slate-500">
          {mode.toUpperCase()} — NO {nodeId.replace('n', '')}
        </p>
      </div>

      <NodeSession
        key={`${mode}-${nodeId}`}
        mode={mode}
        nodeId={nodeId}
        skipsRemaining={skipsRemaining}
        onComplete={handleComplete}
        onUseSkip={handleUseSkip}
      />
    </div>
  );
}
