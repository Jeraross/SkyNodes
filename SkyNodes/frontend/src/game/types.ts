export type AirportId = string;
export type RouteId = string;
export type MissionId = string;

export type RouteState = 'locked' | 'available' | 'restored' | 'blocked';
export type MissionState = 'locked' | 'active' | 'completed';

export type AirportStatus =
  | 'unknown'
  | 'detected'
  | 'corrupted'
  | 'disconnected'
  | 'connected'
  | 'completed';

// Linear dialogue sequences for cutscene/narrative overlays.
// See dialogueEngine.ts for the graph-based branching system.
export interface DialogueLine {
  speaker: string;
  text: string;
  glitch?: boolean;
}

export interface DialogueSequence {
  id: string;
  lines: DialogueLine[];
  onComplete?: () => void;
}

export interface GameAirport {
  id: AirportId;
  code: string;
  name: string;
  city: string;
  region: string;
  x: number;
  y: number;
  status?: AirportStatus;
}

export interface GameRoute {
  id: RouteId;
  from: AirportId;
  to: AirportId;
  cost: number;
  state: RouteState;
  blockReason?: 'solar-anomaly';
}

export interface GameMission {
  id: MissionId;
  title: string;
  description: string;
  objectiveAirportId?: AirportId;
  requiredRouteId?: RouteId;
  unlocksRouteIds: RouteId[];
  anomalyRouteIds: RouteId[];
  rewardText: string;
}

export interface GameProgress {
  currentAirportId: AirportId | null;
  restoredRouteIds: RouteId[];
  completedMissionIds: MissionId[];
  completedTaskIds: string[];
  activeMissionId: MissionId;
  credits: number;
  fuel: number;
}

export interface PlayerPosition {
  x: number;
  y: number;
}
