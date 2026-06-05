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

function getStars(score: number, total: number) {
  const r = total > 0 ? score / total : 0;
  return r >= 0.9 ? 3 : r >= 0.7 ? 2 : r >= 0.5 ? 1 : 0;
}

function getDialogueKey(stars: number) {
  return stars === 3 ? 'resultPerfect' : stars >= 2 ? 'resultGood' : 'resultOk';
}

export default function QuizResult() {
  const [, navigate] = useLocation();
  const params   = useParams<{ mode: string }>();
  const mode     = (params.mode ?? 'grafos') as QuizMode;
  const pathData = PATH_DATA[mode];
  const { unlockedStickerIds, unlockSticker } = useQuizGame();
  const pageRef  = useRef<HTMLDivElement>(null);

  const nodeIds = pathData.nodes.filter(n => n.type === 'normal').map(n => n.id);
  let totalScore = 0, totalQ = 0;
  nodeIds.forEach(id => {
    const raw = sessionStorage.getItem(`node_result_${mode}_${id}`);
    if (raw) { const { score, total } = JSON.parse(raw); totalScore += score; totalQ += total; }
  });
  totalQ += 1; totalScore += 1; // boss counts as 1 correct

  const stars      = getStars(totalScore, totalQ);
  const masteryId  = pathData.masteryStickerId;
  const alreadyHad = unlockedStickerIds.includes(masteryId);
  const sticker    = STICKERS.find(s => s.id === masteryId);

  useEffect(() => {
    gsap.fromTo(pageRef.current, { scale: 0.94, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.2)' });
    if (!alreadyHad) unlockSticker(masteryId);
  }, []);

  const go = (path: string) =>
    gsap.to(pageRef.current, { opacity: 0, scale: 0.96, duration: 0.3, onComplete: () => navigate(path) });

  const scorePercent = totalQ > 0 ? Math.round((totalScore / totalQ) * 100) : 0;

  return (
    <div ref={pageRef} className="hex-bg spotlight fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 px-8 overflow-y-auto" style={{ background: 'var(--bg-deep)' }}>
      {/* Presenter */}
      <QuizPresenter3D presenterState="celebrating" dialogueKey={getDialogueKey(stars)} size="large" />

      {/* Score */}
      <div className="text-center flex flex-col items-center gap-4">
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, letterSpacing: '0.15em', color: 'var(--text-muted)', fontWeight: 600 }}>
          PONTUAÇÃO FINAL
        </p>
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
          className="flex items-end gap-2"
        >
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 80, letterSpacing: '-0.02em', color: 'var(--gold)', lineHeight: 1 }}>
            {scorePercent}
          </span>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 36, color: 'var(--text-muted)', lineHeight: 1, paddingBottom: 8 }}>
            %
          </span>
        </motion.div>

        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--text-muted)' }}>
          {totalScore} de {totalQ} acertos
        </p>

        {/* Stars */}
        <div className="flex gap-3">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: i < stars ? 1 : 0.55, rotate: 0 }}
              transition={{ delay: 0.5 + i * 0.12, duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
            >
              <Star size={34} fill={i < stars ? '#FFD166' : 'transparent'} stroke={i < stars ? '#FFD166' : '#2A2640'} strokeWidth={1.5} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Mastery sticker */}
      {sticker && (
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6, type: 'spring', stiffness: 180 }}
          className="flex flex-col items-center gap-3"
        >
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: alreadyHad ? 'var(--text-muted)' : 'var(--gold)' }}>
            {alreadyHad ? 'JÁ DESBLOQUEADA' : '✦ FIGURINHA DESBLOQUEADA'}
          </p>
          <div
            className="w-24 h-24 rounded-2xl flex items-center justify-center"
            style={{
              background: 'rgba(255,209,102,0.06)',
              border: '1.5px solid rgba(255,209,102,0.3)',
              boxShadow: alreadyHad ? 'none' : '0 0 28px rgba(255,209,102,0.25)',
            }}
          >
            <img src={sticker.img} alt={sticker.name} className="w-16 h-16 object-contain" draggable={false} />
          </div>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, color: 'var(--gold)' }}>
            {sticker.name}
          </p>
        </motion.div>
      )}

      {/* Buttons */}
      <div className="flex flex-wrap gap-3 justify-center">
        {[
          { label: 'Jogar Novamente', path: `/quiz/map/${mode}`, style: 'gold-btn px-6 py-3' },
          { label: 'Outros Modos',   path: '/quiz',             style: 'teal-btn px-6 py-3' },
          { label: 'Ver Álbum',      path: '/album',            style: 'teal-btn px-6 py-3' },
          { label: 'Ranking',        path: '/leaderboard',      style: 'teal-btn px-6 py-3' },
        ].map(({ label, path, style }) => (
          <button key={path} onClick={() => go(path)} className={style} style={{ fontSize: 14 }}>
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
