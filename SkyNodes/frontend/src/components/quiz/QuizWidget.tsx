import { useRef, useCallback } from 'react';
import gsap from 'gsap';

const PIXEL = { fontFamily: "'Press Start 2P', monospace" };

interface Props {
  onClick: () => void;
}

export default function QuizWidget({ onClick }: Props) {
  const markRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const onEnter = useCallback(() => {
    gsap.to(markRef.current, { rotateY: 360, duration: 0.6, ease: 'power2.out' });
    gsap.to(cardRef.current, { boxShadow: '0 0 22px rgba(6,182,212,0.65)', duration: 0.3 });
  }, []);

  const onLeave = useCallback(() => {
    gsap.to(markRef.current, { rotateY: 0, duration: 0.4, ease: 'power2.inOut' });
    gsap.to(cardRef.current, { boxShadow: '0 0 8px rgba(6,182,212,0.2)', duration: 0.3 });
  }, []);

  return (
    <div
      className="fixed z-40 select-none cursor-pointer"
      style={{ bottom: 148, right: 16, width: 96, height: 120, rotate: '6deg' }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onClick={onClick}
    >
      {/* Spine */}
      <div
        className="absolute left-0 top-0 h-full rounded-l-sm"
        style={{ width: 12, background: 'linear-gradient(90deg, #0d2044, #1e3a5f)' }}
      />

      {/* Card body */}
      <div
        ref={cardRef}
        className="absolute inset-0 flex flex-col items-center justify-between py-3 rounded-r-sm"
        style={{
          marginLeft: 12,
          background: 'linear-gradient(160deg, #0f172a, #1e2d45 60%, #0f172a)',
          boxShadow: '0 0 8px rgba(6,182,212,0.2)',
          border: '1px solid rgba(6,182,212,0.25)',
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, transparent, transparent 7px, rgba(255,255,255,0.025) 8px)',
            borderRadius: 'inherit',
          }}
        />

        <p
          style={{ ...PIXEL, fontSize: 5 }}
          className="relative z-10 text-cyan-400 tracking-wider text-center leading-relaxed mt-1"
        >
          QUIZ
        </p>

        <div
          ref={markRef}
          className="relative z-10 flex items-center justify-center"
          style={{ perspective: 400 }}
        >
          <span
            style={{ ...PIXEL, fontSize: 28 }}
            className="text-cyan-400 leading-none drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]"
          >
            ?
          </span>
        </div>

        <div style={{ height: 8 }} />
      </div>
    </div>
  );
}