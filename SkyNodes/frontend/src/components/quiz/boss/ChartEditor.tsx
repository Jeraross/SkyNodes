import { useState, useRef } from 'react';
import type { ChartBar } from '../../../data/bossQuestions';

const PIXEL = { fontFamily: "'Press Start 2P', monospace" };
const MONO  = { fontFamily: 'ui-monospace, SFMono-Regular, monospace' };
const BAR_W = 60;
const MAX_H = 200;

interface Props {
  bars:      ChartBar[];
  maxValue:  number;
  onChange:  (bars: ChartBar[]) => void;
}

export default function ChartEditor({ bars, maxValue, onChange }: Props) {
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const onPointerDown = (e: React.PointerEvent, idx: number) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragIdx(idx);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (dragIdx === null || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const slotW = rect.width / bars.length;
    const newIdx = Math.max(0, Math.min(bars.length - 1, Math.floor(x / slotW)));
    if (newIdx !== dragIdx) {
      const reordered = [...bars];
      const [moved] = reordered.splice(dragIdx, 1);
      reordered.splice(newIdx, 0, moved);
      setDragIdx(newIdx);
      onChange(reordered);
    }
  };

  const onPointerUp = () => setDragIdx(null);

  return (
    <div className="flex flex-col gap-4 h-full">
      <p style={{ ...PIXEL, fontSize: 7 }} className="text-slate-400">
        Arraste as barras para reorganizar
      </p>

      <div
        ref={containerRef}
        className="flex-1 flex items-end gap-3 px-4 pb-4 rounded-xl"
        style={{ background: '#060d1f', border: '1px solid rgba(6,182,212,0.15)', minHeight: 260, cursor: 'grab' }}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        {/* Y axis hint */}
        <div className="flex flex-col justify-between h-full pb-8 pr-2" style={{ minWidth: 30 }}>
          {[maxValue, Math.floor(maxValue * 0.5), 0].map(v => (
            <p key={v} style={{ ...MONO, fontSize: 10 }} className="text-slate-600">{v}</p>
          ))}
        </div>

        {bars.map((bar, idx) => {
          const h = Math.max(4, (bar.value / maxValue) * MAX_H);
          const isDragging = dragIdx === idx;
          return (
            <div
              key={bar.label}
              className="flex flex-col items-center gap-2 flex-1"
              style={{ cursor: 'grab' }}
              onPointerDown={e => onPointerDown(e, idx)}
            >
              <p style={{ ...MONO, fontSize: 11 }} className="text-cyan-400">{bar.value}</p>
              <div
                className="w-full rounded-t-lg transition-all"
                style={{
                  height: h,
                  background: isDragging
                    ? 'linear-gradient(0deg, #0e7490, #22d3ee)'
                    : 'linear-gradient(0deg, #0891b2, #22d3ee)',
                  border: `2px solid ${isDragging ? '#f59e0b' : 'rgba(34,211,238,0.4)'}`,
                  boxShadow: isDragging ? '0 0 16px rgba(245,158,11,0.5)' : '0 0 8px rgba(34,211,238,0.2)',
                  transform: isDragging ? 'scaleY(1.04)' : 'scaleY(1)',
                  transformOrigin: 'bottom',
                }}
              />
              <p style={{ ...PIXEL, fontSize: 7 }} className="text-slate-400 text-center">{bar.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
