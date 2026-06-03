from fastapi import APIRouter, Depends

from api.coordinates import COORDINATES
from api.dependencies import get_grafo
from src.graphs.graph import Grafo

router = APIRouter(prefix="/graph", tags=["graph"])


@router.get("/nodes")
def list_nodes(grafo: Grafo = Depends(get_grafo)) -> list[dict]:
    result = []
    for iata in grafo.nos():
        info = grafo.info_no(iata)
        coords = COORDINATES.get(iata, {"lat": 0.0, "lon": 0.0})
        result.append({
            "iata": iata,
            "cidade": info.get("cidade", ""),
            "regiao": info.get("regiao", ""),
            "lat": coords["lat"],
            "lon": coords["lon"],
            "grau": grafo.grau(iata),
        })
    return result


@router.get("/edges")
def list_edges(grafo: Grafo = Depends(get_grafo)) -> list[dict]:
    return [
        {
            "origem": origem,
            "destino": destino,
            "peso": peso,
            "tipo_conexao": tipo,
            "justificativa": justificativa,
        }
        for origem, destino, peso, tipo, justificativa in grafo.arestas()
    ]
