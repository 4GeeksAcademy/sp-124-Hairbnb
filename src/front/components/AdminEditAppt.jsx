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
    const [daysAvailability, setDaysAvailability] = useState({});
    const [startDate, setStartDate] = useState(new Date());

    const [data, setData] = useState({
        user_id: "",
        barber_id: "",
        barbershop_id: "",
        barber_service_id: "",
        date: "",
        time: "",
        notes: ""
    });

    const getDaysArray = (start) => {
        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date(start);
            d.setDate(d.getDate() + i);
            return d;
        });
    };
    const days = getDaysArray(startDate);
    const handlePrevWeek = () => {
        const newDate = new Date(startDate);
        newDate.setDate(newDate.getDate() - 7);
        setStartDate(newDate);
    };
    const handleNextWeek = () => {
        const newDate = new Date(startDate);
        newDate.setDate(newDate.getDate() + 7);
        setStartDate(newDate);
    };
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isPast = (date) => {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return d < today;
    };

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
            } catch (error) { console.error(error); }
        };
        initLoad();
    }, [id, isEditing, store.token]);

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
            } catch (error) { console.error(error); }
        };
        loadBarbers();
    }, [data.barbershop_id, store.token]);

    useEffect(() => {
        const fetchSlots = async () => {
            if (data.barber_id && data.barbershop_id && data.date && data.barber_service_id) {
                try {
                    const response = await fetch(
                        `${import.meta.env.VITE_BACKEND_URL}/barber_availability?barber_id=${data.barber_id}&barbershop_id=${data.barbershop_id}&date=${data.date}&service_id=${data.barber_service_id}`,
                        { headers: { "Authorization": `Bearer ${store.token}` } }
                    );
                    if (response.ok) setAvailableSlots(await response.json());
                } catch (error) { console.error(error); }
            }
        };
        fetchSlots();
    }, [data.date, data.barber_id, data.barber_service_id]);

    useEffect(() => {
        const checkWeek = async () => {
            if (!data.barber_id || !data.barber_service_id || !data.barbershop_id) return;
            const map = {};
            const promises = days.map(async (day) => {
                const dateStr = day.toISOString().split('T')[0];
                if (isPast(day)) return;
                try {
                    const url = `${import.meta.env.VITE_BACKEND_URL}/barber_availability?barber_id=${data.barber_id}&barbershop_id=${data.barbershop_id}&date=${dateStr}&service_id=${data.barber_service_id}`;
                    const resp = await fetch(url, { headers: { "Authorization": `Bearer ${store.token}` } });
                    if (resp.ok) {
                        const slots = await resp.json();
                        map[dateStr] = slots.length > 0;
                    }
                } catch (e) { }
            });
            await Promise.all(promises);
            setDaysAvailability(map);
        };
        checkWeek();
    }, [startDate, data.barber_id, data.barber_service_id]);

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
            }
        } catch (error) { console.error(error); }
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
            if (response.ok) navigate(-1);
        } catch (error) { console.error(error); }
    };

    return (
        <div className="container mt-4">
            <h3 className="mb-4 text-primary">{isEditing ? "Admin: Editar Cita" : "Admin: Nueva Cita"}</h3>
            <form onSubmit={handleSubmit} className="card p-4 shadow-sm">
                
                <div className={`mb-3 ${isEditing ? 'd-none' : ''}`}>
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
                <select className="form-select mb-3" value={data.barbershop_id} onChange={e => setData({ ...data, barbershop_id: e.target.value, barber_id: "", barber_service_id: "", date: "", time: "" })}>
                    <option value="">Selecciona sede...</option>
                    {store.barbershops?.map(shop => <option key={shop.id} value={shop.id}>{shop.name}</option>)}
                </select>

                <label className="form-label fw-bold">Barbero</label>
                <select className="form-select mb-3" value={data.barber_id} onChange={e => setData({ ...data, barber_id: e.target.value, barber_service_id: "", date: "", time: "" })} disabled={!data.barbershop_id}>
                    <option value="">Selecciona un barbero...</option>
                    {store.barbers?.map(b => (
                        <option key={b.id} value={b.barber?.id || b.id}>{b.barber?.name || b.name}</option>
                    ))}
                </select>

                <label className="form-label fw-bold">Servicio</label>
                <select className="form-select mb-3" value={data.barber_service_id} onChange={e => setData({ ...data, barber_service_id: e.target.value, date: "", time: "" })} disabled={!data.barber_id}>
                    <option value="">Elegir servicio...</option>
                    {currentServices.map(s => <option key={s.id} value={s.id}>{s.name} - {s.price}€</option>)}
                </select>

                <div className="mb-4">
                    <label className="form-label fw-bold">Fecha de la cita</label>
                    <div className="d-flex align-items-center justify-content-between mb-3 bg-light p-2 rounded border">
                        <button type="button" className="btn btn-sm btn-outline-primary" onClick={handlePrevWeek}><i className="fas fa-chevron-left"></i></button>
                        <div className="d-flex overflow-hidden gap-2 text-center">
                            {days.map((day, index) => {
                                const dateStr = day.toISOString().split('T')[0];
                                const isActive = data.date === dateStr;
                                const isPastDay = isPast(day);
                                const hasSlots = daysAvailability[dateStr];
                                const isFull = !isPastDay && daysAvailability.hasOwnProperty(dateStr) && !hasSlots;
                                const isDisabled = isPastDay || isFull;

                                return (
                                    <div key={index}
                                        onClick={() => { if (!isDisabled) setData({ ...data, date: dateStr, time: "" }); }}
                                        style={{ cursor: isDisabled ? 'not-allowed' : 'pointer', minWidth: '85px' }}
                                        className={`p-2 rounded transition-all border ${isActive ? 'bg-primary text-white border-primary shadow' : isFull ? 'bg-secondary-subtle text-secondary opacity-75' : isPastDay ? 'bg-light text-muted border-light' : 'bg-white border-secondary-subtle'}`}
                                    >
                                        <small className="d-block text-uppercase" style={{ fontSize: '0.65rem', fontWeight: 'bold' }}>{day.toLocaleDateString('es-ES', { weekday: 'short' })}</small>
                                        <strong className="d-block fs-5">{day.getDate()}</strong>
                                    </div>
                                );
                            })}
                        </div>
                        <button type="button" className="btn btn-sm btn-outline-primary" onClick={handleNextWeek}><i className="fas fa-chevron-right"></i></button>
                    </div>

                    <div className="mt-3">
                        <div className="d-flex flex-wrap gap-2">
                            {availableSlots.length > 0 ? (
                                availableSlots.map(slot => (
                                    <button key={slot} type="button" onClick={() => setData({ ...data, time: slot })}
                                        className={`btn btn-sm px-3 py-2 rounded-pill border ${data.time === slot ? 'btn-primary shadow-sm' : 'btn-outline-secondary bg-white'}`}>
                                        {slot}
                                    </button>
                                ))
                            ) : (
                                <div className="w-100 text-center py-2 bg-light rounded"><small className="text-muted">Sin turnos disponibles</small></div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mb-3">
                    <label className="form-label">Notas</label>
                    <textarea className="form-control" value={data.notes} onChange={e => setData({ ...data, notes: e.target.value })} placeholder="Ej: El cliente llega 5 min tarde"></textarea>
                </div>

                <div className="d-flex gap-2">
                    <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>Cancelar</button>
                    <button type="submit" className="btn btn-success" disabled={!data.user_id || !data.time}>Guardar Cita</button>
                </div>
            </form>
        </div>
    );
};