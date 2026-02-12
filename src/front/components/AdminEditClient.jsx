import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const AdminEditClient = () => {
    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();
    const { id } = useParams();
    
    const isEditing = !!id;

    const [form, setForm] = useState({
        name: "",
        last_name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        notes: "",
        client_profile_image: ""
    });

    useEffect(() => {
        const loadClientData = async () => {
            if (isEditing) {
                try {
                    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/${id}`, {
                        method: "GET",
                        headers: {
                            "Authorization": `Bearer ${store.token}`
                        }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        setForm({
                            name: data.name || "",
                            last_name: data.last_name || "",
                            email: data.email || "",
                            phone: data.phone || "",
                            notes: data.notes || "",
                            password: "", 
                            confirmPassword: ""
                        });
                    }
                } catch (error) {
                    console.error("Error cargando datos del cliente:", error);
                }
            }
        };

        loadClientData();
    }, [id, isEditing, store.token]);

    const handleChange = e =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async e => {
        e.preventDefault();

        if (form.password !== "" && form.password !== form.confirmPassword) {
            dispatch({ 
                type: "set-message", 
                payload: { type: "error", msg: "Las contraseñas no coinciden" } 
            });
            return;
        }

        const method = isEditing ? "PUT" : "POST";
        const url = isEditing 
            ? `${import.meta.env.VITE_BACKEND_URL}/users/${id}`
            : `${import.meta.env.VITE_BACKEND_URL}/users`;

        try {
            const res = await fetch(url, {
                method: method,
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${store.token}`
                },
                body: JSON.stringify({
                    name: form.name,
                    last_name: form.last_name,
                    email: form.email,
                    phone: form.phone,
                    notes: form.notes,
                    ...(form.password && { password: form.password })
                })
            });

            const data = await res.json();

            if (!res.ok) {
                dispatch({ 
                    type: "set-message", 
                    payload: data.message || { type: "error", msg: "Error al procesar la solicitud" } 
                });
                return;
            }

            dispatch({
                type: "set-message",
                payload: { type: "success", msg: isEditing ? "Cliente actualizado" : "Cliente creado con éxito" }
            });
            
            navigate("/4dm1n1str4t10n");

        } catch (err) {
            dispatch({
                type: "set-message",
                payload: { type: "error", msg: "Error de conexión" }
            });
        }
    };

    return (
        <div className="container mt-5">
            <h1 className="display-6 mb-4 text-primary">
                {isEditing ? `Administración: Editar cliente` : "Administración: Crear cliente"}
            </h1>

            <form onSubmit={handleSubmit} className="card p-4 shadow-sm">
                <label className="fw-bold">Nombre</label>
                <input className="form-control mb-2" name="name" value={form.name} placeholder="Nombre" onChange={handleChange} required />
                
                <label className="fw-bold">Apellido</label>
                <input className="form-control mb-2" name="last_name" value={form.last_name} placeholder="Apellido" onChange={handleChange} required />
                
                <label className="fw-bold">Email</label>
                <input className="form-control mb-2" name="email" value={form.email} placeholder="Email" onChange={handleChange} required />
                
                <label className="fw-bold">Teléfono</label>
                <input className="form-control mb-2" name="phone" value={form.phone} placeholder="Teléfono" onChange={handleChange} />
                
                <hr />
                <label className="fw-bold">{isEditing ? "Nueva contraseña (dejar vacío para no cambiar)" : "Contraseña"}</label>
                <input className="form-control mb-2" type="password" name="password" placeholder="********" onChange={handleChange} />
                
                <label className="fw-bold">Confirmar contraseña</label>
                <input className="form-control mb-2" type="password" name="confirmPassword" placeholder="********" onChange={handleChange} />
                
                <label className="fw-bold">Notas:</label>
                <textarea className="form-control mb-2" name="notes" value={form.notes} placeholder="Notas adicionales..." onChange={handleChange} rows="3" />
                
                <div className="d-flex gap-2 mt-3">
                    <button type="button" className="btn btn-outline-secondary" onClick={() => navigate("/4dm1n1str4t10n")}>
                        Cancelar
                    </button>
                    <button type="submit" className="btn btn-primary">
                        {isEditing ? "Guardar Cambios" : "Crear Cliente"}
                    </button>
                </div>
            </form>
        </div>
    );
};