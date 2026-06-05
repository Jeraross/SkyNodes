import { useRef, useState } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'motion/react';
import gsap from 'gsap';
import { Trophy } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import QuizIntro from '../components/quiz/QuizIntro';
import ProfileModal from '../components/quiz/ProfileModal';
import { useQuizGame } from '../router/QuizGameContext';
import type { QuizMode } from '../data/quizPathData';

function DynIcon({ name, size = 14, color = 'currentColor' }: { name: string; size?: number; color?: string }) {
  const Comp = (LucideIcons as Record<string, React.FC<{ size?: number; color?: string }>>)[name];
  return Comp ? <Comp size={size} color={color} /> : <LucideIcons.User size={size} color={color} />;
}

// ── Shared theater constants ──────────────────────────────────────────────────

const FOLDS = `repeating-linear-gradient(
  90deg,
  #160303 0px,
  #320909 8px,
  #5C1111 18px,
  #7E1A1A 26px,
  #9B2525 32px,
  #B03030 36px,
  #9B2525 40px,
  #7E1A1A 48px,
  #5C1111 58px,
  #320909 68px,
  #160303 76px
)`;

const VALANCE_H = 62;

// ── Tassels row (full width) ──────────────────────────────────────────────────

function TasselsRow({ count = 36 }: { count?: number }) {
  return (
    <div className="absolute inset-x-0 flex items-start justify-around" style={{ top: 0, zIndex: 3, paddingTop: 4 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col items-center" style={{ gap: 0 }}>
          <div style={{ width: 5, height: 20, background: 'linear-gradient(180deg,#D4A017 0%,#FFD166 45%,#C8920F 100%)', borderRadius: '0 0 2px 2px' }} />
          <div style={{ width: 11, height: 11, borderRadius: '50%', background: 'radial-gradient(circle at 35% 35%,#FFE080,#B8820A)', marginTop: -1, boxShadow: '0 2px 4px rgba(0,0,0,0.55)' }} />
          <div style={{ width: 13, height: 14, background: `repeating-linear-gradient(180deg,#C8920F 0px,#C8920F 1px,transparent 1px,transparent 3px)`, marginTop: 1, opacity: 0.8 }} />
        </div>
      ))}
    </div>
  );
}

// ── Island SVG components (unchanged) ────────────────────────────────────────

