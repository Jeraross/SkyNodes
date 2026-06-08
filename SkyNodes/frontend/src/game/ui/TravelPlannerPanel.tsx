import { useMemo, useState } from 'react';
import type { GameAirport, GameMission, GameRoute } from '../types';
import { buildTravelOptions, calculateTravelPlan } from '../logic/travelPlanner';

interface TravelPlannerPanelProps {
  airports: GameAirport[];
  routes: GameRoute[];
  currentAirport: GameAirport | null;
  activeMission: GameMission | null;
  credits: number;
  fuel: number;
  onConfirm: (airport: GameAirport, routeIds: string[], cost: number) => void;
}

export default function TravelPlannerPanel({
  airports,
  routes,
  currentAirport,
  activeMission,
  credits,
  fuel,
  onConfirm,
}: TravelPlannerPanelProps) {
  const [path, setPath] = useState<string[]>(currentAirport ? [currentAirport.id] : []);
  const origin = path.at(-1) ?? currentAirport?.id ?? '';
  const options = useMemo(() => buildTravelOptions(origin, airports, routes), [airports, origin, routes]);
  const anomalyRouteIds = activeMission?.anomalyRouteIds ?? [];
  const stormRouteIds = useMemo(() => routes.filter((_, index) => index % 11 === 0).map(route => route.id), [routes]);
  const plan = useMemo(
    () => calculateTravelPlan({ airportIds: path, routes, anomalyRouteIds, stormRouteIds }),
    [anomalyRouteIds, path, routes, stormRouteIds],
  );
  const destination = airports.find(airport => airport.id === path.at(-1)) ?? null;
  const canConfirm = Boolean(destination && path.length > 1 && plan.valid && credits >= plan.totalCost && fuel >= plan.routeIds.length);

  const addStop = (airportId: string) => setPath(prev => [...prev, airportId]);
  const resetPath = () => setPath(currentAirport ? [currentAirport.id] : []);

  return (
    <section className="grid min-h-0 flex-1 grid-cols-[minmax(220px,280px)_1fr] gap-2 overflow-hidden">
      <div className="border-2 border-[#00ffff] bg-black p-3">
        <p className="font-pixel text-[8px] text-[#00ff00]">PLANEJAR VIAGEM</p>
        <div className="mt-3 space-y-1 font-term text-xl leading-none text-[#ffd700]">
          {path.map((airportId, index) => (
            <p key={`${airportId}-${index}`}>{index + 1}. {airportId}</p>
          ))}
        </div>
        <div className="mt-4 border-t border-[#007000] pt-2 font-term text-lg text-[#b0b0b0]">
          <p>CUSTO: <span className="text-[#ffd700]">{plan.totalCost}</span></p>
          <p>COMBUSTIVEL: <span className="text-[#ffd700]">{plan.routeIds.length}</span></p>
          <p>CREDITOS: <span className="text-[#00ffff]">{credits}</span></p>
        </div>
        <div className="mt-3 flex gap-2">
          <button type="button" onClick={resetPath} className="at-action-button">LIMPAR</button>
          <button
            type="button"
            disabled={!canConfirm || !destination}
            onClick={() => destination && onConfirm(destination, plan.routeIds, plan.totalCost)}
            className="at-action-button at-action-button-primary disabled:opacity-40"
          >
            CONFIRMAR
          </button>
        </div>
      </div>

      <div className="relative overflow-hidden border-2 border-[#006c00] bg-black p-3">
        <div className="absolute inset-0 opacity-25" style={{ background: 'repeating-linear-gradient(90deg, transparent 0 28px, #003000 29px 30px)' }} />
        <div className="relative z-10 flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-[#007000] pb-2">
            <span className="font-pixel text-[8px] text-[#ffd700]">GRAFO DE ESCALAS</span>
            <span className="font-pixel text-[7px] text-[#b0b0b0]">ANOMALIA +3 | TEMPESTADE +2</span>
          </div>
          <div className="mt-3 grid flex-1 grid-cols-2 gap-2 overflow-auto">
            {options.map(option => {
              const anomaly = anomalyRouteIds.includes(option.route.id);
              const storm = stormRouteIds.includes(option.route.id);
              const blocked = option.route.state === 'blocked';
              return (
                <button
                  key={option.route.id}
                  type="button"
                  disabled={blocked}
                  onClick={() => addStop(option.airport.id)}
                  className="border-2 border-[#007000] bg-[#001800] p-3 text-left hover:border-[#00ffff] disabled:cursor-not-allowed disabled:border-[#ff0000] disabled:opacity-75"
                >
                  <p className="font-pixel text-[8px] text-[#00ff00]">{origin} - {option.airport.id}</p>
                  <p className="mt-2 font-term text-xl text-[#ffd700]">{option.airport.city}</p>
                  <p className="font-term text-lg text-[#b0b0b0]">BASE {option.route.cost}</p>
                  {blocked && <p className="font-term text-lg text-[#ff0000]">BLOQUEADA POR ANOMALIA SOLAR</p>}
                  {anomaly && !blocked && <p className="font-term text-lg text-[#ff00ff]">ANOMALIA NA ARESTA</p>}
                  {storm && <p className="font-term text-lg text-[#00ffff]">TEMPESTADE</p>}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
