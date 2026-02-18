import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import 'react-phone-number-input/style.css';
import PhoneInput from 'react-phone-number-input';

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
                    payload: { type: "error", msg: data.msg || "Algo ha fallado al guardar" }
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
        <div className="container mt-5">
            <h1 className="display-6 mb-4">
                {isEditing ? `Admin: editar barbero` : "Admin: crear barbero"}
            </h1>

            <form onSubmit={handleSubmit}>
                <label>Nombre</label>
                <input className="form-control mb-2" name="name" value={form.name} placeholder="Nombre" onChange={handleChange} />

                <label>Email</label>
                <input className="form-control mb-2" name="email" value={form.email} placeholder="Email" onChange={handleChange} />

                <label>Teléfono</label>
                <PhoneInput
                    international
                    defaultCountry="ES"
                    value={form.phone}
                    onChange={(value) => setForm({ ...form, phone: value })}
                    placeholder="Teléfono profesional"
                    style={{
                        "--PhoneInputCountrySelectArrow-display": "none",
                        "display": "flex",
                        "alignItems": "center"
                    }}
                />

                <hr />
                <label>{isEditing ? "Nueva contraseña (dejar vacío para no cambiar)" : "Contraseña"}</label>
                <input className="form-control mb-2" type="password" name="password" placeholder="********" onChange={handleChange} />

                <label>Confirmar contraseña</label>
                <input className="form-control mb-2" type="password" name="confirmPassword" placeholder="********" onChange={handleChange} />

                <div className="d-flex gap-2 mt-3">
                    <button type="button" className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
                        Cancelar
                    </button>
                    <button type="submit" className="btn btn-outline-primary">
                        {isEditing ? "Actualizar barbero" : "Crear cuenta"}
                    </button>
                </div>
            </form>
        </div>
    );
};