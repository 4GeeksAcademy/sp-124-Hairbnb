import React, { useState, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { BarbershopDetails } from '../components/BarbershopDetails';
import '../styles/map.css'; // Asegúrate de tener tus estilos aquí

export const Asociates = () => {
    const [barbershops, setBarbershops] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [viewDetailId, setViewDetailId] = useState(null);
    const [mapCenter, setMapCenter] = useState({ lat: 41.503, lng: -5.741 });

    useEffect(() => {
        const loadBarbers = async () => {
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
        loadBarbers();
    }, []);

    const handleSelectBarber = (barber) => {
        setSelectedId(barber.id);
        setMapCenter({ lat: barber.latitude, lng: barber.longitude });
    };

    return (
        <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
            <div className="d-flex" style={{ height: '92vh', width: '100%' }}>
                
                <div className="bg-white shadow-sm overflow-auto" style={{ width: '400px', zIndex: 10 }}>
                    <div className="p-3">
                        <h4 className="fw-bold mb-4">Barberías disponibles</h4>
                        
                        {barbershops.length === 0 && <p>Cargando barberías...</p>}

                        {barbershops.map(barber => (
                            <div 
                                key={barber.id}
                                onClick={() => handleSelectBarber(barber)}
                                className={`card mb-3 p-2 shadow-sm border-0 ${selectedId === barber.id ? 'border-start border-primary border-4' : ''}`}
                                style={{ cursor: 'pointer', transition: '0.3s' }}
                            >
                                <div className="row g-0">
                                    <div className="col-4">
                                        <img 
                                            src={barber.barbershop_image || '/DefaultImage.png'} 
                                            className="img-fluid rounded h-100 object-fit-cover" 
                                            alt={barber.name} 
                                        />
                                    </div>
                                    <div className="col-8 ps-2">
                                        <h6 className="fw-bold mb-1">{barber.name}</h6>
                                        <p className="small text-muted mb-1">
                                            <i className="fa-solid fa-location-dot me-1"></i> {barber.address}
                                        </p>
                                        <p className="small mb-2">
                                            <i className="fa-solid fa-phone me-1"></i> {barber.phone}
                                        </p>
                                        <button 
                                            className="btn btn-dark btn-sm w-100"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setViewDetailId(barber.id);
                                            }}
                                        >
                                            Ver más detalles
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex-grow-1 position-relative">
                    <Map
                        defaultZoom={14}
                        center={mapCenter}
                        mapId="4f33f0e7f6ab915e"
                        disableDefaultUI={true}
                    >
                        {barbershops.map(barber => (
                            <AdvancedMarker
                                key={barber.id}
                                position={{ lat: barber.latitude, lng: barber.longitude }}
                                onClick={() => handleSelectBarber(barber)}
                            >
                                <Pin 
                                    background={selectedId === barber.id ? '#0d6efd' : '#f44336'} 
                                    glyphColor={'#fff'} 
                                    borderColor={'#333'} 
                                />
                            </AdvancedMarker>
                        ))}
                    </Map>

                    {viewDetailId && (
                        <div 
                            className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" 
                            style={{ 
                                zIndex: 9999, 
                                backgroundColor: 'rgba(0,0,0,0.6)',
                                backdropFilter: 'blur(4px)' 
                            }}
                        >
                            <div 
                                className="bg-white rounded-4 shadow-lg p-4 position-relative" 
                                style={{ width: '95%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}
                            >
                                <button 
                                    className="btn-close position-absolute top-0 end-0 m-3" 
                                    onClick={() => setViewDetailId(null)}
                                ></button>
                                
                                <BarbershopDetails id={viewDetailId} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </APIProvider>
    );
};