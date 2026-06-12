

import pytest
from src.graphs.graph import Grafo
from src.graphs.algorithms import bfs



# Helpers — constroem os grafos reutilizados pelos testes



def _grafo_6nos() -> Grafo:
    
    g = Grafo()
    for iata in ["A", "B", "C", "D", "E", "F"]:
        g.adicionar_no(iata, f"Cidade_{iata}", "Regiao")
    for u, v in [("A", "B"), ("B", "C"), ("A", "D"), ("C", "F"), ("D", "E"), ("E", "F")]:
        g.adicionar_aresta(u, v, 1.0, "teste", "teste")
    return g


def _grafo_dois_componentes() -> Grafo:
   
    g = Grafo()
    for iata in ["A", "B", "C", "X", "Y"]:
        g.adicionar_no(iata, f"Cidade_{iata}", "Regiao")
    g.adicionar_aresta("A", "B", 1.0, "teste", "teste")
    g.adicionar_aresta("B", "C", 1.0, "teste", "teste")
    g.adicionar_aresta("X", "Y", 1.0, "teste", "teste")
    return g



# Testes



def test_bfs_visita_todos_nos():
    """BFS de A deve visitar exatamente os 6 nós do grafo."""
    g = _grafo_6nos()
    resultado = bfs(g, "A")
    assert sorted(resultado["visitados"]) == ["A", "B", "C", "D", "E", "F"]
    # Cada nó aparece exatamente uma vez
    assert len(resultado["visitados"]) == 6


def test_bfs_niveis_corretos():
   
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
    
    g = _grafo_dois_componentes()
    resultado = bfs(g, "A")
    visitados = set(resultado["visitados"])

    assert visitados == {"A", "B", "C"}
    assert "X" not in visitados
    assert "Y" not in visitados


def test_bfs_origem_inexistente_lanca_keyerror():
  
    g = _grafo_6nos()
    with pytest.raises(KeyError):
        bfs(g, "Z")


def test_bfs_arestas_arvore_formam_arvore():
   
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
