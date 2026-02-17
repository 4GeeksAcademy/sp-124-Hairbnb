import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import { useState, useEffect } from "react";

export const Schedules = () => {
    const navigate = useNavigate();
    const { store, dispatch } = useGlobalReducer();

    useEffect(() => {
        const loadSchedules = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/schedules`);

                if (response.ok) {
                    const data = await response.json();
                    dispatch({ type: "set-schedules", payload: data });
                } else {
                    console.error("Error al cargar los horarios. Status:", response.status);
                }
            } catch (error) {
                console.error("Error de red al intentar obtener los horarios:", error);
            }
        };

        loadSchedules();
    }, [dispatch]);

    const deleteSchedule = async (id) => {
        const confirmar = window.confirm("¿Deseas eliminar este horario?");
        if (!confirmar) return;

        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/schedules/${id}`, {
                method: "DELETE"
            });

            const result = await response.json();

            if (result.message) {
                dispatch({ type: "set-message", payload: result.message });
            }

            if (!response.ok) return;

            dispatch({
                type: "set-schedules",
                payload: store.schedules.filter(schedule => schedule.id !== id)
            });

        } catch (error) {
            dispatch({
                type: "set-message",
                payload: { type: "error", msg: "Error de conexión con el servidor" }
            });
        }
    };



    return (
        <div className="container">
            <div className="d-flex justify-content-between align-items-center my-4">
                <h1 className="display-6">Listado de horarios</h1>
                <div>
                    <Link to="/">
                        <button type="button" className="mx-2 btn btn-outline-secondary mb-2">Volver</button>
                    </Link>
                    <Link to="/schedules_form">
                        <button type="button" className="mx-2 btn btn-outline-secondary mb-2">Añadir nuevo horario</button>
                    </Link>
                </div>
            </div>
            <div className="row g-3">
                {store.schedules.map(schedule => (
                    <div className="col-12 col-lg-6" key={schedule.id}>
                        <div className="card h-100">
                            <div className="card-body text-center">
                                <h5 className="card-title display-6">Horario de {schedule.barber_name}</h5>
                                <p className="card-text">
                                    <span>Barbería: {schedule.barbershop_name}</span>
                                </p>
                                <p className="card-text">
                                    <span>Inicio: {schedule.start_time}</span> • <span>Fin: {schedule.end_time}</span>
                                </p>
                            </div>

                            <div className="d-flex m-3 justify-content-around">
                                <Link
                                    to="/schedules_form"
                                    className="btn btn-outline-warning"
                                    onClick={() => dispatch({ type: "set-scheduleInfo", payload: schedule })}
                                >
                                    <i className="fa-regular fa-pen-to-square"></i> Editar
                                </Link>
                                <button className="btn btn-outline-danger" onClick={() => deleteSchedule(schedule.id)}>
                                    <i className="fa-solid fa-xmark"></i> Borrar
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <Link to="/">
                <button type="button" className="btn btn-outline-secondary my-4 justify-center" onClick={() => navigate("/")}>Volver al inicio</button>
            </Link>
        </div>
    );
};
