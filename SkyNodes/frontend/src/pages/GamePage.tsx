import { useLocation } from 'wouter';
import { useGameController } from '../game/state/useGameController';
import AeroTaleScreen from '../game/ui/AeroTaleScreen';

export default function GamePage() {
  const [, navigate] = useLocation();
  const game = useGameController();

  return (
    <AeroTaleScreen
        airports={game.airports}
        routes={game.routes}
        activeMission={game.activeMission}
        currentAirport={game.currentAirport}
        nearbyAirport={game.nearbyAirport}
        completedCount={game.progress.completedMissionIds.length}
        totalMissions={game.missions.length}
        playerPosition={game.playerPosition}
        setPlayerPosition={game.setPlayerPosition}
        setTargetPosition={game.setTargetPosition}
        onLand={game.landAtAirport}
        onReset={game.reset}
        onBack={() => navigate('/')}
    />
  );
}
