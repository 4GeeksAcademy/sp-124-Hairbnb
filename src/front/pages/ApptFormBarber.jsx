import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const ApptFormBarber = () => {
    // ESTO SIEMPRE DENTRO DEL COMPONENTE
    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();

    const preData = store.appointmentInfo || {};
    const isEditing = !!preData.id;

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
    useEffect(() => {
    if (isEditing && preData.user_name) {
        setFoundUser({
            id: preData.user_id,
            name: preData.user_name,
            last_name: preData.user_last_name || ""
        });
    }
}, [isEditing, preData]);
    // Cargar servicios e invitaciones
    useEffect(() => {
        if (store.userInfo?.id) {
            const loadServices = async () => {
                try {
                    const resp = await fetch(`${import.meta.env.VITE_BACKEND_URL}/barber_services`, {
                        headers: { "Authorization": `Bearer ${store.token}` }
                    });
                    if (resp.ok) {
                        const allServices = await resp.json();
                        const myServices = allServices.filter(s =>
                            Number(s.barber_id) === Number(store.userInfo.id)
                        );
                        dispatch({ type: "set-services", payload: myServices });
                    }
                } catch (error) { console.error("Error servicios:", error); }
            };

            loadServices();

            const mySedes = store.invitations?.filter(inv => inv.status === "accepted") || [];
            if (mySedes.length === 1 && !data.barbershop_id) {
                setData(prev => ({ ...prev, barbershop_id: mySedes[0].barbershop_id }));
            }
        }
    }, [store.userInfo?.id]);

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
            user_id: Number(data.user_id),
            barber_id: Number(store.userInfo.id), 
            barbershop_id: Number(data.barbershop_id),
            barber_service_id: Number(data.barber_service_id),
            date: `${data.date}T${data.time}:00`,
            notes: data.notes
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

            const responseData = await res.json();

            if (res.ok) {
                dispatch({ type: "set-appointmentInfo", payload: null });
                dispatch({ type: "set-message", payload: { "type": "success", "msg": "Cita guardada con éxito" } });
                navigate("/private/barber");
            } else {
                dispatch({ type: "set-message", payload: { "type": "error", "msg": responseData.message?.msg || "Error al guardar" } });
            }
        } catch (error) { 
            console.error(error); 
        }
    };

    return (
        <div className="container mt-4">
            <h3 className="mb-4">{isEditing ? "Editar Cita" : "Nueva Cita"}</h3>
            <form onSubmit={handleSubmit} className="card">

                <div className="mb-3 p-2">
                    {foundUser ? (
                        <div className="d-flex justify-content-between align-items-center">
                            <span>Cliente: <strong>{foundUser.name}</strong></span>
                            <button type="button" className="btn" onClick={() => { setFoundUser(null); setData({ ...data, user_id: "" }) }}>Cambiar</button>
                        </div>
                    ) : (
                        <div className="input-group">
                            <input type="text" className="form-control" placeholder="Teléfono cliente..." value={phoneSearch} onChange={e => setPhoneSearch(e.target.value)} />
                            <button type="button" className="btn" onClick={handleSearchUser}>Buscar</button>
                        </div>
                    )}
                </div>

                <div className="mb-3">
                    <label className="form-label">Sede</label>
                    <select className="form-select" value={data.barbershop_id} onChange={e => setData({ ...data, barbershop_id: e.target.value })} required>
                        <option value="">Selecciona lugar...</option>
                        {store.invitations?.filter(inv => inv.status === "accepted").map(inv => (
                            <option key={inv.barbershop.id} value={inv.barbershop.id}>{inv.barbershop.name}</option>
                        ))}
                    </select>
                </div>

                <div className="mb-3">
                    <label className="form-label">Servicio</label>
                    <select
                        className="form-select"
                        value={data.barber_service_id}
                        onChange={e => setData({ ...data, barber_service_id: e.target.value })}
                        required
                    >
                        <option value="">
                            {store.services?.length > 0 ? "Selecciona un servicio..." : "Cargando servicios o lista vacía..."}
                        </option>
                        {store.services?.map(item => {
                            const name = item.service?.name || item.name || "Servicio";
                            const price = item.service?.price || item.price || "--";
                            const duration = item.service?.duration || item.duration || "??";

                            return (
                                <option key={item.id} value={item.id}>
                                    {name} - {price}€ ({duration} min)
                                </option>
                            );
                        })}
                    </select>
                </div>

                <div className="row">
                    <div className="col-6 mb-3"><input type="date" className="form-control" value={data.date} onChange={e => setData({ ...data, date: e.target.value })} required /></div>
                    <div className="col-6 mb-3"><input type="time" className="form-control" value={data.time} onChange={e => setData({ ...data, time: e.target.value })} required /></div>
                </div>

                <button type="submit" className="btn btn-primary" disabled={!data.user_id}>
                    {isEditing ? "Guardar Cambios" : "Confirmar Cita"}
                </button>
            </form>
        </div>
    );
};