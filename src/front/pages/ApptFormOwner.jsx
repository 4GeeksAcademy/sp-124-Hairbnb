import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const OwnerAppointmentForm = () => {
    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        barbershop_id: "",
        barber_id: "",
        user_name: "", // Nombre del cliente (texto manual para el dueño)
        service_name: "",
        date: "",
        time: "",
        status: "confirmed" // El dueño suele crear citas ya confirmadas
    });

    // 1. Filtrar barberos según la barbería seleccionada
    // Esto asume que en store.barbers tienes la lista de barberos con su barbershop_id
    const availableBarbers = store.barbers?.filter(
        b => Number(b.barbershop_id) === Number(formData.barbershop_id)
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const token = store.token || localStorage.getItem("token");
        const fullDateTime = `${formData.date}T${formData.time}:00`;

        const body = {
            barbershop_id: formData.barbershop_id,
            barber_id: formData.barber_id,
            user_name: formData.user_name,
            service_name: formData.service_name,
            date: fullDateTime,
            status: formData.status
        };

        try {
            const resp = await fetch(`${import.meta.env.VITE_BACKEND_URL}/appointments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });

            if (resp.ok) {
                dispatch({ type: "set-message", payload: { type: "success", msg: "Cita creada en tu local" } });
                navigate("/private_owner"); // Tu panel de dueño
            }
        } catch (error) {
            console.error("Error creando cita:", error);
        }
    };

    return (
        <div className="container mt-5">
            <div className="card shadow mx-auto" style={{ maxWidth: "600px" }}>
                <div className="card-header bg-primary text-white">
                    <h4 className="mb-0">Agendar Cita en mi Local</h4>
                </div>
                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        {/* 1. Selección de Barbería */}
                        <div className="mb-3">
                            <label className="form-label fw-bold">Mi Barbería</label>
                            <select 
                                className="form-select"
                                value={formData.barbershop_id}
                                onChange={(e) => setFormData({...formData, barbershop_id: e.target.value, barber_id: ""})}
                                required
                            >
                                <option value="">Selecciona local...</option>
                                {store.barbershops?.map(shop => (
                                    <option key={shop.id} value={shop.id}>{shop.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* 2. Selección de Barbero (dependiente de la barbería) */}
                        <div className="mb-3">
                            <label className="form-label fw-bold">Barbero disponible</label>
                            <select 
                                className="form-select"
                                value={formData.barber_id}
                                onChange={(e) => setFormData({...formData, barber_id: e.target.value})}
                                required
                                disabled={!formData.barbershop_id}
                            >
                                <option value="">{formData.barbershop_id ? "Selecciona barbero..." : "Primero elige barbería"}</option>
                                {availableBarbers?.map(b => (
                                    <option key={b.id} value={b.id}>{b.name || b.user_name}</option>
                                ))}
                            </select>
                        </div>

                        <hr />

                        <div className="mb-3">
                            <label className="form-label fw-bold">Nombre del Cliente</label>
                            <input 
                                type="text" 
                                className="form-control"
                                placeholder="Ej: Juan Pérez"
                                value={formData.user_name}
                                onChange={(e) => setFormData({...formData, user_name: e.target.value})}
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label fw-bold">Servicio</label>
                            <input 
                                type="text" 
                                className="form-control"
                                placeholder="Ej: Corte + Barba"
                                value={formData.service_name}
                                onChange={(e) => setFormData({...formData, service_name: e.target.value})}
                                required
                            />
                        </div>

                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label fw-bold">Fecha</label>
                                <input 
                                    type="date" 
                                    className="form-control"
                                    value={formData.date}
                                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label fw-bold">Hora</label>
                                <input 
                                    type="time" 
                                    className="form-control"
                                    value={formData.time}
                                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary w-100 mt-3">
                            Confirmar Cita
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};