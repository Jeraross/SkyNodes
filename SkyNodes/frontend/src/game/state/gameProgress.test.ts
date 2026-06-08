import { describe, expect, it, vi } from 'vitest';
import { INITIAL_PROGRESS, loadGameProgress, resetGameProgress, saveGameProgress } from './gameProgress';

describe('game progress', () => {
  it('does not persist AeroTale progress between page reloads', () => {
    const localStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };
    vi.stubGlobal('localStorage', localStorage);

    saveGameProgress({
      ...INITIAL_PROGRESS,
      currentAirportId: 'JPA',
      completedMissionIds: ['tutorial-rec'],
      completedTaskIds: ['rec-identify-nodes'],
      activeMissionId: 'visit-jpa',
    });

    expect(loadGameProgress()).toEqual(INITIAL_PROGRESS);
    expect(resetGameProgress()).toEqual(INITIAL_PROGRESS);
    expect(localStorage.getItem).not.toHaveBeenCalled();
    expect(localStorage.setItem).not.toHaveBeenCalled();
    expect(localStorage.removeItem).not.toHaveBeenCalled();
  });
});
