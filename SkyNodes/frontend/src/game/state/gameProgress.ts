import type { GameProgress } from '../types';

export const INITIAL_PROGRESS: GameProgress = {
  currentAirportId: 'REC',
  restoredRouteIds: [],
  completedMissionIds: [],
  completedTaskIds: [],
  activeMissionId: 'tutorial-rec',
  credits: 1200,
  fuel: 80,
  anomalyDefeatedRouteIds: [],
  anomalyBonusTrips: 0,
};

export function loadGameProgress(): GameProgress {
  return INITIAL_PROGRESS;
}

export function saveGameProgress(_progress: GameProgress): void {
  // Progress is intentionally session-only while the game is under active design.
}

export function resetGameProgress(): GameProgress {
  return INITIAL_PROGRESS;
}
