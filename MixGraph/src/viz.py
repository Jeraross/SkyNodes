"""
Módulo de visualização do grafo de aeroportos (Seção 7).

Gera dois arquivos de saída:
  - out/arvore_percurso.png  : mapa estático com matplotlib
  - out/arvore_percurso.html : rede interativa com pyvis
"""

import os
from pathlib import Path

import matplotlib
matplotlib.use("Agg")  # backend sem janela — necessário para salvar direto em arquivo
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from pyvis.network import Network

from src.graphs.graph import Grafo
from src.graphs.algorithms import dijkstra, reconstruir_caminho
from src.graphs.io import carregar_grafo


# ---------------------------------------------------------------------------
# Posições geográficas aproximadas de cada aeroporto no mapa do Brasil
# Eixo X = longitude relativa (0 = oeste, 1 = leste)
# Eixo Y = latitude relativa  (0 = sul,   1 = norte)
# ---------------------------------------------------------------------------
_POSICOES: dict[str, tuple[float, float]] = {
    # Norte
    "MAO": (0.18, 0.82),
    "BEL": (0.38, 0.80),
    "PVH": (0.20, 0.65),
    "RBR": (0.12, 0.68),
    # Nordeste
    "THE": (0.55, 0.80),
    "FOR": (0.68, 0.82),
    "NAT": (0.78, 0.76),
    "JPA": (0.80, 0.70),
    "REC": (0.82, 0.65),
    "SSA": (0.75, 0.52),
    # Centro-Oeste
    "BSB": (0.52, 0.50),
    "GYN": (0.50, 0.43),
    # Sudeste
    "GRU": (0.58, 0.30),
    "CGH": (0.57, 0.28),
    "GIG": (0.65, 0.28),
    "CNF": (0.63, 0.35),
    "VIX": (0.70, 0.33),
    # Sul
    "CWB": (0.55, 0.18),
    "FLN": (0.60, 0.12),
    "POA": (0.55, 0.05),
}

# Paleta de cores para os caminhos
_COR_CAMINHO_1 = "#1f77b4"       # azul
_COR_CAMINHO_1_ESCURO = "#0a4a7a"
_COR_CAMINHO_2 = "#2ca02c"       # verde
_COR_CAMINHO_2_ESCURO = "#145214"
_COR_AMBOS = "#9467bd"           # roxo (nó em ambos os caminhos)
_COR_PADRAO = "#cccccc"          # cinza claro (nós fora dos caminhos)
_COR_ARESTA_PADRAO = "#bbbbbb"


def _coletar_nos_e_arestas(caminhos: list[dict]) -> tuple[
    set[str], set[str], set[frozenset], set[frozenset]
]:
    """
    Separa nós e arestas pertencentes ao caminho 1, caminho 2 ou a ambos.

    Retorna:
      nos_c1       : conjunto de nós exclusivos do caminho 1
      nos_c2       : conjunto de nós exclusivos do caminho 2
      arestas_c1   : frozensets das arestas do caminho 1
      arestas_c2   : frozensets das arestas do caminho 2
    """
    nos_c1: set[str] = set(caminhos[0]["nos"])
    nos_c2: set[str] = set(caminhos[1]["nos"])

    arestas_c1: set[frozenset] = {
        frozenset(par) for par in caminhos[0]["arestas"]
    }
    arestas_c2: set[frozenset] = {
        frozenset(par) for par in caminhos[1]["arestas"]
    }

    return nos_c1, nos_c2, arestas_c1, arestas_c2


# ---------------------------------------------------------------------------
# Visualização estática — matplotlib
# ---------------------------------------------------------------------------


