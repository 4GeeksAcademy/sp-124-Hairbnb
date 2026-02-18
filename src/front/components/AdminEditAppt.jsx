import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const AdminEditAppt = () => {
    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = !!id;

    const [phoneSearch, setPhoneSearch] = useState("");
    const [foundUser, setFoundUser] = useState(null);
    const [availableSlots, setAvailableSlots] = useState([]);

    const [data, setData] = useState({
        user_id: "",
        barber_id: "",
        barbershop_id: "",
        barber_service_id: "",
        date: "",
        time: "",
        notes: ""
    });

    
    const currentServices = (() => {
        if (!data.barber_id || !store.barbers) return [];
        const barber = store.barbers.find(b => 
            (b.barber?.id?.toString() === data.barber_id.toString()) || 
            (b.id?.toString() === data.barber_id.toString())
        );
        return barber?.barber_services || barber?.services || [];
    })();

    useEffect(() => {
        const initLoad = async () => {
            const token = store.token;
            try {
                const responseShops = await fetch(`${import.meta.env.VITE_BACKEND_URL}/barbershops`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (responseShops.ok) {
                    const shops = await responseShops.json();
                    dispatch({ type: "set-barbershops", payload: shops });
                }

                if (isEditing) {
                    const responseAppt = await fetch(`${import.meta.env.VITE_BACKEND_URL}/appointments/${id}`, {
                        headers: { "Authorization": `Bearer ${token}` }
                    });
                    if (responseAppt.ok) {
                        const appt = await responseAppt.json();
                        setFoundUser({ id: appt.user_id, name: appt.user_name });
                        
                        const datePart = appt.date ? appt.date.split("T")[0] : "";
                        const timePart = appt.date ? appt.date.split("T")[1].slice(0, 5) : "";
                        
                        setData({
                            user_id: appt.user_id,
                            barber_id: appt.barber_id,
                            barbershop_id: appt.barbershop_id,
                            barber_service_id: appt.barber_service_id,
                            date: appt.date ? appt.date.split("T")[0] : "",
                            time: appt.date ? appt.date.split("T")[1].slice(0, 5) : "",
                            notes: appt.notes || ""
                        });
                    }
                }
            } catch (error) {
                console.error("Error en carga inicial:", error);
            }
        };
        initLoad();
    }, [id, isEditing, store.token, dispatch]);

    useEffect(() => {
        if (!data.barbershop_id) return;
        const loadBarbers = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/barbershops/${data.barbershop_id}/barbers`, {
                    headers: { "Authorization": `Bearer ${store.token}` }
                });
                if (response.ok) {
                    const barbersData = await response.json();
                    dispatch({ type: "set-barbers", payload: barbersData.filter(b => b.status === "accepted") });
                }
            } catch (error) {
                console.error("Error cargando barberos:", error);
            }
        };
        loadBarbers();
    }, [data.barbershop_id, store.token, dispatch]);

    useEffect(() => {
        const fetchSlots = async () => {
            if (data.barber_id && data.barbershop_id && data.date && data.barber_service_id) {
                try {
                    const response = await fetch(
                        `${import.meta.env.VITE_BACKEND_URL}/barber_availability?barber_id=${data.barber_id}&barbershop_id=${data.barbershop_id}&date=${data.date}&service_id=${data.barber_service_id}`,
                        { headers: { "Authorization": `Bearer ${store.token}` } }
                    );
                    if (response.ok) {
                        const slots = await response.json();
                        setAvailableSlots(slots);
                    }
                } catch (error) {
                    console.error("Error cargando slots:", error);
                }
            }
        };
        fetchSlots();
    }, [data.date, data.barber_id, data.barbershop_id, data.barber_service_id, store.token]);

    const handleSearchUser = async () => {
        if (!phoneSearch) return;
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/search?phone=${phoneSearch}`, {
                headers: { "Authorization": `Bearer ${store.token}` }
            });
            if (response.ok) {
                const user = await response.json();
                setFoundUser(user);
                setData(prev => ({ ...prev, user_id: user.id }));
            } else {
                dispatch({ type: "set-message", payload: { type: "error", msg: "Usuario no encontrado" } });
            }
        } catch (error) {
            dispatch({ type: "set-message", payload: { type: "error", msg: "Error de conexión al buscar usuario" } });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = { ...data, date: `${data.date}T${data.time}:00` };
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/appointments${isEditing ? `/${id}` : ""}`, {
                method: isEditing ? "PUT" : "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${store.token}` },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                dispatch({ type: "set-message", payload: { type: "success", msg: "Cita guardada correctamente" } });
                navigate(-1);
            } else {
                const errorData = await response.json();
                dispatch({ type: "set-message", payload: { type: "error", msg: errorData.msg || "Error al guardar la cita" } });
            }
        } catch (error) {
            dispatch({ type: "set-message", payload: { type: "error", msg: "Error de conexión con el servidor" } });
        }
    };
    return (
        <div className="container mt-4">
            <h3 className="mb-4 text-primary">{isEditing ? "Admin: Editar Cita" : "Admin: Nueva Cita"}</h3>
            <form onSubmit={handleSubmit} className="card p-4 shadow-sm">

                <div className="mb-3">
                    <label className="form-label fw-bold">Cliente</label>
                    {foundUser ? (
                        <div className="alert alert-info d-flex justify-content-between align-items-center">
                            <span><strong>{foundUser.name}</strong></span>
                            <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => { setFoundUser(null); setData({ ...data, user_id: "" }) }}>Cambiar</button>
                        </div>
                    ) : (
                        <div className="input-group">
                            <input type="text" className="form-control" placeholder="Buscar por teléfono..." value={phoneSearch} onChange={e => setPhoneSearch(e.target.value)} />
                            <button type="button" className="btn btn-primary" onClick={handleSearchUser}>Buscar</button>
                        </div>
                    )}
                </div>

                <label className="form-label fw-bold">Sede (Barbería)</label>
                <select className="form-select mb-3" value={data.barbershop_id} onChange={e => setData({ ...data, barbershop_id: e.target.value, barber_id: "", barber_service_id: "" })}>
                    <option value="">Selecciona sede...</option>
                    {store.barbershops?.map(shop => <option key={shop.id} value={shop.id}>{shop.name}</option>)}
                </select>

                <label className="form-label fw-bold">Barbero</label>
                <select className="form-select mb-3" value={data.barber_id} onChange={e => setData({ ...data, barber_id: e.target.value, barber_service_id: "" })} disabled={!data.barbershop_id}>
                    <option value="">Selecciona un barbero...</option>
                    {store.barbers?.map(b => (
                        <option key={b.id} value={b.barber?.id || b.id}>{b.barber?.name || b.name}</option>
                    ))}
                </select>

                <label className="form-label fw-bold">Servicio</label>
                <select className="form-select mb-3" value={data.barber_service_id} onChange={e => setData({ ...data, barber_service_id: e.target.value })} disabled={!data.barber_id}>
                    <option value="">Elegir servicio...</option>
                    {currentServices.map(s => <option key={s.id} value={s.id}>{s.name} - {s.price}€</option>)}
                </select>

                <div className="row mb-3">
                    <div className="col-6">
                        <label className="form-label fw-bold">Fecha</label>
                        <input type="date" className="form-control" value={data.date} onChange={e => setData({ ...data, date: e.target.value })} />
                    </div>
                    <div className="col-6">
                        <label className="form-label fw-bold">Hora</label>
                        <select className="form-select" value={data.time} onChange={e => setData({ ...data, time: e.target.value })} disabled={availableSlots.length === 0}>
                            <option value="">{availableSlots.length > 0 ? "Selecciona hora" : "Sin disponibilidad"}</option>
                            {availableSlots.map(slot => <option key={slot} value={slot}>{slot}</option>)}
                        </select>
                    </div>
                </div>

                <div className="mb-3">
                    <label className="form-label fw-bold">Notas</label>
                    <textarea className="form-control" value={data.notes} onChange={e => setData({ ...data, notes: e.target.value })} placeholder="Ej: El cliente llega 5 min tarde"></textarea>
                </div>

                <div className="d-flex gap-2">
                    <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>Cancelar</button>
                    <button type="submit" className="btn btn-success flex-grow-1" disabled={!data.user_id || !data.time}>Guardar Cita</button>
                </div>
            </form>
        </div>
    );
};