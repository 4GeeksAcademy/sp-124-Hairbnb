import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { uploadToCloudinary } from "../utilities/cloudinary";
import { APILoader, PlacePicker } from '@googlemaps/extended-component-library/react';

export const BarbershopForm = () => {
  const { store, dispatch } = useGlobalReducer();
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);

  const defaultHours = {
    Lunes: { m_start: "", m_end: "", a_start: "", a_end: "" },
    Martes: { m_start: "", m_end: "", a_start: "", a_end: "" },
    Miércoles: { m_start: "", m_end: "", a_start: "", a_end: "" },
    Jueves: { m_start: "", m_end: "", a_start: "", a_end: "" },
    Viernes: { m_start: "", m_end: "", a_start: "", a_end: "" },
    Sábado: { m_start: "", m_end: "", a_start: "", a_end: "" },
    Domingo: { m_start: "", m_end: "", a_start: "", a_end: "" }
  };

  const [data, setData] = useState({
    id: null,
    name: "",
    address: "",
    phone: "",
    barbershop_description: "",
    barbershop_image: "",
    latitude: null,
    longitude: null,
    working_hours: defaultHours
  });

  useEffect(() => {
    if (store.barbershopInfo) {
      setData({
        id: store.barbershopInfo.id || null,
        name: store.barbershopInfo.name || "",
        address: store.barbershopInfo.address || "",
        phone: store.barbershopInfo.phone || "",
        barbershop_description: store.barbershopInfo.barbershop_description || "",
        barbershop_image: store.barbershopInfo.barbershop_image || "",
        latitude: store.barbershopInfo.latitude || null,
        longitude: store.barbershopInfo.longitude || null,

        working_hours: store.barbershopInfo.working_hours && Object.keys(store.barbershopInfo.working_hours).length > 0
          ? store.barbershopInfo.working_hours
          : defaultHours
      });
    }
  }, [store.barbershopInfo]);

  const handlePlaceChange = (e) => {
    const place = e.target.value;
    if (place && place.location) {
      setData(prev => ({
        ...prev,
        address: place.formattedAddress || place.displayName,
        latitude: place.location.lat(),
        longitude: place.location.lng()
      }));
    }
  };

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

  const handleHourChange = (day, field, value) => {
    setData(prev => ({
      ...prev,
      working_hours: {
        ...prev.working_hours,
        [day]: { ...prev.working_hours[day], [field]: value }
      }
    }));
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
        body: JSON.stringify(data)
      });

      if (response.ok) {
        dispatch({ type: "set-message", payload: { type: "success", msg: "Barbería guardada correctamente" } });
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
    <div className="container pb-5">
      <APILoader apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY} />
      <div className="d-flex justify-content-between align-items-center my-4">
        <h1 className="display-6">{data.id ? "Editar barbería" : "Añadir barbería"}</h1>
        <button type="button" className="btn btn-outline-secondary" onClick={() => navigate(-1)}>Volver</button>
      </div>

      <form className="mx-auto" onSubmit={handleSubmit}>
        <div className="row g-3">
          <div className="col-12 col-md-6">
            <label className="form-label fw-bold">Nombre</label>
            <input className="form-control" name="name" type="text" value={data.name} onChange={handleChange} required />
          </div>

          <div className="col-12 col-md-6">
            <label className="form-label fw-bold">Teléfono</label>
            <input
              type="text"
              className="form-control"
              placeholder="Ej: 600123456"
              maxLength="9"
              value={data.phone}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                setData({ ...data, phone: val });
              }}
              required
            />
          </div>

          <div className="col-12">
            <label className="form-label fw-bold">Dirección</label>
            <PlacePicker
              placeholder={data.address || "Busca la dirección..."}
              onPlaceChange={handlePlaceChange}
            />
          </div>

          <div className="col-12">
            <label className="form-label fw-bold">Horarios de Apertura</label>
            <div className="bg-light p-3 rounded border">
              {["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"].map(day => (
                <div key={day} className="row mb-3 align-items-center border-bottom pb-2">
                  <div className="col-12 col-md-2">
                    <span className="fw-bold">{day}</span>
                  </div>

                  <div className="col-6 col-md-5 d-flex align-items-center gap-2">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={!!(data.working_hours[day] && data.working_hours[day].m_start)}
                        onChange={(e) => {
                          if (!e.target.checked) {
                            handleHourChange(day, "m_start", "");
                            handleHourChange(day, "m_end", "");
                          } else {
                            handleHourChange(day, "m_start", "09:00");
                            handleHourChange(day, "m_end", "14:00");
                          }
                        }}
                      />
                    </div>
                    <small className="text-muted">Mañana:</small>
                    <input type="time" className="form-control form-control-sm"
                      value={(data.working_hours[day] && data.working_hours[day].m_start) || ""}
                      disabled={!(data.working_hours[day] && data.working_hours[day].m_start)}
                      onChange={(e) => handleHourChange(day, "m_start", e.target.value)} />
                    <input type="time" className="form-control form-control-sm"
                      value={(data.working_hours[day] && data.working_hours[day].m_end) || ""}
                      disabled={!(data.working_hours[day] && data.working_hours[day].m_start)}
                      onChange={(e) => handleHourChange(day, "m_end", e.target.value)} />
                  </div>

                  <div className="col-6 col-md-5 d-flex align-items-center gap-2">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={!!(data.working_hours[day] && data.working_hours[day].a_start)}
                        onChange={(e) => {
                          if (!e.target.checked) {
                            handleHourChange(day, "a_start", "");
                            handleHourChange(day, "a_end", "");
                          } else {
                            handleHourChange(day, "a_start", "16:00");
                            handleHourChange(day, "a_end", "20:00");
                          }
                        }}
                      />
                    </div>
                    <small className="text-muted">Tarde:</small>
                    <input type="time" className="form-control form-control-sm"
                      value={(data.working_hours[day] && data.working_hours[day].a_start) || ""}
                      disabled={!(data.working_hours[day] && data.working_hours[day].a_start)}
                      onChange={(e) => handleHourChange(day, "a_start", e.target.value)} />
                    <input type="time" className="form-control form-control-sm"
                      value={(data.working_hours[day] && data.working_hours[day].a_end) || ""}
                      disabled={!(data.working_hours[day] && data.working_hours[day].a_start)}
                      onChange={(e) => handleHourChange(day, "a_end", e.target.value)} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="col-12">
            <label className="form-label fw-bold">Descripción</label>
            <textarea className="form-control" name="barbershop_description" rows="3" value={data.barbershop_description} onChange={handleChange} />
          </div>

          <div className="col-12 text-center mb-3 mt-3">
            <label className="form-label d-block fw-bold text-start">Imagen de la Barbería</label>
            {data.barbershop_image && (
              <img src={data.barbershop_image} alt="Preview" className="img-thumbnail mb-2" style={{ maxHeight: "180px" }} />
            )}
            <input type="file" className="form-control" onChange={handleFileChange} accept="image/*" disabled={uploading} />
            {uploading && <small className="text-primary fw-bold">Subiendo imagen...</small>}
          </div>
        </div>

        <div className="mt-4 d-flex justify-content-around">
          <button type="button" onClick={() => navigate(-1)} className="btn btn-outline-secondary px-4">Cancelar</button>
          <button type="submit" className="btn btn-primary px-5" disabled={uploading}>
            {uploading ? "Subiendo..." : (data.id ? "Actualizar Barbería" : "Crear Barbería")}
          </button>
        </div>
      </form>
    </div>
  );
};