def _plotar_png(
    grafo: Grafo,
    caminhos: list[dict],
    diretorio_saida: str,
) -> None:
    """
    Gera out/arvore_percurso.png com matplotlib.

    Nós e arestas são coloridos de acordo com sua participação nos
    caminhos REC->POA (azul) e MAO->GRU (verde). Nós compartilhados
    recebem cor roxa.
    """
    nos_c1, nos_c2, arestas_c1, arestas_c2 = _coletar_nos_e_arestas(caminhos)
    nos_ambos = nos_c1 & nos_c2

    fig, ax = plt.subplots(figsize=(12, 10))
    ax.set_facecolor("#f8f8f8")
    ax.set_xlim(-0.05, 1.05)
    ax.set_ylim(-0.05, 1.05)
    ax.axis("off")

    # --- Desenha arestas ---
    for origem, destino, *_ in grafo.arestas():
        par = frozenset([origem, destino])
        x0, y0 = _POSICOES[origem]
        x1, y1 = _POSICOES[destino]

        if par in arestas_c1 and par in arestas_c2:
            # Aresta compartilhada entre os dois caminhos
            cor = _COR_AMBOS
            lw = 3
            alpha = 1.0
        elif par in arestas_c1:
            cor = _COR_CAMINHO_1_ESCURO
            lw = 3
            alpha = 1.0
        elif par in arestas_c2:
            cor = _COR_CAMINHO_2_ESCURO
            lw = 3
            alpha = 1.0
        else:
            cor = _COR_ARESTA_PADRAO
            lw = 1
            alpha = 0.35

        ax.plot([x0, x1], [y0, y1], color=cor, linewidth=lw,
                alpha=alpha, zorder=1, solid_capstyle="round")

    # --- Desenha nós ---
    for iata, (x, y) in _POSICOES.items():
        if iata in nos_ambos:
            cor_no = _COR_AMBOS
            tamanho = 350
            borda = "#4a1a7a"
        elif iata in nos_c1:
            cor_no = _COR_CAMINHO_1
            tamanho = 300
            borda = _COR_CAMINHO_1_ESCURO
        elif iata in nos_c2:
            cor_no = _COR_CAMINHO_2
            tamanho = 300
            borda = _COR_CAMINHO_2_ESCURO
        else:
            cor_no = _COR_PADRAO
            tamanho = 180
            borda = "#888888"

        ax.scatter(x, y, s=tamanho, c=cor_no, edgecolors=borda,
                   linewidths=1.5, zorder=3)
        ax.text(x, y + 0.035, iata, ha="center", va="bottom",
                fontsize=7.5, fontweight="bold", zorder=4,
                color="#222222")

    # --- Legenda ---
    patch_c1 = mpatches.Patch(
        color=_COR_CAMINHO_1,
        label=f"{caminhos[0]['label']}  (custo: {caminhos[0]['custo']:.1f})",
    )
    patch_c2 = mpatches.Patch(
        color=_COR_CAMINHO_2,
        label=f"{caminhos[1]['label']}  (custo: {caminhos[1]['custo']:.1f})",
    )
    patch_ambos = mpatches.Patch(color=_COR_AMBOS, label="No em ambos os caminhos")
    patch_pad = mpatches.Patch(color=_COR_PADRAO, label="Demais aeroportos")

    ax.legend(
        handles=[patch_c1, patch_c2, patch_ambos, patch_pad],
        loc="lower right",
        fontsize=9,
        framealpha=0.9,
    )

    ax.set_title(
        "Arvore de Percurso: REC->POA e MAO->GRU",
        fontsize=14,
        fontweight="bold",
        pad=12,
    )

    # Linha divisória sutil representando o contorno do Brasil (opcional estético)
    fig.tight_layout()

    caminho_png = Path(diretorio_saida) / "arvore_percurso.png"
    fig.savefig(str(caminho_png), dpi=150, bbox_inches="tight")
    plt.close(fig)
    print(f"PNG salvo em: {caminho_png}")


# ---------------------------------------------------------------------------
# Visualização interativa — pyvis
# ---------------------------------------------------------------------------


