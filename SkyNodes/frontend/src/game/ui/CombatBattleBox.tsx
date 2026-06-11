import '../render/pixiSetup';
import { Application, useTick } from '@pixi/react';
import { useCallback, useRef } from 'react';
import type { Graphics } from 'pixi.js';
import type { SpawnWave } from '../data/combatEncounters';

// ─── Public types ─────────────────────────────────────────────────────────────
export const BOX_W = 320;
export const BOX_H = 200;

export type CombatBullet = {
  id: number;
  x: number;
  y: number;
  dx: number; // px / ms
  dy: number;
  size: number;
  color: number; // pixi hex uint
  bouncing: boolean;
};

let _nextId = 0;
const nextId = () => ++_nextId;

// ─── Pixel-art heart template ─────────────────────────────────────────────────
const HP = 2; // pixel size
const HEART_PIX = [
  [0, 1, 1, 0, 1, 1, 0],
  [1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1],
  [0, 1, 1, 1, 1, 1, 0],
  [0, 0, 1, 1, 1, 0, 0],
  [0, 0, 0, 1, 0, 0, 0],
];
const HEART_W = 7 * HP;
const HEART_H = 6 * HP;
const HITBOX = 4; // half-size of the real hitbox
const BORDER = 4;
const HEART_SPD = 0.18; // px/ms  (~180 px/s)

// ─── Bullet spawner ───────────────────────────────────────────────────────────
function parseColor(hex: string): number {
  return parseInt(hex.replace('#', '0x'), 16);
}

export function spawnWave(
  wave: SpawnWave,
  bulletsRef: React.MutableRefObject<CombatBullet[]>,
  heartPos: { x: number; y: number },
) {
  const spd = (wave.speed * 60) / 1000;
  const col = parseColor(wave.color ?? '#ff4400');
  const sz = wave.size ?? 8;

  switch (wave.type) {
    case 'sweep-h': {
      const gap = wave.gap ?? 60;
      for (let i = 0; i < wave.count; i++) {
        const y = BORDER + 12 + i * gap;
        if (y > BOX_H - BORDER) continue;
        const dx = wave.fromRight ? -spd : spd;
        const x = wave.fromRight ? BOX_W - BORDER - 1 : BORDER + 1;
        bulletsRef.current.push({ id: nextId(), x, y, dx, dy: 0, size: sz, color: col, bouncing: false });
      }
      break;
    }
    case 'sweep-v': {
      const gap = wave.gap ?? 80;
      for (let i = 0; i < wave.count; i++) {
        const x = BORDER + 12 + i * gap;
        if (x > BOX_W - BORDER) continue;
        const dy = wave.fromBottom ? -spd : spd;
        const y = wave.fromBottom ? BOX_H - BORDER - 1 : BORDER + 1;
        bulletsRef.current.push({ id: nextId(), x, y, dx: 0, dy, size: sz, color: col, bouncing: false });
      }
      break;
    }
    case 'rain': {
      const inner = BOX_W - BORDER * 2 - 16;
      for (let i = 0; i < wave.count; i++) {
        const x = BORDER + 8 + Math.random() * inner;
        bulletsRef.current.push({ id: nextId(), x, y: BORDER + 1, dx: 0, dy: spd, size: sz, color: col, bouncing: false });
      }
      break;
    }
    case 'aimed': {
      const edges = [
        { x: Math.random() * BOX_W, y: BORDER + 1 },
        { x: BOX_W - BORDER - 1, y: Math.random() * BOX_H },
        { x: Math.random() * BOX_W, y: BOX_H - BORDER - 1 },
        { x: BORDER + 1, y: Math.random() * BOX_H },
      ];
      for (let i = 0; i < wave.count; i++) {
        const src = edges[i % 4];
        const tx = heartPos.x - src.x;
        const ty = heartPos.y - src.y;
        const spread = (Math.random() - 0.5) * 0.4;
        const angle = Math.atan2(ty, tx) + spread;
        bulletsRef.current.push({
          id: nextId(), x: src.x, y: src.y,
          dx: Math.cos(angle) * spd, dy: Math.sin(angle) * spd,
          size: sz, color: col, bouncing: false,
        });
      }
      break;
    }
    case 'bounce': {
      for (let i = 0; i < wave.count; i++) {
        const angle = (i / wave.count) * Math.PI * 2 + Math.random() * 0.5;
        bulletsRef.current.push({
          id: nextId(),
          x: BOX_W / 2 + (Math.random() - 0.5) * 100,
          y: BOX_H / 2 + (Math.random() - 0.5) * 60,
          dx: Math.cos(angle) * spd,
          dy: Math.sin(angle) * spd,
          size: sz + 2, color: col, bouncing: true,
        });
      }
      break;
    }
    case 'grid': {
      const cols = 5;
      const rows = 3;
      const cw = (BOX_W - BORDER * 2) / cols;
      const ch = (BOX_H - BORDER * 2) / rows;
      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          if ((c + r) % 2 === 0) continue;
          const x = BORDER + c * cw + cw / 2;
          const y = wave.fromBottom ? BOX_H - BORDER - 1 : BORDER + 1;
          const dy2 = wave.fromBottom ? -(spd * 0.6) : spd * 0.6;
          bulletsRef.current.push({ id: nextId(), x, y, dx: 0, dy: dy2, size: 10, color: col, bouncing: false });
          if (r === 1) {
            const ry = BORDER + r * ch + ch / 2;
            bulletsRef.current.push({ id: nextId(), x: BORDER + 1, y: ry, dx: spd * 0.4, dy: 0, size: sz - 2, color: col, bouncing: false });
          }
        }
      }
      break;
    }
    case 'zigzag': {
      for (let i = 0; i < wave.count; i++) {
        const fromLeft = i % 2 === 0;
        const y = BORDER + 12 + Math.random() * (BOX_H - BORDER * 2 - 24);
        const xVel = fromLeft ? spd : -spd;
        const yVel = (i % 4 < 2 ? 1 : -1) * spd * 0.45;
        bulletsRef.current.push({
          id: nextId(),
          x: fromLeft ? BORDER + 1 : BOX_W - BORDER - 1,
          y, dx: xVel, dy: yVel,
          size: sz, color: col, bouncing: false,
        });
      }
      break;
    }
  }
}

