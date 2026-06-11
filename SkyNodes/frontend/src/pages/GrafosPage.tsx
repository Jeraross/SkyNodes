import { useState } from 'react';
import ArticleLayout from '../components/ui/ArticleLayout';
import ArticleTabs from '../components/ui/ArticleTabs';
import FadeContent from '@reactbits/FadeContent/FadeContent';
import SpotlightCard from '@reactbits/SpotlightCard/SpotlightCard';
import ScrollReveal from '@reactbits/ScrollReveal/ScrollReveal';
import BlurText from '@reactbits/BlurText/BlurText';

const TABS = [
  { id: 'nos-arestas', label: 'Nós e Arestas' },
  { id: 'algoritmos',  label: 'Algoritmos'    },
];

const REGIONS = [
  { name: 'Norte',        nodes: ['MAO', 'BEL', 'PVH', 'RBR'],                     count: 4, edges: 6  },
  { name: 'Nordeste',     nodes: ['REC', 'SSA', 'FOR', 'NAT', 'JPA', 'THE'],        count: 6, edges: 15 },
  { name: 'Sudeste',      nodes: ['GRU', 'CGH', 'GIG', 'CNF', 'VIX'],              count: 5, edges: 10 },
  { name: 'Sul',          nodes: ['CWB', 'FLN', 'POA'],                             count: 3, edges: 3  },
  { name: 'Centro-Oeste', nodes: ['BSB', 'GYN'],                                    count: 2, edges: 1  },
];

const DEGREE_TABLE = [
  { iata: 'GRU', regiao: 'Sudeste',      grau: 11, hub: true  },
  { iata: 'BSB', regiao: 'Centro-Oeste', grau: 8,  hub: true  },
  { iata: 'REC', regiao: 'Nordeste',     grau: 7,  hub: false },
  { iata: 'SSA', regiao: 'Nordeste',     grau: 7,  hub: false },
  { iata: 'GIG', regiao: 'Sudeste',      grau: 6,  hub: true  },
  { iata: 'MAO', regiao: 'Norte',        grau: 6,  hub: false },
  { iata: 'FOR', regiao: 'Nordeste',     grau: 6,  hub: false },
  { iata: 'POA', regiao: 'Sul',          grau: 5,  hub: false },
  { iata: 'BEL', regiao: 'Norte',        grau: 4,  hub: false },
  { iata: 'CWB', regiao: 'Sul',          grau: 5,  hub: false },
  { iata: 'FLN', regiao: 'Sul',          grau: 4,  hub: false },
  { iata: 'CGH', regiao: 'Sudeste',      grau: 4,  hub: false },
  { iata: 'CNF', regiao: 'Sudeste',      grau: 4,  hub: false },
  { iata: 'VIX', regiao: 'Sudeste',      grau: 4,  hub: false },
  { iata: 'NAT', regiao: 'Nordeste',     grau: 5,  hub: false },
  { iata: 'JPA', regiao: 'Nordeste',     grau: 5,  hub: false },
  { iata: 'THE', regiao: 'Nordeste',     grau: 5,  hub: false },
  { iata: 'PVH', regiao: 'Norte',        grau: 3,  hub: false },
  { iata: 'RBR', regiao: 'Norte',        grau: 3,  hub: false },
  { iata: 'GYN', regiao: 'Centro-Oeste', grau: 1,  hub: false },
];

const WEIGHT_EXAMPLES = [
  { u: 'GRU', v: 'GIG',  tipo: 'regional',       base: 1.0, reg: 0.0, hub: 0.0, total: 1.0 },
  { u: 'REC', v: 'FOR',  tipo: 'regional',       base: 1.0, reg: 0.0, hub: 0.5, total: 1.5 },
  { u: 'MAO', v: 'GRU',  tipo: 'hub',            base: 2.0, reg: 1.0, hub: 0.0, total: 3.0 },
  { u: 'NAT', v: 'BSB',  tipo: 'hub',            base: 2.0, reg: 1.0, hub: 0.0, total: 3.0 },
  { u: 'BSB', v: 'BEL',  tipo: 'inter_regional', base: 2.5, reg: 1.0, hub: 0.0, total: 3.5 },
  { u: 'GIG', v: 'SSA',  tipo: 'inter_regional', base: 2.5, reg: 1.0, hub: 0.0, total: 3.5 },
];

