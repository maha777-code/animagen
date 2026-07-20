"""Animagen inference service — Tier 2 SceneSpec generation."""

from __future__ import annotations

import os
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from spec_builder import build_enhanced_spec
from vllm_engine import generate_with_vllm, vllm_enabled

app = FastAPI(title="Animagen Inference", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class GenerateRequest(BaseModel):
    prompt: str = Field(min_length=1, max_length=2000)
    seed: int = Field(ge=0)
    hint: dict[str, Any] | None = None


class GenerateResponse(BaseModel):
    spec: dict[str, Any]
    source: str
    model: str | None = None


@app.get("/health")
def health() -> dict[str, str]:
    mode = "vllm" if vllm_enabled() else "enhanced"
    return {"status": "ok", "service": "animagen-inference", "mode": mode}


@app.post("/v1/generate", response_model=GenerateResponse)
def generate(body: GenerateRequest) -> GenerateResponse:
    try:
        if vllm_enabled():
            spec = generate_with_vllm(body.prompt, body.seed, body.hint)
            return GenerateResponse(
                spec=spec,
                source="llm",
                model=os.getenv("VLLM_MODEL", "meta-llama/Llama-3.1-8B-Instruct"),
            )

        spec = build_enhanced_spec(body.prompt, body.seed, body.hint)
        return GenerateResponse(spec=spec, source="enhanced", model=None)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("INFERENCE_PORT", "8000"))
    uvicorn.run("server:app", host="0.0.0.0", port=port, reload=False)
