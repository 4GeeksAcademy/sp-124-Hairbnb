import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const Navbar = () => {
    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();

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

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light px-3 shadow-sm">
            <div className="container-fluid">
                <Link to="/" className="navbar-brand">
                    <img src="/Logo-HBNB-completo.png" alt="Hairbnb" width="120" />
                </Link>

                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarSupportedContent"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul className="navbar-nav ms-auto mb-2 mb-lg-0 align-items-center">
                        <li className="nav-item">
                            <Link className="nav-link" to="/">Inicio</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/asociates">Nuestros asociados</Link>
                        </li>

                        {store.token == "client" && (
                            <li className="nav-item">
                                <Link
                                    className="nav-link d-flex align-items-center"
                                    to="/private/client"
                                    state={{ activeTab: "messages" }}
                                >

                                    Mensajes
                                    {store.hasNewMessages && (
                                        <span className="badge rounded-pill bg-danger ms-1" style={{ fontSize: "0.5rem" }}>
                                            ●
                                        </span>
                                    )}
                                </Link>
                            </li>
                        )}
                        {!store.token ? (
                            <>
                                <li className="nav-item dropdown">
                                    <Link className="nav-link dropdown-toggle" to="#" role="button" data-bs-toggle="dropdown">
                                        Crear cuenta
                                    </Link>
                                    <ul className="dropdown-menu dropdown-menu-end shadow">
                                        <li><Link className="dropdown-item" to="/signup/client">Como cliente</Link></li>
                                        <li><Link className="dropdown-item" to="/signup/barber">Como profesional</Link></li>
                                        <li><Link className="dropdown-item" to="/signup/owner">Como dueño</Link></li>
                                    </ul>
                                </li>
                                <li className="nav-item dropdown">
                                    <Link className="nav-link dropdown-toggle" to="#" role="button" data-bs-toggle="dropdown">
                                        Inicia sesión
                                    </Link>
                                    <ul className="dropdown-menu dropdown-menu-end">
                                        <li><Link className="dropdown-item" to="/login/client">Soy cliente</Link></li>
                                        <li><Link className="dropdown-item" to="/login/barber">Soy barbero</Link></li>
                                        <li><Link className="dropdown-item" to="/login/owner">Soy dueño</Link></li>
                                    </ul>
                                </li>
                            </>
                        ) : (
                            <li className="nav-item dropdown">
                                <Link className="nav-link dropdown-toggle" to="#" role="button" data-bs-toggle="dropdown">
                                    Hola, {store.userInfo?.name || "Administrador"}
                                </Link>
                                <ul className="dropdown-menu dropdown-menu-end shadow">
                                    <li>
                                        <Link className="dropdown-item" to={
                                            store.role === "owner" ? "/private/owner" :
                                                store.role === "barber" ? "/private/barber" : 
                                                    store.role === "client" ? "/private/client" : 
                                                        "/4dm1n1str4t10n"
                                        }>
                                            Panel principal
                                        </Link>
                                    </li>
                                    <li>
                                        <button className="dropdown-item" onClick={handleEditProfile}>
                                            Editar perfil
                                        </button>
                                    </li>
                                    <li><hr className="dropdown-divider" /></li>
                                    <li>
                                        <button className="dropdown-item text-danger" onClick={handleLogout}>
                                            Cerrar sesión
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