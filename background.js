const runtime = typeof browser !== "undefined" ? browser.runtime : chrome.runtime;

runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "generateAltText") {
        const API_KEY = "AIzaSyBZnx8uBZH6ityBUvcICacuahvFzMCJJNc";
        const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

        const requestBody = {
            contents: [{
                parts: [
                    { text: request.prompt },
                    { inline_data: { mime_type: request.mimeType, data: request.imageData } }
                ]
            }]
        };

        fetch(GEMINI_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => { throw new Error(err.error.message); });
                }
                return response.json();
            })
            .then(data => sendResponse({ success: true, data: data }))
            .catch(error => sendResponse({ success: false, error: error.message }));

        return true;
    }
});