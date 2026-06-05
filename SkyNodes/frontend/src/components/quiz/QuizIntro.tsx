import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import logoQuiz from '../../assets/logo_quiz.png';

interface Props {
  onComplete: () => void;
}

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

const TASSEL_COUNT = 16;

function Tassels() {
  return (
    <div
      className="absolute top-0 left-0 right-0 flex items-start justify-around"
      style={{ zIndex: 3, paddingTop: 2 }}
    >
      {Array.from({ length: TASSEL_COUNT }).map((_, i) => (
        <div key={i} className="flex flex-col items-center" style={{ gap: 0 }}>
          {/* Tassel cord */}
          <div style={{
            width: 5,
            height: 22,
            background: 'linear-gradient(180deg, #D4A017 0%, #FFD166 40%, #C8920F 100%)',
            borderRadius: '0 0 2px 2px',
          }} />
          {/* Tassel ball */}
          <div style={{
            width: 11,
            height: 11,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 35%, #FFE080, #B8820A)',
            marginTop: -1,
            boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
          }} />
          {/* Tassel fringe */}
          <div style={{
            width: 13,
            height: 16,
            background: `repeating-linear-gradient(180deg,
              #C8920F 0px, #C8920F 1px,
              transparent 1px, transparent 3px
            )`,
            marginTop: 1,
            opacity: 0.85,
          }} />
        </div>
      ))}
    </div>
  );
}

