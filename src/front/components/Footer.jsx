import React from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import "../styles/footer.css";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const Footer = () => {
    const navigate = useNavigate();
    const { store, dispatch } = useGlobalReducer();

    const handleSubmit = (e) => {
        dispatch({
            type: "set-message",
            payload: {
                type: "success",
                msg: "Como te decíamos, no pasará absolutamente nada"
            }
        });
    };

    return (
        <footer className="hairbnb-footer">
            <div className="container">
                <div className="row py-5">
                    <div className="col-lg-3 col-md-6 mb-4 mb-lg-0">
                        <div className="d-flex align-items-center mb-3">
                            <img src="/Logo.png" alt="Logo" width="40" className="me-2 logo-gold" />
                            <h4 className="hairbnb-brand text-gold mb-0">HAIRBNB</h4>
                        </div>
                        <p className="footer-text mb-4">
                            Este sitio es el proyecto final realizado para el Bootcamp Full-Stack Software Developer de <strong>4Geeks Academy</strong>. Marzo de 2026.
                        </p>
                        <div className="contact-info">
                            <h5 className="text-white fw-bold mb-1">+34 987 65 43 21</h5>
                            <p className="text-muted text-gold small">hairbnb@gmail.com</p>
                        </div>
                    </div>

                    <div className="col-lg-2 col-md-6 mb-4 mb-lg-0 ps-lg-5">
                        <h5 className="footer-title">UBICACIÓN</h5>
                        <ul className="footer-links">
                            <li><Link>Madrid</Link></li>
                            <li><Link>Barcelona</Link></li>
                            <li><Link>Valencia</Link></li>
                            <li><Link>Sevilla</Link></li>
                        </ul>
                    </div>

                    <div className="col-lg-2 col-md-6 mb-4 mb-lg-0">
                        <h5 className="footer-title">EXPLORA</h5>
                        <ul className="footer-links">
                            <li><Link to="/aboutus">Sobre nosotros</Link></li>
                            <li><Link to="/services">Servicios</Link></li>
                            <li><Link to="/asociates">Asociados</Link></li>
                            <li><Link to="/contact">Contacto</Link></li>
                        </ul>
                    </div>

                    <div className="col-lg-5 col-md-6">
                        <h5 className="footer-title">SUSCRÍBETE</h5>
                        <p className="footer-text mb-4">Suscríbete ahora y no pasará absolutamente nada.</p>
                        <div className="footer-newsletter">
                            <input type="email" placeholder="Dirección de correo electrónico" />
                            <button type="button" onClick={handleSubmit}>ENVIAR</button>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom py-4">
                    <div className="row align-items-center">
                        <div className="text-center">
                            <p className="mb-0 small text-gold">
                                Copyright ©2026 Todos los derechos reservados | Hecho por <a href="https://github.com/ssantv" target="_blank" className="text-gold">Sandra Santos</a>
                            </p>
                        </div>
                        <div className="text-center mt-3 mt-2 mb-5">
                            <div className="footer-social">
                                <a href="https://www.linkedin.com/in/sandra-santos-valderrey/" target="_blank"><i className="fa-brands fa-linkedin fa-2xl"></i></a>
                                <a href="https://github.com/ssantv" target="_blank"><i className="fa-brands fa-github fa-2xl"></i></a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};