import { useEffect, useMemo, useState } from 'react';
import { PxlKitIcon, type PxlKitData } from '@pxlkit/core';
import { ArrowRight, Check, Gear, Grid, Home, Package, Settings, SparkleSmall } from '@pxlkit/ui';
import { getAirportMenu, type AirportNpc, type AirportShopOption, type AirportTask } from '../data/airportMenus';
import {
  getGraphPuzzleForTask,
  isGraphPuzzleSolved,
  placeGraphPuzzleToken,
  type GraphPuzzleAssignments,
  type GraphPuzzleDefinition,
} from '../logic/graphPuzzle';
import {
  connectNetworkRoute,
  getNetworkRestorationPuzzle,
  isNetworkRestorationSolved,
  moveNetworkNode,
  type NetworkNodePositions,
  type NetworkRestorationPuzzle as NetworkRestorationPuzzleDefinition,
} from '../logic/networkRestoration';
import type { GameAirport } from '../types';
import BranchingDialogueBox from './BranchingDialogueBox';
import antonioSprite from '../sprites/character_sprites/Antonio.png';
import carlosSprite from '../sprites/character_sprites/Carlos.png';
import anaSprite from '../sprites/character_sprites/a2.png';
import controllerSprite from '../sprites/character_sprites/a4.png';
import passengerSprite from '../sprites/character_sprites/a7.png';

interface AirportMenuPanelProps {
  airport: GameAirport | null;
  completedTaskIds: string[];
  onCompleteTask: (taskId: string, reward: number) => void;
  onBuyFuel: (amount: number, cost: number) => void;
  onLeaveAirport?: () => void;
}

type AirportRoomId = 'terminal' | 'tower' | 'tasks' | 'workshop' | 'shop' | 'exit';
type AirportRoomDetail = 'npcs' | 'tasks' | 'shop' | 'status' | 'exit';
type AirportRoomAccent = 'green' | 'cyan' | 'yellow' | 'orange';

export interface AirportInteriorRoom {
  id: AirportRoomId;
  label: string;
  legend: string;
  icon: PxlKitData;
  npcIds: string[];
  detail: AirportRoomDetail;
  accent: AirportRoomAccent;
}

const NPC_SPRITES: Record<AirportNpc['sprite'], string> = {
  antonio: antonioSprite,
  carlos: carlosSprite,
  ana: anaSprite,
  controller: controllerSprite,
  passenger: passengerSprite,
};

export const AIRPORT_INTERIOR_ROOMS: AirportInteriorRoom[] = [
  { id: 'terminal', label: 'TERMINAL', legend: 'AREA', icon: Home, npcIds: ['lia'], detail: 'npcs', accent: 'green' },
  { id: 'tower', label: 'TORRE DE CONTROLE', legend: 'TORRE', icon: Settings, npcIds: ['carlos'], detail: 'npcs', accent: 'cyan' },
  { id: 'tasks', label: 'TAREFAS', legend: 'MISSAO', icon: Check, npcIds: [], detail: 'tasks', accent: 'yellow' },
  { id: 'workshop', label: 'OFICINA', legend: 'AREA', icon: Gear, npcIds: ['ana'], detail: 'npcs', accent: 'green' },
  { id: 'shop', label: 'LOJA / BALCAO', legend: 'AREA', icon: Grid, npcIds: [], detail: 'shop', accent: 'green' },
  { id: 'exit', label: 'SAIDA / MAPA', legend: 'SAIDA', icon: ArrowRight, npcIds: [], detail: 'exit', accent: 'orange' },
];

const ACCENT_CLASSES: Record<AirportRoomAccent, { border: string; text: string; bg: string }> = {
  green: { border: 'border-[#007000]', text: 'text-[#00ff00]', bg: 'bg-black' },
  cyan: { border: 'border-[#00ffff]', text: 'text-[#00ffff]', bg: 'bg-[#001818]' },
  yellow: { border: 'border-[#ffd700]', text: 'text-[#ffd700]', bg: 'bg-[#181400]' },
  orange: { border: 'border-[#ff8800]', text: 'text-[#ff8800]', bg: 'bg-[#180800]' },
};

export function getDefaultAirportRoom(airportId?: string | null): AirportRoomId {
  return airportId === 'REC' ? 'tower' : 'terminal';
}

