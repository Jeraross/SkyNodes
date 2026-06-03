"""
Módulo de entrada e saída do grafo de aeroportos.

Responsável por carregar o grafo a partir de arquivos CSV, construir
adjacências, e prover utilitários de persistência (JSON, diretórios).
"""

import json
import os
from pathlib import Path

import pandas as pd

from src.graphs.graph import Aresta, Grafo

# ---------------------------------------------------------------------------
# Constantes
# ---------------------------------------------------------------------------

# Hubs nacionais: ao menos um hub em cada aresta zera a penalidade de hub
_HUBS: set[str] = {"GRU", "BSB", "GIG"}

# Colunas obrigatórias de cada CSV
_COLUNAS_AEROPORTOS = {"iata", "cidade", "regiao"}
_COLUNAS_ADJACENCIAS = {"origem", "destino", "tipo_conexao", "justificativa", "peso"}


# ---------------------------------------------------------------------------
# Funções auxiliares privadas
# ---------------------------------------------------------------------------


def _calcular_peso(
    iata_a: str,
    iata_b: str,
    regiao_a: str,
    regiao_b: str,
    peso_base: float,
) -> float:
    """
    Calcula o peso final de uma aresta usando a fórmula híbrida:

        penalidade_regiao = 1.0  se regiões diferentes, 0.0 caso contrário
        penalidade_hub    = 0.5  se nenhum dos nós é hub, 0.0 caso contrário
        peso = peso_base + penalidade_regiao + penalidade_hub
        peso >= 1.0  (nunca negativo)
    """
    penalidade_regiao = 0.0 if regiao_a == regiao_b else 1.0
    penalidade_hub = 0.0 if (iata_a in _HUBS or iata_b in _HUBS) else 0.5
    return max(peso_base + penalidade_regiao + penalidade_hub, 1.0)


# ---------------------------------------------------------------------------
# Utilitários de I/O
# ---------------------------------------------------------------------------


def garantir_diretorio(diretorio: str) -> None:
    """Cria o diretório caso ainda não exista."""
    os.makedirs(diretorio, exist_ok=True)


def garantir_adjacencias(csv_aeroportos: str, csv_adjacencias: str) -> None:
    """Constrói o CSV de adjacências se ele ainda não existir."""
    if not Path(csv_adjacencias).exists():
        print("Arquivo de adjacencias nao encontrado. Construindo...")
        construir_adjacencias(csv_aeroportos, csv_adjacencias)
        print(f"Adjacencias salvas em: {csv_adjacencias}")


def salvar_json(dados: dict, caminho: str) -> None:
    """Serializa dicionário em JSON, convertendo float('inf') para 'inf'."""
    garantir_diretorio(str(Path(caminho).parent))

    def _converter(obj):
        if isinstance(obj, float) and obj == float("inf"):
            return "inf"
        raise TypeError(f"Tipo nao serializavel: {type(obj)}")

    with open(caminho, "w", encoding="utf-8") as f:
        json.dump(dados, f, ensure_ascii=False, indent=2, default=_converter)
    print(f"Resultado salvo em: {caminho}")


# ---------------------------------------------------------------------------
# API pública
# ---------------------------------------------------------------------------


