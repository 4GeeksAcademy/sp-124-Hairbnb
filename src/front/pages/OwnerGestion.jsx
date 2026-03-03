import { useEffect, useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { useNavigate } from "react-router-dom";
import { MessagesPage } from "../components/MessagesPage"
import { Link } from "react-router-dom";
import userimg from "../../../public/user-icon.png"
import "../styles/privatezone.css"

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

  const dayTranslations = {
    "Monday": "Lunes",
    "Tuesday": "Martes",
    "Wednesday": "Miércoles",
    "Thursday": "Jueves",
    "Friday": "Viernes",
    "Saturday": "Sábado",
    "Sunday": "Domingo"
  };

  const getDayName = (dateString) => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const [year, month, day] = dateString.split("-").map(Number);
    const d = new Date(year, month - 1, day);
    return days[d.getDay()];
  };

  const loadBarbers = async () => {
    if (!barbershop?.id) return;
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/barbershops/${barbershop.id}/barbers`,
      { headers: { "Authorization": `Bearer ${store.token}` } });

    if (response.ok) {
      const data = await response.json();
      dispatch({ type: "set-barbers", payload: data });
      setBarbers(data.filter(b => b.status === "accepted"));
      setPending(data.filter(b => b.status === "pending"));
    }
  };

  const loadAppointments = async () => {
    if (!barbershop?.id || !store.token) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/appointments`, {
        headers: { "Authorization": `Bearer ${store.token}` }
      });
      if (response.ok) {
        const data = await response.json();
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
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/invitations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${store.token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message?.msg || "Error enviando invitación");

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
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/appointments/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${store.token}` }
      });
      if (response.ok) {
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
            <div className="container py-5 text-center">
                <h2 className="Oswald fw-bold text-dark">ACCESO DENEGADO</h2>
                <p>Inicia sesión como dueño para acceder.</p>
                <button className="btn pb-btn-filled Oswald mt-3" onClick={() => navigate("/login/owner")}>INICIAR SESIÓN</button>
            </div>
        );
    }



  return (
    <div className="container-fluid py-5 px-md-5 bg-white min-vh-100">
      <div className="d-flex justify-content-between align-items-end mb-4 border-bottom pb-3">
        <div>
          <span className="text-gold fw-bold small text-uppercase Oswald d-block">LOCAL ACTUAL</span>
          <h1 className="Oswald text-dark fw-bold mb-0 text-uppercase">
            {barbershop?.name || "SIN BARBERÍA SELECCIONADA"}
          </h1>
        </div>
        <Link to="/private/owner" className="btn btn-outline-dark Oswald fw-bold text-uppercase px-4">
          <i className="fa-solid fa-arrow-left me-2"></i>VOLVER
        </Link>
      </div>

      <ul className="pb-tabs-nav border-0 gap-2 mb-4">
        <li className="pb-tab-btn">
          <button className={`pb-tab-btn Oswald fw-bold ${activeTab === "barbers" ? "active" : ""}`}
            onClick={() => setActiveTab("barbers")}
          >
            Mi equipo
          </button>
        </li>
        <li className="pb-tab-btn">
          <button className={`pb-tab-btn Oswald fw-bold ${activeTab === "appointments" ? "active" : ""}`}
            onClick={() => setActiveTab("appointments")}
          >
            AGENDA
          </button>
        </li>
        <li className="pb-tab-btn">
          <button className={`pb-tab-btn Oswald fw-bold ${activeTab === "messages" ? "active" : ""}`}
            onClick={() => setActiveTab("messages")}
          >
            MENSAJES (GLOBAL)
          </button>
        </li>
      </ul>

      <div className="tab-content animate__animated animate__fadeIn">

        {activeTab === "barbers" && (
          <div className="row g-4">
            <div className="col-lg-4">
              <div className="p-4 border border-dark bg-white shadow-sm">
                <h6 className="Oswald fw-bold mb-3 text-dark text-uppercase border-2 border-gold ps-2">
                  INVITAR PERSONAL
                </h6>
                <div className="input-group mb-3">
                  <input
                    type="text"
                    placeholder="EMAIL O TELÉFONO"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="form-control border-dark Oswald rounded-0"
                  />
                  <button className="btn btn-dark text-gold Oswald fw-bold rounded-0 px-3" onClick={handleInvite}>
                    INVITAR
                  </button>
                </div>

                <h6 className="Oswald fw-bold mt-4 mb-2 small text-muted text-uppercase">INVITACIONES ENVIADAS</h6>
                <div className="list-group list-group-flush border-top border-dark">
                  {pending.length === 0 && <p className="text-muted small Oswald py-3">SIN SOLICITUDES</p>}
                  {pending.map(p => (
                    <div key={p.id} className="list-group-item px-0 py-2 d-flex justify-content-between align-items-center bg-transparent border-bottom">
                      <span className="small text-dark Oswald">{p.barber?.email || p.email}</span>
                      <span className="badge border border-gold text-gold Oswald small" style={{ fontSize: '0.65rem' }}>PENDIENTE</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="col-lg-8">
              <div className="row g-3">
                {barbers.map(b => (
                  <div key={b.id} className="col-md-6">
                    <div className="card border-dark rounded-0 shadow-sm bg-white h-100 position-relative">
                      <div className="position-absolute top-0 end-0 bg-gold" style={{ width: '40px', height: '4px' }}></div>

                      <div className="card-body p-4">
                        <div className="d-flex align-items-center mb-4">
                          <div className="position-relative">
                            <img
                              src={b.barber?.barber_profile_image || userimg}
                              className="border border-dark me-3"
                              style={{ width: "65px", height: "65px", objectFit: "cover" }}
                            />
                            <div className="position-absolute bottom-0 start-0 bg-gold" style={{ width: '15px', height: '15px', border: '2px solid white' }}></div>
                          </div>
                          <div>
                            <h5 className="Oswald fw-bold mb-0 text-dark text-uppercase">{b.barber?.name}</h5>
                            <small className="text-muted Oswald d-block" style={{ letterSpacing: '1px' }}>{b.barber?.email}</small>
                          </div>
                        </div>

                        <div className="availability-zone bg-light p-3 border-start border-2 border-gold">
                          <div className="Oswald fw-bold border-bottom border-dark border-opacity-10 mb-2 pb-1 text-dark text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>
                            <i className="fa-solid fa-calendar-day text-gold me-2"></i>HORARIO SEMANAL
                          </div>
                          {b.schedules?.sort((a, b) => a.id - b.id).map(s => (
                            <div key={s.id} className="d-flex justify-content-between Oswald py-1 border-bottom border-white small">
                              <span className="text-muted text-uppercase" style={{ fontSize: '0.65rem' }}>{dayTranslations[s.day_of_week]}</span>
                              <span className="text-dark fw-bold">
                                {s.start_time.slice(0, 5)} <span className="text-gold mx-1">-</span> {s.end_time.slice(0, 5)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="card-footer bg-white border-0 px-4 pb-3">
                        <button className="btn btn-link text-dark text-decoration-none Oswald fw-bold w-100 py-1 small hover-opacity" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>
                          <i className="fa-solid fa-user-xmark me-2"></i>DESVINCULAR PERSONAL
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

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
                  onClick={() => setAppointmentView(appointmentView === "summary" ? "details" : "summary")}
                >
                  <i className={`fa-solid ${appointmentView === "summary" ? "fa-list-check" : "fa-chart-pie"} me-2`}></i>
                  {appointmentView === "summary" ? "DETALLES" : "RESUMEN"}
                </button>
              </div>
              <button className="hairbnb-btn" onClick={() => navigate("/owner_appointment_form")}>
                <i className="fa-solid fa-plus me-2"></i>NUEVA CITA
              </button>
            </div>

            <div className="d-flex gap-3 overflow-auto pb-4">
              {barbers.map(b => {
                const dayApps = store.appointments.filter(a =>
                  String(a.barber_id) === String(b.barber?.id) &&
                  a.date.split("T")[0] === selectedDate && a.status === "confirmed"
                ).sort((a, b) => a.date.localeCompare(b.date));

                const schedule = b.schedules?.find(s => s.day_of_week.trim() === getDayName(selectedDate));

                return (
                  <div key={b.id} className="flex-shrink-0" style={{ width: "320px" }}>
                    <div className="card border-dark shadow-sm">
                      <div className="card-header bg-dark text-gold text-center py-2">
                        <h6 className="mb-0 Oswald text-uppercase fw-bold">{b.barber?.name}</h6>
                        <div className="small Oswald text-white">{schedule ? `${schedule.start_time.slice(0, 5)} - ${schedule.end_time.slice(0, 5)}` : "NO TRABAJA HOY"}</div>
                      </div>
                      <div className="card-body p-2 bg-light" style={{ minHeight: "400px" }}>
                        {appointmentView === 'summary' ? (
                          <div className="text-center py-5">
                            <div className="h1 Oswald fw-bold text-dark">{dayApps.length}</div>
                            <div className="Oswald text-gold small text-uppercase">CITAS CONFIRMADAS</div>
                          </div>
                        ) : (
                          <div className="d-flex flex-column gap-2">
                            {dayApps.length === 0 && <p className="text-center text-muted Oswald small py-4">SIN CITAS</p>}
                            {dayApps.map(a => (
                              <div key={a.id} className="bg-white p-3 border-start border-3 border-gold shadow-sm">
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                  <span className="pb-badge-time Oswald">{a.date.split("T")[1].slice(0, 5)}</span>
                                  <div className="d-flex gap-2">
                                    <i className="fa-solid fa-pen text-secondary cursor-pointer" onClick={() => handleEdit(a)}></i>
                                    <i className="fa-solid fa-trash text-dark cursor-pointer" onClick={() => handleDelete(a.id)}></i>
                                  </div>
                                </div>
                                <div className="Oswald fw-bold text-dark text-uppercase small">{a.user_name}</div>
                                <div className="Oswald text-muted small">{a.service_name}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "messages" && <div className="pb-card border border-dark p-4 animate__animated animate__fadeIn"><MessagesPage /></div>}
      </div>
    </div>
  );
}