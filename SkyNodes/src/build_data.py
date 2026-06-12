
# Script auxiliar de geração e inspeção do grafo de aeroportos.



from pathlib import Path

from src.graphs.io import carregar_grafo, construir_adjacencias

# Caminhos absolutos derivados da localização deste script
_BASE = Path(__file__).parent.parent
_CSV_AEROPORTOS = str(_BASE / "data" / "aeroportos_data.csv")
_CSV_ADJACENCIAS = str(_BASE / "data" / "adjacencias_aeroportos.csv")


def main() -> None:
    # 1. Gera o arquivo de adjacências a partir das regras de conectividade
    print("Construindo adjacências...")
    construir_adjacencias(_CSV_AEROPORTOS, _CSV_ADJACENCIAS)
    print(f"Adjacências salvas em: {_CSV_ADJACENCIAS}\n")

    # 2. Carrega o grafo pronto para uso
    grafo = carregar_grafo(_CSV_AEROPORTOS, _CSV_ADJACENCIAS)

    # 3. Estatísticas básicas
    print(f"Número de nós  (ordem) : {grafo.ordem()}")
    print(f"Número de arestas (tamanho): {grafo.tamanho()}")
    print(f"Grafo é conectado      : {grafo.eh_conectado()}")

    # 4. Primeiras 5 arestas com todos os campos
    print("\nPrimeiras 5 arestas:")
    print(f"{'Origem':<6} {'Destino':<8} {'Peso':>6}  {'Tipo':<15}  Justificativa")
    print("-" * 75)
    for origem, destino, peso, tipo, justificativa in grafo.arestas()[:5]:
        print(f"{origem:<6} {destino:<8} {peso:>6.2f}  {tipo:<15}  {justificativa}")


if __name__ == "__main__":
    main()
