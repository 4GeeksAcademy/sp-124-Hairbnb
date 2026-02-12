import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { uploadToCloudinary } from "../utilities/cloudinary";

export const ClientRegister = () => {
    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();

    const isEditing = !!store.token;
    const [uploading, setUploading] = useState(false);

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
                    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/${store.userInfo.id}`, {
                        method: "GET",
                        headers: {
                            "Authorization": `Bearer ${store.token}`
                        }
                    });
                    if (res.ok) {
                        const data = await res.json();
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

    const handleChange = e =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async e => {
        e.preventDefault();

        if (form.password !== "" && form.password !== form.confirmPassword) {
            dispatch({
                type: "set-message",
                payload: { type: "error", msg: "Las contraseñas no coinciden" }
            });
            return;
        }

        const method = isEditing ? "PUT" : "POST";
        const url = isEditing
            ? `${import.meta.env.VITE_BACKEND_URL}/users/${store.userInfo.id}`
            : `${import.meta.env.VITE_BACKEND_URL}/users`;

        try {
            const res = await fetch(url, {
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

            const data = await res.json();

            if (!res.ok) {
                dispatch({
                    type: "set-message",
                    payload: data.message || { type: "error", msg: "Algo ha fallado" }
                });
                return;
            }

            if (isEditing) {
                dispatch({ type: "set-userInfo", payload: data.user || { ...store.userInfo, ...form } });
                dispatch({
                    type: "set-message",
                    payload: { type: "success", msg: "Perfil actualizado correctamente" }
                });
                navigate("/private/client");
            } else {
                dispatch({
                    type: "set-message",
                    payload: { type: "success", msg: "Cuenta de cliente creada" }
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
        <div className="container mt-5">
            <h1 className="display-6 mb-4">
                {isEditing ? "Mis datos personales" : "Crear cuenta como cliente"}
            </h1>

            <form onSubmit={handleSubmit}>
                <div className="mb-4 text-center">
                    <label className="form-label d-block text-start">Foto de Perfil</label>
                    <div className="d-flex flex-column align-items-center">
                        {form.client_profile_image ? (
                            <img
                                src={form.client_profile_image}
                                className="rounded-circle mb-3 shadow"
                                style={{ width: "150px", height: "150px", objectFit: "cover"}}
                            />
                        ) : (
                            <div
                                className="rounded-circle mb-3 bg-light d-flex align-items-center justify-content-center border"
                                style={{ width: "150px", height: "150px"}}
                            >
                                <i className="fa-solid fa-user fa-4x"></i>
                            </div>
                        )}

                        <input
                            type="file"
                            className="form-control form-control-sm"
                            style={{ maxWidth: "300px" }}
                            onChange={handleFileChange}
                            accept="image/*"
                            disabled={uploading}
                        />
                        {uploading && <small className="text-primary mt-2 fw-bold">Subiendo foto...</small>}
                    </div>
                </div>
                <label>Nombre</label>
                <input className="form-control mb-2" name="name" value={form.name} placeholder="Nombre" onChange={handleChange} />

                <label>Apellido</label>
                <input className="form-control mb-2" name="last_name" value={form.last_name} placeholder="Apellido" onChange={handleChange} />

                <label>Email</label>
                <input className="form-control mb-2" name="email" value={form.email} placeholder="Email" onChange={handleChange} />

                <label>Teléfono</label>
                <input className="form-control mb-2" name="phone" value={form.phone} placeholder="Teléfono" onChange={handleChange} />

                <hr />
                <label>{isEditing ? "Nueva contraseña (dejar vacío para no cambiar)" : "Contraseña"}</label>
                <input className="form-control mb-2" type="password" minLength="8" name="password" placeholder="********" onChange={handleChange} />

                <label>Confirmar contraseña</label>
                <input className="form-control mb-2" type="password" minLength="8" name="confirmPassword" placeholder="********" onChange={handleChange} />

                <label>Notas adicionales</label>
                <textarea className="form-control mb-2" name="notes" value={form.notes} placeholder="Notas (alergias, preferencias...)" onChange={handleChange} />

                <button className="btn btn-outline-primary mt-3">
                    {isEditing ? "Actualizar perfil" : "Crear cuenta"}
                </button>
            </form>
        </div>
    );
};