function IslandAVD({ hovered }: { hovered: boolean }) {
  return (
    <svg viewBox="0 0 280 220" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      <ellipse cx="140" cy="210" rx="90" ry="14" fill="rgba(0,0,0,0.25)" />
      <ellipse cx="140" cy="175" rx="95" ry="38" fill="#1a3a5c" />
      <ellipse cx="140" cy="168" rx="88" ry="32" fill="#1e4a72" />
      <ellipse cx="140" cy="145" rx="90" ry="28" fill="#1b5e38" />
      <ellipse cx="140" cy="138" rx="86" ry="24" fill="#2d8a52" />
      <ellipse cx="115" cy="133" rx="28" ry="10" fill="#3fa865" opacity="0.6" />
      <rect x="100" y="80" width="14" height="52" rx="3" fill={hovered ? '#22D3EE' : '#0e7490'} style={{ transition: 'fill 0.3s' }} />
      <rect x="120" y="65" width="14" height="67" rx="3" fill={hovered ? '#38bdf8' : '#0284c7'} style={{ transition: 'fill 0.3s' }} />
      <rect x="140" y="90" width="14" height="42" rx="3" fill={hovered ? '#67e8f9' : '#0e7490'} style={{ transition: 'fill 0.3s' }} />
      <rect x="160" y="72" width="14" height="60" rx="3" fill={hovered ? '#22D3EE' : '#0284c7'} style={{ transition: 'fill 0.3s' }} />
      {hovered && <ellipse cx="140" cy="105" rx="55" ry="35" fill="rgba(34,211,238,0.1)" />}
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
      {[{cx:118,cy:105,r:9},{cx:160,cy:88,r:9},{cx:148,cy:120,r:9},{cx:105,cy:130,r:7},{cx:168,cy:118,r:7}].map((c,i)=>(
        <circle key={i} cx={c.cx} cy={c.cy} r={c.r} fill={hovered?'#A78BFA':'#6d28d9'} stroke={hovered?'#c4b5fd':'#8b5cf6'} strokeWidth="2" style={{transition:'fill 0.3s'}} />
      ))}
      {[[118,105,160,88],[160,88,148,120],[148,120,118,105],[118,105,105,130],[160,88,168,118],[148,120,168,118]].map(([x1,y1,x2,y2],i)=>(
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={hovered?'rgba(167,139,250,0.7)':'rgba(139,92,246,0.5)'} strokeWidth="2" style={{transition:'stroke 0.3s'}} />
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
      <rect x="88"  y="88" width="11" height="46" rx="2" fill={hovered?'#FFD166':'#b8860b'} style={{transition:'fill 0.3s'}} />
      <rect x="103" y="76" width="11" height="58" rx="2" fill={hovered?'#fbbf24':'#d4a017'} style={{transition:'fill 0.3s'}} />
      <rect x="118" y="94" width="11" height="40" rx="2" fill={hovered?'#FFD166':'#b8860b'} style={{transition:'fill 0.3s'}} />
      <path d="M138 75 L130 108 L140 108 L132 135 L152 100 L142 100 L150 75Z" fill={hovered?'#fff':'#fcd34d'} opacity="0.9" />
      {[{cx:162,cy:95,r:8},{cx:182,cy:112,r:8},{cx:165,cy:125,r:7}].map((c,i)=>(
        <circle key={i} cx={c.cx} cy={c.cy} r={c.r} fill={hovered?'#FFD166':'#b8860b'} stroke={hovered?'#fef3c7':'#d4a017'} strokeWidth="2" style={{transition:'fill 0.3s'}} />
      ))}
      {[[162,95,182,112],[182,112,165,125],[162,95,165,125]].map(([x1,y1,x2,y2],i)=>(
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={hovered?'rgba(255,209,102,0.8)':'rgba(180,130,0,0.5)'} strokeWidth="2" style={{transition:'stroke 0.3s'}} />
      ))}
      {hovered && <ellipse cx="140" cy="105" rx="60" ry="36" fill="rgba(255,209,102,0.08)" />}
      <line x1="58" y1="138" x2="58" y2="78" stroke="#8B6914" strokeWidth="3" strokeLinecap="round" />
      <polygon points="58,78 80,88 58,98" fill="#FFD166" />
    </svg>
  );
}

// ── Mode data ─────────────────────────────────────────────────────────────────

const MODES: { id: QuizMode; label: string; sub: string; reward: string; color: string; Island: React.FC<{hovered:boolean}> }[] = [
  { id:'avd',    label:'CAMINHO DE AVD',    sub:'Análise e Visualização de Dados',  reward:'Mestre dos Dados',  color:'#22D3EE', Island:IslandAVD    },
  { id:'grafos', label:'CAMINHO DE GRAFOS', sub:'Teoria e Algoritmos de Grafos',    reward:'Mestre dos Grafos', color:'#A78BFA', Island:IslandGrafos },
  { id:'mix',    label:'CAMINHO MIX',       sub:'AVD + Grafos — O Desafio Máximo',  reward:'Figurinhas Gamer',  color:'#FFD166', Island:IslandMix    },
];


// ── Stage floor ───────────────────────────────────────────────────────────────

function StageFloor() {
  return (
    <div className="absolute bottom-0 inset-x-0 pointer-events-none" style={{ height: '30%', zIndex: 2 }}>
      {/* Plank texture */}
      <div className="absolute inset-0" style={{
        background: `
          repeating-linear-gradient(
            180deg,
            #2A1605 0px, #351C07 6px, #42230A 12px, #351C07 18px, #2A1605 22px
          )
        `,
      }} />
      {/* Plank grain lines */}
      <div className="absolute inset-0" style={{
        background: `repeating-linear-gradient(90deg, transparent 0px, transparent 80px, rgba(0,0,0,0.18) 80px, rgba(0,0,0,0.18) 81px)`,
      }} />
      {/* Top edge highlight */}
      <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'rgba(255,200,100,0.18)' }} />
      {/* Ambient reflection */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(180deg, rgba(255,200,100,0.06) 0%, transparent 40%)',
      }} />
      {/* Footlights row */}
      <div className="absolute inset-x-0 top-0 flex justify-center gap-8 -translate-y-1/2" style={{ zIndex: 3 }}>
        {Array.from({length: 9}).map((_,i)=>(
          <div key={i} style={{
            width: 14, height: 14, borderRadius: '50%',
            background: 'radial-gradient(circle, #FFF8D0 0%, #FFD166 50%, #C8920F 100%)',
            boxShadow: '0 0 10px 4px rgba(255,209,102,0.45)',
          }} />
        ))}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function QuizModeSelect() {
  const [, navigate]                    = useLocation();
  const { sessionPlayer, playerIcon }   = useQuizGame();
  const [showIntro, setShowIntro]       = useState(true);
  const [hovered, setHovered]           = useState<QuizMode | null>(null);
  const [profileOpen, setProfileOpen]   = useState(false);

  const pageRef  = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);

  const handleIntroEnd = () => {
    setShowIntro(false);
    const tl = gsap.timeline();
    tl.fromTo(pageRef.current,  { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'power2.out' });
    tl.fromTo(titleRef.current, { opacity: 0, y: -12 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' }, '-=0.2');
    tl.fromTo(cardsRef.current, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.55, ease: 'back.out(1.3)' }, '-=0.3');
  };

  const go = (to: string) =>
    gsap.to(pageRef.current, { opacity: 0, duration: 0.3, ease: 'power2.in', onComplete: () => navigate(to) });

  const goBack = () =>
    gsap.to(pageRef.current, { x: '100vw', opacity: 0, duration: 0.35, ease: 'power3.in', onComplete: () => navigate('/') });

  return (
    <>
      {showIntro && <QuizIntro onComplete={handleIntroEnd} />}
      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />

      <div
        ref={pageRef}
        className="fixed inset-0 z-50 flex flex-col overflow-hidden"
        style={{
          background: '#08050C',
          opacity: showIntro ? 0 : 1,
        }}
      >
        {/* ── Stage ambient back wall ────────────────────────────────── */}
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0,
          background: 'radial-gradient(ellipse 80% 60% at 50% 30%, #160A22 0%, #08050C 70%)',
        }} />

        {/* ── Stage floor ────────────────────────────────────────────── */}
        <StageFloor />

        {/* ── Partial side curtain wings ─────────────────────────────── */}
        <div className="absolute top-0 left-0 h-full pointer-events-none" style={{ width: 72, zIndex: 8 }}>
          <div className="absolute inset-0" style={{ background: FOLDS }} />
          <div className="absolute inset-y-0 right-0 w-10" style={{ background: 'linear-gradient(to right,transparent,rgba(0,0,0,0.7))' }} />
          <div className="absolute inset-y-0 right-0" style={{ width: 2, background: 'linear-gradient(180deg,#FFE080,#B8820A 25%,#FFD166 50%,#B8820A 75%,#FFE080)' }} />
        </div>
        <div className="absolute top-0 right-0 h-full pointer-events-none" style={{ width: 72, zIndex: 8 }}>
          <div className="absolute inset-0" style={{ background: FOLDS, transform: 'scaleX(-1)' }} />
          <div className="absolute inset-y-0 left-0 w-10" style={{ background: 'linear-gradient(to left,transparent,rgba(0,0,0,0.7))' }} />
          <div className="absolute inset-y-0 left-0" style={{ width: 2, background: 'linear-gradient(180deg,#FFE080,#B8820A 25%,#FFD166 50%,#B8820A 75%,#FFE080)' }} />
        </div>

        {/* ── VALANCE BAR — apenas tassels, sem nav ─────────────────── */}
        <div
          className="absolute top-0 inset-x-0"
          style={{
            height: VALANCE_H,
            background: 'linear-gradient(180deg,#1A0606 0%,#3A0C0C 65%,#280808 100%)',
            borderBottom: '3px solid #C8920F',
            boxShadow: '0 6px 32px rgba(0,0,0,0.85)',
            zIndex: 20,
          }}
        >
          <div className="absolute inset-x-0 bottom-0 h-px" style={{ background: 'linear-gradient(90deg,#B8820A,#FFE080 20%,#FFD166 50%,#FFE080 80%,#B8820A)' }} />
          <div className="absolute inset-0" style={{ background: `repeating-linear-gradient(90deg,transparent 0px,transparent 28px,rgba(200,146,15,0.12) 28px,rgba(200,146,15,0.12) 30px)` }} />
          <TasselsRow count={36} />
        </div>

        {/* ── Stage content area ─────────────────────────────────────── */}
        <div className="relative flex flex-col flex-1" style={{ paddingTop: VALANCE_H, zIndex: 5 }}>

          {/* Nav bar — abaixo da valance, livre dos tassels */}
          <div className="flex items-center justify-between px-20 py-2.5"
            style={{ borderBottom: '1px solid rgba(200,146,15,0.1)' }}>
            <button
              onClick={goBack}
              style={{ fontFamily:'var(--font-ui)', fontSize:12, fontWeight:500, color:'rgba(255,209,102,0.5)', cursor:'pointer', letterSpacing:'0.08em', transition:'color .2s' }}
              onMouseEnter={e=>(e.currentTarget.style.color='#FFD166')}
              onMouseLeave={e=>(e.currentTarget.style.color='rgba(255,209,102,0.5)')}
            >← VOLTAR</button>
            <div className="flex items-center gap-6">
              <button onClick={()=>go('/leaderboard')} className="flex items-center gap-1.5"
                style={{ fontFamily:'var(--font-ui)', fontSize:12, fontWeight:500, color:'rgba(255,209,102,0.5)', cursor:'pointer', letterSpacing:'0.08em', transition:'color .2s' }}
                onMouseEnter={e=>(e.currentTarget.style.color='#FFD166')}
                onMouseLeave={e=>(e.currentTarget.style.color='rgba(255,209,102,0.5)')}>
                <Trophy size={13} /> RANKING
              </button>
              <button onClick={() => setProfileOpen(true)} className="flex items-center gap-1.5"
                style={{ fontFamily:'var(--font-ui)', fontSize:12, fontWeight:500, color:'rgba(255,209,102,0.5)', cursor:'pointer', letterSpacing:'0.08em', transition:'color .2s' }}
                onMouseEnter={e=>(e.currentTarget.style.color='#FFD166')}
                onMouseLeave={e=>(e.currentTarget.style.color='rgba(255,209,102,0.5)')}>
                <DynIcon name={playerIcon} size={13} color="currentColor" />
                {sessionPlayer ?? 'PERFIL'}
              </button>
            </div>
          </div>

          {/* Subtitle */}
          <div ref={titleRef} className="text-center pt-4 pb-1">
            <p style={{ fontFamily:'var(--font-ui)', fontSize:13, color:'rgba(255,209,102,0.5)', letterSpacing:'0.22em', fontWeight:500 }}>
              — ESCOLHA SEU CAMINHO —
            </p>
          </div>

          {/* ── 3 stage columns: spotlight + card alinhados ────────── */}
          <div
            ref={cardsRef}
            className="flex-1 flex justify-center gap-6 px-24 overflow-hidden"
            style={{ paddingBottom: '2%' }}
          >
            {MODES.map(({ id, label, sub, reward, color, Island }, idx) => {
              const isHov = hovered === id;
              const isMid = idx === 1;

              return (
                /* Each column fills full height — spotlight goes from top, card sits at bottom */
                <div
                  key={id}
                  className="relative flex flex-col items-center justify-end flex-1"
                  style={{ maxWidth: 300 }}
                >
                  {/* Spotlight cone — positioned inside this column, fills from top */}
                  <div
                    className="absolute inset-x-0 top-0 pointer-events-none"
                    style={{
                      bottom: '28%',
                      background: `linear-gradient(180deg, ${color}28 0%, ${color}10 55%, transparent 100%)`,
                      clipPath: 'polygon(22% 0%, 78% 0%, 100% 100%, 0% 100%)',
                      transition: 'opacity 0.4s',
                      opacity: isHov ? 1 : 0.55,
                    }}
                  />

                  {/* Card — aligned to bottom of column */}
                  <motion.div
                    className="flex flex-col items-center cursor-pointer w-full"
                    style={{ marginBottom: isMid ? 36 : 0, paddingBottom: '30%' }}
                    whileHover={{ y: -14 }}
                    whileTap={{ scale: 0.97 }}
                    onHoverStart={() => setHovered(id)}
                    onHoverEnd={()   => setHovered(null)}
                    onClick={() => go(`/quiz/map/${id}`)}
                  >
                    {/* Floating nameplate */}
                    <AnimatePresence>
                      {isHov && (
                        <motion.div
                          initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:6 }}
                          transition={{ duration: 0.18 }}
                          className="mb-3 px-5 py-2.5 rounded-xl flex flex-col items-center gap-0.5"
                          style={{ background:'rgba(8,5,12,0.95)', border:`1.5px solid ${color}55`, boxShadow:`0 0 24px ${color}28` }}
                        >
                          <p style={{ fontFamily:'var(--font-display)', fontSize:17, letterSpacing:'0.06em', color }}>{label}</p>
                          <p style={{ fontFamily:'var(--font-ui)', fontSize:11, color:'rgba(255,255,255,0.45)' }}>{sub}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Island */}
                    <div className="relative w-full">
                      {/* Floor pool glow */}
                      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 pointer-events-none" style={{
                        width: '75%', height: 28,
                        background: `radial-gradient(ellipse 100% 100%, ${color}40 0%, transparent 70%)`,
                        borderRadius: '50%',
                        filter: 'blur(5px)',
                      }} />
                      <div style={{
                        filter: isHov
                          ? `drop-shadow(0 0 22px ${color}66) drop-shadow(0 10px 28px rgba(0,0,0,0.65))`
                          : 'drop-shadow(0 10px 22px rgba(0,0,0,0.55))',
                        transition: 'filter 0.3s',
                      }}>
                        <Island hovered={isHov} />
                      </div>
                    </div>

                    {/* Reward badge */}
                    <div className="mt-2 px-3 py-1 rounded-full flex items-center gap-1.5"
                      style={{ background:'rgba(255,209,102,0.07)', border:'1px solid rgba(255,209,102,0.2)' }}>
                      <Trophy size={10} style={{ color:'var(--gold)' }} />
                      <p style={{ fontFamily:'var(--font-ui)', fontSize:11, fontWeight:600, color:'var(--gold)' }}>{reward}</p>
                    </div>

                    {/* CTA */}
                    <motion.button
                      className="mt-3 px-6 py-2 rounded-xl"
                      style={{
                        fontFamily:'var(--font-display)', fontSize:15, letterSpacing:'0.06em',
                        background: isHov ? color : 'rgba(255,255,255,0.05)',
                        color:      isHov ? '#08050C' : color,
                        border:     `1.5px solid ${isHov ? color : color + '44'}`,
                        transition: 'background .22s, color .22s, border-color .22s',
                      }}
                    >
                      {label}
                    </motion.button>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
