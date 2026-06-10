import { useEffect, useRef, useState } from 'react';

interface Scene {
  lines: string[];
  color: string;
  accent?: string;
  pauseMs: number;
  typeSpeed?: number;
  ascii?: string[];
  flash?: boolean;
  bigTitle?: boolean;
}

const SCENES: Scene[] = [
  {
    lines: ['INFRAERO / SISTEMA DE MONITORAMENTO', 'AEROVIAS BRASIL — VERSÃO 3.1.4'],
    color: '#00ff00',
    pauseMs: 2200,
    typeSpeed: 28,
  },
  {
    lines: ['22 MAR 2024'],
    color: '#ffffff',
    accent: '03:47 UTC',
    pauseMs: 2000,
    typeSpeed: 60,
  },
  {
    ascii: [
      '         . : * : .',
      '      *           *',
      '   . : :  [SOL]  : : .',
      '      *           *',
      '         . : * : .',
    ],
    lines: ['EMISSÃO CORONAL CLASSE X9.2 DETECTADA'],
    color: '#ffaa00',
    accent: 'INPE — CENTRO ESPACIAL DE SÃO JOSÉ DOS CAMPOS',
    pauseMs: 3000,
    flash: true,
    typeSpeed: 22,
  },
  {
    lines: [
      'ONDA DE PLASMA ATINGINDO CAMPO MAGNÉTICO...',
      '',
      '  [████████████████████░░░] 89%',
      '  [████████████████████████] IMPACTO.',
    ],
    color: '#ff6600',
    pauseMs: 2800,
    typeSpeed: 18,
  },
  {
    lines: ['ANOMALIA CRÍTICA NA MALHA AÉREA BRASILEIRA'],
    color: '#ff0000',
    accent: '— TODOS OS SISTEMAS DE COMUNICAÇÃO —',
    pauseMs: 1200,
    flash: true,
    typeSpeed: 14,
  },
  {
    ascii: [
      '  REC ████   SSA ████   FOR ████',
      '  BSB ████   GRU ████   CNF ████',
      '  POA ████   FLN ████   BEL ████',
      '  MAO ████   NAT ████   JPA ████',
    ],
    lines: ['CONEXÃO PERDIDA COM 20 AEROPORTOS.'],
    color: '#ff4400',
    accent: '127 AERONAVES EM VÔO. COMUNICAÇÕES: PERDIDAS.',
    pauseMs: 3500,
    typeSpeed: 20,
  },
  {
    lines: ['3.400 PASSAGEIROS AGUARDANDO EM TERMINAIS.', '', 'OS PAINÉIS DE PARTIDAS ESTÃO APAGADOS.', 'O SILÊNCIO NOS RÁDIOS É ABSOLUTO.'],
    color: '#b0b0b0',
    pauseMs: 3200,
    typeSpeed: 22,
  },
  {
    lines: ['INFRAERO — CENTRO DE OPERAÇÕES — RECIFE'],
    color: '#00ffff',
    accent: 'PERNAMBUCO — BRASIL',
    pauseMs: 2000,
    typeSpeed: 25,
  },
  {
    ascii: [
      '      ██████   ',
      '     █ ◉  ◉ █  ',
      '     █  ──  █  ',
      '      ██████   ',
      '    ███████████',
      '      █   █    ',
      '     ██   ██   ',
    ],
    lines: ['ANTÔNIO LIMA', 'ENGENHEIRO DE SISTEMAS — INFRAERO', 'RECIFE, PERNAMBUCO'],
    color: '#ffd700',
    pauseMs: 3000,
    typeSpeed: 28,
  },
  {
    lines: [
      'ELE ACABOU DE POUSAR.',
      '',
      'NÃO SABE AINDA QUE NÃO VOLTARÁ',
      'PRA CASA TÃO CEDO.',
    ],
    color: '#b0b0b0',
    pauseMs: 3800,
    typeSpeed: 30,
  },
  {
    ascii: [
      '      ██████   ',
      '     █ ◕  ◕ █  ',
      '     █  ▼▼  █  ',
      '      ██████   ',
      '    ███████████',
      '      █   █    ',
      '     ██   ██   ',
    ],
    lines: ['CARLOS MENDES', 'ENGENHEIRO CHEFE — INFRAERO', '"ANTÔNIO. TEMOS UM PROBLEMA."'],
    color: '#00ffff',
    accent: 'LIGAÇÃO RECEBIDA — 07:12',
    pauseMs: 3200,
    typeSpeed: 28,
  },
  {
    lines: [
      'A MISSÃO:',
      '',
      'PERCORRER A MALHA AÉREA BRASILEIRA.',
      'NÓ POR NÓ.',
      'AEROPORTO POR AEROPORTO.',
      '',
      'RESTAURAR O CÉU DO BRASIL.',
    ],
    color: '#00ff00',
    pauseMs: 4000,
    typeSpeed: 22,
  },
  {
    lines: ['', 'AEROTALE', ''],
    color: '#ffd700',
    accent: 'UMA HISTÓRIA DE GRAFOS E PERSISTÊNCIA',
    pauseMs: 5000,
    bigTitle: true,
    typeSpeed: 60,
  },
];

