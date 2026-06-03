import pytest
from fastapi.testclient import TestClient

from api.main import app

client = TestClient(app)


def test_get_nodes_returns_list():
    response = client.get("/graph/nodes")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 20


def test_get_nodes_fields():
    response = client.get("/graph/nodes")
    node = response.json()[0]
    assert "iata" in node
    assert "cidade" in node
    assert "regiao" in node
    assert "lat" in node
    assert "lon" in node
    assert "grau" in node


def test_get_nodes_specific_airport():
    response = client.get("/graph/nodes")
    nodes = {n["iata"]: n for n in response.json()}
    assert "GRU" in nodes
    assert nodes["GRU"]["cidade"] == "São Paulo"
    assert nodes["GRU"]["regiao"] == "Sudeste"
    assert nodes["GRU"]["lat"] == pytest.approx(-23.431775)
    assert nodes["GRU"]["grau"] > 0


def test_get_edges_returns_list():
    response = client.get("/graph/edges")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0


def test_get_edges_fields():
    response = client.get("/graph/edges")
    edge = response.json()[0]
    assert "origem" in edge
    assert "destino" in edge
    assert "peso" in edge
    assert "tipo_conexao" in edge
    assert "justificativa" in edge


def test_get_edges_peso_positive():
    response = client.get("/graph/edges")
    for edge in response.json():
        assert edge["peso"] >= 1.0


def test_get_nodes_coordinates_valid():
    response = client.get("/graph/nodes")
    for node in response.json():
        assert isinstance(node["lat"], (int, float))
        assert isinstance(node["lon"], (int, float))
        assert -90 <= node["lat"] <= 90
        assert -180 <= node["lon"] <= 180


def test_get_nodes_gru_coordinates_exact():
    response = client.get("/graph/nodes")
    nodes = {n["iata"]: n for n in response.json()}
    assert nodes["GRU"]["lat"] == pytest.approx(-23.431775, abs=0.0001)
    assert nodes["GRU"]["lon"] == pytest.approx(-46.469529, abs=0.0001)
