import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const AppointmentForm = () => {
    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();

    const preData = store.appointmentInfo || {};

    const isoDate = preData.date ? preData.date.split("T")[0] : "";
    const isoTime = preData.date ? preData.date.split("T")[1].slice(0, 5) : "";

    const [data, setData] = useState({
        user_id: preData.user_id || "",
        barbershop_id: store.barbershopInfo?.id || preData.barbershop_id || "",
        barber_id: preData.barber_id || "",
        barber_service_id: preData.barber_service_id || "",
        date: isoDate,
        time: isoTime,
        notes: preData.notes || ""
    });

    useEffect(() => {
        const fetchBarberServices = async () => {
            if (!data.barber_id) return;

            try {
                const resp = await fetch(`${import.meta.env.VITE_BACKEND_URL}/barbers/${data.barber_id}/services`);
                if (resp.ok) {
                    const services = await resp.json();
                    dispatch({ type: "set-services", payload: services });
                }
            } catch (error) {
            }
        };

        fetchBarberServices();
    }, [data.barber_id]);

    useEffect(() => {
        if (store.role === "client" && store.userInfo) {
            setData(prev => ({ ...prev, user_id: store.userInfo.id }));
        }
    }, [store.role, store.userInfo]);

    useEffect(() => {
        if (store.role === "client") {
            setData(prev => ({ ...prev, user_id: store.userInfo.id }));
        }

        if (store.role === "barber") {
            setData(prev => ({
                ...prev,
                barber_id: store.user.barber_id,
                barbershop_id: store.user.barbershop_id
            }));
        }

        if (store.role === "owner" && store.barbershopInfo) {
            setData(prev => ({ ...prev, barbershop_id: store.barbershopInfo.id }));
        }
    }, [store.role, store.barbershopInfo, store.userInfo]);

    const [phoneSearch, setPhoneSearch] = useState("");
    const [foundUser, setFoundUser] = useState(null);

    const handleSearchUser = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/search?phone=${phoneSearch}`);
            if (res.ok) {
                const user = await res.json();
                setFoundUser(user);
                setData(prev => ({ ...prev, user_id: user.id }));
            } else {
                alert("Cliente no encontrado. ¿Deseas crearlo?");
            }
        } catch (error) { }
    };

    const handleSubmit = async (e) => {
    e.preventDefault();

    const isEditing = !!preData.id;
    const url = isEditing 
        ? `${import.meta.env.VITE_BACKEND_URL}/appointments/${preData.id}` 
        : `${import.meta.env.VITE_BACKEND_URL}/appointments`;
    
    const method = isEditing ? "PUT" : "POST";

    try {
        const res = await fetch(url, {
            method: method,
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${store.token}`
            },
            body: JSON.stringify({
                ...data,
                date: `${data.date}T${data.time}:00` 
            })
        });

        const result = await res.json();

        if (res.ok) {
            dispatch({ 
                type: "set-message", 
                payload: { type: "success", msg: isEditing ? "Cita actualizada" : "Cita creada" } 
            });

            dispatch({ type: "set-appointmentInfo", payload: null });
            navigate("/private/owner/gestion");
        } else {

            dispatch({ 
                type: "set-message", 
                payload: { type: "error", msg: result.message?.msg || "Error en la reserva" } 
            });
        }
    } catch (error) {
        dispatch({ 
            type: "set-message", 
            payload: { type: "error", msg: "Error de conexión con el servidor" } 
        });
    }
};

    if (store.role === null) {
        return (
            <div className="container mt-5 text-center">
                <h2>Necesitas iniciar sesión para solicitar citas</h2>
            </div>
        );
    }

    useEffect(() => {
    if (preData.id && preData.user_id) {
        setFoundUser({
            id: preData.user_id,
            name: preData.user_name?.split(" ")[0] || "Cliente",
            last_name: preData.user_name?.split(" ")[1] || "",
        });
    }
}, [preData.id]);

    return (
        <div className="container mt-5" style={{ maxWidth: "600px" }}>
            <div className="cardp-4 border-0">
                <h2 className="text-center mb-4">{preData.id ? "Editar Cita" : "Nueva Reserva"}</h2>

                <form onSubmit={handleSubmit}>
                    {store.role !== "client" ? (
                        <div className="mb-4 p-3">
                            {foundUser ? (
                                <div className="alert">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <h6 className="mb-0 fw-bold">
                                            {foundUser.name} {foundUser.last_name}
                                        </h6>
                                        <button
                                            type="button"
                                            className="btn text-danger"
                                            onClick={() => { setFoundUser(null); setData(prev => ({ ...prev, user_id: "" })) }}
                                        >
                                            Cambiar
                                        </button>
                                    </div>
                                    {foundUser.notes ? (
                                        <div className="bp-2 mt-2">
                                            <strong className="text-muted d-block small">Notas del cliente:</strong>
                                            {foundUser.notes}
                                        </div>
                                    ) : (
                                        <p className="text-muted small mb-0 mt-1 fst-italic">Sin notas previas.</p>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <label className="form-label fw-bold">Buscar cliente por teléfono</label>
                                    <div className="input-group">
                                        <input
                                            type="text" className="form-control"
                                            placeholder="Ej: 600123456"
                                            value={phoneSearch}
                                            onChange={e => setPhoneSearch(e.target.value)}
                                        />
                                        <button type="button" className="btn btn-dark" onClick={handleSearchUser}>
                                            <i className="fas fa-search me-1"></i> Buscar
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="alert alert-secondary mb-4">
                            <i className="fas fa-user me-2"></i>
                            Reserva para: <strong>{store.userInfo?.name} {store.userInfo?.last_name}</strong>
                        </div>
                    )}


                    <div className="row g-3 mb-3">
                        <div className="col-md-6">
                            <label className="form-label">Barbería</label>
                            <select
                                className="form-select"
                                value={data.barbershop_id}
                                onChange={e => setData({ ...data, barbershop_id: e.target.value })}
                                disabled={store.role === "owner" || store.role === "barber"}
                            >
                                <option value="">Selecciona Barbería...</option>
                                {store.barbershops?.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </select>
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Barbero</label>
                            <select
                                className="form-select"
                                value={data.barber_id}
                                onChange={e => setData({ ...data, barber_id: e.target.value })}
                                required
                                disabled={store.role === "barber" || !!preData.barber_id}
                            >
                                <option value="">Selecciona Barbero...</option>
                                {store.barbers?.map((item) => {
                                    if (item.status === 'accepted') {
                                        return (
                                            <option key={item.barber.id} value={item.barber.id}>
                                                {item.barber.name}
                                            </option>
                                        );
                                    }
                                    return null;
                                })}
                            </select>
                        </div>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Servicio</label>
                        <select
                            className="form-select"
                            required
                            value={data.barber_service_id}
                            onChange={e => setData({ ...data, barber_service_id: e.target.value })}
                        >
                            <option value="">¿Qué vamos a hacer?</option>
                            {store.services?.map(s => (
                                <option key={s.id} value={s.id}>
                                    {s.name} ({s.price}€ - {s.duration} min)
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="row g-3 mb-4">
                        <div className="col-6">
                            <label className="form-label">Fecha</label>
                            <input type="date" className="form-control" value={data.date} onChange={e => setData({ ...data, date: e.target.value })} required />
                        </div>
                        <div className="col-6">
                            <label className="form-label">Hora</label>
                            <input type="time" className="form-control" onChange={e => setData({ ...data, time: e.target.value })} required />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary w-100 py-2 fw-bold">
                        Confirmar Cita
                    </button>
                </form>
            </div>
        </div>
    );
};