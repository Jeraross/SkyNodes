<div align="center">

# SkyNodes

**Um grafo interativo da rede de aeroportos brasileiros com algoritmos clássicos e narrativa visual**

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19+-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4+-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

</div>

---

## O que é o SkyNodes?

SkyNodes modela a **rede de aeroportos brasileiros** como um grafo rotulado não-direcionado e aplica algoritmos clássicos de teoria dos grafos para análise estrutural e busca de caminhos.

Cada aeroporto é um nó identificado pelo seu código **IATA** (ex.: `GRU`, `REC`, `BSB`). As arestas representam rotas com pesos calculados por uma fórmula híbrida que considera distância geográfica, penalidade inter-regional e bônus de hub nacional. O projeto também inclui o **AeroTale**: uma narrativa visual interativa ambientada nessa rede, onde o jogador explora aeroportos, resolve puzzles baseados em grafos e descobre uma história de anomalias no sistema de rotas.

---

## Funcionalidades

- **Globe View:** Visualização 3D do grafo de aeroportos sobre o globo terrestre com rotas e nós interativos
- **Mapa Interativo:** Visualização 2D da rede sobre o mapa do Brasil com tooltips de métricas
- **Algoritmos:** Execute BFS, DFS, Dijkstra e Bellman-Ford sobre o grafo e visualize o percurso em tempo real
- **Métricas:** Dashboard com grau, densidade, ego-redes e rankings por aeroporto e região
- **AeroTale:** Jogo de narrativa visual onde o jogador pilota rotas, enfrenta anomalias e resolve puzzles de grafos
- **Leaderboard:** Ranking de pontuações do modo AeroTale

---

## Stack

```
Backend          Python 3.11 · FastAPI · grafo implementado do zero
Frontend         React 19 · TypeScript · Vite · TailwindCSS 4
Visualização     reagraph (WebGL) · react-globe.gl · react-simple-maps
Motor do Jogo    PixiJS 8 · Three.js · GSAP
Dataset          20 aeroportos · aeroportos_data.csv
```

---

## Grafo de Aeroportos

O grafo $G = (V, E, w)$ é **não-direcionado e ponderado**.

- **Nó** → um aeroporto com código IATA, cidade e região
- **Aresta / rota** → uma conexão aérea possível entre dois aeroportos
- **Peso** → custo total da rota (quanto maior, mais "cara" é a conexão)

### Aeroportos

O grafo contém **20 aeroportos** distribuídos por 5 regiões:

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

**Regra 2 — Conexão via Hub Nacional** (`tipo_conexao = "hub"`, `peso_base = 2.0`)
Hubs nacionais: **GRU** (Sudeste), **BSB** (Centro-Oeste), **GIG** (Sudeste).
Aeroportos de outras regiões conectam-se ao hub correspondente.

**Regra 3 — Pontes Inter-Regionais** (`tipo_conexao = "inter_regional"`, `peso_base = 2.5`)
Conexões estratégicas para garantir conectividade total:
`BSB↔MAO`, `BSB↔BEL`, `BSB↔REC`, `BSB↔POA`, `GRU↔MAO`, `GIG↔SSA`

### Fórmula Híbrida de Pesos

$$peso\_final = peso\_base + penalidade\_regiao + penalidade\_hub$$

| Componente | Critério | Valor |
|---|---|---|
| `penalidade_regiao` | Nós em regiões diferentes | `1.0` |
| `penalidade_regiao` | Nós na mesma região | `0.0` |
| `penalidade_hub` | Nenhum dos nós é hub (GRU, BSB, GIG) | `0.5` |
| `penalidade_hub` | Pelo menos um nó é hub | `0.0` |

> O `peso_final` nunca é negativo (mínimo `1.0`). Conexões inter-regionais sem hub intermediário são penalizadas; rotas que passam por hubs nacionais recebem desconto.

---

## Algoritmos Implementados

> Nenhum desses algoritmos usa bibliotecas prontas de grafos (`networkx`, `igraph`, etc.).

### BFS: Exploração em Largura

A busca em largura percorre o grafo em ondas, visitando todos os aeroportos a 1 salto da origem antes dos a 2 saltos, e assim por diante. No SkyNodes, o BFS é usado para revelar quais aeroportos são alcançáveis dentro de $k$ conexões a partir de um ponto de partida, construindo a árvore BFS com níveis e pais.

### DFS: Busca em Profundidade e Detecção de Ciclos

