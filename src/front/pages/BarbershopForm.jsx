import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const BarbershopForm = () => {
  const { store, dispatch } = useGlobalReducer();
  const navigate = useNavigate();

  const [data, setData] = useState({
    id: null,
    name: "",
    address: "",
    phone: ""
  });

  useEffect(() => {
    if (store.barbershopInfo) {
      setData({
        id: store.barbershopInfo.id || null,
        name: store.barbershopInfo.name || "",
        address: store.barbershopInfo.address || "",
        phone: store.barbershopInfo.phone || ""
      });
    }
  }, [store.barbershopInfo]);

  const handleChange = (e) => {
    setData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!data.name) {
      dispatch({ type: "set-message", payload: { type: "error", msg: "Es necesario un nombre" } });
      return
    }
    if (!data.address) {
      dispatch({ type: "set-message", payload: { type: "error", msg: "Es necesario una dirección" } });
      return
    }
    if (!data.phone) {
      dispatch({ type: "set-message", payload: { type: "error", msg: "Es necesario un teléfono" } });
      return
    }


    const isEditing = !!data.id;
    const url = isEditing
      ? `${import.meta.env.VITE_BACKEND_URL}/barbershops/${data.id}`
      : `${import.meta.env.VITE_BACKEND_URL}/barbershops`;
    const method = isEditing ? "PUT" : "POST";

    try {
      const resp = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${store.token}`
        },
        body: JSON.stringify({
          name: data.name,
          address: data.address,
          phone: data.phone
        })
      });

      const result = await resp.json();

      if (!resp.ok) {
        dispatch({
          type: "set-message",
          payload: { type: "error", "msg": "Error desconocido" }
        });
        return;
      }

      dispatch({ type: "set-message", payload: { type: "success", "msg": "Guardado" } });
      navigate("/private/owner");

    } catch (err) {
      console.error("Error en fetch:", err);
      dispatch({ type: "set-message", payload: { type: "error", "msg": "Error de conexión con el servidor" } });
    }
  };

  return (
    <div className="container">
      <div className="d-flex justify-content-between align-items-center my-4">
        <h1 className="display-6">{data.id ? "Editar barbería" : "Añadir barbería"}</h1>
        <Link to="/private/owner">
          <button type="button" className="mx-2 btn btn-outline-secondary mb-2">Volver</button>
        </Link>
      </div>

      <form className="mx-auto p-4" onSubmit={handleSubmit}>
        <div className="row g-3">
          <div className="col-12 col-md-6">
            <label className="form-label" htmlFor="name">Nombre</label>
            <input
              className="form-control"
              id="name"
              name="name"
              type="text"
              value={data.name}
              onChange={handleChange}
            />
          </div>

          <div className="col-12 col-md-6">
            <label className="form-label" htmlFor="phone">Teléfono</label>
            <input
              className="form-control"
              id="phone"
              name="phone"
              type="text"
              value={data.phone}
              onChange={handleChange}
            />
          </div>

          <div className="col-12">
            <label className="form-label" htmlFor="address">Dirección</label>
            <input
              className="form-control"
              id="address"
              name="address"
              type="text"
              value={data.address}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="mt-4 d-flex justify-content-around">
          <Link
            to="/private/owner"
            className="btn btn-outline-secondary mx-3 w-25"
            onClick={() => dispatch({ type: "set-barbershopInfo", payload: null })}
          >
            Volver
          </Link>
          <button type="submit" className="btn btn-outline-primary mx-3 w-25">
            {data.id ? "Actualizar" : "Crear"}
          </button>
        </div>
      </form>
    </div>
  );
};
