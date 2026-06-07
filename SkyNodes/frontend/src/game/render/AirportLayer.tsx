import { useCallback } from 'react';
import type { Graphics } from 'pixi.js';
import type { GameAirport, GameMission } from '../types';

interface AirportLayerProps {
  airports: GameAirport[];
  activeMission: GameMission | null;
  nearbyAirportId: string | null;
}

export default function AirportLayer({ airports, activeMission, nearbyAirportId }: AirportLayerProps) {
  const draw = useCallback((g: Graphics) => {
    g.clear();
    for (const airport of airports) {
      const active = activeMission?.objectiveAirportId === airport.id || nearbyAirportId === airport.id;
      g.rect(airport.x - 22, airport.y - 16, 44, 32).fill(active ? 0xfff26b : 0xff6b32);
      g.rect(airport.x - 14, airport.y - 8, 28, 16).fill(0x09124a);
      g.rect(airport.x - 4, airport.y + 8, 8, 16).fill(0xffffff);
      if (active) {
        g.rect(airport.x - 34, airport.y - 28, 68, 8).fill(0xffffff);
        g.rect(airport.x - 34, airport.y + 22, 68, 8).fill(0xffffff);
      }
    }
  }, [activeMission, airports, nearbyAirportId]);

  return <pixiGraphics draw={draw} />;
}
