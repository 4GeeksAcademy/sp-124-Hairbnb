import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const AdminEditAdmin = () => {
    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = !!id;

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
    });

    useEffect(() => {
        const loadAdminData = async () => {
            if (isEditing && store.token) {
                try {
                    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/admins/${id}`, {
                        headers: { "Authorization": `Bearer ${store.token}` }
                    });
                    if (response.ok) {
                        const data = await response.json();
                        setForm({
                            name: data.name || "",
                            email: data.email || "",
                            password: "",
                            confirmPassword: ""
                        });
                    }
                } catch (error) {
                    dispatch({
                        type: "set-message",
                        payload: { type: "error", msg: "Error de conexión con el servidor" }
                    });
                }
            }
        };
        loadAdminData();
    }, [id, isEditing, store.token]);

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async e => {
        e.preventDefault();


        if (form.password !== form.confirmPassword) {
            dispatch({ type: "set-message", payload: { type: "error", msg: "Las contraseñas no coinciden" } });
            return;
        }

        const method = isEditing ? "PUT" : "POST";
        const url = `${import.meta.env.VITE_BACKEND_URL}/admins${isEditing ? `/${id}` : ""}`;

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
                    ...(form.password && { password: form.password })
                })
            });

            if (response.ok) {
                dispatch({
                    type: "set-message",
                    payload: { type: "success", msg: isEditing ? "Administrador actualizado" : "Administrador creado" }
                });
                navigate("/4dm1n1str4t10n");
            } else {
                const errorData = await response.json();
                dispatch({ type: "set-message", payload: { type: "error", msg: errorData.msg || "Error en la operación" } });
            }
        } catch (err) {
            dispatch({ type: "set-message", payload: { type: "error", msg: "Error de conexión" } });
        }
    };

    if (store.role !== "admin") {
        return <div className="container mt-5 text-center"><h3>Acceso restringido</h3></div>;
    }

    return (
        <div className="container py-5" style={{ maxWidth: '650px' }}>
            <div className="booking-card shadow-lg">

                <div className="booking-header">
                    <h2 className="Oswald mb-0 text-uppercase fw-bold">
                        {isEditing ? "Editar administrador" : "Nuevo administrador"}
                    </h2>
                    <div className="mt-2" style={{ width: '40px', height: '2px', background: '#d19f68', margin: '0 auto' }}></div>
                </div>

                <form onSubmit={handleSubmit} className="p-4 p-md-5">

                    <div className="mb-4 p-3 rounded-3 bg-light border-start border-4 border-warning">
                        <small className="text-warning d-block Oswald text-uppercase fw-bold" style={{ fontSize: '0.7rem' }}>
                            <i className="fas fa-exclamation-triangle me-2"></i>Área restringida
                        </small>
                        <span className="small">Estás gestionando una cuenta con acceso total al sistema.</span>
                    </div>

                    <div className="form-group-custom">
                        <label>Nombre completo</label>
                        <input className="select-custom" name="name" value={form.name} onChange={handleChange} required />
                    </div>

                    <div className="form-group-custom">
                        <label>Correo electrónico</label>
                        <input className="select-custom" name="email" value={form.email} onChange={handleChange} required />
                    </div>

                    <hr className="my-4" style={{ opacity: '0.1' }} />

                    <div className="row">
                        <div className="col-md-6 form-group-custom">
                            <label>{isEditing ? "Nueva contraseña" : "Contraseña"}</label>
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
                            onClick={() => navigate("/4dm1n1str4t10n")}>
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
}