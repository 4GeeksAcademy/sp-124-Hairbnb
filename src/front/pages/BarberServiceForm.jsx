import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const BarberServiceForm = () => {
  const { store, dispatch } = useGlobalReducer();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    duration: ""
  });

  useEffect(() => {
    if (store.barber_serviceInfo) {
      setFormData({
        name: store.barber_serviceInfo.name || "",
        price: store.barber_serviceInfo.price || "",
        duration: store.barber_serviceInfo.duration || ""
      });
    }
  }, [store.barber_serviceInfo]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = store.token || localStorage.getItem("token"); 

    if (!token) {
        alert("Tu sesión ha caducado. Por favor, vuelve a iniciar sesión.");
        navigate("/login");
        return;
    }

    const isEditing = !!store.barber_serviceInfo;
    const url = isEditing 
        ? `${import.meta.env.VITE_BACKEND_URL}/barber_services/${store.barber_serviceInfo.id}`
        : `${import.meta.env.VITE_BACKEND_URL}/barber_services`;

    try {
        const resp = await fetch(url, {
            method: isEditing ? "PUT" : "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        });

        if (resp.ok) {
            dispatch({ type: "set-barber_serviceInfo", payload: null });
            dispatch({ type: "set-message", payload: { type: "success", msg: `Servicio ${isEditing ? "actualizado" : "creado"} correctamente` } });
            navigate(-1);
        } else {
            const errorData = await resp.json();
            console.error("Error del servidor:", errorData);
        }
    } catch (error) {
        console.error("Error en la petición:", error);
    }
};

if (store.role !== "barber") {
        return (
            <div className="container mt-4">
                <h2 className="text-danger">Acceso denegado</h2>
                <p>Inicia sesión como barbero para gestionar tus servicios.</p>
            </div>
        );
    }

  return (
    <div className="container mt-5">
      <div className="card mx-auto" style={{ maxWidth: "500px" }}>
        <div className="card-header">
          <h4 className="mb-0">{store.barber_serviceInfo ? "Editar Servicio" : "Nuevo Servicio"}</h4>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Nombre del Servicio</label>
              <input
                type="text"
                className="form-control"
                placeholder="Ej: Corte Degradado"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Precio (€)</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Duración (min)</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="30"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="d-flex justify-content-between mt-4">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => {
                  dispatch({ type: "set-barber_serviceInfo", payload: null });
                  navigate(-1);
                }}
              >
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                {store.barber_serviceInfo ? "Guardar Cambios" : "Añadir a mi lista"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};