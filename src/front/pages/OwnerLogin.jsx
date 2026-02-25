import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import "../styles/authforms.css";

export const OwnerLogin = () => {
    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            dispatch({
                type: "set-message",
                payload: { type: "error", msg: "Debes completar todos los campos" }
            });
            return;
        }

        try {
            const response = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/login/owner`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                dispatch({
                    type: "set-message",
                    payload: { type: "error", msg: data.msg || "Credenciales incorrectas" }
                });
                return;
            }

            localStorage.setItem("token", data.token);
            localStorage.setItem("role", data.user.role);
            localStorage.setItem("userInfo", JSON.stringify(data.user))

            dispatch({
                type: "login",
                payload: {
                    token: data.token,
                    username: data.user.name,
                    role: "owner",
                    userInfo: data.user
                }
            });


            dispatch({
                type: "set-message",
                payload: {
                    type: "success",
                    msg: `Hola de nuevo, ${data.user.name}`
                }
            });

            navigate("/private/owner");

        } catch (err) {
            dispatch({
                type: "set-message",
                payload: { type: "error", msg: `Error: ${err.message}` }
            });
        }
    };

    return (
        <div className="auth-page-container">
            <div className="auth-card" style={{ maxWidth: '450px' }}>
                <div className="text-center mb-4">
                    <div className="mb-3 d-inline-block p-3 rounded-circle bg-gold-soft">
                        <i className="fa-solid fa-shop fa-2x text-gold"></i>
                    </div>
                    <h1 className="auth-title">Acceso para propietarios</h1>
                    <p className="auth-subtitle">Gestiona tus locales y equipos</p>
                </div>

                <form onSubmit={handleLogin}>
                    <div className="mb-3">
                        <label className="auth-label">Correo electrónico</label>
                        <input
                            className="auth-input w-100"
                            type="email"
                            placeholder="dueño@tu-negocio.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="auth-label">Contraseña</label>
                        <input
                            className="auth-input w-100"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn-auth-main w-100 mb-3">
                        Entrar
                    </button>

                    <div className="text-center mt-4">
                        <p className="small text-muted mb-1">¿Quieres registrar tu local?</p>
                        <span
                            className="fw-bold text-decoration-underline cursor-pointer"
                            style={{ color: '#d19f68', fontSize: '0.9rem' }}
                            onClick={() => navigate("/signup/owner")}
                        >
                            Crear cuenta de dueño
                        </span>
                    </div>
                </form>
            </div>
        </div>
    );
};