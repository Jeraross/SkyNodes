// src/components/dashboard/DashboardModal.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import OverviewPanel from './OverviewPanel';
import RoutesPanel from './RoutesPanel';
import AlgorithmsPanel from './AlgorithmsPanel';
import CentralityPanel from './CentralityPanel';
import RegionsPanel from './RegionsPanel';
import type { ModalType } from '../../types';
import type { GraphMetrics } from '../../lib/graph/graphMetrics';

const titles: Record<NonNullable<ModalType>, string> = {
  overview: 'Visão Geral',
  routes: 'Rotas Aéreas',
  algorithms: 'Algoritmos de Grafo',
  centrality: 'Centralidade',
  regions: 'Análise Regional',
};

interface Props {
  activeModal: ModalType;
  onClose: () => void;
  metrics: GraphMetrics;
  onHighlightRoutes: (ids: string[]) => void;
}

export default function DashboardModal({ activeModal, onClose, metrics, onHighlightRoutes }: Props) {
  return (
    <Dialog open={activeModal !== null} onOpenChange={open => { if (!open) onClose(); }}>
      <DialogContent className="max-h-[90vh] w-[800px] max-w-[calc(100vw-2rem)] overflow-y-auto border-slate-700/60 bg-slate-950/95 text-white backdrop-blur-2xl"
        style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(34,211,238,0.3) transparent' }}>
        <DialogHeader>
          <DialogTitle className="text-cyan-100">
            {activeModal ? titles[activeModal] : ''}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-2">
          {activeModal === 'overview' && <OverviewPanel metrics={metrics} />}
          {activeModal === 'routes' && <RoutesPanel />}
          {activeModal === 'algorithms' && <AlgorithmsPanel onHighlightRoutes={ids => { onHighlightRoutes(ids); onClose(); }} />}
          {activeModal === 'centrality' && <CentralityPanel metrics={metrics} />}
          {activeModal === 'regions' && <RegionsPanel metrics={metrics} />}
        </div>
      </DialogContent>
    </Dialog>
  );
}
