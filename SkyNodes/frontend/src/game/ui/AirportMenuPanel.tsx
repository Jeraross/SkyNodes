import { useMemo, useState } from 'react';
import { getAirportMenu, type AirportNpc, type AirportTask } from '../data/airportMenus';
import type { GameAirport } from '../types';
import BranchingDialogueBox from './BranchingDialogueBox';
import antonioSprite from '../sprites/character_sprites/Antonio.png';
import carlosSprite from '../sprites/character_sprites/Carlos.png';
import anaSprite from '../sprites/character_sprites/a2.png';
import controllerSprite from '../sprites/character_sprites/a4.png';
import passengerSprite from '../sprites/character_sprites/a7.png';

interface AirportMenuPanelProps {
  airport: GameAirport | null;
  credits: number;
  fuel: number;
  onEarnCredits: (amount: number) => void;
  onBuyFuel: (amount: number, cost: number) => void;
}

type AirportSection = 'npcs' | 'tasks' | 'shop' | 'status';

const NPC_SPRITES: Record<AirportNpc['sprite'], string> = {
  antonio: antonioSprite,
  carlos: carlosSprite,
  ana: anaSprite,
  controller: controllerSprite,
  passenger: passengerSprite,
};

const SECTIONS: Array<{ id: AirportSection; label: string }> = [
  { id: 'npcs', label: 'FALAR COM NPCS' },
  { id: 'tasks', label: 'TAREFAS' },
  { id: 'shop', label: 'LOJA' },
  { id: 'status', label: 'STATUS DO AEROPORTO' },
];

export default function AirportMenuPanel({
  airport,
  credits,
  fuel,
  onEarnCredits,
  onBuyFuel,
}: AirportMenuPanelProps) {
  const menu = useMemo(() => getAirportMenu(airport?.id ?? '---'), [airport?.id]);
  const [section, setSection] = useState<AirportSection>('npcs');
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [activeNpc, setActiveNpc] = useState<AirportNpc | null>(null);

  const completeTask = (task: AirportTask) => {
    if (!completedTasks.includes(task.id)) {
      onEarnCredits(task.reward);
      setCompletedTasks(prev => [...prev, task.id]);
    }
  };

  return (
    <section className="grid min-h-0 flex-1 grid-cols-[260px_1fr] gap-2 overflow-hidden">
      <aside className="border-2 border-[#ffd700] bg-black p-3">
        <p className="font-pixel text-[8px] text-[#ffd700]">{menu.title}</p>
        <p className="mt-2 font-term text-xl leading-none text-[#00ff00]">{airport?.city ?? 'Terminal'}</p>
        <div className="mt-5 grid gap-1">
          {SECTIONS.map(item => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSection(item.id)}
              className={`border-2 px-3 py-2 text-left font-pixel text-[8px] leading-none ${
                section === item.id
                  ? 'border-[#00ffff] bg-[#006c00] text-[#00ff00]'
                  : 'border-[#007000] bg-black text-[#b0b0b0] hover:bg-[#002000]'
              }`}
            >
              {section === item.id ? '> ' : ''}
              {item.label}
            </button>
          ))}
        </div>
        <div className="mt-5 border-t border-[#007000] pt-3 font-term text-xl leading-none text-[#ffd700]">
          <p>CREDITOS {credits}</p>
          <p>COMBUSTIVEL {fuel}</p>
        </div>
      </aside>

      <div className="flex min-h-0 flex-col gap-2">
        <div className="min-h-0 flex-1 overflow-auto border-2 border-[#006c00] bg-black p-4">
          {section === 'npcs' && (
            <div className="grid gap-3 md:grid-cols-2">
              {menu.npcs.map(npc => (
                <NpcCard
                  key={npc.id}
                  npc={npc}
                  onTalk={() => {
                    setActiveNpc(npc);
                  }}
                />
              ))}
            </div>
          )}

          {section === 'tasks' && (
            <div className="grid gap-3">
              {menu.tasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  completed={completedTasks.includes(task.id)}
                  onComplete={() => completeTask(task)}
                />
              ))}
            </div>
          )}

          {section === 'shop' && (
            <div className="grid gap-3 md:grid-cols-2">
              {menu.shop.fuelOptions.map(option => (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => {
                    onBuyFuel(option.amount, option.cost);
                  }}
                  className="border-2 border-[#00ffff] bg-black p-4 text-left hover:bg-[#002020]"
                >
                  <p className="font-pixel text-[8px] text-[#00ffff]">{option.label}</p>
                  <p className="mt-2 font-term text-2xl text-[#ffd700]">CUSTO {option.cost}</p>
                </button>
              ))}
            </div>
          )}

          {section === 'status' && (
            <div className="border-2 border-[#007000] bg-[#001800] p-4">
              <p className="font-pixel text-[8px] text-[#00ff00]">STATUS OPERACIONAL</p>
              <p className="mt-3 font-term text-2xl leading-none text-[#ffd700]">{menu.status}</p>
              <p className="mt-3 font-term text-xl leading-tight text-[#b0b0b0]">
                COMPLETE TAREFAS PARA GANHAR CREDITOS E RESTAURAR A MALHA AEREA COM CONHECIMENTO DE GRAFOS E AVD.
              </p>
            </div>
          )}
        </div>

      </div>

      {activeNpc && (
        <BranchingDialogueBox
          script={activeNpc.dialogue}
          speakers={[
            { id: 'antonio', name: 'Antonio', sprite: 'antonio' },
            { id: 'carlos', name: 'Carlos', sprite: 'carlos' },
            { id: activeNpc.id, name: activeNpc.name, sprite: activeNpc.sprite },
          ]}
          onClose={() => setActiveNpc(null)}
        />
      )}
    </section>
  );
}