def _plotar_html(
    grafo: Grafo,
    caminhos: list[dict],
    diretorio_saida: str,
) -> None:
    """
    Gera out/arvore_percurso.html com pyvis.

    - Fundo escuro (#222222), fonte branca
    - Nós dos caminhos com cor de destaque e borda
    - Arestas dos caminhos em vermelho (width=5)
    - Arestas comuns em cinza (#555555, width=1)
    - Tooltip (title) com IATA, Cidade e Região
    - Physics ativada para layout interativo
    """
    nos_c1, nos_c2, arestas_c1, arestas_c2 = _coletar_nos_e_arestas(caminhos)
    nos_ambos = nos_c1 & nos_c2

    rede = Network(
        height="750px",
        width="100%",
        bgcolor="#222222",
        font_color="white",
    )
    rede.toggle_physics(True)

    # --- Adiciona nós ---
    for iata in grafo.nos():
        info = grafo.info_no(iata)
        cidade = info.get("cidade", "")
        regiao = info.get("regiao", "")

        tooltip = f"{iata}\nCidade: {cidade}\nRegiao: {regiao}"

        if iata in nos_ambos:
            cor_no = _COR_AMBOS
            borda = "#ffffff"
            tamanho = 30
        elif iata in nos_c1:
            cor_no = _COR_CAMINHO_1
            borda = "#ffffff"
            tamanho = 25
        elif iata in nos_c2:
            cor_no = _COR_CAMINHO_2
            borda = "#ffffff"
            tamanho = 25
        else:
            cor_no = "#444444"
            borda = "#888888"
            tamanho = 15

        rede.add_node(
            iata,
            label=iata,
            title=tooltip,
            color={"background": cor_no, "border": borda},
            size=tamanho,
            font={"size": 14, "color": "white"},
        )

    # --- Adiciona arestas ---
    # Rastreia pares já inseridos para não duplicar (grafo não-direcionado)
    pares_inseridos: set[frozenset] = set()

    for origem, destino, peso, *_ in grafo.arestas():
        par = frozenset([origem, destino])
        if par in pares_inseridos:
            continue
        pares_inseridos.add(par)

        em_c1 = par in arestas_c1
        em_c2 = par in arestas_c2

        if em_c1 or em_c2:
            cor_aresta = "red"
            largura = 5
        else:
            cor_aresta = "#555555"
            largura = 1

        rede.add_edge(
            origem,
            destino,
            color=cor_aresta,
            width=largura,
            title=f"Peso: {peso:.2f}",
        )

    # Configurações de física para layout agradável
    rede.set_options("""
    {
      "physics": {
        "enabled": true,
        "barnesHut": {
          "gravitationalConstant": -8000,
          "centralGravity": 0.3,
          "springLength": 120,
          "springConstant": 0.04,
          "damping": 0.09
        }
      },
      "edges": {
        "smooth": { "type": "continuous" }
      }
    }
    """)

    caminho_html = Path(diretorio_saida) / "arvore_percurso.html"
    rede.save_graph(str(caminho_html))
    print(f"HTML salvo em: {caminho_html}")


# ---------------------------------------------------------------------------
# API pública
# ---------------------------------------------------------------------------


def plotar_arvore_percurso(
    grafo: Grafo,
    caminhos: list[dict],
    diretorio_saida: str,
) -> None:
    """
    Recebe lista de caminhos, cada um com:
      {
        'label'  : str,              ex: "REC -> POA"
        'nos'    : list[str],        ex: ["REC", "GRU", "POA"]
        'arestas': list[tuple[str, str]],
        'custo'  : float
      }

    Gera dois arquivos de saída:
      - out/arvore_percurso.png  : mapa estático (matplotlib)
      - out/arvore_percurso.html : rede interativa (pyvis)

    Parâmetros:
      grafo           : instância de Grafo já carregada
      caminhos        : lista com exatamente 2 dicionários de caminho
      diretorio_saida : caminho para o diretório de saída (ex: "out/")
    """
    os.makedirs(diretorio_saida, exist_ok=True)

    _plotar_png(grafo, caminhos, diretorio_saida)
    _plotar_html(grafo, caminhos, diretorio_saida)


# ---------------------------------------------------------------------------
# Bloco de execução direto
# ---------------------------------------------------------------------------

# ---------------------------------------------------------------------------
# SEÇÃO 9 — Grafo interativo completo
# ---------------------------------------------------------------------------

