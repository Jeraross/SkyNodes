import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { DialogueSequence, GameAirport, GameMission, GameRoute, PlayerPosition } from '../types';
import { buildRetroScreenModel } from './retroScreen';
import WorldMapPanel from './WorldMapPanel';
import TravelPlannerPanel from './TravelPlannerPanel';
import AirportMenuPanel from './AirportMenuPanel';
import AeroTaleIntro from './AeroTaleIntro';
import CombatScreen from './CombatScreen';
import { getEncounterForAirport } from '../data/combatEncounters';
import { AEROTALE_ACTIONS as ACTIONS, type AeroTaleAction as Action, shouldShowGlobalHud } from './aeroTaleHud';
import { AIRPORT_PUZZLES } from '../data/airportPuzzles';
import {
  RECIFE_CHEGADA,
  RECIFE_TUTORIAL_VERTICES,
  RECIFE_TUTORIAL_ARESTAS,
  RECIFE_GLITCH_APARECE,
  RECIFE_PRE_PUZZLE,
  RECIFE_ENCERRAMENTO,
} from '../data/recifeDialogues';
import DialogueOverlay from './DialogueOverlay';
import AirportPuzzlePanel from './AirportPuzzlePanel';

interface AeroTaleScreenProps {
  airports: GameAirport[];
  routes: GameRoute[];
  activeMission: GameMission | null;
  currentAirport: GameAirport | null;
  nearbyAirport: GameAirport | null;
  completedCount: number;
  totalMissions: number;
  credits: number;
  fuel: number;
  completedTaskIds: string[];
  playerPosition: PlayerPosition;
  setPlayerPosition: (position: PlayerPosition) => void;
  setTargetPosition: (position: PlayerPosition | null) => void;
  onConfirmTravel: (airport: GameAirport, routeIds: string[], cost: number) => void;
  onCompleteTask: (taskId: string, reward: number) => void;
  onBuyFuel: (amount: number, cost: number) => void;
  onReset: () => void;
  onBack: () => void;
  // Intro + combat
  introSeen: boolean;
  onIntroFinish: () => void;
  clearedCombatIds: string[];
  onCombatVictory: (encounterId: string) => void;
  // Dialogue
  dialogueQueue: DialogueSequence[];
  onAdvanceDialogue: () => void;
  pushDialogue: (seq: DialogueSequence) => void;
  // Build mode
  buildMode: boolean;
  onRouteActivated: (routeId: string) => void;
  activateBuildMode: () => void;
  // Puzzle
  puzzleActive: boolean;
  onPuzzleSolved: () => void;
  onPuzzleBack: () => void;
  openPuzzle: () => void;
}

const STAT_COLORS = {
  green: '#00ff00',
  yellow: '#ffd700',
  cyan: '#00ffff',
};

