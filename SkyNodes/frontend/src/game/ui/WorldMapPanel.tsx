import brazilMap from '@svg-maps/brazil';
import type { GameAirport, GameRoute, PlayerPosition } from '../types';
import MapLegend from './MapLegend';

const C = {
  black: '#000000',
  green: '#00a800',
  greenDim: '#006c00',
  blue: '#2a4cff',
  red: '#ff0000',
  redDark: '#a80000',
  yellow: '#ffd700',
  white: '#e8e8e8',
  desert: '#aaff55',
  cyan: '#00ffff',
  magenta: '#ff00ff',
};

const SERTAO_IDS = new Set(['pi', 'ce', 'rn', 'pb', 'pe']);

export const MAP_POSITIONS: Record<string, { x: number; y: number }> = {
  RBR: { x: 90, y: 240 },
  PVH: { x: 168, y: 228 },
  MAO: { x: 186, y: 142 },
  BEL: { x: 404, y: 112 },
  THE: { x: 500, y: 178 },
  FOR: { x: 532, y: 158 },
  NAT: { x: 600, y: 170 },
  JPA: { x: 600, y: 190 },
  REC: { x: 600, y: 210 },
  SSA: { x: 525, y: 304 },
  BSB: { x: 447, y: 332 },
  GYN: { x: 428, y: 352 },
  CNF: { x: 468, y: 397 },
  VIX: { x: 498, y: 413 },
  GIG: { x: 468, y: 432 },
  GRU: { x: 424, y: 430 },
  CGH: { x: 442, y: 438 },
  CWB: { x: 392, y: 482 },
  FLN: { x: 370, y: 520 },
  POA: { x: 344, y: 558 },
};

export const MAP_LABEL_OFFSETS: Record<string, { x: number; y: number; anchor?: 'start' | 'middle' | 'end' }> = {
  RBR: { x: -9, y: -10, anchor: 'end' },
  PVH: { x: 0, y: -10 },
  FOR: { x: 8, y: -9, anchor: 'start' },
  NAT: { x: 9, y: -3, anchor: 'start' },
  JPA: { x: 9, y: 5, anchor: 'start' },
  REC: { x: 9, y: 12, anchor: 'start' },
  SSA: { x: 0, y: -10 },
  BSB: { x: 0, y: -10 },
  GYN: { x: -8, y: -7, anchor: 'end' },
  CNF: { x: 0, y: -10 },
  VIX: { x: 9, y: -6, anchor: 'start' },
  GIG: { x: 10, y: 8, anchor: 'start' },
  GRU: { x: -9, y: -8, anchor: 'end' },
  CGH: { x: -9, y: 8, anchor: 'end' },
  CWB: { x: 0, y: -10 },
  FLN: { x: 0, y: -10 },
  POA: { x: 0, y: 16 },
};

interface WorldMapPanelProps {
  airports: GameAirport[];
  routes: GameRoute[];
  nearbyAirport: GameAirport | null;
  playerPosition: PlayerPosition;
  setPlayerPosition: (position: PlayerPosition) => void;
  setTargetPosition: (position: PlayerPosition | null) => void;
}

