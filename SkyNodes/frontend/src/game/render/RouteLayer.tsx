import { useCallback } from 'react';
import type { Graphics } from 'pixi.js';
import type { GameAirport, GameRoute } from '../types';

interface RouteLayerProps {
  airports: GameAirport[];
  routes: GameRoute[];
  buildMode?: boolean;
  highlightRouteId?: string | null;
}

export default function RouteLayer({ airports, routes, buildMode, highlightRouteId }: RouteLayerProps) {
  const draw = useCallback((g: Graphics) => {
    g.clear();
    for (const route of routes) {
      const from = airports.find(a => a.id === route.from);
      const to = airports.find(a => a.id === route.to);
      if (!from || !to) continue;

      if (route.state === 'locked') continue; // locked routes invisible

      let color: number;
      let dashed: boolean;
      let alpha: number;

      if (route.state === 'blocked') {
        color = 0xff4b35; dashed = true; alpha = 0.8;
      } else if (route.state === 'restored') {
        color = 0x00ff00; dashed = false; alpha = 1;
      } else if (route.state === 'available') {
        color = buildMode ? 0xffd700 : 0x334433;
        dashed = true;
        alpha = buildMode ? 0.9 : 0.4;
      } else {
        color = 0x645a8c; dashed = true; alpha = 0.3;
      }

      if (highlightRouteId === route.id) {
        color = 0xffffff; alpha = 1;
      }

      drawJaggedLine(g, from.x, from.y, to.x, to.y, color, dashed, alpha);
    }
  }, [airports, buildMode, highlightRouteId, routes]);

  return <pixiGraphics draw={draw} />;
}

function drawJaggedLine(
  g: Graphics, x1: number, y1: number, x2: number, y2: number,
  color: number, dashed: boolean, alpha: number,
) {
  const steps = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1)) / 28;
  for (let i = 0; i <= steps; i += 1) {
    if (dashed && i % 2 === 0) continue;
    const t = steps === 0 ? 0 : i / steps;
    const x = Math.round((x1 + (x2 - x1) * t) / 8) * 8;
    const y = Math.round((y1 + (y2 - y1) * t) / 8) * 8;
    g.rect(x - 8, y - 8, 16, 16).fill({ color, alpha });
  }
}
