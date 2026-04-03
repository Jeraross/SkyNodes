from __future__ import annotations

import argparse
from math import isinf

from src.graphs.algorithms import bellman_ford, bfs, dfs, dijkstra
from src.solve import build_graph_from_routes_csv


def main() -> None:
    parser = argparse.ArgumentParser(description="MixGraph CLI")
    parser.add_argument("algorithm", choices=["bfs", "dfs", "dijkstra", "bellman-ford"])
    parser.add_argument("routes_csv", help="CSV com colunas source,target,weight")
    parser.add_argument("start", help="Vertice inicial")
    parser.add_argument("--goal", help="Vertice objetivo para BFS/DFS", default=None)
    args = parser.parse_args()

    graph = build_graph_from_routes_csv(args.routes_csv)

    if args.algorithm == "bfs":
        print(bfs(graph, args.start, args.goal))
    elif args.algorithm == "dfs":
        print(dfs(graph, args.start, args.goal))
    elif args.algorithm == "dijkstra":
        distances, _ = dijkstra(graph, args.start)
        pretty = {k: (None if isinf(v) else v) for k, v in distances.items()}
        print(pretty)
    else:
        distances, _, has_negative_cycle = bellman_ford(graph, args.start)
        pretty = {k: (None if isinf(v) else v) for k, v in distances.items()}
        print({"distances": pretty, "has_negative_cycle": has_negative_cycle})


if __name__ == "__main__":
    main()