def carregar_grafo(csv_aeroportos: str, csv_adjacencias: str) -> Grafo:
    """
    Carrega o grafo a partir dos dois CSVs:
    - csv_aeroportos : data/aeroportos_data.csv (colunas: iata, cidade, regiao)
    - csv_adjacencias: data/adjacencias_aeroportos.csv
      (colunas: origem, destino, tipo_conexao, justificativa, peso)

    Validações obrigatórias (lança ValueError com mensagem clara se falhar):
    - Sem IATA duplicado em aeroportos
    - Todas as colunas obrigatórias presentes
    - Nenhuma aresta com nó inexistente
    - Nenhum peso negativo

    Retorna o Grafo carregado e pronto para uso.
    """
    # --- Leitura e validação do CSV de aeroportos ---
    df_aeroportos = pd.read_csv(csv_aeroportos, dtype=str)
    df_aeroportos.columns = df_aeroportos.columns.str.strip()

    colunas_faltantes = _COLUNAS_AEROPORTOS - set(df_aeroportos.columns)
    if colunas_faltantes:
        raise ValueError(
            f"CSV de aeroportos está faltando colunas: {colunas_faltantes}"
        )

    duplicados = df_aeroportos[df_aeroportos.duplicated(subset="iata", keep=False)]
    if not duplicados.empty:
        raise ValueError(
            f"IATA duplicado encontrado: {duplicados['iata'].tolist()}"
        )

    # --- Leitura e validação do CSV de adjacências ---
    df_adj = pd.read_csv(csv_adjacencias, dtype=str)
    df_adj.columns = df_adj.columns.str.strip()

    colunas_faltantes = _COLUNAS_ADJACENCIAS - set(df_adj.columns)
    if colunas_faltantes:
        raise ValueError(
            f"CSV de adjacências está faltando colunas: {colunas_faltantes}"
        )

    # Converte peso para float após limpeza de espaços
    df_adj["peso"] = pd.to_numeric(df_adj["peso"].str.strip(), errors="raise")

    pesos_negativos = df_adj[df_adj["peso"] < 0]
    if not pesos_negativos.empty:
        raise ValueError(
            f"Arestas com peso negativo encontradas: {pesos_negativos[['origem', 'destino', 'peso']].to_dict('records')}"
        )

    # --- Construção do grafo ---
    grafo = Grafo()
    iatas_validos: set[str] = set()

    for _, linha in df_aeroportos.iterrows():
        iata = linha["iata"].strip()
        grafo.adicionar_no(iata, linha["cidade"].strip(), linha["regiao"].strip())
        iatas_validos.add(iata)

    for _, linha in df_adj.iterrows():
        origem = linha["origem"].strip()
        destino = linha["destino"].strip()

        if origem not in iatas_validos:
            raise ValueError(
                f"Aresta referencia nó inexistente como origem: '{origem}'"
            )
        if destino not in iatas_validos:
            raise ValueError(
                f"Aresta referencia nó inexistente como destino: '{destino}'"
            )

        grafo.adicionar_aresta(
            origem,
            destino,
            float(linha["peso"]),
            linha["tipo_conexao"].strip(),
            linha["justificativa"].strip(),
        )

    return grafo


