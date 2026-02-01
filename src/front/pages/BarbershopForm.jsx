import { useState, useEffect } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { Link, useNavigate } from "react-router-dom";

export const BarbershopForm = () => {
    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();

    const [data, setData] = useState({
        id: null,
        name: "",
        address: "",
        phone: ""
    });

    useEffect(() => {
        if (store.barbershopInfo) {
            setData({
                id: store.barbershopInfo.id,
                name: store.barbershopInfo.name || "",
                address: store.barbershopInfo.address || "",
                phone: store.barbershopInfo.phone || ""
            });
        }
    }, [store.barbershopInfo]);

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
            ? `${import.meta.env.VITE_BACKEND_URL}/barbershops/${data.id}`
            : `${import.meta.env.VITE_BACKEND_URL}/barbershops`;

        const method = isEditing ? "PUT" : "POST";

        try {
            const resp = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });

            const result = await resp.json();

            dispatch({
                type: "set-barbershops",
                payload: isEditing
                    ? store.barbershops.map(b => b.id === data.id ? result : b)
                    : [...store.barbershops, result]
            });

            dispatch({
                type: "set-barbershopInfo",
                payload: null
            });
            navigate("/barbershops");
        } catch (error) {
            console.error("Error guardando barberia:", error);
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

                <div className="col-12 col-md-6 mx-auto">
                    <label className="form-label" htmlFor="address">Dirección</label>
                    <input
                        className="form-control"
                        id="address"
                        name="address"
                        value={data.address}
                        type="text"
                        onChange={handleChange}
                    />
                </div> 
            </div>

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
