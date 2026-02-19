import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const ApptFormBarber = () => {
    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();

    const preData = store.appointmentInfo || {};
    const isEditing = !!preData.id;

    const [phoneSearch, setPhoneSearch] = useState("");
    const [foundUser, setFoundUser] = useState(null);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [daysAvailability, setDaysAvailability] = useState({});
    const [startDate, setStartDate] = useState(new Date());

    const [data, setData] = useState({
        user_id: preData.user_id || "",
        barber_id: store.userInfo?.id || "",
        barbershop_id: preData.barbershop_id || "",
        barber_service_id: preData.barber_service_id || "",
        date: preData.date ? preData.date.split("T")[0] : "",
        time: preData.date ? preData.date.split("T")[1].slice(0, 5) : "",
        notes: preData.notes || ""
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

    useEffect(() => {
        const loadServices = async () => {
            const token = store.token || localStorage.getItem("token");
            const responseServices = await fetch(`${import.meta.env.VITE_BACKEND_URL}/barber_services`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (responseServices.ok) {
                const resData = await responseServices.json();
                dispatch({ type: "set-barber_services", payload: resData });
            }
        };
        loadServices();
    }, [dispatch, store.token]);

    useEffect(() => {
        const fetchSlots = async () => {
            const currentBarberId = data.barber_id || store.userInfo?.id;
            if (currentBarberId && data.barbershop_id && data.date && data.barber_service_id) {
                const url = `${import.meta.env.VITE_BACKEND_URL}/barber_availability?barber_id=${currentBarberId}&barbershop_id=${data.barbershop_id}&date=${data.date}&service_id=${data.barber_service_id}`;
                try {
                    const responseSlots = await fetch(url, { headers: { "Authorization": `Bearer ${store.token}` } });
                    if (responseSlots.ok) {
                        const slots = await responseSlots.json();
                        setAvailableSlots(slots);
                    }
                } catch (error) { console.error(error); }
            }
        };
        fetchSlots();
    }, [data.date, data.barber_service_id, data.barbershop_id]);

    useEffect(() => {
        const checkMultipleDays = async () => {
            const currentBarberId = data.barber_id || store.userInfo?.id;
            if (!currentBarberId || !data.barbershop_id || !data.barber_service_id) return;
            const availabilityMap = {};
            const promises = days.map(async (day) => {
                const dateStr = day.toISOString().split('T')[0];
                if (isPast(day)) return;
                try {
                    const url = `${import.meta.env.VITE_BACKEND_URL}/barber_availability?barber_id=${currentBarberId}&barbershop_id=${data.barbershop_id}&date=${dateStr}&service_id=${data.barber_service_id}`;
                    const resp = await fetch(url, { headers: { "Authorization": `Bearer ${store.token}` } });
                    if (resp.ok) {
                        const slots = await resp.json();
                        availabilityMap[dateStr] = slots.length > 0;
                    }
                } catch (e) { console.error(e); }
            });
            await Promise.all(promises);
            setDaysAvailability(availabilityMap);
        };
        checkMultipleDays();
    }, [startDate, data.barber_service_id, data.barbershop_id]);

    const handleSearchUser = async () => {
        if (!phoneSearch) return;
        try {
            const responseUser = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/search?phone=${phoneSearch}`, {
                headers: { "Authorization": `Bearer ${store.token}` }
            });
            if (responseUser.ok) {
                const user = await responseUser.json();
                setFoundUser(user);
                setData(prev => ({ ...prev, user_id: user.id }));
            }
        } catch (error) { console.error(error); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            user_id: Number(data.user_id),
            barber_id: Number(data.barber_id || store.userInfo?.id),
            barbershop_id: Number(data.barbershop_id),
            barber_service_id: Number(data.barber_service_id),
            date: `${data.date}T${data.time}:00`,
            notes: data.notes
        };
        const url = `${import.meta.env.VITE_BACKEND_URL}/appointments${isEditing ? `/${preData.id}` : ""}`;
        try {
            const response = await fetch(url, {
                method: isEditing ? "PUT" : "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${store.token}` },
                body: JSON.stringify(payload)
            });
            if (response.ok) {
                dispatch({ type: "set-appointmentInfo", payload: null });
                dispatch({ type: "set-message", payload: { "type": "success", "msg": "Cita guardada" } });
                navigate(-1);
            }
        } catch (error) { console.error(error); }
    };

    const currentServices = store.barber_services?.filter(s =>
        Number(s.barber_id) === Number(store.userInfo?.id)
    ) || [];

    return (
        <div className="container mt-4">
            <h2 className="text-center mb-4">{isEditing ? "Modificar Cita" : "Nueva Cita (Barbero)"}</h2>
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

                <label className="form-label">Sede</label>
                <select className="form-select mb-3" required value={data.barbershop_id}
                    onChange={e => setData({ ...data, barbershop_id: e.target.value, barber_service_id: "", time: "", date: "" })}>
                    <option value="">Selecciona una sede...</option>
                    {store.invitations?.filter(inv => inv.status === "accepted").map(inv => (
                        <option key={inv.barbershop.id} value={inv.barbershop.id}>{inv.barbershop.name}</option>
                    ))}
                </select>

                <label className="form-label">Servicio</label>
                <select className="form-select mb-3" disabled={!data.barbershop_id} required value={data.barber_service_id}
                    onChange={e => setData({ ...data, barber_service_id: e.target.value, time: "", date: "" })}>
                    <option value="">Elegir servicio...</option>
                    {currentServices?.map(s => (
                        <option key={s.id} value={s.id}>{s.name} - {s.price}€</option>
                    ))}
                </select>

                <div className="mb-4">
                    <label className="form-label fw-bold">Selecciona el momento ideal</label>
                    <div className="d-flex align-items-center justify-content-between mb-3 bg-light p-2 rounded border">
                        <button type="button" className="btn btn-sm btn-outline-primary" onClick={handlePrevWeek}>
                            <i className="fas fa-chevron-left"></i> Anterior
                        </button>
                        <div className="d-flex overflow-hidden gap-2 text-center">
                            {days.map((day, index) => {
                                const dateString = day.toISOString().split('T')[0];
                                const isActive = data.date === dateString;
                                const isPastDay = isPast(day);
                                const hasSlots = daysAvailability[dateString];
                                const isFullOrClosed = !isPastDay && daysAvailability.hasOwnProperty(dateString) && !hasSlots;
                                const isDisabled = isPastDay || isFullOrClosed;

                                return (
                                    <div key={index}
                                        onClick={() => { if (!isDisabled) { setAvailableSlots([]); setData({ ...data, date: dateString, time: "" }); } }}
                                        style={{ cursor: isDisabled ? 'not-allowed' : 'pointer', minWidth: '85px', position: 'relative' }}
                                        className={`p-2 rounded transition-all border ${isActive ? 'bg-primary text-white border-primary shadow' : isFullOrClosed ? 'bg-secondary-subtle text-secondary border-secondary-subtle opacity-75' : isPastDay ? 'bg-light text-muted border-light' : 'bg-white border-secondary-subtle'}`}
                                    >
                                        <small className="d-block text-uppercase" style={{ fontSize: '0.65rem', fontWeight: 'bold' }}>
                                            {day.toLocaleDateString('es-ES', { weekday: 'short' })}
                                        </small>
                                        <strong className="d-block fs-5">{day.getDate()}</strong>
                                    </div>
                                );
                            })}
                        </div>
                        <button type="button" className="btn btn-sm btn-outline-primary" onClick={handleNextWeek}>
                            Siguiente <i className="fas fa-chevron-right"></i>
                        </button>
                    </div>

                    <div className="mt-3">
                        <label className="form-label small text-muted">
                            Horas disponibles para el {data.date ? data.date.split("-").reverse().join("/") : "..."}
                        </label>
                        <div className="d-flex flex-wrap gap-2">
                            {availableSlots.length > 0 ? (
                                availableSlots.map(slot => (
                                    <button key={slot} type="button" onClick={() => setData({ ...data, time: slot })}
                                        className={`btn btn-sm px-3 py-2 rounded-pill border ${data.time === slot ? 'btn-primary shadow-sm' : 'btn-outline-secondary bg-white'}`}>
                                        {slot}
                                    </button>
                                ))
                            ) : (
                                <div className="w-100 text-center py-3 border rounded border-dashed bg-light">
                                    <small className="text-muted">{data.date ? "No hay disponibilidad." : "Selecciona un día primero."}</small>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mb-4">
                    <label className="form-label">Notas adicionales</label>
                    <textarea className="form-control" rows="2" value={data.notes} onChange={e => setData({ ...data, notes: e.target.value })} placeholder="Notas..."></textarea>
                </div>

                <div className="d-flex justify-content-between">
                    <button type="button" className="btn btn-outline-secondary" onClick={() => navigate(-1)}>Cancelar</button>
                    <button type="submit" className="btn btn-primary" disabled={!data.user_id || !data.time}>
                        {isEditing ? "Guardar Cambios" : "Confirmar Reserva"}
                    </button>
                </div>
            </form>
        </div>
    );
};