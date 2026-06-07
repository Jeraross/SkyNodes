import { useCallback } from 'react';
import type { Graphics } from 'pixi.js';
import { WORLD_SIZE } from '../data/aerotaleWorld';

const COLORS = {
  bg: 0x09124a,
  ocean: 0x143c9a,
  coast: 0x2d6fd1,
  land: 0x2fbf4a,
  landDark: 0x16843b,
  forest: 0x0b5f2b,
  river: 0x55aaff,
  mountain: 0xb16a2a,
  mountainHi: 0xffb347,
  city: 0xff6b32,
  white: 0xf8f8f8,
};

export default function WorldLayer() {
  const draw = useCallback((g: Graphics) => {
    g.clear();
    g.rect(0, 0, WORLD_SIZE.width, WORLD_SIZE.height).fill(COLORS.bg);

    drawDitheredOcean(g);
    drawBrazil(g);
    drawTerrain(g);
  }, []);

  return <pixiGraphics draw={draw} />;
}

function drawDitheredOcean(g: Graphics) {
  g.rect(0, 0, WORLD_SIZE.width, WORLD_SIZE.height).fill(COLORS.ocean);
  for (let y = 0; y < WORLD_SIZE.height; y += 64) {
    for (let x = (y / 64) % 2 === 0 ? 0 : 32; x < WORLD_SIZE.width; x += 96) {
      g.rect(x, y, 18, 8).fill(COLORS.coast);
    }
  }
}

function drawBrazil(g: Graphics) {
  const shape = [
    510, 110, 710, 95, 900, 140, 1060, 180, 1260, 260,
    1360, 385, 1300, 515, 1215, 605, 1155, 730, 1055, 850,
    930, 900, 815, 850, 740, 790, 620, 755, 520, 650,
    405, 600, 330, 500, 265, 380, 330, 250,
  ];

  g.poly(shape).fill(COLORS.landDark);
  g.poly([
    540, 145, 700, 125, 875, 160, 1030, 205, 1200, 285,
    1288, 392, 1232, 500, 1150, 588, 1095, 705, 1015, 810,
    915, 850, 820, 800, 745, 740, 635, 710, 540, 610,
    440, 560, 370, 475, 315, 380, 370, 280,
  ]).fill(COLORS.land);

  for (let y = 170; y < 800; y += 38) {
    const offset = y % 76 === 0 ? 0 : 34;
    for (let x = 410 + offset; x < 1140; x += 92) {
      if ((x + y) % 5 === 0) g.rect(x, y, 18, 10).fill(COLORS.landDark);
    }
  }
}

function drawTerrain(g: Graphics) {
  // Amazon and northwestern forest mass: broad, connected, intentionally abstract.
  g.poly([
    365, 210, 530, 145, 755, 150, 840, 235, 820, 345,
    700, 410, 505, 395, 380, 315,
  ]).fill(COLORS.forest);
  for (let y = 190; y <= 360; y += 32) {
    for (let x = 410; x <= 780; x += 48) {
      if ((x + y) % 3 !== 0) g.rect(x, y, 22, 14).fill(COLORS.landDark);
    }
  }

  // Northeast dry plateau.
  g.poly([900, 230, 1110, 270, 1260, 350, 1190, 500, 985, 465, 875, 360]).fill(0x86c947);

  // Connected rivers, thick and jagged.
  drawPixelLine(g, [[650, 150], [710, 240], [780, 310], [855, 410], [900, 530], [930, 665]], COLORS.river, 16);
  drawPixelLine(g, [[500, 430], [620, 470], [760, 485], [900, 540], [1030, 650]], COLORS.river, 12);

  // Serra bands: angular connected blocks instead of repeated tiny stamps.
  drawMountainBand(g, [[720, 620], [820, 640], [930, 660], [1045, 715], [1125, 770]]);
  drawMountainBand(g, [[840, 545], [930, 570], [1040, 615], [1155, 670]]);

  // South block.
  g.poly([835, 770, 955, 825, 1010, 895, 930, 940, 805, 895, 755, 820]).fill(COLORS.landDark);
}

function drawMountainBand(g: Graphics, points: Array<[number, number]>) {
  for (let i = 0; i < points.length - 1; i += 1) {
    drawPixelLine(g, [points[i], points[i + 1]], COLORS.mountain, 22);
  }
  for (const [x, y] of points) {
    g.poly([x - 26, y + 18, x, y - 28, x + 28, y + 18]).fill(COLORS.mountainHi);
    g.poly([x - 18, y + 14, x, y - 14, x + 18, y + 14]).fill(COLORS.mountain);
  }
}

function drawPixelLine(g: Graphics, points: Array<[number, number]>, color: number, width: number) {
  for (let i = 0; i < points.length - 1; i += 1) {
    const [x1, y1] = points[i];
    const [x2, y2] = points[i + 1];
    const steps = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1)) / 24;
    for (let s = 0; s <= steps; s += 1) {
      const t = steps === 0 ? 0 : s / steps;
      const x = Math.round((x1 + (x2 - x1) * t) / 8) * 8;
      const y = Math.round((y1 + (y2 - y1) * t) / 8) * 8;
      g.rect(x - width / 2, y - width / 2, width, width).fill(color);
    }
  }
}
