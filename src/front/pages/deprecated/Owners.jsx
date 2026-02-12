import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import { useEffect } from "react";

export const Owners = () => {
    const navigate = useNavigate();
    const { store, dispatch } = useGlobalReducer();

    useEffect(() => {
        fetch(`${import.meta.env.VITE_BACKEND_URL}/owners`)
            .then(resp => resp.json())
            .then(data => {
                dispatch({ type: "set-owners", payload: data });
            })
            .catch(err => console.error(err));
    }, []);

    const deleteOwner = async (id) => {
        const confirmar = window.confirm("¿Deseas eliminar este dueño?");
        if (!confirmar) return;

        try {
            const resp = await fetch(`${import.meta.env.VITE_BACKEND_URL}/owners/${id}`, { method: "DELETE" });
            const result = await resp.json();

            if (result.message) {
                dispatch({ type: "set-message", payload: result.message });
            }

            if (!resp.ok) return;

            dispatch({
                type: "set-owners",
                payload: store.owners.filter(o => o.id !== id)
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
                <h1 className="display-6">Listado de dueños</h1>
                <div>
                    <Link to="/">
                        <button type="button" className="mx-2 btn btn-outline-secondary mb-2">Volver</button>
                    </Link>

                    <Link to="/owners_form">
                        <button type="button" className="mx-2 btn btn-outline-secondary mb-2">Añadir nuevo dueño</button>
                    </Link>
                </div>
            </div>
            <div className="row g-3">
                {store.owners.map(owner => (
                    <div className="col-12 col-lg-6" key={owner.id}>
                        <div className="card h-100">
                            <div className="card-body text-center">
                                <h5 className="card-title display-6">{owner.name}</h5>
                                <hr />
                                <p className="card-text">
                                    <span className="fs-5"><i className="fa-solid fa-phone"></i> {owner.phone}</span>
                                    <span className="m-2 fs-3">•</span>
                                    <span className="fs-5"><i className="fa-regular fa-envelope"></i> {owner.email}</span>
                                </p>
                                <p className="card-text">
                                    <span className="fs-5">Barbería: {owner.barbershop_name}</span>
                                </p>
                            </div>

                            <div className="d-flex m-3 justify-content-around">
                                <Link
                                    to="/owners_form"
                                    className="btn btn-outline-secondary"
                                    onClick={() => dispatch({ type: "set-ownerInfo", payload: owner })}
                                >
                                    <i className="fa-regular fa-pen-to-square"></i> Editar
                                </Link>
                                <button className="btn btn-outline-secondary" onClick={() => deleteOwner(owner.id)}>
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
