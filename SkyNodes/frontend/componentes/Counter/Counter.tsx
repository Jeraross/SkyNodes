import { MotionValue, motion, useSpring, useTransform } from 'motion/react';
import type React from 'react';
import { useEffect } from 'react';

type PlaceValue = number | '.';

function Number({ mv, number, height }: { mv: MotionValue<number>; number: number; height: number }) {
  const y = useTransform(mv, latest => {
    const placeValue = latest % 10;
    const offset = (10 + number - placeValue) % 10;
    let memo = offset * height;
    if (offset > 5) memo -= 10 * height;
    return memo;
  });
  return (
    <motion.span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', y }}>
      {number}
    </motion.span>
  );
}

function normalizeNearInteger(num: number): number {
  const nearest = Math.round(num);
  const tolerance = 1e-9 * Math.max(1, Math.abs(num));
  return Math.abs(num - nearest) < tolerance ? nearest : num;
}

function Digit({ place, value, height, digitStyle }: { place: PlaceValue; value: number; height: number; digitStyle?: React.CSSProperties }) {
  if (place === '.') {
    return <span className="relative inline-flex items-center justify-center" style={{ height, width: 'fit-content', ...digitStyle }}>.</span>;
  }
  const valueRounded = Math.floor(normalizeNearInteger(value / place));
  const animatedValue = useSpring(valueRounded);
  useEffect(() => { animatedValue.set(valueRounded); }, [animatedValue, valueRounded]);
  return (
    <span className="relative inline-flex overflow-hidden" style={{ height, position: 'relative', width: '1ch', fontVariantNumeric: 'tabular-nums', ...digitStyle }}>
      {Array.from({ length: 10 }, (_, i) => <Number key={i} mv={animatedValue} number={i} height={height} />)}
    </span>
  );
}

interface CounterProps {
  value: number;
  fontSize?: number;
  places?: PlaceValue[];
  gap?: number;
  textColor?: string;
  fontWeight?: React.CSSProperties['fontWeight'];
  gradientFrom?: string;
  gradientHeight?: number;
}

export default function Counter({
  value,
  fontSize = 48,
  places = [...value.toString()].map((ch, i, a) => {
    if (ch === '.') return '.';
    const dotIndex = a.indexOf('.');
    const isInteger = dotIndex === -1;
    const exponent = isInteger ? a.length - i - 1 : i < dotIndex ? dotIndex - i - 1 : -(i - dotIndex);
    return 10 ** exponent;
  }),
  gap = 2,
  textColor = 'inherit',
  fontWeight = 'bold',
  gradientFrom = '#020617',
  gradientHeight = 12,
}: CounterProps) {
  const height = fontSize + 4;
  return (
    <span style={{ position: 'relative', display: 'inline-block' }}>
      <span style={{ fontSize, display: 'flex', gap, overflow: 'hidden', lineHeight: 1, color: textColor, fontWeight, direction: 'ltr' }}>
        {places.map((place, i) => <Digit key={i} place={place} value={value} height={height} />)}
      </span>
      <span style={{ pointerEvents: 'none', position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <span style={{ height: gradientHeight, background: `linear-gradient(to bottom, ${gradientFrom}, transparent)` }} />
        <span style={{ height: gradientHeight, background: `linear-gradient(to top, ${gradientFrom}, transparent)` }} />
      </span>
    </span>
  );
}