// ─── Inner Pixi scene — purely imperative, no React state in the tick loop ────
interface BattleSceneProps {
  activeRef: React.MutableRefObject<boolean>;
  heartRef: React.MutableRefObject<{ x: number; y: number }>;
  bulletsRef: React.MutableRefObject<CombatBullet[]>;
  keysRef: React.MutableRefObject<Set<string>>;
  invincibleRef: React.MutableRefObject<boolean>;
  onHit: () => void;
}

function BattleScene({ activeRef, heartRef, bulletsRef, keysRef, invincibleRef, onHit }: BattleSceneProps) {
  const gRef = useRef<Graphics | null>(null);
  // Keep onHit in a ref so the stable tick callback always sees the latest version
  const onHitRef = useRef(onHit);
  onHitRef.current = onHit;

  // useCallback with [] deps → same function reference every render
  // This prevents useTick from re-registering the ticker on every re-render,
  // which would accumulate callbacks and freeze Firefox
  const tick = useCallback((ticker: { deltaMS: number }) => {
    const dt = ticker.deltaMS;
    const heart = heartRef.current;
    const keys = keysRef.current;

    if (activeRef.current) {
      const minX = BORDER + 8;
      const maxX = BOX_W - BORDER - 8;
      const minY = BORDER + 8;
      const maxY = BOX_H - BORDER - 8;

      if (keys.has('arrowleft') || keys.has('a')) heart.x = Math.max(minX, heart.x - HEART_SPD * dt);
      if (keys.has('arrowright') || keys.has('d')) heart.x = Math.min(maxX, heart.x + HEART_SPD * dt);
      if (keys.has('arrowup') || keys.has('w')) heart.y = Math.max(minY, heart.y - HEART_SPD * dt);
      if (keys.has('arrowdown') || keys.has('s')) heart.y = Math.min(maxY, heart.y + HEART_SPD * dt);

      const alive: CombatBullet[] = [];
      for (const b of bulletsRef.current) {
        b.x += b.dx * dt;
        b.y += b.dy * dt;
        if (b.bouncing) {
          const minB = BORDER + b.size / 2;
          if (b.x <= BORDER + b.size / 2) { b.dx = Math.abs(b.dx); b.x = minB; }
          if (b.x >= BOX_W - BORDER - b.size / 2) { b.dx = -Math.abs(b.dx); b.x = BOX_W - BORDER - b.size / 2; }
          if (b.y <= BORDER + b.size / 2) { b.dy = Math.abs(b.dy); b.y = minB; }
          if (b.y >= BOX_H - BORDER - b.size / 2) { b.dy = -Math.abs(b.dy); b.y = BOX_H - BORDER - b.size / 2; }
        }
        const inBounds = b.x > -20 && b.x < BOX_W + 20 && b.y > -20 && b.y < BOX_H + 20;
        if (inBounds || b.bouncing) alive.push(b);
      }
      bulletsRef.current = alive;

      if (!invincibleRef.current) {
        for (const b of bulletsRef.current) {
          if (Math.abs(b.x - heart.x) < HITBOX + b.size / 2 && Math.abs(b.y - heart.y) < HITBOX + b.size / 2) {
            onHitRef.current();
            break;
          }
        }
      }
    }

    // Draw imperatively via ref — zero React state updates in the tick loop
    const g = gRef.current;
    if (!g) return;

    g.clear();
    g.rect(0, 0, BOX_W, BOX_H).fill(0x000000);
    g.rect(0, 0, BOX_W, BORDER).fill(0xffffff);
    g.rect(0, BOX_H - BORDER, BOX_W, BORDER).fill(0xffffff);
    g.rect(0, 0, BORDER, BOX_H).fill(0xffffff);
    g.rect(BOX_W - BORDER, 0, BORDER, BOX_H).fill(0xffffff);

    for (const b of bulletsRef.current) {
      const half = b.size / 2;
      g.rect(b.x - half, b.y - half, b.size, b.size).fill(b.color);
      g.rect(b.x - half - 1, b.y - half - 1, b.size + 2, b.size + 2).fill({ color: b.color, alpha: 0.25 });
    }

    const heartColor = invincibleRef.current ? 0xff9999 : 0xff2222;
    const ox = heart.x - HEART_W / 2;
    const oy = heart.y - HEART_H / 2;
    g.rect(ox - 1, oy - 1, HEART_W + 2, HEART_H + 2).fill({ color: 0xff0000, alpha: 0.18 });
    for (let row = 0; row < HEART_PIX.length; row++) {
      for (let col = 0; col < HEART_PIX[row].length; col++) {
        if (HEART_PIX[row][col]) {
          g.rect(ox + col * HP, oy + row * HP, HP, HP).fill(heartColor);
        }
      }
    }
  // All values accessed via stable refs — safe to omit from deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useTick(tick);

  return <pixiGraphics ref={gRef} />;
}

// ─── Public component ─────────────────────────────────────────────────────────
interface CombatBattleBoxProps {
  activeRef: React.MutableRefObject<boolean>;
  heartRef: React.MutableRefObject<{ x: number; y: number }>;
  bulletsRef: React.MutableRefObject<CombatBullet[]>;
  keysRef: React.MutableRefObject<Set<string>>;
  invincibleRef: React.MutableRefObject<boolean>;
  onHit: () => void;
}

export default function CombatBattleBox(props: CombatBattleBoxProps) {
  return (
    <div className="combat-battle-box pixelated" style={{ imageRendering: 'pixelated' }}>
      <Application width={BOX_W} height={BOX_H} background={0x000000} antialias={false} resolution={1}>
        <BattleScene {...props} />
      </Application>
    </div>
  );
}
