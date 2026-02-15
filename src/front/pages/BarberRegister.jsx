import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { uploadToCloudinary } from "../utilities/cloudinary";

export const BarberRegister = () => {
    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();

    const isEditing = !!store.token;
    const [uploading, setUploading] = useState(false);


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
                        headers: {
                            "Authorization": `Bearer ${store.token}`
                        }
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
                dispatch({
                    type: "set-message",
                    payload: data.message || { type: "error", msg: "Error en la operación" }
                });
                return;
            }

            if (isEditing) {
                dispatch({ type: "set-userInfo", payload: data.user || { ...store.userInfo, ...form } });
                dispatch({
                    type: "set-message",
                    payload: { type: "success", msg: "Perfil de barbero actualizado" }
                });
                navigate("/private/barber");
            } else {
                dispatch({
                    type: "set-message",
                    payload: { type: "success", msg: "Cuenta de barbero creada" }
                });
                navigate("/login/barber");
            }

        } catch (err) {
            dispatch({
                type: "set-message",
                payload: { type: "error", msg: "Fallo de conexión con el servidor" }
            });
        }
    };

    return (
        <div className="container mt-5">
            <h1 className="display-6 mb-4">
                {isEditing ? "Editar mi perfil profesional" : "Crear cuenta como barbero"}
            </h1>

            <form onSubmit={handleSubmit}>
                <label className="form-label d-block text-start">Foto de Perfil</label>
                <div className="d-flex flex-column align-items-center">
                    {form.barber_profile_image ? (
                        <img
                            src={form.barber_profile_image}
                            className="rounded-circle mb-3 shadow"
                            style={{ width: "150px", height: "150px", objectFit: "cover" }}
                        />
                    ) : (
                        <div
                            className="rounded-circle mb-3 bg-light d-flex align-items-center justify-content-center border"
                            style={{ width: "150px", height: "150px" }}
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
                <label>Nombre</label>
                <input className="form-control mb-2" name="name" value={form.name} placeholder="Nombre" onChange={handleChange} />

                <label>Email</label>
                <input className="form-control mb-2" name="email" value={form.email} placeholder="Email" onChange={handleChange} />

                <label>Teléfono</label>
                <input className="form-control mb-2" name="phone" value={form.phone} placeholder="Teléfono" onChange={handleChange} />

                <hr />
                <label>{isEditing ? "Nueva contraseña (opcional)" : "Contraseña"}</label>
                <input className="form-control mb-2" type="password" name="password" minLength="8" placeholder="********" onChange={handleChange} />

                <label>Confirmar contraseña</label>
                <input className="form-control mb-2" type="password" name="confirmPassword" minLength="8" placeholder="********" onChange={handleChange} />

                <button className="btn btn-outline-primary mt-3">
                    {isEditing ? "Guardar cambios" : "Crear cuenta"}
                </button>
            </form>
        </div>
    );
};