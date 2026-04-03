from src.graphs.algorithms import bfs
from src.graphs.graph import Graph


def test_bfs_visitation_order():
    graph = Graph(directed=True)
    graph.add_edge("A", "B")
    graph.add_edge("A", "C")
    graph.add_edge("B", "D")
    graph.add_edge("C", "E")

    assert bfs(graph, "A") == ["A", "B", "C", "D", "E"]
