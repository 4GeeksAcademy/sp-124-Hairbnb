import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { uploadToCloudinary } from "../utilities/cloudinary";

export const BarberServiceForm = () => {
    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();

    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        price: "",
        duration: "",
        service_demo_image: ""
    });

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const imageUrl = await uploadToCloudinary(file);
        if (imageUrl) {
            setFormData(prev => ({ ...prev, service_demo_image: imageUrl }));
        }
        setUploading(false);
    };

    useEffect(() => {
        if (store.barber_serviceInfo) {
            setFormData({
                name: store.barber_serviceInfo.name || "",
                price: store.barber_serviceInfo.price || "",
                duration: store.barber_serviceInfo.duration || "",
                service_demo_image: store.barber_serviceInfo.service_demo_image || ""
            });
        }
    }, [store.barber_serviceInfo]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const token = store.token || localStorage.getItem("token");

        if (!token) {
            dispatch({ type: "set-message", payload: { type: "error", msg: "Tu sesión ha caducado. Por favor, vuelve a iniciar sesión." } });
            navigate("/login");
            return;
        }

        const isEditing = !!store.barber_serviceInfo;
        const url = isEditing
            ? `${import.meta.env.VITE_BACKEND_URL}/barber_services/${store.barber_serviceInfo.id}`
            : `${import.meta.env.VITE_BACKEND_URL}/barber_services`;

        try {
            const response = await fetch(url, {
                method: isEditing ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                dispatch({ type: "set-barber_serviceInfo", payload: null });
                dispatch({ type: "set-message", payload: { type: "success", msg: `Servicio ${isEditing ? "actualizado" : "creado"} correctamente` } });
                navigate(-1);
            } else {
                const errData = await response.json();
                dispatch({ type: "set-message", payload: { type: "error", msg: errData.message?.msg || "Error al guardar el servicio" } });
            }
            // ...
        } catch (error) {
            console.error("Error en la petición:", error);
            dispatch({ type: "set-message", payload: { type: "error", msg: "Error de conexión" } });
        }
    };

    if (store.role !== "barber") {
        return (
            <div className="container py-5 text-center">
                <h2 className="Oswald fw-bold text-dark">ACCESO DENEGADO</h2>
                <p>Inicia sesión como barbero para acceder.</p>
                <button className="btn pb-btn-filled Oswald mt-3" onClick={() => navigate("/login/barber")}>INICIAR SESIÓN</button>
            </div>
        );
    }


    return (
        <div className="container py-5" style={{ maxWidth: "600px" }}>
            <div className="booking-card shadow-sm animate__animated animate__fadeIn">

                <div className="booking-header">
                    <h2 className="Oswald mb-0 text-uppercase fw-bold">
                        {store.barber_serviceInfo ? "Editar servicio" : "Nuevo servicio"}
                    </h2>
                </div>

                <div className="p-4 p-md-5">
                    <form onSubmit={handleSubmit}>

                        <div className="form-group-custom mb-4 text-center">
                            <label>Foto del Servicio</label>
                            <div className="calendar-container p-3 mb-3">
                                {formData.service_demo_image ? (
                                    <img
                                        src={formData.service_demo_image}
                                        alt="Preview"
                                        className="img-fluid mb-3"
                                        style={{ maxHeight: "200px", borderRadius: "15px" }}
                                    />
                                ) : (
                                    <div className="text-muted Oswald small py-4">
                                        <i className="fa-solid fa-camera fa-2x d-block mb-2"></i>
                                        SIN IMAGEN SELECCIONADA
                                    </div>
                                )}

                                <input
                                    type="file"
                                    className="select-custom"
                                    onChange={handleFileChange}
                                    accept="image/*"
                                    disabled={uploading}
                                />

                                {uploading && (
                                    <div className="mt-2 d-flex align-items-center justify-content-center">
                                        <div className="spinner-gold me-2" style={{ width: '20px', height: '20px' }}></div>
                                        <small className="Oswald text-gold fw-bold">SUBIENDO...</small>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="form-group-custom">
                            <label>Nombre del servicio</label>
                            <input
                                type="text"
                                className="select-custom"
                                placeholder="Ej: Corte degradado"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>

                        <div className="row">
                            <div className="col-md-6">
                                <div className="form-group-custom">
                                    <label>Precio (€)</label>
                                    <input
                                        type="number"
                                        className="select-custom"
                                        placeholder="0"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-group-custom">
                                    <label>Duración (min)</label>
                                    <input
                                        type="number"
                                        className="select-custom"
                                        placeholder="30"
                                        value={formData.duration}
                                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="d-flex justify-content-between align-items-center mt-4">
                            <button
                                type="button"
                                className="btn btn-link text-muted text-decoration-none Oswald small fw-bold"
                                onClick={() => {
                                    dispatch({ type: "set-barber_serviceInfo", payload: null });
                                    navigate(-1);
                                }}
                            >
                                VOLVER
                            </button>

                            <button type="submit" className="btn-confirm" disabled={uploading}>
                                {store.barber_serviceInfo ? "ACTUALIZAR" : "CREAR"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}