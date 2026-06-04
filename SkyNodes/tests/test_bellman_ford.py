"""
Testes unitários para o algoritmo Bellman-Ford.

Testa suporte a pesos negativos, detecção de ciclo negativo
e equivalência com Dijkstra para grafos sem pesos negativos.
"""

import pytest
from src.graphs.graph import Grafo, Aresta
from src.graphs.algorithms import bellman_ford, dijkstra, reconstruir_caminho


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _grafo_ponderado_positivo() -> Grafo:
    """
    Grafo de 4 nós com pesos positivos (mesma topologia dos testes Dijkstra):
      A --1-- B
      A --1-- D
      D --1-- C
      B --2-- C
    Distância mínima A→C = 2 (via A-D-C).
    """
    g = Grafo()
    for iata in ["A", "B", "C", "D"]:
        g.adicionar_no(iata, f"Cidade_{iata}", "Regiao")
    g.adicionar_aresta("A", "B", 1.0, "teste", "teste")
    g.adicionar_aresta("A", "D", 1.0, "teste", "teste")
    g.adicionar_aresta("D", "C", 1.0, "teste", "teste")
    g.adicionar_aresta("B", "C", 2.0, "teste", "teste")
    return g


def _grafo_peso_negativo_sem_ciclo() -> Grafo:
    """
    Grafo dirigido simulado via adjacência manual (3 nós):
      A→B peso=3, A→C peso=1, C→B peso=-2
    Distância mínima A→B = min(3, 1+(-2)) = -1 (via A-C-B).

    Como Grafo é não-direcionado, modelamos apenas a direção relevante
    inserindo arestas manualmente nas listas de adjacência.
    """
    g = Grafo()
    for iata in ["A", "B", "C"]:
        g._nos[iata] = {"cidade": f"Cidade_{iata}", "regiao": "R"}
        g._adjacencia[iata] = []
    # A→B (peso 3)
    g._adjacencia["A"].append(Aresta("B", 3.0, "teste", "teste"))
    # A→C (peso 1)
    g._adjacencia["A"].append(Aresta("C", 1.0, "teste", "teste"))
    # C→B (peso -2)
    g._adjacencia["C"].append(Aresta("B", -2.0, "teste", "teste"))
    return g


def _grafo_ciclo_negativo() -> Grafo:
    """
    Grafo com ciclo negativo (3 nós, directed via adjacência manual):
      A→B=1, B→C=-3, C→A=1
    Soma do ciclo: 1 + (-3) + 1 = -1 (negativo).
    """
    g = Grafo()
    for iata in ["A", "B", "C"]:
        g._nos[iata] = {"cidade": f"Cidade_{iata}", "regiao": "R"}
        g._adjacencia[iata] = []
    g._adjacencia["A"].append(Aresta("B", 1.0,  "teste", "teste"))
    g._adjacencia["B"].append(Aresta("C", -3.0, "teste", "teste"))
    g._adjacencia["C"].append(Aresta("A", 1.0,  "teste", "teste"))
    return g


def _grafo_com_inalcancavel() -> Grafo:
    """A-B conectados; C isolado (inalcançável)."""
    g = Grafo()
    for iata in ["A", "B", "C"]:
        g.adicionar_no(iata, f"Cidade_{iata}", "Regiao")
    g.adicionar_aresta("A", "B", 1.0, "teste", "teste")
    return g


# ---------------------------------------------------------------------------
# Testes
# ---------------------------------------------------------------------------


def test_bf_resultado_igual_dijkstra_pesos_positivos():
    """
    Com pesos positivos, Bellman-Ford deve produzir as mesmas
    distâncias que Dijkstra para todos os nós.
    """
    g = _grafo_ponderado_positivo()
    res_bf = bellman_ford(g, "A")
    res_dij = dijkstra(g, "A")

    for no in g.nos():
        assert res_bf["distancias"][no] == pytest.approx(res_dij["distancias"][no]), (
            f"Divergência no nó {no}: BF={res_bf['distancias'][no]} "
            f"!= Dijkstra={res_dij['distancias'][no]}"
        )


def test_bf_peso_negativo_sem_ciclo_distancia_correta():
    """
    Grafo: A→B=3, A→C=1, C→B=-2
    Distância mínima A→B = 1 + (-2) = -1 (caminho A-C-B).
    ciclo_negativo deve ser False.
    """
    g = _grafo_peso_negativo_sem_ciclo()
    resultado = bellman_ford(g, "A", "B")

    assert resultado["ciclo_negativo"] is False
    assert resultado["custo"] == pytest.approx(-1.0)
    assert resultado["caminho"] == ["A", "C", "B"]


def test_bf_detecta_ciclo_negativo():
    """
    Grafo com ciclo negativo (A→B=1, B→C=-3, C→A=1, soma=-1).
    ciclo_negativo deve ser True.
    """
    g = _grafo_ciclo_negativo()
    resultado = bellman_ford(g, "A")
    assert resultado["ciclo_negativo"] is True


def test_bf_reconstruir_caminho_com_peso_negativo():
    """
    reconstruir_caminho deve funcionar corretamente com o dicionário
    de pais produzido por Bellman-Ford em grafo com peso negativo.
    Caminho esperado: A → C → B.
    """
    g = _grafo_peso_negativo_sem_ciclo()
    resultado = bellman_ford(g, "A", "B")
    # A função reconstruir_caminho é usada internamente; validamos o campo "caminho"
    assert resultado["caminho"] == ["A", "C", "B"]

    # Também testa chamada direta de reconstruir_caminho com o dicionário de pais
    caminho_direto = reconstruir_caminho(resultado["pais"], "A", "B")
    assert caminho_direto == ["A", "C", "B"]


def test_bf_no_inalcancavel_custo_inf():
    """Nó inalcançável deve retornar custo=inf e caminho=[]."""
    g = _grafo_com_inalcancavel()
    resultado = bellman_ford(g, "A", "C")
    assert resultado["custo"] == float("inf")
    assert resultado["caminho"] == []
