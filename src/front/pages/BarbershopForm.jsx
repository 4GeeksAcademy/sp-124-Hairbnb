import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { uploadToCloudinary } from "../utilities/cloudinary";

export const BarbershopForm = () => {
  const { store, dispatch } = useGlobalReducer();
  const navigate = useNavigate();

  const [uploading, setUploading] = useState(false);

  const [data, setData] = useState({
    id: null,
    name: "",
    address: "",
    phone: "",
    barbershop_description: "",
    barbershop_image: ""
  });

  useEffect(() => {
    if (store.barbershopInfo) {
      setData({
        id: store.barbershopInfo.id || null,
        name: store.barbershopInfo.name || "",
        address: store.barbershopInfo.address || "",
        phone: store.barbershopInfo.phone || "",
        barbershop_description: store.barbershopInfo.barbershop_description || "",
        barbershop_image: store.barbershopInfo.barbershop_image || ""
      });
    }
  }, [store.barbershopInfo]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const imageUrl = await uploadToCloudinary(file);
    if (imageUrl) {
      setData(prev => ({ ...prev, barbershop_image: imageUrl }));
    }
    setUploading(false);
  };

  const handleChange = (e) => {
    setData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!data.name || !data.address || !data.phone) {
      dispatch({ type: "set-message", payload: { type: "error", msg: "Faltan campos obligatorios" } });
      return;
    }

    const isEditing = !!data.id;
    const url = isEditing
      ? `${import.meta.env.VITE_BACKEND_URL}/barbershops/${data.id}`
      : `${import.meta.env.VITE_BACKEND_URL}/barbershops`;
    
    try {
      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${store.token}`
        },
        body: JSON.stringify({
          name: data.name,
          address: data.address,
          phone: data.phone,
          barbershop_image: data.barbershop_image,
          barbershop_description: data.barbershop_description
        })
      });

      if (response.ok) {
        dispatch({ type: "set-message", payload: { type: "success", msg: "Guardado" } });
        navigate(-1);
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  if (store.role !== "owner") {
    return <div className="container mt-4"><h2 className="text-danger">Acceso denegado</h2></div>;
  }

  return (
    <div className="container">
      <div className="d-flex justify-content-between align-items-center my-4">
        <h1 className="display-6">{data.id ? "Editar barbería" : "Añadir barbería"}</h1>
        <button type="button" className="btn btn-outline-secondary" onClick={() => navigate(-1)}>Volver</button>
      </div>

      <form className="mx-auto p-4" onSubmit={handleSubmit}>
        <div className="row g-3">

          <div className="col-12 col-md-6">
            <label className="form-label">Nombre</label>
            <input className="form-control" name="name" type="text" value={data.name} onChange={handleChange} />
          </div>

          <div className="col-12 col-md-6">
            <label className="form-label">Teléfono</label>
            <input className="form-control" name="phone" type="text" value={data.phone} onChange={handleChange} />
          </div>

          <div className="col-12">
            <label className="form-label">Dirección</label>
            <input className="form-control" name="address" type="text" value={data.address} onChange={handleChange} />
          </div>
          <div className="col-12">
            <label className="form-label">Descripción</label>
            <textarea className="form-control" name="barbershop_description" type="text" value={data.barbershop_description} onChange={handleChange} />
          </div>
          <div className="col-12 text-center mb-3">
            {data.barbershop_image && (
              <img src={data.barbershop_image} alt="Preview" className="img-thumbnail mb-2" style={{ maxHeight: "200px" }} />
            )}
            <input type="file" className="form-control" onChange={handleFileChange} accept="image/*" disabled={uploading} />
            {uploading && <small className="text-primary fw-bold">Subiendo imagen...</small>}
          </div>
        </div>

        <div className="mt-4 d-flex justify-content-around">
          <button type="button" onClick={() => navigate(-1)} className="btn btn-outline-secondary">Cancelar</button>
          <button type="submit" className="btn btn-primary" disabled={uploading}>
            {uploading ? "Subiendo..." : (data.id ? "Actualizar" : "Crear")}
          </button>
        </div>
      </form>
    </div>
  );
};