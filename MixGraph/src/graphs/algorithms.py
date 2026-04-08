"""
Módulo de algoritmos de grafos.

Implementa BFS, DFS, Dijkstra e Bellman-Ford sobre a classe Grafo.
"""

import heapq
from collections import deque
from pathlib import Path
from typing import Optional

from src.graphs.graph import Grafo


# ---------------------------------------------------------------------------
# Função auxiliar
# ---------------------------------------------------------------------------


def reconstruir_caminho(
    pais: dict[str, Optional[str]], origem: str, destino: str
) -> list[str]:
    """
    Reconstrói o caminho de origem até destino a partir do dicionário de pais.

    Parâmetros:
      pais    : dicionário {nó: pai} produzido por BFS/DFS/Dijkstra/Bellman-Ford
      origem  : IATA do nó inicial
      destino : IATA do nó final

    Retorna lista de IATAs do início ao fim.
    Retorna lista vazia se destino não for alcançável (pais[destino] inexistente
    e destino != origem).
    """
    # Caso trivial: origem é o próprio destino
    if destino == origem:
        return [origem]

    # Destino não foi alcançado durante a busca
    if destino not in pais:
        return []

    # Reconstrói o caminho seguindo os pais de trás para frente
    caminho: list[str] = []
    atual: Optional[str] = destino
    while atual is not None:
        caminho.append(atual)
        atual = pais.get(atual)

    caminho.reverse()
    return caminho


# ---------------------------------------------------------------------------
# BFS — Busca em Largura
# ---------------------------------------------------------------------------


def bfs(grafo: Grafo, origem: str) -> dict:
    """
    Realiza busca em largura a partir de 'origem'.

    Parâmetros:
      grafo  : instância de Grafo
      origem : IATA do nó inicial

    Retorna dicionário com:
      'visitados'     : list[str]              — ordem de visita
      'niveis'        : dict[str, int]         — nível (distância em arestas) de cada nó
      'pais'          : dict[str, str | None]  — pai de cada nó na árvore BFS
      'arestas_arvore': list[tuple[str, str]]  — arestas da árvore BFS

    Usa collections.deque como fila.
    Lança KeyError se origem não existir no grafo.
    """
    if origem not in grafo.nos():
        raise KeyError(f"Nó de origem '{origem}' não existe no grafo.")

    visitados: list[str] = []
    niveis: dict[str, int] = {origem: 0}
    pais: dict[str, Optional[str]] = {origem: None}
    arestas_arvore: list[tuple[str, str]] = []

    # Conjunto para verificação O(1) de nós já descobertos
    descobertos: set[str] = {origem}
    fila: deque[str] = deque([origem])

    while fila:
        atual = fila.popleft()
        visitados.append(atual)

        for aresta in grafo.vizinhos(atual):
            vizinho = aresta.destino
            if vizinho not in descobertos:
                descobertos.add(vizinho)
                pais[vizinho] = atual
                niveis[vizinho] = niveis[atual] + 1
                arestas_arvore.append((atual, vizinho))
                fila.append(vizinho)

    return {
        "visitados": visitados,
        "niveis": niveis,
        "pais": pais,
        "arestas_arvore": arestas_arvore,
    }


# ---------------------------------------------------------------------------
# DFS — Busca em Profundidade
# ---------------------------------------------------------------------------


