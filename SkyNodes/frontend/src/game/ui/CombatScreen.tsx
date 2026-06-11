import { useCallback, useEffect, useRef, useState } from 'react';
import type { CombatEncounter } from '../data/combatEncounters';
import { normalizeCombatKey } from '../logic/combatInput';
import AtariSpriteCanvas from './AtariSpriteCanvas';
import CombatBattleBox, { BOX_W, BOX_H, spawnWave, type CombatBullet } from './CombatBattleBox';

// ─── Constants ────────────────────────────────────────────────────────────────
const INVINCIBLE_MS = 700;
const PLAYER_MAX_HP = 100;
const FIGHT_BAR_SPEED = 0.3; // pixels per ms (0-200 range)
const ENEMY_DAMAGE_PER_HIT = 28; // % of enemy max HP (approx 3-4 hits to beat)

// ─── Types ────────────────────────────────────────────────────────────────────
type CombatPhase =
  | 'intro'
  | 'menu'
  | 'fight-bar'
  | 'act-menu'
  | 'item-list'
  | 'mercy-menu'
  | 'player-result'
  | 'enemy-talk'
  | 'enemy-attack'
  | 'victory'
  | 'defeat';

// ─── Props ────────────────────────────────────────────────────────────────────
interface CombatScreenProps {
  encounter: CombatEncounter;
  clearedActIds: string[];
  onVictory: (encounterId: string) => void;
  onDefeat: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function CombatScreen({ encounter, clearedActIds, onVictory, onDefeat }: CombatScreenProps) {
  const [phase, setPhase] = useState<CombatPhase>('intro');
  const [dialogueText, setDialogueText] = useState(encounter.flavorText);
  const [playerHp, setPlayerHp] = useState(PLAYER_MAX_HP);
  const [enemyHp, setEnemyHp] = useState(encounter.maxHp);
  const [turnCount, setTurnCount] = useState(0);
  const [actUsed, setActUsed] = useState<Set<string>>(new Set(clearedActIds));
  const [canMercy, setCanMercy] = useState(false);
  const [fightBarPos, setFightBarPos] = useState(0);
  const [fightBarDir, setFightBarDir] = useState(1);
  const [resultText, setResultText] = useState('');
  const [showStory, setShowStory] = useState(false);

  // Pixi battle box refs — mutated by CombatBattleBox useTick, no React re-renders needed
  const activeRef = useRef(false);
  const heartRef = useRef({ x: BOX_W / 2, y: BOX_H / 2 });
  const bulletsRef = useRef<CombatBullet[]>([]);
  const keysRef = useRef<Set<string>>(new Set());
  const invincibleRef = useRef(false);
  const pendingHpRef = useRef(PLAYER_MAX_HP);
  const spawnedWavesRef = useRef<Set<number>>(new Set());
  const attackStartRef = useRef(0);

  pendingHpRef.current = playerHp;

  // ─── Keyboard input ───────────────────────────────────────────────────────
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      keysRef.current.add(normalizeCombatKey(e.key));
      e.preventDefault();
    };
    const up = (e: KeyboardEvent) => keysRef.current.delete(normalizeCombatKey(e.key));
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  // ─── Current attack move (cycles through moves) ───────────────────────────
  const getMoveIndex = useCallback((turn: number) => {
    return turn % encounter.attackMoves.length;
  }, [encounter.attackMoves.length]);

  // ─── Heart hit callback (called from CombatBattleBox useTick on collision) ──
  const onHeartHit = useCallback(() => {
    if (invincibleRef.current) return;
    invincibleRef.current = true;
    const newHp = Math.max(0, pendingHpRef.current - 14);
    pendingHpRef.current = newHp;
    setPlayerHp(newHp);
    if (newHp <= 0) {
      activeRef.current = false;
      setPhase('defeat');
    }
    setTimeout(() => { invincibleRef.current = false; }, INVINCIBLE_MS);
  }, []);

  // ─── Start enemy attack phase ─────────────────────────────────────────────
  const startEnemyAttack = useCallback((turn: number) => {
    const move = encounter.attackMoves[getMoveIndex(turn)];
    setDialogueText(move.dialogue);
    bulletsRef.current = [];
    heartRef.current = { x: BOX_W / 2, y: BOX_H / 2 };
    setPhase('enemy-talk');

    setTimeout(() => {
      spawnedWavesRef.current = new Set();
      attackStartRef.current = Date.now();
      activeRef.current = true;
      setPhase('enemy-attack');
    }, 1800);
  }, [encounter.attackMoves, getMoveIndex]);

