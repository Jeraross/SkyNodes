import type { Region } from './airports';
import type { RouteType } from './routes';

export const REGION_COLOR: Record<Region, string> = {
  Norte:          '#10b981',
  Nordeste:       '#f59e0b',
  'Centro-Oeste': '#a78bfa',
  Sudeste:        '#3b82f6',
  Sul:            '#f87171',
};

export const ROUTE_COLOR: Record<RouteType, string> = {
  regional:       '#22d3ee',
  hub:            '#f59e0b',
  inter_regional: '#a78bfa',
};
