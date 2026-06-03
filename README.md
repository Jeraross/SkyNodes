# Teoria dos Grafos

## Descrição

Este projeto modela a **rede de aeroportos brasileiros** como um grafo rotulado não-direcionado e aplica algoritmos clássicos de teoria dos grafos para análise estrutural e busca de caminhos.

O projeto é dividido em duas partes:

- **Parte 1 (este repositório):** Construção do grafo, implementação dos algoritmos (BFS, DFS, Dijkstra e Bellman-Ford) do zero, cálculo de métricas (grau, ego-rede, densidade), geração de visualizações estáticas e interativas, e interface de linha de comando (CLI).
- **Parte 2:** Análise avançada de redes (centralidade, comunidades, correlação com dados de streaming musical via dataset Spotify).

Cada aeroporto é representado por seu código **IATA** (ex.: `GRU`, `REC`, `BSB`). As arestas modelam rotas entre aeroportos com pesos calculados por uma fórmula híbrida que considera distância geográfica, penalidade inter-regional e bônus de hub nacional.

---

## Estrutura de Pastas

```
MixGraph/
├── requirements.txt                  # Dependências do projeto
├── README.md                         # Este arquivo
└── MixGraph/                         # Pacote principal
    ├── data/
    │   ├── aeroportos_data.csv       # 20 aeroportos (IATA, cidade, região)
    │   ├── adjacencias_aeroportos.csv# Arestas geradas pelas regras de conectividade
    │   ├── rotas.csv                 # 7 pares de rotas para Dijkstra
    │   └── dataset_MixGraph/
    │       └── spotify_songs.csv     # Dataset Spotify (Parte 2)
    ├── out/                          # Arquivos de saída gerados automaticamente
    │   ├── global.json               # Métricas globais do grafo
    │   ├── regioes.json              # Métricas por região
    │   ├── ego_aeroportos.csv        # Ego-redes de cada aeroporto
    │   ├── graus.csv                 # Ranking de graus
    │   ├── distancias_rotas.csv      # Rotas Dijkstra com custos e caminhos
    │   ├── arvore_percurso.png       # Mapa estático dos caminhos obrigatórios
    │   ├── grafo_interativo.html     # Grafo completo interativo (pyvis)
    │   ├── viz1_distribuicao_graus.png
    │   ├── viz2_ranking_conectados.png
    │   ├── viz3_metricas_regioes.png
    │   ├── viz4_ego_grau_densidade.png
    │   ├── viz5_camadas_bfs.png
    │   └── viz6_heatmap_distancias.png
    ├── src/
    │   ├── __init__.py
    │   ├── build_data.py             # Gera adjacencias_aeroportos.csv
    │   ├── cli.py                    # Interface de linha de comando (argparse)
    │   ├── solve.py                  # Métricas, ego-redes, rotas (Parte 1)
    │   ├── viz.py                    # Todas as visualizações (matplotlib + pyvis)
    │   └── graphs/
    │       ├── __init__.py
    │       ├── graph.py              # Classe Grafo e Aresta
    │       ├── io.py                 # Carregamento e construção do grafo via CSV
    │       └── algorithms.py         # BFS, DFS, Dijkstra, Bellman-Ford
    └── tests/
        ├── test_bfs.py
        ├── test_dfs.py
        ├── test_dijkstra.py
        └── test_bellman_ford.py
```

---

## Instalação

```bash
# 1. Clone o repositório
git clone https://github.com/Jeraross/MixGraph.git
cd MixGraph

# 2. Crie e ative o ambiente virtual
python -m venv .venv

# Linux/macOS
source .venv/bin/activate

# Windows (PowerShell)
.venv\Scripts\Activate.ps1

# 3. Instale as dependências
pip install -r requirements.txt
```

---

## Como Executar

> Todos os comandos abaixo devem ser rodados a partir do diretório `MixGraph\MixGraph\`
> (o subdiretório com `src/`, `data/` e `tests/`).

```
cd MixGraph\MixGraph
```

---

### Pipeline completo — Parte 1

Executa tudo de uma vez: métricas, rotas, visualizações estáticas e grafo interativo.

```bash
python -m src.cli --dataset ./data/aeroportos_data.csv --alg ALL --out ./out/
```

Arquivos gerados em `out/`: métricas JSON, CSVs, PNG analíticos, mapa estático e `grafo_interativo.html`.

---

### Gerar apenas as visualizações

```bash
python -m src.viz
```

Gera `out/arvore_percurso.png`, `out/grafo_interativo.html` e todos os PNGs analíticos sem re-executar o pipeline de métricas.

---

### Visualização interativa (grafo_interativo.html)

Após gerar o arquivo, abra-o diretamente no navegador:

**Windows Explorer** — navegue até `MixGraph\out\` e dê duplo clique em `grafo_interativo.html`.

**PowerShell**:
```powershell
Invoke-Item .\out\grafo_interativo.html
```

**Prompt de Comando (cmd)**:
```cmd
start out\grafo_interativo.html
```

O HTML é completamente autocontido (sem dependências externas) — funciona offline em qualquer navegador moderno.

#### Controles da interface

| Botão | Ação |
|---|---|
| `⊕` | Centralizar / reajustar zoom |
| `⚡` | Ligar / desligar simulação física |
| `⬤` | Modo compacto (oculta rótulos, reduz nós) |

- **Hover** sobre nó: exibe IATA, cidade, região, grau e densidade da ego-rede
- **Hover** sobre aresta: exibe tipo de conexão, peso e justificativa
- **Clique** em nó: fixa painel de detalhes no rodapé
- **Player de caminhos**: reproduz passo a passo os caminhos mínimos REC→POA e MAO→GRU

> Hover de nós e arestas fica desativado enquanto a física estiver ligada.

---

### Algoritmos individuais via CLI

```bash
# BFS a partir de Recife
python -m src.cli --dataset ./data/aeroportos_data.csv --alg BFS --source REC --out ./out/

