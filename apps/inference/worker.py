"""CLI entry — run inference HTTP server."""

from server import app  # noqa: F401

if __name__ == "__main__":
    import uvicorn
    import os

    uvicorn.run("server:app", host="0.0.0.0", port=int(os.getenv("INFERENCE_PORT", "8000")))
