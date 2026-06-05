import { useRef, useEffect, useState } from 'react';
import { useLocation, useParams } from 'wouter';
import { motion, AnimatePresence } from 'motion/react';
import gsap from 'gsap';
import { Flame } from 'lucide-react';
import { useNodeSession } from '../hooks/useNodeSession';
import { usePathProgress } from '../hooks/usePathProgress';
import { getNodeById } from '../data/quizPathData';
import type { QuizMode } from '../data/quizPathData';

const LABELS = ['A', 'B', 'C', 'D'] as const;
const HINT_NAMES = ['Conceitual básica', 'Pista mais direta', 'Guia passo a passo'];

function audienceDist(correct: typeof LABELS[number]) {
  return Object.fromEntries(
    LABELS.map(l => [l, l === correct
      ? Math.floor(Math.random() * 20 + 52)
      : Math.floor(Math.random() * 18 + 4)])
  ) as Record<typeof LABELS[number], number>;
}

// ── Answer button ────────────────────────────────────────────────────────────
function AnswerBtn({
  label, text, state: btnState, onClick,
}: {
  label: typeof LABELS[number];
  text: string;
  state: 'idle' | 'selected' | 'correct' | 'wrong' | 'dimmed' | 'eliminated';
  onClick: () => void;
}) {
  const styles: Record<string, { bg: string; border: string; badgeBg: string; badgeColor: string; textColor: string }> = {
    idle:      { bg: 'rgba(255,255,255,0.03)', border: 'rgba(255,255,255,0.09)', badgeBg: 'rgba(255,255,255,0.07)', badgeColor: '#7B7899', textColor: '#C4BFD8' },
    selected:  { bg: 'rgba(255,209,102,0.10)', border: '#FFD166',                badgeBg: 'rgba(255,209,102,0.22)', badgeColor: '#FFD166', textColor: '#FFD166' },
    correct:   { bg: 'rgba(74,222,128,0.12)',  border: '#4ADE80',                badgeBg: 'rgba(74,222,128,0.25)',  badgeColor: '#4ADE80', textColor: '#4ADE80' },
    wrong:     { bg: 'rgba(255,71,87,0.10)',   border: '#FF4757',                badgeBg: 'rgba(255,71,87,0.22)',   badgeColor: '#FF4757', textColor: '#FF4757' },
    dimmed:    { bg: 'rgba(255,255,255,0.02)', border: 'rgba(255,255,255,0.05)', badgeBg: 'rgba(255,255,255,0.04)', badgeColor: '#3D3A5C', textColor: '#3D3A5C' },
    eliminated:{ bg: 'transparent',            border: 'rgba(255,255,255,0.03)', badgeBg: 'transparent',           badgeColor: '#1E1C3A', textColor: '#1E1C3A' },
  };

  const s = styles[btnState] ?? styles.idle;
  const clickable = btnState === 'idle' || btnState === 'selected';

  return (
    <motion.button
      onClick={clickable ? onClick : undefined}
      disabled={!clickable}
      whileHover={clickable ? { x: 4, transition: { duration: 0.12 } } : {}}
      whileTap={clickable ? { scale: 0.985 } : {}}
      className={`flex items-center gap-3.5 w-full px-4 py-3.5 rounded-xl text-left ${btnState === 'wrong' ? '[animation:shake_0.4s_ease]' : ''}`}
      style={{
        background:  s.bg,
        border:      `1.5px solid ${s.border}`,
        cursor:      clickable ? 'pointer' : 'default',
        transition:  'background .15s, border-color .15s',
        opacity:     btnState === 'eliminated' ? 0.2 : 1,
      }}
    >
      {/* Letter badge */}
      <span
        className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
        style={{ fontFamily: 'var(--font-ui)', background: s.badgeBg, color: s.badgeColor, border: `1px solid ${s.badgeColor}44` }}
      >
        {label}
      </span>
      <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: s.textColor, lineHeight: 1.45, flex: 1 }}>
        {text}
      </span>
      {btnState === 'correct' && <span className="text-green-400 text-base">✓</span>}
      {btnState === 'wrong'   && <span className="text-red-400  text-base">✗</span>}
    </motion.button>
  );
}

// ── Inner session (stateful) ─────────────────────────────────────────────────
interface SessionResult { score: number; total: number; points: number }

