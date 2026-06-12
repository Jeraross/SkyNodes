import { useState } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { airports } from '../../data/airports';
import { routes } from '../../data/routes';
import { api } from '../../lib/api';
import { backendPathToResult } from '../../lib/graph/pathUtils';
import type { PathResult } from '../../lib/graph/pathUtils';
import type { FlightSimulation } from '../../types';
import { useIsMobile } from '../../hooks/useIsMobile';

interface Props {
  open: boolean;
  simulation: FlightSimulation;
  onHighlightRoutes: (ids: string[]) => void;
  onSetReady: (path: string[], routeIds: string[], cost?: number) => void;
  onClose?: () => void;
}

export default function AlgorithmsSidebar({ open, simulation, onHighlightRoutes, onSetReady, onClose }: Props) {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [algorithm, setAlgorithm] = useState('dijkstra');
  const [result, setResult] = useState<PathResult | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const isMobile = useIsMobile();

  const run = async () => {
    setError(''); setResult(null);
    if (!origin || !destination || origin === destination) {
      setError('Selecione origem e destino diferentes.'); return;
    }
    setLoading(true);
    try {
      let raw: { caminho: string[]; custo: number | null } | null = null;
      switch (algorithm) {
        case 'bfs': {
          const r = await api.bfs(origin, destination);
          raw = r.caminho ? { caminho: r.caminho, custo: r.custo ?? null } : null;
          break;
        }
        case 'dfs': {
          const r = await api.dfs(origin, destination);
          raw = r.caminho ? { caminho: r.caminho, custo: r.custo ?? null } : null;
          break;
        }
        case 'dijkstra': {
          const r = await api.dijkstra(origin, destination);
          raw = r.caminho.length > 0 ? { caminho: r.caminho, custo: r.custo } : null;
          break;
        }
        case 'bellman-ford': {
          const r = await api.bellmanFord(origin, destination);
          raw = r.caminho.length > 0 ? { caminho: r.caminho, custo: r.custo } : null;
          break;
        }
      }
      if (!raw) { setError('Nenhum caminho encontrado.'); return; }
      const res = backendPathToResult(raw.caminho, raw.custo, routes);
      setResult(res);
      onHighlightRoutes(res.routeIds);
      onSetReady(res.path, res.routeIds, res.cost);
    } catch {
      setError('Erro ao comunicar com o servidor. Verifique se o backend está rodando.');
    } finally {
      setLoading(false);
    }
  };

  const content = (
    <>
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">Algoritmos de Grafo</p>
        {isMobile && onClose && (
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
            <X size={16} />
          </button>
        )}
      </div>

      <div className="space-y-1.5">
        <label className="text-xs text-slate-400">Algoritmo</label>
        <Select defaultValue="dijkstra" onValueChange={value => { if (value) setAlgorithm(value); }}>
          <SelectTrigger className="border-slate-700 bg-slate-900 text-slate-200 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-slate-700 bg-slate-900 min-w-max">
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
        disabled={loading}
        className="w-full bg-cyan-600/30 border border-cyan-500/50 text-cyan-200 hover:bg-cyan-600/50 text-sm disabled:opacity-50"
      >
        {loading ? 'Calculando...' : 'Calcular rota'}
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
    </>
  );

  if (isMobile) {
    return (
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed bottom-[70px] left-0 right-0 z-50 rounded-t-2xl border-t border-cyan-400/20 bg-slate-950/95 p-4 backdrop-blur-xl flex flex-col gap-4 max-h-[70vh] overflow-y-auto"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <div
      className={`fixed top-1/2 z-40 w-[272px] -translate-y-1/2 rounded-xl border border-cyan-400/20 bg-slate-950/90 p-4 backdrop-blur-xl transition-all duration-200 flex flex-col gap-4 ${
        open ? 'opacity-100 translate-x-0' : 'pointer-events-none -translate-x-3 opacity-0'
      }`}
      style={{ left: 94 }}
    >
      {content}
    </div>
  );
}
