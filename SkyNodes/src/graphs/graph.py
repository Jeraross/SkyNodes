# Módulo de estrutura de dados do grafo.



from collections import deque
from dataclasses import dataclass


@dataclass
class Aresta:

    destino: str
    peso: float
    tipo_conexao: str
    justificativa: str


class Grafo:


    def __init__(self) -> None:
        # dicionário: iata -> lista de Aresta
        self._adjacencia: dict[str, list[Aresta]] = {}
        # metadados dos nós: iata -> {"cidade": str, "regiao": str}
        self._nos: dict[str, dict] = {}

    def adicionar_no(self, iata: str, cidade: str, regiao: str) -> None:
    
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
      
        if origem not in self._nos:
            raise ValueError(f"Nó de origem '{origem}' não existe no grafo.")
        if destino not in self._nos:
            raise ValueError(f"Nó de destino '{destino}' não existe no grafo.")

        # Insere a aresta em ambas as direções (grafo não-direcionado)
        self._adjacencia[origem].append(Aresta(destino, peso, tipo_conexao, justificativa))
        self._adjacencia[destino].append(Aresta(origem, peso, tipo_conexao, justificativa))

    def vizinhos(self, iata: str) -> list[Aresta]:
       
        return self._adjacencia.get(iata, [])

    def nos(self) -> list[str]:
       
        return list(self._nos.keys())

    def arestas(self) -> list[tuple[str, str, float, str, str]]:
        
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
        
        return len(self._adjacencia.get(iata, []))

    def info_no(self, iata: str) -> dict:
        
        return self._nos.get(iata, {})

    def eh_conectado(self) -> bool:
       
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
        
        return len(self._nos)

    def tamanho(self) -> int:
        
        return len(self.arestas())
