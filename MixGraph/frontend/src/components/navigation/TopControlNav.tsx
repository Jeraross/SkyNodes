// src/components/navigation/TopControlNav.tsx
import CardNav from '@reactbits/CardNav/CardNav';

interface Props { onEnterBrazil: () => void; }

export default function TopControlNav({ onEnterBrazil }: Props) {
  const items = [
    {
      label: 'Projeto',
      bgColor: 'rgba(15, 23, 42, 0.9)',
      textColor: '#e2e8f0',
      links: [
        { label: 'Objetivo', ariaLabel: 'Ver objetivo do projeto' },
        { label: 'Como funciona', ariaLabel: 'Entender funcionamento' },
      ],
    },
    {
      label: 'Grafos',
      bgColor: 'rgba(8, 47, 73, 0.9)',
      textColor: '#e2e8f0',
      links: [
        { label: 'Nós e arestas', ariaLabel: 'Sobre nós e arestas' },
        { label: 'Algoritmos', ariaLabel: 'Algoritmos disponíveis' },
      ],
    },
    {
      label: 'Dados',
      bgColor: 'rgba(5, 46, 22, 0.9)',
      textColor: '#e2e8f0',
      links: [
        { label: 'Aeroportos', ariaLabel: 'Lista de aeroportos' },
        { label: 'Rotas', ariaLabel: 'Rotas aéreas' },
      ],
    },
  ];

  return (
    <div className="pointer-events-auto absolute left-1/2 top-4 z-40 -translate-x-1/2 w-[min(90vw,800px)]">
      <CardNav
        items={items}
        baseColor="rgba(2, 6, 23, 0.72)"
        menuColor="#67e8f9"
        buttonBgColor="rgba(8, 145, 178, 0.35)"
        buttonTextColor="#ecfeff"
        ctaLabel="Analisar Brasil"
        onCtaClick={onEnterBrazil}
      />
    </div>
  );
}
