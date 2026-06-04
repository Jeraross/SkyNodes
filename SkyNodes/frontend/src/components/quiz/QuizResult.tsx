import { motion } from 'motion/react';
import { Star } from 'lucide-react';
import { STICKERS } from '../../data/stickers';

const PIXEL = { fontFamily: "'Press Start 2P', monospace" };
const MONO  = { fontFamily: 'ui-monospace, SFMono-Regular, monospace' };

function getStarCount(score: number): number {
  if (score <= 4) return 0;
  if (score <= 6) return 1;
  if (score <= 8) return 2;
  return 3;
}

const MESSAGES = [
  'Continue estudando — voce vai chegar la!',
  'Bom comeco! Tente novamente para melhorar.',
  'Muito bem! Voce conhece o conteudo.',
  'Incrivel! Pontuacao perfeita!',
];

interface Props {
  score:               number;
  totalQuestions:      number;
  unlockedThisSession: string[];
  onPlayAgain:         () => void;
  onViewAlbum:         () => void;
}

export default function QuizResult({
  score,
  totalQuestions,
  unlockedThisSession,
  onPlayAgain,
  onViewAlbum,
}: Props) {
  const stars  = getStarCount(score);
  const gained = unlockedThisSession.filter(id => id !== 'eiffel_tower');

  return (
    <div className="flex flex-col items-center gap-7 p-8">
      {/* Pontuacao */}
      <div className="text-center">
        <p style={{ ...PIXEL, fontSize: 9 }} className="text-slate-500 tracking-widest mb-3">
          PONTUACAO FINAL
        </p>
        <motion.p
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'back.out(1.4)' }}
          style={{ ...PIXEL, fontSize: 48 }}
          className="text-white"
        >
          {score}
          <span style={{ fontSize: 22 }} className="text-slate-500">
            /{totalQuestions}
          </span>
        </motion.p>

        {/* Estrelas */}
        <div className="flex gap-3 justify-center mt-3">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: i < stars ? 1 : 0.6, rotate: 0 }}
              transition={{ delay: 0.3 + i * 0.12, duration: 0.4, ease: 'back.out(1.5)' }}
            >
              <Star
                size={32}
                fill={i < stars ? '#fbbf24' : 'transparent'}
                className={i < stars ? 'text-yellow-400' : 'text-slate-700'}
                strokeWidth={i < stars ? 1.5 : 1}
              />
            </motion.div>
          ))}
        </div>

        <p style={{ ...MONO, fontSize: 13 }} className="text-slate-400 mt-3">
          {MESSAGES[stars]}
        </p>
      </div>

      {/* Figurinhas ganhas */}
      {gained.length > 0 && (
        <div className="w-full">
          <p style={{ ...PIXEL, fontSize: 7 }} className="text-cyan-400/70 tracking-widest mb-3 text-center">
            FIGURINHAS DESBLOQUEADAS
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            {gained.map(id => {
              const s = STICKERS.find(st => st.id === id);
              if (!s) return null;
              return (
                <div key={id} className="flex flex-col items-center gap-2">
                  <img
                    src={s.img}
                    alt={s.name}
                    draggable={false}
                    style={{
                      width: 64, height: 64, objectFit: 'contain',
                      filter: 'drop-shadow(0 0 8px rgba(251,191,36,0.5))',
                    }}
                  />
                  <p style={{ ...PIXEL, fontSize: 6 }} className="text-cyan-400 tracking-wide">
                    {s.name}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {gained.length === 0 && (
        <p style={{ ...MONO, fontSize: 13 }} className="text-slate-600 text-center">
          Nenhuma figurinha desbloqueada desta vez. Tente novamente!
        </p>
      )}

      {/* Botoes */}
      <div className="flex gap-4 w-full">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onPlayAgain}
          className="flex-1 py-3 rounded-xl border-2 border-cyan-500/50 cursor-pointer"
          style={{ background: 'rgba(6,182,212,0.1)' }}
        >
          <p style={{ ...PIXEL, fontSize: 8 }} className="text-cyan-300">
            JOGAR NOVAMENTE
          </p>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onViewAlbum}
          className="flex-1 py-3 rounded-xl border-2 border-yellow-500/40 cursor-pointer"
          style={{ background: 'rgba(251,191,36,0.08)' }}
        >
          <p style={{ ...PIXEL, fontSize: 8 }} className="text-yellow-400">
            VER ALBUM
          </p>
        </motion.button>
      </div>
    </div>
  );
}
