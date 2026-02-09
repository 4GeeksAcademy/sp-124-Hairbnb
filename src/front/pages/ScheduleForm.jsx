import React, { useState, useEffect } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { useNavigate } from "react-router-dom";

export const ScheduleForm = () => {
    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();
    
    const editItem = store.scheduleInfo;

    const [formData, setFormData] = useState({
        invitation_id: editItem?.barber_barbershop_id || "",
        day_of_week: editItem?.day_of_week || "Monday",
        start_time: editItem?.start_time || "09:00",
        end_time: editItem?.end_time || "14:00"
    });

    const days = [
        { val: "Monday", lab: "Lunes" },
        { val: "Tuesday", lab: "Martes" },
        { val: "Wednesday", lab: "Miércoles" },
        { val: "Thursday", lab: "Jueves" },
        { val: "Friday", lab: "Viernes" },
        { val: "Saturday", lab: "Sábado" },
        { val: "Sunday", lab: "Domingo" }
    ];

    const myBarbershops = store.invitations?.filter(inv => inv.status === "accepted") || [];

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.invitation_id || !formData.day_of_week) {
            dispatch({ type: "set-message", payload: { type: "error", msg: "Selecciona barbería y día" } });
            return;
        }

        const method = editItem ? "PUT" : "POST";
        const url = editItem 
            ? `${import.meta.env.VITE_BACKEND_URL}/schedules/${editItem.id}`
            : `${import.meta.env.VITE_BACKEND_URL}/schedules`;

        const resp = await fetch(url, {
            method: method,
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${store.token}`
            },
            body: JSON.stringify(formData)
        });

        const data = await resp.json();

        if (resp.ok) {
            dispatch({ type: "set-message", payload: { type: "success", msg: "Horario guardado correctamente" } });
            navigate("/private/barber");
        } else {
            dispatch({ type: "set-message", payload: data.message });
        }
    };
    
    if (store.role !== "barber") {
    return (
      <div className="container mt-5 text-center">
        <h2>No tienes permisos de barbero</h2>
      </div>
    );
  }

    return (
        <div className="container mt-5">
            <div className="card border border-0">
                <h3 className="mb-4 text-center">
                    {editItem ? "Editar Horario" : "Nuevo Horario"}
                </h3>
                
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Barbería</label>
                        <select 
                            className="form-select" 
                            value={formData.invitation_id}
                            onChange={(e) => setFormData({...formData, invitation_id: e.target.value})}
                            required
                        >
                            <option value="">¿Dónde trabajarás?</option>
                            {myBarbershops.map(inv => (
                                <option key={inv.id} value={inv.id}>{inv.barbershop?.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Día de la semana</label>
                        <select 
                            className="form-select" 
                            value={formData.day_of_week}
                            onChange={(e) => setFormData({...formData, day_of_week: e.target.value})}
                            required
                        >
                            {days.map(d => (
                                <option key={d.val} value={d.val}>{d.lab}</option>
                            ))}
                        </select>
                    </div>

                    <div className="row">
                        <div className="col-6 mb-4">
                            <label className="form-label">Entrada</label>
                            <input 
                                type="time" 
                                className="form-control" 
                                value={formData.start_time}
                                onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                                required
                            />
                        </div>
                        <div className="col-6 mb-4">
                            <label className="form-label">Salida</label>
                            <input 
                                type="time" 
                                className="form-control" 
                                value={formData.end_time}
                                onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                                required
                            />
                        </div>
                    </div>

                    <div className="d-flex justify-content-center gap-3">
                        <button 
                            type="button" 
                            className="btn btn-outline-secondary text-decoration-none" 
                            onClick={() => navigate("/private/barber")}
                        >
                            Cancelar
                        </button>
                        <button type="submit" className="btn btn-primary">
                            {editItem ? "Actualizar Horario" : "Guardar Horario"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};