import React, { useState, useEffect, useRef } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { useLocation } from "react-router-dom";
import { io } from "socket.io-client";

export const MessagePage = () => {
    const { store } = useGlobalReducer();
    const location = useLocation();
    const [conversations, setConversations] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");

    const scrollRef = useRef(null);
    const socketRef = useRef(null);
    const isClient = store.role === "client";

    const loadConversations = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/conversations`, {
                headers: { "Authorization": `Bearer ${store.token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setConversations(data);
            }
        } catch (error) {
            console.error("Error cargando conversaciones:", error);
        }
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
        } catch (error) {
            console.error("Error cargando mensajes:", error);
        }
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

        return () => {
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, []);

    useEffect(() => {
        if (selectedChat) {
            loadMessages(selectedChat.id);
        }
    }, [selectedChat]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
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
                body: JSON.stringify({
                    conversation_id: selectedChat.id,
                    content: newMessage
                })
            });

            if (response.ok) {
                setNewMessage("");
            }
        } catch (error) {
            console.error("Error al enviar mensaje:", error);
        }
    };

    return (
        <div className="row bg-white border rounded shadow-sm mx-0 overflow-hidden" style={{ minHeight: "500px" }}>
            <div className="col-md-4 p-0 border-end" style={{ height: "500px", overflowY: "auto" }}>
                <div className="p-3 bg-light border-bottom sticky-top">
                    <h5 className="mb-0 text-center">Bandeja de Entrada</h5>
                </div>
                <div className="list-group list-group-flush">
                    {conversations.length === 0 ? (
                        <div className="p-4 text-center text-muted">Aún no hay mensajes</div>
                    ) : (
                        conversations.map(conv => (
                            <button
                                key={conv.id}
                                onClick={() => setSelectedChat(conv)}
                                className={`list-group-item list-group-item-action p-3 ${selectedChat?.id === conv.id ? "bg-primary text-white" : ""}`}
                            >
                                <div className="d-flex flex-column">
                                    <strong className="mb-1">
                                        {isClient ? conv.barbershop_name : conv.user_name}
                                    </strong>
                                    {!isClient && (
                                        <span className="align-self-start">
                                            {conv.barbershop_name}
                                        </span>
                                    )}
                                </div>
                                <div className={`small mt-1 ${selectedChat?.id === conv.id ? "text-white-50" : "text-muted"}`}>
                                    {conv.last_message || "Haz clic para chatear..."}
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            <div className="col-md-8 p-0 d-flex flex-column" style={{ height: "500px" }}>
                {selectedChat ? (
                    <>
                        <div className="p-3 border-bottom bg-light">
                            {isClient ? (
                                <strong>{selectedChat.barbershop_name}</strong>
                            ) : (
                                <div>
                                    <span className="d-block">Cliente:</span>
                                    <strong>{selectedChat.user_name}</strong>
                                    <span className="mx-2 text-muted">|</span>
                                    <span className="text-muted">{selectedChat.barbershop_name}</span>
                                </div>
                            )}
                        </div>
                        
                        <div className="p-3 flex-grow-1" style={{ overflowY: "auto", backgroundColor: "#f8f9fa" }}>
                            {messages.length === 0 ? (
                                <div className="h-100 d-flex flex-column align-items-center justify-content-center text-muted">
                                    <p>Aún no hay mensajes en esta conversación.</p>
                                    <small>¡Escribe algo para comenzar!</small>
                                </div>
                            ) : (
                                messages.map(msg => {
                                    const isMyMessage = msg.sender_type === store.role;
                                    return (
                                        <div
                                            key={msg.id}
                                            className={`p-2 mb-2 border rounded ${isMyMessage ? "ms-auto bg-primary text-white border-primary" : "me-auto bg-white"}`}
                                            style={{ width: "fit-content", maxWidth: "80%" }}
                                        >
                                            <div>{msg.content}</div>
                                            <small className={`d-block text-end ${isMyMessage ? "text-white-50" : "text-muted"}`} style={{ fontSize: "10px" }}>
                                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </small>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={scrollRef} />
                        </div>

                        <div className="p-3 border-top mt-auto bg-white">
                            <form className="d-flex gap-2" onSubmit={handleSendMessage}>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Escribe un mensaje..."
                                />
                                <button className="btn btn-primary" type="submit">Enviar</button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="h-100 d-flex align-items-center justify-content-center text-center p-4">
                        <div className="text-muted">
                            <i className="far fa-comments fa-3x mb-3 d-block"></i>
                            {isClient ? "Contacta con una barbería para empezar" : "Selecciona una conversación para responder"}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};