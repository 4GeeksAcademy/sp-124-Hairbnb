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
    const [isChecking, setIsChecking] = useState(false);
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

    const getLocalDateString = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const isCalendarDisabled = !data.barbershop_id || !data.barber_service_id;

    const getDaysArray = (start) => {
        const d = new Date(start);
        const dayName = d.getDay();
        const diff = d.getDate() - dayName + (dayName === 0 ? -6 : 1);
        const monday = new Date(d.setDate(diff));

        return Array.from({ length: 7 }, (_, i) => {
            const date = new Date(monday);
            date.setDate(monday.getDate() + i);
            return date;
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
            try {
                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/barber_services`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (response.ok) {
                    const resData = await response.json();
                    dispatch({ type: "set-barber_services", payload: resData });
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
                const dateStr = getLocalDateString(day)
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
    }, [startDate, data.barber_service_id, data.barbershop_id]);

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
    }, [data.date, data.barber_service_id, data.barbershop_id]);

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
                dispatch({ type: "set-message", payload: { type: "success", msg: "Cita registrada" } });
                navigate(-1);
            } else {
                const errData = await resp.json();
                dispatch({ type: "set-message", payload: { type: "error", msg: errData.message?.msg || "Error al guardar la cita" } });
            }
        } catch (e) { console.error(e); }
    };

    const currentServices = store.barber_services?.filter(s => Number(s.barber_id) === Number(store.userInfo?.id)) || [];

    return (
        <div className="container py-5" style={{ maxWidth: '800px' }}>
            <div className="booking-card shadow-lg">
                <div className="booking-header text-center mb-4">
                    <h2 className="Oswald mb-0 text-uppercase fw-bold">
                        {isEditing ? "Gestión de cita" : "Nueva cita"}
                    </h2>
                    <div className="mt-2" style={{ width: '40px', height: '2px', background: '#d19f68', margin: '0 auto' }}></div>
                </div>

                <form onSubmit={handleSubmit} className="p-4 p-md-5">
                    {!isEditing && (
                        <div className="mb-5">
                            <label className="Oswald text-uppercase small fw-bold text-muted mb-2 d-block">Identificar cliente</label>
                            {foundUser ? (
                                <div className="d-flex align-items-center justify-content-between p-2 ps-3 rounded-pill bg-light border border-gold">
                                    <div className="d-flex align-items-center">
                                        <div className="rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '32px', height: '32px' }}>
                                            <i className="fa-solid fa-user" style={{ fontSize: '0.8rem' }}></i>
                                        </div>
                                        <span className="fw-bold small">{foundUser.name} {foundUser.last_name}</span>
                                    </div>
                                    <button type="button" className="btn btn-sm text-muted Oswald border-0 pe-3"
                                        onClick={() => { setFoundUser(null); setData({ ...data, user_id: "" }); setPhoneSearch(""); }}>
                                        <i className="fa-solid fa-xmark me-1"></i> CAMBIAR
                                    </button>
                                </div>
                            ) : (
                                <div className="search-container-custom d-flex gap-2">
                                    <input type="text" className="select-custom w-100" placeholder="Teléfono del cliente..." value={phoneSearch} onChange={e => setPhoneSearch(e.target.value)} />
                                    <button type="button" className="btn btn-dark btn-search-inline Oswald" onClick={handleSearchUser}>
                                        <i className="fas fa-search me-2"></i> BUSCAR
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                    <div className="row">
                        <div className="col-md-6 form-group-custom">
                            <label>Lugar de trabajo</label>
                            <select className="select-custom" required value={data.barbershop_id}
                                onChange={e => setData({ ...data, barbershop_id: e.target.value, time: "", date: "" })}>
                                <option value="">Selecciona un local</option>
                                {store.invitations?.filter(inv => inv.status === "accepted").map(inv => (
                                    <option key={inv.barbershop.id} value={inv.barbershop.id}>{inv.barbershop.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="col-md-6 form-group-custom">
                            <label>Servicio</label>
                            <select className="select-custom" disabled={!data.barbershop_id} required value={data.barber_service_id}
                                onChange={e => setData({ ...data, barber_service_id: e.target.value, time: "", date: "" })}>
                                <option value="">Elegir servicio</option>
                                {currentServices?.map(s => (
                                    <option key={s.id} value={s.id}>{s.name} - {s.price}€</option>
                                ))}
                            </select>

                        </div>
                    </div>

                    <div className={`mt-4 ${isCalendarDisabled ? "opacity-25" : ""}`}>
                        <label className="Oswald text-uppercase small fw-bold text-muted mb-3 d-block">
                            Elige tu momento
                            {isChecking && <span className="ms-2 text-gold small fw-normal Oswald">(Verificando...)</span>}
                        </label>

                        <div className="calendar-wrapper">
                            {isChecking && (
                                <div className="loader-overlay">
                                    <div className="spinner-gold"></div>
                                    <small className="Oswald mt-2 text-dark" style={{ letterSpacing: '1px' }}>ACTUALIZANDO AGENDA</small>
                                </div>
                            )}

                            <div className={`calendar-container ${isChecking ? 'is-loading-blur' : ''}`}>
                                <div className="d-flex align-items-center justify-content-between mb-4">
                                    <button type="button" className="btn btn-sm btn-dark rounded-circle"
                                        onClick={handlePrevWeek} disabled={isChecking}>
                                        <i className="fas fa-chevron-left"></i>
                                    </button>
                                    <span className="Oswald fw-bold text-uppercase">Agenda semanal</span>
                                    <button type="button" className="btn btn-sm btn-dark rounded-circle"
                                        onClick={handleNextWeek} disabled={isChecking}>
                                        <i className="fas fa-chevron-right"></i>
                                    </button>
                                </div>

                                <div className="d-flex gap-2 overflow-auto pb-2">
                                    {days.map((day, index) => {
                                        const dateString = getLocalDateString(day);
                                        const isActive = data.date === dateString;
                                        const isPastDay = isPast(day);
                                        const hasSlots = daysAvailability[dateString];
                                        const isFull = !isPastDay && daysAvailability.hasOwnProperty(dateString) && !hasSlots;
                                        const isDisabled = isCalendarDisabled || isPastDay || isFull || isChecking;

                                        return (
                                            <div key={index}
                                                onClick={() => !isDisabled && setData({ ...data, date: dateString, time: "" })}
                                                className={`day-pill text-center ${isActive ? 'active' : ''} ${isDisabled ? 'disabled' : ''}`}>
                                                <small className="d-block Oswald" style={{ fontSize: '0.6rem' }}>
                                                    {day.toLocaleDateString('es-ES', { weekday: 'short' }).toUpperCase()}
                                                </small>
                                                <strong className="fs-4 d-block">{day.getDate()}</strong>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="mt-4 pt-3 border-top">
                                    <div className="d-flex flex-wrap justify-content-center gap-2">
                                        {availableSlots.length > 0 ? (
                                            availableSlots.map(slot => (
                                                <button key={slot} type="button"
                                                    disabled={isChecking}
                                                    onClick={() => setData({ ...data, time: slot })}
                                                    className={`time-chip btn ${data.time === slot ? 'selected' : ''}`}>
                                                    {slot}
                                                </button>
                                            ))
                                        ) : (
                                            <div className="py-2">
                                                <small className="text-muted Oswald uppercase">
                                                    {isChecking ? "Buscando huecos..." : (data.date ? "No hay turnos" : "Selecciona un día")}
                                                </small>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 form-group-custom">
                        <label>Notas especiales</label>
                        <textarea className="select-custom" rows="2" value={data.notes}
                            onChange={e => setData({ ...data, notes: e.target.value })}
                            placeholder="¿Alguna petición para tu barbero?"></textarea>
                    </div>

                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 mt-5">
                        <button type="button" className="btn btn-link text-dark text-decoration-none Oswald order-2 order-md-1" onClick={() => navigate(-1)}>
                            VOLVER
                        </button>
                        <button type="submit" className="btn btn-confirm order-1 order-md-2 w-100 w-md-auto" disabled={!data.time}>
                            {isEditing ? "ACTUALIZAR" : "CONFIRMAR"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}