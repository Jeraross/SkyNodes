import type { GameAirport, GameMission } from '../types';

type StatTone = 'green' | 'yellow' | 'cyan';

export interface RetroStat {
  label: string;
  value: string;
  tone: StatTone;
}

export interface RetroScreenModel {
  stats: RetroStat[];
  missionLine: string;
  dialogueSpeaker: string;
  dialogueLines: string[];
}

interface RetroScreenModelInput {
  currentAirport: GameAirport | null;
  activeMission: GameMission | null;
  completedCount: number;
  totalMissions: number;
  nearbyAirport: GameAirport | null;
}

export function buildRetroScreenModel({
  currentAirport,
  activeMission,
  completedCount,
  totalMissions,
  nearbyAirport,
}: RetroScreenModelInput): RetroScreenModel {
  const location = (currentAirport?.city ?? 'Em voo').toUpperCase();
  const missionTitle = activeMission?.title.toUpperCase() ?? 'REDE RECONSTRUIDA';
  const objective = activeMission?.objectiveAirportId
    ? `OBJETIVO MARCADO NO MAPA: ${activeMission.objectiveAirportId}.`
    : 'TODAS AS ROTAS PRINCIPAIS ESTAO OPERACIONAIS.';

  return {
    stats: [
      { label: 'LOCAL', value: location, tone: 'green' },
      { label: 'COMBUSTIVEL', value: '80', tone: 'yellow' },
      { label: 'CREDITOS', value: '1200', tone: 'yellow' },
      { label: 'REPUTACAO', value: `${completedCount}/${totalMissions}`, tone: 'cyan' },
    ],
    missionLine: `MISSAO: ${missionTitle}`,
    dialogueSpeaker: 'CONTROLADOR CARLOS:',
    dialogueLines: [
      (activeMission?.description ?? 'A malha aerea brasileira voltou a responder.').toUpperCase(),
      objective,
      nearbyAirport
        ? `AEROPORTO ${nearbyAirport.code} AO ALCANCE. USE VIAJAR PARA POUSAR.`
        : 'USE AS SETAS OU CLIQUE NO MAPA PARA NAVEGAR.',
    ],
  };
}
