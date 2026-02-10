import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const OwnerForm = () => {
    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();

    const [data, setData] = useState({
        id: null,
        name: "",
        email: "",
        phone: "",
        password: "",
        barbershop_id: ""
    });

    const [barbershops, setBarbershops] = useState([]);

    const isEditing = !!data.id;

    useEffect(() => {
        fetch(`${import.meta.env.VITE_BACKEND_URL}/barbershops`)
            .then(resp => resp.json())
            .then(data => setBarbershops(data))
            .catch(err => console.error(err));
    }, []);

    useEffect(() => {
        if (store.ownerInfo) {
            setData({
                id: store.ownerInfo.id,
                name: store.ownerInfo.name || "",
                email: store.ownerInfo.email || "",
                phone: store.ownerInfo.phone || "",
                password: "",
                barbershop_id: store.ownerInfo.barbershop_id || ""
            });
        }
    }, [store.ownerInfo]);

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
            ? `${import.meta.env.VITE_BACKEND_URL}/owners/${data.id}`
            : `${import.meta.env.VITE_BACKEND_URL}/owners`;
        const method = isEditing ? "PUT" : "POST";

        try {
            const resp = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });

            const result = await resp.json();

            if (result.message) {
                dispatch({ type: "set-message", payload: result.message });

                setTimeout(() => dispatch({ type: "set-message", payload: null }), 3000);
            }

            if (!resp.ok) return;

            dispatch({
                type: "set-owners",
                payload: isEditing
                    ? store.owners.map(o => o.id === data.id ? result : o)
                    : [...store.owners, result]
            });

            dispatch({ type: "set-ownerInfo", payload: null });

            setTimeout(() => navigate(-1), 1200);

        } catch (error) {
            dispatch({
                type: "set-message",
                payload: { type: "error", msg: "Error de conexión con el servidor" }
            });

            setTimeout(() => dispatch({ type: "set-message", payload: null }), 3000);
        }
    };


    return (
        <form className="mx-auto p-4" onSubmit={handleSubmit}>
            <div className="row g-3">
                <div className="col-12 col-md-6">
                    <label className="form-label" htmlFor="name">Nombre</label>
                    <input
                        className="form-control"
                        id="name"
                        name="name"
                        type="text"
                        value={data.name}
                        onChange={handleChange}
                    />
                </div>

                <div className="col-12 col-md-6">
                    <label className="form-label" htmlFor="email">Correo</label>
                    <input
                        className="form-control"
                        id="email"
                        name="email"
                        type="email"
                        value={data.email}
                        onChange={handleChange}
                    />
                </div>

                <div className="col-12 col-md-6">
                    <label className="form-label" htmlFor="phone">Teléfono</label>
                    <input
                        className="form-control"
                        id="phone"
                        name="phone"
                        type="text"
                        value={data.phone}
                        onChange={handleChange}
                    />
                </div>

                <div className="col-12 col-md-6">
                    <label className="form-label" htmlFor="password">Contraseña</label>
                    <input
                        className="form-control"
                        id="password"
                        name="password"
                        type="password"
                        value={data.password}
                        onChange={handleChange}
                        placeholder={isEditing ? "Solo rellenar en caso de querer editarla" : ""}
                    />
                </div>

                <div className="col-12 col-md-6 mx-auto">
                    <label className="form-label text-center" htmlFor="barbershop_id">Barbería</label>
                    <select
                        className="form-select"
                        id="barbershop_id"
                        name="barbershop_id"
                        value={data.barbershop_id}
                        onChange={handleChange}
                    >
                        <option value="">Selecciona una barbería</option>
                        {barbershops.map(b => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="mt-5 d-flex justify-content-around">
                
                <button onClick={() => navigate(-1)} className="btn btn-outline-secondary mx-3 w-25">Volver</button>
                <button
                    type="submit"
                    className="btn btn-outline-primary mx-3 w-25"
                >
                    {data.id ? "Actualizar" : "Crear"}
                </button>
            </div>
        </form>
    );
};
