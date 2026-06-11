import type { GameAirport, GameRoute } from '../types';
import type { ShortestPath } from '../logic/travelPlanner';

interface TravelModalProps {
  destination: GameAirport;
  path: ShortestPath;
  airports: GameAirport[];
  routes: GameRoute[];
  anomalyRouteIds: string[];
  anomalyDefeatedRouteIds: string[];
  credits: number;
  fuel: number;
  anomalyBonusTrips: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function TravelModal({
  destination,
  path,
  airports,
  routes,
  anomalyRouteIds,
  anomalyDefeatedRouteIds,
  credits,
  fuel,
  anomalyBonusTrips,
  onConfirm,
  onCancel,
}: TravelModalProps) {
  interface HopInfo {
    from: string;
    to: string;
    routeId: string;
    cost: number;
    hasUndefeatedAnomaly: boolean;
  }

  const hops: HopInfo[] = path.routeIds.map((routeId, index) => {
    const route = routes.find(r => r.id === routeId);
    const hasAnomaly = anomalyRouteIds.includes(routeId);
    const defeated = anomalyDefeatedRouteIds.includes(routeId);
    return {
      from: path.airportIds[index],
      to: path.airportIds[index + 1],
      routeId,
      cost: route?.cost ?? 1,
      hasUndefeatedAnomaly: hasAnomaly && !defeated,
    };
  });

  const totalCost = hops.reduce((sum, hop) => sum + hop.cost, 0);
  const fuelNeeded = hops.length;
  const hasAnomalyOnPath = hops.some(h => h.hasUndefeatedAnomaly);
  const canAfford = credits >= totalCost && fuel >= fuelNeeded;

  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center bg-black/70"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm border-2 border-[#00ffff] bg-black p-4 shadow-[0_0_30px_rgba(0,255,255,0.2)]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-[#007000] pb-2 mb-3">
          <p className="font-pixel text-[7px] text-[#b0b0b0]">DESTINO</p>
          <p className="font-term text-2xl text-[#00ffff]">{destination.code}</p>
          <p className="font-pixel text-[8px] text-[#ffd700]">{destination.city.toUpperCase()}</p>
        </div>

        {/* Path hops */}
        {hops.length > 1 && (
          <div className="mb-3">
            <p className="font-pixel text-[7px] text-[#b0b0b0] mb-1">ROTA</p>
            <div className="space-y-1">
              {hops.map((hop) => (
                <div key={hop.routeId} className="flex items-center gap-2">
                  <span className="font-term text-lg text-[#e8e8e8]">
                    {hop.from} → {hop.to}
                  </span>
                  <span className="font-pixel text-[6px] text-[#555]">({hop.cost}cr)</span>
                  {hop.hasUndefeatedAnomaly && (
                    <span className="font-pixel text-[7px] text-[#ff4400]">⚠ ANOMALIA</span>
                  )}
                  {anomalyDefeatedRouteIds.includes(hop.routeId) && (
                    <span className="font-pixel text-[6px] text-[#00ff00]">✓ LIMPA</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cost summary */}
        <div className="border border-[#003300] bg-[#001800] p-2 mb-3">
          <div className="flex justify-between font-term text-lg">
            <span className="text-[#b0b0b0]">CRÉDITOS</span>
            <span className={credits >= totalCost ? 'text-[#ffd700]' : 'text-[#ff0000]'}>
              {totalCost} / {credits}
            </span>
          </div>
          <div className="flex justify-between font-term text-lg">
            <span className="text-[#b0b0b0]">COMBUSTÍVEL</span>
            <span className={fuel >= fuelNeeded ? 'text-[#ffd700]' : 'text-[#ff0000]'}>
              {fuelNeeded} / {fuel}
            </span>
          </div>
          {anomalyBonusTrips > 0 && (
            <div className="mt-1 font-pixel text-[7px] text-[#00ff00]">
              BÔNUS ATIVO: {anomalyBonusTrips} VIAGEM(S) COM 1.5× RECOMPENSA
            </div>
          )}
        </div>

        {/* Anomaly warning */}
        {hasAnomalyOnPath && (
          <div className="border border-[#ff4400] bg-[#1a0000] p-2 mb-3">
            <p className="font-pixel text-[7px] text-[#ff4400]">⚠ ANOMALIA NA ROTA</p>
            <p className="font-term text-lg text-[#ff8800] mt-1">
              Você encontrará uma anomalia durante esta viagem.
              Derrote-a para ganhar bônus de recompensa.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 border border-[#007000] bg-black px-3 py-2 font-pixel text-[8px] text-[#b0b0b0] hover:border-[#00ffff] hover:text-[#00ffff]"
          >
            CANCELAR
          </button>
          <button
            type="button"
            disabled={!canAfford}
            onClick={onConfirm}
            className="flex-1 border border-[#00ffff] bg-[#001a1a] px-3 py-2 font-pixel text-[8px] text-[#00ffff] hover:bg-[#003333] disabled:cursor-not-allowed disabled:border-[#333] disabled:text-[#555]"
          >
            VIAJAR{hasAnomalyOnPath ? ' ⚠' : ''}
          </button>
        </div>
      </div>
    </div>
  );
}
