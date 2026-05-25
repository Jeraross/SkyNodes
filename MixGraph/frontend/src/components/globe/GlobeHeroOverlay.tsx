import SplitText from '@reactbits/SplitText/SplitText';

interface Props {
  onEnterBrazil: () => void;
}

export default function GlobeHeroOverlay({ onEnterBrazil }: Props) {
  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-start justify-center px-12 md:px-20">
      <div className="pointer-events-auto max-w-3xl">
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.25em] text-cyan-400">
          Flight Graph Control — MixGraph
        </p>
        <SplitText
          text="Visualize rotas aéreas como uma rede viva de grafos"
          className="max-w-3xl text-left text-4xl font-bold leading-tight text-white md:text-6xl"
          tag="h1"
          splitType="words"
          delay={65}
          duration={0.7}
          ease="power3.out"
          from={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
          to={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          textAlign="left"
        />
        <p className="mt-4 max-w-xl text-slate-400">
          Explore a malha aérea brasileira como um grafo interativo. Aplique BFS, DFS, Dijkstra
          e Bellman-Ford diretamente no globo 3D.
        </p>
        <button
          onClick={onEnterBrazil}
          className="mt-8 rounded-lg border border-cyan-500/50 bg-cyan-500/10 px-6 py-3 font-semibold text-cyan-200 transition-all hover:bg-cyan-500/20 hover:text-white focus:outline-none"
        >
          Analisar Brasil →
        </button>
      </div>
    </div>
  );
}
