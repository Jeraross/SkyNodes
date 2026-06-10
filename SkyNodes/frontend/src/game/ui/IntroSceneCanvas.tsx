import '../render/pixiSetup';
import { Application, useTick } from '@pixi/react';
import { useCallback, useState } from 'react';
import type { Graphics } from 'pixi.js';
import { getAtariSprite, getSpriteMetrics, type AtariSpriteId } from '../sprites/atariSprites';

export type IntroVisualId =
  | 'boot'
  | 'date'
  | 'solar'
  | 'impact'
  | 'alert'
  | 'network'
  | 'terminal'
  | 'recife'
  | 'antonio'
  | 'carlos'
  | 'mission'
  | 'telephone'
  | 'title';

type IntroSceneCanvasProps = {
  visualId: IntroVisualId;
  color: string;
  spriteId?: AtariSpriteId;
};

const W = 480;
const H = 270;

function parseColor(hex: string): number {
  return Number.parseInt(hex.replace('#', '0x'), 16);
}

function IntroScene({ visualId, color, spriteId }: IntroSceneCanvasProps) {
  const [tick, setTick] = useState(0);
  const accent = parseColor(color);

  useTick(() => setTick(t => (t + 1) & 0xffff));

  const draw = useCallback((g: Graphics) => {
    const slowTick = Math.floor(tick * 0.2);
    g.clear();
    g.rect(0, 0, W, H).fill(0x000000);
    drawGrid(g, accent, slowTick);

    if (visualId === 'boot') drawBoot(g, accent, slowTick);
    if (visualId === 'date') drawDate(g, accent, slowTick);
    if (visualId === 'solar') drawSolar(g, slowTick);
    if (visualId === 'impact') drawImpact(g, slowTick);
    if (visualId === 'alert') drawAlert(g, slowTick);
    if (visualId === 'network') drawNetwork(g, slowTick);
    if (visualId === 'terminal') drawTerminal(g, accent, slowTick);
    if (visualId === 'recife') drawRecife(g, slowTick);
    if (visualId === 'mission') drawMission(g, slowTick);
    if (visualId === 'telephone') drawTelephone(g, accent, slowTick);
    if (visualId === 'title') drawTitleMark(g, slowTick);

    if (spriteId) {
      const x = visualId === 'carlos' ? 284 : 90;
      drawSprite(g, spriteId, x, 48, 7, visualId === 'carlos' && slowTick % 64 < 5 ? 1 : 0);
      drawCharacterSet(g, visualId === 'carlos' ? 72 : 292, slowTick, visualId === 'carlos');
    }

    g.rect(0, 0, W, 2).fill(accent);
    g.rect(0, H - 2, W, 2).fill(accent);
    g.rect(0, 0, 2, H).fill(accent);
    g.rect(W - 2, 0, 2, H).fill(accent);
  }, [accent, color, spriteId, tick, visualId]);

  return <pixiGraphics draw={draw} />;
}

export default function IntroSceneCanvas(props: IntroSceneCanvasProps) {
  return (
    <div className="intro-pixi-scene pixelated" aria-hidden="true">
      <Application width={W} height={H} background={0x000000} antialias={false} resolution={1}>
        <IntroScene {...props} />
      </Application>
    </div>
  );
}

function drawGrid(g: Graphics, color: number, tick: number) {
  for (let y = 16; y < H; y += 16) {
    const alpha = y % 32 === 0 ? 0.16 : 0.08;
    g.rect(0, y + (tick % 16), W, 1).fill({ color, alpha });
  }
  for (let x = 0; x < W; x += 16) {
    g.rect(x, 0, 1, H).fill({ color, alpha: 0.05 });
  }
}

function drawBoot(g: Graphics, color: number, tick: number) {
  drawControlRoom(g, color, tick, false);
  for (let i = 0; i < 8; i++) {
    const h = 10 + ((tick + i * 7) % 32);
    g.rect(118 + i * 28, 164 - h, 12, h).fill(i % 2 ? 0x00ff00 : color);
  }
  drawRadarSweep(g, 346, 82, 42, color, tick);
}

function drawDate(g: Graphics, color: number, tick: number) {
  drawNightSky(g, tick);
  g.rect(168, 78, 144, 72).fill(0x040812);
  g.rect(176, 86, 128, 56).fill({ color, alpha: 0.2 });
  for (let i = 0; i < 4; i++) {
    g.rect(194 + i * 24, 158, 16, 30 + i * 7).fill(0x101828);
    g.rect(198 + i * 24, 164, 4, 4).fill(color);
  }
  g.rect(132 + (tick % 216), 70, 4, 116).fill({ color: 0xffffff, alpha: 0.75 });
}