def construir_adjacencias(csv_aeroportos: str, csv_saida: str) -> None:
    """
    Lê data/aeroportos_data.csv e constrói data/adjacencias_aeroportos.csv.

    MODELO DE ARESTAS:
    ------------------
    REGRA 1 — Conexão regional (tipo_conexao = "regional"):
      Todo aeroporto conecta-se a TODOS os outros da mesma região.
      justificativa = "conexão intra-regional: {regiao}"
      peso_base = 1.0

    REGRA 2 — Conexão hub nacional (tipo_conexao = "hub"):
      Hubs definidos: GRU (São Paulo/Sudeste), BSB (Brasília/Centro-Oeste),
      GIG (Rio de Janeiro/Sudeste).
      Todo aeroporto de outra região conecta-se ao(s) hub(s) mais relevante(s):
        - Norte    → MAO conecta a GRU e BSB
        - Nordeste → REC, SSA, FOR conectam a GRU; NAT, JPA, THE conectam a BSB
        - Sul      → POA, CWB, FLN conectam a GRU
      justificativa = "conexão via hub nacional {hub}"
      peso_base = 2.0

    REGRA 3 — Conexão inter-regional (tipo_conexao = "inter_regional"):
      Para garantir conectividade total e representar rotas estratégicas:
        BSB ↔ MAO, BSB ↔ BEL, BSB ↔ REC, BSB ↔ POA
        GRU ↔ MAO, GIG ↔ SSA
      justificativa = "ponte inter-regional estratégica"
      peso_base = 2.5

    FÓRMULA DO PESO FINAL (híbrida):
      penalidade_regiao = 1.0  se regiões diferentes, 0.0 caso contrário
      penalidade_hub    = 0.5  se nenhum dos dois é hub, 0.0 se pelo menos um é hub
      peso = peso_base + penalidade_regiao + penalidade_hub
      Restrição: peso >= 1.0, nunca negativo.

    Formato de saída (uma linha por par, sem espelhar):
      origem,destino,tipo_conexao,justificativa,peso

    Ao final, carrega o grafo e verifica conectividade.
    Lança RuntimeError se o grafo não for conectado.
    """
    df = pd.read_csv(csv_aeroportos, dtype=str)
    df.columns = df.columns.str.strip()
    df = df.map(lambda x: x.strip() if isinstance(x, str) else x)

    # Mapeamentos auxiliares: iata → regiao
    regioes: dict[str, str] = dict(zip(df["iata"], df["regiao"]))

    # Agrupamento por região: regiao → lista de IATAs
    por_regiao: dict[str, list[str]] = {}
    for iata, regiao in regioes.items():
        por_regiao.setdefault(regiao, []).append(iata)

    # Conjunto de pares já adicionados (evita duplicatas e espelhamento)
    pares_vistos: set[frozenset] = set()
    conexoes: list[dict] = []

    def _registrar(
        a: str, b: str, tipo: str, justificativa: str, peso_base: float
    ) -> None:
        """Registra uma conexão se o par ainda não foi visto."""
        par = frozenset([a, b])
        if par in pares_vistos:
            return
        pares_vistos.add(par)
        peso = _calcular_peso(a, b, regioes[a], regioes[b], peso_base)
        conexoes.append(
            {
                "origem": a,
                "destino": b,
                "tipo_conexao": tipo,
                "justificativa": justificativa,
                "peso": peso,
            }
        )

    # ------------------------------------------------------------------
    # REGRA 1 — Conexões regionais (clique completo dentro de cada região)
    # ------------------------------------------------------------------
    for regiao, aeroportos in por_regiao.items():
        justificativa = f"conexão intra-regional: {regiao}"
        for i in range(len(aeroportos)):
            for j in range(i + 1, len(aeroportos)):
                _registrar(aeroportos[i], aeroportos[j], "regional", justificativa, 1.0)

    # ------------------------------------------------------------------
    # REGRA 2 — Conexões de hub nacional
    # ------------------------------------------------------------------
    # Mapeamento: aeroporto → hubs aos quais deve se conectar
    conexoes_hub: dict[str, list[str]] = {
        # Norte
        "MAO": ["GRU", "BSB"],
        # Nordeste
        "REC": ["GRU"],
        "SSA": ["GRU"],
        "FOR": ["GRU"],
        "NAT": ["BSB"],
        "JPA": ["BSB"],
        "THE": ["BSB"],
        # Sul
        "POA": ["GRU"],
        "CWB": ["GRU"],
        "FLN": ["GRU"],
    }

    for aeroporto, hubs in conexoes_hub.items():
        if aeroporto not in regioes:
            continue  # aeroporto não presente no dataset, ignora silenciosamente
        for hub in hubs:
            if hub not in regioes:
                continue
            justificativa = f"conexão via hub nacional {hub}"
            _registrar(aeroporto, hub, "hub", justificativa, 2.0)

    # ------------------------------------------------------------------
    # REGRA 3 — Pontes inter-regionais estratégicas
    # ------------------------------------------------------------------
    pontes: list[tuple[str, str]] = [
        ("BSB", "MAO"),
        ("BSB", "BEL"),
        ("BSB", "REC"),
        ("BSB", "POA"),
        ("GRU", "MAO"),
        ("GIG", "SSA"),
    ]

    for a, b in pontes:
        if a not in regioes or b not in regioes:
            continue
        _registrar(a, b, "inter_regional", "ponte inter-regional estratégica", 2.5)

    # ------------------------------------------------------------------
    # Escrita do CSV de saída
    # ------------------------------------------------------------------
    df_saida = pd.DataFrame(conexoes, columns=["origem", "destino", "tipo_conexao", "justificativa", "peso"])
    df_saida.to_csv(csv_saida, index=False)

    # ------------------------------------------------------------------
    # Verificação de conectividade
    # ------------------------------------------------------------------
    grafo = carregar_grafo(csv_aeroportos, csv_saida)
    if not grafo.eh_conectado():
        raise RuntimeError(
            "O grafo construído NÃO é conectado. Revise as regras de adjacência."
        )
