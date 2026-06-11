import { useState, useEffect } from 'react';
import type { TopoSortPuzzle } from '../logic/topoSortPuzzle';
import { isPlacementValid, isTopoSortValid } from '../logic/topoSortPuzzle';

interface TopoSortPanelProps {
  puzzle: TopoSortPuzzle;
  completed: boolean;
  onComplete: () => void;
}

export default function TopoSortPanel({ puzzle, completed, onComplete }: TopoSortPanelProps) {
  const [slots, setSlots] = useState<(string | null)[]>(Array(puzzle.nodes.length).fill(null));
  const [unplaced, setUnplaced] = useState<string[]>(puzzle.nodes.map(n => n.id));
  const [dragging, setDragging] = useState<string | null>(null);
  const [flashSlot, setFlashSlot] = useState<number | null>(null);
  const solved = isTopoSortValid(puzzle, slots.filter(Boolean) as string[]) && !slots.includes(null);

  useEffect(() => {
    if (solved) setTimeout(() => onComplete(), 600);
  }, [solved, onComplete]);

  function getLabel(nodeId: string) {
    return puzzle.nodes.find(n => n.id === nodeId)?.label ?? nodeId;
  }

  function handleDrop(slotIndex: number) {
    if (!dragging) return;
    const isValid = isPlacementValid(puzzle, slots, dragging, slotIndex);
    if (!isValid) {
      setFlashSlot(slotIndex);
      setTimeout(() => setFlashSlot(null), 400);
      setDragging(null);
      return;
    }
    const prevSlot = slots.findIndex(s => s === dragging);
    const newSlots = [...slots];
    if (prevSlot !== -1) newSlots[prevSlot] = null;
    // If slot occupied, return occupant to unplaced
    if (newSlots[slotIndex]) {
      setUnplaced(prev => [...prev.filter(id => id !== dragging), newSlots[slotIndex]!]);
    } else {
      setUnplaced(prev => prev.filter(id => id !== dragging));
    }
    newSlots[slotIndex] = dragging;
    setSlots(newSlots);
    setDragging(null);
  }

  return (
    <div className="mt-3">
      <p className="mb-3 font-term text-xl text-[#00ffff]">{puzzle.instruction}</p>

      {/* Dependency arrows display */}
      <div className="mb-3 flex flex-wrap gap-2">
        {puzzle.edges.map((e, i) => (
          <span key={i} className="border border-[#335533] px-2 py-1 font-term text-lg text-[#888]">
            {getLabel(e.from)} → {getLabel(e.to)}
          </span>
        ))}
      </div>

      {/* Unplaced nodes — also serves as drop target to return placed nodes */}
      <div
        className="mb-4 flex min-h-[52px] flex-wrap gap-2 border border-dashed border-[#222] p-2"
        onDragOver={e => e.preventDefault()}
        onDrop={() => {
          if (!dragging) return;
          const prevSlot = slots.findIndex(s => s === dragging);
          if (prevSlot !== -1) {
            const newSlots = [...slots];
            newSlots[prevSlot] = null;
            setSlots(newSlots);
            setUnplaced(prev => [...prev, dragging]);
          }
          setDragging(null);
        }}
      >
        {unplaced.map(nodeId => (
          <div
            key={nodeId}
            draggable
            onDragStart={() => setDragging(nodeId)}
            onDragEnd={() => setDragging(null)}
            className="cursor-grab border-2 border-[#00aaff] bg-[#001a2a] px-3 py-2 font-term text-xl text-[#00ffff] active:cursor-grabbing"
          >
            {getLabel(nodeId)}
          </div>
        ))}
        {unplaced.length === 0 && !solved && (
          <span className="font-term text-xl text-[#555]">Todos os nós foram posicionados</span>
        )}
      </div>

      {/* Slots */}
      <div className="flex flex-wrap gap-2">
        {slots.map((slotContent, i) => {
          const isFlashing = flashSlot === i;
          return (
            <div
              key={i}
              onDragOver={e => e.preventDefault()}
              onDrop={() => handleDrop(i)}
              className="flex min-h-[52px] min-w-[80px] flex-col items-center justify-center border-2 font-term text-xl"
              style={{
                borderColor: isFlashing ? '#ff4444' : slotContent ? '#00ff00' : '#335533',
                background: isFlashing ? '#2a0000' : slotContent ? '#002200' : '#001100',
                animation: isFlashing ? 'pulse 0.2s' : undefined,
              }}
            >
              <span className="text-lg text-[#555]">{i + 1}</span>
              {slotContent && (
                <div
                  draggable
                  onDragStart={() => setDragging(slotContent)}
                  onDragEnd={() => setDragging(null)}
                  className="cursor-grab text-[#00ff00]"
                >
                  {getLabel(slotContent)}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {solved && (
        <div className="mt-3 text-center font-term text-xl text-[#00ff00]">
          ✓ SEQUÊNCIA CORRETA — PROTOCOLO VALIDADO
        </div>
      )}
    </div>
  );
}
