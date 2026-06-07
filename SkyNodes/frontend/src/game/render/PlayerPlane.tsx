import { useCallback } from 'react';
import type { Graphics } from 'pixi.js';
import type { PlayerPosition } from '../types';

interface PlayerPlaneProps {
  position: PlayerPosition;
  heading: number;
}

export default function PlayerPlane({ position, heading }: PlayerPlaneProps) {
  const draw = useCallback((g: Graphics) => {
    g.clear();
    g.poly([24, 0, -18, -12, -8, 0, -18, 12]).fill(0xffffff);
    g.rect(-7, -5, 16, 10).fill(0xfff26b);
    g.rect(-14, -22, 10, 44).fill(0xffffff);
  }, []);

  return (
    <pixiGraphics x={position.x} y={position.y} rotation={heading} draw={draw} />
  );
}
