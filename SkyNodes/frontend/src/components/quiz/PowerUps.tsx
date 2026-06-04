import { Users, XCircle, Lightbulb } from 'lucide-react';

const PIXEL = { fontFamily: "'Press Start 2P', monospace" };

interface Props {
  hintsUsed:        number;
  maxHints:         number;
  skipsRemaining:   number;
  eliminateUsed:    boolean;
  audienceUsed:     boolean;
  onHint:           () => void;
  onSkip:           () => void;
  onEliminate:      () => void;
  onAudience:       () => void;
}

function PUButton({
  Icon, label, disabled, onClick, color = '#22d3ee',
}: { Icon: React.ElementType; label: string; disabled: boolean; onClick: () => void; color?: string }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      className="flex flex-col items-center gap-1 p-2 rounded-lg border transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-30"
      style={{
        borderColor: disabled ? 'rgba(100,116,139,0.2)' : `${color}44`,
        background:  disabled ? 'transparent' : `${color}11`,
      }}
    >
      <Icon size={16} style={{ color: disabled ? '#475569' : color }} />
      <p style={{ ...PIXEL, fontSize: 5 }} className={disabled ? 'text-slate-600' : 'text-slate-400'}>{label}</p>
    </button>
  );
}

export default function PowerUps({
  hintsUsed, maxHints, skipsRemaining,
  eliminateUsed, audienceUsed,
  onHint, onSkip, onEliminate, onAudience,
}: Props) {
  return (
    <div className="flex flex-col gap-2">
      <p style={{ ...PIXEL, fontSize: 6 }} className="text-slate-500 text-center">AJUDAS</p>
      <div className="flex flex-col gap-2">
        <PUButton
          Icon={Lightbulb}
          label={`DICA ${hintsUsed}/${maxHints}`}
          disabled={hintsUsed >= maxHints}
          onClick={onHint}
          color="#fbbf24"
        />
        <PUButton
          Icon={XCircle}
          label="ELIM. 2"
          disabled={eliminateUsed}
          onClick={onEliminate}
          color="#f87171"
        />
        <PUButton
          Icon={Users}
          label="PLATEIA"
          disabled={audienceUsed}
          onClick={onAudience}
          color="#a78bfa"
        />
        <PUButton
          Icon={XCircle}
          label={`PULAR ${skipsRemaining}`}
          disabled={skipsRemaining <= 0}
          onClick={onSkip}
          color="#94a3b8"
        />
      </div>
    </div>
  );
}
