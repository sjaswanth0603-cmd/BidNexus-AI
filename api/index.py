import os
import sys

# Add root and backend directories to sys.path
current_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.dirname(current_dir)
backend_dir = os.path.join(root_dir, "backend")

for p in [backend_dir, root_dir, current_dir]:
    if os.path.exists(p) and p not in sys.path:
        sys.path.insert(0, p)

try:
    from app.main import app
except Exception as exc1:
    try:
        from backend.app.main import app
    except Exception as exc2:
        import traceback
        error_msg = f"Import error 1: {exc1}\nImport error 2: {exc2}\n{traceback.format_exc()}\nsys.path: {sys.path}\nos.listdir root: {os.listdir(root_dir) if os.path.exists(root_dir) else []}"
        from fastapi import FastAPI
        app = FastAPI()
        @app.api_route("/{full_path:path}", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"])
        def diag_route(full_path: str):
            return {"status": "backend_initialization_error", "detail": error_msg}
