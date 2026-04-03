from src.graphs.algorithms import bellman_ford
from src.graphs.graph import Graph


def test_bellman_ford_with_negative_edges_no_cycle():
    graph = Graph(directed=True)
    graph.add_edge("A", "B", 1)
    graph.add_edge("B", "C", -2)
    graph.add_edge("A", "C", 4)

    distances, _, has_negative_cycle = bellman_ford(graph, "A")

    assert distances["C"] == -1
    assert has_negative_cycle is False
