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
    const [data, setData] = useState({
        user_id: preData.user_id || "",
        barber_id: preData.barber_id || "",
        barbershop_id: preData.barbershop_id || "",
        barber_service_id: preData.barber_service_id || "",
        date: preData.date ? preData.date.split("T")[0] : "",
        time: preData.date ? preData.date.split("T")[1].slice(0, 5) : "",
        notes: preData.notes || ""
    });
    const [availableSlots, setAvailableSlots] = useState([]);
    
    useEffect(() => {
    const loadBarbersByShop = async () => {
        if (!data.barbershop_id) return;

        const token = store.token || localStorage.getItem("token");
        try {
            const resp = await fetch(`${import.meta.env.VITE_BACKEND_URL}/barbershops/${data.barbershop_id}/barbers`, {
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (resp.ok) {
                const barbersData = await resp.json();
                dispatch({ type: "set-barbers", payload: barbersData });
            }
        } catch (error) {
            console.error("Error cargando barberos de la sede:", error);
        }
    };
    loadBarbersByShop();
}, [data.barbershop_id]);

    const currentBarbers = store.barbers?.filter(inv => {
    const matchesShop = inv.barbershop_id 
        ? Number(inv.barbershop_id) === Number(data.barbershop_id) 
        : true;

    return inv.status === "accepted" && matchesShop;
}) || [];

    useEffect(() => {
        const loadServices = async () => {
            const token = store.token || localStorage.getItem("token");
            const resp = await fetch(`${import.meta.env.VITE_BACKEND_URL}/barber_services`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });
            if (resp.ok) {
                const data = await resp.json();
                dispatch({ type: "set-barber_services", payload: data });
            }
        };
        loadServices();
    }, []);

    useEffect(() => {
        const fetchSlots = async () => {
            if (data.barber_id && data.barbershop_id && data.date && data.barber_service_id) {
                const resp = await fetch(
                    `${import.meta.env.VITE_BACKEND_URL}/barber_availability?barber_id=${data.barber_id}&barbershop_id=${data.barbershop_id}&date=${data.date}&service_id=${data.barber_service_id}`,
                    { headers: { "Authorization": `Bearer ${store.token}` } }
                );
                if (resp.ok) {
                    const slots = await resp.json();
                    setAvailableSlots(slots);
                }
            }
        };
        fetchSlots();
    }, [data.date, data.barber_id, data.barbershop_id, data.barber_service_id]);

    const currentServices = store.barber_services?.filter(s => {
        if (!data.barber_id) return false;
        return Number(s.barber_id) === Number(data.barber_id);
    }) || [];

    const handleSearchUser = async () => {
        if (!phoneSearch) return;
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/search?phone=${phoneSearch}`, {
                headers: { "Authorization": `Bearer ${store.token}` }
            });
            if (res.ok) {
                const user = await res.json();
                setFoundUser(user);
                setData(prev => ({ ...prev, user_id: user.id }));
            } else if (res.status === 404) {
                dispatch({
                    type: "set-message",
                    payload: { "type": "error", "msg": "El teléfono no se encuentra en el sistema" }
                });
            }
        } catch (error) { console.error(error); }
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
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/appointments${isEditing ? `/${preData.id}` : ""}`, {
                method: isEditing ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${store.token}`
                },
                body: JSON.stringify(payload)
            });

            const responseData = await res.json();

            if (res.ok) {
                dispatch({ type: "set-appointmentInfo", payload: null });
                dispatch({
                    type: "set-message",
                    payload: { "type": "success", "msg": "Cita guardada con éxito" }
                });
                navigate(-1);
            } else {
                dispatch({
                    type: "set-message",
                    payload: {
                        "type": "error",
                        "msg": responseData.msg || "El barbero no trabaja en este horario"
                    }
                });
            }
        } catch (error) {
            dispatch({
                type: "set-message",
                payload: { "type": "error", "msg": "Error de conexión con el servidor" }
            });
        }
    };

    if (store.role !== "owner") {
        return (
            <div className="container mt-4">
                <h2 className="text-danger">Acceso denegado</h2>
                <p>Inicia sesión como dueño para gestionar la cita.</p>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <h3 className="mb-4">{isEditing ? "Editar Cita" : "Nueva Cita (Dueño)"}</h3>
            <form onSubmit={handleSubmit} className="card p-4">

                <div className="mb-3">
                    {foundUser ? (
                        <div className="d-flex justify-content-between">
                            <span>Cliente: <strong>{foundUser.name}</strong></span>
                            <button type="button" className="btn btn-sm" onClick={() => { setFoundUser(null); setData({ ...data, user_id: "" }) }}>Cambiar</button>
                        </div>
                    ) : (
                        <div className="input-group">
                            <input type="text" className="form-control" placeholder="Teléfono..." value={phoneSearch} onChange={e => setPhoneSearch(e.target.value)} />
                            <button type="button" className="btn btn-primary" onClick={handleSearchUser}>Buscar</button>
                        </div>
                    )}
                </div>

                <label className="form-label">Sede</label>
                <select className="form-select mb-3" value={data.barbershop_id}
                    onChange={e => setData({ ...data, barbershop_id: e.target.value, barber_id: "", barber_service_id: "" })}>
                    <option value="">Selecciona sede...</option>
                    {store.barbershops?.map(shop => (
                        <option key={shop.id} value={shop.id}>{shop.name}</option>
                    ))}
                </select>

                <label className="form-label">Barbero</label>
                <select
                    className="form-select mb-3"
                    value={data.barber_id}
                    onChange={e => setData({ ...data, barber_id: e.target.value, barber_service_id: "" })}
                    disabled={!data.barbershop_id}
                    required
                >
                    <option value="">Selecciona un barbero...</option>
                    {currentBarbers?.map(inv => {
                        const barberId = inv.barber ? inv.barber.id : inv.id;
                        const barberName = inv.barber ? inv.barber.name : (inv.name || "Barbero sin nombre");

                        return (
                            <option key={inv.id || barberId} value={barberId}>
                                {barberName}
                            </option>
                        );
                    })}
                </select>

                <label className="form-label">Servicio</label>
                <select
                    className="form-select mb-3"
                    value={data.barber_service_id}
                    onChange={e => setData({ ...data, barber_service_id: e.target.value })}
                    disabled={!data.barber_id}
                >
                    <option value="">Elegir servicio...</option>
                    {currentServices && currentServices.map(s => {
                        if (!s || !s.id) return null;

                        return (
                            <option key={s.id} value={s.id}>
                                {s.name} - {s.price}€
                            </option>
                        );
                    })}
                </select>

                <div className="row mb-3">
                    <div className="col-6">
                        <label className="form-label">Fecha</label>
                        <input type="date" className="form-control" value={data.date} onChange={e => setData({ ...data, date: e.target.value })} />
                    </div>
                    <div className="col-6">
                        <label className="form-label">Hora</label>
                        <select
                            className="form-select"
                            value={data.time}
                            onChange={e => setData({ ...data, time: e.target.value })}
                            disabled={availableSlots.length === 0}
                            required
                        >
                            <option value="">{availableSlots.length > 0 ? "Selecciona hora" : "Sin disponibilidad"}</option>
                            {availableSlots.map(slot => (
                                <option key={slot} value={slot}>{slot}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="mb-3">
                    <label className="form-label">Notas</label>
                    <textarea className="form-control" value={data.notes} onChange={e => setData({ ...data, notes: e.target.value })}></textarea>
                </div>
                <button type="button" className="btn btn-secondary me-3" onClick={() => navigate(-1)}>Cancelar</button>
                <button type="submit" className="btn btn-primary mt-4" disabled={!data.user_id}>Guardar Cita</button>
            </form>
        </div>
    );
};