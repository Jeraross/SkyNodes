from fastapi.testclient import TestClient

from api.main import app

client = TestClient(app)


def test_global_metrics_fields():
    response = client.get("/metrics/global")
    assert response.status_code == 200
    data = response.json()
    assert "ordem" in data
    assert "tamanho" in data
    assert "densidade" in data
    assert "eh_conectado" in data


def test_global_metrics_values():
    response = client.get("/metrics/global")
    data = response.json()
    assert data["ordem"] == 20
    assert data["tamanho"] > 0
    assert 0.0 < data["densidade"] <= 1.0
    assert data["eh_conectado"] is True


def test_regions_returns_list():
    response = client.get("/metrics/regions")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 5  # Norte, Nordeste, Sudeste, Sul, Centro-Oeste


def test_regions_fields():
    response = client.get("/metrics/regions")
    region = response.json()[0]
    assert "regiao" in region
    assert "ordem" in region
    assert "tamanho" in region
    assert "densidade" in region


def test_ego_returns_list():
    response = client.get("/metrics/ego")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 20


def test_ego_fields():
    response = client.get("/metrics/ego")
    item = response.json()[0]
    assert "aeroporto" in item
    assert "grau" in item
    assert "ordem_ego" in item
    assert "tamanho_ego" in item
    assert "densidade_ego" in item


def test_rankings_fields():
    response = client.get("/metrics/rankings")
    assert response.status_code == 200
    data = response.json()
    assert "mais_conectado" in data
    assert "maior_densidade_ego" in data
    assert "aeroporto" in data["mais_conectado"]
    assert "grau" in data["mais_conectado"]
    assert "aeroporto" in data["maior_densidade_ego"]
    assert "densidade_ego" in data["maior_densidade_ego"]


def test_rankings_most_connected_has_highest_degree():
    response_rankings = client.get("/metrics/rankings")
    top = response_rankings.json()["mais_conectado"]

    response_ego = client.get("/metrics/ego")
    all_graus = [item["grau"] for item in response_ego.json()]
    assert top["grau"] == max(all_graus)
