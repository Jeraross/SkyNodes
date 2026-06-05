import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as LucideIcons from 'lucide-react';
import { X, Check } from 'lucide-react';
import { useQuizGame } from '../../router/QuizGameContext';

// ── Icon catalogue — fun & friendly ──────────────────────────────────────────

const ICON_LIST: { name: string; label: string }[] = [
  { name: 'Zap',         label: 'Raio'       },
  { name: 'Flame',       label: 'Chama'      },
  { name: 'Star',        label: 'Estrela'    },
  { name: 'Crown',       label: 'Coroa'      },
  { name: 'Gem',         label: 'Gema'       },
  { name: 'Rocket',      label: 'Foguete'    },
  { name: 'Brain',       label: 'Cérebro'    },
  { name: 'Sparkles',    label: 'Brilho'     },
  { name: 'Trophy',      label: 'Troféu'     },
  { name: 'Swords',      label: 'Espadas'    },
  { name: 'Shield',      label: 'Escudo'     },
  { name: 'Skull',       label: 'Caveira'    },
  { name: 'Ghost',       label: 'Fantasma'   },
  { name: 'Wand2',       label: 'Varinha'    },
  { name: 'Dices',       label: 'Dados'      },
  { name: 'Cat',         label: 'Gato'       },
  { name: 'Bird',        label: 'Pássaro'    },
  { name: 'Rabbit',      label: 'Coelho'     },
  { name: 'Snail',       label: 'Caracol'    },
  { name: 'Bug',         label: 'Inseto'     },
  { name: 'Fish',        label: 'Peixe'      },
  { name: 'Atom',        label: 'Átomo'      },
  { name: 'Microscope',  label: 'Micro'      },
  { name: 'Calculator',  label: 'Calc'       },
  { name: 'Code',        label: 'Código'     },
  { name: 'Terminal',    label: 'Terminal'   },
  { name: 'Music',       label: 'Música'     },
  { name: 'Pizza',       label: 'Pizza'      },
  { name: 'Coffee',      label: 'Café'       },
  { name: 'Smile',       label: 'Sorriso'    },
];

// ── Resolve icon component by name ───────────────────────────────────────────

