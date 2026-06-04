import { useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import gsap from 'gsap';
import { useQuizGame } from '../router/QuizGameContext';
import { STICKERS, MASTERY_STICKER_IDS } from '../data/stickers';
import { Lock } from 'lucide-react';

const PIXEL = { fontFamily: "'Press Start 2P', monospace" };
const MONO  = { fontFamily: 'ui-monospace, SFMono-Regular, monospace' };
const ROTATIONS = [-2, 3, -1, 2.5, -3, 1.5, 2, -1.5, -2.5, 1];

function StickerCard({ sticker, unlocked, rotation }: { sticker: typeof STICKERS[0]; unlocked: boolean; rotation: number }) {
  return (
    <div className="flex flex-col items-center gap-2 group">
      <div
        className="relative w-full rounded-xl overflow-hidden"
        style={{
          height: 160,
          border: `2px dashed rgba(${unlocked ? (sticker.mastery ? '167,139,250' : '6,182,212') : '6,182,212'},${unlocked ? '0.5' : '0.15'})`,
          background: 'rgba(2,6,23,0.7)',
        }}
      >
        <div className={`w-full h-full flex items-center justify-center transition-transform duration-200 ${unlocked ? 'group-hover:scale-105' : ''}`}>
          <img
            src={sticker.img}
            alt=""
            className="w-[80%] h-[80%] object-contain"
            style={{
              transform: `rotate(${rotation}deg)`,
              filter: unlocked ? 'drop-shadow(0 3px 8px rgba(0,0,0,0.7))' : 'grayscale(100%) brightness(0.18)',
            }}
            draggable={false}
          />
        </div>
        {!unlocked && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Lock size={24} className="text-slate-600 opacity-50" />
          </div>
        )}
      </div>
      <p style={{ ...PIXEL, fontSize: 6 }} className={unlocked ? (sticker.mastery ? 'text-violet-400' : 'text-cyan-400') : 'text-slate-700'}>
        {sticker.name}
      </p>
      {unlocked && (
        <p style={{ ...MONO, fontSize: 10 }} className="text-slate-500 text-center px-1">{sticker.desc}</p>
      )}
    </div>
  );
}

export default function AlbumPage() {
  const [, navigate] = useLocation();
  const { unlockedStickerIds } = useQuizGame();
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

  const masteryStickers = STICKERS.filter(s => MASTERY_STICKER_IDS.includes(s.id as any));
  const gamerStickers   = STICKERS.filter(s => !MASTERY_STICKER_IDS.includes(s.id as any));

  return (
    <div ref={pageRef} className="fixed inset-0 z-50 bg-[#020617] flex flex-col overflow-y-auto">
      {/* Header */}
      <div
        className="sticky top-0 z-10 flex items-center justify-between px-8 py-5 bg-[#020617]"
        style={{ borderBottom: '1px solid rgba(6,182,212,0.12)' }}
      >
        <button onClick={handleBack} className="text-slate-500 hover:text-slate-300 cursor-pointer transition-colors">
          <p style={{ ...PIXEL, fontSize: 7 }}>← VOLTAR</p>
        </button>
        <p style={{ ...PIXEL, fontSize: 11 }} className="text-cyan-400 tracking-widest">ALBUM</p>
        <p style={{ ...PIXEL, fontSize: 7 }} className="text-slate-500">
          {unlockedStickerIds.length}/{STICKERS.length}
        </p>
      </div>

      <div className="px-8 py-6 flex flex-col gap-10">
        {/* Figurinhas de Maestria */}
        <section>
          <p style={{ ...PIXEL, fontSize: 8 }} className="text-violet-400 tracking-widest mb-5">
            MAESTRIA
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {masteryStickers.map((s, i) => (
              <StickerCard
                key={s.id}
                sticker={s}
                unlocked={unlockedStickerIds.includes(s.id)}
                rotation={ROTATIONS[i % ROTATIONS.length]}
              />
            ))}
          </div>
        </section>

        {/* Figurinhas Gamers */}
        <section>
          <p style={{ ...PIXEL, fontSize: 8 }} className="text-cyan-400/70 tracking-widest mb-5">
            FIGURINHAS GAMER
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {gamerStickers.map((s, i) => (
              <StickerCard
                key={s.id}
                sticker={s}
                unlocked={unlockedStickerIds.includes(s.id)}
                rotation={ROTATIONS[i % ROTATIONS.length]}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