A busca em profundidade mergulha o mais fundo possível por um caminho antes de retroceder, marcando nós com timestamps de descoberta e término e identificando **back-edges** (arestas que apontam para um ancestral já em exploração). No SkyNodes, o DFS é usado para detectar ciclos no grafo de aeroportos.

### Dijkstra: Caminho de Menor Custo

O algoritmo de Dijkstra encontra o caminho de **menor custo acumulado** entre dois aeroportos usando uma fila de prioridade (min-heap). Ele assume que todos os pesos são não-negativos e lança `ValueError` ao encontrar um peso negativo — o que não ocorre neste grafo, já que `peso_final ≥ 1.0` sempre.

### Bellman-Ford: Caminho Ótimo com Detecção de Ciclos Negativos

O Bellman-Ford também encontra o caminho de menor custo, mas relaxa todas as arestas $|V| - 1$ vezes e tolera **pesos negativos**. No SkyNodes, ele serve como alternativa robusta ao Dijkstra e é capaz de **detectar e reportar ciclos de peso negativo** — útil para validar a integridade do grafo.

---

## Arquitetura

### Estrutura de Pastas

```
SkyNodes/                              — raiz do repositório
├── Dockerfile.backend
├── Dockerfile.frontend
├── docker-compose.yml
├── requirements.txt
├── Relatorios/                        — documentos acadêmicos (.docx)
└── SkyNodes/                         — código-fonte do projeto
    ├── main.py                        — entrypoint uvicorn
    ├── conftest.py
    ├── pytest.ini
    ├── api/                           — camada HTTP (FastAPI)
    │   ├── main.py                    — app FastAPI + CORS
    │   ├── config.py
    │   ├── dependencies.py            — injeção do grafo via Depends
    │   ├── coordinates.py             — lat/lon por código IATA
    │   └── routers/
    │       ├── graph.py               — /graph/nodes, /graph/edges
    │       ├── algorithms.py          — /algorithms/bfs, dfs, dijkstra, bellman-ford
    │       └── metrics.py             — /metrics/global, regions, ego, rankings
    ├── src/                           — lógica de domínio Python
    │   ├── build_data.py              — gera adjacencias_aeroportos.csv
    │   ├── cli.py
    │   ├── solve.py
    │   ├── viz.py
    │   └── graphs/
    │       ├── graph.py               — classes Grafo e Aresta
    │       ├── algorithms.py          — BFS, DFS, Dijkstra, Bellman-Ford
    │       └── io.py                  — pipeline CSV → Grafo
    ├── data/
    │   ├── aeroportos_data.csv        — 20 aeroportos (IATA, cidade, região)
    │   ├── adjacencias_aeroportos.csv — arestas geradas pelas regras de conectividade
    │   └── rotas.csv
    ├── tests/                         — testes de backend (pytest)
    │   ├── test_api_algorithms.py
    │   ├── test_api_graph.py
    │   ├── test_api_metrics.py
    │   ├── test_bellman_ford.py
    │   ├── test_bfs.py
    │   ├── test_dfs.py
    │   └── test_dijkstra.py
    ├── lib/                           — dependências JS legadas
    │   ├── bindings/
    │   └── vis-9.1.2/
    └── frontend/                      — SPA React + TypeScript
        ├── index.html
        ├── vite.config.ts
        ├── componentes/               — componentes visuais reutilizáveis
        │   ├── BlurText/
        │   ├── CardNav/
        │   ├── ClickSpark/
        │   ├── Counter/
        │   ├── Dock/
        │   ├── FadeContent/
        │   ├── Folder/
        │   ├── MagicBento/
        │   ├── Particles/
        │   ├── ScrollReveal/
        │   ├── SplitText/
        │   ├── SpotlightCard/
        │   └── Stepper/
        ├── public/
        │   ├── favicon.svg
        │   └── models/                — cenas GLTF (monumentos 3D)
        └── src/
            ├── main.tsx
            ├── App.tsx
            ├── index.css
            ├── types.ts
            ├── assets/                — imagens, áudio, sprites
            ├── charts/                — gráficos Recharts por algoritmo
            │   ├── BfsLayersChart.tsx
            │   ├── CentralityRankingChart.tsx
            │   ├── DegreeDistributionChart.tsx
            │   ├── DfsTreeChart.tsx
            │   ├── DistanceHeatmapChart.tsx
            │   ├── EgoScatterChart.tsx
            │   ├── RoutesByRegionChart.tsx
            │   └── RoutesByTypeChart.tsx
            ├── components/
            │   ├── IntroScreen.tsx
            │   ├── dashboard/         — painéis de métricas e algoritmos
            │   ├── globe/             — FlightGlobe, overlays e objetos 3D
            │   ├── navigation/        — sidebar, dock, top nav, toggles
            │   ├── ui/                — componentes shadcn/ui customizados
            │   └── views/             — GraphView, MapView
            ├── data/                  — datasets estáticos TypeScript
            ├── game/                  — motor AeroTale
            │   ├── types.ts
            │   ├── data/              — diálogos, puzzles, encontros, mundo
            │   ├── logic/             — engines de puzzle, combate, navegação
            │   ├── render/            — canvas PixiJS (GameCanvas, camadas)
            │   ├── sprites/           — sprites pixel art e geração procedural
            │   ├── state/             — gameProgress, useGameController
            │   └── ui/                — telas e overlays do jogo
            │       ├── AeroTaleScreen.tsx
            │       ├── AeroTaleIntro.tsx
            │       ├── CombatScreen.tsx
            │       ├── DialogueOverlay.tsx
            │       ├── WorldMapPanel.tsx
            │       └── ...
            ├── hooks/                 — useFlightSimulation, useIsMobile
            ├── lib/
            │   ├── api/               — cliente HTTP para o backend
            │   ├── geo/               — interpolação great-circle
            │   └── graph/             — algoritmos de grafo client-side
            ├── pages/                 — rotas wouter
            │   ├── DadosPage.tsx
            │   ├── GamePage.tsx
            │   ├── GrafosPage.tsx
            │   ├── LeaderboardPage.tsx
            │   ├── LoginPage.tsx
            │   └── ProjetoPage.tsx
            ├── router/
            │   └── transitions.ts
            └── types/                 — declarações de módulos externos
```

