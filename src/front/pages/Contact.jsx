import React, { useState } from "react";
import "../styles/contact.css";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const Contact = () => {
    window.scrollTo(0, 0);
    const { dispatch } = useGlobalReducer();
    const [sending, setSending] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSending(true);

        const form = e.target;
        const data = new FormData(form);

        try {
            const response = await fetch("https://formspree.io/f/mreawjrd", {
                method: "POST",
                body: data,
                headers: { Accept: "application/json" },
            });

            if (response.ok) {
                dispatch({ type: "set-message", payload: { type: "success", msg: "El mensaje se ha enviado a nuestras oficinas centrales." } });
                form.reset();
            } else {
                dispatch({ type: "set-message", payload: { type: "error", msg: "Error al enviar el mensaje. Inténtalo de nuevo." } });
            }
        } catch {
            dispatch({ type: "set-message", payload: { type: "error", msg: "Error de conexión con el servidor." } });
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="contact-page-container bg-white">
            <div className="contact-hero-section Oswald">
                <div className="container text-center py-1">
                    <h1 className="display-4 fw-bold text-white">CONTACTO</h1>
                    <p className="text-gold ls-2 text-uppercase">¿Hablamos de negocios?</p>
                </div>
            </div>

            <section className="py-5 mt-4">
                <div className="container">
                    <div className="row g-5">
                        <div className="col-lg-8">
                            <div className="contact-form-card p-4 p-md-5">
                                <h2 className="Oswald mb-4 text-dark">ENVÍANOS UN MENSAJE</h2>

                                <form onSubmit={handleSubmit}>
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="contact-form-group">
                                                <label>Nombre Completo</label>
                                                <input name="nombre" type="text" className="contact-input" placeholder="Ej: Julián Barber" required />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="contact-form-group">
                                                <label>Correo Electrónico</label>
                                                <input name="email" type="email" className="contact-input" placeholder="tu@email.com" required />
                                            </div>
                                        </div>
                                        <div className="col-12">
                                            <div className="contact-form-group">
                                                <label>Asunto</label>
                                                <input name="asunto" type="text" className="contact-input" placeholder="¿En qué podemos ayudarte?" required />
                                            </div>
                                        </div>
                                        <div className="col-12">
                                            <div className="contact-form-group">
                                                <label>Mensaje</label>
                                                <textarea name="mensaje" className="contact-input" rows="6" placeholder="Escribe aquí tu consulta detallada..."></textarea>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        className="btn-contact-submit mt-3"
                                        disabled={sending}
                                    >
                                        {sending ? "ENVIANDO..." : "ENVIAR MENSAJE"}
                                    </button>
                                </form>
                            </div>
                        </div>

                        <div className="col-lg-4">
                            <div className="info-sidebar-container">
                                <div className="info-card-sidebar">
                                    <i className="ti-location-pin"></i>
                                    <h3 className="Oswald h5">DIRECCIÓN</h3>
                                    <p className="text-muted">Calle de la Navaja 13<br />28004, Madrid, España</p>
                                </div>
                                <div className="info-card-sidebar">
                                    <i className="ti-headphone-alt"></i>
                                    <h3 className="Oswald h5">TELÉFONO</h3>
                                    <p className="text-muted">+34 912 345 678<br />Lunes a Viernes: 9:00 - 20:00</p>
                                </div>
                                <div className="info-card-sidebar">
                                    <i className="ti-email"></i>
                                    <h3 className="Oswald h5">EMAIL</h3>
                                    <p className="text-muted">info@hairbnb.com</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};