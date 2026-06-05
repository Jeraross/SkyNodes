import { useState, useCallback } from 'react';
import type { QuizMode } from '../data/quizPathData';
import { getSuccessors, getPredecessors, getRootNodeId } from '../data/quizPathData';

export interface PathProgress {
  completedNodeIds: string[];
  lockedNodeIds: string[];
  skipsRemaining: number;
}

const SESSION_KEY = (mode: QuizMode) => `path_progress_${mode}`;

function loadProgress(mode: QuizMode): PathProgress {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY(mode));
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { completedNodeIds: [], lockedNodeIds: [], skipsRemaining: 2 };
}

function saveProgress(mode: QuizMode, progress: PathProgress) {
  sessionStorage.setItem(SESSION_KEY(mode), JSON.stringify(progress));
}

export function getNodeStatus(
  nodeId: string,
  mode: QuizMode,
  progress: PathProgress,
): 'locked' | 'available' | 'completed' | 'current' {
  const { completedNodeIds, lockedNodeIds } = progress;
  const root = getRootNodeId(mode);

  if (completedNodeIds.includes(nodeId)) return 'completed';
  if (lockedNodeIds.includes(nodeId))    return 'locked';

  const preds      = getPredecessors(mode, nodeId);
  const isRoot     = nodeId === root;
  const anyPredOk  = preds.some(p => completedNodeIds.includes(p));

  if (isRoot || anyPredOk) return 'available';
  return 'locked';
}

export function usePathProgress(mode: QuizMode) {
  const [progress, setProgress] = useState<PathProgress>(() => loadProgress(mode));

  const update = useCallback((next: PathProgress) => {
    setProgress(next);
    saveProgress(mode, next);
  }, [mode]);

  const completeNode = useCallback((nodeId: string) => {
    setProgress(prev => {
      const completed = [...prev.completedNodeIds, nodeId];
      const preds = getPredecessors(mode, nodeId);
      const siblings = preds
        .flatMap(p => getSuccessors(mode, p))
        .filter(id => id !== nodeId && !completed.includes(id));
      const locked = [...new Set([...prev.lockedNodeIds, ...siblings])];
      const next = { ...prev, completedNodeIds: completed, lockedNodeIds: locked };
      saveProgress(mode, next);
      return next;
    });
  }, [mode]);

  const useSkip = useCallback(() => {
    setProgress(prev => {
      const next = { ...prev, skipsRemaining: Math.max(0, prev.skipsRemaining - 1) };
      saveProgress(mode, next);
      return next;
    });
  }, [mode]);

  const reset = useCallback(() => {
    const fresh = { completedNodeIds: [], lockedNodeIds: [], skipsRemaining: 2 };
    sessionStorage.removeItem(SESSION_KEY(mode));
    sessionStorage.removeItem(`skips_${mode}`);
    setProgress(fresh);
  }, [mode]);

  return { progress, completeNode, useSkip, reset };
}
