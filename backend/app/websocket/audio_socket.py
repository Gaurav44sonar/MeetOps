# from fastapi import APIRouter, WebSocket
# from app.services.transcription import transcribe_audio
# from app.services.storage import save_transcript

# router = APIRouter()

# @router.websocket("/ws/audio")
# async def websocket_endpoint(websocket: WebSocket):
#     await websocket.accept()
#     print("Client connected")

#     try:
#         while True:
#             audio_bytes = await websocket.receive_bytes()

#             text = transcribe_audio(audio_bytes)

#             if text.strip():
#                 save_transcript(text)
#                 await websocket.send_text(text)

#     except Exception as e:
#         print("Connection closed:", e)

from fastapi import APIRouter, WebSocket
from app.services.transcription import transcribe_audio
from app.services.storage import save_transcript

router = APIRouter()

@router.websocket("/ws/audio")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("Client connected")

    try:
        while True:
            audio_bytes = await websocket.receive_bytes()
            print(f"Received {len(audio_bytes)} bytes of audio")

            text = transcribe_audio(audio_bytes)
            print(f"Transcription result: '{text}'")

            if text.strip():
                print("Transcript:", text)
                save_transcript(text)

    except Exception as e:
        print("Connection closed:", e)