import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { MessagePage } from "../components/MessagesPage.jsx";
import { useLocation } from "react-router-dom";

export const PrivateClient = () => {
    const { store } = useGlobalReducer();
    const [appointments, setAppointments] = useState([]);
    const [activeTab, setActiveTab] = useState("appointments");
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (location.state?.activeChatId) {
            setActiveTab("messages");
        }
    }, [location.state]);

    useEffect(() => {
        if (location.state?.activeTab === "messages") {
            setActiveTab("messages");
        }
    }, [location.state]);

    useEffect(() => {
        const fetchAppts = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/my-appointments`, {
                    headers: { "Authorization": `Bearer ${store.token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    const sortedData = data.sort((a, b) => new Date(a.date) - new Date(b.date));
                    setAppointments(sortedData);
                }
            } catch (err) {
                console.error("Error al cargar citas:", err);
            }
        };
        if (store.token) fetchAppts();
    }, [store.token]);

    if (store.role !== "client") {
        return (
            <div className="container mt-4 text-center">
                <h2 className="text-danger">Acceso denegado</h2>
                <p>Inicia sesión como cliente para acceder a tu perfil.</p>
                <button className="btn btn-outline-primary" onClick={() => navigate("/login")}>Ir al Login</button>
            </div>
        );
    }

    return (
        <div className="container mt-5" style={{ minHeight: "80vh" }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="mb-0">HOLA, {store.userInfo?.name.toUpperCase()}</h2>
                    <p className="text-muted">Gestiona tus citas y mensajes desde aquí</p>
                </div>
                <button className="btn btn-dark px-4 shadow-sm" onClick={() => navigate("/client_appointment_form")}>
                    RESERVAR NUEVA CITA
                </button>
            </div>

            <ul className="nav nav-tabs mb-4">
                <li className="nav-item">
                    <button 
                        className={`nav-link ${activeTab === "appointments" ? "active fw-bold" : "text-muted"}`} 
                        onClick={() => setActiveTab("appointments")}
                    >
                        Mis Citas
                    </button>
                </li>
                <li className="nav-item">
                    <button 
                        className={`nav-link ${activeTab === "messages" ? "active fw-bold" : "text-muted"}`} 
                        onClick={() => setActiveTab("messages")}
                    >
                        Mensajes
                    </button>
                </li>
            </ul>

            {activeTab === "appointments" ? (
                <div className="bg-white shadow-sm border rounded p-4">
                    <h5 className="mb-4 border-bottom pb-2">PRÓXIMAS CITAS</h5>
                    <div className="list-group list-group-flush">
                        {appointments.length > 0 ? (
                            appointments.map((appt) => (
                                <div key={appt.id} className="list-group-item py-4 px-0 border-bottom">
                                    <div className="row align-items-center">
                                        <div className="col-md-3">
                                            <div className="small text-muted text-uppercase">Fecha y Hora</div>
                                            <div className="fw-bold">{new Date(appt.date).toLocaleDateString()}</div>
                                            <div className="text-muted small">{appt.time || "10:00"}</div>
                                        </div>

                                        <div className="col-md-6">
                                            <div className="small text-muted text-uppercase">Establecimiento</div>
                                            <div className="fw-bold text-primary">{appt.barbershop_name}</div>
                                            <div className="text-dark">{appt.service_name} con <span className="text-muted">{appt.barber_name}</span></div>
                                        </div>

                                        <div className="col-md-3 text-md-end mt-3 mt-md-0">
                                            <div className="small text-muted text-uppercase">Estado y Precio</div>
                                            <span className={`badge rounded-pill ${appt.status === 'confirmed' ? 'bg-success' : 'bg-warning text-dark'}`}>
                                                {appt.status.toUpperCase()}
                                            </span>
                                            <div className="mt-1 fw-bold fs-5">{appt.price} EUR</div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-5 text-center text-muted">
                                <i className="fa-regular fa-calendar-xmark d-block mb-3 fs-1"></i>
                                <p>No tienes citas programadas actualmente.</p>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <MessagePage />
            )}
        </div>
    );
};