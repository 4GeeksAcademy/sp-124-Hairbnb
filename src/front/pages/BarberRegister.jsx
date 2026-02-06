import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const BarberRegister = () => {
    const { dispatch } = useGlobalReducer();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
    });

    const handleChange = e =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async e => {
        e.preventDefault();

        try {
            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/barbers`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(form)
                }
            );

            const data = await res.json();

            if (!res.ok) {
                dispatch({ type: "set-message", payload: data.message });
                return;
            }

            dispatch({
                type: "set-message",
                payload: { type: "success", msg: "Cuenta de barbero creada" }
            });

            navigate("/login/barber");

        } catch (err) {
            dispatch({
                type: "set-message",
                payload: { type: "error", msg: err.message }
            });
        }
    };

    return (
        <div className="container mt-5">
            <h1 className="display-6 mb-4">Crear cuenta como barbero</h1>

            <form onSubmit={handleSubmit}>
                <input className="form-control mb-2" name="name" placeholder="Nombre" onChange={handleChange} />
                <input className="form-control mb-2" name="email" placeholder="Email" onChange={handleChange} />
                <input className="form-control mb-2" type="password" name="password" placeholder="Contraseña" onChange={handleChange} />
                <button className="btn btn-secondary">Crear cuenta</button>
            </form>
        </div>
    );
};
