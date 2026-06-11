import { useState, useRef } from 'react';
import type { ChartCalibrationPuzzle } from '../data/chartPuzzles';

const SIZE = 300;
const CX = SIZE / 2;
const CY = SIZE / 2;
const MAX_R = 110;
const HIT_R = 18;

function polarToXY(angle: number, r: number) {
  return {
    x: CX + r * Math.cos(angle),
    y: CY + r * Math.sin(angle),
  };
}

function valueToR(v: number) {
  return (v / 100) * MAX_R;
}

interface RadarChartPuzzleProps {
  puzzle: ChartCalibrationPuzzle;
  completed: boolean;
  onComplete: () => void;
}

export default function RadarChartPuzzle({ puzzle, completed, onComplete }: RadarChartPuzzleProps) {
  const n = puzzle.bars.length;
  const angles = puzzle.bars.map((_, i) => (i / n) * 2 * Math.PI - Math.PI / 2);

  const [values, setValues] = useState<Record<string, number>>(() =>
    Object.fromEntries(puzzle.bars.map(b => [b.id, b.initial])),
  );
  const svgRef = useRef<SVGSVGElement>(null);
  const draggingRef = useRef<string | null>(null);

  const allOnTarget = puzzle.bars.every(
    b => Math.abs((values[b.id] ?? b.initial) - b.target) <= puzzle.tolerance,
  );
  const solved = completed || allOnTarget;

  function getSVGPoint(e: React.PointerEvent): { x: number; y: number } {
    const svg = svgRef.current!;
    const rect = svg.getBoundingClientRect();
    const scaleX = SIZE / rect.width;
    const scaleY = SIZE / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  function handlePointerMove(e: React.PointerEvent<SVGSVGElement>) {
    const id = draggingRef.current;
    if (!id || completed) return;
    const idx = puzzle.bars.findIndex(b => b.id === id);
    const angle = angles[idx];
    const pt = getSVGPoint(e);
    const dx = pt.x - CX;
    const dy = pt.y - CY;
    // Project onto the axis direction
    const axisX = Math.cos(angle);
    const axisY = Math.sin(angle);
    const proj = dx * axisX + dy * axisY;
    const v = Math.max(0, Math.min(100, Math.round((proj / MAX_R) * 100)));
    setValues(prev => ({ ...prev, [id]: v }));
  }

  // Build polygon points
  const currentPoints = puzzle.bars.map((b, i) => {
    const r = valueToR(values[b.id] ?? b.initial);
    return polarToXY(angles[i], r);
  });
  const targetPoints = puzzle.bars.map((b, i) => polarToXY(angles[i], valueToR(b.target)));

  function toPolyPoints(pts: { x: number; y: number }[]) {
    return pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  }

  return (
    <div className="mt-4 border border-[#007000] bg-[#001800] p-3">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-pixel text-[8px] text-[#00ff00]">{puzzle.title}</p>
          <p className="mt-1 font-term text-lg leading-tight text-[#b0b0b0]">
            ARRASTE OS VÉRTICES ATÉ A LINHA ALVO (---).
          </p>
        </div>
        <button
          type="button"
          disabled={!solved || completed}
          onClick={onComplete}
          className="at-action-button at-action-button-primary disabled:opacity-40"
        >
          {completed ? 'SISTEMAS OK' : 'VALIDAR SISTEMAS'}
        </button>
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="w-full border border-[#003300] bg-black"
        style={{ height: 300 }}
        onPointerMove={handlePointerMove}
        onPointerUp={() => { draggingRef.current = null; }}
        onPointerLeave={() => { draggingRef.current = null; }}
      >
        {/* Concentric grid rings */}
        {[25, 50, 75, 100].map(pct => (
          <polygon
            key={pct}
            points={toPolyPoints(angles.map(a => polarToXY(a, valueToR(pct))))}
            fill="none"
            stroke="#002800"
            strokeWidth="1"
          />
        ))}

        {/* Axis lines */}
        {angles.map((angle, i) => {
          const tip = polarToXY(angle, MAX_R + 10);
          return (
            <g key={i}>
              <line x1={CX} y1={CY} x2={tip.x} y2={tip.y} stroke="#003800" strokeWidth="1" />
              {/* Label */}
              <text
                x={polarToXY(angle, MAX_R + 22).x}
                y={polarToXY(angle, MAX_R + 22).y}
                fill="#00aa00"
                fontSize="9"
                fontFamily="monospace"
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {puzzle.bars[i].label}
              </text>
            </g>
          );
        })}

        {/* Target polygon */}
        <polygon
          points={toPolyPoints(targetPoints)}
          fill="none"
          stroke="#ffd700"
          strokeWidth="1.5"
          strokeDasharray="5 3"
        />

        {/* Current polygon */}
        <polygon
          points={toPolyPoints(currentPoints)}
          fill="rgba(0,80,0,0.25)"
          stroke={allOnTarget ? '#00ff00' : '#00aa44'}
          strokeWidth="2"
        />

        {/* Draggable vertices */}
        {puzzle.bars.map((b, i) => {
          const pt = currentPoints[i];
          const diff = Math.abs((values[b.id] ?? b.initial) - b.target);
          const onTarget = diff <= puzzle.tolerance;
          return (
            <g key={b.id}>
              <circle
                cx={pt.x}
                cy={pt.y}
                r={HIT_R}
                fill="transparent"
                style={{ cursor: completed ? 'default' : 'grab' }}
                onPointerDown={e => {
                  if (completed) return;
                  e.currentTarget.setPointerCapture(e.pointerId);
                  draggingRef.current = b.id;
                }}
              />
              <circle
                cx={pt.x}
                cy={pt.y}
                r={7}
                fill={onTarget ? '#00ff00' : '#004400'}
                stroke={onTarget ? '#00ff00' : '#00aa44'}
                strokeWidth="2"
                style={{ pointerEvents: 'none' }}
              />
              {/* Value label */}
              <text
                x={pt.x}
                y={pt.y - 12}
                fill={onTarget ? '#00ff00' : '#888'}
                fontSize="9"
                fontFamily="monospace"
                textAnchor="middle"
                style={{ pointerEvents: 'none' }}
              >
                {values[b.id] ?? b.initial}
              </text>
            </g>
          );
        })}
      </svg>

      <p className={`mt-3 font-term text-xl leading-tight ${solved ? 'text-[#00ff00]' : 'text-[#ff0000]'}`}>
        {solved
          ? 'SISTEMAS CALIBRADOS. TORRE OPERACIONAL.'
          : 'AJUSTE CADA VÉRTICE ATÉ A LINHA ALVO. TOLERÂNCIA: ±' + puzzle.tolerance + '.'}
      </p>
    </div>
  );
}