# Cores dos nós por região
_COR_REGIAO: dict[str, str] = {
    "Norte":        "#5b9bd5",
    "Nordeste":     "#ed7d31",
    "Sudeste":      "#70ad47",
    "Sul":          "#ffc000",
    "Centro-Oeste": "#7030a0",
}

# Cores das arestas por tipo de conexão
_COR_TIPO_CONEXAO: dict[str, str] = {
    "regional":       "#aec7e8",
    "hub":            "#ffbb78",
    "inter_regional": "#98df8a",
}

# Limites de tamanho dos nós (escalonado pelo grau)
_TAMANHO_MIN = 15
_TAMANHO_MAX = 45


def _escalar_tamanho(grau: int, grau_min: int, grau_max: int) -> int:
    """
    Escala linear do grau para o intervalo [_TAMANHO_MIN, _TAMANHO_MAX].
    Retorna _TAMANHO_MIN se todos os graus forem iguais.
    """
    if grau_max == grau_min:
        return (_TAMANHO_MIN + _TAMANHO_MAX) // 2
    fator = (grau - grau_min) / (grau_max - grau_min)
    return int(_TAMANHO_MIN + fator * (_TAMANHO_MAX - _TAMANHO_MIN))


def _escalar_espessura(peso: float, peso_min: float, peso_max: float) -> float:
    """
    Espessura da aresta inversamente proporcional ao peso:
    peso menor → aresta mais espessa (range 1.0 a 6.0).
    """
    if peso_max == peso_min:
        return 3.0
    fator = 1.0 - (peso - peso_min) / (peso_max - peso_min)
    return round(1.0 + fator * 5.0, 2)


def _injetar_legenda(caminho_html: str, caminhos_destaque: list[dict]) -> None:
    """
    Injeta uma caixa de legenda HTML diretamente no arquivo gerado pelo pyvis,
    logo após a tag <body>. Explica as cores dos dois caminhos obrigatórios
    e as cores das regiões/tipos de conexão.
    """
    label_c1 = caminhos_destaque[0]["label"]
    label_c2 = caminhos_destaque[1]["label"]

    legenda_html = f"""
<div id="legenda" style="
    position: fixed; top: 16px; left: 16px; z-index: 9999;
    background: rgba(10,10,30,0.92); color: white;
    border: 1px solid #444; border-radius: 8px;
    padding: 12px 16px; font-family: sans-serif; font-size: 13px;
    min-width: 220px; line-height: 1.7;
">
  <b style="font-size:14px;">Legenda</b><br>
  <hr style="border-color:#555; margin:6px 0;">
  <b>Caminhos obrigatorios</b><br>
  <span style="color:#cc0000;">&#9632;</span> {label_c1}<br>
  <span style="color:#006600;">&#9632;</span> {label_c2}<br>
  <hr style="border-color:#555; margin:6px 0;">
  <b>Regioes (nos)</b><br>
  {"".join(
      f'<span style="color:{cor};">&#9679;</span> {reg}<br>'
      for reg, cor in _COR_REGIAO.items()
  )}
  <hr style="border-color:#555; margin:6px 0;">
  <b>Tipo de conexao (arestas)</b><br>
  {"".join(
      f'<span style="color:{cor};">&#9644;</span> {tipo}<br>'
      for tipo, cor in _COR_TIPO_CONEXAO.items()
  )}
</div>
"""

    with open(caminho_html, "r", encoding="utf-8") as f:
        conteudo = f.read()

    # Insere logo após a abertura do <body>
    conteudo = conteudo.replace("<body>", "<body>\n" + legenda_html, 1)

    with open(caminho_html, "w", encoding="utf-8") as f:
        f.write(conteudo)


