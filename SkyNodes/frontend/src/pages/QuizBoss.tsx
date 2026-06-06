import { useRef, useEffect, useState } from 'react';
import { useLocation, useParams } from 'wouter';
import { motion, AnimatePresence } from 'motion/react';
import gsap from 'gsap';
import GraphEditor from '../components/quiz/boss/GraphEditor';
import ChartEditor from '../components/quiz/boss/ChartEditor';
import PropertyChecklist from '../components/quiz/boss/PropertyChecklist';
import QuizPresenter3D from '../components/presenter/QuizPresenter3D';
import { getBossQuestions } from '../data/bossQuestions';
import type { CanvasNode, CanvasEdge, ChartBar, CanvasState } from '../data/bossQuestions';
import type { QuizMode } from '../data/quizPathData';

const PIXEL = { fontFamily: "'Press Start 2P', monospace" };
const MONO  = { fontFamily: 'ui-monospace, SFMono-Regular, monospace' };

function buildInitialBars(enunciado: string): ChartBar[] {
  const matches = [...enunciado.matchAll(/([A-Za-zÀ-ú\s]+)\s*\((\d+)\)/g)];
  return matches.map(m => ({ label: m[1].trim().split(' ').pop()!, value: parseInt(m[2]) }));
}

export default function QuizBoss() {
  const [, navigate] = useLocation();
  const params  = useParams<{ mode: string; bossId: string }>();
  const mode    = (params.mode   ?? 'grafos') as QuizMode;
  const bossId  =  params.bossId ?? 'boss_hard';

  const questions  = getBossQuestions(mode, bossId);
  const [qIndex, setQIndex] = useState(0);
  const question = questions[qIndex];

  const [nodes, setNodes]   = useState<CanvasNode[]>([]);
  const [edges, setEdges]   = useState<CanvasEdge[]>([]);
  const [bars,  setBars]    = useState<ChartBar[]>(() =>
    question?.type === 'chart' ? buildInitialBars(question.enunciado) : [],
  );
  const [hintsUsed, setHintsUsed] = useState(0);
  const [currentHint, setCurrentHint] = useState<string | null>(null);
  const [completed, setCompleted]     = useState(false);
  const [presenterState, setPresenterState] = useState<'idle' | 'talking' | 'celebrating' | 'thinking'>('talking');
  const [dialogueKey, setDialogueKey] = useState<string | null>(
    question?.type === 'graph' ? 'bossIntroGraph' : 'bossIntroChart',
  );

  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.fromTo(pageRef.current, { scale: 0.95, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.2)' });
  }, []);

  if (!question) {
    navigate(`/quiz/result/${mode}`);
    return null;
  }

  const canvasState: CanvasState = { nodes, edges, bars };
  const allOk = question.properties.every(p => p.check(canvasState));

  const handleGraphChange = (n: CanvasNode[], e: CanvasEdge[]) => { setNodes(n); setEdges(e); };
  const handleBarsChange  = (b: ChartBar[]) => setBars(b);

  const handleHint = () => {
    if (hintsUsed >= 3) return;
    setCurrentHint(question.hints[hintsUsed]);
    setHintsUsed(h => h + 1);
    setPresenterState('thinking');
    setDialogueKey(`hint${hintsUsed + 1}`);
  };

  const handleVerify = () => {
    if (!allOk) return;
    setCompleted(true);
    setPresenterState('celebrating');
    setDialogueKey('bossComplete');
  };

  const handleNext = () => {
    if (qIndex < questions.length - 1) {
      const next = questions[qIndex + 1];
      setQIndex(qIndex + 1);
      setNodes([]); setEdges([]);
      setBars(next.type === 'chart' ? buildInitialBars(next.enunciado) : []);
      setHintsUsed(0); setCurrentHint(null); setCompleted(false);
      setPresenterState('talking');
      setDialogueKey(next.type === 'graph' ? 'bossIntroGraph' : 'bossIntroChart');
    } else {
      gsap.to(pageRef.current, {
        scale: 1.05, opacity: 0, duration: 0.3,
        onComplete: () => navigate(`/quiz/result/${mode}`),
      });
    }
  };

  const maxBarValue = Math.max(...bars.map(b => b.value), 100);

  return (
    <div ref={pageRef} className="fixed inset-0 z-50 bg-[#020617] flex flex-col">
      {/* Header */}
      <div
        className="flex items-center justify-between px-6 py-4 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(245,158,11,0.2)' }}
      >
        <p style={{ ...PIXEL, fontSize: 8 }} className="text-yellow-400">NO BOSS</p>
        <p style={{ ...PIXEL, fontSize: 7 }} className="text-slate-400">
          {question.type === 'graph' ? 'CONSTRUCAO DE GRAFO' : 'CONSTRUCAO DE GRAFICO'}
          {questions.length > 1 && ` — ${qIndex + 1}/${questions.length}`}
        </p>
        <button
          onClick={handleHint}
          disabled={hintsUsed >= 3}
          className="px-3 py-1 rounded border cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ borderColor: 'rgba(251,191,36,0.4)', background: 'rgba(251,191,36,0.08)' }}
        >
          <p style={{ ...PIXEL, fontSize: 6 }} className="text-yellow-400">DICA {hintsUsed}/3</p>
        </button>
      </div>

      {/* Main */}
      <div className="flex-1 flex gap-4 px-6 py-4 overflow-hidden min-h-0">
        {/* Left: editor */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          <div
            className="p-4 rounded-xl"
            style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)' }}
          >
            <p style={{ ...MONO, fontSize: 13 }} className="text-white leading-relaxed">{question.enunciado}</p>
          </div>

          {currentHint && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-xl"
              style={{ background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.2)' }}
            >
              <p style={{ ...MONO, fontSize: 12 }} className="text-yellow-300">{currentHint}</p>
            </motion.div>
          )}

          <div className="flex-1 min-h-0">
            {question.type === 'graph' ? (
              <GraphEditor nodes={nodes} edges={edges} onChange={handleGraphChange} />
            ) : (
              <ChartEditor bars={bars} maxValue={maxBarValue} onChange={handleBarsChange} />
            )}
          </div>
        </div>

        {/* Right: checklist + presenter */}
        <div className="flex flex-col gap-4 w-56 flex-shrink-0">
          <PropertyChecklist properties={question.properties} canvasState={canvasState} />

          <div className="hidden lg:flex justify-center">
            <QuizPresenter3D presenterState={presenterState} dialogueKey={dialogueKey} size="compact" />
          </div>

          <AnimatePresence>
            {!completed ? (
              <motion.button
                key="verify"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={handleVerify}
                disabled={!allOk}
                className="w-full py-3 rounded-xl border-2 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                style={{
                  borderColor: allOk ? '#4ade80' : 'rgba(74,222,128,0.2)',
                  background:  allOk ? 'rgba(74,222,128,0.12)' : 'transparent',
                  boxShadow:   allOk ? '0 0 20px rgba(74,222,128,0.25)' : 'none',
                }}
              >
                <p style={{ ...PIXEL, fontSize: 8 }} className={allOk ? 'text-green-400' : 'text-slate-600'}>
                  VERIFICAR
                </p>
              </motion.button>
            ) : (
              <motion.button
                key="next"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
                onClick={handleNext}
                className="w-full py-3 rounded-xl border-2 border-cyan-500/60 cursor-pointer"
                style={{ background: 'rgba(6,182,212,0.15)' }}
              >
                <p style={{ ...PIXEL, fontSize: 8 }} className="text-cyan-300">
                  {qIndex < questions.length - 1 ? 'PROXIMO →' : 'VER RESULTADO →'}
                </p>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
