import { useEffect, useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { useNavigate } from "react-router-dom";
import logo from "../../../public/Logo.png"
import "../styles/privatezone.css";

export const PrivateBarber = () => {
    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("appointments");
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
    const [searchTerm, setSearchTerm] = useState("");

    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const [year, month, day] = selectedDate.split("-").map(Number);
    const dayNameEn = new Date(year, month - 1, day).toLocaleDateString('en-US', { weekday: 'long' });
    const clientHistory = store.appointments?.filter(a =>
        ["completed", "no_show"].includes(a.status) &&
        (a.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.phone?.includes(searchTerm))
    ) || [];

    const dayNamesES = {
        "Monday": "Lunes",
        "Tuesday": "Martes",
        "Wednesday": "Miércoles",
        "Thursday": "Jueves",
        "Friday": "Viernes",
        "Saturday": "Sábado",
        "Sunday": "Domingo"
    };

    const [phoneSearch, setPhoneSearch] = useState("");
    const [foundUser, setFoundUser] = useState(null);

    const loadAll = async () => {
        if (!store.token || !store.userInfo?.id) return;

        const headers = { "Authorization": `Bearer ${store.token}` };

        try {
            const responseApp = await fetch(`${import.meta.env.VITE_BACKEND_URL}/appointments`, { headers });
            if (responseApp.ok) {
                const dataApp = await responseApp.json();
                dispatch({ type: "set-appointments", payload: dataApp });
            }

            const responseSch = await fetch(`${import.meta.env.VITE_BACKEND_URL}/schedules`, { headers });
            if (responseSch.ok) {
                const dataSch = await responseSch.json();
                dispatch({ type: "set-schedules", payload: dataSch });
            }

            const responseInv = await fetch(`${import.meta.env.VITE_BACKEND_URL}/invitations`, { headers });
            if (responseInv.ok) {
                const dataInv = await responseInv.json();
                dispatch({ type: "set-invitations", payload: dataInv });
            }

            const responseServ = await fetch(`${import.meta.env.VITE_BACKEND_URL}/barber_services?barber_id=${store.userInfo.id}`, { headers });
            if (responseServ.ok) {
                const dataServ = await responseServ.json();
                dispatch({ type: "set-barber_services", payload: dataServ });
            }

        } catch (err) {
            console.error("Error crítico en la carga secuencial:", err);
            dispatch({
                type: "set-message",
                payload: { type: "error", msg: "Fallo al sincronizar los datos del perfil" }
            });
        }
    };
    const handleSearchUser = async () => {
        if (!phoneSearch) return;

        try {
            const responseUser = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/search?phone=${encodeURIComponent(phoneSearch)}`, {
                headers: { "Authorization": `Bearer ${store.token}` }
            });

            if (responseUser.ok) {
                const user = await responseUser.json();
                setFoundUser(user);
            } else {
                dispatch({ type: "set-message", payload: { type: "error", msg: "Cliente no encontrado" } });
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => { loadAll(); }, [store.token]);

    const updateAppointmentStatus = async (appointmentId, newStatus) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/appointments/${appointmentId}/status`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${store.token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                const updatedAppointments = store.appointments.map(appt =>
                    appt.id === appointmentId ? { ...appt, status: newStatus } : appt
                );
                dispatch({ type: "set-appointments", payload: updatedAppointments });
                dispatch({ type: "set-message", payload: { type: "success", msg: `Cita ${newStatus}` } });
            }
        } catch (error) { console.error(error); }
    };

    const deleteSchedule = async (id) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/schedules/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${store.token}` }
            });

            const data = await response.json();

            if (response.ok) {
                dispatch({ type: "set-message", payload: data.message });
                loadAll();
            } else {
                dispatch({ type: "set-message", payload: data.message || { type: "error", msg: "No se pudo borrar" } });
            }
        } catch (error) {
            console.error(error);
            dispatch({ type: "set-message", payload: { type: "error", msg: "Error de conexión" } });
        }
    };

    const handleEditSchedule = (schedule) => {
        dispatch({ type: "set-scheduleInfo", payload: schedule });
        navigate("/schedules_form");
    };

    const handleDeleteAppt = async (appointmentId) => {
        if (!window.confirm("¿Estás seguro de que deseas eliminar esta cita?")) return;

        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/appointments/${appointmentId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${store.token}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                const updatedAppointments = store.appointments.filter(appt => appt.id !== appointmentId);

                dispatch({ type: "set-appointments", payload: updatedAppointments });

                dispatch({ type: "set-message", payload: data.message });
            } else {
                dispatch({ type: "set-message", payload: data.message });
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const handleDeleteInv = async (invitationId) => {
        if (!window.confirm("¿Estás seguro de que deseas eliminar esta invitación?")) return;

        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/invitations/${invitationId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${store.token}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                const updatedInvitations = store.invitations.filter(inv => inv.id !== invitationId);

                dispatch({ type: "set-invitations", payload: updatedInvitations });

                dispatch({ type: "set-message", payload: data.message });
            } else {
                dispatch({ type: "set-message", payload: data.message });
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const handleAcceptInv = async (invitationId) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/invitations/${invitationId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${store.token}`
                },
                body: JSON.stringify({ status: "accepted" })
            });

            if (response.ok) {
                dispatch({ type: "set-message", payload: { type: "success", msg: "Invitación aceptada" } });
                loadAll();
            }
        } catch (error) {
            console.error("Error al aceptar:", error);
        }
    };

    const handleDeleteService = async (serviceId) => {
        if (!window.confirm("¿Estás seguro de que quieres eliminar este servicio?")) return;

        try {
            const token = store.token || localStorage.getItem("token");

            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/barber_services/${serviceId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (response.ok) {
                const updatedServices = store.barber_services.filter(s => s.id !== serviceId);

                dispatch({
                    type: "set-barber_services",
                    payload: updatedServices
                });

                dispatch({
                    type: "set-message",
                    payload: { type: "success", msg: "Servicio eliminado correctamente" }
                });
            } else {
                const data = await response.json();
                alert(data.message?.msg || "No se pudo eliminar el servicio");
            }
        } catch (error) {
            console.error("Error eliminando servicio:", error);
            alert("Error de conexión al intentar eliminar");
        }
    };

    const approvedInvitations = store.invitations?.filter(inv => inv.status === "accepted") || [];
    const pendingInvitations = store.invitations?.filter(inv => inv.status === "pending") || [];

    if (store.role !== "barber") {
        return (
            <div className="container py-5 text-center">
                <h2 className="Oswald fw-bold text-danger">ACCESO DENEGADO</h2>
                <p>Inicia sesión como barbero para acceder.</p>
                <button className="btn btn-dark Oswald mt-3" onClick={() => navigate("/login/barber")}>INICIAR SESIÓN</button>
            </div>
        );
    }


    const confirmedAppts = store.appointments?.filter(a =>
        a.status === "confirmed" &&
        a.date.split("T")[0] === selectedDate &&
        Number(a.barber_id) === Number(store.userInfo?.id)
    ) || [];

    const pendingAppts = store.appointments?.filter(a =>
        a.status === "pending" &&
        Number(a.barber_id) === Number(store.userInfo?.id)
    ) || [];

    return (
        <div className="container-fluid py-5 px-md-5 bg-white min-vh-100">
            <h1 className="Oswald text-dark fw-bold mb-4 border-bottom pb-3">PANEL DE {store.userInfo?.name?.toUpperCase()}</h1>

            <ul className="pb-tabs-nav border-0 gap-2 mb-4">
                <li className="pb-tab-btn">
                    <button className={`pb-tab-btn Oswald fw-bold ${activeTab === "appointments" ? "active" : ""}`} onClick={() => setActiveTab("appointments")}>CITAS</button>
                </li>
                <li className="pb-tab-btn">
                    <button className={`pb-tab-btn Oswald fw-bold ${activeTab === "schedules" ? "active" : ""}`} onClick={() => setActiveTab("schedules")}>HORARIOS</button>
                </li>
                <li className="pb-tab-btn">
                    <button className={`pb-tab-btn Oswald fw-bold ${activeTab === "services" ? "active" : ""}`} onClick={() => setActiveTab("services")}>SERVICIOS</button>
                </li>
                <li className="pb-tab-btn">
                    <button className={`pb-tab-btn Oswald fw-bold ${activeTab === "invitations" ? "active" : ""}`} onClick={() => setActiveTab("invitations")}>SOLICITUDES</button>
                </li>
                <li className="pb-tab-btn">
                    <button className={`pb-tab-btn Oswald fw-bold ${activeTab === "clients" ? "active" : ""}`} onClick={() => setActiveTab("clients")}>HISTORIAL CLIENTES</button>
                </li>
            </ul>

            <div className="tab-content">
                {activeTab === "appointments" && (
                    <div className="pb-card animate__animated animate__fadeIn">
                        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
                            <div className="d-flex align-items-center gap-2">
                                <input
                                    type="date"
                                    className="form-control Oswald border-dark"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    style={{ width: '200px' }}
                                />
                                <button
                                    className="btn btn-outline-dark Oswald fw-bold"
                                    onClick={() => setActiveTab("pending_approval")}
                                >
                                    PENDIENTES: {pendingAppts.length}
                                </button>
                            </div>
                            <button
                                className="hairbnb-btn"
                                onClick={() => {
                                    dispatch({ type: "set-appointmentInfo", payload: null });
                                    navigate("/barber_appointment_form");
                                }}
                            >
                                <i className="fas fa-plus me-2"></i> NUEVA CITA
                            </button>
                        </div>

                        <div className="mx-auto">
                            <div className="card border-dark shadow-sm">
                                <h6 className="pb-header text-uppercase text-gold ps-3">
                                    {new Date(selectedDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </h6>

                                <div className="card-body p-3 bg-light">
                                    {(() => {
                                        const confirmedDayApps = store.appointments?.filter(a =>
                                            a.status === "confirmed" &&
                                            a.date.split("T")[0] === selectedDate &&
                                            Number(a.barber_id) === Number(store.userInfo?.id)
                                        ).sort((a, b) => a.date.localeCompare(b.date)) || [];

                                        if (confirmedDayApps.length === 0) {
                                            return (
                                                <div className="text-center py-5">
                                                    <i className="fa-solid fa-calendar-xmark fa-2x text-muted mb-2"></i>
                                                    <p className="text-muted Oswald">No hay citas confirmadas para esta fecha</p>
                                                </div>
                                            );
                                        }

                                        return confirmedDayApps.map((a) => {
                                            const apptTime = a.date.split("T")[1].slice(0, 5);
                                            const endTime = a.end_time ? a.end_time.split("T")[1].slice(0, 5) : "--:--";

                                            const isCovered = store.schedules?.some((s) => {
                                                const padTime = (t) => t && t.length === 4 ? "0" + t : t;
                                                const appTime = padTime(apptTime);
                                                const sStart = padTime(s.start_time?.trim());
                                                const sEnd = padTime(s.end_time?.trim());
                                                const dayMatch = s.day_of_week?.trim().toLowerCase() === dayNameEn.toLowerCase();
                                                const shopMatch = Number(s.barbershop_id) === Number(a.barbershop_id);
                                                const timeMatch = appTime >= sStart && appTime < sEnd;
                                                return dayMatch && shopMatch && timeMatch;
                                            });

                                            const hasConflict = !isCovered && a.status !== "completed";

                                            return (
                                                <div key={a.id} className={`card mb-3 border-start border-4 ${hasConflict ? 'border-danger' : 'border-gold shadow-sm'}`}>
                                                    <div className="card-body d-flex justify-content-between align-items-center p-3">
                                                        <div>
                                                            <div className="d-flex align-items-center gap-3 mb-1">
                                                                <span className="pb-badge-time Oswald">{apptTime} - {endTime}</span>  <i className="fas fa-location-dot me-1"></i> {a.barbershop_name || "Lugar"}
                                                            </div>
                                                            <h5 className="Oswald fw-bold mb-0">{a.user_name?.toUpperCase()}</h5>
                                                            <div className="text-gold fw-bold small text-uppercase Oswald">{a.service_name}</div>
                                                        </div>

                                                        <div className="d-flex gap-2">
                                                            <button className="btn btn-sm btn-outline-success border-2 rounded-circle" onClick={() => updateAppointmentStatus(a.id, 'completed')} title="Finalizada"><i className="fas fa-check"></i></button>
                                                            <button className="btn btn-sm btn-outline-danger border-2 rounded-circle" onClick={() => { if (window.confirm("¿Marcar No Presentado?")) updateAppointmentStatus(a.id, 'no_show'); }} title="No presentado"><i className="fas fa-user-slash"></i></button>
                                                            <button className="btn btn-sm btn-outline-dark border-2 rounded-circle" onClick={() => { dispatch({ type: "set-appointmentInfo", payload: a }); navigate("/barber_appointment_form"); }}><i className="fas fa-edit"></i></button>
                                                        </div>
                                                    </div>
                                                    {hasConflict && <div className="card-footer py-1 bg-danger-subtle text-danger small Oswald fw-bold text-center">FUERA DE TU HORARIO ESTABLECIDO</div>}
                                                </div>
                                            );
                                        });
                                    })()}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "schedules" && (
                    <div className="pb-card animate__animated animate__fadeIn">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h4 className="Oswald text-gold fw-bold mb-0">DISPONIBILIDAD SEMANAL</h4>
                            <button className="hairbnb-btn" onClick={() => navigate("/schedules_form")}>GESTIONAR TURNOS</button>
                        </div>
                        <div className="d-flex gap-2 overflow-auto pb-4">
                            {daysOfWeek.map(day => (
                                <div key={day} style={{ minWidth: "160px", flex: "1" }}>
                                    <div className="card border-0 shadow-sm">
                                        <div className="card-header bg-dark text-white text-center Oswald small py-2">{dayNamesES[day].toUpperCase()}</div>
                                        <div className="card-body p-2 bg-light" style={{ minHeight: "300px" }}>
                                            {store.schedules?.filter(s => s.day_of_week === day).map(s => (
                                                <div key={s.id} className="bg-white p-2 mb-2 border rounded shadow-sm">
                                                    <div className="d-flex justify-content-between align-items-start border-bottom pb-1 mb-1">
                                                        <span className="Oswald fw-bold small text-dark">{s.start_time} - {s.end_time}</span>
                                                        <div className="d-flex gap-1">
                                                            <i className="fas fa-edit text-secondary cursor-pointer" style={{ fontSize: '10px' }} onClick={() => handleEditSchedule(s)}></i>
                                                            <i className="fas fa-trash text-danger cursor-pointer" style={{ fontSize: '10px' }} onClick={() => deleteSchedule(s.id)}></i>
                                                        </div>
                                                    </div>
                                                    <div className="text-gold Oswald fw-bold" style={{ fontSize: '9px' }}>{s.barbershop_name?.toUpperCase()}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === "services" && (
                    <div className="pb-card animate__animated animate__fadeIn">
                        <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-2">
                            <h4 className="Oswald text-dark fw-bold mb-0">CATÁLOGO DE SERVICIOS</h4>
                            <button className="hairbnb-btn" onClick={() => { dispatch({ type: "set-barber_serviceInfo", payload: null }); navigate("/barber_services_form"); }}>AÑADIR SERVICIO</button>
                        </div>

                        <div className="row g-4">
                            {store.barber_services?.length === 0 ? (
                                <div className="col-12 text-center mx-auto py-5"><p className="Oswald text-muted">No hay servicios configurados.</p></div>
                            ) : (
                                store.barber_services?.map(s => (
                                    <div key={s.id} className="col-sm-12 col-md-6 col-lg-4 mb-3 mx-auto">
                                        <div className="card h-100 border-0 shadow-sm overflow-hidden mx-auto">
                                            <div className="row g-0 align-items-center mx-auto">
                                                <div className="col-4 col-md-3 bg-light mx-auto d-flex align-items-center justify-content-center" style={{ minHeight: "120px" }}>
                                                    <img
                                                        src={s.service_demo_image || logo}
                                                        style={{ maxHeight: "100px", maxWidth: "90%", objectFit: "contain" }}
                                                        alt={s.name}
                                                    />
                                                </div>

                                                <div className="col-9">
                                                    <div className="card-body d-flex justify-content-between align-items-center">
                                                        <div>
                                                            <h5 className="Oswald fw-bold text-dark text-uppercase mb-1">{s.name}</h5>
                                                            <p className="text-muted Oswald small mb-0">
                                                                <i className="far fa-clock me-1"></i> {s.duration} MINUTOS
                                                            </p>
                                                            <p className="pb-badge-time Oswald mt-2">{s.price}€</p>
                                                        </div>

                                                        <div className="d-flex gap-2">
                                                            <button
                                                                className="btn btn-sm btn-outline-dark Oswald"
                                                                onClick={() => {
                                                                    dispatch({ type: "set-barber_serviceInfo", payload: s });
                                                                    navigate("/barber_services_form");
                                                                }}
                                                            >
                                                                EDITAR
                                                            </button>
                                                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteService(s.id)}>
                                                                <i className="fas fa-trash-alt"></i>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {activeTab === "invitations" && (
                    <div className="pb-card animate__animated animate__fadeIn bg-light">
                        <h5 className="Oswald fw-bold text-dark border-bottom pb-2 mb-3"><i className="fas fa-building text-gold me-2"></i>BARBERÍAS ACTIVAS</h5>
                        <ul className="list-group mb-5">
                            {approvedInvitations.length === 0 ? <li className="list-group-item Oswald text-muted text-center py-4">No estás vinculado a ninguna barbería.</li> :
                                approvedInvitations.map(inv => (
                                    <li key={inv.id} className="list-group-item d-flex justify-content-between align-items-center shadow-sm mb-2 border-0">
                                        <span className="Oswald fw-bold">{inv.barbershop?.name?.toUpperCase()}</span>
                                        <button className="btn btn-danger btn-sm Oswald fw-bold px-3" onClick={() => handleDeleteInv(inv.id)}>FINALIZAR CONTRATO</button>
                                    </li>
                                ))}
                        </ul>

                        <h5 className="Oswald fw-bold text-dark border-bottom pb-2 mb-3"><i className="fas fa-envelope-open-text text-gold me-2"></i>INVITACIONES RECIBIDAS</h5>
                        <ul className="list-group">
                            {pendingInvitations.length === 0 ? <li className="list-group-item Oswald text-muted text-center py-4 border-0 bg-transparent">Sin invitaciones pendientes.</li> :
                                pendingInvitations.map(inv => (
                                    <li key={inv.id} className="list-group-item d-flex justify-content-between align-items-center shadow-sm border-gold mb-2">
                                        <span className="Oswald fw-bold">{inv.barbershop?.name?.toUpperCase()}</span>
                                        <div className="btn-group gap-2">
                                            <button className="btn btn-dark text-gold Oswald fw-bold btn-sm px-4" onClick={() => handleAcceptInv(inv.id)}>ACEPTAR</button>
                                            <button className="btn btn-outline-danger Oswald fw-bold btn-sm" onClick={() => handleDeleteInv(inv.id)}>RECHAZAR</button>
                                        </div>
                                    </li>
                                ))}
                        </ul>
                    </div>
                )}

                {activeTab === "pending_approval" && (
                    <div className="pb-card animate__animated animate__fadeIn">
                        <div className="d-flex align-items-center justify-content-between mb-4 border-bottom pb-3">
                            <button className="btn btn-sm btn-outline-dark Oswald fw-bold px-3" onClick={() => setActiveTab("appointments")}>
                                <i className="fas fa-arrow-left me-2"></i>VOLVER A AGENDA
                            </button>
                            <h4 className="Oswald fw-bold text-dark mb-0 text-uppercase">SOLICITUDES POR CONFIRMAR</h4>
                        </div>

                        {pendingAppts.length === 0 ? (
                            <div className="text-center py-5"><p className="Oswald text-muted">Todo al día. No hay solicitudes pendientes.</p></div>
                        ) : (
                            <div className="row g-3">
                                {pendingAppts.map(p => (
                                    <div key={p.id} className="col-md-6 col-lg-4">
                                        <div className="card border-gold h-100">
                                            <div className="card-body bg-light">
                                                <div className="d-flex justify-content-between mb-2 Oswald fw-bold text-dark border-bottom pb-2">
                                                    <span><i className="far fa-calendar me-1"></i> {p.date.split("T")[0]}</span>
                                                    <span><i className="far fa-clock me-1"></i> {p.date.split("T")[1].slice(0, 5)}</span>
                                                </div>
                                                <h5 className="Oswald fw-bold mb-1 text-uppercase">{p.user_name}</h5>
                                                <p className="small Oswald text-muted mb-3">{p.service_name} @ {p.barbershop_name}</p>
                                                <div className="d-flex gap-2">
                                                    <button className="btn btn-dark text-gold Oswald fw-bold btn-sm w-100" onClick={() => updateAppointmentStatus(p.id, "confirmed")}>ACEPTAR</button>
                                                    <button className="btn btn-outline-danger Oswald fw-bold btn-sm w-100" onClick={() => handleDeleteAppt(p.id)}>RECHAZAR</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "clients" && (
                    <div className="pb-card animate__animated animate__fadeIn bg-white border-0 shadow-sm p-4">
                        <h4 className="Oswald fw-bold text-dark mb-4 border-bottom pb-2">BUSCADOR DE CLIENTES</h4>

                        <div className="mb-4">
                            <label className="Oswald fw-bold text-muted small text-uppercase d-block mb-2">Introduce teléfono móvil</label>
                            {foundUser ? (
                                <div className="d-flex justify-content-between align-items-center p-4 border border-dark rounded bg-light shadow-sm">
                                    <div>
                                        <div className="d-flex align-items-center gap-3 mb-2">
                                            <i className="fa-solid fa-user-circle fa-2x text-gold"></i>
                                            <strong className="h4 Oswald mb-0">{foundUser.name?.toUpperCase()} {foundUser.last_name?.toUpperCase()}</strong>
                                        </div>
                                        <div className="ms-5 text-muted Oswald">{foundUser.email}</div>
                                        <div className="ms-5 mt-3 d-flex gap-4">
                                            <span className="badge bg-danger px-3 py-2 Oswald fw-bold">AUSENCIAS: {store.appointments?.filter(a => Number(a.user_id) === Number(foundUser.id) && a.status === "no_show").length || 0}</span>
                                            <span className="badge bg-success px-3 py-2 Oswald fw-bold">TOTAL SERVICIOS: {store.appointments?.filter(a => Number(a.user_id) === Number(foundUser.id) && a.status === "completed").length || 0}</span>
                                        </div>
                                    </div>
                                    <button type="button" className="btn btn-outline-danger Oswald fw-bold px-4" onClick={() => { setFoundUser(null); setPhoneSearch(""); }}>NUEVA BÚSQUEDA</button>
                                </div>
                            ) : (
                                <div className="d-flex gap-2">
                                    <div className="flex-grow-1">
                                        <input
                                            type="text"
                                            className="form-control form-control-lg border-dark Oswald"
                                            placeholder="EJ: 600111222"
                                            maxLength="9"
                                            value={phoneSearch}
                                            onChange={(e) => { const val = e.target.value.replace(/\D/g, ""); setPhoneSearch(val); }}
                                        />
                                    </div>
                                    <button type="button" className="btn btn-dark text-gold px-5 Oswald fw-bold" onClick={handleSearchUser} disabled={!phoneSearch}>BUSCAR CLIENTE</button>
                                </div>
                            )}
                        </div>

                        <hr className="my-4 border-gold" />

                        {!foundUser ? (
                            <div className="text-center py-5 text-muted">
                                <i className="fa-solid fa-address-book fa-3x mb-3 text-gold opacity-25"></i>
                                <p className="Oswald text-uppercase small">Consulta el historial de servicios y comportamiento de tus clientes</p>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <h5 className="Oswald fw-bold text-dark mb-3 text-uppercase">ÚLTIMAS VISITAS</h5>
                                <table className="table table-hover align-middle border">
                                    <thead className="table-dark Oswald small">
                                        <tr>
                                            <th>FECHA</th>
                                            <th>SERVICIO</th>
                                            <th>BARBERÍA</th>
                                            <th className="text-center">ESTADO</th>
                                            <th className="text-end">IMPORTE</th>
                                        </tr>
                                    </thead>
                                    <tbody className="Oswald">
                                        {store.appointments?.filter(a => Number(a.user_id) === Number(foundUser.id) && ["completed", "no_show", "confirmed"].includes(a.status)).length > 0 ? (
                                            store.appointments
                                                .filter(a => Number(a.user_id) === Number(foundUser.id))
                                                .sort((a, b) => new Date(b.date) - new Date(a.date))
                                                .map(h => (
                                                    <tr key={h.id}>
                                                        <td>
                                                            <div className="fw-bold">{new Date(h.date).toLocaleDateString()}</div>
                                                            <div className="small text-muted">{h.date.split("T")[1].slice(0, 5)}h</div>
                                                        </td>
                                                        <td className="fw-bold text-gold text-uppercase">{h.service_name}</td>
                                                        <td className="small text-muted text-uppercase">{h.barbershop_name}</td>
                                                        <td className="text-center">
                                                            <span className={`badge px-3 py-2 rounded-pill ${h.status === 'completed' ? 'bg-success' : h.status === 'no_show' ? 'bg-danger' : 'bg-warning text-dark'}`}>
                                                                {h.status.toUpperCase().replace("_", " ")}
                                                            </span>
                                                        </td>
                                                        <td className="fw-bold text-end text-dark">{h.price}€</td>
                                                    </tr>
                                                ))
                                        ) : (
                                            <tr><td colSpan="5" className="text-center py-4 text-muted">No hay registros para este cliente.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}