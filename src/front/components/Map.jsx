import React, { useState, useRef } from 'react';
import { APILoader, StoreLocator, PlaceOverview, SplitLayout } from '@googlemaps/extended-component-library/react';
import { BarbershopDetails } from './BarbershopDetails';

export const Map = () => {
    const [selectedId, setSelectedId] = useState(null);
    const locatorRef = useRef(null);

    const LISTINGS = [
        {
            title: 'Barbería de Perico',
            addressLines: ['C. de Fray Toribio de Motolinia, 2-4', 'Zamora'],
            position: { lat: 41.508769, lng: -5.744141 },
            actions: [{ label: 'Ver Detalles', defaultUri: '38' }]
        }
    ];

    const handleActionClick = (e) => {
        e.preventDefault();
        
        const id = e.detail.action.defaultUri;

        setSelectedId(id);
    };

    return (
        <div style={{ height: '100vh', width: '100%' }}>
            <APILoader 
                apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY} 
                language="es"
                region="ES"
            />

            <StoreLocator
                ref={locatorRef}
                listings={LISTINGS}
                mapId="4f33f0e7f6ab915e"
                ononActionClick={handleActionClick} 
                ononPlaceSelect={(e) => {
                   
                    const action = e.detail.selectedPlace.actions[0];
                    if (action) setSelectedId(action.defaultUri);
                }}
            >
                <SplitLayout>
                    <PlaceOverview slot="fixed">
                        {selectedId ? (
                            <div style={{ padding: '15px', height: '100%', overflowY: 'auto' }}>
                                <button 
                                    className="btn btn-sm btn-outline-dark mb-3"
                                    onClick={() => setSelectedId(null)}
                                >
                                    ← Volver al listado
                                </button>
                                <BarbershopDetails id={selectedId} />
                            </div>
                        ) : (
                            <div className="p-5 text-center shadow-sm">
                                <h1 className="display-6">Hairbnb</h1>
                                <p className="text-muted">Explora las mejores barberías de la zona.</p>
                                <div className="alert alert-info small">
                                    Haz clic en una barbería para ver su información y chatear (ChatMessage).
                                </div>
                            </div>
                        )}
                    </PlaceOverview>

                    <div slot="main" style={{ height: '100%' }}>
                    </div>
                </SplitLayout>
            </StoreLocator>
        </div>
    );
}