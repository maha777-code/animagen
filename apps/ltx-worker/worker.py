"""CLI entry — run LTX render HTTP server."""

if __name__ == "__main__":
    import os

    import uvicorn

    uvicorn.run(
        "server:app",
        host="0.0.0.0",
        port=int(os.getenv("LTX_PORT", "8010")),
        reload=os.getenv("LTX_RELOAD", "0") == "1",
    )
