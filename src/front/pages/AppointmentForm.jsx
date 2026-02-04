import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const AppointmentForm = () => {
    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();

    const [data, setData] = useState({
        id: null,
        user_id: "",
        barbershop_id: "",
        barber_id: "",
        service_id: "",
        date: "",
        time: "",
        notes: ""
    });

    const isEditing = !!data.id;

    useEffect(() => {
        fetch(`${import.meta.env.VITE_BACKEND_URL}/services`)
            .then(r => r.json())
            .then(data => dispatch({ type: "set-services", payload: data }));
    }, []);

    useEffect(() => {
        if (store.appointmentInfo) {
            const appt = store.appointmentInfo;

            setData({
                id: appt.id || null,
                user_id: appt.user_id ? Number(appt.user_id) : "",
                barbershop_id: appt.barber?.barbershop_id ? Number(appt.barber.barbershop_id) : "",
                barber_id: appt.barber_id ? Number(appt.barber_id) : "",
                service_id: appt.service_id ? Number(appt.service_id) : "",
                date: appt.date?.split("T")[0] || "",
                time: appt.date?.split("T")[1]?.slice(0, 5) || "",
                notes: appt.notes || ""
            });
        }
    }, [store.appointmentInfo]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setData(prev => ({
            ...prev,
            [name]: ["user_id", "barbershop_id", "barber_id", "service_id"].includes(name)
                ? Number(value)
                : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            user_id: data.user_id,
            barber_id: data.barber_id,
            service_id: data.service_id,
            notes: data.notes,
            date: `${data.date}T${data.time}:00`
        };

        const url = isEditing
            ? `${import.meta.env.VITE_BACKEND_URL}/appointments/${data.id}`
            : `${import.meta.env.VITE_BACKEND_URL}/appointments`;

        try {
            const resp = await fetch(url, {
                method: isEditing ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const result = await resp.json();

            if (resp.ok) {
                dispatch({ type: "set-message", payload: { type: "success", msg: isEditing ? "Cita actualizada" : "Cita agendada" } });
                dispatch({ type: "set-appointmentInfo", payload: null });
                navigate("/appointments");
            } else {
                dispatch({ type: "set-message", payload: { type: "danger", msg: result.message || "Error al guardar" } });
            }
        } catch (error) {
            dispatch({ type: "set-message", payload: { type: "danger", msg: "Error de conexión" } });
        }
    };

    const filteredBarbers = (store.barbers || []).filter(b => !data.barbershop_id || b.barbershop_id === parseInt(data.barbershop_id));
    const filteredServices = (store.services || []).filter(s => !data.barber_id || (store.barberservice || []).some(bs => bs.service_id === s.id && bs.barber_id === parseInt(data.barber_id)));
    const servicesToShow = isEditing ? store.services : filteredServices;
    const userName = store.users.find(u => u.id === parseInt(data.user_id))?.name + " " + store.users.find(u => u.id === parseInt(data.user_id))?.last_name;
    const barbershopName = store.barbershops.find(b => b.id === parseInt(data.barbershop_id))?.name;

    return (
        <form className="mx-auto p-4 card shadow-sm" onSubmit={handleSubmit} style={{ maxWidth: "800px" }}>
            <h2 className="text-center mb-4">{isEditing ? "Editar Cita" : "Agendar Nueva Cita"}</h2>

            {store.message?.msg && (
                <div className={`alert alert-${store.message.type} text-center`}>{store.message.msg}</div>
            )}

            <div className="row g-3">
                <div className="col-md-6">
                    <label className="form-label">Cliente</label>
                    {isEditing ? (
                        <input type="text" className="form-control" value={"No editable"} disabled />
                    ) : (
                        <select
                            className="form-select"
                            name="user_id"
                            value={data.user_id}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Selecciona cliente</option>
                            {store.users.map(u => (
                                <option key={u.id} value={u.id}>{u.name} {u.last_name}</option>
                            ))}
                        </select>
                    )}
                </div>

                <div className="col-md-6">
                    <label className="form-label">Barbería</label>
                    {isEditing ? (
                        <input type="text" className="form-control" value={"No editable"} disabled />
                    ) : (
                        <select
                            className="form-select"
                            name="barbershop_id"
                            value={data.barbershop_id}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Selecciona barbería</option>
                            {store.barbershops.map(b => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                        </select>
                    )}
                </div>

                <div className="col-md-6">
                    <label className="form-label">Barbero</label>
                    <select
                        className="form-select"
                        name="barber_id"
                        value={data.barber_id}
                        onChange={handleChange}
                        disabled={!data.barbershop_id}
                        required
                    >
                        <option value="">Selecciona barbero</option>
                        {filteredBarbers.map(b => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                    </select>
                </div>

                <div className="col-md-6">
                    <label className="form-label">Servicio</label>
                    {servicesToShow.length > 0 && (
                        <select
                            className="form-select"
                            name="service_id"
                            value={data.service_id}
                            onChange={handleChange}
                            disabled={isEditing}
                            required
                        >
                            <option value="">Selecciona servicio</option>
                            {servicesToShow.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    )}
                </div>

                <div className="col-md-6">
                    <label className="form-label">Fecha</label>
                    <input
                        type="date"
                        className="form-control"
                        name="date"
                        value={data.date}
                        onChange={handleChange}

                        required
                    />
                </div>

                <div className="col-md-6">
                    <label className="form-label">Hora</label>
                    <input
                        type="time"
                        className="form-control"
                        name="time"
                        value={data.time}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="col-md-6">
                    <label className="form-label">Notas</label>
                    <textarea
                        className="form-control"
                        name="notes"
                        value={data.notes}
                        onChange={handleChange}
                    />
                </div>


                <div className="mt-5 d-flex justify-content-around">
                    <button
                        type="submit"
                        className="btn btn-outline-secondary mx-3 w-25"
                    >
                        {data.id ? "Actualizar cita" : "Crear cita"}
                    </button>
                    <Link to="/appointments" className="btn btn-secondary mx-3 w-25">Volver</Link>
                </div>
            </div>
        </form>
    );
};
