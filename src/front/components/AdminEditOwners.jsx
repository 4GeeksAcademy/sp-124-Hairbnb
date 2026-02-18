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
            if (!isEditing) return;

            try {
                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/owners/${id}`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${store.token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setForm({
                        name: data.name || "",
                        email: data.email || "",
                        phone: data.phone || "",
                        password: "",
                        confirmPassword: ""
                    });
                } else {
                    dispatch({
                        type: "set-message",
                        payload: { type: "error", msg: "No se pudo cargar la información del dueño" }
                    });
                }
            } catch (error) {
                console.error("Error cargando datos del dueño:", error);
                dispatch({
                    type: "set-message",
                    payload: { type: "error", msg: "Error de conexión con el servidor" }
                });
            }
        };

        loadOwnerData();
    }, [id, isEditing, store.token, dispatch]);

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async e => {
        e.preventDefault();

        if (!isEditing && !form.password) {
            dispatch({
                type: "set-message",
                payload: { type: "error", msg: "La contraseña es obligatoria para nuevas cuentas de dueño." }
            });
            return;
        }

        if (form.password !== form.confirmPassword) {
            dispatch({ type: "set-message", payload: { type: "error", msg: "Las contraseñas no coinciden" } });
            return;
        }

        const method = isEditing ? "PUT" : "POST";
        const url = isEditing
            ? `${import.meta.env.VITE_BACKEND_URL}/owners/${id}`
            : `${import.meta.env.VITE_BACKEND_URL}/owners`;

        try {
            const response = await fetch(url, {
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

            const data = await response.json();

            if (response.ok) {
                dispatch({
                    type: "set-message",
                    payload: { type: "success", msg: isEditing ? "Dueño actualizado" : "Dueño creado" }
                });
                navigate("/4dm1n1str4t10n");
            } else {
                dispatch({
                    type: "set-message",
                    payload: { type: "error", msg: data.msg || "Error al procesar los datos del dueño" }
                });
            }
        } catch (err) {
            dispatch({
                type: "set-message",
                payload: { type: "error", msg: "Error de conexión con el servidor" }
            });
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
                <input
                    type="text"
                    className="form-control"
                    name="phone"
                    value={form.phone}
                    placeholder="Ej: 600123456"
                    maxLength="9"
                    onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        setForm({ ...form, phone: val });
                    }}
                />

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