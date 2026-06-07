const LEGEND = [
  { swatch: 'square', color: '#ff0000', label: 'AEROPORTO' },
  { swatch: 'line', color: '#ffd700', label: 'ROTA ATIVA' },
  { swatch: 'line', color: '#00ffff', label: 'ROTA REST.' },
  { swatch: 'dash', color: '#a80000', label: 'BLOQUEADA' },
  { swatch: 'triangle', color: '#a80000', label: 'MONTANHAS' },
  { swatch: 'tree', color: '#006c00', label: 'FLORESTA' },
  { swatch: 'wave', color: '#2a4cff', label: 'OCEANO' },
  { swatch: 'diamond', color: '#ff00ff', label: 'ANOMALIA' },
];

export default function MapLegend() {
  return (
    <div className="border border-[#ffd700] bg-black/85 p-1.5">
      <div className="mb-1 border-b border-[#007000] pb-0.5 text-center">
        <span className="font-pixel text-[6px] leading-none text-[#00ff00]">LEGENDA</span>
      </div>
      <ul className="grid grid-cols-1 gap-y-0.5">
        {LEGEND.map(item => (
          <li key={item.label} className="flex items-center gap-1.5">
            <span className="flex w-3 items-center justify-center" aria-hidden="true">
              <LegendSwatch type={item.swatch} color={item.color} />
            </span>
            <span className="font-term text-[13px] leading-none text-[#b0b0b0]">{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function LegendSwatch({ type, color }: { type: string; color: string }) {
  if (type === 'line') return <span className="h-0.5 w-3" style={{ backgroundColor: color }} />;
  if (type === 'dash') return <span className="h-0.5 w-3 border-t-2 border-dashed" style={{ borderColor: color }} />;
  if (type === 'triangle') {
    return (
      <span
        className="h-0 w-0 border-x-[5px] border-b-[9px] border-x-transparent"
        style={{ borderBottomColor: color }}
      />
    );
  }
  if (type === 'tree') return <span className="h-3 w-2" style={{ backgroundColor: color }} />;
  if (type === 'wave') return <span className="h-2 w-3" style={{ backgroundColor: color }} />;
  if (type === 'diamond') return <span className="h-2.5 w-2.5 rotate-45" style={{ backgroundColor: color }} />;
  return <span className="h-2.5 w-2.5" style={{ backgroundColor: color }} />;
}
