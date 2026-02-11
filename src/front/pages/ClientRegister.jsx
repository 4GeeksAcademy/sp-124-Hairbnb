import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const ClientRegister = () => {
    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();
    
    const isEditing = !!store.token;

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

    return (
        <div className="container mt-5">
            <h1 className="display-6 mb-4">
                {isEditing ? "Mis datos personales" : "Crear cuenta como cliente"}
            </h1>

            <form onSubmit={handleSubmit}>
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
                <input className="form-control mb-2" type="password" name="password" placeholder="********" onChange={handleChange} />
                
                <label>Confirmar contraseña</label>
                <input className="form-control mb-2" type="password" name="confirmPassword" placeholder="********" onChange={handleChange} />
                
                <label>Notas adicionales</label>
                <textarea className="form-control mb-2" name="notes" value={form.notes} placeholder="Notas (alergias, preferencias...)" onChange={handleChange} />
                
                <button className="btn btn-outline-primary mt-3">
                    {isEditing ? "Actualizar perfil" : "Crear cuenta"}
                </button>
            </form>
        </div>
    );
};