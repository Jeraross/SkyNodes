import { useState } from 'react';
import ArticleLayout from '../components/ui/ArticleLayout';
import ArticleTabs from '../components/ui/ArticleTabs';
import FadeContent from '@reactbits/FadeContent/FadeContent';
import SpotlightCard from '@reactbits/SpotlightCard/SpotlightCard';
import ScrollReveal from '@reactbits/ScrollReveal/ScrollReveal';
import BlurText from '@reactbits/BlurText/BlurText';
import Counter from '@reactbits/Counter/Counter';
import Stepper, { Step } from '@reactbits/Stepper/Stepper';

const TABS = [
  { id: 'objetivo',       label: 'Objetivo'       },
  { id: 'como-funciona',  label: 'Como funciona'  },
];

const GRAPH_TYPES = [
  {
    tipo: 'Não-direcionado',
    def: '{ u, v } = { v, u } — a rota de A→B é a mesma de B→A',
    check: true,
  },
  {
    tipo: 'Ponderado',
    def: 'w: E → ℝ₊ — cada aresta tem um custo real positivo',
    check: true,
  },
  {
    tipo: 'Conexo',
    def: '∀ u, v ∈ V, ∃ caminho u ↝ v — toda cidade alcança toda cidade',
    check: true,
  },
];

const HUBS = [
  { iata: 'GRU', cidade: 'São Paulo',        grau: 11, papel: 'Hub principal — maior grau, intermediador central' },
  { iata: 'BSB', cidade: 'Brasília',         grau: 8,  papel: 'Hub secundário — conecta Centro-Oeste ao país' },
  { iata: 'REC', cidade: 'Recife',           grau: 7,  papel: 'Maior grau do Nordeste' },
  { iata: 'SSA', cidade: 'Salvador',         grau: 7,  papel: 'Segundo maior do Nordeste' },
  { iata: 'GYN', cidade: 'Goiânia',          grau: 1,  papel: 'Grau mínimo — conectado apenas a BSB' },
];

const RULES = [
  {
    title: 'Regra 1 — Conexão Regional',
    subtitle: 'tipo: regional · peso_base = 1.0',
    body: 'Todo aeroporto conecta-se a todos os outros da mesma região, formando um clique completo K|V_r|. Os 5 subgrafos regionais têm densidade δ = 1.000.',
    example: '{ u, v } ∈ E₁  ⟺  regiao(u) = regiao(v)',
  },
  {
    title: 'Regra 2 — Hub Nacional',
    subtitle: 'tipo: hub · peso_base = 2.0',
    body: 'Os hubs nacionais GRU, BSB e GIG conectam aeroportos de outras regiões diretamente a si. Isso garante que voos entre regiões distantes passem por um hub eficiente.',
    example: 'GRU ← MAO, REC, SSA, FOR, POA, CWB, FLN\nBSB ← MAO, NAT, JPA, THE',
  },
  {
    title: 'Regra 3 — Pontes Inter-Regionais',
    subtitle: 'tipo: inter_regional · peso_base = 2.5',
    body: '4 arestas fixas cobrem lacunas de conectividade não resolvidas pelas regras anteriores: BSB↔BEL, BSB↔REC, BSB↔POA, GIG↔SSA.',
    example: 'E₃ = { BSB↔BEL, BSB↔REC, BSB↔POA, GIG↔SSA }',
  },
];

const WEIGHT_COMPONENTS = [
  { comp: 'peso_base', desc: 'Determinado pelo tipo da aresta (1.0 / 2.0 / 2.5)', range: '1.0 → 2.5' },
  { comp: 'pen_regiao', desc: '1.0 se regiões diferentes · 0.0 se mesma região', range: '0.0 → 1.0' },
  { comp: 'pen_hub',   desc: '0.5 se nenhum extremo é hub · 0.0 se um é hub', range: '0.0 → 0.5' },
];

