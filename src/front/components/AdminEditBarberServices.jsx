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
                const responseBarbers = await fetch(`${import.meta.env.VITE_BACKEND_URL}/admin/barbers`, { headers });
                if (responseBarbers.ok) {
                    const barbersData = await responseBarbers.json();
                    setBarbers(barbersData);
                }

                if (isEditing) {
                    const responseService = await fetch(`${import.meta.env.VITE_BACKEND_URL}/barber_services/${id}`, { headers });
                    if (responseService.ok) {
                        const data = await responseService.json();
                        setForm({
                            name: data.name || "",
                            description: data.description || "",
                            price: data.price || "",
                            duration: data.duration || "",
                            barber_id: data.barber_id || ""
                        });
                    } else {
                        dispatch({
                            type: "set-message",
                            payload: { type: "error", msg: "No se pudo cargar el servicio" }
                        });
                    }
                }
            } catch (error) {
                console.error("Error en carga inicial:", error);
                dispatch({
                    type: "set-message",
                    payload: { type: "error", msg: "Error de conexión con el servidor" }
                });
            }
        };
        initLoad();
    }, [id, isEditing, store.token, dispatch]);

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async e => {
        e.preventDefault();

        const barberIdParsed = parseInt(form.barber_id);
        const priceParsed = parseFloat(form.price);
        const durationParsed = parseInt(form.duration);

        if (isNaN(barberIdParsed) || isNaN(priceParsed) || isNaN(durationParsed)) {
            dispatch({
                type: "set-message",
                payload: { type: "error", msg: "Precio, duración y barbero son obligatorios y deben ser números" }
            });
            return;
        }

        const method = isEditing ? "PUT" : "POST";
        const url = `${import.meta.env.VITE_BACKEND_URL}/barber_services${isEditing ? `/${id}` : ""}`;

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${store.token}`
                },
                body: JSON.stringify({
                    name: form.name,
                    description: form.description,
                    price: priceParsed,
                    duration: durationParsed,
                    barber_id: barberIdParsed
                })
            });

            if (response.ok) {
                dispatch({
                    type: "set-message",
                    payload: { type: "success", msg: isEditing ? "Servicio actualizado" : "Servicio creado" }
                });
                navigate("/4dm1n1str4t10n");
            } else {
                const errorData = await response.json();
                dispatch({
                    type: "set-message",
                    payload: { type: "error", msg: errorData.message?.msg || "Error al guardar" }
                });
            }
        } catch (err) {
            dispatch({ type: "set-message", payload: { type: "error", msg: "Error de conexión" } });
        }
    };

    return (
        <div className="container py-5" style={{ maxWidth: '750px' }}>
            <div className="booking-card shadow-lg">

                <div className="booking-header">
                    <h2 className="Oswald mb-0 text-uppercase fw-bold">
                        {isEditing ? "Editar servicio" : "Nuevo servicio"}
                    </h2>
                    <div className="mt-2" style={{ width: '40px', height: '2px', background: '#d19f68', margin: '0 auto' }}></div>
                </div>

                <form onSubmit={handleSubmit} className="p-4 p-md-5">

                    <div className="form-group-custom mb-4">
                        <label>Barbero</label>
                        <select className="select-custom" name="barber_id" value={form.barber_id} onChange={handleChange} required>
                            <option value="">Selecciona al profesional</option>
                            {barbers.map(b => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group-custom mb-4">
                        <label>Nombre del servicio</label>
                        <input className="select-custom" name="name" value={form.name}
                            onChange={handleChange} placeholder="Ej: Corte Degradado + Ritual de Barba" required />
                    </div>

                    <div className="row">
                        <div className="col-md-6 form-group-custom">
                            <label>Precio (€)</label>
                            <div className="position-relative">
                                <input type="number" step="0.01" className="select-custom" name="price"
                                    value={form.price} onChange={handleChange} placeholder="0.00" required />
                            </div>
                        </div>
                        <div className="col-md-6 form-group-custom">
                            <label>Duración (minutos)</label>
                            <input type="number" className="select-custom" name="duration"
                                value={form.duration} onChange={handleChange} placeholder="30" required />
                        </div>
                    </div>

                    <div className="form-group-custom mt-3">
                        <label>Descripción del servicio (opcional)</label>
                        <textarea className="select-custom" name="description" rows="3" value={form.description}
                            onChange={handleChange} placeholder="Explica brevemente en qué consiste el servicio..." />
                    </div>

                    <div className="d-flex justify-content-between align-items-center mt-5">
                        <button type="button" className="btn btn-link text-muted text-decoration-none Oswald"
                            onClick={() => navigate("/4dm1n1str4t10n")}>
                            CANCELAR
                        </button>
                        <button type="submit" className="btn-confirm px-5">
                            {isEditing ? "ACTUALIZAR" : "CREAR"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};