def gerar_grafo_interativo(
    grafo: Grafo,
    ego_metricas: list[dict],
    caminhos_destaque: list[dict],
    diretorio_saida: str,
) -> None:
    """
    Gera out/grafo_interativo.html com pyvis.Network.

    Requisitos:
      1. Tooltip por nó: IATA | Cidade | Regiao | Grau | Densidade Ego
      2. Caixa de busca via show_buttons(filter_=['nodes'])
      3. Nós/arestas dos caminhos obrigatorios realçados em vermelho e verde
      4. Cor dos nós por região, tamanho proporcional ao grau
      5. Espessura da aresta inversamente proporcional ao peso
      6. Cor da aresta por tipo_conexao
      7. Legenda HTML embutida no arquivo

    Parâmetros:
      grafo              : instância de Grafo já carregada
      ego_metricas       : lista retornada por calcular_ego_redes()
      caminhos_destaque  : lista com 2 dicts {label, nos, arestas, custo}
      diretorio_saida    : caminho para o diretório de saída
    """
    os.makedirs(diretorio_saida, exist_ok=True)

    # --- Índices auxiliares ---
    # Mapa IATA -> densidade_ego
    ego_por_iata: dict[str, float] = {
        m["aeroporto"]: m["densidade_ego"] for m in ego_metricas
    }

    # Graus para escalonamento do tamanho dos nós
    graus: dict[str, int] = {iata: grafo.grau(iata) for iata in grafo.nos()}
    grau_min = min(graus.values())
    grau_max = max(graus.values())

    # Pesos para escalonamento da espessura das arestas
    todas_arestas = grafo.arestas()
    pesos = [peso for _, _, peso, _, _ in todas_arestas]
    peso_min = min(pesos)
    peso_max = max(pesos)

    # Nós e arestas dos caminhos de destaque
    nos_c1: set[str] = set(caminhos_destaque[0]["nos"])
    nos_c2: set[str] = set(caminhos_destaque[1]["nos"])
    arestas_c1: set[frozenset] = {frozenset(p) for p in caminhos_destaque[0]["arestas"]}
    arestas_c2: set[frozenset] = {frozenset(p) for p in caminhos_destaque[1]["arestas"]}

    # --- Rede pyvis ---
    rede = Network(
        height="750px",
        width="100%",
        bgcolor="#1a1a2e",
        font_color="white",
    )
    rede.toggle_physics(True)

    # Caixa de busca (filtro de nós)
    rede.show_buttons(filter_=["nodes"])

    # --- Nós ---
    for iata in grafo.nos():
        info = grafo.info_no(iata)
        cidade = info.get("cidade", "")
        regiao = info.get("regiao", "")
        grau = graus[iata]
        densidade_ego = ego_por_iata.get(iata, 0.0)
        tamanho = _escalar_tamanho(grau, grau_min, grau_max)

        tooltip = (
            f"{iata} | {cidade} | {regiao} | "
            f"Grau: {grau} | Densidade Ego: {densidade_ego:.2f}"
        )

        # Cor de destaque sobrepõe a cor de região nos caminhos obrigatórios
        nos_ambos = nos_c1 & nos_c2
        if iata in nos_ambos:
            # Nó compartilhado: usa vermelho (caminho 1 tem prioridade visual)
            cor_fundo = "#cc0000"
            cor_borda = "#ffffff"
        elif iata in nos_c1:
            cor_fundo = "#cc0000"
            cor_borda = "#ff6666"
        elif iata in nos_c2:
            cor_fundo = "#006600"
            cor_borda = "#00cc00"
        else:
            cor_fundo = _COR_REGIAO.get(regiao, "#888888")
            cor_borda = "#ffffff"

        rede.add_node(
            iata,
            label=iata,
            title=tooltip,
            color={"background": cor_fundo, "border": cor_borda},
            size=tamanho,
            font={"size": 14, "color": "white", "bold": True},
            borderWidth=2,
        )

    # --- Arestas ---
    pares_inseridos: set[frozenset] = set()

    for origem, destino, peso, tipo_conexao, _ in todas_arestas:
        par = frozenset([origem, destino])
        if par in pares_inseridos:
            continue
        pares_inseridos.add(par)

        espessura = _escalar_espessura(peso, peso_min, peso_max)

        # Cor e espessura de destaque sobrepõem o tipo de conexão
        em_c1 = par in arestas_c1
        em_c2 = par in arestas_c2

        if em_c1:
            cor_aresta = "#cc0000"
            espessura = max(espessura, 4.0)
        elif em_c2:
            cor_aresta = "#006600"
            espessura = max(espessura, 4.0)
        else:
            cor_aresta = _COR_TIPO_CONEXAO.get(tipo_conexao, "#888888")

        rede.add_edge(
            origem,
            destino,
            color=cor_aresta,
            width=espessura,
            title=f"Peso: {peso:.2f} | Tipo: {tipo_conexao}",
        )

    # Configurações de física (Barnes-Hut)
    rede.set_options("""
    {
      "physics": {
        "enabled": true,
        "barnesHut": {
          "gravitationalConstant": -9000,
          "centralGravity": 0.25,
          "springLength": 140,
          "springConstant": 0.05,
          "damping": 0.1
        }
      },
      "edges": {
        "smooth": { "type": "continuous" }
      }
    }
    """)

    caminho_html = Path(diretorio_saida) / "grafo_interativo.html"
    rede.save_graph(str(caminho_html))

    # Injeta legenda HTML diretamente no arquivo gerado
    _injetar_legenda(str(caminho_html), caminhos_destaque)

    print(f"HTML interativo salvo em: {caminho_html}")


