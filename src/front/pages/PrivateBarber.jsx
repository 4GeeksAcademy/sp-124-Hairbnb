import { useEffect, useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { useNavigate } from "react-router-dom";
import notAvailable from "../../../public/NoDisponible.png"


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
      <div className="container mt-4">
        <h2 className="text-danger">Acceso denegado</h2>
        <p>Inicia sesión como barbero para acceder.</p>
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
        <li className="nav-item">
          <button className={`nav-link ${activeTab === "clients" ? "active" : ""}`} onClick={() => setActiveTab("clients")}>
            Historial Clientes
          </button>
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
                  className="btn btn-outline-secondary"
                  onClick={() => setActiveTab("pending_approval")}
                >
                  Solicitudes: {pendingAppts.length}
                </button>
              </div>
              <button
                className="btn btn-primary d-flex align-items-center gap-2"
                onClick={() => {
                  dispatch({ type: "set-appointmentInfo", payload: null });
                  navigate("/barber_appointment_form");
                }}
              >
                <i className="fas fa-plus"></i> Nueva Cita
              </button>
            </div>

            <div className="mx-auto">
              <div className="card">
                <div className="card-header">
                  <h6 className="mb-0">
                    Dia {new Date(selectedDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
                  </h6>
                </div>

                <div className="card-body p-3">
                  {(() => {
                    const confirmedDayApps = store.appointments?.filter(a =>
                      a.status === "confirmed" &&
                      a.date.split("T")[0] === selectedDate &&
                      Number(a.barber_id) === Number(store.userInfo?.id)
                    ).sort((a, b) => a.date.localeCompare(b.date)) || [];

                    if (confirmedDayApps.length === 0) {
                      return (
                        <div className="text-center py-5">
                          <p className="text-muted">No hay citas confirmadas para hoy</p>
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
                        <div key={a.id} className="card mb-3">
                          <div className="card-body d-flex justify-content-between align-items-center p-3">
                            <div>
                              <div className="d-flex align-items-center gap-2 mb-1">
                                <span>{apptTime} - {endTime}</span>
                                <span>
                                  {a.barbershop_name || "Lugar"}
                                </span>
                              </div>
                              <h5>{a.user_name}</h5>
                              <div>{a.service_name}</div>
                            </div>

                            <div className="d-flex gap-2">
                              <button
                                className="btn btn-sm btn-outline-success"
                                onClick={() => updateAppointmentStatus(a.id, 'completed')}
                                title="Marcar como finalizada"
                              >
                                <i className="fas fa-check-double"></i>
                              </button>

                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => {
                                  if (window.confirm("¿Marcar como No Presentado? Esto quedará en el historial del cliente.")) {
                                    updateAppointmentStatus(a.id, 'no_show');
                                  }
                                }}
                                title="Cliente no se ha presentado (No-Show)"
                              >
                                <i className="fas fa-user-slash"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => {
                                  dispatch({ type: "set-appointmentInfo", payload: a });
                                  navigate("/barber_appointment_form");
                                }}
                              >
                                <i className="fas fa-edit"></i>
                              </button>
                            </div>
                          </div>

                          {hasConflict && (
                            <div className="card-footer">
                              Esta cita está fuera de tu horario de turnos.
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
                        <div key={s.id} className="card mb-2">
                          <div className="d-flex justify-content-between align-items-start">
                            <span>
                              {s.start_time} - {s.end_time}
                            </span>
                            <div className="d-flex gap-1">
                              <button className="btn text-secondary" onClick={() => handleEditSchedule(s)}>
                                <i className="fas fa-edit fs-6"></i>
                              </button>
                              <button className="btn text-danger" onClick={() => deleteSchedule(s.id)}>
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
                      <div>
                        <img src={s.service_demo_image || notAvailable} style={{
                          height: "250px",
                          objectFit: "cover",
                          width: "100%"
                        }}
                          className="card-img-top" alt="..." />

                      </div>
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
              {pendingInvitations.length === 0 ? <li className="list-group-item">No hay invitaciones pendientes.</li> :
                pendingInvitations.map(inv => (
                  <li key={inv.id} className="list-group-item d-flex justify-content-between align-items-center">
                    {inv.barbershop?.name}
                    <div className="btn-group">
                      <div className="btn-group">
                        <button
                          className="btn"
                          onClick={() => handleAcceptInv(inv.id)}
                        >
                          Aceptar
                        </button>
                        <button
                          className="btn"
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

        {activeTab === "pending_approval" && (
          <div className="p-3">
            <div className="d-flex align-items-center gap-3 mb-4">
              <button className="btn btn-sm btn-outline-secondary" onClick={() => setActiveTab("appointments")}>
                <i className="fas fa-arrow-left me-2"></i>Volver a la agenda
              </button>
              <h4 className="mb-0">Citas por confirmar</h4>
            </div>

            {pendingAppts.length === 0 ? (
              <div className="text-center py-5">
                <p className="text-muted">No tienes solicitudes pendientes de aprobación.</p>
              </div>
            ) : (
              <div className="row g-3">
                {pendingAppts.map(p => (
                  <div key={p.id} className="col-md-6 col-lg-4">
                    <div className="card">
                      <div className="card-body">
                        <div className="d-flex justify-content-between mb-2">
                          <span>{p.date.split("T")[0]}</span>
                          <span>{p.date.split("T")[1].slice(0, 5)}</span>
                        </div>
                        <h6 className="mb-1">{p.user_name}</h6>
                        <p>{p.service_name} en {p.barbershop_name}</p>
                        <div className="d-flex gap-2">
                          <button className="btn btn-outline-success" onClick={() => updateAppointmentStatus(p.id, "confirmed")}>
                            <i className="fas fa-check me-1"></i>Aceptar
                          </button>
                          <button className="btn btn-outline-danger" onClick={() => handleDeleteAppt(p.id)}>
                            <i className="fas fa-times me-1"></i>Rechazar
                          </button>
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
          <div className="p-3 bg-white border rounded shadow-sm">
            <h4 className="mb-4">Historial por Cliente</h4>

            <div className="mb-3">
              <label className="form-label font-weight-bold">Buscar Cliente por Teléfono</label>
              {foundUser ? (
                <div className="d-flex justify-content-between align-items-center p-3 border rounded bg-light">
                  <div>
                    <i className="fa-solid fa-user-check text-success me-2"></i>
                    <strong className="h5 mb-0">{foundUser.name} {foundUser.last_name}</strong>
                    <div className="ms-4">{foundUser.email}</div>
                    <div className="ms-4 mt-2 d-flex gap-3">
                      {(() => {
                        const noShows = store.appointments?.filter(a =>
                          Number(a.user_id) === Number(foundUser.id) && a.status === "no_show"
                        ).length || 0;

                        const completed = store.appointments?.filter(a =>
                          Number(a.user_id) === Number(foundUser.id) && a.status === "completed"
                        ).length || 0;

                        return (
                          <>
                            <span>
                              <i className="fa-solid fa-circle-exclamation me-1"></i>
                              Ausencias: {noShows}
                            </span>
                            <span>
                              <i className="fa-solid fa-scissors me-1"></i>
                              Servicios realizados: {completed}
                            </span>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => {
                      setFoundUser(null);
                      setPhoneSearch("");
                    }}
                  >
                    <i className="fa-solid fa-xmark me-1"></i> Borrar búsqueda
                  </button>
                </div>
              ) : (
                <div className="d-flex gap-2">
                  <div className="flex-grow-1 border rounded bg-white px-2 shadow-sm">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Ej: 600111222"
                      maxLength="9"
                      value={phoneSearch}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        setPhoneSearch(val);
                      }}
                      style={{
                        height: "45px",
                        display: "block",
                        width: "100%"
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    className="btn btn-dark px-4"
                    onClick={handleSearchUser}
                    disabled={!phoneSearch}
                  >
                    <i className="fa-solid fa-magnifying-glass me-2"></i> Buscar
                  </button>
                </div>
              )}
            </div>

            <hr className="my-4" />

            {!foundUser ? (
              <div className="text-center py-5 text-muted bg-light rounded">
                <i className="fa-solid fa-address-book fa-3x mb-3 opacity-25"></i>
                <p>Introduce el teléfono del cliente para ver su historial completo,<br /> servicios frecuentes y ausencias.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <h5 className="mb-3 text-secondary">Registro de actividad</h5>
                <table className="table table-hover align-middle">
                  <thead className="table-dark">
                    <tr>
                      <th>Fecha</th>
                      <th>Servicio</th>
                      <th>Barbería</th>
                      <th>Estado</th>
                      <th className="text-end">Precio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {store.appointments?.filter(a =>
                      Number(a.user_id) === Number(foundUser.id) &&
                      ["completed", "no_show", "confirmed"].includes(a.status)
                    ).length > 0 ? (
                      store.appointments
                        .filter(a => Number(a.user_id) === Number(foundUser.id))
                        .sort((a, b) => new Date(b.date) - new Date(a.date))
                        .map(h => (
                          <tr key={h.id}>
                            <td>
                              <div className="fw-bold">{new Date(h.date).toLocaleDateString()}</div>
                              <div className="small text-muted">{h.date.split("T")[1].slice(0, 5)}h</div>
                            </td>
                            <td>{h.service_name}</td>
                            <td className="small">{h.barbershop_name}</td>
                            <td>
                              <span className={`badge rounded-pill ${h.status === 'completed' ? 'bg-success' :
                                h.status === 'no_show' ? 'bg-danger' : 'bg-warning text-dark'
                                }`}>
                                {h.status.toUpperCase().replace("_", " ")}
                              </span>
                            </td>
                            <td className="fw-bold text-end">{h.price}€</td>
                          </tr>
                        ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center py-4">Este cliente no tiene citas registradas en el sistema.</td>
                      </tr>
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
};