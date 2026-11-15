import os
import sys

# Add backend directory to sys.path if invoked from root
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.join(current_dir, "backend")
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from backend.server import app

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    print(f"Starting Dragon Tank India Server on http://{host}:{port}")
    uvicorn.run("backend.server:app", host=host, port=port, reload=True)
