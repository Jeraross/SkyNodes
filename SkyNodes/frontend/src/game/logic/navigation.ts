import type { AirportId, GameAirport, GameRoute, PlayerPosition } from '../types';

export function distance(a: PlayerPosition, b: PlayerPosition): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function findNearbyAirport(
  position: PlayerPosition,
  airports: GameAirport[],
  radius: number,
): GameAirport | null {
  let closest: GameAirport | null = null;
  let closestDistance = Number.POSITIVE_INFINITY;

  for (const airport of airports) {
    const currentDistance = distance(position, airport);
    if (currentDistance <= radius && currentDistance < closestDistance) {
      closest = airport;
      closestDistance = currentDistance;
    }
  }

  return closest;
}

export function routeConnectsAirport(route: GameRoute, airportId: AirportId): boolean {
  return route.from === airportId || route.to === airportId;
}
