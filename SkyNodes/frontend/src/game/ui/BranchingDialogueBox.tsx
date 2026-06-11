import { useMemo, useState } from 'react';
import { chooseDialogueOption, getDialogueNode, type DialogueScript } from '../logic/dialogueEngine';
import agenteJSprite from '../sprites/character_sprites/Antonio.png';
import liaSprite from '../sprites/character_sprites/a9.png';
import anaSprite from '../sprites/character_sprites/a2.png';
import controllerSprite from '../sprites/character_sprites/a4.png';
import passengerSprite from '../sprites/character_sprites/a7.png';

interface DialogueSpeaker {
  id: string;
  name: string;
  sprite: 'agente-j' | 'lia' | 'ana' | 'controller' | 'passenger';
}

interface BranchingDialogueBoxProps {
  script: DialogueScript;
  speakers: DialogueSpeaker[];
  onClose: () => void;
}

const SPRITE_ASSETS: Record<DialogueSpeaker['sprite'], string> = {
  'agente-j': agenteJSprite,
  lia: liaSprite,
  ana: anaSprite,
  controller: controllerSprite,
  passenger: passengerSprite,
};

export default function BranchingDialogueBox({ script, speakers, onClose }: BranchingDialogueBoxProps) {
  const [nodeId, setNodeId] = useState(script.start);
  const node = getDialogueNode(script, nodeId);
  const speaker = useMemo(
    () => speakers.find(item => item.id === node?.speakerId) ?? speakers[0],
    [node?.speakerId, speakers],
  );

  if (!node || !speaker) return null;

  const advance = () => {
    if (node.choices?.length) return;
    const next = chooseDialogueOption(script, nodeId, null);
    if (next === nodeId) onClose();
    else setNodeId(next);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-end bg-black/75 p-4 pb-8">
      <div className="w-full max-w-4xl mx-auto grid grid-cols-[120px_1fr] gap-0 border-2 border-[#ff8800] bg-black shadow-[0_0_40px_rgba(255,136,0,0.3)]">
        {/* Speaker portrait */}
        <div className="flex flex-col items-center justify-end border-r-2 border-[#ff8800] bg-[#080400] px-3 pb-3 pt-4">
          <DialogueSprite sprite={speaker.sprite} />
          <p className="mt-2 text-center font-pixel text-[8px] text-[#ffd700]">{speaker.name.toUpperCase()}</p>
        </div>
        {/* Dialogue text + choices */}
        <button type="button" onClick={advance} className="min-h-40 bg-black p-5 text-left focus:outline-none">
          <p className="font-pixel text-[7px] text-[#ff8800] mb-2 uppercase">{speaker.name}</p>
          <p className="font-term text-2xl leading-tight text-[#e8e8e8]">{node.text}</p>
          {node.choices?.length ? (
            <div className="mt-5 grid gap-2">
              {node.choices.map((choice, index) => (
                <button
                  key={choice.label}
                  type="button"
                  onClick={event => {
                    event.stopPropagation();
                    setNodeId(chooseDialogueOption(script, nodeId, index));
                  }}
                  className="border border-[#007000] bg-[#001800] px-4 py-2 text-left font-pixel text-[8px] text-[#00ff00] hover:border-[#00ffff] hover:text-[#00ffff]"
                >
                  ▶ {choice.label}
                </button>
              ))}
            </div>
          ) : (
            <p className="mt-5 font-pixel text-[7px] text-[#555]">▶ CLIQUE PARA CONTINUAR</p>
          )}
        </button>
      </div>
    </div>
  );
}

function DialogueSprite({ sprite }: { sprite: DialogueSpeaker['sprite'] }) {
  return (
    <img
      src={SPRITE_ASSETS[sprite]}
      alt=""
      className="pixelated mx-auto h-28 w-24 object-contain object-bottom"
      draggable={false}
    />
  );
}
