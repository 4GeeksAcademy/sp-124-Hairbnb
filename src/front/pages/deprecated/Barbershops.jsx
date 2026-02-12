import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import { useEffect } from "react";


export const Barbershops = () => {
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
        const confirmar = window.confirm("¿Deseas eliminar esta barbería?");
        if (!confirmar) return;

        try {
            const resp = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/barbershops/${el.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${store.token}`,
          },
        }
      );
            const result = await resp.json();

            if (result.message) {
                dispatch({
                    type: "set-message",
                    payload: result.message
                });
            }

            if (!resp.ok) return;

            dispatch({
                type: "set-barbershops",
                payload: store.barbershops.filter(b => b.id !== id)
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
                <h1 className="display-6">Listado de barberías totales</h1>
                <div>
                    <Link to="/">
                        <button type="button" className="mx-2 btn btn-outline-secondary mb-2">Volver</button>
                    </Link>
                    <Link to="/barbershops_form">
                        <button type="button" className="mx-2 btn btn-outline-secondary mb-2">Añadir nueva barbería</button>
                    </Link>
                </div>
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
    );
};