def dfs(grafo: Grafo, origem: str) -> dict:
    """
    Realiza busca em profundidade a partir de 'origem'.
    Implementação ITERATIVA (usa pilha explícita para evitar RecursionError).

    Parâmetros:
      grafo  : instância de Grafo
      origem : IATA do nó inicial

    Retorna dicionário com:
      'visitados'      : list[str]              — ordem de visita (pré-ordem)
      'pais'           : dict[str, str | None]
      'descoberta'     : dict[str, int]         — tempo de descoberta
      'termino'        : dict[str, int]         — tempo de término
      'arestas_arvore' : list[tuple[str, str]]
      'arestas_retorno': list[tuple[str, str]]  — back edges (indicam ciclo)
      'tem_ciclo'      : bool                   — True se back_edges não vazio

    Lança KeyError se origem não existir no grafo.
    """
    if origem not in grafo.nos():
        raise KeyError(f"Nó de origem '{origem}' não existe no grafo.")

    visitados: list[str] = []
    pais: dict[str, Optional[str]] = {origem: None}
    descoberta: dict[str, int] = {}
    termino: dict[str, int] = {}
    arestas_arvore: list[tuple[str, str]] = []
    arestas_retorno: list[tuple[str, str]] = []

    # Conjunto para rastrear back edges já registrados (evita duplicatas
    # causadas pela representação bidirecional das arestas não-direcionadas)
    pares_retorno_vistos: set[frozenset] = set()

    tempo = 0  # contador global de tempo
    descobertos: set[str] = {origem}

    # Cada entrada da pilha: (nó, iterador sobre seus vizinhos)
    # Quando o iterador se esgota, o nó recebe seu tempo de término
    tempo += 1
    descoberta[origem] = tempo
    visitados.append(origem)
    pilha: list[tuple[str, object]] = [(origem, iter(grafo.vizinhos(origem)))]

    while pilha:
        no_atual, viz_iter = pilha[-1]

        try:
            aresta = next(viz_iter)  # type: ignore[call-overload]
            vizinho = aresta.destino

            if vizinho not in descobertos:
                # Aresta de árvore: vizinho ainda não visitado
                descobertos.add(vizinho)
                pais[vizinho] = no_atual
                arestas_arvore.append((no_atual, vizinho))
                tempo += 1
                descoberta[vizinho] = tempo
                visitados.append(vizinho)
                pilha.append((vizinho, iter(grafo.vizinhos(vizinho))))

            elif vizinho != pais.get(no_atual):
                # Back edge: vizinho já visitado e não é o pai direto.
                # Em grafos não-direcionados, a aresta pai→filho aparece
                # como filho→pai nos vizinhos do filho; ignoramos esse caso.
                par = frozenset([no_atual, vizinho])
                if par not in pares_retorno_vistos:
                    pares_retorno_vistos.add(par)
                    arestas_retorno.append((no_atual, vizinho))

        except StopIteration:
            # Todos os vizinhos do nó atual foram processados
            pilha.pop()
            tempo += 1
            termino[no_atual] = tempo

    return {
        "visitados": visitados,
        "pais": pais,
        "descoberta": descoberta,
        "termino": termino,
        "arestas_arvore": arestas_arvore,
        "arestas_retorno": arestas_retorno,
        "tem_ciclo": len(arestas_retorno) > 0,
    }


# ---------------------------------------------------------------------------
# Dijkstra
# ---------------------------------------------------------------------------


