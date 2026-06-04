from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from api.dependencies import get_grafo
from src.graphs.algorithms import bfs, bellman_ford, dfs, dijkstra
from src.graphs.graph import Grafo

router = APIRouter(prefix="/algorithms", tags=["algorithms"])


class SourceRequest(BaseModel):
    source: str


class RouteRequest(BaseModel):
    source: str
    target: str


def _validar_iata(grafo: Grafo, iata: str) -> None:
    if iata not in grafo.nos():
        raise HTTPException(status_code=404, detail=f"Aeroporto '{iata}' não existe no grafo.")


@router.post("/bfs")
def run_bfs(body: SourceRequest, grafo: Grafo = Depends(get_grafo)) -> dict:
    _validar_iata(grafo, body.source)
    resultado = bfs(grafo, body.source)
    return {
        "visitados": resultado["visitados"],
        "niveis": resultado["niveis"],
        "pais": resultado["pais"],
        "arestas_arvore": [list(a) for a in resultado["arestas_arvore"]],
    }


@router.post("/dfs")
def run_dfs(body: SourceRequest, grafo: Grafo = Depends(get_grafo)) -> dict:
    _validar_iata(grafo, body.source)
    resultado = dfs(grafo, body.source)
    return {
        "visitados": resultado["visitados"],
        "pais": resultado["pais"],
        "descoberta": resultado["descoberta"],
        "termino": resultado["termino"],
        "arestas_arvore": [list(a) for a in resultado["arestas_arvore"]],
        "arestas_retorno": [list(a) for a in resultado["arestas_retorno"]],
        "tem_ciclo": resultado["tem_ciclo"],
    }


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
