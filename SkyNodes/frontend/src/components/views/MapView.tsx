import { useState } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  Line,
  ZoomableGroup,
} from 'react-simple-maps';
import { airports, airportMap } from '../../data/airports';
import { routes } from '../../data/routes';
import type { Region } from '../../data/airports';
import type { RouteType } from '../../data/routes';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json';

// Brazil (076) + immediate neighbors for geographic context
const SOUTH_AMERICA_IDS = new Set([
  '076', // Brazil
  '032', // Argentina
  '068', // Bolivia
  '152', // Chile
  '170', // Colombia
  '218', // Ecuador
  '600', // Paraguay
  '604', // Peru
  '858', // Uruguay
  '862', // Venezuela
  '328', // Guyana
  '740', // Suriname
  '254', // French Guiana
]);

const REGION_COLOR: Record<Region, string> = {
  Norte:         '#10b981',
  Nordeste:      '#f59e0b',
  'Centro-Oeste':'#a78bfa',
  Sudeste:       '#3b82f6',
  Sul:           '#f87171',
};

const ROUTE_STROKE: Record<RouteType, string> = {
  regional:       'rgba(103,232,249,0.45)',
  hub:            'rgba(245,158,11,0.55)',
  inter_regional: 'rgba(167,139,250,0.55)',
};

interface Tooltip {
  id: string;
  name: string;
  city: string;
  region: Region;
  x: number;
  y: number;
}

interface Props {
  highlightedRouteIds: string[];
}

export default function MapView({ highlightedRouteIds }: Props) {
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);

  return (
    <div className="absolute inset-0 z-10 overflow-hidden bg-[#020617]">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 780, center: [-52, -14] }}
        width={900}
        height={700}
        style={{ width: '100%', height: '100%' }}
      >
        <ZoomableGroup zoom={1} minZoom={0.5} maxZoom={8}>
          {/* Geographic base */}
          <Geographies geography={GEO_URL}>
            {({ geographies }: { geographies: Array<any> }) =>
              geographies
                .filter((geo: any) => SOUTH_AMERICA_IDS.has(geo.id))
                .map((geo: any) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={geo.id === '076' ? '#0f172a' : '#080f1e'}
                    stroke="#1e293b"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: 'none' },
                      hover:   { outline: 'none', fill: geo.id === '076' ? '#0f172a' : '#080f1e' },
                      pressed: { outline: 'none' },
                    }}
                  />
                ))
            }
          </Geographies>

          {/* Route lines — regular */}
          {routes
            .filter(r => !highlightedRouteIds.includes(r.id))
            .map(r => {
              const src = airportMap.get(r.from);
              const dst = airportMap.get(r.to);
              if (!src || !dst) return null;
              return (
                <Line
                  key={r.id}
                  from={[src.lng, src.lat]}
                  to={[dst.lng, dst.lat]}
                  stroke={ROUTE_STROKE[r.type]}
                  strokeWidth={0.6}
                  strokeLinecap="round"
                />
              );
            })}

          {/* Route lines — highlighted (drawn on top) */}
          {routes
            .filter(r => highlightedRouteIds.includes(r.id))
            .map(r => {
              const src = airportMap.get(r.from);
              const dst = airportMap.get(r.to);
              if (!src || !dst) return null;
              return (
                <Line
                  key={r.id}
                  from={[src.lng, src.lat]}
                  to={[dst.lng, dst.lat]}
                  stroke="#fbbf24"
                  strokeWidth={2}
                  strokeLinecap="round"
                />
              );
            })}

          {/* Airport markers */}
          {airports.map(a => (
            <Marker
              key={a.id}
              coordinates={[a.lng, a.lat]}
              onMouseEnter={(e: React.MouseEvent<SVGElement>) =>
                setTooltip({ id: a.id, name: a.name, city: a.city, region: a.region, x: e.clientX, y: e.clientY })
              }
              onMouseLeave={() => setTooltip(null)}
            >
              <circle
                r={highlightedRouteIds.some(id => {
                  const r = routes.find(r => r.id === id);
                  return r?.from === a.id || r?.to === a.id;
                }) ? 6 : 4}
                fill={REGION_COLOR[a.region]}
                stroke={highlightedRouteIds.some(id => {
                  const r = routes.find(r => r.id === id);
                  return r?.from === a.id || r?.to === a.id;
                }) ? '#fbbf24' : '#020617'}
                strokeWidth={1.5}
                style={{ cursor: 'pointer', transition: 'r 0.2s' }}
              />
              <text
                textAnchor="middle"
                y={-7}
                style={{ fontFamily: 'monospace', fontSize: '5px', fill: '#94a3b8', pointerEvents: 'none' }}
              >
                {a.id}
              </text>
            </Marker>
          ))}
        </ZoomableGroup>
      </ComposableMap>

      {/* Hover tooltip */}
      {tooltip && (
        <div
          className="pointer-events-none fixed z-30 rounded-lg border border-slate-700/60 bg-slate-900/95 px-3 py-2 text-xs shadow-xl backdrop-blur-sm"
          style={{ left: tooltip.x + 12, top: tooltip.y - 40 }}
        >
          <p className="font-mono font-bold text-white">{tooltip.id}</p>
          <p className="text-slate-300">{tooltip.city}</p>
          <p className="text-slate-500">{tooltip.name}</p>
          <p className="mt-1" style={{ color: REGION_COLOR[tooltip.region] }}>{tooltip.region}</p>
        </div>
      )}

      {/* Legend */}
      <div className="pointer-events-none absolute bottom-6 left-6 z-20 flex flex-col gap-2 rounded-xl border border-slate-700/50 bg-slate-950/80 p-4 backdrop-blur-sm">
        <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-slate-500">Regiões</p>
        {(Object.entries(REGION_COLOR) as [Region, string][]).map(([r, c]) => (
          <div key={r} className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ background: c }} />
            <span className="text-xs text-slate-400">{r}</span>
          </div>
        ))}
        <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-slate-500">
          Scroll para zoom · Arraste para mover
        </p>
      </div>
    </div>
  );
}
