import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { airports } from '../../data/airports';
import { routes } from '../../data/routes';
import { buildGraph } from '../../lib/graph/buildGraph';
import { bfs } from '../../lib/graph/bfs';
import { dfs } from '../../lib/graph/dfs';
import { dijkstra } from '../../lib/graph/dijkstra';
import { bellmanFord } from '../../lib/graph/bellmanFord';
import type { PathResult } from '../../lib/graph/bfs';
import type { FlightSimulation } from '../../types';

const graph = buildGraph(airports, routes);

interface Props {
  open: boolean;
  simulation: FlightSimulation;
  onHighlightRoutes: (ids: string[]) => void;
  onSetReady: (path: string[], routeIds: string[], cost?: number) => void;
}

export default function AlgorithmsSidebar({ open, simulation, onHighlightRoutes, onSetReady }: Props) {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [algorithm, setAlgorithm] = useState('dijkstra');
  const [result, setResult] = useState<PathResult | null>(null);
  const [error, setError] = useState('');

  const run = () => {
    setError(''); setResult(null);
    if (!origin || !destination || origin === destination) {
      setError('Selecione origem e destino diferentes.'); return;
    }
    let res: PathResult | null = null;
    switch (algorithm) {
      case 'bfs': res = bfs(graph, origin, destination); break;
      case 'dfs': res = dfs(graph, origin, destination); break;
      case 'dijkstra': res = dijkstra(graph, origin, destination); break;
      case 'bellman-ford': res = bellmanFord(airports, routes, origin, destination); break;
    }
    if (!res) { setError('Nenhum caminho encontrado.'); return; }
    setResult(res);
    onHighlightRoutes(res.routeIds);
    onSetReady(res.path, res.routeIds, res.cost);
  };

  return (
    <div
      className={`fixed top-1/2 z-40 w-[272px] -translate-y-1/2 rounded-xl border border-cyan-400/20 bg-slate-950/90 p-4 backdrop-blur-xl transition-all duration-200 flex flex-col gap-4 ${
        open ? 'opacity-100 translate-x-0' : 'pointer-events-none -translate-x-3 opacity-0'
      }`}
      style={{ left: 94 }}
    >
      <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">Algoritmos de Grafo</p>

      <div className="space-y-1.5">
        <label className="text-xs text-slate-400">Algoritmo</label>
        <Select defaultValue="dijkstra" onValueChange={value => { if (value) setAlgorithm(value); }}>
          <SelectTrigger className="border-slate-700 bg-slate-900 text-slate-200 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-slate-700 bg-slate-900">
            {([
              ['bfs',          'BFS — Busca em Largura'],
              ['dfs',          'DFS — Busca em Profundidade'],
              ['dijkstra',     'Dijkstra — Menor Custo'],
              ['bellman-ford', 'Bellman-Ford'],
            ] as const).map(([v, l]) => (
              <SelectItem key={v} value={v} className="text-slate-200 focus:bg-slate-800 text-sm">{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1.5">
          <label className="text-xs text-slate-400">Origem</label>
          <Select onValueChange={value => { if (typeof value === 'string') setOrigin(value); }}>
            <SelectTrigger className="border-slate-700 bg-slate-900 text-slate-200 text-xs">
              <SelectValue placeholder="—" />
            </SelectTrigger>
            <SelectContent className="border-slate-700 bg-slate-900">
              {airports.map(a => (
                <SelectItem key={a.id} value={a.id} className="text-slate-200 focus:bg-slate-800 text-xs">
                  {a.id} — {a.city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-slate-400">Destino</label>
          <Select onValueChange={value => { if (typeof value === 'string') setDestination(value); }}>
            <SelectTrigger className="border-slate-700 bg-slate-900 text-slate-200 text-xs">
              <SelectValue placeholder="—" />
            </SelectTrigger>
            <SelectContent className="border-slate-700 bg-slate-900">
              {airports.map(a => (
                <SelectItem key={a.id} value={a.id} className="text-slate-200 focus:bg-slate-800 text-xs">
                  {a.id} — {a.city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button
        onClick={run}
        className="w-full bg-cyan-600/30 border border-cyan-500/50 text-cyan-200 hover:bg-cyan-600/50 text-sm"
      >
        Calcular rota
      </Button>

      {error && <p className="text-xs text-red-400">{error}</p>}

      {result && (
        <div className="rounded-lg border border-cyan-500/30 bg-slate-900/60 p-3 space-y-1.5">
          <p className="text-xs text-slate-400">Caminho encontrado:</p>
          <p className="break-all font-mono text-xs text-cyan-300">{result.path.join(' → ')}</p>
          {result.cost !== undefined && (
            <p className="text-xs text-slate-400">
              Custo: <span className="font-mono text-yellow-400">{result.cost.toFixed(2)}</span>
            </p>
          )}
          <p className="text-xs text-slate-500">{result.path.length - 1} salto(s)</p>
        </div>
      )}

      {simulation.status !== 'idle' && (
        <div className="flex items-center gap-2 rounded-lg border border-cyan-500/20 bg-slate-900/40 px-3 py-2">
          <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${
            simulation.status === 'playing' ? 'animate-pulse bg-green-400' :
            simulation.status === 'paused'  ? 'bg-yellow-400' : 'bg-purple-400'
          }`} />
          <p className="text-xs text-slate-400">Simulação ativa</p>
        </div>
      )}
    </div>
  );
}
