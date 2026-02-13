import { useEffect, useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { useNavigate } from "react-router-dom";

export const OwnerGestion = () => {
  const { store, dispatch } = useGlobalReducer();
  const barbershop = store.barbershopInfo;
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("barbers");
  const [barbers, setBarbers] = useState([]);
  const [pending, setPending] = useState([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [appointmentView, setAppointmentView] = useState("summary");

  const getDayName = (dateString) => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const d = new Date(dateString);
    return days[d.getDay()];
  };

  const loadBarbers = async () => {
    if (!barbershop?.id) return;
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/barbershops/${barbershop.id}/barbers`,
      { headers: { "Authorization": `Bearer ${store.token}` } });

    if (res.ok) {
      const data = await res.json();
      dispatch({ type: "set-barbers", payload: data });
      setBarbers(data.filter(b => b.status === "accepted"));
      setPending(data.filter(b => b.status === "pending"));
    }
  };

  const loadAppointments = async () => {
    if (!barbershop?.id || !store.token) return;
    try {
      const resp = await fetch(`${import.meta.env.VITE_BACKEND_URL}/appointments`, {
        headers: { "Authorization": `Bearer ${store.token}` }
      });
      if (resp.ok) {
        const data = await resp.json();
        dispatch({ type: "set-appointments", payload: data });
      }
    } catch (error) {
      console.error("Error cargando citas:", error);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [selectedDate, barbershop?.id]);

  useEffect(() => {
    if (!barbershop?.id || !store.token) return;
    if (activeTab === "barbers") loadBarbers();
    if (activeTab === "appointments") loadAppointments();
  }, [activeTab, barbershop?.id, store.token]);

  const handleInvite = async () => {
    if (!inviteEmail || !barbershop) return;

    const isPhone = /^\d+$/.test(inviteEmail.trim());

    const payload = {
      barbershop_id: barbershop.id,
      [isPhone ? "phone" : "email"]: inviteEmail.trim()
    };

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/invitations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${store.token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message?.msg || "Error enviando invitación");

      setInviteEmail("");
      loadBarbers();
      dispatch({ type: "set-message", payload: { type: "success", msg: "Invitación enviada con éxito" } });
    } catch (err) {
      dispatch({ type: "set-message", payload: { type: "error", msg: err.message } });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Seguro que quieres cancelar esta cita?")) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/appointments/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${store.token}` }
      });
      if (res.ok) {
        const filteredApps = store.appointments.filter(a => a.id !== id);
        dispatch({ type: "set-appointments", payload: filteredApps });
        dispatch({ type: "set-message", payload: { type: "success", msg: "Cita eliminada" } });
      }
    } catch (error) {
      console.error("Error al eliminar", error);
    }
  };

  const handleEdit = (appt) => {
    dispatch({ type: "set-appointmentInfo", payload: appt });
    navigate("/owner_appointment_form");
  };

  if (store.role !== "owner") {
    return (
      <div className="container mt-4">
        <h2 className="text-danger">Acceso denegado</h2>
        <p>Inicia sesión para acceder al panel de gestión.</p>
      </div>
    );
  }

  console.log("barberos:", barbers);
  return (
    <div className="container mt-5">
      <h1>Gestión de: {barbershop?.name}</h1>

      <ul className="nav nav-tabs my-4">
        <li className="nav-item">
          <button className={`nav-link ${activeTab === "barbers" ? "active" : ""}`} onClick={() => setActiveTab("barbers")}>
            Barberos
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === "appointments" ? "active" : ""}`} onClick={() => setActiveTab("appointments")}>
            Citas
          </button>
        </li>
      </ul>

      <div className="tab-content">
        {activeTab === "barbers" && (
          <>
            <div className="mb-3 d-flex gap-2">
              <input type="text" placeholder="Email o teléfono del barbero" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} className="form-control" />
              <button className="btn btn-secondary" onClick={handleInvite}>Invitar</button>
            </div>
            <h5>Barberos aceptados</h5>
            <div className="row">
              {barbers.length === 0 && <div className="col-12"><p className="alert alert-light">No hay barberos aceptados aún.</p></div>}
              {barbers.map(b => (
                <div key={b.id} className="col-md-6 col-lg-4 mb-3">
                  <div className="card h-100">
                    <div className="card-body">
                      <div className="d-flex align-items-center mb-3">
                        <div className="flex-shrink-0">
                          {b.barber?.barber_profile_image ? (
                            <img
                              src={b.barber?.barber_profile_image}
                              alt={b.barber?.name}
                              className="rounded-circle object-fit-cover"
                              style={{ width: "50px", height: "50px" }}
                            />
                          ) : (
                            <div
                              className="bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center"
                              style={{ width: "50px", height: "50px" }}
                            >
                              <i className="fas fa-user"></i>
                            </div>
                          )}
                        </div>
                        <div className="ms-3">
                          <h6 className="mb-0 fw-bold">{b.barber?.name}</h6>
                          <small className="text-muted">{b.barber?.email}</small>
                        </div>
                      </div>

                      <div className="mt-3">
                        <p className="small mb-2">
                          Días de trabajo
                        </p>
                        <div className="d-flex flex-wrap">
                          {b.schedules && b.schedules.length > 0 ? (
                            b.schedules
                              .sort((a, b) => {
                                const order = { "Monday": 1, "Tuesday": 2, "Wednesday": 3, "Thursday": 4, "Friday": 5, "Saturday": 6, "Sunday": 7 };
                                return order[a.day_of_week] - order[b.day_of_week];
                              })
                              .map(s => (
                                <span
                                  key={s.id}
                                  className="py-2"
                                >
                                  {s.day_of_week.slice(0, 3)}: {s.start_time} - {s.end_time}
                                </span>
                              ))
                          ) : (
                            <span>Sin días asignados</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <h5>Invitaciones pendientes</h5>
            <ul className="list-group">
              {pending.length === 0 && <li className="list-group-item">No hay invitaciones</li>}
              {pending.map(p => (
                <li key={p.id} className="list-group-item">{p.barber?.email || p.email} - {p.status}</li>
              ))}
            </ul>
          </>
        )}

        {activeTab === "appointments" && (
          <div className="appointments-wrapper p-3">
            <div className="d-flex justify-content-between align-items-center mb-4 gap-3">
              <div className="d-flex align-items-center gap-2">
                <input
                  type="date"
                  className="form-control w-auto"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setAppointmentView("summary");
                  }}
                />
                {appointmentView === "details" && (
                  <button className="btn btn-outline-secondary" onClick={() => setAppointmentView("summary")}>
                    <i className="fas fa-arrow-left me-2"></i>Resumen
                  </button>
                )}
              </div>
              <button className="btn btn-primary" onClick={() => { dispatch({ type: "set-appointmentInfo", payload: null }); navigate("/owner_appointment_form"); }}>
                Nueva Cita
              </button>
            </div>

            <div className="d-flex overflow-auto pb-3 gap-3" style={{ alignItems: "flex-start" }}>
              {barbers.map(b => {
                const dayApps = store.appointments.filter(a =>
                  String(a.barber_id) === String(b.barber?.id) &&
                  a.date.split("T")[0] === selectedDate &&
                  (a.status === "confirmed")
                ).sort((a, b) => a.date.localeCompare(b.date));

                const currentDayName = getDayName(selectedDate);
                const todaySchedule = b.schedules?.find(s => s.day_of_week === currentDayName);

                return (
                  <div key={b.id} style={{ minWidth: "300px", maxWidth: "300px" }}>
                    <div className="card">
                      <div className="card-headertext-center py-3 text-center">
                        <h6 className="mb-0 fs-5 text-uppercase">{b.barber?.name}</h6>
                        {todaySchedule ? `${todaySchedule.start_time} - ${todaySchedule.end_time}` : "No trabaja"}
                      </div>

                      <div className="card-body p-2 d-flex flex-column justify-content-start" style={{ minHeight: "250px" }}>

                        {appointmentView === "summary" ? (
                          <div className="text-center my-auto py-4">
                            <div className="display-4">{dayApps.length}</div>
                            <p className="mb-3">citas hoy</p>
                            <button className="btn btn-outline-primary" onClick={() => setAppointmentView("details")}>
                              Detalles
                            </button>
                          </div>
                        ) : (
                          <>
                            {dayApps.length === 0 ? (
                              <div className="text-center py-5">Sin citas</div>
                            ) : (
                              dayApps.map(a => (
                                <div key={a.id} className="card mb-2">
                                  <div className="card-body p-2">
                                    <div className="d-flex justify-content-between mb-1">
                                      <span>
                                        {a.date.split("T")[1].slice(0, 5)}
                                      </span>
                                      <div className="d-flex gap-2">
                                        <i className="fas fa-edit" onClick={() => handleEdit(a)}></i>
                                        <i className="fas fa-trash" onClick={() => handleDelete(a.id)}></i>
                                      </div>
                                    </div>
                                    <div>{a.user_name}</div>
                                    <div>{a.service_name}</div>
                                  </div>
                                </div>
                              ))
                            )}
                          </>
                        )}

                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};