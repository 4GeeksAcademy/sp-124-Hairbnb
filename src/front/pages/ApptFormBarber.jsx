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

    const [data, setData] = useState({
        user_id: preData.user_id || "",
        barber_id: store.userInfo?.id || "", 
        barbershop_id: preData.barbershop_id || "",
        barber_service_id: preData.barber_service_id || "",
        date: preData.date ? preData.date.split("T")[0] : "",
        time: preData.date ? preData.date.split("T")[1].slice(0, 5) : "",
        notes: preData.notes || ""
    });

    useEffect(() => {
        const loadServices = async () => {
            const token = store.token || localStorage.getItem("token");
            const resp = await fetch(`${import.meta.env.VITE_BACKEND_URL}/barber_services`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (resp.ok) {
                const resData = await resp.json();
                dispatch({ type: "set-barber_services", payload: resData });
            }
        };
        loadServices();
    }, []);

    useEffect(() => {
        const fetchSlots = async () => {
            if (data.barber_id && data.barbershop_id && data.date && data.barber_service_id) {
                setAvailableSlots([]); 
                
                const url = `${import.meta.env.VITE_BACKEND_URL}/barber_availability?barber_id=${data.barber_id}&barbershop_id=${data.barbershop_id}&date=${data.date}&service_id=${data.barber_service_id}`;
                
                try {
                    const resp = await fetch(url, { 
                        headers: { "Authorization": `Bearer ${store.token}` } 
                    });
                    if (resp.ok) {
                        const slots = await resp.json();
                        setAvailableSlots(slots);
                    }
                } catch (error) {
                    console.error("Error fetching slots", error);
                }
            }
        };
        fetchSlots();
    }, [data.date, data.barber_id, data.barbershop_id, data.barber_service_id]);

    const currentServices = store.barber_services?.filter(s =>
        Number(s.barber_id) === Number(store.userInfo?.id)
    ) || [];

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

        const url = `${import.meta.env.VITE_BACKEND_URL}/appointments${isEditing ? `/${preData.id}` : ""}`;

        try {
            const res = await fetch(url, {
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
                dispatch({ type: "set-message", payload: { "type": "success", "msg": "Cita guardada correctamente" } });
                navigate(-1);
            } else {
                dispatch({ type: "set-message", payload: { "type": "error", "msg": responseData.message?.msg || "Error al guardar" } });
            }
        } catch (error) { console.error(error); }
    };

    if (store.role !== "barber") {
        return (
            <div className="container mt-4">
                <h2 className="text-danger">Acceso denegado</h2>
                <p>Inicia sesión como barbero para gestionar las citas.</p>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <h3 className="mb-4">{isEditing ? "Editar Cita" : "Nueva Cita (Barbero)"}</h3>
            <form onSubmit={handleSubmit} className="card p-4 shadow-sm border-0">
                
                <div className="mb-3">
                    <label className="form-label font-weight-bold">Cliente</label>
                    {foundUser ? (
                        <div className="d-flex justify-content-between align-items-center">
                            <span><strong>{foundUser.name} {foundUser.last_name}</strong></span>
                            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => {setFoundUser(null); setData({...data, user_id: ""})}}>Cambiar</button>
                        </div>
                    ) : (
                        <div className="input-group">
                            <input type="text" className="form-control" placeholder="Buscar por teléfono..." value={phoneSearch} onChange={e => setPhoneSearch(e.target.value)} />
                            <button type="button" className="btn btn-dark" onClick={handleSearchUser}>Buscar</button>
                        </div>
                    )}
                </div>

                <div className="mb-3">
                    <label className="form-label">Sede</label>
                    <select className="form-select" value={data.barbershop_id}
                        onChange={e => {
                            setAvailableSlots([]);
                            setData({ ...data, barbershop_id: e.target.value, barber_service_id: "", time: "" });
                        }}>
                        <option value="">Selecciona una sede...</option>
                        {store.invitations?.filter(inv => inv.status === "accepted").map(inv => (
                            <option key={inv.barbershop.id} value={inv.barbershop.id}>{inv.barbershop.name}</option>
                        ))}
                    </select>
                </div>

                <div className="mb-3">
                    <label className="form-label">Servicio</label>
                    <select className="form-select" value={data.barber_service_id}
                        onChange={e => {
                            setAvailableSlots([]);
                            setData({ ...data, barber_service_id: e.target.value, time: "" });
                        }}
                        disabled={!data.barbershop_id}>
                        <option value="">Selecciona el servicio...</option>
                        {currentServices?.map(s => (
                            <option key={s.id} value={s.id}>{s.name} ({s.duration} min) - {s.price}€</option>
                        ))}
                    </select>
                </div>

                <div className="row mb-4">
                    <div className="col-md-6 mb-3 mb-md-0">
                        <label className="form-label">Fecha</label>
                        <input type="date" className="form-control" value={data.date} 
                            onChange={e => {
                                setAvailableSlots([]);
                                setData({ ...data, date: e.target.value, time: "" });
                            }} />
                    </div>
                    <div className="col-md-6">
                        <label className="form-label">Hora disponible</label>
                        <select
                            className="form-select"
                            value={data.time}
                            onChange={e => setData({ ...data, time: e.target.value })}
                            disabled={availableSlots.length === 0}
                            required
                        >
                            <option value="">{availableSlots.length > 0 ? "Elegir hora..." : "No hay disponibilidad"}</option>
                            {availableSlots.map(slot => (
                                <option key={slot} value={slot}>{slot}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <button type="button" className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
                    Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={!data.user_id || !data.time}>
                    {isEditing ? "Actualizar Reserva" : "Confirmar Reserva"}
                </button>
            </form>
        </div>
    );
};