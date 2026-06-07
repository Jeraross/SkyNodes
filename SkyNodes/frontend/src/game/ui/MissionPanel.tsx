import type { GameMission } from '../types';

interface MissionPanelProps {
  mission: GameMission | null;
  completedCount: number;
  totalCount: number;
}

export default function MissionPanel({ mission, completedCount, totalCount }: MissionPanelProps) {
  return (
    <section className="rounded border-2 border-[#1d3b12] bg-[#f1ff75] px-4 py-3 text-[#102410] shadow-[6px_6px_0_rgba(0,0,0,0.35)]">
      <p className="text-[10px] font-bold tracking-[0.18em]">MISSAO ATIVA</p>
      <h1 className="mt-2 text-xl font-black leading-tight">{mission?.title ?? 'Rede Reconstruida'}</h1>
      <p className="mt-2 max-w-sm text-sm font-semibold leading-snug">
        {mission?.description ?? 'Todas as missoes do MVP foram concluidas.'}
      </p>
      {mission && (
        <p className="mt-3 border-t-2 border-[#1d3b12]/40 pt-2 text-xs font-bold">
          Recompensa: {mission.rewardText}
        </p>
      )}
      <p className="mt-3 text-[11px] font-bold">
        Progresso: {completedCount}/{totalCount}
      </p>
    </section>
  );
}
