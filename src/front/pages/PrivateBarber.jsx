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
    if (!store.token) return;
    const headers = { "Authorization": `Bearer ${store.token}` };
    try {
      const [resApp, resSch, resInv, resSer] = await Promise.all([
        fetch(`${import.meta.env.VITE_BACKEND_URL}/appointments`, { headers }),
        fetch(`${import.meta.env.VITE_BACKEND_URL}/schedules`, { headers }),
        fetch(`${import.meta.env.VITE_BACKEND_URL}/invitations`, { headers }),
        fetch(`${import.meta.env.VITE_BACKEND_URL}/barber_services`, { headers })
      ]);

      if (resApp.ok) dispatch({ type: "set-appointments", payload: await resApp.json() });
      if (resSch.ok) dispatch({ type: "set-schedules", payload: await resSch.json() });
      if (resInv.ok) dispatch({ type: "set-invitations", payload: await resInv.json() });
      if (resSer.ok) dispatch({ type: "set-barber_services", payload: await resSer.json() });
    } catch (err) { console.error(err); }
  };

  useEffect(() => { loadAll(); }, [store.token]);

  const approvedInvitations = store.invitations?.filter(inv => inv.status === "accepted") || [];
  const pendingInvitations = store.invitations?.filter(inv => inv.status === "pending") || [];

  if (store.role !== "barber") {
    return (
      <div className="container mt-5 text-center">
        <h2>No tienes permisos de barbero</h2>
      </div>
    );
  }

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
          <div className="appointments-wrapper bg-light p-3 rounded shadow-inner">
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
              <div className="d-flex align-items-center gap-2 bg-white p-2 rounded shadow-sm">
                <input type="date" className="form-control border-0 fw-bold" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
                <button className="btn btn-primary d-flex align-items-center gap-2" onClick={() => { dispatch({ type: "set-appointmentInfo", payload: null }); navigate("/appointments_form"); }}>
                  Nueva Cita
                </button>
              </div>
            </div>

            <div className="d-flex gap-3 overflow-auto pb-4" style={{ minHeight: "500px" }}>
              {approvedInvitations.length === 0 ? <p className="p-4 text-muted">Acepta una invitación para ver tu agenda.</p> :
                approvedInvitations.map(inv => {
                  const dayApps = store.appointments?.filter(a =>
                    a.date.split("T")[0] === selectedDate &&
                    Number(a.barbershop_id) === Number(inv.barbershop?.id)
                  ).sort((a, b) => a.date.localeCompare(b.date));

                  return (
                    <div key={inv.id} className="appointment-column" style={{ minWidth: "280px", flex: "1" }}>
                      <div className="card h-100 border-0 shadow-sm">
                        <div className="card-header bg-white border-bottom-0 pt-3 pb-0 text-center">
                          <h6 className="fw-bold text-uppercase mb-0 text-primary">{inv.barbershop?.name}</h6>
                          <hr className="mb-0 mt-2" />
                        </div>
                        <div className="card-body p-2">
                          {dayApps.length === 0 ? <div className="text-center py-5"><p className="text-muted small">Sin citas</p></div> :
                            dayApps.map(a => (
                              <div key={a.id} className="card mb-2 border-0 shadow-sm bg-white hover-shadow p-2">
                                <div className="d-flex justify-content-between align-items-start">
                                  <span className="fw-bold" style={{ fontSize: "0.85rem" }}>{a.date.split("T")[1].slice(0, 5)}</span>
                                  <div className="d-flex gap-1">
                                    <button className="btn btn-sm p-0 text-secondary" onClick={() => { dispatch({ type: "set-appointmentInfo", payload: a }); navigate("/appointments_form"); }}><i className="fas fa-edit fs-6"></i></button>
                                  </div>
                                </div>
                                <div className="small fw-bold mt-1 text-truncate">{a.user_name}</div>
                                <div className="text-muted text-truncate" style={{ fontSize: "0.75rem" }}>{a.service_name}</div>
                              </div>
                            ))
                          }
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {activeTab === "schedules" && (
          <div className="bg-light p-3">
            <button className="btn btn-secondary mb-3" onClick={() => navigate("/schedules_form")}>Añadir nuevo horario</button>
            <div className="d-flex gap-3 overflow-auto pb-4">
              {daysOfWeek.map(day => (
                <div key={day} style={{ minWidth: "200px", flex: "1" }}>
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
                          <div className="mt-1">
                            En -{s.barbershop_name}-
                          </div>
                          <hr />
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
          <div className="bg-light p-3 rounded shadow-inner">
            <button className="btn btn-secondary mb-3" onClick={() => navigate("/barber_services_form")}>Gestionar mis servicios</button>
            <ul className="list-group shadow-sm">
              {store.barber_services?.length === 0 ? <li className="list-group-item">No tienes servicios configurados.</li> :
                store.barber_services?.map(s => (
                  <li key={s.id} className="list-group-item d-flex justify-content-between align-items-center">
                    <span>{s.service?.name}</span>
                    <span className="badge bg-primary rounded-pill">{s.service?.price}€</span>
                  </li>
                ))}
            </ul>
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
                    <button className="btn btn-outline-danger btn-sm">Salir</button>
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
                      <button className="btn btn-success btn-sm" onClick={() => handleAccept(inv.id)}>Aceptar</button>
                      <button className="btn btn-danger btn-sm">Rechazar</button>
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