from fastapi import APIRouter, Depends

from api.dependencies import get_grafo
from src.graphs.graph import Grafo

router = APIRouter(prefix="/metrics", tags=["metrics"])


def _get_global(grafo: Grafo) -> dict:
    ordem = grafo.ordem()
    tamanho = grafo.tamanho()
    densidade = (2 * tamanho) / (ordem * (ordem - 1)) if ordem >= 2 else 0.0
    return {
        "ordem": ordem,
        "tamanho": tamanho,
        "densidade": round(densidade, 6),
        "eh_conectado": grafo.eh_conectado(),
    }


def _get_regions(grafo: Grafo) -> list[dict]:
    nos_por_regiao: dict[str, set[str]] = {}
    for iata in grafo.nos():
        regiao = grafo.info_no(iata).get("regiao", "Desconhecida")
        nos_por_regiao.setdefault(regiao, set()).add(iata)

    resultado = []
    for regiao in sorted(nos_por_regiao.keys()):
        nos_regiao = nos_por_regiao[regiao]
        ordem = len(nos_regiao)
        tamanho = sum(
            1
            for origem, destino, *_ in grafo.arestas()
            if origem in nos_regiao and destino in nos_regiao
        )
        densidade = (2 * tamanho) / (ordem * (ordem - 1)) if ordem >= 2 else 0.0
        resultado.append({
            "regiao": regiao,
            "ordem": ordem,
            "tamanho": tamanho,
            "densidade": round(densidade, 6),
        })
    return resultado


def _get_ego(grafo: Grafo) -> list[dict]:
    todas_arestas = grafo.arestas()
    resultado = []
    for no in grafo.nos():
        vizinhos_set = {a.destino for a in grafo.vizinhos(no)}
        grau = len(vizinhos_set)
        ego_nos = vizinhos_set | {no}
        ordem_ego = len(ego_nos)
        tamanho_ego = sum(
            1
            for origem, destino, *_ in todas_arestas
            if origem in ego_nos and destino in ego_nos
        )
        densidade_ego = (
            (2 * tamanho_ego) / (ordem_ego * (ordem_ego - 1))
            if ordem_ego >= 2
            else 0.0
        )
        resultado.append({
            "aeroporto": no,
            "grau": grau,
            "ordem_ego": ordem_ego,
            "tamanho_ego": tamanho_ego,
            "densidade_ego": round(densidade_ego, 6),
        })
    resultado.sort(key=lambda x: x["aeroporto"])
    return resultado


@router.get("/global")
def global_metrics(grafo: Grafo = Depends(get_grafo)) -> dict:
    return _get_global(grafo)


@router.get("/regions")
def region_metrics(grafo: Grafo = Depends(get_grafo)) -> list[dict]:
    return _get_regions(grafo)


@router.get("/ego")
def ego_metrics(grafo: Grafo = Depends(get_grafo)) -> list[dict]:
    return _get_ego(grafo)


@router.get("/rankings")
def rankings(grafo: Grafo = Depends(get_grafo)) -> dict:
    ego = _get_ego(grafo)
    mais_conectado = max(ego, key=lambda x: (x["grau"], x["aeroporto"]))
    maior_densidade = max(ego, key=lambda x: (x["densidade_ego"], x["aeroporto"]))
    return {
        "mais_conectado": {
            "aeroporto": mais_conectado["aeroporto"],
            "grau": mais_conectado["grau"],
        },
        "maior_densidade_ego": {
            "aeroporto": maior_densidade["aeroporto"],
            "densidade_ego": maior_densidade["densidade_ego"],
        },
    }
