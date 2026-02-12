import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const AdminEditAdmin = () => {
    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = !!id;

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
    });

    useEffect(() => {
        const loadAdminData = async () => {
            if (isEditing) {
                try {
                    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/admins/${id}`, {
                        headers: { "Authorization": `Bearer ${store.token}` }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        setForm({
                            name: data.name || "",
                            email: data.email || "",
                            password: "",
                            confirmPassword: ""
                        });
                    }
                } catch (error) {
                    console.error("Error cargando admin:", error);
                }
            }
        };
        loadAdminData();
    }, [id, isEditing, store.token]);

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async e => {
        e.preventDefault();

        if (form.password !== form.confirmPassword) {
            dispatch({ type: "set-message", payload: { type: "error", msg: "Las contraseñas no coinciden" } });
            return;
        }

        const method = isEditing ? "PUT" : "POST";
        const url = `${import.meta.env.VITE_BACKEND_URL}/admins${isEditing ? `/${id}` : ""}`;

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
                    ...(form.password && { password: form.password })
                })
            });

            if (res.ok) {
                dispatch({
                    type: "set-message",
                    payload: { type: "success", msg: isEditing ? "Administrador actualizado" : "Administrador creado" }
                });
                navigate("/4dm1n1str4t10n");
            } else {
                const errorData = await res.json();
                dispatch({ type: "set-message", payload: { type: "error", msg: errorData.msg || "Error en la operación" } });
            }
        } catch (err) {
            dispatch({ type: "set-message", payload: { type: "error", msg: "Error de conexión" } });
        }
    };

    return (
        <div className="container mt-5">
            <h1 className="display-6 mb-4">{isEditing ? `Admin: editar admin` : "Admin: nuevo admin"}</h1>

            <form onSubmit={handleSubmit} className="card p-4 shadow-sm border-danger">
                <div className="alert alert-warning">
                    <strong>Atención:</strong> Estás gestionando una cuenta con acceso total al sistema.
                </div>

                <label className="fw-bold">Nombre</label>
                <input className="form-control mb-2" name="name" value={form.name} onChange={handleChange} required />

                <label className="fw-bold">Email</label>
                <input className="form-control mb-2" name="email" value={form.email} onChange={handleChange} required />

                <hr />
                <label className="fw-bold">{isEditing ? "Nueva contraseña (opcional)" : "Contraseña"}</label>
                <input className="form-control mb-2" type="password" name="password" placeholder="********" onChange={handleChange} required={!isEditing} />

                <label className="fw-bold">Confirmar contraseña</label>
                <input className="form-control mb-2" type="password" name="confirmPassword" placeholder="********" onChange={handleChange} required={!isEditing} />

                <div className="d-flex gap-2 mt-3">
                    <button type="button" className="btn btn-outline-secondary" onClick={() => navigate("/4dm1n1str4t10n")}>
                        Cancelar
                    </button>
                    <button className="btn btn-danger">
                        {isEditing ? "Guardar cambios" : "Crear Administrador"}
                    </button>
                </div>
            </form>
        </div>
    );
};