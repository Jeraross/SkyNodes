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

    # Linha divisória - contorno do Brasil
    fig.tight_layout()

    caminho_png = Path(diretorio_saida) / "arvore_percurso.png"
    fig.savefig(str(caminho_png), dpi=150, bbox_inches="tight")
    plt.close(fig)
    print(f"PNG salvo em: {caminho_png}")


# ---------------------------------------------------------------------------
# Visualização interativa HTML — gerada exclusivamente por gerar_grafo_interativo
# (a função _plotar_html foi removida; o único HTML gerado é grafo_interativo.html)
# ---------------------------------------------------------------------------


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

    Gera um arquivo de saída:
      - out/arvore_percurso.png  : mapa estático (matplotlib)

    A visualização interativa em HTML é gerada exclusivamente por
    gerar_grafo_interativo() em out/grafo_interativo.html.

    Parâmetros:
      grafo           : instância de Grafo já carregada
      caminhos        : lista com exatamente 2 dicionários de caminho
      diretorio_saida : caminho para o diretório de saída (ex: "out/")
    """
    os.makedirs(diretorio_saida, exist_ok=True)

    _plotar_png(grafo, caminhos, diretorio_saida)


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

    Estratégia:
      1. Monta o grafo base com pyvis (nós, arestas, physics)
      2. Salva em arquivo temporário com net.save_graph()
      3. Lê o HTML gerado como string
      4. Injeta CSS + JS customizado antes de </head> e </body>
      5. Salva resultado final em out/grafo_interativo.html

    Requisitos obrigatórios:
      - Tooltip por nó: IATA, Cidade, Região, Grau, Densidade Ego
      - Busca de aeroporto por IATA ou cidade
      - Caminhos obrigatórios REC→POA e MAO→GRU destacados
      - Cor dos nós por região, tamanho proporcional ao grau
      - Interface visual de alto nível (painel lateral, header, controles)
    """
    import json
    import tempfile

    os.makedirs(diretorio_saida, exist_ok=True)

    # ── Paleta de cores por região ──────────────────────────────────────────
    COR_REGIAO = {
        "Norte":        "#1B9E77",
        "Nordeste":     "#E6AB02",
        "Sudeste":      "#7570B3",
        "Sul":          "#E7298A",
        "Centro-Oeste": "#D95F02",
    }
    COR_HIGHLIGHT = {
        "Norte":        "#2DC99A",
        "Nordeste":     "#FFD000",
        "Sudeste":      "#9B96E0",
        "Sul":          "#FF4DAD",
        "Centro-Oeste": "#FF7A1A",
    }
    COR_PADRAO = "#8b949e"  # fallback para região desconhecida

    # Escurece uma cor hex multiplicando RGB por 0.7
    def _escurecer(hex_cor: str) -> str:
        hex_cor = hex_cor.lstrip("#")
        r, g, b = int(hex_cor[0:2], 16), int(hex_cor[2:4], 16), int(hex_cor[4:6], 16)
        return "#{:02x}{:02x}{:02x}".format(int(r * 0.7), int(g * 0.7), int(b * 0.7))

    # ── Cores das arestas por tipo de conexão ───────────────────────────────
    COR_TIPO = {
        "regional":       "#1f6feb",
        "hub":            "#d29922",
        "inter_regional": "#238636",
    }

    # ── Índices auxiliares ──────────────────────────────────────────────────
    ego_por_iata: dict[str, float] = {
        m["aeroporto"]: m["densidade_ego"] for m in ego_metricas
    }

    graus: dict[str, int] = {iata: grafo.grau(iata) for iata in grafo.nos()}
    grau_max = max(graus.values()) if graus else 1

    todas_arestas = grafo.arestas()

    # Nós e arestas dos caminhos obrigatórios
    nos_c1: set[str] = set(caminhos_destaque[0]["nos"])   # REC → POA
    nos_c2: set[str] = set(caminhos_destaque[1]["nos"])   # MAO → GRU
    arestas_c1: set[frozenset] = {frozenset(p) for p in caminhos_destaque[0]["arestas"]}
    arestas_c2: set[frozenset] = {frozenset(p) for p in caminhos_destaque[1]["arestas"]}

    custo_rec_poa = caminhos_destaque[0]["custo"]
    custo_mao_gru = caminhos_destaque[1]["custo"]

    # ── Métricas globais para o header ──────────────────────────────────────
    n_nos = len(graus)
    pares_unicos: set[frozenset] = set()
    for origem, destino, *_ in todas_arestas:
        pares_unicos.add(frozenset([origem, destino]))
    n_arestas = len(pares_unicos)
    densidade_global = (2 * n_arestas) / (n_nos * (n_nos - 1)) if n_nos > 1 else 0.0
    maior_grau_iata = max(graus, key=graus.get) if graus else "—"

    # ── Instância pyvis ─────────────────────────────────────────────────────
    net = Network(
        height="100vh",
        width="100%",
        bgcolor="#0d1117",
        font_color="#e6edf3",
        directed=False,
    )

    # Configurações de física e interação
    net.set_options('''
{
  "physics": {
    "enabled": true,
    "barnesHut": {
      "gravitationalConstant": -14000,
      "centralGravity": 0.6,
      "springLength": 180,
      "springConstant": 0.05,
      "damping": 0.18,
      "avoidOverlap": 0.4
    },
    "maxVelocity": 40,
    "minVelocity": 0.5,
    "solver": "barnesHut",
    "stabilization": {
      "enabled": true,
      "iterations": 250,
      "updateInterval": 25,
      "fit": true
    }
  },
  "interaction": {
    "hover": true,
    "tooltipDelay": 300,
    "hideEdgesOnDrag": false,
    "navigationButtons": false,
    "keyboard": {
      "enabled": true,
      "speed": {"x": 10, "y": 10, "zoom": 0.05}
    },
    "zoomView": true,
    "dragView": true
  },
  "nodes": {
    "shadow": {
      "enabled": true,
      "color": "rgba(0,0,0,0.5)",
      "size": 15,
      "x": 4,
      "y": 4
    },
    "font": {"size": 13, "bold": true}
  },
  "edges": {
    "shadow": {"enabled": false},
    "smooth": {"type": "curvedCW", "roundness": 0.15},
    "scaling": {"min": 1, "max": 6}
  }
}
''')

    # ── Adicionar nós (obrigatório antes das arestas no pyvis) ─────────────
    node_data_dict: dict[str, dict] = {}

    for iata in grafo.nos():
        info = grafo.info_no(iata)
        cidade = info.get("cidade", "")
        regiao = info.get("regiao", "")
        grau = graus[iata]
        densidade_ego = ego_por_iata.get(iata, 0.0)

        # Tamanho escalonado: 18 a 48 conforme grau
        tamanho = 18 + (grau / grau_max) * 30

        # Cor base da região (ou fallback)
        cor_base = COR_REGIAO.get(regiao, COR_PADRAO)
        cor_hl = COR_HIGHLIGHT.get(regiao, COR_PADRAO)
        cor_borda = _escurecer(cor_base)

        cor_no = {
            "background": cor_base,
            "border": cor_borda,
            "highlight": {"background": cor_hl, "border": "#ffffff"},
            "hover":     {"background": cor_hl, "border": "#ffffff"},
        }

        # Sem title nativo do vis.js — tooltip customizado é gerenciado pelo JS
        net.add_node(
            iata,
            label=iata,
            color=cor_no,
            size=tamanho,
            borderWidth=2,
            borderWidthSelected=5,
            shape="dot",
            font={"size": 12, "color": "#ffffff", "bold": True,
                  "strokeWidth": 3, "strokeColor": "#0d1117"},
            mass=1 + grau * 0.15,
        )

        # Guardar dados para o JS (inclui cor para o tooltip customizado)
        node_data_dict[iata] = {
            "cidade": cidade,
            "regiao": regiao,
            "grau": grau,
            "densidade_ego": densidade_ego,
            "cor": cor_base,
        }

    # ── Adicionar arestas e construir índice para tooltip JS ────────────────
    # edge_data_dict: chave "A|B" (ambas as direções) → metadados da aresta
    edge_data_dict: dict[str, dict] = {}
    pares_inseridos: set[frozenset] = set()

    # Caminhos obrigatórios inseridos primeiro (ficam sob os nós)
    for origem, destino, peso, tipo_conexao, _ in todas_arestas:
        par = frozenset([origem, destino])
        em_c1 = par in arestas_c1
        em_c2 = par in arestas_c2
        if not (em_c1 or em_c2):
            continue
        if par in pares_inseridos:
            continue
        pares_inseridos.add(par)

        cor_caminho = "#FF4136" if em_c1 else "#0074D9"
        net.add_edge(
            origem, destino,
            width=6,
            color={"color": cor_caminho, "highlight": "#ffffff",
                   "hover": "#ffffff", "opacity": 1.0},
            smooth={"type": "curvedCW", "roundness": 0.15},
        )
        # Registra nas duas direções para lookup por from/to
        meta = {"origem": origem, "destino": destino,
                "tipo": tipo_conexao, "peso": round(peso, 2)}
        edge_data_dict[f"{origem}|{destino}"] = meta
        edge_data_dict[f"{destino}|{origem}"] = meta

    # Demais arestas por tipo de conexão
    for origem, destino, peso, tipo_conexao, _ in todas_arestas:
        par = frozenset([origem, destino])
        if par in pares_inseridos:
            continue
        pares_inseridos.add(par)

        cor_tipo = COR_TIPO.get(tipo_conexao, "#8b949e")
        largura = max(1.0, 5.0 - peso * 0.8)
        net.add_edge(
            origem, destino,
            width=largura,
            color={"color": cor_tipo, "highlight": "#ffffff",
                   "hover": "#ffffff", "opacity": 0.75},
            smooth={"type": "curvedCW", "roundness": 0.15},
        )
        meta = {"origem": origem, "destino": destino,
                "tipo": tipo_conexao, "peso": round(peso, 2)}
        edge_data_dict[f"{origem}|{destino}"] = meta
        edge_data_dict[f"{destino}|{origem}"] = meta

    # ── Salvar HTML base em arquivo temporário ───────────────────────────────
    tmp_fd, tmp_path = tempfile.mkstemp(suffix=".html")
    os.close(tmp_fd)

    net.save_graph(tmp_path)
    html = open(tmp_path, encoding="utf-8").read()
    os.unlink(tmp_path)  # remove o temporário

    # ── Tornar o HTML auto-contido: embutir vis.js localmente ────────────────
    # Localizar vis-network.min.js na instalação do pyvis
    import importlib.util
    pyvis_spec = importlib.util.find_spec("pyvis")
    if pyvis_spec and pyvis_spec.origin:
        pyvis_dir = Path(pyvis_spec.origin).parent
        vis_js_path = pyvis_dir / "lib" / "vis-9.1.2" / "vis-network.min.js"
        vis_css_path = pyvis_dir / "lib" / "vis-9.1.2" / "vis-network.css"
        utils_js_path = pyvis_dir / "lib" / "bindings" / "utils.js"

        import re

        if vis_js_path.exists():
            vis_js_content = vis_js_path.read_text(encoding="utf-8")
            # Usa lambda para evitar interpretação de barras no conteúdo inline
            html = re.sub(
                r'<script[^>]+vis-network[^>]*></script>',
                lambda m: f'<script>\n{vis_js_content}\n</script>',
                html,
            )

        if vis_css_path.exists():
            vis_css_content = vis_css_path.read_text(encoding="utf-8")
            html = re.sub(
                r'<link[^>]+vis-network[^>]*/?>',
                lambda m: f'<style>\n{vis_css_content}\n</style>',
                html,
            )

        if utils_js_path.exists():
            utils_js_content = utils_js_path.read_text(encoding="utf-8")
            html = re.sub(
                r'<script[^>]+utils\.js[^>]*></script>',
                lambda m: f'<script>\n{utils_js_content}\n</script>',
                html,
            )

    # Remove bootstrap CDN (não utilizado após a injeção do CSS customizado)
    import re
    html = re.sub(r'<link[^>]+bootstrap[^>]*/?\s*>', '', html)
    html = re.sub(r'<script[^>]+bootstrap[^>]*></script>', '', html)

    # ── CSS customizado ──────────────────────────────────────────────────────
    CUSTOM_CSS = """
<style>
  /* Reset e base */
  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: #0d1117;
    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
    color: #e6edf3;
    overflow: hidden;
  }

  /* Canvas do grafo ocupa tela toda */
  #mynetwork {
    position: fixed;
    top: 0; left: 0;
    width: 100vw;
    height: 100vh;
    background: radial-gradient(ellipse at center,
                  #161b22 0%, #0d1117 70%);
    border: none !important;
  }

  /* ── PAINEL SUPERIOR (header com título) ── */
  #header-panel {
    position: fixed;
    top: 0; left: 0; right: 0;
    height: 52px;
    background: rgba(13,17,23,0.92);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid #21262d;
    display: flex;
    align-items: center;
    padding: 0 20px;
    gap: 16px;
    z-index: 1000;
  }
  #header-panel h1 {
    font-size: 15px;
    font-weight: 600;
    color: #e6edf3;
    letter-spacing: 0.3px;
  }
  #header-panel .badge {
    background: #21262d;
    border: 1px solid #30363d;
    border-radius: 20px;
    padding: 2px 10px;
    font-size: 11px;
    color: #8b949e;
  }

  /* ── PAINEL LATERAL ESQUERDO (legenda + busca) ── */
  #side-panel {
    position: fixed;
    top: 60px;
    left: 16px;
    width: 230px;
    background: rgba(22,27,34,0.95);
    backdrop-filter: blur(10px);
    border: 1px solid #30363d;
    border-radius: 12px;
    padding: 14px;
    z-index: 999;
    transition: transform 0.3s ease;
  }
  #side-panel.collapsed {
    transform: translateX(-248px);
  }

  .panel-section {
    margin-bottom: 16px;
  }
  .panel-title {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    color: #8b949e;
    margin-bottom: 8px;
    padding-bottom: 4px;
    border-bottom: 1px solid #21262d;
  }

  /* Caixa de busca */
  #search-box {
    width: 100%;
    padding: 7px 10px;
    background: #0d1117;
    border: 1px solid #30363d;
    border-radius: 6px;
    color: #e6edf3;
    font-size: 12px;
    outline: none;
    transition: border-color 0.2s;
  }
  #search-box:focus { border-color: #388bfd; }
  #search-box::placeholder { color: #484f58; }

  /* Itens de legenda */
  .legend-item {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 5px;
    font-size: 12px;
    color: #c9d1d9;
    cursor: pointer;
    padding: 3px 5px;
    border-radius: 4px;
    transition: background 0.15s;
  }
  .legend-item:hover { background: #21262d; }
  .legend-dot {
    width: 12px; height: 12px;
    border-radius: 50%;
    flex-shrink: 0;
    border: 2px solid rgba(255,255,255,0.2);
  }
  .legend-line {
    width: 22px; height: 3px;
    border-radius: 2px;
    flex-shrink: 0;
  }

  /* Caminhos destacados */
  .path-item {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;
    font-size: 12px;
    color: #c9d1d9;
    padding: 5px 8px;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.15s;
  }
  .path-item:hover { background: #21262d; }
  .path-badge {
    width: 28px; height: 4px;
    border-radius: 2px;
    flex-shrink: 0;
  }

  /* Botão colapsar painel */
  #toggle-panel {
    position: fixed;
    top: 68px;
    left: 254px;
    width: 22px; height: 22px;
    background: #21262d;
    border: 1px solid #30363d;
    border-radius: 50%;
    cursor: pointer;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    color: #8b949e;
    transition: left 0.3s ease, background 0.2s;
  }
  #toggle-panel:hover { background: #30363d; }
  #toggle-panel.collapsed { left: 6px; }

  /* ── PAINEL INFERIOR (info do nó selecionado) ── */
  #info-panel {
    position: fixed;
    bottom: 16px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(22,27,34,0.97);
    backdrop-filter: blur(12px);
    border: 1px solid #30363d;
    border-radius: 12px;
    padding: 12px 20px;
    z-index: 999;
    font-size: 13px;
    color: #8b949e;
    text-align: center;
    min-width: 320px;
    transition: all 0.25s ease;
    pointer-events: none;
  }
  #info-panel.active {
    border-color: #388bfd;
    color: #e6edf3;
    pointer-events: auto;
  }

  /* ── BOTÕES DE CONTROLE (canto direito) ── */
  #controls {
    position: fixed;
    top: 60px;
    right: 16px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    z-index: 999;
  }
  .ctrl-btn {
    width: 36px; height: 36px;
    background: rgba(22,27,34,0.95);
    border: 1px solid #30363d;
    border-radius: 8px;
    color: #8b949e;
    font-size: 15px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s, color 0.2s;
    backdrop-filter: blur(8px);
  }
  .ctrl-btn:hover { background: #21262d; color: #e6edf3; }
  .ctrl-btn.active { background: #1f6feb; color: white;
                     border-color: #388bfd; }

  /* ── BARRA DE ESTATÍSTICAS ── */
  #stats-bar {
    position: fixed;
    top: 60px;
    right: 60px;
    background: rgba(22,27,34,0.92);
    backdrop-filter: blur(10px);
    border: 1px solid #30363d;
    border-radius: 10px;
    padding: 8px 16px;
    display: flex;
    gap: 20px;
    z-index: 998;
    font-size: 11px;
  }
  .stat-item { text-align: center; }
  .stat-value {
    font-size: 18px;
    font-weight: 700;
    color: #e6edf3;
    display: block;
  }
  .stat-label { color: #8b949e; }

  /* ── TOOLTIP CUSTOMIZADO ── */
  #node-tooltip {
    position: fixed;
    display: none;
    background: #161b22;
    border: 1px solid #30363d;
    border-radius: 8px;
    padding: 10px 14px;
    font-family: 'Segoe UI', sans-serif;
    font-size: 13px;
    color: #e6edf3;
    min-width: 180px;
    line-height: 1.8;
    pointer-events: none;
    z-index: 2000;
    box-shadow: 0 8px 24px rgba(0,0,0,0.5);
  }
  #node-tooltip .tt-iata {
    font-size: 15px;
    font-weight: 700;
    display: block;
    margin-bottom: 2px;
  }
  #node-tooltip .tt-label { color: #8b949e; }
  #node-tooltip .tt-value { font-weight: 600; }

  /* ── PAINEL DE DEMONSTRAÇÃO DE CAMINHO ── */
  #path-demo {
    display: none;
    position: fixed;
    top: 60px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(22,27,34,0.97);
    backdrop-filter: blur(12px);
    border: 1px solid #30363d;
    border-radius: 12px;
    padding: 14px 20px;
    z-index: 1001;
    min-width: 400px;
    max-width: 680px;
  }
  #path-demo.visible { display: block; }
  #path-demo .demo-title {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    color: #8b949e;
    margin-bottom: 10px;
  }
  /* Sequência de nós do caminho */
  #path-steps {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 4px;
    margin-bottom: 12px;
  }
  .step-node {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px; height: 40px;
    border-radius: 50%;
    font-size: 11px;
    font-weight: 700;
    border: 2px solid transparent;
    cursor: default;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .step-node.active {
    transform: scale(1.25);
    box-shadow: 0 0 14px 4px rgba(255,255,255,0.25);
  }
  .step-arrow {
    font-size: 11px;
    color: #484f58;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0px;
    padding: 0 2px;
  }
  .step-cost {
    font-size: 9px;
    color: #8b949e;
    white-space: nowrap;
  }
  /* Barra de progresso */
  #path-progress-wrap {
    height: 4px;
    background: #21262d;
    border-radius: 2px;
    margin-bottom: 10px;
    overflow: hidden;
  }
  #path-progress-bar {
    height: 100%;
    border-radius: 2px;
    width: 0%;
    transition: width 0.4s ease;
  }
  /* Controles do player */
  #path-controls {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .demo-btn {
    padding: 4px 12px;
    border-radius: 6px;
    border: 1px solid #30363d;
    background: #21262d;
    color: #e6edf3;
    font-size: 12px;
    cursor: pointer;
    transition: background 0.15s;
  }
  .demo-btn:hover { background: #30363d; }
  .demo-btn.primary {
    background: #1f6feb;
    border-color: #388bfd;
  }
  .demo-btn.primary:hover { background: #388bfd; }
  #path-step-label {
    font-size: 12px;
    color: #8b949e;
    margin-left: auto;
  }
  #path-total-cost {
    font-size: 12px;
    color: #e6edf3;
    font-weight: 600;
  }

  /* ── GLOSSÁRIO (canto inferior direito) ── */
  #glossary {
    position: fixed;
    bottom: 16px;
    right: 16px;
    width: 230px;
    background: rgba(22,27,34,0.95);
    backdrop-filter: blur(10px);
    border: 1px solid #30363d;
    border-radius: 12px;
    padding: 12px 14px;
    z-index: 999;
    font-size: 12px;
  }
  #glossary .gloss-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }
  #glossary .gloss-header .panel-title { margin-bottom: 0; }
  #gloss-toggle {
    width: 18px; height: 18px;
    border-radius: 50%;
    background: #21262d;
    border: 1px solid #30363d;
    color: #8b949e;
    font-size: 11px;
    line-height: 1;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: background 0.15s;
  }
  #gloss-toggle:hover { background: #30363d; color: #e6edf3; }
  #gloss-body { overflow: hidden; transition: max-height 0.25s ease; max-height: 400px; }
  #gloss-body.collapsed { max-height: 0; }
  .gloss-row {
    display: grid;
    grid-template-columns: 80px 1fr;
    gap: 4px 8px;
    margin-bottom: 5px;
    line-height: 1.4;
  }
  .gloss-term {
    color: #388bfd;
    font-weight: 600;
    font-size: 11px;
    padding-top: 1px;
  }
  .gloss-def { color: #8b949e; font-size: 11px; }

  /* Scrollbar invisível */
  ::-webkit-scrollbar { width: 0; }
</style>
"""

    # ── HTML dos painéis ─────────────────────────────────────────────────────
    CUSTOM_HTML = f"""
<!-- Cabeçalho superior -->
<div id="header-panel">
  <h1>Rede Aeroportuária do Brasil Games!</h1>
  <span class="badge">{n_nos} aeroportos</span>
  <span class="badge">{n_arestas} conexões</span>
  <span class="badge">Densidade: {densidade_global:.3f}</span>
</div>

<!-- Botão colapsar painel -->
<div id="toggle-panel" onclick="togglePanel()" title="Ocultar/Mostrar painel">&#8249;</div>

<!-- Painel lateral esquerdo -->
<div id="side-panel">

  <!-- Busca -->
  <div class="panel-section">
    <div class="panel-title">Buscar Aeroporto</div>
    <input id="search-box" type="text"
           placeholder="Digite o IATA ou cidade..."
           oninput="searchNode(this.value)" />
  </div>

  <!-- Legenda regiões -->
  <div class="panel-section">
    <div class="panel-title">Regiões</div>
    <div class="legend-item" onclick="filterRegion('Norte')">
      <div class="legend-dot" style="background:#1B9E77"></div>
      Norte
    </div>
    <div class="legend-item" onclick="filterRegion('Nordeste')">
      <div class="legend-dot" style="background:#E6AB02"></div>
      Nordeste
    </div>
    <div class="legend-item" onclick="filterRegion('Sudeste')">
      <div class="legend-dot" style="background:#7570B3"></div>
      Sudeste
    </div>
    <div class="legend-item" onclick="filterRegion('Sul')">
      <div class="legend-dot" style="background:#E7298A"></div>
      Sul
    </div>
    <div class="legend-item" onclick="filterRegion('Centro-Oeste')">
      <div class="legend-dot" style="background:#D95F02"></div>
      Centro-Oeste
    </div>
    <div class="legend-item" onclick="filterRegion(null)"
         style="color:#484f58;margin-top:4px;font-size:11px">
      &#8634; Limpar filtro
    </div>
  </div>

  <!-- Legenda tipos de conexão -->
  <div class="panel-section">
    <div class="panel-title">Tipo de Conexão</div>
    <div class="legend-item">
      <div class="legend-line" style="background:#1f6feb"></div>
      Regional
    </div>
    <div class="legend-item">
      <div class="legend-line" style="background:#d29922"></div>
      Hub nacional
    </div>
    <div class="legend-item">
      <div class="legend-line" style="background:#238636"></div>
      Inter-regional
    </div>
  </div>

  <!-- Caminhos obrigatórios -->
  <div class="panel-section">
    <div class="panel-title">Caminhos Mínimos</div>
    <div class="path-item" onclick="showPath('REC_POA')">
      <div class="path-badge" style="background:#FF4136"></div>
      REC &#8594; POA &nbsp;<span style="color:#484f58;font-size:10px">custo {custo_rec_poa:.1f}</span>
    </div>
    <div class="path-item" onclick="showPath('MAO_GRU')">
      <div class="path-badge" style="background:#0074D9"></div>
      MAO &#8594; GRU &nbsp;<span style="color:#484f58;font-size:10px">custo {custo_mao_gru:.1f}</span>
    </div>
    <div class="legend-item" onclick="resetHighlight()"
         style="color:#484f58;font-size:11px;margin-top:4px">
      &#8634; Restaurar grafo
    </div>
  </div>

</div>

<!-- Painel de demonstração de caminho (aparece ao clicar em um caminho) -->
<div id="path-demo">
  <div class="demo-title" id="path-demo-title">Caminho mínimo</div>
  <div id="path-steps"></div>
  <div id="path-progress-wrap">
    <div id="path-progress-bar"></div>
  </div>
  <div id="path-controls">
    <button class="demo-btn" onclick="pathStepBack()">&#9664; Anterior</button>
    <button class="demo-btn primary" id="play-btn" onclick="togglePlay()">&#9654; Reproduzir</button>
    <button class="demo-btn" onclick="pathStepNext()">Próximo &#9654;</button>
    <span id="path-step-label">passo 0 / 0</span>
    <span id="path-total-cost"></span>
  </div>
</div>

<!-- Glossário — canto inferior direito -->
<div id="glossary">
  <div class="gloss-header">
    <div class="panel-title">Glossário</div>
    <div id="gloss-toggle" onclick="toggleGlossary()" title="Ocultar/Mostrar glossário">&#8722;</div>
  </div>
  <div id="gloss-body">
    <div class="gloss-row">
      <span class="gloss-term">IATA</span>
      <span class="gloss-def">Código de 3 letras que identifica cada aeroporto (ex: GRU = Guarulhos)</span>
    </div>
    <div class="gloss-row">
      <span class="gloss-term">Grau</span>
      <span class="gloss-def">Número de conexões diretas do aeroporto</span>
    </div>
    <div class="gloss-row">
      <span class="gloss-term">Ego / Ego-rede</span>
      <span class="gloss-def">Sub-grafo formado pelo nó e todos os seus vizinhos diretos</span>
    </div>
    <div class="gloss-row">
      <span class="gloss-term">Dens. Ego</span>
      <span class="gloss-def">Fração das conexões possíveis entre os vizinhos que de fato existem (0–1)</span>
    </div>
    <div class="gloss-row">
      <span class="gloss-term">Peso</span>
      <span class="gloss-def">Custo relativo da rota; arestas mais grossas indicam menor peso</span>
    </div>
    <div class="gloss-row">
      <span class="gloss-term">Tamanho</span>
      <span class="gloss-def">Proporcional ao grau — hubs aparecem maiores</span>
    </div>
    <div class="gloss-row">
      <span class="gloss-term">Dijkstra</span>
      <span class="gloss-def">Algoritmo usado para encontrar o caminho de menor custo entre dois aeroportos</span>
    </div>
  </div>
</div>

<!-- Barra de estatísticas -->
<div id="stats-bar">
  <div class="stat-item">
    <span class="stat-value">{n_nos}</span>
    <span class="stat-label">Aeroportos</span>
  </div>
  <div class="stat-item">
    <span class="stat-value">{n_arestas}</span>
    <span class="stat-label">Conexões</span>
  </div>
  <div class="stat-item">
    <span class="stat-value">{densidade_global:.3f}</span>
    <span class="stat-label">Densidade</span>
  </div>
  <div class="stat-item">
    <span class="stat-value">{maior_grau_iata}</span>
    <span class="stat-label">Hub principal</span>
  </div>
</div>

<!-- Controles direita -->
<div id="controls">
  <div class="ctrl-btn" onclick="network.fit()" title="Centralizar">&#8853;</div>
  <div class="ctrl-btn" onclick="togglePhysics()" id="physics-btn"
       title="Liga/Desliga física">&#9889;</div>
  <div class="ctrl-btn" onclick="toggleDot()" id="dot-btn"
       title="Modo compacto (ocultar rótulos)">&#11044;</div>
</div>

<!-- Painel de info do nó selecionado -->
<div id="info-panel">
  Clique em um aeroporto para ver detalhes
</div>

<!-- Tooltip flutuante customizado (posicionado pelo JS no hoverNode) -->
<div id="node-tooltip"></div>
"""

    # ── JavaScript customizado (placeholders serão substituídos) ─────────────
    CUSTOM_JS_TEMPLATE = """
<script>
// ── Dados dos nós injetados pelo Python ────────────────────────────────────
const NODE_DATA = NODE_DATA_JSON_PLACEHOLDER;

// IATAs dos caminhos obrigatórios
const PATH_REC_POA = PATH_REC_POA_JSON_PLACEHOLDER;
const PATH_MAO_GRU = PATH_MAO_GRU_JSON_PLACEHOLDER;

// Custos por trecho (peso de cada aresta percorrida)
const PATH_REC_POA_COSTS = PATH_REC_POA_COSTS_PLACEHOLDER;
const PATH_MAO_GRU_COSTS = PATH_MAO_GRU_COSTS_PLACEHOLDER;

// Metadados das arestas: chave "FROM|TO" → {origem, destino, tipo, peso}
const EDGE_DATA = EDGE_DATA_JSON_PLACEHOLDER;

// ── Referência à instância vis.Network exposta pelo pyvis ─────────────────
// Física começa ligada; botão inicia com classe "active"
let physicsOn = true;
let activeFilter = null;
document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('physics-btn').classList.add('active');
});

// ── Busca de aeroporto por IATA ou cidade ─────────────────────────────────
function searchNode(query) {
  if (!query) { resetHighlight(); return; }
  query = query.toUpperCase();
  const allNodes = network.body.data.nodes.getIds();
  const matched = allNodes.filter(id =>
    id.includes(query) ||
    (NODE_DATA[id] && NODE_DATA[id].cidade.toUpperCase().includes(query))
  );
  if (matched.length === 0) return;

  // Focar no primeiro resultado encontrado
  network.focus(matched[0], {
    scale: 1.8,
    animation: { duration: 600, easingFunction: 'easeInOutQuad' }
  });
  network.selectNodes(matched);
}

// ── Filtrar nós por região ─────────────────────────────────────────────────
function filterRegion(regiao) {
  activeFilter = regiao;
  const allNodes = network.body.data.nodes.get();
  const updates = allNodes.map(n => {
    const match = !regiao || NODE_DATA[n.id]?.regiao === regiao;
    return {
      id: n.id,
      opacity: match ? 1 : 0.08,
      font: { color: match ? '#ffffff' : 'transparent' }
    };
  });
  network.body.data.nodes.update(updates);
}

// ── Estado do player de caminho ────────────────────────────────────────────
let activePathKey  = null;   // 'REC_POA' | 'MAO_GRU'
let activePathStep = 0;      // índice da aresta atual (0 = nenhuma revelada)
let playInterval   = null;   // referência ao setInterval do autoplay

// Abre o painel de demo e posiciona o grafo no caminho
function showPath(pathKey) {
  // Se mesmo caminho clicado duas vezes, fecha o painel
  if (activePathKey === pathKey) {
    closePath();
    return;
  }
  // Desliga a física antes de iniciar a animação de caminho
  if (physicsOn) togglePhysics();
  stopPlay();
  activePathKey  = pathKey;
  activePathStep = 0;

  const path  = pathKey === 'REC_POA' ? PATH_REC_POA  : PATH_MAO_GRU;
  const costs = pathKey === 'REC_POA' ? PATH_REC_POA_COSTS : PATH_MAO_GRU_COSTS;
  const cor   = pathKey === 'REC_POA' ? '#FF4136' : '#0074D9';
  const label = pathKey === 'REC_POA'
    ? 'REC \u2192 POA &nbsp;<span style="color:#484f58;font-size:10px">Dijkstra</span>'
    : 'MAO \u2192 GRU &nbsp;<span style="color:#484f58;font-size:10px">Dijkstra</span>';

  // ── Constrói os "degraus" do caminho ──────────────────────────────────
  const stepsEl = document.getElementById('path-steps');
  stepsEl.innerHTML = '';

  path.forEach((iata, i) => {
    // Círculo do nó
    const nodeDiv = document.createElement('div');
    nodeDiv.className = 'step-node';
    nodeDiv.id = `step-node-${i}`;
    nodeDiv.textContent = iata;
    const nodeColor = NODE_DATA[iata]?.cor ?? cor;
    nodeDiv.style.background = nodeColor + '33';   // fundo tênue
    nodeDiv.style.borderColor = nodeColor;
    nodeDiv.style.color = '#e6edf3';
    stepsEl.appendChild(nodeDiv);

    // Seta + custo entre nós consecutivos
    if (i < path.length - 1) {
      const arrowDiv = document.createElement('div');
      arrowDiv.className = 'step-arrow';
      arrowDiv.id = `step-arrow-${i}`;
      arrowDiv.innerHTML =
        `<span style="color:#484f58;font-size:14px">&#8594;</span>` +
        `<span class="step-cost">${costs[i].toFixed(1)}</span>`;
      arrowDiv.style.opacity = '0.3';
      stepsEl.appendChild(arrowDiv);
    }
  });

  // Barra de progresso
  document.getElementById('path-progress-bar').style.background = cor;
  document.getElementById('path-progress-bar').style.width = '0%';

  // Custo total
  const total = costs.reduce((a, b) => a + b, 0);
  document.getElementById('path-total-cost').textContent =
    `Custo total: ${total.toFixed(1)}`;
  document.getElementById('path-demo-title').innerHTML = label;

  // Exibe painel e esmaece o grafo para o contexto do caminho
  document.getElementById('path-demo').classList.add('visible');
  _applyPathVisual(path, cor, -1);  // -1 = nenhuma aresta revelada ainda

  network.fit({
    nodes: path,
    animation: { duration: 700, easingFunction: 'easeInOutQuad' }
  });

  updateStepLabel();
}

// Aplica visual no grafo: revela arestas até o índice `upTo`
function _applyPathVisual(path, cor, upTo) {
  const pathSet = new Set(path);

  // Nós: revela progressivamente
  network.body.data.nodes.update(
    network.body.data.nodes.get().map(n => {
      const idx = path.indexOf(n.id);
      const revealed = idx >= 0 && idx <= upTo + 1;
      return {
        id: n.id,
        opacity: revealed ? 1.0 : (pathSet.has(n.id) ? 0.35 : 0.08),
        font: { color: (revealed || (pathSet.has(n.id) && upTo < 0)) ? '#ffffff' : 'transparent' },
      };
    })
  );

  // Arestas: revela apenas as já "percorridas"
  network.body.data.edges.update(
    network.body.data.edges.get().map(e => {
      let revealed = false;
      for (let i = 0; i <= upTo; i++) {
        if ((e.from === path[i] && e.to === path[i+1]) ||
            (e.to === path[i] && e.from === path[i+1])) {
          revealed = true; break;
        }
      }
      const onPath = pathSet.has(e.from) && pathSet.has(e.to);
      return {
        id: e.id,
        color: revealed
          ? { color: cor, opacity: 1.0 }
          : onPath
            ? { color: cor, opacity: 0.2 }
            : { color: '#21262d', opacity: 0.04 },
        width: revealed ? 7 : (onPath ? 1.5 : 0.5),
      };
    })
  );
}

// Avança um passo
function pathStepNext() {
  if (!activePathKey) return;
  const path = activePathKey === 'REC_POA' ? PATH_REC_POA : PATH_MAO_GRU;
  const cor  = activePathKey === 'REC_POA' ? '#FF4136' : '#0074D9';
  if (activePathStep >= path.length - 1) { stopPlay(); return; }

  activePathStep++;
  _applyPathVisual(path, cor, activePathStep - 1);
  _updateStepDots(path, activePathStep - 1);
  updateStepLabel();

  // Foca no nó recém-revelado
  network.focus(path[activePathStep], {
    scale: 1.6,
    animation: { duration: 400, easingFunction: 'easeInOutQuad' },
  });
}

// Recua um passo
function pathStepBack() {
  if (!activePathKey || activePathStep === 0) return;
  const path = activePathKey === 'REC_POA' ? PATH_REC_POA : PATH_MAO_GRU;
  const cor  = activePathKey === 'REC_POA' ? '#FF4136' : '#0074D9';
  stopPlay();
  activePathStep--;
  _applyPathVisual(path, cor, activePathStep - 1);
  _updateStepDots(path, activePathStep - 1);
  updateStepLabel();
}

// Atualiza destaques visuais dos círculos e setas no painel
function _updateStepDots(path, upTo) {
  path.forEach((_, i) => {
    const node = document.getElementById(`step-node-${i}`);
    if (node) node.classList.toggle('active', i === upTo + 1);
    if (i < path.length - 1) {
      const arrow = document.getElementById(`step-arrow-${i}`);
      if (arrow) arrow.style.opacity = i <= upTo ? '1' : '0.3';
    }
  });
  // Progresso
  const pct = path.length <= 1 ? 100 : ((upTo + 1) / (path.length - 1)) * 100;
  document.getElementById('path-progress-bar').style.width = pct + '%';
}

function updateStepLabel() {
  if (!activePathKey) return;
  const path = activePathKey === 'REC_POA' ? PATH_REC_POA : PATH_MAO_GRU;
  document.getElementById('path-step-label').textContent =
    `passo ${activePathStep} / ${path.length - 1}`;
}

// Autoplay
function togglePlay() {
  if (playInterval) { stopPlay(); return; }
  document.getElementById('play-btn').textContent = '\u23f8 Pausar';
  document.getElementById('play-btn').classList.add('primary');
  playInterval = setInterval(() => {
    const path = activePathKey === 'REC_POA' ? PATH_REC_POA : PATH_MAO_GRU;
    if (activePathStep >= path.length - 1) { stopPlay(); return; }
    pathStepNext();
  }, 900);
}

function stopPlay() {
  if (playInterval) { clearInterval(playInterval); playInterval = null; }
  const btn = document.getElementById('play-btn');
  if (btn) { btn.textContent = '\u25b6 Reproduzir'; btn.classList.add('primary'); }
}

// Fecha o painel e restaura o grafo
function closePath() {
  stopPlay();
  activePathKey  = null;
  activePathStep = 0;
  document.getElementById('path-demo').classList.remove('visible');
  // Restaura opacidade de todos os nós e arestas
  network.body.data.nodes.update(
    network.body.data.nodes.get().map(n => ({ id: n.id, opacity: 1.0,
      font: { color: dotMode ? 'transparent' : '#ffffff' } }))
  );
  if (Object.keys(edgeColorCache).length > 0) {
    network.body.data.edges.update(
      network.body.data.edges.get().map(e => ({
        id: e.id,
        color: edgeColorCache[e.id]?.color ?? {},
        width: edgeColorCache[e.id]?.width ?? 1,
      }))
    );
  }
  network.fit({ animation: { duration: 500, easingFunction: 'easeInOutQuad' } });
}

// Restaurar estado visual original (recarrega a página)
function resetHighlight() {
  stopPlay();
  location.reload();
}

// ── Colapsar / expandir painel lateral ───────────────────────────────────
function togglePanel() {
  const panel  = document.getElementById('side-panel');
  const toggle = document.getElementById('toggle-panel');
  panel.classList.toggle('collapsed');
  toggle.classList.toggle('collapsed');
  toggle.textContent = panel.classList.contains('collapsed') ? '\u203a' : '\u2039';
}

// ── Ocultar / mostrar glossário ───────────────────────────────────────────
function toggleGlossary() {
  const body   = document.getElementById('gloss-body');
  const btn    = document.getElementById('gloss-toggle');
  const hidden = body.classList.toggle('collapsed');
  btn.textContent = hidden ? '\u002b' : '\u2212';  // + ou −
}

// ── Ligar / desligar simulação física (único ponto de controle) ──────────
function togglePhysics() {
  physicsOn = !physicsOn;
  network.setOptions({ physics: { enabled: physicsOn } });
  document.getElementById('physics-btn').classList.toggle('active', physicsOn);

  if (physicsOn) {
    // Ao ligar a física: limpa hover ativo
    nodeHover = false;
    edgeHovId = null;
    hideTooltip();
    _restoreAll();
    document.getElementById('mynetwork').style.cursor = 'default';
  }
}

// ── Exibir detalhes do nó selecionado no painel inferior ─────────────────
network.on('click', function(params) {
  const panel = document.getElementById('info-panel');
  if (params.nodes.length === 0) {
    panel.classList.remove('active');
    panel.innerHTML = 'Clique em um aeroporto para ver detalhes';
    return;
  }
  const id   = params.nodes[0];
  const data = NODE_DATA[id];
  if (!data) return;
  panel.classList.add('active');
  panel.innerHTML =
    `<b style="font-size:15px">${id}</b> \u2014 ${data.cidade}
     &nbsp;|&nbsp; Regi\u00e3o: <b>${data.regiao}</b>
     &nbsp;|&nbsp; Grau: <b>${data.grau}</b>
     &nbsp;|&nbsp; Densidade Ego: <b>${data.densidade_ego.toFixed(3)}</b>`;
});

// ── Modo compacto: oculta rótulos e reduz nós ~55% (hitbox menor, mas
// suficiente para hover/clique preciso sem confundir com o background) ─────
let dotMode = false;
const grauMax = Math.max(...Object.values(NODE_DATA).map(d => d.grau));

function toggleDot() {
  dotMode = !dotMode;
  network.body.data.nodes.update(
    network.body.data.nodes.get().map(n => {
      const grau    = NODE_DATA[n.id]?.grau ?? 1;
      const sizeFull = 18 + (grau / grauMax) * 30;        // tamanho normal
      const sizeCompact = Math.max(8, sizeFull * 0.55);   // ~55%, mínimo 8px
      if (dotMode) {
        return {
          id: n.id,
          size: sizeCompact,
          font: { size: 0, color: 'transparent' },
        };
      } else {
        return {
          id: n.id,
          size: sizeFull,
          font: { size: 12, color: '#ffffff', bold: true,
                  strokeWidth: 3, strokeColor: '#0d1117' },
        };
      }
    })
  );
  document.getElementById('dot-btn').classList.toggle('active', dotMode);
}

// ── Cache das cores originais das arestas ────────────────────────────────
// Usa JSON.parse/stringify para garantir deep-clone: sem isso, a referência
// ao objeto color pode ser mutada internamente pelo vis.js durante updates.
let edgeColorCache = {};  // id → { color: {...}, width: number }

function buildEdgeCache() {
  network.body.data.edges.get().forEach(e => {
    edgeColorCache[e.id] = {
      color: JSON.parse(JSON.stringify(e.color ?? {})),
      width: e.width ?? 1,
    };
  });
}

// Garante o cache na primeira oportunidade após a renderização inicial
setTimeout(buildEdgeCache, 800);

// ═══════════════════════════════════════════════════════════════════════════
// SISTEMA DE HOVER — nós e arestas
//
// Nós   : via eventos vis.js hoverNode / blurNode  (confiáveis para nós)
// Arestas: via mousemove + network.getEdgeAt()    (eventos hoverEdge/blurEdge
//           do vis.js são não-confiáveis com física ativa e foram removidos)
// ═══════════════════════════════════════════════════════════════════════════

const tooltip  = document.getElementById('node-tooltip');
let mouseX     = 0, mouseY = 0;
let nodeHover  = false;   // true enquanto um nó está sob o cursor
let edgeHovId  = null;    // ID da aresta atualmente destacada (null = nenhuma)

// ── Posicionamento do tooltip junto ao cursor ─────────────────────────────
function positionTooltip() {
  const PAD = 18;
  const tw  = tooltip.offsetWidth  || 200;
  const th  = tooltip.offsetHeight || 100;
  let x = mouseX + PAD;
  let y = mouseY + PAD;
  if (x + tw > window.innerWidth  - 8) x = mouseX - tw - PAD;
  if (y + th > window.innerHeight - 8) y = mouseY - th - PAD;
  tooltip.style.left = x + 'px';
  tooltip.style.top  = y + 'px';
}

function showTooltip(html) {
  tooltip.innerHTML = html;
  tooltip.style.display = 'block';
  positionTooltip();
}

function hideTooltip() {
  tooltip.style.display = 'none';
}

// ── Restauração completa de nós e arestas ─────────────────────────────────
function _restoreAll() {
  network.body.data.nodes.update(
    network.body.data.nodes.get().map(n => ({
      id: n.id,
      opacity: 1.0,
      font: { color: dotMode ? 'transparent' : '#ffffff' },
    }))
  );
  if (Object.keys(edgeColorCache).length > 0) {
    network.body.data.edges.update(
      network.body.data.edges.get().map(e => ({
        id: e.id,
        color: JSON.parse(JSON.stringify(edgeColorCache[e.id]?.color ?? {})),
        width: edgeColorCache[e.id]?.width ?? 1,
      }))
    );
  }
}

// ── HOVER DE NÓS (vis.js events — confiáveis) ────────────────────────────
network.on('hoverNode', function(params) {
  if (physicsOn) return;   // hover desabilitado com física ativa
  document.getElementById('mynetwork').style.cursor = 'pointer';
  // Se havia aresta destacada, limpa antes de destacar o nó
  if (edgeHovId !== null) { edgeHovId = null; _restoreAll(); hideTooltip(); }
  nodeHover = true;

  const id   = params.node;
  const data = NODE_DATA[id];
  if (data) {
    showTooltip(
      `<span class="tt-iata" style="color:${data.cor}">${id}</span>` +
      `<span class="tt-label">Cidade</span>: <span class="tt-value">${data.cidade}</span><br>` +
      `<span class="tt-label">Regi\u00e3o</span>: <span class="tt-value">${data.regiao}</span><br>` +
      `<span class="tt-label">Grau</span>: <span class="tt-value">${data.grau}</span><br>` +
      `<span class="tt-label">Densidade Ego</span>: <span class="tt-value">${data.densidade_ego.toFixed(3)}</span>`
    );
  }

  const neighbors = new Set(network.getConnectedNodes(id));
  neighbors.add(id);

  network.body.data.nodes.update(
    network.body.data.nodes.get().map(n => ({
      id: n.id,
      opacity: neighbors.has(n.id) ? 1.0 : 0.1,
      font: { color: neighbors.has(n.id) ? '#ffffff' : 'transparent' },
    }))
  );
  network.body.data.edges.update(
    network.body.data.edges.get().map(e => ({
      id: e.id,
      color: (e.from === id || e.to === id)
        ? { ...edgeColorCache[e.id]?.color, opacity: 1.0 }
        : { color: '#21262d', opacity: 0.05 },
      width: (e.from === id || e.to === id)
        ? (edgeColorCache[e.id]?.width ?? 1) * 1.6
        : 0.5,
    }))
  );
});

network.on('blurNode', function() {
  if (physicsOn) return;
  document.getElementById('mynetwork').style.cursor = 'default';
  nodeHover = false;
  hideTooltip();
  _restoreAll();
});

// ── HOVER DE ARESTAS via mousemove + getEdgeAt() ──────────────────────────
// Não usa hoverEdge/blurEdge do vis.js — esses eventos são perdidos quando
// a física move o grafo, deixando arestas permanentemente cinzas.
// getEdgeAt() consulta a posição real do cursor a cada movimento.

function _applyEdgeHover(eid) {
  const edge = network.body.data.edges.get(eid);
  if (!edge) return;
  const data = EDGE_DATA[`${edge.from}|${edge.to}`];
  if (!data) return;

  const edgeCor = edgeColorCache[eid]?.color?.color ?? '#8b949e';
  showTooltip(
    `<span class="tt-iata" style="color:${edgeCor}">${data.origem} \u2194 ${data.destino}</span>` +
    `<span class="tt-label">Tipo</span>: <span class="tt-value">${data.tipo.replace(/_/g, ' ')}</span><br>` +
    `<span class="tt-label">Peso</span>: <span class="tt-value">${data.peso.toFixed(1)}</span>`
  );

  const endpoints = new Set([edge.from, edge.to]);
  network.body.data.nodes.update(
    network.body.data.nodes.get().map(n => ({
      id: n.id,
      opacity: endpoints.has(n.id) ? 1.0 : 0.1,
      font: { color: endpoints.has(n.id) ? '#ffffff' : 'transparent' },
    }))
  );
  network.body.data.edges.update(
    network.body.data.edges.get().map(e => ({
      id: e.id,
      color: e.id === eid
        ? { ...edgeColorCache[e.id]?.color, opacity: 1.0 }
        : { color: '#21262d', opacity: 0.05 },
      width: e.id === eid
        ? (edgeColorCache[e.id]?.width ?? 1) * 2.2
        : 0.5,
    }))
  );
}

const canvas = document.getElementById('mynetwork');
canvas.addEventListener('mousemove', function(evt) {
  mouseX = evt.clientX;
  mouseY = evt.clientY;

  // Reposiciona tooltip se já visível
  if (tooltip.style.display === 'block') positionTooltip();

  // Hover desabilitado com física ativa, ou enquanto nó estiver sob o cursor
  if (physicsOn || nodeHover) return;

  // Consulta qual aresta (se alguma) está sob o cursor
  const eid = network.getEdgeAt({ x: evt.offsetX, y: evt.offsetY }) ?? null;

  if (eid === edgeHovId) return;   // sem mudança — nada a fazer

  // Mudou: primeiro desfaz o estado anterior
  if (edgeHovId !== null) {
    edgeHovId = null;
    _restoreAll();
    hideTooltip();
    document.getElementById('mynetwork').style.cursor = 'default';
  }

  // Aplica novo destaque se houver aresta sob o cursor
  if (eid !== null) {
    edgeHovId = eid;
    _applyEdgeHover(eid);
    document.getElementById('mynetwork').style.cursor = 'pointer';
  }
});

// Limpa destaque ao sair do canvas
canvas.addEventListener('mouseleave', function() {
  if (edgeHovId !== null) {
    edgeHovId = null;
    _restoreAll();
    hideTooltip();
    document.getElementById('mynetwork').style.cursor = 'default';
  }
});

// ── Após estabilização: centraliza e cacheia — física permanece no estado
// definido pelo usuário (não é desligada automaticamente)
network.on('stabilized', function() {
  setTimeout(() => {
    network.fit({ animation: { duration: 400, easingFunction: 'easeInOutQuad' } });
    buildEdgeCache();
  }, 300);
});
</script>
"""

    # ── Serializar dados para JSON e substituir placeholders ─────────────────
    path_rec_poa = caminhos_destaque[0]["nos"]
    path_mao_gru = caminhos_destaque[1]["nos"]

    # Mapa de pesos das arestas para calcular custo por trecho
    peso_aresta: dict[frozenset, float] = {}
    for origem, destino, peso, *_ in grafo.arestas():
        peso_aresta[frozenset([origem, destino])] = peso

    def custos_por_trecho(nos: list[str]) -> list[float]:
        """Retorna lista de pesos de cada aresta consecutiva do caminho."""
        return [
            peso_aresta.get(frozenset([nos[i], nos[i + 1]]), 0.0)
            for i in range(len(nos) - 1)
        ]

    custos_rec_poa = custos_por_trecho(path_rec_poa)
    custos_mao_gru = custos_por_trecho(path_mao_gru)

    js_final = (CUSTOM_JS_TEMPLATE
                .replace("NODE_DATA_JSON_PLACEHOLDER",        json.dumps(node_data_dict, ensure_ascii=False))
                .replace("EDGE_DATA_JSON_PLACEHOLDER",        json.dumps(edge_data_dict, ensure_ascii=False))
                .replace("PATH_REC_POA_JSON_PLACEHOLDER",     json.dumps(path_rec_poa))
                .replace("PATH_MAO_GRU_JSON_PLACEHOLDER",     json.dumps(path_mao_gru))
                .replace("PATH_REC_POA_COSTS_PLACEHOLDER",    json.dumps(custos_rec_poa))
                .replace("PATH_MAO_GRU_COSTS_PLACEHOLDER",    json.dumps(custos_mao_gru)))

    # ── Injetar CSS antes de </head> e HTML+JS antes de </body> ──────────────
    html = html.replace("</head>", CUSTOM_CSS + "</head>")
    html = html.replace("</body>", CUSTOM_HTML + js_final + "</body>")

    # ── Salvar arquivo final ─────────────────────────────────────────────────
    caminho_saida = Path(diretorio_saida) / "grafo_interativo.html"
    with open(caminho_saida, "w", encoding="utf-8") as f:
        f.write(html)

    tamanho_kb = caminho_saida.stat().st_size // 1024
    print(f"[OK] grafo_interativo.html gerado com sucesso ({tamanho_kb} KB)")


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
