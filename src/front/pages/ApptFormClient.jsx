import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const ApptFormClient = () => {
    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();

    const currentUser = store.userInfo || JSON.parse(localStorage.getItem("userInfo"));
    
    const [availableSlots, setAvailableSlots] = useState([]);

    const [data, setData] = useState({
        barbershop_id: "",
        barber_id: "",
        barber_service_id: "",
        date: "",
        time: "",
        notes: ""
    });

useEffect(() => {
    const loadInitialData = async () => {
        const token = store.token || localStorage.getItem("token");
        const headers = { "Authorization": `Bearer ${token}` };
        
        try {
            const resShops = await fetch(`${import.meta.env.VITE_BACKEND_URL}/barbershops`, { headers });
            if (resShops.ok) dispatch({ type: "set-barbershops", payload: await resShops.json() });

            const resServ = await fetch(`${import.meta.env.VITE_BACKEND_URL}/barber_services`, { headers });
            if (resServ.ok) dispatch({ type: "set-barber_services", payload: await resServ.json() });

        } catch (error) { console.error("Error inicializando:", error); }
    };
    loadInitialData();
}, []);

useEffect(() => {
    const loadBarbersByShop = async () => {
        if (!data.barbershop_id) return;
        const token = store.token || localStorage.getItem("token");
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/barbershops/${data.barbershop_id}/barbers`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
            const barbersData = await res.json();
            dispatch({ type: "set-barbers", payload: barbersData });
        }
    };
    loadBarbersByShop();
}, [data.barbershop_id]);

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
                    console.error("Error al obtener disponibilidad", error);
                }
            }
        };
        fetchSlots();
    }, [data.date, data.barber_id, data.barbershop_id, data.barber_service_id]);

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

        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/appointments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${store.token}`
                },
                body: JSON.stringify(payload)
            });

            const responseData = await res.json();

            if (res.ok) {
                dispatch({ type: "set-message", payload: { "type": "success", "msg": "¡Cita reservada con éxito!" } });
                navigate(-1);
            } else {
                dispatch({ type: "set-message", payload: { "type": "error", "msg": responseData.message?.msg || "Error en la reserva" } });
            }
        } catch (error) { console.error(error); }
    };

    return (
        <div className="container mt-4">
            <h2 className="text-center mb-4">Reserva tu Cita</h2>
            <form onSubmit={handleSubmit} className="card p-4 shadow-sm border-0">
                
                <div className="mb-3 alert alert-light border">
                    <strong>Cliente:</strong> {currentUser?.name} {currentUser?.last_name}
                </div>

                <label className="form-label">¿A qué barbería quieres ir?</label>
                <select className="form-select mb-3" required value={data.barbershop_id}
                    onChange={e => setData({...data, barbershop_id: e.target.value, barber_id: "", barber_service_id: "", time: ""})}>
                    <option value="">Selecciona una sede...</option>
                    {store.barbershops?.map(shop => (
                        <option key={shop.id} value={shop.id}>{shop.name}</option>
                    ))}
                </select>

                <label className="form-label">Tu barbero de confianza</label>
                <select className="form-select mb-3" disabled={!data.barbershop_id} required value={data.barber_id}
                    onChange={e => setData({...data, barber_id: e.target.value, barber_service_id: "", time: ""})}>
                    <option value="">Selecciona barbero...</option>
                    {currentBarbers?.map(inv => (
                        <option key={inv.id} value={inv.barber.id}>{inv.barber.name}</option>
                    ))}
                </select>

                <label className="form-label">¿Qué servicio necesitas?</label>
                <select className="form-select mb-3" disabled={!data.barber_id} required value={data.barber_service_id}
                    onChange={e => setData({...data, barber_service_id: e.target.value, time: ""})}>
                    <option value="">Elegir servicio...</option>
                    {currentServices?.map(s => (
                        <option key={s.id} value={s.id}>{s.name} - {s.price}€</option>
                    ))}
                </select>

                <div className="row mb-3">
                    <div className="col-md-6">
                        <label className="form-label">Día</label>
                        <input type="date" className="form-control" required value={data.date}
                            onChange={e => {
                                setAvailableSlots([]);
                                setData({...data, date: e.target.value, time: ""});
                            }} />
                    </div>
                    <div className="col-md-6">
                        <label className="form-label">Hora disponible</label>
                        <select 
                            className="form-select" 
                            required 
                            value={data.time}
                            disabled={availableSlots.length === 0}
                            onChange={e => setData({...data, time: e.target.value})}
                        >
                            <option value="">{availableSlots.length > 0 ? "Selecciona hora..." : "Elige fecha y servicio"}</option>
                            {availableSlots.map(slot => (
                                <option key={slot} value={slot}>{slot}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="mb-4">
                    <label className="form-label">Notas adicionales</label>
                    <textarea className="form-control" rows="2" value={data.notes} 
                        onChange={e => setData({...data, notes: e.target.value})} placeholder="¿Alguna instrucción especial?"></textarea>
                </div>
                <button type="button" className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
                    Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={!data.time}>
                    Confirmar mi Reserva
                </button>
            </form>
        </div>
    );
};