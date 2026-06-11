import { useState } from 'react';
import ArticleLayout from '../components/ui/ArticleLayout';
import ArticleTabs from '../components/ui/ArticleTabs';
import FadeContent from '@reactbits/FadeContent/FadeContent';
import SpotlightCard from '@reactbits/SpotlightCard/SpotlightCard';
import BlurText from '@reactbits/BlurText/BlurText';
import Counter from '@reactbits/Counter/Counter';
import { airports, type Airport } from '../data/airports';
import { routes, type Route } from '../data/routes';

const TABS = [
  { id: 'aeroportos', label: 'Aeroportos' },
  { id: 'rotas',      label: 'Rotas'      },
];

const REGION_ORDER = ['Norte', 'Nordeste', 'Sudeste', 'Sul', 'Centro-Oeste'] as const;
const HUBS = new Set(['GRU', 'BSB', 'GIG']);

const DIJKSTRA_PAIRS = [
  { from: 'REC', to: 'POA', cost: 6.0, path: 'REC → GRU → POA',       required: true  },
  { from: 'MAO', to: 'GRU', cost: 3.0, path: 'MAO → GRU',             required: true  },
  { from: 'FOR', to: 'CWB', cost: 6.0, path: 'FOR → GRU → CWB',       required: false },
  { from: 'BEL', to: 'GIG', cost: 5.5, path: 'BEL → MAO → GRU → GIG', required: false },
  { from: 'THE', to: 'BSB', cost: 3.0, path: 'THE → BSB',             required: false },
  { from: 'NAT', to: 'FLN', cost: 7.5, path: 'NAT → REC → GRU → FLN', required: false },
  { from: 'RBR', to: 'SSA', cost: 7.5, path: 'RBR → MAO → GRU → SSA', required: false },
];

const TYPE_LABELS: Record<string, string> = {
  regional:       'Regional',
  hub:            'Hub',
  inter_regional: 'Inter-Regional',
};

const TYPE_COLORS: Record<string, string> = {
  regional:       'bg-cyan-500/15 text-cyan-300',
  hub:            'bg-blue-500/15 text-blue-300',
  inter_regional: 'bg-violet-500/15 text-violet-300',
};

