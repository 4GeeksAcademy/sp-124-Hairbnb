import { Link, useNavigate, useLocation } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import "../styles/navbar.css";
import { HashLink } from "react-router-hash-link";
import { useState, useEffect } from "react";


export const Navbar = () => {
    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();
    const [isScrolled, setIsScrolled] = useState(false);
    const location = useLocation();
    const isHomePage = location.pathname === "/";

    const getDashboardRoute = () => {
        if (store.role === "client") return "/private/client";
        if (store.role === "barber") return "/private/barber";
        if (store.role === "owner") return "/private/owner";
        return "/4dm1n1str4t10n";
    };

    const handleEditProfile = () => {
        if (store.role === "barber") navigate("/signup/barber");
        else if (store.role === "owner") navigate("/signup/owner");
        else navigate("/signup/client");
    };

    const handleLogout = () => {
        const confirmar = window.confirm("¿De verdad quieres cerrar sesión?");
        if (!confirmar) return;

        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("userInfo");

        dispatch({ type: "logout" });
        dispatch({
            type: "set-message",
            payload: { type: "success", msg: "Has cerrado sesión correctamente" }
        });

        navigate("/");
    };

    useEffect(() => {
        const handleScroll = () => {
            const offset = window.scrollY;
            if (offset > 50) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navbarClass = (location.pathname !== "/") 
    ? "navbar-scrolled" 
    : (isScrolled ? "navbar-scrolled" : "navbar-transparent");

    return (
        <nav className={`navbar navbar-expand-lg navbar-dark hairbnb-navbar fixed-top ${navbarClass}`}>
            <div className="container">
                <Link to="/" className="navbar-brand d-flex align-items-center">
                    <img src="/Logo.png" alt="Logo" width="50" className="me-2 logo-gold" />
                    <span className="hairbnb-brand">HAIRBNB</span>
                </Link>

                <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navHairbnb">
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navHairbnb">
                    <ul className="navbar-nav ms-auto align-items-center">
                        <li className="nav-item">
                            <Link className="nav-link hairbnb-nav-link" to="/">Inicio</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link hairbnb-nav-link" to="/asociates">Asociados</Link>
                        </li>

                        {!store.token ? (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link hairbnb-nav-link" to="/aboutus">
                                        Sobre nosotros
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link hairbnb-nav-link" to="/services">
                                        Servicios
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link hairbnb-nav-link" to="/contact">
                                        Contacto
                                    </Link>
                                </li>

                                <li className="nav-item dropdown">
                                    <Link className="nav-link hairbnb-nav-link dropdown-toggle" to="#" role="button" data-bs-toggle="dropdown">
                                        Iniciar Sesión
                                    </Link>
                                    <ul className="dropdown-menu dropdown-menu-end hairbnb-dropdown shadow">
                                        <li><Link className="dropdown-item hairbnb-dropdown-item" to="/login/client">Soy cliente</Link></li>
                                        <li><Link className="dropdown-item hairbnb-dropdown-item" to="/login/barber">Soy profesional</Link></li>
                                        <li><Link className="dropdown-item hairbnb-dropdown-item" to="/login/owner">Soy dueño</Link></li>
                                    </ul>
                                </li>
                                <li className="nav-item">
                                    <HashLink
                                        smooth
                                        to="/#community"
                                        className="nav-link hairbnb-btn px-4"
                                    >
                                        ÚNETE AHORA
                                    </HashLink>
                                </li>
                            </>
                        ) : (
                            <li className="nav-item dropdown ms-lg-3">
                                <Link className="nav-link hairbnb-nav-link dropdown-toggle" to="#" role="button" data-bs-toggle="dropdown">
                                    HOLA, {store.userInfo?.name?.toUpperCase() || "USER"}
                                </Link>
                                <ul className="dropdown-menu dropdown-menu-end hairbnb-dropdown shadow">
                                    <li>
                                        <Link className="dropdown-item hairbnb-dropdown-item" to={getDashboardRoute()}>
                                            Panel principal
                                        </Link>
                                    </li>
                                    <li><hr className="dropdown-divider bg-secondary opacity-25" /></li>
                                    <li>
                                        <button className="dropdown-item hairbnb-dropdown-item" onClick={handleEditProfile}>
                                            <i className="bi bi-person-circle me-2"></i>Ver mi perfil
                                        </button>
                                    </li>
                                    <li><hr className="dropdown-divider bg-secondary opacity-25" /></li>
                                    <li>
                                        <button className="dropdown-item hairbnb-dropdown-item text-danger fw-bold" onClick={handleLogout}>
                                            <i className="bi bi-box-arrow-right me-2"></i>Cerrar Sesión
                                        </button>
                                    </li>
                                </ul>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
};