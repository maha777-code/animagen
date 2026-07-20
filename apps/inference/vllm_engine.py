"""vLLM-backed SceneSpec generation (production Tier 2)."""

from __future__ import annotations

import json
import os
from typing import Any

SYSTEM_PROMPT = """You are Animagen, an expert 3D animation director.
Output ONLY valid JSON matching SceneSpec v1 for procedural Three.js rendering.
Rules:
- version must be 1
- subjects: use known types (dragon, bird, fish, robot, human, spaceship, whale, etc.)
- environment: ocean, forest, desert, space, city, underwater, etc.
- animations: match subject motion (fly, swim, walk, orbit, float)
- camera: follow for moving subjects, flythrough for epic scenes, duration 15-30
- effects: match environment (bubbles underwater, storm for stormy, sparkles for space)
- Never output markdown or explanation, JSON object only."""


def generate_with_vllm(prompt: str, seed: int, hint: dict[str, Any] | None = None) -> dict[str, Any]:
    """Call vLLM OpenAI-compatible API with JSON schema constraint."""
    model = os.getenv("VLLM_MODEL", "meta-llama/Llama-3.1-8B-Instruct")
    base_url = os.getenv("VLLM_BASE_URL", "http://localhost:8080/v1")

    try:
        from openai import OpenAI  # type: ignore
    except ImportError as exc:
        raise RuntimeError("openai package required for vLLM mode: pip install openai") from exc

    client = OpenAI(base_url=base_url, api_key=os.getenv("VLLM_API_KEY", "EMPTY"))
    user_content = f"Prompt: {prompt}\nSeed: {seed}"
    if hint:
        user_content += f"\nParser hint (improve this): {json.dumps(hint)}"

    response = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_content},
        ],
        temperature=0.4,
        max_tokens=2048,
        response_format={"type": "json_object"},
    )

    raw = response.choices[0].message.content or "{}"
    spec = json.loads(raw)
    spec["seed"] = seed
    spec["prompt"] = prompt.strip()
    spec.setdefault("version", 1)
    if "metadata" not in spec:
        spec["metadata"] = {}
    spec["metadata"]["source"] = "llm"
    spec["metadata"]["confidence"] = 0.88
    return spec


def vllm_enabled() -> bool:
    return os.getenv("VLLM_ENABLED", "0") == "1"