function drawSolar(g: Graphics, tick: number) {
  g.rect(0, 0, W, H).fill(0x050100);
  for (let i = 0; i < 44; i++) {
    const x = (i * 53 + tick * 2) % W;
    const y = (i * 29) % H;
    g.rect(x, y, 2, 2).fill({ color: 0xffd848, alpha: 0.35 });
  }
  const pulse = tick % 24 < 12 ? 0xffd848 : 0xff8c28;
  pixelCircle(g, 238, 126, 50, pulse);
  pixelCircle(g, 238, 126, 78, 0x8c2818, 0.32);
  pixelCircle(g, 238, 126, 110, 0xff4400, 0.08);
  for (let i = 0; i < 22; i++) {
    const a = (i / 22) * Math.PI * 2 + tick * 0.018;
    const x = 238 + Math.cos(a) * (82 + (i % 3) * 10);
    const y = 126 + Math.sin(a) * (58 + (i % 4) * 5);
    g.rect(x, y, 20 + (i % 2) * 14, 5).fill(i % 2 ? 0xffaa00 : 0xfff0a0);
  }
}

function drawImpact(g: Graphics, tick: number) {
  g.rect(0, 0, W, H).fill(0x070306);
  drawBrazilSilhouette(g, 286, 122, 0.9, 0x103018, 0.95);
  for (let i = 0; i < 16; i++) {
    const x = -120 + ((tick * 7 + i * 54) % 660);
    const y = 36 + i * 11 + Math.sin((tick + i * 8) * 0.08) * 8;
    g.rect(x, y, 88, 5).fill(i % 2 ? 0xff6600 : 0xffd848);
    g.rect(x + 16, y + 8, 44, 3).fill({ color: 0xff2200, alpha: 0.65 });
  }
  for (let i = 0; i < 9; i++) {
    const y = 76 + i * 14;
    const shift = Math.sin((tick + i * 11) * 0.1) * 10;
    g.rect(84 + shift, y, 314, 2).fill({ color: 0xffaa00, alpha: 0.24 });
  }
  const shock = 28 + (tick % 34);
  pixelCircle(g, 318, 144, shock, 0xffd848, 0.18);
  g.rect(304, 136, 28, 16).fill(tick % 18 < 9 ? 0xffffff : 0xff6600);
}

function drawAlert(g: Graphics, tick: number) {
  const color = tick % 32 < 16 ? 0xff0000 : 0x600000;
  drawBrazilSilhouette(g, 240, 136, 1.2, 0x140000, 1);
  for (let i = 0; i < 10; i++) {
    const x = 86 + (i % 5) * 68;
    const y = 72 + Math.floor(i / 5) * 66;
    g.rect(x, y, 34, 44).fill(color);
    g.rect(x + 12, y + 8, 10, 20).fill(0x000000);
    g.rect(x + 13, y + 34, 8, 6).fill(0x000000);
  }
}

function drawNetwork(g: Graphics, tick: number) {
  const nodes: Array<[number, number]> = [[70, 78], [148, 54], [254, 78], [382, 100], [118, 194], [248, 180], [362, 214]];
  for (let i = 0; i < nodes.length - 1; i++) {
    const [x1, y1] = nodes[i];
    const [x2, y2] = nodes[i + 1];
    drawPixelLine(g, x1, y1, x2, y2, tick % 28 < 14 ? 0xff4400 : 0x006060);
  }
  nodes.forEach(([x, y], i) => {
    const live = (tick + i * 5) % 42 > 12;
    g.rect(x - 8, y - 8, 16, 16).fill(live ? 0xff4400 : 0x300000);
    g.rect(x - 3, y - 3, 6, 6).fill(live ? 0xffd848 : 0x000000);
  });
  for (let i = 0; i < 6; i++) {
    const x = 76 + i * 58;
    g.rect(x, 226, 28, 4).fill((tick + i * 9) % 30 < 10 ? 0xff0000 : 0x202020);
  }
}

function drawTerminal(g: Graphics, color: number, tick: number) {
  drawAirportTerminal(g, color, tick);
}

