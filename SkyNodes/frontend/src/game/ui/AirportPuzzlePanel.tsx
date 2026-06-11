import '../render/pixiSetup';
import { Application, useTick } from '@pixi/react';
import { useCallback, useState } from 'react';
import type { Graphics } from 'pixi.js';
import type { AirportPuzzle } from '../data/airportPuzzles';
import { checkWinCondition } from '../data/airportPuzzles';

interface AirportPuzzlePanelProps {
  puzzle: AirportPuzzle;
  onSolved: () => void;
  onBack: () => void;
}

const W = 480;
const H = 360;
const NODE_R = 24;

const NODE_BORDER: Record<string, number> = {
  active:    0xffd700,
  corrupted: 0xff4400,
  inactive:  0x446644,
};

const CONNECTED_COLOR = 0x00ff00;

function PuzzleCanvas({
  puzzle,
  createdEdges,
  selectedId,
  tick,
}: {
  puzzle: AirportPuzzle;
  createdEdges: string[];
  selectedId: string | null;
  tick: number;
}) {
  const draw = useCallback((g: Graphics) => {
    g.clear();
    g.rect(0, 0, W, H).fill(0x020617);

    // background grid
    for (let y = 0; y < H; y += 24) g.rect(0, y, W, 1).fill({ color: 0x003300, alpha: 0.4 });
    for (let x = 0; x < W; x += 24) g.rect(x, 0, 1, H).fill({ color: 0x003300, alpha: 0.2 });

    // created edges (green solid)
    for (const edgeId of createdEdges) {
      const edge = puzzle.availableEdges.find(e => e.id === edgeId);
      if (!edge) continue;
      const a = puzzle.nodes.find(n => n.id === edge.from);
      const b = puzzle.nodes.find(n => n.id === edge.to);
      if (!a || !b) continue;
      drawPixelLine(g, a.x * W, a.y * H, b.x * W, b.y * H, CONNECTED_COLOR);
    }

    // available edges (dashed dim, animated)
    for (const edge of puzzle.availableEdges) {
      if (createdEdges.includes(edge.id)) continue;
      const a = puzzle.nodes.find(n => n.id === edge.from);
      const b = puzzle.nodes.find(n => n.id === edge.to);
      if (!a || !b) continue;
      drawDashedLine(g, a.x * W, a.y * H, b.x * W, b.y * H, 0x224422, tick);
    }

    // nodes
    for (const node of puzzle.nodes) {
      const nx = Math.round(node.x * W);
      const ny = Math.round(node.y * H);
      const isConnected = createdEdges.some(
        eid => puzzle.availableEdges.find(e => e.id === eid && (e.from === node.id || e.to === node.id))
      );
      const isSelected = selectedId === node.id;
      const isHub = node.id === puzzle.hubNodeId;
      const r = isHub ? NODE_R + 4 : NODE_R;
      const border = isConnected ? CONNECTED_COLOR : NODE_BORDER[node.status] ?? 0x446644;

      // selection halo (pulsing)
      if (isSelected) {
        g.rect(nx - r - 4, ny - r - 4, (r + 4) * 2, (r + 4) * 2)
          .fill({ color: 0x00ffff, alpha: tick % 20 < 10 ? 0.3 : 0.1 });
      }

      // outer square (ring)
      g.rect(nx - r, ny - r, r * 2, r * 2).fill({ color: border });
      // inner square (black fill — ring effect)
      g.rect(nx - r + 4, ny - r + 4, (r - 4) * 2, (r - 4) * 2).fill({ color: 0x000000 });

      // label indicator bar below node
      const lblW = node.label.length * 5;
      g.rect(nx - lblW / 2, ny + r + 2, lblW, 4).fill({ color: border, alpha: 0.7 });
    }

    // border
    g.rect(0, 0, W, 2).fill(0x00aa00);
    g.rect(0, H - 2, W, 2).fill(0x00aa00);
    g.rect(0, 0, 2, H).fill(0x00aa00);
    g.rect(W - 2, 0, 2, H).fill(0x00aa00);
  }, [createdEdges, puzzle, selectedId, tick]);

  return <pixiGraphics draw={draw} />;
}

function TickContainer({
  puzzle, createdEdges, selectedId,
}: {
  puzzle: AirportPuzzle;
  createdEdges: string[];
  selectedId: string | null;
}) {
  const [tick, setTick] = useState(0);
  useTick(() => setTick(t => (t + 1) & 0xffff));
  return <PuzzleCanvas puzzle={puzzle} createdEdges={createdEdges} selectedId={selectedId} tick={tick} />;
}

