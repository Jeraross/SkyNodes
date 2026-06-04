import { useRef, useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import gsap from 'gsap';
import { Network, BarChart2, Shuffle } from 'lucide-react';
import QuizPresenter3D from '../components/presenter/QuizPresenter3D';
import { useQuizGame } from '../router/QuizGameContext';
import type { QuizMode } from '../data/quizPathData';

const PIXEL = { fontFamily: "'Press Start 2P', monospace" };
const MONO  = { fontFamily: 'ui-monospace, SFMono-Regular, monospace' };

const MODES: { id: QuizMode; label: string; sub: string; reward: string; Icon: React.ElementType }[] = [
  { id: 'avd',    label: 'DADOS',  sub: 'Analise e visualizacao de dados', reward: 'Mestre dos Dados',  Icon: BarChart2 },
  { id: 'grafos', label: 'GRAFOS', sub: 'Teoria e algoritmos de grafos',   reward: 'Mestre dos Grafos', Icon: Network   },
  { id: 'mix',    label: 'MIX',    sub: 'Mistura de grafos e dados',       reward: 'Figurinhas Gamer',  Icon: Shuffle   },
];

const WELCOME_KEY: Record<QuizMode, string> = {
  avd: 'welcomeAvd', grafos: 'welcomeGrafos', mix: 'welcomeMix',
};

export default function QuizModeSelect() {
  const [, navigate] = useLocation();
  const { sessionPlayer } = useQuizGame();
  const [selected, setSelected] = useState<QuizMode | null>(null);
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.fromTo(pageRef.current, { x: '100vw', opacity: 0 }, { x: 0, opacity: 1, duration: 0.45, ease: 'power3.out' });
  }, []);

  const goBack = () => {
    gsap.to(pageRef.current, {
      x: '100vw', opacity: 0, duration: 0.35, ease: 'power3.in',
      onComplete: () => navigate('/'),
    });
  };

  const startMode = () => {
    if (!selected) return;
    gsap.to(pageRef.current, {
      x: '-100vw', opacity: 0, duration: 0.35, ease: 'power3.in',
      onComplete: () => navigate(`/quiz/map/${selected}`),
    });
  };

  return (
    <div ref={pageRef} className="fixed inset-0 z-50 bg-[#020617] flex flex-col overflow-hidden">
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-8 py-4"
        style={{ borderBottom: '1px solid rgba(6,182,212,0.12)' }}
      >
        <button onClick={goBack} className="text-slate-500 hover:text-slate-300 cursor-pointer transition-colors">
          <p style={{ ...PIXEL, fontSize: 7 }}>← MAPA</p>
        </button>
        <div className="flex items-center gap-6">
          <button onClick={() => navigate('/leaderboard')} className="text-slate-500 hover:text-cyan-400 cursor-pointer transition-colors">
            <p style={{ ...PIXEL, fontSize: 7 }}>RANKING</p>
          </button>
          <button onClick={() => navigate('/login')} className="text-slate-500 hover:text-cyan-400 cursor-pointer transition-colors">
            <p style={{ ...PIXEL, fontSize: 7 }}>
              {sessionPlayer ? sessionPlayer.toUpperCase() : 'LOGIN'}
            </p>
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex items-center gap-8 px-8 overflow-hidden">
        {/* Presenter */}
        <div className="flex-shrink-0 hidden lg:flex">
          <QuizPresenter3D
            presenterState={selected ? 'talking' : 'idle'}
            dialogueKey={selected ? WELCOME_KEY[selected] : null}
            size="large"
          />
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col gap-8">
          <div className="text-center">
            <p style={{ ...PIXEL, fontSize: 22 }} className="text-white tracking-widest drop-shadow-[0_0_20px_rgba(6,182,212,0.6)]">
              SHOW DO GRAFAO
            </p>
            <div className="w-48 h-px bg-gradient-to-r from-transparent via-cyan-500/60 to-transparent mx-auto mt-3" />
          </div>

          <div className="grid grid-cols-3 gap-5">
            {MODES.map(({ id, label, sub, reward, Icon }) => {
              const sel = selected === id;
              return (
                <button
                  key={id}
                  onClick={() => setSelected(id)}
                  className="flex flex-col items-center gap-4 p-6 rounded-2xl border-2 transition-all duration-300 cursor-pointer"
                  style={{
                    borderColor: sel ? '#22d3ee' : 'rgba(6,182,212,0.18)',
                    background:  sel ? 'rgba(6,182,212,0.1)' : 'rgba(2,6,23,0.6)',
                    boxShadow:   sel ? '0 0 28px rgba(6,182,212,0.3)' : 'none',
                    transform:   sel ? 'translateY(-4px)' : 'none',
                  }}
                >
                  <Icon size={36} className={sel ? 'text-cyan-400' : 'text-slate-500'} />
                  <p style={{ ...PIXEL, fontSize: 10 }} className={sel ? 'text-cyan-300' : 'text-slate-400'}>
                    {label}
                  </p>
                  <p style={{ ...MONO, fontSize: 12 }} className={sel ? 'text-slate-300 text-center' : 'text-slate-600 text-center'}>
                    {sub}
                  </p>
                  <div
                    className="px-3 py-1 rounded-full text-center"
                    style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)' }}
                  >
                    <p style={{ ...PIXEL, fontSize: 6 }} className="text-yellow-400">{reward}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <button
            onClick={startMode}
            disabled={!selected}
            className="w-full py-4 rounded-xl border-2 transition-all duration-300 cursor-pointer disabled:cursor-not-allowed"
            style={{
              borderColor: selected ? '#22d3ee' : 'rgba(6,182,212,0.15)',
              background:  selected ? 'rgba(6,182,212,0.15)' : 'rgba(2,6,23,0.4)',
              boxShadow:   selected ? '0 0 24px rgba(6,182,212,0.3)' : 'none',
              opacity:     selected ? 1 : 0.4,
            }}
          >
            <p style={{ ...PIXEL, fontSize: 11 }} className={selected ? 'text-cyan-300' : 'text-slate-600'}>
              ENTRAR
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}
