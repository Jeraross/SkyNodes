import { useRef, useEffect, useState } from 'react';
import { useLocation, useParams } from 'wouter';
import { motion, AnimatePresence } from 'motion/react';
import gsap from 'gsap';
import PathMapGraph from '../components/quiz/PathMapGraph';
import { PATH_DATA, getSuccessors } from '../data/quizPathData';
import type { QuizMode } from '../data/quizPathData';
import { usePathProgress, getNodeStatus } from '../hooks/usePathProgress';
import { SkipForward, Trophy, ChevronRight } from 'lucide-react';

const MODE_LABEL: Record<QuizMode, string> = { avd: 'DADOS', grafos: 'GRAFOS', mix: 'MIX' };
const DIFF_COLOR: Record<string, string> = { 'Fácil': '#4ADE80', 'Médio': '#FFD166', 'Difícil': '#FF4757', 'none': '#7B7899' };

export default function QuizPathMap() {
  const [, navigate] = useLocation();
  const params   = useParams<{ mode: string }>();
  const mode     = (params.mode ?? 'grafos') as QuizMode;
  const pathData = PATH_DATA[mode];
  const { progress, completeNode, useSkip: consumeSkip, reset } = usePathProgress(mode);

  const [decChoice, setDecChoice] = useState<string | null>(null);
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.fromTo(pageRef.current, { x: '-100vw', opacity: 0 }, { x: 0, opacity: 1, duration: 0.45, ease: 'power3.out' });
    // Mark início as completed on first visit
    if (!progress.completedNodeIds.includes('inicio')) {
      completeNode('inicio');
    }
  }, []);

  const goBack = () => gsap.to(pageRef.current, {
    x: '100vw', opacity: 0, duration: 0.35, ease: 'power3.in',
    onComplete: () => navigate('/quiz'),
  });

  const navigateTo = (target: string) => gsap.to(pageRef.current, {
    x: '-100vw', opacity: 0, duration: 0.35, ease: 'power3.in',
    onComplete: () => navigate(target),
  });

  const handleNodeHover = (_id: string | null) => { /* hover handled inside graph */ };

  const handleNodeClick = (nodeId: string) => {
    const node = pathData.nodes.find(n => n.id === nodeId);
    if (!node) return;

    if (node.type === 'decisorio') {
      // Show branch selection overlay
      setDecChoice(nodeId);
      return;
    }
    if (node.type === 'boss') {
      navigateTo(`/quiz/boss/${mode}`);
      return;
    }
    navigateTo(`/quiz/node/${mode}/${nodeId}`);
  };

  const handleBranchChoice = (nextNodeId: string) => {
    // Mark decisório as completed and lock the other branch
    if (decChoice) completeNode(decChoice);
    setDecChoice(null);
    navigateTo(`/quiz/node/${mode}/${nextNodeId}`);
  };

  const completedNormal = progress.completedNodeIds.filter(id => {
    const n = pathData.nodes.find(x => x.id === id);
    return n && (n.type === 'normal' || n.type === 'decisorio');
  }).length;
  const totalNormal = pathData.nodes.filter(n => n.type === 'normal' || n.type === 'decisorio').length;

  // Decisório branch options
  const branchOptions = decChoice
    ? getSuccessors(mode, decChoice).map(id => {
        const node = pathData.nodes.find(n => n.id === id)!;
        const edge = pathData.edges.find(e => e.from === decChoice && e.to === id)!;
        return { node, edge };
      })
    : [];

  return (
    <div ref={pageRef} className="fixed inset-0 z-50 flex flex-col overflow-hidden"
      style={{ background: 'radial-gradient(ellipse 120% 80% at 50% 110%, #080d2a 0%, #050818 60%, #020410 100%)' }}>

      {/* Header */}
      <header className="flex-shrink-0 flex items-center justify-between px-8 py-4"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <button onClick={goBack}
          style={{ fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', cursor: 'pointer', transition: 'color .2s' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
          ← Modos
        </button>

        <p style={{ fontFamily: 'var(--font-display)', fontSize: 22, letterSpacing: '0.08em', color: 'var(--gold)' }}>
          CAMINHO DE {MODE_LABEL[mode]}
        </p>

        <div className="flex items-center gap-5">
          <div className="flex items-center gap-1.5"
            style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-muted)' }}>
            <SkipForward size={13} />
            Pulos: <strong style={{ color: progress.skipsRemaining > 0 ? 'var(--text-primary)' : 'var(--danger)', marginLeft: 4 }}>
              {progress.skipsRemaining}
            </strong>
          </div>
          <div className="flex items-center gap-1.5"
            style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-muted)' }}>
            <Trophy size={13} />
            {completedNormal}/{totalNormal}
          </div>
        </div>
      </header>

      {/* Progress bar */}
      <div className="h-0.5 flex-shrink-0" style={{ background: 'rgba(255,255,255,0.04)' }}>
        <div className="h-full transition-all duration-700"
          style={{ width: `${(completedNormal / Math.max(totalNormal + 1, 1)) * 100}%`,
            background: 'linear-gradient(90deg, var(--gold-warm), var(--gold))' }} />
      </div>

      {/* Main — path map fills all available space */}
      <div className="flex-1 w-full px-6 py-4 overflow-hidden min-h-0" style={{ display: 'flex', alignItems: 'center' }}>
        <PathMapGraph
          pathData={pathData}
          progress={progress}
          onNodeClick={handleNodeClick}
          onNodeHover={handleNodeHover}
        />
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 flex items-center justify-between px-8 py-3"
        style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="flex items-center gap-2">
          <Trophy size={13} style={{ color: 'var(--gold)' }} />
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--text-muted)' }}>
            Recompensa: <span style={{ color: 'var(--gold)', fontWeight: 600 }}>
              {pathData.masteryStickerId.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </span>
          </p>
        </div>
        {completedNormal > 0 && (
          <button onClick={() => { reset(); }}
            style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--text-dim)', cursor: 'pointer' }}>
            Reiniciar
          </button>
        )}
      </div>

      {/* DECISÓRIO branch selection overlay */}
      <AnimatePresence>
        {decChoice && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 flex items-center justify-center"
            style={{ background: 'rgba(5,8,24,0.85)', backdropFilter: 'blur(6px)' }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="flex flex-col gap-5 p-8 rounded-2xl max-w-lg w-full mx-6"
              style={{ background: '#0D0B20', border: '1.5px solid rgba(255,209,102,0.3)', boxShadow: '0 0 40px rgba(255,209,102,0.15)' }}
            >
              <div className="text-center">
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 28, letterSpacing: '0.06em', color: 'var(--gold)' }}>
                  DECISÓRIO
                </p>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                  Escolha um ramo para continuar. Sua escolha é permanente neste caminho.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                {branchOptions.map(({ node, edge }) => (
                  <motion.button
                    key={node.id}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleBranchChoice(node.id)}
                    className="flex items-center justify-between p-4 rounded-xl cursor-pointer"
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: `1.5px solid ${DIFF_COLOR[edge.difficulty]}44`,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = `${DIFF_COLOR[edge.difficulty]}10`; e.currentTarget.style.borderColor = `${DIFF_COLOR[edge.difficulty]}88`; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = `${DIFF_COLOR[edge.difficulty]}44`; }}
                  >
                    <div>
                      <p style={{ fontFamily: 'var(--font-display)', fontSize: 20, letterSpacing: '0.04em', color: 'var(--text-primary)' }}>
                        {node.label}
                      </p>
                      <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                        {node.tema} · {node.questionCount} questões
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                        style={{ fontFamily: 'var(--font-ui)', fontSize: 11, background: `${DIFF_COLOR[edge.difficulty]}18`, color: DIFF_COLOR[edge.difficulty] }}>
                        {edge.difficulty}
                      </span>
                      <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
                    </div>
                  </motion.button>
                ))}
              </div>

              <button
                onClick={() => setDecChoice(null)}
                style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--text-muted)', cursor: 'pointer', alignSelf: 'center' }}>
                ← Voltar ao mapa
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
