import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import defaultImage from "../../../public/DefaultImage.png";

export const BarbershopDetails = ({ id: propId }) => {
    const navigate = useNavigate();
    const { id: paramId } = useParams();
    const id = propId || paramId;
    
    const [barber, setBarber] = useState(null);
    const { store, dispatch } = useGlobalReducer();

    const handleContact = async () => {
        if (!store.token) {
            dispatch({
                type: "set-message",
                payload: { type: "danger", msg: "Debes iniciar sesión para contactar" }
            });
            return navigate("/login/client");
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/conversations`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${store.token}`
                },
                body: JSON.stringify({ barbershop_id: id })
            });

            const data = await response.json();
            if (response.ok) {
                navigate("/private/client", { state: { activeChatId: data.id } });
                dispatch({
                    type: "set-message",
                    payload: { type: "success", msg: "Conversación iniciada." }
                });
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/barbershops/${id}`);
                if (response.ok) {
                    const data = await response.json();
                    setBarber(data);
                }
            } catch (error) {
                console.error("Error en el fetch:", error);
            }
        };
        if (id) fetchDetail();
    }, [id]);

    if (!barber) return <div className="p-3 text-center">Cargando datos...</div>;

    return (
        <div className="p-2">
            <img 
                src={barber.barbershop_image || defaultImage} 
                className="img-fluid rounded mb-3" 
                alt={barber.name} 
            />
            <h2 className="h4 text-center">{barber.name}</h2>
            <div className="text-center small mb-3">
                <p className="mb-1"><i className="fa-solid fa-location-dot me-2"></i>{barber.address}</p>
                <p className="text-muted"><i className="fa-solid fa-phone me-2"></i>{barber.phone}</p>
            </div>
            <hr />
            <h5 className="h6 fw-bold">Sobre nosotros</h5>
            <p className="small text-muted">{barber.barbershop_description || "Sin descripción disponible."}</p>
            
            <div className="d-grid gap-2 mt-4">
                <button className="btn btn-primary" onClick={handleContact}>
                    Contactar ahora
                </button>
                {!propId && <Link className="btn btn-outline-secondary" to="/asociates">Volver</Link>}
            </div>
        </div>
    );
};