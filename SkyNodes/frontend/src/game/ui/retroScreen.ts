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
  credits: number;
  fuel: number;
}

export function buildRetroScreenModel({
  currentAirport,
  activeMission,
  completedCount,
  totalMissions,
  nearbyAirport,
  credits,
  fuel,
}: RetroScreenModelInput): RetroScreenModel {
  const location = (currentAirport?.city ?? 'Em voo').toUpperCase();
  const missionTitle = activeMission?.title.toUpperCase() ?? 'REDE RECONSTRUIDA';
  const objective = activeMission?.objectiveAirportId
    ? `OBJETIVO MARCADO NO MAPA: ${activeMission.objectiveAirportId}.`
    : 'TODAS AS ROTAS PRINCIPAIS ESTAO OPERACIONAIS.';
  const routeStatus = activeMission?.anomalyRouteIds.length
    ? 'ANOMALIA DETECTADA NO CAMINHO: VALIDE AS CONEXOES DA MALHA.'
    : objective;
  const currentAirportPrompt = currentAirport && nearbyAirport?.id === currentAirport.id
    ? `${location} ESTA COM O NODO CORROMPIDO. ENTRE NO AEROPORTO E RESTAURE A TORRE.`
    : null;

  return {
    stats: [
      { label: 'LOCAL', value: location, tone: 'green' },
      { label: 'COMBUSTIVEL', value: String(fuel), tone: 'yellow' },
      { label: 'CREDITOS', value: String(credits), tone: 'yellow' },
      { label: 'MALHA', value: `${completedCount}/${totalMissions}`, tone: 'cyan' },
    ],
    missionLine: `PROTOCOLO-M: ${missionTitle}`,
    dialogueSpeaker: 'LIA:',
    dialogueLines: [
      'PROTOCOLO-M ATIVO. MALHA AEREA BRASILEIRA COMPROMETIDA.',
      routeStatus,
      currentAirportPrompt ?? (nearbyAirport && nearbyAirport.id !== currentAirport?.id
        ? `${nearbyAirport.code} DETECTADO. USE VIAJAR PARA POUSAR.`
        : 'MOVA-SE PELO MAPA PARA EXPLORAR NOVOS AEROPORTOS.'),
    ],
  };
}
