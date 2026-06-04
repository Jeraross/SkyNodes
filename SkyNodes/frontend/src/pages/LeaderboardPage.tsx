import { useRef, useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import gsap from 'gsap';
import { LEADERBOARD_MOCK } from '../data/leaderboardMock';
import { useQuizGame } from '../router/QuizGameContext';
import type { QuizMode } from '../data/quizPathData';

const PIXEL = { fontFamily: "'Press Start 2P', monospace" };
const MONO  = { fontFamily: 'ui-monospace, SFMono-Regular, monospace' };

const MODE_LABELS: Record<QuizMode | 'all', string> = {
  all: 'TODOS', avd: 'DADOS', grafos: 'GRAFOS', mix: 'MIX',
};

export default function LeaderboardPage() {
  const [, navigate] = useLocation();
  const { sessionPlayer } = useQuizGame();
  const [filter, setFilter] = useState<QuizMode | 'all'>('all');
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.fromTo(pageRef.current, { x: '100vw', opacity: 0 }, { x: 0, opacity: 1, duration: 0.45, ease: 'power3.out' });
  }, []);

  const handleBack = () => {
    gsap.to(pageRef.current, {
      x: '100vw', opacity: 0, duration: 0.35, ease: 'power3.in',
      onComplete: () => navigate('/quiz'),
    });
  };

  const entries = filter === 'all'
    ? LEADERBOARD_MOCK
    : LEADERBOARD_MOCK.filter(e => e.mode === filter);

  return (
    <div ref={pageRef} className="fixed inset-0 z-50 bg-[#020617] flex flex-col">
      {/* Header */}
      <div
        className="flex items-center justify-between px-8 py-5"
        style={{ borderBottom: '1px solid rgba(6,182,212,0.12)' }}
      >
        <button onClick={handleBack} className="text-slate-500 hover:text-slate-300 cursor-pointer transition-colors">
          <p style={{ ...PIXEL, fontSize: 7 }}>← VOLTAR</p>
        </button>
        <p style={{ ...PIXEL, fontSize: 11 }} className="text-cyan-400 tracking-widest">
          LEADERBOARD
        </p>
        <div style={{ width: 80 }} />
      </div>

      {/* Filtros */}
      <div className="flex gap-3 px-8 py-4">
        {(['all', 'avd', 'grafos', 'mix'] as const).map(m => (
          <button
            key={m}
            onClick={() => setFilter(m)}
            className="px-4 py-2 rounded-full border transition-all cursor-pointer"
            style={{
              borderColor: filter === m ? '#22d3ee' : 'rgba(6,182,212,0.2)',
              background:  filter === m ? 'rgba(6,182,212,0.12)' : 'transparent',
            }}
          >
            <p style={{ ...PIXEL, fontSize: 7 }} className={filter === m ? 'text-cyan-300' : 'text-slate-500'}>
              {MODE_LABELS[m]}
            </p>
          </button>
        ))}
      </div>

      {/* Tabela */}
      <div className="flex-1 overflow-y-auto px-8 pb-8">
        <table className="w-full border-collapse">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(6,182,212,0.15)' }}>
              {['#', 'JOGADOR', 'MODO', 'PONTOS', 'DATA'].map(h => (
                <th key={h} className="py-3 text-left">
                  <p style={{ ...PIXEL, fontSize: 7 }} className="text-slate-500">{h}</p>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, i) => {
              const isPlayer = sessionPlayer === entry.player;
              return (
                <tr
                  key={`${entry.player}-${i}`}
                  style={{
                    borderBottom: '1px solid rgba(6,182,212,0.08)',
                    background: isPlayer ? 'rgba(6,182,212,0.08)' : 'transparent',
                  }}
                >
                  <td className="py-3 pr-4">
                    <p style={{ ...PIXEL, fontSize: 9 }} className={entry.rank <= 3 ? 'text-yellow-400' : 'text-slate-500'}>
                      {entry.rank}
                    </p>
                  </td>
                  <td className="py-3 pr-4">
                    <p style={{ ...MONO, fontSize: 13 }} className={isPlayer ? 'text-cyan-400 font-bold' : 'text-white'}>
                      {entry.player} {isPlayer && '(voce)'}
                    </p>
                  </td>
                  <td className="py-3 pr-4">
                    <p style={{ ...PIXEL, fontSize: 7 }} className="text-slate-400">{MODE_LABELS[entry.mode]}</p>
                  </td>
                  <td className="py-3 pr-4">
                    <p style={{ ...MONO, fontSize: 13 }} className="text-white">
                      {entry.score}<span className="text-slate-500">/{entry.total}</span>
                    </p>
                  </td>
                  <td className="py-3">
                    <p style={{ ...MONO, fontSize: 11 }} className="text-slate-500">{entry.date}</p>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {entries.length === 0 && (
          <p style={{ ...MONO, fontSize: 13 }} className="text-slate-500 text-center mt-12">
            Nenhuma pontuacao para este modo ainda.
          </p>
        )}
      </div>
    </div>
  );
}
