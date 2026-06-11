export const AEROTALE_ACTIONS = ['MAPA', 'VIAJAR', 'MISSOES', 'ENTRAR NO AEROPORTO'] as const;

export type AeroTaleAction = (typeof AEROTALE_ACTIONS)[number];

export function shouldShowGlobalHud(action: AeroTaleAction) {
  return action !== 'ENTRAR NO AEROPORTO';
}