function drawRecife(g: Graphics, tick: number) {
  drawAirportTerminal(g, 0x00ffff, tick);
  g.rect(356, 62, 16, 108).fill(0x607070);
  g.rect(350, 50, 28, 16).fill(0x90a0a0);
  g.rect(374, 56 + (tick % 28), 34, 6).fill(0xff8800);
  g.rect(108, 216, 250, 4).fill(0xffd848);
}

function drawMission(g: Graphics, tick: number) {
  const path: Array<[number, number]> = [[66, 192], [146, 114], [222, 152], [312, 80], [412, 122]];
  for (let i = 0; i < path.length - 1; i++) drawPixelLine(g, path[i][0], path[i][1], path[i + 1][0], path[i + 1][1], 0x00ff00);
  for (const [x, y] of path) {
    g.rect(x - 5, y - 5, 10, 10).fill(0xffd848);
  }
  const p = path[Math.floor((tick / 16) % path.length)];
  g.rect(p[0] - 8, p[1] - 8, 16, 16).fill({ color: 0x00ffff, alpha: 0.35 });
}

function drawTelephone(g: Graphics, color: number, tick: number) {
  g.rect(0, 0, W, H).fill(0x020306);
  // desk
  g.rect(0, 190, W, 80).fill(0x050508);
  // phone body
  g.rect(152, 110, 176, 96).fill(0x1a1a1a);
  g.rect(160, 118, 160, 80).fill(0x252525);
  // handset (two blocks)
  g.rect(160, 90, 64, 24).fill(0x303030);
  g.rect(256, 90, 64, 24).fill(0x303030);
  g.rect(160, 94, 64, 6).fill(0x1a1a1a);
  g.rect(256, 94, 64, 6).fill(0x1a1a1a);
  // dial plate
  g.rect(208, 126, 64, 64).fill(0x111111);
  // dial holes (3x3 grid of small squares)
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      g.rect(216 + col * 16, 134 + row * 16, 8, 8).fill(0x333333);
    }
  }
  // side buttons
  for (let i = 0; i < 4; i++) {
    g.rect(164, 130 + i * 14, 32, 8).fill(0x1a1a1a);
    g.rect(166, 132 + i * 14, 6, 4).fill((tick + i * 7) % 24 < 12 ? color : 0x0a0a0a);
  }
  // ring waves (animated concentric squares)
  const wave = tick % 30;
  if (wave < 20) {
    const r1 = 48 + wave;
    const r2 = 32 + wave;
    const cx = 240, cy = 130;
    const a1 = Math.max(0, 0.15 - wave * 0.006);
    const a2 = Math.max(0, 0.25 - wave * 0.01);
    g.rect(cx - r1, cy - r1, r1 * 2, r1 * 2).fill({ color, alpha: a1 });
    g.rect(cx - r2, cy - r2, r2 * 2, r2 * 2).fill({ color, alpha: a2 });
  }
  // phone cord (wavy dots)
  for (let i = 0; i < 12; i++) {
    const fx = 152 - i * 8;
    const fy = 158 + Math.round(Math.sin(i * 0.8) * 12);
    g.rect(fx, fy, 6, 6).fill(0x333333);
  }
}

function drawTitleMark(g: Graphics, tick: number) {
  g.rect(110, 78, 122, 54).fill(0xff0000);
  g.rect(248, 78, 122, 54).fill(0xffd848);
  g.rect(140, 152, 200, 12).fill(tick % 36 < 18 ? 0x00ffff : 0x00ff00);
}

function drawCharacterSet(g: Graphics, x: number, tick: number, isCarlos: boolean) {
  g.rect(x, 82, 126, 96).fill(0x04080c);
  g.rect(x + 8, 92, 110, 62).fill(isCarlos ? 0x181000 : 0x001420);
  g.rect(x + 20, 108, 34 + (tick % 44), 4).fill(isCarlos ? 0xffd848 : 0x00ffff);
  g.rect(x + 20, 124, 78, 4).fill(0x00ff00);
  g.rect(x + 20, 140, 52, 4).fill(isCarlos ? 0xff4400 : 0x0060ff);
  if (isCarlos) {
    g.rect(x + 74, 112, 28, 24).fill(0x303030);
    g.rect(x + 80, 118, 16, 4).fill(0xff0000);
  } else {
    g.rect(x + 78, 112, 18, 30).fill(0x303030);
    g.rect(x + 82, 116, 10, 18).fill(0x00ffff);
  }
  g.rect(x + 36, 166, 54, 10).fill(0x404040);
}

