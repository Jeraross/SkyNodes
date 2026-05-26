import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import OverviewPanel from './OverviewPanel';
import RoutesPanel from './RoutesPanel';
import AlgorithmsPanel from './AlgorithmsPanel';
import CentralityPanel from './CentralityPanel';
import RegionsPanel from './RegionsPanel';
import type { ModalType, FlightSimulation } from '../../types';
import type { GraphMetrics } from '../../lib/graph/graphMetrics';
import type { BfsLayersResult } from '../../lib/graph/bfsLayers';

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
  bfsResult: BfsLayersResult;
  onHighlightRoutes: (ids: string[]) => void;
  simulation: FlightSimulation;
  onSetReady: (path: string[], routeIds: string[], cost?: number) => void;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onRestart: () => void;
  onClear: () => void;
  onSetSpeed: (s: number) => void;
}

export default function DashboardModal({
  activeModal, onClose, metrics, bfsResult, onHighlightRoutes,
  simulation, onSetReady, onStart, onPause, onResume, onRestart, onClear, onSetSpeed,
}: Props) {
  return (
    <Dialog open={activeModal !== null} onOpenChange={open => { if (!open) onClose(); }}>
      <DialogContent
        className="w-[800px] max-w-[calc(100vw-2rem)]"
        contentClassName="max-h-[90vh] overflow-y-auto bg-slate-950/95 text-white backdrop-blur-2xl"
        contentStyle={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(34,211,238,0.3) transparent' }}
      >
        <DialogHeader>
          <DialogTitle className="text-cyan-100">
            {activeModal ? titles[activeModal] : ''}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-2">
          {activeModal === 'overview' && <OverviewPanel metrics={metrics} />}
          {activeModal === 'routes' && <RoutesPanel />}
          {activeModal === 'algorithms' && (
            <AlgorithmsPanel
              bfsResult={bfsResult}
              onHighlightRoutes={onHighlightRoutes}
              simulation={simulation}
              onSetReady={onSetReady}
              onStart={onStart}
              onPause={onPause}
              onResume={onResume}
              onRestart={onRestart}
              onClear={onClear}
              onSetSpeed={onSetSpeed}
            />
          )}
          {activeModal === 'centrality' && <CentralityPanel metrics={metrics} />}
          {activeModal === 'regions' && <RegionsPanel metrics={metrics} />}
        </div>
      </DialogContent>
    </Dialog>
  );
}
