import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { uploadToCloudinary } from "../utilities/cloudinary";

export const ClientRegister = () => {
    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();

    const isEditing = !!store.token;
    const [uploading, setUploading] = useState(false);
    const [step, setStep] = useState(1);

    const [form, setForm] = useState({
        name: "",
        last_name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        notes: "",
        client_profile_image: ""
    });

    useEffect(() => {
        const loadClientData = async () => {
            if (isEditing && store.userInfo?.id) {
                try {
                    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/${store.userInfo.id}`, {
                        method: "GET",
                        headers: { "Authorization": `Bearer ${store.token}` }
                    });
                    if (response.ok) {
                        const data = await response.json();
                        setForm({
                            name: data.name || "",
                            last_name: data.last_name || "",
                            email: data.email || "",
                            phone: data.phone || "",
                            notes: data.notes || "",
                            client_profile_image: data.client_profile_image || "",
                            password: "",
                            confirmPassword: ""
                        });
                    }
                } catch (error) {
                    console.error("Error cargando datos del cliente:", error);
                }
            }
        };
        loadClientData();
    }, [isEditing, store.token, store.userInfo?.id]);

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const nextStep = (e) => {
        e.preventDefault();
        if (!form.email || !form.password) {
            dispatch({ type: "set-message", payload: { type: "error", msg: "Email y contraseña son obligatorios" } });
            return;
        }
        if (form.password !== form.confirmPassword) {
            dispatch({ type: "set-message", payload: { type: "error", msg: "Las contraseñas no coinciden" } });
            return;
        }
        setStep(2);
    };

    const handleSubmit = async e => {
        e.preventDefault();

        const method = isEditing ? "PUT" : "POST";
        const url = isEditing
            ? `${import.meta.env.VITE_BACKEND_URL}/users/${store.userInfo.id}`
            : `${import.meta.env.VITE_BACKEND_URL}/users`;

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                    ...(isEditing && { "Authorization": `Bearer ${store.token}` })
                },
                body: JSON.stringify({
                    name: form.name,
                    last_name: form.last_name,
                    email: form.email,
                    phone: form.phone,
                    notes: form.notes,
                    client_profile_image: form.client_profile_image,
                    ...(form.password && { password: form.password })
                })
            });

            const data = await response.json();

            if (!response.ok) {
                dispatch({ type: "set-message", payload: { type: "error", msg: data.msg || "Algo ha fallado" } });
                return;
            }

            if (isEditing) {
                dispatch({ type: "set-userInfo", payload: data.user || { ...store.userInfo, ...form } });
                dispatch({ type: "set-message", payload: { type: "success", msg: "Perfil actualizado correctamente" } });
                navigate("/private/client");
            } else {
                dispatch({ type: "set-message", payload: { type: "success", msg: "¡Cuenta creada! Ya puedes iniciar sesión" } });
                navigate("/login/client");
            }
        } catch (err) {
            dispatch({ type: "set-message", payload: { type: "error", msg: "Error de conexión" } });
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        const imageUrl = await uploadToCloudinary(file);
        if (imageUrl) {
            setForm(prev => ({ ...prev, client_profile_image: imageUrl }));
        }
        setUploading(false);
    };

    return (
        <div className="container mt-5 d-flex justify-content-center">
            <div className="card w-75">
                <h1 className="h3 mb-4 text-center">
                    {isEditing ? "Mis datos personales" : "Crear cuenta de cliente"}
                </h1>

                {!isEditing && (
                    <div className="progress mb-4">
                        <div className="progress-bar bg-primary" style={{ width: step === 1 ? "50%" : "100%" }}></div>
                    </div>
                )}

                <form onSubmit={(!isEditing && step === 1) ? nextStep : handleSubmit}>

                    {(step === 1 || isEditing) && (
                        <div>
                            <h5 className="mb-3">
                                {isEditing ? "Datos de la cuenta" : "Información de inicio de sesión"}
                            </h5>

                            <label className="form-label">Email</label>
                            <input className="form-control mb-3" name="email" value={form.email} type="email" placeholder="nombre@ejemplo.com" onChange={handleChange} required />

                            <label className="form-label">{isEditing ? "Nueva contraseña (opcional)" : "Establece una contraseña"}</label>
                            <input className="form-control mb-3" type="password" minLength="8" name="password" placeholder="Mínimo 8 caracteres" onChange={handleChange} required={!isEditing} />

                            <label className="form-label">Confirma tu contraseña</label>
                            <input className="form-control mb-3" type="password" minLength="8" name="confirmPassword" placeholder="Repite la contraseña" onChange={handleChange} required={!isEditing} />

                            {!isEditing && (
                                <button type="submit" className="btn btn-primary py-2">
                                    Siguiente: Datos de perfil
                                    <i className="fa-solid fa-chevron-right ms-2"></i>
                                </button>
                            )}
                        </div>
                    )}

                    {(step === 2 || isEditing) && (
                        <div>
                            <h5 className="mb-3">
                                {isEditing ? "Información personal" : "2. Completa tu perfil"}
                            </h5>

                            <div className="mb-4 text-center">
                                {form.client_profile_image ? (
                                    <img src={form.client_profile_image} className="rounded-circle mb-3 border border-3 border-primary" style={{ width: "120px", height: "120px", objectFit: "cover" }} />
                                ) : (
                                    <div className="rounded-circle mb-3 d-flex align-items-center justify-content-center border mx-auto" style={{ width: "120px", height: "120px" }}>
                                        <i className="fa-solid fa-camera fa-2x text-primary"></i>
                                    </div>
                                )}
                                <input type="file" className="form-control form-control-sm mx-auto" style={{ maxWidth: "250px" }} onChange={handleFileChange} accept="image/*" disabled={uploading} />
                                {uploading && <small className="text-danger d-block mt-2">Subiendo imagen...</small>}
                            </div>

                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Nombre</label>
                                    <input className="form-control" name="name" value={form.name} placeholder="Tu nombre" onChange={handleChange} required />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Apellido</label>
                                    <input className="form-control" name="last_name" value={form.last_name} placeholder="Tu apellido" onChange={handleChange} required />
                                </div>
                            </div>

                            <label className="form-label">Teléfono móvil</label>
                            <div className="border rounded mb-3 bg-white px-2 py-1">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Ej: 600123456"
                                    maxLength="9"
                                    value={form.phone}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, "");
                                        setForm({ ...form, phone: val });
                                    }}
                                    style={{ width: "100%" }}
                                />
                            </div>

                            <label className="form-label">Notas adicionales (opcional)</label>
                            <textarea className="form-control mb-4" name="notes" value={form.notes} rows="2" placeholder="Ej: Alergias" onChange={handleChange} />

                            <div className="d-flex gap-2">
                                {!isEditing && (
                                    <button type="button" className="btn btn-outline-secondary" onClick={() => setStep(1)}>Atrás</button>
                                )}
                                <button type="submit" className="btn btn-secondary">
                                    {isEditing ? "Actualizar perfil" : "Finalizar y Crear Cuenta"}
                                </button>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};