function AeroportosTab() {
  const byRegion = REGION_ORDER.map(r => ({
    region: r,
    items: airports.filter(a => a.region === r),
  }));

  return (
    <div className="space-y-12">
      <FadeContent duration={600}>
        <div className="grid grid-cols-3 gap-4 md:grid-cols-5">
          {[
            { label: 'Aeroportos', value: 20 },
            { label: 'Regiões',    value: 5  },
          ].map(({ label, value }) => (
            <SpotlightCard key={label} className="p-5 text-center">
              <div className="flex justify-center mb-1">
                <Counter value={value} fontSize={36} gradientFrom="#020617" textColor="#ffffff" fontWeight="bold" />
              </div>
              <div className="text-xs text-slate-400">{label}</div>
            </SpotlightCard>
          ))}
          <SpotlightCard className="p-5 text-center">
            <div className="text-3xl font-bold text-white mb-1">5.0</div>
            <div className="text-xs text-slate-400">Grau médio</div>
          </SpotlightCard>
          <SpotlightCard className="p-5 text-center">
            <div className="text-3xl font-bold text-white mb-1">11</div>
            <div className="text-xs text-slate-400">Grau máx (GRU)</div>
          </SpotlightCard>
          <SpotlightCard className="p-5 text-center">
            <div className="text-3xl font-bold text-white mb-1">1</div>
            <div className="text-xs text-slate-400">Grau mín (GYN)</div>
          </SpotlightCard>
        </div>
      </FadeContent>

      {byRegion.map(({ region, items }, ri) => (
        <FadeContent key={region} duration={700} delay={ri * 80}>
          <div>
            <BlurText text={region} className="mb-4 text-lg font-semibold text-white" animateBy="words" delay={60} />
            <div className="overflow-hidden rounded-2xl border border-cyan-500/15">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-cyan-950/30">
                    <th className="px-4 py-2.5 text-left font-mono text-xs text-cyan-400">IATA</th>
                    <th className="px-4 py-2.5 text-left font-mono text-xs text-cyan-400">Aeroporto</th>
                    <th className="px-4 py-2.5 text-left font-mono text-xs text-cyan-400">Cidade</th>
                    <th className="px-4 py-2.5 text-left font-mono text-xs text-cyan-400">UF</th>
                    <th className="px-4 py-2.5 text-center font-mono text-xs text-cyan-400">Hub</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((a: Airport, i) => (
                    <tr key={a.id} className={i % 2 === 0 ? 'bg-white/[0.02]' : ''}>
                      <td className="px-4 py-2.5 font-mono font-semibold text-cyan-300">{a.id}</td>
                      <td className="px-4 py-2.5 text-slate-300 text-xs max-w-[240px] truncate">{a.name}</td>
                      <td className="px-4 py-2.5 text-slate-400 text-xs">{a.city}</td>
                      <td className="px-4 py-2.5 text-slate-500 text-xs font-mono">{a.state}</td>
                      <td className="px-4 py-2.5 text-center">
                        {HUBS.has(a.id)
                          ? <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[10px] font-semibold text-cyan-300">HUB</span>
                          : <span className="text-slate-600">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </FadeContent>
      ))}
    </div>
  );
}

function RotasTab() {
  const [filter, setFilter] = useState<string>('all');

  const filteredRoutes = filter === 'all'
    ? routes
    : routes.filter((r: Route) => r.type === filter);

  const counts = {
    all:            routes.length,
    regional:       routes.filter((r: Route) => r.type === 'regional').length,
    hub:            routes.filter((r: Route) => r.type === 'hub').length,
    inter_regional: routes.filter((r: Route) => r.type === 'inter_regional').length,
  };

  return (
    <div className="space-y-12">
      <FadeContent duration={600}>
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total de rotas',    value: 50,  sub: 'arestas'   },
            { label: 'Peso mínimo',       value: 1.0, sub: 'intra-hub' },
          ].map(({ label, value, sub }) => (
            <SpotlightCard key={label} className="p-5 col-span-2 text-center">
              <div className="text-3xl font-bold text-white mb-1">{value}</div>
              <div className="text-xs text-slate-400">{label}</div>
              <div className="text-[10px] text-slate-600 font-mono">{sub}</div>
            </SpotlightCard>
          ))}
          <SpotlightCard className="p-5 col-span-2 text-center">
            <div className="text-3xl font-bold text-white mb-1">3.5</div>
            <div className="text-xs text-slate-400">Peso máximo</div>
            <div className="text-[10px] text-slate-600 font-mono">inter-regional s/ hub</div>
          </SpotlightCard>
        </div>
      </FadeContent>

      <FadeContent duration={700} delay={80}>
        <div>
          <BlurText text="Tabela de Adjacências" className="mb-4 text-xl font-semibold text-white" animateBy="words" delay={80} />

          {/* Filter chips */}
          <div className="mb-4 flex flex-wrap gap-2">
            {(['all', 'regional', 'hub', 'inter_regional'] as const).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setFilter(t)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  filter === t
                    ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-500/50'
                    : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'
                }`}
              >
                {t === 'all' ? 'Todas' : TYPE_LABELS[t]}
                <span className="ml-1.5 font-mono text-[10px] opacity-60">{counts[t]}</span>
              </button>
            ))}
          </div>

          <div className="overflow-hidden rounded-2xl border border-cyan-500/15">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-cyan-950/40">
                  <th className="px-4 py-2.5 text-left font-mono text-cyan-400">Origem</th>
                  <th className="px-4 py-2.5 text-left font-mono text-cyan-400">Destino</th>
                  <th className="px-4 py-2.5 text-left font-mono text-cyan-400">Tipo</th>
                  <th className="px-4 py-2.5 text-center font-mono text-cyan-400">Peso</th>
                </tr>
              </thead>
              <tbody>
                {filteredRoutes.map((r: Route, i) => (
                  <tr key={r.id} className={i % 2 === 0 ? 'bg-white/[0.02]' : ''}>
                    <td className="px-4 py-2 font-mono text-cyan-300">{r.from}</td>
                    <td className="px-4 py-2 font-mono text-cyan-300">{r.to}</td>
                    <td className="px-4 py-2">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${TYPE_COLORS[r.type]}`}>
                        {TYPE_LABELS[r.type]}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-center font-mono text-slate-300">{r.weight.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </FadeContent>

      <FadeContent duration={700} delay={150}>
        <SpotlightCard className="p-6 md:p-8">
          <h3 className="mb-2 font-mono text-xs uppercase tracking-widest text-cyan-400">Caminhos Mínimos — Dijkstra</h3>
          <p className="mb-4 text-xs text-slate-400">7 pares calculados com Dijkstra. Os 2 primeiros são obrigatórios pela especificação do projeto.</p>
          <div className="overflow-hidden rounded-xl border border-white/10">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-cyan-950/30 font-mono text-cyan-400">
                  <th className="px-4 py-2.5 text-left">Origem</th>
                  <th className="px-4 py-2.5 text-left">Destino</th>
                  <th className="px-4 py-2.5 text-left">Caminho</th>
                  <th className="px-4 py-2.5 text-center">Custo</th>
                  <th className="px-4 py-2.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {DIJKSTRA_PAIRS.map((p, i) => (
                  <tr key={i} className={`${i % 2 === 0 ? 'bg-white/[0.02]' : ''} ${p.required ? 'border-l-2 border-cyan-500/50' : ''}`}>
                    <td className="px-4 py-2.5 font-mono text-cyan-300">{p.from}</td>
                    <td className="px-4 py-2.5 font-mono text-cyan-300">{p.to}</td>
                    <td className="px-4 py-2.5 text-slate-300 font-mono">{p.path}</td>
                    <td className="px-4 py-2.5 text-center font-bold text-white">{p.cost.toFixed(1)}</td>
                    <td className="px-4 py-2.5 text-center">
                      {p.required
                        ? <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[10px] font-semibold text-cyan-300">Obrigatório</span>
                        : <span className="text-slate-600">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SpotlightCard>
      </FadeContent>
    </div>
  );
}

export default function DadosPage() {
  const [activeTab, setActiveTab] = useState(() => {
    const tab = new URLSearchParams(window.location.search).get('tab');
    return tab && TABS.some(t => t.id === tab) ? tab : 'aeroportos';
  });

  const handleTabChange = (id: string) => {
    setActiveTab(id);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', id);
    window.history.replaceState({}, '', url.toString());
  };

  return (
    <ArticleLayout
      title="Dados"
      subtitle="Dataset da malha aérea brasileira — 20 aeroportos, 50 rotas, 5 regiões"
    >
      <ArticleTabs tabs={TABS} active={activeTab} onChange={handleTabChange} />
      {activeTab === 'aeroportos' && <AeroportosTab />}
      {activeTab === 'rotas'      && <RotasTab />}
    </ArticleLayout>
  );
}
