import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { uploadToCloudinary } from "../utilities/cloudinary";
import { APILoader, PlacePicker } from '@googlemaps/extended-component-library/react';

export const AdminEditBarbershop = () => {
    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = !!id;
    const [owners, setOwners] = useState([]);
    const [uploading, setUploading] = useState(false);

    const defaultHours = {
        Lunes: { m_start: "", m_end: "", a_start: "", a_end: "" },
        Martes: { m_start: "", m_end: "", a_start: "", a_end: "" },
        Miércoles: { m_start: "", m_end: "", a_start: "", a_end: "" },
        Jueves: { m_start: "", m_end: "", a_start: "", a_end: "" },
        Viernes: { m_start: "", m_end: "", a_start: "", a_end: "" },
        Sábado: { m_start: "", m_end: "", a_start: "", a_end: "" },
        Domingo: { m_start: "", m_end: "", a_start: "", a_end: "" }
    };

    const [form, setForm] = useState({
        name: "",
        address: "",
        phone: "",
        owner_id: "",
        barbershop_image: "",
        barbershop_description: "",
        latitude: null,
        longitude: null,
        working_hours: defaultHours
    });

    useEffect(() => {
        const fetchOwners = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/admin/owners`, {
                    headers: { "Authorization": `Bearer ${store.token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setOwners(data);
                }
            } catch (error) { console.error("Error:", error); }
        };
        fetchOwners();
    }, [store.token]);

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
                        owner_id: data.owner_id || "",
                        barbershop_image: data.barbershop_image || "",
                        barbershop_description: data.barbershop_description || "",
                        latitude: data.latitude || null,
                        longitude: data.longitude || null,
                        working_hours: (data.working_hours && Object.keys(data.working_hours).length > 0)
                            ? data.working_hours : defaultHours,
                    });
                }
            } catch (error) { console.error("Error:", error); }
        };
        loadBarbershopData();
    }, [id, isEditing, store.token]);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        const imageUrl = await uploadToCloudinary(file);
        if (imageUrl) {
            setForm(prev => ({ ...prev, barbershop_image: imageUrl }));
        }
        setUploading(false);
    };

    const handlePlaceChange = (e) => {
        const place = e.target.value;
        if (place && place.location) {
            setForm(prev => ({
                ...prev,
                address: place.formattedAddress || place.displayName,
                latitude: place.location.lat(),
                longitude: place.location.lng()
            }));
        }
    };

    const handleHourChange = (day, field, value) => {
        setForm(prev => ({
            ...prev,
            working_hours: { ...prev.working_hours, [day]: { ...prev.working_hours[day], [field]: value } }
        }));
    };

    const handleSubmit = async e => {
        e.preventDefault();
        const method = isEditing ? "PUT" : "POST";
        const url = isEditing ? `${import.meta.env.VITE_BACKEND_URL}/barbershops/${id}` : `${import.meta.env.VITE_BACKEND_URL}/barbershops`;

        try {
            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${store.token}` },
                body: JSON.stringify(form)
            });
            if (response.ok) {
                dispatch({ type: "set-message", payload: { type: "success", msg: "Guardado correctamente" } });
                navigate("/4dm1n1str4t10n");
            }
        } catch (err) { console.error(err); }
    };

    return (
        <div className="container py-5" style={{ maxWidth: '950px' }}>
            <APILoader apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY} />
            <div className="booking-card shadow-lg">
                <div className="booking-header">
                    <h2 className="Oswald mb-0 text-uppercase fw-bold">{isEditing ? "Editar local asociado" : "Nuevo local asociado"}</h2>
                </div>

                <form className="p-4 p-md-5" onSubmit={handleSubmit}>
                    <div className="row g-4">
                        <div className="col-md-7 form-group-custom">
                            <label>Nombre del negocio</label>
                            <input className="select-custom" name="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                        </div>
                        <div className="col-md-5 form-group-custom">
                            <label>Dueño</label>
                            <select className="select-custom border-gold" name="owner_id" value={form.owner_id} onChange={(e) => setForm({ ...form, owner_id: e.target.value })} required>
                                <option value="">Seleccionar dueño</option>
                                {owners.map(o => <option key={o.id} value={o.id}>{o.name} {o.last_name}</option>)}
                            </select>
                        </div>

                        <div className="col-md-4">
                            <label className="Oswald text-uppercase small fw-bold mb-2 d-block text-gold">Imagen de Sede</label>
                            <div className="image-upload-wrapper border rounded p-2 text-center bg-light">
                                {form.barbershop_image ? (
                                    <img src={form.barbershop_image} alt="Preview" className="img-fluid rounded mb-2" style={{ maxHeight: "150px", objectFit: 'cover' }} />
                                ) : (
                                    <div className="py-4 text-muted"><i className="fas fa-camera fa-2x"></i></div>
                                )}
                                <input type="file" className="form-control form-control-sm" onChange={handleFileChange} disabled={uploading} />
                                {uploading && <div className="spinner-border spinner-border-sm text-gold mt-2"></div>}
                            </div>
                        </div>

                        <div className="col-md-8 form-group-custom">
                            <label>Descripción (opcional)</label>
                            <textarea className="select-custom" rows="5" value={form.barbershop_description}
                                onChange={(e) => setForm({ ...form, barbershop_description: e.target.value })} placeholder="Descripción del lugar" />
                        </div>

                        <div className="col-md-4 form-group-custom">
                            <label>Teléfono</label>
                            <input className="select-custom" type="text" value={form.phone} maxLength="9" onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "") })} />
                        </div>

                        <div className="col-md-8 form-group-custom">
                            <label>Dirección</label>
                            <div className="google-picker-container">
                                <PlacePicker placeholder={form.address || "Localizar..."} onPlaceChange={handlePlaceChange} />
                            </div>
                        </div>

                        <div className="col-12 mt-4">
                            <h5 className="Oswald text-uppercase fw-bold border-bottom pb-2 mb-4 text-gold">Horarios</h5>
                            <div className="schedule-grid">
                                {Object.keys(defaultHours).map(day => (
                                    <div key={day} className="day-row-premium d-flex flex-wrap align-items-center p-3 mb-2 rounded bg-white border">
                                        <div className="day-name Oswald fw-bold" style={{ width: '100px' }}>{day}</div>
                                        <div className="d-flex align-items-center gap-2 me-4 flex-grow-1">
                                            <div className="form-check form-switch me-1">
                                                <input className="form-check-input custom-switch" type="checkbox" checked={!!(form.working_hours[day]?.m_start)}
                                                    onChange={(e) => {
                                                        handleHourChange(day, "m_start", e.target.checked ? "09:00" : "");
                                                        handleHourChange(day, "m_end", e.target.checked ? "14:00" : "");
                                                    }} />
                                            </div>
                                            <span className="small text-muted Oswald">MAÑANA:</span>
                                            <input type="time" className="time-input-minimal" value={form.working_hours[day]?.m_start || ""} disabled={!form.working_hours[day]?.m_start} onChange={(e) => handleHourChange(day, "m_start", e.target.value)} />
                                            <input type="time" className="time-input-minimal" value={form.working_hours[day]?.m_end || ""} disabled={!form.working_hours[day]?.m_start} onChange={(e) => handleHourChange(day, "m_end", e.target.value)} />
                                        </div>
                                        <div className="d-flex align-items-center gap-2 flex-grow-1">
                                            <div className="form-check form-switch me-1">
                                                <input className="form-check-input custom-switch" type="checkbox" checked={!!(form.working_hours[day]?.a_start)}
                                                    onChange={(e) => {
                                                        handleHourChange(day, "a_start", e.target.checked ? "16:00" : "");
                                                        handleHourChange(day, "a_end", e.target.checked ? "20:00" : "");
                                                    }} />
                                            </div>
                                            <span className="small text-muted Oswald">TARDE:</span>
                                            <input type="time" className="time-input-minimal" value={form.working_hours[day]?.a_start || ""} disabled={!form.working_hours[day]?.a_start} onChange={(e) => handleHourChange(day, "a_start", e.target.value)} />
                                            <input type="time" className="time-input-minimal" value={form.working_hours[day]?.a_end || ""} disabled={!form.working_hours[day]?.a_start} onChange={(e) => handleHourChange(day, "a_end", e.target.value)} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="d-flex justify-content-between mt-5 pt-4 border-top">
                        <button type="button" className="btn btn-link text-muted text-decoration-none Oswald" onClick={() => navigate(-1)}>VOLVER</button>
                        <button type="submit" className="btn-confirm px-5 shadow" disabled={uploading}>
                            {uploading ? "SUBIENDO..." : "GUARDAR"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};