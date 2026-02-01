import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const ScheduleForm = () => {
    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();

    const [data, setData] = useState({
        id: null,
        start_time: "",
        end_time: "",
        barber_id: ""
    });

    const [barbers, setBarbers] = useState([]);

    useEffect(() => {
        fetch(`${import.meta.env.VITE_BACKEND_URL}/barbers`)
            .then(resp => resp.json())
            .then(data => setBarbers(data))
            .catch(err => console.error(err));
    }, []);

    useEffect(() => {
        if (store.scheduleInfo) {
            setData({
                id: store.scheduleInfo.id,
                start_time: store.scheduleInfo.start_time || "",
                end_time: store.scheduleInfo.end_time || "",
                barber_id: store.scheduleInfo.barber_id || ""
            });
        }
    }, [store.scheduleInfo]);

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
            ? `${import.meta.env.VITE_BACKEND_URL}/schedules/${data.id}`
            : `${import.meta.env.VITE_BACKEND_URL}/schedules`;

        const method = isEditing ? "PUT" : "POST";

        try {
            const resp = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });

            const result = await resp.json();

            dispatch({
                type: "set-schedules",
                payload: isEditing
                    ? store.schedules.map(s => s.id === data.id ? result : s)
                    : [...store.schedules, result]
            });

            dispatch({ type: "set-scheduleInfo", payload: null });
            navigate("/schedules");

        } catch (error) {
            console.error("Error guardando horario:", error);
        }
    };

    return (
        <form className="mx-auto p-4" onSubmit={handleSubmit}>
            <div className="row g-3">
                <div className="col-12 col-md-6 mx-auto">
                    <label className="form-label text-center" htmlFor="barbershop_id">Barbero</label>
                    <select
                        className="form-select"
                        id="barber_id"
                        name="barber_id"
                        value={data.barber_id}
                        onChange={handleChange}
                    >
                        <option value="">Selecciona un barbero</option>
                        {barbers.map(b => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                    </select>
                </div>

                <div className="col-12 col-md-6">
                    <label className="form-label" htmlFor="start_time">Hora de inicio</label>
                    <input
                        className="form-control"
                        id="start_time"
                        name="start_time"
                        type="time"
                        value={data.start_time}
                        onChange={handleChange}
                    />
                </div>

                <div className="col-12 col-md-6">
                    <label className="form-label" htmlFor="end_time">Hora de fin</label>
                    <input
                        className="form-control"
                        id="end_time"
                        name="end_time"
                        type="time"
                        value={data.email}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div className="mt-5 d-flex justify-content-around">
                <button
                    type="submit"
                    className="btn btn-outline-secondary mx-3 w-25"
                >
                    {data.id ? "Actualizar" : "Crear"}
                </button>
                <Link to="/schedules" className="btn btn-secondary mx-3 w-25">Volver</Link>
            </div>
        </form>
    );
};
