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
  onHighlightRoutes: (ids: string[]) => void;
  simulation: FlightSimulation;
  onSetReady: (path: string[], routeIds: string[], cost?: number) => void;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onRestart: () => void;
  onClear: () => void;
  onSetSpeed: (s: number) => void;
}

export default function AlgorithmsPanel({
  onHighlightRoutes, simulation,
  onSetReady,
}: Props) {
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

  const { status } = simulation;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs text-slate-400">Origem</label>
          <Select onValueChange={(v) => setOrigin(v as string)}>
            <SelectTrigger className="border-slate-700 bg-slate-900 text-slate-200 text-sm">
              <SelectValue placeholder="Aeroporto" />
            </SelectTrigger>
            <SelectContent className="border-slate-700 bg-slate-900">
              {airports.map(a => (
                <SelectItem key={a.id} value={a.id} className="text-slate-200 focus:bg-slate-800 text-sm">
                  {a.id} — {a.city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-slate-400">Destino</label>
          <Select onValueChange={(v) => setDestination(v as string)}>
            <SelectTrigger className="border-slate-700 bg-slate-900 text-slate-200 text-sm">
              <SelectValue placeholder="Aeroporto" />
            </SelectTrigger>
            <SelectContent className="border-slate-700 bg-slate-900">
              {airports.map(a => (
                <SelectItem key={a.id} value={a.id} className="text-slate-200 focus:bg-slate-800 text-sm">
                  {a.id} — {a.city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs text-slate-400">Algoritmo</label>
        <Select defaultValue="dijkstra" onValueChange={(v) => setAlgorithm(v as string)}>
          <SelectTrigger className="border-slate-700 bg-slate-900 text-slate-200 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-slate-700 bg-slate-900">
            {([
              ['bfs', 'BFS — Busca em Largura'],
              ['dfs', 'DFS — Busca em Profundidade'],
              ['dijkstra', 'Dijkstra — Menor Custo'],
              ['bellman-ford', 'Bellman-Ford — Menor Custo'],
            ] as const).map(([v, l]) => (
              <SelectItem key={v} value={v} className="text-slate-200 focus:bg-slate-800 text-sm">{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        onClick={run}
        className="w-full bg-cyan-600/30 border border-cyan-500/50 text-cyan-200 hover:bg-cyan-600/50 text-sm"
      >
        Calcular rota
      </Button>

      {error && <p className="text-xs text-red-400">{error}</p>}

      {result && (
        <div className="rounded-lg border border-cyan-500/30 bg-slate-900/60 p-4 space-y-2">
          <p className="text-xs text-slate-400">Caminho encontrado:</p>
          <p className="font-mono text-sm text-cyan-300 break-all">{result.path.join(' → ')}</p>
          {result.cost !== undefined && (
            <p className="text-xs text-slate-400">
              Custo total: <span className="text-yellow-400 font-mono">{result.cost.toFixed(2)}</span>
            </p>
          )}
          <p className="text-xs text-slate-500">
            {result.path.length - 1} saltos · {result.routeIds.length} aresta(s) destacada(s)
          </p>
        </div>
      )}

      {status !== 'idle' && (
        <div className="rounded-lg border border-cyan-500/20 bg-slate-900/40 px-3 py-2.5 flex items-center gap-2">
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${status === 'playing' ? 'bg-green-400 animate-pulse' : status === 'paused' ? 'bg-yellow-400' : status === 'finished' ? 'bg-purple-400' : 'bg-cyan-400'}`} />
          <p className="text-xs text-slate-400">
            Controles de simulação disponíveis na <span className="text-cyan-300">barra lateral esquerda</span>.
          </p>
        </div>
      )}
    </div>
  );
}
