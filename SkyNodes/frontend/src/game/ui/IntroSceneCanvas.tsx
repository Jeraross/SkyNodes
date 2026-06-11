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

// Airport nodes positioned on Brazil silhouette (cx=240, cy=122, scale=0.9)
const BR_NODES: Array<[number, number]> = [
  [205, 104], // MAO
  [261,  61], // BEL
  [292,  85], // FOR
  [305, 135], // REC
  [289, 166], // SSA
  [258, 156], // BSB
  [280, 210], // GIG
  [268, 205], // GRU
  [262, 230], // CWB
  [252, 261], // POA
];
const BR_EDGES: Array<[number, number]> = [
  [0, 1], [1, 2], [1, 5], [2, 3],
  [3, 4], [4, 5], [4, 6], [5, 7],
  [6, 7], [7, 8], [8, 9], [0, 5],
];

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
      const x = visualId === 'agente-j' ? 284 : 90;
      drawSprite(g, spriteId, x, 48, 7, 0);
      drawCharacterSet(g, visualId === 'agente-j' ? 72 : 292, slowTick, false);
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

// Earth at cx,cy radius r — Brasil visible via scaled silhouette.
// Visual centre of the silhouette is ~+8 x, +41 y in logical units, so offset
// by -8*s and -41*s to align it with the sphere centre.
function drawEarth(g: Graphics, cx: number, cy: number, r: number) {
  const s = 0.11;
  pixelCircle(g, cx, cy, r, 0x0b2fa8);
  drawBrazilSilhouette(g, cx - Math.round(8 * s), cy - Math.round(41 * s), s, 0x1a8020, 0.9);
  pixelCircle(g, cx, cy, r + 4, 0x4488ff, 0.13);
}

function drawSolar(g: Graphics, tick: number) {
  g.rect(0, 0, W, H).fill(0x050100);
  for (let i = 0; i < 44; i++) {
    const x = (i * 53 + tick * 2) % W;
    const y = (i * 29) % H;
    g.rect(x, y, 2, 2).fill({ color: 0xffd848, alpha: 0.35 });
  }
  // Earth/Brasil — bottom-right, in the solar wave path
  drawEarth(g, 378, 206, 28);

  const pulse = tick % 24 < 12 ? 0xffd848 : 0xff8c28;
  pixelCircle(g, 238, 126, 50, pulse);
  pixelCircle(g, 238, 126, 78, 0x8c2818, 0.32);
  pixelCircle(g, 238, 126, 110, 0xff4400, 0.08);
  for (let i = 0; i < 22; i++) {
    const a = (i / 22) * Math.PI * 2 + tick * 0.018;
    const x = Math.round(238 + Math.cos(a) * (82 + (i % 3) * 10));
    const y = Math.round(126 + Math.sin(a) * (58 + (i % 4) * 5));
    g.rect(x, y, 20 + (i % 2) * 14, 4).fill(i % 2 ? 0xffaa00 : 0xfff0a0);
  }
  // Directional solar particles streaming from sun toward Earth/Brasil
  // Sun center (238,126) → Earth center (378,206), direction ~(0.87, 0.50)
  for (let i = 0; i < 12; i++) {
    const t = ((tick * 3 + i * 18) % 100) / 100;
    const r = 82 + t * 110;
    const px = Math.round(238 + 0.868 * r);
    const py = Math.round(126 + 0.497 * r);
    const alpha = 0.75 - t * 0.45;
    g.rect(px, py, 6, 3).fill({ color: 0xff6600, alpha });
  }
}

