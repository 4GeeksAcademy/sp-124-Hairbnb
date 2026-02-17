import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

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
        <div className="container mt-5">
            <h1 className="display-6 mb-4">Inicio de sesión como cliente</h1>

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
                    <p className="mt-3">
                        ¿No tienes cuenta?{" "}
                        <span
                            className="text-primary"
                            onClick={() => navigate("/signup/client")}
                        >
                            Crear una cuenta de cliente
                        </span>
                    </p>
                    <button type="submit" className="btn btn-outline-primary">
                        Entrar como cliente
                    </button>
                </div>
            </form>
        </div>
    );
};