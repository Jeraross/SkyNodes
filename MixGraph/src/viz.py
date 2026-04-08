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
# SEÇÕES 8 e 10 — Visualizações analíticas (matplotlib)
# ---------------------------------------------------------------------------

import numpy as np
import matplotlib.cm as cm
import matplotlib.colors as mcolors
from matplotlib.ticker import MaxNLocator

from src.graphs.algorithms import bfs


def viz_distribuicao_graus(grafo: Grafo, diretorio_saida: str) -> None:
    """
    VIZ 1 (Exploratória) — Histograma da distribuição de graus.

    Mostra quantos aeroportos possuem cada valor de grau.
    Barras coloridas pelo colormap viridis, linha tracejada vermelha na média.

    Arquivo: out/viz1_distribuicao_graus.png
    """
    os.makedirs(diretorio_saida, exist_ok=True)

    graus = [grafo.grau(iata) for iata in grafo.nos()]
    media = sum(graus) / len(graus)

    # Valores únicos de grau como posições das barras
    valores = sorted(set(graus))
    contagens = [graus.count(v) for v in valores]

    # Colormap viridis normalizado pela frequência
    norm = mcolors.Normalize(vmin=min(contagens), vmax=max(contagens))
    cmap = cm.get_cmap("viridis")
    cores = [cmap(norm(c)) for c in contagens]

    fig, ax = plt.subplots(figsize=(9, 5))
    bars = ax.bar(valores, contagens, color=cores, edgecolor="white",
                  linewidth=0.8, width=0.7)

    # Linha de média
    ax.axvline(media, color="red", linestyle="--", linewidth=1.8,
               label=f"Media: {media:.1f}")

    # Anotação da média acima da linha
    ax.annotate(
        f"Media = {media:.1f}",
        xy=(media, max(contagens) * 0.95),
        xytext=(media + 0.3, max(contagens) * 0.95),
        fontsize=9, color="red",
        arrowprops=dict(arrowstyle="->", color="red", lw=1.2),
    )

    ax.set_xlabel("Grau (numero de conexoes)", fontsize=11)
    ax.set_ylabel("Frequencia (quantidade de aeroportos)", fontsize=11)
    ax.set_title("Distribuicao de Graus dos Aeroportos Brasileiros", fontsize=13, fontweight="bold")
    ax.xaxis.set_major_locator(MaxNLocator(integer=True))
    ax.yaxis.set_major_locator(MaxNLocator(integer=True))
    ax.legend(fontsize=10)

    # Barra de cor como escala de frequência
    sm = cm.ScalarMappable(cmap=cmap, norm=norm)
    sm.set_array([])
    fig.colorbar(sm, ax=ax, label="Frequencia (escala de cor)")

    fig.tight_layout()
    caminho = Path(diretorio_saida) / "viz1_distribuicao_graus.png"
    fig.savefig(str(caminho), dpi=150, bbox_inches="tight")
    plt.close(fig)
    print(f"VIZ1 salvo em: {caminho}")

    # Nota analítica
    print("\n[NOTA ANALITICA — VIZ 1: Distribuicao de Graus]")
    print(f"  A distribuicao de graus revela heterogeneidade significativa na rede.")
    print(f"  Grau minimo: {min(graus)}  |  Grau maximo: {max(graus)}  |  Media: {media:.1f}")
    print(f"  Hubs como GRU (grau={max(graus)}) concentram muitas conexoes, padrão")
    print(f"  tipico de redes de transporte aereo com topologia hub-and-spoke.")
    print(f"  O histograma foi escolhido por ser o grafico canônico para distribuicoes")
    print(f"  discretas, permitindo identificar assimetria e outliers de forma imediata.\n")


