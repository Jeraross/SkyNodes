import { useEffect, useState } from 'react';
import type { DialogueSequence } from '../types';
import agenteJSprite from '../sprites/character_sprites/Antonio.png';
import liaSprite from '../sprites/character_sprites/a9.png';
import presidenteSprite from '../sprites/character_sprites/Carlos.png';
import glitchSprite from '../sprites/character_sprites/a12.png';
import defaultSprite from '../sprites/character_sprites/a4.png';

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

const SPEAKER_SPRITE: Record<string, string> = {
  AGENTE_J: agenteJSprite,
  LIA: liaSprite,
  PRESIDENTE: presidenteSprite,
  GLITCH_FRAGMENTO: glitchSprite,
};

const SPEAKER_LABEL: Record<string, string> = {
  AGENTE_J: 'AGENTE J',
  LIA: 'LIA',
  PRESIDENTE: 'PRESIDENTE',
  GLITCH_FRAGMENTO: 'GLITCH',
};

export default function DialogueOverlay({ queue, onAdvance }: DialogueOverlayProps) {
  const [lineIndex, setLineIndex] = useState(0);
  const [visibleChars, setVisibleChars] = useState(0);
  const [blink, setBlink] = useState(true);

  const current = queue[0];
  const line = current?.lines[lineIndex];
  const fullText = line?.text ?? '';
  const isTyping = visibleChars < fullText.length;

  useEffect(() => {
    setLineIndex(0);
    setVisibleChars(0);
  }, [current?.id]);

  useEffect(() => {
    if (!isTyping) return;
    const t = setTimeout(() => setVisibleChars(v => v + 1), TYPE_SPEED_MS);
    return () => clearTimeout(t);
  }, [isTyping, visibleChars]);

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
  const speakerSprite = SPEAKER_SPRITE[line.speaker] ?? defaultSprite;
  const speakerLabel = SPEAKER_LABEL[line.speaker] ?? line.speaker.replace(/_/g, ' ');
  const textColor = line.glitch ? '#ff0000' : '#e8e8e8';

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col justify-end cursor-pointer select-none"
      style={{ background: 'rgba(0,0,0,0.55)' }}
      onClick={handleAdvance}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleAdvance(); }}
      role="button"
      tabIndex={0}
      aria-label="Avançar diálogo"
    >
      {/* Portrait + dialogue box */}
      <div className="w-full max-w-4xl mx-auto px-4 pb-6 flex items-end gap-0">
        {/* Speaker portrait */}
        <div
          className="flex-shrink-0 flex flex-col items-center pb-0"
          style={{ width: 110 }}
        >
          <img
            src={speakerSprite}
            alt=""
            draggable={false}
            className="pixelated object-contain object-bottom"
            style={{ width: 100, height: 140, imageRendering: 'pixelated' }}
          />
        </div>

        {/* Dialogue box */}
        <div
          className="flex-1 border-2 bg-black"
          style={{ borderColor: speakerColor, minHeight: 110 }}
        >
          {/* Speaker name bar */}
          <div
            className="px-3 py-1 border-b"
            style={{ borderColor: speakerColor, background: 'rgba(0,0,0,0.9)' }}
          >
            <span
              className="font-pixel text-[8px] leading-none"
              style={{ color: speakerColor }}
            >
              {speakerLabel}
            </span>
          </div>

          {/* Text area */}
          <div className="px-4 py-3">
            <p
              className="font-term text-2xl leading-tight"
              style={{
                color: textColor,
                fontFamily: line.glitch ? 'monospace' : undefined,
                letterSpacing: line.glitch ? '0.15em' : undefined,
              }}
            >
              {fullText.slice(0, visibleChars)}
              {isTyping && (
                <span style={{ opacity: blink ? 1 : 0, color: speakerColor }}>█</span>
              )}
              {!isTyping && (
                <span className="ml-1" style={{ opacity: blink ? 1 : 0, color: speakerColor }}>▼</span>
              )}
            </p>

            {!isTyping && (
              <p className="font-pixel text-[6px] text-right mt-2 opacity-40" style={{ color: speakerColor }}>
                ENTER / CLIQUE PARA CONTINUAR
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
