
# Interface de linha de comando do projeto MixGraph - OBSOLETO



import argparse
import sys
from pathlib import Path
from src.graphs.io import carregar_grafo, garantir_adjacencias, salvar_json
from src.graphs.algorithms import bfs, dfs, dijkstra, bellman_ford


def _validar_iata(grafo, iata: str, papel: str) -> None:
    if iata not in grafo.nos():
        disponiveis = ", ".join(sorted(grafo.nos()))
        print(
            f"Erro: IATA de {papel} '{iata}' nao existe no grafo.\n"
            f"Aeroportos disponiveis: {disponiveis}",
            file=sys.stderr,
        )
        sys.exit(1)



# Handlers de cada algoritmo



def _rodar_bfs(grafo, source: str, diretorio_saida: str) -> None:
    
    resultado = bfs(grafo, source)

    print(f"\n[BFS] Origem: {source}")
    print(f"Ordem de visita : {' -> '.join(resultado['visitados'])}")
    print("\nNiveis de cada no:")
    print(f"  {'No':<6} {'Nivel':>5}")
    print(f"  {'-'*12}")
    for no, nivel in sorted(resultado["niveis"].items(), key=lambda x: (x[1], x[0])):
        print(f"  {no:<6} {nivel:>5}")

    # Converte as arestas (tuplas) para listas para serialização JSON
    resultado_serial = {
        "visitados": resultado["visitados"],
        "niveis": resultado["niveis"],
        "pais": resultado["pais"],
        "arestas_arvore": [list(a) for a in resultado["arestas_arvore"]],
    }
    caminho = str(Path(diretorio_saida) / f"bfs_{source}.json")
    salvar_json(resultado_serial, caminho)


def _rodar_dfs(grafo, source: str, diretorio_saida: str) -> None:
   
    resultado = dfs(grafo, source)

    print(f"\n[DFS] Origem: {source}")
    print(f"Ordem de visita  : {' -> '.join(resultado['visitados'])}")
    print(f"tem_ciclo        : {resultado['tem_ciclo']}")
    retornos = resultado["arestas_retorno"]
    if retornos:
        fmt = ", ".join(f"{u}-{v}" for u, v in retornos[:8])
        sufixo = f"... (+{len(retornos)-8} mais)" if len(retornos) > 8 else ""
        print(f"arestas_retorno  : {fmt}{sufixo}")
    else:
        print("arestas_retorno  : (nenhuma)")

    resultado_serial = {
        "visitados": resultado["visitados"],
        "pais": resultado["pais"],
        "descoberta": resultado["descoberta"],
        "termino": resultado["termino"],
        "arestas_arvore": [list(a) for a in resultado["arestas_arvore"]],
        "arestas_retorno": [list(a) for a in resultado["arestas_retorno"]],
        "tem_ciclo": resultado["tem_ciclo"],
    }
    caminho = str(Path(diretorio_saida) / f"dfs_{source}.json")
    salvar_json(resultado_serial, caminho)


def _rodar_dijkstra(grafo, source: str, target: str, diretorio_saida: str) -> None:
    
    try:
        resultado = dijkstra(grafo, source, target)
    except ValueError as e:
        # Peso negativo detectado
        print(f"Erro no Dijkstra: {e}", file=sys.stderr)
        print("Sugestao: use --alg BELLMAN_FORD para grafos com pesos negativos.",
              file=sys.stderr)
        sys.exit(1)

    custo = resultado["custo"]
    caminho = resultado["caminho"]
    caminho_str = " -> ".join(caminho) if caminho else "N/A (destino inalcancavel)"

    print(f"\n[DIJKSTRA] {source} -> {target}")
    print(f"Custo   : {custo:.4f}" if custo != float("inf") else "Custo   : inf (inalcancavel)")
    print(f"Caminho : {caminho_str}")

    resultado_serial = {
        "origem": source,
        "destino": target,
        "custo": custo if custo != float("inf") else "inf",
        "caminho": caminho,
        "distancias": {
            k: (v if v != float("inf") else "inf")
            for k, v in resultado["distancias"].items()
        },
        "pais": resultado["pais"],
    }
    caminho_arq = str(Path(diretorio_saida) / f"dijkstra_{source}_{target}.json")
    salvar_json(resultado_serial, caminho_arq)


def _rodar_bellman_ford(grafo, source: str, target: str, diretorio_saida: str) -> None:
   
    resultado = bellman_ford(grafo, source, target)

    custo = resultado["custo"]
    caminho = resultado["caminho"]
    ciclo_neg = resultado["ciclo_negativo"]
    caminho_str = " -> ".join(caminho) if caminho else "N/A (destino inalcancavel)"

    print(f"\n[BELLMAN-FORD] {source} -> {target}")
    print(f"Custo          : {custo:.4f}" if custo != float("inf") else "Custo          : inf (inalcancavel)")
    print(f"Caminho        : {caminho_str}")
    print(f"ciclo_negativo : {ciclo_neg}")
    if ciclo_neg:
        print("AVISO: ciclo negativo detectado — distancias podem ser invalidas.")

    resultado_serial = {
        "origem": source,
        "destino": target,
        "custo": custo if custo != float("inf") else "inf",
        "caminho": caminho,
        "ciclo_negativo": ciclo_neg,
        "distancias": {
            k: (v if v != float("inf") else "inf")
            for k, v in resultado["distancias"].items()
        },
        "pais": resultado["pais"],
    }
    caminho_arq = str(Path(diretorio_saida) / f"bf_{source}_{target}.json")
    salvar_json(resultado_serial, caminho_arq)