### Pipeline de Carregamento: CSV → Grafo

A construção do grafo a partir do CSV segue duas etapas:

1. **`carregar_grafo`**: lê `aeroportos_data.csv`, instancia os nós e carrega as arestas de `adjacencias_aeroportos.csv`.
2. **`construir_adjacencias`**: aplica as três regras de conectividade (regional, hub, inter-regional), calcula a fórmula de pesos e persiste o resultado em `adjacencias_aeroportos.csv`.

O grafo é carregado **uma única vez** na inicialização do servidor e injetado via `Depends` em todos os endpoints.

---

## Endpoints da API

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/graph/nodes` | Retorna todos os aeroportos com IATA, cidade, região, coordenadas e grau |
| `GET` | `/graph/edges` | Retorna todas as arestas com origem, destino, peso, tipo e justificativa |
| `POST` | `/algorithms/bfs` | Executa BFS a partir de um aeroporto e retorna visitados, níveis, pais e árvore |
| `POST` | `/algorithms/dfs` | Executa DFS a partir de um aeroporto e retorna percurso, timestamps, back-edges e ciclos |
| `POST` | `/algorithms/dijkstra` | Calcula o caminho de menor custo entre dois aeroportos (sem pesos negativos) |
| `POST` | `/algorithms/bellman-ford` | Calcula o caminho de menor custo com suporte a pesos negativos e detecção de ciclos negativos |
| `GET` | `/metrics/global` | Retorna ordem, tamanho, densidade e conectividade do grafo |
| `GET` | `/metrics/regions` | Retorna métricas do subgrafo induzido por cada região |
| `GET` | `/metrics/ego` | Retorna grau, ordem, tamanho e densidade da ego-rede de cada aeroporto |
| `GET` | `/metrics/rankings` | Retorna o aeroporto mais conectado e o de maior densidade de ego-rede |

---

## Como Rodar

### Pré-requisitos

- Python 3.11+
- Node.js 18+

### Backend

```bash
cd SkyNodes

# Instale as dependências
pip install -r requirements.txt

# Gere o arquivo de adjacências (apenas na primeira execução)
python -m src.build_data

# Inicie o servidor
uvicorn main:app --reload
# API disponível em http://localhost:8000
```

### Frontend

```bash
cd SkyNodes/frontend

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
# App disponível em http://localhost:5173
```

### Testes

```bash
cd SkyNodes

# Executar toda a suíte de testes
pytest

# Executar com detalhamento
pytest -v -s

# Executar apenas os testes de algoritmos
pytest tests/test_dijkstra.py tests/test_bellman_ford.py
```

<div align="center">
<sub>Projeto acadêmico — Teoria dos Grafos</sub>
</div>
