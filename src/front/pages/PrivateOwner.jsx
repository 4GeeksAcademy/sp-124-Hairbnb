import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const PrivateOwner = () => {
  const { store, dispatch } = useGlobalReducer();
  const [barbershops, setBarbershops] = useState([]);

  useEffect(() => {
    const fetchBarbershops = async () => {
      if (!store.token) return;

      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/owners/barbershops`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${store.token}`,
            },
          }
        );

        if (!res.ok) throw new Error("No se pudieron cargar tus barberías");

        const data = await res.json();
        setBarbershops(data);
      } catch (error) {
        console.error("Error al cargar barberías:", error);
        setBarbershops([]);
      }
    };

    fetchBarbershops();
  }, [store.token]);

  const handleDelete = async (id) => {
    const confirmar = window.confirm("¿Deseas eliminar esta barbería?");
    if (!confirmar) return;

    try {
      const resp = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/barbershops/${id}`,
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
          payload: result.message,
        });
      }

      if (!resp.ok) return;

      // 🔹 Actualizamos el estado local
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
      <div className="container mt-5 text-center">
        <h2>No tienes permisos de dueño</h2>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h1>Bienvenido, {store.username}</h1>

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
            <div className="card h-100 shadow-sm">
              <img
                src={`https://random.imagecdn.app/v1/image?width=500&height=150&random=${el.id}`}
                className="card-img-top"
                alt={`Imagen de ${el.name}`}
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
                  onClick={() =>
                    dispatch({ type: "set-barbershopInfo", payload: el })
                  }
                ><i className="fa-regular fa-compass"></i> Gestionar
                </Link>
                <Link
                  to="/barbershops_form"
                  className="btn btn-outline-secondary"
                  onClick={() =>
                    dispatch({ type: "set-barbershopInfo", payload: el })
                  }
                ><i className="fa-regular fa-pen-to-square"></i> Editar datos
                </Link>
                <button
                  className="btn btn-outline-secondary"
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