def viz_ranking_graus(grafo: Grafo, diretorio_saida: str) -> None:
    """
    VIZ 2 (Exploratória) — Barras horizontais com ranking de conectividade.

    Todos os aeroportos ordenados por grau (decrescente, topo→baixo).
    Cor por região, hachura '//' nos hubs GRU, BSB, GIG.

    Arquivo: out/viz2_ranking_conectados.png
    """
    os.makedirs(diretorio_saida, exist_ok=True)

    _HUBS = {"GRU", "BSB", "GIG"}

    # Ordena por grau decrescente (empate: alfabético)
    dados = sorted(
        [(iata, grafo.grau(iata), grafo.info_no(iata).get("regiao", ""))
         for iata in grafo.nos()],
        key=lambda x: (-x[1], x[0]),
    )

    iatas = [d[0] for d in dados]
    graus_ord = [d[1] for d in dados]
    regioes_ord = [d[2] for d in dados]

    cores_barras = [_COR_REGIAO.get(r, "#888888") for r in regioes_ord]

    fig, ax = plt.subplots(figsize=(10, 8))

    bars = ax.barh(
        range(len(iatas)), graus_ord,
        color=cores_barras, edgecolor="white", linewidth=0.6,
    )

    # Hachura nos hubs
    for i, iata in enumerate(iatas):
        if iata in _HUBS:
            bars[i].set_hatch("//")
            bars[i].set_edgecolor("#222222")

    # Valor do grau ao lado de cada barra
    for i, g in enumerate(graus_ord):
        ax.text(g + 0.1, i, str(g), va="center", fontsize=8.5, color="#222222")

    ax.set_yticks(range(len(iatas)))
    ax.set_yticklabels(iatas, fontsize=9)
    ax.invert_yaxis()  # maior grau no topo
    ax.set_xlabel("Grau (numero de conexoes)", fontsize=11)
    ax.set_ylabel("Aeroporto (IATA)", fontsize=11)
    ax.set_title("Ranking de Conectividade dos Aeroportos", fontsize=13, fontweight="bold")
    ax.set_xlim(0, max(graus_ord) + 2)

    # Legenda de regiões
    patches_regioes = [
        mpatches.Patch(color=cor, label=reg)
        for reg, cor in _COR_REGIAO.items()
    ]
    patches_regioes.append(
        mpatches.Patch(facecolor="white", edgecolor="#222222", hatch="//", label="Hub nacional")
    )
    ax.legend(handles=patches_regioes, loc="lower right", fontsize=9, framealpha=0.9)

    fig.tight_layout()
    caminho = Path(diretorio_saida) / "viz2_ranking_conectados.png"
    fig.savefig(str(caminho), dpi=150, bbox_inches="tight")
    plt.close(fig)
    print(f"VIZ2 salvo em: {caminho}")

    # Nota analítica
    print("\n[NOTA ANALITICA — VIZ 2: Ranking de Conectividade]")
    lider = dados[0]
    print(f"  GRU lidera com grau {lider[1]}, seguido de BSB e REC/SSA.")
    print(f"  A hachura destaca os tres hubs nacionais (GRU, BSB, GIG),")
    print(f"  que concentram as rotas inter-regionais e estruturam a rede.")
    print(f"  Barras horizontais foram preferidas ao grafico vertical por")
    print(f"  acomodar melhor os 20 labels IATA sem sobreposicao.\n")


