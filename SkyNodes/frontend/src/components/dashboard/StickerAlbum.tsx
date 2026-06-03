import { useState, useRef, useCallback, useEffect } from 'react';
import type { CSSProperties } from 'react';
import { flushSync } from 'react-dom';
import gsap from 'gsap';
import { BookOpen, Lock, Globe, MousePointerClick } from 'lucide-react';

import eiffelImg   from '../../assets/Stickers/eiffel_tower.png';
import bigbenImg   from '../../assets/Stickers/bigben_sticker.png';
import greekImg    from '../../assets/Stickers/greek_sticker.png';
import pokeballImg from '../../assets/Stickers/pokeball_sticker.png';
import spiderImg   from '../../assets/Stickers/spider_sticker.png';
import blockImg    from '../../assets/Stickers/block_sticker.png';
import peepImg     from '../../assets/Stickers/peeper_sticker.png';
import d20Img      from '../../assets/Stickers/d20_sticker.png';

interface Sticker { id: string; name: string; desc: string; img: string; }

const STICKERS: Sticker[] = [
  { id: 'eiffel_tower', name: 'FRANÇA',          desc: 'Clair Obscur: Expedition 33 — RPG de turno nascido nas sombras da Torre Eiffel',   img: eiffelImg   },
  { id: 'bigben',       name: 'INGLATERRA',       desc: '007 — O agente mais famoso do MI6 sob o relógio do Big Ben',                       img: bigbenImg   },
  { id: 'greek',        name: 'GRÉCIA',           desc: 'God of War — Kratos destrói o Olimpo pedra por pedra',                             img: greekImg    },
  { id: 'pokeball',     name: 'JAPÃO',            desc: 'Pokémon — Capture-os todos nas terras do sol nascente',                            img: pokeballImg },
  { id: 'spider',       name: 'NEW YORK',         desc: 'Marvel\'s Spider-Man — Herói de NY balança entre o Empire State e o Chrysler',     img: spiderImg   },
  { id: 'block',        name: 'SUÉCIA',           desc: 'Minecraft — O bloco de grama mais famoso nasceu nos fiordes suecos',               img: blockImg    },
  { id: 'peeper',       name: 'OCEANO PACÍFICO',  desc: 'Subnautica — Sobreviva nas profundezas alienígenas do Pacífico',                   img: peepImg     },
  { id: 'd20',          name: 'BÉLGICA',          desc: 'Baldur\'s Gate 3 — Role o D20 e decida o destino de Faerûn',                       img: d20Img      },
];

const ROTATIONS = [-2, 3, -1, 2.5, -3, 1.5, 2, -1.5];

// Press Start 2P — use only for short labels at 8px+
const PIXEL: CSSProperties  = { fontFamily: "'Press Start 2P', monospace" };
// Regular mono for descriptions — legible at small sizes
const MONO: CSSProperties   = { fontFamily: 'ui-monospace, SFMono-Regular, monospace' };

type Phase = 'widget' | 'centered' | 'open';

interface SlotProps {
  sticker: Sticker;
  unlocked: boolean;
  rotation: number;
  ref?: React.Ref<HTMLDivElement>;
}

