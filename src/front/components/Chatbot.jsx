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
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen) {
      iniciarChat();
    }
  }, [isOpen, store.token, store.role]);

  const iniciarChat = () => {
    setIsTyping(true);
    setMessages([]);

    setTimeout(() => {
      let saludo = "";
      let menuDestino = "inicio";

      const rolesEspanol = {
        admin: "administrador",
        owner: "dueño de local",
        barber: "barbero profesional",
        client: "cliente"
      };

      if (store.token) {

        const nombreLimpio = store.username
          ? store.username.split('@')[0]
          : "Usuario";

        const nombreFormateado = nombreLimpio.charAt(0).toUpperCase() + nombreLimpio.slice(1);

        const rolTraducido = rolesEspanol[store.role] || "Usuario";

        saludo = `¡Hola de nuevo ${nombreFormateado}! ¿Qué quieres gestionar desde tu cuenta de ${rolTraducido}?`;

        if (store.role === 'admin') menuDestino = "admin_menu";
        else if (store.role === 'owner') menuDestino = "owner_menu";
        else if (store.role === 'barber') menuDestino = "barber_menu";
        else menuDestino = "cliente_menu";

      } else {
        saludo = "¡Hola! Bienvenido a Hairbnb. Parece que no has iniciado sesión en nuestra plataforma.";
        menuDestino = "inicio";
      }

      setMessages([{ role: 'assistant', content: saludo }]);
      setCurrentMenu(menuDestino);
      setIsTyping(false);
    }, 800);
  };

  const menus = {
    inicio: {
      options: [
        { label: "Quiero registrarme", next: "registro_opciones" },
        { label: "Ir a iniciar sesión", next: "login_opciones" },
        { label: "¿Qué me ofrece Hairbnb?", next: "info" }
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
    setIsOpen(false);
    navigate("/");
  };

  const handleOptionClick = (opcion) => {
    if (opcion.action) {
      opcion.action();

      if (opcion.label !== "Cerrar Sesión") setIsOpen(false);
      return;
    }

    const isBack = opcion.label.toLowerCase().includes("volver");
    if (!isBack) {
      setMessages(prev => [...prev, { role: 'user', content: opcion.label }]);
    }

    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      let botResponse = opcion.resp || menus[opcion.next]?.intro;

      if (botResponse) {
        setMessages(prev => [...prev, { role: 'assistant', content: botResponse }]);
      }
      setCurrentMenu(opcion.next);
    }, 600);
  };

  return (
    <div className={`chat-wrapper ${isOpen ? 'open' : ''}`}>
      <button className="chat-toggle" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <i className="fa-solid fa-xmark"></i> : <i className="fa-solid fa-scissors"></i>}
      </button>

      {isOpen && (
        <div className="chat-window shadow-lg">
          <div className="chat-header d-flex justify-content-between align-items-center">
            <span className="text-gold fw-bold">
              <i className="fa-solid fa-robot me-2"></i>HairBot
            </span>
            <button className="btn btn-sm text-white-50 p-0" onClick={() => setIsOpen(false)}>
              <i className="fa-solid fa-minus"></i>
            </button>
          </div>

          <div className="chat-body" ref={scrollRef} style={{ height: "350px", overflowY: "auto" }}>
            {messages.map((msg, i) => (
              <div key={i} className={`d-flex ${msg.role === 'user' ? 'justify-content-end' : 'justify-content-start'}`}>
                <div className={`msg-bubble ${msg.role === 'user' ? 'user' : 'assistant shadow-sm'}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="d-flex justify-content-start">
                <div className="typing-indicator">
                  <span className="spinner-grow spinner-grow-sm me-2" style={{ backgroundColor: "#d19f68" }}></span>
                  Afilando tijeras...
                </div>
              </div>
            )}
          </div>

          <div className="chat-footer">
            <div className="d-flex flex-wrap gap-2 justify-content-center">
              {!isTyping && menus[currentMenu]?.options.map((opt, index) => (
                <button
                  key={index}
                  className="chat-option-btn"
                  onClick={() => handleOptionClick(opt)}
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
}