const ALGORITHMS = [
  {
    name: 'BFS',
    full: 'Busca em Largura',
    complexity: 'O(V + E)',
    structure: 'Fila FIFO (deque)',
    weights: 'Ignora pesos',
    cycles: 'Não detecta',
    problem: 'Alcançabilidade · estrutura de camadas da rede a partir de um aeroporto',
    color: 'cyan',
  },
  {
    name: 'DFS',
    full: 'Busca em Profundidade',
    complexity: 'O(V + E)',
    structure: 'Pilha (iterativa)',
    weights: 'Ignora pesos',
    cycles: 'Sim — via back-edges',
    problem: 'Detecção de ciclos · análise topológica do grafo de rotas',
    color: 'blue',
  },
  {
    name: 'Dijkstra',
    full: 'Caminho Mínimo',
    complexity: 'O((V+E) log V)',
    structure: 'Min-heap (heapq)',
    weights: 'Requer w ≥ 0',
    cycles: 'Não detecta',
    problem: 'Menor custo entre dois aeroportos · todos os pesos ≥ 1.0 neste grafo',
    color: 'emerald',
  },
  {
    name: 'Bellman-Ford',
    full: 'Caminho Ótimo',
    complexity: 'O(V · E)',
    structure: 'Relaxamento iterativo',
    weights: 'Permite w < 0',
    cycles: 'Sim — ciclos negativos',
    problem: 'Caminhos com pesos negativos · detecção de ciclos de custo negativo',
    color: 'violet',
  },
];

const BFS_LAYERS = [
  { layer: 0, nodes: ['REC'],                                                                count: 1,  desc: 'Origem' },
  { layer: 1, nodes: ['SSA', 'FOR', 'NAT', 'JPA', 'THE', 'GRU', 'BSB'],                     count: 7,  desc: 'Clique Nordeste + hubs' },
  { layer: 2, nodes: ['CGH', 'GIG', 'CNF', 'VIX', 'MAO', 'POA', 'CWB', 'FLN', 'GYN', 'BEL'], count: 10, desc: 'Via GRU e BSB' },
  { layer: 3, nodes: ['PVH', 'RBR'],                                                          count: 2,  desc: 'Via MAO/BEL — extremo Norte' },
];

const COMPARISON = [
  { feature: 'Estrutura auxiliar', bfs: 'Fila (deque)', dfs: 'Pilha', dijk: 'Min-heap', bf: 'Nenhuma' },
  { feature: 'Pesos nas arestas',  bfs: 'Ignora',       dfs: 'Ignora', dijk: 'Requer ≥ 0', bf: 'Permite < 0' },
  { feature: 'Detecta ciclos',     bfs: '✗',            dfs: '✓',      dijk: '✗',        bf: '✓ negativos' },
  { feature: 'Caminho mín. saltos',bfs: '✓',            dfs: '✗',      dijk: '✗*',       bf: '✗*' },
  { feature: 'Caminho mín. custo', bfs: '✗',            dfs: '✗',      dijk: '✓',        bf: '✓' },
  { feature: 'Complexidade',       bfs: 'O(V+E)',        dfs: 'O(V+E)', dijk: 'O((V+E)logV)', bf: 'O(V·E)' },
  { feature: 'Tempo (portos)',     bfs: '18.4 ms',       dfs: '22.1 ms', dijk: '134.7 ms', bf: '~2.890 ms' },
];

const colorMap: Record<string, string> = {
  cyan: 'border-cyan-500/30 bg-cyan-500/5',
  blue: 'border-blue-500/30 bg-blue-500/5',
  emerald: 'border-emerald-500/30 bg-emerald-500/5',
  violet: 'border-violet-500/30 bg-violet-500/5',
};
const labelColorMap: Record<string, string> = {
  cyan: 'text-cyan-400', blue: 'text-blue-400', emerald: 'text-emerald-400', violet: 'text-violet-400',
};

