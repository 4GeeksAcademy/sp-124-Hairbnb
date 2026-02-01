import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { useState, useEffect } from "react";

export const Services = () => {
    const navigate = useNavigate();
    const { store, dispatch } = useGlobalReducer();

    useEffect(() => {
        fetch(`${import.meta.env.VITE_BACKEND_URL}/services`)
            .then(resp => resp.json())
            .then(data => {
                dispatch({ type: "set-services", payload: data });
            })
            .catch(err => console.error(err));
    }, []);

    const deleteService = async (id) => {
        const confirmar = window.confirm("¿Deseas eliminar este servicio?");
        if (!confirmar) return;

        try {
            const response = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/services/${id}`,
                { method: "DELETE" }
            );

            if (!response.ok) {
                const text = await response.text();
                console.error("Error al eliminar servicio:", text);
                return;
            }

            dispatch({
                type: "set-services",
                payload: store.services.filter(service => service.id !== id)
            });

        } catch (error) {
            console.error("Error al eliminar servicio:", error);
        }
    };

    return (
        <div className="container">
            <div className="d-flex justify-content-between align-items-center my-4">
                <h1 className="display-6">Listado de servicios</h1>
                <Link to="/services_form">
                    <button type="button" className="btn btn-outline-secondary mb-2">Añadir nuevo servicio</button>
                </Link>
            </div>

            <div className="row g-3">
                {store.services.map(service => (
                    <div className="col-12 col-lg-6" key={service.id}>
                        <div className="card h-100">
                            <div className="card-body text-center">
                                <h5 className="card-title display-6">{service.name}</h5>
                                <hr />
                                <p className="card-text">
                                    <span className="fs-5"><i className="fa-solid fa-clock"></i> {service.duration}</span>
                                    <span className="m-2 fs-3">•</span>
                                    <span className="fs-5"><i className="fa-solid fa-money-bill-1"></i> {service.price}</span>
                                </p>
                                <p className="card-text">
                                    <span className="fs-5">Barbería: {service.barbershop_name}</span>
                                </p>
                            </div>

                            <div className="d-flex m-3 justify-content-around">
                                <Link
                                    to="/services_form"
                                    className="btn btn-outline-secondary"
                                    onClick={() => dispatch({ type: "set-serviceInfo", payload: service })}
                                >
                                    <i className="fa-regular fa-pen-to-square"></i> Editar
                                </Link>
                                <button className="btn btn-outline-secondary" onClick={() => deleteService(service.id)}>
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