export default function AirportPuzzlePanel({ puzzle, onSolved, onBack }: AirportPuzzlePanelProps) {
  const [createdEdges, setCreatedEdges] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleNodeClick = useCallback((nodeId: string) => {
    if (selectedId === null) {
      setSelectedId(nodeId);
      return;
    }
    if (selectedId === nodeId) {
      setSelectedId(null);
      return;
    }
    const edgeId = puzzle.availableEdges.find(
      e => (e.from === selectedId && e.to === nodeId) || (e.from === nodeId && e.to === selectedId)
    )?.id;
    if (edgeId && !createdEdges.includes(edgeId)) {
      const next = [...createdEdges, edgeId];
      setCreatedEdges(next);
      if (checkWinCondition(puzzle, next)) {
        setTimeout(onSolved, 600);
      }
    }
    setSelectedId(null);
  }, [createdEdges, onSolved, puzzle, selectedId]);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const py = ((e.clientY - rect.top) / rect.height) * H;
    for (const node of puzzle.nodes) {
      const nx = node.x * W;
      const ny = node.y * H;
      if (Math.hypot(px - nx, py - ny) <= NODE_R + 8) {
        handleNodeClick(node.id);
        return;
      }
    }
  }, [handleNodeClick, puzzle.nodes]);

  const nodeLabels = puzzle.nodes.reduce<Record<string, string>>((acc, n) => {
    acc[n.id] = n.label;
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 flex flex-col bg-black" style={{ zIndex: 0 }}>
      {/* header */}
      <div className="flex items-center justify-between border-b-2 border-[#00aa00] px-4 py-2" style={{ zIndex: 20 }}>
        <span className="font-pixel text-[8px] text-[#ffd700]">
          AEROPORTO RECIFE — SUBGRAFO LOCAL
        </span>
        <button
          type="button"
          onClick={onBack}
          className="border border-[#446644] px-3 py-1 font-pixel text-[7px] text-[#888] hover:text-[#00ff00]"
        >
          VOLTAR
        </button>
      </div>

      {/* instruction */}
      <div className="border-b border-[#002200] px-4 py-1" style={{ zIndex: 20 }}>
        <p className="font-pixel text-[7px] text-[#446644]">
          {selectedId
            ? `SELECIONADO: ${nodeLabels[selectedId] ?? selectedId} — CLIQUE OUTRO NÓ PARA CONECTAR`
            : 'CLIQUE UM NÓ PARA SELECIONAR · CLIQUE OUTRO PARA CRIAR ARESTA'}
        </p>
      </div>

      {/* canvas area */}
      <div className="relative flex flex-1 items-center justify-center" style={{ zIndex: 0 }}>
        <div style={{ position: 'relative', width: W, height: H }}>
          <Application
            width={W}
            height={H}
            background={0x020617}
            antialias={false}
            resolution={1}
          >
            <TickContainer puzzle={puzzle} createdEdges={createdEdges} selectedId={selectedId} />
          </Application>
          {/* hit detection overlay */}
          <div
            style={{ position: 'absolute', inset: 0, cursor: 'crosshair' }}
            onPointerDown={handlePointerDown}
            aria-label="Puzzle — clique nos nós para conectar"
          />
          {/* node label overlay */}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            {puzzle.nodes.map(node => {
              const isConnected = createdEdges.some(
                eid => puzzle.availableEdges.find(e => e.id === eid && (e.from === node.id || e.to === node.id)),
              );
              const color = isConnected
                ? '#00ff00'
                : node.status === 'active' ? '#ffd700'
                : node.status === 'corrupted' ? '#ff4400'
                : '#446644';
              return (
                <span
                  key={node.id}
                  className="font-pixel text-[6px] leading-none"
                  style={{
                    position: 'absolute',
                    left: node.x * W,
                    top: node.y * H,
                    transform: 'translate(-50%, -50%)',
                    color,
                  }}
                >
                  {node.label}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* footer — node degrees */}
      <div className="flex flex-wrap gap-4 border-t border-[#002200] px-4 py-2" style={{ zIndex: 20 }}>
        {puzzle.nodes.map(node => {
          const degree = createdEdges.filter(eid =>
            puzzle.availableEdges.find(e => e.id === eid && (e.from === node.id || e.to === node.id))
          ).length;
          return (
            <div key={node.id} className="flex items-baseline gap-1">
              <span className="font-pixel text-[6px] text-[#446644]">{node.label}:</span>
              <span className="font-term text-sm text-[#00ff00]">{degree}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function drawPixelLine(g: Graphics, x1: number, y1: number, x2: number, y2: number, color: number) {
  const steps = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1)) / 8;
  for (let i = 0; i <= steps; i++) {
    const t = steps === 0 ? 0 : i / steps;
    g.rect(Math.round(x1 + (x2 - x1) * t) - 4, Math.round(y1 + (y2 - y1) * t) - 4, 8, 8).fill(color);
  }
}

function drawDashedLine(g: Graphics, x1: number, y1: number, x2: number, y2: number, color: number, tick: number) {
  const steps = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1)) / 12;
  const offset = tick % 4;
  for (let i = 0; i <= steps; i++) {
    if ((i + offset) % 3 === 0) continue;
    const t = steps === 0 ? 0 : i / steps;
    g.rect(Math.round(x1 + (x2 - x1) * t) - 3, Math.round(y1 + (y2 - y1) * t) - 3, 6, 6)
      .fill({ color, alpha: 0.5 });
  }
}