def dijkstra(grafo: Grafo, origem: str, destino: Optional[str] = None) -> dict:
    """
    Calcula caminhos mínimos a partir de 'origem' usando o algoritmo de Dijkstra.
    Usa heapq como fila de prioridade (min-heap).

    Parâmetros:
      grafo   : instância de Grafo
      origem  : IATA do nó inicial
      destino : IATA do nó alvo (opcional); se None, calcula para todos os nós

    Restrição: todos os pesos devem ser >= 0.
    Lança ValueError("Dijkstra não aceita pesos negativos") se encontrar peso negativo.
    Lança KeyError se origem não existir no grafo.

    Retorna dicionário com:
      'distancias' : dict[str, float]      — custo mínimo de origem a cada nó
      'pais'       : dict[str, str | None]
      'caminho'    : list[str]             — caminho de origem a destino ([] se destino=None)
      'custo'      : float                 — custo até destino (inf se não alcançado)

    Se destino não for alcançável: caminho=[], custo=inf.
    """
    if origem not in grafo.nos():
        raise KeyError(f"Nó de origem '{origem}' não existe no grafo.")

    INF = float("inf")

    # Inicializa distâncias com infinito para todos os nós
    distancias: dict[str, float] = {no: INF for no in grafo.nos()}
    distancias[origem] = 0.0
    pais: dict[str, Optional[str]] = {origem: None}

    # Min-heap: (custo_acumulado, nó)
    heap: list[tuple[float, str]] = [(0.0, origem)]
    finalizados: set[str] = set()

    while heap:
        custo_atual, no_atual = heapq.heappop(heap)

        # Nó já processado com custo mínimo definitivo: ignora entrada obsoleta
        if no_atual in finalizados:
            continue
        finalizados.add(no_atual)

        # Otimização: interrompe cedo se o destino foi alcançado
        if destino is not None and no_atual == destino:
            break

        for aresta in grafo.vizinhos(no_atual):
            if aresta.peso < 0:
                raise ValueError(
                    f"Dijkstra não aceita pesos negativos "
                    f"(aresta {no_atual}→{aresta.destino}: peso={aresta.peso})"
                )

            novo_custo = custo_atual + aresta.peso
            if novo_custo < distancias[aresta.destino]:
                distancias[aresta.destino] = novo_custo
                pais[aresta.destino] = no_atual
                heapq.heappush(heap, (novo_custo, aresta.destino))

    # Monta resultado para o destino requisitado
    if destino is not None:
        custo_destino = distancias.get(destino, INF)
        caminho = reconstruir_caminho(pais, origem, destino) if custo_destino < INF else []
    else:
        custo_destino = INF
        caminho = []

    return {
        "distancias": distancias,
        "pais": pais,
        "caminho": caminho,
        "custo": custo_destino,
    }


# ---------------------------------------------------------------------------
# Bellman-Ford
# ---------------------------------------------------------------------------


def bellman_ford(grafo: Grafo, origem: str, destino: Optional[str] = None) -> dict:
    """
    Calcula caminhos mínimos a partir de 'origem' usando o algoritmo de Bellman-Ford.
    Suporta pesos negativos e detecta ciclos negativos.

    Parâmetros:
      grafo   : instância de Grafo
      origem  : IATA do nó inicial
      destino : IATA do nó alvo (opcional)

    Retorna dicionário com:
      'distancias'     : dict[str, float]
      'pais'           : dict[str, str | None]
      'caminho'        : list[str]
      'custo'          : float
      'ciclo_negativo' : bool — True se ciclo negativo detectado

    ATENÇÃO: se ciclo_negativo=True, as distâncias podem ser inválidas,
    pois o relaxamento continua indefinidamente nos nós afetados pelo ciclo.
    Não confie nos valores de 'distancias' ou 'caminho' nesse caso.

    Lança KeyError se origem não existir no grafo.
    """
    if origem not in grafo.nos():
        raise KeyError(f"Nó de origem '{origem}' não existe no grafo.")

    INF = float("inf")
    nos = grafo.nos()
    n = len(nos)

    # Inicializa distâncias com infinito para todos os nós
    distancias: dict[str, float] = {no: INF for no in nos}
    distancias[origem] = 0.0
    pais: dict[str, Optional[str]] = {origem: None}

    # Percorre as listas de adjacência diretamente.
    # Para grafos não-direcionados construídos com adicionar_aresta(), cada aresta
    # já aparece nos dois sentidos em _adjacencia, portanto ambas as direções
    # são relaxadas naturalmente. Para grafos com arestas direcionadas inseridas
    # manualmente (ex: testes unitários), apenas a direção presente é relaxada,
    # evitando a criação de falsos ciclos negativos por arestas reversas.
    todas_arestas: list[tuple[str, str, float]] = [
        (u, aresta.destino, aresta.peso)
        for u in grafo.nos()
        for aresta in grafo.vizinhos(u)
    ]

    # Fase de relaxamento: repete |V| - 1 vezes
    for _ in range(n - 1):
        atualizado = False
        for u, v, peso in todas_arestas:
            if distancias[u] < INF and distancias[u] + peso < distancias[v]:
                distancias[v] = distancias[u] + peso
                pais[v] = u
                atualizado = True
        # Convergência antecipada: se nenhuma aresta foi relaxada, termina
        if not atualizado:
            break

    # Fase de detecção de ciclo negativo:
    # Uma |V|-ésima iteração que ainda atualiza alguma distância indica ciclo negativo
    ciclo_negativo = False
    for u, v, peso in todas_arestas:
        if distancias[u] < INF and distancias[u] + peso < distancias[v]:
            ciclo_negativo = True
            break

    # Monta resultado para o destino requisitado
    if destino is not None:
        custo_destino = distancias.get(destino, INF)
        caminho = (
            reconstruir_caminho(pais, origem, destino)
            if custo_destino < INF
            else []
        )
    else:
        custo_destino = INF
        caminho = []

    return {
        "distancias": distancias,
        "pais": pais,
        "caminho": caminho,
        "custo": custo_destino,
        "ciclo_negativo": ciclo_negativo,
    }


