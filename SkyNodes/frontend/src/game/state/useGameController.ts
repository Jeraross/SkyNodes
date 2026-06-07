import { useCallback, useEffect, useMemo, useState } from 'react';
import { GAME_AIRPORTS, GAME_MISSIONS, GAME_ROUTES } from '../data/aerotaleWorld';
import { completeMissionAtAirport, getActiveMission } from '../logic/missions';
import { findNearbyAirport } from '../logic/navigation';
import type { GameAirport, GameRoute, PlayerPosition } from '../types';
import { INITIAL_PROGRESS, loadGameProgress, resetGameProgress, saveGameProgress } from './gameProgress';

const LANDING_RADIUS = 0.9;

export function useGameController() {
  const startAirport = GAME_AIRPORTS.find(airport => airport.id === INITIAL_PROGRESS.currentAirportId) ?? GAME_AIRPORTS[0];
  const [progress, setProgress] = useState(loadGameProgress);
  const [playerPosition, setPlayerPosition] = useState<PlayerPosition>({ x: startAirport.x, y: startAirport.y });
  const [targetPosition, setTargetPosition] = useState<PlayerPosition | null>(null);

  useEffect(() => saveGameProgress(progress), [progress]);

  const nearbyAirport = useMemo(
    () => findNearbyAirport(playerPosition, GAME_AIRPORTS, LANDING_RADIUS),
    [playerPosition],
  );

  const currentAirport = useMemo(
    () => GAME_AIRPORTS.find(airport => airport.id === progress.currentAirportId) ?? null,
    [progress.currentAirportId],
  );

  const activeMission = useMemo(
    () => getActiveMission(GAME_MISSIONS, progress),
    [progress],
  );

  const routes = useMemo<GameRoute[]>(
    () => GAME_ROUTES.map(route => (
      progress.restoredRouteIds.includes(route.id)
        ? { ...route, state: 'restored' }
        : route
    )),
    [progress.restoredRouteIds],
  );

  const landAtAirport = useCallback((airport: GameAirport) => {
    setProgress(prev => completeMissionAtAirport(GAME_MISSIONS, prev, airport.id));
  }, []);

  const reset = useCallback(() => {
    const fresh = resetGameProgress();
    const airport = GAME_AIRPORTS.find(item => item.id === fresh.currentAirportId) ?? GAME_AIRPORTS[0];
    setProgress(fresh);
    setPlayerPosition({ x: airport.x, y: airport.y });
    setTargetPosition(null);
  }, []);

  return {
    airports: GAME_AIRPORTS,
    routes,
    missions: GAME_MISSIONS,
    progress,
    currentAirport,
    playerPosition,
    setPlayerPosition,
    targetPosition,
    setTargetPosition,
    nearbyAirport,
    activeMission,
    landAtAirport,
    reset,
  };
}
