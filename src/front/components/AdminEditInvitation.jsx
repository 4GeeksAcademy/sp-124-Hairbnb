import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const AdminEditInvitation = () => {
    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();
    
    const [barbers, setBarbers] = useState([]);
    const [shops, setShops] = useState([]);
    
    const [formData, setFormData] = useState({
        barber_id: "",
        barbershop_id: "",
        status: "pending"
    });

    useEffect(() => {
    const loadData = async () => {
        const headers = { "Authorization": `Bearer ${store.token}` };

        try {
            const responseBarbers = await fetch(`${import.meta.env.VITE_BACKEND_URL}/admin/barbers`, { headers });
            if (responseBarbers.ok) {
                const barbersData = await responseBarbers.json();
                setBarbers(barbersData);
            } else {
                console.error("Error al cargar barberos");
            }

            const responseShops = await fetch(`${import.meta.env.VITE_BACKEND_URL}/admin/barbershops`, { headers });
            if (responseShops.ok) {
                const shopsData = await responseShops.json();
                setShops(shopsData);
            } else {
                console.error("Error al cargar barberías");
            }

            if (!responseBarbers.ok || !responseShops.ok) {
                dispatch({ 
                    type: "set-message", 
                    payload: { type: "error", msg: "Hubo un problema cargando los selectores" } 
                });
            }

        } catch (error) {
            console.error("Error de conexión:", error);
            dispatch({ 
                type: "set-message", 
                payload: { type: "error", msg: "Error de conexión con el servidor" } 
            });
        }
    };

    loadData();
}, [store.token, dispatch]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const selectedBarber = barbers.find(b => String(b.id) === String(formData.barber_id));

        const resp = await fetch(`${import.meta.env.VITE_BACKEND_URL}/invitations`, {
            method: "POST",
    
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${store.token}`
            },
            body: JSON.stringify({
                email: selectedBarber?.email,
                barbershop_id: formData.barbershop_id,
                status: formData.status
            })
        });

        const data = await resp.json();

        if (resp.ok) {
            dispatch({ type: "set-message", payload: { type: "success", msg: "Vínculo creado" } });
            navigate("/4dm1n1str4t10n");
        } else {
            dispatch({ type: "set-message", payload: data.message || { type: "error", msg: "Error al crear" } });
        }
    };

    return (
        <div className="container mt-5">
            <h3 className="mb-4">Vincular Barbero a Barbería</h3>
            <form onSubmit={handleSubmit} className="card p-4 shadow-sm border-0">
                <div className="mb-3">
                    <label className="form-label">Seleccionar Barbero</label>
                    <select 
                        className="form-select" 
                        value={formData.barber_id} 
                        onChange={(e) => setFormData({...formData, barber_id: e.target.value})}
                        required
                    >
                        <option value="">-- Elige un barbero --</option>
                        {barbers.map(b => <option key={b.id} value={b.id}>{b.name} ({b.email})</option>)}
                    </select>
                </div>

                <div className="mb-3">
                    <label className="form-label">Seleccionar Barbería</label>
                    <select 
                        className="form-select" 
                        value={formData.barbershop_id} 
                        onChange={(e) => setFormData({...formData, barbershop_id: e.target.value})}
                        required
                    >
                        <option value="">-- Elige la sede --</option>
                        {shops.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>

                <div className="mb-3">
                    <label className="form-label">Estado de la invitación</label>
                    <select 
                        className="form-select" 
                        value={formData.status} 
                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                    >
                        <option value="pending">Pendiente (Requiere que el barbero acepte)</option>
                        <option value="accepted">Aceptada (Vínculo directo)</option>
                    </select>
                </div>

                <div className="mt-4">
                    <button type="submit" className="btn btn-primary">Crear Vínculo</button>
                    <button type="button" className="btn btn-secondary ms-2" onClick={() => navigate(-1)}>Cancelar</button>
                </div>
            </form>
        </div>
    );
};