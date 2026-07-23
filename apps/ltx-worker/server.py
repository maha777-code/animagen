"""LTX-2 render backend — Tier 3 cinematic export for Animagen Pro."""

from __future__ import annotations

import base64
import os
import uuid
from datetime import datetime, timezone
from enum import Enum
from typing import Any

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

app = FastAPI(title="Animagen LTX Worker", version="0.1.0")

LTX_ENABLED = os.getenv("LTX_ENABLED", "0") == "1"
OUTPUT_DIR = os.getenv("LTX_OUTPUT_DIR", os.path.join(os.path.dirname(__file__), "outputs"))
os.makedirs(OUTPUT_DIR, exist_ok=True)


class JobStatus(str, Enum):
    queued = "queued"
    processing = "processing"
    completed = "completed"
    failed = "failed"


class RenderRequest(BaseModel):
    prompt: str = Field(min_length=1)
    negative_prompt: str = ""
    seed: int = Field(ge=0)
    width: int = Field(default=768, ge=256, le=1920)
    height: int = Field(default=512, ge=256, le=1080)
    num_frames: int = Field(default=121, ge=9, le=241)
    frame_rate: float = Field(default=24.0, ge=12, le=60)
    image_base64: str | None = None
    shot_label: str | None = None
    style_preset: str | None = None


class RenderJob(BaseModel):
    id: str
    status: JobStatus
    created_at: str
    updated_at: str
    prompt: str
    negative_prompt: str
    seed: int
    shot_label: str | None = None
    style_preset: str | None = None
    mode: str
    message: str | None = None
    download_url: str | None = None
    keyframe_saved: bool = False


JOBS: dict[str, dict[str, Any]] = {}


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _save_keyframe(job_id: str, image_base64: str | None) -> bool:
    if not image_base64:
        return False
    try:
        raw = image_base64.split(",", 1)[-1]
        data = base64.b64decode(raw)
        path = os.path.join(OUTPUT_DIR, f"{job_id}-keyframe.png")
        with open(path, "wb") as f:
            f.write(data)
        return True
    except Exception:
        return False


def _process_job(job_id: str, body: RenderRequest) -> None:
    job = JOBS[job_id]
    job["status"] = JobStatus.processing
    job["updated_at"] = _now()

    if LTX_ENABLED:
        try:
            from render_engine import render_ltx_video  # type: ignore

            out_path = render_ltx_video(body, OUTPUT_DIR, job_id)
            job["status"] = JobStatus.completed
            job["download_url"] = f"/v1/jobs/{job_id}/download"
            job["output_path"] = out_path
            job["message"] = "LTX-2 render complete"
        except ImportError:
            job["status"] = JobStatus.failed
            job["message"] = "LTX_ENABLED=1 but render_engine / diffusers not installed"
        except Exception as exc:
            job["status"] = JobStatus.failed
            job["message"] = str(exc)
    else:
        job["status"] = JobStatus.completed
        job["mode"] = "dev"
        job["message"] = (
            "Dev mode: prompt compiled and keyframe saved. "
            "Set LTX_ENABLED=1 on a GPU machine with diffusers to render MP4."
        )
        meta_path = os.path.join(OUTPUT_DIR, f"{job_id}-prompt.txt")
        with open(meta_path, "w", encoding="utf-8") as f:
            f.write(f"PROMPT:\n{body.prompt}\n\nNEGATIVE:\n{body.negative_prompt}\n")

    job["updated_at"] = _now()


@app.get("/health")
def health() -> dict[str, Any]:
    return {
        "status": "ok",
        "service": "animagen-ltx-worker",
        "ltx_enabled": LTX_ENABLED,
        "output_dir": OUTPUT_DIR,
    }


@app.post("/v1/render")
def create_render(body: RenderRequest) -> RenderJob:
    job_id = str(uuid.uuid4())
    keyframe_saved = _save_keyframe(job_id, body.image_base64)

    job: dict[str, Any] = {
        "id": job_id,
        "status": JobStatus.queued,
        "created_at": _now(),
        "updated_at": _now(),
        "prompt": body.prompt,
        "negative_prompt": body.negative_prompt,
        "seed": body.seed,
        "shot_label": body.shot_label,
        "style_preset": body.style_preset,
        "mode": "ltx-2" if LTX_ENABLED else "dev",
        "message": None,
        "download_url": None,
        "keyframe_saved": keyframe_saved,
    }
    JOBS[job_id] = job
    _process_job(job_id, body)
    return RenderJob(**{k: v for k, v in job.items() if k in RenderJob.model_fields})


@app.get("/v1/jobs/{job_id}")
def get_job(job_id: str) -> RenderJob:
    job = JOBS.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return RenderJob(**{k: v for k, v in job.items() if k in RenderJob.model_fields})


@app.get("/v1/jobs/{job_id}/download")
def download_job(job_id: str) -> dict[str, str]:
    job = JOBS.get(job_id)
    if not job or job.get("status") != JobStatus.completed:
        raise HTTPException(status_code=404, detail="Render not ready")
    output_path = job.get("output_path")
    if not output_path or not os.path.isfile(output_path):
        raise HTTPException(
            status_code=404,
            detail="No video file (dev mode — enable LTX_ENABLED=1 on GPU worker)",
        )
    return {"path": output_path, "job_id": job_id}
