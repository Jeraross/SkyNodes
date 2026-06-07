import type { GameAirport } from '../types';

interface AirportPanelProps {
  airport: GameAirport;
  onLand: (airport: GameAirport) => void;
}

export default function AirportPanel({ airport, onLand }: AirportPanelProps) {
  return (
    <section className="rounded border-2 border-[#071018] bg-[#d7f04a] px-5 py-4 text-[#071018] shadow-[6px_6px_0_rgba(0,0,0,0.45)]">
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="text-[10px] font-black tracking-[0.22em]">AEROPORTO PROXIMO</p>
          <h2 className="mt-1 text-2xl font-black">{airport.code}</h2>
          <p className="text-sm font-bold">{airport.city} - {airport.region}</p>
        </div>
        <button
          type="button"
          onClick={() => onLand(airport)}
          className="border-2 border-[#071018] bg-[#d02020] px-4 py-3 text-sm font-black text-white shadow-[4px_4px_0_rgba(0,0,0,0.35)] transition-transform hover:-translate-y-0.5"
        >
          POUSAR
        </button>
      </div>
    </section>
  );
}