function NpcCard({ npc, onTalk }: { npc: AirportNpc; onTalk: () => void }) {
  return (
    <button type="button" onClick={onTalk} className="border-2 border-[#007000] bg-[#001800] p-4 text-left hover:border-[#00ffff]">
      <div className="flex items-center gap-3">
        <img src={NPC_SPRITES[npc.sprite]} alt="" className="pixelated h-20 w-16 object-contain object-bottom" draggable={false} />
        <div>
          <p className="font-pixel text-[8px] text-[#ffd700]">{npc.name.toUpperCase()}</p>
          <p className="mt-2 font-term text-xl leading-none text-[#00ff00]">{npc.role}</p>
          <p className="mt-2 font-term text-lg leading-tight text-[#b0b0b0]">CONVERSAR</p>
        </div>
      </div>
    </button>
  );
}

function TaskCard({ task, completed, onComplete }: { task: AirportTask; completed: boolean; onComplete: () => void }) {
  return (
    <div className="border-2 border-[#ff8800] bg-black p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-pixel text-[8px] text-[#ffd700]">{task.title.toUpperCase()}</p>
          <p className="mt-2 font-term text-xl leading-tight text-[#b0b0b0]">{task.prompt}</p>
          <p className="mt-1 font-term text-xl text-[#00ffff]">RECOMPENSA {task.reward}</p>
        </div>
        <button type="button" onClick={onComplete} className="at-action-button at-action-button-primary">
          {completed ? 'REVER' : 'INICIAR'}
        </button>
      </div>
      {task.kind === 'graph' && <GraphDragMock completed={completed} />}
      {task.kind === 'chart' && <ChartDragMock completed={completed} />}
    </div>
  );
}

function GraphDragMock({ completed }: { completed: boolean }) {
  return (
    <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-4 border border-[#007000] bg-[#001800] p-3">
      <NodeBox label="REC" />
      <button type="button" className={`border-2 px-4 py-2 font-pixel text-[8px] ${completed ? 'border-[#00ffff] text-[#00ff00]' : 'border-[#ffd700] text-[#ffd700]'}`}>
        ARESTA
      </button>
      <NodeBox label="JPA" />
    </div>
  );
}

function ChartDragMock({ completed }: { completed: boolean }) {
  return (
    <div className="mt-4 flex items-end gap-2 border border-[#007000] bg-[#001800] p-3">
      {[28, 48, 34, 60].map((height, index) => (
        <div key={index} className={completed ? 'bg-[#00ffff]' : 'bg-[#ffd700]'} style={{ height, width: 28 }} />
      ))}
      <p className="font-pixel text-[7px] text-[#b0b0b0]">ARRASTE METRICAS</p>
    </div>
  );
}

function NodeBox({ label }: { label: string }) {
  return (
    <div className="border-2 border-[#ff0000] bg-black p-3 text-center font-pixel text-[8px] text-[#00ff00]">
      {label}
    </div>
  );
}
