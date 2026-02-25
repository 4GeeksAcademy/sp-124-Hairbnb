import React, { useState, useEffect, useRef } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, useMap } from '@vis.gl/react-google-maps';
import { useNavigate } from 'react-router-dom';
import useGlobalReducer from '../hooks/useGlobalReducer';
import noAvailable from '../../../public/DefaultImage.png';
import '../styles/asociates.css'
import logo from "../../../public/Logo.png"

const MapHandler = ({ selectedId, barbershops }) => {
    const map = useMap();

    useEffect(() => {
        if (!map || !selectedId) return;

        const barber = barbershops.find(b => b.id === selectedId);
        if (barber) {
            const newPos = { lat: Number(barber.latitude), lng: Number(barber.longitude) };
            const bounds = map.getBounds();

            if (bounds && !bounds.contains(newPos)) {
                map.panTo(newPos);
            }
        }
    }, [selectedId, map, barbershops]);

    return null;
};

export const Asociates = () => {
    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();
    const [barbershops, setBarbershops] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [viewDetailId, setViewDetailId] = useState(null);
    const listRefs = useRef({});

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

    const renderHorariosAgrupados = (working_hours) => {
        if (!working_hours || typeof working_hours !== 'object') return <p className="small text-muted">No especificado</p>;
        const ordenDias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
        const grupos = [];
        let grupoActual = null;

        ordenDias.forEach(dia => {
            const info = working_hours[dia];
            if (!info) return;
            const m = info.m_start && info.m_end ? `${info.m_start}-${info.m_end}` : "";
            const a = info.a_start && info.a_end ? `${info.a_start}-${info.a_end}` : "";
            const horarioTexto = [m, a].filter(Boolean).join(" / ") || "Cerrado";

            if (grupoActual && grupoActual.horario === horarioTexto) {
                grupoActual.ultimoDia = dia;
            } else {
                grupoActual = { primerDia: dia, ultimoDia: dia, horario: horarioTexto };
                grupos.push(grupoActual);
            }
        });

        return grupos.map((g, idx) => (
            <div key={idx} className="d-flex justify-content-between border-bottom py-1 small">
                <span className="fw-bold">{g.primerDia === g.ultimoDia ? g.primerDia : `${g.primerDia.substring(0, 3)} - ${g.ultimoDia.substring(0, 3)}`}:</span>
                <span className="text-muted">{g.horario}</span>
            </div>
        ));
    };

    const handleSelectBarber = (barber, origin) => {
        setSelectedId(barber.id);

        if (origin === 'marker' && listRefs.current[barber.id]) {
            listRefs.current[barber.id].scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            });
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
                body: JSON.stringify({ barbershop_id: barbershopId })
            });

            const data = await response.json();
            if (response.ok) {
                navigate("/private/client", { state: { activeChatId: data.id } });
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };


    return (
        <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
            <div className="container-fluid p-0 d-flex flex-column flex-lg-row asociates-page-parent">

                <div className="asociates-sidebar bg-white border-end shadow-sm col-12 col-lg-5"
                    style={{ height: '70vh', overflowY: 'auto' }}>

                    <div className="p-4">
                        <span className="text-gold text-uppercase small fw-bold Oswald">RED DE PROFESIONALES</span>
                        <h2 className="h4 fw-bold mb-4 Oswald">BARBERÍAS DE CONFIANZA</h2>

                        {barbershops.length === 0 && (
                            <div className="text-center py-5">
                                <div className="spinner-border text-gold" role="status"></div>
                                <p className="mt-2 text-muted">Buscando locales...</p>
                            </div>
                        )}
                        <div className="barber-list-container">
                            {barbershops.map(barber => (
                                <div
                                    key={barber.id}
                                    ref={el => listRefs.current[barber.id] = el}
                                    className={`barber-card-mini ${selectedId === barber.id ? 'active' : ''}`}
                                    onClick={() => handleSelectBarber(barber, 'list')}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className="barber-img-wrapper">
                                        <img
                                            src={barber.barbershop_image || logo}
                                            alt={barber.name}
                                            className={barber.barbershop_image ? "img-full" : "img-logo-fit"}
                                        />
                                    </div>
                                    <div className="col-8">
                                        <div className="card-body p-3">
                                            <h5 className="card-title h6 mb-1 Oswald fw-bold">{barber.name?.toUpperCase()}</h5>
                                            <p className="mb-2 small text-muted text-truncate">
                                                <i className="fa-solid fa-location-dot text-gold"></i> {barber.address}
                                            </p>
                                            <div className="d-flex justify-content-end">
                                                <button className="btn btn-gold-outline btn-sm px-3 Oswald" onClick={(e) => { e.stopPropagation(); setViewDetailId(barber.id); }}>
                                                    DETALLES
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            ))}
                        </div>
                    </div>
                </div>

                <div className="col-12 col-lg-7" style={{ height: '70vh', minHeight: '400px', padding: 0 }}>
                    <Map
                        style={{ width: '100%', height: '100%' }}
                        defaultCenter={{ lat: 41.503, lng: -5.741 }}
                        defaultZoom={15}
                        mapId="4f33f0e7f6ab915e"
                        gestureHandling={'greedy'}
                        renderingType={'VECTOR'}
                        key={barbershops.length}
                    >
                        <MapHandler selectedId={selectedId} barbershops={barbershops} />
                        {barbershops.map(barber => (
                            <AdvancedMarker
                                key={barber.id}
                                position={{ lat: Number(barber.latitude), lng: Number(barber.longitude) }}
                                onClick={() => handleSelectBarber(barber, 'marker')}
                            >
                                <Pin
                                    background={selectedId === barber.id ? '#d19f68' : '#999999'}
                                    borderColor={selectedId === barber.id ? '#16161a' : '#16161a'}
                                    glyphColor={'#ffffff'}
                                    scale={selectedId === barber.id ? 1.3 : 1}
                                />
                            </AdvancedMarker>
                        ))}
                    </Map>

                    {viewDetailId && (
                        <div className="custom-modal-overlay" onClick={() => setViewDetailId(null)}>
                            <div className="custom-modal-content" onClick={e => e.stopPropagation()}>
                                <button className="btn-close position-absolute top-0 end-0 m-3" onClick={() => setViewDetailId(null)}></button>

                                {(() => {
                                    const b = barbershops.find(x => x.id === viewDetailId);
                                    if (!b) return null;
                                    return (
                                        <>
                                            <div style={{ height: '220px', position: 'relative' }}>
                                                <img src={b.barbershop_image || noAvailable} className="w-100 h-100" style={{ objectFit: 'cover' }} alt={b.name} />
                                                <div className="position-absolute bottom-0 start-0 w-100 p-3" style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.8))' }}>
                                                    <h3 className="h4 Oswald text-white mb-0">{b.name?.toUpperCase()}</h3>
                                                </div>
                                            </div>

                                            <div className="p-4">
                                                <p className="text-muted small mb-4">
                                                    <i className="fa-solid fa-location-dot me-2 text-gold"></i>{b.address}
                                                </p>

                                                <div className="row">
                                                    <div className="col-12 col-md-6 mb-4">
                                                        <h6 className="Oswald fw-bold text-gold border-bottom pb-2 mb-2">HORARIOS</h6>
                                                        {renderHorariosAgrupados(b.working_hours)}
                                                    </div>
                                                    <div className="col-12 col-md-6">
                                                        <h6 className="Oswald fw-bold text-gold border-bottom pb-2 mb-2">CONTACTO</h6>
                                                        <p className="small mb-1"><strong>Tel:</strong> {b.phone}</p>
                                                        <p className="small text-muted mt-2" style={{ fontStyle: 'italic' }}>
                                                            {b.barbershop_description || "Sin descripción disponible."}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="d-grid gap-2 mt-4">
                                                    {store.token && store.role === "client" ? (
                                                        <>
                                                            <button className="btn btn-gold btn-lg Oswald"
                                                                onClick={() => navigate("/client_appointment_form", { state: { selectedBarbershopId: b.id } })}>
                                                                RESERVAR CITA
                                                            </button>
                                                            <button className="btn btn-outline-dark Oswald" onClick={() => handleContact(b.id)}>
                                                                <i className="fa-regular fa-paper-plane me-2"></i>CHATEAR
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <div className="alert alert-light text-center border-dashed">
                                                            <p className="small mb-2">Inicia sesión para reservar</p>
                                                            <button className="btn btn-sm btn-gold-outline Oswald" onClick={() => navigate("/login/client")}>LOGIN</button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </APIProvider >
    );
};