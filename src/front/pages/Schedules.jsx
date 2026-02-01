import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { useState, useEffect } from "react";

export const Schedules = () => {
    const navigate = useNavigate();
    const { store, dispatch } = useGlobalReducer();

    useEffect(() => {
        fetch(`${import.meta.env.VITE_BACKEND_URL}/schedules`)
            .then(resp => resp.json())
            .then(data => {
                dispatch({ type: "set-schedules", payload: data });
            })
            .catch(err => console.error(err));
    }, []);

    const deleteSchedule = async (id) => {
        const confirmar = window.confirm("¿Deseas eliminar este horario?");
        if (!confirmar) return;

        try {
            const response = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/schedules/${id}`,
                { method: "DELETE" }
            );

            if (!response.ok) {
                const text = await response.text();
                console.error("Error al eliminar horario:", text);
                return;
            }

            dispatch({
                type: "set-schedules",
                payload: store.schedules.filter(schedule => schedule.id !== id)
            });

        } catch (error) {
            console.error("Error al eliminar horario:", error);
        }
    };

    return (
        <div className="container">
            <div className="d-flex justify-content-between align-items-center my-4">
                <h1 className="display-6">Listado de horarios</h1>
                <Link to="/schedules_form">
                    <button type="button" className="btn btn-outline-secondary mb-2">Añadir nuevo horario</button>
                </Link>
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
                                    className="btn btn-outline-secondary"
                                    onClick={() => dispatch({ type: "set-scheduleInfo", payload: schedule })}
                                >
                                    <i className="fa-regular fa-pen-to-square"></i> Editar
                                </Link>
                                <button className="btn btn-outline-secondary" onClick={() => deleteSchedule(schedule.id)}>
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
