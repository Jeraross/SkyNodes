import { motion } from 'motion/react';
import { Flame } from 'lucide-react';
import type { QuizQuestion as IQuizQuestion } from '../../data/quizQuestions';

const PIXEL = { fontFamily: "'Press Start 2P', monospace" };
const MONO  = { fontFamily: 'ui-monospace, SFMono-Regular, monospace' };

const LABELS = ['A', 'B', 'C', 'D'] as const;

interface Props {
  question:       IQuizQuestion;
  questionNumber: number;
  totalQuestions: number;
  streak:         number;
  selectedAnswer: 'A' | 'B' | 'C' | 'D' | null;
  onAnswer:       (answer: 'A' | 'B' | 'C' | 'D') => void;
}

export default function QuizQuestion({
  question,
  questionNumber,
  totalQuestions,
  streak,
  selectedAnswer,
  onAnswer,
}: Props) {
  const progress = ((questionNumber - 1) / totalQuestions) * 100;

  return (
    <div className="flex flex-col gap-6 p-8">
      {/* Barra de progresso */}
      <div>
        <div className="flex justify-between mb-2 items-center">
          <p style={{ ...PIXEL, fontSize: 7 }} className="text-slate-500">
            QUESTAO {questionNumber} / {totalQuestions}
          </p>
          {streak >= 2 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1"
            >
              <Flame size={14} className="text-orange-400" />
              <p style={{ ...PIXEL, fontSize: 7 }} className="text-orange-400">
                {streak}x
              </p>
            </motion.div>
          )}
        </div>

        {/* Track */}
        <div
          className="relative h-2 rounded-full overflow-hidden"
          style={{ background: 'rgba(6,182,212,0.1)' }}
        >
          {/* Marcadores */}
          <div className="absolute inset-0 flex">
            {Array.from({ length: totalQuestions - 1 }).map((_, i) => (
              <div
                key={i}
                className="flex-1 border-r"
                style={{ borderColor: 'rgba(6,182,212,0.15)' }}
              />
            ))}
          </div>
          {/* Preenchimento animado */}
          <motion.div
            className="absolute left-0 top-0 h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #22d3ee, #3b82f6)' }}
            initial={{ width: `${progress}%` }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Tema */}
      <p style={{ ...PIXEL, fontSize: 7 }} className="text-cyan-500/60 tracking-widest">
        {question.tema.toUpperCase()}
      </p>

      {/* Pergunta */}
      <p style={{ ...MONO, fontSize: 16 }} className="text-white leading-relaxed">
        {question.pergunta}
      </p>

      {/* Opcoes */}
      <div className="grid grid-cols-2 gap-3">
        {question.alternativas.map((alt, i) => {
          const label = LABELS[i];
          const isSelected  = selectedAnswer === label;
          const isDisabled  = selectedAnswer !== null;
          const isGreenHint = isDisabled && label === question.respostaCorreta;
          const isWrong     = isSelected && label !== question.respostaCorreta;

          let borderColor = 'rgba(6,182,212,0.2)';
          let bg          = 'rgba(2,6,23,0.6)';
          let textColor   = '#94a3b8';

          if (isGreenHint) {
            borderColor = '#4ade80';
            bg          = 'rgba(74,222,128,0.12)';
            textColor   = '#4ade80';
          } else if (isWrong) {
            borderColor = '#f87171';
            bg          = 'rgba(248,113,113,0.12)';
            textColor   = '#f87171';
          }

          return (
            <motion.button
              key={label}
              onClick={() => !isDisabled && onAnswer(label)}
              whileHover={!isDisabled ? { scale: 1.02, borderColor: '#22d3ee' } : {}}
              whileTap={!isDisabled ? { scale: 0.97 } : {}}
              disabled={isDisabled}
              className="flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-colors duration-200 cursor-pointer disabled:cursor-default"
              style={{ borderColor, background: bg }}
            >
              <span style={{ ...PIXEL, fontSize: 8, color: textColor, flexShrink: 0, marginTop: 2 }}>
                {label}
              </span>
              <span style={{ ...MONO, fontSize: 13, color: textColor, lineHeight: '1.5' }}>
                {alt}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
