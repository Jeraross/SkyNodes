import type { FlightSimulation } from '../../types';

const STATUS_LABEL: Record<string, string> = {
  idle: 'Inativo', ready: 'Pronto', playing: 'Voando', paused: 'Pausado', finished: 'Finalizado',
};
const STATUS_COLOR: Record<string, string> = {
  idle: 'text-slate-400', ready: 'text-cyan-400', playing: 'text-green-400',
  paused: 'text-yellow-400', finished: 'text-purple-400',
};

interface Props {
  simulation: FlightSimulation;
  algorithm: string;
}

export default function SimulationStatusPanel({ simulation, algorithm }: Props) {
  if (simulation.status === 'idle') return null;

  const { status, airportPath, currentSegmentIndex, progress, speedMultiplier, totalCost } = simulation;
  const totalSegments = Math.max(airportPath.length - 1, 1);
  const overallPct = Math.round(
    ((currentSegmentIndex + Math.min(progress, 1)) / totalSegments) * 100
  );

  const fromId = airportPath[currentSegmentIndex] ?? '—';
  const toId = airportPath[Math.min(currentSegmentIndex + 1, airportPath.length - 1)] ?? '—';

  return (
    <div className="rounded-lg border border-cyan-400/20 bg-slate-950/70 p-3 space-y-2 text-xs">
      <div className="flex items-center justify-between">
        <span className="text-slate-400 font-medium">Status da simulação</span>
        <span className={`font-semibold ${STATUS_COLOR[status] ?? 'text-slate-300'}`}>
          {STATUS_LABEL[status] ?? status}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-slate-500">Trecho:</span>
        <span className="font-mono text-cyan-300">{fromId} → {toId}</span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-slate-500 shrink-0">Progresso:</span>
        <div className="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-cyan-400 transition-all duration-100"
            style={{ width: `${overallPct}%` }}
          />
        </div>
        <span className="text-cyan-300 font-mono shrink-0">{overallPct}%</span>
      </div>

      <div className="flex flex-wrap gap-3 text-slate-500">
        <span>Algo: <span className="text-slate-300">{algorithm}</span></span>
        {totalCost !== undefined && (
          <span>Custo: <span className="text-yellow-400 font-mono">{totalCost.toFixed(0)}</span></span>
        )}
        <span>Vel: <span className="text-slate-300">{speedMultiplier}x</span></span>
      </div>
    </div>
  );
}
