import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const ApptFormClient = () => {
    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();
    const location = useLocation();

    const editData = location.state?.editAppt;
    const isEditing = !!editData;

    const currentUser = store.userInfo || JSON.parse(localStorage.getItem("userInfo"));
    const [availableSlots, setAvailableSlots] = useState([]);

    const [data, setData] = useState({
        barbershop_id: editData ? editData.barbershop_id : "",
        barber_id: editData ? editData.barber_id : "",
        barber_service_id: editData ? editData.barber_service_id : "",
        date: editData ? editData.date.split("T")[0] : "",
        time: editData ? editData.time || "" : "",
        notes: editData ? editData.notes || "" : ""
    });

    const [startDate, setStartDate] = useState(new Date());

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

    const currentBarbers = store.barbers?.filter(inv =>
        inv.status === "accepted" && Number(inv.barbershop_id) === Number(data.barbershop_id)
    );

    const currentServices = store.barber_services?.filter(s =>
        Number(s.barber_id) === Number(data.barber_id)
    );

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

    useEffect(() => {
        const checkMultipleDays = async () => {
            if (!data.barber_id || !data.barbershop_id || !data.barber_service_id) return;

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
            <div className="container mt-4">
                <h2 className="text-danger">Acceso denegado</h2>
                <p>Inicia sesión como cliente para gestionar la cita.</p>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <h2 className="text-center mb-4">{isEditing ? "Modificar mi Cita" : "Reserva tu Cita"}</h2>
            <form onSubmit={handleSubmit} className="card p-4 shadow-sm border-0">

                <div className="mb-3 alert alert-light border">
                    <strong>Cliente:</strong> {currentUser?.name} {currentUser?.last_name}
                </div>

                <label className="form-label">¿A qué barbería quieres ir?</label>
                <select className="form-select mb-3" required value={data.barbershop_id}
                    onChange={e => setData({ ...data, barbershop_id: e.target.value, barber_id: "", barber_service_id: "", time: "" })}>
                    <option value="">Selecciona una sede...</option>
                    {store.barbershops?.map(shop => (
                        <option key={shop.id} value={shop.id}>{shop.name}</option>
                    ))}
                </select>

                <label className="form-label">Tu barbero de confianza</label>
                <select className="form-select mb-3" disabled={!data.barbershop_id} required value={data.barber_id}
                    onChange={e => setData({ ...data, barber_id: e.target.value, barber_service_id: "", time: "" })}>
                    <option value="">Selecciona barbero...</option>
                    {currentBarbers?.map(inv => (
                        <option key={inv.id} value={inv.barber.id}>{inv.barber.name}</option>
                    ))}
                </select>

                <label className="form-label">¿Qué servicio necesitas?</label>
                <select className="form-select mb-3" disabled={!data.barber_id} required value={data.barber_service_id}
                    onChange={e => setData({ ...data, barber_service_id: e.target.value, time: "" })}>
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
                                    <div
                                        key={index}
                                        onClick={() => {
                                            if (isDisabled) return;
                                            setAvailableSlots([]);
                                            setData({ ...data, date: dateString, time: "" });
                                        }}
                                        style={{
                                            cursor: isDisabled ? 'not-allowed' : 'pointer',
                                            minWidth: '85px',
                                            position: 'relative'
                                        }}
                                        className={`p-2 rounded transition-all border ${isActive
                                                ? 'bg-primary text-white border-primary shadow'
                                                : isFullOrClosed
                                                    ? 'bg-secondary-subtle text-secondary border-secondary-subtle opacity-75'
                                                    : isPastDay
                                                        ? 'bg-light text-muted border-light'
                                                        : 'bg-white border-secondary-subtle'
                                            }`}
                                    >
                                        <small className="d-block text-uppercase" style={{ fontSize: '0.65rem', fontWeight: 'bold' }}>
                                            {day.toLocaleDateString('es-ES', { weekday: 'short' })}
                                        </small>
                                        <strong className="d-block fs-5">{day.getDate()}</strong>

                                        {isFullOrClosed && (
                                            <span className="badge bg-secondary p-1" style={{ fontSize: '0.5rem', position: 'absolute', top: '-5px', right: '-5px' }}>
                                                
                                            </span>
                                        )}
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
    Horas disponibles para el {
        data.date 
        ? data.date.split("-").reverse().join("/") 
        : "..."
    }
</label>
                        <div className="d-flex flex-wrap gap-2">
                            {availableSlots.length > 0 ? (
                                availableSlots.map(slot => (
                                    <button
                                        key={slot}
                                        type="button"
                                        onClick={() => setData({ ...data, time: slot })}
                                        className={`btn btn-sm px-3 py-2 rounded-pill border ${data.time === slot
                                            ? 'btn-primary shadow-sm'
                                            : 'btn-outline-secondary bg-white'
                                            }`}
                                    >
                                        {slot}
                                    </button>
                                ))
                            ) : (
                                <div className="w-100 text-center py-3 border rounded border-dashed bg-light">
                                    <small className="text-muted">
                                        {data.date
                                            ? "No hay turnos para este día o el barbero no está disponible."
                                            : "Selecciona un día primero para ver las horas."}
                                    </small>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mb-4">
                    <label className="form-label">Notas adicionales</label>
                    <textarea className="form-control" rows="2" value={data.notes}
                        onChange={e => setData({ ...data, notes: e.target.value })} placeholder="¿Alguna instrucción especial?"></textarea>
                </div>

                <div className="d-flex justify-content-between">
                    <button type="button" className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
                        Cancelar
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={!data.time}>
                        {isEditing ? "Guardar Cambios" : "Confirmar mi Reserva"}
                    </button>
                </div>
            </form>
        </div>
    );
};