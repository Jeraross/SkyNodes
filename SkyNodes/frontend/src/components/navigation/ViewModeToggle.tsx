import { Globe2, Network, Map } from 'lucide-react';
import type { ViewMode } from '../../types';

interface Props {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
}

const options: { mode: ViewMode; Icon: typeof Globe2; label: string }[] = [
  { mode: 'globe', Icon: Globe2, label: 'Globo 3D' },
  { mode: 'graph', Icon: Network, label: 'Grafo' },
  { mode: 'map',   Icon: Map,    label: 'Mapa' },
];

export default function ViewModeToggle({ value, onChange }: Props) {
  return (
    <div
      className="flex items-center gap-[2px] rounded-lg px-1 py-1"
      style={{ backgroundColor: 'rgba(8, 145, 178, 0.15)', border: '1px solid rgba(103,232,249,0.2)' }}
    >
      {options.map(({ mode, Icon, label }) => {
        const active = value === mode;
        return (
          <button
            key={mode}
            type="button"
            title={label}
            onClick={() => onChange(mode)}
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all duration-200"
            style={{
              backgroundColor: active ? 'rgba(8, 145, 178, 0.55)' : 'transparent',
              color: active ? '#ecfeff' : 'rgba(186,230,253,0.6)',
              boxShadow: active ? '0 0 8px rgba(103,232,249,0.3)' : 'none',
            }}
          >
            <Icon size={13} strokeWidth={active ? 2.2 : 1.8} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
