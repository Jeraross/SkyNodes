import { Radar, Route, Network, BarChart3, MapPinned, Gauge } from 'lucide-react';
import VerticalDock from './VerticalDock';
import type { ModalType } from '../../types';

interface Props {
  algorithmsOpen: boolean;
  benchmarkOpen: boolean;
  onOpenModal: (m: ModalType) => void;
  onToggleAlgorithms: () => void;
  onToggleBenchmark: () => void;
}

export default function GlobeSidebar({
  algorithmsOpen, benchmarkOpen, onOpenModal, onToggleAlgorithms, onToggleBenchmark,
}: Props) {
  const items = [
    { icon: <Radar size={20} />,    label: 'Visão Geral',  onClick: () => onOpenModal('overview') },
    { icon: <Route size={20} />,    label: 'Rotas',        onClick: () => onOpenModal('routes') },
    { icon: <Network size={20} />,  label: 'Algoritmos',   onClick: onToggleAlgorithms, className: algorithmsOpen ? 'vdock-item--active' : '' },
    { icon: <Gauge size={20} />,    label: 'Benchmark',    onClick: onToggleBenchmark,  className: benchmarkOpen  ? 'vdock-item--active' : '' },
    { icon: <BarChart3 size={20} />, label: 'Centralidade', onClick: () => onOpenModal('centrality') },
    { icon: <MapPinned size={20} />, label: 'Regiões',     onClick: () => onOpenModal('regions') },
  ];
  return <VerticalDock items={items} />;
}
