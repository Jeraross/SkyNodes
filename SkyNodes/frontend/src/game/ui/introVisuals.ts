import type { AtariSpriteId } from '../sprites/atariSprites';
import type { IntroVisualId } from './IntroSceneCanvas';

export function getIntroVisual(sceneIndex: number): { visualId: IntroVisualId; spriteId?: AtariSpriteId } {
  const visuals: Array<{ visualId: IntroVisualId; spriteId?: AtariSpriteId }> = [
    { visualId: 'solar' },      // 0 — O ano é 2082
    { visualId: 'solar' },      // 1 — Tempestade solar
    { visualId: 'impact' },     // 2 — Impacto nos sistemas
    { visualId: 'network' },    // 3 — Conexões desapareceram
    { visualId: 'alert' },      // 4 — Malha fragmentada
    { visualId: 'terminal' },   // 5 — Tecnologias antigas
    { visualId: 'terminal' },   // 6 — Único meio disponível
    { visualId: 'telephone' },  // 7 — Agente J: Alô
    { visualId: 'telephone' },  // 8 — Presidente fala
    { visualId: 'telephone' },  // 9 — Aposentado
    { visualId: 'telephone' },  // 10 — Pizza
    { visualId: 'telephone' },  // 11 — Estou dentro
    { visualId: 'title' },      // 12 — AEROTALE título
  ];
  return visuals[sceneIndex] ?? { visualId: 'terminal' };
}
