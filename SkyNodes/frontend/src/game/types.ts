export type AirportId = string;
export type RouteId = string;
export type MissionId = string;

export type RouteState = 'locked' | 'available' | 'restored' | 'blocked';
export type MissionState = 'locked' | 'active' | 'completed';

export interface GameAirport {
  id: AirportId;
  code: string;
  name: string;
  city: string;
  region: string;
  x: number;
  y: number;
}

export interface GameRoute {
  id: RouteId;
  from: AirportId;
  to: AirportId;
  cost: number;
  state: RouteState;
}

export interface GameMission {
  id: MissionId;
  title: string;
  description: string;
  objectiveAirportId?: AirportId;
  requiredRouteId?: RouteId;
  unlocksRouteIds: RouteId[];
  rewardText: string;
}

export interface GameProgress {
  currentAirportId: AirportId | null;
  restoredRouteIds: RouteId[];
  completedMissionIds: MissionId[];
  activeMissionId: MissionId;
}

export interface PlayerPosition {
  x: number;
  y: number;
}
