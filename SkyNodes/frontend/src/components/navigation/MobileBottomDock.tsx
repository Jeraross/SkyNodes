import Dock from '@reactbits/Dock/Dock';
import { Radar, Route, Network, BarChart3, MapPinned, Gauge } from 'lucide-react';
import type { ModalType } from '../../types';

interface Props {
  algorithmsOpen: boolean;
  benchmarkOpen: boolean;
  onOpenModal: (m: ModalType) => void;
  onToggleAlgorithms: () => void;
  onToggleBenchmark: () => void;
}

export default function MobileBottomDock({
  algorithmsOpen, benchmarkOpen, onOpenModal, onToggleAlgorithms, onToggleBenchmark,
}: Props) {
  const items = [
    { icon: <Radar size={18} />,     label: 'Visão Geral',  onClick: () => onOpenModal('overview') },
    { icon: <Route size={18} />,     label: 'Rotas',        onClick: () => onOpenModal('routes') },
    { icon: <Network size={18} />,   label: 'Algoritmos',   onClick: onToggleAlgorithms, className: algorithmsOpen ? 'dock-item--active' : '' },
    { icon: <Gauge size={18} />,     label: 'Benchmark',    onClick: onToggleBenchmark,  className: benchmarkOpen  ? 'dock-item--active' : '' },
    { icon: <BarChart3 size={18} />, label: 'Centralidade', onClick: () => onOpenModal('centrality') },
    { icon: <MapPinned size={18} />, label: 'Regiões',      onClick: () => onOpenModal('regions') },
  ];

  return (
    <div className="mobile-dock-wrapper fixed bottom-0 left-0 right-0 z-40 flex justify-center">
      <Dock
        items={items}
        panelHeight={56}
        baseItemSize={40}
        magnification={56}
        distance={120}
      />
    </div>
  );
}
