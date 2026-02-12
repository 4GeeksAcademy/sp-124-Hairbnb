import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const AdminEditOwner = () => {
    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = !!id;

    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: ""
    });

    useEffect(() => {
        const loadOwnerData = async () => {
            if (isEditing) {
                try {
                    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/owners/${id}`, {
                        method: "GET",
                        headers: {
                            "Authorization": `Bearer ${store.token}`
                        }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        setForm({
                            name: data.name || "",
                            email: data.email || "",
                            phone: data.phone || "",
                            password: "",
                            confirmPassword: ""
                        });
                    }
                } catch (error) {
                    console.error("Error cargando datos del dueño:", error);
                }
            }
        };

        loadOwnerData();
    }, [id, isEditing, store.token]);

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async e => {
        e.preventDefault();

        if (form.password !== "" && form.password !== form.confirmPassword) {
            dispatch({ type: "set-message", payload: { type: "error", msg: "Las contraseñas no coinciden" } });
            return;
        }

        const method = isEditing ? "PUT" : "POST";
        const url = isEditing
            ? `${import.meta.env.VITE_BACKEND_URL}/owners/${id}`
            : `${import.meta.env.VITE_BACKEND_URL}/owners`;

        try {
            const res = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${store.token}`
                },
                body: JSON.stringify({
                    name: form.name,
                    email: form.email,
                    phone: form.phone,
                    ...(form.password && { password: form.password })
                })
            });

            const data = await res.json();

            if (res.ok) {
                dispatch({
                    type: "set-message",
                    payload: { type: "success", msg: isEditing ? "Dueño actualizado" : "Dueño creado" }
                });
                navigate("/4dm1n1str4t10n");
            } else {
                dispatch({
                    type: "set-message",
                    payload: data.message || { type: "error", msg: "Error al procesar los datos" }
                });
            }
        } catch (err) {
            dispatch({ type: "set-message", payload: { type: "error", msg: "Error de conexión" } });
        }
    };

    return (
        <div className="container mt-5">
            <h1 className="display-6 mb-4">
                {isEditing ? `Admin: editar dueño` : "Admin: crear cuenta de dueño"}
            </h1>

            <form onSubmit={handleSubmit} className="card p-4 shadow-sm">
                <label className="fw-bold">Nombre</label>
                <input className="form-control mb-2" name="name" value={form.name} onChange={handleChange} required />

                <label className="fw-bold">Email</label>
                <input className="form-control mb-2" name="email" value={form.email} onChange={handleChange} required />

                <label className="fw-bold">Teléfono</label>
                <input className="form-control mb-2" name="phone" value={form.phone} onChange={handleChange} />

                <hr />
                <label className="fw-bold">{isEditing ? "Cambiar contraseña (opcional)" : "Contraseña"}</label>
                <input className="form-control mb-2" type="password" name="password" placeholder="********" onChange={handleChange} />

                <label className="fw-bold">Confirmar contraseña</label>
                <input className="form-control mb-2" type="password" name="confirmPassword" placeholder="********" onChange={handleChange} />

                <div className="d-flex gap-2 mt-3">
                    <button type="button" className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
                        Cancelar
                    </button>
                    <button className="btn btn-primary">
                        {isEditing ? "Guardar cambios" : "Crear dueño"}
                    </button>
                </div>
            </form>
        </div>
    );
};