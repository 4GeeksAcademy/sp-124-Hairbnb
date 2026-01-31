// Import necessary components from react-router-dom and other parts of the application.
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import storeReducer from "../store";
import { useState, useEffect } from "react";

export const Barbershops = () => {
    // Access the global state and dispatch function using the useGlobalReducer hook.
    const navigate = useNavigate()
    const { store, dispatch } = useGlobalReducer();

    useEffect(() => {
        fetch(`${import.meta.env.VITE_BACKEND_URL}/barbershops`)
            .then(resp => resp.json())
            .then(data => {
                dispatch({ type: "set-barbershops", payload: data });
            })
            .catch(err => console.error(err));
    }, []);

    const deleteBarbershop = async (id) => {
        const confirmar = window.confirm("¿Deseas eliminar esta barberia?");
        if (!confirmar) return;

        try {
            const response = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/barbershops/${id}`,
                { method: "DELETE" }
            );

            if (!response.ok) {
                const text = await response.text();
                console.error("Error al eliminar barberia:", text);
                return;
            }

            dispatch({
                type: "set-barbershops",
                payload: store.barbershops.filter(barbershop => barbershop.id !== id)
            });

        } catch (error) {
            console.error("Error al eliminar barberia:", error);
        }
    };

    return (
        <>
            <div className="container">
                <div className="d-flex justify-content-between align-items-center my-4">
                    <h1 className="display-6">Listado de barberías totales</h1>
                    <Link to="/barbershops_form">
                        <button type="button" className="btn btn-outline-secondary mb-2">Añadir nueva barbería</button>
                    </Link>
                </div>
                <div className="row g-3">
                    {store.barbershops.map((el) => (
                        <div className="col-12 col-lg-6" key={el.id}>
                            <div className="card h-100">
                                <div className="card-body align-self-center">
                                    <h5 className="card-title display-6 text-center">{el.name}</h5>
                                    <hr />
                                    <p className="card-text text-center">
                                        <span className="fs-5"><i className="fa-regular fa-envelope fs-5"></i> {el.phone}</span>
                                        <span className="m-2 fs-3"> • </span>
                                        <span className="fs-5"><i className="fa-solid fa-phone fs-5"></i> {el.address}</span>
                                    </p>
                                </div>

                                <div className="d-flex m-3 justify-content-around">
                                    <Link
                                        to="/barbershops_form"
                                        className="btn btn-outline-secondary"
                                        onClick={() => {
                                            dispatch({ type: "set-barbershopInfo", payload: el });
                                        }}
                                    >
                                        <i className="fa-regular fa-pen-to-square"></i> Editar
                                    </Link>
                                    <button className="btn btn-outline-secondary" onClick={() => deleteBarbershop(el.id)}>
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
            </div >
        </>
    );
};