function ObjetivoTab() {
  return (
    <div className="space-y-12">
      {/* Stats */}
      <FadeContent duration={600}>
        <div className="grid grid-cols-3 gap-6">
          {[
            { label: 'Aeroportos', value: 20, unit: 'nós' },
            { label: 'Rotas',      value: 50, unit: 'arestas' },
          ].map(({ label, value, unit }) => (
            <SpotlightCard key={label} className="p-6 text-center">
              <div className="mb-1 font-mono text-[10px] uppercase tracking-widest text-cyan-400">{unit}</div>
              <div className="flex justify-center">
                <Counter value={value} fontSize={40} gradientFrom="#020617" textColor="#ffffff" fontWeight="bold" />
              </div>
              <div className="mt-1 text-sm text-slate-300">{label}</div>
            </SpotlightCard>
          ))}
          <SpotlightCard className="p-6 text-center">
            <div className="mb-1 font-mono text-[10px] uppercase tracking-widest text-cyan-400">densidade</div>
            <div className="flex items-center justify-center text-4xl font-bold text-white">0.2632</div>
            <div className="mt-1 text-sm text-slate-300">δ(G) global</div>
          </SpotlightCard>
        </div>
      </FadeContent>

      {/* Definição */}
      <FadeContent duration={700} delay={100}>
        <ScrollReveal
          containerClassName="max-w-3xl"
          textClassName="text-slate-300"
          enableBlur
        >
          O SkyNodes modela a rede de aeroportos brasileiros como um grafo G = (V, E, w): um grafo não-direcionado, simples, ponderado e conexo com 20 vértices e 50 arestas. Cada vértice representa um aeroporto identificado pelo seu código IATA, e cada aresta representa uma rota aérea com peso calculado por uma fórmula híbrida que combina tipo de conexão, penalidade inter-regional e bônus de hub.
        </ScrollReveal>
      </FadeContent>

      {/* Tipo de grafo */}
      <FadeContent duration={700} delay={150}>
        <div>
          <BlurText
            text="Classificação do Grafo"
            className="mb-6 text-xl font-semibold text-white"
            animateBy="words"
            delay={80}
          />
          <div className="grid gap-4 md:grid-cols-3">
            {GRAPH_TYPES.map(({ tipo, def }) => (
              <SpotlightCard key={tipo} className="p-5">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-mono text-xs text-cyan-400 uppercase tracking-wider">{tipo}</span>
                  <span className="text-green-400 text-sm">{'✓'}</span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">{def}</p>
              </SpotlightCard>
            ))}
          </div>
        </div>
      </FadeContent>

      {/* Hubs */}
      <FadeContent duration={700} delay={200}>
        <div>
          <BlurText
            text="Vértices de Alta Conectividade"
            className="mb-6 text-xl font-semibold text-white"
            animateBy="words"
            delay={80}
          />
          <div className="overflow-hidden rounded-2xl border border-cyan-500/15">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-cyan-950/40">
                  <th className="px-4 py-3 text-left font-mono text-xs uppercase tracking-wider text-cyan-400">IATA</th>
                  <th className="px-4 py-3 text-left font-mono text-xs uppercase tracking-wider text-cyan-400">Cidade</th>
                  <th className="px-4 py-3 text-center font-mono text-xs uppercase tracking-wider text-cyan-400">Grau</th>
                  <th className="px-4 py-3 text-left font-mono text-xs uppercase tracking-wider text-cyan-400">Papel</th>
                </tr>
              </thead>
              <tbody>
                {HUBS.map((h, i) => (
                  <tr key={h.iata} className={i % 2 === 0 ? 'bg-white/[0.02]' : ''}>
                    <td className="px-4 py-3 font-mono font-semibold text-cyan-300">{h.iata}</td>
                    <td className="px-4 py-3 text-slate-300">{h.cidade}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="rounded-full bg-cyan-500/15 px-2 py-0.5 text-xs font-semibold text-cyan-300">{h.grau}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{h.papel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </FadeContent>
    </div>
  );
}

function ComoFuncionaTab() {
  return (
    <div className="space-y-12">
      <FadeContent duration={600}>
        <BlurText
          text="Construção da Malha Aérea"
          className="text-2xl font-bold text-white"
          animateBy="words"
          delay={80}
        />
        <p className="mt-3 text-sm text-slate-400 max-w-2xl">
          As 50 arestas do grafo são geradas por 3 regras hierárquicas aplicadas sobre os 20 aeroportos. Cada regra define quais pares se conectam e com qual peso-base.
        </p>
      </FadeContent>

      <FadeContent duration={700} delay={100}>
        <Stepper>
          {RULES.map(rule => (
            <Step key={rule.title}>
              <div className="pb-2">
                <h3 className="text-base font-semibold text-white mb-1">{rule.title}</h3>
                <p className="text-xs font-mono text-cyan-400 mb-3">{rule.subtitle}</p>
                <p className="text-sm text-slate-300 leading-relaxed mb-3">{rule.body}</p>
                <div className="rounded-lg bg-black/30 border border-white/10 px-4 py-3 font-mono text-xs text-cyan-300 whitespace-pre">
                  {rule.example}
                </div>
              </div>
            </Step>
          ))}
        </Stepper>
      </FadeContent>

      <FadeContent duration={700} delay={150}>
        <SpotlightCard className="p-6 md:p-8">
          <h3 className="mb-4 font-mono text-xs uppercase tracking-widest text-cyan-400">Fórmula Híbrida de Pesos</h3>
          <div className="mb-6 rounded-xl bg-black/40 px-6 py-4 font-mono text-sm text-white text-center">
            w(u, v) = peso_base + pen_regiao + pen_hub
          </div>
          <div className="overflow-hidden rounded-xl border border-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-cyan-950/30">
                  <th className="px-4 py-2 text-left font-mono text-xs text-cyan-400">Componente</th>
                  <th className="px-4 py-2 text-left text-xs text-slate-400">Descrição</th>
                  <th className="px-4 py-2 text-right font-mono text-xs text-cyan-400">Range</th>
                </tr>
              </thead>
              <tbody>
                {WEIGHT_COMPONENTS.map((c, i) => (
                  <tr key={c.comp} className={i % 2 === 0 ? 'bg-white/[0.02]' : ''}>
                    <td className="px-4 py-2 font-mono text-cyan-300 text-xs">{c.comp}</td>
                    <td className="px-4 py-2 text-slate-300 text-xs">{c.desc}</td>
                    <td className="px-4 py-2 text-right font-mono text-xs text-slate-400">{c.range}</td>
                  </tr>
                ))}
                <tr className="border-t border-white/10 bg-cyan-950/20">
                  <td className="px-4 py-2 font-mono font-bold text-white text-xs">w(u, v)</td>
                  <td className="px-4 py-2 text-slate-300 text-xs">Peso final da aresta</td>
                  <td className="px-4 py-2 text-right font-mono font-bold text-cyan-300 text-xs">1.0 → 3.5</td>
                </tr>
              </tbody>
            </table>
          </div>
        </SpotlightCard>
      </FadeContent>

      <FadeContent duration={700} delay={200}>
        <ScrollReveal containerClassName="max-w-3xl" textClassName="text-slate-300" enableBlur>
          A conectividade global do grafo é garantida pela combinação das três regras. A Regra 1 torna cada região um componente conexo. A Regra 2 conecta a maioria dos aeroportos regionais aos hubs GRU e BSB. A Regra 3 introduz pontes que cobrem os casos residuais, garantindo que todos os 20 aeroportos sejam mutuamente alcançáveis.
        </ScrollReveal>
      </FadeContent>
    </div>
  );
}

export default function ProjetoPage() {
  const [activeTab, setActiveTab] = useState(() => {
    const tab = new URLSearchParams(window.location.search).get('tab');
    return tab && TABS.some(t => t.id === tab) ? tab : 'objetivo';
  });

  const handleTabChange = (id: string) => {
    setActiveTab(id);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', id);
    window.history.replaceState({}, '', url.toString());
  };

  return (
    <ArticleLayout
      title="Projeto"
      subtitle="Modelagem da malha aérea brasileira como grafo ponderado e conexo"
    >
      <ArticleTabs tabs={TABS} active={activeTab} onChange={handleTabChange} />
      {activeTab === 'objetivo'      && <ObjetivoTab />}
      {activeTab === 'como-funciona' && <ComoFuncionaTab />}
    </ArticleLayout>
  );
}
