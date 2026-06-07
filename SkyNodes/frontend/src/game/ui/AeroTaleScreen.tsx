import { useMemo, useState } from 'react';
import type { GameAirport, GameMission, GameRoute, PlayerPosition } from '../types';
import { buildRetroScreenModel } from './retroScreen';
import WorldMapPanel from './WorldMapPanel';

const ACTIONS = ['MAPA', 'ANALISAR', 'VIAJAR', 'MISSOES', 'BIBLIOTECA', 'HANGAR'] as const;
type Action = (typeof ACTIONS)[number];

interface AeroTaleScreenProps {
  airports: GameAirport[];
  routes: GameRoute[];
  activeMission: GameMission | null;
  currentAirport: GameAirport | null;
  nearbyAirport: GameAirport | null;
  completedCount: number;
  totalMissions: number;
  playerPosition: PlayerPosition;
  setPlayerPosition: (position: PlayerPosition) => void;
  setTargetPosition: (position: PlayerPosition | null) => void;
  onLand: (airport: GameAirport) => void;
  onReset: () => void;
  onBack: () => void;
}

const STAT_COLORS = {
  green: '#00ff00',
  yellow: '#ffd700',
  cyan: '#00ffff',
};

export default function AeroTaleScreen({
  airports,
  routes,
  activeMission,
  currentAirport,
  nearbyAirport,
  completedCount,
  totalMissions,
  playerPosition,
  setPlayerPosition,
  setTargetPosition,
  onLand,
  onReset,
  onBack,
}: AeroTaleScreenProps) {
  const [activeAction, setActiveAction] = useState<Action>('MAPA');
  const model = useMemo(
    () => buildRetroScreenModel({ currentAirport, activeMission, completedCount, totalMissions, nearbyAirport }),
    [activeMission, completedCount, currentAirport, nearbyAirport, totalMissions],
  );

  const handleAction = (action: Action) => {
    setActiveAction(action);
    if (action === 'VIAJAR' && nearbyAirport) onLand(nearbyAirport);
  };

  return (
    <main className="h-screen w-screen overflow-hidden bg-black">
      <div className="crt-scanlines h-full w-full bg-black">
        <div className="flex h-full flex-col gap-2 p-3 md:p-4">
          <header className="flex items-center justify-between gap-3">
            <h1 className="font-pixel text-[10px] text-[#ffd700]">
              <span className="text-[#ff0000]">AERO</span>TALE
            </h1>
            <div className="flex items-center gap-2">
              <span className="hidden font-pixel text-[7px] text-[#b0b0b0] sm:inline">
                A MALHA AEREA - 8-BIT - 1984
              </span>
              <button type="button" onClick={onBack} className="at-top-button">
                VOLTAR
              </button>
              <button type="button" onClick={onReset} className="at-top-button at-top-button-danger">
                RESET
              </button>
            </div>
          </header>

          <section className="border-2 border-[#ffd700] bg-black">
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-2 py-1.5">
              {model.stats.map(stat => (
                <div key={stat.label} className="flex items-baseline gap-1.5">
                  <span className="font-pixel text-[7px] text-[#b0b0b0]">{stat.label}:</span>
                  <span className="font-term text-xl leading-none" style={{ color: STAT_COLORS[stat.tone] }}>
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-[#007000] px-2 py-1">
              <span className="font-pixel text-[7px] text-[#b0b0b0]">MISSAO:</span>{' '}
              <span className="font-term text-lg leading-none text-[#ff0000]">
                {model.missionLine.replace('MISSAO: ', '')}
              </span>
            </div>
          </section>

          <section
            className="min-h-0 flex-1"
            aria-label="Mapa retro jogavel do Brasil com a malha aerea"
          >
            <WorldMapPanel
              airports={airports}
              routes={routes}
              nearbyAirport={nearbyAirport}
              playerPosition={playerPosition}
              setPlayerPosition={setPlayerPosition}
              setTargetPosition={setTargetPosition}
            />
          </section>

          <section className="relative bg-black">
            <div className="absolute -top-2 left-6 h-3 w-3 rounded-full bg-[#ff8800]" aria-hidden="true" />
            <div className="absolute -top-2 right-6 h-3 w-3 rounded-full bg-[#ff8800]" aria-hidden="true" />
            <div className="border-2 border-[#ff8800] bg-black px-4 py-3">
              <p className="font-pixel text-[8px] leading-none text-[#ffd700]">{model.dialogueSpeaker}</p>
              <div className="mt-2 space-y-1.5">
                {model.dialogueLines.map((line, index) => (
                  <p key={line} className="font-term text-xl leading-tight text-[#ff0000]">
                    {line}
                    {index === model.dialogueLines.length - 1 && <span className="at-blink ml-1 text-[#e8e8e8]">_</span>}
                  </p>
                ))}
              </div>
            </div>
          </section>

          <nav className="flex flex-wrap gap-1 border-2 border-[#ffd700] bg-black p-1.5" aria-label="Acoes do jogo">
            {ACTIONS.map(action => {
              const isActive = activeAction === action;
              const disabled = action === 'VIAJAR' && !nearbyAirport;
              return (
                <button
                  key={action}
                  type="button"
                  onClick={() => handleAction(action)}
                  disabled={disabled}
                  className={`border-2 px-3 py-1.5 font-pixel text-[8px] leading-none transition-none disabled:cursor-not-allowed disabled:opacity-40 ${
                    isActive
                      ? 'border-[#00ffff] bg-[#006c00] text-[#00ff00]'
                      : 'border-[#007000] bg-black text-[#b0b0b0] hover:bg-[#002000] hover:text-[#00ff00]'
                  }`}
                >
                  {isActive ? '> ' : ''}
                  {action}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </main>
  );
}