export default function QuizIntro({ onComplete }: Props) {
  const overlayRef  = useRef<HTMLDivElement>(null);
  const leftRef     = useRef<HTMLDivElement>(null);
  const rightRef    = useRef<HTMLDivElement>(null);
  const valanceRef  = useRef<HTMLDivElement>(null);
  const spotRef     = useRef<HTMLDivElement>(null);
  const logoRef     = useRef<HTMLDivElement>(null);
  const glowRef     = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fromWidget = sessionStorage.getItem('quiz_curtain_transition') === '1';
    if (fromWidget) sessionStorage.removeItem('quiz_curtain_transition');

    // Set initial states
    gsap.set(spotRef.current,  { opacity: 0, scaleY: 0, transformOrigin: 'top center' });
    gsap.set(glowRef.current,  { opacity: 0 });
    gsap.set(logoRef.current,  { opacity: 0, scale: 0.82, y: 20 });

    const tl = gsap.timeline({ onComplete });

    // 1. Scene appears — instant if coming from widget (overlay still covers screen)
    if (fromWidget) {
      gsap.set(overlayRef.current, { opacity: 1 });
      // Double-RAF: garante que o browser pintou o QuizIntro antes de remover o overlay
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          document.getElementById('quiz-curtain-overlay')?.remove();
        });
      });
    } else {
      tl.fromTo(overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.35, ease: 'power2.out' },
      );
    }

    // 2. Spotlight descends from above — anticipation
    tl.to(spotRef.current,
      { opacity: 1, scaleY: 1, duration: 0.9, ease: 'power2.out' },
      '-=0.05',
    );

    // 3. Brief dramatic pause
    tl.to({}, { duration: 0.45 });

    // 4. Curtains slide open with slight overshoot (fabric inertia)
    tl.to(leftRef.current, {
      x: '-100%',
      duration: 1.5,
      ease: 'power3.inOut',
    });
    tl.to(rightRef.current, {
      x: '100%',
      duration: 1.5,
      ease: 'power3.inOut',
    }, '<');

    // 4b. Fabric wobble at end of travel
    tl.to(leftRef.current, {
      x: '-97%',
      duration: 0.18,
      ease: 'power1.out',
    });
    tl.to(rightRef.current, {
      x: '97%',
      duration: 0.18,
      ease: 'power1.out',
    }, '<');
    tl.to(leftRef.current, {
      x: '-100%',
      duration: 0.22,
      ease: 'power1.inOut',
    });
    tl.to(rightRef.current, {
      x: '100%',
      duration: 0.22,
      ease: 'power1.inOut',
    }, '<');

    // 5. Stage glow floods in
    tl.to(glowRef.current, { opacity: 1, duration: 0.5, ease: 'power2.out' }, '-=0.4');

    // 6. Logo rises into spotlight
    tl.to(logoRef.current,
      { opacity: 1, scale: 1, y: 0, duration: 0.65, ease: 'back.out(1.5)' },
      '-=0.35',
    );

    // 7. Hold
    tl.to({}, { duration: 1.0 });

    // 8. Fade to black
    tl.to(overlayRef.current,
      { opacity: 0, duration: 0.55, ease: 'power2.in' },
    );

    return () => { tl.kill(); };
  }, []);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[200] overflow-hidden"
      style={{ background: '#080306' }}
    >
      {/* Stage floor ambient glow */}
      <div className="absolute inset-x-0 bottom-0 h-48 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 70% 100% at 50% 100%, rgba(255,209,102,0.06) 0%, transparent 100%)' }} />

      {/* Spotlight cone from top */}
      <div
        ref={spotRef}
        className="absolute pointer-events-none"
        style={{
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '56vw',
          height: '100vh',
          background: [
            'conic-gradient(from -12deg at 50% -2%,',
            '  transparent 0deg,',
            '  rgba(255,240,180,0.07) 8deg,',
            '  rgba(255,225,130,0.11) 12deg,',
            '  rgba(255,240,180,0.07) 16deg,',
            '  transparent 24deg)',
          ].join(' '),
          clipPath: 'polygon(35% 0%, 65% 0%, 100% 100%, 0% 100%)',
        }}
      />

      {/* Spotlight core (brighter center) */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '24vw',
          height: '90vh',
          background: 'linear-gradient(180deg, rgba(255,245,200,0.09) 0%, transparent 85%)',
          clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)',
        }}
      />

      {/* Reveal glow (appears after curtains open) */}
      <div
        ref={glowRef}
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 55% 45% at 50% 48%, rgba(255,209,102,0.07) 0%, transparent 70%)',
        }}
      />

      {/* ── LEFT CURTAIN ──────────────────────────────────────────────────── */}
      <div
        ref={leftRef}
        className="absolute top-0 left-0 h-full"
        style={{ width: '52%', zIndex: 10 }}
      >
        {/* Fold body */}
        <div className="absolute inset-0" style={{
          background: FOLDS,
        }} />

        {/* Edge shadow where curtains meet */}
        <div className="absolute right-0 top-0 h-full w-20 pointer-events-none" style={{
          background: 'linear-gradient(to right, transparent, rgba(0,0,0,0.75))',
        }} />

        {/* Gold border on the leading edge */}
        <div className="absolute right-0 top-0 h-full" style={{
          width: 3,
          background: 'linear-gradient(180deg, #FFE080 0%, #B8820A 25%, #FFD166 50%, #B8820A 75%, #FFE080 100%)',
          zIndex: 2,
        }} />

        {/* Tassels */}
        <Tassels />
      </div>

      {/* ── RIGHT CURTAIN ─────────────────────────────────────────────────── */}
      <div
        ref={rightRef}
        className="absolute top-0 right-0 h-full"
        style={{ width: '52%', zIndex: 10 }}
      >
        {/* Fold body (mirrored) */}
        <div className="absolute inset-0" style={{
          background: FOLDS,
          transform: 'scaleX(-1)',
        }} />

        {/* Edge shadow where curtains meet */}
        <div className="absolute left-0 top-0 h-full w-20 pointer-events-none" style={{
          background: 'linear-gradient(to left, transparent, rgba(0,0,0,0.75))',
        }} />

        {/* Gold border on the leading edge */}
        <div className="absolute left-0 top-0 h-full" style={{
          width: 3,
          background: 'linear-gradient(180deg, #FFE080 0%, #B8820A 25%, #FFD166 50%, #B8820A 75%, #FFE080 100%)',
          zIndex: 2,
        }} />

        {/* Tassels */}
        <Tassels />
      </div>

      {/* ── TOP VALANCE BAR ───────────────────────────────────────────────── */}
      <div
        ref={valanceRef}
        className="absolute top-0 left-0 right-0"
        style={{
          zIndex: 20,
          height: 54,
          background: 'linear-gradient(180deg, #1A0606 0%, #3A0C0C 60%, #2A0808 100%)',
          borderBottom: '3px solid #C8920F',
          boxShadow: '0 4px 24px rgba(0,0,0,0.8)',
        }}
      >
        {/* Valance gold trim stripe */}
        <div className="absolute inset-x-0 bottom-0 h-1" style={{
          background: 'linear-gradient(90deg, #B8820A, #FFE080 20%, #FFD166 50%, #FFE080 80%, #B8820A)',
        }} />

        {/* Valance decorative pattern */}
        <div className="absolute inset-x-0 top-0 h-full" style={{
          background: `repeating-linear-gradient(
            90deg,
            transparent 0px,
            transparent 28px,
            rgba(200,146,15,0.15) 28px,
            rgba(200,146,15,0.15) 30px
          )`,
        }} />
      </div>

      {/* ── LOGO ──────────────────────────────────────────────────────────── */}
      <div
        ref={logoRef}
        className="absolute inset-0 flex items-center justify-center"
        style={{ zIndex: 5 }}
      >
        <img
          src={logoQuiz}
          alt="Show do Grafão"
          style={{
            width: 'min(520px, 78vw)',
            filter: [
              'drop-shadow(0 0 48px rgba(255,209,102,0.65))',
              'drop-shadow(0 0 90px rgba(34,93,211,0.35))',
              'drop-shadow(0 8px 32px rgba(0,0,0,0.9))',
            ].join(' '),
          }}
          draggable={false}
        />
      </div>
    </div>
  );
}