  // ─── Bullet spawning loop (setInterval while enemy-attack is active) ──────
  useEffect(() => {
    if (phase !== 'enemy-attack') {
      activeRef.current = false;
      return;
    }
    const move = encounter.attackMoves[getMoveIndex(turnCount)];
    const id = setInterval(() => {
      const elapsed = Date.now() - attackStartRef.current;
      move.waves.forEach((wave, i) => {
        if (!spawnedWavesRef.current.has(i) && elapsed >= wave.at) {
          spawnedWavesRef.current.add(i);
          spawnWave(wave, bulletsRef, heartRef.current);
        }
      });
      if (elapsed >= move.duration) {
        clearInterval(id);
        activeRef.current = false;
        bulletsRef.current = [];
        setPhase('menu');
        setTurnCount(t => t + 1);
        setDialogueText('');
      }
    }, 16);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // ─── Fight bar animation ──────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'fight-bar') return;
    const interval = setInterval(() => {
      setFightBarPos(prev => {
        const next = prev + FIGHT_BAR_SPEED * 16 * fightBarDir;
        if (next >= 200) { setFightBarDir(-1); return 200; }
        if (next <= 0)   { setFightBarDir(1);  return 0; }
        return next;
      });
    }, 16);
    return () => clearInterval(interval);
  }, [phase, fightBarDir]);

  // ─── Confirm FIGHT ────────────────────────────────────────────────────────
  const confirmFight = useCallback(() => {
    if (phase !== 'fight-bar') return;
    const center = 100;
    const dist = Math.abs(fightBarPos - center);
    let dmgPct: number;
    if (dist < 15)      dmgPct = 1.0;
    else if (dist < 35) dmgPct = 0.7;
    else if (dist < 60) dmgPct = 0.45;
    else                dmgPct = 0.2;

    const dmg = Math.round(encounter.maxHp * ENEMY_DAMAGE_PER_HIT / 100 * dmgPct);
    const newHp = Math.max(0, enemyHp - dmg);
    setEnemyHp(newHp);

    const hit = dist < 15 ? 'ACERTO PERFEITO!' : dist < 35 ? 'BOM ACERTO.' : dist < 60 ? 'ACERTO FRACO.' : 'QUASE ERROU.';
    setResultText(`* Você enviou um sinal corretivo. ${hit} DANO: ${dmg}`);
    setPhase('player-result');

    setTimeout(() => {
      if (newHp <= 0) {
        setPhase('victory');
      } else {
        startEnemyAttack(turnCount);
      }
    }, 2000);
  }, [phase, fightBarPos, enemyHp, encounter.maxHp, startEnemyAttack, turnCount]);

  // ─── Confirm ACT ─────────────────────────────────────────────────────────
  const confirmAct = useCallback((optId: string) => {
    const opt = encounter.actOptions.find(o => o.id === optId);
    if (!opt) return;

    const newUsed = new Set(actUsed);
    newUsed.add(optId);
    setActUsed(newUsed);

    if (opt.unlocksMercy) setCanMercy(true);
    if (opt.weakens) setEnemyHp(h => Math.max(1, h - Math.round(encounter.maxHp * 0.08)));

    setResultText(opt.result);
    setPhase('player-result');
    setTimeout(() => startEnemyAttack(turnCount), 2200);
  }, [encounter.actOptions, encounter.maxHp, actUsed, startEnemyAttack, turnCount]);

  // ─── Confirm MERCY ────────────────────────────────────────────────────────
  const confirmMercy = useCallback((spare: boolean) => {
    if (spare) {
      if (canMercy) {
        setEnemyHp(0);
        setPhase('victory');
      } else {
        setResultText(encounter.cantSpareText);
        setPhase('player-result');
        setTimeout(() => startEnemyAttack(turnCount), 2200);
      }
    } else {
      // Flee
      onDefeat();
    }
  }, [canMercy, encounter.cantSpareText, startEnemyAttack, turnCount, onDefeat]);

  // ─── ITEM use ────────────────────────────────────────────────────────────
  const useItem = useCallback((type: 'small' | 'full') => {
    if (type === 'small') {
      setPlayerHp(h => Math.min(PLAYER_MAX_HP, h + 30));
      setResultText('* Você usou um COMBUSTÍVEL DE EMERGÊNCIA. +30 HP.');
    } else {
      setPlayerHp(PLAYER_MAX_HP);
      setResultText('* Você usou um BACKUP DE SISTEMA. HP TOTALMENTE RESTAURADO.');
    }
    setPhase('player-result');
    setTimeout(() => startEnemyAttack(turnCount), 1800);
  }, [startEnemyAttack, turnCount]);

