import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useGameController } from '../game/state/useGameController';
import AeroTaleScreen from '../game/ui/AeroTaleScreen';
import { useIsMobile } from '../hooks/useIsMobile';

const BOOT_LINES = [
  { text: '> AEROTALE v1.0',               color: 'text-green-400' },
  { text: '> INICIALIZANDO SISTEMA...',     color: 'text-green-400' },
  { text: '> VERIFICANDO HARDWARE...',      color: 'text-green-400' },
  { text: '> LINK REMOTO INSTAVEL.',        color: 'text-red-400'   },
  { text: '> COCKPIT COMPACTO DETECTADO.',  color: 'text-red-400'   },
  { text: '> CANAL DE VOO BLOQUEADO.',      color: 'text-red-400'   },
  { text: '> ABRA EM UM DESKTOP PARA DECOLAR.', color: 'text-yellow-400'},
];

function DesktopOnly({ onBack }: { onBack: () => void }) {
  const [blink, setBlink] = useState(true);
  const [count, setCount] = useState(0);
  const done = count >= BOOT_LINES.length;

  useEffect(() => {
    if (done) return;
    const t = setTimeout(() => setCount(c => c + 1), 340);
    return () => clearTimeout(t);
  }, [count, done]);

  useEffect(() => {
    const t = setInterval(() => setBlink(b => !b), 530);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#020617] px-6">
      <div className="pointer-events-none absolute inset-0 crt-scanlines z-10" />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-72 w-72 rounded-full bg-cyan-500/5 blur-3xl" />
      </div>

      <div className="relative z-20 w-full max-w-sm">
        <div className="rounded-lg border border-cyan-500/30 bg-black/80 p-5 shadow-[0_0_40px_rgba(34,211,238,0.08)]">
          {/* Title bar */}
          <div className="mb-4 flex items-center gap-2 border-b border-cyan-500/20 pb-3">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
            <span className="ml-2 font-mono text-[10px] text-cyan-500/60 uppercase tracking-widest">
              aerotale — terminal
            </span>
          </div>

          {/* Boot lines */}
          <div className="min-h-[168px] space-y-1.5">
            {BOOT_LINES.slice(0, count).map((line, i) => (
              <p key={i} className={`font-term text-base leading-tight ${line.color}`}>
                {line.text}
              </p>
            ))}
            {!done && (
              <span className={`font-term text-base text-green-400 ${blink ? 'opacity-100' : 'opacity-0'}`}>_</span>
            )}
          </div>

          {/* Message */}
          {done && (
            <div className="mt-5 rounded border border-cyan-500/25 bg-cyan-950/30 p-3">
              <p className="font-pixel text-[8px] text-cyan-400 leading-relaxed">
                O COCKPIT PRECISA DE UMA TELA MAIOR.
              </p>
              <p className="mt-1.5 font-pixel text-[7px] text-cyan-600 leading-relaxed">
                ACESSE EM UM COMPUTADOR PARA ASSUMIR A TORRE.
              </p>
            </div>
          )}
        </div>

        {/* Back button — always visible */}
        <button
          onClick={onBack}
          className="mt-5 w-full border border-cyan-500/30 bg-transparent py-2.5 font-pixel text-[8px] text-cyan-500 uppercase tracking-widest transition-colors hover:border-cyan-400 hover:text-cyan-300 active:scale-95"
        >
          {'<'} voltar ao skynodes
        </button>
      </div>
    </div>
  );
}

function GameContent({ onBack }: { onBack: () => void }) {
  const game = useGameController();
  return (
    <AeroTaleScreen
      airports={game.airports}
      routes={game.routes}
      activeMission={game.activeMission}
      currentAirport={game.currentAirport}
      nearbyAirport={game.nearbyAirport}
      completedCount={game.progress.completedMissionIds.length}
      totalMissions={game.missions.length}
      credits={game.progress.credits}
      fuel={game.progress.fuel}
      completedTaskIds={game.progress.completedTaskIds}
      playerPosition={game.playerPosition}
      setPlayerPosition={game.setPlayerPosition}
      setTargetPosition={game.setTargetPosition}
      onConfirmTravel={game.confirmTravel}
      onCompleteTask={game.completeTask}
      onBuyFuel={game.buyFuel}
      onReset={game.reset}
      onBack={onBack}
      introSeen={game.introSeen}
      onIntroFinish={game.markIntroSeen}
      clearedCombatIds={game.clearedCombatIds}
      onCombatVictory={game.clearCombat}
      dialogueQueue={game.dialogueQueue}
      onAdvanceDialogue={game.advanceDialogue}
      pushDialogue={game.pushDialogue}
      buildMode={game.buildMode}
      onRouteActivated={game.activateRoute}
      activateBuildMode={game.activateBuildMode}
      puzzleActive={game.puzzleActive}
      onPuzzleSolved={game.closePuzzle}
      onPuzzleBack={game.closePuzzle}
      openPuzzle={game.openPuzzle}
    />
  );
}

export default function GamePage() {
  const [, navigate] = useLocation();
  const isMobile = useIsMobile();

  if (isMobile) {
    return <DesktopOnly onBack={() => navigate('/')} />;
  }

  return <GameContent onBack={() => navigate('/')} />;
}
