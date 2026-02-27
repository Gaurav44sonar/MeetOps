# from faster_whisper import WhisperModel
# import tempfile
# import subprocess
# import os

# model = WhisperModel(
#     "small",
#     device="cpu",
#     compute_type="int8"
# )


# ffmpeg_path = r"C:\ffmpeg-8.0.1-essentials_build\bin\ffmpeg.exe"

# def transcribe_audio(audio_bytes):
#     try:
#         with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as f:
#             f.write(audio_bytes)
#             webm_path = f.name

#         wav_path = webm_path.replace(".webm", ".wav")
#         subprocess.run(
#     [
#         ffmpeg_path,
#         "-y",
#         "-i", webm_path,
#         "-vn",            # ignore video
#         "-ar", "16000",
#         "-ac", "1",
#         "-f", "wav",
#         wav_path
#     ],
#     stdout=subprocess.DEVNULL,
#     stderr=subprocess.DEVNULL
# )

#         segments, _ = model.transcribe(
#     wav_path,
#     language="en",
#     beam_size=5,
#     vad_filter=True,
#     temperature=0.0
# )

#         text = ""
#         for segment in segments:
#             text += segment.text.strip() + " "

#         os.remove(webm_path)
#         os.remove(wav_path)

#         return text

#     except Exception as e:
#         print("Transcription error:", e)
#         return ""


from faster_whisper import WhisperModel
import tempfile
import subprocess
import os

model = WhisperModel(
    "small",
    device="cpu",
    compute_type="int8"
)

ffmpeg_path = r"C:\ffmpeg-8.0.1-essentials_build\bin\ffmpeg.exe"

def transcribe_audio(audio_bytes):
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as f:
            f.write(audio_bytes)
            webm_path = f.name

        wav_path = webm_path.replace(".webm", ".wav")

        # Run FFmpeg with error capture
        result = subprocess.run(
            [
                ffmpeg_path,
                "-y",
                "-i", webm_path,
                "-vn",
                "-ar", "16000",
                "-ac", "1",
                "-f", "wav",
                wav_path
            ],
            capture_output=True,
            text=True
        )

        if result.returncode != 0:
            print(f"FFmpeg error: {result.stderr}")
            return ""

        # Check if WAV was created
        if not os.path.exists(wav_path):
            print("WAV file not created")
            return ""

        wav_size = os.path.getsize(wav_path)
        print(f"WAV file size: {wav_size} bytes")

        segments, info = model.transcribe(
            wav_path,
            language="en",
            beam_size=5,
            vad_filter=True,  # Filter out non-speech
            vad_parameters=dict(
                min_silence_duration_ms=500,
                speech_pad_ms=400
            ),
            no_speech_threshold=0.6,
            condition_on_previous_text=False
        )

        segments_list = list(segments)
        print(f"Number of segments: {len(segments_list)}")

        # Filter out common hallucinations from silence
        hallucinations = ["you", "thank you", "thanks for watching", "bye", ""]
        
        text = ""
        for segment in segments_list:
            segment_text = segment.text.strip()
            print(f"Segment: '{segment_text}' (no_speech_prob: {segment.no_speech_prob:.2f})")
            
            # Skip if high probability of no speech or common hallucination
            if segment.no_speech_prob > 0.5:
                continue
            if segment_text.lower() in hallucinations:
                continue
                
            text += segment_text + " "

        os.remove(webm_path)
        os.remove(wav_path)

        return text.strip()

    except Exception as e:
        print("Transcription error:", e)
        return ""