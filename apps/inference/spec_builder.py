"""Build high-quality SceneSpec from parser hints + prompt heuristics (dev / no-GPU mode)."""

from __future__ import annotations

import re
from typing import Any

SUBJECT_KEYWORDS: dict[str, str] = {
    "dragon": "dragon",
    "shell": "fish",
    "seashell": "fish",
    "fish": "fish",
    "whale": "whale",
    "shark": "fish",
    "bird": "bird",
    "robot": "robot",
    "car": "car",
    "human": "human",
    "knight": "human",
    "spaceship": "spaceship",
    "rocket": "rocket",
    "butterfly": "butterfly",
    "horse": "horse",
    "cat": "cat",
    "dog": "dog",
    "tree": "tree",
    "crystal": "crystal",
    "planet": "planet",
}

ENV_KEYWORDS: dict[str, str] = {
    "ocean": "ocean",
    "underwater": "underwater",
    "sea": "ocean",
    "forest": "forest",
    "desert": "desert",
    "space": "space",
    "city": "city",
    "mountain": "mountains",
    "meadow": "meadow",
    "volcano": "volcano",
    "arctic": "arctic",
    "cave": "cave",
    "beach": "beach",
    "jungle": "jungle",
}

MOTION_KEYWORDS: dict[str, str] = {
    "fly": "fly",
    "flying": "fly",
    "swim": "swim",
    "swimming": "swim",
    "walk": "walk",
    "running": "run",
    "run": "run",
    "orbit": "orbit",
    "float": "float",
    "bounce": "bounce",
    "spin": "spin",
}


def _find_keyword(text: str, table: dict[str, str]) -> str | None:
    lower = text.lower()
    for word, value in sorted(table.items(), key=lambda x: -len(x[0])):
        if re.search(rf"\b{re.escape(word)}\b", lower):
            return value
    return None


def _infer_color(prompt: str) -> str:
    colors = ["red", "blue", "green", "gold", "silver", "purple", "orange", "white", "black", "cyan"]
    lower = prompt.lower()
    for c in colors:
        if c in lower:
            return c
    return "gold"


def _infer_mood(prompt: str) -> str:
    lower = prompt.lower()
    if any(w in lower for w in ("storm", "thunder", "dark")):
        return "stormy"
    if any(w in lower for w in ("sunset", "dawn", "romantic")):
        return "dramatic"
    if any(w in lower for w in ("calm", "peaceful", "serene")):
        return "calm"
    if any(w in lower for w in ("epic", "heroic")):
        return "epic"
    return "calm"


def _infer_time(prompt: str) -> str:
    lower = prompt.lower()
    for t in ("sunset", "sunrise", "dawn", "noon", "night", "midnight", "dusk"):
        if t in lower:
            return "sunset" if t == "sunrise" else t
    return "noon"


def _infer_effects(environment: str, mood: str, prompt: str) -> list[str]:
    lower = prompt.lower()
    effects: list[str] = []
    if "bubble" in lower:
        effects.append("bubbles")
    if "rain" in lower or mood == "stormy":
        effects.append("rain")
    if "snow" in lower or environment == "arctic":
        effects.append("snow")
    if "storm" in lower or mood == "stormy":
        effects.append("storm")
    if "sparkle" in lower or environment == "space":
        effects.append("sparkles")
    if environment == "underwater" and "bubbles" not in effects:
        effects.append("bubbles")
    if environment == "volcano":
        effects.append("fire")
    return effects[:3] if effects else (["sparkles"] if environment == "space" else [])


def build_enhanced_spec(prompt: str, seed: int, hint: dict[str, Any] | None = None) -> dict[str, Any]:
    """Merge parser hint with heuristic enrichment for Tier 2 dev path."""
    base = hint.copy() if hint else {}
    subject_type = _find_keyword(prompt, SUBJECT_KEYWORDS)
    environment = _find_keyword(prompt, ENV_KEYWORDS) or base.get("environment", "abstract")
    motion = _find_keyword(prompt, MOTION_KEYWORDS) or "float"
    mood = _infer_mood(prompt)
    time_of_day = _infer_time(prompt)
    color = _infer_color(prompt)

    subjects = list(base.get("subjects") or [])
    if not subjects and subject_type:
        subjects = [{"type": subject_type, "color": color, "name": subject_type, "scale": 1}]

    if not subjects:
        subjects = [{"type": "unknown", "color": color, "name": "subject", "scale": 1}]

    animations = list(base.get("animations") or [])
    if not animations:
        target = subjects[0].get("name") or subjects[0].get("type") or "subject"
        path = "circle" if motion in ("fly", "swim", "orbit") else None
        anim: dict[str, Any] = {"target": target, "motion": motion, "speed": 1}
        if path:
            anim["path"] = path
        animations = [anim]

    effects = list(base.get("effects") or [])
    if not effects:
        effects = _infer_effects(environment, mood, prompt)

    camera = dict(base.get("camera") or {"movement": "orbit", "duration": 10})
    target = subjects[0].get("name") or subjects[0].get("type")
    if motion in ("fly", "swim"):
        camera["movement"] = "follow"
        camera["target"] = target
    elif mood in ("epic", "dramatic"):
        camera["movement"] = "flythrough"
    camera["duration"] = max(int(camera.get("duration", 10)), 15)

    return {
        "version": 1,
        "seed": seed,
        "prompt": prompt.strip(),
        "subjects": subjects,
        "environment": environment,
        "lighting": base.get("lighting") or {"timeOfDay": time_of_day, "mood": mood},
        "animations": animations,
        "camera": camera,
        "effects": effects,
        "metadata": {
            "source": "fallback",
            "confidence": 0.72,
            "normalizedPrompt": prompt.lower().strip(),
        },
    }
