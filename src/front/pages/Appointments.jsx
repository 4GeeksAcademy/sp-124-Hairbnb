import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const Appointments = () => {
    const navigate = useNavigate();
    const { store, dispatch } = useGlobalReducer();
    const API_URL = import.meta.env.VITE_BACKEND_URL;

    const [barbershopId, setBarbershopId] = useState(null);
    const [barberId, setBarberId] = useState(null);
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

    useEffect(() => {
        fetch(`${API_URL}/barbershops`)
            .then(res => res.json())
            .then(data => dispatch({ type: "set-barbershops", payload: data }))
            .catch(err => console.error("Error cargando barberías:", err));

        fetch(`${API_URL}/barbers`)
            .then(res => res.json())
            .then(data => dispatch({ type: "set-barbers", payload: data }))
            .catch(err => console.error("Error cargando barberos:", err));

        fetch(`${API_URL}/appointments`)
            .then(res => res.json())
            .then(data => dispatch({ type: "set-appointments", payload: data }))
            .catch(err => console.error("Error cargando citas:", err));
    }, []);

    useEffect(() => {
        if (store.barbershops?.length > 0 && !barbershopId) {
            setBarbershopId(store.barbershops[0].id);
        }
    }, [store.barbershops]);

    const barbers = store.barbers?.filter(b => b.barbershop_id === barbershopId);
    const appointments = store.appointments?.filter(a =>
        a.barber_id === barberId && a.date.split("T")[0] === date
    );

    const deleteAppointment = async (id) => {
        if (!window.confirm("¿Deseas eliminar esta cita?")) return;

        try {
            const resp = await fetch(`${API_URL}/appointments/${id}`, { method: "DELETE" });
            const result = await resp.json();

            if (!resp.ok) {
                dispatch({ type: "set-message", payload: result.message || { type: "error", msg: "Error al eliminar cita" } });
                return;
            }

            dispatch({
                type: "set-appointments",
                payload: store.appointments.filter(a => a.id !== id)
            });

            dispatch({
                type: "set-message",
                payload: result.message || { type: "success", msg: "Cita eliminada correctamente" }
            });
        } catch (err) {
            dispatch({
                type: "set-message",
                payload: { type: "error", msg: "Error de conexión con el servidor" }
            });
        }
    };

    return (
        <div className="container">
            <div className="d-flex justify-content-between align-items-center my-4">
                <h1 className="display-6">Agenda</h1>
                <div>
                    <Link to="/">
                        <button className="mx-2 btn btn-outline-secondary mb-2">Volver</button>
                    </Link>
                    <Link to="/appointments_form">
                        <button className="mx-2 btn btn-outline-secondary mb-2">Nueva cita</button>
                    </Link>
                </div>
            </div>

            <ul className="nav nav-tabs mb-3">
                {store.barbershops.map(bs => (
                    <li className="nav-item" key={bs.id}>
                        <button
                            className={`nav-link ${barbershopId === bs.id ? "active" : ""}`}
                            onClick={() => {
                                setBarbershopId(bs.id);
                                setBarberId(null);
                            }}
                        >
                            {bs.name}
                        </button>
                    </li>
                ))}
            </ul>

            <div className="d-flex gap-3 mb-3">
                <select
                    className="form-select"
                    value={barberId || ""}
                    onChange={e => setBarberId(Number(e.target.value))}
                >
                    <option value="">Selecciona barbero</option>
                    {barbers?.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                </select>
                <input
                    type="date"
                    className="form-control"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                />
            </div>

            {barberId ? (
                <div className="row g-3">
                    {appointments?.length > 0 ? (
                        appointments.map(a => (
                            <div className="col-12 col-lg-6" key={a.id}>
                                <div className="card h-100 shadow-sm">
                                    <div className="card-body">
                                        <h5 className="card-title">
                                            {a.service_name} - {new Date(a.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </h5>
                                        <p className="card-text">
                                            Usuario: {a.user_name}<br />
                                            Barbero: {barbers.find(b => b.id === a.barber_id)?.name}<br />
                                            Notas: {a.notes || "    -    "}
                                        </p>
                                    </div>
                                    <div className="d-flex m-3 justify-content-around">
                                        <Link
                                            to="/appointments_form"
                                            className="btn btn-outline-secondary"
                                            onClick={() => dispatch({ type: "set-appointmentInfo", payload: a })}
                                        >
                                            <i className="fa-regular fa-pen-to-square"></i> Editar
                                        </Link>
                                        <button className="btn btn-outline-secondary" onClick={() => deleteAppointment(a.id)}>
                                            <i className="fa-solid fa-xmark"></i> Borrar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-12">
                            <div className="alert alert-light text-center">
                                No tiene asignada ninguna cita para este día
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="alert alert-light text-center">
                    Selecciona un barbero y una fecha para ver sus citas.
                </div>
            )}
        </div>
    );
};
