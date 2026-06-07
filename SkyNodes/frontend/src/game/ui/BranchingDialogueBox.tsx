import { useMemo, useState } from 'react';
import { chooseDialogueOption, getDialogueNode, type DialogueScript } from '../logic/dialogueEngine';
import antonioSprite from '../sprites/character_sprites/Antonio.png';
import carlosSprite from '../sprites/character_sprites/Carlos.png';
import anaSprite from '../sprites/character_sprites/a2.png';
import controllerSprite from '../sprites/character_sprites/a4.png';
import passengerSprite from '../sprites/character_sprites/a7.png';

interface DialogueSpeaker {
  id: string;
  name: string;
  sprite: 'antonio' | 'carlos' | 'ana' | 'controller' | 'passenger';
}

interface BranchingDialogueBoxProps {
  script: DialogueScript;
  speakers: DialogueSpeaker[];
  onClose: () => void;
}

const SPRITE_ASSETS: Record<DialogueSpeaker['sprite'], string> = {
  antonio: antonioSprite,
  carlos: carlosSprite,
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
    <div className="absolute inset-0 z-40 flex items-end bg-black/65 p-4">
      <div className="grid w-full grid-cols-[140px_1fr] gap-3 border-2 border-[#ff8800] bg-black p-3">
        <div className="border-2 border-[#007000] bg-[#001800] p-3">
          <DialogueSprite sprite={speaker.sprite} />
          <p className="mt-3 text-center font-pixel text-[8px] text-[#ffd700]">{speaker.name.toUpperCase()}</p>
        </div>
        <button type="button" onClick={advance} className="min-h-36 border-2 border-[#ffd700] bg-black p-4 text-left">
          <p className="font-term text-2xl leading-tight text-[#ff0000]">{node.text}</p>
          {node.choices?.length ? (
            <div className="mt-4 grid gap-2">
              {node.choices.map((choice, index) => (
                <button
                  key={choice.label}
                  type="button"
                  onClick={event => {
                    event.stopPropagation();
                    setNodeId(chooseDialogueOption(script, nodeId, index));
                  }}
                  className="border border-[#007000] bg-[#001800] px-3 py-2 text-left font-pixel text-[8px] text-[#00ff00] hover:border-[#00ffff]"
                >
                  &gt; {choice.label}
                </button>
              ))}
            </div>
          ) : (
            <p className="mt-4 font-pixel text-[7px] text-[#b0b0b0]">CLIQUE PARA AVANCAR</p>
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
