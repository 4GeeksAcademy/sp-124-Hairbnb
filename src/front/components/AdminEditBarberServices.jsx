import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const AdminEditBarberServices = () => {
    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = !!id;

    const [barbers, setBarbers] = useState([]);
    const [form, setForm] = useState({
        name: "",
        description: "",
        price: "",
        duration: "",
        barber_id: ""
    });

    useEffect(() => {
        const initLoad = async () => {
            const headers = { "Authorization": `Bearer ${store.token}` };
            
            try {
                const resBarbers = await fetch(`${import.meta.env.VITE_BACKEND_URL}/admin/barbers`, { headers });
                if (resBarbers.ok) setBarbers(await resBarbers.json());
            } catch (error) {
                console.error("Error cargando barberos:", error);
            }

            if (isEditing) {
                try {
                    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/barber_services/${id}`, { headers });
                    if (res.ok) {
                        const data = await res.json();
                        setForm({
                            name: data.name || "",
                            description: data.description || "",
                            price: data.price || "",
                            duration: data.duration || "",
                            barber_id: data.barber_id || ""
                        });
                    }
                } catch (error) {
                    console.error("Error cargando servicio:", error);
                }
            }
        };
        initLoad();
    }, [id, isEditing, store.token]);

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async e => {
        e.preventDefault();
        const method = isEditing ? "PUT" : "POST";
        const url = `${import.meta.env.VITE_BACKEND_URL}/barber_services${isEditing ? `/${id}` : ""}`;

        try {
            const res = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${store.token}`
                },
                body: JSON.stringify({
                    ...form,
                    price: parseFloat(form.price),
                    duration: parseInt(form.duration),
                    barber_id: parseInt(form.barber_id)
                })
            });

            if (res.ok) {
                dispatch({
                    type: "set-message",
                    payload: { type: "success", msg: isEditing ? "Servicio actualizado" : "Servicio creado" }
                });
                navigate("/4dm1n1str4t10n");
            } else {
                const errorData = await res.json();
                dispatch({ type: "set-message", payload: { type: "error", msg: errorData.msg || "Error al guardar" } });
            }
        } catch (err) {
            dispatch({ type: "set-message", payload: { type: "error", msg: "Error de conexión" } });
        }
    };

    return (
        <div className="container mt-5">
            <h1 className="display-6 mb-4">{isEditing ? `Admin: editar servicio` : "Admin: nuevo servicio"}</h1>

            <form onSubmit={handleSubmit} className="card p-4 shadow-sm border-info">
                <div className="mb-3">
                    <label className="fw-bold">Barbero Responsable</label>
                    <select className="form-select" name="barber_id" value={form.barber_id} onChange={handleChange} required>
                        <option value="">Selecciona un barbero...</option>
                        {barbers.map(b => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                    </select>
                </div>

                <div className="mb-3">
                    <label className="fw-bold">Nombre del Servicio</label>
                    <input className="form-control" name="name" value={form.name} onChange={handleChange} placeholder="Ej: Corte Degradado + Barba" required />
                </div>

                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label className="fw-bold">Precio (€)</label>
                        <input type="number" step="0.01" className="form-control" name="price" value={form.price} onChange={handleChange} required />
                    </div>
                    <div className="col-md-6 mb-3">
                        <label className="fw-bold">Duración (minutos)</label>
                        <input type="number" className="form-control" name="duration" value={form.duration} onChange={handleChange} placeholder="Ej: 30" required />
                    </div>
                </div>

                <div className="d-flex gap-2 mt-3">
                    <button type="button" className="btn btn-outline-secondary" onClick={() => navigate("/4dm1n1str4t10n")}>
                        Cancelar
                    </button>
                    <button className="btn btn-info text-white">
                        {isEditing ? "Actualizar Servicio" : "Crear Servicio"}
                    </button>
                </div>
            </form>
        </div>
    );
};