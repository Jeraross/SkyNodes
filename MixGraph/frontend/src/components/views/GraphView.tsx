import { Suspense, useMemo, useState } from 'react';
import { GraphCanvas, darkTheme } from 'reagraph';
import { airports } from '../../data/airports';
import { routes } from '../../data/routes';
import type { Region } from '../../data/airports';
import type { RouteType } from '../../data/routes';
import { REGION_COLOR, ROUTE_COLOR } from '../../data/colors';
import type { GraphMetrics } from '../../lib/graph/graphMetrics';
import type { PathResult } from '../../lib/graph/bfs';

const theme = {
  ...darkTheme,
  canvas: { background: '#020617', fog: '#020617' },
  node: {
    ...darkTheme.node,
    label: { ...darkTheme.node.label, color: '#94a3b8', stroke: '#020617', activeColor: '#67e8f9' },
    ring: { fill: '#67e8f9', activeFill: '#67e8f9' },
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
  dijkstraPaths: { recPoa: PathResult; maoGru: PathResult };
  metrics: GraphMetrics;
  egoByAirport: Record<string, number>;
}

export default function GraphView({ highlightedRouteIds, dijkstraPaths, metrics, egoByAirport }: Props) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [clickedNode, setClickedNode] = useState<string | null>(null);

  const recPoaSet = useMemo(() => new Set(dijkstraPaths.recPoa.routeIds), []);
  const maoGruSet = useMemo(() => new Set(dijkstraPaths.maoGru.routeIds), []);
  const recPoaNodeSet = useMemo(() => new Set(dijkstraPaths.recPoa.path), []);
  const maoGruNodeSet = useMemo(() => new Set(dijkstraPaths.maoGru.path), []);

  const nodes = useMemo(
    () =>
      airports.map(a => ({
        id: a.id,
        label: a.id,
        fill: REGION_COLOR[a.region],
        size: recPoaNodeSet.has(a.id) || maoGruNodeSet.has(a.id)
          ? 14
          : ['GRU', 'BSB', 'GIG', 'CGH'].includes(a.id)
          ? 12
          : 8,
      })),
    [],
  );

  const edges = useMemo(
    () =>
      routes.map(r => {
        const inRecPoa = recPoaSet.has(r.id);
        const inMaoGru = maoGruSet.has(r.id);
        const inSim = highlightedRouteIds.includes(r.id);
        let fill = ROUTE_COLOR[r.type];
        let size = 1;
        if (inSim) { fill = '#fbbf24'; size = 3; }
        if (inRecPoa && inMaoGru) { fill = '#a855f7'; size = 3; }
        else if (inRecPoa) { fill = '#ef4444'; size = 3; }
        else if (inMaoGru) { fill = '#3b82f6'; size = 3; }
        return { id: r.id, source: r.from, target: r.to, fill, size };
      }),
    [highlightedRouteIds],
  );

  const handleNodeClick = (node: { id: string }) => {
    setClickedNode(prev => prev === node.id ? null : node.id);
  };

  const handleCanvasClick = () => {
    setClickedNode(null);
    setHoveredNode(null);
  };

  const activeId = hoveredNode ?? clickedNode;
  const activeAirport = activeId ? airports.find(a => a.id === activeId) : null;

  return (
    <div className="absolute inset-0 z-10 flex flex-col">
      {/* Stats overlay — top right */}
      <div className="pointer-events-none absolute top-4 right-4 z-20 flex gap-2 flex-wrap justify-end">
        {[
          `${metrics.totalAirports} aeroportos`,
          `${metrics.totalRoutes} rotas`,
          `densidade ${metrics.graphDensity.toFixed(3)}`,
          `hub: ${metrics.mostConnectedAirport}`,
        ].map(label => (
          <div key={label} className="rounded-lg border border-slate-700/50 bg-slate-950/80 px-3 py-1.5 backdrop-blur-sm">
            <span className="font-mono text-[11px] text-slate-300">{label}</span>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="pointer-events-none absolute bottom-6 right-4 z-20 flex flex-col gap-2 rounded-xl border border-slate-700/50 bg-slate-950/80 p-4 backdrop-blur-sm">
        <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-slate-500">Regiões</p>
        {(Object.entries(REGION_COLOR) as [Region, string][]).map(([r, c]) => (
          <div key={r} className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ background: c }} />
            <span className="text-xs text-slate-400">{r}</span>
          </div>
        ))}
        <div className="my-2 border-t border-slate-700/60" />
        <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-slate-500">Rotas</p>
        {(Object.entries(ROUTE_COLOR) as [RouteType, string][]).map(([t, c]) => (
          <div key={t} className="flex items-center gap-2">
            <span className="h-[2px] w-4 rounded" style={{ background: c }} />
            <span className="text-xs text-slate-400">{t.replace('_', ' ')}</span>
          </div>
        ))}
        <div className="my-2 border-t border-slate-700/60" />
        <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-slate-500">Dijkstra</p>
        <div className="flex items-center gap-2">
          <span className="h-[2px] w-4 rounded" style={{ background: '#ef4444' }} />
          <span className="text-xs text-slate-400">REC → POA ({dijkstraPaths.recPoa.cost?.toFixed(1)})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-[2px] w-4 rounded" style={{ background: '#3b82f6' }} />
          <span className="text-xs text-slate-400">MAO → GRU ({dijkstraPaths.maoGru.cost?.toFixed(1)})</span>
        </div>
      </div>

      {/* Node tooltip */}
      {activeAirport && (
        <div className="pointer-events-none absolute bottom-6 left-1/2 z-20 -translate-x-1/2 rounded-xl border border-cyan-500/30 bg-slate-950/90 px-5 py-3 backdrop-blur-sm">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="font-mono text-lg font-bold text-cyan-300">{activeAirport.id}</span>
            <span className="text-xs text-slate-500">{activeAirport.state}</span>
          </div>
          <p className="text-sm text-slate-200 mb-1">{activeAirport.name}</p>
          <div className="flex gap-3 text-xs text-slate-400">
            <span>Cidade: <span className="text-slate-200">{activeAirport.city}</span></span>
            <span>Região: <span className="text-slate-200">{activeAirport.region}</span></span>
          </div>
          <div className="flex gap-3 text-xs text-slate-400 mt-1">
            <span>Grau: <span className="text-cyan-300">{metrics.degreeByAirport[activeAirport.id]}</span></span>
            <span>Ego density: <span className="text-cyan-300">{(egoByAirport[activeAirport.id] ?? 0).toFixed(3)}</span></span>
          </div>
        </div>
      )}

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
          edgeArrowPosition="none"
          onNodeClick={handleNodeClick}
          onNodePointerOver={(node) => setHoveredNode(node.id)}
          onNodePointerOut={() => setHoveredNode(null)}
          onCanvasClick={handleCanvasClick}
        />
      </Suspense>
    </div>
  );
}
