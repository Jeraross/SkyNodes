import { useEffect, useState } from 'react';

interface VictoryScreenProps {
  completedCount: number;
  totalMissions: number;
  credits: number;
  onReset: () => void;
}

const LINES = [
  { delay: 0,    speaker: 'GLITCH',    text: 'NÓ FINAL... DESATIVADO... REDE... COMPLETA... DERROTA...', glitch: true },
  { delay: 2200, speaker: 'LIA',       text: 'MALHA AÉREA NACIONAL COMPLETAMENTE RESTAURADA.' },
  { delay: 4200, speaker: 'AGENTE J',  text: 'VINTE AEROPORTOS. DE RECIFE AO ACRE. UM GRAFO CONECTADO.' },
  { delay: 6000, speaker: 'LIA',       text: 'MISSÃO CONCLUÍDA, AGENTE J. O BRASIL VOLTOU A VOAR.' },
  { delay: 7800, speaker: 'AGENTE J',  text: 'E EU VOLTO A ESTAR DESEMPREGADO. CONSISTÊNCIA GARANTIDA.' },
];

const ASCII_MAP = [
  '  .·.    FOR  THE',
  ' (REC)·JPA·NAT   SSA',
  '  ·   ·BSB·GYN·CNF·VIX',
  '    GIG·CGH·GRU',
  '      CWB·FLN·POA',
  ' MAO·BEL',
  '  PVH',
  '   RBR  ★',
];

export default function VictoryScreen({ completedCount, totalMissions, credits, onReset }: VictoryScreenProps) {
  const [visibleLines, setVisibleLines] = useState(0);
  const [showStats, setShowStats] = useState(false);
  const [showReset, setShowReset] = useState(false);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    LINES.forEach((line, i) => {
      timers.push(setTimeout(() => setVisibleLines(i + 1), line.delay));
    });
    timers.push(setTimeout(() => setShowStats(true), 9200));
    timers.push(setTimeout(() => setShowReset(true), 10800));
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-black">
      <div className="crt-scanlines flex h-full w-full flex-col items-center justify-center gap-6 p-6">

        {/* Title */}
        <div className="text-center">
          <p className="font-pixel text-[9px] leading-none text-[#ff0000] at-blink">
            ✦ MISSÃO CONCLUÍDA ✦
          </p>
          <p className="mt-2 font-pixel text-[14px] leading-none text-[#ffd700]">
            BRASIL CONECTADO
          </p>
        </div>

        {/* ASCII map */}
        <div className="border border-[#003800] bg-black p-4">
          {ASCII_MAP.map((line, i) => (
            <p key={i} className="font-term text-base leading-snug text-[#00ff00]">{line}</p>
          ))}
        </div>

        {/* Dialogue lines */}
        <div className="w-full max-w-xl space-y-2">
          {LINES.slice(0, visibleLines).map((line, i) => (
            <div key={i} className="flex gap-3">
              <span className={`w-20 shrink-0 font-pixel text-[7px] leading-none pt-1 ${
                line.glitch ? 'text-[#ff0000]' : line.speaker === 'LIA' ? 'text-[#00ffff]' : 'text-[#ffd700]'
              }`}>
                {line.speaker}
              </span>
              <p className={`font-term text-lg leading-snug ${
                line.glitch ? 'text-[#ff4400] opacity-80' : 'text-[#e8e8e8]'
              }`}>
                {line.text}
                {i === visibleLines - 1 && <span className="ml-1 at-blink text-[#ffd700]">_</span>}
              </p>
            </div>
          ))}
        </div>

        {/* Stats */}
        {showStats && (
          <div className="w-full max-w-xl border-2 border-[#ffd700] bg-black p-4">
            <p className="font-pixel text-[8px] text-[#ffd700]">RELATÓRIO FINAL</p>
            <div className="mt-3 grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="font-pixel text-[7px] text-[#b0b0b0]">AEROPORTOS</p>
                <p className="font-term text-3xl leading-none text-[#00ff00]">{completedCount}/{totalMissions}</p>
              </div>
              <div className="text-center">
                <p className="font-pixel text-[7px] text-[#b0b0b0]">CRÉDITOS</p>
                <p className="font-term text-3xl leading-none text-[#00ffff]">{credits}</p>
              </div>
              <div className="text-center">
                <p className="font-pixel text-[7px] text-[#b0b0b0]">STATUS</p>
                <p className="font-term text-xl leading-none text-[#ffd700]">CONECTADO</p>
              </div>
            </div>
          </div>
        )}

        {/* Reset button */}
        {showReset && (
          <button
            type="button"
            onClick={onReset}
            className="border-2 border-[#ffd700] bg-black px-8 py-3 font-pixel text-[9px] text-[#ffd700] hover:bg-[#181400] at-blink"
          >
            NOVA PARTIDA
          </button>
        )}
      </div>
    </div>
  );
}
