import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { uploadToCloudinary } from "../utilities/cloudinary";

export const AdminEditOwner = () => {
    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = !!id;
    const [uploading, setUploading] = useState(false);

    const [form, setForm] = useState({
        name: "",
        last_name: "",
        email: "",
        phone: "",
        profile_image: "",
        password: "",
        confirmPassword: ""
    });

    useEffect(() => {
        const loadOwnerData = async () => {
            if (!isEditing) return;
            try {
                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/owners/${id}`, {
                    headers: { "Authorization": `Bearer ${store.token}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    setForm({
                        name: data.name || "",
                        last_name: data.last_name || "",
                        email: data.email || "",
                        phone: data.phone || "",
                        profile_image: data.profile_image || "",
                        password: "",
                        confirmPassword: ""
                    });
                }
            } catch (error) {
                console.error("Error cargando dueño:", error);
            }
        };
        loadOwnerData();
    }, [id, isEditing, store.token, dispatch]);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        const imageUrl = await uploadToCloudinary(file);
        if (imageUrl) {
            setForm(prev => ({ ...prev, profile_image: imageUrl }));
        }
        setUploading(false);
    };

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async e => {
        e.preventDefault();

        if (!isEditing && !form.password) {
            dispatch({ type: "set-message", payload: { type: "error", msg: "Contraseña obligatoria" } });
            return;
        }

        if (form.password !== form.confirmPassword) {
            dispatch({ type: "set-message", payload: { type: "error", msg: "Las contraseñas no coinciden" } });
            return;
        }

        const method = isEditing ? "PUT" : "POST";
        const url = isEditing
            ? `${import.meta.env.VITE_BACKEND_URL}/owners/${id}`
            : `${import.meta.env.VITE_BACKEND_URL}/owners`;

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${store.token}`
                },
                body: JSON.stringify({
                    ...form,
                    role: "owner"
                })
            });

            if (response.ok) {
                dispatch({ type: "set-message", payload: { type: "success", msg: isEditing ? "Dueño actualizado" : "Dueño creado" } });
                navigate("/4dm1n1str4t10n");
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="container py-5" style={{ maxWidth: '850px' }}>
            <div className="booking-card shadow-lg">
                <div className="booking-header text-center">
                    <h2 className="Oswald mb-0 text-uppercase fw-bold">
                        {isEditing ? "Editar dueño" : "Nuevo dueño"}
                    </h2>
                    <div className="mt-2 mx-auto" style={{ width: '40px', height: '2px', background: '#d19f68' }}></div>
                </div>

                <form className="p-4 p-md-5" onSubmit={handleSubmit}>
                    <div className="row g-4">
                        <div className="col-md-4 text-center border-end">
                            <label className="Oswald text-uppercase small fw-bold mb-3 d-block text-gold">Imagen de perfil</label>
                            <div className="position-relative d-inline-block mb-3">
                                <div
                                    className="rounded-circle shadow d-flex align-items-center justify-content-center bg-light"
                                    style={{
                                        width: '150px', height: '150px',
                                        border: '3px solid #d19f68', overflow: 'hidden'
                                    }}
                                >
                                    {form.profile_image ? (
                                        <img src={form.profile_image} alt="Owner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <i className="fa-solid fa-camera fa-3x text-secondary"></i>
                                    )}
                                </div>
                                {uploading && (
                                    <div className="position-absolute top-50 start-50 translate-middle bg-dark bg-opacity-50 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '150px', height: '150px' }}>
                                        <div className="spinner-border text-gold spinner-border-sm"></div>
                                    </div>
                                )}
                            </div>
                            <input type="file" className="form-control form-control-sm" onChange={handleFileChange} accept="image/*" disabled={uploading} />
                        </div>

                        <div className="col-md-8">
                            <div className="row g-3">
                                <div className="col-md-6 form-group-custom">
                                    <label>Nombre</label>
                                    <input className="select-custom" name="name" value={form.name} onChange={handleChange} required />
                                </div>
                                <div className="col-md-6 form-group-custom">
                                    <label>Apellidos</label>
                                    <input className="select-custom" name="last_name" value={form.last_name} onChange={handleChange} required />
                                </div>
                                <div className="col-12 form-group-custom">
                                    <label>Correo electrónico</label>
                                    <input className="select-custom" type="email" name="email" value={form.email} onChange={handleChange} required />
                                </div>
                                <div className="col-md-12 form-group-custom">
                                    <label>Teléfono</label>
                                    <input className="select-custom" type="text" name="phone" value={form.phone} maxLength="9"
                                        onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "") })} />
                                </div>
                            </div>
                        </div>

                        <hr className="my-4" />

                        <div className="col-md-6 form-group-custom">
                            <label className="text-gold Oswald small text-uppercase fw-bold">
                                {isEditing ? "Nueva contraseña" : "Contraseña"}
                            </label>
                            <input className="select-custom" type="password" name="password" placeholder="••••••••" onChange={handleChange} />
                        </div>
                        <div className="col-md-6 form-group-custom">
                            <label className="text-gold Oswald small text-uppercase fw-bold">Confirmar contraseña</label>
                            <input className="select-custom" type="password" name="confirmPassword" placeholder="••••••••" onChange={handleChange} />
                        </div>
                    </div>

                    <div className="d-flex justify-content-between mt-5 pt-4 border-top">
                        <button type="button" className="btn btn-link text-muted text-decoration-none Oswald" onClick={() => navigate(-1)}>
                            CANCELAR
                        </button>
                        <button type="submit" className="btn-confirm px-5 shadow" disabled={uploading}>
                            {uploading ? "PROCESANDO..." : isEditing ? "ACTUALIZAR" : "CREAR"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};