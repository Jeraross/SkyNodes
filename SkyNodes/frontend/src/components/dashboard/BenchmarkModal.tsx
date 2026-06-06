import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Maximize2, Minimize2 } from 'lucide-react';
import { ContainerScroll } from '@/components/ui/container-scroll-animation';
import EiffelSticker from './EiffelSticker';
import BenchmarkGeneralStats from './BenchmarkGeneralStats';
import BenchmarkGuidedComparison from './BenchmarkGuidedComparison';

const PIXEL = { fontFamily: "'Press Start 2P', monospace" };
const VT    = { fontFamily: "'VT323', monospace" };

const BOOT_LINES = [
  '> MIXGRAPH BENCHMARK v1.0',
  '> CARREGANDO MODULOS...',
  '> INICIALIZANDO GRAFOS...',
  '> CALIBRANDO ALGORITMOS...',
  '> PRONTO.',
];

interface Props {
  open: boolean;
  onClose: () => void;
  onEiffelUnlock: () => void;
}

export default function BenchmarkModal({ open, onClose, onEiffelUnlock }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [phase, setPhase] = useState<'loading' | 'ready'>('loading');
  const [progress, setProgress] = useState(0);
  const [visibleLines, setVisibleLines] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!open) {
      setPhase('loading');
      setProgress(0);
      setVisibleLines(0);
      setExpanded(false);
      return;
    }

    setProgress(0);
    setVisibleLines(0);

    let pct = 0;
    let lineIdx = 0;
    const DURATION = 2200;
    const TICK = 40;
    const steps = DURATION / TICK;

    timerRef.current = setInterval(() => {
      pct += 100 / steps;
      setProgress(Math.min(Math.round(pct), 100));

      const nextLine = Math.floor((pct / 100) * BOOT_LINES.length);
      if (nextLine > lineIdx) {
        lineIdx = nextLine;
        setVisibleLines(lineIdx);
      }

      if (pct >= 100) {
        clearInterval(timerRef.current!);
        setTimeout(() => setPhase('ready'), 300);
      }
    }, TICK);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [open]);

  const filled = Math.round(progress / 5);
  const bar = '█'.repeat(filled) + '░'.repeat(20 - filled);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="bm-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/75 backdrop-blur-sm"
          onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            layout
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className={`group ${
              expanded
                ? 'fixed inset-4 flex flex-col'
                : 'w-[920px] max-w-[calc(100vw-2rem)] h-[700px] max-h-[calc(100vh-2rem)] flex flex-col'
            }`}
          >
            <ContainerScroll
              titleComponent={
                <div className="flex items-center gap-3">
                  <p style={PIXEL} className="text-cyan-400 text-[11px] tracking-widest mb-1">
                    BENCHMARK
                  </p>
                  <button
                    onClick={() => setExpanded(e => !e)}
                    style={PIXEL}
                    className="mb-1 text-zinc-500 hover:text-cyan-400 transition-colors lg:opacity-0 lg:group-hover:opacity-100"
                    title={expanded ? 'Restaurar' : 'Expandir'}
                  >
                    {expanded ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                  </button>
                </div>
              }
              sticker={<EiffelSticker onUnlock={onEiffelUnlock} />}
            >
              <AnimatePresence mode="wait">
                {phase === 'loading' ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.3 } }}
                    className="h-full flex flex-col items-center justify-center gap-8 px-12"
                  >
                    <div className="w-full space-y-3">
                      {BOOT_LINES.slice(0, visibleLines).map((line, i) => (
                        <motion.p
                          key={i}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          style={VT}
                          className="text-green-400 text-lg tracking-wide"
                        >
                          {line}
                        </motion.p>
                      ))}
                    </div>
                    <div className="w-full">
                      <p style={PIXEL} className="text-cyan-300 text-[9px]">
                        [{bar}] {progress}%
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="ready"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4 }}
                    className="h-full overflow-y-auto"
                    style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(34,211,238,0.2) transparent' }}
                  >
                    <div className="p-6 space-y-8">
                      <div>
                        <p style={PIXEL} className="text-cyan-400 text-[8px] mb-4 tracking-widest">
                          {'>'} STATS GERAIS
                        </p>
                        <BenchmarkGeneralStats />
                      </div>
                      <div className="border-t border-zinc-700/50 pt-6">
                        <p style={PIXEL} className="text-cyan-400 text-[8px] mb-4 tracking-widest">
                          {'>'} COMPARACAO GUIADA
                        </p>
                        <BenchmarkGuidedComparison />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </ContainerScroll>
          </motion.div>

          <button
            onClick={onClose}
            style={PIXEL}
            className="mt-4 text-[8px] text-zinc-500 hover:text-cyan-400 transition-colors tracking-widest"
          >
            [ FECHAR ]
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
