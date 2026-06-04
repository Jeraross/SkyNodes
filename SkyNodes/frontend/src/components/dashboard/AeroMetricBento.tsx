// src/components/dashboard/AeroMetricBento.tsx
import MagicBento from '@reactbits/MagicBento/MagicBento';
import type { MagicBentoItem } from '@reactbits/MagicBento/MagicBento';
import type { GraphMetrics } from '../../lib/graph/graphMetrics';

export default function AeroMetricBento({ metrics }: { metrics: GraphMetrics }) {
  const items: MagicBentoItem[] = [
    { label: 'Nós', title: 'Aeroportos', description: 'Nós ativos na malha aérea', value: metrics.totalAirports },
    { label: 'Arestas', title: 'Rotas', description: 'Conexões no grafo', value: metrics.totalRoutes },
    { label: 'Hub', title: 'Hub Principal', description: 'Aeroporto mais conectado', value: metrics.mostConnectedAirport },
    { label: 'Métrica', title: 'Densidade', description: 'Razão de arestas existentes vs. possíveis', value: metrics.graphDensity.toFixed(3) },
    { label: 'Maior', title: 'Rota mais longa', description: metrics.longestRoute ? `${metrics.longestRoute.from} → ${metrics.longestRoute.to}` : '—', value: metrics.longestRoute?.weight ?? 0 },
    { label: 'Região', title: 'Região + Conectada', description: 'Com mais rotas originadas', value: metrics.regionMostConnected },
  ];

  return (
    <MagicBento
      items={items}
      textAutoHide={false}
      enableStars={true}
      enableSpotlight={true}
      enableBorderGlow={true}
      enableTilt={true}
      enableMagnetism={true}
      clickEffect={true}
      spotlightRadius={280}
      particleCount={8}
      glowColor="34, 211, 238"
    />
  );
}
