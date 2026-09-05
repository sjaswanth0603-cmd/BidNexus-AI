import os
import uvicorn
from app.main import app

if __name__ == "__main__":
    port_str = os.environ.get("PORT", "10000")
    try:
        port = int(port_str)
    except (ValueError, TypeError):
        port = 10000
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, log_level="info")

