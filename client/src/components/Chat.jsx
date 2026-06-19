import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2 } from 'lucide-react';
import { streamAskQuestion } from '../utils/api';

const Chat = () => {
    const [messages, setMessages] = useState([{ role: 'ai', content: 'Hello! I am MedRAGnosis. Please upload your medical documents from the sidebar and ask me any questions based on them.' }]);
    const [input, setInput] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = () => {
        if (!input.trim() || isStreaming) return;

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }, { role: 'ai', content: '' }]);
        setIsStreaming(true);

        streamAskQuestion(
            userMsg,
            (chunk) => {
                setMessages(prev => {
                    const newMsgs = [...prev];
                    // Create a deep copy of the last message to avoid React StrictMode double-mutation
                    const lastMsg = { ...newMsgs[newMsgs.length - 1] };
                    lastMsg.content += chunk;
                    newMsgs[newMsgs.length - 1] = lastMsg;
                    return newMsgs;
                });
            },
            (error) => {
                console.error(error);
                setMessages(prev => {
                    const newMsgs = [...prev];
                    const lastMsg = newMsgs[newMsgs.length - 1];
                    lastMsg.content += `\n\n[Error retrieving response: ${error.message}]`;
                    return newMsgs;
                });
                setIsStreaming(false);
            },
            () => {
                setIsStreaming(false);
            }
        );
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="chat-region">
            <div className="chat-messages">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`message ${msg.role}`}>
                        {msg.role === 'ai' && <Bot size={24} style={{ flexShrink: 0, marginTop: '4px' }} />}
                        <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                            {msg.content}
                            {isStreaming && idx === messages.length - 1 && <span className="cursor-animate">▋</span>}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-container">
                <div className="chat-input-box">
                    <textarea 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask a question about the uploaded documents..."
                        rows={1}
                        disabled={isStreaming}
                    />
                    <button 
                        className="send-btn" 
                        onClick={handleSend}
                        disabled={!input.trim() || isStreaming}
                    >
                        {isStreaming ? <Loader2 size={20} className="spin" /> : <Send size={20} />}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Chat;
