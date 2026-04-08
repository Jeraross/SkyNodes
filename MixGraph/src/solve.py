"""
Módulo principal da Parte 1 do projeto MixGraph.

Orquestra o carregamento do grafo, o cálculo de métricas e a geração
de todos os arquivos de saída em out/.
"""

import csv
import json
import os
from pathlib import Path
from typing import Optional

from src.graphs.graph import Grafo
from src.graphs.algorithms import bfs, dijkstra
from src.graphs.io import carregar_grafo, construir_adjacencias


# ---------------------------------------------------------------------------
# Utilitários internos
# ---------------------------------------------------------------------------


def _garantir_diretorio(diretorio: str) -> None:
    """Cria o diretório de saída caso ainda não exista."""
    os.makedirs(diretorio, exist_ok=True)


def _densidade(ordem: int, tamanho: int) -> float:
    """
    Calcula a densidade de um grafo simples não-direcionado.
    Fórmula: 2|E| / (|V| * (|V| - 1))
    Retorna 0.0 se |V| < 2.
    """
    if ordem < 2:
        return 0.0
    return (2 * tamanho) / (ordem * (ordem - 1))


# ---------------------------------------------------------------------------
# SEÇÃO 3 — Métricas globais
# ---------------------------------------------------------------------------


def calcular_metricas_globais(grafo: Grafo, diretorio_saida: str) -> dict:
    """
    Calcula e salva out/global.json com as métricas do grafo completo:
      - ordem     : número de nós |V|
      - tamanho   : número de arestas únicas |E|
      - densidade : 2|E| / (|V| * (|V|-1)), ou 0 se |V| < 2
      - eh_conectado : True se o grafo é conectado

    Parâmetros:
      grafo           : instância de Grafo já carregada
      diretorio_saida : caminho do diretório de saída (ex: "out/")

    Retorna o dicionário calculado.
    """
    _garantir_diretorio(diretorio_saida)

    ordem = grafo.ordem()
    tamanho = grafo.tamanho()

    metricas = {
        "ordem": ordem,
        "tamanho": tamanho,
        "densidade": round(_densidade(ordem, tamanho), 6),
        "eh_conectado": grafo.eh_conectado(),
    }

    caminho_saida = Path(diretorio_saida) / "global.json"
    with open(caminho_saida, "w", encoding="utf-8") as f:
        json.dump(metricas, f, ensure_ascii=False, indent=2)

    return metricas


# ---------------------------------------------------------------------------
# SEÇÃO 3 — Métricas por região
# ---------------------------------------------------------------------------


def calcular_metricas_regioes(grafo: Grafo, diretorio_saida: str) -> list[dict]:
    """
    Para cada região (Norte, Nordeste, Sudeste, Sul, Centro-Oeste) calcula
    as métricas do subgrafo induzido:
      - Nós  : apenas os aeroportos desta região
      - Arestas: apenas as arestas cujos DOIS extremos pertencem à região

    Métricas calculadas: ordem, tamanho, densidade.

    Salva out/regioes.json como lista de dicionários:
      [{"regiao": ..., "ordem": ..., "tamanho": ..., "densidade": ...}, ...]

    Parâmetros:
      grafo           : instância de Grafo já carregada
      diretorio_saida : caminho do diretório de saída

    Retorna a lista de dicionários.
    """
    _garantir_diretorio(diretorio_saida)

    # Mapeia cada IATA para sua região a partir dos metadados do grafo
    nos_por_regiao: dict[str, set[str]] = {}
    for iata in grafo.nos():
        regiao = grafo.info_no(iata).get("regiao", "Desconhecida")
        nos_por_regiao.setdefault(regiao, set()).add(iata)

    resultado: list[dict] = []

    for regiao in sorted(nos_por_regiao.keys()):
        nos_regiao = nos_por_regiao[regiao]
        ordem = len(nos_regiao)

        # Conta arestas cujos dois extremos pertencem à mesma região
        tamanho = 0
        for origem, destino, _peso, _tipo, _just in grafo.arestas():
            if origem in nos_regiao and destino in nos_regiao:
                tamanho += 1

        resultado.append({
            "regiao": regiao,
            "ordem": ordem,
            "tamanho": tamanho,
            "densidade": round(_densidade(ordem, tamanho), 6),
        })

    caminho_saida = Path(diretorio_saida) / "regioes.json"
    with open(caminho_saida, "w", encoding="utf-8") as f:
        json.dump(resultado, f, ensure_ascii=False, indent=2)

    return resultado


# ---------------------------------------------------------------------------
# SEÇÃO 3 — Ego-redes
# ---------------------------------------------------------------------------


