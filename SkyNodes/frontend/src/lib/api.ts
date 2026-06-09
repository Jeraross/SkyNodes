const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, init);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`[API] ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

const JSON_HEADERS = { 'Content-Type': 'application/json' };

export interface BfsApiResponse {
  visitados: string[];
  niveis: Record<string, number>;
  pais: Record<string, string | null>;
  arestas_arvore: [string, string][];
  caminho?: string[];
  custo?: number;
}

export interface DfsApiResponse {
  visitados: string[];
  pais: Record<string, string | null>;
  descoberta: Record<string, number>;
  termino: Record<string, number>;
  arestas_arvore: [string, string][];
  arestas_retorno: [string, string][];
  tem_ciclo: boolean;
  caminho?: string[];
  custo?: number;
}

export interface PathApiResponse {
  origem: string;
  destino: string;
  caminho: string[];
  custo: number | null;
  distancias: Record<string, number | null>;
  pais: Record<string, string | null>;
}

export interface EgoApiResponse {
  aeroporto: string;
  grau: number;
  ordem_ego: number;
  tamanho_ego: number;
  densidade_ego: number;
}

export interface RegionApiResponse {
  regiao: string;
  ordem: number;
  tamanho: number;
  densidade: number;
}

export interface DistanceMatrixApiResponse {
  matrix: Record<string, Record<string, number | null>>;
}

export const api = {
  bfs: (source: string, target?: string) =>
    request<BfsApiResponse>('/algorithms/bfs', {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify(target !== undefined ? { source, target } : { source }),
    }),

  dfs: (source: string, target?: string) =>
    request<DfsApiResponse>('/algorithms/dfs', {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify(target !== undefined ? { source, target } : { source }),
    }),

  dijkstra: (source: string, target: string) =>
    request<PathApiResponse>('/algorithms/dijkstra', {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify({ source, target }),
    }),

  bellmanFord: (source: string, target: string) =>
    request<PathApiResponse>('/algorithms/bellman-ford', {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify({ source, target }),
    }),

  egoMetrics: () => request<EgoApiResponse[]>('/metrics/ego'),
  regionMetrics: () => request<RegionApiResponse[]>('/metrics/regions'),
  distanceMatrix: () => request<DistanceMatrixApiResponse>('/metrics/distance-matrix'),
};
