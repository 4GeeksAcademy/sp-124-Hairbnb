import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import "../styles/Chatbot.css";

export const Chatbot = () => {
  const { store, dispatch } = useGlobalReducer();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [currentMenu, setCurrentMenu] = useState("inicio");
  const [messages, setMessages] = useState([]);
  const scrollRef = useRef(null);

useEffect(() => {
    if (isOpen) {
        setMessages([]); 
        iniciarChat();
    }
}, [store.token, store.role]);

const iniciarChat = () => {
    setIsTyping(true);
    setTimeout(() => {
        let saludo = "";
        let menuDestino = "inicio";

        if (store.token) {
            const nombre = store.username || "Usuario";
            saludo = `¡Genial! Ya te he reconocido, ${nombre}. Tienes perfil de ${store.role}. ¿Qué quieres gestionar?`;
            
            if (store.role === 'admin') menuDestino = "admin_menu";
            else if (store.role === 'owner') menuDestino = "owner_menu";
            else if (store.role === 'barber') menuDestino = "barber_menu";
            else menuDestino = "cliente_menu";
        } else {
            saludo = "¡Hola! Bienvenido a Hairbnb. No has iniciado sesión en nuestra plataforma";
            menuDestino = "inicio";
        }

        setMessages([{ role: 'assistant', content: saludo }]);
        setCurrentMenu(menuDestino);
        setIsTyping(false);
    }, 600);
};

  const menus = {
    inicio: {
      options: [
        { label: "Quiero registrarme", next: "registro_opciones" },
        { label: "Ir a iniciar sesión", next: "login_opciones" },
        { label: "¿Qué me ofrece Hairbnb?", next: "info"}
      ]
    },

    info: {
      intro: "Hairbnb es la plataforma líder en gestión de barberías. Conectamos a los mejores profesionales con clientes que buscan un estilo impecable. ¿Qué perfil te interesa conocer?",
      options: [
        { label: "Soy cliente", resp: "Como cliente podrás descubrir barberías cerca de ti, ver los trabajos de cada barbero y reservar tu cita en segundos sin llamadas.", next: "info_acciones" },
        { label: "Soy profesional", resp: "Si eres barbero o dueño, te ofrecemos herramientas para gestionar tu agenda, servicios, empleados y aumentar tu visibilidad.", next: "info_acciones" },
        { label: "Volver", next: "inicio" }
      ]
    },

    info_acciones: {
      intro: "¿Te gustaría empezar ahora mismo?",
      options: [
        { label: "¡Quiero registrarme!", next: "registro_opciones" },
        { label: "Ya tengo cuenta, vamos a iniciar sesión", next: "login_opciones" },
        { label: "Solo quiero mirar barberías", action: () => navigate("/asociates") },
        { label: "Volver", next: "inicio" }
      ]
    },

    login_opciones: {
        intro: "Selecciona tu portal de acceso:",
        options: [
            { label: "Soy cliente", action: () => navigate("/login/client") },
            { label: "Soy barbero", action: () => navigate("/login/barber") },
            { label: "Soy dueño", action: () => navigate("/login/owner") },
            { label: "Volver", next: "inicio" }
        ]
    },

    registro_opciones: {
      intro: "¿Qué tipo de cuenta quieres crear?",
      options: [
        { label: "Cliente", action: () => navigate("/signup/client") },
        { label: "Barbero", action: () => navigate("/signup/barber") },
        { label: "Dueño de local", action: () => navigate("/signup/owner") },
        { label: "Volver", next: "inicio" }
      ]
    },

    cliente_menu: {
      intro: "Acceso rápido para clientes:",
      options: [
        { label: "Mi Perfil", action: () => navigate("/private/client") },
        { label: "Nueva Cita", action: () => navigate("/client_appointment_form") },
        { label: "Cerrar Sesión", action: () => handleLogout() }
      ]
    },

    owner_menu: {
      intro: "Panel de Dueño:",
      options: [
        { label: "Panel Principal", action: () => navigate("/private/owner") },
        { label: "Gestionar Negocio", action: () => navigate("/private/owner/gestion") },
        { label: "Añadir Barbería", action: () => navigate("/barbershops_form") },
        { label: "Cerrar Sesión", action: () => handleLogout() }
      ]
    },

    barber_menu: {
      intro: "Panel Profesional:",
      options: [
        { label: "Mi Agenda", action: () => navigate("/private/barber") },
        { label: "Configurar Horarios", action: () => navigate("/schedules_form") },
        { label: "Añadir Servicio", action: () => navigate("/barber_services_form") },
        { label: "Cerrar Sesión", action: () => handleLogout() }
      ]
    },

    admin_menu: {
        intro: "Opciones de administrador:",
        options: [
            { label: "Ir a la página principal", action: () => navigate("/4dm1n1str4t10n") },
            { label: "Cerrar Sesión", action: () => handleLogout() }
        ]
    }
  };

  const handleLogout = () => {
    dispatch({ type: "logout" });
    setMessages(prev => [...prev, { role: 'assistant', content: "Sesión cerrada. ¡Hasta pronto!" }]);
    setCurrentMenu("inicio");
  };

  const handleOptionClick = (opcion) => {
    if (opcion.action) {
      opcion.action();
      setIsOpen(false);
      return;
    }

    const isBack = opcion.label.toLowerCase().includes("volver");
    if (!isBack) setMessages(prev => [...prev, { role: 'user', content: opcion.label }]);

    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      let botResponse = opcion.resp || menus[opcion.next]?.intro;
      if (botResponse) setMessages(prev => [...prev, { role: 'assistant', content: botResponse }]);
      setCurrentMenu(opcion.next);
    }, 600);
  };

  return (
    <div className={`chat-wrapper ${isOpen ? 'open' : ''}`}>
      <button className="chat-toggle" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <i className="fa-solid fa-xmark"></i> : <i className="fa-solid fa-scissors"></i>}
      </button>

      {isOpen && (
        <div className="chat-window">
          <div className="chat-header p-3 d-flex justify-content-between align-items-center">
            <span>ChatBnb</span>
          </div>

          <div className="chat-body p-3 bg-white" ref={scrollRef} style={{ height: "320px", overflowY: "auto" }}>
            {messages.map((msg, i) => (
              <div key={i} className={`d-flex mb-3 ${msg.role === 'user' ? 'justify-content-end' : 'justify-content-start'}`}>
                <div className={`p-2 px-3 rounded-3 shadow-sm ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-light border text-dark'}`} style={{ maxWidth: "85%", fontSize: "0.85rem" }}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isTyping && <div className="text-muted small mb-2 text-center">Analizando solicitud...</div>}
          </div>

          <div className="chat-footer p-3 bg-light border-top">
            <div className="d-flex flex-wrap gap-2">
              {!isTyping && menus[currentMenu]?.options.map((opt, index) => (
                <button
                  key={index}
                  className="btn btn-sm btn-outline-dark bg-white shadow-sm"
                  onClick={() => handleOptionClick(opt)}
                  style={{ borderRadius: '15px' }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};