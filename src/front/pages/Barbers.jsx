import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { useState, useEffect } from "react";

export const Barbers = () => {
    const navigate = useNavigate();
    const { store, dispatch } = useGlobalReducer();

    useEffect(() => {
        fetch(`${import.meta.env.VITE_BACKEND_URL}/barbers`)
            .then(resp => resp.json())
            .then(data => {
                dispatch({ type: "set-barbers", payload: data });
            })
            .catch(err => console.error(err));
    }, []);

    const deleteBarber = async (id) => {
        const confirmar = window.confirm("¿Deseas eliminar este barbero?");
        if (!confirmar) return;

        try {
            const response = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/barbers/${id}`,
                { method: "DELETE" }
            );

            if (!response.ok) {
                const text = await response.text();
                console.error("Error al eliminar barbero:", text);
                return;
            }

            dispatch({
                type: "set-barbers",
                payload: store.barbers.filter(barber => barber.id !== id)
            });

        } catch (error) {
            console.error("Error al eliminar barbero:", error);
        }
    };

    return (
        <div className="container">
            <div className="d-flex justify-content-between align-items-center my-4">
                <h1 className="display-6">Listado de barberos</h1>
                <Link to="/barbers_form">
                    <button type="button" className="btn btn-outline-secondary mb-2">Añadir nuevo barbero</button>
                </Link>
            </div>

            <div className="row g-3">
                {store.barbers.map(barber => (
                    <div className="col-12 col-lg-6" key={barber.id}>
                        <div className="card h-100">
                            <div className="card-body text-center">
                                <h5 className="card-title display-6">{barber.name}</h5>
                                <hr />
                                <p className="card-text">
                                    <span className="fs-5"><i className="fa-regular fa-envelope"></i> {barber.email}</span>
                                </p>
                                <p className="card-text">
                                    <span className="fs-5">Barbería: {barber.barbershop_name}</span>
                                </p>
                            </div>

                            <div className="d-flex m-3 justify-content-around">
                                <Link
                                    to="/barbers_form"
                                    className="btn btn-outline-secondary"
                                    onClick={() => dispatch({ type: "set-barberInfo", payload: barber })}
                                >
                                    <i className="fa-regular fa-pen-to-square"></i> Editar
                                </Link>
                                <button className="btn btn-outline-secondary" onClick={() => deleteBarber(barber.id)}>
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