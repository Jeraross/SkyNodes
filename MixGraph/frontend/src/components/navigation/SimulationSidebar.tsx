import type { FlightSimulation } from '../../types';

const STATUS_LABEL: Record<string, string> = {
  ready: 'Pronto para voar',
  playing: 'Voando',
  paused: 'Pausado',
  finished: 'Pouso concluído',
};
const STATUS_DOT: Record<string, string> = {
  ready: 'bg-cyan-400',
  playing: 'bg-green-400 animate-pulse',
  paused: 'bg-yellow-400',
  finished: 'bg-purple-400',
};

const SPEED_OPTIONS = [0.5, 1, 2, 4] as const;

interface Props {
  simulation: FlightSimulation;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onRestart: () => void;
  onClear: () => void;
  onSetSpeed: (s: number) => void;
}

export default function SimulationSidebar({
  simulation, onStart, onPause, onResume, onRestart, onClear, onSetSpeed,
}: Props) {
  if (simulation.status === 'idle') return null;

  const { status, airportPath, currentSegmentIndex, progress, speedMultiplier, totalCost, routeIds } = simulation;
  const totalSegments = Math.max(airportPath.length - 1, 1);
  const overallPct = Math.round(
    ((currentSegmentIndex + Math.min(progress, 1)) / totalSegments) * 100
  );
  const fromId = airportPath[currentSegmentIndex] ?? '—';
  const toId = airportPath[Math.min(currentSegmentIndex + 1, airportPath.length - 1)] ?? '—';

  return (
    <div
      className="fixed z-50 flex flex-col gap-3"
      style={{ left: '90px', top: '50%', transform: 'translateY(-50%)', width: '240px' }}
    >
      {/* Painel principal */}
      <div className="rounded-xl border border-cyan-400/25 bg-slate-950/80 backdrop-blur-xl shadow-lg shadow-black/40 p-3.5 space-y-3">
        {/* Header */}
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full shrink-0 ${STATUS_DOT[status] ?? 'bg-slate-400'}`} />
          <span className="text-xs font-semibold text-cyan-100 truncate">
            {STATUS_LABEL[status] ?? status}
          </span>
        </div>

        {/* Rota completa */}
        <div className="text-[10px] text-slate-500 font-mono leading-relaxed break-all">
          {airportPath.join(' → ')}
        </div>

        {/* Trecho atual */}
        <div className="rounded-lg bg-slate-900/60 border border-slate-700/50 px-3 py-2">
          <p className="text-[10px] text-slate-500 mb-0.5">Trecho atual</p>
          <p className="font-mono text-sm text-cyan-300 font-semibold">{fromId} → {toId}</p>
        </div>

        {/* Barra de progresso */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>Progresso</span>
            <span className="text-cyan-300 font-mono">{overallPct}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-cyan-300 transition-all duration-150"
              style={{ width: `${overallPct}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-600">
            <span>{currentSegmentIndex}/{totalSegments} segmentos</span>
            {totalCost !== undefined && (
              <span className="text-yellow-500/80">{totalCost.toFixed(0)} km</span>
            )}
          </div>
        </div>

        {/* Controles */}
        <div className="flex flex-wrap gap-1.5">
          {(status === 'ready' || status === 'finished') && (
            <button
              onClick={onStart}
              className="flex-1 py-1.5 rounded-lg text-xs font-medium border bg-green-700/25 border-green-500/40 text-green-300 hover:bg-green-700/40 transition-colors"
            >
              ▶ Voar
            </button>
          )}
          {status === 'playing' && (
            <button
              onClick={onPause}
              className="flex-1 py-1.5 rounded-lg text-xs font-medium border bg-yellow-700/25 border-yellow-500/40 text-yellow-300 hover:bg-yellow-700/40 transition-colors"
            >
              ⏸ Pausar
            </button>
          )}
          {status === 'paused' && (
            <button
              onClick={onResume}
              className="flex-1 py-1.5 rounded-lg text-xs font-medium border bg-cyan-700/25 border-cyan-500/40 text-cyan-300 hover:bg-cyan-700/40 transition-colors"
            >
              ▶ Continuar
            </button>
          )}
          {(status === 'paused' || status === 'finished') && (
            <button
              onClick={onRestart}
              className="py-1.5 px-2.5 rounded-lg text-xs font-medium border bg-slate-700/40 border-slate-600/50 text-slate-300 hover:bg-slate-700/60 transition-colors"
            >
              ↺
            </button>
          )}
          <button
            onClick={onClear}
            className="py-1.5 px-2.5 rounded-lg text-xs font-medium border bg-red-900/25 border-red-700/40 text-red-400 hover:bg-red-900/40 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Velocidade */}
        <div className="space-y-1.5">
          <p className="text-[10px] text-slate-500">Velocidade</p>
          <div className="grid grid-cols-4 gap-1">
            {SPEED_OPTIONS.map(s => (
              <button
                key={s}
                onClick={() => onSetSpeed(s)}
                className={`py-1 rounded text-[10px] font-mono border transition-colors ${
                  speedMultiplier === s
                    ? 'bg-cyan-600/35 border-cyan-400/55 text-cyan-200'
                    : 'bg-slate-800/50 border-slate-700/40 text-slate-400 hover:border-cyan-500/35'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Pill de rotas */}
      <div className="rounded-lg border border-slate-700/40 bg-slate-950/70 backdrop-blur-xl px-3 py-2 text-[10px] text-slate-500 text-center">
        {routeIds.length} rota(s) · {airportPath.length} aeroportos
      </div>
    </div>
  );
}
