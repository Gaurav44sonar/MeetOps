# from fastapi import FastAPI
# from app.websocket.audio_socket import router as websocket_router

# app = FastAPI(
#     title="MeetOps API",
#     version="1.0.0"
# )

# app.include_router(websocket_router)

# @app.get("/")
# def root():
#     return {"status": "MeetOps Running"}

from fastapi import FastAPI
from app.websocket.audio_socket import router as websocket_router

app = FastAPI()

app.include_router(websocket_router)

@app.get("/")
def root():
    return {"status": "MeetOps Running"}