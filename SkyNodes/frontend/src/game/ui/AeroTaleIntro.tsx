import { useEffect, useRef, useState } from 'react';
import IntroSceneCanvas from './IntroSceneCanvas';
import { AEROTALE_INTRO_SCENES, type AeroTaleIntroScene } from './introScenes';
import { getIntroVisual } from './introVisuals';

const SCENES = AEROTALE_INTRO_SCENES;

interface TypewriterState {
  sceneIndex: number;
  visibleChars: number;
  phase: 'typing' | 'waiting' | 'done';
}

function getAllText(scene: AeroTaleIntroScene): string {
  const textLines = scene.lines.join('\n');
  const accentLine = scene.accent ? '\n' + scene.accent : '';
  return textLines + accentLine;
}

interface AeroTaleIntroProps {
  onFinish: () => void;
}

const TYPE_SPEED_MULTIPLIER = 1.2;

export default function AeroTaleIntro({ onFinish }: AeroTaleIntroProps) {
  const [state, setState] = useState<TypewriterState>({
    sceneIndex: 0,
    visibleChars: 0,
    phase: 'typing',
  });
  const [flashOn, setFlashOn] = useState(true);
  const [blink, setBlink] = useState(true);
  const rafRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scene = SCENES[state.sceneIndex];
  const fullText = scene ? getAllText(scene) : '';

  useEffect(() => {
    if (!scene?.flash) {
      setFlashOn(true);
      return;
    }
    const t = setInterval(() => setFlashOn(f => !f), 320);
    return () => clearInterval(t);
  }, [state.sceneIndex, scene?.flash]);

  useEffect(() => {
    const t = setInterval(() => setBlink(b => !b), 530);
    return () => clearInterval(t);
  }, []);

  // Typewriter tick — only fires while typing, stops and waits for user input
  useEffect(() => {
    if (state.phase !== 'typing') return;
    const speed = Math.round((scene?.typeSpeed ?? 25) * TYPE_SPEED_MULTIPLIER);
    rafRef.current = setTimeout(() => {
      setState(prev => {
        if (prev.visibleChars >= fullText.length) {
          return { ...prev, phase: 'waiting' };
        }
        return { ...prev, visibleChars: prev.visibleChars + 1 };
      });
    }, speed);
    return () => { if (rafRef.current) clearTimeout(rafRef.current); };
  }, [state, scene, fullText]);

  const handleSkip = () => {
    if (state.phase === 'typing') {
      setState(prev => ({ ...prev, visibleChars: fullText.length, phase: 'waiting' }));
      return;
    }

    const nextIdx = state.sceneIndex + 1;
    if (nextIdx >= SCENES.length) {
      onFinish();
    } else {
      setState({ sceneIndex: nextIdx, visibleChars: 0, phase: 'typing' });
    }
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (['Enter', 'Space', 'z', 'Z', 'Escape', ' '].includes(e.key)) {
        handleSkip();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  if (!scene) return null;

  const visibleText = fullText.slice(0, state.visibleChars);
  const sceneVisual = getIntroVisual(state.sceneIndex);
  const visibleMainLen = scene.lines.join('\n').length;
  const visibleMain = visibleText.slice(0, Math.min(visibleText.length, visibleMainLen));
  const visibleAccent = visibleText.length > visibleMainLen
    ? visibleText.slice(visibleMainLen + 1)
    : '';

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black cursor-pointer overflow-hidden"
      onClick={handleSkip}
      role="button"
      tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleSkip(); }}
      aria-label="Intro do jogo - clique para avancar"
    >
      <div className="pointer-events-none absolute inset-0 crt-scanlines z-10" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: `radial-gradient(ellipse at center, ${scene.color}10 0%, transparent 65%)` }}
      />

      <IntroSceneCanvas
        visualId={sceneVisual.visualId}
        color={scene.color}
        spriteId={sceneVisual.spriteId}
      />

      <div className="relative z-20 flex h-full w-full max-w-7xl flex-col justify-end px-4 pb-20 pt-10 sm:px-8 md:px-12 md:pb-24">
        {scene.bigTitle ? (
          <div className="text-center">
            <h1
              className="font-pixel text-3xl md:text-4xl leading-none tracking-wider"
              style={{ color: scene.color, textShadow: `0 0 30px ${scene.color}` }}
            >
              <span style={{ color: '#ff0000' }}>AERO</span>
              TALE
            </h1>
            {visibleAccent && (
              <p className="mt-6 font-pixel text-[8px] md:text-[10px]" style={{ color: scene.color + 'aa' }}>
                {visibleAccent}
              </p>
            )}
          </div>
        ) : (
          <>
            <div className="mx-auto min-h-[96px] w-full max-w-5xl bg-black/45 px-3 py-2 backdrop-blur-[1px] md:px-5 md:py-3">
              {visibleMain.split('\n').map((line, i) => (
                <p
                  key={`${line}-${i}`}
                  className="font-term leading-snug"
                  style={{
                    color: flashOn ? scene.color : scene.color + 'cc',
                    fontSize: line === '' ? '0.5rem' : 'clamp(1.35rem, 2.8vw, 2.35rem)',
                    minHeight: line === '' ? '1rem' : undefined,
                  }}
                >
                  {line || '\u00a0'}
                  {i === visibleMain.split('\n').length - 1 && state.phase === 'typing' && (
                    <span style={{ opacity: blink ? 1 : 0, color: scene.color }}>█</span>
                  )}
                </p>
              ))}
            </div>

            {visibleAccent && (
              <p className="mx-auto mt-3 max-w-4xl font-term leading-snug" style={{ color: scene.color + 'bb', fontSize: 'clamp(0.85rem, 1.8vw, 1.25rem)' }}>
                {visibleAccent}
              </p>
            )}
          </>
        )}
      </div>

      <div className="absolute bottom-5 left-0 right-0 z-20 text-center">
        {state.phase === 'waiting' ? (
          <p
            className="font-pixel text-[8px]"
            style={{ color: scene.color, opacity: blink ? 1 : 0.35 }}
          >
            ► PRESSIONE ENTER OU CLIQUE PARA AVANÇAR
          </p>
        ) : (
          <p className="font-pixel text-[7px]" style={{ color: scene.color + '50' }}>
            ENTER PARA PULAR
          </p>
        )}
      </div>
    </div>
  );
}
