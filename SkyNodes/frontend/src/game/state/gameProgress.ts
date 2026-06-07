import type { GameProgress } from '../types';

const STORAGE_KEY = 'aerotale_progress_v2';

export const INITIAL_PROGRESS: GameProgress = {
  currentAirportId: 'REC',
  restoredRouteIds: [],
  completedMissionIds: [],
  activeMissionId: 'visit-rec',
};

export function loadGameProgress(): GameProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_PROGRESS;
    return { ...INITIAL_PROGRESS, ...JSON.parse(raw) };
  } catch {
    return INITIAL_PROGRESS;
  }
}

export function saveGameProgress(progress: GameProgress): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function resetGameProgress(): GameProgress {
  localStorage.removeItem(STORAGE_KEY);
  return INITIAL_PROGRESS;
}