def calcular_ego_redes(grafo: Grafo, diretorio_saida: str) -> list[dict]:
    """
    Calcula a ego-rede de cada nó v:
      ego_nos     = {v} ∪ vizinhos(v)
      ego_arestas = arestas do grafo cujos DOIS extremos pertencem a ego_nos
      ordem_ego   = |ego_nos|
      tamanho_ego = |ego_arestas|
      densidade_ego = 2*tamanho_ego / (ordem_ego*(ordem_ego-1))
                    = 0 se ordem_ego < 2

    Salva out/ego_aeroportos.csv com colunas:
      aeroporto, grau, ordem_ego, tamanho_ego, densidade_ego

    Parâmetros:
      grafo           : instância de Grafo já carregada
      diretorio_saida : caminho do diretório de saída

    Retorna lista de dicts com os campos acima.
    """
    _garantir_diretorio(diretorio_saida)

    # Lista de todas as arestas únicas para varredura eficiente
    todas_arestas = grafo.arestas()

    ego_metricas: list[dict] = []

    for no in grafo.nos():
        vizinhos_set: set[str] = {aresta.destino for aresta in grafo.vizinhos(no)}
        grau = len(vizinhos_set)

        # ego_nos inclui o próprio nó
        ego_nos = vizinhos_set | {no}
        ordem_ego = len(ego_nos)

        # Conta arestas internas à ego-rede
        tamanho_ego = sum(
            1
            for origem, destino, *_ in todas_arestas
            if origem in ego_nos and destino in ego_nos
        )

        ego_metricas.append({
            "aeroporto": no,
            "grau": grau,
            "ordem_ego": ordem_ego,
            "tamanho_ego": tamanho_ego,
            "densidade_ego": round(_densidade(ordem_ego, tamanho_ego), 6),
        })

    # Ordena por aeroporto para saída determinística
    ego_metricas.sort(key=lambda x: x["aeroporto"])

    caminho_saida = Path(diretorio_saida) / "ego_aeroportos.csv"
    with open(caminho_saida, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(
            f,
            fieldnames=["aeroporto", "grau", "ordem_ego", "tamanho_ego", "densidade_ego"],
        )
        writer.writeheader()
        writer.writerows(ego_metricas)

    return ego_metricas


# ---------------------------------------------------------------------------
# SEÇÃO 4 — Graus e rankings
# ---------------------------------------------------------------------------


def calcular_graus_rankings(
    grafo: Grafo, ego_metricas: list[dict], diretorio_saida: str
) -> None:
    """
    Salva out/graus.csv com colunas: aeroporto, grau
    Ordenado por grau decrescente (empates mantêm ordem alfabética).

    Imprime no terminal:
      - Aeroporto mais conectado (maior grau)
      - Aeroporto com maior densidade_ego

    Parâmetros:
      grafo           : instância de Grafo já carregada
      ego_metricas    : lista retornada por calcular_ego_redes()
      diretorio_saida : caminho do diretório de saída
    """
    _garantir_diretorio(diretorio_saida)

    # Monta lista (aeroporto, grau) e ordena por grau decrescente
    graus = [
        {"aeroporto": iata, "grau": grafo.grau(iata)}
        for iata in grafo.nos()
    ]
    graus.sort(key=lambda x: (-x["grau"], x["aeroporto"]))

    caminho_saida = Path(diretorio_saida) / "graus.csv"
    with open(caminho_saida, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["aeroporto", "grau"])
        writer.writeheader()
        writer.writerows(graus)

    # Aeroporto mais conectado (maior grau)
    mais_conectado = graus[0]

    # Aeroporto com maior densidade_ego (empate: primeiro em ordem alfabética)
    mais_denso_ego = max(
        ego_metricas,
        key=lambda x: (x["densidade_ego"], -ord(x["aeroporto"][0])),
    )

    print("\n--- Rankings ---")
    print(
        f"Aeroporto mais conectado    : {mais_conectado['aeroporto']} "
        f"(grau = {mais_conectado['grau']})"
    )
    print(
        f"Maior densidade de ego-rede : {mais_denso_ego['aeroporto']} "
        f"(densidade_ego = {mais_denso_ego['densidade_ego']:.6f})"
    )


# ---------------------------------------------------------------------------
# SEÇÃO 6 — Rotas com Dijkstra
# ---------------------------------------------------------------------------


def calcular_rotas(grafo: Grafo, csv_rotas: str, diretorio_saida: str) -> None:
    """
    Lê data/rotas.csv (colunas obrigatórias: origem, destino).
    Para cada par executa Dijkstra e registra custo e caminho.

    Valida que os pares obrigatórios REC->POA e MAO->GRU estão presentes.
    Lança ValueError se algum par obrigatório estiver ausente.

    Salva out/distancias_rotas.csv com colunas:
      origem, destino, custo, caminho
    onde 'caminho' é uma string no formato "REC -> BSB -> GRU -> POA".

    Parâmetros:
      grafo           : instância de Grafo já carregada
      csv_rotas       : caminho para data/rotas.csv
      diretorio_saida : caminho do diretório de saída
    """
    _garantir_diretorio(diretorio_saida)

    # Lê pares de rotas
    pares: list[tuple[str, str]] = []
    with open(csv_rotas, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for linha in reader:
            origem = linha["origem"].strip()
            destino = linha["destino"].strip()
            pares.append((origem, destino))

    # Valida presença dos pares obrigatórios
    pares_obrigatorios = {("REC", "POA"), ("MAO", "GRU")}
    pares_presentes = set(pares)
    ausentes = pares_obrigatorios - pares_presentes
    if ausentes:
        raise ValueError(
            f"Pares obrigatórios ausentes em {csv_rotas}: "
            + ", ".join(f"{o}->{d}" for o, d in ausentes)
        )

    # Executa Dijkstra para cada par e acumula resultados
    linhas_saida: list[dict] = []
    for origem, destino in pares:
        resultado = dijkstra(grafo, origem, destino)
        caminho_str = " -> ".join(resultado["caminho"]) if resultado["caminho"] else "N/A"
        custo = resultado["custo"]
        linhas_saida.append({
            "origem": origem,
            "destino": destino,
            "custo": round(custo, 4) if custo != float("inf") else "inf",
            "caminho": caminho_str,
        })

    caminho_saida = Path(diretorio_saida) / "distancias_rotas.csv"
    with open(caminho_saida, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["origem", "destino", "custo", "caminho"])
        writer.writeheader()
        writer.writerows(linhas_saida)


# ---------------------------------------------------------------------------
# Função principal de orquestração
# ---------------------------------------------------------------------------


def executar_parte1(
    csv_aeroportos: str,
    csv_adjacencias: str,
    csv_rotas: str,
    diretorio_saida: str,
) -> None:
    """
    Orquestra toda a Parte 1 em ordem:
      1. Verifica se csv_adjacencias existe; se não, chama construir_adjacencias().
      2. Carrega o grafo com carregar_grafo().
      3. Calcula métricas globais  → out/global.json
      4. Calcula métricas regionais → out/regioes.json
      5. Calcula ego-redes         → out/ego_aeroportos.csv
      6. Calcula graus e rankings  → out/graus.csv
      7. Calcula rotas Dijkstra    → out/distancias_rotas.csv
      8. Imprime resumo no terminal.

    Parâmetros:
      csv_aeroportos  : caminho para data/aeroportos_data.csv
      csv_adjacencias : caminho para data/adjacencias_aeroportos.csv
      csv_rotas       : caminho para data/rotas.csv
      diretorio_saida : caminho do diretório de saída (ex: "out/")
    """
    # 1. Garante que o arquivo de adjacências existe
    if not Path(csv_adjacencias).exists():
        print("Arquivo de adjacencias nao encontrado. Construindo...")
        construir_adjacencias(csv_aeroportos, csv_adjacencias)
        print(f"Adjacencias salvas em: {csv_adjacencias}")

    # 2. Carrega o grafo
    print("Carregando grafo...")
    grafo = carregar_grafo(csv_aeroportos, csv_adjacencias)
    print(f"Grafo carregado: {grafo.ordem()} nos, {grafo.tamanho()} arestas.\n")

    # 3. Metricas globais
    print("Calculando metricas globais...")
    globais = calcular_metricas_globais(grafo, diretorio_saida)

    # 4. Metricas por regiao
    print("Calculando metricas por regiao...")
    regioes = calcular_metricas_regioes(grafo, diretorio_saida)

    # 5. Ego-redes
    print("Calculando ego-redes...")
    ego = calcular_ego_redes(grafo, diretorio_saida)

    # 6. Graus e rankings
    print("Calculando graus e rankings...")
    calcular_graus_rankings(grafo, ego, diretorio_saida)

    # 7. Rotas via Dijkstra
    print("Calculando rotas (Dijkstra)...")
    calcular_rotas(grafo, csv_rotas, diretorio_saida)

    # 8. Resumo no terminal
    print("\n" + "=" * 60)
    print("RESUMO DA PARTE 1")
    print("=" * 60)

    print("\n[global.json]")
    print(json.dumps(globais, ensure_ascii=False, indent=2))

    print("\n[regioes.json]")
    print(json.dumps(regioes, ensure_ascii=False, indent=2))

    print("\n[ego_aeroportos.csv — primeiras 5 linhas]")
    caminho_ego = Path(diretorio_saida) / "ego_aeroportos.csv"
    with open(caminho_ego, encoding="utf-8") as f:
        linhas = f.readlines()
    print("".join(linhas[:6]).rstrip())

    print("\n[graus.csv — primeiras 5 linhas]")
    caminho_graus = Path(diretorio_saida) / "graus.csv"
    with open(caminho_graus, encoding="utf-8") as f:
        linhas = f.readlines()
    print("".join(linhas[:6]).rstrip())

    print("\n[distancias_rotas.csv — completo]")
    caminho_rotas = Path(diretorio_saida) / "distancias_rotas.csv"
    with open(caminho_rotas, encoding="utf-8") as f:
        print(f.read().rstrip())

    print("\nTodos os arquivos gerados em:", diretorio_saida)


# ---------------------------------------------------------------------------
# Ponto de entrada direto
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    _BASE = Path(__file__).parent.parent

    executar_parte1(
        csv_aeroportos=str(_BASE / "data" / "aeroportos_data.csv"),
        csv_adjacencias=str(_BASE / "data" / "adjacencias_aeroportos.csv"),
        csv_rotas=str(_BASE / "data" / "rotas.csv"),
        diretorio_saida=str(_BASE / "out"),
    )
