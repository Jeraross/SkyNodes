import { Suspense, useMemo } from 'react';
import { GraphCanvas, useSelection, darkTheme } from 'reagraph';
import { airports } from '../../data/airports';
import { routes } from '../../data/routes';
import type { Region } from '../../data/airports';
import type { RouteType } from '../../data/routes';

const REGION_COLOR: Record<Region, string> = {
  Norte:         '#10b981',
  Nordeste:      '#f59e0b',
  'Centro-Oeste':'#a78bfa',
  Sudeste:       '#3b82f6',
  Sul:           '#f87171',
};

const ROUTE_COLOR: Record<RouteType, string> = {
  regional:       '#22d3ee',
  hub:            '#f59e0b',
  inter_regional: '#a78bfa',
};

const theme = {
  ...darkTheme,
  canvas: { background: '#020617', fog: '#020617' },
  node: {
    ...darkTheme.node,
    label: { ...darkTheme.node.label, color: '#94a3b8', stroke: '#020617', activeColor: '#67e8f9' },
    ring:  { fill: '#67e8f9', activeFill: '#67e8f9' },
  },
  edge: {
    ...darkTheme.edge,
    opacity: 0.6,
    inactiveOpacity: 0.08,
    label: { ...darkTheme.edge.label, color: '#475569', activeColor: '#67e8f9' },
  },
};

interface Props {
  highlightedRouteIds: string[];
}

export default function GraphView({ highlightedRouteIds }: Props) {
  const nodes = useMemo(
    () =>
      airports.map(a => ({
        id: a.id,
        label: a.id,
        subLabel: a.city,
        fill: REGION_COLOR[a.region],
        size: ['GRU', 'BSB', 'GIG', 'CGH'].includes(a.id) ? 12 : 8,
      })),
    [],
  );

  const edges = useMemo(
    () =>
      routes.map(r => ({
        id: r.id,
        source: r.from,
        target: r.to,
        fill: highlightedRouteIds.includes(r.id) ? '#fbbf24' : ROUTE_COLOR[r.type],
        size: highlightedRouteIds.includes(r.id) ? 3 : 1,
      })),
    [highlightedRouteIds],
  );

  const { selections, actives, onNodeClick, onCanvasClick } = useSelection({
    nodes,
    edges,
    type: 'single',
  });

  return (
    <div className="absolute inset-0 z-10 flex flex-col">
      {/* Legend */}
      <div className="pointer-events-none absolute bottom-6 left-6 z-20 flex flex-col gap-2 rounded-xl border border-slate-700/50 bg-slate-950/80 p-4 backdrop-blur-sm">
        <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-slate-500">Regiões</p>
        {(Object.entries(REGION_COLOR) as [Region, string][]).map(([r, c]) => (
          <div key={r} className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ background: c }} />
            <span className="text-xs text-slate-400">{r}</span>
          </div>
        ))}
        <p className="mb-1 mt-3 font-mono text-[10px] uppercase tracking-widest text-slate-500">Rotas</p>
        {(Object.entries(ROUTE_COLOR) as [RouteType, string][]).map(([t, c]) => (
          <div key={t} className="flex items-center gap-2">
            <span className="h-[2px] w-4 rounded" style={{ background: c }} />
            <span className="text-xs text-slate-400">{t.replace('_', ' ')}</span>
          </div>
        ))}
      </div>

      <Suspense
        fallback={
          <div className="flex h-full items-center justify-center text-sm text-slate-500">
            Carregando grafo…
          </div>
        }
      >
        <GraphCanvas
          nodes={nodes}
          edges={edges}
          theme={theme}
          layoutType="forceDirected2d"
          edgeInterpolation="linear"
          selections={selections}
          actives={actives}
          onNodeClick={onNodeClick}
          onCanvasClick={onCanvasClick}
        />
      </Suspense>
    </div>
  );
}
