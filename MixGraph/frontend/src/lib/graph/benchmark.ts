// src/lib/graph/benchmark.ts
import type { Airport } from '../../data/airports';
import type { Route } from '../../data/routes';
import type { Graph } from './buildGraph';
import { bfs } from './bfs';
import { dfs } from './dfs';
import { dijkstra } from './dijkstra';
import { bellmanFord } from './bellmanFord';

export interface AlgorithmResult {
  algorithm: string;
  timeMs: number;
  found: boolean;
  cost: number | null;
  hops: number | null;
  path: string[];
}

export interface BenchmarkSummary {
  algorithm: string;
  avgTimeMs: number;
  successRate: number;
  avgCost: number | null;
  avgHops: number | null;
}

const ALGORITHM_LABELS: Record<string, string> = {
  bfs: 'BFS',
  dfs: 'DFS',
  dijkstra: 'Dijkstra',
  'bellman-ford': 'Bellman-Ford',
};

const ALGORITHMS = ['bfs', 'dfs', 'dijkstra', 'bellman-ford'] as const;
type AlgorithmKey = typeof ALGORITHMS[number];

function runOne(
  graph: Graph,
  airports: Airport[],
  routes: Route[],
  from: string,
  to: string,
  algorithm: AlgorithmKey,
): AlgorithmResult {
  const t0 = performance.now();
  let result: ReturnType<typeof bfs> = null;
  switch (algorithm) {
    case 'bfs':          result = bfs(graph, from, to); break;
    case 'dfs':          result = dfs(graph, from, to); break;
    case 'dijkstra':     result = dijkstra(graph, from, to); break;
    case 'bellman-ford': result = bellmanFord(airports, routes, from, to); break;
  }
  const timeMs = performance.now() - t0;
  return {
    algorithm: ALGORITHM_LABELS[algorithm],
    timeMs,
    found: result !== null,
    cost: result?.cost ?? null,
    hops: result !== null ? result.path.length - 1 : null,
    path: result?.path ?? [],
  };
}

export function runAllAlgorithms(
  graph: Graph,
  airports: Airport[],
  routes: Route[],
  from: string,
  to: string,
): AlgorithmResult[] {
  return ALGORITHMS.map(alg => runOne(graph, airports, routes, from, to, alg));
}

export function runGeneralBenchmark(
  graph: Graph,
  airports: Airport[],
  routes: Route[],
): BenchmarkSummary[] {
  type Acc = { timeMs: number; successes: number; cost: number; hops: number; total: number };
  const acc: Record<string, Acc> = {};
  for (const alg of ALGORITHMS) {
    acc[alg] = { timeMs: 0, successes: 0, cost: 0, hops: 0, total: 0 };
  }

  for (const a of airports) {
    for (const b of airports) {
      if (a.id === b.id) continue;
      for (const alg of ALGORITHMS) {
        const r = runOne(graph, airports, routes, a.id, b.id, alg);
        acc[alg].total += 1;
        acc[alg].timeMs += r.timeMs;
        if (r.found) {
          acc[alg].successes += 1;
          acc[alg].cost += r.cost!;
          acc[alg].hops += r.hops!;
        }
      }
    }
  }

  return ALGORITHMS.map(alg => {
    const a = acc[alg];
    const s = a.successes;
    return {
      algorithm: ALGORITHM_LABELS[alg],
      avgTimeMs: a.total > 0 ? a.timeMs / a.total : 0,
      successRate: a.total > 0 ? s / a.total : 0,
      avgCost: s > 0 ? a.cost / s : null,
      avgHops: s > 0 ? a.hops / s : null,
    };
  });
}

export function bestIdx<T>(
  items: T[],
  key: keyof T,
  lower: boolean,
  filterFn?: (item: T) => boolean,
): number {
  let best = -1;
  let bestVal = lower ? Infinity : -Infinity;
  items.forEach((item, i) => {
    if (filterFn && !filterFn(item)) return;
    const v = item[key];
    if (v === null || v === undefined) return;
    const n = v as number;
    if (lower ? n < bestVal : n > bestVal) { bestVal = n; best = i; }
  });
  return best;
}
