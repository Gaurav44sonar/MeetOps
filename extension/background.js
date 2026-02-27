let offscreenCreated = false;

chrome.runtime.onMessage.addListener(async (message) => {

    if (message.action === "start-recording") {
        try {
            // Get the active tab
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            console.log("Active tab:", tab?.id, tab?.url);
            
            if (!tab) {
                console.error("No active tab found");
                return;
            }

            // Create offscreen document if not exists
            if (!offscreenCreated) {
                try {
                    await chrome.offscreen.createDocument({
                        url: "offscreen.html",
                        reasons: ["USER_MEDIA"],
                        justification: "Recording meeting audio"
                    });
                    offscreenCreated = true;
                    console.log("Offscreen document created");
                } catch (e) {
                    if (e.message.includes("already exists")) {
                        offscreenCreated = true;
                        console.log("Offscreen document already exists");
                    } else {
                        throw e;
                    }
                }
            }

            const streamId = await chrome.tabCapture.getMediaStreamId({ targetTabId: tab.id });
            console.log("Got stream ID:", streamId);

            chrome.runtime.sendMessage({
                action: "start-offscreen",
                streamId: streamId
            });
            console.log("Sent start-offscreen message");
        } catch (err) {
            console.error("Failed to start recording:", err);
        }
    }

    if (message.action === "stop-recording") {
        try {
            chrome.runtime.sendMessage({ action: "stop-offscreen" });

            if (offscreenCreated) {
                await chrome.offscreen.closeDocument();
                offscreenCreated = false;
                console.log("Offscreen document closed");
            }
        } catch (err) {
            console.error("Failed to stop recording:", err);
        }
    }
});