# ---------------------------------------------------------------------------
# Bloco de teste rápido
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    from src.graphs.io import carregar_grafo

    # Caminhos derivados da localização deste script (executa de MixGraph/)
    _BASE = Path(__file__).parent.parent.parent
    _CSV_AEROPORTOS = str(_BASE / "data" / "aeroportos_data.csv")
    _CSV_ADJACENCIAS = str(_BASE / "data" / "adjacencias_aeroportos.csv")

    grafo = carregar_grafo(_CSV_AEROPORTOS, _CSV_ADJACENCIAS)

    # ------------------------------------------------------------------
    # 1. BFS a partir de REC — imprime nível de cada nó
    # ------------------------------------------------------------------
    print("=" * 60)
    print("BFS a partir de REC")
    print("=" * 60)
    resultado_bfs = bfs(grafo, "REC")
    print(f"{'Nó':<6} {'Nível':>6}")
    print("-" * 14)
    for no, nivel in sorted(resultado_bfs["niveis"].items(), key=lambda x: x[1]):
        print(f"{no:<6} {nivel:>6}")

    # ------------------------------------------------------------------
    # 2. DFS a partir de GRU — imprime se tem ciclo
    # ------------------------------------------------------------------
    print()
    print("=" * 60)
    print("DFS a partir de GRU")
    print("=" * 60)
    resultado_dfs = dfs(grafo, "GRU")
    print(f"tem_ciclo      : {resultado_dfs['tem_ciclo']}")
    retornos = resultado_dfs["arestas_retorno"]
    print(f"back edges ({len(retornos)}): {retornos[:5]}{'...' if len(retornos) > 5 else ''}")
    print(f"ordem de visita: {resultado_dfs['visitados']}")

    # ------------------------------------------------------------------
    # 3. Dijkstra REC → POA
    # ------------------------------------------------------------------
    print()
    print("=" * 60)
    print("Dijkstra: REC -> POA")
    print("=" * 60)
    resultado_dij = dijkstra(grafo, "REC", "POA")
    print(f"custo  : {resultado_dij['custo']:.2f}")
    print(f"caminho: {' -> '.join(resultado_dij['caminho'])}")

    # ------------------------------------------------------------------
    # 4. Bellman-Ford MAO -> GRU
    # ------------------------------------------------------------------
    print()
    print("=" * 60)
    print("Bellman-Ford: MAO -> GRU")
    print("=" * 60)
    resultado_bf = bellman_ford(grafo, "MAO", "GRU")
    print(f"custo          : {resultado_bf['custo']:.2f}")
    print(f"caminho        : {' -> '.join(resultado_bf['caminho'])}")
    print(f"ciclo_negativo : {resultado_bf['ciclo_negativo']}")