function StickerSlot({ sticker, unlocked, rotation, ref }: SlotProps) {
  return (
    <div ref={ref} className="flex flex-col items-center gap-2 group">
      {/* Image area */}
      <div
        className="relative w-full rounded-xl overflow-hidden"
        style={{
          height: 170,
          border: `2px dashed rgba(6,182,212,${unlocked ? '0.45' : '0.15'})`,
          background: 'rgba(2,6,23,0.7)',
        }}
      >
        {unlocked && (
          <div
            className="absolute inset-0 rounded-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            style={{ boxShadow: 'inset 0 0 22px rgba(6,182,212,0.3)' }}
          />
        )}
        <div className={`w-full h-full flex items-center justify-center transition-transform duration-200 ${unlocked ? 'group-hover:scale-[1.07]' : ''}`}>
          <img
            src={sticker.img}
            alt=""
            className="w-[80%] h-[80%] object-contain"
            style={{
              transform: `rotate(${rotation}deg)`,
              filter: unlocked
                ? 'drop-shadow(0 3px 8px rgba(0,0,0,0.7))'
                : 'grayscale(100%) brightness(0.18)',
            }}
            draggable={false}
          />
        </div>
        {!unlocked && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Lock size={28} className="text-slate-600 opacity-50" />
          </div>
        )}
        {unlocked && (
          <div className="absolute inset-0 rounded-[10px] border border-yellow-400/30 pointer-events-none" />
        )}
      </div>

      {/* Name */}
      <p
        style={{ ...PIXEL, fontSize: 8 }}
        className={`tracking-widest text-center leading-tight ${unlocked ? 'text-cyan-400' : 'text-slate-600'}`}
      >
        {unlocked ? sticker.name : '???'}
      </p>

      {/* Description — uses regular mono for legibility */}
      <p
        style={{ ...MONO, fontSize: 11 }}
        className={`text-center leading-snug px-1 ${unlocked ? 'text-slate-300/80' : 'text-slate-700'}`}
      >
        {unlocked ? sticker.desc : '??? ??? ???'}
      </p>
    </div>
  );
}


export interface StickerAlbumProps {
  unlockedIds: string[];
}

