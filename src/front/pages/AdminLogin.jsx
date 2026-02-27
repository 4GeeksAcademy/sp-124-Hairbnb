import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import "../styles/authforms.css";

export const AdminLogin = () => {
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
                `${import.meta.env.VITE_BACKEND_URL}/login/admin`,
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
            localStorage.setItem("userInfo", JSON.stringify(data.user));

            dispatch({
                type: "login",
                payload: {
                    token: data.token,
                    role: data.user.role,
                    userInfo: data.user
                }
            });

            dispatch({
                type: "set-message",
                payload: {
                    type: "success",
                    msg: `Acceso concedido. Bienvenido, ${data.user.name}`
                }
            });

            navigate("/4dm1n1str4t10n");

        } catch (err) {
            dispatch({
                type: "set-message",
                payload: { type: "error", msg: `Error de conexión: ${err.message}` }
            });
        }
    };

    return (
        <div className="auth-page-container">
            <div className="auth-card" style={{ maxWidth: '450px' }}>
                <div className="text-center mb-4">
                    <div className="mb-3 d-inline-block p-3 rounded-circle bg-gold-soft">
                        <i className="fa-solid fa-user-shield fa-2x text-gold"></i>
                    </div>
                    <h1 className="auth-title">Acceso a Administración</h1>
                    <p className="auth-subtitle">Panel de gestión interna Hairbnb</p>
                </div>

                <form onSubmit={handleLogin}>
                    <div className="mb-3">
                        <label className="auth-label">Correo electrónico</label>
                        <input
                            className="auth-input w-100"
                            type="email"
                            placeholder="admin@hairbnb.com"
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

                    <button type="submit" className="btn-auth-main w-100">
                        <i className="fa-solid fa-right-to-bracket me-2"></i>
                        Entrar al Sistema
                    </button>
                </form>
            </div>
        </div>
    );
};