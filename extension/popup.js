// // document.getElementById("start").onclick = () => {
// //     chrome.runtime.sendMessage({ action: "start" });
// //     document.getElementById("status").textContent = "Recording...";
// // };

// // document.getElementById("stop").onclick = () => {
// //     chrome.runtime.sendMessage({ action: "stop" });
// //     document.getElementById("status").textContent = "Stopped";
// // };
// // let mediaRecorder;
// // let socket;

// // document.getElementById("start").onclick = async () => {

// //     console.log("Starting recording...");

// //     const stream = await navigator.mediaDevices.getUserMedia({
// //         audio: true
// //     });

// //     socket = new WebSocket("ws://127.0.0.1:8000/ws/audio");

// //     socket.onopen = () => {
// //         console.log("WebSocket connected");
// //     };

// //     socket.onerror = (error) => {
// //         console.log("WebSocket error:", error);
// //     };

// //     mediaRecorder = new MediaRecorder(stream);

// //     mediaRecorder.ondataavailable = (event) => {
// //         if (event.data.size > 0 && socket.readyState === 1) {
// //             event.data.arrayBuffer().then(buffer => {
// //                 socket.send(buffer);
// //             });
// //         }
// //     };

// //     mediaRecorder.start(3000); // send chunk every 3 seconds
// // };

// // document.getElementById("stop").onclick = () => {
// //     console.log("Stopping...");
// //     if (mediaRecorder) mediaRecorder.stop();
// //     if (socket) socket.close();
// // };

// // let socket;

// // document.getElementById("start").onclick = async () => {

// //     console.log("Start clicked");

// //     try {
// //         const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
// //         console.log("Microphone access granted");

// //         socket = new WebSocket("ws://127.0.0.1:8000/ws/audio");

// //         socket.onopen = () => {
// //             console.log("WebSocket connected");
// //         };

// //         socket.onerror = (error) => {
// //             console.log("WebSocket error:", error);
// //         };

// //     } catch (err) {
// //         console.log("Microphone error:", err);
// //     }
// // };

// let mediaRecorder;
// let socket;

// document.getElementById("start").onclick = async () => {

//     console.log("Start clicked");

//     try {
//         const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

//         socket = new WebSocket("ws://127.0.0.1:8000/ws/audio");

//         socket.onopen = () => {
//             console.log("WebSocket connected");
//         };

//         mediaRecorder = new MediaRecorder(stream);

//         mediaRecorder.ondataavailable = async (event) => {
//             if (event.data.size > 0 && socket.readyState === 1) {
//                 const buffer = await event.data.arrayBuffer();
//                 socket.send(buffer);
//             }
//         };

//         mediaRecorder.start(3000);

//     } catch (err) {
//         console.error("Microphone error:", err);
//         alert("Please allow microphone access in browser settings.");
//     }
// };

document.getElementById("start").onclick = () => {
    chrome.runtime.sendMessage({ action: "start-recording" });
    document.getElementById("status").textContent = "Recording...";
};

document.getElementById("stop").onclick = () => {
    chrome.runtime.sendMessage({ action: "stop-recording" });
    document.getElementById("status").textContent = "Stopped";
};