import { useCallback } from 'react';
import type { Graphics } from 'pixi.js';
import type { GameAirport, GameRoute } from '../types';

interface RouteLayerProps {
  airports: GameAirport[];
  routes: GameRoute[];
}

export default function RouteLayer({ airports, routes }: RouteLayerProps) {
  const draw = useCallback((g: Graphics) => {
    g.clear();
    for (const route of routes) {
      const from = airports.find(airport => airport.id === route.from);
      const to = airports.find(airport => airport.id === route.to);
      if (!from || !to) continue;
      const color = route.state === 'blocked' ? 0xff4b35 : route.state === 'restored' ? 0xffffff : route.state === 'locked' ? 0x645a8c : 0xffd45a;
      drawJaggedLine(g, from.x, from.y, to.x, to.y, color, route.state === 'locked');
    }
  }, [airports, routes]);

  return <pixiGraphics draw={draw} />;
}

function drawJaggedLine(g: Graphics, x1: number, y1: number, x2: number, y2: number, color: number, dashed: boolean) {
  const steps = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1)) / 28;
  for (let i = 0; i <= steps; i += 1) {
    if (dashed && i % 2 === 0) continue;
    const t = steps === 0 ? 0 : i / steps;
    const x = Math.round((x1 + (x2 - x1) * t) / 8) * 8;
    const y = Math.round((y1 + (y2 - y1) * t) / 8) * 8;
    g.rect(x - 8, y - 8, 16, 16).fill(color);
  }
}
