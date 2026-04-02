import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.autenticacao import router as auth_router

app = FastAPI(
    title="API de Análise de Crédito",
    version="1.0.0"
)

API_FRONT_URL = os.getenv("API_FRONT_URL")


app.add_middleware(
    CORSMiddleware,
    allow_origins=[API_FRONT_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)