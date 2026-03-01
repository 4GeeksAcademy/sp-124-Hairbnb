import React, { useState } from "react";
import "../styles/aboutus.css";

export const AboutUs = () => {
    window.scrollTo(0,0);
    const testimonials = [
        {
            quote: "Pasamos de perder 5 citas al día por no coger el teléfono, a tener la agenda llena con un mes de antelación. Hairbnb es el recepcionista que nunca duerme.",
            author: "Carlos 'Old School'",
            role: "Propietario de 'La Barbería de la Esquina'",
            tag: "Aumento de Ventas"
        },
        {
            quote: "Lo que más valoro es la sencillez. Mis clientes de toda la vida, señores de 60 años, han aprendido a reservar en segundos. Es intuitivo de verdad.",
            author: "Elena García",
            role: "Directora de Estética Avanzada",
            tag: "Usabilidad Top"
        },
        {
            quote: "Gestionar 4 locales desde una sola pantalla parecía imposible hasta que llegó Hairbnb. El control de analíticas es una joya para mi negocio.",
            author: "Javier M.",
            role: "CEO de 'Gentlemen's Club Group'",
            tag: "Gestión Multi-sede"
        },
        {
            quote: "Como barbero autónomo, Hairbnb me da la imagen profesional que necesito. Mis clientes reciben recordatorios por WhatsApp y eso reduce las faltas al 0%.",
            author: "Santi 'The Fade'",
            role: "Freelance Stylist",
            tag: "Cero Incomparecencias"
        },
        {
            quote: "El soporte técnico es humano y rápido. Se nota que entienden el día a día de una peluquería. No es solo software, es una alianza.",
            author: "Marta R.",
            role: "Fundadora de 'Organic Hair'",
            tag: "Atención 10/10"
        },
        {
            quote: "Integrar los pagos y las fianzas en la reserva nos ha ahorrado miles de euros en citas canceladas a última hora. Un cambio de juego total.",
            author: "Nacho P.",
            role: "Manager en 'Urban Cut'",
            tag: "Finanzas Bajo Control"
        }
    ];

    return (
        <div className="about-us-page">
            <section id="history-hero" className="about-history-hero d-flex align-items-center position-relative">
                <div className="hero-overlay"></div>
                <div className="container position-relative z-index-1 py-5">
                    <div className="row justify-content-center text-center">
                        <div className="col-lg-10">
                            <p className="text-gold text-uppercase fw-bold ls-3 mb-3 animate__animated animate__fadeInDown">
                                Nuestra Herencia
                            </p>
                            <h1 className="display-2 fw-bold Oswald text-white mb-4 animate__animated animate__fadeInUp">
                                DE LA LIBRETA DE <span className="text-gold">JULIÁN</span> <br />
                                A LA REVOLUCIÓN DIGITAL
                            </h1>

                            <div className="row justify-content-center mt-5">
                                <div className="col-md-4 mb-4">
                                    <div className="history-card p-4 border-gold-glow">
                                        <h4 className="text-gold Oswald">EL PASADO</h4>
                                        <p className="text-white-50">
                                            Una ajada libreta de papel, tachones y llamadas perdidas en una pequeña barbería de barrio.
                                        </p>
                                    </div>
                                </div>
                                <div className="col-md-4 mb-4">
                                    <div className="history-card p-4 border-gold-glow">
                                        <h4 className="text-gold Oswald">EL PRESENTE</h4>
                                        <p className="text-white-50">
                                            Tecnología de vanguardia que conserva la esencia del orden tradicional para el barbero moderno.
                                        </p>
                                    </div>
                                </div>
                                <div className="col-md-4 mb-4">
                                    <div className="history-card p-4 border-gold-glow">
                                        <h4 className="text-gold Oswald">EL FUTURO</h4>
                                        <p className="text-white-50">
                                            <strong>Hairbnb</strong>: la herramienta definitiva para que tú sólo tengas que ocuparte de quien está en el sillón.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <section id="history" className="about-story-section py-5 bg-white">
                <div className="container py-5">
                    <div className="row align-items-center">
                        <div className="col-lg-6">
                            <div className="about-img-wrap position-relative">
                                <div className="border-decoration-gold" />
                                <img
                                    src="https://media.revistagq.com/photos/5ca606182fe5b2144d1f9b77/master/w_1600%2Cc_limit/barberia_5889.jpg"
                                    alt="Barbería Tradicional"
                                    className="img-fluid position-relative z-index-1 shadow-lg"
                                />
                            </div>
                        </div>
                        <div className="col-lg-6 ps-lg-5 mt-5 mt-lg-0">
                            <p className="text-gold text-uppercase fw-bold ls-2">¿Quiénes somos?</p>
                            <h2 className="display-4 fw-bold mb-4 Oswald text-dark">TRES GENERACIONES ORGANIZANDO EL ESTILO</h2>
                            <p className="text-muted fs-5 mb-4">
                                Todo empezó con el <strong>Abuelo Julián</strong>. En su pequeña barbería, su bien más preciado no eran sus navajas, sino una ajada libreta de papel donde apuntaba cada cita a mano.
                            </p>
                            <p className="text-muted fs-5 mb-4">
                                Crecimos viendo cómo perdía horas entre tachones, llamadas interrumpidas y huecos vacíos. Por eso, nuestra primera misión fue crear organizadores físicos para barberos, pero pronto entendimos que la pasión necesitaba velocidad.
                            </p>
                            <p className="text-muted fs-5 mb-4">
                                <strong>Hairbnb</strong> es la evolución de esa libreta: hemos conservado la esencia del orden tradicional y la hemos potenciado con tecnología de vanguardia para que los artistas del cabello solo se preocupen de lo que pasa en el sillón.
                            </p>
                            <div className="about-sig h4 mt-4 Oswald text-dark">— El Equipo de Hairbnb</div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="press-section py-5 bg-white border-top border-bottom">
                <div className="container py-5">
                    <div className="text-center mb-5">
                        <p className="text-gold text-uppercase fw-bold ls-2">Reconocimiento Global</p>
                        <h2 className="display-4 fw-bold Oswald text-dark">VISTOS EN LAS MEJORES CABECERAS</h2>
                        <p className="lead mt-3" style={{ maxWidth: "650px", margin: "0 auto" }}>
                            Nuestra plataforma y visión han sido destacadas por líderes en estilo, tendencias y excelencia empresarial.
                        </p>
                    </div>

                    <div className="row align-items-center justify-content-center g-5 press-logo-grid">
                        <div className="col-6 col-md-3 text-center">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/f/f8/VOGUE_LOGO.svg" alt="Vogue Logo" className="press-logo img-fluid" />
                        </div>
                        <div className="col-6 col-md-3 text-center">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/GQ_Logo.svg/500px-GQ_Logo.svg.png" alt="GQ Logo" className="press-logo img-fluid" />
                        </div>
                        <div className="col-6 col-md-3 text-center">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/2/25/Esquire_logo_%282017%29.svg" alt="Esquire Logo" className="press-logo img-fluid" />
                        </div>
                        <div className="col-6 col-md-3 text-center">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Comopolitan_Magazine_Logo.svg/1280px-Comopolitan_Magazine_Logo.svg.png" alt="Cosmopolitan Logo" className="press-logo img-fluid" />
                        </div>
                        <div className="col-6 col-md-3 text-center">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Vanity_Fair_logo.svg/1280px-Vanity_Fair_logo.svg.png" alt="Vanity Fair Logo" className="press-logo img-fluid" />
                        </div>

                        <div className="col-6 col-md-3 text-center">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Forbes_logo.svg/1280px-Forbes_logo.svg.png" alt="Forbes Logo" className="press-logo img-fluid" />
                        </div>
                        <div className="col-6 col-md-3 text-center">
                            <img src="https://iconape.com/wp-content/files/vm/201472/svg/201472.svg" alt="Harper's Bazaar Logo" className="press-logo img-fluid" />
                        </div>
                        <div className="col-6 col-md-3 text-center">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Marie_Claire_Magazine_logo.svg/1280px-Marie_Claire_Magazine_logo.svg.png" alt="Marie Claire Logo" className="press-logo img-fluid" />
                        </div>
                    </div>
                </div>
            </section>

            <section className="testimonials-section py-5">
                <div className="container py-5">
                    <div className="text-center mb-5">
                        <p className="text-gold text-uppercase fw-bold ls-2">Comunidad Hairbnb</p>
                        <h2 className="display-4 fw-bold Oswald text-dark">VOCES QUE NOS ACOMPAÑAN</h2>
                        <p className="lead mt-3">Cientos de profesionales ya han dejado atrás la libreta de papel.</p>
                    </div>

                    <div className="row g-4">
                        {testimonials.map((t, idx) => (
                            <div key={idx} className="col-md-6 col-lg-4">
                                <div className="ambassador-card h-100 p-4 d-flex flex-column justify-content-between shadow-sm bg-white border-gold-top">
                                    <div>
                                        <span className="tag-badge mb-3">{t.tag}</span>
                                        <p className="fst-italic text-muted mb-4">"{t.quote}"</p>
                                    </div>
                                    <div className="mt-auto border-top pt-3">
                                        <div className="fw-bold text-dark Oswald">{t.author}</div>
                                        <div className="small text-muted">{t.role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};