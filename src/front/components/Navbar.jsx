import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";


export const Navbar = () => {

    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();

    const handleLogout = () => {
        const confirmar = window.confirm("¿De verdad quieres cerrar sesión?");
        if (!confirmar) return;
        dispatch({ type: "login", payload: { token: null, username: null, role: null } });
        navigate("/");
    }
    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light px-3">
            <div className="container-fluid">

                <Link to="/" className="navbar-brand">
                    <img
                        src="/Logo-HBNB-completo.png"
                        alt="Hairbnb"
                        width="120"
                    />
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
                    <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
                        <li className="nav-item">
                            <Link className="nav-link active" to="/">Inicio</Link>
                        </li>

                        {!store.token ? (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/asociates">Nuestros asociados</Link>
                                </li>
                                <li className="nav-item dropdown">
                                    <Link
                                        className="nav-link dropdown-toggle"
                                        role="button"
                                        data-bs-toggle="dropdown"
                                    >
                                        Crear cuenta
                                    </Link>
                                    <ul className="dropdown-menu">
                                        <li><Link className="dropdown-item" to="/singup/client">Como cliente</Link></li>
                                        <li><Link className="dropdown-item" to="/singup/barber">Como profesional</Link></li>
                                        <li><Link className="dropdown-item" to="/singup/owner">Como dueño</Link></li>
                                    </ul>
                                </li>

                                <li className="nav-item dropdown">
                                    <Link
                                        className="nav-link dropdown-toggle"
                                        role="button"
                                        data-bs-toggle="dropdown"
                                    >
                                        Inicia sesión
                                    </Link>
                                    <ul className="dropdown-menu">
                                        <li><Link className="dropdown-item" to="/login/client">Soy cliente</Link></li>
                                        <li><Link className="dropdown-item" to="/login/barber">Soy barbero</Link></li>
                                        <li><Link className="dropdown-item" to="/login/owner">Soy dueño</Link></li>
                                    </ul>
                                </li>
                            </>)
                            :
                            (<>
                                <Link
                                    className="nav-link"
                                    to={
                                        store.role === "owner" ? "/private/owner" :
                                            store.role === "barber" ? "/private/barber" :
                                                store.role === "client" ? "/private/client" : "/"
                                    }
                                >
                                    Tu perfil
                                </Link>
                                <li className="nav-item">
                                    <Link className="nav-link" onClick={handleLogout}>Cerrar sesión</Link>
                                </li>
                            </>
                            )}
                    </ul>
                </div>

            </div>
        </nav >
    )
}