def _rodar_all(csv_aeroportos: str, csv_adjacencias: str,
               csv_rotas: str, diretorio_saida: str) -> None:
    
    # Importações lazy para não carregar matplotlib/pyvis em outros comandos
    from src.solve import (
        executar_parte1,
        calcular_ego_redes,
        calcular_metricas_regioes,
    )
    from src.viz import gerar_todas_visualizacoes
    from src.graphs.algorithms import dijkstra as _dijkstra

    # Executa pipeline completo da Parte 1
    executar_parte1(csv_aeroportos, csv_adjacencias, csv_rotas, diretorio_saida)

    # Carrega grafo para as visualizações
    grafo = carregar_grafo(csv_aeroportos, csv_adjacencias)
    ego = calcular_ego_redes(grafo, diretorio_saida)
    metricas_reg = calcular_metricas_regioes(grafo, diretorio_saida)

    # Monta caminhos obrigatórios para as visualizações
    res1 = _dijkstra(grafo, "REC", "POA")
    c1 = res1["caminho"]
    res2 = _dijkstra(grafo, "MAO", "GRU")
    c2 = res2["caminho"]
    caminhos = [
        {"label": "REC -> POA", "nos": c1,
         "arestas": list(zip(c1, c1[1:])), "custo": res1["custo"]},
        {"label": "MAO -> GRU", "nos": c2,
         "arestas": list(zip(c2, c2[1:])), "custo": res2["custo"]},
    ]

    gerar_todas_visualizacoes(grafo, ego, metricas_reg, caminhos, diretorio_saida)



# Construção do parser



def _construir_parser() -> argparse.ArgumentParser:
    """Define e retorna o parser de argumentos da CLI."""
    parser = argparse.ArgumentParser(
        prog="python -m src.cli",
        description="MixGraph — CLI para análise do grafo aeroportuário brasileiro",
        formatter_class=argparse.RawTextHelpFormatter,
    )

    parser.add_argument(
        "--dataset",
        required=True,
        metavar="CSV",
        help="Caminho para data/aeroportos_data.csv",
    )
    parser.add_argument(
        "--alg",
        required=True,
        choices=["BFS", "DFS", "DIJKSTRA", "BELLMAN_FORD", "ALL"],
        metavar="ALG",
        help="Algoritmo: BFS | DFS | DIJKSTRA | BELLMAN_FORD | ALL",
    )
    parser.add_argument(
        "--source",
        metavar="IATA",
        default=None,
        help="IATA de origem (obrigatorio para BFS, DFS, DIJKSTRA, BELLMAN_FORD)",
    )
    parser.add_argument(
        "--target",
        metavar="IATA",
        default=None,
        help="IATA de destino (obrigatorio para DIJKSTRA e BELLMAN_FORD)",
    )
    parser.add_argument(
        "--out",
        metavar="DIR",
        default="./out/",
        help="Diretorio de saida (padrao: ./out/)",
    )

    return parser



# Ponto de entrada



def main() -> None:
    
    parser = _construir_parser()
    args = parser.parse_args()

    # Deriva caminhos a partir do --dataset informado
    dataset_path = Path(args.dataset).resolve()
    data_dir = dataset_path.parent
    csv_aeroportos = str(dataset_path)
    csv_adjacencias = str(data_dir / "adjacencias_aeroportos.csv")
    csv_rotas = str(data_dir / "rotas.csv")
    diretorio_saida = str(Path(args.out).resolve())

    # Garante que o diretório de saída existe
    os.makedirs(diretorio_saida, exist_ok=True)

    alg = args.alg

    #  Validação de argumentos por algoritmo 

    if alg in ("BFS", "DFS", "DIJKSTRA", "BELLMAN_FORD") and not args.source:
        print(f"Erro: --source e obrigatorio para --alg {alg}.", file=sys.stderr)
        parser.print_usage(sys.stderr)
        sys.exit(1)

    if alg in ("DIJKSTRA", "BELLMAN_FORD") and not args.target:
        print(f"Erro: --target e obrigatorio para --alg {alg}.", file=sys.stderr)
        parser.print_usage(sys.stderr)
        sys.exit(1)

    #  ALL não precisa de grafo carregado aqui 
    if alg == "ALL":
        garantir_adjacencias(csv_aeroportos, csv_adjacencias)
        _rodar_all(csv_aeroportos, csv_adjacencias, csv_rotas, diretorio_saida)
        return

    #  Para os demais algoritmos: carrega o grafo e valida IATAs 
    garantir_adjacencias(csv_aeroportos, csv_adjacencias)
    grafo = carregar_grafo(csv_aeroportos, csv_adjacencias)

    _validar_iata(grafo, args.source, "origem (--source)")

    if args.target:
        _validar_iata(grafo, args.target, "destino (--target)")

    #  Despacha para o handler do algoritmo 
    if alg == "BFS":
        _rodar_bfs(grafo, args.source, diretorio_saida)

    elif alg == "DFS":
        _rodar_dfs(grafo, args.source, diretorio_saida)

    elif alg == "DIJKSTRA":
        _rodar_dijkstra(grafo, args.source, args.target, diretorio_saida)

    elif alg == "BELLMAN_FORD":
        _rodar_bellman_ford(grafo, args.source, args.target, diretorio_saida)


if __name__ == "__main__":
    main()
