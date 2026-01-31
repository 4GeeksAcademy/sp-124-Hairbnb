import { useState, useEffect } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { Link, useNavigate } from "react-router-dom";

export const UserForm = () => {
    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();

    const [data, setData] = useState({
        id: null,
        email: "",
        last_name: "",
        name: "",
        notes: "",
        phone: ""
    });

    // 👉 rellenar form al editar (normalizado)
    useEffect(() => {
        if (store.userInfo) {
            setData({
                id: store.userInfo.id,
                email: store.userInfo.email || "",
                last_name: store.userInfo.last_name || "",
                name: store.userInfo.name || "",
                notes: store.userInfo.notes || "",
                phone: store.userInfo.phone || ""
            });
        }
    }, [store.userInfo]);

    const handleChange = (e) => {
        setData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const isEditing = !!data.id;

        const url = isEditing
            ? `${import.meta.env.VITE_BACKEND_URL}/users/${data.id}`
            : `${import.meta.env.VITE_BACKEND_URL}/users`;

        const method = isEditing ? "PUT" : "POST";

        try {
            const resp = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });

            const result = await resp.json();

            dispatch({
                type: "set-users",
                payload: isEditing
                    ? store.users.map(u => u.id === data.id ? result : u)
                    : [...store.users, result]
            });

            dispatch({
                type: "set-userInfo",
                payload: null
            });

            navigate("/users");

        } catch (error) {
            console.error("Error guardando usuario:", error);
        }
    };

    return (
        <form className="mx-auto p-4" onSubmit={handleSubmit}>
            <div className="row g-3">
                <div className="col-12 col-md-6 col-lg-6">
                    <label className="form-label" htmlFor="name">Nombre</label>
                    <input
                        className="form-control"
                        id="name"
                        name="name"
                        value={data.name}
                        type="text"
                        onChange={handleChange}
                    />
                </div>

                <div className="col-12 col-md-6 col-lg-6">
                    <label className="form-label" htmlFor="last_name">Apellido</label>
                    <input
                        className="form-control"
                        id="last_name"
                        name="last_name"
                        value={data.last_name}
                        type="text"
                        onChange={handleChange}
                    />
                </div>


                <div className="col-12 col-md-6 col-lg-6">
                    <label className="form-label" htmlFor="email">Correo</label>
                    <input
                        className="form-control"
                        id="email"
                        name="email"
                        value={data.email}
                        type="email"
                        onChange={handleChange}
                    />
                </div>

                {/* Contraseña */}
                <div className="col-12 col-md-6 col-lg-6">
                    <label className="form-label" htmlFor="password">Contraseña</label>
                    <input
                        className="form-control"
                        id="password"
                        name="password"
                        type="password"
                        value={data.password}
                        onChange={handleChange}
                    />
                </div>
                <div className="col-12 col-md-6 col-lg-6">
                    <label className="form-label" htmlFor="notes">Notas</label>
                    <textarea
                        className="form-control"
                        id="notes"
                        name="notes"
                        value={data.notes}
                        onChange={handleChange}
                    />
                </div>
                <div className="col-12 col-md-6 col-lg-6">
                    <label className="form-label" htmlFor="phone">Teléfono</label>
                    <input
                        className="form-control"
                        id="phone"
                        name="phone"
                        type="number"
                        value={data.phone}
                        onChange={handleChange}
                    />
                </div>
            </div>

            {/* Botones */}
            <div className="mt-4 d-flex justify-content-around">
                <button
                    type="submit"
                    className="btn btn-outline-secondary mx-3 w-25"
                >
                    {data.id ? "Actualizar" : "Crear"}
                </button>
                <Link to="/" className="btn btn-secondary mx-3 w-25">Volver</Link>
            </div>
        </form>

    );
};
