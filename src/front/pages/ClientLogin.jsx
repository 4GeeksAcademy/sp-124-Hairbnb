import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import "../styles/authforms.css"

export const ClientLogin = () => {
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
                `${import.meta.env.VITE_BACKEND_URL}/login/client`,
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
                    payload: { type: "error", msg: data.message?.msg || "Credenciales incorrectas" }
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
                    role: "client",
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

            navigate("/private/client");

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
                        <i className="fa-solid fa-circle-user fa-2x text-gold"></i>
                    </div>
                    <h1 className="auth-title">Área de cliente</h1>
                    <p className="auth-subtitle">Reserva tu cita en los mejores centros</p>
                </div>

                <form onSubmit={handleLogin}>
                    <div className="mb-3">
                        <label className="auth-label">Correo electrónico</label>
                        <input
                            className="auth-input w-100"
                            type="email"
                            placeholder="tu@email.com"
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
                        Iniciar sesión
                    </button>

                    <div className="text-center mt-4">
                        <p className="small text-muted mb-1">¿Aún no disfrutas de nuestros beneficios?</p>
                        <span
                            className="fw-bold text-decoration-underline"
                            style={{ color: '#d19f68', cursor: 'pointer', fontSize: '0.9rem' }}
                            onClick={() => navigate("/signup/client")}
                        >
                            Regístrate como cliente
                        </span>
                    </div>
                </form>
            </div>
        </div>
    );
};