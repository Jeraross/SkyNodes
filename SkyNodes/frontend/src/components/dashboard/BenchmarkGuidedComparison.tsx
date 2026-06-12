// src/components/dashboard/BenchmarkGuidedComparison.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { airports } from '../../data/airports';
import { routes } from '../../data/routes';
import { buildGraph } from '../../lib/graph/buildGraph';
import { runAllAlgorithms, bestIdx } from '../../lib/graph/benchmark';
import type { AlgorithmResult } from '../../lib/graph/benchmark';

const ALGO_NOTES: Record<string, string> = {
  BFS:           'Busca em Largura — explora camada por camada. Garante o menor número de saltos, mas ignora os pesos das arestas. O(V + E).',
  DFS:           'Busca em Profundidade — explora o mais fundo possível antes de retroceder. Retorna o primeiro caminho encontrado pela ordem da lista de adjacência, não necessariamente o ótimo. Pode ter mais saltos e custo maior que BFS ou Dijkstra. O(V + E).',
  Dijkstra:      'Algoritmo guloso com varredura linear no conjunto de não-visitados. Garante o menor custo total considerando os pesos das rotas. Exige pesos não-negativos — válido neste grafo. O(V²) nesta implementação.',
  'Bellman-Ford':'Relaxamento iterativo de todas as arestas por V−1 rodadas. Garante custo mínimo, suporta pesos negativos e detecta ciclos negativos. Mais lento que Dijkstra: O(V · E) — visível no tempo medido.',
};

function InfoTooltip({ note }: { note: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative flex items-center">
      <button
        type="button"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="text-slate-500 hover:text-slate-300 transition-colors leading-none"
        aria-label="Mais informações"
      >
        ⓘ
      </button>
      {open && (
        <div className="absolute bottom-full left-1/2 z-50 mb-2 w-56 -translate-x-1/2 rounded-lg border border-slate-700/60 bg-slate-900/95 px-3 py-2.5 text-[10px] leading-relaxed text-slate-300 shadow-2xl backdrop-blur-sm">
          {note}
          <div className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-x-4 border-x-transparent border-t-4 border-t-slate-700/60" />
        </div>
      )}
    </div>
  );
}

const graph = buildGraph(airports, routes);

export default function BenchmarkGuidedComparison() {
  const [origin, setOrigin]           = useState('');
  const [destination, setDestination] = useState('');
  const [results, setResults]         = useState<AlgorithmResult[] | null>(null);
  const [error, setError]             = useState('');

  const compare = () => {
    setError('');
    if (!origin || !destination || origin === destination) {
      setError('Selecione origem e destino diferentes.'); return;
    }
    setResults(runAllAlgorithms(graph, airports, routes, origin, destination));
  };

  const bestTime = results ? bestIdx<AlgorithmResult>(results, 'timeMs', true, r => r.found) : -1;
  const bestCost = results ? bestIdx<AlgorithmResult>(results, 'cost',   true, r => r.found) : -1;
  const bestHops = results ? bestIdx<AlgorithmResult>(results, 'hops',   true, r => r.found) : -1;

  return (
    <div className="space-y-4">
      <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
        Comparação Guiada
      </p>

      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 min-w-[120px] space-y-1.5">
          <label className="text-xs text-slate-400">Origem</label>
          <Select onValueChange={value => { if (typeof value === 'string') setOrigin(value); }}>
            <SelectTrigger className="border-slate-700 bg-slate-900 text-slate-200 text-sm">
              <SelectValue placeholder="—" />
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

        <div className="flex-1 min-w-[120px] space-y-1.5">
          <label className="text-xs text-slate-400">Destino</label>
          <Select onValueChange={value => { if (typeof value === 'string') setDestination(value); }}>
            <SelectTrigger className="border-slate-700 bg-slate-900 text-slate-200 text-sm">
              <SelectValue placeholder="—" />
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

        <div className="flex items-end">
          <Button
            onClick={compare}
            className="bg-cyan-600/30 border border-cyan-500/50 text-cyan-200 hover:bg-cyan-600/50 text-sm"
          >
            Comparar
          </Button>
        </div>
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      {results && (
        <>
          <div className="grid grid-cols-4 gap-3">
            {results.map((r, i) => (
              <div
                key={r.algorithm}
                className={`rounded-xl border p-3 space-y-2 ${r.found ? 'border-cyan-500/20 bg-slate-900/60' : 'border-slate-700/40 bg-slate-900/30 opacity-60'}`}
              >
                <div className="flex items-center justify-between gap-1">
                  <p className="text-xs font-semibold text-slate-200 leading-tight">{r.algorithm}</p>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {!r.found && <span className="text-[9px] text-red-400 font-mono">sem rota</span>}
                    {ALGO_NOTES[r.algorithm] && <InfoTooltip note={ALGO_NOTES[r.algorithm]} />}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-500">Tempo</span>
                    <span className={`font-mono ${i === bestTime ? 'text-cyan-300 font-semibold' : 'text-slate-300'}`}>
                      {r.timeMs.toFixed(3)} ms
                      {i === bestTime && <span className="ml-1 text-[8px] text-cyan-400">★</span>}
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-500">Custo</span>
                    <span className={`font-mono ${i === bestCost ? 'text-yellow-300 font-semibold' : 'text-slate-300'}`}>
                      {r.cost !== null ? r.cost.toFixed(1) : '—'}
                      {i === bestCost && <span className="ml-1 text-[8px] text-yellow-400">★</span>}
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-500">Saltos</span>
                    <span className={`font-mono ${i === bestHops ? 'text-green-300 font-semibold' : 'text-slate-300'}`}>
                      {r.hops !== null ? r.hops : '—'}
                      {i === bestHops && <span className="ml-1 text-[8px] text-green-400">★</span>}
                    </span>
                  </div>
                </div>

                {r.found && (
                  <p className="font-mono text-[9px] text-slate-500 break-all leading-relaxed border-t border-slate-800 pt-2">
                    {r.path.join(' → ')}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-slate-700/40 bg-slate-900/40 px-4 py-3 space-y-2">
            <p className="font-mono text-[9px] uppercase tracking-widest text-slate-500">Legenda</p>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              <span className="font-mono text-slate-300">Tempo</span> — média de múltiplas execuções (BFS/DFS: 2000×, Dijkstra: 1000×, Bellman-Ford: 200×) para contornar a resolução mínima do timer do navegador. Algoritmos rápidos completam em menos de 1 ms num grafo pequeno, tornando uma única medição imprecisa.
            </p>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              <span className="font-mono text-cyan-400">★ ciano</span> = menor tempo de execução &nbsp;·&nbsp;
              <span className="font-mono text-yellow-400">★ amarelo</span> = menor custo total da rota &nbsp;·&nbsp;
              <span className="font-mono text-green-400">★ verde</span> = menor número de saltos (escalas)
            </p>
          </div>
        </>
      )}
    </div>
  );
}
