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
    <div className="container py-5" style={{ maxWidth: '950px' }}>
      <APILoader apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY} />

      <div className="booking-card shadow-lg">
        <div className="booking-header">
          <h2 className="Oswald mb-0 text-uppercase fw-bold">
            {data.id ? "Editar mi barbería" : "Crear mi barbería"}
          </h2>
          <div className="mt-2" style={{ width: '40px', height: '2px', background: '#d19f68', margin: '0 auto' }}></div>
        </div>

        <form className="p-4 p-md-5" onSubmit={handleSubmit}>
          <div className="row g-4">
            <div className="col-md-6 form-group-custom">
              <label>Nombre del local</label>
              <input className="select-custom" name="name" type="text" value={data.name} onChange={handleChange} placeholder="Nombre de la barbería" required />
            </div>

            <div className="col-md-6 form-group-custom">
              <label>Teléfono</label>
              <input className="select-custom" type="text" name="phone" value={data.phone} maxLength="9" placeholder="600123456"
                onChange={(e) => setData({ ...data, phone: e.target.value.replace(/\D/g, "") })} required />
            </div>

            <div className="col-12 form-group-custom">
              <label>Ubicación exacta (Google Maps)</label>
              <div className="google-picker-container">
                <PlacePicker placeholder={data.address || "Busca tu calle..."} onPlaceChange={handlePlaceChange} />
              </div>
            </div>

            <div className="col-md-4">
              <label className="Oswald text-uppercase small fw-bold mb-2 d-block">Imagen</label>
              <div className="image-upload-wrapper border rounded p-2 text-center bg-light">
                {data.barbershop_image ? (
                  <img src={data.barbershop_image} alt="Preview" className="img-fluid rounded mb-2 shadow-sm" style={{ maxHeight: "150px", objectFit: 'cover' }} />
                ) : (
                  <div className="py-4 text-muted"><i className="fas fa-image fa-2x"></i></div>
                )}
                <input type="file" className="form-control form-control-sm" onChange={handleFileChange} accept="image/*" disabled={uploading} />
                {uploading && <div className="spinner-border spinner-border-sm text-gold mt-2" role="status"></div>}
              </div>
            </div>

            <div className="col-md-8 form-group-custom">
              <label>Descripción / Historia</label>
              <textarea className="select-custom" name="barbershop_description" rows="5" value={data.barbershop_description}
                onChange={handleChange} placeholder="Cuéntale a tus clientes qué hace especial a tu barbería..." />
            </div>

            <div className="col-12 mt-4">
              <h5 className="Oswald text-uppercase fw-bold border-bottom pb-2 mb-4">
                <i className="fa-regular fa-clock me-2 text-gold"></i> Gestión de horario
              </h5>

              <div className="schedule-grid">
                {["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"].map(day => (
                  <div key={day} className="day-row-premium d-flex flex-wrap align-items-center p-3 mb-2 rounded shadow-sm bg-white border">
                    <div className="day-name Oswald fw-bold text-uppercase" style={{ width: '120px' }}>{day}</div>

                    <div className="d-flex align-items-center gap-2 me-4 flex-grow-1">
                      <div className="form-check form-switch me-2">
                        <input className="form-check-input custom-switch" type="checkbox"
                          checked={!!(data.working_hours[day]?.m_start)}
                          onChange={(e) => {
                            handleHourChange(day, "m_start", e.target.checked ? "09:00" : "");
                            handleHourChange(day, "m_end", e.target.checked ? "14:00" : "");
                          }} />
                      </div>
                      <span className="small text-muted Oswald">MAÑANA:</span>
                      <input type="time" className="time-input-minimal" value={data.working_hours[day]?.m_start || ""}
                        disabled={!data.working_hours[day]?.m_start} onChange={(e) => handleHourChange(day, "m_start", e.target.value)} />
                      <span className="text-muted">-</span>
                      <input type="time" className="time-input-minimal" value={data.working_hours[day]?.m_end || ""}
                        disabled={!data.working_hours[day]?.m_start} onChange={(e) => handleHourChange(day, "m_end", e.target.value)} />
                    </div>

                    <div className="d-flex align-items-center gap-2 flex-grow-1">
                      <div className="form-check form-switch me-2">
                        <input className="form-check-input custom-switch" type="checkbox"
                          checked={!!(data.working_hours[day]?.a_start)}
                          onChange={(e) => {
                            handleHourChange(day, "a_start", e.target.checked ? "16:00" : "");
                            handleHourChange(day, "a_end", e.target.checked ? "20:00" : "");
                          }} />
                      </div>
                      <span className="small text-muted Oswald">TARDE:</span>
                      <input type="time" className="time-input-minimal" value={data.working_hours[day]?.a_start || ""}
                        disabled={!data.working_hours[day]?.a_start} onChange={(e) => handleHourChange(day, "a_start", e.target.value)} />
                      <span className="text-muted">-</span>
                      <input type="time" className="time-input-minimal" value={data.working_hours[day]?.a_end || ""}
                        disabled={!data.working_hours[day]?.a_start} onChange={(e) => handleHourChange(day, "a_end", e.target.value)} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-between mt-5 pt-4 border-top">
            <button type="button" className="btn btn-link text-muted text-decoration-none Oswald" onClick={() => navigate(-1)}>CANCELAR</button>
            <button type="submit" className="btn-confirm px-5 shadow" disabled={uploading}>
              {uploading ? "PROCESANDO..." : (data.id ? "ACTUALIZAR" : "CREAR")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};