import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const BarberForm = () => {
    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();

    const [data, setData] = useState({
        id: null,
        name: "",
        email: "",
        password: "",
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
        if (store.barberInfo) {
            setData({
                id: store.barberInfo.id,
                name: store.barberInfo.name || "",
                email: store.barberInfo.email || "",
                password: "",
                barbershop_id: store.barberInfo.barbershop_id || ""
            });
        }
    }, [store.barberInfo]);

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
            ? `${import.meta.env.VITE_BACKEND_URL}/barbers/${data.id}`
            : `${import.meta.env.VITE_BACKEND_URL}/barbers`;

        const method = isEditing ? "PUT" : "POST";

        try {
            const resp = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });

            const result = await resp.json();

            if (result.message) {
                dispatch({
                    type: "set-message",
                    payload: result.message
                });
            }

            if (!resp.ok) return;

            dispatch({
                type: "set-barbers",
                payload: isEditing
                    ? store.barbers.map(b => b.id === data.id ? result : b)
                    : [...store.barbers, result]
            });

            dispatch({ type: "set-barberInfo", payload: null });

            navigate("/barbers");

        } catch (error) {
            dispatch({
                type: "set-message",
                payload: {
                    type: "error",
                    msg: "Error de conexión con el servidor"
                }
            });
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
                        required
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
                        required
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
                        placeholder="Solo rellenar si se quiere cambiar"
                        onChange={handleChange}
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
                         required
                    >
                        <option value="">Selecciona una barbería</option>
                        {barbershops.map(b => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="mt-5 d-flex justify-content-around">
                <button type="submit" className="btn btn-outline-secondary mx-3 w-25">
                    {data.id ? "Actualizar" : "Crear"}
                </button>
                <Link to="/barbers" className="btn btn-secondary mx-3 w-25">Volver</Link>
            </div>
        </form>
    );
};
