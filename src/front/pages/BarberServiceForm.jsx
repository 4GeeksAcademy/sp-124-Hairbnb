import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const BarberServiceForm = () => {
  const { store, dispatch } = useGlobalReducer();
  const navigate = useNavigate();

  const barber = store.barberInfo;

  const [selectedServices, setSelectedServices] = useState([]);

  useEffect(() => {
    if (!barber) return;

    // Servicios ya asignados a este barbero
    const assigned = store.barberservice
      .filter(bs => bs.barber_id === barber.id)
      .map(bs => bs.service_id);

    setSelectedServices(assigned);
  }, [barber, store.barberservice]);

  // Filtrar solo los servicios de la barbería del barbero
  const barberShopServices = store.services.filter(
    s => s.barbershop_id === barber?.barbershop_id
  );

  const handleChange = (serviceId) => {
    if (selectedServices.includes(serviceId)) {
      setSelectedServices(selectedServices.filter(id => id !== serviceId));
    } else {
      setSelectedServices([...selectedServices, serviceId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!barber) return;

    const toRemove = store.barberservice
      .filter(barbser => barbser.barber_id === barber.id && !selectedServices.includes(barbser.service_id));

    for (let barbser of toRemove) {
      await fetch(`${import.meta.env.VITE_BACKEND_URL}/barber_services/${barbser.id}`, {
        method: "DELETE",
      });
    }

    const toAdd = selectedServices.filter(
      id => !store.barberservice.some(bs => bs.barber_id === barber.id && bs.service_id === id)
    );

    for (let serviceId of toAdd) {
      await fetch(`${import.meta.env.VITE_BACKEND_URL}/barber_services`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ barber_id: barber.id, service_id: serviceId })
      });
    }

    const resp = await fetch(`${import.meta.env.VITE_BACKEND_URL}/barber_services`);
    const data = await resp.json();
    dispatch({ type: "set-barberservices", payload: data });
    dispatch({ type: "set-message",payload: { ype: "success",msg: "Datos guardados correctamente"}});


    navigate("/barber_services");
  };

  if (!barber) return <p className="text-center mt-4">No hay barbero seleccionado</p>;

  return (
    <form className="mx-auto p-4" onSubmit={handleSubmit}>
      <h3 className="mb-4 text-center">Servicios de {barber.name}</h3>
      <p className="text-center">Barbería: {barber.barbershop_name}</p>

      <div className="row g-3 w-75 mx-auto">
        {barberShopServices.map(service => (
          <div className="col-sm-12 col-md-6 col-lg-4" key={service.id}>
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id={`service-${service.id}`}
                checked={selectedServices.includes(service.id)}
                onChange={() => handleChange(service.id)}
              />
              <label className="form-check-label" htmlFor={`service-${service.id}`}>
                {service.name} • {service.duration} min • {service.price}€
              </label>
            </div>
          </div>
        ))}
        {barberShopServices.length === 0 && (
          <p className="fst-italic mt-3">No hay servicios disponibles en esta barbería.</p>
        )}
      </div>

      <div className="mt-5 d-flex justify-content-around">
        <button type="submit" className="btn btn-outline-secondary w-25">Guardar cambios</button>
        <Link to="/barber_services" className="btn btn-secondary w-25">Volver</Link>
      </div>
    </form>
  );
};