function NosArestasTab() {
  return (
    <div className="space-y-12">
      <FadeContent duration={600}>
        <SpotlightCard className="p-6 md:p-8">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-cyan-400">Definição Formal</p>
          <div className="font-mono text-lg text-white mb-4">G = (V, E, w)</div>
          <div className="grid gap-3 text-sm md:grid-cols-3">
            <div className="rounded-lg bg-white/5 px-4 py-3">
              <span className="font-mono text-cyan-300">V </span>
              <span className="text-slate-400">— conjunto de 20 vértices (aeroportos IATA)</span>
            </div>
            <div className="rounded-lg bg-white/5 px-4 py-3">
              <span className="font-mono text-cyan-300">E </span>
              <span className="text-slate-400">— conjunto de 50 arestas (rotas aéreas)</span>
            </div>
            <div className="rounded-lg bg-white/5 px-4 py-3">
              <span className="font-mono text-cyan-300">w </span>
              <span className="text-slate-400">— função w: E → ℝ₊ &nbsp;· &nbsp;w ∈ [1.0, 3.5]</span>
            </div>
          </div>
        </SpotlightCard>
      </FadeContent>

      <FadeContent duration={700} delay={100}>
        <BlurText text="Distribuição por Região" className="mb-6 text-xl font-semibold text-white" animateBy="words" delay={80} />
        <div className="grid gap-4 md:grid-cols-5">
          {REGIONS.map(r => (
            <SpotlightCard key={r.name} className="p-4 text-center">
              <div className="mb-2 text-xs font-mono text-cyan-400 uppercase tracking-wider">{r.name}</div>
              <div className="mb-3 flex flex-wrap justify-center gap-1">
                {r.nodes.map(n => (
                  <span key={n} className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-slate-300">{n}</span>
                ))}
              </div>
              <div className="text-xs text-slate-400">{r.count} nós · {r.edges} arestas</div>
              <div className="mt-1 text-[10px] text-cyan-400 font-mono">δ = 1.000</div>
            </SpotlightCard>
          ))}
        </div>
      </FadeContent>

      <FadeContent duration={700} delay={150}>
        <BlurText text="Grau dos Vértices" className="mb-6 text-xl font-semibold text-white" animateBy="words" delay={80} />
        <div className="overflow-hidden rounded-2xl border border-cyan-500/15">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-cyan-950/40">
                <th className="px-4 py-3 text-left font-mono text-xs uppercase text-cyan-400">IATA</th>
                <th className="px-4 py-3 text-left font-mono text-xs uppercase text-cyan-400">Região</th>
                <th className="px-4 py-3 text-center font-mono text-xs uppercase text-cyan-400">Grau</th>
                <th className="px-4 py-3 text-center font-mono text-xs uppercase text-cyan-400">Hub</th>
              </tr>
            </thead>
            <tbody>
              {DEGREE_TABLE.map((r, i) => (
                <tr key={r.iata} className={i % 2 === 0 ? 'bg-white/[0.02]' : ''}>
                  <td className="px-4 py-2 font-mono font-semibold text-cyan-300">{r.iata}</td>
                  <td className="px-4 py-2 text-slate-400 text-xs">{r.regiao}</td>
                  <td className="px-4 py-2 text-center">
                    <div className="mx-auto h-1.5 rounded-full bg-white/10" style={{ width: '80px' }}>
                      <div className="h-full rounded-full bg-cyan-400" style={{ width: `${(r.grau / 11) * 100}%` }} />
                    </div>
                    <span className="mt-0.5 block text-center font-mono text-xs text-white">{r.grau}</span>
                  </td>
                  <td className="px-4 py-2 text-center">
                    {r.hub ? <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[10px] font-semibold text-cyan-300">HUB</span> : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </FadeContent>

      <FadeContent duration={700} delay={200}>
        <SpotlightCard className="p-6 md:p-8">
          <h3 className="mb-2 font-mono text-xs uppercase tracking-widest text-cyan-400">Fórmula de Peso — Exemplos</h3>
          <p className="mb-4 text-sm text-slate-400">
            w(u, v) = peso_base + pen_regiao + pen_hub — intervalo resultante: <span className="font-mono text-white">[1.0, 3.5]</span>
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/10 text-cyan-400 font-mono">
                  <th className="py-2 text-left">Par</th>
                  <th className="py-2 text-center">Tipo</th>
                  <th className="py-2 text-center">base</th>
                  <th className="py-2 text-center">pen_reg</th>
                  <th className="py-2 text-center">pen_hub</th>
                  <th className="py-2 text-center font-bold text-white">w(u,v)</th>
                </tr>
              </thead>
              <tbody>
                {WEIGHT_EXAMPLES.map((ex, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white/[0.02]' : ''}>
                    <td className="py-2 font-mono text-cyan-300">{ex.u} ↔ {ex.v}</td>
                    <td className="py-2 text-center text-slate-400">{ex.tipo}</td>
                    <td className="py-2 text-center text-slate-300">{ex.base.toFixed(1)}</td>
                    <td className="py-2 text-center text-slate-300">{ex.reg.toFixed(1)}</td>
                    <td className="py-2 text-center text-slate-300">{ex.hub.toFixed(1)}</td>
                    <td className="py-2 text-center font-bold text-white">{ex.total.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SpotlightCard>
      </FadeContent>

      <FadeContent duration={700} delay={250}>
        <ScrollReveal containerClassName="max-w-3xl" textClassName="text-slate-300" enableBlur>
          GRU apresenta a maior ego-subrede do grafo com 12 nós (ele + 11 vizinhos), mas sua densidade de ego é relativamente baixa: seus vizinhos provêm de múltiplas regiões distintas e não formam clique entre si. GYN, com grau 1, tem a menor ego-subrede possível — apenas 2 nós — e densidade de ego indeterminada.
        </ScrollReveal>
      </FadeContent>
    </div>
  );
}

function AlgoritmosTab() {
  return (
    <div className="space-y-12">
      <FadeContent duration={600}>
        <div className="grid gap-4 md:grid-cols-2">
          {ALGORITHMS.map(algo => (
            <SpotlightCard key={algo.name} className={`border p-6 ${colorMap[algo.color]}`}>
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <span className={`font-mono text-lg font-bold ${labelColorMap[algo.color]}`}>{algo.name}</span>
                  <span className="ml-2 text-sm text-slate-400">{algo.full}</span>
                </div>
                <span className={`rounded-full border px-2 py-0.5 font-mono text-[10px] ${colorMap[algo.color]} ${labelColorMap[algo.color]}`}>
                  {algo.complexity}
                </span>
              </div>
              <div className="space-y-1.5 text-xs text-slate-400">
                <div><span className="font-mono text-slate-500 mr-2">struct</span>{algo.structure}</div>
                <div><span className="font-mono text-slate-500 mr-2">pesos</span>{algo.weights}</div>
                <div><span className="font-mono text-slate-500 mr-2">ciclos</span>{algo.cycles}</div>
              </div>
              <p className="mt-3 text-xs text-slate-300 leading-relaxed border-t border-white/5 pt-3">{algo.problem}</p>
            </SpotlightCard>
          ))}
        </div>
      </FadeContent>

      <FadeContent duration={700} delay={100}>
        <BlurText text="BFS a partir de REC — Camadas" className="mb-6 text-xl font-semibold text-white" animateBy="words" delay={80} />
        <div className="space-y-3">
          {BFS_LAYERS.map(layer => (
            <SpotlightCard key={layer.layer} className="p-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/20 border border-cyan-500/30 font-mono text-sm font-bold text-cyan-300">
                  {layer.layer}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-slate-400">{layer.desc}</span>
                    <span className="rounded-full bg-white/10 px-2 py-0.5 font-mono text-[10px] text-slate-300">{layer.count} nó{layer.count !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {layer.nodes.map(n => (
                      <span key={n} className="rounded bg-cyan-500/10 px-2 py-0.5 font-mono text-xs text-cyan-300">{n}</span>
                    ))}
                  </div>
                </div>
              </div>
            </SpotlightCard>
          ))}
        </div>
        <p className="mt-3 text-xs text-slate-500 font-mono">Diâmetro = 3 · efeito "mundo pequeno" promovido pelos hubs GRU e BSB</p>
      </FadeContent>

      <FadeContent duration={700} delay={150}>
        <BlurText text="Comparativo dos Algoritmos" className="mb-6 text-xl font-semibold text-white" animateBy="words" delay={80} />
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-cyan-950/40">
                <th className="px-4 py-3 text-left font-mono text-cyan-400">Característica</th>
                <th className="px-4 py-3 text-center font-mono text-cyan-400">BFS</th>
                <th className="px-4 py-3 text-center font-mono text-blue-400">DFS</th>
                <th className="px-4 py-3 text-center font-mono text-emerald-400">Dijkstra</th>
                <th className="px-4 py-3 text-center font-mono text-violet-400">Bellman-Ford</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((row, i) => (
                <tr key={row.feature} className={i % 2 === 0 ? 'bg-white/[0.02]' : ''}>
                  <td className="px-4 py-2.5 text-slate-300">{row.feature}</td>
                  <td className="px-4 py-2.5 text-center text-slate-400">{row.bfs}</td>
                  <td className="px-4 py-2.5 text-center text-slate-400">{row.dfs}</td>
                  <td className="px-4 py-2.5 text-center text-slate-400">{row.dijk}</td>
                  <td className="px-4 py-2.5 text-center text-slate-400">{row.bf}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-[10px] text-slate-500 font-mono">* Tempos medidos no dataset portuário (1.452 nós · 8.973 arestas)</p>
      </FadeContent>
    </div>
  );
}

export default function GrafosPage() {
  const [activeTab, setActiveTab] = useState(() => {
    const tab = new URLSearchParams(window.location.search).get('tab');
    return tab && TABS.some(t => t.id === tab) ? tab : 'nos-arestas';
  });

  const handleTabChange = (id: string) => {
    setActiveTab(id);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', id);
    window.history.replaceState({}, '', url.toString());
  };

  return (
    <ArticleLayout
      title="Grafos"
      subtitle="Definição formal, propriedades estruturais e algoritmos implementados do zero"
    >
      <ArticleTabs tabs={TABS} active={activeTab} onChange={handleTabChange} />
      {activeTab === 'nos-arestas' && <NosArestasTab />}
      {activeTab === 'algoritmos'  && <AlgoritmosTab />}
    </ArticleLayout>
  );
}
