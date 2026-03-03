import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import { uploadToCloudinary } from "../../utilities/cloudinary";

export const ServiceForm = () => {
    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();

    const [data, setData] = useState({
        id: null,
        name: "",
        duration: "",
        price: "",
        barbershop_id: "",
        service_demo_image: ""
    });

    const [barbershops, setBarbershops] = useState([]);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        const loadBarbershops = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/barbershops`);

                if (response.ok) {
                    const data = await response.json();
                    setBarbershops(data);
                } else {
                    console.error("No se pudo cargar la lista de sedes. Status:", response.status);
                }
            } catch (error) {
                console.error("Error de conexión al cargar las barberías:", error);
            }
        };

        loadBarbershops();
    }, []);

    useEffect(() => {
        if (store.serviceInfo) {
            setData({
                id: store.serviceInfo.id,
                name: store.serviceInfo.name || "",
                duration: store.serviceInfo.duration || "",
                price: store.serviceInfo.price || "",
                barbershop_id: store.serviceInfo.barbershop_id || "",
                service_demo_image: store.serviceInfo.service_demo_image || "",
            });
        }
    }, [store.serviceInfo]);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const imageUrl = await uploadToCloudinary(file);
        if (imageUrl) {
            setData(prev => ({ ...prev, service_demo_image: imageUrl }));
        }
        setUploading(false);
    };


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
            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (result.message) {
                dispatch({ type: "set-message", payload: result.message });
            }

            if (!response.ok) return;

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
                <div className="col-12 col-md-6 mx-auto mt-3 text-center">
                    <label className="form-label d-block">Imagen demostrativa del servicio</label>
                    <div className="mb-3 d-flex justify-content-center">
                        {data.service_demo_image ? (
                            <div className="position-relative">
                                <img
                                    src={data.service_demo_image}
                                    alt="Preview"
                                    className="rounded shadow-sm"
                                    style={{ width: "150px", height: "150px", objectFit: "cover" }}
                                />
                                <button
                                    type="button"
                                    className="btn pb-btn-outline-dark btn-sm position-absolute top-0 end-0 m-1 shadow"
                                    onClick={() => setData(prev => ({ ...prev, service_demo_image: "" }))}
                                >
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                        ) : (
                            <div
                                className="bg-light rounded d-flex align-items-center justify-content-center shadow-sm"
                                style={{ width: "150px", height: "150px" }}
                            >
                                {uploading ? (
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                ) : (
                                    <i className="fas fa-image text-muted fa-3x"></i>
                                )}
                            </div>
                        )}
                    </div>

                    <input
                        type="file"
                        id="service_image"
                        className="form-control"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={uploading}
                    />
                    {uploading && <small className="text-primary">Subiendo a Cloudinary...</small>}
                </div>
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
