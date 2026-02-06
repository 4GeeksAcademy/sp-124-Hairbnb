import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const BarberLogin = () => {
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
                `${import.meta.env.VITE_BACKEND_URL}/login/barber`,
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
                    role: "barber"
                }
            });

            dispatch({
                type: "set-message",
                payload: {
                    type: "success",
                    msg: `Barbero ${data.user.name} ha iniciado sesión`
                }
            });

            navigate("/private/barber");

        } catch (err) {
            dispatch({
                type: "set-message",
                payload: { type: "error", msg: `Error: ${err.message}` }
            });
        }
    };

    return (
        <div className="container">
                <h1 className="display-6 mb-4">Inicio de sesión como barbero</h1>
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
                                onClick={() => navigate("/signup/barber")}
                            >
                                Crear una cuenta de barbero
                            </span>
                        </p>
                        <button type="submit" className="btn btn-secondary">
                            Entrar como barbero
                        </button>
                    </div>
                </form>
            </div>
    );
};