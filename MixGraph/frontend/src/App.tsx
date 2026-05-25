// src/App.tsx
import { useState } from 'react';
import ClickSpark from '@reactbits/ClickSpark/ClickSpark';
import Particles from '@reactbits/Particles/Particles';
import FlightGlobe from './components/globe/FlightGlobe';
import GlobeHeroOverlay from './components/globe/GlobeHeroOverlay';
import GlobeStatusOverlay from './components/globe/GlobeStatusOverlay';
import GlobeSidebar from './components/navigation/GlobeSidebar';
import TopControlNav from './components/navigation/TopControlNav';
import DashboardModal from './components/dashboard/DashboardModal';
import { airports } from './data/airports';
import { routes } from './data/routes';
import { computeMetrics } from './lib/graph/graphMetrics';
import type { GlobeMode, ModalType } from './types';

const metrics = computeMetrics(airports, routes);

export default function App() {
  const [mode, setMode] = useState<GlobeMode>('orbit');
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [highlightedRouteIds, setHighlightedRouteIds] = useState<string[]>([]);

  const handleEnterBrazil = () => {
    setMode('brazil-locked');
  };

  const handleHighlightRoutes = (ids: string[]) => {
    setHighlightedRouteIds(ids);
    setMode('analysis');
  };

  return (
    <ClickSpark sparkColor="#67e8f9" sparkSize={10} sparkRadius={18} sparkCount={8} duration={420}>
      <main className="relative h-screen w-full overflow-hidden bg-[#020617] text-white">
        {/* Background particles */}
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

        {/* Globe — z-10 */}
        <div className="absolute inset-0 z-10">
          <FlightGlobe
            mode={mode}
            highlightedRouteIds={highlightedRouteIds}
            onEnterBrazil={handleEnterBrazil}
          />
        </div>

        {/* Hero overlay — only in orbit mode — z-20 */}
        {mode === 'orbit' && (
          <GlobeHeroOverlay onEnterBrazil={handleEnterBrazil} />
        )}

        {/* Status overlay — always visible — z-20 */}
        <GlobeStatusOverlay mode={mode} />

        {/* Top nav — z-40 */}
        <TopControlNav onEnterBrazil={handleEnterBrazil} />

        {/* Sidebar — only after entering Brazil — z-50 */}
        {mode !== 'orbit' && (
          <GlobeSidebar onOpenModal={setActiveModal} />
        )}

        {/* Dashboard modal — z-60 (handled by Dialog portal) */}
        <DashboardModal
          activeModal={activeModal}
          onClose={() => setActiveModal(null)}
          metrics={metrics}
          onHighlightRoutes={handleHighlightRoutes}
        />
      </main>
    </ClickSpark>
  );
}