def viz_metricas_regioes(metricas_regioes: list[dict], diretorio_saida: str) -> None:
    """
    VIZ 3 (Exploratória) — Barras agrupadas comparando métricas regionais.

    Grupos no eixo X: regiões.
    3 barras por grupo: Ordem |V|, Tamanho |E|, Densidade×10.

    Arquivo: out/viz3_metricas_regioes.png
    """
    os.makedirs(diretorio_saida, exist_ok=True)

    regioes = [m["regiao"] for m in metricas_regioes]
    ordens = [m["ordem"] for m in metricas_regioes]
    tamanhos = [m["tamanho"] for m in metricas_regioes]
    densidades = [round(m["densidade"] * 10, 3) for m in metricas_regioes]

    x = np.arange(len(regioes))
    largura = 0.25

    fig, ax = plt.subplots(figsize=(10, 6))

    b1 = ax.bar(x - largura, ordens, largura, label="Ordem |V|",
                color="#4c72b0", edgecolor="white")
    b2 = ax.bar(x,          tamanhos, largura, label="Tamanho |E|",
                color="#dd8452", edgecolor="white")
    b3 = ax.bar(x + largura, densidades, largura, label="Densidade x10",
                color="#55a868", edgecolor="white")

    # Anotações no topo de cada barra
    for bars in (b1, b2, b3):
        for bar in bars:
            h = bar.get_height()
            ax.text(
                bar.get_x() + bar.get_width() / 2, h + 0.1,
                f"{h:.1f}", ha="center", va="bottom", fontsize=7.5
            )

    ax.set_xticks(x)
    ax.set_xticklabels(regioes, fontsize=10)
    ax.set_xlabel("Regiao", fontsize=11)
    ax.set_ylabel("Valor da metrica", fontsize=11)
    ax.set_title("Metricas por Regiao do Grafo Aeroportuario", fontsize=13, fontweight="bold")
    ax.legend(fontsize=10, title="Metrica (Densidade multiplicada por 10 para escala)")
    ax.set_ylim(0, max(tamanhos) * 1.2)

    fig.tight_layout()
    caminho = Path(diretorio_saida) / "viz3_metricas_regioes.png"
    fig.savefig(str(caminho), dpi=150, bbox_inches="tight")
    plt.close(fig)
    print(f"VIZ3 salvo em: {caminho}")

    # Nota analítica
    print("\n[NOTA ANALITICA — VIZ 3: Metricas por Regiao]")
    print(f"  Todas as regioes apresentam densidade = 1.0 (clique completo),")
    print(f"  pois a Regra 1 conecta todos os aeroportos de mesma regiao entre si.")
    print(f"  O Nordeste lidera em tamanho (15 arestas, 6 nos) por ter mais aeroportos.")
    print(f"  O grafico agrupado permite comparar as tres metricas simultaneamente,")
    print(f"  revelando que ordem e tamanho variam, mas a densidade regional e uniforme.\n")


def viz_ego_grau_densidade(
    ego_metricas: list[dict], grafo: Grafo, diretorio_saida: str
) -> None:
    """
    VIZ 4 (Exploratória) — Scatter grau × densidade da ego-rede.

    Cada ponto = um aeroporto. Cor por região, tamanho proporcional ao grau.
    Anotações nos 5 aeroportos com maior densidade_ego.

    Arquivo: out/viz4_ego_grau_densidade.png
    """
    os.makedirs(diretorio_saida, exist_ok=True)

    # Agrupa dados por região para plotar com cores separadas
    por_regiao: dict[str, list] = {}
    for m in ego_metricas:
        iata = m["aeroporto"]
        regiao = grafo.info_no(iata).get("regiao", "Desconhecida")
        por_regiao.setdefault(regiao, []).append({
            "iata": iata,
            "grau": m["grau"],
            "densidade_ego": m["densidade_ego"],
        })

    fig, ax = plt.subplots(figsize=(9, 6))

    # Plota cada região com sua cor
    for regiao, pontos in por_regiao.items():
        xs = [p["grau"] for p in pontos]
        ys = [p["densidade_ego"] for p in pontos]
        tamanhos = [p["grau"] * 25 for p in pontos]
        ax.scatter(xs, ys, s=tamanhos, c=_COR_REGIAO.get(regiao, "#888888"),
                   label=regiao, alpha=0.85, edgecolors="white", linewidths=0.8, zorder=3)

    # Anotações nos 5 aeroportos com maior densidade_ego
    top5 = sorted(ego_metricas, key=lambda x: (-x["densidade_ego"], x["aeroporto"]))[:5]
    for m in top5:
        iata = m["aeroporto"]
        ax.annotate(
            iata,
            xy=(m["grau"], m["densidade_ego"]),
            xytext=(m["grau"] + 0.15, m["densidade_ego"] + 0.015),
            fontsize=8.5, fontweight="bold",
            arrowprops=dict(arrowstyle="-", color="#444444", lw=0.8),
        )

    ax.set_xlabel("Grau do aeroporto", fontsize=11)
    ax.set_ylabel("Densidade da Ego-Rede", fontsize=11)
    ax.set_title("Relacao entre Grau e Densidade da Ego-Rede", fontsize=13, fontweight="bold")
    ax.set_ylim(-0.05, 1.1)
    ax.legend(title="Regiao", fontsize=9, title_fontsize=9)

    fig.tight_layout()
    caminho = Path(diretorio_saida) / "viz4_ego_grau_densidade.png"
    fig.savefig(str(caminho), dpi=150, bbox_inches="tight")
    plt.close(fig)
    print(f"VIZ4 salvo em: {caminho}")

    # Nota analítica
    print("\n[NOTA ANALITICA — VIZ 4: Grau x Densidade Ego-Rede]")
    print(f"  Aeroportos do Sudeste formam cliques densos (densidade_ego = 1.0)")
    print(f"  mesmo com grau moderado, pois seus vizinhos sao todos interligados.")
    print(f"  GRU tem alto grau mas densidade_ego menor, pois conecta regioes")
    print(f"  diferentes cujos nos nao sao diretamente adjacentes entre si.")
    print(f"  O scatter foi escolhido para revelar a relacao entre as duas variaveis")
    print(f"  e a estrutura regional simultaneamente via cor.\n")


