import { useRef, useCallback } from 'react';
import { useLocation } from 'wouter';
import gsap from 'gsap';
import SwipeButton from '../ui/SwipeButton';

const OVERLAY_ID = 'quiz-curtain-overlay';

interface Props {
  onClick?: () => void;
}

export default function QuizWidget(_: Props) {
  const [, navigate] = useLocation();
  const btnRef = useRef<HTMLButtonElement>(null);

  const onEnter = useCallback(() => {
    gsap.to(btnRef.current, { y: -5, duration: 0.2, ease: 'power2.out' });
  }, []);

  const onLeave = useCallback(() => {
    gsap.to(btnRef.current, { y: 0, duration: 0.25, ease: 'power2.inOut' });
  }, []);

  const handleClick = useCallback(() => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();

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
    <div className="fixed z-40" style={{ bottom: 148, right: 16 }}>
      <SwipeButton
        ref={btnRef}
        firstText="QUIZ"
        secondText="Jogar!"
        firstClass="bg-[#C8920F] text-[#08050C]"
        secondClass="bg-[#08050C] text-[#FFD166]"
        className="border-2 border-[#C8920F] shadow-[0_0_10px_rgba(200,146,15,0.35),0_4px_14px_rgba(0,0,0,0.6)]"
        onClick={handleClick}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
      />
    </div>
  );
}