interface TypewriterState {
  sceneIndex: number;
  visibleChars: number;
  phase: 'typing' | 'waiting' | 'done';
}

function getAllText(scene: Scene): string {
  const textLines = scene.lines.join('\n');
  const asciiLines = scene.ascii ? scene.ascii.join('\n') + '\n' : '';
  const accentLine = scene.accent ? '\n' + scene.accent : '';
  return asciiLines + textLines + accentLine;
}

interface AeroTaleIntroProps {
  onFinish: () => void;
}

export default function AeroTaleIntro({ onFinish }: AeroTaleIntroProps) {
  const [state, setState] = useState<TypewriterState>({
    sceneIndex: 0,
    visibleChars: 0,
    phase: 'typing',
  });
  const [flashOn, setFlashOn] = useState(true);
  const [blink, setBlink] = useState(true);
  const [skipped, setSkipped] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scene = SCENES[state.sceneIndex];
  const fullText = scene ? getAllText(scene) : '';

  // Flash effect for warning scenes
  useEffect(() => {
    if (!scene?.flash) { setFlashOn(true); return; }
    const t = setInterval(() => setFlashOn(f => !f), 200);
    return () => clearInterval(t);
  }, [state.sceneIndex, scene?.flash]);

  // Cursor blink
  useEffect(() => {
    const t = setInterval(() => setBlink(b => !b), 530);
    return () => clearInterval(t);
  }, []);

  // Typing effect + scene transitions
  useEffect(() => {
    if (skipped) return;

    const clearTimers = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (rafRef.current) clearTimeout(rafRef.current);
    };

    if (state.phase === 'typing') {
      const speed = scene?.typeSpeed ?? 25;
      rafRef.current = setTimeout(() => {
        setState(prev => {
          if (prev.visibleChars >= fullText.length) {
            return { ...prev, phase: 'waiting' };
          }
          return { ...prev, visibleChars: prev.visibleChars + 1 };
        });
      }, speed);
    } else if (state.phase === 'waiting') {
      timerRef.current = setTimeout(() => {
        const nextIdx = state.sceneIndex + 1;
        if (nextIdx >= SCENES.length) {
          onFinish();
        } else {
          setState({ sceneIndex: nextIdx, visibleChars: 0, phase: 'typing' });
        }
      }, scene?.pauseMs ?? 2000);
    }

    return clearTimers;
  }, [state, scene, fullText, skipped, onFinish]);

  // Skip on any key / click
  const handleSkip = () => {
    if (state.phase === 'typing') {
      // First skip: complete current scene instantly
      setState(prev => ({ ...prev, visibleChars: fullText.length, phase: 'waiting' }));
    } else {
      // Second skip: next scene or finish
      const nextIdx = state.sceneIndex + 1;
      if (nextIdx >= SCENES.length) {
        onFinish();
      } else {
        setState({ sceneIndex: nextIdx, visibleChars: 0, phase: 'typing' });
      }
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
  const asciiLen = scene.ascii ? scene.ascii.join('\n').length + 1 : 0;
  const mainTextLen = scene.lines.join('\n').length;

  const visibleAscii = scene.ascii
    ? visibleText.slice(0, Math.min(visibleText.length, asciiLen))
    : '';
  const visibleMain = visibleText.length > asciiLen
    ? visibleText.slice(asciiLen, asciiLen + Math.min(visibleText.length - asciiLen, mainTextLen))
    : '';
  const visibleAccent = visibleText.length > asciiLen + mainTextLen
    ? visibleText.slice(asciiLen + mainTextLen + 1)
    : '';

  const progressPct = Math.round(((state.sceneIndex) / SCENES.length) * 100);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black cursor-pointer"
      onClick={handleSkip}
      role="button"
      tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleSkip(); }}
      aria-label="Intro do jogo — clique para avançar"
    >
      {/* CRT scanlines overlay */}
      <div className="pointer-events-none absolute inset-0 crt-scanlines z-10" />

      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: `radial-gradient(ellipse at center, ${scene.color}08 0%, transparent 65%)` }}
      />

      {/* Scene counter dots */}
      <div className="absolute top-4 left-0 right-0 flex justify-center gap-1.5 z-20">
        {SCENES.map((_, i) => (
          <div
            key={i}
            className="h-1.5 w-1.5 rounded-full transition-colors"
            style={{
              backgroundColor: i < state.sceneIndex
                ? scene.color
                : i === state.sceneIndex
                  ? flashOn ? scene.color : '#333'
                  : '#222',
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-20 w-full max-w-3xl px-8 md:px-16">

        {/* Scene number */}
        <div className="mb-6 flex items-center gap-3">
          <div className="h-px flex-1" style={{ backgroundColor: scene.color + '40' }} />
          <span className="font-pixel text-[7px]" style={{ color: scene.color + '80' }}>
            {String(state.sceneIndex + 1).padStart(2, '0')}/{String(SCENES.length).padStart(2, '0')}
          </span>
          <div className="h-px flex-1" style={{ backgroundColor: scene.color + '40' }} />
        </div>

        {/* ASCII art */}
        {scene.ascii && visibleAscii && (
          <pre
            className="mb-6 font-term text-xl leading-tight text-center"
            style={{ color: scene.color, opacity: flashOn ? 1 : 0.7 }}
          >
            {visibleAscii}
          </pre>
        )}

        {/* Main title / big title */}
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
            <div className="min-h-[100px]">
              {visibleMain.split('\n').map((line, i) => (
                <p
                  key={i}
                  className="font-term leading-snug"
                  style={{
                    color: flashOn ? scene.color : scene.color + 'cc',
                    fontSize: line === '' ? '0.5rem' : '1.6rem',
                    minHeight: line === '' ? '1rem' : undefined,
                  }}
                >
                  {line || ' '}
                  {i === visibleMain.split('\n').length - 1 && state.phase === 'typing' && (
                    <span style={{ opacity: blink ? 1 : 0, color: scene.color }}>█</span>
                  )}
                </p>
              ))}
            </div>

            {/* Accent line */}
            {visibleAccent && (
              <p className="mt-4 font-pixel text-[8px] leading-relaxed" style={{ color: scene.color + 'aa' }}>
                {visibleAccent}
              </p>
            )}
          </>
        )}
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-12 left-0 right-0 z-20 flex flex-col items-center gap-2">
        <div className="h-0.5 w-48 bg-white/10">
          <div
            className="h-full transition-all duration-500"
            style={{ width: `${progressPct}%`, backgroundColor: scene.color }}
          />
        </div>
      </div>

      {/* Skip hint */}
      <div className="absolute bottom-5 left-0 right-0 z-20 text-center">
        <p className="font-pixel text-[7px]" style={{ color: scene.color + '60' }}>
          {state.phase === 'typing' ? 'PRESSIONE ENTER PARA CONTINUAR' : 'ENTER / CLIQUE PARA AVANÇAR'}
        </p>
      </div>
    </div>
  );
}
