import './pixiSetup';
import { Application } from '@pixi/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { WORLD_SIZE } from '../data/aerotaleWorld';
import type { GameAirport, GameMission, GameRoute, PlayerPosition } from '../types';
import AirportLayer from './AirportLayer';
import PlayerPlane from './PlayerPlane';
import RouteLayer from './RouteLayer';
import WorldLayer from './WorldLayer';

interface GameCanvasProps {
  airports: GameAirport[];
  routes: GameRoute[];
  activeMission: GameMission | null;
  nearbyAirportId: string | null;
  playerPosition: PlayerPosition;
  setPlayerPosition: (position: PlayerPosition) => void;
  targetPosition: PlayerPosition | null;
  setTargetPosition: (position: PlayerPosition | null) => void;
}

const MOVE_SPEED = 260;
const TARGET_EPSILON = 10;

export default function GameCanvas({
  airports,
  routes,
  activeMission,
  nearbyAirportId,
  playerPosition,
  setPlayerPosition,
  targetPosition,
  setTargetPosition,
}: GameCanvasProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const positionRef = useRef(playerPosition);
  const targetRef = useRef(targetPosition);
  const keysRef = useRef(new Set<string>());
  const [heading, setHeading] = useState(0);

  useEffect(() => {
    positionRef.current = playerPosition;
  }, [playerPosition]);

  useEffect(() => {
    targetRef.current = targetPosition;
  }, [targetPosition]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isMoveKey(event.key)) {
        event.preventDefault();
        keysRef.current.add(event.key.toLowerCase());
        targetRef.current = null;
        setTargetPosition(null);
      }
    };
    const onKeyUp = (event: KeyboardEvent) => {
      keysRef.current.delete(event.key.toLowerCase());
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [setTargetPosition]);

  useEffect(() => {
    let frame = 0;
    let previous = performance.now();

    const tick = (now: number) => {
      const dt = Math.min((now - previous) / 1000, 0.05);
      previous = now;
      const next = nextPosition(positionRef.current, keysRef.current, targetRef.current, dt);

      if (next.position.x !== positionRef.current.x || next.position.y !== positionRef.current.y) {
        positionRef.current = next.position;
        setPlayerPosition(next.position);
        setHeading(next.heading);
      }
      if (next.reachedTarget) {
        targetRef.current = null;
        setTargetPosition(null);
      }

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [setPlayerPosition, setTargetPosition]);

  const missionKey = useMemo(() => activeMission?.id ?? 'none', [activeMission]);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = overlayRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((event.clientX - rect.left) / rect.width) * WORLD_SIZE.width;
    const y = ((event.clientY - rect.top) / rect.height) * WORLD_SIZE.height;
    setTargetPosition(clampPosition({ x, y }));
  };

  return (
    <div className="aerotale-stage absolute inset-0">
      <Application
        width={WORLD_SIZE.width}
        height={WORLD_SIZE.height}
        background={0x143c9a}
        antialias={false}
        resolution={1}
      >
        <pixiContainer sortableChildren>
          <WorldLayer />
          <RouteLayer airports={airports} routes={routes} />
          <AirportLayer
            key={`${missionKey}-${nearbyAirportId ?? 'none'}`}
            airports={airports}
            activeMission={activeMission}
            nearbyAirportId={nearbyAirportId}
          />
          <PlayerPlane position={playerPosition} heading={heading} />
        </pixiContainer>
      </Application>
      <div
        ref={overlayRef}
        className="absolute inset-0 cursor-crosshair"
        onPointerDown={handlePointerDown}
        aria-label="Mapa jogavel AeroTale"
      />
    </div>
  );
}

function isMoveKey(key: string): boolean {
  return ['w', 'a', 's', 'd', 'arrowup', 'arrowleft', 'arrowdown', 'arrowright'].includes(key.toLowerCase());
}

function nextPosition(
  position: PlayerPosition,
  keys: Set<string>,
  target: PlayerPosition | null,
  dt: number,
): { position: PlayerPosition; heading: number; reachedTarget: boolean } {
  let dx = 0;
  let dy = 0;

  if (keys.has('w') || keys.has('arrowup')) dy -= 1;
  if (keys.has('s') || keys.has('arrowdown')) dy += 1;
  if (keys.has('a') || keys.has('arrowleft')) dx -= 1;
  if (keys.has('d') || keys.has('arrowright')) dx += 1;

  if (dx !== 0 || dy !== 0) {
    const length = Math.hypot(dx, dy);
    const nx = dx / length;
    const ny = dy / length;
    return {
      position: clampPosition({ x: position.x + nx * MOVE_SPEED * dt, y: position.y + ny * MOVE_SPEED * dt }),
      heading: Math.atan2(ny, nx),
      reachedTarget: false,
    };
  }

  if (!target) {
    return { position, heading: 0, reachedTarget: false };
  }

  const tx = target.x - position.x;
  const ty = target.y - position.y;
  const distance = Math.hypot(tx, ty);
  if (distance <= TARGET_EPSILON) {
    return { position: target, heading: Math.atan2(ty, tx), reachedTarget: true };
  }

  const step = Math.min(MOVE_SPEED * dt, distance);
  return {
    position: clampPosition({ x: position.x + (tx / distance) * step, y: position.y + (ty / distance) * step }),
    heading: Math.atan2(ty, tx),
    reachedTarget: false,
  };
}

function clampPosition(position: PlayerPosition): PlayerPosition {
  return {
    x: Math.max(0, Math.min(WORLD_SIZE.width, position.x)),
    y: Math.max(0, Math.min(WORLD_SIZE.height, position.y)),
  };
}
