"""
Módulo de estrutura de dados do grafo.

Implementa um grafo rotulado não-direcionado com lista de adjacência,
onde cada nó representa um aeroporto identificado pelo código IATA.
"""

from collections import deque
from dataclasses import dataclass


@dataclass
class Aresta:
    """Representa uma aresta com destino, peso e metadados."""

    destino: str
    peso: float
    tipo_conexao: str
    justificativa: str


class Grafo:
    """
    Grafo rotulado não-direcionado implementado com lista de adjacência.
    Cada nó representa um aeroporto identificado pelo código IATA.
    """

    def __init__(self) -> None:
        # dicionário: iata -> lista de Aresta
        self._adjacencia: dict[str, list[Aresta]] = {}
        # metadados dos nós: iata -> {"cidade": str, "regiao": str}
        self._nos: dict[str, dict] = {}

    def adicionar_no(self, iata: str, cidade: str, regiao: str) -> None:
        """Adiciona um nó ao grafo, sem duplicatas."""
        if iata not in self._nos:
            self._nos[iata] = {"cidade": cidade, "regiao": regiao}
            self._adjacencia[iata] = []

    def adicionar_aresta(
        self,
        origem: str,
        destino: str,
        peso: float,
        tipo_conexao: str,
        justificativa: str,
    ) -> None:
        """
        Adiciona aresta não-direcionada (insere nos dois sentidos).
        Lança ValueError se origem ou destino não existirem como nós.
        """
        if origem not in self._nos:
            raise ValueError(f"Nó de origem '{origem}' não existe no grafo.")
        if destino not in self._nos:
            raise ValueError(f"Nó de destino '{destino}' não existe no grafo.")

        # Insere a aresta em ambas as direções (grafo não-direcionado)
        self._adjacencia[origem].append(Aresta(destino, peso, tipo_conexao, justificativa))
        self._adjacencia[destino].append(Aresta(origem, peso, tipo_conexao, justificativa))

    def vizinhos(self, iata: str) -> list[Aresta]:
        """Retorna lista de arestas saindo do nó iata."""
        return self._adjacencia.get(iata, [])

    def nos(self) -> list[str]:
        """Retorna lista de todos os IATAs."""
        return list(self._nos.keys())

    def arestas(self) -> list[tuple[str, str, float, str, str]]:
        """
        Retorna lista de arestas únicas (sem duplicar par A-B e B-A).
        Cada item: (origem, destino, peso, tipo_conexao, justificativa)
        """
        pares_vistos: set[frozenset] = set()
        resultado: list[tuple[str, str, float, str, str]] = []

        for origem, adjacentes in self._adjacencia.items():
            for aresta in adjacentes:
                # Representa o par como um frozenset para ignorar direção
                par = frozenset([origem, aresta.destino])
                if par not in pares_vistos:
                    pares_vistos.add(par)
                    resultado.append(
                        (origem, aresta.destino, aresta.peso,
                         aresta.tipo_conexao, aresta.justificativa)
                    )

        return resultado

    def grau(self, iata: str) -> int:
        """Retorna o grau (número de vizinhos) do nó."""
        return len(self._adjacencia.get(iata, []))

    def info_no(self, iata: str) -> dict:
        """Retorna {'cidade': ..., 'regiao': ...} do nó."""
        return self._nos.get(iata, {})

    def eh_conectado(self) -> bool:
        """
        Verifica se o grafo é conectado usando BFS simples a partir do
        primeiro nó. Retorna True se todos os nós são alcançáveis.
        """
        if not self._nos:
            return True

        # Ponto de partida: primeiro nó inserido
        inicio = next(iter(self._nos))
        visitados: set[str] = {inicio}
        fila: deque[str] = deque([inicio])

        while fila:
            atual = fila.popleft()
            for aresta in self._adjacencia[atual]:
                if aresta.destino not in visitados:
                    visitados.add(aresta.destino)
                    fila.append(aresta.destino)

        return len(visitados) == len(self._nos)

    def ordem(self) -> int:
        """Retorna |V| = número de nós."""
        return len(self._nos)

    def tamanho(self) -> int:
        """Retorna |E| = número de arestas únicas."""
        return len(self.arestas())
