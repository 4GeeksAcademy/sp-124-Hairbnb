import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import defaultImage from "../../../public/DefaultImage.png"
import "../styles/privatezone.css"

export const PrivateOwner = () => {
  const { store, dispatch } = useGlobalReducer();
  const [barbershops, setBarbershops] = useState([]);
  const [subscription, setSubscription] = useState([])
  const user = JSON.parse(localStorage.getItem("userInfo") || "{}");

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/verify-subscription`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${store.token}`,
          },
        });

        const data = await response.json();

        setSubscription({
          active: data.active_subscription,
          next_payment: data.next_payment,
          loading: false
        });
      } catch (error) {
        console.error("Error comprobando suscripción:", error);
        setSubscription({ active: false, loading: false });
      }
    };

    if (store.token) {
      checkSubscription();
    }
  }, [store.token]);

  useEffect(() => {
    const fetchBarbershops = async () => {
      if (!store.token) return;

      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/owners/barbershops`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${store.token}`,
            },
          }
        );

        if (!response.ok) throw new Error("No se pudieron cargar tus barberías");

        const data = await response.json();
        setBarbershops(data);
      } catch (error) {
        setBarbershops([]);
      }
    };

    fetchBarbershops();
  }, [store.token]);

  const handleDelete = async (id) => {
    const confirmar = window.confirm("¿Deseas eliminar esta barbería?");
    if (!confirmar) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/barbershops/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${store.token}`,
          },
        }
      );

      const result = await response.json();

      if (result.message) {
        dispatch({
          type: "set-message",
          payload: result.message,
        });
      }

      if (!response.ok) return;

      setBarbershops(barbershops.filter((b) => b.id !== id));
    } catch (error) {
      dispatch({
        type: "set-message",
        payload: { type: "error", msg: "Error de conexión con el servidor" },
      });
    }
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
    <div className="container py-5 bg-white min-vh-100">
      <h1 className="Oswald text-dark fw-bold mb-4 border-bottom pb-3 text-uppercase">
        PANEL DE {user.name || "dueños"}
      </h1>

      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div className="d-flex align-items-center gap-2">
          {!subscription.loading && (
            <div className={`px-3 py-1 border border-dark Oswald fw-bold small ${subscription.active ? 'bg-light text-dark' : 'bg-danger text-white'}`}>
              {subscription.active
                ? `PLAN BUSINESS: ${subscription.next_payment}`
                : "SUSCRIPCIÓN INACTIVA"}
            </div>
          )}
          {!subscription.active && !subscription.loading && (
            <Link to="/subscription" className="btn btn-outline-dark Oswald fw-bold">
              ACTIVAR
            </Link>
          )}
        </div>

        <Link to={subscription.active ? "/barbershops_form" : "/subscription"} className="text-decoration-none">
          <button
            className="hairbnb-btn"
            onClick={() => subscription.active && dispatch({ type: "set-barbershopInfo", payload: null })}
          >
            <i className="fas fa-plus me-2"></i> NUEVA BARBERÍA
          </button>
        </Link>
      </div>

      <div className="tab-content">
        <div className="pb-card animate__animated animate__fadeIn">
          <h4 className="Oswald text-dark fw-bold mb-4 border-bottom pb-2">TUS ESTABLECIMIENTOS</h4>

          {barbershops.length === 0 ? (
            <div className="text-center py-5">
              <i className="fa-solid fa-shop fa-2x text-muted mb-2"></i>
              <p className="text-muted Oswald">NO HAY ESTABLECIMIENTOS REGISTRADOS</p>
            </div>
          ) : (
            barbershops.map((el) => (
              <div key={el.id} className="card mb-3 border-start border-4 border-gold shadow-sm">
                <div className="card-body d-flex justify-content-between align-items-center p-3">
                  <div className="d-flex align-items-center gap-3">
                    <img
                      src={el.barbershop_image || defaultImage}
                      alt={el.name}
                      className="border border-dark d-none d-md-block shadow-sm"
                      style={{ width: "70px", height: "70px", objectFit: "cover" }}
                    />
                    <div>
                      <h5 className="Oswald fw-bold mb-0 text-uppercase">{el.name}</h5>
                      <div className="text-gold fw-bold small text-uppercase Oswald">
                        <i className="fas fa-location-dot me-1"></i> {el.address}
                      </div>
                      <div className="text-muted small Oswald">
                        <i className="fas fa-phone me-1"></i> {el.phone}
                      </div>
                    </div>
                  </div>

                  <div className="d-flex gap-2">
                    <Link
                      to="/private/owner/gestion"
                      className="btn btn-dark text-gold Oswald fw-bold px-4 d-none d-sm-block"
                      onClick={() => {
                        dispatch({ type: "set-barbershopInfo", payload: el });
                        dispatch({ type: "set-barbershops", payload: barbershops });
                      }}
                    >
                      GESTIONAR
                    </Link>
                    <Link
                      to="/barbershops_form"
                      className="btn btn-sm btn-outline-dark border-2 rounded-circle d-flex align-items-center justify-content-center"
                      style={{ width: "32px", height: "32px" }}
                      onClick={() => dispatch({ type: "set-barbershopInfo", payload: el })}
                    >
                      <i className="fas fa-edit"></i>
                    </Link>
                    <button
                      className="btn btn-sm pb-btn-outline-dark border-2 rounded-circle d-flex align-items-center justify-content-center"
                      style={{ width: "32px", height: "32px" }}
                      onClick={() => handleDelete(el.id)}
                    >
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}