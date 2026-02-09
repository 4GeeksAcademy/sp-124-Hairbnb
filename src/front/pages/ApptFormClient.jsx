import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const ApptFormClient = () => {
    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();

    const currentUser = store.userInfo || JSON.parse(localStorage.getItem("userInfo"));

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

                const resBarbers = await fetch(`${import.meta.env.VITE_BACKEND_URL}/barbers`, { headers });
                if (resBarbers.ok) dispatch({ type: "set-barbers", payload: await resBarbers.json() });

                const resServ = await fetch(`${import.meta.env.VITE_BACKEND_URL}/barber_services`, { headers });
                if (resServ.ok) dispatch({ type: "set-barber_services", payload: await resServ.json() });

            } catch (error) { console.error("Error inicializando:", error); }
        };
        loadInitialData();
    }, []);

    const currentBarbers = store.barbers?.filter(inv => 
        inv.status === "accepted" && Number(inv.barbershop_id) === Number(data.barbershop_id)
    );

    const currentServices = store.barber_services?.filter(s => 
        Number(s.barber_id) === Number(data.barber_id)
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!currentUser?.id) {
            alert("No se pudo identificar tu usuario. Por favor, reingresa.");
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
            alert("¡Cita reservada con éxito!");
            navigate("/private/client");
        } else {
            alert(`Error: ${responseData.msg || "Error en la reserva"}`);
        }
    };

    return (
        <div className="container mt-4">
            <h2 className="text-center mb-4">Reserva tu Cita</h2>
            <form onSubmit={handleSubmit} className="card p-4 shadow-sm border-0">
                
                <div className="mb-3 p-2">
                    <label>Cliente - </label>
                    <span>{currentUser?.name}</span>
                </div>

                <label className="form-label">¿Dónde quieres venir?</label>
                <select className="form-select mb-3" required value={data.barbershop_id}
                    onChange={e => setData({...data, barbershop_id: e.target.value, barber_id: "", barber_service_id: ""})}>
                    <option value="">Selecciona una barbería...</option>
                    {store.barbershops?.map(shop => (
                        <option key={shop.id} value={shop.id}>{shop.name}</option>
                    ))}
                </select>

                <label className="form-label">Elige a tu barbero</label>
                <select className="form-select mb-3" disabled={!data.barbershop_id} required value={data.barber_id}
                    onChange={e => setData({...data, barber_id: e.target.value, barber_service_id: ""})}>
                    <option value="">{data.barbershop_id}</option>
                    {currentBarbers?.map(inv => (
                        <option key={inv.id} value={inv.barber.id}>{inv.barber.name}</option>
                    ))}
                </select>

                <label className="form-label">¿Qué te vamos a hacer?</label>
                <select className="form-select mb-3" disabled={!data.barber_id} required value={data.barber_service_id}
                    onChange={e => setData({...data, barber_service_id: e.target.value})}>
                    <option value="">Selecciona servicio...</option>
                    {currentServices?.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.price}€)</option>
                    ))}
                </select>

                <div className="row mb-3">
                    <div className="col">
                        <label className="form-label">Día</label>
                        <input type="date" className="form-control" required value={data.date}
                            onChange={e => setData({...data, date: e.target.value})} />
                    </div>
                    <div className="col">
                        <label className="form-label">Hora</label>
                        <input type="time" className="form-control" required value={data.time}
                            onChange={e => setData({...data, time: e.target.value})} />
                    </div>
                </div>

                <button type="submit" className="btn">
                    Confirmar Reserva
                </button>
            </form>
        </div>
    );
};