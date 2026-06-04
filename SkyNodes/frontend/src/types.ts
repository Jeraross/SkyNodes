export type GlobeMode = 'orbit' | 'brazil-locked' | 'analysis';
export type ViewMode = 'globe' | 'graph' | 'map';
export type ModalType = 'overview' | 'routes' | 'centrality' | 'regions' | null;

export type SimulationStatus = 'idle' | 'ready' | 'playing' | 'paused' | 'finished';

export type PlanePosition = {
  lat: number;
  lng: number;
  altitude: number;
  heading: number;
  visible: boolean;
};

export type FlightSimulation = {
  status: SimulationStatus;
  airportPath: string[];
  routeIds: string[];
  currentSegmentIndex: number;
  progress: number;
  speedMultiplier: number;
  totalCost?: number;
};
