import { useState } from 'react';
import { useLocation } from 'wouter';
import ClickSpark from '@reactbits/ClickSpark/ClickSpark';
import Particles from '@reactbits/Particles/Particles';
import IntroScreen from './components/IntroScreen';
import FlightGlobe from './components/globe/FlightGlobe';
import GlobeHeroOverlay from './components/globe/GlobeHeroOverlay';
import GraphView from './components/views/GraphView';
import MapView from './components/views/MapView';
import GlobeSidebar from './components/navigation/GlobeSidebar';
import MobileBottomDock from './components/navigation/MobileBottomDock';
import AlgorithmsSidebar from './components/navigation/AlgorithmsSidebar';
import SimulationSidebar from './components/navigation/SimulationSidebar';
import TopControlNav from './components/navigation/TopControlNav';
import { useIsMobile } from './hooks/useIsMobile';
import DashboardModal from './components/dashboard/DashboardModal';
import BenchmarkModal from './components/dashboard/BenchmarkModal';
import { airports } from './data/airports';
import { routes } from './data/routes';
import { buildGraph } from './lib/graph/buildGraph';
import { computeMetrics } from './lib/graph/graphMetrics';
import { useFlightSimulation } from './hooks/useFlightSimulation';
import type { GlobeMode, ModalType, ViewMode } from './types';

const graph = buildGraph(airports, routes);
const metrics = computeMetrics(airports, routes, graph);

export default function App() {
  const [, navigate] = useLocation();
  const [showIntro, setShowIntro] = useState(true);
  const [mode, setMode] = useState<GlobeMode>('orbit');
  const [viewMode, setViewMode] = useState<ViewMode>('globe');
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [algorithmsOpen, setAlgorithmsOpen] = useState(false);
  const [benchmarkOpen, setBenchmarkOpen] = useState(false);
  const [highlightedRouteIds, setHighlightedRouteIds] = useState<string[]>([]);
  const [highlightedPath, setHighlightedPath] = useState<string[]>([]);
  const [eiffelUnlocked, setEiffelUnlocked] = useState(false);

  const { simulation, planePosition, setReady, start, pause, resume, restart, clear, setSpeed } =
    useFlightSimulation();
  const isMobile = useIsMobile();

  const handleEnterBrazil = () => setMode('brazil-locked');

  const handleHighlightRoutes = (ids: string[]) => {
    setHighlightedRouteIds(ids);
    setMode('analysis');
  };

  const handleSetReady = (path: string[], routeIds: string[], cost?: number) => {
    setHighlightedRouteIds(routeIds);
    setHighlightedPath(path);
    setMode('analysis');
    setReady(path, routeIds, cost);
  };

  const currentRouteId = simulation.routeIds[simulation.currentSegmentIndex] ?? '';
  const showSidebars = viewMode !== 'globe' || mode !== 'orbit';

  return (
    <>
      {showIntro && <IntroScreen onDone={() => setShowIntro(false)} />}
    <ClickSpark sparkColor="#67e8f9" sparkSize={10} sparkRadius={18} sparkCount={8} duration={420}>
      <main className="relative h-screen w-full overflow-hidden bg-[#020617] text-white">
        <div className="pointer-events-none absolute inset-0 z-0 opacity-55">
          <Particles
            particleColors={['#67e8f9', '#38bdf8', '#ffffff']}
            particleCount={130}
            particleSpread={9}
            speed={0.04}
            particleBaseSize={70}
            sizeRandomness={0.8}
            alphaParticles={true}
            moveParticlesOnHover={false}
            disableRotation={false}
          />
        </div>

        {viewMode === 'globe' && (
          <div className="absolute inset-0 z-10">
            <FlightGlobe
              mode={mode}
              highlightedRouteIds={highlightedRouteIds}
              highlightedPath={highlightedPath}
              currentRouteId={currentRouteId}
              simulatedPlanePosition={planePosition}
              onEnterBrazil={handleEnterBrazil}
              eiffelUnlocked={eiffelUnlocked}
            />
          </div>
        )}
        {viewMode === 'graph' && (
          <GraphView
            highlightedRouteIds={highlightedRouteIds}
            dijkstraPaths={metrics.dijkstraPaths}
            metrics={metrics}
            egoByAirport={metrics.egoByAirport}
          />
        )}
        {viewMode === 'map' && <MapView highlightedRouteIds={highlightedRouteIds} planePosition={planePosition} />}

        {viewMode === 'globe' && mode === 'orbit' && <GlobeHeroOverlay onEnterBrazil={handleEnterBrazil} />}
        {!(viewMode === 'globe' && mode === 'orbit') && <TopControlNav viewMode={viewMode} onViewModeChange={setViewMode} />}
        {viewMode === 'globe' && (
          <button
            type="button"
            onClick={() => navigate('/game')}
            className={`fixed z-40 border-2 border-[#071018] bg-[#d7f04a] px-5 py-3 font-mono text-sm font-black text-[#071018] shadow-[5px_5px_0_rgba(0,0,0,0.45)] transition-transform hover:-translate-y-1 ${
              isMobile ? 'top-4 right-4' : 'bottom-36 right-4'
            }`}
          >
            AEROTALE
          </button>
        )}
        {showSidebars && !isMobile && (
          <GlobeSidebar
            algorithmsOpen={algorithmsOpen}
            benchmarkOpen={benchmarkOpen}
            onOpenModal={setActiveModal}
            onToggleAlgorithms={() => setAlgorithmsOpen(o => !o)}
            onToggleBenchmark={() => setBenchmarkOpen(o => !o)}
          />
        )}
        {showSidebars && isMobile && (
          <MobileBottomDock
            algorithmsOpen={algorithmsOpen}
            benchmarkOpen={benchmarkOpen}
            onOpenModal={setActiveModal}
            onToggleAlgorithms={() => setAlgorithmsOpen(o => !o)}
            onToggleBenchmark={() => setBenchmarkOpen(o => !o)}
          />
        )}
        <AlgorithmsSidebar
          open={algorithmsOpen && (viewMode !== 'globe' || simulation.status === 'idle')}
          simulation={simulation}
          onHighlightRoutes={handleHighlightRoutes}
          onSetReady={handleSetReady}
          onClose={() => setAlgorithmsOpen(false)}
        />
        {showSidebars && (
          <SimulationSidebar
            simulation={simulation}
            onStart={start}
            onPause={pause}
            onResume={resume}
            onRestart={restart}
            onClear={clear}
            onSetSpeed={setSpeed}
          />
        )}

        <DashboardModal
          activeModal={activeModal}
          onClose={() => setActiveModal(null)}
          metrics={metrics}
        />
        <BenchmarkModal
          open={benchmarkOpen}
          onClose={() => setBenchmarkOpen(false)}
          onEiffelUnlock={() => setEiffelUnlocked(true)}
        />
      </main>
    </ClickSpark>
    </>
  );
}
