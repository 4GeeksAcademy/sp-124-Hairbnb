import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import defaultImage from "../../../public/DefaultImage.png"

export const PrivateOwner = () => {
  const { store, dispatch } = useGlobalReducer();
  const [barbershops, setBarbershops] = useState([]);

  useEffect(() => {
    const fetchBarbershops = async () => {
      if (!store.token) return;

      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/owners/barbershops`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${store.token}`,
            },
          }
        );

        if (!response.ok) throw new Error("No se pudieron cargar tus barberías");

        const data = await response.json();
        setBarbershops(data);
      } catch (error) {
        setBarbershops([]);
      }
    };

    fetchBarbershops();
  }, [store.token]);

  const handleDelete = async (id) => {
    const confirmar = window.confirm("¿Deseas eliminar esta barbería?");
    if (!confirmar) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/barbershops/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${store.token}`,
          },
        }
      );

      const result = await response.json();

      if (result.message) {
        dispatch({
          type: "set-message",
          payload: result.message,
        });
      }

      if (!response.ok) return;

      setBarbershops(barbershops.filter((b) => b.id !== id));
    } catch (error) {
      dispatch({
        type: "set-message",
        payload: { type: "error", msg: "Error de conexión con el servidor" },
      });
    }
  };


  if (store.role !== "owner") {
    return (
      <div className="container mt-4">
        <h2 className="text-danger">Acceso denegado</h2>
        <p>Inicia sesión como dueño para acceder al panel de gestión.</p>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h1>Panel de {store.username}</h1>

      <div className="d-flex justify-content-between align-items-center my-4">
        <h2>Tus barberías</h2>

        <Link to="/barbershops_form">
          <button
            className="btn btn-outline-secondary"
            onClick={() => dispatch({ type: "set-barbershopInfo", payload: null })}
          >
            Añadir nueva barbería
          </button>
        </Link>
      </div>

      <div className="row g-3">
        {barbershops.length === 0 && (
          <p className="text-muted">Aún no tienes barberías creadas</p>
        )}

        {barbershops.map((el) => (
          <div className="col-12 col-lg-6" key={el.id}>
            <div className="card h-100">
              <img
                src={el.barbershop_image || defaultImage}
                className="card-img-top"
                alt={`Imagen de ${el.name}`}
                style={{
                  height: "150px",
                  objectFit: "cover",
                  width: "100%"
                }}
              />
              <div className="card-body text-center">
                <h5 className="card-title display-6">{el.name}</h5>
                <hr />
                <p className="card-text">
                  <i className="fa-solid fa-phone me-2"></i>
                  {el.phone}
                  <br />
                  <i className="fa-solid fa-location-dot me-2"></i>
                  {el.address}
                </p>
              </div>

              <div className="d-flex justify-content-around m-3">
                <Link
                  to="/private/owner/gestion"
                  className="btn btn-outline-secondary"
                  onClick={() => {
                    dispatch({ type: "set-barbershopInfo", payload: el });
                    dispatch({ type: "set-barbershops", payload: barbershops });
                  }}
                >
                  <i className="fa-regular fa-compass"></i> Gestionar
                </Link>
                <Link
                  to="/barbershops_form"
                  className="btn btn-outline-warning"
                  onClick={() =>
                    dispatch({ type: "set-barbershopInfo", payload: el })
                  }
                ><i className="fa-regular fa-pen-to-square"></i> Editar datos
                </Link>
                <button
                  className="btn btn-outline-danger"
                  onClick={() => handleDelete(el.id)}
                >
                  <i className="fa-solid fa-xmark"></i>Borrar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