export default function WorldMapPanel({
  airports,
  routes,
  nearbyAirport,
  playerPosition,
  setPlayerPosition,
  setTargetPosition,
}: WorldMapPanelProps) {
  const symbols = terrainSymbols();
  const playerAirport = closestAirport(playerPosition, airports);
  const playerMapPosition = playerAirport ? getMapPosition(playerAirport) : getOptionalMapPosition(airports[0]);

  return (
    <div className="relative h-full w-full overflow-hidden border-2 border-[#006c00]" style={{ backgroundColor: C.blue }}>
      <svg
        viewBox={brazilMap.viewBox}
        className="pixelated h-full w-full"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Mapa retro do Brasil com a malha aerea"
      >
        <rect x="0" y="0" width="613" height="639" fill={C.blue} />

        {brazilMap.locations.map(loc => (
          <path
            key={loc.id}
            d={loc.path}
            fill={SERTAO_IDS.has(loc.id) ? C.desert : C.green}
            stroke={C.greenDim}
            strokeWidth="1.2"
          >
            <title>{loc.name}</title>
          </path>
        ))}

        {symbols.map((symbol, index) => (
          <text
            key={`${symbol.ch}-${index}`}
            x={symbol.x}
            y={symbol.y}
            fill={symbol.color}
            fontSize="16"
            fontFamily="monospace"
            textAnchor="middle"
          >
            {symbol.ch}
          </text>
        ))}

        {routes.map(route => {
          if (route.state === 'locked') return null;
          const fromAirport = airports.find(airport => airport.id === route.from);
          const toAirport = airports.find(airport => airport.id === route.to);
          if (!fromAirport || !toAirport) return null;
          const from = getMapPosition(fromAirport);
          const to = getMapPosition(toAirport);
          const isBlocked = route.state === 'blocked';
          const isSelected = route.state === 'restored';
          const mx = (from.x + to.x) / 2;
          const my = (from.y + to.y) / 2;

          if (isBlocked) {
            return (
              <g key={route.id}>
                <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={C.redDark} strokeWidth="2" strokeDasharray="6 6" />
                <text x={mx} y={my + 5} fill={C.red} fontSize="18" fontFamily="monospace" textAnchor="middle">
                  ~
                </text>
              </g>
            );
          }

          return (
            <line
              key={route.id}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke={isSelected ? C.cyan : C.yellow}
              strokeWidth={isSelected ? 3 : 2}
              className={isSelected ? 'at-route-pulse' : undefined}
            />
          );
        })}

        {airports.map(airport => {
          const pos = getMapPosition(airport);
          const label = getLabelPosition(airport, pos);
          const active = isHighlightedAirport(airport, nearbyAirport);
          const selectable = isAirportSelectable(airport, playerAirport, routes);
          return (
            <g
              key={airport.id}
              className={selectable ? 'cursor-pointer' : 'cursor-not-allowed opacity-65'}
              onClick={() => {
                if (!selectable) return;
                setPlayerPosition({ x: airport.x, y: airport.y });
                setTargetPosition(null);
              }}
            >
              <rect
                x={pos.x - 6}
                y={pos.y - 6}
                width="12"
                height="12"
                fill={active ? C.yellow : C.red}
                stroke={C.white}
                strokeWidth="1"
              />
              <text x={label.x} y={label.y} fill={C.black} fontSize="14" fontFamily="monospace" textAnchor={label.anchor}>
                {airport.code}
              </text>
            </g>
          );
        })}

        {playerMapPosition && (
          <text
            x={playerMapPosition.x + 16}
            y={playerMapPosition.y + 4}
            fill={C.yellow}
            fontSize="22"
            textAnchor="middle"
            className="at-blink"
          >
            ✈
          </text>
        )}
      </svg>

      <div className="absolute right-1 top-1">
        <MapLegend />
      </div>

      <div className="absolute left-1 top-1 border border-[#007000] bg-black/80 px-2 py-1">
        <span className="font-pixel text-[7px] leading-none text-[#00ff00]">BRASIL - MALHA AEREA</span>
      </div>
    </div>
  );
}

export function isHighlightedAirport(airport: GameAirport, nearbyAirport: GameAirport | null): boolean {
  return airport.id === nearbyAirport?.id;
}

export function isAirportSelectable(
  airport: GameAirport,
  currentAirport: GameAirport | null,
  routes: GameRoute[],
): boolean {
  if (airport.id === currentAirport?.id) return true;
  if (!currentAirport) return false;

  return routes.some(route => {
    const connectsCurrent =
      (route.from === currentAirport.id && route.to === airport.id) ||
      (route.to === currentAirport.id && route.from === airport.id);
    return connectsCurrent && (route.state === 'available' || route.state === 'restored');
  });
}

function getMapPosition(airport: GameAirport): { x: number; y: number } {
  return MAP_POSITIONS[airport.code] ?? MAP_POSITIONS[airport.id] ?? { x: airport.x / 2.65, y: airport.y / 1.55 };
}

function getOptionalMapPosition(airport: GameAirport | undefined): { x: number; y: number } | null {
  return airport ? getMapPosition(airport) : null;
}

function getLabelPosition(
  airport: GameAirport,
  position: { x: number; y: number },
): { x: number; y: number; anchor: 'start' | 'middle' | 'end' } {
  const offset = MAP_LABEL_OFFSETS[airport.code] ?? MAP_LABEL_OFFSETS[airport.id] ?? { x: 0, y: -11 };
  return {
    x: position.x + offset.x,
    y: position.y + offset.y,
    anchor: offset.anchor ?? 'middle',
  };
}

function closestAirport(position: PlayerPosition, airports: GameAirport[]): GameAirport | null {
  let closest: GameAirport | null = null;
  let best = Number.POSITIVE_INFINITY;
  for (const airport of airports) {
    const distance = Math.hypot(airport.x - position.x, airport.y - position.y);
    if (distance < best) {
      closest = airport;
      best = distance;
    }
  }
  return closest;
}

function terrainSymbols() {
  const items: { x: number; y: number; ch: string; color: string }[] = [];
  [
    [120, 120],
    [160, 100],
    [200, 130],
    [100, 170],
    [150, 175],
    [200, 200],
    [250, 150],
    [260, 210],
    [300, 120],
    [310, 180],
    [180, 240],
    [240, 250],
    [120, 210],
    [330, 230],
  ].forEach(([x, y]) => items.push({ x, y, ch: '↑', color: C.greenDim }));

  [
    [430, 380],
    [470, 400],
    [500, 380],
    [450, 420],
    [490, 440],
    [520, 350],
    [400, 400],
    [530, 410],
  ].forEach(([x, y]) => items.push({ x, y, ch: '▲', color: C.redDark }));

  [
    [470, 200],
    [500, 230],
    [450, 250],
    [520, 260],
    [360, 280],
    [330, 320],
  ].forEach(([x, y]) => items.push({ x, y, ch: '↓', color: C.yellow }));

  return items;
}
