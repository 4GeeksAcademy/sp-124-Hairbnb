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

    useEffect(() => {
        const initLoad = async () => {
            const token = store.token;
            
            const resShops = await fetch(`${import.meta.env.VITE_BACKEND_URL}/barbershops`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (resShops.ok) {
                const shops = await resShops.json();
                dispatch({ type: "set-barbershops", payload: shops });
            }

            if (isEditing) {
                const resAppt = await fetch(`${import.meta.env.VITE_BACKEND_URL}/appointments/${id}`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
if (resAppt.ok) {
    const appt = await resAppt.json();
    
    setFoundUser({
        id: appt.user_id,
        name: appt.user_name,
    });

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
        };
        initLoad();
    }, [id, isEditing, store.token]);

    useEffect(() => {
        if (!data.barbershop_id) return;
        const loadBarbers = async () => {
            const resp = await fetch(`${import.meta.env.VITE_BACKEND_URL}/barbershops/${data.barbershop_id}/barbers`, {
                headers: { "Authorization": `Bearer ${store.token}` }
            });
            if (resp.ok) {
                const barbersData = await resp.json();
                dispatch({ type: "set-barbers", payload: barbersData.filter(b => b.status === "accepted") });
            }
        };
        loadBarbers();
    }, [data.barbershop_id]);

    useEffect(() => {
        const fetchSlots = async () => {
            if (data.barber_id && data.barbershop_id && data.date && data.barber_service_id) {
                const resp = await fetch(
                    `${import.meta.env.VITE_BACKEND_URL}/barber_availability?barber_id=${data.barber_id}&barbershop_id=${data.barbershop_id}&date=${data.date}&service_id=${data.barber_service_id}`,
                    { headers: { "Authorization": `Bearer ${store.token}` } }
                );
                if (resp.ok) setAvailableSlots(await resp.json());
            }
        };
        fetchSlots();
    }, [data.date, data.barber_id, data.barbershop_id, data.barber_service_id]);

    useEffect(() => {
        const loadServices = async () => {
            const resp = await fetch(`${import.meta.env.VITE_BACKEND_URL}/barber_services`, {
                headers: { "Authorization": `Bearer ${store.token}` }
            });
            if (resp.ok) dispatch({ type: "set-barber_services", payload: await resp.json() });
        };
        loadServices();
    }, []);

    const currentServices = store.barber_services?.filter(s => Number(s.barber_id) === Number(data.barber_id)) || [];

    const handleSearchUser = async () => {
        if (!phoneSearch) return;
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/search?phone=${phoneSearch}`, {
            headers: { "Authorization": `Bearer ${store.token}` }
        });
        if (res.ok) {
            const user = await res.json();
            setFoundUser(user);
            setData(prev => ({ ...prev, user_id: user.id }));
        } else {
            dispatch({ type: "set-message", payload: { type: "error", msg: "Usuario no encontrado" } });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = { ...data, date: `${data.date}T${data.time}:00` };
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/appointments${isEditing ? `/${id}` : ""}`, {
            method: isEditing ? "PUT" : "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${store.token}` },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            dispatch({ type: "set-message", payload: { type: "success", msg: "Cita guardada correctamente" } });
            navigate(-1);
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