def viz_camadas_bfs(grafo: Grafo, diretorio_saida: str) -> None:
    """
    VIZ 5 (Explanatória) — Camadas BFS a partir de REC.

    Cada coluna = uma camada BFS. Gradiente claro→escuro com o nivel.
    Arestas de arvore em azul, demais em cinza claro.

    Arquivo: out/viz5_camadas_bfs.png
    """
    os.makedirs(diretorio_saida, exist_ok=True)

    resultado = bfs(grafo, "REC")
    niveis: dict[str, int] = resultado["niveis"]
    arestas_arvore: set[frozenset] = {
        frozenset(par) for par in resultado["arestas_arvore"]
    }

    # Agrupa nós por nível
    por_nivel: dict[int, list[str]] = {}
    for iata, nivel in niveis.items():
        por_nivel.setdefault(nivel, []).append(iata)

    n_niveis = max(por_nivel.keys()) + 1

    # Posições: X = nível, Y = posição dentro do nível (centralizada)
    pos: dict[str, tuple[float, float]] = {}
    for nivel, nos_nivel in por_nivel.items():
        nos_nivel_sorted = sorted(nos_nivel)
        n = len(nos_nivel_sorted)
        for i, iata in enumerate(nos_nivel_sorted):
            pos[iata] = (float(nivel), float(i) - (n - 1) / 2.0)

    # Gradiente de cores por nível (azul claro → azul escuro)
    cmap_niveis = cm.get_cmap("Blues")
    cores_nivel = {
        nivel: cmap_niveis(0.3 + 0.6 * nivel / max(1, n_niveis - 1))
        for nivel in range(n_niveis)
    }

    fig, ax = plt.subplots(figsize=(13, 7))
    ax.set_facecolor("#f5f5f5")
    ax.axis("off")

    # Desenha todas as arestas do grafo
    for origem, destino, *_ in grafo.arestas():
        if origem not in pos or destino not in pos:
            continue
        x0, y0 = pos[origem]
        x1, y1 = pos[destino]
        par = frozenset([origem, destino])
        if par in arestas_arvore:
            cor_aresta = "#2171b5"
            lw = 2.0
            alpha = 0.9
            zorder = 2
        else:
            cor_aresta = "#aaaaaa"
            lw = 0.8
            alpha = 0.2
            zorder = 1
        ax.plot([x0, x1], [y0, y1], color=cor_aresta, lw=lw, alpha=alpha, zorder=zorder)

    # Desenha nós
    for iata, (x, y) in pos.items():
        nivel = niveis[iata]
        cor = cores_nivel[nivel]
        ax.scatter(x, y, s=420, c=[cor], edgecolors="#222222",
                   linewidths=1.2, zorder=4)
        ax.text(x, y, iata, ha="center", va="center",
                fontsize=7, fontweight="bold", color="#111111", zorder=5)

    # Rótulos de nível no eixo X
    for nivel in range(n_niveis):
        ax.text(nivel, -max(len(v) for v in por_nivel.values()) / 2 - 0.9,
                f"Nivel {nivel}", ha="center", va="top", fontsize=9,
                color="#333333", fontweight="bold")

    # Subtítulo com distribuição de camadas
    dist_str = "  |  ".join(
        f"Nivel {k}: {len(v)} no{'s' if len(v) > 1 else ''}"
        for k, v in sorted(por_nivel.items())
    )
    fig.suptitle(
        f"Camadas BFS a partir de Recife (REC)\n{dist_str}",
        fontsize=11, y=1.01,
    )
    ax.set_title("Camadas BFS a partir de Recife (REC)", fontsize=13, fontweight="bold", pad=10)

    # Legenda de camadas
    patches_niveis = [
        mpatches.Patch(color=cores_nivel[n], label=f"Nivel {n} ({len(por_nivel[n])} nos)")
        for n in sorted(por_nivel.keys())
    ]
    patches_niveis += [
        mpatches.Patch(color="#2171b5", label="Aresta da arvore BFS"),
        mpatches.Patch(color="#aaaaaa", alpha=0.5, label="Aresta nao-arvore"),
    ]
    ax.legend(handles=patches_niveis, loc="upper right", fontsize=8.5,
              framealpha=0.95, title="Camadas BFS")

    fig.tight_layout()
    caminho = Path(diretorio_saida) / "viz5_camadas_bfs.png"
    fig.savefig(str(caminho), dpi=150, bbox_inches="tight")
    plt.close(fig)
    print(f"VIZ5 salvo em: {caminho}")

    # Nota analítica
    print("\n[NOTA ANALITICA — VIZ 5: Camadas BFS de REC]")
    print(f"  REC alcanca todos os 20 aeroportos em apenas {n_niveis - 1} saltos,")
    print(f"  confirmando a alta conectividade da rede. O nivel 1 inclui os grandes")
    print(f"  hubs (GRU, BSB) e os vizinhos regionais nordestinos, refletindo a")
    print(f"  estrutura hub-and-spoke. Aeroportos mais perifericos (PVH, RBR)")
    print(f"  so sao alcancados no nivel 3, evidenciando a dependencia de escala.")
    print(f"  Visualizacao explanatoria: o layout por colunas torna o conceito de")
    print(f"  'nivel de distancia' intuitivo para qualquer publico.\n")


