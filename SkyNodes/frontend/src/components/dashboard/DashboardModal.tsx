import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Maximize2, Minimize2 } from 'lucide-react';
import { ContainerScroll } from '@/components/ui/container-scroll-animation';
import OverviewPanel from './OverviewPanel';
import RoutesPanel from './RoutesPanel';
import CentralityPanel from './CentralityPanel';
import RegionsPanel from './RegionsPanel';
import type { ModalType } from '../../types';
import type { GraphMetrics } from '../../lib/graph/graphMetrics';

const PIXEL = { fontFamily: "'Press Start 2P', monospace" };

const TITLES: Record<NonNullable<ModalType>, string> = {
  overview: 'VISAO GERAL',
  routes: 'ROTAS AEREAS',
  centrality: 'CENTRALIDADE',
  regions: 'ANALISE REGIONAL',
};

interface Props {
  activeModal: ModalType;
  onClose: () => void;
  metrics: GraphMetrics;
}

export default function DashboardModal({ activeModal, onClose, metrics }: Props) {
  const [expanded, setExpanded] = useState(false);
  const open = activeModal !== null;

  const handleClose = () => {
    setExpanded(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="dm-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/75 backdrop-blur-sm"
          onMouseDown={(e) => { if (e.target === e.currentTarget) handleClose(); }}
        >
          <motion.div
            layout
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className={`group ${
              expanded
                ? 'fixed inset-4 flex flex-col'
                : 'w-[920px] max-w-[calc(100vw-2rem)] h-[700px] max-h-[calc(100vh-2rem)] flex flex-col'
            }`}
          >
            <ContainerScroll
              titleComponent={
                <div className="flex items-center gap-3">
                  <p style={PIXEL} className="text-cyan-400 text-[11px] tracking-widest mb-1">
                    {activeModal ? TITLES[activeModal] : ''}
                  </p>
                  <button
                    onClick={() => setExpanded(e => !e)}
                    style={PIXEL}
                    className="mb-1 text-zinc-500 hover:text-cyan-400 transition-colors lg:opacity-0 lg:group-hover:opacity-100"
                    title={expanded ? 'Restaurar' : 'Expandir'}
                  >
                    {expanded ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                  </button>
                </div>
              }
            >
              <motion.div
                key={activeModal}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="h-full overflow-y-auto"
                style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(34,211,238,0.2) transparent' }}
              >
                <div className="p-6">
                  {activeModal === 'overview' && <OverviewPanel metrics={metrics} />}
                  {activeModal === 'routes' && <RoutesPanel />}
                  {activeModal === 'centrality' && <CentralityPanel metrics={metrics} />}
                  {activeModal === 'regions' && <RegionsPanel metrics={metrics} />}
                </div>
              </motion.div>
            </ContainerScroll>
          </motion.div>

          <button
            onClick={handleClose}
            style={PIXEL}
            className="mt-4 text-[8px] text-zinc-500 hover:text-cyan-400 transition-colors tracking-widest"
          >
            [ FECHAR ]
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
