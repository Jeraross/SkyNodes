from __future__ import annotations

import csv
from pathlib import Path

from src.graphs.graph import Graph
from src.graphs.io import load_csv_rows


def build_graph_from_routes_csv(routes_csv: str) -> Graph:
    rows = load_csv_rows(routes_csv)
    graph = Graph(directed=True)

    for row in rows:
        source = row.get("source", "").strip()
        target = row.get("target", "").strip()
        weight = float(row.get("weight", "1") or "1")
        if source and target:
            graph.add_edge(source, target, weight)

    return graph


def export_edges(graph: Graph, adj_output_csv: str, routes_output_csv: str) -> None:
    adj_path = Path(adj_output_csv)
    routes_path = Path(routes_output_csv)

    adj_path.parent.mkdir(parents=True, exist_ok=True)
    routes_path.parent.mkdir(parents=True, exist_ok=True)

    with adj_path.open("w", encoding="utf-8", newline="") as adj_file:
        writer = csv.writer(adj_file)
        writer.writerow(["source", "neighbors"])
        for source in graph.vertices():
            neighbors = ";".join([target for target, _ in graph.neighbors(source)])
            writer.writerow([source, neighbors])

    with routes_path.open("w", encoding="utf-8", newline="") as routes_file:
        writer = csv.writer(routes_file)
        writer.writerow(["source", "target", "weight"])
        for source in graph.vertices():
            for target, weight in graph.neighbors(source):
                writer.writerow([source, target, weight])
