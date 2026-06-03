import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import Particles from '@reactbits/Particles/Particles';
import { STICKERS } from '../../data/stickers';
import { getAchievement } from '../../hooks/useQuizEngine';

const PIXEL = { fontFamily: "'Press Start 2P', monospace" };
const MONO  = { fontFamily: 'ui-monospace, SFMono-Regular, monospace' };

const TITLE = 'FIGURINHA DESBLOQUEADA';

interface Props {
  stickerId:  string;
  onContinue: () => void;
}

export default function QuizAchievement({ stickerId, onContinue }: Props) {
  const sticker     = STICKERS.find(s => s.id === stickerId);
  const achievement = getAchievement(stickerId);
  const [typed, setTyped] = useState('');

  useEffect(() => {
    setTyped('');
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setTyped(TITLE.slice(0, i));
      if (i >= TITLE.length) clearInterval(id);
    }, 55);
    return () => clearInterval(id);
  }, [stickerId]);

  if (!sticker || !achievement) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 flex flex-col items-center justify-center gap-6 rounded-xl overflow-hidden"
      style={{ background: '#020617', zIndex: 10 }}
    >
      {/* Particles de fundo */}
      <div className="absolute inset-0 pointer-events-none opacity-60">
        <Particles
          particleColors={['#67e8f9', '#fbbf24', '#ffffff']}
          particleCount={80}
          particleSpread={8}
          speed={0.06}
          particleBaseSize={60}
          sizeRandomness={0.8}
          alphaParticles={true}
          moveParticlesOnHover={false}
          disableRotation={false}
        />
      </div>

      {/* Sticker animado */}
      <motion.div
        initial={{ scale: 0, rotate: -15 }}
        animate={{ scale: [0, 1.2, 1], rotate: [-15, 5, -3] }}
        transition={{ duration: 0.7, times: [0, 0.65, 1], ease: 'easeOut' }}
        className="relative"
      >
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(251,191,36,0.35) 0%, transparent 70%)',
            filter: 'blur(12px)',
            transform: 'scale(1.4)',
          }}
        />
        <img
          src={sticker.img}
          alt={sticker.name}
          draggable={false}
          style={{
            width: 160,
            height: 160,
            objectFit: 'contain',
            filter: 'drop-shadow(0 0 18px rgba(251,191,36,0.7)) drop-shadow(0 4px 12px rgba(0,0,0,0.8))',
          }}
        />
      </motion.div>

      {/* Titulo typewriter */}
      <p
        style={{ ...PIXEL, fontSize: 11 }}
        className="text-yellow-400 tracking-widest text-center"
      >
        {typed}
        <span className="animate-pulse">_</span>
      </p>

      {/* Nome da conquista */}
      <div className="text-center">
        <p style={{ ...PIXEL, fontSize: 14 }} className="text-white mb-2">
          {achievement.name.toUpperCase()}
        </p>
        <p style={{ ...MONO, fontSize: 13 }} className="text-slate-400">
          {achievement.description}
        </p>
      </div>

      {/* Sticker name tag */}
      <div
        className="px-4 py-2 rounded-full"
        style={{ background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.3)' }}
      >
        <p style={{ ...PIXEL, fontSize: 7 }} className="text-cyan-400 tracking-widest">
          {sticker.name}
        </p>
      </div>

      {/* Botao */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onContinue}
        className="px-10 py-3 rounded-xl border-2 border-cyan-500/60 cursor-pointer"
        style={{ background: 'rgba(6,182,212,0.12)' }}
      >
        <p style={{ ...PIXEL, fontSize: 9 }} className="text-cyan-300">
          CONTINUAR
        </p>
      </motion.button>
    </motion.div>
  );
}
