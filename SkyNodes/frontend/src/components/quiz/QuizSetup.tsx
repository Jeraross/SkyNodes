import { useState } from 'react';
import { Network, BarChart2, Shuffle } from 'lucide-react';
import type { QuizCategory, DifficultyFilter } from '../../hooks/useQuizEngine';

const PIXEL = { fontFamily: "'Press Start 2P', monospace" };
const MONO  = { fontFamily: 'ui-monospace, SFMono-Regular, monospace' };

const CATEGORIES: { id: QuizCategory; label: string; sub: string; Icon: React.ElementType }[] = [
  { id: 'grafos', label: 'GRAFOS', sub: 'Teoria e algoritmos de grafos',      Icon: Network   },
  { id: 'avd',    label: 'AVD',    sub: 'Analise e visualizacao de dados',    Icon: BarChart2 },
  { id: 'mix',    label: 'MIX',    sub: 'Mistura de ambas as disciplinas',    Icon: Shuffle   },
];

const DIFFICULTIES: { id: DifficultyFilter; label: string; color: string }[] = [
  { id: 'all',     label: 'TODAS',   color: '#94a3b8' },
  { id: 'Fácil',   label: 'FACIL',   color: '#4ade80' },
  { id: 'Médio',   label: 'MEDIO',   color: '#fbbf24' },
  { id: 'Difícil', label: 'DIFICIL', color: '#f87171' },
];

interface Props {
  onStart: (category: QuizCategory, difficulty: DifficultyFilter) => void;
}

export default function QuizSetup({ onStart }: Props) {
  const [category,   setCategory]   = useState<QuizCategory | null>(null);
  const [difficulty, setDifficulty] = useState<DifficultyFilter | null>(null);

  const canStart = category !== null && difficulty !== null;

  return (
    <div className="flex flex-col gap-8 p-8">
      {/* Header */}
      <div className="text-center">
        <p style={{ ...PIXEL, fontSize: 18 }} className="text-white tracking-widest">
          QUIZ
        </p>
        <div className="w-32 h-px bg-gradient-to-r from-transparent via-cyan-500/60 to-transparent mx-auto mt-3" />
      </div>

      {/* Categoria */}
      <div>
        <p style={{ ...PIXEL, fontSize: 8 }} className="text-cyan-400/70 mb-4 tracking-widest">
          CATEGORIA
        </p>
        <div className="grid grid-cols-3 gap-4">
          {CATEGORIES.map(({ id, label, sub, Icon }) => {
            const selected = category === id;
            return (
              <button
                key={id}
                onClick={() => setCategory(id)}
                className="flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all duration-200 cursor-pointer"
                style={{
                  background:  selected ? 'rgba(6,182,212,0.12)' : 'rgba(2,6,23,0.6)',
                  borderColor: selected ? '#22d3ee' : 'rgba(6,182,212,0.18)',
                  boxShadow:   selected ? '0 0 18px rgba(6,182,212,0.3)' : 'none',
                }}
              >
                <Icon size={28} className={selected ? 'text-cyan-400' : 'text-slate-500'} />
                <p style={{ ...PIXEL, fontSize: 8 }}
                   className={selected ? 'text-cyan-400' : 'text-slate-400'}>
                  {label}
                </p>
                <p style={{ ...MONO, fontSize: 11 }}
                   className={selected ? 'text-slate-300 text-center' : 'text-slate-600 text-center'}>
                  {sub}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dificuldade */}
      <div>
        <p style={{ ...PIXEL, fontSize: 8 }} className="text-cyan-400/70 mb-4 tracking-widest">
          DIFICULDADE
        </p>
        <div className="flex gap-3">
          {DIFFICULTIES.map(({ id, label, color }) => {
            const selected = difficulty === id;
            return (
              <button
                key={id}
                onClick={() => setDifficulty(id)}
                className="flex-1 py-2 rounded-full border-2 transition-all duration-200 cursor-pointer"
                style={{
                  borderColor: selected ? color : 'rgba(148,163,184,0.2)',
                  background:  selected ? `${color}22` : 'rgba(2,6,23,0.5)',
                  boxShadow:   selected ? `0 0 10px ${color}44` : 'none',
                }}
              >
                <p style={{ ...PIXEL, fontSize: 7, color: selected ? color : '#64748b' }}>
                  {label}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Botao iniciar */}
      <button
        onClick={() => canStart && onStart(category!, difficulty!)}
        disabled={!canStart}
        className="w-full py-4 rounded-xl border-2 transition-all duration-300 cursor-pointer"
        style={{
          borderColor: canStart ? '#22d3ee' : 'rgba(6,182,212,0.15)',
          background:  canStart ? 'rgba(6,182,212,0.15)' : 'rgba(2,6,23,0.4)',
          boxShadow:   canStart ? '0 0 20px rgba(6,182,212,0.25)' : 'none',
          opacity:     canStart ? 1 : 0.4,
        }}
      >
        <p style={{ ...PIXEL, fontSize: 10 }}
           className={canStart ? 'text-cyan-300' : 'text-slate-600'}>
          INICIAR
        </p>
      </button>
    </div>
  );
}
