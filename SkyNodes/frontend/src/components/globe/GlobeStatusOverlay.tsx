import type { GlobeMode } from '../../types';

const modeLabels: Record<GlobeMode, string> = {
  orbit: 'ÓRBITA',
  'brazil-locked': 'BRASIL — MALHA AÉREA',
  analysis: 'MODO ANÁLISE',
};

const modeColors: Record<GlobeMode, string> = {
  orbit: 'border-slate-500/40 text-slate-400',
  'brazil-locked': 'border-cyan-500/40 text-cyan-400',
  analysis: 'border-yellow-500/40 text-yellow-400',
};

export default function GlobeStatusOverlay({ mode }: { mode: GlobeMode }) {
  return (
    <div className="pointer-events-none absolute bottom-6 right-6 z-20">
      <div
        className={`rounded-md border px-3 py-1.5 text-xs font-mono backdrop-blur-sm ${modeColors[mode]}`}
        style={{ background: 'rgba(2,6,23,0.6)' }}
      >
        {modeLabels[mode]}
      </div>
    </div>
  );
}
