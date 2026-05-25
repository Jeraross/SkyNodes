from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routers import algorithms, graph, metrics

app = FastAPI(title="MixGraph API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(graph.router)
app.include_router(algorithms.router)
app.include_router(metrics.router)
