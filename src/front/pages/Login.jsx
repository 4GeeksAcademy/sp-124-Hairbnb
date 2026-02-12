import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const Login = () => {
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
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (!res.ok) {
                dispatch({
                    type: "set-message",
                    payload: { type: "error", msg: data.msg || `Error ${res.status}` }
                });
                return;
            }

            if (!data.token) {
                dispatch({
                    type: "set-message",
                    payload: { type: "error", msg: "No se recibió token" }
                });
                return;
            }

            dispatch({
                type: "login",
                payload: {
                    token: data.token,
                    username: data.user.name,
                    role: data.user.role
                }
            });

            dispatch({
                type: "set-message",
                payload: { type: "success", msg: `Hola de nuevo, ${data.user.name}` }
            });

            switch (data.user.role) {
                case "owner": navigate("/private_owner"); break;
                case "barber": navigate("/private_barber"); break;
                case "client": navigate("/private_client"); break;
                default: navigate("/"); break;
            }

        } catch (err) {
            dispatch({
                type: "set-message",
                payload: { type: "error", msg: `Ha habido un error: ${err.message}` }
            });
        }
    };

    return (
        <div className="container mt-5">
            <h2 className="display-6">Inicio de sesión</h2>

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

                <button type="submit" className="btn btn-secondary">Aceptar</button>
            </form>

            {store.message?.msg && (
                <p className={`fs-5 text-${store.message.type === "error" ? "danger" : "success"}`}>
                    {store.message.msg}
                </p>
            )}
        </div>
    );
};
