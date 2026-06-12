
# Testes unitários para o algoritmo de Dijkstra.



import pytest
from src.graphs.graph import Grafo
from src.graphs.algorithms import dijkstra



# Helpers



def _grafo_ponderado() -> Grafo:
    
    g = Grafo()
    for iata in ["A", "B", "C", "D"]:
        g.adicionar_no(iata, f"Cidade_{iata}", "Regiao")
    g.adicionar_aresta("A", "B", 1.0, "teste", "teste")
    g.adicionar_aresta("A", "D", 1.0, "teste", "teste")
    g.adicionar_aresta("D", "C", 1.0, "teste", "teste")
    g.adicionar_aresta("B", "C", 2.0, "teste", "teste")
    return g


def _grafo_com_peso_negativo() -> Grafo:
  
    g = Grafo()
    for iata in ["A", "B"]:
        g.adicionar_no(iata, f"Cidade_{iata}", "Regiao")
    # io.py valida pesos negativos no CSV, mas aqui instanciamos diretamente
    # para forçar a condição de erro dentro do Dijkstra
    from src.graphs.graph import Aresta
    g._nos["A"] = {"cidade": "CidadeA", "regiao": "R"}
    g._nos["B"] = {"cidade": "CidadeB", "regiao": "R"}
    g._adjacencia["A"] = [Aresta("B", -1.0, "teste", "teste")]
    g._adjacencia["B"] = [Aresta("A", -1.0, "teste", "teste")]
    return g


def _grafo_com_no_inalcancavel() -> Grafo:
   
    g = Grafo()
    for iata in ["A", "B", "C"]:
        g.adicionar_no(iata, f"Cidade_{iata}", "Regiao")
    g.adicionar_aresta("A", "B", 1.0, "teste", "teste")
    # C não tem arestas — inalcançável
    return g



# Testes



def test_dijkstra_caminho_minimo_correto():
    
    g = _grafo_ponderado()
    resultado = dijkstra(g, "A", "C")
    assert resultado["custo"] == pytest.approx(2.0)
    assert resultado["caminho"] == ["A", "D", "C"]


def test_dijkstra_peso_negativo_lanca_valueerror():
    """Dijkstra deve lançar ValueError ao encontrar aresta com peso negativo."""
    g = _grafo_com_peso_negativo()
    with pytest.raises(ValueError, match="negativ"):
        dijkstra(g, "A", "B")


def test_dijkstra_no_inalcancavel():
    """Nó inalcançável deve retornar custo=inf e caminho=[]."""
    g = _grafo_com_no_inalcancavel()
    resultado = dijkstra(g, "A", "C")
    assert resultado["custo"] == float("inf")
    assert resultado["caminho"] == []


def test_dijkstra_no_para_si_mesmo():
    """Dijkstra de um nó para si mesmo: custo=0 e caminho=[nó]."""
    g = _grafo_ponderado()
    resultado = dijkstra(g, "A", "A")
    assert resultado["custo"] == pytest.approx(0.0)
    assert resultado["caminho"] == ["A"]


def test_dijkstra_distancias_todos_nos():
    
    g = _grafo_ponderado()
    resultado = dijkstra(g, "A")
    dists = resultado["distancias"]

    assert dists["A"] == pytest.approx(0.0)
    assert dists["B"] == pytest.approx(1.0)
    assert dists["D"] == pytest.approx(1.0)
    assert dists["C"] == pytest.approx(2.0)
