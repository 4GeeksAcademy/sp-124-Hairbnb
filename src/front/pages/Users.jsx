// Import necessary components from react-router-dom and other parts of the application.
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import storeReducer from "../store";
import { useState, useEffect } from "react";

export const Users = () => {
  // Access the global state and dispatch function using the useGlobalReducer hook.
  const navigate = useNavigate()
  const { store, dispatch } = useGlobalReducer();

  useEffect(() => {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/users`)
      .then(resp => resp.json())
      .then(data => {
        dispatch({ type: "set-users", payload: data });
      })
      .catch(err => console.error(err));
  }, []);

  const deleteUser = async (id) => {
    const confirmar = window.confirm("¿Deseas eliminar este usuario?");
    if (!confirmar) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/users/${id}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        const text = await response.text();
        console.error("Error al eliminar usuario:", text);
        return;
      }

      dispatch({
        type: "set-users",
        payload: store.users.filter(user => user.id !== id)
      });

    } catch (error) {
      console.error("Error al eliminar usuario:", error);
    }
  };

  return (
    <>
      <div className="container">
        <div className="d-flex justify-content-between align-items-center my-4">
          <h1 className="display-6">Listado de usuarios totales</h1>
          <Link to="/users_form">
            <button type="button" className="btn btn-outline-secondary mb-2">Añadir nuevo usuario</button>
          </Link>
        </div>
        <div className="row g-3">
          {store.users.map((el) => (
            <div className="col-12 col-lg-6" key={el.id}>
              <div className="card h-100">
                <div className="card-body align-self-center">
                  <h5 className="card-title display-6 text-center">{el.name} {el.last_name}</h5>
                  <hr />
                  <p className="card-text text-center">
                    <span className="fs-5"><i className="fa-solid fa-phone fs-5"></i> {el.phone}</span>
                    <span className="m-2 fs-3"> • </span>
                    <span className="fs-5"><i className="fa-regular fa-envelope fs-5"></i> {el.email}</span>
                  </p>
                  <p className="card-text text-center">

                    {el.notes ? (
                      <span><span className="fa-regular fa-note-sticky"></span>  <span className="fs-5">{el.notes}</span></span>
                    ) : (
                      <small className="text-muted fst-italic">
                        No hay notas para este cliente
                      </small>
                    )}
                  </p>
                </div>

                <div className="d-flex m-3 justify-content-around">
                  <Link
                    to="/users_form"
                    className="btn btn-outline-secondary"
                    onClick={() => {
                      dispatch({ type: "set-userInfo", payload: el });
                    }}
                  >
                    <i className="fa-regular fa-pen-to-square"></i> Editar
                  </Link>
                  <button className="btn btn-outline-secondary" onClick={() => deleteUser(el.id)}>
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
