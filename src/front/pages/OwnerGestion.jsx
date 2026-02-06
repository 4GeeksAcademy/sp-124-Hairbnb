import { useEffect, useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const OwnerGestion = () => {
  const { store, dispatch } = useGlobalReducer();
  const barbershop = store.barbershopInfo;

  const [activeTab, setActiveTab] = useState("barbers");
  const [barbers, setBarbers] = useState([]);
  const [pending, setPending] = useState([]);
  const [services, setServices] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [inviteEmail, setInviteEmail] = useState("");

  useEffect(() => {
    if (!barbershop || !store.token) return;

    const fetchData = async () => {
      try {
        let res, data;

        if (activeTab === "barbers") {
          res = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/barbershops/${barbershop.id}/barbers`,
            { headers: { "Authorization": `Bearer ${store.token}` } }
          );
          if (!res.ok) throw new Error("Error cargando barberos");
          data = await res.json();

          setBarbers(data.filter(b => b.status === "accepted"));
          setPending(data.filter(b => b.status === "pending"));
        } else if (activeTab === "services") {
          res = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/barbershops/${barbershop.id}/services`,
            { headers: { "Authorization": `Bearer ${store.token}` } }
          );
          if (!res.ok) throw new Error("Error cargando servicios");
          data = await res.json();
          setServices(data);
        } else if (activeTab === "appointments") {
          res = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/barbershops/${barbershop.id}/appointments`,
            { headers: { "Authorization": `Bearer ${store.token}` } }
          );
          if (!res.ok) throw new Error("Error cargando citas");
          data = await res.json();
          setAppointments(data);
        }
      } catch (error) {
        console.error(error);
        setBarbers([]);
        setPending([]);
        setServices([]);
        setAppointments([]);
      }
    };

    fetchData();
  }, [activeTab, barbershop, store.token]);

  const handleInvite = async () => {
    if (!inviteEmail) return;

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/barbershops/${barbershop.id}/invite`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${store.token}`
          },
          body: JSON.stringify({ email: inviteEmail })
        }
      );

      const result = await res.json();

      if (!res.ok) throw new Error(result.message?.msg || "Error enviando invitación");

      // Añadimos a la lista de pendientes
      setPending(prev => [...prev, result.data || { email: inviteEmail, status: "pending" }]);
      setInviteEmail("");

      dispatch({
        type: "set-message",
        payload: { type: "success", msg: "Solicitud enviada correctamente" }
      });

    } catch (err) {
      console.error(err);
      dispatch({
        type: "set-message",
        payload: { type: "error", msg: err.message }
      });
    }
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
            className={`nav-link ${activeTab === "services" ? "active" : ""}`}
            onClick={() => setActiveTab("services")}
          >
            Servicios
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

        {activeTab === "services" && (
          <ul className="list-group">
            {services.length === 0 && <li className="list-group-item">No hay servicios</li>}
            {services.map(s => (
              <li key={s.id} className="list-group-item">
                {s.name} - {s.duration} min - ${s.price}
              </li>
            ))}
          </ul>
        )}

        {activeTab === "appointments" && (
          <ul className="list-group">
            {appointments.length === 0 && <li className="list-group-item">No hay citas</li>}
            {appointments.map(a => (
              <li key={a.id} className="list-group-item">
                {a.client_name} {a.service}- {a.date} {a.time}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
