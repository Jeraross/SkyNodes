from __future__ import annotations

import heapq
from collections import deque
from math import inf
from typing import Dict, List, Optional, Tuple

from .graph import Graph


def bfs(graph: Graph, start: str, goal: Optional[str] = None) -> List[str]:
    if start not in graph.vertices():
        return []

    visited = {start}
    order: List[str] = []
    queue = deque([start])

    while queue:
        current = queue.popleft()
        order.append(current)

        if goal is not None and current == goal:
            break

        for neighbor, _ in graph.neighbors(current):
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)

    return order


def dfs(graph: Graph, start: str, goal: Optional[str] = None) -> List[str]:
    if start not in graph.vertices():
        return []

    visited = set()
    order: List[str] = []

    def _visit(node: str) -> bool:
        visited.add(node)
        order.append(node)

        if goal is not None and node == goal:
            return True

        for neighbor, _ in graph.neighbors(node):
            if neighbor not in visited and _visit(neighbor):
                return True

        return False

    _visit(start)
    return order


def dijkstra(graph: Graph, start: str) -> Tuple[Dict[str, float], Dict[str, Optional[str]]]:
    distances: Dict[str, float] = {v: inf for v in graph.vertices()}
    previous: Dict[str, Optional[str]] = {v: None for v in graph.vertices()}

    if start not in distances:
        return distances, previous

    distances[start] = 0.0
    heap: List[Tuple[float, str]] = [(0.0, start)]

    while heap:
        current_distance, current = heapq.heappop(heap)

        if current_distance > distances[current]:
            continue

        for neighbor, weight in graph.neighbors(current):
            candidate = current_distance + weight
            if candidate < distances[neighbor]:
                distances[neighbor] = candidate
                previous[neighbor] = current
                heapq.heappush(heap, (candidate, neighbor))

    return distances, previous


def bellman_ford(
    graph: Graph, start: str
) -> Tuple[Dict[str, float], Dict[str, Optional[str]], bool]:
    vertices = graph.vertices()
    distances: Dict[str, float] = {v: inf for v in vertices}
    previous: Dict[str, Optional[str]] = {v: None for v in vertices}

    if start not in distances:
        return distances, previous, False

    distances[start] = 0.0

    edges: List[Tuple[str, str, float]] = []
    for source in vertices:
        for target, weight in graph.neighbors(source):
            edges.append((source, target, weight))

    for _ in range(len(vertices) - 1):
        updated = False
        for source, target, weight in edges:
            if distances[source] != inf and distances[source] + weight < distances[target]:
                distances[target] = distances[source] + weight
                previous[target] = source
                updated = True
        if not updated:
            break

    has_negative_cycle = False
    for source, target, weight in edges:
        if distances[source] != inf and distances[source] + weight < distances[target]:
            has_negative_cycle = True
            break

    return distances, previous, has_negative_cycle
