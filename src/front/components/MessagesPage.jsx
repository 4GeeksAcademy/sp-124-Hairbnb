import React, { useState, useEffect, useRef } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { useLocation } from "react-router-dom";
import { io } from "socket.io-client";
import "../styles/messagespage.css"

export const MessagesPage = () => {
    const { store } = useGlobalReducer();
    const [conversations, setConversations] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");

    const scrollRef = useRef(null);
    const socketRef = useRef(null);
    const isClient = store.role === "client";

    const socket = io(process.env.VITE_BACKEND_URL, {
    transports: ['polling', 'websocket'],
    withCredentials: true
    });

    const loadConversations = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/conversations`, {
                headers: { "Authorization": `Bearer ${store.token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setConversations(data);
            }
        } catch (error) { console.error("Error:", error); }
    };

    const loadMessages = async (id) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/conversations/${id}/messages`, {
                headers: { "Authorization": `Bearer ${store.token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setMessages(data);
            }
        } catch (error) { console.error("Error:", error); }
    };

    useEffect(() => {
        loadConversations();
        const socketUrl = import.meta.env.VITE_BACKEND_URL.replace("/api", "");
        socketRef.current = io(socketUrl, {
            auth: { token: store.token },
            transports: ["websocket", "polling"]
        });
        socketRef.current.on("message:new", (msg) => {
            setSelectedChat((currentSelected) => {
                if (currentSelected && msg.conversation_id === currentSelected.id) {
                    setMessages((prev) => {
                        if (prev.find(m => m.id === msg.id)) return prev;
                        return [...prev, msg];
                    });
                }
                return currentSelected;
            });
            loadConversations();
        });
        return () => { if (socketRef.current) socketRef.current.disconnect(); };
    }, []);

    useEffect(() => { if (selectedChat) loadMessages(selectedChat.id); }, [selectedChat]);

    useEffect(() => {
        if (scrollRef.current) {
            const container = scrollRef.current;
            container.scrollTo({
                top: container.scrollHeight,
                behavior: "smooth"
            });
        }
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedChat) return;
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/messages`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${store.token}`
                },
                body: JSON.stringify({ conversation_id: selectedChat.id, content: newMessage })
            });
            if (response.ok) setNewMessage("");
        } catch (error) { console.error("Error:", error); }
    };

    return (
        <div className="w-100">
            <div className="messages-main-container rounded-3 overflow-hidden d-flex">

                <div className="conversations-sidebar col-md-4">
                    <div className="sidebar-header">
                        <h5 className="Oswald mb-0 text-uppercase fw-bold text-gold">Mensajes</h5>
                    </div>

                    <div className="conversations-list">
                        {conversations.length === 0 ? (
                            <div className="p-4 text-center text-muted small mt-5">No tienes conversaciones</div>
                        ) : (
                            conversations.map(conv => (
                                <button
                                    key={conv.id}
                                    onClick={() => setSelectedChat(conv)}
                                    className={`conversation-item ${selectedChat?.id === conv.id ? "active" : ""}`}
                                >
                                    <strong className="Oswald text-uppercase d-block mb-1" style={{ fontSize: '0.9rem' }}>
                                        {isClient ? conv.barbershop_name : conv.user_name}
                                    </strong>
                                    {!isClient && <small className="text-gold fw-bold d-block mb-1" style={{ fontSize: '0.7rem' }}>{conv.barbershop_name}</small>}
                                    <p className="small text-muted mb-0 text-truncate">{conv.last_message || "Enviar mensaje"}</p>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                <div className="chat-window-container col-md-8">
                    {selectedChat ? (
                        <>
                            <div className="chat-header-top d-flex align-items-center">
                                <div className="rounded-circle bg-gold-soft p-2 me-3 text-gold" style={{ width: '40px', height: '40px', textAlign: 'center' }}>
                                    <i className="fa-solid fa-user-tie"></i>
                                </div>
                                <div>
                                    <h6 className="mb-0 Oswald text-uppercase fw-bold">
                                        {isClient ? selectedChat.barbershop_name : selectedChat.user_name}
                                    </h6>
                                </div>
                            </div>

                            <div className="chat-messages-body" ref={scrollRef}>
                                {messages.map(msg => {
                                    const isMyMessage = msg.sender_type === store.role;
                                    return (
                                        <div key={msg.id} className={`msg-wrapper ${isMyMessage ? "my-msg" : "their-msg"}`}>
                                            <div className={`bubble ${isMyMessage ? "me" : "them"}`}>
                                                {msg.content}
                                                <span className="msg-time text-end">
                                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={scrollRef} />
                            </div>

                            <div className="chat-input-area">
                                <form className="custom-input-group" onSubmit={handleSendMessage}>
                                    <input
                                        type="text"
                                        className="chat-input-field"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Escribe tu mensaje..."
                                    />
                                    <button className="chat-send-btn" type="submit">
                                        <i className="fa-solid fa-paper-plane"></i>
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="h-100 d-flex flex-column align-items-center justify-content-center text-center p-5 bg-light">
                            <div className="mb-3 p-4 rounded-circle bg-white shadow-sm">
                                <i className="fa-solid fa-comments-slash fa-3x text-gold opacity-50"></i>
                            </div>
                            <h5 className="Oswald text-uppercase fw-bold">Bandeja de entrada</h5>
                            <p className="text-muted small">Selecciona una conversación para chatear</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};