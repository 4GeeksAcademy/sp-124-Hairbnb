import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const ApptFormOwner = () => {
    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();

    const preData = store.appointmentInfo || {};
    const isEditing = !!preData.id;

    const [phoneSearch, setPhoneSearch] = useState("");
    const [foundUser, setFoundUser] = useState(null);

    const [availableSlots, setAvailableSlots] = useState([]);
    const [daysAvailability, setDaysAvailability] = useState({});
    const [isChecking, setIsChecking] = useState(false);
    const [startDate, setStartDate] = useState(new Date());

    const [data, setData] = useState({
        user_id: preData.user_id || "",
        barber_id: preData.barber_id || "",
        barbershop_id: preData.barbershop_id || "",
        barber_service_id: preData.barber_service_id || "",
        date: preData.date ? preData.date.split("T")[0] : "",
        time: preData.date ? preData.date.split("T")[1].slice(0, 5) : "",
        notes: preData.notes || ""
    });

    const isCalendarDisabled = !data.barbershop_id || !data.barber_id || !data.barber_service_id;

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


    useEffect(() => {
        const loadBarbersByShop = async () => {
            if (!data.barbershop_id) return;
            const token = store.token || localStorage.getItem("token");
            try {
                const responseBarbers = await fetch(`${import.meta.env.VITE_BACKEND_URL}/barbershops/${data.barbershop_id}/barbers`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (responseBarbers.ok) {
                    const barbersData = await responseBarbers.json();
                    dispatch({ type: "set-barbers", payload: barbersData });
                }
            } catch (error) { console.error(error); }
        };
        loadBarbersByShop();
    }, [data.barbershop_id, store.token]);

    useEffect(() => {
        const loadServices = async () => {
            const token = store.token || localStorage.getItem("token");
            try {
                const responseServices = await fetch(`${import.meta.env.VITE_BACKEND_URL}/barber_services`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (responseServices.ok) {
                    const servicesData = await responseServices.json();
                    dispatch({ type: "set-barber_services", payload: servicesData });
                }
            } catch (error) { console.error(error); }
        };
        loadServices();
    }, [store.token]);

    useEffect(() => {
        const checkMultipleDays = async () => {
            if (isCalendarDisabled) return;

            setIsChecking(true);
            const availabilityMap = {};

            const promises = days.map(async (day) => {
                const dateStr = day.toISOString().split('T')[0];
                if (isPast(day)) return;

                try {
                    const url = `${import.meta.env.VITE_BACKEND_URL}/barber_availability?barber_id=${data.barber_id}&barbershop_id=${data.barbershop_id}&date=${dateStr}&service_id=${data.barber_service_id}`;
                    const resp = await fetch(url, { headers: { "Authorization": `Bearer ${store.token}` } });
                    if (resp.ok) {
                        const slots = await resp.json();
                        availabilityMap[dateStr] = slots.length > 0;
                    }
                } catch (e) { console.error(e); }
            });

            await Promise.all(promises);
            setDaysAvailability(availabilityMap);
            setIsChecking(false);
        };
        checkMultipleDays();
    }, [startDate, data.barber_id, data.barber_service_id, data.barbershop_id]);

    useEffect(() => {
        const fetchSlots = async () => {
            if (data.barber_id && data.barbershop_id && data.date && data.barber_service_id) {
                const url = `${import.meta.env.VITE_BACKEND_URL}/barber_availability?barber_id=${data.barber_id}&barbershop_id=${data.barbershop_id}&date=${data.date}&service_id=${data.barber_service_id}`;
                try {
                    const resp = await fetch(url, { headers: { "Authorization": `Bearer ${store.token}` } });
                    if (resp.ok) setAvailableSlots(await resp.json());
                } catch (e) { console.error(e); }
            }
        };
        fetchSlots();
    }, [data.date, data.barber_id, data.barber_service_id]);

    const currentBarbers = store.barbers?.filter(inv => inv.status === "accepted" && Number(inv.barbershop_id) === Number(data.barbershop_id)) || [];
    const currentServices = store.barber_services?.filter(s => Number(s.barber_id) === Number(data.barber_id)) || [];

    const handleSearchUser = async () => {
        if (!phoneSearch) return;
        try {
            const resp = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/search?phone=${phoneSearch}`, {
                headers: { "Authorization": `Bearer ${store.token}` }
            });
            if (resp.ok) {
                const user = await resp.json();
                setFoundUser(user);
                setData(prev => ({ ...prev, user_id: user.id }));
            }
        } catch (e) { console.error(e); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            user_id: Number(data.user_id),
            barber_id: Number(data.barber_id),
            barbershop_id: Number(data.barbershop_id),
            barber_service_id: Number(data.barber_service_id),
            date: `${data.date}T${data.time}:00`,
            notes: data.notes
        };
        try {
            const resp = await fetch(`${import.meta.env.VITE_BACKEND_URL}/appointments${isEditing ? `/${preData.id}` : ""}`, {
                method: isEditing ? "PUT" : "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${store.token}` },
                body: JSON.stringify(payload)
            });
            if (resp.ok) {
                dispatch({ type: "set-appointmentInfo", payload: null });
                dispatch({ type: "set-message", payload: { "type": "success", "msg": "Cita gestionada" } });
                navigate(-1);
            }
        } catch (e) { console.error(e); }
    };

    if (store.role !== "owner") return <div className="container mt-4">Acceso denegado</div>;

    return (
        <div className="container mt-4">
            <h2 className="text-center mb-4">{isEditing ? "Modificar Cita" : "Nueva Reserva (Gestión)"}</h2>
            <form onSubmit={handleSubmit} className="card p-4 shadow-sm border-0">

                <div className={`mb-3 ${isEditing ? 'd-none' : ''}`}>
                    <label className="form-label">Cliente</label>
                    {foundUser ? (
                        <div className="d-flex justify-content-between align-items-center p-2 alert alert-light border">
                            <span><strong>{foundUser.name} {foundUser.last_name}</strong></span>
                            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => { setFoundUser(null); setData({ ...data, user_id: "" }) }}>Cambiar</button>
                        </div>
                    ) : (
                        <div className="input-group">
                            <input type="text" className="form-control" placeholder="Buscar por teléfono..." value={phoneSearch} onChange={e => setPhoneSearch(e.target.value)} />
                            <button type="button" className="btn btn-dark" onClick={handleSearchUser}>Buscar</button>
                        </div>
                    )}
                </div>

                <label className="form-label">Lugar</label>
                <select className="form-select mb-3" required value={data.barbershop_id}
                    onChange={e => setData({ ...data, barbershop_id: e.target.value, barber_id: "", barber_service_id: "", time: "", date: "" })}>
                    <option value="">Selecciona un local</option>
                    {store.barbershops?.map(shop => (
                        <option key={shop.id} value={shop.id}>{shop.name}</option>
                    ))}
                </select>

                <label className="form-label">Barbero</label>
                <select className="form-select mb-3" disabled={!data.barbershop_id} required value={data.barber_id}
                    onChange={e => setData({ ...data, barber_id: e.target.value, barber_service_id: "", time: "", date: "" })}>
                    <option value="">Selecciona un profesional</option>
                    {currentBarbers?.map(inv => (
                        <option key={inv.id} value={inv.barber?.id || inv.id}>{inv.barber?.name || inv.name}</option>
                    ))}
                </select>

                <label className="form-label">Servicio</label>
                <select className="form-select mb-3" disabled={!data.barber_id} required value={data.barber_service_id}
                    onChange={e => setData({ ...data, barber_service_id: e.target.value, time: "", date: "" })}>
                    <option value="">Elege servicio</option>
                    {currentServices?.map(s => (
                        <option key={s.id} value={s.id}>{s.name} - {s.price}€</option>
                    ))}
                </select>

                <div className={`mb-4 ${isCalendarDisabled ? "opacity-50" : ""}`} style={{ pointerEvents: isCalendarDisabled ? 'none' : 'auto' }}>
                    <label className="form-label fw-bold">Fecha de la cita</label>
                    <div className="d-flex align-items-center justify-content-between mb-3 bg-light p-2 rounded border">
                        <button type="button" className="btn btn-sm btn-outline-primary" onClick={handlePrevWeek}><i className="fas fa-chevron-left"></i></button>

                        <div className={`d-flex overflow-hidden gap-2 text-center transition-all ${isChecking ? "opacity-25" : "opacity-100"}`} style={{ minHeight: '80px' }}>
                            {isChecking ? (
                                <div className="w-100 d-flex align-items-center justify-content-center">
                                    <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
                                    <span className="ms-2 small text-muted">Consultando agenda...</span>
                                </div>
                            ) : (
                                days.map((day, index) => {
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
                                })
                            )}
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
                                <div className="w-100 text-center py-2 bg-light rounded">
                                    <small className="text-muted">{data.date ? "No hay turnos disponibles" : "Selecciona un día para ver disponibilidad."}</small>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mb-4">
                    <label className="form-label">Notas</label>
                    <textarea className="form-control" rows="2" value={data.notes} onChange={e => setData({ ...data, notes: e.target.value })}></textarea>
                </div>

                <div className="d-flex justify-content-between">
                    <button type="button" className="btn btn-outline-secondary" onClick={() => navigate(-1)}>Cancelar</button>
                    <button type="submit" className="btn btn-primary" disabled={!data.user_id || !data.time}>Guardar Cita</button>
                </div>
            </form>
        </div>
    );
};