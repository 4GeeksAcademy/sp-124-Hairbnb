import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const AdminEditSchedule = () => {
    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = !!id;

    const [barbers, setBarbers] = useState([]);
    const [selectedBarber, setSelectedBarber] = useState("");
    const [availableShops, setAvailableShops] = useState([]);

    const [formData, setFormData] = useState({
        invitation_id: "",
        day_of_week: "Monday",
        start_time: "09:00",
        end_time: "14:00"
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

    useEffect(() => {
        const loadInitialData = async () => {
            const token = store.token || localStorage.getItem("token");
            const headers = { "Authorization": `Bearer ${token}` };

            try {
                const responseBarbers = await fetch(`${import.meta.env.VITE_BACKEND_URL}/admin/barbers`, { headers });
                if (responseBarbers.ok) setBarbers(await responseBarbers.json());
            } catch (error) { console.error("Error barberos:", error); }

            try {
                const responseInvitations = await fetch(`${import.meta.env.VITE_BACKEND_URL}/invitations`, { headers });
                if (responseInvitations.ok) {
                    const invData = await responseInvitations.json();
                    const accepted = invData.filter(i => i.status === "accepted");
                    dispatch({ type: "set-invitations", payload: accepted });
                }
            } catch (error) { console.error("Error vinculaciones:", error); }

            if (isEditing) {
                try {
                    const responseSchedule = await fetch(`${import.meta.env.VITE_BACKEND_URL}/schedules/${id}`, { headers });
                    if (responseSchedule.ok) {
                        const sch = await responseSchedule.json();
                        setSelectedBarber(sch.barber_id);
                        setAvailableShops([{
                            id: sch.barber_barbershop_id,
                            barbershop: { name: sch.barbershop_name }
                        }]);
                        setFormData({
                            invitation_id: sch.barber_barbershop_id,
                            day_of_week: sch.day_of_week,
                            start_time: sch.start_time,
                            end_time: sch.end_time
                        });
                    }
                } catch (error) { console.error("Error horario:", error); }
            }
        };
        loadInitialData();
    }, [id, isEditing, store.token, dispatch]);

    useEffect(() => {
        if (!isEditing && selectedBarber && store.invitations?.length > 0) {
            const filtered = store.invitations.filter(inv =>
                String(inv.barber_id) === String(selectedBarber)
            );
            setAvailableShops(filtered);
        }
    }, [selectedBarber, store.invitations, isEditing]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const method = isEditing ? "PUT" : "POST";
        const url = isEditing
            ? `${import.meta.env.VITE_BACKEND_URL}/schedules/${id}`
            : `${import.meta.env.VITE_BACKEND_URL}/schedules`;

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${store.token}`
                },
                body: JSON.stringify({
                    barber_barbershop_id: Number(formData.invitation_id),
                    day_of_week: formData.day_of_week,
                    start_time: formData.start_time,
                    end_time: formData.end_time
                })
            });

            if (response.ok) {
                dispatch({ type: "set-message", payload: { type: "success", msg: "Horario guardado en inglés" } });
                navigate("/4dm1n1str4t10n");
            } else {
                const errorData = await response.json();
                dispatch({ type: "set-message", payload: { type: "error", msg: errorData.msg || "Error al guardar" } });
            }
        } catch (err) {
            dispatch({ type: "set-message", payload: { type: "error", msg: "Error de conexión" } });
        }
    };

    return (
        <div className="container mt-5 pb-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <h3 className="mb-4 text-center fw-bold">{isEditing ? "Editar turno" : "Nuevo turno"}</h3>
                    <form onSubmit={handleSubmit} className="card p-4 shadow-sm">
                        
                        <div className="mb-3">
                            <label className="form-label fw-bold">Barbero</label>
                            <select
                                className="form-select"
                                value={selectedBarber}
                                onChange={(e) => setSelectedBarber(e.target.value)}
                                disabled={isEditing}
                                required
                            >
                                <option value="">Selecciona barbero...</option>
                                {barbers.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </select>
                        </div>

                        <div className="mb-3">
                            <label className="form-label fw-bold">Barbería / Sede</label>
                            <select
                                className="form-select"
                                value={formData.invitation_id}
                                onChange={(e) => setFormData({ ...formData, invitation_id: e.target.value })}
                                disabled={isEditing || availableShops.length === 0}
                                required
                            >
                                <option value="">{availableShops.length > 0 ? "Selecciona la sede..." : "El barbero no tiene sedes aceptadas"}</option>
                                {availableShops.map(shop => (
                                    <option key={shop.id} value={shop.id}>
                                        {shop.barbershop?.name || "Sede cargada"}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <hr className="my-4" />

                        <div className="mb-3">
                            <label className="form-label fw-bold">Día de la semana</label>
                            <select
                                className="form-select border-primary"
                                value={formData.day_of_week}
                                onChange={(e) => setFormData({ ...formData, day_of_week: e.target.value })}
                                required
                            >
                                {days.map(d => (
                                    <option key={d.val} value={d.val}>{d.lab}</option>
                                ))}
                            </select>
                        </div>

                        <div className="row">
                            <div className="col-6 mb-4">
                                <label className="form-label fw-bold">Hora Entrada</label>
                                <input type="time" className="form-control" value={formData.start_time}
                                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })} required />
                            </div>
                            <div className="col-6 mb-4">
                                <label className="form-label fw-bold">Hora Salida</label>
                                <input type="time" className="form-control" value={formData.end_time}
                                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })} required />
                            </div>
                        </div>

                        <div className="d-grid gap-2">
                            <button type="submit" className="btn btn-primary btn-lg">
                                {isEditing ? "Guardar Cambios" : "Crear Horario"}
                            </button>
                            <button type="button" className="btn btn-link text-secondary" onClick={() => navigate("/4dm1n1str4t10n")}>
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};