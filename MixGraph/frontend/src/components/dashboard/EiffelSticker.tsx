import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import eiffelImg from '../../assets/Stickers/eiffel_tower.png';

interface Particle {
  id: number;
  angle: number;
  emoji: string;
  distance: number;
}

interface Props {
  onUnlock: () => void;
}

// Sobrevive a unmounts do modal — o contador é da sessão
let sessionClicks = 0;
let sessionUnlocked = false;

const STARS = ['⭐', '✨', '🌟', '💫', '⚡'];

export default function EiffelSticker({ onUnlock }: Props) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [unlocked, setUnlocked] = useState(sessionUnlocked);

  const handleClick = useCallback(() => {
    if (sessionUnlocked) return;
    sessionClicks += 1;
    const n = sessionClicks;

    if (n === 33) {
      sessionUnlocked = true;
      setUnlocked(true);
      onUnlock();

      // baguete sobe
      const baguete: Particle = { id: Date.now(), angle: -80, emoji: '🥖', distance: 130 };
      // burst de estrelas
      const burst: Particle[] = Array.from({ length: 10 }, (_, i) => ({
        id: Date.now() + i + 1,
        angle: i * 36,
        emoji: STARS[i % STARS.length],
        distance: 70 + Math.random() * 50,
      }));
      setParticles(p => [...p, baguete, ...burst]);
    } else {
      const count = 5 + Math.floor(Math.random() * 4);
      const base = Math.random() * 360;
      const newP: Particle[] = Array.from({ length: count }, (_, i) => ({
        id: Date.now() + i,
        angle: base + (360 / count) * i,
        emoji: STARS[Math.floor(Math.random() * STARS.length)],
        distance: 45 + Math.random() * 40,
      }));
      setParticles(p => [...p, ...newP]);
    }
  }, [onUnlock]);

  const remove = useCallback((id: number) => {
    setParticles(p => p.filter(x => x.id !== id));
  }, []);

  return (
    /* posicionado absolutamente pelo pai (ContainerScroll frame) */
    <div className="absolute -bottom-5 -right-4 z-30 select-none" style={{ width: 72 }}>
      {/* partículas */}
      <div className="absolute pointer-events-none" style={{ left: '50%', top: '30%' }}>
        <AnimatePresence>
          {particles.map(p => {
            const rad = (p.angle * Math.PI) / 180;
            return (
              <motion.span
                key={p.id}
                initial={{ x: 0, y: 0, opacity: 1, scale: 0.4 }}
                animate={{
                  x: Math.cos(rad) * p.distance,
                  y: Math.sin(rad) * p.distance,
                  opacity: 0,
                  scale: p.emoji === '🥖' ? 2 : 1.6,
                }}
                transition={{ duration: p.emoji === '🥖' ? 1.1 : 0.75, ease: 'easeOut' }}
                onAnimationComplete={() => remove(p.id)}
                className="absolute text-xl leading-none"
                style={{ transform: 'translate(-50%,-50%)' }}
              >
                {p.emoji}
              </motion.span>
            );
          })}
        </AnimatePresence>
      </div>

      {/* sticker */}
      <motion.img
        src={eiffelImg}
        alt=""
        className="w-full pointer-events-auto"
        initial={{ rotate: -14 }}
        whileHover={!unlocked ? { scale: 1.1, rotate: -10 } : {}}
        whileTap={!unlocked ? { scale: 0.9 } : {}}
        style={{
          cursor: unlocked ? 'default' : 'pointer',
          filter: unlocked
            ? 'drop-shadow(0 0 8px gold) drop-shadow(0 0 20px rgba(255,200,0,0.6)) brightness(1.15)'
            : 'drop-shadow(0 2px 8px rgba(0,0,0,0.8))',
        }}
        onClick={handleClick}
        draggable={false}
      />
    </div>
  );
}
