import '../render/pixiSetup';
import { Application, useTick } from '@pixi/react';
import { useCallback, useState } from 'react';
import type { Graphics } from 'pixi.js';
import type { MstPuzzle } from '../logic/mstPuzzle';
import { isMstSolved, totalWeight } from '../logic/mstPuzzle';

const W = 480;
const H = 360;
const NODE_R = 22;

function MstCanvas({
  puzzle,
  selected,
  hoveredEdge,
}: {
  puzzle: MstPuzzle;
  selected: string[];
  hoveredEdge: string | null;
}) {
  const [tick, setTick] = useState(0);
  useTick(() => setTick(t => t + 1));

  const draw = useCallback(
    (g: Graphics) => {
      g.clear();
      g.rect(0, 0, W, H).fill(0x020617);

      // Draw grid
      g.setStrokeStyle({ width: 1, color: 0x0a1628, alpha: 0.6 });
      for (let x = 0; x < W; x += 40) { g.moveTo(x, 0); g.lineTo(x, H); }
      for (let y = 0; y < H; y += 40) { g.moveTo(0, y); g.lineTo(W, y); }
      g.stroke();

      // Draw edges
      for (const edge of puzzle.edges) {
        const fn = puzzle.nodes.find(n => n.id === edge.from)!;
        const tn = puzzle.nodes.find(n => n.id === edge.to)!;
        const fx = fn.x * W;
        const fy = fn.y * H;
        const tx = tn.x * W;
        const ty = tn.y * H;
        const isSelected = selected.includes(edge.id);
        const isHovered = hoveredEdge === edge.id;

        if (isSelected) {
          g.setStrokeStyle({ width: 3, color: 0x00ff00 });
        } else if (isHovered) {
          g.setStrokeStyle({ width: 2, color: 0xffdd00, alpha: 0.9 });
        } else {
          // Animated dashed available edge
          const dashLen = 8;
          const gapLen = 6;
          const totalLen = Math.sqrt((tx - fx) ** 2 + (ty - fy) ** 2);
          const dx = (tx - fx) / totalLen;
          const dy = (ty - fy) / totalLen;
          const offset = (tick * 2) % (dashLen + gapLen);
          g.setStrokeStyle({ width: 1, color: 0x335533, alpha: 0.7 });
          let pos = -offset;
          while (pos < totalLen) {
            const start = Math.max(pos, 0);
            const end = Math.min(pos + dashLen, totalLen);
            if (end > 0) {
              g.moveTo(fx + dx * start, fy + dy * start);
              g.lineTo(fx + dx * end, fy + dy * end);
            }
            pos += dashLen + gapLen;
          }
          g.stroke();
          continue;
        }
        g.moveTo(fx, fy);
        g.lineTo(tx, ty);
        g.stroke();
      }

      // Draw nodes
      for (const node of puzzle.nodes) {
        const nx = node.x * W;
        const ny = node.y * H;
        const isConnectedNode = selected.some(eid => {
          const e = puzzle.edges.find(x => x.id === eid);
          return e?.from === node.id || e?.to === node.id;
        });
        const fillColor = isConnectedNode ? 0x00ff00 : 0x0a2a0a;
        const borderColor = isConnectedNode ? 0x00ff00 : 0x446644;
        g.circle(nx, ny, NODE_R).fill(fillColor).setStrokeStyle({ width: 2, color: borderColor }).stroke();
      }
    },
    [puzzle, selected, hoveredEdge, tick],
  );

  return <pixiGraphics draw={draw} />;
}

interface MstPuzzlePanelProps {
  puzzle: MstPuzzle;
  completed: boolean;
  onComplete: () => void;
}

export default function MstPuzzlePanel({ puzzle, completed, onComplete }: MstPuzzlePanelProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [hoveredEdge, setHoveredEdge] = useState<string | null>(null);
  const cost = totalWeight(puzzle, selected);
  const solved = isMstSolved(puzzle, selected);

  const hitAreas: Array<{ id: string; x1: number; y1: number; x2: number; y2: number }> =
    puzzle.edges.map(edge => {
      const fn = puzzle.nodes.find(n => n.id === edge.from)!;
      const tn = puzzle.nodes.find(n => n.id === edge.to)!;
      return { id: edge.id, x1: fn.x * W, y1: fn.y * H, x2: tn.x * W, y2: tn.y * H };
    });

  function distToSegment(px: number, py: number, x1: number, y1: number, x2: number, y2: number) {
    const dx = x2 - x1; const dy = y2 - y1;
    const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy)));
    return Math.sqrt((px - x1 - t * dx) ** 2 + (py - y1 - t * dy) ** 2);
  }

  function findEdgeAt(cx: number, cy: number): string | null {
    let best: string | null = null;
    let bestDist = 12;
    for (const area of hitAreas) {
      const d = distToSegment(cx, cy, area.x1, area.y1, area.x2, area.y2);
      if (d < bestDist) { bestDist = d; best = area.id; }
    }
    return best;
  }

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    setHoveredEdge(findEdgeAt(cx, cy));
  }

  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    const edgeId = findEdgeAt(cx, cy);
    if (!edgeId) return;
    setSelected(prev => {
      const next = prev.includes(edgeId) ? prev.filter(id => id !== edgeId) : [...prev, edgeId];
      if (isMstSolved(puzzle, next)) setTimeout(() => onComplete(), 600);
      return next;
    });
  }

  return (
    <div className="mt-3">
      <div className="mb-2 flex items-center justify-between font-term text-xl">
        <span className="text-[#00ffff]">{puzzle.instruction}</span>
        <span className={cost > puzzle.budget ? 'text-[#ff4444]' : 'text-[#ffd700]'}>
          CUSTO: {cost} / {puzzle.budget}
        </span>
      </div>
      <div
        className="relative cursor-pointer"
        style={{ width: W, height: H }}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredEdge(null)}
      >
        <Application width={W} height={H} options={{ background: 0x020617, antialias: true }}>
          <MstCanvas puzzle={puzzle} selected={selected} hoveredEdge={hoveredEdge} />
        </Application>
        {/* Weight labels */}
        {puzzle.edges.map(edge => {
          const fn = puzzle.nodes.find(n => n.id === edge.from)!;
          const tn = puzzle.nodes.find(n => n.id === edge.to)!;
          const mx = ((fn.x + tn.x) / 2) * W;
          const my = ((fn.y + tn.y) / 2) * H;
          const isSelected = selected.includes(edge.id);
          return (
            <div
              key={edge.id}
              className="pointer-events-none absolute font-term text-lg"
              style={{
                left: mx - 10,
                top: my - 10,
                color: isSelected ? '#00ff00' : '#888',
              }}
            >
              {edge.weight}
            </div>
          );
        })}
        {/* Node labels */}
        {puzzle.nodes.map(node => {
          const nx = node.x * W;
          const ny = node.y * H;
          return (
            <div
              key={node.id}
              className="pointer-events-none absolute font-term text-lg font-bold"
              style={{ left: nx - 16, top: ny - 10, color: '#fff', fontSize: 11 }}
            >
              {node.label}
            </div>
          );
        })}
      </div>
      {solved && (
        <div className="mt-2 text-center font-term text-xl text-[#00ff00]">
          ✓ REDE MÍNIMA ESTABELECIDA
        </div>
      )}
    </div>
  );
}
