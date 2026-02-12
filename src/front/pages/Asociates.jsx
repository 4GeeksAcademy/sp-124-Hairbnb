import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import defaultImage from "../../../public/DefaultImage.png"

export const Asociates = () => {
  const [barbershops, setBarbershops] = useState([]);

  useEffect(() => {
    const fetchBarbershops = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/barbershops`);
        if (!res.ok) throw new Error("Error cargando barberías");
        const data = await res.json();
        setBarbershops(data);
      } catch (error) {
        console.error(error);
        setBarbershops([]);
      }
    };

    fetchBarbershops();
  }, []);

  return (
    <div className="container mt-5">
      <h1 className="mb-4">Todas las barberías</h1>

      <div className="row g-3">
        {barbershops.length === 0 && (
          <p className="text-muted">No hay barberías registradas</p>
        )}

        {barbershops.map((barb) => (
          <div className="col-12 col-md-6 col-lg-4" key={barb.id}>
            <div className="card h-100 shadow-sm">
                <img
                src={barb.barbershop_image || defaultImage}
                className="card-img-top"
                style={{
                  height: "150px",
                  objectFit: "cover",
                  width: "100%"
                }}
                alt={`Imagen de ${barb.name}`}
              />
              <div className="card-body">
                <h5 className="card-title">{barb.name}</h5>
                <p className="card-text">
                  <i className="fa-solid fa-phone me-2"></i>
                  {barb.phone}
                  <br />
                  <i className="fa-solid fa-location-dot me-2"></i>
                  {barb.address}

                </p>
              </div>
              <div className="d-flex justify-content-betwee mb-3 mx-auto">
                <Link
                  to={`/barbershops/${barb.id}`}
                  className="btn btn-outline-primary disabled"
                >
                  Ver detalles
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
