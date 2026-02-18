import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { uploadToCloudinary } from "../utilities/cloudinary";
import 'react-phone-number-input/style.css';
import PhoneInput from 'react-phone-number-input';

export const OwnerRegister = () => {
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
        owner_profile_image: ""
    });

    useEffect(() => {
        const loadOwnerData = async () => {
            if (isEditing && store.userInfo?.id) {
                try {
                    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/owners/${store.userInfo.id}`, {
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
                            owner_profile_image: data.owner_profile_image || "",
                        });
                    }
                } catch (error) {
                    console.error("Error cargando datos del dueño:", error);
                }
            }
        };
        loadOwnerData();
    }, [isEditing, store.token, store.userInfo?.id]);

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const nextStep = (e) => {
        e.preventDefault();
        if (!form.email || (!isEditing && !form.password)) {
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
            ? `${import.meta.env.VITE_BACKEND_URL}/owners/${store.userInfo.id}`
            : `${import.meta.env.VITE_BACKEND_URL}/owners`;

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
                    owner_profile_image: form.owner_profile_image,
                    ...(form.password && { password: form.password })
                })
            });

            const data = await response.json();

            if (response.ok) {
                if (isEditing) {
                    dispatch({ type: "set-userInfo", payload: data.user || { ...store.userInfo, ...form } });
                    dispatch({ type: "set-message", payload: { type: "success", msg: "Perfil de administrador actualizado" } });
                    navigate("/private/owner");
                } else {
                    dispatch({ type: "set-message", payload: { type: "success", msg: "Cuenta de administrador creada" } });
                    navigate("/login/owner");
                }
            } else {
                dispatch({ type: "set-message", payload: { type: "error", msg: data.message || "Error al procesar los datos" } });
            }
        } catch (err) {
            dispatch({ type: "set-message", payload: { type: "error", msg: "Fallo de conexión" } });
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        const imageUrl = await uploadToCloudinary(file);
        if (imageUrl) {
            setForm(prev => ({ ...prev, owner_profile_image: imageUrl }));
        }
        setUploading(false);
    };

    return (
        <div className="container mt-5 d-flex justify-content-center">
            <div className="card w-75">
                <h1 className="h3 mb-4 text-center">
                    {isEditing ? "Mis datos personales" : "Crear cuenta de propietario"}
                </h1>

                {!isEditing && (
                    <div className="progress mb-4">
                        <div className="progress-bar bg-secondary" style={{ width: step === 1 ? "50%" : "100%" }}></div>
                    </div>
                )}

                <form onSubmit={(!isEditing && step === 1) ? nextStep : handleSubmit}>
                    
                    {(step === 1 || isEditing) && (
                        <div>
                            <h5 className="mb-3 text-secondary">{isEditing ? "Datos de la cuenta" : "Información de inicio de sesión"}</h5>
                            
                            <label className="form-label">Email Corporativo</label>
                            <input className="form-control mb-3" name="email" value={form.email} type="email" placeholder="nombre@ejemplo.com" onChange={handleChange} required />

                            <label className="form-label">{isEditing ? "Nueva contraseña (opcional)" : "Establece una contraseña"}</label>
                            <input className="form-control mb-3" type="password" minLength="8" name="password" placeholder="Mínimo 8 caracteres" onChange={handleChange} required={!isEditing} />

                            <label className="form-label">Confirmar contraseña</label>
                            <input className="form-control mb-3" type="password" minLength="8" name="confirmPassword" placeholder="Repite la contraseña" onChange={handleChange} required={!isEditing} />
                            
                            {!isEditing && (
                                <button type="submit" className="btn btn-dark py-2">
                                    Siguiente: Datos de perfil
                                    <i className="fa-solid fa-arrow-right ms-2"></i>
                                </button>
                            )}
                        </div>
                    )}

                    {(step === 2 || isEditing) && (
                        <div>
                            <h5 className="mb-3">{isEditing ? "Información profesional" : "2. Información del propietario"}</h5>
                            
                            <div className="mb-4 text-center">
                                {form.owner_profile_image ? (
                                    <img src={form.owner_profile_image} className="rounded mb-3" style={{ width: "140px", height: "140px", objectFit: "cover"}} />
                                ) : (
                                    <div className="rounded mb-3 d-flex align-items-center justify-content-center border border-secondary mx-auto" style={{ width: "140px", height: "140px"}}>
                                        <i className="fa-solid fa-building-user fa-3x text-secondary"></i>
                                    </div>
                                )}
                                <input type="file" className="form-control form-control-sm" onChange={handleFileChange} accept="image/*" disabled={uploading} />
                                {uploading && <small className="text-secondary d-block mt-2">Subiendo imagen...</small>}
                            </div>

                            <label className="form-label">Nombre</label>
                            <input className="form-control mb-3" name="name" value={form.name} placeholder="Nombre del administrador" onChange={handleChange} required />

                            <label className="form-label">Teléfono de contacto</label>
                            <div className="border rounded mb-4 bg-white px-2 py-1">
                                <PhoneInput
                                    international
                                    defaultCountry="ES"
                                    value={form.phone}
                                    onChange={(v) => setForm({ ...form, phone: v })}
                                    style={{ display: "flex", alignItems: "center" }}
                                />
                            </div>

                            <div className="d-flex gap-2">
                                {!isEditing && (
                                    <button type="button" className="btn btn-outline-secondary" onClick={() => setStep(1)}>Atrás</button>
                                )}
                                <button type="submit" className="btn btn-secondary">
                                    {isEditing ? "Actualizar Datos" : "Crear Cuenta de Dueño"}
                                </button>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};