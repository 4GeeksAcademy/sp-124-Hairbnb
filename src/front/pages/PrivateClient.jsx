import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { MessagesPage } from "../components/MessagesPage.jsx";
import { AIHair } from "./AIHair.jsx";
import "../styles/privatezone.css";

export const PrivateClient = () => {
    const { store, dispatch } = useGlobalReducer();
    const [appointments, setAppointments] = useState([]);
    const [activeTab, setActiveTab] = useState("appointments");
    const navigate = useNavigate();
    const location = useLocation();

    const now = new Date();

    const upcomingAppointments = appointments.filter(appt => {
    const apptDate = new Date(appt.date);
    return ["pending", "confirmed"].includes(appt.status) && apptDate >= now;
});

    const historyAppointments = appointments.filter(appt => {
    const apptDate = new Date(appt.date);
    return ["completed", "no_show", "cancelled"].includes(appt.status) || apptDate < now;
});

    useEffect(() => {
        if (location.state?.activeChatId || location.state?.activeTab === "messages") {
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

    const handleCancelAppointment = async (apptId) => {
        if (!confirm("¿Estás seguro de que deseas cancelar esta cita?")) return;
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/appointments/${apptId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${store.token}` }
            });
            if (response.ok) {
                setAppointments(appointments.filter(a => a.id !== apptId));
                dispatch({ type: "set-message", payload: { type: "success", msg: "Cita cancelada correctamente." } });
            }
        } catch (err) {
            console.error("Error al cancelar:", err);
        }
    };

    if (store.role !== "client") {
        return (
            <div className="container py-5 text-center">
                <h2 className="Oswald fw-bold text-danger">ACCESO DENEGADO</h2>
                <p>Inicia sesión como cliente para acceder.</p>
                <button className="btn btn-dark Oswald mt-3" onClick={() => navigate("/login/client")}>INICIAR SESIÓN</button>
            </div>
        );
    }

    const renderAppointmentList = (list, isHistoryTab) => (
        <div className="animate__animated animate__fadeIn mt-4">
            {list.length > 0 ? (
                <div className="row g-3">
                    {list.map((appt) => (
                        <div key={appt.id} className="col-12">
                            <div className="card border-dark rounded-0 shadow-sm bg-white position-relative overflow-hidden">
                                <div className={`position-absolute top-0 start-0 h-100 ${appt.status === 'confirmed' ? 'bg-success' :
                                        appt.status === 'pending' ? 'bg-gold' : 'bg-secondary'
                                    }`} style={{ width: '4px' }}></div>

                                <div className="card-body p-3 ps-4">
                                    <div className="row align-items-center">
                                        <div className="col-md-2 text-center border-end border-light">
                                            <div className="Oswald fw-bold text-dark h4 mb-0">{new Date(appt.date).getDate()}</div>
                                            <div className="Oswald text-gold small fw-bold text-uppercase">
                                                {new Date(appt.date).toLocaleString('es', { month: 'short' })}
                                            </div>
                                            <div className="small text-muted Oswald">
                                                {new Date(appt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>

                                        <div className="col-md-5 mt-3 mt-md-0">
                                            <h6 className="Oswald fw-bold mb-1 text-uppercase text-dark">{appt.service_name}</h6>
                                            <div className="d-flex flex-wrap gap-3">
                                                <span className="small Oswald text-muted">
                                                    <i className="fa-solid fa-shop text-gold me-2"></i>{appt.barbershop_name}
                                                </span>
                                                <span className="small Oswald text-muted">
                                                    <i className="fa-solid fa-user-check text-gold me-2"></i>{appt.barber_name}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="col-md-5 text-md-end mt-3 mt-md-0">
                                            <div className="d-flex flex-md-row justify-content-md-end align-items-center gap-3">
                                                <div className="me-md-3">
                                                    <div className="Oswald fw-bold text-dark">{appt.price} €</div>
                                                    <span className="badge border border-dark text-dark Oswald px-2 text-uppercase small" style={{ fontSize: '0.6rem' }}>
                                                        {appt.status.replace('_', ' ')}
                                                    </span>
                                                </div>

                                                {!isHistoryTab && (
                                                    <div className="d-flex gap-2">
                                                        <button
                                                            className="btn btn-dark text-gold btn-sm Oswald fw-bold px-3"
                                                            style={{ fontSize: '0.7rem' }}
                                                            onClick={() => navigate("/client_appointment_form", { state: { editAppt: appt } })}
                                                        >
                                                            REPROGRAMAR
                                                        </button>
                                                        <button
                                                            className="btn btn-outline-danger btn-sm Oswald fw-bold px-3"
                                                            style={{ fontSize: '0.7rem' }}
                                                            onClick={() => handleCancelAppointment(appt.id)}
                                                        >
                                                            CANCELAR
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-5 border border-dark border-opacity-10 bg-light">
                    <p className="Oswald text-muted mb-0">NO HAY CITAS DISPONIBLES</p>
                </div>
            )}
        </div>
    );

    return (
        <div className="container-fluid py-5 px-md-5 bg-white min-vh-100">
            <div className="d-flex justify-content-between align-items-end mb-5 border-bottom pb-3">
                <div>
                    <span className="text-gold fw-bold small text-uppercase Oswald d-block">CLIENTE</span>
                    <h1 className="Oswald text-dark fw-bold mb-0 text-uppercase">
                        HOLA, {store.userInfo?.name || "USUARIO"}
                    </h1>
                </div>
                <button className="btn btn-dark text-gold Oswald fw-bold px-4 py-2 rounded-0 shadow-sm" onClick={() => navigate("/client_appointment_form")}>
                    <i className="fa-solid fa-plus me-2"></i>NUEVA CITA
                </button>
            </div>

            <ul className="pb-tabs-nav border-0 gap-2 mb-4">
    {["appointments", "history", "messages", "ai_testing"].map((tab) => (
        <li className="nav-item" key={tab}>
            <button
                className={`pb-tab-btn Oswald fw-bold ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab)}
            >
                {tab === "appointments" ? "MIS CITAS" : tab === "history" ? "HISTORIAL" : tab === "messages" ? "MENSAJES" : "AI TESTING"}
            </button>
        </li>
    ))}
</ul>

            <div className="tab-content">
                {activeTab === "appointments" && renderAppointmentList(upcomingAppointments, false)}
                {activeTab === "history" && renderAppointmentList(historyAppointments, true)}
                {activeTab === "messages" && <div className="p-3 border border-dark bg-white"><MessagesPage /></div>}
                {activeTab === "ai_testing" && <div className="p-4 border border-dark bg-white"><AIHair /></div>}
            </div>
        </div>
    );
};