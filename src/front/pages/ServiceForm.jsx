import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const ServiceForm = () => {
    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();

    const [data, setData] = useState({
        id: null,
        name: "",
        duration: "",
        price: "",
        barbershop_id: ""
    });

    const [barbershops, setBarbershops] = useState([]);

    useEffect(() => {
        fetch(`${import.meta.env.VITE_BACKEND_URL}/barbershops`)
            .then(resp => resp.json())
            .then(data => setBarbershops(data))
            .catch(err => console.error(err));
    }, []);

    useEffect(() => {
        if (store.serviceInfo) {
            setData({
                id: store.serviceInfo.id,
                name: store.serviceInfo.name || "",
                duration: store.serviceInfo.duration || "",
                price: store.serviceInfo.price || "",
                barbershop_id: store.serviceInfo.barbershop_id || ""
            });
        }
    }, [store.serviceInfo]);

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
            ? `${import.meta.env.VITE_BACKEND_URL}/services/${data.id}`
            : `${import.meta.env.VITE_BACKEND_URL}/services`;

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
            }

            if (!resp.ok) return;

            dispatch({
                type: "set-services",
                payload: isEditing
                    ? store.services.map(s => s.id === data.id ? result : s)
                    : [...store.services, result]
            });

            dispatch({ type: "set-serviceInfo", payload: null });

            setTimeout(() => navigate(-1), 1200);

        } catch (error) {
            dispatch({
                type: "set-message",
                payload: { type: "error", msg: "Error de conexión con el servidor" }
            });
        }
    };

    return (
        <form className="mx-auto p-4" onSubmit={handleSubmit}>
            <div className="row g-3">

                <div className="col-sm-12 col-md-6 col-lg-4">
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

                <div className="col-sm-12 col-md-6 col-lg-4">
                    <label className="form-label" htmlFor="duration">Duración</label>
                    <div className="input-group">
                        <input
                            className="form-control"
                            id="duration"
                            name="duration"
                            type="number"
                            value={data.duration}
                            onChange={handleChange}
                        />
                        <div className="input-group-text"><span className="fa-regular fa-clock"></span></div>
                    </div>
                </div>

                <div className="col-sm-12 col-md-6 col-lg-4">
                    <label className="form-label" htmlFor="price">Precio</label>
                    <div className="input-group">
                        <input
                            className="form-control"
                            id="price"
                            name="price"
                            type="number"
                            value={data.price}
                            onChange={handleChange}
                        />
                        <div className="input-group-text"><span className="fa-solid fa-money-bill-1"></span></div>
                    </div>
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

            <div className="mt-4 d-flex justify-content-around">
                <Link to="/services" className="btn btn-outline-secondary mx-3 w-25">Volver</Link>
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
