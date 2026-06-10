// src/game/render/AirportLayer.tsx
import { useCallback } from 'react';
import type { Graphics } from 'pixi.js';
import type { GameAirport, GameMission } from '../types';

interface AirportLayerProps {
  airports: GameAirport[];
  activeMission: GameMission | null;
  nearbyAirportId: string | null;
}

const STATUS_COLOR: Record<string, number> = {
  unknown:      0x000000,
  detected:     0x445544,
  corrupted:    0xff2200,
  disconnected: 0x887700,
  connected:    0x00ff00,
  completed:    0x00aaff,
};

const STATUS_ALPHA: Record<string, number> = {
  unknown:      0,
  detected:     0.4,
  corrupted:    1,
  disconnected: 0.8,
  connected:    1,
  completed:    1,
};

export default function AirportLayer({ airports, activeMission, nearbyAirportId }: AirportLayerProps) {
  const draw = useCallback((g: Graphics) => {
    g.clear();
    for (const airport of airports) {
      const status = airport.status ?? 'unknown';
      const alpha = STATUS_ALPHA[status] ?? 0;
      if (alpha === 0) continue;

      const color = STATUS_COLOR[status] ?? 0x00ff00;
      const isNearby = nearbyAirportId === airport.id;
      const isObjective = activeMission?.objectiveAirportId === airport.id;
      const radius = isNearby || isObjective ? 12 : 8;

      // outer ring
      g.rect(airport.x - radius, airport.y - radius, radius * 2, radius * 2)
        .fill({ color, alpha });
      // inner fill (black — creates ring effect)
      g.rect(airport.x - (radius - 4), airport.y - (radius - 4), (radius - 4) * 2, (radius - 4) * 2)
        .fill({ color: 0x000000, alpha });

      // objective markers
      if (isObjective) {
        g.rect(airport.x - radius - 8, airport.y - 2, 6, 4).fill({ color: 0xffd700, alpha: 1 });
        g.rect(airport.x + radius + 2, airport.y - 2, 6, 4).fill({ color: 0xffd700, alpha: 1 });
      }

      // proximity halo (2 bars)
      if (isNearby) {
        g.rect(airport.x - radius - 4, airport.y - radius - 4, (radius + 4) * 2, 4).fill({ color, alpha: 0.4 });
        g.rect(airport.x - radius - 4, airport.y + radius, (radius + 4) * 2, 4).fill({ color, alpha: 0.4 });
      }
    }
  }, [activeMission, airports, nearbyAirportId]);

  return <pixiGraphics draw={draw} />;
}
