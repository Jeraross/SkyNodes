import type { AirportId, GameMission, GameProgress, RouteId } from '../types';

export function getActiveMission(
  missions: GameMission[],
  progress: GameProgress,
): GameMission | null {
  return missions.find(mission => mission.id === progress.activeMissionId) ?? null;
}

export function isRouteRestored(progress: GameProgress, routeId: RouteId): boolean {
  return progress.restoredRouteIds.includes(routeId);
}

export function completeMissionAtAirport(
  missions: GameMission[],
  progress: GameProgress,
  airportId: AirportId,
): GameProgress {
  const active = getActiveMission(missions, progress);
  if (!active || active.objectiveAirportId !== airportId) return progress;
  if (active.requiredRouteId && !isRouteRestored(progress, active.requiredRouteId)) return progress;

  const completedMissionIds = [...new Set([...progress.completedMissionIds, active.id])];
  const restoredRouteIds = [...new Set([...progress.restoredRouteIds, ...active.unlocksRouteIds])];
  const nextMission = missions.find(mission => !completedMissionIds.includes(mission.id));

  return {
    ...progress,
    currentAirportId: airportId,
    completedMissionIds,
    restoredRouteIds,
    activeMissionId: nextMission?.id ?? active.id,
  };
}
