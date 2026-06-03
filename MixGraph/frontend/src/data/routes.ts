import { airportMap } from './airports';

export type RouteType = 'regional' | 'hub' | 'inter_regional';

export interface Route {
  id: string;
  from: string;
  to: string;
  weight: number;
  type: RouteType;
}

export interface RouteArc {
  id: string;
  from: string;
  to: string;
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  weight: number;
  type: RouteType;
  label: string;
}

const rawRoutes: Omit<Route, 'id'>[] = [
  // Nordeste regional
  { from: 'REC', to: 'SSA', weight: 1.5, type: 'regional' },
  { from: 'REC', to: 'FOR', weight: 1.5, type: 'regional' },
  { from: 'REC', to: 'NAT', weight: 1.5, type: 'regional' },
  { from: 'REC', to: 'JPA', weight: 1.5, type: 'regional' },
  { from: 'REC', to: 'THE', weight: 1.5, type: 'regional' },
  { from: 'SSA', to: 'FOR', weight: 1.5, type: 'regional' },
  { from: 'SSA', to: 'NAT', weight: 1.5, type: 'regional' },
  { from: 'SSA', to: 'JPA', weight: 1.5, type: 'regional' },
  { from: 'SSA', to: 'THE', weight: 1.5, type: 'regional' },
  { from: 'FOR', to: 'NAT', weight: 1.5, type: 'regional' },
  { from: 'FOR', to: 'JPA', weight: 1.5, type: 'regional' },
  { from: 'FOR', to: 'THE', weight: 1.5, type: 'regional' },
  { from: 'NAT', to: 'JPA', weight: 1.5, type: 'regional' },
  { from: 'NAT', to: 'THE', weight: 1.5, type: 'regional' },
  { from: 'JPA', to: 'THE', weight: 1.5, type: 'regional' },
  // Sudeste regional
  { from: 'GRU', to: 'CGH', weight: 1.0, type: 'regional' },
  { from: 'GRU', to: 'GIG', weight: 1.0, type: 'regional' },
  { from: 'GRU', to: 'CNF', weight: 1.0, type: 'regional' },
  { from: 'GRU', to: 'VIX', weight: 1.0, type: 'regional' },
  { from: 'CGH', to: 'GIG', weight: 1.0, type: 'regional' },
  { from: 'CGH', to: 'CNF', weight: 1.5, type: 'regional' },
  { from: 'CGH', to: 'VIX', weight: 1.5, type: 'regional' },
  { from: 'GIG', to: 'CNF', weight: 1.0, type: 'regional' },
  { from: 'GIG', to: 'VIX', weight: 1.0, type: 'regional' },
  { from: 'CNF', to: 'VIX', weight: 1.5, type: 'regional' },
  // Centro-Oeste regional
  { from: 'BSB', to: 'GYN', weight: 1.0, type: 'regional' },
  // Sul regional
  { from: 'CWB', to: 'FLN', weight: 1.5, type: 'regional' },
  { from: 'CWB', to: 'POA', weight: 1.5, type: 'regional' },
  { from: 'FLN', to: 'POA', weight: 1.5, type: 'regional' },
  // Norte regional
  { from: 'MAO', to: 'BEL', weight: 1.5, type: 'regional' },
  { from: 'MAO', to: 'PVH', weight: 1.5, type: 'regional' },
  { from: 'MAO', to: 'RBR', weight: 1.5, type: 'regional' },
  { from: 'BEL', to: 'PVH', weight: 1.5, type: 'regional' },
  { from: 'BEL', to: 'RBR', weight: 1.5, type: 'regional' },
  { from: 'PVH', to: 'RBR', weight: 1.5, type: 'regional' },
  // Hub connections
  { from: 'MAO', to: 'GRU', weight: 3.0, type: 'hub' },
  { from: 'MAO', to: 'BSB', weight: 3.0, type: 'hub' },
  { from: 'REC', to: 'GRU', weight: 3.0, type: 'hub' },
  { from: 'SSA', to: 'GRU', weight: 3.0, type: 'hub' },
  { from: 'FOR', to: 'GRU', weight: 3.0, type: 'hub' },
  { from: 'NAT', to: 'BSB', weight: 3.0, type: 'hub' },
  { from: 'JPA', to: 'BSB', weight: 3.0, type: 'hub' },
  { from: 'THE', to: 'BSB', weight: 3.0, type: 'hub' },
  { from: 'POA', to: 'GRU', weight: 3.0, type: 'hub' },
  { from: 'CWB', to: 'GRU', weight: 3.0, type: 'hub' },
  { from: 'FLN', to: 'GRU', weight: 3.0, type: 'hub' },
  // Inter-regional
  { from: 'BSB', to: 'BEL', weight: 3.5, type: 'inter_regional' },
  { from: 'BSB', to: 'REC', weight: 3.5, type: 'inter_regional' },
  { from: 'BSB', to: 'POA', weight: 3.5, type: 'inter_regional' },
  { from: 'GIG', to: 'SSA', weight: 3.5, type: 'inter_regional' },
];

export const routes: Route[] = rawRoutes.map((r, i) => ({
  ...r,
  id: `route-${i}`,
}));

export const routeArcs: RouteArc[] = routes
  .map(r => {
    const src = airportMap.get(r.from);
    const dst = airportMap.get(r.to);
    if (!src || !dst) {
      console.warn(`[routes] Unknown airport in route ${r.id}: ${r.from} → ${r.to}`);
      return null;
    }
    return {
      id: r.id,
      from: r.from,
      to: r.to,
      startLat: src.lat,
      startLng: src.lng,
      endLat: dst.lat,
      endLng: dst.lng,
      weight: r.weight,
      type: r.type,
      label: `${r.from} → ${r.to}`,
    } satisfies RouteArc;
  })
  .filter((r): r is RouteArc => r !== null);
