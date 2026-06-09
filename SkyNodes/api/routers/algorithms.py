from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from api.dependencies import get_grafo
from src.graphs.algorithms import bfs, bellman_ford, dfs, dijkstra, reconstruir_caminho
from src.graphs.graph import Grafo

router = APIRouter(prefix="/algorithms", tags=["algorithms"])


class SourceRequest(BaseModel):
    source: str
    target: Optional[str] = None


class RouteRequest(BaseModel):
    source: str
    target: str


def _validar_iata(grafo: Grafo, iata: str) -> None:
    if iata not in grafo.nos():
        raise HTTPException(status_code=404, detail=f"Aeroporto '{iata}' não existe no grafo.")


def _custo_caminho(grafo: Grafo, caminho: list[str]) -> float:
    custo = 0.0
    for i in range(len(caminho) - 1):
        edge = next(
            (a for a in grafo.vizinhos(caminho[i]) if a.destino == caminho[i + 1]),
            None,
        )
        custo += edge.peso if edge else 0.0
    return custo


@router.post("/bfs")
def run_bfs(body: SourceRequest, grafo: Grafo = Depends(get_grafo)) -> dict:
    _validar_iata(grafo, body.source)
    if body.target is not None:
        _validar_iata(grafo, body.target)
    resultado = bfs(grafo, body.source)
    response: dict = {
        "visitados": resultado["visitados"],
        "niveis": resultado["niveis"],
        "pais": resultado["pais"],
        "arestas_arvore": [list(a) for a in resultado["arestas_arvore"]],
    }
    if body.target is not None:
        caminho = reconstruir_caminho(resultado["pais"], body.source, body.target)
        if caminho:
            response["caminho"] = caminho
            response["custo"] = _custo_caminho(grafo, caminho)
    return response


@router.post("/dfs")
def run_dfs(body: SourceRequest, grafo: Grafo = Depends(get_grafo)) -> dict:
    _validar_iata(grafo, body.source)
    if body.target is not None:
        _validar_iata(grafo, body.target)
    resultado = dfs(grafo, body.source)
    response: dict = {
        "visitados": resultado["visitados"],
        "pais": resultado["pais"],
        "descoberta": resultado["descoberta"],
        "termino": resultado["termino"],
        "arestas_arvore": [list(a) for a in resultado["arestas_arvore"]],
        "arestas_retorno": [list(a) for a in resultado["arestas_retorno"]],
        "tem_ciclo": resultado["tem_ciclo"],
    }
    if body.target is not None:
        caminho = reconstruir_caminho(resultado["pais"], body.source, body.target)
        if caminho:
            response["caminho"] = caminho
            response["custo"] = _custo_caminho(grafo, caminho)
    return response


@router.post("/dijkstra")
def run_dijkstra(body: RouteRequest, grafo: Grafo = Depends(get_grafo)) -> dict:
    _validar_iata(grafo, body.source)
    _validar_iata(grafo, body.target)
    try:
        resultado = dijkstra(grafo, body.source, body.target)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Pesos negativos detectados. Use Bellman-Ford.",
        )
    custo = resultado["custo"]
    return {
        "origem": body.source,
        "destino": body.target,
        "caminho": resultado["caminho"],
        "custo": None if custo == float("inf") else custo,
        "distancias": {
            k: (None if v == float("inf") else v)
            for k, v in resultado["distancias"].items()
        },
        "pais": resultado["pais"],
    }


@router.post("/bellman-ford")
def run_bellman_ford(body: RouteRequest, grafo: Grafo = Depends(get_grafo)) -> dict:
    _validar_iata(grafo, body.source)
    _validar_iata(grafo, body.target)
    resultado = bellman_ford(grafo, body.source, body.target)
    custo = resultado["custo"]
    return {
        "origem": body.source,
        "destino": body.target,
        "caminho": resultado["caminho"],
        "custo": None if custo == float("inf") else custo,
        "ciclo_negativo": resultado["ciclo_negativo"],
        "distancias": {
            k: (None if v == float("inf") else v)
            for k, v in resultado["distancias"].items()
        },
        "pais": resultado["pais"],
    }
