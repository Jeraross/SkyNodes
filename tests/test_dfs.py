from src.graphs.algorithms import dfs
from src.graphs.graph import Graph


def test_dfs_visitation_order():
    graph = Graph(directed=True)
    graph.add_edge("A", "B")
    graph.add_edge("A", "C")
    graph.add_edge("B", "D")
    graph.add_edge("C", "E")

    assert dfs(graph, "A") == ["A", "B", "D", "C", "E"]