function NodeSession({
  mode, nodeId, skipsRemaining,
  onComplete, onUseSkip, onPointsChange,
}: {
  mode: QuizMode; nodeId: string; skipsRemaining: number;
  onComplete: (r: SessionResult) => void;
  onUseSkip: () => void;
  onPointsChange: (p: number) => void;
}) {
  const node  = getNodeById(mode, nodeId);
  const count = node?.questionCount ?? 6;
  const {
    state, selectAnswer, confirmAnswer, nextQuestion,
    skipQuestion, revealHint, useEliminate, useAudience,
  } = useNodeSession(mode, count);

  const [audience, setAudience] = useState<Record<string, number> | null>(null);

  // Propagate points
  useEffect(() => { onPointsChange(state.points); }, [state.points]);

  // On complete
  useEffect(() => {
    if (state.phase === 'complete') {
      onComplete({ score: state.score, total: state.questions.length, points: state.points });
    }
  }, [state.phase]);

  const reset = () => { setAudience(null); };

  const handleReveal = (idx: number) => {
    if (state.hintsRevealedThisQ.includes(idx)) return;
    revealHint(idx);
  };

  const handleEliminate = () => { useEliminate(); };
  const handleAudience  = () => {
    const q = state.questions[state.currentIndex];
    setAudience(audienceDist(q.respostaCorreta));
    useAudience();
  };
  const handleSkip = () => { onUseSkip(); skipQuestion(); reset(); };
  const handleNext = () => { nextQuestion(); reset(); };

  const q          = state.questions[state.currentIndex];
  if (!q) return null;
  const inFeedback = state.phase === 'feedback';
  const pct        = (state.currentIndex / state.questions.length) * 100;

  const btnState = (lbl: typeof LABELS[number]) => {
    if (state.eliminatedOpts.includes(lbl))             return 'eliminated' as const;
    if (!inFeedback) return state.pendingAnswer === lbl  ? 'selected'  : 'idle';
    if (lbl === q.respostaCorreta)                       return 'correct';
    if (lbl === state.submittedAnswer)                   return 'wrong';
    return 'dimmed' as const;
  };

  return (
    <>
      {/* ── 2-column body ─────────────────────────────────────────────── */}
      <div className="flex-1 flex min-h-0 overflow-hidden">

        {/* CENTER — Question + Answers */}
        <div className="flex-1 flex flex-col gap-4 px-6 py-5 overflow-y-auto min-w-0">
          {/* Progress */}
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="flex justify-between mb-1.5">
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>
                  Questão {state.currentIndex + 1} / {state.questions.length}
                </span>
                {state.streak >= 2 && (
                  <span className="flex items-center gap-1" style={{ fontFamily: 'var(--font-pixel)', fontSize: 9, color: 'var(--warn)' }}>
                    <Flame size={11} color="var(--warn)" />{state.streak}×
                  </span>
                )}
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <motion.div className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, var(--gold-warm), var(--gold))' }}
                  animate={{ width: `${pct}%` }} transition={{ duration: 0.5 }} />
              </div>
            </div>
          </div>

          {/* Topic tag */}
          <span className="self-start px-3 py-1 rounded-full"
            style={{ fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 600, letterSpacing: '0.07em',
              background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.18)', color: 'var(--teal)' }}>
            {q.tema.toUpperCase()}
          </span>

          {/* Question */}
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 16.5, lineHeight: 1.72, color: 'var(--text-primary)' }}>
            {q.pergunta}
          </p>

          {/* Audience bars */}
          {audience && (
            <div className="flex items-end gap-2 h-16 px-3 pb-1 rounded-xl"
              style={{ background: 'rgba(167,139,250,0.06)', border: '1px solid rgba(167,139,250,0.15)' }}>
              {LABELS.map(l => (
                <div key={l} className="flex flex-col items-center gap-1 flex-1">
                  <span style={{ fontFamily: 'var(--font-ui)', fontSize: 10, fontWeight: 600, color: '#A78BFA' }}>{audience[l]}%</span>
                  <div className="w-full rounded-t" style={{ height: audience[l] * 0.36, background: 'rgba(167,139,250,0.35)', border: '1px solid rgba(167,139,250,0.4)' }} />
                  <span style={{ fontFamily: 'var(--font-ui)', fontSize: 10, color: '#7B7899' }}>{l}</span>
                </div>
              ))}
            </div>
          )}

          {/* Answers — vertical list */}
          <div className="flex flex-col gap-2.5">
            {q.alternativas.map((alt, i) => (
              <AnswerBtn
                key={LABELS[i]}
                label={LABELS[i]} text={alt}
                state={btnState(LABELS[i])}
                onClick={() => !inFeedback && selectAnswer(LABELS[i])}
              />
            ))}
          </div>

          {/* Explanation panel (after answer) */}
          <AnimatePresence>
            {inFeedback && (
              <motion.div
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="px-4 py-4 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: 7 }}>
                  EXPLICAÇÃO
                </p>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, lineHeight: 1.65, color: '#C4BFD8' }}>
                  {q.explicacao}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT — SUAS AÇÕES */}
        <div
          className="flex flex-col gap-5 flex-shrink-0 px-4 py-5 overflow-y-auto"
          style={{ width: 210, borderLeft: '1px solid rgba(255,255,255,0.05)' }}
        >
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 20, letterSpacing: '0.06em', color: 'var(--text-primary)' }}>
            SUAS AÇÕES
          </p>

          {/* Dicas */}
          <div className="flex flex-col gap-2">
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: 2 }}>
              DICAS <span style={{ color: 'var(--gold)' }}>{state.hintsRevealedThisQ.length}/3</span> por rodada
            </p>
            {HINT_NAMES.map((name, i) => {
              const revealed = state.hintsRevealedThisQ.includes(i);
              const disabled = inFeedback;
              return (
                <button key={i} onClick={() => !disabled && handleReveal(i)}
                  disabled={disabled || revealed}
                  className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-left cursor-pointer disabled:cursor-default transition-all"
                  style={{
                    background: revealed ? 'rgba(255,209,102,0.08)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${revealed ? 'rgba(255,209,102,0.3)' : 'rgba(255,255,255,0.07)'}`,
                    opacity: disabled && !revealed ? 0.35 : 1,
                  }}
                  onMouseEnter={e => { if (!disabled && !revealed) e.currentTarget.style.background = 'rgba(255,209,102,0.06)'; }}
                  onMouseLeave={e => { if (!disabled && !revealed) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}>
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ fontFamily: 'var(--font-ui)', background: revealed ? 'rgba(255,209,102,0.2)' : 'rgba(255,255,255,0.05)', color: revealed ? '#FFD166' : '#7B7899' }}>
                    {i + 1}
                  </span>
                  <span style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: revealed ? '#FFD166' : '#7B7899' }}>{name}</span>
                </button>
              );
            })}
          </div>

          <div className="h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />

          {/* Power-ups */}
          <div className="flex flex-col gap-2">
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: 2 }}>
              POWER-UPS
            </p>
            <button onClick={handleEliminate} disabled={state.eliminatedOpts.length > 0 || inFeedback}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl w-full cursor-pointer disabled:opacity-25 disabled:cursor-default transition-all"
              style={{ fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 500, background: 'rgba(255,71,87,0.07)', border: '1px solid rgba(255,71,87,0.18)', color: '#FF4757' }}
              onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.background = 'rgba(255,71,87,0.14)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,71,87,0.07)'; }}>
              ✂ Eliminar 2 opções
            </button>
            <button onClick={handleAudience} disabled={state.audienceUsed || inFeedback}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl w-full cursor-pointer disabled:opacity-25 disabled:cursor-default transition-all"
              style={{ fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 500, background: 'rgba(167,139,250,0.07)', border: '1px solid rgba(167,139,250,0.18)', color: '#A78BFA' }}
              onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.background = 'rgba(167,139,250,0.14)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(167,139,250,0.07)'; }}>
              👥 Consultar plateia
            </button>
          </div>

          <div className="h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />

          {/* Pular */}
          <div className="flex flex-col gap-2">
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: 2 }}>
              PULAR <span style={{ color: skipsRemaining > 0 ? 'var(--teal)' : 'var(--danger)' }}>{skipsRemaining}/2</span> por caminho
            </p>
            <button onClick={handleSkip} disabled={skipsRemaining <= 0 || inFeedback}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl w-full cursor-pointer disabled:opacity-25 disabled:cursor-default transition-all"
              style={{ fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 500, background: 'rgba(34,211,238,0.06)', border: '1px solid rgba(34,211,238,0.18)', color: 'var(--teal)' }}
              onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.background = 'rgba(34,211,238,0.12)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(34,211,238,0.06)'; }}>
              ⏭ Pular esta pergunta
            </button>
          </div>

          {/* Spacer pushes confirm to bottom on right panel too */}
          <div className="flex-1" />

          {/* CONFIRMAR / PRÓXIMA — shown inside right panel for layout coherence */}
          {!inFeedback ? (
            <motion.button
              whileHover={state.pendingAnswer ? { scale: 1.02 } : {}}
              whileTap={state.pendingAnswer ? { scale: 0.98 } : {}}
              onClick={state.pendingAnswer ? confirmAnswer : undefined}
              disabled={!state.pendingAnswer}
              className="gold-btn w-full py-3"
              style={{ fontSize: 14, letterSpacing: '0.06em', opacity: state.pendingAnswer ? 1 : 0.3 }}
            >
              ✓ CONFIRMAR
            </motion.button>
          ) : (
            <motion.button
              initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={handleNext}
              className="gold-btn w-full py-3"
              style={{ fontSize: 14, letterSpacing: '0.06em' }}
            >
              {state.currentIndex === state.questions.length - 1 ? 'CONCLUIR ✓' : 'PRÓXIMA →'}
            </motion.button>
          )}
        </div>
      </div>
    </>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function QuizNodeSession() {
  const [, navigate] = useLocation();
  const params  = useParams<{ mode: string; nodeId: string }>();
  const mode    = (params.mode   ?? 'grafos') as QuizMode;
  const nodeId  =  params.nodeId ?? 'n1';
  const node    = getNodeById(mode, nodeId);

  const { progress, completeNode, useSkip: consumeSkip } = usePathProgress(mode);
  const [points, setPoints] = useState(0);
  const pageRef = useRef<HTMLDivElement>(null);

  const MODE_LABEL: Record<QuizMode, string> = { avd: 'DADOS', grafos: 'GRAFOS', mix: 'MIX' };

  useEffect(() => {
    gsap.fromTo(pageRef.current, { x: '100vw', opacity: 0 }, { x: 0, opacity: 1, duration: 0.4, ease: 'power3.out' });
  }, []);

  const goMap = () => gsap.to(pageRef.current, {
    x: '100vw', opacity: 0, duration: 0.3, ease: 'power3.in',
    onComplete: () => navigate(`/quiz/map/${mode}`),
  });

  const handleComplete = ({ score, total }: { score: number; total: number; points: number }) => {
    completeNode(nodeId);
    sessionStorage.setItem(`node_result_${mode}_${nodeId}`, JSON.stringify({ score, total }));
    gsap.to(pageRef.current, {
      x: '-100vw', opacity: 0, duration: 0.35, ease: 'power3.in',
      onComplete: () => navigate(`/quiz/map/${mode}`),
    });
  };

  return (
    <div ref={pageRef} className="fixed inset-0 z-50 flex flex-col"
      style={{ background: 'radial-gradient(ellipse 120% 80% at 50% 110%, #080d2a 0%, #050818 60%, #020410 100%)' }}>

      {/* ── Header ──────────────────────────────────────────────────── */}
      <header className="flex-shrink-0 flex items-center justify-between px-6 py-3"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 min-w-0 overflow-hidden"
          style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--text-muted)', flex: 1 }}>
          <button onClick={goMap}
            className="hover:text-white transition-colors cursor-pointer whitespace-nowrap"
            style={{ color: 'inherit' }}>
            {MODE_LABEL[mode]}
          </button>
          <span className="opacity-40">›</span>
          <span style={{ color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{node?.label ?? nodeId.toUpperCase()}</span>
          <span className="opacity-40">›</span>
          <span className="truncate" style={{ color: 'var(--teal)', fontWeight: 500 }}>{node?.tema ?? ''}</span>
        </div>

        {/* Counters */}
        <div className="flex items-center gap-3 flex-shrink-0 ml-4">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full"
            style={{ background: 'rgba(255,209,102,0.08)', border: '1px solid rgba(255,209,102,0.2)' }}>
            <span style={{ fontSize: 12 }}>💡</span>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 600, color: 'var(--gold)' }}>DICAS 3/3</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full"
            style={{ background: 'rgba(34,211,238,0.06)', border: '1px solid rgba(34,211,238,0.18)' }}>
            <span style={{ fontSize: 12 }}>⏭</span>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 600, color: 'var(--teal)' }}>
              PULAR {progress.skipsRemaining}/2
            </span>
          </div>
        </div>
      </header>

      {/* ── Body (NodeSession renders 3-column layout) ─────────────── */}
      <NodeSession
        key={`${mode}-${nodeId}`}
        mode={mode}
        nodeId={nodeId}
        skipsRemaining={progress.skipsRemaining}
        onComplete={handleComplete}
        onUseSkip={consumeSkip}
        onPointsChange={setPoints}
      />

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer className="flex-shrink-0 flex items-center justify-between px-6 py-3"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <button onClick={goMap}
          style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-muted)', cursor: 'pointer', transition: 'color .2s' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
          ← Voltar ao Mapa
        </button>

        <div className="flex items-center gap-2">
          <span style={{ fontSize: 16 }}>🪙</span>
          <span style={{ fontFamily: 'var(--font-pixel)', fontSize: 11, color: 'var(--gold)' }}>
            {points.toLocaleString()}
          </span>
        </div>

        {/* Right spacer to balance layout (CONFIRMAR is inside right panel) */}
        <div style={{ width: 120 }} />
      </footer>
    </div>
  );
}
