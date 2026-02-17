import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import { useEffect } from "react";

export const Barbers = () => {
    const navigate = useNavigate();
    const { store, dispatch } = useGlobalReducer();

    useEffect(() => {
    const loadBarbers = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/barbers`);
            
            if (response.ok) {
                const data = await response.json();
                dispatch({ type: "set-barbers", payload: data });
            } else {
                console.error("No se pudieron cargar los barberos. Status:", response.status);
            }
        } catch (error) {
            console.error("Error de red al cargar barberos:", error);
        }
    };

    loadBarbers();
}, [dispatch]);

    const deleteBarber = async (id) => {
        const confirmar = window.confirm("¿Deseas eliminar este barbero?");
        if (!confirmar) return;

        try {
            const response = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/barbers/${id}`,
                { method: "DELETE" }
            );

            const result = await response.json();

            if (result.message) {
                dispatch({
                    type: "set-message",
                    payload: result.message
                });
            }

            if (!response.ok) return;

            dispatch({
                type: "set-barbers",
                payload: store.barbers.filter(barber => barber.id !== id)
            });

        } catch (error) {
            dispatch({
                type: "set-message",
                payload: {
                    type: "error",
                    msg: "Error de conexión con el servidor"
                }
            });
        }
    };


    return (
        <div className="container">
            <div className="d-flex justify-content-between align-items-center my-4">
                <h1 className="display-6">Listado de barberos</h1>
                <div>
                <Link to="/">
                    <button type="button" className="mx-2 btn btn-outline-secondary mb-2">Volver</button>
                </Link>
                <Link to="/barbers_form">
                    <button type="button" className="mx-2 btn btn-outline-secondary mb-2">Añadir nuevo barbero</button>
                </Link>
                </div>
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
