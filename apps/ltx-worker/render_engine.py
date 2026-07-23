"""
LTX-2 production render hook.

Install: pip install torch diffusers accelerate
Set: LTX_ENABLED=1, LTX_MODEL=Lightricks/LTX-2

This module is imported only when LTX_ENABLED=1.
See https://huggingface.co/Lightricks/LTX-2 for full pipeline setup.
"""

from __future__ import annotations

import os
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from server import RenderRequest


def render_ltx_video(body: "RenderRequest", output_dir: str, job_id: str) -> str:
    model_id = os.getenv("LTX_MODEL", "Lightricks/LTX-2")
    out_path = os.path.join(output_dir, f"{job_id}.mp4")

    try:
        import torch
        from diffusers import LTX2Pipeline
        from diffusers.pipelines.ltx2.export_utils import encode_video
    except ImportError as exc:
        raise RuntimeError(
            "Install GPU dependencies: pip install torch diffusers accelerate"
        ) from exc

    device = "cuda" if torch.cuda.is_available() else "cpu"
    if device == "cpu":
        raise RuntimeError("LTX-2 requires a CUDA GPU for practical render times")

    pipe = LTX2Pipeline.from_pretrained(model_id, torch_dtype=torch.bfloat16)
    pipe.enable_sequential_cpu_offload()

    kwargs: dict = {
        "prompt": body.prompt,
        "negative_prompt": body.negative_prompt or None,
        "width": body.width,
        "height": body.height,
        "num_frames": body.num_frames,
        "frame_rate": body.frame_rate,
        "num_inference_steps": int(os.getenv("LTX_STEPS", "40")),
        "guidance_scale": float(os.getenv("LTX_CFG", "4.0")),
    }

    if body.image_base64:
        # Image-to-video path — decode keyframe when diffusers I2V API is wired
        kwargs["output_type"] = "np"

    result = pipe(**kwargs)
    video = result[0] if isinstance(result, tuple) else result.frames
    encode_video(video[0], fps=body.frame_rate, output_path=out_path)
    return out_path