  // ─── First turn trigger ───────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'intro') return;
    const t = setTimeout(() => setPhase('menu'), 3000);
    return () => clearTimeout(t);
  }, [phase]);

  // ─── Keyboard shortcuts for menu ─────────────────────────────────────────
  useEffect(() => {
    if (phase === 'fight-bar') {
      const handler = (e: KeyboardEvent) => {
        if (['z', 'Z', 'Enter', ' '].includes(e.key)) confirmFight();
      };
      window.addEventListener('keydown', handler);
      return () => window.removeEventListener('keydown', handler);
    }
  }, [phase, confirmFight]);

  // ─── HP bar widths ────────────────────────────────────────────────────────
  const playerHpPct = Math.max(0, (playerHp / PLAYER_MAX_HP) * 100);
  const enemyHpPct  = Math.max(0, (enemyHp  / encounter.maxHp) * 100);
  const hpColor = playerHpPct > 50 ? '#ffd700' : playerHpPct > 25 ? '#ff8800' : '#ff0000';

  // ─── Render ───────────────────────────────────────────────────────────────
  if (phase === 'victory') {
    return (
      <VictoryScreen
        encounter={encounter}
        showStory={showStory}
        onShowStory={() => setShowStory(true)}
        onContinue={() => onVictory(encounter.id)}
      />
    );
  }

  if (phase === 'defeat') {
    return <DefeatScreen encounter={encounter} onRetry={() => onDefeat()} />;
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black overflow-hidden">
      <div className="crt-scanlines h-full w-full flex flex-col items-center justify-center">
        <div className="w-full max-w-2xl px-3 sm:px-4 flex max-h-screen flex-col gap-2.5 overflow-y-auto py-4 sm:gap-3">

          {/* Enemy info */}
          <div className="flex flex-col items-center gap-3 border-2 border-[#ff0000] bg-black p-3 shadow-[0_0_18px_rgba(255,0,0,0.18)] sm:flex-row sm:items-start sm:gap-4">
            <div className="shrink-0">
              <AtariSpriteCanvas
                spriteId={encounter.spriteId}
                scale={encounter.id === 'anac-bsb-final' ? 5 : 6}
                frameColor={0xff2200}
                glitch={phase === 'enemy-talk' || phase === 'enemy-attack'}
                label={`Sprite de ${encounter.name}`}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-center font-pixel text-[9px] leading-relaxed text-[#ffd700] sm:text-left">{encounter.name}</p>
              <p className="mt-1 text-center font-pixel text-[7px] leading-relaxed text-[#b0b0b0] sm:text-left">{encounter.subtitle}</p>
              <div className="mt-3 flex items-center gap-2">
                <span className="font-pixel text-[7px] text-[#b0b0b0]">HP</span>
                <div className="flex-1 h-3 border border-[#007000] bg-black relative overflow-hidden">
                  <div
                    className="h-full transition-all duration-300"
                    style={{ width: `${enemyHpPct}%`, backgroundColor: '#00ff00' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Dialogue / result box */}
          <div className="border-2 border-[#ffd700] bg-black p-3 min-h-[64px] shadow-[0_0_14px_rgba(255,215,0,0.12)]">
            <p className="font-term text-lg leading-tight text-[#e0e0e0] sm:text-xl">
              {phase === 'intro' ? encounter.flavorText
                : phase === 'player-result' ? resultText
                : phase === 'enemy-talk'   ? dialogueText
                : phase === 'menu'         ? (turnCount === 0 ? '* AGIR repara o sistema. LUTAR força um sinal corretivo. MISERICORDIA só funciona quando o nodo estabiliza.' : '* O que você vai fazer?')
                : ''}
            </p>
          </div>

          {/* Battle box — always mounted to keep the WebGL context alive across phase transitions.
              Firefox destroys/leaks WebGL contexts on unmount; hiding via CSS avoids that. */}
          <div
            className="flex justify-center overflow-hidden"
            style={{ display: (phase === 'enemy-talk' || phase === 'enemy-attack') ? 'flex' : 'none' }}
          >
            <CombatBattleBox
              activeRef={activeRef}
              heartRef={heartRef}
              bulletsRef={bulletsRef}
              keysRef={keysRef}
              invincibleRef={invincibleRef}
              onHit={onHeartHit}
            />
          </div>

          {/* Player HP */}
          <div className="flex items-center gap-3">
            <span className="font-pixel text-[8px] text-[#ffd700]">AGENTE J</span>
            <div className="flex-1 h-4 border-2 border-[#007000] bg-black relative overflow-hidden">
              <div
                className="h-full transition-all duration-200"
                style={{ width: `${playerHpPct}%`, backgroundColor: hpColor }}
              />
            </div>
            <span className="font-pixel text-[8px]" style={{ color: hpColor }}>
              {playerHp}/{PLAYER_MAX_HP}
            </span>
          </div>

          {/* FIGHT bar */}
          {phase === 'fight-bar' && (
            <div className="border-2 border-[#ffd700] bg-black p-3">
              <p className="font-pixel text-[8px] text-[#ffd700] mb-2">PRESSIONE Z / ENTER PARA ATACAR</p>
              <div className="relative h-8 w-full bg-black border border-[#007000] overflow-hidden">
                {/* Green zone */}
                <div className="absolute top-0 bottom-0 bg-[#004400]" style={{ left: '35%', width: '30%' }} />
                <div className="absolute top-0 bottom-0 bg-[#006000]" style={{ left: '42.5%', width: '15%' }} />
                {/* Indicator */}
                <div
                  className="absolute top-0 bottom-0 w-3 bg-white"
                  style={{ left: `${(fightBarPos / 200) * 100}%`, transform: 'translateX(-50%)' }}
                />
              </div>
              <button
                type="button"
                onClick={confirmFight}
                className="mt-2 w-full border border-[#ffd700] font-pixel text-[7px] text-[#ffd700] py-1.5 hover:bg-[#181400]"
              >
                ATACAR [Z]
              </button>
            </div>
          )}

          {/* Action menu */}
          {phase === 'menu' && (
            <div className="grid grid-cols-2 gap-1 sm:grid-cols-4">
              {[
                { label: '⚔ LUTAR',    action: () => { setFightBarPos(0); setFightBarDir(1); setPhase('fight-bar'); } },
                { label: '◆ AGIR',     action: () => setPhase('act-menu') },
                { label: '▲ ITEM',     action: () => setPhase('item-list') },
                { label: '♥ MISERIC.', action: () => setPhase('mercy-menu') },
              ].map(btn => (
                <button
                  key={btn.label}
                  type="button"
                  onClick={btn.action}
                  className="min-h-11 border-2 border-[#ffd700] bg-black px-1 py-2 font-pixel text-[7px] leading-relaxed text-[#ffd700] hover:bg-[#181400] hover:text-[#fff] active:scale-95 sm:text-[8px]"
                >
                  {btn.label}
                </button>
              ))}
            </div>
          )}

          {/* ACT submenu */}
          {phase === 'act-menu' && (
            <div className="border-2 border-[#00ffff] bg-black p-3">
              <p className="font-pixel text-[8px] text-[#00ffff] mb-2">O QUE FAZER?</p>
              <div className="grid gap-1.5">
                {encounter.actOptions.map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => confirmAct(opt.id)}
                    className={`border px-3 py-2 text-left font-pixel text-[8px] transition-none ${
                      actUsed.has(opt.id)
                        ? 'border-[#007000] text-[#006000] bg-[#001000]'
                        : 'border-[#00ffff] text-[#00ffff] bg-black hover:bg-[#001818]'
                    }`}
                  >
                    {'>'} {opt.label} {actUsed.has(opt.id) ? '✓' : ''}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setPhase('menu')}
                  className="border border-[#444] px-3 py-1.5 font-pixel text-[7px] text-[#666] hover:text-[#999]"
                >
                  VOLTAR
                </button>
              </div>
            </div>
          )}

          {/* ITEM submenu */}
          {phase === 'item-list' && (
            <div className="border-2 border-[#ff8800] bg-black p-3">
              <p className="font-pixel text-[8px] text-[#ff8800] mb-2">USAR ITEM:</p>
              <div className="grid gap-1.5">
                <button
                  type="button"
                  onClick={() => useItem('small')}
                  className="border border-[#ff8800] px-3 py-2 text-left font-pixel text-[8px] text-[#ff8800] hover:bg-[#180800]"
                >
                  {'>'} COMBUSTÍVEL DE EMERGÊNCIA +30 HP
                </button>
                <button
                  type="button"
                  onClick={() => useItem('full')}
                  className="border border-[#ffd700] px-3 py-2 text-left font-pixel text-[8px] text-[#ffd700] hover:bg-[#181400]"
                >
                  {'>'} BACKUP DE SISTEMA — HP TOTAL
                </button>
                <button
                  type="button"
                  onClick={() => setPhase('menu')}
                  className="border border-[#444] px-3 py-1.5 font-pixel text-[7px] text-[#666] hover:text-[#999]"
                >
                  VOLTAR
                </button>
              </div>
            </div>
          )}

          {/* MERCY submenu */}
          {phase === 'mercy-menu' && (
            <div className="border-2 border-[#ff00ff] bg-black p-3">
              <p className="font-pixel text-[8px] text-[#ff00ff] mb-2">MISERICÓRDIA:</p>
              <div className="grid gap-1.5">
                <button
                  type="button"
                  onClick={() => confirmMercy(true)}
                  className={`border px-3 py-2 text-left font-pixel text-[8px] transition-none ${
                    canMercy
                      ? 'border-[#ff00ff] text-[#ff00ff] bg-black hover:bg-[#180018] animate-pulse'
                      : 'border-[#440044] text-[#440044] bg-black cursor-not-allowed'
                  }`}
                >
                  {'>'} {encounter.mercyLabel} {canMercy ? '← DISPONÍVEL!' : '(BLOQUEADO)'}
                </button>
                <button
                  type="button"
                  onClick={() => confirmMercy(false)}
                  className="border border-[#444] px-3 py-2 text-left font-pixel text-[8px] text-[#888] hover:bg-[#111]"
                >
                  {'>'} RECUAR — FUGIR DO COMBATE
                </button>
                <button
                  type="button"
                  onClick={() => setPhase('menu')}
                  className="border border-[#444] px-3 py-1.5 font-pixel text-[7px] text-[#666] hover:text-[#999]"
                >
                  VOLTAR
                </button>
              </div>
              {!canMercy && (
                <p className="mt-2 font-term text-lg text-[#660066] leading-tight">{encounter.cantSpareText}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Victory Screen ───────────────────────────────────────────────────────────
function VictoryScreen({
  encounter,
  showStory,
  onShowStory,
  onContinue,
}: {
  encounter: CombatEncounter;
  showStory: boolean;
  onShowStory: () => void;
  onContinue: () => void;
}) {
  const [visibleChars, setVisibleChars] = useState(0);
  const text = encounter.victoryText;

  useEffect(() => {
    if (visibleChars >= text.length) return;
    const t = setTimeout(() => setVisibleChars(c => c + 1), 22);
    return () => clearTimeout(t);
  }, [visibleChars, text]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black">
      <div className="crt-scanlines h-full w-full flex flex-col items-center justify-center gap-6 px-6">
        <p className="font-pixel text-[11px] text-[#ffd700] animate-pulse">✦ VITÓRIA ✦</p>
        <div className="w-full max-w-lg border-2 border-[#00ff00] bg-black p-4">
          <p className="font-term text-xl leading-relaxed text-[#00ff00] whitespace-pre-line">
            {text.slice(0, visibleChars)}
          </p>
        </div>

        {visibleChars >= text.length && (
          <>
            {encounter.storyReveal && !showStory && (
              <button
                type="button"
                onClick={onShowStory}
                className="border-2 border-[#ffd700] bg-black px-6 py-2 font-pixel text-[8px] text-[#ffd700] hover:bg-[#181400] animate-pulse"
              >
                {'>'} [LOG SECRETO ENCONTRADO]
              </button>
            )}

            {showStory && encounter.storyReveal && (
              <div className="w-full max-w-lg border-2 border-[#ff8800] bg-[#0a0500] p-4">
                <p className="font-pixel text-[7px] text-[#ff8800] mb-2">— LOG DO SISTEMA —</p>
                <p className="font-term text-lg leading-relaxed text-[#ffa040]">{encounter.storyReveal}</p>
              </div>
            )}

            <button
              type="button"
              onClick={onContinue}
              className="border-2 border-[#00ff00] bg-black px-8 py-2.5 font-pixel text-[8px] text-[#00ff00] hover:bg-[#001800]"
            >
              CONTINUAR {'>>'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Defeat Screen ────────────────────────────────────────────────────────────
function DefeatScreen({
  encounter,
  onRetry,
}: {
  encounter: CombatEncounter;
  onRetry: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black">
      <div className="crt-scanlines h-full w-full flex flex-col items-center justify-center gap-6 px-6">
        <p className="font-pixel text-[11px] text-[#ff0000]">✗ FALHOU ✗</p>
        <div className="w-full max-w-lg border-2 border-[#ff0000] bg-black p-4">
          <p className="font-term text-xl leading-relaxed text-[#ff4400]">{encounter.defeatText}</p>
        </div>
        <button
          type="button"
          onClick={onRetry}
          className="border-2 border-[#ff0000] bg-black px-8 py-2.5 font-pixel text-[8px] text-[#ff0000] hover:bg-[#180000]"
        >
          TENTAR NOVAMENTE
        </button>
      </div>
    </div>
  );
}
