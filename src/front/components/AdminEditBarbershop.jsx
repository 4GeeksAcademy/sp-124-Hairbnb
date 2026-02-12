import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const AdminEditBarbershop = () => {
    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = !!id;

    const [form, setForm] = useState({
        name: "",
        address: "",
        phone: "",
    });

    useEffect(() => {
        const loadBarbershopData = async () => {
            if (isEditing) {
                try {
                    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/barbershops/${id}`, {
                        headers: { "Authorization": `Bearer ${store.token}` }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        setForm({
                            name: data.name || "",
                            address: data.address || "",
                            phone: data.phone || "",
                        });
                    }
                } catch (error) {
                    console.error("Error cargando barbería:", error);
                }
            }
        };
        loadBarbershopData();
    }, [id, isEditing, store.token]);

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async e => {
        e.preventDefault();

        const method = isEditing ? "PUT" : "POST";
        const url = isEditing 
            ? `${import.meta.env.VITE_BACKEND_URL}/barbershops/${id}`
            : `${import.meta.env.VITE_BACKEND_URL}/barbershops`;

        try {
            const res = await fetch(url, {
                method: method,
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${store.token}`
                },
                body: JSON.stringify(form)
            });

            const data = await res.json();

            if (!res.ok) {
                dispatch({ 
                    type: "set-message", 
                    payload: data.message || { type: "error", msg: "Error en la barbería" } 
                });
                return;
            }

            dispatch({
                type: "set-message",
                payload: { type: "success", msg: isEditing ? "Barbería actualizada" : "Barbería creada" }
            });
            navigate("/4dm1n1str4t10n");
        } catch (err) {
            dispatch({ type: "set-message", payload: { type: "error", msg: "Error de conexión" } });
        }
    };

    return (
        <div className="container mt-5">
            <h1 className="display-6 mb-4 text-primary">
                {isEditing ? `Admin: editar barbería` : "Admin: nueva barbería"}
            </h1>

            <form onSubmit={handleSubmit} className="card p-4 shadow-sm">
                <label className="fw-bold">Nombre de la Barbería</label>
                <input className="form-control mb-2" name="name" value={form.name} onChange={handleChange} required />
                
                <label className="fw-bold">Dirección completa</label>
                <input className="form-control mb-2" name="address" value={form.address} onChange={handleChange} required />
                
                <label className="fw-bold">Teléfono</label>
                <input className="form-control mb-2" name="phone" value={form.phone} onChange={handleChange} required />
                
                <div className="d-flex gap-2 mt-3">
                    <button type="button" className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
                        Cancelar
                    </button>
                    <button type="submit" className="btn btn-primary">
                        {isEditing ? "Actualizar Barbería" : "Registrar Barbería"}
                    </button>
                </div>
            </form>
        </div>
    );
};