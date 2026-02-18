import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { uploadToCloudinary } from "../utilities/cloudinary";

export const BarberRegister = () => {
    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();

    const isEditing = !!store.token;
    const [uploading, setUploading] = useState(false);
    const [step, setStep] = useState(1);

    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        barber_profile_image: ""
    });

    useEffect(() => {
        const loadBarberData = async () => {
            if (isEditing && store.userInfo?.id) {
                try {
                    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/barbers/${store.userInfo.id}`, {
                        method: "GET",
                        headers: { "Authorization": `Bearer ${store.token}` }
                    });
                    if (response.ok) {
                        const data = await response.json();
                        setForm({
                            name: data.name || "",
                            email: data.email || "",
                            phone: data.phone || "",
                            password: "",
                            confirmPassword: "",
                            barber_profile_image: data.barber_profile_image || ""
                        });
                    }
                } catch (error) {
                    console.error("Error cargando datos del barbero:", error);
                }
            }
        };
        loadBarberData();
    }, [isEditing, store.token, store.userInfo?.id]);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        const imageUrl = await uploadToCloudinary(file);
        if (imageUrl) {
            setForm(prev => ({ ...prev, barber_profile_image: imageUrl }));
        }
        setUploading(false);
    };

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const nextStep = (e) => {
        e.preventDefault();
        if (!form.email || !form.password || !form.confirmPassword) {
            dispatch({ type: "set-message", payload: { type: "error", msg: "Completa los datos de acceso" } });
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
            ? `${import.meta.env.VITE_BACKEND_URL}/barbers/${store.userInfo.id}`
            : `${import.meta.env.VITE_BACKEND_URL}/barbers`;

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                    ...(isEditing && { "Authorization": `Bearer ${store.token}` })
                },
                body: JSON.stringify({
                    name: form.name,
                    email: form.email,
                    phone: form.phone,
                    barber_profile_image: form.barber_profile_image,
                    ...(form.password && { password: form.password })
                })
            });

            const data = await response.json();

            if (!response.ok) {
                dispatch({ type: "set-message", payload: { type: "error", msg: data.msg || "Error en la operación" } });
                return;
            }

            if (isEditing) {
                dispatch({ type: "set-userInfo", payload: data.user || { ...store.userInfo, ...form } });
                dispatch({ type: "set-message", payload: { type: "success", msg: "Perfil actualizado" } });
                navigate("/private/barber");
            } else {
                dispatch({ type: "set-message", payload: { type: "success", msg: "¡Cuenta creada con éxito!" } });
                navigate("/login/barber");
            }

        } catch (err) {
            dispatch({ type: "set-message", payload: { type: "error", msg: "Fallo de conexión" } });
        }
    };

    return (
        <div className="container mt-5 d-flex justify-content-center">
            <div className="card w-75">
                <h1 className="h3 mb-4 text-center">
                    {isEditing ? "Mis datos personales" : "Crear cuenta de barbero"}
                </h1>

                {!isEditing && (
                    <div className="progress mb-4">
                        <div className="progress-bar bg-danger" style={{ width: step === 1 ? "50%" : "100%" }}></div>
                    </div>
                )}

                <form onSubmit={(!isEditing && step === 1) ? nextStep : handleSubmit}>

                    {(step === 1 || isEditing) && (
                        <div>
                            <h5 className="mb-3">{isEditing ? "Datos de la cuenta" : "Información de inicio de sesión"}</h5>
                            <label className="form-label">Email</label>
                            <input className="form-control mb-3" name="email" value={form.email} type="email" placeholder="nombre@ejemplo.com" onChange={handleChange} required />

                            <label className="form-label">{isEditing ? "Nueva contraseña (opcional)" : "Establece una contraseña"}</label>
                            <input className="form-control mb-3" type="password" name="password" minLength="8" placeholder="Mínimo 8 caracteres" onChange={handleChange} required={!isEditing} />

                            <label className="form-label">Confirmar contraseña</label>
                            <input className="form-control mb-3" type="password" name="confirmPassword" minLength="8" placeholder="Repite la contraseña" onChange={handleChange} required={!isEditing} />

                            {!isEditing && (
                                <button type="submit" className="btn btn-danger py-2">
                                    Siguiente: Datos de perfil
                                    <i className="fa-solid fa-arrow-right ms-2"></i>
                                </button>
                            )}
                        </div>
                    )}

                    {(step === 2 || isEditing) && (
                        <div>
                            <h5 className="mb-3">
                                {isEditing ? "Información profesional" : "Paso 2: Tu perfil"}
                            </h5>

                            <div className="text-center mb-4">
                                <label className="form-label d-block text-start">Foto de Perfil</label>
                                {form.barber_profile_image ? (
                                    <img src={form.barber_profile_image} className="rounded-circle mb-3 border border-3 border-danger" style={{ width: "120px", height: "120px", objectFit: "cover" }} />
                                ) : (
                                    <div className="rounded-circle mb-3 bg-light d-flex align-items-center justify-content-center border mx-auto" style={{ width: "120px", height: "120px" }}>
                                        <i className="fa-solid fa-user-tie fa-3x text-danger"></i>
                                    </div>
                                )}
                                <input type="file" className="form-control form-control-sm" onChange={handleFileChange} accept="image/*" disabled={uploading} />
                                {uploading && <small className="text-danger d-block mt-2">Subiendo imagen...</small>}
                            </div>

                            <label className="form-label">Nombre</label>
                            <input className="form-control mb-3" name="name" value={form.name} placeholder="Tu nombre" onChange={handleChange} required />

                            <label className="form-label">Teléfono</label>
                            <div className="border rounded mb-4 bg-white px-2 py-1">
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
                                
                                />
                            </div>

                            <div className="d-flex gap-2">
                                {!isEditing && (
                                    <button type="button" className="btn btn-outline-danger" onClick={() => setStep(1)}>Atrás</button>
                                )}
                                <button type="submit" className="btn btn-danger">
                                    {isEditing ? "Guardar cambios" : "Finalizar Registro"}
                                </button>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};