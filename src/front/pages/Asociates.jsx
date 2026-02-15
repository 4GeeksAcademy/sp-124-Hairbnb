import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { GoogleMap, useJsApiLoader, Autocomplete } from "@react-google-maps/api";
import defaultImage from "../../../public/DefaultImage.png";

const libraries = ["places"];
const center = { lat: 41.5033, lng: -5.7556 };

export const Asociates = () => {
  const [barbershops, setBarbershops] = useState([]);
  const [map, setMap] = useState(null);
  const autocompleteRef = useRef(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries
  });

  useEffect(() => {
    const fetchBarbershops = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/barbershops`);

        if (!response.ok) throw new Error("Error cargando barberías");

        const data = await response.json();
        setBarbershops(data);
      } catch (error) {
        console.error("Error al obtener las sedes:", error);
        setBarbershops([]);
      }
    };
    fetchBarbershops();
  }, []);

  const onLoadAutocomplete = (autocomplete) => {
    autocompleteRef.current = autocomplete;
  };

  const onPlaceChanged = () => {
    if (autocompleteRef.current !== null) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry) {
        map.panTo(place.geometry.location);
        map.setZoom(18);
      }
    }
  };

  return (
    <div
      className="container-fluid px-4"
      style={{
        height: "calc(100vh - 160px)",
        overflow: "hidden"
      }}
    >
      <h1 className="mb-4">Todas las barberías</h1>
      <div className="row h-100">

        <div
          className="col-md-7 h-100 py-4"
          style={{
            overflowY: "auto",
          }}
        >
          <div className="row g-3">
            {barbershops.length === 0 && (
              <p className="text-muted">No hay barberías registradas</p>
            )}

            {barbershops.map((barb) => (
              <div className="col-12 col-lg-6" key={barb.id}>
                <div className="card h-100 shadow-sm">
                  <img
                    src={barb.barbershop_image || defaultImage}
                    className="card-img-top"
                    style={{ height: "150px", objectFit: "cover", width: "100%" }}
                    alt={`Imagen de ${barb.name}`}
                  />
                  <div className="card-body">
                    <h5 className="card-title">{barb.name}</h5>
                    <p className="card-text">
                      <i className="fa-solid fa-phone me-2"></i>{barb.phone}<br />
                      <i className="fa-solid fa-location-dot me-2"></i>{barb.address}
                    </p>
                  </div>
                  <div className="d-flex mb-3 mx-auto gap-2">
                    <Link to={`/barbershop/${barb.id}`}>Ver detalles</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="col-md-5 h-100 py-4 d-flex flex-column">
          {isLoaded ? (
            <>
              <Autocomplete onLoad={onLoadAutocomplete} onPlaceChanged={onPlaceChanged}>
                <input
                  type="text"
                  placeholder="Buscar ubicación..."
                  className="form-control mb-2"
                />
              </Autocomplete>
              <div className="flex-grow-1">
                <GoogleMap
                  mapContainerStyle={{ width: "90%", height: "90%" }}
                  center={center}
                  zoom={14}
                  onLoad={(map) => setMap(map)}
                  options={{ gestureHandling: "greedy" }}
                />
              </div>
            </>
          ) : (
            <p>Cargando mapa...</p>
          )}
        </div>

      </div>
    </div>
  );
};