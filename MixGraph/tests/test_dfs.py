"""
Testes unitários para o algoritmo DFS (Busca em Profundidade).

Grafo com ciclo (6 nós):
  A - B - C
  |       |
  D - E - F
Arestas: A-B, B-C, A-D, C-F, D-E, E-F  → forma ciclo A-B-C-F-E-D-A

Grafo sem ciclo (linha):
  A - B - C - D  (4 nós em sequência)
"""

import pytest
from src.graphs.graph import Grafo
from src.graphs.algorithms import dfs


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _grafo_com_ciclo() -> Grafo:
    """Grafo de 6 nós que contém ciclo."""
    g = Grafo()
    for iata in ["A", "B", "C", "D", "E", "F"]:
        g.adicionar_no(iata, f"Cidade_{iata}", "Regiao")
    for u, v in [("A", "B"), ("B", "C"), ("A", "D"), ("C", "F"), ("D", "E"), ("E", "F")]:
        g.adicionar_aresta(u, v, 1.0, "teste", "teste")
    return g


def _grafo_linha() -> Grafo:
    """Grafo em linha A-B-C-D (sem ciclo)."""
    g = Grafo()
    for iata in ["A", "B", "C", "D"]:
        g.adicionar_no(iata, f"Cidade_{iata}", "Regiao")
    for u, v in [("A", "B"), ("B", "C"), ("C", "D")]:
        g.adicionar_aresta(u, v, 1.0, "teste", "teste")
    return g


# ---------------------------------------------------------------------------
# Testes
# ---------------------------------------------------------------------------


def test_dfs_visita_todos_nos_grafo_com_ciclo():
    """DFS de A no grafo com ciclo deve visitar os 6 nós."""
    g = _grafo_com_ciclo()
    resultado = dfs(g, "A")
    assert sorted(resultado["visitados"]) == ["A", "B", "C", "D", "E", "F"]
    assert len(resultado["visitados"]) == 6


def test_dfs_tem_ciclo_true_em_grafo_com_ciclo():
    """tem_ciclo deve ser True no grafo com ciclo A-B-C-F-E-D-A."""
    g = _grafo_com_ciclo()
    resultado = dfs(g, "A")
    assert resultado["tem_ciclo"] is True


def test_dfs_tem_ciclo_false_em_grafo_linha():
    """tem_ciclo deve ser False no grafo em linha (sem ciclo)."""
    g = _grafo_linha()
    resultado = dfs(g, "A")
    assert resultado["tem_ciclo"] is False


def test_dfs_arestas_retorno_vazias_sem_ciclo():
    """Grafo sem ciclo: arestas_retorno deve ser lista vazia."""
    g = _grafo_linha()
    resultado = dfs(g, "A")
    assert resultado["arestas_retorno"] == []


def test_dfs_descoberta_menor_que_termino():
    """
    Para todo nó visitado: descoberta[nó] < termino[nó].
    Propriedade fundamental dos tempos de DFS.
    """
    g = _grafo_com_ciclo()
    resultado = dfs(g, "A")
    for no in resultado["visitados"]:
        assert resultado["descoberta"][no] < resultado["termino"][no], (
            f"Nó {no}: descoberta={resultado['descoberta'][no]} "
            f">= termino={resultado['termino'][no]}"
        )