function drawControlRoom(g: Graphics, color: number, tick: number, dark: boolean) {
  g.rect(42, 46, 396, 138).fill(dark ? 0x020506 : 0x061006);
  g.rect(58, 62, 174, 72).fill(dark ? 0x050505 : 0x001800);
  g.rect(248, 62, 158, 72).fill(0x040812);
  for (let i = 0; i < 6; i++) {
    g.rect(76, 80 + i * 8, 76 + ((tick + i * 13) % 76), 3).fill(i % 2 ? color : 0x00ff00);
  }
  g.rect(78, 154, 324, 26).fill(0x1a1a1a);
  for (let i = 0; i < 11; i++) {
    g.rect(92 + i * 27, 162, 13, 6).fill((tick + i * 4) % 22 < 11 ? color : 0x303030);
  }
}

function drawRadarSweep(g: Graphics, cx: number, cy: number, radius: number, color: number, tick: number) {
  pixelCircle(g, cx, cy, radius, color, 0.06);
  g.rect(cx - radius, cy, radius * 2, 1).fill({ color, alpha: 0.25 });
  g.rect(cx, cy - radius, 1, radius * 2).fill({ color, alpha: 0.25 });
  const angle = tick * 0.08;
  drawPixelLine(g, cx, cy, cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius, color);
  g.rect(cx - 3, cy - 3, 6, 6).fill(color);
}

function drawNightSky(g: Graphics, tick: number) {
  g.rect(0, 0, W, H).fill(0x020714);
  for (let i = 0; i < 26; i++) {
    const x = (i * 71 + tick) % W;
    const y = 18 + ((i * 37) % 134);
    g.rect(x, y, 2, 2).fill({ color: 0xc8f8ff, alpha: i % 3 ? 0.45 : 0.85 });
  }
  g.rect(0, 190, W, 80).fill(0x050608);
}

function drawAirportTerminal(g: Graphics, color: number, tick: number) {
  g.rect(70, 170, 338, 38).fill(0x303840);
  g.rect(98, 132, 132, 38).fill(0x586068);
  g.rect(108, 142, 112, 10).fill(0x101820);
  g.rect(260, 108, 86, 62).fill(0x485058);
  for (let i = 0; i < 6; i++) {
    g.rect(112 + i * 18, 146, 8, 8).fill((tick + i * 6) % 24 < 12 ? color : 0x101820);
  }
  g.rect(92, 210, 292, 8).fill(0x121212);
  g.rect(126 + (tick % 190), 196, 24, 5).fill(0xffffff);
}

function drawBrazilSilhouette(g: Graphics, cx: number, cy: number, scale: number, color: number, alpha: number) {
  const cells: Array<[number, number, number, number]> = [
    [-30, -82, 44, 20], [10, -72, 42, 28], [-54, -52, 70, 46], [14, -44, 62, 48],
    [-42, -6, 96, 52], [22, 36, 42, 48], [-6, 78, 34, 56], [-26, 126, 22, 38],
  ];
  for (const [x, y, w, h] of cells) {
    g.rect(cx + x * scale, cy + y * scale, w * scale, h * scale).fill({ color, alpha });
  }
}

function drawSprite(g: Graphics, spriteId: AtariSpriteId, x: number, y: number, scale: number, jitter: number) {
  const sprite = getAtariSprite(spriteId);
  const metrics = getSpriteMetrics(sprite);
  g.rect(x - 6, y - 6, metrics.width * scale + 12, metrics.height * scale + 12).fill(0x050505);
  for (let row = 0; row < sprite.rows.length; row++) {
    for (let col = 0; col < sprite.rows[row].length; col++) {
      const color = sprite.palette[sprite.rows[row][col]];
      if (color === undefined) continue;
      g.rect(x + col * scale + (jitter && row % 4 === 0 ? scale : 0), y + row * scale, scale, scale).fill(color);
    }
  }
}

function pixelCircle(g: Graphics, cx: number, cy: number, radius: number, color: number, alpha = 1) {
  for (let y = -radius; y <= radius; y += 4) {
    for (let x = -radius; x <= radius; x += 4) {
      if (x * x + y * y <= radius * radius) {
        g.rect(cx + x, cy + y, 4, 4).fill({ color, alpha });
      }
    }
  }
}

function drawPixelLine(g: Graphics, x1: number, y1: number, x2: number, y2: number, color: number) {
  const steps = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1)) / 4;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    g.rect(Math.round(x1 + (x2 - x1) * t), Math.round(y1 + (y2 - y1) * t), 4, 4).fill(color);
  }
}
