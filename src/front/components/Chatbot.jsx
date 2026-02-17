import React, { useState, useEffect, useRef } from 'react';
import useGlobalReducer from "../hooks/useGlobalReducer";
import "../styles/Chatbot.css";

export const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([
        { role: 'assistant', content: '¡Hola! Soy el asistente de Hairbnb. ¿En qué puedo ayudarte hoy?' }
    ]);
    const scrollRef = useRef(null);
    const { store } = useGlobalReducer();

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMsg = { role: 'user', content: input };
        const newHistory = [...messages, userMsg].slice(-5);
        setMessages([...messages, userMsg]);
        setInput("");

        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    history: newHistory,
                    userName: store.userInfo?.name || "Invitado",
                    isRegistered: !!store.token
                }),
            });

            const data = await response.json();
            setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
        } catch (error) {
            console.error("Error:", error);
        }
    };

    return (
        <div className={`chat-wrapper ${isOpen ? 'open' : ''}`}>

            <button className="chat-toggle" onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? <i className="fa-solid fa-xmark"></i> : <i className="fa-regular fa-comment"></i>}
            </button>

            {isOpen && (
                <div className="chat-window">
                    <div className="chat-header">Barber AI</div>
                    <div className="chat-body" ref={scrollRef}>
                        {messages.map((msg, i) => (
                            <div key={i} className={`msg-bubble ${msg.role}`}>
                                {msg.content}
                            </div>
                        ))}
                    </div>
                    <div className="chat-footer">
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                            placeholder="Escribe aquí..."
                        />
                        <button className="btn btn-outline-secondary" onClick={sendMessage}>Enviar</button>
                    </div>
                </div>
            )}
        </div>
    );
};