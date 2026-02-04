import { Link } from "react-router-dom";

export const Navbar = () => {
    return (
        <nav className="navbar navbar-light bg-light">
            <div className="container d-flex justify-content-between align-items-center">
                <Link to="/" className="navbar-brand">
                    <img 
                        src="../../../public/Logo-HBNB-completo.png" 
                        alt="Hairbnb" 
                        width="120" 
                        height="auto" 
                    />
                </Link>

                <Link to="/login" className="btn btn-outline-secondary">
                    Iniciar Sesión
                </Link>
            </div>
        </nav>
    );
};