import type { QuizMode } from './quizPathData';

export interface LeaderboardEntry {
  rank: number;
  player: string;
  mode: QuizMode;
  score: number;
  total: number;
  date: string;
}

export const LEADERBOARD_MOCK: LeaderboardEntry[] = [
  { rank: 1,  player: 'GraphMaster',  mode: 'grafos', score: 33, total: 33, date: '2026-06-01' },
  { rank: 2,  player: 'DataWizard',   mode: 'avd',    score: 32, total: 33, date: '2026-06-02' },
  { rank: 3,  player: 'MixKing',      mode: 'mix',    score: 31, total: 33, date: '2026-06-03' },
  { rank: 4,  player: 'BFSRunner',    mode: 'grafos', score: 30, total: 33, date: '2026-06-01' },
  { rank: 5,  player: 'BarChartPro',  mode: 'avd',    score: 29, total: 33, date: '2026-06-02' },
  { rank: 6,  player: 'DijkstraFan',  mode: 'grafos', score: 28, total: 33, date: '2026-05-30' },
  { rank: 7,  player: 'VizNinja',     mode: 'avd',    score: 27, total: 33, date: '2026-05-29' },
  { rank: 8,  player: 'NodeHopper',   mode: 'mix',    score: 26, total: 33, date: '2026-05-28' },
  { rank: 9,  player: 'EdgeSeeker',   mode: 'grafos', score: 25, total: 33, date: '2026-06-03' },
  { rank: 10, player: 'ScatterPlot',  mode: 'avd',    score: 24, total: 33, date: '2026-06-01' },
  { rank: 11, player: 'CycleFinder',  mode: 'grafos', score: 23, total: 33, date: '2026-05-27' },
  { rank: 12, player: 'HeatMapper',   mode: 'avd',    score: 22, total: 33, date: '2026-05-26' },
  { rank: 13, player: 'TreeWalker',   mode: 'mix',    score: 21, total: 33, date: '2026-05-25' },
  { rank: 14, player: 'ArcAnalyst',   mode: 'avd',    score: 20, total: 33, date: '2026-05-24' },
  { rank: 15, player: 'SpanTree',     mode: 'grafos', score: 19, total: 33, date: '2026-05-23' },
];
