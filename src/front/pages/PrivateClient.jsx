import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const PrivateClient = () => {
    const { store } = useGlobalReducer();
    const [appointments, setAppointments] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
    const fetchAppts = async () => {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/my-appointments`, {
            headers: { "Authorization": `Bearer ${store.token}` }
        });
        if (res.ok) {
            const data = await res.json();
            
            const sortedData = data.sort((a, b) => new Date(a.date) - new Date(b.date));
            
            setAppointments(sortedData);
        }
    };
    if (store.token) fetchAppts();
}, [store.token]);

    return (
        <div className="container mt-5">
            <div className="d-flex justify-content-betweenmb-4">
                <h2>AGENDA DE CITAS</h2>
                <button className="btn" onClick={() => navigate("/client_appointment_form")}>
                    RESERVAR NUEVA
                </button>
            </div>

            <div className="list-group list-group-flush">
                {appointments.length > 0 ? (
                    appointments.map((appt) => (
                        <div key={appt.id} className="list-group-item py-3 px-0 border-bottom">
                            <div className="row align-items-center">
                                <div className="col-3">
                                    <div className="text-uppercase">Fecha</div>
                                    <div>{appt.date}</div>
                                </div>

                                <div className="col-6">
                                    <div>Servicio en {appt.barbershop_name}</div>
                                    <div>{appt.service_name} — {appt.barber_name}</div>
                                </div>

                                <div className="col-3 text-end">
                                    <div>Estado</div>
                                    <div>
                                        {appt.status}
                                    </div>
                                    <div className="mt-1">{appt.price} EUR</div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-5 text-center">
                        <p>No se registran citas próximas en su cuenta.</p>
                    </div>
                )}
            </div>
        </div>
    );
};