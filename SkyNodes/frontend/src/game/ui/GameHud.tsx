import type { GameAirport, GameMission } from '../types';
import AirportPanel from './AirportPanel';
import MissionPanel from './MissionPanel';

interface GameHudProps {
  activeMission: GameMission | null;
  nearbyAirport: GameAirport | null;
  completedCount: number;
  totalMissions: number;
  onLand: (airport: GameAirport) => void;
  onReset: () => void;
  onBack: () => void;
}

export default function GameHud({
  activeMission,
  nearbyAirport,
  completedCount,
  totalMissions,
  onLand,
  onReset,
  onBack,
}: GameHudProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-20 p-5 font-mono">
      <div className="pointer-events-auto absolute left-5 top-5">
        <MissionPanel mission={activeMission} completedCount={completedCount} totalCount={totalMissions} />
      </div>

      <div className="pointer-events-auto absolute right-5 top-5 flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="border-2 border-[#071018] bg-[#f1ff75] px-4 py-2 text-xs font-black text-[#071018] shadow-[4px_4px_0_rgba(0,0,0,0.35)]"
        >
          VOLTAR
        </button>
        <button
          type="button"
          onClick={onReset}
          className="border-2 border-[#071018] bg-[#d02020] px-4 py-2 text-xs font-black text-white shadow-[4px_4px_0_rgba(0,0,0,0.35)]"
        >
          RESET
        </button>
      </div>

      <div className="pointer-events-auto absolute bottom-5 left-5 rounded border-2 border-[#071018] bg-[#071018]/85 px-4 py-3 text-xs font-bold text-[#f1ff75]">
        WASD / SETAS para voar | clique no mapa para navegar
      </div>

      {nearbyAirport && (
        <div className="pointer-events-auto absolute bottom-5 left-1/2 w-[min(92vw,560px)] -translate-x-1/2">
          <AirportPanel airport={nearbyAirport} onLand={onLand} />
        </div>
      )}
    </div>
  );
}
