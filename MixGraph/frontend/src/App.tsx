import { useState } from 'react';
import ClickSpark from '@reactbits/ClickSpark/ClickSpark';
import Particles from '@reactbits/Particles/Particles';
import FlightGlobe from './components/globe/FlightGlobe';
import GlobeHeroOverlay from './components/globe/GlobeHeroOverlay';
import GlobeStatusOverlay from './components/globe/GlobeStatusOverlay';
import GlobeSidebar from './components/navigation/GlobeSidebar';
import SimulationSidebar from './components/navigation/SimulationSidebar';
import TopControlNav from './components/navigation/TopControlNav';
import DashboardModal from './components/dashboard/DashboardModal';
import { airports } from './data/airports';
import { routes } from './data/routes';
import { computeMetrics } from './lib/graph/graphMetrics';
import { useFlightSimulation } from './hooks/useFlightSimulation';
import type { GlobeMode, ModalType } from './types';

const metrics = computeMetrics(airports, routes);

export default function App() {
  const [mode, setMode] = useState<GlobeMode>('orbit');
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [highlightedRouteIds, setHighlightedRouteIds] = useState<string[]>([]);

  const { simulation, planePosition, setReady, start, pause, resume, restart, clear, setSpeed } =
    useFlightSimulation();

  const handleEnterBrazil = () => setMode('brazil-locked');

  const handleHighlightRoutes = (ids: string[]) => {
    setHighlightedRouteIds(ids);
    setMode('analysis');
  };

  const handleSetReady = (path: string[], routeIds: string[], cost?: number) => {
    setHighlightedRouteIds(routeIds);
    setMode('analysis');
    setReady(path, routeIds, cost);
  };

  const currentRouteId = simulation.routeIds[simulation.currentSegmentIndex] ?? '';

  return (
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

        <div className="absolute inset-0 z-10">
          <FlightGlobe
            mode={mode}
            highlightedRouteIds={highlightedRouteIds}
            currentRouteId={currentRouteId}
            simulatedPlanePosition={planePosition}
            onEnterBrazil={handleEnterBrazil}
          />
        </div>

        {mode === 'orbit' && <GlobeHeroOverlay onEnterBrazil={handleEnterBrazil} />}
        <GlobeStatusOverlay mode={mode} />
        <TopControlNav onEnterBrazil={handleEnterBrazil} />
        {mode !== 'orbit' && <GlobeSidebar onOpenModal={setActiveModal} />}
        {mode !== 'orbit' && (
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
          onHighlightRoutes={handleHighlightRoutes}
          simulation={simulation}
          onSetReady={handleSetReady}
          onStart={start}
          onPause={pause}
          onResume={resume}
          onRestart={restart}
          onClear={clear}
          onSetSpeed={setSpeed}
        />
      </main>
    </ClickSpark>
  );
}