# DFS a partir de São Paulo (GRU)
python -m src.cli --dataset ./data/aeroportos_data.csv --alg DFS --source GRU --out ./out/

# Dijkstra: menor caminho de Recife a Porto Alegre
python -m src.cli --dataset ./data/aeroportos_data.csv --alg DIJKSTRA --source REC --target POA --out ./out/

# Bellman-Ford: Manaus a São Paulo
python -m src.cli --dataset ./data/aeroportos_data.csv --alg BELLMAN_FORD --source MAO --target GRU --out ./out/
```

Cada algoritmo salva um JSON em `out/` com os resultados completos (pais, distâncias, caminhos).

---

### Gerar apenas as adjacências

Necessário apenas na primeira execução se o arquivo `data/adjacencias_aeroportos.csv` não existir (o pipeline `ALL` já faz isso automaticamente):

```bash
python src/build_data.py
```

---

### Rodar testes

```bash
pytest tests/ -v
```

---

## Modelo do Grafo

### Nós

Cada nó representa um aeroporto identificado pelo código **IATA**. O grafo contém **20 aeroportos** distribuídos por 5 regiões:

| Região | Aeroportos |
|---|---|
| Norte | MAO, BEL, PVH, RBR |
| Nordeste | REC, SSA, FOR, NAT, JPA, THE |
| Sudeste | GRU, CGH, GIG, CNF, VIX |
| Sul | CWB, FLN, POA |
| Centro-Oeste | BSB, GYN |

### Regras de Modelagem das Arestas

**Regra 1 — Conexão Regional** (`tipo_conexao = "regional"`, `peso_base = 1.0`)
Todo aeroporto conecta-se a todos os outros da mesma região (clique completo intra-regional).
`justificativa = "conexão intra-regional: {regiao}"`

**Regra 2 — Conexão via Hub Nacional** (`tipo_conexao = "hub"`, `peso_base = 2.0`)
Hubs nacionais: **GRU** (Sudeste), **BSB** (Centro-Oeste), **GIG** (Sudeste).
Aeroportos de outras regiões conectam-se ao(s) hub(s) correspondente(s):
- Norte → MAO conecta a GRU e BSB
- Nordeste → REC, SSA, FOR conectam a GRU; NAT, JPA, THE conectam a BSB
- Sul → POA, CWB, FLN conectam a GRU

`justificativa = "conexão via hub nacional {hub}"`

**Regra 3 — Pontes Inter-Regionais** (`tipo_conexao = "inter_regional"`, `peso_base = 2.5`)
Conexões estratégicas para garantir conectividade total:
`BSB↔MAO`, `BSB↔BEL`, `BSB↔REC`, `BSB↔POA`, `GRU↔MAO`, `GIG↔SSA`

`justificativa = "ponte inter-regional estratégica"`

### Fórmula Híbrida de Pesos

```
penalidade_regiao = 1.0  se os dois nós são de regiões diferentes
                  = 0.0  se são da mesma região

penalidade_hub    = 0.5  se nenhum dos dois nós é hub nacional (GRU, BSB, GIG)
                  = 0.0  se pelo menos um é hub

peso_final = peso_base + penalidade_regiao + penalidade_hub
peso_final ≥ 1.0  (nunca negativo)
```

Isso penaliza conexões inter-regionais sem hub intermediário e beneficia rotas que passam por hubs nacionais.

---

## Arquivos de Saída (`out/`)

| Arquivo | Descrição |
|---|---|
| `global.json` | Ordem \|V\|, tamanho \|E\|, densidade e conectividade do grafo |
| `regioes.json` | Métricas do subgrafo induzido por cada região (ordem, tamanho, densidade) |
| `ego_aeroportos.csv` | Grau, ordem, tamanho e densidade da ego-rede de cada aeroporto |
| `graus.csv` | Ranking de todos os aeroportos por grau (decrescente) |
| `distancias_rotas.csv` | Custo e caminho mínimo (Dijkstra) para os 7 pares de `data/rotas.csv` |
| `arvore_percurso.png` | Mapa estático (matplotlib) com os caminhos REC→POA e MAO→GRU destacados |
| `grafo_interativo.html` | Grafo completo interativo com tooltips, player de caminhos e legenda |
| `viz1_distribuicao_graus.png` | Histograma da distribuição de graus (exploratória) |
| `viz2_ranking_conectados.png` | Barras horizontais com ranking de conectividade por região (exploratória) |
| `viz3_metricas_regioes.png` | Barras agrupadas comparando métricas por região (exploratória) |
| `viz4_ego_grau_densidade.png` | Scatter grau × densidade da ego-rede por região (exploratória) |
| `viz5_camadas_bfs.png` | Camadas BFS a partir de REC em layout por colunas (explanatória) |
| `viz6_heatmap_distancias.png` | Heatmap 20×20 das distâncias mínimas Dijkstra entre todos os pares (explanatória) |
