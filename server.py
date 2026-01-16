
import uvicorn
from starlette.applications import Starlette
from starlette.routing import Mount
from starlette.staticfiles import StaticFiles
import os

# Create a simple Starlette app to serve static files from the current directory
app = Starlette(
    routes=[
        Mount("/", app=StaticFiles(directory=".", html=True), name="static"),
    ],
)

if __name__ == "__main__":
    print("🚀 EduTrack Development Server")
    print("🔗 Local: http://localhost:8000")
    print("Isolated in Python venv environment.")
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
