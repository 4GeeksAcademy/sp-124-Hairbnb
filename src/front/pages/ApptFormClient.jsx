import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import "../styles/forms.css"

export const ApptFormClient = () => {
    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();
    const location = useLocation();

    const editData = location.state?.editAppt;
    const preSelectedShopId = location.state?.selectedBarbershopId;
    const isEditing = !!editData;

    const currentUser = store.userInfo || JSON.parse(localStorage.getItem("userInfo"));
    const [availableSlots, setAvailableSlots] = useState([]);
    const [isChecking, setIsChecking] = useState(false);

    const [data, setData] = useState({
        barbershop_id: editData ? editData.barbershop_id : (preSelectedShopId || ""),
        barber_id: editData ? editData.barber_id : "",
        barber_service_id: editData ? editData.barber_service_id : "",
        date: editData ? editData.date.split("T")[0] : "",
        time: editData ? editData.time || "" : "",
        notes: editData ? editData.notes || "" : ""
    });
    const isCalendarDisabled = !data.barbershop_id || !data.barber_id || !data.barber_service_id;

    const [startDate, setStartDate] = useState(new Date());

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

    useEffect(() => {
        const loadInitialData = async () => {
            const token = store.token || localStorage.getItem("token");
            const headers = { "Authorization": `Bearer ${token}` };

            try {
                const responseShops = await fetch(`${import.meta.env.VITE_BACKEND_URL}/barbershops`, { headers });
                if (responseShops.ok) {
                    const shopsData = await responseShops.json();
                    dispatch({ type: "set-barbershops", payload: shopsData });
                }

                const responseServices = await fetch(`${import.meta.env.VITE_BACKEND_URL}/barber_services`, { headers });
                if (responseServices.ok) {
                    const servicesData = await responseServices.json();
                    dispatch({ type: "set-barber_services", payload: servicesData });
                }
            } catch (error) {
                console.error("Error inicializando datos de reserva:", error);
            }
        };
        loadInitialData();
    }, [dispatch, store.token]);

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
            } catch (error) {
                console.error("Error cargando barberos de la sede:", error);
            }
        };
        loadBarbersByShop();
    }, [data.barbershop_id, store.token, dispatch]);

    useEffect(() => {
        const fetchSlots = async () => {
            if (data.barber_id && data.barbershop_id && data.date && data.barber_service_id) {
                const url = `${import.meta.env.VITE_BACKEND_URL}/barber_availability?barber_id=${data.barber_id}&barbershop_id=${data.barbershop_id}&date=${data.date}&service_id=${data.barber_service_id}`;

                try {
                    const responseSlots = await fetch(url, {
                        headers: { "Authorization": `Bearer ${store.token}` }
                    });
                    if (responseSlots.ok) {
                        let slots = await responseSlots.json();

                        if (isEditing && data.date === editData.date.split("T")[0] && !slots.includes(data.time)) {
                            slots.push(data.time);
                            slots.sort();
                        }
                        setAvailableSlots(slots);
                    }
                } catch (error) {
                    console.error("Error al obtener disponibilidad", error);
                }
            }
        };
        fetchSlots();
    }, [data.date, data.barber_id, data.barbershop_id, data.barber_service_id, store.token]);

    useEffect(() => {
        const checkMultipleDays = async () => {
            if (!data.barber_id || !data.barbershop_id || !data.barber_service_id) return;

            setIsChecking(true);
            const availabilityMap = {};

            const promises = days.map(async (day) => {
                const dateStr = getLocalDateString(day);

                if (isPast(day)) return;

                try {
                    const url = `${import.meta.env.VITE_BACKEND_URL}/barber_availability?barber_id=${data.barber_id}&barbershop_id=${data.barbershop_id}&date=${dateStr}&service_id=${data.barber_service_id}`;
                    const resp = await fetch(url, { headers: { "Authorization": `Bearer ${store.token}` } });
                    if (resp.ok) {
                        const slots = await resp.json();
                        availabilityMap[dateStr] = slots.length > 0;
                    }
                } catch (e) {
                    console.error("Error chequeando día", dateStr);
                }
            });

            await Promise.all(promises);
            setDaysAvailability(availabilityMap);
            setIsChecking(false);
        };

        checkMultipleDays();
    }, [startDate, data.barber_id, data.barber_service_id, data.barbershop_id]);

    const currentBarbers = store.barbers?.filter(inv =>
        inv.status === "accepted" && Number(inv.barbershop_id) === Number(data.barbershop_id)
    );

    const currentServices = store.barber_services?.filter(s =>
        Number(s.barber_id) === Number(data.barber_id)
    );

    const selectedServiceInfo = store.barber_services?.find(s => s.id == data.barber_service_id);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!currentUser?.id) {
            dispatch({ type: "set-message", payload: { "type": "error", "msg": "Usuario no identificado" } });
            return;
        }

        const payload = {
            user_id: currentUser.id,
            barber_id: Number(data.barber_id),
            barbershop_id: Number(data.barbershop_id),
            barber_service_id: Number(data.barber_service_id),
            date: `${data.date}T${data.time}:00`,
            notes: data.notes || ""
        };

        const url = isEditing
            ? `${import.meta.env.VITE_BACKEND_URL}/appointments/${editData.id}`
            : `${import.meta.env.VITE_BACKEND_URL}/appointments`;

        try {
            const response = await fetch(url, {
                method: isEditing ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${store.token}`
                },
                body: JSON.stringify(payload)
            });

            const responseData = await response.json();

            if (response.ok) {
                dispatch({
                    type: "set-message",
                    payload: { "type": "success", "msg": isEditing ? "¡Cita actualizada!" : "¡Cita reservada con éxito!" }
                });
                navigate("/private/client");
            } else {
                dispatch({
                    type: "set-message",
                    payload: { "type": "error", "msg": responseData.msg || "Error en la operación" }
                });
            }
        } catch (error) {
            console.error("Error en la petición:", error);
        }
    };

    const [daysAvailability, setDaysAvailability] = useState({});

    const getLocalDateString = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    useEffect(() => {
        const checkMultipleDays = async () => {
            if (!data.barber_id || !data.barbershop_id || !data.barber_service_id) return;

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
                } catch (e) {
                    console.error("Error chequeando día", dateStr);
                }
            });

            await Promise.all(promises);
            setDaysAvailability(availabilityMap);
        };

        checkMultipleDays();
    }, [startDate, data.barber_id, data.barber_service_id]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isPast = (date) => {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return d < today;
    };

    if (store.role !== "client") {
        return (
            <div className="container py-5 text-center">
                <h2 className="Oswald fw-bold text-danger">ACCESO DENEGADO</h2>
                <p>Inicia sesión como cliente para acceder.</p>
                <button className="btn btn-dark Oswald mt-3" onClick={() => navigate("/login/client")}>INICIAR SESIÓN</button>
            </div>
        );
    }


    return (
        <div className="container py-5" style={{ maxWidth: '750px' }}>
            <div className="booking-card shadow-lg">
                <div className="booking-header">
                    <h2 className="Oswald mb-0 text-uppercase fw-bold">
                        {isEditing ? "Edita tu cita" : "Reserva tu cita"}
                    </h2>
                    <div className="mt-2" style={{ width: '40px', height: '2px', background: '#d19f68', margin: '0 auto' }}></div>
                </div>

                <form onSubmit={handleSubmit} className="p-4 p-md-5">
                    <div className="d-flex align-items-center mb-5 p-3 rounded-pill bg-light border">
                        <div className="bg-dark text-gold rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px' }}>
                            <i className="fa-solid fa-user"></i>
                        </div>
                        <div>
                            <small className="text-muted d-block Oswald text-uppercase" style={{ fontSize: '0.6rem' }}>Cliente Seleccionado</small>
                            <span className="fw-bold">{currentUser?.name} {currentUser?.last_name}</span>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-12 form-group-custom">
                            <label>Elige el lugar</label>
                            <select className="select-custom" required value={data.barbershop_id}
                                onChange={e => setData({ ...data, barbershop_id: e.target.value, barber_id: "", barber_service_id: "", time: "" })}>
                                <option value="">¿Dónde te esperamos?</option>
                                {store.barbershops?.map(shop => (
                                    <option key={shop.id} value={shop.id}>{shop.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="col-md-6 form-group-custom">
                            <label>Profesional</label>
                            <select className="select-custom" disabled={!data.barbershop_id} required value={data.barber_id}
                                onChange={e => setData({ ...data, barber_id: e.target.value, barber_service_id: "", time: "" })}>
                                <option value="">Selecciona uno</option>
                                {currentBarbers?.map(inv => (
                                    <option key={inv.id} value={inv.barber.id}>{inv.barber.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="col-md-6 form-group-custom">
                            <label>Servicio</label>
                            <select className="select-custom" disabled={!data.barber_id} required value={data.barber_service_id}
                                onChange={e => setData({ ...data, barber_service_id: e.target.value, time: "" })}>
                                <option value="">Servicio deseado</option>
                                {currentServices?.map(s => (
                                    <option key={s.id} value={s.id}>{s.name} ({s.price}€)</option>
                                ))}
                            </select>
                            {selectedServiceInfo?.service_description && (
                                <div className="mt-2 animate__animated animate__fadeIn">
                                    <p className="text-muted small Oswald mb-0" style={{ borderLeft: '2px solid #d19f68', paddingLeft: '10px', fontStyle: 'italic' }}>

                                        {selectedServiceInfo.service_description}
                                    </p>
                                </div>
                            )}
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