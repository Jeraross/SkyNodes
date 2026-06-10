import SplitText from '@reactbits/SplitText/SplitText';

interface Props {
  onEnterBrazil: () => void;
}

export default function GlobeHeroOverlay({ onEnterBrazil }: Props) {
  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-start justify-center px-5 sm:px-12 md:px-20">
      <div className="pointer-events-auto max-w-3xl">
        <p className="mb-3 font-mono text-[10px] sm:text-xs uppercase tracking-[0.25em] text-cyan-400">
          Flight Graph Control — SkyNodes
        </p>
        <SplitText
          text="Visualize rotas aéreas como uma rede viva de grafos"
          className="max-w-3xl text-left text-2xl sm:text-4xl font-bold leading-tight text-white md:text-6xl"
          tag="h1"
          splitType="words"
          delay={65}
          duration={0.7}
          ease="power3.out"
          from={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
          to={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          textAlign="left"
        />
        <p className="mt-3 max-w-xl text-xs sm:text-sm text-slate-400 md:mt-4">
          Explore a malha aérea brasileira como um grafo interativo. Aplique BFS, DFS, Dijkstra
          e Bellman-Ford diretamente no globo 3D.
        </p>
        <button
          onClick={onEnterBrazil}
          className="mt-6 md:mt-8 rounded-lg border border-cyan-500/50 bg-cyan-500/10 px-5 py-2.5 sm:px-6 sm:py-3 text-sm font-semibold text-cyan-200 transition-all hover:bg-cyan-500/20 hover:text-white focus:outline-none"
        >
          Analisar Brasil →
        </button>
      </div>
    </div>
  );
}
