from fastapi.testclient import TestClient

from api.main import app

client = TestClient(app)


# --- BFS ---

def test_bfs_valid_source():
    response = client.post("/algorithms/bfs", json={"source": "GRU"})
    assert response.status_code == 200
    data = response.json()
    assert "visitados" in data
    assert "niveis" in data
    assert "pais" in data
    assert "arestas_arvore" in data
    assert data["visitados"][0] == "GRU"


def test_bfs_visits_all_nodes():
    response = client.post("/algorithms/bfs", json={"source": "GRU"})
    assert len(response.json()["visitados"]) == 20


def test_bfs_invalid_source():
    response = client.post("/algorithms/bfs", json={"source": "ZZZ"})
    assert response.status_code == 404
    assert "ZZZ" in response.json()["detail"]


# --- DFS ---

def test_dfs_valid_source():
    response = client.post("/algorithms/dfs", json={"source": "BSB"})
    assert response.status_code == 200
    data = response.json()
    assert "visitados" in data
    assert "tem_ciclo" in data
    assert data["visitados"][0] == "BSB"


def test_dfs_invalid_source():
    response = client.post("/algorithms/dfs", json={"source": "XXX"})
    assert response.status_code == 404


# --- Dijkstra ---

def test_dijkstra_valid_route():
    response = client.post("/algorithms/dijkstra", json={"source": "REC", "target": "POA"})
    assert response.status_code == 200
    data = response.json()
    assert data["caminho"][0] == "REC"
    assert data["caminho"][-1] == "POA"
    assert data["custo"] is not None
    assert data["custo"] > 0


def test_dijkstra_same_source_target():
    response = client.post("/algorithms/dijkstra", json={"source": "GRU", "target": "GRU"})
    assert response.status_code == 200
    data = response.json()
    assert data["caminho"] == ["GRU"]
    assert data["custo"] == 0.0


def test_dijkstra_invalid_source():
    response = client.post("/algorithms/dijkstra", json={"source": "ZZZ", "target": "GRU"})
    assert response.status_code == 404


def test_dijkstra_invalid_target():
    response = client.post("/algorithms/dijkstra", json={"source": "GRU", "target": "ZZZ"})
    assert response.status_code == 404


# --- Bellman-Ford ---

def test_bellman_ford_valid_route():
    response = client.post("/algorithms/bellman-ford", json={"source": "MAO", "target": "GRU"})
    assert response.status_code == 200
    data = response.json()
    assert data["caminho"][0] == "MAO"
    assert data["caminho"][-1] == "GRU"
    assert "ciclo_negativo" in data
    assert data["ciclo_negativo"] is False


def test_bellman_ford_invalid_source():
    response = client.post("/algorithms/bellman-ford", json={"source": "ZZZ", "target": "GRU"})
    assert response.status_code == 404
