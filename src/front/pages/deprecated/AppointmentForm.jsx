import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";

export const AppointmentForm = () => {
    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();

    const preData = store.appointmentInfo || {};
    const isEditing = !!preData.id;
    const isClient = store.role === "client";
    const isBarber = store.role === "barber";
    const isOwner = store.role === "owner";

    const [phoneSearch, setPhoneSearch] = useState("");
    const [foundUser, setFoundUser] = useState(null);

    const [data, setData] = useState({
        user_id: preData.user_id || "",
        barbershop_id: preData.barbershop_id || "",
        barber_id: preData.barber_id || "",
        barber_service_id: preData.barber_service_id || "",
        date: preData.date ? preData.date.split("T")[0] : "",
        time: preData.date ? preData.date.split("T")[1].slice(0, 5) : "",
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
            } catch (error) { console.error(error); }
        };
        fetchBarberServices();
    }, [data.barber_id]);

    useEffect(() => {
        if (isBarber && store.userInfo) {
            const myInvitations = store.invitations?.filter(inv => inv.status === "accepted") || [];
            setData(prev => ({
                ...prev,
                barber_id: store.userInfo.id,
                barbershop_id: prev.barbershop_id || myInvitations[0]?.barbershop_id || ""
            }));
        }
        if (isClient && store.userInfo) {
            setData(prev => ({ ...prev, user_id: store.userInfo.id }));
        }
        if (isEditing && preData.user_name) {
            setFoundUser({
                id: preData.user_id,
                name: preData.user_name
            });
        }
    }, [store.role, store.userInfo, store.invitations]);

    useEffect(() => {
    const fetchBarberServices = async () => {
        const targetBarberId = data.barber_id || (isBarber ? store.userInfo?.id : null);
        
        if (!targetBarberId) return;

        try {
            const resp = await fetch(`${import.meta.env.VITE_BACKEND_URL}/barber_services`, {
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${store.token}` 
                }
            });

            if (resp.ok) {
                const allServices = await resp.json();
                
                const myServices = allServices.filter(s => 
                    Number(s.barber_id) === Number(targetBarberId)
                );
                
                dispatch({ type: "set-services", payload: myServices });
            }
        } catch (error) {
            console.error("Error en el fetch de servicios:", error);
        }
    };

    fetchBarberServices();
}, [data.barber_id, store.userInfo?.id]);

    const handleSearchUser = async () => {
        if (!phoneSearch) return;
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/search?phone=${phoneSearch}`);
            if (res.ok) {
                const user = await res.json();
                setFoundUser(user);
                setData(prev => ({ ...prev, user_id: user.id }));
            } else {
                alert("Cliente no encontrado.");
            }
        } catch (error) { console.error(error); }
    };


    const handleSubmit = async (e) => {
    e.preventDefault();

    const appointmentData = {
        user_id: Number(data.user_id),
        barbershop_id: Number(data.barbershop_id),
        barber_id: Number(data.barber_id),
        barber_service_id: Number(data.barber_service_id),
        date: `${data.date}T${data.time}:00`,
        notes: data.notes || ""
    };


    const url = isEditing
        ? `${import.meta.env.VITE_BACKEND_URL}/appointments/${preData.id}`
        : `${import.meta.env.VITE_BACKEND_URL}/appointments`;

    try {
        const res = await fetch(url, {
            method: isEditing ? "PUT" : "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${store.token}`
            },
            body: JSON.stringify(appointmentData)
        });

        if (res.ok) {
            dispatch({ type: "set-appointmentInfo", payload: null });
            navigate(-1);
        } else {
            const errorText = await res.text();
            console.error("Error del servidor:", errorText);
        }
    } catch (error) { 
        console.error("Error en la petición:", error); 
    }
};

    return (
        <div className="container mt-5" style={{ maxWidth: "600px" }}>
            <h2 className="text-center mb-4">{isEditing ? "Editar Cita" : "Nueva Reserva"}</h2>
            <form onSubmit={handleSubmit} className="card p-4 shadow-sm border-0">

                {!isClient && (
                    <div className="mb-4 p-3 bg-light rounded">
                        {foundUser ? (
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <small className="text-muted d-block">Cliente:</small>
                                    <strong>{foundUser.name} {foundUser.last_name || ""}</strong>
                                </div>
                                {!isEditing && (
                                    <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => { setFoundUser(null); setData({ ...data, user_id: "" }) }}>
                                        Cambiar
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div>
                                <label className="form-label">Buscar cliente por teléfono</label>
                                <div className="input-group">
                                    <input
                                        type="text" className="form-control" placeholder="600000000"
                                        value={phoneSearch} onChange={e => setPhoneSearch(e.target.value)}
                                    />
                                    <button type="button" className="btn btn-dark" onClick={handleSearchUser}>Buscar</button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="mb-3">
                    <label className="form-label">Barbería</label>
                    <select
                        className="form-select"
                        value={data.barbershop_id}
                        onChange={e => setData({ ...data, barbershop_id: e.target.value })}
                        disabled={isEditing}
                        required
                    >
                        <option value="">Selecciona sede...</option>
                        {isBarber
                            ? store.invitations?.filter(inv => inv.status === "accepted").map(inv => (
                                <option key={inv.barbershop.id} value={inv.barbershop.id}>{inv.barbershop.name}</option>
                            ))
                            : store.barbershops?.map(b => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                            ))
                        }
                    </select>
                </div>

                <div className="mb-3">
                    <label className="form-label">Barbero</label>
                    <select
                        className="form-select"
                        value={data.barber_id}
                        onChange={e => setData({ ...data, barber_id: e.target.value })}
                        disabled={isEditing || isBarber}
                        required
                    >
                        {isBarber ? (
                            <option value={store.userInfo?.id}>{store.userInfo?.name}</option>
                        ) : (
                            <>
                                <option value="">Selecciona Barbero...</option>
                                {store.barbers?.filter(item =>
                                    item.status === 'accepted' &&
                                    (!data.barbershop_id || Number(item.barbershop_id) === Number(data.barbershop_id))
                                ).map(item => (
                                    <option key={item.barber.id} value={item.barber.id}>{item.barber.name}</option>
                                ))}
                            </>
                        )}
                    </select>
                </div>

                <div className="mb-3">
                    <label className="form-label">Servicio</label>
                    <select
                        className="form-select"
                        value={data.barber_service_id}
                        onChange={e => setData({ ...data, barber_service_id: e.target.value })}
                        disabled={isEditing}
                        required
                    >
                        <option value="">¿Qué servicio realizaremos?</option>
                        {store.services?.map(s => (
                            <option key={s.id} value={s.id}>{s.name} ({s.price}€)</option>
                        ))}
                    </select>
                </div>

                <div className="row">
                    <div className="col-6 mb-3">
                        <label className="form-label">Fecha</label>
                        <input type="date" className="form-control" value={data.date} onChange={e => setData({ ...data, date: e.target.value })} required />
                    </div>
                    <div className="col-6 mb-3">
                        <label className="form-label">Hora</label>
                        <input type="time" className="form-control" step="900" value={data.time} onChange={e => setData({ ...data, time: e.target.value })} required />
                    </div>
                </div>

                <button type="submit" className="btn btn-primary w-100 fw-bold py-2 mt-3" disabled={!data.user_id}>
                    {isEditing ? "Guardar Cambios" : "Confirmar Cita"}
                </button>
            </form>
        </div>
    );
};