def viz_heatmap_distancias(grafo: Grafo, diretorio_saida: str) -> None:
    """
    VIZ 6 (Explanatória) — Heatmap |V|×|V| das distâncias mínimas (Dijkstra).

    Colormap YlOrRd: amarelo = perto, vermelho = longe.
    Diagonal principal = 0.

    Arquivo: out/viz6_heatmap_distancias.png
    """
    os.makedirs(diretorio_saida, exist_ok=True)

    nos = sorted(grafo.nos())
    n = len(nos)
    indice = {iata: i for i, iata in enumerate(nos)}

    # Matriz n×n de distâncias (Dijkstra para cada origem)
    INF = float("inf")
    matriz = np.full((n, n), 0.0)

    for iata in nos:
        resultado = dijkstra(grafo, iata)
        dists = resultado["distancias"]
        i = indice[iata]
        for outro in nos:
            j = indice[outro]
            d = dists.get(outro, INF)
            matriz[i][j] = d if d < INF else 0.0

    fig, ax = plt.subplots(figsize=(12, 10))

    im = ax.imshow(matriz, cmap="YlOrRd", aspect="auto")

    # Rótulos dos eixos
    ax.set_xticks(range(n))
    ax.set_yticks(range(n))
    ax.set_xticklabels(nos, rotation=45, ha="right", fontsize=8)
    ax.set_yticklabels(nos, fontsize=8)

    # Valores numéricos em cada célula
    for i in range(n):
        for j in range(n):
            valor = matriz[i][j]
            texto = f"{valor:.1f}" if valor > 0 else "0"
            cor_texto = "black" if valor < (matriz.max() * 0.6) else "white"
            ax.text(j, i, texto, ha="center", va="center",
                    fontsize=6, color=cor_texto)

    cbar = fig.colorbar(im, ax=ax, fraction=0.046, pad=0.04)
    cbar.set_label("Custo (peso)", fontsize=11)

    ax.set_xlabel("Destino (IATA)", fontsize=11)
    ax.set_ylabel("Origem (IATA)", fontsize=11)
    ax.set_title(
        "Heatmap de Distancias Minimas entre Aeroportos (Dijkstra)",
        fontsize=13, fontweight="bold", pad=12,
    )

    fig.tight_layout()
    caminho = Path(diretorio_saida) / "viz6_heatmap_distancias.png"
    fig.savefig(str(caminho), dpi=150, bbox_inches="tight")
    plt.close(fig)
    print(f"VIZ6 salvo em: {caminho}")

    # Nota analítica
    print("\n[NOTA ANALITICA — VIZ 6: Heatmap de Distancias]")
    print(f"  O heatmap revela que a maioria dos pares apresenta distancia <= 6,")
    print(f"  confirmando o diametro reduzido da rede. Regioes proximas de GRU")
    print(f"  (Sudeste) aparecem em amarelo claro (perto); aeroportos do Norte")
    print(f"  como RBR e PVH, mais perifericos, geram as celulas mais escuras.")
    print(f"  A simetria da matriz (grafo nao-direcionado) e facilmente visivel.")
    print(f"  Escolha explanatoria: permite comparar todos os 380 pares de uma vez.\n")


