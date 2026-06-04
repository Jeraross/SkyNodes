import { useRef, useEffect } from 'react';
import { useLocation, useParams } from 'wouter';
import { motion } from 'motion/react';
import gsap from 'gsap';
import { Star } from 'lucide-react';
import QuizPresenter3D from '../components/presenter/QuizPresenter3D';
import { PATH_DATA } from '../data/quizPathData';
import type { QuizMode } from '../data/quizPathData';
import { STICKERS } from '../data/stickers';
import { useQuizGame } from '../router/QuizGameContext';

const PIXEL = { fontFamily: "'Press Start 2P', monospace" };
const MONO  = { fontFamily: 'ui-monospace, SFMono-Regular, monospace' };

function getStars(score: number, total: number) {
  const ratio = total > 0 ? score / total : 0;
  if (ratio >= 0.9) return 3;
  if (ratio >= 0.7) return 2;
  if (ratio >= 0.5) return 1;
  return 0;
}

function getDialogueKey(stars: number) {
  if (stars === 3) return 'resultPerfect';
  if (stars >= 2)  return 'resultGood';
  return 'resultOk';
}

export default function QuizResult() {
  const [, navigate] = useLocation();
  const params = useParams<{ mode: string }>();
  const mode   = (params.mode ?? 'grafos') as QuizMode;
  const pathData = PATH_DATA[mode];

  const { unlockedStickerIds, unlockSticker } = useQuizGame();
  const pageRef = useRef<HTMLDivElement>(null);

  // Aggregate scores from sessionStorage
  const nodeIds = pathData.nodes.filter(n => n.type === 'normal').map(n => n.id);
  let totalScore = 0;
  let totalQuestions = 0;
  nodeIds.forEach(id => {
    const raw = sessionStorage.getItem(`node_result_${mode}_${id}`);
    if (raw) {
      const { score, total } = JSON.parse(raw);
      totalScore     += score;
      totalQuestions += total;
    }
  });
  // Count boss as 1 correct (simplified — boss is pass/fail)
  totalQuestions += 1;
  totalScore     += 1;

  const stars     = getStars(totalScore, totalQuestions);
  const masteryId = pathData.masteryStickerId;
  const alreadyHad = unlockedStickerIds.includes(masteryId);
  const masterySticker = STICKERS.find(s => s.id === masteryId);

  useEffect(() => {
    gsap.fromTo(pageRef.current, { scale: 0.92, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.2)' });
    if (!alreadyHad) unlockSticker(masteryId);
  }, []);

  const go = (path: string) => {
    gsap.to(pageRef.current, {
      opacity: 0, scale: 0.95, duration: 0.3,
      onComplete: () => navigate(path),
    });
  };

  return (
    <div ref={pageRef} className="fixed inset-0 z-50 bg-[#020617] flex flex-col items-center justify-center gap-8 px-8">
      {/* Presenter */}
      <QuizPresenter3D presenterState="celebrating" dialogueKey={getDialogueKey(stars)} size="large" />

      {/* Score */}
      <div className="text-center flex flex-col gap-3">
        <p style={{ ...PIXEL, fontSize: 9 }} className="text-slate-500 tracking-widest">PONTUACAO FINAL</p>
        <motion.p
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5, ease: 'back.out(1.4)' }}
          style={{ ...PIXEL, fontSize: 48 }}
          className="text-white"
        >
          {totalScore}
          <span style={{ fontSize: 22 }} className="text-slate-500">/{totalQuestions}</span>
        </motion.p>

        {/* Stars */}
        <div className="flex gap-3 justify-center">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: i < stars ? 1 : 0.6, rotate: 0 }}
              transition={{ delay: 0.5 + i * 0.12, duration: 0.4, ease: 'back.out(1.5)' }}
            >
              <Star
                size={32}
                fill={i < stars ? '#fbbf24' : 'transparent'}
                className={i < stars ? 'text-yellow-400' : 'text-slate-700'}
                strokeWidth={i < stars ? 1.5 : 1}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Mastery sticker unlock */}
      {masterySticker && (
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6, type: 'spring', stiffness: 200 }}
          className="flex flex-col items-center gap-3"
        >
          <p style={{ ...PIXEL, fontSize: 7 }} className="text-yellow-400 tracking-widest">
            {alreadyHad ? 'JA DESBLOQUEADA' : 'FIGURINHA DESBLOQUEADA'}
          </p>
          <img
            src={masterySticker.img}
            alt={masterySticker.name}
            style={{
              width: 96, height: 96, objectFit: 'contain',
              filter: `drop-shadow(0 0 ${alreadyHad ? '6px rgba(251,191,36,0.3)' : '16px rgba(251,191,36,0.7)'})`,
            }}
            draggable={false}
          />
          <p style={{ ...PIXEL, fontSize: 8 }} className="text-yellow-400">{masterySticker.name}</p>
        </motion.div>
      )}

      {/* Buttons */}
      <div className="flex gap-4 flex-wrap justify-center">
        <button
          onClick={() => go(`/quiz/map/${mode}`)}
          className="px-6 py-3 rounded-xl border-2 border-cyan-500/50 cursor-pointer"
          style={{ background: 'rgba(6,182,212,0.1)' }}
        >
          <p style={{ ...PIXEL, fontSize: 8 }} className="text-cyan-300">JOGAR NOVAMENTE</p>
        </button>
        <button
          onClick={() => go('/quiz')}
          className="px-6 py-3 rounded-xl border-2 border-slate-500/30 cursor-pointer"
          style={{ background: 'rgba(100,116,139,0.08)' }}
        >
          <p style={{ ...PIXEL, fontSize: 8 }} className="text-slate-400">OUTROS MODOS</p>
        </button>
        <button
          onClick={() => go('/album')}
          className="px-6 py-3 rounded-xl border-2 border-yellow-500/40 cursor-pointer"
          style={{ background: 'rgba(251,191,36,0.08)' }}
        >
          <p style={{ ...PIXEL, fontSize: 8 }} className="text-yellow-400">VER ALBUM</p>
        </button>
        <button
          onClick={() => go('/leaderboard')}
          className="px-6 py-3 rounded-xl border-2 border-violet-500/40 cursor-pointer"
          style={{ background: 'rgba(167,139,250,0.08)' }}
        >
          <p style={{ ...PIXEL, fontSize: 8 }} className="text-violet-400">RANKING</p>
        </button>
      </div>
    </div>
  );
}
