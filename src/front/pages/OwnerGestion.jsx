import { useEffect, useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { useNavigate } from "react-router-dom";


  export const OwnerGestion = () => {
  const { store, dispatch } = useGlobalReducer();
  const barbershop = store.barbershopInfo;
  const navigate = useNavigate();

  const appointments = store.appointments;
  const [activeTab, setActiveTab] = useState("barbers");
  const [barbers, setBarbers] = useState([]);
  const [pending, setPending] = useState([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

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

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/invitations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${store.token}`,
        },
        body: JSON.stringify({
          email: inviteEmail,
          barbershop_id: barbershop.id
        }),
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.message?.msg || "Error enviando invitación");

      setPending(prev => [...prev, { email: inviteEmail, status: "pending" }]);
      setInviteEmail("");

      dispatch({
        type: "set-message",
        payload: { type: "success", msg: result.message?.msg || "Solicitud enviada correctamente" }
      });

    } catch (err) {
      console.error(err);
      dispatch({
        type: "set-message",
        payload: { type: "error", msg: err.message }
      });
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
        setAppointments(prev => prev.filter(a => a.id !== id));
        dispatch({ type: "set-message", payload: { type: "success", msg: "Cita eliminada" } });
      }
    } catch (error) {
      console.error("Error al eliminar", error);
    }
  };

  const handleEdit = (appt) => {
    dispatch({ type: "set-appointmentInfo", payload: appt });
    navigate("/appointments_form");
  };


  if (store.role !== "owner") {
    return (
      <div className="container mt-5 text-center">
        <h2>No tienes permisos de dueño</h2>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h1>Gestión de: {barbershop.name}</h1>

      <ul className="nav nav-tabs my-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "barbers" ? "active" : ""}`}
            onClick={() => setActiveTab("barbers")}
          >
            Barberos
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "appointments" ? "active" : ""}`}
            onClick={() => setActiveTab("appointments")}
          >
            Citas
          </button>
        </li>
      </ul>

      <div className="tab-content">
        {activeTab === "barbers" && (
          <>
            <div className="mb-3 d-flex gap-2">
              <input
                type="email"
                placeholder="Email del barbero"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="form-control"
              />
              <button className="btn btn-secondary" onClick={handleInvite}>
                Invitar
              </button>
            </div>

            <h5>Barberos aceptados</h5>
            <ul className="list-group mb-3">
              {barbers.length === 0 && <li className="list-group-item">No hay barberos</li>}
              {barbers.map(b => (
                <li key={b.id} className="list-group-item">{b.barber?.name || b.barber.name}</li>
              ))}
            </ul>

            <h5>Invitaciones pendientes</h5>
            <ul className="list-group">
              {pending.length === 0 && <li className="list-group-item">No hay invitaciones pendientes</li>}
              {pending.map(p => (
                <li key={p.id || p.barber?.id || p.email} className="list-group-item">
                  {p.barber?.name || p.barber?.email || p.email} - {p.status}
                </li>
              ))}
            </ul>
          </>
        )}

        {activeTab === "appointments" && (
          <div className="appointments-wrapper bg-light p-3 rounded shadow-inner">
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
              <div className="d-flex align-items-center gap-2 bg-white p-2 rounded shadow-sm">
                <i className="fas fa-calendar-alt text-primary"></i>
                <input
                  type="date"
                  className="form-control border-0 fw-bold"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
                <button
                  className="btn btn-primary d-flex align-items-center gap-2"
                  onClick={() => {
                    dispatch({ type: "set-appointmentInfo", payload: null });
                    navigate("/appointments_form");
                  }}
                >
                  <i className="fas fa-plus-circle"></i> Nueva Cita
                </button>
              </div>
            </div>

            <div className="d-flex gap-3 overflow-auto pb-4" style={{ minHeight: "600px" }}>
              {barbers.map(b => {
                const dayApps = store.appointments.filter(a => {
                  const aBarberId = String(a.barber_id);
                  const bBarberId = String(b.barber?.id || b.id);

                  const aDate = a.date.split("T")[0];
                  const isSameDate = aDate === selectedDate;

                  return aBarberId === bBarberId && isSameDate;
                }).sort((a, b) => a.date.localeCompare(b.date));
                return (
                  <div key={b.id} className="appointment-column" style={{ minWidth: "280px", flex: "1" }}>
                    <div className="card h-100 border-0 shadow-sm">
                      <div className="card-header bg-white border-bottom-0 pt-3 pb-0 text-center">
                        <h6 className="fw-bold text-uppercase mb-0 text-primary">{b.barber?.name}</h6>
                        <hr className="mb-0 mt-2" />
                      </div>

                      <div className="card-body p-2">
                        {dayApps.length === 0 ? (
                          <div className="text-center py-5">
                            <p className="text-muted small">Sin citas para el dia</p>
                          </div>
                        ) : (
                          dayApps.map(a => (
                            <div key={a.id} className="card mb-2 border-0 shadow-sm bg-white hover-shadow">
                              <div className="card-body p-2">
                                <div className="d-flex justify-content-between align-items-start">
                                  <span className="fw-bold" style={{ fontSize: "0.85rem" }}>
                                    {a.date.split("T")[1].slice(0, 5)}
                                  </span>
                                  <div className="d-flex gap-1">
                                    <button className="btn btn-sm p-0 text-secondary" onClick={() => handleEdit(a)}>
                                      <i className="fas fa-edit" style={{ fontSize: "0.7rem" }}></i>
                                    </button>
                                    <button className="btn btn-sm p-0 text-danger" onClick={() => handleDelete(a.id)}>
                                      <i className="fas fa-trash" style={{ fontSize: "0.7rem" }}></i>
                                    </button>
                                  </div>
                                </div>
                                <div className="small fw-bold mt-1 text-truncate">{a.user_name}</div>
                                <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                                  {a.service_name}
                                </div>
                              </div>
                            </div>
                          ))
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