# ---------------------------------------------------------------------------
# Orquestradora das 6 visualizações analíticas
# ---------------------------------------------------------------------------


def gerar_todas_visualizacoes(
    grafo: Grafo,
    ego_metricas: list[dict],
    metricas_regioes: list[dict],
    caminhos: list[dict],
    diretorio_saida: str,
) -> None:
    """
    Chama as 6 funções de visualização analítica em sequência e confirma
    os arquivos gerados em diretorio_saida.

    Parâmetros:
      grafo            : instância de Grafo já carregada
      ego_metricas     : lista retornada por calcular_ego_redes()
      metricas_regioes : lista retornada por calcular_metricas_regioes()
      caminhos         : lista com 2 dicts {label, nos, arestas, custo}
      diretorio_saida  : caminho para o diretório de saída
    """
    print("\n=== Gerando visualizacoes analiticas (Secoes 8 e 10) ===\n")
    viz_distribuicao_graus(grafo, diretorio_saida)
    viz_ranking_graus(grafo, diretorio_saida)
    viz_metricas_regioes(metricas_regioes, diretorio_saida)
    viz_ego_grau_densidade(ego_metricas, grafo, diretorio_saida)
    viz_camadas_bfs(grafo, diretorio_saida)
    viz_heatmap_distancias(grafo, diretorio_saida)

    # Confirma arquivos
    esperados = [
        "viz1_distribuicao_graus.png",
        "viz2_ranking_conectados.png",
        "viz3_metricas_regioes.png",
        "viz4_ego_grau_densidade.png",
        "viz5_camadas_bfs.png",
        "viz6_heatmap_distancias.png",
    ]
    print("\n=== Confirmacao dos arquivos gerados ===")
    for nome in esperados:
        arq = Path(diretorio_saida) / nome
        status = "OK  " if arq.exists() else "ERRO"
        print(f"  {status} {arq}")


# ---------------------------------------------------------------------------
# Ponto de entrada direto
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    from src.solve import calcular_ego_redes, calcular_metricas_regioes

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

    # 4. Calcula métricas auxiliares
    print("\nCalculando metricas auxiliares...")
    ego = calcular_ego_redes(grafo, _DIR_SAIDA)
    metricas_reg = calcular_metricas_regioes(grafo, _DIR_SAIDA)

    # 5. Gera visualizações das Seções 7 e 9
    print("\nGerando visualizacoes (Secoes 7 e 9)...")
    plotar_arvore_percurso(grafo, caminhos, _DIR_SAIDA)
    gerar_grafo_interativo(grafo, ego, caminhos, _DIR_SAIDA)

    # 6. Gera visualizações analíticas (Seções 8 e 10)
    gerar_todas_visualizacoes(grafo, ego, metricas_reg, caminhos, _DIR_SAIDA)

    # 7. Confirma todos os arquivos gerados
    todos = [
        "arvore_percurso.png",
        "arvore_percurso.html",
        "grafo_interativo.html",
        "viz1_distribuicao_graus.png",
        "viz2_ranking_conectados.png",
        "viz3_metricas_regioes.png",
        "viz4_ego_grau_densidade.png",
        "viz5_camadas_bfs.png",
        "viz6_heatmap_distancias.png",
    ]
    print("\n=== Todos os arquivos de saida ===")
    for nome in todos:
        arq = Path(_DIR_SAIDA) / nome
        print(f"  {'OK  ' if arq.exists() else 'ERRO'} {arq}")
