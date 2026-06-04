from functools import lru_cache

from api.config import CSV_AEROPORTOS, CSV_ADJACENCIAS
from src.graphs.graph import Grafo
from src.graphs.io import carregar_grafo


@lru_cache(maxsize=1)
def get_grafo() -> Grafo:
    return carregar_grafo(CSV_AEROPORTOS, CSV_ADJACENCIAS)
