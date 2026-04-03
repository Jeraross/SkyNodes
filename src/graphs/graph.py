from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, List, Tuple


@dataclass
class Graph:
    directed: bool = True
    _adj: Dict[str, List[Tuple[str, float]]] = field(default_factory=dict)

    def add_vertex(self, vertex: str) -> None:
        self._adj.setdefault(vertex, [])

    def add_edge(self, source: str, target: str, weight: float = 1.0) -> None:
        self.add_vertex(source)
        self.add_vertex(target)
        self._adj[source].append((target, float(weight)))

        if not self.directed:
            self._adj[target].append((source, float(weight)))

    def neighbors(self, vertex: str) -> List[Tuple[str, float]]:
        return list(self._adj.get(vertex, []))

    def vertices(self) -> List[str]:
        return list(self._adj.keys())
