import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const OwnerRegister = () => {
    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();
    const isEditing = !!store.token;

    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: ""
    });

    useEffect(() => {
        const loadOwnerData = async () => {
            if (isEditing && store.userInfo?.id) {
                try {
                    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/owners/${store.userInfo.id}`, {
                        method: "GET",
                        headers: {
                            "Authorization": `Bearer ${store.token}`
                        }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        setForm({
                            name: data.name || "",
                            email: data.email || "",
                            phone: data.phone || "",
                            password: "",
                            confirmPassword: ""
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

    const handleSubmit = async e => {
        e.preventDefault();

        if (form.password !== "" && form.password !== form.confirmPassword) {
            alert("Las contraseñas no coinciden");
            return;
        }

        const method = isEditing ? "PUT" : "POST";
        const url = isEditing
            ? `${import.meta.env.VITE_BACKEND_URL}/owners/${store.userInfo.id}`
            : `${import.meta.env.VITE_BACKEND_URL}/owners`;

        try {
            const res = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                    ...(isEditing && { "Authorization": `Bearer ${store.token}` })
                },
                body: JSON.stringify({
                    name: form.name,
                    email: form.email,
                    phone: form.phone,
                    ...(form.password && { password: form.password })
                })
            });

            const data = await res.json();

            if (res.ok) {
                if (isEditing) {
                    dispatch({ type: "set-userInfo", payload: data.user || { ...store.userInfo, ...form } });

                    dispatch({
                        type: "set-message",
                        payload: { type: "success", msg: "Perfil actualizado correctamente" }
                    });

                    navigate("/private/owner");
                } else {
                    dispatch({
                        type: "set-message",
                        payload: { type: "success", msg: "Cuenta creada, ya puedes loguearte" }
                    });
                    navigate("/login/owner");
                }
            } else {
                dispatch({
                    type: "set-message",
                    payload: data.message || { type: "error", msg: "Error al procesar los datos" }
                });
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
            <h1 className="display-6 mb-4">{isEditing ? "Editar mis datos" : "Crear cuenta de dueño"}</h1>

            <form onSubmit={handleSubmit}>
                <label>Nombre</label>
                <input className="form-control mb-2" name="name" value={form.name} onChange={handleChange} />

                <label>Email</label>
                <input className="form-control mb-2" name="email" value={form.email} onChange={handleChange} />

                <label>Teléfono</label>
                <input className="form-control mb-2" name="phone" value={form.phone} onChange={handleChange} />

                <hr />
                <label>{isEditing ? "Nueva contraseña (dejar vacío para no cambiar)" : "Contraseña"}</label>
                <input className="form-control mb-2" type="password" name="password" placeholder="********" onChange={handleChange} />

                <label>Confirmar contraseña</label>
                <input className="form-control mb-2" type="password" name="confirmPassword" placeholder="********" onChange={handleChange} />

                <button className="btn btn-outline-primary mt-3">
                    {isEditing ? "Guardar cambios" : "Crear cuenta"}
                </button>
            </form>
        </div>
    );
};