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
        name: "", last_name: "", email: "", phone: "",
        password: "", confirmPassword: "", notes: "", client_profile_image: ""
    });

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

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

                <form onSubmit={(!isEditing && step === 1) ? (e) => { e.preventDefault(); setStep(2); } : (e) => e.preventDefault()}>

                    {(step === 1 || isEditing) && (
                        <div className="animate__animated animate__fadeIn">
                            <label className="auth-label">Correo electrónico</label>
                            <input className="auth-input w-100 mb-3" name="email" value={form.email} type="email" placeholder="ejemplo@correo.com" onChange={handleChange} required />

                            <label className="auth-label">{isEditing ? "Nueva contraseña (opcional)" : "Contraseña"}</label>
                            <input className="auth-input w-100 mb-3" type="password" name="password" placeholder="Mínimo 8 caracteres" onChange={handleChange} required={!isEditing} />

                            <label className="auth-label">Confirmar contraseña</label>
                            <input className="auth-input w-100 mb-4" type="password" name="confirmPassword" placeholder="Repite la contraseña" onChange={handleChange} required={!isEditing} />

                            {!isEditing && (
                                <button type="submit" className="btn-auth-main">
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
                            <input type="file" className="form-control form-control-sm mb-4" onChange={() => { }} accept="image/*" />

                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label className="auth-label">Nombre</label>
                                    <input className="auth-input w-100" name="name" value={form.name} onChange={handleChange} required />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="auth-label">Apellido</label>
                                    <input className="auth-input w-100" name="last_name" value={form.last_name} onChange={handleChange} required />
                                </div>
                            </div>

                            <label className="auth-label">Teléfono</label>
                            <input className="auth-input w-100 mb-3" name="phone" value={form.phone} placeholder="600 000 000" onChange={handleChange} />

                            <label className="auth-label">Notas</label>
                            <textarea className="auth-input w-100 mb-4" name="notes" rows="2" value={form.notes} onChange={handleChange} />

                            <div className="d-flex gap-2">
                                {!isEditing && (
                                    <button type="button" className="btn-auth-secondary" onClick={() => setStep(1)}>Atrás</button>
                                )}
                                <button type="submit" className="btn-auth-main">
                                    {isEditing ? "ACTUALIZAR" : "CREAR"}
                                </button>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};