function getRoomById(roomId: AirportRoomId): AirportInteriorRoom {
  return AIRPORT_INTERIOR_ROOMS.find(room => room.id === roomId) ?? AIRPORT_INTERIOR_ROOMS[0];
}

function getRoomNpcs(room: AirportInteriorRoom, npcs: AirportNpc[]) {
  const mappedNpcs = room.npcIds.map(npcId => npcs.find(npc => npc.id === npcId)).filter((npc): npc is AirportNpc => Boolean(npc));
  return mappedNpcs.length > 0 || room.detail !== 'npcs' ? mappedNpcs : npcs;
}

function getRoomTasks(room: AirportInteriorRoom, tasks: AirportTask[]) {
  return room.detail === 'tasks' ? tasks : [];
}

const LEGEND_ITEMS = [
  { label: 'AREA', color: '#00ff00', glyph: '□' },
  { label: 'TORRE', color: '#ff0000', glyph: '▲' },
  { label: 'NPC', color: '#00ffff', glyph: '●' },
  { label: 'MISSAO', color: '#ff00ff', glyph: '■' },
  { label: 'SAIDA', color: '#ffd700', glyph: '→' },
];

export default function AirportMenuPanel({
  airport,
  completedTaskIds,
  onCompleteTask,
  onBuyFuel,
  onLeaveAirport,
}: AirportMenuPanelProps) {
  const menu = useMemo(() => getAirportMenu(airport?.id ?? '---'), [airport?.id]);
  const defaultRoom = useMemo(() => getDefaultAirportRoom(airport?.id), [airport?.id]);
  const [activeRoomId, setActiveRoomId] = useState<AirportRoomId>(defaultRoom);
  const [activeNpc, setActiveNpc] = useState<AirportNpc | null>(null);
  const activeRoom = getRoomById(activeRoomId);
  const activeRoomNpcs = getRoomNpcs(activeRoom, menu.npcs);
  const activeRoomTasks = getRoomTasks(activeRoom, menu.tasks);

  useEffect(() => {
    setActiveRoomId(defaultRoom);
    setActiveNpc(null);
  }, [defaultRoom]);

  const completeTask = (task: AirportTask) => {
    onCompleteTask(task.id, task.reward);
  };

  return (
    <section className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden">
      <div className="relative flex min-h-0 flex-1 flex-col border-2 border-[#007000] bg-black p-3">
        <p className="text-center font-pixel text-[8px] leading-none text-[#ffd700]">INTERIOR DO AEROPORTO</p>

        <AirportLegend />

        <div className="mx-auto mt-8 grid w-full max-w-[800px] grid-cols-2 gap-2 md:grid-cols-4">
          {AIRPORT_INTERIOR_ROOMS.map(room => (
            <AirportRoomButton
              key={room.id}
              room={room}
              npcs={getRoomNpcs(room, menu.npcs)}
              selected={room.id === activeRoomId}
              onSelect={() => setActiveRoomId(room.id)}
            />
          ))}
        </div>

        <div className="mt-3 min-h-0 flex-1 overflow-auto border-2 border-[#003800] bg-[#000800] p-3">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-[#007000] pb-2">
            <div>
              <p className="font-pixel text-[8px] leading-none text-[#ffd700]">{activeRoom.label}</p>
              <p className="mt-1 font-term text-xl leading-none text-[#00ff00]">
                {airport?.city?.toUpperCase() ?? 'AEROPORTO'} / {menu.status}
              </p>
            </div>
          </div>

          <RoomDetail
            room={activeRoom}
            npcs={activeRoomNpcs}
            tasks={activeRoomTasks}
            allTasks={menu.tasks}
            shopOptions={menu.shop.fuelOptions}
            completedTaskIds={completedTaskIds}
            onTalk={setActiveNpc}
            onCompleteTask={completeTask}
            onBuyFuel={onBuyFuel}
            onLeaveAirport={onLeaveAirport}
          />
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

function AirportLegend() {
  return (
    <div className="absolute right-3 top-3 hidden border border-[#007000] bg-black p-2 sm:block">
      {LEGEND_ITEMS.map(item => (
        <div key={item.label} className="flex items-center gap-2 font-pixel text-[7px] leading-[1.45] text-[#b0b0b0]">
          <span style={{ color: item.color }}>{item.glyph}</span>
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

function AirportRoomButton({
  room,
  npcs,
  selected,
  onSelect,
}: {
  room: AirportInteriorRoom;
  npcs: AirportNpc[];
  selected: boolean;
  onSelect: () => void;
}) {
  const accent = selected ? ACCENT_CLASSES.cyan : ACCENT_CLASSES[room.accent];

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative h-20 border-2 ${accent.border} ${selected ? 'bg-[#001818]' : accent.bg} px-2 py-2 text-center transition-none hover:border-[#00ffff] hover:bg-[#002020] md:h-24`}
    >
      <span className="absolute left-1 top-1 font-pixel text-[8px] leading-none text-[#00ffff]">{selected ? '>' : ''}</span>
      <span className="flex justify-center">
        <PxlKitIcon icon={room.icon} size={28} appearance="palette" aria-label="" />
      </span>
      <span className={`mt-1 block font-pixel text-[7px] leading-tight ${accent.text}`}>{room.label}</span>
      {npcs[0] && (
        <span className="mt-1 flex items-center justify-center gap-1 font-pixel text-[6px] leading-none text-[#b0b0b0]">
          <PxlKitIcon icon={SparkleSmall} size={10} appearance="palette" aria-label="" />
          {npcs[0].name.split(' ').at(-1)?.toUpperCase() ?? npcs[0].name.toUpperCase()}
        </span>
      )}
    </button>
  );
}

function RoomDetail({
  room,
  npcs,
  tasks,
  allTasks,
  shopOptions,
  completedTaskIds,
  onTalk,
  onCompleteTask,
  onBuyFuel,
  onLeaveAirport,
}: {
  room: AirportInteriorRoom;
  npcs: AirportNpc[];
  tasks: AirportTask[];
  allTasks: AirportTask[];
  shopOptions: AirportShopOption[];
  completedTaskIds: string[];
  onTalk: (npc: AirportNpc) => void;
  onCompleteTask: (task: AirportTask) => void;
  onBuyFuel: (amount: number, cost: number) => void;
  onLeaveAirport?: () => void;
}) {
  if (room.detail === 'npcs') {
    return (
      <div className="grid gap-3 md:grid-cols-2">
        {npcs.map(npc => (
          <NpcCard key={npc.id} npc={npc} onTalk={() => onTalk(npc)} />
        ))}
      </div>
    );
  }

  if (room.detail === 'tasks') {
    const visibleTasks = tasks.length > 0 ? tasks : allTasks;
    return (
      <div className="grid gap-3">
        {visibleTasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            completed={completedTaskIds.includes(task.id)}
            onComplete={() => onCompleteTask(task)}
          />
        ))}
      </div>
    );
  }

  if (room.detail === 'shop') {
    return (
      <div className="grid gap-3 md:grid-cols-2">
        {shopOptions.map(option => (
          <button
            key={option.label}
            type="button"
            onClick={() => {
              onBuyFuel(option.amount, option.cost);
            }}
            className="border-2 border-[#00ffff] bg-black p-4 text-left hover:bg-[#002020]"
          >
            <div className="flex items-center gap-3">
              <PxlKitIcon icon={Package} size={28} appearance="palette" aria-label="" />
              <div>
                <p className="font-pixel text-[8px] text-[#00ffff]">{option.label}</p>
                <p className="mt-2 font-term text-2xl text-[#ffd700]">CUSTO {option.cost}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    );
  }

  if (room.detail === 'exit') {
    return (
      <button type="button" onClick={onLeaveAirport} className="border-2 border-[#ff8800] bg-black p-4 text-left hover:bg-[#180800]">
        <div className="flex items-center gap-3">
          <PxlKitIcon icon={ArrowRight} size={32} appearance="palette" aria-label="" />
          <div>
            <p className="font-pixel text-[8px] text-[#ff8800]">SAIR PARA O MAPA</p>
            <p className="mt-2 font-term text-xl leading-tight text-[#b0b0b0]">RETORNAR A VISUALIZACAO DA MALHA AEREA.</p>
          </div>
        </div>
      </button>
    );
  }

  return (
    <div className="border-2 border-[#007000] bg-[#001800] p-4">
      <p className="font-pixel text-[8px] text-[#00ff00]">STATUS OPERACIONAL</p>
      <p className="mt-3 font-term text-2xl leading-none text-[#ffd700]">SISTEMAS LOCAIS EM VERIFICACAO</p>
      <p className="mt-3 font-term text-xl leading-tight text-[#b0b0b0]">
        COMPLETE TAREFAS PARA GANHAR CREDITOS E RESTAURAR A MALHA AEREA COM CONHECIMENTO DE GRAFOS E AVD.
      </p>
    </div>
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
  const graphPuzzle = task.kind === 'graph' ? getGraphPuzzleForTask(task.id) : null;
  const networkPuzzle = task.kind === 'restore-network' ? getNetworkRestorationPuzzle(task.id) : null;

  return (
    <div className="border-2 border-[#ff8800] bg-black p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-pixel text-[8px] text-[#ffd700]">{task.title.toUpperCase()}</p>
          <p className="mt-2 font-term text-xl leading-tight text-[#b0b0b0]">{task.prompt}</p>
          <p className="mt-1 font-term text-xl text-[#00ffff]">RECOMPENSA {task.reward}</p>
        </div>
        {task.kind !== 'graph' && task.kind !== 'restore-network' && (
          <button type="button" onClick={onComplete} className="at-action-button at-action-button-primary">
            {completed ? 'REVER' : 'INICIAR'}
          </button>
        )}
      </div>
      {task.kind === 'graph' && graphPuzzle && (
        <GraphDragPuzzle puzzle={graphPuzzle} completed={completed} onComplete={onComplete} />
      )}
      {task.kind === 'graph' && !graphPuzzle && (
        <GraphDragFallback completed={completed} onComplete={onComplete} />
      )}
      {task.kind === 'restore-network' && networkPuzzle && (
        <NetworkRestorationCanvas puzzle={networkPuzzle} completed={completed} onComplete={onComplete} />
      )}
      {task.kind === 'chart' && <ChartDragMock completed={completed} />}
    </div>
  );
}

function NetworkRestorationCanvas({
  puzzle,
  completed,
  onComplete,
}: {
  puzzle: NetworkRestorationPuzzleDefinition;
  completed: boolean;
  onComplete: () => void;
}) {
  const initialPositions = useMemo(
    () => Object.fromEntries(puzzle.nodes.map(node => [node.id, { x: node.x, y: node.y }])),
    [puzzle],
  );
  const [positions, setPositions] = useState<NetworkNodePositions>(initialPositions);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedRouteIds, setSelectedRouteIds] = useState<string[]>([]);
  const [guidePage, setGuidePage] = useState(0);
  const solved = completed || isNetworkRestorationSolved(puzzle, selectedRouteIds);

  const nodePosition = (nodeId: string) => positions[nodeId] ?? puzzle.nodes.find(node => node.id === nodeId) ?? { x: 0, y: 0 };

  const moveFromPointer = (event: React.PointerEvent<SVGSVGElement>) => {
    if (!draggingNodeId || completed) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * puzzle.canvas.width;
    const y = ((event.clientY - rect.top) / rect.height) * puzzle.canvas.height;
    setPositions(prev => moveNetworkNode(puzzle, prev, draggingNodeId, x, y));
  };

  const connectFromSelection = (nodeId: string) => {
    if (completed) return;
    if (!selectedNodeId) {
      setSelectedNodeId(nodeId);
      return;
    }
    if (selectedNodeId === nodeId) {
      setSelectedNodeId(null);
      return;
    }
    setSelectedRouteIds(prev => connectNetworkRoute(puzzle, prev, selectedNodeId, nodeId));
    setSelectedNodeId(null);
  };

  return (
    <div className="mt-4 grid gap-3 xl:grid-cols-[1fr_230px]">
      <div className="border border-[#007000] bg-[#001800] p-3">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="font-pixel text-[8px] text-[#00ff00]">{puzzle.title}</p>
            <p className="mt-1 font-term text-lg leading-tight text-[#b0b0b0]">
              ARRASTE OS NOS NO CANVAS. CLIQUE EM DOIS NOS PARA CONECTAR TODAS AS ROTAS POSSIVEIS.
            </p>
          </div>
          <button
            type="button"
            disabled={!solved || completed}
            onClick={onComplete}
            className="at-action-button at-action-button-primary disabled:opacity-40"
          >
            {completed ? 'MALHA OK' : 'VALIDAR MALHA'}
          </button>
        </div>

        <svg
          viewBox={`0 0 ${puzzle.canvas.width} ${puzzle.canvas.height}`}
          className="h-[320px] w-full border-2 border-[#00ffff] bg-black"
          role="img"
          aria-label="Canvas para montar grafo da malha aerea"
          onPointerMove={moveFromPointer}
          onPointerUp={() => setDraggingNodeId(null)}
          onPointerLeave={() => setDraggingNodeId(null)}
        >
          <rect width={puzzle.canvas.width} height={puzzle.canvas.height} fill="#000000" />
          <g opacity="0.35">
            {Array.from({ length: 14 }).map((_, index) => (
              <line key={`v-${index}`} x1={index * 40} y1="0" x2={index * 40} y2={puzzle.canvas.height} stroke="#003000" strokeWidth="1" />
            ))}
            {Array.from({ length: 8 }).map((_, index) => (
              <line key={`h-${index}`} x1="0" y1={index * 40} x2={puzzle.canvas.width} y2={index * 40} stroke="#003000" strokeWidth="1" />
            ))}
          </g>

          {puzzle.candidateRoutes.map(route => {
            const from = nodePosition(route.from);
            const to = nodePosition(route.to);
            const selected = selectedRouteIds.includes(route.id);
            return (
              <g key={route.id}>
                <line
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke={selected ? '#00ffff' : route.blocked ? '#a80000' : '#ffd700'}
                  strokeWidth={selected ? 5 : 2}
                  strokeDasharray={route.blocked ? '8 8' : undefined}
                  opacity={selected || route.blocked ? 0.95 : 0.45}
                />
                {route.blocked && (
                  <text x={(from.x + to.x) / 2} y={(from.y + to.y) / 2 - 6} fill="#ff0000" fontSize="22" textAnchor="middle">
                    ~
                  </text>
                )}
              </g>
            );
          })}

          {puzzle.nodes.map(node => {
            const pos = nodePosition(node.id);
            const selected = selectedNodeId === node.id;
            return (
              <g
                key={node.id}
                role="button"
                tabIndex={0}
                onClick={() => connectFromSelection(node.id)}
                onPointerDown={event => {
                  event.currentTarget.setPointerCapture(event.pointerId);
                  setDraggingNodeId(node.id);
                }}
                className="cursor-grab"
              >
                <rect
                  x={pos.x - 26}
                  y={pos.y - 18}
                  width="52"
                  height="36"
                  fill={selected ? '#003030' : '#001800'}
                  stroke={selected ? '#00ffff' : '#ff0000'}
                  strokeWidth="3"
                />
                <text x={pos.x} y={pos.y + 5} fill="#ffd700" fontSize="16" fontFamily="monospace" textAnchor="middle">
                  {node.label}
                </text>
              </g>
            );
          })}
        </svg>

        <p className={`mt-3 font-term text-xl leading-tight ${solved ? 'text-[#00ff00]' : 'text-[#ff0000]'}`}>
          {solved ? 'MALHA RESTABELECIDA. O GRAFO LOCAL ESTA CONECTADO.' : 'CONECTE TODOS OS NOS ALCANCAVEIS COM TODAS AS ROTAS POSSIVEIS. ONDAS SOLARES BLOQUEIAM ARESTAS INSTAVEIS.'}
        </p>
      </div>

      <div className="border-2 border-[#ffd700] bg-black p-3 shadow-[5px_5px_0_#3a2600]">
        <p className="font-pixel text-[8px] text-[#ffd700]">GUIA DE CAMPO</p>
        <div className="mt-3 min-h-40 border border-[#7a5200] bg-[#100800] p-3">
          <p className="font-term text-xl leading-tight text-[#e8e8e8]">{puzzle.guidePages[guidePage]}</p>
        </div>
        <div className="mt-3 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setGuidePage(page => Math.max(0, page - 1))}
            disabled={guidePage === 0}
            className="at-action-button disabled:opacity-40"
          >
            VOLTAR
          </button>
          <span className="font-pixel text-[7px] text-[#b0b0b0]">
            {guidePage + 1}/{puzzle.guidePages.length}
          </span>
          <button
            type="button"
            onClick={() => setGuidePage(page => Math.min(puzzle.guidePages.length - 1, page + 1))}
            disabled={guidePage === puzzle.guidePages.length - 1}
            className="at-action-button disabled:opacity-40"
          >
            PROX
          </button>
        </div>
      </div>
    </div>
  );
}

function GraphDragPuzzle({
  puzzle,
  completed,
  onComplete,
}: {
  puzzle: GraphPuzzleDefinition;
  completed: boolean;
  onComplete: () => void;
}) {
  const [assignments, setAssignments] = useState<GraphPuzzleAssignments>({});
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);
  const solved = completed || isGraphPuzzleSolved(puzzle, assignments);
  const assignedTokenIds = new Set(Object.values(assignments));

  const placeToken = (slotId: string, tokenId: string | null) => {
    if (!tokenId || completed) return;
    setAssignments(prev => placeGraphPuzzleToken(puzzle, prev, slotId, tokenId));
    setSelectedTokenId(null);
  };

  return (
    <div className="mt-4 border border-[#007000] bg-[#001800] p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-pixel text-[8px] text-[#00ff00]">{puzzle.title}</p>
          <p className="mt-1 font-term text-lg leading-tight text-[#b0b0b0]">{puzzle.instruction}</p>
        </div>
        <button
          type="button"
          disabled={!solved || completed}
          onClick={onComplete}
          className="at-action-button at-action-button-primary disabled:opacity-40"
        >
          {completed ? 'CONCLUIDO' : 'VALIDAR'}
        </button>
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-[220px_1fr]">
        <div className="border border-[#006c00] bg-black p-2">
          <p className="font-pixel text-[7px] text-[#ffd700]">PECAS</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {puzzle.tokens.map(token => {
              const used = assignedTokenIds.has(token.id);
              const selected = selectedTokenId === token.id;
              return (
                <button
                  key={token.id}
                  type="button"
                  draggable={!completed && !used}
                  disabled={completed || used}
                  onClick={() => setSelectedTokenId(token.id)}
                  onDragStart={event => event.dataTransfer.setData('text/plain', token.id)}
                  className={`border-2 px-2 py-2 font-pixel text-[7px] leading-none ${
                    selected
                      ? 'border-[#00ffff] bg-[#003030] text-[#00ffff]'
                      : 'border-[#007000] bg-[#001800] text-[#ffd700]'
                  } disabled:opacity-35`}
                >
                  {token.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          {puzzle.slots.map(slot => {
            const assignedToken = puzzle.tokens.find(token => token.id === assignments[slot.id]);
            return (
              <button
                key={slot.id}
                type="button"
                onClick={() => placeToken(slot.id, selectedTokenId)}
                onDragOver={event => event.preventDefault()}
                onDrop={event => placeToken(slot.id, event.dataTransfer.getData('text/plain'))}
                className="min-h-24 border-2 border-dashed border-[#00ffff] bg-black p-3 text-center hover:bg-[#002020]"
              >
                <p className="font-pixel text-[7px] text-[#00ffff]">{slot.label}</p>
                <p className="mt-4 font-term text-2xl leading-none text-[#ffd700]">
                  {assignedToken?.label ?? '---'}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <p className={`mt-3 font-term text-xl leading-tight ${solved ? 'text-[#00ff00]' : 'text-[#ff0000]'}`}>
        {solved ? 'GRAFO VALIDADO. A MALHA ACEITOU A CONFIGURACAO.' : 'ARRASTE AS PECAS PARA MONTAR O GRAFO CORRETO.'}
      </p>
    </div>
  );
}

function GraphDragFallback({ completed, onComplete }: { completed: boolean; onComplete: () => void }) {
  return (
    <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-4 border border-[#007000] bg-[#001800] p-3">
      <NodeBox label="REC" />
      <button
        type="button"
        onClick={onComplete}
        className={`border-2 px-4 py-2 font-pixel text-[8px] ${completed ? 'border-[#00ffff] text-[#00ff00]' : 'border-[#ffd700] text-[#ffd700]'}`}
      >
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