function getIcon(name: string, size = 20, color = 'currentColor') {
  const Comp = (LucideIcons as Record<string, React.FC<{ size?: number; color?: string }>>)[name];
  return Comp ? <Comp size={size} color={color} /> : <LucideIcons.Zap size={size} color={color} />;
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  onClose: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ProfileModal({ open, onClose }: Props) {
  const { sessionPlayer, setSessionPlayer, playerIcon, setPlayerIcon } = useQuizGame();

  const [name, setName]   = useState(sessionPlayer ?? '');
  const [icon, setIcon]   = useState(playerIcon);
  const [saved, setSaved] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync local state when modal opens
  useEffect(() => {
    if (open) {
      setName(sessionPlayer ?? '');
      setIcon(playerIcon);
      setSaved(false);
      setTimeout(() => inputRef.current?.focus(), 120);
    }
  }, [open]);

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setSessionPlayer(trimmed);
    setPlayerIcon(icon);
    setSaved(true);
    setTimeout(onClose, 700);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[300]"
            style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(4px)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Centering wrapper */}
          <div className="fixed inset-0 z-[301] flex items-center justify-center pointer-events-none">
          {/* Modal */}
          <motion.div
            className="flex flex-col pointer-events-auto"
            style={{
              width: 'min(480px, 92vw)',
              background: 'linear-gradient(160deg, #1A0808 0%, #0E0510 100%)',
              border: '2px solid #C8920F',
              borderRadius: 20,
              boxShadow: '0 0 60px rgba(200,146,15,0.2), 0 30px 80px rgba(0,0,0,0.9)',
              overflow: 'hidden',
            }}
            initial={{ opacity: 0, scale: 0.88, y: 20 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{   opacity: 0, scale: 0.92,  y: 10 }}
            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
          >
            {/* Gold top stripe */}
            <div style={{ height: 3, background: 'linear-gradient(90deg,#B8820A,#FFE080 30%,#FFD166 50%,#FFE080 70%,#B8820A)' }} />

            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4"
              style={{ borderBottom: '1px solid rgba(200,146,15,0.2)' }}>
              <div className="flex items-center gap-3">
                {/* Current icon preview */}
                <div className="flex items-center justify-center w-10 h-10 rounded-full"
                  style={{ background: 'rgba(255,209,102,0.12)', border: '1.5px solid rgba(255,209,102,0.35)' }}>
                  {getIcon(icon, 20, '#FFD166')}
                </div>
                <div>
                  <p style={{ fontFamily:'var(--font-display)', fontSize:18, letterSpacing:'0.06em', color:'#FFD166' }}>
                    PERFIL
                  </p>
                  <p style={{ fontFamily:'var(--font-ui)', fontSize:11, color:'rgba(255,255,255,0.35)', marginTop:1 }}>
                    {sessionPlayer ? `Olá, ${sessionPlayer}!` : 'Configure seu jogador'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="flex items-center justify-center w-8 h-8 rounded-full cursor-pointer transition-all"
                style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)' }}
                onMouseEnter={e=>(e.currentTarget.style.background='rgba(255,80,80,0.15)')}
                onMouseLeave={e=>(e.currentTarget.style.background='rgba(255,255,255,0.05)')}
              >
                <X size={14} color="rgba(255,255,255,0.5)" />
              </button>
            </div>

            {/* Body */}
            <div className="flex flex-col gap-5 px-6 py-5">

              {/* Name input */}
              <div className="flex flex-col gap-2">
                <label style={{ fontFamily:'var(--font-ui)', fontSize:10, fontWeight:700, letterSpacing:'0.12em', color:'rgba(255,209,102,0.6)' }}>
                  NOME DE JOGADOR
                </label>
                <input
                  ref={inputRef}
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onKeyDown={handleKey}
                  maxLength={20}
                  placeholder="seu_nome_aqui"
                  className="w-full px-4 py-3 rounded-xl outline-none transition-all"
                  style={{
                    fontFamily:'var(--font-ui)', fontSize:15, color:'#F0E8D0',
                    background:'rgba(255,255,255,0.05)',
                    border:'1.5px solid rgba(255,209,102,0.25)',
                    caretColor:'#FFD166',
                  }}
                  onFocus={e=>(e.target.style.borderColor='rgba(255,209,102,0.6)')}
                  onBlur={e=>(e.target.style.borderColor='rgba(255,209,102,0.25)')}
                />
                <p style={{ fontFamily:'var(--font-ui)', fontSize:10, color:'rgba(255,255,255,0.25)', textAlign:'right' }}>
                  {name.length}/20
                </p>
              </div>

              {/* Icon picker */}
              <div className="flex flex-col gap-2">
                <label style={{ fontFamily:'var(--font-ui)', fontSize:10, fontWeight:700, letterSpacing:'0.12em', color:'rgba(255,209,102,0.6)' }}>
                  ÍCONE
                </label>
                <div
                  className="grid gap-2 p-3 rounded-xl"
                  style={{
                    gridTemplateColumns: 'repeat(6, 1fr)',
                    background:'rgba(0,0,0,0.3)',
                    border:'1px solid rgba(255,255,255,0.06)',
                    maxHeight: 220,
                    overflowY: 'auto',
                  }}
                >
                  {ICON_LIST.map(({ name: iName, label }) => {
                    const selected = icon === iName;
                    return (
                      <motion.button
                        key={iName}
                        title={label}
                        onClick={() => setIcon(iName)}
                        whileHover={{ scale: 1.12 }}
                        whileTap={{ scale: 0.92 }}
                        className="flex flex-col items-center gap-1 p-2 rounded-lg cursor-pointer transition-all"
                        style={{
                          background:   selected ? 'rgba(255,209,102,0.18)' : 'rgba(255,255,255,0.03)',
                          border:       `1.5px solid ${selected ? '#FFD166' : 'rgba(255,255,255,0.07)'}`,
                          boxShadow:    selected ? '0 0 12px rgba(255,209,102,0.3)' : 'none',
                        }}
                      >
                        {getIcon(iName, 18, selected ? '#FFD166' : 'rgba(255,255,255,0.55)')}
                        <span style={{ fontFamily:'var(--font-ui)', fontSize:8, color: selected ? '#FFD166' : 'rgba(255,255,255,0.3)', lineHeight:1 }}>
                          {label}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 pb-5 pt-1">
              <button
                onClick={onClose}
                style={{ fontFamily:'var(--font-ui)', fontSize:12, color:'rgba(255,255,255,0.35)', cursor:'pointer', transition:'color .2s' }}
                onMouseEnter={e=>(e.currentTarget.style.color='rgba(255,255,255,0.65)')}
                onMouseLeave={e=>(e.currentTarget.style.color='rgba(255,255,255,0.35)')}
              >
                CANCELAR
              </button>

              <motion.button
                onClick={handleSave}
                disabled={!name.trim() || saved}
                whileHover={name.trim() && !saved ? { scale: 1.03 } : {}}
                whileTap={name.trim()  && !saved ? { scale: 0.97 } : {}}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl cursor-pointer"
                style={{
                  fontFamily:'var(--font-display)', fontSize:14, letterSpacing:'0.06em',
                  background: saved ? 'rgba(74,222,128,0.18)' : name.trim() ? 'rgba(255,209,102,0.15)' : 'rgba(255,255,255,0.04)',
                  border:     `1.5px solid ${saved ? '#4ADE80' : name.trim() ? '#FFD166' : 'rgba(255,255,255,0.1)'}`,
                  color:      saved ? '#4ADE80' : name.trim() ? '#FFD166' : 'rgba(255,255,255,0.25)',
                  transition: 'background .2s, border-color .2s, color .2s',
                  opacity:    name.trim() ? 1 : 0.5,
                }}
              >
                {saved
                  ? <><Check size={14} /> SALVO!</>
                  : '✓ SALVAR'
                }
              </motion.button>
            </div>

            {/* Bottom gold stripe */}
            <div style={{ height: 2, background: 'linear-gradient(90deg,transparent,#C8920F 30%,#FFD166 50%,#C8920F 70%,transparent)' }} />
          </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
