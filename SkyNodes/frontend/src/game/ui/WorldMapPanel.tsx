import brazilMap from '@svg-maps/brazil';
import type { GameAirport, GameMission, GameRoute, PlayerPosition } from '../types';
import MapLegend from './MapLegend';

const C = {
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

const MAP_POSITIONS: Record<string, { x: number; y: number }> = {
  MAO: { x: 139, y: 141 },
  BSB: { x: 409, y: 330 },
  REC: { x: 561, y: 213 },
  MCZ: { x: 583, y: 233 },
  SSA: { x: 500, y: 293 },
  GRU: { x: 396, y: 442 },
  NAT: { x: 565, y: 186 },
  CNF: { x: 438, y: 397 },
};

interface WorldMapPanelProps {
  airports: GameAirport[];
  routes: GameRoute[];
  activeMission: GameMission | null;
  nearbyAirport: GameAirport | null;
  playerPosition: PlayerPosition;
  setPlayerPosition: (position: PlayerPosition) => void;
  setTargetPosition: (position: PlayerPosition | null) => void;
}

export default function WorldMapPanel({
  airports,
  routes,
  activeMission,
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
          const fromAirport = airports.find(airport => airport.id === route.from);
          const toAirport = airports.find(airport => airport.id === route.to);
          if (!fromAirport || !toAirport) return null;
          const from = getMapPosition(fromAirport);
          const to = getMapPosition(toAirport);
          const isBlocked = route.state === 'blocked';
          const isSelected = route.state === 'restored' || activeMission?.requiredRouteId === route.id;
          const mx = (from.x + to.x) / 2;
          const my = (from.y + to.y) / 2;

          if (isBlocked) {
            return (
              <g key={route.id}>
                <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={C.redDark} strokeWidth="2" strokeDasharray="6 6" />
                <text x={mx} y={my + 6} fill={C.red} fontSize="18" textAnchor="middle">
                  x
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
          const active = airport.id === activeMission?.objectiveAirportId || airport.id === nearbyAirport?.id;
          return (
            <g key={airport.id} className="cursor-pointer" onClick={() => {
              setPlayerPosition({ x: airport.x, y: airport.y });
              setTargetPosition(null);
            }}>
              <rect
                x={pos.x - 6}
                y={pos.y - 6}
                width="12"
                height="12"
                fill={active ? C.yellow : C.red}
                stroke={C.white}
                strokeWidth="1"
              />
              <text x={pos.x} y={pos.y - 11} fill={C.white} fontSize="14" fontFamily="monospace" textAnchor="middle">
                {airport.code}
              </text>
            </g>
          );
        })}

        <text
          x={(MAP_POSITIONS.REC.x + MAP_POSITIONS.SSA.x) / 2}
          y={(MAP_POSITIONS.REC.y + MAP_POSITIONS.SSA.y) / 2}
          fill={C.magenta}
          fontSize="22"
          textAnchor="middle"
          className="at-anomaly"
        >
          ◆
        </text>

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

function getMapPosition(airport: GameAirport): { x: number; y: number } {
  return MAP_POSITIONS[airport.code] ?? MAP_POSITIONS[airport.id] ?? { x: airport.x / 2.65, y: airport.y / 1.55 };
}

function getOptionalMapPosition(airport: GameAirport | undefined): { x: number; y: number } | null {
  return airport ? getMapPosition(airport) : null;
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
