import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const ApptFormClient = () => {
    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();

    const preData = store.appointmentInfo || {};
    const isEditing = !!preData.id;

    // Estado simplificado para el Barbero
    const [phoneSearch, setPhoneSearch] = useState("");
    const [foundUser, setFoundUser] = useState(null);
    const [data, setData] = useState({
        user_id: preData.user_id || "",
        barber_id: store.userInfo?.id || "",
        barbershop_id: preData.barbershop_id || "",
        barber_service_id: preData.barber_service_id || "",
        date: preData.date ? preData.date.split("T")[0] : "",
        time: preData.date ? preData.date.split("T")[1].slice(0, 5) : "",
        notes: preData.notes || ""
    });

    // 1. Efecto inicial: Cargar sedes del barbero y servicios
    useEffect(() => {
        if (store.userInfo?.id) {
            // Cargar servicios automáticamente para este barbero
            fetch(`${import.meta.env.VITE_BACKEND_URL}/barber_services`, {
                headers: { "Authorization": `Bearer ${store.token}` }
            })
            .then(res => res.json())
            .then(services => {
                const myServices = services.filter(s => Number(s.barber_id) === Number(store.userInfo.id));
                dispatch({ type: "set-services", payload: myServices });
            });

            // Auto-seleccionar barbería si solo tiene una invitación aceptada
            const mySedes = store.invitations?.filter(inv => inv.status === "accepted") || [];
            if (mySedes.length === 1 && !data.barbershop_id) {
                setData(prev => ({ ...prev, barbershop_id: mySedes[0].barbershop_id }));
            }
        }
    }, [store.userInfo]);

    // 2. Buscador de Clientes
    const handleSearchUser = async () => {
        if (!phoneSearch) return;
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/search?phone=${phoneSearch}`);
            if (res.ok) {
                const user = await res.json();
                setFoundUser(user);
                setData(prev => ({ ...prev, user_id: user.id }));
            } else { alert("Cliente no encontrado"); }
        } catch (error) { console.error(error); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            ...data,
            user_id: Number(data.user_id),
            barber_id: Number(store.userInfo.id), // Siempre el del JWT
            barbershop_id: Number(data.barbershop_id),
            barber_service_id: Number(data.barber_service_id),
            date: `${data.date}T${data.time}:00`
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
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                dispatch({ type: "set-appointmentInfo", payload: null });
                navigate("/private/barber");
            }
        } catch (error) { console.error(error); }
    };

    return (
        <div className="container mt-4" style={{ maxWidth: "500px" }}>
            <h3 className="mb-4">{isEditing ? "Editar Cita" : "Nueva Cita (Panel Barbero)"}</h3>
            <form onSubmit={handleSubmit} className="card p-4 shadow">
                
                {/* BUSCADOR DE CLIENTE */}
                <div className="mb-3 p-2 bg-light border rounded">
                    {foundUser ? (
                        <div className="d-flex justify-content-between align-items-center">
                            <span>Cliente: <strong>{foundUser.name}</strong></span>
                            <button type="button" className="btn btn-sm btn-link text-danger" onClick={() => {setFoundUser(null); setData({...data, user_id: ""})}}>Cambiar</button>
                        </div>
                    ) : (
                        <div className="input-group">
                            <input type="text" className="form-control" placeholder="Teléfono cliente..." value={phoneSearch} onChange={e => setPhoneSearch(e.target.value)} />
                            <button type="button" className="btn btn-dark" onClick={handleSearchUser}>Buscar</button>
                        </div>
                    )}
                </div>

                {/* BARBERÍA (Solo sus invitaciones) */}
                <div className="mb-3">
                    <label className="form-label">Sede</label>
                    <select className="form-select" value={data.barbershop_id} onChange={e => setData({...data, barbershop_id: e.target.value})} required>
                        <option value="">Selecciona sede...</option>
                        {store.invitations?.filter(inv => inv.status === "accepted").map(inv => (
                            <option key={inv.barbershop.id} value={inv.barbershop.id}>{inv.barbershop.name}</option>
                        ))}
                    </select>
                </div>

                {/* SERVICIOS (Solo los suyos) */}
                <div className="mb-3">
                    <label className="form-label">Servicio</label>
                    <select className="form-select" value={data.barber_service_id} onChange={e => setData({...data, barber_service_id: e.target.value})} required>
                        <option value="">¿Qué servicio?</option>
                        {store.services?.map(s => (
                            <option key={s.id} value={s.id}>{s.service?.name} ({s.service?.price}€)</option>
                        ))}
                    </select>
                </div>

                {/* FECHA Y HORA */}
                <div className="row">
                    <div className="col-6 mb-3"><input type="date" className="form-control" value={data.date} onChange={e => setData({...data, date: e.target.value})} required /></div>
                    <div className="col-6 mb-3"><input type="time" className="form-control" value={data.time} onChange={e => setData({...data, time: e.target.value})} required /></div>
                </div>

                <button type="submit" className="btn btn-primary w-100 mt-2" disabled={!data.user_id}>
                    {isEditing ? "Guardar Cambios" : "Confirmar Cita"}
                </button>
            </form>
        </div>
    );
};