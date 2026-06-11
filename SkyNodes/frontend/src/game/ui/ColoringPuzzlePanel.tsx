import { useState, useEffect } from 'react';
import type { ColoringPuzzle, ColoringAssignments } from '../logic/coloringPuzzle';
import { getConflicts, isColoringSolved } from '../logic/coloringPuzzle';

const W = 480;
const H = 320;
const R = 28;

interface ColoringPuzzlePanelProps {
  puzzle: ColoringPuzzle;
  completed: boolean;
  onComplete: () => void;
}

export default function ColoringPuzzlePanel({ puzzle, completed, onComplete }: ColoringPuzzlePanelProps) {
  const [assignments, setAssignments] = useState<ColoringAssignments>({});
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [pulse, setPulse] = useState(false);
  const conflicts = getConflicts(puzzle, assignments);
  const solved = isColoringSolved(puzzle, assignments);

  useEffect(() => {
    if (solved) {
      setPulse(true);
      setTimeout(() => onComplete(), 800);
    }
  }, [solved, onComplete]);

  function handleNodeClick(nodeId: string) {
    setSelectedNode(nodeId === selectedNode ? null : nodeId);
  }

  function handleColorClick(color: string) {
    if (!selectedNode) return;
    const next = { ...assignments, [selectedNode]: color };
    setAssignments(next);
    setSelectedNode(null);
  }

  return (
    <div className="mt-3">
      <p className="mb-2 font-term text-xl text-[#00ffff]">{puzzle.instruction}</p>
      <div
        className="relative border border-[#224422] bg-[#020617]"
        style={{ width: W, height: H }}
      >
        {/* SVG edges */}
        <svg className="absolute inset-0" width={W} height={H}>
          {puzzle.edges.map((edge, i) => {
            const fn = puzzle.nodes.find(n => n.id === edge.from)!;
            const tn = puzzle.nodes.find(n => n.id === edge.to)!;
            return (
              <line
                key={i}
                x1={fn.x * W} y1={fn.y * H}
                x2={tn.x * W} y2={tn.y * H}
                stroke="#224422"
                strokeWidth={2}
              />
            );
          })}
        </svg>
        {/* Nodes */}
        {puzzle.nodes.map(node => {
          const nx = node.x * W;
          const ny = node.y * H;
          const color = assignments[node.id];
          const isSelected = selectedNode === node.id;
          const isConflict = conflicts.has(node.id);
          const borderColor = isConflict ? '#ff4444' : isSelected ? '#ffffff' : '#446644';
          return (
            <button
              key={node.id}
              type="button"
              onClick={() => handleNodeClick(node.id)}
              className="absolute flex items-center justify-center rounded-full font-term text-lg font-bold"
              style={{
                left: nx - R,
                top: ny - R,
                width: R * 2,
                height: R * 2,
                background: color ?? '#0a1628',
                border: `3px solid ${borderColor}`,
                color: color ? '#000' : '#888',
                animation: isConflict ? 'pulse 0.5s infinite' : undefined,
                boxShadow: isSelected ? `0 0 12px ${color ?? '#fff'}` : undefined,
              }}
            >
              {node.label}
            </button>
          );
        })}
        {/* Conflict indicators */}
        {Array.from(conflicts).map(nodeId => {
          const node = puzzle.nodes.find(n => n.id === nodeId)!;
          return (
            <div
              key={`conflict-${nodeId}`}
              className="pointer-events-none absolute font-term text-2xl text-[#ff4444]"
              style={{ left: node.x * W + R - 4, top: node.y * H - R - 8 }}
            >
              ⚡
            </div>
          );
        })}
      </div>
      {/* Color palette */}
      {selectedNode && (
        <div className="mt-2 flex items-center gap-3">
          <span className="font-term text-xl text-[#888]">FREQUÊNCIA:</span>
          {puzzle.colors.map((color, i) => (
            <button
              key={color}
              type="button"
              onClick={() => handleColorClick(color)}
              className="h-10 w-20 rounded border-2 border-[#446644] font-term text-xl font-bold text-black transition-transform hover:scale-110"
              style={{ background: color }}
            >
              {puzzle.colorLabels[i]}
            </button>
          ))}
        </div>
      )}
      {!selectedNode && (
        <p className="mt-2 font-term text-xl text-[#666]">Clique em um nó para selecionar, depois escolha a frequência.</p>
      )}
      {solved && (
        <div className="mt-2 text-center font-term text-xl text-[#00ff00]">
          ✓ FREQUÊNCIAS ALOCADAS SEM INTERFERÊNCIA
        </div>
      )}
    </div>
  );
}
