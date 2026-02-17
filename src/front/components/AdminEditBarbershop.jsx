import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { APILoader, PlacePicker } from '@googlemaps/extended-component-library/react';

export const AdminEditBarbershop = () => {
    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = !!id;

    const [form, setForm] = useState({
        name: "",
        address: "",
        phone: "",
        latitude: null,
        longitude: null,
        working_hours: { "Lunes": "", "Martes": "", "Miércoles": "", "Jueves": "", "Viernes": "", "Sábado": "", "Domingo": "" }
    });

    useEffect(() => {
        const loadBarbershopData = async () => {
            if (!isEditing) return;

            try {
                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/barbershops/${id}`, {
                    headers: { "Authorization": `Bearer ${store.token}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    setForm({
                        name: data.name || "",
                        address: data.address || "",
                        phone: data.phone || "",
                        latitude: data.latitude || null,
                        longitude: data.longitude || null,
                        working_hours: data.working_hours || form.working_hours,
                    });
                } else {
                    dispatch({
                        type: "set-message",
                        payload: { type: "error", msg: "No se pudo cargar la información" }
                    });
                }
            } catch (error) {
                console.error("Error cargando barbería:", error);
            }
        };
        loadBarbershopData();
    }, [id, isEditing, store.token]);

    const handlePlaceChange = (e) => {
        const place = e.target.value;
        if (!place) return;
        setForm(prev => ({
            ...prev,
            address: place.formattedAddress || place.displayName,
            latitude: place.location.lat(),
            longitude: place.location.lng()
        }));
    };

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async e => {
        e.preventDefault();
        
        if (!form.latitude) {
            dispatch({ type: "set-message", payload: { type: "error", msg: "Debes seleccionar una dirección válida del buscador" } });
            return;
        }

        const method = isEditing ? "PUT" : "POST";
        const url = isEditing
            ? `${import.meta.env.VITE_BACKEND_URL}/barbershops/${id}`
            : `${import.meta.env.VITE_BACKEND_URL}/barbershops`;

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${store.token}`
                },
                body: JSON.stringify(form)
            });

            const data = await response.json();

            if (response.ok) {
                dispatch({
                    type: "set-message",
                    payload: { type: "success", msg: isEditing ? "Barbería actualizada" : "Barbería creada" }
                });
                navigate("/4dm1n1str4t10n");
            } else {
                dispatch({
                    type: "set-message",
                    payload: { type: "error", msg: data.msg || "Error al gestionar la barbería" }
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
            <APILoader apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY} />
            
            <h1 className="display-6 mb-4 text-primary">
                {isEditing ? `Admin: editar barbería` : "Admin: nueva barbería"}
            </h1>

            <form onSubmit={handleSubmit} className="card p-4 shadow-sm">
                <div className="row">
                    <div className="col-md-6 mb-2">
                        <label className="fw-bold">Nombre de la Barbería</label>
                        <input className="form-control" name="name" value={form.name} onChange={handleChange} required />
                    </div>

                    <div className="col-md-6 mb-2">
                        <label className="fw-bold">Teléfono</label>
                        <input className="form-control" name="phone" value={form.phone} onChange={handleChange} required />
                    </div>
                </div>

                <label className="fw-bold mt-2">Dirección (Buscador Google)</label>
                <PlacePicker 
                    className="mb-1"
                    ononPlaceChange={handlePlaceChange}
                    placeholder={form.address || "Busca la calle..."}
                />
                {form.latitude && (
                    <div className="mb-3">
                        <small className="text-success fw-bold">Coordenadas fijadas: {form.latitude.toFixed(4)}, {form.longitude.toFixed(4)}</small>
                    </div>
                )}

                <label className="fw-bold mt-2">Horarios de Apertura</label>
                <div className="row g-2 mb-3 p-2 border rounded bg-light">
                    {Object.keys(form.working_hours).map(day => (
                        <div key={day} className="col-6 col-sm-4 col-md-3">
                            <label className="small mb-0">{day}</label>
                            <input 
                                className="form-control form-control-sm" 
                                type="text" 
                                placeholder="09:00-20:00"
                                value={form.working_hours[day]} 
                                onChange={(e) => setForm({
                                    ...form, 
                                    working_hours: {...form.working_hours, [day]: e.target.value}
                                })} 
                            />
                        </div>
                    ))}
                </div>

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