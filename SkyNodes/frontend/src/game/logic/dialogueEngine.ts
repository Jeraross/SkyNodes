export interface DialogueChoice {
  label: string;
  next: string;
}

export interface DialogueNode {
  speakerId: string;
  text: string;
  next?: string;
  choices?: DialogueChoice[];
}

export interface DialogueScript {
  start: string;
  nodes: Record<string, DialogueNode>;
}

export function getDialogueNode(script: DialogueScript, nodeId: string): DialogueNode | null {
  return script.nodes[nodeId] ?? null;
}

export function chooseDialogueOption(script: DialogueScript, currentNodeId: string, choiceIndex: number | null): string {
  const node = getDialogueNode(script, currentNodeId);
  if (!node) return currentNodeId;
  if (node.choices?.length) {
    return node.choices[choiceIndex ?? -1]?.next ?? currentNodeId;
  }
  return node.next ?? currentNodeId;
}
