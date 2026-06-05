import { useRef, useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'motion/react';
import gsap from 'gsap';
import { Trophy, User } from 'lucide-react';
import QuizIntro from '../components/quiz/QuizIntro';
import { useQuizGame } from '../router/QuizGameContext';
import type { QuizMode } from '../data/quizPathData';

// ── Island SVG components ────────────────────────────────────────────────────

function IslandAVD({ hovered }: { hovered: boolean }) {
  return (
    <svg viewBox="0 0 280 220" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      {/* Shadow */}
      <ellipse cx="140" cy="210" rx="90" ry="14" fill="rgba(0,0,0,0.25)" />
      {/* Rock base */}
      <ellipse cx="140" cy="175" rx="95" ry="38" fill="#1a3a5c" />
      <ellipse cx="140" cy="168" rx="88" ry="32" fill="#1e4a72" />
      {/* Grass top */}
      <ellipse cx="140" cy="145" rx="90" ry="28" fill="#1b5e38" />
      <ellipse cx="140" cy="138" rx="86" ry="24" fill="#2d8a52" />
      {/* Highlights */}
      <ellipse cx="115" cy="133" rx="28" ry="10" fill="#3fa865" opacity="0.6" />
      {/* Bar chart */}
      <rect x="100" y="80" width="14" height="52" rx="3" fill={hovered ? '#22D3EE' : '#0e7490'} style={{ transition: 'fill 0.3s' }} />
      <rect x="120" y="65" width="14" height="67" rx="3" fill={hovered ? '#38bdf8' : '#0284c7'} style={{ transition: 'fill 0.3s' }} />
      <rect x="140" y="90" width="14" height="42" rx="3" fill={hovered ? '#67e8f9' : '#0e7490'} style={{ transition: 'fill 0.3s' }} />
      <rect x="160" y="72" width="14" height="60" rx="3" fill={hovered ? '#22D3EE' : '#0284c7'} style={{ transition: 'fill 0.3s' }} />
      {/* Glow on hover */}
      {hovered && (
        <ellipse cx="140" cy="105" rx="55" ry="35" fill="rgba(34,211,238,0.1)" />
      )}
      {/* Flag pole */}
      <line x1="58" y1="138" x2="58" y2="78" stroke="#8B6914" strokeWidth="3" strokeLinecap="round" />
      <polygon points="58,78 80,88 58,98" fill="#FFD166" />
    </svg>
  );
}

function IslandGrafos({ hovered }: { hovered: boolean }) {
  return (
    <svg viewBox="0 0 280 220" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      <ellipse cx="140" cy="210" rx="90" ry="14" fill="rgba(0,0,0,0.25)" />
      <ellipse cx="140" cy="175" rx="95" ry="38" fill="#2a1a5c" />
      <ellipse cx="140" cy="168" rx="88" ry="32" fill="#3a1e72" />
      <ellipse cx="140" cy="145" rx="90" ry="28" fill="#2d1a5e" />
      <ellipse cx="140" cy="138" rx="86" ry="24" fill="#4a2d8a" />
      <ellipse cx="115" cy="133" rx="28" ry="10" fill="#6b3fa8" opacity="0.5" />
      {/* Graph nodes */}
      {[
        { cx: 118, cy: 105, r: 9 },
        { cx: 160, cy: 88,  r: 9 },
        { cx: 148, cy: 120, r: 9 },
        { cx: 105, cy: 130, r: 7 },
        { cx: 168, cy: 118, r: 7 },
      ].map((c, i) => (
        <circle key={i} cx={c.cx} cy={c.cy} r={c.r}
          fill={hovered ? '#A78BFA' : '#6d28d9'}
          stroke={hovered ? '#c4b5fd' : '#8b5cf6'}
          strokeWidth="2"
          style={{ transition: 'fill 0.3s' }}
        />
      ))}
      {/* Edges */}
      {[
        [118,105,160,88],[160,88,148,120],[148,120,118,105],
        [118,105,105,130],[160,88,168,118],[148,120,168,118],
      ].map(([x1,y1,x2,y2], i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
          stroke={hovered ? 'rgba(167,139,250,0.7)' : 'rgba(139,92,246,0.5)'}
          strokeWidth="2" style={{ transition: 'stroke 0.3s' }}
        />
      ))}
      {hovered && <ellipse cx="140" cy="108" rx="55" ry="35" fill="rgba(167,139,250,0.1)" />}
      <line x1="58" y1="138" x2="58" y2="78" stroke="#8B6914" strokeWidth="3" strokeLinecap="round" />
      <polygon points="58,78 80,88 58,98" fill="#A78BFA" />
    </svg>
  );
}

function IslandMix({ hovered }: { hovered: boolean }) {
  return (
    <svg viewBox="0 0 280 220" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      <ellipse cx="140" cy="210" rx="95" ry="14" fill="rgba(0,0,0,0.25)" />
      <ellipse cx="140" cy="175" rx="100" ry="38" fill="#3a2800" />
      <ellipse cx="140" cy="168" rx="93" ry="32" fill="#5a3e00" />
      <ellipse cx="140" cy="145" rx="96" ry="28" fill="#5c4600" />
      <ellipse cx="140" cy="138" rx="90" ry="24" fill="#8B6914" />
      <ellipse cx="112" cy="133" rx="30" ry="10" fill="#c49a1e" opacity="0.5" />
      {/* Left: bars */}
      <rect x="88"  y="88" width="11" height="46" rx="2" fill={hovered ? '#FFD166' : '#b8860b'} style={{ transition: 'fill 0.3s' }} />
      <rect x="103" y="76" width="11" height="58" rx="2" fill={hovered ? '#fbbf24' : '#d4a017'} style={{ transition: 'fill 0.3s' }} />
      <rect x="118" y="94" width="11" height="40" rx="2" fill={hovered ? '#FFD166' : '#b8860b'} style={{ transition: 'fill 0.3s' }} />
      {/* Lightning bolt divider */}
      <path d="M138 75 L130 108 L140 108 L132 135 L152 100 L142 100 L150 75Z" fill={hovered ? '#fff' : '#fcd34d'} opacity="0.9" />
      {/* Right: graph nodes */}
      {[{ cx:162,cy:95,r:8},{cx:182,cy:112,r:8},{cx:165,cy:125,r:7}].map((c,i)=>(
        <circle key={i} cx={c.cx} cy={c.cy} r={c.r}
          fill={hovered ? '#FFD166' : '#b8860b'}
          stroke={hovered ? '#fef3c7' : '#d4a017'} strokeWidth="2"
          style={{ transition: 'fill 0.3s' }}
        />
      ))}
      {[[162,95,182,112],[182,112,165,125],[162,95,165,125]].map(([x1,y1,x2,y2],i)=>(
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
          stroke={hovered ? 'rgba(255,209,102,0.8)' : 'rgba(180,130,0,0.5)'}
          strokeWidth="2" style={{ transition: 'stroke 0.3s' }}
        />
      ))}
      {hovered && <ellipse cx="140" cy="105" rx="60" ry="36" fill="rgba(255,209,102,0.08)" />}
      <line x1="58" y1="138" x2="58" y2="78" stroke="#8B6914" strokeWidth="3" strokeLinecap="round" />
      <polygon points="58,78 80,88 58,98" fill="#FFD166" />
    </svg>
  );
}

// ── Stars background ─────────────────────────────────────────────────────────
const STARS = Array.from({ length: 60 }, (_, i) => ({
  id: i,
  x:  Math.random() * 100,
  y:  Math.random() * 100,
  r:  Math.random() * 1.5 + 0.5,
  op: Math.random() * 0.5 + 0.3,
  d:  Math.random() * 3 + 1.5,
}));

// ── Mode data ────────────────────────────────────────────────────────────────
const MODES: { id: QuizMode; label: string; sub: string; reward: string; color: string; Island: React.FC<{ hovered: boolean }> }[] = [
  { id: 'avd',    label: 'CAMINHO DE AVD',    sub: 'Análise e Visualização de Dados',  reward: 'Mestre dos Dados',  color: '#22D3EE', Island: IslandAVD   },
  { id: 'grafos', label: 'CAMINHO DE GRAFOS', sub: 'Teoria e Algoritmos de Grafos',    reward: 'Mestre dos Grafos', color: '#A78BFA', Island: IslandGrafos },
  { id: 'mix',    label: 'CAMINHO MIX',       sub: 'AVD + Grafos — O Desafio Máximo',  reward: 'Figurinhas Gamer',  color: '#FFD166', Island: IslandMix   },
];

// ── Component ────────────────────────────────────────────────────────────────
export default function QuizModeSelect() {
  const [, navigate]   = useLocation();
  const { sessionPlayer } = useQuizGame();
  const [showIntro, setShowIntro] = useState(true);
  const [hovered, setHovered]     = useState<QuizMode | null>(null);
  const pageRef = useRef<HTMLDivElement>(null);

  const handleIntroEnd = () => {
    setShowIntro(false);
    gsap.fromTo(pageRef.current, { opacity: 0, scale: 0.97 }, { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out' });
  };

  const go = (to: string) =>
    gsap.to(pageRef.current, { x: '-100vw', opacity: 0, duration: 0.35, ease: 'power3.in', onComplete: () => navigate(to) });

  const goBack = () =>
    gsap.to(pageRef.current, { x: '100vw', opacity: 0, duration: 0.35, ease: 'power3.in', onComplete: () => navigate('/') });

  return (
    <>
      {showIntro && <QuizIntro onComplete={handleIntroEnd} />}

      <div
        ref={pageRef}
        className="fixed inset-0 z-50 flex flex-col overflow-hidden"
        style={{
          background: 'radial-gradient(ellipse 120% 80% at 50% 110%, #0a1a3a 0%, #050818 55%, #000308 100%)',
          opacity: showIntro ? 0 : 1,
        }}
      >
        {/* Stars */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
          {STARS.map(s => (
            <circle key={s.id} cx={`${s.x}%`} cy={`${s.y}%`} r={s.r} fill="white" opacity={s.op}>
              <animate attributeName="opacity" values={`${s.op};${s.op * 0.3};${s.op}`} dur={`${s.d}s`} repeatCount="indefinite" />
            </circle>
          ))}
        </svg>

        {/* Nebula glow */}
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0,
          background: 'radial-gradient(ellipse 60% 40% at 20% 60%, rgba(34,211,238,0.05) 0%, transparent 60%), radial-gradient(ellipse 50% 35% at 80% 40%, rgba(167,139,250,0.06) 0%, transparent 60%), radial-gradient(ellipse 40% 30% at 50% 20%, rgba(255,209,102,0.04) 0%, transparent 60%)',
        }} />

        {/* Top bar */}
        <header
          className="relative z-10 flex-shrink-0 flex items-center justify-between px-8 py-4"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
        >
          <button onClick={goBack} style={{ fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', cursor: 'pointer', transition: 'color .2s' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
            ← Álbum
          </button>
          <div className="flex items-center gap-6">
            <button onClick={() => go('/leaderboard')} className="flex items-center gap-1.5"
              style={{ fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', cursor: 'pointer', transition: 'color .2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--gold)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
              <Trophy size={14} /> Ranking
            </button>
            <button onClick={() => go('/login')} className="flex items-center gap-1.5"
              style={{ fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', cursor: 'pointer', transition: 'color .2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--teal)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
              <User size={14} /> {sessionPlayer ?? 'Login'}
            </button>
          </div>
        </header>

        {/* Title */}
        <div className="relative z-10 text-center pt-6 pb-2">
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 15, color: 'var(--text-muted)', letterSpacing: '0.18em', fontWeight: 500 }}>
            ESCOLHA O MODO E COMECE SUA JORNADA!
          </p>
        </div>

        {/* Islands */}
        <div className="relative z-10 flex-1 flex items-end justify-center gap-8 px-8 pb-12 overflow-hidden">
          {MODES.map(({ id, label, sub, reward, color, Island }, idx) => {
            const isHov = hovered === id;
            // Middle island slightly higher
            const yOffset = idx === 1 ? -20 : 0;

            return (
              <motion.div
                key={id}
                className="flex flex-col items-center cursor-pointer"
                style={{ marginBottom: yOffset, maxWidth: 300, width: '30%' }}
                whileHover={{ y: -12 }}
                whileTap={{ scale: 0.97 }}
                onHoverStart={() => setHovered(id)}
                onHoverEnd={() => setHovered(null)}
                onClick={() => go(`/quiz/map/${id}`)}
              >
                {/* Name tag floating above island */}
                <AnimatePresence>
                  {isHov && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                      className="mb-3 px-4 py-2 rounded-xl flex flex-col items-center gap-0.5"
                      style={{ background: 'rgba(10,15,35,0.92)', border: `1.5px solid ${color}44`, boxShadow: `0 0 20px ${color}22` }}
                    >
                      <p style={{ fontFamily: 'var(--font-display)', fontSize: 18, letterSpacing: '0.06em', color }}>{label}</p>
                      <p style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--text-muted)' }}>{sub}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Island illustration */}
                <div
                  className="w-full"
                  style={{
                    filter: isHov ? `drop-shadow(0 0 20px ${color}55) drop-shadow(0 8px 24px rgba(0,0,0,0.6))` : 'drop-shadow(0 8px 20px rgba(0,0,0,0.5))',
                    transition: 'filter 0.3s',
                  }}
                >
                  <Island hovered={isHov} />
                </div>

                {/* Reward badge below island */}
                <div
                  className="mt-3 px-3 py-1.5 rounded-full flex items-center gap-1.5"
                  style={{ background: 'rgba(255,209,102,0.07)', border: '1px solid rgba(255,209,102,0.2)' }}
                >
                  <Trophy size={11} style={{ color: 'var(--gold)' }} />
                  <p style={{ fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 600, color: 'var(--gold)' }}>{reward}</p>
                </div>

                {/* Path label */}
                <motion.button
                  onClick={e => { e.stopPropagation(); go(`/quiz/map/${id}`); }}
                  className="mt-3 px-6 py-2 rounded-xl"
                  style={{
                    fontFamily: 'var(--font-display)', fontSize: 16, letterSpacing: '0.06em',
                    background: isHov ? color : 'rgba(255,255,255,0.06)',
                    color: isHov ? '#050818' : color,
                    border: `1.5px solid ${isHov ? color : color + '44'}`,
                    transition: 'background .25s, color .25s',
                  }}
                >
                  {label}
                </motion.button>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom ground gradient */}
        <div className="absolute bottom-0 inset-x-0 h-24 pointer-events-none" style={{ background: 'linear-gradient(to top, rgba(5,8,24,0.8), transparent)', zIndex: 5 }} />
      </div>
    </>
  );
}
