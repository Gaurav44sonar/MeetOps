# from datetime import datetime

# def save_transcript(text):
#     with open("meeting_transcript.txt", "a", encoding="utf-8") as f:
#         f.write(f"[{datetime.now()}] {text}\n")

from datetime import datetime

def save_transcript(text):
    with open("meeting_transcript.txt", "a", encoding="utf-8") as f:
        f.write(f"[{datetime.now()}] {text}\n")