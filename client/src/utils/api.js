const getSessionId = () => {
    let sessionId = localStorage.getItem("medrag_session_id");
    if (!sessionId) {
        sessionId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
        localStorage.setItem("medrag_session_id", sessionId);
    }
    return sessionId;
};

export const resetSession = () => {
    localStorage.removeItem("medrag_session_id");
};

export const uploadPdfs = async (files) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    const sessionId = getSessionId();
    const response = await fetch(`http://localhost:8000/upload_pdfs/?session_id=${sessionId}`, {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${errorText}`);
    }

    return await response.json();
};

export const clearSessionDocuments = async () => {
    const sessionId = getSessionId();
    const response = await fetch("http://localhost:8000/clear/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: "", session_id: sessionId })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Clear failed: ${errorText}`);
    }

    return await response.json();
};

export const streamAskQuestion = (query, onMessage, onError, onComplete) => {
    const sessionId = getSessionId();
    fetch("http://localhost:8000/ask/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "text/event-stream"
        },
        body: JSON.stringify({ query, session_id: sessionId })
    }).then(async response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let done = false;
 
        while (!done) {
            const { value, done: readerDone } = await reader.read();
            done = readerDone;
            
            if (value) {
                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');
                
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const dataStr = line.slice(6);
                        if (dataStr) {
                            let cleanStr = dataStr.replace(/\r$/, '');
                            if (cleanStr === '[DONE]') {
                                onComplete();
                                return;
                            }
                            if (cleanStr) {
                                try {
                                    let parsed = JSON.parse(cleanStr);
                                    if (parsed.error) {
                                        onError(new Error(parsed.error));
                                    } else if (parsed.text) {
                                        onMessage(parsed.text);
                                    }
                                } catch(err) {
                                    console.error('Error parsing SSE json:', err, cleanStr);
                                }
                            }
                        }
                    }
                }
            }
        }
        onComplete();
    }).catch(error => {
        onError(error);
    });
};
