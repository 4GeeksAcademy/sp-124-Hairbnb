import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { uploadToCloudinary } from "../utilities/cloudinary";
import "../styles/authforms.css";
import logo from "../../../public/Logo.png"
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
            dispatch({ 
                type: "set-message", 
                payload: { type: "error", msg: "Email y contraseña son obligatorios" } 
            });
            return;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(form.email)) {
            dispatch({ 
                type: "set-message", 
                payload: { type: "error", msg: "Por favor, ingresa un email válido" } 
            });
            return;
        }
        
        if (form.password.length < 8) {
            dispatch({ 
                type: "set-message", 
                payload: { type: "error", msg: "La contraseña debe tener al menos 8 caracteres" } 
            });
            return;
        }
        
        if (form.password !== form.confirmPassword) {
            dispatch({ 
                type: "set-message", 
                payload: { type: "error", msg: "Las contraseñas no coinciden" } 
            });
            return;
        }
        
        setStep(2);
    };
    const handleSubmit = async e => {
        e.preventDefault();
        if (!isEditing && step === 2) {
            if (!form.name || !form.last_name) {
                dispatch({ 
                    type: "set-message", 
                    payload: { type: "error", msg: "Nombre y apellido son obligatorios" } 
                });
                return;
            }
        }
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
                dispatch({ 
                    type: "set-message", 
                    payload: { type: "error", msg: data.msg || "Algo ha fallado" } 
                });
                return;
            }
            if (isEditing) {
                dispatch({ 
                    type: "set-userInfo", 
                    payload: data.user || { ...store.userInfo, ...form } 
                });
                dispatch({ 
                    type: "set-message", 
                    payload: { type: "success", msg: "Perfil actualizado correctamente" } 
                });
                navigate("/private/client");
            } else {
                dispatch({ 
                    type: "set-message", 
                    payload: { type: "success", msg: "¡Cuenta creada! Ya puedes iniciar sesión" } 
                });
                navigate("/login/client");
            }
        } catch (err) {
            dispatch({ 
                type: "set-message", 
                payload: { type: "error", msg: "Error de conexión" } 
            });
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
        <div className="auth-page-container">
            <div className="auth-card">
                <div className="text-center mb-4">
                    <img
                        src="/Logo.png"
                        alt="Logo Hairbnb"
                        className="auth-logo"  
                    />
                </div>
                <div className="text-center">
                    <h1 className="auth-title">
                        {isEditing ? "Mis datos" : "Crear cuenta"}
                    </h1>
                    <p className="auth-subtitle">
                        {isEditing ? "Actualiza tu información de perfil" : "Únete a la red de servicios premium"}
                    </p>
                </div>
                {!isEditing && (
                    <div className="auth-progress-container">
                        <div className="auth-progress-bar" style={{ width: step === 1 ? "50%" : "100%" }}></div>
                    </div>
                )}
                <form onSubmit={(!isEditing && step === 1) ? nextStep : handleSubmit}>
                    {(step === 1 || isEditing) && (
                        <div className="animate__animated animate__fadeIn">
                            <label className="auth-label">Correo electrónico</label>
                            <input 
                                className="auth-input w-100 mb-3" 
                                name="email" 
                                value={form.email} 
                                type="email" 
                                placeholder="ejemplo@correo.com" 
                                onChange={handleChange} 
                                required 
                            />
                            <label className="auth-label">
                                {isEditing ? "Nueva contraseña (opcional)" : "Contraseña"}
                            </label>
                            <input 
                                className="auth-input w-100 mb-1" 
                                type="password" 
                                name="password" 
                                value={form.password}
                                placeholder="Mínimo 8 caracteres" 
                                onChange={handleChange} 
                                required={!isEditing} 
                            />
                            {!isEditing && form.password && form.password.length < 8 && (
                                <small className="field-warning warning">
                                    La contraseña debe tener al menos 8 caracteres
                                </small>
                            )}
                            <label className="auth-label">Confirmar contraseña</label>
                            <input 
                                className="auth-input w-100 mb-1" 
                                type="password" 
                                name="confirmPassword" 
                                value={form.confirmPassword}
                                placeholder="Repite la contraseña" 
                                onChange={handleChange} 
                                required={!isEditing} 
                            />
                            {!isEditing && form.confirmPassword && form.password !== form.confirmPassword && (
                                <small className="field-warning error">
                                    Las contraseñas no coinciden
                                </small>
                            )}
                            {!isEditing && (
                                <button type="submit" className="btn-auth-main mt-3">
                                    Siguiente paso <i className="fa-solid fa-arrow-right ms-2"></i>
                                </button>
                            )}
                        </div>
                    )}
                    {(step === 2 || isEditing) && (
                        <div className="animate__animated animate__fadeIn">
                            <div className="auth-profile-img-container">
                                {form.client_profile_image ? (
                                    <img src={form.client_profile_image} className="auth-profile-img" alt="Perfil" />
                                ) : (
                                    <div className="auth-profile-placeholder">
                                        <i className="fa-solid fa-camera fa-2x"></i>
                                    </div>
                                )}
                            </div>
                            <input 
                                type="file" 
                                className="form-control form-control-sm mx-auto" 
                                style={{ maxWidth: "250px" }} 
                                onChange={handleFileChange} 
                                accept="image/*" 
                                disabled={uploading} 
                            />
                            {uploading && <small className="text-dark d-block mt-2">Subiendo imagen...</small>}
                            <div className="row mt-3">
                                <div className="col-md-6 mb-3">
                                    <label className="auth-label">Nombre</label>
                                    <input 
                                        className="auth-input w-100" 
                                        name="name" 
                                        value={form.name} 
                                        onChange={handleChange} 
                                        required 
                                    />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="auth-label">Apellido</label>
                                    <input 
                                        className="auth-input w-100" 
                                        name="last_name" 
                                        value={form.last_name} 
                                        onChange={handleChange} 
                                        required 
                                    />
                                </div>
                            </div>
                            <label className="auth-label">Teléfono</label>
                            <input 
                                className="auth-input w-100 mb-3" 
                                name="phone" 
                                value={form.phone} 
                                placeholder="600 000 000" 
                                onChange={handleChange} 
                            />
                            <label className="auth-label">Notas</label>
                            <textarea 
                                className="auth-input w-100 mb-4" 
                                name="notes" 
                                rows="2" 
                                value={form.notes} 
                                onChange={handleChange} 
                            />
                            <div className="d-flex gap-2">
                                {!isEditing && (
                                    <button 
                                        type="button" 
                                        className="btn-auth-secondary" 
                                        onClick={() => setStep(1)}
                                    >
                                        Atrás
                                    </button>
                                )}
                                <button type="submit" className="btn-auth-main">
                                    {isEditing ? "ACTUALIZAR" : "CREAR CUENTA"}
                                </button>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};