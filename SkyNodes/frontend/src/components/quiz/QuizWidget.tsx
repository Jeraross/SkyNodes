import { useRef, useCallback } from 'react';
import { useLocation } from 'wouter';
import gsap from 'gsap';

const OVERLAY_ID = 'quiz-curtain-overlay';

const FOLDS = `repeating-linear-gradient(
  90deg,
  #160303 0px, #320909 8px, #5C1111 18px,
  #7E1A1A 26px, #9B2525 32px, #B03030 36px,
  #9B2525 40px, #7E1A1A 48px, #5C1111 58px,
  #320909 68px, #160303 76px
)`;

const VALANCE_H = 62;
const TASSEL_N  = 36;

function buildTasselsCSS() {
  return `repeating-linear-gradient(
    90deg,
    rgba(212,160,23,0.9) 0px, rgba(212,160,23,0.9) 3px,
    transparent 3px, transparent 10px
  )`;
}

interface Props {
  onClick?: () => void; // kept for API compat but unused
}

export default function QuizWidget(_: Props) {
  const [, navigate]  = useLocation();
  const widgetRef = useRef<HTMLDivElement>(null);
  const markRef   = useRef<HTMLSpanElement>(null);
  const haloRef   = useRef<HTMLDivElement>(null);

  const onEnter = useCallback(() => {
    gsap.to(haloRef.current,  { opacity: 1, duration: 0.25 });
    gsap.to(markRef.current,  { scale: 1.15, textShadow: '0 0 22px rgba(255,209,102,0.95)', duration: 0.25, ease: 'power2.out' });
    gsap.to(widgetRef.current, { y: -5, duration: 0.2, ease: 'power2.out' });
  }, []);

  const onLeave = useCallback(() => {
    gsap.to(haloRef.current,  { opacity: 0, duration: 0.25 });
    gsap.to(markRef.current,  { scale: 1,   textShadow: '0 0 12px rgba(255,209,102,0.5)', duration: 0.25 });
    gsap.to(widgetRef.current, { y: 0, duration: 0.25, ease: 'power2.inOut' });
  }, []);

  const handleClick = useCallback(() => {
    if (!widgetRef.current) return;
    const rect = widgetRef.current.getBoundingClientRect();

    // Build overlay imperatively on document.body so it survives React unmount
    const existing = document.getElementById(OVERLAY_ID);
    if (existing) existing.remove();

    const ov = document.createElement('div');
    ov.id = OVERLAY_ID;
    Object.assign(ov.style, {
      position: 'fixed',
      top: `${rect.top}px`, left: `${rect.left}px`,
      width: `${rect.width}px`, height: `${rect.height}px`,
      zIndex: '9999', borderRadius: '12px', overflow: 'hidden',
      background: '#08050C',
    });

    // Overlay é só fundo escuro — sem tentar replicar textura de cortina,
    // o QuizIntro monta com suas próprias cortinas antes de este ser removido.
    document.body.appendChild(ov);

    gsap.to(ov, {
      top: 0, left: 0,
      width: '100vw', height: '100vh',
      borderRadius: 0,
      duration: 0.52,
      ease: 'power3.inOut',
      onComplete: () => {
        sessionStorage.setItem('quiz_curtain_transition', '1');
        navigate('/quiz');
      },
    });
  }, [navigate]);

  return (
    <>
      {/* ── Widget ───────────────────────────────────────────────────── */}
      <div
        className="fixed z-40 select-none cursor-pointer"
        style={{ bottom: 148, right: 16 }}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        onClick={handleClick}
      >
        {/* Halo glow */}
        <div ref={haloRef} className="absolute pointer-events-none" style={{
          inset: -12, opacity: 0,
          background: 'radial-gradient(ellipse 80% 75% at 50% 50%, rgba(255,209,102,0.22) 0%, transparent 70%)',
          borderRadius: 20,
        }} />

        {/* Card */}
        <div
          ref={widgetRef}
          className="relative overflow-hidden"
          style={{
            width: 96, height: 128,
            border: '2px solid #C8920F',
            borderRadius: 12,
            boxShadow: '0 0 10px rgba(200,146,15,0.22), 0 4px 14px rgba(0,0,0,0.6)',
            background: '#08050C',
          }}
        >
          {/* Mini valance */}
          <div className="absolute top-0 inset-x-0" style={{
            height: 22,
            background: 'linear-gradient(180deg,#1A0606,#3A0C0C)',
            borderBottom: '1.5px solid #C8920F',
            zIndex: 4,
          }}>
            {/* Mini tassels */}
            <div className="absolute inset-x-0 flex justify-around" style={{ top: 3, paddingInline: 4 }}>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div style={{ width: 3, height: 8, background: '#FFD166', borderRadius: '0 0 2px 2px', opacity: 0.85 }} />
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'radial-gradient(circle at 35% 35%,#FFE080,#B8820A)', marginTop: -1 }} />
                </div>
              ))}
            </div>
          </div>

          {/* Left curtain panel */}
          <div className="absolute top-0 left-0 h-full" style={{ width: '50%', background: FOLDS, zIndex: 2 }} />
          {/* Right curtain panel */}
          <div className="absolute top-0 right-0 h-full" style={{ width: '50%', background: FOLDS, transform: 'scaleX(-1)', zIndex: 2 }} />

          {/* Center gap shadow */}
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2" style={{
            width: 10, zIndex: 3,
            background: 'linear-gradient(to right,rgba(0,0,0,0.55),rgba(0,0,0,0.8),rgba(0,0,0,0.55))',
          }} />

          {/* "?" floating above curtains */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5" style={{ zIndex: 5 }}>
            <span
              ref={markRef}
              style={{
                fontFamily: 'var(--font-display, serif)',
                fontSize: 36, lineHeight: 1,
                color: '#FFD166',
                textShadow: '0 0 12px rgba(255,209,102,0.5)',
                display: 'block',
              }}
            >?</span>
            <span style={{
              fontFamily: 'var(--font-display, "Press Start 2P", monospace)',
              fontSize: 10, letterSpacing: '0.1em',
              color: '#FFD166',
              textShadow: '0 0 8px rgba(255,209,102,0.45)',
            }}>QUIZ</span>
          </div>
        </div>
      </div>
    </>
  );
}
