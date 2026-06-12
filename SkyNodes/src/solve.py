
# Orquestrador de solução leitura, processamento e saída do grafo



import csv
import json
from pathlib import Path

from src.graphs.graph import Grafo
from src.graphs.algorithms import bfs, dijkstra
from src.graphs.io import carregar_grafo, garantir_diretorio, garantir_adjacencias


def _densidade(ordem: int, tamanho: int) -> float:
    
    if ordem < 2:
        return 0.0
    return (2 * tamanho) / (ordem * (ordem - 1))



# SEÇÃO 1 — Métricas globais



def calcular_metricas_globais(grafo: Grafo, diretorio_saida: str) -> dict:
    
    garantir_diretorio(diretorio_saida)

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



# SEÇÃO 2 — Métricas por região



def calcular_metricas_regioes(grafo: Grafo, diretorio_saida: str) -> list[dict]:
    
    garantir_diretorio(diretorio_saida)

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



# SEÇÃO 3 — Ego-redes



def calcular_ego_redes(grafo: Grafo, diretorio_saida: str) -> list[dict]:
    
    garantir_diretorio(diretorio_saida)

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



# SEÇÃO 4 — Graus e rankings



def calcular_graus_rankings(
    grafo: Grafo, ego_metricas: list[dict], diretorio_saida: str
) -> None:
    
    garantir_diretorio(diretorio_saida)

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



# SEÇÃO 5 — Rotas com Dijkstra



def calcular_rotas(grafo: Grafo, csv_rotas: str, diretorio_saida: str) -> None:
    
    garantir_diretorio(diretorio_saida)

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



# Função principal de orquestração



def executar_parte1(
    csv_aeroportos: str,
    csv_adjacencias: str,
    csv_rotas: str,
    diretorio_saida: str,
) -> None:
    
    # 1. Garante que o arquivo de adjacências existe
    garantir_adjacencias(csv_aeroportos, csv_adjacencias)

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



# Ponto de entrada direto


if __name__ == "__main__":
    _BASE = Path(__file__).parent.parent

    executar_parte1(
        csv_aeroportos=str(_BASE / "data" / "aeroportos_data.csv"),
        csv_adjacencias=str(_BASE / "data" / "adjacencias_aeroportos.csv"),
        csv_rotas=str(_BASE / "data" / "rotas.csv"),
        diretorio_saida=str(_BASE / "out"),
    )