export default function StickerAlbum({ unlockedIds }: StickerAlbumProps) {
  const [phase, setPhaseState] = useState<Phase>('widget');
  const phaseRef = useRef<Phase>('widget');

  const widgetCoverRef = useRef<HTMLDivElement>(null);
  const backdropRef    = useRef<HTMLDivElement>(null);
  const albumRef       = useRef<HTMLDivElement>(null);
  const coverRef       = useRef<HTMLDivElement>(null);
  const stickerRefs    = useRef<(HTMLDivElement | null)[]>([]);
  const tlRef          = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => () => { tlRef.current?.kill(); }, []);

  const onWidgetEnter = useCallback(() => {
    gsap.to(widgetCoverRef.current, { rotateY: -28, duration: 0.4, ease: 'power2.out' });
  }, []);

  const onWidgetLeave = useCallback(() => {
    gsap.to(widgetCoverRef.current, { rotateY: 0, duration: 0.4, ease: 'power2.inOut' });
  }, []);

  const enterCentered = useCallback(() => {
    gsap.killTweensOf(widgetCoverRef.current);
    tlRef.current?.kill();
    stickerRefs.current = [];

    phaseRef.current = 'centered';
    flushSync(() => setPhaseState('centered'));

    gsap.set(backdropRef.current, { opacity: 0 });
    gsap.set(albumRef.current,    { scale: 0.1, opacity: 0, y: 200 });
    gsap.set(coverRef.current,    { rotateY: 0 });
    gsap.set(stickerRefs.current.filter(Boolean), { opacity: 0, y: 24 });

    const tl = gsap.timeline();
    tlRef.current = tl;
    tl.to(backdropRef.current, { opacity: 1, duration: 0.25 });
    tl.to(albumRef.current,    { scale: 1, opacity: 1, y: 0, duration: 0.55, ease: 'back.out(1.2)' }, '-=0.1');
  }, []);

  const openBook = useCallback(() => {
    if (phaseRef.current !== 'centered') return;
    phaseRef.current = 'open';
    setPhaseState('open');

    tlRef.current?.kill();
    const tl = gsap.timeline();
    tlRef.current = tl;
    tl.to(coverRef.current, { rotateY: -180, duration: 0.75, ease: 'power3.inOut' });
    tl.to(stickerRefs.current.filter(Boolean), {
      y: 0, opacity: 1, stagger: 0.06, duration: 0.4, ease: 'power2.out',
    }, '-=0.35');
  }, []);

  const closeAll = useCallback(() => {
    if (phaseRef.current === 'widget') return;
    const closingFrom = phaseRef.current;
    phaseRef.current = 'widget';

    tlRef.current?.kill();
    const tl = gsap.timeline({ onComplete: () => setPhaseState('widget') });
    tlRef.current = tl;

    if (closingFrom === 'open') {
      tl.to(stickerRefs.current.filter(Boolean), {
        y: -8, opacity: 0, stagger: 0.025, duration: 0.2, ease: 'power2.in',
      });
      tl.to(coverRef.current, { rotateY: 0, duration: 0.55, ease: 'power3.inOut' }, '-=0.1');
    }
    tl.to(albumRef.current,    { scale: 0.1, opacity: 0, y: 200, duration: 0.4, ease: 'power2.in' }, '-=0.2');
    tl.to(backdropRef.current, { opacity: 0, duration: 0.2 }, '-=0.1');
  }, []);

  return (
    <>
      {/* Widget */}
      {phase === 'widget' && (
        <div
          className="fixed bottom-4 right-4 z-40 select-none cursor-pointer"
          style={{ width: 96, height: 120, perspective: '500px', rotate: '-8deg' }}
          onMouseEnter={onWidgetEnter}
          onMouseLeave={onWidgetLeave}
          onClick={enterCentered}
        >
          <div className="absolute left-0 top-0 h-full rounded-l-sm" style={{ width: 12, background: 'linear-gradient(90deg, #0d2044, #1e3a5f)' }} />
          <div className="absolute inset-0 rounded-sm" style={{ marginLeft: 12, background: '#080f1e' }}>
            <div className="absolute inset-0" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 7px, rgba(255,255,255,0.025) 8px)' }} />
          </div>
          <div
            ref={widgetCoverRef}
            className="absolute inset-0 flex flex-col items-center justify-between py-2"
            style={{
              marginLeft: 12,
              background: 'linear-gradient(160deg, #0f172a, #1e2d45 60%, #0f172a)',
              borderRadius: '0 4px 4px 0',
              transformOrigin: 'left center',
              boxShadow: '2px 2px 12px rgba(0,0,0,0.7)',
            }}
          >
            <div className="absolute inset-0" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 7px, rgba(255,255,255,0.025) 8px)', borderRadius: 'inherit' }} />
            <div className="absolute inset-0 border border-cyan-500/20" style={{ borderRadius: 'inherit' }} />
            <p style={{ ...PIXEL, fontSize: 5 }} className="relative z-10 text-center text-cyan-400 tracking-wider mt-1 leading-relaxed">
              COMP<br />ÊNDIO
            </p>
            <div className="relative z-10">
              <BookOpen size={22} className="text-cyan-400/70" />
            </div>
            <div style={{ height: 8 }} />
          </div>
        </div>
      )}

      {/* Album overlay */}
      {phase !== 'widget' && (
        <>
          <div
            ref={backdropRef}
            className="fixed inset-0 z-[49] bg-black/80 backdrop-blur-sm"
            onClick={closeAll}
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
            <div
              ref={albumRef}
              className="relative pointer-events-auto"
              style={{ width: 'min(1100px, 96vw)' }}
            >
              <button
                onClick={closeAll}
                className="absolute -top-9 right-0 cursor-pointer bg-transparent border-0 text-slate-500 hover:text-white transition-colors"
                style={{ ...PIXEL, fontSize: 11 }}
              >
                ✕ FECHAR
              </button>

              {/* Book */}
              <div
                className="relative flex rounded-xl"
                style={{ height: 'min(720px, 86vh)', perspective: '1400px', boxShadow: '0 30px 70px rgba(0,0,0,0.95)' }}
              >
                {/* Spine */}
                <div
                  className="rounded-l-xl flex-shrink-0"
                  style={{
                    width: 32,
                    background: 'linear-gradient(90deg, #050d1a, #1e3a5f 40%, #050d1a)',
                    boxShadow: 'inset -3px 0 12px rgba(0,0,0,0.6)',
                  }}
                />

                {/* Pages */}
                <div className="flex flex-1">
                  {/* Left page */}
                  <div
                    className="relative flex-1 overflow-hidden"
                    style={{ background: '#0a111f', borderRight: '1px solid rgba(6,182,212,0.12)', boxShadow: 'inset -10px 0 24px rgba(0,0,0,0.35)' }}
                  >
                    <div className="absolute inset-0" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 31px, rgba(255,255,255,0.022) 32px)' }} />
                    <div className="absolute inset-4 border border-cyan-500/[0.06] rounded-lg pointer-events-none" />
                    <p style={{ ...PIXEL, fontSize: 8 }} className="absolute top-4 left-0 right-0 text-center text-slate-600/50 tracking-widest">
                      PAG. 01
                    </p>
                    <div className="absolute inset-0 grid grid-cols-2 gap-5 p-8 pt-14">
                      {STICKERS.slice(0, 4).map((s, i) => (
                        <StickerSlot
                          key={s.id}
                          sticker={s}
                          unlocked={unlockedIds.includes(s.id)}
                          rotation={ROTATIONS[i]}
                          ref={el => { stickerRefs.current[i] = el; }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Right page */}
                  <div
                    className="relative flex-1 overflow-hidden rounded-r-xl"
                    style={{ background: '#0a111f' }}
                  >
                    <div className="absolute inset-0" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 31px, rgba(255,255,255,0.022) 32px)' }} />
                    <div className="absolute inset-4 border border-cyan-500/[0.06] rounded-lg pointer-events-none" />
                    <p style={{ ...PIXEL, fontSize: 8 }} className="absolute top-4 left-0 right-0 text-center text-slate-600/50 tracking-widest">
                      PAG. 02
                    </p>
                    <div className="absolute inset-0 grid grid-cols-2 gap-5 p-8 pt-14">
                      {STICKERS.slice(4, 8).map((s, i) => (
                        <StickerSlot
                          key={s.id}
                          sticker={s}
                          unlocked={unlockedIds.includes(s.id)}
                          rotation={ROTATIONS[i + 4]}
                          ref={el => { stickerRefs.current[i + 4] = el; }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Cover — pivots at spine edge, clickable when centered */}
                <div
                  ref={coverRef}
                  className="absolute z-10"
                  style={{
                    left: 32,
                    right: 0,
                    top: 0,
                    bottom: 0,
                    transformOrigin: 'left center',
                    transformStyle: 'preserve-3d',
                    cursor: phase === 'centered' ? 'pointer' : 'default',
                  }}
                  onClick={openBook}
                >
                  {/* Cover front */}
                  <div
                    className="absolute inset-0 rounded-r-xl"
                    style={{
                      background: 'linear-gradient(155deg, #0c1628 0%, #182a40 50%, #0c1628 100%)',
                      backfaceVisibility: 'hidden',
                      boxShadow: '4px 0 28px rgba(0,0,0,0.95)',
                    }}
                  >
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundImage:
                          'repeating-linear-gradient(0deg, transparent, transparent 23px, rgba(255,255,255,0.018) 24px), ' +
                          'repeating-linear-gradient(90deg, transparent, transparent 23px, rgba(255,255,255,0.018) 24px)',
                      }}
                    />
                    <div className="absolute inset-0 border border-cyan-500/15 rounded-r-xl" />

                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-5">
                      <div className="text-center">
                        <p style={{ ...PIXEL, fontSize: 11 }} className="text-cyan-400/60 tracking-[0.3em]">AERO GAMES</p>
                        <div className="w-40 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent mx-auto my-4" />
                        <p style={{ ...PIXEL, fontSize: 22 }} className="text-white tracking-[0.15em] leading-tight">COMPÊNDIO</p>
                        <p style={{ ...PIXEL, fontSize: 22 }} className="text-white tracking-[0.15em] leading-tight mt-2">DOS GAMES</p>
                        <div className="w-40 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent mx-auto mt-4" />
                      </div>

                      <Globe size={56} className="text-cyan-500/20" />

                      {phase === 'centered' && (
                        <div className="flex flex-col items-center gap-2 animate-pulse">
                          <MousePointerClick size={20} className="text-cyan-400/60" />
                          <p style={{ ...PIXEL, fontSize: 8 }} className="text-cyan-400/50 tracking-widest">
                            CLIQUE PARA ABRIR
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Cover back */}
                  <div
                    className="absolute inset-0 rounded-r-xl"
                    style={{
                      background: '#060d1a',
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                      boxShadow: 'inset 4px 0 18px rgba(0,0,0,0.7)',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
