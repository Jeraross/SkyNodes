// src/components/navigation/GlobeSidebar.tsx
import { Radar, Route, Network, BarChart3, MapPinned } from 'lucide-react';
import VerticalDock from './VerticalDock';
import type { ModalType } from '../../types';

export default function GlobeSidebar({ onOpenModal }: { onOpenModal: (m: ModalType) => void }) {
  const items = [
    { icon: <Radar size={20} />, label: 'Visão Geral', onClick: () => onOpenModal('overview') },
    { icon: <Route size={20} />, label: 'Rotas', onClick: () => onOpenModal('routes') },
    { icon: <Network size={20} />, label: 'Algoritmos', onClick: () => onOpenModal('algorithms') },
    { icon: <BarChart3 size={20} />, label: 'Centralidade', onClick: () => onOpenModal('centrality') },
    { icon: <MapPinned size={20} />, label: 'Regiões', onClick: () => onOpenModal('regions') },
  ];
  return <VerticalDock items={items} />;
}
