let mediaRecorder;
let socket;
let combinedStream;
let isRecording = false;
let audioContext;

chrome.runtime.onMessage.addListener(async (message) => {

    if (message.action === "start-offscreen") {
        try {
            // Capture tab audio
            const tabStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    mandatory: {
                        chromeMediaSource: "tab",
                        chromeMediaSourceId: message.streamId
                    }
                }
            });
            console.log("Tab audio captured");

            // Try to capture microphone audio (may fail if no permission)
            let micStream = null;
            try {
                micStream = await navigator.mediaDevices.getUserMedia({
                    audio: true
                });
                console.log("Microphone captured");
            } catch (micErr) {
                console.warn("Microphone access denied, using tab audio only:", micErr);
            }

            // Mix streams using Web Audio API
            audioContext = new AudioContext();
            const destination = audioContext.createMediaStreamDestination();

            const tabSource = audioContext.createMediaStreamSource(tabStream);
            tabSource.connect(destination);

            if (micStream) {
                const micSource = audioContext.createMediaStreamSource(micStream);
                micSource.connect(destination);
                console.log("Tab + Microphone audio combined");
            } else {
                console.log("Using tab audio only");
            }

            combinedStream = destination.stream;

            socket = new WebSocket("ws://127.0.0.1:8000/ws/audio");

            socket.onopen = () => {
                console.log("WebSocket connected");
                isRecording = true;
                startNextRecording();
            };

            socket.onerror = (err) => {
                console.error("WebSocket error:", err);
            };

            socket.onclose = () => {
                console.log("WebSocket closed");
                isRecording = false;
            };

        } catch (err) {
            console.error("Failed to capture audio:", err);
        }
    }

    if (message.action === "stop-offscreen") {
        isRecording = false;
        if (mediaRecorder && mediaRecorder.state !== "inactive") {
            mediaRecorder.stop();
        }
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.close();
        }
        if (audioContext) {
            audioContext.close();
        }
    }
});

function startNextRecording() {
    if (!isRecording || !combinedStream || !socket || socket.readyState !== WebSocket.OPEN) {
        console.log("Recording stopped or connection lost");
        return;
    }

    const chunks = [];
    mediaRecorder = new MediaRecorder(combinedStream, { mimeType: "audio/webm;codecs=opus" });

    mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
            chunks.push(event.data);
        }
    };

    mediaRecorder.onstop = async () => {
        if (chunks.length > 0 && socket && socket.readyState === WebSocket.OPEN) {
            const blob = new Blob(chunks, { type: "audio/webm" });
            console.log("Sending audio:", blob.size, "bytes");
            const buffer = await blob.arrayBuffer();
            socket.send(buffer);
        }
        
        // Start next recording immediately after this one finishes
        if (isRecording) {
            startNextRecording();
        }
    };

    mediaRecorder.start();
    console.log("Recording started...");
    
    // Stop after 5 seconds to create complete file
    setTimeout(() => {
        if (mediaRecorder && mediaRecorder.state === "recording") {
            mediaRecorder.stop();
        }
    }, 5000);
}