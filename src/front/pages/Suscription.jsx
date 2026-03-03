import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const Subscription = () => {
    const { store, dispatch } = useGlobalReducer();
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState("pricing");
    const sessionId = searchParams.get("session_id");
    const navigate = useNavigate();

    useEffect(() => {
        if (sessionId) verifyPayment();
    }, [sessionId]);

    const verifyPayment = async () => {
        setStatus("processing");
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/activate-subscription`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${store.token || localStorage.getItem("token")}`
                },
                body: JSON.stringify({ session_id: sessionId })
            });
            const data = await response.json();
            if (data.active_subscription) setStatus("success");
            else {
                setStatus("pricing");
                dispatch({ type: "set-message", payload: { type: "error", msg: "Error al validar el pago" } });
            }
        } catch (error) {
            setStatus("pricing");
            dispatch({ type: "set-message", payload: { type: "error", msg: "Error de conexión al validar el pago" } });
        }
    };

    const handleSubscribe = async (plan) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/create-checkout-session`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${store.token || localStorage.getItem("token")}`
                },
                body: JSON.stringify({ plan })
            });
            const data = await response.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                dispatch({ type: "set-message", payload: { type: "error", msg: "No se pudo iniciar el proceso de pago" } });
            }
        } catch (error) {
            dispatch({ type: "set-message", payload: { type: "error", msg: "Error de conexión con el servidor de pagos" } });
        }
    };

    return (
        <div className="container py-5">
            {status === "pricing" && (
                <div className="animate__animated animate__fadeIn">
                    <div className="text-center mb-5">
                        <h1 className="Oswald display-4 fw-bold text-uppercase">Planes Hairbnb</h1>
                        <p className="text-muted Oswald fw-light">Acceso total a todas las herramientas. Solo tú eliges cuánto quieres ahorrar.</p>
                        <div className="mt-2 mx-auto" style={{ width: '60px', height: '3px', background: '#d19f68' }}></div>
                    </div>

                    <div className="row g-4 mb-5 justify-content-center">
                        <div className="col-lg-4 col-md-6">
                            <div className="booking-card h-100 p-4 text-center border-0 shadow-sm">
                                <h3 className="Oswald text-uppercase">MES A MES</h3>
                                <div className="py-4">
                                    <span className="display-4 Oswald fw-bold">29€</span>
                                    <p className="text-muted Oswald small mb-0">Pago recurrente mensual</p>
                                </div>
                                <p className="Oswald small text-muted mb-4">Para los que quieren probar el sistema sin compromiso a largo plazo.</p>
                                <button onClick={() => handleSubscribe("mensual")} className="btn-confirm w-100">SUSCRIBIRME</button>
                            </div>
                        </div>

                        <div className="col-lg-4 col-md-6">
                            <div className="booking-card h-100 p-4 text-center border-gold shadow" style={{ transform: 'scale(1.05)', zIndex: 1 }}>
                                <div className="badge bg-gold text-dark Oswald mb-3">EL MÁS BUSCADO</div>
                                <h3 className="Oswald text-uppercase">Trimestral</h3>
                                <div className="py-4">
                                    <span className="display-4 Oswald fw-bold">69€</span>
                                    <p className="text-gold Oswald fw-bold mb-0">23€ / MES</p>
                                </div>
                                <p className="Oswald small text-muted mb-4">Ahorras <span className="text-dark fw-bold">18€ cada tres meses</span> comparado con el plan mensual.</p>
                                <button onClick={() => handleSubscribe("trimestral")} className="btn-confirm w-100">SUSCRIBIRME Y AHORRAR</button>
                            </div>
                        </div>

                        <div className="col-lg-4 col-md-6">
                            <div className="booking-card h-100 p-4 text-center border-0 shadow-sm">
                                <h3 className="Oswald text-uppercase">Anual</h3>
                                <div className="py-4">
                                    <span className="display-4 Oswald fw-bold">219€</span>
                                    <p className="text-gold Oswald fw-bold mb-0">18,25€ / MES</p>
                                </div>
                                <p className="Oswald small text-muted mb-4">La mejor inversión. Ahorras <span className="text-dark fw-bold">129€ al año</span> (casi 4 meses gratis).</p>
                                <button onClick={() => handleSubscribe("anual")} className="btn-confirm w-100">QUIERO EL MÁXIMO AHORRO</button>
                            </div>
                        </div>
                    </div>

                    <div className="row justify-content-center">
                        <div className="col-lg-8">
                            <div className="booking-card p-4 shadow-sm border-0">
                                <h4 className="Oswald text-center mb-4 text-uppercase">Tu suscripción incluye en todos los planes:</h4>
                                <div className="row g-3">
                                    {[
                                        "Gestión completa de Barberías",
                                        "Alta y edición de Servicios",
                                        "Gestión de Invitaciones a Barberos",
                                        "Control de Horarios y Turnos",
                                        "Perfil Público de Reserva",
                                        "Soporte técnico Hairbnb"
                                    ].map((item, idx) => (
                                        <div key={idx} className="col-md-6">
                                            <div className="d-flex align-items-center p-2">
                                                <i className="fa-solid fa-circle-check text-gold me-3"></i>
                                                <span className="Oswald small text-uppercase">{item}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {status === "processing" && (
                <div className="text-center py-5">
                    <div className="spinner-gold mx-auto mb-4"></div>
                    <h2 className="Oswald text-uppercase">Procesando Pago</h2>
                    <p className="text-muted Oswald">Estamos validando tu sesión con Stripe...</p>
                </div>
            )}

            {status === "success" && (
                <div className="booking-card mx-auto overflow-hidden animate__animated animate__fadeInUp" style={{ maxWidth: '600px' }}>
                    <div className="booking-header text-center">
                        <h2 className="Oswald mb-0 text-uppercase fw-bold">¡Todo listo, Jefe!</h2>
                    </div>
                    <div className="p-5 text-center">
                        <div className="mb-4">
                            <i className="fa-solid fa-check-circle fa-5x text-gold"></i>
                        </div>
                        <p className="Oswald text-muted text-uppercase small ls-2">Tu suscripción se ha activado correctamente.</p>
                        <p className="Oswald">Ya tienes acceso ilimitado a todas las herramientas de gestión de Hairbnb.</p>
                        <button onClick={() => navigate("/private/owner")} className="btn-confirm w-100 mt-4">
                            IR A MI PANEL DE CONTROL
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};