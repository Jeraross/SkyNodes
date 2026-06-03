"""
Testes unitários para o algoritmo BFS (Busca em Largura).

Grafo principal de teste (6 nós, não-direcionado):
  A - B - C
  |       |
  D - E - F
Arestas: A-B, B-C, A-D, C-F, D-E, E-F
"""

import pytest
from src.graphs.graph import Grafo
from src.graphs.algorithms import bfs


# ---------------------------------------------------------------------------
# Helpers — constroem os grafos reutilizados pelos testes
# ---------------------------------------------------------------------------


def _grafo_6nos() -> Grafo:
    """
    Retorna o grafo de 6 nós usado nos testes principais.
    A-B-C / A-D-E-F-C (topologia com ciclo).
    """
    g = Grafo()
    for iata in ["A", "B", "C", "D", "E", "F"]:
        g.adicionar_no(iata, f"Cidade_{iata}", "Regiao")
    for u, v in [("A", "B"), ("B", "C"), ("A", "D"), ("C", "F"), ("D", "E"), ("E", "F")]:
        g.adicionar_aresta(u, v, 1.0, "teste", "teste")
    return g


def _grafo_dois_componentes() -> Grafo:
    """
    Dois componentes desconexos:
      Componente 1: A - B - C
      Componente 2: X - Y
    """
    g = Grafo()
    for iata in ["A", "B", "C", "X", "Y"]:
        g.adicionar_no(iata, f"Cidade_{iata}", "Regiao")
    g.adicionar_aresta("A", "B", 1.0, "teste", "teste")
    g.adicionar_aresta("B", "C", 1.0, "teste", "teste")
    g.adicionar_aresta("X", "Y", 1.0, "teste", "teste")
    return g


# ---------------------------------------------------------------------------
# Testes
# ---------------------------------------------------------------------------


def test_bfs_visita_todos_nos():
    """BFS de A deve visitar exatamente os 6 nós do grafo."""
    g = _grafo_6nos()
    resultado = bfs(g, "A")
    assert sorted(resultado["visitados"]) == ["A", "B", "C", "D", "E", "F"]
    # Cada nó aparece exatamente uma vez
    assert len(resultado["visitados"]) == 6


def test_bfs_niveis_corretos():
    """
    Niveis BFS a partir de A:
      A=0, B=1, D=1, C=2, E=2, F=3
    Verificação baseada na topologia:
      A-B (B=1), A-D (D=1), B-C (C=2), D-E (E=2), C-F e E-F (F=3)
    """
    g = _grafo_6nos()
    resultado = bfs(g, "A")
    niveis = resultado["niveis"]

    assert niveis["A"] == 0
    assert niveis["B"] == 1
    assert niveis["D"] == 1
    assert niveis["C"] == 2
    assert niveis["E"] == 2
    assert niveis["F"] == 3


def test_bfs_dois_componentes_so_alcanca_seu():
    """
    BFS a partir de A não alcança X ou Y (componente separado).
    Visitados devem ser exatamente {A, B, C}.
    """
    g = _grafo_dois_componentes()
    resultado = bfs(g, "A")
    visitados = set(resultado["visitados"])

    assert visitados == {"A", "B", "C"}
    assert "X" not in visitados
    assert "Y" not in visitados


def test_bfs_origem_inexistente_lanca_keyerror():
    """BFS com nó de origem inexistente deve lançar KeyError."""
    g = _grafo_6nos()
    with pytest.raises(KeyError):
        bfs(g, "Z")


def test_bfs_arestas_arvore_formam_arvore():
    """
    arestas_arvore devem formar uma árvore:
      - |arestas| == |visitados| - 1
      - Cada nó não-raiz aparece como destino em exatamente uma aresta
      - A raiz não é destino de nenhuma aresta
    """
    g = _grafo_6nos()
    resultado = bfs(g, "A")
    arestas = resultado["arestas_arvore"]
    visitados = resultado["visitados"]

    # Propriedade fundamental de árvore geradora
    assert len(arestas) == len(visitados) - 1

    # Nenhum nó com dois pais
    destinos = [v for _, v in arestas]
    assert len(destinos) == len(set(destinos)), "Nó com mais de um pai — não é árvore"

    # Raiz nunca é destino de uma aresta da árvore
    assert "A" not in destinos
