import { useCallback, useEffect, useRef, useState } from 'react';
import { airportMap } from '../data/airports';
import { routes } from '../data/routes';
import { interpolateGreatCircle, calculateHeading } from '../lib/geo/interpolateGreatCircle';
import type { FlightSimulation, PlanePosition } from '../types';

const IDLE: FlightSimulation = {
  status: 'idle',
  airportPath: [],
  routeIds: [],
  currentSegmentIndex: 0,
  progress: 0,
  speedMultiplier: 1,
};

const HIDDEN_PLANE: PlanePosition = {
  lat: 0, lng: 0, altitude: 0.1, heading: 0, visible: false,
};

export function useFlightSimulation() {
  const [simulation, setSimulation] = useState<FlightSimulation>(IDLE);
  const [planePosition, setPlanePosition] = useState<PlanePosition>(HIDDEN_PLANE);

  const simRef = useRef(simulation);
  simRef.current = simulation;
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const lastProgressSyncRef = useRef(0);
  const segIndexRef = useRef(0);
  const progressRef = useRef(0);

  const cancelLoop = () => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    lastTimeRef.current = null;
  };

  const setReady = useCallback((airportPath: string[], routeIds: string[], totalCost?: number) => {
    cancelLoop();
    segIndexRef.current = 0;
    progressRef.current = 0;
    lastProgressSyncRef.current = 0;
    const first = airportMap.get(airportPath[0]);
    setSimulation({ status: 'ready', airportPath, routeIds, currentSegmentIndex: 0, progress: 0, speedMultiplier: 1, totalCost });
    if (first) setPlanePosition({ lat: first.lat, lng: first.lng, altitude: 0.1, heading: 0, visible: true });
  }, []);

  const start = useCallback(() => {
    setSimulation(s => ({ ...s, status: 'playing' }));
  }, []);

  const pause = useCallback(() => {
    cancelLoop();
    setSimulation(s => ({ ...s, status: 'paused' }));
  }, []);

  const resume = useCallback(() => {
    setSimulation(s => ({ ...s, status: 'playing' }));
  }, []);

  const restart = useCallback(() => {
    cancelLoop();
    segIndexRef.current = 0;
    progressRef.current = 0;
    lastProgressSyncRef.current = 0;
    const sim = simRef.current;
    const first = airportMap.get(sim.airportPath[0]);
    setSimulation(s => ({ ...s, status: 'playing', currentSegmentIndex: 0, progress: 0 }));
    if (first) setPlanePosition({ lat: first.lat, lng: first.lng, altitude: 0.1, heading: 0, visible: true });
  }, []);

  const clear = useCallback(() => {
    cancelLoop();
    segIndexRef.current = 0;
    progressRef.current = 0;
    setSimulation(IDLE);
    setPlanePosition(HIDDEN_PLANE);
  }, []);

  const setSpeed = useCallback((speedMultiplier: number) => {
    setSimulation(s => ({ ...s, speedMultiplier }));
  }, []);

  useEffect(() => {
    if (simulation.status !== 'playing') {
      cancelLoop();
      return;
    }

    const tick = (time: number) => {
      const sim = simRef.current;
      if (sim.status !== 'playing') return;

      if (lastTimeRef.current === null) lastTimeRef.current = time;
      const dt = Math.min(time - lastTimeRef.current, 100);
      lastTimeRef.current = time;

      const { airportPath, routeIds, speedMultiplier } = sim;
      const totalSegments = airportPath.length - 1;

      if (segIndexRef.current >= totalSegments) {
        const last = airportMap.get(airportPath[airportPath.length - 1]);
        if (last) setPlanePosition(p => ({ ...p, lat: last.lat, lng: last.lng }));
        setSimulation(s => ({ ...s, status: 'finished', currentSegmentIndex: segIndexRef.current, progress: 1 }));
        return;
      }

      const routeId = routeIds[segIndexRef.current];
      const route = routes.find(r => r.id === routeId);
      const weight = route?.weight ?? 2;
      const duration = (1800 + weight * 0.45) / speedMultiplier;

      progressRef.current = Math.min(progressRef.current + dt / duration, 1);

      if (progressRef.current >= 1) {
        segIndexRef.current += 1;
        progressRef.current = 0;
        setSimulation(s => ({ ...s, currentSegmentIndex: segIndexRef.current, progress: 0 }));
      } else {
        const fromAirport = airportMap.get(airportPath[segIndexRef.current]);
        const toAirport = airportMap.get(airportPath[segIndexRef.current + 1]);
        if (fromAirport && toAirport) {
          const pos = interpolateGreatCircle(fromAirport, toAirport, progressRef.current);
          const heading = calculateHeading(fromAirport, toAirport);
          setPlanePosition({ lat: pos.lat, lng: pos.lng, altitude: 0.1, heading, visible: true });
          // Throttle React state sync to ~10fps to avoid heavy re-renders
          if (progressRef.current - lastProgressSyncRef.current >= 0.016 || progressRef.current === 0) {
            lastProgressSyncRef.current = progressRef.current;
            setSimulation(s => ({ ...s, progress: progressRef.current }));
          }
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelLoop();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simulation.status]);

  return { simulation, planePosition, setReady, start, pause, resume, restart, clear, setSpeed };
}
