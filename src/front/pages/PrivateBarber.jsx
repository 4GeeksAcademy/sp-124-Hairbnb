import { useEffect, useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { useNavigate } from "react-router-dom";

export const PrivateBarber = () => {
  const { store, dispatch } = useGlobalReducer();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("appointments");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const dayNamesES = {
    "Monday": "Lunes", "Tuesday": "Martes", "Wednesday": "Miércoles",
    "Thursday": "Jueves", "Friday": "Viernes", "Saturday": "Sábado", "Sunday": "Domingo"
  };

  const loadAll = async () => {
    if (!store.token || !store.userInfo?.id) return;
    
    const headers = { "Authorization": `Bearer ${store.token}` };
    
    try {
      const endpoints = [
        "appointments", 
        "schedules", 
        "invitations", 
        `barber_services?barber_id=${store.userInfo.id}`
      ];

      const responses = await Promise.all(
        endpoints.map(e => fetch(`${import.meta.env.VITE_BACKEND_URL}/${e}`, { headers }))
      );

      for (let i = 0; i < responses.length; i++) {
        const res = responses[i];

        const cleanName = endpoints[i].split("?")[0];

        if (!res.ok) {
          console.error(`Error en ${cleanName}: Código ${res.status}`);
          continue;
        }

        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await res.json();
          dispatch({ type: `set-${cleanName}`, payload: data });
        }
      }
      

    } catch (err) {
      console.error("Error crítico en loadAll:", err);
    }
  };

  useEffect(() => { loadAll(); }, [store.token]);

  const updateAppointmentStatus = async (appointmentId, newStatus) => {
    try {
      const resp = await fetch(`${import.meta.env.VITE_BACKEND_URL}/appointments/${appointmentId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${store.token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (resp.ok) {
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
      const resp = await fetch(`${import.meta.env.VITE_BACKEND_URL}/schedules/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${store.token}` }
      });
      if (resp.ok) loadAll();
    } catch (error) { console.error(error); }
  };

  const handleEditSchedule = (schedule) => {
    dispatch({ type: "set-scheduleInfo", payload: schedule });
    navigate("/schedules_form");
  };

  const handleDeleteAppt = async (appointmentId) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar esta cita?")) return;

    try {
      const resp = await fetch(`${import.meta.env.VITE_BACKEND_URL}/appointments/${appointmentId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${store.token}`
        }
      });

      const data = await resp.json();

      if (resp.ok) {
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
      const resp = await fetch(`${import.meta.env.VITE_BACKEND_URL}/invitations/${invitationId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${store.token}`
        }
      });

      const data = await resp.json();

      if (resp.ok) {
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
      const resp = await fetch(`${import.meta.env.VITE_BACKEND_URL}/invitations/${invitationId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${store.token}`
        },
        body: JSON.stringify({ status: "accepted" })
      });

      if (resp.ok) {
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

      const resp = await fetch(`${import.meta.env.VITE_BACKEND_URL}/barber_services/${serviceId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (resp.ok) {
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
        const data = await resp.json();
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
            <div className="container mt-4">
                <h2 className="text-danger">Acceso denegado</h2>
                <p>Inicia sesión como barbero para acceder.</p>
            </div>
        );
    }

  const dayNameEn = new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' });

  return (
    <div className="container mt-5">
      <h1 className="mb-4">Panel de {store.userInfo?.name}</h1>

      <ul className="nav nav-tabs my-4">
        <li className="nav-item">
          <button className={`nav-link ${activeTab === "appointments" ? "active" : ""}`} onClick={() => setActiveTab("appointments")}>Citas</button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === "schedules" ? "active" : ""}`} onClick={() => setActiveTab("schedules")}>Horarios</button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === "services" ? "active" : ""}`} onClick={() => setActiveTab("services")}>Servicios</button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === "invitations" ? "active" : ""}`} onClick={() => setActiveTab("invitations")}>Solicitudes</button>
        </li>
      </ul>

      <div className="tab-content">
        {activeTab === "appointments" && (
          <div className="appointments-wrapper p-3">
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
              <div className="d-flex align-items-center gap-2">
                <input
                  type="date"
                  className="form-control"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
                <button
                  className="btn btn-primary d-flex align-items-center gap-2"
                  onClick={() => { dispatch({ type: "set-appointmentInfo", payload: null }); navigate("/barber_appointment_form"); }}
                >
                  Nueva Cita
                </button>
              </div>
            </div>

            <div className="mx-auto">
              <div className="card border-0">
                <div className="card-header">
                  <h6 className="mb-0">
                    Citas programadas
                  </h6>
                </div>

                <div className="card-body p-3">
                  {(() => {
                    const allDayApps = store.appointments?.filter(a =>
                      a.date.split("T")[0] === selectedDate &&
                      Number(a.barber_id) === Number(store.userInfo?.id)
                    ).sort((a, b) => a.date.localeCompare(b.date));

                    if (!allDayApps || allDayApps.length === 0) {
                      return (
                        <div className="text-center py-5">
                          <p className="text-muted italic">No tienes citas para este día</p>
                        </div>
                      );
                    }

                    return allDayApps.map((a) => {
                      const apptTime = a.date.split("T")[1].slice(0, 5);

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

                      const hasConflict = !isCovered && a.status !== "completed" && a.status !== "rejected";

                      return (
                        <div
                          key={a.id}
                          className={`card mb-3 ${hasConflict ? "border-danger border-2" : ""}`}

                        >
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <div className="d-flex align-items-center gap-2 mb-1">
                                <span>
                                  {apptTime}
                                </span>
                                <span className="px-2 py-1">
                                  {a.barbershop_name ||
                                    approvedInvitations.find(inv => Number(inv.barbershop?.id) === Number(a.barbershop_id))?.barbershop?.name ||
                                    "Cargando nombre..."}
                                </span>
                              </div>

                              <div>{a.user_name}</div>
                              <div>{a.service_name}</div>
                            </div>

                            <div className="d-flex flex-column gap-2">
                              <div className="d-flex gap-2">
                                {a.status === 'pending' && (
                                  <>
                                    <button className="btn" onClick={() => updateAppointmentStatus(a.id, 'confirmed')}><i className="fas fa-check"></i></button>
                                    <button
                                      className="btn btn-outline-danger btn-sm ms-2"
                                      onClick={() => handleDeleteAppt(a.id)}
                                      title="Eliminar permanentemente"
                                    >
                                      <i className="fas fa-trash-alt"></i>
                                    </button>
                                  </>
                                )}
                                {a.status === 'confirmed' && (
                                  <button className="btn" onClick={() => updateAppointmentStatus(a.id, 'completed')}><i className="fas fa-flag-checkered"></i></button>
                                )}
                                <button className="btn" onClick={() => { dispatch({ type: "set-appointmentInfo", payload: a }); navigate("/barber_appointment_form"); }}>
                                  <i className="fas fa-edit"></i>
                                </button>
                              </div>
                              <div className="text-end">
                                <span>{a.status}</span>
                              </div>
                            </div>
                          </div>

                          {hasConflict && (
                            <div className="mt-2 pt-2">
                              ESTA CITA ESTÁ FUERA DE TU HORARIO
                            </div>
                          )}
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
          <div className="bg-light p-3">
            <button className="btn btn-secondary mb-3" onClick={() => navigate("/schedules_form")}>Añadir nuevo horario</button>
            <div className="d-flex gap-3 overflow-auto pb-4">
              {daysOfWeek.map(day => (
                <div key={day}>
                  <div className="card">
                    <div className="card-header text-center">{dayNamesES[day]}</div>
                    <div className="card-body p-2 border-0">
                      {store.schedules?.filter(s => s.day_of_week === day).map(s => (
                        <div key={s.id} className="card mb-2 border border-0">
                          <div className="d-flex justify-content-between align-items-start">
                            <span className="fw-bold fs-6">
                              {s.start_time} - {s.end_time}
                            </span>
                            <div className="d-flex gap-1">
                              <button className="btn btn-sm p-0 text-secondary" onClick={() => handleEditSchedule(s)}>
                                <i className="fas fa-edit fs-6"></i>
                              </button>
                              <button className="btn btn-sm p-0 text-danger" onClick={() => deleteSchedule(s.id)}>
                                <i className="fas fa-trash fs-6"></i>
                              </button>
                            </div>
                          </div>
                          <div className="mt-1 small">
                            En <strong>{s.barbershop_name}</strong>
                          </div>
                          <hr className="my-2" />
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
          <div className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="mb-0">Mis servicios</h5>
              <button
                className="btn btn-primary d-flex align-items-center gap-2"
                onClick={() => {
                  dispatch({ type: "set-barber_serviceInfo", payload: null });
                  navigate("/barber_services_form");
                }}
              >
                Añadir Servicio
              </button>
            </div>

            <div className="row g-3">
              {store.barber_services?.length === 0 ? (
                <div className="col-12 text-center py-5">
                  <p>No tienes servicios configurados todavía.</p>
                </div>
              ) : (
                store.barber_services?.map(s => (
                  <div key={s.id} className="col-md-6 col-lg-4">
                    <div className="card">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h6 className="card-titlemb-0">{s.name}</h6>
                          <span>{s.price}€</span>
                        </div>
                        <p className="mb-3">
                          {s.duration} minutos
                        </p>
                        <div className="d-flex justify-content-end gap-2 border-top pt-3">
                          <button
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => {
                              dispatch({ type: "set-barber_serviceInfo", payload: s });
                              navigate("/barber_services_form");
                            }}
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleDeleteService(s.id)}
                          >
                            <i className="fas fa-trash-alt"></i>
                          </button>
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
          <div className="bg-light p-3 rounded shadow-inner">
            <h5>Solicitudes aprobadas</h5>
            <ul className="list-group mb-4 shadow-sm">
              {approvedInvitations.length === 0 ? <li className="list-group-item text-muted">No estás trabajando en ninguna barbería actualmente.</li> :
                approvedInvitations.map(inv => (
                  <li key={inv.id} className="list-group-item d-flex justify-content-between align-items-center">
                    {inv.barbershop?.name}
                    <button className="btn btn-outline-danger btn-sm" onClick={() => handleDeleteInv(inv.id)}>Terminar relación</button>
                  </li>
                ))}
            </ul>

            <h5>Solicitudes pendientes</h5>
            <ul className="list-group shadow-sm">
              {pendingInvitations.length === 0 ? <li className="list-group-item text-muted">No hay invitaciones pendientes.</li> :
                pendingInvitations.map(inv => (
                  <li key={inv.id} className="list-group-item d-flex justify-content-between align-items-center">
                    {inv.barbershop?.name}
                    <div className="btn-group">
                      <div className="btn-group">
                        <button
                          className="btn btn-sm"
                          onClick={() => handleAcceptInv(inv.id)}
                        >
                          Aceptar
                        </button>
                        <button
                          className="btn btn-sm"
                          onClick={() => handleDeleteInv(inv.id)}
                        >
                          Rechazar
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};