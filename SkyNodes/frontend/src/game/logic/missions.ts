import type { AirportId, GameMission, GameProgress, RouteId } from '../types';

export const RECIFE_TUTORIAL_TASK_IDS = [
  'rec-restore-network',
  'rec-calibrate-systems',
  'rec-route-weights',
  'rec-frequency-scan',
];

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

export function completeAirportTask(
  missions: GameMission[],
  progress: GameProgress,
  taskId: string,
): GameProgress {
  const completedTaskIds = [...new Set([...progress.completedTaskIds, taskId])];
  const recifeTutorialDone = RECIFE_TUTORIAL_TASK_IDS.every(requiredTaskId => completedTaskIds.includes(requiredTaskId));

  if (progress.activeMissionId !== 'tutorial-rec' || !recifeTutorialDone) {
    return { ...progress, completedTaskIds };
  }

  const completedMissionIds = [...new Set([...progress.completedMissionIds, 'tutorial-rec'])];
  const nextMission = missions.find(mission => !completedMissionIds.includes(mission.id));

  return {
    ...progress,
    completedTaskIds,
    completedMissionIds,
    activeMissionId: nextMission?.id ?? progress.activeMissionId,
  };
}