function drawImpact(g: Graphics, tick: number) {
  g.rect(0, 0, W, H).fill(0x070306);
  // Brasil silhouette — centred at cx=240
  drawBrazilSilhouette(g, 240, 122, 0.9, 0x0c2010, 0.95);
  drawBrazilSilhouette(g, 240, 122, 0.9, 0x1a3016, 0.45);

  // Network — fully connected, blinking red under the solar storm
  const pulse = tick % 28 < 14;
  for (const [a, b] of BR_EDGES) {
    drawPixelLine(g, BR_NODES[a][0], BR_NODES[a][1],
                     BR_NODES[b][0], BR_NODES[b][1],
                     pulse ? 0xff4400 : 0x881800);
  }
  for (const [x, y] of BR_NODES) {
    g.rect(x - 6, y - 6, 12, 12).fill(pulse ? 0xff2200 : 0x550000);
    g.rect(x - 2, y - 2,  4,  4).fill(pulse ? 0xffd848 : 0x663300);
  }

  // Solar wave bands sweeping left→right (original effect the user liked)
  for (let i = 0; i < 16; i++) {
    const x = -120 + ((tick * 7 + i * 54) % 660);
    const y = 36 + i * 11 + Math.sin((tick + i * 8) * 0.08) * 8;
    g.rect(x, y, 88, 5).fill(i % 2 ? 0xff6600 : 0xffd848);
    g.rect(x + 16, y + 8, 44, 3).fill({ color: 0xff2200, alpha: 0.65 });
  }
  // Subtle horizontal scan lines
  for (let i = 0; i < 9; i++) {
    const y = 76 + i * 14;
    const shift = Math.sin((tick + i * 11) * 0.1) * 10;
    g.rect(84 + shift, y, 314, 2).fill({ color: 0xffaa00, alpha: 0.24 });
  }
  // Expanding shockwave at Brazil center
  const shock = 28 + (tick % 34);
  pixelCircle(g, 252, 144, shock, 0xffd848, 0.18);
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
  g.rect(0, 0, W, H).fill(0x050106);
  drawBrazilSilhouette(g, 240, 122, 0.9, 0x0b1f09, 0.9);
  drawBrazilSilhouette(g, 240, 122, 0.9, 0x183012, 0.4);

  // Each edge dies at a different tick — progressive disconnection
  const phase = tick % 300;
  const STEP = 22;

  for (let i = 0; i < BR_EDGES.length; i++) {
    const [a, b] = BR_EDGES[i];
    const [x1, y1] = BR_NODES[a];
    const [x2, y2] = BR_NODES[b];
    const deadAt = i * STEP;
    if (phase < deadAt) {
      // Still alive — green
      drawPixelLine(g, x1, y1, x2, y2, 0x00aa00);
    } else if (phase < deadAt + 10) {
      // Dying — red flash
      drawPixelLine(g, x1, y1, x2, y2, tick % 6 < 3 ? 0xff2200 : 0x000000);
    }
    // else: gone
  }

  // Nodes — green if connected, blinking red when isolated
  for (let i = 0; i < BR_NODES.length; i++) {
    const [x, y] = BR_NODES[i];
    const hasLiveEdge = BR_EDGES.some(([a, b], ei) =>
      (a === i || b === i) && phase < ei * STEP,
    );
    const col   = hasLiveEdge ? 0x00ff00 : (tick % 22 < 11 ? 0xff2200 : 0x330000);
    const inner = hasLiveEdge ? 0xffd848 : 0x000000;
    g.rect(x - 6, y - 6, 12, 12).fill(col);
    g.rect(x - 2, y - 2,  4,  4).fill(inner);
  }

  // Glitch scanlines
  for (let i = 0; i < 5; i++) {
    if ((tick + i * 19) % 55 < 10) {
      g.rect(0, 30 + i * 46, W, 3).fill({ color: 0xff0000, alpha: 0.22 });
    }
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
  g.rect(0, 0, W, H).fill(0x000000);
  // Starfield
  for (let i = 0; i < 38; i++) {
    const sx = (i * 89 + 23) % W;
    const sy = (i * 53 + 11) % (H - 40);
    const on = (tick + i * 11) % 40 < 20;
    g.rect(sx, sy, 2, 2).fill({ color: 0xffd848, alpha: on ? 0.55 : 0.12 });
  }
  // Brasil silhouette — faint glow  (scaled to center, smaller)
  drawBrazilSilhouette(g, 240, 105, 0.74, 0x001500, 0.9);
  drawBrazilSilhouette(g, 240, 105, 0.74, 0x003800, 0.45);
  // Network nodes slowly lighting up — hint of restoration
  // Positions scaled from BR_NODES (original cx=286,cy=122,s=0.9) to (cx=240,cy=105,s=0.74)
  const tNodes: Array<[number, number]> = BR_NODES.map(([px, py]) => [
    Math.round(240 + (px - 240) / 0.9 * 0.74),
    Math.round(105 + (py - 122) / 0.9 * 0.74),
  ]) as Array<[number, number]>;
  const litCount = Math.floor((tick % 130) / 11);
  for (let i = 0; i < Math.min(litCount, BR_EDGES.length); i++) {
    const [a, b] = BR_EDGES[i];
    drawPixelLine(g, tNodes[a][0], tNodes[a][1], tNodes[b][0], tNodes[b][1], 0x007700);
  }
  for (let i = 0; i < tNodes.length; i++) {
    const [x, y] = tNodes[i];
    const lit = i < litCount;
    const pulse = (tick + i * 8) % 28 < 14;
    if (lit) {
      g.rect(x - 5, y - 5, 10, 10).fill(pulse ? 0x00ff00 : 0x008800);
      g.rect(x - 2, y - 2,  4,  4).fill(0xffd848);
    } else {
      g.rect(x - 3, y - 3,  6,  6).fill(0x1a0000);
    }
  }
}

function drawCharacterSet(g: Graphics, x: number, tick: number, _isAlt: boolean) {
  g.rect(x, 82, 126, 96).fill(0x04080c);
  g.rect(x + 8, 92, 110, 62).fill(0x001420);
  g.rect(x + 20, 108, 34 + (tick % 44), 4).fill(0x00ffff);
  g.rect(x + 20, 124, 78, 4).fill(0x00ff00);
  g.rect(x + 20, 140, 52, 4).fill(0x0060ff);
  g.rect(x + 78, 112, 18, 30).fill(0x303030);
  g.rect(x + 82, 116, 10, 18).fill(0x00ffff);
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

// Brazil silhouette — 16 horizontal slices matching real outline per latitude.
// Each row [x, y, w, h] in logical units; scale maps to pixel size.
// Left edge (x) = western border; width (w) = extent to east coast.
// y range: -82 (Amapá north) to +164 (RS south tip) — total 246 units.
function drawBrazilSilhouette(g: Graphics, cx: number, cy: number, scale: number, color: number, alpha: number) {
  const cells: Array<[number, number, number, number]> = [
    // Northern tip — Amapá + northern Pará (small, right-biased)
    [-28, -82,  42, 16],
    // Amazon basin — Amazonas/Pará, widens far west
    [-52, -66, 102, 16],
    [-54, -50, 106, 16],
    // NE bulge — Brazil's right edge jumps east (Maranhão → Recife coast)
    [-50, -34, 126, 16],
    [-46, -18, 122, 16],   // widest east extent (Fortaleza/Natal lat.)
    [-44,  -2, 110, 16],   // Recife / Maceió lat.
    // Taper begins — right coast retreats south, west stays roughly flat
    [-44,  14,  98, 16],   // Bahia / Sergipe
    [-44,  30,  90, 16],   // Brasília lat.
    [-40,  46,  78, 16],   // central plateau (MT/MS)
    [-28,  62,  58, 16],   // Minas Gerais / ES — both sides narrow
    // Southeast coast
    [-18,  78,  42, 16],   // SP / RJ
    [-16,  94,  36, 16],   // Paraná
    [-14, 110,  28, 16],   // Santa Catarina
    // South — RS tapering to tip
    [-12, 126,  22, 16],
    [-10, 142,  16, 16],
    [-10, 158,  12,  6],   // far south tip (Porto Alegre lat.)
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
