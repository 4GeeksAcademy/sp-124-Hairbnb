import React, { useState, useEffect, useRef } from 'react';
import "../styles/Chatbot.css";

export const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [currentMenu, setCurrentMenu] = useState("inicio");
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '¡Hola! Bienvenido a Hairbnb. Para ayudarte mejor, dime: ¿Cuál es tu perfil?' }
  ]);
  const scrollRef = useRef(null);

  const menus = {
    inicio: {
      intro: "¡Hola! Es un placer saludarte. Para empezar, dime: ¿cuál es tu perfil en Hairbnb?",
      options: [
        { label: "Aún no estoy registrado", next: "sin_cuenta" },
        { label: "Ya tengo mi cuenta", next: "con_cuenta" }
      ]
    },

    sin_cuenta: {
      intro:"Prueba a registrarte y descubrir todo lo que Hairbnb puede hacer por tí. ¿Cuál es tu perfil?",
      options: [
        { label: "Soy cliente", next: "cliente_menu" },
        { label: "Soy dueño", next: "owner_menu" },
        { label: "Soy barbero", next: "barber_menu" }
      ]
    },

    con_cuenta: {
      intro:"Tener una cuenta es la mejor decisión. Dime, ¿cuál es tu perfil?",
      options: [
        { label: "Soy cliente", next: "cliente_menu" },
        { label: "Soy dueño", next: "owner_menu" },
        { label: "Soy barbero", next: "barber_menu" }
      ]
    },

    cliente_menu: {
      intro: "¡Genial! Como cliente tienes todo a mano. ¿En qué puedo ayudarte hoy?",
      options: [
        { label: "Reservar una cita", next: "cliente_reservar" },
        { label: "Buscar barberías", next: "cliente_barberias" },
        { label: "Mi cuenta", next: "cliente_cuenta" },
        { label: "Volver al inicio", next: "inicio" }
      ]
    },
    cliente_reservar: {
      intro: "Reservar es muy sencillo, pero entiendo que puedan surgir dudas. ¿Qué necesitas saber?",
      options: [
        {
          label: "¿Cómo reservo?",
          resp: "Es fácil: elige la barbería, selecciona a tu barbero y el servicio. Confirmas la hora y ¡listo!",
          next: "cliente_menu"
        },
        {
          label: "Cambiar o cancelar",
          resp: "No te preocupes. En tu perfil, dentro de 'Mis Citas', puedes modificar o cancelar cualquier reserva.",
          next: "cliente_menu"
        },
        { label: "Volver", next: "cliente_menu" }
      ]
    },
    cliente_barberias: {
      intro: "Tenemos barberías increíbles. ¿Cómo quieres encontrar la tuya?",
      options: [
        {
          label: "Ver el mapa",
          resp: "En la sección 'Nuestros asociados' tienes un mapa con todos ellos. ¡Seguro que hay uno cerca de ti!",
          next: "cliente_menu"
        },
        {
          label: "Precios y servicios",
          resp: "Cada barbería tiene sus propios precios. Los verás detallados al reservar.",
          next: "cliente_menu"
        },
        { label: "Volver", next: "cliente_menu" }
      ]
    },

    owner_menu: {
      intro: "Hola. Aquí tienes las herramientas para gestionar tu negocio. ¿Qué área quieres revisar?",
      options: [
        { label: "Mis barberías", next: "owner_sedes" },
        { label: "Mi equipo", next: "owner_barberos" },
        { label: "Reservas", next: "owner_reservas" },
        { label: "Volver al inicio", next: "inicio" }
      ]
    },
    owner_sedes: {
      intro: "Tener tus sedes actualizadas es clave. ¿Qué quieres hacer?",
      options: [
        {
          label: "Añadir sede",
          resp: "Usa el botón 'Nueva barbería' en tu panel de control. Solo rellena los datos y aparecerás en el mapa.",
          next: "owner_menu"
        },
        {
          label: "Editar información",
          resp: "Puedes cambiar fotos, horarios o teléfonos entrando en la ficha de cada sede desde tu panel.",
          next: "owner_menu"
        },
        { label: "Volver", next: "owner_menu" }
      ]
    },

    barber_menu: {
      intro: "¡Hola! Vamos a dejar tu perfil a punto. ¿Qué quieres configurar ahora?",
      options: [
        { label: "Mis horarios", next: "barber_horarios" },
        { label: "Mis servicios", next: "barber_servicios" },
        { label: "Volver al inicio", next: "inicio" }
      ]
    },
    barber_horarios: {
      intro: "Organizar bien tu tiempo es fundamental. ¿Cómo te ayudo con tu agenda?",
      options: [
        {
          label: "Configurar mi jornada",
          resp: "Puedes poner tus horas de entrada, salida y descansos para cada día desde tu perfil profesional.",
          next: "barber_menu"
        },
        {
          label: "Días libres",
          resp: "Marca tus vacaciones o días libres en el calendario para que nadie pueda reservarte esas fechas.",
          next: "barber_menu"
        },
        { label: "Volver", next: "barber_menu" }
      ]
    },
    barber_servicios: {
      intro: "Tus servicios son lo que te define. ¿Quieres hacer algún cambio?",
      options: [
        {
          label: "Precios y tiempos",
          resp: "Entra en 'Servicios' para ajustar cuánto cobras y cuánto tardas en cada trabajo. Se actualizará al instante.",
          next: "barber_menu"
        },
        { label: "Volver", next: "barber_menu" }
      ]
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, isOpen]);

  const handleOptionClick = (opcion) => {
    const isBackOption = opcion.label.toLowerCase().includes("volver");

    if (!isBackOption) {
      setMessages(prev => [...prev, { role: 'user', content: opcion.label }]);
    }

    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      let botResponse = "";
      const nextMenuData = menus[opcion.next];

      if (opcion.resp) {
        botResponse = opcion.resp;
      } else if (nextMenuData) {
        botResponse = nextMenuData.intro;
      }

      if (botResponse) {
        setMessages(prev => [...prev, { role: 'assistant', content: botResponse }]);
      }

      setCurrentMenu(opcion.next);
    }, 600);
  };

  return (
    <div className={`chat-wrapper ${isOpen ? 'open' : ''}`}>
      <button className="chat-toggle shadow-lg" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <i className="fa-solid fa-xmark"></i> : <i className="fa-solid fa-scissors"></i>}
      </button>

      {isOpen && (
        <div className="chat-window border-0 shadow-lg">
          <div className="chat-header bg-dark text-white p-3">
            <span>Hairbnb Assistant</span>
          </div>

          <div className="chat-body p-3 bg-white" ref={scrollRef} style={{ height: "280px", overflowY: "auto" }}>
            {messages.map((msg, i) => (
              <div key={i} className={`msg-bubble shadow-sm mb-2 ${msg.role === 'user' ? 'bg-outline-primary ms-auto' : 'bg-light text-dark me-auto border'}`}>
                {msg.content}
              </div>
            ))}
            {isTyping && (
              <div className="text-muted small mb-2">Escribiendo...</div>
            )}
          </div>

          <div className="chat-footer p-3 bg-light border-top">
            <div className="d-flex flex-column gap-2">
              {!isTyping && menus[currentMenu].options.map((opt, index) => (
                <button
                  key={index}
                  className="btn btn-sm btn-white border shadow-sm text-start"
                  onClick={() => handleOptionClick(opt)}
                  style={{ borderRadius: '10px' }}
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