import React, { useState, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { BarbershopDetails } from '../components/BarbershopDetails';
import { useNavigate } from 'react-router-dom'; 
import useGlobalReducer from '../hooks/useGlobalReducer';
import noAvailable from '../../../public/DefaultImage.png'

export const Asociates = () => {
    const { store, dispatch } = useGlobalReducer(); 
    const navigate = useNavigate();
    const [barbershops, setBarbershops] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [viewDetailId, setViewDetailId] = useState(null);
    const [mapCenter, setMapCenter] = useState({ lat: 41.503, lng: -5.741 });

    
    useEffect(() => {
        const loadBarbershops = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/barbershops`);
                if (response.ok) {
                    const data = await response.json();
                    setBarbershops(data);
                }
            } catch (error) {
                console.error("Error cargando barberías:", error);
            }
        };
        loadBarbershops();
    }, []);

    const handleSelectBarber = (barbershops) => {
        const lat = Number(barbershops.latitude);
        const lng = Number(barbershops.longitude);

        if (!isNaN(lat) && !isNaN(lng)) {
            setSelectedId(barbershops.id);
            setMapCenter({ lat, lng });
        }
    };

    const handleContact = async (barbershopId) => { 
        if (!store.token) {
            dispatch({
                type: "set-message",
                payload: { type: "danger", msg: "Debes iniciar sesión para contactar" }
            });
            return navigate("/login/client");
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/conversations`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${store.token}`
                },
                body: JSON.stringify({
                    barbershop_id: barbershopId
                })
            });

            const data = await response.json();
            if (response.ok) {
                navigate("/private/client", { state: { activeChatId: data.id } });
                dispatch({
                    type: "set-message",
                    payload: { type: "success", msg: "Conversación iniciada." }
                });
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };




    return (
        <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
            <div className="container-fluid p-0" style={{ height: 'calc(100vh - 65px)', display: 'flex', overflow: 'hidden' }}>

                <div className="bg-white border-end shadow-sm" style={{ width: '40%', overflowY: 'auto', zIndex: 10 }}>
                    <div className="p-4">
                        <h2 className="h4 fw-bold mb-4">Barberías disponibles</h2>

                        {barbershops.length === 0 && (
                            <div className="text-center py-5">
                                <div className="spinner-border text-primary" role="status"></div>
                                <p className="mt-2 text-muted">Buscando locales...</p>
                            </div>
                        )}

                        {barbershops.map(barber => (
                            <div
                                key={barber.id}
                                className={`card mb-3 border-2 ${selectedId === barber.id ? 'border-dark' : 'border-light'}`}
                                onClick={() => handleSelectBarber(barber)}
                            >
                                <div className="row g-0" style={{ maxHeight: '150px', overflow: 'hidden', objectFit: 'cover' }} >
                                    <div className="col-4">
                                        <img
                                            src={barber.barbershop_image || noAvailable}
                                            className="img-fluid contain"
                                            alt={barber.name}
                                        />
                                    </div>
                                    <div className="col-8">
                                        <div className="card-body p-3">
                                            <h5 className="card-title h6 mb-1">{barber.name}</h5>
                                            <p className="mb-2">
                                                <i className="fa-solid fa-location-dot"></i> {barber.address}
                                            </p>
                                            <div className="d-flex justify-content-between align-items-center mt-3">
                                                <span>
                                                    <i className="fa-solid fa-phone"></i> {barber.phone}
                                                </span>
                                                <button
                                                    className="btn btn-primary btn-sm px-3 shadow-sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setViewDetailId(barber.id);
                                                    }}
                                                >
                                                    Más detalles
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex-grow-1 position-relative">
                    <Map
                        defaultCenter={mapCenter}
                        defaultZoom={15}
                        mapId="4f33f0e7f6ab915e"
                        disableDefaultUI={false}
                        gestureHandling={'greedy'}
                    >
                        {barbershops.map(barber => {
                            const lat = Number(barber.latitude);
                            const lng = Number(barber.longitude);
                            if (isNaN(lat) || isNaN(lng)) return null;

                            return (
                                <AdvancedMarker
                                    key={barber.id}
                                    position={{ lat, lng }}
                                    onClick={() => handleSelectBarber(barber)}
                                >
                                    <Pin
                                        background={selectedId === barber.id ? '#e42828' : '#999999'}
                                        glyphColor={'#fff'}
                                        borderColor={'#000000'}
                                        scale={selectedId === barber.id ? 1.3 : 1}
                                    />
                                </AdvancedMarker>
                            );
                        })}
                    </Map>

                    {viewDetailId && (
                        
                        <div className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
                            style={{ zIndex: 999, backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>

                            <div className="bg-white p-4 position-relative shadow-lg rounded"
                                style={{ width: '90%', maxWidth: '500px', maxHeight: '85vh', overflowY: 'auto' }}>

                                <button className="btn-close position-absolute top-0 end-0 m-3" onClick={() => setViewDetailId(null)}></button>

                                {(() => {
                                    const barber = barbershops.find(b => b.id === viewDetailId);
                                    if (!barber) return null;

                                    return (
                                        <>
                                            <img src={barber.barbershop_image || noAvailable} className="img-fluid rounded mb-3" alt={barber.name} />
                                            <h3 className="h4 fw-bold">{barber.name}</h3>
                                            <p className="text-muted"><i className="fa-solid fa-location-dot me-2"></i>{barber.address}</p>
                                            <hr />
                                            <p><strong>Teléfono:</strong> {barber.phone}</p>
                                            <p><strong>Descripción:</strong> {barber.barbershop_description || "Sin descripción disponible."}</p>

                                            {store.token && store.role === "client" && (
                                                <div className="d-grid gap-2 mt-4">
                                                    <button
                                                        className="btn btn-primary btn-lg"
                                                        onClick={() => handleContact(barber.id)}
                                                    >
                                                        <i className="fa-regular fa-paper-plane me-2"></i>
                                                        Contactar ahora
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    );
                                })()}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </APIProvider>
    );
};