# ---------------------------------------------------------------------------
# Ponto de entrada direto
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    from src.solve import calcular_ego_redes

    _BASE = Path(__file__).parent.parent
    _CSV_AEROPORTOS = str(_BASE / "data" / "aeroportos_data.csv")
    _CSV_ADJACENCIAS = str(_BASE / "data" / "adjacencias_aeroportos.csv")
    _DIR_SAIDA = str(_BASE / "out")

    # 1. Carrega o grafo
    print("Carregando grafo...")
    grafo = carregar_grafo(_CSV_AEROPORTOS, _CSV_ADJACENCIAS)

    # 2. Roda Dijkstra para os dois pares obrigatórios
    print("Calculando caminhos (Dijkstra)...")

    res_rec_poa = dijkstra(grafo, "REC", "POA")
    caminho_rec_poa = res_rec_poa["caminho"]
    arestas_rec_poa = list(zip(caminho_rec_poa, caminho_rec_poa[1:]))

    res_mao_gru = dijkstra(grafo, "MAO", "GRU")
    caminho_mao_gru = res_mao_gru["caminho"]
    arestas_mao_gru = list(zip(caminho_mao_gru, caminho_mao_gru[1:]))

    # 3. Monta lista de caminhos no formato esperado
    caminhos = [
        {
            "label": "REC -> POA",
            "nos": caminho_rec_poa,
            "arestas": arestas_rec_poa,
            "custo": res_rec_poa["custo"],
        },
        {
            "label": "MAO -> GRU",
            "nos": caminho_mao_gru,
            "arestas": arestas_mao_gru,
            "custo": res_mao_gru["custo"],
        },
    ]

    print(f"  REC -> POA : {' -> '.join(caminho_rec_poa)}  (custo {res_rec_poa['custo']:.1f})")
    print(f"  MAO -> GRU : {' -> '.join(caminho_mao_gru)}  (custo {res_mao_gru['custo']:.1f})")

    # 4. Calcula ego-redes (necessário para o grafo interativo)
    print("\nCalculando ego-redes...")
    ego = calcular_ego_redes(grafo, _DIR_SAIDA)

    # 5. Gera visualizações
    print("\nGerando visualizacoes...")
    plotar_arvore_percurso(grafo, caminhos, _DIR_SAIDA)
    gerar_grafo_interativo(grafo, ego, caminhos, _DIR_SAIDA)

    # 6. Confirma arquivos gerados
    arquivos = [
        Path(_DIR_SAIDA) / "arvore_percurso.png",
        Path(_DIR_SAIDA) / "arvore_percurso.html",
        Path(_DIR_SAIDA) / "grafo_interativo.html",
    ]
    print("\nArquivos gerados:")
    for arq in arquivos:
        print(f"  {'OK  ' if arq.exists() else 'ERRO'} {arq}")
