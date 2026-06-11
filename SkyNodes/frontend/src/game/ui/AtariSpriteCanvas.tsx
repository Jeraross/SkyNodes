import '../render/pixiSetup';
import { Application, useTick } from '@pixi/react';
import { useCallback, useState } from 'react';
import type { Graphics } from 'pixi.js';
import { getAtariSprite, getSpriteMetrics, type AtariSpriteId } from '../sprites/atariSprites';

type AtariSpriteCanvasProps = {
  spriteId: AtariSpriteId;
  scale?: number;
  frameColor?: number;
  glitch?: boolean;
  label?: string;
};

function AtariSpriteScene({
  spriteId,
  scale,
  frameColor,
  glitch,
}: Required<Pick<AtariSpriteCanvasProps, 'spriteId' | 'scale' | 'frameColor' | 'glitch'>>) {
  const [tick, setTick] = useState(0);
  const sprite = getAtariSprite(spriteId);
  const metrics = getSpriteMetrics(sprite);

  useTick(() => {
    setTick(t => (t + 1) & 0xffff);
  });

  const draw = useCallback((g: Graphics) => {
    g.clear();
    const jitter = glitch && tick % 34 < 3 ? 1 : 0;
    const w = metrics.width * scale;
    const h = metrics.height * scale;

    g.rect(0, 0, w + 8, h + 8).fill(0x000000);
    g.rect(0, 0, w + 8, 2).fill(frameColor);
    g.rect(0, h + 6, w + 8, 2).fill(frameColor);
    g.rect(0, 0, 2, h + 8).fill(frameColor);
    g.rect(w + 6, 0, 2, h + 8).fill(frameColor);

    for (let y = 0; y < sprite.rows.length; y++) {
      const row = sprite.rows[y];
      for (let x = 0; x < row.length; x++) {
        const color = sprite.palette[row[x]];
        if (color === undefined) continue;
        const ox = 4 + x * scale + (jitter && y % 3 === 0 ? jitter * scale : 0);
        const oy = 4 + y * scale;
        g.rect(ox, oy, scale, scale).fill(color);
      }
    }

    if (glitch && tick % 52 < 5) {
      g.rect(4, 4 + ((tick * 3) % Math.max(1, h - 4)), w, scale).fill({ color: 0xffffff, alpha: 0.22 });
    }
  }, [frameColor, glitch, metrics.height, metrics.width, scale, sprite, tick]);

  return <pixiGraphics draw={draw} />;
}

export default function AtariSpriteCanvas({
  spriteId,
  scale = 5,
  frameColor = 0xffd700,
  glitch = false,
  label,
}: AtariSpriteCanvasProps) {
  const metrics = getSpriteMetrics(getAtariSprite(spriteId));
  const width = metrics.width * scale + 8;
  const height = metrics.height * scale + 8;

  return (
    <div
      className="atari-sprite-canvas pixelated"
      aria-label={label ?? spriteId}
      style={{ width, height }}
    >
      <Application width={width} height={height} background={0x000000} antialias={false} resolution={1}>
        <AtariSpriteScene spriteId={spriteId} scale={scale} frameColor={frameColor} glitch={glitch} />
      </Application>
    </div>
  );
}
