import React, { useState, useEffect } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { useNavigate } from "react-router-dom";

export const ScheduleForm = () => {
    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();

    const [selectedInvitation, setSelectedInvitation] = useState("");
    const [loading, setLoading] = useState(false);

    const [weeklySchedule, setWeeklySchedule] = useState({
        Monday: { t1_start: "", t1_end: "", t2_start: "", t2_end: "", active: false },
        Tuesday: { t1_start: "", t1_end: "", t2_start: "", t2_end: "", active: false },
        Wednesday: { t1_start: "", t1_end: "", t2_start: "", t2_end: "", active: false },
        Thursday: { t1_start: "", t1_end: "", t2_start: "", t2_end: "", active: false },
        Friday: { t1_start: "", t1_end: "", t2_start: "", t2_end: "", active: false },
        Saturday: { t1_start: "", t1_end: "", t2_start: "", t2_end: "", active: false },
        Sunday: { t1_start: "", t1_end: "", t2_start: "", t2_end: "", active: false },
    });

    const dayLabels = {
        Monday: "Lunes", Tuesday: "Martes", Wednesday: "Miércoles",
        Thursday: "Jueves", Friday: "Viernes", Saturday: "Sábado", Sunday: "Domingo"
    };

    const myBarbershops = store.invitations?.filter(inv => inv.status === "accepted") || [];
    const toN = (t) => t ? parseInt(t.replace(":", ""), 10) : 0;

    useEffect(() => {
        if (!selectedInvitation) {
            resetForm();
            return;
        }
        const loadExistingSchedules = async () => {
            setLoading(true);
            try {
                const url = `${import.meta.env.VITE_BACKEND_URL}/schedules/by_invitation/${selectedInvitation}`;
                const resp = await fetch(url, {
                    headers: { "Authorization": `Bearer ${store.token}` }
                });
                if (resp.ok) {
                    const data = await resp.json();
                    if (data && data.length > 0) mapToState(data);
                    else resetForm();
                }
            } catch (error) {
                console.error("Error cargando:", error);
            } finally {
                setLoading(false);
            }
        };
        loadExistingSchedules();
    }, [selectedInvitation]);

    const resetForm = () => {
        const clean = {};
        Object.keys(weeklySchedule).forEach(day => {
            clean[day] = { t1_start: "", t1_end: "", t2_start: "", t2_end: "", active: false };
        });
        setWeeklySchedule(clean);
    };

    const mapToState = (data) => {
        const newState = {};
        Object.keys(weeklySchedule).forEach(day => {
            newState[day] = { t1_start: "", t1_end: "", t2_start: "", t2_end: "", active: false };
        });
        data.forEach(item => {
            const dayKey = item.day_of_week;
            if (newState[dayKey]) {
                if (!newState[dayKey].active) {
                    newState[dayKey].active = true;
                    newState[dayKey].t1_start = item.start_time.slice(0, 5);
                    newState[dayKey].t1_end = item.end_time.slice(0, 5);
                } else {
                    newState[dayKey].t2_start = item.start_time.slice(0, 5);
                    newState[dayKey].t2_end = item.end_time.slice(0, 5);
                }
            }
        });
        setWeeklySchedule(newState);
    };

    const getShopHours = (dayKey) => {
        const invitation = myBarbershops.find(i => String(i.id) === String(selectedInvitation));
        if (!invitation || !invitation.barbershop?.working_hours) return null;
        return invitation.barbershop.working_hours[dayLabels[dayKey]] || null;
    };

    const handleCheckDay = (day) => {
        setWeeklySchedule(prev => ({
            ...prev,
            [day]: { ...prev[day], active: !prev[day].active, t1_start: !prev[day].active ? "09:00" : "", t1_end: !prev[day].active ? "14:00" : "" }
        }));
    };

    const handleTimeChange = (day, field, value) => {
        setWeeklySchedule(prev => ({ ...prev, [day]: { ...prev[day], [field]: value } }));
    };

    const handleSubmit = async (e) => {
    e.preventDefault();
    const invitation = myBarbershops.find(i => String(i.id) === String(selectedInvitation));
    if (!invitation) return;

    const activeDays = Object.keys(weeklySchedule).filter(d => weeklySchedule[d].active);
    
    for (let day of activeDays) {
        const d = weeklySchedule[day];
        if (d.t2_start && toN(d.t1_end) > toN(d.t2_start)) {
            dispatch({ type: "set-message", payload: { type: "error", msg: `En ${dayLabels[day]}, el Turno 1 no puede solapar al Turno 2.` } });
            return;
        }
        const shop = getShopHours(day);

        if (!shop || (!shop.m_start && !shop.a_start)) {
            dispatch({ type: "set-message", payload: { type: "error", msg: `${dayLabels[day]}: La barbería está cerrada ese día.` } });
            return;
        }

        const slots = [];
        if (shop.m_start && shop.m_end) slots.push({ start: toN(shop.m_start), end: toN(shop.m_end) });
        if (shop.a_start && shop.a_end) slots.push({ start: toN(shop.a_start), end: toN(shop.a_end) });

        const fitsInShop = (start, end) => slots.some(s => s.start <= toN(start) && toN(end) <= s.end);

        if (d.t1_start && d.t1_end && !fitsInShop(d.t1_start, d.t1_end)) {
            const slotsStr = slots.map(s => `${shop.m_start || shop.a_start}-${shop.m_end || shop.a_end}`).join(" / ");
            dispatch({ type: "set-message", payload: { type: "error", msg: `${dayLabels[day]} T1: Tu turno debe estar dentro del horario del local (${slotsStr}).` } });
            return;
        }

        if (d.t2_start && d.t2_end && !fitsInShop(d.t2_start, d.t2_end)) {
            const slotsStr = slots.map(s => `${shop.m_start || shop.a_start}-${shop.m_end || shop.a_end}`).join(" / ");
            dispatch({ type: "set-message", payload: { type: "error", msg: `${dayLabels[day]} T2: Tu turno debe estar dentro del horario del local (${slotsStr}).` } });
            return;
        }
    }

    setLoading(true);
    try {
        const schedulesToSave = [];
        activeDays.forEach(day => {
            const d = weeklySchedule[day];
            if (d.t1_start && d.t1_end) schedulesToSave.push({ day, start: d.t1_start, end: d.t1_end });
            if (d.t2_start && d.t2_end) schedulesToSave.push({ day, start: d.t2_start, end: d.t2_end });
        });

        const delRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/schedules/by_invitation/${selectedInvitation}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${store.token}` }
        });

        if (!delRes.ok) throw new Error("No se pudo limpiar el horario anterior");

        for (const item of schedulesToSave) {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/schedules`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${store.token}` },
                body: JSON.stringify({
                    invitation_id: selectedInvitation,
                    day_of_week: item.day,
                    start_time: item.start,
                    end_time: item.end
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message?.msg || "Error al guardar tramo horario");
            }
        }

        dispatch({ type: "set-message", payload: { type: "success", msg: "Horario guardado correctamente" } });
        navigate(-1);

    } catch (err) {
        dispatch({ type: "set-message", payload: { type: "error", msg: err.message } });
    } finally {
        setLoading(false);
    }
};

    return (
        <div className="container py-5" style={{ maxWidth: '850px' }}>
            <div className="booking-card shadow-sm animate__animated animate__fadeIn">

                <div className="booking-header">
                    <h2 className="Oswald mb-0 text-uppercase fw-bold">Mi horario profesional</h2>
                </div>

                <div className="p-4 p-md-5">
                    <div className="form-group-custom mb-5">
                        <label>Selecciona el local</label>
                        <select
                            className="select-custom"
                            value={selectedInvitation}
                            onChange={(e) => setSelectedInvitation(e.target.value)}
                        >
                            <option value="">Selecciona donde trabajas</option>
                            {myBarbershops.map(inv => (
                                <option key={inv.id} value={inv.id}>{inv.barbershop?.name}</option>
                            ))}
                        </select>
                    </div>

                    {loading ? (
                        <div className="text-center p-5">
                            <div className="spinner-gold mx-auto"></div>
                            <p className="Oswald text-gold mt-3 small">CARGANDO HORARIOS...</p>
                        </div>
                    ) : selectedInvitation && (
                        <form onSubmit={handleSubmit} className="animate__animated animate__fadeIn">
                            <label className="Oswald text-uppercase small fw-bold mb-4 d-block text-gold border-bottom pb-2">
                                Configuración de la jornada
                            </label>

                            {Object.keys(weeklySchedule).map((day) => {
                                const shop = getShopHours(day);
                                const isActive = weeklySchedule[day].active;

                                return (
                                    <div key={day} className={`day-row-premium d-flex flex-column flex-md-row align-items-md-center justify-content-between p-3 mb-2 rounded-2 border ${isActive ? 'bg-white' : 'bg-light opacity-50'}`}
                                        style={{ borderColor: isActive ? '#d19f68' : '#eee' }}>

                                        <div className="d-flex flex-column mb-3 mb-md-0" style={{ minWidth: '160px' }}>
                                            <div className="d-flex align-items-center">
                                                <div className="form-check form-switch me-3">
                                                    <input
                                                        className="form-check-input custom-switch"
                                                        type="checkbox"
                                                        checked={isActive}
                                                        onChange={() => handleCheckDay(day)}
                                                    />
                                                </div>
                                                <span className={`Oswald text-uppercase fw-bold ${isActive ? 'text-dark' : 'text-muted'}`}>
                                                    {dayLabels[day]}
                                                </span>
                                            </div>
                                            {shop ? (
                                                <div className="text-gold mt-1 Oswald" style={{ fontSize: '0.7rem' }}>
                                                    <i className="far fa-clock me-1"></i>
                                                    LOCAL: {shop.m_start?.slice(0, 5)}-{shop.m_end?.slice(0, 5)}
                                                    {shop.a_start && ` / ${shop.a_start.slice(0, 5)}-${shop.a_end.slice(0, 5)}`}
                                                </div>
                                            ) : (
                                                <div className="text-muted mt-1 Oswald" style={{ fontSize: '0.7rem' }}>CERRADO</div>
                                            )}
                                        </div>

                                        <div className="d-flex flex-wrap gap-4 align-items-center">
                                            <div className="d-flex align-items-center gap-2">
                                                <span className="pb-badge-time Oswald" style={{ fontSize: '0.6rem' }}>T1</span>
                                                <input
                                                    type="time"
                                                    className="time-input-minimal"
                                                    style={{ width: '75px' }}
                                                    value={weeklySchedule[day].t1_start}
                                                    disabled={!isActive}
                                                    onChange={(e) => handleTimeChange(day, "t1_start", e.target.value)}
                                                />
                                                <span className="text-muted small">-</span>
                                                <input
                                                    type="time"
                                                    className="time-input-minimal"
                                                    style={{ width: '75px' }}
                                                    value={weeklySchedule[day].t1_end}
                                                    disabled={!isActive}
                                                    onChange={(e) => handleTimeChange(day, "t1_end", e.target.value)}
                                                />
                                            </div>

                                            <div className="d-flex align-items-center gap-2">
                                                <div className="form-check">
                                                    <input
                                                        type="checkbox"
                                                        className="form-check-input custom-switch"
                                                        disabled={!isActive}
                                                        checked={!!weeklySchedule[day].t2_start}
                                                        onChange={(e) => {
                                                            handleTimeChange(day, "t2_start", e.target.checked ? "16:00" : "");
                                                            handleTimeChange(day, "t2_end", e.target.checked ? "20:00" : "");
                                                        }}
                                                    />
                                                </div>
                                                <span className="pb-badge-time Oswald" style={{ fontSize: '0.6rem' }}>T2</span>
                                                <input
                                                    type="time"
                                                    className="time-input-minimal"
                                                    style={{ width: '75px' }}
                                                    value={weeklySchedule[day].t2_start}
                                                    disabled={!isActive || !weeklySchedule[day].t2_start}
                                                    onChange={(e) => handleTimeChange(day, "t2_start", e.target.value)}
                                                />
                                                <span className="text-muted small">-</span>
                                                <input
                                                    type="time"
                                                    className="time-input-minimal"
                                                    style={{ width: '75px' }}
                                                    value={weeklySchedule[day].t2_end}
                                                    disabled={!isActive || !weeklySchedule[day].t2_start}
                                                    onChange={(e) => handleTimeChange(day, "t2_end", e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            <div className="d-flex justify-content-between mt-5 pt-4">
                                <button type="button" className="btn btn-link text-muted text-decoration-none Oswald small fw-bold" onClick={() => navigate(-1)}>
                                    CANCELAR
                                </button>
                                <button type="submit" className="btn-confirm px-5" disabled={loading}>
                                    {loading ? "GUARDANDO..." : "GUARDAR"}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}