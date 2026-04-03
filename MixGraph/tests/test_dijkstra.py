from src.graphs.algorithms import dijkstra
from src.graphs.graph import Graph


def test_dijkstra_shortest_paths():
    graph = Graph(directed=True)
    graph.add_edge("A", "B", 1)
    graph.add_edge("A", "C", 4)
    graph.add_edge("B", "C", 2)
    graph.add_edge("B", "D", 5)
    graph.add_edge("C", "D", 1)

    distances, previous = dijkstra(graph, "A")

    assert distances["D"] == 4
    assert previous["D"] == "C"