export default function AeroTaleScreen({
  airports,
  routes,
  activeMission,
  currentAirport,
  nearbyAirport,
  completedCount,
  totalMissions,
  credits,
  fuel,
  completedTaskIds,
  playerPosition,
  setPlayerPosition,
  setTargetPosition,
  onConfirmTravel,
  onCompleteTask,
  onBuyFuel,
  onReset,
  onBack,
  introSeen,
  onIntroFinish,
  clearedCombatIds,
  onCombatVictory,
  dialogueQueue,
  onAdvanceDialogue,
  pushDialogue,
  buildMode,
  onRouteActivated,
  activateBuildMode,
  puzzleActive,
  onPuzzleSolved,
  onPuzzleBack,
  openPuzzle,
}: AeroTaleScreenProps) {
  const [activeAction, setActiveAction] = useState<Action>('MAPA');
  const [combatActive, setCombatActive] = useState(false);
  const [recifeStarted, setRecifeStarted] = useState(false);

  const model = useMemo(
    () => buildRetroScreenModel({ currentAirport, activeMission, completedCount, totalMissions, nearbyAirport, credits, fuel }),
    [activeMission, completedCount, credits, currentAirport, fuel, nearbyAirport, totalMissions],
  );

  // Auto-trigger Recife arrival dialogue on first map load
  useEffect(() => {
    if (!introSeen || recifeStarted || dialogueQueue.length > 0) return;
    if (currentAirport?.id !== 'REC') return;
    setRecifeStarted(true);
    pushDialogue({
      ...RECIFE_CHEGADA,
      onComplete: () => pushDialogue({
        ...RECIFE_TUTORIAL_VERTICES,
        onComplete: () => activateBuildMode(),
      }),
    });
  }, [introSeen, recifeStarted, dialogueQueue.length, pushDialogue, currentAirport, activateBuildMode]);

  const arestasDialogueFiredRef = useRef(false);

  const handleRouteActivated = useCallback((routeId: string) => {
    onRouteActivated(routeId);
    if (!arestasDialogueFiredRef.current) {
      arestasDialogueFiredRef.current = true;
      pushDialogue({ ...RECIFE_TUTORIAL_ARESTAS });
    }
  }, [onRouteActivated, pushDialogue]);

  const handleCombatVictory = useCallback((encounterId: string) => {
    onCombatVictory(encounterId);
    setCombatActive(false);
    pushDialogue({
      ...RECIFE_PRE_PUZZLE,
      onComplete: () => openPuzzle(),
    });
  }, [onCombatVictory, openPuzzle, pushDialogue]);

  const handlePuzzleSolved = useCallback(() => {
    onPuzzleSolved();
    pushDialogue({
      ...RECIFE_ENCERRAMENTO,
      onComplete: () => {
        // Mark Recife task as complete — use the airport id as task id
        onCompleteTask('recife_completed', 0);
      },
    });
  }, [onCompleteTask, onPuzzleSolved, pushDialogue]);

  const handleAction = (action: Action) => {
    if (action === 'ENTRAR NO AEROPORTO' && currentAirport) {
      const encounter = getEncounterForAirport(currentAirport.id);
      if (encounter && !clearedCombatIds.includes(encounter.id)) {
        // Intercept: show glitch dialogue before starting combat
        pushDialogue({
          ...RECIFE_GLITCH_APARECE,
          onComplete: () => setCombatActive(true),
        });
        return;
      }
    }
    setActiveAction(action);
  };
  const showGlobalHud = shouldShowGlobalHud(activeAction);

  // Show intro cinematic first time — after all hooks
  if (!introSeen) {
    return <AeroTaleIntro onFinish={onIntroFinish} />;
  }

  // Active combat encounter check
  const activeEncounter = combatActive ? getEncounterForAirport(currentAirport?.id) : null;
  if (activeEncounter && !clearedCombatIds.includes(activeEncounter.id)) {
    return (
      <CombatScreen
        encounter={activeEncounter}
        clearedActIds={[]}
        onVictory={handleCombatVictory}
        onDefeat={() => setCombatActive(false)}
      />
    );
  }

  // Puzzle full-screen
  if (puzzleActive && currentAirport && AIRPORT_PUZZLES[currentAirport.id]) {
    return (
      <AirportPuzzlePanel
        puzzle={AIRPORT_PUZZLES[currentAirport.id]}
        onSolved={handlePuzzleSolved}
        onBack={onPuzzleBack}
      />
    );
  }

  return (
    <main className="h-screen w-screen overflow-hidden bg-black">
      <div className="crt-scanlines h-full w-full bg-black">
        <div className="flex h-full flex-col gap-2 p-3 md:p-4">
          <header className="flex items-center justify-between gap-3">
            <h1 className="font-pixel text-[10px] text-[#ffd700]">
              <span className="text-[#ff0000]">AERO</span>TALE
            </h1>
            <div className="flex items-center gap-2">
              <span className="hidden font-pixel text-[7px] text-[#b0b0b0] sm:inline">
                A MALHA AEREA - 8-BIT - 1984
              </span>
              <button type="button" onClick={onBack} className="at-top-button">
                VOLTAR
              </button>
              <button type="button" onClick={onReset} className="at-top-button at-top-button-danger">
                RESET
              </button>
            </div>
          </header>

          <section className="border-2 border-[#ffd700] bg-black">
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-2 py-1.5">
              {model.stats.map(stat => (
                <div key={stat.label} className="flex items-baseline gap-1.5">
                  <span className="font-pixel text-[7px] text-[#b0b0b0]">{stat.label}:</span>
                  <span className="font-term text-xl leading-none" style={{ color: STAT_COLORS[stat.tone] }}>
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-[#007000] px-2 py-1">
              <span className="font-pixel text-[7px] text-[#b0b0b0]">MISSAO:</span>{' '}
              <span className="font-term text-lg leading-none text-[#ff0000]">
                {model.missionLine.replace('MISSAO: ', '')}
              </span>
            </div>
          </section>

          {activeAction === 'VIAJAR' ? (
            <TravelPlannerPanel
              airports={airports}
              routes={routes}
              currentAirport={currentAirport}
              activeMission={activeMission}
              credits={credits}
              fuel={fuel}
              onConfirm={onConfirmTravel}
            />
          ) : activeAction === 'ENTRAR NO AEROPORTO' ? (
            <AirportMenuPanel
              airport={currentAirport}
              completedTaskIds={completedTaskIds}
              onCompleteTask={onCompleteTask}
              onBuyFuel={onBuyFuel}
              onLeaveAirport={() => setActiveAction('MAPA')}
            />
          ) : (
            <section
              className="min-h-0 flex-1"
              aria-label="Mapa retro jogavel do Brasil com a malha aerea"
            >
              <WorldMapPanel
                airports={airports}
                routes={routes}
                nearbyAirport={nearbyAirport}
                playerPosition={playerPosition}
                setPlayerPosition={setPlayerPosition}
                setTargetPosition={setTargetPosition}
                buildMode={buildMode}
                onRouteActivated={handleRouteActivated}
              />
            </section>
          )}

          {showGlobalHud && (
            <>
              <section className="relative bg-black">
                <div className="absolute -top-2 left-6 h-3 w-3 rounded-full bg-[#ff8800]" aria-hidden="true" />
                <div className="absolute -top-2 right-6 h-3 w-3 rounded-full bg-[#ff8800]" aria-hidden="true" />
                <div className="border-2 border-[#ff8800] bg-black px-4 py-3">
                  <p className="font-pixel text-[8px] leading-none text-[#ffd700]">{model.dialogueSpeaker}</p>
                  <div className="mt-2 space-y-1.5">
                    {model.dialogueLines.map((line, index) => (
                      <p key={line} className="font-term text-xl leading-tight text-[#ff0000]">
                        {line}
                        {index === model.dialogueLines.length - 1 && <span className="at-blink ml-1 text-[#e8e8e8]">_</span>}
                      </p>
                    ))}
                  </div>
                </div>
              </section>

              <nav className="flex flex-wrap gap-1 border-2 border-[#ffd700] bg-black p-1.5" aria-label="Acoes do jogo">
                {ACTIONS.map(action => {
                  const isActive = activeAction === action;
                  const disabled = action === 'ENTRAR NO AEROPORTO' && !currentAirport;
                  const hasPendingCombat = action === 'ENTRAR NO AEROPORTO' && currentAirport
                    ? (() => {
                        const enc = getEncounterForAirport(currentAirport.id);
                        return enc ? !clearedCombatIds.includes(enc.id) : false;
                      })()
                    : false;
                  return (
                    <button
                      key={action}
                      type="button"
                      onClick={() => handleAction(action)}
                      disabled={disabled}
                      className={`relative border-2 px-3 py-1.5 font-pixel text-[8px] leading-none transition-none disabled:cursor-not-allowed disabled:opacity-40 ${
                        hasPendingCombat
                          ? 'border-[#ff0000] bg-[#1a0000] text-[#ff4400] animate-pulse'
                          : isActive
                            ? 'border-[#00ffff] bg-[#006c00] text-[#00ff00]'
                            : 'border-[#007000] bg-black text-[#b0b0b0] hover:bg-[#002000] hover:text-[#00ff00]'
                      }`}
                    >
                      {hasPendingCombat ? '⚔ ' : isActive ? '> ' : ''}
                      {action}
                      {hasPendingCombat && (
                        <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-[#ff0000] at-blink" />
                      )}
                    </button>
                  );
                })}
              </nav>
            </>
          )}
        </div>
      </div>

      {/* DialogueOverlay — z-30, above everything including map */}
      {dialogueQueue.length > 0 && (
        <DialogueOverlay
          queue={dialogueQueue}
          onAdvance={onAdvanceDialogue}
        />
      )}
    </main>
  );
}
