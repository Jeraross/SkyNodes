// src/game/ui/DialogueOverlay.tsx
import { useEffect, useState } from 'react';
import type { DialogueSequence } from '../types';

interface DialogueOverlayProps {
  queue: DialogueSequence[];
  onAdvance: () => void;
}

const TYPE_SPEED_MS = 22;

const SPEAKER_COLOR: Record<string, string> = {
  AGENTE_J: '#ffd700',
  LIA: '#00ffff',
  PRESIDENTE: '#ff8800',
  GLITCH_FRAGMENTO: '#ff0000',
};

export default function DialogueOverlay({ queue, onAdvance }: DialogueOverlayProps) {
  const [lineIndex, setLineIndex] = useState(0);
  const [visibleChars, setVisibleChars] = useState(0);
  const [blink, setBlink] = useState(true);

  const current = queue[0];
  const line = current?.lines[lineIndex];
  const fullText = line?.text ?? '';
  const isTyping = visibleChars < fullText.length;

  // reset when sequence changes
  useEffect(() => {
    setLineIndex(0);
    setVisibleChars(0);
  }, [current?.id]);

  // typewriter effect
  useEffect(() => {
    if (!isTyping) return;
    const t = setTimeout(() => setVisibleChars(v => v + 1), TYPE_SPEED_MS);
    return () => clearTimeout(t);
  }, [isTyping, visibleChars]);

  // blinking cursor
  useEffect(() => {
    const t = setInterval(() => setBlink(b => !b), 530);
    return () => clearInterval(t);
  }, []);

  if (!current || !line) return null;

  const handleAdvance = () => {
    if (isTyping) {
      setVisibleChars(fullText.length);
      return;
    }
    const isLast = lineIndex >= current.lines.length - 1;
    if (isLast) {
      current.onComplete?.();
      onAdvance();
      setLineIndex(0);
      setVisibleChars(0);
    } else {
      setLineIndex(i => i + 1);
      setVisibleChars(0);
    }
  };

  const speakerColor = SPEAKER_COLOR[line.speaker] ?? '#ffffff';
  const textColor = line.glitch ? '#ff0000' : '#e8e8e8';

  return (
    <div
      className="fixed inset-x-0 bottom-0 cursor-pointer select-none"
      style={{ zIndex: 30 }}
      onClick={handleAdvance}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleAdvance(); }}
      role="button"
      tabIndex={0}
      aria-label="Avançar diálogo"
    >
      <div className="absolute -top-2 left-6 h-3 w-3 rounded-full bg-[#ff8800]" aria-hidden="true" />
      <div className="absolute -top-2 right-6 h-3 w-3 rounded-full bg-[#ff8800]" aria-hidden="true" />

      <div className="border-t-2 border-[#ff8800] bg-black px-4 py-3" style={{ minHeight: 80 }}>
        <p
          className="font-pixel text-[8px] leading-none mb-2"
          style={{ color: speakerColor }}
        >
          {line.speaker.replace(/_/g, ' ')}
        </p>

        <p
          className="font-term text-xl leading-tight"
          style={{
            color: textColor,
            fontFamily: line.glitch ? 'monospace' : undefined,
            letterSpacing: line.glitch ? '0.15em' : undefined,
          }}
        >
          {fullText.slice(0, visibleChars)}
          {!isTyping && (
            <span className="ml-1" style={{ opacity: blink ? 1 : 0, color: speakerColor }}>
              ▼
            </span>
          )}
          {isTyping && (
            <span style={{ opacity: blink ? 1 : 0, color: speakerColor }}>█</span>
          )}
        </p>

        {!isTyping && (
          <p className="font-pixel text-[6px] text-right mt-1 opacity-40" style={{ color: speakerColor }}>
            ENTER / CLIQUE PARA CONTINUAR
          </p>
        )}
      </div>
    </div>
  );
}
