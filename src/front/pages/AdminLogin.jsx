import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

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
            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/login/admin`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password })
                }
            );

            const data = await res.json();

            if (!res.ok) {
                dispatch({
                    type: "set-message",
                    payload: { type: "error", msg: data.msg || "Credenciales incorrectas" }
                });
                return;
            }

            dispatch({
                type: "login",
                payload: {
                    token: data.token,
                    username: data.user.name,
                    role: "admin"
                }
            });

            dispatch({
                type: "set-message",
                payload: {
                    type: "success",
                    msg: `Administrador ${data.user.name} ha iniciado sesión`
                }
            });

            navigate("/4dm1n1str4c10n");

        } catch (err) {
            dispatch({
                type: "set-message",
                payload: { type: "error", msg: `Error: ${err.message}` }
            });
        }
    };

    return (
        <div className="container mt-5">
            <h1 className="display-6 mb-4">Inicio de sesión como administrador</h1>

            <form onSubmit={handleLogin}>
                <div className="mb-3 d-flex m-2 gap-2">
                    <input
                        className="form-control"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        className="form-control"
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <div className="mx-auto text-center">
                    <button type="submit" className="btn btn-secondary">
                        Entrar como administrador
                    </button>
                </div>
            </form>
        </div>
    );
};