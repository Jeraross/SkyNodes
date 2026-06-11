import { useState } from 'react';
import type { ChartCalibrationPuzzle } from '../data/chartPuzzles';

const DIAL_R = 40;
const START_ANGLE = -220; // degrees
const SWEEP = 260; // total sweep in degrees

function degToRad(d: number) { return (d * Math.PI) / 180; }
function valueToAngle(v: number) { return START_ANGLE + (v / 100) * SWEEP; }

function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
  const s = degToRad(startDeg);
  const e = degToRad(endDeg);
  const x1 = cx + r * Math.cos(s);
  const y1 = cy + r * Math.sin(s);
  const x2 = cx + r * Math.cos(e);
  const y2 = cy + r * Math.sin(e);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
}

const SZ = (DIAL_R + 20) * 2;
const CX = SZ / 2;
const CY = SZ / 2;

function angleFromSVG(e: React.PointerEvent<SVGSVGElement>): number {
  const rect = e.currentTarget.getBoundingClientRect();
  const dx = e.clientX - (rect.left + rect.width / 2);
  const dy = e.clientY - (rect.top + rect.height / 2);
  return (Math.atan2(dy, dx) * 180) / Math.PI;
}

function angleToValue(angleDeg: number): number | null {
  let rel = angleDeg - START_ANGLE;
  while (rel < 0) rel += 360;
  while (rel > 360) rel -= 360;
  if (rel > SWEEP) return null;
  return Math.max(0, Math.min(100, Math.round((rel / SWEEP) * 100)));
}

interface DialProps {
  bar: ChartCalibrationPuzzle['bars'][number];
  value: number;
  tolerance: number;
  completed: boolean;
  onChange: (v: number) => void;
}

function Dial({ bar, value, tolerance, completed, onChange }: DialProps) {
  const onTarget = Math.abs(value - bar.target) <= tolerance;
  const needleAngle = valueToAngle(value);
  const targetAngle = valueToAngle(bar.target);
  const needleRad = degToRad(needleAngle);
  const nx = CX + (DIAL_R - 6) * Math.cos(needleRad);
  const ny = CY + (DIAL_R - 6) * Math.sin(needleRad);

  return (
    <div className="flex flex-col items-center">
      <svg
        viewBox={`0 0 ${SZ} ${SZ}`}
        width={SZ}
        height={SZ}
        style={{ cursor: completed ? 'default' : 'grab' }}
        onPointerDown={e => {
          if (completed) return;
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={e => {
          if (completed || !(e.buttons & 1)) return;
          const v = angleToValue(angleFromSVG(e));
          if (v !== null) onChange(v);
        }}
      >
        {/* Track */}
        <path
          d={arcPath(CX, CY, DIAL_R, START_ANGLE, START_ANGLE + SWEEP)}
          fill="none" stroke="#002800" strokeWidth="8" strokeLinecap="round"
        />
        {/* Fill arc */}
        {value > 0 && (
          <path
            d={arcPath(CX, CY, DIAL_R, START_ANGLE, valueToAngle(value))}
            fill="none"
            stroke={onTarget ? '#00ff00' : '#006600'}
            strokeWidth="8" strokeLinecap="round"
          />
        )}
        {/* Target tick */}
        <line
          x1={CX + (DIAL_R - 14) * Math.cos(degToRad(targetAngle))}
          y1={CY + (DIAL_R - 14) * Math.sin(degToRad(targetAngle))}
          x2={CX + (DIAL_R + 6) * Math.cos(degToRad(targetAngle))}
          y2={CY + (DIAL_R + 6) * Math.sin(degToRad(targetAngle))}
          stroke="#ffd700" strokeWidth="2.5" strokeLinecap="round"
        />
        {/* Needle */}
        <line
          x1={CX} y1={CY} x2={nx} y2={ny}
          stroke={onTarget ? '#00ff00' : '#00cc44'}
          strokeWidth="2.5" strokeLinecap="round"
        />
        {/* Center dot */}
        <circle cx={CX} cy={CY} r={4} fill={onTarget ? '#00ff00' : '#004400'} />
        {/* Value */}
        <text x={CX} y={CY + 16} fill={onTarget ? '#00ff00' : '#888'}
          fontSize="11" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
          {value}
        </text>
      </svg>
      <span className="font-term text-lg" style={{ color: onTarget ? '#00ff00' : '#446644' }}>
        {bar.label}
      </span>
      <span className="font-term text-lg text-[#ffd700]">→{bar.target}</span>
    </div>
  );
}

interface DialPanelPuzzleProps {
  puzzle: ChartCalibrationPuzzle;
  completed: boolean;
  onComplete: () => void;
}

export default function DialPanelPuzzle({ puzzle, completed, onComplete }: DialPanelPuzzleProps) {
  const [values, setValues] = useState<Record<string, number>>(() =>
    Object.fromEntries(puzzle.bars.map(b => [b.id, b.initial])),
  );

  const allOnTarget = puzzle.bars.every(
    b => Math.abs((values[b.id] ?? b.initial) - b.target) <= puzzle.tolerance,
  );
  const solved = completed || allOnTarget;

  return (
    <div className="mt-4 border border-[#007000] bg-[#001800] p-3">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-pixel text-[8px] text-[#00ff00]">{puzzle.title}</p>
          <p className="mt-1 font-term text-lg leading-tight text-[#b0b0b0]">
            GIRE CADA DIAL ATÉ O ALVO DOURADO.
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

      <div className="flex flex-wrap justify-center gap-4 border border-[#003300] bg-black p-4">
        {puzzle.bars.map(b => (
          <Dial
            key={b.id}
            bar={b}
            value={values[b.id] ?? b.initial}
            tolerance={puzzle.tolerance}
            completed={completed}
            onChange={v => setValues(prev => ({ ...prev, [b.id]: v }))}
          />
        ))}
      </div>

      <p className={`mt-3 font-term text-xl leading-tight ${solved ? 'text-[#00ff00]' : 'text-[#ff0000]'}`}>
        {solved
          ? 'SISTEMAS CALIBRADOS. TORRE OPERACIONAL.'
          : 'GIRE OS DIALS ATÉ O ALVO DOURADO. TOLERÂNCIA: ±' + puzzle.tolerance + '.'}
      </p>
    </div>
  );
}
