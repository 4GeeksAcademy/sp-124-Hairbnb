import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";


export const AdminEditBarber = () => {
    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();
    const { id } = useParams();

    const isEditing = !!id;

    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: ""
    });

    useEffect(() => {
        const loadBarberData = async () => {
            if (!isEditing) return;

            try {
                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/barbers/${id}`, {
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
                        confirmPassword: ""
                    });
                } else {
                    dispatch({
                        type: "set-message",
                        payload: { type: "error", msg: "No se pudo cargar la información del barbero" }
                    });
                }
            } catch (error) {
                console.error("Error cargando datos del barbero:", error);
                dispatch({
                    type: "set-message",
                    payload: { type: "error", msg: "Error de conexión al cargar barbero" }
                });
            }
        };

        loadBarberData();
    }, [id, isEditing, store.token, dispatch]);

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
            ? `${import.meta.env.VITE_BACKEND_URL}/barbers/${id}`
            : `${import.meta.env.VITE_BACKEND_URL}/barbers`;

        if (!isEditing && !form.password) {
            dispatch({
                type: "set-message",
                payload: { type: "error", msg: "La contraseña es obligatoria para nuevos barberos" }
            });
            return;
        }
        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${store.token}`
                },
                body: JSON.stringify({
                    name: form.name,
                    email: form.email,
                    phone: form.phone,
                    ...(form.password && { password: form.password })
                })
            });

            const data = await response.json();

            if (response.ok) {
                dispatch({
                    type: "set-message",
                    payload: { type: "success", msg: isEditing ? "Barbero actualizado" : "Barbero creado" }
                });
                navigate("/4dm1n1str4t10n");
            } else {
                dispatch({
                    type: "set-message",
                    payload: { type: "error", msg: data.message?.msg || "Algo ha fallado al guardar" }
                });
            }

        } catch (err) {
            dispatch({
                type: "set-message",
                payload: { type: "error", msg: "Error de conexión con el servidor" }
            });
        }
    };
    return (
        <div className="container py-5" style={{ maxWidth: '700px' }}>
            <div className="booking-card shadow-lg">

                <div className="booking-header">
                    <h2 className="Oswald mb-0 text-uppercase fw-bold">
                        {isEditing ? "Editar profesional" : "Nuevo profesional"}
                    </h2>
                    <div className="mt-2" style={{ width: '40px', height: '2px', background: '#d19f68', margin: '0 auto' }}></div>
                </div>

                <form onSubmit={handleSubmit} className="p-4 p-md-5">

                    <div className="row">
                        <div className="col-md-12 form-group-custom">
                            <label>Nombre completo</label>
                            <input className="select-custom" name="name" value={form.name}
                                placeholder="Ej. Ricardo Arjona" onChange={handleChange} required />
                        </div>

                        <div className="col-md-6 form-group-custom">
                            <label>Correo electrónico</label>
                            <input className="select-custom" name="email" value={form.email}
                                placeholder="barbero@tuweb.com" onChange={handleChange} required />
                        </div>

                        <div className="col-md-6 form-group-custom">
                            <label>Teléfono</label>
                            <input
                                type="text"
                                className="select-custom"
                                name="phone"
                                value={form.phone}
                                placeholder="600111222"
                                maxLength="9"
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, "");
                                    setForm({ ...form, phone: val });
                                }}
                                required
                            />
                        </div>
                    </div>

                    <hr className="my-4" style={{ opacity: '0.1' }} />

                    <div className="row">
                        <div className="col-md-12 mb-3">
                            <small className="Oswald text-muted text-uppercase" style={{ letterSpacing: '1px', fontSize: '0.7rem' }}>
                                {isEditing ? "Contraseña (Solo si deseas cambiarla)" : "Configurar acceso"}
                            </small>
                        </div>

                        <div className="col-md-6 form-group-custom">
                            <label>Contraseña</label>
                            <input className="select-custom" type="password" name="password"
                                placeholder="********" onChange={handleChange} required={!isEditing} />
                        </div>

                        <div className="col-md-6 form-group-custom">
                            <label>Confirmar contraseña</label>
                            <input className="select-custom" type="password" name="confirmPassword"
                                placeholder="********" onChange={handleChange} required={!isEditing} />
                        </div>
                    </div>

                    <div className="d-flex justify-content-between align-items-center mt-5">
                        <button type="button" className="btn btn-link text-muted text-decoration-none Oswald"
                            onClick={() => navigate(-1)}>
                            CANCELAR
                        </button>
                        <button type="submit" className="btn-confirm px-5">
                            {isEditing ? "ACTUALIZAR" : "CREAR"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};