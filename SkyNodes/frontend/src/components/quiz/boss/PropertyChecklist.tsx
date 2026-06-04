import { motion } from 'motion/react';
import { Check, X, Info } from 'lucide-react';
import type { BossProperty, CanvasState } from '../../../data/bossQuestions';

const PIXEL = { fontFamily: "'Press Start 2P', monospace" };
const MONO  = { fontFamily: 'ui-monospace, SFMono-Regular, monospace' };

interface Props {
  properties: BossProperty[];
  canvasState: CanvasState;
}

export default function PropertyChecklist({ properties, canvasState }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <p style={{ ...PIXEL, fontSize: 7 }} className="text-slate-400 mb-1">PROPRIEDADES</p>
      {properties.map(prop => {
        const ok = prop.check(canvasState);
        return (
          <motion.div
            key={prop.id}
            animate={{ borderColor: ok ? '#4ade8044' : 'rgba(248,113,113,0.2)' }}
            className="flex items-start gap-3 p-3 rounded-lg border group relative"
            style={{ background: ok ? 'rgba(74,222,128,0.06)' : 'rgba(2,6,23,0.6)' }}
          >
            <div
              className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5"
              style={{ background: ok ? 'rgba(74,222,128,0.2)' : 'rgba(248,113,113,0.15)' }}
            >
              {ok
                ? <Check size={11} className="text-green-400" />
                : <X     size={11} className="text-red-400" />
              }
            </div>
            <div className="flex-1 min-w-0">
              <p style={{ ...PIXEL, fontSize: 7 }} className={ok ? 'text-green-400' : 'text-slate-400'}>
                {prop.label}
              </p>
            </div>
            {/* Tooltip */}
            <div className="relative flex-shrink-0">
              <Info size={12} className="text-slate-600 group-hover:text-slate-400 transition-colors cursor-help" />
              <div
                className="absolute right-0 bottom-6 hidden group-hover:block z-20 w-52 p-3 rounded-lg shadow-xl"
                style={{ background: '#0f172a', border: '1px solid rgba(6,182,212,0.2)' }}
              >
                <p style={{ ...MONO, fontSize: 11 }} className="text-slate-300 leading-relaxed">
                  {prop.tooltip}
                </p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
