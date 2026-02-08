import { useEffect } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { Link } from "react-router-dom";

export const BarberServices = () => {
    const { store, dispatch } = useGlobalReducer();

    useEffect(() => {
        fetch(`${import.meta.env.VITE_BACKEND_URL}/barbers`)
            .then(resp => resp.json())
            .then(data => dispatch({ type: "set-barbers", payload: data }))
            .catch(err => console.error(err));

        fetch(`${import.meta.env.VITE_BACKEND_URL}/services`)
            .then(resp => resp.json())
            .then(data => dispatch({ type: "set-services", payload: data }))
            .catch(err => console.error(err));

        fetch(`${import.meta.env.VITE_BACKEND_URL}/barber_services`)
            .then(resp => resp.json())
            .then(data => dispatch({ type: "set-barberservices", payload: data }))
            .catch(err => console.error(err));
    }, []);

    return (
        <div className="container">
            <div className="d-flex justify-content-between align-items-center my-4">
                <h1 className="display-6 my-4 text-center">Barberos y sus servicios</h1>
                <Link to="/">
                    <button type="button" className="btn btn-outline-secondary mb-2">Volver</button>
                </Link>
            </div>
            <div className="row g-3">
                {store.barbers.map(barber => {
                    const assigned = store.barberservice
                        .filter(barbser => barbser.barber_id === barber.id)
                        .map(barbser => barbser.service_name);

                    return (
                        <div className="col-12 col-lg-6" key={barber.id}>
                            <div className="card h-100">
                                <div className="card-body text-center">
                                    <h5 className="card-title display-6">{barber.name}</h5>
                                    <p className="card-text">
                                        <strong>Barbería:</strong> {barber.barbershop_name}
                                    </p>
                                    <hr />
                                    <p className="card-text">
                                        <strong>Servicios que ofrece:</strong>
                                    </p>
                                    <ul className="list-group list-group-flush">
                                        {assigned.length > 0 ? (
                                            assigned.map((s, index) => (
                                                <li key={index} className="list-group-item">{s}</li>
                                            ))
                                        ) : (
                                            <li className="list-group-item fst-italic">Sin servicios asignados</li>
                                        )}
                                    </ul>
                                </div>
                                <div className="d-flex m-3 justify-content-around">
                                    <Link
                                        to="/barber_services_form"
                                        className="btn btn-outline-primary"
                                        onClick={() => dispatch({ type: "set-barberInfo", payload: barber })}
                                    >
                                        <i className="fa-regular fa-pen-to-square"></i> Editar servicios
                                    </Link>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
