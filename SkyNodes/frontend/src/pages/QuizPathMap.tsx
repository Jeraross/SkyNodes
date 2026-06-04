import { useRef, useEffect, useState } from 'react';
import { useLocation, useParams } from 'wouter';
import gsap from 'gsap';
import PathMapGraph from '../components/quiz/PathMapGraph';
import QuizPresenter3D from '../components/presenter/QuizPresenter3D';
import { PATH_DATA } from '../data/quizPathData';
import type { QuizMode } from '../data/quizPathData';
import { usePathProgress } from '../hooks/usePathProgress';
import { useQuizGame } from '../router/QuizGameContext';

const PIXEL = { fontFamily: "'Press Start 2P', monospace" };

export default function QuizPathMap() {
  const [, navigate] = useLocation();
  const params = useParams<{ mode: string }>();
  const mode   = (params.mode ?? 'grafos') as QuizMode;

  const pathData = PATH_DATA[mode];
  const { progress, completeNode, useSkip } = usePathProgress(mode);
  const { unlockSticker } = useQuizGame();

  const [hoveredNode, setHoveredNode]   = useState<string | null>(null);
  const [dialogueKey, setDialogueKey]   = useState<string | null>('nodeHover');
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.fromTo(pageRef.current, { x: '-100vw', opacity: 0 }, { x: 0, opacity: 1, duration: 0.45, ease: 'power3.out' });
  }, []);

  const goBack = () => {
    gsap.to(pageRef.current, {
      x: '100vw', opacity: 0, duration: 0.35, ease: 'power3.in',
      onComplete: () => navigate('/quiz'),
    });
  };

  const handleNodeHover = (nodeId: string | null) => {
    setHoveredNode(nodeId);
    setDialogueKey(nodeId ? 'nodeHover' : null);
  };

  const handleNodeClick = (nodeId: string) => {
    if (nodeId === 'boss') {
      gsap.to(pageRef.current, {
        scale: 1.05, opacity: 0, duration: 0.3, ease: 'power2.in',
        onComplete: () => navigate(`/quiz/boss/${mode}`),
      });
    } else {
      gsap.to(pageRef.current, {
        x: '-100vw', opacity: 0, duration: 0.35, ease: 'power3.in',
        onComplete: () => navigate(`/quiz/node/${mode}/${nodeId}`),
      });
    }
  };

  const completedCount = progress.completedNodeIds.length;
  const totalNormal    = pathData.nodes.filter(n => n.type === 'normal').length;

  return (
    <div ref={pageRef} className="fixed inset-0 z-50 bg-[#020617] flex flex-col">
      {/* Header */}
      <div
        className="flex items-center justify-between px-8 py-4"
        style={{ borderBottom: '1px solid rgba(6,182,212,0.12)' }}
      >
        <button onClick={goBack} className="text-slate-500 hover:text-slate-300 cursor-pointer transition-colors">
          <p style={{ ...PIXEL, fontSize: 7 }}>← MODOS</p>
        </button>

        <p style={{ ...PIXEL, fontSize: 10 }} className="text-cyan-400 tracking-widest">
          {mode.toUpperCase()}
        </p>

        <div className="flex items-center gap-6">
          <p style={{ ...PIXEL, fontSize: 7 }} className="text-slate-400">
            PULOS: {progress.skipsRemaining}/2
          </p>
          <p style={{ ...PIXEL, fontSize: 7 }} className="text-slate-400">
            {completedCount}/{totalNormal}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-slate-800">
        <div
          className="h-full transition-all duration-500"
          style={{
            width: `${(completedCount / (totalNormal + 1)) * 100}%`,
            background: 'linear-gradient(90deg, #22d3ee, #3b82f6)',
          }}
        />
      </div>

      {/* Main */}
      <div className="flex-1 flex items-center gap-6 px-8 overflow-hidden">
        {/* Map */}
        <div className="flex-1 flex items-center justify-center">
          <PathMapGraph
            pathData={pathData}
            progress={progress}
            onNodeClick={handleNodeClick}
            onNodeHover={handleNodeHover}
          />
        </div>

        {/* Presenter */}
        <div className="flex-shrink-0 hidden lg:flex">
          <QuizPresenter3D
            presenterState={hoveredNode ? 'talking' : 'idle'}
            dialogueKey={dialogueKey}
            size="medium"
          />
        </div>
      </div>

      {/* Mastery sticker preview */}
      <div
        className="flex items-center justify-center gap-3 px-8 py-3"
        style={{ borderTop: '1px solid rgba(6,182,212,0.08)' }}
      >
        <p style={{ ...PIXEL, fontSize: 7 }} className="text-slate-500">RECOMPENSA:</p>
        <p style={{ ...PIXEL, fontSize: 7 }} className="text-yellow-400">{pathData.masteryStickerId.replace(/_/g, ' ').toUpperCase()}</p>
      </div>
    </div>
  );
}
