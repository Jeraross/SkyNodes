import { motion } from 'motion/react';
import { Check, X } from 'lucide-react';

const PIXEL = { fontFamily: "'Press Start 2P', monospace" };
const MONO  = { fontFamily: 'ui-monospace, SFMono-Regular, monospace' };

interface Props {
  isCorrect:      boolean;
  explicacao:     string;
  isLastQuestion: boolean;
  onNext:         () => void;
}

export default function QuizFeedback({ isCorrect, explicacao, isLastQuestion, onNext }: Props) {
  return (
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0,  opacity: 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-8 rounded-xl"
      style={{ background: 'rgba(2,6,23,0.97)', backdropFilter: 'blur(4px)' }}
    >
      {/* Icone animado */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1.25, 1] }}
        transition={{ duration: 0.45, times: [0, 0.6, 1], ease: 'easeOut' }}
        className="flex items-center justify-center w-20 h-20 rounded-full"
        style={{
          background: isCorrect ? 'rgba(74,222,128,0.15)' : 'rgba(248,113,113,0.15)',
          border: `2px solid ${isCorrect ? '#4ade80' : '#f87171'}`,
        }}
      >
        {isCorrect
          ? <Check size={40} className="text-green-400" strokeWidth={3} />
          : <X     size={40} className="text-red-400"   strokeWidth={3} />
        }
      </motion.div>

      {/* Titulo */}
      <p
        style={{ ...PIXEL, fontSize: 14 }}
        className={isCorrect ? 'text-green-400' : 'text-red-400'}
      >
        {isCorrect ? 'CORRETO!' : 'ERROU...'}
      </p>

      {/* Explicacao */}
      <div
        className="max-w-lg text-center rounded-xl p-5"
        style={{ background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.15)' }}
      >
        <p style={{ ...MONO, fontSize: 13 }} className="text-slate-300 leading-relaxed">
          {explicacao}
        </p>
      </div>

      {/* Botao */}
      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        onClick={onNext}
        className="px-10 py-3 rounded-xl border-2 border-cyan-500/60 cursor-pointer transition-colors duration-200"
        style={{ background: 'rgba(6,182,212,0.12)' }}
      >
        <p style={{ ...PIXEL, fontSize: 9 }} className="text-cyan-300">
          {isLastQuestion ? 'VER RESULTADO' : 'PROXIMA  →'}
        </p>
      </motion.button>
    </motion.div>
  );
}
