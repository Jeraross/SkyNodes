/* eslint-disable @typescript-eslint/no-explicit-any */
import { type CSSProperties, useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface Props {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  ease?: string;
  splitType?: 'chars' | 'words' | 'lines';
  from?: Record<string, unknown>;
  to?: Record<string, unknown>;
  textAlign?: string;
  tag?: string;
  onLetterAnimationComplete?: () => void;
}

export default function SplitText({
  text,
  className = '',
  delay = 65,
  duration = 0.7,
  ease = 'power3.out',
  splitType = 'words',
  from = { opacity: 0, y: 24, filter: 'blur(6px)' },
  to = { opacity: 1, y: 0, filter: 'blur(0px)' },
  textAlign = 'left',
  tag = 'p',
  onLetterAnimationComplete,
}: Props) {
  const containerRef = useRef<HTMLElement>(null);

  const units =
    splitType === 'chars'
      ? text.split('')
      : splitType === 'lines'
        ? text.split('\n')
        : text.split(' ');

  useEffect(() => {
    const els = containerRef.current?.querySelectorAll<HTMLSpanElement>('.split-unit');
    if (!els || els.length === 0) return;
    const tween = gsap.fromTo(els, { ...from }, {
      ...to, duration, ease, stagger: delay / 1000,
      onComplete: onLetterAnimationComplete,
    });
    return () => { tween.kill(); };
  }, [text, delay, duration, ease, from, to, onLetterAnimationComplete]);

  const Tag = tag as any;
  return (
    <Tag
      ref={containerRef}
      className={`split-parent ${className}`}
      style={{ textAlign: textAlign as CSSProperties['textAlign'], display: 'block' }}
    >
      {units.map((unit, i) => (
        <span
          key={i}
          className="split-unit"
          style={{ display: 'inline-block', whiteSpace: splitType === 'chars' ? 'pre' : undefined }}
        >
          {unit}{splitType === 'words' && i < units.length - 1 ? ' ' : ''}
        </span>
      ))}
    </Tag>
  );
}
