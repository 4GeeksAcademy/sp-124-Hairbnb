import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { useNavigate } from "react-router-dom";
import defaultImage from "../../../public/DefaultImage.png"
import { Link } from "react-router-dom";

export const BarbershopDetails = () => {
    const navigate = useNavigate()
    const { id } = useParams();
    const [barber, setBarber] = useState(null);
    const { store, dispatch } = useGlobalReducer();

    const handleContact = async () => {
    if (!store.token) {
        dispatch({
            type: "set-message",
            payload: { type: "danger", msg: "Debes iniciar sesión para contactar con la barbería" }
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
            body: JSON.stringify({
                barbershop_id: id
            })
        });

        const data = await response.json();

        if (response.ok) {
            navigate("/private/client", {
                state: { activeChatId: data.id }
            });

            dispatch({
                type: "set-message",
                payload: { type: "success", msg: "Conversación iniciada. ¡Escríbeles algo!" }
            });
        }

    } catch (error) {
        console.error("Error en handleContact:", error);
        dispatch({
            type: "set-message",
            payload: { type: "danger", msg: error.message || "No se pudo iniciar el chat." }
        });
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
        fetchDetail();
    }, [id]);

    if (!barber) {
        return (
            <div className="container mt-5 py-5 text-center">
                <p className="mt-2">Buscando los detalles de la barbería...</p>
            </div>
        );
    }

    return (
        <div className="container mt-5 py-5">
            <div className="row overflow-hidden">
                <div className="col-md-6 p-0">
                    <img
                        src={barber.barbershop_image || defaultImage}
                        className="img-fluid"
                        alt={barber.name}
                    />
                </div>
                <div className="col-md-6 p-5 d-flex flex-column justify-content-center">
                    <h1 className="display-5 mb-3 text-center">{barber.name}</h1>

                    <div className="mb-4 text-center">
                        <p className="mb-1">
                            <i className="fa-solid fa-location-dot"></i>
                            {barber.address}
                        </p>
                        <p className="text-muted">
                            <i className="fa-solid fa-phone"></i>
                            {barber.phone}
                        </p>
                    </div>
                        </div>

                    <hr />

                    <h5 className="mt-3  text-center">Sobre nosotros</h5>
                    <p className=" text-center">
                        {barber.barbershop_description || "Esta barbería aún no ha compartido su historia. ¡Contáctales para saber más!"}
                    </p>

                    <div className="mt-auto pt-4 text-center">
                        <Link className="btn btn-outline-secondary m-2" to="/asociates">Volver</Link>
                        <button
                            className="btn btn-outline-primary m-2"
                            onClick={handleContact}
                        >
                            Contactar
                        </button>
                    </div>
                        <p className="text-center mt-2">
                            Normalmente responden en menos de 1 hora
                        </p>
                </div>
        </div>
    );
};